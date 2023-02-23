const key1 = config.KEY1;
const key2 = config.KEY2;
// Select DOM Elements
const form = document.querySelector(".form");
const startingEl = document.querySelector(".starting-point");
const destinationEl = document.querySelector(".destination-point");
const submitFormEl = document.querySelector(".submit-form");
// const suggestionEl = document.querySelector(".suggestion");

let map;

// Load Default Map
window.onload = () => {
  L.mapquest.key = key1;
  loadMap(52.5163, 13.3777, 13);
  var requestOptions = {
    method: "GET",
  };
};

const loadMap = (lat, lng, zoom) => {
  map = L.mapquest.map("map", {
    center: [lat, lng],
    layers: L.mapquest.tileLayer("map"),
    zoom: zoom,
  });
};

// Implement Submit Form
const submitForm = (event) => {
  event.preventDefault();

  // Delete Current Layer
  map.remove();

  // Get Form Data
  const startingPoint = startingEl.value;
  const destinationPoint = destinationEl.value;

  // Find Route
  findRoute(startingPoint, destinationPoint);

  // Reset Form
  form.reset();
};

// Listen Submit Form Event
form.addEventListener("submit", submitForm);

async function findRoute(start, destination) {
  const res = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${destination}&lang=en&limit=10&type=city&apiKey=${key2}`
  );
  const data = await res.json();
  const lat = data.features[0].properties.lat;
  const lon = data.features[0].properties.lon;

  // Create New Map Layer
  loadMap(lat, lon, 13);

  var directions = L.mapquest.directions();

  directions.route({
    start: start,
    end: destination,
    options: {
      maxRoutes: 2,
      compactResults: true,
    },
  });

  directions.setLayerOptions({
    startMarker: {
      icon: "circle",
      iconOptions: {
        size: "sm",
        primaryColor: "#199f11",
        secondaryColor: "#199f11",
        symbol: "A",
      },
    },
    endMarker: {
      icon: "circle",
      iconOptions: {
        size: "sm",
        primaryColor: "#ba263f",
        secondaryColor: "#ba263f",
        symbol: "B",
      },
    },
    routeRibbon: {
      opacity: 1.0,
      showTraffic: true,
    },
  });
}

// startingEl.addEventListener("change", async function () {
//   let query = startingEl.value;
//   const search = await fetch(
//     `http://www.mapquestapi.com/search/v3/prediction?key=vh9aA8AG9GPx7CKivkGYZJfNxbNKGNz2&limit=5&collection=adminArea,poi,address,category,franchise,airport&q=${query}`
//   );
//   const sData = await search.json();
//   let suggestion = sData.results[0].displayString;
//   suggestionEl.classList.remove("hidden");
//   suggestionEl.placeholder = suggestion;
// });

// suggestionEl.addEventListener("click", () => {
//   suggestionEl.classList.add("hidden");
// });
