const regionNames = new Intl.DisplayNames(["cs"], {type: "region"});
const getWeatherIcon = (code) => {
    switch (code) {case 0:return "☀️";case 1:return "🌤️";case 2:return "⛅";case 3:return "☁️";case 45:case 48:return "🌫️";case 51:case 53:case 55:return "🌦️";case 56:case 57:return "🌧️❄️";case 61:case 63:case 65:return "🌧️";case 66:case 67:return "🌨️";case 71:case 73:case 75:case 77:return "❄️";case 80:case 81:case 82:return "🌦️";case 85:case 86:return "🌨️";case 95:return "⛈️";case 96:case 99:return "⛈️🧊";default:return "❓";}
}
const weatherCheck = async () => {
    const weatherBlocks = document.querySelectorAll(".concert-weather-block");
    for (const block of weatherBlocks) {
        const city = block.dataset.cityWeather;
        const state = block.dataset.cityState;
        const date = block.dataset.concertDate;
        console.log(city);
        try {
            const cityData = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&country_code=${state}`);
            if (!cityData.ok) {
                throw new Error(`HTTP error! status: ${cityData.status}`);
            }
            const cityJson = await cityData.json();
            if (!cityJson.results || cityJson.results.length === 0) {
                throw new Error(`No results found for city: ${city}`);
            }
            const { latitude, longitude } = cityJson.results[0];
            const date2 = new Date(date).toISOString().split('T')[0];
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,weather_code&start_date=${date2}&end_date=${date2}`);
            if (!weatherResponse.ok) {
                throw new Error(`HTTP error! status: ${weatherResponse.status}`);
            }
            const weatherData = await weatherResponse.json();
            const itsToday = new Date(date).toDateString() === new Date().toDateString();
            if (weatherData && itsToday) {
                const weatherCode = weatherData.current.weather_code;
                const currentTemp = weatherData.current.temperature_2m;
                block.children[1].children[0].textContent = getWeatherIcon(weatherCode);
                block.children[1].children[1].children[0].textContent = `${currentTemp.toFixed(0)} °C`;
                block.children[1].children[1].children[1].textContent = `Aktuální počasí`;
            }
            else if (weatherData) {
                const weatherCode = weatherData.daily.weather_code[0];
                const tempMax = weatherData.daily.temperature_2m_max[0];
                const tempMin = weatherData.daily.temperature_2m_min[0];
                block.children[1].children[0].textContent = getWeatherIcon(weatherCode);
                block.children[1].children[1].children[0].textContent = `${((tempMax + tempMin)/2).toFixed(0)} °C`;
                block.children[1].children[1].children[1].textContent = `Max: ${tempMax.toFixed(0)} °C, Min: ${tempMin.toFixed(0)} °C`;
            } else {
                throw new Error(`HTTP error! status: ${weatherResponse.status}`);
            }
        } catch (e) {
            block.children[1].children[0].textContent = "❌";
            block.children[1].children[1].children[0].textContent = "ERROR";
            block.children[1].children[1].children[1].textContent = "Nepodařilo se načíst počasí";
            console.error(`Error fetching weather data for ${city}:`, e);
        }
    }
}

