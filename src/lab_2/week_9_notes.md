---
title: "Week 9 Overview"
toc: true
---

# Framework / Markdown Tips

Its worth remarking that you may experience issues in which a plot just doesn't appear when including both constants and a plot in the same block. Take the following code, which filters penguins to find the "selected species" defined in the same block:

```js echo
const selectedSpecies = "Adelie"
Plot.plot({
  marginLeft: 80,
  marks: [
    Plot.frame(),
    Plot.barX(penguins.filter(d => d.species === selectedSpecies), Plot.groupY(
      { x: "count" },
      { y: "island", x: "count" }
    ))
  ]
})
```

Although I'm not getting any errors, the code isn't running. That is because of the way Observable Framework reactivity and javascript cells work.


Typically, we rely on the implicity display in our code blocks, and our plots (when alone) just run. But, when you have multiple statements in a code block, or when you use a semicolon, Framework treats it as a program block rather than an expression block, which means [implicit display doesn't apply](https://observablehq.com/framework/javascript#:~:text=A%20program%20block%20doesn%E2%80%99t%20display%20anything%20by%20default%2C%20but%20you%20can%20call%20display%20to%20display%20something.).

You can fix this by separating them into two blocks, or adding a display funciton:

```js echo
const selectedSpecies = "Adelie";
display(Plot.plot({
  marginLeft: 80,
  marks: [
    Plot.frame(),
    Plot.barX(penguins.filter(d => d.species === selectedSpecies), Plot.groupY(
      { x: "count" },
      { y: "island", x: "count" }
    ))
  ]
}))
```


# Lab 2 Concepts

1. See [State Management](./week_8_notes#state-management) from week 8 notes
2. See [Annotation](./week_8_notes#annotation) from week 8 notes 
3. See [Data Joins](./week_8_notes#data-joins) from week 8 notes 
4. See [Color Scales](./week_8_notes#color-scales) from week 8 notes


## Expanding on Data Joins

Let's explore another way to data join as we did in week 8 notes. What if we want to create _new_ metrics when joining? Like a ratio?

Let's take two new files on tv viewership and production cost.
1. `viewership.csv`: viewership data since launch date
2. `production_cost.csv`: production cost per episode and total

```js
const viewership = FileAttachment('./viewership_data/viewership.csv').csv({ typed: true })
const cost = FileAttachment('./viewership_data/production_cost.csv').csv({ typed: true })
```

Just exploring the data in its existing form, we could make two bar charts -- one for viewership and one for cost. 

```js
Plot.plot({
  title: "Average weekly viewers",
  width,
  height: 150, 
  marks: [
    Plot.barY(viewership, {
      x: "show_name",
      y: "avg_weekly_viewers"
    })
  ]
})
```

```js
Plot.plot({
  title: "Cost per episode",
  width,
  height: 150, 
  marks: [
    Plot.barY(cost, {
      x: "show_name",
      y: "cost_per_episode_usd"
    })
  ]
})
```

In this case, let's say we want to visualize the total **value** of each show. We could consider total viewers as value, but we should consider the cost of the show as well. Let's make a new metric of _views per dollar spent_ for each show.

### Join via new dataset

The first way to make this chart would be to build a new array of data that we could visualize that would include this metric that we are looking for. This is something that we could use AI to help us generate. 


> _I am using Observable Plot to render charts in an Observable Framework dashoard. I need help creating a javascript function that can return a new dataset that can then be passed to the Plot function. I need a new dataset that includes each show and the (total) views per (total) dollars of each show._

> _The production data looks like this:_
```
show_name,cost_per_episode_usd,number_of_episodes,total_production_cost_usd
Stranger Things,12000000,42,504000000
The Crown,13000000,60,780000000
Wednesday,8500000,8,68000000
...
```

> _The viewership data looks like this:_
```
show_name,avg_weekly_viewers,launch_date,weeks_since_launch,total_estimated_viewership
Stranger Things,15200000,2016-07-15,486,7387200000
The Crown,9800000,2016-11-04,470,4606000000
Wednesday,18500000,2022-11-23,154,2849000000
...
```

> _Help me use javascript functions to turn this into one object with the show name and views per dollar._

I tried this, and the answer I got back was: 

```js echo
function calculateViewsPerDollar(productionData, viewershipData, sortDescending = true) {
  // Create a map of viewership data for quick lookup
  const viewershipMap = new Map(
    viewershipData.map(show => [show.show_name, show])
  );
  
  // Merge datasets and calculate views per dollar
  const result = productionData
    .map(show => {
      const viewership = viewershipMap.get(show.show_name);
      
      // Skip if no matching viewership data
      if (!viewership) return null;
      
      const totalCost = show.total_production_cost_usd;
      const totalViews = viewership.total_estimated_viewership;
      const viewsPerDollar = totalViews / totalCost;
      
      return {
        show_name: show.show_name,
        total_production_cost_usd: totalCost,
        total_estimated_viewership: totalViews,
        views_per_dollar: viewsPerDollar
      };
    })
    .filter(show => show !== null)
    .sort((a, b) => sortDescending ? 
      b.views_per_dollar - a.views_per_dollar : 
      a.views_per_dollar - b.views_per_dollar
    );
  
  return result;
}
const mergedData = calculateViewsPerDollar(cost, viewership);
```

The answer included plot code, which we can try out as well: 

```js
Plot.plot({
  marks: [
    Plot.barY(mergedData, {
      x: "show_name",
      y: "views_per_dollar"
    })
  ]
})
```

### Join in the channel function

Instead of making a new dataset for this example, we could also just join the datasets within the channel function and calculate the metric we are looking for on the fly. In the below example, we find the shows cost data while in the viewership data, and calculate viewership / cost when determining the y value:

```js echo
Plot.plot({
  marginLeft: 150,
   color: {
    scheme: "YlOrRd",
    legend: true,
    label: "Viewership",
  },
  x: {
    label: "Views per Dollar"
  },
  marks: [
    Plot.barX(viewership, {
      y: "show_name", 
      x: show => {
        // find the cost row 
        const thisCost = cost.find(costRow => costRow.show_name === show.show_name)
        // calculate the metric
        return show["total_estimated_viewership"] / thisCost["total_production_cost_usd"] 
      },
      fill: "total_estimated_viewership",
      sort: { y: "-x" }
    })
  ]
})
```