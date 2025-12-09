---
title: "Lab 3: Mayoral Mystery"
toc: false
theme: "cotton"
---

```js
html`<style>
/* Expand the main column */
.observablehq {
  max-width: 1100px !important;    /* increase page width */
}

/* Make markdown cells full-width inside the expanded layout */
.observablehq .cell.markdown {
  max-width: 1000px !important;
}
</style>`

```

```js
import * as d3 from "npm:d3";
```

<!-- Import Data -->
```js
const nyc = await FileAttachment("data/nyc.json").json();
const results = await FileAttachment("data/election_results.csv").csv({ typed: true });
const survey = await FileAttachment("data/survey_responses.csv").csv({ typed: true });
const events = await FileAttachment("data/campaign_events.csv").csv({ typed: true });

// NYC geoJSON data
// display(nyc)
// // Campaign data (first 10 objects)
// display(results.slice(0,10))
// display(survey.slice(0,10))
// display(events.slice(0,10))
```


```js
// The nyc file is saved in data as a topoJSON instead of a geoJSON. Thats primarily for size reasons -- it saves us 3MB of data. For Plot to render it, we have to convert it back to its geoJSON feature collection. 
const districts = topojson.feature(nyc, nyc.objects.districts)
// display(districts)
```


```js
// INTRO: shared overall election stats

// 1. Compute overall vote totals
const totalCandidate = d3.sum(results, d => d.votes_candidate);
const totalOpponent  = d3.sum(results, d => d.votes_opponent);
const totalVotes     = totalCandidate + totalOpponent;

// 2. Data for the intro bar chart
const overallTotals = [
  { group: "Candidate", votes: totalCandidate },
  { group: "Opponent",  votes: totalOpponent }
];

// 3. Shares (0–1)
const candidateShare = totalVotes > 0 ? totalCandidate / totalVotes : 0;
const opponentShare  = totalVotes > 0 ? totalOpponent  / totalVotes : 0;

// 4. Margin in percentage points (Candidate - Opponent)
const marginPoints = (candidateShare - opponentShare) * 100;

// 5. Formatters
const fmtPercent = d3.format(".1f"); // e.g. 56.2
const fmtNumber  = d3.format(",");   // e.g. 412,345
```

<div style="max-width: 820px; margin: 1.5rem 0 2rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Mapping Momentum: A Citywide Look at the 2024 Campaign
<br>

New York City’s 2024 mayoral race generated a rich trail of data—from district-level election returns to survey responses and months of field activity. This dashboard brings those sources together to provide a clear, citywide view of how the campaign unfolded and where the candidate stands heading into a potential future run.  

Across five boroughs and dozens of community districts, we examine overall performance, geographic and income-based patterns, voter sentiment on key issues, and the reach of Get Out The Vote efforts. By connecting what happened at the polls with how voters felt and where campaign resources were deployed, this analysis highlights the areas where the campaign succeeded and the opportunities for improvement.  

The goal is simple: to convert raw campaign data into strategic insight—supporting smarter decisions and stronger momentum in the next election cycle.

</div>


<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Citywide Results at a Glance
<br>

The summary below highlights the total number of votes cast for each candidate, their respective vote shares, and the resulting margin of victory or loss. These figures ground the rest of the dashboard, offering a starting point for interpreting geographic patterns, voter sentiment, and the impact of the field campaign.

</div>


