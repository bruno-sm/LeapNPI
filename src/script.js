/* Main script del programa. Aquí se inicializan todos los gestores de eventos,
se crea el GestureDetector para detectar movimientos de manos, se guarda la información
correspondiente a la función que se está visualizando y se gestiona toda la
configuración del usuario, como los parámetros de las funciones o los gestos
automáticos.
*/
// idioma guarda el idioma actual. Puede ser 'esp' para español o 'eng' para inglés
var idioma = "esp";

// functions guarda la configuración y parámetros actuales de todas las funciones
// que se pueden visualizar, en este caso tres.
var functions = [
  /* Cada función tiene:
  ** expression -> La fórmula de la función dependiente de dos parámetros
  ** html -> El mensaje html que se muestra de la fórmula anterior
  ** explain_a -> Un pequeño mensaje que muestra una breve explicación del primer parámetro
  ** explain_b -> Un pequeño mensaje que muestra una breve explicación del segundo parámetro
  ** dom_x -> El rango en x de la visualización de la función
  ** dom_y -> El rango en y de la visualización de la función
  ** rango_a -> El rango en el que se puede mover el primer parámetro
  ** rango_b -> El rango en el que se puede mover el segundo parámetro
  ** a -> El valor actual de a. Se utiliza para que cuando se refresque el plot
  **      de una función, siga teniendo el valor que tenía cuando la dejamos de ver
  ** b -> El valor actual de b. Su uso es análogo al de a.
  ** ini_a -> El valor inicial del primer parámetro
  ** ini_b -> El valor inicial del segundo parámetro
  ** seen -> Un booleano que determina si hemos visto esta función con anterioridad o no
  **         Se utiliza para configurar mejor los mensajes y no mostrar información repetida
  */
  {
    expression: 'variable_a*sin(variable_b*x)',
    html: 'f(x)=<span class="a_format">a</span>sin(<span class="b_format">b</span>x)',
    explain_a: strings_idiomas[idioma].explain_a_fun0,
    explain_b: strings_idiomas[idioma].explain_b_fun0,
    dom_x: [-6,6],
    dom_y: [-6,6],
    rango_a: [-100, 100],
    rango_b: [-100, 100],
    a:2,
    b:3,
    ini_a:2,
    ini_b:3,
    seen: false
  },

  {
    expression: 'variable_a*x*sin(variable_b*x)',
    html: 'f(x)=<span class="a_format">a</span>x sin(<span class="b_format">b</span>x)',
    explain_a: strings_idiomas[idioma].explain_a_fun1,
    explain_b: strings_idiomas[idioma].explain_b_fun1,
    dom_x: [-6,6],
    dom_y: [-6,6],
    rango_a: [-100, 100],
    rango_b: [-100, 100],
    a:2,
    b:3,
    ini_a:2,
    ini_b:3,
    seen: false
  },

  {
    expression: '(1/(variable_a*sqrt(2*3.14159)))*exp((-1/2)*(x-variable_b)*(x-variable_b)/(variable_a*variable_a))',
    html: 'f(x)=(<span class="a_format">σ</span> √(2π))<sup>-1</sup> e<sup><sup>-(x-<span class="b_format">μ</span>)<sup>2</sup></sup>&frasl;<sub>2<span id="a" class="a_format">σ</span><sup>2</sup></sub></sup>',
    explain_a: strings_idiomas[idioma].explain_a_fun2,
    explain_b: strings_idiomas[idioma].explain_b_fun2,
    dom_x: [-12,12],
    dom_y: [-1,1],
    rango_a: [0.001, 100],
    rango_b: [-100, 100],
    a:1,
    b:0,
    ini_a:1,
    ini_b:0,
    seen: false
  }
];

// Inicializamos variables globales

// rango_a y rango_b determinan el rango de la función actual
var rango_a;
var rango_b;

// Guarda el índice de la función actual
var current_function = 0;

// Los valores actuales de los parámetros
var a = 2;
var b = 3;

// Los valores actuales de los dominios de la visualización
var dom_x = [-6, 6];
var dom_y = [-6, 6];

// Creamos el GestureDetector con un umbral de frames de espera de 4 frames
var detector = new GestureDetector(4);

