const STANDARD_CUP_TO_RICE_CUP = 0.75;

function normalizeScalingUnit(unit = '') {
  return String(unit).replace(/[\s_-]/g, '').toLowerCase();
}

function getScaleOverride(item, scale) {
  if (!item.scaleQuantities) return null;

  const directValue = item.scaleQuantities[String(scale)];
  const quantity = Number(directValue);
  return Number.isFinite(quantity) ? quantity : null;
}

function getEffectiveQuantity(item, scale) {
  const override = getScaleOverride(item, scale);
  if (override != null) return override;
  return item.scalable === false ? item.quantity : item.quantity * scale;
}

function getEffectiveIngredientScale(item, scale, quantity) {
  if (getScaleOverride(item, scale) == null) return scale;

  const baseQuantity = Number(item.quantity);
  if (!Number.isFinite(baseQuantity) || baseQuantity === 0) return 1;
  return quantity / baseQuantity;
}

function formatCupEquivalent(item, quantity, effectiveScale) {
  const normalizedUnit = normalizeScalingUnit(item.unit);

  if (normalizedUnit === 'ricecup') {
    const standardCupQuantity = quantity / STANDARD_CUP_TO_RICE_CUP;
    return ` (${formatNumber(standardCupQuantity)} ${pluralizeUnit('standard cup', standardCupQuantity)})`;
  }

  if (item.riceCupEquivalent != null) {
    const riceCupQuantity = item.scalable === false
      ? item.riceCupEquivalent
      : item.riceCupEquivalent * effectiveScale;
    return ` (${formatNumber(riceCupQuantity)} ${pluralizeUnit('rice cup', riceCupQuantity)})`;
  }

  return '';
}

formatIngredient = function formatIngredientWithCupEquivalents(item, scale = 1) {
  if (typeof item === 'string') return item;
  if (item.displayText) return item.displayText;

  const preparation = item.preparation ? `, ${item.preparation}` : '';
  const quantity = getEffectiveQuantity(item, scale);
  const effectiveScale = getEffectiveIngredientScale(item, scale, quantity);

  if (item.countLabel) {
    const countItem = getScaleOverride(item, scale) == null
      ? item
      : { ...item, quantity };
    const countScale = getScaleOverride(item, scale) == null ? scale : 1;
    const count = formatPracticalCount(countItem, countScale);
    const label = pluralizeCountLabel(item.countLabel, count.numeric);
    const grams = formatGramWeight(item, effectiveScale);
    const gramsText = grams ? ` (${grams})` : '';
    return `${count.text} ${label}${gramsText}${preparation}`;
  }

  const formattedQuantity = formatNumber(quantity);
  const unit = pluralizeUnit(item.unit, quantity);
  const cupEquivalent = formatCupEquivalent(item, quantity, effectiveScale);
  const grams = formatGramWeight(item, effectiveScale);
  const gramsText = grams ? ` (${grams})` : '';

  return `${formattedQuantity} ${unit} ${item.ingredient}${cupEquivalent}${gramsText}${preparation}`
    .replace(/\s+/g, ' ')
    .trim();
};

function usesRiceCupScaling(recipe) {
  const scaling = recipe.scaling || {};
  return scaling.baseIngredient === 'rice'
    && normalizeScalingUnit(scaling.baseUnit) === 'ricecup'
    && Number.isFinite(Number(scaling.baseQuantity));
}

function formatScaleChoice(recipe, scale) {
  if (!usesRiceCupScaling(recipe)) return `${formatNumber(scale)}×`;

  const riceQuantity = Number(recipe.scaling.baseQuantity) * scale;
  return `${formatNumber(riceQuantity)} ${pluralizeUnit('rice cup', riceQuantity)}`;
}

renderScaleControls = function renderRecipeAwareScaleControls(recipe, scale) {
  if (!recipe.scaling?.enabled) return '';

  const options = recipe.scaling.options || [1];
  const isRiceBased = usesRiceCupScaling(recipe);
  const heading = isRiceBased ? 'Rice quantity' : 'Recipe scale';
  const current = formatScaleChoice(recipe, scale);
  const ariaLabel = isRiceBased ? 'Choose rice quantity' : 'Choose recipe scale';

  return `
    <section class="scale-panel" aria-label="${ariaLabel}">
      <div>
        <p class="eyebrow">${heading}</p>
        <p class="scale-current">Current: <strong>${current}</strong></p>
      </div>
      <div class="scale-options" role="group" aria-label="${ariaLabel}">
        ${options
          .map((option) => `
            <button
              class="scale-button${option === scale ? ' is-active' : ''}"
              type="button"
              data-scale="${option}"
              aria-pressed="${option === scale}"
            >${formatScaleChoice(recipe, option)}</button>
          `)
          .join('')}
      </div>
    </section>
  `;
};
