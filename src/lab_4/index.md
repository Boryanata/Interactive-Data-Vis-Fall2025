---
title: "Lab 4: Clearwater Crisis"
theme: [light, alt, wide]
toc: false
---

<!-- Import Data -->
```js
const surveys = await FileAttachment("data/fish_surveys.csv").csv({ typed: true });
const monitoring = await FileAttachment("data/monitoring_stations.csv").csv({ typed: true });
const activities = await FileAttachment("data/suspect_activities.csv").csv({ typed: true });
const water = await FileAttachment("data/water_quality.csv").csv({ typed: true });
```

```js
// Inputs.table(surveys)
// Inputs.table(monitoring)
// Inputs.table(activities)
//  Inputs.table(water)
```

```js
// display(surveys.slice(0,20))
// display(monitoring.slice(0,20))
// display(activities.slice(0,20))
// display(water.slice(0,20))
```

<br>


# Lake Clearwater in Crisis

Lake Clearwater was once a thriving recreational lake, supporting diverse fish populations and clear waters. Over the past two years, however, fish populations have declined sharply—particularly among sensitive species like trout—while water quality has deteriorated in parts of the lake. This dashboard investigates whether these biological declines align spatially and temporally with changes in water quality, and whether those patterns point toward any of the four known actors operating around the lake.


<br>

## 1. Fish In Trouble

Fish populations at Lake Clearwater have declined over the past two years, but not all species appear to be affected in the same way. To understand whether the collapse reflects a uniform lake-wide disturbance or something more selective, it is useful to compare trends across species with different ecological sensitivities.

The chart below shows fish survey counts over time for trout, bass, and carp, aggregated across all monitoring stations.

<br>

```js
// =========================
// Q1.1 DATA PREPARATION: Stacked / multiples chart

// 1. Make sure dates are Date objects
const surveysClean = surveys.map(d => ({
  ...d,
  date: new Date(d.date)
}));

// 2. Roll up counts by date (using the exact timestamp) and species
const fishByDateSpecies = [];

const grouped = d3.rollups(
  surveysClean,
  v => d3.sum(v, d => d.count),
  d => d.date.getTime(),   // 🔑 group by exact timestamp, not toDateString()
  d => d.species           // Trout, Bass, Carp
);

for (const [time, speciesArr] of grouped) {
  const date = new Date(Number(time));   // reconstruct date from timestamp
  for (const [species, count] of speciesArr) {
    fishByDateSpecies.push({ date, species, count });
  }
}

// 3. Unique survey dates (one per quarterly survey) — same timestamp logic
const surveyDates = Array.from(
  new Set(surveysClean.map(d => d.date.getTime()))
)
  .sort((a, b) => a - b)
  .map(t => new Date(t));

// 4. Species colors
const speciesColors = {
  Trout: "#A2C8E2",
  Bass:  "#F6C6B8",
  Carp:  "#F9E79F"
};
```


```js
Plot.plot({
  width: 900,
  height: 260,
  marginLeft: 60,
  marginRight: 20,
  marginTop: 60,
  marginBottom: 45,
  style: { overflow: "visible" },

  title: "Fish Survey Counts Over Time by Species",
  subtitle: "Counts for all stations combined",

  facet: {
    data: fishByDateSpecies,
    x: "species",   // 🔑 one column per species
    marginX: 20
  },

  x: {
    type: "time",
    label: "Survey date",
     ticks: d3.utcMonth.every(4),

  // 🔧 Two-line labels (Month on top, Year below)
  tickFormat: d => d3.timeFormat("%b")(d) + "\n" + d3.timeFormat("%Y")(d),

  tickRotate: 0    // keep at 0 so the two lines stack cleanly
  },

  y: {
    label: "↑ Fish caught per survey",
    grid: true
  },

  color: {
    domain: Object.keys(speciesColors),
    range: Object.values(speciesColors),
    legend: false
  },

  marks: [
    // Area per species in its own panel
    Plot.areaY(fishByDateSpecies, {
      x: "date",
      y: "count",
      fill: "species",
      fillOpacity: 0.5,
      tip: {
        channels: {
          Date: d => d.date.toLocaleDateString(),
          "Fish caught": d => d.count
        },
        format: { x: false, y: false, fill: false }
      }
    }),

    // Line on top for clarity
    Plot.lineY(fishByDateSpecies, {
      x: "date",
      y: "count",
      stroke: "species",
      strokeWidth: 1.5
    }),

    Plot.ruleY([0])
  ]
})
```

```js
html`<div style="background:white;border:1px solid #e0e0e0;border-radius:12px;padding:16px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin:20px 0">
  <div style="font-weight:700;margin-bottom:8px;font-size:1.05em;color:#333">Takeaway</div>
  <div style="color:#555;line-height:1.6">
    The species-level trends reveal clear differences in both the magnitude and pattern of decline. Trout populations fall steadily across the observation period, while bass show more moderate declines and carp remain comparatively stable.
    <br><br>
    This divergence is notable because trout are generally more sensitive to environmental stressors—particularly water quality changes—whereas carp are more tolerant of degraded conditions. The fact that declines are not uniform across species suggests that the collapse is unlikely to be driven by a simple, lake-wide disturbance such as overfishing alone. 
    <br><br>
    Instead, the patterns are consistent with a stressor that disproportionately affects sensitive species, pointing toward environmental degradation as a likely contributing factor. This raises the question of whether those impacts are concentrated in particular areas of the lake.
  </div>
</div>`
```

<br><br>

## 2. Are Declines Spatially Concentrated?
The species-level declines observed above raise an additional question: whether fish population losses are evenly distributed around Lake Clearwater or concentrated in specific locations. To explore this, fish population changes are examined by monitoring station, allowing for direct comparison of spatial patterns across species.

The chart below shows the percent decline in fish populations from 2023 to 2024 by station and species.

```js
// =========================
// Q1.2 DATA PREP: Percent decline by station & species (radar)  RELATIVE DECLINE
// =========================

// 1. Prepare surveys with year
const surveysDecline = surveys
  .map(d => ({
    ...d,
    date: new Date(d.date),
    year: new Date(d.date).getFullYear()
  }))
  .filter(d => d.year === 2023 || d.year === 2024);

// 2. Average count per (station, species, year)
const avgByStationSpeciesYear = d3.rollups(
  surveysDecline,
  v => d3.mean(v, d => d.count),
  d => d.station_id,   // North, East, South, West
  d => d.species,      // Trout, Bass, Carp
  d => d.year          // 2023 / 2024
);

// 3. Flatten + compute percent decline
const declineByStationSpecies = [];

for (const [station, speciesGroups] of avgByStationSpeciesYear) {
  for (const [species, yearArr] of speciesGroups) {
    const yearMap = new Map(yearArr);

    const avg2023 = yearMap.get(2023);
    const avg2024 = yearMap.get(2024);

    if (avg2023 == null || avg2024 == null || avg2023 === 0) continue;

    const declinePct = (avg2024 - avg2023) / avg2023;

    // absolute percent decline only (improvements → 0)
    const declineMagnitude = Math.max(0, -declinePct);

    declineByStationSpecies.push({
      station,
      species,
      avg2023,
      avg2024,
      declinePct,        // signed, for tooltip
      declineMagnitude  // absolute decline fraction (0–∞)
    });
  }
}

// 4. Station order (cardinal)
const stationOrder = ["North", "East", "South", "West"];

// 5. Radar scale: 0–50% decline
const MAX_DECLINE = 0.5;

// Clamp declines to the radar max
const points = declineByStationSpecies.map(d => ({
  name: d.species,
  key: d.station,
  value: Math.min(d.declineMagnitude, MAX_DECLINE),
  avg2023: d.avg2023,
  avg2024: d.avg2024,
  declinePct: d.declinePct
}));

// 6. Cardinal angles (degrees)
const stationAngle = new Map([
  ["North", 0],
  ["East", 90],
  ["South", 180],
  ["West", 270]
]);

const longitude = d => stationAngle.get(d);

```

