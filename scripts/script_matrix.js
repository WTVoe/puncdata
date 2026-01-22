var matrixData = []; // this variable holds the matrix
var matrixFilesColumns = []; // holds the values of the columns containing the intensities for the different files

/********************************************************************* */
/*                    HANDLING OF MENUS                                */
/********************************************************************* */

//adding to the table all the files needed
function addFilesToMatrixTable(){
    //deletes the old table and creates a new one
    d3.select("#matrix_file_table").remove()
    var body =  document.querySelector("#matrix_file_selection");
    var newTable = document.createElement("table");
    newTable.id = "matrix_file_table";
    body.appendChild(newTable);

    //appends all the options
    for(let i=0; i<files.list.length; i++){
        var table = document.getElementById("matrix_file_table");
        var line= document.createElement("tr");
        line.id = "matrix_table_line_"+i;
        var cell_name = document.createElement("td");
        cell_name.textContent = files.list[i].name
        var cell_button = document.createElement("input")
        cell_button.type = "checkbox"
        cell_button.id = "matrix_table_check_"+i;

        line.appendChild(cell_name);
        line.appendChild(cell_button);
        table.appendChild(line);
    }
}
//listens to the clicking of the select/unselect all for the file selection checkboxes
document.getElementById("matrix_check_all").addEventListener("click",function(){
    let value = document.getElementById("matrix_check_all").checked
    for(let i=0; i<files.list.length; i++){
        document.getElementById("matrix_table_check_"+i).checked = value
    }
});

//listens to the clicking of the calculs button
document.getElementById("calculate_matrix").addEventListener("click",function(){
    matrixData = calculateMatrix();
    indexFiles();
});

//listens for the change of matrix building type and hide/shows the number option
document.getElementById("matrix_calculus").addEventListener("change",function(){
    var calculusMethod = document.getElementById("matrix_calculus").value
    var valueDiv = document.getElementById("matrix_calculus_value")
    if(calculusMethod == "all"){
        valueDiv.style.display = "none";
    }else{
        valueDiv.style.display = null;
    }
});


//listens for the change of type of data comparaison and hides/shows the ppm option
document.getElementById("matrix_comparaison_data").addEventListener("change",function(){
    var comparaison = document.getElementById("matrix_comparaison_data").value
    var ppmDiv = document.getElementById("matrix_ppm_tolerance_div")
    if(comparaison == "formula"){
        ppmDiv.style.display = "none";
    }else if(comparaison == "mass"){
        ppmDiv.style.display = null;
    }
});
//listens for the change of type of data comparaison for the blank 
document.getElementById("matrix_blank_comparaison_data").addEventListener("change",function(){
    var comparaison = document.getElementById("matrix_blank_comparaison_data").value
    var ppmDiv = document.getElementById("matrix_blank_ppm_tolerance_div")
    if(comparaison == "formula"){
        ppmDiv.style.display = "none";
    }else if(comparaison == "mass"){
        ppmDiv.style.display = null;
    }
});

//listens for the change of missing value filling to make the option of custom value appear
document.getElementById("missing_values").addEventListener("change",function(){
    var missingValue = document.getElementById("missing_values").value
    var customVal = document.getElementById("matrix_custom_missing_value")
    if(missingValue == "custom"){
        customVal.style.display = null;
    }else{
        customVal.style.display = "none";
    }
    console.log(missingValue, customVal)

});

/********************************************************************* */
/*                         CALCULATION                                 */
/********************************************************************* */

var matrixMissingValues = ""

/**
 * Does the heavy lifting for all the matrix calculation: gathers the parameters, searches which files are selected and then computes the matrix
 * @returns  the matrix
 */
