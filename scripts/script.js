

////FILE MENU///////////////////////////////////////////////////////////////////////////////

//functions for opening and parsing document

//functions for altering and updating parameters

////////
//DRAW//

//functions for selecting points in a brush area  (~L 480)

//functions for: sorting elements, moving element to front/back and normal law function (~ L 1630)

//function: linearregression


//////////////////////////////////////////////////////////////////////////////////////////


//opens and closes tabs
function openTab(tabName) {
  
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

//opens the first tab by default
document.getElementById("tab_button_upload").click();


//*********************************************************************//
//*******************INITIALIZATION OF VARIABLES***********************//

/**holds the data of csv charts */
var obj_csv = {
    size:0,
    name:"",
    dataFile:[]
};
/**contains the parsed data of all files */
var fileData=[{},{},{},{}];
/** contains the data to delete when treatment is done*/
var toDeleteData = {};
/** contains the data set from which data has to be deleted*/
var wholeData = {};
/** contains the names of the columns, corresponds to the first array of an array*/
var columnNames = {};
/** logs the modification of the data files*/
var fileLogs=["","","",""];
/** logs additional info  of the data files*/
var fileParameters=[{},{},{},{}];
/** logs if a file has yet been uploaded*/
var isFileUploaded=false;
/**logs the calibration data of the files */
var fileCalibData=[{},{},{},{}];

var html_tabtreatment = document.getElementById("tab_treatment")
var html_tabTable = document.getElementById("tab_table")
var html_tabParameters = document.getElementById("tab_parameters")
var html_tabPca = document.getElementById("tab_pca")
var html_tabVenn = document.getElementById("tab_venn")
var html_tabNetwork = document.getElementById("tab_network")
var html_tabAttrib = document.getElementById("tab_attrib")
var html_tabCalib = document.getElementById("tab_calib")

//*********************************************************************//
//*******************LAST INITIALIZATION*******************************//

document.addEventListener("DOMContentLoaded", () => {
  console.log('Hello  ! Puncdata ready for use');

    //adapts for every screen resolution:
  if(document.body.offsetWidth >1500){
    width = 500;
    updateParametersShownValues()
  }


  //custom parameters for coloris
  Coloris({
    themeMode: 'auto',
    alpha: true,
    theme: 'large',
    swatches: [
      '#4a82be','#80D6CF','#5aad5f','#96c756','#edc948','#f38f32','#df4f50','#b772ca',
      '#285B91','#519F98','#36823B','#6B9730','#B79621','#BE630F','#AB2829','#854797',
      '#77A1CE','#A0E0DB','#83C187','#B0D580','#F1D676','#F6AB65','#E77B7C','#C995D7',
      '#ff9da6',
      '#9c7560',
      '#bdb7b4','#979290','#5E5A59'
    ],
    closeButton: true,
    margin: 2,
    closeLabel: 'X',
    wrap: false
  });

  resetAllFileChoices();
});

//*********************************************************************//
//*******************HANDLING OF FILE UPLOADING***********************//

 
/**Reads data if they are in the textarea */
function readDataTextArea(input, filenumber) {
  if(!fileLogs){fileLogs = ["","","","",""]} //to correct a bug with old .pdata saves
  if(!fileLogs[filenumber-1]){fileLogs[filenumber-1]=""}
  fileLogs[filenumber-1] += "Data pasted from external source <br>"
  resetFilesChoices(html_tabTable.querySelector("select[name='fileSelection']"));
  resetFilesChoices(html_tabPca.querySelector("select[name='fileSelection']"));
  resetFilesChoices(html_tabAttrib.querySelector("select[name='fileSelection']"));
  resetFilesChoices(html_tabCalib.querySelector("select[name='fileSelection']"));
  updateFileChoices();
  parseData(input.value, splitterTextArea, filenumber);
  addFilesToMatrixTable() //update the options in the matrix tab
  addFilesToTreatmentTable();
  document.getElementById("textareafile"+filenumber).value =""

  //display a temporary box to confirm pasting
  var popup = document.getElementById("popup_file_pasted")
  popup.className = "fade_popup_visible"
  var rect = document.getElementById("textareafile"+filenumber).getBoundingClientRect();
  var offset = window.pageYOffset || 0
  var styletop =  rect.y
  popup.style.top =  rect.y + offset;
  popup.style.left =  rect.x+rect.width/2;
  
  setTimeout(() => { 
      popup.className = "fade_popup" 
      popup.style.top= -100
  }, 100);
};

/**clears data of the textarea by the pressing of the button */
var clearTextAreaButton = document.querySelectorAll('#clearTextAreaButton');
for(let i=0; i<clearTextAreaButton.length; i++){
  clearTextAreaButton[i].addEventListener("click", function (){
    var numberofthearea = i+1
    var nameofthearea = "textareafile"+numberofthearea
    document.getElementById(nameofthearea).value =""
    fileData[numberofthearea-1] = {}; //clears the data from fileData
    fileLogs[numberofthearea-1] = "" //clears the log
    nameslist[numberofthearea-1] = "" //clears the name
    fileCalibData[numberofthearea-1] = {} //clears the calib data
    //clears the input of the name
    let htmlName = document.getElementById("namefile"+numberofthearea)
    htmlName.value = ""
    //clears the upload file section
    let htmlZone = document.getElementById("file"+numberofthearea)
    let htmlFile = htmlZone.querySelector("input[type='file']")
    htmlFile.value = ""
    updateFilesInfos();
  });
}


/**
 * The goal of this function is to import the csv file and sends it to the parsing function
 * @param {*} input the inputed data
 * @param {*} filenumber the number of the file input: 1,2,3 or 4
 */
function readData(input, filenumber) {
  if(debug){console.log("a file has been uploaded to file n°"+filenumber)}
 if (input.files && input.files[0]) {
 let reader = new FileReader();
        reader.readAsBinaryString(input.files[0]);
 reader.onload = function (e) {
 obj_csv.name = input.files[0].name;
 obj_csv.size = e.total;
 obj_csv.dataFile = e.target.result
            //cleans the log
            document.getElementById("data_log").innerHTML = ""
            fileLogs[filenumber-1] += "A file called: '"+obj_csv.name+"' has been uploaded. <br>"
            createTitle(obj_csv.name, filenumber, true);
            parseData(obj_csv.dataFile, splitter, filenumber) //obj_csv is the object containing the data, splitter is the character used for splitting
            indexFiles();
            addFilesToMatrixTable() //update the options in the matrix tab
            addFilesToTreatmentTable();
            if(debug){console.log("reseting files choices...")}
            resetFilesChoices(html_tabTable.querySelector("select[name='fileSelection']"));
            resetFilesChoices(html_tabPca.querySelector("select[name='fileSelection']"));
            resetFilesChoices(html_tabAttrib.querySelector("select[name='fileSelection']"));
            resetFilesChoices(html_tabCalib.querySelector("select[name='fileSelection']"));
            updateFileChoices();
            updateVennFileChoice();
 }
 }
}

/**
 * reads multiple files at once
 * @param {*} input 
 */
function readMultipleData(input){
  if(debug){console.log(input.files.length+" files have been uploaded")}
  var file = ""
  //loops through each file
  for(let i=0; i<input.files.length; i++){
    file = input.files[i]
    console.log(file)
    var extension = file.name.split('.').pop();
    if(extension == "pdata"){
      importPuncdataDataOnly(file)
    }else{
      //finds an empty slot for a file
      var chosenSlot = -1;
      for(let j=0; j<fileData.length; j++){
        if(Object.keys(fileData[j]).length ===0){
          chosenSlot = j+1;
          fileData[j]={fill:""};//fills with random input the data slot so that it will not be considered empty by the loop
          break;
          }
      }
      //if there is no empty slot, create a new slot
      if(chosenSlot == -1){
        document.getElementById("addFileChoice").click() //creates a new zone
        fileData[fileData.length-1]={fill:""} //fills with random input the data slot so that it will not be considered empty by the loop
        chosenSlot = fileData.length
      }
      readData({files:[file]},chosenSlot)
    }

  }
}



 /**parse the data and saves it inside the var filedata. If the data corresponds to the chosen data to view (tab treatment) sends it to the treatment directly */
function parseData(data, splittingCharacter, filenumber){
  if(debug){console.log("parsing data for new file n°"+filenumber+" with character: "+splittingCharacter)}
    let csvData = [];
    let lbreak = data.split(/\r?\n/);
    lbreak.forEach(res => {
        csvData.push(res.split(splittingCharacter));
    });
    //cleans the data of empty lines
    for(let i=csvData.length-1;i>0 ;i--){
      if(csvData[i][0]=="" && csvData[i][1]==""){csvData.splice(i,1) }
      if(csvData[i] <= 1){csvData.splice(i,1) }
    }
    //replaces all remaining commas with dots(french way of placing commas where dots are in the english version)
    //TODO check with special files if this work
    for(let i=csvData.length-1;i>0 ;i--){
      for(let j=csvData[i].length-1;j>0;j--){
        csvData[i][j] = csvData[i][j].replace(/,/g,'.') //TODO try with replaceAll, to see if it corrects the bug on the desktop version
      }
    }
    fileData[filenumber-1]= csvData; //saves the data of the file
    fileLogs[filenumber-1]+= "Data parsed. detected "+parseInt(fileData[filenumber-1].length-1)+" peaks with "+parseInt(fileData[filenumber-1][0].length)+" columns. <br>"

    updateFilesInfos()
    //automatically finds the columns first time a file is uploaded
    if(!isFileUploaded){
      autoSetupColumns(csvData[0])
      //sends the naming of the fields
      updateName(nameslist[filenumber-1],filenumber, false) //update the names tag
      //sends the data to the data treatment who will cut the data if asked and draw the plots using other functions
      datatreatment(csvData, filenumber);
    }else{
      //the other case is if the file replaces another file already displayed.
      for(let i=0; i<canvasA.data.length; i++){
        if(!canvasA.data[i]){continue;}
        if(canvasA.data[i].dataName == "file_"+(filenumber-1)){
          updateName(nameslist[filenumber-1],filenumber, false); //update the names tag
          datatreatment(csvData, filenumber);
        }
      }
      for(let i=0; i<canvasB.data.length; i++){
        if(!canvasB.data[i]){continue;}
        if(canvasB.data[i].dataName == "file_"+(filenumber-1)){
          updateName(nameslist[filenumber-1],filenumber, false); //update the names tag
          datatreatment(csvData, filenumber);
        }
      }
      for(let i=0; i<canvasS.data.length; i++){
        if(!canvasS.data[i]){continue;}
        if(canvasS.data[i].dataName == "file_"+(filenumber-1)){
          updateName(nameslist[filenumber-1],filenumber, false); //update the names tag
          datatreatment(csvData, filenumber);
        }
      }
    }
    isFileUploaded = true;
    indexFiles()

}



/**creates the title of the file */
function createTitle(title, filenumber, removeExtension){
  //old way of displaying the title below uploads
  // d3.select("#uploadedtitle").remove() //gets rid of the old title if there is one
  // var htmltitle = "<div id=uploadedtitle>"+title+"</div>"
  // var titleplace = document.getElementById("tab_upload")
  // titleplace.insertAdjacentHTML('beforeend', htmltitle);

  //cuts the extension
  if(removeExtension){
    title = title.replace(/\.[^/.]+$/, "")
  }
  var inputZone = document.getElementById("namefile"+filenumber)
  inputZone.value = title
  //updates the name inside every file selecter
  nameslist[filenumber-1] = title
  updateFileChoiceName(title, filenumber)
}


//*********************************************************************//
//*******************HANDLES THE BUTTONS FOR FILES*********************//
var html_file1  = document.getElementById("file1")
var html_file2  = document.getElementById("file2")
var html_file3  = document.getElementById("file3")
var html_file4  = document.getElementById("file4")

html_file1.querySelector("button[name='saveButton']").addEventListener("click",function(){saveDataFile(0)});
html_file2.querySelector("button[name='saveButton']").addEventListener("click",function(){saveDataFile(1)});
html_file3.querySelector("button[name='saveButton']").addEventListener("click",function(){saveDataFile(2)});
html_file4.querySelector("button[name='saveButton']").addEventListener("click",function(){saveDataFile(3)});

html_file1.querySelector("button[name='copyButton']").addEventListener("click",function(){copyDataFile(0)});
html_file2.querySelector("button[name='copyButton']").addEventListener("click",function(){copyDataFile(1)});
html_file3.querySelector("button[name='copyButton']").addEventListener("click",function(){copyDataFile(2)});
html_file4.querySelector("button[name='copyButton']").addEventListener("click",function(){copyDataFile(3)});

html_file1.querySelector("button[name='logButton']").addEventListener("click",function(){logFileInfo(0)});
html_file2.querySelector("button[name='logButton']").addEventListener("click",function(){logFileInfo(1)});
html_file3.querySelector("button[name='logButton']").addEventListener("click",function(){logFileInfo(2)});
html_file4.querySelector("button[name='logButton']").addEventListener("click",function(){logFileInfo(3)});

/**handling of file type changing and values of intensity columns */
html_file1.querySelector("select[name='fileTypeSelect']").addEventListener("change",function(){changeFileType(html_file1, 0)});
html_file2.querySelector("select[name='fileTypeSelect']").addEventListener("change",function(){changeFileType(html_file2, 1)});
html_file3.querySelector("select[name='fileTypeSelect']").addEventListener("change",function(){changeFileType(html_file3, 2)});
html_file4.querySelector("select[name='fileTypeSelect']").addEventListener("change",function(){changeFileType(html_file4, 3)});

html_file1.querySelector("button[name='intensityCols']").addEventListener("click",function(){changeFileIntensityCols(html_file1, 0)});
html_file2.querySelector("button[name='intensityCols']").addEventListener("click",function(){changeFileIntensityCols(html_file2, 1)});
html_file3.querySelector("button[name='intensityCols']").addEventListener("click",function(){changeFileIntensityCols(html_file3, 2)});
html_file4.querySelector("button[name='intensityCols']").addEventListener("click",function(){changeFileIntensityCols(html_file4, 3)});


/**makes a pop up showing the file info */
function logFileInfo(fileNum){
  var buttons = [
    {"name":"COPY LOG","function": copyDataInfoLog},
    {"name":"CALIBRATION REPORT","function": logCalibData, arg1: fileNum}
  ]
  handlePopup("dataLog",fileLogs[fileNum],buttons,[],[])
}


function logCalibData(fileNum){
  let calibData = fileCalibData[fileNum]
  let text = ""
  if(calibData.residualError){
    text += "Residual error:"+calibData.residualError+"<br>"
    if(calibData.equation.length ==2){
      text += "equation (ax+b): a="+calibData.equation[1]+" , b="+calibData.equation[0]
    }else if(calibData.equation.length ==3){
      text += "equation (ax²+bx+c) a="+calibData.equation[2]+" ,b="+calibData.equation[1]+" ,c="+calibData.equation[0]
    }
    text +="<br>"
  }
  if(calibData.points && calibData.points.length >0){
    let table = createTable(calibData.points.length+1, 3)
    table.rows[0].cells[0].textContent = "m/z"
    table.rows[0].cells[1].textContent = "ppm error"
    table.rows[0].cells[2].textContent = "formula"
    console.log(table)
    for(let i=0; i<calibData.points.length; i++){
      table.rows[i+1].cells[0].textContent = calibData.points[i][0]
      table.rows[i+1].cells[1].textContent = calibData.points[i][1]
      table.rows[i+1].cells[2].textContent = calibData.points[i][2]
    }
    text += table.outerHTML
  }
  
  new Popup("calibData",text)

}

/** a function to change the file type between sample and matrix on the upload page */
function changeFileType(html_file, fileNum){
  let selecter = html_file.querySelector("select[name='fileTypeSelect']")
  let divBox =  html_file.querySelector("button[name='intensityCols']")
  if(selecter.value == "sample"){
    divBox.style.display = "none"
    fileParameters[fileNum].fileType = "sample"
    fileLogs[fileNum] += "File type changed to sample <br>"
  }else if(selecter.value == "matrix"){
    divBox.style.display = "block"
    fileParameters[fileNum].fileType = "matrix"
    fileLogs[fileNum] += "File type changed to matrix <br>"
  }
}

/** handle the popup creation for the changing of file intensity columns */
function changeFileIntensityCols(parentDiv, fileNum){
  let columns = fileData[fileNum][0]
  let parameters = fileParameters[fileNum]
  let text = "Define min-max columns:<br>"
  text += "<input type='number' name='min' placeholder='min'>-<input type='number' name='max' placeholder='max'>"
  text += "<br>"
  text += "<table ><tbody style='display: block; max-height:40em;overflow-y:auto;width:50em;font-size:10px'>"
  if(!columns){ return alertPopup("Error, trying to define matrix columns on a non-existing file")}
  for(let i=0; i<columns.length; i++){
    text += "<tr><td> ("+ i + ")--"+ columns[i] + "<td></tr>"
  }
  text += "</tbody></table><br>"

  let buttonsPopup = [{name:"Visualize/edit PCA variables", function:createPcaVectorsPopup, arg1:fileNum},
    {"name":"Validate","function":ValidatePopupIntensityColumn}]
  handlePopup("fileIntensityCols_file_"+fileNum,text, buttonsPopup, [], [])

  var popup = document.querySelector("div[id='main_popup']")
  var html_min = popup.querySelector("input[name='min']")
  var html_max = popup.querySelector("input[name='max']")
  html_min.value = fileParameters[fileNum].matrixMin
  html_max.value = fileParameters[fileNum].matrixMax
  updatePopupIntensityColumn()
  html_min.addEventListener("change",updatePopupIntensityColumn)
  html_max.addEventListener("change",updatePopupIntensityColumn)
}

/**a function used inside the popup for defining a file intensity columns */
function updatePopupIntensityColumn(){
  var popup = document.querySelector("div[id='main_popup']")
  var html_min = popup.querySelector("input[name='min']")
  var html_max = popup.querySelector("input[name='max']")
  var min =html_min.value
  var max = html_max.value
  var table = popup.querySelectorAll("tr")
  if(min == max){return;}
  for(let i=0; i<table.length; i++){
    if(i>=min && i<=max){
      table[i].style.color = "orange"
    }else{ table[i].style.color = ""}
  }
}

function ValidatePopupIntensityColumn(){
  var popup = document.querySelector("div[id='main_popup']")
  var html_min = popup.querySelector("input[name='min']")
  var html_max = popup.querySelector("input[name='max']")
  var popupName = popup.querySelector("div[class='popup']").getAttribute("name")
  var fileNum = popupName.split('_')[3]
  fileLogs[fileNum] += "Matrix intensity columns were defined to: ["+html_min.value+";"+html_max.value+"] <br>"
  fileParameters[fileNum].matrixMin = parseInt(html_min.value)
  fileParameters[fileNum].matrixMax = parseInt(html_max.value)
}

function createPcaVectorsPopup(fileNum){
  new  Popup_PCAVariables(fileNum)
}

/** update the value of an input and  stores it in variable*/
function updateInputValue(parentDiv, inputName, parentVar, varName){
  parentVar[varName] = parentDiv.querySelector("input[name='"+inputName+"']").value
}

function copyDataInfoLog(){
  var html_popup = document.querySelector('div[name="popup_dataLog"]')
  var htmlText= html_popup.innerHTML
  //this is not an optimal way of finding back the file number, should be thought about more
  let lbreak = htmlText.split('<br>');
  var text=""
  for(let i=1; i<lbreak.length-1; i++){
    text += lbreak[i] + '\n'
  }
  navigator.clipboard.writeText(text)
}

function copyDataFile(fileNum){
  var splitterA = "\t";
  if(fileData[fileNum].length <= 0){return;}
  //sets the text zone to contain the data separated by tab
  var text = ""
  for(let i=0; i<fileData[fileNum].length; i++){
      for(let j=0; j<fileData[fileNum][i].length;j++){
          //for the last element
           if(j+1 == fileData[fileNum][0].length){text= text + fileData[fileNum][i][j]}
           else{text= text + fileData[fileNum][i][j] + splitterA}
      }
    text = text+'\n'
  }
  navigator.clipboard.writeText(text)
  //display a temporary box to confirm copying
  var popup = document.getElementById("popup_filedata_copy")
  popup.className = "fade_popup_visible"
  var styletop =  event.pageY-30
  popup.style.top = event.pageY-30;
  popup.style.left = event.pageX;
  
  setTimeout(() => { 
      popup.className = "fade_popup" 
      popup.style.top= -100
  }, 100);

}

/** copies inputted 2D array to clipboard */
function copyData(data){
  let dataLine = ""
  for(let i=0; i<data.length; i++){
    for(let j=0; j<data[i].length; j++){
      dataLine += data[i][j] + '\t'
    }
      dataLine += '\n'
  }
  navigator.clipboard.writeText(dataLine)
}

/** duplicates a 2D array and returns is */
function duplicateData(data){
  var newDataClean = [] //duplicate
  for(let i=0; i<data.length; i++){
      newDataClean[i]=[]
      for(let j=0; j<data[i].length; j++){
          newDataClean[i][j] = data[i][j]
      }
  }
  return newDataClean
}


function saveDataFile(fileNum){
  var buttons = [
    {"name":"Save file","function": saveDataFile_export}
  ]
  var selecters = [{"name":"fileExtension", "options":[]}]
  selecters[0].options = [
      {"value":"csv", "text":"CSV(;)"},
      {"value":"csvCOMMA", "text":"CSV(,)"},
      {"value":"txt", "text":"TXT"},
      {"value":"ascii", "text":"ASCII"},
  ]
  var inputs = [
    {"type":"text"}
  ]
  
  handlePopup("saveDataFile","Choose the name of the file n°"+(fileNum+1),buttons,selecters,inputs)

}

function saveDataFile_export(){
  var html_popup = document.querySelector('div[name="popup_saveDataFile"]')
  var htmlText= html_popup.innerHTML
  //this is not an optimal way of finding back the file number, should be thought about more
  let lbreak = htmlText.split(/\r?°|</);
  let fileNum = lbreak[5]-1
  //gets the file name
  var fileName = html_popup.querySelector('input[name="popup_input_0"]').value
  if(fileName == "" || fileName == undefined){fileName = "Puncdata_datafile"}

  //get the file extension
  var fileExtension = html_popup.querySelector('select[name="popup_selecter_0"]').value
  var splitterA = ";"
  if(fileExtension == "csvCOMMA"){splitterA=",";fileExtension="csv"}
  if(fileExtension == "txt"){splitterA = "\t"}
  if(fileExtension == "ascii"){splitterA = "  "}

  //sets the text zone to contain the data separated by tab
  var text = ""
  for(let i=0; i<fileData[fileNum].length; i++){
      for(let j=0; j<fileData[fileNum][i].length;j++){
          //for the last element
           if(j+1 == fileData[fileNum][0].length){text= text + fileData[fileNum][i][j]}
           else{text= text + fileData[fileNum][i][j] + splitterA}
      }
    text = text+'\n'
  }
  var DialogBox = document.getElementById("popupsave")
  var file = document.createElement('a');
  mimeType = "text/csv;encoding:utf-8" || 'application/octet-stream';
  var Blobfile = null
  Blobfile = new Blob([text], {type: mimeType})
  file.href = URL.createObjectURL(Blobfile);
  file.setAttribute('download', fileName+"."+fileExtension);
  document.body.appendChild(file);
    file.click();
    document.body.removeChild(file);
    DialogBox.style.display = "none"
    file.href = URL.revokeObjectURL(Blobfile);

}

//updates the number of peaks and columns of each uploaded file
async function updateFilesInfos(){
  for(let i=0; i<fileData.length; i++){
    let htmlFile = document.getElementById("file"+parseInt(i+1))
    if(isNaN(parseInt(fileData[i].length-1))){
      htmlFile.querySelector("div[name='peakNum']").innerHTML = "Number of peaks:"
    }else{
      htmlFile.querySelector("div[name='peakNum']").innerHTML = "Number of peaks:"+ parseInt(fileData[i].length-1)
    }
    if(fileData[i][0]){
      htmlFile.querySelector("div[name='colNum']").innerHTML = "Number of columns:"+fileData[i][0].length
    }else{
      htmlFile.querySelector("div[name='colNum']").innerHTML = "Number of columns:"
    }
  }
}


//*********************************************************************//
//*******************HANDLES THE CREATION OF NEW FILES SLOTS***********//

/**------------------------------------------------------------------------- */
//adding the zone for inputing new files
document.getElementById("addFileChoice").addEventListener("click", function(){
  if(debug){console.log("new file zone added")}
  var parentZone = document.querySelector(".parentFileArea")

  var newZone = document.createElement("div")
  var newZoneNumber = fileData.length +1
  fileData.push({})
  nameslist.push("file"+newZoneNumber)
  newZone.setAttribute("class", "filearea");
  newZone.id = "file"+ newZoneNumber

  var newZone_first = document.createElement("div");
  newZone_first.setAttribute("class","filearea_first");
  newZone.appendChild(newZone_first)

  var newZone_second = document.createElement("div");
  newZone_second.setAttribute("class","filearea_second");
  newZone.appendChild(newZone_second)

  var newZone_third = document.createElement("div");
  newZone_third.setAttribute("class","filearea_third");
  newZone.appendChild(newZone_third)

  var newZone_input = document.createElement("input")
  newZone_input.type = "text";
  newZone_input.setAttribute("class","namefileupload");
  newZone_input.setAttribute("placeholder","Name of file n°"+newZoneNumber);
  newZone_input.id = "namefile"+newZoneNumber;
  newZone_second.appendChild(newZone_input)

  var flexZone = document.createElement("div")
  flexZone.setAttribute("style","display:flex")
  newZone_first.appendChild(flexZone)

  var uploadButton = document.createElement("div")
  uploadButton.setAttribute("class", "uploadbutton")
  flexZone.appendChild(uploadButton)

  var newZone_image = document.createElement("img")
  newZone_image.setAttribute("class","uploadIcon");
  newZone_image.setAttribute("src","icons/upload_icon.png");
  uploadButton.appendChild(newZone_image)

  var fileInput_1 = document.createElement("input")
  fileInput_1.type = "file"
  fileInput_1.setAttribute("class", "upload");
  fileInput_1.setAttribute("onChange","readData(this,"+newZoneNumber+")")
  uploadButton.appendChild(fileInput_1)

  var fileInput_2 = document.createElement("textarea")
  fileInput_2.id = "textareafile"+newZoneNumber
  fileInput_2.setAttribute("class","uploadTextArea")
  fileInput_2.setAttribute("oninput","readDataTextArea(this,"+newZoneNumber+")")
  fileInput_2.setAttribute("placeholder","Upload or paste data here")
  flexZone.appendChild(fileInput_2)

  var delButton = document.createElement("button")
  delButton.id="clearTextAreaButton"
  delButton.setAttribute("class","bigiconbutton")
  delButton.innerHTML = "DELETE <br>"
  delButton.addEventListener("click", function (){
    var numberofthearea = newZoneNumber
    var nameofthearea = "textareafile"+newZoneNumber
    document.getElementById(nameofthearea).value =""
    fileData[numberofthearea-1] = {}; //clears the data from fileData
    fileLogs[numberofthearea-1] = "" //clears the log
    nameslist[numberofthearea-1] = "" //clears the name
    //clears the input of the name
    let htmlName = document.getElementById("namefile"+numberofthearea)
    htmlName.value = ""
    //clears the upload file section
    let htmlZone = document.getElementById("file"+numberofthearea)
    let htmlFile = htmlZone.querySelector("input[type='file']")
    htmlFile.value = ""
    updateFilesInfos();
  });
  var deLButton_img = document.createElement("img")
  deLButton_img.setAttribute("class","parametersButton");
  deLButton_img.setAttribute("src","icons/remove.png");
  delButton.appendChild(deLButton_img)

  flexZone.appendChild(delButton)
  

  var fileInfo_1 = document.createElement("div")
  fileInfo_1.setAttribute("class","fileInfo")
  fileInfo_1.setAttribute("name","peakNum"),
  fileInfo_1.innerHTML = "Number of peaks:"
  newZone_second.appendChild(fileInfo_1)
  var fileInfo_2 = document.createElement("div")
  fileInfo_2.setAttribute("class","fileInfo")
  fileInfo_2.setAttribute("name","colNum"),
  fileInfo_2.innerHTML = "Number of columns:"
  newZone_second.appendChild(fileInfo_2)

  var fileInfo_3 = document.createElement("div")
  fileInfo_3.setAttribute("class","fileInfo")
  fileInfo_3.setAttribute("name","fileType")
  fileInfo_3.style.display = "flex"
  fileInfo_3.innerHTML = "File type: "
  var select_fileType = document.createElement("select")
  select_fileType.setAttribute("name","fileTypeSelect")
  var select_fileType_o1 = document.createElement("option")
  select_fileType_o1.setAttribute("value","sample")
  select_fileType_o1.innerHTML = "Sample"
  var select_fileType_o2 = document.createElement("option")
  select_fileType_o2.setAttribute("value","matrix")
  select_fileType_o2.innerHTML = "Matrix"
  select_fileType.appendChild(select_fileType_o1)
  select_fileType.appendChild(select_fileType_o2)
  fileInfo_3.appendChild(select_fileType)
  select_fileType.addEventListener("change",function(){changeFileType(newZone, newZoneNumber-1)});
  var div_intensityCols = document.createElement("button")
  div_intensityCols.setAttribute("name","intensityCols")
  div_intensityCols.innerHTML = "Define intensity columns"
  div_intensityCols.style.display = "none"
  fileInfo_3.appendChild(div_intensityCols)
  div_intensityCols.addEventListener("click",function(){changeFileIntensityCols(div_intensityCols, newZoneNumber-1)});
  fileParameters[newZoneNumber-1] = {};
  newZone_second.appendChild(fileInfo_3)
  
  var flexZone2 = document.createElement("div")
  flexZone2.setAttribute("style","display:flex")
  newZone_third.appendChild(flexZone2)

  var saveButton = document.createElement("button")
  saveButton.setAttribute("class","bigiconbutton")
  saveButton.setAttribute("name","saveButton")
  saveButton.innerHTML = "Save <br>"
  var saveButton_img = document.createElement("img")
  saveButton_img.setAttribute("class","parametersButton");
  saveButton_img.setAttribute("src","icons/save_icon.png");
  saveButton.appendChild(saveButton_img)
  saveButton.addEventListener("click",function(){saveDataFile(newZoneNumber-1)});
  flexZone2.appendChild(saveButton)

  var copyButton = document.createElement("button")
  copyButton.setAttribute("class","bigiconbutton")
  copyButton.setAttribute("name","copyButton")
  copyButton.innerHTML = "Copy <br>"
  var copyButton_img = document.createElement("img")
  copyButton_img.setAttribute("class","parametersButton");
  copyButton_img.setAttribute("src","icons/copy.png");
  copyButton.appendChild(copyButton_img)
  copyButton.addEventListener("click",function(){copyDataFile(newZoneNumber-1)});
  flexZone2.appendChild(copyButton)

  var logButton = document.createElement("button")
  logButton.setAttribute("class","bigiconbutton")
  logButton.setAttribute("name","logButton")
  logButton.innerHTML = "Log <br>"
  var logButton_img = document.createElement("img")
  logButton_img.setAttribute("class","parametersButton");
  logButton_img.setAttribute("src","icons/notes_icon.png");
  logButton.appendChild(logButton_img)
  logButton.addEventListener("click",function(){logFileInfo(newZoneNumber-1)});
  flexZone2.appendChild(logButton)

  //add the delete behaviour of the del button
  delButton.addEventListener("click", function (){
    var numberofthearea = newZoneNumber
    var nameofthearea = "textareafile"+numberofthearea
    document.getElementById(nameofthearea).value =""
    fileData[numberofthearea-1] = {}; //clears the data from fileData
  });



  parentZone.appendChild(newZone)
  resetFilesChoices(html_tabTable.querySelector("select[name='fileSelection']"));
  resetFilesChoices(html_tabPca.querySelector("select[name='fileSelection']"));
  resetFilesChoices(html_tabAttrib.querySelector("select[name='fileSelection']"));
  resetFilesChoices(html_tabCalib.querySelector("select[name='fileSelection']"));
  updateFileChoices()
  updateVennFileChoice();

  //adds the listening to the change of the new title
  document.getElementById("namefile"+newZoneNumber).addEventListener("change", function(){updateName(this.value,newZoneNumber, false)})

});


//adds the option of the names to every file_choice 
function updateFileChoices(){
  var fileChoices = document.querySelectorAll(".file_choice")
  var oldChoices = []; //holds all the old choices
  for(let k=0; k<fileChoices.length; k++){
    for(let i=0; i<nameslist.length; i++){
      //delete previous options
      if(fileChoices[k].options != null){
        oldChoices[k] = fileChoices[k].value
          for(let j=fileChoices[k].options.length-1; j>=0; j--) { //backward for to remove all options
              fileChoices[k].remove(j);
          }
      }
      //Create and append the options
      for (var j = 0; j < nameslist.length; j++) {
          var option = document.createElement("option");
          option.value = j+1;
          option.text = nameslist[j];
          fileChoices[k].appendChild(option);
          fileChoices[k].value = oldChoices[k] //select the option number by default
      }
    }
  }
  
}

/** updates the names of the files inside every file selecter */
function updateFileChoiceName(newname, number){
  var fileChoices = document.querySelectorAll(".file_choice")
  for(let k=0; k<fileChoices.length; k++){
    for(let i=0; i<fileChoices[k].length; i++){
      if(fileChoices[k][i].value == number){
        fileChoices[k][i].innerHTML = newname
      }

    }
  }

}


/** returns a file by its dataString name. works for matrix, files, venn data and classes data. Sets the new column names if true */
function linkFileFromDataString(dataString, setColumnNames){
  let chosenFile = []
  if(dataString == "matrix"){ 
      chosenFile = matrixData; 
      if(setColumnNames && chosenFile.length >0){columnNames = matrixData[0]}
  }else if(dataString.includes("file")){
      let fileNum = dataString.slice(5);  
      chosenFile = fileData[fileNum];
      if(setColumnNames && chosenFile.length >0){columnNames = fileData[fileNum][0]}
  }else if(dataString == "A" || dataString == "B" || dataString == "C"){
      chosenFile = vennData[dataString]
  }else if(dataString == "AuB" || dataString == "AuC" || dataString == "BuC" || dataString == "AuBuC"){
      chosenFile = vennData[dataString]
  }else if(dataString == "D" || dataString == "AuD" || dataString == "BuD"|| dataString == "CuD" || dataString == "AuBuD"|| dataString == "AuCuD"|| dataString == "BuCuD"|| dataString == "AuBuCuD"){
      chosenFile = vennData[dataString]
  }else if(dataString.includes("class")){
      let fileNum =  dataString.slice(6);
      chosenFile = classesData[fileNum];
      if(debug){console.log(chosenFile)}
      if(setColumnNames && chosenFile.length >0){columnNames = chosenFile[0];}
  }
  if(chosenFile == []){console.warn("Warning ! did not find file from data string of file. Maybe incorrect data name or empty")}
  return chosenFile
}

/** links the file parameters from the data string */
function linkFileParamFromDataString(dataString){
  if(dataString == "matrix"){
      return matrixFilesColumns
  }else if(dataString.includes("file")){
      let fileNum = dataString.slice(5);  
      return fileParameters[fileNum]
  }else{
      return;
  }
}


//*********************************************************************//
//*******************OTHER CREATION FUNCTIONS**************************//

/** reduce a data group by a selection
 * @data : the data
 * @condition - column number of the condition
 * @min - minimal value to enter the selection
 * @max - maximal value to enter the selection
 */
function reduceData(data, condition, min, max){
  let dataSelected = [];
  for(let i=0; i< data.length; i++){
    if (data[i][condition]>=min && data[i][condition]<=max){ dataSelected.push(data[i])}
  }
  return dataSelected
} 

/**indicates if there is a name change of a file */

/**contains the names of the files */
var nameslist =["file1","file2","file3","file4"];
document.getElementById("namefile1").addEventListener("change", function(){updateName(this.value,1, false)})
document.getElementById("namefile2").addEventListener("change", function(){updateName(this.value,2, false)})
document.getElementById("namefile3").addEventListener("change", function(){updateName(this.value,3, false)})
document.getElementById("namefile4").addEventListener("change", function(){updateName(this.value,4, false)})

/** updates the name of the file if there is a change 
 * @event: the new name given
 * @number: the number of the chosen edited file
 * @tabchange: if the change comes from the upload tab: false; else: true
*/
function updateName(newname,number){
  if(debug){console.log("updating the name of file n°"+number)}
  fileLogs[number-1] += "Name of the file changed to: '"+newname+"' <br>"

  if(number>-1){ nameslist[number-1] = newname;} //if the newname comes from the upload tab, changes it here
  resetAllFileChoices();
  updateFileChoiceName(newname,number) //update all file name selections
  updateVennFileChoice() //updates the names on the choices of the Venn Tab
  addFilesToMatrixTable() //update the options in the matrix tab
  addFilesToTreatmentTable();
  createDataOptions("data_source",document.getElementById("tab_canvasA")) // update the options for canvas A
  createDataOptions("data_source",document.getElementById("tab_canvasB")) // update the options for canvas B
  createDataOptions("data_source",document.getElementById("tab_canvasS")) // update the options for canvas Stat

}

/**resets the file choices for a selecter */
function resetFilesChoices(selecter, showVennOptions, showClassesOptions, showAttributedOption){
  var oldChoice = selecter.value
  //delete old options
  if(selecter.options != null){
        for(let j=selecter.options.length-1; j>=0; j--) { //backward for to remove all options
            selecter.remove(j);
        }
    }
  var options = []
  options[0] = document.createElement("option")
  options[0].setAttribute("value","none")
  options[0].innerHTML = "None"
  options[1] = document.createElement("option")
  options[1].setAttribute("value","matrix")
  options[1].innerHTML = "Matrix"
  l=2
  if(showAttributedOption){
    options[2] = document.createElement("option")
    options[2].setAttribute("value","attrib")
    options[2].innerHTML = "Current attribution"
    l+=1
  }
  options[l] = document.createElement("option")
  options[l].setAttribute("value","none")
  options[l].innerHTML = "--------------------"
  l += 1
  for(let i=0; i<fileData.length; i++){
      options[l] = document.createElement("option")
      options[l].setAttribute("value","file_"+i)
      options[l].innerHTML = "File : "+nameslist[i]
      l += 1
  }
  //only if venn options are to be shown
  if(vennData && showVennOptions){
      if(vennData.A){
          options[l] = document.createElement("option")
          options[l].setAttribute("value","none")
          options[l].innerHTML = "--------------------"
          options[l+1] = document.createElement("option")
          options[l+1].setAttribute("value","A")
          options[l+1].innerHTML = "Venn only A"
          options[l+2] = document.createElement("option")
          options[l+2].setAttribute("value","AuB")
          options[l+2].innerHTML = "Venn A&B"
          options[l+3] = document.createElement("option")
          options[l+3].setAttribute("value","B")
          options[l+3].innerHTML = "Venn only B"
          l+=4
          if(vennData.C){
              options[l] = document.createElement("option")
              options[l].setAttribute("value","C")
              options[l].innerHTML = "Venn only C"
              options[l+1] = document.createElement("option")
              options[l+1].setAttribute("value","AuC")
              options[l+1].innerHTML = "Venn A&C"
              options[l+2] = document.createElement("option")
              options[l+2].setAttribute("value","BuC")
              options[l+2].innerHTML = "Venn B&C"
              options[l+3] = document.createElement("option")
              options[l+3].setAttribute("value","AuBuC")
              options[l+3].innerHTML = "Venn A&B&C"
              l+=4
          }
      }
  }


  //append all the options
  var length = 2 
  for(let i=0; i<options.length; i++){
      selecter.appendChild(options[i])
      length +=1
  }
  selecter.value =oldChoice || "none"

}



/** a function to reset all selecters displaying the file choices */
function resetAllFileChoices(){
  resetFilesChoices(html_tabTable.querySelector("select[name='fileSelection']"));
  resetFilesChoices(html_tabParameters.querySelector("select[name='fileSelection']"));
  resetFilesChoices(html_tabPca.querySelector("select[name='fileSelection']"));
  resetFilesChoices(html_tabAttrib.querySelector("select[name='fileSelection']"));
  resetFilesChoices(html_tabCalib.querySelector("select[name='fileSelection']"));
  addFilesToTreatmentTable();
  addFilesToMatrixTable();
  updateFileChoices();
  updateVennFileChoice();
  canvasA.htmlTopMenu.draw()
  canvasB.htmlTopMenu.draw()
  canvasS.htmlTopMenu.draw()
  canvasNetwork.draw()
}

/**initializes textcontent var*/
var textcontent= ""

  //catches the entered name & listens for the validate button & makes the download
/** triggered when validate button is pressed for exporting a file */
function validation(){
  var DialogBox = document.getElementById("popupsave")
  var name = document.getElementById("popupinput").value
  var file = document.createElement('a');
  mimeType = "text/csv;encoding:utf-8" || 'application/octet-stream';
  var Blobfile = null
  Blobfile = new Blob([textcontent], {type: mimeType})
  file.href = URL.createObjectURL(Blobfile);
  if(name == ""){file.setAttribute('download', "paramètres.txt");}
  else{file.setAttribute('download', name+".txt");}
  document.body.appendChild(file);
    file.click();
    document.body.removeChild(file);
    DialogBox.style.display = "none"
    file.href = URL.revokeObjectURL(Blobfile);
    this.removeEventListener("click", validation) //avoids the download of multiple files if multiple parameters are downloaded. If this wasn't done
    //there would be multiple event listeners listening to the same click and increasing the number of files downloaded at once

};

////////////////////////////////////////////////////////////////////////////
// functions for importing and exporting the new parameters
function importPopup(input){
  let text = document.createElement("div")
  text.innerHTML = "Check which parts of the parameters to import<br><br>"
  let names = ["Main config (tab parameters options)","Canvas A tab","Canvas B tab","Canvas stat tab","Config venn","Config PCA","Config network ","Attribution charts","Attribution parameters","Calibration lists"]
  let htmlNames = ["main","cvsA","cvsB","cvsS","venn","pca","network","attribCharts","attribCfg","calib"]
  let checkboxes = []
  let table = document.createElement("table")
  let tableHeader = document.createElement("tr")
  let header1 = document.createElement("th")
  let header2 = document.createElement("th")
  header2.innerHTML = "Check/Uncheck all"
  let headerCheck = document.createElement("input")
  headerCheck.setAttribute("type","checkbox")
  headerCheck.setAttribute("checked",true)
  headerCheck.setAttribute("name","checkAllImport")

  header1.appendChild(headerCheck)
  tableHeader.appendChild(header1)
  tableHeader.appendChild(header2)
  table.appendChild(tableHeader)

  for(let i=0; i<names.length; i++){
    let line = document.createElement("tr")
    let cell1 = document.createElement("td")
    let cell2 = document.createElement("td")
    checkboxes[i] = document.createElement("input")
    checkboxes[i].setAttribute("type","checkbox")
    checkboxes[i].setAttribute("name",htmlNames[i])
    checkboxes[i].setAttribute("checked",true)
    cell2.innerHTML = names[i] 
    cell1.appendChild(checkboxes[i])
    line.appendChild(cell1)
    line.appendChild(cell2)
    table.appendChild(line)
  }
  text.appendChild(table)

  var buttons = [
    {"name":"Import","function":importJSON,"arg1":input, "arg2":true},
  ]
  handlePopup("importConfig",text.innerHTML,buttons,[],[])
  //adds the functionnality to the "check all" button
  let createdPopup = document.getElementsByName("popup_importConfig")[0]
  let checkAllBox = createdPopup.querySelector("input[name='checkAllImport']")
  checkAllBox.addEventListener("change",function(){
    let checkboxes = createdPopup.querySelectorAll("input")
    for(let i=1; i<checkboxes.length; i++){
      checkboxes[i].checked = this.checked
    }
  })
}


function importJSON(input, importFromPopup){
  //REMOVE HERE FOR ATTRIBUTION DATA CONFIG
  let checks = {"main":true,"cvsA":true,"cvsB":true, "cvsS":true,"venn":true,"classes":true,"pca":true,"network":true,"attribCharts":true,"attribCfg":true,"calib":true}
  //if the input comes from the parameters popup, check which boxes have been checked
  if(importFromPopup){
    let popup = document.getElementsByName("popup_importConfig")[0]
    checks.main = popup.querySelector("input[name='main']").checked
    checks.cfgA = popup.querySelector("input[name='cvsA']").checked
    checks.cfgB = popup.querySelector("input[name='cvsB']").checked
    checks.cfgS = popup.querySelector("input[name='cvsS']").checked
    checks.venn = popup.querySelector("input[name='venn']").checked
    checks.pca = popup.querySelector("input[name='pca']").checked
    checks.network = popup.querySelector("input[name='network']").checked
    checks.attribCharts = popup.querySelector("input[name='attribCharts']").checked
    checks.attribCfg = popup.querySelector("input[name='attribCfg']").checked
    checks.calib = popup.querySelector("input[name='calib']").checked
  }
  var reader = new FileReader();
  reader.onload = onReaderLoad
  reader.readAsText(input.files[0]);
  //this will happen when the data has been read and the variable values need now to be set.
  function onReaderLoad(event){
    var data = JSON.parse(reader.result);
    if(debug){console.log(checks,data)}
    if(checks.main){
      if(!data.config.selectionTool){data.config.selectionTool = config.selectionTool}
      if(!data.config.tooltipPie){data.config.tooltipPie = config.tooltipPie}
      config = data.config
      splitter = data.splitter
      splitterTextArea = data.splitterTextArea
      if(!data.config.margin){config.margin = {top: 10, right: 25, bottom: 100, left: 75}}
      if(!config.sizeReductor){config.sizeReductor = 2000}
      if(!config.customTooltipData){config.customTooltipData = []}
      if(!config.height || !config.width){config.height = data.height; config.width = data.width;}
      if(data._textLog){_textLog = data._textLog}
    }
    if(data.cfgVenn && checks.venn){ cfgVenn = data.cfgVenn}
    if(data.cfgStat && checks.cfgS){ cfgStat = data.cfgStat}
    if(data.cfgPCA && checks.pca){ cfgPCA = data.cfgPCA}
    if(data.cfgNetwork && checks.network){canvasNetwork.prepareCfg(data.cfgNetwork)}

    //for previous compatibility
    if(!data.version || data.version<1.14){
      if(checks.cfgA){copyFromOldCvs(canvasA, data.cfgA)}
      if(checks.cfgB){copyFromOldCvs(canvasB, data.cfgB)}
    }else{
      if(checks.cfgA){copyFromCfgCvs(canvasA, data.cfgA)}
      if(checks.cfgB){copyFromCfgCvs(canvasB, data.cfgB)}
      if(checks.cfgS){copyFromCfgCvs(canvasS, data.cfgS)}
    }

    //for ATTRIBUTION TAB
    if(checks.attribCharts && data.cfgAttribDraw){cfgAttribDraw = data.cfgAttribDraw}
    if(checks.attribCfg  && data.attribCfg){attribCfg = {...attribCfg, ...data.attribCfg}} //TODO: make object spreads like this for all
    if(checks.attribCfg  && data.attribPasses){attribPasses = data.attribPasses}
    if(data.attribCfg && data.version <1.153){prepareCompatibilityCheckboxMenu()}
    if(checks.calib  && data.calibData){calibData = data.calibData}

    //set the columns data html inputs to the right value
    updateParametersShownValues()
    resetAllFileChoices();
    setVennDataTable();
    quickStartupInterfaceAttrib(false);
    updateCustomColorScalesChoice();

    //resets the config
    html_configDivHolder.querySelector("div[name='configDiv']").remove()
    html_configDiv = createConfigHTML(config)
    html_configDivHolder.appendChild(html_configDiv)
    
  }

  
}

/** imports the data only from a pdata file */
function importPuncdataDataOnly(input){
  var reader = new FileReader();
  reader.onload = onReaderLoad
  reader.readAsText(input);
  //this will happen when the data has been read and the variable values need now to be set.
  function onReaderLoad(event){
    var data = JSON.parse(reader.result);
    if(debug){console.log(data)}
    if(debug){console.log("version: "+data.version)}
    //pre-creates the slots for the number of files needes
    let emptyDataSets = 0
    for(let i=0; i<fileData.length; i++){
      if(!fileData[i] || fileData[i].length ==0 || !fileData[i].length){emptyDataSets+=1}
    }
    let slotsToCreate = data.fileData.length - emptyDataSets
    for(let i=0; i<slotsToCreate; i++){
      document.getElementById("addFileChoice").click() //creates a new zone
    }
    if(debug){console.log("Reading pdata file: assigning variables...")}
    //fills the data
    for(let i=0; i<data.fileData.length; i++){
      let filled =false
      for(let j=0; j<fileData.length; j++){
        if((!fileData[j] || fileData[j].length ==0 || !fileData[j].length)&& !filled){
          filled = true
          fileData[j] = data.fileData[i]
          nameslist[j] = data.nameslist[i]
        }
      }
      if(!filled){
        fileData[fileData.length] = data.fileData[i]
        nameslist[fileData.length] = data.nameslist[i]
      }
    }
    //updates the names
    updateFilesInfos()
    for(let i=0; i<nameslist.length; i++){
      createTitle(nameslist[i], i+1, false)
    }
    indexFiles()
  }
}


//import a pdata file
function importPuncdataFile(input){ 
  var reader = new FileReader();
  reader.onload = onReaderLoad
  reader.readAsText(input.files[0]);

  //this will happen when the data has been read and the variable values need now to be set.
  function onReaderLoad(event){
    var data = JSON.parse(reader.result);
    if(debug){console.log(data)}
    if(debug){console.log("version: "+data.version)}
    //pre-creates the slots for the number of files needes
    if(data.nameslist.length > nameslist.length){
      let createNum = data.nameslist.length - nameslist.length
      for (let i=0; i<createNum; i++){
        document.getElementById("addFileChoice").click() //creates a new zone
      }
    }
    if(debug){console.log("Reading pdata file: assigning variables...")}
    fileData = data.fileData

    nameslist = data.nameslist
    columnNames = data.columnNames
    if(!data.config.selectionTool){data.config.selectionTool = config.selectionTool}
    if(!data.config.tooltipPie){data.config.tooltipPie = config.tooltipPie}
    config = data.config
    if(!data.config.margin){config.margin = {top: 10, right: 30, bottom: 90, left: 60}}
    if(data._textLog){_textLog = data._textLog}
    if(!config.sizeReductor){config.sizeReductor = 2000}
    if(!config.customTooltipData){config.customTooltipData = []}
    if(!config.height || !config.width){config.height = data.height; config.width = data.width;}
    splitter = data.splitter
    splitterTextArea = data.splitterTextArea
    isFileUploaded = data.isFileUploaded
    matrixFilesColumns = data.matrixFilesColumns || []
    fileParameters = data.fileParameters || [{},{},{},{}]
    matrixData = data.matrixData
    if(data.fileLogs){fileLogs = data.fileLogs}
    if(data.vennData){vennData = data.vennData}
    if(data.vennData && !data.cfgVenn){cfgVenn ={circleNb:3,files:[0,1,2,3],colors:["","","",""]}} //to correct a specific bug for one savefile
    if(data.cfgVenn){ cfgVenn = data.cfgVenn}
    if(data.cvsPCA){ cvsPCA = data.cvsPCA}
    if(data.cfgPCA){ cfgPCA = data.cfgPCA}
    if(data.cfgNetwork){canvasNetwork.prepareCfg(data.cfgNetwork)}
    if(data.fileCalibData){fileCalibData = data.fileCalibData}

    //sets the upload tab file types as they previously were indicated in fileParameters
    for(let i=0; i<fileData.length; i++){
        let html_file = document.getElementById("file"+(i+1))
        if(!html_file || !fileParameters[i]){continue;}
        let selecter = html_file.querySelector("select[name='fileTypeSelect']")
        let fileType = fileParameters[i].fileType
        selecter.value = fileType || "sample"
        if(fileType == "matrix"){
          let button = html_file.querySelector("button[name='intensityCols']")
          button.style.display = ""
        }
    }

    //for previous compatibility
    if(!data.version || data.version<1.14){
      copyFromOldCvs(canvasA, data.cfgA)
      copyFromOldCvs(canvasA, data.cfgA)
    }else{
      copyFromCfgCvs(canvasA, data.cfgA)
      copyFromCfgCvs(canvasB, data.cfgB)
      copyFromCfgCvs(canvasS, data.cfgS)
    }
    canvasS.draw()
    canvasS.htmlTopMenu.draw()

    //for ATTRIBUTION
    if(data.cfgAttribDraw){cfgAttribDraw = data.cfgAttribDraw}
    if(data.attribCfg){attribCfg = {...attribCfg, ...data.attribCfg}} //TODO: make object spreads like this for all
    if(data.attribCfg && !data.attribCfg.directNetwork){attribCfg.directNetwork = {"list":[],"mDaTol":0.1,"use":false}}
    if(data.attribCfg && data.version <1.153){prepareCompatibilityCheckboxMenu()}
    if(data.attribPasses){attribPasses = data.attribPasses}
    if(data.attribData){attribData = data.attribData}
    if(data.cvsAttrib){cvsAttrib = data.cvsAttrib}

    indexFiles();
    if(debug){console.log("Reading pdata file: reseting file choices...")}
    resetAllFileChoices();
    addFilesToMatrixTable();
    addFilesToTreatmentTable();
    setVennDataTable();
    
    if(debug){console.log("Reading pdata file: drawing everything...")}
    drawEverything()

    //updates the names
    updateFilesInfos()
    for(let i=0; i<nameslist.length; i++){
      createTitle(nameslist[i], i+1, false)
    }

    //set the columns data html inputs to the right value
    updateParametersShownValues()
    quickStartupInterfaceAttrib(false);
    updateCustomColorScalesChoice();

    //resets the config
    html_configDivHolder.querySelector("div[name='configDiv']").remove()
    html_configDiv = createConfigHTML(config)
    html_configDivHolder.appendChild(html_configDiv)

    //now that it's finished, sets the name of the window/browser tab
    let fileName = ""
    if(input.files && input.files[0]&& input.files[0].name){
      fileName = input.files[0].name
      fileName = fileName.slice(0, fileName.lastIndexOf('.')) || fileName
    }
    document.getElementById("windowName").innerHTML = "Punc'data V "+version.name+" - "+fileName
  }

}


function exportJSON(){
  var buttons = [
    {"name":"Export parameters ","function":exportJSONParamFile},
    {"name":"Export Session (data + parameters)","function":exportJSONPuncdataFile}
  ]
  var inputs = [
    {"type":"text"}
  ]
  
  handlePopup("exportParameters","Every parameter will be saved in a .json file. Please choose its name : ",buttons,[],inputs)
}

/** this function is used for exports, to avoid some keys from being duplicated */
function omitKeys(obj, keys)
{
    var obj2 = {};
    for (var key in obj) {
        if (keys.indexOf(key) == -1) {
          obj2[key] = obj[key];
        }
    }
    return obj2;
}

function exportJSONParamFile(){
  var data = {
    "version":version.number,
    "config":config,
    "splitter":splitter,
    "splitterTextArea": splitterTextArea,
    "fileLogs":fileLogs,
    "_textLog":_textLog,
    "isFileUploaded":isFileUploaded,
    "cfgVenn":cfgVenn,
    "cfgPCA":cfgPCA,
    "cfgA":canvasA.exportCfg(),
    "cfgB":canvasB.exportCfg(),
    "cfgS":canvasS.exportCfg(),
    "cfgNetwork":canvasNetwork.cfg,
    //for ATTRIBUTION
    "cfgAttribDraw":cfgAttribDraw,
    "attribCfg":attribCfg,
    "attribPasses":attribPasses,
    "calibData":calibData
  }

  var html_popup = document.querySelector('div[name="popup_exportParameters"]')
  var fileName = html_popup.querySelector('input[name="popup_input_0"]').value
  if(fileName == "" || fileName == undefined){fileName = "Puncdata_parameters"}

  var json = JSON.stringify(data)
  var DialogBox = document.getElementById("popupsave")
  var file = document.createElement('a');
  mimeType = "text/csv;encoding:utf-8" || 'application/octet-stream';
  var Blobfile = null
  Blobfile = new Blob([json], {type: mimeType})
  file.href = URL.createObjectURL(Blobfile);
  file.setAttribute('download', fileName+".json");
  document.body.appendChild(file);
    file.click();
    document.body.removeChild(file);
    DialogBox.style.display = "none"
    file.href = URL.revokeObjectURL(Blobfile);
}

function exportJSONPuncdataFile(){
  var data = {
    "info":"This is a JSON file to load a fully working Punc'data session. It contains parameters AND data",
    "version":version.number,
    "_textLog":_textLog,
    "fileData":fileData,
    "matrixData":matrixData,
    "nameslist":nameslist,
    "columnNames":columnNames,
    "vennData":vennData,
    "cfgA":canvasA.exportCfg(),
    "cfgB":canvasB.exportCfg(),
    "cfgS":canvasS.exportCfg(),
    "cfgNetwork":canvasNetwork.cfg,
    "config":config, 
    "splitter":splitter,
    "splitterTextArea": splitterTextArea,
    "fileLogs":fileLogs,
    "matrixFilesColumns":matrixFilesColumns,
    "fileParameters":fileParameters,
    "cfgVenn":cfgVenn,
    "cfgPCA":cfgPCA,
    "cvsPCA":cvsPCA,
    "fileCalibData":fileCalibData,
    //for ATTRIBUTION
    "cfgAttribDraw":cfgAttribDraw,
    "attribCfg":attribCfg,
    "attribPasses":attribPasses,
    "attribData":attribData,
    "cvsAttrib":cvsAttrib,
    "calibData":calibData
  }

  var html_popup = document.querySelector('div[name="popup_exportParameters"]')
  var fileName = html_popup.querySelector('input[name="popup_input_0"]').value
  if(fileName == "" || fileName == undefined){fileName = "Puncdata_parameters"}

  var json = JSON.stringify(data)
  var DialogBox = document.getElementById("popupsave")
  var file = document.createElement('a');
  mimeType = "text/csv;encoding:utf-8" || 'application/octet-stream';
  var Blobfile = null
  Blobfile = new Blob([json], {type: mimeType})
  file.href = URL.createObjectURL(Blobfile);
  file.setAttribute('download', fileName+".pdata");
  document.body.appendChild(file);
    file.click();
    document.body.removeChild(file);
    DialogBox.style.display = "none"
    file.href = URL.revokeObjectURL(Blobfile);


}


//to show parameters tab values on the opening of this script
updateParametersShownValues()


//update parameters if they are changed inside the parameters tab
var selectParameters = d3.select("#columnsetupParent")
.on('change', updateParametersColumns )

function updateParametersColumns() {
  if(document.getElementsByName("allowTooltipPieChart")[0].checked){config.tooltipPie.allow = true}else{config.tooltipPie.allow = false}
  //show the names on config tab
  updateShownColumnNames();
  if(debug){console.log(config)}
  //refresh the plots
  drawEverything_noData();
}

//this function updates the shown names columns on the parameters tab
function updateShownColumnNames(cols){
    //if a column is already given, skips this column finding step
    var columns = []
    if(!cols){
  
      var choice = html_tabParameters.querySelector("select[name='fileSelection']").value
      if(choice == "matrix"){ columns = matrixData[0]}
      else if(choice.includes("file")){
          let fileNum = choice.slice(5);
            columns = fileData[fileNum][0];
      }
  
      if(columns.length == 0 && fileData[0] && fileData[0][0]){columns = fileData[0][0]}
      if(columns.length == 0){return;}
    }else{
      columns = cols
    }
  document.getElementById("config_mz_name").innerHTML = columns[config.mz]
  document.getElementById("config_intensity_name").innerHTML = columns[config.intensity]
  document.getElementById("config_dbe_name").innerHTML = columns[config.dbe]
  document.getElementById("config_ppmerror_name").innerHTML = columns[config.ppmerror]
  document.getElementById("config_formulatext_name").innerHTML = columns[config.formulatext]
}



//function for automatic finding of column based on the title of the columns
document.getElementById("columnsetup_auto").addEventListener("click",function(){autoSetupColumns()})


function autoSetupColumns(cols){
  //if a column is already given, skips this column finding step
  var columns = []
  if(!cols){
    var choice = html_tabParameters.querySelector("select[name='fileSelection']").value
    if(choice == "matrix"){ columns = matrixData[0]}
    else if(choice.includes("file")){
        let fileNum = choice.slice(5);
          columns = fileData[fileNum][0];
    }

    if(columns.length == 0){return alertPopup("Error with automatic column search. \n Please select a file containing data")}
  }else{
    columns = cols
  }
  //looks for every parameter
  var col_mz = ["m/z","mz","mass"];
  var col_i = ["intensity","abundance","abund","i"];
  var col_dbe = ["dbe","rdb"];
  var col_ppmerror = ["ppm","error"];
  var col_formula = ["formula"];
  var colSeek = [col_mz, col_i, col_dbe, col_ppmerror, col_formula];
  var colNumbers = []; //sets the column numbers in a temporary array to not update everytime it find a column containing m/z
  //usually the m/z value is at the beginning of the table, so breaks everytime it found a meeting condition
  for(let i=0; i<colSeek.length; i++){  //loops through the config to find
    for(let j=0; j<colSeek[i].length; j++){  //loops through the names possible for the column
      if(colNumbers[i] != undefined){break;} 
      for(let k=0; k<columns.length; k++){ //loops through the columns of the uploaded file
        var text = columns[k].toLowerCase();
        if(text.indexOf(colSeek[i][j]) != -1){ colNumbers[i] = k; break;}
      }
    }
  }
  //sets the values found
  config.mz = colNumbers[0];
  config.intensity = colNumbers[1];
  config.dbe = colNumbers[2];
  config.ppmerror = colNumbers[3];
  config.formulatext = colNumbers[4];
  document.getElementById("config_mz").value = config.mz;
  document.getElementById("config_intensity").value = config.intensity;
  document.getElementById("config_dbe").value = config.dbe;
  document.getElementById("config_ppmerror").value = config.ppmerror;
  document.getElementById("config_formulatext").value = config.formulatext;

  if(columns.length >0){
    columnNames = columns
  }
  updateShownColumnNames(columns);
}

document.getElementById("columnSetupTable").addEventListener("change",function(){
  config.mz = document.getElementById("config_mz").value
  config.intensity = document.getElementById("config_intensity").value
  config.dbe = document.getElementById("config_dbe").value
  config.ppmerror = document.getElementById("config_ppmerror").value
  config.formulatext = document.getElementById("config_formulatext").value
  updateShownColumnNames();
})

/** looks through an array "columns" for any name containing a string in the "textArray". First string in textArray is prioritarly returned. Not case sensitive */
function lookForColumn(columns, textArray){
    for(let i=0; i<textArray.length; i++){
      for(let j=0; j<columns.length; j++){
        var text = columns[j].toLowerCase();
        if(text.indexOf(textArray[i]) != -1){return j}
      }
    }
    return ""
}




/** updates the parameters tab html inputs*/
function updateParametersShownValues(){
  document.getElementById("config_mz").value = config.mz;
  document.getElementById("config_intensity").value = config.intensity;
  document.getElementById("config_dbe").value = config.dbe;
  document.getElementById("config_ppmerror").value = config.ppmerror;
  document.getElementById("config_formulatext").value = config.formulatext;

  if(!document.getElementById("config_nogrid")){return;}
  //updates the graphical inputs
  document.getElementById("config_nogrid").checked = config.nogrid;
  document.getElementById("config_cellBackColor").value = config.cellBackColor;
  document.getElementById("config_blackCircle").checked = config.blackCircle;
  document.getElementById("config_boxBorders").checked = config.boxBorders;
  document.getElementById("config_hideColorLegend").checked = config.hideColorLegend;
  document.getElementById("config_legendFont").value = config.legendFont;
  document.getElementById("config_legendFontSize").value = config.legendFontSize;
  document.getElementById("config_legendFontSizeSmall").value = config.legendFontSizeSmall;
  document.getElementById("config_endAxis").checked = config.endAxis;
  document.getElementById("config_showTitle").checked = config.showTitle;
  document.getElementById("config_titlePosition").value = config.titlePosition;
  document.getElementById("config_axisLines").value = config.axisLines;
  document.getElementById("config_width").value = width;
  document.getElementById("config_height").value = height;
  document.getElementsByName("allowTooltipPieChart")[0].checked = config.tooltipPie.allow;

  updateShownColumnNames();
}
/**------------------------------------------------------------------------- */

document.getElementsByName("editTooltipPieChart")[0].addEventListener("click", editTooltipPie)

function editTooltipPie(){
  let text = document.createElement("div")
  text.innerHTML ="Edit pie chart display and colors: <br><br> Display percentages : "
  let inputColor = document.createElement("input")
  inputColor.setAttribute("type","checkbox")
  inputColor.setAttribute("checked",config.tooltipPie.showPercents)
  inputColor.setAttribute("name","showPercents")
  text.appendChild(inputColor)
  text.innerHTML += "<br><br>Colors: "
  for(let i=0; i<config.tooltipPie.colors.length; i++){
    text.innerHTML += "<br><br> Color n°"+(i+1)+" :"
    let thisColor = config.tooltipPie.colors[i]
    let newInput = document.createElement("input")
    newInput.setAttribute("type","text")
    newInput.setAttribute("name","color"+i)
    newInput.setAttribute("class","coloris instance3")
    newInput.setAttribute("value",thisColor)
    newInput.setAttribute("data-coloris",thisColor)
    text.appendChild(newInput)
  }

  var buttons = [
    {"name":"Save","function": readShowTooltipPie}
  ]
  var selecters = []
  handlePopup("popup",text.innerHTML,buttons,selecters, [])
  //re- sets the value of the checkbox
  let popup = document.getElementsByName("popup_popup")
  if(popup){popup = popup[0]}
  popup.querySelector("input[name='showPercents']").checked = config.tooltipPie.showPercents
}

function readShowTooltipPie(){
  let popup = document.getElementsByName("popup_popup")
  if(popup){popup = popup[0]}
  let showPercents = popup.querySelector("input[name='showPercents']").checked
  config.tooltipPie.showPercents = showPercents
  for(let i=0; i<config.tooltipPie.colors.length; i++){
    let colorValue = popup.querySelector("input[name='color"+i+"']").value
    config.tooltipPie.colors[i] = colorValue
  }
}


/**------------------------------------------------------------------------- */
function openUploadParameters(){
  var main_popup = document.getElementById("main_popup")
  var popup = document.createElement("div")
  var popup_box = document.createElement("div")
  var popup_close = document.createElement("button")
  
  popup_box.setAttribute("class", "popupcontextwide")
  popup_close.setAttribute("class","popuptrueclose")
  popup_close.innerHTML = "X"
  popup_box.appendChild(popup_close)

  popup.setAttribute("class","popup")
  popup.setAttribute("name", "popup_"+name)
  popup.style.display ="block"
  popup_box.style.maxHeight = "90%"

  //creates the content
  var content = document.createElement("div")
  content.setAttribute("class","popupwidediv")
  var html_uploadSeparator = document.createElement("select")
  html_uploadSeparator.setAttribute("name","uploadSeparator")
  var label_uploadSeparator = document.createElement("label")
  label_uploadSeparator.setAttribute("for","uploadSeparator")
  label_uploadSeparator.innerHTML="Uploaded files separator: "
  content.appendChild(label_uploadSeparator)
  content.appendChild(html_uploadSeparator)
  createSelecterOptionsSeparators(html_uploadSeparator)
  content.innerHTML += "<br>"

  var html_pastedSeparator = document.createElement("select")
  html_pastedSeparator.setAttribute("name","pastedSeparator")
  var label_pastedSeparator = document.createElement("label")
  label_pastedSeparator.setAttribute("for","pastedSeparator")
  label_pastedSeparator.innerHTML="Pasted files separator: "
  content.appendChild(label_pastedSeparator)
  content.appendChild(html_pastedSeparator)
  createSelecterOptionsSeparators(html_pastedSeparator)
  content.innerHTML += "<br>----------------------------------<br>Automatized tasks when uploading a file:"
  content.innerHTML += "<br>TO BE DONE"

  popup_box.appendChild(content)
  //creates the save button
  var html_button = document.createElement("button")
  html_button.setAttribute("class","popupclose")
  html_button.setAttribute("name","popup_button")
  html_button.innerHTML = "SAVE"
  popup_box.innerHTML += "<br>"
  popup_box.appendChild(html_button)





  popup.appendChild(popup_box)
  main_popup.appendChild(popup)
 //appending the functions
  popup.querySelector('button[name="popup_button"]').addEventListener("click", function(){saveUploadParametersMenu(popup);closePopup(this)})
  popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
  setSelectVal(popup, "uploadSeparator", splitter)
  setSelectVal(popup, "pastedSeparator", splitterTextArea)
}


/**creates the different separators options for a defined selecter */
function createSelecterOptionsSeparators(selecter){
  var separatorOptions = []
  for(let i=0; i<5; i++){separatorOptions[i] = document.createElement("option")}
  separatorOptions[0].innerHTML = "TAB"; 
  separatorOptions[0].setAttribute("value","	")
  separatorOptions[1].innerHTML = "COMMA (,)";
  separatorOptions[1].setAttribute("value",",")
  separatorOptions[2].innerHTML = "SEMICOLON (;)";
  separatorOptions[2].setAttribute("value",";")
  separatorOptions[3].innerHTML = "SPACE";
  separatorOptions[3].setAttribute("value"," ")
  separatorOptions[4].innerHTML = "DOUBLE SPACE";
  separatorOptions[4].setAttribute("value","  ")
  for(let i=0; i<5; i++){selecter.appendChild(separatorOptions[i])}
}

/** registers the modifications of the upload parameters popup */
function saveUploadParametersMenu(popup){
  var newSplitter = popup.querySelector("select[name='uploadSeparator']").value
  var newSplitterTextArea = popup.querySelector("select[name='pastedSeparator']").value
  splitter = newSplitter
  splitterTextArea = newSplitterTextArea
}

/**------------------------------------------------------------------------- */
//collapsers of menus
var collapsers = document.getElementsByClassName("topcollapser")
for(let i=0; i<collapsers.length; i++){
  collapsers[i].addEventListener("click", function() {
    var collapsingMenu = collapsers[i].closest('.tabcontent').getElementsByClassName("topselecter")[0]
    if(collapsingMenu.style.display == "none"){
      collapsingMenu.style.display = null;
      collapsers[i].innerHTML = "▲";
    }else{
      collapsingMenu.style.display = "none"
      collapsers[i].innerHTML = "▼";
    }

  });
}

//collapser in help tab
var collapseHeaders = document.getElementsByClassName("collapseHeader")
for(let i=0; i<collapseHeaders.length; i++){
  collapseHeaders[i].addEventListener("click", function() {
    var collapsID = this.attributes.collapsID.value
    var innerHTML = this.innerHTML
    innerHTML = innerHTML.slice(0,-1)
    var collapsable = document.querySelector("div[collapsidtarget='"+collapsID+"']")
    if(collapsable.classList.contains("collapsed")){
      collapsable.classList.toggle("collapsed")
      collapsable.classList.toggle("shown")
      innerHTML += "▲";
    }else{
      collapsable.classList.toggle("collapsed")
      collapsable.classList.toggle("shown")
      innerHTML += "▼";
    }
    this.innerHTML = innerHTML
  });
};



/**------------------------------------------------------------------------- */
//refresh buttons for every tab
document.getElementById("refreshButton").addEventListener("click", function(){
  resetColumnNames() //reset the variable columnNames
  var allTabs = document.getElementsByClassName("tabcontent")
  for(let i=0; i<allTabs.length; i++){
    if(allTabs[i].style.display == "block"){
      var tabName = allTabs[i].id
      indexFiles()
      if(tabName == "tab_venn"){
        drawVennChoices();
        drawVenn();
      }
      else if(tabName == "tab_table"){
        resetFilesChoices(html_tabTable.querySelector("select[name='fileSelection']"));
        updateTableTab()
      }
      else if(tabName =="tab_parameters"){
        resetFilesChoices(html_tabParameters.querySelector("select[name='fileSelection']"));
      }
      else if(tabName == "tab_classes"){
        startClassesTab();
      }
      else if(tabName == "tab_treatment"){
        addFilesToTreatmentTable();
        createTreatmentOptionMenu();
      }
      else if(tabName == "tab_matrix"){
        addFilesToMatrixTable();
      }
      else if(tabName == "tab_canvasA"){
        canvasA.htmlTopMenu.draw()
        canvasA.draw()
      }
      else if(tabName == "tab_canvasB"){
        canvasB.htmlTopMenu.draw()
        canvasB.draw()
      }
      else if(tabName == "tab_canvasS"){
        canvasS.htmlTopMenu.draw()
        canvasS.draw()
      }
      else if(tabName == "tab_upload"){
        updateFilesInfos();
        for(let i=0; i<nameslist.length; i++){
          createTitle(nameslist[i], i+1, false)
        }
      }
      else if(tabName == "tab_pca"){
        resetFilesChoices(html_tabPca.querySelector("select[name='fileSelection']"));
        handlePCA();
      }
      else if(tabName == "tab_network"){
        canvasNetwork.draw()
        canvasNetwork.network.startSim()
      }
      else if(tabName == "tab_attrib"){
        quickStartupInterfaceAttrib(true)
        attribCheckboxMenuUpdate()
      }
      else if(tabName == "tab_calib"){
        resetFilesChoices(html_tabCalib.querySelector("select[name='fileSelection']"));
      }
    }
  }
});

/**a function that searches for the last uploaded file to base the columns on. */
function resetColumnNames(){
  for(let i=fileData.length; i>=0; i--){
    if(fileData[i] && fileData[i][0]){
      columnNames = fileData[i][0]
      return;
    }
  }
}

/***------------------------------- */
//functions for the help button

// document.getElementById("helpButton").addEventListener("click", function(){
//   let text = "Hover any menu where you would like details to get a helping tooltip explaining the menu. "
//   var buttons = [{"name":"OK","function":function(){}},]
//   handlePopup("helpIntro",text,buttons,[],[])

//   helpMode = true
//   document.body.setAttribute("style","cursor:help !important")

// })


/**------------------------------------------------------------------------- */
//function for editing and creating new color scales

document.getElementsByName("editColorScaleAdd")[0].addEventListener("click",function(){
  config.customColors.push({"colors":[],"weights":[],"name":"newColorScale"+(config.customColors.length+1)})
  updateCustomColorScalesChoice()
  drawEverything_noData();
});
document.getElementsByName("editColorScaleDel")[0].addEventListener("click",function(){
  let selecter = document.getElementById("selectEditableColorScale")
  config.customColors.splice(selecter.value, 1)
  updateCustomColorScalesChoice()
  drawEverything_noData();
});

document.getElementById("selectEditableColorScale").addEventListener("click",updateCustomColorScalesChoice)
document.getElementById("selectEditableColorScale").click()

function updateCustomColorScalesChoice(){
  let selecter = document.getElementById("selectEditableColorScale")
  let oldChoice = selecter.value
      //delete previous options
      if(selecter.options != null){
          for(let j=selecter.options.length-1; j>=0; j--) { //backward for to remove all options
            selecter.remove(j);
          }
      }
      //creates all the needed options
      if(!config.customColors){config.customColors = []}
      let choicesNb = config.customColors.length
      let options = []
      for(let i=0; i<choicesNb; i++){
        options[i] = document.createElement("option")
        options[i].value = i
        options[i].innerHTML = config.customColors[i].name
        selecter.appendChild(options[i])
      }
      selecter.value = oldChoice || 0
}


/** Handles the color scale editor  */
document.getElementsByName("editColorScale")[0].addEventListener("click", createEditColorScalePopup)

function createEditColorScalePopup(transferData){
  //finds the data
  let colorScaleNum = document.getElementById("selectEditableColorScale").value
  let colorScaleOriginal = config.customColors[colorScaleNum]
  let colorScale = {}
  if(transferData.weights){colorScale = transferData}
  else{ // clean copy
    colorScale.weights = [];
    colorScale.colors = [];
    colorScale.name = colorScaleOriginal.name
    for(let i=0; i<colorScaleOriginal.colors.length; i++){
      colorScale.weights[i] = colorScaleOriginal.weights[i]
      colorScale.colors[i] = colorScaleOriginal.colors[i]
    }
  }
  let weights = colorScale.weights
  let colors = colorScale.colors
  let text = document.createElement("div")
  text.innerHTML ="Edit the color scale here <br>"

  //create a visual scale
  let dataScale = d3.scaleLinear().domain(weights).range(colors)
  let svgZone = document.createElement("svg")
  svgZone.style.height= "45px"
  let pixels = []
  for (let i=0; i<150; i++){
    pixels[i] = document.createElement("rect")
    pixels[i].setAttribute("x",i*2)
    pixels[i].setAttribute("y",0)
    pixels[i].setAttribute("width",2)
    pixels[i].setAttribute("height",40)
    pixels[i].setAttribute("fill",dataScale(i/150))
    svgZone.appendChild(pixels[i])
  }
  text.appendChild(svgZone)
  text.innerHTML +="<br>"
  let editName = document.createElement("input")
  editName.type ="text"
  editName.setAttribute("name","colorScaleName")
  editName.style.width = "40%"
  editName.style.fontSize = "20px"
  editName.setAttribute("value", colorScale.name)
  text.appendChild(editName)
  text.innerHTML += "<br><br>"

  let table = document.createElement("table")
  let lines = []
  let cells1 = []
  let cells2 = []
  let cells3 = []
  let inputsCol = []
  let inputsWei = []
  let buttonsDel = []
  lines[0]= document.createElement("tr");
  cells1[0]=document.createElement("td");
  cells2[0]=document.createElement("td");
  cells3[0]=document.createElement("td");
  cells1[0].innerHTML = "Color"
  cells2[0].innerHTML = "Position(%)"
  cells3[0].innerHTML = "Delete"
  lines[0].appendChild(cells1[0])
  lines[0].appendChild(cells2[0])
  lines[0].appendChild(cells3[0])
  table.appendChild(lines[0])
  for(let i=0; i<weights.length; i++){
    lines[i+1]= document.createElement("tr");
    cells1[i+1]=document.createElement("td");
    cells2[i+1]=document.createElement("td");
    cells3[i+1]=document.createElement("td");
    inputsCol[i+1]=document.createElement("input");
    inputsCol[i+1].setAttribute("class","coloris instance3");
    inputsCol[i+1].setAttribute("name","inputCol"+i);
    inputsCol[i+1].setAttribute("data-coloris",colors[i])
    inputsCol[i+1].setAttribute("value",colors[i])
    inputsCol[i+1].style.color = "black";
    inputsWei[i+1]=document.createElement("input");
    inputsWei[i+1].setAttribute("type","number");
    inputsWei[i+1].setAttribute("name","inputWei"+i);
    inputsWei[i+1].setAttribute("value",100*weights[i])
    inputsWei[i+1].style.color = "black";
    buttonsDel[i+1] = document.createElement("button")
    buttonsDel[i+1].setAttribute("name","delButton"+i)
    buttonsDel[i+1].addEventListener("click",function(){console.log("del")})
    buttonsDel[i+1].innerHTML = "DEL"
  }
  //appends
  for(let i=0; i<weights.length;i++){
    cells1[i+1].appendChild(inputsCol[i+1])
    cells2[i+1].appendChild(inputsWei[i+1])
    cells3[i+1].appendChild(buttonsDel[i+1])
    lines[i+1].appendChild(cells1[i+1])
    lines[i+1].appendChild(cells2[i+1])
    lines[i+1].appendChild(cells3[i+1])
    table.appendChild(lines[i+1])
    //sets the values
  }
  text.appendChild(table)
  text.innerHTML += "<br>"

  let button = document.createElement("button")
  button.setAttribute("name",'addButton')

  button.innerHTML = "ADD"
  text.appendChild(button)

  
  var buttons = [
    {"name":"Save","function": saveColorScalePopup, "arg1":colorScale}
  ]
  var selecters = []
  handlePopup("popupColorScale",text.innerHTML,buttons,selecters, [])
  //appends the buttons functions
  //adding
  let truePopup = document.getElementsByName("popup_popupColorScale")[0]
  truePopup.querySelector("button[name='addButton']").addEventListener("click", function(){
    if(weights.length == 0){weights.push(0)}
    else{weights.push(1)}
    colors.push("")
    truePopup.querySelector("button[class='popuptrueclose']").click()
    colorScale.name = truePopup.querySelector("input[name='colorScaleName']").value
    createEditColorScalePopup(colorScale)
  })
  //deleting
  for(let i=0; i<weights.length; i++){
    truePopup.querySelector("button[name='delButton"+i+"']").addEventListener("click", function(){
      weights.splice(i,1)
      colors.splice(i,1)
      truePopup.querySelector("button[class='popuptrueclose']").click()
      colorScale.name = truePopup.querySelector("input[name='colorScaleName']").value
      createEditColorScalePopup(colorScale)
    })
  }
  //reading the table
  truePopup.querySelector("table").addEventListener("change",function(){
    for(let i=0; i<weights.length; i++){
      colors[i] = truePopup.querySelector("input[name='inputCol"+i+"']").value
      weights[i] = 0.01*parseFloat(truePopup.querySelector("input[name='inputWei"+i+"']").value)
    }
    colorScale.name = truePopup.querySelector("input[name='colorScaleName']").value
    truePopup.querySelector("button[class='popuptrueclose']").click()
    createEditColorScalePopup(colorScale)
  })

}

function saveColorScalePopup(popupData){
  let colorScaleNum = document.getElementById("selectEditableColorScale").value
  let colorScale = config.customColors[colorScaleNum]
  let truePopup = document.getElementsByName("popup_popupColorScale")[0]
  colorScale.name = truePopup.querySelector("input[name='colorScaleName']").value
  colorScale.weights = popupData.weights
  colorScale.colors = popupData.colors
  updateCustomColorScalesChoice()
  //refresh the plots
  drawEverything_noData();
}

/** Handles the tooltip supp data editor  */
document.getElementsByName("editSuppDataTooltip")[0].addEventListener("click", createTooltipSuppDataEditorPopup)

function createTooltipSuppDataEditorPopup(recursiveData){
  //finds the data
  let dataOriginal = config.customTooltipData
  if(!dataOriginal){dataOriginal = []}
  let data = dataOriginal.slice()
  if(recursiveData[0] || recursiveData[0]== 0){data = recursiveData}

  let text = document.createElement("div")
  text.innerHTML ="Edit the data columns that will be shown on tooltips from scatter plots and kendrick maps<br>"
  text.innerHTML +="Each information will be shown on a different line <br><br>"

  let table = document.createElement("table")
  let lines = []
  let cells1 = []
  let cells2 = []
  let cells3 = []
  let inputsCol = []
  let buttonsDel = []
  lines[0]= document.createElement("tr");
  cells1[0]=document.createElement("td");
  cells2[0]=document.createElement("td");
  cells3[0]=document.createElement("td");
  cells1[0].innerHTML = "Column Nb"
  cells2[0].innerHTML = "Name"
  cells3[0].innerHTML = "Delete"
  lines[0].appendChild(cells1[0])
  lines[0].appendChild(cells2[0])
  cells2[0].style.width = "200px"
  lines[0].appendChild(cells3[0])
  table.appendChild(lines[0])
  for(let i=0; i<data.length; i++){
    lines[i+1]= document.createElement("tr");
    cells1[i+1]=document.createElement("td");
    cells2[i+1]=document.createElement("td");
    cells3[i+1]=document.createElement("td");
    inputsCol[i+1]=document.createElement("input");
    inputsCol[i+1].setAttribute("name","inputCol"+i);
    inputsCol[i+1].setAttribute("type","number");
    inputsCol[i+1].setAttribute("value",data[i])
    inputsCol[i+1].style.color = "black";
    buttonsDel[i+1] = document.createElement("button")
    buttonsDel[i+1].setAttribute("name","delButton"+i)
    buttonsDel[i+1].addEventListener("click",function(){console.log("del")})
    buttonsDel[i+1].innerHTML = "DEL"
  }
  //appends
  for(let i=0; i<data.length;i++){
    cells1[i+1].appendChild(inputsCol[i+1])
    cells2[i+1].innerHTML = columnNames[data[i]]
    cells2[i+1].style.width = "200px"
    cells3[i+1].appendChild(buttonsDel[i+1])
    lines[i+1].appendChild(cells1[i+1])
    lines[i+1].appendChild(cells2[i+1])
    lines[i+1].appendChild(cells3[i+1])
    table.appendChild(lines[i+1])
  }
  text.appendChild(table)
  text.innerHTML += "<br>"

  let button = document.createElement("button")
  button.setAttribute("name",'addButton')
  button.innerHTML = "ADD"
  text.appendChild(button)
  var buttons = [
    {"name":"Save","function": saveTooltipConfigPopup, "arg1":data}
  ]
  var selecters = []
  handlePopup("popupColorScale",text.innerHTML,buttons,selecters, [])
  //appends the buttons functions
  //adding
  let truePopup = document.getElementsByName("popup_popupColorScale")[0]
  truePopup.querySelector("button[name='addButton']").addEventListener("click", function(){
    data.push(0)
    truePopup.querySelector("button[class='popuptrueclose']").click()
    createTooltipSuppDataEditorPopup(data)
  })
  //deleting
  for(let i=0; i<data.length; i++){
    truePopup.querySelector("button[name='delButton"+i+"']").addEventListener("click", function(){
      data.splice(i,1)
      truePopup.querySelector("button[class='popuptrueclose']").click()
      createTooltipSuppDataEditorPopup(data)
    })
  }
  //reading the table
  truePopup.querySelector("table").addEventListener("change",function(){
    for(let i=0; i<data.length; i++){
      data[i] = truePopup.querySelector("input[name='inputCol"+i+"']").value
    }
    truePopup.querySelector("button[class='popuptrueclose']").click()
    createTooltipSuppDataEditorPopup(data)
  })
}

function saveTooltipConfigPopup(data){
  config.customTooltipData = data.slice()
  drawEverything_noData()
}


/**------------------------------------------------------------------------- */

/** a function to download a file */
function downloadFile(name, content, extension){
  if(debug){console.log("downloading "+name+'.'+extension)}
  if(debug){console.log(content.dataset)}
    var file = document.createElement('a');
    mimeType = "image/png" || 'application/octet-stream';
    var Blobfile = null
    Blobfile = new Blob([content.dataset], {type: mimeType})
    file.href = content.toDataURL(extension)
    if(name == ""){file.setAttribute('download', "download_default"+"."+extension);}
    else{file.setAttribute('download', name+"."+extension);}
    document.body.appendChild(file);
      file.click();
      document.body.removeChild(file);
      file.href = URL.revokeObjectURL(Blobfile);
}


/**------------------------------------------------------------------------------------
 * -------------------------------------------------------------------------------------
 * -------------------------------------------------------------------------------------
 * -------------------------------------------------------------------------------------
 * -------------------------------------------------------------------------------------
 ------------------------------------------------------------------------------------*/

/**
 * A function to set the value of a selecter and resets it to the first value if the value wanted doesn't exists. Returns the default value
 * @param {*} container the container where the selecter is located
 * @param {*} name its name. Keep empty if you look by ID
 * @param {*} value the new value of the selecter. It's value corrected will get returned if the option doesn't exist
 * @param {*} id ID of the select. Not needed if you look by name
 * @param {*} customDefault a custom default value if the first value option doesn't exist
 * @returns the new value of "value" if the option doesn't exists
 */
 function setSelectVal(container, name, value, id, customDefault){
  var select
  //looks for the selecter
  if(name && name != ""){select = container.querySelector("select[name="+name+"]")}
  if(id && id != ""){ select = container.querySelector("select[id="+id+"]")}
  //checks if the good option exists
  var foundOption = false
  for(let i=0; i<select.options.length; i++){
      if(select.options[i].value == value){foundOption =true; break;}
  }
  //if the option doesn't exists, gives the first option or a custom default value
  if(!foundOption && select.options.length >0){ 
      value = select.options[0].value
      if(customDefault){value = customDefault}
  }
  //returns the value of the selecter
  if(select){
      select.value = value
      return value
  }else if(debug){return console.warn("tried to define select value to undefined selecter")}
}


///////////////////////////////////////////////////////////////////////////////////



 createColorOptions()
/** create color options for every selecter of color*/
function createColorOptions(){
var colorOptions = document.getElementsByName("colorscheme")

  //iterate through each color selector
  for(let i=0; i<colorOptions.length; i++){
    //create and append the options
    for(let j=0; j<colorsList.length; j++){
      var option = document.createElement("option");
      option.value = colorsList[j].name
      option.text = colorsList[j].text
      //for the separators
      if(option.value == "Greys" && option.text !="Greys"){option.setAttribute('disabled', '') }
      colorOptions[i].appendChild(option);
    }
  }
}

/**create color options on a specific selecter */
function createColorOptions2(selecter){
    //create and append the options
    for(let j=0; j<colorsList.length; j++){
      var option = document.createElement("option");
      option.value = colorsList[j].name
      option.text = colorsList[j].text
      //for the separators
      if(option.value == "Greys" && option.text !="Greys"){option.setAttribute('disabled', '') }
      selecter.appendChild(option);
    }
    if(!config.customColors){config.customColors = []}
    //iterate through custom new color scales
    if(config.customColors.length >0){
      //create a separator
      var sep = document.createElement("option");
        sep.value ="Greys"
        sep.text = "------Custom------------"
        sep.setAttribute('disabled','')
        selecter.appendChild(sep);
      for(let i=0; i<config.customColors.length; i++){
        let optionCustom = document.createElement("option");
        optionCustom.value = "custom_"+i
        optionCustom.text = config.customColors[i].name
        selecter.appendChild(optionCustom);
      }
    }
    return selecter
}



/**  A function that return TRUE or FALSE according if a dot is in the selection or not 
 * useful for first 3 diagrams
*/
function isBrushed(brush_coords, cx, cy) {
  var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
}


function isNotBrushed(brush_coords, cx, cy) {
  var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];
  return cx < x0 || x1 < cx || cy < y0 || y1 < cy;    // This return TRUE or FALSE depending on if the points is in the selected area
}

