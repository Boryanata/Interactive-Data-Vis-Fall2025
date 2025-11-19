# Top Names

```js
const names = await FileAttachment("class_data/topNames.csv").csv({ typed: true })
display(names.slice(0, 10))
```

```js
display(Inputs.table(names))
```

<!-- ```js
const uniqueNames = Array.from(new Set(latestYear.map(name => name.name)))
display(uniqueNames)
``` -->

<!-- ```js
const nameCounts = latestYear.reduce((acc, value) => ({
  ...acc, // keep existing work
  [value.name]: (acc[value.name] || 0) + value.rank
}), {})
const rankSum = Object.entries(nameCounts)
  .map((d) => ({ name: d[0], rankSum: d[1] }))
  .sort((a, b) => a.rankSum - b.rankSum)
display(rankSum)

// ideal:
// [ 
// { name: "Ellie", rankSum: 23 }
// ]

// ideal:
// [ 
// { name: "Ellie", count: 3, ethnicities: ["", ""] }
// ]

// ideal:
// [ 
// { ethnicity: "", name: [] }
// ]

const nameCountsObj = latestYear.reduce((acc, value) => ({
  ...acc, // keep existing work
  [value.name]: (acc[value.name] || 0) + value.count
}), {})
const nameCounts = Object.entries(nameCountsObj)
  .map((d) => ({ name: d[0], totalCount: d[1] }))
  .sort((a, b) => b.totalCount - a.totalCount)
``` -->


<!-- ```js
Plot.plot({
  width,
  marginLeft: 60,
  marks: [
    Plot.barX(nameCounts.slice(0, 50), {
      y: "name",
      x: "totalCount",
      sort: { y: "-x" },
    })
  ],
})
``` -->


<!-- ```js
Plot.plot({
  width,
  marginLeft: 60,
  marks: [
    Plot.barX(latestYear, Plot.groupY(
      { x: "sum" },
      { y: "name", x: "count", fill: "ethnicity",  tip: true, 
        sort: { y: "x", reverse: true, limit: 20 } }
    ))
  ],
})
``` -->
