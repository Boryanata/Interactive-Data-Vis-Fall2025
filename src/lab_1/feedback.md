# Feedback from Lab Submissions

## General Thoughts
Some thoughts and feedback on the work as a whole:

1. The `index.md` is the place to do your work -- and its already set up for you to deploy. Iterating there is your best bet for success and avoiding git and deployment issues. 

2. Let's use these dashboards more as presentations of information -- give context to your visualizations. Why does this help answer the question? In your perspective, what is the answer to the question?

3. Class examples are specifically designed to help you achieve a lot of what you need to do in these labs. Start with reviewing the class branch and notes, and when you do go to AI for help, use it for small tasks ("How can I change this data structure?") with a clear success in your mind, rather than larger answers that may work initially, but change the structure of your code. 


## Specific Examples

```js
const pollinators = FileAttachment("./data/pollinator_activity_data.csv").csv({ typed: true }) // this returns a promise
```

### AI Nonesense
Here are scary responses from AI that we want to avoid: 

This script tag loads d3. D3 already exists in framework -- so we should be set within this context. But it also is a clue that AI is trying to solve your problem with something that wouldn't be helpful in this framework environment. 

That looks like this:
``` run=false
<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
```

or like this: 
``` run=false
import * as d3 from "npm:d3@7";
```

We also, for the most part*, shouldn't need to render HTML through a function. HTML is available to us already in the framework, so we can just render it directly. 

<div id="container"> </div>

```js echo
const element = html`Hello, world!`
document.getElementById("container").append(element)
```

<div>Hello, world!</div>

