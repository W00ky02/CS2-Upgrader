const chance = document.getElementById("chance");
const outerProgress = document.getElementById("outerProgress");
const percentText = document.getElementById("percentText");
const chanceText = document.getElementById("chanceText");
const rotator = document.getElementById("rotator");
const spinButton = document.getElementById("spinButton");
const secretSegmentButton = document.getElementById("secretSegmentButton");
const message = document.getElementById("message");
const center = document.getElementById("center");
const balanceAmount = document.getElementById("balanceAmount");
const topUpButton = document.getElementById("topUpButton");
const inventoryGrid = document.getElementById("inventoryGrid");
const moneyModal = document.getElementById("moneyModal");
const moneyInput = document.getElementById("moneyInput");
const saveMoneyButton = document.getElementById("saveMoneyButton");
const closeMoneyButton = document.getElementById("closeMoneyButton");
const fastModeButton = document.getElementById("fastModeButton");
const quickButtons = document.getElementById("quickButtons");
const balanceStakeValue = document.getElementById("balanceStakeValue");
const balanceStakeMax = document.getElementById("balanceStakeMax");
const balanceStakeSlider = document.getElementById("balanceStakeSlider");
const upgradeSettingsButton = document.getElementById("upgradeSettingsButton");
const upgradeSettingsModal = document.getElementById("upgradeSettingsModal");
const multiplierSettingsInput = document.getElementById("multiplierSettingsInput");
const percentSettingsInput = document.getElementById("percentSettingsInput");
const saveUpgradeSettingsButton = document.getElementById("saveUpgradeSettingsButton");
const resetUpgradeSettingsButton = document.getElementById("resetUpgradeSettingsButton");
const closeUpgradeSettingsButton = document.getElementById("closeUpgradeSettingsButton");
const topSettingsButton = document.getElementById("topSettingsButton");
const soundToggleButton = document.getElementById("soundToggleButton");
const notificationsButton = document.getElementById("notificationsButton");
const notificationsPanel = document.getElementById("notificationsPanel");
const notificationsList = document.getElementById("notificationsList");
const currencyButton = document.getElementById("currencyButton");
const currencyDropdown = document.getElementById("currencyDropdown");
const promoInput = document.getElementById("promoInput");
const applyPromoButton = document.getElementById("applyPromoButton");
const brandHomeButton = document.getElementById("brandHomeButton");
const loginButton = document.getElementById("loginButton");
const profileButton = document.getElementById("profileButton");
const profileView = document.getElementById("profileView");
const loginModal = document.getElementById("loginModal");
const closeLoginButton = document.getElementById("closeLoginButton");
const showLoginTab = document.getElementById("showLoginTab");
const showRegisterTab = document.getElementById("showRegisterTab");
const submitLoginButton = document.getElementById("submitLoginButton");
const loginUsernameInput = document.getElementById("loginUsernameInput");
const loginPasswordInput = document.getElementById("loginPasswordInput");
const loginMessage = document.getElementById("loginMessage");
const profileTabContent = document.getElementById("profileTabContent");

let balance = 0.00;
let rotation = 0;
let spinning = false;
let forceSecretSegment500 = false;
let secretMode = 0; // 0 normal, 1 lucky, 2 perfect, 3 unlucky
let shopOpen = false;
let shopSortDirection = "asc";
let currentBalanceStake = 0;
const shopQuantities = {};
const SHOP_ITEMS_PER_PAGE = 30;
const SHOP_PANEL_ITEMS_PER_PAGE = 25;
let shopPage = 1;
let shopPanelPage = 1;
let lastShopPageCount = 1;
let lastShopPanelPageCount = 1;
let percentValue = 50.00;
let startAngle = 0;
let endAngle = 0;
let percentAnimation = null;
let audioCtx = null;
let lastTickAngle = 0;
let fastMode = false;
let soundEnabled = localStorage.getItem("upgradeSoundEnabled") !== "false";
let selectedCurrency = "EUR";
let notificationItems = JSON.parse(localStorage.getItem("upgraderNotifications") || "[]");
let accountStore = {users: []};
let currentUser = null;
let loginMode = "login";
let activeProfileTab = "inventory";
let viewingFakeProfile = null;
let paymentHistoryItems = [];
let gameHistoryItems = [];
let itemHistoryItems = [];
let accountUpgradeCount = 0;
let bestDropItem = null;
const PROFILE_AVATARS = ["profile-pictures/avatar1.svg","profile-pictures/avatar2.svg","profile-pictures/avatar3.svg","profile-pictures/avatar4.svg","profile-pictures/avatar5.svg"];
let upgradesCounterValue = 224766506;
let onlineCounterValue = 1627;
let upgradeCounterTimer = null;
const tickEveryDegrees = 30;

function playTick(volume = 0.08) {
  if (!soundEnabled) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.value = 850;

  gain.gain.value = volume;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + 0.025
  );

  osc.stop(audioCtx.currentTime + 0.025);
}

function playWinSound(){
  if(!soundEnabled) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioCtx.currentTime;
  [523, 659, 784].forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t = now + index * 0.075;
    osc.start(t);
    gain.gain.exponentialRampToValueAtTime(0.09, t + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.stop(t + 0.24);
  });
}

function updateSoundButton(){
  if(!soundToggleButton) return;
  soundToggleButton.classList.toggle("active", soundEnabled);
  soundToggleButton.textContent = soundEnabled ? "🔊" : "🔇";
  document.querySelectorAll('input[name="soundSetting"]').forEach(input => {
    input.checked = input.value === (soundEnabled ? "enabled" : "disabled");
  });
}

function playSpinTick() {
  if (Math.abs(rotation - lastTickAngle) >= tickEveryDegrees) {
    playTick();
    lastTickAngle = rotation;
  }
}


let selectedInputSkins = [];
let selectedTargetSkin = null;
let selectedShopSkin = null;
let selectedShopQuantity = 1;

const DEFAULT_UPGRADE_SETTINGS = {
  multipliers: [2, 4, 8],
  percents: [35, 60, 80]
};

let upgradeSettings = loadUpgradeSettings();
let activeQuickValue = 60;

function cleanNumberList(values, options = {}){
  const min = options.min ?? 0.01;
  const max = options.max ?? Infinity;
  const fallback = options.fallback ?? [];

  const cleaned = values
    .map(value => Number(String(value).trim().replace(",", ".")))
    .filter(value => Number.isFinite(value) && value >= min)
    .map(value => Math.min(value, max));

  const unique = [];
  cleaned.forEach(value => {
    const rounded = Math.round(value * 100) / 100;
    if(!unique.some(existing => Math.abs(existing - rounded) < 0.001)){
      unique.push(rounded);
    }
  });

  return unique.length ? unique : [...fallback];
}

function parseNumberList(text, options = {}){
  return cleanNumberList(String(text || "").split(/[;,\s]+/), options);
}

function loadUpgradeSettings(){
  try{
    const saved = JSON.parse(localStorage.getItem("upgradeQuickSettings") || "{}");
    return {
      multipliers: cleanNumberList(saved.multipliers || DEFAULT_UPGRADE_SETTINGS.multipliers, {min: 1.01, fallback: DEFAULT_UPGRADE_SETTINGS.multipliers}),
      percents: cleanNumberList(saved.percents || DEFAULT_UPGRADE_SETTINGS.percents, {min: 0.01, max: 95, fallback: DEFAULT_UPGRADE_SETTINGS.percents})
    };
  }catch(e){
    return {
      multipliers: [...DEFAULT_UPGRADE_SETTINGS.multipliers],
      percents: [...DEFAULT_UPGRADE_SETTINGS.percents]
    };
  }
}

function saveUpgradeSettings(){
  localStorage.setItem("upgradeQuickSettings", JSON.stringify(upgradeSettings));
}

function formatNumberLabel(value){
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

function renderQuickButtons(){
  if(!quickButtons) return;
  quickButtons.innerHTML = "";

  upgradeSettings.multipliers.forEach(multiplier => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.multi = String(multiplier);
    btn.textContent = `x${formatNumberLabel(multiplier)}`;
    quickButtons.appendChild(btn);
  });

  upgradeSettings.percents.forEach(percent => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.percent = String(percent);
    btn.textContent = `${formatNumberLabel(percent)}%`;
    if(Math.abs(percent - activeQuickValue) < 0.001) btn.classList.add("active");
    quickButtons.appendChild(btn);
  });

  const gear = document.createElement("button");
  gear.type = "button";
  gear.id = "upgradeSettingsButton";
  gear.className = "settings-button";
  gear.title = "Multiplikatoren und Wahrscheinlichkeiten einstellen";
  gear.textContent = "⚙";
  quickButtons.appendChild(gear);
}

function openUpgradeSettings(){
  multiplierSettingsInput.value = upgradeSettings.multipliers.join(", ");
  percentSettingsInput.value = upgradeSettings.percents.join(", ");
  updateFastModeButton();
  updateSoundButton();
  upgradeSettingsModal.classList.add("active");
  multiplierSettingsInput.focus();
}

function closeUpgradeSettings(){
  upgradeSettingsModal.classList.remove("active");
}

function applyUpgradeSettings(){
  upgradeSettings = {
    multipliers: parseNumberList(multiplierSettingsInput.value, {min: 1.01, fallback: DEFAULT_UPGRADE_SETTINGS.multipliers}),
    percents: parseNumberList(percentSettingsInput.value, {min: 0.01, max: 95, fallback: DEFAULT_UPGRADE_SETTINGS.percents})
  };
  saveUpgradeSettings();
  renderQuickButtons();
  closeUpgradeSettings();
  message.textContent = "Upgrade-Einstellungen gespeichert.";
}


function getSelectedSkinValue(){
  return selectedInputSkins.reduce((sum, s) => sum + s.price, 0);
}

function getMaxBalanceStake(){
  const skinValue = getSelectedSkinValue();
  if(skinValue <= 0) return 0;
  return Math.min(balance, skinValue * 0.10);
}

function getInputValue(){
  return getSelectedSkinValue() + currentBalanceStake;
}

function clampBalanceStake(){
  const maxStake = getMaxBalanceStake();
  currentBalanceStake = Math.max(0, Math.min(currentBalanceStake, maxStake));
}

function updateBalanceStakeUI(){
  clampBalanceStake();
  if(balanceStakeValue) balanceStakeValue.textContent = `${currentBalanceStake.toFixed(2)} ⌘`;
  if(balanceStakeMax) balanceStakeMax.textContent = `(max ${getMaxBalanceStake().toFixed(2)} ⌘)`;
  if(balanceStakeSlider){
    const maxStake = getMaxBalanceStake();
    balanceStakeSlider.max = maxStake.toFixed(2);
    balanceStakeSlider.value = currentBalanceStake.toFixed(2);
    balanceStakeSlider.disabled = maxStake <= 0 || spinning;
  }
}

function getMaxAllowedChance(){
  return 75;
}

function getMinTargetPriceForInput(inputValue = getInputValue()){
  if(inputValue <= 0) return 0;
  return inputValue / (getMaxAllowedChance() / 100);
}

function isValidUpgradeTarget(skin, inputValue = getInputValue()){
  return !!(
    skin &&
    skin.image &&
    Number.isFinite(skin.price) &&
    inputValue > 0 &&
    skin.price >= getMinTargetPriceForInput(inputValue)
  );
}




function getSkinRarity(item){
  if (!item) return "consumer";

  if (item.rarityClass) return item.rarityClass;

  const name = (item.name || "").toLowerCase();
  const model = (item.model || "").toLowerCase();
  const rarity = (item.rarity || "").toLowerCase();

  if (
    model === "knife" ||
    name.includes("knife") ||
    name.includes("bayonet") ||
    name.includes("karambit") ||
    name.includes("butterfly") ||
    name.includes("talon") ||
    name.includes("skeleton") ||
    name.includes("stiletto") ||
    name.includes("kukri") ||
    name.includes("daggers")
  ) return "knife";

  if (rarity.includes("contraband")) return "contraband";
  if (rarity.includes("covert")) return "covert";
  if (rarity.includes("classified")) return "classified";
  if (rarity.includes("restricted")) return "restricted";
  if (rarity.includes("mil-spec") || rarity.includes("industrial")) return "milspec";

  return "consumer";
}

