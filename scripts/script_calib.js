
function mainCalibFunction(data, database, ppmTol, calibAlgorithm){
    if(debug){console.log("starting Calibration. Will look for calibrants")}
    let foundList = calibrationFindList(data, database, ppmTol)
    if(debug){console.log("Found "+foundList.length+" calibrants. Calibrating data")}
    if(foundList.length == 0){
        return handlePopup("error","No calibrant peak found. Calibration aborted",[],[],[])
    }
    let residualError = -1
    let equation = {}
    let otherData = {}
    switch (calibAlgorithm){
        case 'linear':
            let results = calibrate_linear(data, foundList)
            data = results.data
            residualError = results.residualError
            equation = results.equation
            break;
        case 'quadratic':
            if(foundList.length < 3){return handlePopup("error","Not enough calibrants found. Calibration aborted",[],[],[])} 
            let resultsQuad = calibrate_quadratic(data, foundList)
            data = resultsQuad.data
            residualError = resultsQuad.residualError
            equation = resultsQuad.equation
            break;
        case 'freq':
            data = calibrate_freq(data, foundList)
            break;
        case 'mobile':
            let resultsMobile = calibrate_mobilemean(data, foundList)
            data = resultsMobile.data
            residualError = resultsMobile.residualError
            equation = resultsMobile.equations
            otherData={name:"means",means:resultsMobile.means}
            break;
        case 'multi':
            let resultsMulti = calibrate_multi(data, foundList)
            data = resultsMulti.data
            residualError = resultsMulti.residualError
            equation = resultsMulti.equations
            otherData={name:"multi",subGroups:resultsMulti.subGroups}
            break;
    }
    return [data, foundList, residualError, equation, otherData]
}


function calibrationFindList(data, database, ppmTol){
    //sorts the data
    data.sort(function(a, b){return a[config.mz]-b[config.mz]})
    var foundList = []
    //builds a 13C database if needed and adds it as a second database
    if(calibData.searchIsotopeC){
        let isotopes = []
        for(let i=0; i<database.length; i++){
            let iso = {
                formula : database[i].formula+"(<sup>13</sup>Cx1)",
                mass : parseFloat(database[i].mass)+1.003355,
                type : "isotope13C",
                parent : i
            }
            isotopes.push(iso)
        }
        database = database.concat(...isotopes)
    }
    //loops through the database
    for(let i=0; i<database.length; i++){
        //if the element in the DB is an isotope and its parent hasn't been found, skips it
        if(database[i].type && database[i].type =="isotope13C" && !database[database[i].parent].found){continue;}
        //loops through the data to find candidates
        for(let j=1; j<data.length; j++){
            let delta = database[i].mass - data[j][config.mz]
            if(Math.abs(delta)< 1){
                let ppm = 1e6*(delta/database[i].mass)
                if(Math.abs(ppm)< ppmTol){
                    database[i].found = true
                    let newAttrib = {}
                    newAttrib.index = i
                    newAttrib.ppm = ppm
                    newAttrib.formula = database[i].formula
                    newAttrib.massCalc =  parseFloat(database[i].mass)
                    newAttrib.massExp =  parseFloat(data[j][config.mz])
                    newAttrib.intensity = parseFloat(data[j][config.intensity])
                    newAttrib.pseudoFreq = 1/newAttrib.massExp //not used for now
                    let type = "Calibrant"
                    if(database[i].type && database[i].type == "isotope13C"){type = "Isotope"}
                    newAttrib.type = type
                    foundList.push(newAttrib)
                }
            }
        }
    }

    return foundList
}



function calibrate_linear(rawData, foundList){
 let equation =  linearRegression_generalized(foundList, "massExp","ppm")
 //makes a copy of data
 let data =[]
 for(let i=0; i<rawData.length; i++){
    data.push(rawData[i].slice())
 }
 //calibrates
 let a = equation.slope
 let b = equation.intercept
 for(let i=1; i<data.length; i++){
    let mass = parseFloat(data[i][config.mz])
    let expectedError = a*mass+b
    let deltaMass = expectedError*mass*1e-6
    data[i][config.mz] = mass + parseFloat(deltaMass)
 }
 //recalibrates the data points used for calibration
 let sumSquares = 0
 for(let i=0; i<foundList.length; i++){
    let mass = parseFloat(foundList[i].massExp)
    let expectedError = a*mass+b
    let deltaMass = expectedError*mass*1e-6
    foundList[i].massExp = mass + parseFloat(deltaMass)
    foundList[i].ppm = 1e6*(foundList[i].massCalc- foundList[i].massExp)/foundList[i].massCalc
    foundList[i].expectedError = expectedError
    sumSquares += Math.pow(foundList[i].ppm,2)
 }
 let residualError = sumSquares/(foundList.length - 2) //2 is the number of parameters for linear
 residualError = Math.sqrt(residualError)
 
 return {data:data, foundList: foundList, residualError:residualError, equation:[b,a]}
}

function calibrate_quadratic(rawData, foundList){
    //makes a matrix of the foundList
    let calibArray = []
    for(let i=0; i<foundList.length; i++){
        calibArray.push([foundList[i].massExp, foundList[i].ppm])
    }
    let equation = regression.polynomial(calibArray, {order: 2,precision: 8});
     //makes a copy of data
    let data =[]
    for(let i=0; i<rawData.length; i++){
        data.push(rawData[i].slice())
    }
    //calibrates
    let a = equation.equation[0]
    let b = equation.equation[1]
    let c = equation.equation[2]
    for(let i=1; i<data.length; i++){
        let mass = parseFloat(data[i][config.mz])
        let expectedError = a*mass*mass+b*mass+c
        let deltaMass = expectedError*mass*1e-6
        data[i][config.mz] = mass + parseFloat(deltaMass)
    }
     //recalibrates the data points used for calibration
     let sumSquares = 0
    for(let i=0; i<foundList.length; i++){
        let mass = parseFloat(foundList[i].massExp)
        let expectedError = a*mass*mass+b*mass+c
        let deltaMass = expectedError*mass*1e-6
        foundList[i].massExp = mass + parseFloat(deltaMass)
        foundList[i].ppm = 1e6*(foundList[i].massCalc- foundList[i].massExp)/foundList[i].massCalc
        foundList[i].expectedError = expectedError
        sumSquares += Math.pow(foundList[i].ppm,2)
    }
    let residualError = sumSquares/(foundList.length - 3) //3 is the number of parameters for quadratic
     residualError = Math.sqrt(residualError)
     return {data:data, foundList: foundList, residualError:residualError, equation: [c,b,a]}
}