```js
// Stat card: "How did the candidate do overall?"
html`
  <div
    style="
      max-width: 820px;
      margin: 1.5rem 0 2rem 1rem;
      padding: 1.5rem 2rem;
      border-radius: 16px;
      background: #f9f5ff;
      border: 1px solid #e0ddff;
      box-shadow: 0 6px 18px rgba(0,0,0,0.04);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    "
  >
    <!-- Headline -->
    <div style="margin-bottom: 0.75rem;">
      <div style="font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; color: #6b6b8f; font-weight: 600;">
        Overall Result
      </div>
      <div style="font-size: 1.3rem; font-weight: 700; color: #2b2b3b; margin-top: 0.25rem;">
        Candidate ${
          marginPoints >= 0
            ? `leads by ${fmtPercent(Math.abs(marginPoints))} percentage points`
            : `trails by ${fmtPercent(Math.abs(marginPoints))} percentage points`
        }
      </div>
    </div>

    <!-- Subheadline -->
    <div style="font-size: 0.95rem; color: #4a4a60; margin-bottom: 1.2rem;">
      Across all NYC districts, the candidate received ${
        fmtPercent(candidateShare * 100)
      }% of the total vote, compared to ${
        fmtPercent(opponentShare * 100)
      }% for the opponent.
    </div>

    <!-- Stat row -->
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        gap: 1.25rem;
        border-top: 1px solid #e4e1ff;
        padding-top: 1rem;
      "
    >
      <!-- Candidate -->
      <div style="flex: 1 1 150px; min-width: 150px;">
        <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: #77779a; font-weight: 600;">
          Candidate
        </div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #c21a1c; margin-top: 0.25rem;">
          ${fmtPercent(candidateShare * 100)}%
        </div>
        <div style="font-size: 0.85rem; color: #6a6a80; margin-top: 0.15rem;">
          ${fmtNumber(totalCandidate)} votes
        </div>
      </div>

      <!-- Opponent -->
      <div style="flex: 1 1 150px; min-width: 150px;">
        <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: #77779a; font-weight: 600;">
          Opponent
        </div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #4575b4; margin-top: 0.25rem;">
          ${fmtPercent(opponentShare * 100)}%
        </div>
        <div style="font-size: 0.85rem; color: #6a6a80; margin-top: 0.15rem;">
          ${fmtNumber(totalOpponent)} votes
        </div>
      </div>

      <!-- Total votes -->
      <div style="flex: 1 1 150px; min-width: 150px;">
        <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: #77779a; font-weight: 600;">
          Total votes counted
        </div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #2b2b3b; margin-top: 0.25rem;">
          ${fmtNumber(totalVotes)}
        </div>
        <div style="font-size: 0.85rem; color: #6a6a80; margin-top: 0.15rem;">
          Sum of candidate + opponent votes
        </div>
      </div>
    </div>
  </div>
`
```
<br>

<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## At a Glance: The Race in Numbers
<br>
The bar chart shows the overall balance of votes cast across all community districts. The candidate secured a solid majority, outpacing the opponent by more than ten percentage points citywide. Understanding this top-level result helps frame the geographic and demographic patterns examined in the sections that follow. This snapshot also reveals the magnitude of the citywide lead, offering a clear benchmark against which district-level variations can be compared. With this baseline established, the subsequent visualizations explore how geography, income, and voter sentiment shaped the distribution of support across the city.
</div>

```js
// 3. Simple INTRO bar chart
Plot.plot({
  width: 700,
  height: 320,
  marginLeft: 90,
  marginRight: 40,
  marginTop: 60,
  marginBottom: 50,

  title: "Citywide Vote Totals",
  // subtitle: "Total votes across all NYC districts",

  x: {
    label: "Total votes →",
    grid: true,
    tickFormat: d3.format(",")
  },

  y: {
    label: null,
    domain: ["Candidate", "Opponent"]
  },

  color: {
    legend: true,
    label: "Vote for",
    domain: ["Candidate", "Opponent"],
    range: ["#c21a1c", "#4575b4"]  // red for candidate, blue for opponent
  },

  marks: [
    // Bars
    Plot.barX(overallTotals, {
      x: "votes",
      y: "group",
      fill: "group",
      tip: d =>
        `${d.group}\nTotal votes: ${d3.format(",")(d.votes)}`
    }),

    // Optional: labels at end of bars with % share
    Plot.text(
      overallTotals.map(d => ({
        group: d.group,
        votes: d.votes,
        label: `${(d.votes / (totalCandidate + totalOpponent) * 100).toFixed(1)}%`
      })),
      {
        x: "votes",
        y: "group",
        text: "label",
        dx: 6,
        dy: 3,
        textAnchor: "start",
        fontWeight: "bold"
      }
    ),

    Plot.ruleX([0])
  ]
})
```
<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Geographic and Income Patterns in Candidate Support
<br>
This map shows how the candidate’s support varied across New York City’s community districts. Darker shades indicate higher vote share, revealing strongholds in several areas of Brooklyn, the Bronx, and northern Manhattan. Lighter districts tended to favor the opponent or were more competitive overall. The dollar-sign markers overlay income categories, highlighting how electoral support intersected with neighborhood economic conditions. Together, these patterns help identify where the campaign performed well and where additional outreach may be needed.
</div>
<br>

