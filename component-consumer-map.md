# Component Consumer Map

This map captures at least one concrete downstream consumer for each new `#34` component so page work can proceed without rediscovering ownership.

- `NumberedConceptCard` -> `src/pages/index.astro` ("Hva Kynd er" cards)
- `Badge` -> `src/components/CategoryFilter.astro`, `src/components/QuoteBlock.astro`, `src/components/JobCard.astro`
- `CategoryFilter` -> `src/pages/prosjekter/index.astro`
- `QuoteBlock` -> `src/pages/om-kynd.astro`
- `JobCard` -> `src/pages/bli-en-av-oss.astro`
- Decorative pattern utilities (`u-pattern*`) -> `src/components/HeroLayout.astro`
