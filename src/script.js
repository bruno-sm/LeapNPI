var functions = [
  {
    expression: 'variable_a*sin(variable_b*x)',
    html: 'f(x)=<span class="a_format">a</span>sin(<span class="b_format">b</span>x)',
    explain_a: '<span class="a">a</span> controla la <span class="a">intensidad</span> de la onda.',
    explain_b: '<span class="b">b</span> controla la <span class="b">amplitud</span> de la onda.',
    dom_x: [-6,6],
    dom_y: [-6,6],
    rango_a: [-100, 100],
    rango_b: [-100, 100]
  },

  {
    expression: 'variable_a*x*sin(variable_b*x)',
    html: 'f(x)=<span class="a_format">a</span>x*sin(<span class="b_format">b</span>x)',
    explain_a: '<span class="a">a</span> controla la <span class="a">intensidad ponderada</span> de la onda.',
    explain_b: '<span class="b">b</span> controla el <span class="b">amplitud</span> de la onda.',
    dom_x: [-6,6],
    dom_y: [-6,6],
    rango_a: [-100, 100],
    rango_b: [-100, 100]
  },

  {
    expression: '(1/(variable_a*sqrt(2*3.14159)))*exp((-1/2)*(x-variable_b)*(x-variable_b)/(variable_a*variable_a))',
    html: 'f(x)=(1/(<span class="a_format">a</span>*sqrt(2*3.14159)))*exp((-1/2)*(x-<span class="b_format">b</span>)*(x-<span class="b_format">b</span>)/(<span id="a" class="a">a</span>*<span class="a_format">a</span>))',
    explain_a: '<span class="a">a</span> controla la <span class="a">media</span> de la función Gaussiana.',
    explain_b: '<span class="b">b</span> controla el <span class="b">desviación típica</span> de la función Gaussiana.',
    dom_x: [-12,12],
    dom_y: [-1,1],
    rango_a: [0.001, 100],
    rango_b: [-100, 100]
  }
];

var rango_a;
var rango_b;
var current_number_f = 2;
var current_function = functions[current_number_f];

var a = 2;
var b = 3;

var dom_x = [-6, 6];
var dom_y = [-6, 6];

function change_function(f) {
  current_function = f;
  document.getElementById("functionExpression").innerHTML = f.html;
  document.getElementById("paramAExplainText").innerHTML = f.explain_a;
  document.getElementById("paramBExplainText").innerHTML = f.explain_b;
  rango_a = f.rango_a;
  rango_b = f.rango_b;
  console.log("HEEEEEEEEEEEEEEEEEEEEY");
}


function plot(a_1,b_1) {
  var target = document.getElementById('plot');
  var fn_str = current_function.expression.replace(/variable_a/g, a_1);
  fn_str = fn_str.replace(/variable_b/g, b_1);
  console.log(fn_str);
  functionPlot({
    target: target,
    width: target.clientWidth,
    height: target.clientHeight,
    data: [{
      fn: fn_str
    }]
  }).programmaticZoom(current_function.dom_x, current_function.dom_y);

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
  /*for (var i = 0; i < buttons.length; i++) {
    console.log(buttons[i].id + " clicked event");
    buttons[i].onclick = function () {
      console.log("clicked");
    }
  }*/
}

function button1(){
  if(current_number_f == 0){
    current_number_f = 1;
  }
  else {
    current_number_f = 0;
  }
  hide_menu();
  menu = false;
  change_function(functions[current_number_f]);
  plot(a, b, dom_x, dom_y);

}

function button2(){
  if(current_number_f == 2){
    current_number_f = 1;
  }
  else{
    current_number_f = 2;
  }
  hide_menu();
  menu = false;
  change_function(functions[current_number_f]);
  plot(a, b, dom_x, dom_y);
}

function hide_menu() {
  document.getElementById('app').style.filter = 'none';
  document.getElementById('menu').style.visibility = 'hidden';
  document.getElementById('cursor').style.visibility = 'hidden';
}

var volteado = false;


function main() {
  change_function(current_function);
  plot(a, b, dom_x, dom_y);

  var menu = false;
  document.body.onkeypress = function() {
    if (!menu) {
      show_menu();
      menu = true;
    } else {
      hide_menu();
      menu = false;
    }
  }

  var detector = new GestureDetector(30);

  var on_pointer_time = new Date();

  var state_fist_moving = 1;
  var sphere_center = {x:0, y:0, z:0};
  var sphere_radius=20000;

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
          setInterval(function(){element.classList.remove('clickedButton');},250);
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

        console.log("Estoy en el estado " + state_fist_moving);
      if(state_fist_moving == 1){
        a -= a * diff.y/1000;
        b += b * diff.x/1000;
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
          b += b * diff.x/1000;
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
        a -= a * diff.y/1000;
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

  detector.start_manual();
}




window.onload = main;
