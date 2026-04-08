# Component Consumer Map

This map captures concrete downstream consumers for all `#28` component-system tasks (`#33` + `#34`) so page work can proceed without rediscovering ownership.

## Core Restyle Scope (#33)

| Component/Utility       | Primary Consumer(s)                                                                                                                                  | Status      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `Button` + `ButtonLink` | `src/components/HeroSection.astro`, `src/components/ContactCTA.astro`, `src/components/Header.astro`                                                 | Implemented |
| `HeroSection`           | `src/pages/index.astro`, `src/pages/tjenester.astro`, `src/pages/prosjekter/index.astro`, `src/pages/om-kynd.astro`, `src/pages/bli-en-av-oss.astro` | Implemented |
| `ContactCTA`            | `src/pages/index.astro`, `src/pages/prosjekter/index.astro`, `src/pages/tjenester.astro`, `src/pages/bli-en-av-oss.astro`                            | Implemented |
| `FullBleed`             | `src/pages/index.astro`, `src/pages/tjenester.astro`, `src/pages/om-kynd.astro`, `src/pages/bli-en-av-oss.astro`                                     | Implemented |
| `ServiceCard`           | `src/pages/tjenester.astro`                                                                                                                          | Implemented |
| `Header` + `Footer`     | `src/layouts/Base.astro` (shared shell for all primary pages)                                                                                        | Implemented |
| `button.css`            | Global button styling for `Button` and `ButtonLink` variants                                                                                         | Implemented |

## New Components Scope (#34)

| Component/Utility                                          | Primary Consumer(s)                                                                                      | Status      |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------- |
| `NumberedConceptCard`                                      | `src/pages/index.astro` ("Hva Kynd er" cards), `src/pages/om-kynd.astro`                                 | Implemented |
| `Badge`                                                    | `src/components/CategoryFilter.astro`, `src/components/QuoteBlock.astro`, `src/components/JobCard.astro` | Implemented |
| `CategoryFilter`                                           | `src/pages/prosjekter/index.astro`                                                                       | Implemented |
| `QuoteBlock`                                               | `src/pages/om-kynd.astro`                                                                                | Implemented |
| `JobCard`                                                  | `src/pages/bli-en-av-oss.astro`                                                                          | Implemented |
| Decorative pattern utilities (`.pattern-*` + `u-pattern*`) | `src/components/HeroLayout.astro`                                                                        | Implemented |
