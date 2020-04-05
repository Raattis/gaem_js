FROM node:13

COPY ./game_client/package.json /gaem_js/game_client/package.json
COPY ./game_client/package-lock.json /gaem_js/game_client/package-lock.json

COPY ./game_server/package.json /gaem_js/game_server/package.json
COPY ./game_server/package-lock.json /gaem_js/game_server/package-lock.json
COPY ./game_server/tsconfig.json /gaem_js/game_server/tsconfig.json

WORKDIR /gaem_js

RUN cd /gaem_js/game_server ; npm install
RUN cd /gaem_js/game_client ; npm install

COPY ./game_client/public /gaem_js/game_client/public
COPY ./game_client/src /gaem_js/game_client/src
COPY ./game_server/src /gaem_js/game_server/src

COPY ./start_server_and_client.sh /gaem_js/start_server_and_client.sh
COPY ./start_server.sh /gaem_js/start_server.sh
COPY ./start_client.sh /gaem_js/start_client.sh

EXPOSE 8080 8081
