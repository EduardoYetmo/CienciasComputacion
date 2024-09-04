var maximo, medio, reproducir, barra, canvas, ctx;

function iniciar(){
    maximo = 365;
    medio = document.getElementById('medio');
    reproducir = document.getElementById('reproducir');
    barra = document.getElementById('barra');
    canvas = document.getElementById('pikachuCanvas');
    ctx = canvas.getContext('2d');

    reproducir.addEventListener('click', presionar);
    barra.addEventListener('click', mover);

    drawPikachu();

    medio.addEventListener('play', () =>{
        drawPikachu('#ADD8E6');
    });
    
    medio.addEventListener('pause', () => {
        drawPikachu('#FDE84B');
    });
}

//Configuracion de boton de play y pause
function presionar(){
    if(!medio.paused && !medio.ended){
        medio.pause();
        reproducir.style.backgroundImage = 'url("imagenes/play.png")';
        clearInterval(bucle);
    }else{
        medio.play();
        reproducir.style.backgroundImage = 'url("imagenes/pausa.png")';
        bucle = setInterval(estado, 1000);
    }
}

function estado(){
    if (!medio.ended) {
        var largo = parseInt(medio.currentTime * maximo / medio.duration);
        progreso.style.width = largo + "px";
        tiempoActual.textContent = "" + parseFloat(medio.currentTime.toFixed(2));
    }else{
        progreso.style.width = "0px";
        clearInterval(bucle);
        tiempoActual.textContent = "0";
    }
}

/**
 * 
 * @param {MouseEvent} evento 
 */

function mover(evento) {
    if (!medio.paused && !medio.ended) {
        var ratonX = evento.offsetX - 2;
        if(ratonX < 0){
            ratonX = 0;
        } else if (ratonX > maximo) {
            ratonX = maximo;
        }
        var tiempo = ratonX * medio.duration / maximo;
        medio.currentTime = tiempo;
        progreso.style.width = ratonX + "px";
    }
}

function drawPikachu(color = '#FDE84B'){
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cuerpo
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(250, 250, 150, 0, Math.PI * 2, true); // Cabeza
    ctx.fill();
    ctx.closePath();

    // Oreja izquierda
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(180, 120);
    ctx.lineTo(140, 50);
    ctx.lineTo(160, 180);
    ctx.closePath();
    ctx.fill();

    // Oreja derecha
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(320, 120);
    ctx.lineTo(360, 50);
    ctx.lineTo(340, 180);
    ctx.closePath();
    ctx.fill();

    // Orejas negras
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(140, 50);
    ctx.lineTo(160, 180);
    ctx.lineTo(150, 140);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(360, 50);
    ctx.lineTo(340, 180);
    ctx.lineTo(350, 140);
    ctx.fill();
    ctx.closePath();

    // Ojos
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(200, 220, 20, 0, Math.PI * 2, true); // Ojo izquierdo
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(300, 220, 20, 0, Math.PI * 2, true); // Ojo derecho
    ctx.fill();
    ctx.closePath();

    // Mejillas
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(170, 270, 25, 0, Math.PI * 2, true); // Mejilla izquierda
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(330, 270, 25, 0, Math.PI * 2, true); // Mejilla derecha
    ctx.fill();
    ctx.closePath();

    // Boca
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(250, 300, 50, 0, Math.PI, false); // Boca
    ctx.stroke();
    ctx.closePath();

    // Nariz
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(250, 250, 10, 0, Math.PI * 2, true); // Nariz
    ctx.fill();
    ctx.closePath();
}

window.addEventListener('load', iniciar);

medio.addEventListener('play', () =>{
    drawPikachu('#ADD8E6');
});

medio.addEventListener('pause', () => {
    drawPikachu('#FDE84B'); // Color amarillo cuando se pausa
});