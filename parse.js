// const text = `1[Carlos](/userAccount/up/178568)\n[Hernandez](/userAccount/up/178568)\n1178568Houston, TX[Houston International Table Tennis Club](/c/p/926)\n25852[Carlos](/userAccount/up/29604)\n[Ko](/userAccount/up/29604)\n51749Honolulu, HI[](/c/p)\n23063[Carlos](/userAccount/up/184038)\n[Quiroz](/userAccount/up/184038)\n1184038[](/c/p)\n22344[Carlos](/userAccount/up/20026)\n[Estrada](/userAccount/up/20026)\n55737Miami, FL[Broward Table Tennis Club](/c/p)\n1165[Carlos](/userAccount/up/5846)\n[Ortiz](/userAccount/up/5846)\n95356Cidra, US[](/c/p)\n0`;

export default function parse(text) {
    const arr = text.split("\n");
    const players = [];
    for (let i = 0; i < (arr.length - 1) / 3; i++) {
        players.push({
            name: undefined,
            playerUrl: undefined,
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
    player.playerUrl = "https://usatt.simplycompete.com" + a[1].slice(0, -1);

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
        player.playerUrl = "https://usatt.simplycompete.com" + a[1].slice(0, -1);

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