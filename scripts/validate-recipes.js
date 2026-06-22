const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RECIPES_DIR = path.join(ROOT, 'data', 'recipes');
const RECIPE_INDEX_FILE = path.join(ROOT, 'data', 'recipe-index.json');
const NON_LINEAR_RULES_FILE = path.join(ROOT, 'data', 'validation', 'non-linear-ingredients.json');

const VALID_BASE_UNITS = new Set(['g', 'riceCup', 'cup']);
const STANDARD_QUANTITY_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const DISALLOWED_ABBREVIATED_UNITS = new Set(['tsp', 'tbsp']);
const VALID_SCALING_MODES = new Set(['linear', 'non-linear']);
const VALID_ROUNDING_TYPES = new Set(['exact', 'small-whole', 'large-produce']);
const VALID_MEAL_TYPES = new Set(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Side']);
const VALID_DISH_TYPES = new Set(['Rice', 'Bath', 'Palya', 'Rasam', 'Dal', 'Side Dish', 'One Pot', 'Cereal']);
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const REFERENCE_QUANTITY_RECOMMENDED_TERMS = ['rice', 'dal', 'poha', 'avalakki', 'rava', 'sooji', 'flour', 'besan'];

let totalErrors = 0;
let totalWarnings = 0;

function addError(errors, message) {
  errors.push(message);
  totalErrors += 1;
}

function addWarning(warnings, message) {
  warnings.push(message);
  totalWarnings += 1;
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

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function getIngredientLabel(item) {
  return item.id || item.ingredient || 'unknown';
}

function walkIngredients(recipe, callback) {
  const groups = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  groups.forEach((group, groupIndex) => {
    const items = Array.isArray(group.items) ? group.items : [];
    items.forEach((item, itemIndex) => callback(item, group, groupIndex, itemIndex));
  });
}

function loadNonLinearRules(errors) {
  if (!fs.existsSync(NON_LINEAR_RULES_FILE)) {
    addError(errors, 'Missing data/validation/non-linear-ingredients.json');
    return [];
  }

  const config = readJson(NON_LINEAR_RULES_FILE, errors);
  if (!config) return [];

  if (!Array.isArray(config.rules)) {
    addError(errors, 'non-linear-ingredients.json requires a rules array');
    return [];
  }

  const ruleKeys = new Map();
  const matchValues = new Map();

  config.rules.forEach((rule, index) => {
    if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
      addError(errors, `non-linear-ingredients.rules[${index}] must be an object`);
      return;
    }

    if (!isNonEmptyString(rule.key)) {
      addError(errors, `non-linear-ingredients.rules[${index}] requires a non-empty key`);
    } else {
      if (!isValidSlug(rule.key)) {
        addError(errors, `non-linear-ingredients.rules[${index}].key "${rule.key}" must use slug format`);
      }

      if (ruleKeys.has(rule.key)) {
        addError(errors, `Duplicate non-linear ingredient key "${rule.key}"`);
      }
      ruleKeys.set(rule.key, index);
    }

    if (!Array.isArray(rule.match) || rule.match.length === 0) {
      addError(errors, `non-linear-ingredients.rules[${index}] requires a non-empty match array`);
    } else {
      rule.match.forEach((term, termIndex) => {
        if (!isNonEmptyString(term)) {
          addError(errors, `non-linear-ingredients.rules[${index}].match[${termIndex}] must be a non-empty string`);
          return;
        }

        const normalizedTerm = normalizeText(term);
        if (matchValues.has(normalizedTerm)) {
          addError(errors, `Duplicate non-linear ingredient match value "${term}"`);
        }
        matchValues.set(normalizedTerm, { ruleIndex: index, termIndex });
      });
    }

    if (rule.reason != null && !isNonEmptyString(rule.reason)) {
      addError(errors, `non-linear-ingredients.rules[${index}].reason must be a non-empty string when present`);
    }
  });

  return config.rules;
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

  ['Cuisine', 'Status'].forEach((field) => {
    if (!isNonEmptyString(recipe.details[field])) {
      addError(errors, `details requires non-empty "${field}"`);
    }
  });
}

function validateRelationshipArray(relationships, fieldName, allowedValues, errors) {
  const value = relationships[fieldName];

  if (!Array.isArray(value)) {
    addError(errors, `relationships.${fieldName} must be an array`);
    return;
  }

  if (fieldName !== 'goesWellWith' && value.length === 0) {
    addError(errors, `relationships.${fieldName} must not be empty`);
  }

  const seen = new Set();
  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      addError(errors, `relationships.${fieldName}[${index}] must be a non-empty string`);
      return;
    }

    if (seen.has(item)) {
      addError(errors, `relationships.${fieldName} contains duplicate value "${item}"`);
    }
    seen.add(item);

    if (allowedValues && !allowedValues.has(item)) {
      addError(errors, `relationships.${fieldName}[${index}] has unsupported value "${item}"`);
    }
  });
}