function calculateMatrix(){

    //first step: gather the data of all the parameters
    var calculusMethod = document.getElementById("matrix_calculus").value;
    var calculusMethod_value = document.getElementById("matrix_calculus_value").value;
    var matrixFormat = document.getElementById("matrix_format").value;
    var intensityMethod = document.getElementById("matrix_intensity").value;
    var comparaisonMethod = document.getElementById("matrix_comparaison_data").value;
    var ppmTolerance = document.getElementById("matrix_ppm_tolerance").value;
    matrixMissingValues = document.getElementById("missing_values").value;

    var fileButton = null;
    var selectedFiles = []; //contains a list of the files number selected

    //warns the user if the file comparaison is made on chemical formula and not on ion formula
    if(document.querySelector("p[name='warningFormula']")){
        document.querySelector("p[name='warningFormula']").remove()
    }
    if(comparaisonMethod == "formula" && (columnNames[config.formulatext] == "Formula"|| columnNames[config.formulatext].includes("chemical"))){
        document.getElementById('matrix_infos_parent').innerHTML += "<p name='warningFormula' style='color:red;'>Warning ! you may be comparing files on a chemical formula and not an ion formula. Errors will be induced if different adducts exist for this formula </p>"
    }

    var j=0 //counts the number of selected files
    //gather which files are selected in a loop
    for(let i=0; i<files.list.length; i++){
        fileButton = document.getElementById("matrix_table_check_"+i)
        if(fileButton && fileButton.checked){
            selectedFiles[j] = i;
            j += 1
        }
    }

    //compare the data one file at a time
    var matrix = [];

    //creates the title line of the matrix
    matrix.push(files.list[selectedFiles[0]].data[0].slice());
    var baseCol = matrix[0].length; //counts the number of columns in the original file
    //adds the new columns of intensity names
    for(let i=0; i<selectedFiles.length; i++){
        var newCol_number = baseCol + i;
        var newCol_name = "I_"+files.list[selectedFiles[i]].name;
        matrix[0].push(newCol_name);
    }
    //checks if all files have the same number of columns
    for(let i=0; i<selectedFiles.length; i++){
        if(files.list[selectedFiles[i]] && files.list[selectedFiles[i]].data){
            if(files.list[selectedFiles[i]].data[0]){
                if(files.list[selectedFiles[i]].data[0].length != files.list[selectedFiles[0]].data[0].length){
                    alertPopup("warning ! trying to fuse files that do not have the same number of columns")
                }
            }
        }
    }

    var new_matrix = []; //holds the new unique data to a dataset
    var masses =  []; //holds the masses for every data line so that they can be averaged out at the end
    var intensityCol = 0;
    for(let i=0; i<selectedFiles.length; i++){
        if(debug){console.log("adding file n°"+selectedFiles[i]+" to the matrix named: "+files.list[selectedFiles[i]].name)}
        new_matrix=[]; //resets the new data to add
        fileNumber = parseInt(selectedFiles[i]);
        if(!files.list[fileNumber].data || !files.list[fileNumber].data[0]){return alertPopup("there is an empty file selected ("+files.list[fileNumber].name+"). Please remove it from your selection")}
        intensityCol = parseInt(files.list[fileNumber].data[0].length + i);
        if(comparaisonMethod=="formula"){new_matrix = addToMatrix(intensityCol,matrix,files.list[fileNumber].data,config.formulatext, masses)}
        else if(comparaisonMethod=="mass"){new_matrix = addToMatrix_ppm(intensityCol,matrix,files.list[fileNumber].data,config.mz, parseFloat(ppmTolerance), masses)}
        //adds the new data to the matrix
        matrix = matrix.concat(new_matrix)
    }
    if(debug){console.log(matrix)}

 
    //finds what should be the undefined value
    //in this case it is suppose that the least intense peak is at S/N=3. By dividing S/3 we find N, and fill all undefined with noise value
    let thirdOfIntensity = false
    let noiseValue = 0 //used when computing mean intensity, to know when to consider a peak present
    if(matrixMissingValues=="third"){
        thirdOfIntensity = true
        matrixMissingValues = [];
        //loop for each sample in the specific column
        for(let i=baseCol; i<matrix[0].length; i++){
            //loop through the sample to find the smallest intensity
            let min = matrix[1][i];
            if(isNaN(min)){min = 1e10} //failsafe for random cases where min isn't correct
            for(let j=1; j<matrix.length; j++){
                if(min > matrix[j][i]){ min = matrix[j][i]}
            }
            let noise = min/3
            if(noise>noiseValue){noiseValue = noise}
            matrixMissingValues.push(noise)
            //loops again through the sample to fill the empty spaces with noise
            for(let j=1; j<matrix.length; j++){
                if(matrix[j][i] == undefined){matrix[j][i] = noise}
            }
        }
    }
    //search for custom filling values
    if(matrixMissingValues=="custom"){
        matrixMissingValues = document.getElementById("matrix_custom_missing_input").value
        noiseValue = matrixMissingValues
    }
    //fills undefined values with 0 or defined value if needed
    if(!isNaN(matrixMissingValues)){
        for(let i=1;i<matrix.length;i++){
            for(let j=baseCol-1; j<matrix[0].length; j++){
                if(matrix[i][j] == undefined){matrix [i][j]= matrixMissingValues}
            }
        }
    }

    //recalculates/averages out the masses
    for(let i=1;i<matrix.length;i++){
        var sumMass = 0;
        var newMass = 0;
        for(let j=0; j<masses[i-1].length; j++){
            sumMass += parseFloat(masses[i-1][j])
        }
        newMass = sumMass/masses[i-1].length;
        matrix[i][config.mz] = newMass;
    }

    //computes the intensity
    if(intensityMethod == "mean"){
        var totalIntensity = 0; // will be used to sum the intensities
        var numberOfFiles = 0; // counts the number of files in which the peak is present
        var newIntensity = 0; //will be calculated laters
        //for each peak
        for(let i=1;i<matrix.length;i++){
            totalIntensity=0;
            numberOfFiles =0;
            //loops through each intensity
            for(let j=baseCol; j<matrix[0].length; j++){
                //if the peak is present
                if(matrix[i][j] > noiseValue){ 
                    totalIntensity += parseFloat(matrix[i][j]);
                    numberOfFiles = numberOfFiles + 1;
                }
            }
            //now calculates the new intensity
            newIntensity = totalIntensity/numberOfFiles
            if(isNaN(newIntensity)){
                console.warn("warning ! a given intensity was not a number for peak: "+matrix[i])
                continue;
            }
            matrix[i][config.intensity] = newIntensity
        }
    }else if(intensityMethod == "median"){
        for(let i=1;i<matrix.length;i++){
            let values = []
            let numberOfFiles = 0
            for(let j=baseCol; j<matrix[0].length; j++){
                //if the peak is present
                if(matrix[i][j] > noiseValue){ 
                    values.push(parseFloat(matrix[i][j]))
                    numberOfFiles = numberOfFiles + 1;
                }
            }
             //now calculates the new intensity
             let middleIndex = Math.round(numberOfFiles/2)-1
             let newIntensity = values[middleIndex]
             if(isNaN(newIntensity)){
                console.warn("warning ! a given intensity was not a number for peak: "+matrix[i])
                continue;
            }
             matrix[i][config.intensity] = newIntensity 
        }
    }

    if(debug){console.log(matrixMissingValues)}
    //do special delete rules for keep if at least/most than x files in common
    if(calculusMethod =="atleast" || calculusMethod == "atmost"){
        var present = 0; //counts the number of times it is present in samples
        //loops through each line
        for(let i=matrix.length-1;i>0;i--){
            present = 0;
            //loops through each intensity
            for(let j=baseCol; j<matrix[0].length; j++){
                if(!thirdOfIntensity && matrix[i][j] > matrixMissingValues ){present += 1}
                else if(thirdOfIntensity && matrix[i][j] >matrixMissingValues[j-baseCol]){present +=1}
            }
            //deleted if not present enough
            if(calculusMethod =="atleast" && present < calculusMethod_value){
                matrix.splice(i,1)
            }
            if(calculusMethod =="atmost" && present > calculusMethod_value){
                matrix.splice(i,1)
            }
        }
    }

    //sort the array 
    matrix.sort(function(a,b) {
        return a[config.mz]-b[config.mz]
    });

    //looks if there is a need to substract a blank
    var blank = document.getElementById("matrix_substraction").checked
    if(blank){
        var blankFileString = document.getElementById("matrix_blank_file_choice").value
        //find the file from the string list, which is file_index
        var blankFileIndex = blankFileString.split("_")[1]
        var blankFile = files.list[blankFileIndex].data
        var deleteMethod = document.getElementById("matrix_blank_delete_choice").value
        var comparaisonMethodBlank = document.getElementById("matrix_blank_comparaison_data").value
        var ppmErrorBlank = document.getElementById("matrix_blank_ppm_tolerance").value
        substractBlank(matrix, blankFile, deleteMethod, comparaisonMethodBlank, ppmErrorBlank)
    }

    //updates the table of infos of the matrix. Done before deleting columns
    buildMatrixInfo(matrix, selectedFiles, baseCol)

    //deletes the intensity columns if there is a need to do a clean export
    if(matrixFormat == "originalStrict"){
        for(let i=0;i<matrix.length;i++){
            matrix[i].splice(baseCol, selectedFiles.length)
        }
    }
    if(matrixFilesColumns){
        matrixFilesColumns[0] = baseCol
        matrixFilesColumns[1] = matrix[0].length
    }

    //set the new columnNames
    columnNames = matrix[0]
    return matrix;
}

