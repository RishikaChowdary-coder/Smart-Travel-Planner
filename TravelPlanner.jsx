import React, { useState } from "react";
import "./TravelPlanner.css";

/* ---------- Activity data (expand as you like) ---------- */
/* Each activity has: name, cost (₹), estHours, difficulty */
const POOLS = {
  adventure: [
    { name: "Mountain Trekking", cost: 2500, hours: 6, diff: "Hard" },
    { name: "River Rafting", cost: 1800, hours: 4, diff: "Medium" },
    { name: "Zipline Adventure", cost: 2000, hours: 2, diff: "Medium" },
    { name: "Desert Safari", cost: 2200, hours: 5, diff: "Medium" },
    { name: "Scuba Diving", cost: 4000, hours: 4, diff: "Hard" },
    { name: "Kayaking", cost: 900, hours: 3, diff: "Easy" },
    { name: "ATV Ride", cost: 1300, hours: 2, diff: "Medium" },
    { name: "Rock Climbing", cost: 1200, hours: 3, diff: "Hard" },
    { name: "Wildlife Safari", cost: 2100, hours: 6, diff: "Medium" },
    { name: "Caving Expedition", cost: 1500, hours: 4, diff: "Hard" },
  ],
  sightseeing: [
    { name: "City Highlights Tour", cost: 800, hours: 4, diff: "Easy" },
    { name: "Famous Museum Visit", cost: 700, hours: 3, diff: "Easy" },
    { name: "Scenic Boat Ride", cost: 900, hours: 2, diff: "Easy" },
    { name: "Local Heritage Walk", cost: 300, hours: 2, diff: "Easy" },
    { name: "Panoramic Viewpoint", cost: 450, hours: 1.5, diff: "Easy" },
    { name: "Architectural Tour", cost: 600, hours: 3, diff: "Easy" },
    { name: "Cultural Performance", cost: 1000, hours: 2.5, diff: "Easy" },
    { name: "Historic Fort Entry", cost: 350, hours: 2, diff: "Easy" },
    { name: "Botanical Garden Visit", cost: 150, hours: 2, diff: "Easy" },
    { name: "Observation Deck", cost: 700, hours: 2, diff: "Easy" },
  ],
  food: [
    { name: "Street Food Tour", cost: 600, hours: 3, diff: "Easy" },
    { name: "Fine Dining Experience", cost: 2500, hours: 2, diff: "Easy" },
    { name: "Cooking Class", cost: 1800, hours: 3.5, diff: "Medium" },
    { name: "Night Food Market", cost: 500, hours: 3, diff: "Easy" },
    { name: "Seafood Special", cost: 1500, hours: 2, diff: "Easy" },
    { name: "Bakery & Pastry Walk", cost: 300, hours: 1.5, diff: "Easy" },
    { name: "Market-to-Plate Visit", cost: 1200, hours: 3, diff: "Medium" },
    { name: "Chef's Table", cost: 3000, hours: 2.5, diff: "Hard" },
  ],
  relax: [
    { name: "Beach Day & Sunbathing", cost: 0, hours: 6, diff: "Easy" },
    { name: "Luxury Spa & Massage", cost: 2000, hours: 3, diff: "Easy" },
    { name: "Yoga & Meditation", cost: 1200, hours: 2, diff: "Easy" },
    { name: "Resort Pool Day", cost: 1500, hours: 5, diff: "Easy" },
    { name: "Countryside Drive", cost: 300, hours: 4, diff: "Easy" },
    { name: "Stargazing Evening", cost: 0, hours: 2, diff: "Easy" },
    { name: "Thermal Springs", cost: 1300, hours: 3, diff: "Easy" },
  ],
};

/* ---------- helpers ---------- */
function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatINR(n) {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN");
}

/* pick unique activities; if not enough, fill with low-cost filler */
function pickUnique(pool, required) {
  const shuffled = shuffle(pool);
  const chosen = [];
  for (let i = 0; i < required; i++) {
    if (i < shuffled.length) chosen.push(shuffled[i]);
    else chosen.push({ name: "Free / Local exploration", cost: 0, hours: 3, diff: "Easy" });
  }
  return chosen;
}

/* create multiple activities per day (morning/afternoon/evening) without repeating across days */
function buildDailySchedule(pool, days) {
  // for variety, generate many unique activities and then slice per day
  const need = days * 3; // 3 activities per day
  const big = shuffle([...pool, ...pool, ...pool]); // replicate to increase pool
  const unique = [];
  for (let i = 0; i < big.length && unique.length < need; i++) {
    const name = big[i].name;
    if (!unique.some((u) => u.name === name)) unique.push(big[i]);
  }
  // if still less, fill with free exploration
  while (unique.length < need) unique.push({ name: "Free / Local exploration", cost: 0, hours: 3, diff: "Easy" });

  // split into days
  const daysArr = [];
  for (let d = 0; d < days; d++) {
    const slice = unique.slice(d * 3, d * 3 + 3);
    daysArr.push(slice);
  }
  return daysArr;
}

