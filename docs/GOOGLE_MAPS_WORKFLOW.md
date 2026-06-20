# Google Maps Workflow

This document defines how Google Maps saved places should relate to Harsha Knowledge.

## Core idea

```text
Google Maps = quick save and navigation layer
Harsha Knowledge = curated decision and memory layer
```

Google Maps is the normal starting point for place discovery. Harsha Knowledge should not blindly duplicate every saved place. The repo should capture places that are useful enough to remember, decide on, revisit, avoid, plan around, or link to trips and people.

## General rule

A Google Maps saved place should be added to the repo when it has personal decision value.

Examples:

- you genuinely want to visit it
- someone recommended it
- you visited it
- you want to revisit it
- you want to avoid it
- it belongs to a trip plan
- it helps compare future options
- it has notes, guidance, or context worth remembering

Do not import old saved places only because they exist in Google Maps.

## Tag rule

Do not add a generic `google-maps-saved` tag by default.

Since Google Maps is the normal quick-capture layer, that tag would become noise if most place entries have it.

Use specific context instead, such as:

```json
"details": {
  "source": "google-maps",
  "googleMapsList": ["Restaurant"]
}
```

Use tags only when they are useful for filtering or review.

Good optional tags:

```text
maps-import-review
maps-restaurant
maps-cafe
maps-stay
maps-nature
maps-temple
maps-trekking
maps-bakery
maps-ice-cream
```

Do not use these tags automatically. Use them only when they help with a batch review or future filtering.

## Import-review rule

Use `maps-import-review` only for batch migration from old Google Maps lists.

Do not use it for normal new entries that are already reviewed during chat.

Remove the tag after the place has been reviewed and classified.

## Google Maps list mapping

| Google Maps list | Repo type | Default status | Notes |
|---|---|---|---|
| Stay | `stay` | `planned` | Create stay entity. Create stay log only after an actual stay. |
| Restaurant | `restaurant` | `planned` | Create restaurant entity. Create visit log only after a visit. |
| Cafe | `cafe` | `planned` | Same flow as restaurant/cafe. |
| Nature | `attraction` or `place` | `planned` | Use attraction when it is visit-worthy. Use place for generic areas or landmarks. |
| Temples | `attraction` | `planned` | Usually attraction unless it is just a generic landmark. |
| Bakery | `cafe` or `restaurant` | `planned` | Usually cafe for snacks/desserts. Use restaurant only if meal-like. |
| Trekking | `activity` or `attraction` | `planned` | Trek route/activity is usually activity. Destination can be attraction. |
| Ice Cream | `cafe` or `restaurant` | `planned` | Usually cafe unless it is clearly a restaurant. |

## Default status for imported places

Use `planned` by default for old Google Maps saved places.

Use another status only when the information is already known:

- `visited` if already experienced
- `archived` if not useful anymore
- `abandoned` if explicitly dropped

Do-not-visit and special-occasion decisions should be captured in details, notes, tags, or recommendation-related fields according to the current data model.

## When to create records

### Saved only

Create:

- entity record only

Do not create:

- visit log
- stay log
- trip log

### Actually visited

Create or update:

- entity record
- visit log
- people records if needed

### Actual stay

Create or update:

- stay entity
- stay log
- people records if needed

### Part of a trip

Create or update:

- trip log for the overall journey
- visit logs for meaningful stops
- stay logs for actual stays
- linked people and place relationships

Skip the trip log when the outing is only one normal local place visit.

## Migration approach

Do not import all years of saved places in one pass.

Use list-by-list review:

1. Restaurant
2. Cafe
3. Bakery
4. Ice Cream
5. Stay
6. Nature
7. Temples
8. Trekking

For each batch, classify places into:

- create planned entity
- already visited, create or update entity and visit log if useful
- revisit candidate
- special occasion only
- avoid or do not visit
- archive or ignore

## Repo-to-Google Maps rule

If a repo place may be needed for navigation later, it should ideally also be saved in Google Maps.

Examples:

- planned restaurants or cafes
- revisit places
- stay options
- attractions
- trekking/activity locations
- trip stops

## Avoiding noise

The repo should store personal judgment, not just place names.

Useful repo context includes:

- why it was saved
- who suggested it
- what to try
- when to go
- what to avoid
- parking/access guidance
- whether it is revisit-worthy
- whether it is only for special occasions
- whether it should be avoided
- which trip or people it links to

If none of this is known yet, keep the repo entry minimal or leave the place only in Google Maps until reviewed.
