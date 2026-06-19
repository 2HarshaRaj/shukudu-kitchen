const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RECIPES_DIR = path.join(ROOT, 'data', 'recipes');

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

function validateLargeProduceWeightGrams(fileName) {
  const filePath = path.join(RECIPES_DIR, fileName);
  const errors = [];
  const recipe = readJson(filePath, errors);

  if (recipe) {
    walkIngredients(recipe, (item) => {
      if (!item || typeof item !== 'object' || typeof item === 'string') return;
      if (item.scalable !== true) return;
      if (!Object.prototype.hasOwnProperty.call(item, 'countLabel')) return;
      if (item.roundingType !== 'large-produce') return;

      const label = getIngredientLabel(item);
      if (!Number.isFinite(Number(item.weightGrams)) || Number(item.weightGrams) <= 0) {
        addError(errors, `Ingredient "${label}" uses countLabel with large-produce rounding but is missing positive weightGrams`);
      }
    });
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

  recipeFiles.forEach((fileName) => validateLargeProduceWeightGrams(fileName));

  if (totalErrors > 0) {
    console.log(`\nProduce weight validation failed with ${totalErrors} error(s).`);
    process.exit(1);
  }

  console.log(`✓ Produce weight validation passed for ${recipeFiles.length} recipe file(s).`);
}

main();
