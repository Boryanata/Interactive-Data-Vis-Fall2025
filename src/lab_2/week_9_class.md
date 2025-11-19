---
title: "Week 9 Class"
toc: false
---


```js
const stocks = await FileAttachment("./stock_data/stocks.csv").csv({ typed: true })
const events = await FileAttachment("./stock_data/stock_events.csv").csv({ typed: true })
display(stocks.slice(0, 10))
display(events)
```

<!-- Create an array of unique tickers: -->
```js echo
const allTickers = stocks.map(d => d.Ticker)
// display(allTickers)
const setTickers = new Set(allTickers)
const uniqueTickers = Array.from(setTickers)
display(uniqueTickers)
```

```js
const selectedStock = view(Inputs.select(
  [null, ...uniqueTickers], 
  { value: "AAPL" } //"select" }
  ))
```

Selected stock is: ${selectedStock}

```js
const filteredStocks = stocks.filter(d => d.Ticker === selectedStock)
const filteredEvents = events.filter(d => d["Related Tickers"].includes(selectedStock))
display(filteredEvents)
```

```js
display(width)
```

```js
Plot.plot({
  title: selectedStock === null 
    ? "pick a stock to continue" 
    : `Viewing: ${selectedStock}`,
  height: 200,
  width,
  marks: [
    Plot.line(
      // stocks,
      filteredStocks,
      {
      x: "Date",
      y: "Close",
      z: "Ticker",
      // Changing transparency
      stroke: d => d["Ticker"] === selectedStock ? "black" : "none",
    }),
    Plot.linearRegressionY(filteredStocks, {x: "Date", y: "Close", stroke: "red"}),
    Plot.ruleY([0]),
    Plot.ruleX([new Date(2018, 0, 1)]),
    Plot.dot(
      filteredEvents,
      {
        x: "Date",
        y: 0,
        tip: true,
        channels: {
          "Event": "Event Name",
          "Notes": "Notes"
        }
      }
    ),
    Plot.tip([filteredEvents[11]], {
      x: "Date", //filterEvents.date
      // x: filteredEvents[0].Date
      channels: {
          "Event": "Event Name",
          "Notes": "Notes"
        }
    })
  ]
})
```

```js
Plot.plot({
  title: selectedStock === null 
    ? "pick a stock to continue" 
    : `Viewing: ${selectedStock}`,
  height: 200,
  width,
  marks: [
    Plot.line(
      // stocks,
      filteredStocks,
      {
      x: "Date",
      y: "Close",
      z: "Ticker",
    }),
    Plot.ruleY([0]),
    Plot.dot(
      filteredEvents,
      {
        x: d => d["Date"],
        y: event => {
          const thisStockObj = filteredStocks.filter(stock => 
            stock.Date.toDateString() === event.Date.toDateString()
            // && event["Related Tickers"].includes(stock.Ticker)
            // && stock.Ticker === selectedStock
            )
          console.log(thisStockObj)
          // return 0
          return thisStockObj[0]?.Close || 0
        },
        tip: true,
        channels: {
          "Event": "Event Name",
          "Notes": "Notes"
        }
      }
    ),
  ]
})
```



```js
const viewership = await FileAttachment('./viewership_data/viewership.csv').csv({ typed: true })
const cost = await FileAttachment('./viewership_data/production_cost.csv').csv({ typed: true })

display(viewership)
display(cost)
```

```js
view(Inputs.table(viewership))
```


<!-- ```js
Plot.plot({
  width, 
  marginLeft: 120,
  marks: [
    Plot.barX(viewership,
      {
        x: "total_estimated_viewership",
        y: "show_name",
        sort: { y: "-x" }
      }
    )
  ]
})
```


```js
Plot.plot({
  width, 
  marginLeft: 120,
  marks: [
    Plot.barX(cost,
      {
        x: "total_production_cost_usd",
        y: "show_name",
        sort: { y: "-x" }
      }
    )
  ]
})
``` -->

<!-- ```js
const newData = cost.map(d => ({ ...d, newValue: "E"}))
view(Inputs.table(newData))
``` -->



```js
Plot.plot({
  width, 
  marginLeft: 120,
  x: {
    tickFormat: tick => `${tick} vpd`
  },
  color: {
    scheme: "YlOrRd",
    legend: true,
    tickFormat: tick => d3.format(".1s")(tick)
  },
  marks: [
    Plot.barX(viewership, // always look here
      {
        y: d => d["show_name"],
        fill: "total_estimated_viewership",
        x: (views) => {
          // console.log("show viewers:", views)
          const thisShowCost = cost.find(c => {
            // console.log("c:", c)
            // console.log("check:", 
            //   c.show_name, 
            //   views.show_name, 
            //   c.show_name === views.show_name)
            return c.show_name === views.show_name
          })
          // console.log("thisShowCost", thisShowCost)
          const newMetric = views.total_estimated_viewership / thisShowCost.total_production_cost_usd
          return newMetric
        },
        sort: { y: "-x" }
      }
    )
  ]
})
```


# AI HELP

Here's what I asked AI:
<div style="font-family: monospace; font-size: 12px; background: lightgrey; border-radius: 2px; padding: 15px 10px">
I am working with Observable Plot, and I would like to join two datasets in this file (viewership, costs) on show name. I want to make a new metric, TOTAL views per TOTAL dollar (spent). 

Here is the cost data structure: 
{
  show_name: "Stranger Things"
  cost_per_episode_usd: 12000000
  number_of_episodes: 42
  total_production_cost_usd: 504000000
}

Here is the views data structure: 
{
  show_name: "Stranger Things"
  avg_weekly_viewers: 15200000
  launch_date: 2016-07-15
  weeks_since_launch: 486
  total_estimated_viewership: 7387200000
}
</div>

It returned: 
```js
// Join the datasets and create the new metric
const joinedData = viewership.map(show => {
  // Find the matching cost data for this show
  const matchingCost = cost.find(c => c.show_name === show.show_name);
  
  if (matchingCost) {
    return {
      show_name: show.show_name,
      total_estimated_viewership: show.total_estimated_viewership,
      total_production_cost_usd: matchingCost.total_production_cost_usd,
      views_per_dollar: show.total_estimated_viewership / matchingCost.total_production_cost_usd
    };
  }
  return null; // If no matching cost data found
}).filter(d => d !== null); // Remove any shows without cost data

display(joinedData);
```
<!-- selectedStock: ${select} -->

<div class="card">
${Plot.plot({
  width, 
  marginLeft: 120,
  title: "Views per Dollar Spent",
  marks: [
    Plot.barX(joinedData, {
      x: "views_per_dollar",
      y: "show_name",
      sort: { y: "-x" },
      tip: true
    })
  ]
})}
</div>