/**
 * A function to compare a datafile to a matrix. edits the inputted matrix and also returns a matrix of the new peaks. Also edits "masses"
 * @param {*} newCol the column of the new intensity. Corresponds to the original number of columns + the number of the file in the list of selected files for the matrix
 * @param {*} base the base matrix that will be edited with new intensities if they match
 * @param {*} newData the new datafile
 * @param {*} column the column on which the comparaison is made
 * @param {*} masses a list of all the masses for every data point in the matrix
 * @returns an array that holds the new unique values
 */
function addToMatrix(newCol,base,newData,column, masses){
    var matrix = [];
    var value = null;
    var alreadyExists = false;
    //loops through the data in the newData
    //starts at 1 to avoid the first line of titles
    for(let i=1; i<newData.length; i++){
        alreadyExists = false;
        value = newData[i][column]
        //loops through the base matrix
        for(let j=1; j<base.length; j++){
            if(value == base[j][column]){
                alreadyExists = true;
                base[j][newCol] = parseFloat(newData[i][config.intensity]) //sets the intensity to the right column
                masses[j-1].push(newData[i][config.mz])
            }
        }
        //creates the new peak if it does not already exists
        if(!alreadyExists){
            matrix.push(newData[i].slice());
            matrix[matrix.length-1][newCol] = parseFloat(newData[i][config.intensity]) //sets the intensity to the right column
            masses.push([newData[i][config.mz]]); 
        }
    }

    return matrix
}



