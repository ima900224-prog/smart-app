/* =========================
   GLOBAL
========================= */

let map;
let marker;
let alarmTime = null;

const app = document.getElementById("app");

/* =========================
   MOBILE SWIPE
========================= */

let currentPage = 0;
let startX = 0;

if(window.innerWidth <= 768){

document.addEventListener("touchstart",e=>{
startX = e.touches[0].clientX;
});

document.addEventListener("touchend",e=>{

let endX = e.changedTouches[0].clientX;

if(startX - endX > 50){
nextPage();
}

if(endX - startX > 50){
prevPage();
}

});

}

function updateSwipe(){
app.style.transform =
`translateX(-${currentPage * 100}vw)`;
}

function nextPage(){
if(currentPage < 3){
currentPage++;
updateSwipe();
}
}

function prevPage(){
if(currentPage > 0){
currentPage--;
updateSwipe();
}
}

/* =========================
   CLOCK
========================= */

setInterval(()=>{

const now = new Date();

document.getElementById("time").innerText =
now.toLocaleTimeString();

document.getElementById("date").innerText =
now.toDateString();

},1000);

/* =========================
   MAP
========================= */

function initMap(){

map = L.map("map").setView(
[52.2297,21.0122],
6
);

L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
attribution:"© OpenStreetMap"
}
).addTo(map);

}

initMap();

function toggleMap(){

document.getElementById("mapContainer")
.style.display = "flex";

setTimeout(()=>{
map.invalidateSize();
},200);

}

function closeMap(){

document.getElementById("mapContainer")
.style.display = "none";

}

/* =========================
   GPS
========================= */

function useGPS(){

if(!navigator.geolocation){

alert("GPS not supported");

return;
}

navigator.geolocation.getCurrentPosition(

async pos=>{

const lat = pos.coords.latitude;
const lon = pos.coords.longitude;

map.setView([lat,lon],10);

if(marker){
map.removeLayer(marker);
}

marker = L.marker([lat,lon]).addTo(map);

/* CITY NAME */
getCityName(lat,lon);

/* WEATHER */
loadWeather(lat,lon);

},

err=>{

alert(
"Location unavailable. Using Warsaw."
);

loadWeather(
52.2297,
21.0122
);

},

{
enableHighAccuracy:true,
timeout:10000,
maximumAge:0
}

);

}

/* =========================
   SEARCH CITY
========================= */

async function searchCity(){

const city =
document.getElementById("cityInput").value;

if(!city) return;

const response = await fetch(
`https://nominatim.openstreetmap.org/search?format=json&q=${city}`
);

const data = await response.json();

if(data.length === 0){

alert("City not found");

return;
}

const lat = data[0].lat;
const lon = data[0].lon;

map.setView([lat,lon],10);

if(marker){
map.removeLayer(marker);
}

marker = L.marker([lat,lon]).addTo(map);

document.getElementById("cityName")
.innerText = "📍 " + data[0].display_name;

loadWeather(lat,lon);

closeMap();

}

/* =========================
   GET CITY NAME
========================= */

async function getCityName(lat,lon){

try{

const res = await fetch(
`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
);

const data = await res.json();

document.getElementById("cityName")
.innerText =
"📍 " + data.display_name;

}catch(e){

document.getElementById("cityName")
.innerText =
"📍 Location found";

}

}

/* =========================
   WEATHER
========================= */

const API =
"PASTE_YOUR_OPENWEATHER_KEY_HERE";

async function loadWeather(lat,lon){

try{

const url =
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API}`;

const response = await fetch(url);

const data = await response.json();

document.getElementById("temp")
.innerText =
Math.round(data.main.temp) + "°C";

document.getElementById("desc")
.innerText =
data.weather[0].description;

/* ICONS */
const weather =
data.weather[0].main.toLowerCase();

let icon = "☀️";

if(weather.includes("cloud")){
icon = "☁️";
}

if(weather.includes("rain")){
icon = "🌧";
}

if(weather.includes("snow")){
icon = "❄️";
}

if(weather.includes("fog")){
icon = "🌫";
}

document.getElementById("icon")
.innerText = icon;

changeBackground(weather);

}catch(e){

document.getElementById("desc")
.innerText =
"Weather unavailable";

}

}

/* =========================
   BACKGROUND
========================= */

function changeBackground(weather){

const body = document.body;

if(weather.includes("rain")){

body.style.background =
"linear-gradient(180deg,#334155,#0f172a)";

}

else if(weather.includes("cloud")){

body.style.background =
"linear-gradient(180deg,#6b7280,#111827)";

}

else{

body.style.background =
"linear-gradient(180deg,#1e3a8a,#0b1220)";

}

}

/* =========================
   TIMER
========================= */

let timer;
let time = 0;

function startTimer(){

clearInterval(timer);

time =
document.getElementById("minutes").value * 60;

timer = setInterval(()=>{

let minutes =
Math.floor(time / 60);

let seconds = time % 60;

if(seconds < 10){
seconds = "0" + seconds;
}

document.getElementById("timer")
.innerText =
minutes + ":" + seconds;

if(time <= 0){

clearInterval(timer);

document.getElementById("sound").play();

alert("Timer finished!");

}

time--;

},1000);

}

/* =========================
   ALARM
========================= */

function setAlarm(){

alarmTime =
document.getElementById("alarm").value;

document.getElementById("alarmStatus")
.innerText =
"Alarm set: " + alarmTime;

}

setInterval(()=>{

if(!alarmTime) return;

const now =
new Date().toTimeString().slice(0,5);

if(now === alarmTime){

document.getElementById("sound").play();

alert("ALARM!");

alarmTime = null;

document.getElementById("alarmStatus")
.innerText = "Alarm Off";

}

},1000);

/* =========================
   AUTO START
========================= */

window.onload = ()=>{

useGPS();

};