//isBrushed but only for the X axis
function isBrushedX(brush_coords, cx, cy) {
  var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0];
  return x0 <= cx && cx <= x1   // This return TRUE or FALSE depending on if the points is in the selected area
}

function Brushing(brush_coords, cx, cy) {
  var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];
  if ( x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1){ return 'selected'}
  return 'greyed';
}


/**A function that return TRUE or FALSE according if a dot is in the selection or not  
 * Useful for histograms
 */
function isNotChosen(brush_coords, cx) {
    var x0 = brush_coords[0],
        x1 = brush_coords[1];
    var output= false;
    if (cx < x0 || x1 < cx ){
          output = true;
    }
    return output  ;    // This return TRUE or FALSE depending on if the points is in the selected area
}
/** acts like isNotChosen but in the opposite way*/
function isChosen(brush_coords, cx) {
  var x0 = brush_coords[0],
      x1 = brush_coords[1];
  var output= false;
  if (x0 <= cx && cx <= x1){
      output = true;
  }
  return output  ;    // This return TRUE or FALSE depending on if the points is in the selected area
}





/**Move a selection to the front or the back */
// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
          if(firstChild.id !="trueBackground"){ //do not go beyond trueBackground id elements
            this.parentNode.insertBefore(this, firstChild); 
          }else{
            this.parentNode.insertBefore(this, firstChild.nextSibling)
          }

        } 
    });
};

