// ============================================================================
// APPLICATION PRINCIPALE : MENU SEMAINE & LISTE DE COURSES GOOGLE KEEP
// ============================================================================

const STORAGE_KEYS = {
  CURRENT_WEEK: 'menusemaine_current_week_v3',
  WEEK_START_DATE: 'menusemaine_week_start_date_v2',
  STOCK_STATE: 'menusemaine_stock_state_v1',
  CUSTOM_ITEMS: 'menusemaine_custom_items_v1',
  FAVORITES: 'menusemaine_favorites_v1',
  HISTORY: 'menusemaine_history_v1',
  CUSTOM_RECIPES: 'menusemaine_custom_recipes_v1',
  GEMINI_KEY: 'menusemaine_gemini_api_key_v1'
};

// 14 repas : 5 Déjeuners + 5 Dîners en semaine (Lundi à Vendredi) & 2 Déjeuners + 2 Dîners le week-end
const SLOTS_DEFINITION = [
  { id: 'mon-lunch',  day: 'Lundi',    dayOffset: 0, mealLabel: 'Déjeuner', isWeekend: false, defaultPleasure: false },
  { id: 'mon-dinner', day: 'Lundi',    dayOffset: 0, mealLabel: 'Dîner',    isWeekend: false, defaultPleasure: false },
  { id: 'tue-lunch',  day: 'Mardi',    dayOffset: 1, mealLabel: 'Déjeuner', isWeekend: false, defaultPleasure: false },
  { id: 'tue-dinner', day: 'Mardi',    dayOffset: 1, mealLabel: 'Dîner',    isWeekend: false, defaultPleasure: false },
  { id: 'wed-lunch',  day: 'Mercredi', dayOffset: 2, mealLabel: 'Déjeuner', isWeekend: false, defaultPleasure: false },
  { id: 'wed-dinner', day: 'Mercredi', dayOffset: 2, mealLabel: 'Dîner',    isWeekend: false, defaultPleasure: false },
  { id: 'thu-lunch',  day: 'Jeudi',    dayOffset: 3, mealLabel: 'Déjeuner', isWeekend: false, defaultPleasure: false },
  { id: 'thu-dinner', day: 'Jeudi',    dayOffset: 3, mealLabel: 'Dîner',    isWeekend: false, defaultPleasure: false },
  { id: 'fri-lunch',  day: 'Vendredi', dayOffset: 4, mealLabel: 'Déjeuner', isWeekend: false, defaultPleasure: false },
  { id: 'fri-dinner', day: 'Vendredi', dayOffset: 4, mealLabel: 'Dîner',    isWeekend: false, defaultPleasure: false },
  { id: 'sat-lunch',  day: 'Samedi',   dayOffset: 5, mealLabel: 'Déjeuner', isWeekend: true,  defaultPleasure: false },
  { id: 'sat-dinner', day: 'Samedi',   dayOffset: 5, mealLabel: 'Dîner',    isWeekend: true,  defaultPleasure: true  },
  { id: 'sun-lunch',  day: 'Dimanche', dayOffset: 6, mealLabel: 'Déjeuner', isWeekend: true,  defaultPleasure: true  },
  { id: 'sun-dinner', day: 'Dimanche', dayOffset: 6, mealLabel: 'Dîner',    isWeekend: true,  defaultPleasure: false }
];

let state = {
  weekStartDate: '',      // Format YYYY-MM-DD (toujours calé sur un Lundi)
  selectedDayOffset: 0,   // 0 = Lundi ... 6 = Dimanche (pour la vue 1 page par journée)
  plannerViewMode: 'day', // 'day' (1 page par journée : Déjeuner + Dîner) ou 'week' (toute la semaine)
  slots: [],              // Les 14 créneaux de la semaine (avec active: true/false pour comptabiliser ou supprimer)
  inStockKeys: {},        // { "nom_ingredient|unite": true } si décoché (déjà en stock)
  customItems: [],        // [{ id, name, qty, inStock }]
  favorites: [],          // [recipeId, ...]
  history: [],            // [{ id, dateLabel, weekStartDate, slots }]
  customRecipes: []       // Recettes ajoutées via IA ou manuellement
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
    });
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

    const savedKey = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY);
    if (savedKey) {
      const keyInput = document.getElementById('gemini-api-key');
      if (keyInput) keyInput.value = savedKey;
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
  if (type === 'weekend-pleasure') return window.RECIPES_DB.weekendPleasureMeals;
  if (type === 'weekend-balanced') return window.RECIPES_DB.weekendBalancedMeals;
  return window.RECIPES_DB.weekdayDinners;
}

