# Goal

Change the home quick record notebook so flipping pages changes the active record type instead of showing all record cards on one page.

# Approach

Keep the existing vaccine, deworm, and food stock tap handlers. Replace the horizontal scroll stack with a native Mini Program swiper: one notebook page is visible at a time, swiping flips between vaccine, deworm, and food stock, with page dots and light page-curl visuals.

# Tasks

- [x] Review current home WXML, WXSS, JS, and page registration
- [x] Replace the quick record scroll area with a swiper
- [x] Track current notebook page for indicators
- [x] Restyle quick record pages as single-page notebook sheets
- [x] Validate JSON, JS syntax, and whitespace

# Risks

- WeChat simulator visual verification is still required for exact swipe feel and spacing on the target device size.