```js
html`<div style="display:flex;gap:20px;align-items:stretch;margin-top:40px;margin-bottom:20px">
  <div style="background:white;border:1px solid #e0e0e0;border-radius:12px;padding:16px;box-shadow:0 2px 4px rgba(0,0,0,0.1);width:620px;display:flex;justify-content:center">
    ${Plot.plot({
      width: 500,
      height: 500,

      projection: {
        type: "azimuthal-equidistant",
        rotate: [0, -90],
        domain: d3.geoCircle().center([0, 90]).radius(MAX_DECLINE + 0.12)()
      },

      title: "Fish Population Decline by Station and Species",
      subtitle: "Percent decline from 2023 to 2024 (absolute scale)",

      color: {
        domain: Object.keys(speciesColors),
        range: Object.values(speciesColors),
        legend: true,
        label: "Species"
      },

      marks: [
        // Reference rings (percent decline)
        Plot.geo([0.1, 0.2, 0.3, 0.4, 0.5], {
          geometry: r => d3.geoCircle().center([0, 90]).radius(r)(),
          stroke: "black",
          fill: "black",
          strokeOpacity: 0.3,
          fillOpacity: 0.03,
          strokeWidth: 0.5
        }),

        // Station spokes
        Plot.link(stationOrder, {
          x1: d => longitude(d),
          y1: 90 - MAX_DECLINE,
          x2: 0,
          y2: 90,
          stroke: "white",
          strokeOpacity: 0.5,
          strokeWidth: 2.5
        }),

        // Ring labels
        Plot.text([0.1, 0.3, 0.5], {
          x: 180,
          y: d => 90 - d,
          dx: 2,
          textAnchor: "start",
          text: d => `${Math.round(d * 100)}% decline`,
          fill: "currentColor",
          stroke: "white",
          fontSize: 8
        }),

        // Station labels
        Plot.text(stationOrder, {
          x: d => longitude(d),
          y: 90 - (MAX_DECLINE + 0.03),
          text: Plot.identity,
          lineWidth: 5
        }),

        // Radar polygons
        Plot.area(points, {
          x1: d => longitude(d.key),
          y1: d => 90 - d.value,
          x2: 0,
          y2: 90,
          fill: "name",
          stroke: "name",
          curve: "cardinal-closed"
        }),

        // Points
        Plot.dot(points, {
          x: d => longitude(d.key),
          y: d => 90 - d.value,
          fill: "name",
          stroke: "white"
        }),

        // Hover labels (absolute values)
        Plot.text(
          points,
          Plot.pointer({
            x: d => longitude(d.key),
            y: d => 90 - d.value,
            text: d =>
              `${d.name} @ ${d.key}\n` +
              `Avg 2023: ${d.avg2023.toFixed(1)}\n` +
              `Avg 2024: ${d.avg2024.toFixed(1)}\n` +
              `Decline: ${(Math.max(0, -d.declinePct) * 100).toFixed(1)}%`,
            textAnchor: "start",
            dx: 4,
            fill: "currentColor",
            stroke: "white",
            maxRadius: 10
          })
        )
      ]
    })}
  </div>
  <div style="background:white;border:1px solid #e0e0e0;border-radius:12px;padding:16px;box-shadow:0 2px 4px rgba(0,0,0,0.1);flex:1;max-width:620px">
    <div style="font-weight:700;margin-bottom:16px;font-size:1.05em;color:#333">Takeaway</div>
    <div style="color:#555;line-height:1.6">
      When fish population changes are disaggregated by station, the declines appear spatially concentrated rather than evenly distributed around the lake. The western station stands out clearly, with trout populations declining by roughly 40–45% between 2023 and 2024. Bass and carp at the west station also show declines, though at lower magnitudes—on the order of 15–25%—reinforcing the idea that impacts are strongest but not exclusive to sensitive species.
      <br>
By contrast, declines at the northern, eastern, and southern stations are substantially smaller. Across these stations, trout declines generally remain closer to 5–15%, while bass and carp show minimal change or only modest reductions. 
<br>
This spatial concentration points toward localized environmental conditions rather than lake-wide fishing pressure. The west station’s outsized trout decline is particularly suggestive, as trout function as a sentinel species and tend to decline early under chemical or toxic stress, indicating that the primary stressor is strongest near the western station and disproportionately harmful to sensitive species.
<br>
By contrast, explanations that would be expected to affect the lake uniformly—such as recreational fishing pressure or general boating activity—are difficult to reconcile with the sharply uneven declines observed across stations and species.
    </div>
  </div>
</div>`
```

<!-- ```js
declineByStationSpecies.slice(0, 5)
``` -->
<br><br>

## 3. Water Turning Hostile


The spatial concentration of fish declines raises a critical question: whether environmental stressors are similarly concentrated in the same areas of the lake. To investigate this, water quality measurements are examined across multiple parameters, each of which could plausibly contribute to ecological decline.

<!-- ## Water Quality Standards
The table below summarizes the relevant water quality standards and concern thresholds used in this analysis, providing context for interpreting observed exceedances and assessing their potential biological significance. -->

<details>
<summary style="cursor:pointer;font-weight:600;font-size:1.1em;padding:8px 0;color:#333">View Water Quality Standards</summary>

| Parameter | Concern Threshold | Regulatory Limit | Description |
|-----------|-------------------|------------------|-------------|
| Heavy Metals | 20 ppb | 30 ppb | Levels above 20 ppb harm sensitive fish; above 30 ppb violates permit |
| Nitrogen | 1.5 mg/L | 2.0 mg/L | Excess causes algae blooms |
| Phosphorus | 0.05 mg/L | 0.1 mg/L | Excess causes eutrophication |
| Dissolved Oxygen | 7 mg/L (ideal) | 5 mg/L (minimum) | Below 5 mg/L threatens fish survival |
| pH | 6.5-8.5 | 6.0-9.0 | Acceptable range for aquatic life |
| Turbidity | 10 NTU | 25 NTU | Higher values reduce light penetration |

</details>

The dropdown below allows exploration of four candidate stressors—heavy metals, nitrogen, phosphorus, and dissolved oxygen—shown over time by monitoring station. For each parameter, the accompanying evidence card summarizes how well the observed patterns align with the fish population collapse.


```js
import {html} from "htl";
```



```js
const stationOrderWQ = ["North", "East", "South", "West"];

const STRESSOR_CONFIG = {
  metals: {
    label: "Heavy metals (ppb)",
    field: "heavy_metals_ppb",
    concern: 20,
    limit: 30,
    agg: "max",
    event: d => d.value >= 20,
    yLabel: "Heavy metals (ppb)"
  },
  nitrogen: {
    label: "Nitrogen (mg/L)",
    field: "nitrogen_mg_per_L",
    concern: 1.5,
    limit: 2.0,
    agg: "mean",
    event: d => d.value >= 1.5,
    yLabel: "Nitrogen (mg/L)"
  },
  phosphorus: {
    label: "Phosphorus (mg/L)",
    field: "phosphorus_mg_per_L",
    concern: 0.05,
    limit: 0.10,
    agg: "max",
    event: d => d.value >= 0.05,
    yLabel: "Phosphorus (mg/L)"
  },
  do: {
    label: "Dissolved oxygen (mg/L)",
    field: "dissolved_oxygen_mg_per_L",
    concern: 7,
    limit: 5,
    agg: "min",
    event: d => d.value <= 5,
    yLabel: "Dissolved oxygen (mg/L)"
  }
};
```

```js
const stressorKeyInput = Inputs.select(Object.keys(STRESSOR_CONFIG), {
  label: "Water-quality stressor",
  value: "metals",
  format: k => STRESSOR_CONFIG[k].label
})
```

```js
const stressorKey = view(stressorKeyInput)
```

```js
function dailyAggregate(water, field, agg, stationOrder) {
  const rows = water
    .map(d => ({
      date: new Date(d.date),
      station: d.station_id,
      raw: +d[field]
    }))
    .filter(d =>
      stationOrder.includes(d.station) &&
      d.date instanceof Date &&
      !Number.isNaN(+d.date) &&
      Number.isFinite(d.raw)
    );

  const m = new Map();

  for (const d of rows) {
    const dayKey = d.date.toDateString();
    const key = `${d.station}__${dayKey}`;
    const date = new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate());

    if (!m.has(key)) {
      m.set(key, { station: d.station, date, value: d.raw, _sum: d.raw, _n: 1 });
    } else {
      const cur = m.get(key);

      if (agg === "max") cur.value = Math.max(cur.value, d.raw);
      if (agg === "min") cur.value = Math.min(cur.value, d.raw);

      if (agg === "mean") {
        cur._sum += d.raw;
        cur._n += 1;
        cur.value = cur._sum / cur._n;
      }
    }
  }

  return Array.from(m.values()).sort((a, b) => a.date - b.date);
}
```

