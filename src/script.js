function plot() {
  var target = document.getElementById('plot');
  functionPlot({
    target: target,
    width: target.clientWidth,
    height: target.clientHeight,
    data: [{
      fn: '2*sin(3*x)'
    }]
  })
}


function show_menu() {
  document.getElementById('app').style.filter = 'blur(5px)';
  document.getElementById('menu').style.visibility = 'visible';
  document.getElementById('cursor').style.visibility = 'visible';
}


function hide_menu() {
  document.getElementById('app').style.filter = 'none';
  document.getElementById('menu').style.visibility = 'hidden';
  document.getElementById('cursor').style.visibility = 'hidden';
}


function main() {
  plot();

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
}


window.onload = main;
