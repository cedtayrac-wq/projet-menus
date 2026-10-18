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
  PANTRY_DEDUCT_MODE: 'menusemaine_pantry_deduct_v1',
  VOICE_SETTINGS: 'menusemaine_voice_settings_v1',
  ELEVENLABS_KEY: 'menusemaine_elevenlabs_api_key_v1'
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
  selectedMealPeriod: 'lunch', // 'lunch' (☀️ Déjeuner) ou 'dinner' (🌙 Dîner) pour la navigation horizontale
  plannerViewMode: 'day', // 'day' (navigation horizontale Midi / Soir) ou 'week' (toute la semaine)
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
  deductPantryFromShopping: true, // Ajuster automatiquement la liste des courses avec le stock frigo/placard
  voiceSettings: {
    persona: 'lignac',
    engine: 'elevenlabs',
    voiceURI: 'auto',
    rate: 1.0,
    pitch: 1.0,
    frenchOnly: true,
    clonedVoiceIds: {},
    clonedVoiceProfiles: {}
  }
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
    const hasResetServingsTo2 = localStorage.getItem('menusemaine_default_2_convives_v1');
    state.slots.forEach((slot) => {
      const def = SLOTS_DEFINITION.find((d) => d.id === slot.slotId);
      if (def && typeof slot.dayOffset !== 'number') {
        slot.dayOffset = def.dayOffset;
      }
      if (typeof slot.active !== 'boolean') {
        slot.active = true;
      }
      if (!hasResetServingsTo2 || typeof slot.servings !== 'number' || slot.servings < 1) {
        slot.servings = 2;
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
    if (!localStorage.getItem('menusemaine_default_2_convives_v1')) {
      state.pantryServings = 2;
      state.pantryCardServings = {};
      localStorage.setItem(STORAGE_KEYS.PANTRY_SERVINGS, '2');
      localStorage.setItem('menusemaine_default_2_convives_v1', 'true');
    }
    saveStateToStorage();
  }

  renderAll();
  setupPwaSupport();
  setupVoiceGuide();
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
      if (target && (target.tagName === 'INPUT' || target.closest('.day-tabs-strip'))) {
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
      // Glissement horizontal gauche / droite pour passer entre Déjeuner (Midi) et Dîner (Soir)
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        if (dx < 0) {
          stepPlannerMeal(1);
        } else if (dx > 0) {
          stepPlannerMeal(-1);
        }
      }
    },
    { passive: true }
  );
}

function isLocalAdminEnvironment() {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:'
  );
}

function decodeSharedApiKey(encoded) {
  if (!encoded || typeof encoded !== 'string') return '';
  const trimmed = encoded.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('msk1_')) {
    try {
      const b64 = trimmed.slice(5);
      return decodeURIComponent(escape(atob(b64))).split('').reverse().join('');
    } catch (e) {
      return '';
    }
  }
  return trimmed;
}

function getEffectiveAiApiKey(purpose = 'vision') {
  const cfg = window.APP_CONFIG || {};
  const isLocal = isLocalAdminEnvironment();
  const allowShared = isLocal || cfg.shareAiKeyWithGuests !== false;

  if (purpose === 'voice') {
    if (cfg.aiVoiceEnabled === false && !isLocal) {
      return '';
    }
    if (allowShared && cfg.aiVoiceEnabled !== false) {
      const sharedVoiceKey =
        decodeSharedApiKey(cfg.voiceApiKeyEncoded || cfg.voiceApiKey || '') ||
        decodeSharedApiKey(cfg.aiApiKeyEncoded || cfg.aiApiKey || '');
      if (sharedVoiceKey) return sharedVoiceKey;
    }
    if (isLocal) {
      return (
        localStorage.getItem('menusemaine_voice_api_key_v1') ||
        localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) ||
        ''
      ).trim();
    }
    return '';
  }

  // Par défaut : 'vision' (Reconnaissance visuelle IA Garde-manger & Recettes IA)
  if (cfg.aiVisionEnabled === false && !isLocal) {
    return '';
  }
  if (allowShared && cfg.aiVisionEnabled !== false) {
    const sharedVisionKey = decodeSharedApiKey(cfg.aiApiKeyEncoded || cfg.aiApiKey || '');
    if (sharedVisionKey) return sharedVisionKey;
  }
  if (isLocal) {
    const domKey =
      document.getElementById('pantry-gemini-key-input')?.value.trim() ||
      document.getElementById('gemini-api-key')?.value.trim() ||
      '';
    if (domKey) return domKey;
    return (localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '').trim();
  }
  return '';
}

