// ============================================================================
// APPLICATION PRINCIPALE : MENU SEMAINE & PANIER DE COURSES
// ============================================================================

const STORAGE_KEYS = {
  CURRENT_WEEK: 'menusemaine_current_week_v4',
  WEEK_START_DATE: 'menusemaine_week_start_date_v2',
  STOCK_STATE: 'menusemaine_stock_state_v1',
  CUSTOM_ITEMS: 'menusemaine_custom_items_v1',
  FAVORITES: 'menusemaine_favorites_v1',
  HISTORY: 'menusemaine_history_v1',
  CUSTOM_RECIPES: 'menusemaine_custom_recipes_v1',
  SEEN_RECIPES: 'menusemaine_seen_recipes_365_v1',
  GEMINI_KEY: 'menusemaine_gemini_api_key_v1',
  PANTRY_ITEMS: 'menusemaine_pantry_items_v1',
  PANTRY_SERVINGS: 'menusemaine_pantry_servings_v1',
  PANTRY_DEDUCT_MODE: 'menusemaine_pantry_deduct_v1'
};

// 14 repas : 5 Déjeuners + 5 Dîners en semaine (Lundi à Vendredi) & 2 Déjeuners + 2 Dîners le week-end
// Trois types de repas disponibles sur chaque créneau (semaine & week-end) :
// - 'balanced' (Équilibré) : menus sains, simples et rapides à réaliser
// - 'pleasure' (Plaisir)   : menus pour se faire plaisir même si moins équilibrés, simples et rapides à réaliser
// - 'gourmet'  (Gourmet)   : ingrédients plus nobles et délicats, recette simple à réaliser + suggestion de vin
const SLOTS_DEFINITION = [
  { id: 'mon-lunch',  day: 'Lundi',    dayOffset: 0, mealLabel: 'Déjeuner', isWeekend: false, defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'mon-dinner', day: 'Lundi',    dayOffset: 0, mealLabel: 'Dîner',    isWeekend: false, defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'tue-lunch',  day: 'Mardi',    dayOffset: 1, mealLabel: 'Déjeuner', isWeekend: false, defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'tue-dinner', day: 'Mardi',    dayOffset: 1, mealLabel: 'Dîner',    isWeekend: false, defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'wed-lunch',  day: 'Mercredi', dayOffset: 2, mealLabel: 'Déjeuner', isWeekend: false, defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'wed-dinner', day: 'Mercredi', dayOffset: 2, mealLabel: 'Dîner',    isWeekend: false, defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'thu-lunch',  day: 'Jeudi',    dayOffset: 3, mealLabel: 'Déjeuner', isWeekend: false, defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'thu-dinner', day: 'Jeudi',    dayOffset: 3, mealLabel: 'Dîner',    isWeekend: false, defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'fri-lunch',  day: 'Vendredi', dayOffset: 4, mealLabel: 'Déjeuner', isWeekend: false, defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'fri-dinner', day: 'Vendredi', dayOffset: 4, mealLabel: 'Dîner',    isWeekend: false, defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'sat-lunch',  day: 'Samedi',   dayOffset: 5, mealLabel: 'Déjeuner', isWeekend: true,  defaultStyle: 'balanced', defaultPleasure: false },
  { id: 'sat-dinner', day: 'Samedi',   dayOffset: 5, mealLabel: 'Dîner',    isWeekend: true,  defaultStyle: 'gourmet',  defaultPleasure: false },
  { id: 'sun-lunch',  day: 'Dimanche', dayOffset: 6, mealLabel: 'Déjeuner', isWeekend: true,  defaultStyle: 'pleasure', defaultPleasure: true  },
  { id: 'sun-dinner', day: 'Dimanche', dayOffset: 6, mealLabel: 'Dîner',    isWeekend: true,  defaultStyle: 'balanced', defaultPleasure: false }
];

function getSlotStyle(slot) {
  if (!slot) return 'balanced';
  if (slot.mealStyle === 'balanced' || slot.mealStyle === 'pleasure' || slot.mealStyle === 'gourmet') {
    return slot.mealStyle;
  }
  if (slot.isGourmet) return 'gourmet';
  if (slot.isPleasure) return 'pleasure';
  return 'balanced';
}

function syncSlotStyleFlags(slot, styleOverride) {
  if (!slot) return;
  const style = styleOverride || getSlotStyle(slot);
  slot.mealStyle = style;
  slot.isPleasure = style === 'pleasure';
  slot.isGourmet = style === 'gourmet';
}

let state = {
  weekStartDate: '',      // Format YYYY-MM-DD (toujours calé sur un Lundi)
  selectedDayOffset: 0,   // 0 = Lundi ... 6 = Dimanche (pour la vue 1 page par journée)
  plannerViewMode: 'day', // 'day' (1 page par journée : Déjeuner + Dîner) ou 'week' (toute la semaine)
  slots: [],              // Les 14 créneaux de la semaine (avec active: true/false pour comptabiliser ou supprimer)
  inStockKeys: {},        // { "nom_ingredient|unite": true } si décoché (déjà en stock)
  customItems: [],        // [{ id, name, qty, aisle, inStock }]
  favorites: [],          // [recipeId, ...]
  history: [],            // [{ id, dateLabel, weekStartDate, slots }]
  customRecipes: [],      // Recettes ajoutées via IA ou manuellement
  pantryItems: [],        // [{ id, name, qty, unit, zone: 'fridge' | 'cupboard', aisle }]
  pantryServings: 2,      // Nombre de parts pour les menus du garde-manger
  pantryZoneFilter: 'all',// 'all' | 'fridge' | 'cupboard'
  pantryStyleFilter: 'all', // 'all' | 'balanced' | 'pleasure' | 'gourmet'
  pantryMenuOffset: 0,    // Index de rotation pour le bouton "Autre idée"
  pantryCardOffsets: {},  // { cardIdx: extraOffset }
  pantryCardServings: {}, // { recipeId: servings }
  deductPantryFromShopping: true // Ajuster automatiquement la liste des courses avec le stock frigo/placard
};

let deferredPwaPrompt = null;

// ============================================================================
// GESTION DES DATES (LUNDI + NUMÉRO JOUR + ANNÉE EN COURS)
// ============================================================================
function toIsoDateString(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseIsoLocal(isoStr) {
  if (!isoStr) return new Date();
  const parts = isoStr.split('-').map(Number);
  if (parts.length !== 3) return new Date();
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
}

function getMondayOfDate(inputDate) {
  const d = typeof inputDate === 'string' ? parseIsoLocal(inputDate) : new Date(inputDate);
  const day = d.getDay(); // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toIsoDateString(d);
}

function getDefaultUpcomingMonday() {
  const now = new Date();
  const day = now.getDay();
  if (day === 6) {
    now.setDate(now.getDate() + 2);
    return toIsoDateString(now);
  }
  if (day === 0) {
    now.setDate(now.getDate() + 1);
    return toIsoDateString(now);
  }
  return getMondayOfDate(now);
}

function addDaysToIso(isoStr, daysToAdd) {
  const d = parseIsoLocal(isoStr);
  d.setDate(d.getDate() + daysToAdd);
  return d;
}

// Ex: "Lundi 19 octobre 2026"
function formatMondayFullLabel(isoMonday) {
  const d = parseIsoLocal(isoMonday);
  const dayNum = d.getDate();
  const monthName = d.toLocaleDateString('fr-FR', { month: 'long' });
  const year = d.getFullYear();
  return `Lundi ${dayNum} ${monthName} ${year}`;
}

// Ex pour l'en-tête d'une journée : "Lundi 19 octobre 2026"
function formatFullDayTitle(dayName, dayOffset) {
  const d = addDaysToIso(state.weekStartDate, dayOffset);
  const dayNum = d.getDate();
  const monthName = d.toLocaleDateString('fr-FR', { month: 'long' });
  const year = d.getFullYear();
  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

// Ex pour une carte : "Lundi 19 oct. 2026"
function formatSlotDayHeader(slot) {
  const def = SLOTS_DEFINITION.find((x) => x.id === slot.slotId);
  const offset = typeof slot.dayOffset === 'number' ? slot.dayOffset : (def ? def.dayOffset : 0);
  const d = addDaysToIso(state.weekStartDate, offset);
  const dayNum = d.getDate();
  const monthShort = d.toLocaleDateString('fr-FR', { month: 'short' });
  const year = d.getFullYear();
  return `${slot.day} ${dayNum} ${monthShort} ${year}`;
}

function handleWeekStartDateChange(newDateValue) {
  if (!newDateValue) return;
  const mondayIso = getMondayOfDate(newDateValue);
  state.weekStartDate = mondayIso;
  saveStateToStorage();
  renderAll();
  showToast(`Début de semaine fixé au ${formatMondayFullLabel(mondayIso)}`);
}

function shiftWeekStart(daysDelta) {
  const d = addDaysToIso(state.weekStartDate, daysDelta);
  state.weekStartDate = getMondayOfDate(d);
  saveStateToStorage();
  renderAll();
  showToast(`Semaine du ${formatMondayFullLabel(state.weekStartDate)}`);
}

// ============================================================================
// INITIALISATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  applyAppConfigAndAccessControl();
  loadStateFromStorage();
  mergeCustomRecipesIntoCatalog();

  if (!state.weekStartDate) {
    state.weekStartDate = getDefaultUpcomingMonday();
  }

  if (!state.slots || state.slots.length !== SLOTS_DEFINITION.length) {
    generateFullWeekPlan();
  } else {
    state.slots.forEach((slot) => {
      const def = SLOTS_DEFINITION.find((d) => d.id === slot.slotId);
      if (def && typeof slot.dayOffset !== 'number') {
        slot.dayOffset = def.dayOffset;
      }
      if (typeof slot.active !== 'boolean') {
        slot.active = true;
      }
      const recipe = findRecipeById(slot.recipeId);
      if (!slot.mealStyle) {
        if (recipe && recipe.type === 'gourmet') {
          syncSlotStyleFlags(slot, 'gourmet');
        } else if (slot.isPleasure || (recipe && recipe.type === 'weekend-pleasure')) {
          syncSlotStyleFlags(slot, 'pleasure');
        } else {
          syncSlotStyleFlags(slot, 'balanced');
        }
      } else {
        syncSlotStyleFlags(slot, slot.mealStyle);
      }

      // S'assurer que les plats non validés proposés ont un maximum d'ingrédients de saison (>= 85%)
      if (!slot.validated && recipe) {
        const seas = getRecipeSeasonality(recipe, slot);
        if (seas.pct < 85) {
          const usedIds = new Set(state.slots.map((s) => s.recipeId));
          const pool = getPoolForSlot(slot);
          const upgraded = pickRandomAvoiding(pool, usedIds, getSlotMonthNum(slot));
          if (upgraded && upgraded.id) {
            slot.recipeId = upgraded.id;
          }
        }
      }
    });
    saveStateToStorage();
  }

  renderAll();
  setupPwaSupport();
  setupDaySwipeGestures();
});

function setupDaySwipeGestures() {
  const plannerEl = document.getElementById('view-planner');
  if (!plannerEl) return;

  let startX = 0;
  let startY = 0;
  let ignoreSwipe = false;

  plannerEl.addEventListener(
    'touchstart',
    (e) => {
      if (state.plannerViewMode !== 'day') return;
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.closest('.servings-control') || target.closest('.day-global-servings'))) {
        ignoreSwipe = true;
        return;
      }
      ignoreSwipe = false;
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    },
    { passive: true }
  );

  plannerEl.addEventListener(
    'touchend',
    (e) => {
      if (ignoreSwipe || state.plannerViewMode !== 'day') return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      // Glissement horizontal franc (> 75px) et plus horizontal que vertical
      if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        if (dx < 0 && state.selectedDayOffset < 6) {
          stepPlannerDay(1);
        } else if (dx > 0 && state.selectedDayOffset > 0) {
          stepPlannerDay(-1);
        }
      }
    },
    { passive: true }
  );
}

function applyAppConfigAndAccessControl() {
  const cfg = window.APP_CONFIG || {};
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

  // Afficher le bouton Admin uniquement en local
  const adminBtn = document.getElementById('local-admin-btn');
  if (adminBtn && isLocal) {
    adminBtn.style.display = 'inline-flex';
  }

  // Mettre à jour les informations de la section À propos
  const aboutNameEl = document.getElementById('about-app-name');
  if (aboutNameEl && cfg.appName) {
    aboutNameEl.textContent = cfg.appName;
  }
  const aboutVersionEl = document.getElementById('about-app-version');
  if (aboutVersionEl) {
    const ver = cfg.version || '1.5.0';
    const updated = cfg.lastUpdated ? ` • Mis à jour le ${cfg.lastUpdated}` : '';
    aboutVersionEl.textContent = `Version ${ver}${updated} • Application Web Progressive (PWA) 100% Hors-ligne`;
  }

  // Afficher le bandeau d'annonce éventuel configuré par l'administrateur
  if (cfg.announcement && cfg.announcement.trim()) {
    const mainEl = document.querySelector('.main-container');
    if (mainEl && !document.getElementById('admin-announcement-bar')) {
      const banner = document.createElement('div');
      banner.id = 'admin-announcement-bar';
      banner.className = 'card-panel';
      banner.style.cssText =
        'margin-bottom: 16px; padding: 12px 16px; background: #eff6ff; border-color: #93c5fd; color: #1e3a8a; font-weight: 700; font-size: 0.9rem;';
      banner.textContent = `📢 Info : ${cfg.announcement}`;
      mainEl.prepend(banner);
    }
  }

  // Vérification du code d'accès invité sur le serveur PaaS (si activé par l'admin)
  if (cfg.requireAccessCode && cfg.accessCode && !isLocal) {
    const storedCode = localStorage.getItem('menusemaine_guest_access_v1');
    if (storedCode !== cfg.accessCode) {
      const entered = prompt(
        `🔒 Application privée (${cfg.appName || 'MenuSemaine'}).\nVeuillez saisir le code d'accès invité communiqué par l'administrateur :`
      );
      if (entered && entered.trim() === cfg.accessCode) {
        localStorage.setItem('menusemaine_guest_access_v1', cfg.accessCode);
      } else {
        document.body.innerHTML = `
          <div style="max-width:440px;margin:80px auto;padding:24px;background:#fff;border-radius:16px;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
            <h2>🔒 Accès réservé aux invités</h2>
            <p style="margin:12px 0;color:#64748b;">Code d'accès invalide. Demandez votre lien et code d'invitation à l'administrateur.</p>
            <button onclick="location.reload()" style="padding:10px 18px;border:none;border-radius:8px;background:#059669;color:#fff;font-weight:700;cursor:pointer;">Réessayer</button>
          </div>
        `;
      }
    }
  }
}

function loadStateFromStorage() {
  try {
    const savedStart = localStorage.getItem(STORAGE_KEYS.WEEK_START_DATE);
    if (savedStart) state.weekStartDate = savedStart;

    const savedWeek = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK);
    if (savedWeek) state.slots = JSON.parse(savedWeek);

    const savedStock = localStorage.getItem(STORAGE_KEYS.STOCK_STATE);
    if (savedStock) state.inStockKeys = JSON.parse(savedStock);

    const savedCustomItems = localStorage.getItem(STORAGE_KEYS.CUSTOM_ITEMS);
    if (savedCustomItems) state.customItems = JSON.parse(savedCustomItems);

    const savedFavs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (savedFavs) state.favorites = JSON.parse(savedFavs);

    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) state.history = JSON.parse(savedHistory);

    const savedCustomRecipes = localStorage.getItem(STORAGE_KEYS.CUSTOM_RECIPES);
    if (savedCustomRecipes) state.customRecipes = JSON.parse(savedCustomRecipes);

    const savedPantry = localStorage.getItem(STORAGE_KEYS.PANTRY_ITEMS);
    if (savedPantry) {
      const parsedPantry = JSON.parse(savedPantry);
      if (Array.isArray(parsedPantry)) state.pantryItems = parsedPantry;
    }

    const savedPantryServings = localStorage.getItem(STORAGE_KEYS.PANTRY_SERVINGS);
    if (savedPantryServings) {
      const sNum = parseInt(savedPantryServings, 10);
      if (!isNaN(sNum) && sNum >= 1 && sNum <= 16) state.pantryServings = sNum;
    }

    const savedDeductMode = localStorage.getItem(STORAGE_KEYS.PANTRY_DEDUCT_MODE);
    if (savedDeductMode !== null) {
      state.deductPantryFromShopping = savedDeductMode === 'true';
    }

    const savedSeen = localStorage.getItem(STORAGE_KEYS.SEEN_RECIPES);
    if (savedSeen) {
      const parsedSeen = JSON.parse(savedSeen);
      if (Array.isArray(parsedSeen)) {
        parsedSeen.forEach((id) => recentSeenIds.add(id));
      }
    }

    const savedKey = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY);
    if (savedKey) {
      const keyInput = document.getElementById('gemini-api-key');
      if (keyInput) keyInput.value = savedKey;
      const pantryKeyInput = document.getElementById('pantry-gemini-key-input');
      if (pantryKeyInput) pantryKeyInput.value = savedKey;
    }
  } catch (e) {
    console.error('Erreur chargement localStorage :', e);
  }
}

function saveStateToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEK_START_DATE, state.weekStartDate);
    localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK, JSON.stringify(state.slots));
    localStorage.setItem(STORAGE_KEYS.STOCK_STATE, JSON.stringify(state.inStockKeys));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ITEMS, JSON.stringify(state.customItems));
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_RECIPES, JSON.stringify(state.customRecipes));
    localStorage.setItem(STORAGE_KEYS.PANTRY_ITEMS, JSON.stringify(state.pantryItems || []));
    localStorage.setItem(STORAGE_KEYS.PANTRY_SERVINGS, String(state.pantryServings || 2));
    localStorage.setItem(STORAGE_KEYS.PANTRY_DEDUCT_MODE, String(!!state.deductPantryFromShopping));
    localStorage.setItem(STORAGE_KEYS.SEEN_RECIPES, JSON.stringify(Array.from(recentSeenIds)));
  } catch (e) {
    console.error('Erreur sauvegarde localStorage :', e);
  }
}

function mergeCustomRecipesIntoCatalog() {
  if (!state.customRecipes || !state.customRecipes.length) return;
  state.customRecipes.forEach((recipe) => {
    const list = getCatalogListByType(recipe.type);
    if (!list.some((r) => r.id === recipe.id)) {
      list.unshift(recipe);
    }
  });
}

function getCatalogListByType(type) {
  if (type === 'gourmet' || type === 'weekend-gourmet') {
    if (!window.RECIPES_DB.gourmetMeals) window.RECIPES_DB.gourmetMeals = [];
    return window.RECIPES_DB.gourmetMeals;
  }
  if (type === 'weekend-pleasure' || type === 'pleasure') return window.RECIPES_DB.weekendPleasureMeals;
  if (type === 'weekend-balanced') return window.RECIPES_DB.weekendBalancedMeals;
  return window.RECIPES_DB.weekdayDinners;
}

function findRecipeById(recipeId) {
  const all = [
    ...(window.RECIPES_DB.weekdayDinners || []),
    ...(window.RECIPES_DB.weekendBalancedMeals || []),
    ...(window.RECIPES_DB.weekendPleasureMeals || []),
    ...(window.RECIPES_DB.gourmetMeals || [])
  ];
  return all.find((r) => r.id === recipeId) || all[0];
}

function findDessertById(dessertId) {
  return (
    window.RECIPES_DB.weekendDesserts.find((d) => d.id === dessertId) ||
    window.RECIPES_DB.weekendDesserts[0]
  );
}

// ============================================================================
// ÉVALUATION DU MONTANT DE CHAQUE MENU & JOURNÉE (EN EUROS €)
// ============================================================================
function evaluateSlotCost(slot) {
  if (slot.active === false) {
    return {
      dishCost: 0,
      dessertCost: 0,
      totalCost: 0,
      perPersonCost: 0
    };
  }

  const recipe = findRecipeById(slot.recipeId);
  const style = getSlotStyle(slot);
  const baseServings = recipe.baseServings || 2;
  const fallbackCost = style === 'gourmet' ? 12.50 : style === 'pleasure' ? 8.00 : 4.50;
  const baseDishCost = typeof recipe.costFor2 === 'number'
    ? recipe.costFor2
    : fallbackCost;

  const dishCost = baseDishCost * (slot.servings / baseServings);

  let dessertCost = 0;
  if (slot.dessertId) {
    const dessert = findDessertById(slot.dessertId);
    const dBaseServings = dessert.baseServings || 2;
    const dBaseCost = typeof dessert.costFor2 === 'number' ? dessert.costFor2 : 2.30;
    dessertCost = dBaseCost * (slot.servings / dBaseServings);
  }

  const totalCost = dishCost + dessertCost;
  const perPersonCost = totalCost / (slot.servings || 1);

  return {
    dishCost,
    dessertCost,
    totalCost,
    perPersonCost
  };
}

function evaluateDayCost(dayOffset) {
  return state.slots
    .filter((s) => s.dayOffset === dayOffset && s.active !== false)
    .reduce((sum, s) => sum + evaluateSlotCost(s).totalCost, 0);
}

function evaluateTotalWeekCost() {
  return state.slots
    .filter((s) => s.active !== false)
    .reduce((acc, slot) => acc + evaluateSlotCost(slot).totalCost, 0);
}

function evaluateValidatedWeekCost() {
  return state.slots
    .filter((s) => s.active !== false && s.validated)
    .reduce((acc, slot) => acc + evaluateSlotCost(slot).totalCost, 0);
}

