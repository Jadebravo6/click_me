const express = require("express");
const path = require("path");
const fs = require('fs');
const {v4: uuidv4} = require('uuid');
const axios = require('axios');

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use('/', express.static(path.join(__dirname + '/public')));
    
// Global variables
const port = 3000;

// Fonction pour mettre à jour le chronomètre
function updateChronometer() {
    seconds--;

    if (seconds < 0) {
        clearInterval(intervalId); // Arrêter le chronomètre
        io.emit('end chrono', seconds);
    }

    io.emit('update chrono', seconds);
}

// Initialisation des variables
const MAX_TIME = 11;
let seconds = MAX_TIME;
let intervalId;

// axios.get('http://192.168.11.123:8000/api/detail-enchere/chrono-teste/api/rdc/82')

axios.get('_dirname' + 'data/tempJSON.json')
    .then(data => {
        let localOpenedRoom = require(__dirname + '/data/room.json');
        let apiData = data.data;
        console.log(apiData);

        let new_user = {}

        if(Array.isArray(localOpenedRoom)) {
            for(localRoom of localOpenedRoom) {
                for(apiRoom of apiData) {
                    if(localRoom.id === apiRoom.enchere_id) {
                        
                    }
                }
            }
        }

        for(user of apiData) {
            new_user = {
                uname: user.user_id,
                score: user.clicks
            };

            localData.push(new_user);
        }

        fs.writeFileSync(__dirname + '/data/data.json', JSON.stringify(localData, null, 2));
    })
    .catch(error => {
        console.error(error)
    })

io.on('connection', (socket) => {

    socket.on('start game', () => {
        
        io.emit('game started');

        // Démarrer le chronomètre
        intervalId = setInterval(updateChronometer, 1000); // Mettre à jour toutes les 1 seconde
    });

    socket.on('new player', (uname)=>{
        let data = require(__dirname + '/data/data.json');
        
        const new_user = {
            uname: uname,
            score: 0
        }

        data.push(new_user);
        fs.writeFileSync(__dirname + '/data/data.json', JSON.stringify(data, null, 2));

        data = data.sort((a, b) => b.score - a.score);
        io.emit('user connected', data);
    })

    socket.on('existing player', (uname)=>{
        let data = require(__dirname + '/data/data.json');

        const playerData = data.filter((player) => player.uname == uname)[0];

        if(playerData) {
            data = data.sort((a, b) => b.score - a.score);
            socket.emit('user connected', data);
        } else {
            socket.emit('user not connected');
        }
    })

    socket.on('player clic', (uname, average) => {
        let data = require(__dirname + '/data/data.json');
        
        const playerData = data.filter((player) => player.uname == uname)[0];
        playerData.score += average;
        fs.writeFileSync(__dirname + '/data/data.json', JSON.stringify(data, null, 2));

        data = data.sort((a, b) => b.score - a.score);
        io.emit('show current score', data);
    })

    socket.on('end', ()=>{
        let data = require(__dirname + '/data/data.json');

        io.emit('resultats', data);

        seconds = MAX_TIME;
        for(player of data) {
            player.score = 0;
        }
        fs.writeFileSync(__dirname + '/data/data.json', JSON.stringify(data, null, 2));
    });
});

server.listen(port, () => {
    console.log('Serveur lancé au port: ' + port);
});