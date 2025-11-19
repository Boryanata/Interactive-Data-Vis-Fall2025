---
title: "Week 8 Overview"
toc: true
---

# Framework Styling

# Layouts with HTML in MD

There are several options already available to us in observable framework that we could use for dashboard styling. We can always just include text between js blocks, like we do for most of this file and other class example files, or we can get more fancy, and use some of the built in styling that is outlined in the [markdown page](https://observablehq.com/framework/markdown) of Observable Framework documentation. Out of the box, we have:

### Cards

<div class="card">
This is content inside of a card, which is styled simply by putting the <span class="code">class="card"</span> in the HTML div element opening tag. You'll notice that this document doesn't include any "card" class definition or styling— it is out of the box dashboard element from Observable Framework.
</div>

### Grids

You can also make [grids](https://observablehq.com/framework/markdown#grids) that include cards, text, or even plots in side of them: 

<div class="grid grid-cols-4">
  <div class="card"><span>A</span></div>
  <div class="card"><span>B</span></div>
  <div class="card"><span>C</span></div>
  <div class="card"><span>D</span></div>
</div>

The grids are automatically responsive to page width, so in the case of the above grid, its a 4 column grid that (likely, on your screen) has auto-resized to be two columns of two rows. If you expand the browser full screen and collapse the left hand navigation, it should turn into four columns.

You can also be more specific with your grid style, with somthing creative:

<div class="grid grid-cols-2">
  <!-- first column -->
  <div class="card">
    <!-- use inline JS here, which does change the syntax highlighting (colors) -->
    ${Plot.plot({
      title: "Histogram of olympian weights",
      width: 400,
      height: 350,
      y: { grid: true },
      marks: [
        Plot.rectY(olympians, Plot.binX({ y: "count" }, { x: "weight" })),
        Plot.ruleY([0])
      ]
    })}
  </div>
  <!-- second column -->
  <div>
    <i>You may recall, this table is one that we used to bin the olympians weights into a histogram.</i>
    <div class="card" style="padding: 0;">
      ${Inputs.table(olympians)}
    </div>
  </div>
</div>

<div class="tip">
  <a href="https://observablehq.com/framework/markdown#cards">Observable recommends</a> that you remove the padding on <span class="code">Inputs.table</span> inside of cards. 
  <!-- Also, notice that inside of a tip, we can't use markdown to make that link in the previous sentance? 
  We have to use an <a> tag since we are already in HTML.  -->
</div>

### Styles and CSS

There are more than one way to include styles in your markdown files.

Since the markdown supports styles, you can include a style block anywhere in your file, to style specific classes or elements. The below block styles the text in the first card above (and here: <span class="code">this is code styled</span>)

```html echo
<style>
  .code {
    font-family: monospace;
    color: #A935D4;
    font-size: 0.8rem;
    font-weight: 800;
  }
</style>
```

<div class="tip">
  You may have noticed the code for this note includes `echo` after the code blocks. This allows you to see the code in the rendered display, without repeating the code block twice:
  <div style="display: flex; flex-direction: column">
    <span class="code">
      ```html echo
    </span>
    <span class="code">
      ```js echo
    </span>
  </div>
</div>

You can also pass style inline to your elements, but it gets messy if the style is too long. 
<div style="padding: 10px; background: rgba(255, 192, 203, 0.5); background-opacity: 0.2; border-radius: 4px">
  🐴 Pink pony club in here ✨ 
</div>
<br>

### Still not satisfied? 
If you're hoping to get even fancier for your work outside of these solutions, you can play with the available [observable themes](https://observablehq.com/framework/themes), and even bring those colors into your charts with css variables (`stroke: "var(--theme-foreground-focus)"`). To get even crazier, you can [make your own stylesheet](https://observablehq.com/framework/config#style) that will bring in whatever color variables into your markdown file available for use. 

<hr/>

# Lab 2 Concepts

For these concepts, we will use similar data types to the lab 2 assignment, but this will be stock data rather than ridership data. 

<!-- Import Data -->
```js
const stocks = await FileAttachment("./stock_data/stocks.csv").csv({ typed: true })
const events = await FileAttachment("./stock_data/stock_events.csv").csv({ typed: true })
display(stocks[0])
display(events[0])
```

## State Management

Let's make a simple line chart of close price over time for all stocks. We could include all stocks in the same chart, colored by the ticker (`z: "Ticker", stroke: "Ticker"`), or we can introduce a drop down to select the ticker to show. 

Dropdowns ([select](https://observablehq.com/framework/inputs/select)) require an array of options. We could just write out all the options available, or make it dynamically if the list is significant. In order to make an array of unique values, we can do the following: 
1. iterate over the entire array to get all the ticker names (returns `["AAPL", "AAPL", "GOOG", "GOOG", "META", ...]`)
2. turn it into a set, which eliminates duplicates (but returns a set, not an array, as `Set(5) { }`)
3. turn that set back into an array, leveraging `Array.from( ... )`

This combination is pretty advanced, but as long as you follow this formula, you can always get a unique set of values for your input selections:

```js run=false
const uniqueValues = Array.from(new Set([ARRAY GOES HERE].map(d => d[DATA KEY GOES HERE])))
```

Here's what that looks like for these stocks:
```js echo
// const allTickers = ["AAPL", "GOOG", "NFLX", "AMZN", "META"] // option 1: hardcode the values
const allTickers = Array.from(new Set(stocks.map(d => d.Ticker))) // option 2: dynamically create unique values
const selectedStock = view(Inputs.select(allTickers))
```

Now that we have a `selectedStock` from the input above, we can filter our data to just that selected stock, so we are changing the plot when we change the dropdown. 

```js
Plot.plot({
  height: 200, 
  width,
  marks: [
    Plot.line(stocks.filter(d => d.Ticker === selectedStock), {
      x: "Date",
      y: "Close",
      z: "Ticker",
      stroke: "Ticker",
    })
  ]
})
```
This is a simple example of something we call "state management". The selected stock is considered "state", and it is effectively the current selection. State management can be increasingly complicated as dashboards get more advanced. 


## Annotation

Depending on what you're trying to point out, there are a few helpful marks that could be used for annotations. You could use lines, dots, or even [images](https://observablehq.com/plot/marks/image).

Simply adding lines (with `Plot.ruleX()`) about the stock data to all stock data can help us start to see some trends: 
```js
Plot.plot({
  height: 200, 
  width,
  marks: [
    Plot.line(stocks, {
      x: "Date",
      y: "Close",
      z: "Ticker",
      stroke: "Ticker",
    }),
    Plot.ruleX(events, {
      x: "Date", 
      tip: true,
      channels: {
        "Event": "Event Name", 
        "Notes": "Notes"
      }
    })
  ]
})
```

We could include a tooltip annotation as a seperate data point too, to render it immediately. 

```js
const lastEvent = events[events.length - 1]
display(lastEvent)
```

```js
Plot.plot({
  height: 200, 
  width,
  marks: [
    Plot.line(stocks, {
      x: "Date",
      y: "Close",
      z: "Ticker",
      stroke: "Ticker",
    }),
    Plot.ruleX(events, {
      x: "Date", 
      tip: true,
      channels: {
        "Event": "Event Name", 
        "Notes": "Notes"
      }
    }),
    Plot.tip([lastEvent], {
      x: lastEvent.Date,
      channels: {
        "Event": "Event Name", 
        "Notes": "Notes"
      }
    }),
    Plot.ruleY([0])
  ]
})
```

Or, we could add dots that render on days in which there were events.

```js
Plot.plot({
  height: 200, 
  width,
  marks: [
    Plot.line(stocks, {
      x: "Date",
      y: "Close",
      z: "Ticker",
      stroke: "Ticker",
    }),
    Plot.dot(events, {
      x: "Date", 
      y: 0,
      tip: true,
      channels: {
        "Event": "Event Name", 
        "Notes": "Notes"
      }
    }),
    Plot.ruleY([0])
  ]
})
```
This is helpful, but wouldn't it be nice if these dots correspond to the price at the time of the event? If so, we'd need to position the circle on the line. How could we do that? 

<details>
  <summary>Answer in here ↓</summary>
  In order to position it on the line, we need the <span class="code">y</span> value of the related stock from the <span class="code">x</span> date of the event. 
  We can do that with some data joins. 
</details>
<br><br>

## Data Joins

Lab 2 includes multiple datasets which introduces new challenges when we want to marry the data points. There may be instances where we want to filter to state values, combine data, or reference values from one dataset into another. 

**Example 1: Filter dataset**

We already referenced this earlier, but we can actually filter data that is passed to marks to be responsive to an input (or "state"). We can do this to multiple datasets, as well. Let's create a plot that includes just the selected stock and its referenced data: 

```js
const anotherSelectedStock = view(Inputs.select(allTickers))
```

```js echo
Plot.plot({
  height: 200, 
  width,
  marks: [
    // filter the STOCK data to only the selected tooltip, which is in the "Ticker" column
    Plot.line(stocks.filter(d => d.Ticker === anotherSelectedStock), {
      x: "Date",
      y: "Close",
      z: "Ticker",
      stroke: "Ticker",
    }),
    // filter the EVENTS data to check if the "Related Tickers" (in the format AAPL|META|GOOG) includes the selected stock
    Plot.ruleX(events.filter(d => d["Related Tickers"].includes(anotherSelectedStock)), {
      x: "Date", 
      tip: true,
      channels: {
        "Event": "Event Name", 
        "Notes": "Notes"
      }
    })
  ]
})
```

<div class="note">
In the above example, we have a different type of javascript check here. Typically we use <span class="code">===</span> if we want to check if two values are the same, but in this case, we use <span class="code">.includes()</span>. That is because the data in <span class="code">stocks</span> includes just one ticker (<span class="code">AAPL</span>), wherehas the events data could be a string of related events <span class="code">AAPL|META</span>. By using <span class="code">.includes()</span>, we can check if the value is in the string at all. 
</div>

**JavaScript Join Methods**

What if we wanted to make more meaningful connections between the two datasets by sharing their values? How can we connect the two?

In SQL, we could use `joins` to help us make connections between datasets (defined as: `For each row in Table A, find matching rows in Table B based on some condition, and combine them into a single result row.`). In python, we could use a `merge` from pandas, and config like `left_on='[key]'` and `how='left'`. 

Using Javascript is a little more complicated to do this without libraries, but by leveraging array functions like `.map()`, `.filter()`, and `.reduce()`, we can make new arrays with the joins we are looking for.

Thinking about our dot annotation example earlier, ideally the circle could be positioned on the line. This means we would have to position the event at the appropriate x value (`date`), then *look up the y value for the stock, and use that for the y value of the dot*. 

Let's work though this join _without_ the chart for now. We have two sets of arrays, one that has objects of cities and states, and one that has people. We need to combine these, to find out what state these people live in. 

```js echo
const city_to_state = [
  { city: "New York", state: "New York" },
  { city: "Washington D.C.", state: null },
  { city: "Chicago", state: "Illinois" },
  { city: "San Francisco", state: "California" },
  { city: "Los Angeles", state: "California" },
]

const people = [
  { name: "Bill", city: "New York" },
  { name: "Brandi", city: "Washington D.C." },
  { name: "Johnny", city: "San Francisco" },
  { name: "Taylor", city: "Chicago" },
  { name: "June", city: "Los Angeles" },
]
```

To do so, we need to iterate over every _person_, then for that _person's city_, find the associated city + state value in the other dataset. 
```js echo
const people_with_state = people.map(personObject => {
  const matchingCity = city_to_state.find(cityObject => {
    return personObject.city == cityObject.city
  })
  return ({
    ...personObject, // spread to keep the existing object data
    state: matchingCity.state // get the state from the matching city object 
  })
})
display(people_with_state)
```

This first version works, but it requires a lot of nesting. We first map over the people, then for every person, do a lookup. We could make a new object to help us find the state from the city a little easier, but this will only work in this case, where therea are two key object/values:
```js echo
// get the values like [city, state]
const city_object_entries = city_to_state.map(cityValue => Object.values(cityValue)) 
display(city_object_entries)

// pass these as [key, value] to an object constructor
const state_lookup = Object.fromEntries(city_object_entries) 
display(state_lookup)
```

```js
const people_with_state_again = people.map(personObject => ({
  ...personObject, 
  state: state_lookup[personObject.city]
}))
display(people_with_state_again)
```

These are just a couple ways to do data joins in javascript, but this is an example of something that AI can be very helpful at, with some clear direction and requests for simple JS functions to achieve what you're looking for. 


**Example 2: Find a value from one dataset in another dataset**

Now that we know how to do this join, we can do these arrow functions within the channel itself. 

Before we get into the join code here, it's important to remember:
1. Data channels can be functions, so we could use that to our advantage to get from one data point to a related data point in another dataset.
2. When we define arrow functions, we have to have a very clear understanding of what is being passed to the function. If we need to, we can use `console.log(data)` within that function to debug.
3. Historically we have just used the generic `d` declaration in our functions (`(d) => d.price`), but we _cannot_ use `d` twice within two nested functions (`(d) => { d.events.filter((d) => d.attendance) }`) -- we have to use another variable (commonly, `e`, or a helpful word, like `event => event.Date`). 

Let's make another dropdown closer to this example that we can leverage in the below chart. 
```js
const yetAnotherSelectedStock = view(Inputs.select(allTickers))
```

We can also make some constants that could help us do this easier. 
```js echo
const selectedStockData = stocks.filter(d => d.Ticker === yetAnotherSelectedStock) // filter the stocks
const selectedStockEvents = events.filter(d => d["Related Tickers"].includes(yetAnotherSelectedStock)) // filter the events
// just look at the first object of this data
display(selectedStockData[0])
```

When we finally return to our original intention stated earlier: 

>Ideally the circle could be positioned on the line. This means we would have to position the event at the appropriate x value (date), then look up the y value for the stock, and use that for the y value of the dot.

We can use the channel function to look up the price value for that day in the other dataset.

Just like in the earlier example, we will use two marks for this example. The first mark is the stock line data (`Plot.line()`), and the second mark is the stock event data (`Plot.dot()`). Each has its own dataset. When we render the `y` value of the event mark, we will look for the stock value for that date in the other dataset. 

```js echo
Plot.plot({
  height: 200, 
  width,
  marks: [
    // the line based on the filtered (selected) stock data
    Plot.line(selectedStockData, {
      x: "Date",
      y: "Close",
    }),
    // dots for the stock events that correspond to the selected ticker
    Plot.dot(selectedStockEvents, {
      x: "Date", // position at the event date
      y: eventDataObj => {
        console.log("event data:", eventDataObj)
        // find the stock data for this date
        const stockData = selectedStockData.find(stockDataObj => { 
          // console.log("stock data:", stockDataObj)
          // which stock data matches this event data date?
          return eventDataObj.Date.toDateString() === stockDataObj.Date.toDateString()
        })
        // some events are on the weekend, and don't have a related stock value. 
        // We can check for a matching stockData and if it isn't there, return 0.
        return stockData ? stockData.Close : 0
      },
      stroke: "black", 
      fill: "white",
      tip: true,
      channels: {
        "Event": "Event Name", 
        "Notes": "Notes"
      }
    }),
    // an exposed tooltip for the first of the selected stock data events
    Plot.tip([selectedStockEvents[0]["Event Name"]], {
      x: selectedStockEvents[0].Date, // position at the event date
      y: selectedStockData.find(e => { // y position at the ticker line value on this date
        return e.Date.toDateString() === selectedStockEvents[0].Date.toDateString()
      })?.Close // the ? here just means that only return it if it exists, and don't "fail" if its undefined.
    }),
  ]
})
```

Now we know how to use values from one dataset within a visualization of another dataset!

<hr/>

## Color Scales

While position and size are important parts of a visualization, color can be incredibly helpful in driving understanding of the data. Color scales can be passed to the plot object in the `color` option (on the same level as `marks`).

We've seen colors applied to our data already just by adding a `fill` option, and observable does the rest. In this example, the "cut" variable is a categorical variable (with options of "Fair", "Good", "Ideal cut", etc), so it applies the default categorical color scale of `Observable10`.

```js
Plot.plot({
  marginLeft: 60,
  marks: [
    Plot.barY(diamonds, Plot.groupX(
      { y: "count" },
      { x: "cut", fill: "cut" }
    ))
  ]
})
``` 

We could change this, by adding a color scheme option picked from the available [supported schemes](https://observablehq.com/plot/features/scales#color-scales): 
```js echo
Plot.plot({
  marginLeft: 60,
  color: {
    scheme: "Set3"
  },
  marks: [
    Plot.barY(diamonds, Plot.groupX(
      { y: "count" },
      { x: "cut", fill: "cut" }
    ))
  ]
})
```

Or, we could create our own scale by using the domain and range options to pass into color option:
```js echo
Plot.plot({
  marginLeft: 60,
  color: {
    domain: ["Fair", "Good", "Ideal", "Premium", "Very Good"],
    range: ["pink", "blue", "lightblue", "red", "purple"]
  },
  marks: [
    Plot.barY(diamonds, Plot.groupX(
      { y: "count" },
      { x: "cut", fill: "cut" }
    ))
  ]
})
``` 

You have freedom to apply schemes and data types that don't necessarily match, although it may have unintended consequences. In this case, we are applying a diverging scheme (`BrBG`) to a categorical domain. It still works, but the middle value takes on a new meaning:
```js echo
Plot.plot({
  marginLeft: 60,
  color: {
    scheme: "BrBG"
  },
  marks: [
    Plot.barY(diamonds, Plot.groupX(
      { y: "count" },
      { x: "cut", fill: "cut" }
    ))
  ]
})
``` 

Lastly, in week 7, we made a heatmap of the same dataset by cut (y), color (x), and then price (fill). Let's revisit that color option:
```js echo
Plot.plot({
  marginLeft: 80,
  color: {
    scheme: "YlOrRd",
    legend: true,
    label: "Average price",
    tickFormat: d3.format("$,.0f")
  },
  marks: [
    Plot.cell(diamonds, 
      Plot.group(
        { fill: "mean" },
        { x: "color", y: "cut", fill: "price", tip: true }
      )
    )
  ],
})
```
Here we are using a `YlOrRd` scheme to illustrate the mean price across the cells. We also include legend, and pass in values for label and formatting. This formatter uses d3 formatting helpers. This is the first time we see color actually inputting its own value to the interpretation of the chart rather than just supplementing a categorical value or a placement. 

Let's return to our timeseries chart with stock events. We can include our own colors, or colors defined by a scheme, to help illustrate the various categorical values for the assumed event impact dots. 

I'll also put it in a card for nice dashboard display, and include a resize handler to change it size based on the window width.

```html echo
<div class="card">
${resize((width) => Plot.plot({
  height: 200, 
  width,
  color: {
    domain: ["Negative", "Mixed", "Positive"],
    scheme: "RdYlGn",
    legend: true, 
    label: "Assumed Event Impact"
  },
  marks: [
    // the line based on the filtered (selected) stock data
    Plot.line(selectedStockData, {
      x: "Date",
      y: "Close",
    }),
    // dots for the stock events that correspond to the selected ticker
    Plot.dot(selectedStockEvents, {
      x: "Date", // position at the event date
      y: d => selectedStockData.find(e => { // y position at the ticker line value on this date
          return e.Date.toDateString() === d.Date.toDateString()
        })?.Close,
      stroke: "black", 
      fill: "Assumed Impact",
      tip: true,
      channels: {
        "Event": "Event Name", 
        "Notes": "Notes"
      }
    }),
    // an exposed tooltip for the first of the selected stock data events
    Plot.tip([selectedStockEvents[0]["Event Name"]], {
      x: selectedStockEvents[0].Date, // position at the event date
      y: selectedStockData.find(e => { // y position at the ticker line value on this date
        return e.Date.toDateString() === selectedStockEvents[0].Date.toDateString()
      })?.Close
    }),
  ]
}))}
</div>
```