function calibrate_mobilemean(rawData, foundList){
    console.log(rawData, foundList)
    //first, computes meanpoints from the foundlist
    var meanOver = calibData.meanOver || 2
    var meanNumber = Math.floor(foundList.length / meanOver)
    console.log(meanNumber)
    //sorts the foundlist
    foundList.sort((a,b)=>{return a.massCalc - b.massCalc})
    var means = []
    for(let i=0; i<meanNumber; i++){
        let mean={mass:0,ppm:0}
        for(let j=0; j<meanOver; j++){
            mean.mass += foundList[meanOver*i+j].massCalc
            mean.ppm += foundList[meanOver*i+j].ppm
        }
        mean.mass = mean.mass/meanOver
        mean.ppm = mean.ppm/meanOver
        means.push(mean)
    }
    //does regression for every part of the mass range
    var equations = []
    for(let i=0; i<means.length-1; i++){
        var points = [means[i],means[i+1]]
        var equation = linearRegression_generalized(points, "mass","ppm")
        equations.push(equation)
    }
    console.log(means,equations)
    //makes a copy of data
    let data =[]
    for(let i=0; i<rawData.length; i++){
        data.push(rawData[i].slice())
    }
    //calibrates
    let currentEquationIndex = 0
    for(let i=1; i<data.length; i++){
        let mass = parseFloat(data[i][config.mz])
        //looks if it needs to go the next equation
        if(mass>means[currentEquationIndex+1].mass){
            if(equations[currentEquationIndex+1]){
             currentEquationIndex +=1
            }
        }
        let a= equations[currentEquationIndex].slope
        let b= equations[currentEquationIndex].intercept
        let expectedError = a*mass+b
        let deltaMass = expectedError*mass*1e-6
        data[i][config.mz] = mass + parseFloat(deltaMass)
    }
    //recalibrates the data points used for calibration
    let sumSquares = 0
    currentEquationIndex = 0
    for(let i=0; i<foundList.length; i++){
        let mass = parseFloat(foundList[i].massExp)
        //looks if it needs to go the next equation
        if(mass>means[currentEquationIndex+1].mass){
            if(equations[currentEquationIndex+1]){
             currentEquationIndex +=1
            }
        }
        let a= equations[currentEquationIndex].slope
        let b= equations[currentEquationIndex].intercept
        let expectedError = a*mass+b
        let deltaMass = expectedError*mass*1e-6
        foundList[i].massExp = mass + parseFloat(deltaMass)
        foundList[i].ppm = 1e6*(foundList[i].massCalc- foundList[i].massExp)/foundList[i].massCalc
        foundList[i].expectedError = expectedError
        sumSquares += Math.pow(foundList[i].ppm,2)
    }
    let residualError = sumSquares/(foundList.length - 2) //2 is the number of parameters for linear
    residualError = Math.sqrt(residualError)
    return {data:data, foundList: foundList, residualError:residualError, equations:equations, means:means }
}

