---
title: "Lab 2: Subway Staffing (Test)"
toc: true
theme: "cotton"
---

<!-- Import Data -->
```js
const incidents = await FileAttachment("./data/incidents.csv").csv({ typed: true })
const local_events = await FileAttachment("./data/local_events.csv").csv({ typed: true })
const upcoming_events = await FileAttachment("./data/upcoming_events.csv").csv({ typed: true })
const ridership = await FileAttachment("./data/ridership.csv").csv({ typed: true })
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

# Question 2: Station Response Time Comparison

```js
// Calculate average response time by station using group transform
const stationResponseGroups = Plot.group(incidents, {
  x: "station",
  y: "response_time_minutes"
})

const stationResponseTimes = Array.from(stationResponseGroups, ([station, values]) => ({
  station,
  avgResponseTime: values.reduce((sum, d) => sum + d.response_time_minutes, 0) / values.length,
  incidentCount: values.length
})).sort((a, b) => a.avgResponseTime - b.avgResponseTime)

// Calculate overall mean for annotation
const overallMeanResponse = incidents.reduce((sum, d) => sum + d.response_time_minutes, 0) / incidents.length
```

```js
Plot.plot({
  width: 900,
  height: 500,
  marginLeft: 120,
  marginTop: 30,
  marginBottom: 50,
  title: "Average Response Time by Station",
  subtitle: "Stations ranked by average incident response time (lower is better)",
  x: {
    label: "Average Response Time (minutes)",
    grid: true
  },
  y: {
    label: "Station",
    domain: stationResponseTimes.map(d => d.station),
    tickFormat: d => d.length > 20 ? d.substring(0, 20) + "..." : d
  },
  marks: [
    // Bars showing average response time
    Plot.barX(
      stationResponseTimes,
      {
        x: "avgResponseTime",
        y: "station",
        fill: d => d.avgResponseTime < overallMeanResponse ? "#4caf50" : "#f44336",
        fillOpacity: 0.7,
        tip: d => [
          `Station: ${d.station}`,
          `Avg Response: ${d.avgResponseTime.toFixed(2)} min`,
          `Total Incidents: ${d.incidentCount}`
        ].join("\n")
      }
    ),
    
    // Mean line annotation
    Plot.ruleX([overallMeanResponse], {
      stroke: "#ff9800",
      strokeWidth: 2,
      strokeDasharray: "4,2",
      tip: () => `Overall Mean: ${overallMeanResponse.toFixed(2)} minutes`
    }),
    
    // Mean label
    Plot.text(
      [`Mean: ${overallMeanResponse.toFixed(1)} min`],
      {
        x: overallMeanResponse,
        y: stationResponseTimes[stationResponseTimes.length - 1].station,
        dx: 5,
        fill: "#ff9800",
        fontSize: 11,
        fontWeight: "bold",
        anchor: "start"
      }
    )
  ]
})
```

### Analysis: Best and Worst Performing Stations

The visualization above ranks all 25 stations by their average response time to incidents. **Green bars** indicate stations performing better than the overall mean, while **red bars** show stations that need improvement.

**Best Performing Stations** (fastest response times):
- Stations with green bars and response times below the mean line
- These stations consistently respond to incidents quickly

**Worst Performing Stations** (slowest response times):
- Stations with red bars extending far to the right
- These stations require attention to improve their response capabilities

# Question 3: Staffing Needs for Summer 2026

```js
// Aggregate upcoming events by station using group transform
const upcomingEventsGroups = Plot.group(upcoming_events, {
  x: "nearby_station",
  y: "expected_attendance"
})

const upcomingEventsByStation = Array.from(upcomingEventsGroups, ([station, values]) => ({
  station,
  eventCount: values.length,
  totalExpectedAttendance: values.reduce((sum, d) => sum + d.expected_attendance, 0),
  avgAttendance: values.reduce((sum, d) => sum + d.expected_attendance, 0) / values.length
})).sort((a, b) => b.totalExpectedAttendance - a.totalExpectedAttendance)

// Merge with current staffing
const staffingAnalysis = upcomingEventsByStation.map(d => ({
  ...d,
  currentStaffing: currentStaffing[d.station] || 0,
  eventsPerStaff: d.eventCount / (currentStaffing[d.station] || 1),
  attendancePerStaff: d.totalExpectedAttendance / (currentStaffing[d.station] || 1)
}))

