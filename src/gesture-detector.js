/* Clase GestureDetector
** Se dedica a realizar la detección de gestos. Con la información que
** la librería de leap.js da de las manos, esta clase se dedica a distinguir
** unos gestos de otros, llamando a las funciones correspondientes cuando
** detecta algún gesto. Solo es necesario inicializarlo con un entero que
** es un umbral de detección de gestos. Más abajo se detalla para qué se usa.
*/
class GestureDetector {

  // Constructor de la clase, solo necesita el umbral waiting_thres
  constructor(waiting_thres) {
    // Este umbral de tiempo es el mínimo de frames que deben de pasar para
    // dejar de detectar un gesto. Si es muy alto, el usuario verá que los gestos
    // no se detectan de forma fluida, y si es muy bajo el ruido a la hora de
    // la detección hará que se interrumpan algunos gestos mientras se detectan
    this.waiting_thres = waiting_thres;

    // Variable que determina cuántos frames llevamos esperando sin detectar gestos
    this.frame_waiting = 0;

    // Definición de los posibles estados en los que puede estar el objeto,
    // son representativos de los cuatro posibles gestos a detectar:
    // Quiet -> Ningún gesto
    // Fist -> Puño cerrado
    // Pointer -> Apuntando con el índice
    // Turned -> Volteo de mano
    this.states = {quiet: "quiet", fist: "fist", pointer: "pointer", turned: "turned"};

    // Current_state guarda el estado actual de todos los anteriores
    this.current_state = this.states.quiet;

    // Current_position guarda la posición actual de la mano
    this.current_position = {x: 0.0, y: 0.0, z: 0.0};

    // Para la fluida detección del movimiento de parámetros (que se realiza con
    // el puño cerrado) se ha implementado una circunferencia, de forma que si estamos
    // en un movimiento horizontal, no cambiaremos el parámetro vertical a no ser
    // que sobrepasemos la distancia de la circunferencia. Sphere_center guarda
    // el centro de esta circunferencia
    this.sphere_center = this.current_position;

    // Sphere_radius guarda el radio de la circunferencia mencionada anteriormente
    this.sphere_radius = 15;

    // Booleano que detecta si es posible que estemos en un movimiento de volteado
    this.volteado = false;

    // Last_input guarda el último input que Leap nos ha dado de la mano
    this.last_input = [0.0, 0.0, 0.0,
                       0.0, 0.0, 0.0,
                       0.0, 0.0, 0.0,
                       0.0, 0.0, 0.0,
                       0.0, 0.0, 0.0,
                       0.0];

    // Para los gestos automáticos, si hay alguno guardado en la sesión del navegador
    // se utiliza ese. Si no, se utiliza el que hay por defecto
    if (localStorage.gesture_network) {
      this.set_neural_network(synaptic.Network.fromJSON(localStorage.gesture_network));
    } else {
      this.set_neural_network(synaptic.Network.fromJSON(gesture_network));
    }

    //Callbacks que se llamarán cuando detectemos o dejemos de detectar un gesto
    this.state_callbacks = {
      "quiet": {
        on: function() {},
        release: function() {}
      },
      "fist": {
        on: function() {},
        release: function() {}
      },
      "pointer": {
        on: function() {},
        release: function() {}
      },
      "turned": {
        on: function() {},
        release: function() {}
      },
      "fist_vertical": {
        on: function() {},
        release: function() {}
      },
      "fist_horizontal": {
        on: function() {},
        release: function() {}
      }
    };

    // Función de movimiento. Será sustituida por un callback, por eso está vacía
    this._onMove = function(position, diff) {
      //console.log("Posición actual de la mano: " + position.x + ", " + position.y + ', ' + position.z);
    };

    // El constructor deja el detector de gestos manual por defecto
    this.manual();
  }

  // Setter del callback de detección de movimiento
  set onMove(callback) {
    this._onMove = callback;
  }

  // Setter del callback de detección de puño cerrado
  set onFist(callback) {
    this.state_callbacks[this.states.fist].on = callback;
  }

  // Setter del callback de dejar de detectar el puño cerrado
  set onFistRelease(callback) {
    this.state_callbacks[this.states.fist].release = callback;
  }