var sortvalue = 0;
/**Allows the sorting of data based on a specific column. Warning, you need to redefine "sortvalue" as being the column juste before using this function */
function sortFunction(a, b) {
  if (a[sortvalue] === b[sortvalue]) {
      return 0;
  }
  else {
      return (parseFloat(a[sortvalue]) < parseFloat(b[sortvalue])) ? -1 : 1;
  }
}

/** Statistical function for inverse normal law */
function NormSInv(p) {
  var a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969;
  var a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
  var b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887;
  var b4 = 66.8013118877197, b5 = -13.2806815528857, c1 = -7.78489400243029E-03;
  var c2 = -0.322396458041136, c3 = -2.40075827716184, c4 = -2.54973253934373;
  var c5 = 4.37466414146497, c6 = 2.93816398269878, d1 = 7.78469570904146E-03;
  var d2 = 0.32246712907004, d3 = 2.445134137143, d4 = 3.75440866190742;
  var p_low = 0.02425, p_high = 1 - p_low;
  var q, r;
  var retVal;

  if ((p <= 0) || (p >= 1))
  {
    if(debug){console.log("NormSInv: Argument out of range.");}
      retVal = 0;
  }
  else if (p < p_low)
  {
      q = Math.sqrt(-2 * Math.log(p));
      retVal = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
  else if (p <= p_high)
  {
      q = p - 0.5;
      r = q * q;
      retVal = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  }
  else
  {
      q = Math.sqrt(-2 * Math.log(1 - p));
      retVal = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  return retVal;
}







/** calculates the linear regression of a data list
 * @data must have this structure: {{x:,y:},{x:,y:}}
 */
function linearRegression(data){

  var x=[];
  var y=[];
  for(var i = 0; i< data.length; i++){
    x.push(data[i].x)
    y.push(data[i].y)
  }
  var lr = {};
  var n = y.length;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;

  for (var i = 0; i < y.length; i++) {

      sum_x += x[i];
      sum_y += y[i];
      sum_xy += (x[i]*y[i]);
      sum_xx += (x[i]*x[i]);
      sum_yy += (y[i]*y[i]);
  } 

  lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
  lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
  lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

  return lr;

};
/** Setup from svg crowbar master to download svg files */

function setInlineStylesSVG(svg) {

  function explicitlySetStyle (element) {
    if(element == null){return;}
    var cSSStyleDeclarationComputed = getComputedStyle(element);
    var i, len, key, value;
    var computedStyleStr = "";
    for (i=0, len=cSSStyleDeclarationComputed.length; i<len; i++) {
      key=cSSStyleDeclarationComputed[i];
      value=cSSStyleDeclarationComputed.getPropertyValue(key);
        computedStyleStr+=key+":"+value+";";

    }
    element.setAttribute('style', computedStyleStr);
  }
  function traverse(obj){
    var tree = [];
    tree.push(obj);
    visit(obj);
    function visit(node) {
      if (node && node.hasChildNodes()) {
        var child = node.firstChild;
        while (child) {
          if (child.nodeType === 1 && child.nodeName != 'SCRIPT'){
            tree.push(child);
            visit(child);
          }
          child = child.nextSibling;
        }
      }
    }
    return tree;
  }
  // hardcode computed css styles inside svg
  var allElements = traverse(svg);
  var i = allElements.length;
  while (i--){
    explicitlySetStyle(allElements[i]);
  }
}

/** this is for saving a svg file. You have to setup source.source as a XMLSerializer of the svg file */
function downloadSVG(source, nameType) {
  //code taken from svg crowbar master 
  var filename = "puncdata_"+nameType;

  var url = window.URL.createObjectURL(new Blob(source.source, { "type" : "text\/xml" }));

  var a = document.createElement("a");
  document.body.appendChild(a);
  a.setAttribute("class", "svg-crowbar");
  a.setAttribute("download", filename + ".svg");
  a.setAttribute("href", url);
  a.style["display"] = "none";
  a.click();

  setTimeout(function() {
    window.URL.revokeObjectURL(url);
  }, 10);
}


/******************************************* */
/** swaps elements in an array */
function swapElement(array, indexA, indexB) {
  var tempo = array[indexA];
  array[indexA] = array[indexB];
  array[indexB] = tempo;
}

//checks if a string is in lowercase.
function isLowerCase (input) {  
  return input === String(input).toLowerCase()
}


// handlePopup("oui","blabla",[{"name":"TEST BOUTON","function":""}])

/******************************************************* */
/** a function to handle Popups 
 * "buttons" must be an array containing "name" and "function" and arg1, arg2, arg3
 * "selecters" must contain a "name" and an array of "options". Each option must have value and text
 *  The html name of the popup will be "popup_"+name
*/
function handlePopup(name, text, buttons, selecters, inputs){
  var main_popup = document.getElementById("main_popup")
  var popup = document.createElement("div")
  var popup_box = document.createElement("button")
  var popup_close = document.createElement("button")
  
  popup_box.setAttribute("class", "infotext")
  popup_close.setAttribute("class","popuptrueclose")
  popup_close.innerHTML = "X"
  popup_box.appendChild(popup_close)
  if(typeof text === 'string'){
    popup_box.innerHTML += "<br>"+text + "<br>"
  }else if(text){
    popup_box.appendChild(text)
  }

  //handles the selecters and their actions
  var html_selecters = [];
  for(let i=0; i<selecters.length; i++){
    html_selecters[i] = document.createElement("select")
    html_selecters[i].setAttribute("class","popupclose")
    html_selecters[i].setAttribute("name","popup_selecter_"+i)
    html_selecters.options = []
    for(let j=0; j<selecters[i].options.length; j++){
      html_selecters.options[j] = document.createElement("option")
      html_selecters.options[j].setAttribute("value", selecters[i].options[j].value)
      html_selecters.options[j].innerHTML = selecters[i].options[j].text
      html_selecters[i].appendChild(html_selecters.options[j])
    }
    popup_box.appendChild(html_selecters[i])
  }

  //handles the inputs and their actions
  var html_inputs = [];
  for(let i=0; i<inputs.length; i++){
    html_inputs[i]= document.createElement("input")
    html_inputs[i].setAttribute("type",inputs[i].type)
    html_inputs[i].setAttribute("class","popupinput")
    html_inputs[i].setAttribute("name","popup_input_"+i)
    html_inputs[i].setAttribute("class","popupinput")
    if(inputs[i].placeholder){html_inputs[i].placeholder = inputs[i].placeholder}
    popup_box.appendChild(html_inputs[i])
  }


  //handles the buttons and their actions
  var html_buttons = []
  for(let i=0; i<buttons.length; i++){
    html_buttons[i] = document.createElement("button")
    html_buttons[i].setAttribute("class","popupclose")
    html_buttons[i].setAttribute("name","popup_button_"+i)
    html_buttons[i].innerHTML = buttons[i].name
    popup_box.innerHTML += "<br>"
    popup_box.appendChild(html_buttons[i])
  }
  
  popup.setAttribute("class","popup")
  popup.setAttribute("name", "popup_"+name)
  popup.style.display ="block"
  popup_box.style.maxHeight = "90%"
  popup_box.style.overflow = "scroll";

  popup.appendChild(popup_box)

  main_popup.appendChild(popup)

  //appending the functions
  for(let i=0; i<buttons.length; i++){
    popup.querySelector('button[name="popup_button_'+i+'"]').addEventListener("click", function(){buttons[i].function(buttons[i].arg1, buttons[i].arg2, buttons[i].arg3);closePopup(this)})
  }
  popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})

}