```js
// =========================
// SECTION 1 DATA PREP
// Candidate performance + income for vote-share map
// =========================

// 1. Add vote share metrics to each district row
const resultsWithShares = results.map(d => {
  const totalVotes = d.votes_candidate + d.votes_opponent;
  const candidateShare =
    totalVotes > 0 ? d.votes_candidate / totalVotes : null;

  return {
    ...d,
    total_votes: totalVotes,
    candidate_vote_share: candidateShare
  };
});

// 2. Overall average candidate vote share (for summaries if you want)
const overallCandidateShare = d3.mean(
  resultsWithShares.filter(d => d.candidate_vote_share != null),
  d => d.candidate_vote_share
);

// 3. Lookup table: boro_cd → result row
const resultsByDistrict = new Map(
  resultsWithShares.map(d => [d.boro_cd, d])
);

// 4. Helper to get the results row for a given geo feature
function getResultForFeature(feature) {
  const props = feature.properties || {};

  // Try multiple property names, then coerce to Number
  let code = props.boro_cd ?? props.BoroCD ?? props.boro_cd_num;
  if (code == null) return undefined;

  const numericCode = +code;
  return resultsByDistrict.get(numericCode);
}

// 5. Performance summaries by income category (optional, for cards/text)
const perfByIncome = d3.rollups(
  resultsWithShares.filter(d => d.candidate_vote_share != null),
  v => ({
    avgCandidateShare: d3.mean(v, d => d.candidate_vote_share),
    avgTurnout: d3.mean(v, d => d.turnout_rate),
    nDistricts: v.length
  }),
  d => d.income_category
).map(([income_category, stats]) => ({
  income_category,
  ...stats
}));

// Sort Low → Middle → High for nicer display
perfByIncome.sort((a, b) => {
  const order = { Low: 0, Middle: 1, High: 2 };
  return (order[a.income_category] ?? 99) - (order[b.income_category] ?? 99);
});

// 6. Vote share range (for color scale)
const shareValues = resultsWithShares
  .map(d => d.candidate_vote_share)
  .filter(v => v != null);

const minShare = d3.min(shareValues);
const maxShare = d3.max(shareValues);

// Round the data range to nice 10-point percentage steps
const lowTick  = Math.floor(minShare * 10) / 10;  // e.g. 0.33 → 0.3
const highTick = Math.ceil(maxShare * 10) / 10;   // e.g. 0.61 → 0.7

// Generate tick values every 10 percentage points
const voteTickValues = d3.range(lowTick, highTick + 0.001, 0.1);
// e.g. [0.3, 0.4, 0.5, 0.6]

// 7. Split NYC districts into matched vs unmatched (for grey fallback)
const matchedDistricts = {
  type: "FeatureCollection",
  features: districts.features.filter(f => getResultForFeature(f))
};

const unmatchedDistricts = {
  type: "FeatureCollection",
  features: districts.features.filter(f => !getResultForFeature(f))
};

// 8. Precompute label points (centroids) for each matched district
const districtLabelPoints = matchedDistricts.features.map(f => {
  const [longitude, latitude] = d3.geoCentroid(f); // lon/lat
  const r = getResultForFeature(f);
  return {
    longitude,
    latitude,
    boro_cd: r?.boro_cd,
    income_category: r?.income_category,
    candidate_vote_share: r?.candidate_vote_share
  };
});

```

