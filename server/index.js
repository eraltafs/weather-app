const express = require("express");
const cookieParser = require("cookie-parser");
const Redis = require("ioredis");
require("dotenv").config();

const { authentication } = require("./middleware/authentication");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.routes");

const app = express();
const redis = new Redis();

app.use(express.json());
app.use(cookieParser());
app.use("/user", userRouter);


app.get("/weather", authentication, async (req, res) => {
  const { city } = req.query;

  try {
    const cachedWeatherData = await redis.get(city);
    if (cachedWeatherData) {
      const weatherData = JSON.parse(cachedWeatherData);
      res.json({ weather: weatherData });
    } else {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.api}`
      );
      const data = await response.json();


      if (data.cod !== "200") {
        
        const errorMessage = data.message || "Failed to fetch weather data";
        res.status(400).json({ error: errorMessage });
        return;
      }

      const weatherData = {
        city: data.city.name,
        country: data.city.country,
        current: {
          temperature: data.list[0].main.temp,
          description: data.list[0].weather[0].description,
        },
        forecast: data.list.slice(0).map((item) => ({
          temperature: item.main.temp,
          temperature_min: item.main.temp_min,
          temperature_max: item.main.temp_max,
          description: item.weather[0].description,
          dateTime: item.dt_txt,
        })),
      };

      await redis.set(city, JSON.stringify(weatherData),"EX", 30);

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