```js
// Derived Series (REACTIVE)
const stressor = STRESSOR_CONFIG[stressorKey] ?? STRESSOR_CONFIG.metals;

const dailySeries = dailyAggregate(water, stressor.field, stressor.agg, stationOrderWQ);
const events = dailySeries.filter(stressor.event);

const xMin = new Date(2023, 0, 1);
const xMax = d3.max(dailySeries, d => d.date) ?? new Date(2023, 11, 31);

const yMax = d3.max(dailySeries, d => d.value) ?? 0;
const yMin = d3.min(dailySeries, d => d.value) ?? 0;

({n: dailySeries.length, min: yMin, max: yMax})
```

```js
html`<div style="display:flex;gap:0px;align-items:flex-start;margin:20px 0;max-width:1250px">
  <div style="flex:1">
    ${Plot.plot({
      width: 650,
      height: 400,
      marginLeft: 50,
      marginRight: 40,
      marginTop: 50,
      marginBottom: 45,

      title: `${stressor.label} over time by station`,

      facet: { data: dailySeries, y: "station", domain: stationOrderWQ },
      fy: { domain: stationOrderWQ, padding: 0.35 },

      x: {
        type: "time",
        domain: [xMin, xMax],
        ticks: d3.timeMonth.every(3),
        tickFormat: d3.timeFormat("%b %Y"),
        label: "Date"
      },

      y: {
        grid: true,
        label: stressor.yLabel,
        domain: stressorKey === "do"
          ? [
              Math.max(0, Math.floor(Math.min(yMin, stressor.limit) - 0.5)),
              Math.ceil(Math.max(yMax, stressor.concern) + 0.5)
            ]
          : [0, Math.max(yMax, stressor.limit ?? 0)]
      },

      marks: [
        Plot.ruleY([stressor.concern], { strokeOpacity: 0.25, strokeWidth: 1 }),

        Plot.ruleY([stressor.limit], {
          stroke: "red",
          strokeDasharray: "4,4",
          strokeWidth: 1.6,
          strokeOpacity: 0.8
        }),

        Plot.areaY(dailySeries, {
          x: "date",
          y: "value",
          y1: stressorKey === "do" ? stressor.limit : 0,
          fill: "#A8E6A8",
          fillOpacity: 0.10
        }),

        Plot.lineY(dailySeries, { 
          x: "date", 
          y: "value", 
          stroke: "black",
          strokeWidth: 2 
        }),

        Plot.dot(events, {
          x: "date",
          y: "value",
          r: 3,
          stroke: "white",
          strokeWidth: 1,
          tip: {
            channels: {
              Station: "station",
              Date: d => d3.timeFormat("%b %d, %Y")(d.date),
              Value: d => d.value
            },
            format: { x: false, y: false }
          }
        })
      ]
    })}
  </div>
  <div style="background:white;border:1px solid #e0e0e0;border-radius:12px;padding:16px;box-shadow:0 2px 4px rgba(0,0,0,0.1);flex:0 0 450px;margin-top:110px">
    ${(() => {
      const card = EVIDENCE_CARD[stressorKey] ?? EVIDENCE_CARD.metals;
      return html`<div>
        <div style="font-weight:700;margin-bottom:8px;font-size:1.05em;color:#333">${card.title}</div>
        <ul style="margin:0 0 10px 20px;padding:0;color:#555">
          ${card.bullets.map(b => html`<li style="margin-bottom:6px;line-height:1.4">${b}</li>`)}
        </ul>
        <div style="font-weight:600;margin-top:10px;color:#666;font-size:0.9em">${card.next}</div>
      </div>`;
    })()}
  </div>
</div>`
```

```js
const EVIDENCE_CARD = {
  metals: {
    title: "Heavy metals (Primary, 6/6)",
    bullets: [
      "Spatial alignment: ✅ West dominant",
      "Temporal alignment: ✅ exceedances begin early in fish decline window",
      "Causal plausibility (trout as sentinel): ✅ strong (direct toxicity)"
    ],
    next: "Next lead: ChemTech + western inlet timing."
  },
  nitrogen: {
    title: "Nitrogen (secondary contributor, 3/6)",
    bullets: [
      "Spatial alignment: ⚠️ North",
      "Temporal alignment: ⚠️ seasonal (not worsening)",
      "Causal plausibility: ⚠️ indirect; needs DO collapse (not observed)"
    ],
    next: "Next lead: Farm runoff as contributing factor."
  },
  phosphorus: {
    title: "Phosphorus (secondary contributor, 3/6)",
    bullets: [
      "Spatial alignment: ⚠️ episodic at East (May–Jun, Oct–Nov) + North (Apr, Sep)",
      "Temporal alignment: ⚠️ seasonal windows",
      "Causal plausibility: ⚠️ indirect; no sustained DO crisis"
    ],
    next: "Next lead: Resort + farm as contributors."
  },
  do: {
    title: "Dissolved oxygen (unlikely contributor, ~1/6)",
    bullets: [
      "Spatial alignment: ❌",
      "Temporal alignment: ❌",
      "Causal plausibility: ❌ no sustained low-DO at West"
    ],
    next: "Conclusion: helps rule out hypoxia as main driver."
  }
};

// Test: verify EVIDENCE_CARD is created
EVIDENCE_CARD
```

<br>

### How to read the evidence
Each stressor is evaluated using a simple plausibility framework, scored on a 0–6 scale based on three criteria:

- **Spatial alignment:** Does the stressor peak where fish declines are most severe?
- **Temporal alignment:** Do changes in the stressor coincide with the timing of fish decline?
- **Causal plausibility:** Is there a well-established mechanism linking this stressor to fish mortality, particularly for sensitive species like trout?


This framework does not establish causation, but it provides a structured way to compare competing explanations and narrow the field of likely contributors.

<br>

## 4. Weighing the Evidence Across Stressors
<br>

**Heavy metals: strongest overall alignment (6/6)**

Heavy metals show the clearest alignment with observed fish declines. Concentrations are consistently highest at the western station, where trout populations have declined most sharply. Importantly, exceedances begin early in the fish decline window and recur throughout the period of observation.
From a biological perspective, heavy metals are directly toxic to fish and are known to disproportionately affect sensitive species. The combination of strong spatial overlap, early temporal coincidence, and direct causal mechanism makes heavy metals the most plausible primary driver among the stressors examined.

**Nitrogen: plausible but incomplete (3/6)**

Nitrogen levels exhibit clear seasonal patterns, with higher concentrations observed primarily at the northern station, consistent with agricultural runoff. However, these peaks do not intensify over time and do not align spatially with the most severe fish declines at the western station.
While elevated nitrogen can contribute indirectly to ecological stress—often through downstream effects like algal blooms or oxygen depletion—those secondary conditions are not observed at the west station. As a result, nitrogen appears to be a secondary or contributing factor, rather than a primary driver.

**Phosphorus: episodic and indirect (3/6)**

Phosphorus shows short-lived spikes at the eastern and northern stations during specific seasonal windows. Like nitrogen, these patterns suggest localized inputs but lack both persistence and spatial overlap with the most pronounced fish declines.
Without evidence of sustained eutrophication or associated oxygen collapse, phosphorus alone does not provide a compelling explanation for the observed population losses. It remains a plausible background stressor, but not a dominant cause.

**Dissolved oxygen: unlikely primary driver (~1/6)**

Dissolved oxygen levels remain above critical thresholds across most stations, including the west. While minor fluctuations occur, there is no evidence of sustained hypoxic conditions coinciding with trout decline.
Given the absence of both spatial and temporal alignment, low dissolved oxygen serves primarily as a negative finding—helpful in ruling out hypoxia as the main mechanism behind the collapse.

<br>

