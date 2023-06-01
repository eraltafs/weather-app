let locationHeading = document.getElementById("loacationspan");
let top_temp = document.getElementById("top_temp");
let top_temptext = document.getElementById("top_temptext");
let top_mintemp = document.getElementById("top_mintemp");
let top_maxtemp = document.getElementById("top_maxtemp");
let sunriseContent = document.getElementById("top_sunrise");
let sunsetContent = document.getElementById("top_sunset");
let humidity = document.getElementById("humidity");
let windspeed = document.getElementById("top_windspeed");
let inputbox = document.getElementById("city");

locationHeading.textContent = "Delhi";
let form = document.querySelector("form");

form.addEventListener("submit", (even) => {
  even.preventDefault();
  let city = form.city.value;
  if (city) {
    let result = getData(city);
    if (result) {
      localStorage.setItem("city", city);
    } else {
      alert("please input valid city");
    }
  } else {
    alert("please input city name");
  }
});
let savebtn = document.getElementById("savebtn");
savebtn.onclick = async () => {
  let city = inputbox.value;
  let temperatureUnit = document.getElementById("temperatureUnit").value;
  if (!localStorage.getItem("token")) {
    alert("please login to save");
    location.href = "./loginsignup.html";
  }
  else if (city && temperatureUnit) {
    let res = await fetch(`http://localhost:8000/user/preferences`, {
      method: "POST",
      body: JSON.stringify({ city, temperatureUnit }),
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    console.log(await res.json());
  } else {
    alert("type city name to save");
  }
};
let prefredlocations = document.getElementById("prefredlocations");
prefredlocations.onchange = () => {
  if (prefredlocations.value) {
    city = prefredlocations.value;
    getData(city);
  }
};
const getPreffred = async () => {
  let res = await fetch(`http://localhost:8000/user/preferences`, {
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });
  let data = await res.json();
  let { locations } = data;
  appendlocations(locations);
 
};
const appendlocations = async (data) => {
  let option = document.createElement("option");
  option.value = "";
  option.innerText = "choose from saved";
  prefredlocations.append(option);
  data.forEach((el) => {
    let option = document.createElement("option");
    option.value = el.city;
    option.innerText = el.city;
    prefredlocations.append(option);
  });
};
window.onload = async () => {
  let city = localStorage.getItem("city") || "delhi";
  inputbox.value = localStorage.getItem("city");
  locationHeading.textContent = localStorage.getItem("city");
  getData(city);
  getPreffred();
};
const getData = async (city) => {
  const res = await fetch(`http://localhost:8000/weather?city=${city}`);
  data = await res.json();
  if (data.error === "city not found") {
    localStorage.setItem("city", "delhi");
    alert("invalid city name, try again please");
    return false;
  }

  weather = data.weather;
  append(data.weather.forecast);
  top_temp.textContent = weather.current.temperature;
  sunriseContent.textContent = weather.current.sunrise;
  sunsetContent.textContent = weather.current.sunset;
  humidity.textContent = weather.current.humidity + "%";
  windspeed.textContent = weather.current.wind + "km/hr";
  top_temptext.textContent = weather.current.description;
  top_mintemp.textContent = weather.current.temperature_min;
  top_maxtemp.textContent = weather.current.temperature_max;
  locationHeading.textContent = city;
  localStorage.setItem("city", city);
  return true;
};
const append = (data) => {
  let forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = null;
  data.forEach((item, i) => {
    if (i !== 0) {
      let dateArray = item.date.split("-");

      let div = document.createElement("div");
      const dateStr = item.date;
      const dateObj = new Date(dateStr);
      const dayName = dateObj.toLocaleString("en-US", { weekday: "short" }); // Short day name (e.g., "Thu")
      const monthName = dateObj.toLocaleString("en-US", { month: "short" }); // Short month name (e.g., "Jun")
      let dayH2 = document.createElement("h2");
      dayH2.textContent = dayName;
      let monthH2 = document.createElement("h2");
      monthH2.textContent = dateArray[2] + " " + monthName;

      let img = document.createElement("img");

      img.src = `https://www.hindustantimes.com/static-content/1m/2022/ht-images/${item.icon}.svg`;
      if (item.icon[2] == "n") {
        img.src = `https://www.hindustantimes.com/static-content/1m/2022/ht-images/${item.icon[0]}${item.icon[1]}d.svg`;
      }

      let temph2 = document.createElement("h2");
      temph2.textContent = item.temperature;

      let min_maxDiv = document.createElement("div");
      min_maxDiv.className = "flexdivs spacing";
      let mindiv = document.createElement("div");
      mindiv.innerHTML = `<i class="fa-solid fa-angle-down"></i><h2>${item.temperature_maximum}</h2>`;
      mindiv.className = "minmaxblur";
      let maxdiv = document.createElement("div");
      maxdiv.innerHTML = `<i class="fa-solid fa-angle-up"></i><h2>${item.temperature_minimum}</h2>`;
      maxdiv.className = "minmaxblur";
      min_maxDiv.append(maxdiv, mindiv);
      div.append(dayH2, monthH2, img, temph2, min_maxDiv);
      forecastContainer.append(div);
    }
  });
};
