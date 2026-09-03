---
name: create-github-issue
description: "Create a well-structured GitHub issue from investigated code issues, bugs, or feature proposals in chat. Use when transitioning findings into a GitHub issue with the gh CLI, including title validation, markdown drafting, and direct or web-based issue creation."
argument-hint: "Describe the investigated issue, bug, or feature proposal and any relevant findings."
---

# Create GitHub Issue

Turn an investigated code issue, bug, or feature proposal into a GitHub issue using the GitHub CLI (`gh`). Preserve the evidence gathered in chat and keep proposed work concrete enough to implement.

## When to Use

- A code issue or bug has been investigated in chat and is ready to record.
- A feature proposal has enough context to become an actionable issue.
- Findings need to be converted into a reproducible, team-readable GitHub issue.

Do not use this skill to investigate an unclear report from scratch. If essential evidence is missing, ask for it or perform the smallest targeted investigation before drafting the issue.

## Procedure

1. **Collect the issue context.** Identify the problem or proposal, affected behavior, relevant files or modules, reproduction details, observed versus expected behavior, constraints, and any decisions already made in chat. Do not invent facts. Mark unknown details explicitly or ask a focused question.
2. **Choose the issue type.** Select exactly one allowed type based on the primary intent:
  - `bug` for incorrect, broken, or failing behavior
  - `feat` for a new capability or user-facing improvement
  - `refactor` for a behavior-preserving structural change
  - `perf` for a performance or resource-use improvement
  - `docs` for documentation-only work
  - `chore` for maintenance, tooling, or operational work
3. **Choose the scope.** Use the affected directory, subsystem, or module, such as `apps/api`, `apps/web`, `packages/db`, or `worker`. Keep it concise and free of parentheses or line breaks.
4. **Draft and validate the title.** The title must match this exact syntax:
  ```text
  [<type>](<scope>): <summary>
  ```
  The type must be one of `bug`, `feat`, `refactor`, `perf`, `docs`, or `chore`. The scope must identify the affected directory, subsystem, or module. The summary must be concise, imperative or descriptive, non-empty, and must not include issue-number prefixes or trailing filler. Reject and revise any title that does not match:
  ```text
  ^\\[(bug|feat|refactor|perf|docs|chore)\\]\\([^()\\n]+\\): .+$
  ```
5. **Draft the body.** Use free-form Markdown organized into exactly these four top-level sections, in this order:
  ```markdown
  ## Overview

  ## Investigation & Findings

  ## Proposed Tasks

  ## Related Context
  ```
  Include enough detail for someone unfamiliar with the conversation to understand the issue. Use a checklist under `Proposed Tasks` when tasks are actionable. Put links, issue references, pull requests, logs, commands, and other supporting material under `Related Context`. Do not add separate top-level sections.
6. **Review for quality.** Confirm that the body distinguishes observed facts from hypotheses, explains reproduction or acceptance criteria where applicable, avoids duplicate tasks, and contains no secrets or unverifiable claims. For a bug, ensure expected and actual behavior are clear. For a feature, ensure the desired outcome and boundaries are clear.
7. **Present the result.** Output the generated title first, then the complete Markdown body, followed by both commands below. Substitute the generated title and body into the quoted values and preserve shell-safe quoting. Let the user choose whether to create the issue directly or open the pre-filled web form.

## Required Output

Use this shape:

```text
Title:
[type](scope): summary

Body:
## Overview
...

## Investigation & Findings
...

## Proposed Tasks
- [ ] ...

## Related Context
...

Option B (Direct CLI):
gh issue create --title "[type](scope): title" --body "markdown body"

Option C (Web Pre-fill):
gh issue create --web --title "[type](scope): title" --body "markdown body"
```

The command must target the current repository unless the user specifies another repository. Before running either command, ensure `gh` is installed and authenticated; never expose or request authentication tokens in chat.
