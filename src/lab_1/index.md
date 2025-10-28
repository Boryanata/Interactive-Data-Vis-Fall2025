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


  # 2. Ideal weather for pollinating 


  ## Pollination activity vs temperature 🌡️
  ```js
  Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.dot(pollinators, {
      x: "temperature",
      y: "visit_count",
      fill: "weather_condition",
      stroke: "weather_condition",
      title: "weather_condition",
      r: 4
    }),
   
    Plot.lineY(
      pollinators,
      Plot.groupX(
        { y: "mean" },
        {
          x: "temperature",
          y: "visit_count",
          stroke: "weather_condition"
        }
      )
    )
  ],
  x: { label: "Temperature (°C)" },
  y: { label: "Pollination Activity (visit count)" },
  color: { legend: true }
})
  ```
  <!-- ```js
  Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.dot(pollinators, {
      x: "temperature",
      y: "visit_count",
      stroke: "pollinator_species",
      fill: "pollinator_species", //this is our obstract value z
      r: 4
    }),
    Plot.lineY(
      Plot.groupX(
        {y: "mean"},
        {
          x: "temperature",
          y: "visit_count",
          stroke: "pollinator_species"
        }
      )
    )
  ],
  x: {label: "Temperature (°C)"},
  y: {label: "Pollination Activity (visit count)"},
  color: {legend: true}
})
  ``` -->


  ## Pollination activity by weather condition 🌤️
  ```js
  Plot.plot({
  marks: [
    Plot.barY(
      pollinators,
      Plot.groupX(
        {y: "mean"},
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