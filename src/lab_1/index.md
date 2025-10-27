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

##Question 1: Body mass and wing span distribution per species

```js
Plot.plot({
  marks: [
    Plot.dot(pollinators, {
      x: "avg_body_mass_g",
      y: "avg_wing_span_mm",
      stroke: "polloinator_species",
      title: "pollinator_species",
      r: 4
    }),
    Plot.linearRegressionY(pollinators, {x: "avg_body_mass_g", y: "avg_wing_span_mm"})
  ],
  x: {label: "Body Mass (g)"},
  y: {label: "Wing Span (mm)"},
  color: {legend: true}
})
```