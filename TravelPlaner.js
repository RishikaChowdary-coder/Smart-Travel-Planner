import React, { useState } from "react";
import "./TravelPlanner.css";

export default function TravelPlanner() {
  const [place, setPlace] = useState("");
  const [days, setDays] = useState("");
  const [category, setCategory] = useState("");
  const [plan, setPlan] = useState([]);

  // Sample activity pools
  const activities = {
    adventure: ["Hiking", "River Rafting", "Paragliding", "Safari", "Mountain Trekking"],
    sightseeing: ["City Tour", "Visit Museums", "Historic Landmarks", "Boat Ride", "Local Markets"],
    food: ["Street Food Tour", "Fine Dining", "Local Café Visit", "Cooking Class", "Night Food Market"],
    relax: ["Beach Day", "Spa & Massage", "Yoga Retreat", "Sunset Viewpoint", "Chill at Park"]
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newPlan = [];

    if (!activities[category]) {
      alert("Please select a valid category");
      return;
    }

    for (let i = 1; i <= days; i++) {
      // Pick a random activity for variety
      const activityPool = activities[category];
      const randomActivity = activityPool[Math.floor(Math.random() * activityPool.length)];
      newPlan.push(`Day ${i}: ${randomActivity} in ${place}`);
    }

    setPlan(newPlan);
  };

  return (
    <div className="main-container">
      <h1 className="title">🌍 Travel Planner</h1>
      <form className="form-box" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter destination (e.g. Dubai, Goa)"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Number of days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          <option value="adventure">⛰️ Adventure</option>
          <option value="sightseeing">🏰 Sightseeing</option>
          <option value="food">🍴 Food</option>
          <option value="relax">🌴 Relaxation</option>
        </select>
        <button type="submit">✨ Generate Plan</button>
      </form>

      {plan.length > 0 && (
        <div className="plan-box">
          <h2>📅 Your Itinerary for {place}</h2>
          {plan.map((dayPlan, index) => (
            <div key={index} className="plan-day">
              {dayPlan}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}