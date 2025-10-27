---
title: "Lab 1: Passing Pollinators"
toc: true
---

```js
const pollinators = FileAttachment("./data/pollinator_activity_data.csv").csv({ typed: true })
```
##Preview of Data
```js
Inputs.table(pollinators)
```

# 1. Body mass and wing span distribution per species

```js
Plot.plot({
  marks: [
    Plot.frame(),
     Plot.ruleY([0]), // optional horizontal baseline
    Plot.dot(pollinators, {
      x: "avg_body_mass_g",
      y: "avg_wing_span_mm",
      stroke: "pollinator_species", // color by species
      fill: "pollinator_species",
      title: "pollinator_species",
      r: 4
    })
  ],
  x: { label: "avg_body_mass_g" },
  y: { label: "avg_wing_span_mm" },
  color: { legend: true }
  })
  ```