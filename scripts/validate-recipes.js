const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RECIPES_DIR = path.join(ROOT, 'data', 'recipes');
const RECIPE_INDEX_FILE = path.join(ROOT, 'data', 'recipe-index.json');
const VALID_BASE_UNITS = new Set(['g', 'riceCup', 'cup']);
const STANDARD_QUANTITY_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const DISALLOWED_ABBREVIATED_UNITS = new Set(['tsp', 'tbsp']);
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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

function isValidSlug(slug) {
  return typeof slug === 'string' && SLUG_PATTERN.test(slug);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
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

function validateDetails(recipe, errors) {
  if (!recipe.details || typeof recipe.details !== 'object' || Array.isArray(recipe.details)) {
    addError(errors, 'details must be an object');
    return;
  }

  ['Cuisine', 'Meal Type', 'Status'].forEach((field) => {
    if (!isNonEmptyString(recipe.details[field])) {
      addError(errors, `details requires non-empty "${field}"`);
    }
  });
}

function validateStringArray(recipe, fieldName, errors) {
  if (recipe[fieldName] == null) return;

  if (!Array.isArray(recipe[fieldName])) {
    addError(errors, `${fieldName} must be an array when present`);
    return;
  }

  recipe[fieldName].forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      addError(errors, `${fieldName}[${index}] must be a non-empty string`);
    }
  });
}

function validateSlug(recipe, fileName, errors) {
  if (!recipe.slug) return;

  if (!isValidSlug(recipe.slug)) {
    addError(errors, `slug "${recipe.slug}" must use lowercase letters/numbers separated by single hyphens`);
    return;
  }

  const expectedFileName = `${recipe.slug}.json`;
  if (fileName !== expectedFileName) {
    addError(errors, `file name must match slug; expected "${expectedFileName}" but found "${fileName}"`);
  }
}

