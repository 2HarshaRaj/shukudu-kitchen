const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RECIPE_INDEX_FILE = path.join(ROOT, 'data', 'recipe-index.json');
const MAX_ALIAS_LENGTH = 60;

let totalErrors = 0;

function addError(errors, message) {
  errors.push(message);
  totalErrors += 1;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeAlias(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function readJson(filePath, errors) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    addError(errors, `Invalid JSON: ${error.message}`);
    return null;
  }
}

function validateSearchAliases(entry, indexPosition, globalAliases, errors) {
  if (!Object.prototype.hasOwnProperty.call(entry, 'searchAliases')) return;

  if (!Array.isArray(entry.searchAliases)) {
    addError(errors, `recipe-index[${indexPosition}].searchAliases must be an array when present`);
    return;
  }

  const localAliases = new Set();

  entry.searchAliases.forEach((alias, aliasIndex) => {
    if (!isNonEmptyString(alias)) {
      addError(errors, `recipe-index[${indexPosition}].searchAliases[${aliasIndex}] must be a non-empty string`);
      return;
    }

    const normalizedAlias = normalizeAlias(alias);

    if (normalizedAlias.length > MAX_ALIAS_LENGTH) {
      addError(errors, `recipe-index[${indexPosition}].searchAliases[${aliasIndex}] is too long; max ${MAX_ALIAS_LENGTH} characters`);
    }

    if (localAliases.has(normalizedAlias)) {
      addError(errors, `recipe-index[${indexPosition}].searchAliases contains duplicate alias "${alias}"`);
    }
    localAliases.add(normalizedAlias);

    if (globalAliases.has(normalizedAlias) && globalAliases.get(normalizedAlias) !== entry.slug) {
      addError(errors, `searchAliases alias "${alias}" is used by both "${globalAliases.get(normalizedAlias)}" and "${entry.slug}"`);
    }
    globalAliases.set(normalizedAlias, entry.slug);
  });
}

function main() {
  const errors = [];

  if (!fs.existsSync(RECIPE_INDEX_FILE)) {
    console.error(`Recipe index not found: ${RECIPE_INDEX_FILE}`);
    process.exit(1);
  }

  const index = readJson(RECIPE_INDEX_FILE, errors);

  if (!Array.isArray(index)) {
    addError(errors, 'recipe-index.json must be an array');
  }

  if (Array.isArray(index)) {
    const globalAliases = new Map();

    index.forEach((entry, indexPosition) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        addError(errors, `recipe-index[${indexPosition}] must be an object`);
        return;
      }

      if (!isNonEmptyString(entry.slug)) {
        addError(errors, `recipe-index[${indexPosition}] missing slug`);
        return;
      }

      validateSearchAliases(entry, indexPosition, globalAliases, errors);
    });
  }

  if (errors.length) {
    console.log('\nrecipe-index.json search validation');
    errors.forEach((error) => console.log(`  ✗ ${error}`));
  }

  if (totalErrors > 0) {
    console.log(`\nSearch validation failed with ${totalErrors} error(s).`);
    process.exit(1);
  }

  console.log('✓ Search validation passed.');
}

main();