function skinRarityClass(item){
  return "rarity-" + getSkinRarity(item);
}

function getRarityBackground(item){
  const rarity = getSkinRarity(item);

  if (rarity === "knife") {
    return "linear-gradient(135deg,#fff4b8 0%,#fbd506 30%,#d89b00 62%,#382400 100%)";
  }

  if (rarity === "contraband") {
    return "linear-gradient(135deg,#ffb000 0%,#ff8c00 42%,#7a2e00 100%)";
  }

  if (rarity === "covert") {
    return "linear-gradient(135deg,#ff4b4b 0%,#d90429 46%,#3d0008 100%)";
  }

  if (rarity === "classified") {
    return "linear-gradient(135deg,#ff4fd8 0%,#b517ff 48%,#2b1055 100%)";
  }

  if (rarity === "restricted") {
    return "linear-gradient(135deg,#8b5cf6 0%,#6d28d9 48%,#1e0b44 100%)";
  }

  if (rarity === "milspec") {
    return "linear-gradient(135deg,#4b8cff 0%,#2563eb 48%,#0b1f4d 100%)";
  }

  return "linear-gradient(135deg,#b8b8b8 0%,#606060 48%,#1f1f1f 100%)";
}

function applyRarityBackgroundVars(card, item){
  if (!card || !item) return;

  const rarity = getSkinRarity(item);
  card.style.setProperty("--rarity-bg", getRarityBackground(item));
  card.style.setProperty("--rarity-accent", getComputedStyle(document.documentElement).getPropertyValue("--rarity-" + rarity).trim() || "#b8b8b8");
}

function skinStyle(item){
  const rarityBg = typeof getRarityBackground === "function"
    ? getRarityBackground(item)
    : (item && item.color ? item.color : "linear-gradient(135deg,#303033,#151518)");

  return `--skin-bg:${rarityBg};--finish-bg:${rarityBg};--rarity-bg:${rarityBg};`;
}

function skinDisplayName(item){
  return item?.displayName || item?.baseName || item?.name || "";
}

function skinImageMarkup(item){
  if(!item || !item.image) return "";
  const wearBadge = item.wear ? `<span class="skin-wear-badge">${item.wear}</span>` : "";
  return `${wearBadge}<img class="skin-img" src="${item.image}" alt="${skinDisplayName(item)}" loading="lazy">`;
}

function getInventoryValue(){
  return mySkins.reduce((sum, item) => sum + item.price, 0);
}

function updateInventoryValue(){
  const valueEl = document.getElementById("inventoryValue");

  if(valueEl){
    valueEl.textContent = `${getInventoryValue().toFixed(2)} ⌘`;
  }
}


function getShopCartEntries(){
  return marketSkins
    .filter(skin => shopQuantities[skin.name] && shopQuantities[skin.name] > 0)
    .map(skin => ({skin, qty: Math.max(0, shopQuantities[skin.name] || 0)}));
}

function getShopCartTotal(){
  return getShopCartEntries().reduce((sum, entry) => sum + entry.skin.price * entry.qty, 0);
}

function getShopCartCount(){
  return getShopCartEntries().reduce((sum, entry) => sum + entry.qty, 0);
}

function changeShopQty(name, delta){
  shopQuantities[name] = Math.max(0, Math.min(99, (shopQuantities[name] || 0) + delta));
  renderInventory();
}

function clearShopCart(){
  Object.keys(shopQuantities).forEach(key => { shopQuantities[key] = 0; });
}

function buyShopCart(){
  const entries = getShopCartEntries();
  if(!entries.length){ message.textContent = "Wähle erst mindestens einen Skin im Shop."; return; }
  const total = getShopCartTotal();
  if(balance < total){ message.textContent = "Nicht genug Balance für diesen Einkauf."; return; }
  balance -= total;
  entries.forEach(({skin, qty}) => {
    for(let i = 0; i < qty; i++) mySkins.push({...skin});
  });
  const count = getShopCartCount();
  clearShopCart();
  updateBalance();
  renderInventory();
  renderUpgradeFields();
  message.textContent = `${count} Skin(s) für ${total.toFixed(2)} ⌘ gekauft.`;
  persistAccount();
}

function ensureShopButton(){
  const header = inventoryGrid?.closest(".inventory-section")?.querySelector(".inventory-header");
  if(!header) return;

  let switcher = document.getElementById("inventoryShopSwitcher");
  if(!switcher){
    switcher = document.createElement("div");
    switcher.id = "inventoryShopSwitcher";
    switcher.className = "inventory-shop-switcher menu-style-switcher";
    switcher.innerHTML = `
      <button id="openInventoryButton" type="button" class="mini-tab-button inventory-tab" aria-label="Inventory">⌁</button>
      <button id="openShopButton" type="button" class="mini-tab-button shop-tab" aria-label="Shop">🛒</button>
      <button id="headerShopSortToggle" type="button" class="mini-tab-button sort-tab" title="Skins sortieren">↕</button>
    `;
    header.appendChild(switcher);
    switcher.querySelector("#openInventoryButton").addEventListener("click", () => {
      shopOpen = false;
      renderInventory();
      renderMarket();
    });
    switcher.querySelector("#openShopButton").addEventListener("click", () => {
      shopOpen = true;
      renderInventory();
      renderMarket();
    });
    switcher.querySelector("#headerShopSortToggle").addEventListener("click", () => {
      shopSortDirection = shopSortDirection === "asc" ? "desc" : "asc";
      shopPanelPage = 1;
      renderInventory();
    });
  }

  const inv = document.getElementById("openInventoryButton");
  const shop = document.getElementById("openShopButton");
  const sort = document.getElementById("headerShopSortToggle");
  if(inv) inv.classList.toggle("active", !shopOpen);
  if(shop){
    shop.classList.toggle("active", shopOpen);
    shop.title = shopOpen ? "Shop geöffnet" : "Shop anzeigen";
  }
  if(sort){
    sort.classList.toggle("desc", shopSortDirection === "desc");
    sort.title = shopSortDirection === "asc" ? "Billigste zuerst" : "Teuerste zuerst";
  }
}

function ensureInventoryValueBadge(){
  const inventorySection = inventoryGrid?.closest(".inventory-section");
  if(!inventorySection) return;

  const header = inventorySection.querySelector(".inventory-header");
  if(!header) return;

  let badge = document.getElementById("inventoryValueBadge");

  if(!badge){
    badge = document.createElement("div");
    badge.id = "inventoryValueBadge";
    badge.className = "inventory-value-badge";
    badge.innerHTML = `Inventarwert: <span id="inventoryValue">0.00 ⌘</span>`;

    const addButton = Array.from(header.querySelectorAll("button")).find(btn =>
      btn.textContent.toLowerCase().includes("skin")
    );

    if(addButton){
      addButton.insertAdjacentElement("afterend", badge);
    }else{
      header.appendChild(badge);
    }
  }

  updateInventoryValue();
}

function updateBalance(){
  balanceAmount.textContent = balance.toFixed(2);
  updateBalanceStakeUI();
  ensureLowBalanceOverlay();
}


function updateFastModeButton(){
  fastModeButton.classList.toggle("active", fastMode);
  fastModeButton.setAttribute("aria-pressed", String(fastMode));
  fastModeButton.title = fastMode ? "Fast Mode ausschalten" : "Fast Mode einschalten";
  document.querySelectorAll('input[name="scrollSetting"]').forEach(input => { input.checked = input.value === (fastMode ? "fast" : "normal"); });
}

const EURO_TO_COINS = 80;
const TOPUP_TARGET_SKIN_VALUE = 80;
const TOPUP_MAX_SKINS = 10;
const TOPUP_ALLOWED_SKIN_COUNTS = [5, 10];

function cloneSkinFromPool(item){
  return {...item};
}

function getTopUpSkinPool(coinBudget){
  return marketSkins
    .filter(item =>
      Number.isFinite(item.price) &&
      item.price > 0 &&
      item.price <= coinBudget
    )
    .sort((a, b) => a.price - b.price);
}

function pickDistributedSkin(pool, restValue, slotsLeft, usedNames){
  const targetValue = restValue / slotsLeft;
  const lowerTarget = targetValue * 0.65;
  const upperTarget = Math.min(restValue, targetValue * 1.35);

  let candidates = pool.filter(item =>
    item.price <= restValue &&
    item.price >= lowerTarget &&
    item.price <= upperTarget
  );

  if(candidates.length === 0){
    candidates = pool.filter(item => item.price <= Math.min(restValue, targetValue));
  }

  if(candidates.length === 0){
    candidates = pool.filter(item => item.price <= restValue);
  }

  if(candidates.length === 0){
    return null;
  }

  const unusedCandidates = candidates.filter(item => !usedNames.has(item.name));
  const finalCandidates = unusedCandidates.length > 0 ? unusedCandidates : candidates;

  finalCandidates.sort((a, b) =>
    Math.abs(a.price - targetValue) - Math.abs(b.price - targetValue)
  );

  const bestCandidates = finalCandidates.slice(0, Math.min(8, finalCandidates.length));
  return bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
}

function getCheapestMarketSkinPrice(){
  const pool = (Array.isArray(marketSkins) && marketSkins.length ? marketSkins : mySkins)
    .filter(item => item && item.image && Number.isFinite(item.price) && item.price > 0);
  if(!pool.length) return 0;
  return Math.min(...pool.map(item => Number(item.price) || 0).filter(price => price > 0));
}

function createTopUpBundle(euroValue){
  const coinBudget = euroValue * EURO_TO_COINS;

  const affordablePool = marketSkins
    .filter(item =>
      item &&
      item.image &&
      Number.isFinite(item.price) &&
      item.price > 0 &&
      item.price <= coinBudget
    )
    .sort((a, b) => a.price - b.price);

  if(!affordablePool.length){
    return {
      coinBudget,
      totalValue: 0,
      skins: []
    };
  }

  const wantedCount = TOPUP_ALLOWED_SKIN_COUNTS[Math.floor(Math.random() * TOPUP_ALLOWED_SKIN_COUNTS.length)];
  const count = Math.min(wantedCount, TOPUP_MAX_SKINS, affordablePool.length);

  const targetPerSkin = coinBudget / count;
  const chosen = [];
  let remainingBudget = coinBudget;

  for(let i = 0; i < count; i++){
    const remainingSlots = count - i;

    const candidates = affordablePool
      .filter(item => item.price <= (remainingBudget / remainingSlots) * 1.35)
      .sort((a, b) => Math.abs(a.price - targetPerSkin) - Math.abs(b.price - targetPerSkin));

    const fallback = affordablePool
      .filter(item => item.price <= remainingBudget)
      .sort((a, b) => b.price - a.price);

    const source = candidates.length ? candidates : fallback;

    if(!source.length) break;

    const randomLimit = Math.min(source.length, 8);
    const selected = source[Math.floor(Math.random() * randomLimit)];

    chosen.push(cloneSkinFromPool(selected));
    remainingBudget -= selected.price;
  }

  while(chosen.length < Math.min(5, affordablePool.length)){
    const cheapestPool = affordablePool.slice(0, Math.min(affordablePool.length, 10));
    const selected = cheapestPool[Math.floor(Math.random() * cheapestPool.length)];
    if(!selected) break;
    chosen.push(cloneSkinFromPool(selected));
  }

  const totalValue = chosen.reduce((sum, item) => sum + item.price, 0);

  return {
    coinBudget,
    totalValue,
    skins: chosen
  };
}



function getTopUpEuroValue(){
  return Math.max(0, Number(String(moneyInput?.value || "").replace(",", ".")) || 0);
}

function hasPromoDiscount(){
  return String(promoInput?.value || "").trim().toLowerCase() === "joscha10";
}

function getTopUpPoints(){
  const euro = getTopUpEuroValue();
  const bonus = hasPromoDiscount() ? 1.10 : 1;
  return euro * EURO_TO_COINS * bonus;
}