// Booleano que nos dice si el menú se está mostrando o no. Al principio no
var menu = false;

// Función que cambia la función actual. También sirve para revisualizar una
// función cuando se cambian sus parámetros. fun_num es la función a visualizar
// y change_expression nos dice si su fórmula o parámetros han cambiado
function change_function(fun_num, change_expression=true) {
  // Actualizamos la función actual y remarcamos que ya la hemos visto
  current_function = fun_num;
  var f = functions[current_function];
  f.seen = true;

  // Actualizamos el mensaje de la función y las explicaciones de los parámetros
  document.getElementById("functionExpression").innerHTML = f.html;
  document.getElementById("paramAExplainText").innerHTML = f.explain_a;
  document.getElementById("paramBExplainText").innerHTML = f.explain_b;

  // Actualizamos los parámetros y los rangos en los que se mueven
  rango_a = f.rango_a;
  rango_b = f.rango_b;
  a = f.a;
  b = f.b;

  // Si la expresión ha cambiado, actualizamos sus parámetros
  if (change_expression){
    // Recuperamos el valor actual de a y lo actualizamos en el html
    var v_a = document.getElementsByClassName('a_format');
    var i;
    for(i = 0; i < v_a.length; i++){
      v_a[i].innerHTML = Math.round(a*100)/100;
    }
    // Recuperamos el valor actual de b y lo actualizamos en el html
    var v_b = document.getElementsByClassName('b_format');
    for(i = 0; i < v_b.length; i++){
      v_b[i].innerHTML = Math.round(b*100)/100;
    }
  }
  // Hacemos un nuevo plot de la función
  plot(a, b, false);
}

// plot hace una visualización de la función actual con los parámetros a_1, b_1
function plot(a_1, b_1, redraw = true) {
  // Cogemos el gráfico en html, la función actual y su fórmula
  // Sustituimos el string "variable_a/b" por el valor correspondiente del parámetro
  var target = document.getElementById('plot');
  var f = functions[current_function];
  var fn_str = f.expression.replace(/variable_a/g, a_1);
  fn_str = fn_str.replace(/variable_b/g, b_1);

  // Miramos si hay que actualizar los dominios de la función o no, y hacemos un Plot
  // con los dominios actuales
  if (redraw && plot.plot != null) {
    plot.plot = functionPlot({
      target: target,
      width: target.clientWidth,
      height: target.clientHeight,
      xAxis: {
        domain: f.dom_x
      },
      yAxis: {
        domain: f.dom_y
      },
      data: [{
        fn: fn_str
      }]
    });
  } else {
    //console.log(fn_str);
    plot.plot = functionPlot({
      target: target,
      width: target.clientWidth,
      height: target.clientHeight,
      xDomain: f.dom_x,
      yDomain: f.dom_y,
      data: [{
        fn: fn_str
      }]
    });
    plot.plot.programmaticZoom(f.dom_x, f.dom_y);

    // Hacemos un gestor del evento de cambio de tamaño de la ventana
    document.body.onresize = () => {
      plot.plot = functionPlot({
        target: target,
        width: target.clientWidth,
        height: target.clientHeight,
        xAxis: {
          domain: f.dom_x
        },
        yAxis: {
          domain: f.dom_y
        },
        data: [{
          fn: fn_str
        }]
      });
    }
  }
}

// Muestra el menú
function show_menu() {
  // Solo tenemos que hacer visibles los elementos del menú y actualizar la variable
  // menu a true
  document.getElementById('app').style.filter = 'blur(6px)';
  document.getElementById('menu').style.visibility = 'visible';
  document.getElementById('cursor').style.visibility = 'visible';
  var buttons = document.getElementsByClassName("menuButton");
  menu = true;
  hide_help();
}

// Oculta el menú
function hide_menu() {
  // Ponemos invisibles los elementos y actualizamos la variable menu a false
  document.getElementById('app').style.filter = 'none';
  document.getElementById('menu').style.visibility = 'hidden';
  document.getElementById('cursor').style.visibility = 'hidden';
  menu = false;
}

// Muestra la ayuda y desactiva el menú
function show_help() {
  document.getElementById("help").style.visibility = "visible";
  menu = false;
}

