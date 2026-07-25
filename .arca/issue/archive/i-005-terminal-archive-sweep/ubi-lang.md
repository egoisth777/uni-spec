# Ubi language

## Terms

| Term | Meaning |
| --- | --- |
| Terminal archive sweep | One relocation pass that moves every eligible terminal record in every collection beneath its owning archive, regardless of which loop created the record. |
| Legacy terminal record | A terminal record created by an earlier completed loop that is still live because the loop-owned relocation scope never selected it. |
| Live collection remainder | What `.arca/issue/`, `.arca/residual/`, and `.arca/ticket/` hold directly after a sweep: nonterminal records and the reserved `archive/` only. |
| Location-independent preservation | A retention check that proves a record is preserved by resolving it at its live or archived location, so archiving never reads as deletion. |
