const recipeGrid = document.getElementById('recipeGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const mealTypeFilter = document.getElementById('mealTypeFilter');
const recipeCount = document.getElementById('recipeCount');
const emptyState = document.getElementById('emptyState');

const COMMON_INGREDIENT_SEARCH_TERMS = new Set([
  'asafoetida',
  'coriander leaves',
  'curry leaves',
  'ghee',
  'hing',
  'jaggery',
  'mustard seeds',
  'oil',
  'salt',
  'sugar',
  'turmeric',
  'turmeric powder',
  'water'
]);

const COMMON_INGREDIENT_SEARCH_WORDS = new Set([
  'asafoetida',
  'ghee',
  'hing',
  'jaggery',
  'oil',
  'salt',
  'sugar',
  'turmeric',
  'water'
]);

const MEAL_TYPE_FILTERS = ['all', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Side'];

let recipes = [];
let activeMealType = 'all';
let activeDishType = 'all';
let dishTypeFilter = null;

function normalizeSearchText(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return '';

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2
  }).format(value);
}

function pluralizeUnit(unit, quantity) {
  if (quantity === 1) return unit;
  if (unit === 'rice cup') return 'rice cups';
  return unit;
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function getIngredientItems(recipe) {
  if (!Array.isArray(recipe.ingredients)) return [];

  return recipe.ingredients.flatMap((group) => {
    if (Array.isArray(group.items)) return group.items;
    return [];
  });
}

function getSearchWords(value) {
  return normalizeSearchText(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(' ')
    .filter(Boolean);
}

function isCommonIngredientSearchTerm(term) {
  if (COMMON_INGREDIENT_SEARCH_TERMS.has(term)) return true;

  const words = getSearchWords(term);
  return words.some((word) => COMMON_INGREDIENT_SEARCH_WORDS.has(word));
}

function getSearchableIngredientTerms(recipe) {
  return getIngredientItems(recipe)
    .flatMap((item) => {
      if (typeof item === 'string') return [item];
      return [item.ingredient, item.countLabel].filter(Boolean);
    })
    .map(normalizeSearchText)
    .filter(Boolean)
    .filter((term) => !isCommonIngredientSearchTerm(term));
}

function getRelationshipSearchTerms(recipe) {
  return [
    recipe.details?.Cuisine,
    recipe.details?.Status,
    recipe.category,
    ...normalizeList(recipe.relationships?.mealTypes),
    ...normalizeList(recipe.relationships?.dishTypes),
    ...normalizeList(recipe.relationships?.goesWellWith)
  ];
}

function buildRecipeSearchText(indexRecipe, fullRecipe = null) {
  const recipe = fullRecipe || indexRecipe;
  const ingredientTerms = fullRecipe ? getSearchableIngredientTerms(fullRecipe) : [];

  return [
    indexRecipe.name,
    indexRecipe.category,
    indexRecipe.summary,
    ...normalizeList(indexRecipe.searchAliases),
    ...normalizeList(recipe.searchAliases),
    ...getRelationshipSearchTerms(recipe),
    ...ingredientTerms
  ]
    .map(normalizeSearchText)
    .filter(Boolean)
    .join(' ');
}

function buildBaseCue(recipe) {
  const scaling = recipe.scaling;
  if (!scaling || !scaling.enabled || !scaling.baseQuantity || !scaling.baseUnit) return '';

  if (scaling.baseUnit === 'riceCup') {
    const quantity = Number(scaling.baseQuantity);
    return `${formatNumber(quantity)} ${pluralizeUnit('rice cup', quantity)} base`;
  }

  if (scaling.baseUnit === 'g') {
    return `${formatNumber(Number(scaling.baseQuantity))} g base`;
  }

  return `${formatNumber(Number(scaling.baseQuantity))} ${scaling.baseUnit} base`;
}

function getMealTypeChips(recipe) {
  const relationshipMealTypes = normalizeList(recipe.relationships?.mealTypes);
  if (relationshipMealTypes.length) return relationshipMealTypes;

  return normalizeList(recipe.details?.['Meal Type']);
}

function getDishTypeChips(recipe) {
  return normalizeList(recipe.relationships?.dishTypes);
}

function getPrimaryDishTypeChip(recipe) {
  return getDishTypeChips(recipe)[0] || '';
}

function buildRecipeChips(recipe) {
  const chips = [
    recipe.details?.Cuisine,
    ...getMealTypeChips(recipe),
    getPrimaryDishTypeChip(recipe),
    buildBaseCue(recipe)
  ];

  return chips.filter(Boolean);
}

function renderRecipeChips(recipe) {
  const chips = buildRecipeChips(recipe);
  if (!chips.length) return '';

  return `
    <div class="recipe-card-meta" aria-label="Recipe details">
      ${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('')}
    </div>
  `;
}

function buildFilterButton({ label, value, activeValue, dataAttribute }) {
  const isActive = value === activeValue;

  return `
    <button
      class="filter-chip${isActive ? ' is-active' : ''}"
      type="button"
      ${dataAttribute}="${escapeHtml(value)}"
      aria-pressed="${isActive}"
    >${escapeHtml(label)}</button>
  `;
}

function renderMealTypeFilters() {
  if (!mealTypeFilter) return;

  mealTypeFilter.innerHTML = MEAL_TYPE_FILTERS
    .map((mealType) => buildFilterButton({
      label: mealType === 'all' ? 'All' : mealType,
      value: mealType,
      activeValue: activeMealType,
      dataAttribute: 'data-meal-type'
    }))
    .join('');
}

function ensureDishTypeFilter() {
  if (dishTypeFilter || !mealTypeFilter) return dishTypeFilter;

  const panel = mealTypeFilter.closest('.meal-filter-panel');
  if (!panel) return null;

  panel.classList.add('filter-panel');
  panel.setAttribute('aria-label', 'Recipe filters');

  const dishTypeGroup = document.createElement('div');
  dishTypeGroup.className = 'dish-filter-group';
  dishTypeGroup.innerHTML = `
    <p class="eyebrow">Dish type</p>
    <div id="dishTypeFilter" class="filter-chips" role="group" aria-label="Filter recipes by dish type"></div>
  `;

  panel.appendChild(dishTypeGroup);
  dishTypeFilter = document.getElementById('dishTypeFilter');
  return dishTypeFilter;
}

function getDishTypeFilters() {
  const dishTypes = recipes.flatMap(getDishTypeChips).filter(Boolean);
  return ['all', ...new Set(dishTypes)].sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    return a.localeCompare(b);
  });
}