function formatEuro(amount) {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

// ============================================================================
// SAISONNALITÉ & ÉQUILIBRE ALIMENTAIRE (NUTRI-SCORE)
// ============================================================================
function getSlotMonthNum(slot) {
  const baseIso = state.weekStartDate || getDefaultUpcomingMonday();
  const offset = slot && typeof slot.dayOffset === 'number' ? slot.dayOffset : 0;
  const d = addDaysToIso(baseIso, offset);
  return d.getMonth() + 1;
}

function getMonthSeasonMeta(monthNum) {
  const m = monthNum || new Date().getMonth() + 1;
  const monthNames = [
    '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  if (m === 12 || m <= 2) return { icon: '❄️', season: 'Hiver', monthName: monthNames[m] };
  if (m >= 3 && m <= 5) return { icon: '🌱', season: 'Printemps', monthName: monthNames[m] };
  if (m >= 6 && m <= 8) return { icon: '☀️', season: 'Été', monthName: monthNames[m] };
  return { icon: '🍂', season: 'Automne', monthName: monthNames[m] };
}

function getRecipeSeasonality(recipe, slot) {
  const monthNum = getSlotMonthNum(slot);
  if (typeof window.evaluateRecipeSeasonality === 'function') {
    return window.evaluateRecipeSeasonality(recipe, monthNum);
  }
  return { pct: 100, inSeasonCount: (recipe.ingredients || []).length, totalCount: (recipe.ingredients || []).length, month: monthNum };
}

function getRecipeNutriScore(recipe) {
  if (typeof window.evaluateRecipeNutriScore === 'function') {
    return window.evaluateRecipeNutriScore(recipe);
  }
  return { grade: 'A', label: 'Très équilibré', shortLabel: 'Optimal', color: '#047857', bg: '#d1fae5' };
}

function buildNutritionAndSeasonHTML(recipe, slot, isCompact = false) {
  const seas = getRecipeSeasonality(recipe, slot);
  const nutri = getRecipeNutriScore(recipe);
  const meta = getMonthSeasonMeta(seas.month);

  const seasonClass =
    seas.pct >= 85 ? 'season-pill-high' : seas.pct >= 70 ? 'season-pill-mid' : 'season-pill-low';

  if (isCompact) {
    return `
      <div class="nutrition-season-row compact">
        <span class="season-badge ${seasonClass}" title="Proportion d'ingrédients de saison en ${meta.monthName} (${meta.season}) : varie de 50% à 100% selon les plats">
          ${meta.icon} <strong>${seas.pct}% d'ingrédients de saison</strong> <small>(${seas.inSeasonCount}/${seas.totalCount})</small>
        </span>
        <span class="nutri-badge-inline" title="Équilibre alimentaire : ${nutri.label}">
          <span class="nutri-title-label">Équilibre</span>
          <span class="nutri-grade-caption" style="color:${nutri.color}; background:${nutri.bg || '#f1f5f9'}; padding:2px 8px; border-radius:999px;">${nutri.shortLabel}</span>
        </span>
      </div>
    `;
  }

  const slotMonth = seas.month;
  const ingPillsHTML = (recipe.ingredients || [])
    .map((ing) => {
      const check =
        typeof window.isIngredientInSeason === 'function'
          ? window.isIngredientInSeason(ing.name, slotMonth)
          : { inSeason: true };
      const inSeason = check && typeof check === 'object' ? check.inSeason : Boolean(check);
      return `<span class="ing-season-chip ${inSeason ? 'is-in-season' : 'is-out-season'}" title="${inSeason ? `Ingrédient de saison en ${meta.monthName}` : `Hors pleine saison en ${meta.monthName}`}">${inSeason ? '🌿' : '•'} ${ing.name}</span>`;
    })
    .join('');

  return `
    <div class="nutrition-season-row">
      <div class="season-badge ${seasonClass}" title="${seas.inSeasonCount}/${seas.totalCount} ingrédients de saison en ${meta.monthName} (${meta.season}) — varie entre 50% et 100% selon les plats">
        <span>${meta.icon} <strong>Ingrédients : ${seas.pct}% de saison</strong></span>
        <small>(${seas.inSeasonCount}/${seas.totalCount} en ${meta.monthName})</small>
      </div>
      <div class="nutri-badge-box" title="Équilibre alimentaire du plat : ${nutri.label}">
        <span class="nutri-title-label">Équilibre</span>
        <span class="nutri-grade-caption" style="color:${nutri.color}; background:${nutri.bg || '#f1f5f9'}; padding:3px 9px; border-radius:999px;">${nutri.label}</span>
      </div>
      ${ingPillsHTML ? `<div class="ing-season-chips-wrap">${ingPillsHTML}</div>` : ''}
    </div>
  `;
}

// ============================================================================
// GÉNÉRATION, REMPLACEMENT & SUPPRESSION / COMPTABILISATION DES REPAS
// (AVEC ANTI-RÉPÉTITION 365 JOURS & PRIORITÉ AUX INGRÉDIENTS DE SAISON)
// ============================================================================
const recentSeenIds = new Set();

function pickRandomAvoiding(list, usedIds, targetMonth) {
  const monthNum = targetMonth || getSlotMonthNum(null);

  // 1. Essayer de piocher parmi les recettes ni présentes dans la semaine ni vues sur l'année (365j)
  let available = list.filter((item) => !usedIds.has(item.id) && !recentSeenIds.has(item.id));

  // 2. Si toutes les recettes de cette catégorie ont déjà été vues sur l'année, réinitialiser la mémoire pour cette liste
  if (available.length === 0) {
    list.forEach((item) => recentSeenIds.delete(item.id));
    available = list.filter((item) => !usedIds.has(item.id));
  }

  let pool = available.length > 0 ? available : list;

  // 3. Prioriser les plats réalisés avec un maximum d'ingrédients de saison (100%, sinon >= 85%, sinon maximum dispo)
  if (typeof window.evaluateRecipeSeasonality === 'function' && pool.length > 1) {
    const scored = pool.map((item) => ({
      item,
      pct: window.evaluateRecipeSeasonality(item, monthNum).pct
    }));
    const fullSeason = scored.filter((x) => x.pct === 100).map((x) => x.item);
    if (fullSeason.length >= 3) {
      pool = fullSeason;
    } else {
      const highSeason = scored.filter((x) => x.pct >= 85).map((x) => x.item);
      if (highSeason.length > 0) {
        pool = highSeason;
      } else {
        const maxPct = Math.max(...scored.map((x) => x.pct));
        pool = scored.filter((x) => x.pct >= maxPct - 10).map((x) => x.item);
      }
    }
  }

  const picked = pool[Math.floor(Math.random() * pool.length)];
  if (picked && picked.id) {
    recentSeenIds.add(picked.id);
  }
  return picked;
}

function getPoolForSlot(slot) {
  const style = getSlotStyle(slot);
  if (style === 'gourmet') {
    return window.RECIPES_DB.gourmetMeals && window.RECIPES_DB.gourmetMeals.length
      ? window.RECIPES_DB.gourmetMeals
      : window.RECIPES_DB.weekendPleasureMeals;
  }
  if (style === 'pleasure') {
    return window.RECIPES_DB.weekendPleasureMeals;
  }
  if (slot.isWeekend) {
    return window.RECIPES_DB.weekendBalancedMeals;
  }
  return window.RECIPES_DB.weekdayDinners;
}

function generateFullWeekPlan() {
  const usedRecipes = new Set();
  const usedDesserts = new Set();

  state.slots = SLOTS_DEFINITION.map((def) => {
    const style = def.defaultStyle || (def.defaultPleasure ? 'pleasure' : 'balanced');
    let recipePool = window.RECIPES_DB.weekdayDinners;
    if (style === 'gourmet' && window.RECIPES_DB.gourmetMeals && window.RECIPES_DB.gourmetMeals.length) {
      recipePool = window.RECIPES_DB.gourmetMeals;
    } else if (style === 'pleasure') {
      recipePool = window.RECIPES_DB.weekendPleasureMeals;
    } else if (def.isWeekend) {
      recipePool = window.RECIPES_DB.weekendBalancedMeals;
    }

    const slotMonth = getSlotMonthNum(def);
    const pickedRecipe = pickRandomAvoiding(recipePool, usedRecipes, slotMonth);
    usedRecipes.add(pickedRecipe.id);

    let pickedDessertId = null;
    if (def.isWeekend || style === 'pleasure' || style === 'gourmet') {
      const styleDesserts = window.RECIPES_DB.weekendDesserts.filter(
        (d) => d.style === style
      );
      const pickedDessert = pickRandomAvoiding(
        styleDesserts.length ? styleDesserts : window.RECIPES_DB.weekendDesserts,
        usedDesserts,
        slotMonth
      );
      usedDesserts.add(pickedDessert.id);
      pickedDessertId = pickedDessert.id;
    }

    return {
      slotId: def.id,
      day: def.day,
      dayOffset: def.dayOffset,
      mealLabel: def.mealLabel,
      isWeekend: def.isWeekend,
      mealStyle: style,
      isPleasure: style === 'pleasure',
      isGourmet: style === 'gourmet',
      recipeId: pickedRecipe.id,
      dessertId: pickedDessertId,
      servings: 2, // Par défaut : 2 adultes sur chaque journée
      validated: false,
      active: true // Par défaut : repas comptabilisé
    };
  });

  state.inStockKeys = {};
  saveStateToStorage();
}

// ============================================================================
// ANIMATIONS LUDIQUES & UNIVERS CUISINE (CONFETTIS D'INGRÉDIENTS & CÉLÉBRATIONS)
// ============================================================================
const CULINARY_PARTICLES = ['🥗', '🥕', '🍅', '🌿', '🍳', '🧑‍🍳', '✨', '🥖', '🧀', '🍋', '🥑', '🍽️'];
const PLEASURE_PARTICLES = ['🌟', '🍰', '🍫', '🥂', '🍝', '🧀', '🍓', '✨', '👨‍🍳'];
const GOURMET_PARTICLES  = ['🍷', '🥂', '🍇', '✨', '🍽️', '🧑‍🍳', '⭐', '🍾'];

function getDishEmoji(recipe, slot) {
  const t = ((recipe && recipe.title) || '').toLowerCase();
  if (t.includes('saint-jacques') || t.includes('homard') || t.includes('langoustine')) return '🐚';
  if (t.includes('saumon') || t.includes('cabillaud') || t.includes('poisson') || t.includes('thon') || t.includes('truite') || t.includes('bar')) return '🐟';
  if (t.includes('crevette') || t.includes('gambas')) return '🦐';
  if (t.includes('canard') || t.includes('magret') || t.includes('volaille') || t.includes('poulet') || t.includes('dinde')) return '🍗';
  if (t.includes('tournedos') || t.includes('bœuf') || t.includes('boeuf') || t.includes('steak') || t.includes('haché') || t.includes('veau') || t.includes('agneau')) return '🥩';
  if (t.includes('pâtes') || t.includes('spaghetti') || t.includes('tagliatelle') || t.includes('penne') || t.includes('lasagne') || t.includes('gnocchi') || t.includes('ravioli') || t.includes('raviole') || t.includes('mac & cheese')) return '🍝';
  if (t.includes('risotto') || t.includes('riz') || t.includes('paella') || t.includes('curry') || t.includes('tikka') || t.includes('dahl')) return '🍛';
  if (t.includes('wok') || t.includes('nouilles') || t.includes('pad thaï') || t.includes('asiatique')) return '🥢';
  if (t.includes('salade') || t.includes('bowl') || t.includes('poke') || t.includes('buddha') || t.includes('taboulé')) return '🥗';
  if (t.includes('velouté') || t.includes('soupe') || t.includes('bouillon') || t.includes('minestrone')) return '🥣';
  if (t.includes('quiche') || t.includes('tarte') || t.includes('pizza') || t.includes('flammekueche') || t.includes('croque')) return '🥧';
  if (t.includes('omelette') || t.includes('œuf') || t.includes('oeuf') || t.includes('frittata') || t.includes('chakchouka')) return '🍳';
  if (t.includes('wrap') || t.includes('fajita') || t.includes('quesadilla') || t.includes('tacos') || t.includes('burger')) return '🌮';
  if (t.includes('gratin') || t.includes('parmentier') || t.includes('poêlée') || t.includes('mijoté') || t.includes('ratatouille') || t.includes('tartiflette')) return '🥘';
  const style = getSlotStyle(slot);
  if (style === 'gourmet') return '🍷';
  return style === 'pleasure' ? '🍽️' : '🥗';
}

// Catalogue d'accords mets & vins du Sommelier classé par famille de plats gourmets
const WINE_PAIRING_POOLS = {
  shellfish: [
    {
      name: 'AOC Chablis Premier Cru (Bourgogne)',
      color: 'Blanc sec & minéral',
      region: 'Bourgogne',
      appellation: 'AOC Chablis Premier Cru',
      grape: '100 % Chardonnay',
      temp: '10-12°C',
      note: 'Fraîcheur ciselée et notes d\'agrumes idéales pour sublimer la finesse des Saint-Jacques et crustacés.'
    },
    {
      name: 'AOC Sancerre Blanc (Vallée de la Loire)',
      color: 'Blanc sec & vif',
      region: 'Vallée de la Loire',
      appellation: 'AOC Sancerre Blanc',
      grape: '100 % Sauvignon Blanc',
      temp: '10-11°C',
      note: 'Tension minérale et arômes de pamplemousse blanc en accord parfait avec l\'iode des produits de la mer.'
    },
    {
      name: 'AOC Meursault (Bourgogne)',
      color: 'Blanc ample & beurré',
      region: 'Bourgogne (Côte de Beaune)',
      appellation: 'AOC Meursault',
      grape: '100 % Chardonnay',
      temp: '11-13°C',
      note: 'Rondeur noisette et bouche veloutée magnifiant les Saint-Jacques ou crustacés nacrés au beurre.'
    },
    {
      name: 'AOC Pouilly-Fumé (Vallée de la Loire)',
      color: 'Blanc sec & pierre à fusil',
      region: 'Vallée de la Loire',
      appellation: 'AOC Pouilly-Fumé',
      grape: '100 % Sauvignon Blanc',
      temp: '10-12°C',
      note: 'Notes fumées et finale saline qui prolongent la délicatesse des crustacés et noix de Saint-Jacques.'
    },
    {
      name: 'AOC Condrieu (Vallée du Rhône)',
      color: 'Blanc aromatique & soyeux',
      region: 'Vallée du Rhône septentrionale',
      appellation: 'AOC Condrieu',
      grape: '100 % Viognier',
      temp: '11-12°C',
      note: 'Parfums de pêche blanche et de violette tout en finesse sur des gambas ou langoustines rôties.'
    },
    {
      name: 'AOC Pessac-Léognan Blanc (Bordelais)',
      color: 'Blanc sec gastronomique',
      region: 'Bordelais (Graves)',
      appellation: 'AOC Pessac-Léognan Blanc',
      grape: 'Sauvignon Blanc & Sémillon',
      temp: '11-12°C',
      note: 'Équilibre remarquable entre vivacité d\'agrumes et onctuosité sur un plat marin noble.'
    }
  ],
  fish: [
    {
      name: 'AOC Pouilly-Fuissé (Bourgogne)',
      color: 'Blanc sec & rond',
      region: 'Bourgogne (Mâconnais)',
      appellation: 'AOC Pouilly-Fuissé',
      grape: '100 % Chardonnay',
      temp: '11-12°C',
      note: 'Texture ample et fraîcheur minérale qui enveloppent délicatement la chair nacrée du poisson.'
    },
    {
      name: 'AOC Sancerre Blanc (Vallée de la Loire)',
      color: 'Blanc sec & ciselé',
      region: 'Vallée de la Loire',
      appellation: 'AOC Sancerre Blanc',
      grape: '100 % Sauvignon Blanc',
      temp: '10-12°C',
      note: 'Vivacité d\'agrumes et fraîcheur florale réveillant la finesse d\'un filet de poisson noble.'
    },
    {
      name: 'AOC Riesling Grand Cru (Alsace)',
      color: 'Blanc sec & racé',
      region: 'Alsace',
      appellation: 'AOC Alsace Riesling Grand Cru',
      grape: '100 % Riesling',
      temp: '9-11°C',
      note: 'Droiture cristalline et notes de cédrat idéales pour accompagner les poissons fins.'
    },
    {
      name: 'AOC Chignin-Bergeron (Savoie)',
      color: 'Blanc fruité & généreux',
      region: 'Savoie',
      appellation: 'AOC Chignin-Bergeron',
      grape: '100 % Roussanne',
      temp: '10-12°C',
      note: 'Arômes d\'abricot frais et d\'amande douce offrant un accord très gourmand sur le poisson.'
    },
    {
      name: 'AOC Cassis Blanc (Provence)',
      color: 'Blanc marin & floral',
      region: 'Provence',
      appellation: 'AOC Cassis Blanc',
      grape: 'Marsanne & Clairette',
      temp: '10-11°C',
      note: 'Bouquet de fleurs blanches et pointe iodée en harmonie naturelle avec les poissons grillés ou rôtis.'
    },
    {
      name: 'AOC Saint-Véran (Bourgogne)',
      color: 'Blanc sec & élégant',
      region: 'Bourgogne',
      appellation: 'AOC Saint-Véran',
      grape: '100 % Chardonnay',
      temp: '10-12°C',
      note: 'Finesse beurrée et fraîcheur vive sur un dos de cabillaud, saumon ou bar rôti.'
    }
  ],
  poultry_veal: [
    {
      name: 'AOC Beaune Premier Cru (Bourgogne)',
      color: 'Rouge fin & velouté',
      region: 'Bourgogne (Côte de Beaune)',
      appellation: 'AOC Beaune Premier Cru',
      grape: '100 % Pinot Noir',
      temp: '15-16°C',
      note: 'Tanins soyeux et fruits rouges délicats qui respectent la tendreté des volailles et du veau.'
    },
    {
      name: 'AOC Savigny-lès-Beaune Blanc (Bourgogne)',
      color: 'Blanc gastronomique & rond',
      region: 'Bourgogne',
      appellation: 'AOC Savigny-lès-Beaune Blanc',
      grape: '100 % Chardonnay',
      temp: '11-13°C',
      note: 'Ampleur beurrée et notes de noisette grillée sublimes sur un suprême de volaille ou quasi de veau.'
    },
    {
      name: 'AOC Crozes-Hermitage Blanc (Vallée du Rhône)',
      color: 'Blanc rond & floral',
      region: 'Vallée du Rhône',
      appellation: 'AOC Crozes-Hermitage Blanc',
      grape: 'Marsanne & Roussanne',
      temp: '11-12°C',
      note: 'Belle matière soyeuse aux notes de fleurs blanches et de fruits à noyau.'
    },
    {
      name: 'AOC Mercurey Premier Cru (Bourgogne)',
      color: 'Rouge soyeux & épicé',
      region: 'Bourgogne (Côte Chalonnaise)',
      appellation: 'AOC Mercurey Premier Cru',
      grape: '100 % Pinot Noir',
      temp: '15-16°C',
      note: 'Bouche croquante de cerise noire et finale veloutée parfaite sur les viandes blanches rôties.'
    },
    {
      name: 'AOC Arbois Chardonnay (Jura)',
      color: 'Blanc de caractère & minéral',
      region: 'Jura',
      appellation: 'AOC Arbois',
      grape: 'Chardonnay & Savagnin',
      temp: '11-13°C',
      note: 'Accord d\'exception avec les sauces crémées, les champignons et la volaille.'
    },
    {
      name: 'AOC Chinon Rouge Vieilles Vignes (Loire)',
      color: 'Rouge souple & fruité',
      region: 'Vallée de la Loire (Touraine)',
      appellation: 'AOC Chinon',
      grape: '100 % Cabernet Franc',
      temp: '15-16°C',
      note: 'Notes de petits fruits noirs et de violette d\'une grande finesse sur les viandes tendres.'
    }
  ],
  duck_game: [
    {
      name: 'AOC Saint-Émilion Grand Cru (Bordelais)',
      color: 'Rouge élégant & soyeux',
      region: 'Bordelais (Libournais)',
      appellation: 'AOC Saint-Émilion Grand Cru',
      grape: 'Merlot & Cabernet Franc',
      temp: '16-17°C',
      note: 'Tanins veloutés et arômes de fruits noirs mûrs qui subliment le magret de canard ou l\'agneau.'
    },
    {
      name: 'AOC Châteauneuf-du-Pape (Vallée du Rhône)',
      color: 'Rouge généreux & épicé',
      region: 'Vallée du Rhône méridionale',
      appellation: 'AOC Châteauneuf-du-Pape',
      grape: 'Grenache, Syrah & Mourvèdre',
      temp: '16-17°C',
      note: 'Notes de garrigue, de cerise noire et d\'épices douces en harmonie avec une viande rôtie.'
    },
    {
      name: 'AOC Gevrey-Chambertin (Bourgogne)',
      color: 'Rouge profond & racé',
      region: 'Bourgogne (Côte de Nuits)',
      appellation: 'AOC Gevrey-Chambertin',
      grape: '100 % Pinot Noir',
      temp: '15-16°C',
      note: 'Grande noblesse aromatique (fruits noirs, sous-bois) idéale sur le canard et les viandes de caractère.'
    },
    {
      name: 'AOC Côte-Rôtie (Vallée du Rhône)',
      color: 'Rouge racé & floral',
      region: 'Vallée du Rhône septentrionale',
      appellation: 'AOC Côte-Rôtie',
      grape: 'Syrah & pointe de Viognier',
      temp: '16-17°C',
      note: 'Alliance unique de poivre fin, de violette et de tanins satinés.'
    },
    {
      name: 'AOC Madiran (Sud-Ouest)',
      color: 'Rouge charpenté & velouté',
      region: 'Sud-Ouest',
      appellation: 'AOC Madiran',
      grape: 'Tannat & Cabernet Franc',
      temp: '16-17°C',
      note: 'Accord régional incontournable et généreux avec le canard et les plats mijotés.'
    },
    {
      name: 'AOC Cahors (Sud-Ouest)',
      color: 'Rouge intense & soyeux',
      region: 'Sud-Ouest (Quercy)',
      appellation: 'AOC Cahors',
      grape: '100 % Malbec (Côt)',
      temp: '16-17°C',
      note: 'Arômes de mûre, de cacao et de truffe accompagnant merveilleusement le canard ou l\'agneau.'
    }
  ],
  red_meat: [
    {
      name: 'AOC Margaux (Bordelais)',
      color: 'Rouge noble & structuré',
      region: 'Bordelais (Médoc)',
      appellation: 'AOC Margaux',
      grape: 'Cabernet Sauvignon & Merlot',
      temp: '16-17°C',
      note: 'Finesse légendaire et tanins d\'une grande élégance pour sublimer le bœuf.'
    },
    {
      name: 'AOC Saint-Joseph (Vallée du Rhône)',
      color: 'Rouge poivré & élégant',
      region: 'Vallée du Rhône septentrionale',
      appellation: 'AOC Saint-Joseph',
      grape: '100 % Syrah',
      temp: '15-16°C',
      note: 'Notes de cassis et de poivre blanc qui relèvent avec brio les pièces de bœuf saisies.'
    },
    {
      name: 'AOC Pommard (Bourgogne)',
      color: 'Rouge intense & racé',
      region: 'Bourgogne (Côte de Beaune)',
      appellation: 'AOC Pommard',
      grape: '100 % Pinot Noir',
      temp: '15-16°C',
      note: 'Bouche ample et profonde aux notes de griotte et de cuir fin.'
    },
    {
      name: 'AOC Pessac-Léognan Rouge (Bordelais)',
      color: 'Rouge complexe & velouté',
      region: 'Bordelais (Graves)',
      appellation: 'AOC Pessac-Léognan Rouge',
      grape: 'Cabernet Sauvignon & Merlot',
      temp: '16-17°C',
      note: 'Subtiles notes fumées et tanins fondus en accord parfait avec le filet de bœuf.'
    },
    {
      name: 'AOC Pauillac (Bordelais)',
      color: 'Rouge puissant & harmonieux',
      region: 'Bordelais (Médoc)',
      appellation: 'AOC Pauillac',
      grape: 'Cabernet Sauvignon & Merlot',
      temp: '16-17°C',
      note: 'Structure majestueuse aux arômes de cèdre et de cassis sur une belle viande rouge.'
    },
    {
      name: 'AOC Crozes-Hermitage Rouge (Vallée du Rhône)',
      color: 'Rouge gourmand & épicé',
      region: 'Vallée du Rhône',
      appellation: 'AOC Crozes-Hermitage Rouge',
      grape: '100 % Syrah',
      temp: '15-16°C',
      note: 'Fruité éclatant et touche poivrée très harmonieuse sur le bœuf.'
    }
  ],
  risotto_truffle_veg: [
    {
      name: 'AOC Puligny-Montrachet (Bourgogne)',
      color: 'Blanc ciselé & floral',
      region: 'Bourgogne (Côte de Beaune)',
      appellation: 'AOC Puligny-Montrachet',
      grape: '100 % Chardonnay',
      temp: '11-13°C',
      note: 'Grande finesse minérale et onctuosité qui épousent le crémeux d\'un risotto ou de ravioles.'
    },
    {
      name: 'AOC Chambolle-Musigny (Bourgogne)',
      color: 'Rouge dentelle & sous-bois',
      region: 'Bourgogne (Côte de Nuits)',
      appellation: 'AOC Chambolle-Musigny',
      grape: '100 % Pinot Noir',
      temp: '15-16°C',
      note: 'Tanins de soie et notes de truffe et de framboise sublimes avec les cèpes et champignons.'
    },
    {
      name: 'AOC Saint-Péray (Vallée du Rhône)',
      color: 'Blanc onctueux & minéral',
      region: 'Vallée du Rhône',
      appellation: 'AOC Saint-Péray',
      grape: 'Marsanne & Roussanne',
      temp: '10-12°C',
      note: 'Fraîcheur vive et rondeur florale idéales sur les plats crémeux et fromagers.'
    },
    {
      name: 'AOC Pinot Gris Grand Cru (Alsace)',
      color: 'Blanc ample & notes de sous-bois',
      region: 'Alsace',
      appellation: 'AOC Alsace Pinot Gris',
      grape: '100 % Pinot Gris',
      temp: '10-12°C',
      note: 'Notes fumées et de sous-bois en accord remarquable avec les champignons, risottos et truffe.'
    },
    {
      name: 'AOC Vouvray Sec (Vallée de la Loire)',
      color: 'Blanc élégant & minéral',
      region: 'Vallée de la Loire (Touraine)',
      appellation: 'AOC Vouvray Sec',
      grape: '100 % Chenin Blanc',
      temp: '10-11°C',
      note: 'Fraîcheur ciselée qui équilibre à merveille la richesse d\'un plat au parmesan ou à la truffe.'
    },
    {
      name: 'AOC Volnay (Bourgogne)',
      color: 'Rouge fin & soyeux',
      region: 'Bourgogne (Côte de Beaune)',
      appellation: 'AOC Volnay',
      grape: '100 % Pinot Noir',
      temp: '15-16°C',
      note: 'Bouquet de violette et bouche aérienne sur un risotto aux champignons ou à la truffe.'
    }
  ]
};

function getWineCategoryForRecipe(recipe) {
  const t = ((recipe && recipe.title) || '').toLowerCase();
  if (t.includes('saint-jacques') || t.includes('homard') || t.includes('langoustine') || t.includes('gambas') || t.includes('crevette') || t.includes('crabe')) {
    return 'shellfish';
  }
  if (t.includes('poisson') || t.includes('saumon') || t.includes('cabillaud') || t.includes('bar') || t.includes('dorade') || t.includes('truite') || t.includes('thon') || t.includes('lotte') || t.includes('sole') || t.includes('turbot') || t.includes('sandre')) {
    return 'fish';
  }
  if (t.includes('canard') || t.includes('magret') || t.includes('confit') || t.includes('caille') || t.includes('pigeon') || t.includes('agneau') || t.includes('souris')) {
    return 'duck_game';
  }
  if (t.includes('tournedos') || t.includes('bœuf') || t.includes('boeuf') || t.includes('entrecôte') || t.includes('filet de bœuf') || t.includes('rossini') || t.includes('bavette')) {
    return 'red_meat';
  }
  if (t.includes('volaille') || t.includes('poulet') || t.includes('pintade') || t.includes('dinde') || t.includes('veau') || t.includes('quasi') || t.includes('grenadin') || t.includes('mignon') || t.includes('porc')) {
    return 'poultry_veal';
  }
  return 'risotto_truffle_veg';
}

function getWinePoolForRecipe(recipe) {
  const cat = getWineCategoryForRecipe(recipe);
  const basePool = [...(WINE_PAIRING_POOLS[cat] || WINE_PAIRING_POOLS.risotto_truffle_veg)];
  if (recipe && recipe.winePairing && (recipe.winePairing.appellation || recipe.winePairing.name)) {
    const wp = recipe.winePairing;
    const normalizedDefault = {
      name: wp.name || wp.appellation,
      color: wp.color || 'Blanc sec',
      region: wp.region || 'Bourgogne',
      appellation: wp.appellation || wp.name,
      grape: wp.grape || 'Chardonnay',
      temp: wp.temp || '10-12°C',
      note: wp.note || ''
    };
    const alreadyExists = basePool.some(
      (w) => (w.appellation || w.name).toLowerCase() === (normalizedDefault.appellation || normalizedDefault.name).toLowerCase()
    );
    if (!alreadyExists) {
      basePool.unshift(normalizedDefault);
    }
  }
  return basePool;
}

function getRecipeWinePairing(recipe, slot) {
  const style = getSlotStyle(slot);
  if (style !== 'gourmet' && (!recipe || recipe.type !== 'gourmet')) {
    return null;
  }

  // Si l'utilisateur a cliqué sur "Autre idée" pour le vin de ce créneau, afficher le vin choisi
  if (slot && slot.customWinePairing && (slot.customWinePairing.appellation || slot.customWinePairing.name)) {
    return slot.customWinePairing;
  }

  const pool = getWinePoolForRecipe(recipe);
  return pool[0];
}

function replaceWineInSlot(slotId, isModal = false, evt) {
  if (evt) evt.stopPropagation();
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  const recipe = findRecipeById(slot.recipeId);
  const currentWine = getRecipeWinePairing(recipe, slot);
  const pool = getWinePoolForRecipe(recipe);
  if (!pool || pool.length === 0) return;

  const currentApp = currentWine ? (currentWine.appellation || currentWine.name || '').toLowerCase() : '';
  const curIdx = pool.findIndex((w) => (w.appellation || w.name || '').toLowerCase() === currentApp);
  const nextIdx = curIdx >= 0 ? (curIdx + 1) % pool.length : Math.floor(Math.random() * pool.length);
  const nextWine = pool[nextIdx];

  slot.customWinePairing = nextWine;
  saveStateToStorage();
  renderAll();

  if (isModal) {
    openRecipeModal(slotId);
  }

  if (evt && evt.clientX) {
    spawnCulinaryConfetti({
      x: evt.clientX,
      y: evt.clientY,
      count: 7,
      spread: 80,
      emojis: GOURMET_PARTICLES
    });
  }

  showToast(`🍷 Autre idée Sommelier : ${nextWine.appellation} (${nextWine.region}) !`);
}

function isWineInShoppingList(wineName) {
  if (!wineName) return false;
  const target = `🍷 Vin : ${wineName}`.toLowerCase();
  return state.customItems.some((c) => (c.name || '').toLowerCase() === target);
}

function toggleWineInShoppingList(wineName, slotDayLabel, evt) {
  if (evt) evt.stopPropagation();
  if (!wineName) return;
  const itemLabel = `🍷 Vin : ${wineName}`;
  const existingIdx = state.customItems.findIndex(
    (c) => (c.name || '').toLowerCase() === itemLabel.toLowerCase()
  );

  if (existingIdx !== -1) {
    const removed = state.customItems[existingIdx];
    state.customItems.splice(existingIdx, 1);
    delete state.inStockKeys[`custom_${removed.id}`];
    saveStateToStorage();
    renderAll();
    showToast(`🍷 Bouteille "${wineName}" retirée de la liste de courses`);
  } else {
    state.customItems.push({
      id: Date.now().toString(),
      name: itemLabel,
      qty: '1 bouteille (75 cl)',
      aisle: 'Cave & Accords Vins',
      sourceLabel: slotDayLabel ? `Accord Gourmet ${slotDayLabel}` : 'Accord Mets & Vin'
    });
    saveStateToStorage();
    renderAll();
    if (evt && evt.clientX) {
      spawnCulinaryConfetti({
        x: evt.clientX,
        y: evt.clientY,
        count: 9,
        spread: 90,
        emojis: GOURMET_PARTICLES
      });
    }
    showToast(`🍷 "${wineName}" ajouté au rayon Cave de votre liste de courses !`);
  }
}

function buildWinePairingBoxHTML(recipe, slot, isModal = false) {
  const wine = getRecipeWinePairing(recipe, slot);
  if (!wine) return '';

  const shoppingLabel = `${wine.appellation || wine.name} — ${wine.color} (${wine.region}, ${wine.grape})`;
  const inList = isWineInShoppingList(shoppingLabel) || isWineInShoppingList(wine.name);
  const activeLabel = isWineInShoppingList(wine.name) && !isWineInShoppingList(shoppingLabel) ? wine.name : shoppingLabel;
  const safeWineName = (activeLabel || '').replace(/'/g, "\\'");
  const safeDayLabel = `${slot.day} (${slot.mealLabel})`.replace(/'/g, "\\'");

  return `
    <div class="wine-pairing-box ${isModal ? 'wine-pairing-modal' : ''}">
      <div class="wine-pairing-header">
        <div class="wine-pairing-badge-group">
          <span class="wine-pairing-tag">🍷 Suggestion de vin • Accord Gourmet</span>
          ${wine.temp ? `<span class="wine-temp-pill">🌡️ Service ${wine.temp}</span>` : ''}
        </div>
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <button
            type="button"
            class="btn btn-outline btn-sm"
            style="padding: 3px 9px; font-size: 0.74rem; border-color: var(--gourmet-border); color: var(--gourmet); background: #ffffff; font-weight: 800;"
            onclick="replaceWineInSlot('${slot.slotId}', ${isModal ? 'true' : 'false'}, event)"
            title="Proposer une autre idée de vin en accord avec ce plat gourmet"
          >
            🎲 Autre idée
          </button>
          <button
            type="button"
            class="btn btn-sm ${inList ? 'btn-wine-added' : 'btn-wine-add'}"
            onclick="toggleWineInShoppingList('${safeWineName}', '${safeDayLabel}', event)"
            title="${inList ? 'Retirer cette bouteille de la liste de courses' : 'Ajouter cette bouteille au rayon Cave de la liste de courses'}"
          >
            ${inList ? '✓ Bouteille au panier' : '🛒 + Ajouter aux courses'}
          </button>
        </div>
      </div>
      <div class="wine-pairing-specs-grid">
        <div class="wine-spec-item">
          <span class="wine-spec-label">🎨 Couleur</span>
          <span class="wine-spec-value">${wine.color || '—'}</span>
        </div>
        <div class="wine-spec-item">
          <span class="wine-spec-label">🗺️ Région</span>
          <span class="wine-spec-value">${wine.region || '—'}</span>
        </div>
        <div class="wine-spec-item">
          <span class="wine-spec-label">🏅 Appellation</span>
          <span class="wine-spec-value">${wine.appellation || wine.name || '—'}</span>
        </div>
        <div class="wine-spec-item">
          <span class="wine-spec-label">🍇 Cépage</span>
          <span class="wine-spec-value">${wine.grape || '—'}</span>
        </div>
      </div>
      ${wine.note ? `<p class="wine-pairing-note">« ${wine.note} »</p>` : ''}
    </div>
  `;
}

function spawnCulinaryConfetti(options = {}) {
  const layer = document.getElementById('culinary-fx-layer');
  if (!layer) return;

  const count = options.count || 16;
  const emojis = options.emojis || CULINARY_PARTICLES;
  const originX = typeof options.x === 'number' ? options.x : window.innerWidth / 2;
  const originY = typeof options.y === 'number' ? options.y : window.innerHeight * 0.45;
  const spread = options.spread || 170;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'culinary-particle';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 45 + Math.random() * spread;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - (40 + Math.random() * 60);
    const rot = (Math.random() - 0.5) * 320;
    const dur = 850 + Math.floor(Math.random() * 450);

    el.style.left = `${originX}px`;
    el.style.top = `${originY}px`;
    el.style.setProperty('--tx', `${tx.toFixed(1)}px`);
    el.style.setProperty('--ty', `${ty.toFixed(1)}px`);
    el.style.setProperty('--rot', `${rot.toFixed(0)}deg`);
    el.style.setProperty('--dur', `${dur}ms`);

    layer.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, dur + 60);
  }
}

function showDayCelebrationBanner(title, subtitle, emoji = '👨‍🍳') {
  const layer = document.getElementById('culinary-fx-layer');
  if (!layer) return;

  const existing = layer.querySelector('.day-celebration-banner');
  if (existing) existing.remove();

  const banner = document.createElement('div');
  banner.className = 'day-celebration-banner';
  banner.innerHTML = `
    <span class="celeb-emoji">${emoji}</span>
    <div class="celeb-title">${title}</div>
    <div class="celeb-sub">${subtitle}</div>
  `;
  layer.appendChild(banner);

  setTimeout(() => {
    banner.remove();
  }, 1700);
}

function animateCardElement(slotId, animClass) {
  requestAnimationFrame(() => {
    const card = document.getElementById(`meal-card-${slotId}`);
    if (!card) return;
    card.classList.remove(animClass);
    void card.offsetWidth;
    card.classList.add(animClass);
    setTimeout(() => card.classList.remove(animClass), 550);
  });
}

// Supprimer un repas (ne pas le comptabiliser) ou le rétablir (le comptabiliser)
function toggleSlotActive(slotId) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  slot.active = slot.active === false ? true : false;
  saveStateToStorage();
  renderAll();

  showToast(
    slot.active
      ? `🍽️ ${slot.day} (${slot.mealLabel}) est remis à table !`
      : `🚫 ${slot.day} (${slot.mealLabel}) mis de côté (0,00 € • non comptabilisé)`
  );
}

function replaceMealInSlot(slotId, evt) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  const usedIds = new Set(state.slots.filter((s) => s.active !== false).map((s) => s.recipeId));
  const pool = getPoolForSlot(slot);

  const nextRecipe = pickRandomAvoiding(pool, usedIds, getSlotMonthNum(slot));
  slot.recipeId = nextRecipe.id;
  slot.customWinePairing = null;
  slot.validated = false;
  slot.active = true;
  saveStateToStorage();
  renderAll();
  animateCardElement(slotId, 'anim-shuffle');

  if (evt && evt.clientX) {
    spawnCulinaryConfetti({
      x: evt.clientX,
      y: evt.clientY,
      count: 7,
      spread: 80,
      emojis: getSlotStyle(slot) === 'gourmet' ? GOURMET_PARTICLES : ['🎲', '✨', '🍳', '🌿']
    });
  }
  const seas = getRecipeSeasonality(nextRecipe, slot);
  const nutri = getRecipeNutriScore(nextRecipe);
  showToast(`🎲 Nouvelle idée (${seas.pct}% d'ingrédients de saison • Équilibre : ${nutri.shortLabel}) pour ${slot.day} !`);
}

