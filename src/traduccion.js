var strings_idiomas = {
  esp:{
    explain_a_fun0:'<span class="a">a</span> controla la <span class="a">amplitud</span> de la onda.',
    explain_b_fun0:'<span class="b">b</span> controla la <span class="b">frecuencia</span> de la onda.',
    explain_a_fun1:'<span class="a">a</span> controla la <span class="a">amplitud ponderada</span> de la onda.',
    explain_b_fun1:'<span class="b">b</span> controla la <span class="b">frecuencia</span> de la onda.',
    explain_a_fun2:'<span class="a">σ</span> controla la <span class="a">desviación típica</span> de la función Gaussiana.',
    explain_b_fun2:'<span class="b">μ</span> controla la <span class="b">media</span> de la función Gaussiana.',
    funcion_1:'Función 1',
    funcion_2:'Función 2',
    funcion_3:'Función 3',
    rec_manual:"Reconocimiento manual",
    rec_aut:"Reconocimiento automático",
    change_lang:"Cambiar idioma al inglés",
    act_autom:"Activar los gestos automáticos",
    act_man:"Desactivar los gestos automáticos",
    restore_param:"Reestablecer parámetros de la función actual",
    restore_gestos:"Reestablecer gestos automáticos por defecto",
    adjust_gestos:"Ajustar gestos automáticos",
    help:"Ayuda",
    save_gestos:"Guardar gestos automáticos ajustados",
    training:"Explicación del entrenamiento",
    pointer_tr:"Pon la mano extendida y muevela como si estuvieses moviendo un puntero.",
    fist_tr:"Cierra el puño y muevelo como si estuvieses cambiando los parametros de la función.",
    point_tr:"Señala en todas las posiciones que quieras que se reconozcan.",
    flip_tr:"Mantén la mano volteada hacia arriba en todas las posiciones que quieras que se reconozcan.",
    processing: "Procesando la información...",
    end_tr:"Ajuste terminado. ¡Muchas gracias!"

  },
  eng:{
    explain_a_fun0:'<span class="a">a</span> allows you to control the <span class="a">amplitude</span> of the wave.',
    explain_b_fun0:'<span class="b">b</span> allows you to control the <span class="b">angular frequency</span> of the wave.',
    explain_a_fun1:'<span class="a">a</span> allows you to control the <span class="a">weighted amplitude</span> of the wave.',
    explain_b_fun1:'<span class="b">b</span> allows you to control the <span class="b">angular frequency</span> of the wave.',
    explain_a_fun2:'<span class="a">σ</span> allows you to control the <span class="a">standard deviation</span> of the Gaussian function',
    explain_b_fun2:'<span class="b">μ</span> allows you to control the <span class="b">mean</span> of the Gaussian function',
    funcion_1:'Function 1',
    funcion_2:'Function 2',
    funcion_3:'Function 3',
    rec_manual:"Manual recognition",
    rec_aut:"Automatic recognition",
    change_lang:"Change language to spanish",
    act_autom:"Turn on automatic gestures recognition",
    act_man:"Turn off automatic gestures recognition",
    restore_param:"Restore default parameters",
    restore_gestos:"Restore default automatic gestures",
    adjust_gestos:"Adjust automatic gestures",
    help:"Help",
    save_gestos:"Save automatic gestures",
    training:"Automatic gestures explanation",
    pointer_tr:"Extend your open hand and move it, as if you were moving a pointer",
    fist_tr:"Close your fist and move it, as if you were moving the parameters of the function",
    point_tr:"Point to all positions you want to be recognized",
    flip_tr:"Keep your hand flipped, palm looking upwards, in all positions you want to be recognized",
    processing:"Processing...",
    end_tr: "Process finished. Thank you very much!"
  }
}

function cambiarIdioma(idioma, current_function, autom){
  if(idioma == "esp"){
    idioma = "eng";
  }
  else{
    idioma = "esp";
  }
  document.getElementById('button9text').innerHTML = strings_idiomas[idioma].change_lang;

  functions[0].explain_a = strings_idiomas[idioma].explain_a_fun0;
  functions[0].explain_b = strings_idiomas[idioma].explain_b_fun0;
  functions[1].explain_a = strings_idiomas[idioma].explain_a_fun1;
  functions[1].explain_b = strings_idiomas[idioma].explain_b_fun1;
  functions[2].explain_a = strings_idiomas[idioma].explain_a_fun2;
  functions[2].explain_b = strings_idiomas[idioma].explain_b_fun2;
  change_function(current_function, false);
  if(current_function == 0){
    document.getElementById('button1text').innerHTML = strings_idiomas[idioma].funcion_2;
    document.getElementById('button2text').innerHTML = strings_idiomas[idioma].funcion_3;
  }
  else if(current_function == 1){
    document.getElementById('button1text').innerHTML = strings_idiomas[idioma].funcion_1;
    document.getElementById('button2text').innerHTML = strings_idiomas[idioma].funcion_3;
  }
  else{
    document.getElementById('button1text').innerHTML = strings_idiomas[idioma].funcion_1;
    document.getElementById('button2text').innerHTML = strings_idiomas[idioma].funcion_2;
  }
  document.getElementById('button3text').innerHTML = strings_idiomas[idioma].restore_param;
  if(autom == "manual"){
    document.getElementById('button4text').innerHTML = strings_idiomas[idioma].act_autom;
  }
  else{
    document.getElementById('button4text').innerHTML = strings_idiomas[idioma].act_man;
  }
  document.getElementById('button5text').innerHTML = strings_idiomas[idioma].adjust_gestos;
  document.getElementById('button6text').innerHTML = strings_idiomas[idioma].help;
  document.getElementById('button7text').innerHTML = strings_idiomas[idioma].save_gestos;
  document.getElementById('button8text').innerHTML = strings_idiomas[idioma].restore_gestos;
  document.getElementById('trainingExplainText').innerHTML = strings_idiomas[idioma].training;

  return idioma;
}
