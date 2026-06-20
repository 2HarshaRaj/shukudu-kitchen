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

function buildRecipeSearchText(indexRecipe, fullRecipe = null) {
  const ingredientTerms = fullRecipe ? getSearchableIngredientTerms(fullRecipe) : [];

  return [
    indexRecipe.name,
    indexRecipe.category,
    indexRecipe.summary,
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

function normalizeChipList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function getMealTypeChips(recipe) {
  const relationshipMealTypes = normalizeChipList(recipe.relationships?.mealTypes);
  if (relationshipMealTypes.length) return relationshipMealTypes;

  return normalizeChipList(recipe.details?.['Meal Type']);
}

function getPrimaryDishTypeChip(recipe) {
  return normalizeChipList(recipe.relationships?.dishTypes)[0] || '';
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

function renderMealTypeFilters() {
  if (!mealTypeFilter) return;

  mealTypeFilter.innerHTML = MEAL_TYPE_FILTERS
    .map((mealType) => {
      const label = mealType === 'all' ? 'All' : mealType;
      const isActive = mealType === activeMealType;

      return `
        <button
          class="filter-chip${isActive ? ' is-active' : ''}"
          type="button"
          data-meal-type="${escapeHtml(mealType)}"
          aria-pressed="${isActive}"
        >${escapeHtml(label)}</button>
      `;
    })
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

    return matchesText && matchesCategory && matchesMealType;
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

loadRecipes();