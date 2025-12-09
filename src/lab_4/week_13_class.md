---
title: "Week 13 Class"
toc: true
---

```js
display(width)
```
<!-- // // <circle cy="100" cx="50" r="50"></circle> -->
<!-- <svg style="border: 1px solid;" id="container" width="400" height="400">

</svg> -->


<!-- ```js
const svg = d3.select("#container")
  .append('text')
  .text('Hello world!')
  .attr("x", 50)
  .attr("y", 50)

display(svg)
console.log(svg)
``` -->

<!-- ```js
const svg = d3.select("#container")
  .style("background-color", "lightgray")

const circles = svg.selectAll(".words")
  .data([
    "quick", "brown", "fox", "jumped", "over",
  ])
  .join("text")
  .attr("class", "words")
  .text(d => d)
  // .text("hello world")
  .attr("x", (d, i) => i * 75)
  .attr("y", 50)


  console.log(circles)

  
display(svg)
console.log(svg)
``` -->

<!-- 
```js
display(penguins)
```
```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {
      x: "culmen_length_mm",
      y: d => d["culmen_depth_mm"]
    })
  ]
})
``` -->


<!-- ```js
console.log(penguins)
const svg = d3.select("#container")
  // .style("background-color", "lightgray")

const xDomain = d3.extent(penguins.map(d => d["culmen_length_mm"]))
const xScale = d3.scaleLinear()
  .domain(xDomain)
  .range([0, 400])
  .nice()


const yDomain = d3.extent(penguins.map(d => d["culmen_depth_mm"]))
const yScale = d3.scaleLinear()
  .domain(yDomain)
  .range([400, 0])
  .nice()

const penguinCircles = svg.selectAll()
  .data(penguins)
  .join("circle")
  .style("stroke", "black")
  .style("fill", "none")
  .attr("r", 3)
  .attr("cx", d => xScale(d["culmen_length_mm"]))
  .attr("cy", d => yScale(d["culmen_depth_mm"]))

display(penguinCircles)



``` -->

<svg style="border: 1px solid;" id="container" width="${width}$" height="200">

</svg>

```js
const stocks = await FileAttachment('../lab_2/stock_data/stocks.csv').csv({ typed: true})
display(stocks)

const svg = d3.select("#container")

const xDomain = d3.extent(stocks.map(d => d["Date"]))
const xScale = d3.scaleTime()
  .domain(xDomain)
  .range([0, width])
  .nice()

const yDomain = d3.extent(stocks.map(d => d["Close"]))
const yScale = d3.scaleLinear()
  .domain(yDomain)
  .range([200, 0])
  .nice()

console.log(stocks[864])
console.log(xScale(stocks[864].Date))
console.log(yScale(stocks[864].Close))

const pathGen = d3.line()
  .x(d => xScale(d["Date"]))
  .y(d => yScale(d["Close"]))

  console.log(pathGen)

const tickerData = d3.groups(stocks, d => d["Ticker"]).map(([ticker, data]) => data)
console.log(tickerData)

const stockPath = svg.selectAll(".stocks")
  .data(tickerData)
  // .data(stocks)
  .join("path")
  .attr("class", "stocks")
  .attr("d", d => pathGen(d))
  .style("stroke", "black")
  .style("fill", "none")


// d3.select("#container")
//   .selectAll(".stocks")
//   .data(tickerData)
//   // .data(stocks)
//   .join("path")
//   .attr("class", "stocks")
//   .attr("d", d => pathGen(d))
//   .style("stroke", "black")
//   .style("fill", "none");


```