function updateTopUpButtonText(){
  if(!saveMoneyButton) return;
  const points = getTopUpPoints();
  const promoText = hasPromoDiscount() ? " +10%" : "";
  saveMoneyButton.textContent = points > 0 ? `Top up ${points.toFixed(0)} ⌘${promoText}` : "Top up";
}

function addDepositNotification(euro, points){
  const date = new Date();
  const stamp = date.toLocaleString("de-DE", {day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit"});
  const payItem = {stamp, title:"Balance Deposited", text:`Balance deposited in the amount of ${points.toFixed(2)} ⌘ (${euro.toFixed(2)} €)`};
  notificationItems.unshift(payItem);
  paymentHistoryItems.unshift(payItem);
  notificationItems = notificationItems.slice(0, 20);
  localStorage.setItem("upgraderNotifications", JSON.stringify(notificationItems));
  persistAccount();
  renderNotifications();
}

function renderNotifications(){
  if(!notificationsList) return;
  if(!notificationItems.length){
    notificationsList.innerHTML = '<div class="notification-item"><strong>No deposits yet</strong><p>Your deposits will appear here.</p></div>';
    return;
  }
  notificationsList.innerHTML = notificationItems.map(item => `
    <div class="notification-item">
      <small>${item.stamp}</small>
      <strong>${item.title}</strong>
      <p>${item.text}</p>
    </div>
  `).join("");
}

function startLiveCounters(){
  const upgradesEl = document.querySelector(".upgrades-stat strong");
  const onlineEl = document.querySelector(".online-stat strong");
  const fmt = n => Math.round(n).toLocaleString("de-DE").replace(/\./g, " ");
  const bump = el => {
    if(!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
    setTimeout(() => el.classList.remove("bump"), 240);
  };
  function tickUpgrades(){
    if(Math.random() > 0.06){
      const burst = Math.random() < 0.28 ? 2 : 1;
      upgradesCounterValue += burst * (18 + Math.floor(Math.random() * 78));
      if(upgradesEl){
        upgradesEl.textContent = fmt(upgradesCounterValue);
        bump(upgradesEl);
      }
    }
    const delay = Math.random() < 0.18 ? 120 + Math.random() * 180 : 260 + Math.random() * 520;
    upgradeCounterTimer = setTimeout(tickUpgrades, delay);
  }
  function tickOnline(){
    if(Math.random() > 0.25){
      onlineCounterValue = Math.max(1350, Math.min(2850, onlineCounterValue + Math.floor(Math.random() * 35) - 16));
      if(onlineEl){
        onlineEl.textContent = fmt(onlineCounterValue);
        bump(onlineEl);
      }
    }
    setTimeout(tickOnline, 1600 + Math.random() * 4200);
  }
  tickUpgrades();
  tickOnline();
}

const LIVE_FEED_MAX = 12;
const LIVE_FEED_NAMES = ["DOPPLER PHASE", "GODSENT FOIL", "RANGER", "HYBRID", "CYREX", "ANGEL EYES", "PREY", "NITRO", "DAMASCUS STEEL", "INDIGO", "CLEAR POLYMER", "JUNGLE", "PREDATOR", "MURKY", "SAFARI MESH"];
let liveFeedBest = null;
let liveFeedTimer = null;

function liveFeedPool(){
  const source = (Array.isArray(marketSkins) && marketSkins.length ? marketSkins : mySkins).filter(item => item && Number.isFinite(item.price));
  return source.length ? source : [];
}

function getBotUpgrade(itemOverride = null, chanceOverride = null){
  const pool = liveFeedPool();
  const item = itemOverride || pool[Math.floor(Math.random() * pool.length)];
  if(!item) return null;
  const chance = chanceOverride ?? (5 + Math.random() * 76);
  return {
    item,
    chance,
    score: (Number(item.price) || 0) * (chance / 100),
    createdAt: Date.now()
  };
}

function feedTitle(item){
  const source = skinDisplayName(item).split("|")[1] || skinDisplayName(item) || LIVE_FEED_NAMES[Math.floor(Math.random() * LIVE_FEED_NAMES.length)];
  return source.trim().toUpperCase();
}

function feedSubtitle(item){
  const source = skinDisplayName(item).split("|")[0] || item.weapon || item.type || "StatTrak™";
  return source.trim();
}

function createLiveFeedCard(upgrade, forceHot = false){
  const card = document.createElement("div");
  const isHot = forceHot || !liveFeedBest || upgrade.score > liveFeedBest.score;
  if(isHot) liveFeedBest = upgrade;
  card.className = `live-feed-card ${skinRarityClass(upgrade.item)}${isHot ? " hot" : ""}`;
  applyRarityBackgroundVars(card, upgrade.item);
  card.dataset.score = String(upgrade.score || 0);
  card.title = "Profil ansehen";
  card.addEventListener("click", () => showFakeProfileFromUpgrade(upgrade));
  card.innerHTML = `
    <div class="live-feed-chance">${upgrade.chance.toFixed(2)}%</div>
    <div class="live-feed-value">${(Number(upgrade.item.price)||0).toFixed(2)} ⌘</div>
    <div class="live-feed-img">${skinImageMarkup(upgrade.item)}</div>
    <div class="live-feed-title">${feedTitle(upgrade.item)}</div>
    <div class="live-feed-sub">${feedSubtitle(upgrade.item)}</div>
  `;
  return card;
}

function pushLiveFeedUpgrade(upgrade){
  const feed = document.getElementById("liveFeed");
  if(!feed || !upgrade) return;
  const previousBest = liveFeedBest;
  const isBetter = !previousBest || upgrade.score > previousBest.score;
  const card = createLiveFeedCard(upgrade, isBetter);
  if(isBetter){
    feed.querySelectorAll(".live-feed-card.hot").forEach(old => old.remove());
    feed.prepend(card);
  }else{
    const bestCard = feed.querySelector(".live-feed-card.hot");
    if(bestCard && bestCard.nextSibling){
      feed.insertBefore(card, bestCard.nextSibling);
    }else if(bestCard){
      feed.appendChild(card);
    }else{
      feed.prepend(card);
    }
  }
  while(feed.children.length > LIVE_FEED_MAX){
    const last = feed.lastElementChild;
    if(!last) break;
    if(last.classList.contains("hot")) break;
    last.classList.add("leaving");
    setTimeout(() => last.remove(), 360);
    break;
  }
}

function seedLiveFeed(){
  const feed = document.getElementById("liveFeed");
  if(!feed || feed.dataset.ready === "true") return;
  feed.dataset.ready = "true";
  const upgrades = [];
  for(let i = 0; i < LIVE_FEED_MAX; i++){
    const upgrade = getBotUpgrade(null, i === 0 ? 72 + Math.random() * 12 : undefined);
    if(upgrade) upgrades.push(upgrade);
  }
  upgrades.sort((a,b) => b.score - a.score);
  upgrades.forEach(upgrade => feed.appendChild(createLiveFeedCard(upgrade)));
}

function scheduleLiveFeed(){
  seedLiveFeed();
  const next = () => {
    const count = Math.random() < 0.18 ? 2 : 1;
    for(let i = 0; i < count; i++) setTimeout(() => pushLiveFeedUpgrade(getBotUpgrade()), i * 145);
    const delay = Math.random() < 0.16 ? 350 + Math.random() * 250 : 760 + Math.random() * 680;
    liveFeedTimer = setTimeout(next, delay);
  };
  next();
}

function pushOwnUpgradeToFeed(item){
  pushLiveFeedUpgrade(getBotUpgrade(item, Math.max(1, getCurrentChancePercent())));
}
function drawCircle(percent){
  percentValue = Math.max(0.01, Math.min(percent, 95));
  percentText.textContent = percentValue.toFixed(2) + "%";

  if(percentValue < 40) chanceText.textContent = "Niedrige Chance";
  else if(percentValue < 70) chanceText.textContent = "Mittlere Chance";
  else chanceText.textContent = "Hohe Chance";

  const visiblePercent = Math.max(percentValue, 0.35);
  const degrees = visiblePercent / 100 * 360;
  startAngle = 180 - degrees / 2;
  endAngle = 180 + degrees / 2;

  const hotInner = Math.max(0.03, degrees * .05);
  const warmInner = Math.max(0.08, degrees * .15);
  const gradient = `
    conic-gradient(
      #151515 0deg,
      #151515 ${startAngle}deg,
      #ffd800 ${startAngle}deg,
      #ffb000 ${180 - warmInner}deg,
      #ff5a00 ${180 - hotInner}deg,
      #ff2b00 180deg,
      #ff5a00 ${180 + hotInner}deg,
      #ffb000 ${180 + warmInner}deg,
      #ffd800 ${endAngle}deg,
      #151515 ${endAngle}deg,
      #151515 360deg
    )
  `;

  chance.style.background = gradient;
  outerProgress.style.background = gradient;
}

function animateCircleTo(targetPercent){
  if(percentAnimation) cancelAnimationFrame(percentAnimation);

  const start = percentValue;
  const change = targetPercent - start;
  const duration = 600;
  const startTime = performance.now();

  function animate(time){
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    drawCircle(start + change * eased);

    if(progress < 1){
      percentAnimation = requestAnimationFrame(animate);
    }
  }

  percentAnimation = requestAnimationFrame(animate);
}

function setButtonActive(target){
  activeQuickValue = target;
  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.classList.remove("active");

    if(btn.dataset.percent && Math.abs(Number(btn.dataset.percent) - target) < 0.001){
      btn.classList.add("active");
    }

    if(btn.dataset.multi && Math.abs(Number(btn.dataset.multi) - target) < 0.001){
      btn.classList.add("active");
    }
  });
}


function getCurrentChancePercent() {
  if (!selectedTargetSkin || selectedTargetSkin.price <= 0) return 0;
  return (getInputValue() / selectedTargetSkin.price) * 100;
}

function getRealTargetSkinByPrice(targetPrice){
  const inputValue = getInputValue();

  const candidates = marketSkins
    .filter(item =>
      item &&
      item.image &&
      Number.isFinite(item.price) &&
      isValidUpgradeTarget(item, inputValue)
    )
    .sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice));

  return candidates.length ? {...candidates[0]} : null;
}

function getRealTargetSkinByPercent(percent){
  const inputValue = getInputValue();

  if(inputValue <= 0) return null;

  const candidates = marketSkins
    .filter(item =>
      item &&
      item.image &&
      Number.isFinite(item.price) &&
      isValidUpgradeTarget(item, inputValue)
    )
    .sort((a, b) => {
      const chanceA = (inputValue / a.price) * 100;
      const chanceB = (inputValue / b.price) * 100;
      return Math.abs(chanceA - percent) - Math.abs(chanceB - percent);
    });

  return candidates.length ? {...candidates[0]} : null;
}

function isChanceAllowed() {
  const currentChance = getCurrentChancePercent();

  if (currentChance > 75) {
    message.textContent = "Maximal 75% Chance erlaubt.";
    animateCircleTo(75);
    return false;
  }

  return true;
}

function selectTargetSkin(shopSkin){
  if(spinning) return;

  const inputValue = getInputValue();

  if(inputValue <= 0){
    message.textContent = "Erst Einsatz-Skin auswählen.";
    return;
  }

  if(!isValidUpgradeTarget(shopSkin, inputValue)){
    const minTargetPrice = getMinTargetPriceForInput(inputValue);
    message.textContent = `Dieser Skin ist nicht nutzbar. Ziel muss mindestens ${minTargetPrice.toFixed(2)} ⌘ kosten (max. 75%).`;
    return;
  }

  selectedTargetSkin = {...shopSkin};

  const targetPercent = (inputValue / selectedTargetSkin.price) * 100;

  setButtonActive(null);
  animateCircleTo(targetPercent);
  renderMarket();
  renderUpgradeFields();

  message.textContent = `Ziel ausgewählt: ${shopSkin.name}`;
}

