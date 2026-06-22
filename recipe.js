const recipeContent = document.getElementById('recipeContent');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getChecklistKey(slug) {
  return `shukudu-kitchen:${slug}:ingredients`;
}

function getCookingStepKey(slug) {
  return `shukudu-kitchen:${slug}:cooking-step`;
}

function getCompletedStepsKey(slug) {
  return `shukudu-kitchen:${slug}:completed-steps`;
}

function getScaleKey(slug) {
  return `shukudu-kitchen:${slug}:scale`;
}

function getHouseholdSelectionKey(slug) {
  return `household-selection-${slug}`;
}

function loadChecklistState(slug) {
  try {
    return JSON.parse(localStorage.getItem(getChecklistKey(slug))) || {};
  } catch {
    return {};
  }
}

function saveChecklistState(slug, state) {
  localStorage.setItem(getChecklistKey(slug), JSON.stringify(state));
}

function loadCookingStep(slug, stepCount) {
  const savedStep = Number.parseInt(localStorage.getItem(getCookingStepKey(slug)), 10);
  if (Number.isNaN(savedStep)) return 0;
  return Math.min(Math.max(savedStep, 0), Math.max(stepCount - 1, 0));
}

function saveCookingStep(slug, stepIndex) {
  localStorage.setItem(getCookingStepKey(slug), String(stepIndex));
}

function loadCompletedSteps(slug) {
  try {
    return JSON.parse(localStorage.getItem(getCompletedStepsKey(slug))) || {};
  } catch {
    return {};
  }
}

function saveCompletedSteps(slug, state) {
  localStorage.setItem(getCompletedStepsKey(slug), JSON.stringify(state));
}

function loadScale(recipe) {
  const options = recipe.scaling?.options || [1];
  const saved = Number.parseFloat(localStorage.getItem(getScaleKey(recipe.slug)));
  return options.includes(saved) ? saved : (recipe.scaling?.baseScale || 1);
}

function saveScale(slug, scale) {
  localStorage.setItem(getScaleKey(slug), String(scale));
}

function normalizeHouseholdSelection(selection, householdBase) {
  const basePeople = Number(householdBase?.people);
  const baseMeals = Number(householdBase?.meals);
  const people = Number(selection?.people);
  const meals = Number(selection?.meals);

  return {
    people: [1, 2, 3, 4].includes(people) ? people : basePeople,
    meals: [1, 2, 3].includes(meals) ? meals : baseMeals
  };
}

function loadHouseholdSelection(slug, householdBase) {
  const fallback = normalizeHouseholdSelection(householdBase, householdBase);

  try {
    const saved = JSON.parse(localStorage.getItem(getHouseholdSelectionKey(slug)));
    return normalizeHouseholdSelection(saved || fallback, householdBase);
  } catch {
    return fallback;
  }
}

function saveHouseholdSelection(slug, selection) {
  localStorage.setItem(getHouseholdSelectionKey(slug), JSON.stringify(selection));
}

function normalizeStep(step) {
  return typeof step === 'string' ? { text: step } : step;
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);

  const rounded = Math.round(value * 1000) / 1000;
  const fractions = new Map([
    [0.125, '⅛'],
    [0.25, '¼'],
    [0.333, '⅓'],
    [0.375, '⅜'],
    [0.5, '½'],
    [0.625, '⅝'],
    [0.667, '⅔'],
    [0.75, '¾'],
    [0.875, '⅞']
  ]);

  const whole = Math.floor(rounded);
  const fraction = Math.round((rounded - whole) * 1000) / 1000;
  const symbol = fractions.get(fraction);

  if (symbol) return whole ? `${whole}${symbol}` : symbol;
  return String(rounded).replace(/\.0+$/, '');
}

function pluralizeUnit(unit, quantity) {
  if (!unit) return '';
  if (quantity === 1) return unit;

  const irregular = {
    inch: 'inches',
    clove: 'cloves',
    tablespoon: 'tablespoons',
    teaspoon: 'teaspoons',
    'standard cup': 'standard cups',
    'rice cup': 'rice cups'
  };

  return irregular[unit] || `${unit}s`;
}

function roundToNearest(value, increment) {
  return Math.round(value / increment) * increment;
}

