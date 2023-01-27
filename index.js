// "use strict";

getAllDates().then((dates) => {
  const sorted = dates.map((date) => new Date(date)).sort((a, b) => a - b);
  renderSlider(sorted);
});

getAllLocations().then((locations) => {
  locations.forEach((location) => renderCheckBox(location));
});
