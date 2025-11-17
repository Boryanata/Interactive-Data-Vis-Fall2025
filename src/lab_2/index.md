---
title: "Lab 2: Subway Staffing"
toc: true
theme: "cotton"
---

<!-- Import Data -->
```js
const incidents = await FileAttachment("./data/incidents.csv").csv({ typed: true })
const local_events = await FileAttachment("./data/local_events.csv").csv({ typed: true })
const upcoming_events = await FileAttachment("./data/upcoming_events.csv").csv({ typed: true })
const ridership = await FileAttachment("./data/ridership.csv").csv({ typed: true })
// display(ridership[0])
// display(local_events[0])
// display(incidents[0])
// display(upcoming_events[0])
```
# LAB 2: SUBWAY STAFFING

<br><br>

<!-- # Preview of Data -->

```js
// Inputs.table(incidents)
// Inputs.table(local_events)
// Inputs.table(upcoming_events)
// Inputs.table(ridership)
``` 



```js
const currentStaffing = {
  "Times Sq-42 St": 19,
  "Grand Central-42 St": 18,
  "34 St-Penn Station": 15,
  "14 St-Union Sq": 4,
  "Fulton St": 17,
  "42 St-Port Authority": 14,
  "Herald Sq-34 St": 15,
  "Canal St": 4,
  "59 St-Columbus Circle": 6,
  "125 St": 7,
  "96 St": 19,
  "86 St": 19,
  "72 St": 10,
  "66 St-Lincoln Center": 15,
  "50 St": 20,
  "28 St": 13,
  "23 St": 8,
  "Christopher St": 15,
  "Houston St": 18,
  "Spring St": 12,
  "Chambers St": 18,
  "Wall St": 9,
  "Bowling Green": 6,
  "West 4 St-Wash Sq": 4,
  "Astor Pl": 7
}
```
# Overview of Data  
<br>

<details>
  <summary><h2 style="display:inline">Incidents Dataset</h2></summary>
  <br>

The Incidents Dataset is a simulated operational dataset created for the purposes of this analysis. It includes 10 years of incident records across Manhattan subway stations. Each incident includes:
<ul>
  <li>station where it occurred</li>
  <li>staffing level at the time</li>
  <li>response time in minutes</li>
  <li>categorical severity rating: low, medium, or high</li>
</ul>

The <i>severity</i> variable reflects the operational impact of each event:

<b>Severity: Low</b><br>
Minor issues that cause little to no service disruption.
Examples:
<ul>
  <li>Minor customer complaint</li>
  <li>Small cleaning or maintenance issue</li>
  <li>A brief equipment reset</li>
</ul>

<b>Severity: Medium</b><br>
Events that require coordination and slow down operations but don’t stop service.
Examples:
<ul>
  <li>Train dispatching issue</li>
  <li>Door malfunction</li>
  <li>Medical response affecting platform operations</li>
</ul>

<b>Severity: High</b><br>
Major incidents that likely affect service or require emergency response.
Examples:
<ul>
  <li>Track intrusion</li>
  <li>Severe medical emergency</li>
  <li>Equipment failure blocking tracks</li>
  <li>Power or signal failure</li>
</ul>

</details>


---

<details>
  <summary><h2 style="display:inline">Local Events Dataset</h2></summary>
  <br>

The Local Events Dataset is a simulated record of public events created for this analysis. It contains records of public events happening in Manhattan during Summer 2025, each paired with the nearest subway station.

Each event includes:
<ul>
  <li>date it occurred</li>
  <li>event name or type</li>
  <li>closest subway station</li>
  <li>estimated attendance</li>
</ul>

</details>

---

<details>
  <summary><h2 style="display:inline">Upcoming Events Dataset</h2></summary>
  <br>

The Upcoming Events Dataset is a simulated projection of public events planned for Summer 2026. It supports staffing forecasts by identifying event-driven demand.

Each planned event includes:
<ul>
  <li>date it is scheduled</li>
  <li>event name or type</li>
  <li>nearest subway station</li>
  <li>expected attendance</li>
</ul>

The <b>expected_attendance</b> variable reflects anticipated crowd size and helps estimate which stations may see increased demand.

</details>

---

<details>
  <summary><h2 style="display:inline">Ridership Dataset</h2></summary>
  <br>

The ridership dataset is a simulated record of daily subway usage for Summer 2025. It captures passenger activity across Manhattan stations.

Each record includes:
<ul>
  <li>date of the ridership count</li>
  <li>station where activity occurred</li>
  <li>number of station entrances</li>
  <li>number of station exits</li>
