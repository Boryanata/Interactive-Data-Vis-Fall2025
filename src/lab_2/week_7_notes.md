---
title: "Week 7 Overview"
toc: true
---


## Data Types

Data comes in many different types, and these types _directly correspond_ to how we can and should visualize the information. 

**Qualitative**: Non-numeric, descriptive. (e.g. survey responses, observable features). Within Qualitative, there is: 
- **Nominal**: Distinct, separate categories, in which there is no inherent order or rank. (e.g. hair color, marital status)
- **Ordinal**: Distinct, separate categories that have a meaningful order, but the distance between them is not uniform or quantifiable. (e.g. grades, satisfaction level)

**Quantitative**: Numeric, measurable. (e.g. test score, distance). Within quantitative, there is: 
- **Discrete**: This type of data can only take specific, fixed values and is usually obtained by counting. (e.g. number of children)
- **Continuous**: This data can take on any value within a given range and is obtained by measuring. The values can be divided and measured to more and more precise levels, including fractions and decimals (e.g. height, weight)


## Scales
Plot has many different scales; we categorize them by their **input (domain)** and **output (range)**.

The **domain** is the abstract values that the scale expects as input. For quantitative or temporal data, it is typically expressed as an extent such as [start, end], [cold, hot], or [min, max]. For ordinal or nominal data, it is an array of values such as names or categories. The type of input values corresponds to the type scale option (e.g., linear or ordinal).

The **range** is the visual values that the scale generates as output. For position scales, it is typically an extent such as [left, right] or [bottom, top]; for color scales, it might be a continuous extent [blue, red] or an array of discrete colors. The type of values that a scale outputs corresponds to the name of the scale (e.g., x or color).

Source: [Observable Plot reference on scales](https://observablehq.com/plot/features/scales).

### Continuous Scales

Simple `x` scale, with a domain of 0 to 100:
${ Plot.plot({ x: { domain: [0, 100], grid: true } })}

Reverse the domain, from 100 to 0:
${ Plot.plot({ x: { domain: [100, 0], grid: true } })}

Stretch the range to the full width of the page:
```js
Plot.plot({
  width: width, 
  x: { 
    domain: [0, 100],
    grid: true
  }
})
```

The domain will automatically update to the data type, like with dates: 
```js
Plot.plot({
  x: { 
    domain: [
      new Date(2025, 1, 1), // this creates a JS date for jan 1st 2025 (YYYY, M, D)
      new Date() // this creates a JS date for right now
    ],
    grid: true,
  }
})
```

### Discrete Scales

For discrete data, a point or band scale is required.

**Point Scale**: A point scale divides the space into uniformly-spaced discrete values. This is the default scale type for ordinal data on the `x` and `y` scale. 

```js
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
Plot.plot({x: {type: "point", domain: letters, grid: true}})
```

**Band Scale**: A band scale, however, divides the space into uniformly-spaced _and -sized_ discrete intervals. This is how we can set the sizing for bar charts. In order to visualize these bands, we can use the cell mark.

```js
Plot.plot({
  x: {
    type: "band", 
    domain: letters
  },
  marks: [
    Plot.cell(letters, { 
      x: d => d, // or Plot.identity to set the x value as-is, and not display the y-axis
      stroke: "lightgrey" 
    })
  ]
})
```


## Data Types <> Scales <> Marks
Not only does data and scales have a relationship, but scales to marks have a relationship. Some marks can only be rendered with certain scales, which means they can only be rendered with certain data types. Let's do some examples with the diamonds dataset.

```js
Inputs.table(diamonds)
```

We have a combination of continuous (measured) and ordinal (distinct) data. The continuous data includes carat, depth, price, etc. The ordinal data is cut and color. 

Let's first make something with a combination of two continuous dimensions. Using x (width) and y (height), we can plot it with a dot mark. 

```js
Plot.plot({
  marks: [
    Plot.dot(diamonds, {
        x: "x", 
        y: "y",
        r: "price",
        fill: "currentColor", 
        opacity: 0.25,
        tip: true
      }
    )
  ]
})
```

We can also make something with one continuous and one ordinal scale -- like a bar chart. Let's use a transform to count how many of each cut exist in the dataset. 
```js
Plot.plot({
  marks: [
    Plot.barY(diamonds, 
      Plot.groupX(
        { y: "count" },
        { x: "cut", y: "count" }
      )
    )
  ]
})
```

We can expand this even further by adding _another_ grouping to our transformation. Not only can we use the transformation to group by a certain x channel for the reducer, we can pass another reducer to group on the same channel for the fill.  

```js
Plot.plot({
  marks: [
    Plot.barY(diamonds, 
      Plot.groupX(
        { y: "count", fill: "mean" },
        { x: "cut", y: "count", fill: "price", tip: true }
      )
    )
  ],
  color: {
    scheme: "YlOrRd",
    legend: true,
    label: "Average price"
  },
  x: {
    label: "Cut"
  },
  y: {
    label: "Count of diamonds"
  },
})
```

Now, back to exploring the mark types per scales, let's try making something with two ordinal data types. We can plot both of the ordinal data types, and this is usually using the `Plot.cell()` mark. Because we are working with ordinal values, both sides of the scale require some reducer to create something to plot. We can start with just the count of diamonds that fit each ordinal bucket:

```js
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.cell(diamonds.filter((d, i) => i < 100), {
      x: "color", 
      y: "cut",
      opacity: 0.25
    })
  ],
})
```

```js
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.text(diamonds, 
      Plot.group(
        { text: "count" },
        { x: "cut", y: "color", text: "count" }
      )
    )
  ]
})
```

Let's make this more interesting and actually fill the cells with a helpful color to see the distribution of prices per cut and color:

```js
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.cell(diamonds, 
      Plot.group(
        { fill: "mean" },
        { x: "color", y: "cut", fill: "price", tip: true }
      )
    )
  ],
  color: {
    scheme: "YlOrRd",
    legend: true,
    label: "Average price",
    tickFormat: d3.format("$,.0f")
  },
})
```
