const apiKey = "48c179a4f76f1c7d6648a1bd50c85a42";

async function getWeather() {

    const city = document.getElementById("weather-city-input").value.trim();

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        if (data.cod == "404") {
            alert("City not found!");
            return;
        }

        document.getElementById("weather-city-name").innerHTML =
            `${data.name}, ${data.sys.country}`;

        document.getElementById("weather-temp").innerHTML =
            `${data.main.temp} °C`;

        document.getElementById("weather-desc").innerHTML =
            `Weather: ${data.weather[0].description}<br>
             Humidity: ${data.main.humidity}%<br>
             Wind Speed: ${data.wind.speed} m/s`;
             getForecast(city);

        const icon = data.weather[0].main;

        if (icon == "Clear") {
            document.querySelector(".weather-icon").innerHTML = "☀️";
        }
        else if (icon == "Clouds") {
            document.querySelector(".weather-icon").innerHTML = "☁️";
        }
        else if (icon == "Rain") {
            document.querySelector(".weather-icon").innerHTML = "🌧️";
        }
        else if (icon == "Snow") {
            document.querySelector(".weather-icon").innerHTML = "❄️";
        }
        else {
            document.querySelector(".weather-icon").innerHTML = "⛅";
        }

    }
    catch (error) {

        alert("Unable to fetch weather.");

    }

}
async function getForecast(city) {

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        const forecastContainer = document.getElementById("forecast-container");

        forecastContainer.innerHTML = "";

        const dailyForecast = data.list.filter(item =>
            item.dt_txt.includes("12:00:00")
        );

        dailyForecast.forEach(day => {

            const date = new Date(day.dt_txt);

            const dayName = date.toLocaleDateString("en-US", {
                weekday: "short"
            });

            forecastContainer.innerHTML += `
                <div class="forecast-card">
                    <h4>${dayName}</h4>
                    <div class="placeholder-icon small">🌤️</div>
                    <p>${Math.round(day.main.temp)}°C</p>
                </div>
            `;
        });

    } catch (error) {
        console.log(error);
    }

}

document.getElementById("get-weather-btn").addEventListener("click", getWeather);

document.getElementById("weather-city-input").addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        getWeather();
    }

});
