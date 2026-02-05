//this script handles the data treatment: deletion of data in the shown visualization, or choice of file vizualised
function datatreatment(data,datanumber) {
    console.log("treating data n°"+datanumber)
    columnNames = data[0] //saves the new column names
    fillTextArea("DeletedDataTextArea", []) //resets the text zone of deleted data
    console.log("treating new data...")
    drawEverything(data);
    indexFiles();
}


/** a function to draw every tab */
function drawEverything(data){
    console.log("drawing every canvas...")
   arrayToTable(data); //displays the data in the table
    //for PCA
    setPCATableValues()
    handlePCA()
    //for venn
    if(vennData.A){
        if(vennData.A.length >0){
            drawVenn()
        }
    }
    quickStartupInterfaceAttrib();
}

function drawEverything_noData(){
    console.log("drawing every canvas...")
    //for PCA
    setPCATableValues()
     //for venn
     if(vennData.A){
        if(vennData.A.length >0){
            drawVenn()
        }
    }
    quickStartupInterfaceAttrib();
}


/********************************************************************* */
/*                    HANDLING OF MENUS                                */
/********************************************************************* */


/**adding to the table all the files needed*/
function addFilesToTreatmentTable(){
    //deletes the old table and creates a new one
    d3.select("#treatment_file_table").remove()
    var body =  document.querySelector("#treatment_file_selection");
    var newTable = document.createElement("table");
    newTable.id = "treatment_file_table";
    body.appendChild(newTable);

    //appends all the options
    for(let i=0; i<files.list.length; i++){
        var table = document.getElementById("treatment_file_table");
        var line= document.createElement("tr");
        line.id = "treatment_table_line_"+i;
        var cell_name = document.createElement("td");
        cell_name.innerHTML = files.list[i].name
        var cell_button = document.createElement("input")
        cell_button.type = "checkbox"
        cell_button.id = "treatment_table_check_"+i;

        line.appendChild(cell_name);
        line.appendChild(cell_button);
        table.appendChild(line);
    }
}
//listens to the clicking of the select/unselect all for the file selection checkboxes
document.getElementById("treatment_check_all").addEventListener("click",function(){
    let value = document.getElementById("treatment_check_all").checked
    for(let i=0; i<files.list.length; i++){
        document.getElementById("treatment_table_check_"+i).checked = value
    }
});


html_tabtreatment.querySelector("select[name='treatment_type']").addEventListener("change", function(){ createTreatmentOptionMenu()})

