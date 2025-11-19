<!-- ## Scales

```js
display(width)
```

```js
Plot.plot({
  // width: width,
  x: { domain: [0, 100], grid: true },
  // y: {},
  // marks: []
})
```

```js
Plot.plot({
  x: { domain: [100, 0], grid: true }
})
```

```js
Plot.plot({
  x: { domain: [ new Date(2020, 0, 0), new Date(2020, 2, 0) ]},
  marks: [ Plot.frame() ]
})
``` -->

<!-- ${Plot.plot({ marks: [Plot.frame()]})} -->

<!-- ## Point vs Band

```js
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
```

```js
Plot.plot({ 
  x: {
    domain: letters, 
    type: "point", 
    grid: true
  }
})
```

```js
Plot.plot({ 
  x: {
    domain: letters, 
    type: "band", 
  },
  marks: [
    Plot.cell(letters, {
      x: d => d, // Plot.identity
      stroke: "lightgrey"
    })
  ]
})
``` -->

## Marks

```js
view(Inputs.table(diamonds))
```

```js
Plot.plot({
  height: 200,
  marks: [
    Plot.dot(diamonds, {
      x: "x", 
      y: "y",
      r: "price",
      fill: "lightgrey",
      fillOpacity: 0.15,
      tip: true
    })
  ]
})
```

```js
Plot.plot({
  height: 200, 
  color: {
    scheme: "YlOrRd",
    legend: true,
    label: "Average price"
  },
  marks: [
    Plot.barY(diamonds, 
      Plot.groupX(
        { y: "count", fill: "mean" },
        { x: "cut", y: "count", fill: "price" , tip: true }
      )
    ),
  ],
})
```


<!-- ```js
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.dot(diamonds.filter((d, i) => i < 100), {
      x: "color",
      y: "cut"
    })
  ]
})
``` -->

```js
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.text(diamonds, 
      Plot.group(
        { text: "count" },
        { x: "color", y: "cut", text: "count" }
      )
    )
  ]
})
```

```js
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.cell(diamonds, 
      Plot.group(
        { fill: "mean" },
        { x: "color", y: "cut", fill: "price"  }
      )
    )
  ],
  color: {
    scheme: "YlOrRd",
    legend: true,
    label: "Average price"
  },
})
```