document.addEventListener("keydown", function(d){
  if(d.key === "Escape"){closePopup(document.getElementById("main_popup").querySelector(".popuptrueclose"))}
})

/** close a popup which is two elements deep */
function closePopup(closeElement){
  var textBox = closeElement.parentElement
  var popup = textBox.parentElement
  popup.remove();
}


function alertPopup(text){
  var main_popup = document.getElementById("main_popup")
  var popup = document.createElement("div")
  var popup_box = document.createElement("button")
  var popup_close = document.createElement("button")
  
  popup_box.setAttribute("class", "infotext")
  popup_close.setAttribute("class","popuptrueclose")
  popup_close.innerHTML = "X"
  popup_box.appendChild(popup_close)
  popup_box.innerHTML += "<br>"+text +"<br>"

  var html_button = document.createElement("button")
  html_button.setAttribute("class","warnpopupclose")
  html_button.setAttribute("name","popup_button")
  html_button.innerHTML = "close"
  popup_box.innerHTML += "<br>"
  popup_box.appendChild(html_button)

  popup.setAttribute("class","popup")
  popup.setAttribute("name", "popup_"+name)
  popup.style.display ="block"
  popup_box.style.maxHeight = "90%"
  popup_box.style.overflow = "scroll";

  popup.appendChild(popup_box)
  main_popup.appendChild(popup)
  popup.querySelector(".warnpopupclose").addEventListener("click", function(d){closePopup(this)})
  popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})

}