function replaceDessertInSlot(slotId) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  const usedDesserts = new Set(
    state.slots.filter((s) => s.dessertId).map((s) => s.dessertId)
  );
  const style = getSlotStyle(slot);
  const styleDesserts = window.RECIPES_DB.weekendDesserts.filter((d) => d.style === style);
  const pool = styleDesserts.length ? styleDesserts : window.RECIPES_DB.weekendDesserts;
  const nextDessert = pickRandomAvoiding(pool, usedDesserts, getSlotMonthNum(slot));
  slot.dessertId = nextDessert.id;
  saveStateToStorage();
  renderAll();
  animateCardElement(slotId, 'anim-shuffle');
  showToast(`🍰 Nouvelle douceur proposée pour ${slot.day} (${slot.mealLabel}) !`);
}

// Choisir directement entre les 3 types de repas (Équilibré, Plaisir, Gourmet) en Semaine comme le Week-end
function setSlotMealStyle(slotId, newStyle, evt) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  const validStyle =
    newStyle === 'gourmet' || newStyle === 'pleasure' || newStyle === 'balanced'
      ? newStyle
      : 'balanced';

  const currentStyle = getSlotStyle(slot);
  syncSlotStyleFlags(slot, validStyle);

  // Si on clique sur le type déjà actif, on propose une autre recette de ce même type
  const usedIds = new Set(state.slots.map((s) => s.recipeId));
  const pool = getPoolForSlot(slot);
  const slotMonth = getSlotMonthNum(slot);
  const nextRecipe = pickRandomAvoiding(pool, usedIds, slotMonth);
  slot.recipeId = nextRecipe.id;
  slot.customWinePairing = null;

  if (validStyle === 'pleasure' || validStyle === 'gourmet' || slot.isWeekend) {
    const usedDesserts = new Set(
      state.slots.filter((s) => s.dessertId && s.slotId !== slotId).map((s) => s.dessertId)
    );
    const matchingDesserts = window.RECIPES_DB.weekendDesserts.filter(
      (d) => d.style === validStyle
    );
    const pickedDessert = pickRandomAvoiding(
      matchingDesserts.length ? matchingDesserts : window.RECIPES_DB.weekendDesserts,
      usedDesserts,
      slotMonth
    );
    slot.dessertId = pickedDessert.id;
  } else {
    slot.dessertId = null;
  }

  slot.validated = false;
  slot.active = true;
  saveStateToStorage();
  renderAll();
  animateCardElement(slotId, 'anim-shuffle');

  if (evt && evt.clientX) {
    const particles =
      validStyle === 'gourmet'
        ? GOURMET_PARTICLES
        : validStyle === 'pleasure'
        ? PLEASURE_PARTICLES
        : CULINARY_PARTICLES;
    spawnCulinaryConfetti({
      x: evt.clientX,
      y: evt.clientY,
      count: validStyle === 'balanced' ? 8 : 12,
      spread: 115,
      emojis: particles
    });
  }

  if (validStyle === 'gourmet') {
    const wine = getRecipeWinePairing(nextRecipe, slot);
    showToast(
      `🍷 ${slot.day} (${slot.mealLabel}) en Menu Gourmet${wine ? ` • Accord : ${wine.name}` : ''} !`
    );
  } else if (validStyle === 'pleasure') {
    showToast(
      `🌟 ${slot.day} (${slot.mealLabel}) en Menu Plaisir (gourmand, simple & rapide) !`
    );
  } else {
    showToast(
      `🥗 ${slot.day} (${slot.mealLabel}) en Menu Équilibré (sain, simple & rapide)${currentStyle === 'balanced' ? ' — Nouvelle idée' : ''}`
    );
  }
}

// Basculer en cycle entre Équilibré -> Plaisir -> Gourmet
function togglePleasureMode(slotId, evt) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;
  const cur = getSlotStyle(slot);
  const next = cur === 'balanced' ? 'pleasure' : cur === 'pleasure' ? 'gourmet' : 'balanced';
  setSlotMealStyle(slotId, next, evt);
}

function regenerateUnvalidatedMeals() {
  const unvalidated = state.slots.filter((s) => s.active !== false && !s.validated);
  if (unvalidated.length === 0) {
    if (confirm('Tous vos repas actifs sont validés. Voulez-vous tirer au sort une toute nouvelle semaine ?')) {
      generateFullWeekPlan();
      renderAll();
      spawnCulinaryConfetti({ count: 18, spread: 200 });
      showToast('🎲 Nouvelle semaine de saison concoctée par le Chef !');
    }
    return;
  }

  const usedRecipes = new Set(
    state.slots.filter((s) => s.active !== false && s.validated).map((s) => s.recipeId)
  );
  const usedDesserts = new Set(
    state.slots
      .filter((s) => s.active !== false && s.validated && s.dessertId)
      .map((s) => s.dessertId)
  );

  state.slots.forEach((slot) => {
    if (slot.active === false || slot.validated) return;
    const pool = getPoolForSlot(slot);
    const slotMonth = getSlotMonthNum(slot);
    const nextRecipe = pickRandomAvoiding(pool, usedRecipes, slotMonth);
    usedRecipes.add(nextRecipe.id);
    slot.recipeId = nextRecipe.id;

    const style = getSlotStyle(slot);
    if (slot.isWeekend || style === 'pleasure' || style === 'gourmet') {
      const styleDesserts = window.RECIPES_DB.weekendDesserts.filter((d) => d.style === style);
      const nextDessert = pickRandomAvoiding(
        styleDesserts.length ? styleDesserts : window.RECIPES_DB.weekendDesserts,
        usedDesserts,
        slotMonth
      );
      usedDesserts.add(nextDessert.id);
      slot.dessertId = nextDessert.id;
    }
  });

  saveStateToStorage();
  renderAll();
  spawnCulinaryConfetti({ count: 14, spread: 160, emojis: ['🎲', '🥗', '🥘', '🍷', '🧑‍🍳'] });
  showToast(`🎲 ${unvalidated.length} repas non validé(s) renouvelé(s) avec un maximum d'ingrédients de saison !`);
}

// ============================================================================
// GESTION DU CURSEUR "PARTS GLOBALES DE LA JOURNÉE" & PARTS PAR REPAS
// ============================================================================
function updateDayGlobalServings(dayOffset, newServings) {
  const count = Math.min(10, Math.max(1, parseInt(newServings, 10) || 2));
  state.slots.forEach((slot) => {
    if (slot.dayOffset === dayOffset) {
      slot.servings = count;
    }
  });
  saveStateToStorage();
  renderAll();
}

function stepDayGlobalServings(dayOffset, delta) {
  const daySlots = state.slots.filter((s) => s.dayOffset === dayOffset);
  if (!daySlots.length) return;
  const current = daySlots[0].servings || 2;
  updateDayGlobalServings(dayOffset, current + delta);
}

function updateSlotServings(slotId, newServings) {
  const count = Math.min(10, Math.max(1, parseInt(newServings, 10) || 2));
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  slot.servings = count;
  saveStateToStorage();

  const slider = document.getElementById(`slider-${slotId}`);
  if (slider && slider.value !== String(count)) {
    slider.value = count;
  }

  const badge = document.getElementById(`servings-badge-${slotId}`);
  if (badge) {
    badge.textContent = `${count} ${count > 1 ? 'convives' : 'convive'}${count === 2 ? ' (2 adultes)' : ''}`;
  }

  const costEl = document.getElementById(`cost-summary-${slotId}`);
  if (costEl) {
    const costInfo = evaluateSlotCost(slot);
    costEl.innerHTML = buildSlotCostBadgeInnerHTML(slot, costInfo);
  }

  const dayCostEl = document.getElementById(`day-cost-badge-${slot.dayOffset}`);
  if (dayCostEl) {
    dayCostEl.textContent = `💶 Journée : ${formatEuro(evaluateDayCost(slot.dayOffset))}`;
  }

  renderValidationStatus();
  renderShoppingList();
}

function stepSlotServings(slotId, delta) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;
  updateSlotServings(slotId, slot.servings + delta);
}

function toggleValidateSlot(slotId, evt) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;
  slot.validated = !slot.validated;
  saveStateToStorage();
  renderAll();

  const activeSlots = state.slots.filter((s) => s.active !== false);
  const validatedCount = activeSlots.filter((s) => s.validated).length;

  if (slot.validated) {
    animateCardElement(slotId, 'anim-validate-pop');

    const originX = evt && evt.clientX ? evt.clientX : window.innerWidth / 2;
    const originY = evt && evt.clientY ? evt.clientY : window.innerHeight / 2;
    const style = getSlotStyle(slot);
    spawnCulinaryConfetti({
      x: originX,
      y: originY,
      count: 14,
      spread: 130,
      emojis: style === 'gourmet' ? GOURMET_PARTICLES : style === 'pleasure' ? PLEASURE_PARTICLES : CULINARY_PARTICLES
    });

    // Vérifier si toute la journée vient d'être bouclée !
    const dayActive = state.slots.filter((s) => s.dayOffset === slot.dayOffset && s.active !== false);
    const isDayNowComplete = dayActive.length > 0 && dayActive.every((s) => s.validated);
    const isWeekNowComplete = activeSlots.length > 0 && validatedCount === activeSlots.length;

    if (isWeekNowComplete) {
      spawnCulinaryConfetti({ count: 32, spread: 260 });
      showDayCelebrationBanner(
        '🏆 Semaine 100% prête !',
        `Les ${validatedCount} repas sont validés • Votre panier de courses vous attend !`,
        '🧑‍🍳'
      );
    } else if (isDayNowComplete) {
      showDayCelebrationBanner(
        `🎉 ${slot.day} est au menu !`,
        `Déjeuner & Dîner validés (${formatEuro(evaluateDayCost(slot.dayOffset))})`,
        style === 'gourmet' ? '🍷' : slot.isWeekend ? '🌟' : '👩‍🍳'
      );
    }
  }

  showToast(
    slot.validated
      ? `✅ ${slot.day} (${slot.mealLabel}) validé — Ajouté au panier (${validatedCount}/${activeSlots.length})`
      : `↺ ${slot.day} (${slot.mealLabel}) retiré du panier (${validatedCount}/${activeSlots.length})`
  );
}

function toggleValidateAllMeals() {
  const activeSlots = state.slots.filter((s) => s.active !== false);
  const allValidated = activeSlots.length > 0 && activeSlots.every((s) => s.validated);
  state.slots.forEach((s) => {
    if (s.active !== false) {
      s.validated = !allValidated;
    }
  });
  saveStateToStorage();
  renderAll();

  if (!allValidated) {
    spawnCulinaryConfetti({ count: 30, spread: 250 });
    showDayCelebrationBanner(
      '🏆 Toute la semaine est validée !',
      `${activeSlots.length} repas prêts dans votre panier de courses`,
      '👨‍🍳'
    );
  }

  showToast(
    !allValidated
      ? `🎉 Les ${activeSlots.length} repas comptabilisés sont validés — Panier prêt !`
      : '↺ Validation réinitialisée — Panier vidé'
  );
}

function validateAllAndRefreshShopping() {
  state.slots.forEach((s) => {
    if (s.active !== false) s.validated = true;
  });
  saveStateToStorage();
  renderAll();
  spawnCulinaryConfetti({ count: 26, spread: 220 });
  showToast('🎉 Tous les repas comptabilisés sont validés et ajoutés au panier !');
}

