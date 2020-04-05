"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var fs_1 = __importDefault(require("fs"));
var plain_to_class_1 = require("./plain_to_class");
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
        this.players = [];
        this.bullets = [];
        this.time = 0;
        this.runningPlayerId = 0;
        this.runningBulletId = 0;
    }
    __decorate([
        plain_to_class_1.Type(function () { return Player; })
    ], GameState.prototype, "players", void 0);
    __decorate([
        plain_to_class_1.Type(function () { return Bullet; })
    ], GameState.prototype, "bullets", void 0);
    return GameState;
}());
var gameState = new GameState();
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
var gameStateDirPath = "../state/";
var gameStateFilename = "game_state.json";
var gameStateFilePath = gameStateDirPath + gameStateFilename;
var fsExists = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fs_1.default.promises.access(gameStateDirPath).then(function () { return true; }).catch(function () { return false; })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var _savingQueued = false;
var writeGameState = function () { return __awaiter(void 0, void 0, void 0, function () {
    var dirExists, gameStateString;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fsExists(gameStateDirPath)];
            case 1:
                dirExists = _a.sent();
                if (!dirExists) {
                    log("mkdir " + gameStateDirPath);
                    fs_1.default.mkdirSync(gameStateDirPath);
                    return [2 /*return*/];
                }
                gameStateString = JSON.stringify(gameState);
                return [4 /*yield*/, fs_1.default.promises.writeFile(gameStateFilePath, gameStateString)
                        .catch(function () { return log("Couldn't write to '" + gameStateFilePath + "'"); })];
            case 2:
                _a.sent();
                log("Saving done!");
                _savingQueued = false;
                return [2 /*return*/];
        }
    });
}); };
var queueSaving = function () {
    if (_savingQueued)
        return;
    _savingQueued = true;
    setTimeout(function () { writeGameState(); }, 3000);
};
var readGameState = function () { return __awaiter(void 0, void 0, void 0, function () {
    var dirExists, fileBuffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fsExists(gameStateDirPath)];
            case 1:
                dirExists = _a.sent();
                if (!dirExists)
                    return [2 /*return*/];
                return [4 /*yield*/, fs_1.default.promises.readFile(gameStateFilePath)];
            case 2:
                fileBuffer = _a.sent();
                gameState = plain_to_class_1.deserialize(GameState, fileBuffer.toString());
                return [2 /*return*/];
        }
    });
}); };
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
var LogMessage = /** @class */ (function () {
    function LogMessage() {
        this.t = new Date();
        this.m = "";
    }
    __decorate([
        plain_to_class_1.Type(function () { return Date; })
    ], LogMessage.prototype, "t", void 0);
    return LogMessage;
}());
var logMessages = new Array();
var logDirPath = '../log/';
var logFilename = 'gaem_js_server.log';
var logPath = logDirPath + logFilename;
var log = function (str) {
    var msg = new LogMessage();
    msg.m = str;
    logMessages.push(msg);
    fs_1.default.promises.appendFile(logPath, JSON.stringify(msg) + ",");
    console.log(str);
};
var readLogFile = function () {
    if (!fs_1.default.existsSync(logDirPath)) {
        fs_1.default.mkdirSync(logDirPath);
        return;
    }
    if (!fs_1.default.existsSync(logPath))
        return;
    var logFile = fs_1.default.readFileSync(logPath);
    var logString = '[' + logFile.slice(0, -1).toString() + ']';
    logMessages = plain_to_class_1.deserializeArray(LogMessage, logString).slice(-30);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
var app = express_1.default();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/setPlayerState', function (req, res) {
    var player = req.body;
    var index = gameState.players.findIndex(function (p) { return p.playerKey == player.playerKey; });
    if (index >= 0) {
        gameState.players[index] = player;
        res.send("SUCCESS");
        log("/setPlayerState SUCCESS > " + JSON.stringify(gameState));
        queueSaving();
    }
    else {
        res.send("ERROR: Player " + player.playerKey + " not found!");
        log("/setPlayerState ERROR player not found > " + JSON.stringify(gameState));
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
    queueSaving();
});
app.get('/getGameState', function (req, res) {
    var gameStateString = JSON.stringify(gameState);
    res.send(gameStateString);
});
app.get('/newPlayer/:playerName', function (req, res) {
    var name = req.params["playerName"];
    if (!name) {
        res.send("ERROR: Must provide name for player in request params");
        log("/newPlayer ERROR no name");
        return;
    }
    var existingPlayerIndex = gameState.players.findIndex(function (p) { return p.name === name; });
    if (existingPlayerIndex >= 0) {
        var player_1 = gameState.players[existingPlayerIndex];
        res.send(JSON.stringify(player_1));
        log('/newPlayer PLAYER EXISTED! "' + player_1.name + '" (' + player_1.playerKey + ') <= ' + req.body + ' > ' + JSON.stringify(player_1) + " > " + JSON.stringify(gameState));
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
    log('/newPlayer "' + player.name + '" (' + player.playerKey + ') <= ' + req.body + ' > ' + JSON.stringify(player) + " > " + JSON.stringify(gameState));
    queueSaving();
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
    log('/listItemsToServer/:listName response to ' + listName + ' <= ' + req.body + ' > ' + JSON.stringify(listItems));
});
app.get('/listItems/:listName', function (req, res) {
    var listName = req.params['listName'];
    var listItems = allListItems.get(listName);
    if (!listItems) {
        listItems = [];
        allListItems.set(listName, listItems);
    }
    res.send(JSON.stringify(listItems));
    log('/listItems/:listName response to ' + listName + ' > ' + JSON.stringify(listItems));
});
app.get('/', function (req, res) {
    var output = "<h1>Server running!</h1><p>Connect with the <b>gaem_js_client</b></p><ul>\n";
    logMessages.slice(-10).forEach(function (e) {
        output += "<li>[";
        output += e.t.toISOString().replace('T', ' ').slice(0, -5);
        output += "] ";
        output += e.m;
        output += "</li>";
    });
    output += "</ul>";
    res.send(output);
});
app.listen(8081, function () {
    readLogFile();
    readGameState();
    log('Listening on port 8081.');
});
