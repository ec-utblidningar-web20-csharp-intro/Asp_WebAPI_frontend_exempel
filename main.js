const topLeft = { lon: 10.2545, lat: 56.5498 };
const bottomRight = { lon: 14.1957, lat: 57.8154 };
const mapboxToken =
  "pk.eyJ1IjoiYmpvcm4tc3Ryb21iZXJnIiwiYSI6ImNrbmtiMDk5czA5Zm4ycHBtcGZtZWcxYnMifQ.cUxPUwyuobn9PMPo_8JnSw";

const mapUrl =
  "https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/" +
  `[${topLeft.lon},${topLeft.lat},${bottomRight.lon},${bottomRight.lat}]/` +
  "1080x640@2x" +
  `?access_token=${mapboxToken}`;

const img = document.querySelector("#map");
img.src = mapUrl;

const rect = img.getBoundingClientRect();
const lon2px = rect.width / (bottomRight.lon - topLeft.lon);
const lat2px = rect.height / (bottomRight.lat - topLeft.lat);
const px2lon = 1.0 / lon2px;
const px2lat = 1.0 / lat2px;

/*
{
  "message": "string",
  "longitude": 0,
  "latitude": 0,
  "id": 0
}
*/
function addHtmlAtLonLat(html, lon, lat) {
  const parent = document.querySelector("main");
  parent.insertAdjacentHTML("beforeend", html);

  child = parent.lastChild;
  child.style.left = (lon - topLeft.lon) * lon2px + "px";
  child.style.top = (lat - topLeft.lat) * lat2px + "px";

  return child;
}

function addGeoMessage(geoMessage) {
  const lon = geoMessage.longitude;
  const lat = geoMessage.latitude;

  addHtmlAtLonLat(
    /*html*/ `
        <div class="message">
            <p>${geoMessage.message}</p>
            <p>Lon: ${lon}, Lat: ${lat}</p>
        </div>`,
    lon,
    lat
  );
}

/*
{
  "message": "string",
  "longitude": 0,
  "latitude": 0,
  "id": 0
}
*/
function addNewGeoMessageForm(lon, lat) {
  form = addHtmlAtLonLat(
    /*html*/ `
        <form class="message">
            <!--<label for="message">Vad vill du säga?</label><br />-->
            <input type="text" id="message" name="message" value="" placeholder="Vad vill du säga?"/><br />

            <label for="longitude">Lon:</label>
            <input type="number" readonly id="longitude" name="longitude" value="${lon}" /><br />
            <label for="latitude">Lat:</label>
            <input type="number" readonly id="latitude" name="latitude" value="${lat}" /><br />

            <input type="submit" value="Skicka" />
        </form>`,
    lon,
    lat
  );

  form.onsubmit = async function (event) {
    event.preventDefault();

    const newGeoComment = {
      message: form.elements.message.value,
      longitude: form.elements.longitude.value,
      latitude: form.elements.latitude.value,
    };

    const response = await fetch("https://localhost:44362/api/GeoComments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(newGeoComment),
    });

    const geoComment = await response.json();
    console.log(geoComment);

    form.remove();
    addGeoMessage(geoComment);
  };
}

function clearAllGeoMessages() {
  const parent = document.querySelector("main");

  children = parent.querySelectorAll("div.message");
  for (const child of children) {
    child.remove();
  }
}

async function refreshGeoComments() {
  const response = await fetch("https://localhost:44362/api/GeoComments");
  const geoComments = await response.json();
  console.log(geoComments);

  clearAllGeoMessages();
  for (const geoMessage of geoComments) {
    addGeoMessage(geoMessage);
  }
}

(async function () {
  img.onclick = async function (event) {
    const lon = (event.clientX - rect.left) * px2lon + topLeft.lon;
    const lat = (event.clientY - rect.top) * px2lat + topLeft.lat;

    const noFormExists = document.querySelector("main > form") === null;
    if (noFormExists) {
      addNewGeoMessageForm(lon, lat);
    }
  };

  await refreshGeoComments();
})();
