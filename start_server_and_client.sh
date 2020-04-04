
set -m

cd ./game_server
npm run prod &

cd ../game_client
npm start &

fg %1
