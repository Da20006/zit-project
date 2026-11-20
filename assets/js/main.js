let date = null;

const main = async () => {
    const response = await fetch('/mikuexpolist.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    try {
        const content = await response.json();
        var concerts = [];
        for (const city of content) {
            for (const concert of city.concerts) {
                concerts.push({city: city.name, ...concert});
            }
        }
        concerts.sort((a, b) => Date(a.date)>Date(b.date) ? 1 : -1);
        console.log(concerts);
        const lastConcert =  concerts[0];

        const lastConcertDate = new Date(lastConcert.date + " " + lastConcert.starting_time +":00");
        lastConcertDate.setHours(lastConcertDate.getHours() + 2);
        date = lastConcertDate;
        console.log("xd");
        if (date - new Date() <= 0) {
            document.getElementById("countdown").classList.add("tour-ended");
        } else {
            repeat();
        }

    } catch (error) {
        throw new Error(`Error parsing JSON: ${error.message}`);
    }
    return;
}

const goodFormat = (num) => {
    return num < 10 ? "0" + num : num;
}

const repeat = () => {
    console.log("gg");
    const dateNow = new Date();
    const timeDiff = date - dateNow;
    if (timeDiff <= 0) {
        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
        return;
    }
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    const seconds = Math.floor((timeDiff / 1000) % 60);
    document.getElementById("days").textContent = goodFormat(days);
    document.getElementById("hours").textContent = goodFormat(hours);
    document.getElementById("minutes").textContent = goodFormat(minutes);
    document.getElementById("seconds").textContent = goodFormat(seconds);
    setTimeout(repeat, 1000-(dateNow.getMilliseconds()));
}
main();