const counter = () => {
    const countdownElements = document.querySelectorAll(".mini-countdown");
    if (countdownElements.length <= 0) {
        return;
    }
    const now = new Date();
    countdownElements.forEach((countdown) => {
        const targetDate = new Date(countdown.dataset.date);
        const timeDiff = targetDate - now;
        if (timeDiff <= 0) {
            countdown.querySelector("[data-unit='days']").textContent = "00";
            countdown.querySelector("[data-unit='hours']").textContent = "00";
            countdown.querySelector("[data-unit='minutes']").textContent = "00";
            countdown.querySelector("[data-unit='seconds']").textContent = "00";
            return;
        }
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDiff / 1000) % 60);
        countdown.querySelector("[data-unit='days']").textContent = goodFormat(days);
        countdown.querySelector("[data-unit='hours']").textContent = goodFormat(hours);
        countdown.querySelector("[data-unit='minutes']").textContent = goodFormat(minutes);
        countdown.querySelector("[data-unit='seconds']").textContent = goodFormat(seconds);
    });
    setTimeout(counter, 1000-(now.getMilliseconds()));
}
const main = async () => {
    const response = await fetch('/mikuexpolist.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    let text = "";
    try {
        const content = await response.json();
        let text = "";
        for (const city of content) {
            text += "<section class=\"city-section\" data-city=\"Brussels\"><div class=\"city-heading-row\"><div class=\"city-badge-wrapper\"><h2 class=\"city-name\">";
            text += city.name;
            text += "</h2></div><span class=\"city-country\">";
            text += regionNames.of(city.state);
            text += "</span></div><div class=\"concerts-grid\">";
            for (const concert of city.concerts) {
                text += "<article class=\"concert-card\" data-concert-id=\"brussels-1\"><div class=\"concert-top\"><div class=\"concert-date-group\"><span class=\"date-day\">";
                const concertDate = new Date(concert.date);
                const options = {day: 'numeric', month: 'long', year: 'numeric'};
                text += concertDate.toLocaleDateString('cs-CZ', options);
                text += "</span><span class=\"date-times\">";
                text += "Začátek: " + concert.starting_time + " (Otevření: " + concert.open_door_time + ", VIP: " + concert.vip_open_door_time + ")";
                text += "</span></div><div class=\"venue-info\"><span class=\"venue-label\">Aréna</span><h3 class=\"venue-name\">";
                text += concert.venue;
                text += "</h3></div></div><div class=\"concert-middle\"><div class=\"concert-timer-block\"><span class=\"block-label\">DO ZAČÁTKU ZBÝVÁ</span>";
                const concertTime =  new Date(concert.date + " " + concert.starting_time + ":00");
                concertTime.setHours(concertTime.getHours()+2);
                const inPast =  concertTime < new Date();
                if (inPast) {
                    text += "<span class=\"timer-ended-text\">Představení již proběhlo</span>";
                } else {
                    concertTime.setHours(concertTime.getHours()-2);
                    text += "<div class=\"mini-countdown\" data-date=\"";
                    text += concertTime.toISOString();
                    text += "\"><div class=\"mini-unit\"><span class=\"mini-val\" data-unit=\"days\">--</span><span class=\"mini-lbl\">Dní</span></div><span class=\"mini-sep\">:</span><div class=\"mini-unit\"><span class=\"mini-val\" data-unit=\"hours\">--</span><span class=\"mini-lbl\">Hod</span></div><span class=\"mini-sep\">:</span><div class=\"mini-unit\"><span class=\"mini-val\" data-unit=\"minutes\">--</span><span class=\"mini-lbl\">Min</span></div><span class=\"mini-sep\">:</span><div class=\"mini-unit\"><span class=\"mini-val\" data-unit=\"seconds\">--</span><span class=\"mini-lbl\">Sek</span></div></div>";
                }
                text += "</div><div class=\"concert-weather-block\" data-city-weather=\"";
                text += city.name;
                text += "\" data-city-state=\"";
                text += city.state;
                text += "\" data-concert-date=\"";
                text += concertDate;
                text += "\"><span class=\"block-label\"> POČASÍ V MÍSTĚ </span><div class=\"weather-box\"><span class=\"weather-icon\" aria-hidden=\"true\"> ⛅ </span><div class=\"weather-text\"><span class=\"weather-temp\"> -- °C </span><span class=\"weather-desc\"> Načítání... </span></div></div></div></div><div class=\"concert-bottom\"><a ";
                text += !inPast ? "href=\"" + concert.ticket_site + "\"" : "disabled";
                text += " target=\"_blank\" rel=\"noopener noreferrer\" class=\"ticket-action-btn "+ (inPast ? "already-happened" : "") +"\"><span>Koupit lístky</span><span class=\"ticket-btn-arrow\" aria-hidden=\"true\">→</span></a></div>"
                text += "</article>";
            }
            text += "</div></section>";
        }
        document.getElementById("tickets-container").innerHTML = text;
        weatherCheck();
        counter();



    } catch (error) {
        document.getElementById("tickets-container").innerHTML = "<div class=\"tickets-error-card\" id=\"tickets-error\"> <div class=\"error-img-wrapper\"> <img src=\"/assets/images/miku_sad.jpg\" alt=\"Nepodařilo se načíst koncerty\" class=\"error-chara-img\"> </div> <div class=\"error-content\"> <span class=\"error-tag\">CHYBA PŘIPOJENÍ</span> <h2 class=\"error-title\">Nepodařilo se načíst koncerty</h2> <p class=\"error-desc\">Miku je sad bo se to nechce načíst :(</p> </div> </div>";
        throw new Error(`Error parsing JSON: ${error.message}`);
    }

    return;
}

const goodFormat = (num) => {
    return num < 10 ? "0" + num : num;
}

main();