/** a function to clear and recreate the menu for the treatment operation on treatment tab */
function createTreatmentOptionMenu(){
    //delete old value
    html_tabtreatment.querySelector("div[name='data_operation']").remove()

    //create a new div
    let htmlParent = document.getElementById("data_operation_parent")
    let div = document.createElement("div")
    div.setAttribute("name","data_operation")
    div.style.padding =  "10px 0 0 0";
    htmlParent.appendChild(div)

    let value = html_tabtreatment.querySelector("select[name='treatment_type']").value

    if(value == "none"){return div.innerHTML = ""}
    else if(value == "deletePeak"){
        div.innerHTML = "This will delete peaks from the selected files if they fit the condition below: <br>"
        //creates three elements: a selecter for the column, an operation selecter (> < or =) and a value input
        let html_colSelecter = document.createElement("select")
        let html_opSelecter  = document.createElement("select")
        let html_valueSelecter = document.createElement("input")
        html_colSelecter.setAttribute("name","colSelecter")
        html_opSelecter.setAttribute("name","opSelecter")
        html_valueSelecter.setAttribute("name","valueSelecter")
        createSelectOptions(html_colSelecter)
        let optionOp_1 = document.createElement("option")
        let optionOp_2 = document.createElement("option")
        let optionOp_3 = document.createElement("option")
        optionOp_1.setAttribute("value",">")
        optionOp_2.setAttribute("value","<")
        optionOp_3.setAttribute("value","=")
        optionOp_1.innerHTML = ">"
        optionOp_2.innerHTML = "<"
        optionOp_3.innerHTML = "="
        html_opSelecter.appendChild(optionOp_1)
        html_opSelecter.appendChild(optionOp_2)
        html_opSelecter.appendChild(optionOp_3)
        div.appendChild(html_colSelecter)
        div.appendChild(html_opSelecter)
        div.appendChild(html_valueSelecter)
    }
    else if(value == "parseFormula"){
        div.innerHTML = "This will compute the formulas into new individual columns for each selected file. It will create a new column for each element found in the list of selected files<br>"
        let table = document.createElement("table")
        let tableRows = []
        tableRows[0] = document.createElement("tr")
        tableRows[0].style.textAlign = "left"
        tableRows[1] = document.createElement("tr")
        let tableCells = []
        tableCells[0] = document.createElement("td")
        tableCells[1] = document.createElement("td")
        tableCells[2] = document.createElement("td")
        tableCells[3] = document.createElement("td")
        let html_ratioSelecter = document.createElement("input")
        let html_buttonForce = document.createElement("input")
        let html_textForce = document.createElement("input")
        html_ratioSelecter.setAttribute("name","ratioSelecter")
        html_buttonForce.setAttribute("name","buttonForce")
        html_textForce.setAttribute("name","textForce")
        html_buttonForce.setAttribute("type","checkbox")
        html_textForce.setAttribute("placeholder","Write here elements separated by semicolons (;) if you want to force your list of elements")
        html_textForce.style.width = "600px"
        html_ratioSelecter.style.width = "600px"
        html_ratioSelecter.setAttribute("placeholder","write ratios you also want calculated separated by ; (ex.O/C;H/C)")
        tableCells[2].appendChild(html_buttonForce)
        tableCells[3].appendChild(html_textForce)
        tableCells[0].innerHTML = ""
        tableCells[1].appendChild(html_ratioSelecter)
        tableRows[0].appendChild(tableCells[0])
        tableRows[0].appendChild(tableCells[1])
        tableRows[1].appendChild(tableCells[2])
        tableRows[1].appendChild(tableCells[3])
        table.appendChild(tableRows[0])
        table.appendChild(tableRows[1])
        div.appendChild(table)
    }else if(value == "addKMD"){
        div.innerHTML = "this will compute a KMD based on the m/z value, and add it as the last column<br> KMD unit : "
        let inputHTML = document.createElement("input")
        inputHTML.setAttribute("type","text")
        inputHTML.setAttribute("name","treatmentKMDunit")
        inputHTML.style.width = "500px";
        inputHTML.setAttribute("placeholder","write here the formula or the mass of the intended kendrick unit")
        div.appendChild(inputHTML)
        div.innerHTML += "<br>KMD Divisor: "
        let inputDivisor = document.createElement("input")
        inputDivisor.setAttribute("type","number")
        inputDivisor.setAttribute("value",1)
        inputDivisor.setAttribute("name","treatmentKMDdivisor")
        div.appendChild(inputDivisor)
        let selectDivisor = document.createElement("select")
        selectDivisor.setAttribute("name","treatmentKMDchoice")
        let options = [document.createElement("option"),document.createElement("option"),document.createElement("option")]
        options[0].value = "round"
        options[0].innerHTML = "Round"
        options[1].value = "roundUp"
        options[1].innerHTML = "Round up (ceiling)"
        options[2].value = "roundDown"
        options[2].innerHTML = "Round down (floor)"
        options[0].style.background = "black"
        options[1].style.background = "black"
        options[2].style.background = "black"
        selectDivisor.appendChild(options[0])
        selectDivisor.appendChild(options[1])
        selectDivisor.appendChild(options[2])
        div.innerHTML+="<br> Rounding method:"
        div.appendChild(selectDivisor)
    }else if(value == "addDBE"){
        div.innerHTML = "this will compute the formula DBE and add it as a column "
        div.innerHTML += "<br>Elements considered: C,H,D,N,P,Si,F,Cl,Br,I"
    }else if(value == "polymer"){
        div.innerHTML = "this will try to find the number of polymer units and the remaining end groups. They will be added as columns <br> Polymer unit : "
        let inputHTML = document.createElement("input")
        inputHTML.setAttribute("type","text")
        inputHTML.setAttribute("name","polymerUnit")
        inputHTML.style.width = "500px";
        div.appendChild(inputHTML)
    }else if(value == "copolymer"){
        div.innerHTML = "Given possible end groups and two monomers, this will try to decompose the formula into number of each monomer and end groups. Three columns will be added<br> Monomer 1 unit : "
        let inputMonomer1 = document.createElement("input")
        inputMonomer1.setAttribute("type","text")
        inputMonomer1.setAttribute("name","monomer1")
        inputMonomer1.style.width = "500px";
        div.appendChild(inputMonomer1)
        let inputMonomer2 = document.createElement("input")
        inputMonomer2.setAttribute("type","text")
        inputMonomer2.setAttribute("name","monomer2")       
        inputMonomer2.style.width = "500px";
        div.innerHTML += "<br> Monomer 2 unit : "
        div.appendChild(inputMonomer2)
        //add a button to open a popup to enter end groups
        let buttonEndGroups = document.createElement("button")
        buttonEndGroups.innerHTML = "Define end groups"
        buttonEndGroups.addEventListener("click", function(){
            new Popup_editEndGroups(config.endGroups)
        })
        div.innerHTML += "<br>"
        div.appendChild(buttonEndGroups)   
    }else if(value == "removeCol"){
        div.innerHTML = "This will remove a column, chosen by number. A preview title from one of the files will be given<br> Column number: "
        let inputHTML = document.createElement("input")
        inputHTML.setAttribute("type","number")
        inputHTML.setAttribute("name","columnNumber")
        //adds a listener to update the indicator every time the column choice changes
        div.appendChild(inputHTML)
        div.innerHTML += "<br>"
        setTimeout(
            document.querySelector("input[name='columnNumber']").addEventListener("change",function(){
                let div = document.querySelector("div[name='data_operation']")
                let newName = document.createElement("p")
                if(div.querySelector("p[name='columnTitle']")){
                    div.querySelector("p[name='columnTitle']").remove()
                }
                newName.setAttribute("name","columnTitle")
                newName.classList = "italicGolden"
                newName.innerHTML = columnNames[this.value]
                div.appendChild(newName)
            })
        ,20)
    }



}

