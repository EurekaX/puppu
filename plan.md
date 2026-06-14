# Goal

Replace the home quick record area with a compact pet record notebook that supports horizontal page-like browsing.

# Approach

Keep the existing vaccine, deworm, and food stock tap handlers. Replace only the current quick action markup and styles with a native Mini Program notebook component: paper container, binding rings, three overlapping note pages, page-curl details, light scroll/tap motion, and warm animal-island-ui colors.

# Tasks

- [x] Review current home WXML, WXSS, JS, and page registration
- [x] Replace the quick record WXML block
- [x] Restyle the component as a compact notebook with binding rings
- [x] Add lightweight horizontal scroll and page-flip visual states
- [x] Validate JSON, JS syntax, and whitespace

# Risks

- WeChat simulator visual verification is still required for exact spacing on the target device size.