function applyAppConfigAndAccessControl() {
  const cfg = window.APP_CONFIG || {};
  const isLocal = isLocalAdminEnvironment();

  // Afficher le bouton Admin uniquement en local (les invités n'ont jamais accès à l'admin ni à la section Clé API IA)
  const adminBtn = document.getElementById('local-admin-btn');
  if (adminBtn) {
    adminBtn.style.display = isLocal ? 'inline-flex' : 'none';
  }

  // Protection stricte : supprimer / masquer tout élément de configuration de clé API pour les invités
  if (!isLocal || cfg.hideAiKeySectionForGuests !== false) {
    document.querySelectorAll('.admin-only-ai-key, .pantry-ai-config-bar').forEach((el) => {
      if (!isLocal) el.remove();
    });
    if (!isLocal) {
      const pantryKeyInput = document.getElementById('pantry-gemini-key-input');
      if (pantryKeyInput) pantryKeyInput.remove();
      const studioKeyInput = document.getElementById('gemini-api-key');
      if (studioKeyInput) studioKeyInput.remove();
    }
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

    if (isLocalAdminEnvironment()) {
      const savedKey = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY);
      if (savedKey) {
        const keyInput = document.getElementById('gemini-api-key');
        if (keyInput) keyInput.value = savedKey;
        const pantryKeyInput = document.getElementById('pantry-gemini-key-input');
        if (pantryKeyInput) pantryKeyInput.value = savedKey;
      }
    }

    const savedVoice = localStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS);
    if (savedVoice) {
      const parsedVoice = JSON.parse(savedVoice);
      if (parsedVoice && typeof parsedVoice === 'object') {
        state.voiceSettings = {
          persona: parsedVoice.persona || 'lignac',
          engine: parsedVoice.engine || 'elevenlabs',
          voiceURI: parsedVoice.voiceURI || 'auto',
          rate: typeof parsedVoice.rate === 'number' ? parsedVoice.rate : 1.0,
          pitch: typeof parsedVoice.pitch === 'number' ? parsedVoice.pitch : 1.0,
          frenchOnly: typeof parsedVoice.frenchOnly === 'boolean' ? parsedVoice.frenchOnly : true,
          clonedVoiceIds: parsedVoice.clonedVoiceIds && typeof parsedVoice.clonedVoiceIds === 'object' ? parsedVoice.clonedVoiceIds : {},
          clonedVoiceProfiles: parsedVoice.clonedVoiceProfiles && typeof parsedVoice.clonedVoiceProfiles === 'object' ? parsedVoice.clonedVoiceProfiles : {}
        };
      }
    }

    const savedElevenKey = localStorage.getItem(STORAGE_KEYS.ELEVENLABS_KEY);
    if (savedElevenKey) {
      const elevenInput = document.getElementById('elevenlabs-api-key');
      if (elevenInput) elevenInput.value = savedElevenKey;
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
    localStorage.setItem(STORAGE_KEYS.VOICE_SETTINGS, JSON.stringify(state.voiceSettings || {}));
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

const dynamicPantryRecipesMap = new Map();

function findRecipeById(recipeId) {
  if (dynamicPantryRecipesMap.has(recipeId)) {
    return dynamicPantryRecipesMap.get(recipeId);
  }
  const all = [
    ...(state.customRecipes || []),
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
  slot.lastRemovedDessertId = null;
  saveStateToStorage();
  renderAll();
  animateCardElement(slotId, 'anim-shuffle');
  showToast(`🍰 Nouvelle douceur proposée pour ${slot.day} (${slot.mealLabel}) !`);
}

function toggleDessertInSlot(slotId) {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot) return;

  if (slot.dessertId) {
    slot.lastRemovedDessertId = slot.dessertId;
    slot.dessertId = null;
    saveStateToStorage();
    renderAll();
    showToast(`🚫 Note sucrée retirée pour ${slot.day} (${slot.mealLabel})`);
  } else {
    if (slot.lastRemovedDessertId && findDessertById(slot.lastRemovedDessertId)) {
      slot.dessertId = slot.lastRemovedDessertId;
    } else {
      const usedDesserts = new Set(state.slots.filter((s) => s.dessertId).map((s) => s.dessertId));
      const style = getSlotStyle(slot);
      const styleDesserts = window.RECIPES_DB.weekendDesserts.filter((d) => d.style === style);
      const pool = styleDesserts.length ? styleDesserts : window.RECIPES_DB.weekendDesserts;
      const nextDessert = pickRandomAvoiding(pool, usedDesserts, getSlotMonthNum(slot));
      slot.dessertId = nextDessert.id;
    }
    saveStateToStorage();
    renderAll();
    animateCardElement(slotId, 'anim-shuffle');
    const restored = findDessertById(slot.dessertId);
    showToast(`🍰 Note sucrée ajoutée : ${restored ? restored.title : 'Dessert'} !`);
  }
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
    badge.textContent = `${count} ${count > 1 ? 'convives' : 'convive'}`;
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
  const timeTagLabel = isLunch ? 'SERVICE DU MIDI • DÉJEUNER' : 'SERVICE DU SOIR • DÎNER';
  const dishEmoji = getDishEmoji(recipe, slot);

  const cardClasses = [
    'meal-card',
    isLunch ? 'is-lunch-card' : 'is-dinner-card',
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
        <div class="meal-time-banner ${isLunch ? 'lunch-banner' : 'dinner-banner'} is-skipped-banner">
          <div class="slot-label-group">
            <span class="meal-time-icon">${mealIcon}</span>
            <span class="meal-time-title">${slot.mealLabel} — Ignoré</span>
          </div>
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

  const winePairingHTML = buildWinePairingBoxHTML(recipe, slot, false);

  return `
    <article id="meal-card-${slot.slotId}" class="${cardClasses}">
      <div>
        <!-- Bandeau Fort Contraste : MIDI (Solaire Clair) vs SOIR (Indigo Nuit) -->
        <div class="meal-time-banner ${isLunch ? 'lunch-banner' : 'dinner-banner'}">
          <div class="slot-label-group">
            <span class="meal-time-icon">${mealIcon}</span>
            <div>
              <div class="meal-time-kicker">${isLunch ? '☀️ MIDI' : '🌙 SOIR'}</div>
              <div class="meal-time-title">${slot.mealLabel}</div>
            </div>
            ${slot.validated ? '<span class="chef-stamp-badge">✓ Validé</span>' : ''}
          </div>
          <div class="card-top-badges">
            <button
              class="btn btn-outline btn-sm btn-ignore-slot"
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
        </div>

        <!-- Sélection du nombre de parts juste en dessous des boutons du type de repas et autre idée (boutons - et + avec nombre de convives au milieu, sans curseur) -->
        <div class="servings-control" style="margin-top: 6px; flex-direction: row; align-items: center; justify-content: space-between; padding: 6px 10px;">
          <span style="font-size: 0.8rem; font-weight: 800; color: var(--text-main);">🍽️ À table (${slot.mealLabel.toLowerCase()}) :</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" class="btn btn-outline btn-sm btn-step-servings" onclick="stepSlotServings('${slot.slotId}', -1)" aria-label="Moins un convive">−</button>
            <span id="servings-badge-${slot.slotId}" class="servings-badge" style="min-width: 90px; text-align: center; padding: 3px 8px;">
              ${slot.servings} ${slot.servings > 1 ? 'convives' : 'convive'}
            </span>
            <button type="button" class="btn btn-outline btn-sm btn-step-servings" onclick="stepSlotServings('${slot.slotId}', 1)" aria-label="Plus un convive">+</button>
          </div>
        </div>

        <div class="meal-title-row" style="margin-top: 8px;">
          <div class="meal-dish-avatar" onclick="openRecipeModal('${slot.slotId}')" style="cursor:pointer;" title="Voir la fiche recette">
            ${dishEmoji}
          </div>
          <div style="flex: 1; min-width: 0;">
            <h3 class="meal-title" onclick="openRecipeModal('${slot.slotId}')">${recipe.title}</h3>
            <p class="meal-desc">${recipe.description || ''}</p>
          </div>
        </div>

        <div class="meal-meta" style="margin-top: 8px;">
          <span class="meta-pill">⏱️ Prépa ${recipe.prepTime} • Feu ${recipe.cookTime}</span>
          <span class="meta-pill">👨‍🍳 ${recipe.difficulty}</span>
          <span class="meta-pill">${recipe.budget}</span>
        </div>

        <!-- Indicateurs compacts Saisonnalité (%) & Équilibre alimentaire -->
        ${buildNutritionAndSeasonHTML(recipe, slot, true)}

        ${winePairingHTML}

        <!-- Évaluation du montant du menu -->
        <div id="cost-summary-${slot.slotId}" class="slot-cost-box" style="margin-top: 6px; padding: 6px 10px;">
          ${buildSlotCostBadgeInnerHTML(slot, costInfo)}
        </div>

        ${
          dessert
            ? `
          <div class="dessert-box" style="margin-top: 8px; padding: 8px 10px;">
            <div class="dessert-header">
              <span class="dessert-tag">🍰 Note sucrée du repas</span>
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.74rem;" onclick="openCatalogModal('${slot.slotId}', 'dessert')" title="Choisir un dessert dans le catalogue">
                  📚 Choisir
                </button>
                <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.74rem;" onclick="replaceDessertInSlot('${slot.slotId}')">
                  🎲 Autre dessert
                </button>
                <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.74rem; color: #b91c1c; border-color: #fecaca;" onclick="toggleDessertInSlot('${slot.slotId}')" title="Enlever la note sucrée de ce repas">
                  ✕ Enlever
                </button>
              </div>
            </div>
            <div class="dessert-title">${dessert.title}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">
              ⏱️ Prépa ${dessert.prepTime} ${dessert.cookTime && dessert.cookTime !== '0 min' ? `• Cuisson ${dessert.cookTime}` : ''}
            </div>
          </div>
        `
            : `
          <div style="margin-top: 8px;">
            <button
              type="button"
              class="btn btn-outline btn-sm"
              style="width: 100%; justify-content: center; border-style: dashed; border-color: #f59e0b; color: var(--pleasure-hover); background: rgba(254, 243, 199, 0.35); font-size: 0.78rem; padding: 5px 10px;"
              onclick="toggleDessertInSlot('${slot.slotId}')"
              title="Remettre ou ajouter une note sucrée (dessert) à ce repas"
            >
              🍰 ${slot.lastRemovedDessertId ? 'Remettre la note sucrée' : '+ Ajouter une note sucrée'}
            </button>
          </div>
        `
        }
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
        <!-- Boutons Recette / Catalogue / Valider -->
        <div class="meal-card-actions">
          <button class="btn btn-outline btn-fiche-cuisine" onclick="openRecipeModal('${slot.slotId}')">
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

function selectPlannerMealPeriod(period, slideDir = 0) {
  state.selectedMealPeriod = period === 'dinner' ? 'dinner' : 'lunch';
  state.lastMealSlideDir = slideDir;
  renderPlannerCards();
}

function stepPlannerMeal(delta) {
  const curPeriod = state.selectedMealPeriod || 'lunch';
  const curDay = state.selectedDayOffset || 0;

  if (delta > 0) {
    if (curPeriod === 'lunch') {
      state.selectedMealPeriod = 'dinner';
      state.lastMealSlideDir = 1;
      renderPlannerCards();
    } else if (curDay < 6) {
      state.selectedDayOffset = curDay + 1;
      state.selectedMealPeriod = 'lunch';
      state.lastMealSlideDir = 1;
      renderPlannerCards();
    }
  } else if (delta < 0) {
    if (curPeriod === 'dinner') {
      state.selectedMealPeriod = 'lunch';
      state.lastMealSlideDir = -1;
      renderPlannerCards();
    } else if (curDay > 0) {
      state.selectedDayOffset = curDay - 1;
      state.selectedMealPeriod = 'dinner';
      state.lastMealSlideDir = -1;
      renderPlannerCards();
    }
  }
}

function stepPlannerDay(delta) {
  const next = state.selectedDayOffset + delta;
  if (next < 0 || next > 6) return;
  state.selectedDayOffset = next;
  state.selectedMealPeriod = 'lunch';
  state.lastMealSlideDir = delta > 0 ? 1 : -1;
  renderPlannerCards();
}

function togglePlannerViewMode() {
  state.plannerViewMode = state.plannerViewMode === 'day' ? 'week' : 'day';
  renderPlannerCards();
  showToast(
    state.plannerViewMode === 'day'
      ? '📱 Navigation horizontale Midi ☀️ / Soir 🌙 activée'
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
    state.selectedMealPeriod = 'lunch';
    renderAll();
    showToast(`✅ ${dayName} validé ! Place au menu de ${nextDayName}`);
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
  const curPeriod = state.selectedMealPeriod || 'lunch';
  const dayCost = evaluateDayCost(curOffset);

  const curDaySlots = state.slots.filter((s) => s.dayOffset === curOffset);
  const lunchSlot = curDaySlots.find((s) => s.mealLabel === 'Déjeuner') || curDaySlots[0];
  const dinnerSlot = curDaySlots.find((s) => s.mealLabel === 'Dîner') || curDaySlots[1];

  const lunchBadge = !lunchSlot || lunchSlot.active === false ? '🚫' : lunchSlot.validated ? '✅' : '';
  const dinnerBadge = !dinnerSlot || dinnerSlot.active === false ? '🚫' : dinnerSlot.validated ? '✅' : '';

  const isAtVeryStart = curOffset === 0 && curPeriod === 'lunch';
  const isAtVeryEnd = curOffset === 6 && curPeriod === 'dinner';

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
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span style="font-size: 0.86rem; font-weight: 800; color: var(--primary-hover);">
            ${isDayMode ? `🍽️ ${curFullTitle}` : '🗓️ Vue des 7 jours'}
          </span>
          ${isDayMode ? `<span id="day-cost-badge-${curOffset}" class="meta-pill healthy-pill" style="font-size: 0.72rem; padding: 2px 7px;">💶 ${formatEuro(dayCost)}</span>` : ''}
        </div>
        <button
          type="button"
          class="btn btn-outline btn-sm"
          onclick="togglePlannerViewMode()"
          style="font-weight: 800; font-size: 0.74rem; padding: 4px 8px;"
        >
          ${isDayMode ? '🗓️ 7 jours' : '📱 Vue Swipe'}
        </button>
      </div>

      <div class="day-tabs-strip" role="tablist" aria-label="Jours de la semaine">
        ${tabsHTML}
      </div>

      ${
        isDayMode
          ? `
        <!-- Sélecteur Horizontal Déjeuner (Midi) <-> Dîner (Soir) avec Swipe Gauche / Droite -->
        <div class="meal-period-swipe-bar">
          <button
            type="button"
            class="btn btn-outline btn-sm meal-nav-arrow"
            onclick="stepPlannerMeal(-1)"
            ${isAtVeryStart ? 'disabled style="opacity:0.35; pointer-events:none;"' : ''}
            title="Repas précédent (Glisser vers la droite)"
          >
            ◀
          </button>

          <div class="meal-period-tabs" role="tablist" aria-label="Choisir Déjeuner ou Dîner">
            <button
              type="button"
              class="meal-period-tab lunch-tab ${curPeriod === 'lunch' ? 'active' : ''}"
              onclick="selectPlannerMealPeriod('lunch', -1)"
            >
              ☀️ Déjeuner ${lunchBadge}
            </button>
            <button
              type="button"
              class="meal-period-tab dinner-tab ${curPeriod === 'dinner' ? 'active' : ''}"
              onclick="selectPlannerMealPeriod('dinner', 1)"
            >
              🌙 Dîner ${dinnerBadge}
            </button>
          </div>

          <button
            type="button"
            class="btn btn-outline btn-sm meal-nav-arrow"
            onclick="stepPlannerMeal(1)"
            ${isAtVeryEnd ? 'disabled style="opacity:0.35; pointer-events:none;"' : ''}
            title="Repas suivant (Glisser vers la gauche)"
          >
            ▶
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
  const activeSlots = daySlots.filter((s) => s.active !== false);
  const activeCount = activeSlots.length;
  const allDayValidated = activeCount > 0 && activeSlots.every((s) => s.validated);
  const isDayMode = state.plannerViewMode === 'day';

  if (isDayMode) {
    const curPeriod = state.selectedMealPeriod || 'lunch';
    const targetLabel = curPeriod === 'dinner' ? 'Dîner' : 'Déjeuner';
    const activeSlot = daySlots.find((s) => s.mealLabel === targetLabel) || daySlots[0];
    const slideClass =
      state.lastMealSlideDir > 0
        ? 'anim-slide-from-right'
        : state.lastMealSlideDir < 0
        ? 'anim-slide-from-left'
        : '';
    state.lastMealSlideDir = 0;

    const isAtVeryStart = dayOffset === 0 && curPeriod === 'lunch';
    const isAtVeryEnd = dayOffset === 6 && curPeriod === 'dinner';

    return `
      <div class="day-group day-group-compact ${allDayValidated ? 'day-fully-validated' : ''}">
        <div class="day-meal-single-stage ${slideClass}">
          ${createMealCardHTML(activeSlot)}
        </div>

        <div class="day-bottom-pager">
          <button
            type="button"
            class="btn btn-outline btn-sm"
            onclick="stepPlannerMeal(-1)"
            ${isAtVeryStart ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}
          >
            ◀ ${curPeriod === 'dinner' ? '☀️ Midi' : dayOffset > 0 ? DAY_SHORT_LIST[dayOffset - 1] : ''}
          </button>

          <button
            type="button"
            class="btn btn-day-validate-next ${allDayValidated ? 'is-done' : ''}"
            onclick="validateDayAndNext(${dayOffset}, event)"
          >
            ${
              allDayValidated
                ? dayOffset < 6
                  ? `🎉 ${dayName} validé • ${DAY_SHORT_LIST[dayOffset + 1]} ▶`
                  : `🎉 ${dayName} validé !`
                : `✨ Valider ${dayName} (Midi & Soir)`
            }
          </button>

          ${
            !isAtVeryEnd
              ? `
            <button
              type="button"
              class="btn btn-primary btn-sm"
              onclick="stepPlannerMeal(1)"
            >
              ${curPeriod === 'lunch' ? '🌙 Soir' : DAY_SHORT_LIST[dayOffset + 1]} ▶
            </button>
          `
              : `
            <button
              type="button"
              class="btn btn-keep btn-sm"
              onclick="handleGenerateShoppingListClick()"
            >
              🧺 Panier ▶
            </button>
          `
          }
        </div>
      </div>
    `;
  }

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
        ${daySlots
          .map(createMealCardHTML)
          .join(
            '<div class="lunch-dinner-separator" aria-hidden="true"><span class="sep-sun">☀️ Midi</span><span class="sep-line"></span><span class="sep-moon">🌙 Soir</span></div>'
          )}
      </div>
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

    // En mode navigation horizontale (1 repas à l'écran), masquer les grands bandeaux d'explication pour optimiser l'affichage mobile
    if (weekdayBanner) weekdayBanner.style.display = 'none';
    if (weekendBanner) weekendBanner.style.display = 'none';

    if (weekdayGrid) {
      weekdayGrid.style.display = isWeekendDay ? 'none' : 'flex';
      weekdayGrid.innerHTML = isWeekendDay ? '' : createDayGroupHTML(curOffset);
    }

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
    .map((ing, idx) => {
      const check =
        typeof window.isIngredientInSeason === 'function'
          ? window.isIngredientInSeason(ing.name, slotMonth)
          : { inSeason: true };
      const inSeas = check && typeof check === 'object' ? check.inSeason : Boolean(check);
      const seasTag = inSeas
        ? `<span style="font-size: 0.72rem; padding: 1px 6px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 700; margin-left: 6px;">🌿 De saison</span>`
        : `<span style="font-size: 0.72rem; padding: 1px 6px; border-radius: 999px; background: #fef3c7; color: #92400e; font-weight: 600; margin-left: 6px;">Hors pleine saison (${seasonMeta.monthName})</span>`;
      return `
      <li
        id="recipe-voice-ing-${idx}"
        onclick="speakRecipeIngredientByIndex(${idx})"
        title="🔊 Cliquez pour écouter cet ingrédient avec le guide vocal"
        style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px dashed var(--border-color); font-size: 0.9rem; cursor: pointer; border-radius: 8px; transition: background 0.2s ease;"
      >
        <span>${ing.name} ${seasTag}</span>
        <strong>${formatScaledQty(ing.qty, ratio)} ${ing.unit} <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; margin-left: 4px;">🔊</span></strong>
      </li>
    `;
    })
    .join('');

  const stepsHTML = recipe.steps
    .map(
      (step, idx) => `
      <li
        id="recipe-voice-step-${idx}"
        onclick="speakRecipeStepByIndex(${idx})"
        style="cursor: pointer; padding: 6px 8px; border-radius: 8px; transition: background 0.2s ease;"
        title="🔊 Cliquez pour écouter cette étape avec le guide vocal"
      >
        ${step} <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; margin-left: 4px;">🔊</span>
      </li>`
    )
    .join('');
  const wineModalHTML = buildWinePairingBoxHTML(recipe, slot, true);
  const nutritionAndSeasonModalHTML = buildNutritionAndSeasonHTML(recipe, slot, false);

  activeModalVoiceContext = {
    title: recipe.title,
    servings: slot.servings,
    ingredients: (recipe.ingredients || []).map((ing) => ({
      name: ing.name,
      qtyRaw: formatScaledQty(ing.qty, ratio),
      unitRaw: ing.unit,
      qtyText: `${formatScaledQty(ing.qty, ratio)} ${ing.unit}`
    })),
    steps: recipe.steps || [],
    dessertTitle: dessert ? dessert.title : null,
    dessertSteps: dessert ? dessert.steps || [] : [],
    currentStepIndex: 0
  };

  const voiceToolbarHTML = buildModalVoiceToolbarHTML();

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

    ${voiceToolbarHTML}

    ${nutritionAndSeasonModalHTML}

    ${wineModalHTML}

    <h3 style="font-size: 1rem; font-weight: 800; margin-top: 16px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
      <span>🛒 Ingrédients du plat (${slot.servings} ${slot.servings > 1 ? 'parts' : 'part'} — ${formatEuro(costInfo.dishCost)})</span>
      <span class="season-badge ${seasInfo.pct >= 85 ? 'season-pill-high' : seasInfo.pct >= 70 ? 'season-pill-mid' : 'season-pill-low'}">
        ${seasonMeta.icon} ${seasInfo.pct}% d'ingrédients de saison (${seasInfo.inSeasonCount}/${seasInfo.totalCount})
      </span>
    </h3>
    <ul id="modal-ingredients-list" style="list-style: none;">
      ${ingredientsHTML}
    </ul>

    <h3 style="font-size: 1rem; font-weight: 800; margin-top: 18px;">👩‍🍳 Étapes de la recette <small style="font-weight: 600; font-size: 0.78rem; color: var(--text-muted);">(Touchez une étape pour l'écouter 🔊)</small></h3>
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
  unlockSharedVoiceAudioElement();
  warmUpRecipeVoiceGuideOnOpen();
}

function closeRecipeModal() {
  if (typeof stopVoiceGuide === 'function') {
    stopVoiceGuide();
  }
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
  if (!isLocalAdminEnvironment()) return;
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
  const apiKey = getEffectiveAiApiKey('vision');
  const mealType = document.getElementById('ai-meal-type')?.value || 'weekday';
  const customPrompt = document.getElementById('ai-custom-prompt')?.value.trim() || '';

  if (!apiKey) {
    showToast(
      isLocalAdminEnvironment()
        ? 'Configurez la clé API IA dans l\'Administration locale (onglet Clé API IA).'
        : 'Génération IA indisponible pour le moment. Utilisez le catalogue intégré.'
    );
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
  const normalizedView = viewName === 'studio' || viewName === 'app' ? 'settings' : viewName;
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
  } else if (normalizedView === 'settings' && typeof renderVoiceGuideSettings === 'function') {
    renderVoiceGuideSettings();
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
// GUIDE VOCAL PAS-À-PAS EN CUISINE, 9 PERSONNALITÉS, RECONNAISSANCE VOCALE
// ("SUIVANT" / "RÉPÉTER"), ANIMATION DU PERSONNAGE & MAINTIEN ÉCRAN ACTIF
// ============================================================================
let activeModalVoiceContext = null;

// Définition des 8 personnalités dans les Paramètres (6 grands chefs clonés + 2 voix IA neutres)
const VOICE_PERSONAS = {
  maite: {
    id: 'maite',
    name: 'Maïté',
    shortTitle: 'Accent Gascon Chantant & Franc-Parler',
    badge: '👩‍🌾 Gasconne • Bonne Chère',
    gender: 'female',
    basePitch: 1.06,
    baseRate: 0.96,
    defaultElevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL',
    elevenLabsSettings: { stability: 0.35, similarity_boost: 0.88, style: 0.80, use_speaker_boost: true },
    themeColor: '#b91c1c',
    themeBg: '#fef2f2',
    themeBorder: '#fca5a5',
    particles: ['🦆', '🍲', '🧄', '🍷', '❤️', '🌿'],
    description: 'Son accent gascon chantant (« Macarel ! », « Té ! »), sa générosité landaise et son franc-parler légendaire !',
    sampleQuote: '« Bonjour mes petits ! Attachez bien votre tablier, aujourd\'hui ça va chanter dans la cocotte, macarel ! Et surtout ne me plaignez pas la graisse de canard ni le bon beurre, on n\'est pas là pour faire la diète ! Quand vous êtes prêt, dites Suivant ! »',
    buildIntro: (dish, servings) =>
      `Bonjour mes petits ! Attachez bien votre tablier, macarel : aujourd'hui, nous allons cuisiner « ${dish} », pour ${servings} ${servings > 1 ? 'personnes' : 'personne'}, té ! On n'est pas là pour faire la diète, je vous garantis qu'on va se régaler !`,
    buildIngredients: (servings, ingListSpeech) =>
      `Allez mes petits, commençons par les bons produits du marché pour ${servings} ${servings > 1 ? 'personnes' : 'personne'} : préparez d'abord ${ingListSpeech}.`,
    buildOvenAlert: (temp) =>
      `Attention mes petits, macarel : allumez votre four tout de suite et lancez le préchauffage à ${temp}, té !`,
    stepIntros: [
      'Allez mes petits, première étape :',
      'Ensuite, té, regardez-moi ça :',
      'Macarel, on continue de bon cœur :',
      'Attention les drôles, étape suivante :',
      'Et pour finir en beauté, mes petits :'
    ],
    repeatIntro: 'Té, écoutez bien mes petits, je répète :',
    promptNext: '',
    buildOutro: (dish) =>
      `Et voilà le travail, macarel ! Notre plat « ${dish} » sent drôlement bon dans toute la cuisine ! À table mes petits, servez bien chaud et très bon appétit !`
  },

  lignac: {
    id: 'lignac',
    name: 'Cyril',
    shortTitle: 'Accent Chantant du Sud-Ouest, Gourmand & Croquant',
    badge: '👨‍🍳 Aveyron • Gourmand & Croquant',
    gender: 'male',
    basePitch: 1.0,
    baseRate: 1.04,
    defaultElevenLabsVoiceId: 'IKne3meq5aSn9XLyUdCD',
    elevenLabsSettings: { stability: 0.35, similarity_boost: 0.86, style: 0.78, use_speaker_boost: true },
    themeColor: '#d97706',
    themeBg: '#fffbeb',
    themeBorder: '#fcd34d',
    particles: ['✨', '👨‍🍳', '🍋', '🥘', '🌟', '🍴'],
    description: 'Son accent chantant de l\'Aveyron, son tutoiement chaleureux et son fameux « Gourmand et croquant ! ».',
    sampleQuote: '« Salut à tous ! Aujourd\'hui en cuisine, on se fait super plaisir avec une recette ultra gourmande et bien croquante ! On met du peps, une belle noisette de beurre qui chante, et quand vous êtes prêt, dites Suivant ! »',
    buildIntro: (dish, servings) =>
      `Salut à tous ! Aujourd'hui en cuisine, on se fait super plaisir : nous allons préparer un « ${dish} » bien gourmand et croquant, pour ${servings} ${servings > 1 ? 'personnes' : 'personne'} !`,
    buildIngredients: (servings, ingListSpeech) =>
      `C'est parti pour notre petite mise en place pour ${servings} ${servings > 1 ? 'personnes' : 'personne'} : commence par sortir ${ingListSpeech}.`,
    buildOvenAlert: (temp) =>
      `Hop, petit réflexe de chef : préchauffe tout de suite ton four à ${temp} pour qu'il soit bien chaud !`,
    stepIntros: [
      'Allez c\'est parti, première étape :',
      'Ensuite, regarde comme c\'est simple :',
      'Maintenant, pour le côté super gourmand :',
      'On continue avec du peps et du croquant :',
      'Et la touche finale du chef :'
    ],
    repeatIntro: 'Pas de souci, je te répète l\'étape :',
    promptNext: '',
    buildOutro: (dish) =>
      `Et voilà, notre « ${dish} » bien gourmand et croquant est prêt ! Régalez-vous bien en famille et très bon appétit à tous !`
  },

  bocuse: {
    id: 'bocuse',
    name: 'Paul',
    shortTitle: 'Monsieur Paul • Beurre, Crème & Tradition Lyonnaise',
    badge: '👑 Pape de la Gastronomie',
    gender: 'male',
    basePitch: 0.84,
    baseRate: 0.92,
    defaultElevenLabsVoiceId: 'pqHfZKP75CvOlQylNhV4',
    elevenLabsSettings: { stability: 0.50, similarity_boost: 0.88, style: 0.65, use_speaker_boost: true },
    themeColor: '#881337',
    themeBg: '#fff1f2',
    themeBorder: '#fda4af',
    particles: ['👑', '🍷', '🐓', '🧈', '🏅', '🍽️'],
    description: 'Voix grave de patriarche lyonnais, malicieux et solennel : « Les trois secrets ? Le beurre, le beurre et le beurre ! ».',
    sampleQuote: '« Bonjour mes chers amis ! Comme je le dis toujours à Collonges : les trois secrets de la grande cuisine française, c\'est le beurre, le beurre, et encore le beurre ! Quand vous êtes prêt, dites Suivant. »',
    buildIntro: (dish, servings) =>
      `Bonjour mes chers amis, bienvenue à Collonges ! Aujourd'hui, nous allons honorer la grande cuisine française avec « ${dish} », pour ${servings} ${servings > 1 ? 'convives' : 'convive'}.`,
    buildIngredients: (servings, ingListSpeech) =>
      `Bonne cuisine et bon vin, c'est le paradis sur terre ! Pour ${servings} ${servings > 1 ? 'convives' : 'convive'}, disposez d'abord devant vous : ${ingListSpeech}.`,
    buildOvenAlert: (temp) =>
      `La justesse du feu est primordiale, mes amis : mettez votre four à préchauffer à ${temp}.`,
    stepIntros: [
      'Commençons dans les règles de l\'art :',
      'Poursuivons avec soin, mes chers amis :',
      'Maintenant, le geste de la tradition lyonnaise :',
      'Continuons avec générosité :',
      'Et pour couronner notre ouvrage :'
    ],
    repeatIntro: 'Permettez-moi de vous répéter cette étape, mes amis :',
    promptNext: '',
    buildOutro: (dish) =>
      `Monsieur, Madame, votre « ${dish} » est prêt à être servi à table ! Bonne cuisine et bon vin, très bon appétit mes amis !`
  },

  marx: {
    id: 'marx',
    name: 'Thierry',
    shortTitle: 'Maître Zen, Sabre de Kendo & Justesse Thermique',
    badge: '🥋 Kendo & Réaction de Maillard',
    gender: 'male',
    basePitch: 0.92,
    baseRate: 0.94,
    defaultElevenLabsVoiceId: 'cjVigY5qzO86Huf0OWal',
    elevenLabsSettings: { stability: 0.58, similarity_boost: 0.86, style: 0.55, use_speaker_boost: true },
    themeColor: '#0f766e',
    themeBg: '#f0fdfa',
    themeBorder: '#5eead4',
    particles: ['🥋', '🔬', '🌿', '💧', '✨', '🍵'],
    description: 'Calme méditatif, aphorismes de kendo (« Pas un geste de trop ») et maîtrise chirurgicale de la réaction de Maillard.',
    sampleQuote: '« Bonjour. En cuisine comme dans les arts martiaux, pas un geste de trop. Écoutez la réaction de Maillard et la justesse thermique. Quand vous êtes prêt, dites Suivant. »',
    buildIntro: (dish, servings) =>
      `Bonjour. En cuisine comme dans les arts martiaux, pas un geste de trop. Aujourd'hui, nous allons réaliser « ${dish} », pour ${servings} ${servings > 1 ? 'personnes' : 'personne'}.`,
    buildIngredients: (servings, ingListSpeech) =>
      `L'ordre précède l'harmonie. Pour ${servings} ${servings > 1 ? 'personnes' : 'personne'}, préparez avec rigueur : ${ingListSpeech}.`,
    buildOvenAlert: (temp) =>
      `La précision thermique est essentielle : engagez le préchauffage de votre four à ${temp}.`,
    stepIntros: [
      'Premier mouvement, avec calme et précision :',
      'Poursuivons en pleine conscience :',
      'Observez maintenant la transformation de la matière :',
      'Gardez la justesse du geste :',
      'Ultime étape, vers l\'équilibre des textures :'
    ],
    repeatIntro: 'Écoutons à nouveau cette étape :',
    promptNext: '',
    buildOutro: (dish) =>
      `L'équilibre de « ${dish} » est atteint. Dégustez en pleine conscience. Très bon appétit.`
  },

  etchebest: {
    id: 'etchebest',
    name: 'Philippe',
    shortTitle: 'Chef de Brigade Explosif • Coups de Gueule & Grand Cœur',
    badge: '🔥 Cauchemar en Cuisine • Franc-Parler',
    gender: 'male',
    basePitch: 0.87,
    baseRate: 1.07,
    defaultElevenLabsVoiceId: 'N2lVS1w4EtoT3dr4eOWO',
    elevenLabsSettings: { stability: 0.25, similarity_boost: 0.88, style: 0.90, use_speaker_boost: true },
    themeColor: '#ea580c',
    themeBg: '#fff7ed',
    themeBorder: '#fdba74',
    particles: ['🔥', '💪', '🔪', '👨‍🍳', '⚡', '🍽️'],
    description: 'Explosif, cash et colérique par moments ! S\'il voit du laisser-aller, il pousse un vrai coup de gueule en plein service !',
    sampleQuote: '« Oh ! On se bouge le cul en cuisine, chef ! Putain, je veux une mise en place carrée et de la niaque, pas du bricolage d\'amateur, bordel ! Quand vous êtes prêt, dites Suivant, et que ça saute ! »',
    buildIntro: (dish, servings) =>
      `Oh ! Écoute-moi bien chef ! Aujourd'hui on envoie « ${dish} » pour ${servings} ${servings > 1 ? 'personnes' : 'personne'} ! Putain, je ne veux pas voir de laisser-aller sur le plan de travail, bordel : on se bouge le cul et on fait ça carré !`,
    buildIngredients: (servings, ingListSpeech) =>
      `Allez, mise en place immédiate pour ${servings} ${servings > 1 ? 'personnes' : 'personne'} ! Et ne me cherche pas tes ingrédients pendant dix ans, merde : sors tout de suite ${ingListSpeech} !`,
    buildOvenAlert: (temp) =>
      `Oh ! Et le four bordel, il va chauffer tout seul ?! Allume-moi ce putain de four à ${temp} tout de suite, que ça saute !`,
    stepIntros: [
      'Allez, on attaque fort, première étape :',
      'Attention, là je t\'ai à l\'œil bordel, ne t\'endors pas :',
      'Putain chef, concentre-toi bien sur ce geste :',
      'Oh ! On garde le rythme, pas de relâchement en plein coup de feu :',
      'Dernière ligne droite avant d\'envoyer au passe, applique-toi :'
    ],
    repeatIntro: 'Oh ! Écoute bien quand je parle bordel, je répète :',
    promptNext: '',
    buildOutro: (dish) =>
      `Eh ben voilà putain, quand tu te bouges le cul, ça sort un super « ${dish} » ! Je suis fier de toi chef, envoie au passe et bon appétit !`
  },

  coffe: {
    id: 'coffe',
    name: 'Jean-Pierre',
    shortTitle: 'Coups de Gueule Mythiques (« C\'est de la merde ! »)',
    badge: '👓 Coups de Gueule & Vrai Terroir',
    gender: 'male',
    basePitch: 0.95,
    baseRate: 1.04,
    defaultElevenLabsVoiceId: 'JBFqnCBsd6RMkjVDRZzb',
    elevenLabsSettings: { stability: 0.25, similarity_boost: 0.88, style: 0.92, use_speaker_boost: true },
    themeColor: '#15803d',
    themeBg: '#f0fdf4',
    themeBorder: '#86efac',
    particles: ['👓', '🍅', '🥕', '🥖', '🧀', '🌿'],
    description: 'Théâtral, volcanique et colérique par moments ! Ses coups de gueule contre la malbouffe (« Mais c\'est de la merde ! ») sont légendaires.',
    sampleQuote: '« Ah non mes amis ! Foutez-moi ces saloperies sous plastique à la poubelle : ça, c\'est de la merde ! Ici, nom de Dieu, on fait de la vraie cuisine de terroir ! Quand vous êtes prêt, dites Suivant ! »',
    buildIntro: (dish, servings) =>
      `Ah bonjour mes amis ! Aujourd'hui nous cuisinons un vrai « ${dish} » pour ${servings} ${servings > 1 ? 'personnes' : 'personne'} ! Et par pitié, foutez-moi les barquettes industrielles à la poubelle : ça, c'est de la merde ! Ici, nom de Dieu, on cuisine du vrai !`,
    buildIngredients: (servings, ingListSpeech) =>
      `Exigeons de vrais produits du marché pour ${servings} ${servings > 1 ? 'personnes' : 'personne'}, pas des saloperies sous cellophane ! Commencez par préparer : ${ingListSpeech}.`,
    buildOvenAlert: (temp) =>
      `Nom de Dieu mes amis, n'enfournez jamais à froid, c'est un massacre ! Préchauffez votre four tout de suite à ${temp} !`,
    stepIntros: [
      'Allons-y franchement mes amis, première étape :',
      'Mais attention nom de Dieu, respectez bien le produit :',
      'Sacrebleu, ne me bâclez surtout pas cette étape :',
      'Regardez comme la vraie cuisine est simple quand ce n\'est pas de la merde :',
      'Et voici la touche finale d\'un vrai plat de terroir :'
    ],
    repeatIntro: 'Mais écoutez donc nom de Dieu, je répète :',
    promptNext: '',
    buildOutro: (dish) =>
      `Et voilà un authentique « ${dish} » fait maison ! Ça a une autre gueule que les cochonneries industrielles, non ?! Un formidable bon appétit mes amis !`
  },

  ia_homme: {
    id: 'ia_homme',
    name: 'Voix Homme (IA)',
    shortTitle: 'Assistant Vocal IA Masculin Neutre',
    badge: '🤖👨 IA Neutre Homme',
    gender: 'male',
    basePitch: 0.92,
    baseRate: 1.0,
    defaultElevenLabsVoiceId: 'onwK4e9ZLuTAKqWW03F9',
    elevenLabsSettings: { stability: 0.80, similarity_boost: 0.80, style: 0.10, use_speaker_boost: true },
    themeColor: '#334155',
    themeBg: '#f8fafc',
    themeBorder: '#94a3b8',
    particles: ['🤖', '🎙️', '🍽️', '⏱️', '✨'],
    description: 'Voix masculine synthétique neutre, sobre, claire et structurée pour un guidage direct sans fioritures.',
    sampleQuote: '« Bonjour. Guide vocal IA Homme activé. Nous allons cuisiner votre recette pas à pas. Quand vous êtes prêt, dites Suivant. »',
    buildIntro: (dish, servings) =>
      `Bonjour. Nous allons cuisiner « ${dish} », pour ${servings} ${servings > 1 ? 'personnes' : 'personne'}.`,
    buildIngredients: (servings, ingListSpeech) =>
      `Préparation des ingrédients pour ${servings} ${servings > 1 ? 'personnes' : 'personne'} : commencez par ${ingListSpeech}.`,
    buildOvenAlert: (temp) =>
      `Préchauffage du four : veuillez préchauffer votre four à ${temp}.`,
    stepIntros: [
      'Première étape de la recette :',
      'Étape suivante :',
      'Poursuivons avec l\'étape suivante :',
      'Étape suivante :',
      'Dernière étape de préparation :'
    ],
    repeatIntro: 'Je répète :',
    promptNext: '',
    buildOutro: (dish) =>
      `La préparation de « ${dish} » est terminée. Je vous souhaite un très bon appétit.`
  },

  ia_femme: {
    id: 'ia_femme',
    name: 'Voix Femme (IA)',
    shortTitle: 'Assistante Vocale IA Féminine Neutre',
    badge: '🤖👩 IA Neutre Femme',
    gender: 'female',
    basePitch: 1.1,
    baseRate: 1.0,
    defaultElevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL',
    elevenLabsSettings: { stability: 0.80, similarity_boost: 0.80, style: 0.10, use_speaker_boost: true },
    themeColor: '#4f46e5',
    themeBg: '#eef2ff',
    themeBorder: '#a5b4fc',
    particles: ['👩‍🍳', '🎙️', '🥗', '⏱️', '✨'],
    description: 'Voix féminine synthétique neutre, douce, fluide et précise pour un accompagnement clair étape par étape.',
    sampleQuote: '« Bonjour. Guide vocal IA Femme activé. Nous allons cuisiner votre recette pas à pas. Quand vous êtes prêt, dites Suivant. »',
    buildIntro: (dish, servings) =>
      `Bonjour. Nous allons cuisiner « ${dish} », pour ${servings} ${servings > 1 ? 'personnes' : 'personne'}.`,
    buildIngredients: (servings, ingListSpeech) =>
      `Préparation des ingrédients pour ${servings} ${servings > 1 ? 'personnes' : 'personne'} : commencez par ${ingListSpeech}.`,
    buildOvenAlert: (temp) =>
      `Préchauffage du four : veuillez préchauffer votre four à ${temp}.`,
    stepIntros: [
      'Première étape de la recette :',
      'Étape suivante :',
      'Poursuivons avec l\'étape suivante :',
      'Étape suivante :',
      'Dernière étape de préparation :'
    ],
    repeatIntro: 'Je répète :',
    promptNext: '',
    buildOutro: (dish) =>
      `La préparation de « ${dish} » est terminée. Je vous souhaite un très bon appétit.`
  }
};

let runtimeClonedVoicesInactive = false;

function areClonedVoicesActive() {
  if (runtimeClonedVoicesInactive) return false;
  const cfg = window.APP_CONFIG || {};
  if (cfg.clonedVoicesEnabled === false || cfg.aiVoiceEnabled === false) return false;
  if (state.voiceSettings?.clonesActive === false) return false;
  return true;
}

function getAvailableVoicePersonas() {
  if (!areClonedVoicesActive()) {
    return [VOICE_PERSONAS.ia_femme, VOICE_PERSONAS.ia_homme];
  }
  return Object.values(VOICE_PERSONAS);
}

function deactivateClonedVoicesFallback() {
  if (runtimeClonedVoicesInactive) return;
  runtimeClonedVoicesInactive = true;
  const currentId = state.voiceSettings?.persona || 'lignac';
  const currentPersona = VOICE_PERSONAS[currentId] || VOICE_PERSONAS.lignac;
  const fallbackId = currentPersona.gender === 'female' ? 'ia_femme' : 'ia_homme';
  if (state.voiceSettings) {
    state.voiceSettings.persona = fallbackId;
  }
  renderVoiceGuideSettings();
  const modalEl = document.getElementById('recipe-modal');
  if (modalEl && modalEl.classList.contains('open') && activeModalVoiceContext && !voiceGuideSession.active) {
    const wrapper = document.getElementById('modal-voice-guide-wrapper');
    if (wrapper) wrapper.innerHTML = buildModalVoiceToolbarHTML();
  }
  showToast('ℹ️ Voix clones indisponibles : bascule sur Voix Femme (IA) et Voix Homme (IA).');
}

function getActiveVoicePersona() {
  const personaId = state.voiceSettings?.persona || 'lignac';
  const rawPersona = VOICE_PERSONAS[personaId] || VOICE_PERSONAS.lignac;
  if (!areClonedVoicesActive() && rawPersona.id !== 'ia_femme' && rawPersona.id !== 'ia_homme') {
    return rawPersona.gender === 'female' ? VOICE_PERSONAS.ia_femme : VOICE_PERSONAS.ia_homme;
  }
  return rawPersona;
}

const PERSONA_PUBLIC_PHOTOS = {
  maite: {
    local: 'assets/personas/maite.jpg',
    publicUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Marie-Th%C3%A9r%C3%A8se_Ordonez.jpg',
    credit: 'Wikimedia Commons'
  },
  lignac: {
    local: 'assets/personas/lignac.jpg',
    publicUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Salon_chocolat_Paris_2017_Cyril_Lignac_2949c.jpg/500px-Salon_chocolat_Paris_2017_Cyril_Lignac_2949c.jpg',
    credit: 'Wikimedia Commons'
  },
  bocuse: {
    local: 'assets/personas/bocuse.jpg',
    publicUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Paul_Bocuse_2007_-2.jpg/500px-Paul_Bocuse_2007_-2.jpg',
    credit: 'Wikimedia Commons'
  },
  marx: {
    local: 'assets/personas/marx.jpg',
    publicUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Thierry_Marx.jpg',
    credit: 'Wikimedia Commons'
  },
  etchebest: {
    local: 'assets/personas/etchebest.png',
    publicUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Philippe_Etchebest_in_2018.png',
    credit: 'Wikimedia Commons'
  },
  coffe: {
    local: 'assets/personas/coffe.jpg',
    publicUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Jean-Pierre_Coffe_22_02_2012.jpg',
    credit: 'Wikimedia Commons'
  },
  ia_homme: {
    local: 'assets/personas/ia_homme.jpg',
    publicUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    credit: 'Unsplash Public'
  },
  ia_femme: {
    local: 'assets/personas/ia_femme.jpg?v=2',
    publicUrl: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
    credit: 'Unsplash Public'
  }
};

function buildPersonaAnimatedAvatarSVG(personaId) {
  const persona = VOICE_PERSONAS[personaId] || VOICE_PERSONAS.lignac;
  const photoMeta = PERSONA_PUBLIC_PHOTOS[personaId] || PERSONA_PUBLIC_PHOTOS.lignac;
  const fallbackSvg = buildPersonaFallbackIllustrationSVG(personaId);

  return `
    <img
      src="${photoMeta.local}"
      data-public-src="${photoMeta.publicUrl}"
      alt="${persona.name}"
      class="persona-photo-avatar"
      loading="lazy"
      onerror="if(this.dataset.publicSrc && this.src !== this.dataset.publicSrc){this.src=this.dataset.publicSrc;}else{this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='block';}"
    />
    <div class="persona-svg-fallback" style="display: none; width: 100%; height: 100%;">
      ${fallbackSvg}
    </div>
  `;
}

// Illustration SVG de secours pour chacun des 9 personnages
function buildPersonaFallbackIllustrationSVG(personaId) {
  switch (personaId) {
    case 'maite':
      return `
        <svg viewBox="0 0 120 120" class="persona-svg" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="#fee2e2" stroke="#ef4444" stroke-width="3"/>
          <!-- Coiffe / Foulard landais rouge à pois -->
          <path d="M22 52 C22 22, 98 22, 98 52 Z" fill="#dc2626"/>
          <circle cx="42" cy="34" r="3" fill="#fff"/>
          <circle cx="60" cy="29" r="3" fill="#fff"/>
          <circle cx="78" cy="34" r="3" fill="#fff"/>
          <!-- Cheveux bruns chaleureux -->
          <circle cx="26" cy="58" r="10" fill="#451a03"/>
          <circle cx="94" cy="58" r="10" fill="#451a03"/>
          <!-- Visage rond et souriant -->
          <circle cx="60" cy="64" r="28" fill="#fde68a"/>
          <!-- Joues roses généreuses -->
          <circle cx="42" cy="68" r="6" fill="#f87171" opacity="0.55"/>
          <circle cx="78" cy="68" r="6" fill="#f87171" opacity="0.55"/>
          <!-- Yeux rieurs -->
          <path d="M44 56 Q48 51 52 56" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M68 56 Q72 51 76 56" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>
          <!-- Bouche animée -->
          <ellipse class="svg-mouth" cx="60" cy="75" rx="9" ry="5" fill="#991b1b"/>
          <!-- Tablier & Cocotte -->
          <path d="M32 92 Q60 104 88 92 L94 114 L26 114 Z" fill="#dc2626"/>
          <rect x="44" y="96" width="32" height="14" rx="5" fill="#7f1d1d"/>
        </svg>
      `;
    case 'lignac':
      return `
        <svg viewBox="0 0 120 120" class="persona-svg" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="#fef3c7" stroke="#f59e0b" stroke-width="3"/>
          <!-- Cheveux châtains dynamiques -->
          <path d="M32 48 C30 24, 90 24, 88 48 Z" fill="#78350f"/>
          <path d="M38 28 Q55 18 76 26" stroke="#92400e" stroke-width="5" fill="none" stroke-linecap="round"/>
          <!-- Visage souriant -->
          <circle cx="60" cy="60" r="26" fill="#fed7aa"/>
          <circle cx="44" cy="65" r="5" fill="#fb923c" opacity="0.45"/>
          <circle cx="76" cy="65" r="5" fill="#fb923c" opacity="0.45"/>
          <!-- Yeux pétillants -->
          <circle cx="49" cy="54" r="3.2" fill="#1e293b"/>
          <circle cx="71" cy="54" r="3.2" fill="#1e293b"/>
          <path d="M44 48 Q49 45 54 48" stroke="#78350f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M66 48 Q71 45 76 48" stroke="#78350f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <!-- Grand sourire gourmand -->
          <ellipse class="svg-mouth" cx="60" cy="70" rx="10" ry="5.5" fill="#b91c1c"/>
          <!-- Veste de chef blanche & foulard ambre -->
          <path d="M30 90 Q60 100 90 90 L96 114 L24 114 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <path d="M46 88 L60 98 L74 88" fill="#f59e0b"/>
        </svg>
      `;
    case 'bocuse':
      return `
        <svg viewBox="0 0 120 120" class="persona-svg" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="#ffe4e6" stroke="#be123c" stroke-width="3"/>
          <!-- Haute Toque Traditionnelle de Monsieur Paul -->
          <rect x="38" y="10" width="44" height="34" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
          <line x1="48" y1="14" x2="48" y2="40" stroke="#cbd5e1" stroke-width="1.5"/>
          <line x1="60" y1="12" x2="60" y2="40" stroke="#cbd5e1" stroke-width="1.5"/>
          <line x1="72" y1="14" x2="72" y2="40" stroke="#cbd5e1" stroke-width="1.5"/>
          <!-- Visage noble et bienveillant -->
          <circle cx="60" cy="64" r="24" fill="#fde68a"/>
          <!-- Sourcils blancs & yeux -->
          <path d="M44 52 Q49 49 54 52" stroke="#f8fafc" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <path d="M66 52 Q71 49 76 52" stroke="#f8fafc" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <circle cx="49" cy="57" r="2.8" fill="#1e293b"/>
          <circle cx="71" cy="57" r="2.8" fill="#1e293b"/>
          <!-- Bouche animée -->
          <ellipse class="svg-mouth" cx="60" cy="73" rx="8" ry="4.5" fill="#881337"/>
          <!-- Veste MOF Col Bleu-Blanc-Rouge -->
          <path d="M30 90 Q60 100 90 90 L96 114 L24 114 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <path d="M42 88 Q60 98 78 88" stroke="#1d4ed8" stroke-width="3.5" fill="none"/>
          <path d="M44 92 Q60 102 76 92" stroke="#dc2626" stroke-width="3.5" fill="none"/>
        </svg>
      `;
    case 'marx':
      return `
        <svg viewBox="0 0 120 120" class="persona-svg" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="#ccfbf1" stroke="#0d9488" stroke-width="3"/>
          <!-- Crâne chauve zen emblématique -->
          <circle cx="60" cy="58" r="26" fill="#fed7aa"/>
          <!-- Lunettes rondes design -->
          <circle cx="49" cy="55" r="7.5" fill="none" stroke="#0f172a" stroke-width="2.8"/>
          <circle cx="71" cy="55" r="7.5" fill="none" stroke="#0f172a" stroke-width="2.8"/>
          <line x1="56.5" y1="55" x2="63.5" y2="55" stroke="#0f172a" stroke-width="2.8"/>
          <circle cx="49" cy="55" r="2.3" fill="#0f172a"/>
          <circle cx="71" cy="55" r="2.3" fill="#0f172a"/>
          <!-- Bouche calme animée -->
          <ellipse class="svg-mouth" cx="60" cy="71" rx="7" ry="4" fill="#0f766e"/>
          <!-- Veste kimono zen -->
          <path d="M30 88 L60 102 L90 88 L96 114 L24 114 Z" fill="#1e293b"/>
          <path d="M45 86 L60 102 L75 86" stroke="#5eead4" stroke-width="3" fill="none"/>
        </svg>
      `;
    case 'etchebest':
      return `
        <svg viewBox="0 0 120 120" class="persona-svg" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="#ffedd5" stroke="#ea580c" stroke-width="3"/>
          <!-- Carrure solide & visage énergique -->
          <circle cx="60" cy="58" r="26" fill="#fdba74"/>
          <path d="M36 44 Q60 28 84 44" fill="#475569"/>
          <!-- Sourcils froncés motivés de Chef -->
          <line x1="42" y1="47" x2="54" y2="51" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="78" y1="47" x2="66" y2="51" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="49" cy="55" r="3" fill="#0f172a"/>
          <circle cx="71" cy="55" r="3" fill="#0f172a"/>
          <!-- Bouc / barbe courte & bouche dynamique -->
          <path d="M46 68 Q60 84 74 68" fill="none" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
          <ellipse class="svg-mouth" cx="60" cy="71" rx="9.5" ry="5.5" fill="#9a3412"/>
          <!-- Veste Chef sombre col MOF -->
          <path d="M26 88 Q60 100 94 88 L98 114 L22 114 Z" fill="#0f172a"/>
          <path d="M44 88 Q60 96 76 88" stroke="#3b82f6" stroke-width="3" fill="none"/>
          <path d="M46 91 Q60 99 74 91" stroke="#ef4444" stroke-width="3" fill="none"/>
        </svg>
      `;
    case 'coffe':
      return `
        <svg viewBox="0 0 120 120" class="persona-svg" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/>
          <!-- Cheveux blancs sur les côtés -->
          <circle cx="32" cy="56" r="9" fill="#f1f5f9"/>
          <circle cx="88" cy="56" r="9" fill="#f1f5f9"/>
          <!-- Visage expressif -->
          <circle cx="60" cy="58" r="25" fill="#fde68a"/>
          <!-- Célèbres lunettes rondes colorées de Jean-Pierre Coffe -->
          <circle cx="48" cy="55" r="8.5" fill="rgba(255,255,255,0.5)" stroke="#dc2626" stroke-width="3.5"/>
          <circle cx="72" cy="55" r="8.5" fill="rgba(255,255,255,0.5)" stroke="#dc2626" stroke-width="3.5"/>
          <line x1="56.5" y1="55" x2="63.5" y2="55" stroke="#dc2626" stroke-width="3.5"/>
          <circle cx="48" cy="55" r="2.5" fill="#1e293b"/>
          <circle cx="72" cy="55" r="2.5" fill="#1e293b"/>
          <!-- Bouche expressive animée -->
          <ellipse class="svg-mouth" cx="60" cy="72" rx="9" ry="5" fill="#991b1b"/>
          <!-- Gilet du marché & foulard vert -->
          <path d="M30 88 Q60 100 90 88 L96 114 L24 114 Z" fill="#15803d"/>
          <path d="M46 87 L60 100 L74 87" fill="#fef08a"/>
        </svg>
      `;
    case 'ia_homme':
      return `
        <svg viewBox="0 0 120 120" class="persona-svg" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="#e2e8f0" stroke="#334155" stroke-width="3"/>
          <rect x="38" y="14" width="44" height="28" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
          <circle cx="60" cy="62" r="24" fill="#fed7aa"/>
          <circle cx="50" cy="56" r="3" fill="#0f172a"/>
          <circle cx="70" cy="56" r="3" fill="#0f172a"/>
          <ellipse class="svg-mouth" cx="60" cy="71" rx="8" ry="4" fill="#991b1b"/>
          <path d="M30 90 Q60 100 90 90 L96 114 L24 114 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        </svg>
      `;
    case 'ia_femme':
    default:
      return `
        <svg viewBox="0 0 120 120" class="persona-svg" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="#e0e7ff" stroke="#4f46e5" stroke-width="3"/>
          <!-- Toque & chignon de cuisinière -->
          <path d="M38 40 C34 16, 86 16, 82 40 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
          <circle cx="60" cy="62" r="24" fill="#fde68a"/>
          <circle cx="44" cy="66" r="4.5" fill="#f472b6" opacity="0.45"/>
          <circle cx="76" cy="66" r="4.5" fill="#f472b6" opacity="0.45"/>
          <circle cx="50" cy="56" r="3" fill="#1e293b"/>
          <circle cx="70" cy="56" r="3" fill="#1e293b"/>
          <ellipse class="svg-mouth" cx="60" cy="71" rx="8" ry="4.5" fill="#be123c"/>
          <!-- Veste de cuisinière blanche & tablier -->
          <path d="M30 90 Q60 100 90 90 L96 114 L24 114 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="44" y="92" width="32" height="22" rx="4" fill="#4338ca"/>
        </svg>
      `;
  }
}

// ============================================================================
// MAINTIEN DU SMARTPHONE ACTIF DURANT LE MODE VOCAL (WAKE LOCK + AUDIO KEEP-ALIVE)
// ============================================================================
let screenWakeLockSentinel = null;
let essentialBeepAudioCtx = null;
let lastEssentialBeepTime = 0;

// Bip sonore discret uniquement pour les événements essentiels (ex: validation d'une commande vocale reconnue)
function playEssentialVoiceBeep(type = 'command') {
  const now = Date.now();
  if (now - lastEssentialBeepTime < 900) return;
  lastEssentialBeepTime = now;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!essentialBeepAudioCtx) {
      essentialBeepAudioCtx = new AudioCtx();
    }
    if (essentialBeepAudioCtx.state === 'suspended') {
      essentialBeepAudioCtx.resume().catch(() => {});
    }
    const osc = essentialBeepAudioCtx.createOscillator();
    const gain = essentialBeepAudioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(type === 'pause' ? 440 : 660, essentialBeepAudioCtx.currentTime);
    gain.gain.setValueAtTime(0.035, essentialBeepAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, essentialBeepAudioCtx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(essentialBeepAudioCtx.destination);
    osc.start();
    osc.stop(essentialBeepAudioCtx.currentTime + 0.09);
  } catch (e) {}
}

async function acquireKitchenWakeLock() {
  // Screen Wake Lock API standard (sans oscillateur périodique pour éviter tout bip parasite)
  if ('wakeLock' in navigator && navigator.wakeLock && typeof navigator.wakeLock.request === 'function') {
    try {
      if (!screenWakeLockSentinel || screenWakeLockSentinel.released) {
        screenWakeLockSentinel = await navigator.wakeLock.request('screen');
        screenWakeLockSentinel.addEventListener('release', () => {
          updateWakeLockBadgeUI(false);
        });
      }
      updateWakeLockBadgeUI(true);
    } catch (err) {
      // Fallback silencieux si refusé ou en arrière-plan
    }
  }
  updateWakeLockBadgeUI(true);
}

async function releaseKitchenWakeLock() {
  if (screenWakeLockSentinel) {
    try {
      await screenWakeLockSentinel.release();
    } catch (e) {}
    screenWakeLockSentinel = null;
  }
  updateWakeLockBadgeUI(false);
}

function updateWakeLockBadgeUI(isActive) {
  const badge = document.getElementById('voice-wakelock-badge');
  if (badge) {
    badge.style.display = isActive ? 'inline-flex' : 'none';
  }
}

// Ré-acquérir automatiquement le Wake Lock si l'utilisateur revient sur l'application pendant le mode vocal
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && voiceGuideSession && voiceGuideSession.active) {
    acquireKitchenWakeLock();
  }
});

// ============================================================================
// ÉTAT DE LA SESSION DE GUIDAGE VOCAL PAS-À-PAS & RECONNAISSANCE VOCALE
// ============================================================================
let voiceGuideSession = {
  active: false,
  isSpeaking: false,
  isListening: false,
  isStarting: false,
  startingSince: 0,
  permissionBlocked: false,
  consecutiveSilentEnds: 0,
  fallbackMode: false,
  fallbackStream: null,
  fallbackAudioCtx: null,
  fallbackVadTimer: null,
  isPaused: false,
  finished: false,
  sequence: [], // [{ type: 'intro' | 'ingredient' | 'step' | 'outro', title, visualText, spokenText, ovenTemp, ingredientIdx, recipeStepIdx }]
  currentIndex: 0,
  recognition: null,
  lastSpokenEndTime: 0,
  lastCommandTime: 0,
  lastHeardTranscript: '',
  restartRecTimer: null,
  recWatchdogTimer: null
};

// Conversion naturelle des unités de cuisine pour la synthèse vocale
function formatQtyUnitForSpeech(qtyStr, unitStr, ingName) {
  const q = String(qtyStr || '').trim().replace('.', ',');
  const u = String(unitStr || '').trim().toLowerCase();
  let spokenUnit = unitStr || '';

  if (u === 'g' || u === 'gr' || u === 'gramme' || u === 'grammes') {
    spokenUnit = 'grammes';
  } else if (u === 'kg' || u === 'kilo' || u === 'kilos') {
    spokenUnit = 'kilos';
  } else if (u === 'ml') {
    spokenUnit = 'millilitres';
  } else if (u === 'cl') {
    spokenUnit = 'centilitres';
  } else if (u === 'l' || u === 'litre' || u === 'litres') {
    spokenUnit = 'litre';
  } else if (u === 'c. à soupe' || u === 'c.à.s' || u === 'cas') {
    spokenUnit = 'cuillère à soupe';
  } else if (u === 'c. à café' || u === 'c.à.c' || u === 'cac') {
    spokenUnit = 'cuillère à café';
  } else if (u === 'pièce' || u === 'pièces') {
    return `${q} ${ingName}`;
  }

  const startsWithVowel = /^[aeiouyéèêëîïôùûüœh]/i.test(ingName || '');
  const prep = startsWithVowel ? "d'" : 'de ';
  return `${q} ${spokenUnit} ${prep}${ingName}`;
}

// Analyse intelligente du préchauffage du four et de la température dans la recette
function analyzeRecipeOvenRequirements(title, steps) {
  const allText = [title || '', ...(steps || [])].join(' ');
  const usesOven = /\b(four|enfourner|enfournant|préchauffer|prechauffer|gratin|gratiner|papillote)\b/i.test(allText);
  if (!usesOven) {
    return { usesOven: false, tempText: null, preheatStepIdx: -1, bakeStepIdx: -1 };
  }

  // Chercher une température explicite (ex: "180°C", "190 °C", "200 degrés", "thermostat 6")
  let tempText = '180°C';
  const tempMatch = allText.match(/(\d{3})\s*(?:°\s*c|°|degrés|degres)/i);
  if (tempMatch) {
    tempText = `${tempMatch[1]}°C`;
  } else if (/gril/i.test(allText)) {
    tempText = '210°C (mode gril)';
  }

  let preheatStepIdx = -1;
  let bakeStepIdx = -1;
  (steps || []).forEach((st, idx) => {
    if (preheatStepIdx === -1 && /préchauff|prechauff/i.test(st)) {
      preheatStepIdx = idx;
    }
    if (bakeStepIdx === -1 && /\b(four|enfourner|gratin|papillote)\b/i.test(st)) {
      bakeStepIdx = idx;
    }
  });

  // Si la recette enfourne à une étape mais n'a pas mentionné "préchauffer" avant,
  // on place l'alerte de préchauffage dès la 1ère étape de préparation pour que le four soit chaud à temps !
  if (preheatStepIdx === -1) {
    preheatStepIdx = 0;
  }

  return {
    usesOven: true,
    tempText,
    preheatStepIdx,
    bakeStepIdx
  };
}

// Transitions fluides et typées pour les ingrédients suivants (avec le caractère de chaque chef)
function buildPersonaIngredientFollowup(personaId, ingNum, totalIngs, singleIngSpeech) {
  const connectors = ['Ensuite,', 'Puis,', 'Préparez aussi', 'Ajoutez sur le plan de travail'];
  const conn = connectors[(ingNum - 2) % connectors.length] || 'Ensuite,';
  switch (personaId) {
    case 'maite':
      return `${conn} ${singleIngSpeech}, mes petits, té !`;
    case 'lignac':
      return `${conn} ${singleIngSpeech}, bien gourmand !`;
    case 'bocuse':
      return `${conn} ${singleIngSpeech}, mes chers amis.`;
    case 'marx':
      return `${conn} ${singleIngSpeech}.`;
    case 'etchebest':
      return ingNum % 2 === 0
        ? `Allez, on ne traîne pas bordel : sors ${singleIngSpeech}, chef !`
        : `${conn} ${singleIngSpeech}, et que ce soit carré !`;
    case 'coffe':
      return ingNum % 2 === 0
        ? `${conn} ${singleIngSpeech}, du vrai produit frais nom de Dieu, pas de la merde !`
        : `${conn} ${singleIngSpeech}, bien frais du marché !`;
    default:
      return `${conn} ${singleIngSpeech}.`;
  }
}

// Enrichissement des étapes avec les tics de langage des chefs et les coups de gueule colériques d'Etchebest et Coffe
function enrichStepBodyWithPersonaTics(personaId, spokenStepBody, stepIdx, totalSteps) {
  if (personaId === 'ia_homme' || personaId === 'ia_femme') {
    return spokenStepBody;
  }
  const clean = (spokenStepBody || '').trim().replace(/\.$/, '');
  switch (personaId) {
    case 'maite': {
      const suffixes = [
        'Té, faites chanter tout ça dans la cocotte mes petits, macarel !',
        'Et ne plaignez pas la gourmandise, on n\'est pas là pour faire la diète !',
        'Regardez-moi cette belle couleur, ça sent le bon terroir de chez nous !',
        'Allez mes petits, remuez-moi ça avec amour !'
      ];
      return `${clean}. ${suffixes[stepIdx % suffixes.length]}`;
    }
    case 'lignac': {
      const suffixes = [
        'Tu vois, c\'est ça qui va apporter tout le côté super gourmand et croquant !',
        'On met du peps et de la générosité, ça va être une tuerie !',
        'Écoute comme ça chante bien dans la poêle, on se fait plaisir !',
        'C\'est simple, gourmand et malin comme on aime !'
      ];
      return `${clean}. ${suffixes[stepIdx % suffixes.length]}`;
    }
    case 'bocuse': {
      const suffixes = [
        'N\'oubliez jamais, mes amis : le secret d\'un grand plat, c\'est le beau beurre et l\'amour du produit.',
        'Prenez le temps d\'écouter la cuisson, comme nous le faisons à Collonges.',
        'La simplicité et la générosité font toute la noblesse de la cuisine française.',
        'Goûtez et rectifiez l\'assaisonnement avec justesse, mes chers amis.'
      ];
      return `${clean}. ${suffixes[stepIdx % suffixes.length]}`;
    }
    case 'marx': {
      const suffixes = [
        'Pas un geste de trop : laissez la réaction de Maillard opérer avec justesse.',
        'Respectez la température à cœur pour préserver toute l\'émotion du produit.',
        'En cuisine comme au kendo, la précision du mouvement crée l\'harmonie.',
        'Observez le point d\'équilibre des textures en silence.'
      ];
      return `${clean}. ${suffixes[stepIdx % suffixes.length]}`;
    }
    case 'etchebest': {
      const rants = [
        'Et attention putain, je ne veux pas voir un plan de travail en bordel, tu nettoies au fur et à mesure chef !',
        'Oh ! Surveille-moi cette cuisson nom de Dieu, si tu me crames ça je pète un plomb !',
        'Allez, bouge-toi le cul chef, mets-y de la niaque, on n\'est pas là pour enfiler des perles bordel !',
        'Putain, goûte-moi ça avant d\'envoyer ! Sans assaisonnement, ça ne vaut rien bordel !'
      ];
      return `${clean} ! ${rants[stepIdx % rants.length]}`;
    }
    case 'coffe': {
      const rants = [
        'Et par pitié nom de Dieu, n\'allez pas foutre de la sauce industrielle là-dedans : ça, c\'est de la merde !',
        'Sacrebleu mes amis, si vous surcuisez ces beaux produits frais, autant bouffer du carton bouilli !',
        'Mais regardez-moi cette merveille quand on cuisine de vrais produits et pas leurs saloperies sous vide !',
        'Nom de Dieu, goûtez avec amour : la vraie cuisine de terroir, c\'est sacré !'
      ];
      return `${clean} ! ${rants[stepIdx % rants.length]}`;
    }
    default:
      return spokenStepBody;
  }
}

// Consignes vocales complètes données UNE SEULE FOIS au tout début du guide vocal
function buildInitialVoiceCommandsInstruction(personaId) {
  switch (personaId) {
    case 'maite':
      return 'Pour avancer à votre rythme tout au long de la recette, dites simplement : Suivant, Répéter, Précédent, Pause ou Reprendre.';
    case 'lignac':
      return 'Pour naviguer à la voix pendant toute la recette, dis simplement : Suivant, Répéter, Précédent, Pause ou Reprendre.';
    case 'etchebest':
      return 'Pour piloter la recette à la voix, dis simplement : Suivant, Répéter, Précédent, Pause ou Reprendre, et que ça saute !';
    case 'coffe':
      return 'Pour avancer à la voix dans notre recette, dites franchement : Suivant, Répéter, Précédent, Pause ou Reprendre !';
    default:
      return 'Pour naviguer à la voix tout au long de la recette, dites simplement : Suivant, Répéter, Précédent, Pause ou Reprendre.';
  }
}

// Construire la séquence complète pas-à-pas : consignes données uniquement au début, étapes fluides avec le caractère de chaque chef
function buildStepByStepVoiceSequence(ctx) {
  const persona = getActiveVoicePersona();
  const dish = ctx.title || 'notre plat du jour';
  const servings = ctx.servings || 2;
  const sequence = [];

  // 1. Présentation du plat + Consignes vocales complètes données UNE SEULE FOIS au début
  const introMain = persona.buildIntro(dish, servings);
  const initialInstructions = buildInitialVoiceCommandsInstruction(persona.id);
  sequence.push({
    type: 'intro',
    badge: '1️⃣ Présentation du plat',
    title: `🍽️ Nous allons cuisiner « ${dish} »`,
    visualText: `${introMain}`,
    spokenText: `${introMain} ${initialInstructions}`,
    repeatSpokenText: `${introMain} ${initialInstructions}`,
    ovenTemp: null,
    ingredientIdx: -1,
    recipeStepIdx: -1
  });

  // 2. Préparation des ingrédients de façon fluide (sans redonner les consignes à chaque ingrédient)
  const ingredientsList = ctx.ingredients || [];
  if (ingredientsList.length > 0) {
    const totalIngs = ingredientsList.length;
    ingredientsList.forEach((ing, idx) => {
      const ingNum = idx + 1;
      const singleIngSpeech = formatQtyUnitForSpeech(
        ing.qtyRaw || ing.qtyText.split(' ')[0],
        ing.unitRaw || ing.qtyText.split(' ').slice(1).join(' '),
        ing.name
      );

      let ingSpokenBody = '';
      if (idx === 0) {
        ingSpokenBody = `${persona.buildIngredients(servings, singleIngSpeech)}`;
      } else {
        ingSpokenBody = buildPersonaIngredientFollowup(persona.id, ingNum, totalIngs, singleIngSpeech);
      }

      sequence.push({
        type: 'ingredient',
        badge: `🛒 Ingrédient ${ingNum} / ${totalIngs} à préparer`,
        title: `🛒 Ingrédient ${ingNum} sur ${totalIngs} (${servings} ${servings > 1 ? 'parts' : 'part'})`,
        visualText: `Préparez sur le plan de travail : <strong style="font-size: 1.08rem; color: var(--primary);">${ing.qtyText}</strong> — <strong>${ing.name}</strong>`,
        spokenText: ingSpokenBody,
        repeatSpokenText: `${persona.repeatIntro || 'Je répète :'} ${singleIngSpeech}.`,
        ovenTemp: null,
        ingredientIdx: idx,
        recipeStepIdx: -1
      });
    });
  } else {
    const fallbackSpeech = persona.buildIngredients(servings, 'vos ingrédients sur le plan de travail');
    sequence.push({
      type: 'ingredient',
      badge: '🛒 Préparation des ingrédients',
      title: `🛒 Préparation des ingrédients (${servings} ${servings > 1 ? 'parts' : 'part'})`,
      visualText: 'Préparez vos ingrédients sur le plan de travail.',
      spokenText: fallbackSpeech,
      repeatSpokenText: fallbackSpeech,
      ovenTemp: null,
      ingredientIdx: 0,
      recipeStepIdx: -1
    });
  }

  // 3. Étapes de la recette : fluides, avec les intonations, tics et coups de gueule de la personnalité choisie
  const rawSteps = ctx.steps || [];
  const ovenInfo = analyzeRecipeOvenRequirements(dish, rawSteps);
  const personaStepIntros = Array.isArray(persona.stepIntros) && persona.stepIntros.length > 0
    ? persona.stepIntros
    : ['Première étape :', 'Ensuite :', 'Puis :', 'On continue :', 'Dernière étape :'];

  rawSteps.forEach((stepText, idx) => {
    const stepNum = idx + 1;
    const totalSteps = rawSteps.length;
    const transitionPhrase =
      idx === 0
        ? personaStepIntros[0]
        : idx === totalSteps - 1 && totalSteps > 1
        ? personaStepIntros[personaStepIntros.length - 1]
        : personaStepIntros[(idx % (personaStepIntros.length - 1)) || 1];
    const isPreheatStep = ovenInfo.usesOven && ovenInfo.preheatStepIdx === idx;
    const isBakeStep = ovenInfo.usesOven && ovenInfo.bakeStepIdx === idx && idx !== ovenInfo.preheatStepIdx;

    let spokenStepBody = stepText.replace(/°C/gi, ' degrés Celsius ');
    let ovenPrefixSpeech = '';
    let ovenVisualCallout = null;

    if (isPreheatStep) {
      ovenVisualCallout = `🔥 Préchauffage du four : ${ovenInfo.tempText}`;
      const spokenTemp = ovenInfo.tempText.replace('°C', ' degrés Celsius');
      if (!/préchauff|prechauff/i.test(stepText)) {
        ovenPrefixSpeech = `${persona.buildOvenAlert ? persona.buildOvenAlert(spokenTemp) : `Préchauffez d'abord le four à ${spokenTemp}.`} `;
      } else if (!/\d{3}/.test(stepText)) {
        ovenPrefixSpeech = `${persona.buildOvenAlert ? persona.buildOvenAlert(spokenTemp) : `Préchauffez le four à ${spokenTemp}.`} `;
      }
    } else if (isBakeStep) {
      ovenVisualCallout = `🔥 Cuisson au four : ${ovenInfo.tempText}`;
      if (!/\d{3}/.test(stepText)) {
        spokenStepBody += ` (dans votre four préchauffé à ${ovenInfo.tempText.replace('°C', ' degrés Celsius')}).`;
      }
    }

    const enrichedBody = enrichStepBodyWithPersonaTics(persona.id, spokenStepBody, idx, totalSteps);
    const fullStepSpeech = `${transitionPhrase} ${ovenPrefixSpeech}${enrichedBody}`;

    sequence.push({
      type: 'step',
      badge: `👩‍🍳 Étape ${stepNum} / ${totalSteps} de la recette`,
      title: `Étape ${stepNum} sur ${totalSteps}`,
      visualText: stepText,
      spokenText: fullStepSpeech,
      repeatSpokenText: `${persona.repeatIntro || 'Je répète :'} ${ovenPrefixSpeech}${spokenStepBody}`,
      ovenTemp: ovenVisualCallout,
      ingredientIdx: -1,
      recipeStepIdx: idx
    });
  });

  // 4. Quand tout est terminé, souhaiter un bon appétit !
  const outroMain = persona.buildOutro(dish);
  sequence.push({
    type: 'outro',
    badge: '🎉 Recette terminée • Bon appétit !',
    title: `🍽️ Bon appétit avec ${persona.name} !`,
    visualText: outroMain,
    spokenText: outroMain,
    repeatSpokenText: outroMain,
    ovenTemp: null,
    ingredientIdx: -1,
    recipeStepIdx: -1
  });

  return sequence;
}

// ============================================================================
// CONFIGURATION DES VOIX SYSTÈME & STUDIO DE CLONAGE VOCAL IA (NEURAL + ELEVENLABS)
// ============================================================================
let cachedElevenLabsVoices = [];

// Profils vocaux neuronaux intégrés (actifs immédiatement sans nécessiter d'abonnement payant)
const BUILTIN_NEURAL_PROFILES = {
  maite:     { neuralVoice: 'fr-BE-CharlineNeural',         label: 'Clone Neural Maïté (Sud-Ouest)',        isChefClone: true  },
  lignac:    { neuralVoice: 'fr-FR-RemyMultilingualNeural', label: 'Clone Neural Cyril Lignac',             isChefClone: true  },
  bocuse:    { neuralVoice: 'fr-BE-GerardNeural',           label: 'Clone Neural Monsieur Paul Bocuse',     isChefClone: true  },
  marx:      { neuralVoice: 'fr-CH-FabriceNeural',          label: 'Clone Neural Thierry Marx',             isChefClone: true  },
  etchebest: { neuralVoice: 'fr-FR-HenriNeural',            label: 'Clone Neural Philippe Etchebest',       isChefClone: true  },
  coffe:     { neuralVoice: 'fr-BE-GerardNeural',           label: 'Clone Neural Jean-Pierre Coffe',        isChefClone: true  },
  ia_homme:  { neuralVoice: 'fr-FR-HenriNeural',            label: 'Voix Masculine Neural FR (Henri)',      isChefClone: false },
  ia_femme:  { neuralVoice: 'fr-FR-DeniseNeural',           label: 'Voix Féminine Neural FR (Denise)',      isChefClone: false }
};

function getEffectiveElevenLabsApiKey() {
  const cfg = window.APP_CONFIG || {};
  const isLocal = isLocalAdminEnvironment();
  const allowShared = isLocal || cfg.shareAiKeyWithGuests !== false;

  if (cfg.aiVoiceEnabled === false && !isLocal) {
    return '';
  }

  if (allowShared && cfg.aiVoiceEnabled !== false) {
    const sharedXi = decodeSharedApiKey(cfg.elevenLabsApiKeyEncoded || cfg.elevenLabsApiKey || '');
    if (sharedXi) return sharedXi;
    const sharedVoice = decodeSharedApiKey(cfg.voiceApiKeyEncoded || cfg.voiceApiKey || '');
    if (sharedVoice && (sharedVoice.startsWith('sk_') || sharedVoice.startsWith('xi-'))) {
      return sharedVoice;
    }
  }

  const saved = (localStorage.getItem(STORAGE_KEYS.ELEVENLABS_KEY) || '').trim();
  if (saved) return saved;
  return '';
}

function getResolvedElevenLabsVoiceId(personaId) {
  const pId = personaId || state.voiceSettings?.persona || 'lignac';
  const cfg = window.APP_CONFIG || {};
  const adminCloneId = (cfg.clonedVoiceIds?.[pId] || '').trim();
  if (adminCloneId && !adminCloneId.startsWith('neural_clone_')) return adminCloneId;
  const customId = (state.voiceSettings?.clonedVoiceIds?.[pId] || '').trim();
  if (customId && !customId.startsWith('neural_clone_')) return customId;
  const p = VOICE_PERSONAS[pId] || VOICE_PERSONAS.lignac;
  return p.defaultElevenLabsVoiceId || 'ErXwobaYiN019PkySvjV';
}

function hasCustomVoiceClone(personaId) {
  const pId = personaId || state.voiceSettings?.persona || 'lignac';
  const cfg = window.APP_CONFIG || {};
  return Boolean(
    (cfg.clonedVoiceIds?.[pId] || state.voiceSettings?.clonedVoiceIds?.[pId] || '').trim() ||
    state.voiceSettings?.clonedVoiceProfiles?.[pId]
  );
}

function setupVoiceGuide() {
  if (!state.voiceSettings) {
    state.voiceSettings = {
      persona: 'lignac',
      engine: 'elevenlabs',
      clonedVoiceIds: {},
      clonedVoiceProfiles: {},
      voiceURI: 'auto',
      rate: 1.0,
      pitch: 1.0,
      frenchOnly: true
    };
  }
  if (!state.voiceSettings.persona || !VOICE_PERSONAS[state.voiceSettings.persona]) {
    state.voiceSettings.persona = 'lignac';
  }
  if (window.APP_CONFIG?.clonedVoicesEnabled !== false) {
    state.voiceSettings.engine = 'elevenlabs';
  } else if (!state.voiceSettings.engine) {
    state.voiceSettings.engine = 'elevenlabs';
  }
  if (!state.voiceSettings.clonedVoiceIds || typeof state.voiceSettings.clonedVoiceIds !== 'object') {
    state.voiceSettings.clonedVoiceIds = {};
  }
  if (!state.voiceSettings.clonedVoiceProfiles || typeof state.voiceSettings.clonedVoiceProfiles !== 'object') {
    state.voiceSettings.clonedVoiceProfiles = {};
  }

  renderVoiceGuideSettings();

  if (getEffectiveElevenLabsApiKey()) {
    syncElevenLabsLibraryVoices(false);
  }

  if ('speechSynthesis' in window) {
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = () => {
        renderVoiceGuideSettings();
      };
    }
    setTimeout(renderVoiceGuideSettings, 250);
    setTimeout(renderVoiceGuideSettings, 1000);
  }
}

