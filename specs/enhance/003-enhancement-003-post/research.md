# Research

## CLI exposure for post-processors
- Decision: Add a CLI option that accepts a user module exporting postProcessors (e.g., `--postProcessors <path>`), mirroring the programmatic API.
- Rationale: Upholds the CLI-first constitution requirement so users can supply transformations without code changes; loading a module is feasible and avoids serializing functions on the command line.
- Alternatives considered: (1) Programmatic-only support — rejected because it violates the CLI-first principle. (2) Passing inline JS via flag — rejected for safety/usability; external module is clearer and testable.