  // Setter del callback de detección del índice señalando
  set onPointer(callback) {
    this.state_callbacks[this.states.pointer].on = callback;
  }

  // Setter del callback de dejar de detectar el índice señalando
  set onPointerRelease(callback) {
    this.state_callbacks[this.states.pointer].release = callback;
  }

  // Setter del callback de detección de volteo de mano
  set onTurned(callback) {
    this.state_callbacks[this.states.turned].on = callback;
  }

  // Setter del callback de dejar de detectar un volteo de mano
  set onTurnedRelease(callback) {
    this.state_callbacks[this.states.turned].release = callback;
  }

  // Setter de la red neuronal para gestos automáticos
  set_neural_network(n) {
    this.neural_network = n;
  }

  // Activar detección manual de gestos
  manual() {
    this.mode = "manual";
  }

  // Activar detección automática de gestos
  automatic() {
    this.mode = "automatic";
  }

  // Inicia el bucle de detección de los gestos
  start() {

    // Leap.loop activa el bucle con el que nos comunicamos con el controlador
    // de gestos de Leap. Nos devuelve una mano (hand) con la información
    // de los dedos y palma
    Leap.loop({background: true}, {
      hand: (hand) => {
        // Actualiza la posicion
        var pos_x = (hand.screenPosition()[0])*1.5-500;
        var pos_y = (hand.screenPosition()[1]+700)*1.5-500;
        var pos_z = hand.screenPosition()[2]/3-100;

        // Guarda la diferencia con la que había justo antes
        var diff = {x: pos_x - this.current_position.x,
                    y: pos_y - this.current_position.y,
                    z: pos_z - this.current_position.z};

        // Actualiza la variable current_position
        this.current_position.x = pos_x;
        this.current_position.y = pos_y;
        this.current_position.z = pos_z;

        // Llama al gestor de movimiento por si ha habido algún cambio
        this._onMove(this.current_position, diff, this.current_state);

        // Actualiza last_input
        for (var i=0; i < 5; i++) {
          this.last_input[3*i] = hand.fingers[i].direction[0];
          this.last_input[3*i+1] = hand.fingers[i].direction[1];
          this.last_input[3*i+2] = hand.fingers[i].direction[2];
        }
        this.last_input[15] = hand.roll();

        // Si estamos en detección automática de gestos, se observa qué gesto detecta
        // la red neuronal y se actualizan los estados de forma correspondiente
        // Cada index es un estado diferente, que corresponde a los estados del GestureDetector
        if (this.mode == "automatic") {
          var result = this.neural_network.activate(this.last_input);
          var index = result.indexOf(Math.max(...result));
          if (index == 0) {
            //console.log("Quiet");
            if(this.current_state != this.states.quiet){
              this.state_callbacks[this.current_state].release();
              this.current_state = this.states.quiet;
              this.state_callbacks[this.current_state].on();
            }
          } else if (index == 1) {
            //console.log("Fist");
            if(this.current_state != this.states.fist){
              this.state_callbacks[this.current_state].release();
              this.current_state = this.states.fist;
              this.state_callbacks[this.current_state].on();
            }
          } else if (index == 2) {
            //console.log("Pointer");
            if(this.current_state != this.states.pointer){
              this.state_callbacks[this.current_state].release();
              this.current_state = this.states.pointer;
              this.state_callbacks[this.current_state].on();
            }
          } else if (index == 3) {
            //console.log("Turned");
            if(this.current_state != this.states.turned){
              this.state_callbacks[this.current_state].release();
              this.current_state = this.states.turned;
              this.state_callbacks[this.current_state].on();
            }
          }
          //console.log(result);

        } // Si, por otro lado, estamos en detección manual realizamos las comprobaciones
        else if (this.mode == "manual") {
          // Variable que guarda si hemos detectado algún gesto este frame
          var some_gesture = false;

      // Gesto de cerrar el puño

          /* Para detectar el puño comprobamos tres cosas:
          ** 1) El up vector (vector normal a una uña de un dedo) apunta en una dirección
          **    parecida respecto a la normal de la palma. La variable best_v se
          **    encarga de guardar el producto escalar más alto de cada dedo con
          **    la normal de la palma
          ** 2) Los dedos apuntan a direcciones parecidas. Se hace el producto escalar
          **    parejas adyacentes y se multiplican los tres valores. Se guarda en cos_in
          **    y si es alto (mayor que 0.9) es que apuntan a direcciones parecidas
          ** 3) El puño tiene la palma hacia abajo. Se hace el producto escalar de
          **    la normal de la palma con el vector (0,-1,0) y si es mayor que un umbral
          **    se acepta (en este caso 0.3).
          */
          var v = [];

          // Variable que guarda el mejor producto escalar con la normal de la palma
          var best_v = -2;
          // 1-4 fingers -> all except the thumb
          for( var finger_i = 1; finger_i < 5; finger_i++){
            // Los tres vectores del dedo i-ésimo en el hueso distal, el más alejado de la palma
            var bone = hand.fingers[finger_i].bones[3]; // distal bone
            // Se guarda solo el vector up, que es normal a la uña
            v.push((new THREE.Vector3).fromArray(bone.basis[1]));//up vector
            // En v2 guardamos el vector de la normal de la palma
            var v2 = (new THREE.Vector3).fromArray(hand.palmNormal);

            // Se comprueba si el producto escalar del dedo actual es mejor que el
            // best_v que teníamos. Es decir, si el dedo actual apunta mejor hacia
            // donde apunta la palma que los anteriores
            if(v[v.length-1].dot(v2) > best_v){
              best_v = v[v.length-1].dot(v2);
            }
          };
          // Se calcula el producto de los productos escalares entre dedos adyacentes
          var cos_in = 1;
          for(var index_v = 0; index_v < v.length-1; index_v++){
            var new_cos = (v[index_v]).dot(v[index_v+1]);
            cos_in = new_cos*cos_in;
          }
          // Si se cumplen las tres condiciones anteriores y no estamos en algún otro gesto,
          // detectamos puño cerrado y actualizamos los callbacks
          if(cos_in > 0.90 && best_v > 0.5 && v[0].dot((new THREE.Vector3).fromArray([0,-1,0])) > 0.3 &&
             (this.current_state == this.states.quiet || this.current_stat == this.states.fist)){
            some_gesture = true;
            if(this.current_state != this.states.fist){
              this.state_callbacks[this.current_state].release();
              this.current_state = this.states.fist;
              this.state_callbacks[this.current_state].on();
            }
          }

      // Gesto de apuntar con el dedo
          /* Para detectar un dedo índice señalando necesitamos:
          ** 1) El índice apuntando hacia adelante. Se comprueba con index_z
          ** 2) El resto de dedos apuntando hacia donde apunta la palma
          */
          v = [];
          best_v = -2;

          // Recorremos los dedos salvo el índice y el pulgar (0 y 1)
          for( var finger_i = 2; finger_i < 5; finger_i++){

            // Recorremos los huesos, vemos el valor en el distal que es el
            // más representativo por estar más alejado y nos quedamos con su
            // producto escalar con la normal de la palma
            hand.fingers[finger_i].bones.forEach(function (bone){

              if(bone.type == 3){
                v.push((new THREE.Vector3).fromArray(bone.basis[1]));
                var v2 = (new THREE.Vector3).fromArray(hand.palmNormal);

                if(v[v.length-1].dot(v2) > best_v){
                  best_v = v[v.length-1].dot(v2);
                }
              }
            });
          }
          // index_z se queda con la fuerza con la que el índice apunta hacia adelante
          var index_z = hand.fingers[1].bones[2].basis[2][2];
          // Si se cumplen las dos condiciones anteriores y no estamos en otro gesto,
          // detectamos dedo señalando y llamamos a las funciones correspondientes
          if(best_v > 0.5 &&  index_z > 0.8 && (this.current_state == this.states.quiet || this.current_state == this.states.pointer)){
            some_gesture = true;
            if(this.current_state != this.states.pointer){
              this.state_callbacks[this.current_state].release();
              this.current_state = this.states.pointer;
              this.state_callbacks[this.current_state].on();
            }
          }

      // Gesto de volteado
          /* La función de volteado es un poco diferente al resto porque es un gesto
          ** continuo en el tiempo. Se debe detectar si se ha hecho un gesto
          ** que necesita memoria de lo que se hace mientras se detecta. Para ello necesitamos:
          ** 1) La palma debe empezar mirando hacia abajo. Esto se realiza activando
          **    el booleano de volteo solo cuando la palma mire hacia abajo.
          ** 2) Si la palma mira hacia arriba mientras el booleano está activado,
          **    se ha conseguido hacer el gesto de volteo.
          ** 3) Si detectamos un gesto entre medias que la palma sube, desactivamos el booleano
          ** 4) Si detectamos que la palma apunta hacia adelante o hacia atrás, desactivamos el booleano
          ** 5) Si detectamos que los dedos no apuntan hacia el mismo sitio, desactivamos el booleano
          */
          // Guardamos los valores en x, y, z de la normal de la palma
          var palm_y = hand.palmNormal[1];
          var palm_x = hand.palmNormal[0];
          var palm_z = hand.palmNormal[2];

          // Comprobamos 3), si ha habido algún gesto desactivamos
          this.volteado = this.volteado && !some_gesture;

          // Comprobamos 2), si la palma está hacia arriba y el booleano activo,
          // detectamos volteo y activamos las funciones correspondientes
          if(palm_y > 0.7 && this.volteado){
            some_gesture = true;
            if(this.current_state != this.states.turned){
              this.state_callbacks[this.current_state].release();
              this.current_state = this.states.turned;
              this.state_callbacks[this.current_state].on();
            }
          }
          // Comprobamos 1), si estamos mirando hacia abajo se activa el booleano
          if(palm_y < -0.7){
            this.volteado = true;
          }
          if(this.volteado){
            // Comprobamos 4), si la palma está mirando hacia adelante o hacia atrás se desactiva
            if(palm_z < -0.4 || palm_z > 0.4){
              this.volteado = false;
            }
            // Comprobamos 5), si los dedos apuntan a diferentes direcciones desactivamos
            if(cos_in < 0.8){
              this.volteado = false;
            }
          }

          // Si no se detecta ningún gesto
          if(!some_gesture){
            this.frame_waiting += 1;
            if(this.frame_waiting > this.waiting_thres){
              this.state_callbacks[this.current_state].release();
              this.current_state = this.states.quiet;
              this.state_callbacks[this.current_state].on();
              this.frame_waiting = 0;
            }
          }
          //console.log("Estado actual: " + this.current_state);
        }
    }})

    .use('screenPosition')
    .use('handHold')
    .use('handEntry')
    .on('handFound', function(hand){
      // Controlador que se activa cuando se ve la mano por primera vez
      var colors = [0xff0000, 0x00ff00, 0x0000ff];
      var length = 24;

      hand.fingers.forEach(function (finger) {

        var arrows = [];

        // En arrows dejamos información de los dedos que nos será útil en otras
        // funciones. Este código se ha cogido del ejemplo de leap.js llamado
        // threejs-bones-arrows
        finger.bones.forEach(function(bone) {

          for (var i = 0; i < 3; i++){
            var arrow = new THREE.ArrowHelper(
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(1,0,0),
                length,
                colors[i],
                0.2 * length,
                0.4 * 0.2 * length
            );

            arrows.push(arrow);
          }

        });

        finger.data('arrows', arrows);

      });


    })
    .on('handLost', (hand) => {
      // Controlador cuando perdemos de vista la mano
      // Es importante reiniciar los estados a quieto, desactivar los gestos actuales
      // y dejar todas las variables de control como están al iniciarse
      this.state_callbacks[this.current_state].release();
      this.current_state = this.states.quiet;
      this.state_callbacks[this.current_state].on();
      this.current_position = {x: 0.0, y: 0.0, z: 0.0};
      this.sphere_center = this.current_position;
      this.volteado = false;
      this.last_input = [0.0, 0.0, 0.0,
                         0.0, 0.0, 0.0,
                         0.0, 0.0, 0.0,
                         0.0, 0.0, 0.0,
                         0.0, 0.0, 0.0,
                         0.0];

       this.state_callbacks[this.states.turned].release;

    }).connect();
  }
}