function handleGenerateShoppingListClick() {
  const validatedSlots = state.slots.filter((s) => s.active !== false && s.validated);
  saveStateToStorage();
  renderAll();
  if (validatedSlots.length === 0) {
    showToast('ℹ️ Validez vos plats pour remplir automatiquement votre panier !');
  } else {
    spawnCulinaryConfetti({ count: 16, spread: 160, emojis: ['🧺', '🥕', '🍅', '🥖', '✨'] });
    showToast(`🧺 Panier prêt avec vos ${validatedSlots.length} repas validé(s) !`);
  }
  switchView('shopping');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// RENDU DE L'INTERFACE (PLANNING SEMAINE & WEEK-END GROUPÉ PAR JOURNÉE)
// ============================================================================
function renderAll() {
  renderDateHeaders();
  renderValidationStatus();
  renderPlannerCards();
  if (typeof renderPantrySection === 'function') {
    renderPantrySection();
  }
  renderShoppingList();
  renderFavoritesAndHistory();
}

function renderDateHeaders() {
  const mondayFull = formatMondayFullLabel(state.weekStartDate);
  const satDate = addDaysToIso(state.weekStartDate, 5);
  const sunDate = addDaysToIso(state.weekStartDate, 6);
  const weekendRangeLabel = `Samedi ${satDate.getDate()} et Dimanche ${sunDate.getDate()} ${sunDate.toLocaleDateString('fr-FR', { month: 'long' })} ${sunDate.getFullYear()}`;

  const dateInput = document.getElementById('week-start-date');
  if (dateInput) dateInput.value = state.weekStartDate;

  const topFormatted = document.getElementById('week-start-formatted');
  if (topFormatted) topFormatted.textContent = mondayFull;

  const weekdayField = document.getElementById('weekday-monday-field');
  if (weekdayField) weekdayField.value = mondayFull;

  const weekendField = document.getElementById('weekend-monday-field');
  if (weekendField) weekendField.value = mondayFull;

  const weekendDatesSpan = document.getElementById('weekend-banner-dates');
  if (weekendDatesSpan) weekendDatesSpan.textContent = weekendRangeLabel;
}

function renderValidationStatus() {
  const activeSlots = state.slots.filter((s) => s.active !== false);
  const total = activeSlots.length;
  const validated = activeSlots.filter((s) => s.validated).length;
  const skippedCount = state.slots.length - total;
  const pct = total > 0 ? Math.round((validated / total) * 100) : 0;

  const bar = document.getElementById('validation-progress-bar');
  const txt = document.getElementById('validation-progress-text');
  const btnAll = document.getElementById('btn-validate-all');
  const moodBadge = document.getElementById('chef-mood-badge');

  if (bar) bar.style.width = `${pct}%`;
  if (txt) {
    txt.textContent = `${validated} / ${total} repas validés${skippedCount > 0 ? ` (${skippedCount} ignoré${skippedCount > 1 ? 's' : ''})` : ''}`;
  }
  if (btnAll) {
    btnAll.textContent = total > 0 && validated === total ? '↺ Dévalider tout' : '✓ Tout valider';
  }
  if (moodBadge) {
    if (pct === 0) {
      moodBadge.textContent = '🧑‍🍳 À vos tabliers !';
    } else if (pct < 40) {
      moodBadge.textContent = '🔪 Ça découpe sec !';
    } else if (pct < 80) {
      moodBadge.textContent = '🥘 Ça mijote bien !';
    } else if (pct < 100) {
      moodBadge.textContent = '🍽️ Presque à table !';
    } else {
      moodBadge.textContent = '🏆 Chef Étoilé (100%)';
    }
  }

  // Compteurs Équilibré / Plaisir / Gourmet en semaine et week-end (sur les repas comptabilisés)
  const weekdayActive = state.slots.filter((s) => !s.isWeekend && s.active !== false);
  const wdBalanced = weekdayActive.filter((s) => getSlotStyle(s) === 'balanced').length;
  const wdPleasure = weekdayActive.filter((s) => getSlotStyle(s) === 'pleasure').length;
  const wdGourmet = weekdayActive.filter((s) => getSlotStyle(s) === 'gourmet').length;
  const weekdayPill = document.getElementById('weekday-pleasure-pill');
  if (weekdayPill) {
    weekdayPill.textContent = `${wdBalanced} Équilibré 🥗 • ${wdPleasure} Plaisir 🌟 • ${wdGourmet} Gourmet 🍷`;
  }

  const weekendActive = state.slots.filter((s) => s.isWeekend && s.active !== false);
  const weBalanced = weekendActive.filter((s) => getSlotStyle(s) === 'balanced').length;
  const wePleasure = weekendActive.filter((s) => getSlotStyle(s) === 'pleasure').length;
  const weGourmet = weekendActive.filter((s) => getSlotStyle(s) === 'gourmet').length;
  const pleasurePill = document.getElementById('pleasure-counter-pill');
  if (pleasurePill) {
    pleasurePill.textContent = `${weBalanced} Équilibré 🥗 • ${wePleasure} Plaisir 🌟 • ${weGourmet} Gourmet 🍷`;
  }

  // Budget validé & budget total prévu de la semaine
  const validatedCost = evaluateValidatedWeekCost();
  const totalWeekCost = evaluateTotalWeekCost();
  const totalCostBadge = document.getElementById('total-week-cost-badge');
  if (totalCostBadge) {
    totalCostBadge.textContent = `💶 Validés : ${formatEuro(validatedCost)} (Prévu : ${formatEuro(totalWeekCost)})`;
  }
}

function buildSlotCostBadgeInnerHTML(slot, costInfo) {
  if (slot.active === false) {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 0.83rem; color: var(--text-muted);">
        <span>💶 <strong>Budget estimé :</strong></span>
        <span>0,00 € (Repas non comptabilisé)</span>
      </div>
    `;
  }

  const details = slot.dessertId
    ? `Plat ${formatEuro(costInfo.dishCost)} + Douceur ${formatEuro(costInfo.dessertCost)}`
    : `${formatEuro(costInfo.perPersonCost)} / part`;

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 0.83rem;">
      <span>💶 <strong>Budget de l'assiette :</strong></span>
      <span style="font-weight: 800; color: var(--primary-hover); font-size: 0.92rem;">
        ${formatEuro(costInfo.totalCost)} <small style="font-weight: 600; color: var(--text-muted);">(${details})</small>
      </span>
    </div>
  `;
}

function createMealCardHTML(slot) {
  const isSkipped = slot.active === false;
  const style = getSlotStyle(slot);
  const recipe = findRecipeById(slot.recipeId);
  const dessert = slot.dessertId ? findDessertById(slot.dessertId) : null;
  const isFav = state.favorites.includes(recipe.id);
  const costInfo = evaluateSlotCost(slot);
  const isLunch = slot.mealLabel === 'Déjeuner';
  const mealIcon = isLunch ? '☀️' : '🌙';
  const dishEmoji = getDishEmoji(recipe, slot);

  const cardClasses = [
    'meal-card',
    !isSkipped && slot.validated ? 'is-validated' : '',
    !isSkipped && style === 'pleasure' ? 'is-pleasure' : '',
    !isSkipped && style === 'gourmet' ? 'is-gourmet' : '',
    isSkipped ? 'is-skipped' : ''
  ]
    .filter(Boolean)
    .join(' ');

  // Si le repas est supprimé / non comptabilisé
  if (isSkipped) {
    return `
      <article id="meal-card-${slot.slotId}" class="${cardClasses}">
        <div class="meal-card-header">
          <span class="slot-label" style="background: #e2e8f0; color: #475569; border-color: #cbd5e1;">
            ${mealIcon} ${slot.mealLabel} — Ignoré
          </span>
          <button
            class="btn btn-primary btn-sm"
            onclick="toggleSlotActive('${slot.slotId}')"
            title="Cliquer pour remettre ce repas au menu"
          >
            🍽️ Remettre au menu
          </button>
        </div>

        <div style="padding: 18px 8px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
          <p>🚫 <strong>Pas de cuisine prévue pour ce ${slot.mealLabel.toLowerCase()} (${slot.day}).</strong></p>
          <p style="font-size: 0.8rem; margin-top: 4px;">
            Aucun ingrédient ni budget (0,00 €) n'est ajouté à votre liste de courses.
          </p>
          <p style="font-size: 0.78rem; margin-top: 6px; opacity: 0.85;">
            (Suggestion gardée sous le coude : <em>${recipe.title}</em>)
          </p>
        </div>
      </article>
    `;
  }

  const styleSubtitle =
    style === 'gourmet'
      ? '🍷 Menu Gourmet • Ingrédients nobles & délicats • Recette simple + Accord Vin'
      : style === 'pleasure'
      ? '🌟 Menu Plaisir • Se faire plaisir • Simple & rapide à réaliser'
      : '🥗 Menu Équilibré • Sain, simple & rapide à réaliser';

  const winePairingHTML = buildWinePairingBoxHTML(recipe, slot, false);

  return `
    <article id="meal-card-${slot.slotId}" class="${cardClasses}">
      <div>
        <div class="meal-card-header">
          <div class="slot-label-group">
            <span class="slot-label ${!isLunch ? 'dinner-slot' : ''}">${mealIcon} ${slot.mealLabel}</span>
            ${slot.validated ? '<span class="chef-stamp-badge">✓ Validé</span>' : ''}
          </div>
          <div class="card-top-badges">
            <button
              class="btn btn-outline btn-sm"
              style="padding: 4px 8px; color: #b91c1c; border-color: #fecaca;"
              onclick="toggleSlotActive('${slot.slotId}')"
              title="Ignorer ce repas (repas extérieur / restes)"
            >
              🚫 Ignorer
            </button>
            <button class="fav-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFavorite('${recipe.id}', event)" title="Ajouter ou retirer de mon carnet de favoris">
              ${isFav ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        <!-- Bouton unique Type de repas (Équilibré / Plaisir / Gourmet) + Bouton Autre idée à côté -->
        <div class="meal-style-bar">
          <div class="meal-style-switcher" role="group" aria-label="Type de repas et Autre idée">
            <button
              type="button"
              class="style-pill-btn ${style === 'gourmet' ? 'active-gourmet' : style === 'pleasure' ? 'active-pleasure' : 'active-balanced'}"
              onclick="togglePleasureMode('${slot.slotId}', event)"
              title="Cliquer pour changer de catégorie : Équilibré 🥗 → Plaisir 🌟 → Gourmet 🍷"
            >
              ${style === 'gourmet' ? '🍷 Gourmet ↻' : style === 'pleasure' ? '🌟 Plaisir ↻' : '🥗 Équilibré ↻'}
            </button>
            <button
              type="button"
              class="style-pill-btn"
              onclick="replaceMealInSlot('${slot.slotId}', event)"
              title="Proposer une autre recette de la catégorie sélectionnée"
            >
              🎲 Autre idée
            </button>
          </div>
          <div class="meal-style-caption">${styleSubtitle}</div>
        </div>

        <!-- Sélection du nombre de parts juste en dessous des boutons du type de repas et autre idée (boutons - et + avec nombre de convives au milieu, sans curseur) -->
        <div class="servings-control" style="margin-top: 8px; flex-direction: row; align-items: center; justify-content: space-between; padding: 7px 12px;">
          <span style="font-size: 0.82rem; font-weight: 800; color: var(--text-main);">🍽️ À table (${slot.mealLabel.toLowerCase()}) :</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="btn btn-outline btn-sm btn-step-servings" onclick="stepSlotServings('${slot.slotId}', -1)" aria-label="Moins un convive">−</button>
            <span id="servings-badge-${slot.slotId}" class="servings-badge" style="min-width: 110px; text-align: center; padding: 4px 10px;">
              ${slot.servings} ${slot.servings > 1 ? 'convives' : 'convive'}${slot.servings === 2 ? ' (2 adultes)' : ''}
            </span>
            <button type="button" class="btn btn-outline btn-sm btn-step-servings" onclick="stepSlotServings('${slot.slotId}', 1)" aria-label="Plus un convive">+</button>
          </div>
        </div>

        <div class="meal-title-row">
          <div class="meal-dish-avatar" onclick="openRecipeModal('${slot.slotId}')" style="cursor:pointer;" title="Voir la fiche recette">
            ${dishEmoji}
          </div>
          <div style="flex: 1;">
            <h3 class="meal-title" onclick="openRecipeModal('${slot.slotId}')">${recipe.title}</h3>
            <p class="meal-desc">${recipe.description || ''}</p>
          </div>
        </div>

        <div class="meal-meta" style="margin-top: 10px;">
          <span class="meta-pill">⏱️ Prépa ${recipe.prepTime} • Feu ${recipe.cookTime}</span>
          <span class="meta-pill">👨‍🍳 ${recipe.difficulty}</span>
          <span class="meta-pill">${recipe.budget}</span>
        </div>

        <!-- Indicateurs Saisonnalité (%) & Équilibre alimentaire (Nutri-Score A-E) -->
        ${buildNutritionAndSeasonHTML(recipe, slot, false)}

        ${winePairingHTML}

        <!-- Évaluation du montant du menu -->
        <div id="cost-summary-${slot.slotId}" class="slot-cost-box">
          ${buildSlotCostBadgeInnerHTML(slot, costInfo)}
        </div>

        ${
          dessert
            ? `
          <div class="dessert-box" style="margin-top: 10px;">
            <div class="dessert-header">
              <span class="dessert-tag">🍰 Note sucrée du repas</span>
              <div style="display: flex; gap: 4px;">
                <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.74rem;" onclick="openCatalogModal('${slot.slotId}', 'dessert')" title="Choisir un dessert dans le catalogue">
                  📚 Choisir
                </button>
                <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.74rem;" onclick="replaceDessertInSlot('${slot.slotId}')">
                  🎲 Autre dessert
                </button>
              </div>
            </div>
            <div class="dessert-title">${dessert.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              ⏱️ Prépa ${dessert.prepTime} ${dessert.cookTime && dessert.cookTime !== '0 min' ? `• Cuisson ${dessert.cookTime}` : ''}
            </div>
          </div>
        `
            : ''
        }
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
        <!-- Boutons Recette / Catalogue / Valider -->
        <div class="meal-card-actions">
          <button class="btn btn-outline btn-sm" onclick="openRecipeModal('${slot.slotId}')">
            📖 Fiche cuisine
          </button>
          <button class="btn btn-outline btn-sm" onclick="openCatalogModal('${slot.slotId}')" title="Parcourir tout le catalogue de menus">
            📚 Catalogue
          </button>
          <button
            class="btn btn-validate ${slot.validated ? 'validated' : ''}"
            onclick="toggleValidateSlot('${slot.slotId}', event)"
          >
            ${slot.validated ? '✅ Plat validé au menu (Modifier)' : '👩‍🍳 Valider ce plat'}
          </button>
        </div>
      </div>
    </article>
  `;
}

const DAY_NAMES_LIST = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DAY_SHORT_LIST = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function selectPlannerDay(dayOffset) {
  const clamped = Math.max(0, Math.min(6, Number(dayOffset) || 0));
  state.selectedDayOffset = clamped;
  renderPlannerCards();
}

function stepPlannerDay(delta) {
  const next = state.selectedDayOffset + delta;
  if (next < 0 || next > 6) return;
  state.selectedDayOffset = next;
  renderPlannerCards();
  const pagerEl = document.getElementById('day-pager-container');
  if (pagerEl) {
    pagerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function togglePlannerViewMode() {
  state.plannerViewMode = state.plannerViewMode === 'day' ? 'week' : 'day';
  renderPlannerCards();
  showToast(
    state.plannerViewMode === 'day'
      ? '📱 Vue Semainier : 1 page par journée (Midi & Soir)'
      : '🗓️ Vue Semaine complète : les 7 jours d\'un coup d\'œil'
  );
}

function validateDayAndNext(dayOffset, evt) {
  const daySlots = state.slots.filter((s) => s.dayOffset === dayOffset && s.active !== false);
  daySlots.forEach((s) => {
    s.validated = true;
  });
  saveStateToStorage();

  const dayName = DAY_NAMES_LIST[dayOffset] || 'Journée';
  const dayCost = formatEuro(evaluateDayCost(dayOffset));

  const originX = evt && evt.clientX ? evt.clientX : window.innerWidth / 2;
  const originY = evt && evt.clientY ? evt.clientY : window.innerHeight * 0.7;

  spawnCulinaryConfetti({
    x: originX,
    y: originY,
    count: 24,
    spread: 210,
    emojis: dayOffset >= 5 ? PLEASURE_PARTICLES : CULINARY_PARTICLES
  });

  if (dayOffset < 6) {
    const nextDayName = DAY_NAMES_LIST[dayOffset + 1];
    showDayCelebrationBanner(
      `👩‍🍳 ${dayName} bouclé !`,
      `Budget du jour : ${dayCost} • En route pour ${nextDayName} !`,
      dayOffset >= 5 ? '🌟' : '🥗'
    );
    state.selectedDayOffset = dayOffset + 1;
    renderAll();
    showToast(`✅ ${dayName} validé ! Place au menu de ${nextDayName}`);
    const pagerEl = document.getElementById('day-pager-container');
    if (pagerEl) pagerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    showDayCelebrationBanner(
      '🏆 Semaine bouclée avec brio !',
      `${dayName} validé (${dayCost}) • Votre panier de courses est prêt !`,
      '🎉'
    );
    renderAll();
    showToast(`🎉 ${dayName} validé ! Toute votre semaine est prête.`);
  }
}

function renderDayPager() {
  const container = document.getElementById('day-pager-container');
  if (!container) return;

  const isDayMode = state.plannerViewMode === 'day';
  const curOffset = state.selectedDayOffset || 0;
  const curDayName = DAY_NAMES_LIST[curOffset];
  const curFullTitle = formatFullDayTitle(curDayName, curOffset);

  const tabsHTML = [0, 1, 2, 3, 4, 5, 6]
    .map((offset) => {
      const d = addDaysToIso(state.weekStartDate, offset);
      const dayNum = d.getDate();
      const daySlots = state.slots.filter((s) => s.dayOffset === offset);
      const activeSlots = daySlots.filter((s) => s.active !== false);
      const validatedCount = activeSlots.filter((s) => s.validated).length;
      const isComplete = activeSlots.length > 0 && validatedCount === activeSlots.length;

      let statusIcon = '⚪';
      if (activeSlots.length === 0) {
        statusIcon = '➖';
      } else if (isComplete) {
        statusIcon = '✅';
      } else if (validatedCount > 0) {
        statusIcon = '🥘';
      }

      const isWeekend = offset >= 5;
      const isActive = isDayMode && curOffset === offset;

      return `
        <button
          type="button"
          class="day-tab-btn ${isWeekend ? 'is-weekend-tab' : ''} ${isComplete ? 'is-day-complete' : ''} ${isActive ? 'active' : ''}"
          onclick="if(state.plannerViewMode!=='day'){state.plannerViewMode='day';} selectPlannerDay(${offset})"
          title="${DAY_NAMES_LIST[offset]} ${dayNum}"
        >
          <span class="day-tab-short">${DAY_SHORT_LIST[offset]}${isWeekend ? '🌟' : ''}</span>
          <span class="day-tab-num">${dayNum}</span>
          <span class="day-tab-status">${statusIcon}</span>
        </button>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="day-pager-card">
      <div class="day-pager-top-row">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.88rem; font-weight: 800; color: var(--primary-hover);">
            ${isDayMode ? `📖 Semainier • Jour ${curOffset + 1}/7 (${curDayName})` : '🗓️ Vue d\'ensemble des 7 jours'}
          </span>
        </div>
        <button
          type="button"
          class="btn btn-outline btn-sm"
          onclick="togglePlannerViewMode()"
          style="font-weight: 800; font-size: 0.78rem;"
        >
          ${isDayMode ? '🗓️ Déplier les 7 jours' : '📱 Mode 1 Jour / Page'}
        </button>
      </div>

      <div class="day-tabs-strip" role="tablist" aria-label="Jours de la semaine">
        ${tabsHTML}
      </div>

      ${
        isDayMode
          ? `
        <div class="day-pager-arrows">
          <button
            type="button"
            class="btn btn-outline btn-sm"
            onclick="stepPlannerDay(-1)"
            ${curOffset === 0 ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}
          >
            ◀ ${curOffset > 0 ? DAY_SHORT_LIST[curOffset - 1] : 'Début'}
          </button>

          <div class="day-pager-current-label">
            🍽️ ${curFullTitle}
          </div>

          <button
            type="button"
            class="btn btn-primary btn-sm"
            onclick="stepPlannerDay(1)"
            ${curOffset === 6 ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}
          >
            ${curOffset < 6 ? DAY_SHORT_LIST[curOffset + 1] : 'Fin'} ▶
          </button>
        </div>
      `
          : ''
      }
    </div>
  `;
}

function createDayGroupHTML(dayOffset) {
  const daySlots = state.slots.filter((s) => s.dayOffset === dayOffset);
  if (!daySlots.length) return '';

  const dayName = daySlots[0].day;
  const fullDayTitle = formatFullDayTitle(dayName, dayOffset);
  const dayCost = evaluateDayCost(dayOffset);
  const dayServings = daySlots[0].servings || 2;
  const activeSlots = daySlots.filter((s) => s.active !== false);
  const activeCount = activeSlots.length;
  const allDayValidated = activeCount > 0 && activeSlots.every((s) => s.validated);
  const isDayMode = state.plannerViewMode === 'day';

  const bottomPagerHTML = isDayMode
    ? `
      <div class="day-bottom-pager">
        <button
          type="button"
          class="btn btn-outline btn-sm"
          onclick="stepPlannerDay(-1)"
          ${dayOffset === 0 ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}
        >
          ◀ ${dayOffset > 0 ? DAY_NAMES_LIST[dayOffset - 1] : 'Lundi'}
        </button>

        <button
          type="button"
          class="btn btn-day-validate-next ${allDayValidated ? 'is-done' : ''}"
          onclick="validateDayAndNext(${dayOffset}, event)"
        >
          ${
            allDayValidated
              ? dayOffset < 6
                ? `🎉 ${dayName} est validé ! Passer à ${DAY_NAMES_LIST[dayOffset + 1]} ▶`
                : `🎉 ${dayName} est validé !`
              : dayOffset < 6
              ? `✨ Valider ${dayName} & passer à ${DAY_NAMES_LIST[dayOffset + 1]} ▶`
              : `✨ Valider mon ${dayName} !`
          }
        </button>

        ${
          dayOffset < 6
            ? `
          <button
            type="button"
            class="btn btn-primary btn-sm"
            onclick="stepPlannerDay(1)"
          >
            ${DAY_NAMES_LIST[dayOffset + 1]} ▶
          </button>
        `
            : `
          <button
            type="button"
            class="btn btn-keep btn-sm"
            onclick="handleGenerateShoppingListClick()"
          >
            🧺 Mon Panier ▶
          </button>
        `
        }
      </div>
    `
    : '';

  return `
    <div class="day-group ${allDayValidated ? 'day-fully-validated' : ''}">
      <div class="day-group-header">
        <div class="day-title-box">
          <h3 class="day-title">🍽️ ${fullDayTitle}</h3>
          ${allDayValidated ? '<span class="day-validated-ribbon">🎉 Journée validée !</span>' : ''}
          <span id="day-cost-badge-${dayOffset}" class="meta-pill healthy-pill">
            💶 Journée : ${formatEuro(dayCost)}
          </span>
          <span class="meta-pill">
            ${activeCount} / ${daySlots.length} repas à cuisiner
          </span>
        </div>
      </div>

      <div class="day-meals-pair">
        ${daySlots.map(createMealCardHTML).join('')}
      </div>

      ${bottomPagerHTML}
    </div>
  `;
}

function renderPlannerCards() {
  renderDayPager();

  const weekdayBanner = document.getElementById('weekday-section-banner');
  const weekendBanner = document.getElementById('weekend-section-banner');
  const weekdayGrid = document.getElementById('weekday-meals-grid');
  const weekendGrid = document.getElementById('weekend-meals-grid');

  if (state.plannerViewMode === 'day') {
    const curOffset = state.selectedDayOffset || 0;
    const isWeekendDay = curOffset >= 5;

    if (weekdayBanner) weekdayBanner.style.display = isWeekendDay ? 'none' : 'flex';
    if (weekdayGrid) {
      weekdayGrid.style.display = isWeekendDay ? 'none' : 'flex';
      weekdayGrid.innerHTML = isWeekendDay ? '' : createDayGroupHTML(curOffset);
    }

    if (weekendBanner) weekendBanner.style.display = isWeekendDay ? 'flex' : 'none';
    if (weekendGrid) {
      weekendGrid.style.display = isWeekendDay ? 'flex' : 'none';
      weekendGrid.innerHTML = isWeekendDay ? createDayGroupHTML(curOffset) : '';
    }
  } else {
    if (weekdayBanner) weekdayBanner.style.display = 'flex';
    if (weekdayGrid) {
      weekdayGrid.style.display = 'flex';
      weekdayGrid.innerHTML = [0, 1, 2, 3, 4].map(createDayGroupHTML).join('');
    }

    if (weekendBanner) weekendBanner.style.display = 'flex';
    if (weekendGrid) {
      weekendGrid.style.display = 'flex';
      weekendGrid.innerHTML = [5, 6].map(createDayGroupHTML).join('');
    }
  }
}

// ============================================================================
// MODALE DE RECETTE DÉTAILLÉE (AVEC RECALCUL DES QUANTITÉS ET DU COÛT)
// ============================================================================
function formatScaledQty(qty, ratio) {
  const scaled = qty * ratio;
  if (Number.isInteger(scaled)) return scaled.toString();
  const rounded = Math.round(scaled * 10) / 10;
  return rounded.toString().replace('.', ',');
}

function openRecipeModal(slotId) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  const recipe = findRecipeById(slot.recipeId);
  const dessert = slot.dessertId ? findDessertById(slot.dessertId) : null;
  const ratio = slot.servings / (recipe.baseServings || 2);
  const costInfo = evaluateSlotCost(slot);
  const style = getSlotStyle(slot);

  const modalBody = document.getElementById('recipe-modal-body');
  if (!modalBody) return;

  const slotMonth = getSlotMonthNum(slot);
  const seasonMeta = getMonthSeasonMeta(slotMonth);
  const seasInfo = getRecipeSeasonality(recipe, slot);

  const ingredientsHTML = recipe.ingredients
    .map((ing) => {
      const check =
        typeof window.isIngredientInSeason === 'function'
          ? window.isIngredientInSeason(ing.name, slotMonth)
          : { inSeason: true };
      const inSeas = check && typeof check === 'object' ? check.inSeason : Boolean(check);
      const seasTag = inSeas
        ? `<span style="font-size: 0.72rem; padding: 1px 6px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 700; margin-left: 6px;">🌿 De saison</span>`
        : `<span style="font-size: 0.72rem; padding: 1px 6px; border-radius: 999px; background: #fef3c7; color: #92400e; font-weight: 600; margin-left: 6px;">Hors pleine saison (${seasonMeta.monthName})</span>`;
      return `
      <li style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed var(--border-color); font-size: 0.9rem;">
        <span>${ing.name} ${seasTag}</span>
        <strong>${formatScaledQty(ing.qty, ratio)} ${ing.unit}</strong>
      </li>
    `;
    })
    .join('');

  const stepsHTML = recipe.steps.map((step) => `<li>${step}</li>`).join('');
  const wineModalHTML = buildWinePairingBoxHTML(recipe, slot, true);
  const nutritionAndSeasonModalHTML = buildNutritionAndSeasonHTML(recipe, slot, false);

  let dessertSectionHTML = '';
  if (dessert) {
    const dessertRatio = slot.servings / (dessert.baseServings || 2);
    const dessertIngHTML = dessert.ingredients
      .map(
        (ing) => `
        <li style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #fde68a; font-size: 0.88rem;">
          <span>${ing.name}</span>
          <strong>${formatScaledQty(ing.qty, dessertRatio)} ${ing.unit}</strong>
        </li>
      `
      )
      .join('');
    const dessertStepsHTML = dessert.steps.map((st) => `<li>${st}</li>`).join('');

    dessertSectionHTML = `
      <div style="margin-top: 22px; padding: 16px; background: var(--pleasure-soft); border: 1px solid #fcd34d; border-radius: var(--radius-md);">
        <h4 style="font-size: 1rem; font-weight: 800; color: var(--pleasure-hover); margin-bottom: 8px;">
          🍰 Recette du Dessert : ${dessert.title} (${slot.servings} ${slot.servings > 1 ? 'parts' : 'part'} — évalué à ${formatEuro(costInfo.dessertCost)})
        </h4>
        <ul style="list-style: none; margin-bottom: 12px;">
          ${dessertIngHTML}
        </ul>
        <strong style="font-size: 0.88rem;">Préparation du dessert :</strong>
        <ol class="recipe-steps">
          ${dessertStepsHTML}
        </ol>
      </div>
    `;
  }

  const styleBadgeText =
    style === 'gourmet'
      ? '🍷 Menu Gourmet (Ingrédients nobles & Accord Vin)'
      : style === 'pleasure'
      ? '🌟 Menu Plaisir (Gourmand, simple & rapide)'
      : '🥗 Menu Équilibré (Sain, simple & rapide)';

  modalBody.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <span class="slot-label">${formatSlotDayHeader(slot)} • ${slot.mealLabel}</span>
      <span class="meta-pill ${style === 'gourmet' ? 'gourmet-pill' : style === 'pleasure' ? 'pleasure-pill' : 'healthy-pill'}">${styleBadgeText}</span>
    </div>
    <h2 style="font-size: 1.3rem; font-weight: 800; margin-top: 8px;">${recipe.title}</h2>
    <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">${recipe.description || ''}</p>

    <div class="meal-meta" style="margin: 12px 0 8px 0;">
      <span class="meta-pill">👥 Ajusté pour <strong>${slot.servings} ${slot.servings > 1 ? 'parts' : 'part'}</strong></span>
      <span class="meta-pill healthy-pill">💶 Montant évalué : <strong>${formatEuro(costInfo.totalCost)}</strong> (${formatEuro(costInfo.perPersonCost)}/part)</span>
      <span class="meta-pill">⏱️ Prépa ${recipe.prepTime} • Cuisson ${recipe.cookTime}</span>
      <span class="meta-pill">👨‍🍳 ${recipe.difficulty}</span>
    </div>

    ${nutritionAndSeasonModalHTML}

    ${wineModalHTML}

    <h3 style="font-size: 1rem; font-weight: 800; margin-top: 16px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
      <span>🛒 Ingrédients du plat (${slot.servings} ${slot.servings > 1 ? 'parts' : 'part'} — ${formatEuro(costInfo.dishCost)})</span>
      <span class="season-badge ${seasInfo.pct >= 85 ? 'season-pill-high' : seasInfo.pct >= 70 ? 'season-pill-mid' : 'season-pill-low'}">
        ${seasonMeta.icon} ${seasInfo.pct}% d'ingrédients de saison (${seasInfo.inSeasonCount}/${seasInfo.totalCount})
      </span>
    </h3>
    <ul style="list-style: none;">
      ${ingredientsHTML}
    </ul>

    <h3 style="font-size: 1rem; font-weight: 800; margin-top: 18px;">👩‍🍳 Étapes de la recette</h3>
    <ol class="recipe-steps">
      ${stepsHTML}
    </ol>

    ${dessertSectionHTML}

    <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn btn-outline" onclick="closeRecipeModal()">Fermer</button>
      <button class="btn btn-primary" onclick="toggleValidateSlot('${slot.slotId}'); closeRecipeModal();">
        ${slot.validated ? '✓ Déjà validé' : '✓ Valider ce menu'}
      </button>
    </div>
  `;

  document.getElementById('recipe-modal').classList.add('open');
}

function closeRecipeModal() {
  document.getElementById('recipe-modal').classList.remove('open');
}

// ============================================================================
// MODALE CATALOGUE COMPLET & RECHERCHE DE MENUS / DESSERTS
// ============================================================================
let catalogState = {
  slotId: null,
  category: 'all', // 'all' | 'weekday' | 'weekend-balanced' | 'weekend-pleasure' | 'gourmet' | 'dessert' | 'favorites'
  searchQuery: ''
};

function openCatalogModal(slotId, initialCategory) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  catalogState.slotId = slotId;
  catalogState.searchQuery = '';
  const style = getSlotStyle(slot);

  if (initialCategory) {
    catalogState.category = initialCategory;
  } else if (style === 'gourmet') {
    catalogState.category = 'gourmet';
  } else if (style === 'pleasure') {
    catalogState.category = 'weekend-pleasure';
  } else if (slot.isWeekend) {
    catalogState.category = 'weekend-balanced';
  } else {
    catalogState.category = 'weekday';
  }

  const modalBody = document.getElementById('recipe-modal-body');
  if (!modalBody) return;

  const db = window.RECIPES_DB;
  const wdCount = (db.weekdayDinners || []).length;
  const wbCount = (db.weekendBalancedMeals || []).length;
  const wpCount = (db.weekendPleasureMeals || []).length;
  const gmCount = (db.gourmetMeals || []).length;
  const desCount = (db.weekendDesserts || []).length;
  const totalDishes = wdCount + wbCount + wpCount + gmCount;

  modalBody.innerHTML = `
    <span class="slot-label">📚 Grand Livre des Menus 365 Jours • ${formatSlotDayHeader(slot)} (${slot.mealLabel})</span>
    <h2 style="font-size: 1.25rem; font-weight: 800; margin-top: 8px;">
      Choisir dans le catalogue (${totalDishes} plats &amp; ${desCount} desserts)
    </h2>
    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
      Tous les plats affichent leur <strong>% d'ingrédients de saison (50% à 100%)</strong> et leur niveau d'<strong>Équilibre</strong> • Priorité aux plats avec un maximum d'ingrédients de saison
    </p>

    <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
      <input
        type="search"
        id="catalog-search-input"
        class="input-field"
        placeholder="🔍 Rechercher un plat, un ingrédient, une appellation, un cépage..."
        oninput="updateCatalogSearch(this.value)"
      />

      <div id="catalog-filter-tabs" style="display: flex; gap: 6px; flex-wrap: wrap;">
        <button type="button" class="btn btn-sm" data-cat="weekday" onclick="setCatalogCategory('weekday')">
          🥗 Semaine Équilibré (${wdCount})
        </button>
        <button type="button" class="btn btn-sm" data-cat="weekend-balanced" onclick="setCatalogCategory('weekend-balanced')">
          🍽️ Week-end Équilibré (${wbCount})
        </button>
        <button type="button" class="btn btn-sm" data-cat="weekend-pleasure" onclick="setCatalogCategory('weekend-pleasure')">
          🌟 Menus Plaisir (${wpCount})
        </button>
        <button type="button" class="btn btn-sm" data-cat="gourmet" onclick="setCatalogCategory('gourmet')">
          🍷 Menus Gourmet (${gmCount})
        </button>
        <button type="button" class="btn btn-sm" data-cat="all" onclick="setCatalogCategory('all')">
          📚 Tous les plats (${totalDishes})
        </button>
        <button type="button" class="btn btn-sm" data-cat="favorites" onclick="setCatalogCategory('favorites')">
          ❤️ Favoris (${state.favorites.length})
        </button>
        <button type="button" class="btn btn-sm" data-cat="dessert" onclick="setCatalogCategory('dessert')">
          🍰 Desserts (${desCount})
        </button>
      </div>
    </div>

    <div
      id="catalog-results-list"
      style="margin-top: 14px; max-height: 52vh; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;"
    ></div>

    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <button class="btn btn-outline" onclick="closeRecipeModal()">Fermer</button>
    </div>
  `;

  renderCatalogModalResults();
  document.getElementById('recipe-modal').classList.add('open');
}

function setCatalogCategory(cat) {
  catalogState.category = cat;
  renderCatalogModalResults();
}

function updateCatalogSearch(val) {
  catalogState.searchQuery = (val || '').trim().toLowerCase();
  renderCatalogModalResults();
}

function renderCatalogModalResults() {
  const container = document.getElementById('catalog-results-list');
  if (!container) return;

  const slot = state.slots.find((s) => s.slotId === catalogState.slotId);
  const db = window.RECIPES_DB;

  // Mettre à jour l'état visuel des boutons d'onglets
  document.querySelectorAll('#catalog-filter-tabs button').forEach((btn) => {
    const isAct = btn.getAttribute('data-cat') === catalogState.category;
    btn.className = `btn btn-sm ${isAct ? 'btn-primary' : 'btn-outline'}`;
  });

  const q = catalogState.searchQuery;

  if (catalogState.category === 'dessert') {
    const desserts = db.weekendDesserts.filter((d) => {
      if (!q) return true;
      const inTitle = d.title.toLowerCase().includes(q);
      const inIng = (d.ingredients || []).some((i) => i.name.toLowerCase().includes(q));
      return inTitle || inIng;
    });

    if (desserts.length === 0) {
      container.innerHTML = `<p style="padding: 16px; text-align: center; color: var(--text-muted);">Aucun dessert ne correspond à votre recherche.</p>`;
      return;
    }

    container.innerHTML = desserts
      .map((d) => {
        const isCurrent = slot && slot.dessertId === d.id;
        const dSeas = getRecipeSeasonality(d, slot);
        const dMeta = getMonthSeasonMeta(dSeas.month);
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-color)'}; background: ${isCurrent ? 'var(--primary-soft)' : '#fff'}; border-radius: 10px;">
            <div>
              <div style="font-weight: 800; font-size: 0.92rem;">🍰 ${d.title}</div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
                ⏱️ Prépa ${d.prepTime} ${d.cookTime && d.cookTime !== '0 min' ? `• Cuisson ${d.cookTime}` : ''} • 💶 ${formatEuro(d.costFor2 || 2.3)} (2 parts) • ${dMeta.icon} <strong>${dSeas.pct}% d'ingrédients de saison</strong>
              </div>
            </div>
            <button class="btn ${isCurrent ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="selectDessertFromCatalog('${d.id}')">
              ${isCurrent ? '✓ Sélectionné' : 'Choisir'}
            </button>
          </div>
        `;
      })
      .join('');
    return;
  }

  const allMeals = [
    ...(db.weekdayDinners || []),
    ...(db.weekendBalancedMeals || []),
    ...(db.weekendPleasureMeals || []),
    ...(db.gourmetMeals || [])
  ];

  let list = [];
  if (catalogState.category === 'weekday') {
    list = db.weekdayDinners || [];
  } else if (catalogState.category === 'weekend-balanced') {
    list = db.weekendBalancedMeals || [];
  } else if (catalogState.category === 'weekend-pleasure') {
    list = db.weekendPleasureMeals || [];
  } else if (catalogState.category === 'gourmet') {
    list = db.gourmetMeals || [];
  } else if (catalogState.category === 'favorites') {
    list = allMeals.filter((r) => state.favorites.includes(r.id));
  } else {
    list = allMeals;
  }

  const filtered = list.filter((r) => {
    if (!q) return true;
    const inTitle = r.title.toLowerCase().includes(q);
    const inDesc = (r.description || '').toLowerCase().includes(q);
    const inTags = (r.tags || []).some((t) => t.toLowerCase().includes(q));
    const inIng = (r.ingredients || []).some((i) => i.name.toLowerCase().includes(q));
    const wp = r.winePairing || {};
    const inWine = `${wp.name || ''} ${wp.appellation || ''} ${wp.region || ''} ${wp.color || ''} ${wp.grape || ''}`.toLowerCase().includes(q);
    const nutri = getRecipeNutriScore(r);
    const inNutri = `équilibre ${nutri.label.toLowerCase()} ${nutri.shortLabel.toLowerCase()}`.includes(q);
    return inTitle || inDesc || inTags || inIng || inWine || inNutri;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p style="padding: 16px; text-align: center; color: var(--text-muted);">Aucune recette trouvée pour cette recherche.</p>`;
    return;
  }

  // Trier en mettant en avant les recettes avec le plus haut % d'ingrédients de saison
  const sorted = [...filtered].sort((a, b) => {
    const sa = getRecipeSeasonality(a, slot).pct;
    const sb = getRecipeSeasonality(b, slot).pct;
    return sb - sa;
  });

  // Limiter l'affichage DOM direct à 150 éléments max si aucune recherche pour garder un défilement ultra-fluide
  const displayList = q ? sorted : sorted.slice(0, 150);

  container.innerHTML = displayList
    .map((r) => {
      const isCurrent = slot && slot.recipeId === r.id;
      const emoji = getDishEmoji(r, slot);
      const ingPreview = (r.ingredients || []).slice(0, 4).map((i) => i.name).join(', ');
      const wp = r.winePairing;
      const wineLine = wp && (wp.appellation || wp.name)
        ? `<div style="font-size: 0.75rem; color: #881337; font-weight: 700; margin-top: 3px;">🍷 Vin : <strong>${wp.appellation || wp.name}</strong> • Couleur : ${wp.color || '—'} • Région : ${wp.region || '—'} • Cépage : ${wp.grape || '—'}</div>`
        : '';
      const compactBadges = buildNutritionAndSeasonHTML(r, slot, true);
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-color)'}; background: ${isCurrent ? 'var(--primary-soft)' : '#fff'}; border-radius: 10px;">
          <div style="flex: 1;">
            <div style="font-weight: 800; font-size: 0.93rem;">${emoji} ${r.title}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
              ⏱️ Prépa ${r.prepTime} • Feu ${r.cookTime} • 👨‍🍳 ${r.difficulty} • 💶 ${formatEuro(r.costFor2 || 4.5)} (2p)
            </div>
            ${compactBadges}
            ${wineLine}
            <div style="font-size: 0.74rem; color: #64748b; margin-top: 2px;">
              🛒 ${ingPreview}...
            </div>
          </div>
          <button class="btn ${isCurrent ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="selectRecipeFromCatalog('${r.id}')">
            ${isCurrent ? '✓ Actuel' : 'Choisir'}
          </button>
        </div>
      `;
    })
    .join('');
}

function selectRecipeFromCatalog(recipeId) {
  const slot = state.slots.find((s) => s.slotId === catalogState.slotId);
  if (!slot) return;

  const recipe = findRecipeById(recipeId);
  slot.recipeId = recipe.id;

  const newStyle =
    recipe.type === 'gourmet'
      ? 'gourmet'
      : recipe.type === 'weekend-pleasure'
      ? 'pleasure'
      : 'balanced';
  syncSlotStyleFlags(slot, newStyle);

  slot.active = true;
  slot.validated = false;

  if ((newStyle === 'pleasure' || newStyle === 'gourmet') && !slot.dessertId) {
    const styleDesserts = window.RECIPES_DB.weekendDesserts.filter((d) => d.style === newStyle);
    slot.dessertId = (styleDesserts[0] || window.RECIPES_DB.weekendDesserts[0]).id;
  }

  recentSeenIds.add(recipe.id);
  saveStateToStorage();
  closeRecipeModal();
  renderAll();
  animateCardElement(slot.slotId, 'anim-shuffle');
  showToast(`🍽️ "${recipe.title}" choisi pour ${slot.day} (${slot.mealLabel}) !`);
}

function selectDessertFromCatalog(dessertId) {
  const slot = state.slots.find((s) => s.slotId === catalogState.slotId);
  if (!slot) return;

  const dessert = findDessertById(dessertId);
  slot.dessertId = dessert.id;
  recentSeenIds.add(dessert.id);
  saveStateToStorage();
  closeRecipeModal();
  renderAll();
  animateCardElement(slot.slotId, 'anim-shuffle');
  showToast(`🍰 Dessert "${dessert.title}" choisi pour ${slot.day} (${slot.mealLabel}) !`);
}

// ============================================================================
// CALCUL DE LA LISTE DE COURSES PAR RAYON & GESTION DU STOCK
// (Ne prend en compte QUE les repas comptabilisés ET validés : slot.active !== false && slot.validated)
// ============================================================================
function isShoppingItemInStock(item) {
  if (!item) return false;
  if (Object.prototype.hasOwnProperty.call(state.inStockKeys, item.key)) {
    return !!state.inStockKeys[item.key];
  }
  if (state.deductPantryFromShopping && item.pantryCoveredFull) {
    return true;
  }
  return false;
}

function buildAggregatedShoppingList() {
  const map = new Map();

  state.slots.forEach((slot) => {
    // Ignorer les repas supprimés (non comptabilisés) ou non encore validés
    if (slot.active === false || !slot.validated) return;

    const recipe = findRecipeById(slot.recipeId);
    const ratio = slot.servings / (recipe.baseServings || 2);

    recipe.ingredients.forEach((ing) => {
      const normalizedKey = `${ing.name.trim().toLowerCase()}|${ing.unit.trim().toLowerCase()}`;
      const scaledQty = ing.qty * ratio;

      if (!map.has(normalizedKey)) {
        map.set(normalizedKey, {
          key: normalizedKey,
          name: ing.name,
          qty: scaledQty,
          initialQty: scaledQty,
          unit: ing.unit,
          aisle: ing.aisle || 'Épicerie salée',
          sources: [`${slot.day} (${slot.mealLabel})`]
        });
      } else {
        const existing = map.get(normalizedKey);
        existing.qty += scaledQty;
        existing.initialQty = existing.qty;
        const sourceTag = `${slot.day} (${slot.mealLabel})`;
        if (!existing.sources.includes(sourceTag)) {
          existing.sources.push(sourceTag);
        }
      }
    });

    if (slot.dessertId) {
      const dessert = findDessertById(slot.dessertId);
      const dRatio = slot.servings / (dessert.baseServings || 2);
      dessert.ingredients.forEach((ing) => {
        const normalizedKey = `${ing.name.trim().toLowerCase()}|${ing.unit.trim().toLowerCase()}`;
        const scaledQty = ing.qty * dRatio;

        if (!map.has(normalizedKey)) {
          map.set(normalizedKey, {
            key: normalizedKey,
            name: ing.name,
            qty: scaledQty,
            initialQty: scaledQty,
            unit: ing.unit,
            aisle: ing.aisle || 'Épicerie sucrée & Pâtisserie',
            sources: [`Dessert ${slot.day} (${slot.mealLabel})`]
          });
        } else {
          const existing = map.get(normalizedKey);
          existing.qty += scaledQty;
          existing.initialQty = existing.qty;
          const sourceTag = `Dessert ${slot.day} (${slot.mealLabel})`;
          if (!existing.sources.includes(sourceTag)) {
            existing.sources.push(sourceTag);
          }
        }
      });
    }
  });

  state.customItems.forEach((custom) => {
    const key = `custom_${custom.id}`;
    map.set(key, {
      key,
      name: custom.name,
      qty: custom.qty,
      unit: '',
      aisle: custom.aisle || 'Boulangerie & Divers',
      sources: [custom.sourceLabel || 'Ajout personnel'],
      isCustom: true,
      customId: custom.id
    });
  });

  const list = Array.from(map.values());

  // Déduction intelligente avec le contenu du Frigo & Placard (si activé)
  if (state.deductPantryFromShopping && Array.isArray(state.pantryItems) && state.pantryItems.length > 0 && typeof matchShoppingItemWithPantry === 'function') {
    list.forEach((item) => {
      if (item.isCustom) return;
      const match = matchShoppingItemWithPantry(item.name, item.qty, item.unit);
      if (match && match.matchedPantryItem) {
        item.pantryZone = match.matchedPantryItem.zone;
        item.pantryItemName = match.matchedPantryItem.name;
        if (match.status === 'covered') {
          item.pantryCoveredFull = true;
          item.pantryDeductedQty = item.initialQty;
        } else if (match.status === 'partial' && match.deductedInTargetUnit > 0) {
          item.pantryPartial = true;
          item.pantryDeductedQty = match.deductedInTargetUnit;
          item.qty = Math.max(0.1, Math.round((item.initialQty - match.deductedInTargetUnit) * 10) / 10);
        }
      }
    });
  }

  return list;
}

function toggleIngredientStock(itemKey) {
  const allItems = buildAggregatedShoppingList();
  const target = allItems.find((x) => x.key === itemKey);
  const currentlyInStock = target ? isShoppingItemInStock(target) : !!state.inStockKeys[itemKey];

  if (currentlyInStock) {
    state.inStockKeys[itemKey] = false;
  } else {
    state.inStockKeys[itemKey] = true;
  }
  saveStateToStorage();
  renderShoppingList();
}

function checkAllIngredients(shouldBuy) {
  const allItems = buildAggregatedShoppingList();
  if (shouldBuy) {
    allItems.forEach((item) => {
      state.inStockKeys[item.key] = false;
    });
  } else {
    allItems.forEach((item) => {
      state.inStockKeys[item.key] = true;
    });
  }
  saveStateToStorage();
  renderShoppingList();
}

function addCustomShoppingItem() {
  const nameInput = document.getElementById('custom-item-name');
  const qtyInput = document.getElementById('custom-item-qty');
  const name = nameInput.value.trim();
  const qty = qtyInput.value.trim() || '1';

  if (!name) return;

  state.customItems.push({
    id: Date.now().toString(),
    name,
    qty
  });
  nameInput.value = '';
  qtyInput.value = '';
  saveStateToStorage();
  renderShoppingList();
  showToast(`"${name}" ajouté à la liste de courses`);
}

function removeCustomShoppingItem(customId, event) {
  event.stopPropagation();
  state.customItems = state.customItems.filter((c) => c.id !== customId);
  delete state.inStockKeys[`custom_${customId}`];
  saveStateToStorage();
  renderShoppingList();
}

function formatIngredientQuantity(item) {
  if (item.isCustom) return item.qty;
  const val = Math.round(item.qty * 10) / 10;
  return `${val.toString().replace('.', ',')} ${item.unit}`.trim();
}

function renderShoppingList() {
  const items = buildAggregatedShoppingList();
  const unvalidatedWarning = document.getElementById('unvalidated-warning');
  const unvalidatedWarningText = document.getElementById('unvalidated-warning-text');
  const activeSlots = state.slots.filter((s) => s.active !== false);
  const validatedSlots = activeSlots.filter((s) => s.validated);
  const allValidated = activeSlots.length > 0 && validatedSlots.length === activeSlots.length;

  const deductBtn = document.getElementById('btn-toggle-pantry-deduction');
  if (deductBtn) {
    deductBtn.textContent = state.deductPantryFromShopping
      ? `🗄️ Déduire mon Garde-manger : ON (${(state.pantryItems || []).length})`
      : '🗄️ Déduire mon Garde-manger : OFF';
    deductBtn.className = state.deductPantryFromShopping ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
  }

  const deductionBanner = document.getElementById('shopping-pantry-deduction-banner');
  const fullCoveredItems = items.filter((i) => i.pantryCoveredFull);
  const partialCoveredItems = items.filter((i) => i.pantryPartial);

  if (deductionBanner) {
    if (state.deductPantryFromShopping && (fullCoveredItems.length > 0 || partialCoveredItems.length > 0)) {
      deductionBanner.style.display = 'block';
      deductionBanner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
          <div style="font-size: 0.86rem; color: #065f46;">
            🗄️ <strong>Ajustement Garde-manger actif :</strong>
            <strong>${fullCoveredItems.length} ingrédient(s)</strong> intégralement couverts par votre frigo/placard et
            <strong>${partialCoveredItems.length} quantité(s)</strong> réduite(s) automatiquement sur votre liste !
          </div>
          <button type="button" class="btn btn-outline btn-sm" onclick="switchView('pantry')">
            ❄️🥫 Modifier mon stock (${(state.pantryItems || []).length})
          </button>
        </div>
      `;
    } else if ((state.pantryItems || []).length > 0 && !state.deductPantryFromShopping) {
      deductionBanner.style.display = 'block';
      deductionBanner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            🗄️ Vous avez <strong>${state.pantryItems.length} ingrédient(s)</strong> dans votre Garde-manger. Activez la déduction pour ajuster les quantités à acheter.
          </span>
          <button type="button" class="btn btn-primary btn-sm" onclick="togglePantryDeductionMode()">
            🔄 Activer la déduction du stock
          </button>
        </div>
      `;
    } else {
      deductionBanner.style.display = 'none';
    }
  }

  if (unvalidatedWarning) {
    unvalidatedWarning.style.display = allValidated ? 'none' : 'block';
    if (unvalidatedWarningText) {
      unvalidatedWarningText.innerHTML =
        validatedSlots.length === 0
          ? `⚠️ <strong>Aucun repas n'est encore validé (0 / ${activeSlots.length}).</strong> Validez vos repas dans le Menu Semaine (ou cliquez sur le bouton à droite) pour remplir la liste de courses.`
          : `ℹ️ La liste de courses contient actuellement les ingrédients de vos <strong>${validatedSlots.length} repas validé(s)</strong> sur ${activeSlots.length} repas comptabilisés.`;
    }
  }

  let toBuyCount = 0;
  let inStockCount = 0;

  items.forEach((item) => {
    if (isShoppingItemInStock(item)) {
      inStockCount++;
    } else {
      toBuyCount++;
    }
  });

  const navBadge = document.getElementById('nav-shopping-count');
  if (navBadge) {
    if (navBadge.textContent !== String(toBuyCount)) {
      navBadge.textContent = toBuyCount;
      navBadge.classList.remove('pop');
      void navBadge.offsetWidth;
      navBadge.classList.add('pop');
      setTimeout(() => navBadge.classList.remove('pop'), 300);
    }
  }

  const mobileBadge = document.getElementById('mobile-shopping-count');
  if (mobileBadge) {
    mobileBadge.textContent = toBuyCount;
    mobileBadge.style.display = toBuyCount > 0 ? 'inline-flex' : 'none';
  }

  const toBuyEl = document.getElementById('to-buy-count');
  const inStockEl = document.getElementById('in-stock-count');
  if (toBuyEl) toBuyEl.textContent = toBuyCount;
  if (inStockEl) inStockEl.textContent = inStockCount;

  const grouped = {};
  items.forEach((item) => {
    const aisle = item.aisle || 'Épicerie salée';
    if (!grouped[aisle]) grouped[aisle] = [];
    grouped[aisle].push(item);
  });

  const sortedAisles = Object.keys(grouped).sort((a, b) => {
    const orderA = window.RECIPES_DB.categories[a]?.order || 99;
    const orderB = window.RECIPES_DB.categories[b]?.order || 99;
    return orderA - orderB;
  });

  const container = document.getElementById('shopping-aisles-container');
  if (container) {
    if (items.length === 0) {
      container.innerHTML = `
        <div style="padding: 28px 16px; text-align: center; background: var(--bg-subtle); border-radius: var(--radius-md); color: var(--text-muted);">
          <p style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
            🛒 Votre liste de courses est vide pour le moment
          </p>
          <p style="font-size: 0.86rem; margin-bottom: 14px;">
            La liste se met à jour automatiquement au fur et à mesure que vous cliquez sur <strong>« Valider ce plat »</strong> sur vos repas de la semaine.
          </p>
          <button class="btn btn-primary btn-sm" onclick="validateAllAndRefreshShopping()">
            ✓ Valider tous les repas comptabilisés maintenant
          </button>
        </div>
      `;
    } else {
      container.innerHTML = sortedAisles
        .map((aisle) => {
          const icon = window.RECIPES_DB.categories[aisle]?.icon || '🛒';
          const aisleItems = grouped[aisle];
          const rowsHTML = aisleItems
            .map((item) => {
              const isInStock = isShoppingItemInStock(item);
              const safeKey = item.key.replace(/'/g, "\\'");
              const zoneEmoji = item.pantryZone === 'fridge' ? '❄️ Frigo' : '🥫 Placard';
              const deductedRounded = item.pantryDeductedQty ? (Math.round(item.pantryDeductedQty * 10) / 10).toString().replace('.', ',') : '';
              const initRounded = item.initialQty ? (Math.round(item.initialQty * 10) / 10).toString().replace('.', ',') : '';

              let pantryBadgeHTML = '';
              if (item.pantryCoveredFull) {
                pantryBadgeHTML = `<span class="pantry-deducted-tag" title="Couvert par votre garde-manger">${zoneEmoji} Couvert (${deductedRounded} ${item.unit})</span>`;
              } else if (item.pantryPartial) {
                pantryBadgeHTML = `<span class="pantry-deducted-tag" title="Quantité réduite grâce à votre stock (${initRounded} ${item.unit} requis − ${deductedRounded} ${item.unit} en stock)">${zoneEmoji} −${deductedRounded} ${item.unit} déduits</span>`;
              }

              return `
                <li class="ingredient-item ${isInStock ? 'in-stock' : ''}" onclick="toggleIngredientStock('${safeKey}')">
                  <div class="ing-left">
                    <input
                      type="checkbox"
                      class="ing-checkbox"
                      ${!isInStock ? 'checked' : ''}
                      onclick="event.stopPropagation(); toggleIngredientStock('${safeKey}')"
                    />
                    <div>
                      <span class="ing-name">${item.name}</span>
                      <span class="ing-sources">${item.sources.join(' • ')}</span>
                    </div>
                  </div>
                  <div class="ing-right" style="flex-wrap: wrap; justify-content: flex-end;">
                    ${pantryBadgeHTML}
                    ${isInStock ? '<span class="stock-tag">En stock</span>' : ''}
                    <span class="ing-qty">${formatIngredientQuantity(item)}</span>
                    ${
                      item.isCustom
                        ? `<button class="btn btn-outline btn-sm" style="padding:2px 6px;" onclick="removeCustomShoppingItem('${item.customId}', event)">✕</button>`
                        : ''
                    }
                  </div>
                </li>
              `;
            })
            .join('');

          return `
            <div class="aisle-group">
              <div class="aisle-header">
                <span>${icon} ${aisle}</span>
                <span style="font-size: 0.78rem; color: var(--text-muted);">${aisleItems.length} ingrédient(s)</span>
              </div>
              <ul class="ingredient-list">
                ${rowsHTML}
              </ul>
            </div>
          `;
        })
        .join('');
    }
  }
}

// ============================================================================
// FAVORIS & HISTORIQUE DES SEMAINES
// ============================================================================
function toggleFavorite(recipeId, evt) {
  const idx = state.favorites.indexOf(recipeId);
  if (idx === -1) {
    state.favorites.push(recipeId);
    if (evt && evt.clientX) {
      spawnCulinaryConfetti({
        x: evt.clientX,
        y: evt.clientY,
        count: 9,
        spread: 90,
        emojis: ['❤️', '✨', '🍽️', '⭐']
      });
    }
    showToast('Ajouté à votre carnet de coups de cœur ❤️');
  } else {
    state.favorites.splice(idx, 1);
    showToast('Retiré de vos coups de cœur');
  }
  saveStateToStorage();
  renderAll();
}

function saveCurrentWeekToHistory() {
  const mondayLabel = formatMondayFullLabel(state.weekStartDate);
  const totalCost = formatEuro(evaluateTotalWeekCost());

  state.history.unshift({
    id: Date.now().toString(),
    dateLabel: `${mondayLabel} (${totalCost})`,
    weekStartDate: state.weekStartDate,
    slots: JSON.parse(JSON.stringify(state.slots))
  });

  if (state.history.length > 15) {
    state.history = state.history.slice(0, 15);
  }

  saveStateToStorage();
  renderFavoritesAndHistory();
  showToast(`Semaine du ${mondayLabel} enregistrée dans l'historique 🗓️`);
}

function loadWeekFromHistory(historyId) {
  const entry = state.history.find((h) => h.id === historyId);
  if (!entry) return;
  if (entry.weekStartDate) {
    state.weekStartDate = entry.weekStartDate;
  }
  state.slots = JSON.parse(JSON.stringify(entry.slots));
  state.inStockKeys = {};
  saveStateToStorage();
  renderAll();
  switchView('planner');
  showToast(`Semaine du ${entry.dateLabel} rechargée !`);
}

function deleteHistoryEntry(historyId) {
  state.history = state.history.filter((h) => h.id !== historyId);
  saveStateToStorage();
  renderFavoritesAndHistory();
}

function renderFavoritesAndHistory() {
  const favContainer = document.getElementById('favorites-list-container');
  const histContainer = document.getElementById('history-list-container');

  if (favContainer) {
    if (state.favorites.length === 0) {
      favContainer.innerHTML = `<p style="font-size: 0.88rem; color: var(--text-muted);">Cliquez sur le cœur 🤍 d'un plat dans le semainier pour l'ajouter à vos favoris.</p>`;
    } else {
      favContainer.innerHTML = state.favorites
        .map((favId) => {
          const r = findRecipeById(favId);
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px; border:1px solid var(--border-color); border-radius:8px; margin-bottom:8px;">
              <div>
                <strong style="font-size:0.92rem;">${r.title}</strong>
                <div style="font-size:0.76rem; color:var(--text-muted);">⏱️ ${r.prepTime} • ${r.difficulty} • 💶 ${formatEuro(r.costFor2 || 4.5)} (2 parts)${r.winePairing && (r.winePairing.appellation || r.winePairing.name) ? ` • 🍷 ${r.winePairing.appellation || r.winePairing.name} (${r.winePairing.color || ''}, ${r.winePairing.region || ''}, ${r.winePairing.grape || ''})` : ''}</div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="toggleFavorite('${r.id}')">Retirer</button>
            </div>
          `;
        })
        .join('');
    }
  }

  if (histContainer) {
    if (state.history.length === 0) {
      histContainer.innerHTML = `<p style="font-size: 0.88rem; color: var(--text-muted);">Aucune semaine archivée pour le moment. Cliquez sur "Sauvegarder la semaine" pour conserver vos plannings préférés.</p>`;
    } else {
      histContainer.innerHTML = state.history
        .map(
          (h) => `
          <div style="padding: 12px; border:1px solid var(--border-color); border-radius:8px; margin-bottom:10px; background: var(--bg-subtle);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <strong>Semaine du ${h.dateLabel}</strong>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-primary btn-sm" onclick="loadWeekFromHistory('${h.id}')">Recharger</button>
                <button class="btn btn-outline btn-sm" onclick="deleteHistoryEntry('${h.id}')">✕</button>
              </div>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted);">
              ${h.slots
                .filter((s) => s.active !== false)
                .slice(0, 4)
                .map((s) => findRecipeById(s.recipeId).title)
                .join(' • ')}...
            </div>
          </div>
        `
        )
        .join('');
    }
  }
}

// ============================================================================
// MODE HYBRIDE : AJOUT MANUEL & GÉNÉRATEUR IA GEMINI
// ============================================================================
function saveGeminiKey() {
  const key = document.getElementById('gemini-api-key')?.value.trim() || '';
  localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key);
  showToast('Clé API Gemini enregistrée localement ✓');
}

function addManualRecipe() {
  const title = document.getElementById('manual-title')?.value.trim();
  const type = document.getElementById('manual-type')?.value || 'weekday';
  const time = document.getElementById('manual-time')?.value.trim() || '15 min';
  const wineInput = document.getElementById('manual-wine')?.value.trim() || '';
  const rawIngs = document.getElementById('manual-ingredients')?.value.trim();
  const rawSteps = document.getElementById('manual-steps')?.value.trim();

  if (!title || !rawIngs) {
    showToast('Veuillez indiquer au moins le titre et les ingrédients.');
    return;
  }

  const ingredients = rawIngs
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      return {
        name: parts[0] || line,
        qty: parseFloat(parts[1]) || 1,
        unit: parts[2] || 'portion',
        aisle: 'Épicerie salée'
      };
    });

  const steps = rawSteps
    ? rawSteps
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    : ['Préparer et cuire les ingrédients selon votre habitude.'];

  const isGourmet = type === 'gourmet';
  const isPleasure = type === 'weekend-pleasure';

  const newRecipe = {
    id: `custom-${Date.now()}`,
    title,
    type,
    prepTime: time,
    cookTime: '10 min',
    difficulty: 'Facile',
    budget: isGourmet ? '€€€ (Gourmet)' : isPleasure ? '€€ (Moyen)' : '€ (Bon marché)',
    costFor2: isGourmet ? 12.50 : isPleasure ? 8.00 : 4.50,
    baseServings: 2,
    description: 'Recette personnalisée ajoutée à votre catalogue.',
    ingredients,
    steps
  };

  if (isGourmet || wineInput) {
    const wParts = wineInput.split('|').map((x) => x.trim());
    const appellation = wParts[0] || 'AOC Chablis Premier Cru';
    const color = wParts[1] || (/rouge|bordeaux|syrah|merlot|pinot/i.test(wineInput) ? 'Rouge élégant' : 'Blanc sec & minéral');
    const region = wParts[2] || 'Bourgogne';
    const grape = wParts[3] || (/rouge/i.test(color) ? '100 % Pinot Noir' : '100 % Chardonnay');
    newRecipe.winePairing = {
      name: `${appellation} (${region})`,
      appellation,
      color,
      region,
      grape,
      temp: /rouge/i.test(color) ? '15-16°C' : '10-12°C',
      note: 'Vin sélectionné pour accompagner délicatement les arômes de votre recette.'
    };
  }

  state.customRecipes.push(newRecipe);
  getCatalogListByType(type).unshift(newRecipe);
  saveStateToStorage();

  document.getElementById('manual-title').value = '';
  if (document.getElementById('manual-wine')) document.getElementById('manual-wine').value = '';
  document.getElementById('manual-ingredients').value = '';
  document.getElementById('manual-steps').value = '';

  showToast(`Recette "${title}" ajoutée au catalogue !`);
}

async function generateRecipeWithAI() {
  const apiKey =
    document.getElementById('gemini-api-key')?.value.trim() ||
    localStorage.getItem(STORAGE_KEYS.GEMINI_KEY);
  const mealType = document.getElementById('ai-meal-type')?.value || 'weekday';
  const customPrompt = document.getElementById('ai-custom-prompt')?.value.trim() || '';

  if (!apiKey) {
    showToast('Veuillez renseigner une clé API Google Gemini ou utiliser le catalogue intégré.');
    return;
  }

  const btn = document.getElementById('btn-generate-ai');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Génération en cours...';
  }

  const categoryDesc =
    mealType === 'gourmet'
      ? 'Menu Gourmet avec des ingrédients nobles et délicats (Saint-Jacques, magret, filet de bœuf, truffe, bar sauvage, morilles...), recette simple à réaliser (Facile, 15-20 min) accompagnée d\'une suggestion de vin précise (couleur, région, appellation, cépage)'
      : mealType === 'weekend-pleasure'
      ? 'Menu Plaisir gourmand pour se faire plaisir même si moins équilibré, simple et rapide à réaliser (10-15 min)'
      : 'Menu Équilibré sain, simple et rapide à réaliser (10-15 min)';

  const promptText = `Génère une recette en français au format JSON strict pour 2 adultes, réalisée avec un maximum d'ingrédients de saison.
Catégorie : ${categoryDesc}.
Indication supplémentaire : ${customPrompt || 'Aucune'}.
Format JSON attendu uniquement (sans markdown) :
{
  "title": "Nom du plat",
  "prepTime": "10 min",
  "cookTime": "12 min",
  "difficulty": "Facile",
  "budget": "${mealType === 'gourmet' ? '€€€ (Gourmet)' : mealType === 'weekend-pleasure' ? '€€ (Moyen)' : '€ (Bon marché)'}",
  "costFor2": ${mealType === 'gourmet' ? 13.5 : mealType === 'weekend-pleasure' ? 8.0 : 4.8},
  "description": "Courte description appétissante",
  "winePairing": {
    "name": "AOC Chablis Premier Cru (Bourgogne)",
    "color": "Blanc sec & minéral",
    "region": "Bourgogne",
    "appellation": "AOC Chablis Premier Cru",
    "grape": "100 % Chardonnay",
    "temp": "10-12°C",
    "note": "Explication courte de l'accord mets et vin"
  },
  "ingredients": [
    {"name": "Nom ingrédient", "qty": 200, "unit": "g", "aisle": "Fruits & Légumes"}
  ],
  "steps": ["Étape 1", "Étape 2", "Étape 3"]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      }
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanedJson = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    const aiRecipe = {
      id: `ai-${Date.now()}`,
      title: parsed.title,
      type: mealType,
      prepTime: parsed.prepTime || '10 min',
      cookTime: parsed.cookTime || '12 min',
      difficulty: 'Facile',
      budget: parsed.budget || (mealType === 'gourmet' ? '€€€ (Gourmet)' : mealType === 'weekend-pleasure' ? '€€ (Moyen)' : '€ (Bon marché)'),
      costFor2: parseFloat(parsed.costFor2) || (mealType === 'gourmet' ? 13.00 : mealType === 'weekend-pleasure' ? 8.00 : 4.80),
      baseServings: 2,
      description: parsed.description || 'Recette générée par IA.',
      winePairing: parsed.winePairing || null,
      ingredients: parsed.ingredients || [],
      steps: parsed.steps || []
    };

    state.customRecipes.push(aiRecipe);
    getCatalogListByType(mealType).unshift(aiRecipe);

    const targetSlot = state.slots.find((s) =>
      s.active !== false &&
      !s.validated &&
      (mealType === 'gourmet'
        ? getSlotStyle(s) === 'gourmet'
        : mealType === 'weekend-pleasure'
        ? getSlotStyle(s) === 'pleasure'
        : getSlotStyle(s) === 'balanced')
    );

    if (targetSlot) {
      targetSlot.recipeId = aiRecipe.id;
    }

    saveStateToStorage();
    renderAll();
    switchView('planner');
    showToast(`Recette IA "${aiRecipe.title}" créée et ajoutée à votre semaine !`);
  } catch (err) {
    console.error(err);
    showToast('Erreur lors de la génération IA. Vérifiez votre clé API.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '✨ Générer et ajouter au catalogue';
    }
  }
}

// ============================================================================
// NAVIGATION & PWA
// ============================================================================
function switchView(viewName) {
  const normalizedView = viewName === 'studio' ? 'app' : viewName;
  if (normalizedView !== 'pantry' && typeof stopPantryCamera === 'function') {
    stopPantryCamera();
  }

  document.querySelectorAll('.view-section').forEach((sec) => {
    sec.classList.remove('active');
  });
  const target = document.getElementById(`view-${normalizedView}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn, .mobile-nav-item').forEach((btn) => {
    if (btn.getAttribute('data-view') === normalizedView) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (normalizedView === 'pantry' && typeof renderPantrySection === 'function') {
    renderPantrySection();
  } else if (normalizedView === 'shopping') {
    renderShoppingList();
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function setupPwaSupport() {
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Masquer le bouton d'installation uniquement si l'application est DÉJÀ ouverte en mode installé (standalone)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const headerInstallBtn = document.getElementById('install-pwa-header-btn');
  const studioBanner = document.getElementById('pwa-install-banner');

  if (isStandalone) {
    if (headerInstallBtn) headerInstallBtn.style.display = 'none';
    if (studioBanner) studioBanner.style.display = 'none';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    if (headerInstallBtn && !isStandalone) {
      headerInstallBtn.style.display = 'inline-flex';
    }
    if (studioBanner && !isStandalone) {
      studioBanner.style.display = 'block';
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPwaPrompt = null;
    if (headerInstallBtn) headerInstallBtn.style.display = 'none';
    if (studioBanner) studioBanner.style.display = 'none';
    closeInstallModal();
    showToast('🎉 Application installée sur votre écran d\'accueil !');
  });
}

async function handleInstallAppClick() {
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    const choice = await deferredPwaPrompt.userChoice;
    if (choice && choice.outcome === 'accepted') {
      deferredPwaPrompt = null;
    }
    return;
  }

  // Si le navigateur ne déclenche pas la fenêtre native (ex: iPhone Safari, ou Chrome ayant déjà installé l'app),
  // afficher la fenêtre d'aide visuelle adaptée à l'appareil :
  const modal = document.getElementById('pwa-install-modal');
  const body = document.getElementById('pwa-install-modal-body');
  if (!modal || !body) return;

  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);

  body.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
      <img src="assets/icon-192.png" alt="MenuSemaine" style="width: 48px; height: 48px; border-radius: 12px;" />
      <div>
        <h2 style="font-size: 1.15rem; font-weight: 800; margin: 0;">📲 Installer MenuSemaine</h2>
        <p style="font-size: 0.84rem; color: var(--text-muted); margin: 2px 0 0 0;">Ajoutez l'icône sur l'écran d'accueil de votre téléphone</p>
      </div>
    </div>

    ${
      isIOS
        ? `
      <div style="padding: 14px; background: #fffbeb; border-radius: 10px; border: 2px solid #f59e0b; margin-bottom: 14px; font-size: 0.92rem;">
        <strong>🍎 Vous êtes sur iPhone / iPad :</strong>
        <ol style="margin-left: 20px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
          <li>Appuyez sur le bouton <strong>Partager</strong> <span style="display:inline-block; padding:1px 6px; background:#e2e8f0; border-radius:4px; font-weight:700;">⬆️</span> tout en bas de Safari.</li>
          <li>Faites défiler vers le bas et appuyez sur <strong>« Sur l'écran d'accueil »</strong> (➕).</li>
          <li>Appuyez sur <strong>« Ajouter »</strong> en haut à droite.</li>
        </ol>
      </div>
      `
        : isAndroid
        ? `
      <div style="padding: 14px; background: #ecfdf5; border-radius: 10px; border: 2px solid #059669; margin-bottom: 14px; font-size: 0.92rem;">
        <strong>🤖 Vous êtes sur Android :</strong>
        <ol style="margin-left: 20px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
          <li>Appuyez sur les <strong>3 petits points ⋮</strong> tout en haut à droite de votre navigateur Chrome.</li>
          <li>Appuyez sur <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</li>
          <li>Confirmez en appuyant sur <strong>« Installer »</strong>.</li>
        </ol>
      </div>
      `
        : `
      <div style="padding: 14px; background: #ecfdf5; border-radius: 10px; border: 1px solid #a7f3d0; margin-bottom: 14px; font-size: 0.9rem;">
        <strong>💻 Sur Ordinateur (Chrome / Edge) :</strong>
        <p style="margin-top: 6px;">Cliquez sur l'icône d'installation <strong>📲</strong> située à droite dans la barre d'adresse de votre navigateur (en haut), puis cliquez sur <strong>Installer</strong>.</p>
      </div>
      <div style="padding: 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 14px; font-size: 0.86rem;">
        <strong>📱 Sur Smartphone (Android &amp; iPhone) :</strong>
        <ul style="margin-left: 18px; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
          <li><strong>Android (Chrome) :</strong> Menu <strong>⋮</strong> en haut à droite &rarr; <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</li>
          <li><strong>iPhone (Safari) :</strong> Bouton <strong>Partager ⬆️</strong> en bas &rarr; <strong>« Sur l'écran d'accueil »</strong>.</li>
        </ul>
      </div>
      `
    }

    <button class="btn btn-primary" onclick="closeInstallModal()" style="width: 100%; justify-content: center;">
      J'ai compris
    </button>
  `;

  modal.classList.add('open');
}

function closeInstallModal() {
  const modal = document.getElementById('pwa-install-modal');
  if (modal) modal.classList.remove('open');
}

async function triggerPwaInstall() {
  return handleInstallAppClick();
}

// ============================================================================
// SECTION : MENUS DU GARDE-MANGER (SCAN CAMÉRA FRIGO & PLACARD, INVENTAIRE,
// PROPOSITIONS DE MENUS & DÉDUCTION DE LA LISTE DES COURSES DE LA SEMAINE)
// ============================================================================
let pantryCameraStream = null;
let pantryActiveScanZone = 'fridge'; // 'fridge' | 'cupboard'
let pantryAutoScanEnabled = true;
let pantryAutoScanTimer = null;
let pantryBarcodeTimer = null;
let pantryAnalysisInFlight = false;
let pantryVoiceRecognition = null;
let pantryVoiceActive = false;
const pantryRecentSessionDetections = new Map(); // normalizedName -> timestamp

function normalizeIngToken(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/['’]/g, ' ')
    .replace(/\b(de|du|des|d|le|la|les|au|aux|en|un|une|frais|fraiche|fraiches|bio|entier|entiers|entiere|entieres|rape|rapee|eminces|emince|concassee|concassees|filet|filets|pave|paves|blanc|blancs|tranche|tranches|gousse|gousses|boite|sachet)\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w.length > 4 && w.endsWith('x') ? w.slice(0, -1) : w))
    .filter(Boolean)
    .join(' ');
}

function areIngredientsMatching(nameA, nameB) {
  const normA = normalizeIngToken(nameA);
  const normB = normalizeIngToken(nameB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  if (normA.includes(normB) || normB.includes(normA)) {
    const shortest = normA.length < normB.length ? normA : normB;
    if (shortest.length >= 3) return true;
  }
  const wordsA = normA.split(' ').filter((w) => w.length >= 3);
  const wordsB = normB.split(' ').filter((w) => w.length >= 3);
  if (wordsA.length > 0 && wordsB.length > 0) {
    if (wordsA[0] === wordsB[0] && wordsA[0].length >= 4) return true;
  }
  return false;
}

function getCanonicalUnitGroup(unitStr) {
  const u = (unitStr || '').toString().trim().toLowerCase();
  if (u === 'g' || u === 'gr' || u === 'gramme' || u === 'grammes') return { group: 'mass', factorToBase: 1 };
  if (u === 'kg' || u === 'kilo' || u === 'kilos') return { group: 'mass', factorToBase: 1000 };
  if (u === 'ml' || u === 'millilitre' || u === 'millilitres') return { group: 'volume', factorToBase: 1 };
  if (u === 'cl' || u === 'centilitre' || u === 'centilitres') return { group: 'volume', factorToBase: 10 };
  if (u === 'l' || u === 'litre' || u === 'litres') return { group: 'volume', factorToBase: 1000 };
  if (u === 'c.à.s' || u === 'cas' || u === 'cuillère à soupe') return { group: 'volume', factorToBase: 15 };
  if (u === 'c.à.c' || u === 'cac' || u === 'cuillère à café') return { group: 'volume', factorToBase: 5 };
  return { group: 'count', factorToBase: 1 };
}

function convertQtyBetweenUnits(qty, fromUnit, toUnit) {
  const num = parseFloat(qty) || 0;
  const fromMeta = getCanonicalUnitGroup(fromUnit);
  const toMeta = getCanonicalUnitGroup(toUnit);
  if (fromMeta.group === toMeta.group) {
    return (num * fromMeta.factorToBase) / toMeta.factorToBase;
  }
  // Heuristique de correspondance courante en cuisine (ex: 1 pièce de légume ~ 150g, 1 boîte ~ 250g, 1 sachet ~ 150g)
  if (fromMeta.group === 'count' && toMeta.group === 'mass') {
    const baseGrams = (num * 150);
    return baseGrams / toMeta.factorToBase;
  }
  if (fromMeta.group === 'mass' && toMeta.group === 'count') {
    const grams = num * fromMeta.factorToBase;
    return grams / 150;
  }
  return num;
}

function matchShoppingItemWithPantry(ingName, neededQty, neededUnit) {
  if (!Array.isArray(state.pantryItems) || state.pantryItems.length === 0) return null;

  const matchingItems = state.pantryItems.filter((p) => areIngredientsMatching(p.name, ingName));
  if (matchingItems.length === 0) return null;

  let totalAvailableInTargetUnit = 0;
  matchingItems.forEach((p) => {
    totalAvailableInTargetUnit += convertQtyBetweenUnits(p.qty, p.unit, neededUnit);
  });

  const primaryItem = matchingItems[0];
  const req = parseFloat(neededQty) || 1;

  if (totalAvailableInTargetUnit >= req * 0.95) {
    return {
      status: 'covered',
      matchedPantryItem: primaryItem,
      availableInTargetUnit: totalAvailableInTargetUnit,
      deductedInTargetUnit: req,
      missingInTargetUnit: 0
    };
  }

  if (totalAvailableInTargetUnit > 0) {
    return {
      status: 'partial',
      matchedPantryItem: primaryItem,
      availableInTargetUnit: totalAvailableInTargetUnit,
      deductedInTargetUnit: Math.round(totalAvailableInTargetUnit * 10) / 10,
      missingInTargetUnit: Math.max(0.1, Math.round((req - totalAvailableInTargetUnit) * 10) / 10)
    };
  }

  return null;
}

function inferAisleForIngredient(name, zone) {
  const n = (name || '').toLowerCase();
  if (/courgette|tomate|carotte|oignon|ail|poireau|epinard|brocoli|chou|pomme|citron|avocat|salade|champignon|patate|pomme de terre|poivron|courge|potimarron|endive|haricot vert|banane|poire/i.test(n)) {
    return 'Fruits & Légumes';
  }
  if (/poulet|boeuf|porc|lardon|jambon|dinde|magret|canard|veau|steak|viande|saucisse/i.test(n)) {
    return 'Viandes & Volailles';
  }
  if (/saumon|cabillaud|thon frais|crevette|saint-jacques|poisson|bar|dorade|truite/i.test(n)) {
    return 'Poissons & Crustacés';
  }
  if (/oeuf|œuf|lait|beurre|creme|crème|fromage|comte|comté|chevre|chèvre|mozzarella|parmesan|yaourt|feta|ricotta|gruyere|emmental/i.test(n)) {
    return 'Crèmerie & Œufs';
  }
  if (/chocolat|sucre|farine|miel|confiture|compote|vanille|biscuit|amande/i.test(n)) {
    return 'Épicerie sucrée & Pâtisserie';
  }
  if (zone === 'fridge') return 'Crèmerie & Œufs';
  return 'Épicerie salée';
}

function addOrMergePantryItem({ name, qty, unit, zone, mergeMode = 'replace' }) {
  const cleanName = (name || '').trim();
  if (!cleanName) return null;

  const cleanZone = zone === 'cupboard' ? 'cupboard' : 'fridge';
  const numQty = Math.max(0.1, Math.round((parseFloat(qty) || 1) * 10) / 10);
  const cleanUnit = (unit || 'pièces').trim();

  const existing = state.pantryItems.find(
    (item) => item.zone === cleanZone && normalizeIngToken(item.name) === normalizeIngToken(cleanName)
  );

  if (existing) {
    if (mergeMode === 'add') {
      const added = convertQtyBetweenUnits(numQty, cleanUnit, existing.unit);
      existing.qty = Math.round((existing.qty + added) * 10) / 10;
    } else {
      existing.qty = numQty;
      existing.unit = cleanUnit;
    }
    existing.updatedAt = Date.now();
    saveStateToStorage();
    return existing;
  }

  const newItem = {
    id: `pantry_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    qty: numQty,
    unit: cleanUnit,
    zone: cleanZone,
    aisle: inferAisleForIngredient(cleanName, cleanZone),
    updatedAt: Date.now()
  };

  state.pantryItems.unshift(newItem);
  saveStateToStorage();
  return newItem;
}

function addManualPantryItem() {
  const zoneEl = document.getElementById('pantry-new-zone');
  const nameEl = document.getElementById('pantry-new-name');
  const qtyEl = document.getElementById('pantry-new-qty');
  const unitEl = document.getElementById('pantry-new-unit');

  const name = nameEl?.value.trim() || '';
  if (!name) {
    showToast('⚠️ Indiquez le nom de l\'ingrédient à ajouter au garde-manger.');
    return;
  }

  const zone = zoneEl?.value || 'fridge';
  const qty = parseFloat(qtyEl?.value) || 1;
  const unit = unitEl?.value || 'pièces';

  const item = addOrMergePantryItem({ name, qty, unit, zone, mergeMode: 'add' });
  if (nameEl) nameEl.value = '';
  renderAll();
  showToast(`${zone === 'fridge' ? '❄️ Frigo' : '🥫 Placard'} : + ${item.name} (${item.qty} ${item.unit})`);
}

function quickAddPantryStaple(name, qty, unit, zone) {
  const item = addOrMergePantryItem({ name, qty, unit, zone, mergeMode: 'add' });
  renderAll();
  showToast(`${zone === 'fridge' ? '❄️' : '🥫'} ${item.name} (${item.qty} ${item.unit}) ajouté au garde-manger !`);
}

function stepPantryItemQty(itemId, direction) {
  const item = state.pantryItems.find((x) => x.id === itemId);
  if (!item) return;

  const u = (item.unit || '').toLowerCase();
  let step = 1;
  if (u === 'g' || u === 'ml') step = 50;
  else if (u === 'cl') step = 5;
  else if (u === 'kg' || u === 'l') step = 0.5;

  const nextQty = Math.round((item.qty + direction * step) * 10) / 10;
  if (nextQty <= 0) {
    removePantryItem(itemId);
    return;
  }
  item.qty = nextQty;
  saveStateToStorage();
  renderAll();
}

function editPantryItemQtyPrompt(itemId) {
  const item = state.pantryItems.find((x) => x.id === itemId);
  if (!item) return;
  const input = prompt(
    `Modifier la quantité pour "${item.name}" (en ${item.unit}) :`,
    String(item.qty)
  );
  if (input === null) return;
  const val = parseFloat(input.replace(',', '.'));
  if (!isNaN(val) && val > 0) {
    item.qty = Math.round(val * 10) / 10;
    saveStateToStorage();
    renderAll();
    showToast(`✓ Quantité mise à jour : ${item.name} (${item.qty} ${item.unit})`);
  }
}

function togglePantryItemZone(itemId) {
  const item = state.pantryItems.find((x) => x.id === itemId);
  if (!item) return;
  item.zone = item.zone === 'fridge' ? 'cupboard' : 'fridge';
  saveStateToStorage();
  renderAll();
  showToast(`Déplacé vers ${item.zone === 'fridge' ? '❄️ le Frigo' : '🥫 le Placard'}`);
}

function removePantryItem(itemId) {
  state.pantryItems = state.pantryItems.filter((x) => x.id !== itemId);
  saveStateToStorage();
  renderAll();
}

function clearPantryInventory() {
  if (!state.pantryItems.length) return;
  state.pantryItems = [];
  saveStateToStorage();
  renderAll();
  showToast('🗑️ Inventaire du garde-manger vidé.');
}

function loadSamplePantryStock() {
  const sample = [
    { name: 'Œufs', qty: 6, unit: 'pièces', zone: 'fridge' },
    { name: 'Courgettes', qty: 3, unit: 'pièces', zone: 'fridge' },
    { name: 'Blancs de poulet', qty: 350, unit: 'g', zone: 'fridge' },
    { name: 'Crème fraîche', qty: 20, unit: 'cl', zone: 'fridge' },
    { name: 'Chèvre frais', qty: 150, unit: 'g', zone: 'fridge' },
    { name: 'Comté', qty: 180, unit: 'g', zone: 'fridge' },
    { name: 'Carottes', qty: 4, unit: 'pièces', zone: 'fridge' },
    { name: 'Pâtes', qty: 500, unit: 'g', zone: 'cupboard' },
    { name: 'Riz basmati', qty: 400, unit: 'g', zone: 'cupboard' },
    { name: 'Lentilles corail', qty: 300, unit: 'g', zone: 'cupboard' },
    { name: 'Tomates concassées', qty: 400, unit: 'g', zone: 'cupboard' },
    { name: 'Lait de coco', qty: 20, unit: 'cl', zone: 'cupboard' },
    { name: 'Oignons', qty: 3, unit: 'pièces', zone: 'cupboard' }
  ];
  sample.forEach((s) => addOrMergePantryItem({ ...s, mergeMode: 'replace' }));
  state.pantryMenuOffset = 0;
  state.pantryCardOffsets = {};
  renderAll();
  spawnCulinaryConfetti({ count: 16, spread: 150, emojis: ['❄️', '🥫', '🥚', '🥒', '🧀', '🍝'] });
  showToast('✨ Exemple de Frigo & Placard chargé avec succès !');
}

function setPantryZoneFilter(zone) {
  state.pantryZoneFilter = zone || 'all';
  renderPantrySection();
}

function saveGeminiKeyFromPantry() {
  const pantryInput = document.getElementById('pantry-gemini-key-input');
  const studioInput = document.getElementById('gemini-api-key');
  const key = pantryInput?.value.trim() || '';
  localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key);
  if (studioInput) studioInput.value = key;
  renderPantryAiKeyStatus();
  showToast(key ? '🤖 Clé API Gemini Vision activée pour le scanner caméra ✓' : 'Clé API effacée');
}

function renderPantryAiKeyStatus() {
  const key = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '';
  const statusEl = document.getElementById('pantry-ai-key-status');
  const inputEl = document.getElementById('pantry-gemini-key-input');
  if (inputEl && key && !inputEl.value) {
    inputEl.value = key;
  }
  if (statusEl) {
    if (key) {
      statusEl.textContent = '✅ Vision IA Active';
      statusEl.style.background = '#dcfce7';
      statusEl.style.color = '#166534';
    } else {
      statusEl.textContent = '⚡ Mode Code-barres + Dictée (Clé IA optionnelle)';
      statusEl.style.background = '#fef3c7';
      statusEl.style.color = '#92400e';
    }
  }
}

// ============================================================================
// SCANNER VIDÉO EN DIRECT : FRIGO & PLACARD (CAMÉRA + GEMINI VISION + CODE-BARRES + VOIX)
// ============================================================================
async function startPantryCamera(zone) {
  pantryActiveScanZone = zone === 'cupboard' ? 'cupboard' : 'fridge';
  const zoneLabel = pantryActiveScanZone === 'fridge' ? '❄️ Scan du Frigo' : '🥫 Scan du Placard';

  const camContainer = document.getElementById('pantry-camera-container');
  const videoEl = document.getElementById('pantry-camera-video');
  const badgeEl = document.getElementById('pantry-active-zone-badge');
  const statusPill = document.getElementById('pantry-scan-status-pill');
  const hudMsg = document.getElementById('pantry-scan-Hud-msg');
  const btnFridge = document.getElementById('btn-scan-fridge');
  const btnCupboard = document.getElementById('btn-scan-cupboard');

  if (btnFridge) btnFridge.classList.toggle('active-scan', pantryActiveScanZone === 'fridge');
  if (btnCupboard) btnCupboard.classList.toggle('active-scan', pantryActiveScanZone === 'cupboard');

  if (badgeEl) {
    badgeEl.textContent = `${zoneLabel} en direct`;
    badgeEl.style.color = pantryActiveScanZone === 'fridge' ? '#38bdf8' : '#fbbf24';
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('⚠️ Caméra directe non disponible sur ce navigateur : utilisez le bouton "Prendre / Importer une photo".');
    return;
  }

  try {
    if (pantryCameraStream) {
      pantryCameraStream.getTracks().forEach((t) => t.stop());
      pantryCameraStream = null;
    }

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
    } catch (firstErr) {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }

    pantryCameraStream = stream;
    if (camContainer) camContainer.style.display = 'block';
    if (videoEl) {
      videoEl.srcObject = stream;
      await videoEl.play().catch(() => {});
    }

    if (statusPill) {
      statusPill.textContent = `${zoneLabel} actif`;
    }
    if (hudMsg) {
      hudMsg.textContent = `Filmez l'intérieur du ${pantryActiveScanZone === 'fridge' ? 'frigo' : 'placard'} : détection en cours...`;
    }

    setupPantryAutoScanLoops();
    showToast(`📹 ${zoneLabel} ouvert : filmez vos étagères !`);
  } catch (err) {
    console.error('Erreur ouverture caméra :', err);
    showToast('⚠️ Impossible d\'accéder à la caméra. Autorisez la caméra ou utilisez "Prendre une photo".');
  }
}

function stopPantryCamera() {
  if (pantryAutoScanTimer) {
    clearInterval(pantryAutoScanTimer);
    pantryAutoScanTimer = null;
  }
  if (pantryBarcodeTimer) {
    clearInterval(pantryBarcodeTimer);
    pantryBarcodeTimer = null;
  }
  if (pantryVoiceActive && pantryVoiceRecognition) {
    try {
      pantryVoiceRecognition.stop();
    } catch (e) {}
    pantryVoiceActive = false;
  }
  if (pantryCameraStream) {
    pantryCameraStream.getTracks().forEach((t) => t.stop());
    pantryCameraStream = null;
  }

  const videoEl = document.getElementById('pantry-camera-video');
  if (videoEl) videoEl.srcObject = null;

  const camContainer = document.getElementById('pantry-camera-container');
  if (camContainer) camContainer.style.display = 'none';

  const btnFridge = document.getElementById('btn-scan-fridge');
  const btnCupboard = document.getElementById('btn-scan-cupboard');
  if (btnFridge) btnFridge.classList.remove('active-scan');
  if (btnCupboard) btnCupboard.classList.remove('active-scan');

  const statusPill = document.getElementById('pantry-scan-status-pill');
  if (statusPill) statusPill.textContent = 'Caméra prête';
}

function togglePantryAutoScan() {
  pantryAutoScanEnabled = !pantryAutoScanEnabled;
  const btn = document.getElementById('btn-toggle-autoscan');
  if (btn) {
    btn.textContent = pantryAutoScanEnabled ? '🔄 Scan continu auto : ON' : '🔄 Scan continu auto : PAUSE';
    btn.classList.toggle('active-autoscan', pantryAutoScanEnabled);
  }
  showToast(
    pantryAutoScanEnabled
      ? '🔄 Analyse automatique en filmant activée (toutes les 4 secondes)'
      : '⏸️ Analyse automatique en pause (utilisez le bouton "Analyser cette étagère")'
  );
}

function setupPantryAutoScanLoops() {
  if (pantryAutoScanTimer) clearInterval(pantryAutoScanTimer);
  if (pantryBarcodeTimer) clearInterval(pantryBarcodeTimer);

  // 1. Boucle de lecture automatique des codes-barres (gratuite et instantanée via BarcodeDetector + OpenFoodFacts)
  if ('BarcodeDetector' in window) {
    try {
      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']
      });
      const seenBarcodes = new Set();

      pantryBarcodeTimer = setInterval(async () => {
        const videoEl = document.getElementById('pantry-camera-video');
        if (!videoEl || videoEl.readyState < 2 || !pantryCameraStream) return;
        try {
          const codes = await detector.detect(videoEl);
          for (const c of codes) {
            if (c.rawValue && !seenBarcodes.has(c.rawValue)) {
              seenBarcodes.add(c.rawValue);
              lookupOpenFoodFactsBarcode(c.rawValue, pantryActiveScanZone);
            }
          }
        } catch (e) {}
      }, 1300);
    } catch (e) {}
  }

  // 2. Boucle d'analyse visuelle IA pendant qu'on filme (toutes les 4,5 secondes si une clé Gemini est active)
  pantryAutoScanTimer = setInterval(() => {
    if (!pantryAutoScanEnabled || !pantryCameraStream || pantryAnalysisInFlight) return;
    const apiKey = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY);
    if (apiKey) {
      captureAndAnalyzeCurrentFrame(false);
    }
  }, 4500);
}

async function lookupOpenFoodFactsBarcode(barcode, zone) {
  const hudMsg = document.getElementById('pantry-scan-Hud-msg');
  if (hudMsg) hudMsg.textContent = `🔍 Code-barres détecté (${barcode})...`;
  try {
    const resp = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
    const data = await resp.json();
    if (data && data.product) {
      const p = data.product;
      const rawName = p.product_name_fr || p.generic_name_fr || p.product_name || '';
      if (rawName) {
        let qty = 1;
        let unit = 'pièces';
        const qStr = p.quantity || '';
        const matchG = qStr.match(/(\d+(?:[.,]\d+)?)\s*(g|kg|ml|cl|l)\b/i);
        if (matchG) {
          qty = parseFloat(matchG[1].replace(',', '.')) || 1;
          unit = matchG[2].toLowerCase();
          if (unit === 'kg') {
            qty = qty * 1000;
            unit = 'g';
          } else if (unit === 'l') {
            qty = qty * 100;
            unit = 'cl';
          }
        }
        const added = addOrMergePantryItem({
          name: rawName.split('-')[0].trim(),
          qty,
          unit,
          zone,
          mergeMode: 'replace'
        });
        if (added) {
          appendLiveDetectionChip(added);
          renderAll();
          showToast(`📦 Produit scanné : ${added.name} (${added.qty} ${added.unit})`);
        }
      }
    }
  } catch (err) {
    console.warn('Erreur lecture OpenFoodFacts :', err);
  }
}

function appendLiveDetectionChip(item) {
  const listEl = document.getElementById('pantry-live-detections-list');
  if (!listEl) return;

  if (listEl.querySelector('span')) {
    listEl.innerHTML = '';
  }

  const chip = document.createElement('div');
  chip.className = 'pantry-detected-pill';
  chip.innerHTML = `${item.zone === 'fridge' ? '❄️' : '🥫'} + ${item.name} <strong>(${item.qty} ${item.unit})</strong>`;
  listEl.prepend(chip);

  while (listEl.children.length > 8) {
    listEl.removeChild(listEl.lastChild);
  }
}

async function captureAndAnalyzeCurrentFrame(isManualClick = true) {
  const videoEl = document.getElementById('pantry-camera-video');
  const canvasEl = document.getElementById('pantry-camera-canvas');
  if (!videoEl || !canvasEl || videoEl.readyState < 2) {
    if (isManualClick) {
      showToast('⚠️ Ouvrez d\'abord la caméra (Scan Frigo ou Scan Placard).');
    }
    return;
  }

  const w = videoEl.videoWidth || 640;
  const h = videoEl.videoHeight || 480;
  const targetW = Math.min(800, w);
  const targetH = Math.round((h / w) * targetW);

  canvasEl.width = targetW;
  canvasEl.height = targetH;
  const ctx = canvasEl.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, targetW, targetH);

  const dataUrl = canvasEl.toDataURL('image/jpeg', 0.72);
  await analyzePantryImageBase64(dataUrl, pantryActiveScanZone, isManualClick);
}

async function handlePantryPhotoUpload(event, zone) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  pantryActiveScanZone = zone === 'cupboard' ? 'cupboard' : 'fridge';

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target?.result;
    if (dataUrl) {
      await analyzePantryImageBase64(dataUrl, pantryActiveScanZone, true);
    }
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

async function analyzePantryImageBase64(dataUrl, zone, isManual) {
  if (pantryAnalysisInFlight) return;

  const apiKey =
    document.getElementById('pantry-gemini-key-input')?.value.trim() ||
    document.getElementById('gemini-api-key')?.value.trim() ||
    localStorage.getItem(STORAGE_KEYS.GEMINI_KEY);

  const hudMsg = document.getElementById('pantry-scan-Hud-msg');
  const captureBtn = document.getElementById('btn-capture-shelf');
  const zoneLabel = zone === 'fridge' ? 'Frigo ❄️' : 'Placard 🥫';

  if (!apiKey) {
    if (isManual) {
      // Mode assisté hors-clé IA : permet d'indiquer immédiatement ce qui est visible à l'écran ou d'activer la clé Gemini
      const quickEntered = prompt(
        `📷 Analyse rapide (${zoneLabel}) :\n` +
          `Pour que l'IA reconnaisse automatiquement l'image, collez votre clé Gemini gratuite dans le champ "Reconnaissance visuelle IA" sous la caméra.\n\n` +
          `Ou tapez directement les ingrédients filmés (ex: 4 œufs, 2 courgettes, 200g comté) :`
      );
      if (quickEntered && quickEntered.trim()) {
        const count = parseSpokenOrTypedIngredientsToPantry(quickEntered, zone);
        if (count > 0) {
          showToast(`✨ ${count} ingrédient(s) ajouté(s) au ${zoneLabel} !`);
        }
      }
    }
    return;
  }

  pantryAnalysisInFlight = true;
  if (hudMsg) hudMsg.textContent = `🤖 Analyse visuelle IA du ${zoneLabel} en cours...`;
  if (captureBtn && isManual) {
    captureBtn.disabled = true;
    captureBtn.textContent = '⏳ Reconnaissance des ingrédients...';
  }

  const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  const visionPrompt = `Tu es un assistant culinaire expert. Analyse cette image de l'intérieur d'un ${
    zone === 'fridge' ? 'réfrigérateur (frigo)' : 'placard de cuisine (garde-manger)'
  }.
Identifie tous les ingrédients alimentaires visibles et évalue leur quantité approximative.
Réponds UNIQUEMENT avec un tableau JSON valide (sans markdown ni texte autour) au format suivant :
[
  {"name": "Œufs", "qty": 6, "unit": "pièces"},
  {"name": "Courgettes", "qty": 2, "unit": "pièces"},
  {"name": "Comté", "qty": 200, "unit": "g"},
  {"name": "Crème fraîche", "qty": 20, "unit": "cl"}
]
Utilise des noms d'ingrédients simples et courants en français (ex: "Œufs", "Courgettes", "Lait", "Beurre", "Blancs de poulet", "Pâtes", "Riz basmati", "Tomates concassées", "Saumon frais") et des unités parmi : "pièces", "g", "cl", "ml", "boîte", "sachet", "tranches", "portion". Si aucun aliment n'est visible, renvoie [].`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: visionPrompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      let addedCount = 0;
      const now = Date.now();

      parsed.forEach((det) => {
        if (!det || !det.name) return;
        const norm = normalizeIngToken(det.name);
        const lastSeen = pantryRecentSessionDetections.get(norm) || 0;
        // En scan continu auto, éviter d'additionner en boucle le même produit filmé à 4 secondes d'intervalle
        if (!isManual && now - lastSeen < 20000) return;

        pantryRecentSessionDetections.set(norm, now);
        const item = addOrMergePantryItem({
          name: det.name,
          qty: det.qty || 1,
          unit: det.unit || 'pièces',
          zone,
          mergeMode: 'replace'
        });
        if (item) {
          appendLiveDetectionChip(item);
          addedCount++;
        }
      });

      if (addedCount > 0) {
        renderAll();
        if (hudMsg) {
          hudMsg.textContent = `✅ ${addedCount} ingrédient(s) reconnu(s) et ajouté(s) ! Continuez à filmer...`;
        }
        if (isManual) {
          showToast(`✨ ${addedCount} ingrédient(s) détecté(s) dans votre ${zoneLabel} !`);
        }
      } else if (hudMsg) {
        hudMsg.textContent = `Filmez une autre étagère du ${zoneLabel}...`;
      }
    } else {
      if (hudMsg) hudMsg.textContent = `Aucun nouvel aliment détecté sur ce plan. Rapprochez la caméra.`;
      if (isManual) showToast('ℹ️ Aucun aliment clairement distingué sur cette image. Rapprochez-vous de l\'étagère.');
    }
  } catch (err) {
    console.error('Erreur analyse Vision IA :', err);
    if (hudMsg) hudMsg.textContent = '⚠️ Erreur d\'analyse IA (vérifiez votre clé Gemini).';
    if (isManual) showToast('⚠️ Erreur lors de l\'analyse visuelle. Vérifiez votre clé API Gemini.');
  } finally {
    pantryAnalysisInFlight = false;
    if (captureBtn && isManual) {
      captureBtn.disabled = false;
      captureBtn.textContent = '📸 Analyser cette étagère maintenant';
    }
  }
}

// Dictée vocale pendant le scan vidéo (ex: "3 courgettes, 6 œufs, 250 grammes de pâtes")
function togglePantryVoiceRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = document.getElementById('btn-voice-scan');

  if (!SpeechRec) {
    const manualText = prompt(
      `🎙️ Saisie rapide pendant le scan (${pantryActiveScanZone === 'fridge' ? '❄️ Frigo' : '🥫 Placard'}) :\n` +
        `Indiquez vos ingrédients séparés par des virgules (ex: 6 œufs, 2 courgettes, 200g comté) :`
    );
    if (manualText) {
      const added = parseSpokenOrTypedIngredientsToPantry(manualText, pantryActiveScanZone);
      if (added > 0) showToast(`✅ ${added} ingrédient(s) ajouté(s) !`);
    }
    return;
  }

  if (pantryVoiceActive && pantryVoiceRecognition) {
    try {
      pantryVoiceRecognition.stop();
    } catch (e) {}
    pantryVoiceActive = false;
    if (btn) btn.textContent = '🎙️ Dicter en filmant';
    return;
  }

  const rec = new SpeechRec();
  rec.lang = 'fr-FR';
  rec.continuous = true;
  rec.interimResults = false;

  rec.onstart = () => {
    pantryVoiceActive = true;
    if (btn) {
      btn.textContent = '🔴 Écoute en cours... (Parlez)';
      btn.classList.add('active-autoscan');
    }
    showToast('🎙️ Dites à voix haute ce que vous filmez (ex: "4 œufs, 200 grammes de comté")...');
  };

  rec.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        const transcript = event.results[i][0].transcript;
        const count = parseSpokenOrTypedIngredientsToPantry(transcript, pantryActiveScanZone);
        if (count > 0) {
          showToast(`🎙️ Reconnu : "${transcript.trim()}" (${count} ajouté${count > 1 ? 's' : ''})`);
        }
      }
    }
  };

  rec.onerror = () => {
    pantryVoiceActive = false;
    if (btn) {
      btn.textContent = '🎙️ Dicter en filmant';
      btn.classList.remove('active-autoscan');
    }
  };

  rec.onend = () => {
    pantryVoiceActive = false;
    if (btn) {
      btn.textContent = '🎙️ Dicter en filmant';
      btn.classList.remove('active-autoscan');
    }
  };

  pantryVoiceRecognition = rec;
  rec.start();
}

