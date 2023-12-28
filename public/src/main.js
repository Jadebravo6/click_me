

(function() {
    const socket = io();

    if(localStorage.getItem('player')) {
        socket.emit('existing player', localStorage.getItem('player'));
    } else {
        const uname = prompt('Entrez votre nom');
        socket.emit('new player', uname);
        localStorage.setItem('player', uname);
    }

    socket.on('user connected', (playerData)=>{
        document.querySelector('.participants').innerHTML = '';

        for(player of playerData)
        document.querySelector('.participants').innerHTML += `
        <div class="player" id="${player.uname}">${player.uname}  a  ${player.score} clic(s)</div>
        `;
    })


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

    // Fonction pour mettre à jour le chronomètre
    function updateChronometer() {
        seconds++;
        chronometerElement.textContent = formatTime(seconds);

        // Vérifier si le temps est écoulé (par exemple, après 10 secondes)
        if (seconds >= 60) {
            clearInterval(intervalId); // Arrêter le chronomètre
            alert("Temps écoulé !"); // Lancer un événement à la fin du chrono
            document.querySelector('.participants').style.display = 'none';
            document.getElementById('click_me').style.display = 'none';
            socket.emit('end', localStorage.getItem('player'));
        }
    }

    // Initialisation des variables
    let seconds = 0;
    const chronometerElement = document.getElementById('chronometre');
    let intervalId;

    // Démarrer le chronomètre
    intervalId = setInterval(updateChronometer, 1000); // Mettre à jour toutes les 1 seconde

    // met a jour la liste
    socket.on('show current score', (playerData)=>{
        document.querySelector('.participants').innerHTML = '';

        for(player of playerData)
            document.querySelector('.participants').innerHTML += `
                <div class="player" id="${player.uname}">${player.uname}  a  ${player.score} clic(s)</div>
            `;
    })

    // resultat
    socket.on('resultats', (playerData)=>{
        document.querySelector('.resultats').innerHTML = '<h1>Les Resultats</h1>';

        for(player of playerData)
            document.querySelector('.resultats').innerHTML += `
                <div class="player" id="${player.uname}">${player.uname}  a  ${player.score} clic(s)</div>
            `;
    })

    let timeleft = 2;
    function time() {
        if(timeleft == 2 * (1000 * 3600))
        document.querySelector('.time').textContent = timeleft;
        setTimeout(() =>{
            time()
        }, 1000);
    }

    document.getElementById('click_me').onclick = ()=>{
        socket.emit('player clic', localStorage.getItem('player'));
    }
})();
