# Goal

Replace the current cyan/deep-green accent treatment with animal-island `app-green` (`#8ac68a` with white text) for selected and action states.

# Approach

Keep the native Mini Program UI structure unchanged. Update shared color tokens first so global controls inherit the new app-green accent, then patch explicit one-off colors in `app.json`, settings switches, tabbar active state, and the home dog switch pill. Repair any visible settings-page mojibake encountered while touching that page.

# Tasks

- [x] Update global primary tokens to `#8ac68a` and white foreground for primary filled controls
- [x] Update explicit selected/switch colors to `#8ac68a`
- [x] Make the home `切换` pill use app-green background with white text
- [x] Repair settings page WXML visible Chinese text
- [x] Run syntax/structure checks

# Risks

- The Mini Program `switch` component only accepts a single `color` prop, so its foreground/handle behavior remains platform-controlled.
- Existing generated PNG icon colors are unchanged in this pass.
