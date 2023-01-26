import json_records from "./db/formatted_records.json";
const getAllDates = () =>
  new Promise((resolve, reject) => {
    const unique_dates = [];
    json_records.map((month) => {
      const keys = Object.keys(month);
      let dates = keys.slice(2);
      unique_dates.push(...dates);
    });
    const res_dates = unique_dates.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    resolve(res_dates);
  });
getAllDates()
  .then((res) => res.json())
  .then((dates) => {
    const sorted = dates.map((date) => new Date(date)).sort((a, b) => a - b);
    const start = sorted[0];
    const end = sorted[sorted.length - 1];
    $("#date-slider").slider({
      range: true,
      min: start.getTime() / 1000,
      max: end.getTime() / 1000,
      step: 86400,
      values: [start.getTime() / 1000, end.getTime() / 1000],
      slide: function (e, ui) {
        const [start_date, end_date] = ui.values;
        $("#display-start").val(new Date(start_date * 1000).toDateString());
        $("#display-end").val(new Date(end_date * 1000).toDateString());
      },
    });
    $("#display-start").val(
      new Date($("#date-slider").slider("values", 0) * 1000).toDateString()
    );
    $("#display-end").val(
      new Date($("#date-slider").slider("values", 1) * 1000).toDateString()
    );
  });

const titleCase = (location) => {
  const array = location.split(" ");
  const titled = array
    .map((word) => {
      switch (word) {
        case "IOP":
        case "ODRC":
          return word;
        default:
          return word.slice(0, 1) + word.slice(1).toLowerCase();
      }
    })
    .join(" ");
  return titled;
};

const renderCheckBox = (location) => {
  const id = location.split(" ").join("-");
  const div = $("<div>");
  div.attr("class", "location-select p-2 col-4 d-flex justify-content-start");
  div.attr("id", `${id}`);
  div.html(`
  <input
  class="form-check-input fs-2 d-none"
  type="checkbox"
  data-label="${id}-box"
  id="${id}-box"
  value="${location}"
  checked
/>
  <label class="form-check-label px-3 mb-1 fs-2" data-label="${id}-label" for="${id}-box" id="${id}-label">
  ${titleCase(location)}
  </label>
`);
  $("#location-select").append(div);
};

const getAllLocations = () =>
  new Promise((resolve, reject) => {
    const all_locations = json_records.map(({ LOCATION }) => LOCATION);
    const unique_locations = all_locations.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    resolve(unique_locations);
  });
getAllLocations()
  .then((res) => res.json())
  .then((locations) => {
    locations.forEach((location) => renderCheckBox(location));
  });