function setMultiplier(multiplier){
  if(spinning) return;

  if(getInputValue() <= 0){
    message.textContent = "Erst Einsatz-Skin auswählen.";
    return;
  }

  const inputValue = getInputValue();
  const imperfect = 1 + (Math.random() * 0.08 - 0.04);
  const targetPrice = inputValue * multiplier * imperfect;
  const realTarget = getRealTargetSkinByPrice(targetPrice);

  if(!realTarget){
    message.textContent = "Kein passender Ziel-Skin mit PNG gefunden.";
    return;
  }

  selectedTargetSkin = realTarget;

  const chancePercent = (inputValue / selectedTargetSkin.price) * 100;

  if(chancePercent > 75){
    message.textContent = "Maximal 75% Chance erlaubt.";
    selectedTargetSkin = null;
    animateCircleTo(1.13);
    renderMarket();
    renderUpgradeFields();
    return;
  }

  setButtonActive(multiplier);
  animateCircleTo(chancePercent);
  renderMarket();
  renderUpgradeFields();

  message.textContent = `Ziel ausgewählt: ${selectedTargetSkin.name}`;
}

function setPercent(percent){
  if(spinning) return;

  if(getInputValue() <= 0){
    message.textContent = "Erst Einsatz-Skin auswählen.";
    return;
  }

  if(percent > 75){
    message.textContent = "Maximal 75% Chance erlaubt.";
    return;
  }

  const realTarget = getRealTargetSkinByPercent(percent);

  if(!realTarget){
    message.textContent = "Kein passender Ziel-Skin mit PNG gefunden.";
    return;
  }

  selectedTargetSkin = realTarget;

  const realChance = (getInputValue() / selectedTargetSkin.price) * 100;

  if(realChance > 75){
    message.textContent = "Maximal 75% Chance erlaubt.";
    selectedTargetSkin = null;
    animateCircleTo(1.13);
    renderMarket();
    renderUpgradeFields();
    return;
  }

  setButtonActive(percent);
  animateCircleTo(realChance);
  renderMarket();
  renderUpgradeFields();

  message.textContent = `Ziel ausgewählt: ${selectedTargetSkin.name}`;
}


function autoSelectDefaultTarget(){
  if(spinning) return;
  updateBalanceStakeUI();
  shopPage = 1;

  // Wichtig: nur automatisch auswählen, wenn noch kein Output/Ziel ausgewählt ist.
  const inputValue = getInputValue();

  if(selectedTargetSkin){
    if(isValidUpgradeTarget(selectedTargetSkin, inputValue)){
      renderMarket();
      renderUpgradeFields();

      if(selectedTargetSkin.price > 0){
        animateCircleTo(getCurrentChancePercent());
      }

      return;
    }

    selectedTargetSkin = null;
  }


  if(inputValue <= 0){
    selectedTargetSkin = null;
    setButtonActive(null);
    animateCircleTo(1.13);
    renderMarket();
    renderUpgradeFields();
    return;
  }

  const target = getRealTargetSkinByPercent(75);

  if(!target){
    selectedTargetSkin = null;
    setButtonActive(null);
    animateCircleTo(1.13);
    renderMarket();
    renderUpgradeFields();
    message.textContent = "Kein möglicher Ziel-Skin gefunden.";
    return;
  }

  selectedTargetSkin = target;

  const realChance = getCurrentChancePercent();

  setButtonActive(75);
  animateCircleTo(realChance);
  renderMarket();
  renderUpgradeFields();

  message.textContent = `Automatisch ausgewählt: ${selectedTargetSkin.name} (${realChance.toFixed(2)}%)`;
}


function ensureInventoryShopControls(){
  const section = inventoryGrid?.closest(".inventory-section");
  if(!section) return;
  let controls = document.getElementById("inventoryShopControls");
  if(!controls){
    controls = document.createElement("div");
    controls.id = "inventoryShopControls";
    controls.className = "shop-filter inventory-shop-filter";
    controls.innerHTML = `
      <button id="shopPanelSortToggle" type="button" class="sort-button pill-sort" title="Skins sortieren">↕</button>
      <input type="search" id="inventoryShopSearch" placeholder="Search">
      <input type="number" id="inventoryShopMin" class="coin-field" placeholder="from">
      <input type="number" id="inventoryShopMax" class="coin-field" placeholder="to">
    `;
    section.querySelector(".inventory-header").insertAdjacentElement("afterend", controls);
    ["inventoryShopSearch","inventoryShopMin","inventoryShopMax"].forEach(id => {
      controls.querySelector("#"+id).addEventListener("input", () => { shopPanelPage = 1; renderInventory(); });
    });
    controls.querySelector("#shopPanelSortToggle").addEventListener("click", () => {
      shopSortDirection = shopSortDirection === "asc" ? "desc" : "asc";
      shopPanelPage = 1;
      renderInventory();
    });
  }
  controls.style.display = shopOpen ? "flex" : "none";
  const sortToggle = controls.querySelector("#shopPanelSortToggle");
  if(sortToggle){
    sortToggle.classList.toggle("active", true);
    sortToggle.textContent = shopSortDirection === "asc" ? "↕" : "↕";
    sortToggle.title = shopSortDirection === "asc" ? "Billigste zuerst" : "Teuerste zuerst";
  }
}

function ensureShopCheckout(){
  const section = inventoryGrid?.closest(".inventory-section");
  if(!section) return null;
  let bar = document.getElementById("shopCheckoutBar");
  if(!bar){
    bar = document.createElement("div");
    bar.id = "shopCheckoutBar";
    bar.className = "shop-checkout-bar";
    bar.innerHTML = `
      <div class="shop-checkout-info" id="shopCheckoutInfo">Keine Skins ausgewählt</div>
      <div class="shop-cart-actions">
        <button id="shopBuySelected" type="button" class="shop-buy-selected" disabled>⌃ Kaufen</button>
      </div>
    `;
    section.appendChild(bar);
    bar.querySelector("#shopBuySelected").addEventListener("click", buyShopCart);
  }
  bar.style.display = shopOpen ? "flex" : "none";
  return bar;
}

function getShopFilteredSkins(){
  const query = String(document.getElementById("inventoryShopSearch")?.value || "").trim().toLowerCase();
  const minInput = Number(document.getElementById("inventoryShopMin")?.value);
  const maxInput = Number(document.getElementById("inventoryShopMax")?.value);
  const min = Number.isFinite(minInput) && minInput > 0 ? minInput : 0;
  const max = Number.isFinite(maxInput) && maxInput > 0 ? maxInput : Infinity;
  return marketSkins
    .filter(skin => skin && skin.image && skin.price >= min && skin.price <= max && (!query || `${skinDisplayName(skin)} ${skin.name || ""} ${skin.wear || ""} ${skin.model || ""} ${skin.rarity || ""}`.toLowerCase().includes(query)))
    .sort((a,b) => shopSortDirection === "asc" ? a.price - b.price : b.price - a.price);
}

function buySelectedShopSkin(){
  if(!selectedShopSkin) { message.textContent = "Erst einen Skin im Shop auswählen."; return; }
  const qty = Math.max(1, selectedShopQuantity || 1);
  const total = selectedShopSkin.price * qty;
  if(balance < total){
    message.textContent = `Nicht genug Coins. ${qty}x kostet ${total.toFixed(2)} ⌘.`;
    return;
  }
  balance -= total;
  for(let i = 0; i < qty; i++) mySkins.push({...selectedShopSkin});
  updateBalance();
  renderInventory();
  renderMarket();
  message.textContent = `${qty}x ${selectedShopSkin.name} gekauft`;
}

function updateShopCheckout(){
  const info = document.getElementById("shopCheckoutInfo");
  const buyButton = document.getElementById("shopBuySelected");
  if(!info || !buyButton) return;
  const count = getShopCartCount();
  const total = getShopCartTotal();
  if(count > 0){
    info.textContent = `${count} Skin(s) ausgewählt · ${total.toFixed(2)} ⌘`;
    buyButton.textContent = `⌃ Kaufen ${total.toFixed(2)} ⌘`;
    buyButton.disabled = balance < total;
  }else{
    info.textContent = "Keine Skins ausgewählt";
    buyButton.textContent = "⌃ Kaufen";
    buyButton.disabled = true;
  }
}

function ensureInventoryShopPagination(){
  const section = inventoryGrid?.closest(".inventory-section");
  if(!section) return null;
  let pagination = document.getElementById("inventoryShopPagination");
  if(!pagination){
    pagination = document.createElement("div");
    pagination.id = "inventoryShopPagination";
    pagination.className = "shop-pagination inventory-shop-pagination";
    pagination.innerHTML = `
      <button id="inventoryShopPrevPage" type="button">‹</button>
      <span id="inventoryShopPageInfo">1 / 1</span>
      <button id="inventoryShopNextPage" type="button">›</button>
    `;
    const checkout = document.getElementById("shopCheckoutBar");
    section.insertBefore(pagination, checkout || null);
    pagination.querySelector("#inventoryShopPrevPage").addEventListener("click", e => {
      e.stopPropagation();
      if(shopPanelPage > 1){ shopPanelPage--; renderInventory(); }
    });
    pagination.querySelector("#inventoryShopNextPage").addEventListener("click", e => {
      e.stopPropagation();
      if(shopPanelPage < lastShopPanelPageCount){ shopPanelPage++; renderInventory(); }
    });
  }
  pagination.style.display = shopOpen ? "flex" : "none";
  return pagination;
}

function updateInventoryShopPagination(total){
  const pagination = ensureInventoryShopPagination();
  if(!pagination) return;
  lastShopPanelPageCount = Math.max(1, Math.ceil(total / SHOP_PANEL_ITEMS_PER_PAGE));
  shopPanelPage = Math.max(1, Math.min(shopPanelPage, lastShopPanelPageCount));
  const info = document.getElementById("inventoryShopPageInfo");
  const prev = document.getElementById("inventoryShopPrevPage");
  const next = document.getElementById("inventoryShopNextPage");
  if(info) info.textContent = `${shopPanelPage} / ${lastShopPanelPageCount} · ${total}`;
  if(prev) prev.disabled = shopPanelPage <= 1;
  if(next) next.disabled = shopPanelPage >= lastShopPanelPageCount;
}

function renderShopInventoryPanel(){
  ensureInventoryShopControls();
  ensureShopCheckout();
  ensureInventoryShopPagination();
  inventoryGrid.innerHTML = "";
  const visibleSkins = getShopFilteredSkins();
  updateInventoryShopPagination(visibleSkins.length);
  if(!visibleSkins.length){
    const empty = document.createElement("div");
    empty.className = "shop-empty";
    empty.textContent = "Keine Skins gefunden.";
    inventoryGrid.appendChild(empty);
    updateShopCheckout();
    return;
  }
  const startIndex = (shopPanelPage - 1) * SHOP_PANEL_ITEMS_PER_PAGE;
  const pageSkins = visibleSkins.slice(startIndex, startIndex + SHOP_PANEL_ITEMS_PER_PAGE);
  const fragment = document.createDocumentFragment();
  pageSkins.forEach(shopSkin => {
    const qty = shopQuantities[shopSkin.name] || 0;
    const card = document.createElement("div");
    card.className = "skin-card shop-card buy-select-card " + skinRarityClass(shopSkin);
    applyRarityBackgroundVars(card, shopSkin);
    if(qty > 0) card.classList.add("selected");
    card.innerHTML = `
      <div class="skin-color model-${shopSkin.model}" style="${skinStyle(shopSkin)}">${skinImageMarkup(shopSkin)}</div>
      <div class="skin-name">${skinDisplayName(shopSkin)}</div>
      <div class="skin-price">${shopSkin.price.toFixed(2)} ⌘</div>
      ${qty > 0 ? `<div class="skin-qty-control">
        <button type="button" class="qty-minus">−</button>
        <span>${qty}</span>
        <button type="button" class="qty-plus">+</button>
      </div>` : ``}
    `;
    card.addEventListener("click", () => {
      if((shopQuantities[shopSkin.name] || 0) === 0) changeShopQty(shopSkin.name, 1);
    });
    card.querySelector(".qty-minus")?.addEventListener("click", e => { e.stopPropagation(); changeShopQty(shopSkin.name, -1); });
    card.querySelector(".qty-plus")?.addEventListener("click", e => { e.stopPropagation(); changeShopQty(shopSkin.name, 1); });
    fragment.appendChild(card);
  });
  inventoryGrid.appendChild(fragment);
  updateShopCheckout();
}

