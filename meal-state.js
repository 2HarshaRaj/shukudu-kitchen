const CURRENT_MEAL_KEY = 'shukudu-kitchen:current-meal';

function loadCurrentMealSlugs() {
  try {
    const slugs = JSON.parse(localStorage.getItem(CURRENT_MEAL_KEY));
    return Array.isArray(slugs) ? [...new Set(slugs.filter((slug) => /^[a-z0-9-]+$/.test(slug)))] : [];
  } catch {
    return [];
  }
}

function saveCurrentMealSlugs(slugs) {
  const safeSlugs = [...new Set((slugs || []).filter((slug) => /^[a-z0-9-]+$/.test(slug)))];
  localStorage.setItem(CURRENT_MEAL_KEY, JSON.stringify(safeSlugs));
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
  window.dispatchEvent(new CustomEvent('current-meal-updated', { detail: { slugs: [] } }));
  return [];
}
