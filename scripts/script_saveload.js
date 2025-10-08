/** this script contains all fonctions to load and save data */
/** only exception: loading raw data is handled by script_file.js */


/******************************************/
/*** functions for loading savefiles *** */


/**parse a raw input and returns it as an array of arrays */
function parseInputData(rawData, splittingCharacter){
    let data = [];
    let lbreak = rawData.split(/\r?\n/);
    lbreak.forEach(res => {
        data.push(res.split(splittingCharacter));
    });
    //cleans the data of empty lines
    for(let i=data.length-1;i>0 ;i--){
      if(data[i][0]=="" && data[i][1]==""){data.splice(i,1) }
      if(data[i] <= 1){data.splice(i,1) }
    }
    //replaces all remaining commas with dots(french way of placing commas where dots are in the english version)
    for(let i=data.length-1;i>0 ;i--){
      for(let j=data[i].length-1;j>0;j--){
        data[i][j] = data[i][j].replace(/,/g,'.')
      }
    } 
    return data
}




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
/**triggered by the importPopup, needs in importFromPopup boolean to know what to */
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
    //for oldest save file compatibility (<1.14)
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
    setVennDataTable();
    quickStartupInterfaceAttrib(false);
    updateCustomColorScalesChoice();
    //resets the config tab
    html_configDivHolder.querySelector("div[name='configDiv']").remove()
    html_configDiv = createConfigHTML(config)
    html_configDivHolder.appendChild(html_configDiv) 
  }
}

/** imports ONLY the files from a pdata file */
function importPuncdataFilesOnly(input, group) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        const version = data.version;
        if (debug) console.log("version: " + version);
        if (debug) console.log("Reading pdata file: assigning variables...", data);

        if(data.version <1.16){
            for (let i = 0; i < data.fileData.length; i++) {
              let file = files.createNewFile(data.nameslist[i], files.list.length, group);
              file.fill(data.fileData[i])
          }
        }else if(data.version >=1.16){
          files.import(data.files)
        }
        resolve("importation finished");
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsText(input);
  });
}



//import a pdata file
function importPuncdataFile(input){ 
  var reader = new FileReader();
  reader.onload = onReaderLoad
  reader.readAsText(input.files[0]);

  //this will happen when the data has been read and the variable values need now to be set.
  function onReaderLoad(event){
    var data = JSON.parse(reader.result);
    if(debug){console.log("version: "+data.version)}
    if(debug){console.log("Reading pdata file: assigning variables...",data)}
    //load data
    if(!data.version || data.version<1.16){
        loadFilesOldVersion(data)

    }else{
        files = new FileList()
        files.import(data.files)
    }
    columnNames = data.columnNames
    if(!data.config.selectionTool){data.config.selectionTool = config.selectionTool}
    if(!data.config.tooltipPie){data.config.tooltipPie = config.tooltipPie}
    config = data.config
    splitter = data.splitter
    splitterTextArea = data.splitterTextArea
    isFileUploaded = data.isFileUploaded
    matrixFilesColumns = data.matrixFilesColumns || []
    matrixData = data.matrixData
    if(!data.config.margin){config.margin = {top: 10, right: 30, bottom: 90, left: 60}}
    if(data._textLog){_textLog = data._textLog}
    if(!config.sizeReductor){config.sizeReductor = 2000}
    if(!config.customTooltipData){config.customTooltipData = []}
    if(!config.height || !config.width){config.height = data.height; config.width = data.width;}
    if(data.fileLogs){fileLogs = data.fileLogs}
    if(data.vennData){vennData = data.vennData}
    if(data.vennData && !data.cfgVenn){cfgVenn ={circleNb:3,files:[0,1,2,3],colors:["","","",""]}} //to correct a specific bug for one savefile
    if(data.cfgVenn){ cfgVenn = data.cfgVenn}
    if(data.cvsPCA){ cvsPCA = data.cvsPCA}
    if(data.cfgPCA){ cfgPCA = data.cfgPCA}
    if(data.cfgNetwork){canvasNetwork.prepareCfg(data.cfgNetwork)}
    if(data.calibData){calibData = data.calibData}
    //for previous compatibility on canvases
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
    if(debug){console.log("Reading pdata file: reseting file choices...")}
    generalFilesUpdate();
    setVennDataTable();
    
    if(debug){console.log("Reading pdata file: drawing everything...")}
    drawEverything()

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

/** this function deletes all files and load files from Punc'data 1.15.7 and older to the new "File" object methods*/
function loadFilesOldVersion(savefile){
    files.deleteAllFiles()
    //searches if a "upload group was already created"
    let groupName = files.findUniqueGroupName("upload", 0)
    let newGroup = new FileGroup(groupName)
    files.groups.push(newGroup)
    let names = savefile.nameslist || []
    let startID = files.list.length
    for(let i=0; i<savefile.fileData.length; i++){
        let file = files.createNewFile(names[i], startID, newGroup)
        if(savefile.fileData[i].length){
            file.fill(savefile.fileData[i])
        }
        file.logs.push(savefile.fileLogs[i])
        startID += 1
    }
    //looks for fileCalibData metadata
    let calibData = []
    if(savefile.fileCalibData){calibData = savefile.fileCalibData}
    for(let i=0; i<calibData.length; i++){
        let file = files.list[i]
        if(!file || !calibData[i]){continue;}
        let metadata = file.metadata.calibration
        metadata.equation = calibData[i].equation
        metadata.residualError = calibData[i].residualError
        metadata.points = calibData[i].points
    }
    //looks for matrix data
    let fileParameters = []
    if(savefile.fileParameters){fileParameters = savefile.fileParameters}
    for(let i=0; i<fileParameters.length; i++){
        let file = files.list[i]
        if(!file || !fileParameters[i]){continue;}
        let matrixconfig = fileParameters[i]
        if(matrixconfig.fileType && matrixconfig.fileType =="matrix"){
            file.type = "matrix"
        }
        file.matrix.matrixMin = matrixconfig.matrixMin
        file.matrix.matrixMax = matrixconfig.matrixMax
        file.matrix.pca_loadings = matrixconfig.variablesPca
        //TODO: import PCA data
    }
    files.render()
}


/*********************************************************** */
/*********************************************************** */
/**********************SAVING FUNCTIONS********************** */
/*********************************************************** */
/*********************************************************** */

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

function exportJSONParamAsCookie(){
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
  var json = JSON.stringify(data)
  localStorage.setItem("config",json)
  return json
}


function exportJSONPuncdataFile(){
  var data = {
    "info":"This is a JSON file to load a fully working Punc'data session. It contains parameters AND data",
    "version":version.number,
    "_textLog":_textLog,
    "files":files.export(),
    "matrixData":matrixData,
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
    "cfgVenn":cfgVenn,
    "cfgPCA":cfgPCA,
    "cvsPCA":cvsPCA,
    //for ATTRIBUTION AND CALIBRATION
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