/**
 * A function to compare a datafile to a matrix. edits the inputted matrix and also returns a matrix of the new peaks. USEFUL WHEN COMPARAISON OF DATA IS ON A NUMERICAL VALUE WITH AN ERROR
 * @param {*} newCol the column of the new intensity. Corresponds to the original number of columns + the number of the file in the list of selected files for the matrix
 * @param {*} base the base matrix that will be edited with new intensities if they match
 * @param {*} newData the new datafile
 * @param {*} column the column on which the comparaison is made
 * @param {*} ppm the ppm error perimtted
 * @param {*} masses a list of all the masses for every data point in the matrix
 * @returns an array that holds the new unique values
 */
function addToMatrix_ppm(newCol,base,newData,column,ppm, masses){
    var matrix = [];
    var value = null;
    var alreadyExists = false;
    var delta = 0;
    //loops through the data in the newData
    //starts at 1 to avoid the first line of titles
    for(let i=1; iZ<newData.length; i++){
        alreadyExists = false;
        value = parseFloat(newData[i][column])
        //loops through the base matrix
        for(let j=1; j<base.length; j++){
            const difference = Math.abs(value-base[j][column])
            if(difference>0.1){continue;}
            delta = parseFloat(1000000*(difference)/value)
            if(delta <= ppm){
                //should the masses be averaged out here ?
                alreadyExists = true;
                base[j][newCol] = parseFloat(newData[i][config.intensity]) //sets the intensity to the right column
                masses[j-1].push(newData[i][config.mz])
                break; //break because there should only be one peak to merge
            }
        }
        //creates the new peak if it does not already exists
        if(!alreadyExists){
            matrix.push(newData[i].slice());
            matrix[matrix.length-1][newCol] = parseFloat(newData[i][config.intensity]) //sets the intensity to the right column
            masses.push([newData[i][config.mz]]); 
        }
    }

    return matrix
}

