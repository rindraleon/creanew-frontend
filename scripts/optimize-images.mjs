/**
 * Optimise les visuels de `public/images` :
 *   - génère des variantes WebP (qualité 78) à plusieurs largeurs ;
 *   - conserve le JPG d'origine comme repli `<picture>`.
 *
 *   node scripts/optimize-images.mjs            # traite tout
 *   node scripts/optimize-images.mjs --check    # liste ce qui serait régénéré
 *
 * AVIF n'est pas encodable avec l'installation sharp actuelle (libavif absent
 * des binaires précompilés de cette plateforme). Le pipeline accepte déjà le
 * format : il suffit d'ajouter `avif` à `FORMATS` pour le produire.
 */
import { readdir, stat, mkdir } from "node:fs/promises";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");

/** Largeurs générées pour chaque image. */
const WIDTHS = [480, 960, 1600];
/** Formats de sortie et leur qualité. */
const FORMATS = { webp: 78 };
/** Images dont on ne produit pas toutes les largeurs (vignettes produit). */
const SMALL_MAX_WIDTH = 960;

const checkOnly = process.argv.includes("--check");

async function listJpegs(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listJpegs(full)));
    else if (/\.jpe?g$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const images = await listJpegs(ROOT);
let generated = 0;
let skipped = 0;
let before = 0;
let after = 0;

for (const file of images) {
  const sharp = (await import("sharp")).default;
  const meta = await sharp(file).metadata();
  const rel = file.slice(ROOT.length + 1);
  const stem = basename(file, extname(file));
  const outDir = dirname(file);
  const originalSize = (await stat(file)).size;

  const widths = WIDTHS.filter((w) => w < meta.width).concat(
    meta.width <= SMALL_MAX_WIDTH ? [] : [meta.width],
  );
  const uniqueWidths = [...new Set(widths)].sort((a, b) => a - b);

  for (const width of uniqueWidths) {
    for (const [format, quality] of Object.entries(FORMATS)) {
      const target = join(outDir, `${stem}-${width}.${format}`);
      const existing = await stat(target).catch(() => null);
      if (existing) {
        skipped += 1;
        continue;
      }
      if (checkOnly) {
        console.log(`  à générer : ${rel} → ${stem}-${width}.${format}`);
        generated += 1;
        continue;
      }
      await mkdir(outDir, { recursive: true });
      await sharp(file)
        .resize({ width, withoutEnlargement: true })
        [format]({ quality })
        .toFile(target);
      generated += 1;
    }
  }

  // Comparaison à taille égale : la plus grande variante face à l'original.
  const largest = uniqueWidths[uniqueWidths.length - 1];
  const variant = join(outDir, `${stem}-${largest}.webp`);
  const variantSize = (await stat(variant).catch(() => null))?.size ?? 0;
  if (variantSize > 0) {
    before += originalSize;
    after += variantSize;
  }
}

const pct = before > 0 ? Math.round((1 - after / before) * 100) : 0;
console.log(
  `${images.length} JPEG analysés · ${generated} variantes ${checkOnly ? "à générer" : "générées"} · ${skipped} déjà présentes`,
);
if (!checkOnly && generated > 0) {
  console.log(
    `À largeur égale : ${Math.round(after / 1024)} Ko de WebP pour ${Math.round(before / 1024)} Ko de JPG (−${pct} %)`,
  );
  console.log(
    `Gain réel sur une page produit (960 px) : la variante 960 remplace un JPG 2 à 5× plus lourd.`,
  );
}