function findRecipeById(recipeId) {
  const all = [
    ...window.RECIPES_DB.weekdayDinners,
    ...window.RECIPES_DB.weekendBalancedMeals,
    ...window.RECIPES_DB.weekendPleasureMeals
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
  const baseServings = recipe.baseServings || 2;
  const baseDishCost = typeof recipe.costFor2 === 'number'
    ? recipe.costFor2
    : (slot.isPleasure ? 8.50 : 4.50);

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
// GÉNÉRATION, REMPLACEMENT & SUPPRESSION / COMPTABILISATION DES REPAS
// ============================================================================
function pickRandomAvoiding(list, usedIds) {
  const available = list.filter((item) => !usedIds.has(item.id));
  const pool = available.length > 0 ? available : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getPoolForSlot(slot) {
  if (slot.isPleasure) {
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
    let recipePool = window.RECIPES_DB.weekdayDinners;
    if (def.defaultPleasure) {
      recipePool = window.RECIPES_DB.weekendPleasureMeals;
    } else if (def.isWeekend) {
      recipePool = window.RECIPES_DB.weekendBalancedMeals;
    }

    const pickedRecipe = pickRandomAvoiding(recipePool, usedRecipes);
    usedRecipes.add(pickedRecipe.id);

    let pickedDessertId = null;
    if (def.isWeekend || def.defaultPleasure) {
      const preferredStyle = def.defaultPleasure ? 'pleasure' : 'balanced';
      const styleDesserts = window.RECIPES_DB.weekendDesserts.filter(
        (d) => d.style === preferredStyle
      );
      const pickedDessert = pickRandomAvoiding(
        styleDesserts.length ? styleDesserts : window.RECIPES_DB.weekendDesserts,
        usedDesserts
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
      isPleasure: def.defaultPleasure,
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

// Supprimer un repas (ne pas le comptabiliser) ou le rétablir (le comptabiliser)
function toggleSlotActive(slotId) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  slot.active = slot.active === false ? true : false;
  saveStateToStorage();
  renderAll();

  showToast(
    slot.active
      ? `✅ ${slot.day} (${slot.mealLabel}) est de nouveau comptabilisé !`
      : `🗑️ ${slot.day} (${slot.mealLabel}) supprimé (non comptabilisé dans le budget et les courses)`
  );
}

function replaceMealInSlot(slotId) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  const usedIds = new Set(state.slots.filter((s) => s.active !== false).map((s) => s.recipeId));
  const pool = getPoolForSlot(slot);

  const nextRecipe = pickRandomAvoiding(pool, usedIds);
  slot.recipeId = nextRecipe.id;
  slot.validated = false;
  slot.active = true;
  saveStateToStorage();
  renderAll();
  showToast(`Nouvelle proposition pour ${slot.day} (${slot.mealLabel}) !`);
}

function replaceDessertInSlot(slotId) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  const usedDesserts = new Set(
    state.slots.filter((s) => s.dessertId).map((s) => s.dessertId)
  );
  const nextDessert = pickRandomAvoiding(window.RECIPES_DB.weekendDesserts, usedDesserts);
  slot.dessertId = nextDessert.id;
  saveStateToStorage();
  renderAll();
  showToast(`Nouveau dessert proposé pour ${slot.day} (${slot.mealLabel}) !`);
}

// Basculer en Menu Plaisir aussi bien pour la Semaine que pour le Week-end
function togglePleasureMode(slotId) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  slot.isPleasure = !slot.isPleasure;
  const usedIds = new Set(state.slots.map((s) => s.recipeId));
  const pool = getPoolForSlot(slot);

  const nextRecipe = pickRandomAvoiding(pool, usedIds);
  slot.recipeId = nextRecipe.id;

  if (slot.isPleasure) {
    if (!slot.dessertId) {
      const usedDesserts = new Set(
        state.slots.filter((s) => s.dessertId).map((s) => s.dessertId)
      );
      const pleasureDesserts = window.RECIPES_DB.weekendDesserts.filter(
        (d) => d.style === 'pleasure'
      );
      const pickedDessert = pickRandomAvoiding(
        pleasureDesserts.length ? pleasureDesserts : window.RECIPES_DB.weekendDesserts,
        usedDesserts
      );
      slot.dessertId = pickedDessert.id;
    }
  } else if (!slot.isWeekend) {
    slot.dessertId = null;
  }

  slot.validated = false;
  saveStateToStorage();
  renderAll();

  showToast(
    slot.isPleasure
      ? `${slot.day} (${slot.mealLabel}) basculé en Menu Plaisir 🌟 (+ dessert) !`
      : `${slot.day} (${slot.mealLabel}) basculé en Menu ${slot.isWeekend ? 'Équilibré' : 'Healthy & Rapide'} 🥗`
  );
}

function regenerateUnvalidatedMeals() {
  const unvalidated = state.slots.filter((s) => s.active !== false && !s.validated);
  if (unvalidated.length === 0) {
    if (confirm('Tous vos repas actifs sont validés. Voulez-vous générer une toute nouvelle semaine ?')) {
      generateFullWeekPlan();
      renderAll();
      showToast('Nouvelle semaine générée !');
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
    const nextRecipe = pickRandomAvoiding(pool, usedRecipes);
    usedRecipes.add(nextRecipe.id);
    slot.recipeId = nextRecipe.id;

    if (slot.isWeekend || slot.isPleasure) {
      const nextDessert = pickRandomAvoiding(window.RECIPES_DB.weekendDesserts, usedDesserts);
      usedDesserts.add(nextDessert.id);
      slot.dessertId = nextDessert.id;
    }
  });

  saveStateToStorage();
  renderAll();
  showToast(`${unvalidated.length} repas non validé(s) renouvelé(s) !`);
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
    badge.textContent = `${count} ${count > 1 ? 'parts' : 'part'}${count === 2 ? ' (2 adultes)' : ''}`;
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

function toggleValidateSlot(slotId) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;
  slot.validated = !slot.validated;
  saveStateToStorage();
  renderAll();
  const validatedCount = state.slots.filter((s) => s.active !== false && s.validated).length;
  showToast(
    slot.validated
      ? `✓ ${slot.day} (${slot.mealLabel}) validé — Liste de courses mise à jour (${validatedCount} repas)`
      : `↺ ${slot.day} (${slot.mealLabel}) retiré de la liste de courses (${validatedCount} repas)`
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
  showToast(
    !allValidated
      ? `Les ${activeSlots.length} repas comptabilisés sont validés — Liste de courses mise à jour ✓`
      : 'Validation réinitialisée — Liste de courses vidée'
  );
}

function validateAllAndRefreshShopping() {
  state.slots.forEach((s) => {
    if (s.active !== false) s.validated = true;
  });
  saveStateToStorage();
  renderAll();
  showToast('Tous les repas comptabilisés sont validés et ajoutés à la liste de courses !');
}

function handleGenerateShoppingListClick() {
  const validatedSlots = state.slots.filter((s) => s.active !== false && s.validated);
  saveStateToStorage();
  renderAll();
  if (validatedSlots.length === 0) {
    showToast('Aucun repas validé : validez vos repas pour remplir la liste de courses !');
  } else {
    showToast(`Liste de courses mise à jour avec vos ${validatedSlots.length} repas validé(s) !`);
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

  if (bar) bar.style.width = `${pct}%`;
  if (txt) {
    txt.textContent = `${validated} / ${total} repas validés${skippedCount > 0 ? ` (${skippedCount} supprimé${skippedCount > 1 ? 's' : ''})` : ''}`;
  }
  if (btnAll) {
    btnAll.textContent = total > 0 && validated === total ? '↺ Dévalider tout' : '✓ Tout valider';
  }

  // Compteurs Healthy vs Plaisir en semaine et week-end (sur les repas comptabilisés)
  const weekdayActive = state.slots.filter((s) => !s.isWeekend && s.active !== false);
  const weekdayPleasureCount = weekdayActive.filter((s) => s.isPleasure).length;
  const weekdayHealthyCount = weekdayActive.length - weekdayPleasureCount;
  const weekdayPill = document.getElementById('weekday-pleasure-pill');
  if (weekdayPill) {
    weekdayPill.textContent = `${weekdayHealthyCount} Healthy • ${weekdayPleasureCount} Plaisir 🌟`;
  }

  const weekendActive = state.slots.filter((s) => s.isWeekend && s.active !== false);
  const weekendPleasureCount = weekendActive.filter((s) => s.isPleasure).length;
  const pleasurePill = document.getElementById('pleasure-counter-pill');
  if (pleasurePill) {
    pleasurePill.textContent = `${weekendPleasureCount} Menu${weekendPleasureCount > 1 ? 's' : ''} Plaisir 🌟 sur le week-end`;
  }

  // Budget validé & budget total prévu de la semaine
  const validatedCost = evaluateValidatedWeekCost();
  const totalWeekCost = evaluateTotalWeekCost();
  const totalCostBadge = document.getElementById('total-week-cost-badge');
  if (totalCostBadge) {
    totalCostBadge.textContent = `💶 Validés : ${formatEuro(validatedCost)} (Total prévu : ${formatEuro(totalWeekCost)})`;
  }
}

function buildSlotCostBadgeInnerHTML(slot, costInfo) {
  if (slot.active === false) {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 0.83rem; color: var(--text-muted);">
        <span>💶 <strong>Montant évalué :</strong></span>
        <span>0,00 € (Repas non comptabilisé)</span>
      </div>
    `;
  }

  const details = slot.dessertId
    ? `Plat ${formatEuro(costInfo.dishCost)} + Dessert ${formatEuro(costInfo.dessertCost)}`
    : `${formatEuro(costInfo.perPersonCost)} / part`;

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 0.83rem;">
      <span>💶 <strong>Montant évalué du menu :</strong></span>
      <span style="font-weight: 800; color: var(--primary-hover); font-size: 0.92rem;">
        ${formatEuro(costInfo.totalCost)} <small style="font-weight: 600; color: var(--text-muted);">(${details})</small>
      </span>
    </div>
  `;
}

function createMealCardHTML(slot) {
  const isSkipped = slot.active === false;
  const recipe = findRecipeById(slot.recipeId);
  const dessert = slot.dessertId ? findDessertById(slot.dessertId) : null;
  const isFav = state.favorites.includes(recipe.id);
  const costInfo = evaluateSlotCost(slot);
  const mealIcon = slot.mealLabel === 'Déjeuner' ? '☀️' : '🌙';

  const cardClasses = [
    'meal-card',
    !isSkipped && slot.validated ? 'is-validated' : '',
    !isSkipped && slot.isPleasure ? 'is-pleasure' : '',
    isSkipped ? 'is-skipped' : ''
  ]
    .filter(Boolean)
    .join(' ');

  // Si le repas est supprimé / non comptabilisé
  if (isSkipped) {
    return `
      <article class="${cardClasses}">
        <div class="meal-card-header">
          <span class="slot-label" style="background: #e2e8f0; color: #475569;">
            ${mealIcon} ${slot.mealLabel} — Non comptabilisé
          </span>
          <button
            class="btn btn-primary btn-sm"
            onclick="toggleSlotActive('${slot.slotId}')"
            title="Cliquer pour rétablir et comptabiliser ce repas"
          >
            ➕ Comptabiliser ce repas
          </button>
        </div>

        <div style="padding: 18px 8px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
          <p>🚫 <strong>Ce ${slot.mealLabel.toLowerCase()} est supprimé pour ${slot.day}.</strong></p>
          <p style="font-size: 0.8rem; margin-top: 4px;">
            Ses ingrédients et son coût (0,00 €) ne sont pas comptabilisés dans la liste de courses.
          </p>
          <p style="font-size: 0.78rem; margin-top: 6px; opacity: 0.85;">
            (Idée en réserve : <em>${recipe.title}</em>)
          </p>
        </div>
      </article>
    `;
  }

  const modeButtonLabel = slot.isPleasure
    ? '🌟 Menu Plaisir'
    : slot.isWeekend
    ? '🥗 Équilibré'
    : '🥗 Healthy & Rapide';

  return `
    <article class="${cardClasses}">
      <div>
        <div class="meal-card-header">
          <span class="slot-label">${mealIcon} ${slot.mealLabel}</span>
          <div class="card-top-badges">
            <button
              class="btn btn-sm ${slot.isPleasure ? 'btn-pleasure' : 'btn-outline'}"
              onclick="togglePleasureMode('${slot.slotId}')"
              title="Cliquer pour basculer entre Menu Healthy/Équilibré et Menu Plaisir 🌟"
            >
              ${modeButtonLabel}
            </button>
            <button
              class="btn btn-outline btn-sm"
              style="padding: 4px 8px; color: #b91c1c; border-color: #fecaca;"
              onclick="toggleSlotActive('${slot.slotId}')"
              title="Supprimer ce repas (ne pas le comptabiliser)"
            >
              🗑️ Supprimer
            </button>
            <button class="fav-btn" onclick="toggleFavorite('${recipe.id}')" title="Ajouter/Retirer des favoris">
              ${isFav ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        <h3 class="meal-title" style="margin-top: 10px;">${recipe.title}</h3>
        <p class="meal-desc" style="margin-top: 4px;">${recipe.description || ''}</p>

        <div class="meal-meta" style="margin-top: 10px;">
          <span class="meta-pill">⏱️ Prépa ${recipe.prepTime} • Cuisson ${recipe.cookTime}</span>
          <span class="meta-pill">👨‍🍳 ${recipe.difficulty}</span>
          <span class="meta-pill">${recipe.budget}</span>
        </div>

        <!-- Évaluation du montant du menu -->
        <div
          id="cost-summary-${slot.slotId}"
          style="margin-top: 10px; padding: 8px 10px; background: var(--primary-soft); border: 1px solid #a7f3d0; border-radius: var(--radius-sm);"
        >
          ${buildSlotCostBadgeInnerHTML(slot, costInfo)}
        </div>

        ${
          dessert
            ? `
          <div class="dessert-box" style="margin-top: 10px;">
            <div class="dessert-header">
              <span class="dessert-tag">🍰 Proposition de dessert incluse</span>
              <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.74rem;" onclick="replaceDessertInSlot('${slot.slotId}')">
                🔄 Autre dessert
              </button>
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

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
        <!-- Curseur du nombre de parts du repas -->
        <div class="servings-control">
          <div class="servings-label-row">
            <label for="slider-${slot.slotId}">👥 Parts pour ce ${slot.mealLabel.toLowerCase()} :</label>
            <span id="servings-badge-${slot.slotId}" class="servings-badge">
              ${slot.servings} ${slot.servings > 1 ? 'parts' : 'part'}${slot.servings === 2 ? ' (2 adultes)' : ''}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
            <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-weight: 800;" onclick="stepSlotServings('${slot.slotId}', -1)">−</button>
            <input
              id="slider-${slot.slotId}"
              type="range"
              class="servings-slider"
              min="1"
              max="10"
              step="1"
              value="${slot.servings}"
              oninput="updateSlotServings('${slot.slotId}', this.value)"
            />
            <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-weight: 800;" onclick="stepSlotServings('${slot.slotId}', 1)">+</button>
          </div>
        </div>

        <!-- Boutons Recette / Autre idée / Valider -->
        <div class="meal-card-actions">
          <button class="btn btn-outline btn-sm" onclick="openRecipeModal('${slot.slotId}')">
            📖 Voir la recette
          </button>
          <button class="btn btn-outline btn-sm" onclick="replaceMealInSlot('${slot.slotId}')">
            🔄 Autre idée
          </button>
          <button
            class="btn btn-validate ${slot.validated ? 'validated' : ''}"
            onclick="toggleValidateSlot('${slot.slotId}')"
          >
            ${slot.validated ? '✓ Menu validé (Cliquer pour modifier)' : 'Valider ce plat'}
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
      ? '📱 Mode 1 page par journée (Déjeuner & Dîner)'
      : '🗓️ Mode Semaine complète (7 jours déroulants)'
  );
}

function validateDayAndNext(dayOffset) {
  const daySlots = state.slots.filter((s) => s.dayOffset === dayOffset && s.active !== false);
  daySlots.forEach((s) => {
    s.validated = true;
  });
  saveStateToStorage();

  const dayName = DAY_NAMES_LIST[dayOffset] || 'Journée';
  if (dayOffset < 6) {
    state.selectedDayOffset = dayOffset + 1;
    renderAll();
    showToast(`✓ ${dayName} validé ! Passage à ${DAY_NAMES_LIST[dayOffset + 1]}`);
    const pagerEl = document.getElementById('day-pager-container');
    if (pagerEl) pagerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    renderAll();
    showToast(`✓ ${dayName} validé ! Toute la semaine est parcourue.`);
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

      let statusIcon = '⚪';
      if (activeSlots.length === 0) {
        statusIcon = '➖';
      } else if (validatedCount === activeSlots.length) {
        statusIcon = '✅';
      } else if (validatedCount > 0) {
        statusIcon = '🟡';
      }

      const isWeekend = offset >= 5;
      const isActive = isDayMode && curOffset === offset;

      return `
        <button
          type="button"
          class="day-tab-btn ${isWeekend ? 'is-weekend-tab' : ''} ${isActive ? 'active' : ''}"
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
            ${isDayMode ? `📄 Page ${curOffset + 1} / 7 — ${curDayName}` : '🗓️ Vue Semaine complète (7 jours)'}
          </span>
        </div>
        <button
          type="button"
          class="btn btn-outline btn-sm"
          onclick="togglePlannerViewMode()"
          style="font-weight: 700; font-size: 0.78rem;"
        >
          ${isDayMode ? '🗓️ Voir toute la semaine' : '📱 Vue 1 Page / Jour'}
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
            📅 ${curFullTitle}
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
          class="btn ${allDayValidated ? 'btn-outline' : 'btn-primary'} btn-sm"
          onclick="validateDayAndNext(${dayOffset})"
          style="font-weight: 800;"
        >
          ${
            dayOffset < 6
              ? `✓ Valider ${dayName} & passer à ${DAY_NAMES_LIST[dayOffset + 1]} ▶`
              : `✓ Valider ${dayName}`
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
            🛒 Voir Liste Keep ▶
          </button>
        `
        }
      </div>
    `
    : '';

  return `
    <div class="day-group">
      <div class="day-group-header">
        <div class="day-title-box">
          <h3 class="day-title">📅 ${fullDayTitle}</h3>
          <span id="day-cost-badge-${dayOffset}" class="meta-pill healthy-pill">
            💶 Journée : ${formatEuro(dayCost)}
          </span>
          <span class="meta-pill">
            ${activeCount} / ${daySlots.length} repas comptabilisé${activeCount > 1 ? 's' : ''}
          </span>
        </div>

        <!-- Curseur Parts globales sur chaque journée -->
        <div class="day-global-servings">
          <span style="font-size: 0.82rem; font-weight: 700;">👥 Parts globales (${dayName}) :</span>
          <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-weight: 800;" onclick="stepDayGlobalServings(${dayOffset}, -1)">−</button>
          <input
            type="range"
            class="servings-slider"
            style="width: 110px;"
            min="1"
            max="10"
            step="1"
            value="${dayServings}"
            oninput="updateDayGlobalServings(${dayOffset}, this.value)"
          />
          <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-weight: 800;" onclick="stepDayGlobalServings(${dayOffset}, 1)">+</button>
          <span class="servings-badge">${dayServings} ${dayServings > 1 ? 'parts' : 'part'}</span>
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

  const modalBody = document.getElementById('recipe-modal-body');
  if (!modalBody) return;

  const ingredientsHTML = recipe.ingredients
    .map(
      (ing) => `
      <li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--border-color); font-size: 0.9rem;">
        <span>${ing.name}</span>
        <strong>${formatScaledQty(ing.qty, ratio)} ${ing.unit}</strong>
      </li>
    `
    )
    .join('');

  const stepsHTML = recipe.steps.map((step) => `<li>${step}</li>`).join('');

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

  modalBody.innerHTML = `
    <span class="slot-label">${formatSlotDayHeader(slot)} • ${slot.mealLabel}</span>
    <h2 style="font-size: 1.3rem; font-weight: 800; margin-top: 8px;">${recipe.title}</h2>
    <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">${recipe.description || ''}</p>

    <div class="meal-meta" style="margin: 12px 0;">
      <span class="meta-pill">👥 Ajusté pour <strong>${slot.servings} ${slot.servings > 1 ? 'parts' : 'part'}</strong></span>
      <span class="meta-pill healthy-pill">💶 Montant évalué : <strong>${formatEuro(costInfo.totalCost)}</strong> (${formatEuro(costInfo.perPersonCost)}/part)</span>
      <span class="meta-pill">⏱️ Prépa ${recipe.prepTime} • Cuisson ${recipe.cookTime}</span>
      <span class="meta-pill">👨‍🍳 ${recipe.difficulty}</span>
    </div>

    <h3 style="font-size: 1rem; font-weight: 800; margin-top: 16px; margin-bottom: 8px;">
      🛒 Ingrédients du plat (${slot.servings} ${slot.servings > 1 ? 'parts' : 'part'} — ${formatEuro(costInfo.dishCost)})
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
// CALCUL DE LA LISTE DE COURSES PAR RAYON & GESTION DU STOCK
// (Ne prend en compte QUE les repas comptabilisés ET validés : slot.active !== false && slot.validated)
// ============================================================================
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
          unit: ing.unit,
          aisle: ing.aisle || 'Épicerie salée',
          sources: [`${slot.day} (${slot.mealLabel})`]
        });
      } else {
        const existing = map.get(normalizedKey);
        existing.qty += scaledQty;
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
            unit: ing.unit,
            aisle: ing.aisle || 'Épicerie sucrée & Pâtisserie',
            sources: [`Dessert ${slot.day} (${slot.mealLabel})`]
          });
        } else {
          const existing = map.get(normalizedKey);
          existing.qty += scaledQty;
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
      aisle: 'Boulangerie & Divers',
      sources: ['Ajout personnel'],
      isCustom: true,
      customId: custom.id
    });
  });

  return Array.from(map.values());
}

function toggleIngredientStock(itemKey) {
  if (state.inStockKeys[itemKey]) {
    delete state.inStockKeys[itemKey];
  } else {
    state.inStockKeys[itemKey] = true;
  }
  saveStateToStorage();
  renderShoppingList();
}

function checkAllIngredients(shouldBuy) {
  const allItems = buildAggregatedShoppingList();
  if (shouldBuy) {
    state.inStockKeys = {};
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
    if (state.inStockKeys[item.key]) {
      inStockCount++;
    } else {
      toBuyCount++;
    }
  });

  const navBadge = document.getElementById('nav-shopping-count');
  if (navBadge) navBadge.textContent = toBuyCount;

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
              const isInStock = !!state.inStockKeys[item.key];
              const safeKey = item.key.replace(/'/g, "\\'");
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
                  <div class="ing-right">
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

  const keepPreview = document.getElementById('keep-note-preview');
  if (keepPreview) {
    keepPreview.textContent = generateGoogleKeepNoteText(grouped, sortedAisles);
  }
}

// ============================================================================
// EXPORT VERS GOOGLE KEEP (MOBILE SHARE & COPIER + OUVRIR KEEP)
// ============================================================================
function generateGoogleKeepNoteText(grouped, sortedAisles) {
  const mondayFull = formatMondayFullLabel(state.weekStartDate);
  const validatedCost = evaluateValidatedWeekCost();
  const validatedSlots = state.slots.filter((s) => s.active !== false && s.validated);

  const lines = [];
  lines.push(`🛒 LISTE DE COURSES — Semaine du ${mondayFull}`);
  lines.push(`💶 Budget des ${validatedSlots.length} repas validé(s) : ${formatEuro(validatedCost)}`);
  lines.push('');

  let count = 0;
  sortedAisles.forEach((aisle) => {
    const toBuyInAisle = (grouped[aisle] || []).filter(
      (item) => !state.inStockKeys[item.key]
    );
    if (toBuyInAisle.length === 0) return;

    const icon = window.RECIPES_DB.categories[aisle]?.icon || '•';
    lines.push(`${icon} ${aisle.toUpperCase()}`);
    toBuyInAisle.forEach((item) => {
      lines.push(`☐ ${item.name} : ${formatIngredientQuantity(item)}`);
      count++;
    });
    lines.push('');
  });

  if (count === 0) {
    lines.push(
      validatedSlots.length === 0
        ? 'Aucun repas validé pour le moment : validez vos repas pour générer la liste !'
        : 'Tous les ingrédients des repas validés sont déjà cochés en stock !'
    );
  } else {
    lines.push('---');
    lines.push(`📌 Menus validés (${mondayFull}) :`);
    validatedSlots.forEach((s) => {
      const r = findRecipeById(s.recipeId);
      const d = s.dessertId ? ` + ${findDessertById(s.dessertId).title}` : '';
      const cost = formatEuro(evaluateSlotCost(s).totalCost);
      lines.push(`• ${formatSlotDayHeader(s)} (${s.mealLabel} - ${s.servings}p - ${cost}) : ${r.title}${d}`);
    });
  }

  return lines.join('\n');
}

function ensureNoteReadyForKeepExport() {
  const activeSlots = state.slots.filter((s) => s.active !== false);
  const validatedSlots = activeSlots.filter((s) => s.validated);

  // Si aucun repas n'était encore validé au moment d'envoyer vers Keep, valider automatiquement les repas comptabilisés
  if (validatedSlots.length === 0 && state.customItems.length === 0 && activeSlots.length > 0) {
    state.slots.forEach((s) => {
      if (s.active !== false) s.validated = true;
    });
    saveStateToStorage();
    renderAll();
    showToast('✓ Repas validés automatiquement pour remplir votre liste Keep !');
  }

  return document.getElementById('keep-note-preview')?.textContent || '';
}

function openGoogleKeepAndroidDirect() {
  const noteText = ensureNoteReadyForKeepExport();
  const title = `🛒 Courses — Semaine du ${formatMondayFullLabel(state.weekStartDate)}`;

  // Copier aussi dans le presse-papiers par sécurité
  fallbackCopyText(noteText);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(noteText).catch(() => {});
  }

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);

  if (isAndroid) {
    // Lien Intent natif Android qui ouvre directement l'application Google Keep (com.google.android.keep) avec la note pré-remplie !
    const intentUrl =
      `intent://#Intent;` +
      `action=android.intent.action.SEND;` +
      `type=text/plain;` +
      `package=com.google.android.keep;` +
      `S.android.intent.extra.SUBJECT=${encodeURIComponent(title)};` +
      `S.android.intent.extra.TEXT=${encodeURIComponent(noteText)};` +
      `S.browser_fallback_url=${encodeURIComponent('https://keep.google.com/')};` +
      `end`;

    showToast('🚀 Ouverture directe de l\'application Google Keep...');
    window.location.href = intentUrl;
    return;
  }

  // Si cliqué depuis un iPhone ou un PC, basculer automatiquement sur le partage mobile ou l'ouverture Web
  shareToGoogleKeepMobile();
}

async function shareToGoogleKeepMobile() {
  const noteText = ensureNoteReadyForKeepExport();
  const title = `🛒 Courses — Semaine du ${formatMondayFullLabel(state.weekStartDate)}`;

  // Toujours copier en parallèle dans le presse-papiers
  fallbackCopyText(noteText);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(noteText).catch(() => {});
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: noteText
      });
      showToast('Choisissez l\'icône jaune "Keep Notes" puis Enregistrer !');
      return;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.warn('Partage non supporté, bascule vers copie + Keep Web :', err);
    }
  }

  copyAndOpenGoogleKeep();
}

