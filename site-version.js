const SITE_VERSION = 'v1.19.0';

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
