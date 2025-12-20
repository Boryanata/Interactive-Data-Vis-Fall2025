---
title: "Lab 3: Mayoral Mystery"
toc: false
theme: "cotton"
---


```js
html`<style>
/* Expand the main column */
.observablehq {
  max-width: 1200px !important;    /* increase page width */
}

/* Make markdown cells full-width inside the expanded layout */
.observablehq .cell.markdown {
  max-width: 1100px !important;
}

/* Ensure paragraphs within text divs respect parent width */
.observablehq .cell.markdown > div[style*="max-width"] p,
.observablehq .cell.markdown > div[style*="max-width"] > * {
  max-width: 100%;
  box-sizing: border-box;
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
// Inputs.table(survey)
// Inputs.table(results)
// Inputs.table(events)
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


<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

# Mapping Momentum: 
# A Look at NYC's 2024 Mayoral Campaign
<br>
New York City’s 2024 mayoral race generated a rich trail of data—from district-level election returns to survey responses and months of field activity. This dashboard brings those sources together to provide a clear, citywide view of how the campaign unfolded and where the candidate stands heading into a potential future run.  
Across five boroughs and dozens of community districts, we examine overall performance, geographic and income-based patterns, voter sentiment on key issues, and the reach of Get Out The Vote efforts. By connecting what happened at the polls with how voters felt and where campaign resources were deployed, this analysis highlights the areas where the campaign succeeded and the opportunities for improvement.  
The goal is simple: to convert raw campaign data into strategic insight—supporting smarter decisions and stronger momentum in the next election cycle.

</div>

<br>

<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Citywide Results at a Glance
<br>
The summary below highlights the total number of votes cast for each candidate, their respective vote shares, and the resulting margin of victory or loss. These figures ground the rest of the dashboard, offering a starting point for interpreting geographic patterns, voter sentiment, and the impact of the field campaign. The candidate secured a solid majority, outpacing the opponent by more than ten percentage points citywide. Understanding this top-level result helps frame the geographic and demographic patterns examined in the sections that follow. This snapshot also reveals the magnitude of the citywide lead, offering a clear benchmark against which district-level variations can be compared. With this baseline established, the subsequent visualizations explore how geography, income, and voter sentiment shaped the distribution of support across the city.

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
      background: rgba(254, 254, 254, 0.6);
      border: 1px solid rgba(224, 221, 255, 0.9);
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
        border-top: 1px solid rgba(228, 221, 255, 0.5);
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

<!-- <div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

The candidate secured a solid majority, outpacing the opponent by more than ten percentage points citywide. Understanding this top-level result helps frame the geographic and demographic patterns examined in the sections that follow. This snapshot also reveals the magnitude of the citywide lead, offering a clear benchmark against which district-level variations can be compared. With this baseline established, the subsequent visualizations explore how geography, income, and voter sentiment shaped the distribution of support across the city.
</div> -->

<br>

<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Geographic and Income Patterns in Candidate Support
<br>
This map shows how the candidate’s support varied across New York City’s community districts. Darker shades indicate higher vote share, revealing strongholds in several areas of Brooklyn, the Bronx, and northern Manhattan. Lighter districts tended to favor the opponent or were more competitive overall. The dollar-sign markers overlay income categories, highlighting how electoral support intersected with neighborhood economic conditions. Together, these patterns help identify where the campaign performed well and where additional outreach may be needed.
</div>


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
  width: 1100,
  height: 700,
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

      // LAYER 1.5 — Softening / Matte Overlay 
    Plot.geo(matchedDistricts, {
      fill: "rgba(255,255,255,0.1)", // adjust 0.3–0.6 depending on softness
      stroke: null
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
      fontSize: 10,
      fontWeight: "bold",
      textAnchor: "center",
      dy: 4,

      // --- add halo/stroke ---
      stroke: "white",
      strokeWidth: 2
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
    dy: -10,          // move up closer (was 80)

    fill: "#000000",
    fontSize: 12,
    textAnchor: "start",
    // stroke: "white",
    // strokeWidth: 3
  }
),
  ]
})
```
<br>

<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Voter Sentiment by Policy Issue
<br>
The survey responses reveal clear differences in how voters perceived the candidate’s policy positions. Childcare, affordable housing, and public transit received the strongest levels of agreement, suggesting these messages resonated most consistently across respondents. Small business tax policy showed more mixed views, with a substantial share of neutral or only moderately supportive responses. Police reform displayed the widest spread of opinions, indicating it may be a more polarizing or less clearly communicated issue for the campaign.
<br>
Together, these patterns highlight where the candidate’s platform aligns well with voter priorities and where additional clarification or targeted outreach could strengthen future support. For a future campaign, emphasizing housing and transit in core messaging, while clarifying the candidate’s stance on police reform and small business tax policy, could help convert lukewarm or uncertain voters into more consistent supporters.
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

// Calculate "strongly agree" (score 5) share for each issue and sort
const issueStronglyAgree = issueConfigs.map(({ key, label }) => {
  const rows = survey.filter(d => d[key] != null);
  const total = rows.length || 1;
  const stronglyAgree = rows.filter(d => d[key] === 5).length;
  return {
    label,
    stronglyAgreeShare: stronglyAgree / total
  };
});

// Sort issues by strongly agree share (descending - highest at top)
const sortedIssues = issueStronglyAgree
  .sort((a, b) => b.stronglyAgreeShare - a.stronglyAgreeShare)
  .map(d => d.label);

issueDist.slice(0, 10); // quick check
```

