function onOpen() {
  //Creamos el menu.
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('AUTOTEST')
      .addItem('Crear test', 'crearTest')
      .addToUi();
  
  //Tambien le añadimos un listener al sheet que se activará cuando entre una nueva respuesta de formulario.
   var sheet = SpreadsheetApp.getActive();
  ScriptApp.newTrigger("onFormSubmit")
   .forSpreadsheet(sheet)
   .onFormSubmit()
   .create();
 
}




function crearTest(){
  //Crear el test cogerá las filas de la hoja de formulario y creará una Form con una pregunta por fila, con sus datos.
  var hojaTest = SpreadsheetApp.getActive().getSheetByName("test");
  var test = FormApp.create(SpreadsheetApp.getActive().getName());
  var lugar = DriveApp.getRootFolder();
  
  
  var filas = hojaTest.getDataRange().getValues();
  test.addTextItem().setTitle("E-mail").setRequired(true);
  
  for (var i=0; i<filas.length; i++){
    test.addTextItem().setTitle(filas[i][0]);
  }
  
  test.setDestination(FormApp.DestinationType.SPREADSHEET, SpreadsheetApp.getActive().getId());
  moveToFolderAndTrash(test);
  
}

function moveToFolderAndTrash(file) {
  //Usamos esto para que el Form se cree en la carpeta Paquete.
  DriveApp.getFileById(SpreadsheetApp.getActive().getId()).getParents().next().addFile(DriveApp.getFileById(file.getId()));
  DriveApp.getRootFolder().removeFile(DriveApp.getFileById(file.getId()));

}
 
function onFormSubmit(){
  //Se activa con el trigger del mismo nombre, asignado arriba.
  //En resumen, va a iterar por los valores de la fila, comparandolo con la columna de respuestas. 
  //Según si contiene la respuesta o no, aumentará la nota o le pondrá el material adicional.
  
  var hojaRespuesta = SpreadsheetApp.getActive().getSheetByName("Respuestas de formulario 1");
  var nuevoRegistro = hojaRespuesta.getRange(hojaRespuesta.getLastRow(), 1, 1, hojaRespuesta.getLastColumn()).getValues();
  
  var hojaTest = SpreadsheetApp.getActive().getSheetByName("test");
  var datos = hojaTest.getDataRange().getValues();
  
  
  var recipient= nuevoRegistro[0][1];
  var aLeer ="";
  
  var preguntasTotales=0;
  var preguntasAcertadas=0;
  
  for (var i =2; i<nuevoRegistro[0].length; i++){
    preguntasTotales++;
    
    if(nuevoRegistro[0][i].toString().indexOf(datos[i-2][2].toString())!=-1){
      preguntasAcertadas++;
    }else{
      aLeer += datos[i-2][1] + " ";
    }
  }
  
  var res = "Nota: " + preguntasAcertadas*10/preguntasTotales + ". ";
  if (aLeer != ""){
     res+="Se recomienda leer: "+aLeer;
  }
  var mail = MailApp.sendEmail(recipient, "Nota test", res);
}