/**************************************************************** */
/*** intro animation code */

/***gets a random sentence */
let animTipDiv = document.getElementById("introinfo")

getRandomAnimTip()
function getRandomAnimTip(){
  let tip="did you know ? "
  let random = Math.floor(Math.random() * 14)

  switch (random){
    case 0:
      tip += "You can select data on every canvas chart";
      break;
    case 1:
      tip += "shift+ selection zooms on canvas charts";
      break;
    case 2:
      tip += "You can add every file to matrix/treatment by checking the top box";
      break;
    case 3:
      tip += "On canvas, you can display all files on a single cell, or only a selection";
      break;
    case 4:
      tip += "On canvas you can override the default parameters differently for each chart";
      break;
    case 5:
      tip += "You can change the appearance of the select tool in parameters";
    break;
    case 6:
      tip += "You can choose to display the sample title on charts (see parameters)";
    break;
    case 7:
      tip += "Many bugs can be caused by wrong column definition (see parameters)";
    break;
    case 8:
      tip += "You can delete points from a file directly on a scatter plot";
    break;
    case 9:
      tip += "You can copy data directly from a scatterplot with ctrl+c";
    break;
    case 10:
      tip = "Beware of sample comparison based on chemical formula when different adducts can exist";
    break;
    case 11:
      tip += "Venn and classes subsets appear automatically as options in canvas A & B";
    break;
    case 12:
      tip += "You can ctrl+click to when hovering over a chart to get a sticky tooltip";
    break;
    case 13:
      tip += "Sticky tooltips give the option to search on databases a chemical formula";
    break;

  }
  console.log(tip)
  animTipDiv.innerHTML = tip
}