function formatGramWeight(item, scale) {
  if (item.weightGrams == null) return '';

  const raw = item.scalable === false ? item.weightGrams : item.weightGrams * scale;
  const rounded = raw < 10 ? Math.round(raw * 2) / 2 : Math.round(raw);
  return `${formatNumber(rounded)} g`;
}

function formatReferenceQuantity(item, scale) {
  const reference = item.referenceQuantity;
  if (!reference || typeof reference !== 'object' || Array.isArray(reference)) return '';
  if (!Number.isFinite(Number(reference.quantity)) || !reference.unit) return '';

  const raw = item.scalable === false ? Number(reference.quantity) : Number(reference.quantity) * scale;
  const prefix = reference.approx === false ? '' : '≈ ';
  return ` (${prefix}${formatNumber(raw)} ${pluralizeUnit(reference.unit, raw)})`;
}

function formatPracticalCount(item, scale) {
  const raw = item.scalable === false ? item.quantity : item.quantity * scale;
  const type = item.roundingType || item.rounding || 'exact';

  if (type === 'large-produce') {
    const rounded = Math.max(1, Math.round(raw));
    return { text: String(rounded), numeric: rounded };
  }

  if (type === 'small-whole') {
    const rounded = Math.max(0.5, roundToNearest(raw, 0.5));
    return { text: formatNumber(rounded), numeric: rounded };
  }

  if (type === 'whole') {
    const rounded = Math.max(1, Math.round(raw));
    return { text: String(rounded), numeric: rounded };
  }

  if (type === 'half-count') {
    const rounded = Math.max(0.5, roundToNearest(raw, 0.5));
    return { text: formatNumber(rounded), numeric: rounded };
  }

  if (type === 'quarter-count') {
    const rounded = Math.max(0.25, roundToNearest(raw, 0.25));
    return { text: formatNumber(rounded), numeric: rounded };
  }

  return { text: formatNumber(raw), numeric: raw };
}

function pluralizeCountLabel(label, quantity) {
  if (quantity === 1) return label;

  return label
    .replace(/\b(onion|tomato|lemon|chilli|clove|leaf)\b/g, '$1s')
    .replace(/\bmedium onion\b/, 'medium onions')
    .replace(/\bmedium ripe tomato\b/, 'medium ripe tomatoes')
    .replace(/\bsmall lemon\b/, 'small lemons');
}

function formatIngredient(item, scale = 1) {
  if (typeof item === 'string') return item;
  if (item.displayText) return item.displayText;

  const preparation = item.preparation ? `, ${item.preparation}` : '';

  if (item.countLabel) {
    const count = formatPracticalCount(item, scale);
    const label = pluralizeCountLabel(item.countLabel, count.numeric);
    const grams = formatGramWeight(item, scale);
    const gramsText = grams ? ` (${grams})` : '';
    return `${count.text} ${label}${gramsText}${preparation}`;
  }

  const quantity = item.scalable === false ? item.quantity : item.quantity * scale;
  const formattedQuantity = formatNumber(quantity);
  const unit = pluralizeUnit(item.unit, quantity);
  const riceCupQuantity = item.riceCupEquivalent == null
    ? null
    : (item.scalable === false ? item.riceCupEquivalent : item.riceCupEquivalent * scale);
  const riceCup = riceCupQuantity == null
    ? ''
    : ` (${formatNumber(riceCupQuantity)} ${pluralizeUnit('rice cup', riceCupQuantity)})`;
  const referenceQuantity = formatReferenceQuantity(item, scale);
  const grams = formatGramWeight(item, scale);
  const gramsText = grams ? ` (${grams})` : '';

  return `${formattedQuantity} ${unit} ${item.ingredient}${riceCup}${referenceQuantity}${gramsText}${preparation}`.replace(/\s+/g, ' ').trim();
}

function buildIngredientMap(recipe) {
  const map = new Map();

  (recipe.ingredients || []).forEach((section) => {
    (section.items || []).forEach((item) => {
      if (typeof item === 'object' && item.id) map.set(item.id, item);
    });
  });

  return map;
}