// Oculta la ayuda
function hide_help() {
  document.getElementById("help").style.visibility = "hidden";
}

// Funciones de botones

// Botón 1: Cambia la función a la primera que haya que no sea la que estamos visualizando
// Si clicamos en él se oculta el menú y se cambia la función
function button1(){
  if(current_function == 0){
    current_function = 1;
    document.getElementById('button1text').innerHTML = strings_idiomas[idioma].funcion_1;
    document.getElementById('button2text').innerHTML = strings_idiomas[idioma].funcion_3;
  }
  else {
    current_function = 0;
    document.getElementById('button1text').innerHTML = strings_idiomas[idioma].funcion_2;
    document.getElementById('button2text').innerHTML = strings_idiomas[idioma].funcion_3;
  }
  hide_menu();
  change_function(current_function, functions[current_function].seen);
}


// Botón 2: Cambia la función a la segunda que haya que no sea la que estamos visualizando
// Si clicamos en él se oculta el menú y se cambia la función
function button2(){
  if(current_function == 2){
    current_function = 1;
    document.getElementById('button1text').innerHTML = strings_idiomas[idioma].funcion_1;
    document.getElementById('button2text').innerHTML = strings_idiomas[idioma].funcion_3;
  }
  else{
    current_function = 2;
    document.getElementById('button1text').innerHTML = strings_idiomas[idioma].funcion_1;
    document.getElementById('button2text').innerHTML = strings_idiomas[idioma].funcion_2;
  }
  hide_menu();
  change_function(current_function, functions[current_function].seen);
}

// Botón 3: Reestablece los parámetros por defecto
function button3(){
  functions[current_function].a = functions[current_function].ini_a;
  functions[current_function].b = functions[current_function].ini_b;
}

// Botón 4: Activa o desactiva los gestos automáticos, según estén desactivos o no
function button4(){
  if (detector.mode == "manual") {
    document.getElementById('button4text').innerHTML = strings_idiomas[idioma].rec_manual;
    detector.automatic();
  } else {
    document.getElementById('button4text').innerHTML = strings_idiomas[idioma].rec_aut;
    detector.manual();
  }
}

// Botón 5: Activa el entrenamiento de gestos automáticos
function button5(){
  // Comienza el entrenamiento de la red neuronal
  train_neural_network(detector);
  hide_menu();
}

// Botón 6: Muestra la ayuda
function button6(){
  // Muestra la ayuda
  show_help();
}

// Botón 7: Guarda los gestos automáticos actuales en la sesión del navegador
function button7(){
  // Guarda la red neuronal actual
  localStorage.gesture_network = JSON.stringify(detector.neural_network.toJSON());
}

// Botón 8: Reestablece los gestos automáticos por defecto
function button8(){
  // Restablece la red neuronal por defecto
  localStorage.removeItem("gesture_network");
  detector.set_neural_network(synaptic.Network.fromJSON(gesture_network));
}

// Botón 9: Cambia el idioma a español o a inglés, según el que esté activo en ese momento
function button9(){
  // La función cambiarIdioma de traduccion.js es la que realiza el cambio
  idioma = cambiarIdioma(idioma, current_function, detector.mode);
}


