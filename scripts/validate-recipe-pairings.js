const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RECIPES_DIR = path.join(ROOT, 'data', 'recipes');

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

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function loadRecipes(recipeFiles) {
  const recipeMap = new Map();

  recipeFiles.forEach((fileName) => {
    const errors = [];
    const filePath = path.join(RECIPES_DIR, fileName);
    const recipe = readJson(filePath, errors);

    if (recipe && isNonEmptyString(recipe.slug)) {
      recipeMap.set(recipe.slug, { fileName, recipe });
    }

    if (errors.length) {
      console.log(`\n${fileName}`);
      errors.forEach((error) => console.log(`  ✗ ${error}`));
    }
  });

  return recipeMap;
}

function getPairings(recipe) {
  const pairings = recipe.relationships && Array.isArray(recipe.relationships.goesWellWith)
    ? recipe.relationships.goesWellWith
    : [];

  return pairings.filter(isNonEmptyString);
}

function validatePairings(recipeMap) {
  recipeMap.forEach(({ fileName, recipe }) => {
    const errors = [];
    const warnings = [];
    const pairings = getPairings(recipe);

    pairings.forEach((pairedSlug) => {
      const pairedRecipeInfo = recipeMap.get(pairedSlug);

      if (!pairedRecipeInfo) {
        addError(errors, `relationships.goesWellWith references missing recipe slug "${pairedSlug}"`);
        return;
      }

      const reversePairings = getPairings(pairedRecipeInfo.recipe);
      if (!reversePairings.includes(recipe.slug)) {
        addWarning(warnings, `Pairing is not reciprocal: ${recipe.slug} -> ${pairedSlug}`);
      }
    });

    if (errors.length || warnings.length) {
      console.log(`\n${fileName}`);
      errors.forEach((error) => console.log(`  ✗ ${error}`));
      warnings.forEach((warning) => console.log(`  ⚠ ${warning}`));
    }
  });
}

function main() {
  if (!fs.existsSync(RECIPES_DIR)) {
    console.error(`Recipes directory not found: ${RECIPES_DIR}`);
    process.exit(1);
  }

  const recipeFiles = fs.readdirSync(RECIPES_DIR)
    .filter((file) => file.endsWith('.json'))
    .sort();

  const recipeMap = loadRecipes(recipeFiles);
  validatePairings(recipeMap);

  if (totalErrors > 0) {
    console.log(`\nRecipe pairing validation failed with ${totalErrors} error(s).`);
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.log(`\nRecipe pairing validation completed with ${totalWarnings} warning(s).`);
  }

  console.log(`✓ Recipe pairing validation passed for ${recipeFiles.length} recipe file(s).`);
}

main();