function ensureLowBalanceOverlay(){
  const section = inventoryGrid?.closest(".inventory-section");
  if(!section) return;
  let overlay = document.getElementById("lowBalanceOverlay");
  if(!overlay){
    overlay = document.createElement("div");
    overlay.id = "lowBalanceOverlay";
    overlay.className = "low-balance-overlay";
    overlay.innerHTML = `<div class="low-balance-card"><strong id="lowBalanceText">Top up balance by 390 ⌘</strong><button id="lowBalanceTopUpButton" type="button">💼 Top Up</button></div>`;
    section.appendChild(overlay);
    overlay.querySelector("#lowBalanceTopUpButton").addEventListener("click", (e) => { e.stopPropagation(); setBalance(); });
  }
  // The inventory lock should depend on the total usable account value, not only on
  // the loose coin balance. Top ups are usually converted into skins plus rest coins,
  // so players who deposited 390+ could still have balance = 0 while their inventory
  // value is high enough.
  const cheapestSkinPrice = getCheapestMarketSkinPrice();
  const inventoryHasSkins = Array.isArray(mySkins) && mySkins.length > 0;
  const missing = Math.max(0, cheapestSkinPrice - balance);
  const show = !shopOpen && !inventoryHasSkins && cheapestSkinPrice > 0 && balance < cheapestSkinPrice;
  overlay.classList.toggle("active", show);
  section.classList.toggle("low-balance", show);
  const text = document.getElementById("lowBalanceText");
  if(text) text.textContent = `Top up balance by ${Math.ceil(missing)} ⌘`;
}

function renderInventory(){
  ensureInventoryValueBadge();
  ensureShopButton();
  ensureInventoryShopControls();
  ensureShopCheckout();
  ensureLowBalanceOverlay();
  updateBalanceStakeUI();
  const title = document.querySelector(".my-inventory .inventory-title h2");
  if(title) title.textContent = shopOpen ? "Shop" : "My skins";
  const checkout = document.getElementById("shopCheckoutBar");
  if(checkout) checkout.style.display = shopOpen ? "flex" : "none";
  const controls = document.getElementById("inventoryShopControls");
  if(controls) controls.style.display = shopOpen ? "flex" : "none";
  const shopPager = document.getElementById("inventoryShopPagination");
  if(shopPager) shopPager.style.display = shopOpen ? "flex" : "none";
  if(shopOpen){
    renderShopInventoryPanel();
    renderMarket();
    return;
  }
  inventoryGrid.innerHTML = "";

  mySkins.forEach((skinItem, index) => {
    const card = document.createElement("div");
    card.className = "skin-card " + skinRarityClass(skinItem);
    applyRarityBackgroundVars(card, skinItem);
applyRarityBackgroundVars(card, skinItem);if(selectedInputSkins.includes(skinItem)){
      card.classList.add("selected");
    }

    card.innerHTML = `
      <div class="skin-color model-${skinItem.model}" style="${skinStyle(skinItem)}">
        ${skinImageMarkup(skinItem)}
      </div>
      <div>
        <div class="skin-name">${skinDisplayName(skinItem)}</div>
        <div class="skin-price">${skinItem.price.toFixed(2)} ⌘</div>
      </div>
    `;

    card.addEventListener("click", () => {
      if(spinning) return;

      if(selectedInputSkins.includes(skinItem)){
        selectedInputSkins = selectedInputSkins.filter(s => s !== skinItem);
      }else{
        selectedInputSkins.push(skinItem);
      }

      renderInventory();

      if(selectedInputSkins.length > 0){
        autoSelectDefaultTarget();
      }else{
        selectedTargetSkin = null;
        setButtonActive(null);
        shopPage = 1;
        renderMarket();
        renderUpgradeFields();
        animateCircleTo(1.13);
        message.textContent = "Kein Einsatz ausgewählt.";
      }
    });

    // Verkaufen ist nur noch im Profil möglich.


    inventoryGrid.appendChild(card);
  });
}

function renderMarket(){
  let marketSection = document.getElementById("marketSection");
  let marketGrid = document.getElementById("marketGrid");

  if(!marketSection){
    marketSection = document.createElement("section");
    marketSection.id = "marketSection";
    marketSection.className = "inventory-section shop-section";
    marketSection.innerHTML = `
      <div class="inventory-header shop-header">
        <div>
          <h2>Upgrade</h2>
          <p class="shop-hint" id="shopHint">Skin für Upgrade auswählen</p>
        </div>
        <span class="upgrade-title-badge">Upgrade</span>
      </div>

      <div class="shop-filter">
        <input type="search" id="skinSearch" placeholder="Suche">
        <input type="number" id="minPrice" placeholder="Min Preis">
        <input type="number" id="maxPrice" placeholder="Max Preis">
      </div>

      <div class="inventory-grid" id="marketGrid"></div>

      <div class="shop-pagination" id="shopPagination">
        <button id="shopPrevPage" type="button">‹ Zurück</button>
        <span id="shopPageInfo">Seite 1 / 1</span>
        <button id="shopNextPage" type="button">Weiter ›</button>
      </div>
    `;

    document.querySelector(".skin-area").appendChild(marketSection);
    marketGrid = document.getElementById("marketGrid");

    ["skinSearch", "minPrice", "maxPrice"].forEach(id => {
      document.getElementById(id).addEventListener("input", () => {
        shopPage = 1;
        renderMarket();
      });
    });

    const closeShopButton = document.getElementById("closeShopButton");
    if(closeShopButton){
      closeShopButton.addEventListener("click", () => {
        shopOpen = false;
        renderMarket();
      });
    }
  }

  const openShopButton = document.getElementById("openShopButton");
  if(openShopButton){
    openShopButton.classList.toggle("active", shopOpen);
    openShopButton.textContent = shopOpen ? "🎒" : "🛒";
  }

  const shouldShowMarket = true;
  marketSection.classList.toggle("active", true);

  marketGrid.innerHTML = "";

  const inputValue = getInputValue();
  const hasInput = inputValue > 0;
  const query = String(document.getElementById("skinSearch")?.value || "").trim().toLowerCase();
  const minInput = Number(document.getElementById("minPrice")?.value);
  const maxInput = Number(document.getElementById("maxPrice")?.value);

  const automaticMin = hasInput ? getMinTargetPriceForInput(inputValue) : 0;
  const manualMin = Number.isFinite(minInput) && minInput > 0 ? minInput : 0;
  const min = Math.max(automaticMin, manualMin);
  const max = Number.isFinite(maxInput) && maxInput > 0 ? maxInput : Infinity;

  const shopHint = document.getElementById("shopHint");
  if(shopHint){
    shopHint.textContent = hasInput
      ? `Rechts Ziel auswählen · nutzbare Upgrades ab ${getMinTargetPriceForInput(inputValue).toFixed(2)} ⌘ · Slider max. +10% Einsatzwert`
      : "Suche nutzen, Menge mit +/− einstellen und direkt mehrere Skins kaufen.";
  }

  const visibleSkins = marketSkins
    .filter(shopSkin =>
      shopSkin &&
      shopSkin.image &&
      shopSkin.price >= min &&
      shopSkin.price <= max &&
      (!query || `${skinDisplayName(shopSkin)} ${shopSkin.name || ""} ${shopSkin.wear || ""} ${shopSkin.model || ""} ${shopSkin.rarity || ""}`.toLowerCase().includes(query)) &&
      (!hasInput || isValidUpgradeTarget(shopSkin, inputValue))
    )
    .sort((a, b) => a.price - b.price);

  lastShopPageCount = Math.max(1, Math.ceil(visibleSkins.length / SHOP_ITEMS_PER_PAGE));
  if(shopPage > lastShopPageCount) shopPage = lastShopPageCount;
  if(shopPage < 1) shopPage = 1;

  const startIndex = (shopPage - 1) * SHOP_ITEMS_PER_PAGE;
  const pageSkins = visibleSkins.slice(startIndex, startIndex + SHOP_ITEMS_PER_PAGE);

  const pageInfo = document.getElementById("shopPageInfo");
  const prevButton = document.getElementById("shopPrevPage");
  const nextButton = document.getElementById("shopNextPage");

  if(pageInfo) pageInfo.textContent = `Seite ${shopPage} / ${lastShopPageCount} · ${visibleSkins.length} Skins`;
  if(prevButton){
    prevButton.disabled = shopPage <= 1;
    prevButton.onclick = () => { if(shopPage > 1){ shopPage--; renderMarket(); } };
  }
  if(nextButton){
    nextButton.disabled = shopPage >= lastShopPageCount;
    nextButton.onclick = () => { if(shopPage < lastShopPageCount){ shopPage++; renderMarket(); } };
  }

  if(visibleSkins.length === 0){
    const empty = document.createElement("div");
    empty.className = "shop-empty";
    empty.textContent = hasInput ? "Kein möglicher Ziel-Skin in diesem Preisbereich." : "Keine Skins gefunden.";
    marketGrid.appendChild(empty);
    return;
  }

  pageSkins.forEach(shopSkin => {
    const card = document.createElement("div");
    card.className = "skin-card shop-card " + skinRarityClass(shopSkin);
    applyRarityBackgroundVars(card, shopSkin);
    if(selectedTargetSkin && selectedTargetSkin.name === shopSkin.name){
      card.classList.add("selected-target");
    }

    card.innerHTML = `
      <div class="skin-color model-${shopSkin.model}" style="${skinStyle(shopSkin)}">
        ${skinImageMarkup(shopSkin)}
      </div>
      <div>
        <div class="skin-name">${skinDisplayName(shopSkin)}</div>
        <div class="skin-price">${shopSkin.price.toFixed(2)} ⌘</div>
      </div>

    `;

    card.addEventListener("click", () => selectTargetSkin(shopSkin));



    marketGrid.appendChild(card);
  });
}
function renderUpgradeFields(){
  const leftBox = document.querySelector(".side:first-child");
  const rightBox = document.querySelector(".side:last-child");

  ["glow","weapon","chevrons"].forEach(cls => {
    leftBox.querySelector("." + cls).style.display = selectedInputSkins.length ? "none" : "block";
    rightBox.querySelector("." + cls).style.display = selectedTargetSkin ? "none" : "block";
  });

  removeOldPreview(leftBox);
  removeOldPreview(rightBox);

  if(selectedInputSkins.length){
    const firstSkin = selectedInputSkins[0];

    const fakeInput = {
      ...firstSkin,
      name: selectedInputSkins.length === 1 ? firstSkin.name : `${selectedInputSkins.length} Skins ausgewählt`,
      price: getInputValue(),
      main: firstSkin.main || "#4b8cff",
      dark: firstSkin.dark || "#1d3557",
      color: firstSkin.color || "linear-gradient(135deg,#4b8cff,#1d3557)",
      model: firstSkin.model || "rifle",
      image: firstSkin.image
    };

    leftBox.appendChild(createPreview(fakeInput, "Einsatz"));
  }

  if(selectedTargetSkin){
    rightBox.appendChild(createPreview(selectedTargetSkin, "Ziel"));
  }
}

function removeOldPreview(box){
  const old = box.querySelector(".selected-preview");
  if(old) old.remove();
}

function createPreview(item, title){
  const div = document.createElement("div");
  div.className = "selected-preview " + skinRarityClass(item);
  applyRarityBackgroundVars(div, item);if(!item){
    return div;
  }

  div.innerHTML = `
    <div class="skin-color big model-${item.model}" style="${skinStyle(item)}">
      ${skinImageMarkup(item)}
    </div>
    <h3>${title}</h3>
    <div class="skin-name">${skinDisplayName(item)}</div>
    <div class="preview-price">${item.price.toFixed(2)} ⌘</div>
  `;

  return div;
}