/***Deletes the intro animation */
let animDiv = document.getElementById("introAnim")

/** to set back to normal value, put 2500 */
deleteAnimIntro(2500)
function deleteAnimIntro(delay){
  document.body.style.overflow = "hidden";
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sleep(delay).then(()=> endAnim())

  function endAnim(){
    animDiv.remove()
    document.body.style.overflow = "auto";
  }
}



/******************************************************************************************************************************************* */
//this is for the desktop version which hasn't got the .at() function for the venn diagrams so it needs to be created
function at(n) {
  // ToInteger() abstract op
  n = Math.trunc(n) || 0;
  // Allow negative indexing from the end
  if (n < 0) n += this.length;
  // OOB access is guaranteed to return undefined
  if (n < 0 || n >= this.length) return undefined;
  // Otherwise, this is just normal property access
  return this[n];
}

const TypedArray = Reflect.getPrototypeOf(Int8Array);
for (const C of [Array, String, TypedArray]) {
  Object.defineProperty(C.prototype, "at",
                        { value: at,
                          writable: true,
                          enumerable: false,
                          configurable: true });
}


/**** this a function for generating a student's law coefficients */

/** a function to get the students law coefficient. Alpha is the risk taken in percent and dol is the degrees of liberty 
 * This function is limited to a dol of 20 (otherwise it considers a dol of 1000) and has a discrete number of alpha risks: 10%,5%,4%,3%,2%,1%,0.5%,0.1% 
*/
function getStudentsLawS(alpha, dol){
  var i = 0
  if(alpha == "5" || alpha==5){i = 1}
  else if(alpha == "4" || alpha==4){i = 2}
  else if(alpha == "3" || alpha==3){i = 3}
  else if(alpha == "2" || alpha==2){i = 4}
  else if(alpha == "1" || alpha==1){i = 5}
  else if(alpha == "0.5" || alpha==0.5){i = 6}
  else if(alpha == "0.1" || alpha==0.1){i = 7}

  var j = parseInt(dol) -1
  if(j>20){j = 20}

  return studentsLawTableOfData[i][j]
}


