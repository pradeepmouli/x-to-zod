---
layout: home
hero:
  name: x-to-zod
  text: JSON Schema to Zod
  tagline: Enhanced fork of json-schema-to-zod — converts JSON Schema draft-2020-12 into Zod schemas using a fluent builder pattern, with full Zod v3/v4 dual-mode support.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/pradeepmouli/x-to-zod
features:
  - title: Fluent builder architecture
    details: Complete rewrite of internal code generation using fluent builders. Consistent lazy evaluation and smart constraint merging across every schema type.
  - title: Zod v3/v4 dual-mode
    details: Generate schemas compatible with either Zod v3 or v4 via the zodVersion option. v4 mode emits z.strictObject(), z.looseObject(), and .extend().
  - title: Enhanced Zod v4 coverage
    details: Full support for v4 types — void, date, bigint, symbol, nan, set, map, promise, lazy, codec, pipe, json, file, nativeEnum, templateLiteral, xor, keyof, and the full string-format validator matrix.
  - title: Post-processing system
    details: Transform Zod builders after parsing with custom post-processors. Type-based and path-based filtering for organization-wide rules.
  - title: Type-safe builder params
    details: All Zod v4 factory functions accept properly typed params — full IntelliSense for error options, constraints, and every Zod param.
  - title: Modern tooling
    details: Vitest for tests, oxlint for linting, ESM build with moduleResolution "bundler" for compatibility with modern bundlers.
---
