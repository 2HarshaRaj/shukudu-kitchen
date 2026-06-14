const recipeGrid = document.getElementById('recipeGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const recipeCount = document.getElementById('recipeCount');
const emptyState = document.getElementById('emptyState');

let recipes = [];

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
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = recipes.filter((recipe) => {
    const matchesText = [recipe.name, recipe.category, recipe.summary]
      .join(' ')
      .toLowerCase()
      .includes(query);

    const matchesCategory = category === 'all' || recipe.category === category;

    return matchesText && matchesCategory;
  });

  renderRecipes(filtered);
}

async function loadRecipes() {
  try {
    const response = await fetch('recipes.json');

    if (!response.ok) {
      throw new Error('Unable to load recipes.');
    }

    recipes = await response.json();

    const categories = [...new Set(recipes.map((recipe) => recipe.category))].sort();

    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

    renderRecipes(recipes);
  } catch (error) {
    recipeGrid.innerHTML = `<div class="error-box">${error.message}</div>`;
  }
}

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);

loadRecipes();
