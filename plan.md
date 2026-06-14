# Goal

Reduce each quick record page to only icon, title, and plus action.

# Approach

Keep the existing swiper and navigation. Remove the helper copy from the page body, hide the decorative vertical line, and align the icon column with the notebook title edge while keeping the plus action on the right side of the content group.

# Tasks

- [x] Review current quick record WXML, WXSS, JS, and page registration
- [x] Remove hidden kicker and helper description nodes
- [x] Remove the decorative vertical line
- [x] Align the icon with the notebook title and rebalance the three-item layout
- [x] Validate JSON, JS syntax, and whitespace

# Risks

- WeChat simulator visual verification is still required for exact spacing on the target device size.