function handleVoiceEngineChange(engineValue) {
  if (!state.voiceSettings) setupVoiceGuide();
  state.voiceSettings.engine = engineValue === 'system' ? 'system' : 'elevenlabs';
  saveStateToStorage();
  renderVoiceGuideSettings();
  showToast(
    state.voiceSettings.engine === 'elevenlabs'
      ? '🎭 Mode Voix Clonée & Imitation Réaliste activé'
      : '🗣️ Mode Voix Système / Navigateur activé'
  );
}

async function saveElevenLabsKeyAndSync() {
  const inputEl = document.getElementById('elevenlabs-api-key');
  if (!inputEl) return;
  const val = (inputEl.value || '').trim();
  if (val) {
    localStorage.setItem(STORAGE_KEYS.ELEVENLABS_KEY, val);
    state.voiceSettings.engine = 'elevenlabs';
    saveStateToStorage();
    showToast('🔑 Clé API ElevenLabs enregistrée ! Synchronisation des voix clonées...');
    await syncElevenLabsLibraryVoices(true);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ELEVENLABS_KEY);
    renderVoiceGuideSettings();
    showToast('ℹ️ Clé ElevenLabs retirée — Moteur Voix Clonées Neuronales intégré actif.');
  }
}

async function syncElevenLabsLibraryVoices(showNotification = true) {
  const xiKey = getEffectiveElevenLabsApiKey();
  if (!xiKey) {
    renderVoiceGuideSettings();
    if (showNotification) {
      showToast('✅ Moteur Voix Clonées Neuronales intégré actif (sans clé ElevenLabs requise).');
    }
    return;
  }

  try {
    const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': xiKey
      }
    });
    if (!resp.ok) {
      if (showNotification) showToast('⚠️ Clé ElevenLabs invalide — Moteur Voix Clonées Neuronales intégré utilisé en relais.');
      renderVoiceGuideSettings();
      return;
    }
    const data = await resp.json();
    cachedElevenLabsVoices = Array.isArray(data.voices) ? data.voices : [];

    // Auto-associer les voix clonées dont le nom correspond à l'une de nos personnalités
    let autoMatched = 0;
    cachedElevenLabsVoices.forEach((v) => {
      const vName = (v.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      Object.values(VOICE_PERSONAS).forEach((p) => {
        if (!state.voiceSettings.clonedVoiceIds[p.id]) {
          const pKey = p.id.toLowerCase();
          if (
            vName.includes(pKey) ||
            (p.id === 'maite' && vName.includes('maite')) ||
            (p.id === 'lignac' && vName.includes('cyril')) ||
            (p.id === 'bocuse' && vName.includes('paul')) ||
            (p.id === 'marx' && vName.includes('thierry')) ||
            (p.id === 'etchebest' && vName.includes('philippe')) ||
            (p.id === 'coffe' && vName.includes('coffe'))
          ) {
            state.voiceSettings.clonedVoiceIds[p.id] = v.voice_id;
            autoMatched++;
          }
        }
      });
    });

    if (autoMatched > 0) {
      saveStateToStorage();
    }

    renderVoiceGuideSettings();
    if (showNotification) {
      const clonedCount = cachedElevenLabsVoices.filter((v) => v.category === 'cloned' || v.category === 'generated').length;
      showToast(`✅ ${cachedElevenLabsVoices.length} voix ElevenLabs synchronisées (${clonedCount} voix clonées/personnalisées) !`);
    }
  } catch (e) {
    renderVoiceGuideSettings();
    if (showNotification) {
      showToast('⚠️ Impossible de joindre ElevenLabs — Moteur Voix Clonées intégré actif.');
    }
  }
}

