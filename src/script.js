var functions = [
  {
    expression: 'variable_a*sin(variable_b*x)',
    html: 'f(x)=<span class="a_format">a</span>sin(<span class="b_format">b</span>x)',
    explain_a: '<span class="a">a</span> controla la <span class="a">intensidad</span> de la onda.',
    explain_b: '<span class="b">b</span> controla la <span class="b">amplitud</span> de la onda.',
    dom_x: [-6,6],
    dom_y: [-6,6],
    rango_a: [-100, 100],
    rango_b: [-100, 100],
    a:2,
    b:3,
    seen: false
  },

  {
    expression: 'variable_a*x*sin(variable_b*x)',
    html: 'f(x)=<span class="a_format">a</span>x sin(<span class="b_format">b</span>x)',
    explain_a: '<span class="a">a</span> controla la <span class="a">intensidad ponderada</span> de la onda.',
    explain_b: '<span class="b">b</span> controla la <span class="b">amplitud</span> de la onda.',
    dom_x: [-6,6],
    dom_y: [-6,6],
    rango_a: [-100, 100],
    rango_b: [-100, 100],
    a:2,
    b:3,
    seen: false
  },

  {
    expression: '(1/(variable_a*sqrt(2*3.14159)))*exp((-1/2)*(x-variable_b)*(x-variable_b)/(variable_a*variable_a))',
    html: 'f(x)=(<span class="a_format">σ</span> √(2π))<sup>-1</sup> e<sup><sup>-(x-<span class="b_format">μ</span>)<sup>2</sup></sup>&frasl;<sub>2<span id="a" class="a_format">σ</span><sup>2</sup></sub></sup>',
    explain_a: '<span class="a">σ</span> controla la <span class="a">desviación típica</span> de la función Gaussiana.',
    explain_b: '<span class="b">μ</span> controla la <span class="b">media</span> de la función Gaussiana.',
    dom_x: [-12,12],
    dom_y: [-1,1],
    rango_a: [0.001, 100],
    rango_b: [-100, 100],
    a:1,
    b:0,
    seen: false
  }
];

var rango_a;
var rango_b;
var current_function = 2;

var a = 2;
var b = 3;

var dom_x = [-6, 6];
var dom_y = [-6, 6];

var detector = new GestureDetector(4);
var menu = false;

function change_function(fun_num, change_expression=true) {
  current_function = fun_num;
  var f = functions[current_function];
  f.seen = true;
  document.getElementById("functionExpression").innerHTML = f.html;
  document.getElementById("paramAExplainText").innerHTML = f.explain_a;
  document.getElementById("paramBExplainText").innerHTML = f.explain_b;
  rango_a = f.rango_a;
  rango_b = f.rango_b;
  a = f.a;
  b = f.b;
  if (change_expression){
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
  plot(a, b);
}


function plot(a_1, b_1) {
  var target = document.getElementById('plot');
  var f = functions[current_function];
  var fn_str = f.expression.replace(/variable_a/g, a_1);
  fn_str = fn_str.replace(/variable_b/g, b_1);
  //console.log(fn_str);
  functionPlot({
    target: target,
    width: target.clientWidth,
    height: target.clientHeight,
    data: [{
      fn: fn_str
    }]
  }).programmaticZoom(f.dom_x, f.dom_y);

  document.body.onresize = function() {
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
  menu = true;
}

function button1(){
  if(current_function == 0){
    current_function = 1;
  }
  else {
    current_function = 0;
  }
  hide_menu();
  change_function(current_function, functions[current_function].seen);
}

function button2(){
  if(current_function == 2){
    current_function = 1;
  }
  else{
    current_function = 2;
  }
  hide_menu();
  change_function(current_function, functions[current_function].seen);
}

function button3(){
  if (detector.mode == "manual") {
    document.getElementById('menuButton3').innerHTML = "Reconocimiento manual";
    detector.automatic();
  } else {
    document.getElementById('menuButton3').innerHTML = "Reconocimiento automático";
    detector.manual();
  }
}

function hide_menu() {
  document.getElementById('app').style.filter = 'none';
  document.getElementById('menu').style.visibility = 'hidden';
  document.getElementById('cursor').style.visibility = 'hidden';
  menu = false;
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
  change_function(current_function, false);

  document.addEventListener('keyup', function (event) {
    var key = event.key || event.keyCode;
    if (key === 't') {
      train_neural_network(detector);
    } else if (key == 'd') {
        download("network.json", "gesture_network=" + JSON.stringify(detector.neural_network) + ";");
    } else {
      if (!menu) {
        show_menu();
      } else {
        hide_menu();
      }
    }
  });

  var on_pointer_time = new Date();

  var state_fist_moving = 1;
  var sphere_center = {x:0, y:0, z:0};
  var sphere_radius=20000;

  detector.onMove = function(pos, diff, state) {
    //console.log("Posicion de la mano " + pos.x +"," + pos.y + "," + pos.z);
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

        //console.log("Estoy en el estado " + state_fist_moving);
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
      plot(a, b, dom_x, dom_y);
    }
    functions[current_number_f].a = a;
    functions[current_number_f].b = b;
  };

  detector.onFist = function() {
    //console.log("Puño detectado");
    document.getElementById('fistVerticalInd').style.boxShadow = "0px 0px 10px #f6828c";
    document.getElementById('fistHorizontalInd').style.boxShadow = "0px 0px 10px #f6828c";
  };

  detector.onFistRelease = function() {
    //console.log("Puño ya no detectado");
    document.getElementById('fistVerticalInd').style.boxShadow = "none";
    document.getElementById('fistHorizontalInd').style.boxShadow = "none";
  };

  detector.onPointer = function() {
    //console.log("Pointer detectado");
    on_pointer_time = new Date();
  };

  detector.onPointerRelease = function() {
    //console.log("Pointer ya no detectado");
    document.getElementById('cursorCircle').style.height = '30pt';
    document.getElementById('cursorCircle').style.width = '30pt';
  };

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

  detector.onTurnedRelease = function() {
    //console.log("Volteo ya no detectado");
  };

  detector.manual();
  detector.start();
}




window.onload = main;
