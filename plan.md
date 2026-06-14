# Goal

Remove the nested card look from the home quick record notebook so each swiper page feels like one continuous notebook page.

# Approach

Keep the existing swiper and tap handlers. Move visual weight to the outer notebook and page surface, then make the record button a transparent content layer with no inner border, no independent card shadow, and only lightweight page-curl and tap feedback.

# Tasks

- [x] Review current home WXML, WXSS, JS, and page registration
- [x] Identify nested border/card styling in quick record page
- [x] Remove inner card border, background, and heavy shadow
- [x] Keep one-piece notebook page colors and page-curl detail
- [x] Validate JSON, JS syntax, and whitespace

# Risks

- WeChat simulator visual verification is still required for exact swipe feel and spacing on the target device size.