## 5. Final Verdict
<br><br>
The evidence converges on a single, compelling explanation: Lake Clearwater’s ecological collapse is being driven by a localized environmental stressor concentrated near the western station. Across all analyses, this area consistently emerges as the epicenter of biological decline, with trout populations—an established sentinel species—showing the most severe and earliest losses.
Among the water quality parameters examined, heavy metals stand apart. They are the only stressor that aligns simultaneously with the location of greatest fish decline, the timing of population collapse, and a direct, well-established toxic mechanism. Heavy metal concentrations are consistently highest near the western inlet and begin rising early in the decline window, setting them apart from all other stressors examined.

Taken together, this convergence of spatial, temporal, and biological evidence points most strongly to ChemTech Manufacturing as the primary driver of Lake Clearwater’s ecological collapse. Alternative explanations—including nutrient runoff, dissolved oxygen depletion, and recreational fishing pressure—fail to account for the magnitude and concentration of losses observed at the western station. Based on the available evidence, industrial activity at the western shore emerges as the most plausible cause of the crisis.

<!-- ```js
const stationOrderWQ = ["North", "East", "South", "West"];

const STRESSOR_CONFIG = {
  metals: {
    label: "Heavy metals (ppb)",
    field: "heavy_metals_ppb",
    concern: 20,
    limit: 30,
    agg: "max",
    event: d => d.value >= 20,
    yLabel: "Heavy metals (ppb)"
  },
  nitrogen: {
    label: "Nitrogen (mg/L)",
    field: "nitrogen_mg_per_L",
    concern: 1.5,
    limit: 2.0,
    agg: "mean",
    event: d => d.value >= 1.5,
    yLabel: "Nitrogen (mg/L)"
  },
  phosphorus: {
    label: "Phosphorus (mg/L)",
    field: "phosphorus_mg_per_L",
    concern: 0.05,
    limit: 0.10,
    agg: "max",
    event: d => d.value >= 0.05,
    yLabel: "Phosphorus (mg/L)"
  },
  do: {
    label: "Dissolved oxygen (mg/L)",
    field: "dissolved_oxygen_mg_per_L",
    concern: 7,
    limit: 5,
    agg: "min",
    event: d => d.value <= 5,
    yLabel: "Dissolved oxygen (mg/L)"
  }
};

const stressorKeyInput = Inputs.select(Object.keys(STRESSOR_CONFIG), {
  label: "Water-quality stressor",
  value: "metals",
  format: k => STRESSOR_CONFIG[k].label
});

stressorKeyInput
```

```js
const stressorKey = view(stressorKeyInput);     // "metals" | "nitrogen" | "phosphorus" | "do"
const stressor = STRESSOR_CONFIG[stressorKey] ?? STRESSOR_CONFIG.metals;

({stressorKey, label: stressor.label})
```

```js
function dailyAggregate(water, field, agg, stationOrder) {
  const rows = water
    .map(d => ({
      date: new Date(d.date),
      station: d.station_id,
      raw: +d[field]
    }))
    .filter(d =>
      stationOrder.includes(d.station) &&
      d.date instanceof Date &&
      !Number.isNaN(+d.date) &&
      Number.isFinite(d.raw)
    );

  const m = new Map();

  for (const d of rows) {
    const dayKey = d.date.toDateString();
    const key = `${d.station}__${dayKey}`;
    const date = new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate());

    if (!m.has(key)) {
      m.set(key, { station: d.station, date, value: d.raw, _sum: d.raw, _n: 1 });
    } else {
      const cur = m.get(key);
      if (agg === "max") cur.value = Math.max(cur.value, d.raw);
      if (agg === "min") cur.value = Math.min(cur.value, d.raw);
      if (agg === "mean") {
        cur._sum += d.raw;
        cur._n += 1;
        cur.value = cur._sum / cur._n;
      }
    }
  }

  return Array.from(m.values()).sort((a, b) => a.date - b.date);
}

const dailySeries = dailyAggregate(water, stressor.field, stressor.agg, stationOrderWQ);
const events = dailySeries.filter(stressor.event);

const xMin = new Date(2023, 0, 1);
const xMax = d3.max(dailySeries, d => d.date);

const yMax = d3.max(dailySeries, d => d.value) ?? 0;
const yMin = d3.min(dailySeries, d => d.value) ?? 0;

({n: dailySeries.length, min: yMin, max: yMax})
```

```js
Plot.plot({
  width: 900,
  height: 420,
  marginLeft: 95,
  marginRight: 70,
  marginTop: 50,
  marginBottom: 45,

  title: `${stressor.label} over time by station`,
  subtitle: "Stressor changes via dropdown",

  facet: { data: dailySeries, y: "station", domain: stationOrderWQ },
  fy: { domain: stationOrderWQ, padding: 0.35 },

  x: {
    type: "time",
    domain: [xMin, xMax],
    ticks: d3.timeMonth.every(3),
    tickFormat: d3.timeFormat("%b %Y"),
    label: "Date"
  },

  y: {
    grid: true,
    label: stressor.yLabel,
    domain: stressorKey === "do"
      ? [
          Math.max(0, Math.floor(Math.min(yMin, stressor.limit) - 0.5)),
          Math.ceil(Math.max(yMax, stressor.concern) + 0.5)
        ]
      : [0, Math.max(yMax, stressor.limit ?? 0)]
  },

  marks: [
    Plot.ruleY([stressor.concern], { strokeOpacity: 0.25, strokeWidth: 1 }),

    Plot.ruleY([stressor.limit], {
      stroke: "red",
      strokeDasharray: "4,4",
      strokeWidth: 1.6,
      strokeOpacity: 0.8
    }),

    Plot.areaY(dailySeries, {
      x: "date",
      y: "value",
      y1: stressorKey === "do" ? stressor.limit : 0,
      fillOpacity: 0.10
    }),

    Plot.lineY(dailySeries, { x: "date", y: "value", strokeWidth: 2 }),

    Plot.dot(events, {
      x: "date",
      y: "value",
      r: 3,
      stroke: "white",
      strokeWidth: 1,
      tip: {
        channels: {
          Station: "station",
          Date: d => d3.timeFormat("%b %d, %Y")(d.date),
          Value: d => d.value
        },
        format: { x: false, y: false }
      }
    })
  ]
})
```

```js
const EVIDENCE_CARD = {
  metals: {
    title: "Exhibit A — Heavy metals (Primary, 6/6)",
    bullets: [
      "Spatial alignment: ✅ West dominant",
      "Temporal alignment: ✅ exceedances begin early in fish decline window",
      "Causal plausibility (trout as sentinel): ✅ strong (direct toxicity)"
    ],
    next: "Next lead: ChemTech + western inlet timing."
  },
  nitrogen: {
    title: "Exhibit B — Nitrogen (secondary contributor, 3/6)",
    bullets: [
      "Spatial alignment: ⚠️ North",
      "Temporal alignment: ⚠️ seasonal (not worsening)",
      "Causal plausibility: ⚠️ indirect; needs DO collapse (not observed)"
    ],
    next: "Next lead: Farm runoff as contributing factor."
  },
  phosphorus: {
    title: "Exhibit C — Phosphorus (secondary contributor, 3/6)",
    bullets: [
      "Spatial alignment: ⚠️ episodic at East (May–Jun, Oct–Nov) + North (Apr, Sep)",
      "Temporal alignment: ⚠️ seasonal windows",
      "Causal plausibility: ⚠️ indirect; no sustained DO crisis"
    ],
    next: "Next lead: Resort + farm as contributors."
  },
  do: {
    title: "Exhibit D — Dissolved oxygen (unlikely primary, ~1/6)",
    bullets: [
      "Spatial alignment: ❌",
      "Temporal alignment: ❌",
      "Causal plausibility: ❌ no sustained low-DO at West"
    ],
    next: "Conclusion: helps rule out hypoxia as main driver."
  }
};

const card = EVIDENCE_CARD[stressorKey];

html`<div style="border:1px solid #ddd;border-radius:12px;padding:14px;max-width:900px">
  <div style="font-weight:700;margin-bottom:6px">${card.title}</div>
  <ul style="margin:0 0 8px 18px">
    ${card.bullets.map(b => html`<li>${b}</li>`)}
  </ul>
  <div style="font-weight:600">${card.next}</div>
