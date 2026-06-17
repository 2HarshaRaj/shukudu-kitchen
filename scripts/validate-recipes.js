const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RECIPES_DIR = path.join(ROOT, 'data', 'recipes');
const VALID_BASE_UNITS = new Set(['g', 'riceCup', 'cup']);
const STANDARD_QUANTITY_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const DISALLOWED_ABBREVIATED_UNITS = new Set(['tsp', 'tbsp']);

let totalErrors = 0;

function addError(errors, message) {
  errors.push(message);
  totalErrors += 1;
}

function readJson(filePath, errors) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    addError(errors, `Invalid JSON: ${error.message}`);
    return null;
  }
}

function arraysMatch(actual, expected) {
  if (!Array.isArray(actual) || actual.length !== expected.length) return false;
  return expected.every((value, index) => Number(actual[index]) === value);
}

function walkIngredients(recipe, callback) {
  const groups = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  groups.forEach((group, groupIndex) => {
    const items = Array.isArray(group.items) ? group.items : [];
    items.forEach((item, itemIndex) => callback(item, group, groupIndex, itemIndex));
  });
}

function collectIngredientIds(recipe, errors) {
  const ids = new Set();
  const idCounts = new Map();

  walkIngredients(recipe, (item) => {
    if (!item || typeof item !== 'object' || typeof item === 'string') return;
    if (!item.id) return;

    const count = (idCounts.get(item.id) || 0) + 1;
    idCounts.set(item.id, count);

    if (ids.has(item.id)) {
      addError(errors, `Duplicate ingredient id "${item.id}"`);
    }
    ids.add(item.id);
  });

  return { ids, idCounts };
}

function validateTopLevel(recipe, errors) {
  ['name', 'slug', 'category', 'summary', 'ingredients', 'preparation', 'cookingMethod'].forEach((field) => {
    if (recipe[field] == null) addError(errors, `Missing top-level field "${field}"`);
  });

  if (!Array.isArray(recipe.ingredients)) addError(errors, 'ingredients must be an array');
  if (!Array.isArray(recipe.preparation)) addError(errors, 'preparation must be an array');
  if (!Array.isArray(recipe.cookingMethod)) addError(errors, 'cookingMethod must be an array');
}

function validateQuantityScaling(recipe, ingredientInfo, errors) {
  const scaling = recipe.scaling;
  if (!scaling || scaling.inputMode !== 'quantity') return;

  if (!scaling.baseIngredient) {
    addError(errors, 'quantity-input scaling requires baseIngredient');
  } else {
    const matchCount = ingredientInfo.idCounts.get(scaling.baseIngredient) || 0;
    if (matchCount === 0) {
      addError(errors, `baseIngredient "${scaling.baseIngredient}" does not match any ingredient id`);
    } else if (matchCount !== 1) {
      addError(errors, `baseIngredient "${scaling.baseIngredient}" must match exactly one ingredient id; found ${matchCount}`);
    }
  }

  if (!Number.isFinite(Number(scaling.baseQuantity)) || Number(scaling.baseQuantity) <= 0) {
    addError(errors, 'quantity-input scaling requires positive numeric baseQuantity');
  }

  if (!scaling.baseUnit) {
    addError(errors, 'quantity-input scaling requires baseUnit');
  } else if (!VALID_BASE_UNITS.has(scaling.baseUnit)) {
    addError(errors, `quantity-input baseUnit must be one of ${Array.from(VALID_BASE_UNITS).join(', ')}; found "${scaling.baseUnit}"`);
  }

  if (!scaling.inputLabel) {
    addError(errors, 'quantity-input scaling requires inputLabel');
  } else if (!/ quantity$/i.test(scaling.inputLabel.trim())) {
    addError(errors, 'quantity-input inputLabel should end with "quantity"');
  }

  if (!Array.isArray(scaling.options) || scaling.options.length < 2) {
    addError(errors, 'quantity-input scaling requires scaling.options with at least two preset values');
  } else if (!arraysMatch(scaling.options, STANDARD_QUANTITY_OPTIONS)) {
    addError(errors, `quantity-input scaling.options must be [${STANDARD_QUANTITY_OPTIONS.join(', ')}]`);
  }
}

function validateIngredientUnits(recipe, errors) {
  walkIngredients(recipe, (item) => {
    if (!item || typeof item !== 'object' || typeof item === 'string' || !item.unit) return;
    if (DISALLOWED_ABBREVIATED_UNITS.has(item.unit)) {
      addError(errors, `Ingredient "${item.id || item.ingredient || 'unknown'}" uses abbreviated unit "${item.unit}"; use "teaspoon" or "tablespoon"`);
    }
  });
}

function validateStepIngredientIds(recipe, ingredientIds, errors) {
  ['preparation', 'cookingMethod'].forEach((sectionName) => {
    const steps = Array.isArray(recipe[sectionName]) ? recipe[sectionName] : [];
    steps.forEach((step, stepIndex) => {
      const refs = Array.isArray(step.ingredientIds) ? step.ingredientIds : [];
      refs.forEach((id) => {
        if (!ingredientIds.has(id)) {
          addError(errors, `${sectionName}[${stepIndex}] references missing ingredient id "${id}"`);
        }
      });
    });
  });
}

function validateHardcodedWater(recipe, ingredientIds, errors) {
  const hasWaterIngredient = ingredientIds.has('water');
  const steps = Array.isArray(recipe.cookingMethod) ? recipe.cookingMethod : [];

  steps.forEach((step, stepIndex) => {
    if (!step || typeof step !== 'object' || typeof step.text !== 'string') return;
    const text = step.text.toLowerCase();
    const mentionsMeasuredWater = /\b\d+(\.\d+)?\s*(tsp|tbsp|teaspoon|tablespoon|cup|cups|ml|g)\s+water\b/.test(text)
      || /\bsprinkle\s+\d+/i.test(step.text);

    if (mentionsMeasuredWater && !hasWaterIngredient) {
      addError(errors, `cookingMethod[${stepIndex}] appears to hard-code water; add water as an ingredient and reference it with ingredientIds`);
    }
  });
}

function validateRecipe(fileName) {
  const filePath = path.join(RECIPES_DIR, fileName);
  const errors = [];
  const recipe = readJson(filePath, errors);

  if (recipe) {
    validateTopLevel(recipe, errors);
    const ingredientInfo = collectIngredientIds(recipe, errors);
    validateQuantityScaling(recipe, ingredientInfo, errors);
    validateIngredientUnits(recipe, errors);
    validateStepIngredientIds(recipe, ingredientInfo.ids, errors);
    validateHardcodedWater(recipe, ingredientInfo.ids, errors);
  }

  if (errors.length) {
    console.log(`\n${fileName}`);
    errors.forEach((error) => console.log(`  ✗ ${error}`));
  }
}

function main() {
  if (!fs.existsSync(RECIPES_DIR)) {
    console.error(`Recipes directory not found: ${RECIPES_DIR}`);
    process.exit(1);
  }

  const recipeFiles = fs.readdirSync(RECIPES_DIR)
    .filter((file) => file.endsWith('.json'))
    .sort();

  recipeFiles.forEach(validateRecipe);

  if (totalErrors > 0) {
    console.log(`\nRecipe validation failed with ${totalErrors} error(s).`);
    process.exit(1);
  }

  console.log(`✓ Recipe validation passed for ${recipeFiles.length} recipe file(s).`);
}

main();