function getWheelSegment(segmentIndex, totalSegments = 1000){
  const segmentSize = 360 / totalSegments;
  const segmentCenterAngle = segmentIndex * segmentSize + segmentSize / 2;

  return {
    index: segmentIndex,
    total: totalSegments,
    size: segmentSize,
    centerAngle: segmentCenterAngle
  };
}

function getRandomWheelSegment(totalSegments = 1000){
  return getWheelSegment(Math.floor(Math.random() * totalSegments), totalSegments);
}

function isAngleInWinZone(angle){
  const normalizedAngle = ((angle % 360) + 360) % 360;
  const normalizedStart = ((startAngle % 360) + 360) % 360;
  const normalizedEnd = ((endAngle % 360) + 360) % 360;

  if(normalizedStart <= normalizedEnd){
    return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd;
  }

  return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
}

function spin() {
  if (spinning) return;

  if (selectedInputSkins.length === 0) {
    message.textContent = "Wähle zuerst mindestens einen Einsatz-Skin.";
    return;
  }

  if (!selectedTargetSkin && getInputValue() > 0) {
    autoSelectDefaultTarget();
  }

  if (!selectedTargetSkin) {
    message.textContent = "Wähle zuerst einen Ziel-Skin.";
    return;
  }

  if (!isChanceAllowed()) {
    return;
  }

  spinning = true;
  spinButton.disabled = true;
  spinButton.textContent = "Dreht...";
  message.textContent = "";
  center.classList.remove("win");

  // Vor dem Drehen wird eines von 1000 Segmenten gewählt.
  // Normal ist es zufällig; im Secret-Modus wird Feld 500 erzwungen.
  // Intern ist die Nummerierung 0-basiert, deshalb ist Feld 500 der Index 499.
  const currentChanceForSecret = getCurrentChancePercent();
  let targetPointerAngle;
  if(secretMode === 2){
    targetPointerAngle = 180;
  }else if(secretMode === 1){
    const winWidth = Math.max(2, currentChanceForSecret / 100 * 360);
    const mostlyWin = Math.random() < 0.97;
    targetPointerAngle = mostlyWin
      ? 180 + (Math.random() - 0.5) * Math.max(1, winWidth * 0.82)
      : getRandomWheelSegment(1000).centerAngle;
  }else if(secretMode === 3){
    const loseOnPurpose = Math.random() < 0.80;
    if(loseOnPurpose){
      const side = Math.random() < 0.5 ? -1 : 1;
      const gap = Math.max(currentChanceForSecret / 100 * 180 + 8, 18);
      targetPointerAngle = (180 + side * gap + (Math.random() - 0.5) * 70 + 360) % 360;
    }else{
      targetPointerAngle = 180 + (Math.random() - 0.5) * Math.max(1, currentChanceForSecret / 100 * 260);
    }
  }else{
    targetPointerAngle = getRandomWheelSegment(1000).centerAngle;
  }
  const targetFinalAngle = (180 - targetPointerAngle + 360) % 360;

  // Gleicher Speed-Verlauf wie in der ersten Version:
  // Beschleunigen, kurzer Peak, dann physisches Ausrollen.
  // Damit die Scheibe trotzdem exakt auf dem vorher gewählten Segment landet,
  // wird nur die komplette Drehstrecke minimal auf das Zielsegment skaliert.
  const spinSettings = {
    startSpeed: 0.5,
    maxSpeed: 7 + Math.random() * 6,
    accelerateFrames: fastMode ? 10 : 185,
    holdFrames: fastMode ? 10 : 4,
    brake: fastMode ? 0.950 : 0.987,
    stopSpeed: fastMode ? 0.14 : 0.08
  };

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function buildSpinProfile(){
    const profile = [];
    let speed = spinSettings.startSpeed;
    let frame = 0;
    let phase = "accelerating";

    while(profile.length < 2500){
      if(phase === "accelerating"){
        const progress = Math.min(frame / spinSettings.accelerateFrames, 1);
        speed = spinSettings.startSpeed + (spinSettings.maxSpeed - spinSettings.startSpeed) * easeOutCubic(progress);

        if(progress >= 1){
          phase = "hold";
          frame = 0;
        }
      }else if(phase === "hold"){
        speed = spinSettings.maxSpeed;

        if(frame >= spinSettings.holdFrames){
          phase = "braking";
        }
      }else{
        speed *= spinSettings.brake;
      }

      profile.push(speed);
      frame++;

      if(phase === "braking" && speed <= spinSettings.stopSpeed){
        break;
      }
    }

    return profile;
  }

  function getTargetRotationFor(baseRotation){
    let bestRotation = targetFinalAngle;
    let bestDistance = Infinity;
    const minTurns = fastMode ? 1 : 4;

    for(let turns = minTurns; turns <= 14; turns++){
      const candidate = turns * 360 + targetFinalAngle;
      const distance = Math.abs(candidate - baseRotation);

      if(distance < bestDistance){
        bestRotation = candidate;
        bestDistance = distance;
      }
    }

    return bestRotation;
  }

  const spinProfile = buildSpinProfile();
  const baseRotation = spinProfile.reduce((sum, value) => sum + value, 0);
  const totalRotation = getTargetRotationFor(baseRotation);
  const speedScale = totalRotation / baseRotation;
  let frameIndex = 0;

  rotation = 0;
  rotator.style.transition = "none";
  rotator.style.transform = "rotate(0deg)";
  lastTickAngle = 0;

  function animate() {
    if(frameIndex < spinProfile.length){
      rotation += spinProfile[frameIndex] * speedScale;
      frameIndex++;

      if(frameIndex >= spinProfile.length){
        rotation = totalRotation;
      }

      playSpinTick();
      rotator.style.transform = `rotate(${rotation}deg)`;
      requestAnimationFrame(animate);
      return;
    }

    rotation = totalRotation;
    rotator.style.transform = `rotate(${rotation}deg)`;

    spinning = false;
    spinButton.disabled = false;
    spinButton.textContent = "⌃ Upgrade";

    checkWin(targetPointerAngle);

    // Nach dem Upgrade wieder auf Startposition unten setzen
    setTimeout(() => {
      rotation = 0;
      rotator.style.transition = "none";
      rotator.style.transform = "rotate(0deg)";
      lastTickAngle = 0;
    }, 300);
  }

  requestAnimationFrame(animate);
}
function checkWin(forcedPointerAngle = null){
  const finalAngle = ((rotation % 360) + 360) % 360;
  const pointerAngle = forcedPointerAngle === null
    ? (180 - finalAngle + 360) % 360
    : forcedPointerAngle;
  const won = isAngleInWinZone(pointerAngle);
  const inputSkinsSnapshot = selectedInputSkins.map(item => ({...item}));
  const targetSnapshot = selectedTargetSkin ? {...selectedTargetSkin} : null;
  const inputValueSnapshot = getInputValue();
  const chanceSnapshot = getCurrentChancePercent();

  selectedInputSkins.forEach(inputSkin => {
    mySkins = mySkins.filter(s => s !== inputSkin);
  });

  if(currentBalanceStake > 0){
    balance = Math.max(0, balance - currentBalanceStake);
  }

  if(won){
    const inputValueBeforeWin = getInputValue();
    const targetPrice = Number(selectedTargetSkin.price) || 0;
    const restValue = Math.max(0, inputValueBeforeWin - targetPrice);
    mySkins.push({...selectedTargetSkin});
    pushOwnUpgradeToFeed(selectedTargetSkin);
    if(restValue > 0){
      balance += restValue;
    }
    playWinSound();
    message.textContent = `UPGRADE! Du hast ${selectedTargetSkin.name} bekommen.${restValue > 0 ? ` Restwert ${restValue.toFixed(2)} ⌘ gutgeschrieben.` : ""}`;
    center.classList.add("win");
    selectedTargetSkin = null;
  }else{
    message.textContent = `FAILED! Einsatz-Skins sind weg. Ziel bleibt ausgewählt.`;
  }

  recordGameHistory(won, inputSkinsSnapshot, targetSnapshot, inputValueSnapshot, chanceSnapshot);

  selectedInputSkins = [];
  currentBalanceStake = 0;
  updateBalance();

  renderInventory();
  renderMarket();
  renderUpgradeFields();
  animateCircleTo(1.13);
}

function setBalance(){
  if(!moneyInput.value) moneyInput.value = "6";
  updateTopUpButtonText();
  moneyModal.classList.add("active");
  setTimeout(() => moneyInput.focus(), 0);
}