/**
 * a function to substract a blank from a matrix
 * @param {*} matrix the matrix that is gonna be edited
 * @param {*} blank the blank file
 * @param {*} deleteMethod if the method is strict or lets peaks through on some conditions
 * @param {*} comparaisonMethod compare on the mass or on the formula
 * @param {*} ppm the ppm error permitted
 */
function substractBlank(matrix, blank, deleteMethod, comparaisonMethod, ppm){
    var delta = 0;
    var value = 0;
    var intensity = 0;
    //loops through the bank
    for(let i=1; i<blank.length; i++){
        value = parseFloat(blank[i][config.mz])
        intensity = parseFloat(blank[i][config.intensity])
        //loops through the matrix
        for(let j=1; j<matrix.length; j++){
            //if the deleted method is not strict, deletes only if the intensity is at least that of half the matrix
            if(deleteMethod == "half" && intensity < 0.5*parseFloat(matrix[j][config.intensity])){continue;}
            //for the mass comparaison, calculates the delta. If it is low enough, splice the matrix point. Else, compares on the formula
            if(comparaisonMethod == "mass"){ 
                delta = Math.abs(parseFloat(1000000*(value-matrix[j][config.mz])/value))
                if(delta <= ppm){
                    matrix.splice(j,1)
                    break;
                }
            }else if(comparaisonMethod == "formula"){
                if(blank[i][config.formulatext] == matrix[j][config.formulatext]){
                    matrix.splice(j,1)
                    break;
                }
            }

        }
    }
}

/********************************************************************* */
/*                       LOGGING INFOS                                 */
/********************************************************************* */
/**
 *  a function to edit the table info div for a new matrix 
 * @param {*} matrix ther new matrix
 * @param {*} filesIndexes an array of the numbers of the files selected
 * @param {*} baseCol the number of columns in the base files
 */
