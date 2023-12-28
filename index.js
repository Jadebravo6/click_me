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

io.on('connection', (socket) => {
    socket.on('new player', (uname)=>{
        let data = require(__dirname + '/data/data.json');
        
        const new_user = {
            uname: uname,
            score: 0
        }

        data.push(new_user);
        fs.writeFileSync(__dirname + '/data/data.json', JSON.stringify(data, null, 2));

        data = data.sort((a, b) => b.score - a.score);
        socket.emit('new player', data);
    })

    socket.on('existing player', (uname)=>{
        let data = require(__dirname + '/data/data.json');

        const playerData = data.filter((player) => player.uname == uname)[0];

        data = data.sort((a, b) => b.score - a.score);
        socket.emit('user connected', data);
    })

    socket.on('player clic', (uname) => {
        let data = require(__dirname + '/data/data.json');
        
        const playerData = data.filter((player) => player.uname == uname)[0];
        playerData.score++;
        // data.push(playerData);
        fs.writeFileSync(__dirname + '/data/data.json', JSON.stringify(data, null, 2));

        data = data.sort((a, b) => b.score - a.score);
        io.emit('show current score', data);
    })

    socket.on('end', (player)=>{
        let data = require(__dirname + '/data/data.json');

        socket.emit('resultats', data);

        const playerData = data.filter((player) => player.uname == uname)[0];
        playerData.score = 0;

        fs.writeFileSync(__dirname + '/data/data.json', JSON.stringify(data, null, 2));
    });
});

server.listen(port, () => {
    console.log('Serveur lancé au port: ' + port);
});