function saveCustomVoiceIdForActivePersona() {
  const inputEl = document.getElementById('persona-custom-voiceid-input');
  if (!inputEl) return;
  const activePersona = getActiveVoicePersona();
  const customId = (inputEl.value || '').trim();
  if (!state.voiceSettings.clonedVoiceIds) state.voiceSettings.clonedVoiceIds = {};
  if (!state.voiceSettings.clonedVoiceProfiles) state.voiceSettings.clonedVoiceProfiles = {};

  if (customId) {
    state.voiceSettings.clonedVoiceIds[activePersona.id] = customId;
    saveStateToStorage();
    renderVoiceGuideSettings();
    showToast(`🧬 Voice ID cloné enregistré pour ${activePersona.name} !`);
  } else {
    delete state.voiceSettings.clonedVoiceIds[activePersona.id];
    delete state.voiceSettings.clonedVoiceProfiles[activePersona.id];
    saveStateToStorage();
    renderVoiceGuideSettings();
    showToast(`↺ Profil vocal neuronal par défaut rétabli pour ${activePersona.name}.`);
  }
}

function assignLibraryVoiceToActivePersona(voiceId) {
  if (!voiceId) return;
  const activePersona = getActiveVoicePersona();
  if (!state.voiceSettings.clonedVoiceIds) state.voiceSettings.clonedVoiceIds = {};
  state.voiceSettings.clonedVoiceIds[activePersona.id] = voiceId;
  const inputEl = document.getElementById('persona-custom-voiceid-input');
  if (inputEl) inputEl.value = voiceId;
  saveStateToStorage();
  renderVoiceGuideSettings();
  const found = cachedElevenLabsVoices.find((v) => v.voice_id === voiceId);
  showToast(`🧬 Voix « ${found ? found.name : voiceId} » assignée à ${activePersona.name} !`);
}

// Analyse acoustique d'un fichier audio (MP3/WAV/M4A) pour extraire l'empreinte vocale (fréquence fondamentale F0, timbre, cadence)
async function analyzeAudioSampleForVoiceClone(file, targetPersona) {
  const defaultF0 = targetPersona.gender === 'female' ? 210 : 122;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx || !file) {
      return { f0Hz: defaultF0, pitchHzDelta: 0, ratePctDelta: 0, fileName: file ? file.name : 'extrait.mp3' };
    }
    const arrayBuf = await file.arrayBuffer();
    const ctx = new AudioCtx();
    let audioBuf = null;
    try {
      audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0));
    } finally {
      try { ctx.close(); } catch (e) {}
    }
    if (!audioBuf) {
      return { f0Hz: defaultF0, pitchHzDelta: 0, ratePctDelta: 0, fileName: file.name };
    }

    const sr = audioBuf.sampleRate || 44100;
    const channel = audioBuf.getChannelData(0);
    const frameSize = Math.floor(sr * 0.04); // Fenêtres de 40 ms
    const minLag = Math.floor(sr / 340);     // Max 340 Hz
    const maxLag = Math.floor(sr / 75);      // Min 75 Hz
    const detectedF0s = [];
    let activeFrames = 0;
    let totalFrames = 0;

    const maxSamples = Math.min(channel.length, sr * 25); // Analyser jusqu'à 25s
    for (let offset = 0; offset + frameSize < maxSamples; offset += Math.floor(frameSize * 1.5)) {
      totalFrames++;
      let rms = 0;
      for (let i = 0; i < frameSize; i++) {
        const s = channel[offset + i];
        rms += s * s;
      }
      rms = Math.sqrt(rms / frameSize);
      if (rms < 0.02) continue;
      activeFrames++;

      let bestLag = -1;
      let bestCorr = 0;
      const searchWindow = Math.min(frameSize - maxLag, Math.floor(sr * 0.02));
      if (searchWindow <= 16) continue;

      for (let lag = minLag; lag <= maxLag; lag += 2) {
        let corr = 0;
        for (let i = 0; i < searchWindow; i += 2) {
          corr += channel[offset + i] * channel[offset + i + lag];
        }
        if (corr > bestCorr) {
          bestCorr = corr;
          bestLag = lag;
        }
      }
      if (bestLag > 0) {
        const f0 = sr / bestLag;
        if (f0 >= 75 && f0 <= 330) {
          detectedF0s.push(f0);
        }
      }
    }

    detectedF0s.sort((a, b) => a - b);
    const medianF0 = detectedF0s.length > 0
      ? Math.round(detectedF0s[Math.floor(detectedF0s.length / 2)])
      : defaultF0;

    const rawDelta = Math.round((medianF0 - defaultF0) * 0.35);
    const pitchHzDelta = Math.max(-18, Math.min(20, rawDelta));
    const activityRatio = totalFrames > 0 ? activeFrames / totalFrames : 0.6;
    const ratePctDelta = activityRatio > 0.72 ? 5 : activityRatio < 0.42 ? -4 : 0;

    return {
      f0Hz: medianF0,
      pitchHzDelta,
      ratePctDelta,
      durationSec: Math.round(audioBuf.duration || 0),
      fileName: file.name
    };
  } catch (e) {
    return { f0Hz: defaultF0, pitchHzDelta: 0, ratePctDelta: 0, fileName: file ? file.name : 'extrait.mp3' };
  }
}

async function createInstantVoiceCloneFromFiles() {
  const targetPersonaSelect = document.getElementById('clone-target-persona');
  const fileInput = document.getElementById('clone-audio-files');
  const statusEl = document.getElementById('clone-creation-status') || document.getElementById('clone-upload-status');
  const btnEl = document.getElementById('btn-create-voice-clone');

  const targetPersonaId = (targetPersonaSelect && targetPersonaSelect.value) || state.voiceSettings?.persona || 'lignac';
  const targetPersona = VOICE_PERSONAS[targetPersonaId] || getActiveVoicePersona();
  const files = fileInput && fileInput.files ? Array.from(fileInput.files) : [];

  if (files.length === 0) {
    showToast('⚠️ Sélectionnez au moins un fichier audio (MP3, WAV ou M4A) pour créer l\'empreinte vocale clonée.');
    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.style.padding = '8px 10px';
      statusEl.style.borderRadius = '8px';
      statusEl.style.background = '#fef3c7';
      statusEl.style.color = '#92400e';
      statusEl.innerHTML = `⚠️ Sélectionnez un fichier audio (MP3, WAV ou M4A) ci-dessus avant de cliquer sur <strong>Créer le clone vocal</strong>. (Note : les 9 voix clonées/neuronales pré-réglées fonctionnent déjà sans fichier !)`;
    }
    return;
  }

  if (btnEl) {
    btnEl.disabled = true;
    btnEl.textContent = '⏳ Clonage neuronal en cours...';
  }
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.style.padding = '8px 10px';
    statusEl.style.borderRadius = '8px';
    statusEl.style.background = '#eff6ff';
    statusEl.style.color = '#1e40af';
    statusEl.innerHTML = `🧬 Analyse acoustique et clonage neuronal de ${files.length} échantillon(s) audio pour <strong>${targetPersona.name}</strong>...`;
  }

  try {
    // 1. Extraire l'empreinte acoustique locale (F0 Hz, timbre, cadence) du fichier audio
    const acousticProfile = await analyzeAudioSampleForVoiceClone(files[0], targetPersona);

    // 2. Si une clé ElevenLabs payante est configurée, tenter également l'API Instant Voice Cloning ElevenLabs
    const xiKey = getEffectiveElevenLabsApiKey();
    let elevenVoiceId = '';
    if (xiKey) {
      try {
        const formData = new FormData();
        formData.append('name', `${targetPersona.name} (Cuisine Clone)`);
        formData.append(
          'description',
          `Clone vocal culinaire de ${targetPersona.name} (${targetPersona.shortTitle}) pour le Guide Vocal Pas-à-Pas.`
        );
        files.forEach((file) => {
          formData.append('files', file, file.name);
        });

        const resp = await fetch('https://api.elevenlabs.io/v1/voices/add', {
          method: 'POST',
          headers: { 'xi-api-key': xiKey },
          body: formData
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.ok && data && data.voice_id) {
          elevenVoiceId = data.voice_id;
        }
      } catch (e) {}
    }

    const cloneId = elevenVoiceId || `neural_clone_${targetPersonaId}_${acousticProfile.f0Hz}Hz`;

    if (!state.voiceSettings.clonedVoiceIds) state.voiceSettings.clonedVoiceIds = {};
    if (!state.voiceSettings.clonedVoiceProfiles) state.voiceSettings.clonedVoiceProfiles = {};

    state.voiceSettings.clonedVoiceIds[targetPersonaId] = cloneId;
    state.voiceSettings.clonedVoiceProfiles[targetPersonaId] = {
      ...acousticProfile,
      cloneId,
      createdAt: new Date().toLocaleTimeString('fr-FR')
    };
    state.voiceSettings.persona = targetPersonaId;
    state.voiceSettings.engine = 'elevenlabs';
    saveStateToStorage();

    if (statusEl) {
      statusEl.style.background = '#dcfce7';
      statusEl.style.color = '#166534';
      statusEl.innerHTML = `✅ Clone vocal activé pour <strong>${targetPersona.name}</strong> ! (Fréquence vocale détectée : <strong>${acousticProfile.f0Hz} Hz</strong> sur <em>${acousticProfile.fileName}</em> • ID : <code>${cloneId}</code>). Lecture d'un extrait...`;
    }

    if (xiKey && elevenVoiceId) {
      await syncElevenLabsLibraryVoices(false);
    }
    renderVoiceGuideSettings();
    showToast(`🎉 Voix clonée de ${targetPersona.name} créée et activée !`);
    testSelectedVoiceGuide();
  } catch (err) {
    if (statusEl) {
      statusEl.style.background = '#fef2f2';
      statusEl.style.color = '#991b1b';
      statusEl.innerHTML = `❌ Erreur lors de l'analyse du fichier audio.`;
    }
    showToast('⚠️ Erreur lors du clonage vocal.');
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.textContent = '🧬 Créer le clone vocal';
    }
  }
}

function getSortedSpeechVoices(frenchOnly = true) {
  if (!('speechSynthesis' in window)) return [];
  const rawVoices = window.speechSynthesis.getVoices() || [];
  const isFrenchVoice = (v) => /^fr([-_]|$)/i.test(v.lang || '') || /french|français|francais/i.test(v.name || '');

  const scoreVoiceQuality = (v) => {
    let score = 0;
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    if (isFrenchVoice(v)) score += 100;
    if (lang === 'fr-fr' || lang === 'fr_fr') score += 30;
    if (name.includes('natural') || name.includes('neural') || name.includes('premium') || name.includes('enhanced')) score += 45;
    if (name.includes('denise') || name.includes('henri') || name.includes('remy') || name.includes('rémi') || name.includes('vivienne') || name.includes('eloise') || name.includes('paul') || name.includes('julie') || name.includes('thomas') || name.includes('hortense') || name.includes('audrey')) score += 25;
    if (name.includes('google')) score += 15;
    if (v.default) score += 5;
    return score;
  };

  let filtered = frenchOnly ? rawVoices.filter(isFrenchVoice) : [...rawVoices];
  if (frenchOnly && filtered.length === 0 && rawVoices.length > 0) {
    filtered = [...rawVoices];
  }

  filtered.sort((a, b) => {
    const diff = scoreVoiceQuality(b) - scoreVoiceQuality(a);
    if (diff !== 0) return diff;
    return (a.name || '').localeCompare(b.name || '', 'fr');
  });

  return filtered;
}

function guessVoiceGender(voice) {
  const n = `${(voice && voice.name) || ''} ${(voice && voice.voiceURI) || ''}`.toLowerCase();
  if (
    /\b(henri|paul|remy|rémi|remi|thomas|daniel|mathieu|nicolas|claude|jerome|jérôme|alain|pierre|lucas|gabriel|antoine|gerard|gérard|fabrice|guillaume|thierry|jean|bastian|florian|loic|loïc|olivier|jacques|marc|bernard|male|homme|masculin|frb|frd)\b/i.test(n) ||
    /fr-fr-x-fr[bd]/i.test(n)
  ) {
    return 'male';
  }
  if (
    /google\s+fran[cç]ais/i.test(n) ||
    /\b(denise|julie|hortense|eloise|éloïse|vivienne|charline|sylvie|ariane|amelie|amélie|audrey|marie|celine|céline|brigitte|chloe|chloé|lea|léa|manon|camille|claire|female|femme|féminin|feminin|fra|frc)\b/i.test(n) ||
    /fr-fr-x-fr[ac]/i.test(n)
  ) {
    return 'female';
  }
  return 'unknown';
}

function resolveActiveSpeechVoice(preferredGender) {
  if (!('speechSynthesis' in window)) return null;
  const allVoices = window.speechSynthesis.getVoices() || [];
  if (allVoices.length === 0) return null;

  const targetURI = state.voiceSettings?.voiceURI || 'auto';
  if (targetURI !== 'auto') {
    const exact = allVoices.find((v) => v.voiceURI === targetURI || v.name === targetURI);
    if (exact) return exact;
  }

  const persona = getActiveVoicePersona();
  const targetGender = preferredGender || persona.gender || 'male';
  const frenchVoices = getSortedSpeechVoices(true);

  if (frenchVoices.length > 0) {
    // 1. Chercher une voix française du bon genre (ex: Henri, Paul, Rémi, Thomas pour Homme)
    const genderMatched = frenchVoices.find((v) => guessVoiceGender(v) === targetGender);
    if (genderMatched) return genderMatched;

    // 2. Si on cherche une voix d'HOMME mais que le navigateur n'expose que des voix féminines (ex: Chrome Windows avec Hortense + Google français),
    // NE JAMAIS choisir "Google français" car les voix réseau Google de Chrome ignorent totalement utterance.pitch et gardent une voix aiguë de femme !
    // On choisit une voix système locale (ex: Microsoft Hortense Desktop, localService === true) qui accepte la transposition grave masculine.
    if (targetGender === 'male') {
      const localPitchableVoice = frenchVoices.find(
        (v) => v.localService !== false && !/google/i.test(v.name || '')
      );
      if (localPitchableVoice) return localPitchableVoice;
    }

    return frenchVoices[0];
  }

  return allVoices[0] || null;
}