</div>`
``` -->

<!-- ```js
LAST WORKING VERSION - ONLY ISSUE WAS PLOT NOT UPDATING
const stationOrderWQ = ["North", "East", "South", "West"];

const STRESSOR_CONFIG = {
  metals: {
    label: "Heavy metals (ppb)",
    field: "heavy_metals_ppb",
    concern: 20,
    limit: 30,
    agg: "max",
    event: d => d.value >= 20,
    yLabel: "Heavy metals (ppb)"
  },
  nitrogen: {
    label: "Nitrogen (mg/L)",
    field: "nitrogen_mg_per_L",
    concern: 1.5,
    limit: 2.0,
    agg: "mean",
    event: d => d.value >= 1.5,
    yLabel: "Nitrogen (mg/L)"
  },
  phosphorus: {
    label: "Phosphorus (mg/L)",
    field: "phosphorus_mg_per_L",
    concern: 0.05,
    limit: 0.10,
    agg: "max",
    event: d => d.value >= 0.05,
    yLabel: "Phosphorus (mg/L)"
  },
  do: {
    label: "Dissolved oxygen (mg/L)",
    field: "dissolved_oxygen_mg_per_L",
    concern: 7,     // ideal reference
    limit: 5,       // minimum survival
    agg: "min",
    event: d => d.value <= 5,
    yLabel: "Dissolved oxygen (mg/L)"
  }
};

// IMPORTANT: options must be KEYS (strings), not objects/pairs
const stressorKeyInput = Inputs.select(Object.keys(STRESSOR_CONFIG), {
  label: "Water-quality stressor",
  value: "metals",
  format: k => STRESSOR_CONFIG[k].label
});

display(stressorKeyInput);

// this must evaluate to a STRING like "metals"
const stressorKey = view(stressorKeyInput);

// guard (prevents crash if value is ever weird)
const stressor = STRESSOR_CONFIG[stressorKey] ?? STRESSOR_CONFIG.metals;
```

```js
function dailyAggregate(water, field, agg, stationOrder) {
  const rows = water
    .map(d => ({
      date: new Date(d.date),
      station: d.station_id,
      raw: +d[field]
    }))
    .filter(d =>
      stationOrder.includes(d.station) &&
      d.date instanceof Date &&
      !Number.isNaN(+d.date) &&
      Number.isFinite(d.raw)
    );

  const m = new Map();

  for (const d of rows) {
    const dayKey = d.date.toDateString();
    const key = `${d.station}__${dayKey}`;
    const date = new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate());

    if (!m.has(key)) {
      m.set(key, { station: d.station, date, value: d.raw, _sum: d.raw, _n: 1 });
    } else {
      const cur = m.get(key);

      if (agg === "max") cur.value = Math.max(cur.value, d.raw);
      if (agg === "min") cur.value = Math.min(cur.value, d.raw);

      if (agg === "mean") {
        cur._sum += d.raw;
        cur._n += 1;
        cur.value = cur._sum / cur._n;
      }
    }
  }

  return Array.from(m.values()).sort((a, b) => a.date - b.date);
}

const dailySeries = dailyAggregate(water, stressor.field, stressor.agg, stationOrderWQ);
const events = dailySeries.filter(stressor.event);

const xMin = new Date(2023, 0, 1);
const xMax = d3.max(dailySeries, d => d.date);

const yMax = d3.max(dailySeries, d => d.value) ?? 0;
const yMin = d3.min(dailySeries, d => d.value) ?? 0;
```

```js
Plot.plot({
  width: 900,
  height: 420,
  marginLeft: 95,
  marginRight: 70,
  marginTop: 50,
  marginBottom: 45,

  title: `${stressor.label} over time by station`,
  subtitle: "Stressor changes via dropdown",

  facet: { data: dailySeries, y: "station", domain: stationOrderWQ },
  fy: { domain: stationOrderWQ, padding: 0.35 },

  x: {
    type: "time",
    domain: [xMin, xMax],
    ticks: d3.timeMonth.every(3),
    tickFormat: d3.timeFormat("%b %Y"),
    label: "Date"
  },

  y: {
    grid: true,
    label: stressor.yLabel,
    domain: stressorKey === "do"
      ? [
          Math.max(0, Math.floor(Math.min(yMin, stressor.limit) - 0.5)),
          Math.ceil(Math.max(yMax, stressor.concern) + 0.5)
        ]
      : [0, Math.max(yMax, stressor.limit ?? 0)]
  },

  marks: [
    Plot.ruleY([stressor.concern], { strokeOpacity: 0.25, strokeWidth: 1 }),

    Plot.ruleY([stressor.limit], {
      stroke: "red",
      strokeDasharray: "4,4",
      strokeWidth: 1.6,
      strokeOpacity: 0.8
    }),

    Plot.areaY(dailySeries, {
      x: "date",
      y: "value",
      y1: stressorKey === "do" ? stressor.limit : 0,
      fillOpacity: 0.10
    }),

    Plot.lineY(dailySeries, { x: "date", y: "value", strokeWidth: 2 }),

    Plot.dot(events, {
      x: "date",
      y: "value",
      r: 3,
      stroke: "white",
      strokeWidth: 1,
      tip: {
        channels: {
          Station: "station",
          Date: d => d3.timeFormat("%b %d, %Y")(d.date),
          Value: d => d.value
        },
        format: { x: false, y: false }
      }
    })
  ]
})
```

```js
const EVIDENCE_CARD = {
  metals: {
    title: "Exhibit A — Heavy metals (Primary, 6/6)",
    bullets: [
      "Spatial alignment: ✅ West dominant",
      "Temporal alignment: ✅ exceedances begin early in fish decline window",
      "Causal plausibility (trout as sentinel): ✅ strong (direct toxicity)"
    ],
    next: "Next lead: ChemTech + western inlet timing."
  },
  nitrogen: {
    title: "Exhibit B — Nitrogen (secondary contributor, 3/6)",
    bullets: [
      "Spatial alignment: ⚠️ North",
      "Temporal alignment: ⚠️ seasonal (not worsening)",
      "Causal plausibility: ⚠️ indirect; needs DO collapse (not observed)"
    ],
    next: "Next lead: Farm runoff as contributing factor."
  },
  phosphorus: {
    title: "Exhibit C — Phosphorus (secondary contributor, 3/6)",
    bullets: [
      "Spatial alignment: ⚠️ episodic at East (May–Jun, Oct–Nov) + North (Apr, Sep)",
      "Temporal alignment: ⚠️ seasonal windows",
      "Causal plausibility: ⚠️ indirect; no sustained DO crisis"
    ],
    next: "Next lead: Resort + farm as contributors."
  },
  do: {
    title: "Exhibit D — Dissolved oxygen (unlikely primary, ~1/6)",
    bullets: [
      "Spatial alignment: ❌",
      "Temporal alignment: ❌",
      "Causal plausibility: ❌ no sustained low-DO at West"
    ],
    next: "Conclusion: helps rule out hypoxia as main driver."
  }
};

const card = EVIDENCE_CARD[stressorKey] ?? EVIDENCE_CARD.metals;

// If you kept `import {html} from "htl";`:
html`<div style="border:1px solid #ddd;border-radius:12px;padding:14px;max-width:900px">
  <div style="font-weight:700;margin-bottom:6px">${card.title}</div>
  <ul style="margin:0 0 8px 18px">
    ${card.bullets.map(b => html`<li>${b}</li>`)}
  </ul>
  <div style="font-weight:600">${card.next}</div>
</div>`
``` -->






