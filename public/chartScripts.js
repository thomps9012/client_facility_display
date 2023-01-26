const getLocations = () => {
  const location_boxes = $(".form-check-input").toArray();
  const selected_locations = location_boxes
    .filter(({ checked }) => checked == true)
    .map(({ value }) => value);
  return selected_locations;
};

const getDates = () => {
  const start_date = $("#display-start").val();
  const end_date = $("#display-end").val();
  return {
    start_date: new Date(start_date),
    end_date: new Date(end_date),
  };
};
const fetchResults = async (start_date, end_date) => {
  const locations = getLocations();
  const records = await fetch("/api/records", {
    method: "GET",
    headers: {
      start: start_date,
      end: end_date,
      locations: JSON.stringify(locations),
    },
  }).then((res) => res.json());
  return records;
};

const clearCharts = () => {
  $("#pie-canvas").remove();
  $("#bar-line-canvas").remove();
  const new_bar = $("<canvas>");
  new_bar.attr("id", "bar-line-canvas");
  $("#mixed-data-chart").append(new_bar);
  const new_pie = $("<canvas>");
  new_pie.attr("id", "pie-canvas");
  $("#pie-chart").append(new_pie);
};

const dateCompare = (a, b) => {
  const [year_a, month_a] = a.split("-");
  const [year_b, month_b] = b.split("-");
  if (parseInt(year_a) > parseInt(year_b)) {
    return 1;
  }
  if (
    parseInt(year_a) >= parseInt(year_b) &&
    parseInt(month_a) > parseInt(month_b)
  ) {
    return 1;
  }
  return -1;
};
const secondaryCompare = (a, b) => {
  const [year_a, month_a] = a.x.split("-");
  const [year_b, month_b] = b.x.split("-");
  if (parseInt(year_a) > parseInt(year_b)) {
    return 1;
  }
  if (
    parseInt(year_a) >= parseInt(year_b) &&
    parseInt(month_a) > parseInt(month_b)
  ) {
    return 1;
  }
  return -1;
};
const dateString = (date) => {
  const [year, month] = date.split("-");
  switch (parseInt(month)) {
    case 1:
      return `Jan ${year}`;
    case 2:
      return `Feb ${year}`;
    case 3:
      return `Mar ${year}`;
    case 4:
      return `Apr ${year}`;
    case 5:
      return `May ${year}`;
    case 6:
      return `June ${year}`;
    case 7:
      return `July ${year}`;
    case 8:
      return `Aug ${year}`;
    case 9:
      return `Sep ${year}`;
    case 10:
      return `Oct ${year}`;
    case 11:
      return `Nov ${year}`;
    case 12:
      return `Dec ${year}`;
  }
};
const generateColor = () => Math.floor(Math.random() * 16777215).toString(16);

const generateBarChart = (bar_data, line_data, date_labels) => {
  new Chart($("#bar-line-canvas"), {
    type: "bar",
    data: {
      labels: date_labels.sort(dateCompare).map((label) => dateString(label)),
      datasets: [
        {
          label: "Clients Between All Facilities",
          data: line_data
            .sort(secondaryCompare)
            .map(({ x, y }) => ({ x: dateString(x), y: y })),
          type: "line",
          borderDash: [5, 5],
          pointRadius: 0,
          borderJoinStyle: "round",
          borderColor: "#000000",
          backgroundColor: "#fff",
        },
        ...bar_data.map(({ location, data }) => {
          const random_color = generateColor();
          return {
            label: location,
            barThickness: 25,
            borderColor: `#${random_color}`,
            backgroundColor: `#${random_color}`,
            data: data
              .sort(secondaryCompare)
              .map(({ x, y }) => ({ x: dateString(x), y: y })),
          };
        }),
      ],
    },
    options: {
      animations: {
        borderWidth: {
          duration: 1000,
          easing: "linear",
          from: 5,
          to: 0,
          loop: true,
        },
        radius: {
          duration: 1000,
          easing: "linear",
          from: 5,
          to: 0,
          loop: true,
        },
      },
      plugins: {
        legend: {
          position: "left",
          onClick: () => {},
        },
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
      title: {
        text: "Clients By Month and Facility",
      },
    },
  });
};
const generatePieChart = (pie_data) => {
  new Chart($("#pie-canvas"), {
    type: "doughnut",
    data: {
      labels: pie_data.map(({ location }) => location),
      datasets: [
        {
          label: "Total Clients",
          data: pie_data.map(({ total }) => total),
        },
      ],
    },
    options: {
      animations: {
        borderWidth: {
          duration: 1000,
          easing: "linear",
          from: 5,
          to: 0,
          loop: true,
        },
      },
      plugins: {
        legend: {
          position: "right",
          onClick: () => {},
        },
        title: {
          text: "Clients By Facility",
        },
      },
    },
  });
};

const generateCharts = (records) => {
  const { date_labels, bar_records, line_records, pie_records } = records;
  clearCharts();
  generateBarChart(bar_records, line_records, date_labels);
  generatePieChart(pie_records);
};

$("#location-select").click(async (e) => {
  const selector = e.target.dataset.label;
  const label_arr = selector.split("-");
  label_arr.pop();
  const location = label_arr.join("-");
  const label_id = location + "-label";
  const box_id = location + "-box";
  const checked = $("input:checked").toArray();
  if (selector == box_id) {
    !checked.find(({ id }) => id == box_id)
      ? $(`#${label_id}`).attr(
          "class",
          "form-check-label px-3 mb-1 fs-2 text-decoration-line-through"
        )
      : $(`#${label_id}`).attr("class", "form-check-label px-3 mb-1 fs-2");
  } else {
    !checked.find(({ id }) => id == box_id)
      ? $(`#${label_id}`).attr("class", "form-check-label px-3 mb-1 fs-2") &&
        $(`#${box_id}`).attr("checked")
      : $(`#${label_id}`).attr(
          "class",
          "form-check-label px-3 mb-1 fs-2 text-decoration-line-through"
        ) && $(`#${box_id}`).removeProp("checked");
  }
  const { start_date, end_date } = getDates();
  const records = await fetchResults(start_date, end_date);
  generateCharts(records);
});

$("#date-slider").on("slidechange", async (e, ui) => {
  const [start_date, end_date] = ui.values;
  const records = await fetchResults(
    new Date(start_date * 1000),
    new Date(end_date * 1000)
  );
  generateCharts(records);
});

const initialLoad = async () => {
  clearCharts();
  const { start_date, end_date } = getDates();
  const results = await fetchResults(start_date, end_date);
  generateCharts(results);
};

setTimeout(() => initialLoad(), 50);