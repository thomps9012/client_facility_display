const express = require("express");
const path = require("path");
const records = require("./db/formatted_records.json");
const PORT = 3001;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/records", (req, res) => {
  const { start, end, locations } = req.headers;
  const location_arr = JSON.parse(locations);
  const response_records = [];
  const date_arr = [];
  location_arr.forEach((location) => {
    const first_filter = records.filter(
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
            new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1)
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
  res.json({
    date_labels: date_labels,
    bar_records: avg_bar,
    line_records: total_line,
    pie_records: total_pie,
  });
});

app.get("/api/locations", (_, res) => {
  const all_locations = records.map(({ LOCATION }) => LOCATION);
  const unique_locations = all_locations.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
  res.json(unique_locations);
});

app.get("/api/dates", (_, res) => {
  const unique_dates = [];
  records.map((month) => {
    const keys = Object.keys(month);
    let dates = keys.slice(2);
    unique_dates.push(...dates);
  });
  const res_dates = unique_dates.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
  res.json(res_dates);
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