<!-- 
```js
// =========================
// Section 2 DATA PREP: Heavy metals (daily series) + peaks
// =========================

const stationOrderWQ = ["North", "East", "South", "West"];

// // ===== Facet layout constants (shared across charts) =====
// const FACET_GAP = 40;              // space between small multiples
// const ROW_H = 70;                  // height of each station row
// const NROWS = stationOrderWQ.length;

// const PLOT_H =
//   50 +                              // marginTop
//   45 +                              // marginBottom
//   (NROWS * ROW_H) +
//   ((NROWS - 1) * FACET_GAP);


const METALS_CONCERN_WQ = 20;

// 1) Clean water table (wide format confirmed)
const waterCleanWQ = water.map(d => ({
  ...d,
  date: new Date(d.date),
  station: d.station_id,
  heavy_metals_ppb: +d.heavy_metals_ppb
})).filter(d =>
  stationOrderWQ.includes(d.station) &&
  d.date instanceof Date &&
  !Number.isNaN(+d.date) &&
  Number.isFinite(d.heavy_metals_ppb)
);

// 2) Aggregate to ONE value per station per day
// Choose the daily statistic that you want the line to represent.
// To keep it "actual" and align with "peaks", daily MAX is usually best.
const dailyMetalsMapWQ = new Map();

for (const d of waterCleanWQ) {
  const dayKey = d.date.toDateString();
  const key = `${d.station}__${dayKey}`;

  if (!dailyMetalsMapWQ.has(key)) {
    dailyMetalsMapWQ.set(key, {
      station: d.station,
      date: new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate()),
      heavy_metals_ppb: d.heavy_metals_ppb
    });
  } else {
    // daily max (actual observed peak for that station/day)
    const cur = dailyMetalsMapWQ.get(key);
    if (d.heavy_metals_ppb > cur.heavy_metals_ppb) cur.heavy_metals_ppb = d.heavy_metals_ppb;
  }
}

const dailyMetalsWQ = Array.from(dailyMetalsMapWQ.values())
  .sort((a, b) => a.date - b.date);

// 3) Peak events: days where the daily value crosses the concern threshold
// These dots will sit on the line because they're the same dailyMetalsWQ series.
const metalPeaksWQ = dailyMetalsWQ.filter(d => d.heavy_metals_ppb >= METALS_CONCERN_WQ);

// 4) y-scale helper
const metalsMaxWQ = d3.max(dailyMetalsWQ, d => d.heavy_metals_ppb) ?? 0;
``` -->

<!-- ```js
Plot.plot({
  width: 900,
  height: 420,
  marginLeft: 80,
  marginRight: 60,
  marginTop: 50,
  marginBottom: 45,

  title: "Heavy Metals Over Time by Station",
  subtitle: "Daily maximum concentration per station (line) with concern-threshold peak days (dots)",

//   facet: {
//     data: dailyMetalsWQ,
//     y: "station",
//     domain: stationOrderWQ,
//     marginY: 40
//   },

facet: {
  data: dailyMetalsWQ,
  y: "station",
  domain: stationOrderWQ
},

fy: {
  domain: stationOrderWQ,
  padding: 0.35   // try 0.25–0.5 if you want more/less space
},


  x: {
    type: "time",
    label: "Date",
      domain: [new Date("2023-01-01"), d3.max(dailyMetalsWQ, d => d.date)],
    tickFormat: d3.timeFormat("%b %Y"),
    ticks: d3.utcMonth.every(3)
  },

  y: {
    label: "Heavy metals (ppb)",
    grid: true,
    domain: [0, Math.max(45, metalsMaxWQ)]
  },

  marks: [
    // Concern threshold: red dotted line
    Plot.ruleY([METALS_CONCERN_WQ], {
      stroke: "red",
      strokeDasharray: "4,4",
      strokeWidth: 1.5,
      strokeOpacity: 0.7
    }),

    // Optional area to help read magnitude (subtle)
    Plot.areaY(dailyMetalsWQ, {
      x: "date",
      y: "heavy_metals_ppb",
      y1: 0,
    //   fill: "#8BC34A",      // light green
      fillOpacity: 0.14
    }),

    // Main line: actual daily max values
    Plot.lineY(dailyMetalsWQ, {
      x: "date",
      y: "heavy_metals_ppb",
      strokeWidth: 2
    }),

    // Peak-event dots (same series, so they sit on the line)
    Plot.dot(metalPeaksWQ, {
      x: "date",
      y: "heavy_metals_ppb",
      r: 3,
      stroke: "white",
      strokeWidth: 1,
      tip: {
        channels: {
          Station: "station",
          Date: d => d3.timeFormat("%b %d, %Y")(d.date),
          "Daily max metals (ppb)": d => d.heavy_metals_ppb
        },
        format: { x: false, y: false }
      }
    })
  ]
})
``` -->

<!-- ```js
// =========================
// Section 2 DATA PREP: Nitrogen (daily values)
// =========================

const waterNitrogenWQ = water.map(d => ({
  ...d,
  date: new Date(d.date),
  station: d.station_id,
  nitrogen_mg_per_L: +d.nitrogen_mg_per_L
})).filter(d =>
  stationOrderWQ.includes(d.station) &&
  d.date instanceof Date &&
  !Number.isNaN(+d.date) &&
  Number.isFinite(d.nitrogen_mg_per_L)
);

// One value per station per day (nitrogen is already stable → no need for max)
const dailyNitrogenWQ = d3.rollups(
  waterNitrogenWQ,
  v => d3.mean(v, d => d.nitrogen_mg_per_L),
  d => d.station,
  d => d.date.toDateString()
).flatMap(([station, dayArr]) =>
  dayArr.map(([day, value]) => ({
    station,
    date: new Date(day),
    nitrogen_mg_per_L: value
  }))
).sort((a, b) => a.date - b.date);

// Concern threshold (you already added this)
const N_CONCERN = 1.5;

// Helper for y-domain
const nitrogenMaxWQ = d3.max(dailyNitrogenWQ, d => d.nitrogen_mg_per_L) ?? 0;

``` -->

<!-- ```js
Plot.plot({
  width: 900,
  height: 420,
  marginLeft: 80,
  marginRight: 60,
  marginTop: 50,
  marginBottom: 45,

  title: "Nitrogen Concentration Over Time by Station",
  subtitle: "Daily average nitrogen levels with concern threshold (1.5 mg/L)",

//   facet: {
//     data: dailyNitrogenWQ,
//     y: "station",
//     domain: stationOrderWQ,
//     marginY: 40
//   },
facet: {
  data: dailyNitrogenWQ,
  y: "station",
  domain: stationOrderWQ
},

fy: {
  domain: stationOrderWQ,
  padding: 0.35   // try 0.25–0.5 if you want more/less space
},

  x: {
    type: "time",
    label: "Date",
    domain: [new Date(2023, 0, 1), d3.max(dailyNitrogenWQ, d => d.date)],
    ticks: d3.timeMonth.every(3),
    tickFormat: d3.timeFormat("%b %Y")
  },

  y: {
    label: "Nitrogen (mg/L)",
    grid: true,
    domain: [0, Math.max(2, nitrogenMaxWQ)]
  },

  marks: [
    // Concern threshold
    Plot.ruleY([N_CONCERN], {
      stroke: "red",
      strokeDasharray: "4,4",
      strokeWidth: 1.5,
      strokeOpacity: 0.7
    }),

    // Subtle area (same visual language as metals)
    Plot.areaY(dailyNitrogenWQ, {
      x: "date",
      y: "nitrogen_mg_per_L",
      y1: 0,
    //   fill: "#AED581",
      fillOpacity: 0.12
    }),

    // Actual values line
    Plot.lineY(dailyNitrogenWQ, {
      x: "date",
      y: "nitrogen_mg_per_L",
      strokeWidth: 2
    }),

    // Hover/tooltips for ALL daily nitrogen points (invisible dots)
Plot.dot(dailyNitrogenWQ, {
  x: "date",
  y: "nitrogen_mg_per_L",
  r: 6,
  fill: "transparent",
  stroke: "transparent",
  tip: {
    channels: {
      Station: "station",
      Date: d => d3.timeFormat("%b %d, %Y")(d.date),
      "Daily avg nitrogen (mg/L)": d => d.nitrogen_mg_per_L
    },
    format: { x: false, y: false }
  }
}),

  ]
})
``` -->