// Top 3 stations needing help
const top3Stations = staffingAnalysis.slice(0, 3)
```

```js
Plot.plot({
  width: 900,
  height: 400,
  marginLeft: 120,
  marginTop: 30,
  marginBottom: 50,
  title: "Summer 2026 Event Load by Station",
  subtitle: "Total expected attendance across all events, ranked by demand",
  x: {
    label: "Total Expected Attendance",
    grid: true,
    tickFormat: d => d >= 1000 ? `${(d/1000).toFixed(0)}k` : d
  },
  y: {
    label: "Station",
    domain: upcomingEventsByStation.map(d => d.station)
  },
  marks: [
    Plot.barX(
      upcomingEventsByStation,
      {
        x: "totalExpectedAttendance",
        y: "station",
        fill: d => top3Stations.some(s => s.station === d.station) ? "#f44336" : "#2196f3",
        fillOpacity: 0.7,
        tip: d => [
          `Station: ${d.station}`,
          `Total Events: ${d.eventCount}`,
          `Total Expected Attendance: ${d.totalExpectedAttendance.toLocaleString()}`,
          `Current Staffing: ${currentStaffing[d.station] || "N/A"}`
        ].join("\n")
      }
    ),
    
    // Highlight top 3
    Plot.text(
      top3Stations.map(d => "⚠️ Priority"),
      {
        x: d => {
          const station = top3Stations.find(s => s.station === d)
          return station ? station.totalExpectedAttendance : 0
        },
        y: d => top3Stations.find(s => s.station === d)?.station,
        dx: 5,
        fill: "#f44336",
        fontSize: 10,
        fontWeight: "bold",
        anchor: "start"
      }
    )
  ]
})
```

### Top 3 Stations Needing Staffing Help

Based on the 2026 event calendar, the following stations are projected to have the highest event-related demand:

```js
top3Stations.map((d, i) => ({
  rank: i + 1,
  station: d.station,
  eventCount: d.eventCount,
  totalAttendance: d.totalExpectedAttendance,
  currentStaffing: d.currentStaffing,
  recommendation: `Increase staffing from ${d.currentStaffing} to at least ${Math.ceil(d.currentStaffing * 1.5)}`
}))
```

### Analysis: Staffing Recommendations

The three stations identified above will face the highest concentration of events and expected attendance during Summer 2026. These stations currently have staffing levels that may be insufficient to handle the projected demand. Recommendations include:

1. **Immediate staffing increases** at these three priority stations
2. **Temporary staffing assignments** during peak event dates
3. **Enhanced coordination** with event organizers for crowd management

# Question 4 (Bonus): Priority Station Recommendation

```js
// Comprehensive analysis combining all factors
const priorityAnalysis = stationResponseTimes.map(rt => {
  const upcoming = upcomingEventsByStation.find(e => e.station === rt.station)
  const stationIncidents = incidents.filter(i => i.station === rt.station)
  const highSeverityCount = stationIncidents.filter(i => i.severity === "high").length
  
  return {
    station: rt.station,
    avgResponseTime: rt.avgResponseTime,
    responseTimeRank: stationResponseTimes.findIndex(s => s.station === rt.station) + 1,
    upcomingEventCount: upcoming?.eventCount || 0,
    upcomingAttendance: upcoming?.totalExpectedAttendance || 0,
    currentStaffing: currentStaffing[rt.station] || 0,
    highSeverityIncidents: highSeverityCount,
    totalIncidents: rt.incidentCount,
    priorityScore: (
      (rt.avgResponseTime / 20) * 0.3 + // Response time (higher is worse)
      ((upcoming?.totalExpectedAttendance || 0) / 50000) * 0.4 + // Upcoming demand
      (highSeverityCount / 100) * 0.3 // High severity incidents
    )
  }
}).sort((a, b) => b.priorityScore - a.priorityScore)

const topPriority = priorityAnalysis[0]
```

### Recommended Priority Station

```js
{
  station: topPriority.station,
  reasoning: [
    `Response Time: ${topPriority.avgResponseTime.toFixed(2)} min (ranked ${topPriority.responseTimeRank}/${stationResponseTimes.length})`,
    `Upcoming Events: ${topPriority.upcomingEventCount} events with ${topPriority.upcomingAttendance.toLocaleString()} expected attendees`,
    `High Severity Incidents: ${topPriority.highSeverityIncidents} in historical data`,
    `Current Staffing: ${topPriority.currentStaffing} staff members`,
    `Priority Score: ${topPriority.priorityScore.toFixed(3)}`
  ]
}
```

**Recommendation:** The station identified above should be the top priority for increased staffing because it combines:

1. **High Event Demand**: Multiple events scheduled with high expected attendance
2. **Response Time Concerns**: Average response time that ranks among the slower stations
3. **Historical Risk**: High-severity incidents in the historical data indicating complex operational challenges
4. **Current Capacity**: Staffing levels that may be insufficient for projected demand

This station represents the intersection of high future demand, historical operational challenges, and current staffing constraints, making it the most critical candidate for staffing increases.



