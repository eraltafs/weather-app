const express = require("express");
const cookieParser = require("cookie-parser");
const Redis = require("ioredis");
const cors = require("cors");
require("dotenv").config();

const { authentication } = require("./middleware/authentication");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.routes");

const app = express();
app.use(cors());
const redis = new Redis();

app.use(express.json());
app.use(cookieParser());
app.use("/user", userRouter);

app.get("/weather", async (req, res) => {
  const { city } = req.query;

  try {
    const cachedWeatherData = await redis.get(city);
    if (cachedWeatherData) {
      const weatherData = JSON.parse(cachedWeatherData);
      res.json({ weather: weatherData });
    } else {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.api}&cnt=50`
      );
      const data = await response.json();
      if (data.cod !== "200") {
        const errorMessage = data.message || "Failed to fetch weather data";
        res.status(400).json({ error: errorMessage });
        return;
      }

      const forecastData = {};
      data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0]; // Extracting date from date-time string
        if (!forecastData[date]) {
          forecastData[date] = {
            temperature: Math.floor(item.main.temp - 273.15),
            temperature_minimum: Math.floor(item.main.temp_min - 273.15),
            temperature_maximum: Math.round(item.main.temp_max - 273.15),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            date: date,
          };
        } else {
          if (item.main.temp_min < forecastData[date].temperature_min) {
            forecastData[date].temperature_min = item.main.temp_min - 273.15;
          }
          if (item.main.temp_max > forecastData[date].temperature_max) {
            forecastData[date].temperature_max = item.main.temp_max - 273.15;
          }
        }
      });
      wind =data.list[0].wind.speed;
      const sunriseTimestamp = data.city.sunrise;
      const sunsetTimestamp = data.city.sunset;

      const sunriseTime = new Date(sunriseTimestamp * 1000).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );

      const sunsetTime = new Date(sunsetTimestamp * 1000).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );

      const weatherData = {
        city: data.city.name,
        country: data.city.country,
        current: {
          wind,
          sunrise: sunriseTime,
          sunset: sunsetTime,
          humidity: data.list[0].main.humidity,
          temperature: Math.floor(data.list[0].main.temp - 273.15),
          temperature_min: Math.floor(data.list[0].main.temp_min - 273.15),
          temperature_max: Math.floor(data.list[0].main.temp_max - 273.15),
          description: data.list[0].weather[0].description,
        },
        forecast: Object.values(forecastData),
      };

      await redis.set(city, JSON.stringify(weatherData), "EX", 30);

      console.log(data.list[0].weather);
      res.json({ weather: weatherData });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.listen(8000, async () => {
  try {
    await connection;
    console.log("Connected to the database");
  } catch (err) {
    console.log("Something went wrong");
  }
  console.log("listening on port 8000");
});
