import json_records from "./formatted_records.js";
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

const getAllLocations = () =>
  new Promise((resolve, reject) => {
    const all_locations = json_records.map(({ LOCATION }) => LOCATION);
    const unique_locations = all_locations.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    resolve(unique_locations);
  });

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

export { retrieveRecords, getAllLocations, getAllDates };