```js
Plot.plot({
  width: 820,
  height: 310,
  marginLeft: 170,
  marginRight: 30,
  marginTop: 50,
  marginBottom: 50,

  title: "Issue Alignment",
  // subtitle: "How Voters Felt About Key Issues",

  x: {
    label: "Share of responses →",
    grid: true,
    tickFormat: d3.format(".0%"),
    domain: [0, 1]
  },

  y: {
    label: null,
    domain: sortedIssues // order by "strongly agree" share (highest at top)
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
<br>

<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Does familiarity with the candidate affect how positively voters view the campaign’s key issues?
<br>

Across most issues, respondents who had not heard of the candidate actually report slightly higher average alignment with the campaign’s policies than those who were already aware. The gap is most pronounced on childcare, housing, transit, and small business tax policy, where the “not aware” bar extends further to the right than the “aware” bar. Only on police reform do aware respondents rate the candidate’s position marginally higher.

This pattern suggests that the policies themselves are reasonably appealing in the abstract, but that knowing the candidate does not automatically boost perceived alignment—and may even introduce more skepticism or mixed feelings. For a future campaign, this points to a different challenge than simple name recognition: the candidate may need to focus on how they are framed and talked about, so that increased awareness reinforces, rather than dampens, the positive reaction many voters have to the policy agenda itself.

</div>

<!-- This outcome MAKES ABSOLUTELY NO SENSE. confirmed the raw averages, numbers are correct. Spent hours on it so I'm keeping it :-) -->

<!-- ```js
issueConfigs.map(({key, label}) => {
  const aware = survey.filter(d => d.heard_of_candidate === "Yes" && d[key] != null);
  const unaware = survey.filter(d => d.heard_of_candidate === "No" && d[key] != null);

  return {
    issue: label,
    aware_avg: d3.mean(aware, d => d[key]),
    unaware_avg: d3.mean(unaware, d => d[key]),
    aware_n: aware.length,
    unaware_n: unaware.length
  };
})
``` -->

```js
// === DATA PREP: Average alignment by awareness (stacked rows) ===

const awareSimple = issueConfigs.flatMap(({ key, label }) => {
  const yesRows = survey.filter(
    d => d[key] != null && d.heard_of_candidate === "Yes"
  );
  const noRows = survey.filter(
    d => d[key] != null && d.heard_of_candidate === "No"
  );

  return [
    {
      issue: label,
      aware: "Aware",
      avg: d3.mean(yesRows, d => d[key]),
      issueAware: `${label} — Aware`
    },
    {
      issue: label,
      aware: "Not aware",
      avg: d3.mean(noRows, d => d[key]),
      issueAware: `${label} — Not aware`
    }
  ];
});

// Order: keep same issue order as your earlier chart, if available
const awarenessIssueOrder =
  typeof sortedIssues !== "undefined" && sortedIssues.length
    ? sortedIssues
    : issueConfigs.map(d => d.label);

