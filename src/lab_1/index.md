---
title: "Lab 1: Passing Pollinators"
toc: true
---

```js
const pollinators = FileAttachment("./data/pollinator_activity_data.csv").csv({ typed: true })
```

```js
Inputs.table(pollinators)
```

##Question 1: Body mass and wing span distribution per species

```js
Plot.plot({
  marks: [
    Plot.dot(pollinators, {
      x: "Body_mass",
      y: "Wing_span",
      stroke: "Species",
      title: "Species",
      r: 4
    }),
    Plot.linearRegressionY(pollinators, {x: "Body_mass", y: "Wing_span"})
  ],
  x: {label: "Body Mass (g)"},
  y: {label: "Wing Span (cm)"},
  color: {legend: true}
})
```