/********************************************************************* */
/*                    TREATMENT FUNCTIONS                              */
/********************************************************************* */

document.getElementById("calculate_treatment").addEventListener("click",function(){handleDataOperation()})
/** main computation function fired when a data calculation is made */
function handleDataOperation(){
    var operation = html_tabtreatment.querySelector("select[name='treatment_type']").value
    var selectedFiles = []; //contains a list of the files number selected
    var j=0 //counts the number of selected files
    //gather which files are selected in a loop
    for(let i=0; i<files.list.length; i++){
        fileButton = document.getElementById("treatment_table_check_"+i)
        if(fileButton.checked){
            selectedFiles[j] = i;
            j += 1
        }
    }
    if(operation == "deletePeak"){
        let conditions = {}
        conditions.col = html_tabtreatment.querySelector("select[name='colSelecter']").value;
        conditions.operator = html_tabtreatment.querySelector("select[name='opSelecter']").value;
        conditions.value = html_tabtreatment.querySelector("input[name='valueSelecter']").value
        for(let i=0; i<selectedFiles.length; i++){
            cutData(files.list[selectedFiles[i]].data,selectedFiles[i],conditions)
        }
    }else if(operation == "parseFormula"){
        //checks if a value has been entered and should be parsed 
        var list=[]
        if(html_tabtreatment.querySelector("input[name='buttonForce']").checked){
            list = html_tabtreatment.querySelector("input[name='textForce']").value.split(";");
        }else{
            //automatically finds every elements in the selected files
            var elementsLists = []
            for(let i=0; i<selectedFiles.length; i++){
                elementsLists[i] = buildElementsList(files.list[selectedFiles[i]].data)
            }
            list = combineStringLists(elementsLists)
        }
        var ratiosString = html_tabtreatment.querySelector("input[name='ratioSelecter']").value
        for(let i=0; i<selectedFiles.length; i++){
            var j = selectedFiles[i]
            fileParseAddElementsColumns(files.list[j].data,j, ratiosString, list)
        }
    }else if(operation == "addKMD"){
        let kmdUnit = html_tabtreatment.querySelector("input[name='treatmentKMDunit']").value
        let divisor = parseInt(html_tabtreatment.querySelector("input[name='treatmentKMDdivisor']").value)
        let roundingMethod = html_tabtreatment.querySelector("select[name='treatmentKMDchoice']").value
        let kmdMass = 0
        if(isNaN(kmdUnit)){
            let kmdMol = new ChemFormula(kmdUnit)
            kmdMass = kmdMol.mass
        }else{
            kmdMass = parseFloat(kmdUnit)
        }
        for(let i=0; i<selectedFiles.length; i++){
            addKMDColumnToFile(files.list[selectedFiles[i]].data,selectedFiles[i],config.mz,kmdUnit,kmdMass,divisor,roundingMethod)
        }
    }else if(operation =="addDBE"){
        for(let i=0; i<selectedFiles.length; i++){
            addDBEColumnToFile(files.list[selectedFiles[i]].data,selectedFiles[i])
        }
    }else if(operation == "polymer"){
        let polymerUnitString = html_tabtreatment.querySelector("input[name='polymerUnit']").value
        if(polymerUnitString == ""){return;}
        for(let i=0; i<selectedFiles.length; i++){
            addPolymerColumnsToFile(files.list[selectedFiles[i]].data,selectedFiles[i], polymerUnitString)
        }
    }else if(operation == "copolymer"){
        let monomer1String = html_tabtreatment.querySelector("input[name='monomer1']").value
        let monomer2String = html_tabtreatment.querySelector("input[name='monomer2']").value
        if(monomer1String == "" || monomer2String == ""){return;}
        for(let i=0; i<selectedFiles.length; i++){
            addCopolymerColumnsToFile(files.list[selectedFiles[i]].data,selectedFiles[i], monomer1String, monomer2String, config.endGroups)
        }
    }else if(operation == "removeCol"){
        let colNum = html_tabtreatment.querySelector("input[name='columnNumber']").value
        for(let i=0; i<selectedFiles.length; i++){
            let file = files.list[selectedFiles[i]]
            let data = file.data
            for(let j=0; j<data.length; j++){
                data[j].splice(colNum, 1)
            }
        }
        //logs the operation
        if(document.getElementById("data_log")){
            document.getElementById("data_log").innerHTML += "Deleted Column n°"+colNum+" on "+selectedFiles.length+" files"+"<br>"
        }
    }
    //in all cases, refresh the upload tab infos
    files.render()
}



