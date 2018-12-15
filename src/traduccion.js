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
    restore_param:"Reestablecer parámetros de la función actual",
    restore_gestos:"Reestablecer gestos automáticos por defecto"

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
    restore_param:"Restore default parameters",
    restore_gestos:"Restore default automatic gestures"
  }
}

function cambiarIdioma(idioma, current_function){
  if(idioma == "esp"){
    idioma = "eng";
  }
  else{
    idioma = "esp";
  }
  document.getElementById('button9text').innerHTML = strings_idiomas[idioma].change_lang;
  change_function(current_function);
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
  return idioma;
}
