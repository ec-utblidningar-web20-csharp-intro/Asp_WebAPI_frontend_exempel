const topLeft = { lon: 10.2545, lat: 56.5498 };
const bottomRight = { lon: 14.1957, lat: 57.8154 };

const mapUrl =
  "https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/" +
  `[${topLeft.lon},${topLeft.lat},${bottomRight.lon},${bottomRight.lat}]/` +
  "1080x640@2x" +
  "?access_token=pk.eyJ1IjoiYmpvcm4tc3Ryb21iZXJnIiwiYSI6ImNrbmtiMDk5czA5Zm4ycHBtcGZtZWcxYnMifQ.cUxPUwyuobn9PMPo_8JnSw";

const img = document.querySelector("#map");
img.src = mapUrl;

const rect = img.getBoundingClientRect();
const lon2px = rect.width / (bottomRight.lon - topLeft.lon);
const lat2px = rect.height / (bottomRight.lat - topLeft.lat);

/*
{
  "message": "string",
  "longitude": 0,
  "latitude": 0,
  "id": 0
}
*/
function addGeoMessage(geoMessage) {
  const lon = geoMessage.longitude;
  const lat = geoMessage.latitude;

  let parent = document.querySelector("main");
  parent.insertAdjacentHTML(
    "beforeend",
    /*html*/ `
        <div class="message">
            <p>${geoMessage.message}</p>
            <p>Lon: ${lon}, Lat: ${lat}</p>
        </div>`
  );

  child = parent.querySelector("div:last-child");
  child.style.left = (lon - topLeft.lon) * lon2px + "px";
  child.style.top = (lat - topLeft.lat) * lat2px + "px";
}

(async function () {
  let response = await fetch("https://localhost:44362/api/GeoComments");
  let geoComments = await response.json();

  console.log(geoComments);
  for (const geoMessage of geoComments) {
    addGeoMessage(geoMessage);
  }
})();
