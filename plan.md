# Goal

Refine the home quick record notebook into a cleaner journal-tab layout with better text hierarchy.

# Approach

Keep the existing swiper and record navigation. Add three compact journal tabs above the page content, let tabs and swipes share `quickRecordIndex`, simplify the page body spacing, hide noisy helper text, and reduce decorative elements so the notebook feels more deliberate.

# Tasks

- [x] Review current quick record WXML, WXSS, JS, and page registration
- [x] Add journal tabs for vaccine, deworm, and food pages
- [x] Keep tab taps synchronized with the existing swiper index
- [x] Simplify page body typography, spacing, and decorative density
- [x] Validate JSON, JS syntax, and whitespace

# Risks

- WeChat simulator visual verification is still required for exact swipe feel and spacing on the target device size.
