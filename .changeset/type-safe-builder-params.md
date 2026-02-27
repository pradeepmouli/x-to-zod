---
'x-to-zod': minor
---

feat: type-safe builder params and array nonempty/length methods

All Zod v4 builder factory functions now accept properly typed parameters via `Parameters<typeof z.X>[0]` instead of `unknown`, providing full TypeScript IntelliSense and compile-time safety.

**String format builders** (`hex`, `hostname`, `jwt`, `mac`, `xid`, `ksuid`, `e164`, `base64url`, `httpUrl`), **number format builders** (`int`, `float32`, `float64`, `int32`, `uint32`), **BigInt format builders** (`int64`, `uint64`), and the **`json` builder** all accept their respective Zod param types.

`ArrayBuilder` gains working `nonempty()` and `length()` methods mirroring Zod's API. `nonempty()` delegates to `.min(1)` with the same typed params; `length(n)` sets an exact size that supersedes any `min`/`max` on serialization. `applyExactLength` is now exported from `x-to-zod/builders`.

Added a 90-test symmetry suite (`zod-build-symmetry.test.ts`) covering the full `buildV4` factory.