</ul>

The <i>entrances</i> and <i>exits</i> variables represent overall station traffic and help evaluate how events, fare changes, and operational conditions shape daily demand.

</details>

<br><br>

## 1.Ridership & Local Events — Summer 2025
<br>

<details>
  <summary><b>What this analysis shows</b></summary>
  <p>
    This analysis examines <b>daily systemwide subway ridership</b> during Summer 2025, highlighting two major influences on ridership levels:
    <br><br>
    • <b>Local events</b>, which create distinct ridership spikes at specific dates.<br>
    • The <b>July 15 fare increase</b>, which may affect overall ridership levels before and after the change.
    <br><br>
    By combining daily ridership totals with event attendance estimates and marking the fare-increase date, the visualization helps identify short-term surges, longer-term trends, and the possible behavioral impact of fare adjustments.
  </p>
</details>


```js
// =========================
// Q1 DATA PREPARATION 

const SUMMER_START = new Date("2025-06-01");
const SUMMER_END   = new Date("2025-09-01"); // exclusive

// Clean + filter RIDERSHIP for Summer 2025
const ridershipClean = ridership
  .map(r => ({ ...r, date: new Date(r.date) }))
  .filter(r => r.date >= SUMMER_START && r.date < SUMMER_END);

// Clean + filter LOCAL EVENTS for Summer 2025
const localEvents = local_events
  .map(e => ({ ...e, date: new Date(e.date) }))
  .filter(e => e.date >= SUMMER_START && e.date < SUMMER_END);

// console.log(localEvents[0], Object.keys(localEvents[0]));

// Clean INCIDENTS
const incidentsClean = incidents.map(i => ({ 
  ...i, 
  date: new Date(i.date) 
}));

// STEP 1 — Compute total ridership per row

const ridershipWithTotal = ridershipClean.map(d => ({
  ...d,
  total: d.entrances + d.exits
}));

// STEP 2 — Deduplicate station+date

const stationDayMap = new Map();

ridershipWithTotal.forEach(d => {
  const key = `${d.station}_${d.date.toDateString()}`;
  if (!stationDayMap.has(key)) {
    stationDayMap.set(key, { station: d.station, date: d.date, total: 0 });
  }
  stationDayMap.get(key).total += d.total;
});

// STEP 3 — Aggregate systemwide daily ridership

const dailyRidershipMap = new Map();

stationDayMap.forEach(d => {
  const dateKey = d.date.toDateString();
  if (!dailyRidershipMap.has(dateKey)) {
    dailyRidershipMap.set(dateKey, { date: d.date, total: 0 });
  }
  dailyRidershipMap.get(dateKey).total += d.total;
});

const dailyRidership = Array.from(dailyRidershipMap.values())
  .sort((a, b) => a.date - b.date);

const maxRidership = Math.max(...dailyRidership.map(d => d.total));

// STEP 4 — Match local events to ridership days

const eventsByDate = localEvents.map(ev => {
  const match = dailyRidershipMap.get(ev.date.toDateString());
  return {
    date: ev.date,
    attendance: ev.estimated_attendance,
    event_name: ev.event_name,
    ridership: match ? match.total : null
  };
});

// STEP 5 — Fare increase lookup

const fareIncrease = new Date("2025-07-15");
const fareKey = fareIncrease.toDateString();

const fareMatch = dailyRidershipMap.get(fareKey);
const fareIncreaseRidership = fareMatch ? fareMatch.total : null;
```

```js
// Full-period comparison pre/post fare increase

// PRE: all days strictly before July 15
const fullPre = dailyRidership.filter(d => d.date < fareIncrease);

// POST: all days on or after July 15
// (limit to end of dataset)
const fullPost = dailyRidership.filter(d => d.date >= fareIncrease);

// Means
const fullPreAvg  = d3.mean(fullPre, d => d.total);
const fullPostAvg = d3.mean(fullPost, d => d.total);

// Percent change
const fullDropPct = ((fullPostAvg - fullPreAvg) / fullPreAvg) * 100;
```

