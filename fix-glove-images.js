#!/usr/bin/env node
/*
  Fixes glove placeholder images in skin-image-data.js.
  It looks up each glove on the Steam Community Market and replaces
  data:image/svg+xml placeholders with real Steam Economy image URLs.

  Usage:
    node fix-glove-images.js

  Optional:
    node fix-glove-images.js path/to/skin-image-data.js
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetFile = process.argv[2] || path.join(process.cwd(), 'skin-image-data.js');

if (!fs.existsSync(targetFile)) {
  console.error(`File not found: ${targetFile}`);
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadSkinData(file) {
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${code}\n;this.__SKIN_IMAGE_DATA__ = SKIN_IMAGE_DATA;`, sandbox, { timeout: 5000 });
  if (!sandbox.__SKIN_IMAGE_DATA__ || typeof sandbox.__SKIN_IMAGE_DATA__ !== 'object') {
    throw new Error('Could not read SKIN_IMAGE_DATA from file.');
  }
  return sandbox.__SKIN_IMAGE_DATA__;
}

function isGlove(item) {
  const name = `${item.name || ''} ${item.sourceName || ''} ${item.weapon || ''}`;
  return /gloves?/i.test(name);
}

function needsFix(item) {
  return !item.image || item.image.startsWith('data:image/') || !/steamcommunity.*economy\/image/i.test(item.image);
}

function getMarketHashName(item) {
  // Steam listings are usually named exactly like: "★ Sport Gloves | Vice"
  const source = item.sourceName || item.name || '';
  return source.startsWith('★') ? source : `★ ${source}`;
}

async function fetchSteamIconUrl(marketHashName) {
  const url = 'https://steamcommunity.com/market/search/render/'
    + '?query=' + encodeURIComponent(marketHashName)
    + '&start=0&count=10&search_descriptions=0&sort_column=name&sort_dir=asc&appid=730&norender=1';

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 glove-image-fixer',
      'Accept': 'application/json,text/plain,*/*'
    }
  });

  if (!res.ok) throw new Error(`Steam HTTP ${res.status}`);
  const json = await res.json();
  const results = json.results || [];

  const exact = results.find((r) =>
    r.hash_name === marketHashName ||
    r.name === marketHashName ||
    r.asset_description?.market_hash_name === marketHashName
  ) || results.find((r) => /Gloves? \|/i.test(r.hash_name || r.name || ''));

  const icon = exact?.asset_description?.icon_url_large || exact?.asset_description?.icon_url;
  if (!icon) return null;

  return `https://steamcommunity-a.akamaihd.net/economy/image/${icon}/512fx384f`;
}

(async () => {
  const data = loadSkinData(targetFile);
  const gloves = Object.entries(data).filter(([, item]) => isGlove(item));

  console.log(`Found ${gloves.length} gloves.`);

  let fixed = 0;
  let skipped = 0;
  let failed = 0;

  for (const [key, item] of gloves) {
    if (!needsFix(item)) {
      skipped++;
      continue;
    }

    const marketHashName = getMarketHashName(item);

    try {
      const image = await fetchSteamIconUrl(marketHashName);
      if (!image) {
        console.warn(`No Steam image found: ${marketHashName}`);
        failed++;
      } else {
        item.image = image;
        fixed++;
        console.log(`Fixed: ${marketHashName}`);
      }
    } catch (err) {
      console.warn(`Failed: ${marketHashName} (${err.message})`);
      failed++;
    }

    // Be gentle with Steam rate limits.
    await sleep(900);
  }

  const backupFile = targetFile + '.backup-before-glove-image-fix';
  if (!fs.existsSync(backupFile)) {
    fs.copyFileSync(targetFile, backupFile);
    console.log(`Backup created: ${backupFile}`);
  }

  const output = `// Aus Skins/data.json erzeugt + Gloves per add-all-gloves.js. Preise: Richtwerte in Coins mit 1 EUR = 80 Coins.\nconst SKIN_IMAGE_DATA = ${JSON.stringify(data)};\n`;
  fs.writeFileSync(targetFile, output, 'utf8');

  console.log(`Done. Fixed: ${fixed}, skipped: ${skipped}, failed: ${failed}.`);
  console.log('Reload the page with Ctrl+F5 / hard refresh after running this.');
})();
