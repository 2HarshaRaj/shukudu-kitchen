const recipeContent = document.getElementById('recipeContent');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getChecklistKey(slug) {
  return `shukudu-kitchen:${slug}:ingredients`;
}

function getCookingStepKey(slug) {
  return `shukudu-kitchen:${slug}:cooking-step`;
}

function getCompletedStepsKey(slug) {
  return `shukudu-kitchen:${slug}:completed-steps`;
}

function loadChecklistState(slug) {
  try {
    return JSON.parse(localStorage.getItem(getChecklistKey(slug))) || {};
  } catch {
    return {};
  }
}

function saveChecklistState(slug, state) {
  localStorage.setItem(getChecklistKey(slug), JSON.stringify(state));
}

function loadCookingStep(slug, stepCount) {
  const savedStep = Number.parseInt(localStorage.getItem(getCookingStepKey(slug)), 10);
  if (Number.isNaN(savedStep)) return 0;
  return Math.min(Math.max(savedStep, 0), Math.max(stepCount - 1, 0));
}

function saveCookingStep(slug, stepIndex) {
  localStorage.setItem(getCookingStepKey(slug), String(stepIndex));
}

function loadCompletedSteps(slug) {
  try {
    return JSON.parse(localStorage.getItem(getCompletedStepsKey(slug))) || {};
  } catch {
    return {};
  }
}

function saveCompletedSteps(slug, state) {
  localStorage.setItem(getCompletedStepsKey(slug), JSON.stringify(state));
}

function renderList(items, ordered = false) {
  if (!items?.length) return '';

  const tag = ordered ? 'ol' : 'ul';

  return `<${tag}>${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</${tag}>`;
}

function renderIngredientChecklist(recipe) {
  const savedState = loadChecklistState(recipe.slug);
  let itemIndex = 0;

  return (recipe.ingredients || [])
    .map((section) => {
      const items = section.items
        .map((item) => {
          const id = `ingredient-${itemIndex}`;
          const checked = Boolean(savedState[id]);
          itemIndex += 1;

          return `
            <li class="ingredient-item${checked ? ' is-complete' : ''}">
              <label class="ingredient-check">
                <input
                  type="checkbox"
                  data-ingredient-id="${id}"
                  ${checked ? 'checked' : ''}
                >
                <span>${escapeHtml(item)}</span>
              </label>
            </li>
          `;
        })
        .join('');

      return `
        <h3>${escapeHtml(section.section)}</h3>
        <ul class="checklist">${items}</ul>
      `;
    })
    .join('');
}

function initialiseIngredientChecklist(recipe) {
  const checklist = recipeContent.querySelector('.ingredient-checklist');
  const resetButton = recipeContent.querySelector('#resetIngredients');

  if (!checklist || !resetButton) return;

  checklist.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[type="checkbox"][data-ingredient-id]');
    if (!checkbox) return;

    const state = loadChecklistState(recipe.slug);
    state[checkbox.dataset.ingredientId] = checkbox.checked;
    saveChecklistState(recipe.slug, state);

    checkbox.closest('.ingredient-item')?.classList.toggle('is-complete', checkbox.checked);
  });

  resetButton.addEventListener('click', () => {
    localStorage.removeItem(getChecklistKey(recipe.slug));

    checklist.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
      checkbox.closest('.ingredient-item')?.classList.remove('is-complete');
    });
  });
}