function renderStepContent(step, ingredientMap = new Map(), scale = 1) {
  const normalized = normalizeStep(step);

  if (normalized.text) {
    return `<p class="step-text">${escapeHtml(normalized.text)}</p>`;
  }

  const lead = normalized.lead
    ? `<p class="step-lead">${escapeHtml(normalized.lead)}</p>`
    : '';

  const stepItems = normalized.ingredientIds?.length
    ? normalized.ingredientIds
        .map((id) => ingredientMap.get(id))
        .filter(Boolean)
        .map((item) => formatIngredient(item, scale))
    : normalized.items || [];

  const items = stepItems.length
    ? `<ul class="step-items">${stepItems
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join('')}</ul>`
    : '';

  const after = normalized.after
    ? `<p class="step-after">${escapeHtml(normalized.after)}</p>`
    : '';

  return `${lead}${items}${after}`;
}

function renderStepList(items, ingredientMap = new Map(), scale = 1) {
  if (!items?.length) return '';

  return `<ol class="structured-steps">${items
    .map((step) => `<li>${renderStepContent(step, ingredientMap, scale)}</li>`)
    .join('')}</ol>`;
}

function renderSimpleList(items) {
  if (!items?.length) return '';

  return `<ul>${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul>`;
}

function normalizeDetailList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function formatDetailValue(value) {
  const values = normalizeDetailList(value);
  if (values.length) return values.join(' / ');
  return value == null ? '' : String(value);
}

function buildBaseDetail(recipe) {
  const scaling = recipe.scaling;
  const fallbackBase = recipe.details?.['Base Quantity'];

  if (!scaling?.enabled || scaling.baseQuantity == null || !scaling.baseUnit) {
    return fallbackBase || '';
  }

  const quantity = Number(scaling.baseQuantity);
  if (!Number.isFinite(quantity)) return fallbackBase || '';

  if (scaling.baseUnit === 'riceCup') {
    return `${formatNumber(quantity)} ${pluralizeUnit('rice cup', quantity)}`;
  }

  if (scaling.baseUnit === 'g') {
    return `${formatNumber(quantity)} g`;
  }

  return `${formatNumber(quantity)} ${pluralizeUnit(scaling.baseUnit, quantity)}`;
}

function buildRecipeDetails(recipe) {
  const details = Object.entries(recipe.details || {})
    .filter(([label]) => !['Meal Type', 'Base Quantity'].includes(label));

  const mealTypes = normalizeDetailList(recipe.relationships?.mealTypes);
  const fallbackMealTypes = normalizeDetailList(recipe.details?.['Meal Type']);
  const dishTypes = normalizeDetailList(recipe.relationships?.dishTypes);
  const baseDetail = buildBaseDetail(recipe);

  details.push(['Meal Type', mealTypes.length ? mealTypes : fallbackMealTypes]);

  if (dishTypes.length) {
    details.push(['Dish Type', dishTypes]);
  }

  if (baseDetail) {
    details.push(['Base', baseDetail]);
  }

  if (recipe.householdBase?.label) {
    details.push(['Household Base', recipe.householdBase.label]);
  }

  return details.filter(([, value]) => formatDetailValue(value));
}

function renderRecipeDetails(recipe) {
  const details = buildRecipeDetails(recipe);

  return details
    .map(([label, value]) => `
      <div>
        <span class="detail-label">${escapeHtml(label)}:</span>
        <span>${escapeHtml(formatDetailValue(value))}</span>
      </div>
    `)
    .join('');
}


function renderHouseholdSelector(recipe) {
  if (!recipe.householdBase) return '';

  const selection = loadHouseholdSelection(recipe.slug, recipe.householdBase);
  const peopleOptions = [1, 2, 3, 4];
  const mealOptions = [1, 2, 3];

  const renderOptions = (label, name, options, selected) => `
    <div class="household-control">
      <p class="household-label">${escapeHtml(label)}</p>
      <div class="scale-options household-options" role="group" aria-label="Choose ${escapeHtml(label.toLowerCase())}">
        ${options
          .map((option) => `
            <button
              class="scale-button${option === selected ? ' is-active' : ''}"
              type="button"
              data-household-field="${name}"
              data-household-value="${option}"
              aria-pressed="${option === selected}"
            >${option}</button>
          `)
          .join('')}
      </div>
    </div>
  `;

  return `
    <section class="household-selector" aria-label="Household selection">
      <div class="household-selector-heading">
        <p class="eyebrow">Household</p>
        <p class="scale-current">Selected: <strong><span data-household-current>${selection.people} people × ${selection.meals} meals</span></strong></p>
      </div>
      <div class="household-selector-controls">
        ${renderOptions('People', 'people', peopleOptions, selection.people)}
        ${renderOptions('Meals', 'meals', mealOptions, selection.meals)}
      </div>
    </section>
  `;
}

