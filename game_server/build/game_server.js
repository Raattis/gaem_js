"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var app = express_1.default();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
var Player = /** @class */ (function () {
    function Player() {
        this.playerKey = 0;
        this.name = "";
        this.x = 0;
        this.y = 0;
        this.facing = 0;
    }
    return Player;
}());
var Bullet = /** @class */ (function () {
    function Bullet() {
        this.playerKey = 0;
        this.bulletKey = 0;
        this.startX = 0;
        this.startY = 0;
        this.dx = 0;
        this.dy = 0;
        this.startTime = 0;
    }
    return Bullet;
}());
var GameState = /** @class */ (function () {
    function GameState() {
        this.players = new Array();
        this.bullets = new Array();
        this.time = 0;
        this.runningPlayerId = 0;
        this.runningBulletId = 0;
    }
    return GameState;
}());
var gameState = new GameState();
app.post('/setPlayerState', function (req, res) {
    var player = req.body;
    var index = gameState.players.findIndex(function (p) { return p.playerKey == player.playerKey; });
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
app.post('/makeBullet', function (req, res) {
    var maxBulletCount = 1000;
    if (gameState.bullets.length >= maxBulletCount)
        gameState.bullets.splice(0, gameState.bullets.length - maxBulletCount);
    var treshold = 1000;
    gameState.bullets = gameState.bullets.filter(function (b) { return Date.now() - b.startTime < treshold; });
    var bullet = req.body;
    bullet.bulletKey = gameState.runningBulletId++;
    gameState.bullets.push(bullet);
    res.send(JSON.stringify(bullet));
});
app.get('/getGameState', function (req, res) {
    var gameStateString = JSON.stringify(gameState);
    res.send(gameStateString);
    //console.log('/getGameState response: ' + gameStateString);
});
app.get('/newPlayer/:playerName', function (req, res) {
    var name = req.params["playerName"];
    if (!name) {
        res.send("ERROR: Must provide name for player in request params");
        console.log("/newPlayer ERROR no name");
        return;
    }
    var existingPlayerIndex = gameState.players.findIndex(function (p) { return p.name === name; });
    if (existingPlayerIndex >= 0) {
        var player_1 = gameState.players[existingPlayerIndex];
        res.send(JSON.stringify(player_1));
        console.log('/newPlayer PLAYER EXISTED! "' + player_1.name + '" (' + player_1.playerKey + ') <= ' + req.body + ' > ' + JSON.stringify(player_1) + " > " + JSON.stringify(gameState));
        return;
    }
    var player = new Player();
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
var ListItem = /** @class */ (function () {
    function ListItem() {
        this.key = 0;
        this.name = "";
        this.done = false;
    }
    return ListItem;
}());
var allListItems = new Map();
app.post('/listItemsToServer/:listName', function (req, res) {
    var listName = req.params['listName'];
    var listItems = req.body;
    allListItems.set(listName, listItems);
    res.send(JSON.stringify(listItems));
    console.log('/listItemsToServer/:listName response to ' + listName + ' <= ' + req.body + ' > ' + JSON.stringify(listItems));
});
app.get('/listItems/:listName', function (req, res) {
    var listName = req.params['listName'];
    var listItems = allListItems.get(listName);
    if (!listItems) {
        listItems = [];
        allListItems.set(listName, listItems);
    }
    res.send(JSON.stringify(listItems));
    console.log('/listItems/:listName response to ' + listName + ' > ' + JSON.stringify(listItems));
});
app.get('/', function (req, res) {
    res.send("<h1>Server running!</h1><p>Connect with the <b>gaem_js_client</b></p>");
});
app.listen(3001, function () {
    console.log('Listening on port 3001.');
});