function copyAndOpenGoogleKeep() {
  const noteText = ensureNoteReadyForKeepExport();

  // 1. Copie synchrone immédiate (pour ne pas bloquer l'ouverture de l'onglet Keep)
  fallbackCopyText(noteText);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(noteText).catch(() => {});
  }

  // 2. Ouverture synchrone de Google Keep (évite le blocage de pop-up du navigateur)
  window.open('https://keep.google.com/', '_blank', 'noopener');

  // 3. Afficher une indication claire pour coller la note dans Google Keep Web
  showToast('📋 Liste copiée ! Cliquez sur "Créer une note..." dans Keep puis Coller (Ctrl+V)');
}

async function copyKeepListOnly() {
  const noteText = ensureNoteReadyForKeepExport();
  try {
    await navigator.clipboard.writeText(noteText);
    showToast('Liste de courses copiée dans le presse-papiers 📋');
  } catch (e) {
    fallbackCopyText(noteText);
    showToast('Liste de courses copiée 📋');
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(ta);
}

// ============================================================================
// FAVORIS & HISTORIQUE DES SEMAINES
// ============================================================================
function toggleFavorite(recipeId) {
  const idx = state.favorites.indexOf(recipeId);
  if (idx === -1) {
    state.favorites.push(recipeId);
    showToast('Ajouté à vos recettes favorites ❤️');
  } else {
    state.favorites.splice(idx, 1);
    showToast('Retiré des favoris');
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
                <div style="font-size:0.76rem; color:var(--text-muted);">⏱️ ${r.prepTime} • ${r.difficulty} • 💶 ${formatEuro(r.costFor2 || 4.5)} (2 parts)</div>
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

  const newRecipe = {
    id: `custom-${Date.now()}`,
    title,
    type,
    prepTime: time,
    cookTime: '10 min',
    difficulty: type === 'weekend-pleasure' ? 'Moyenne' : 'Facile',
    budget: type === 'weekend-pleasure' ? '€€ (Moyen)' : '€ (Bon marché)',
    costFor2: type === 'weekend-pleasure' ? 8.00 : 4.50,
    baseServings: 2,
    description: 'Recette personnalisée ajoutée à votre catalogue.',
    ingredients,
    steps
  };

  state.customRecipes.push(newRecipe);
  getCatalogListByType(type).unshift(newRecipe);
  saveStateToStorage();

  document.getElementById('manual-title').value = '';
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

  const promptText = `Génère une recette en français au format JSON strict pour 2 adultes.
Catégorie : ${
    mealType === 'weekday'
      ? 'Repas de semaine (déjeuner ou dîner) healthy, équilibré, rapide (15 min) et bon marché'
      : mealType === 'weekend-pleasure'
      ? 'Menu Plaisir gourmand, simplicité moyenne et durée moyenne (35 min)'
      : 'Repas équilibré et convivial'
  }.
Indication supplémentaire : ${customPrompt || 'Aucune'}.
Format JSON attendu uniquement (sans markdown) :
{
  "title": "Nom du plat",
  "prepTime": "10 min",
  "cookTime": "15 min",
  "difficulty": "Facile",
  "budget": "€ (Bon marché)",
  "costFor2": 4.80,
  "description": "Courte description appétissante",
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
      prepTime: parsed.prepTime || '15 min',
      cookTime: parsed.cookTime || '15 min',
      difficulty: parsed.difficulty || 'Facile',
      budget: parsed.budget || '€ (Bon marché)',
      costFor2: parseFloat(parsed.costFor2) || (mealType === 'weekend-pleasure' ? 8.50 : 4.80),
      baseServings: 2,
      description: parsed.description || 'Recette générée par IA.',
      ingredients: parsed.ingredients || [],
      steps: parsed.steps || []
    };

    state.customRecipes.push(aiRecipe);
    getCatalogListByType(mealType).unshift(aiRecipe);

    const targetSlot = state.slots.find((s) =>
      s.active !== false &&
      (mealType === 'weekday'
        ? !s.isWeekend && !s.validated
        : mealType === 'weekend-pleasure'
        ? s.isPleasure && !s.validated
        : s.isWeekend && !s.isPleasure && !s.validated)
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
  document.querySelectorAll('.view-section').forEach((sec) => {
    sec.classList.remove('active');
  });
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn, .mobile-nav-item').forEach((btn) => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
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