function validateRelationships(recipe, errors) {
  if (!recipe.relationships || typeof recipe.relationships !== 'object' || Array.isArray(recipe.relationships)) {
    addError(errors, 'relationships must be an object');
    return;
  }

  validateRelationshipArray(recipe.relationships, 'mealTypes', VALID_MEAL_TYPES, errors);
  validateRelationshipArray(recipe.relationships, 'dishTypes', VALID_DISH_TYPES, errors);
  validateRelationshipArray(recipe.relationships, 'goesWellWith', null, errors);

  if (Array.isArray(recipe.relationships.goesWellWith)) {
    recipe.relationships.goesWellWith.forEach((slug, index) => {
      if (isNonEmptyString(slug) && !isValidSlug(slug)) {
        addError(errors, `relationships.goesWellWith[${index}] must use recipe slug format`);
      }
      if (slug === recipe.slug) {
        addError(errors, 'relationships.goesWellWith must not reference the recipe itself');
      }
    });
  }
}

function validateHouseholdBase(recipe, errors) {
  if (recipe.householdBase == null) return;

  const householdBase = recipe.householdBase;
  if (!householdBase || typeof householdBase !== 'object' || Array.isArray(householdBase)) {
    addError(errors, 'householdBase must be an object when present');
    return;
  }

  const people = Number(householdBase.people);
  const meals = Number(householdBase.meals);

  if (!Number.isFinite(people) || people <= 0) {
    addError(errors, 'householdBase.people must be a positive number');
  }

  if (!Number.isFinite(meals) || meals <= 0) {
    addError(errors, 'householdBase.meals must be a positive number');
  }

  if (!isNonEmptyString(householdBase.label)) {
    addError(errors, 'householdBase.label must be a non-empty string');
    return;
  }

  const label = householdBase.label.toLowerCase();
  if (Number.isFinite(people) && !label.includes(String(people))) {
    addError(errors, 'householdBase.label should include the people number');
  }

  if (Number.isFinite(meals) && !label.includes(String(meals))) {
    addError(errors, 'householdBase.label should include the meals number');
  }

  if (!/\bpeople?\b/.test(label) || !/\bmeals?\b/.test(label)) {
    addError(errors, 'householdBase.label should include readable people and meals wording');
  }
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

function validateScalingBaseIngredient(recipe, ingredientInfo, errors) {
  const scaling = recipe.scaling;
  if (!scaling || scaling.enabled !== true) return;
  if (!Object.prototype.hasOwnProperty.call(scaling, 'baseIngredient')) return;

  if (!isNonEmptyString(scaling.baseIngredient)) {
    addError(errors, 'scaling.baseIngredient must be a non-empty string when present');
    return;
  }

  const matchCount = ingredientInfo.idCounts.get(scaling.baseIngredient) || 0;
  if (matchCount === 0) {
    addError(errors, `baseIngredient "${scaling.baseIngredient}" does not match any ingredient id`);
  } else if (matchCount !== 1) {
    addError(errors, `baseIngredient "${scaling.baseIngredient}" must match exactly one ingredient id; found ${matchCount}`);
  }
}

function validateQuantityScaling(recipe, errors) {
  const scaling = recipe.scaling;
  if (!scaling || scaling.inputMode !== 'quantity') return;

  if (!scaling.baseIngredient) {
    addError(errors, 'quantity-input scaling requires baseIngredient');
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

function validateRiceRecipeUnits(recipe, errors) {
  if (recipe.category !== 'Rice') return;

  const scaling = recipe.scaling;
  if (scaling && scaling.enabled === true && scaling.baseUnit !== 'riceCup') {
    addError(errors, 'Rice recipes must use scaling.baseUnit "riceCup"');
  }

  walkIngredients(recipe, (item) => {
    if (!item || typeof item !== 'object' || typeof item === 'string') return;

    const label = getIngredientLabel(item);
    if (item.id === 'rice' && item.unit !== 'rice cup') {
      addError(errors, `Rice recipe ingredient "${label}" must use unit "rice cup"`);
    }

    if (item.id === 'water' && item.unit !== 'rice cup') {
      addError(errors, `Rice recipe ingredient "${label}" must use unit "rice cup"`);
    }
  });
}

function validateIngredientUnits(recipe, errors) {
  walkIngredients(recipe, (item) => {
    if (!item || typeof item !== 'object' || typeof item === 'string' || !item.unit) return;
    if (DISALLOWED_ABBREVIATED_UNITS.has(item.unit)) {
      addError(errors, `Ingredient "${getIngredientLabel(item)}" uses abbreviated unit "${item.unit}"; use "teaspoon" or "tablespoon"`);
    }
  });
}

function validateScalingModes(recipe, errors) {
  walkIngredients(recipe, (item) => {
    if (!item || typeof item !== 'object' || typeof item === 'string') return;
    if (item.scalingMode == null) return;

    const label = getIngredientLabel(item);
    const hasScaleQuantities = Object.prototype.hasOwnProperty.call(item, 'scaleQuantities');

    if (!VALID_SCALING_MODES.has(item.scalingMode)) {
      addError(errors, `Ingredient "${label}" has invalid scalingMode "${item.scalingMode}"; use "linear" or "non-linear"`);
      return;
    }

    if (item.scalingMode === 'linear' && hasScaleQuantities) {
      addError(errors, `Ingredient "${label}" has scalingMode "linear" but also defines scaleQuantities`);
    }

    if (item.scalingMode === 'non-linear' && !hasScaleQuantities) {
      addError(errors, `Ingredient "${label}" has scalingMode "non-linear" but is missing scaleQuantities`);
    }
  });
}

function validateRoundingTypes(recipe, errors) {
  walkIngredients(recipe, (item) => {
    if (!item || typeof item !== 'object' || typeof item === 'string') return;

    const label = getIngredientLabel(item);
    const hasQuantity = Object.prototype.hasOwnProperty.call(item, 'quantity');

    if (item.roundingType != null && !VALID_ROUNDING_TYPES.has(item.roundingType)) {
      addError(errors, `Ingredient "${label}" has invalid roundingType "${item.roundingType}"; use "exact", "small-whole", or "large-produce"`);
    }

    if (item.scalable === true && hasQuantity && item.roundingType == null) {
      addError(errors, `Ingredient "${label}" is scalable and has quantity but is missing roundingType`);
    }
  });
}

function validateDisplayTextSafety(recipe, errors) {
  walkIngredients(recipe, (item) => {
    if (!item || typeof item !== 'object' || typeof item === 'string') return;

    const label = getIngredientLabel(item);
    const hasDisplayText = Object.prototype.hasOwnProperty.call(item, 'displayText');
    const hasQuantity = Object.prototype.hasOwnProperty.call(item, 'quantity');

    if (hasDisplayText && !hasQuantity && item.scalable !== false) {
      addError(errors, `Ingredient "${label}" uses displayText without quantity and must be scalable: false`);
    }
  });
}

function validateScaleQuantities(recipe, errors) {
  const options = recipe.scaling && Array.isArray(recipe.scaling.options)
    ? recipe.scaling.options.map(String)
    : [];

  walkIngredients(recipe, (item) => {
    if (!item || typeof item !== 'object' || typeof item === 'string') return;
    if (!Object.prototype.hasOwnProperty.call(item, 'scaleQuantities')) return;

    const label = getIngredientLabel(item);

    if (item.scalable !== true) {
      addError(errors, `Ingredient "${label}" has scaleQuantities but scalable is not true`);
    }

    if (options.length === 0) {
      addError(errors, `Ingredient "${label}" has scaleQuantities but recipe has no scaling.options`);
      return;
    }

    if (!item.scaleQuantities || typeof item.scaleQuantities !== 'object' || Array.isArray(item.scaleQuantities)) {
      addError(errors, `Ingredient "${label}" scaleQuantities must be an object`);
      return;
    }

    const actualKeys = Object.keys(item.scaleQuantities);

    options.forEach((key) => {
      if (!actualKeys.includes(key)) {
        addError(errors, `Ingredient "${label}" scaleQuantities missing key "${key}" from scaling.options`);
      }
    });

    actualKeys.forEach((key) => {
      if (!options.includes(key)) {
        addError(errors, `Ingredient "${label}" scaleQuantities has unsupported key "${key}"`);
      }

      const value = item.scaleQuantities[key];
      if (!Number.isFinite(Number(value))) {
        addError(errors, `Ingredient "${label}" scaleQuantities["${key}"] must be a number`);
      } else if (Number(value) < 0) {
        addError(errors, `Ingredient "${label}" scaleQuantities["${key}"] must not be negative`);
      }
    });
  });
}

function ingredientMatchesRule(item, rule) {
  const haystack = [
    item.id,
    item.ingredient,
    item.countLabel,
    item.displayText
  ].map(normalizeText).join(' ');

  return Array.isArray(rule.match) && rule.match.some((term) => haystack.includes(normalizeText(term)));
}

function ingredientContainsWholeWord(item, terms) {
  const haystack = [
    item.id,
    item.ingredient,
    item.countLabel,
    item.displayText
  ].map(normalizeText).join(' ');

  return terms.some((term) => new RegExp(`(^|[^a-z0-9])${term}([^a-z0-9]|$)`, 'i').test(haystack));
}

function validateReferenceQuantities(recipe, errors, warnings) {
  walkIngredients(recipe, (item) => {
    if (!item || typeof item !== 'object' || typeof item === 'string') return;

    const label = getIngredientLabel(item);
    const hasReferenceQuantity = Object.prototype.hasOwnProperty.call(item, 'referenceQuantity');

    if (hasReferenceQuantity) {
      const reference = item.referenceQuantity;
      if (!reference || typeof reference !== 'object' || Array.isArray(reference)) {
        addError(errors, `Ingredient "${label}" referenceQuantity must be an object`);
        return;
      }

      if (!Number.isFinite(Number(reference.quantity)) || Number(reference.quantity) <= 0) {
        addError(errors, `Ingredient "${label}" referenceQuantity.quantity must be a positive number`);
      }

      if (!isNonEmptyString(reference.unit)) {
        addError(errors, `Ingredient "${label}" referenceQuantity.unit must be a non-empty string`);
      }

      if (reference.approx != null && typeof reference.approx !== 'boolean') {
        addError(errors, `Ingredient "${label}" referenceQuantity.approx must be boolean when present`);
      }
    }

    if (
      item.scalable === true
      && item.unit === 'g'
      && !hasReferenceQuantity
      && ingredientContainsWholeWord(item, REFERENCE_QUANTITY_RECOMMENDED_TERMS)
    ) {
      addWarning(warnings, `Ingredient "${label}" is a gram-based pantry staple and should include referenceQuantity for cup/spoon display`);
    }
  });
}

function validateRequiredNonLinearScaleQuantities(recipe, nonLinearRules, errors) {
  walkIngredients(recipe, (item) => {
    if (!item || typeof item !== 'object' || typeof item === 'string') return;
    if (item.scalable !== true) return;
    if (item.scalingMode === 'linear') return;

    const label = getIngredientLabel(item);
    const explicitNonLinear = item.scalingMode === 'non-linear';
    const matchedRule = nonLinearRules.find((rule) => ingredientMatchesRule(item, rule));

    if ((explicitNonLinear || matchedRule) && !Object.prototype.hasOwnProperty.call(item, 'scaleQuantities')) {
      const reason = matchedRule && matchedRule.reason ? ` (${matchedRule.reason})` : '';
      addError(errors, `Ingredient "${label}" appears to be non-linear and must define scaleQuantities${reason}`);
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

function validateRecipe(fileName, recipeMap, nonLinearRules) {
  const filePath = path.join(RECIPES_DIR, fileName);
  const errors = [];
  const warnings = [];
  const recipe = readJson(filePath, errors);

  if (recipe) {
    validateTopLevel(recipe, errors);
    validateDetails(recipe, errors);
    validateRelationships(recipe, errors);
    validateHouseholdBase(recipe, errors);
    validateStringArray(recipe, 'servingSuggestions', errors);
    validateStringArray(recipe, 'notes', errors);
    validateSlug(recipe, fileName, errors);
    validateIngredientGroups(recipe, errors);
    validateStepStructure(recipe, errors);
    const ingredientInfo = collectIngredientIds(recipe, errors);
    validateScalingBaseIngredient(recipe, ingredientInfo, errors);
    validateQuantityScaling(recipe, errors);
    validateRiceRecipeUnits(recipe, errors);
    validateIngredientUnits(recipe, errors);
    validateScalingModes(recipe, errors);
    validateRoundingTypes(recipe, errors);
    validateDisplayTextSafety(recipe, errors);
    validateScaleQuantities(recipe, errors);
    validateReferenceQuantities(recipe, errors, warnings);
    validateRequiredNonLinearScaleQuantities(recipe, nonLinearRules, errors);
    validateStepIngredientIds(recipe, ingredientInfo.ids, errors);
    validateHardcodedWater(recipe, ingredientInfo.ids, errors);

    if (recipe.slug) {
      recipeMap.set(recipe.slug, { fileName, recipe });
    }
  }

  if (errors.length || warnings.length) {
    console.log(`\n${fileName}`);
    errors.forEach((error) => console.log(`  ✗ ${error}`));
    warnings.forEach((warning) => console.log(`  ⚠ ${warning}`));
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

  const configErrors = [];
  const nonLinearRules = loadNonLinearRules(configErrors);
  if (configErrors.length) {
    console.log('\ndata/validation/non-linear-ingredients.json');
    configErrors.forEach((error) => console.log(`  ✗ ${error}`));
  }

  const recipeFiles = fs.readdirSync(RECIPES_DIR)
    .filter((file) => file.endsWith('.json'))
    .sort();

  const recipeMap = new Map();
  recipeFiles.forEach((fileName) => validateRecipe(fileName, recipeMap, nonLinearRules));
  validateRecipeIndex(recipeFiles, recipeMap);

  if (totalErrors > 0) {
    console.log(`\nRecipe validation failed with ${totalErrors} error(s).`);
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.log(`\nRecipe validation completed with ${totalWarnings} warning(s).`);
  }

  console.log(`✓ Recipe validation passed for ${recipeFiles.length} recipe file(s).`);
}

main();