function linearRegression_generalized(data,xName, yName){
    var x=[];
    var y=[];
    for(var i = 0; i< data.length; i++){
      x.push(data[i][xName])
      y.push(data[i][yName])
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

/**a function to calibrate FT data by frequency with equation m/z = A/f + B/f^2 */
function calibrateByFrequency(rawData, mzCol, freqCol){
    //makes a copy of data
    let data =[]
    for(let i=1; i<rawData.length; i++){
        data[i] = rawData[i].slice()
    }
    //inverts the frequencies
    let frequencies = []
    for(let i=1; i<rawData.length; i++){
        frequencies[i] = 1/parseFloat(rawData[i][freqCol])
    }
    //finds a and b
    //makes a matrix of the foundList
    let calibArray = []
    for(let i=2500; i<data.length; i++){
        calibArray.push([frequencies[i], parseFloat(data[i][mzCol])])
    }
    let equation = regression.polynomial(calibArray, {order: 2,precision: 8});
    let a = equation.equation[1]
    let b = equation.equation[0]
    let c = equation.equation[2]
    //replaces m/z values with the calculated calibrated values
    for(let i=1; i<data.length; i++){
        data[i][mzCol] = a*frequencies[i] + b*frequencies[i]*frequencies[i] + c
    }
    data[0] = rawData[0]
    return data
}

/********************************************************************* */
/*                    STARTING COMPUTATION                             */
/********************************************************************* */

html_tabCalib.querySelector("button[id='calculate_calib']").addEventListener("click",pressCalibration)
//holds a calibration data, waiting for validation
let tempDataCalib = []
let tempDataCalibrants = []
function pressCalibration(){
    //finds the data from the table
    let calibListNb = tableCalib.querySelector("select[name='calibListChoice']").value
    let calibList = calibData.lists[calibListNb]
    let method = tableCalib.querySelector("select[name='calibAlgo']").value
    let fileNb = tableCalib.querySelector("select[name='fileSelection']").value
    let ppmTol = calibData.ppmTol
    let data = []
    let fileNum = -1
    if(fileNb.includes("file")){
        fileNum = fileNb.slice(5);
        file = files.list[fileNum];
        data = file.data
    }

    let results =[]
    let foundList = []
    if(method == "linear"){
        results = mainCalibFunction(data, calibList, ppmTol, "linear")
    }else if(method == "quad"){
        results = mainCalibFunction(data, calibList, ppmTol, "quadratic")
    }else if(method == "mobile"){
        results = mainCalibFunction(data, calibList, ppmTol, "mobile")
    }else if(method == "multi"){
        results = mainCalibFunction(data, calibList, ppmTol, "multi")
    }
    if(results){
        tempDataCalib = results[0]
        foundList = results[1]
        tempDataCalibrants = results[1]
        tempDataCalibrants.residualError = results[2]
        tempDataCalibrants.equation = results[3]
        tempDataCalibrants.otherData = results[4]
        tempDataCalibrants.method = method
    }
    //logs what has been found
    clearLogBox("calibLog")
    let text = "Calibration done."+foundList.length+" calibrants found <br>"
    if(foundList.length == 0){
        text  += "Calibration aborted"
        return
    }
    for(let i=0; i<foundList.length; i++ ){
        text += "Calibrant : "+foundList[i].formula+" (Theoretical m/z "+foundList[i].massCalc+") ppm error : "+foundList[i].ppm.toFixed(4) + "<br>"
    }
    if(debug){console.log(results)}
    //logs the equation
    if(results[3] && results[3].length ==3){
        text+= "Calibration equation (ax²+bx+c) : a="+results[3][2]+", b="+results[3][1]+", c="+results[3][0]+"<br>"
    }else if(results[3] && results[3].length ==2){
        text+= "Calibration equation (ax+b) : a="+results[3][1]+", b="+results[3][0]+"<br>"
    }
    text += "Residual error: "+results[2]+" ppm<br>"
     text += "The dashed lines on the second chart are multiplied by 3 to have 99% bounds <br>"
    text += "All m/z have been re-computed. Press save if you want to replace data or add this calibrated list as a new file."
    logText("calibLog", text)
    drawCalibEquation()
    drawCalibChart()
}

html_tabCalib.querySelector("button[id='save_calib']").addEventListener("click",saveCalibration)

function saveCalibration(){

    var buttons = [
        {"name":"Add as a file state","function":saveCalibration_replace},
        {"name":"Add as a new file","function":saveCalibration_addNew},
      ]
      var text = "Please specify how you want to save your calibrated data"
      
      handlePopup("saveAttribution",text,buttons,[],[])
}

function saveCalibration_replace(){
    let fileNb = tableCalib.querySelector("select[name='fileSelection']").value
    if(fileNb.includes("file")){
        fileNum = fileNb.slice(5);
        saveCalibState(fileNum);
        files.list[fileNum].addFileState("calibrated",tempDataCalib, true)
        //logs
        var calibTypeSelect = document.querySelector("select[name='calibAlgo']")
        var calibListSelect = document.querySelector("select[name='calibListChoice']")
        var text = "Calibrated data. Equation :"+calibTypeSelect.value+" , List: "+calibListSelect.value
        files.list[fileNum].logs.push(text)
    }else{handlePopup("error","Error: no file selected to replace the data with. Please do not modify 'fie to calibrate' while calibrating.")}
}

function saveCalibration_addNew(){
    //finds the new name
    var newDataClean = [] //duplicate
    let fileNb = tableCalib.querySelector("select[name='fileSelection']").value
    if(fileNb){ fileNb =fileNb.slice(5)}else{return handlePopup("Error","An error occured, no file selected. Saving aborted",[],[],[]);}
    if(!tempDataCalib || !tempDataCalib[0]){return;}
    //duplicate the data
    for(let i=0; i<tempDataCalib.length; i++){
        newDataClean[i]=[]
        for(let j=0; j<tempDataCalib[i].length; j++){
            newDataClean[i][j] = tempDataCalib[i][j]
        }
    }
    var name = files.list[fileNb].name + "_calibrated"
    var adder = 1
    //loops through the names to see if it founds one with the same name
    for(let i=0; i<files.list.length; i++){
        if(files.list[i].name == name+"_"+adder){adder +=1}
        else if(files.list[i].name == name){adder += 1}
    }
    if(adder >1){name += "_"+adder}

    //finds an empty slot for a file
    var chosenSlot = -1;
    for(let j=0; j<files.list.length; j++){
    if(Object.keys(files.list[j].data).length ===0){
        chosenSlot = j;
        files.list[j].data=[""]//fills with random input the data slot so that it will not be considered empty by the loop
        break;
        }
    }
    //if there is no empty slot, create a new slot
    if(chosenSlot == -1){
        createNewFileSlot()
        chosenSlot = files.list.length -1
    }
    saveCalibState(chosenSlot)
    files.list[chosenSlot].name = name
    files.list[chosenSlot].data = newDataClean
    //logs
    var calibTypeSelect = document.querySelector("select[name='calibAlgo']")
    var calibListSelect = document.querySelector("select[name='calibListChoice']")
    var firstText = "Added a new file from a calibration of file named :  "+files.list[fileNb].name
    files.list[chosenSlot].logs.push(firstText)
    var text = "Calibrated data. Equation :"+calibTypeSelect.value+" , List: "+calibListSelect.value
    files.list[chosenSlot].logs.push(text)
    ////
    files.list[chosenSlot].refreshSlot()
    generalFilesUpdate()
}


function saveCalibState(fileNum){
    if(!files.list[fileNum]){return "error";}
    let metaData = files.list[fileNum].metadata.calibration
    metaData.method =  tempDataCalibrants.method
    metaData.equation = tempDataCalibrants.equation
    metaData.residualError = tempDataCalibrants.residualError
    metaData.points = []
    for(let i=0; i<tempDataCalibrants.length; i++){
        let thisCalibrant = [parseFloat(tempDataCalibrants[i].massCalc), tempDataCalibrants[i].ppm, tempDataCalibrants[i].formula]
        metaData.points.push(thisCalibrant)
    }
    return metaData
}


////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////// HANDLING OF INTERFACE //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
let calibData = {}
calibData.lists = [[],[],[]]
calibData.ppmTol = 1
calibData.listsNames = ["Calibration list 1","Calibration list 2","Calibration list 3"]
calibData.searchIsotopeC = false;

//handles theupdates of the calibration menu
let tableCalib = html_tabCalib.querySelector("table[name='mainTableCalib']")
let tableCalib2 = html_tabCalib.querySelector("table[name='secondTableCalib']")
tableCalib.addEventListener("change",readTableCalib)
tableCalib2.addEventListener("change",readTableCalib)


updateShownValuesTableCalib()
function updateShownValuesTableCalib(){
    //resets the names of the calib lists
    let calibSelect = html_tabCalib.querySelector("select[name='calibListChoice']")
    let oldValueCalibSelect = calibSelect.value
    if(!oldValueCalibSelect){oldValueCalibSelect = 0}
    for(i = calibSelect.options.length; i >= 0; i--) {
        calibSelect.remove(i);
     }
    //create the options
    let calibOptions = []
    for(let i=0; i<calibData.lists.length; i++){
        calibOptions[i] = document.createElement("option")
        calibOptions[i].innerHTML = calibData.listsNames[i]
        calibOptions[i].value = i
        calibSelect.appendChild(calibOptions[i])
    }
    calibSelect.value = oldValueCalibSelect

    //for table2
    let carbonCheck = html_tabCalib.querySelector("input[name='calibSearchIsotope']")
    carbonCheck.checked = calibData.searchIsotopeC
}


function readTableCalib(){
    calibData.ppmTol = parseFloat(html_tabCalib.querySelector("input[name='ppmTolCalib']").value)
    calibData.searchIsotopeC = html_tabCalib.querySelector("input[name='calibSearchIsotope']").checked
    updateShownValuesTableCalib()
}


//handles the ADD and REMOVE buttons for calibration lists

tableCalib.querySelector("button[name='newCalibList']").addEventListener("click",function(){
    calibData.lists.push([])
    let newName = "Calibration list "+calibData.lists.length
    calibData.listsNames.push(newName)
    updateShownValuesTableCalib()
})
tableCalib.querySelector("button[name='removeCalibList']").addEventListener("click",function(){
    let currentValue = html_tabCalib.querySelector("select[name='calibListChoice']").value
    calibData.lists.splice((currentValue),1)
    calibData.listsNames.splice((currentValue),1)
    html_tabCalib.querySelector("select[name='calibListChoice']").value = 0
    updateShownValuesTableCalib()
})


///
// handles popup for editing a calibration list
//////// FOR CUSTOMIZING DATABASES//////////////
html_tabCalib.querySelector("button[name='buttonEditCalib']").addEventListener("click",buttonPressedCustomizeCalibList)

function buttonPressedCustomizeCalibList(){
    let databaseChoice = html_tabCalib.querySelector("select[name='calibListChoice']").value
    openPopupCustomizeCalibList(calibData.lists[databaseChoice], calibData.listsNames[databaseChoice], databaseChoice)
}

function openPopupCustomizeCalibList(database, dbName, choiceNb){
    //creates the popup
    var main_popup = document.getElementById("main_popup")
    var popup = document.createElement("div")
    var popup_box = document.createElement("button")
    var popup_close = document.createElement("button")
    
    popup_box.setAttribute("class", "infotext")
    popup_close.setAttribute("class","popuptrueclose")
    popup_close.innerHTML = "X"
    popup_box.appendChild(popup_close)

    var preText = document.createElement("div")
    preText.innerHTML = "Edit the calibration list here <br> Don't forget the charge ! <br> <br>"
    popup_box.appendChild(preText)
    preText.style.maxHeight = "450px"
    preText.style.overflow = "auto"

    var nameInput = document.createElement("input")
    nameInput.setAttribute("name","nameList")
    nameInput.setAttribute("type","text")
    nameInput.style.width= "50%"
    nameInput.style.color= "blue"

    nameInput.setAttribute("value",dbName)
    preText.appendChild(nameInput)
    preText.innerHTML+= "<br><br>"
    
    var htmlTable = document.createElement("table")
    htmlTable.setAttribute("class","popuptable")
    var elLine = []
    var elCells = []
    var elInputs = []
    //creates a table for ratios bounds
    for(let i=0; i<database.length+1; i++){
        elLine[i] = document.createElement("tr")
        elLine[i].setAttribute("name","divlink_"+i)
        elCells[i] = []
        for(let j=0; j<3; j++){
            elCells[i][j] = document.createElement("td")
            elLine[i].appendChild(elCells[i][j])
        }
        elCells[0][0].innerHTML= "Formula"
        elCells[0][1].innerHTML= "Mass"
        elCells[0][2].innerHTML= "DEL"
        htmlTable.appendChild(elLine[i])
    }
    //fills the table with data of elements from the ratios bounds
    for(let i=0; i<database.length; i++){
        elInputs[i]=[]
        elInputs[i][0]= document.createElement("input")
        elInputs[i][0].setAttribute("type","text")
        elInputs[i][0].setAttribute("name","formula")
        elInputs[i][0].style.width = "500px"
        elInputs[i][0].setAttribute("value",database[i].formula)

        elInputs[i][1]= document.createElement("input")
        elInputs[i][1].setAttribute("type","number")
        elInputs[i][1].style.width = "600px"
        elInputs[i][1].setAttribute("name","mass")
        elInputs[i][1].setAttribute("value",database[i].mass)

        elInputs[i][2]= document.createElement("button")
        elInputs[i][2].setAttribute("name","deleteLink_"+i)
        elInputs[i][2].setAttribute("class","smallerpopupbutton")
        elInputs[i][2].addEventListener("click", function(){removeEntryFromCalibList(database, i)})
        elInputs[i][2].innerHTML = "DEL"

        elCells[i+1][0].appendChild(elInputs[i][0])
        elCells[i+1][1].appendChild(elInputs[i][1])
        elCells[i+1][2].appendChild(elInputs[i][2])
    }
    preText.appendChild(htmlTable)
    htmlTable.addEventListener("change", function(){readPeakCalibList(preText, database,choiceNb, true)})
    //adds the + button
    var addButton = document.createElement("button")
    addButton.setAttribute("name","addElButton")
    addButton.setAttribute("class","smallpopupbutton")
    addButton.addEventListener("click", function(){readPeakCalibList(preText, database,choiceNb, false);addPeakToCalibList(database);})
    addButton.innerHTML = "Save and add a peak"
    popup_box.appendChild(addButton)
    var separatorBox =document.createElement("div")
    popup_box.appendChild(separatorBox)
    //adds a button to open a second popup for repetitive units
    var polymerButton = document.createElement("button")
    polymerButton.setAttribute("name","addElButton")
    polymerButton.setAttribute("class","smallpopupbutton")
    polymerButton.addEventListener("click", function(){createPopupPolymerCalibAdder(database, preText, choiceNb);})
    polymerButton.innerHTML = "Add a polymer/ any compound with repeat unit"
    popup_box.appendChild(polymerButton)
    var separatorBox2 =document.createElement("div")
    popup_box.appendChild(separatorBox2)

    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){ readPeakCalibList(preText, database,choiceNb, false);closePopup(this);})
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_editCalib")
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}