// Build y-domain: Aware row, then Not aware row for each issue
// const awareYDomain = [];
// for (const issue of awarenessIssueOrder) {
//   awareYDomain.push(`${issue} — Aware`);
//   awareYDomain.push(`${issue} — Not aware`);
// }
// Build y-domain: Aware, Not aware, then an empty spacer row for each issue
const awareYDomain = [];
for (const issue of awarenessIssueOrder) {
  awareYDomain.push(`${issue} — Aware`);
  awareYDomain.push(`${issue} — Not aware`);
  awareYDomain.push(`${issue} — `);  // spacer row: label intentionally blank
}
```

```js
html`${Plot.plot({
  width: 820,
  height: 35 * awareYDomain.length,   // a bit shorter so rows sit closer
  marginLeft: 230,
  marginRight: 80,
  marginTop: 40,
  marginBottom: 50,

  title: "Variation in Policy Alignment by Candidate Awareness", 

  x: {
    label: "Average alignment (1–5) →",
    domain: [1, 5],
    grid: true
  },

//   y: {
//   label: null,
//   domain: awareYDomain,
//   type: "band",
//   paddingInner: 0.2,   // more gap between rows
//   paddingOuter: 0.15,  // a bit of breathing room top/bottom
//   tickFormat: d =>
//     d.endsWith("— Aware") ? d.replace(" — Aware", "") : ""
// },

  // y: {
  //   label: null,
  //   domain: awareYDomain,
  //   type: "band",
  //   paddingInner: 0.02,   // very small gap between rows
  //   paddingOuter: 0.15,
  //   tickFormat: d => d.endsWith("— Aware") ? d.replace(" — Aware", "") : ""
  // },

  y: {
  label: null,
  domain: awareYDomain,
  type: "band",
  paddingInner: 0.01,
  paddingOuter: 0.15,

  // ✅ Only draw ticks for the “Aware” rows
  ticks: awareYDomain.filter(d => d.endsWith("— Aware")),

  // And show a clean issue name on those ticks
  tickFormat: d => d.replace(" — Aware", "")
},

  color: {
    domain: ["Aware", "Not aware"],
    range: ["#595959", "#b3b3b3"],
    label: "Heard of candidate?"
  },

  marks: [
    // neutral reference line
    Plot.ruleX([2.5], {
      stroke: "#aaaaaa",
      strokeDasharray: "4,4",
      opacity: 0.7
    }),

    // bars from 1 → avg (so they don’t start before the 1 tick)
    Plot.barX(awareSimple, {
      x1: 1,
      x2: "avg",
      y: "issueAware",
      fill: "aware",
      inset: 2,
      tip: d =>
        `${d.issue}
${d.aware}: ${d.avg.toFixed(2)} (1–5)`
    }),

    // labels to the right of each bar: Aware / Not aware
    Plot.text(awareSimple, {
      x: d => d.avg + 0.05,
      y: "issueAware",
      text: "aware",
      fill: "#555555",
      textAnchor: "start",
      fontSize: 10
    })
  ]
})}`
```

<br>

<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Do Campaign Efforts Drive Turnout? A Two-Part Look
<br>

### *GOTV Knocking vs. Turnout*
The first scatterplot compares turnout with the intensity of door knocking, measured as GOTV doors knocked per 1,000 registered voters in each district. While there is a slight upward trend, the relationship is weak: districts with extensive door knocking did not consistently achieve higher turnout, and some districts with very little GOTV effort still posted some of the highest turnout levels.

### *Candidate Hours vs. Turnout*
The second scatterplot shows a noticeably stronger relationship between candidate hours spent in a district and turnout. Districts where the candidate spent more time generally saw higher turnout, with several high-engagement districts reaching turnout rates above 70–80%. This suggests that the candidate’s personal presence may have been more closely aligned with voter mobilization than the GOTV program alone. 
</div>

```js
// ---- GOTV vs turnout ----
const gotvTurnout = results.map(d => {
  const totalVoters = d.total_registered_voters ?? 0;

  return {
    ...d,
    doors_per_1k: totalVoters > 0
      ? d.gotv_doors_knocked / (totalVoters / 1000)
      : null,
    turnout_pct: d.turnout_rate
  };
}).filter(d => d.doors_per_1k != null && d.turnout_pct != null);


// ---- Candidate hours vs turnout ----
const hoursTurnout = results
  .map(d => ({
    ...d,
    hours: d.candidate_hours_spent,
    turnout_pct: d.turnout_rate
  }))
  .filter(d => d.hours != null && d.turnout_pct != null);
