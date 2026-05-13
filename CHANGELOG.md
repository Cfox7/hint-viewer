# Changelog

## v1.2.0

### New
- Ocarina of Time support. Full hint tracking with major item hints, item options, and spoiler log validation.
- GameSwitcher component for selecting between supported games.
- CSS theme system with per-game themes (DK64, OoT).
- Manual hint creation section added to home pages.
- Game caching to prevent flickering on reload.
- Refresh button on the No Spoiler Log screen.

### Changed
- Lambdas updated for game selection.
- LevelNav layout updated.
- All components converted to CSS modules.

### Fixed
- Path reveal and complete icons not displaying correctly.
- CSS cleanup across themes and components.

## v1.1.0

### New
- Manual hint creation via the Create page. Enter and edit hints without a spoiler log.
- Hinted Item tracking. After completing a hint, select the item found at that location. It appears with an alert indicator in the extension viewer.
- Toasts for save and clear confirmation feedback.

### Changed
- DKHome updated with full feature and usage documentation.
- UI cleanup across the broadcaster site and extension.

### Fixed
- HintCarousel rerender issue causing hints to flash or reset unexpectedly.