function formatCoins(value){
  return (Number(value) || 0).toLocaleString("de-DE", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}
function randomUserId(){ return String(Math.floor(100000 + Math.random() * 900000)); }
function publicUserState(){
  return {username: currentUser?.username || "Guest", id: currentUser?.id || "------", avatar: currentUser?.avatar || PROFILE_AVATARS[0], balance, mySkins, notificationItems, paymentHistoryItems, gameHistoryItems, itemHistoryItems, accountUpgradeCount, bestDropItem};
}
function applyUserState(user){
  currentUser = user || null;
  balance = Number(user?.balance || 0);
  mySkins = Array.isArray(user?.mySkins) ? user.mySkins : [];
  notificationItems = Array.isArray(user?.notificationItems) ? user.notificationItems : [];
  paymentHistoryItems = Array.isArray(user?.paymentHistoryItems) ? user.paymentHistoryItems : [];
  gameHistoryItems = Array.isArray(user?.gameHistoryItems) ? user.gameHistoryItems : [];
  itemHistoryItems = Array.isArray(user?.itemHistoryItems) ? user.itemHistoryItems : [];
  accountUpgradeCount = Number(user?.accountUpgradeCount || 0);
  bestDropItem = user?.bestDropItem || null;
  selectedInputSkins = []; selectedTargetSkin = null; currentBalanceStake = 0;
  updateBalance(); renderNotifications(); renderInventory(); renderMarket(); renderUpgradeFields(); updateProfileHeader(); renderProfile();
}
function saveLocalAccountStore(){ localStorage.setItem("upgraderAccountsFallback", JSON.stringify(accountStore)); }
async function loadAccountStore(){
  try{ const res = await fetch("/api/users", {cache:"no-store"}); if(res.ok) accountStore = await res.json(); }
  catch(e){ accountStore = JSON.parse(localStorage.getItem("upgraderAccountsFallback") || '{"users":[]}'); }
  if(!accountStore || !Array.isArray(accountStore.users)) accountStore = {users: []};
  const savedName = localStorage.getItem("upgraderCurrentUser");
  const user = accountStore.users.find(u => u.username === savedName);
  if(user) applyUserState(user); else updateProfileHeader();
}
async function saveAccountStore(){
  if(currentUser){ Object.assign(currentUser, publicUserState()); const idx = accountStore.users.findIndex(u => u.username === currentUser.username); if(idx >= 0) accountStore.users[idx] = currentUser; else accountStore.users.push(currentUser); }
  saveLocalAccountStore();
  try{ await fetch("/api/users", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(accountStore)}); }catch(e){}
}
function persistAccount(){ if(currentUser) saveAccountStore(); }
function updateProfileHeader(){
  const avatar = currentUser?.avatar || PROFILE_AVATARS[0];
  const headerAvatar = document.getElementById("headerAvatarImg");
  if(headerAvatar) headerAvatar.src = avatar;
  if(loginButton) loginButton.hidden = !!currentUser;
  if(profileButton) profileButton.hidden = false;
}
function showMainView(){
  viewingFakeProfile = null;
  document.body.classList.remove("profile-active");
  document.querySelector(".layout")?.removeAttribute("hidden");
  document.querySelector(".control-row")?.removeAttribute("hidden");
  document.querySelector(".skin-area")?.removeAttribute("hidden");
  document.querySelector(".hero-logo")?.removeAttribute("hidden");
  if(profileView) profileView.hidden = true;
  window.scrollTo({top: 0, behavior: "smooth"});
}
function showProfileView(){
  viewingFakeProfile = null;
  if(!currentUser){ openLoginModal("login"); return; }
  document.body.classList.add("profile-active");
  document.querySelector(".layout")?.setAttribute("hidden", "");
  document.querySelector(".control-row")?.setAttribute("hidden", "");
  document.querySelector(".skin-area")?.setAttribute("hidden", "");
  document.querySelector(".hero-logo")?.setAttribute("hidden", "");
  if(profileView) profileView.hidden = false;
  renderProfile();
  window.scrollTo({top: 0, behavior: "smooth"});
}
function openLoginModal(mode="login"){
  loginMode = mode;
  if(showLoginTab) showLoginTab.classList.toggle("active", mode === "login");
  if(showRegisterTab) showRegisterTab.classList.toggle("active", mode === "register");
  const title = document.getElementById("loginTitle");
  if(title) title.textContent = mode === "login" ? "Log in" : "Register";
  if(submitLoginButton) submitLoginButton.textContent = mode === "login" ? "Log in" : "Register";
  if(loginMessage) loginMessage.textContent = "";
  loginModal?.classList.add("active");
}
function closeLoginModal(){ loginModal?.classList.remove("active"); }
async function submitLogin(){
  const username = String(loginUsernameInput?.value || "").trim();
  const password = String(loginPasswordInput?.value || "");
  if(!username || !password){ if(loginMessage) loginMessage.textContent = "Username und Passwort eingeben."; return; }
  let user = accountStore.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if(loginMode === "register"){
    if(user){ if(loginMessage) loginMessage.textContent = "Username gibt es schon."; return; }
    user = {username, password, id: randomUserId(), avatar: PROFILE_AVATARS[0], balance:0, mySkins:[], notificationItems:[], paymentHistoryItems:[], gameHistoryItems:[], itemHistoryItems:[], accountUpgradeCount:0, bestDropItem:null};
    accountStore.users.push(user);
    saveLocalAccountStore();
    try{ await fetch("/api/users", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(accountStore)}); }catch(e){}
  }else{
    if(!user || user.password !== password){ if(loginMessage) loginMessage.textContent = "Login falsch."; return; }
  }
  localStorage.setItem("upgraderCurrentUser", user.username);
  closeLoginModal(); applyUserState(user); showProfileView();
}
function logout(){
  persistAccount(); localStorage.removeItem("upgraderCurrentUser"); currentUser = null;
  balance = 0; mySkins = []; notificationItems = []; paymentHistoryItems=[]; gameHistoryItems=[]; itemHistoryItems=[]; accountUpgradeCount=0; bestDropItem=null;
  updateBalance(); updateProfileHeader(); renderInventory(); renderMarket(); renderUpgradeFields(); showMainView();
}
function makeFakeProfileFromUpgrade(upgrade){
  const target = upgrade?.item || marketSkins[Math.floor(Math.random() * marketSkins.length)] || null;
  const price = Number(target?.price || 1);
  const chance = Number(upgrade?.chance || (8 + Math.random() * 70));
  const wins = Math.max(3, Math.round(18 + price * 5 + Math.random() * 80));
  const losses = Math.round(wins * (100 / Math.max(chance, 3) - 1) * (0.55 + Math.random() * 0.75));
  const upgradeCount = Math.max(wins + losses, Math.round(80 + price * 18 + Math.random() * 900));
  const pool = liveFeedPool().filter(Boolean);
  const inventoryCount = Math.min(18, Math.max(4, Math.round(3 + Math.log(price + 2) * 3 + Math.random() * 5)));
  const inv = [];
  for(let i=0;i<inventoryCount;i++){
    const base = i === 0 && target ? target : pool[Math.floor(Math.random() * pool.length)];
    if(base) inv.push({...base});
  }
  const games = [];
  for(let i=0;i<Math.min(24, upgradeCount);i++){
    const won = Math.random() < Math.max(.18, Math.min(.72, chance / 100));
    const input = pool[Math.floor(Math.random() * pool.length)] || target;
    const out = won ? (i === 0 && target ? target : pool[Math.floor(Math.random() * pool.length)] || target) : target;
    const inputValue = Math.max(.01, Number(out?.price || price) * (Number(upgrade?.chance || chance) / 100) * (.72 + Math.random() * .56));
    games.push({won, stamp:new Date(Date.now()-i*(18+Math.random()*220)*60000).toLocaleString("de-DE", {day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"}), input, target:out, inputValue, chance: Math.max(1, Math.min(94, chance + (Math.random()-.5)*24))});
  }
  const items = games.filter(g=>g.won && g.target).slice(0,18).map(g=>({...g.target, stamp:g.stamp}));
  const names = ["Shadow", "Niko", "Kenshi", "Maverick", "Ares", "Vortex", "Ranger", "Kyro", "Blaze", "Ghost", "Raptor", "Nova"];
  return {
    username: `${names[Math.floor(Math.random()*names.length)]}${Math.floor(10+Math.random()*990)}`,
    id: randomUserId(),
    avatar: PROFILE_AVATARS[Math.floor(Math.random()*PROFILE_AVATARS.length)],
    balance: Math.max(0, price * (.15 + Math.random() * 2.4)),
    mySkins: inv,
    gameHistoryItems: games,
    itemHistoryItems: items,
    accountUpgradeCount: upgradeCount,
    bestDropItem: target
  };
}
function showFakeProfileFromUpgrade(upgrade){
  viewingFakeProfile = makeFakeProfileFromUpgrade(upgrade);
  document.body.classList.add("profile-active");
  document.querySelector(".layout")?.setAttribute("hidden", "");
  document.querySelector(".control-row")?.setAttribute("hidden", "");
  document.querySelector(".skin-area")?.setAttribute("hidden", "");
  document.querySelector(".hero-logo")?.setAttribute("hidden", "");
  if(profileView) profileView.hidden = false;
  activeProfileTab = "games";
  renderProfile();
  window.scrollTo({top: 0, behavior: "smooth"});
}
function getVisibleProfileState(){
  return viewingFakeProfile || publicUserState();
}
function renderProfile(){
  if(!profileView || (!currentUser && !viewingFakeProfile)) return;
  const user = getVisibleProfileState();
  const isFake = !!viewingFakeProfile;
  document.getElementById("profileUsername").textContent = user.username;
  document.getElementById("profileUserId").textContent = `ID ${user.id}${isFake ? " · Live" : ""}`;
  document.getElementById("profileAvatarImg").src = user.avatar;
  document.getElementById("profileBalance").textContent = formatCoins(user.balance || 0);
  document.getElementById("profileUpgradeCount").textContent = Number(user.accountUpgradeCount || 0).toLocaleString("de-DE");
  const picker = document.getElementById("avatarPicker");
  if(picker){
    if(isFake){ picker.innerHTML = ""; }
    else { picker.innerHTML = PROFILE_AVATARS.map(src => `<button type="button" class="${src===user.avatar?'active':''}" data-avatar="${src}"><img src="${src}" alt="Avatar"></button>`).join(""); picker.querySelectorAll("button").forEach(btn => btn.onclick = () => { currentUser.avatar = btn.dataset.avatar; persistAccount(); updateProfileHeader(); renderProfile(); }); }
  }
  document.getElementById("logoutButton")?.classList.toggle("hidden-profile-control", isFake);
  document.getElementById("profileSettingsButton")?.classList.toggle("hidden-profile-control", isFake);
  document.getElementById("profileResetButton")?.classList.toggle("hidden-profile-control", isFake);
  document.getElementById("profileTopUpButton")?.classList.toggle("hidden-profile-control", isFake);
  document.querySelector(".coupon-row")?.classList.toggle("hidden-profile-control", isFake);
  const best = document.getElementById("bestDropCard");
  if(best){ if(user.bestDropItem){ best.innerHTML = `<h4>Best drop</h4><div class="best-drop-row"><div><strong>${skinDisplayName(user.bestDropItem)}</strong><span>${user.bestDropItem.wear || ''}</span><b>${formatCoins(user.bestDropItem.price)} ⌘</b></div><img src="${user.bestDropItem.image}" alt=""></div>`; } else best.innerHTML = `<h4>Best drop</h4><p>No upgrades yet</p>`; }
  renderProfileTab();
}
function renderProfileTab(){
  if(!profileTabContent) return;
  const user = getVisibleProfileState();
  const inv = Array.isArray(user.mySkins) ? user.mySkins : [];
  const items = Array.isArray(user.itemHistoryItems) ? user.itemHistoryItems : [];
  const games = Array.isArray(user.gameHistoryItems) ? user.gameHistoryItems : [];
  const isFake = !!viewingFakeProfile;
  document.querySelectorAll("[data-profile-tab]").forEach(btn => btn.classList.toggle("active", btn.dataset.profileTab === activeProfileTab));
  const sellAll = document.getElementById("profileSellAllButton"); if(sellAll) sellAll.style.display = activeProfileTab === "inventory" && !isFake ? "block" : "none";
  if(activeProfileTab === "inventory"){
    if(!inv.length){ profileTabContent.innerHTML = `<div class="profile-empty">You don't have any items yet</div>`; return; }
    profileTabContent.innerHTML = `<div class="profile-item-grid">${inv.map((item,i)=>`<div class="profile-item"><div class="profile-item-img" style="${skinStyle(item)}">${skinImageMarkup(item)}</div><strong>${skinDisplayName(item)}</strong><span>${item.wear || ''}</span><b>${formatCoins(item.price)} ⌘</b>${isFake ? "" : `<button data-sell-index="${i}" type="button">Sell</button>`}</div>`).join("")}</div>`;
    if(!isFake) profileTabContent.querySelectorAll("[data-sell-index]").forEach(btn => btn.onclick = () => sellProfileItem(Number(btn.dataset.sellIndex)));
  }else if(activeProfileTab === "items"){
    if(!items.length){ profileTabContent.innerHTML = `<div class="profile-empty">No won items yet</div>`; return; }
    profileTabContent.innerHTML = `<div class="history-list profile-item-grid">${items.map(item=>`<div class="profile-item"><div class="profile-item-img" style="${skinStyle(item)}">${skinImageMarkup(item)}</div><strong>${skinDisplayName(item)}</strong><span>${item.stamp || ''}</span><b>${formatCoins(item.price)} ⌘</b></div>`).join("")}</div>`;
  }else{
    if(!games.length){ profileTabContent.innerHTML = `<div class="profile-empty">No games yet</div>`; return; }
    profileTabContent.innerHTML = `<div class="game-history-grid">${games.map(g=>`<div class="game-card ${g.won?'won':'lost'}"><div class="game-skins"><div>${g.input?.image?`<img src="${g.input.image}" alt="">`:''}<small>Your bet</small><b>${formatCoins(g.inputValue)} ⌘</b></div><span>⌃</span><div>${g.target?.image?`<img src="${g.target.image}" alt="">`:''}<em>${g.won?'Win':'Lose'}</em><small>Chance</small><b>${Number(g.chance||0).toFixed(2)}%</b></div></div></div>`).join("")}</div>`;
  }
}
function resetMyProfile(){
  if(!currentUser || viewingFakeProfile) return;
  balance = 0; mySkins = []; selectedInputSkins = []; selectedTargetSkin = null; currentBalanceStake = 0;
  notificationItems = []; paymentHistoryItems = []; gameHistoryItems = []; itemHistoryItems = []; accountUpgradeCount = 0; bestDropItem = null;
  updateBalance(); renderInventory(); renderMarket(); renderUpgradeFields(); renderProfile(); persistAccount();
}
function sellProfileItem(index){ if(index < 0 || index >= mySkins.length) return; const item = mySkins.splice(index,1)[0]; balance += Number(item.price || 0); selectedInputSkins = selectedInputSkins.filter(s => s !== item); updateBalance(); renderInventory(); renderMarket(); renderUpgradeFields(); renderProfile(); persistAccount(); }
function sellAllProfileItems(){ const total = getInventoryValue(); balance += total; mySkins = []; selectedInputSkins = []; updateBalance(); renderInventory(); renderMarket(); renderUpgradeFields(); renderProfile(); persistAccount(); }
function recordGameHistory(won, inputSkinsSnapshot, targetSnapshot, inputValue, chanceValue){
  accountUpgradeCount += 1;
  const stamp = new Date().toLocaleString("de-DE", {day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"});
  const entry = {won, stamp, input: inputSkinsSnapshot[0] || null, target: targetSnapshot, inputValue, chance: chanceValue};
  gameHistoryItems.unshift(entry); gameHistoryItems = gameHistoryItems.slice(0, 100);
  if(won && targetSnapshot){ itemHistoryItems.unshift({...targetSnapshot, stamp}); itemHistoryItems = itemHistoryItems.slice(0, 100); if(!bestDropItem || Number(targetSnapshot.price || 0) > Number(bestDropItem.price || 0)) bestDropItem = {...targetSnapshot}; }
  persistAccount();
}
function openPaymentHistory(){
  const modal = document.getElementById("paymentHistoryModal"); const list = document.getElementById("paymentHistoryList");
  if(list){ const items = paymentHistoryItems.length ? paymentHistoryItems : notificationItems; list.innerHTML = items.length ? items.map(item => `<div class="payment-row"><small>${item.stamp || ''}</small><strong>${item.title || 'Top up'}</strong><p>${item.text || ''}</p></div>`).join("") : `<div class="payment-row"><strong>No payments yet</strong><p>Your top ups will appear here.</p></div>`; }
  modal?.classList.add("active");
}
function installProfileEvents(){
  if(brandHomeButton) brandHomeButton.addEventListener("click", showMainView);
  if(profileButton) profileButton.addEventListener("click", showProfileView);
  if(loginButton) loginButton.addEventListener("click", () => openLoginModal("login"));
  if(closeLoginButton) closeLoginButton.addEventListener("click", closeLoginModal);
  if(showLoginTab) showLoginTab.addEventListener("click", () => openLoginModal("login"));
  if(showRegisterTab) showRegisterTab.addEventListener("click", () => openLoginModal("register"));
  if(submitLoginButton) submitLoginButton.addEventListener("click", submitLogin);
  if(loginModal) loginModal.addEventListener("click", e => { if(e.target === loginModal) closeLoginModal(); });
  document.getElementById("logoutButton")?.addEventListener("click", logout);
  document.getElementById("profileSettingsButton")?.addEventListener("click", openUpgradeSettings);
  document.getElementById("profileResetButton")?.addEventListener("click", resetMyProfile);
  document.getElementById("profileTopUpButton")?.addEventListener("click", setBalance);
  document.getElementById("paymentHistoryButton")?.addEventListener("click", openPaymentHistory);
  document.getElementById("closePaymentHistoryButton")?.addEventListener("click", () => document.getElementById("paymentHistoryModal")?.classList.remove("active"));
  document.getElementById("paymentHistoryModal")?.addEventListener("click", e => { if(e.target.id === "paymentHistoryModal") e.currentTarget.classList.remove("active"); });
  document.getElementById("profileCouponApply")?.addEventListener("click", () => { const v = document.getElementById("profileCouponInput")?.value || ""; if(promoInput) promoInput.value = v; updateTopUpButtonText(); });
  document.getElementById("profileSellAllButton")?.addEventListener("click", sellAllProfileItems);
  document.querySelectorAll("[data-profile-tab]").forEach(btn => btn.addEventListener("click", () => { activeProfileTab = btn.dataset.profileTab; renderProfileTab(); }));
}

installProfileEvents();
loadAccountStore();
renderQuickButtons();

quickButtons.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if(!btn) return;

  if(btn.classList.contains("settings-button")){
    openUpgradeSettings();
    return;
  }

  if(btn.dataset.multi){
    setMultiplier(Number(btn.dataset.multi));
  }

  if(btn.dataset.percent){
    setPercent(Number(btn.dataset.percent));
  }
});

saveUpgradeSettingsButton.addEventListener("click", applyUpgradeSettings);
closeUpgradeSettingsButton.addEventListener("click", closeUpgradeSettings);
resetUpgradeSettingsButton.addEventListener("click", () => {
  upgradeSettings = {
    multipliers: [...DEFAULT_UPGRADE_SETTINGS.multipliers],
    percents: [...DEFAULT_UPGRADE_SETTINGS.percents]
  };
  saveUpgradeSettings();
  
  renderQuickButtons();
  closeUpgradeSettings();
  message.textContent = "Upgrade-Einstellungen zurückgesetzt.";
});

upgradeSettingsModal.addEventListener("click", (event) => {
  if(event.target === upgradeSettingsModal){
    closeUpgradeSettings();
  }
});

saveMoneyButton.addEventListener("click", () => {
  const value = getTopUpEuroValue();

  if(isNaN(value) || value < 2){
    alert("Gültigen Top Up Betrag ab 2 € eingeben.");
    return;
  }

  const points = getTopUpPoints();
  const bundle = createTopUpBundle(points / EURO_TO_COINS);

  if(bundle.skins.length === 0){
    balance += points;
  }else{
    mySkins.push(...bundle.skins);
    const rest = Math.max(0, points - bundle.totalValue);
    balance += rest;
  }

  addDepositNotification(value, points);
  updateBalance();
  renderInventory();
  renderMarket();
  renderUpgradeFields();
  moneyModal.classList.remove("active");
  renderProfile();

  message.textContent = `Top Up: ${value.toFixed(2)} € = ${points.toFixed(0)} ⌘${hasPromoDiscount() ? " mit JOSCHA10" : ""}. ${bundle.skins.length} Skins erhalten, Restguthaben wurde gutgeschrieben.`;
});

closeMoneyButton.addEventListener("click", () => {
  moneyModal.classList.remove("active");
});

moneyModal.addEventListener("click", e => {
  if(e.target === moneyModal){
    moneyModal.classList.remove("active");
  }
});

if(secretSegmentButton){
  const secretLabels = ["Normal", "Lucky", "Perfect", "Unlucky"];
  secretSegmentButton.addEventListener("click", () => {
    if(spinning) return;
    secretMode = (secretMode + 1) % 4;
    forceSecretSegment500 = secretMode === 2;
    secretSegmentButton.dataset.mode = String(secretMode);
    secretSegmentButton.title = `Secret: ${secretLabels[secretMode]}`;
    message.textContent = `Secret-Modus: ${secretLabels[secretMode]}`;
  });
  secretSegmentButton.dataset.mode = "0";
}

if(balanceStakeSlider){
  balanceStakeSlider.addEventListener("input", () => {
    currentBalanceStake = Number(balanceStakeSlider.value) || 0;
    clampBalanceStake();
    updateBalanceStakeUI();

    if(selectedTargetSkin){
      if(isValidUpgradeTarget(selectedTargetSkin, getInputValue())){
        animateCircleTo(getCurrentChancePercent());
      }else{
        autoSelectDefaultTarget();
      }
    }else if(selectedInputSkins.length){
      autoSelectDefaultTarget();
    }

    renderUpgradeFields();
    renderMarket();
  });
}

spinButton.addEventListener("click", spin);
topUpButton.addEventListener("click", setBalance);
fastModeButton.addEventListener("click", () => {
  if(spinning) return;
  fastMode = !fastMode;
  updateFastModeButton();
  message.textContent = fastMode ? "Fast Mode ist an." : "Fast Mode ist aus.";
});



if(topSettingsButton) topSettingsButton.addEventListener("click", openUpgradeSettings);
if(soundToggleButton) soundToggleButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem("upgradeSoundEnabled", String(soundEnabled));
  updateSoundButton();
});
document.querySelectorAll('input[name="soundSetting"]').forEach(input => input.addEventListener("change", () => {
  soundEnabled = input.value === "enabled";
  localStorage.setItem("upgradeSoundEnabled", String(soundEnabled));
  updateSoundButton();
}));
document.querySelectorAll('input[name="scrollSetting"]').forEach(input => input.addEventListener("change", () => {
  fastMode = input.value === "fast";
  updateFastModeButton();
}));
if(notificationsButton) notificationsButton.addEventListener("click", (event) => {
  event.stopPropagation();
  notificationsPanel?.classList.toggle("active");
});
document.addEventListener("click", (event) => {
  if(notificationsPanel && !notificationsPanel.contains(event.target) && event.target !== notificationsButton){
    notificationsPanel.classList.remove("active");
  }
  if(currencyDropdown && !currencyDropdown.contains(event.target) && event.target !== currencyButton){
    currencyDropdown.classList.remove("active");
  }
});
if(currencyButton) currencyButton.addEventListener("click", (event) => {
  event.stopPropagation();
  currencyDropdown?.classList.toggle("active");
});
if(currencyDropdown) currencyDropdown.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-currency]");
  if(!btn) return;
  selectedCurrency = btn.dataset.currency;
  currencyButton.textContent = `${selectedCurrency}⌄`;
  currencyDropdown.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
  currencyDropdown.classList.remove("active");
});
document.querySelectorAll(".quick-euros button").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".quick-euros button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  moneyInput.value = String(parseFloat(btn.textContent));
  updateTopUpButtonText();
}));
if(moneyInput) moneyInput.addEventListener("input", updateTopUpButtonText);
if(promoInput) promoInput.addEventListener("input", updateTopUpButtonText);
if(applyPromoButton) applyPromoButton.addEventListener("click", updateTopUpButtonText);
renderNotifications();
updateTopUpButtonText();
updateSoundButton();
startLiveCounters();
scheduleLiveFeed();

