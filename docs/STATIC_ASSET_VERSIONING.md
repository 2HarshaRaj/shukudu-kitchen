# Static Asset Versioning

Shukudu Kitchen is served through static files. Browsers and GitHub Pages/CDN may temporarily cache JavaScript and CSS files.

To avoid mixed old/new behaviour after a deployment, version query strings must be updated when JavaScript or CSS files change.

## Rule

When a JS or CSS file changes, update the corresponding `?v=` value in the HTML file that loads it.

Example:

```html
<script src="recipe.js?v=1.15.1"></script>
<link rel="stylesheet" href="recipe-scaling.css?v=1.15.1">
```

This makes the browser treat the asset URL as new and fetch the latest file.

## Current Pattern

Homepage assets are loaded from `index.html`.

Recipe page assets are loaded from `recipe.html`.

Use the visible site version for the query value unless there is a reason to use a smaller patch-specific value.

## Why This Matters

A stale asset can cause the page to render with old logic even when recipe JSON is already updated.

Example issue:

```text
Punjabi Dal Tadka JSON had referenceQuantity, but an older formatter did not render it consistently.
```

Versioned JS/CSS paths reduce this risk after each deployment.

## Maintenance Checklist

When changing JS/CSS:

1. Update the file.
2. Update the related `?v=` query in `index.html` and/or `recipe.html`.
3. Update the visible footer version if the change is user-facing.
4. Test in normal browser and incognito.
5. Test one refresh and one interaction path, such as changing recipe scale.