function renderIngredientChecklist(recipe, scale = 1) {
  const savedState = loadChecklistState(recipe.slug);
  let itemIndex = 0;

  return (recipe.ingredients || [])
    .map((section) => {
      const items = section.items
        .map((item) => {
          const id = `ingredient-${itemIndex}`;
          const checked = Boolean(savedState[id]);
          itemIndex += 1;

          return `
            <li class="ingredient-item${checked ? ' is-complete' : ''}">
              <label class="ingredient-check">
                <input type="checkbox" data-ingredient-id="${id}" ${checked ? 'checked' : ''}>
                <span>${escapeHtml(formatIngredient(item, scale))}</span>
              </label>
            </li>
          `;
        })
        .join('');

      return `
        <h3>${escapeHtml(section.section)}</h3>
        <ul class="checklist">${items}</ul>
      `;
    })
    .join('');
}

function renderScaleControls(recipe, scale) {
  if (!recipe.scaling?.enabled) return '';

  const options = recipe.scaling.options || [1];
  return `
    <section class="scale-panel" aria-label="Recipe scaling">
      <div>
        <p class="eyebrow">Recipe scale</p>
        <p class="scale-current">Current: <strong>${formatNumber(scale)}×</strong></p>
      </div>
      <div class="scale-options" role="group" aria-label="Choose recipe scale">
        ${options
          .map((option) => `
            <button
              class="scale-button${option === scale ? ' is-active' : ''}"
              type="button"
              data-scale="${option}"
              aria-pressed="${option === scale}"
            >${formatNumber(option)}×</button>
          `)
          .join('')}
      </div>
    </section>
  `;
}


function initialiseHouseholdSelector(recipe) {
  const selector = recipeContent.querySelector('.household-selector');
  if (!selector || !recipe.householdBase) return;

  let selection = loadHouseholdSelection(recipe.slug, recipe.householdBase);
  const current = selector.querySelector('[data-household-current]');

  function updateSelection(field, value) {
    selection = { ...selection, [field]: value };
    saveHouseholdSelection(recipe.slug, selection);

    selector.querySelectorAll(`[data-household-field="${field}"]`).forEach((button) => {
      const isActive = Number(button.dataset.householdValue) === value;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (current) {
      current.textContent = `${selection.people} people × ${selection.meals} meals`;
    }
  }

  selector.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-household-field][data-household-value]');
    if (!button) return;

    const field = button.dataset.householdField;
    const value = Number(button.dataset.householdValue);
    if (!['people', 'meals'].includes(field) || !Number.isFinite(value) || selection[field] === value) return;

    updateSelection(field, value);
  });
}

function initialiseIngredientChecklist(recipe) {
  const checklist = recipeContent.querySelector('.ingredient-checklist');
  const resetButton = recipeContent.querySelector('#resetIngredients');
  if (!checklist || !resetButton) return;

  checklist.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[type="checkbox"][data-ingredient-id]');
    if (!checkbox) return;

    const state = loadChecklistState(recipe.slug);
    state[checkbox.dataset.ingredientId] = checkbox.checked;
    saveChecklistState(recipe.slug, state);
    checkbox.closest('.ingredient-item')?.classList.toggle('is-complete', checkbox.checked);
  });

  resetButton.addEventListener('click', () => {
    localStorage.removeItem(getChecklistKey(recipe.slug));

    checklist.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
      checkbox.closest('.ingredient-item')?.classList.remove('is-complete');
    });
  });
}

function initialiseScaleControls(recipe, scale, onScaleChange) {
  const panel = recipeContent.querySelector('.scale-panel');
  if (!panel) return;

  panel.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-scale]');
    if (!button) return;

    const nextScale = Number.parseFloat(button.dataset.scale);
    if (!Number.isFinite(nextScale) || nextScale === scale) return;

    saveScale(recipe.slug, nextScale);
    onScaleChange(nextScale);
  });
}