<!-- ```js
districts.features[0].properties
``` -->

```js
Plot.plot({
  width: 1500,
  height: 1100,
  marginTop: 40,
  marginRight: 20,
  marginBottom: 40,
  marginLeft: 20,

  title: "Candidate Vote Share Across NYC Districts by Income Level",
  // subtitle: "Red shade shows candidate vote share",
  // subtitle: "$ = Low income  $$ = Middle income  $$$ = High income",

  projection: {
    domain: districts,
    type: "mercator"
  },

  color: {
   type: "linear",
   scheme: "Reds",
   domain: [lowTick, highTick],       // exactly match tick endpoints
   ticks: voteTickValues,             // evenly spaced 0.3, 0.4, 0.5, ...
   tickFormat: d3.format(".0%"),      // show as 30%, 40%, ...
   legend: true,
   label: "Candidate vote share",
   clamp: true                    // values just outside get min/max color
  },

  marks: [

    // LAYER 0 — Districts with NO election data (grey)
    Plot.geo(unmatchedDistricts, {
      fill: "#eeeeee",
      stroke: "#bdbdbd",
      strokeWidth: 0.8,
      tip: d => [
        `District: ${d.properties.boro_cd ?? d.properties.BoroCD ?? "Unknown"}`,
        "No election results in this dataset"
      ].join("\n")
    }),

    // LAYER 1 — Districts WITH election data, colored by candidate vote share
    Plot.geo(matchedDistricts, {
      fill: d => {
        const r = getResultForFeature(d);
        return r ? r.candidate_vote_share : null;  // numeric, drives Reds scale
      },
      stroke: "#000000",
      strokeWidth: 0.5,   // looks crisp on large map
      // stroke: "#ffffff",
      // strokeWidth: 0.8,
      tip: d => {
        const r = getResultForFeature(d);
        if (!r) {
          return [
            `District: ${d.properties.boro_cd ?? d.properties.BoroCD ?? "Unknown"}`,
            "No election results in this dataset"
          ].join("\n");
        }
        return [
          `District: ${r.boro_cd}`,
          `Income category: ${r.income_category}`,
          `Median income: ${d3.format("$,0")(r.median_household_income)}`,
          `Candidate vote share: ${(r.candidate_vote_share * 100).toFixed(1)}%`,
          `Turnout: ${r.turnout_rate.toFixed(1)}%`,
          `Registered voters: ${d3.format(",")(r.total_registered_voters)}`
        ].join("\n");
      }
    }),

    // LAYER 2 — Dollar-sign labels at centroids for income level
    Plot.text(districtLabelPoints, {
      x: "longitude",
      y: "latitude",
      text: d => 
        d.income_category === "Low"    ? "$"   :
        d.income_category === "Middle" ? "$$"  :
        d.income_category === "High"   ? "$$$" : "",

      fill: "#000000",
      fontSize: 14,
      fontWeight: "bold",
      textAnchor: "center",
      dy: 4,

      // --- add halo/stroke ---
      stroke: "white",
      strokeWidth: 3
    }),

// LAYER 3 — Income legend INSIDE the plot (positioned under color scale)
// there must be a cleaner way to have additional legend inside the plot but I couldn't find it
Plot.text(
  [
    {
      label: "Income level\n$ = Low\n$$ = Middle\n$$$ = High"
    }
  ],
  {
    text: d => d.label,
    frameAnchor: "top-left",

    // horizontal shift: align with 20% tick
    dx: -18,          // try 60 first — adjust to 50 or 70 based on your layout

    // vertical shift: just below the color scale
    dy: -5,          // move up closer (was 80)

    fill: "#000000",
    fontSize: 16,
    textAnchor: "start",
    // stroke: "white",
    // strokeWidth: 3
  }
)
  ]
})
```

