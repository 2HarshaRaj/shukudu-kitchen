const recipeGrid = document.getElementById('recipeGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
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

let recipes = [];

function normalizeSearchText(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function getIngredientItems(recipe) {
  if (!Array.isArray(recipe.ingredients)) return [];

  return recipe.ingredients.flatMap((group) => {
    if (Array.isArray(group.items)) return group.items;
    return [];
  });
}

function getSearchableIngredientTerms(recipe) {
  return getIngredientItems(recipe)
    .flatMap((item) => {
      if (typeof item === 'string') return [item];
      return [item.ingredient, item.countLabel].filter(Boolean);
    })
    .map(normalizeSearchText)
    .filter(Boolean)
    .filter((term) => !COMMON_INGREDIENT_SEARCH_TERMS.has(term));
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

function renderRecipes(items) {
  recipeGrid.innerHTML = items
    .map(
      (recipe) => `
        <a class="recipe-card" href="recipe.html?slug=${encodeURIComponent(recipe.slug)}">
          <div>
            <span class="tag">${recipe.category}</span>
            <h3>${recipe.name}</h3>
            <p>${recipe.summary}</p>
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

    return matchesText && matchesCategory;
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

    renderRecipes(recipes);

    recipes = await Promise.all(recipes.map(loadFullRecipe));
    applyFilters();
  } catch (error) {
    recipeGrid.innerHTML = `<div class="error-box">${error.message}</div>`;
  }
}

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);

loadRecipes();
