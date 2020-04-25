import React, { Component } from 'react'
import { GameCanvas } from './game_canvas'

const screenBorders = { top: -10, bottom: 10, left: -20, right: 20 };

const isWithinScreenBorders = (x, y) => {
  const { top, bottom, left, right } = screenBorders;
  if (top <= y && y <= bottom && left <= x && x <= right)
    return true;

  return false;
};

const facingDir = (facing) => {
  const fy = (facing === 0 ? -1 : facing === 1 ? 1 : 0);
  const fx = (facing === 2 ? -1 : facing === 3 ? 1 : 0);
  return { fx, fy };
};

const tilePixelPos = (x, y) => {
  return { px: x * 40, py: y * 40 };
}

const PixelDiv = (props) => {
  const { px, py } = props;
  return (
    <div style={{ position: "absolute", top: py, left: px }}>
      {props.children}
    </div>
  );
};


/*
const TileDiv = (props) => {
  const { x, y } = props;
  const { px, py } = tilePixelPos(x, y);
  return (
    <PixelDiv px={px} py={py} >
      {props.children}
    </PixelDiv>
  );
};

const Player = (props) => {
  const { player } = props;
  const { fx, fy } = facingDir(player.facing);
  const facingPixelOffset = 0.5;

  return (
    <div>
      <TileDiv x={player.x} y={player.y} >
        {player.name}
      </TileDiv>
      <TileDiv x={player.x + fx * facingPixelOffset} y={player.y + fy * facingPixelOffset} >
        o
    </TileDiv>
    </div>
  );
};

const Bullet = (props) => {
  const { bullet } = props;
  const dt = (Date.now() - bullet.startTime) * 0.001;
  const speed = 10.0;
  const x = (bullet.startX + bullet.dx * dt * speed);
  const y = (bullet.startY + bullet.dy * dt * speed);
  if (x < screenBorders.left || x > screenBorders.right || y < screenBorders.top || y > screenBorders.bottom)
    return (<div></div>);

  return (
    <div>
      <TileDiv x={x} y={y}>
        #
      </TileDiv>
    </div >
  );

};
*/

const MovePlayerButtons = (props) => {
  const { onMove, onShoot } = props;

  const keyPress = (e) => {
    const up = 38;
    const down = 40;
    const left = 37;
    const right = 39;
    const space = 32;
    if (e.keyCode === up) onMove(0, -1);
    if (e.keyCode === down) onMove(0, 1);
    if (e.keyCode === left) onMove(-1, 0);
    if (e.keyCode === right) onMove(1, 0);
    if (e.keyCode === space) onShoot();
  };

  document.onkeydown = keyPress;

  return (
    <div>
      <button onClick={() => onMove(0, -1)}>up</button>
      <button onClick={() => onMove(0, 1)}>down</button>
      <button onClick={() => onMove(-1, 0)}>left</button>
      <button onClick={() => onMove(1, 0)}>right</button>
      <button onClick={() => onShoot()}>shoot</button>
    </div>
  );
};

const AddNewPlayerForm = (props) => {
  const onSubmit = (e) => {
    e.preventDefault();
    let input = document.getElementById("playerNameField");
    props.onSubmit(input.value);
    input.blur();
  };

  return (
    <form onSubmit={onSubmit}>
      <label>Name:</label>
      <input id="playerNameField" type="text" placeholder="New or existing player name..." />
      <button onClick={onSubmit}>Create</button>
    </form>
  );
};

export default class App extends Component {
  constructor(props) {
    super(props);

    this._listItemCreationCounter = 0;
    this._currentListName = "default";
    this._lastUpdateTime = Date.now();
    this._updating = false;
    this.gameState = null;
    this.state = {
      gameState: null,
      localPlayerKey: 0,
    };
  };

  scheduledUpdate = () => {
    if (Date.now() - this._lastUpdateTime > 15 && !this._updating)
      this.getGameState();
  };

  componentDidMount() {
    this.getGameState();
    this.interval = setInterval(() => this.scheduledUpdate(), 20);
  }

  getLocalPlayer = (gameState) => {
    return gameState.players.find(p => p.playerKey === this.state.localPlayerKey);
  };

  getGameState = () => {
    this._lastUpdateTime = Date.now();
    this._updating = true;
    fetch('/getGameState')
      .then(res => { return res.json(); })
      .then(gameState => {
        if (this.state.gameState) {
          const oldLocalPlayer = this.getLocalPlayer(this.state.gameState);
          let newLocalPlayer = this.getLocalPlayer(gameState);
          if (oldLocalPlayer && newLocalPlayer) {
            newLocalPlayer.x = oldLocalPlayer.x;
            newLocalPlayer.y = oldLocalPlayer.y;
            newLocalPlayer.facing = oldLocalPlayer.facing;
          }
        }
        this.setState({ gameState: gameState });
        this._updating = false;
      })
  };

  makePlayer = (name) => {
    fetch('/newPlayer/' + name)
      .then(res => { return res.json() })
      .then(player => this.setState({ localPlayerKey: player.playerKey }))
      .then(() => this.getGameState());
  }

  movePlayer = (playerKey, dx, dy) => {
    const playerIndex = this.state.gameState.players.findIndex(p => p.playerKey === playerKey);
    if (playerIndex < 0) {
      console.log("Player not found: " + playerKey);
      return;
    }

    let player = this.state.gameState.players[playerIndex];
    let newX = player.x + dx;
    let newY = player.y + dy;

    if (!isWithinScreenBorders(newX, newY))
      return;

    player.x = newX;
    player.y = newY;

    if (dx !== 0)
      player.facing = dx < 0 ? 2 : 3;
    if (dy !== 0)
      player.facing = dy < 0 ? 0 : 1;

    this.setState({ gameState: this.state.gameState });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer my-token',
        'My-Custom-Header': 'foobar'
      },
      body: JSON.stringify(player)
    };

    fetch('/setPlayerState', requestOptions);
  };

  shoot = (playerKey) => {
    const playerIndex = this.state.gameState.players.findIndex(p => p.playerKey === playerKey);
    if (playerIndex < 0) {
      console.log("Player not found: " + playerKey);
      return;
    }

    let player = this.state.gameState.players[playerIndex];
    const { fx, fy } = facingDir(player.facing);
    let bullet = { playerKey: player.playerKey, bulletKey: player.playerKey };
    bullet.startX = player.x;
    bullet.startY = player.y;
    bullet.dx = fx;
    bullet.dy = fy;
    bullet.startTime = Date.now();

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer my-token',
        'My-Custom-Header': 'foobar'
      },
      body: JSON.stringify(bullet)
    };

    fetch('/makeBullet', requestOptions)
      .then(res => this.getGameState());
  };

  render() {
    const { gameState, localPlayerKey } = this.state;

    return (
      <div>
        <h1>Welcome to The Game</h1>
        {
          !gameState && !this._updating &&
          <p>Couldn't fetch game state. Is the server running?</p>
        }
        {
          gameState &&
          <AddNewPlayerForm onSubmit={this.makePlayer} />
        }
        {
          gameState &&
          <MovePlayerButtons
            onMove={(dx, dy) => this.movePlayer(localPlayerKey, dx, dy)}
            onShoot={() => this.shoot(localPlayerKey)}
          />
        }
        {
          gameState &&
          <GameCanvas gameState={gameState} />
        }
      </div>
    );

    //{
    //  gameState &&
    //  gameState.players.map(p => <Player player={p} key={p.playerKey} />)
    //}
    //{
    //  gameState &&
    //  gameState.bullets.map(b => <Bullet bullet={b} key={b.bulletKey} />)
    //}
  }
}