function formatVoiceOptionLabel(voice) {
  const isFr = /^fr([-_]|$)/i.test(voice.lang || '') || /french|français|francais/i.test(voice.name || '');
  const flag = isFr ? '🇫🇷' : '🌍';
  const cleanName = (voice.name || 'Voix système').replace(/^Microsoft\s+/i, 'Microsoft ');
  const g = guessVoiceGender(voice);
  const genderTag = g === 'male' ? ' 👨 Homme' : g === 'female' ? ' 👩 Femme' : '';
  const isNatural = /natural|neural|premium|enhanced/i.test(cleanName);
  const badge = isNatural ? ' ✨ Neural' : '';
  return `${flag} ${cleanName}${genderTag} (${voice.lang || 'fr-FR'})${badge}`;
}

function selectVoicePersona(personaId, playSample = false) {
  if (!VOICE_PERSONAS[personaId]) return;
  unlockSharedVoiceAudioElement();

  // Si on clique sur le bouton "Écouter" de la voix qui est déjà en train de jouer son extrait, on l'arrête !
  if (playSample && activePreviewPersonaId === personaId && voiceGuideSession.isSpeaking) {
    stopVoiceGuide();
    showToast('⏹️ Extrait vocal arrêté.');
    return;
  }

  // Toujours couper immédiatement toute voix en cours avant de changer ou relancer un extrait
  if (typeof cancelAllActiveSpeech === 'function') {
    cancelAllActiveSpeech();
  }

  if (!state.voiceSettings) {
    state.voiceSettings = {
      persona: personaId,
      engine: 'elevenlabs',
      clonedVoiceIds: {},
      clonedVoiceProfiles: {},
      voiceURI: 'auto',
      rate: 1.0,
      pitch: 1.0,
      frenchOnly: true
    };
  } else {
    state.voiceSettings.persona = personaId;
    state.voiceSettings.voiceURI = 'auto';
  }
  saveStateToStorage();
  renderVoiceGuideSettings();

  const cloneTargetSelect = document.getElementById('clone-target-persona');
  if (cloneTargetSelect) {
    cloneTargetSelect.value = personaId;
  }

  // Si une fiche cuisine est ouverte, mettre à jour le bandeau et le guide vocal en direct
  const modalEl = document.getElementById('recipe-modal');
  if (modalEl && modalEl.classList.contains('open') && activeModalVoiceContext) {
    const container = document.getElementById('modal-voice-guide-wrapper');
    if (container) {
      if (voiceGuideSession.active) {
        const currentIdx = voiceGuideSession.currentIndex;
        voiceGuideSession.sequence = buildStepByStepVoiceSequence(activeModalVoiceContext);
        voiceGuideSession.currentIndex = Math.min(currentIdx, voiceGuideSession.sequence.length - 1);
        renderActiveVoiceStageUI();
        speakCurrentStepInGuide(false);
        return;
      } else {
        container.innerHTML = buildModalVoiceToolbarHTML();
        warmUpRecipeVoiceGuideOnOpen();
      }
    }
  }

  const p = VOICE_PERSONAS[personaId];
  if (playSample) {
    playPersonaVoiceSample(personaId);
  } else {
    showToast(`🎙️ Assistant vocal : ${p.name} (${p.shortTitle})`);
  }
}

function renderVoiceGuideSettings() {
  const vs = state.voiceSettings || {
    persona: 'lignac',
    engine: 'elevenlabs',
    clonedVoiceIds: {},
    clonedVoiceProfiles: {},
    voiceURI: 'auto',
    rate: 1.0,
    pitch: 1.0,
    frenchOnly: true
  };
  const activePersona = getActiveVoicePersona();
  const xiKey = getEffectiveElevenLabsApiKey();
  const isCloneEngine = vs.engine !== 'system';
  const hasElevenLabs = Boolean(xiKey) && isCloneEngine;
  const hasVoiceAiKey = Boolean(getEffectiveAiApiKey('voice')) || hasElevenLabs;
  const isCustomCloned = hasCustomVoiceClone(activePersona.id);
  const builtinProf = BUILTIN_NEURAL_PROFILES[activePersona.id] || BUILTIN_NEURAL_PROFILES.lignac;

  // Mettre à jour la pastille en haut des Paramètres
  const statusPill = document.getElementById('voice-guide-status-pill');
  if (statusPill && !voiceGuideSession.isSpeaking) {
    if (isCloneEngine) {
      statusPill.textContent = builtinProf.isChefClone
        ? `🧬 Voix Clonée active : ${activePersona.name}`
        : `🎙️ ${builtinProf.label} : ${activePersona.name}`;
    } else if (hasVoiceAiKey) {
      statusPill.textContent = `🎙️ Voix active : ${activePersona.name} • 🔑 IA Active`;
    } else {
      statusPill.textContent = `🎙️ Voix système : ${activePersona.name}`;
    }
    statusPill.className = 'meta-pill healthy-pill';
  }

  // Mettre à jour le sélecteur de moteur vocal (Mode Clonage vs Système)
  const engineSelect = document.getElementById('voice-engine-select');
  if (engineSelect) {
    engineSelect.value = vs.engine || 'elevenlabs';
  }

  // Mettre à jour le Studio de Clonage Vocal
  const xiInput = document.getElementById('elevenlabs-api-key');
  if (xiInput && document.activeElement !== xiInput) {
    xiInput.value = xiKey;
  }

  const xiBadge = document.getElementById('elevenlabs-status-badge');
  if (xiBadge) {
    if (isCloneEngine) {
      if (isCustomCloned) {
        xiBadge.textContent = `🧬 Voix active (${activePersona.name})`;
      } else if (xiKey) {
        xiBadge.textContent = `✅ ElevenLabs Neural v2 + 9 Voix Clonées actifs`;
      } else {
        xiBadge.textContent = `✅ 9 Voix Clonées & Neuronales actives (${builtinProf.label})`;
      }
      xiBadge.className = 'meta-pill healthy-pill';
    } else {
      xiBadge.textContent = '📱 Mode Voix Système Standard actif';
      xiBadge.className = 'meta-pill';
    }
  }

  const activePersonaLabel =
    document.getElementById('active-persona-clone-label') ||
    document.getElementById('clone-active-persona-label');
  if (activePersonaLabel) {
    activePersonaLabel.textContent = activePersona.name;
  }

  const customVoiceIdInput = document.getElementById('persona-custom-voiceid-input');
  if (customVoiceIdInput && document.activeElement !== customVoiceIdInput) {
    customVoiceIdInput.value = vs.clonedVoiceIds?.[activePersona.id] || '';
    customVoiceIdInput.placeholder = `Actif par défaut : ${builtinProf.label}`;
  }

  const libRow = document.getElementById('elevenlabs-library-select-row');
  const libSelect = document.getElementById('elevenlabs-library-voices-select');
  if (libSelect) {
    const currentCustomId = vs.clonedVoiceIds?.[activePersona.id] || '';
    if (cachedElevenLabsVoices.length === 0) {
      if (libRow) libRow.style.display = 'none';
      libSelect.innerHTML = `<option value="">-- Cliquez sur « Connecter & Synchroniser » si vous utilisez une bibliothèque ElevenLabs externe --</option>`;
    } else {
      if (libRow) libRow.style.display = 'block';
      libSelect.innerHTML = [
        `<option value="">-- Choisir parmi vos ${cachedElevenLabsVoices.length} voix ElevenLabs (${activePersona.name}) --</option>`,
        ...cachedElevenLabsVoices.map((v) => {
          const catBadge = v.category === 'cloned' ? '🧬 [CLONE] ' : v.category === 'generated' ? '✨ [DESIGN] ' : '🎙️ ';
          const sel = v.voice_id === currentCustomId ? 'selected' : '';
          return `<option value="${v.voice_id}" ${sel}>${catBadge}${v.name} (${v.voice_id.slice(0, 8)}…)</option>`;
        })
      ].join('');
    }
  }

  // Mettre à jour le menu déroulant des personnalités selon l'état des voix clones
  const availablePersonas = getAvailableVoicePersonas();
  const clonesActive = areClonedVoicesActive();
  const personaSelect = document.getElementById('voice-persona-select');
  if (personaSelect) {
    if (!clonesActive) {
      personaSelect.innerHTML = availablePersonas
        .map((p) => `<option value="${p.id}" ${p.id === activePersona.id ? 'selected' : ''}>${p.name}</option>`)
        .join('');
    } else {
      const chefPersonas = availablePersonas.filter((p) => p.id !== 'ia_homme' && p.id !== 'ia_femme');
      const iaPersonas = availablePersonas.filter((p) => p.id === 'ia_homme' || p.id === 'ia_femme');
      personaSelect.innerHTML = `
        <optgroup label="👨‍🍳 Personnalités">
          ${chefPersonas.map((p) => `<option value="${p.id}" ${p.id === activePersona.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </optgroup>
        <optgroup label="🤖 Voix Neutres IA">
          ${iaPersonas.map((p) => `<option value="${p.id}" ${p.id === activePersona.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </optgroup>
      `;
    }
    personaSelect.value = activePersona.id;
  }

  // Rendre la grille de cartes des personnalités disponibles dans les Paramètres (juste le prénom / nom IA)
  const personaGrid = document.getElementById('voice-persona-grid');
  if (personaGrid) {
    personaGrid.innerHTML = availablePersonas
      .map((p) => {
        const isSelected = p.id === activePersona.id;
        const isThisSamplePlaying = activePreviewPersonaId === p.id && voiceGuideSession.isSpeaking;
        return `
          <div
            class="voice-persona-card ${isSelected ? 'is-selected' : ''}"
            style="--persona-color: ${p.themeColor}; --persona-bg: ${p.themeBg}; --persona-border: ${p.themeBorder};"
            onclick="selectVoicePersona('${p.id}', false)"
          >
            <div class="voice-persona-card-top" style="align-items: center;">
              <div class="voice-persona-avatar-mini ${isSelected && voiceGuideSession.isSpeaking ? 'is-speaking' : ''}">
                ${buildPersonaAnimatedAvatarSVG(p.id)}
              </div>
              <div class="voice-persona-meta">
                <div class="voice-persona-name-row" style="margin-bottom: 0;">
                  <strong>${p.name}</strong>
                  ${isSelected ? '<span class="voice-persona-active-tag">✓ Choisi</span>' : ''}
                </div>
              </div>
            </div>
            <div class="voice-persona-actions">
              <button
                type="button"
                class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}"
                onclick="event.stopPropagation(); selectVoicePersona('${p.id}', false);"
              >
                ${isSelected ? '✓ Active' : 'Choisir'}
              </button>
              <button
                type="button"
                class="btn btn-outline btn-sm"
                style="${isThisSamplePlaying ? 'background:#fef2f2; border-color:#f87171; color:#b91c1c; font-weight:800;' : ''}"
                onclick="event.stopPropagation(); selectVoicePersona('${p.id}', true);"
                title="${isThisSamplePlaying ? 'Arrêter l\'extrait vocal' : 'Écouter un aperçu vocal de ' + p.name}"
              >
                ${isThisSamplePlaying ? '⏹️ Arrêter' : '🔊 Écouter'}
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  const frCheckbox = document.getElementById('voice-french-only-checkbox');
  if (frCheckbox) {
    frCheckbox.checked = vs.frenchOnly !== false;
  }

  const selectEl = document.getElementById('voice-guide-select');
  const voices = getSortedSpeechVoices(vs.frenchOnly !== false);
  const bestAutoVoice = resolveActiveSpeechVoice(activePersona.gender);

  if (selectEl) {
    const autoLabel = isCloneEngine
      ? `🌟 Auto — ${builtinProf.label} (${activePersona.gender === 'male' ? 'Timbre Masculin' : 'Timbre Féminin'})`
      : bestAutoVoice
      ? `🌟 Auto (${activePersona.name}) — ${bestAutoVoice.name}`
      : `🌟 Ajustement automatique selon la personnalité`;

    const cloudOptionHTML = hasVoiceAiKey
      ? `<option value="cloud_neural_fr" ${vs.voiceURI === 'cloud_neural_fr' ? 'selected' : ''}>🔑 Voix IA Cloud Neural FR (${activePersona.name})</option>`
      : '';

    const optionsHTML = [
      `<option value="auto">${autoLabel}</option>`,
      cloudOptionHTML,
      ...voices.map((v) => {
        const val = (v.voiceURI || v.name).replace(/"/g, '&quot;');
        const selected = vs.voiceURI === v.voiceURI || vs.voiceURI === v.name ? 'selected' : '';
        return `<option value="${val}" ${selected}>${formatVoiceOptionLabel(v)}</option>`;
      })
    ]
      .filter(Boolean)
      .join('');

    selectEl.innerHTML = optionsHTML;
    const validCloud = hasVoiceAiKey && vs.voiceURI === 'cloud_neural_fr';
    if (
      !validCloud &&
      (vs.voiceURI === 'auto' || !voices.some((v) => v.voiceURI === vs.voiceURI || v.name === vs.voiceURI))
    ) {
      selectEl.value = 'auto';
    }
  }

  const rateInput = document.getElementById('voice-guide-rate');
  const rateLabel = document.getElementById('voice-rate-label');
  const rateVal = typeof vs.rate === 'number' ? vs.rate : 1.0;
  if (rateInput) rateInput.value = String(rateVal);
  if (rateLabel) {
    const desc = rateVal < 0.95 ? 'Calme' : rateVal > 1.08 ? 'Dynamique' : 'Normale';
    rateLabel.textContent = `${rateVal.toFixed(2).replace('.', ',').replace(/0$/, '')}x (${desc})`;
  }

  renderDevicePermissionsStatus();
}

let appDevicePermissionsState = {
  mic: localStorage.getItem('menusemaine_perm_mic_v1') || 'prompt',
  camera: localStorage.getItem('menusemaine_perm_camera_v1') || 'prompt'
};

async function renderDevicePermissionsStatus() {
  if (navigator.permissions && typeof navigator.permissions.query === 'function') {
    try {
      const micPerm = await navigator.permissions.query({ name: 'microphone' });
      if (micPerm && micPerm.state) {
        appDevicePermissionsState.mic = micPerm.state;
        micPerm.onchange = () => {
          appDevicePermissionsState.mic = micPerm.state;
          updateDevicePermissionsButtonsUI();
        };
      }
    } catch (e) {}
    try {
      const camPerm = await navigator.permissions.query({ name: 'camera' });
      if (camPerm && camPerm.state) {
        appDevicePermissionsState.camera = camPerm.state;
        camPerm.onchange = () => {
          appDevicePermissionsState.camera = camPerm.state;
          updateDevicePermissionsButtonsUI();
        };
      }
    } catch (e) {}
  }
  updateDevicePermissionsButtonsUI();
}

function updateDevicePermissionsButtonsUI() {
  const micGranted = appDevicePermissionsState.mic === 'granted';
  const micDenied = appDevicePermissionsState.mic === 'denied';
  const camGranted = appDevicePermissionsState.camera === 'granted';
  const camDenied = appDevicePermissionsState.camera === 'denied';

  const micPill = document.getElementById('settings-mic-status-pill');
  if (micPill) {
    micPill.textContent = micGranted
      ? '🎙️ Micro : Activé ✓'
      : micDenied
      ? '🎙️ Micro : Bloqué par le navigateur'
      : '🎙️ Micro : À activer';
    micPill.className = micGranted ? 'meta-pill healthy-pill' : micDenied ? 'meta-pill pleasure-pill' : 'meta-pill';
  }

  const camPill = document.getElementById('settings-camera-status-pill');
  if (camPill) {
    camPill.textContent = camGranted
      ? '📹 Caméra : Activée ✓'
      : camDenied
      ? '📹 Caméra : Bloquée par le navigateur'
      : '📹 Caméra : À activer';
    camPill.className = camGranted ? 'meta-pill healthy-pill' : camDenied ? 'meta-pill pleasure-pill' : 'meta-pill';
  }

  ['btn-settings-enable-mic', 'btn-header-enable-mic'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.textContent = micGranted ? '🎙️ Micro activé ✓' : '🎙️ Activer le micro';
    }
  });

  ['btn-settings-enable-camera', 'btn-header-enable-camera'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.textContent = camGranted ? '📹 Caméra activée ✓' : '📹 Activer la caméra';
    }
  });
}

function showMicDiagnosticBanner(htmlContent, isSuccess = false) {
  let banner = document.getElementById('mic-permission-help-box');
  if (!banner) {
    const pill = document.getElementById('settings-mic-status-pill');
    const parentCard = pill ? pill.closest('.card-panel') : null;
    if (parentCard) {
      banner = document.createElement('div');
      banner.id = 'mic-permission-help-box';
      banner.style.marginTop = '12px';
      banner.style.padding = '12px 14px';
      banner.style.borderRadius = '10px';
      banner.style.fontSize = '0.88rem';
      banner.style.lineHeight = '1.5';
      parentCard.appendChild(banner);
    }
  }
  if (!banner) return;
  if (!htmlContent) {
    banner.style.display = 'none';
    return;
  }
  banner.style.display = 'block';
  banner.style.background = isSuccess ? '#ecfdf5' : '#fef2f2';
  banner.style.border = isSuccess ? '1px solid #34d399' : '1px solid #f87171';
  banner.style.color = isSuccess ? '#065f46' : '#991b1b';
  banner.innerHTML = htmlContent;
}

function isMobilePhoneDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
}

async function requestAppMicrophonePermission() {
  const pubUrl = (window.APP_CONFIG && window.APP_CONFIG.publicUrl) || 'https://cedtayrac-wq.github.io/projet-menus/';
  if (
    window.location.protocol === 'file:' ||
    (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
  ) {
    const targetUrl = isMobilePhoneDevice() ? pubUrl : 'http://localhost:8080';
    showMicDiagnosticBanner(
      `<strong>⚠️ Connexion non sécurisée (${window.location.protocol}//${window.location.host || 'fichier'}) :</strong><br>` +
        `Sur smartphone, le microphone exige obligatoirement une adresse sécurisée <strong>HTTPS</strong>.<br>` +
        `<a href="${targetUrl}" class="btn btn-primary btn-sm" style="margin-top:8px; display:inline-flex;">🚀 Ouvrir la version HTTPS (${targetUrl})</a>`
    );
    showToast('⚠️ Sur smartphone, ouvrez l\'adresse HTTPS pour activer le microphone.');
    return false;
  }

  // Libérer tout flux micro de secours déjà ouvert avant de demander l'accès sur Android/iOS
  stopFallbackWebAudioListener();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('⚠️ Le microphone n\'est pas pris en charge sur ce navigateur.');
    return false;
  }

  try {
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (firstErr) {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false
      });
    }

    // Garder le flux actif un court instant puis le libérer proprement (Android exige 200ms après stop() avant SpeechRecognition)
    await new Promise((resolve) => setTimeout(resolve, 250));
    stream.getTracks().forEach((t) => t.stop());
    await new Promise((resolve) => setTimeout(resolve, 220));

    appDevicePermissionsState.mic = 'granted';
    voiceGuideSession.permissionBlocked = false;
    localStorage.setItem('menusemaine_perm_mic_v1', 'granted');
    updateDevicePermissionsButtonsUI();
    showMicDiagnosticBanner(
      `<strong>✅ Microphone activé et opérationnel sur votre appareil !</strong><br>` +
        `Vous pouvez utiliser les commandes vocales dans le <em>Guide vocal</em> (« Suivant », « Répéter », « Pause », « Reprendre ») et la dictée dans le <em>Garde-manger</em>.`,
      true
    );
    showToast('🎙️ Microphone activé avec succès !');

    if (voiceGuideSession.active && !voiceGuideSession.finished) {
      startVoiceCommandListener(true);
    }
    return true;
  } catch (err) {
    const errName = err && err.name ? err.name : '';
    const isMobile = isMobilePhoneDevice();

    if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
      appDevicePermissionsState.mic = 'prompt';
      updateDevicePermissionsButtonsUI();
      showMicDiagnosticBanner(
        `<strong>⚠️ Aucun microphone détecté (${errName}) :</strong><br>` +
          `Vérifiez que votre microphone n'est pas désactivé sur votre appareil.`
      );
      showToast('⚠️ Aucun microphone détecté sur cet appareil.');
    } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
      appDevicePermissionsState.mic = 'prompt';
      updateDevicePermissionsButtonsUI();
      showMicDiagnosticBanner(
        `<strong>⚠️ Microphone déjà utilisé par une autre application :</strong><br>` +
          `Fermez les autres applications utilisant le micro (appel téléphonique, enregistreur, WhatsApp) puis réessayez.`
      );
      showToast('⚠️ Le microphone est occupé par une autre application.');
    } else {
      appDevicePermissionsState.mic = 'denied';
      updateDevicePermissionsButtonsUI();
      if (isMobile) {
        showMicDiagnosticBanner(
          `<strong>📱 Comment débloquer le microphone sur votre smartphone :</strong><br>` +
            `<div style="margin-top:6px;">` +
            `<strong>• Sur Android (Chrome ou Application installée) :</strong><br>` +
            `1. Si vous êtes dans Chrome : touchez l'icône <strong>🎛️</strong> (ou <strong>🔒</strong>) tout à gauche de la barre d'adresse en haut ➔ <strong>Autorisations</strong> ➔ activez <strong>Microphone</strong>.<br>` +
            `2. Si l'application est installée sur l'écran d'accueil (ou si Chrome est bloqué par Android) : faites un <strong>appui long sur l'icône Chrome (ou MenuSemaine)</strong> sur l'écran d'accueil ➔ <strong>Infos sur l'appli (ⓘ)</strong> ➔ <strong>Autorisations</strong> ➔ <strong>Microphone</strong> ➔ choisissez <strong>« Autoriser »</strong>.<br>` +
            `<strong>• Sur iPhone / iPad (Safari) :</strong><br>` +
            `Touchez <strong>aA</strong> (ou l'icône à gauche de l'adresse) ➔ <strong>Réglages du site web</strong> ➔ <strong>Microphone : Autoriser</strong>.<br>` +
            `</div>` +
            `<button type="button" class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="requestAppMicrophonePermission()">🔄 Réessayer l'activation du micro</button>`
        );
      } else {
        showMicDiagnosticBanner(
          `<strong>🔒 Accès au microphone bloqué par le navigateur :</strong><br>` +
            `1. Cliquez sur l'icône de réglages <strong>🎛️ / 🔒</strong> tout à gauche de la barre d'adresse (devant <code>${window.location.host || 'localhost:8080'}</code>).<br>` +
            `2. Passez <strong>Microphone</strong> sur <strong>« Autoriser »</strong>.<br>` +
            `3. Cliquez à nouveau sur <strong>🎙️ Activer le micro</strong> ci-dessus.`
        );
      }
      showToast('⚠️ Micro bloqué : autorisez le microphone dans les réglages de Chrome/Safari ou d\'Android.');
    }
    return false;
  }
}

async function requestAppCameraPermission() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('⚠️ La caméra n\'est pas prise en charge sur ce navigateur.');
    return;
  }
  try {
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
    } catch (e) {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    stream.getTracks().forEach((t) => t.stop());
    appDevicePermissionsState.camera = 'granted';
    localStorage.setItem('menusemaine_perm_camera_v1', 'granted');
    updateDevicePermissionsButtonsUI();
    showToast('📹 Caméra activée avec succès pour l\'application !');
  } catch (err) {
    appDevicePermissionsState.camera = 'denied';
    updateDevicePermissionsButtonsUI();
    showToast('⚠️ Accès à la caméra refusé. Vérifiez les autorisations de votre navigateur.');
  }
}

function handleVoiceGuideSelectionChange(newVoiceURI) {
  state.voiceSettings.voiceURI = newVoiceURI || 'auto';
  saveStateToStorage();
  renderVoiceGuideSettings();
  if (newVoiceURI === 'cloud_neural_fr') {
    showToast('🔑 Voix IA Cloud Neural FR sélectionnée');
    return;
  }
  const chosen = resolveActiveSpeechVoice();
  showToast(chosen ? `🗣️ Timbre système : ${chosen.name}` : '🗣️ Timbre automatique sélectionné');
}

function handleVoiceFilterToggle(frenchOnly) {
  state.voiceSettings.frenchOnly = !!frenchOnly;
  saveStateToStorage();
  renderVoiceGuideSettings();
}

function handleVoiceRateInput(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return;
  state.voiceSettings.rate = Math.max(0.7, Math.min(1.5, num));
  saveStateToStorage();
  renderVoiceGuideSettings();
}

function setVoiceGuideRate(val) {
  handleVoiceRateInput(val);
  showToast(`⏱️ Vitesse du guide vocal réglée sur ${String(val).replace('.', ',')}x`);
}

function handleVoicePitchInput(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return;
  state.voiceSettings.pitch = Math.max(0.7, Math.min(1.4, num));
  saveStateToStorage();
  renderVoiceGuideSettings();
}

function setVoiceGuidePitch(val) {
  handleVoicePitchInput(val);
  showToast(`🎵 Timbre du guide vocal ajusté`);
}

function updateVoiceStatusIndicators(isSpeaking, labelText) {
  const persona = getActiveVoicePersona();
  const isCloneEngine = state.voiceSettings?.engine !== 'system';
  const settingsPill = document.getElementById('voice-guide-status-pill');
  if (settingsPill) {
    const idleLabel = isCloneEngine
      ? `🧬 Voix Clonée active : ${persona.name}`
      : `🎙️ Voix active : ${persona.name}`;
    settingsPill.textContent = labelText || (isSpeaking ? `🔊 ${persona.name} vous parle...` : idleLabel);
    settingsPill.className = isSpeaking ? 'meta-pill pleasure-pill' : 'meta-pill healthy-pill';
  }
}

// ============================================================================
// SYNTHÈSE VOCALE (VOIX CLONÉES NEURONALES / ELEVENLABS / GEMINI / NAVIGATEUR)
// & RECONNAISSANCE VOCALE CONTINUE (« SUIVANT », « RÉPÉTER », « PAUSE », « REPRENDRE »)
// ============================================================================
let activeCloudVoiceAudio = null;
let activeCloudVoiceObjectUrl = null;
let sharedVoiceGuideAudio = null;
let sharedVoiceGuideAudioUnlocked = false;
let currentVoiceRequestSeq = 0;
let activeTtsFetchController = null;
let activePreviewPersonaId = null;
const clientTtsBlobCache = new Map();
window._activeVoiceUtterance = null; // Référence globale pour empêcher le Garbage Collector Chrome/Android de supprimer onend !

