---
title: "How I Automated Our Team's Timesheets With Python, Zero Dependencies, and Google Sheets Formulas"
date: "2026-03-31"
excerpt: "Our team spent 8 hours a week filling out timesheets. I wrote a script that reduced that to zero — and the most interesting part was the architecture, not the API calls."
---

## The Problem

Every Tuesday morning, same ritual. Open the issue tracker. Find what you worked on last week. Open the spreadsheet. Find the right row. Type the hours. Repeat for 15–25 tasks.

Eight people on the team. Each spending about an hour. That's **8 hours a week** — a full workday — spent on data entry that a script could handle.

So I wrote that script.

## The Architecture Choice That Changed Everything

The obvious approach would be: fetch hours from the issue tracker, compute totals in Python, write numbers to the spreadsheet. Simple.

But there's a problem. Project managers **live** in that spreadsheet. They add notes, reorder rows, insert custom labels, color-code sections. Any script that overwrites the sheet would destroy their work.

So I made a different choice: **the script writes data, but the spreadsheet computes everything**.

Instead of calculating totals in Python, the script writes **Google Sheets formulas**. Board totals, cumulative sums, spent time aggregations — they're all live formulas that update themselves when cells change. The PM can rearrange rows, add comments, delete old tasks — and the totals still work.

This turned out to be the most important decision in the whole project.

## How It Works

The script runs in two modes:

**Full rewrite** — clears the sheet and rebuilds everything from scratch. Used for initial setup or after major changes.

**Incremental update** — reads the existing sheet structure, finds new tasks and new weeks, updates in place. This is the weekly mode.

The flow:

1. **Fetch work items** from the issue tracker API for the target period
2. **Aggregate** hours by task and week, rolling sub-task hours up to parent tasks
3. **Read** the current spreadsheet to map task IDs to rows and find week columns
4. **Update** existing tasks with fresh hours, status, and estimates
5. **Insert** new tasks into the correct board section
6. **Write** formulas for all summary rows

## The Tricky Parts

### Write Order Matters

This one bit me hard. If you insert new rows before updating existing cells, the row shifts corrupt your references. Cell B15 becomes B16, but your update still targets B15.

The solution: flush **all updates first**, then insert new rows, then write new row data. Three separate API calls, strict order.

### Sub-Task Rollup

Our issue tracker has sub-tasks that log their own hours. But the PM doesn't want to see 15 implementation sub-tasks — they want one row per feature with the total hours.

The script detects parent-child relationships via the API's link data, sums sub-task hours, and writes them on the parent row. Sub-tasks never appear in the sheet.

### Resilient Formulas

A naive total formula like `=SUM(G5:G100)` breaks when the PM deletes a row. Instead, I used:

```
=SUMPRODUCT((B$5:B$5000<>"")*G$5:G$5000)
```

This sums column G only for rows where column B has a task ID. Rows can be inserted, deleted, or reordered — the formula survives.

For cumulative sums (tracking budget burn over time):

```
=IF(G$3<TODAY(), SUM($G$6:G$6), "")
```

This shows cumulative hours only for past weeks. Future columns stay blank, preventing misleading projections.

## What I Didn't Use

No Google client library. The entire Google Sheets integration runs on **raw HTTP requests** via `requests`. OAuth2 is implemented from scratch — a local callback server on port 8032, token caching in a JSON file, automatic refresh.

## The Config

```yaml
projects:
  - project_id: MYPROJECT
    sheet_id: SPREADSHEET_ID_HERE
    from: 2025-09-01
```

One YAML file. Point it at your issue tracker project and a Google Sheet.

## The Numbers

- **Before:** 8 people x 1 hour = 8 hours/week on timesheets
- **After:** 0 hours. Script runs in 30–60 seconds
- **Accuracy:** Zero copy-paste errors. Hours match the issue tracker's time report exactly
- **PM impact:** Reports ready by Tuesday 9 AM instead of Tuesday afternoon

## What I Learned

The interesting part of this project wasn't the API integration — that's just HTTP calls and JSON parsing. The interesting part was the **architecture**: making a script coexist with human-managed data without corruption.

The formula-driven approach meant the spreadsheet became self-maintaining. The strict write ordering meant concurrent human edits didn't cause data loss. The sub-task rollup meant PMs got the abstraction level they actually needed.

Sometimes the best engineering isn't a new feature. It's deleting a manual process that nobody questioned because "that's just how we do it."