```

```js
html`
<div style="
  display: flex;
  gap: 40px;
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 20px;
">

  <!-- ========================== -->
  <!-- PLOT 1: Doors knocked vs turnout -->
  <!-- ========================== -->
  <div>
    ${Plot.plot({
      width: 450,
      height: 360,
      marginLeft: 60,
      marginRight: 20,
      marginTop: 50,
      marginBottom: 50,

      title: "GOTV Knocking vs. Turnout",
      x: {
        label: "Doors knocked per 1,000 voters →",
        grid: true
      },
      y: {
        label: "Turnout rate (%) ↑",
        grid: true
      },

      marks: [
        // dots
        Plot.dot(gotvTurnout, {
          x: "doors_per_1k",
          y: "turnout_pct",
          r: 4,
          fill: "#555555",
          stroke: "white",
          strokeWidth: 0.7,
          tip: d =>
            [
              `District: ${d.boro_cd}`,
              `Turnout: ${d.turnout_pct.toFixed(1)}%`,
              `Doors knocked: ${d3.format(",")(d.gotv_doors_knocked)}`,
              `Registered voters: ${d3.format(",")(d.total_registered_voters)}`,
              `Doors per 1,000: ${d.doors_per_1k.toFixed(1)}`
            ].join("\n")
        }),

        // trendline
        Plot.linearRegressionY(gotvTurnout, {
          x: "doors_per_1k",
          y: "turnout_pct",
          stroke: "#999999",
          strokeWidth: 1.5
        })
      ]
    })}
  </div>


  <!-- ========================== -->
  <!-- PLOT 2: Candidate hours vs turnout -->
  <!-- ========================== -->
  <div>
    ${Plot.plot({
      width: 450,
      height: 360,
      marginLeft: 60,
      marginRight: 20,
      marginTop: 50,
      marginBottom: 50,

      title: "Candidate Hours vs. Turnout",
      x: {
        label: "Candidate hours spent →",
        grid: true
      },
      y: {
        label: "Turnout rate (%) ↑",
        grid: true
      },

      marks: [
        // dots
        Plot.dot(hoursTurnout, {
          x: "hours",
          y: "turnout_pct",
          r: 4,
          fill: "#555555",
          stroke: "white",
          strokeWidth: 0.7,
          tip: d =>
            [
              `District: ${d.boro_cd}`,
              `Turnout: ${d.turnout_pct.toFixed(1)}%`,
              `Candidate hours: ${d.hours}`
            ].join("\n")
        }),

        // trendline
        Plot.linearRegressionY(hoursTurnout, {
          x: "hours",
          y: "turnout_pct",
          stroke: "#999999",
          strokeWidth: 1.5
        })
      ]
    })}
  </div>

</div>
`
```
<br>

<div style="max-width: 820px; margin: 1rem 0 1.5rem 1rem; font-size: 1.05rem; line-height: 1.45;">

## Key Takeaways and Next Steps
<br>
This analysis points to a campaign with clear momentum but uneven support across the city. Three themes stand out:

- **Strong policy resonance on childcare, housing and transit.** These issues show the highest levels of agreement in the survey data, suggesting they should remain at the core of the candidate’s message.
- **Uneven geographic performance by income and district.** Some districts combine strong vote share and turnout, while others lag—particularly in [lower/higher]-income areas where the map shows weaker support.
- **Mixed reactions to small business tax and police reform.** These topics appear more polarizing or less clearly understood, with a wider spread of responses.

For a future campaign, a targeted strategy that:
1) doubles down on childcare, housing and transit as signature issues,  
2) devotes more field time and GOTV resources to underperforming districts, and  
3) refines messaging around small business tax, and police reform  

will be key to turning today’s baseline support into a more durable winning coalition.

</div>


<!-- CODE THAT DIDN'T MAKE IT TO THE POST BUT I'LL KEEP ANYWAY -->
<!-- ```js
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
``` -->
<!-- ```js
// PLOT 1: Doors knocked vs turnout
Plot.plot({
  width: 900,
  height: 360,
  marginLeft: 70,
  marginRight: 30,
  marginTop: 60,
  marginBottom: 55,

  title: "Does GOTV Knocking Boost Turnout?",
  x: {
    label: "GOTV doors knocked per 1,000 registered voters →",
    grid: true
  },
  y: {
    label: "Turnout rate (%) ↑",
    grid: true
  },

  marks: [
    Plot.dot(gotvTurnout, {
      x: "doors_per_1k",
      y: "turnout_pct",
      r: 4,
      fill: "#555555",
      stroke: "white",
      strokeWidth: 0.7,
      tip: d =>
        [
          `District: ${d.boro_cd}`,
          `Turnout: ${d.turnout_pct.toFixed(1)}%`,
          `Doors knocked: ${d3.format(",")(d.gotv_doors_knocked)}`,
          `Registered voters: ${d3.format(",")(d.total_registered_voters)}`,
          `Doors per 1,000 voters: ${d.doors_per_1k.toFixed(1)}`
        ].join("\n")
    }),
    Plot.linearRegressionY(gotvTurnout, {
      x: "doors_per_1k",
      y: "turnout_pct",
      stroke: "#999999",
      strokeWidth: 1.5
    })
  ]
})
```
```js
// PLOT 2: Candidate hours vs turnout
Plot.plot({
  width: 900,
  height: 360,
  marginLeft: 70,
  marginRight: 30,
  marginTop: 40,
  marginBottom: 55,

  title: "Does Candidate Time on the Ground Boost Turnout?",
  x: {
    label: "Candidate hours spent in district →",
    grid: true
  },
  y: {
    label: "Turnout rate (%) ↑",
    grid: true
  },

  marks: [
    Plot.dot(hoursTurnout, {
      x: "hours",
      y: "turnout_pct",
      r: 4,
      fill: "#555555",
      stroke: "white",
      strokeWidth: 0.7,
      tip: d =>
        [
          `District: ${d.boro_cd}`,
          `Turnout: ${d.turnout_pct.toFixed(1)}%`,
          `Candidate hours: ${d.hours}`
        ].join("\n")
    }),
    Plot.linearRegressionY(hoursTurnout, {
      x: "hours",
      y: "turnout_pct",
      stroke: "#999999",
      strokeWidth: 1.5
    })
  ]
})
``` -->