/**cuts the data if the button is pressed. 
 * data: the data to be cutted
 * dataNumber: the number of the file, -1 if it is not a file
 * conditions: condition must contain col, the number of the column; operator, < or > or =; value, the value to compare it to
*/
function cutData(data,dataNumber, conditions) {
    //get the data back
    var selectedSelecter = conditions.col
    var selecterOperation = conditions.operator
    var selecterValue = conditions.value

    //gets the logging data zone
    var loggingText = document.getElementById("data_log").innerHTML
    //logs the number of deleted points
    var loggingNumberDeleted = 0;
    //logs the data deleted
    var deletedData = [data[0]];

    //for every type of operation does the calculus
    if (selecterOperation == ">"){
        //for every data line
        for(let i=data.length-1; i>=1; i--){ //>=1 to not delete the first line which contains the titles
            if(data[i][selectedSelecter] != [] && parseFloat(data[i][selectedSelecter]) > parseFloat(selecterValue)){ //deletes if inferior
                deletedData.push(data[i])
                deletedData = deletedData.slice();

                loggingText = loggingText + "deleting :  ("+data[i] +")</br>";
                loggingNumberDeleted = loggingNumberDeleted +1;
                data.splice(i, 1)
            }
        }
        
    }
    if (selecterOperation == "<"){
        //for every data line
        for(let i=data.length-1; i>=1; i--){ //>=1 to not delete the first line which contains the titles
            if(data[i][selectedSelecter] != [] && parseFloat(data[i][selectedSelecter]) < parseFloat(selecterValue)){ //deletes if inferior
                deletedData.push(data[i])
                deletedData = deletedData.slice();

                loggingText = loggingText + "deleting :  ("+data[i] +")</br>";
                loggingNumberDeleted = loggingNumberDeleted +1;
                data.splice(i, 1)
            }
        }
        
    }
    if (selecterOperation == "="){
        //for every data line
        for(let i=data.length-1; i>=1; i--){ //>=1 to not delete the first line which contains the titles
            if(data[i][selectedSelecter] != [] && data[i][selectedSelecter] == selecterValue){ //deletes if inferior
                deletedData.push(data[i])
                deletedData = deletedData.slice();
                
                loggingText = loggingText + "deleting :  ("+data[i] +")</br>";
                loggingNumberDeleted = loggingNumberDeleted +1;
                data.splice(i, 1)
            }
        }
        
    }
    //logs this operation
    if(dataNumber >-1 && files.list[dataNumber]){
        let file = files.list[dataNumber]
        let text = "Deleted "+loggingNumberDeleted+" peaks who did match : "+columnNames[conditions.col]+" "+conditions.operator+" "+conditions.value+"<br>"
        file.logs.push(text)
        loggingText = loggingText + "Filtering done. Deleted "+loggingNumberDeleted+" peaks from file :"+files.list[dataNumber].name+"</br>"
        document.getElementById("data_log").innerHTML = loggingText //sets the new logging text

    }
     //fills the text area of the deleted dots
    fillTextArea("DeletedDataTextArea", deletedData)
}