function parseSpokenOrTypedIngredientsToPantry(rawText, zone) {
  if (!rawText) return 0;
  const wordNumbers = {
    un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5,
    six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, douze: 12
  };

  const segments = rawText
    .split(/[,;et\n]+/i)
    .map((s) => s.trim())
    .filter(Boolean);

  let count = 0;
  segments.forEach((seg) => {
    let cleaned = seg.toLowerCase();
    Object.keys(wordNumbers).forEach((w) => {
      cleaned = cleaned.replace(new RegExp(`\\b${w}\\b`, 'gi'), String(wordNumbers[w]));
    });

    const match = cleaned.match(/^(\d+(?:[.,]\d+)?)?\s*(kg|g|grammes|gramme|cl|ml|l|litres|litre|boites|boite|sachets|sachet|tranches|tranche|pieces|piece|pavés|paves)?\s*(?:de\s+|d['’]\s*)?(.+)$/i);
    if (match) {
      let qty = parseFloat((match[1] || '1').replace(',', '.')) || 1;
      let rawUnit = (match[2] || 'pièces').toLowerCase();
      let name = (match[3] || '').trim();
      if (!name || name.length < 2) return;

      if (rawUnit === 'grammes' || rawUnit === 'gramme') rawUnit = 'g';
      if (rawUnit === 'kg') {
        qty *= 1000;
        rawUnit = 'g';
      }
      if (rawUnit === 'litres' || rawUnit === 'litre' || rawUnit === 'l') {
        qty *= 100;
        rawUnit = 'cl';
      }
      if (rawUnit === 'boites') rawUnit = 'boîte';
      if (rawUnit === 'sachets') rawUnit = 'sachet';
      if (rawUnit === 'pieces' || rawUnit === 'piece') rawUnit = 'pièces';

      const added = addOrMergePantryItem({
        name,
        qty,
        unit: rawUnit,
        zone,
        mergeMode: 'replace'
      });
      if (added) {
        appendLiveDetectionChip(added);
        count++;
      }
    }
  });

  if (count > 0) {
    renderAll();
  }
  return count;
}

// ============================================================================
// MOTEUR DE PROPOSITION DE MENUS DU GARDE-MANGER & RENDU DE LA SECTION
// ============================================================================
function evaluateRecipeAgainstPantry(recipe, targetServings) {
  const servings = targetServings || state.pantryServings || 2;
  const ratio = servings / (recipe.baseServings || 2);
  const ingredients = recipe.ingredients || [];

  if (ingredients.length === 0) {
    return {
      recipe,
      matchCount: 0,
      coveredCount: 0,
      partialCount: 0,
      totalCount: 0,
      matchPct: 0,
      score: 0,
      breakdown: []
    };
  }

  let matchCount = 0;
  let coveredCount = 0;
  let partialCount = 0;

  const breakdown = ingredients.map((ing) => {
    const reqQty = Math.round(ing.qty * ratio * 10) / 10;
    const m = matchShoppingItemWithPantry(ing.name, reqQty, ing.unit);
    if (m && m.status === 'covered') {
      matchCount++;
      coveredCount++;
      return {
        ing,
        reqQty,
        status: 'covered',
        pantryItem: m.matchedPantryItem,
        missingQty: 0
      };
    }
    if (m && m.status === 'partial') {
      matchCount++;
      partialCount++;
      return {
        ing,
        reqQty,
        status: 'partial',
        pantryItem: m.matchedPantryItem,
        missingQty: m.missingInTargetUnit
      };
    }
    return {
      ing,
      reqQty,
      status: 'missing',
      pantryItem: null,
      missingQty: reqQty
    };
  });

  const totalCount = ingredients.length;
  const weightedHits = coveredCount + partialCount * 0.65;
  const matchPct = Math.round((matchCount / totalCount) * 100);
  const score = (weightedHits / totalCount) * 100 + matchCount * 6;

  return {
    recipe,
    matchCount,
    coveredCount,
    partialCount,
    totalCount,
    matchPct,
    score,
    breakdown
  };
}

function getAllCatalogRecipesForPantry() {
  const all = [
    ...(window.RECIPES_DB.weekdayDinners || []),
    ...(window.RECIPES_DB.weekendBalancedMeals || []),
    ...(window.RECIPES_DB.weekendPleasureMeals || []),
    ...(window.RECIPES_DB.gourmetMeals || [])
  ];
  const seen = new Set();
  const unique = [];
  all.forEach((r) => {
    if (r && r.id && !seen.has(r.id)) {
      seen.add(r.id);
      unique.push(r);
    }
  });

  if (state.pantryStyleFilter === 'balanced') {
    return unique.filter((r) => r.type !== 'weekend-pleasure' && r.type !== 'gourmet');
  }
  if (state.pantryStyleFilter === 'pleasure') {
    return unique.filter((r) => r.type === 'weekend-pleasure');
  }
  if (state.pantryStyleFilter === 'gourmet') {
    return unique.filter((r) => r.type === 'gourmet');
  }
  return unique;
}

function computeRankedPantryMenus() {
  const pool = getAllCatalogRecipesForPantry();
  const scored = pool.map((r) => {
    const cardServings = state.pantryCardServings[r.id] || state.pantryServings || 2;
    return evaluateRecipeAgainstPantry(r, cardServings);
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.matchCount - a.matchCount;
  });

  return scored;
}

function stepPantryServings(delta) {
  const next = Math.max(1, Math.min(12, (state.pantryServings || 2) + delta));
  state.pantryServings = next;
  // Réinitialiser les surcharges individuelles pour que toutes les cartes suivent le sélecteur global
  state.pantryCardServings = {};
  saveStateToStorage();
  renderPantrySection();
  showToast(`🍽️ Menus du garde-manger ajustés pour ${next} ${next > 1 ? 'parts' : 'part'}`);
}

function stepPantryCardServings(recipeId, delta) {
  const current = state.pantryCardServings[recipeId] || state.pantryServings || 2;
  const next = Math.max(1, Math.min(12, current + delta));
  state.pantryCardServings[recipeId] = next;
  renderPantrySection();
}

function handlePantryStyleFilterChange(newStyle) {
  state.pantryStyleFilter = newStyle || 'all';
  state.pantryMenuOffset = 0;
  state.pantryCardOffsets = {};
  renderPantrySection();
}

function cyclePantryMenuSuggestions(evt) {
  state.pantryMenuOffset = (state.pantryMenuOffset || 0) + 4;
  state.pantryCardOffsets = {};
  if (evt && evt.clientX) {
    spawnCulinaryConfetti({
      x: evt.clientX,
      y: evt.clientY,
      count: 10,
      spread: 110,
      emojis: ['🎲', '🍽️', '🥗', '✨']
    });
  }
  renderPantrySection();
  showToast('🎲 Nouvelles idées de menus proposées selon votre stock !');
}

function replaceSinglePantryCard(cardIndex, evt) {
  const currentExtra = state.pantryCardOffsets[cardIndex] || 0;
  state.pantryCardOffsets[cardIndex] = currentExtra + 4;
  if (evt && evt.clientX) {
    spawnCulinaryConfetti({
      x: evt.clientX,
      y: evt.clientY,
      count: 8,
      spread: 90,
      emojis: ['🎲', '👨‍🍳', '✨']
    });
  }
  renderPantrySection();
  showToast('🎲 Autre idée de menu sélectionnée !');
}

function togglePantryDeductionMode() {
  state.deductPantryFromShopping = !state.deductPantryFromShopping;
  saveStateToStorage();
  renderAll();
  showToast(
    state.deductPantryFromShopping
      ? '🗄️ Déduction automatique du stock Frigo & Placard activée sur la liste de courses !'
      : '↺ Déduction du Garde-manger désactivée sur la liste de courses'
  );
}

function syncPantryWithWeeklyShopping(navigateAfter = false) {
  state.deductPantryFromShopping = true;
  // Nettoyer les forçages manuels sur les ingrédients couverts par le garde-manger
  const items = buildAggregatedShoppingList();
  let coveredCount = 0;
  let partialCount = 0;

  items.forEach((item) => {
    if (item.pantryCoveredFull) {
      delete state.inStockKeys[item.key];
      coveredCount++;
    } else if (item.pantryPartial) {
      partialCount++;
    }
  });

  saveStateToStorage();
  renderAll();

  if (navigateAfter) {
    switchView('shopping');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showToast(
    coveredCount > 0 || partialCount > 0
      ? `🔄 Liste ajustée : ${coveredCount} ingrédient(s) en stock et ${partialCount} quantité(s) réduite(s) !`
      : 'ℹ️ Liste de courses synchronisée avec votre garde-manger.'
  );
}

function renderPantrySection() {
  renderPantryAiKeyStatus();

  const allPantry = state.pantryItems || [];
  const fridgeItems = allPantry.filter((x) => x.zone === 'fridge');
  const cupboardItems = allPantry.filter((x) => x.zone === 'cupboard');

  // Badges de navigation
  const navBadge = document.getElementById('nav-pantry-count');
  if (navBadge) navBadge.textContent = allPantry.length;

  const mobileBadge = document.getElementById('mobile-pantry-count');
  if (mobileBadge) {
    mobileBadge.textContent = allPantry.length;
    mobileBadge.style.display = allPantry.length > 0 ? 'inline-flex' : 'none';
  }

  const fridgeCountEl = document.getElementById('pantry-fridge-count');
  const cupboardCountEl = document.getElementById('pantry-cupboard-count');
  const totalCountEl = document.getElementById('pantry-total-count');
  if (fridgeCountEl) fridgeCountEl.textContent = fridgeItems.length;
  if (cupboardCountEl) cupboardCountEl.textContent = cupboardItems.length;
  if (totalCountEl) totalCountEl.textContent = allPantry.length;

  // Onglets filtre zone
  document.querySelectorAll('.pantry-tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-zone') === (state.pantryZoneFilter || 'all'));
  });

  // Liste des ingrédients du garde-manger
  const listEl = document.getElementById('pantry-items-list');
  if (listEl) {
    const filtered =
      state.pantryZoneFilter === 'fridge'
        ? fridgeItems
        : state.pantryZoneFilter === 'cupboard'
        ? cupboardItems
        : allPantry;

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 22px 14px; text-align: center; background: var(--bg-subtle); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.85rem;">
          <p style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
            🗄️ Votre liste Garde-manger est vide
          </p>
          <p style="margin-bottom: 10px;">
            Lancez un <strong>❄️ Scan Frigo</strong> ou un <strong>🥫 Scan Placard</strong> avec la caméra, cliquez sur les boutons rapides ci-dessus, ou chargez un exemple.
          </p>
          <button type="button" class="btn btn-outline btn-sm" onclick="loadSamplePantryStock()">
            ✨ Charger un exemple de Frigo &amp; Placard
          </button>
        </div>
      `;
    } else {
      listEl.innerHTML = filtered
        .map((item) => {
          const isFridge = item.zone === 'fridge';
          const qtyFormatted = (Math.round(item.qty * 10) / 10).toString().replace('.', ',');
          return `
            <div class="pantry-item-row ${isFridge ? 'zone-fridge' : 'zone-cupboard'}">
              <div class="pantry-item-info">
                <span
                  class="pantry-zone-pill ${isFridge ? 'fridge' : 'cupboard'}"
                  onclick="togglePantryItemZone('${item.id}')"
                  title="Cliquer pour basculer entre Frigo ❄️ et Placard 🥫"
                >
                  ${isFridge ? '❄️ Frigo' : '🥫 Placard'}
                </span>
                <div style="min-width: 0;">
                  <div class="pantry-item-name" title="${item.name}">${item.name}</div>
                  <div style="font-size: 0.71rem; color: var(--text-muted);">${item.aisle || 'Garde-manger'}</div>
                </div>
              </div>

              <div class="pantry-item-controls">
                <button
                  type="button"
                  class="btn btn-outline btn-sm btn-step-servings"
                  onclick="stepPantryItemQty('${item.id}', -1)"
                  title="Diminuer la quantité"
                >−</button>
                <span
                  class="pantry-qty-badge"
                  onclick="editPantryItemQtyPrompt('${item.id}')"
                  style="cursor: pointer;"
                  title="Cliquer pour saisir une quantité exacte"
                >
                  ${qtyFormatted} ${item.unit}
                </span>
                <button
                  type="button"
                  class="btn btn-outline btn-sm btn-step-servings"
                  onclick="stepPantryItemQty('${item.id}', 1)"
                  title="Augmenter la quantité"
                >+</button>
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  style="padding: 3px 7px; color: #b91c1c; border-color: #fecaca;"
                  onclick="removePantryItem('${item.id}')"
                  title="Supprimer cet ingrédient"
                >✕</button>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }

  // Bandeau de synchronisation avec la liste de courses de la semaine
  const syncBox = document.getElementById('pantry-shopping-sync-box');
  if (syncBox) {
    const shoppingItems = buildAggregatedShoppingList();
    const covered = shoppingItems.filter((i) => i.pantryCoveredFull).length;
    const partial = shoppingItems.filter((i) => i.pantryPartial).length;

    syncBox.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
        <div>
          <strong>🧺 Impact sur la liste des courses de la semaine :</strong><br />
          ${
            allPantry.length === 0
              ? 'Scannez ou ajoutez vos ingrédients pour déduire automatiquement votre stock de votre panier de courses.'
              : `<strong>${covered} ingrédient(s)</strong> déjà en stock suffisant et <strong>${partial} quantité(s)</strong> réduite(s) sur les repas validés.`
          }
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="syncPantryWithWeeklyShopping(true)">
          🔄 Ajuster &amp; Voir la liste des courses
        </button>
      </div>
    `;
  }

  // Badge nombre de parts global du garde-manger
  const servingsBadge = document.getElementById('pantry-servings-badge');
  if (servingsBadge) {
    const s = state.pantryServings || 2;
    servingsBadge.textContent = `${s} ${s > 1 ? 'parts' : 'part'}`;
  }

  renderPantryMenusGrid();
}

function renderPantryMenusGrid() {
  const gridEl = document.getElementById('pantry-menus-grid');
  if (!gridEl) return;

  const ranked = computeRankedPantryMenus();
  if (ranked.length === 0) {
    gridEl.innerHTML = `<p style="color: var(--text-muted);">Aucune recette disponible dans cette catégorie.</p>`;
    return;
  }

  const cardsCount = Math.min(4, ranked.length);
  const baseOffset = state.pantryMenuOffset || 0;
  const chosenEntries = [];
  const usedIds = new Set();

  for (let i = 0; i < cardsCount; i++) {
    const cardExtra = state.pantryCardOffsets[i] || 0;
    let idx = (baseOffset + i + cardExtra) % ranked.length;
    let attempts = 0;
    while (usedIds.has(ranked[idx].recipe.id) && attempts < ranked.length) {
      idx = (idx + 1) % ranked.length;
      attempts++;
    }
    usedIds.add(ranked[idx].recipe.id);
    chosenEntries.push({ entry: ranked[idx], cardIndex: i });
  }

  gridEl.innerHTML = chosenEntries
    .map(({ entry, cardIndex }) => {
      const { recipe, matchCount, coveredCount, partialCount, totalCount, matchPct, breakdown } = entry;
      const servings = state.pantryCardServings[recipe.id] || state.pantryServings || 2;
      const isGourmet = recipe.type === 'gourmet';
      const isPleasure = recipe.type === 'weekend-pleasure';
      const styleLabel = isGourmet ? '🍷 Gourmet' : isPleasure ? '🌟 Plaisir' : '🥗 Équilibré';
      const dishEmoji = getDishEmoji(recipe, { isGourmet, isPleasure });
      const baseCost = typeof recipe.costFor2 === 'number' ? recipe.costFor2 : isGourmet ? 12.5 : isPleasure ? 8.0 : 4.5;
      const scaledCost = baseCost * (servings / (recipe.baseServings || 2));

      const matchClass =
        matchPct >= 65 ? 'pantry-match-high' : matchPct >= 30 ? 'pantry-match-mid' : 'pantry-match-low';
      const matchText =
        (state.pantryItems || []).length === 0
          ? `📋 Suggestion du catalogue (${totalCount} ingrédients)`
          : matchCount > 0
          ? `🎯 ${matchCount}/${totalCount} ingrédient(s) dans votre garde-manger (${matchPct}%)`
          : `💡 Idée recette (${totalCount} ingrédients à prévoir)`;

      const chipsHTML = breakdown
        .map((b) => {
          const reqStr = (Math.round(b.reqQty * 10) / 10).toString().replace('.', ',');
          if (b.status === 'covered') {
            const zIcon = b.pantryItem?.zone === 'fridge' ? '❄️' : '🥫';
            return `<span class="pantry-ing-status-chip covered" title="Quantité couverte par votre stock">${zIcon} ✓ ${b.ing.name} (${reqStr} ${b.ing.unit})</span>`;
          }
          if (b.status === 'partial') {
            const zIcon = b.pantryItem?.zone === 'fridge' ? '❄️' : '🥫';
            const missStr = (Math.round(b.missingQty * 10) / 10).toString().replace('.', ',');
            return `<span class="pantry-ing-status-chip partial" title="Stock partiel : manque ${missStr} ${b.ing.unit}">${zIcon} ⚠️ ${b.ing.name} (manque ${missStr} ${b.ing.unit})</span>`;
          }
          return `<span class="pantry-ing-status-chip missing" title="Non présent dans le garde-manger">🛒 ${b.ing.name} (${reqStr} ${b.ing.unit})</span>`;
        })
        .join('');

      return `
        <article class="meal-card ${isGourmet ? 'is-gourmet' : isPleasure ? 'is-pleasure' : ''}">
          <div>
            <div class="meal-card-header">
              <span class="pantry-match-ribbon ${matchClass}">
                ${matchText}
              </span>
              <span class="meta-pill">${styleLabel}</span>
            </div>

            <!-- Barre d'action : Ajustement des parts + Bouton Autre idée -->
            <div class="servings-control" style="margin-top: 8px; flex-direction: row; align-items: center; justify-content: space-between; padding: 7px 12px; gap: 8px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 0.8rem; font-weight: 800;">🍽️ Parts :</span>
                <button type="button" class="btn btn-outline btn-sm btn-step-servings" onclick="stepPantryCardServings('${recipe.id}', -1)">−</button>
                <span class="servings-badge" style="min-width: 78px; text-align: center; padding: 3px 8px;">
                  ${servings} ${servings > 1 ? 'parts' : 'part'}
                </span>
                <button type="button" class="btn btn-outline btn-sm btn-step-servings" onclick="stepPantryCardServings('${recipe.id}', 1)">+</button>
              </div>

              <button
                type="button"
                class="style-pill-btn"
                onclick="replaceSinglePantryCard(${cardIndex}, event)"
                title="Proposer une autre idée de menu"
              >
                🎲 Autre idée
              </button>
            </div>

            <div class="meal-title-row" style="margin-top: 10px;">
              <div class="meal-dish-avatar" onclick="openPantryRecipeModal('${recipe.id}', ${servings})" style="cursor: pointer;">
                ${dishEmoji}
              </div>
              <div style="flex: 1;">
                <h3 class="meal-title" onclick="openPantryRecipeModal('${recipe.id}', ${servings})">${recipe.title}</h3>
                <p class="meal-desc">${recipe.description || ''}</p>
              </div>
            </div>

            <div class="meal-meta" style="margin-top: 8px;">
              <span class="meta-pill">⏱️ Prépa ${recipe.prepTime} • Feu ${recipe.cookTime}</span>
              <span class="meta-pill">💶 ~${formatEuro(scaledCost)} (${servings}p)</span>
            </div>

            <!-- Détail des ingrédients disponibles au frigo/placard vs à compléter -->
            <div class="pantry-ing-breakdown">
              <div style="font-size: 0.76rem; font-weight: 800; color: var(--text-main);">
                🗄️ Ingrédients pour ${servings} ${servings > 1 ? 'parts' : 'part'} (${coveredCount} couvert${coveredCount > 1 ? 's' : ''}${partialCount > 0 ? `, ${partialCount} partiel${partialCount > 1 ? 's' : ''}` : ''}) :
              </div>
              <div class="pantry-ing-chips">
                ${chipsHTML}
              </div>
            </div>
          </div>

          <div class="meal-card-actions" style="margin-top: 12px;">
            <button type="button" class="btn btn-outline btn-sm" onclick="openPantryRecipeModal('${recipe.id}', ${servings})">
              📖 Fiche cuisine
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="openAssignPantryToWeekModal('${recipe.id}', ${servings})">
              📅 Ajouter au menu de la semaine
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

function openPantryRecipeModal(recipeId, servings) {
  const recipe = findRecipeById(recipeId);
  if (!recipe) return;

  const s = servings || state.pantryServings || 2;
  const ratio = s / (recipe.baseServings || 2);
  const modalBody = document.getElementById('recipe-modal-body');
  if (!modalBody) return;

  const evalInfo = evaluateRecipeAgainstPantry(recipe, s);

  const ingredientsHTML = evalInfo.breakdown
    .map((b) => {
      const scaled = formatScaledQty(b.ing.qty, ratio);
      const badge =
        b.status === 'covered'
          ? '<span class="stock-tag" style="background:#dcfce7; color:#166534;">✓ En stock Frigo/Placard</span>'
          : b.status === 'partial'
          ? `<span class="stock-tag" style="background:#fef3c7; color:#92400e;">Stock partiel (manque ${Math.round(b.missingQty * 10) / 10} ${b.ing.unit})</span>`
          : '';
      return `<li><span>${b.ing.name} ${badge}</span> <strong>${scaled} ${b.ing.unit}</strong></li>`;
    })
    .join('');

  const stepsHTML = (recipe.steps || []).map((st) => `<li>${st}</li>`).join('');

  modalBody.innerHTML = `
    <span class="meta-pill healthy-pill">🗄️ Menu du Garde-manger • Pour ${s} ${s > 1 ? 'parts' : 'part'}</span>
    <h2 style="font-size: 1.35rem; font-weight: 800; margin-top: 8px; margin-bottom: 6px;">${recipe.title}</h2>
    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 14px;">${recipe.description || ''}</p>

    <div class="meal-meta" style="margin-bottom: 14px;">
      <span class="meta-pill">⏱️ Préparation : ${recipe.prepTime}</span>
      <span class="meta-pill">🔥 Cuisson : ${recipe.cookTime}</span>
      <span class="meta-pill">🎯 ${evalInfo.matchCount}/${evalInfo.totalCount} ingrédient(s) en stock</span>
    </div>

    <div class="modal-section-title">🛒 Ingrédients (calculés pour ${s} ${s > 1 ? 'parts' : 'part'})</div>
    <ul class="modal-ing-list">${ingredientsHTML}</ul>

    <div class="modal-section-title">👩‍🍳 Étapes de préparation</div>
    <ol class="modal-steps-list">${stepsHTML}</ol>

    <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
      <button type="button" class="btn btn-outline" onclick="closeRecipeModal()">Fermer</button>
      <button type="button" class="btn btn-primary" onclick="openAssignPantryToWeekModal('${recipe.id}', ${s})">
        📅 Planifier dans ma semaine
      </button>
    </div>
  `;

  document.getElementById('recipe-modal').classList.add('open');
}

function openAssignPantryToWeekModal(recipeId, servings) {
  const recipe = findRecipeById(recipeId);
  if (!recipe) return;
  const s = servings || state.pantryServings || 2;
  const modalBody = document.getElementById('recipe-modal-body');
  if (!modalBody) return;

  const slotButtonsHTML = state.slots
    .map((slot) => {
      const curRecipe = findRecipeById(slot.recipeId);
      return `
        <button
          type="button"
          class="btn btn-outline"
          style="justify-content: space-between; text-align: left; width: 100%; padding: 10px 12px;"
          onclick="confirmAssignPantryToSlot('${slot.slotId}', '${recipe.id}', ${s})"
        >
          <span><strong>${formatSlotDayHeader(slot)}</strong> — ${slot.mealLabel}</span>
          <small style="color: var(--text-muted);">Remplacer : ${curRecipe.title}</small>
        </button>
      `;
    })
    .join('');

  modalBody.innerHTML = `
    <span class="meta-pill healthy-pill">📅 Planifier un menu du Garde-manger</span>
    <h2 style="font-size: 1.2rem; font-weight: 800; margin-top: 8px; margin-bottom: 6px;">
      Où souhaitez-vous placer « ${recipe.title} » (${s} parts) ?
    </h2>
    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
      Choisissez le créneau de la semaine : le repas sera automatiquement validé et votre liste de courses déduira les ingrédients de votre garde-manger.
    </p>
    <div style="display: flex; flex-direction: column; gap: 7px; max-height: 360px; overflow-y: auto;">
      ${slotButtonsHTML}
    </div>
    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <button type="button" class="btn btn-outline" onclick="closeRecipeModal()">Annuler</button>
    </div>
  `;

  document.getElementById('recipe-modal').classList.add('open');
}

function confirmAssignPantryToSlot(slotId, recipeId, servings) {
  const slot = state.slots.find((x) => x.slotId === slotId);
  if (!slot) return;

  const recipe = findRecipeById(recipeId);
  slot.recipeId = recipe.id;
  slot.servings = servings || state.pantryServings || 2;
  slot.active = true;
  slot.validated = true;

  const newStyle =
    recipe.type === 'gourmet'
      ? 'gourmet'
      : recipe.type === 'weekend-pleasure'
      ? 'pleasure'
      : 'balanced';
  syncSlotStyleFlags(slot, newStyle);

  state.deductPantryFromShopping = true;
  saveStateToStorage();
  closeRecipeModal();
  renderAll();
  showToast(`✅ "${recipe.title}" (${slot.servings}p) ajouté et validé pour ${slot.day} (${slot.mealLabel}) !`);
}

async function generatePantryRecipeWithAI() {
  if (!state.pantryItems || state.pantryItems.length === 0) {
    showToast('⚠️ Scannez ou ajoutez d\'abord quelques ingrédients dans votre frigo/placard !');
    return;
  }

  const apiKey =
    document.getElementById('pantry-gemini-key-input')?.value.trim() ||
    document.getElementById('gemini-api-key')?.value.trim() ||
    localStorage.getItem(STORAGE_KEYS.GEMINI_KEY);

  if (!apiKey) {
    showToast('ℹ️ Indiquez votre clé API Google Gemini dans le panneau Scanner pour créer une recette IA sur-mesure.');
    const keyInput = document.getElementById('pantry-gemini-key-input');
    if (keyInput) keyInput.focus();
    return;
  }

  const btn = document.getElementById('btn-pantry-ai-recipe');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Création du menu sur-mesure...';
  }

  const stockListText = state.pantryItems
    .map((i) => `${i.name} (${i.qty} ${i.unit} - ${i.zone === 'fridge' ? 'Frigo' : 'Placard'})`)
    .join(', ');

  const servings = state.pantryServings || 2;
  const promptText = `Tu es un chef cuisinier créatif. Crée une recette savoureuse, simple et rapide en français qui utilise prioritairement ces ingrédients disponibles dans le frigo et le placard : ${stockListText}.
Les quantités de base dans le JSON doivent être données pour 2 personnes (baseServings: 2).
Réponds UNIQUEMENT au format JSON strict (sans markdown) :
{
  "title": "Nom du plat",
  "prepTime": "10 min",
  "cookTime": "12 min",
  "difficulty": "Facile",
  "budget": "€ (Bon marché)",
  "costFor2": 4.5,
  "description": "Recette anti-gaspi sur-mesure créée avec votre garde-manger",
  "ingredients": [
    {"name": "Nom ingrédient", "qty": 200, "unit": "g", "aisle": "Fruits & Légumes"}
  ],
  "steps": ["Étape 1", "Étape 2", "Étape 3"]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      }
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const aiRecipe = {
      id: `pantry-ai-${Date.now()}`,
      title: parsed.title || 'Poêlée du Garde-manger',
      type: state.pantryStyleFilter === 'gourmet' ? 'gourmet' : state.pantryStyleFilter === 'pleasure' ? 'weekend-pleasure' : 'weekday',
      prepTime: parsed.prepTime || '10 min',
      cookTime: parsed.cookTime || '12 min',
      difficulty: 'Facile',
      budget: parsed.budget || '€ (Bon marché)',
      costFor2: parseFloat(parsed.costFor2) || 4.5,
      baseServings: 2,
      description: parsed.description || 'Recette créée sur-mesure à partir du scan de votre garde-manger.',
      ingredients: parsed.ingredients || [],
      steps: parsed.steps || []
    };

    state.customRecipes.unshift(aiRecipe);
    getCatalogListByType(aiRecipe.type).unshift(aiRecipe);
    state.pantryMenuOffset = 0;
    state.pantryCardOffsets = {};
    state.pantryCardServings[aiRecipe.id] = servings;

    saveStateToStorage();
    renderAll();
    spawnCulinaryConfetti({ count: 18, spread: 160, emojis: ['✨', '🗄️', '🍽️', '👨‍🍳'] });
    showToast(`✨ Menu sur-mesure "${aiRecipe.title}" créé avec votre stock !`);
  } catch (err) {
    console.error('Erreur génération recette garde-manger IA :', err);
    showToast('⚠️ Erreur lors de la génération IA. Vérifiez votre clé API Gemini.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '✨ Créer un menu IA avec ce stock';
    }
  }
}


