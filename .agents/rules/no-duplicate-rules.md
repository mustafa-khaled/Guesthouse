---
trigger: always_on
description: Update existing rules instead of duplicating them
alwaysApply: true
---

# No duplicate rules

Canonical rules live in `.agents/rules/*.md`. Cursor `.mdc` files are thin pointers.

If a constraint already exists, edit that file. Do not add a second rule or skill that restates it.