*_I will caveat to say that there are [some instances](https://observablehq.com/framework/javascript#:~:text=You%20can%20use%20the%20DOM%20API%20to%20create%20content%20as%20above%2C%20but%20typically%20you%E2%80%99ll%20use%20a%20helper%20library%20such%20as%20Hypertext%20Literal%2C%20Observable%20Plot%2C%20or%20D3%20to%20create%20content.%20For%20example%2C%20here%E2%80%99s%20a%20component%20that%20displays%20a%20greeting%3A) of using these features, but they are fairly advanced, so you are welcome to use it if you are using it for its intended purpose_


### Pseudo Bar Chart

```js echo
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.barY(pollinators, {
      x: "weather_condition", 
      y: "visit_count", 
      aggregate: "mean", 
      fill: "weather_condition",
      inset: 1
    })
    // Plot.barY(pollinators, 
    //   Plot.groupX(
    //     { y: "count" },
    //     { x: "weather_condition", fill: "weather_condition", }
    //   )
    // )
  ],
  color: { legend: true },
  y: { label: "Average Visit Count", grid: true},
  x: { label: "Weather Condition" },
})
```

### Option for saving and re-using colors 

```js echo
const beeColors = {
  "Honeybee": "#f4b400",      // warm yellow
  "Bumblebee": "#ff6900",     // orange
  "Carpenter Bee": "#3366cc" // deep blue
};
```

```js echo
fill: beeColors.Honeybee // returns #f4b400
```

### Highlighting the center values

```js
// Compute the averages first
const averages = pollinators.reduce((acc, d) => {
  const s = d.pollinator_species;
  if (!acc[s]) acc[s] = { total_mass: 0, total_wing: 0, count: 0 };
  acc[s].total_mass += d.avg_body_mass_g;
  acc[s].total_wing += d.avg_wing_span_mm;
  acc[s].count++;
  return acc;
}, {});
for (const s in averages) {
  averages[s].avg_mass = averages[s].total_mass / averages[s].count;
  averages[s].avg_wing = averages[s].total_wing / averages[s].count;
}

// Find the one closest to each species' average
const closest = Object.values(
  pollinators.reduce((acc, d) => {
    const s = d.pollinator_species;
    const avg = averages[s];
    const dist = Math.hypot(d.avg_body_mass_g - avg.avg_mass, d.avg_wing_span_mm - avg.avg_wing);
    if (!acc[s] || dist < acc[s].dist) acc[s] = {...d, dist};
    return acc;
  }, {})
);
closest
```

```js
Plot.plot({
  grid: true,
  inset: 10,
  title: "Wing Span & Body Mass (with Average Specimen per Bee Species)",
  x: { label: "Body Mass (g)" },
  y: { label: "Wing Span (mm)" },
  color: {
    legend: false,
    label: "Pollinator Species",
    domain: ["Honeybee", "Bumblebee", "Carpenter Bee"],
    range: ["#f4b400", "#ff6900", "#3366cc"]
  },
  marks: [
    // All dots
    Plot.dot(pollinators, {
      x: "avg_body_mass_g",
      y: "avg_wing_span_mm",
      fill: "pollinator_species",
      opacity: 0.5,
      tip: true
    }),

    // Highlighted "closest to average" dots
    Plot.dot(closest, {
      x: "avg_body_mass_g",
      y: "avg_wing_span_mm",
      fill: "pollinator_species",
      stroke: "white",
      strokeWidth: 1.5,
      r: 6
    }),
    // Styled two-line labels
    Plot.text(closest, {
      x: "avg_body_mass_g",
      y: "avg_wing_span_mm",
      dy: -18,
      text: d =>
        `${d.pollinator_species}\n${d.avg_wing_span_mm.toFixed(1)} mm, ${d.avg_body_mass_g.toFixed(2)} g`,
      textAnchor: "middle",
      fontWeight: "bold",
      fill: "black",
      stroke: "white",
      strokeWidth: 4,
      paintOrder: "stroke"
    }),

    // Centroids with labels
    Plot.dot(pollinators, Plot.centroid({
      x: "bodyMass", 
      y: "wingSpan", 
      z: "species",
      fill: "species",
      stroke: "black",
      strokeWidth: 2,
      r: 5
    })),
    
    Plot.text(pollinators, Plot.groupX(
      {x: "mean", y: "mean", text: "first"},
      {x: "bodyMass", y: "wingSpan", z: "species", text: "species", dy: -15}
    )),

    Plot.frame()
  ]
})
```


### Using inputs to make plot changes

```js
// selector for humidity or wind speed
const xOptions = [
  { label: "Humidity (%)", value: "humidity" },
  { label: "Wind Speed (km/h)", value: "wind_speed" }
];
const xAxis = view(Inputs.select(xOptions, {
  label: "Humidity/Windspeed selector",
  value: xOptions[0],
  format: d => d.label
}));
```
```js echo
//weather on polination plot
Plot.plot({
  title: "Weather’s impact on pollination",
  subtitle: "Dot size = visit count; color = weather condition; Humidity/Wind speed on hover, Use dropdown to change between Humidity and Wind speed",
  height: 400,
  grid: true,
  inset: 10,
  x: { label: xAxis.label, nice: true },
  y: { label: "Temperature (°C)" },
  color: { type: "categorical", label: "Weather Condition" },
  marks: [
    Plot.frame(),
    Plot.dot(pollinators, {
      x: d => d[xAxis.value],
      y: "temperature",
      fill: "weather_condition",
      stroke: "weather_condition",
      r: "visit_count",
      tip: true
    })
  ]
})
```


## Iterate on an example

### Frequency for nectar production

The below example is a nice chart submitted by a student to show the distribution of nectar production based on flower. The y axis is the nectar production, and the x axis is a single visit -- showing that color blocks at the top of the chart for a particular flower mean, typically, more nectar per visit. 

```js echo
Plot.plot({
  height: 500,
  marginLeft: 60,
  x: {label: "Frequency →"},
  y: {label: "Nectar Production (µg)",
      type: "band",
      // ticks: 10,
      reverse: true
  },
  color: {legend: true},
  marks: [
    Plot.barX(pollinators, {
      y: "nectar_production", 
      x: 1,
      inset: 0.5, 
      fill: "flower_species", 
      sort: "visit_count",
      tip: true,
    }),
    Plot.ruleX([0])
]
})
```

The above chart is made with `barX` mark, but could we make this a bit smoother? Maybe we can bin the values to show the same frequency within bands of nectar production:

```js echo
Plot.plot({
  height: 500,
  marginLeft: 60,
  x: {label: "Frequency →"},
  y: {label: "Nectar Production (µg)",
      type: "band", // has to be band for this bar to work
      reverse: true
  },
  color: {legend: true},
  marks: [
    Plot.barX(pollinators, 
      Plot.binY( // we can bin it for more smooth axis
        { x: "count" },
        {
          y: "nectar_production",
          thresholds: 7,  // adjust this number to control bin size
          fill: "flower_species",
          inset: 0.5,
          tip: true,
        }
      )
    ),
    Plot.ruleX([0])
]
})
```

Or, we can even keep the individual visits per bar, and add our own axis to control the chaos on the left side: 

```js echo
Plot.plot({
  height: 500,
  marginLeft: 60,
  x: {label: "Frequency →"},
  y: {label: "Nectar Production (µg)",
      type: "band",
      reverse: true
  },
  color: {legend: true},
  marks: [
    Plot.barX(pollinators, {
      y: "nectar_production", 
      x: 1,
      inset: 0.5, 
      fill: "flower_species", 
      sort: "visit_count",
      tip: true,
    }),
    Plot.axisY({
      // notice you do not have to import d3
      ticks: d3.ticks(0, 0.6, 10),  // start, end, number of ticks
      tickSize: 6,
      anchor: "left"
    }),
    Plot.ruleX([0])
]
})
```


### Nectar Production by Flower Dot plot with Dodge

Here's another example where a student created a great dot plot for nectar production per flower:


```js echo
Plot.plot({
  height: 360,
  marginLeft: 100,
  grid: true,
  marks: [
    // individual observations, arranged along y categories
    Plot.dotX(pollinators, {
      x: "nectar_production",
      y: "flower_species",
      r: 2.5,
      fill: "flower_species",
      opacity: 0.6,
      tip: true
    }),
    // median tick per flower
    Plot.tickX(
      pollinators,
      Plot.groupY(
        { x: "median" }, 
        { y: "flower_species", x: "nectar_production", stroke: "#333", strokeWidth: 2 })
    ),
    // mean dot per flower
    Plot.dotX(
      pollinators,
      Plot.groupY(
        { x: "mean"}, 
        { y: "flower_species", x: "nectar_production", r: 5, fill: "#333"})
    ),
    Plot.frame()
  ],
  x: {label: "Nectar Production (μL)"},
  y: {label: "Flower Species"},
})
```

This works pretty well as is, with opacity operating to show crowdedness, but we could make it even better by adding a little dodge behavior so each observation is visible and we can see the full swarm.

That can be done with the [`Plot.dodgeY()` transform](https://observablehq.com/plot/transforms/dodge). Initially I just added dodge, but ran into a ton of trouble with the combination of `fy` operating as a separator for the flower species, and median ticks respecting that distance. 

Here's an early iteration that shows these challenges:

```js echo
Plot.plot({
  title: "Nectar Production by Flower",
  height: 360,
  marginLeft: 100,
  grid: true,
  marks: [
    // individual observations, arranged along y categories (swarm along x)
    Plot.dotX(pollinators, 
      Plot.dodgeY("middle", {
        x: "nectar_production",
        fy: "flower_species",
        r: 2.5,
        fill: "flower_species",
        opacity: 0.6,
        tip: true
      })
    ),
      // median tick per flower
    Plot.tickX(
      pollinators,
      Plot.groupY(
        { x: "median"}, 
        { y: "flower_species", x: "nectar_production", stroke: "#333", strokeWidth: 2})
    ),
  ],
  x: {label: "Nectar Production (μL)"},
  y: {label: "Flower Species"},
  color: {legend: false}
})
```
I troubleshooted myself for a while, then turned to ai to help me ideate. After some roundabouts on how to appropriately position the median ticks when working with dodge, we settled on creating separate data that includes the medians to pass it to the marks. 

You can see the evolution of my [conversation with claude here](https://claude.ai/share/28ee7c8f-a09a-4f6e-b87d-e26255333662). 

```js echo
// Calculate medians per flower species
const medians = d3.rollup(
  pollinators,
  v => d3.median(v, d => d.nectar_production),
  d => d.flower_species
);

// Convert to array format
const medianData = Array.from(medians, ([flower_species, nectar_production]) => ({
  flower_species,
  nectar_production
}));

display(medianData)
```
```js echo
Plot.plot({
  title: "Nectar Production by Flower",
  height: 360,
  marginLeft: 100,
  grid: true,
  marks: [
    // individual observations, arranged along y categories (swarm along x)
    Plot.dotX(pollinators, Plot.dodgeY("middle", {
      x: "nectar_production",
      fy: "flower_species",
      r: 2.5,
      fill: "flower_species",
      opacity: 0.6,
      tip: true,
    })),
    // median ticks - no grouping, just plot the pre-calculated values
    Plot.tickX(medianData, {
      x: "nectar_production",
      fy: "flower_species",
      stroke: "#333",
      strokeWidth: 2,
    }),
    // median labels
    Plot.text(medianData, {
      x: "nectar_production",
      fy: "flower_species",
      text: d => `Median: ${d.nectar_production}`,
      dy: -40,  // offset to the top of the tick
      dx: 4, // offset to the right of the center position
      fontSize: 10,
      fill: "#333",
      textAnchor: "start"
    }),
  ],
  x: {label: "Nectar Production (μL)"},
  fy: {label: "Flower Species"},
  color: {legend: false}
})
```