function renderDishTypeFilters() {
  const filter = ensureDishTypeFilter();
  if (!filter) return;

  filter.innerHTML = getDishTypeFilters()
    .map((dishType) => buildFilterButton({
      label: dishType === 'all' ? 'All' : dishType,
      value: dishType,
      activeValue: activeDishType,
      dataAttribute: 'data-dish-type'
    }))
    .join('');
}

function renderRecipes(items) {
  recipeGrid.innerHTML = items
    .map(
      (recipe) => `
        <a class="recipe-card" href="recipe.html?slug=${encodeURIComponent(recipe.slug)}">
          <div>
            <span class="tag">${escapeHtml(recipe.category)}</span>
            <h3>${escapeHtml(recipe.name)}</h3>
            <p>${escapeHtml(recipe.summary)}</p>
            ${renderRecipeChips(recipe)}
          </div>
          <span class="card-link">Open recipe →</span>
        </a>
      `
    )
    .join('');

  recipeCount.textContent = `${items.length} ${items.length === 1 ? 'recipe' : 'recipes'}`;
  emptyState.hidden = items.length !== 0;
}

function applyFilters() {
  const query = normalizeSearchText(searchInput.value);
  const category = categoryFilter.value;

  const filtered = recipes.filter((recipe) => {
    const matchesText = !query || recipe.searchText.includes(query);
    const matchesCategory = category === 'all' || recipe.category === category;
    const matchesMealType = activeMealType === 'all' || getMealTypeChips(recipe).includes(activeMealType);
    const matchesDishType = activeDishType === 'all' || getDishTypeChips(recipe).includes(activeDishType);

    return matchesText && matchesCategory && matchesMealType && matchesDishType;
  });

  renderRecipes(filtered);
}

async function loadFullRecipe(indexRecipe) {
  try {
    const response = await fetch(`data/recipes/${indexRecipe.slug}.json`);
    if (!response.ok) return indexRecipe;

    const fullRecipe = await response.json();
    return {
      ...indexRecipe,
      details: fullRecipe.details,
      relationships: fullRecipe.relationships,
      scaling: fullRecipe.scaling,
      searchAliases: fullRecipe.searchAliases,
      searchText: buildRecipeSearchText(indexRecipe, fullRecipe)
    };
  } catch {
    return indexRecipe;
  }
}

async function loadRecipes() {
  try {
    const response = await fetch('data/recipe-index.json');

    if (!response.ok) {
      throw new Error('Unable to load recipes.');
    }

    const indexRecipes = await response.json();
    recipes = indexRecipes.map((recipe) => ({
      ...recipe,
      searchText: buildRecipeSearchText(recipe)
    }));

    const categories = [...new Set(recipes.map((recipe) => recipe.category))].sort();

    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

    renderMealTypeFilters();
    renderRecipes(recipes);

    recipes = await Promise.all(recipes.map(loadFullRecipe));
    renderDishTypeFilters();
    applyFilters();
  } catch (error) {
    recipeGrid.innerHTML = `<div class="error-box">${escapeHtml(error.message)}</div>`;
  }
}

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);

mealTypeFilter?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-meal-type]');
  if (!button) return;

  activeMealType = button.dataset.mealType;
  renderMealTypeFilters();
  applyFilters();
});

mealTypeFilter?.closest('.meal-filter-panel')?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-dish-type]');
  if (!button) return;

  activeDishType = button.dataset.dishType;
  renderDishTypeFilters();
  applyFilters();
});

loadRecipes();