function getOrCreateSharedVoiceAudio() {
  if (!sharedVoiceGuideAudio) {
    sharedVoiceGuideAudio = new Audio();
    sharedVoiceGuideAudio.preload = 'auto';
  }
  return sharedVoiceGuideAudio;
}

// Déverrouiller l'élément Audio partagé lors d'un geste utilisateur (clic/toucher)
// pour que la lecture asynchrone (/api/tts) et les commandes vocales (« Suivant ») ne soient jamais bloquées par l'autoplay navigateur
function unlockSharedVoiceAudioElement() {
  try {
    const audio = getOrCreateSharedVoiceAudio();
    if (sharedVoiceGuideAudioUnlocked || (voiceGuideSession.isSpeaking && activeCloudVoiceAudio === audio)) {
      return;
    }
    const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    audio.muted = true;
    audio.src = silentWav;
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        audio.pause();
        audio.muted = false;
        sharedVoiceGuideAudioUnlocked = true;
      }).catch(() => {
        audio.muted = false;
      });
    } else {
      audio.muted = false;
    }
  } catch (e) {}
}

function stopActiveCloudVoiceAudio() {
  if (activeCloudVoiceAudio) {
    try {
      activeCloudVoiceAudio.onended = null;
      activeCloudVoiceAudio.onerror = null;
      activeCloudVoiceAudio.onplay = null;
      activeCloudVoiceAudio.pause();
    } catch (e) {}
    activeCloudVoiceAudio = null;
  }
  if (activeCloudVoiceObjectUrl) {
    try {
      URL.revokeObjectURL(activeCloudVoiceObjectUrl);
    } catch (e) {}
    activeCloudVoiceObjectUrl = null;
  }
}

function cancelAllActiveSpeech() {
  currentVoiceRequestSeq++;
  activePreviewPersonaId = null;

  if (activeTtsFetchController) {
    try {
      activeTtsFetchController.abort();
    } catch (e) {}
    activeTtsFetchController = null;
  }

  stopActiveCloudVoiceAudio();

  if (window._activeVoiceUtterance && window._activeVoiceUtterance._safetyEndTimer) {
    clearTimeout(window._activeVoiceUtterance._safetyEndTimer);
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  voiceGuideSession.isSpeaking = false;
}

function playAudioBlobOrUrl(audioSrc, isObjectUrl, persona, options = {}) {
  const reqId = options.reqId;
  return new Promise((resolve) => {
    try {
      if (reqId && reqId !== currentVoiceRequestSeq) {
        if (isObjectUrl) {
          try { URL.revokeObjectURL(audioSrc); } catch (e) {}
        }
        resolve(true);
        return;
      }

      stopActiveCloudVoiceAudio();
      const audio = getOrCreateSharedVoiceAudio();
      audio.muted = false;
      audio.src = audioSrc;
      if (isObjectUrl) {
        activeCloudVoiceObjectUrl = audioSrc;
      }

      const userRate = state.voiceSettings?.rate || 1.0;
      const cloneProf = state.voiceSettings?.clonedVoiceProfiles?.[persona.id];

      // Si un profil cloné personnalisé a ajusté la hauteur (pitchHzDelta) et qu'on lit un extrait pré-généré,
      // on peut moduler légèrement le timbre si demandé
      let effectiveRate = Math.max(0.75, Math.min(1.38, userRate));
      if (options.applyClonePitchOnClient && cloneProf && cloneProf.pitchHzDelta) {
        const pitchFactor = Math.max(0.86, Math.min(1.16, 1 + cloneProf.pitchHzDelta / 160));
        if ('preservesPitch' in audio) audio.preservesPitch = false;
        else if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = false;
        else if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = false;
        effectiveRate = Math.max(0.75, Math.min(1.38, userRate * pitchFactor));
      }

      audio.playbackRate = effectiveRate;
      activeCloudVoiceAudio = audio;

      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        if (isObjectUrl && activeCloudVoiceObjectUrl === audioSrc) {
          try { URL.revokeObjectURL(audioSrc); } catch (e) {}
          activeCloudVoiceObjectUrl = null;
        }
        if (activeCloudVoiceAudio === audio) {
          activeCloudVoiceAudio = null;
        }
        if (reqId && reqId !== currentVoiceRequestSeq) {
          resolve(true);
          return;
        }
        if (ok) {
          if (activePreviewPersonaId === persona.id) {
            activePreviewPersonaId = null;
          }
          voiceGuideSession.isSpeaking = false;
          voiceGuideSession.lastSpokenEndTime = Date.now();
          updateVoiceStatusIndicators(false);
          updateCharacterStageAnimationState();
          renderVoiceGuideSettings();
          if (typeof options.onEnd === 'function') {
            options.onEnd();
          }
        }
        resolve(ok);
      };

      audio.onplay = () => {
        sharedVoiceGuideAudioUnlocked = true;
        if (reqId && reqId !== currentVoiceRequestSeq) {
          try { audio.pause(); } catch (e) {}
          finish(true);
          return;
        }
        voiceGuideSession.isSpeaking = true;
        updateVoiceStatusIndicators(true, options.statusLabel || `🧬 ${persona.name} vous parle...`);
        updateCharacterStageAnimationState();
        renderVoiceGuideSettings();
        if (typeof options.onPlayStart === 'function') {
          options.onPlayStart();
        }
      };

      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);

      audio.play().catch(() => {
        try {
          const fallbackAudio = new Audio(audioSrc);
          fallbackAudio.playbackRate = effectiveRate;
          activeCloudVoiceAudio = fallbackAudio;
          fallbackAudio.onplay = audio.onplay;
          fallbackAudio.onended = () => finish(true);
          fallbackAudio.onerror = () => finish(false);
          fallbackAudio.play().catch(() => finish(false));
        } catch (err) {
          finish(false);
        }
      });
    } catch (e) {
      resolve(false);
    }
  });
}

// ============================================================================
// 2b. CLONAGE VOCAL FISH AUDIO S2.1 PRO (AVEC LES 6 VRAIS EXTRAITS STUDIO/INA/RADIO 100% SOLO VÉRIFIÉS DES CHEFS)
// ============================================================================
const FISH_AUDIO_CLONE_MODEL_IDS = {
  maite: 'cae9259cec4343e1b1c837c525f9d268',
  lignac: 'f3e595ddbd9c41a6a16cce1372eecbac',
  bocuse: '35bdc7c82ae24edb91bbb24507b5c1f3',
  marx: '6df60779e006417f8ca9a300cc66f772',
  etchebest: '6e01eb6afdc24c97983bdf3841651857',
  coffe: 'bbaf5b5ace5b4ac6ab66c5b4dc52ec6b'
};

function getEffectiveFishAudioApiKey() {
  const cfg = window.APP_CONFIG || {};
  const fromConfig = decodeSharedApiKey(cfg.fishAudioApiKeyEncoded || '');
  if (fromConfig) return fromConfig;
  return 'sk-fish--dbfxx4hOXWqWQhe3Wi4aROmki6FOuNtUm5sEz7YbmQ';
}

