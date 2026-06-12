# Goal

Make the vaccine, deworm, and food-stock add/edit flows show app-green (`#8ac68a` + white) for saved/selected states.

# Approach

Keep form behavior unchanged. Use the existing global form/button/tag classes so all three forms inherit one consistent app-green treatment. Repair visible WXML mojibake in the three form pages while touching them.

# Tasks

- [x] Make success/safe tags and status accents use app-green with white text where appropriate
- [x] Keep form submit buttons on app-green + white
- [x] Repair vaccine form WXML labels/placeholders/buttons
- [x] Repair deworm form WXML labels/placeholders/buttons
- [x] Repair food-stock form WXML labels/placeholders/buttons
- [x] Run JSON, JS, WXML/WXSS, and reminder regression checks

# Risks

- Native `wx.showToast({ icon: 'success' })` color cannot be styled by WXSS; this pass covers in-page colors after add/edit.
