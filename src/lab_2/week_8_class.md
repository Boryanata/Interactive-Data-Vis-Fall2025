---
title: "Week 8 Class"
toc: true
---

<!-- ```js
const data = [
  { name: "Alice", age: 25, location: "New York" },
  { name: "Bob", age: 30, location: "California" },
  { name: "Charlie", age: 35, location: "New York" },
]
```

```js
display(data[0].name)

console.log(data[0].name)

data.map(d => {
  console.log(d)
})
display(data)
```

```js
const newData = data.map(d => ({ 
  ...d, // elements of the old obj
  // age: d.age + 10,  // age should be age + 10 
  oldAge: d.age + 10
}))
display(newData)
```


```js
Plot.plot({
  marks: [
    Plot.barY(newData, {
      x: "name",
      y: "oldAge"
    })
  ]
})
``` -->

<!-- 
```js
const team = view(Inputs.select(["a", "b"]))
```

Your fav team is ${team}

 -->
<!-- 
<div class="grid grid-cols-4">
  <div class="card"><span>A</span></div>
  <div class="card"><span>B</span></div>
  <div class="card"><span>C</span></div>
  <div class="card"><span>D</span></div>
</div>

<style>
  .code {
    font-family: monospace;
    color: #A935D4;
    font-size: 0.8rem;
    font-weight: 800;
  }

  .newFont {
    font-family: "Arial"
  }
</style>

<div class="card">
  This is going to have <span class="code">code in it</span>
</div>

```js
Plot.plot({
  marks: [
    Plot.frame()
  ]
})
```

<div class="grid grid-cols-4">
  <div>lorem</div>
  <div class="grid-colspan-3">
    ${
      Plot.plot({
        marks: [
          Plot.frame()
        ]
      })
    }
  </div>
</div> -->


<div class="newFont" style="background: pink">
  Pink pony club
</div>


<!-- Import Data -->
```js
const stocks = await FileAttachment("./stock_data/stocks.csv").csv({ typed: true })
const events = await FileAttachment("./stock_data/tech_stock_events.csv").csv({ typed: true })
display(stocks[0])
display(events[0])
```

<!-- ```js
Inputs.table(stocks)
``` -->

```js
const allTickers = stocks.map(d => d.Ticker)
const setTickers = new Set(allTickers)
const uniqueTickers = Array.from(setTickers)
// display(uniqueTickers)
```

```js
const selectedStock = view(Inputs.select(uniqueTickers))
```

<!-- ${selectedStock} -->

```js run=false
if (stock is selected) {
  then "pink"
} else {
  "black"
}

stock is selected ? pink : black
```

```js
const filtered = stocks.filter(d => d.Ticker === selectedStock)
```


```js
Plot.plot({
  height: 200,
  marks: [
    Plot.line(stocks, {
      x: "Date",
      y: "Close",
      z: "Ticker",
      stroke: d => d["Ticker"] === selectedStock ? "black" : "none",
      tip: true
    })
  ]
})
```