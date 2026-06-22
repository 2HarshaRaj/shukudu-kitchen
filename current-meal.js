const currentMealContent = document.getElementById('currentMealContent');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeStep(step) {
  return typeof step === 'string' ? { text: step } : step;
}

function loadScale(recipe) {
  const options = recipe.scaling?.options || [1];
  const saved = Number.parseFloat(localStorage.getItem(`shukudu-kitchen:${recipe.slug}:scale`));
  return options.includes(saved) ? saved : (recipe.scaling?.baseScale || 1);
}

function loadHouseholdSelection(slug, householdBase) {
  const fallback = {
    people: Number(householdBase?.people) || 1,
    meals: Number(householdBase?.meals) || 1
  };

  try {
    const saved = JSON.parse(localStorage.getItem(`household-selection-${slug}`));
    return {
      people: [1, 2, 3, 4].includes(Number(saved?.people)) ? Number(saved.people) : fallback.people,
      meals: [1, 2, 3].includes(Number(saved?.meals)) ? Number(saved.meals) : fallback.meals
    };
  } catch {
    return fallback;
  }
}

function getHouseholdMultiplier(recipe) {
  const basePeople = Number(recipe.householdBase?.people);
  const baseMeals = Number(recipe.householdBase?.meals);
  if (!basePeople || !baseMeals) return 1;
  const selection = loadHouseholdSelection(recipe.slug, recipe.householdBase);
  return (selection.people * selection.meals) / (basePeople * baseMeals);
}

function getEffectiveScale(recipe) {
  return loadScale(recipe) * getHouseholdMultiplier(recipe);
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  const rounded = Math.round(value * 1000) / 1000;
  return String(rounded).replace(/\.0+$/, '');
}

function pluralizeUnit(unit, quantity) {
  if (!unit || quantity === 1) return unit || '';
  const irregular = { inch: 'inches', clove: 'cloves', tablespoon: 'tablespoons', teaspoon: 'teaspoons', 'standard cup': 'standard cups', 'rice cup': 'rice cups' };
  return irregular[unit] || `${unit}s`;
}

function formatIngredient(item, scale = 1) {
  if (typeof item === 'string') return item;
  if (item.displayText) return item.displayText;
  if (item.countLabel) {
    const raw = item.scalable === false ? item.quantity : item.quantity * scale;
    const rounded = item.roundingType === 'whole' || item.roundingType === 'large-produce' ? Math.max(1, Math.round(raw)) : Math.round(raw * 4) / 4;
    const grams = item.weightGrams == null ? '' : ` (${formatNumber(item.scalable === false ? item.weightGrams : item.weightGrams * scale)} g)`;
    const preparation = item.preparation ? `, ${item.preparation}` : '';
    return `${formatNumber(rounded)} ${item.countLabel}${grams}${preparation}`;
  }
  const quantity = item.scalable === false ? item.quantity : item.quantity * scale;
  const unit = pluralizeUnit(item.unit, quantity);
  const preparation = item.preparation ? `, ${item.preparation}` : '';
  return `${formatNumber(quantity)} ${unit} ${item.ingredient}${preparation}`.replace(/\s+/g, ' ').trim();
}

function buildIngredientMap(recipe) {
  const map = new Map();
  (recipe.ingredients || []).forEach((section) => (section.items || []).forEach((item) => {
    if (typeof item === 'object' && item.id) map.set(item.id, item);
  }));
  return map;
}

