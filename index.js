const PORT = process.env.PORT || 8000;
const express = require('express');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
require('puppeteer-extra-plugin-stealth/evasions/chrome.app')
require('puppeteer-extra-plugin-stealth/evasions/chrome.csi')
require('puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes')
require('puppeteer-extra-plugin-stealth/evasions/chrome.runtime')
require('puppeteer-extra-plugin-stealth/evasions/defaultArgs') // pkg warned me this one was missing
require('puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow')
require('puppeteer-extra-plugin-stealth/evasions/media.codecs')
require('puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency')
require('puppeteer-extra-plugin-stealth/evasions/navigator.languages')
require('puppeteer-extra-plugin-stealth/evasions/navigator.permissions')
require('puppeteer-extra-plugin-stealth/evasions/navigator.plugins')
require('puppeteer-extra-plugin-stealth/evasions/navigator.vendor')
require('puppeteer-extra-plugin-stealth/evasions/navigator.webdriver')
require('puppeteer-extra-plugin-stealth/evasions/sourceurl')
require('puppeteer-extra-plugin-stealth/evasions/user-agent-override')
require('puppeteer-extra-plugin-stealth/evasions/webgl.vendor')
require('puppeteer-extra-plugin-stealth/evasions/window.outerdimensions')
require('puppeteer-extra-plugin-user-preferences');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('@sparticuz/chromium');
puppeteer.use(StealthPlugin());

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
        },
        cache: 'no-store'
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
            details[detailsIndex] = { ...details[detailsIndex], date: new Date($(element).text().split(" - ")[0]).toDateString() }
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

app.get('/tournament/:tournamentId', async (req, res) => {
    const tournamentId = req.params.tournamentId;

    const playersData = await fetch(`https://www.omnipong.com/T-tourney.asp?t=101&r=${tournamentId}`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        cache: 'no-store'
    }); // fetches data
    const playersHtml = await playersData.text(); // converts data into html text
    const $p = cheerio.load(playersHtml); // loads html text

    if ($p("input.omnipong_blue4").length === 0) {
        return new Response(JSON.stringify({
            name: $p("center > h3").text().split("-")[0].trim(),
            players: [],
            events: []
        }));
    } else {
        const players = [];
        const teamsEvents = [];

        $p("center > table").each((index, element) => {
            if (index === 1) {
                $p(element).find("tbody > tr").each((index, element) => {
                    if (index > 0) {
                        const player = {};
                        $p(element).children("td").each((index, element) => {
                            if (index === 0) {
                                const playerName = $p(element).text().slice(1).split(",");
                                player["name"] = `${playerName[1].trim()} ${playerName[0].trim()}`;
                            } else if (index === 3) {
                                player["rating"] = $p(element).text().split("/")[0].trim();
                            };
                        });
                        players.push(player);
                    };
                });
            };
        });

        const eventsData = await fetch(`https://www.omnipong.com/T-tourney.asp?t=102&r=${tournamentId}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        }); // fetches data
        const eventsHtml = await eventsData.text(); // converts data into html text
        const $e = cheerio.load(eventsHtml); // loads html text

        const events = [];
        $e("center > table").each((index, element) => {
            if (index > 0) {
                const trs = $e(element).find("tbody > tr");
                const event = {};
                trs.each((index, element) => {
                    if (index === 0) {
                        const eventData1 = $e(element).children("th").first().text().split(" - ");
                        if (eventData1.length === 1) {
                            event["name"] = eventData1[0].split("Scheduled for: ")[0].trim();
                            event["maxSlots"] = null;
                            event["date"] = new Date(eventData1[0].split("Scheduled for: ")[1].trim().split("@")[0].trim()).toDateString();
                            event["time"] = eventData1[0].split("Scheduled for: ")[1].trim().split("@")[1].trim() + "M";
                        } else {
                            const eventData2 = eventData1[0].trim(); // event name
                            const eventData3 = eventData1[1].trim().split("Scheduled for: ");
                            const eventData4 = eventData3[0].slice(11); // max slots
                            const eventData5 = eventData3[1].split("@");
                            const eventData6 = eventData5[0].trim(); // date
                            const eventData7 = eventData5[1].trim(); // time
                            event["name"] = eventData2;
                            event["maxSlots"] = eventData4;
                            event["date"] = new Date(eventData6).toDateString();
                            event["time"] = eventData7 + "M";
                        };
                    } else if (index > 0 && index < trs.length) {
                        $e(element).children("td").each((index, element) => {
                            if (index === 0) {
                                const playerName = $p(element).text().slice(1).split(",");
                                if (event.players) {
                                    event.players.push({ name: `${playerName[1].trim()} ${playerName[0].trim()}` });
                                } else {
                                    event["players"] = [{ name: `${playerName[1].trim()} ${playerName[0].trim()}` }];
                                };
                            } else if (index === 3) {
                                event.players[event.players.length - 1]["rating"] = $e(element).text().split("/")[0].trim();
                            };
                        })
                    };
                });
                events.push(event);
            };
        });

        const teamsData = await fetch(`https://www.omnipong.com/T-tourney.asp?t=105&r=${tournamentId}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const teamsHTML = await teamsData.text(); // converts data into html text
        const $t = cheerio.load(teamsHTML); // loads html text

        $t("center h4").each((index, element) => {
            const teamEventName = $t(element).children("p").first().text().trim();
            const eventTeams = [];
            $t(element).children("table").first().each((index, element) => {
                $t(element).find("tbody > tr").each((index, element) => {
                    if (index > 0) {
                        const team = {};
                        $t(element).children("td").each((index, element) => {
                            if (index === 0) team["name"] = $t(element).text();
                            if (index === 1) team["rating"] = $t(element).text();
                            if (index === 2) team["members"] = $t(element).text();
                        });
                        eventTeams.push(team);
                    };
                });
            });
            teamsEvents.push({
                eventName: teamEventName,
                eventTeams
            });
        });

        return res.json({
            name: $p("center > h3").text().split("-")[0].trim(),
            players,
            events,
            teamEvents: teamsEvents
        });
    };
});