```js
Plot.plot({
  width: 900,
  height: 430,
  marginLeft: 65,
  marginRight: 25,
  marginTop: 50,
  marginBottom: 50,
  style: { overflow: "visible" },
  title: "How Local Events and the July 15 Fare Increase Affected Ridership",
  subtitle: "Daily systemwide ridership with event spikes and fare increase marker",

  x: {
    type: "time",
    label: "Date",
    tickFormat: "%b %d",
  },
  y: {
    label: "Total Daily Ridership",
     domain: [520000, maxRidership] 
  },

  marks: [

    // LAYER 1 — Ridership baseline

    // Area shading
    Plot.areaY(dailyRidership, {
      x: "date",
      y: "total",
      y1: 520000,
      fill: "steelblue",
      fillOpacity: 0.25,
      // tip: true
    }),

    // Ridership line 
    Plot.line(dailyRidership, {
      x: "date",
      y: "total",
      stroke: "steelblue",
      strokeWidth: 2,
      // tip: d => `Date: ${d.date.toLocaleDateString()}\nRidership: ${d.total.toLocaleString()}`
    }),

    // Pre-period average line
    Plot.ruleY(
  [{ y: fullPreAvg }],
  {
    y: "y",
    stroke: "#1e88e5",
    strokeWidth: 1.5,
    strokeDasharray: "5,5",
    opacity: 0.6,
    // tip: d => `Pre-fare average ridership:\n${d.y.toLocaleString()}`
  }
),

    // Post-period average line
    Plot.ruleY([fullPostAvg], {
      stroke: "#d32f2f",
      strokeWidth: 1.5,
      strokeDasharray: "5,5",
      opacity: 0.6
    }),

   // Label for PRE average
Plot.text(
  [{ x: dailyRidership[dailyRidership.length - 1].date, 
     y: fullPreAvg, 
     text: "Pre-increase avg ridership" }],
  {
    x: d => d.x,
    y: d => d.y,
    text: d => d.text,
    fill: "#1e88e5",
    fontSize: 12,
    textAnchor: "start",
    dx: 6,
    dy: -4
  }
),

// Label for POST average
Plot.text(
  [{ x: dailyRidership[dailyRidership.length - 1].date, 
     y: fullPostAvg, 
     text: "Post-increase avg ridership" }],
  {
    x: d => d.x,
    y: d => d.y,
    text: d => d.text,
    fill: "#d32f2f",
    fontSize: 12,
    textAnchor: "start",
    dx: 6,
    dy: -4
  }
),
    // LAYER 2 — Events (spikes)
    Plot.dot(eventsByDate, {
      x: "date",
      y: "ridership",
      r: d => Math.sqrt(d.attendance) / 5,
      fill: "#e91e63",
      stroke: "white",
      strokeWidth: 1.2,
      opacity: 0.9,
      tip: { format: () => "" },
        channels: {
          Date: d => d.date.toLocaleDateString(),
          // Ridership: d => d.ridership?.toLocaleString() ?? "N/A", 
          //I can't get rid of that pesky r in my tooltip!!! 
          Event: "event_name"
     } 
      // tip: d => [
      //   `Event: ${d.event_name}`,
      //   `Date: ${d.date.toLocaleDateString()}`,
      //   `Attendance: ${d.attendance.toLocaleString()}`,
      //   d.ridership
      //     ? `Ridership: ${d.ridership.toLocaleString()}`
      //     : `Ridership: (no data)`
      // ].join("\n")
    }),

    // LAYER 3 — Fare increase on July 15
    Plot.ruleX([fareIncrease], {
      stroke: "#d32f2f",
      strokeWidth: 2.2,
      strokeDasharray: "6,0.5",
      opacity: 0.9,
      tip: () => "Fare increased from $2.75 → $3.00"
    }),

    // Label for fare increase
    Plot.text(
      [{ x: fareIncrease, y: maxRidership * 1.02, text: "Fare Increase" }],
      {
        x: d => d.x,
        y: d => d.y,
        text: d => d.text,
        fill: "#d32f2f",
        fontSize: 14,
        textAnchor: "start",
        dy: -5
      }
    ),
  ]
})
```

  <div style="
    padding: 14px 18px;
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    width: fit-content;
    margin: 14px 0;
    font-size: 15px;
    line-height: 1.4;
  ">
    <strong>Fare Increase Impact</strong><br>
    Average ridership (before July 15): 
      <strong>${fullPreAvg.toLocaleString()}</strong><br>
    Average ridership (after July 15): 
      <strong>${fullPostAvg.toLocaleString()}</strong><br>
    Change: 
      <strong style="color:${fullDropPct < 0 ? '#c62828' : '#2e7d32'}">
        ${fullDropPct.toFixed(1)}%
      </strong>
  </div>

  <br>

  <details>
  <summary><b>Key findings</b></summary>
  <ul>
    <li>
      Several <b>local events</b> produce clear, sharp ridership spikes—especially high-attendance events such as concerts, festivals, and parades.
    </li>
    <li>
      The <b>fare increase on July 15</b> coincides with a noticeable shift: 
      the post-increase average ridership is <b>lower</b> than the pre-increase average.
    </li>
    <li>
      Despite day-to-day variation, ridership shows a fairly steady pattern with event-driven deviations rather than long-term declines.
    </li>
    <li>
      The visualization makes it easy to compare <b>typical daily ridership</b> against <b>event-influenced highs</b> and <b>post-fare-change levels</b>.
    </li>
    <li>
      The combination of area shading, event markers, and pre/post average lines provides a clear picture of both
      <b>short-term disruptions</b> and <b>structural changes</b> in demand.
    </li>
  </ul>