function renderStepContent(step, ingredientMap, scale) {
  const normalized = normalizeStep(step);
  if (normalized.text) return `<p class="step-text">${escapeHtml(normalized.text)}</p>`;
  const lead = normalized.lead ? `<p class="step-lead">${escapeHtml(normalized.lead)}</p>` : '';
  const stepItems = normalized.ingredientIds?.length
    ? normalized.ingredientIds.map((id) => ingredientMap.get(id)).filter(Boolean).map((item) => formatIngredient(item, scale))
    : normalized.items || [];
  const items = stepItems.length ? `<ul class="step-items">${stepItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
  const after = normalized.after ? `<p class="step-after">${escapeHtml(normalized.after)}</p>` : '';
  return `${lead}${items}${after}`;
}

function renderMealList(recipes) {
  if (!recipes.length) {
    return `<section class="recipe-hero"><p class="eyebrow">Current Meal</p><h1>Current Meal</h1><p class="meta">Your Current Meal is empty. Add recipes from recipe pages to build a meal.</p><a class="primary-button" href="index.html">Browse recipes</a></section>`;
  }

  return `
    <section class="recipe-hero">
      <p class="eyebrow">Current Meal</p>
      <h1>Current Meal</h1>
      <p class="meta">Selected recipes stay here until you clear them. Each recipe keeps its own recipe scale and People × Meals selection.</p>
      <div class="meal-actions">
        <button id="prepareMeal" class="primary-button" type="button">Prepare Meal</button>
        <button id="clearMeal" class="secondary-button" type="button">Clear Current Meal</button>
      </div>
    </section>
    <section class="recipe-section">
      <h2>Selected recipes</h2>
      <div class="current-meal-list">
        ${recipes.map((recipe, index) => `
          <article class="current-meal-item" data-slug="${escapeHtml(recipe.slug)}">
            <div>
              <p class="eyebrow">Recipe ${index + 1}</p>
              <h3><a href="recipe.html?slug=${encodeURIComponent(recipe.slug)}">${escapeHtml(recipe.name)}</a></h3>
              <p class="meta">${escapeHtml(recipe.summary || '')}</p>
            </div>
            <div class="meal-item-actions">
              <button class="secondary-button" type="button" data-move="up" ${index === 0 ? 'disabled' : ''}>Up</button>
              <button class="secondary-button" type="button" data-move="down" ${index === recipes.length - 1 ? 'disabled' : ''}>Down</button>
              <button class="text-button" type="button" data-remove>Remove</button>
            </div>
          </article>`).join('')}
      </div>
    </section>
    <section id="prepareMealSection" class="recipe-section prepare-meal-section" hidden></section>
  `;
}

function renderPrepareMeal(recipes) {
  return `
    <div class="section-title-row"><h2>Prepare Meal</h2><button id="closePrepareMeal" class="text-button" type="button">Close</button></div>
    <p class="meta">Follow each recipe separately. Ingredients are not merged and steps are not interleaved in Phase 1.</p>
    ${recipes.map((recipe) => {
      const scale = getEffectiveScale(recipe);
      const ingredientMap = buildIngredientMap(recipe);
      return `<article class="meal-recipe-block">
        <h3>${escapeHtml(recipe.name)}</h3>
        <p class="meta">Recipe scale: ${formatNumber(loadScale(recipe))}×${recipe.householdBase ? ` · Household: ${loadHouseholdSelection(recipe.slug, recipe.householdBase).people} people × ${loadHouseholdSelection(recipe.slug, recipe.householdBase).meals} meals` : ''}</p>
        <h4>Ingredients</h4>
        ${(recipe.ingredients || []).map((section) => `<h5>${escapeHtml(section.section)}</h5><ul>${(section.items || []).map((item) => `<li>${escapeHtml(formatIngredient(item, scale))}</li>`).join('')}</ul>`).join('')}
        <h4>Preparation</h4><ol>${(recipe.preparation || []).map((step) => `<li>${renderStepContent(step, ingredientMap, scale)}</li>`).join('')}</ol>
        <h4>Cooking Method</h4><ol>${(recipe.cookingMethod || []).map((step) => `<li>${renderStepContent(step, ingredientMap, scale)}</li>`).join('')}</ol>
      </article>`;
    }).join('')}
  `;
}

async function fetchRecipe(slug) {
  const response = await fetch(`data/recipes/${slug}.json`);
  if (!response.ok) throw new Error(`Unable to load ${slug}.`);
  return response.json();
}

async function renderCurrentMeal() {
  const slugs = loadCurrentMealSlugs();
  const recipes = await Promise.all(slugs.map(fetchRecipe));
  currentMealContent.innerHTML = renderMealList(recipes);

  currentMealContent.querySelector('#clearMeal')?.addEventListener('click', () => {
    clearCurrentMeal();
    renderCurrentMeal();
  });

  currentMealContent.querySelector('.current-meal-list')?.addEventListener('click', (event) => {
    const item = event.target.closest('.current-meal-item');
    if (!item) return;
    const slugs = loadCurrentMealSlugs();
    const index = slugs.indexOf(item.dataset.slug);
    if (event.target.closest('[data-remove]')) {
      removeRecipeFromCurrentMeal(item.dataset.slug);
      renderCurrentMeal();
      return;
    }
    const move = event.target.closest('[data-move]')?.dataset.move;
    if (!move || index < 0) return;
    const nextIndex = move === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= slugs.length) return;
    [slugs[index], slugs[nextIndex]] = [slugs[nextIndex], slugs[index]];
    saveCurrentMealSlugs(slugs);
    renderCurrentMeal();
  });

  currentMealContent.querySelector('#prepareMeal')?.addEventListener('click', () => {
    const section = currentMealContent.querySelector('#prepareMealSection');
    section.innerHTML = renderPrepareMeal(recipes);
    section.hidden = false;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section.querySelector('#closePrepareMeal')?.addEventListener('click', () => { section.hidden = true; });
  });
}

renderCurrentMeal().catch((error) => {
  currentMealContent.innerHTML = `<div class="error-box"><strong>${escapeHtml(error.message)}</strong></div>`;
});
