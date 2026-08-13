// Fügt alle CS2 Gloves zu skin-image-data.js hinzu.
// Nutzung: node add-all-gloves.js
// Das Script ist absichtlich ohne npm-Abhängigkeiten.

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'skin-image-data.js');
const COINS_PER_EUR = 80;

const GLOVES = {
  'Bloodhound Gloves': [
    ['Charred', 190], ['Snakebite', 120], ['Bronzed', 110], ['Guerrilla', 90]
  ],
  'Sport Gloves': [
    ['Pandora\'s Box', 4200], ['Hedge Maze', 3600], ['Superconductor', 3100], ['Vice', 2900],
    ['Amphibious', 1900], ['Omega', 1400], ['Arid', 1200], ['Bronze Morph', 550],
    ['Slingshot', 1650], ['Nocts', 1300], ['Scarlet Shamagh', 750], ['Big Game', 500]
  ],
  'Driver Gloves': [
    ['King Snake', 1400], ['Imperial Plaid', 850], ['Crimson Weave', 700], ['Snow Leopard', 650],
    ['Black Tie', 550], ['Lunar Weave', 300], ['Diamondback', 220], ['Overtake', 190],
    ['Queen Jaguar', 170], ['Rezan the Red', 150], ['Racing Green', 110], ['Convoy', 90]
  ],
  'Hand Wraps': [
    ['Cobalt Skulls', 1300], ['CAUTION!', 1000], ['Slaughter', 850], ['Overprint', 750],
    ['Desert Shamagh', 260], ['Leather', 230], ['Giraffe', 190], ['Arboreal', 170],
    ['Badlands', 160], ['Constrictor', 140], ['Duct Tape', 110], ['Spruce DDPAT', 90]
  ],
  'Moto Gloves': [
    ['Spearmint', 2300], ['Blood Pressure', 1200], ['POW!', 950], ['Finish Line', 650],
    ['Cool Mint', 600], ['Eclipse', 420], ['Polygon', 360], ['Boom!', 300],
    ['Smoke Out', 250], ['Turtle', 230], ['Transport', 140], ['3rd Commando Company', 100]
  ],
  'Specialist Gloves': [
    ['Crimson Kimono', 5200], ['Emerald Web', 2100], ['Marble Fade', 1700], ['Fade', 1600],
    ['Tiger Strike', 1100], ['Foundation', 900], ['Mogul', 650], ['Lt. Commander', 620],
    ['Field Agent', 430], ['Crimson Web', 350], ['Buckshot', 120], ['Forest DDPAT', 100]
  ],
  'Hydra Gloves': [
    ['Case Hardened', 280], ['Emerald', 170], ['Rattler', 110], ['Mangrove', 90]
  ],
  'Broken Fang Gloves': [
    ['Jade', 260], ['Yellow-banded', 160], ['Needle Point', 120], ['Unhinged', 90]
  ]
};

