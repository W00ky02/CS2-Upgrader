// Skin-Daten werden aus skin-image-data.js geladen. Keine lokalen PNG-Dateien nötig.
// Preis-Skalierung: 1 EUR = 80 Coins. Die Preise sind Richtwerte, keine Live-Marktpreise.

function normalizeSkinLookupName(name) {
    return String(name || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/★/g, "")
        .replace(/StatTrak™/gi, "")
        .replace(/™/g, "")
        .replace(/\s*\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)\s*$/i, "")
        .replace(/\|/g, " ")
        .replace(/'/g, "")
        .replace(/[^a-z0-9]+/gi, " ")
        .trim()
        .toLowerCase();
}

function getSkinModel(name) {
    const lower = String(name || "").toLowerCase();
    if (lower.includes("gloves") || lower.includes("hand wraps") || lower.includes("knife") || lower.includes("karambit") || lower.includes("bayonet") || lower.includes("talon") || lower.includes("butterfly") || lower.includes("bowie") || lower.includes("gut") || lower.includes("skeleton") || lower.includes("navaja") || lower.includes("nomad") || lower.includes("paracord") || lower.includes("stiletto") || lower.includes("survival") || lower.includes("ursus") || lower.includes("kukri") || lower.includes("daggers")) return "knife";
    if (lower.includes("awp") || lower.includes("ssg")) return "sniper";
    if (lower.includes("glock") || lower.includes("usp") || lower.includes("p250") || lower.includes("deagle") || lower.includes("desert")) return "pistol";
    if (lower.includes("mp7") || lower.includes("mp9") || lower.includes("mac-10") || lower.includes("p90")) return "smg";
    return "rifle";
}

function rarityColor(rarityClass, fallback) {
    const colors = {
        consumer: "#b8b8b8",
        milspec: "#4b8cff",
        restricted: "#7b61ff",
        classified: "#d946ef",
        covert: "#ff3b3b",
        contraband: "#ff8c00",
        knife: "#fbd506"
    };
    return colors[rarityClass] || fallback || "#b8b8b8";
}

function skinFromJson(entry) {
    if (!entry || !entry.image || !entry.name) return null;
    const model = getSkinModel(entry.name);
    const rarityClass = entry.rarityClass || (model === "knife" ? "knife" : "consumer");
    const main = rarityColor(rarityClass, entry.color);
    return {
        name: entry.name,
        price: Number(entry.price || 0),
        color: `linear-gradient(135deg,${main},#111111)`,
        main,
        dark: "#111111",
        model,
        image: entry.image,
        rarity: entry.rarity || "Consumer Grade",
        rarityClass
    };
}

function cleanSkins(items) {
    const seen = new Set();
    return items.filter(item => {
        if (!item || seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
    });
}

const WEAR_VARIANTS = [
    { code: "FN", label: "Factory New", multiplier: 1.00 },
    { code: "MW", label: "Minimal Wear", multiplier: 0.82 },
    { code: "FT", label: "Field-Tested", multiplier: 0.62 },
    { code: "WW", label: "Well-Worn", multiplier: 0.48 },
    { code: "BS", label: "Battle-Scarred", multiplier: 0.40 }
];

function supportsWear(item) {
    const text = `${item?.name || ""} ${item?.rarity || ""}`.toLowerCase();
    if (!item || !Number.isFinite(item.price) || item.price <= 0) return false;
    return !/(sticker|patch|graffiti|music kit|capsule|case|key|pin|coin|viewer pass|service medal|charm)/i.test(text);
}

function wearPrice(basePrice, variant) {
    const raw = Number(basePrice || 0) * variant.multiplier;
    return Math.max(0.01, Math.round(raw * 100) / 100);
}

function statTrakPrice(basePrice, variant) {
    // StatTrak™ ist absichtlich etwas teurer als die normale Variante.
    return Math.max(0.01, Math.round(wearPrice(basePrice, variant) * 1.35 * 100) / 100);
}

function supportsStatTrakVariant(variant) {
    // Gewünscht: Nur Factory New und Minimal Wear dürfen StatTrak™ sein.
    return variant && (variant.code === "FN" || variant.code === "MW");
}

function makeWearVariant(item, variant, isStatTrak) {
    const statTrakPrefix = isStatTrak ? "StatTrak™ " : "";
    return {
        ...item,
        baseName: item.name,
        name: `${statTrakPrefix}${item.name} (${variant.code})`,
        displayName: `${statTrakPrefix}${item.name}`,
        wear: variant.code,
        wearLabel: variant.label,
        isStatTrak: !!isStatTrak,
        price: isStatTrak ? statTrakPrice(item.price, variant) : wearPrice(item.price, variant)
    };
}

function expandWearVariants(items) {
    const expanded = [];
    items.forEach(item => {
        if (!item) return;
        if (!supportsWear(item)) {
            expanded.push({ ...item, wear: "", wearLabel: "", baseName: item.name, isStatTrak: false });
            return;
        }
        WEAR_VARIANTS.forEach(variant => {
            expanded.push(makeWearVariant(item, variant, false));
            if (supportsStatTrakVariant(variant)) {
                expanded.push(makeWearVariant(item, variant, true));
            }
        });
    });
    return expanded;
}

let mySkins = [];
let marketSkins = cleanSkins(
    expandWearVariants(
        Object.values(typeof SKIN_IMAGE_DATA === "object" && SKIN_IMAGE_DATA ? SKIN_IMAGE_DATA : {})
            .map(skinFromJson)
            .filter(Boolean)
    ).sort((a, b) => a.price - b.price)
);
