/* ============================================================
   Auto-builds data/gallery.json from the folders in
   assets/images/gallery/ so photos can be added with NO code.

   Folder conventions (either works):
     assets/images/gallery/<Category>/<Album>/photo1.jpg   ← categorised
     assets/images/gallery/<Album>/photo1.jpg              ← no category
   • A file named cover.* becomes the album cover (else the first image).
   • Files are ordered naturally (01, 02, 10…). A leading number in a
     folder name (e.g. "01-The Pheras") controls album order and is stripped
     from the shown title.
   Run automatically by .github/workflows/build-gallery.yml on every push.
   ============================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = "assets/images/gallery";
const IMG = /\.(jpe?g|png|webp|gif|avif)$/i;

const pretty = (n) =>
  n.replace(/\.[^.]+$/, "").replace(/^\d+[\s_-]*/, "").replace(/[\s_-]+/g, " ").trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch (e) { return false; } };
const listImages = (dir) =>
  fs.readdirSync(dir).filter((f) => IMG.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

function albumFrom(dir, urlBase, title, category, categoryLabel) {
  const files = listImages(dir);
  if (!files.length) return null;
  const cover = files.find((f) => /^cover\./i.test(f)) || files[0];
  const ordered = [cover, ...files.filter((f) => f !== cover)];
  return {
    category: category || "",
    categoryLabel: categoryLabel || "",
    title,
    cover: urlBase + "/" + cover,
    photos: ordered.map((f) => urlBase + "/" + f),
  };
}

const albums = [];
if (fs.existsSync(ROOT)) {
  const entries = fs.readdirSync(ROOT).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  for (const entry of entries) {
    const entryPath = path.join(ROOT, entry);
    if (!isDir(entryPath)) continue;

    if (listImages(entryPath).length) {
      // images directly inside -> an album with no category
      const a = albumFrom(entryPath, ROOT + "/" + entry, pretty(entry), "", "");
      if (a) albums.push(a);
      continue;
    }
    // otherwise treat this folder as a CATEGORY and its subfolders as albums
    const subDirs = fs.readdirSync(entryPath)
      .filter((d) => isDir(path.join(entryPath, d)))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const category = slug(entry), categoryLabel = pretty(entry);
    for (const al of subDirs) {
      const a = albumFrom(path.join(entryPath, al), ROOT + "/" + entry + "/" + al, pretty(al), category, categoryLabel);
      if (a) albums.push(a);
    }
  }
}

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/gallery.json", JSON.stringify({ albums }, null, 2) + "\n");
console.log("Wrote data/gallery.json with " + albums.length + " album(s).");