////////////////////PARSE FORMULA////////////////////////////////

/**combines multiple string list in a single one. Takes in an array of arrays of text*/
function combineStringLists(lists){
    var newList = [];
    for(let i=0; i<lists.length; i++){
        //loops through the list
        for(let j=0; j<lists[i].length; j++){
            //loops through the elements in each list
            let alreadyFound = false;
            //checks if it finds the element in the newly made list
            for(let k=0; k<newList.length; k++){
                if (lists[i][j] == newList[k]){alreadyFound = true;}
            }
            if (!alreadyFound){newList.push(lists[i][j])}
        }
    }
    return newList

}

function fileParseAddElementsColumns(fileChosen,fileNum, ratioString, elementsList){
     //parse the ratios that need to be calculated. Each ratio is one line of the parsedRatios array, [0] is the top diviser, [1] is the bottom
     var parsedRatios = ratioString.split(";")
     for(let i=0; i<parsedRatios.length; i++){
         parsedRatios[i]= parsedRatios[i].match(/[a-zA-Z]+|[0-9]+/g)
     }
    let parsedFormulas = [];
    for(let i=1; i<fileChosen.length; i++){
        parsedFormulas[i] = parseChemicalFormula(fileChosen[i][config.formulatext])
    }

    //adds the columns to the file
    var colLength = fileChosen[0].length
    for(let i=0; i<elementsList.length; i++){
        fileChosen[0][colLength] = "#"+elementsList[i]
        for(let j=1; j<fileChosen.length; j++){
            var value=0;
            //loops to find the value for this element. If none is found, it will stay at 0
            for(let k=0; k<parsedFormulas[j].length; k++){
                if(parsedFormulas[j][k].name == elementsList[i]){value = parsedFormulas[j][k].number}
            }
            fileChosen[j][colLength] = value
        }
        colLength += 1
    }
    //computes the ratios
    if(parsedRatios.length >0 && parsedRatios[0] != null){
        for(let i=0; i<parsedRatios.length; i++){
            fileChosen[0][colLength] = parsedRatios[i][0]+"/"+parsedRatios[i][1]
    
    
            var dividendName = "#"+parsedRatios[i][0];
            var divisorName = "#"+parsedRatios[i][1];
            var dividendCol = -1;
            var divisorCol = -1;
            //finds the columns corresponding to dividend and divisor
            for (let j=0; j<fileChosen[0].length; j++){
                if(dividendName == fileChosen[0][j]){dividendCol = j}
                if(divisorName == fileChosen[0][j]){divisorCol = j}
            }
            //calculates the ratio
            for(let j=1; j<fileChosen.length;j++){
                var ratio = fileChosen[j][dividendCol]/fileChosen[j][divisorCol]
                if(isNaN(ratio)|| ratio == "Infinity"){ratio = -1}
                fileChosen[j][colLength] = ratio
            }
    
            colLength +=1
        }
    }
    //logs the operation
    if(document.getElementById("data_log")){
        document.getElementById("data_log").innerHTML += "Added "+elementsList.length+" columns for elements at the end of file: "+files.list[fileNum].name+"<br>"
    }
    if(!isNaN(fileNum) && files.list[fileNum]){
        let file = files.list[fileNum]
        let text = "Parsed the formula. Added "+elementsList.length+" columns for elements at the end"
        if(ratioString != ""){
            text += " and "+ parsedRatios.length + " columns for ratios"
        }
        file.logs.push(text)
    }
}

