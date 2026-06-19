(() => {
  const recipeContent = document.getElementById('recipeContent');
  const wakeLockSupported = 'wakeLock' in navigator;

  let wakeLock = null;
  let wakeLockRequested = false;
  let observedModal = null;
  let modalObserver = null;

  function getControls() {
    return {
      modal: document.getElementById('cookingMode'),
      button: document.getElementById('keepScreenOn'),
      status: document.getElementById('wakeLockStatus')
    };
  }

  function setText(element, text) {
    if (element.textContent !== text) element.textContent = text;
  }

  function updateWakeLockUi(message = '') {
    const { button, status } = getControls();
    if (!button || !status) return;

    if (!wakeLockSupported) {
      button.disabled = true;
      setText(button, '☀');
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', 'Keep screen on unavailable');
      button.title = 'Keep screen on unavailable';
      setText(status, 'This browser does not support keeping the screen awake.');
      return;
    }

    const isActive = Boolean(wakeLock);
    const label = isActive ? 'Screen stays on' : 'Keep screen on';
    const statusText = message || (isActive
      ? 'Screen will stay on while Cooking Mode is open.'
      : 'Tap ☀ to keep the screen awake while cooking.');

    button.disabled = false;
    setText(button, '☀');
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    button.setAttribute('aria-label', label);
    button.title = label;
    setText(status, statusText);
  }

  async function requestWakeLock() {
    const { modal } = getControls();
    if (!wakeLockSupported || wakeLock || !modal || modal.hidden) return;

    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
        const { modal: currentModal } = getControls();
        if (wakeLockRequested && currentModal && !currentModal.hidden && document.visibilityState === 'visible') {
          updateWakeLockUi('Screen wake lock was released by the browser. Tap ☀ again if needed.');
        } else {
          updateWakeLockUi();
        }
      });
      updateWakeLockUi();
    } catch {
      wakeLockRequested = false;
      updateWakeLockUi('Unable to keep the screen awake in this browser right now.');
    }
  }

  async function releaseWakeLock() {
    wakeLockRequested = false;
    if (wakeLock) {
      const activeWakeLock = wakeLock;
      wakeLock = null;
      await activeWakeLock.release().catch(() => {});
    }
    updateWakeLockUi();
  }

  async function toggleWakeLock() {
    if (wakeLock) {
      await releaseWakeLock();
      return;
    }

    wakeLockRequested = true;
    await requestWakeLock();
  }

  function watchModal(modal) {
    if (!modal || modal === observedModal) return;

    modalObserver?.disconnect();
    observedModal = modal;
    modalObserver = new MutationObserver(() => {
      if (modal.hidden) releaseWakeLock();
      else updateWakeLockUi();
    });
    modalObserver.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
  }

  function ensureWakeLockControls() {
    const modal = document.getElementById('cookingMode');
    if (!modal) return;

    const topbar = modal.querySelector('.cooking-topbar');
    const exitButton = modal.querySelector('#exitCooking');
    if (!topbar || !exitButton) return;

    if (!document.getElementById('keepScreenOn')) {
      const button = document.createElement('button');
      button.id = 'keepScreenOn';
      button.className = 'wake-lock-button';
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', 'Keep screen on');
      button.title = 'Keep screen on';
      button.textContent = '☀';
      button.addEventListener('click', toggleWakeLock);
      topbar.insertBefore(button, exitButton);
    }

    if (!document.getElementById('wakeLockStatus')) {
      const status = document.createElement('p');
      status.id = 'wakeLockStatus';
      status.className = 'wake-lock-status';
      status.setAttribute('aria-live', 'polite');
      topbar.insertAdjacentElement('afterend', status);
    }

    watchModal(modal);
    updateWakeLockUi();
  }

  document.addEventListener('visibilitychange', () => {
    const { modal } = getControls();
    if (document.visibilityState === 'visible' && wakeLockRequested && !wakeLock && modal && !modal.hidden) {
      requestWakeLock();
    }
  });

  if (recipeContent) {
    const contentObserver = new MutationObserver(ensureWakeLockControls);
    contentObserver.observe(recipeContent, { childList: true });
  }

  ensureWakeLockControls();
})();