function initialiseSectionNavigation() {
  const nav = recipeContent.querySelector('.section-nav');
  if (!nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  let activeId = '';
  let ticking = false;

  function setActiveSection(sectionId, keepVisible = true) {
    if (!sectionId || activeId === sectionId) return;
    activeId = sectionId;

    links.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${sectionId}`;
      link.classList.toggle('is-active', isActive);

      if (isActive && keepVisible) {
        const left = link.offsetLeft - nav.clientWidth / 2 + link.clientWidth / 2;
        nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      }
    });
  }

  function updateActiveSection() {
    const marker = nav.offsetHeight + 28;
    let current = sections[0];

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) {
        current = section;
      }
    });

    setActiveSection(current?.id);
    ticking = false;
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      setActiveSection(target.id, false);
      const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 18;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    },
    { passive: true }
  );

  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();
}

function initialiseCookingMode(recipe) {
  const startButton = recipeContent.querySelector('#startCooking');
  const modal = recipeContent.querySelector('#cookingMode');
  const exitButton = recipeContent.querySelector('#exitCooking');
  const previousButton = recipeContent.querySelector('#previousCookingStep');
  const nextButton = recipeContent.querySelector('#nextCookingStep');
  const completeButton = recipeContent.querySelector('#completeCookingStep');
  const stepText = recipeContent.querySelector('#cookingStepText');
  const stepLabel = recipeContent.querySelector('#cookingStepLabel');
  const progressBar = recipeContent.querySelector('#cookingProgressBar');

  if (!startButton || !modal || !exitButton || !previousButton || !nextButton || !completeButton || !stepText || !stepLabel || !progressBar) {
    return;
  }

  const steps = [
    ...(recipe.preparation || []).map((text) => ({ phase: 'Preparation', text })),
    ...(recipe.cookingMethod || []).map((text) => ({ phase: 'Cooking', text }))
  ];

  let currentStep = loadCookingStep(recipe.slug, steps.length);
  let completedSteps = loadCompletedSteps(recipe.slug);

  function updateCookingStep() {
    const step = steps[currentStep];
    if (!step) return;

    const isComplete = Boolean(completedSteps[currentStep]);

    stepLabel.textContent = `${step.phase} • Step ${currentStep + 1} of ${steps.length}`;
    stepText.textContent = step.text;
    progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    previousButton.disabled = currentStep === 0;
    nextButton.textContent = currentStep === steps.length - 1 ? 'Finish' : 'Next';
    completeButton.textContent = isComplete ? 'Completed ✓' : 'Mark Complete';
    completeButton.classList.toggle('is-complete', isComplete);
    completeButton.setAttribute('aria-pressed', String(isComplete));
    saveCookingStep(recipe.slug, currentStep);
  }

  function openCookingMode() {
    modal.hidden = false;
    document.body.classList.add('cooking-mode-open');
    updateCookingStep();
    exitButton.focus();
  }

  function closeCookingMode() {
    modal.hidden = true;
    document.body.classList.remove('cooking-mode-open');
    startButton.focus();
  }

  startButton.addEventListener('click', openCookingMode);
  exitButton.addEventListener('click', closeCookingMode);

  completeButton.addEventListener('click', () => {
    completedSteps[currentStep] = !completedSteps[currentStep];
    saveCompletedSteps(recipe.slug, completedSteps);
    updateCookingStep();
  });

  previousButton.addEventListener('click', () => {
    if (currentStep === 0) return;
    currentStep -= 1;
    updateCookingStep();
  });

  nextButton.addEventListener('click', () => {
    if (currentStep === steps.length - 1) {
      localStorage.removeItem(getCookingStepKey(recipe.slug));
      localStorage.removeItem(getCompletedStepsKey(recipe.slug));
      completedSteps = {};
      currentStep = 0;
      closeCookingMode();
      return;
    }

    currentStep += 1;
    updateCookingStep();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeCookingMode();
  });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') closeCookingMode();
    if (event.key === 'ArrowLeft') previousButton.click();
    if (event.key === 'ArrowRight') nextButton.click();
  });
}

function renderRecipe(recipe) {
  document.title = `${recipe.name} | Shukudu Kitchen`;

  const details = Object.entries(recipe.details || {})
    .map(
      ([label, value]) => `
        <div>
          <span class="detail-label">${escapeHtml(label)}:</span>
          <span>${escapeHtml(value)}</span>
        </div>
      `
    )
    .join('');

  recipeContent.innerHTML = `
    <article>
      <header class="recipe-hero">
        <p class="eyebrow">${escapeHtml(recipe.category)}</p>
        <h1>${escapeHtml(recipe.name)}</h1>
        <p class="meta">${escapeHtml(recipe.summary)}</p>
        <button id="startCooking" class="primary-button" type="button">Start Cooking</button>
      </header>

      <nav class="section-nav" aria-label="Recipe sections">
        <a href="#details">Details</a>
        <a href="#ingredients">Ingredients</a>
        <a href="#preparation">Preparation</a>
        <a href="#method">Method</a>
        <a href="#serving">Serving</a>
        <a href="#notes">Notes</a>
      </nav>

      <section id="details" class="recipe-section anchor-section">
        <h2>Recipe Details</h2>
        <div class="details-grid">${details}</div>
      </section>

      <section id="ingredients" class="recipe-section ingredient-checklist anchor-section">
        <div class="section-title-row">
          <h2>Ingredients</h2>
          <button id="resetIngredients" class="text-button" type="button">Reset ingredients</button>
        </div>
        ${renderIngredientChecklist(recipe)}
      </section>

      <section id="preparation" class="recipe-section anchor-section">
        <h2>Preparation</h2>
        ${renderList(recipe.preparation, true)}
      </section>

      <section id="method" class="recipe-section anchor-section">
        <h2>Cooking Method</h2>
        ${renderList(recipe.cookingMethod, true)}
      </section>

      <section id="serving" class="recipe-section anchor-section">
        <h2>Serving Suggestions</h2>
        ${renderList(recipe.servingSuggestions)}
      </section>

      <section id="notes" class="recipe-section anchor-section">
        <h2>Notes</h2>
        ${renderList(recipe.notes)}
      </section>
    </article>

    <div id="cookingMode" class="cooking-mode" hidden>
      <div class="cooking-panel" role="dialog" aria-modal="true" aria-labelledby="cookingModeTitle">
        <div class="cooking-topbar">
          <div>
            <p class="eyebrow">Cooking Mode</p>
            <h2 id="cookingModeTitle">${escapeHtml(recipe.name)}</h2>
          </div>
          <button id="exitCooking" class="icon-button" type="button" aria-label="Exit cooking mode">×</button>
        </div>

        <div class="cooking-progress" aria-hidden="true">
          <span id="cookingProgressBar"></span>
        </div>

        <div class="cooking-step-card">
          <p id="cookingStepLabel" class="cooking-step-label"></p>
          <p id="cookingStepText" class="cooking-step-text"></p>
          <button id="completeCookingStep" class="complete-step-button" type="button" aria-pressed="false">Mark Complete</button>
        </div>

        <div class="cooking-actions">
          <button id="previousCookingStep" class="secondary-button" type="button">Previous</button>
          <button id="nextCookingStep" class="primary-button" type="button">Next</button>
        </div>
      </div>
    </div>
  `;

  initialiseIngredientChecklist(recipe);
  initialiseSectionNavigation();
  initialiseCookingMode(recipe);
}

async function loadRecipe() {
  const slug = new URLSearchParams(window.location.search).get('slug');

  try {
    const response = await fetch('recipes.json');

    if (!response.ok) {
      throw new Error('Unable to load recipe data.');
    }

    const recipes = await response.json();
    const recipe = recipes.find((item) => item.slug === slug);

    if (!recipe) {
      throw new Error('Recipe not found.');
    }

    renderRecipe(recipe);
  } catch (error) {
    recipeContent.innerHTML = `<div class="error-box"><strong>${escapeHtml(error.message)}</strong></div>`;
  }
}

loadRecipe();
