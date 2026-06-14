const recipeContent = document.getElementById('recipeContent');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderList(items, ordered = false, checklist = false) {
  if (!items?.length) return '';

  const tag = ordered ? 'ol' : 'ul';
  const className = checklist ? ' class="checklist"' : '';

  return `<${tag}${className}>${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</${tag}>`;
}

function renderRecipe(recipe) {
  document.title = `${recipe.name} | Shukudu Kitchen`;

  const details = Object.entries(recipe.details || {})
    .map(
      ([label, value]) => `
        <div>
          <span class="detail-label">${escapeHtml(label)}:</span>
          <span>${escapeHtml(value)}</span>
        </div>
      `
    )
    .join('');

  const ingredientSections = (recipe.ingredients || [])
    .map(
      (section) => `
        <h3>${escapeHtml(section.section)}</h3>
        ${renderList(section.items, false, true)}
      `
    )
    .join('');

  recipeContent.innerHTML = `
    <article>
      <header class="recipe-hero">
        <p class="eyebrow">${escapeHtml(recipe.category)}</p>
        <h1>${escapeHtml(recipe.name)}</h1>
        <p class="meta">${escapeHtml(recipe.summary)}</p>
      </header>

      <section class="recipe-section">
        <h2>Recipe Details</h2>
        <div class="details-grid">${details}</div>
      </section>

      <section class="recipe-section">
        <h2>Ingredients</h2>
        ${ingredientSections}
      </section>

      <section class="recipe-section">
        <h2>Preparation</h2>
        ${renderList(recipe.preparation, true)}
      </section>

      <section class="recipe-section">
        <h2>Cooking Method</h2>
        ${renderList(recipe.cookingMethod, true)}
      </section>

      <section class="recipe-section">
        <h2>Serving Suggestions</h2>
        ${renderList(recipe.servingSuggestions)}
      </section>

      <section class="recipe-section">
        <h2>Notes</h2>
        ${renderList(recipe.notes)}
      </section>
    </article>
  `;
}

async function loadRecipe() {
  const slug = new URLSearchParams(window.location.search).get('slug');

  try {
    const response = await fetch('recipes.json');

    if (!response.ok) {
      throw new Error('Unable to load recipe data.');
    }

    const recipes = await response.json();
    const recipe = recipes.find((item) => item.slug === slug);

    if (!recipe) {
      throw new Error('Recipe not found.');
    }

    renderRecipe(recipe);
  } catch (error) {
    recipeContent.innerHTML = `<div class="error-box"><strong>${escapeHtml(error.message)}</strong></div>`;
  }
}

loadRecipe();
