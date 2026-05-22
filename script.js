let map, marker;
let alarmTime = null;

/* ================= CLOCK ================= */
setInterval(() => {
let now = new Date();

document.getElementById("time").innerText =
now.toLocaleTimeString();

document.getElementById("date").innerText =
now.toDateString();

}, 1000);

/* ================= MAP INIT ================= */
function initMap() {
map = L.map("map").setView([52.2297, 21.0122], 6); // Warsaw default

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
attribution: "© OpenStreetMap"
}).addTo(map);
}

initMap();

/* ================= GPS FIXED ================= */
function useGPS() {

if (!navigator.geolocation) {
alert("Geolocation not supported");
loadWeather(52.2297, 21.0122);
return;
}

/* ⏱ timeout FIX */
navigator.geolocation.getCurrentPosition(
pos => {

let lat = pos.coords.latitude;
let lon = pos.coords.longitude;

map.setView([lat, lon], 10);

if (marker) map.removeLayer(marker);
marker = L.marker([lat, lon]).addTo(map);

loadWeather(lat, lon);

},
err => {
console.log("GPS denied or failed");

alert("GPS not allowed → using default location (Warsaw)");

loadWeather(52.2297, 21.0122);
},
{
enableHighAccuracy: true,
timeout: 8000,
maximumAge: 0
}
);
}

/* ================= CITY SEARCH ================= */
async function searchCity() {

let city = document.getElementById("cityInput").value;

if (!city) return;

let res = await fetch(
`https://nominatim.openstreetmap.org/search?format=json&q=${city}`
);

let data = await res.json();

if (!data.length) {
alert("City not found");
return;
}

let lat = data[0].lat;
let lon = data[0].lon;

map.setView([lat, lon], 10);

if (marker) map.removeLayer(marker);
marker = L.marker([lat, lon]).addTo(map);

loadWeather(lat, lon);
}

/* ================= WEATHER FIXED (IMPORTANT) ================= */
const API = "PUT_YOUR_OPENWEATHER_KEY_HERE";

async function loadWeather(lat, lon) {

try {

let url =
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API}`;

let res = await fetch(url);
let data = await res.json();

if (!data.main) throw new Error("No weather data");

document.getElementById("temp").innerText =
Math.round(data.main.temp) + "°C";

document.getElementById("desc").innerText =
data.weather[0].description;

/* iPhone-style icons */
let w = data.weather[0].main.toLowerCase();

let icon = "☀️";
if (w.includes("cloud")) icon = "☁️";
if (w.includes("rain")) icon = "🌧";
if (w.includes("snow")) icon = "❄️";
if (w.includes("fog")) icon = "🌫";

document.getElementById("icon").innerText = icon;

} catch (e) {

console.log(e);
document.getElementById("desc").innerText =
"Weather unavailable";

document.getElementById("temp").innerText =
"--°C";
}
}

/* ================= AUTO START (FIX) ================= */
window.onload = () => {
useGPS(); // ⬅️ автоматично запускає гео + погоду
};

/* ================= TIMER ================= */
let timer, t = 0;

function startTimer() {

clearInterval(timer);

t = document.getElementById("minutes").value * 60;

timer = setInterval(() => {

let m = Math.floor(t / 60);
let s = t % 60;
if (s < 10) s = "0" + s;

document.getElementById("timer").innerText = m + ":" + s;

if (t <= 0) {
clearInterval(timer);
alert("Time finished!");
}

t--;

}, 1000);
}

/* ================= ALARM ================= */
function setAlarm() {
alarmTime = document.getElementById("alarm").value;
}

setInterval(() => {

if (!alarmTime) return;

let now = new Date().toTimeString().slice(0, 5);

if (now === alarmTime) {
alert("ALARM!");
alarmTime = null;
}

}, 1000);