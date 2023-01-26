import json_records from "./db/formatted_records.json";
const retrieveRecords = (start, end, locations) =>
  new Promise((resolve, reject) => {
    const response_records = [];
    const date_arr = [];
    locations.forEach((location) => {
      const first_filter = json_records.filter(
        ({ LOCATION }) => LOCATION === location
      );
      first_filter.map((record) => {
        const dates = Object.keys(record).slice(2);
        dates.forEach((date) => {
          if (
            new Date(start) <= new Date(date) &&
            new Date(date) <= new Date(end)
          ) {
            date_arr.push(
              new Date(date).getFullYear() +
                "-" +
                (new Date(date).getMonth() + 1)
            );
            response_records.push({
              location: record.LOCATION,
              date:
                new Date(date).getFullYear() +
                "-" +
                (new Date(date).getMonth() + 1),
              client_count: record[date],
            });
          }
        });
      });
    });
    const date_labels = date_arr.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    const reduced_records = [];
    response_records.map(({ date, client_count, location }) => {
      const index = reduced_records.findIndex(
        (i) => i.x == date && i.z == location
      );
      if (index >= 0) {
        reduced_records[index].y += client_count;
        reduced_records[index].record_count++;
      } else {
        reduced_records.push({
          x: date,
          y: client_count,
          z: location,
          record_count: 1,
        });
      }
    });
    const avg_bar = [];
    reduced_records.map(({ x, y, z, record_count }) => {
      const index = avg_bar.findIndex((i) => i.location == z);
      if (index >= 0) {
        avg_bar[index].data.push({ x, y: Math.floor(y / record_count) });
      } else {
        avg_bar.push({
          location: z,
          data: [
            {
              x,
              y: Math.floor(y / record_count),
            },
          ],
        });
      }
    });
    const total_line = [];
    avg_bar.forEach(({ data }) => {
      data.map(({ x, y }) => {
        const index = total_line.findIndex((i) => i.x == x);
        if (index >= 0) {
          total_line[index].y += y;
        } else {
          total_line.push({ x, y });
        }
      });
    });
    const total_pie = [];
    avg_bar.forEach(({ data, location }) => {
      const total = data.reduce((acc, obj) => (acc += obj.y), 0);
      total_pie.push({ location: location, total: total });
    });
    resolve({
      date_labels: date_labels,
      bar_records: avg_bar,
      line_records: total_line,
      pie_records: total_pie,
    });
  });

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
  const records = await retrieveRecords(start_date, end_date, locations).then(
    (res) => res.json()
  );
  // fetch("/api/records", {
  //   method: "GET",
  //   headers: {
  //     start: start_date,
  //     end: end_date,
  //     locations: JSON.stringify(locations),
  //   },
  // }).then((res) => res.json());
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
const generateColor = () => {
  const color_array = [
    "rgb(248 113 113)",
    "rgb(249 115 22)",
    "rgb(252 211 77)",
    "rgb(163 230 53)",
    "rgb(74 222 128)",
    "rgb(52 211 153)",
    "rgb(22 78 99)",
    "rgb(190 24 93)",
  ];
  const index = Math.floor(Math.random() * color_array.length);
  return color_array[index];
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
