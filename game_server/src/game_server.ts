import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { Type, deserialize, deserializeArray } from './plain_to_class';

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    @Type(() => Player)
    players: Player[] = [];

    @Type(() => Bullet)
    bullets: Bullet[] = [];

    time: number = 0;
    runningPlayerId: number = 0;
    runningBulletId: number = 0;
}

let gameState: GameState = new GameState();


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

const gameStateDirPath: string = "../state/";
const gameStateFilename: string = "game_state.json";
const gameStateFilePath: string = gameStateDirPath + gameStateFilename;

const fsExists = async (path: string) => {
    return await fs.promises.access(gameStateDirPath).then(() => true).catch(() => false);
}

let _savingQueued = false;
const writeGameState = async () => {
    const dirExists: Boolean = await fsExists(gameStateDirPath);
    if (!dirExists) {
        log("mkdir " + gameStateDirPath);
        fs.mkdirSync(gameStateDirPath);
        return;
    }

    const gameStateString: string = JSON.stringify(gameState);
    await fs.promises.writeFile(gameStateFilePath, gameStateString)
        .catch(() => log("Couldn't write to '" + gameStateFilePath + "'"))

    log("Saving done!");
    _savingQueued = false;
}

const queueSaving = () => {
    if (_savingQueued)
        return;

    _savingQueued = true;
    setTimeout(() => { writeGameState(); }, 3000);
}

const readGameState = async () => {
    const dirExists: Boolean = await fsExists(gameStateDirPath);
    if (!dirExists)
        return;

    const fileExists: Boolean = await fsExists(gameStateFilePath);
    if (!fileExists)
        return;

    const fileBuffer: Buffer = await fs.promises.readFile(gameStateFilePath);
    gameState = deserialize(GameState, fileBuffer.toString());
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

class LogMessage {
    @Type(() => Date)
    t: Date = new Date();
    m: string = "";
}

let logMessages: Array<LogMessage> = new Array();
const logDirPath: string = '../log/';
const logFilename: string = 'gaem_js_server.log';
const logPath: string = logDirPath + logFilename;

const log = (str: string) => {
    let msg: LogMessage = new LogMessage();
    msg.m = str;
    logMessages.push(msg);
    fs.promises.appendFile(logPath, JSON.stringify(msg) + ",");
    console.log(str);
}

const readLogFile = () => {
    if (!fs.existsSync(logDirPath)) {
        fs.mkdirSync(logDirPath);
        return;
    }

    if (!fs.existsSync(logPath))
        return;

    const logFile: Buffer = fs.readFileSync(logPath);
    const logString: string = '[' + logFile.slice(0, -1).toString() + ']';
    logMessages = deserializeArray(LogMessage, logString).slice(-30);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

const app: express.Application = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/setPlayerState', (req, res) => {
    const player: Player = req.body;
    const index: number = gameState.players.findIndex(p => p.playerKey == player.playerKey);
    if (index >= 0) {
        gameState.players[index] = player;
        res.send("SUCCESS");
        //log("/setPlayerState SUCCESS > " + JSON.stringify(gameState));

        queueSaving();
    }
    else {
        res.send("ERROR: Player " + player.playerKey + " not found!");
        log("/setPlayerState ERROR player not found > " + JSON.stringify(gameState));
    }
});

app.post('/makeBullet', (req, res) => {
    const maxBulletCount = 1000;
    if (gameState.bullets.length >= maxBulletCount)
        gameState.bullets.splice(0, gameState.bullets.length - maxBulletCount);

    const threshold = 10000;
    gameState.bullets = gameState.bullets.filter((b: Bullet) => Date.now() - b.startTime < threshold);

    let bullet: Bullet = req.body;
    bullet.bulletKey = gameState.runningBulletId++
    gameState.bullets.push(bullet);
    res.send(JSON.stringify(bullet));

    queueSaving();
});

app.get('/getGameState', (req, res) => {
    const gameStateString = JSON.stringify(gameState);
    res.send(gameStateString);
});

app.get('/newPlayer/:playerName', (req, res) => {
    const name: string = req.params["playerName"];
    if (!name) {
        res.send("ERROR: Must provide name for player in request params");
        log("/newPlayer ERROR no name");
        return;
    }

    const existingPlayerIndex = gameState.players.findIndex(p => p.name === name);
    if (existingPlayerIndex >= 0) {

        const player: Player = gameState.players[existingPlayerIndex];
        res.send(JSON.stringify(player));
        log('/newPlayer PLAYER EXISTED! "' + player.name + '" (' + player.playerKey + ') <= ' + req.body + ' > ' + JSON.stringify(player) + " > " + JSON.stringify(gameState));
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

    log('/newPlayer "' + player.name + '" (' + player.playerKey + ') <= ' + req.body + ' > ' + JSON.stringify(player) + " > " + JSON.stringify(gameState));

    queueSaving();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

const portToList = 8081;


app.get('/', (req, res) => {
    const escapeHtml = (s: string) => {
        return s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    let output = "";
    output += `<!DOCTYPE html>\n<html>\n<head><title>server@${portToList}</title></head>\n`;
    output += `<body><h1>Server running on port ${portToList}</h1>\n`;
    output += `<p>Connect with the <b>gaem_js_client</b></p>\n`;
    output += `<p>Logs:</p><table><tr><th>Time</th><th>Message</th></tr>\n`;

    logMessages.slice(-10).reverse().forEach(e => {
        output += `<tr><td><b>[${e.t.toISOString().replace('T', ' ').slice(0, -5)}]</b></td><td>`;
        output += `${escapeHtml(e.m)}</td></tr>\n`
    });
    output += "</table>\n</body>\n</html>";
    res.send(output);
});

app.listen(portToList, () => {
    readLogFile();
    readGameState();
    log('Listening on port ' + portToList + '.');
});