</details>
<br><br>

  ## 2.Response Times Across Manhattan Subway Stations
  <br>
  <details>
  <summary><b>What this analysis shows</b></summary>
  <p>
    Using 10 years of historical incident data, we compare the <b>average response time</b> across stations.  
    Stations with lower average response times are considered operationally “better,” while those with higher averages may need additional staffing or resources.
  </p>
</details>

```js
// --- Q2 DATA PREP: Response Time by Station ---

  // 1. Extract unique stations
  const stations = Array.from(new Set(incidents.map(d => d.station)));

  // 2. Compute summary stats per station
  const responseStats = stations.map(st => {
  const rows = incidents.filter(d => d.station === st);
  const times = rows.map(r => r.response_time_minutes);

  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  // const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
  const sorted = times.filter(Number.isFinite).slice().sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  const count = times.length;

  return {
    station: st,
    mean,
    median,
    count
  };
});

// 3. Sort stations by average response time (ascending = best first)
responseStats.sort((a, b) => a.mean - b.mean);

// 4. Compute thresholds for color scale
const overallMean = responseStats.reduce((a, b) => a + b.mean, 0) / responseStats.length;

const slowThreshold = overallMean + 2;   // slower than most
const fastThreshold = overallMean - 2;   // faster than most

// 5. Assign a color category
responseStats.forEach(d => {
  if (d.mean <= fastThreshold) d.category = "Fast";
  else if (d.mean >= slowThreshold) d.category = "Slow";
  else d.category = "Average";
});
```

```js
Plot.plot({
  width: 900,
  marginLeft: 140,
  marginRight: 40,
  marginBottom: 50,
  title: "Station Response Times (2015–2025)",
  subtitle: "Average response time per station, color-coded by performance",

  x: {
    label: "Mean Response Time (minutes)",
    grid: true
  },

  color: {
  domain: ["Fast", "Average", "Slow"],
  scheme: "Set3",
  legend: true
  },

  marks: [

    Plot.barX(responseStats, {
      x: "mean",
      y: "station",
      fill: "category",
      sort: { y: "x" },
      tip: d =>
        `Station: ${d.station}\n` +
        `Mean response: ${d.mean.toFixed(1)} min\n` +
        `Median response: ${d.median.toFixed(1)} min\n` +
        `Incidents: ${d.count}` //Incidents not appearing in my tooltip...
    }),

// System-wide average vertical line
Plot.ruleX([overallMean], {
  stroke: "#424242",
  strokeDasharray: "4,4",
  strokeWidth: 1.5,
  tip: () => `System average: ${overallMean.toFixed(1)} min`
}),

// Annotation label (Q1-style)
Plot.text(
  [{
    x: overallMean,
    y: responseStats[0].station,   // top station
    text: `System Avg (${overallMean.toFixed(1)} min)`
  }],
  {
    x: d => d.x,
    y: d => d.y,
    text: d => d.text,
    fill: "#424242",
    fontSize: 12,
    textAnchor: "start",
    dx: 8,    // move slightly right of the line
    dy: -6    // move above the bar height
  }
)
  ]
})
```

<details>
  <summary><b>Key findings</b></summary>
  <ul>
    <li><b>Fastest stations</b> are shown in green — consistently low response times.</li>
    <li><b>Average stations</b>, shown in yellow, cluster around the system average line.</li>
    <li><b>Slowest stations</b>, shown in lavander, may need additional staffing or operational support.</li>
  </ul>
</details>

<br><br>

## 3.Staffing Burden
<br>
<details>
  <summary><b>What this analysis shows</b></summary>
  <p>
    This heatmap visualizes how much <b>expected event attendance</b> each station must accommodate on each day of Summer 2026.  
    Stations with frequent large events accumulate higher “burden” levels.  
    The visualization helps identify where staffing levels may be misaligned with anticipated event-driven surges.
  </p>
