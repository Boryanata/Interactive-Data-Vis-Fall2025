---
title: "Lab 1: Passing Pollinators"
toc: true
---

This page is where you can iterate. Follow the lab instructions in the [readme.md](./README.md).

<!-- ```js
const text = view(Inputs.text())
```
This is the value of text: ${text} -->


```js
Plot.plot({
  width: 300,
  height: 200,
  marks: [
    Plot.frame(),
    Plot.text(["text"], { frameAnchor: "middle", rotate: 90 })
  ]
})
```
<!-- 
```js
// view(aapl)
Inputs.table(aapl)
``` -->

```js
Plot.plot({
  height: 200,
  y: {
    grid: true
  },
  marks: [
    // Plot.frame(),
    Plot.line(aapl, { 
      x: "Date", 
      y: d => d["Close"] + 100, 
      stroke: "pink", 
      strokeWidth: 20 
    }),
    Plot.dot(aapl, { x: "Date", y: "Close", fill: "white", r: 1, tip: true }),
    Plot.ruleY([0, 50, 100]),
    // Plot.ruleY([100]),
    // Plot.ruleX(new Date("2015-01-01"))
    // Plot.line(goog, { x: })
  ]
})
```

## PENGUINS

```js
const penguins = FileAttachment("./data/penguins.csv").csv({ typed: true })
```

```js
Inputs.table(penguins)
```

<!-- ```js
Plot.plot({
  height: 200,
  marks: [
    Plot.frame(),
    Plot.barY(penguins, {
      x: "rowid",
      y: "bill_length_mm"
    })
  ]
})
``` -->

```js
Plot.plot({
  height: 200,
  marks: [
    Plot.frame(),
    Plot.barY(penguins, 
      Plot.groupX({ y: "count" }, { x: "island" })
    )
  ]
})
```

```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {
      x: "flipper_length_mm",
      y: "bill_depth_mm",
      stroke: "species"
    })
  ]
})
```

## POLLINATORS

```js
const pollinators = FileAttachment("./data/pollinator_activity_data.csv").csv({ typed: true })
```

```js
pollinators
```