---
trigger: glob
globs: 'apps/api/**/*.ts'
description: Paginate, project, lean, and filter in Mongo — never unbounded finds
---

# Mongo query safety

- Never `find()` without understanding cardinality. List endpoints need pagination, deterministic sort, and a sensible limit.
- Prefer filtering/sorting in MongoDB, not in JavaScript after fetching thousands of docs.
- Use `.lean()` for read-only JSON. Select only fields the caller needs.
- Avoid uncontrolled `populate()` chains.
- Prefer cursor pagination for large or frequently changing lists when skip/limit becomes costly.
