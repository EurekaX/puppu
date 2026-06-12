# Goal

Regenerate the mini program PNG icon set in a minimal geometric, cute island-life style with soft paper texture and low-saturation colors.

# Approach

Keep all existing filenames under `miniprogram/images/animal-icons` so frontend references remain stable. Generate each icon as a centered raster asset on a removable chroma-key background, remove the background locally, normalize to transparent 256x256 PNG, and validate dimensions/alpha.

# Tasks

- [x] Snapshot the existing icon set and confirm target filenames
- [x] Generate eight replacement icons with a shared style prompt
- [x] Remove chroma-key backgrounds and overwrite the existing PNGs
- [x] Validate PNG dimensions, alpha channel, transparent corners, and frontend asset references
- [x] Commit the regenerated icon set

# Risks

- Built-in image generation may produce small style differences between icons; prompts will repeat the same palette, texture, and composition constraints to reduce drift.
- Chroma-key removal can leave fringes if the generated subject touches the key background; validation will check alpha and corners.
