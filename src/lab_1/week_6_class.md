---
title: "Week 6 Class"
toc: true
---

The below code is from classtime Friday, Oct 24th. 
You can find a write up about the same concepts in the [/week_6_notes](./week_6_notes) page. 

```js
const penguins = await FileAttachment("./data/penguins.csv").csv({ typed: true })
display(penguins) // data! yay!
```


<!-- ```js
for (let i = 0; i < 10; i++) {
  display(i)
}
``` -->

<!-- ```js
Plot.plot({
  height: 500, // pixels
  y: {
    grid: true
  },
  marks: [
    Plot.frame(),
    Plot.line(aapl, { 
      x: "Date", 
      y: d => d["Close"], 
    }),
    Plot.ruleY([-200, 0]),
  ]
})
``` -->
<!-- 
```js
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.dot(penguins, {
      x: "bill_length_mm",
      y: "bill_depth_mm",
      stroke: "species",
      fill: "island",
      tip: true
    })
  ]
})
``` -->

<!-- ```js
const groupOutput = Plot.groupX(
        { y: "count" },
        { x: "island" }
      )
display(groupOutput)
``` -->


<!-- ```js
Plot.plot({
  height: 200,
  marks: [
    Plot.frame(),
    Plot.barX(penguins, 
      // groupOutput
      Plot.groupY(
        { x: "count" },
        { y: "island", fill: "species", fy:"species"  }
      )
    )
  ]
})
``` -->



<!-- ```js
Inputs.table(olympians)
```

```js
const binOutput = Plot.binX(
        { y: "count" },
        { x: "weight" }
      )
display(binOutput)
```

```js
Plot.plot({
  height: 300,
  marks: [
    Plot.frame(),
    Plot.rectY(olympians, 
      Plot.binX(
        { y: "count" },
        { x: "weight" }
      )
    )
  ]
})
``` -->




```js
Plot.plot({
  marks: [
    Plot.barY(penguins, 
      Plot.groupX(
        { y: "count" },
        { 
          x: "island", 
          fill: "island", // three colors per bar, as per the island
          // fill: "species" // makes a stacked bar chart, with a legend!
        }
      )
    )
  ],
  color: { legend: true }
})
```

```JSON
[
  { island: "Biscoe", count: 168 }, 
  { island: "Dream", count: 124 }, 
  { island: "Torgersen", count: 52 }
]
```

```js
let dream = 0; 
let biscoe = 0;
let torgersen = 0;
for (let p = 0; p < penguins.length; p++) {
  const penguin = penguins[p]
  if (penguin.island === "Dream") dream = dream + 1;
  if (penguin.island === "Biscoe") biscoe = biscoe + 1;
  if (penguin.island === "Torgersen") torgersen = torgersen + 1;
  // display(penguin)
}
```

Biscoe: ${biscoe},
Dream: ${dream},
Torgersen: ${torgersen}

```js
const forLoopPenguins = [
  { island: "Biscoe", count: biscoe },
  { island: "Dream", count: dream },
  { island: "Torgersen", count: torgersen }
]
display(forLoopPenguins)
```


```js
Plot.plot({
  height: 300,
  marks: [
    Plot.frame(),
    Plot.barY(
      forLoopPenguins,
      { x: "island", y: "count" }
    )
  ]
})
```

```js
let biscoeCountAgain = 0;
let dreamCountAgain = 0;
let torgersenCountAgain = 0;
penguins.forEach(p => {
  if (p.island === "Biscoe") biscoeCountAgain = biscoeCountAgain + 1
  if (p.island === "Dream") dreamCountAgain = dreamCountAgain + 1
  if (p.island === "Torgersen") torgersenCountAgain = torgersenCountAgain + 1
})
display(biscoeCountAgain) 
display(dreamCountAgain) 
display(torgersenCountAgain)
```


```js
const reducedPenguins = penguins.reduce((accumulator, currentValue) => {
  return {
  ...accumulator,
  [currentValue.island]: accumulator[currentValue.island] + 1
 }
}, {
  "Biscoe": 0,
  "Dream": 0,
  "Torgersen": 0
})
display(reducedPenguins)
```