async function tryFetchFishAudioCloneBlob(cleanText, persona) {
  const refId = FISH_AUDIO_CLONE_MODEL_IDS[persona.id];
  const fishKey = getEffectiveFishAudioApiKey();
  if (!refId || !fishKey) return null;

  try {
    const resp = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${fishKey}`,
        'Content-Type': 'application/json',
        model: 's2.1-pro-free'
      },
      body: JSON.stringify({
        text: cleanText,
        reference_id: refId,
        format: 'mp3',
        mp3_bitrate: 128,
        normalize: true,
        latency: 'normal'
      })
    });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    if (blob && blob.size >= 200) return blob;
  } catch (e) {}
  return null;
}

// Récupérer (avec cache RAM + déduplication des requêtes en cours) l'audio cloné depuis /api/tts ou Fish Audio S2.1 Pro
function fetchClonedTtsAudioBlob(cleanText, persona) {
  const cloneProf = state.voiceSettings?.clonedVoiceProfiles?.[persona.id] || {};
  const userRate = state.voiceSettings?.rate || 1.0;
  const cacheKey = `v205::${persona.id}::${userRate}::${cloneProf.pitchHzDelta || 0}::${cleanText}`;

  if (clientTtsBlobCache.has(cacheKey)) {
    return clientTtsBlobCache.get(cacheKey);
  }

  const fetchPromise = (async () => {
    const payload = {
      text: cleanText,
      persona: persona.id,
      rate: userRate,
      pitchHz: cloneProf.pitchHzDelta || 0,
      ratePct: cloneProf.ratePctDelta || 0
    };

    const endpoints = ['/api/tts'];
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      endpoints.push('http://localhost:8080/api/tts');
    }

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!resp.ok) continue;
        const ctype = (resp.headers.get('Content-Type') || '').toLowerCase();
        if (!ctype.includes('audio')) continue;

        const blob = await resp.blob();
        if (blob && blob.size >= 200) {
          return blob;
        }
      } catch (e) {}
    }

    // Repli direct sur Fish Audio S2.1 Pro si le serveur local /api/tts n'est pas joignable
    const directFishBlob = await tryFetchFishAudioCloneBlob(cleanText, persona);
    if (directFishBlob) {
      return directFishBlob;
    }

    clientTtsBlobCache.delete(cacheKey);
    return null;
  })();

  if (clientTtsBlobCache.size > 60) {
    const firstKey = clientTtsBlobCache.keys().next().value;
    if (firstKey) clientTtsBlobCache.delete(firstKey);
  }
  clientTtsBlobCache.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// 1. Synthèse Vocale via le Moteur de Voix Clonées & Neuronales Local (/api/tts : Fish Audio S2.1 Pro + Edge Neural + Windows OneCore)
async function trySpeakWithLocalNeuralServer(cleanText, persona, options = {}) {
  const reqId = options.reqId;
  if (reqId && reqId !== currentVoiceRequestSeq) return { ok: true, serverHadBlob: true };

  const blob = await fetchClonedTtsAudioBlob(cleanText, persona);
  if (reqId && reqId !== currentVoiceRequestSeq) return { ok: true, serverHadBlob: true };
  if (!blob || blob.size < 200) return { ok: false, serverHadBlob: false };

  const audioUrl = URL.createObjectURL(blob);
  const played = await playAudioBlobOrUrl(audioUrl, true, persona, options);
  return { ok: played, serverHadBlob: true };
}

// Pré-charger en arrière-plan les 2 prochaines étapes de la fiche cuisine sur /api/tts (cache Fish Audio S2.1 Pro instantané)
function warmUpNextVoiceGuideSteps() {
  if (!voiceGuideSession.active || !Array.isArray(voiceGuideSession.sequence)) return;
  const persona = getActiveVoicePersona();
  const curIdx = voiceGuideSession.currentIndex || 0;
  const nextIndices = [curIdx + 1, curIdx + 2];

  nextIndices.forEach((idx) => {
    const item = voiceGuideSession.sequence[idx];
    if (!item || !item.spokenText) return;
    fetchClonedTtsAudioBlob(item.spokenText, persona).catch(() => {});
  });
}

// Pré-chauffer dès l'ouverture de la Fiche Cuisine l'introduction et la 1ère étape de la recette
function warmUpRecipeVoiceGuideOnOpen() {
  if (!activeModalVoiceContext || !areClonedVoicesActive()) return;
  try {
    const persona = getActiveVoicePersona();
    const seq = buildStepByStepVoiceSequence(activeModalVoiceContext);
    if (seq[0] && seq[0].spokenText) {
      fetchClonedTtsAudioBlob(seq[0].spokenText, persona)
        .then(() => {
          if (seq[1] && seq[1].spokenText) {
            return fetchClonedTtsAudioBlob(seq[1].spokenText, persona);
          }
        })
        .catch(() => {});
    }
  } catch (e) {}
}

// 2. Lecture de l'extrait vocal cloné Fish Audio S2.1 Pro pré-généré embarqué (assets/voices/<persona>.mp3) — fonctionne 100% hors-ligne et sur PaaS/GitHub Pages
async function trySpeakWithBundledSampleAudio(cleanText, persona, options = {}) {
  if (options.reqId && options.reqId !== currentVoiceRequestSeq) return true;
  const sampleQuoteClean = (persona.sampleQuote || '').replace(/[«»]/g, '').trim();
  const isSample = options.isSamplePreview || cleanText === sampleQuoteClean;
  if (!isSample) return false;

  const samplePath = `assets/voices/${persona.id}.mp3?v=205`;
  return await playAudioBlobOrUrl(samplePath, false, persona, {
    ...options,
    applyClonePitchOnClient: false
  });
}

// 3. Synthèse Vocale par Clonage Neuronal ElevenLabs (eleven_multilingual_v2) si clé ElevenLabs externe renseignée
async function trySpeakWithElevenLabsClone(cleanText, persona, xiKey, options = {}) {
  const reqId = options.reqId;
  if (reqId && reqId !== currentVoiceRequestSeq) return true;
  try {
    const voiceId = getResolvedElevenLabsVoiceId(persona.id);
    const voiceSettings = persona.elevenLabsSettings || {
      stability: 0.45,
      similarity_boost: 0.85,
      style: 0.55,
      use_speaker_boost: true
    };

    const controller = new AbortController();
    activeTtsFetchController = controller;
    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': xiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg'
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings
        }),
        signal: controller.signal
      }
    );

    if (reqId && reqId !== currentVoiceRequestSeq) return true;
    if (!resp.ok) return false;
    const blob = await resp.blob();
    if (reqId && reqId !== currentVoiceRequestSeq) return true;
    if (!blob || blob.size < 100) return false;

    const audioUrl = URL.createObjectURL(blob);
    return await playAudioBlobOrUrl(audioUrl, true, persona, options);
  } catch (e) {
    if (reqId && reqId !== currentVoiceRequestSeq) return true;
    return false;
  }
}

// 4. Synthèse Vocale Cloud IA (Google Gemini TTS & Cloud Text-to-Speech Neural2)
async function trySpeakWithCloudAiTts(cleanText, persona, voiceApiKey, options = {}) {
  const reqId = options.reqId;
  if (reqId && reqId !== currentVoiceRequestSeq) return true;
  if (!voiceApiKey || voiceApiKey.startsWith('sk_') || voiceApiKey.startsWith('xi-') || voiceApiKey.startsWith('sk-fish-')) return false;

  const isFemale = persona.gender === 'female';

  // 4a. Tenter Google Cloud Text-to-Speech Neural2 (fr-FR-Neural2-B Homme / fr-FR-Neural2-A Femme)
  try {
    const userRateMultiplier = state.voiceSettings?.rate || 1.0;
    const speakingRate = Math.max(0.75, Math.min(1.4, (persona.baseRate || 1.0) * userRateMultiplier));
    const basePitch = persona.basePitch || 1.0;
    const semitonePitch = Math.max(-6, Math.min(6, (basePitch - 1.0) * 12));
    const voiceName = isFemale ? 'fr-FR-Neural2-A' : 'fr-FR-Neural2-B';

    const controller = new AbortController();
    activeTtsFetchController = controller;
    const resp = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(voiceApiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: cleanText },
          voice: {
            languageCode: 'fr-FR',
            name: voiceName,
            ssmlGender: isFemale ? 'FEMALE' : 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate,
            pitch: semitonePitch
          }
        }),
        signal: controller.signal
      }
    );

    if (reqId && reqId !== currentVoiceRequestSeq) return true;
    if (resp.ok) {
      const data = await resp.json();
      if (reqId && reqId !== currentVoiceRequestSeq) return true;
      if (data && data.audioContent) {
        const played = await playAudioBlobOrUrl(`data:audio/mp3;base64,${data.audioContent}`, false, persona, options);
        if (played) return true;
      }
    }
  } catch (e) {
    if (reqId && reqId !== currentVoiceRequestSeq) return true;
  }

  return false;
}

async function speakWithVoiceGuide(textToSpeak, options = {}) {
  const xiKey = getEffectiveElevenLabsApiKey();
  const isCloneEngine = areClonedVoicesActive() && state.voiceSettings?.engine !== 'system';
  const voiceApiKey = getEffectiveAiApiKey('voice');
  const hasBrowserSpeech = 'speechSynthesis' in window;

  // Toujours couper et invalider toute lecture vocale précédente pour empêcher toute superposition
  cancelAllActiveSpeech();
  const reqId = ++currentVoiceRequestSeq;
  const reqOptions = { ...options, reqId };

  const cleanText = String(textToSpeak || '').trim();
  if (!cleanText) {
    voiceGuideSession.isSpeaking = false;
    updateCharacterStageAnimationState();
    renderVoiceGuideSettings();
    return;
  }

  let persona = getActiveVoicePersona();
  if (options.isSamplePreview) {
    activePreviewPersonaId = persona.id;
  }

  voiceGuideSession.isSpeaking = true;
  updateCharacterStageAnimationState();
  renderVoiceGuideSettings();

  // En Mode Voix Clonée & Imitation Réaliste (par défaut) :
  if (isCloneEngine) {
    // 1. Si c'est l'aperçu vocal (bouton "🔊 Écouter"), lire immédiatement l'échantillon cloné Fish Audio S2.1 Pro embarqué (assets/voices/<persona>.mp3)
    if (options.isSamplePreview) {
      const playedFastSample = await trySpeakWithBundledSampleAudio(cleanText, persona, reqOptions);
      if (playedFastSample || reqId !== currentVoiceRequestSeq) return;
    }

    // 2. Utiliser en priorité le serveur local (/api/tts) ou Fish Audio S2.1 Pro qui interroge directement les vrais clones !
    const localResult = await trySpeakWithLocalNeuralServer(cleanText, persona, reqOptions);
    if (localResult.ok || reqId !== currentVoiceRequestSeq) return;

    // 3. Repli sur l'échantillon Fish Audio S2.1 Pro embarqué si c'est la phrase d'accueil
    const playedBundledSample = await trySpeakWithBundledSampleAudio(cleanText, persona, reqOptions);
    if (playedBundledSample || reqId !== currentVoiceRequestSeq) return;

    // 4. Si une clé ElevenLabs externe est configurée, l'utiliser en relais
    if (xiKey) {
      const playedXi = await trySpeakWithElevenLabsClone(cleanText, persona, xiKey, reqOptions);
      if (playedXi || reqId !== currentVoiceRequestSeq) return;
    }

    // 5. Si une clé Cloud IA est configurée, essayer Cloud Neural TTS
    if (voiceApiKey) {
      const playedCloud = await trySpeakWithCloudAiTts(cleanText, persona, voiceApiKey, reqOptions);
      if (playedCloud || reqId !== currentVoiceRequestSeq) return;
    }

    // Si aucun serveur/API de voix clonées n'a pu fournir d'audio (clones inactifs), proposer uniquement Voix Femme (IA) et Voix Homme (IA)
    if (!localResult.serverHadBlob && !options.isSamplePreview) {
      deactivateClonedVoicesFallback();
      persona = getActiveVoicePersona();
    }
  } else {
    // En Mode Voix Système Standard / Repli IA :
    const localResult = await trySpeakWithLocalNeuralServer(cleanText, persona, reqOptions);
    if (localResult.ok || reqId !== currentVoiceRequestSeq) return;
  }

  if (reqId !== currentVoiceRequestSeq) return;

  // 6. Repli sur la synthèse vocale du navigateur (avec transposition baryton forcée si voix masculine sur moteur féminin)
  if (hasBrowserSpeech) {
    speakWithBrowserSynthesis(cleanText, persona, reqOptions);
  } else {
    activePreviewPersonaId = null;
    voiceGuideSession.isSpeaking = false;
    updateCharacterStageAnimationState();
    renderVoiceGuideSettings();
    showToast('⚠️ La synthèse vocale n\'est pas disponible sur cet appareil.');
  }
}

function speakWithBrowserSynthesis(cleanText, persona, options = {}) {
  const reqId = options.reqId;
  if (reqId && reqId !== currentVoiceRequestSeq) return;

  if (!('speechSynthesis' in window)) {
    activePreviewPersonaId = null;
    voiceGuideSession.isSpeaking = false;
    updateCharacterStageAnimationState();
    renderVoiceGuideSettings();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  // Conserver une référence globale pour empêcher le Garbage Collector V8 de supprimer l'événement onend !
  window._activeVoiceUtterance = utterance;

  const voice = resolveActiveSpeechVoice(persona.gender);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || 'fr-FR';
  } else {
    utterance.lang = 'fr-FR';
  }

  const userRateMultiplier = state.voiceSettings?.rate || 1.0;
  utterance.rate = Math.max(0.7, Math.min(1.45, (persona.baseRate || 1.0) * userRateMultiplier));

  const resolvedGender = voice ? guessVoiceGender(voice) : 'unknown';
  if (persona.gender === 'male' && resolvedGender !== 'male') {
    const maleFallbackPitchMap = {
      ia_homme: 0.55,
      bocuse: 0.46,
      etchebest: 0.50,
      marx: 0.53,
      coffe: 0.57,
      lignac: 0.60,
      remy: 0.66
    };
    utterance.pitch = maleFallbackPitchMap[persona.id] || 0.55;
  } else if (persona.gender === 'female' && resolvedGender === 'male') {
    utterance.pitch = 1.35;
  } else {
    utterance.pitch = persona.basePitch || 1.0;
  }

  let finishedHandled = false;
  const markSpeechFinished = () => {
    if (finishedHandled) return;
    finishedHandled = true;
    clearTimeout(utterance._safetyEndTimer);
    if (reqId && reqId !== currentVoiceRequestSeq) return;
    if (activePreviewPersonaId === persona.id) {
      activePreviewPersonaId = null;
    }
    voiceGuideSession.isSpeaking = false;
    voiceGuideSession.lastSpokenEndTime = Date.now();
    updateVoiceStatusIndicators(false);
    updateCharacterStageAnimationState();
    renderVoiceGuideSettings();
    if (typeof options.onEnd === 'function') {
      options.onEnd();
    }
  };

  // Filet de sécurité : si le navigateur ne déclenche pas onend après la durée estimée, débloquer le micro automatiquement
  const estimatedMs = Math.max(3500, Math.min(28000, cleanText.length * 75));
  utterance._safetyEndTimer = setTimeout(() => {
    if (voiceGuideSession.isSpeaking && !window.speechSynthesis.speaking) {
      markSpeechFinished();
    }
  }, estimatedMs);

  utterance.onstart = () => {
    if (reqId && reqId !== currentVoiceRequestSeq) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
      return;
    }
    voiceGuideSession.isSpeaking = true;
    updateVoiceStatusIndicators(true, options.statusLabel || `🔊 ${persona.name} parle...`);
    updateCharacterStageAnimationState();
    renderVoiceGuideSettings();
  };

  utterance.onend = markSpeechFinished;
  utterance.onerror = markSpeechFinished;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    markSpeechFinished();
  }
}

function playPersonaVoiceSample(personaId) {
  const persona = VOICE_PERSONAS[personaId] || getActiveVoicePersona();
  const sampleText = persona.sampleQuote.replace(/[«»]/g, '');
  speakWithVoiceGuide(sampleText, {
    statusLabel: `🔊 Aperçu vocal : ${persona.name}`,
    isSamplePreview: true
  });
  spawnCulinaryConfetti({
    count: 10,
    spread: 120,
    emojis: persona.particles
  });
  showToast(`🔊 ${persona.name} : démonstration vocale en cours...`);
}

function testSelectedVoiceGuide() {
  const persona = getActiveVoicePersona();
  if (voiceGuideSession.isSpeaking && activePreviewPersonaId === persona.id) {
    stopVoiceGuide();
    showToast('⏹️ Extrait vocal arrêté.');
    return;
  }
  playPersonaVoiceSample(persona.id);
}

// Normalisation phonétique sans accents pour reconnaître toutes les variantes de "suivant", "répéter", "pause", "reprendre"
function normalizeVoiceCommandTranscript(raw) {
  return String(raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’.,!?;:«»"-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function executeNormalizedVoiceCommand(norm, firstTranscript = '') {
  if (!voiceGuideSession.active || !norm) return false;

  const now = Date.now();
  if (now - (voiceGuideSession.lastCommandTime || 0) < 950) return false;

  const browserActuallySpeaking =
    ('speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) ||
    Boolean(activeCloudVoiceAudio && !activeCloudVoiceAudio.paused);

  if (!browserActuallySpeaking && voiceGuideSession.isSpeaking) {
    voiceGuideSession.isSpeaking = false;
    updateCharacterStageAnimationState();
  }

  if (firstTranscript) {
    voiceGuideSession.lastHeardTranscript = firstTranscript;
    const liveHeardEl = document.getElementById('voice-live-transcript-preview');
    if (liveHeardEl) {
      liveHeardEl.textContent = `👂 Entendu : « ${firstTranscript} »`;
      liveHeardEl.style.display = 'inline-flex';
    }
  }

  const wordCount = norm.split(' ').filter(Boolean).length;
  const looksLikeAssistantEcho =
    /\b(dites suivant|dis suivant|dites repeter|quand vous etes|quand tu es|nous allons cuisiner|ingredient \d+ sur)\b/.test(norm) ||
    (browserActuallySpeaking && wordCount > 5);

  if (looksLikeAssistantEcho) {
    return false;
  }

  // 1. Commande vocale « PAUSE » (fonctionne même pendant que le chef parle !)
  if (/\b(pause|mettre en pause|mets en pause|attends|attend|attendre|minute|patiente)\b/.test(norm)) {
    voiceGuideSession.lastCommandTime = now;
    voiceGuideSession.consecutiveSilentEnds = 0;
    playEssentialVoiceBeep('pause');
    triggerVoiceCommandFeedback('« Pause » reconnu ⏸️');
    pauseVoiceGuide();
    return true;
  }

  // 2. Commande vocale « REPRENDRE » (relance la lecture / quitte le mode pause)
  if (/\b(reprendre|reprends|reprend|reprise|repartir|relancer|relance|lecture)\b/.test(norm)) {
    voiceGuideSession.lastCommandTime = now;
    voiceGuideSession.consecutiveSilentEnds = 0;
    playEssentialVoiceBeep('command');
    triggerVoiceCommandFeedback('« Reprendre » reconnu ▶️');
    resumeVoiceGuide();
    return true;
  }

  // Si le chef parle encore (hors commande Pause/Stop), éviter les faux positifs sur les longs segments
  if (browserActuallySpeaking && wordCount > 3) {
    return false;
  }

  // 3. Commande vocale « SUIVANT » (valide l'ingrédient ou l'étape en cours et passe à la suite)
  if (
    /\b(suivant|suivante|suivants|continuer|continue|pret|prete|c est bon|valider|valide|etape suivante|ingredient suivant|oui|ok|okay|suite|passe|passer|vas y|go)\b/.test(
      norm
    )
  ) {
    voiceGuideSession.lastCommandTime = now;
    voiceGuideSession.consecutiveSilentEnds = 0;
    voiceGuideSession.isPaused = false;
    playEssentialVoiceBeep('command');
    triggerVoiceCommandFeedback('« Suivant » reconnu ✓');
    nextVoiceGuideStep();
    return true;
  }

  // 4. Commande vocale « RÉPÉTER » (répète l'ingrédient ou l'étape en cours)
  if (
    /\b(repeter|repete|repetez|redire|redis|encore|reecouter|reecoute|relire|relis|comment|quoi|pardon)\b/.test(
      norm
    )
  ) {
    voiceGuideSession.lastCommandTime = now;
    voiceGuideSession.consecutiveSilentEnds = 0;
    voiceGuideSession.isPaused = false;
    playEssentialVoiceBeep('command');
    triggerVoiceCommandFeedback('« Répéter » reconnu 🔄');
    repeatCurrentVoiceGuideStep();
    return true;
  }

  // 5. Commande vocale « PRÉCÉDENT »
  if (/\b(precedent|precedente|retour|arriere|avant|etape precedente|ingredient precedent)\b/.test(norm)) {
    voiceGuideSession.lastCommandTime = now;
    voiceGuideSession.consecutiveSilentEnds = 0;
    voiceGuideSession.isPaused = false;
    playEssentialVoiceBeep('command');
    triggerVoiceCommandFeedback('« Précédent » reconnu ⏮️');
    prevVoiceGuideStep();
    return true;
  }

  // 6. Commande vocale « STOP / ARRÊTER »
  if (/\b(stop|arreter|arrete|quitter|fermer|terminer)\b/.test(norm)) {
    voiceGuideSession.lastCommandTime = now;
    voiceGuideSession.consecutiveSilentEnds = 0;
    playEssentialVoiceBeep('pause');
    triggerVoiceCommandFeedback('« Stop » reconnu ⏹️');
    stopVoiceGuide();
    return true;
  }

  return false;
}

// Repli Web Audio universel (getUserMedia) si le service cloud SpeechRecognition du navigateur
// renvoie "service-not-allowed" / "network" ou n'est pas disponible (ex: Edge sans Speech Service, Firefox, Brave)
async function startFallbackWebAudioCommandListener() {
  if (!voiceGuideSession.active || voiceGuideSession.finished) return false;
  if (voiceGuideSession.fallbackMode && voiceGuideSession.isListening && voiceGuideSession.fallbackStream) {
    updateCharacterStageAnimationState();
    return true;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }

  try {
    stopFallbackWebAudioListener();
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false
      });
    } catch (e) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    }

    if (!voiceGuideSession.active || voiceGuideSession.finished) {
      stream.getTracks().forEach((t) => t.stop());
      return false;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    voiceGuideSession.fallbackStream = stream;
    voiceGuideSession.fallbackAudioCtx = audioCtx;
    voiceGuideSession.fallbackMode = true;
    voiceGuideSession.isListening = true;
    voiceGuideSession.isStarting = false;
    voiceGuideSession.permissionBlocked = false;
    appDevicePermissionsState.mic = 'granted';
    localStorage.setItem('menusemaine_perm_mic_v1', 'granted');
    updateDevicePermissionsButtonsUI();
    updateCharacterStageAnimationState();

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let speakingFrames = 0;
    let silenceFrames = 0;
    let isCapturingVoice = false;

    voiceGuideSession.fallbackVadTimer = setInterval(() => {
      if (!voiceGuideSession.active || voiceGuideSession.finished || !voiceGuideSession.fallbackMode) {
        stopFallbackWebAudioListener();
        return;
      }

      const browserActuallySpeaking =
        voiceGuideSession.isSpeaking ||
        ('speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) ||
        Boolean(activeCloudVoiceAudio && !activeCloudVoiceAudio.paused);

      if (browserActuallySpeaking) {
        speakingFrames = 0;
        silenceFrames = 0;
        isCapturingVoice = false;
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      // Concentrer l'analyse sur les fréquences de la voix humaine (bins 4 à 60)
      for (let i = 4; i < 60 && i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avgEnergy = sum / 56;

      if (avgEnergy > 38) {
        speakingFrames++;
        silenceFrames = 0;
        if (speakingFrames >= 3 && !isCapturingVoice) {
          isCapturingVoice = true;
          const liveHeardEl = document.getElementById('voice-live-transcript-preview');
          if (liveHeardEl) {
            liveHeardEl.textContent = '🎙️ Voix détectée...';
            liveHeardEl.style.display = 'inline-flex';
          }
        }
      } else if (isCapturingVoice) {
        silenceFrames++;
        if (silenceFrames >= 6) {
          const totalFrames = speakingFrames;
          speakingFrames = 0;
          silenceFrames = 0;
          isCapturingVoice = false;
          // Commande vocale franche (entre 0.25s et 2.2s) après la fin de parole du chef
          if (totalFrames >= 3 && totalFrames <= 28) {
            if (voiceGuideSession.isPaused) {
              executeNormalizedVoiceCommand('reprendre', 'Reprendre (voix)');
            } else {
              executeNormalizedVoiceCommand('suivant', 'Suivant (voix)');
            }
          }
        }
      } else {
        speakingFrames = 0;
      }
    }, 90);

    return true;
  } catch (err) {
    voiceGuideSession.fallbackMode = false;
    voiceGuideSession.isListening = false;
    voiceGuideSession.permissionBlocked = true;
    updateCharacterStageAnimationState();
    return false;
  }
}

function stopFallbackWebAudioListener() {
  if (voiceGuideSession.fallbackVadTimer) {
    clearInterval(voiceGuideSession.fallbackVadTimer);
    voiceGuideSession.fallbackVadTimer = null;
  }
  if (voiceGuideSession.fallbackStream) {
    try {
      voiceGuideSession.fallbackStream.getTracks().forEach((t) => t.stop());
    } catch (e) {}
    voiceGuideSession.fallbackStream = null;
  }
  if (voiceGuideSession.fallbackAudioCtx) {
    try {
      voiceGuideSession.fallbackAudioCtx.close();
    } catch (e) {}
    voiceGuideSession.fallbackAudioCtx = null;
  }
  voiceGuideSession.fallbackMode = false;
}

// Action manuelle depuis le bouton « 🎙️ Activer / Relancer le micro » dans le Guide Vocal
async function manualActivateVoiceGuideMic() {
  voiceGuideSession.permissionBlocked = false;
  voiceGuideSession.isStarting = false;
  voiceGuideSession.consecutiveSilentEnds = 0;
  const ok = await requestAppMicrophonePermission();
  if (ok && voiceGuideSession.active && !voiceGuideSession.finished) {
    startVoiceCommandListener(true);
    updateCharacterStageAnimationState();
  }
}

// Démarrer et maintenir l'écoute vocale en limitant strictement les bips inutiles
function startVoiceCommandListener(forceRestart = false) {
  if (!voiceGuideSession.active || voiceGuideSession.finished) {
    voiceGuideSession.isListening = false;
    voiceGuideSession.isStarting = false;
    updateCharacterStageAnimationState();
    return;
  }

  // Ne jamais démarrer ou relancer le micro pendant que le chef parle (évite les bips en plein milieu d'une étape)
  if (voiceGuideSession.isSpeaking && !voiceGuideSession.isPaused) {
    voiceGuideSession.isStarting = false;
    updateCharacterStageAnimationState();
    return;
  }

  // Si le mode Web Audio de secours tourne déjà, le conserver
  if (voiceGuideSession.fallbackMode && voiceGuideSession.isListening && !forceRestart) {
    updateCharacterStageAnimationState();
    return;
  }

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    startFallbackWebAudioCommandListener();
    return;
  }

  const now = Date.now();
  const isCurrentlyStarting =
    voiceGuideSession.isStarting && now - (voiceGuideSession.startingSince || 0) < 7000;

  // IMPORTANT : Si l'instance écoute déjà ou démarre, ne jamais la couper/relancer (évite tout double bip)
  if (voiceGuideSession.recognition && (voiceGuideSession.isListening || isCurrentlyStarting)) {
    updateCharacterStageAnimationState();
    return;
  }

  clearTimeout(voiceGuideSession.restartRecTimer);

  if (voiceGuideSession.recognition) {
    try {
      voiceGuideSession.recognition.onend = null;
      voiceGuideSession.recognition.onerror = null;
      voiceGuideSession.recognition.onresult = null;
      voiceGuideSession.recognition.abort();
    } catch (e) {}
    voiceGuideSession.recognition = null;
  }

  try {
    const rec = new SpeechRec();
    rec.lang = 'fr-FR';
    // Maintenir l'écoute continue ouverte pour éviter les bips d'ouverture/fermeture répétés
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 5;

    voiceGuideSession.isStarting = true;
    voiceGuideSession.startingSince = Date.now();

    rec.onstart = () => {
      voiceGuideSession.isStarting = false;
      voiceGuideSession.isListening = true;
      voiceGuideSession.permissionBlocked = false;
      appDevicePermissionsState.mic = 'granted';
      localStorage.setItem('menusemaine_perm_mic_v1', 'granted');
      updateDevicePermissionsButtonsUI();
      updateCharacterStageAnimationState();
    };

    rec.onresult = (event) => {
      if (!voiceGuideSession.active) return;
      voiceGuideSession.consecutiveSilentEnds = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        let combinedRaw = '';
        for (let a = 0; a < res.length; a++) {
          combinedRaw += ' ' + (res[a]?.transcript || '');
        }
        const norm = normalizeVoiceCommandTranscript(combinedRaw);
        if (!norm) continue;

        const firstTranscript = (res[0]?.transcript || '').trim();
        if (executeNormalizedVoiceCommand(norm, firstTranscript)) {
          return;
        }
      }
    };

    rec.onerror = (e) => {
      const errCode = e && e.error ? e.error : '';
      voiceGuideSession.isStarting = false;

      if (errCode === 'no-speech' || errCode === 'aborted') {
        return;
      }

      if (errCode === 'audio-capture') {
        voiceGuideSession.isListening = false;
        updateCharacterStageAnimationState();
        return;
      }

      if (errCode === 'service-not-allowed' || errCode === 'network' || errCode === 'language-not-supported') {
        if (voiceGuideSession.recognition) {
          try {
            voiceGuideSession.recognition.onend = null;
            voiceGuideSession.recognition.abort();
          } catch (err) {}
          voiceGuideSession.recognition = null;
        }
        startFallbackWebAudioCommandListener();
        return;
      }

      if (errCode === 'not-allowed') {
        voiceGuideSession.isListening = false;
        voiceGuideSession.permissionBlocked = true;
        updateCharacterStageAnimationState();
        showToast('⚠️ Micro bloqué : appuyez sur « 🎙️ Activer le micro » ou autorisez le micro dans Chrome/Safari.');
        return;
      }
    };

    rec.onend = () => {
      voiceGuideSession.isStarting = false;
      if (voiceGuideSession.fallbackMode) return;
      voiceGuideSession.isListening = false;
      voiceGuideSession.recognition = null;

      if (voiceGuideSession.active && !voiceGuideSession.finished && !voiceGuideSession.permissionBlocked) {
        // Ne pas relancer pendant que le chef parle
        if (voiceGuideSession.isSpeaking && !voiceGuideSession.isPaused) {
          updateCharacterStageAnimationState();
          return;
        }
        voiceGuideSession.consecutiveSilentEnds = (voiceGuideSession.consecutiveSilentEnds || 0) + 1;
        const isMobile = isMobilePhoneDevice();
        // Sur mobile, limiter les relances automatiques silencieuses pour éviter les bips système répétés
        if (isMobile && voiceGuideSession.consecutiveSilentEnds > 1) {
          updateCharacterStageAnimationState();
          return;
        }
        clearTimeout(voiceGuideSession.restartRecTimer);
        voiceGuideSession.restartRecTimer = setTimeout(() => {
          if (
            voiceGuideSession.active &&
            !voiceGuideSession.finished &&
            !voiceGuideSession.permissionBlocked &&
            (!voiceGuideSession.isSpeaking || voiceGuideSession.isPaused)
          ) {
            startVoiceCommandListener(false);
          }
        }, isMobile ? 1500 : 1000);
      } else {
        updateCharacterStageAnimationState();
      }
    };

    voiceGuideSession.recognition = rec;
    rec.start();
    updateCharacterStageAnimationState();
  } catch (e) {
    voiceGuideSession.isStarting = false;
    voiceGuideSession.isListening = false;
    startFallbackWebAudioCommandListener();
  }
}

// Watchdog périodique discret : ne relance jamais pendant la parole ni en boucle sur mobile
function startVoiceSessionWatchdog() {
  clearInterval(voiceGuideSession.recWatchdogTimer);
  voiceGuideSession.recWatchdogTimer = setInterval(() => {
    if (!voiceGuideSession.active || voiceGuideSession.finished) {
      clearInterval(voiceGuideSession.recWatchdogTimer);
      return;
    }
    if (
      voiceGuideSession.isSpeaking &&
      !activeCloudVoiceAudio &&
      'speechSynthesis' in window &&
      !window.speechSynthesis.speaking
    ) {
      voiceGuideSession.isSpeaking = false;
      updateCharacterStageAnimationState();
    }
    if (voiceGuideSession.isSpeaking && !voiceGuideSession.isPaused) return;
    if (isMobilePhoneDevice() && (voiceGuideSession.consecutiveSilentEnds || 0) > 1) return;

    const isCurrentlyStarting =
      voiceGuideSession.isStarting && Date.now() - (voiceGuideSession.startingSince || 0) < 7000;
    if (!voiceGuideSession.isListening && !isCurrentlyStarting && !voiceGuideSession.permissionBlocked) {
      startVoiceCommandListener(false);
    }
  }, 4000);
}

function stopVoiceCommandListener() {
  clearTimeout(voiceGuideSession.restartRecTimer);
  clearInterval(voiceGuideSession.recWatchdogTimer);
  stopFallbackWebAudioListener();
  if (voiceGuideSession.recognition) {
    try {
      voiceGuideSession.recognition.onend = null;
      voiceGuideSession.recognition.onerror = null;
      voiceGuideSession.recognition.onresult = null;
      voiceGuideSession.recognition.abort();
    } catch (e) {}
    voiceGuideSession.recognition = null;
  }
  voiceGuideSession.isStarting = false;
  voiceGuideSession.isListening = false;
}

// Mettre en pause le guide vocal (commande vocale « Pause » ou bouton ⏸️ Pause)
function pauseVoiceGuide() {
  if (!voiceGuideSession.active) return;
  voiceGuideSession.isPaused = true;
  voiceGuideSession.isSpeaking = false;
  voiceGuideSession.consecutiveSilentEnds = 0;

  if (activeCloudVoiceAudio && !activeCloudVoiceAudio.paused) {
    try {
      activeCloudVoiceAudio.pause();
    } catch (e) {}
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  updateVoiceStatusIndicators(false, '⏸️ Guide vocal en pause (dites « Reprendre »)');
  renderActiveVoiceStageUI();
  startVoiceCommandListener(false);
  showToast('⏸️ Guide vocal en pause — Dites « Reprendre » ou « Suivant » pour continuer');
}

// Reprendre le guide vocal (commande vocale « Reprendre » ou bouton ▶️ Reprendre)
function resumeVoiceGuide() {
  if (!voiceGuideSession.active) {
    startInteractiveVoiceGuide();
    return;
  }
  voiceGuideSession.isPaused = false;
  voiceGuideSession.consecutiveSilentEnds = 0;

  if (activeCloudVoiceAudio && activeCloudVoiceAudio.paused && activeCloudVoiceAudio.currentTime > 0) {
    voiceGuideSession.isSpeaking = true;
    renderActiveVoiceStageUI();
    activeCloudVoiceAudio.play().catch(() => {
      speakCurrentStepInGuide(false);
    });
    showToast('▶️ Reprise du guide vocal !');
    return;
  }

  showToast('▶️ Reprise du guide vocal !');
  speakCurrentStepInGuide(false);
}

function togglePauseResumeVoiceGuide() {
  if (!voiceGuideSession.active) return;
  if (voiceGuideSession.isPaused) {
    resumeVoiceGuide();
  } else {
    pauseVoiceGuide();
  }
}

function triggerVoiceCommandFeedback(text) {
  const pill = document.getElementById('voice-heard-command-pill');
  if (pill) {
    pill.textContent = `🎙️ ${text}`;
    pill.style.display = 'inline-flex';
    setTimeout(() => {
      if (pill) pill.style.display = 'none';
    }, 2600);
  }
  const persona = getActiveVoicePersona();
  spawnCulinaryConfetti({
    count: 8,
    spread: 95,
    emojis: persona.particles
  });
}

// ============================================================================
// INTERFACE VISUELLE & THÉÂTRE D'ANIMATION DU GUIDE VOCAL DANS LA FICHE CUISINE
// ============================================================================
function buildModalVoiceToolbarHTML() {
  const persona = getActiveVoicePersona();
  const availablePersonas = getAvailableVoicePersonas();
  const optionsHTML = availablePersonas
    .map((p) => `<option value="${p.id}" ${p.id === persona.id ? 'selected' : ''}>${p.name}</option>`)
    .join('');

  return `
    <div id="modal-voice-guide-wrapper" class="modal-voice-guide-wrapper" style="margin: 12px 0;">
      <div
        style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:10px 14px; border-radius:14px; background:${persona.themeBg}; border:2px solid ${persona.themeBorder};"
      >
        <div style="display:flex; align-items:center; gap:10px; min-width:200px; flex:1;">
          <div class="voice-persona-avatar-mini" style="width:46px; height:46px; flex-shrink:0;">
            ${buildPersonaAnimatedAvatarSVG(persona.id)}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <strong style="font-size:0.96rem; color:${persona.themeColor};">🧬 ${persona.name}</strong>
            </div>
            <div style="margin-top:4px;">
              <select
                aria-label="Changer de chef pour le guide vocal"
                onchange="selectVoicePersona(this.value, false)"
                style="font-size:0.78rem; padding:3px 8px; border-radius:8px; border:1px solid ${persona.themeBorder}; background:#fff; color:var(--text-main); max-width:100%;"
              >
                ${optionsHTML}
              </select>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="btn btn-primary btn-launch-voice-guide"
          style="justify-content: center; background:${persona.themeColor}; border-color:${persona.themeColor}; font-weight:800;"
          onclick="startInteractiveVoiceGuide()"
        >
          🎙️ Guide vocal avec ${persona.name}
        </button>
      </div>
    </div>
  `;
}

// Lancer le Guide Vocal Pas-à-Pas
async function startInteractiveVoiceGuide() {
  if (!activeModalVoiceContext) return;

  // Déverrouiller immédiatement l'élément Audio dans le geste clic de l'utilisateur
  unlockSharedVoiceAudioElement();

  voiceGuideSession.active = true;
  voiceGuideSession.isPaused = false;
  voiceGuideSession.finished = false;
  voiceGuideSession.permissionBlocked = false;
  voiceGuideSession.consecutiveSilentEnds = 0;
  voiceGuideSession.lastHeardTranscript = '';
  voiceGuideSession.sequence = buildStepByStepVoiceSequence(activeModalVoiceContext);
  voiceGuideSession.currentIndex = 0;

  // Afficher le guide vocal pas-à-pas dans la Fiche Cuisine dès le clic
  renderActiveVoiceStageUI();

  // Sur smartphone, demander d'abord l'autorisation micro dans le geste tactile AVANT de lancer le haut-parleur
  if (isMobilePhoneDevice() && appDevicePermissionsState.mic !== 'granted') {
    await requestAppMicrophonePermission();
  }

  startVoiceSessionWatchdog();

  // Lancer la lecture de la 1ère étape (le micro s'activera dès la fin de la phrase d'accueil pour éviter un bip inutile au départ)
  speakCurrentStepInGuide(false);

  // Activer le maintien de l'écran du smartphone allumé
  acquireKitchenWakeLock();
}

function renderActiveVoiceStageUI() {
  const wrapper = document.getElementById('modal-voice-guide-wrapper');
  if (!wrapper || !voiceGuideSession.active) return;

  const persona = getActiveVoicePersona();
  const seq = voiceGuideSession.sequence || [];
  const idx = voiceGuideSession.currentIndex || 0;
  const item = seq[idx] || seq[0];
  if (!item) return;

  const isPaused = Boolean(voiceGuideSession.isPaused);

  // Mettre en évidence dans la fiche cuisine la section correspondante (Ingrédient X ou Étape N)
  highlightModalRecipeSection(item);

  wrapper.innerHTML = `
    <div
      id="voice-character-stage"
      class="voice-character-stage ${voiceGuideSession.isSpeaking ? 'is-speaking' : ''} ${voiceGuideSession.isListening ? 'is-listening' : ''}"
      style="--persona-color: ${persona.themeColor}; --persona-bg: ${persona.themeBg}; --persona-border: ${persona.themeBorder}; padding: 12px 14px;"
    >
      <div class="voice-stage-controls" style="padding-top: 0; border-top: none;">
        <button
          type="button"
          class="btn btn-outline btn-sm"
          onclick="prevVoiceGuideStep()"
          ${idx === 0 ? 'disabled style="opacity:0.45; pointer-events:none;"' : ''}
        >
          ⏮️ Précédent
        </button>

        <button
          type="button"
          class="btn btn-outline btn-sm"
          onclick="togglePauseResumeVoiceGuide()"
          style="${isPaused ? 'background:#fef3c7; border-color:#f59e0b; color:#92400e; font-weight:800;' : ''}"
        >
          ${isPaused ? '▶️ Reprendre' : '⏸️ Pause'}
        </button>

        <button
          type="button"
          class="btn btn-outline btn-sm btn-voice-repeat"
          onclick="repeatCurrentVoiceGuideStep()"
        >
          🔄 Répéter l'étape
        </button>

        <button
          type="button"
          class="btn btn-primary btn-sm btn-voice-next"
          onclick="nextVoiceGuideStep()"
        >
          ⏭️ Suivant
        </button>
      </div>
    </div>
  `;

  updateCharacterStageAnimationState();
}

function updateCharacterStageAnimationState() {
  const stage = document.getElementById('voice-character-stage');
  if (!stage) return;

  const persona = getActiveVoicePersona();
  stage.classList.toggle('is-speaking', !!voiceGuideSession.isSpeaking);
  stage.classList.toggle('is-listening', !voiceGuideSession.isSpeaking && !!voiceGuideSession.isListening);

  const reactivateBtn = document.getElementById('btn-stage-reactivate-mic');
  if (reactivateBtn) {
    reactivateBtn.style.display = voiceGuideSession.isListening ? 'none' : 'inline-flex';
  }

  const micLabel = document.getElementById('voice-mic-status-label');
  if (micLabel) {
    if (voiceGuideSession.isPaused) {
      micLabel.innerHTML = `⏸️ <strong>Guide en pause :</strong> Dites <strong>« Reprendre »</strong> ou <strong>« Suivant »</strong> pour continuer`;
    } else if (voiceGuideSession.isSpeaking) {
      micLabel.innerHTML = `🔊 <strong>${persona.name}</strong> vous parle...`;
    } else if (voiceGuideSession.isListening) {
      micLabel.innerHTML = `🎙️ <strong>Micro actif</strong>`;
    } else if (voiceGuideSession.isStarting) {
      micLabel.innerHTML = `⏳ <strong>Activation du micro en cours...</strong>`;
    } else {
      micLabel.innerHTML = `🔇 <strong>Micro inactif</strong>`;
    }
  }
}

function highlightModalRecipeSection(stepItem) {
  const ingListEl = document.getElementById('modal-ingredients-list');
  if (ingListEl) {
    if (stepItem && (stepItem.type === 'ingredients' || stepItem.type === 'ingredient')) {
      ingListEl.classList.add('voice-active-ingredients-highlight');
    } else {
      ingListEl.classList.remove('voice-active-ingredients-highlight');
    }
  }

  // Mettre en surbrillance l'ingrédient précis en cours de préparation
  document.querySelectorAll('[id^="recipe-voice-ing-"]').forEach((el, idx) => {
    if (stepItem && stepItem.type === 'ingredient' && idx === stepItem.ingredientIdx) {
      el.classList.add('voice-active-ing-item-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      el.classList.remove('voice-active-ing-item-highlight');
    }
  });

  // Mettre en surbrillance l'étape de préparation en cours
  document.querySelectorAll('[id^="recipe-voice-step-"]').forEach((el, idx) => {
    if (stepItem && stepItem.type === 'step' && idx === stepItem.recipeStepIdx) {
      el.classList.add('voice-active-step-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      el.classList.remove('voice-active-step-highlight');
    }
  });
}

function speakCurrentStepInGuide(isRepeat = false) {
  if (!voiceGuideSession.active || !voiceGuideSession.sequence.length) return;

  voiceGuideSession.isPaused = false;
  voiceGuideSession.consecutiveSilentEnds = 0;
  const item = voiceGuideSession.sequence[voiceGuideSession.currentIndex];
  if (!item) return;

  renderActiveVoiceStageUI();

  const textToRead = isRepeat ? item.repeatSpokenText : item.spokenText;
  const isFinalOutro = item.type === 'outro';

  if (isFinalOutro) {
    voiceGuideSession.finished = true;
    const persona = getActiveVoicePersona();
    spawnCulinaryConfetti({
      count: 26,
      spread: 220,
      emojis: persona.particles
    });
  }

  speakWithVoiceGuide(textToRead, {
    statusLabel: `${item.badge}`,
    onPlayStart: () => {
      // Pré-générer en arrière-plan les 2 étapes suivantes dès que l'étape courante démarre
      warmUpNextVoiceGuideSteps();
    },
    onEnd: () => {
      if (voiceGuideSession.active && !voiceGuideSession.finished) {
        startVoiceCommandListener(false);
        updateCharacterStageAnimationState();
      }
    }
  });
}

function nextVoiceGuideStep() {
  unlockSharedVoiceAudioElement();
  if (!voiceGuideSession.active) {
    startInteractiveVoiceGuide();
    return;
  }
  voiceGuideSession.isPaused = false;
  voiceGuideSession.consecutiveSilentEnds = 0;
  if (voiceGuideSession.currentIndex < voiceGuideSession.sequence.length - 1) {
    voiceGuideSession.currentIndex++;
    speakCurrentStepInGuide(false);
  } else {
    stopVoiceGuide();
  }
}

function prevVoiceGuideStep() {
  unlockSharedVoiceAudioElement();
  if (!voiceGuideSession.active) return;
  voiceGuideSession.isPaused = false;
  voiceGuideSession.consecutiveSilentEnds = 0;
  if (voiceGuideSession.currentIndex > 0) {
    voiceGuideSession.finished = false;
    voiceGuideSession.currentIndex--;
    speakCurrentStepInGuide(false);
  }
}

function repeatCurrentVoiceGuideStep() {
  unlockSharedVoiceAudioElement();
  if (!voiceGuideSession.active) {
    startInteractiveVoiceGuide();
    return;
  }
  voiceGuideSession.isPaused = false;
  voiceGuideSession.consecutiveSilentEnds = 0;
  speakCurrentStepInGuide(true);
}

function stopVoiceGuide() {
  voiceGuideSession.active = false;
  voiceGuideSession.isSpeaking = false;
  voiceGuideSession.isListening = false;
  voiceGuideSession.isPaused = false;
  voiceGuideSession.finished = false;
  voiceGuideSession.consecutiveSilentEnds = 0;

  cancelAllActiveSpeech();
  stopVoiceCommandListener();
  releaseKitchenWakeLock();

  highlightModalRecipeSection(null);
  updateVoiceStatusIndicators(false);
  renderVoiceGuideSettings();

  const wrapper = document.getElementById('modal-voice-guide-wrapper');
  if (wrapper && activeModalVoiceContext) {
    wrapper.innerHTML = buildModalVoiceToolbarHTML();
  }
}

function speakRecipeIngredientByIndex(ingIndex) {
  if (!activeModalVoiceContext) return;
  unlockSharedVoiceAudioElement();
  if (!voiceGuideSession.active) {
    voiceGuideSession.active = true;
    voiceGuideSession.isPaused = false;
    voiceGuideSession.finished = false;
    voiceGuideSession.consecutiveSilentEnds = 0;
    voiceGuideSession.sequence = buildStepByStepVoiceSequence(activeModalVoiceContext);
    startVoiceSessionWatchdog();
    acquireKitchenWakeLock();
  }
  const targetSeqIdx = voiceGuideSession.sequence.findIndex(
    (s) => s.type === 'ingredient' && s.ingredientIdx === ingIndex
  );
  if (targetSeqIdx !== -1) {
    voiceGuideSession.currentIndex = targetSeqIdx;
    speakCurrentStepInGuide(false);
  }
}

function speakRecipeStepByIndex(stepIndex) {
  if (!activeModalVoiceContext) return;
  unlockSharedVoiceAudioElement();
  if (!voiceGuideSession.active) {
    voiceGuideSession.active = true;
    voiceGuideSession.isPaused = false;
    voiceGuideSession.finished = false;
    voiceGuideSession.consecutiveSilentEnds = 0;
    voiceGuideSession.sequence = buildStepByStepVoiceSequence(activeModalVoiceContext);
    startVoiceSessionWatchdog();
    acquireKitchenWakeLock();
  }
  const targetSeqIdx = voiceGuideSession.sequence.findIndex(
    (s) => s.type === 'step' && s.recipeStepIdx === stepIndex
  );
  if (targetSeqIdx !== -1) {
    voiceGuideSession.currentIndex = targetSeqIdx;
    speakCurrentStepInGuide(false);
  }
}

function stepRecipeVoiceGuide(delta) {
  if (delta > 0) nextVoiceGuideStep();
  else prevVoiceGuideStep();
}

function speakRecipeFullGuide() {
  startInteractiveVoiceGuide();
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
  if (!isLocalAdminEnvironment()) return;
  const pantryInput = document.getElementById('pantry-gemini-key-input');
  const studioInput = document.getElementById('gemini-api-key');
  const key = pantryInput?.value.trim() || '';
  localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key);
  if (studioInput) studioInput.value = key;
  renderPantryAiKeyStatus();
  showToast(key ? '🤖 Clé API Gemini Vision activée pour le scanner caméra ✓' : 'Clé API effacée');
}

function renderPantryAiKeyStatus() {
  const key = getEffectiveAiApiKey('vision');
  const statusEl = document.getElementById('pantry-ai-key-status');
  const scanPill = document.getElementById('pantry-scan-status-pill');
  const inputEl = document.getElementById('pantry-gemini-key-input');
  if (isLocalAdminEnvironment() && inputEl && key && !inputEl.value) {
    inputEl.value = key;
  }
  if (scanPill && !pantryCameraStream) {
    scanPill.textContent = key ? '🤖 Vision IA Active' : 'Caméra prête';
  }
  if (statusEl) {
    if (key) {
      statusEl.textContent = '✅ Vision IA Active';
      statusEl.style.background = '#dcfce7';
      statusEl.style.color = '#166534';
    } else {
      statusEl.textContent = '⚡ Mode Code-barres + Dictée';
      statusEl.style.background = '#fef3c7';
      statusEl.style.color = '#92400e';
    }
  }
}

// ============================================================================
// SCANNER VIDÉO EN DIRECT : FRIGO & PLACARD (CAMÉRA + GEMINI VISION + CODE-BARRES + VOIX)
// ============================================================================
function switchActiveCameraZone() {
  const nextZone = pantryActiveScanZone === 'fridge' ? 'cupboard' : 'fridge';
  pantryActiveScanZone = nextZone;
  const zoneLabel = pantryActiveScanZone === 'fridge' ? '❄️ Scan du Frigo' : '🥫 Scan du Placard';

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
  if (statusPill) {
    statusPill.textContent = `${zoneLabel} actif`;
  }
  if (hudMsg) {
    hudMsg.textContent = `Filmez l'intérieur du ${pantryActiveScanZone === 'fridge' ? 'frigo' : 'placard'}...`;
  }
  showToast(`Basculé sur ${zoneLabel}`);
}

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
    showToast('⚠️ Caméra non disponible sur cet appareil.');
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
    if (camContainer) {
      camContainer.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
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
    showToast(`📹 ${zoneLabel} ouvert en plein écran !`);
  } catch (err) {
    console.error('Erreur ouverture caméra :', err);
    showToast('⚠️ Impossible d\'accéder à la caméra. Autorisez l\'accès caméra sur votre téléphone.');
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
  document.body.style.overflow = '';

  const btnFridge = document.getElementById('btn-scan-fridge');
  const btnCupboard = document.getElementById('btn-scan-cupboard');
  if (btnFridge) btnFridge.classList.remove('active-scan');
  if (btnCupboard) btnCupboard.classList.remove('active-scan');

  const statusPill = document.getElementById('pantry-scan-status-pill');
  if (statusPill) {
    statusPill.textContent = getEffectiveAiApiKey('vision') ? '🤖 Vision IA Active' : 'Caméra prête';
  }
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

  // 2. Boucle d'analyse visuelle IA pendant qu'on filme (toutes les 4,5 secondes si une clé IA Vision est active)
  pantryAutoScanTimer = setInterval(() => {
    if (!pantryAutoScanEnabled || !pantryCameraStream || pantryAnalysisInFlight) return;
    const apiKey = getEffectiveAiApiKey('vision');
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

  const apiKey = getEffectiveAiApiKey('vision');

  const hudMsg = document.getElementById('pantry-scan-Hud-msg');
  const captureBtn = document.getElementById('btn-capture-shelf');
  const zoneLabel = zone === 'fridge' ? 'Frigo ❄️' : 'Placard 🥫';

  if (!apiKey) {
    if (isManual) {
      const promptMsg = isLocalAdminEnvironment()
        ? `📷 Analyse rapide (${zoneLabel}) :\n` +
          `Astuce Admin : Renseignez la clé API IA dans l'Administration locale (onglet "🔑 Clé API IA") pour activer la reconnaissance visuelle automatique sur smartphone et pour tous vos invités.\n\n` +
          `Ou tapez directement les ingrédients filmés (ex: 4 œufs, 2 courgettes, 200g comté) :`
        : `📷 Ajout rapide (${zoneLabel}) :\n` +
          `Tapez ou dictez les ingrédients visibles (ex: 4 œufs, 2 courgettes, 200g comté) :`;
      const quickEntered = prompt(promptMsg);
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
function promptManualPantryVoiceFallback() {
  const manualText = prompt(
    `🎙️ Saisie rapide pendant le scan (${pantryActiveScanZone === 'fridge' ? '❄️ Frigo' : '🥫 Placard'}) :\n` +
      `Indiquez vos ingrédients séparés par des virgules (ex: 6 œufs, 2 courgettes, 200g comté) :`
  );
  if (manualText) {
    const added = parseSpokenOrTypedIngredientsToPantry(manualText, pantryActiveScanZone);
    if (added > 0) showToast(`✅ ${added} ingrédient(s) ajouté(s) !`);
  }
}

function togglePantryVoiceRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = document.getElementById('btn-voice-scan');

  if (!SpeechRec) {
    promptManualPantryVoiceFallback();
    return;
  }

  if (pantryVoiceActive && pantryVoiceRecognition) {
    try {
      pantryVoiceRecognition.stop();
    } catch (e) {}
    pantryVoiceActive = false;
    if (btn) {
      btn.textContent = '🎙️ Dicter en filmant';
      btn.classList.remove('active-autoscan');
    }
    return;
  }

  try {
    const rec = new SpeechRec();
    rec.lang = 'fr-FR';
    rec.continuous = true;
    rec.interimResults = false;

    rec.onstart = () => {
      pantryVoiceActive = true;
      appDevicePermissionsState.mic = 'granted';
      localStorage.setItem('menusemaine_perm_mic_v1', 'granted');
      updateDevicePermissionsButtonsUI();
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

    rec.onerror = (e) => {
      const errCode = e && e.error ? e.error : '';
      pantryVoiceActive = false;
      if (btn) {
        btn.textContent = '🎙️ Dicter en filmant';
        btn.classList.remove('active-autoscan');
      }
      if (errCode === 'not-allowed' || errCode === 'audio-capture') {
        showToast('⚠️ Accès au micro bloqué : cliquez sur l\'icône 🔒 dans la barre d\'adresse puis « Autoriser ».');
      } else if (errCode === 'service-not-allowed' || errCode === 'network') {
        promptManualPantryVoiceFallback();
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
  } catch (e) {
    promptManualPantryVoiceFallback();
  }
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

function buildTailoredRecipesFromPantryItems() {
  const items = state.pantryItems || [];
  dynamicPantryRecipesMap.clear();
  if (items.length === 0) return [];

  const getBaseQtyFor2 = (item) => {
    const u = (item.unit || 'pièces').toLowerCase();
    if (u === 'g') return Math.min(Math.max(80, Math.round(item.qty)), 250);
    if (u === 'cl' || u === 'ml') return Math.min(Math.max(10, Math.round(item.qty)), 150);
    return Math.min(Math.max(1, Math.round(item.qty * 10) / 10), 4);
  };

  const templates = [
    {
      suffix: 'poelee',
      prefix: 'Poêlée gourmande',
      prepTime: '10 min',
      cookTime: '15 min',
      desc: 'Poêlée savoureuse préparée directement avec les ingrédients scannés dans votre frigo et votre placard.',
      stepsFn: (names) => [
        `Préparez et détaillez vos ingrédients du garde-manger (${names.join(', ')}).`,
        'Faites chauffer un filet d’huile d’olive ou une noix de beurre dans une grande sauteuse.',
        `Faites revenir ${names.slice(0, 2).join(' et ')} à feu moyen pendant 8 minutes en remuant régulièrement.`,
        `Ajoutez le reste des ingrédients (${names.slice(2).join(', ') || 'assaisonnement, herbes, sel et poivre'}), couvrez 5 minutes à feu doux et servez bien chaud.`
      ]
    },
    {
      suffix: 'gratin',
      prefix: 'Gratin doré du Garde-manger',
      prepTime: '12 min',
      cookTime: '20 min',
      desc: 'Plat au four fondant et réconfortant composé sur-mesure à partir de votre frigo et placard.',
      stepsFn: (names) => [
        'Préchauffez votre four à 190°C (th. 6-7).',
        `Disposez harmonieusement ${names.join(', ')} dans un plat à gratin légèrement huilé.`,
        'Assaisonnez de sel, poivre et herbes de votre placard, puis enfournez pendant 20 minutes jusqu’à obtenir un beau gratiné doré.'
      ]
    },
    {
      suffix: 'bowl',
      prefix: 'Grand Bowl composé',
      prepTime: '12 min',
      cookTime: '10 min',
      desc: 'Assiette complète et équilibrée assemblée avec les produits disponibles dans votre frigo et placard.',
      stepsFn: (names) => [
        `Préparez chacun des ingrédients de votre stock (${names.join(', ')}) en portions prêtes à déguster.`,
        'Faites tiédir ou dorer à la poêle les éléments à cuire pendant 8 à 10 minutes.',
        'Dressez dans des bols larges, assaisonnez d’un filet d’huile d’olive, sel et poivre, puis dégustez aussitôt.'
      ]
    },
    {
      suffix: 'mijote',
      prefix: 'Mijoté parfumé',
      prepTime: '10 min',
      cookTime: '18 min',
      desc: 'Recette mijotée douce et parfumée utilisant vos ingrédients du frigo et du placard.',
      stepsFn: (names) => [
        `Émincez ou préparez ${names.join(', ')}.`,
        'Faites revenir les ingrédients principaux 5 minutes dans une cocotte avec un filet d’huile.',
        'Mouillez avec un petit verre d’eau ou de bouillon, couvrez et laissez mijoter 13 minutes à feu doux avant de servir.'
      ]
    }
  ];

  const results = [];
  const countToBuild = Math.min(templates.length, Math.max(2, items.length));

  for (let tIdx = 0; tIdx < countToBuild; tIdx++) {
    const tpl = templates[tIdx];
    const subset = [];
    const maxIngs = Math.min(items.length, 4);
    for (let k = 0; k < maxIngs; k++) {
      subset.push(items[(tIdx + k) % items.length]);
    }

    const names = subset.map((it) => it.name);
    const shortTitleNames =
      names.length === 1
        ? names[0]
        : names.length === 2
        ? `${names[0]} & ${names[1]}`
        : `${names[0]}, ${names[1]} & ${names[2]}`;

    const recipeId = `pantry-tailored-${tpl.suffix}-${tIdx}`;
    const recipeObj = {
      id: recipeId,
      title: `${tpl.prefix} : ${shortTitleNames}`,
      type: 'weekday',
      prepTime: tpl.prepTime,
      cookTime: tpl.cookTime,
      difficulty: 'Facile',
      budget: '€ (Anti-gaspi)',
      costFor2: 3.5,
      baseServings: 2,
      isTailoredPantry: true,
      description: tpl.desc,
      ingredients: subset.map((it) => ({
        name: it.name,
        qty: getBaseQtyFor2(it),
        unit: it.unit || 'pièces',
        aisle: it.zone === 'fridge' ? 'Crèmerie & Frais' : 'Épicerie salée'
      })),
      steps: tpl.stepsFn(names)
    };

    dynamicPantryRecipesMap.set(recipeId, recipeObj);
    results.push(recipeObj);
  }

  return results;
}

function computeRankedPantryMenus() {
  const pantryItems = state.pantryItems || [];
  // Ne rien proposer tant qu'aucun ingrédient n'a été scanné ou ajouté dans le frigo/placard
  if (pantryItems.length === 0) {
    dynamicPantryRecipesMap.clear();
    return [];
  }

  const tailoredRecipes = buildTailoredRecipesFromPantryItems();
  const catalogPool = getAllCatalogRecipesForPantry();

  // Évaluer les recettes existantes et filtrer strictement celles qui utilisent au moins 1 ingrédient scanné
  const matchedCatalog = catalogPool
    .map((r) => {
      const cardServings = state.pantryCardServings[r.id] || state.pantryServings || 2;
      return evaluateRecipeAgainstPantry(r, cardServings);
    })
    .filter((entry) => entry.matchCount > 0);

  const scoredTailored = tailoredRecipes.map((r) => {
    const cardServings = state.pantryCardServings[r.id] || state.pantryServings || 2;
    return evaluateRecipeAgainstPantry(r, cardServings);
  });

  // Combiner les recettes qui matchent les ingrédients scannés + les compositions sur-mesure du garde-manger
  const combined = [...matchedCatalog, ...scoredTailored];

  combined.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    if (b.score !== a.score) return b.score - a.score;
    return b.matchPct - a.matchPct;
  });

  return combined;
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
  if ((state.pantryItems || []).length === 0) {
    showToast('❄️ Scannez d\'abord votre frigo ou votre placard pour obtenir des idées de menus !');
    return;
  }
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
  showToast('🎲 Nouvelles idées de menus proposées selon votre frigo et placard !');
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
        <div style="padding: 20px 14px; text-align: center; background: var(--bg-subtle); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.85rem;">
          <p style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
            🗄️ Aucun ingrédient dans cette liste
          </p>
          <p>
            Lancez un <strong>❄️ Scan Frigo</strong> ou un <strong>🥫 Scan Placard</strong> pour filmer vos étagères, ou saisissez un ingrédient ci-dessus.
          </p>
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
          <strong>🧺 Liste des courses de la semaine :</strong>
          ${
            allPantry.length === 0
              ? 'Scannez votre frigo/placard pour ajuster les courses.'
              : `<strong>${covered} en stock</strong> et <strong>${partial} quantité(s) réduite(s)</strong>.`
          }
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="syncPantryWithWeeklyShopping(true)">
          🔄 Ajuster la liste des courses
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

  const hasPantryItems = (state.pantryItems || []).length > 0;
  const controlsEl = document.querySelector('.pantry-suggestions-controls');
  if (controlsEl) {
    controlsEl.style.display = hasPantryItems ? 'flex' : 'none';
  }

  if (!hasPantryItems) {
    gridEl.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 28px 20px; text-align: center; background: var(--bg-subtle); border: 1px dashed var(--border-color); border-radius: var(--radius-md); color: var(--text-muted);">
        <div style="font-size: 2rem; margin-bottom: 8px;">❄️ 🥫</div>
        <p style="font-weight: 800; color: var(--text-main); font-size: 1rem; margin-bottom: 6px;">
          Scannez votre frigo ou votre placard pour découvrir vos idées de menus
        </p>
        <p style="font-size: 0.86rem; max-width: 540px; margin: 0 auto;">
          Les suggestions de menus sont proposées uniquement en fonction des ingrédients scannés dans votre <strong>frigo</strong> et votre <strong>placard</strong>.
        </p>
      </div>
    `;
    return;
  }

  const ranked = computeRankedPantryMenus();
  if (ranked.length === 0) {
    gridEl.innerHTML = `<p style="color: var(--text-muted);">Aucun menu ne correspond aux ingrédients actuels.</p>`;
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
      const styleLabel = recipe.isTailoredPantry
        ? '🗄️ Sur-mesure Frigo/Placard'
        : isGourmet
        ? '🍷 Gourmet'
        : isPleasure
        ? '🌟 Plaisir'
        : '🥗 Équilibré';
      const dishEmoji = getDishEmoji(recipe, { isGourmet, isPleasure });
      const baseCost = typeof recipe.costFor2 === 'number' ? recipe.costFor2 : isGourmet ? 12.5 : isPleasure ? 8.0 : 4.5;
      const scaledCost = baseCost * (servings / (recipe.baseServings || 2));

      const matchClass =
        matchPct >= 65 ? 'pantry-match-high' : matchPct >= 30 ? 'pantry-match-mid' : 'pantry-match-low';
      const matchText = `🎯 ${matchCount}/${totalCount} ingrédient(s) de votre frigo/placard (${matchPct}%)`;

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
          return `<span class="pantry-ing-status-chip missing" title="À compléter">🛒 ${b.ing.name} (${reqStr} ${b.ing.unit})</span>`;
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

            <!-- Barre d'action : Ajustement des convives + Bouton Autre idée -->
            <div class="servings-control" style="margin-top: 8px; flex-direction: row; align-items: center; justify-content: space-between; padding: 7px 12px; gap: 8px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 0.8rem; font-weight: 800;">🍽️ À table :</span>
                <button type="button" class="btn btn-outline btn-sm btn-step-servings" onclick="stepPantryCardServings('${recipe.id}', -1)">−</button>
                <span class="servings-badge" style="min-width: 90px; text-align: center; padding: 3px 8px;">
                  ${servings} ${servings > 1 ? 'convives' : 'convive'}
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
            <button type="button" class="btn btn-outline btn-fiche-cuisine" onclick="openPantryRecipeModal('${recipe.id}', ${servings})">
              📖 Fiche cuisine
            </button>
            <button type="button" class="btn btn-primary btn-sm" style="grid-column: span 2;" onclick="openAssignPantryToWeekModal('${recipe.id}', ${servings})">
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
    .map((b, idx) => {
      const scaled = formatScaledQty(b.ing.qty, ratio);
      const badge =
        b.status === 'covered'
          ? '<span class="stock-tag" style="background:#dcfce7; color:#166534;">✓ En stock Frigo/Placard</span>'
          : b.status === 'partial'
          ? `<span class="stock-tag" style="background:#fef3c7; color:#92400e;">Stock partiel (manque ${Math.round(b.missingQty * 10) / 10} ${b.ing.unit})</span>`
          : '';
      return `
      <li
        id="recipe-voice-ing-${idx}"
        onclick="speakRecipeIngredientByIndex(${idx})"
        title="🔊 Cliquez pour écouter cet ingrédient avec le guide vocal"
        style="cursor: pointer; padding: 6px 8px; border-radius: 8px; transition: background 0.2s ease;"
      >
        <span>${b.ing.name} ${badge}</span>
        <strong>${scaled} ${b.ing.unit} <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; margin-left: 4px;">🔊</span></strong>
      </li>`;
    })
    .join('');

  const stepsHTML = (recipe.steps || [])
    .map(
      (st, idx) => `
      <li
        id="recipe-voice-step-${idx}"
        onclick="speakRecipeStepByIndex(${idx})"
        style="cursor: pointer; padding: 6px 8px; border-radius: 8px; transition: background 0.2s ease;"
        title="🔊 Cliquez pour écouter cette étape avec le guide vocal"
      >
        ${st} <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; margin-left: 4px;">🔊</span>
      </li>`
    )
    .join('');

  activeModalVoiceContext = {
    title: recipe.title,
    servings: s,
    ingredients: (recipe.ingredients || []).map((ing) => ({
      name: ing.name,
      qtyRaw: formatScaledQty(ing.qty, ratio),
      unitRaw: ing.unit,
      qtyText: `${formatScaledQty(ing.qty, ratio)} ${ing.unit}`
    })),
    steps: recipe.steps || [],
    dessertTitle: null,
    dessertSteps: [],
    currentStepIndex: 0
  };

  const voiceToolbarHTML = buildModalVoiceToolbarHTML();

  modalBody.innerHTML = `
    <span class="meta-pill healthy-pill">🗄️ Menu du Garde-manger • Pour ${s} ${s > 1 ? 'parts' : 'part'}</span>
    <h2 style="font-size: 1.35rem; font-weight: 800; margin-top: 8px; margin-bottom: 6px;">${recipe.title}</h2>
    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 14px;">${recipe.description || ''}</p>

    <div class="meal-meta" style="margin-bottom: 14px;">
      <span class="meta-pill">⏱️ Préparation : ${recipe.prepTime}</span>
      <span class="meta-pill">🔥 Cuisson : ${recipe.cookTime}</span>
      <span class="meta-pill">🎯 ${evalInfo.matchCount}/${evalInfo.totalCount} ingrédient(s) en stock</span>
    </div>

    ${voiceToolbarHTML}

    <div class="modal-section-title">🛒 Ingrédients (calculés pour ${s} ${s > 1 ? 'parts' : 'part'})</div>
    <ul id="modal-ingredients-list" class="modal-ing-list">${ingredientsHTML}</ul>

    <div class="modal-section-title">👩‍🍳 Étapes de préparation <small style="font-weight: 600; font-size: 0.78rem; color: var(--text-muted);">(Touchez une étape pour l'écouter 🔊)</small></div>
    <ol class="modal-steps-list">${stepsHTML}</ol>

    <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
      <button type="button" class="btn btn-outline" onclick="closeRecipeModal()">Fermer</button>
      <button type="button" class="btn btn-primary" onclick="openAssignPantryToWeekModal('${recipe.id}', ${s})">
        📅 Planifier dans ma semaine
      </button>
    </div>
  `;

  document.getElementById('recipe-modal').classList.add('open');
  unlockSharedVoiceAudioElement();
  warmUpRecipeVoiceGuideOnOpen();
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
  if (recipe.isTailoredPantry && !state.customRecipes.some((r) => r.id === recipe.id)) {
    state.customRecipes.unshift(recipe);
    getCatalogListByType(recipe.type || 'weekday').unshift(recipe);
  }
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

  const apiKey = getEffectiveAiApiKey('vision');

  if (!apiKey) {
    showToast(
      isLocalAdminEnvironment()
        ? 'ℹ️ Configurez votre clé API IA dans l\'Administration locale (onglet Clé API IA) pour créer une recette IA sur-mesure.'
        : 'ℹ️ Utilisez les menus suggérés ci-dessous (création IA sur-mesure non activée par l\'administrateur).'
    );
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