<!-- ```js
// =========================
// Section 2 DATA PREP: Phosphorus (daily series) + peaks
// =========================

const P_CONCERN = 0.05; // mg/L
const P_LIMIT   = 0.10; // mg/L

// Clean phosphorus values
const waterPhosWQ = water.map(d => ({
  ...d,
  date: new Date(d.date),
  station: d.station_id,
  phosphorus_mg_per_L: +d.phosphorus_mg_per_L
})).filter(d =>
  stationOrderWQ.includes(d.station) &&
  d.date instanceof Date &&
  !Number.isNaN(+d.date) &&
  Number.isFinite(d.phosphorus_mg_per_L)
);

// Aggregate to ONE actual value per station per day (daily max)
const dailyPhosMapWQ = new Map();

for (const d of waterPhosWQ) {
  const dayKey = d.date.toDateString();
  const key = `${d.station}__${dayKey}`;

  if (!dailyPhosMapWQ.has(key)) {
    dailyPhosMapWQ.set(key, {
      station: d.station,
      date: new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate()),
      phosphorus_mg_per_L: d.phosphorus_mg_per_L
    });
  } else {
    const cur = dailyPhosMapWQ.get(key);
    if (d.phosphorus_mg_per_L > cur.phosphorus_mg_per_L) {
      cur.phosphorus_mg_per_L = d.phosphorus_mg_per_L;
    }
  }
}

const dailyPhosWQ = Array.from(dailyPhosMapWQ.values())
  .sort((a, b) => a.date - b.date);

// Peak days (dots sit on the line)
const phosPeaksWQ = dailyPhosWQ.filter(d => d.phosphorus_mg_per_L >= P_CONCERN);

// Helpers for axis + ticks (no data-prep change elsewhere)
const phosMaxWQ = d3.max(dailyPhosWQ, d => d.phosphorus_mg_per_L) ?? 0;
const phosMaxDateWQ = d3.max(dailyPhosWQ, d => d.date);
const xStartWQ = new Date(2023, 0, 1);

const xTicks3moWQ = d3.timeMonth.every(3).range(
  xStartWQ,
  d3.timeMonth.offset(phosMaxDateWQ, 1)
);
``` -->

<!-- ```js
Plot.plot({
  width: 900,
  height: 420,
  marginLeft: 90,
  marginRight: 70,
  marginTop: 50,
  marginBottom: 45,

  title: "Phosphorus Over Time by Station",
  subtitle: "Daily maximum concentration per station (line) with concern-threshold peak days (dots)",

//   facet: {
//     data: dailyPhosWQ,
//     y: "station",
//     domain: stationOrderWQ,
//     marginY: 28
//   },

facet: {
  data: dailyPhosWQ,
  y: "station",
  domain: stationOrderWQ
},

fy: {
  domain: stationOrderWQ,
  padding: 0.35   // try 0.25–0.5 if you want more/less space
},


  x: {
    type: "time",
    label: "Date",
    domain: [xStartWQ, phosMaxDateWQ],
    ticks: xTicks3moWQ,                 // ✅ every 3 months, starting Jan 2023
    tickFormat: d3.timeFormat("%b %Y")
  },

  y: {
    label: "Phosphorus (mg/L)",
    grid: true,
    domain: [0, Math.max(P_LIMIT, phosMaxWQ)]
  },

  marks: [
    // Concern threshold (red dotted)
    Plot.ruleY([P_CONCERN], {
      stroke: "red",
      strokeDasharray: "4,4",
      strokeWidth: 1.5,
      strokeOpacity: 0.75
    }),

    // Regulatory limit (subtle)
    Plot.ruleY([P_LIMIT], {
      strokeOpacity: 0.25,
      strokeWidth: 1
    }),

    // Optional light green area fill
    Plot.areaY(dailyPhosWQ, {
      x: "date",
      y: "phosphorus_mg_per_L",
      y1: 0,
    //   fill: "#8BC34A",
      fillOpacity: 0.10
    }),

    // Main line (actual daily max values)
    Plot.lineY(dailyPhosWQ, {
      x: "date",
      y: "phosphorus_mg_per_L",
      strokeWidth: 2
    }),

    // Peak dots (sit on the line)
    Plot.dot(phosPeaksWQ, {
      x: "date",
      y: "phosphorus_mg_per_L",
      r: 3,
      stroke: "white",
      strokeWidth: 1,
      opacity: 0.85,
      tip: {
        channels: {
          Station: "station",
          Date: d => d3.timeFormat("%b %d, %Y")(d.date),
          "Daily max phosphorus (mg/L)": d => d.phosphorus_mg_per_L
        },
        format: { x: false, y: false }
      }
    })
  ]
})
``` -->

<!-- ```js
// =========================
// Section 2 DATA PREP: Dissolved oxygen (daily series) + low-DO events
// =========================

const DO_IDEAL = 7;   // mg/L
const DO_MIN   = 5;   // mg/L (threatens fish survival)

// Clean + keep needed fields (wide format from your CSV)
const waterCleanDO = water
  .map(d => ({
    ...d,
    date: new Date(d.date),
    station: d.station_id,
    dissolved_oxygen_mg_per_L: +d.dissolved_oxygen_mg_per_L
  }))
  .filter(d =>
    stationOrderWQ.includes(d.station) &&
    d.date instanceof Date &&
    !Number.isNaN(+d.date) &&
    Number.isFinite(d.dissolved_oxygen_mg_per_L)
  );

// One value per station per day.
// For DO, the “worst case” for fish is the DAILY MIN (lowest oxygen).
const dailyDOMap = new Map();

for (const d of waterCleanDO) {
  const dayKey = d.date.toDateString();
  const key = `${d.station}__${dayKey}`;

  if (!dailyDOMap.has(key)) {
    dailyDOMap.set(key, {
      station: d.station,
      date: new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate()),
      dissolved_oxygen_mg_per_L: d.dissolved_oxygen_mg_per_L
    });
  } else {
    const cur = dailyDOMap.get(key);
    if (d.dissolved_oxygen_mg_per_L < cur.dissolved_oxygen_mg_per_L) {
      cur.dissolved_oxygen_mg_per_L = d.dissolved_oxygen_mg_per_L;
    }
  }
}

const dailyDOWQ = Array.from(dailyDOMap.values()).sort((a, b) => a.date - b.date);

// “Low DO events” (dots will sit on the line because they’re the same daily series)
const lowDOEventsWQ = dailyDOWQ.filter(d => d.dissolved_oxygen_mg_per_L <= DO_MIN);

// Helpers for axis + ticks
const doMaxDateWQ = d3.max(dailyDOWQ, d => d.date);
const doMinWQ = d3.min(dailyDOWQ, d => d.dissolved_oxygen_mg_per_L) ?? 0;
const doMaxWQ = d3.max(dailyDOWQ, d => d.dissolved_oxygen_mg_per_L) ?? 0;

const doYMin = Math.max(0, Math.floor(Math.min(doMinWQ, DO_MIN) - 0.5));
const doYMax = Math.ceil(Math.max(doMaxWQ, DO_IDEAL) + 0.5);
``` -->

<!-- ```js
// I expected DO levels to be out of bounds, which they aren't. Hence, doing a sanity check.
d3.rollups(
  waterCleanDO,
  v => ({
    n: v.length,
    mean: d3.mean(v, d => d.dissolved_oxygen_mg_per_L),
    min: d3.min(v, d => d.dissolved_oxygen_mg_per_L),
    max: d3.max(v, d => d.dissolved_oxygen_mg_per_L)
  }),
  d => d.station
)
  .map(([station, s]) => ({ station, ...s }))
``` -->

