class GestureDetector {

  constructor(waiting_thres) {
    this.waiting_thres = waiting_thres;
    this.frame_waiting = 0;
    this.states = {quiet: "quiet", fist: "fist", pointer: "pointer", turned: "turned"};
    this.current_state = this.states.quiet;
    this.current_position = {x: 0.0, y: 0.0, z: 0.0};
    this.volteado = false;
    this.set_neural_network(Network.fromJSON(gesture_network));
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
      }
    };
    this._onMove = function(position, diff) {
      console.log("Posición actual de la mano: " + position.x + ", " + position.y + ', ' + position.z);
    };

    this.hand_made_controller = Leap.loop({background: true}, {
      hand: (hand) => {
        var some_gesture = false;
        var pos_x = (hand.screenPosition()[0])*1.5-500;
        var pos_y = (hand.screenPosition()[1]+700)*1.5-500;
        var pos_z = hand.screenPosition()[2]/3-100;
        var diff = {x: pos_x - this.current_position.x,
                    y: pos_y - this.current_position.y,
                    z: pos_z - this.current_position.z};
        this.current_position.x = pos_x;
        this.current_position.y = pos_y;
        this.current_position.z = pos_z;
        this._onMove(this.current_position, diff, this.current_state);


        // Gesto de cerrar el puño
        var v = [];
        var best_v = -2;
        // 1-4 fingers -> all except the thumb
        for( var finger_i = 1; finger_i < 5; finger_i++){
          var bone = hand.fingers[finger_i].bones[3]; // distal bone
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
        if(best_v > 0.5 &&  index_z > 0.8 && (this.current_state == this.states.quiet || this.current_state == this.states.pointer)){
          some_gesture = true;
          if(this.current_state != this.states.pointer){
            this.state_callbacks[this.current_state].release();
            this.current_state = this.states.pointer;
            this.state_callbacks[this.current_state].on();
          }
        }

        // Gesto de volteado
        var palm_y = hand.palmNormal[1];
        var palm_x = hand.palmNormal[0];
        var palm_z = hand.palmNormal[2];
        this.volteado = this.volteado && !some_gesture;

        if(palm_y > 0.7 && this.volteado){
          some_gesture = true;
          if(this.current_state != this.states.turned){
            this.state_callbacks[this.current_state].release();
            this.current_state = this.states.turned;
            this.state_callbacks[this.current_state].on();
          }
        }
        if(palm_y < -0.7){
          this.volteado = true;
        }
        if(this.volteado){
          if(palm_x > 0.4){
            this.volteado = false;
          }
          if(palm_z < -0.4 || palm_z > 0.4){
            this.volteado = false;
          }
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
        console.log("Estado actual: " + this.current_state);
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
    });
  }

  set onMove(callback) {
    this._onMove = callback;
  }

  set onFist(callback) {
    this.state_callbacks[this.states.fist].on = callback;
  }

  set onFistRelease(callback) {
    this.state_callbacks[this.states.fist].release = callback;
  }

  set onPointer(callback) {
    this.state_callbacks[this.states.pointer].on = callback;
  }

  set onPointerRelease(callback) {
    this.state_callbacks[this.states.pointer].release = callback;
  }

  set onTurned(callback) {
    this.state_callbacks[this.states.turned].on = callback;
  }

  set onTurnedRelease(callback) {
    this.state_callbacks[this.states.turned].release = callback;
  }

  set_neural_network(n) {
    this.neural_network = n;
    this.automatic_controller = Leap.loop({background: true}, {hand: (hand) => {
      var input = [0.0, 0.0, 0.0,
                   0.0, 0.0, 0.0,
                   0.0, 0.0, 0.0,
                   0.0, 0.0, 0.0,
                   0.0, 0.0, 0.0,
                   0.0];
      for (var i=0; i < 5; i++) {
        input[3*i] = hand.fingers[i].direction[0];
        input[3*i+1] = hand.fingers[i].direction[1];
        input[3*i+2] = hand.fingers[i].direction[2];
      }
      input[15] = hand.roll();
      result = this.neural_network.activate(input);
      index = result.indexOf(Math.max(...result));
      if (index == 0) {
        console.log("Quiet");
      } else if (index == 1) {
        console.log("Fist");
      } else if (index == 2) {
        console.log("Pointer");
      } else if (index == 3) {
        console.log("Turned");
      }
      console.log(result);
    }});
  }

  start_manual() {
    if (this.automatic_controller.connected()) {
      this.automatic_controller.disconnect();
    }
    this.automatic_controller.connect();
  }

  start_automatic() {
    if (this.hand_made_controller.connected()) {
      this.hand_made_controller.disconnect();
    }
    this.automatic_controller.connect();
  }
}