function initialiseSectionNavigation() {
  const nav = recipeContent.querySelector('.section-nav');
  if (!nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  let activeId = '';
  let ticking = false;

  function setActiveSection(sectionId, keepVisible = true) {
    if (!sectionId || activeId === sectionId) return;
    activeId = sectionId;

    links.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${sectionId}`;
      link.classList.toggle('is-active', isActive);

      if (isActive && keepVisible) {
        const left = link.offsetLeft - nav.clientWidth / 2 + link.clientWidth / 2;
        nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      }
    });
  }

  function updateActiveSection() {
    const marker = nav.offsetHeight + 28;
    let current = sections[0];

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) current = section;
    });

    setActiveSection(current?.id);
    ticking = false;
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      setActiveSection(target.id, false);
      const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 18;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateActiveSection);
  }, { passive: true });

  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();
}

function initialiseCookingMode(recipe, ingredientMap, getScale) {
  const startButton = recipeContent.querySelector('#startCooking');
  const modal = recipeContent.querySelector('#cookingMode');
  const exitButton = recipeContent.querySelector('#exitCooking');
  const previousButton = recipeContent.querySelector('#previousCookingStep');
  const nextButton = recipeContent.querySelector('#nextCookingStep');
  const completeButton = recipeContent.querySelector('#completeCookingStep');
  const stepBody = recipeContent.querySelector('#cookingStepBody');
  const stepLabel = recipeContent.querySelector('#cookingStepLabel');
  const progressBar = recipeContent.querySelector('#cookingProgressBar');

  if (!startButton || !modal || !exitButton || !previousButton || !nextButton || !completeButton || !stepBody || !stepLabel || !progressBar) return;

  const steps = [
    ...(recipe.preparation || []).map((step) => ({ phase: 'Preparation', content: normalizeStep(step) })),
    ...(recipe.cookingMethod || []).map((step) => ({ phase: 'Cooking', content: normalizeStep(step) }))
  ];

  let currentStep = loadCookingStep(recipe.slug, steps.length);
  let completedSteps = loadCompletedSteps(recipe.slug);

  function updateCookingStep() {
    const step = steps[currentStep];
    if (!step) return;

    const isComplete = Boolean(completedSteps[currentStep]);
    stepLabel.textContent = `${step.phase} • Step ${currentStep + 1} of ${steps.length}`;
    stepBody.innerHTML = renderStepContent(step.content, ingredientMap, getScale());
    progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    previousButton.disabled = currentStep === 0;
    nextButton.textContent = currentStep === steps.length - 1 ? 'Finish' : 'Next';
    completeButton.textContent = isComplete ? 'Completed ✓' : 'Mark Complete';
    completeButton.classList.toggle('is-complete', isComplete);
    completeButton.setAttribute('aria-pressed', String(isComplete));
    saveCookingStep(recipe.slug, currentStep);
  }

  function openCookingMode() {
    modal.hidden = false;
    document.body.classList.add('cooking-mode-open');
    updateCookingStep();
    exitButton.focus();
  }

  function closeCookingMode() {
    modal.hidden = true;
    document.body.classList.remove('cooking-mode-open');
    startButton.focus();
  }

  startButton.addEventListener('click', openCookingMode);
  exitButton.addEventListener('click', closeCookingMode);

  completeButton.addEventListener('click', () => {
    completedSteps[currentStep] = !completedSteps[currentStep];
    saveCompletedSteps(recipe.slug, completedSteps);
    updateCookingStep();
  });

  previousButton.addEventListener('click', () => {
    if (currentStep === 0) return;
    currentStep -= 1;
    updateCookingStep();
  });

  nextButton.addEventListener('click', () => {
    if (currentStep === steps.length - 1) {
      localStorage.removeItem(getCookingStepKey(recipe.slug));
      localStorage.removeItem(getCompletedStepsKey(recipe.slug));
      completedSteps = {};
      currentStep = 0;
      closeCookingMode();
      return;
    }

    currentStep += 1;
    updateCookingStep();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeCookingMode();
  });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') closeCookingMode();
    if (event.key === 'ArrowLeft') previousButton.click();
    if (event.key === 'ArrowRight') nextButton.click();
  });

  return { refresh: updateCookingStep };
}

function renderRecipe(recipe, initialScale = null) {
  document.title = `${recipe.name} | Shukudu Kitchen`;
  const ingredientMap = buildIngredientMap(recipe);
  let currentScale = initialScale ?? loadScale(recipe);
  const details = renderRecipeDetails(recipe);

  recipeContent.innerHTML = `
    <article>
      <header class="recipe-hero">
        <p class="eyebrow">${escapeHtml(recipe.category)}</p>
        <h1>${escapeHtml(recipe.name)}</h1>
        <p class="meta">${escapeHtml(recipe.summary)}</p>
        <button id="startCooking" class="primary-button" type="button">Start Cooking</button>
      </header>

      ${renderScaleControls(recipe, currentScale)}

      <nav class="section-nav" aria-label="Recipe sections">
        <a href="#details">Details</a>
        <a href="#ingredients">Ingredients</a>
        <a href="#preparation">Preparation</a>
        <a href="#method">Method</a>
        <a href="#serving">Serving</a>
        <a href="#notes">Notes</a>
      </nav>

      <section id="details" class="recipe-section anchor-section">
        <h2>Recipe Details</h2>
        <div class="details-grid">${details}</div>
        ${renderHouseholdSelector(recipe)}
      </section>

      <section id="ingredients" class="recipe-section ingredient-checklist anchor-section">
        <div class="section-title-row">
          <h2>Ingredients</h2>
          <button id="resetIngredients" class="text-button" type="button">Reset ingredients</button>
        </div>
        ${renderIngredientChecklist(recipe, currentScale)}
      </section>

      <section id="preparation" class="recipe-section anchor-section">
        <h2>Preparation</h2>
        ${renderStepList(recipe.preparation, ingredientMap, currentScale)}
      </section>

      <section id="method" class="recipe-section anchor-section">
        <h2>Cooking Method</h2>
        ${renderStepList(recipe.cookingMethod, ingredientMap, currentScale)}
      </section>

      <section id="serving" class="recipe-section anchor-section">
        <h2>Serving Suggestions</h2>
        ${renderSimpleList(recipe.servingSuggestions)}
      </section>

      <section id="notes" class="recipe-section anchor-section">
        <h2>Notes</h2>
        ${renderSimpleList(recipe.notes)}
      </section>
    </article>

    <div id="cookingMode" class="cooking-mode" hidden>
      <div class="cooking-panel" role="dialog" aria-modal="true" aria-labelledby="cookingModeTitle">
        <div class="cooking-topbar">
          <div>
            <p class="eyebrow">Cooking Mode</p>
            <h2 id="cookingModeTitle">${escapeHtml(recipe.name)}</h2>
          </div>
          <button id="exitCooking" class="icon-button" type="button" aria-label="Exit cooking mode">×</button>
        </div>

        <div class="cooking-progress" aria-hidden="true">
          <span id="cookingProgressBar"></span>
        </div>

        <div class="cooking-step-card">
          <p id="cookingStepLabel" class="cooking-step-label"></p>
          <div id="cookingStepBody" class="cooking-step-body"></div>
          <button id="completeCookingStep" class="complete-step-button" type="button" aria-pressed="false">Mark Complete</button>
        </div>

        <div class="cooking-actions">
          <button id="previousCookingStep" class="secondary-button" type="button">Previous</button>
          <button id="nextCookingStep" class="primary-button" type="button">Next</button>
        </div>
      </div>
    </div>
  `;

  initialiseIngredientChecklist(recipe);
  initialiseHouseholdSelector(recipe);
  initialiseSectionNavigation();
  const cookingMode = initialiseCookingMode(recipe, ingredientMap, () => currentScale);
  initialiseScaleControls(recipe, currentScale, (nextScale) => {
    currentScale = nextScale;
    renderRecipe(recipe, currentScale);
    cookingMode?.refresh?.();
  });
}

async function loadRecipe() {
  const slug = new URLSearchParams(window.location.search).get('slug');

  try {
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Recipe not found.');
    }

    const response = await fetch(`data/recipes/${slug}.json`);

    if (!response.ok) {
      throw new Error(response.status === 404 ? 'Recipe not found.' : 'Unable to load recipe data.');
    }

    const recipe = await response.json();

    if (recipe.slug !== slug) {
      throw new Error('Recipe data is invalid.');
    }

    renderRecipe(recipe);
  } catch (error) {
    recipeContent.innerHTML = `<div class="error-box"><strong>${escapeHtml(error.message)}</strong></div>`;
  }
}

loadRecipe();
