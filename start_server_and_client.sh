set -m

./start_server.sh &
./start_client.sh &

fg %1