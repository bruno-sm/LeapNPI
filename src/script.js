var a = 2;
var b = 3;
var estado = 0;
var pos_ref_x;
var pos_ref_y;
var dist_to_ref = 0;
var state_thres = 5;

var quiet_state = 0;
var fist_state = 1;
var pointer_state = 2;
var moving_state = 3;
var moving_state_x = 4;
var moving_state_y = 5;

var waiting_thres = 500;
var frame_waiting = 0;

var dom_x = [-6, 6];
var dom_y = [-6, 6];
var dom_ref_x = [-6,6];
var dom_ref_y = [-6,6];

function plot(a_1,b_1, dom_x_1, dom_y_1) {
  var target = document.getElementById('plot');
  var fn_str = a_1 + '*sin(' + b_1 + '*x)';
  var funP = functionPlot({
    target: target,
    width: target.clientWidth,
    height: target.clientHeight,
    data: [{
      fn: fn_str
    }]
  })
  funP.programmaticZoom(dom_x_1, dom_y_1);
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
}


function hide_menu() {
  document.getElementById('app').style.filter = 'none';
  document.getElementById('menu').style.visibility = 'hidden';
  //document.getElementById('cursor').style.visibility = 'hidden';
}

var volteado = false;
Leap.loop({background: true}, {
  hand: function (hand) {

    var some_gesture = false;
    if(estado != 0){
      dist_to_ref = Math.abs(pos_cur_x-pos_ref_x)*Math.abs(pos_cur_x-pos_ref_x)+Math.abs(pos_cur_y-pos_ref_y)*Math.abs(pos_cur_y-pos_ref_y);
    }

    var pos_cur_x = (hand.screenPosition()[0])*1.5-500;
    var pos_cur_y = (hand.screenPosition()[1]+700)*1.5-500;
    var pos_cur_z = hand.screenPosition()[2]/3-100;
    console.log("Posicion de la mano " + pos_cur_x +"," + pos_cur_y + "," + pos_cur_z)
    document.getElementById('cursor').style.top = pos_cur_y + "px";
    document.getElementById('cursor').style.left = pos_cur_x + "px";

    // Gesto de cerrar el puño
    var v = [];
    var best_v = -2;
    // 1-4 fingers -> all except the thumb
    for( var finger_i = 1; finger_i < 5; finger_i++){

      bone = hand.fingers[finger_i].bones[3]; // distal bone


        v.push((new THREE.Vector3).fromArray(bone.basis[1]));//up vector
        var v2 = (new THREE.Vector3).fromArray(hand.palmNormal);

        if(v[v.length-1].dot(v2) > best_v){
          best_v = v[v.length-1].dot(v2);
        }
      };
    var cos_in = 1;
    for(var index_v = 0; index_v < v.length-1; index_v++){
      var new_cos = (v[index_v]).dot(v[index_v+1]);
      cos_in = new_cos*cos_in;
    }
    if(cos_in > 0.90 && best_v > 0.5 && v[0].dot((new THREE.Vector3).fromArray([0,-1,0])) > 0.3 && (estado == quiet_state || estado == fist_state)){
      console.log("Estás cerrando el puño con una fuerza de \n" + best_v);
      some_gesture = true;
      volteado = false;
      if(estado == quiet_state){
        pos_ref_x = pos_cur_x;
        pos_ref_y = pos_cur_y;
        dom_ref_x = dom_x;
        dom_ref_y = dom_y;
        estado = fist_state;
      }
      else if(estado == fist_state){
        // Se mira la distancia de pos_cur a pos_ref y se hace un movimiento correspondiente
        // en la gráfica
        dom_x[0] = dom_ref_x[0] + pos_cur_x - pos_ref_x;
        dom_x[1] = dom_ref_x[1] + pos_cur_x - pos_ref_x;
        dom_y[0] = dom_ref_y[0] + pos_cur_y - pos_ref_y;
        dom_y[1] = dom_ref_y[1] + pos_cur_y - pos_ref_y;
        //plot(a,b,dom_x,dom_y)
        console.log("El valor de dom_x es " + dom_x[0] + "," + dom_x[1])
        console.log("El valor de dom_y es " + dom_y[0] + "," + dom_y[1])

      }
    }

    // Gesto de apuntar con el dedo
    v = [];
    best_v = -2;
    for( var finger_i = 2; finger_i < 5; finger_i++){

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
    var index_z = hand.fingers[1].bones[2].basis[2][2];
    if(best_v > 0.5 &&  index_z > 0.8 && (estado == quiet_state || estado == pointer_state)){
      console.log("Estás apuntando con el dedo con una fuerza de \n" + index_z );
      some_gesture = true;
      volteado = false;
      if(estado == quiet_state){
        pos_ref_x = pos_cur_x;
        pos_ref_y = pos_cur_y;
        estado = pointer_state;
      }
      else if(estado == pointer_state){
        // Se mira la distancia de pos_cur_z al 0 y se activa el cursor ese porcentaje
        document.getElementById('cursorCircle').style.height = Math.min(30, (30 + pos_cur_z/5)) + 'pt';
        document.getElementById('cursorCircle').style.width = Math.min(30, (30 + pos_cur_z/5)) + 'pt';
      }
    }

    // Gesto de coger

    var near_ind_th = ((new THREE.Vector3).fromArray(hand.fingers[0].dipPosition)).distanceTo((new THREE.Vector3).fromArray(hand.fingers[1].dipPosition))
    var umbral = 40;
    if(near_ind_th < umbral && (estado == quiet_state || estado == moving_state || estado == moving_state_x || estado == moving_state_y)){
      console.log("Estas cogiendo algo con una fuerza de " + near_ind_th);
      some_gesture = true;
      volteado = false;
      if(estado == quiet_state){
        pos_ref_x = pos_cur_x;
        pos_ref_y = pos_cur_y;
        estado = moving_state;
      }
      else if(estado == moving_state){
        //Se ha detectado el gesto pero no sabemos en qué eje.
        if(dist_to_ref > state_thres){
          var dist_x = Math.abs(pos_cur_x-pos_ref_x);
          var dist_y = Math.abs(pos_cur_y-pos_ref_y);

          if(dist_x > dist_y){
            estado = moving_state_x; // Se ha reconocido un cambio horizontal
          }
          else{
            estado = moving_state_y; // Se ha reconocido un cambio vertical
          }
        }
      }
      else if(estado == moving_state_x){
        // Se mira la distancia en x y se cambia el valor de b
        var dist_x = pos_cur_x-pos_ref_x;
        dist_x = dist_x/50;
        b += b * dist_x / 1000;
      }
      else if(estado == moving_state_y)
      {
        // Se mira la distancia en y y se cambia el valor de a
        var dist_y = pos_cur_y-pos_ref_y;
        dist_y = dist_y/50;
        a += a * dist_y / 1000;
      }
    }

    // Gesto de volteado

    var palm_y = hand.palmNormal[1];
    var palm_x = hand.palmNormal[0];
    var palm_z = hand.palmNormal[2];


    if(palm_y > 0.7 && volteado){
      console.log("Has dado una vuelta entera, se ha activado el volteado!");
      some_gesture = true;
      if (!menu) {
        show_menu();
        menu = true;
      } else {
        hide_menu();
        menu = false;
      }
      estado = 0;

      volteado = false
    }
    if(palm_y < -0.7){
      volteado = true;
    }
    if(volteado){
      if(palm_x > 0.4){
        volteado = false;
      }
      if(palm_z < -0.4 || palm_z > 0.4){
        volteado = false;
      }
      if(cos_in < 0.8){
        volteado = false;
      }
    }
    if(!some_gesture){
      frame_waiting += 1;
      if(frame_waiting > waiting_thres){
        estado = 0;
        frame_waiting = 0;
      }
    }
    console.log("Estado actual: " + estado);
    console.log("Valores de a y b: " + a +", " + b);
  //  plot(a,b);
}})

.use('screenPosition')
.use('handHold')
.use('handEntry')
.on('handFound', function(hand){
  var colors = [0xff0000, 0x00ff00, 0x0000ff];
  var length = 24;

  hand.fingers.forEach(function (finger) {

    var arrows = [];

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
.on('handLost', function(hand){

  hand.fingers.forEach(function (finger) {
    var arrows = finger.data('arrows');


    finger.data({arrows: null});

  });

//  renderer.render(scene, camera);

})
.connect();


function main() {
  plot(a,b, dom_x, dom_y);

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