/** a function that adds a column to the file data, where a DBE is computed */
function addKMDColumnToFile(data,dataNumber,mzCol,unitName,kmdMass,divisor, round){
    let mass = kmdMass/divisor
    let newBase = Math.round(mass)/mass
    data[0].push(config.kendrickText+"("+unitName+")")
    for(let i=1; i<data.length; i++){
        let calcMass = parseFloat(data[i][mzCol])*newBase
        let massDefect = 0;  
        if(round=="round"){massDefect = Math.round(calcMass) - calcMass}
        else if(round=="roundUp"){massDefect = Math.ceil(calcMass) - calcMass}
        else if(round=="roundDown"){massDefect = Math.floor(calcMass) - calcMass}
        data[i].push(massDefect)
    }
    //logs this operation
    loggingText = document.getElementById("data_log").innerHTML
    loggingText = loggingText + "KMD computed, values added to file :"+files.list[dataNumber].name+"</br>"
    document.getElementById("data_log").innerHTML = loggingText //sets the new logging text
    //adds the data log
    if(files.list[dataNumber]){
        let file = files.list[dataNumber]
        let text = "Added a KMD("+unitName+") column"
        file.logs.push(text)
    }
}

/** adds to a data file a column with the computed DBE at the end */
function addDBEColumnToFile(data, dataNumber){
    data[0].push("DBE")
    for(let i=1; i<data.length; i++){
        let mol = new Molecule(data[i][config.formulatext])
        data[i].push(mol.dbe)
    }
    //logs this operation
    loggingText = document.getElementById("data_log").innerHTML
    loggingText = loggingText + "DBE computed, values added to file :"+files.list[dataNumber].name+"</br>"
    document.getElementById("data_log").innerHTML = loggingText //sets the new logging text
    //adds the data log
    if(files.list[dataNumber]){
        let file = files.list[dataNumber]
        let text = "Added a DBE column"
        file.logs.push(text)
    }
}

/** adds to a data file columns for polymer */
function addPolymerColumnsToFile(data, dataNumber, polymerString){
    data[0].push("Polymer Count")
    data[0].push("End groups")
    for(let i=1; i<data.length; i++){
        let results = segmentPolymer(data[i][config.formulatext],polymerString)
        data[i].push(results.unitsNb)
        data[i].push(results.endGroups.name)
    }
    //logs this operation
    loggingText = document.getElementById("data_log").innerHTML
    loggingText = loggingText + "Polymer chain computed, columns added to file :"+files.list[dataNumber].name+"</br>"
    document.getElementById("data_log").innerHTML = loggingText //sets the new logging text
    //adds the data log
    if(files.list[dataNumber]){
        let file = files.list[dataNumber]
        let text = "Added 2 columns for polymer chain length and end group, unit: "+polymerString
        file.logs.push(text)
    }
}

/** */
function addCopolymerColumnsToFile(data, dataNumber, monomer1String, monomer2String, endGroupsList){
    data[0].push("Monomer 1 Count")
    data[0].push("Monomer 2 Count")
    data[0].push("End groups") 
    for(let i=1; i<data.length; i++){
        let results = segmentCopolymer(data[i][config.formulatext], monomer1String, monomer2String, endGroupsList)
        if(results == null){
            data[i].push("")
            data[i].push("")
            data[i].push("")
        }else{
            data[i].push(results.monomer1Nb)
            data[i].push(results.monomer2Nb)
            if(results.endGroup.formulaText){
                data[i].push(results.endGroup.formulaText || "")
            }else{
                data[i].push(results.endGroup.name || "")
            }

        }
    }
    //logs this operation
    loggingText = document.getElementById("data_log").innerHTML
    loggingText = loggingText + "Copolymer composition computed, columns added to file :"+files.list[dataNumber].name+"</br>"
    document.getElementById("data_log").innerHTML = loggingText //sets the new logging text     
    //adds the data log
    if(files.list[dataNumber]){
        let file = files.list[dataNumber]
        let text = "Added 3 columns for copolymer end groups, monomer 1: "+monomer1String+", monomer 2: "+monomer2String
        file.logs.push(text)
    }   
}

