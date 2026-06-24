const CURRENT_MEAL_KEY = 'shukudu-kitchen:current-meal';

function loadCurrentMealSlugs() {
  try {
    const slugs = JSON.parse(localStorage.getItem(CURRENT_MEAL_KEY));
    return Array.isArray(slugs) ? [...new Set(slugs.filter((slug) => /^[a-z0-9-]+$/.test(slug)))] : [];
  } catch {
    return [];
  }
}


function formatCurrentMealLabel(count) {
  return count > 0 ? `Current Meal · ${count}` : 'Current Meal';
}

function updateCurrentMealLinks(slugs = loadCurrentMealSlugs()) {
  const count = Array.isArray(slugs) ? slugs.length : 0;
  document.querySelectorAll('[data-current-meal-link]').forEach((link) => {
    link.textContent = formatCurrentMealLabel(count);
    link.setAttribute('aria-label', formatCurrentMealLabel(count));
  });
}

function saveCurrentMealSlugs(slugs) {
  const safeSlugs = [...new Set((slugs || []).filter((slug) => /^[a-z0-9-]+$/.test(slug)))];
  localStorage.setItem(CURRENT_MEAL_KEY, JSON.stringify(safeSlugs));
  updateCurrentMealLinks(safeSlugs);
  window.dispatchEvent(new CustomEvent('current-meal-updated', { detail: { slugs: safeSlugs } }));
  return safeSlugs;
}

function isRecipeInCurrentMeal(slug) {
  return loadCurrentMealSlugs().includes(slug);
}

function addRecipeToCurrentMeal(slug) {
  const slugs = loadCurrentMealSlugs();
  if (!slugs.includes(slug)) slugs.push(slug);
  return saveCurrentMealSlugs(slugs);
}

function removeRecipeFromCurrentMeal(slug) {
  return saveCurrentMealSlugs(loadCurrentMealSlugs().filter((item) => item !== slug));
}

function clearCurrentMeal() {
  localStorage.removeItem(CURRENT_MEAL_KEY);
  updateCurrentMealLinks([]);
  window.dispatchEvent(new CustomEvent('current-meal-updated', { detail: { slugs: [] } }));
  return [];
}

window.addEventListener('current-meal-updated', (event) => updateCurrentMealLinks(event.detail?.slugs));
window.addEventListener('storage', (event) => {
  if (event.key === CURRENT_MEAL_KEY) updateCurrentMealLinks();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => updateCurrentMealLinks());
} else {
  updateCurrentMealLinks();
}
