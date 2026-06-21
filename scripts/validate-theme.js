const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REQUIRED_DOC = path.join(ROOT, 'docs', 'UI_THEME_STANDARD.md');
const HTML_FILES = ['index.html', 'recipe.html'];
const CSS_FILES = [
  'style.css',
  'brand.css',
  'theme.css',
  'theme-toggle-fix.css',
  'homepage-filters.css',
  'recipe-pairings.css',
  'recipe-scaling.css',
  'wake-lock.css',
];

const APPROVED_COLOR_FILES = new Set(CSS_FILES);
const APPROVED_SHADOW_FILES = new Set([
  'style.css',
  'brand.css',
  'theme.css',
  'theme-toggle-fix.css',
  'recipe-scaling.css',
  'wake-lock.css',
]);

const REQUIRED_DARK_OVERRIDES = [
  { file: 'homepage-filters.css', selector: '[data-theme="dark"] .filter-chip' },
  { file: 'recipe-pairings.css', selector: '[data-theme="dark"] .pairing-card' },
  { file: 'theme.css', selector: '[data-theme="dark"] .section-nav a' },
];

let totalErrors = 0;

function addError(errors, message) {
  errors.push(message);
  totalErrors += 1;
}

function readText(relativePath, errors) {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) {
    addError(errors, `Missing file: ${relativePath}`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf8');
}

function listCssFiles() {
  return fs.readdirSync(ROOT).filter((file) => file.endsWith('.css')).sort();
}

function validateThemeDoc(errors) {
  if (!fs.existsSync(REQUIRED_DOC)) {
    addError(errors, 'Missing docs/UI_THEME_STANDARD.md');
  }
}

function validateKnownCssFiles(errors) {
  const actualCssFiles = listCssFiles();
  const approved = new Set(CSS_FILES);

  actualCssFiles.forEach((file) => {
    if (!approved.has(file)) {
      addError(errors, `Unexpected CSS file "${file}". Update docs/UI_THEME_STANDARD.md and scripts/validate-theme.js before adding new theme surfaces.`);
    }
  });

  CSS_FILES.forEach((file) => {
    if (!fs.existsSync(path.join(ROOT, file))) {
      addError(errors, `Expected CSS file is missing: ${file}`);
    }
  });
}

function validateCssVersionReferences(errors) {
  HTML_FILES.forEach((htmlFile) => {
    const content = readText(htmlFile, errors);
    const linkedCss = [...content.matchAll(/href="([^"]+\.css)(\?v=([0-9]+\.[0-9]+\.[0-9]+))?"/g)];

    linkedCss.forEach((match) => {
      const cssFile = match[1];
      const version = match[3];

      if (!version) {
        addError(errors, `${htmlFile} links ${cssFile} without a ?v= version`);
      }

      if (!fs.existsSync(path.join(ROOT, cssFile))) {
        addError(errors, `${htmlFile} links missing CSS file: ${cssFile}`);
      }
    });
  });
}

function validateHardcodedColors(errors) {
  const colorPattern = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;

  listCssFiles().forEach((file) => {
    const content = readText(file, errors);
    const matches = content.match(colorPattern) || [];

    if (matches.length && !APPROVED_COLOR_FILES.has(file)) {
      addError(errors, `${file} contains hardcoded colors. Use theme tokens or add an explicit validator exception.`);
    }
  });
}

function validateBoxShadowUsage(errors) {
  listCssFiles().forEach((file) => {
    const content = readText(file, errors);
    if (content.includes('box-shadow') && !APPROVED_SHADOW_FILES.has(file)) {
      addError(errors, `${file} uses box-shadow outside approved theme files.`);
    }
  });
}

function validateDarkOverrides(errors) {
  REQUIRED_DARK_OVERRIDES.forEach(({ file, selector }) => {
    const content = readText(file, errors);
    if (!content.includes(selector)) {
      addError(errors, `${file} is missing required dark-mode override: ${selector}`);
    }
  });
}

function main() {
  const errors = [];

  validateThemeDoc(errors);
  validateKnownCssFiles(errors);
  validateCssVersionReferences(errors);
  validateHardcodedColors(errors);
  validateBoxShadowUsage(errors);
  validateDarkOverrides(errors);

  if (errors.length) {
    console.log('\nTheme validation');
    errors.forEach((error) => console.log(`  ✗ ${error}`));
  }

  if (totalErrors > 0) {
    console.log(`\nTheme validation failed with ${totalErrors} error(s).`);
    process.exit(1);
  }

  console.log('✓ Theme validation passed.');
}

main();