/** a function to sort an array by alphaNumerical order */
function alphaNumericalArraySort(array){
  return array.sort(function(a, b) {
    return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
});
}

/** a function to sort an array by alphaNumerical order of a subArray */
function alphaNumericalSubArraySort(array, subIndex, skipFirst, reverseOrder){
  let firstEl = array[0].slice()
  if(skipFirst){array = array.slice(1)}
  array.sort(function(a, b) {
    return a[subIndex].localeCompare(b[subIndex], undefined, {numeric: true, sensitivity: 'base'});
});
  if(reverseOrder){array.reverse()}
  if(skipFirst){array.unshift(firstEl)}
  return array
}

/** sort an array based on another array, with a subproperty for the originalArray */
function sortArrayBasedOnArrayTargetIndex(originalArray, refArray, targetIndex) {
  const orderMap = {};
  refArray.forEach((name, index) => {
      orderMap[name] = index;
  });

  originalArray.sort((a, b) => {
      const orderA = orderMap[a[targetIndex]] !== undefined ? orderMap[a[targetIndex]] : Infinity;
      const orderB = orderMap[b[targetIndex]] !== undefined ? orderMap[b[targetIndex]] : Infinity;
      return orderA - orderB;
  });

  return originalArray;
}

/** sort an array based on a specific index from another array */
function sortArrayBasedOnArrayIndex(originalArray, refArray, refArrayIndex) {
  const orderMap = {};
  refArray.forEach((name, index) => {
      orderMap[name[refArrayIndex]] = index;
  });

  originalArray.sort((a, b) => {
      const orderA = orderMap[a] !== undefined ? orderMap[a] : Infinity;
      const orderB = orderMap[b] !== undefined ? orderMap[b] : Infinity;
      return orderA - orderB;
  });

  return originalArray;
}


