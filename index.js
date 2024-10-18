const PORT = process.env.PORT || 8000;
const express = require('express');
const cheerio = require('cheerio');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');  // Allow all domains
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/tournaments', async (req, res) => {
    const data = await fetch("https://www.omnipong.com/t-tourney.asp?e=0", {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    }); // fetches data
    const html = await data.text(); // converts data into html text
    const $ = cheerio.load(html); // loads html text

    const titles = [];
    $("td.omnipong > center > h3 > p").each((index, element) => {
        titles.push($(element).text().trim());
    });

    const details = [];
    let counter1 = 0;
    $("td.omnipong > center > table > tbody > tr > td").each((index, element) => {
        const detailsIndex = details.length - 1;
        if (counter1 === 0) {
            const input = $(element).children("input").first();
            let inputValue;

            if (input.attr("value") === "Enter") {
                inputValue = "Open";
            } else if (input.attr("value") === "Closed") {
                inputValue = "Closed";
            } else if (input.attr("value") === "Results") {
                inputValue = "Finished"
            } else {
                inputValue = "TBD"
            };
            details.push({ status: inputValue });
        }
        else if (counter1 === 1) {
            const input = $(element).children("input").first();
            const id = input.attr("onclick").split("&r=")[1].split("'")[0];
            details[detailsIndex] = { ...details[detailsIndex], id }
        }
        else if (counter1 === 2) {
            const a = $(element).children("a");
            if (a.length > 0) {
                details[detailsIndex] = { ...details[detailsIndex], pdf: a.attr("href"), name: a.text() }
            } else {
                details[detailsIndex] = { ...details[detailsIndex], name: $(element).text() }
            };
        }
        else if (counter1 === 3) {
            details[detailsIndex] = { ...details[detailsIndex], city: $(element).text() }
        }
        else if (counter1 === 4) {
            details[detailsIndex] = { ...details[detailsIndex], date: $(element).text().split(" - ")[0] }
        }
        else if (counter1 === 5) {
            const a = $(element).children("a").first();
            details[detailsIndex] = { ...details[detailsIndex], contactUrl: $(a).attr("href"), contactName: $(element).text() };
        }
        else if (counter1 === 6) {
            details[detailsIndex] = { ...details[detailsIndex], ballInfo: $(element).text() }
        }
        else if (counter1 === 7) {
            details[detailsIndex] = { ...details[detailsIndex], usattRating: $(element).text() }
            return counter1 = 0;
        };
        return counter1++;
    });

    const numbersOfRowsPerState = [];
    $("td.omnipong > center > table > tbody").each((index, element) => {
        numbersOfRowsPerState.push($(element).children("tr").length - 1);
    });

    let counter2 = 0;
    for (let i = 0; i < numbersOfRowsPerState.length; i++) {
        for (let j = 0; j < numbersOfRowsPerState[i]; j++) {
            details[counter2] = { ...details[counter2], state: titles[i] }
            counter2++;
        };
    };

    const groupedTournaments = [];
    details.forEach(tournament => {
        const currentGroup = groupedTournaments[groupedTournaments.length - 1]?.group;
        if (currentGroup === tournament.state) {
            groupedTournaments[groupedTournaments.length - 1].tournaments.push(tournament);
        } else {
            groupedTournaments.push({
                group: tournament.state,
                tournaments: [tournament]
            });
        };
    });

    return res.json(groupedTournaments);
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
