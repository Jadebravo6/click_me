

(function() {
    const socket = io();
    let intervalId;
    let auto_clic = false;

    if(localStorage.getItem('player')) {
        socket.emit('existing player', localStorage.getItem('player'));
    } else {
        const uname = prompt('Entrez votre nom');
        socket.emit('new player', uname);
        localStorage.setItem('player', uname);
    }

    if(localStorage.getItem('on_game') == 'true') {
        document.getElementById('click_me').style.display = 'flex';
        document.getElementById('auto_click').style.display = 'flex';
        document.getElementById('start').style.display = 'none';
    }

    socket.on('user not connected', ()=>{
        if(localStorage.getItem('player'))
            localStorage.removeItem('player');

        const uname = prompt('Entrez votre nom');
        socket.emit('new player', uname);
        localStorage.setItem('player', uname);
    })

    socket.on('user connected', (playerData)=>{
        document.querySelector('.participants').innerHTML = '';
        let count = 0;

        for(player of playerData) {
            count++;
            document.querySelector('.participants').innerHTML += `
                <div class="player ${player.uname == localStorage.getItem('player') ? 'you' : ''}" id="${player.uname}">${count} | ${player.uname}  a  ${player.score} clic${player.score>1 ? 's':''}</div>
            `;
        }
    })

    // mettre a jour le chrono
    socket.on('update chrono', (seconds) => {
        // Fonction pour formater le temps sous forme d'une chaîne HH:MM:SS
        function formatTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;

            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(remainingSeconds).padStart(2, '0');

            return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        }

        const chronometerElement = document.getElementById('chronometre');
        chronometerElement.textContent = formatTime(seconds);
    });

    // Vérifier si le temps est écoulé (par exemple, après 10 secondes)
    socket.on('end chrono', ()=> {
        alert("Temps écoulé !"); // Lancer un événement à la fin du chrono
        document.querySelector('.participants').style.display = 'none';
        document.getElementById('click_me').style.display = 'none';
        document.getElementById('auto_click').style.display = 'none';

        socket.emit('end');
        clearInterval(intervalId);
        socket.removeListener('update chrono');
        localStorage.setItem('on_game', 'false');
    });

    
    // met a jour la liste
    socket.on('show current score', (playerData)=>{
        document.querySelector('.participants').innerHTML = '';
        let count = 0;

        for(player of playerData) {
            count++;
            document.querySelector('.participants').innerHTML += `
                <div class="player ${player.uname == localStorage.getItem('player') ? 'you' : ''}" id="${player.uname}">${count} | ${player.uname}  a  ${player.score} clic${player.score>1 ? 's':''}  ${count == 1 ? '🥇' : (count == 2 ? '🥈' : (count == 3 ? '🥉' : (count == 4 ? '🏅' : (count == 5 ? '🎖️' : ''))))}</div>
            `;
        }
    })

    // resultat
    socket.on('resultats', (playerData)=>{
        document.getElementById('return').style.display = 'flex';
        document.querySelector('.resultats').innerHTML = '<h1>Classement</h1>';
        let count = 0;

        for(player of playerData) {
            count++;
            document.querySelector('.resultats').innerHTML += `
                <div class="player ${player.uname == localStorage.getItem('player') ? 'you' : ''}" id="${player.uname}">${count} | ${player.uname}  a  ${player.score} clic${player.score>1 ? 's':''}  ${count == 1 ? '🥇🏆' : (count == 2 ? '🥈' : (count == 3 ? '🥉' : (count == 4 ? '🏅' : (count == 5 ? '🎖️' : ''))))}</div>
            `;
        }
        socket.removeListener('resultats');
    })

    socket.on('game started', ()=>{
        document.getElementById('click_me').style.display = 'flex';
        document.getElementById('auto_click').style.display = 'flex';
        document.getElementById('start').style.display = 'none';
        socket.removeListener('game started');
        localStorage.setItem('on_game', 'true');
    })

    let timeleft = 2;
    function time() {
        if(timeleft == 2 * (1000 * 3600))
        document.querySelector('.time').textContent = timeleft;
        setTimeout(() => {
            time()
        }, 1000);
    }

    function auto_clic_f() {
        socket.emit('player clic', localStorage.getItem('player'), 1);
    }

    document.getElementById('auto_click').onclick = ()=>{
        if(!auto_clic) {
            auto_clic = true;

            intervalId = setInterval(auto_clic_f, 130);
            document.getElementById('auto_click').classList.add('animated');
            document.getElementById('auto_click').textContent = 'Enabled';
        }
        else {
            auto_clic = false;
            clearInterval(intervalId);
            document.getElementById('auto_click').classList.remove('animated');
            document.getElementById('auto_click').textContent = 'Disableb';
        }
    }

    document.getElementById('click_me').onclick = ()=>{
        socket.emit('player clic', localStorage.getItem('player'), 1);
    }

    document.getElementById('start').onclick = ()=>{
        socket.emit('start game');
    }

    document.getElementById('return').onclick = ()=>{
        location.reload();
        document.getElementById('return').style.display = 'none';
    }
})();