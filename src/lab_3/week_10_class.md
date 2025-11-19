---
title: "Week 10 Class"
toc: false
---

```js
const penguins = await FileAttachment('../lab_1/data/penguins.csv').csv({ typed: true })
```

<!-- ```js
Plot.plot({
  marginLeft: 80,
  grid: true,
  color: { legend: true },
  marks: [
    Plot.barX(penguins, 
      Plot.groupY(
        { x: "count" },  // reducer
        { y: "island", 
        fy: "species", 
        fill: "sex" } // options
      )),
    Plot.frame()
  ]
})
``` -->

<!-- ```js 
Plot.plot({
  width,
  marks: [
    Plot.frame(),
    Plot.dot(penguins, {
      // use this variable to position via x
      x: "bill_length_mm",
      // use this variable to position via y 
      y: "bill_depth_mm",
      // use this variable to color them
      fill: "island"
    })
  ]
})
```  -->


```js
const xDataDomain = d3.extent(penguins.map(d => d.bill_length_mm))
// display(xDataDomain)
const d3XScale = d3.scaleLinear()
  .domain(xDataDomain)
  .range([0, 500])

const yDataDomain = d3.extent(penguins.map(d => d.bill_depth_mm))
const d3YScale = d3.scaleLinear()
  .domain(yDataDomain)
  .range([200, 0])
```
<!-- 
```js
display(d3XScale(penguins[0].bill_length_mm))
display(d3YScale(penguins[0].bill_depth_mm))
``` -->



<!-- <svg width="500" height="200" style="border-style:solid">
  <circle cx="20" cy="100" r="5"></circle>
</svg> -->



```js
// const svg = d3.create('svg')
//   .attr("width", 500)
//   .attr("height", 200)
//   .style("border-style", "solid")
  
// svg.selectAll()
//   .data(penguins)
//   .join('circle')
//   .attr("cx", penguin => d3XScale(penguin.bill_length_mm))
//   .attr("cy", penguin => d3YScale(penguin.bill_depth_mm))
//   .attr("r", 3)
//   .attr("fill", penguin => penguin.island === "Dream" ? "#efb118" : penguin.island === "Biscoe" ? "#4269d0" : "#ff725c")

// view(svg.node())
```


```js
const geo = await FileAttachment('class_data/geo.json').json()
display(geo)

const counties = topojson.feature(geo, geo.objects.counties)
display(counties)

// since the id codes are number that can have a leading zero, we want to keep those as strings and the rates can be numbers
const unemployment = await FileAttachment('class_data/us-county-unemployment.csv')
  .csv({ typed: false })
  .then((data) => data.map(d => ({ ...d, rate: +d.rate})))
display(unemployment)
```

```js
const unemploymentMap = new Map(unemployment.map(d => [d.id, d.rate]))
display(unemploymentMap)
```

```js
Plot.plot({
  // projection: "equirectangular",
  projection: "albers-usa",
  color: {
    type: "quantile",
    n: 9,
    scheme: "blues",
    label: "Unemployment (%)",
    legend: true
  },
  marks: [
    Plot.geo(counties, { 
      fill: (d, i) => {
        // console.log(d)
        const rate = unemploymentMap.get(d.properties.id)
        console.log(rate);
        return rate
      },
      // stroke: "black", 
      tip: true, 
      channels: { "name": "name", id: "id" } 
    })
  ]
})
```


<!-- Plot.plot({
  projection: "albers-usa",
  color: {
    type: "quantile",
    n: 9,
    scheme: "blues",
    label: "Unemployment (%)",
    legend: true
  },
  marks: [
    Plot.geo(counties, {
      fill: d => unemploymentByID.get(d.id),
      title: (d) => `${d.properties.name} ${unemploymentByID.get(d.id)}%`,
      tip: true
    })
  ]
}) -->