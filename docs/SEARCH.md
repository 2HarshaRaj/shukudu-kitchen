# Recipe Search

Shukudu Kitchen homepage search is designed to find recipes using practical cooking language, not only exact recipe names.

## Current Search Sources

Homepage search currently includes:

- recipe name
- category
- summary
- `searchAliases`
- relationship metadata
  - `details.Cuisine`
  - `details.Status`
  - `relationships.mealTypes`
  - `relationships.dishTypes`
  - `relationships.goesWellWith`
- non-common ingredient names from the full recipe JSON after full recipes load

This means searches like these should work:

```text
tomato rice
one pot
lunch
palya
karnataka
rasam
methi rice
mosaranna
bbb
```

## Search Aliases

Use `searchAliases` for alternate dish names, regional names, common abbreviations, and likely user search phrases.

Current aliases are stored in `data/recipe-index.json` so homepage search can use them immediately before full recipe JSON files finish loading.

Example:

```json
{
  "name": "Tomato Bath",
  "slug": "tomato-bath",
  "category": "Rice",
  "summary": "A Karnataka-style tomato bath prepared with sona masuri rice, tomatoes, whole spices, peas, garam masala and lemon.",
  "searchAliases": ["tomato rice", "tomato palav", "tomato pulao"]
}
```

The homepage code also supports `searchAliases` from full recipe JSON, so the field can later be moved or duplicated there if needed.

## Alias Guidelines

Good aliases:

- common alternate dish names
- regional names
- common spelling variants
- useful abbreviations
- English ingredient-based dish descriptions

Examples:

```text
Menthya Rice Bath -> methi rice, menthe bath, methi pulao, fenugreek rice
Bisi Bele Bath -> bisibelebath, BBB, bisi bele huliyanna, sambar rice
Curd Rice -> mosaranna, mosaru anna, thayir sadam, yogurt rice
Vangi Bath -> brinjal rice, badanekai bath, eggplant rice
Balekai Palya -> raw banana palya, plantain stir fry
```

Avoid aliases that are too broad:

```text
rice
bath
side
good
quick
spicy
```

Those words create noisy results.

## Ingredient Search

Ingredient search already reads full recipe ingredients after the homepage loads recipe JSON files.

Very common ingredients are ignored so searches do not become noisy:

```text
water, salt, oil, ghee, turmeric, hing, curry leaves, coriander leaves
```

Future improvement:

```text
data/search/ingredient-aliases.json
```

Possible future examples:

```text
brinjal = eggplant = badanekai
methi = menthya = fenugreek
curd = yogurt
beans = hurulikai
raw banana = balekai
```

## Future Search Improvements

Planned later:

- search result reason, such as `Matched alias: tomato rice`
- no-results suggestions, such as `Try: menthya, fenugreek, rice`
- centralized ingredient alias config
- typo-tolerant matching if recipe count grows enough to justify it
