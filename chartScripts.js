// "use strict";

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

const generateBarChart = (bar_data, line_data, date_labels) => {
  new Chart($("#bar-line-canvas"), {
    type: "bar",
    data: {
      labels: date_labels.sort(dateCompare).map((label) => dateString(label)),
      datasets: [
        {
          label: "ALL FACILITIES",
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
            borderColor: random_color,
            backgroundColor: random_color,
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
      layout: {
        padding: {
          left: 50,
        },
      },
      plugins: {
        legend: {
          position: "left",
          onClick: () => {},
          labels: {
            font: {
              size: 20,
            },
          },
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
      layout: {
        padding: {
          right: 50,
        },
      },
      plugins: {
        legend: {
          position: "right",
          onClick: () => {},
          labels: {
            font: {
              size: 20,
            },
          },
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
