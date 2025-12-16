---
title: "Week 14: Extras"
toc: true
---

# Data Art

### Delaunay

Create a small array of 100 data points that are randomly spread across the svg:
```js echo
const height = 300
const points = Array.from({ length: 100 }, (_) => [
  Math.random() * width,
  Math.random() * height
])
display(points)
```

These points are static, and randomly spread out:
```js
Plot.plot({
  width,
  height, 
  marks: [
    Plot.dot(points)
  ]
})
```

Given set of points in x and y, the Delaunay marks compute the [Delaunay triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation), its dual the [Voronoi tessellation](https://en.wikipedia.org/wiki/Voronoi_diagram), and the [convex hull](https://en.wikipedia.org/wiki/Convex_hull). The [voronoi mark](https://observablehq.com/plot/marks/delaunay#voronoi) computes the region closest to each point (its Voronoi cell). The cell can be empty if another point shares the exact same coordinates. Together, the cells cover the entire plot. 

The voronoi can be considered the space that "belongs" to each point. The lines that make up the voronoi mesh divide these spaces between points. 

```js
Plot.plot({
  width,
  height,
  marks: [
    Plot.dot(points),
    Plot.voronoiMesh(points)
  ]
})
```

This is incredibly helpful with something like tooltips. If you set the tooltip on the voronoi mesh, the user will always see some data, rather than having to carefully position their cursor over a small dot to trigger the tootlip. 

```js
Plot.plot({
  width,
  height,
  marks: [
    Plot.dot(points),
    Plot.voronoiMesh(points, { tip: true, opacity: 0.2 })
  ]
})
```

We can take this further and make it more "artsy", like a wobly stained glass window effect, by coloring and manipulating the mesh itself with sinusoidal motion:

```js
// simulate ticking of an animation
const t = (async function* () {
  for (let j = 0; true; ++j) {
    yield j;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
})();
```

```js echo
const voronoi = d3.Delaunay.from(
  // move the points in an elliptical pattern
  points.map(([x, y], i) => [
    x + 1.5 * Math.sin(t + i * i), // horizontal
    y + 2.0 * Math.cos(t + i * i) // vertical
  ])
).voronoi([0, 0, width, height])
// this part does what `Plot.voronoiMesh` does inherently
const data = [...voronoi.cellPolygons()].flatMap((cell) =>
  cell.map(([x, y]) => ({ x, y, i: cell.index }))
)
display(data)
```

```js
Plot.plot({
  width,
  height,
  x: { axis: null },
  y: { axis: null },
  marks: [
    Plot.dot(points),
    Plot.line(data, {
      x: "x",
      y: "y",
      fill: "i",
      stroke: "white",
      strokeWidth: 5,
    })
  ]
})
```
source: [Plot example](https://observablehq.com/@lsh/plot-voronoi) 