app.get('/old/usatt/player-lookup/:keyword', async (req, res) => {
    const data = await fetch(`https://usatt.simplycompete.com/userAccount/s2?q=${req.params.keyword}&displayColumns=First+Name&displayColumns=Last+Name&displayColumns=Location&displayColumns=Tournament+Rating&pageSize=1000`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        cache: 'no-store'
    });
    const html = await data.text();
    const $ = cheerio.load(html);

    const players = [];

    $(".list-view > .row > table > tbody > tr").each((index, element) => {
        const player = {};
        $(element).children("td.list-column").each((index, element) => {
            if (index === 2) {
                const elementChild = $(element).children("a").first();
                const split1 = $(elementChild).attr("href").split("/");
                player["firstName"] = $(elementChild).text();
                player["id"] = split1[split1.length - 1];
            } else if (index === 3) {
                player["lastName"] = $(element).children("a").first().text();
            } else if (index === 4) {
                player["location"] = $(element).text();
            } else if (index === 5) {
                player["rating"] = $(element).text();
            };
        });
        players.push(player);
    });

    return res.json(players);
});

app.get('/new/usatt/player-lookup/:keyword', async (req, res) => {
    // const browser = await puppeteer.launch({
    //     args: [
    //         '--no-sandbox',
    //         '--disable-setuid-sandbox',
    //         '--disable-gpu',
    //         '--disable-dev-shm-usage',
    //         '--no-first-run',
    //         '--no-zygote',
    //         '--single-process'
    //     ],
    //     defaultViewport: chromium.defaultViewport,
    //     executablePath: await chromium.executablePath() || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    //     headless: true,
    // });

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'accept-language': 'en-US,en;q=0.9',
        'referer': 'https://usatt.simplycompete.com/',
    });

    const url = `https://usatt.simplycompete.com/userAccount/s2?q=${req.params.keyword}&displayColumns=First+Name&displayColumns=Last+Name&displayColumns=Location&displayColumns=Tournament+Rating&pageSize=1000`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('h4.title');

    const players = await page.evaluate(() => {
        const listItems = document.querySelectorAll("tr.list-item");
        const playerList = [];
        listItems.forEach(listItem => {
            const tds = listItem.querySelectorAll("td.list-column");
            if (tds[1] && tds[2] && tds[3] && tds[4]) {
                playerList.push({
                    url: `https://usatt.simplycompete.com${tds[1].querySelector("a").getAttribute("href")}`,
                    name: `${tds[1].querySelector("a").textContent} ${tds[2].querySelector("a").textContent}`,
                    location: tds[3].textContent,
                    rating: tds[4].textContent
                })
            };
        });
        return playerList;
    });

    await browser.close();
    return res.json(players);
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));