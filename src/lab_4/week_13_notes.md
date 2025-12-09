---
title: "Week 13 Overview"
toc: true
---

# Week 13 Notes

# Libraries 

We aren't limited to just Plot within observable markdown files -- we have access to all the libraries that are listed in the observable framework documentation under "libraries" -- and you don't have to import them. This includes libraries like lodash, leaflet, mapbox, and of course, d3.js. 


## Mapping libraries

### Leaflet

We have used SVG for making maps with plot and projections in [week_10_notes]('./lab_3/week_10_notes'), but observable includes other tile based libraries like leaflet and mapbox. 

To make this work in observable, we leverage `display` to show an element created via the DOM api (`document.createElement("div")`). We do this all in the same code block for ease -- creating the div, manipulating the style, appending the map to it, and making customizations to the map.  

The library is already included, and as per [the documentation](https://observablehq.com/framework/lib/leaflet), can be accessed with the letter `L`. 

```js echo
// create a div
const div = display(document.createElement("div"));
// edit the style of this div directly 
div.style = "height: 400px;";

// lat / long of CUNY
const cunyLocation = [40.7485, -73.9838]

// create a map with `L` as the leaflet import and `.map` as the method to call
const map = L.map(div)
  .setView(cunyLocation, 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})
  .addTo(map);

L.marker(cunyLocation)
  .addTo(map)
  .bindPopup("CUNY Graduate Center")
  .openPopup();
```

There are many more ways to customize a leaflet map, which can be found in the [leaflet documentation](https://leafletjs.com/reference.html). 


### Mapbox

Another option is mapbox. Mapbox is a comprehensive paid platform that includes mapping tiles, data, and mapping tools. Leaflet is a simpler, open-source JS library that provides the core functionality for displaying maps in web browsers. 

Because mapbox is a paid service, you will need an access code to render something here. You can do so by creating an account with [mapbox](https://www.mapbox.com/). 

```js run=false
const div = display(document.createElement("div"));
div.style = "height: 400px;";

const map = new mapboxgl.Map({
  container: div,
  accessToken: ACCESS_TOKEN, // replace with your token, "pk.…"
  center: [2.2932, 48.86069], // starting position [longitude, latitude]
  zoom: 15.1,
  pitch: 62,
  bearing: -20
});

invalidation.then(() => map.remove());
```

## d3.js
We also reviewed d3 a bit in our introduction to svgs in [week_10_notes]('./lab_3/week_10_notes'), but let's take it more step by step and review the concepts. 

### Selection
D3.js uses DOM manipulation to add, change, or remove elements that are already on the screen. This is usually used to attach DOM elements to data, but we can also just select and manipulate any element with the same methods. 

First, we use `d3.select` to "select" everything on the page that fits the selector criteria. We can start with just selecting any pre-existing element, with the help of css selectors. Let's make an svg and select it with javascript:

<svg id="svg-component" style="border: 1px solid" width="${width}">
  <text 
    id="text-component" 
    style="font-style: italic; transform: translate(50%, 50%); text-anchor: middle"
    >this is our svg for selection</text>
</svg>

SVG selection, from d3:
```js echo
const svgSelection = d3.select("#svg-component")
display(svgSelection)
```
This looks like a bunch of code nonesense, and it somewhat is. But now that we have that DOM element saved in a variable, we can make changes to it with d3 methods. 

### Action

The next step in the d3 process is actions on a selection. We can do many things with the selection, including simply modifying the style, or appending more elements, or changing elements, etc. Each of these buttons runs a function that does something to the selection (the svg above):

```js
view(Inputs.button("abra", { label: "Change the background color", reduce: changeColor }))
view(Inputs.button("kadabra", { label: "Add a circle", reduce: addCircle }))
view(Inputs.button("alakazam", { label: "Change the text value", reduce: changeText }))
```

```js echo
function changeColor() {
  // edit the style of the element
  svgSelection.style("background-color", "pink")
}

function addCircle() {
  svgSelection
    // append a circle
    .append("circle")
    .attr("cx", 40)
    .attr("cy", 40)
    .attr("r", 20)
    // style the appended circle (notice this style is not on the svg, but the circle)
    .style("fill", "lightblue")
    .style("stroke", "white")
}

function changeText() {
  // select the text component within the svg and change the text value
  svgSelection.select("#text-component").text("🎉 BOO! new text!!! 🎉")
}
```

If we look at the SVG node (element) after clicking some buttons, we can see those changes exist on the element itself. Check it out in the inspector, and you can see the function style and element changes exist in the DOM tree.

### Data Binding

This is enough if all we wanted to do was modify elements on the page, but we want to actually bind the elements on the page to data. To do this, we join elements to data, and rely on d3 to reconcile. Let's make a new SVG and some fake data to append to it. 

Circles SVG:

<svg id="svg-component-circles" style="border: 1px solid" width="100" height="100"></svg>

```js
function generateRandomPoints(count = 10) {
  const points = [];
  
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 100) + 1;
    const y = Math.floor(Math.random() * 100) + 1;
    points.push({ x, y });
  }
  
  return points;
}
```

We will start with just some random data generated with a points generator to make an object with an x and y betweeon 0 and 100:
```js
const data = generateRandomPoints();
display(data)
```
We've already used selections for things that exist, but d3 is funny in that when doing data joins, we often start by selecting things that _don't (yet) exist_. We start with a selection of the svg, then `selectAll` of the elements we intend to make. Then, in that sub-selection, we use `join` to create the new element that should be joined to data, and pass in functions to help determine the relevant properties of the svg element, like `cx` and `cy` in a `<circle>`, or `width` and `height` in a `<rect>`. 

```js echo
// grab the other svg with the appropriate id / css selector
const svg = d3.select("#svg-component-circles")
// create the circles selection by selecting something that doesn't exist, but matches what we intend to make
const circles = svg.selectAll("circle.data-join")
  .data(data)
  // join = create one circle for every data element
  .join("circle")
  // add the class so it matches the original selection ("circle.data-join")
  .attr("class", "data-join")
  // the x and y should be based on the x and y from the data
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)
  .attr("r", 3)
```

You can think of this selection as a declaration of the items on the screen that _will_ match what you intend to make. This probably seems backwards (or, overly complex) as you think about creating visualizations that render on the page right away. But this approach of `join`ing with an empty `selection` is optimized for the potential next step, in which the data can change. 

<svg id="svg-component-changes" style="border: 1px solid" width="100" height="100"></svg>

```js
let changingData = generateRandomPoints();

function changeData() {
  changingData = generateRandomPoints();
  draw(changingData) 
}

function addPoints() {
  const newPoints = generateRandomPoints(3);
  console.log(newPoints)
  changingData = [ ...changingData, ...newPoints ];
  draw(changingData) 
}

function deletePoints() {
  const length = changingData.length
  console.log(length)
  changingData = changingData.slice(0, changingData.length - 3)
  draw(changingData) 
}
```

```js echo
function draw(data) {
  // grab the new svg with the appropriate id / css selector
  const svg = d3.select("#svg-component-changes")
  // create the circles selection by selecting something that doesn't exist, but matches what we intend to make
  const circles = svg.selectAll("circle.data-join")
    .data(data)
    // join = create one circle for every data element
    .join("circle")
    .attr("class", "data-join")
    // the x and y should be based on the x and y from the data
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 3)

  return svg.node()
}
```

The above draw function is when we draw, or actually run the d3 code to append/update/remove the circles. We don't always need this to be a function, but in order to trigger updates in this observable framework markdown file, we have to trigger the change once the button has been clicked. We will start by calling it to return the svg node:

```js
draw(changingData)
```

Each of these functions do two things: (1) change the data in some way, and (2) trigger the draw function to re-draw on the svg. 

```js
view(Inputs.button("refresh", { 
  label: "Refresh the points", reduce: changeData 
}))
view(Inputs.button("add", { 
  label: "Add new points", reduce: addPoints 
}))
view(Inputs.button("delete", { label: "Delete points", reduce: deletePoints }))
```

This example is complex in that it spans multiple js blocks and requires a function to update, but the intended concept is that, whenever actions / instructions are called on a selection, it remedies with whatever state the data is at that point.

## Imports
Observable framework markdown files also let you organize your code in separate files and import them to render on the page. This could help you structure your dashboard in the sub components -- particularly if you want to use the component more than once. 

In the `./components/charts.js` file, I've made two functions that render plots. One with Plot, and one with d3.js. Each one looks a little different, but they both can be used to create something similar:

```js echo
import { plotChart, d3Chart, scatterplot } from "./components/charts.js"
```

<div style="display: flex; flex-direction: column; gap: 1em;">
  <div>Plot:</div>
  <div>${resize((width) => plotChart(width))}</div>
  <div>D3:</div>
  <div>${resize((width) => d3Chart(width))}</div>
</div>

We can also make significantly more robust charts with d3, particularly as a component in another file, and import it into our dashboards. If we take the penguins data and create a scatterplot in d3, using the data joins we learned about, we can import that here:
```js
resize((width) => scatterplot(width, penguins, "culmen_depth_mm", "culmen_length_mm", "island"))
```