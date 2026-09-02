// fetch-images.js
// Reads plants-data.json, looks up a real, current image for each plant's
// wikiTitle via Wikipedia's public REST API (no key needed), and writes
// plants-with-images.json.

import fs from 'fs';

async function getImage(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ParadiseNurseryApp/1.0 (https://github.com/premkanths/e-plantShopping; contact@nursery.com)'
    }
  });
  if (!res.ok) return null;
  const data = await res.json();
  // prefer the larger "original" image if present, else the thumbnail
  return (data.originalimage && data.originalimage.source) ||
         (data.thumbnail && data.thumbnail.source) ||
         null;
}

async function main() {
  const plants = JSON.parse(fs.readFileSync('plants-data.json', 'utf8'));
  const out = [];

  for (const plant of plants) {
    let image = null;
    try {
      image = await getImage(plant.wikiTitle);
    } catch (e) {
      console.error(`Failed for ${plant.name}:`, e.message);
    }
    if (!image) {
      console.warn(`No image found for "${plant.name}" (${plant.wikiTitle}) — check the title.`);
    }
    out.push({ ...plant, image });
    // small delay to be polite to the API
    await new Promise(r => setTimeout(r, 150));
  }

  fs.writeFileSync('plants-with-images.json', JSON.stringify(out, null, 2));
  console.log(`Done. Wrote ${out.length} plants to plants-with-images.json`);
}

main();
