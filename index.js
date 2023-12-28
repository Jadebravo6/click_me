const express = require("express");
const path = require("path");
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use('/', express.static(path.join(__dirname + '/public')));
    
// Global variables
const port = 3000;

// Fonction pour mettre à jour le chronomètre
function updateChronometer() {
    seconds++;

    if (seconds >= 30) {
        clearInterval(intervalId); // Arrêter le chronomètre
        io.emit('end chrono', seconds);
    }

    io.emit('update chrono', seconds);
}

// Initialisation des variables
let seconds = 0;
let intervalId;

io.on('connection', (socket) => {

    socket.on('start game', () => {
        // Démarrer le chronomètre
        intervalId = setInterval(updateChronometer, 1000); // Mettre à jour toutes les 1 seconde

        io.emit('game started');
        // io.removeListener('start game')
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

        seconds = 0;
        for(player of data) {
            player.score = 0;
        }
        fs.writeFileSync(__dirname + '/data/data.json', JSON.stringify(data, null, 2));
    });
});

server.listen(port, () => {
    console.log('Serveur lancé au port: ' + port);
});