// app.get('/tournament/:tournamentId', async (req, res) => {
//     const tournamentId = req.params.tournamentId;

//     const playersData = await fetch(`https://www.omnipong.com/T-tourney.asp?t=101&r=${tournamentId}`, {
//         headers: {
//             'Cache-Control': 'no-cache',
//             'Pragma': 'no-cache',
//             'Expires': '0'
//         },
//         cache: 'no-store'
//     }); // fetches data
//     const playersHtml = await playersData.text(); // converts data into html text
//     const $p = cheerio.load(playersHtml); // loads html text

//     if ($p("input.omnipong_blue4").length === 0) {
//         return new Response(JSON.stringify({
//             name: $p("center > h3").text().split("-")[0].trim(),
//             players: [],
//             events: []
//         }));
//     } else {
//         const players = [];
//         const teamsEvents = [];

//         $p("center > table").each((index, element) => {
//             if (index === 1) {
//                 $p(element).find("tbody > tr").each((index, element) => {
//                     if (index > 0) {
//                         const player = {};
//                         $p(element).children("td").each((index, element) => {
//                             if (index === 0) {
//                                 const playerName = $p(element).text().slice(1).split(",");
//                                 player["name"] = `${playerName[1].trim()} ${playerName[0].trim()}`;
//                             } else if (index === 3) {
//                                 player["rating"] = $p(element).text().split("/")[0].trim();
//                             };
//                         });
//                         players.push(player);
//                     };
//                 });
//             };
//         });

//         const eventsData = await fetch(`https://www.omnipong.com/T-tourney.asp?t=102&r=${tournamentId}`, {
//             headers: {
//                 'Cache-Control': 'no-cache',
//                 'Pragma': 'no-cache',
//                 'Expires': '0'
//             }
//         }); // fetches data
//         const eventsHtml = await eventsData.text(); // converts data into html text
//         const $e = cheerio.load(eventsHtml); // loads html text

//         const events = [];
//         $e("center > table").each((index, element) => {
//             if (index > 0) {
//                 const trs = $e(element).find("tbody > tr");
//                 const event = {};
//                 trs.each((index, element) => {
//                     if (index === 0) {
//                         const eventData1 = $e(element).children("th").first().text().split(" - ");
//                         if (eventData1.length === 1) {
//                             event["name"] = eventData1[0].split("Scheduled for: ")[0].trim();
//                             event["maxSlots"] = null;
//                             event["date"] = new Date(eventData1[0].split("Scheduled for: ")[1].trim().split("@")[0].trim()).toDateString();
//                             event["time"] = eventData1[0].split("Scheduled for: ")[1].trim().split("@")[1].trim() + "M";
//                         } else {
//                             const eventData2 = eventData1[0].trim(); // event name
//                             const eventData3 = eventData1[1].trim().split("Scheduled for: ");
//                             const eventData4 = eventData3[0].slice(11); // max slots
//                             const eventData5 = eventData3[1].split("@");
//                             const eventData6 = eventData5[0].trim(); // date
//                             const eventData7 = eventData5[1].trim(); // time
//                             event["name"] = eventData2;
//                             event["maxSlots"] = eventData4;
//                             event["date"] = new Date(eventData6).toDateString();
//                             event["time"] = eventData7 + "M";
//                         };
//                     } else if (index > 0 && index < trs.length) {
//                         $e(element).children("td").each((index, element) => {
//                             if (index === 0) {
//                                 const playerName = $p(element).text().slice(1).split(",");
//                                 if (event.players) {
//                                     event.players.push({ name: `${playerName[1].trim()} ${playerName[0].trim()}` });
//                                 } else {
//                                     event["players"] = [{ name: `${playerName[1].trim()} ${playerName[0].trim()}` }];
//                                 };
//                             } else if (index === 3) {
//                                 event.players[event.players.length - 1]["rating"] = $e(element).text().split("/")[0].trim();
//                             };
//                         })
//                     };
//                 });
//                 events.push(event);
//             };
//         });

//         const teamsData = await fetch(`https://www.omnipong.com/T-tourney.asp?t=105&r=${tournamentId}`, {
//             headers: {
//                 'Cache-Control': 'no-cache',
//                 'Pragma': 'no-cache',
//                 'Expires': '0'
//             }
//         });
//         const teamsHTML = await teamsData.text(); // converts data into html text
//         const $t = cheerio.load(teamsHTML); // loads html text

//         $t("center h4").each((index, element) => {
//             const teamEventName = $t(element).children("p").first().text().trim();
//             const eventTeams = [];
//             $t(element).children("table").first().each((index, element) => {
//                 $t(element).find("tbody > tr").each((index, element) => {
//                     if (index > 0) {
//                         const team = {};
//                         $t(element).children("td").each((index, element) => {
//                             if (index === 0) team["name"] = $t(element).text();
//                             if (index === 1) team["rating"] = $t(element).text();
//                             if (index === 2) team["members"] = $t(element).text();
//                         });
//                         eventTeams.push(team);
//                     };
//                 });
//             });
//             teamsEvents.push({
//                 eventName: teamEventName,
//                 eventTeams
//             });
//         });

//         return res.json({
//             name: $p("center > h3").text().split("-")[0].trim(),
//             players,
//             events,
//             teamEvents: teamsEvents
//         });
//     };
// });