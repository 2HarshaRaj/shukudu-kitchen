# Changelog

All notable changes to Shukudu Kitchen are recorded here.

The project follows a simple versioning model:

```text
Major.Minor.Patch
```

- Major: major redesign or breaking architecture change
- Minor: new user-facing functionality
- Patch: fixes, styling improvements, and small refinements

## 1.2.0 — 2026-06-15

### Added

- Sticky pill-style section navigation on recipe pages
- Active section tracking while scrolling
- Horizontal pill scrolling on mobile
- Smooth section navigation with sticky-header offset

### Fixed

- Prevented active section from flickering backward between sections on mobile
- Fixed section jumps that scrolled to a section and then returned toward the navigation bar

## 1.1.0 — 2026-06-15

### Added

- Functional ingredient checkboxes
- Per-recipe checklist state using `localStorage`
- `Reset ingredients` action
- Completed ingredient styling with dimming and strikethrough
- Larger mobile-friendly ingredient tap targets

### Fixed

- Removed duplicate decorative and functional checkboxes
- Improved ingredient checklist spacing and layout

## 1.0.0 — 2026-06-14

### Added

- Initial GitHub Pages website
- JSON-driven recipe storage
- Homepage with search and category filtering
- Recipe cards
- Individual recipe pages
- Anytype-inspired recipe layout
- Mobile-responsive styling
- Initial recipes:
  - Tomato Bath
  - Vangi Bath
  - Curd Rice

## Maintenance Rule

Update this file whenever a user-facing feature, bug fix, data-structure change, or significant recipe-content update is published.