// popup to edit end groups for copolymer analysis
class Popup_editEndGroups extends Popup {
    constructor(endGroups) {
        super("heteroClassesEdit","Edit here the list of end groups, if ions with the charge and adduct <br> The name column is optional <br>")
        this.endGroups = endGroups
        this.buildSuppContext()
    }

    buildSuppContext(){
        var htmlTable = document.createElement("table")
        htmlTable.setAttribute("class","popuptable")
        this.elLine = []
        this.elCells = []
        this.elInputs = []
        this.htmlTable = htmlTable
        //clones the elements
        this.copy = []
        if(!this.endGroups){this.endGroups = []}
        this.endGroups.forEach((item)=>{
            let newItem = {"name":item.name,"formulaText":item.formulaText,"mass":item.mass,"formula":item.formula}
            this.copy.push(newItem)
        })
        //creates a table
        this.addFirstLine()
        for(let i=0; i<this.copy.length; i++){
            this.addLine()
        }
        this.preText.appendChild(htmlTable)
        //adds the + button
        this.addButton = document.createElement("button")
        this.addButton.setAttribute("name","addEndGroupsButton")
        this.addButton.setAttribute("class","smallpopupbutton")
        this.addButton.addEventListener("click", ()=>{
            this.addLine()
        })
        //adds the copy/paste buttons
        this.copyButton = document.createElement("button")
        this.copyButton.setAttribute("name","copyEndGroupsButton")
        this.copyButton.setAttribute("class","smallpopupbutton")
        this.copyButton.style.margin = 1
        this.copyButton.addEventListener("click", ()=>{
            this.copyToClipboard()
        })
        this.pasteButton = document.createElement("button")
        this.pasteButton.setAttribute("name","pasteEndGroupsButton")
        this.pasteButton.setAttribute("class","smallpopupbutton")
        this.pasteButton.style.margin = 1
        this.pasteButton.addEventListener("click", ()=>{
            this.pasteEndGroups()
        })
        let divCopyPaste = document.createElement("div")
        divCopyPaste.appendChild(this.copyButton)
        divCopyPaste.appendChild(this.pasteButton)

        this.addButton.innerHTML = "Add a new end group"
        this.copyButton.innerHTML = "Copy end groups"
        this.pasteButton.innerHTML = "Paste end groups (formula list)"
        this.preText.appendChild(document.createElement("br"))
        this.preText.appendChild(this.addButton)
        this.preText.appendChild(divCopyPaste)
        let separatorBox =document.createElement("div")
        this.popup_box.appendChild(separatorBox)
        this.valButton.addEventListener("click",()=>{config.endGroups = this.copy;})
    }
    addFirstLine(){
        let newLength = this.elLine.length
        this.elLine[newLength] = document.createElement("tr")
        this.elCells[newLength] = []
        for(let j=0; j<4; j++){
            this.elCells[newLength][j] = document.createElement("td")
            this.elLine[newLength].appendChild(this.elCells[newLength][j])
        }
        this.elCells[newLength][0].innerHTML = "Name"
        this.elCells[newLength][1].innerHTML = "Formula"
        this.elCells[newLength][2].innerHTML = "Mass"
        this.elCells[newLength][3].innerHTML = "X"
        this.htmlTable.appendChild(this.elLine[newLength])
    }

    copyToClipboard(){
        const split = "\t";
        let endGroups = this.copy
        var text=""
        text += "name" + split + "formula"+ split + "mass" + '\n'
        for(let i=0; i<endGroups.length; i++){
          text += endGroups[i].name + split + endGroups[i].formulaText + split + endGroups[i].mass + '\n'
        }
        navigator.clipboard.writeText(text)
    }

