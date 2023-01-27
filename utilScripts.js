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
  const records = await retrieveRecords(start_date, end_date, locations);
  return records;
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
