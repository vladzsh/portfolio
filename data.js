const DATA = {
  projects: [
    {
      name: "MON USO",
      description: "Large-scale Ukrainian online education ecosystem for public schools, built on Open edX and multiple custom services and supporting multiple environments for the Ministry of Education.",
      url: "https://lms.e-school.net.ua/"
    },
    {
      name: "Starbucks Global Academy",
      description: "Customized Starbucks Global Academy learning platform with regional microsites, advanced branding, mobile apps, gamification/analytics, and bespoke UX.",
      url: "https://learning.getyouredge.org/"
    },
    {
      name: "NAZK (National Agency on Corruption Prevention)",
      description: "Anti-corruption platform for Ukraine's national authority (NAZK) — supporting asset declaration registers, whistleblower portals, political finance oversight, and public databases of anti-corruption compliance across government institutions.",
      url: "https://nazk.gov.ua/"
    },
    {
      name: "Copernicus College",
      description: "Poland's first free online education platform, built in collaboration between the Copernicus Center Foundation and Jagiellonian University. Delivers university-level courses, interactive resources, and lectures from top Polish and international scholars across diverse academic disciplines.",
      url: "https://www.copernicuscollege.pl/"
    },
    {
      name: "BTZ",
      description: "Module of the national testing platform that manages the lifecycle of exam questions — from creation and expert review to standardized storage in a centralized question bank for the Ministry of Education of Ukraine.",
      url: ""
    },
    {
      name: "Ukrainian Military",
      description: "A non-profit education platform for the Ukrainian military. I can't share further details — but this is the project I'm most proud of.",
      url: ""
    },
    {
      name: "AILab",
      description: "Internal R&D initiative focused on AI-powered tooling and integrations — Claude Code workflows, MCP servers, automation with Google Sheets API, YouTrack, GitLab, and Atlassian. Customizing Open edX with AI capabilities including content generation and AI-assisted learning experiences. Building internal products with a path toward future commercial use.",
      url: ""
    },
    {
      name: "Other Projects",
      description: "Beyond the major projects listed above, I've worked extensively with Open edX across a wide range of international engagements — delivering education platforms for clients in Canada, the USA, Saudi Arabia, Poland, and France. Each project came with its own regional requirements, integrations, and scale challenges, giving me a broad perspective on adapting the platform to diverse educational contexts worldwide.",
      url: ""
    }
  ],
  experience: [
    {
      date: "2022 — Present",
      role: "Full-Stack Developer",
      company: "Raccoon Gang Company",
      description: "A software development company specializing in custom solutions for clients in the education and e-commerce sectors, where I work on a variety of projects — from large-scale LMS platforms to internal tools and client-facing websites. <b>My responsibilities include full-stack development, project architecture, and client communication.</b>"
    },
    {
      date: "2019 — 2021",
      role: "HVAC Automation & Electrical Engineer",
      company: "Golden & Ko",
      description: "A construction company specializing in heating and air conditioning, where I designed automation schematics, assembled control panels, and commissioned controllers with sensor integration. This hands-on hardware automation experience became <b>my gateway into software engineering</b>, teaching me to think from the lowest level of abstraction up."
    },
    {
      date: "2018 — 2019",
      role: "Electrical Design Intern",
      company: "Southern Railway Authority",
      description: "Inter at a municipal utility company as part of my university studies, where <b>I learned to design</b> and draft electrical circuit schematics."
    },
  ],
  blog: [
    {
      slug: "notebooklm-knowledge-base",
      title: "How I Used NotebookLM to Build a Personal Knowledge Base on Presale & Discovery",
      date: "March 24, 2026",
      excerpt: "I turned workshop materials into a structured, reusable knowledge base using Google's NotebookLM — and the results surprised me.",
      body: "<p>I recently ran my first internal workshop on Technical Excellence in Sales — covering the presale and discovery process from a solution architect's perspective. The workshop went well (and that's a story for another post), but it left me wanting to go deeper.</p><p>So I turned to Google's NotebookLM to keep learning — and the results surprised me.</p><h2>The Flow</h2><p><strong>1. Feed the context.</strong> I uploaded everything I had into NotebookLM — lecture transcripts, PDF presentations, internal materials from the workshop.</p><p><strong>2. Learn through Mind Maps.</strong> NotebookLM helped me map out the entire domain visually — from NFRs and the C4 Model to risk frameworks and proposal artifacts. Instead of re-reading slides, I was navigating a connected knowledge graph.</p><img src='img/notebooklm-graph.png' alt='NotebookLM knowledge graph showing connected concepts from the workshop' style='border-radius:8px;margin:1.5em 0;width:100%'><img src='img/notebooklm-mindmap.png' alt='Structured mind map of the Discovery Workshop topics' style='border-radius:8px;margin:1.5em 0;width:100%'><p><strong>3. Create structured notes.</strong> With the full picture in front of me, I started distilling notes by topic — turning scattered materials into organized, retrievable knowledge.</p><h2>The Result</h2><p>Two things came out of this that I didn't expect:</p><p><strong>Systematic knowledge.</strong> Not just \"I read about this\" — but a bird's-eye view of every topic in the domain and how they connect. You stop learning in fragments and start seeing the whole map.</p><p><strong>A reusable knowledge base.</strong> An artifact I can return to anytime — or feed into Claude or another AI tool when I need to work with this context again. The learning compounds instead of fading.</p><h2>Why This Matters</h2><p>Most of us consume tons of professional content — talks, courses, PDFs, internal docs. But without structure, it evaporates. NotebookLM turned a pile of materials into something I can actually think with.</p><p>If you're deep in a domain and want to move from \"I've seen this\" to \"I understand this\" — try feeding your materials into NotebookLM. The mind map alone is worth it.</p>"
    },
    {
      slug: "obsidian-second-brain-ai",
      title: "Obsidian.md As Second Brain and My AI Agent's Context Window",
      date: "March 17, 2026",
      excerpt: "A folder of Markdown files turns out to be the most interoperable knowledge base you can have — for you and for AI.",
      body: "<p>In the 1950s, a German sociologist named Niklas Luhmann started writing ideas on index cards. One idea per card. Each one numbered, tagged, cross-referenced. Over four decades he pumped out 50+ books and 550 articles from this system. He called it a Zettelkasten — literally a slip-box. The man didn't just store information. He built something that thought alongside him.</p><p>I had no idea about Luhmann when I started using Obsidian. I just needed somewhere to dump things — meeting notes, project specs, random technical rabbit holes, daily journals. But after a while it hit me: the way Obsidian works — plain Markdown, linked together, sitting on your filesystem — is basically a digital Zettelkasten. And that turns out to have a very unexpected superpower in 2026.</p><p>AI agents can read it too.</p><h2>The Second Brain That Actually Works</h2><p>Most \"second brain\" setups die because they're too much work. You spend more time filing and tagging than actually thinking. Obsidian hits a sweet spot:</p><ul><li><strong>One note, one idea.</strong> A presale process. A workshop outline. A debugging trick. Each gets its own .md file.</li><li><strong>Links over folders.</strong> Forget rigid hierarchies. You connect notes with [[wikilinks]]. A web of knowledge grows on its own.</li><li><strong>Local, plain-text.</strong> No vendor lock-in. No proprietary nonsense. Your knowledge is just files on disk.</li></ul><p>I throw everything in there — daily journals, finances, project docs, technical research. It's messy and imperfect and that's fine. The point is: everything goes in, and the links make it findable later.</p><h2>Obvious, But Almost Nobody Does It</h2><p>Here's what bugs me. The exact properties that make Obsidian good for humans — Markdown, local filesystem, structured folders — make it a perfect knowledge base for AI agents.</p><p>When I work with Claude Code, it reads my Obsidian vault directly. No export step. No copy-paste marathon. No API integration to build. The agent just... reads the files. Because they're files.</p><p>I know almost no one who actually does this. Everyone's talking about AI-assisted workflows, but most developers still re-explain their entire context from scratch every single conversation. Meanwhile:</p><ul><li><strong>Point the agent at a folder.</strong> Your presale notes, workshop materials, technical specs — they're already there, structured and linked.</li><li><strong>Build on past thinking.</strong> Instead of giving the agent a wall of context every time, it reads what you already wrote. Your notes become its context window.</li><li><strong>Human stays in the loop.</strong> You write notes for yourself. The AI benefits as a side effect. You never twist your notes to please the machine — the format just happens to work for both.</li></ul><h2>Why Markdown Is the Universal Interface</h2><p>The tech industry keeps building elaborate knowledge platforms with databases, custom APIs, proprietary formats. Meanwhile, a folder of .md files turns out to be the most interoperable format you can get:</p><ul><li>Obsidian reads it.</li><li>AI agents read it.</li><li>Git versions it.</li><li>grep searches it.</li><li>Any text editor opens it.</li></ul><p>Luhmann figured out that the connections between notes matter more than the notes themselves. Markdown with wikilinks keeps exactly that — in a format both humans and machines handle without friction.</p><h2>So What</h2><p>You don't need a fancy tool. You need a habit: write things down, link them, store them in a format that'll outlast whatever app is trendy this year.</p><p>If you already use Obsidian or any Markdown-based system, you have something most people don't: a knowledge base that works for you <em>and</em> for AI agents at the same time. In a world where AI is becoming a real collaborator and not just a chatbot — that's not a nice-to-have. It compounds.</p>"
    },
    {
      slug: "hello-world",
      title: "Hello World",
      date: "February 16, 2026",
      excerpt: "Here I'll share thoughts on web development & engineering and everything in between.",
      body: "<p>Welcome to my blog! I've been meaning to start writing for a while (two years I suppose lol) now, and here we are.</p><p>I plan to write about topics I'm passionate about — Development, LLMs, AI Agents, Philosophy, Self-Education, and the occasional deep dive into web development patterns.</p><p>More posts coming soon.</p>"
    }
  ]
};
