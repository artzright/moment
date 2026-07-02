# Your gallery sections — just drop in photos (no code)

There are **5 sections**, each is a folder here:

```
gallery/
├── Weddings/
├── Pre-Wedding/
├── Haldi and Mehndi/
├── Sangeet/
└── Portraits/
```

## How to add / change photos
Inside a section folder, use these **exact file names** (all lowercase, `.jpg`):

- `cover.jpg`  → the section's cover (the card image)
- `01.jpg`, `02.jpg`, `03.jpg` … up to `08.jpg`  → the photos shown inside that section

**Replace a cover:** upload your photo named `cover.jpg` into the section folder (it overwrites the placeholder).
**Add photos:** upload `01.jpg`, `02.jpg`, … into the section folder.

Empty slots you haven't filled are hidden automatically — no broken images.

## Rules
- Names must match exactly and be **.jpg** (rename `.jpeg`/`.png` to `.jpg` first).
- Keep photos web-sized (≈1600–2000px wide, under ~500 KB) so the site stays fast.

## Want changes?
Ask your developer (Claude) to:
- add a **new section** (e.g. "Reception", "Baraat"),
- allow **more than 8 photos** in a section,
- or rename a section.
These need a quick one-line change to `data/gallery.json`.
