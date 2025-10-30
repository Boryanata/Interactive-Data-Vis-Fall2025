

```js
display(flare)
```
<!-- 
```js
Plot.plot({
  marks: [
    Plot.dot(diamonds, {x: "carat", y: "price", r: 0.1})
  ]
})
``` -->

```js
display(Plot.treeNode({
        path: "name",
        value: "size",
        fill: (d) => d.depth,
        stroke: "white"
      }))
```



```js
const root = d3.hierarchy({children: flare})
    .sum(d => d.size);

display(root.descendants())
```

```js
Plot.plot({
  marks: [
    Plot.dot(flare, 
      Plot.treeNode(
        Plot.tree({path: "name", value: "size"}), {
          fill: "node:depth",
          stroke: "white",
          strokeWidth: 1
        }
      )
    )
  ],
  r: {range: [0, 400]},
  color: {scheme: "Spectral", legend: true},
  width: 928,
  height: 928,
  axis: null,
  margin: 1
})
```