    pasteEndGroups(){
        navigator.clipboard.readText()
        .then(
            (pastedData) => {
                let parsedData = []
                let lbreak = pastedData.split(/\r?\n/);
                lbreak.forEach(res => {
                    parsedData.push(res.split("\t"));
                });
                let pastedEndGroups = []
                for(let i=0; i<parsedData.length-1; i++){
                    let newObject = {name:"",formulaText:"",mass:0}
                    if(parsedData[i].length >=2){
                        newObject.name = parsedData[i][0]
                        newObject.formulaText = parsedData[i][1]
                        let mol = new Molecule(parsedData[i][0])
                        newObject.formula = mol
                        newObject.mass = parseFloat(mol.mass) || 0
                        if(!isNaN(parsedData[i][2])){
                            newObject.mass = parsedData[i][2] || 0
                        }
                    }else if(parsedData[i].length  == 1){
                        newObject.formulaText = parsedData[i][0]
                        newObject.name = ""
                        let mol = new Molecule(parsedData[i][0])
                        newObject.formula = mol
                        newObject.mass = parseFloat(mol.mass) || 0
                    }
                    pastedEndGroups.push(newObject)
                }
                closePopup(this.valButton);
                new Popup_editEndGroups(pastedEndGroups)
            },
        )
    }

    addLine(){
        let newLength = this.elLine.length
        let endGroups = this.copy
        this.elLine[newLength] = document.createElement("tr")
        this.elCells[newLength] = []
        for(let j=0; j<4; j++){
                this.elCells[newLength][j] = document.createElement("td")
                this.elLine[newLength].appendChild(this.elCells[newLength][j])
        }
        this.elInputs[newLength]=[]
        this.elInputs[newLength][0]= document.createElement("input")
        this.elInputs[newLength][0].setAttribute("type","text")
        this.elInputs[newLength][0].setAttribute("name","name"+i)
        this.elInputs[newLength][0].style.width = "170px"
        this.elInputs[newLength][0].addEventListener("change",(d) =>{this.readChange(d,newLength-1,"name")})

        this.elInputs[newLength][1]= document.createElement("input")
        this.elInputs[newLength][1].setAttribute("type","text")
        this.elInputs[newLength][1].setAttribute("name","name"+i)
        this.elInputs[newLength][1].style.width = "170px"
        this.elInputs[newLength][1].addEventListener("change",(d) =>{this.readChange(d,newLength-1,"formulaText")})

        //not a true input because mass is just indicative
        this.elInputs[newLength][2] = document.createElement("div")
        this.elInputs[newLength][2].style.width = "100px"

        if(endGroups[newLength-1]){
            this.elInputs[newLength][0].setAttribute("value",endGroups[newLength-1].name ||"")
            this.elInputs[newLength][1].setAttribute("value",endGroups[newLength-1].formulaText ||"")
            const mass = parseFloat(endGroups[newLength-1].mass) || 0
            this.elInputs[newLength][2].innerHTML = mass.toFixed(6)
        }else{
            this.copy.push({name:"",formulaText:"",mass:0})
        }

        this.elInputs[newLength][3]= document.createElement("button")
        this.elInputs[newLength][3].setAttribute("name","deleteLink_"+newLength)
        this.elInputs[newLength][3].setAttribute("class","smallerpopupbutton")
        this.elInputs[newLength][3].addEventListener("click", (d)=>{
            this.removeLine(d)
        })
        this.elInputs[newLength][3].innerHTML = "DEL"

        this.elCells[newLength][0].appendChild(this.elInputs[newLength][0])
        this.elCells[newLength][1].appendChild(this.elInputs[newLength][1])
        this.elCells[newLength][2].appendChild(this.elInputs[newLength][2])
        this.elCells[newLength][3].appendChild(this.elInputs[newLength][3])
        this.htmlTable.appendChild(this.elLine[newLength])
    }

    removeLine(d){
        let index = d.target.parentElement.parentElement.rowIndex
        this.elInputs.splice(index,1)
        this.elCells.splice(index,1)
        this.elLine.splice(index,1)
        this.copy.splice(index-1,1)

        this.htmlTable.deleteRow(index)
    }
    readChange(event, index,property){
        let input = event.target
        if(input.type =="text"){
            this.copy[index][property] = input.value
        }
        //log the mass if needed
        if(property == "formulaText"){
            let newMol = new Molecule(input.value)
            this.elInputs[index+1][2].innerHTML = (newMol.mass).toFixed(6)
            this.copy[index].mass = newMol.mass
            this.copy[index].formula = newMol   
        }
    }
}