</details>
<br>

```js
// version 4 data-prep for heatmap
// ---- Q3 DATA PREP with Event Names ----

// 1. Parse dates
const events2026 = upcoming_events.map(d => ({
  ...d,
  date: new Date(d.date)
}));

// 2. Unique stations
const stationsQ3 = Array.from(
  new Set(events2026.map(d => d.nearby_station))
).sort();

// 3. Unique dates
const datesQ3 = Array.from(
  new Set(events2026.map(d => d.date.toISOString().slice(0, 10)))
).sort();

// 4. Aggregate attendance + event names consistently
const rawCells = d3.rollups(
  events2026,
  v => ({
    totalAttendance: d3.sum(v, d => d.expected_attendance),
    events: v.map(d => d.event_name)   // <-- unified and correct
  }),
  d => d.nearby_station,
  d => d.date.toISOString().slice(0, 10)
).flatMap(([station, rows]) =>
  rows.map(([date, info]) => ({
    station,
    date,
    value: info.totalAttendance,
    events: info.events            // <-- unified
  }))
);

// 5. PAD missing station×date combinations
const burdenByDate = [];

stationsQ3.forEach(st => {
  datesQ3.forEach(dt => {
    const found = rawCells.find(c => c.station === st && c.date === dt);

    burdenByDate.push({
      station: st,
      date: dt,
      value: found ? found.value : 0,
      events: found ? found.events : []   // <-- unified
    });
  });
})
```


```js
//version 4 - this section was truly a nighmare... hope I got it right in the end
Plot.plot({
  width: 950,
  height: 26 * stationsQ3.length,
  marginLeft: 160,
  marginRight: 40,
  marginBottom: 130,

  title: "Projected Event Attendance and Burden by Station (Summer 2026)",
  subtitle: "Total expected attendance per day per station",

  x: {
    type: "band",
    domain: datesQ3,
    tickRotate: -40,
    ticks: datesQ3.filter((d, i) => i % 2 === 0),
    label: "Date"
  },

  y: {
    domain: stationsQ3
  },

  color: {
    scheme: "YlOrRd",
    type: "linear",
    domain: [0, d3.max(burdenByDate, d => d.value)],
    label: "Expected Attendance",
    legend: true
  },

  marks: [

    Plot.cell(burdenByDate, {
      x: "date",
      y: "station",
      fill: "value",
      inset: 0.2,

      // ——— TOOLTIP ——— could not remove the value section from the tooltip without changing the tooltip formatting so there's repetition --. expected attendance and value
      tip: d => {
        const eventList =
          d.events && d.events.length > 0
            ? `Events:\n- ${d.events.join("\n- ")}`
            : "No events";

        return `Station: ${d.station}
Date: ${d.date}
Attendance: ${d.value.toLocaleString()}

${eventList}`;
      },

      // ——— IMPORTANT: FORCE TOOLTIP ON ZERO VALUES ———
      channels: {
        events: "events",     // makes events available
        value: "value"
      }
    })
  ]
})
```

<details>
  <summary><b>Key findings</b></summary>
  <ul>
    <li><b>Burden is highly uneven</b>: a small number of stations face many large events, while others see very little event-driven traffic.</li>
    <li><b>Canal St, Chambers St, and 34 St–Penn Station</b> appear among the most consistently burdened stations, with multiple high-attendance event days.</li>
    <li>Large spikes (in dark red) indicate <b>days with 10,000–15,000+ expected attendees</b>—likely requiring increased staffing.</li>
    <li>The heatmap reveals <b>temporal clustering</b>: certain weeks experience multiple events at different stations, creating simultaneous staffing demands.</li>
    <li>Stations with <b>many low-attendance days</b> (light yellow) may not require staffing changes.</li>
  </ul>
</details>
<br>

# Conclusion  


Overall, the analysis shows that subway demand in Manhattan is shaped by a mix of predictable daily patterns, operational performance differences across stations, and concentrated event-driven surges. Some stations consistently handle incidents more efficiently, while others experience slower response times that may indicate structural or staffing-related challenges. The upcoming 2026 event calendar further reveals that a small group of stations will face disproportionately high attendance on multiple days, creating clear pressure points for the system.

Together, these findings suggest that staffing decisions will be most effective when they are targeted—prioritizing stations with both historically slower operational performance and heavier projected event loads. Aligning staff resources with these patterns can help keep service reliable during periods of elevated demand while avoiding unnecessary allocation in stations with lighter activity.


