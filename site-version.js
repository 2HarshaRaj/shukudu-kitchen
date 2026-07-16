const SITE_VERSION = 'v1.20.11';

const renderSiteVersion = () => {
  document.querySelectorAll('[data-site-version]').forEach((element) => {
    element.textContent = SITE_VERSION;
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderSiteVersion);
} else {
  renderSiteVersion();
}
