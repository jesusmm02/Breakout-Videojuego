const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');

const musicaFondo = new Audio('musica/cantina.mp3');
const musicaDisparo = new Audio('musica/disparo.mp3');
const musicaEspada = new Audio('musica/espada.mp3');

const divJuego = document.querySelector('.juego');

let score=0;


// Obtener las dimensiones del div "juego"
const divAncho = divJuego.offsetWidth;
const divAlto = divJuego.offsetHeight;

// Establecer las dimensiones del canvas como las del div "juego"
canvas.width = divAncho;
canvas.height = divAlto;

const level1 = [
  [],
  ['N','P','P','P','P','P','N','N','P','P','P','P','P','N'],
  ['N','P','P','P','P','P','N','N','P','P','P','P','P','N'],
  [],
  [],
  [],
  ['R','R','R','R','R','R','R','R','R','R','R','R','R','R'],
  ['R','R','R','R','R','R','R','R','R','R','R','R','R','R'],
  ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'],
  ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'],
  ['G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
  ['G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
  ['B','B','B','B','B','B','B','B','B','B','B','B','B','B'],
  ['B','B','B','B','B','B','B','B','B','B','B','B','B','B']
];

// crear una asignación entre el código corto de color (R, O, G, Y, P, N) y el nombre de la color
const colorMap = {
  'R': 'red',
  'B': 'blue',
  'G': 'green',
  'Y': 'yellow',
  'P': 'purple',
  'N': 'black'
};



const brickGap = 5  ;
const brickWidth = 50;
const brickHeight = 8;


const wallSize = 0;
const bricks = [];


// Crea el nivel haciendo un bucle sobre cada fila y columna de la matriz Level1
// y crear un objeto con la posición de los ladrillos (x, y) y el color
// Ampliación: Bloques con vida
for (let row = 0; row < level1.length; row++) {
  for (let col = 0; col < level1[row].length; col++) {
    const colorCode = level1[row][col];
    let vidas = 1;

    if (colorCode === 'R' || colorCode === 'P') {
      vidas = 2;
    }

    if (colorCode !== 'N') {
      bricks.push({
        x: wallSize + (brickWidth + brickGap) * col,
        y: wallSize + (brickHeight + brickGap) * row,
        color: colorMap[colorCode],
        width: brickWidth,
        height: brickHeight,
        vidas: vidas
      });
    }
  }
}

// Coloque la paleta horizontalmente en el centro de la pantalla
const paddle = {
 
  x: canvas.width / 2 - brickWidth / 2,
  y: 480,
  width: 80,
  height: brickHeight,
  
  //Barra x Velocidad
  dx: 0
};

const ball = {
  x: paddle.x + paddle.width / 2 - 5, 
  y: paddle.y - 10,
  width: 10,
  height: 10,
  speed: 4,
  // ball velocity
  dx: 0,
  dy: 0
};

// comprobar si hay colisiones entre dos objetos mediante el cuadro delimitador alineado con el eje (AABB)
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

let contador = 4;
// Bucle de juego
function loop() {
  musicaFondo.play();
  requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  // Mueve la barra por su velocidad
  paddle.x += paddle.dx;

  
// evita que la paleta atraviese las paredes
  if (paddle.x < wallSize) {
    paddle.x = wallSize
  }
  else if (paddle.x + brickWidth > canvas.width - wallSize) {
    paddle.x = canvas.width - wallSize - brickWidth;
  }


// mueve la pelota según su velocidad
  ball.x += ball.dx;
  ball.y += ball.dy;


// evita que la pelota atraviese las paredes cambiando su velocidad
  // paredes izquierda y derecha
  if (ball.x < wallSize) {
    ball.x = wallSize;
    ball.dx *= -1;
  }
  else if (ball.x + ball.width > canvas.width - wallSize) {
    ball.x = canvas.width - wallSize - ball.width;
    ball.dx *= -1;
  }
// pared superior
  if (ball.y < wallSize) {
    ball.y = wallSize;
    ball.dy *= -1;
  }

  // reinicia la bola si pasa por debajo de la pantalla
  if (ball.y > canvas.height) {
    ball.x = paddle.x + paddle.width / 2 - ball.width / 2;
    ball.y = paddle.y - ball.height;
    ball.dx = 0;
    ball.dy = 0;
    contador--; // Decrementar el contador en 1
    eliminarImagen(contador);
}

  
  // comprueba si la pelota choca con la paleta. si cambian la velocidad 
  if (collides(ball, paddle)) {
    ball.dy *= -1;

    
    // mueve la pelota por encima de la paleta, de lo contrario la colisión volverá a ocurrir
    // en el siguiente fotograma
    ball.y = paddle.y - ball.height;
  }

    // comprueba si la bola choca con un ladrillo. Si es así, retira el ladrillo.
    // y cambiar la velocidad de la bola según el lado en el que se golpeó el ladrillo
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];

    if (collides(ball, brick)) {
      musicaDisparo.play();
      if (brick.vidas > 1) {
        brick.vidas--;
      } else {
        // Eliminar el bloque si se queda sin vidas
        bricks.splice(i, 1);
      }

      // La lógica de rebote y puntuación sigue siendo la misma
      if (ball.y + ball.height - ball.speed <= brick.y ||
          ball.y >= brick.y + brick.height - ball.speed) {
        ball.dy *= -1;
      } else {
        ball.dx *= -1;
      }
      //puntuacion
      score++;
      document.getElementById("puntua").textContent = "Puntuacion: " + score;
      break;   
    }
  }
  
  if (bricks.length === 0) {
  victoria(); // Llamar a la función victoria si no quedan ladrillos
  }
  
  context.fillStyle = 'red';
  context.fillRect(0, 0, canvas.width, wallSize);

  // dibuja bola
  if (ball.dx || ball.dy) {
    context.fillRect(ball.x, ball.y, ball.width, ball.height);
  }

  // dibuja los bloques
  bricks.forEach(function(brick) {
    context.fillStyle = brick.color;
    context.fillRect(brick.x, brick.y, brick.width, brick.height);
  });

  // dibuja barra
  context.fillStyle = 'cyan';
  context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// felchas derecha izq
onkeydown = (e) =>{

  if (e.which === 32) {
    if (ball.dx === 0 && ball.dy === 0) {
      // Iniciar el juego configurando las velocidades de la bola
      ball.dx = 4;  // Ajusta la velocidad inicial según tu preferencia
      ball.dy = -4;
    }
  }

  // izquierda velocidad
  if (e.which === 37) {
    paddle.dx = -10;
  }
  // derecha velocidad
  else if (e.which === 39) {
    paddle.dx = 10;
  }

  // ezpacio
  // empieza el juego pulsando el espacio
};

// para el paddle
document.addEventListener('keyup', function(e) {
  if (e.which === 37 || e.which === 39) {
    paddle.dx = 0;
  }
});

// comienzo del juego

function victoria(){
const bricks = document.getElementsByClassName("brick"); // Obtener todos los elementos de ladrillo restantes
    if (bricks.length === 0) {
        onkeydown = () => {};
        paddle.dx = 0;
        ball.dx = 0;
        ball.dy = 0;
        const victoryText = document.createElement("h1");
        victoryText.textContent = "VICTORY";
        victoryText.style.fontSize = "100px"; // Tamaño grande del texto
        victoryText.style.position = "absolute";
        victoryText.style.top = "50%";
        victoryText.style.left = "50%";
        victoryText.style.transform = "translate(-50%, -50%)"; // Centrar el texto
        document.body.appendChild(victoryText);
    }
}

function eliminarImagen(contador) {
  const elementoEliminar = document.getElementById(contador);
  if (contador>=2) {
    elementoEliminar.remove(); // Eliminar la imagen correspondiente
  } else {
    onkeydown = () => {};
    elementoEliminar.remove(); // Eliminar la imagen correspondiente
    const gameOverText = document.createElement("h1");
    gameOverText.textContent = "GAME OVER";
    gameOverText.style.fontSize = "100px"; // Tamaño grande del texto
    gameOverText.style.position = "absolute";
    gameOverText.style.top = "50%";
    gameOverText.style.left = "50%";
    gameOverText.style.transform = "translate(-50%, -50%)"; // Centrar el texto
    document.body.appendChild(gameOverText); 
  }
}



// Llamar a la función eliminarImagen para que empiece a verificar en cada fotograma
requestAnimationFrame(loop);