/** a function to read and edit a popup table of a database peak */
function readPeakCalibList(popup, database,namePath, updateVisualTable){
    let table = popup.querySelector("table")
    calibData.listsNames[namePath] = popup.querySelector("input[name='nameList']").value
    //loops through tr
    for(let i=1; i<table.childNodes.length; i++){    
        //finds the elements
        let newFormula = table.childNodes[i].querySelector("input[name='formula']").value
        let newMass = table.childNodes[i].querySelector("input[name='mass']").value
        //if it is the formula that is changed, updates the mass
        if(newFormula != database[i-1].formula){
            let newMolecule = new Molecule(newFormula)
            newMass = newMolecule.mass
        }
        database[i-1].formula = newFormula
        database[i-1].mass = newMass
    }
    if(updateVisualTable &&  document.querySelector("button[class='popuptrueclose']")){
        document.querySelector("button[class='popuptrueclose']").click()
        buttonPressedCustomizeCalibList(database)
    }
    updateShownValuesTableCalib()
}
function removeEntryFromCalibList(database, i){
    database.splice(i,1)
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedCustomizeCalibList(database)
}
function addPeakToCalibList(database, i){
    database.push({"formula":"","mass":0})
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedCustomizeCalibList(database)
}

/** computes and add a polymer repeat unit to a calibration list*/
function createPopupPolymerCalibAdder(database, preTextParent, choiceNb){
    //creates the popup
    var main_popup = document.getElementById("main_popup")
    var popup = document.createElement("div")
    var popup_box = document.createElement("button")
    var popup_close = document.createElement("button")
    
    popup_box.setAttribute("class", "infotext")
    popup_close.setAttribute("class","popuptrueclose")
    popup_close.innerHTML = "X"
    popup_box.appendChild(popup_close)

    var preText = document.createElement("div")
    preText.innerHTML = "Add multiple peaks based on a repeat unit<br><br> Base formula : "
    popup_box.appendChild(preText)
    preText.style.maxHeight = "450px"
    preText.style.overflow = "auto"

    var baseFormula = document.createElement("input")
    baseFormula.setAttribute("name","baseFormula")
    baseFormula.setAttribute("type","text")
    baseFormula.style.width= "50%"
    baseFormula.style.color= "black"
    preText.appendChild(baseFormula)
    preText.innerHTML +=" <br><br> Repeat unit formula : "

    var repeatFormula = document.createElement("input")
    repeatFormula.setAttribute("name","repeatFormula")
    repeatFormula.setAttribute("type","text")
    repeatFormula.style.width= "30%"
    repeatFormula.style.color= "black"
    preText.appendChild(repeatFormula)
    preText.innerHTML +=" <br><br> Mass Range : "

    var htmlMin = document.createElement("input")
    htmlMin.setAttribute("name","minMass")
    htmlMin.setAttribute("type","number")
    htmlMin.style.color= "black"
    preText.appendChild(htmlMin)
    preText.innerHTML+="-"
    var htmlMax = document.createElement("input")
    htmlMax.setAttribute("name","maxMass")
    htmlMax.setAttribute("type","number")
    htmlMax.style.color= "black"
    preText.appendChild(htmlMax)
    preText.innerHTML +="<br><br>"


    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){readPolymerAdderPopup(database, preTextParent, choiceNb);closePopup(this);})
    valButton.innerHTML = "ADD TO CALIBRATION LIST"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_editCalibPolymerAdder")
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
    popup.querySelector("input[name='minMass']").value = 0
    popup.querySelector("input[name='maxMass']").value = 1000
}

