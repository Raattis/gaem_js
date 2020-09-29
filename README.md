# gaem_js [![Build Status](https://img.shields.io/github/workflow/status/Raattis/gaem_js/CI)](https://github.com/Raattis/gaem_js/actions)
Poking around with web development stuff. Sorry for the mess.

# How to run

In a terminal window
```sh
./docker_build.sh
./docker_create_volumes.sh
./docker_run_server.sh
```

In another terminal window
```sh
./docker_run_client.sh
```

To rerun either client or server rerun the corresponding `./docker_run_*.sh` script.

# Running without docker
Do `npm install` in both `game_server` and `game_client` folders and then run the `./start_server.sh` and `./start_client.sh` scripts at the root folder. The port of the `proxy` address may need to be adjusted in `./game_client/package.json` for this to work properly.