<!-- ```js
Plot.plot({
  width: 900,
  height: 420,
  marginLeft: 95,
  marginRight: 70,   // avoids label clipping
  marginTop: 50,
  marginBottom: 45,

  title: "Dissolved Oxygen Over Time by Station",
  subtitle: "Daily minimum DO (line) with low-oxygen events (dots) and ecological thresholds",

//   facet: {
//     data: dailyDOWQ,
//     y: "station",
//     domain: stationOrderWQ,
//     marginY: 28
//   },

facet: {
  data: dailyDOWQ,
  y: "station",
  domain: stationOrderWQ
},

fy: {
  domain: stationOrderWQ,
  padding: 0.35   // try 0.25–0.5 if you want more/less space
},


  x: {
    type: "time",
    label: "Date",
    domain: [new Date(2023, 0, 1), doMaxDateWQ],
    ticks: d3.timeMonth.every(3).range(
      new Date(2023, 0, 1),
      d3.timeMonth.offset(doMaxDateWQ, 1)
    ),
    tickFormat: d3.timeFormat("%b %Y")
  },

  y: {
    label: "Dissolved oxygen (mg/L)",
    grid: true,
    domain: [doYMin, doYMax]
  },

  marks: [
    // Ideal line (subtle)
    Plot.ruleY([DO_IDEAL], {
      strokeOpacity: 0.25,
      strokeWidth: 1
    }),

    // Minimum survival line (red dotted)
    Plot.ruleY([DO_MIN], {
      stroke: "red",
      strokeDasharray: "4,4",
      strokeWidth: 1.6,
      strokeOpacity: 0.8
    }),

    // Light fill (optional—same style as metals, but calm)
    Plot.areaY(dailyDOWQ, {
      x: "date",
      y: "dissolved_oxygen_mg_per_L",
      y1: doYMin,  
    //   y1: 0,
    //   fill: "#8BC34A",
      fillOpacity: 0.10
    }),

    // Line = actual daily minimum DO values
    Plot.lineY(dailyDOWQ, {
      x: "date",
      y: "dissolved_oxygen_mg_per_L",
      strokeWidth: 2
    }),
    // Hover dots for all daily values (invisible)
    Plot.dot(dailyDOWQ, {
      x: "date",
      y: "dissolved_oxygen_mg_per_L",
      r: 6,
      fill: "transparent",
      stroke: "transparent",
      tip: {
       channels: {
       Station: "station",
       Date: d => d3.timeFormat("%b %d, %Y")(d.date),
       "Daily min DO (mg/L)": d => d.dissolved_oxygen_mg_per_L
       },
       format: { x: false, y: false }
     }
    }),
  ]
})
``` -->







<!-- ```js
OVERALL FISH COUNT 
Plot.plot({
  width: 900,
  height: 350,
  marginLeft: 70,
  marginRight: 30,
  marginTop: 50,
  marginBottom: 50,

  title: "Overall Fish Counts Over Time by Species",
  subtitle: "Stacked area: species contributions to total fish caught (all stations)",

  y: {
    label: "↑ Fish caught per survey",
    grid: true
  },

  x: {
    type: "time",
    label: "Survey date",
    tickFormat: "%b %Y"
  },

  color: {
    label: "Species",
    domain: Object.keys(speciesColors),
    range: Object.values(speciesColors)
  },

  marks: [
    Plot.areaY(fishByDateSpecies, {
      x: "date",
      y: "count",
      fill: "species",      // implicit stacking
      tip: true,
      channels: {
        Date: d => d.date.toLocaleDateString(),
        Species: "species",
        "Fish caught": d => d.count
      }
    }),
    
    Plot.ruleY([0])
  ]
})
``` -->

<!-- ```js
Keeping tis just in case.
// =========================
// Q2 DATA PREP: Decline by station & species - % of WORST SEVERITY
// =========================

// 1. Start from surveys; make sure we have station, species, count, year
const surveysDecline = surveys
  .map(d => ({
    ...d,
    date: new Date(d.date),
    year: new Date(d.date).getFullYear()
  }))
  // focus on main two years in the story
  .filter(d => d.year === 2023 || d.year === 2024);

// 2. Average count per (station, species, year)
const avgByStationSpeciesYear = d3.rollups(
  surveysDecline,
  v => d3.mean(v, d => d.count),
  d => d.station_id,   // North, East, South, West
  d => d.species,      // Trout, Bass, Carp
  d => d.year          // 2023 / 2024
);

// 3. Flatten into a tidy table with 2023 vs 2024 metrics
const declineByStationSpecies = [];

for (const [station, speciesGroups] of avgByStationSpeciesYear) {
  for (const [species, yearArr] of speciesGroups) {
    const yearMap = new Map(yearArr);

    const avg2023 = yearMap.get(2023) ?? null;
    const avg2024 = yearMap.get(2024) ?? null;

    if (avg2023 == null || avg2024 == null) continue;

    const declineAbs = avg2024 - avg2023;          // negative if 2024 < 2023
    const declinePct = avg2023 !== 0 ? declineAbs / avg2023 : null;

    // For radar: positive "severity" where bigger = worse decline
    const severity = declinePct != null ? Math.max(0, -declinePct) : 0;

    declineByStationSpecies.push({
      station,
      species,
      avg2023,
      avg2024,
      declineAbs,
      declinePct,   // negative for declines, kept for reference
      severity      // 0–1+ (e.g. 0.7 = 70% decline)
    });
  }
}

// 4. Station order for radar axes (spokes)
const stationOrder = ["North", "East", "South", "West"];

// 5. Max severity for normalization
const maxSeverity = d3.max(declineByStationSpecies, d => d.severity) ?? 0;

// 6. Cardinal angles (degrees): explicit compass mapping
const stationAngle = new Map([
  ["North", 0],
  ["East", 90],
  ["South", 180],
  ["West", 270]
]);

// Helper: drop-in “longitude(key)” like the example code expects
const longitude = (key) => stationAngle.get(key);

// 7. Radar points: one row per (station, species)
//    value normalized so the largest decline ≈ radius 0.5 (to match the example projection)
const points = declineByStationSpecies.map(d => ({
  name: d.species,                                        // group (polygon)
  key: d.station,                                         // axis (station)
  value: maxSeverity > 0 ? (d.severity / maxSeverity) * 0.5 : 0,
  severity: d.severity,
  avg2023: d.avg2023,
  avg2024: d.avg2024,
  declinePct: d.declinePct
}));

// Quick sanity check (optional)
points.slice(0, 5);

```

```js
Plot.plot({
  width: 500,
  height: 500,

  projection: {
    type: "azimuthal-equidistant",
    rotate: [0, -90],
    // max radius ≈ 0.5 + padding for labels
    domain: d3.geoCircle().center([0, 90]).radius(0.625)()
  },

  color: {
    domain: Object.keys(speciesColors), // Trout, Bass, Carp
    range: Object.values(speciesColors),
    legend: true,
    label: "Species"
  },

  marks: [
    // Reference rings (outer to inner looks nicer)
    Plot.geo([0.5, 0.4, 0.3, 0.2, 0.1], {
      geometry: r => d3.geoCircle().center([0, 90]).radius(r)(),
      stroke: "black",
      fill: "black",
      strokeOpacity: 0.3,
      fillOpacity: 0.03,
      strokeWidth: 0.5
    }),

    // Spokes for stations (use stationOrder, not longitude.domain())
    Plot.link(stationOrder, {
      x1: d => longitude(d),
      y1: 90 - 0.57,
      x2: 0,
      y2: 90,
      stroke: "white",
      strokeOpacity: 0.5,
      strokeWidth: 2.5
    }),

    // Ring labels (relative to max decline)
    Plot.text([0.2, 0.35, 0.5], {
      x: 180,
      y: d => 90 - d,
      dx: 2,
      textAnchor: "start",
      text: d => `${Math.round((d / 0.5) * 100)}% of max decline`,
      fill: "currentColor",
      stroke: "white",
      fontSize: 8
    }),

    // Station labels at the ends of spokes
    Plot.text(stationOrder, {
      x: d => longitude(d),
      y: 90 - 0.57,
      text: Plot.identity,
      lineWidth: 5
    }),

    // Radar polygons per species
    Plot.area(points, {
      x1: d => longitude(d.key),
      y1: d => 90 - d.value,
      x2: 0,
      y2: 90,
      fill: "name",
      stroke: "name",
      curve: "cardinal-closed"
    }),

    // Dots at each station–species point
    Plot.dot(points, {
      x: d => longitude(d.key),
      y: d => 90 - d.value,
      fill: "name",
      stroke: "white"
    }),

    // Hover labels
    Plot.text(
      points,
      Plot.pointer({
        x: d => longitude(d.key),
        y: d => 90 - d.value,
        text: d =>
          `${d.name} @ ${d.key}\n` +
          `Avg 2023: ${d.avg2023.toFixed(1)}\n` +
          `Avg 2024: ${d.avg2024.toFixed(1)}\n` +
          (d.declinePct != null
            ? `Decline: ${(d.declinePct * 100).toFixed(1)}%`
            : "Decline: n/a"),
        textAnchor: "start",
        dx: 4,
        fill: "currentColor",
        stroke: "white",
        maxRadius: 10
      })
    )
  ]
})

``` -->