function readPolymerAdderPopup(database, preText, choiceNb){
    let popup = document.getElementsByName("popup_editCalibPolymerAdder")[0]
    let rawBaseFormula =  popup.querySelector("input[name='baseFormula']").value
    let rawRepeatFormula =  popup.querySelector("input[name='repeatFormula']").value
    let minMass = parseInt(popup.querySelector("input[name='minMass']").value)
    let maxMass = parseInt(popup.querySelector("input[name='maxMass']").value)

    if(!rawBaseFormula || rawBaseFormula == "" || !rawRepeatFormula || rawRepeatFormula == ""){return;}
    let baseFormula = new Molecule (rawBaseFormula)
    let repeatFormula = new Molecule(rawRepeatFormula)

    /* computes how much units need to be added/removed*/
    let baseMass = baseFormula.mass
    let ruMass = repeatFormula.mass
    let minRepeat = 0
    let maxRepeat = 0
    if(ruMass !=0){ 
        minRepeat = (baseMass - minMass)/ruMass
        maxRepeat = (maxMass - baseMass)/ruMass
        /*rounds to integer values*/
        minRepeat = Math.ceil(minRepeat)
        maxRepeat = Math.floor(maxRepeat)
    }
    if(minRepeat<0){minRepeat=0}
    if(maxRepeat<0){maxRepeat=0}

    /*does the remove repeat units part*/
    database.push({"formula":baseFormula.stringify(),"mass":baseFormula.mass})
    let reverseFormula = baseFormula.returnDuplicate()
    for(let i=0; i<minRepeat; i++){
        reverseFormula.removeFormula(repeatFormula)
        if(reverseFormula.isThereNegativeValue(true)){break;} //breaks if we remove too much repeat units and got negative elements
        database.push({"formula":reverseFormula.stringify(),"mass":reverseFormula.mass})
    }
    /*does the add repeat units part*/
    for(let i=0; i<maxRepeat; i++){
        baseFormula.addFormula(repeatFormula)
        if(baseFormula.isThereNegativeValue(true)){break;} 
        database.push({"formula":baseFormula.stringify(),"mass":baseFormula.mass})
    }
    readPeakCalibList(preText, database,choiceNb, true)
}

/** a function to add a peak to a calibration list */
function popupAddToCalibList (formula){
    let newEl  = {}
    newEl.formula = formula
    let molecule = new Molecule(formula)
    newEl.mass = molecule.mass
    let calibListNb = html_tabCalib.querySelector("select[name='calibListChoice']").value
    calibListNb = parseInt(calibListNb)
    if(!calibData.lists[calibListNb]){return ;}
    else{
        calibData.lists[calibListNb].push(newEl)
        handlePopup("info","Formula :"+ formula + " was added to peaklist n°"+calibListNb+" named "+ calibData.listsNames[calibListNb],[],[],[])
    }
  
}

document.getElementsByName("buttonCopyCalib")[0].addEventListener("click", function(){copyClipboardCalibList()})
/** a function when the button copy has to copy a calibration list to the clipboard */
function copyClipboardCalibList(){
    //finds the current calib list
    let calibListNb = html_tabCalib.querySelector("select[name='calibListChoice']").value
    calibListNb = parseInt(calibListNb)
    if(!calibData.lists[calibListNb]){return ;}
    else{   
        let dataLine = ""
        let data = calibData.lists[calibListNb]
        for(let i=0; i<data.length; i++){
            dataLine += data[i].formula + '\t' + data[i].mass
            dataLine += '\n'
         }
        navigator.clipboard.writeText(dataLine)
    }
}

document.getElementsByName("buttonPasteCalib")[0].addEventListener("click", function(){pasteClipboardCalibListPopup()})
/**a function triggered when clicking the "paste" calibration list button */
function pasteClipboardCalibListPopup(){

     //creates the popup
     var main_popup = document.getElementById("main_popup")
     var popup = document.createElement("div")
     var popup_box = document.createElement("button")
     var popup_close = document.createElement("button")
     
     popup_box.setAttribute("class", "infotext")
     popup_close.setAttribute("class","popuptrueclose")
     popup_close.innerHTML = "X"
     popup_box.appendChild(popup_close)
 
     var preText = document.createElement("div")
     preText.innerHTML = "Paste here you calibration data. One peak for each line<br><br>"
     popup_box.appendChild(preText)

     var selectMode = document.createElement("select")
     selectMode.style.color = "black"
     selectMode.setAttribute("name","pasteMethod")
     var option1 = document.createElement("option")
     option1.innerHTML = "Paste formula and mass (TAB separation)"
     option1.value = "both"
     var option2 = document.createElement("option")
     option2.innerHTML = "Paste formula only"
     option2.value = "formula"
     var option3 = document.createElement("option")
     option3.innerHTML = "Paste mass only"
     option3.value = "mass"
     selectMode.appendChild(option1)
     selectMode.appendChild(option2)
     selectMode.appendChild(option3)
     popup_box.appendChild(selectMode)
     popup_box.innerHTML += "<br><br>"

     var textArea = document.createElement("textarea")
     textArea.setAttribute("placeholder","Paste data here")
     textArea.style.width="500px";
     textArea.style.height="500px";
     popup_box.appendChild(textArea)
     popup_box.innerHTML+="<br>"

     //adds the validate button
     var valButton = document.createElement("button")
     valButton.setAttribute("name","validateLinksButton")
     valButton.setAttribute("class","popupclose")
     valButton.addEventListener("click", function(){readPasteCalibPopup();closePopup(this);})
     valButton.innerHTML = "ADD TO CURRENT CALIBRATION LIST"
     popup_box.appendChild(valButton)
     //finalizes the popup
     popup.setAttribute("class","popup")
     popup.setAttribute("name", "popup_calib")
     popup.style.display ="block"
     popup_box.style.maxHeight = "90%"
     popup_box.style.overflow = "scroll";
     popup.appendChild(popup_box)
     main_popup.appendChild(popup)
     popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}

function readPasteCalibPopup(){
    //finds the current calib list
     let calibListNb = html_tabCalib.querySelector("select[name='calibListChoice']").value
     calibListNb = parseInt(calibListNb)
     //finds popupData
    let popup = document.getElementsByName("popup_calib")[0]
    let pasteMethod = popup.querySelector("select[name='pasteMethod']").value
    let pastedData  = popup.querySelector("textarea").value

    let parsedData = []
    let lbreak = pastedData.split(/\r?\n/);
    lbreak.forEach(res => {
        parsedData.push(res.split("\t"));
    });
    
    let finalData = []
    if(pasteMethod == "both"){
        for(let i=0; i<parsedData.length; i++){
            let thisLine = {}
            thisLine.formula = parsedData[i][0]
            thisLine.mass = parsedData[i][1]
            finalData.push(thisLine)
        }
    }else if(pasteMethod == "formula"){
        for(let i=0; i<parsedData.length; i++){
            let thisLine = {}
            thisLine.formula = parsedData[i][0] || parsedData[i]
            let formula = new ChemFormula(thisLine.formula)
            thisLine.mass = formula.mass
            finalData.push(thisLine)
        }
    }else if(pasteMethod == "mass"){
        for(let i=0; i<parsedData.length; i++){
            let thisLine = {}
            thisLine.formula = parsedData[i][0] || parsedData[i]
            thisLine.mass = parsedData[i][0] || parsedData[i]
            finalData.push(thisLine)
        }
    }

    //push this to the current calib list
    if(!calibData.lists[calibListNb]){calibData.lists[calibListNb] = []}
    for(let i=0; i<finalData.length; i++){
        calibData.lists[calibListNb].push({"formula":finalData[i].formula,"mass":finalData[i].mass})
    }

}

