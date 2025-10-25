---
title: "Week 6 Overview"
toc: true
---

## Student Questions

### File Attachments & Promises

When it comes to file attachments, we get some weird behavior if we try to refer to the data from the file attachment in the same code block as the file request. That is because the result of the `FileAttachment` in the constant definition is something called a [promise](https://observablehq.com/framework/reactivity#promises). 

Logging in the same block:
```js
const penguins = FileAttachment("./data/penguins.csv").csv({ typed: true }) // this returns a promise
display(penguins) // this shows: > Promise {}
```

Logging in the next block:
```js
display(penguins) // this shows the data 
```

The second iteration of the `display(penguins)` code block _waits for the completion of the other blocks it depends on_. 

**Promises:**

A promise is aptly named in that it _promises_ the results of the request. We can create promises in javascript to do anything, like wait a certain amount of seconds before returning a value, like in this example:

```js
const fast = new Promise((resolve) => setTimeout(() => resolve("fast"), 500));
const slow = new Promise((resolve) => setTimeout(() => resolve("slow"), 5000));
```

fast: ${fast} <br/>
slow: ${slow}

The `FileAttachment` is inherently a promise, because it takes some time to go get the data from the file and convert it to JSON (object) notation. By using separate JS blocks between the `FileAttachment` and the code in which we refer to the variable, we are already waiting for the result. 

But if we want to use the variable in the same code block as the `FileAttachment`, we have to tell javascript to wait for the result before continuing. 

<!-- ```js
const patientPenguins = await FileAttachment("./data/penguins.csv").csv({ typed: true })
display(patientPenguins) // data! yay!
``` -->
The `patientPenguins` are told to explicitly wait for the results of the file attachment before continuing, so we do actually see the value in the subsequent `display()`

More detail on JS promises generally: [MDN Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

### What is "console.log" and why do we use it?

The use of `console.log()` is primarily for traditional JS files in web development and not necessarily _Observable Framework_ development. 
Observable includes enough helpers to see what our variables are at any point, like `display()` and `view()` and `Inputs.table()`.

For the same asynchronous reason we have promises, `console.log` could help us see variables at a certain point in time in a javascript file. But, in our environment, that's not necessarily helpful, because the reactivity of the cells takes care of the order of rendering. 

<hr/>


## Recap of Marks

Let's review the Penguins dataset that we visualized with last week: 
```js
Inputs.table(penguins)
```

### Basic plot
Start with a basic plot to remind us how the marks work:
```js run=false
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
``` 

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
``` 

### Transforms
What if we want to make a bar chart of the data -- like penguins per island? The dataset is comprehensive, but doesn't include quantities and amounts summed by particular characteristics.

We can use observable transformations in the data to tell the visualization to calculate the values prior to building the visualization. 

In the observable plot documentation, these are called [**transforms**:](https://observablehq.com/plot/features/transforms)
> _Transforms derive data as part of the plot specification. This accelerates what is often the most onerous task in visualization: getting data into the right shape._

We can use these transforms on the data to group the penguins by a certain reducer.

Let's take this example of counting the species:
```
Plot.groupX( { y: "count" }, { x: "species" } )  
```
The first argument passed to the `groupX` function, the outputs argument,  declares desired output channels and the associated reducer. In the case of `{ y: “count” }`, the resulting y value will be "reduced by" (or, calculated by) **count** of x values. 

Then in the second argument, the options argument, the channel for x is passed as `{ x: “island” }`. 
The combination of these two arguments means that the transformer will count the datums (penguins) per island. 

```js run=false
Plot.plot({
  marks: [
    Plot.barY(penguins, 
      Plot.groupX(
        { y: "count" },
        { x: "island", fill: "island" }
      )
    )
  ]
})
```

```js
Plot.plot({
  marks: [
    Plot.barY(penguins, 
      Plot.groupX(
        { y: "count" },
        { x: "island" }
      )
    )
  ]
})
```

Let's take a look at what the transformer actually _returns_:

```js run=false
const groupOutput = Plot.groupX(
  { y: "count" },
  { x: "island" }
);
```

`groupOutput`:
```js
const groupOutput = Plot.groupX(
  { y: "count" },
  { x: "island" }
);
display(groupOutput)
```

The `groupOutput` is actually an object with x, y, fill, and another `transform` function. This is very similar to how we would typically define channels, but with an added function that helps the visualization know how to pre-calculate the values it needs. 

Let's take this even further by including a color fill in the visualization. We can do so by including more values in the channels argument to the transformer, just like we did in the scatterplots. We can include "fill" in the second argument of `groupX` and it works just like if we didn't have a transformer. 

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

There are many reducer types available to us with something like group -- the reducers include the following:
- count - the number of elements (frequency)
- sum - the sum of values
- mean - the mean value (average)
- [and many more](https://observablehq.com/plot/transforms/group#group-options)

Let's try another example with the built in `olympians` dataset:
```js
Inputs.table(olympians)
```

This dataset includes a list of olympians, and among other things, their specific height and weight. If we wanted to make a histogram of the distribution of weights, we couldn't use the same `groupX` function, because we aren't aggregating **ordinal or nominal data**. We are instead aggregating **quantitative or temporal data**. Instead, we have to use [`binX`](https://observablehq.com/plot/transforms/bin).

```js run=false
const binOutput = Plot.binX({y: "count"}, {x: "weight"})
```

`binOutput`: 
```js
const binOutput = Plot.binX({y: "count"}, {x: "weight"})
display(binOutput)
```

```js
Plot.plot({
  y: {grid: true},
  marks: [
    Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight"})),
  ]
})
```

## Data Manipulation


What if we wanted to make the same visualization _without_ a data transformation? Rather than just pass the transformation to the visualization, we could do some data manipulation ourselves, create a new dataset, and pass that to the visualization. 

Let's first decide on the final data structure we want to pass to the visualization. We need the island name to pass to the x value, and we need the count of penguins per island. That could be as simple as a dataset with three datums:
```JSON
[
  { island: "Biscoe", count: 168 }, 
  { island: "Dream", count: 124 }, 
  { island: "Torgersen", count: 52 }
]
```

We can do this with basic javascript in a js cell with a few helpful existing functions. One of the older approaches to calculate this value would be with a `for loop`.

```js
let biscoeCount = 0;
let dreamCount = 0;
let torgersenCount = 0;
for (let p = 0; p < penguins.length; p++) {
  const penguin = penguins[p]
  if (penguin.island === "Biscoe") biscoeCount = biscoeCount + 1
  if (penguin.island === "Dream") dreamCount = dreamCount + 1
  if (penguin.island === "Torgersen") torgersenCount = torgersenCount + 1
}
```

Biscoe: ${biscoeCount},
Dream: ${dreamCount},
Torgersen: ${torgersenCount}

With those values, we can now create our dataset:

```js
const forLoopPenguins = [{ island: "Biscoe", count: biscoeCount }, { island: "Dream", count: dreamCount }, { island: "Torgersen", count: torgersenCount }]
display(forLoopPenguins)
```

And build our visualization with the new dataset:

```js
Plot.plot({
  marks: [Plot.barY(forLoopPenguins, {
    x: "island", 
    y: "count",
    fill: "island"
  })]
})
```
See more about for loops in javascript with the MDN guide on [loops and iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration). 


Using for loops is only one way to manipulate data in javascript -- you can use more modern technologies, like `.forEach`:

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

Or, the most compact but complex, would be to recreate an object with a [`.reduce` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce): 

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
