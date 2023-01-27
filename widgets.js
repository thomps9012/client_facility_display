"use strict";

export const renderSlider = (sorted_dates) => {
  const start = sorted_dates[0];
  const end = sorted_dates[sorted_dates.length - 1];
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
};

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

export const renderCheckBox = (location) => {
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
