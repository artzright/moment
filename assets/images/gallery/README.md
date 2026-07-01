# Drop your gallery photos here — no code needed

Each **album** on the site is just a folder in here. Put photos in a folder and
the website builds that album automatically (a robot regenerates everything on GitHub).

## How to add an album

**Option 1 — with a category (recommended, powers the filter buttons):**
```
assets/images/gallery/
├── Weddings/
│   ├── The Pheras/        ← album folder
│   │   ├── cover.jpg      ← this becomes the album cover
│   │   ├── 01.jpg
│   │   └── 02.jpg
│   └── The Baraat/
│       └── ...
├── Pre-Wedding/
│   └── Sunset Shoot/
│       └── ...
├── Haldi & Mehndi/
├── Sangeet/
└── Portraits/
```
The first-level folder (Weddings, Sangeet…) becomes a **filter button**.
The second-level folder (The Pheras…) becomes an **album card**.

**Option 2 — no category:** just make an album folder directly in here
(`assets/images/gallery/Engagement/…`). It shows under "All".

## Rules (all optional)
- **Cover:** name one photo `cover.jpg` to pick the cover; otherwise the first photo is used.
- **Order photos:** name them `01.jpg`, `02.jpg`, `03.jpg`… they sort in that order.
- **Order albums:** put a number in front of the album folder, e.g. `01-The Pheras`
  (the number is hidden on the site, it just controls order).
- **Titles** come from the folder name, so name folders nicely (`The Pheras`, not `img_final_v2`).

## To add photos (on GitHub, no code)
1. Open this folder on GitHub → **Add file ▸ Upload files**
2. In the filename box, type the path, e.g. `Weddings/The Pheras/01.jpg`, then drop the photo
3. **Commit** → wait ~1–2 min → your site updates itself

Keep each photo a normal web size (≈1600–2000px wide, under ~500 KB).