/* ---------- Component ---------- */
export default function TravelPlanner() {
  const [place, setPlace] = useState("");
  const [days, setDays] = useState(3);
  const [category, setCategory] = useState("sightseeing");
  const [budget, setBudget] = useState("");
  const [itinerary, setItinerary] = useState([]); // array of days -> each day: array of activities
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState("");

  const generate = (e) => {
    e && e.preventDefault();
    const n = Math.max(1, Math.floor(Number(days) || 1));
    const userBudget = Math.max(0, Math.floor(Number(budget) || 0));
    const pool = POOLS[category] || POOLS["sightseeing"];
    const daysSchedule = buildDailySchedule(pool, n);

    // compute per-day costs: activity cost + meals(₹500) + transport(₹300)
    const dayObjects = daysSchedule.map((acts, idx) => {
      const activities = acts.map((a) => ({ ...a }));
      const activitiesCost = activities.reduce((s, a) => s + (a.cost || 0), 0);
      const dayExtras = 800; // meals + transport
      return {
        day: idx + 1,
        activities,
        dayCost: activitiesCost + dayExtras,
      };
    });

    let sum = dayObjects.reduce((s, d) => s + d.dayCost, 0);

    // if user set a budget and sum > budget, attempt to lower expensive items
    if (userBudget > 0 && sum > userBudget) {
      // strategy: for days sorted by descending dayCost, try replacing the most expensive activity with cheapest available not already used
      let usedNames = new Set();
      dayObjects.forEach((d) => d.activities.forEach((a) => usedNames.add(a.name)));

      const replacements = [...pool].sort((a, b) => a.cost - b.cost); // cheap -> expensive
      // perform a few passes
      for (let pass = 0; pass < 5 && sum > userBudget; pass++) {
        // find the day with largest excess (largest dayCost)
        dayObjects.sort((a, b) => b.dayCost - a.dayCost);
        let replaced = false;
        for (let d of dayObjects) {
          // find the most expensive activity in that day (index)
          let maxIdx = 0;
          for (let i = 1; i < d.activities.length; i++) {
            if ((d.activities[i].cost || 0) > (d.activities[maxIdx].cost || 0)) maxIdx = i;
          }
          // find the cheapest replacement not in usedNames
          let rep = replacements.find((r) => !usedNames.has(r.name));
          if (!rep) rep = { name: "Free / Local exploration", cost: 0, hours: 3, diff: "Easy" };
          // if replacement is cheaper, do swap
          if ((rep.cost || 0) < (d.activities[maxIdx].cost || 0)) {
            // remove old from used, add new
            usedNames.delete(d.activities[maxIdx].name);
            usedNames.add(rep.name);
            // adjust sum
            sum = sum - (d.activities[maxIdx].cost || 0) + (rep.cost || 0);
            d.activities[maxIdx] = { ...rep };
            d.dayCost = d.activities.reduce((s, a) => s + (a.cost || 0), 0) + 800;
            replaced = true;
            if (sum <= userBudget) break;
          }
        }
        if (!replaced) break;
      }
    }

    const finalTotal = dayObjects.reduce((s, d) => s + d.dayCost, 0);
    setItinerary(dayObjects);
    setTotal(finalTotal);
    if (!budget) setMsg("No budget provided — showing suggested plan.");
    else if (finalTotal <= Number(budget)) setMsg(`Great — fits within your budget of ${formatINR(Number(budget))}.`);
    else setMsg(`Note: Plan exceeds your budget (${formatINR(Number(budget))}). We reduced costs where possible.`);
  };

  return (
    <div className="tp-root-2">
      <header className="tp-header-2">
        <div className="tp-header-inner">
          <h1>✈️ Smart Travel Planner</h1>
          <p className="sub">Enter destination, days, budget (₹) and type — we’ll create a varied day-by-day plan.</p>
        </div>
      </header>

      <main className="tp-main-2">
        <form className="tp-form-2" onSubmit={generate}>
          <div className="row">
            <label>
              <div className="label-title">📍 Destination</div>
              <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g., Amsterdam" required />
            </label>

            <label>
              <div className="label-title">🗓 Days</div>
              <input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} required />
            </label>

            <label>
              <div className="label-title">🎯 Category</div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="adventure">Adventure</option>
                <option value="sightseeing">Sightseeing</option>
                <option value="food">Food</option>
                <option value="relax">Relaxation</option>
              </select>
            </label>

            <label>
              <div className="label-title">💰 Budget (₹)</div>
              <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., 50000" />
            </label>
          </div>

          <div className="form-actions">
            <button className="generate-btn">🚀 Generate Itinerary</button>
          </div>
        </form>

        <section className="tp-output-2">
          <div className="summary-row">
            <div className="summary-card">
              <div className="small">Destination</div>
              <div className="big">{place || "—"}</div>
            </div>
            <div className="summary-card">
              <div className="small">Days</div>
              <div className="big">{itinerary.length || days || "—"}</div>
            </div>
            <div className="summary-card">
              <div className="small">Category</div>
              <div className="big">{category}</div>
            </div>
            <div className="summary-card">
              <div className="small">Budget</div>
              <div className="big">{budget ? formatINR(Number(budget)) : "—"}</div>
            </div>
          </div>

          <div className="message">{msg}</div>

          {budget && (
            <div className="progress-wrap">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, (total / (Number(budget) || 1)) * 100)}%`,
                    background: total > Number(budget) ? "#ef4444" : "#10b981",
                  }}
                />
              </div>
              <div className="progress-text">{formatINR(total)} estimated — {budget ? `${Math.round((total / Number(budget)) * 100)}% of budget` : ""}</div>
            </div>
          )}

          <div className="days-grid">
            {itinerary.length === 0 ? (
              <div className="placeholder">No plan yet — fill the form and click Generate</div>
            ) : (
              itinerary.map((day) => (
                <article key={day.day} className={`day-card cat-${category}`}>
                  <div className="day-left">
                    <div className="day-num">Day {day.day}</div>
                    <div className="activities">
                      {day.activities.map((a, i) => (
                        <div key={i} className="activity-row">
                          <div className="act-name">{a.name}</div>
                          <div className="act-meta">
                            <span className="hours">{a.hours}h</span>
                            <span className="diff">{a.diff}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="day-right">
                    <div className="day-cost">{formatINR(day.dayCost)}</div>
                    <div className="day-sub">incl. meals & transport</div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="tp-footer-2">Made with ❤️ — sample planner (expand pools or wire APIs for real data)</footer>
    </div>
  );
}
