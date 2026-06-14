# Goal

Make each quick record page color fill the notebook body instead of appearing as a small centered color block.

# Approach

Keep the existing swiper and tap handlers. Move the vaccine, deworm, and food page color classes from the inner button to the swiper page surface, make the page fill the available notebook body, and keep the button as a transparent full-page hit area.

# Tasks

- [x] Review current home WXML, WXSS, JS, and page registration
- [x] Identify color block being applied to the inner button
- [x] Move color page classes to the swiper page surface
- [x] Expand the page surface to fill the notebook body
- [x] Validate JSON, JS syntax, and whitespace

# Risks

- WeChat simulator visual verification is still required for exact swipe feel and spacing on the target device size.
