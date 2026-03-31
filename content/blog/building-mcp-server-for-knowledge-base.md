---
title: "How We Built an MCP Server So Claude Could Search Our Internal Knowledge Base"
date: "2026-03-10"
excerpt: "Our company wiki had 500+ documents scattered across Confluence, an issue tracker, and Google Docs. We built an MCP server that lets Claude search all of it with one query."
---

## The Problem

Our internal knowledge base was a mess. Architecture decisions lived in Confluence. Project specs were in the issue tracker. Meeting notes floated in Google Docs. Onboarding guides existed as random markdown files.

Over 500 documents, scattered across five data sources, searchable only if you knew which tool to open and what to search for.

Then we built an MCP server, and Claude learned to search all of it at once.

## What Is MCP

**Model Context Protocol** is an open standard that lets AI models call external tools. Instead of pasting context into a prompt manually, you expose tools — like `semantic_search` or `get_document` — and the model calls them when it needs information.

Think of it as an API that AI models know how to use.

## The Architecture

Our system has three layers:

**Layer 1: Django backend** — ingests documents from multiple sources, chunks them, generates embeddings, stores them in Qdrant (a vector database), and exposes a REST API for search.

**Layer 2: MCP server** — a lightweight FastMCP HTTP service that translates MCP tool calls into Django API requests. It handles authentication and formats responses for the model.

**Layer 3: Claude** — connects to the MCP server and calls tools as needed during conversations.

The MCP server itself is tiny — about 100 lines. The real complexity lives in the Django backend.

## The MCP Server

We used **FastMCP** in stateless HTTP mode. The server exposes four tools:

```python
mcp = FastMCP(
    "knowledge-base",
    stateless_http=True,
    host="0.0.0.0",
    port=8032,
)

@mcp.tool(description="Search the knowledge base using semantic similarity")
async def semantic_search(
    ctx: Context,
    query: str,
    top_k: int = 5,
    tags: list[str] | None = None,
    categories: list[str] | None = None,
) -> str:
    token = _extract_token(ctx)
    result = await kb_client.search(token, query=query, top_k=top_k, tags=tags, categories=categories)
    return json.dumps(result, indent=2)
```

Authentication flows through from Claude to the MCP server to the Django backend — all via Bearer tokens. The MCP server never stores credentials; it extracts the token from the request context and passes it through.

The other three tools — `get_document`, `get_document_chunks`, and `list_filters` — follow the same pattern: extract token, proxy to Django, return JSON.

## The Ingestion Pipeline

Documents come in from five sources: Confluence pages, issue tracker articles, Google Sheets, Google Docs, and manual uploads. Each source has its own loader, but they all feed into the same pipeline:

**Fetch** → **Convert to Markdown** → **Chunk** → **Embed** → **Store in Qdrant**

### Chunking Strategy

We use a dual-splitter approach. First, try to split by Markdown headers:

```python
splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[("#", "H1"), ("##", "H2"), ("###", "H3")]
)
```

If the Markdown splitting produces poor results — a single giant chunk, or chunks that exceed double our target size — we fall back to recursive character splitting:

```python
RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100,
    separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
)
```

The Markdown-first approach preserves document structure. A section titled "## Authentication Flow" stays together as one chunk, which means search results return coherent context — not arbitrary 500-character slices.

### Async Embedding via Celery

Embedding is the slowest part of ingestion — each chunk requires an API call to OpenAI's `text-embedding-3-small` model. We handle it asynchronously with Celery tasks triggered by Django signals:

```python
@receiver(post_save, sender=Chunk)
def handle_chunk_status_change(sender, instance, **kwargs):
    if instance.status == Status.APPROVED:
        add_chunk_to_vector_store_task.delay(instance.id)
    elif was_previously_approved(instance):
        delete_embedding_from_qdrant(point_id=instance.id)
```

When a chunk is approved, a Celery task generates its embedding and stores it in Qdrant with metadata (title, source URL, tags, categories, projects). If a chunk is later modified or deleted, the signal removes it from the vector store.

The task includes auto-retry with exponential backoff — OpenAI rate limits are real, and we'd rather retry than drop documents.

## The Search Pipeline

When Claude calls `semantic_search("how does our OAuth2 flow work")`, here's what happens:

**1. Embed the query.** The raw query text gets converted to a 1536-dimensional vector using the same embedding model as the documents.

**2. Search Qdrant.** We run a cosine similarity search with a score threshold of 0.3 and optional metadata filters:

```python
search_result = client.query_points(
    collection_name="documents",
    query=embedding,
    limit=top_k,
    query_filter=build_filter(tags, categories, projects),
    score_threshold=0.3,
)
```

The filter supports OR logic — if you search with `tags=["auth", "security"]`, it matches documents tagged with either.

**3. Load chunk content.** Qdrant stores embeddings and metadata, but we keep the full text in PostgreSQL. We fetch the actual chunk content from Django's database using the point IDs.

**4. Return structured results.** Each result includes the chunk content, document title, source URL, similarity score, and metadata. Claude uses this to answer the user's question with attribution.

## What We Learned

**Chunk size matters more than you'd think.** We started with 1000 characters and got vague results. Dropping to 500 with 100 overlap produced much more focused matches — each chunk maps to roughly one concept or one section.

**Markdown splitting beats naive splitting.** Splitting on headers preserves meaning. A 500-character window that starts mid-sentence and ends mid-paragraph is noise. A Markdown section that happens to be 600 characters is signal.

**The MCP server should be dumb.** Our first design put search logic in the MCP server. Bad idea — it meant deploying two services every time we changed the search algorithm. Moving all intelligence to the Django backend and keeping the MCP server as a thin proxy made everything easier.

**Bearer token passthrough is the simplest auth model.** The MCP server doesn't manage users or sessions. It just forwards the token. Django validates it, checks permissions, and returns results. One authentication system, not two.

## The Second MCP Server

We liked the pattern so much that we built a second MCP server — this time for our issue tracker. Same approach: FastMCP HTTP service, token passthrough, domain-specific tools (search issues, get issue details, manage sprints, track time).

The difference: this one uses **OAuth2 with PKCE** for authentication instead of simple Bearer tokens, because the issue tracker requires it. FastMCP's `OAuthProxy` handles the flow — authorization URL, callback, token exchange, refresh — so the MCP server stays thin.

Between the two servers, Claude can now search our documentation and our project management tool in the same conversation. "What does the architecture doc say about auth?" followed by "Show me the open tickets related to that" — without switching tabs.

## Should You Build One?

If your team has internal documentation that people actually need but can't find — yes. The MCP server is the easy part. The hard part is the ingestion pipeline and chunking strategy. Get those right, and the rest follows.

Start with a single data source, get the search quality right, then add more sources. We started with Confluence, proved it worked, then added the issue tracker, Google Docs, and Sheets over the following weeks.