var lastIndex = 0
// a function to index every file
function indexFiles(){
  var lastIndex = 0
  for(let i=0; i<fileData.length; i++){
    if(fileData[i].length <=0){continue;}
    for(let j=1; j<fileData[i].length; j++){
      fileData[i][j].index = lastIndex
      lastIndex +=1
    }
  }
  //index the matrix
  for(let i=0; i<matrixData.length; i++){
    matrixData[i].index = lastIndex
    lastIndex +=1
  }
  //index the venn files
  let vennSets = ["A","B","C","D","AuB","AuC","AuD","BuC","BuD","CuD","AuBuC","AuBuD","AuCuD","BuCuD","AuBuCuD"]
  for(let i=0; i<vennSets.length; i++){
    if(!vennData[vennSets[i]]){continue;}
    for(let j=0; j<vennData[vennSets[i]].length; j++){
      vennData[vennSets[i]][j].index = lastIndex
      lastIndex += 1
    }
  }
  
}

////////////////////////////////
/////////////////////////////////
/////MISC FUNCTIONS//////////////
 /**
  * fills a text area with a dataset
  * @param {*} areaID the id of the text area
  * @param {*} data the data array to fill it with
  */
 function fillTextArea(areaID,data){
  //seeks the text area
  //sets the text zone to contain the data separated by tab
  var text = ""
  for(let i=0; i<data.length; i++){
      if(data[i] != undefined) {
          for(let j=0; j<data[i].length;j++){
              //for the last element
              if(j+1 == data[i].length){text= text + data[i][j]}
              else {text= text + data[i][j] + "	"}
          }
      }
      text = text+'\n'
  }
  document.getElementById(areaID).value = text

}

/**
* swaps two variables
* @returns Array with a,b
*/
function swap(a,b){
 let temp = a
 a = b
 b = temp
 return [a,b]
}



/** for chi2 test */ //TODO: verify this implementation
function chiSquaredCDF(chi2, dof) {
  return gammaIncomplete(dof / 2, chi2 / 2);
}
function gammaIncomplete(s, x) {
  let sum = 1 / s;
  let value = sum;
  for (let n = 1; n < 100; n++) {
      sum *= x / (s + n);
      value += sum;
      if (sum < value * 1e-10) break; // Convergence check
  }
  return Math.exp(-x + s * Math.log(x) - Math.log(s) + Math.log(value));
}

//contains the data of the selected zones on Venn diagrams
var vennData = [];

/** creates the option for the data selection */
function createDataOptions(selecter, parentDiv){
  if(typeof selecter != 'object'){
      selecter = parentDiv.querySelector('select[name="'+selecter+'"]')
  }
  if(!selecter){return;}
  //remove all previous options
  var oldValue = selecter.value
  if(selecter.options != null){
      for(let j=selecter.options.length-1; j>=0; j--) { //backward for to remove all options
          selecter.remove(j);
      }
  }
  var options = []
  options[0] = document.createElement("option")
  options[0].setAttribute("value","none")
  options[0].innerHTML = "None"
  options[1] = document.createElement("option")
  options[1].setAttribute("value","matrix")
  options[1].innerHTML = "Matrix"
  options[2] = document.createElement("option")
  options[2].setAttribute("value","none")
  options[2].setAttribute("disabled","")
  options[2].innerHTML = "--------------------"
  var l = 3
  for(let i=0; i<fileData.length; i++){
      options[3+i] = document.createElement("option")
      options[3+i].setAttribute("value","file_"+i)
      options[3+i].innerHTML = "File : "+nameslist[i]
      l += 1
  }
  if(vennData){
      if(vennData.A){
          options[l] = document.createElement("option")
          options[l].setAttribute("value","none2")
          options[l].setAttribute("disabled","")
          options[l].innerHTML = "--------------------"
          options[l+1] = document.createElement("option")
          options[l+1].setAttribute("value","A")
          options[l+1].innerHTML = "Venn only A"
          options[l+2] = document.createElement("option")
          options[l+2].setAttribute("value","AuB")
          options[l+2].innerHTML = "Venn A∩B"
          options[l+3] = document.createElement("option")
          options[l+3].setAttribute("value","B")
          options[l+3].innerHTML = "Venn only B"
          l+=4
          if(vennData.C){
              options[l] = document.createElement("option")
              options[l].setAttribute("value","C")
              options[l].innerHTML = "Venn only C"
              options[l+1] = document.createElement("option")
              options[l+1].setAttribute("value","AuC")
              options[l+1].innerHTML = "Venn A∩C"
              options[l+2] = document.createElement("option")
              options[l+2].setAttribute("value","BuC")
              options[l+2].innerHTML = "Venn B∩C"
              options[l+3] = document.createElement("option")
              options[l+3].setAttribute("value","AuBuC")
              options[l+3].innerHTML = "Venn A∩B∩C"
              l+=4
              if(vennData.D){
                  options[l] = document.createElement("option")
                  options[l].setAttribute("value","D")
                  options[l].innerHTML = "Venn only D"
                  options[l+1] = document.createElement("option")
                  options[l+1].setAttribute("value","AuD")
                  options[l+1].innerHTML = "Venn A∩D"
                  options[l+2] = document.createElement("option")
                  options[l+2].setAttribute("value","BuD")
                  options[l+2].innerHTML = "Venn B∩D"
                  options[l+3] = document.createElement("option")
                  options[l+3].setAttribute("value","CuD")
                  options[l+3].innerHTML = "Venn C∩D"
                  options[l+4] = document.createElement("option")
                  options[l+4].setAttribute("value","AuBuD")
                  options[l+4].innerHTML = "Venn A∩B∩D"
                  options[l+5] = document.createElement("option")
                  options[l+5].setAttribute("value","AuCuD")
                  options[l+5].innerHTML = "Venn A∩C∩D"
                  options[l+6] = document.createElement("option")
                  options[l+6].setAttribute("value","BuCuD")
                  options[l+6].innerHTML = "Venn B∩C∩D"
                  options[l+7] = document.createElement("option")
                  options[l+7].setAttribute("value","AuBuCuD")
                  options[l+7].innerHTML = "Venn All (A∩B∩C∩D)"
                  l+=8
              }
          }
      }
  }
  //append all the options
  var length = 2 
  for(let i=0; i<options.length; i++){
      if(options[i]){
          selecter.appendChild(options[i])
      }
      length +=1
  }
  

  selecter.value = oldValue
  return selecter

}


//WARN BEFORE CLOSING !!!REMOVE THIS CODE WHEN MAKING THE DESKTOP VERSION!!!
window.addEventListener('beforeunload', (event) => {
  // Required for the dialog to be shown
  event.preventDefault();
  event.returnValue = '';
});