function validateIngredientGroups(recipe, errors) {
  if (!Array.isArray(recipe.ingredients)) return;

  recipe.ingredients.forEach((group, groupIndex) => {
    if (!group || typeof group !== 'object' || Array.isArray(group)) {
      addError(errors, `ingredients[${groupIndex}] must be an object with section and items`);
      return;
    }

    if (Object.prototype.hasOwnProperty.call(group, 'category')) {
      addError(errors, `ingredients[${groupIndex}] uses legacy "category"; use "section"`);
    }

    if (!group.section || typeof group.section !== 'string') {
      addError(errors, `ingredients[${groupIndex}] requires a section heading`);
    }

    if (!Array.isArray(group.items)) {
      addError(errors, `ingredients[${groupIndex}] requires an items array`);
    }
  });
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

function validateStepStructure(recipe, errors) {
  ['preparation', 'cookingMethod'].forEach((sectionName) => {
    const steps = Array.isArray(recipe[sectionName]) ? recipe[sectionName] : [];

    steps.forEach((step, stepIndex) => {
      if (!step || typeof step !== 'object' || Array.isArray(step)) {
        addError(errors, `${sectionName}[${stepIndex}] must be an object`);
        return;
      }

      const hasText = Object.prototype.hasOwnProperty.call(step, 'text');
      const hasLead = Object.prototype.hasOwnProperty.call(step, 'lead');
      const hasIngredientIds = Object.prototype.hasOwnProperty.call(step, 'ingredientIds');
      const hasAfter = Object.prototype.hasOwnProperty.call(step, 'after');

      if (!hasText && !hasLead) {
        addError(errors, `${sectionName}[${stepIndex}] requires either text or lead`);
      }

      if (hasText && !isNonEmptyString(step.text)) {
        addError(errors, `${sectionName}[${stepIndex}].text must be a non-empty string`);
      }

      if (hasLead && !isNonEmptyString(step.lead)) {
        addError(errors, `${sectionName}[${stepIndex}].lead must be a non-empty string`);
      }

      if (hasLead && !hasIngredientIds) {
        addError(errors, `${sectionName}[${stepIndex}] with lead requires ingredientIds`);
      }

      if (hasIngredientIds && !Array.isArray(step.ingredientIds)) {
        addError(errors, `${sectionName}[${stepIndex}].ingredientIds must be an array`);
      }

      if (hasIngredientIds && Array.isArray(step.ingredientIds) && step.ingredientIds.length === 0) {
        addError(errors, `${sectionName}[${stepIndex}].ingredientIds must not be empty`);
      }

      if (hasIngredientIds && !hasLead) {
        addError(errors, `${sectionName}[${stepIndex}] with ingredientIds requires lead`);
      }

      if (hasAfter && !isNonEmptyString(step.after)) {
        addError(errors, `${sectionName}[${stepIndex}].after must be a non-empty string when present`);
      }
    });
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

function validateRecipe(fileName, recipeMap) {
  const filePath = path.join(RECIPES_DIR, fileName);
  const errors = [];
  const recipe = readJson(filePath, errors);

  if (recipe) {
    validateTopLevel(recipe, errors);
    validateDetails(recipe, errors);
    validateStringArray(recipe, 'servingSuggestions', errors);
    validateStringArray(recipe, 'notes', errors);
    validateSlug(recipe, fileName, errors);
    validateIngredientGroups(recipe, errors);
    validateStepStructure(recipe, errors);
    const ingredientInfo = collectIngredientIds(recipe, errors);
    validateQuantityScaling(recipe, ingredientInfo, errors);
    validateIngredientUnits(recipe, errors);
    validateStepIngredientIds(recipe, ingredientInfo.ids, errors);
    validateHardcodedWater(recipe, ingredientInfo.ids, errors);

    if (recipe.slug) {
      recipeMap.set(recipe.slug, { fileName, recipe });
    }
  }

  if (errors.length) {
    console.log(`\n${fileName}`);
    errors.forEach((error) => console.log(`  ✗ ${error}`));
  }
}

function validateRecipeIndex(recipeFiles, recipeMap) {
  const errors = [];
  const index = readJson(RECIPE_INDEX_FILE, errors);

  if (!Array.isArray(index)) {
    addError(errors, 'recipe-index.json must be an array');
  }

  if (!Array.isArray(index)) {
    console.log('\nrecipe-index.json');
    errors.forEach((error) => console.log(`  ✗ ${error}`));
    return;
  }

  const indexedSlugs = new Set();
  const indexedSlugCounts = new Map();

  index.forEach((entry, indexPosition) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      addError(errors, `recipe-index[${indexPosition}] must be an object`);
      return;
    }

    ['name', 'slug', 'category', 'summary'].forEach((field) => {
      if (entry[field] == null || entry[field] === '') {
        addError(errors, `recipe-index[${indexPosition}] missing "${field}"`);
      }
    });

    if (!entry.slug) return;

    if (!isValidSlug(entry.slug)) {
      addError(errors, `recipe-index slug "${entry.slug}" must use lowercase letters/numbers separated by single hyphens`);
      return;
    }

    const count = (indexedSlugCounts.get(entry.slug) || 0) + 1;
    indexedSlugCounts.set(entry.slug, count);
    if (count > 1) {
      addError(errors, `Duplicate recipe-index slug "${entry.slug}"`);
    }
    indexedSlugs.add(entry.slug);

    const expectedFileName = `${entry.slug}.json`;
    if (!recipeFiles.includes(expectedFileName)) {
      addError(errors, `recipe-index slug "${entry.slug}" references missing file data/recipes/${expectedFileName}`);
      return;
    }

    const recipeInfo = recipeMap.get(entry.slug);
    if (!recipeInfo) {
      addError(errors, `recipe-index slug "${entry.slug}" does not match any recipe JSON slug`);
      return;
    }

    ['name', 'category', 'summary'].forEach((field) => {
      if (entry[field] !== recipeInfo.recipe[field]) {
        addError(errors, `recipe-index slug "${entry.slug}" has ${field} mismatch; index has "${entry[field]}", recipe has "${recipeInfo.recipe[field]}"`);
      }
    });
  });

  recipeMap.forEach((recipeInfo, slug) => {
    if (!indexedSlugs.has(slug)) {
      addError(errors, `data/recipes/${recipeInfo.fileName} exists but slug "${slug}" is missing from recipe-index.json`);
    }
  });

  if (errors.length) {
    console.log('\nrecipe-index.json');
    errors.forEach((error) => console.log(`  ✗ ${error}`));
  }
}

function main() {
  if (!fs.existsSync(RECIPES_DIR)) {
    console.error(`Recipes directory not found: ${RECIPES_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(RECIPE_INDEX_FILE)) {
    console.error(`Recipe index not found: ${RECIPE_INDEX_FILE}`);
    process.exit(1);
  }

  const recipeFiles = fs.readdirSync(RECIPES_DIR)
    .filter((file) => file.endsWith('.json'))
    .sort();

  const recipeMap = new Map();
  recipeFiles.forEach((fileName) => validateRecipe(fileName, recipeMap));
  validateRecipeIndex(recipeFiles, recipeMap);

  if (totalErrors > 0) {
    console.log(`\nRecipe validation failed with ${totalErrors} error(s).`);
    process.exit(1);
  }

  console.log(`✓ Recipe validation passed for ${recipeFiles.length} recipe file(s).`);
}

main();
