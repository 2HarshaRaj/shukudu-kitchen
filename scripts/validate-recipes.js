const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RECIPES_DIR = path.join(ROOT, 'data', 'recipes');
const VALID_BASE_UNITS = new Set(['g', 'riceCup', 'cup']);

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

function collectIngredientIds(recipe, errors) {
  const ids = new Set();
  const groups = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

  groups.forEach((group, groupIndex) => {
    const items = Array.isArray(group.items) ? group.items : [];
    items.forEach((item, itemIndex) => {
      if (!item || typeof item !== 'object' || typeof item === 'string') return;
      if (!item.id) return;
      if (ids.has(item.id)) {
        addError(errors, `Duplicate ingredient id "${item.id}"`);
      }
      ids.add(item.id);
    });
  });

  return ids;
}

function validateTopLevel(recipe, errors) {
  ['name', 'slug', 'category', 'summary', 'ingredients', 'preparation', 'cookingMethod'].forEach((field) => {
    if (recipe[field] == null) addError(errors, `Missing top-level field "${field}"`);
  });

  if (!Array.isArray(recipe.ingredients)) addError(errors, 'ingredients must be an array');
  if (!Array.isArray(recipe.preparation)) addError(errors, 'preparation must be an array');
  if (!Array.isArray(recipe.cookingMethod)) addError(errors, 'cookingMethod must be an array');
}

function validateQuantityScaling(recipe, ingredientIds, errors) {
  const scaling = recipe.scaling;
  if (!scaling || scaling.inputMode !== 'quantity') return;

  if (!scaling.baseIngredient) {
    addError(errors, 'quantity-input scaling requires baseIngredient');
  } else if (!ingredientIds.has(scaling.baseIngredient)) {
    addError(errors, `baseIngredient "${scaling.baseIngredient}" does not match any ingredient id`);
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
  }
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

function validateRecipe(fileName) {
  const filePath = path.join(RECIPES_DIR, fileName);
  const errors = [];
  const recipe = readJson(filePath, errors);

  if (recipe) {
    validateTopLevel(recipe, errors);
    const ingredientIds = collectIngredientIds(recipe, errors);
    validateQuantityScaling(recipe, ingredientIds, errors);
    validateStepIngredientIds(recipe, ingredientIds, errors);
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