// Función que entrena la red neuronal y pone las instrucciones para hacerlo por pantalla
function train_neural_network(gesture_detector) {
  // Desactiva el detector de gestos para que no se realicen acciones
  gesture_detector.activate(false);

  // Muestra las instrucciones
  document.getElementById("trainingExplain").style.visibility = "visible";

  // Obtiene la red neuronal guardada
  if (localStorage.gesture_network) {
    var network = synaptic.Network.fromJSON(localStorage.gesture_network);
  } else {
    // Si no hay ninguna red guardada obtiene la de por defecto
    var network = synaptic.Network.fromJSON(gesture_network);
  }

  var elapsed_time = 0; // Tiempo de entrenamiento transcurrido
  var training_time = 20000; // Tiempo de entrenamiento por gesto
  var training_set = []; // Conjunto de entrenamiento a llenar

  var expected_output = [1, 0, 0, 0];
  // Cambia el resultado esperado cada 20 segundos, cada vector representa un gesto
  output_timer = setInterval(function(){
    elapsed_time += 500;
    if (elapsed_time < training_time) {
      expected_output = [1, 0, 0, 0];
    } else if (elapsed_time < 2*training_time) {
      expected_output = [0, 1, 0, 0];
    } else if (elapsed_time < 3*training_time) {
      expected_output = [0, 0, 1, 0];
    } else {
      expected_output = [0, 0, 0, 1];
    }
  }, 500);


  var sample_time = 100; // Intervalo en el que se cogen las muestras
  var wait_time = 3000.0; // Tiempo de espera para que el usuario cambie el gesto
  // Aumenta el conjunto de entrenamiento cada 0.1 segundos
  sample_timer = setInterval(function(){
    if ((elapsed_time > (2/3 * wait_time)) &&
        (elapsed_time < training_time - (1/3 * wait_time) || elapsed_time > training_time + (2/3 * wait_time)) &&
        (elapsed_time < 2*training_time - (1/3 * wait_time) || elapsed_time > 2*training_time + (2/3 * wait_time)) &&
        (elapsed_time < 3*training_time - (1/3 * wait_time) || elapsed_time > 3*training_time + (2/3 * wait_time))) {
          var input = gesture_detector.last_input;
          // El conjunto de entrenamiento es un vector de pares (datos de entrada, salida esperada)
          training_set.push({
            input: input.slice(),
            output: expected_output
          });
        }
        // Muestra el tiempo restante por pantalla
        document.getElementById("trainingExplainTimer").innerHTML = Math.ceil((training_time - elapsed_time%training_time)/1000) + "s";
  }, sample_time);

  // Muestra las instucciones por pantalla
  var instruction_element = document.getElementById("trainingExplainText");
  var instruction_icon = document.getElementById("trainingGesture");
  // Primero muestra la instrucción de extender la mano
  instruction_element.innerHTML = strings_idiomas[idioma].pointer_tr;
  instruction_icon.src = "img/quiet.svg";
  // 20 segundos después muestra la instrucción de mover el puño
  setTimeout(function(){
    instruction_element.innerHTML = strings_idiomas[idioma].fist_tr;
    instruction_icon.src = "img/fist.svg";
  }, training_time);
  // 20 segundos después muestra la instrucción de apuntar con el dedo
  setTimeout(function(){
    instruction_element.innerHTML = strings_idiomas[idioma].point_tr;
    instruction_icon.src = "img/pointing.svg";
  }, 2*training_time);
  // 20 segundos después muestra la instrucción de mover girar la mano
  setTimeout(function(){
    instruction_element.innerHTML = strings_idiomas[idioma].flip_tr;
    instruction_icon.src = "img/menu.svg";
  }, 3*training_time);

  // Termina el muestreo y entrena a la red neuronal
  setTimeout(function(){
    document.getElementById("trainingExplainTimer").innerHTML = "0s";
    instruction_element.innerHTML = strings_idiomas[idioma].processing;
    clearInterval(output_timer);
    clearInterval(sample_timer);
    // Crea un nuevo entrenador
    var trainer = new synaptic.Trainer(network);
    // Entrena la red con los datos obtenidos
    trainer.train(training_set);
    // Establece la red entrenada como la actual
    gesture_detector.set_neural_network(network);
    instruction_element.innerHTML = strings_idiomas[idioma].end_tr;
    // Vuelve a activar el detector
    gesture_detector.activate();
  }, 4*training_time);

  // Esconde las instrucciones del entrenamiento
  setTimeout(function(){
    document.getElementById("trainingExplain").style.visibility = "hidden";
  }, 4*training_time + 1500);
}


