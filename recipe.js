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

function renderList(items, ordered = false) {
  if (!items?.length) return '';

  const tag = ordered ? 'ol' : 'ul';

  return `<${tag}>${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</${tag}>`;
}

function renderIngredientChecklist(recipe) {
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
                <input
                  type="checkbox"
                  data-ingredient-id="${id}"
                  ${checked ? 'checked' : ''}
                >
                <span>${escapeHtml(item)}</span>
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

function initialiseSectionNavigation() {
  const nav = recipeContent.querySelector('.section-nav');
  if (!nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      links.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    },
    {
      rootMargin: '-18% 0px -68% 0px',
      threshold: [0, 0.1, 0.25]
    }
  );

  sections.forEach((section) => observer.observe(section));
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

  recipeContent.innerHTML = `
    <article>
      <header class="recipe-hero">
        <p class="eyebrow">${escapeHtml(recipe.category)}</p>
        <h1>${escapeHtml(recipe.name)}</h1>
        <p class="meta">${escapeHtml(recipe.summary)}</p>
      </header>

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
      </section>

      <section id="ingredients" class="recipe-section ingredient-checklist anchor-section">
        <div class="section-title-row">
          <h2>Ingredients</h2>
          <button id="resetIngredients" class="text-button" type="button">Reset ingredients</button>
        </div>
        ${renderIngredientChecklist(recipe)}
      </section>

      <section id="preparation" class="recipe-section anchor-section">
        <h2>Preparation</h2>
        ${renderList(recipe.preparation, true)}
      </section>

      <section id="method" class="recipe-section anchor-section">
        <h2>Cooking Method</h2>
        ${renderList(recipe.cookingMethod, true)}
      </section>

      <section id="serving" class="recipe-section anchor-section">
        <h2>Serving Suggestions</h2>
        ${renderList(recipe.servingSuggestions)}
      </section>

      <section id="notes" class="recipe-section anchor-section">
        <h2>Notes</h2>
        ${renderList(recipe.notes)}
      </section>
    </article>
  `;

  initialiseIngredientChecklist(recipe);
  initialiseSectionNavigation();
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