<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Voter Sentiment by Policy Topic
<br>
The survey responses reveal clear differences in how voters perceived the candidate’s policy positions. Housing and public transit received the strongest levels of agreement, suggesting these messages resonated most consistently across respondents. Childcare and small business tax policy showed more mixed views, with a substantial share of neutral or only moderately supportive responses. Police reform displayed the widest spread of opinions, indicating it may be a more polarizing or less clearly communicated issue for the campaign.
Together, these patterns highlight where the candidate’s platform aligns well with voter priorities and where additional clarification or targeted outreach could strengthen future support.
</div>

```js
// CONFIG: which survey columns correspond to which issues
const issueConfigs = [
  { key: "affordable_housing_alignment", label: "Affordable housing" },
  { key: "public_transit_alignment",     label: "Public transit" },
  { key: "childcare_support_alignment",  label: "Childcare support" },
  { key: "small_business_tax_alignment", label: "Small business tax" },
  { key: "police_reform_alignment",      label: "Police reform" }
];

// Build long-format data: one row per (issue, score)
const issueDist = issueConfigs.flatMap(({ key, label }) => {
  const rows = survey.filter(d => d[key] != null);

  const counts = d3.rollups(
    rows,
    v => v.length,
    d => d[key]  // score 1–5
  )
  .sort((a, b) => a[0] - b[0]); // sort by score

  const total = d3.sum(counts, d => d[1]) || 1;

  return counts.map(([score, count]) => ({
    issue: label,
    score,
    count,
    share: count / total
  }));
});

issueDist.slice(0, 10); // quick check
```

```js
Plot.plot({
  width: 900,
  height: 340,
  marginLeft: 170,
  marginRight: 30,
  marginTop: 50,
  marginBottom: 50,

  title: "Issue Alignment Across the Electorate",
  // subtitle: "How Voters Felt About Key Issues",

  x: {
    label: "Share of responses →",
    grid: true,
    tickFormat: d3.format(".0%"),
    domain: [0, 1]
  },

  y: {
    label: null,
    domain: issueConfigs.map(d => d.label) // keep issues in this order
  },

  color: {
    label: "Agreement score",
    domain: [1, 2, 3, 4, 5],
    range: [ "#e5e5e5", "#cccccc", "#b3b3b3", "#8c8c8c", "#595959" ],  
    legend: true,
    tickFormat: d =>
      d === 1 ? "1 — strongly disagree" :
      d === 2 ? "2 — disagree" :
      d === 3 ? "3 — neutral" :
      d === 4 ? "4 — agree" :
      d === 5 ? "5 — strongly agree" :
      d
 },

  marks: [
    // 100% stacked bar per issue
    Plot.barX(issueDist, {
      x: "share",         // we already normalized shares
      y: "issue",
      fill: "score",
      tip: d =>
        `${d.issue}\n` +
        `Score ${d.score}: ${d.count} responses ` +
        `(${(d.share * 100).toFixed(1)}%)`
    }),

    // Optional reference line at 50%
    // Plot.ruleX([0.5], {
    //   stroke: "#555",
    //   strokeDasharray: "3,3",
    //   opacity: 0.5
    // })
  ]
})

```
<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Key Takeaways
<br>
This analysis shows a campaign with clear momentum but uneven support across the city. Voters responded strongly to the candidate’s housing and transit policies, yet other issues produced more mixed reactions. Election results and turnout patterns reveal both reliable areas of support and districts where outreach lagged. Moving forward, a more targeted strategy—one that amplifies message clarity and strengthens engagement in underperforming districts—will be essential for converting this baseline support into a winning coalition.
</div>

