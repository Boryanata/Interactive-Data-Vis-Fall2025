---
title: "Lab 1: Passing Pollinators"
toc: true
---

```js
const pollinators = FileAttachment("./data/pollinator_activity_data.csv").csv({ typed: true })
```
# Preview of Our Data
```js
Inputs.table(pollinators)
```

<br><br>

# 🐝🌸🍯 Pollination Patterns: Insights from a Local Farm’s Bee Observations

This interactive dashboard explores new pollination data collected from a local farm. It visualizes how three bee species differ in body mass and wing span, reveals the weather and temperature conditions that support the most pollination activity, and highlights which flowers produce the most nectar. Together, these insights help identify the factors that make pollination most successful — from the bees’ physical traits to the flowers and the weather that sustain them.
<br><br>

# 1. Body mass and wing span distribution per species

This chart compares the body mass and wing span of each pollinator species. It shows how the three species differ in size and form — highlighting which are larger and stronger flyers versus smaller, lighter pollinators.

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
<br><br>

  # 2. Ideal weather for pollinating 
  This visualization shows how pollination activity changes with temperature and weather conditions. It highlights the temperatures and weather types where bees are most active, revealing the environmental sweet spot for pollination.

<br><br>

  ## 2.1. Pollination activity vs temperature 🌡️
```js
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.rectY(
      pollinators,
      Plot.binX(
        { y: "count" }, // count observations per temperature bin
        {
          x: "temperature",
          fill: "weather_condition" // color by weather type
        }
      )
    )
  ],
  color: { legend: true },
  height: 300,
  y: { label: "Number of Observations" },
  x: { domain: [0, 50], label: "Temperature (°C)" }
})
```

<br><br>

  ## 2.2. Pollination activity by weather condition 🌤️
  ```js
  Plot.plot({
  marks: [
    Plot.frame(),
    Plot.barY(
      pollinators,
      Plot.groupX(
        {y: "sum"},
        {
          x: "weather_condition",
          y: "visit_count",
          fill: "weather_condition",
          sort: { x: "y", reverse: true }
        }
      )
    )
  ],
  x: {label: "**Weather Condition**"},
  y: {label: "Average Visit Count"},
  color: {legend: false}
})
  ```
  <br><br>

  ## 3. Nectar production 🐝🌸🍯 
  The following visualization shows the distribution of nectar production for each flower species. Each box shows the distribution of nectar production per flower - higher medians and taller boxes indicate greater typical output and variation.

  ```js
  Plot.plot({
  marks: [
    Plot.boxY(pollinators, {
      x: "flower_species",
      y: "nectar_production",
      fill: "flower_species",
      fillOpacity: 0.8,
      stroke: "white"
    })
  ],
  color: { legend: false },
  x: { label: "**Flower Species**" },
  y: { label: "Nectar Production (µL)", grid: true },
  height: 350
})
  ```