// Descarga un archivo
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Main del script. Realiza un plot de la función e inicializa los gestores de eventos
function main() {

  // Realiza el primer plot para que se vea la función inicial
  change_function(current_function, false);

  // Crea el gestor de eventos por si se pulsa una tecla
  document.addEventListener('keyup', function (event) {
    var key = event.key || event.keyCode;
    if (key === 't') {
      train_neural_network(detector);
    } else if (key == 'd') {
        download("network.json", "gesture_network=" + JSON.stringify(detector.neural_network) + ";");
    } else if (key == "ArrowUp") {
      a += 1;
      plot(a, b);
    } else {
      if (!menu) {
        show_menu();
      } else {
        hide_menu();
      }
    }
  });

  // Se guardan variables iniciales como el tiempo actual, la circunferencia para
  // la detección del puño o el radio de la circunferencia
  var on_pointer_time = new Date();
  var state_fist_moving = 1;
  var sphere_center = {x:0, y:0, z:0};
  var sphere_radius=20000;

  // Gestor del evento de movimiento. Aquí se mueve el puntero (aunque solo
  // es visible si estamos en el menú) y se actualizan los parámetros si tenemos
  // el puño cerrado. En el último caso además se hacen comprobaciones de que
  // los parámetros no se salgan de sus rangos
  detector.onMove = function(pos, diff, state) {
    //console.log("Posicion de la mano " + pos.x +"," + pos.y + "," + pos.z);

    // Si no estamos en ningún gesto, solo actualizamos la posición actual y el puntero
    if (state == detector.states.quiet) {
      var py = pos.y;
      var px = pos.x;
      var topeMH = 50;
      var topeMW = 50;
      if(pos.y <= topeMH){
        py = topeMH;
      }
      if(pos.x <= topeMW){
        px = topeMW;
      }
      var topeH = window.innerHeight-topeMH;
      if(pos.y >= topeH){
        py = topeH;
      }
      var topeW = window.innerWidth-topeMW;
      if(pos.x >= topeW){
        px = topeW;
      }
      document.getElementById('cursor').style.top = py + "px";
      document.getElementById('cursor').style.left = px + "px";
    }

    // Si estamos señalando, por cada frame que señalemos bajamos el radio de la
    // circunferencia externa del puntero, y si hemos llegado al tope y estamos sobre
    // un menú, pulsamos el botón al que estemos apuntando
    if (state == detector.states.pointer) {
      var elapsed_time = (new Date()) - on_pointer_time;
      //console.log("Pointer elapsed time: " + elapsed_time);
      document.getElementById('cursorCircle').style.height = Math.max(10, (30 - elapsed_time/100)) + 'pt';
      document.getElementById('cursorCircle').style.width = Math.max(10, (30 - elapsed_time/100)) + 'pt';
      cursor_var_top = parseInt(document.getElementById('cursor').style.top.replace('px', ''), 10);
      cursor_var_left = parseInt(document.getElementById('cursor').style.left.replace('px', ''), 10);
      if (menu && elapsed_time >= 2000) {
        var element = document.elementFromPoint(cursor_var_left, cursor_var_top);
        if (element != null/* && element.className == "menuButton") */){
          element.classList.add('clickedButton');
          setTimeout(function(){element.classList.remove('clickedButton');},250);
          element.click();
          on_pointer_time = new Date();
        }
      }
    }

    // Si estamos con el puño cerrado intentamos distinguir en qué eje nos movemos
    // Los movimientos horizontales de los verticales los distingue state_fist_moving
    // Si estamos en un estado de movimiento horizontal, no nos moveremos verticalmente
    // a no ser que sobrepasemos el umbral de la circunferencia, que está puesto
    // para que apenas se note la falta de fluidez y podamos movernos en el eje
    // que queramos con soltura
    if (state == detector.states.fist) {
      // Comprobamos el centro de la circunferencia y si nos hemos movido hacia alguna dirección
      if(state_fist_moving == 1){
        sphere_center = JSON.parse(JSON.stringify(pos));
        state_fist_moving = 2;
      }
        sphere_distance = (pos.x-sphere_center.x)*(pos.x-sphere_center.x)+(pos.y-sphere_center.y)*(pos.y-sphere_center.y);
        x_distance = Math.abs(pos.x-sphere_center.x);
        y_distance = Math.abs(pos.y-sphere_center.y);
        if(sphere_distance > sphere_radius){
          sphere_center = JSON.parse(JSON.stringify(pos));
          if(x_distance >= y_distance){
            state_fist_moving = 2;
          }
          else{
            state_fist_moving = 3;
          }
        }

    // Si aún no sabemos en qué eje nos estamos moviendo, movemos ambos parámetros
      if(state_fist_moving == 1){
        a -= Math.max(Math.abs(a),1) * diff.y/1000;
        b += Math.max(Math.abs(b),1) * diff.x/1000;
        if(a > rango_a[1])
          a = rango_a[1];
        else if(a < rango_a[0])
          a = rango_a[0]
        if(b > rango_b[1])
          b = rango_b[1];
        else if(b < rango_b[0])
          b = rango_b[0];
        var v_a = document.getElementsByClassName('a_format');
        var i;
        for(i = 0; i < v_a.length; i++){
          v_a[i].innerHTML = Math.round(a*100)/100;
        }
        var v_b = document.getElementsByClassName('b_format');
        for(i = 0; i < v_b.length; i++){
          v_b[i].innerHTML = Math.round(b*100)/100;
        }
      }
      else if(state_fist_moving == 2){
    // Si detectamos un movimiento horizontal solo movemos el segundo parámetro
          document.getElementById('fistVerticalInd').style.boxShadow = "none";
          document.getElementById('fistHorizontalInd').style.boxShadow = "0px 0px 10px #f6828c";
          b += Math.max(Math.abs(b),1) * diff.x/1000;
          if(b > rango_b[1]){
            b = rango_b[1];
          }
          else if(b < rango_b[0]){
            b = rango_b[0];
          }

          var v_b = document.getElementsByClassName('b_format');
          for(i = 0; i < v_b.length; i++){
            v_b[i].innerHTML = Math.round(b*100)/100;
          }
      }
      else if(state_fist_moving == 3){
    // Si detectamos un movimiento vertical solo movemos el primer parámetro
        document.getElementById('fistVerticalInd').style.boxShadow = "0px 0px 10px #f6828c";
        document.getElementById('fistHorizontalInd').style.boxShadow = "none";
        a -= Math.max(Math.abs(a),1) * diff.y/1000;
        if(a > rango_a[1]){
          a = rango_a[1];
        }
        else if(a < rango_a[0]){
          a = rango_a[0];
        }
        var v_a = document.getElementsByClassName('a_format');
        var i;
        for(i = 0; i < v_a.length; i++){
          v_a[i].innerHTML = Math.round(a*100)/100;
        }
      }

      // Volvemos a visualizar la función, ya que los parámetros han cambiado
      plot(a, b, dom_x, dom_y);
    }
    // Actualizamos los parámetros actuales de a y de b dentro de functions
    functions[current_function].a = a;
    functions[current_function].b = b;
  };


  // Gestor del evento de detección de puño cerrado. Ilumina los logos del puño
  detector.onFist = function() {
    //console.log("Puño detectado");
    document.getElementById('fistVerticalInd').style.boxShadow = "0px 0px 10px #f6828c";
    document.getElementById('fistHorizontalInd').style.boxShadow = "0px 0px 10px #f6828c";
  };

  // Gestor del evento de dejar de detectar el puño cerrado. Desactiva la iluminación
  // de los logos del puño
  detector.onFistRelease = function() {
    //console.log("Puño ya no detectado");
    document.getElementById('fistVerticalInd').style.boxShadow = "none";
    document.getElementById('fistHorizontalInd').style.boxShadow = "none";
  };

  // Gestor del evento de índice señalando, activa el tiempo del puntero activo
  detector.onPointer = function() {
    //console.log("Pointer detectado");
    on_pointer_time = new Date();
  };

  // Gestor del evento de índice dejando de apuntar, reinicia la circunferencia externa
  detector.onPointerRelease = function() {
    //console.log("Pointer ya no detectado");
    document.getElementById('cursorCircle').style.height = '30pt';
    document.getElementById('cursorCircle').style.width = '30pt';
  };

  // Gestor del evento de la mano volteada. Activa o desactiva el menú, según esté
  // desactivo o activo
  detector.onTurned = function() {
    //console.log("Volteo detectado");
    if (!menu) {
      show_menu();
      menu = true;
    } else {
      hide_menu();
      menu = false;
    }
  };

  // Gestor del evento de la mano dejada de voltear. No hace nada
  detector.onTurnedRelease = function() {
    //console.log("Volteo ya no detectado");
  };

  // Ponemos por defecto el detector de gestos en manual y lo iniciamos
  detector.manual();
  detector.start();
}




window.onload = main;
