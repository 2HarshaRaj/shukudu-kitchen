const STANDARD_CUP_TO_RICE_CUP = 0.75;
const DISPLAY_EPSILON = 0.0005;

function normalizeScalingUnit(unit = '') {
  return String(unit).replace(/[\s_-]/g, '').toLowerCase();
}

function roundToIncrement(value, increment) {
  return Math.round(value / increment) * increment;
}

function isNearlyEqual(a, b, epsilon = DISPLAY_EPSILON) {
  return Math.abs(a - b) <= epsilon;
}

function trimDecimal(value, maximumFractionDigits) {
  return Number(value.toFixed(maximumFractionDigits)).toString();
}

function formatCupQuantity(quantity) {
  const quarterValue = roundToIncrement(quantity, 0.25);
  if (isNearlyEqual(quantity, quarterValue)) {
    return formatNumber(quarterValue);
  }

  const eighthValue = roundToIncrement(quantity, 0.125);
  if (isNearlyEqual(quantity, eighthValue)) {
    return trimDecimal(eighthValue, 3);
  }

  return trimDecimal(quantity, 2);
}

function formatPracticalMeasuredQuantity(quantity, unit = '') {
  const normalizedUnit = normalizeScalingUnit(unit);

  if (['ricecup', 'standardcup', 'cup'].includes(normalizedUnit)) {
    return formatCupQuantity(quantity);
  }

  if (['teaspoon', 'tablespoon', 'inch'].includes(normalizedUnit)) {
    return formatNumber(roundToIncrement(quantity, 0.25));
  }

  return formatNumber(quantity);
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
    return ` (${formatCupQuantity(standardCupQuantity)} ${pluralizeUnit('standard cup', standardCupQuantity)})`;
  }

  if (item.riceCupEquivalent != null) {
    const riceCupQuantity = item.scalable === false
      ? item.riceCupEquivalent
      : item.riceCupEquivalent * effectiveScale;
    return ` (${formatCupQuantity(riceCupQuantity)} ${pluralizeUnit('rice cup', riceCupQuantity)})`;
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

  const formattedQuantity = formatPracticalMeasuredQuantity(quantity, item.unit);
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

function usesQuantityInput(recipe) {
  const scaling = recipe.scaling || {};
  return scaling.inputMode === 'quantity'
    && scaling.baseIngredient
    && Number.isFinite(Number(scaling.baseQuantity))
    && Number(scaling.baseQuantity) > 0
    && scaling.baseUnit;
}

function formatQuantityInputValue(recipe, scale) {
  const quantity = Number(recipe.scaling.baseQuantity) * scale;
  const unit = recipe.scaling.baseUnit;
  const normalizedUnit = normalizeScalingUnit(unit);
  const formatted = formatPracticalMeasuredQuantity(quantity, unit);

  if (normalizedUnit === 'g') return `${formatted} g`;
  return `${formatted} ${pluralizeUnit(unit, quantity)}`;
}

function formatScaleChoice(recipe, scale) {
  if (usesRiceCupScaling(recipe)) {
    const riceQuantity = Number(recipe.scaling.baseQuantity) * scale;
    return `${formatCupQuantity(riceQuantity)} ${pluralizeUnit('rice cup', riceQuantity)}`;
  }

  if (usesQuantityInput(recipe)) {
    return formatQuantityInputValue(recipe, scale);
  }

  return `${formatNumber(scale)}×`;
}

loadScale = function loadRecipeScale(recipe) {
  const fallback = recipe.scaling?.baseScale || 1;
  const saved = Number.parseFloat(localStorage.getItem(getScaleKey(recipe.slug)));
  if (!Number.isFinite(saved) || saved <= 0) return fallback;

  if (usesQuantityInput(recipe)) return saved;

  const options = recipe.scaling?.options || [1];
  return options.includes(saved) ? saved : fallback;
};

renderScaleControls = function renderRecipeAwareScaleControls(recipe, scale) {
  if (!recipe.scaling?.enabled) return '';

  const options = recipe.scaling.options || [1];
  const isRiceBased = usesRiceCupScaling(recipe);
  const hasQuantityInput = usesQuantityInput(recipe);
  const heading = isRiceBased
    ? 'Rice quantity'
    : hasQuantityInput
      ? (recipe.scaling.inputLabel || 'Ingredient quantity')
      : 'Recipe scale';
  const current = formatScaleChoice(recipe, scale);
  const ariaLabel = `Choose ${heading.toLowerCase()}`;
  const inputQuantity = hasQuantityInput
    ? trimDecimal(Number(recipe.scaling.baseQuantity) * scale, 3)
    : '';
  const inputUnit = recipe.scaling.baseUnit || '';
  const inputStep = recipe.scaling.inputStep || (normalizeScalingUnit(inputUnit) === 'g' ? 1 : 0.01);
  const inputMin = recipe.scaling.inputMin || inputStep;

  return `
    <section class="scale-panel" aria-label="${escapeHtml(ariaLabel)}">
      <div class="scale-summary">
        <p class="eyebrow">${escapeHtml(heading)}</p>
        <p class="scale-current">Current: <strong>${escapeHtml(current)}</strong></p>
      </div>
      <div class="scale-control-area">
        <div class="scale-options" role="group" aria-label="${escapeHtml(ariaLabel)} presets">
          ${options
            .map((option) => `
              <button
                class="scale-button${isNearlyEqual(option, scale) ? ' is-active' : ''}"
                type="button"
                data-scale="${option}"
                aria-pressed="${isNearlyEqual(option, scale)}"
              >${escapeHtml(formatScaleChoice(recipe, option))}</button>
            `)
            .join('')}
        </div>
        ${hasQuantityInput ? `
          <form class="quantity-scale-form">
            <label for="quantityScaleInput">Exact ${escapeHtml(heading.toLowerCase())}</label>
            <div class="quantity-scale-row">
              <input
                id="quantityScaleInput"
                class="quantity-scale-input"
                type="number"
                inputmode="decimal"
                min="${inputMin}"
                step="${inputStep}"
                value="${inputQuantity}"
                aria-label="Exact ${escapeHtml(heading.toLowerCase())} in ${escapeHtml(inputUnit)}"
              >
              <span class="quantity-scale-unit">${escapeHtml(inputUnit)}</span>
              <button class="scale-apply-button" type="submit">Apply</button>
            </div>
          </form>
        ` : ''}
      </div>
    </section>
  `;
};

initialiseScaleControls = function initialiseRecipeAwareScaleControls(recipe, scale, onScaleChange) {
  const panel = recipeContent.querySelector('.scale-panel');
  if (!panel) return;

  panel.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-scale]');
    if (!button) return;

    const nextScale = Number.parseFloat(button.dataset.scale);
    if (!Number.isFinite(nextScale) || nextScale <= 0 || isNearlyEqual(nextScale, scale)) return;

    saveScale(recipe.slug, nextScale);
    onScaleChange(nextScale);
  });

  const form = panel.querySelector('.quantity-scale-form');
  if (!form || !usesQuantityInput(recipe)) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('.quantity-scale-input');
    const desiredQuantity = Number.parseFloat(input?.value);
    const baseQuantity = Number(recipe.scaling.baseQuantity);

    if (!Number.isFinite(desiredQuantity) || desiredQuantity <= 0 || !Number.isFinite(baseQuantity) || baseQuantity <= 0) {
      input?.focus();
      return;
    }

    const nextScale = Number((desiredQuantity / baseQuantity).toFixed(6));
    if (isNearlyEqual(nextScale, scale)) return;

    saveScale(recipe.slug, nextScale);
    onScaleChange(nextScale);
  });
};
