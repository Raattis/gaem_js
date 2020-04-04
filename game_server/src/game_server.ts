import express from 'express';
import bodyParser from 'body-parser';

const app: express.Application = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

class Player {
    playerKey: number = 0;
    name: string = "";
    x: number = 0;
    y: number = 0;
    facing: number = 0;
}

class Bullet {
    playerKey: number = 0;
    bulletKey: number = 0;
    startX: number = 0;
    startY: number = 0;
    dx: number = 0;
    dy: number = 0;
    startTime: number = 0;
}

class GameState {
    players: Array<Player> = new Array<Player>();
    bullets: Array<Bullet> = new Array<Bullet>();
    time: number = 0;
    runningPlayerId: number = 0;
    runningBulletId: number = 0;
}

let gameState: GameState = new GameState();

app.post('/setPlayerState', (req, res) => {
    const player: Player = req.body;
    const index: number = gameState.players.findIndex(p => p.playerKey == player.playerKey);
    if (index >= 0) {
        gameState.players[index] = player;
        res.send("SUCCESS");
        //console.log("/setPlayerState SUCCESS > " + JSON.stringify(gameState));
    }
    else {
        res.send("ERROR: Player " + player.playerKey + " not found!");
        console.log("/setPlayerState ERROR player not found > " + JSON.stringify(gameState));
    }
});

app.post('/makeBullet', (req, res) => {
    const maxBulletCount = 1000;
    if (gameState.bullets.length >= maxBulletCount)
        gameState.bullets.splice(0, gameState.bullets.length - maxBulletCount);

    const treshold = 1000;
    gameState.bullets = gameState.bullets.filter((b: Bullet) => Date.now() - b.startTime < treshold);

    let bullet: Bullet = req.body;
    bullet.bulletKey = gameState.runningBulletId++
    gameState.bullets.push(bullet);
    res.send(JSON.stringify(bullet));
});

app.get('/getGameState', (req, res) => {
    const gameStateString = JSON.stringify(gameState);
    res.send(gameStateString);
});

app.get('/newPlayer/:playerName', (req, res) => {
    const name: string = req.params["playerName"];
    if (!name) {
        res.send("ERROR: Must provide name for player in request params");
        console.log("/newPlayer ERROR no name");
        return;
    }

    const existingPlayerIndex = gameState.players.findIndex(p => p.name === name);
    if (existingPlayerIndex >= 0) {

        const player: Player = gameState.players[existingPlayerIndex];
        res.send(JSON.stringify(player));
        console.log('/newPlayer PLAYER EXISTED! "' + player.name + '" (' + player.playerKey + ') <= ' + req.body + ' > ' + JSON.stringify(player) + " > " + JSON.stringify(gameState));
        return;
    }

    let player = new Player();
    player.name = name;
    player.x = 3;
    player.y = 3;
    player.facing = 1;
    player.playerKey = gameState.runningPlayerId++;
    gameState.players.push(player);
    res.send(JSON.stringify(player));

    console.log('/newPlayer "' + player.name + '" (' + player.playerKey + ') <= ' + req.body + ' > ' + JSON.stringify(player) + " > " + JSON.stringify(gameState));
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

class ListItem {
    key: number = 0;
    name: string = "";
    done: boolean = false;
}

let allListItems: Map<string, ListItem[]> = new Map<string, ListItem[]>();

app.post('/listItemsToServer/:listName', (req, res) => {
    const listName: string = req.params['listName'];
    const listItems: ListItem[] = req.body;
    allListItems.set(listName, listItems);
    res.send(JSON.stringify(listItems));
    console.log('/listItemsToServer/:listName response to ' + listName + ' <= ' + req.body + ' > ' + JSON.stringify(listItems));
});

app.get('/listItems/:listName', (req, res) => {
    const listName: string = req.params['listName'];
    let listItems: ListItem[] | undefined = allListItems.get(listName);
    if (!listItems) {
        listItems = [];
        allListItems.set(listName, listItems);
    }

    res.send(JSON.stringify(listItems));
    console.log('/listItems/:listName response to ' + listName + ' > ' + JSON.stringify(listItems));
});

app.get('/', (req, res) => {
    res.send("<h1>Server running!</h1><p>Connect with the <b>gaem_js_client</b></p>");
});

app.listen(3001, () => {
    console.log('Listening on port 3001.');
});
