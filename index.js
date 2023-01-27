"use strict";

import { getAllDates, getAllLocations } from "./requests.js";
import { renderCheckBox, renderSlider } from "./widgets.js";
import { getDates, fetchResults } from "./chartScripts.js";

getAllDates()
  .then((res) => res.json())
  .then((dates) => {
    const sorted = dates.map((date) => new Date(date)).sort((a, b) => a - b);
    renderSlider(sorted);
  });

getAllLocations()
  .then((res) => res.json())
  .then((locations) => {
    locations.forEach((location) => renderCheckBox(location));
  });

const initialLoad = async () => {
  clearCharts();
  const { start_date, end_date } = getDates();
  const results = await fetchResults(start_date, end_date);
  generateCharts(results);
};

setTimeout(() => initialLoad(), 50);
