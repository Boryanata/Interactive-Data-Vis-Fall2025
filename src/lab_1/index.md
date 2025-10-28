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

# 🐝🌸🍯 Pollination Patterns: Insights from a Local Farm’s Bee Observations
<br><br>

# 1. Body mass and wing span distribution per species

<br><br>

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
  x: {label: "Weather Condition"},
  y: {label: "Average Visit Count"},
  color: {legend: false}
})
  ```

  ## 3. Nectar production 🐝🌸🍯 
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
  x: { label: "Flower Species" },
  y: { label: "Nectar Production (µL)", grid: true },
  height: 350
})
  ```