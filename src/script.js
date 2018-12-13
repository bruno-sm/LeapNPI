var functions = [
  {
    expression1: "",
    expression2: "*sin(",
    expression3: "*x)",
    html: 'f(x)=<span id="a" class="a">a</span>sin(<span id="b" class="b">b</span>x)',
    explain_a: '<span class="a">a</span> controla la <span class="a">intensidad</span> de la onda.',
    explain_b: '<span class="b">b</span> controla la <span class="b">amplitud</span> de la onda.'
  }
];

var current_function = functions[0];

function change_function(f) {
  current_function = f;
  document.getElementById("functionExpression").innerHTML = f.html;
  document.getElementById("paramAExplainText").innerHTML = f.explain_a;
  document.getElementById("paramBExplainText").innerHTML = f.explain_b;
}


function plot(a_1,b_1, dom_x_1, dom_y_1) {
  var target = document.getElementById('plot');
  var fn_str = a_1 + current_function.expression2 + b_1 + current_function.expression3;
  functionPlot({
    target: target,
    width: target.clientWidth,
    height: target.clientHeight,
    data: [{
      fn: fn_str
    }]
  }).programmaticZoom(dom_x_1, dom_y_1);

  document.body.onresize = function() {
    var fn_str = a_1 + '*sin(' + b_1 + '*x)';
    functionPlot({
      target: target,
      width: target.clientWidth,
      height: target.clientHeight,
      data: [{
        fn: fn_str
      }]
    })
  }
}


function show_menu() {
  document.getElementById('app').style.filter = 'blur(5px)';
  document.getElementById('menu').style.visibility = 'visible';
  document.getElementById('cursor').style.visibility = 'visible';
  var buttons = document.getElementsByClassName("menuButton");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function () {
      console.log("clicked");
    }
  }
}


function hide_menu() {
  document.getElementById('app').style.filter = 'none';
  document.getElementById('menu').style.visibility = 'hidden';
  document.getElementById('cursor').style.visibility = 'hidden';
}


function train_neural_network(gesture_detector) {
  if (localStorage.gesture_network) {
    var network = synaptic.Network.fromJSON(localStorage.gesture_network);
  } else {
    var network = synaptic.Network.fromJSON(gesture_network);
  }
  var elapsed_time = 0;
  var training_time = 20000;
  var training_set = [];

  // Cambia el resultado esperado cada 20 segundos
  var expected_output = [1, 0, 0, 0];
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

  // Aumenta el conjunto de entrenamiento cada 0.1 segundos
  var sample_time = 100;
  var wait_time = 3000.0; // Tiempo de espera para que el usuario cambie el gesto
  sample_timer = setInterval(function(){
    if ((elapsed_time > (2/3 * wait_time)) &&
        (elapsed_time < training_time - (1/3 * wait_time) || elapsed_time > training_time + (2/3 * wait_time)) &&
        (elapsed_time < 2*training_time - (1/3 * wait_time) || elapsed_time > 2*training_time + (2/3 * wait_time)) &&
        (elapsed_time < 3*training_time - (1/3 * wait_time) || elapsed_time > 3*training_time + (2/3 * wait_time))) {
          var input = gesture_detector.last_input;
          training_set.push({
            input: input.slice(),
            output: expected_output
          });
        }
  }, sample_time);

  // Da instrucciones
  console.log("Pon la mano extendida");
  setTimeout(function(){console.log("Cierra el puño");}, training_time);
  setTimeout(function(){console.log("Señala");}, 2*training_time);
  setTimeout(function(){console.log("Gira la mano");}, 3*training_time);

  // Termina el muestreo y entrena a la red neuronal
  setTimeout(function(){
    console.log("Termina el sampleo");
    clearInterval(output_timer);
    clearInterval(sample_timer);
    var trainer = new synaptic.Trainer(network);
    trainer.train(training_set);
    gesture_detector.set_neural_network(network);
    console.log("Red entrenada");
  }, 4*training_time);
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


function main() {
  var a = 2;
  var b = 3;
  var dom_x = [-6, 6];
  var dom_y = [-6, 6];
  var detector = new GestureDetector(30);
  change_function(functions[0]);
  plot(a, b, dom_x, dom_y);

  var menu = false;
  document.addEventListener('keyup', function (event) {
    var key = event.key || event.keyCode;
    if (key === 't') {
      train_neural_network(detector);
    } else if (key == 'd') {
        download("network.json", "gesture_network=" + JSON.stringify(detector.neural_network) + ";");
    } else {
      if (!menu) {
        show_menu();
        menu = true;
      } else {
        hide_menu();
        menu = false;
      }
    }
  });

  var on_pointer_time = new Date();

  detector.onMove = function(pos, diff, state) {
    //console.log("Posicion de la mano " + pos.x +"," + pos.y + "," + pos.z);
    if (state == detector.states.quiet) {
      document.getElementById('cursor').style.top = pos.y + "px";
      document.getElementById('cursor').style.left = pos.x + "px";
    }

    if (state == detector.states.pointer) {
      var elapsed_time = (new Date()) - on_pointer_time;
      //console.log("Pointer elapsed time: " + elapsed_time);
      document.getElementById('cursorCircle').style.height = Math.max(10, (30 - elapsed_time/100)) + 'pt';
      document.getElementById('cursorCircle').style.width = Math.max(10, (30 - elapsed_time/100)) + 'pt';
      cursor_var_top = parseInt(document.getElementById('cursor').style.top.replace('px', ''), 10);
      cursor_var_left = parseInt(document.getElementById('cursor').style.left.replace('px', ''), 10);
      if (menu && elapsed_time >= 2000) {
        var element = document.elementFromPoint(cursor_var_left, cursor_var_top);
        if (element != null && element.className == "menuButton") {
          element.classList.add('clickedButton');
          setTimeout(function(){element.classList.remove('clickedButton');},250);
          element.click();
          on_pointer_time = new Date();
        }
      }
    }

    if (state == detector.states.fist) {
      a += a * diff.y/1000;
      b += b * diff.x/1000;
      document.getElementById('a').innerHTML = Math.round(a*100)/100;
      document.getElementById('b').innerHTML = Math.round(b*100)/100;
      plot(a, b, dom_x, dom_y);
    }
  };

  detector.onFist = function() {
    console.log("Puño detectado");
    document.getElementById('moveCont').style.boxShadow = "0px 0px 10px #f6828c";
  };

  detector.onFistRelease = function() {
    console.log("Puño ya no detectado");
    document.getElementById('moveCont').style.boxShadow = "none";
  };

  detector.onPointer = function() {
    console.log("Pointer detectado");
    on_pointer_time = new Date();
  };

  detector.onPointerRelease = function() {
    console.log("Pointer ya no detectado");
    document.getElementById('cursorCircle').style.height = '30pt';
    document.getElementById('cursorCircle').style.width = '30pt';
  };

  detector.onTurned = function() {
    console.log("Volteo detectado");
    if (!menu) {
      show_menu();
      menu = true;
    } else {
      hide_menu();
      menu = false;
    }
  };

  detector.onTurnedRelease = function() {
    console.log("Volteo ya no detectado");
  };

  detector.automatic();
  detector.start();
}




window.onload = main;
