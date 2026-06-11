# Goal

Soften the animal-island visual pass by replacing the bright cyan accents, reducing heavy 3D shadows, and swapping the icon set for flatter cozy island-style assets.

# Approach

Keep the native Mini Program structure unchanged. Update global color tokens toward sage green, honey, parchment, and warm wood tones from the animal-island-ui palette; reduce hard 3D offset shadows; regenerate the icon PNGs with a flatter sticker-like style and keep existing filenames so WXML references remain stable.

# Tasks

- [x] Replace bright cyan/mint tokens with softer sage/leaf colors
- [x] Reduce hard 3D shadow offsets on cards, buttons, FAB, inputs, picker, and action cards
- [x] Regenerate and crop flatter icon PNGs over existing filenames
- [x] Validate JSON, JS syntax, asset references, alpha channels, and browser API usage

# Risks

- Generated icons may still need final visual review in WeChat DevTools.
- The package remains a native Mini Program adaptation of animal-island-ui, not direct React component usage.