/** add functionality to the advanced options for calib equation */
document.getElementById("calibAdvancedButton").addEventListener("click",()=>{
    let method = tableCalib.querySelector("select[name='calibAlgo']").value
    if(method == "mobile"){
        let popup = new Popup("calibAdvanced","Advanced calibration parameters")
        let html = popup.popup_box.querySelector("div[name='popup_content']")
        let wrapper = document.createElement("div")
        wrapper.setAttribute("name",'wrapper')
        html.appendChild(wrapper)

        let line1 = document.createElement("div")
        line1.textContent = "Mean over x data points : "
        let input1 = menuCreateInput("number","meanOver",calibData.meanOver || 2)
        line1.appendChild(input1)
        wrapper.appendChild(line1)
        popup.valButton.addEventListener("click",()=>{readCalibAdvancedPopup(popup)})
    }else if(method=="multi"){
        let popup = new Popup("calibAdvanced","Advanced calibration parameters")
        let html = popup.popup_box.querySelector("div[name='popup_content']")
        let wrapper = document.createElement("div")
        wrapper.setAttribute("name",'wrapper')
        html.appendChild(wrapper)

        let line1 = document.createElement("div")
        line1.textContent = "Number of calibrants in each calibration equation : "
        let input1 = menuCreateInput("number","meanOver",calibData.meanOver || 2)
        line1.appendChild(input1)
        //should add: extrapolation(boolean), method(linear or quadratic), overextend 
        let line2 = document.createElement("div")
        line2.textContent = "Type of calibration curve :"
        let equOptions = [{name:"Linear",value:"linear"},{name:"Quadratic",value:"quadratic"}]
        let select1 = menuCreateInput("select","multiEquation",calibData.multiEquation ||"linear", equOptions)
        select1.style.color = "black"
        line2.appendChild(select1)
        let line3 = document.createElement("div")
        line3.textContent = "Extend every calibration curve before&after its min/max values, by m/z :"
        let input2 = menuCreateInput("number","overshoot",calibData.overshoot || 0)
        line3.appendChild(input2)
        let line4 = document.createElement("div")
        line4.textContent = "How many equations overextend before&after the calibration domain : "
        let input3 = menuCreateInput("number","equationOver",calibData.equationOver || 0)
        line4.appendChild(input3)
        ///
        wrapper.appendChild(line1)
        wrapper.appendChild(line2)
        wrapper.appendChild(line3)
        wrapper.appendChild(line4)
        popup.valButton.addEventListener("click",()=>{readCalibAdvancedPopup(popup)})
    }else{
        let popup = new Popup("calibAdvanced","no Advanced options for this calibration equation")
    }
})

function readCalibAdvancedPopup(popup){
    let meanOver = popup.popup_box.querySelector("input[name='meanOver']").value
    calibData.meanOver = meanOver
    let multiEquation = popup.popup_box.querySelector("select[name='multiEquation']").value
    calibData.multiEquation = multiEquation
    let overshoot = popup.popup_box.querySelector("input[name='overshoot']").value
    calibData.overshoot = parseFloat(overshoot)
    let equationOver = popup.popup_box.querySelector("input[name='equationOver']").value
    calibData.equationOver = parseFloat(equationOver)
}

function drawCalibChart(){
    //finds the data
    let fileNb = tableCalib.querySelector("select[name='fileSelection']").value
    let data = []
    let fileNum = -1
    if(fileNb.includes("file")){
        fileNum = fileNb.slice(5);
        let file = files.list[fileNum];
        data = file.data
        data.sort((a,b)=>a[config.mz]-b[config.mz])
    }
    if(fileNum == -1){return}

    let space = document.getElementById("calibCanvas")
    let oldSvg = space.querySelector("#calibChart")
    if(oldSvg){oldSvg.remove()}
    let calibChart = {}
    calibChart.config = JSON.parse(JSON.stringify(config))
    let cfg ={}
    cfg.xmin = parseFloat(data[1][config.mz])
    cfg.xmax =  parseFloat(data[data.length-1][config.mz])
    cfg.ymin = -calibData.ppmTol
    cfg.ymax = calibData.ppmTol
    calibChart.scales=[];
    calibChart.scales[0] = d3.scaleLinear().domain([cfg.xmin,cfg.xmax]).range([0,  calibChart.config.width]);
    calibChart.scales[1]= d3.scaleLinear().domain([cfg.ymin, cfg.ymax]).range([ calibChart.config.height, 0]);
    calibChart.svgSpace = appendCell(space,"calibChart",null,  calibChart.config)
    calibChart.clipPath = appendClipPath(calibChart.svgSpace, "clipCalibChart",  calibChart.config)
    appendLine(calibChart.svgSpace, 4, "grey")
    //creating axes
    calibChart.axes=[];
    calibChart.axes[0]= appendAxis_x(calibChart.svgSpace, calibChart.scales[0],  calibChart.config.height, cfg.xmax,  calibChart.config)
    calibChart.axes[1]= appendAxis_y(calibChart.svgSpace, calibChart.scales[1],  cfg.ymax,  calibChart.config)
    //creates labels
    let axisOptions = {}
    if(calibChart.config.endAxis){axisOptions.mode = "endAxis"}
    calibChart.axesLabels=[];
    calibChart.axesLabels[0]= appendAxisLabel_x(calibChart.svgSpace, "m/z",axisOptions,  calibChart.config);
    calibChart.axesLabels[1]= appendAxisLabel_y(calibChart.svgSpace, "ppm error",axisOptions,  calibChart.config);
    //creates grids
    if(!calibChart.config.noGrid){
        calibChart.grids = [];
        calibChart.grids[0] = appendPlotGrid(calibChart.svgSpace, calibChart.scales[0],calibChart.config.axisLines, "bottom", calibChart.config);
        calibChart.grids[1] = appendPlotGrid(calibChart.svgSpace, calibChart.scales[1],calibChart.config.axisLines,"side", calibChart.config);
    }
    //draws data
    calibChart.drawnData = [] // will be an array of datasets drawn
    let calibrants = tempDataCalibrants
    calibChart.drawnData = calibChart.svgSpace.append('g').attr("id","calibrantPoint")
        .selectAll("circle")
        .data(calibrants)
        .enter()
        .append("circle")
        .attr("cx", (d) => {return calibChart.scales[0](d.massExp); } ) 
        .attr("cy",  (d) =>{ return calibChart.scales[1](d.ppm); } ) 
        .attr("r",  3)
        .attr("clip-path", "url(#clipCalibChart)")
        .style("fill", "black")
        .style("opacity",1)
    //draws the regression line
    // let dataReg = []
    // let equation = tempDataCalibrants.equation
    // console.log(equation)
    // let step = (cfg.xmax - cfg.xmin)/100
    // for(let i=0; i<100; i++){
    //     let x = cfg.xmin + i*step
    //     let y = equation[0] + equation[1]*x
    //     if(equation[2]){y += equation[2]*x*x}
    //     dataReg.push({x:x,y:y})
    // }
    // console.log(dataReg)

    //draws the bounds
    let residualError = tempDataCalibrants.residualError
    let normalCoeff = 3
    let bounds = []
    bounds[0] = [{x:cfg.xmin,y:normalCoeff*residualError},{x:cfg.xmax,y:normalCoeff*residualError}]
    bounds[1] = [{x:cfg.xmin,y:-normalCoeff*residualError},{x:cfg.xmax,y:-normalCoeff*residualError}]
    //draws the residual error (99%) lines
    calibChart.line =calibChart.svgSpace.append("path").attr("id","boundCalib0")
    .datum(bounds[0])
    .attr('stroke',"orange")
    .attr('stroke-width',2)
    .style("stroke-dasharray",5)
    .attr("fill","none")
    .attr("clip-path", "url(#clipCalibChart)")
    .attr("d", d3.line()
    .x((d)=>{ return calibChart.scales[0](d.x); })
    .y((d)=>{ return calibChart.scales[1](d.y); })
    )

    calibChart.line2 =calibChart.svgSpace.append("path").attr("id","boundCalib1")
    .datum(bounds[1])
    .attr('stroke',"orange")
    .attr('stroke-width',2)
    .style("stroke-dasharray",5)
    .attr("fill","none")
    .attr("clip-path", "url(#clipCalibChart)")
    .attr("d", d3.line()
    .x((d)=>{ return calibChart.scales[0](d.x); })
    .y((d)=>{ return calibChart.scales[1](d.y); })
    )

    //if needed,draws horizontal lines for each calibrant for individual errors
    if(tempDataCalibrants.otherData && tempDataCalibrants.otherData.name == "multi"){
        for(let i=0; i<calibrants.length; i++){
            let stdDev = calibrants[i].stdDev
            let ppmError = calibrants[i].ppm
            let mass = calibrants[i].massExp
            //the standard deviation is in m/z. Has to be converted in ppm
            stdDev = 1e6*stdDev/mass
            if(debug){console.log(stdDev, ppmError, mass)}
            let minBound = ppmError - normalCoeff*Math.abs(stdDev)
            let maxBound = ppmError + normalCoeff*Math.abs(stdDev)
            let point1 = {x:mass, y:minBound}
            let point2 = {x:mass, y:maxBound}
            let points = [point1, point2]
            calibChart.svgSpace.append("path").attr("id","boundCalibrant")
                .datum(points)
                .attr('stroke',"grey")
                .attr("fill","none")
                .attr("clip-path", "url(#clipCalibChart)")
                .attr("d", d3.line()
                .x((d)=>{ return calibChart.scales[0](d.x); })
                .y((d)=>{ return calibChart.scales[1](d.y); })
                )
        }
    }


}