function buildMatrixInfo(matrix, filesIndexes, baseCol){
    //looks if there is a need to do a detailed report or not
    var detailed  = document.getElementById("matrix_detailed_report").checked
    var highDeviation  = document.getElementById("matrix_alert_deviation").checked

    //deletes the old table and creates a new one
    d3.select("#matrix_infos").remove()
    var body =  document.querySelector("#matrix_infos_parent");
    var newDiv = document.createElement("div");
    var table = document.createElement("table");
    newDiv.id = "matrix_infos";
    body.appendChild(newDiv);
    newDiv.appendChild(table);

    //create each line
    var line = [];
    var cell = [];
    for(let i=0; i<2+filesIndexes.length; i++){
        line[i] = document.createElement("tr");
        line[i].id = "matrix_infos_table_line_"+i;
        cell[i]=[];
        cell[i][0] = document.createElement("td");
        cell[i][1] = document.createElement("td");
        cell[i][2] = document.createElement("td");
        cell[i][3] = document.createElement("td");
        cell[i][4] = document.createElement("td");
        line[i].appendChild(cell[i][0])
        line[i].appendChild(cell[i][1])
        if(detailed){
            line[i].appendChild(cell[i][2])
            line[i].appendChild(cell[i][3])
            line[i].appendChild(cell[i][4])
        }

        table.appendChild(line[i])

    }
    cell[0][0].innerHTML = "Peaks number:"
    cell[0][1].innerHTML = matrix.length -1
    cell[1][0].innerHTML = "Files selected"
    cell[1][1].innerHTML = "Peaks nb"
    if(detailed){
        cell[1][2].innerHTML = "Nb of selected peaks"
        cell[1][3].innerHTML = "Nb de of unique peaks"
        cell[1][4].innerHTML = "%"
    }
    for(let i=2; i<2+filesIndexes.length; i++){
        cell[i][0].innerHTML = files.list[filesIndexes[i-2]].name
        cell[i][1].innerHTML = files.list[filesIndexes[i-2]].data.length-1

        //computation of the missing values
        var missingVal = 0
        if(!isNaN(matrixMissingValues)){missingVal = matrixMissingValues}
        else if(matrixMissingValues[0]){missingVal = Math.round(matrixMissingValues[i-2])+1}

        if(detailed){
            //computation of the number of peaks
            var total_number = 0;
            var unique_number = 0;
            for(let j=1; j<matrix.length; j++){
                if(matrix[j][baseCol+i-2] > missingVal){
                    total_number += 1
                    //check whether or not the peak is unique
                    var occurences = 0;
                    for(let k=0; k<filesIndexes.length; k++){
                        //checks if the peak is unique based on the filling of zeros choice
                        if(!isNaN(matrixMissingValues)){
                            if(matrix[j][baseCol+k] > missingVal){occurences += 1}
                        }else if(matrixMissingValues[0]){
                            if(matrix[j][baseCol+k] > matrixMissingValues[k]){occurences += 1}
                        }

                    }
                    if (occurences == 1){unique_number += 1}
                }

            }
            cell[i][2].innerHTML = total_number
            cell[i][3].innerHTML = unique_number
            cell[i][4].innerHTML = parseInt(100*unique_number/total_number)+"%"
        }
    }

    //does a report of the intensities deviation (Coefficient of variation)
    if(highDeviation){
        var textAlert = ""; //contains the text when peaks have suspectly high deviation
        var totalDev =0;
        var meanDev = 0;
        var totalCv = 0;
        var meanCv = 0;
        var totalNotUnique =0; //tot number of peaks not unique and so subject to the computation
        for(let i=1; i<matrix.length; i++){
            var sum = 0;
            var occurences = 0;
            var deviation = 0;
            //calculation of the mean
            for(let j=0; j<filesIndexes.length; j++){
                if(!isNaN(matrixMissingValues)){ //if the missing value is a 0 or the same value everywhere
                    if(matrix[i][baseCol+j]>matrixMissingValues){
                        sum += parseFloat(matrix[i][baseCol+j])
                        occurences += 1
                    }
                }
                else if(matrixMissingValues[0]){ //if the missing value depends on the sample
                    if(matrix[i][baseCol+j]>matrixMissingValues[j]){
                        sum += parseFloat(matrix[i][baseCol+j])
                        occurences += 1
                    }
                }
            }
            if(occurences < 2){continue;}else{totalNotUnique +=1};
            var mean = sum/occurences;
            //calculation of the deviation
            for(let j=0; j<filesIndexes.length; j++){
                if(!isNaN(matrixMissingValues)){ //if the missing value is a 0 or the same value everywhere
                    if(matrix[i][baseCol+j]>matrixMissingValues){
                        deviation += Math.pow((matrix[i][baseCol+j]-mean),2)
                    }
                }
                else if(matrixMissingValues[0]){ //if the missing value depends on the sample
                    if(matrix[i][baseCol+j]>matrixMissingValues[j]){
                        deviation += Math.pow((matrix[i][baseCol+j]-mean),2)
                    }
                }
            }
            deviation = Math.sqrt(deviation/occurences);
            var cv = deviation/mean
            totalDev += deviation;
            totalCv += cv;

            //alert of high deviation
            if(cv > 0.5){
                var formula= matrix[i][config.formulatext] || "";
                textAlert += "high coefficient of variation ("+0.001*Math.round(cv*1000)+") for peak:"+matrix[i][config.mz]+"  "+formula+"<br>"
            }
        }
        meanDev = totalDev/totalNotUnique
        meanCv = totalCv/totalNotUnique


        var divDeviation = document.createElement("div");

        //TODO: recalculate this part, was wrong
        // var line1 = "mean deviation of intensity:"
        // var line12 = 0.01*parseInt(100*meanDev)+"%"+"<br>"
        var line2 = "Mean variation coefficient:"+0.01*parseInt(meanCv*100)+"<br>"

        divDeviation.innerHTML = line2+textAlert

        newDiv.appendChild(divDeviation);

    }
}

