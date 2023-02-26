const key1 = config.KEY1;
const key2 = config.KEY2;

// Select DOM Elements
const form = document.querySelector(".form");
const startingEl = document.querySelector(".starting-point");
const destinationEl = document.querySelector(".destination-point");
const submitFormEl = document.querySelector(".submit-form");
const startingDiv = document.querySelector(".starting-div");
const destinationDiv = document.querySelector(".destination-div");
const suggestions = document.querySelectorAll(".suggestion");
const directionInner = document.querySelector(".dir-inner");

let map;
let narratives = [];

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

  const obj = {
    locations: [start, destination],
    options: {
      maxRoutes: 2,
      compactResults: true,
    },
  };

  const getRoute = () => {
    const request = new Request(
      `https://www.mapquestapi.com/directions/v2/route?key=${key1}`,
      {
        method: "POST",
        body: JSON.stringify(obj),
      }
    );
    request.json().then((data) => {
      directions.route(data);
    });
  };
  getRoute();

  const getNarrative = async () => {
    const response = await fetch(
      `https://www.mapquestapi.com/directions/v2/route?key=${key1}`,
      {
        method: "POST",
        body: JSON.stringify(obj),
      }
    );
    const responseObj = await response.json();
    const narrativeList = responseObj.route.legs[0].maneuvers;
    narratives = [];
    narrativeList.forEach((nar) => {
      narratives.push(nar.narrative);
    });
    console.log(narratives);

    let html = ``;
    narratives.forEach((nar) => {
      html += `
      <p class="dir-el">
          ${nar}
      </p>`;
    });
    directionInner.innerHTML = html;
  };
  getNarrative();

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

const suggestStartingPoint = async () => {
  let query = startingEl.value;
  const searchCity = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&type=city&format=json&apiKey=${key2}`
  );
  const searchStreet = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&type=street&format=json&apiKey=${key2}`
  );
  const cityData = await searchCity.json();
  const streetData = await searchStreet.json();
  if (startingEl.value.length > 2 && cityData && streetData) {
    startingEl.classList.add("bottom-radius");
    startingDiv.classList.add("open");
  }
  if (startingEl.value.length === 0) {
    startingEl.classList.remove("bottom-radius");
    startingDiv.classList.remove("open");
  }
  suggestions[0].placeholder = cityData.results[0].formatted;
  suggestions[1].placeholder = streetData.results[0].formatted;
  suggestions[2].placeholder = streetData.results[1].formatted;
};

const suggestDestinationPoint = async () => {
  let query = destinationEl.value;
  const searchCity = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&type=city&format=json&apiKey=${key2}`
  );
  const searchStreet = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&type=street&format=json&apiKey=${key2}`
  );
  const cityData = await searchCity.json();
  const streetData = await searchStreet.json();

  if (destinationEl.value.length > 2 && cityData && streetData) {
    destinationEl.classList.add("bottom-radius");
    destinationDiv.classList.add("open");
  }
  if (destinationEl.value.length === 0) {
    destinationEl.classList.remove("bottom-radius");
    destinationDiv.classList.remove("open");
  }
  suggestions[3].placeholder = cityData.results[0].formatted;
  suggestions[4].placeholder = streetData.results[0].formatted;
  suggestions[5].placeholder = streetData.results[1].formatted;
};

// Listen Event
startingEl.addEventListener("keydown", suggestStartingPoint);
destinationEl.addEventListener("keydown", suggestDestinationPoint);

suggestions.forEach((el) =>
  el.addEventListener("click", () => {
    if (Array.prototype.indexOf.call(suggestions, el) < 3) {
      startingEl.value = el.placeholder;
      startingEl.classList.remove("bottom-radius");
      startingDiv.classList.remove("open");
    } else {
      destinationEl.value = el.placeholder;
      destinationEl.classList.remove("bottom-radius");
      destinationDiv.classList.remove("open");
    }
  })
);