function drawCalibEquation(){
    //finds the data
    let fileNb = tableCalib.querySelector("select[name='fileSelection']").value
    let data = []
    let calibrants = tempDataCalibrants
    let fileNum = -1
    if(fileNb.includes("file")){
        fileNum = fileNb.slice(5);
        let file = files.list[fileNum];
        data = file.data
        data.sort((a,b)=>a[config.mz]-b[config.mz])
    }
    if(fileNum == -1){return}

    let space = document.getElementById("calibCanvas")
    let oldSvg = space.querySelector("#calibChart2")
    if(oldSvg){oldSvg.remove()}
    let calibChart = {}
    calibChart.config = JSON.parse(JSON.stringify(config))
    let cfg ={}
    cfg.xmin = parseFloat(data[1][config.mz])
    cfg.xmax =  parseFloat(data[data.length-1][config.mz])
    cfg.ymin = -calibData.ppmTol
    cfg.ymax = calibData.ppmTol
    calibChart.scales=[];
    calibChart.scales[0] = d3.scaleLinear().domain([cfg.xmin,cfg.xmax]).range([0,  calibChart.config.width]);
    calibChart.scales[1]= d3.scaleLinear().domain([cfg.ymin, cfg.ymax]).range([ calibChart.config.height, 0]);
    calibChart.svgSpace = appendCell(space,"calibChart2",null,  calibChart.config)
    calibChart.clipPath = appendClipPath(calibChart.svgSpace, "clipCalibChart2",  calibChart.config)
    appendLine(calibChart.svgSpace, 4, "grey")
    //creating axes
    calibChart.axes=[];
    calibChart.axes[0]= appendAxis_x(calibChart.svgSpace, calibChart.scales[0],  calibChart.config.height, cfg.xmax,  calibChart.config)
    calibChart.axes[1]= appendAxis_y(calibChart.svgSpace, calibChart.scales[1],  cfg.ymax,  calibChart.config)
    //creates labels
    let axisOptions = {}
    if(calibChart.config.endAxis){axisOptions.mode = "endAxis"}
    calibChart.axesLabels=[];
    calibChart.axesLabels[0]= appendAxisLabel_x(calibChart.svgSpace, "m/z",axisOptions,  calibChart.config);
    calibChart.axesLabels[1]= appendAxisLabel_y(calibChart.svgSpace, "deviation (ppm)",axisOptions,  calibChart.config);
    //creates grids
    if(!calibChart.config.noGrid){
        calibChart.grids = [];
        calibChart.grids[0] = appendPlotGrid(calibChart.svgSpace, calibChart.scales[0],calibChart.config.axisLines, "bottom", calibChart.config);
        calibChart.grids[1] = appendPlotGrid(calibChart.svgSpace, calibChart.scales[1],calibChart.config.axisLines,"side", calibChart.config);
    }
    //draws data
    calibChart.drawnData = [] // will be an array of datasets drawn
    calibChart.drawnData = calibChart.svgSpace.append('g').attr("id","calibrantPoint")
        .selectAll("circle")
        .data(calibrants)
        .enter()
        .append("circle")
        .attr("cx", (d) => {return calibChart.scales[0](d.massExp); } ) 
        .attr("cy",  (d) =>{ return calibChart.scales[1](d.ppm+d.expectedError); } ) 
        .attr("r",  3)
        .attr("clip-path", "url(#clipCalibChart2)")
        .style("fill", "black")
        .style("opacity",1)
    // draws the regression line
    let dataReg = []
    if(tempDataCalibrants.otherData && tempDataCalibrants.otherData.name == "means"){
        //this is for mobile means
        let means = tempDataCalibrants.otherData.means
        let equation_f = tempDataCalibrants.equation[0]
        let equ_number = tempDataCalibrants.equation.length
        let equation_l = tempDataCalibrants.equation[equ_number-1]
        //computes a point for the first equation
        let ymin = equation_f.slope*cfg.xmin + equation_f.intercept
        dataReg.push({x:cfg.xmin,y:ymin})
        //pushes all other points
        for(let i=0; i<means.length; i++){
            dataReg.push({x:means[i].mass, y:means[i].ppm})
        }
        //computes a last point
        let ymax = equation_l.slope*cfg.xmax + equation_l.intercept
        dataReg.push({x:cfg.xmax,y:ymax})
        console.log(dataReg)
    }else if(tempDataCalibrants.otherData && tempDataCalibrants.otherData.name == "multi"){
        //this is for multi regression lines
        let subGroups = tempDataCalibrants.otherData.subGroups
        let linesData = []
        let method = calibData.multiEquation || "linear"

        if(method == "linear"){
            for(let i=0; i<subGroups.length; i++){ //for each equation
                let equation = subGroups[i].equation
                let xmin = subGroups[i].min
                let xmax = subGroups[i].max
                let ymin = equation.intercept + equation.slope*xmin
                let ymax = equation.intercept + equation.slope*xmax
                let points = []
                points.push({x:xmin,y:ymin})
                points.push({x:xmax,y:ymax})
                linesData.push(points)
            }
        }else if(method=="quadratic"){
            for(let i=0; i<subGroups.length; i++){ //for each equation
                let equation = subGroups[i].equation
                if(equation.equation){equation = equation.equation}
                console.log(equation)
                let xmin = subGroups[i].min
                let xmax = subGroups[i].max
                let points = []
                let step = (xmax - xmin)/100
                for(let i=0; i<100; i++){
                    let x = xmin + i*step
                    let y = equation[0]*x*x + equation[1]*x + equation[2]
                    points.push({x:x,y:y})
                }
                linesData.push(points)
            }
        }
        console.log(linesData)
        for(let i=0; i<linesData.length; i++){
            calibChart.svgSpace.append("path").attr("id","calibEquation")
            .datum(linesData[i])
            .attr('stroke',"red")
            .attr('stroke-width',1)
            .attr("fill","none")
            .attr("clip-path", "url(#clipCalibChart2)")
            .attr("d", d3.line()
            .x((d)=>{ return calibChart.scales[0](d.x || d.mass); })
            .y((d)=>{ return calibChart.scales[1](d.y || d.ppm); }))
        }
    }else{
        //this is for a regular equation
        let equation = tempDataCalibrants.equation
        let step = (cfg.xmax - cfg.xmin)/100
        for(let i=0; i<100; i++){
            let x = cfg.xmin + i*step
            let y = equation[0] + equation[1]*x
            if(equation[2]){y += equation[2]*x*x}
            dataReg.push({x:x,y:y})
        }
    }
    calibChart.line =calibChart.svgSpace.append("path").attr("id","calibEquation")
    .datum(dataReg)
    .attr('stroke',"red")
    .attr('stroke-width',1)
    .attr("fill","none")
    .attr("clip-path", "url(#clipCalibChart2)")
    .attr("d", d3.line()
    .x((d)=>{ return calibChart.scales[0](d.x || d.mass); })
    .y((d)=>{ return calibChart.scales[1](d.y || d.ppm); })
    )

}



