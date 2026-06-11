# Goal

Rebuild the mini program frontend into a polished Animal Crossing-inspired puppy care interface while keeping existing page flow and data behavior stable.

# Approach

Use the existing native WeChat Mini Program architecture. Do not introduce React or browser-only APIs. Treat `animal-island-ui` as visual reference only because the package is React-based. Repair visible mojibake text first, then apply a shared warm island design system to the main tab pages, records, profile, settings, and shared form controls.

# Tasks

- [x] Keep the baseline project commit and remote configuration intact
- [x] Repair shared Chinese labels in constants, storage summaries, reminders, and page scripts
- [x] Rebuild the home dashboard as a cozy island notice board with stable status cards, quick actions, reminders, and empty state
- [x] Rebuild records and profile pages with rounded cards, soft paper colors, leaf/wood accents, and PNG icons instead of emoji
- [x] Refresh the custom tab bar and settings page to match the same visual language
- [x] Run syntax, JSON, reminder regression, asset reference, and browser API checks
- [ ] Commit the refactor and retry pushing `main` to `EurekaX/puppu.git`

# Risks

- The project is a native WeChat Mini Program, so `animal-island-ui` npm components cannot be mounted directly without migrating to a React/Taro-style stack.
- Some form pages may still have older visual structure after this pass; shared tokens will improve them, but the primary refactor scope is the visible tab experience and settings.
- Remote push may continue to fail if the current network cannot reach GitHub reliably.
