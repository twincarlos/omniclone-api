export const fetchCache = 'force-no-store';

import dotenv from 'dotenv';
import express from 'express';
import cheerio from 'cheerio';
import FireCrawlApp from '@mendable/firecrawl-js';
import { parseRating, parsePlayers } from './parse.js';

dotenv.config();

const app = express()

app.get('/', (req, res) => {
    return res.json("Welcome to Omniclone API!");
});

app.get('/omnipong/tournaments', async (req, res) => {
    const data = await fetch("https://www.omnipong.com/t-tourney.asp?e=0", {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
    const html = await data.text();
    const $ = cheerio.load(html);

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
            const id = Number(input.attr("onclick").split("&r=")[1].split("'")[0]);
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

app.get('/omnipong/tournament/:tournamentId', async (req, res) => {
    const { tournamentId } = req.params;

    const playersData = await fetch(`https://www.omnipong.com/T-tourney.asp?t=101&r=${tournamentId}`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    }); // fetches data
    const playersHtml = await playersData.text(); // converts data into html text
    const $p = cheerio.load(playersHtml); // loads html text

    if ($p("input.omnipong_blue4").length === 0) {
        return res.json({
            name: $p("center > h3").text().split("-")[0].trim(),
            players: [],
            events: []
        });
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
                                player["rating"] = Number($p(element).text().split("/")[0].trim());
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
                            event["date"] = eventData1[0].split("Scheduled for: ")[1].trim().split("@")[0].trim();
                            event["time"] = eventData1[0].split("Scheduled for: ")[1].trim().split("@")[1].trim() + "M";
                        } else {
                            const eventData2 = eventData1[0].trim(); // event name
                            const eventData3 = eventData1[1].trim().split("Scheduled for: ");
                            const eventData4 = eventData3[0].slice(11); // max slots
                            const eventData5 = eventData3[1].split("@");
                            const eventData6 = eventData5[0].trim(); // date
                            const eventData7 = eventData5[1].trim(); // time
                            event["name"] = eventData2;
                            event["maxSlots"] = Number(eventData4);
                            event["date"] = eventData6;
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
                                event.players[event.players.length - 1]["rating"] = Number($e(element).text().split("/")[0].trim());
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
            const teamEventName = $t(element).children("p").first().text();
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

        // return res.json({
        //     name: $p("center > h3").text().split("-")[0].trim(),
        //     players,
        //     events,
        //     teamEvents: teamsEvents
        // });
        return res.json(events);
    };
});

app.get('/usatt/player-lookup/:keyword', async (req, res) => {
    const { keyword } = req.params;
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    const firecrawl = new FireCrawlApp({ apiKey: FIRECRAWL_API_KEY });
    const scrapeResult = await firecrawl.scrapeUrl(`https://usatt.simplycompete.com/userAccount/s2?citizenship=&gamesEligibility=&gender=&minAge=&maxAge=&minTrnRating=&maxTrnRating=&minLeagueRating=&maxLeagueRating=&state=&region=Any+Region&favorites=&q=${keyword}&displayColumns=First+Name&displayColumns=Last+Name&displayColumns=USATT%23&displayColumns=Location&displayColumns=Home+Club&displayColumns=Tournament+Rating&pageSize=1000`, {
        formats: ["markdown"],
        onlyMainContent: true,
        includeTags: ["td"]
    });
    const parsedText = parsePlayers(scrapeResult.markdown);
    return res.json(parsedText);
});

app.get('/usatt/get-rating/:playerId', async (req, res) => {
    const { playerId } = req.params;
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    const firecrawl = new FireCrawlApp({ apiKey: FIRECRAWL_API_KEY });
    const scrapeResult = await firecrawl.scrapeUrl(`https://usatt.simplycompete.com/userAccount/up/${playerId}`, {
        formats: ["markdown"],
        onlyMainContent: true
    });
    return res.json(parseRating(scrapeResult.markdown));
});

app.listen(3000, () => console.log(`Example app listening on port ${3000}`));