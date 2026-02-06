# MVP QA Checklist

## Automated
- [ ] `npm test` passes

## Manual Acceptance (PRD)
- [ ] Tap-to-move/tap-to-target feels good on mobile
- [ ] Target ring flash duration reads from YAML
- [ ] Day/Night changes NPC density and sun rules
- [ ] Night police count is x2 via YAML multiplier
- [ ] Panic is strictly local and police responds within bubble
- [ ] Death leads to castle and coffin respawn
- [ ] 2 playable vampires + 4 locked cards
- [ ] Random name + manual input enforce `A-Za-z0-9` rules
- [ ] All tunables adjust via YAML only
- [ ] Every screen uses DS components only

## Navigation Flow
- [ ] S0 -> S1
- [ ] S1 -> S2 -> S3 -> S6
- [ ] S6 <-> S7
- [ ] S6 -> S8
- [ ] S6 -> S9 -> S3
- [ ] S3 -> S4
- [ ] S1 -> S5
- [ ] S1 -> S10