updateBalance();
updateInventoryValue();
updateFastModeButton();
renderInventory();
renderMarket();
renderUpgradeFields();
drawCircle(1.13);
/* PNG symbol replacement — visual only. Keeps all existing functions and logic unchanged. */
(function installPngSymbolReplacement(){
  const ICONS = {
    "⌘": { src: "assets/coins.png", className: "coin-icon", alt: "coins" },
    "⌃": { src: "assets/up-arrow-counter.png", className: "up-arrow-icon", alt: "up" }
  };
  const symbolPattern = /[⌘⌃]/;
  let observer = null;
  let running = false;

  function isIgnoredNode(node){
    if(!node || !node.parentElement) return true;
    const parent = node.parentElement;
    return parent.closest("script, style, textarea, input, option, select, .png-symbol-processed") || parent.classList.contains("png-symbol-icon");
  }

  function replaceTextNode(textNode){
    const text = textNode.nodeValue;
    if(!text || !symbolPattern.test(text) || isIgnoredNode(textNode)) return;

    const frag = document.createDocumentFragment();
    let buffer = "";

    for(const char of text){
      if(ICONS[char]){
        if(buffer){
          frag.appendChild(document.createTextNode(buffer));
          buffer = "";
        }
        const img = document.createElement("img");
        img.src = ICONS[char].src;
        img.alt = ICONS[char].alt;
        img.className = "png-symbol-icon " + ICONS[char].className;
        img.decoding = "async";
        img.loading = "eager";
        frag.appendChild(img);
      }else{
        buffer += char;
      }
    }
    if(buffer) frag.appendChild(document.createTextNode(buffer));
    textNode.parentNode.replaceChild(frag, textNode);
  }

  function scan(root){
    if(running) return;
    running = true;
    try{
      const start = root && root.nodeType ? root : document.body;
      if(!start) return;
      if(start.nodeType === Node.TEXT_NODE){
        replaceTextNode(start);
        return;
      }
      const walker = document.createTreeWalker(start, NodeFilter.SHOW_TEXT, {
        acceptNode(node){
          return node.nodeValue && symbolPattern.test(node.nodeValue) && !isIgnoredNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      });
      const nodes = [];
      while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(replaceTextNode);
    }finally{
      running = false;
    }
  }

  function start(){
    scan(document.body);
    if(observer) observer.disconnect();
    observer = new MutationObserver((mutations)=>{
      for(const mutation of mutations){
        mutation.addedNodes.forEach((node)=>scan(node));
        if(mutation.type === "characterData") scan(mutation.target);
      }
    });
    observer.observe(document.body, { childList:true, subtree:true, characterData:true });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
