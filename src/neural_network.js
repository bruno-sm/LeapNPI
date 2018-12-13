function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function create_training_set () {
  //console.log(stored_training_set);
  var training_set = [];
  var input = [0.0, 0.0, 0.0,
               0.0, 0.0, 0.0,
               0.0, 0.0, 0.0,
               0.0, 0.0, 0.0,
               0.0, 0.0, 0.0,
               0.0];
  var controller = Leap.loop({background: true}, {hand: (hand) => {
    for (var i=0; i < 5; i++) {
      input[3*i] = hand.fingers[i].direction[0];
      input[3*i+1] = hand.fingers[i].direction[1];
      input[3*i+2] = hand.fingers[i].direction[2];
    }
    input[15] = hand.roll();
    //console.log(input);
  }});

  var count = {fist: 0, pointer: 0, quiet: 0, turned: 0};
  document.addEventListener('keyup', function (event) {
    console.log(input);
    var key = event.key || event.keyCode;
    if (key === 'f') {
      count.fist += 1;
      console.log("Fist " + count.fist);
      training_set.push({
        input: input.slice(),
        output: [0, 1, 0, 0]
      });
    } else if (key === 'p') {
      count.pointer += 1;
      console.log("Pointer " + count.pointer);
      training_set.push({
        input: input.slice(),
        output: [0, 0, 1, 0]
      });
    } else if (key === 'q') {
      count.quiet += 1;
      console.log("Quiet " + count.quiet);
      training_set.push({
        input: input.slice(),
        output: [1, 0, 0, 0]
      });
    } else if (key === 't') {
      count.turned += 1;
      console.log("Turned " + count.turned);
      training_set.push({
        input: input.slice(),
        output: [0, 0, 0, 1]
      });
    } else {
      console.log("Print");
      download("training_set.json", "stored_training_set=" + JSON.stringify(training_set) + ";");
    }
  });

  controller.connect();
}


function recognice() {
  var perceptron = new synaptic.Architect.Perceptron(16,7,3,4);
  var trainer = new synaptic.Trainer(perceptron);
  trainer.train(stored_training_set);
  var input = [0.0, 0.0, 0.0,
               0.0, 0.0, 0.0,
               0.0, 0.0, 0.0,
               0.0, 0.0, 0.0,
               0.0, 0.0, 0.0,
               0.0];
  Leap.loop({background: true}, {hand: (hand) => {
    for (var i=0; i < 5; i++) {
      input[3*i] = hand.fingers[i].direction[0];
      input[3*i+1] = hand.fingers[i].direction[1];
      input[3*i+2] = hand.fingers[i].direction[2];
    }
    input[15] = hand.roll();
    result = perceptron.activate(input);
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
  }}).connect();

  document.addEventListener('keyup', function (event) {
    console.log("Print");
    download("network.json", "gesture_network=" + JSON.stringify(perceptron) + ";");
  });
}

function main() {
  //create_training_set();
  recognice();
}


window.onload = main;