const COLORS = {
  'Pandora\'s Box': '#7b2cff', 'Hedge Maze': '#36d64f', 'Superconductor': '#4fc3ff', Vice: '#ff4fd8',
  Amphibious: '#358cff', Omega: '#ffb000', Arid: '#d9b16f', 'Bronze Morph': '#b87333',
  Slingshot: '#ff3030', Nocts: '#1c1c1c', 'Scarlet Shamagh': '#b8192b', 'Big Game': '#b86f32',
  'King Snake': '#f4eee0', 'Imperial Plaid': '#6930c3', 'Crimson Weave': '#b00020', 'Snow Leopard': '#eeeeee',
  'Black Tie': '#111111', 'Lunar Weave': '#536878', Diamondback: '#8b5a2b', Overtake: '#f5a623',
  'Queen Jaguar': '#d4a017', 'Rezan the Red': '#c1121f', 'Racing Green': '#0b6e4f', Convoy: '#555555',
  'Cobalt Skulls': '#0047ab', 'CAUTION!': '#ffd400', Slaughter: '#d90429', Overprint: '#ff66cc',
  'Desert Shamagh': '#c2a76d', Leather: '#8b4513', Giraffe: '#d69b3a', Arboreal: '#3a7d44',
  Badlands: '#b5651d', Constrictor: '#8d6e63', 'Duct Tape': '#9e9e9e', 'Spruce DDPAT': '#2f4f4f',
  Spearmint: '#00d1b2', 'Blood Pressure': '#c1121f', 'POW!': '#ff4f00', 'Finish Line': '#ffffff',
  'Cool Mint': '#53d6c4', Eclipse: '#182848', Polygon: '#4682b4', 'Boom!': '#ff8c00',
  'Smoke Out': '#3c3c3c', Turtle: '#2e8b57', Transport: '#a97142', '3rd Commando Company': '#556b2f',
  'Crimson Kimono': '#b00020', 'Emerald Web': '#00a86b', 'Marble Fade': '#ff4fd8', Fade: '#ff7ad9',
  'Tiger Strike': '#ff9f1c', Foundation: '#c25b36', Mogul: '#4d79ff', 'Lt. Commander': '#293b8f',
  'Field Agent': '#6b7a8f', 'Crimson Web': '#8b0000', Buckshot: '#8b6f47', 'Forest DDPAT': '#344e41',
  'Case Hardened': '#2b6cb0', Emerald: '#00a86b', Rattler: '#9c6644', Mangrove: '#4a5d23',
  Jade: '#00a86b', 'Yellow-banded': '#f0c808', 'Needle Point': '#b56576', Unhinged: '#6c757d',
  Charred: '#222222', Snakebite: '#b08968', Bronzed: '#cd7f32', Guerrilla: '#6b705c'
};

function makePlaceholderImage(gloveType, finish) {
  const accent = COLORS[finish] || '#fbd506';
  const safeTitle = `${gloveType.replace(' Gloves', '')}`;
  const safeFinish = finish.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="384" viewBox="0 0 512 384">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}"/><stop offset="1" stop-color="#111"/></linearGradient></defs>
    <rect width="512" height="384" rx="34" fill="#151515"/>
    <path d="M152 247c-24-44-33-99-12-122 18-19 45-9 49 24l10 71 4-112c1-24 38-25 40 0l7 104 8-118c2-27 42-25 42 3l-4 119 16-88c5-27 43-19 38 9l-18 97c-9 50-44 84-91 84-39 0-70-25-89-71z" fill="url(#g)" stroke="#fff" stroke-opacity=".22" stroke-width="8"/>
    <text x="256" y="70" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#fff">${safeTitle}</text>
    <text x="256" y="346" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#fff">${safeFinish}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function readSkinData() {
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  const marker = 'const SKIN_IMAGE_DATA = ';
  const start = content.indexOf(marker);
  if (start === -1) throw new Error('SKIN_IMAGE_DATA nicht gefunden.');
  const jsonStart = start + marker.length;
  const jsonEnd = content.lastIndexOf(';');
  if (jsonEnd === -1 || jsonEnd <= jsonStart) throw new Error('Ende von SKIN_IMAGE_DATA nicht gefunden.');
  return JSON.parse(content.slice(jsonStart, jsonEnd));
}

function writeSkinData(data) {
  const header = '// Aus Skins/data.json erzeugt + Gloves per add-all-gloves.js. Preise: Richtwerte in Coins mit 1 EUR = 80 Coins.\n';
  fs.writeFileSync(DATA_FILE, `${header}const SKIN_IMAGE_DATA = ${JSON.stringify(data)};\n`, 'utf8');
}

function addGloves() {
  const data = readSkinData();
  let added = 0;
  let skipped = 0;

  for (const [gloveType, finishes] of Object.entries(GLOVES)) {
    for (const [finish, eur] of finishes) {
      const name = `${gloveType} ${finish}`;
      const sourceName = `★ ${gloveType} | ${finish}`;
      if (data[name]) {
        skipped++;
        continue;
      }
      data[name] = {
        name,
        sourceName,
        image: makePlaceholderImage(gloveType, finish),
        price: Math.round(eur * COINS_PER_EUR * 100) / 100,
        rarity: 'Extraordinary',
        rarityClass: 'knife',
        color: '#fbd506',
        weapon: gloveType,
        finish
      };
      added++;
    }
  }

  writeSkinData(data);
  console.log(`Fertig: ${added} Gloves hinzugefügt, ${skipped} schon vorhanden.`);
}

addGloves();
