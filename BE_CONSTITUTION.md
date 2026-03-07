# BE Constitution 
 
## Standard 
- Backend standard: Strapi v5 + TypeScript 
- Scope: BE_PMTL 
- This file is the source of truth for backend AI work. 
- If generated code conflicts with this file, this file wins. 
 
## Core Principles 
- Prefer clarity over cleverness. 
- Prefer reuse over duplication. 
- Prefer explicit fields, populate, validation, and response shapes. 
- Keep controllers thin and business logic in services or utils. 
- Public APIs must be stable, predictable, and safe.
 
## Strapi v5 Hard Rules 
1. New backend code must follow Strapi v5 patterns, not v4 habits. 
2. Default data access is strapi.documents(uid). 
3. Do not use strapi.entityService in new code. 
4. Do not use strapi.db.query for normal CRUD if documents can do it. 
5. Use documentId as API-facing identity, not numeric id. 
6. For public reads, explicitly choose published status unless drafts are intentionally needed. 
7. Do not use publicationState; Strapi v5 uses status. 
8. Do not write frontend-facing code that expects attributes; Strapi v5 response shape is flatter. 
9. Use explicit fields and explicit populate; do not use broad wildcard populate by default. 
10. Custom route files must use numeric prefixes like 01-foo.ts so they load before generic routes. 
11. Components and dynamic zones require careful populate and update handling; do not guess. 
12. No secrets hardcoded in source code. 
13. No emojis in code, comments, commits, or docs.
 
## Project Contract 
- content-types: schema and content structure. 
- routes: HTTP contract only. 
- controllers: parse request, validate, call service, shape response. 
- services: domain logic, query logic, orchestration. 
- utils: cross-feature reusable helpers. 
- config: environment-driven framework config. 
 
## Folder Discipline 
- src/api/feature/content-types/feature/schema.json 
- src/api/feature/controllers/feature.ts 
- src/api/feature/routes/01-custom.ts 
- src/api/feature/routes/feature.ts 
- src/api/feature/services/feature.ts 
- src/utils/logger.ts 
- src/utils/strapi-helpers.ts 
 
## Data Rules 
- Public fetch by documentId must explicitly request published status when exposed publicly. 
- Stable list endpoints must explicitly define fields, populate, sort, limit, and pagination. 
- Keep public payloads flat and intentional. 
- Low-level DB access is allowed only for atomic updates, aggregates, or framework-limited cases. 
- If low-level DB access is required, isolate it in a helper and document why.
 
## Controller Rules 
- Validate params, query, and body up front. 
- Fail fast on bad requests. 
- Do not bury heavy query logic in controllers. 
- Return consistent response shapes. 
- Log operational errors with context. 
- Do not leak stack traces, SQL, provider internals, or raw exception objects to clients. 
 
## Service and Route Rules 
- Services own domain logic and reused queries. 
- Services accept narrow inputs, not full ctx. 
- If logic appears twice, extract it. 
- Keep generated default route files. 
- Put custom routes in numbered files. 
- Every custom route declares method, path, handler, auth, policies, and middlewares. 
 
## Config, Validation, Security 
- Sensitive values live in .env only. 
- .env.example must include every required non-secret placeholder. 
- Read env in config, not scattered across feature code. 
- Validate required fields, enums, dates, page, pageSize, slug, and documentId. 
- Clamp pageSize and default page to 1. 
- Public endpoints must be least-privilege. 
- auth false must be intentional. 
- Public write endpoints need abuse protection when relevant: validation, dedup, throttling, captcha, moderation.
 
## Performance and Reuse 
- Every list endpoint constrains limit or pageSize. 
- Avoid broad populate trees and oversized payloads. 
- Revisit archive and statistics endpoints when data size grows. 
- Before writing new code, check src/utils, same feature service, related feature service, config, and scripts. 
 
## Management Combo To Prefer 
1. Keep this BE_CONSTITUTION.md as the rule source. 
2. Generate and maintain OpenAPI spec so AI and humans share the same backend contract. 
3. Enable Strapi TypeScript autogeneration for stronger type guidance. 
4. Use Document Service middlewares for global rules that should not rely on prompt quality. 
5. Use schema validation for custom controllers when built-in validation is not enough. 
6. Add endpoint tests for critical public APIs and custom write flows. 
 
## Recommended Support Tools 
- OpenAPI: recommended. Use it to expose the real API contract and reduce AI guessing. 
- config/typescript.ts with autogenerate: recommended. Keep types aligned with schema changes. 
- Document Service middlewares: recommended for cross-cutting rules like dedup, normalization, audit, or guardrails. 
- zod: recommended for custom controller input validation. 
- @strapi/client: recommended when frontend or scripts call Strapi often and you want less ad hoc request code. 
- Structured logging tooling is optional; add it only if operational complexity justifies it.
 
## AI Guardrails 
- Never guess Strapi v4 syntax in a v5 project. 
- Never assume attributes exists. 
- Never assume numeric id is the public identifier. 
- Never omit status on public document queries unless drafts are intentionally required. 
- Never add a custom route without numeric prefix. 
- Never copy-paste query blocks across multiple files without checking for reuse. 
- Never introduce a new library unless it solves a repeated problem. 
 
## Testing Policy 
- Testing should be included when changing critical custom logic, public endpoints, security-sensitive flows, or write operations. 
- At minimum, test custom controllers, route behavior, validation, and any low-level atomic helper. 
- End-to-end style API tests are recommended for critical public endpoints. 
- On Windows, be careful with SQLite-based test setups; if reliability becomes poor, prefer a dedicated Postgres test path. 
- Do not force heavy test scaffolding for trivial schema-only changes. 
 
## Should AI Add Support Tooling By Default? 
- Add OpenAPI generation if the backend has several custom routes or FE and BE evolve in parallel. 
- Add TypeScript autogeneration if not already configured. 
- Add zod only for custom controllers or complex public input flows. 
- Add endpoint tests only where business risk is real. 
- Do not add every tool blindly; add only tools that reduce recurring mistakes.
 
## Definition of Done 
- Follows Strapi v5 patterns. 
- Uses documentId correctly. 
- Uses explicit fields and populate. 
- Validates input. 
- Keeps controller thin. 
- Logs safely. 
- Reuses existing helpers before duplicating. 
- Updates .env.example if new env keys are introduced. 
- Updates OpenAPI or types if relevant. 
- Another AI can read the code and continue without extra explanation. 
 
## Final Rule 
If speed conflicts with consistency, choose consistency. If cleverness conflicts with clarity, choose clarity. If convenience conflicts with Strapi v5 correctness, choose correctness. 