/********************************************************************* */
/*                    COPYING/SAVING                                   */
/********************************************************************* */
/**----------------------------all the functions for downloading or copying a matrix------------------------------- */

//listens to the clicking of the copy button
document.getElementById("copy_matrix").addEventListener("click",function(){copyMatrix()});
//listens to the clicking of the save button
document.getElementById("download_matrix").addEventListener("click",function(){new Popup_saveMatrix()});

/**
 * copy to the clipboard the matrix data
 */
function copyMatrix(){
    var splitter = document.getElementById("matrix_splitter").value;
        //sets the text zone to contain the data separated by tab
        var text = ""
        for(let i=0; i<matrixData.length; i++){
            for(let j=0; j<matrixData[i].length;j++){
                //for the last element
                if(j+1 == matrixData[0].length){text= text + matrixData[i][j]}
                else{text= text + matrixData[i][j] + splitter}
            }
            text = text+'\n'
        }
    navigator.clipboard.writeText(text)
    //display a temporary box to confirm copying
    var popup = document.getElementById("popup_matrix_copy")
    popup.className = "fade_popup_visible"
    var styletop =  event.pageY-30
    popup.style.top = event.pageY-30;
    popup.style.left = event.pageX;
    
    setTimeout(() => { 
        popup.className = "fade_popup" 
        popup.style.top= styletop-1000
    }, 100);

}

class Popup_saveMatrix extends Popup{
    constructor(canvas) {
        super("configSaveMatrix","Save your matrix in the format displayed above the button")
        this.canvas = canvas
        var buttons = [
        {"name":"Save","function":(d)=>{this.save()}},
        ]
        var inputs = [
        {"type":"text", "placeholder":"Enter here the title of your file"},

        ]
        this.buildInputs([], inputs, buttons)
        this.valButton.remove()
    }

    save(){
        //reads backs values
        let name = this.popup_box.querySelector("input[name='popup_input_0']").value
        let splitter = document.getElementById("matrix_splitter").value;
        let fileFormat = document.getElementById("matrix_file_format").value;
        var text = ""
        for(let i=0; i<matrixData.length; i++){
            for(let j=0; j<matrixData[i].length;j++){
                //for the last element
                if(j+1 == matrixData[0].length){text= text + matrixData[i][j]}
                else{text= text + matrixData[i][j] + splitter}
            }
            text = text+'\n'
        }
        var file = document.createElement('a');
        let mimeType = "text/csv;encoding:utf-8" || 'application/octet-stream';
        var Blobfile = null
        Blobfile = new Blob([text], {type: mimeType})
        file.href = URL.createObjectURL(Blobfile);
        if(name == ""){file.setAttribute('download', "matrix."+fileFormat);}
        else{file.setAttribute('download', name+"."+fileFormat);}
        document.body.appendChild(file);
        file.click();
        document.body.removeChild(file);
        file.href = URL.revokeObjectURL(Blobfile);
        this.popup_close.click()
    }

}
