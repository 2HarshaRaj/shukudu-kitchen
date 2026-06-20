function escapePairingHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function waitForRecipeDetails() {
  return new Promise((resolve) => {
    const existingDetails = document.getElementById('details');
    if (existingDetails) {
      resolve(existingDetails);
      return;
    }

    const observer = new MutationObserver(() => {
      const details = document.getElementById('details');
      if (!details) return;

      observer.disconnect();
      resolve(details);
    });

    observer.observe(document.getElementById('recipeContent'), {
      childList: true,
      subtree: true
    });
  });
}

function renderPairingLinks(pairingSlugs, recipeIndex) {
  const recipeBySlug = new Map(recipeIndex.map((recipe) => [recipe.slug, recipe]));

  return pairingSlugs
    .map((slug) => recipeBySlug.get(slug))
    .filter(Boolean)
    .map((recipe) => `
      <li>
        <a href="recipe.html?slug=${encodeURIComponent(recipe.slug)}">
          ${escapePairingHtml(recipe.name)}
        </a>
      </li>
    `)
    .join('');
}

function addPairingNavLink() {
  const nav = document.querySelector('.section-nav');
  if (!nav || nav.querySelector('a[href="#pairings"]')) return;

  const link = document.createElement('a');
  link.href = '#pairings';
  link.textContent = 'Goes Well With';

  const servingLink = nav.querySelector('a[href="#serving"]');
  if (servingLink) {
    nav.insertBefore(link, servingLink);
  } else {
    nav.appendChild(link);
  }
}

async function loadRecipePairings() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return;

  try {
    const [recipeResponse, indexResponse] = await Promise.all([
      fetch(`data/recipes/${slug}.json`),
      fetch('data/recipe-index.json')
    ]);

    if (!recipeResponse.ok || !indexResponse.ok) return;

    const recipe = await recipeResponse.json();
    const recipeIndex = await indexResponse.json();
    const pairingSlugs = Array.isArray(recipe.relationships?.goesWellWith)
      ? recipe.relationships.goesWellWith
      : [];

    if (!pairingSlugs.length || !Array.isArray(recipeIndex)) return;

    const links = renderPairingLinks(pairingSlugs, recipeIndex);
    if (!links) return;

    const detailsSection = await waitForRecipeDetails();
    const existingPairings = document.getElementById('pairings');
    if (existingPairings) existingPairings.remove();

    const section = document.createElement('section');
    section.id = 'pairings';
    section.className = 'recipe-section anchor-section';
    section.innerHTML = `
      <h2>Goes well with</h2>
      <ul>${links}</ul>
    `;

    detailsSection.insertAdjacentElement('afterend', section);
    addPairingNavLink();
  } catch {
    // Pairings are optional. Keep the recipe page usable if this enhancement fails.
  }
}

loadRecipePairings();