/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
////// EXPERIMENTAL MULTICALIBRATION METHOD /////////


function calibrate_multi(rawData, foundList){
    console.log(rawData, foundList)
    //first, computes meanpoints from the foundlist
    var meanOver = parseInt(calibData.meanOver) || 2
    var meanNumber = Math.floor(foundList.length / meanOver)
    console.log(meanNumber)
    //sorts the foundlist
    foundList.sort((a,b)=>{return a.massCalc - b.massCalc})
    //create subgroups of calibrants for each calibration line
    var subGroups = []
    for(let i=0; i<foundList.length; i++){
        let subGroup={points:[]}
        //checks if there is enough points to create a group. If not, stops
        if(!foundList[i+meanOver-1]){break;}
        subGroup.min = foundList[i].massCalc 
        subGroup.max = foundList[i+meanOver-1].massCalc
        if(calibData.overshoot){
            subGroup.min -= calibData.overshoot
            subGroup.max += calibData.overshoot
        }
        for(let j=0; j<meanOver; j++){
            subGroup.points.push(foundList[i+j])
        }
        let method = calibData.multiEquation || "linear"
        if(method == "linear"){
            subGroup.equation = linearRegression_generalized(subGroup.points, "massExp","ppm")
        }else{
            let calibArray = []
            for(let i=0; i<subGroup.points.length; i++){
                calibArray.push([subGroup.points[i].massExp, subGroup.points[i].ppm])
            }
            subGroup.equation = regression.polynomial(calibArray, {order: 2,precision: 8});
        }
        
        subGroups.push(subGroup)
    }
    console.log(subGroups)
    //makes a copy of data
    let dataMin = rawData[1][config.mz]
    let dataMax = rawData[1][config.mz]
    let data =[]
    for(let i=0; i<rawData.length; i++){
        data.push(rawData[i].slice())
        if(rawData[i][config.mz]>dataMax){dataMax = rawData[i][config.mz]}
        if(rawData[i][config.mz]<dataMin){dataMin = rawData[i][config.mz]}
    }
    //overextends the first and last calibration curves 
    if(calibData.equationOver){
        let lastGroupIndex = subGroups.length -1
        for(let i=0; i<calibData.equationOver; i++){
            subGroups[i].min = dataMin
            subGroups[lastGroupIndex-i].max = dataMax
        }
    }
    //calibrates
    for(let i=1; i<data.length; i++){
        let mass = parseFloat(data[i][config.mz])
        let calcMasses = []
        //calculates a mass for every calibration equation that fits in the range
        for(let i=0; i<subGroups.length; i++){
            if(mass>subGroups[i].max){continue;}//skips calibration eq before it
            if(mass<subGroups[i].min){break;}//stops once we got over the mass
            let res = exp_recalculatemass(mass,subGroups[i].equation)
            calcMasses.push(res.mass)
        }
        //calculates mean mass and standard deviation
        if(calcMasses.length==0){continue}
        let meanMass =  parseFloat(calcMasses.reduce((a, b) => a + b, 0) / calcMasses.length);
        let variance = parseFloat(calcMasses.reduce((a, b) => a + (b - meanMass) ** 2, 0) / calcMasses.length);
        let stdDev = Math.sqrt(variance)
        data[i][config.mz] = meanMass
        data[i].stdDev = stdDev
    }
    //recalibrates the data points used for calibration
    let sumSquares = 0
    for(let i=0; i<foundList.length; i++){
        let mass = parseFloat(foundList[i].massExp)
        let calcMasses = []
        let calcErrors = []
        //calculates a mass for every calibration equation that fits in the range
        for(let i=0; i<subGroups.length; i++){
            if(mass>subGroups[i].max){continue;}//skips calibration eq before it
            if(mass<subGroups[i].min){break;}//stops once we got over the mass
            let res = exp_recalculatemass(mass,subGroups[i].equation)
            calcMasses.push(res.mass)
            calcErrors.push(res.expectedError)
        }
        //calculates mean mass and standard deviation
        if(calcMasses.length==0){continue}
        let meanMass =  parseFloat(calcMasses.reduce((a, b) => a + b, 0) / calcMasses.length);
        let variance = parseFloat(calcMasses.reduce((a, b) => a + (b - meanMass) ** 2, 0) / calcMasses.length);
        let stdDev = Math.sqrt(variance)
        let meanError = parseFloat(calcErrors.reduce((a, b) => a + b, 0) / calcErrors.length);
        foundList[i].massExp = meanMass
        foundList[i].ppm = 1e6*(foundList[i].massCalc- foundList[i].massExp)/foundList[i].massCalc
        foundList[i].stdDev = stdDev
        foundList[i].expectedError = meanError

        sumSquares += Math.pow(foundList[i].ppm,2)
    }
    let residualError = sumSquares/(foundList.length - 2) //2 is the number of parameters for linear
    residualError = Math.sqrt(residualError)
    return {data:data, foundList: foundList, residualError:residualError, subGroups:subGroups}
}

/**returns an object with properties "mass", "originalMass","expectedError" */
function exp_recalculatemass(mass,equation){
    //Dirty but for tests on calibration it works
    if(equation.equation){equation = equation.equation}
    let method = "linear"
    let deltaMass = 0
    let expectedError = 0
    let a = 0
    let b = 0
    let c = 0
    if(equation.length && equation.length >0){
        a = equation[0]
        b = equation[1]
        if(equation.length >2){
            c = equation[2]
            method = "quadratic"
        }
    }else{
        a = equation.slope
        b = equation.intercept
    }
    if(method == "linear"){
        expectedError = a*mass+b
        deltaMass = expectedError*mass*1e-6
    }else if(method == "quadratic"){
        expectedError = a*mass*mass+b*mass+c
        deltaMass = expectedError*mass*1e-6
    }
    
    return {mass:mass+deltaMass, originalMass:mass, expectedError: expectedError}
}