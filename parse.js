// const textPlayers = `1[Carlos](/userAccount/up/178568)\n[Hernandez](/userAccount/up/178568)\n1178568Houston, TX[Houston International Table Tennis Club](/c/p/926)\n25852[Carlos](/userAccount/up/29604)\n[Ko](/userAccount/up/29604)\n51749Honolulu, HI[](/c/p)\n23063[Carlos](/userAccount/up/184038)\n[Quiroz](/userAccount/up/184038)\n1184038[](/c/p)\n22344[Carlos](/userAccount/up/20026)\n[Estrada](/userAccount/up/20026)\n55737Miami, FL[Broward Table Tennis Club](/c/p)\n1165[Carlos](/userAccount/up/5846)\n[Ortiz](/userAccount/up/5846)\n95356Cidra, US[](/c/p)\n0`;
// const textRating = `"![Simply Compete Logo](https://static.usatt.simplycompete.com/images/sc-logo-dark-small.png)\n\nfor ![](https://static.usatt.simplycompete.com/images/USATT_logo.jpg)\n\n*   LOGIN\n*   NEW ACCOUNT\n*   [Forgot Password?](/forgotPassword/index)\n    \n\n[×](#)\n\n![](https://static.usatt.simplycompete.com/images/no-photo-male.jpg)\n\nCarlos Rodriguez\n\nUSATT#: 94585\n\n[Tournament Activity](#)\n [League Activity](#)\n\n**Tournaments**\n\nCurrent Rating\n\n2023\n\nHighest Rating\n\n2119\n\nTournaments\n\n83\n\n14-Dec-1928-Sep-242000Rating18412119\n\n  \n\n**Latest Tournaments Played**\n\n|     | Tournament | Date | Initial Rating | Final Rating |\n| --- | --- | --- | --- | --- |\n|     | [2024 Butterfly September Tournament](/t/tr/15166?uai=6586) | 2024-09-27 - 2024-09-29 | 2049 | [2023](/exp/index?tri=15166&uai=6586) |\n|     | [Ishaka Table Tennis Club 2024 September Open Colossal Round Robin](/t/tr/15153?uai=6586) | 2024-09-14 - 2024-09-14 | 2048 | [2049](/exp/index?tri=15153&uai=6586) |\n|     | [2024 Naples Pong Butterfly August Open](/t/tr/15131?uai=6586) | 2024-08-24 - 2024-08-24 | 1997 | [2048](/exp/index?tri=15131&uai=6586) |\n|     | [2024 Naples Pong Butterfly July Open](/t/tr/15108?uai=6586) | 2024-07-27 - 2024-07-27 | 1957 | [1997](/exp/index?tri=15108&uai=6586) |\n|     | [2024 Butterfly Florida Open](/t/tr/15100?uai=6586) | 2024-07-18 - 2024-07-21 | 2083 | [1957](/exp/index?tri=15100&uai=6586) |\n\n[See more »](/userAccount/trn/6586)\n\n**No league activity.**\n\nLoading…"`;

export function parsePlayers(text) {
    const arr = text.split("\n");
    const players = [];
    for (let i = 0; i < (arr.length - 1) / 3; i++) {
        players.push({
            name: undefined,
            id: undefined,
            usatt: undefined,
            location: undefined,
            club: undefined,
            clubUrl: undefined,
            rating: undefined
        })
    };

    const player = players[0];

    const a = arr[0].split("](");
    const b = arr[1].split("](");
    player.name = a[0].slice(2) + " " + b[0].slice(1);

    const a1 = a[1].split("/userAccount/up/");
    player.id = Number(a1[1].slice(0, -1));

    const c = arr[2].split("[");
    const c1 = c[0].split("");
    let usatt = "";
    for (let i = 0; i < c1.length; i++) {
        const char = c1[i];
        if (isNaN(char)) {
            player.location = c[0].slice(i);
            break;
        } else {
            usatt += char;
        };
    };
    player.usatt = Number(usatt);
    player.location = player.location || null;
    usatt = "";
    if (c[1][0] === "]") {
        player.club = null;
        player.clubUrl = null;
    } else {
        const d = c[1].split("](/c/p");
        player.club = d[0];
        player.clubUrl = "https://usatt.simplycompete.com/c/cp?id=" + d[1].slice(1, -1);
    };

    for (let index = 3; index < arr.length - 1; index += 3) {
        const player = players[index / 3];
        const a = arr[index].split("](");
        const a1 = a[0].split("[");
        const b = arr[index + 1].split("](");
        players[(index / 3) - 1].rating = Number(a1[0].split((index / 3) + 1).slice(0, -1).join((index / 3) + 1));
        player.name = a1[1] + " " + b[0].slice(1);

        const a2 = a[1].split("/userAccount/up/");
        player.id = Number(a2[1].slice(0, -1));

        const c = arr[index + 2].split("[");
        const c1 = c[0].split("");
        let usatt = "";
        for (let i = 0; i < c1.length; i++) {
            const char = c1[i];
            if (isNaN(char)) {
                player.location = c[0].slice(i);
                break;
            } else {
                usatt += char;
            };
        };
        player.usatt = Number(usatt);
        player.location = player.location || null;
        usatt = "";
        if (c[1][0] === "]") {
            player.club = null;
            player.clubUrl = null;
        } else {
            const d = c[1].split("](/c/p");
            player.club = d[0];
            player.clubUrl = "https://usatt.simplycompete.com/c/cp?id=" + d[1].slice(1, -1);
        };
    };

    players[players.length - 1].rating = Number(arr[arr.length - 1]);
    return players;
};

export function parseRating(text) {
    const arr = text.split("| [");
    const a = arr[1].split("](");
    const a1 = a[0];
    const a2 = a[1].split(" | ");
    const a3 = Number(a2[a2.length - 1].trim());
    const b = Number(arr[2].split("](")[0]);
    return {
        lastTournament: a1,
        prevRating: a3,
        currRating: b,
        ratingDiff: b - a3
    };
};