var cvsAttrib = {}
cvsAttrib.canvas = []; 
cvsAttrib.data = [];
cvsAttrib.sideData = [];
var cfgAttribDraw = {}
cfgAttribDraw.main = {"selectTool":-1, "opacity":1};
cfgAttribDraw.data = {};
cfgAttribDraw.canvas = [];
cfgAttribDraw.pie = {};
cfgAttribDraw.letter ="Attrib";


for(let i=0; i<3; i++){ 
    cvsAttrib.canvas[i]= []
    cvsAttrib.data[i]= []
    cvsAttrib.sideData[i]= {"kendrick":[],"bins":[],"binsMax":[]}
    cfgAttribDraw.canvas[i] = {}
    cvsAttrib.canvas[i].self= appendCell("#canvasAttrib","cell"+i)
    cvsAttrib.canvas[i].data = []; //will hold the data sets drawn on the cell

    cfgAttribDraw.canvas[i].type = "none"
    cfgAttribDraw.canvas[i].xtype = 0
    cfgAttribDraw.canvas[i].ytype = 0
    cfgAttribDraw.canvas[i].xmin = 0
    cfgAttribDraw.canvas[i].xmax = 0
    cfgAttribDraw.canvas[i].ymin = 0
    cfgAttribDraw.canvas[i].ymax = 0 
    createCellAttrib(i, cfgAttribDraw.canvas[i].type)

}
//for suspect peaks
cvsAttrib.data[3]= []
cvsAttrib.sideData[3]= {"kendrick":[],"bins":[],"binsMax":[]}
//default config of cfg
cfgAttribDraw.canvas[0]={"type":"kendrick","xtype":"m/z","ytype":"exp","xmin":0,"xmax":1200,"ymin":-1,"ymax":1,"dotSize":2,"relativeSize":false,"kendrickFormula":"CH2","kendrickMass":14.0156501,"kendrickDivisor":1}
cfgAttribDraw.canvas[1]={"type":"errorPlot","xmin":0,"xmax":1200,"ymin":-1,"ymax":1,"dotSize":2,"meanLine":25}
cfgAttribDraw.canvas[2]={"type":"henryPlot","xmin":-1,"xmax":1,"ymin":-3,"ymax":3,"barsNum":75}

createTooltipFunctions(cfgAttribDraw)
createTooltips(cfgAttribDraw, "#tooltip_canvasAttrib","tooltipAttrib")

function quickStartupInterfaceAttrib(isARefresh){
    //deletes the not needed tooltips
    var del = document.getElementById("tooltip_canvasAttrib").querySelectorAll("div[class='tooltip']")
    for(let i=0; i<del.length; i++){del[i].remove()}
    var del2 = document.getElementById("tooltip_canvasAttrib").querySelectorAll("div[class='tooltip_click']")
    for(let i=0; i<del2.length; i++){del2[i].remove()}
    //to fix problem with older versions trying to load no longer compatible data
    createTooltipFunctions(cfgAttribDraw)
    createTooltips(cfgAttribDraw, "#tooltip_canvasAttrib","tooltipAttrib")
    createMenuAttrib();
    setMainMenuAttrib();
    if(attribData.deltaListRaw){return;}
    //this is used for avoiding drawing the canvas attrib when loading a file and loading partially deterioated attribData
    //this is because arrays cannot contain properties in the save
    //anyway, the attribution tab should only be temporary, for work, so this is a feature, not a bug
    if(!isARefresh){return;}
    startCanvasAttrib();
}

/********************************************************************* */
/*                    CREATION OF MENUS                                */
/********************************************************************* */

/** handles changes in the checkboxes */
document.querySelector("div[name='attrib_checkbox_menu']").addEventListener("change",(d)=>{attribCheckboxMenuRead(d)})

function attribCheckboxMenuRead(d){
    let menu = document.querySelector("div[name='attrib_checkbox_menu']")
    let buttonsList = menu.querySelectorAll("input")
    attribCfg.checks.isotopy = buttonsList[0].checked
    attribCfg.checks.seeds = buttonsList[1].checked
    attribCfg.checks.network = buttonsList[2].checked
    attribCfg.checks.passes = buttonsList[3].checked
    attribCfg.checks.filtering = buttonsList[4].checked
    //sets the good algorithm
    let algoSelecter = document.querySelector("select[name='attribAlgorithm']")
    if(!attribCfg.checks.network && attribCfg.checks.passes){
        attribCfg.main.algorithm = "deNovo"
        algoSelecter.value = "deNovo"
    }else if(attribCfg.checks.network && attribCfg.checks.networkType == "direct"){
        attribCfg.main.algorithm = "deNovo"
        algoSelecter.value = "dNetwork"
    }else if(attribCfg.checks.network && attribCfg.checks.networkType == "undirect"){
        algoSelecter.value = "uNetwork"
    }else{
        algoSelecter.value = "custom"
    }
    //special case: for the "remove peaks without network connections button"
    let specialButtonRemovePeakNetwork = document.getElementsByName("removeIfNoNetwork")
    if(specialButtonRemovePeakNetwork && specialButtonRemovePeakNetwork[0]){
        let button = specialButtonRemovePeakNetwork[0]
        if(attribCfg.checks.network){
            button.disabled = false
        }else{
            button.disabled = true
            button.checked = false
            attribCfg.main.removeIfNoNetwork = false
        }
    }

}

function attribCheckboxMenuUpdate(premadeList){
    let menu = document.querySelector("div[name='attrib_checkbox_menu']")
    let buttonsList = menu.querySelectorAll("input")
    buttonsList[0].checked = attribCfg.checks.isotopy
    buttonsList[1].checked = attribCfg.checks.seeds
    buttonsList[2].checked = attribCfg.checks.network
    buttonsList[3].checked = attribCfg.checks.passes
    buttonsList[4].checked = attribCfg.checks.filtering
    if(premadeList == "deNovo"){
        buttonsList[2].checked = false
        buttonsList[3].checked = true
        attribCfg.checks.network = false
        attribCfg.checks.passes = true
        attribCheckboxMenuRead()
    }else if(premadeList == "uNetwork"){
        buttonsList[2].checked = true
        attribCfg.checks.network = true
        attribCfg.checks.passes = true
        attribCfg.checks.networkType = "undirect"
    }else if(premadeList == "dNetwork"){
        buttonsList[2].checked = true
        attribCfg.checks.network = true
        attribCfg.checks.passes = true
        attribCfg.checks.networkType = "direct"
    }

}

function prepareCompatibilityCheckboxMenu(){
    attribCfg.checks = {
        "isotopy":true,
        "seeds":true,
        "passes":true,
        "network":false,
        "networkType":"direct",
        "filtering":true
    }
    const algorithm = attribCfg.main.algorithm
    attribCheckboxMenuUpdate(algorithm)

}

var menu_editcellsAttrib = document.getElementsByName("menu_selection_attrib")
for(let i=0; i<menu_editcellsAttrib.length; i++){
    menu_editcellsAttrib[i].addEventListener("change", createMenuAttrib)
}

//clicking to activate
document.querySelector('input[name="menu_selection_attrib"][value="1"]').click()
document.querySelector('input[name="menu_selection_attrib"][value="0"]').click()

/**
 * A function to update the cell menu to edit its properties
 */
function createMenuAttrib(){
    if(debug){console.log("creating/updating the Attribution menu ...")}
    var menu_choice = document.querySelector('input[name="menu_selection_attrib"]:checked').value
    
    var html_menu = document.getElementById("menu_attrib").parentNode
    d3.select("#menu_attrib").remove()

    var new_menu = document.createElement("div");
    var table = document.createElement("table");
    var lines= [];
    for(let i=0; i<7; i++){
        column = document.createElement("tr")
        lines[i] = document.createElement("td")
        column.appendChild(lines[i])
        table.appendChild(column)
    };
    
    //creates the cell type options
    lines[0].innerHTML = "Parameters of attribution";
    new_menu.id = "menu_attrib";
    new_menu.addEventListener("change", updateMenuAttrib)
    new_menu.dataset.value = menu_choice;
    new_menu.appendChild(table)
    html_menu.appendChild(new_menu)

    //creation of specific menus
    if(menu_choice == 0){
        lines[0].innerHTML = "Remove Isotopes from list"
        
        var buttonCustomIso = document.createElement("button")
        buttonCustomIso.innerHTML = "Choose elements"
        lines[2].appendChild(buttonCustomIso)
        buttonCustomIso.addEventListener("click",function(){buttonPressedChooseIsotopes(attribCfg.isotope.list)})

        lines[3].innerHTML = "Isotope tagging tolerance (mDa):"
        let isoTol = menuCreate_inputNumber(lines[3], "isoTol", attribCfg.isotope.mDaTol)
        isoTol.setAttribute("title","The mDa tolerance for validating a mass difference as an isotopic difference")
    }else if(menu_choice == 1){
        lines[0].innerHTML = "First step: look for seeds"
        
        var buttonSeeds = document.createElement("button")
        buttonSeeds.innerHTML = "Edit seeds list"
        lines[2].appendChild(buttonSeeds)
        buttonSeeds.addEventListener("click",function(){
            new Popup_editSeeds("editSeeds",attribPasses.seeds)
        })

        lines[6].innerHTML = "Attribution tolerance is the same as passes"
    }else if(menu_choice == 2){
        lines[0].innerHTML = ""
        let networkOptions = [{name:"Supervized Network",value:"direct"},{name:"Unsupervized Network",value:"undirect"}]
        let networkTypeSelecter = menuCreate_select(null, "networkType", attribCfg.checks.networkType, networkOptions)
        lines[0].appendChild(networkTypeSelecter)
        networkTypeSelecter.value = attribCfg.checks.networkType
        createSubMenuAttrib_network(lines, attribCfg.checks.networkType)
        networkTypeSelecter.addEventListener("change", function(){
            attribCfg.checks.networkType = networkTypeSelecter.value 
            if(attribCfg.checks.network){
                 attribCfg.main.algorithm = (attribCfg.checks.networkType =="direct")?"dNetwork":"uNetwork"
                 document.querySelector("select[name='attribAlgorithm']").value = attribCfg.main.algorithm
                }
            createMenuAttrib()
        })
    }else if(menu_choice == 3){
        lines[0].innerHTML = "Parameters of attribution"

        lines[6].innerHTML = "Tolerance of attribution (ppm): "
        if(!attribCfg.ppm.variable){
            var inputAttrib = menuCreate_inputNumber(lines[6], "attributionError", attribCfg.ppm.attribution)
        }else{lines[6].innerHTML += "VARIABLE"}

        lines[1].innerHTML = "Charge: "
        let optionsCharge = [
            {name:"+1",value:"1"},
            {name:"0",value:"0"},
            {name:"-1",value:"-1"}
        ]
        let selectCharge = menuCreate_select(lines[1], "selectCharge", attribCfg.main.charge, optionsCharge)

        lines[2].innerHTML += "Ion type(default):"
        let optionsType = [
            {name:"Only radicals",value:"radical"},
            {name:"No radicals",value:"adduct"},
            {name:"All types",value:"both"}
        ]
        var selectIonType = menuCreate_select(lines[2], "selectIonType", attribCfg.goldenRules.ionTypeAllowed, optionsType)
        selectIonType.setAttribute("name","selectIonType")

        //creates the pass selecter
        var passSelecter =document.createElement("select")
        passSelecter.setAttribute("name","passSelecter")
        var passOptions = []
        for(let i=0; i<attribPasses.deNovo.length; i++){
            passOptions[i] = document.createElement("option")
            passOptions[i].setAttribute("value",i)
            if(!attribPasses.deNovoNames){attribPasses.deNovoNames=[]}//compatibility problems
            if(attribPasses.deNovoNames[i] && attribPasses.deNovoNames[i] !=""){
                passOptions[i].innerHTML = "Pass "+attribPasses.deNovoNames[i]
            }else{
                passOptions[i].innerHTML = "Pass n°"+(i+1)
            }
            passSelecter.appendChild(passOptions[i])
        }
        lines[3].appendChild(passSelecter)

        var buttonEditPass = document.createElement("button")
        buttonEditPass.setAttribute("name","editPass")
        buttonEditPass.innerHTML = "EDIT PASS"
        lines[3].appendChild(buttonEditPass)

        var addPassButton = document.createElement("button")
        addPassButton.setAttribute("name","addPassButton")
        addPassButton.innerHTML = "ADD"
        lines[4].appendChild(addPassButton)
        lines[4].innerHTML += "  "
        var removePassButton = document.createElement("button")
        removePassButton.setAttribute("name","removePassButton")
        removePassButton.innerHTML = " DEL "
        lines[4].appendChild(removePassButton)

        //creates the optional golden rules
        var overRules = document.createElement("button")
        overRules.setAttribute("name","overRules")
        overRules.innerHTML = "Override default filters"
        lines[3].innerHTML += "  "
        lines[3].appendChild(overRules)
        overRules.addEventListener("click",function(){
            var chosenPass = document.querySelector("select[name='passSelecter']").value
            editPassGoldenRules(attribPasses.specialGoldenRules[chosenPass], true)
        })

        //adds functionality to line 4 buttons
        lines[3].querySelector("button[name='editPass']").addEventListener("click",function(){
            var chosenPass = document.querySelector("select[name='passSelecter']").value
            buttonPressedCustomizePass(attribPasses.deNovo[chosenPass],chosenPass, true)
        })


        table.querySelector("button[name='addPassButton']").addEventListener("click",function(){
            attribPasses.deNovo.push([{"name":"","count":[]}])
            attribPasses.mzMax[attribPasses.deNovo.length-1] = -1
            //clone current golden rules
            var clone = JSON.parse(JSON.stringify(attribCfg.goldenRules));
            clone.override = false;
            attribPasses.specialGoldenRules.push(clone)
            createMenuAttrib()
        })
        table.querySelector("button[name='removePassButton']").addEventListener("click",function(){
            attribPasses.deNovo.splice((attribPasses.deNovo.length-1),1)
            attribPasses.specialGoldenRules.splice((attribPasses.specialGoldenRules.length-1),1)
            createMenuAttrib()
        })

        table.querySelector("select[name='selectCharge']").value = attribCfg.main.charge
        table.querySelector("select[name='selectIonType']").value = attribCfg.goldenRules.ionTypeAllowed
    }else if(menu_choice == 4){
        lines[0].innerHTML = "Filters for attribution"

        var buttonUseDBE = menuCreate_checkbox(lines[1], "useDBE", attribCfg.goldenRules.useDBE)
        lines[1].innerHTML += "DBE bounds:"
        let dbeMin = menuCreate_inputNumber(lines[1], "dbeMin", attribCfg.goldenRules.DBEBound[0])
        dbeMin.setAttribute("title","minimal tolerated DBE value")
        lines[1].innerHTML += "-"
        let dbeMax = menuCreate_inputNumber(lines[1], "dbeMax", attribCfg.goldenRules.DBEBound[1])
        dbeMax.setAttribute("title","maximal tolerated DBE value")

        var buttonUseHC = menuCreate_checkbox(lines[2], "useHC", attribCfg.goldenRules.useHCratio)
        lines[2].innerHTML += "H/C bounds:"
        var HCMin = menuCreate_inputNumber(lines[2], "HCMin", attribCfg.goldenRules.HCratioBound[0])
        HCMin.setAttribute("title","minimal H/C ratio value")
        lines[2].innerHTML += "-"
        var HCMax = menuCreate_inputNumber(lines[2], "HCMax", attribCfg.goldenRules.HCratioBound[1])
        lines[2].appendChild(HCMax)
        HCMin.setAttribute("title","maximal H/C ratio value")

        
        var buttonUseRatio = menuCreate_checkbox(lines[3], "useRatio", attribCfg.goldenRules.useHeteroRatio)
        lines[3].innerHTML += "Heteroatoms bounds:"
        var customizeHeteroRatio = document.createElement("button")
        customizeHeteroRatio.innerHTML = "Customize"
        lines[3].appendChild(customizeHeteroRatio)
        customizeHeteroRatio.addEventListener("click",function(){buttonPressedCustomizeHeteroRatioBounds(attribCfg.goldenRules.heteroRatiosBound)})

        var buttonUseKMD = menuCreate_checkbox(lines[4], "useKMD", attribCfg.goldenRules.useKMD)
        lines[4].innerHTML += "KMD ("
        var KMDru = menuCreate_inputText(lines[4], "KMDru", attribCfg.goldenRules.KMDru)
        KMDru.setAttribute("title","Uses a modified KMD to filter out peaks. Enter here the molecular formula of the modified repeat unit")
        lines[4].innerHTML += ") bounds:"
        var KMDMin = menuCreate_inputNumber(lines[4], "KMDMin", attribCfg.goldenRules.KMDBounds[0])
        KMDMin.setAttribute("title","minimal valid KMD value")
        lines[4].innerHTML += "-"
        var KMDMax = menuCreate_inputNumber(lines[4], "KMDMax", attribCfg.goldenRules.KMDBounds[1])
        KMDMax.setAttribute("title","maximal valid KMD value")

        var buttonUseThresh = menuCreate_checkbox(lines[5], "useThreshold", attribCfg.goldenRules.useThreshold)
        buttonUseThresh.setAttribute("type","checkbox")
        buttonUseThresh.setAttribute("name","useThreshold")
        lines[5].appendChild(buttonUseThresh)
        lines[5].innerHTML += "Elements combinations limits:"
        var customizeThresholds = document.createElement("button")
        customizeThresholds.innerHTML = "Customize"
        lines[5].appendChild(customizeThresholds)
        customizeThresholds.addEventListener("click",function(){buttonPressedCustomizeElementsThresholds(attribCfg.goldenRules.thresholdRules)})

        table.querySelector("input[name='useDBE']").checked = attribCfg.goldenRules.useDBE
        table.querySelector("input[name='useHC']").checked = attribCfg.goldenRules.useHCratio
        table.querySelector("input[name='useRatio']").checked = attribCfg.goldenRules.useHeteroRatio
        table.querySelector("input[name='useKMD']").checked = attribCfg.goldenRules.useKMD
        table.querySelector("input[name='useThreshold']").checked = attribCfg.goldenRules.useThreshold

    }else if(menu_choice == 5){
        lines[0].innerHTML  = "Post-attributions operations"

        let noNetworkCheckbox = menuCreate_checkbox(lines[1],"removeIfNoNetwork",attribCfg.main.removeIfNoNetwork)
        if(!attribCfg.checks.network){noNetworkCheckbox.disabled = true}
        lines[1].innerHTML += "Remove peaks without network connections"


        menuCreate_checkbox(lines[2], "searchAdducts", attribCfg.adducts.search)
        lines[2].innerHTML += "Try to find adduct formula : "
        var editAdducts = document.createElement("button")
        editAdducts.setAttribute("name", "customAdducts")
        editAdducts.innerHTML = "Adducts list"
        lines[2].appendChild(editAdducts)
        menuCreate_checkbox(lines[3],"computeAfter",attribCfg.adducts.computeFrom)
        lines[3].innerHTML += "compute #H,#O... after adduct removal"
        menuCreate_checkbox(lines[4],"fuseAdducts",attribCfg.adducts.fuse)
        lines[4].innerHTML += "Fuse different adducts of same molecule"


        var editMatrixOrder = document.createElement("button")
        editMatrixOrder.setAttribute("name", "CustomMatrixOrderAttrib")
        editMatrixOrder.innerHTML = "Customize output table columns"
        lines[5].appendChild(editMatrixOrder)

        editAdducts.addEventListener("click", function(){popupChangeAdducts(attribCfg.adducts.list)})
        editMatrixOrder.addEventListener("click", function(){popupCustomTableOrderAttrib(attribCfg.writtenOrder) })
    }else if(menu_choice == 6){
        lines[0].innerHTML = "Logging results"

        var logIsotopicPeaks = document.createElement("button")
        logIsotopicPeaks.innerHTML = "Log isotopic attributions"
        lines[1].appendChild(logIsotopicPeaks)
        logIsotopicPeaks.addEventListener("click",function(){logIsotopicAttribButtonPressed() })

        let buttonExport = document.createElement("button")
        buttonExport.innerHTML = "Export Network"
        buttonExport.addEventListener("click",(d,n)=>{
            new Popup_exportNetwork(attribData.network, true)
        })
        lines[3].appendChild(buttonExport)

        var logAttributedDeltas = document.createElement("button")
        logAttributedDeltas.innerHTML = "Log all deltas"
        lines[5].appendChild(logAttributedDeltas)
        let span5 = document.createElement("span")
        span5.innerHTML = "  "
        lines[5].appendChild(span5)
        logAttributedDeltas.addEventListener("click",function(){logDeltasPressed() })

        var logDirectedDeltas = document.createElement("button")
        logDirectedDeltas.innerHTML = "Log deltas summary"
        lines[5].appendChild(logDirectedDeltas)
        logDirectedDeltas.addEventListener("click",function(){logDeltasSummary() })

        var logAttributedData = document.createElement("button")
        logAttributedData.innerHTML = "Log attributions"
        lines[6].appendChild(logAttributedData)
        let span = document.createElement("span")
        span.innerHTML = "  "
        lines[6].appendChild(span)
        logAttributedData.addEventListener("click",function(){logAttributions() })

        var logAttributedDataSus = document.createElement("button")
        logAttributedDataSus.innerHTML = "Log suspect results"
        lines[6].appendChild(logAttributedDataSus)
        logAttributedDataSus.addEventListener("click",function(){logAttributionsSus() })
    }
}


function updateMenuAttrib(){
    if(debug){console.log("detecting a change in the attribution menu. Updating.")}
    var table = this.children[0]
    var tableRows = []
    for(let i=0; i<table.children.length; i++){
        tableRows[i]=table.children[i].children[0]
    }
    var menuNum = this.dataset.value
    if(menuNum == 0){
        attribCfg.isotope.mDaTol = parseFloat(table.querySelector('input[name="isoTol"]').value)
    }else if(menuNum == 2){
        attribCfg.directNetwork.explorationMethod = table.querySelector('select[name="explorationMethod"]').value
        attribCfg.ppm.network = parseFloat(table.querySelector('input[name="networkAttrib"]').value)
        if(attribCfg.checks.networkType == "direct"){
            attribCfg.directNetwork.mDaTol = parseFloat(table.querySelector('input[name="delta"]').value)
        }else if(attribCfg.checks.networkType == "undirect"){
            if(!table.querySelector('input[name="deltaAttrib"]')){return;}
            attribCfg.ppm.delta = parseFloat(table.querySelector('input[name="delta"]').value)
            attribCfg.ppm.deltaAttrib = parseFloat(table.querySelector('input[name="deltaAttrib"]').value)
            attribCfg.delta.bounds[0] = parseFloat(table.querySelector('input[name="deltaMin"]').value)
            attribCfg.delta.bounds[1] = parseFloat(table.querySelector('input[name="deltaMax"]').value)
            attribCfg.delta.toKeep = parseFloat(table.querySelector('input[name="deltasKeepNb"]').value)
        }
    
    }else if(menuNum == 3){
        attribCfg.main.charge = table.querySelector("select[name='selectCharge']").value
        attribCfg.goldenRules.ionTypeAllowed = table.querySelector("select[name='selectIonType']").value
        //changes the charge of the passes based on this input
        let passSelected = table.querySelector("select[name='passSelecter']").value
        for(let i=0; i<attribPasses.deNovo.length; i++){
            setPassCharge(attribPasses.deNovo[i], attribCfg.main.charge)
        }
        attribCfg.ppm.attribution = parseFloat(table.querySelector('input[name="attributionError"]').value)

    }else if(menuNum == 4){
        attribCfg.goldenRules.useDBE = table.querySelector('input[name="useDBE"]').checked
        attribCfg.goldenRules.useHCratio = table.querySelector('input[name="useHC"]').checked
        attribCfg.goldenRules.useHeteroRatio = table.querySelector('input[name="useRatio"]').checked
        attribCfg.goldenRules.useKMD = table.querySelector('input[name="useKMD"]').checked
        attribCfg.goldenRules.useThreshold = table.querySelector('input[name="useThreshold"]').checked

        attribCfg.goldenRules.DBEBound[0] = parseFloat(table.querySelector('input[name="dbeMin"]').value)
        attribCfg.goldenRules.DBEBound[1] = parseFloat(table.querySelector('input[name="dbeMax"]').value)
        attribCfg.goldenRules.HCratioBound[0] = parseFloat(table.querySelector('input[name="HCMin"]').value)
        attribCfg.goldenRules.HCratioBound[1] = parseFloat(table.querySelector('input[name="HCMax"]').value)
        attribCfg.goldenRules.KMDBounds[0] = parseFloat(table.querySelector('input[name="KMDMin"]').value)
        attribCfg.goldenRules.KMDBounds[1] = parseFloat(table.querySelector('input[name="KMDMax"]').value)
        attribCfg.goldenRules.KMDru = table.querySelector('input[name="KMDru"]').value

    }else if(menuNum ==5){
        attribCfg.main.removeIfNoNetwork = table.querySelector('input[name="removeIfNoNetwork"]').checked
        attribCfg.adducts.search = table.querySelector('input[name="searchAdducts"]').checked
        attribCfg.adducts.fuse = table.querySelector('input[name="fuseAdducts"]').checked
        //must check the compute from old value if fuse is checked
        if(attribCfg.adducts.fuse){
            table.querySelector('input[name="computeAfter"]').checked = true;
        }  
        let computeFromOldValue = attribCfg.adducts.computeFrom
        attribCfg.adducts.computeFrom = table.querySelector('input[name="computeAfter"]').checked
        if(computeFromOldValue != attribCfg.adducts.computeFrom){ //updates the output table if this is changed
            let results = attrib.retreatAttributions()
            attribData.matrix = attrib.writeDataMatrix(results.attributed, results.unattributed)
        }
    }
    
    var update="";
    attribCheckboxMenuUpdate()
}

function createSubMenuAttrib_network(lines, networkType){
    if(networkType == "direct"){
        lines[1].innerHTML  ="Links tagging tolerance (mDa): "
        let inputDelta = menuCreate_inputNumber(lines[1],"delta",attribCfg.directNetwork.mDaTol)
        inputDelta.setAttribute("title","The tolerance between theoretical and measured mass for any mass difference")
        var buttonDnetworkUnits = document.createElement("button")
        buttonDnetworkUnits.setAttribute("name","customizeUnits")
        buttonDnetworkUnits.innerHTML = "Customize directed network units"
        lines[2].appendChild(buttonDnetworkUnits)
        buttonDnetworkUnits.addEventListener("click",function(){buttonPressedCustomizePeakDB(attribCfg.directNetwork.list)})
    }else if(networkType == "undirect"){
        lines[1].innerHTML  ="Deltas grouping tolerance(mDa): "
        let inputDelta = menuCreate_inputNumber(lines[1],"delta",attribCfg.ppm.delta)
        inputDelta.setAttribute("title","The tolerance to fuse mass deltas together as a single group for later attribution")
        lines[2].innerHTML="Bounds(Da):"

        var inputminDelta = document.createElement("input")
        inputminDelta.setAttribute("type","number")
        inputminDelta.setAttribute("name","deltaMin")
        inputminDelta.setAttribute("value", attribCfg.delta.bounds[0])
        inputminDelta.style.width = "50px"
        inputminDelta.setAttribute("title","Minimal mass difference delta to look for")

        lines[2].appendChild(inputminDelta)
        lines[2].innerHTML += "-"
        var inputmaxDelta = document.createElement("input")
        inputmaxDelta.setAttribute("type","number")
        inputmaxDelta.setAttribute("name","deltaMax")
        inputmaxDelta.setAttribute("value", attribCfg.delta.bounds[1])
        inputmaxDelta.style.width = "50px"
        inputmaxDelta.setAttribute("title","Maximal mass difference delta to look for")
        lines[2].appendChild(inputmaxDelta)
        lines[2].innerHTML+="  Keep:"

        var inputDeltasKeepNb = document.createElement("input")
        inputDeltasKeepNb.setAttribute("type","number")
        inputDeltasKeepNb.setAttribute("name","deltasKeepNb")
        inputDeltasKeepNb.setAttribute("value", attribCfg.delta.toKeep)
        lines[2].appendChild(inputDeltasKeepNb)
        inputDeltasKeepNb.setAttribute("title","How many deltas are kept for attributions. Keeps the most frequent ones")

        lines[4].innerHTML = "Delta attribution tolerance (mDa):"
        var inputAttribDelta = menuCreate_inputNumber(lines[4],"deltaAttrib",attribCfg.ppm.deltaAttrib)
        inputAttribDelta.setAttribute("title","The tolerance for attributing one of the kept delta group that will be used as a pattern in the network")

        var buttonDeltaDB = document.createElement("button")
        buttonDeltaDB.setAttribute("name","customDB")
        buttonDeltaDB.innerHTML = "Custom attrib. DB"
        lines[3].appendChild(buttonDeltaDB)
        lines[3].innerHTML +="  "

        var buttonDeltaPass = document.createElement("button")
        buttonDeltaPass.innerHTML = "Custom attrib. pass"
        lines[3].appendChild(buttonDeltaPass)
        lines[3].querySelector("button[name='customDB']").addEventListener("click",function(){buttonPressedCustomizePeakDB(attribCfg.delta.keepList)})
        buttonDeltaPass.addEventListener("click",function(){buttonPressedCustomizePass(attribPasses.delta, false)})
    }else{
        lines[1]="Please select a network type above"
        return;
    }
    lines[5].innerHTML += "Network exploration tactic:"
    let optionsType = [
        {name:"BFS",value:"BFS"},
        {name:"DFS",value:"DFS"},
        {name:"EEFS",value:"EEFS"},
        {name:"ENFS",value:"ENFS"}
    ]
    var selectIonType = menuCreate_select(lines[5], "selectIonType", attribCfg.directNetwork.explorationMethod, optionsType)
    selectIonType.setAttribute("name","explorationMethod")
    selectIonType.setAttribute("title","method to choose priority network links to explore: BFS: Broadth First Search, DFS: Depth... EEFS: Edge Error... ENFS: Edge Name...")
    lines[6].innerHTML = "Tolerance of network attribution (ppm): "
    if(!attribCfg.ppm.variable){
    var inputNetworkAttrib = menuCreate_inputNumber(lines[6], "networkAttrib",attribCfg.ppm.network)
    inputNetworkAttrib.setAttribute("title","The tolerance for attributions found through network connexions")
    }else{lines[6].innerHTML += "VARIABLE"}
}

//updates the main table except the preset algorithm, which is treated on its own below
document.querySelector("div[name='mainMenuAttrib']").addEventListener("change",updateMainMenuAttrib)

function updateMainMenuAttrib(){
    if(debug){console.log("detecting a change in the attribution main menu. Updating.")}
    var table = this.children[0]
    attribCfg.main.fileString = table.querySelector("select[name='fileSelection']").value
    createMenuAttrib()
}


setMainMenuAttrib()
function setMainMenuAttrib(){
    if(attribCfg.main.algorithm == "deltas"){attribCfg.main.algorithm = "uNetwork"}//rename of variable for compatibility
    var table = document.querySelector("div[name='mainMenuAttrib']")
    table.querySelector("select[name='fileSelection']").value = attribCfg.main.fileString
    table.querySelector("select[name='attribAlgorithm']").value = attribCfg.main.algorithm || "uNetwork"
    attribCheckboxMenuUpdate()
}

//treats the preset algorithm
document.querySelector("select[name='attribAlgorithm']").addEventListener("change",updatePresetAlgorithm)


function updatePresetAlgorithm(){
    let valueAlgorithm = this.value
    const isAlgorithmChanged = (valueAlgorithm == attribCfg.main.algorithm)?false:true
    if(isAlgorithmChanged){
        attribCfg.main.algorithm = valueAlgorithm
        if(attribCfg.main.algorithm == "dNetwork"){attribCfg.checks.networkType = "direct"}
        else if(attribCfg.main.algorithm == "uNetwork"){attribCfg.checks.networkType = "undirect"}
        attribCheckboxMenuUpdate(attribCfg.main.algorithm)
    }
}

/********************************************************************* */
/*                    POPUP SUB-MENUS                                  */
/********************************************************************* */

//////// FOR CUSTOMIZING PASSES //////////////

function buttonPressedCustomizePass(pass,passNum, askForMzMax){
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
    preText.innerHTML = "Edit the pass here <br>"
    popup_box.appendChild(preText)

    var htmlTable = document.createElement("table")
    htmlTable.setAttribute("class","popuptable")
    var elLine = []
    var elCells = []
    var elInputs = []
    //removes any mention of electron in the pass and re-adds it later
    for(let i=0; i<pass.length; i++){
        if(pass[i].name == "e" && pass[i].count[0] == pass[i].count[1]){
            pass.electronNb = pass[i].count[0]
            pass.splice(i,1)
        }
    }
    //if askformaxmz, creates an input for it and also asks for the name of the pass
    if(askForMzMax && passNum >=0){
        preText.innerHTML += "<br> Pass Name:"
        var passName = document.createElement("input")
        passName.setAttribute("name","passName")
        passName.setAttribute("type","text")
        passName.style.color = "black"
        passName.style.width = "200px"
        passName.setAttribute("value",attribPasses.deNovoNames[passNum] || "")
        preText.appendChild(passName)
        preText.innerHTML += "<br>"

        preText.innerHTML += "<br> mz Max:"
        var mzMax = document.createElement("input")
        mzMax.setAttribute("name","mzMax")
        mzMax.setAttribute("type","number")
        mzMax.style.color = "black"
        mzMax.setAttribute("value",attribPasses.mzMax[passNum])
        preText.appendChild(mzMax)
        preText.innerHTML += "<br><br>"
    }
    let buttonCopyPass = document.createElement("button")
    buttonCopyPass.setAttribute("name","copyPass")
    buttonCopyPass.innerHTML = "Copy this pass"
    preText.innerHTML +=" "
    preText.appendChild(buttonCopyPass)
    let buttonPastePass = document.createElement("button")
    buttonPastePass.setAttribute("name","pastePass")
    buttonPastePass.innerHTML = "Paste a pass"
    preText.innerHTML +=" "
    preText.appendChild(buttonPastePass)
    preText.innerHTML += "<br><br>"

    //creates a table for elements in the pass
    for(let i=0; i<pass.length+1; i++){
        elLine[i] = document.createElement("tr")
        elLine[i].setAttribute("name","divlink_"+i)
        elCells[i] = []
        for(let j=0; j<4; j++){
            elCells[i][j] = document.createElement("td")
            elLine[i].appendChild(elCells[i][j])
        }
        elCells[0][0].innerHTML= "Element"
        elCells[0][1].innerHTML= "min"
        elCells[0][2].innerHTML= "max"
        elCells[0][3].innerHTML= "DEL"
        htmlTable.appendChild(elLine[i])
    }
    //fills the table with data of elements from the pass
    for(let i=0; i<pass.length; i++){
        elInputs[i]=[]
        elInputs[i][0]= document.createElement("input")
        elInputs[i][0].setAttribute("type","text")
        elInputs[i][0].setAttribute("name","element")
        elInputs[i][0].setAttribute("value",pass[i].name)

        elInputs[i][1]= document.createElement("input")
        elInputs[i][1].setAttribute("type","number")
        elInputs[i][1].setAttribute("name","min")
        elInputs[i][1].setAttribute("value",pass[i].count[0])

        elInputs[i][2]= document.createElement("input")
        elInputs[i][2].setAttribute("type","number")
        elInputs[i][2].setAttribute("name","max")
        elInputs[i][2].setAttribute("value",pass[i].count[1])

        elInputs[i][3]= document.createElement("button")
        elInputs[i][3].setAttribute("name","deleteLink_"+i)
        elInputs[i][3].setAttribute("class","smallerpopupbutton")
        elInputs[i][3].addEventListener("click", function(){readPassPopupTable(htmlTable, pass,passNum, false);removeElementFromPassPopupTable(pass, passNum, askForMzMax, i)})
        elInputs[i][3].innerHTML = "DEL"

        elCells[i+1][0].appendChild(elInputs[i][0])
        elCells[i+1][1].appendChild(elInputs[i][1])
        elCells[i+1][2].appendChild(elInputs[i][2])
        elCells[i+1][3].appendChild(elInputs[i][3])
    }
    preText.appendChild(htmlTable)

    //adds the + button
    var addButton = document.createElement("button")
    addButton.setAttribute("name","addElButton")
    addButton.setAttribute("class","smallpopupbutton")
    addButton.addEventListener("click", function(){
        readPassPopupTable(htmlTable, pass,passNum, false);
        pass=lookupMassesfromElementsArray(pass);
        addElementToPassPopupTable(pass,passNum, askForMzMax);
    })
    addButton.innerHTML = "Save and add a new element"
    popup_box.appendChild(addButton)

    var separatorBox =document.createElement("div")
    popup_box.appendChild(separatorBox)
    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){
        readPassPopupTable(htmlTable, pass,passNum, true);
        pass=lookupMassesfromElementsArray(pass);
        closePopup(this);
        checkPassValidity(pass);
        if(passNum == -2){popupPass = pass}
    })
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)

    preText.querySelector("button[name='copyPass']").addEventListener("click",function(){
        readPassPopupTable(htmlTable, pass,passNum, false);
        closePopup(this.parentElement);
        buttonPressedCopyPass(pass)
        buttonPressedCustomizePass(pass,passNum, askForMzMax)
    })
    preText.querySelector("button[name='pastePass']").addEventListener("click",function(){
        var chosenPass = document.querySelector("select[name='passSelecter']")
        if(chosenPass){chosenPass = chosenPass.value}else{chosenPass = -1}
        if(passNum == -2){buttonPressedPopupPastePass(chosenPass)}
        else{buttonPressedPastePass(chosenPass)}
    })


    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_pass")
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}

function buttonPressedCopyPass(pass){
    let dataLine = ""
    for(let i=0; i<pass.length; i++){
        if(pass[i].name =="e"){continue;}
        dataLine += pass[i].name + '\t' + pass[i].count[0]+ '\t' + pass[i].count[1]
        dataLine += '\n'
     }
    navigator.clipboard.writeText(dataLine)
}

/** a function to generate a popup to paste a pass */
function buttonPressedPastePass(passNum){
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
     preText.innerHTML = "Paste here your pass. 1 line for every element<br>3 columns separated by tabs for: element name, min value and max value.<br><br>"
     popup_box.appendChild(preText)

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
     valButton.addEventListener("click", function(){readPastePass(passNum);closePopup(this);})
     valButton.innerHTML = "REPLACE CURRENT ATTRIBUTION PASS"
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
/** a function to read the popup created by buttonPressedPastePass */
function readPastePass(passNum){
    let popup = document.getElementsByName("popup_calib")[0]
    let pastedData  = popup.querySelector("textarea").value
    let parsedData = []
    let lbreak = pastedData.split(/\r?\n/);
    lbreak.forEach(res => {
        parsedData.push(res.split("\t"));
    });
    let pastedPass = []
    for(let i=0; i<parsedData.length; i++){
        let newObject = {}
        if(parsedData[i].length <3){continue;}
        newObject.name = parsedData[i][0]
        newObject.mass = new ChemFormula(newObject.name).mass
        newObject.count = [parseInt(parsedData[i][1]),parseInt(parsedData[i][2])]
        console.log(newObject)
        pastedPass.push(newObject)
    }
    if(passNum != -1){
        let chargeToAdd = attribPasses.deNovo[passNum].electronNb
        if(chargeToAdd != 0){
            let charge = {}
            charge.name ="e"
            charge.mass = elementsDatabase[0].mass //electron mass
            charge.count = [chargeToAdd, chargeToAdd]
            pastedPass.push(charge)
        }
        attribPasses.deNovo[passNum] = pastedPass
        attribPasses.deNovo[passNum].electronNb = chargeToAdd   
    }else{
        attribPasses.delta = pastedPass
    }

     //counts how many attributions could be made from this pass
    var possibilites = 0
    for(let i=0; i<pastedPass.length; i++){
        let thisPassPoss = (pastedPass[i].count[1] - pastedPass[i].count[0])+1
        if(possibilites ==0){possibilites = thisPassPoss}
        else if(thisPassPoss >0){possibilites *= thisPassPoss}
     }
    if(possibilites >4e6){
        alertPopup("Warning ! This pass contains more than 4 million possible combinations ("+possibilites+"). It could prove long to compute")
    }
    //tries to close the pass popup
    let passPopup = document.querySelector(".pass, div[name='popup_pass']")
    let passPopupChild1 = passPopup.querySelector("button")
    if(passPopupChild1){
        let passPopupChild2 = passPopupChild1.querySelector("button")
        if(passPopupChild2){
            closePopup(passPopupChild2)
            let chosenPassNum = document.querySelector("select[name='passSelecter']")
            if(chosenPassNum){chosenPassNum = chosenPassNum.value}
            if(chosenPassNum && chosenPassNum >=0){
                buttonPressedCustomizePass(attribPasses.deNovo[chosenPassNum],chosenPassNum, true)
            }else{
                buttonPressedCustomizePass(attribPasses.delta,false)
            }

        }
    }

    
}

/** a function to read and edit a popup table */
function readPassPopupTable(table, pass,passNum, warnOfPossibilites){
    //loops through tr
    for(let i=1; i<table.childNodes.length; i++){    
        //finds the elements
        let newEl = table.childNodes[i].querySelector("input[name='element']").value
        let newMin = parseInt(table.childNodes[i].querySelector("input[name='min']").value)
        let newMax = parseInt(table.childNodes[i].querySelector("input[name='max']").value)
        pass[i-1].name = newEl
        pass[i-1].count[0] = newMin
        pass[i-1].count[1] = newMax
    }
    //looks for a mz max
    let div = table.parentNode
    if(div.querySelector("input[name='mzMax']")){
        attribPasses.mzMax[passNum] = parseFloat(div.querySelector("input[name='mzMax']").value)
    }
    //looks for a pass name
    if(div.querySelector("input[name='passName']")){
        attribPasses.deNovoNames[passNum] = div.querySelector("input[name='passName']").value
    }
    //re-adds the charge if there is one
    if(pass.electronNb && pass.electronNb !=0){
        pass.push({"name":"e","count":[pass.electronNb,pass.electronNb]},)
    }
    //counts how many attributions could be made from this pass
    if(warnOfPossibilites){
        var possibilites = 0
        for(let i=0; i<pass.length; i++){
            let thisPassPoss = (pass[i].count[1] - pass[i].count[0])+1
            if(possibilites ==0){possibilites = thisPassPoss}
            else if(thisPassPoss >0){possibilites *= thisPassPoss}
        }
        if(possibilites >4e6){
            alertPopup("Warning ! This pass contains more than 4 million possible combinations ("+possibilites+"). It could prove long to compute")
        }
    }
    //refreshes the passes table
    createMenuAttrib()
}
 
function removeElementFromPassPopupTable(pass,passNum, askForMzMax, i){
    pass.splice(i,1)
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedCustomizePass(pass,passNum, askForMzMax)
}

function addElementToPassPopupTable(pass, passNum, askForMzMax){
    pass.push({"name":"",count:[0,1]})
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedCustomizePass(pass,passNum, askForMzMax)
}

//checks and corrects a pass for elements taking two slots, which shouldn't be possible
function checkPassValidity(pass){
    let elementsList = []
    for(let i=pass.length-1; i>=0; i--){
        for(let j=0; j<elementsList.length; j++){
            if(pass[i].name == elementsList[j] && i!=j){
                alertPopup("Duplicated elements in the pass. They are gonna be fused")
                pass[j].count[0] = Math.min(pass[j].count[0], pass[i].count[0])
                pass[j].count[1] = Math.max(pass[j].count[1], pass[i].count[1])
                pass.splice(i,1)
            }
        }
        elementsList[i] = pass[i].name
    }

}

//////// FOR CUSTOMIZING HETEROATOMS BOUNDS //////////////
function buttonPressedCustomizeHeteroRatioBounds(boundsList){
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
    preText.innerHTML = "Edit the ratio bounds here <br>"
    popup_box.appendChild(preText)
    
    var htmlTable = document.createElement("table")
    htmlTable.setAttribute("class","popuptable")
    var elLine = []
    var elCells = []
    var elInputs = []
    //creates a table for ratios bounds
    for(let i=0; i<boundsList.length+1; i++){
        elLine[i] = document.createElement("tr")
        elLine[i].setAttribute("name","divlink_"+i)
        elCells[i] = []
        for(let j=0; j<5; j++){
            elCells[i][j] = document.createElement("td")
            elLine[i].appendChild(elCells[i][j])
        }
        elCells[0][0].innerHTML= "Dividend"
        elCells[0][1].innerHTML= "Divisor"
        elCells[0][2].innerHTML= "min"
        elCells[0][3].innerHTML= "max"
        elCells[0][4].innerHTML= "DEL"
        htmlTable.appendChild(elLine[i])
    }
    //fills the table with data of elements from the ratios bounds
    for(let i=0; i<boundsList.length; i++){
        elInputs[i]=[]
        elInputs[i][0]= document.createElement("input")
        elInputs[i][0].setAttribute("type","text")
        elInputs[i][0].setAttribute("name","dividend")
        elInputs[i][0].setAttribute("value",boundsList[i].elements[0])

        elInputs[i][1]= document.createElement("input")
        elInputs[i][1].setAttribute("type","text")
        elInputs[i][1].setAttribute("name","divisor")
        elInputs[i][1].setAttribute("value",boundsList[i].elements[1])

        elInputs[i][2]= document.createElement("input")
        elInputs[i][2].setAttribute("type","number")
        elInputs[i][2].setAttribute("name","min")
        elInputs[i][2].setAttribute("value",boundsList[i].bounds[0])

        elInputs[i][3]= document.createElement("input")
        elInputs[i][3].setAttribute("type","number")
        elInputs[i][3].setAttribute("name","max")
        elInputs[i][3].setAttribute("value",boundsList[i].bounds[1])

        elInputs[i][4]= document.createElement("button")
        elInputs[i][4].setAttribute("name","deleteLink_"+i)
        elInputs[i][4].setAttribute("class","smallerpopupbutton")
        elInputs[i][4].addEventListener("click", function(){removeRatioFromBoundTable(boundsList, i)})
        elInputs[i][4].innerHTML = "DEL"

        elCells[i+1][0].appendChild(elInputs[i][0])
        elCells[i+1][1].appendChild(elInputs[i][1])
        elCells[i+1][2].appendChild(elInputs[i][2])
        elCells[i+1][3].appendChild(elInputs[i][3])
        elCells[i+1][4].appendChild(elInputs[i][4])
    }
    preText.appendChild(htmlTable)

    //adds the + button
    var addButton = document.createElement("button")
    addButton.setAttribute("name","addElButton")
    addButton.setAttribute("class","smallpopupbutton")
    addButton.addEventListener("click", function(){readHeteroRatioBoundTable(htmlTable, boundsList);addRatioToBoundTable(boundsList);})
    addButton.innerHTML = "Save and add a ratio"
    popup_box.appendChild(addButton)
    var separatorBox =document.createElement("div")
    popup_box.appendChild(separatorBox)
    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){ readHeteroRatioBoundTable(htmlTable, boundsList);closePopup(this);})
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_"+name)
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}

/** a function to read and edit a popup table of hetero ratio */
function readHeteroRatioBoundTable(table, boundsList){
    //loops through tr
    for(let i=1; i<table.childNodes.length; i++){    
        //finds the elements
        let newDividend = table.childNodes[i].querySelector("input[name='dividend']").value
        let newDivisor = table.childNodes[i].querySelector("input[name='divisor']").value
        let newMin = table.childNodes[i].querySelector("input[name='min']").value
        let newMax = table.childNodes[i].querySelector("input[name='max']").value
        boundsList[i-1].elements[0] = newDividend
        boundsList[i-1].elements[1] = newDivisor
        boundsList[i-1].bounds[0] = newMin
        boundsList[i-1].bounds[1] = newMax
    }
}
function removeRatioFromBoundTable(boundList, i){
    boundList.splice(i,1)
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedCustomizeHeteroRatioBounds(boundList)
}
function addRatioToBoundTable(boundList){
    boundList.push({"elements":["",""],"bounds":[0,1]})
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedCustomizeHeteroRatioBounds(boundList)
}


//////// FOR CUSTOMIZING DATABASES//////////////
function buttonPressedCustomizePeakDB(database){
    if(debug){console.log(database)}
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
    preText.innerHTML = "Edit the database here <br>"
    popup_box.appendChild(preText)
    
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
        elInputs[i][2].addEventListener("click", function(){removeEntryFromPeakDBTable(database, i)})
        elInputs[i][2].innerHTML = "DEL"

        elCells[i+1][0].appendChild(elInputs[i][0])
        elCells[i+1][1].appendChild(elInputs[i][1])
        elCells[i+1][2].appendChild(elInputs[i][2])
    }
    preText.appendChild(htmlTable)
    htmlTable.addEventListener("change", function(){readPeakDBTable(htmlTable, database, true)})

    //adds the + button
    var addButton = document.createElement("button")
    addButton.setAttribute("name","addElButton")
    addButton.setAttribute("class","smallpopupbutton")
    addButton.addEventListener("click", function(){readPeakDBTable(htmlTable, database, false);addPeakToDBTable(database);})
    addButton.innerHTML = "Save and add a mass"
    popup_box.appendChild(addButton)
    var separatorBox =document.createElement("div")
    popup_box.appendChild(separatorBox)
    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){ readPeakDBTable(htmlTable, database, false);closePopup(this);})
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_"+name)
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}
/** a function to read and edit a popup table of a database peak */
function readPeakDBTable(table, database, updateVisualTable){
    //loops through tr
    for(let i=1; i<table.childNodes.length; i++){    
        //finds the elements
        let newFormula = table.childNodes[i].querySelector("input[name='formula']").value
        let newMass = table.childNodes[i].querySelector("input[name='mass']").value
        //if it is the formula that is changed, updates the mass
        if(newFormula != database[i-1].formula){
            let newFormulaObject = new ChemFormula(newFormula)
            newMass = newFormulaObject.mass
        }
        database[i-1].formula = newFormula
        database[i-1].mass = newMass
    }
    if(updateVisualTable &&  document.querySelector("button[class='popuptrueclose']")){
        document.querySelector("button[class='popuptrueclose']").click()
        buttonPressedCustomizePeakDB(database)
    }
}
function removeEntryFromPeakDBTable(database, i){
    database.splice(i,1)
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedCustomizePeakDB(database)
}
function addPeakToDBTable(database, i){
    database.push({"formula":"","mass":0})
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedCustomizePeakDB(database)
}
////////////////////// FOR CUSTOMIZING A LIST (ADDUCTS BUT COULD BE USED FOR ANY STRING)//////
function popupChangeAdducts(list){
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
    preText.innerHTML = "Edit the adducts here <br>"
    preText.innerHTML +="The first one will try to be substracted <br>"
    preText.innerHTML +="If not compatible, the next one will be tried<br>"
    preText.innerHTML +="<br> The elements must appear in at least one of the attribution passes <br>"
    popup_box.appendChild(preText)
    
    var htmlTable = document.createElement("table")
    htmlTable.setAttribute("class","popuptable")
    var elLine = []
    var elCells = []
    var elInputs = []
    //creates a table for ratios bounds
    for(let i=0; i<list.length+1; i++){
        elLine[i] = document.createElement("tr")
        elLine[i].setAttribute("name","divlink_"+i)
        elCells[i] = []
        for(let j=0; j<2; j++){
            elCells[i][j] = document.createElement("td")
            elLine[i].appendChild(elCells[i][j])
        }
        elCells[0][0].innerHTML= "Formula"
        elCells[0][1].innerHTML= "DEL"
        htmlTable.appendChild(elLine[i])
    }
    //fills the table with data of elements from the ratios bounds
    for(let i=0; i<list.length; i++){
        elInputs[i]=[]
        elInputs[i][0]= document.createElement("input")
        elInputs[i][0].setAttribute("type","text")
        elInputs[i][0].setAttribute("name","formula")
        elInputs[i][0].style.width = "500px"
        elInputs[i][0].setAttribute("value",list[i])

        elInputs[i][1]= document.createElement("button")
        elInputs[i][1].setAttribute("name","deleteLink_"+i)
        elInputs[i][1].setAttribute("class","smallerpopupbutton")
        elInputs[i][1].addEventListener("click", function(){removeEntryFromAdducts(list, i)})
        elInputs[i][1].innerHTML = "DEL"

        elCells[i+1][0].appendChild(elInputs[i][0])
        elCells[i+1][1].appendChild(elInputs[i][1])
    }
    preText.appendChild(htmlTable)
    htmlTable.addEventListener("change", function(){readAdductsTable(htmlTable, list, true)})

    //adds the + button
    var addButton = document.createElement("button")
    addButton.setAttribute("name","addElButton")
    addButton.setAttribute("class","smallpopupbutton")
    addButton.addEventListener("click", function(){readAdductsTable(htmlTable, list, false);addAdductToList(list);})
    addButton.innerHTML = "Save and add an adduct"
    popup_box.appendChild(addButton)
    var separatorBox =document.createElement("div")
    popup_box.appendChild(separatorBox)
    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){readAdductsTable(htmlTable, list, false);closePopup(this);})
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_"+name)
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}

/** a function to read and edit a popup table of a database peak */
function readAdductsTable(table, list, updateVisualTable){
    //loops through tr
    for(let i=1; i<table.childNodes.length; i++){    
        //finds the elements
        let newFormula = table.childNodes[i].querySelector("input[name='formula']").value
        //if it is the formula that is changed, updates the mass
        list[i-1] = newFormula
    }
    if(updateVisualTable &&  document.querySelector("button[class='popuptrueclose']")){
        document.querySelector("button[class='popuptrueclose']").click()
        popupChangeAdducts(list)
    }
}
function removeEntryFromAdducts(list, i){
    list.splice(i,1)
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    popupChangeAdducts(list)
}
function addAdductToList(list, i){
    list.push("")
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    popupChangeAdducts(list)
}



//////// FOR CUSTOMIZING ELEMENTS THRESHOLDS COMBINATIONS//////////////
function buttonPressedCustomizeElementsThresholds(thresholdRules){
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
    preText.innerHTML = "Edit the elements thresholds here. Separate values by semicolons<br>"
    preText.innerHTML += "If all elements from the list exceed the threshold limits, starts to check their max value <br>"
    popup_box.appendChild(preText)
    
    var htmlTable = document.createElement("table")
    htmlTable.setAttribute("class","popuptable")
    var elLine = []
    var elCells = []
    var elInputs = []
    //creates a table for ratios bounds
    for(let i=0; i<thresholdRules.length+1; i++){
        elLine[i] = document.createElement("tr")
        elLine[i].setAttribute("name","divlink_"+i)
        elCells[i] = []
        for(let j=0; j<4; j++){
            elCells[i][j] = document.createElement("td")
            elLine[i].appendChild(elCells[i][j])
        }
        elCells[0][0].innerHTML= "Elements list"
        elCells[0][1].innerHTML= "Threshold"
        elCells[0][2].innerHTML= "Maximum list"
        elCells[0][3].innerHTML= "DEL"
        htmlTable.appendChild(elLine[i])
    }
    //fills the table with data of elements from the ratios bounds
    for(let i=0; i<thresholdRules.length; i++){
        //prepares text for elements
        let textEl =""
        let textMax = ""
        for(let j=0; j<thresholdRules[i].elements.length; j++){
            textEl += thresholdRules[i].elements[j]
            if(j+1<thresholdRules[i].elements.length){textEl += ";"}
        }
        for(let j=0; j<thresholdRules[i].max.length; j++){
            textMax += parseInt(thresholdRules[i].max[j])
            if(j+1<thresholdRules[i].max.length){textMax += ";"}
        }

        elInputs[i]=[]
        elInputs[i][0]= document.createElement("input")
        elInputs[i][0].setAttribute("type","text")
        elInputs[i][0].setAttribute("name","elements")
        elInputs[i][0].style.width = "100px"
        elInputs[i][0].setAttribute("value",textEl)

        elInputs[i][1]= document.createElement("input")
        elInputs[i][1].setAttribute("type","number")
        elInputs[i][1].setAttribute("name","threshold")
        elInputs[i][1].style.width = "100px"
        elInputs[i][1].setAttribute("value",thresholdRules[i].threshold)

        elInputs[i][2]= document.createElement("input")
        elInputs[i][2].setAttribute("type","text")
        elInputs[i][2].style.width = "100px"
        elInputs[i][2].setAttribute("name","max")
        elInputs[i][2].setAttribute("value",textMax)

        elInputs[i][3]= document.createElement("button")
        elInputs[i][3].setAttribute("name","deleteLink_"+i)
        elInputs[i][3].setAttribute("class","smallerpopupbutton")
        elInputs[i][3].addEventListener("click", function(){removeThresholdLimitTable(thresholdRules, i)})
        elInputs[i][3].innerHTML = "DEL"

        elCells[i+1][0].appendChild(elInputs[i][0])
        elCells[i+1][1].appendChild(elInputs[i][1])
        elCells[i+1][2].appendChild(elInputs[i][2])
        elCells[i+1][3].appendChild(elInputs[i][3])
    }
    preText.appendChild(htmlTable)

    //adds the + button
    var addButton = document.createElement("button")
    addButton.setAttribute("name","addElButton")
    addButton.setAttribute("class","smallpopupbutton")
    addButton.addEventListener("click", function(){readThresholdRulesTable(htmlTable, thresholdRules);addThresholdLimitToTable(thresholdRules);})
    addButton.innerHTML = "Save and add a threshold"
    popup_box.appendChild(addButton)
    var separatorBox =document.createElement("div")
    popup_box.appendChild(separatorBox)
    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){ readThresholdRulesTable(htmlTable, thresholdRules);closePopup(this);})
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_"+name)
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}
/** a function to read and edit a threshold table limit */
function readThresholdRulesTable(table, thresholdRules){
    //loops through tr
    for(let i=1; i<table.childNodes.length; i++){    
        //finds the elements
        let newThreshold = table.childNodes[i].querySelector("input[name='threshold']").value
        let newElements = table.childNodes[i].querySelector("input[name='elements']").value.split(";")
        let newMax = table.childNodes[i].querySelector("input[name='max']").value.split(";")
        thresholdRules[i-1].threshold = newThreshold
        thresholdRules[i-1].elements = newElements
        thresholdRules[i-1].max = newMax
    }
}
function removeThresholdLimitTable(thresholdRules, i){
    thresholdRules.splice(i,1)
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedCustomizeElementsThresholds(thresholdRules)
}
function addThresholdLimitToTable(thresholdRules, i){
    thresholdRules.push({"elements":[],"threshold":1,"max":[]})
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedCustomizeElementsThresholds(thresholdRules)
}


////FOR EDITING SPECIAL PASS GOLDEN RULES
function editPassGoldenRules(chosenRules, showOverride){
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
    popup_box.appendChild(preText)

    var htmlTable = document.createElement("table")
    htmlTable.setAttribute("class","popuptable")
    var elLine = []
    var elCells = []
    var elInputs = []
    preText.innerHTML += "<br>"
    if(showOverride){
        var override = document.createElement("input")
        override.setAttribute("name","override")
        override.setAttribute("type","checkbox")
        preText.appendChild(override)
        preText.innerHTML += "Toggle on overriding of golden rules for this pass only<br><br>"
    }
    preText.innerHTML += "Ion type allowed :"
    var ionTypeAllowed = document.createElement("select")
    ionTypeAllowed.setAttribute("name","ionTypeAllowed")
    ionTypeAllowed.style.color = "black"
    var options = [document.createElement("option"),document.createElement("option"),document.createElement("option")]
    options[0].setAttribute("value","radical")
    options[1].setAttribute("value","adduct")
    options[2].setAttribute("value","both")
    options[0].innerHTML = "Allow only radicals"
    options[1].innerHTML = "Allow only non-radicals"
    options[2].innerHTML = "All types"
    ionTypeAllowed.appendChild(options[0])
    ionTypeAllowed.appendChild(options[1])
    ionTypeAllowed.appendChild(options[2])
    preText.appendChild(ionTypeAllowed)
    preText.innerHTML += "<br><br>"

    //creates a table for elements in the pass
    for(let i=0; i<6; i++){
        elLine[i] = document.createElement("tr")
        elLine[i].setAttribute("name","divlink_"+i)
        elCells[i] = []
        for(let j=0; j<3; j++){
            elCells[i][j] = document.createElement("td")
            elLine[i].appendChild(elCells[i][j])
        }
        elCells[0][0].innerHTML= "Toggle"
        elCells[0][1].innerHTML= "Name"
        elCells[0][2].innerHTML= "Bounds"
        htmlTable.appendChild(elLine[i])
    }
    //fills the table with data of elements from the pass
    for(let i=1; i<6; i++){
        elInputs[i]=[]
        elInputs[i][0]= document.createElement("input")
        elInputs[i][0].setAttribute("type","checkbox")
        elCells[i][0].appendChild(elInputs[i][0])
    }
    elInputs[1][0].setAttribute("name","useDBE")
    elCells[1][1].innerHTML = "DBE"
    elInputs[2][0].setAttribute("name","useHCratio")
    elCells[2][1].innerHTML = "H/C ratio"
    elInputs[3][0].setAttribute("name","useHeteroRatio")
    elCells[3][1].innerHTML = "Hetero ratio"
    elInputs[4][0].setAttribute("name","useKMD")
    elCells[4][1].innerHTML = "KMD"
    elInputs[5][0].setAttribute("name","useThreshold")
    elCells[5][1].innerHTML = "Elements combinations"

    elInputs[1][1] = document.createElement("input")
    elInputs[1][1].setAttribute("type","number")
    elInputs[1][1].setAttribute("name","minDBE")
    elInputs[1][1].setAttribute("value",chosenRules.DBEBound[0])
    elInputs[1][2] = document.createElement("input")
    elInputs[1][2].setAttribute("type","number")
    elInputs[1][2].setAttribute("name","maxDBE")
    elInputs[1][2].setAttribute("value",chosenRules.DBEBound[1])
    elCells[1][2].appendChild(elInputs[1][1])
    elCells[1][2].appendChild(elInputs[1][2])

    elInputs[2][1] = document.createElement("input")
    elInputs[2][1].setAttribute("type","number")
    elInputs[2][1].setAttribute("name","minHC")
    elInputs[2][1].setAttribute("value",chosenRules.HCratioBound[0])
    elInputs[2][2] = document.createElement("input")
    elInputs[2][2].setAttribute("type","number")
    elInputs[2][2].setAttribute("name","maxHC")
    elInputs[2][2].setAttribute("value",chosenRules.HCratioBound[1])
    elCells[2][2].appendChild(elInputs[2][1])
    elCells[2][2].appendChild(elInputs[2][2])

    elInputs[3][1] = document.createElement("button")
    elInputs[3][1].setAttribute("name","customHetero")
    elInputs[3][1].innerHTML = "Customize"
    elInputs[3][1].addEventListener("click", function(){buttonPressedCustomizeHeteroRatioBounds(chosenRules.heteroRatiosBound)})
    elCells[3][2].appendChild(elInputs[3][1])

    elInputs[4][1] = document.createElement("input")
    elInputs[4][1].setAttribute("type","number")
    elInputs[4][1].setAttribute("name","minKMD")
    elInputs[4][1].setAttribute("value",chosenRules.KMDBounds[0])
    elInputs[4][2] = document.createElement("input")
    elInputs[4][2].setAttribute("type","number")
    elInputs[4][2].setAttribute("name","maxKMD")
    elInputs[4][2].setAttribute("value",chosenRules.KMDBounds[1])
    elCells[4][2].appendChild(elInputs[4][1])
    elCells[4][2].appendChild(elInputs[4][2])
    elInputs[4][3] = document.createElement("input")
    elInputs[4][3].setAttribute("type","text")
    elInputs[4][3].setAttribute("name","KMDru")
    elInputs[4][3].setAttribute("value",chosenRules.KMDru)
    elCells[4][1].appendChild(elInputs[4][3])
    
    elInputs[5][1] = document.createElement("button")
    elInputs[5][1].setAttribute("name","customThreshold")
    elInputs[5][1].innerHTML = "Customize"
    elInputs[5][1].addEventListener("click", function(){buttonPressedCustomizeElementsThresholds(chosenRules.thresholdRules)})
    elCells[5][2].appendChild(elInputs[5][1])

    preText.appendChild(htmlTable)

    var separatorBox =document.createElement("div")
    popup_box.appendChild(separatorBox)
    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){ readGoldenRulesPopup(popup, chosenRules, showOverride);closePopup(this);})
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)

    //sets the values
    if(showOverride){ preText.querySelector("input[name='override']").checked = chosenRules.override}
    preText.querySelector("select[name='ionTypeAllowed']").value = chosenRules.ionTypeAllowed
    htmlTable.querySelector("input[name='useDBE']").checked = chosenRules.useDBE
    htmlTable.querySelector("input[name='useHCratio']").checked = chosenRules.useHCratio
    htmlTable.querySelector("input[name='useHeteroRatio']").checked = chosenRules.useHeteroRatio
    htmlTable.querySelector("input[name='useKMD']").checked = chosenRules.useKMD
    htmlTable.querySelector("input[name='useThreshold']").checked = chosenRules.useThreshold

    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_"+name)
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}

function readGoldenRulesPopup(popup, chosenRules, showOverride){
    if(showOverride){chosenRules.override = popup.querySelector("input[name='override']").checked}
    chosenRules.ionTypeAllowed = popup.querySelector("select[name='ionTypeAllowed']").value
    chosenRules.useDBE = popup.querySelector("input[name='useDBE']").checked
    chosenRules.useHCratio = popup.querySelector("input[name='useHCratio']").checked
    chosenRules.useHeteroRatio = popup.querySelector("input[name='useHeteroRatio']").checked
    chosenRules.useKMD = popup.querySelector("input[name='useKMD']").checked
    chosenRules.useThreshold = popup.querySelector("input[name='useThreshold']").checked
    chosenRules.DBEBound[0] = popup.querySelector("input[name='minDBE']").value
    chosenRules.DBEBound[1] = popup.querySelector("input[name='maxDBE']").value
    chosenRules.HCratioBound[0] = popup.querySelector("input[name='minHC']").value
    chosenRules.HCratioBound[1] = popup.querySelector("input[name='maxHC']").value
    chosenRules.KMDBounds[0] = popup.querySelector("input[name='minKMD']").value
    chosenRules.KMDBounds[1] = popup.querySelector("input[name='maxKMD']").value
    chosenRules.KMDru = popup.querySelector("input[name='KMDru']").value
}

///FOR CHOOSING ISOTOPES RATIOS
function buttonPressedChooseIsotopes(isotopesList){
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
    preText.innerHTML = "Check which isotopic patterns to check for<br><br>"
    popup_box.appendChild(preText)

    var checkboxes= []
    var lines = []
    for(let i=0; i<isotopesList.length; i++){
        checkboxes[i] = document.createElement("input")
        checkboxes[i].setAttribute("type","checkbox")
        checkboxes[i].setAttribute("name","isotope_"+i)
        preText.appendChild(checkboxes[i])
        preText.innerHTML += " "+isotopesList[i].fullName+"<br>"
    }
    //sets the values
    for(let i=0; i<isotopesList.length; i++){
        preText.querySelector("input[name='isotope_"+i+"']").checked = isotopesList[i].search
    }

    //adds a advanced edit button
    var editButton = document.createElement("button")
    editButton.setAttribute("name","advancededit")
    editButton.setAttribute("class","smallpopupbutton")
    editButton.addEventListener("click", function(){ buttonPressedChooseIsotopesAdvanced(isotopesList);})
    editButton.innerHTML = "Advanced edition"
    popup_box.appendChild(editButton)
    popup_box.appendChild(document.createElement("br"));
    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){ readIsotopesChecked(main_popup, isotopesList);closePopup(this);})
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_isotopes")
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}
function readIsotopesChecked(popup, isotopesList){
    for(let i=0; i<isotopesList.length; i++){
        isotopesList[i].search = popup.querySelector("input[name='isotope_"+i+"']").checked 
    }
}

///FOR MODIFYING ADVANCED OPTIONS OF ISOTOPES RATIOS
function buttonPressedChooseIsotopesAdvanced(isotopesList){
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
    preText.innerHTML = "Modify here mass differences, names and abundances of isotopes<br><br>"
    popup_box.appendChild(preText)

    var htmlTable = document.createElement("table")
    htmlTable.setAttribute("class","popuptable")
    var elLine = []
    var elCells = []
    var elInputs = []
    //creates a table for elements in the pass
    for(let i=0; i<isotopesList.length+1; i++){
        elLine[i] = document.createElement("tr")
        elLine[i].setAttribute("name","iso_"+i)
        elCells[i] = []
        for(let j=0; j<5; j++){
            elCells[i][j] = document.createElement("td")
            elLine[i].appendChild(elCells[i][j])
        }
        htmlTable.appendChild(elLine[i])
    }
    elCells[0][0].innerHTML= "Number(A)"
    elCells[0][1].innerHTML= "Name"
    elCells[0][2].innerHTML= "Delta from lightest stable isotope"
    elCells[0][3].innerHTML= "Abundance"
    elCells[0][4].innerHTML= "Delete"
    //fills the table with data of elements from the pass
    for(let i=0; i<isotopesList.length; i++){
        menuCreate_inputText(elCells[i+1][0], "number_"+i, isotopesList[i].number || "")
        menuCreate_inputText(elCells[i+1][1], "name_"+i, isotopesList[i].name)
        menuCreate_inputNumber(elCells[i+1][2], "delta_"+i, isotopesList[i].delta, [{key:"style",value:"width: 200px"}])
        menuCreate_inputNumber(elCells[i+1][3], "abundance_"+i, (isotopesList[i].factor*100),[{key:"style",value:"width: 100px"}])
        elCells[i+1][3].innerHTML += "%"
        elInputs[i]= document.createElement("button")
        elInputs[i].setAttribute("name","deleteIso"+i)
        elInputs[i].setAttribute("class","smallerpopupbutton")
        elInputs[i].addEventListener("click", function(){updateIsotopeAdvancedPopup(main_popup, isotopesList, "remove", i)})
        elInputs[i].innerHTML = "DEL"
        elCells[i+1][4].appendChild(elInputs[i])
    }     
    preText.appendChild(htmlTable)
    //adds the + button
    var addButton = document.createElement("button")
    addButton.setAttribute("name","addElButton")
    addButton.setAttribute("class","smallpopupbutton")
    addButton.addEventListener("click", function(){readIsotopeAdvancedPopup(main_popup, isotopesList);updateIsotopeAdvancedPopup(main_popup, isotopesList, "add", i);})
    addButton.innerHTML = "Save and add a type"
    popup_box.appendChild(addButton)
    var separatorBox =document.createElement("div")
    popup_box.appendChild(separatorBox)
    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){
        readIsotopeAdvancedPopup(main_popup, isotopesList);
        closePopup(this);
        let underPopup = document.querySelector("div[name='popup_isotopes']")
        if(underPopup && underPopup.firstChild && underPopup.firstChild.firstChild){
            closePopup(underPopup.firstChild.firstChild)
            buttonPressedChooseIsotopes(isotopesList)
        }
    })
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_isotopes")
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}


function readIsotopeAdvancedPopup(popup, isotopesList){
    for(let i=0; i<isotopesList.length; i++){
        isotopesList[i].number = popup.querySelector("input[name='number_"+i+"']").value
        isotopesList[i].name = popup.querySelector("input[name='name_"+i+"']").value
        isotopesList[i].fullName = "<sup>"+isotopesList[i].number+"</sup>"+isotopesList[i].name
        isotopesList[i].delta = parseFloat(popup.querySelector("input[name='delta_"+i+"']").value)
        isotopesList[i].factor = parseFloat(popup.querySelector("input[name='abundance_"+i+"']").value)/100
    }
}

function updateIsotopeAdvancedPopup(popup, isotopesList, operation, i){
    readIsotopeAdvancedPopup(popup, isotopesList);
    if(operation == "remove"){
        isotopesList.splice(i,1)
    }else if(operation =="add"){
        isotopesList.push( {"name":"","number":0,"delta":0,"factor":0,"fullName":"", "search":false},)
    }
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    buttonPressedChooseIsotopesAdvanced(isotopesList)
}


function popupCustomTableOrderAttrib(columnList){
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
    preText.innerHTML = "Here is presented the output format table<br>Customize before attribution<br>"
    popup_box.appendChild(preText)

    var htmlTable = document.createElement("table")
    htmlTable.setAttribute("class","popuptable")
    var elLine = []
    var elCells = []
    var elInputs = []
    //creates a table for elements in the pass
    for(let i=0; i<columnList.length+1; i++){
        elLine[i] = document.createElement("tr")
        elLine[i].setAttribute("name","divlink_"+i)
        elCells[i] = []
        for(let j=0; j<5; j++){
            elCells[i][j] = document.createElement("td")
            elLine[i].appendChild(elCells[i][j])
        }
        htmlTable.appendChild(elLine[i])
    }
    elCells[0][0].innerHTML= "Info"
    elCells[0][1].innerHTML= "Special parameters for this data info"
    elCells[0][2].innerHTML= ""
    elCells[0][3].innerHTML= ""
    elCells[0][4].innerHTML= "Delete"
    //fills the table with data of elements from the pass
    for(let i=0; i<columnList.length; i++){
        let id = columnList[i].id
        elInputs[i]=[]
        elInputs[i][0]= createSpecialTableAttribSelecterOptions()
        elInputs[i][0].setAttribute("name","select"+i)

        if(id == "ionType"){
            elInputs[i][1] = document.createElement("input")
            elInputs[i][1].setAttribute("type","checkbox")
            elInputs[i][1].setAttribute("name","special"+i)
            elInputs[i][1].style.height = "15px"
            elCells[i+1][1].appendChild(elInputs[i][1])
            elCells[i+1][1].innerHTML += "write as boolean"
        }else if(id == "atoms"){
            elInputs[i][1] = document.createElement("input")
            elInputs[i][1].setAttribute("type","text")
            elInputs[i][1].setAttribute("placeholder","Write to replace default els. list (O;C...)")
            elInputs[i][1].setAttribute("name","special"+i)
            elInputs[i][1].style.width = "250px"
            elInputs[i][1].style.maxWidth = "250px"
            elCells[i+1][1].appendChild(elInputs[i][1])
        }else if(id == "ratios"){
            elInputs[i][1] = document.createElement("input")
            elInputs[i][1].setAttribute("type","text")
            elInputs[i][1].setAttribute("placeholder","Write here ratios separated by ;")
            elInputs[i][1].setAttribute("name","special"+i)
            elInputs[i][1].style.width = "250px"
            elInputs[i][1].style.maxWidth = "250px"
            elCells[i+1][1].appendChild(elInputs[i][1])
        }else if(id == "I"){
            elInputs[i][1] = document.createElement("input")
            elInputs[i][1].setAttribute("type","checkbox")
            elInputs[i][1].setAttribute("name","special"+i)
            elInputs[i][1].style.height = "15px"
            elCells[i+1][1].appendChild(elInputs[i][1])
            elCells[i+1][1].innerHTML += "Sum isotopes intensity"
        }else if(id == "polymer"){
            elInputs[i][1] = document.createElement("input")
            elInputs[i][1].setAttribute("type","text")
            elInputs[i][1].setAttribute("placeholder","Write here the monomer unit")
            elInputs[i][1].setAttribute("name","special"+i)
            elInputs[i][1].style.width = "250px"
            elInputs[i][1].style.maxWidth = "250px"
            elCells[i+1][1].appendChild(elInputs[i][1])
        }else if(id == "type"){
            elInputs[i][1] = document.createElement("input")
            elInputs[i][1].setAttribute("type","checkbox")
            elInputs[i][1].setAttribute("name","special"+i)
            elInputs[i][1].style.height = "15px"
            elCells[i+1][1].appendChild(elInputs[i][1])
            elCells[i+1][1].innerHTML += "True/false by network"
        }else if(id == "chemicalFormula" || id == "adducts"){
            elCells[i+1][1].innerHTML += "Please toggle on adduct search"
        }
        elInputs[i][2]= document.createElement("button")
        elInputs[i][2].setAttribute("name","upArrow"+i)
        elInputs[i][2].addEventListener("click", function(){updateSpecialTableAttrib(main_popup, columnList, "swapUp", i)})
        elInputs[i][2].innerHTML = "▲"
        elInputs[i][3]= document.createElement("button")
        elInputs[i][3].setAttribute("name","downArrow"+i)
        elInputs[i][3].addEventListener("click", function(){updateSpecialTableAttrib(main_popup, columnList, "swapDown", i)})
        elInputs[i][3].innerHTML = "▼"

        elInputs[i][4]= document.createElement("button")
        elInputs[i][4].setAttribute("name","deleteLink_"+i)
        elInputs[i][4].setAttribute("class","smallerpopupbutton")
        elInputs[i][4].addEventListener("click", function(){updateSpecialTableAttrib(main_popup, columnList, "remove", i)})
        elInputs[i][4].innerHTML = "DEL"

        elCells[i+1][0].appendChild(elInputs[i][0])
        elCells[i+1][2].appendChild(elInputs[i][2])
        elCells[i+1][3].appendChild(elInputs[i][3])
        elCells[i+1][4].appendChild(elInputs[i][4])
    }
    preText.appendChild(htmlTable)
    htmlTable.addEventListener("change", function(){updateSpecialTableAttrib(main_popup, columnList)})

    //sets the values of the selecters
    for(let i=0; i<columnList.length; i++){
        htmlTable.querySelector("select[name='select"+i+"']").value = columnList[i].id
        if(!columnList[i].special){continue;} //avoid an error of empty special property
        if(columnList[i].id == "ionType" || columnList[i].id == "I"|| columnList[i].id == "type"){ htmlTable.querySelector("input[name='special"+i+"']").checked  = columnList[i].special}
        else if(columnList[i].id == "atoms" || columnList[i].id == "ratios" ){
            let text= "";
            for(let j=0; j<columnList[i].special.length; j++){
                text += columnList[i].special[j]
                if(j<columnList[i].special.length-1){text +=";"}
            }
            htmlTable.querySelector("input[name='special"+i+"']").value = text
        }else if(columnList[i].id == "polymer"){
            let text= columnList[i].special
            htmlTable.querySelector("input[name='special"+i+"']").value = text
        }
    }
    //adds the + button
    var addButton = document.createElement("button")
    addButton.setAttribute("name","addElButton")
    addButton.setAttribute("class","smallpopupbutton")
    addButton.addEventListener("click", function(){readSpecialTableAttrib(main_popup, columnList);updateSpecialTableAttrib(main_popup, columnList, "add");})
    addButton.innerHTML = "Save and add a column"
    popup_box.appendChild(addButton)
    var separatorBox =document.createElement("div")
    popup_box.appendChild(separatorBox)
    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){
        readSpecialTableAttrib(main_popup, columnList);
        closePopup(this);
        let attributions = attribData.attributed
        attribData.matrix = attrib.writeDataMatrix(attributions,attribData.unattributed)
    })
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_"+name)
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}

//creates the selecter options for types of column data
function createSpecialTableAttribSelecterOptions(){
    let selecter = document.createElement("select")
    selecter.style.color = "black"
    let options = []
    for(let i=0; i<19; i++){
        options[i] = document.createElement("option")
    }
    options[0].setAttribute("value","mzExp")
    options[0].innerHTML = "m/z Exp"
    options[1].setAttribute("value","I")
    options[1].innerHTML = "Intensity"
    options[2].setAttribute("value","ionFormula")
    options[2].innerHTML = "Ion Formula"
    options[3].setAttribute("value","mzCalc")
    options[3].innerHTML = "m/z Calc"
    options[4].setAttribute("value","ppm")
    options[4].innerHTML = "ppm"
    options[5].setAttribute("value","ionType")
    options[5].innerHTML = "Ion Type"
    options[6].setAttribute("value","DBE")
    options[6].innerHTML = "DBE"
    options[7].setAttribute("value","atoms")
    options[7].innerHTML = "All Atoms Cols."
    options[8].setAttribute("value","ratios")
    options[8].innerHTML = "Elemental Ratios"
    options[9].setAttribute("value","whichPass")
    options[9].innerHTML = "Pass Number"
    options[10].setAttribute("value","type")
    options[10].innerHTML = "Attribution Method"
    options[11].setAttribute("value","seedDistance")
    options[11].innerHTML = "Distance from network seed"
    options[12].setAttribute("value","adducts")
    options[12].innerHTML = "Adducts"
    options[13].setAttribute("value","chemicalFormula")
    options[13].innerHTML = "Chemical Formula"
    options[14].setAttribute("value","polymer")
    options[14].innerHTML = "Polymer infos"
    options[15].setAttribute("value","index")
    options[15].innerHTML = "Index"
    options[16].setAttribute("value","indexAttrib")
    options[16].innerHTML = "Attribution order"
    options[17].setAttribute("value","originCols")
    options[17].innerHTML = "Original Columns"
    options[18].setAttribute("value","empty")
    options[18].innerHTML = "Empty"
    for(let i=0; i<19; i++){
        selecter.appendChild(options[i])
    }
    return selecter
}

function readSpecialTableAttrib(popup, columnList){
    for(let i=0; i<columnList.length; i++){
        if(columnList[i].id == "mzExp"){ columnList[i].name = "m/z Exp"}
        else if(columnList[i].id == "index"){columnList[i].name = "Index"}
        else if(columnList[i].id == "indexAttrib"){columnList[i].name = "Attribution order"}
        else if(columnList[i].id == "seedDistance"){columnList[i].name = "Distance from Network seed"}
        else if(columnList[i].id == "I"){
             if(popup.querySelector("input[name='special"+i+"']")){
                columnList[i].special = popup.querySelector("input[name='special"+i+"']").checked
            }
            if(columnList[i].special){ columnList[i].name = "Intensity"}
            else{columnList[i].name = "Intensity (monoisotopic) "}
            }
        else if(columnList[i].id == "ionFormula"){ columnList[i].name = "Ion Formula"}
        else if(columnList[i].id == "mzCalc"){ columnList[i].name = "m/z Calc"}
        else if(columnList[i].id == "ppm"){ columnList[i].name = "ppm"}
        else if(columnList[i].id == "DBE"){ columnList[i].name = "DBE"}
        else if(columnList[i].id == "whichPass"){ columnList[i].name = "#Pass"}
        else if(columnList[i].id == "type"){ columnList[i].name = "Attribution Method"
            columnList[i].special = popup.querySelector("input[name='special"+i+"']").checked
            if(popup.querySelector("input[name='special"+i+"']")&&  popup.querySelector("input[name='special"+i+"']").checked){
                columnList[i].name = "Found by Network ?"
            }
        }
        else if(columnList[i].id == "empty"){ columnList[i].name = ""}
        else if(columnList[i].id == "atoms"){
            columnList[i].name == "atoms"
            columnList[i].special = popup.querySelector("input[name='special"+i+"']").value.split(";")
            if(columnList[i].special == [""]){columnList[i].special = ""}
        }
        else if(columnList[i].id == "ratios"){
            columnList[i].name = "ratios"
            columnList[i].special = popup.querySelector("input[name='special"+i+"']").value.split(";")
        }else if(columnList[i].id == "polymer"){
            columnList[i].name = "polymer"
            columnList[i].special = popup.querySelector("input[name='special"+i+"']").value
        }else if(columnList[i].id == "chemicalFormula"){
            columnList[i].name = "Chemical Formula"
        }else if(columnList[i].id == "adducts"){
            columnList[i].name = "Adducts"
        }else{columnList[i].name = columnList[i].id}
        columnList[i].id = popup.querySelector("select[name='select"+i+"']").value
        if(columnList[i].id == "ionType"){
            if(popup.querySelector("input[name='special"+i+"']")){
                columnList[i].special = popup.querySelector("input[name='special"+i+"']").checked
            }
            if(columnList[i].special){ columnList[i].name = "isRadical?"}
            else{columnList[i].name == "Ion type"}
         }
    }
    if(debug){console.log(columnList)}
}

function updateSpecialTableAttrib(popup, columnList, operation, i){
    readSpecialTableAttrib(popup, columnList);
    if(operation == "remove"){
        columnList.splice(i,1)
    }else if(operation =="add"){
        columnList.push({"id":"empty","name":"","special":""})
    }else if(operation == "swapUp"){
        if(i>0){swapElement(columnList, i, i-1)}
    }else if(operation == "swapDown"){
        if(i<columnList.length-1){swapElement(columnList, i, i+1)}
    }
    let selectors = document.querySelectorAll("button[class='popuptrueclose']")
    let length = selectors.length
    selectors[length-1].click()
    popupCustomTableOrderAttrib(columnList)
}

/////// FOR SPECIAL PARAMETERS

///FOR CUSTOMIZING TABLE ORDER
document.querySelector("button[name='advancedAttribOptions']").addEventListener("click", function(){popupSpecialParametersAttribution()})

function popupSpecialParametersAttribution(){
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

    var elLine = []
    var elCells = []
    var elInputs = []
    preText.innerHTML += "<br>"

    preText.innerHTML += "Filter for eliminating attrib possibilites (Da) :"
    menuCreate_inputNumber(preText, "filterDa", attribCfg.ppm.daFilter);
    preText.innerHTML += "<br><br>"

    menuCreate_checkbox(preText, "toggleOmega",attribCfg.peakRemoval.toggle)
    preText.innerHTML += "Toggle harmonic peak removal (experimental !)<br> error tolerance (mDa):"
    menuCreate_inputNumber(preText, "peakRemovalmDa",attribCfg.peakRemoval.mDaTol)
    preText.innerHTML += "Expected intensity : "
    menuCreate_inputNumber(preText, "peakRemovalExpectedI",attribCfg.peakRemoval.expectI*100)
    preText.innerHTML +="% Tolerance: "
    menuCreate_inputNumber(preText, "peakRemovaliTol",attribCfg.peakRemoval.iTol*100)
    preText.innerHTML += "% <br><br>"

   
    menuCreate_checkbox(preText, "passMemoryEconomy",attribCfg.main.passMemoryEconomy)
    preText.innerHTML += "Experimental pass computation memory reduction"
    preText.innerHTML += "<br><br>"
    
    preText.innerHTML += "Network exploration edge direction :"
    let directionOptions = [{value:"both",name:"Undirected"},{value:"direct",name:"Directed only"},{value:"reverse",name:"Directed only (reversed)"}]
    let directionMenu = menuCreate_select(preText,"networkDirection",attribCfg.main.networkDirection, directionOptions)
    directionMenu.style.color = "black"
    preText.innerHTML += "<br><br>"

    let variableErrorCheckbox = menuCreate_checkbox(preText, "variableError",attribCfg.ppm.variable)
    preText.innerHTML += "Variable ppm error "
    let editVariable = document.createElement("button")
    editVariable.innerHTML = "EDIT"
    editVariable.addEventListener("click",(d)=>{
        let checkbox = d.target.parentElement.querySelector("input[name='variableError']")
        if(checkbox.checked){ new Popup_editVariableError(attribCfg.ppm.attribution)}
    })
    preText.appendChild(editVariable)
    preText.appendChild(document.createElement("br"))
    preText.appendChild(document.createElement("br"))
    popup_box.appendChild(preText)


    var separatorBox =document.createElement("div")
    popup_box.appendChild(separatorBox)
    //adds the validate button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){readSpecialParamAttribPopup(this.offsetParent);closePopup(this);})
    valButton.innerHTML = "VALIDATE"
    popup_box.appendChild(valButton)
    //sets the values
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_"+name)
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}

function readSpecialParamAttribPopup(popup){
    attribCfg.ppm.daFilter = parseFloat(popup.querySelector("input[name='filterDa']").value)
    attribCfg.peakRemoval.toggle = popup.querySelector("input[name='toggleOmega']").checked
    attribCfg.peakRemoval.mDaTol = parseFloat(popup.querySelector("input[name='peakRemovalmDa']").value)
    attribCfg.peakRemoval.expectI = 0.01*parseFloat(popup.querySelector("input[name='peakRemovalExpectedI']").value)
    attribCfg.peakRemoval.iTol = 0.01*parseFloat(popup.querySelector("input[name='peakRemovaliTol']").value)

    attribCfg.main.passMemoryEconomy = popup.querySelector("input[name='passMemoryEconomy']").checked
    attribCfg.main.networkDirection = popup.querySelector("select[name='networkDirection']").value
    attribCfg.ppm.variable = popup.querySelector("input[name='variableError']").checked
    if(!attribCfg.ppm.variable && isNaN(attribCfg.ppm.attribution)){
        attribCfg.ppm.attribution = attribCfg.ppm.attribution.previousValue
    }
}


///FOR POPUP EDIT VARIABLE PPM ERROR////
class Popup_editVariableError extends Popup {
    constructor(previousError) {
        super("heteroClassesEdit","Edit here the variable ppm tolerance<br> Please put every mass in ascending order <br>")
        //sets up the error parameter
        this.error = {
            list:[],
            network:0,
            method:"step"
        }
        console.log(previousError)
        //if a parameter was used and the previous error is not a number (a constant error),then loads this error
        //else, continues with a new fresh this.error and adds the previousError as the value
        if(previousError && isNaN(previousError)){this.error = previousError}
        else if(!isNaN(previousError)){this.error.previousValue = previousError}
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
        this.errorListCopy = []
        this.error.list.forEach((item)=>{
            let newItem = {"mass":item.mass,"error":item.error}
            this.errorListCopy.push(newItem)
        })
        //creates inputs above
        this.divNetwork = document.createElement("div")
        this.divNetwork.innerHTML = "Additional tolerance for network :"
        this.divNetworkInput = menuCreate_inputNumber(null, "networkTol", this.error.network)
        this.divNetworkInput.addEventListener("change",(d)=>{this.error.network = parseFloat(d.target.value)})
        let networkOptions = [{name:"Constant addition (ppm)",value:"add"},{name:"Multiply tolerance",value:"multiply"}]
        this.divNetworkChoice = menuCreate_select(null, "networkMethod",this.error.networkMethod,networkOptions)
        this.divNetworkChoice.addEventListener("change",(d)=>{this.error.networkMethod = parseFloat(d.target.value)})


        this.divNetwork.appendChild(this.divNetworkInput)
        this.divNetwork.appendChild(this.divNetworkChoice)


        let otherOptions = document.createElement("div")
        otherOptions.innerHTML = "Method to compute tolerance between points:"
        let selectOptions = [{name:"Step function",value:"step"},{name:"Linear function",value:"linear"}]
        this.methodSelecter = menuCreate_select(null, "methodSelecter", this.error.method, selectOptions)
        this.methodSelecter.style.color = "black"
        this.methodSelecter.value = this.error.method
        this.methodSelecter.addEventListener("change",(d)=>{this.error.method = d.target.value; console.log(this)})
        otherOptions.appendChild(this.methodSelecter)

        //creates a table
        this.addFirstLine()
        for(let i=0; i<this.errorListCopy.length; i++){
            this.addLine()
        }
        this.preText.appendChild(document.createElement("br"))
        this.preText.appendChild(this.divNetwork)
        this.preText.appendChild(document.createElement("br"))
        this.preText.appendChild(otherOptions)
        this.preText.appendChild(document.createElement("br"))
        this.preText.appendChild(htmlTable)
        //adds the + button
        this.addButton = document.createElement("button")
        this.addButton.setAttribute("name","addPointButton")
        this.addButton.setAttribute("class","smallpopupbutton")
        this.addButton.addEventListener("click", ()=>{
            this.addLine()
        })
        this.addButton.innerHTML = "Add a new point"
        this.preText.appendChild(document.createElement("br"))
        this.preText.appendChild(this.addButton)
        let separatorBox =document.createElement("div")
        this.popup_box.appendChild(separatorBox)
        this.valButton.addEventListener("click",()=>{
            this.error.list = this.errorListCopy
            attribCfg.ppm.attribution = this.error
        })
    }
    addFirstLine(){
        let newLength = this.elLine.length
        this.elLine[newLength] = document.createElement("tr")
        this.elCells[newLength] = []
        for(let j=0; j<3; j++){
            this.elCells[newLength][j] = document.createElement("td")
            this.elLine[newLength].appendChild(this.elCells[newLength][j])
        }
        this.elCells[newLength][0].innerHTML = "Mass"
        this.elCells[newLength][1].innerHTML = "Error Tolerance(ppm)"
        this.elCells[newLength][2].innerHTML = "X"
        this.htmlTable.appendChild(this.elLine[newLength])
    }
    addLine(){
        let newLength = this.elLine.length
        let points =  this.errorListCopy
        this.elLine[newLength] = document.createElement("tr")
        this.elCells[newLength] = []
        for(let j=0; j<3; j++){
                this.elCells[newLength][j] = document.createElement("td")
                this.elLine[newLength].appendChild(this.elCells[newLength][j])
        }
        this.elInputs[newLength]=[]
        this.elInputs[newLength][0]= document.createElement("input")
        this.elInputs[newLength][0].setAttribute("type","number")
        this.elInputs[newLength][0].setAttribute("name","mass"+i)
        this.elInputs[newLength][0].style.width = "170px"
        this.elInputs[newLength][0].addEventListener("change",(d) =>{this.readChange(d,newLength-1,"mass")})

        this.elInputs[newLength][1]= document.createElement("input")
        this.elInputs[newLength][1].setAttribute("type","number")
        this.elInputs[newLength][1].setAttribute("name","error"+i)
        this.elInputs[newLength][1].style.width = "170px"
        this.elInputs[newLength][1].addEventListener("change",(d) =>{this.readChange(d,newLength-1,"error")})


        if(points[newLength-1]){
            this.elInputs[newLength][0].setAttribute("value",points[newLength-1].mass )
            this.elInputs[newLength][1].setAttribute("value",points[newLength-1].error )
        }else{
            this.errorListCopy.push({mass:0,error:0})
        }

        this.elInputs[newLength][2]= document.createElement("button")
        this.elInputs[newLength][2].setAttribute("name","deleteLink_"+newLength)
        this.elInputs[newLength][2].setAttribute("class","smallerpopupbutton")
        this.elInputs[newLength][2].addEventListener("click", (d)=>{
            this.removeLine(d)
        })
        this.elInputs[newLength][2].innerHTML = "DEL"

        this.elCells[newLength][0].appendChild(this.elInputs[newLength][0])
        this.elCells[newLength][1].appendChild(this.elInputs[newLength][1])
        this.elCells[newLength][2].appendChild(this.elInputs[newLength][2])
        this.htmlTable.appendChild(this.elLine[newLength])
    }

    removeLine(d){
        let index = d.target.parentElement.parentElement.rowIndex
        this.elInputs.splice(index,1)
        this.elCells.splice(index,1)
        this.elLine.splice(index,1)
        this.errorListCopy.splice(index-1,1)

        this.htmlTable.deleteRow(index)
    }
    readChange(event, index,property){
        let input = event.target
        this.errorListCopy[index][property] = parseFloat(input.value)
    }
}


//// FOR POPUP SEEDS LIST /////
class Popup_editSeeds extends Popup {
    constructor(name, seeds) {
        super("heteroClassesEdit","Edit here the list of seeds <br> The name is optional <br>")
        this.seeds = seeds
        this.buildSuppContext()
        console.log(this)
    }

    buildSuppContext(){
        var htmlTable = document.createElement("table")
        htmlTable.setAttribute("class","popuptable")
        this.elLine = []
        this.elCells = []
        this.elInputs = []
        this.htmlTable = htmlTable
        //clones the elements
        this.seedsCopy = []
        if(!this.seeds){this.seeds = []}
        this.seeds.forEach((item)=>{
            let newItem = {"name":item.name,"formula":item.formula,"mass":item.mass}
            this.seedsCopy.push(newItem)
        })
        //creates a table
        this.addFirstLine()
        for(let i=0; i<this.seedsCopy.length; i++){
            this.addLine()
        }
        this.preText.appendChild(htmlTable)
        //adds the + button
        this.addButton = document.createElement("button")
        this.addButton.setAttribute("name","addSeedButton")
        this.addButton.setAttribute("class","smallpopupbutton")
        this.addButton.addEventListener("click", ()=>{
            this.addLine()
        })
        //adds the copy/paste buttons
        this.copyButton = document.createElement("button")
        this.copyButton.setAttribute("name","copySeedsButton")
        this.copyButton.setAttribute("class","smallpopupbutton")
        this.copyButton.style.margin = 1
        this.copyButton.addEventListener("click", ()=>{
            this.copyToClipboard()
        })
        this.pasteButton = document.createElement("button")
        this.pasteButton.setAttribute("name","pasteSeedsButton")
        this.pasteButton.setAttribute("class","smallpopupbutton")
        this.pasteButton.style.margin = 1
        this.pasteButton.addEventListener("click", ()=>{
            this.pasteSeeds()
        })
        let divCopyPaste = document.createElement("div")
        divCopyPaste.appendChild(this.copyButton)
        divCopyPaste.appendChild(this.pasteButton)

        this.addButton.innerHTML = "Add a new seed"
        this.copyButton.innerHTML = "Copy seeds"
        this.pasteButton.innerHTML = "Paste seeds (formula list)"
        this.preText.appendChild(document.createElement("br"))
        this.preText.appendChild(this.addButton)
        this.preText.appendChild(divCopyPaste)
        let separatorBox =document.createElement("div")
        this.popup_box.appendChild(separatorBox)
        this.valButton.addEventListener("click",()=>{attribPasses.seeds = this.seedsCopy;})
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
        let seeds = this.seedsCopy
        var text=""
        text += "name" + split + "formula"+ split + "mass" + '\n'
        for(let i=0; i<seeds.length; i++){
          text += seeds[i].name + split + seeds[i].formula + split + seeds[i].mass + '\n'
        }
        navigator.clipboard.writeText(text)
    }

    pasteSeeds(){
        navigator.clipboard.readText()
        .then(
            (pastedData) => {
                let parsedData = []
                let lbreak = pastedData.split(/\r?\n/);
                lbreak.forEach(res => {
                    parsedData.push(res.split("\t"));
                });
                let pastedSeeds = []
                for(let i=0; i<parsedData.length-1; i++){
                    let newObject = {name:"",formula:"",mass:0}
                    if(parsedData[i].length >=2){
                        newObject.name = parsedData[i][0]
                        newObject.formula = parsedData[i][1]
                        let mol = new Molecule(parsedData[i][0])
                        console.log(mol)
                        newObject.mass = parseFloat(mol.mass) || 0
                        if(!isNaN(parsedData[i][2])){
                            newObject.mass = parsedData[i][2] || 0
                        }
                    }else if(parsedData[i].length  == 1){
                        newObject.formula = parsedData[i][0]
                        newObject.name = ""
                        let mol = new Molecule(parsedData[i][0])
                        newObject.mass = parseFloat(mol.mass) || 0
                    }
                    pastedSeeds.push(newObject)
                }
                closePopup(this.valButton);
                new Popup_editSeeds("editSeeds",pastedSeeds)
            },
        )
    }

    addLine(){
        let newLength = this.elLine.length
        let seeds = this.seedsCopy
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
        this.elInputs[newLength][1].addEventListener("change",(d) =>{this.readChange(d,newLength-1,"formula")})

        //not a true input because mass is just indicative
        this.elInputs[newLength][2] = document.createElement("div")
        this.elInputs[newLength][2].style.width = "100px"

        if(seeds[newLength-1]){
            this.elInputs[newLength][0].setAttribute("value",seeds[newLength-1].name ||"")
            this.elInputs[newLength][1].setAttribute("value",seeds[newLength-1].formula ||"")
            const mass = parseFloat(seeds[newLength-1].mass) || 0
            this.elInputs[newLength][2].innerHTML = mass.toFixed(6)
        }else{
            this.seedsCopy.push({name:"",formula:"",mass:0})
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
        this.seedsCopy.splice(index-1,1)

        this.htmlTable.deleteRow(index)
    }
    readChange(event, index,property){
        let input = event.target
        if(input.type =="text"){
            this.seedsCopy[index][property] = input.value
        }
        //log the mass if needed
        if(property == "formula"){
            let newMol = new Molecule(input.value)
            this.elInputs[index+1][2].innerHTML = (newMol.mass).toFixed(6)
            this.seedsCopy[index].mass = newMol.mass
        }
    }
}


//// FOR POPUP LOG DELTAS /////

function logDeltasPressed(){
    if(!attribData.network ||attribData.network.edges.length ==0){return console.warn("No attributed deltas. Aborting popup creation")}
    new Popup_edgesData(attribData.network, "attribution")
}

function logDeltasSummary(){
    if(attribCfg.checks.networkType=="undirect"){ logDeltasAttribButtonPressed()}
    else if(attribCfg.checks.networkType=="direct"){logDirectDeltas()}
    else{console.warn("Wrong algorithm chosen")}
}

function logDeltasAttribButtonPressed(){
    if(!attribData.network ||attribData.network.edges.length ==0){return console.warn("No attributed deltas. Aborting popup creation")}
    if(attribCfg.checks.networkType!="undirect"){return console.warn("Wrong algorithm chosen to display this")}
    //computes the ppm errors of these repeat units
    new Popup_networkData(attribData.network, "undirected")
}

function logDirectDeltas(){
    if(!attribData.network ||attribData.network.edges.length ==0){return console.warn("No attributed deltas. Aborting popup creation")}
    if(attribCfg.checks.networkType=="undirect"){return console.warn("Wrong algorithm chosen to display this")}
    new Popup_networkData(attribData.network, "directed")
}

function logAttributions(){
    if(!attribData.matrix ||attribData.matrix.length ==0){return console.warn("No raw deltas. Aborting popup creation")}
    var table = writeAttribsTable(attribData.matrix, false)
    var buttons = [
        {"name":"COPY TABLE","function": copyTable, "arg1": attribData.matrix, "arg2":false}
      ]
    handlePopup("logAttributions",table,buttons,[],[])
}

function logAttributionsSus(){
    if(!attribData.attributed ||attribData.attributed.length ==0){return console.warn("No raw deltas. Aborting popup creation")}
    var table = writeAttribsTable(attribData.matrix, false)
    new Popup_AttributionsSuspect(attribData.attributed)
}


function writeDeltasTable(deltas, isAttributed){
    let div = document.createElement("div")
    if(isAttributed){div.innerHTML = "Only 5000 may appear at most <br>"}
    else{div.innerHTML = " Only 5000 may appear at most. Please copy to get all <br>"}
    div.style.maxHeight = "400px";
    div.style.overflow = "scroll";
    let table = document.createElement("table")
    let lines = []
    let cellsForName = []
    let cellsForNumber = []
    lines[0] = document.createElement("tr")
    cellsForName[0] = document.createElement("td")
    cellsForNumber[0] = document.createElement("td")
    cellsForName[0].innerHTML = "Delta m/z"
    cellsForNumber[0].innerHTML = "Count"
    lines[0].appendChild(cellsForName[0])
    lines[0].appendChild(cellsForNumber[0])
    let cellsForFormulas = []
    let cellsForMDA = []
    if(isAttributed){
        cellsForFormulas[0] = document.createElement("td")
        cellsForFormulas[0].innerHTML = "Formula"
        cellsForMDA[0] = document.createElement("td")
        cellsForMDA[0].innerHTML = "mDa error"
        lines[0].appendChild(cellsForFormulas[0])
        lines[0].appendChild(cellsForMDA[0])
     }
    table.appendChild(lines[0])
    let length = Math.min(deltas.length, 5000)
    for(let i=0; i<length; i++){
        lines[i] = document.createElement("tr")
        cellsForName[i] = document.createElement("td")
        cellsForNumber[i] = document.createElement("td")
        if(!isAttributed){cellsForName[i].innerHTML = deltas[i].value.toFixed(5)}
        cellsForNumber[i].innerHTML = deltas[i].number
        lines[i].appendChild(cellsForName[i])
        lines[i].appendChild(cellsForNumber[i])
        if(isAttributed){
            cellsForName[i].innerHTML = deltas[i].mass.toFixed(5)
            cellsForFormulas[i] = document.createElement("td")
            cellsForFormulas[i].innerHTML = deltas[i].formula
            cellsForMDA[i] = document.createElement("td")
            let mDavalue = ""
            if(deltas[i].mDa){mDavalue = deltas[i].mDa.toFixed(5)}
            cellsForMDA[i].innerHTML = mDavalue
            lines[i].appendChild(cellsForFormulas[i])
            lines[i].appendChild(cellsForMDA[i])
        }
        table.appendChild(lines[i])
        div.append(table)
    }
    return div
}

function writeDeltasDirectTable(){
    let deltas = attribCfg.directNetwork.list
    let occurences = attribData.deltaDirectNetwork
    let network = attribData.network
    
    let div = document.createElement("div")
    div.innerHTML = "Only 5000 may appear at most <br>"
    div.style.maxHeight = "400px";
    div.style.overflow = "scroll";
    let table = document.createElement("table")
    let lines = []
    let cellsForName = []
    let cellsForNumber = []
    lines[0] = document.createElement("tr")
    cellsForName[0] = document.createElement("td")
    cellsForNumber[0] = document.createElement("td")
    cellsForName[0].innerHTML = "Formula"
    cellsForNumber[0].innerHTML = "Count"
    lines[0].appendChild(cellsForName[0])
    lines[0].appendChild(cellsForNumber[0])
    table.appendChild(lines[0])
    let length = Math.min(deltas.length, 5000)
    for(let i=0; i<length; i++){
        lines[i] = document.createElement("tr")
        cellsForName[i] = document.createElement("td")
        cellsForNumber[i] = document.createElement("td")
        cellsForName[i].innerHTML = deltas[i].formula
        cellsForNumber[i].innerHTML = occurences[i]
        lines[i].appendChild(cellsForName[i])
        lines[i].appendChild(cellsForNumber[i])
        table.appendChild(lines[i])
        div.append(table)
    }
    return div
}

function writeAttribsTable(data){
    let div = document.createElement("div")
    div.innerHTML = " Only 5000 may appear at most. Please copy to get all <br>"
    div.style.maxHeight = "400px";
    div.style.overflow = "scroll";
    let table = document.createElement("table")
    let lines = []
    let cells = []
    let length = Math.min(data.length, 5000)
    for(let i=0; i<length; i++){
        lines[i]=document.createElement("tr")
        cells[i]= []
        for(let j=0; j<data[i].length; j++){
            cells[i][j] = document.createElement("td")
            cells[i][j].innerHTML = data[i][j]
            lines[i].appendChild(cells[i][j])
        }
        table.appendChild(lines[i])
    }
    div.appendChild(table)
    return div
}

function copyTable(data){
  var splitterA = "\t";
  if(data.length <= 0){return;}
  //sets the text zone to contain the data separated by tab
  var text = ""
  for(let i=0; i<data.length; i++){
      for(let j=0; j<data[i].length;j++){
          //for the last element
           if(j+1 == data[0].length){text= text + data[i][j]}
           else{text= text + data[i][j] + splitterA}
      }
    text = text+'\n'
  }
  navigator.clipboard.writeText(text)
}


function copyDeltasTable(deltas, isAttributed){
    let text =""
    if(isAttributed){
        for(let i=0; i<deltas.length; i++){
            text += deltas[i].mass + "\t" + deltas[i].number + "\t" + deltas[i].formula + "\t" + deltas[i].mDa + '\n'
        }
    }else{
        for(let i=0; i<deltas.length; i++){
            text += deltas[i].value + "\t" + deltas[i].number + '\n'
        }
    }
    navigator.clipboard.writeText(text)
}


function copyDeltasDirectTable(){
    let deltas = attribCfg.directNetwork.list
    let occurences = attribData.deltaDirectNetwork
    let text =""
        for(let i=0; i<deltas.length; i++){
            text += deltas[i].formula + "\t" + occurences[i] + '\n'
        }
    navigator.clipboard.writeText(text)
}



//FOR POPUP LOG ISOTOPIC PEAKS
function logIsotopicAttribButtonPressed(){
    if(!attribData.isotopes ||attribData.isotopes.length ==0){return console.warn("No Isotopic peaks. Aborting popup creation")}
    var table = writeIsotopeAttribTable(attribData.isotopes)
    var buttons = [
        {"name":"COPY TABLE","function": copyIsotopeAttrib, "arg1": attribData.isotopes, "arg2":false}
      ]
    handlePopup("logIsotopicAttributions",table,buttons,[],[])
}

function writeIsotopeAttribTable(attribs){
    let div = document.createElement("div")
    div.innerHTML = "Only 5000 may appear at most, please copy if you want to see all <br>"
    div.style.maxHeight = "400px";
    div.style.overflow = "scroll";
    let table = document.createElement("table")
    let lines = []
    let cellsForMass = []
    let cellsForIntensity = []
    let cellsForIsotope = []
    let cellsForFormula = []
    lines[0] = document.createElement("tr")
    cellsForMass[0] = document.createElement("td")
    cellsForIntensity[0] = document.createElement("td")
    cellsForFormula[0] = document.createElement("td")
    cellsForIsotope[0] = document.createElement("td")
    cellsForMass[0].innerHTML = "m/z"
    cellsForIntensity[0].innerHTML = "Intensity"
    cellsForFormula[0].innerHTML = "Formula"
    cellsForIsotope[0].innerHTML = "Isotope x1"
    lines[0].appendChild(cellsForMass[0])
    lines[0].appendChild(cellsForIntensity[0])
    lines[0].appendChild(cellsForFormula[0])
    lines[0].appendChild(cellsForIsotope[0])
    table.appendChild(lines[0])
    let length = Math.min(attribs.length, 5000)
    for(let i=0; i<length; i++){
        lines[i] = document.createElement("tr")
        cellsForMass[i] = document.createElement("td")
        cellsForIntensity[i] = document.createElement("td")
        cellsForFormula[i] = document.createElement("td")
        cellsForIsotope[i] = document.createElement("td")
        if(attribs[i].array){
            cellsForMass[i].innerHTML = attribs[i].array[config.mz] 
            cellsForIntensity[i].innerHTML = attribs[i].array[config.intensity]
        }else{
            cellsForMass[i].innerHTML = attribs[i][config.mz]
            cellsForIntensity[i].innerHTML = attribs[i][config.intensity]
        }
        const attrib = attribs[i].monoisotopicPeak.attrib || {}
        cellsForFormula[i].innerHTML = attrib.name || ""
        cellsForIsotope[i].innerHTML = attribs[i].isotopesList
        lines[i].appendChild(cellsForMass[i])
        lines[i].appendChild(cellsForIntensity[i])
        lines[i].appendChild(cellsForFormula[i])
        lines[i].appendChild(cellsForIsotope[i])
        table.appendChild(lines[i])
        div.append(table)
    }
    return div
}

function copyIsotopeAttrib(attribs){
    let text =""
    console.log(attribs)
    for(let i=0; i<attribs.length; i++){
        var isotopeName = attribs[i].isotopesList || []
        var regex = new RegExp("<sup>", "gi")
        var regex2 = new RegExp("</sup>", "gi")
        var isoFullName = ""
        for(let j=0; j<isotopeName.length; j++){
            let isoPartName = isotopeName[j]
            if(isoPartName){
                isoPartName = isoPartName.replace(regex, function(matched) {return "";})
                isoPartName = isoPartName.replace(regex2, function(matched) {return "";})
                isoFullName += isoPartName
            }
        }
        let mass = attribs[i][config.mz]
        let intensity = attribs[i][config.intensity]
        const attrib = attribs[i].monoisotopicPeak.attrib || {}
        let formula = attrib.name || ""
        text +=  mass+"\t"+ intensity + "\t" + formula + "\t" + isoFullName + '\n'
    }
    navigator.clipboard.writeText(text)
}
/********************************************************************* */
/*              POPUP FOR SINGLE PEAK MASS SEARCH                      */
/********************************************************************* */
let popupPass = []
function popupSinglePeakMassSearch(mass, fileString){
    var charge = attribCfg.main.charge;
    if(popupPass.length == 0){
        popupPass = JSON.parse(JSON.stringify(attribPasses.deNovo[0]));
    }
    var goldRules = JSON.parse(JSON.stringify(attribPasses.specialGoldenRules[0]));
    goldRules.useIsotopicRatio = true;
    var useGold = true;
    var ppm =  attribCfg.ppm.attribution;

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
    preText.innerHTML = "Custom mass search <br>"

    mass = parseFloat(mass)
    var massInput = document.createElement("input")
    massInput.setAttribute("type", "number")
    massInput.setAttribute("name","mass")
    massInput.setAttribute("value",mass)
    massInput.style.height = "20px";
    massInput.style.margin = "5px";
    massInput.style.width = "150px";
    massInput.style.color = "black";
    preText.appendChild(massInput)
    preText.innerHTML+="<br> File origin (for <sup>13</sup>C research):<br>"
    var fileOrigin = document.createElement("select")
    fileOrigin.setAttribute("name","fileChoice")
    fileOrigin.style.color = "black";
    preText.appendChild(fileOrigin);
    preText.innerHTML+="<br><br>"

    popup_box.appendChild(preText)
    var htmlTable = document.createElement("table")
    htmlTable.setAttribute("class","popuptable")
    var elLine = []
    var elCells = []
    //creates a table for elements in the pass
    for(let i=0; i<3; i++){
        elLine[i] = document.createElement("tr")
        elLine[i].setAttribute("name","divlink_"+i)
        elCells[i] = []
        for(let j=0; j<2; j++){
            elCells[i][j] = document.createElement("td")
            elLine[i].appendChild(elCells[i][j])
        }
        htmlTable.appendChild(elLine[i])
    }
    elCells[0][0].innerHTML= "Parameter"
    elCells[0][1].innerHTML= "Options"
    //fills the table with data of elements from the pass
    var ppmInput = document.createElement("input")
    ppmInput.setAttribute("type", "number")
    ppmInput.setAttribute("name","ppm")
    ppmInput.setAttribute("value",ppm)
    ppmInput.style.width = "60px";
    elCells[1][0].innerHTML = "ppm tolerance:"
    elCells[1][1].appendChild(ppmInput)

    var chargeInput = document.createElement("select")
    chargeInput.setAttribute("name","charge")
    chargeInput.style.color = "black"
    var chargeOptions = [document.createElement("option"),document.createElement("option"),document.createElement("option")]
    chargeOptions[0].innerHTML = "+1"
    chargeOptions[0].value = 1
    chargeOptions[1].innerHTML = "0"
    chargeOptions[1].value = 0
    chargeOptions[2].innerHTML = "-1"
    chargeOptions[2].value = -1
    chargeInput.appendChild(chargeOptions[0])
    chargeInput.appendChild(chargeOptions[1])
    chargeInput.appendChild(chargeOptions[2])
    elCells[2][0].innerHTML = "Charge:"
    elCells[2][1].appendChild(chargeInput)

    preText.appendChild(htmlTable)

    //adds the custom buttons
    var passButton = document.createElement("button")
    passButton.setAttribute("name","passButton")
    passButton.innerHTML = "Edit pass"
    preText.innerHTML += "<br><br>"
    preText.appendChild(passButton)


    var rulesButton = document.createElement("button")
    rulesButton.setAttribute("name","rulesButton")
    rulesButton.innerHTML = "Edit rules"
    preText.innerHTML += "<br><br>"
    preText.appendChild(rulesButton)
    preText.innerHTML += "<br>"

    //adds the search button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){ readSearchTableAndSearch(main_popup, popupPass, goldRules);closePopup(this);})
    valButton.innerHTML = "SEARCH"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_"+name)
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
    //sets the value of the selecter & sets functions to buttons
    popup.querySelector("select[name='charge']").value = charge
    popup.querySelector("select[name='fileChoice']").value = fileString
    popup.querySelector("button[name='passButton']").addEventListener("click",function(){
        buttonPressedCustomizePass(popupPass, -2, false)
    })
    popup.querySelector("button[name='rulesButton']").addEventListener("click",function(){
        editPassGoldenRules(goldRules, false)
    })
}

function readSearchTableAndSearch(popup, pass, rules){
    var mass = parseFloat(popup.querySelector("input[name='mass']").value)
    var ppm = parseFloat(popup.querySelector("input[name='ppm']").value)
    var charge = parseFloat(popup.querySelector("select[name='charge']").value)
    setPassCharge(pass, charge)

    var data = []
    var fileString =  popup.querySelector("select[name='fileChoice']").value
    if(fileString == "attrib"){fileString = html_tabAttrib.querySelector("select[name='fileSelection']").value} //this is imperfect. If the user changes file to a
    data = linkFileFromDataString(fileString, false)
    //search this file for m/z info
    var index = -1
    for(let i=0; i<data.length; i++){
        if(data[i][config.mz] == mass){index = i}
    }
    
    //saveMemory would only compute combinations that respect the golden Rules. Here we want all, even the one not respecting
    var pass = new AttributionPass(pass, 0, attribCfg)
    let possibilities = pass.prepareCombinations_singleMass(mass)

    let attribs = []
    //search for the best mass
    for(let i=0; i<possibilities.length; i++){
        let delta = possibilities[i].mass-mass
        if(Math.abs(delta)>0.1){continue}
        if(delta>1){break;}
        let ppmVal = 1e6*Math.abs(delta)/mass
        if(ppmVal<=ppm){
            possibilities[i].ppm = ppmVal
            attribs.push(possibilities[i])
        }
    }
    //search for a 13C peak
    const  mass13C = parseFloat(mass) + 1.003355
    const abundance13C = 0.010816
    let possible13C = []
    for(let i=1; i<data.length; i++){
        let delta = data[i][config.mz] - mass13C
        if(delta <-0.1){continue;}
        if(delta >0.1){break;}
        let ppmVal = 1e6*delta/mass13C
        if(Math.abs(ppmVal)<=ppm){ possible13C.push({data:data[i],ppm:ppmVal})}
    }
    possible13C.sort((a,b)=> Math.abs(a.ppm) - Math.abs(b.ppm))
    let isotoPeak = possible13C[0]
    if(isotoPeak){
        let ratio = 100*isotoPeak.data[config.intensity]/data[index][config.intensity]
        isotoPeak.ratio = ratio
        let expectedC = 100*ratio*abundance13C
        for(let i=0; i<attribs.length; i++){
            let numberC = attribs[i].lookup("C")
            attribs[i].checkCarbon = 100*expectedC/numberC
        }
    }    
    createPopupOfAttributions(attribs)
}

function createPopupOfAttributions(attrib){
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
    preText.innerHTML = "Attributions found: <br>"
    preText.innerHTML+="<br><br>"

    popup_box.appendChild(preText)
    var htmlTable = document.createElement("table")
    htmlTable.setAttribute("class","popuptable")
    var elLine = []
    var elCells = []
    //creates a table for elements in the pass
    for(let i=0; i<attrib.length+1; i++){
        elLine[i] = document.createElement("tr")
        elLine[i].setAttribute("name","divlink_"+i)
        elCells[i] = []
        for(let j=0; j<5; j++){
            elCells[i][j] = document.createElement("td")
            elLine[i].appendChild(elCells[i][j])
        }
        htmlTable.appendChild(elLine[i])
    }
    elCells[0][0].innerHTML= "Ion Formula"
    elCells[0][1].innerHTML= "ppm error"
    elCells[0][2].innerHTML= "DBE"
    elCells[0][3].innerHTML= "Valid rules"
    elCells[0][4].innerHTML= "<sup>13</sup>C %"
        for(let i=1; i<attrib.length+1; i++){
        var cleanFormula = attrib[i-1].name
        if(cleanFormula && typeof cleanFormula == "string"){
            var regex = new RegExp(/[0-9]/, "gi")
            cleanFormula = cleanFormula.replace(regex, function(matched) {return "<sub>" + matched + "</sub>";})
        }
        elCells[i][0].innerHTML = cleanFormula
        elCells[i][1].innerHTML = attrib[i-1].ppm.toFixed(6)
        elCells[i][2].innerHTML = attrib[i-1].dbe
        elCells[i][3].innerHTML = attrib[i-1].gRules
        let checkCarbon = attrib[i-1].checkCarbon
        if(!isNaN(checkCarbon)){checkCarbon = checkCarbon.toFixed(1)}
        elCells[i][4].innerHTML = checkCarbon
        if( elCells[i][4].innerHTML == "undefined"){elCells[i][4].innerHTML = "<sup>13</sup>C not found" }
    }
    preText.appendChild(htmlTable)
    //adds the search button
    var valButton = document.createElement("button")
    valButton.setAttribute("name","validateLinksButton")
    valButton.setAttribute("class","popupclose")
    valButton.addEventListener("click", function(){copyAttributionsOfPeak(attrib);closePopup(this);})
    valButton.innerHTML = "COPY"
    popup_box.appendChild(valButton)
    //finalizes the popup
    popup.setAttribute("class","popup")
    popup.setAttribute("name", "popup_"+name)
    popup.style.display ="block"
    popup_box.style.maxHeight = "90%"
    popup_box.style.overflow = "scroll";
    popup.appendChild(popup_box)
    main_popup.appendChild(popup)
    popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
}

/** returns to copy a text containing links stat data */
function copyAttributionsOfPeak(attrib){
    let text ="Formula"+ "\t" +"ppm error"+ "\t" +"DBE"+ "\t" + "checkRules" + "\t" + "13C (%)"+ "\n"
    for(let i=0; i<attrib.length; i++){
        text += attrib[i].name + "\t" + attrib[i].ppm + "\t" + attrib[i].dbe + "\t" + attrib[i].gRules + "\t" + attrib[i].checkCarbon+ '\n'
    }
    navigator.clipboard.writeText(text)
}

/** a function to generate a popup to paste a pass */
function buttonPressedPopupPastePass(passNum){
    console.log(this, passNum)
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
    preText.innerHTML = "Paste here your pass. 1 line for every element<br>3 columns separated by tabs for: element name, min value and max value.<br><br>"
    popup_box.appendChild(preText)

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
    valButton.addEventListener("click", function(){readPopupPastePass(passNum);closePopup(this);})
    valButton.innerHTML = "REPLACE CURRENT ATTRIBUTION PASS"
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
/** a function to read the popup created by buttonPressedPastePass */
function readPopupPastePass(){
   let popup = document.getElementsByName("popup_calib")[0]
   let pastedData  = popup.querySelector("textarea").value
   let parsedData = []
   let lbreak = pastedData.split(/\r?\n/);
   lbreak.forEach(res => {
       parsedData.push(res.split("\t"));
   });
   let pastedPass = []
   for(let i=0; i<parsedData.length; i++){
       let newObject = {}
       if(parsedData[i].length <3){continue;}
       newObject.name = parsedData[i][0]
       newObject.mass = new ChemFormula(newObject.name).mass
       newObject.count = [parseInt(parsedData[i][1]),parseInt(parsedData[i][2])]
       pastedPass.push(newObject)
   }

    //counts how many attributions could be made from this pass
   var possibilites = 0
   for(let i=0; i<pastedPass.length; i++){
       let thisPassPoss = (pastedPass[i].count[1] - pastedPass[i].count[0])+1
       if(possibilites ==0){possibilites = thisPassPoss}
       else if(thisPassPoss >0){possibilites *= thisPassPoss}
    }
   if(possibilites >4e6){
       alertPopup("Warning ! This pass contains more than 4 million possible combinations ("+possibilites+"). It could prove long to compute")
   }
   //tries to close the pass popup
   let passPopup = document.querySelector(".pass, div[name='popup_pass']")
   let passPopupChild1 = passPopup.querySelector("button")
   if(passPopupChild1){
       let passPopupChild2 = passPopupChild1.querySelector("button")
       if(passPopupChild2){
           closePopup(passPopupChild2)
           buttonPressedCustomizePass(pastedPass, -2, false)
       }
   }
}


/********************************************************************* */
/*                    STARTING COMPUTATION                             */
/********************************************************************* */

html_tabAttrib.querySelector("button[id='calculate_attrib']").addEventListener("click",pressAttribButton)

/** function started when the "compute" button is pressed for attribution */
async function pressAttribButton(){
    //makes sure that the right charge is applied to every pass
    for(let i=0; i<attribPasses.deNovo.length; i++){
        setPassCharge(attribPasses.deNovo[i], attribCfg.main.charge)
    }
    //searches for the file selected
    clearLogBox("attribLog")
    var dataID = parseInt(attribCfg.main.fileString.slice(5))
    if(!(dataID>=0) || !files.list[dataID]){logText("attribLog","error of file selection. Please select a valid file.");return;}
    var data = files.list[dataID].data
    if(!data || !data[0]){logText("attribLog","Error: please select a file containing data");return;}
    attrib.fillFromName(attribCfg.main.fileString)

    attrib.cfg = attribCfg
    attribData = {}
    //starts the asked algorithm
    let results = await attrib.attribute()
    attribData = results

    logText("attribLog",'<b>Press "Validate Results" if you want to keep results<b>')
    startCanvasAttrib()
}

html_tabAttrib.querySelector("button[id='save_attrib']").addEventListener("click",pressSaveAttribButton)

function pressSaveAttribButton(){
    var popup = new Popup("saveAttrib", "Please specify how you want to save your attributed data")
    var buttons = [
        {"name":"Add as a file state","function":saveAttribution_replaceDataFile},
        {"name":"Add as a new file assigned","function":saveAttribution_addNewFile,"arg1":"attributed"},
        {"name":"Add as a new file UNassigned","function":saveAttribution_addNewFile,"arg1":"unattributed"},
        {"name":"Add as a new file both","function":saveAttribution_addNewFile,"arg1":"both"},
      ]
      var text = "Please specify how you want to save your attributed data"
      popup.buildInputs([], [], buttons)
      popup.valButton.remove()
      let button1 = popup.popup.querySelector("button[name='popup_button_0']")
      button1.style.marginBottom = '10px'
}

function saveAttribution_replaceDataFile(){
    var dataID = parseInt(attribCfg.main.fileString.slice(5))
    if(!(dataID>=0)){return;}
    var file = files.list[dataID]
    var data = file.data
    if(!data || !data[0]){return;}
    var newData = attribData.matrix
    var newDataClean = [] //duplicate
    if(!newData || !newData[0]){return;}
    //duplicate the data
    for(let i=0; i<newData.length; i++){
        newDataClean[i]=[]
        for(let j=0; j<newData[i].length; j++){
            newDataClean[i][j] = newData[i][j]
        }
    }
    //adds the new file state
    file.addFileState("attributed",newDataClean, true)
    saveAttribMetadata(file)
    //updates the log
    file.logs.push("Attribution made with Punc'data")
    let text = "All non-attributed peaks were removed <br>"
    file.logs.push("All non-attributed peaks were removed")
    if(attribData.unattributed && attribData.unattributed.length>0){text += "Non-attributed peaks removed: "+attribData.unattributed.length+"<br>"}
    if(attribData.isotopes && attribData.isotopes.length>0){text += "Isotopic peaks removed: "+attribData.isotopes.length+"<br>" }
    if(attribData.suspects && attribData.suspects.length>0){text += "Suspect peaks removed: "+attribData.suspects.length+"<br>" }
    if(attribData.attributed && attribData.attributed.length>0){text += "Attributed peaks: "+attribData.attributed.length+"<br>"}
    file.logs.push(text)
    //finds the columns if needed
    if(!config.formulatext){
        autoSetupColumns(attribData.matrix[0])
        columnNames = attribData.matrix[0]
    }
    generalFilesUpdate();
}

async function saveAttribution_addNewFile(whichData){
    //finds the new name
    var name =""
    var newData = []
    var newDataClean = [] //duplicate
    if(whichData == "attributed" || whichData == "both"){
        name = "attributed"
        newData = attribData.matrix
    }else if(whichData =="unattributed"){
        name = "unattributed"
        newData = attribData.unattributed
    }
    var dataID = parseInt(attribCfg.main.fileString.slice(5))
    if(dataID>=0 && (whichData == "attributed" || whichData == "both")){name = files.list[dataID].name+"_assigned"}
    else if(dataID>=0 && whichData == "unattributed"){name = files.list[dataID].name+"_unassigned" }
    if(!newData || !newData[0]){return;}
    //duplicate the data
    for(let i=0; i<newData.length; i++){
        newDataClean[i]=[]
        for(let j=0; j<newData[i].length; j++){
            newDataClean[i][j] = newData[i][j]
        }
    }
    //finds an empty slot for a file
    var chosenSlot = -1;
    for(let j=0; j<files.list.length; j++){
    if(Object.keys(files.list[j].data).length ===0){
        chosenSlot = j;
        files.list[j].data=[]//fills with random input the data slot so that it will not be considered empty by the loop
        break;
        }
    }
    //if there is no empty slot, create a new slot
    if(chosenSlot == -1){
        createNewFileSlot()
        chosenSlot = files.list.length -1
    }
    var adder = 1
    //loops through the names to see if it founds one with the same name
    for(let i=0; i<files.list.length; i++){
        if(files.list[i].name == name+"_"+adder){adder +=1}
        else if(files.list[i].name == name){adder += 1}
    }
    if(adder >1){name += "_"+adder}

    //duplicates the calib status
    duplicateCalibStatus(dataID, chosenSlot)

    files.list[chosenSlot].name = name
    files.list[chosenSlot].data = newDataClean
    //updates the log
    files.list[chosenSlot].logs.push("Attribution made with Punc'data")
     if(whichData == "attributed" || whichData == "both"){
        if(attribData.attributed && attribData.attributed.length){
            files.list[chosenSlot].logs.push("Attributed peaks kept here:"+attribData.attributed.length)
            files.list[chosenSlot].state = "attributed"
            saveAttribMetadata(files.list[chosenSlot])
        }
     }else if(whichData =="unattributed"){
        if(attribData.unattributed && attribData.unattributed.length){
            files.list[chosenSlot].logs.push("Unattributed peaks kept here:"+(attribData.unattributed.length - 1))
        }
     }

     
    if(whichData == "both"){saveAttribution_addNewFile("unattributed")}
    //finds the columns if needed
    if(!config.formulatext && (whichData == "attributed" || whichData == "both")){
        autoSetupColumns(attribData.matrix[0])
        columnNames = attribData.matrix[0]
    }
    generalFilesUpdate();
}

/** duplicates the calibration status when saving a file to another location */
function duplicateCalibStatus(origin, target){
    if(!files.list[origin] || !files.list[target]){return;}
    let calibOrigin = files.list[origin].metadata.calibration
    let calibTarget = files.list[target].metadata.calibration
    if(!calibTarget || !calibOrigin){return;}
    calibTarget.points = []
    if(!calibOrigin || !calibOrigin.points){ return;}

    for(let i=0; i<calibOrigin.points.length; i++){
        let newPoint = []
        if(!calibOrigin.points[i] || !calibOrigin.points[i][0]){ continue;}
        for(let j=0; j<calibOrigin.points[i].length; j++){
            newPoint[j] = calibOrigin.points[i][j]
        }
        calibTarget.points.push(newPoint)
    }
    calibTarget.method = calibOrigin.method
    calibTarget.equation = calibOrigin.equation
    calibTarget.residualError = calibOrigin.residualError
}

function saveAttribMetadata(file){
    let meta = {}
    let savedMeta = attribData.log
    meta.time = savedMeta.time
    meta.attribByNetwork = savedMeta.attribByNetwork
    meta.peakLength_raw = savedMeta.peakLength_raw
    meta.peakLength_iso = savedMeta.peakLength_iso
    meta.peakLength_att = savedMeta.peakLength_att
    meta.peakLength_rem = savedMeta.peakLength_rem
    file.metadata.attribution = meta
    console.log(file.metadata.attribution)
}


/********************************************************************* */
/*                    CANVAS MENU                                      */
/********************************************************************* */
var menu_editcellsAttrib2 = document.getElementsByName("cell_selection_attrib")
for(let i=0; i<menu_editcellsAttrib2.length; i++){
    menu_editcellsAttrib2[i].addEventListener("change", createMenuAttrib_canvas)
}

//clicking to activate
document.querySelector('input[name="cell_selection_attrib"][value="1"]').click()
document.querySelector('input[name="cell_selection_attrib"][value="0"]').click()

function createMenuAttrib_canvas(){
    if(debug){console.log("creating/updating the Attribution canvas menu ...")}

    var html_menu = document.getElementById("cell_menu_attrib").parentNode
    d3.select("#cell_menu_attrib").remove()

    var new_menu = document.createElement("div");
    var table = document.createElement("table");
    var lines= [];
    for(let i=0; i<7; i++){
        column = document.createElement("tr")
        lines[i] = document.createElement("td")
        column.appendChild(lines[i])
        table.appendChild(column)
    };
    
    //creates the cell type options
    lines[0].innerHTML = "Type of cell:";
    var typeInput = document.createElement("select");
    var cell_choice = document.querySelector('input[name="cell_selection_attrib"]:checked').value - 1 
    var cfg = cfgAttribDraw.canvas[cell_choice]
    typeInput.id = "cell_menu_typeinput_Attrib";
    if(cell_choice != -1 && cell_choice != 3){
        lines[0].appendChild(typeInput)
        var options = [
            {id:"none", name:"Empty"},
            {id:"errorPlot", name:"Errors plot"},
            {id:"massSpectra", name:"Mass spectra"},
            {id:"kendrick", name:"Kendrick plot"},
            {id:"histoError", name:"Errors histogram"},
            {id:"henryPlot", name:"Normal probability"},
        ]
        for(let i=0; i<options.length; i++){
            var option = document.createElement("option");
            option.value = options[i].id;
            option.innerHTML = options[i].name;
            typeInput.appendChild(option);
        }
    }


    new_menu.id = "cell_menu_attrib";
    new_menu.addEventListener("change", updateMenuAttrib_cvs)
    new_menu.dataset.value = cell_choice;
    new_menu.appendChild(table)
    html_menu.appendChild(new_menu)

    if(cell_choice == -1){
        //for main menu here
        lines[0].innerHTML = "Main chart cfg menu"

        var opacityInput = document.createElement("input")
        opacityInput.setAttribute("name","opacity")
        lines[1].innerHTML = "Opacity : "
        lines[1].appendChild(opacityInput)
        lines[1].innerHTML += "%"
        table.querySelector("input[name='opacity']").setAttribute("value",100*cfgAttribDraw.main.opacity)
        return
    }if(cell_choice == -2){
        //for main menu here
        lines[0].innerHTML = "Pie chart"

        var html_showIsotopes = document.createElement("input")
        html_showIsotopes.type = "checkbox"
        html_showIsotopes.setAttribute("name","showIsotopes")
        lines[1].appendChild(html_showIsotopes)
        lines[1].innerHTML += "Ignore isotopic peaks"
        if(!cfgAttribDraw.pie){cfgAttribDraw.pie = {}}
        lines[1].querySelector('input[name="showIsotopes"]').checked = cfgAttribDraw.pie.ignoreIsotopes

        menuCreate_checkbox(lines[2], "hideOthers",cfgAttribDraw.pie.ignoreOthers)
        lines[2].innerHTML += "Ignore removed peaks"

        var html_selectType = document.createElement("select")
        html_selectType.setAttribute("name","selectType")
        var option1 = document.createElement("option")
        var option2 = document.createElement("option")
        option1.setAttribute("value","number")
        option2.setAttribute("value","intensity")
        option1.innerHTML = "Relative to number of attributions"
        option2.innerHTML = "Relative to total intensity"
        html_selectType.appendChild(option1);
        html_selectType.appendChild(option2);
        lines[3].appendChild(html_selectType)
        lines[3].querySelector('select[name="selectType"]').value = cfgAttribDraw.pie.mode || "number"
        return;
    }else if(cell_choice == 3){
        let hideUnattrib = document.createElement("input")
        hideUnattrib.setAttribute("name","hideUnattributed")
        hideUnattrib.setAttribute("type","checkbox")
        let hideAttrib = document.createElement("input")
        hideAttrib.setAttribute("name","hideAttributed")
        hideAttrib.setAttribute("type","checkbox")
        let hideIsotopes = document.createElement("input")
        hideIsotopes.setAttribute("name","hideIsotopes")
        hideIsotopes.setAttribute("type","checkbox")
        let hideCalib = document.createElement("input")
        hideCalib.setAttribute("name","hideCalib")
        hideCalib.setAttribute("type","checkbox")
        let hideOthers = document.createElement("input")
        hideOthers.setAttribute("name","hideOthers")
        hideOthers.setAttribute("type","checkbox")
        lines[1].appendChild(hideUnattrib)
        lines[2].appendChild(hideAttrib)
        lines[3].appendChild(hideIsotopes)
        lines[4].appendChild(hideCalib)
        lines[5].appendChild(hideOthers)

        lines[1].innerHTML += "Hide unattributed data"
        lines[2].innerHTML += "Hide attributed data"
        lines[3].innerHTML += "Hide isotopic peaks"
        lines[4].innerHTML += "Hide calibration dots"
        lines[5].innerHTML += "Hide other peaks"
        lines[1].querySelector("input[name='hideUnattributed']").checked = cfgAttribDraw.data.hideUnattrib
        lines[2].querySelector("input[name='hideAttributed']").checked = cfgAttribDraw.data.hideAttrib
        lines[3].querySelector("input[name='hideIsotopes']").checked = cfgAttribDraw.data.hideIsotopes
        lines[4].querySelector("input[name='hideCalib']").checked = cfgAttribDraw.data.hideCalib
        lines[5].querySelector("input[name='hideOthers']").checked = cfgAttribDraw.data.hideOthers

        return;
    }

    typeInput.value = cfgAttribDraw.canvas[cell_choice].type
    var type = typeInput.value
    if(type=="none"){return;}
    //creates the common elements for all cells: X and Y values to be entered
    lines[1].innerHTML = "X: "
    lines[2].innerHTML = "Y: "
    lines[1].innerHTML += "["
    lines[2].innerHTML += "["
    var html_xmin = document.createElement("input")
    var html_xmax = document.createElement("input")
    var html_ymin = document.createElement("input")
    var html_ymax = document.createElement("input")
    html_xmin.type ="number"
    html_xmax.type ="number"
    html_ymin.type ="number"
    html_ymax.type ="number"
    lines[1].appendChild(html_xmin)
    lines[1].appendChild(html_xmax)
    lines[2].appendChild(html_ymin)
    lines[2].appendChild(html_ymax)
    html_xmin.setAttribute("name","xmin")
    html_xmax.setAttribute("name","xmax")
    html_ymin.setAttribute("name","ymin")
    html_ymax.setAttribute("name","ymax")
    lines[1].innerHTML += "]"
    lines[2].innerHTML += "]"
    if(type == "errorPlot"){
        var html_dotSize = document.createElement("input")
        html_dotSize.type = "number"
        html_dotSize.setAttribute("name","dotSize")
        lines[3].innerHTML += "Size:"
        lines[3].appendChild(html_dotSize)   
        var html_meanLine = document.createElement("input")
        html_meanLine.type = "number"
        html_meanLine.setAttribute("name","meanLine")
        lines[4].innerHTML += "Mobile mean range:"
        lines[4].appendChild(html_meanLine)   
        table.querySelector("input[name='dotSize']").setAttribute("value",cfg.dotSize)
        table.querySelector("input[name='meanLine']").setAttribute("value",cfg.meanLine)
    }else if(type == "massSpectra"){
        var html_ytype = document.createElement("select");
        lines[3].appendChild(html_ytype);
        html_ytype.setAttribute("name","ytype");
        var options= []
        options[0] = document.createElement("option")
        options[1] = document.createElement("option")
        options[0].setAttribute("value","absolute")
        options[1].setAttribute("value","relative")
        options[0].innerHTML = "Absolute intensity"
        options[1].innerHTML = "Relative intensity(of total peaklist)"
        html_ytype.appendChild(options[0])
        html_ytype.appendChild(options[1])
        lines[3].appendChild(html_ytype);
        if(cfg.ytype == "relative"){
            setSelectVal(lines[3], "ytype", "relative")
        }else{
            setSelectVal(lines[3], "ytype", "absolute")
        }     
    }else if(type == "kendrick"){
        //for kendrick maps, needs to create the x selecter (m/z or NKM) and the kendrick mass creator
        var html_xtype = document.createElement("select");
        html_xtype.setAttribute("name","xtype")
        var options = [];
        options[0] = document.createElement("option");
        options[1] = document.createElement("option");
        options[0].setAttribute("value", "m/z")
        options[1].setAttribute("value", "NKM")
        options[0].innerHTML = "m/z"
        options[1].innerHTML = "NKM"
        html_xtype.appendChild(options[0])
        html_xtype.appendChild(options[1])
        lines[1].appendChild(html_xtype)
        //to see deltas from expM/z or from calcm/z when possible
        var html_ytype = document.createElement("select");
        html_ytype.setAttribute("name","ytype")
        var options2 = [];
        options2[0] = document.createElement("option");
        options2[1] = document.createElement("option");
        options2[0].setAttribute("value", "exp")
        options2[1].setAttribute("value", "calc")
        options2[0].innerHTML = "Exp m/z"
        options2[1].innerHTML = "Calc m/z"
        html_ytype.appendChild(options2[0])
        html_ytype.appendChild(options2[1])
        lines[2].appendChild(html_ytype)

        var html_buttonSize = document.createElement("input")
        var html_dotSize = document.createElement("input")
        html_buttonSize.type = "checkbox"
        html_dotSize.type = "number"
        html_buttonSize.setAttribute("name","buttonSize")
        html_dotSize.setAttribute("name","dotSize")
        lines[3].appendChild(html_buttonSize)
        lines[3].innerHTML += "Size:"
        lines[3].appendChild(html_dotSize)
        html_dotSize.setAttribute("value", cfg.dotSize || 1)

        var html_radio = []
        for(let i=0; i<3; i++){
            html_radio[i] = document.createElement("input");
            html_radio[i].setAttribute("type", "radio");
            html_radio[i].setAttribute("name", "kendrick_cvsAttrib");
        }
        html_radio[0].setAttribute("value","list");
        html_radio[1].setAttribute("value","mz");
        html_radio[2].setAttribute("value","formula");
        lines[4].appendChild(html_radio[0])
        lines[6].appendChild(html_radio[1])
        lines[5].appendChild(html_radio[2])

        var html_kselector = document.createElement("select")
        html_kselector.setAttribute("name","kselect")
        var html_kmass = document.createElement("input")
        html_kmass.setAttribute("type","number")
        html_kmass.setAttribute("name","kmass")
        var html_kformula = document.createElement("input")
        html_kformula.setAttribute("type","text")
        html_kformula.style["width"] = "35%";
        html_kformula.setAttribute("name","kformula")
        html_kmass.style["width"] = "35%";
        var html_kdivisor = document.createElement("input")
        html_kdivisor.setAttribute("type","number")
        html_kdivisor.setAttribute("name","kdivisor")
        //Create and append the options
        for (var i = 0; i < kendrickmasslist.length; i++) {
        var option = document.createElement("option");
        option.value = kendrickmasslist[i].mass+"-"+kendrickmasslist[i].name; //separates the data with a dash
        option.text = kendrickmasslist[i].name+'  ('+kendrickmasslist[i].mass+')';
        if(kendrickmasslist[i].name == "SPLITTER"){option.text ="----------------"} //makes a nice splitter div
        html_kselector.appendChild(option);
        }
        lines[4].appendChild(html_kselector)
        lines[6].appendChild(html_kmass)
        lines[5].appendChild(html_kformula)
        lines[6].innerHTML += " / "
        lines[6].appendChild(html_kdivisor)   
        var tempo = 0 //0 for list, 1 for formula, 2 for mass
        if(cfg.kendrickMethod=="formula"){tempo = 1}else if(cfg.kendrickMethod=="mz"){tempo = 2};
        lines[3].querySelector('input[name="buttonSize"]').checked = cfg.relativeSize
        if(cfg.xtype == "NKM"){lines[1].querySelector('select[name="xtype"]').value = cfg.xtype}
        else{lines[1].querySelector('select[name="xtype"]').value = "m/z"}
        setSelectVal(lines[4], "kselect", cfg.kendrickChoice)
        lines[5].querySelector('input[name="kformula"]').value = cfg.kendrickFormula
        lines[6].querySelector('input[name="kmass"]').value = cfg.kendrickMass
        lines[6].querySelector('input[name="kdivisor"]').value = cfg.kendrickDivisor || 1
        //
        table.querySelector("input[name='xmin']").setAttribute("value",cfg.xmin)
        table.querySelector("input[name='xmax']").setAttribute("value",cfg.xmax)
        table.querySelector("input[name='ymin']").setAttribute("value",cfg.ymin)
        table.querySelector("input[name='ymax']").setAttribute("value",cfg.ymax)
        //refresh table variable
        table = document.getElementById("cell_menu_attrib")
        //refresh only if has already been drawn at least once and elements exist
        if(cvsAttrib.canvas[cell_choice].axes){
            table.querySelectorAll('input[name="kendrick_cvsAttrib"]')[tempo].click() 
        }
    }else if(type =="histoError"){
        var html_barsNum = document.createElement("input")
        html_barsNum.type = "number"
        html_barsNum.setAttribute("name","barsNum")
        lines[3].innerHTML += "Number of bars:"
        lines[3].appendChild(html_barsNum) 
        table.querySelector("input[name='barsNum']").setAttribute("value",cfg.barsNum)
    }else if(type == "henryPlot"){
        var html_barsNum = document.createElement("input")
        html_barsNum.type = "number"
        html_barsNum.setAttribute("name","barsNum")
        lines[3].innerHTML += "Sampling bins:"
        lines[3].appendChild(html_barsNum) 
        table.querySelector("input[name='barsNum']").setAttribute("value",cfg.barsNum)
    }
    table.querySelector("input[name='xmin']").setAttribute("value",cfg.xmin)
    table.querySelector("input[name='xmax']").setAttribute("value",cfg.xmax)
    table.querySelector("input[name='ymin']").setAttribute("value",cfg.ymin)
    table.querySelector("input[name='ymax']").setAttribute("value",cfg.ymax)
}


function updateMenuAttrib_cvs(){
    if(debug){console.log("detecting a change in the canvas attribution cell table. Updating.")}
    var cvsX = cvsAttrib
    var cfgX = cfgAttribDraw
    var table = this.children[0]
    var tableRows = []
    for(let i=0; i<table.children.length; i++){
        tableRows[i]=table.children[i].children[0]
    }
    var cellNum = this.dataset.value
    //special case of main menu
    if(cellNum == -1){
        cfgAttribDraw.main.opacity = 0.01*parseFloat(table.querySelector('input[name="opacity"]').value)
        startCanvasAttrib();
        return;
    }else if(cellNum == 3){
        cfgX.data.hideUnattrib = table.querySelector('input[name="hideUnattributed"]').checked
        cfgX.data.hideAttrib = table.querySelector('input[name="hideAttributed"]').checked
        cfgX.data.hideIsotopes = table.querySelector('input[name="hideIsotopes"]').checked
        cfgX.data.hideCalib = table.querySelector('input[name="hideCalib"]').checked
        cfgX.data.hideOthers = table.querySelector('input[name="hideOthers"]').checked
        startCanvasAttrib();
        return;
    }else if(cellNum == -2){
        cfgAttribDraw.pie.ignoreIsotopes = table.querySelector('input[name="showIsotopes"]').checked
        cfgAttribDraw.pie.ignoreOthers = table.querySelector('input[name="hideOthers"]').checked
        cfgAttribDraw.pie.mode =  table.querySelector('select[name="selectType"]').value
        drawDataAttrib_pieChart(cvsAttrib, cfgAttribDraw, [attribData.unattributed, attribData.attributed, attribData.isotopes, attribData.suspects])
        return;
    }
    var cfg = cfgX.canvas[cellNum]
    var cellType = table.querySelector("#cell_menu_typeinput_Attrib").value
    if( cellType != cfgX.canvas[cellNum].type){
        changeCellType = true;
        if(debug){console.log("changing cell type to : "+cellType)}
        cfgX.canvas[cellNum].type = cellType
        createMenuAttrib_canvas()
        createCellAttrib( cellNum, cellType)
        return;
    }
    cfg.xmin = table.querySelector('input[name="xmin"]').value
    cfg.xmax = table.querySelector('input[name="xmax"]').value
    cfg.ymin = table.querySelector('input[name="ymin"]').value
    cfg.ymax = table.querySelector('input[name="ymax"]').value
    if(cellType == "errorPlot"){
        cfg.dotSize = table.querySelector('input[name="dotSize"]').value
        cfg.meanLine = table.querySelector('input[name="meanLine"]').value
    }else if(cellType == "massSpectra"){
        cfg.ytype = table.querySelector('select[name="ytype"]').value
    }else if(cellType =="kendrick"){
        cfg.dotSize = parseFloat(table.querySelector('input[name="dotSize"]').value)
        cfg.relativeSize = table.querySelector('input[name="buttonSize"]').checked
        var kendupdate = "";
        if(cfg.kendrickMethod != table.querySelector('input[name="kendrick_cvsAttrib"]:checked').value){kendupdate += "choice";}
        if(cfg.kendrickChoice != table.querySelector('select[name="kselect"]').value){kendupdate +="list";}
        if(cfg.kendrickFormula != table.querySelector('input[name="kformula"]')){kendupdate +="formula";}
        cfg.xtype = table.querySelector('select[name="xtype"]').value
        cfg.ytype = table.querySelector('select[name="ytype"]').value
        cfg.kendrickMethod = table.querySelector('input[name="kendrick_cvsAttrib"]:checked').value
        cfg.kendrickChoice = table.querySelector('select[name="kselect"]').value
        cfg.kendrickMass = parseFloat(table.querySelector('input[name="kmass"]').value)
        cfg.kendrickDivisor = parseFloat(table.querySelector('input[name="kdivisor"]').value)
        cfg.kendrickFormula = table.querySelector('input[name="kformula"]').value
        //recalcultates kendrick mass where needed
            if(kendupdate.includes("list") && cfg.kendrickMethod == "list"){
                var textlinedata = cfg.kendrickChoice.split('-');
                cfg.kendrickMass = parseFloat(textlinedata[0]);
                cfg.kendrickFormula = textlinedata[1];
                table.querySelector('input[name="kmass"]').value = cfg.kendrickMass
                table.querySelector('input[name="kformula"]').value = cfg.kendrickFormula
            }else if(kendupdate.includes("formula") && cfg.kendrickMethod == "formula") {
                var formula = new ChemFormula(cfg.kendrickFormula)
                cfg.kendrickMass = formula.mass;
                table.querySelector('input[name="kmass"]').value = cfg.kendrickMass
            }
    }else if(cellType =="histoError"){
        cfg.barsNum = table.querySelector('input[name="barsNum"]').value
    }else if(cellType =="henryPlot"){
        cfg.barsNum = table.querySelector('input[name="barsNum"]').value
    }
    //could be improved by creating a specific update function and not redrawing everytime the whole cell, such as done in classical canvas
    createCellAttrib(cellNum, cellType)
    drawDataSetAttrib(cellNum) 

}


/********************************************************************* */
/*                    CANVAS CREATION                                  */
/********************************************************************* */

/**This part is a work in progress, because it should be remade as per the new canvas method with classes */
/**It wasn't yet made, by lack of time */
/**TODO */

function startCanvasAttrib(){
    for(let i=0; i<3; i++){
        createCellAttrib( i, cfgAttribDraw.canvas[i].type)
        drawDataSetAttrib(i) 
    }
    drawDataAttrib_pieChart(cvsAttrib, cfgAttribDraw, [attribData.unattributed, attribData.attributed, attribData.isotopes, attribData.suspects])

}


function createCellAttrib(cellNum, cellType){
    if(debug){console.log("creating attrib canvas cell n°"+cellNum+" ("+cellType+")")}
    //find data path
    var cvsX = cvsAttrib
    var cfgX = cfgAttribDraw
    cellNum = parseInt(cellNum)
    var cfg = cfgX.canvas[cellNum]
    var cell = cvsX.canvas[cellNum]

    var nextCellNum = cellNum+1
    document.querySelector("#canvasAttrib").querySelector("#cell"+cellNum).remove()
    cell.self= appendCell("#canvasAttrib","cell"+cellNum, "#cell"+nextCellNum)
    if(cellType=="none"){return;}
    cell.clipPath = appendClipPath(cvsX.canvas[cellNum].self, "clipCvsAttribCell"+cellNum)
    cell.background = appendBackColor(cvsX.canvas[cellNum].self)

    if(cellType=="pieChart"){return;}

    cell.scales=[];
    cell.scales[0] = d3.scaleLinear().domain([cfg.xmin, cfg.xmax]).range([0, config.width]);
    cell.scales[1]= d3.scaleLinear().domain([cfg.ymin, cfg.ymax]).range([config.height, 0]);
    if(!cell.data){cell.data = []}
    if(cellType == "henryPlot"){
        cell.axes=[];
        cell.axes[0] = appendAxis_x(cell.self ,cell.scales[0],config.height/2)
        cell.axes[1] = cell.self.append("g")
          .attr("transform", "translate("+config.width/2 + ",0)")
          .style("font-family",config.legendFont)
          .style("font-size", config.legendFontSizeSmall)
          .style("letter-spacing","-0.1em")
          .call(d3.axisLeft(cell.scales[1]));
          return;
    }

    cell.axes=[];
    cell.axes[0]= appendAxis_x(cell.self, cell.scales[0], config.height, cfg.xmax)
    cell.axes[1]= appendAxis_y(cell.self, cell.scales[1], cfg.ymax)
    appendLine(cell.self, 4, "grey")

    if(config.boxBorders){
        cell.boxBorders = appendBoxScales(cell.self, cell.scales[0], cell.scales[1])
    }

    
    let axisOptions = {}
    if(config.endAxis){axisOptions.mode = "endAxis"}
    if(cellType == "errorPlot"){
        cell.axesLabels=[];
        cell.axesLabels[0]= appendAxisLabel_x(cell.self, "m/z",axisOptions);
        cell.axesLabels[1]= appendAxisLabel_y(cell.self, "ppm error",axisOptions);
        if(!config.nogrid){
            cell.grids = [];
            cell.grids[0] = appendPlotGrid(cell.self, cell.scales[0],config.axisLines, "bottom");
            cell.grids[1] = appendPlotGrid(cell.self, cell.scales[1],config.axisLines,"side");
          }
    }else if(cellType == "massSpectra"){
        cell.axesLabels=[];
        cell.axesLabels[0]= appendAxisLabel_x(cell.self, "m/z",axisOptions);
        cell.axesLabels[1]= appendAxisLabel_y(cell.self, "Intensity",axisOptions);
        if(cfg.ytype == "relative"){
            cell.axesLabels[1].text("Relative Intensity (%)")
        }
        if(!config.nogrid){
            cell.grids = [];
            cell.grids[1] = appendPlotGrid(cell.self, cell.scales[1],config.axisLines,"side");
          }
    }else if(cellType == "kendrick"){
        cell.axesLabels=[];
        cell.axesLabels[0]= appendAxisLabel_x(cell.self, cfg.xtype,axisOptions);
        cell.axesLabels[1]= appendAxisLabel_y(cell.self, config.kendrickText+"("+cfg.kendrickFormula+")",axisOptions);
        if(!config.nogrid){
            cell.grids = [];
            cell.grids[0] = appendPlotGrid(cell.self, cell.scales[0],config.axisLines, "bottom");
            cell.grids[1] = appendPlotGrid(cell.self, cell.scales[1],config.axisLines*2,"side");
          }
    }else if(cellType == "histoError"){
        cell.axesLabels=[];
        cell.axesLabels[0]= appendAxisLabel_x(cell.self, "ppm error",axisOptions);
        cell.axesLabels[1]= appendAxisLabel_y(cell.self, "%",axisOptions);
    }
    cellBrushingAttrib("Attrib", cellNum)

    if(cfg.type =="errorPlot" || cfg.type == "massSpectra" || cfg.type =="kendrick"){
        cell.self.on("wheel",function(d){
            if(event.shiftKey){
                let mouse = d3.pointer(d)
                //recomputes the % at which the mouse is at
                mouse[0] = (mouse[0]/config.width)-0.5
                mouse[1] = (mouse[1]/config.height)-0.5
                let domainWidth = cfg.xmax - cfg.xmin
                let domainHeight = cfg.ymax - cfg.ymin
                //defines the status before any zoom, to revert back to it by double click
                if(!cfg.oldCoordinates){
                    cfg.oldCoordinates = [[cfg.xmin,cfg.xmax],[cfg.ymin,cfg.ymax]]
                }
                if(d.deltaY < 0){ //zooming in
                    cfg.xmin +=  (mouse[0]+0.5)*domainWidth/10 
                    cfg.xmax += (mouse[0]-0.5)*domainWidth/10
                    cfg.ymin -= (mouse[1]-0.5)*domainHeight/10 
                    cfg.ymax -= (mouse[1]+0.5)*domainHeight/10 
                }else if(d.deltaY > 0){ //zooming out
                    cfg.xmin -= (mouse[0]+0.5)*domainWidth/10 
                    cfg.xmax -= (mouse[0]-0.5)*domainWidth/10 
                    cfg.ymin += (mouse[1]-0.5)*domainHeight/10 
                    cfg.ymax += (mouse[1]+0.5)*domainHeight/10 
                }
                updateCellAttrib(cellNum, cfg.type, "x_y_")
            }
        })
    }

    // if(cellType !="histogram" && cellType !="histogramMatrix" && cellType !="density" && cellType !="histoclass"){
    //     cellBrushing(cvsLetter, cellNum)
    // }else{
    //     cellFiltrationX(cvsLetter, cellNum)
    // }

}


/** a function to dispatch the updating process to the correct type of cell */
function drawDataSetAttrib(cellNum){
    var cvsX = cvsAttrib
    var cfgX = cfgAttribDraw
    var cellType = cfgX.canvas[cellNum].type
    var dataSets = [attribData.unattributed, attribData.attributed, attribData.isotopes, attribData.suspects]
    //find data path
    for(let i=0; i<dataSets.length; i++){
        if(i ==0 && cfgAttribDraw.data.hideUnattrib){continue;}
        if(i ==1 && cfgAttribDraw.data.hideAttrib){continue;}
        if(i ==2 && cfgAttribDraw.data.hideIsotopes){continue;}
        if(i ==3 && cfgAttribDraw.data.hideOthers){continue;}
        if(dataSets[i] == undefined|| dataSets[i].length == 0){
            d3.selectAll("#canvas"+cfgX.letter+" #cell"+cellNum+"data"+i).remove()
            continue;}
        if(cellType == "errorPlot"){ drawDataAttrib_errorPlot(cvsX, cfgX, cellNum, i, dataSets[i])}
        else if(cellType == "massSpectra"){
            cfgX.canvas[cellNum].maxInt = computeMaxFromMultipleDatasets(dataSets, config.intensity)
            drawDataAttrib_massSpectra(cvsX, cfgX, cellNum, i, dataSets[i])
        }
        else if(cellType == "kendrick"){
            let mzCol = config.mz
            let data = dataSets[i]
            if(i == 1){
                if(cfgX.canvas[cellNum].ytype == "exp"){mzCol = config.mz}
                else{
                    data = []
                    //this is a dirty implementation, but since this whole canvas should be remade in line with script_matrix I didn't bother
                    for(let j=0; j<dataSets[i].length; j++){
                        let peak = []
                        peak[config.mz] = dataSets[i][j].attrib.mass
                        peak[config.intensity] = dataSets[i][j][config.intensity]
                        data.push(peak)
                    }
                }
            }
            if(!cvsX.sideData[i]){cvsX.sideData[i]= {"kendrick":[],"bins":[],"binsMax":[]}}
            calculateKM(cvsX, cfgX, cellNum, i, data, mzCol)
            drawDataAttrib_kendrick(cvsX, cfgX, cellNum, i, dataSets[i])
        }
        else if(cellType == "histoError"){
            drawDataAttrib_histoError(cvsX,cfgX, cellNum, i,dataSets[i])
        }else if(cellType == "henryPlot" && i == 1){
            drawDataAttrib_henryPlot(cvsX,cfgX, cellNum, i,dataSets[i])
        }
    }
}

function drawDataAttrib_errorPlot(cvsX, cfgX, cellNum, dataNum, data){
    if(debug){console.log("drawing on attribCvs the data scatter plot n°"+dataNum)}
    var cell = cvsX.canvas[cellNum]
    var cfg = cfgX.canvas[cellNum]
    var xscale = cell.scales[0]
    var yscale = cell.scales[1]
    d3.selectAll("#canvas"+cfgX.letter+" #cell"+cellNum+"data"+dataNum).remove()

    var xtype = config.mz
    var ytype = config.ppmerror
    var color = "#df4f50"
    if(dataNum == 1){ //case of attributed data
        color = "#5aad5f"
    }else if(dataNum == 2){
        return;
    }else if(dataNum == 3){
        return;
    }
    //does not draw the unattributed data if it comes from a peaklist and was not attributed before
    if(dataNum == 0 && data[0] && data[1] && !data[0][ytype] && !data[1][ytype]){return;}
    if(dataNum == 2 && data[0] &&  data[1] && !data[0][ytype] && !data[1][ytype]){return;}

    cell.data[dataNum] = [];
    cell.data[dataNum] = cell.self.append('g').attr("id", "cell"+cellNum+"data"+dataNum)
       .selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", function (d) { return xscale(d[xtype]); } ) 
       .attr("cy", function (d) {
            if(dataNum == 0){
                return yscale(d[ytype]); 
            }else if(dataNum == 1 && d.attrib){
                return yscale(d.attrib.ppmError)
            } 
        } ) 
       .attr("r", function (d) {return cfg.dotSize})
       .attr("clip-path", "url(#clipCvs"+cfgX.letter+"Cell"+cellNum+")")
       .attr('tooltipHTML', function(d){ return "ALREADYHTML;"+buildTooltipAttrib(d, "errorPlot", 1, dataNum)})
       .style("opacity", cfgAttribDraw.main.opacity)
       .style("fill", color)
       .on("mouseover", cfgX.main.functions.mouseover )
       .on("mousemove", cfgX.main.functions.mousemove  )
       .on("mouseleave" , cfgX.main.functions.mouseleave  )
        .on("click", cfgX.main.functions.mouseclick );
    if(config.blackCircle){
        let blackCircleColor = config.blackCircleColor || "#000000"
        let blackCircleWidth = config.blackCircleWidth || 1
        cell.data[dataNum].style("stroke", blackCircleColor)
        cell.data[dataNum].style("stroke-width", blackCircleWidth)
    }
    
    //handles the average line
    d3.select("#lineaverageAttrib").remove()
    if(dataNum == 1){
        data.sort(function(a, b){return a.massExp-b.massExp})
        let meanLine = cfg.meanLine || 10000
        cvsX.sideData.averageLine = calculateAverageLine(data,config.mz,"ppmError", meanLine)
                /** average line for a cell */
        if(cvsX.sideData.averageLine){
            cell.lineAverage = cell.self.append("path")
            .datum(cvsX.sideData.averageLine)
            .attr('id','lineaverageAttrib')
            .attr('stroke','black')
            .attr('stroke-width',3)
            .attr("fill","none")
            .attr("clip-path", "url(#clipCvs"+cfgX.letter+"Cell"+cellNum+")")  //cuts everything outside of charrt area
            .attr("d", d3.line()
            .x(function(d){ return cell.scales[0](d.averagemz); })
            .y(function(d){ return cell.scales[1](d.averageerror); })
            )
        }
    }
    //handles the calibration dots TODO: re-do them once it has been readded as part of file management
    if(dataNum == 1 && !cfgX.data.hideCalib){
        d3.select("#attribCalibDots").remove()
        let dataLine = attribCfg.main.fileString.slice(5)
        let fileOrigin = files.list[dataLine]
        if(!fileOrigin){return;}
        let fileCalib = fileOrigin.metadata.calibration
        if(!fileCalib || !fileCalib.points){return;}
        let dataCalib = fileCalib.points
        if(!dataCalib){return;}
        cell.calibData = cell.self.append('g').attr("id", "attribCalibDots")
        .selectAll("circle")
        .data(dataCalib)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xscale(d[0]); } ) 
        .attr("cy", function (d) { return yscale(d[1]); } ) 
        .attr("r", function (d) {return parseInt(cfg.dotSize)+1})
        .attr("clip-path", "url(#clipCvs"+cfgX.letter+"Cell"+cellNum+")")
        .attr('tooltipHTML', function(d){ return "ALREADYHTML;Calibrant:"+d[2]+"(m/z:"+d[0]+")"})
        .style("opacity", cfgAttribDraw.main.opacity)
        .style("fill", "black")
        .on("mouseover", cfgX.main.functions.mouseover )
        .on("mousemove", cfgX.main.functions.mousemove  )
        .on("mouseleave" , cfgX.main.functions.mouseleave  )
        .on("click", cfgX.main.functions.mouseclick );
    }
}

function drawDataAttrib_massSpectra(cvsX, cfgX, cellNum, dataNum, data){
    if(debug){console.log("drawing on attribCvs the mass spectra, data num"+dataNum)}
    var cell = cvsX.canvas[cellNum]
    var cfg = cfgX.canvas[cellNum]
    var xscale = cell.scales[0]
    var yscale = cell.scales[1]
    var yMethod = cfg.ytype
    var xtype = config.mz
    var ytype = config.intensity
    var color = "#df4f50"
    if(dataNum == 1){ //case of attributed data
        color = "#5aad5f"
    }else if(dataNum == 2){
        color = "#2678ca"
    }else if(dataNum == 3){
        color = "#979290"
    }
    let maxInt = cfg.maxInt
    d3.selectAll("#canvas"+cfgX.letter+" #cell"+cellNum+"data"+dataNum).remove()
   
    cell.data[dataNum] = [];
    cell.data[dataNum] = cell.self.append('g').attr("id", "cell"+cellNum+"data"+dataNum)
       .selectAll("rect")
       .data(data)
       .enter()
       .append("rect")
       .attr("x", function (d) {return xscale(d[xtype]); } ) 
       .attr("y", function (d) { 
           if(yMethod == "relative"){
               return yscale(100*d[ytype]/maxInt)
           }else{
               return yscale(d[ytype]);
           }}) 
       .attr("width",1)
       .attr("height", function(d){
           if(yMethod == "relative"){
               return config.height - yscale(100*d[ytype]/maxInt)
           }else{
               return config.height - yscale(d[ytype]);
           }
   
       })
       .attr("clip-path", "url(#clipCvs"+cfgX.letter+"Cell"+cellNum+")")
       .attr('tooltipHTML', function(d){ return "ALREADYHTML;"+buildTooltipAttrib(d, "massSpectra", 1, dataNum)})
       .style("opacity", cfgAttribDraw.main.opacity)
       .style("fill", color)
        .on("mouseover", cfgX.main.functions.mouseover )
        .on("mousemove", cfgX.main.functions.mousemove  )
        .on("mouseleave" , cfgX.main.functions.mouseleave  )
        .on("click", cfgX.main.functions.mouseclick );
}

function drawDataAttrib_kendrick(cvsX, cfgX, cellNum, dataNum, data){
    if(debug){console.log("drawing the data Kendrick n°"+dataNum+" on the cell number : "+cellNum)}
    var cell = cvsX.canvas[cellNum]
    var cfg = cfgX.canvas[cellNum]
    var xscale = cell.scales[0]
    var yscale = cell.scales[1]
    var kData = cvsX.sideData[dataNum].kendrick[cellNum]

    var xtype = config.mz
    var ytype = config.intensity
    var color = "#df4f50"
    if(dataNum == 1){ //case of attributed data
        color = "#5aad5f"
    }else if(dataNum == 2){
        color = "#2678ca"
    }else if(dataNum == 3){
        color = "#979290"
    }
    d3.selectAll("#canvas"+cfgX.letter+" #cell"+cellNum+"data"+dataNum).remove()
   
    cell.data[dataNum] = [];
    cell.data[dataNum] = cell.self.append('g').attr("id", "cell"+cellNum+"data"+dataNum)
       .selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", function (d, i) {
            if(cfg.xtype == "m/z"){
                return xscale(d[xtype]);
            }else{return xscale(Math.round(kData[i][0]));} 
        } ) 
       .attr("cy", function (d, i) {return yscale(kData[i][1]); } ) 
       .attr("r", function (d) { 
        if(cfg.relativeSize){
            return cfg.dotSize*Math.sqrt(d[ytype])/config.sizeReductor;
        }
        else{return cfg.dotSize}
        })
       .attr("clip-path", "url(#clipCvsAttribCell"+cellNum+")")
       .attr('tooltipHTML', function(d ,i){return "ALREADYHTML;"+buildTooltipAttrib(d, "kendrick",i, dataNum)})
       .style("opacity", cfgAttribDraw.main.opacity)
       .style("fill", color)
        .on("mouseover", cfgX.main.functions.mouseover )
        .on("mousemove", cfgX.main.functions.mousemove  )
        .on("mouseleave" , cfgX.main.functions.mouseleave  )
        .on("click", cfgX.main.functions.mouseclick );
    if(config.blackCircle){
        let blackCircleColor = config.blackCircleColor || "#000000"
        let blackCircleWidth = config.blackCircleWidth || 1
        cell.data[dataNum].style("stroke", blackCircleColor)
        cell.data[dataNum].style("stroke-width", blackCircleWidth)
    }
}

function drawDataAttrib_histoError(cvsX, cfgX, cellNum, dataNum, data){
    if(debug){console.log("drawing the data of histogram errors n°"+dataNum+" on the cell number : "+cellNum)}
    var cell = cvsX.canvas[cellNum]
    var cfg = cfgX.canvas[cellNum]
    var xscale = cell.scales[0]
    var yscale = cell.scales[1]

    var xtype = config.ppmerror
    var color = "#df4f50"
    if(dataNum == 1){ //case of attributed data
        xtype = "ppm"
        color = "#5aad5f"
    }if(dataNum == 2){
        color = "#2678ca"
    }else if(dataNum ==3){
        return;
    }
    //Calculus of histogram bars
    var histogram = d3.histogram()
     .value(function(d) {
        if(dataNum == 1){return d.attrib.ppmError}
        else{return d[xtype]; }
        })   
     .domain(xscale.domain())  // then the domain of the graphic
     .thresholds(xscale.ticks(cfg.barsNum)); // then the numbers of bins
    var hData  = histogram(data); 
    cvsX.sideData[dataNum].bins[dataNum] = hData

    d3.selectAll("#canvas"+cfgX.letter+" #cell"+cellNum+"data"+dataNum).remove()
    cell.data[dataNum] = [];
    cell.data[dataNum] = cell.self.append('g').attr("id", "cell"+cellNum+"data"+dataNum)
     .selectAll("rect")
     .data(hData)
     .enter()
     .append("rect")
       .attr("x", function(d) {return xscale(d.x0)})
       .attr("y", function(d) { return yscale(100*d.length/(data.length-1));})
       .attr("width", function(d) {return Math.max(1, xscale(d.x1) - xscale(d.x0) -1);})
       .attr("height", function(d) {return config.height - yscale(100*d.length/(data.length-1))})
       .style("fill", color)
       .attr("fillColor", color)
       .attr("clip-path", "url(#clipCvs"+cfgX.letter+"Cell"+cellNum+")")
       .attr('tooltipHTML', function(d ,i){ return "ALREADYHTML;"+buildTooltipAttrib(d, "histogram", 1, dataNum, data.length)})
        .on("mouseover", cfgX.main.functions.mouseover )
        .on("mousemove", cfgX.main.functions.mousemove  )
        .on("mouseleave" , cfgX.main.functions.mouseleave  )
        .on("click", cfgX.main.functions.mouseclick );
}

function drawDataAttrib_henryPlot(cvsX, cfgX, cellNum, dataNum, data){
    if(debug){console.log("drawing the data of henry plot n°"+dataNum+" on the cell number : "+cellNum)}
    var cell = cvsX.canvas[cellNum]
    var cfg = cfgX.canvas[cellNum]
    var xscale = cell.scales[0]
    var yscale = cell.scales[1]

    var xtype = "ppmError"
    
    data.sort(function(a, b){return a[xtype]-b[xtype]})
    var henryLineData = calculateHenryPlot(data, [cfg.xmin, cfg.xmax],cfg.barsNum, xtype)
    var regData = linearRegression(henryLineData)
    var regDataPoints = calculateRegressionLinePoints(regData, cfg.xmin, cfg.xmax)

    cell.data[dataNum] = cell.self.append("g").attr("id", "cell"+cellNum+"data"+dataNum)
    .selectAll("circle")
    .data(henryLineData)
    .enter()
    .append("circle")
    .attr("fill","black")
    .attr("cx", function (d, i) {return xscale(d.x)}  )
    .attr("cy", function (d, i) { return yscale(d.y)} ) 
    .attr("r", function (d) {return 2})
    .attr("clip-path", "url(#clipCvs"+cfgX.letter+"Cell"+cellNum+")")  //cuts everything outside of chart area
    //drawing of the line of the Henry diagram
    cell.regLine = cell.self.append("path")
    .datum(regDataPoints)
    .attr('stroke','red')
    .attr('stroke-width',1)
    .attr("fill","none")
    .attr("clip-path", "url(#clipCvs"+cfgX.letter+"Cell"+cellNum+")")  //cuts everything outside of chart area
    .attr("d", d3.line()
        .x(function(d){ return xscale(d.x); })
        .y(function(d){ return yscale(d.y); })
    )

    //drawing of the Henry diagram text
    var textzoneLinearRegressionValue = "";
    if(parseFloat(regData.intercept)<0){
    textzoneLinearRegressionValue = "y="+Math.round(100*regData.slope)/100+"x "+Math.round(100*regData.intercept)/100+"</br> R²="+Math.round(10000*regData.r2)/10000
    }else if(parseFloat(regData.intercept)>0){
    textzoneLinearRegressionValue = "y="+Math.round(100*regData.slope)/100+"x +"+Math.round(100*regData.intercept)/100+"</br> R²="+Math.round(10000*regData.r2)/10000  
    }else{
      textzoneLinearRegressionValue = "y="+Math.round(100*regData.slope)/100+"x </br> R²="+Math.round(10000*regData.r2)/10000    
    }
  
    //text of the linear regression
    cell.regText = cell.self.append("text")
    .attr("width", 200)
    .attr("height", 200)
    .style("left", 3*width+config.margin.left*2+config.margin.right*2 ) 
    .style("top", config.height+50)
    .style("color", "red")
    .attr("class", "textInfosStat")
    .html(textzoneLinearRegressionValue)
  

}


function drawDataAttrib_pieChart(cvsX, cfgX, data){
    if(debug){console.log("drawing the pie chart for attributions")}
    if(!cfgX.pie){cfgX.pie = {};}
    if(!cvsX.pie){cvsX.pie = {};}
    if(document.querySelector("#attribPieChart").querySelector("#pieChart")){
        document.querySelector("#attribPieChart").querySelector("#pieChart").remove()
    }

    var cell = cvsX.pie
    var cfg = cfgX.pie
    cell.self= appendCell("#attribPieChart","pieChart")

    var color = ["#df4f50","#5aad5f","#2678ca","#979290"]

    if(!data[0] || !data[1] || !data[2]){return;}
    let pieData = [data[0].length-1,data[1].length,data[2].length]
    let sectorsName = ["unattribued peaks","attributed peaks","isotopic peaks"]
    if(data[3] && attribCfg.peakRemoval && attribCfg.peakRemoval.toggle){
        color.push("#979290")
        pieData.push(data[3].length)
        sectorsName.push("suspect peaks")
    }

    if(cfg.mode == "intensity"){
        pieData = [0,0,0]
        ///for unattributed data
        if(data[0] && data[0][0]){
            let thisIntensity = 0
            for(let i=1; i<data[0].length; i++){
                thisIntensity += parseFloat(data[0][i][config.intensity])
            }
            pieData[0]= thisIntensity
        }
        //for attributed data
        if(data[1] && data[1][0]){
            let thisIntensity = 0
            for(let i=0; i<data[1].length; i++){
                thisIntensity += parseFloat(data[1][i][config.intensity])
            }
            pieData[1]= thisIntensity
        }
        //for isotopic data
        if(data[2] && data[2][0]){
            let thisIntensity = 0
            for(let i=0; i<data[2].length; i++){
                thisIntensity += parseFloat(data[2][i][config.intensity])
            }
            pieData[2]= thisIntensity
        }
        ///for other data
        if(data[3] && data[3][0]){
            let thisIntensity = 0
            for(let i=1; i<data[3].length; i++){
                thisIntensity += parseFloat(data[3][i][config.intensity])
            }
            pieData[3]= thisIntensity
        }
    }
    if(cfg.ignoreIsotopes && cfg.ignoreOthers && data[3] && data[3].length>0){
        pieData.pop()
        pieData.pop()
        sectorsName.pop()
        sectorsName.pop()
    }else if(cfg.ignoreOthers&& data[3] && data[3].length >0){
        pieData.pop()
        sectorsName.pop()
    }else if(cfg.ignoreIsotopes){
        pieData.splice(2,1)
        sectorsName.splice(2,1)
        color.splice(2,1)
    }
    drawPieChart(pieData, sectorsName, cell.self, color, "black")
}

/** a simpler version of updateCell, only for attribution tab cells */
function updateCellAttrib(cellNum, cellType, update){
    if(debug){console.log("initating update of part of the cell n°"+cellNum+"(update:"+update+")")}

    //find data path
    var cvsX = cvsAttrib
    var cfgX = cfgAttribDraw

    cellNum = parseInt(cellNum)
    //cfg is the context config of this cell, config is the puncdata config
    var cfg = cfgX.canvas[cellNum]
    var cell = cvsX.canvas[cellNum]

    if(update.includes("x_")|| update.includes("all")){
        //updating the x axis
        cell.scales[0].domain([cfg.xmin, cfg.xmax])
        updateAxisBottom(cell.axes[0], cell.scales[0], cfg.xmax)

    }
    if(update.includes("y_")|| update.includes("all")){
        //updating the y axis
        cell.scales[1].domain([cfg.ymin, cfg.ymax])
        updateAxisLeft(cell.axes[1], cell.scales[1], cfg.ymax)
    }
    if(cellType == "errorPlot"){ 
        cellBrushingAttrib("Attrib", cellNum) //updates the brushing if the x or y type changed
        if(!config.nogrid){
            cell.grids[0].call(d3.axisBottom(cell.scales[0]).ticks(config.axisLines).tickSize(config.height).tickFormat(""))
            cell.grids[1].call(d3.axisLeft(cell.scales[1]).ticks(config.axisLines).tickSize(-config.width).tickFormat(""))
        }
    }else if(cellType == "kendrick"){
        if(!config.nogrid && cell.grids){
            cell.grids[0].call(d3.axisBottom(cell.scales[0]).ticks(config.axisLines).tickSize(config.height).tickFormat(""))
            cell.grids[1].call(d3.axisLeft(cell.scales[1]).ticks(config.axisLines*2).tickSize(-config.width).tickFormat(""))
        }
    }else if(cellType == "massSpectra"){
        if(cfg.ytype == "relative"){
            cell.axesLabels[1].text("Relative Intensity (%)")
        }else{
            cell.axesLabels[1].text("Intensity")
        }
        cellBrushingAttrib("Attrib", cellNum) //refreshes the brush needed if ytype changed
        if(!config.nogrid){
            cell.grids[1].call(d3.axisLeft(cell.scales[1]).ticks(config.axisLines).tickSize(-width).tickFormat(""))
        }
    }
    //update all the datas in this cell
    drawDataSetAttrib(cellNum)
}

/********************************************************************* */
/*                    TOOLTIPS AND INTERACTIVITY                       */
/********************************************************************* */
/** build a tooltip for a dataPoint */
function buildTooltipAttrib(data, type, nb, dataNum, suppData){
    var cvsX = cvsAttrib
    var cfgX = cfgAttribDraw
    var lines=[]
    var cleanFormula = data[config.formulatext] ||  ""
    var formula = data[config.formulatext] ||  ""
    //dirty correction for attributed peaks
    if(dataNum == 1){
        if(data.attrib){
            cleanFormula = data.attrib.name
            formula = data.attrib.name 
        }
    }
    if(dataNum == 2){
        let parent = data.monoisotopicPeak?data.monoisotopicPeak.attrib:{} || {}
        if(parent){cleanFormula = parent.name || ""}
    }//special case for isotopes
    if(cleanFormula && typeof cleanFormula == "string"){
        var regex = new RegExp(/[0-9]/, "gi")
        var regex2 = new RegExp(/[+()-]/, "gi")
        cleanFormula = cleanFormula.replace(regex, function(matched) {return "<sub>" + matched + "</sub>";})
        cleanFormula = cleanFormula.replace(regex2, function(matched) {return "<sup>" + matched + "</sup>";})
    }
    //if dataNum == 0 it means that it's the data before attribution or with another attribution & not attributed here
    if(dataNum == 0){
        if(type =="errorPlot" || type=="massSpectra"|| type=="kendrick"){
            lines[0] = "m/z: "+(data[config.mz] || "")+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data[config.mz]+"`,`attrib`)'> show formulae </button>"
            if(data.length >3){ //good indicator of if it's a peaklist or longer
                lines[1] = "formula :"+(data[config.formulatext] || "")+"<button class='databaseSearch' onclick='seekDataBasePopup(`"+data[config.formulatext]+"`)'> search DB </button>"
                lines[2] = "ppm error :"+(data[config.ppm] || "")
            }
        }else if(type == "histogram"){
            //count the total intensity of this bin
            var binIntensity = 0
            for(let i=0; i<data.length; i++){
                if(data[i]){binIntensity += parseInt(data[i][config.intensity])}
            }
            lines[0] = "["+data.x0 + ";" + data.x1+"["
            lines[1] = "[VARIABLE]-[NUMBER]-[%]"
            lines[2] = "nb of occurences - "+data.length + " - " + parseFloat(100*data.length/suppData).toFixed(1) +"%"
        }
    }else if (dataNum == 2){    //if dataNum == 2 it's an isotopic peak
        //builds the text for isotopes
        lines[1] = "m/z: "+(data[config.mz] || "")+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data[config.mz]+"`,`attrib`)'> show formulae </button>"
        lines[2] = "Isotopes:" + buildIsotopicNameList(data.isotopesList, attribCfg.isotope.list)
        lines[0] = "formula :"+(cleanFormula)+"<button class='databaseSearch' onclick='seekDataBasePopup(`"+ formula +"`)'> search DB </button>"
        if(type =="kendrick"){
            for(let i=0; i<cvsAttrib.sideData[dataNum].kendrick.length; i++){
                if(cvsX.sideData[dataNum].kendrick[i] && cfgX.canvas[i].type =="kendrick"){
                    if(cvsX.sideData[dataNum].kendrick[i].length == 0 ){continue;}
                    lines[3]  = config.kendrickText+"("+cfgX.canvas[i].kendrickFormula+") :"+parseFloat(cvsX.sideData[dataNum].kendrick[i][nb][1]).toFixed(5)
                }
            }
        }
    }else if(dataNum ==3){//here it's a suspect peak removed
        lines[0] = "m/z: "+(data[config.mz] || "")+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data[config.mz]+"`,`attrib`)'> show formulae </button>"
        lines[1] = "Categorized as suspect"
    }else{ //here the peak is an attribution
        var ppm = ""
        if(data.attrib && data.attrib.ppmError){ppm = data.attrib.ppmError.toFixed(6)}
        if(type =="errorPlot" || type=="massSpectra"){
            lines[0] = "formula :"+(cleanFormula)+'<button class="databaseSearch" onclick="seekDataBasePopup(`'+ formula +'`)"> search DB </button>'
            lines[1] = "m/z Exp :"+(data[config.mz] || "")+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data[config.mz]+"`,`attrib`)'> show formulae </button>"
            lines[2] = "ppm error :"+(ppm || "")+"<button class='databaseSearch' onclick='popupAddToCalibList(`"+formula+"`)'> Add to calibration list </button>"

        }
        if(type =="kendrick"){
            lines[0] = "formula :"+(cleanFormula)+'<button class="databaseSearch" onclick="seekDataBasePopup(`'+ formula +'`)"> search DB </button>'
            lines[1] = "m/z :"+(data[config.mz] || "")+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data[config.mz]+"`,`attrib`)'> show formulae </button>"
            lines[2] = "ppm error :"+(ppm || "")+"<button class='databaseSearch' onclick='popupAddToCalibList(`"+formula+"`)'> Add to calibration list </button>"
            for(let i=0; i<cvsAttrib.sideData[dataNum].kendrick.length; i++){
                if(cvsX.sideData[dataNum].kendrick[i] && cfgX.canvas[i].type =="kendrick"){
                    if(cvsX.sideData[dataNum].kendrick[i].length == 0 ){continue;}
                    lines[3]  = config.kendrickText+"("+cfgX.canvas[i].kendrickFormula+") :"+parseFloat(cvsX.sideData[dataNum].kendrick[i][nb][1]).toFixed(5)
                }
            }
        }
        if(type =="histogram"){
            //count the total intensity of this bin
            var binIntensity = 0
            for(let i=0; i<data.length; i++){
                if(data[i]){binIntensity += parseInt(data[i][config.intensity])}
            }
            lines[0] = "["+data.x0 + ";" + data.x1+"["
            lines[1] = "[VARIABLE]-[NUMBER]-[%]"
            lines[2] = "nb of occurences - "+data.length + " - " + parseFloat(100*data.length/suppData).toFixed(1) +"%"
        }else{
            //ends the construction of other types than histogram
            let lineAttrib = "not Attributed"
            if(data.attrib){
                lineAttrib = "(pass "+(data.attrib.passNumber)+")"
                if(data.attrib.type == "network"){lineAttrib +=" - found by Network"}
                else if(data.attrib.type == "deNovo"){lineAttrib += " - found deNovo"}
                else if(data.attrib.type == "seed"){lineAttrib +=" - Seed"}
                else{lineAttrib +=" - This shouldn't be possible"}
            }

            lines.push(lineAttrib)
        }
    }

    //rebuild everything
    var text =""
    for(let i=0; i<lines.length; i++){
        if(lines[i]){
            text +=lines[i]
        }
        text += "<br>"
    }
    return text
}

/** a function to build an intelligble list of isotopes from a data peak isotope 'list' by consulting the list of possible isotopes (isotopesList) */
function buildIsotopicNameList(list, isotopesList){
if(!list || !isotopesList){return;}
 //counts
 let isotopesNum = []
 for(let i=0; i<isotopesList.length; i++){
     isotopesNum[i] = 0
    for(let j=0; j<list.length; j++){
        if(isotopesList[i].name == list[j]){
            isotopesNum[i] +=1
        }
    }
 }
 //builds the text
 let text= ""
 for(let i=0; i<isotopesList.length; i++){
    if(isotopesNum[i]>0){
        if(text !=""){text += ", "}
        text += isotopesList[i].fullName+" x"+isotopesNum[i]
    }
 }
 return text
}

/**
 * A function to activate brushing on a cell and zooming

 */
function cellBrushingAttrib(cvsLetter, cellNum){
    if(debug){console.log("creating the brushing for cell n°"+cellNum)}
     //find data path
     var cvsX = findCvs(cvsLetter)
     var cfgX = findCfg(cvsLetter)

    var cell = cvsX.canvas[cellNum]
    var cfg = cfgX.canvas[cellNum]
    var attData = attribData.attributed
    var unData = attribData.unattributed

    var selection = cell.self.call( d3.brush()
    .extent( [ [0,0], [config.width,config.height] ] )
    .keyModifiers(false) //disable the default functions of the brush when shift is pressed
    .on("start brush", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
    .on("end", zoomChart)
    );
    cell.self.select("rect.selection").moveToBack()
    cell.self.select("rect.overlay").moveToBack()
    cell.self.selectAll("g.grid").moveToBack()

    var xtype = cfg.xtype
    var ytype = cfg.ytype
    var xtypeAT = ""
    var ytypeAT = ""
    if(cfg.type == "massSpectra"){
        xtypeAT = "massExp"
        ytypeAT = "intensity"
    }else if(cfg.type == "errorPlot"){
        xtypeAT = "massExp"
        ytypeAT = "ppm"
    }

    if(cfg.type == "massSpectra"){
        xtype = config.mz
        if(ytype != "relative"){ytype = config.intensity}
        else{
        //recomputes the max of the data for relative visualisation
        let maxInt = 0
        for(let i=0; i<unData.length; i++){
            if (parseInt(unData[i][config.intensity])>parseInt(maxInt)){maxInt = unData[i][config.intensity]}
        }for(let i=0; i<attData.length; i++){
            if (parseInt(attData[i].intensity)>parseInt(maxInt)){maxInt = attData[i].intensity}
        }
        if(maxInt> cfg.maxInt){cfg.maxInt = maxInt}
        }
    }

    //unzooms on double click
        //unzooms on double click
        cell.self.on("dblclick",function(d){
            if(event.target.nodeName == "text" || (event.target.nodeName == "path"&& event.target.classList[0] == "domain")){return;}
            resetCoordinates(cfg);
            updateCellAttrib(cellNum, cfg.type, "x_y_")
        }) 
        cell.axes[0].on("dblclick",function(d){resetCoordinates(cfg);updateCellAttrib(cellNum, cfg.type, "x_")}) 
        cell.axes[1].on("dblclick",function(d){resetCoordinates(cfg);updateCellAttrib(cellNum, cfg.type, "y_")}) 
    


    // Function that is triggered when brushing is performed
    function updateChart({selection}) {
      var s = cfgX.main.selectTool
      
      if(event.shiftKey){return} //if shift is pressed do not class because it will be a zoom

      //finds the class needed for selection
      var selectedName = config.selectionTool.selectionStyle
      if(config.blackCircle){selectedName = config.selectionTool.selectionStyleBis}

      //if s= -1, means everything needs to be selected, so does the operation in a loop. ELSE, classical way
      ///////////////////////FOR ALL DATASETS SELECTION////////////////////////////////////
    //select on the main chart
    if(cfg.type == "kendrick"){
        if(cell.data[0]){cell.data[0].classed(selectedName, function(d, n){return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](cvsX.sideData[0].kendrick[cellNum][n][1]) ) } )}
        if(cell.data[2]){cell.data[2].classed(selectedName, function(d, n){return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](cvsX.sideData[2].kendrick[cellNum][n][1]) ) } )}
        if(cell.data[2]){cell.data[1].classed(selectedName, function(d, n){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](cvsX.sideData[1].kendrick[cellNum][n][1]) ) } )}
        if(cell.data[3]){cell.data[3].classed(selectedName, function(d, n){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](cvsX.sideData[3].kendrick[cellNum][n][1]) ) } )}
    }else if(cfg.type == "massSpectra" && ytype == "relative"){
        if(cell.data[0]){cell.data[0].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](100*d[config.intensity]/cfg.maxInt) ) } )}
        if(cell.data[2]){cell.data[2].classed(selectedName, function(d){return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](100*d[config.intensity]/cfg.maxInt) ) } )}
        if(cell.data[1]){cell.data[1].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](100*d[config.intensity]/cfg.maxInt) ) } )}
        if(cell.data[3]){cell.data[3].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](100*d[config.intensity]/cfg.maxInt) ) } )}
    }else{
        if(cell.data[0]){ cell.data[0].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[config.intensity]) ) } )}
        if(cell.data[2]){ cell.data[2].classed(selectedName, function(d){return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[config.intensity]) ) } )}
        if(cell.data[3]){cell.data[3].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[config.intensity]) ) } )}
        if(cfg.type == "massSpectra"){
            cell.data[1].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[config.intensity]) ) } )
        }else{
            cell.data[1].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d.attrib.ppmError) ) } )
        }
    }
    //select on all other charts
    for(let i=0; i<cvsX.canvas.length; i++){
        if(cfg.type =="kendrick"){
            if(cvsX.canvas[i].data[0]){cvsX.canvas[i].data[0].classed(selectedName, function(d, n){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](cvsX.sideData[0].kendrick[cellNum][n][1]) ) } )}
            if(cvsX.canvas[i].data[2]){cvsX.canvas[i].data[2].classed(selectedName, function(d, n){return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](cvsX.sideData[2].kendrick[cellNum][n][1]) ) } )}
            if(cvsX.canvas[i].data[3]){cvsX.canvas[i].data[3].classed(selectedName, function(d, n){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](cvsX.sideData[3].kendrick[cellNum][n][1]) ) } )}
            cvsX.canvas[i].data[1].classed(selectedName, function(d, n){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](cvsX.sideData[1].kendrick[cellNum][n][1]) ) } )
        }else if(cfg.type == "massSpectra" && ytype == "relative"){
            if(cvsX.canvas[i].data[0]){cvsX.canvas[i].data[0].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](100*d[config.intensity]/cfg.maxInt) ) } )}
            if(cvsX.canvas[i].data[2]){cvsX.canvas[i].data[2].classed(selectedName, function(d){return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](100*d[config.intensity]/cfg.maxInt) ) } )}
            if(cvsX.canvas[i].data[3]){cvsX.canvas[i].data[3].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](100*d[config.intensity]/cfg.maxInt) ) } )}
            cvsX.canvas[i].data[1].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](100*d[config.intensity]/cfg.maxInt) ) } )
        }else{
            if(cvsX.canvas[i].data[0]){cvsX.canvas[i].data[0].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[config.intensity]) ) } )}
            if(cvsX.canvas[i].data[2]){cvsX.canvas[i].data[2].classed(selectedName, function(d){return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[config.intensity]) ) } )}
            if(cvsX.canvas[i].data[3]){cvsX.canvas[i].data[3].classed(selectedName, function(d){return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[config.intensity]) ) } )}
            if(cfg.type == "massSpectra"){
                cvsX.canvas[i].data[1].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[config.intensity]) ) } )
            }else{
                cvsX.canvas[i].data[1].classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d.attrib?d.attrib.ppmError:0) ) } )
            }
        }
    }
    }
    //zoom for chart 
  function zoomChart({selection}){
    if(event.shiftKey){
      var new_x0 = cell.scales[0].invert(selection[0][0])
      var new_x1 = cell.scales[0].invert(selection[1][0])
      var new_y1 = cell.scales[1].invert(selection[0][1])
      var new_y0 = cell.scales[1].invert(selection[1][1])
      cell.scales[0].domain([ new_x0, new_x1])
      cell.scales[1].domain([new_y0, new_y1])
      if(cfg.type == "histoError"){return}
        if(cfg.type == "errorPlot"){
            if(cell.data[0]){
                cell.data[0].attr("cx", function (d) { return cell.scales[0](d[xtype]); } )
                cell.data[0].attr("cy", function (d) { return cell.scales[1](d[ytype]); } )
            }
            if(cell.data[2]){
                cell.data[2].attr("cx", function (d) {if(!d.array){return;}  return cell.scales[0](d.array[xtype]); } )
                cell.data[2].attr("cy", function (d) {if(!d.array){return;}  return cell.scales[1](d.array[ytype]); } )
            }
            cell.data[1].attr("cx", function (d) { return cell.scales[0](d[config.mz]); } )
            cell.data[1].attr("cy", function (d) { return cell.scales[1](d.attrib?d.attrib.ppmError:0); } )
            //recompute line average
            d3.select("#lineaverageAttrib").remove()
            cell.lineAverage = cell.self.append("path")
            .datum(cvsX.sideData.averageLine)
            .attr('id','lineaverageAttrib')
            .attr('stroke','black')
            .attr('stroke-width',3)
            .attr("fill","none")
            .attr("clip-path", "url(#clipCvs"+cfgX.letter+"Cell"+cellNum+")")  //cuts everything outside of charrt area
            .attr("d", d3.line()
              .x(function(d){ return cell.scales[0](d.averagemz); })
              .y(function(d){ return cell.scales[1](d.averageerror); })
            )
          }
          if(cfg.type == "massSpectra"){
            cell.data[0].attr("x", function (d) { return cell.scales[0](d[config.mz]); } )
            if(cell.data[2]){cell.data[2].attr("x", function (d) {return cell.scales[0](d[config.mz]); } )}
            if(cell.data[3]){cell.data[3].attr("x", function (d) { return cell.scales[0](d[config.mz]); } )}
            cell.data[1].attr("x", function (d) { return cell.scales[0](d[config.mz]); } )
            if(ytype =="relative"){ 
                cell.data[0].attr("y", function (d) { return cell.scales[1](100*d[config.intensity]/cfg.maxInt); } )
                cell.data[0].attr("height", function (d) { return config.height - cell.scales[1](100*d[config.intensity]/cfg.maxInt); })
                if(cell.data[2]){
                    cell.data[2].attr("y", function (d) {return cell.scales[1](100*d[config.intensity]/cfg.maxInt); } )
                    cell.data[2].attr("height", function (d) {return config.height - cell.scales[1](100*d[config.intensity]/cfg.maxInt); })
                }
                cell.data[1].attr("y", function (d) { return cell.scales[1](100*d[config.intensity]/cfg.maxInt); } )
                cell.data[1].attr("height", function (d) { return config.height - cell.scales[1](100*d[config.intensity]/cfg.maxInt); })
                if(cell.data[3]){
                    cell.data[3].attr("y", function (d) { return cell.scales[1](100*d[config.intensity]/cfg.maxInt); } )
                    cell.data[3].attr("height", function (d) { return config.height - cell.scales[1](100*d[config.intensity]/cfg.maxInt); })
                }
            }else{
                cell.data[0].attr("y", function (d) { return cell.scales[1](d[config.intensity]); } )
                cell.data[0].attr("height", function (d) { return config.height - cell.scales[1](d[config.intensity]); })
                if(cell.data[2]){
                    cell.data[2].attr("y", function (d) {return cell.scales[1](d[config.intensity]); } )
                    cell.data[2].attr("height", function (d) {return config.height - cell.scales[1](d[config.intensity]); })
                }   
                cell.data[1].attr("y", function (d) { return cell.scales[1](d[config.intensity]); } )
                cell.data[1].attr("height", function (d) { return config.height - cell.scales[1](d[config.intensity]); })
                if(cell.data[3]){
                    cell.data[3].attr("y", function (d) { return cell.scales[1](d[config.intensity]); } )
                    cell.data[3].attr("height", function (d) { return config.height - cell.scales[1](d[config.intensity]); })
                }
            }
          }
          if(cfg.type == "kendrick"){
            var kData = cvsX.sideData[0].kendrick[cellNum]
            var kDataISOTOPE = cvsX.sideData[2].kendrick[cellNum]
            var kDataAT = cvsX.sideData[1].kendrick[cellNum]
            if(cell.data[0]){cell.data[0].attr("cx", function (d) { return cell.scales[0](d[config.mz]); } )} //TO DO: DO THE CONDITION FOR NKM
            if(cell.data[0]){cell.data[0].attr("cy", function (d , n) { return cell.scales[1](kData[n][1]); } )}
            if(cell.data[2]){
                cell.data[2].attr("cx", function (d) {return cell.scales[0](d[config.mz]); } )
                cell.data[2].attr("cy", function (d , n) {return cell.scales[1](kDataISOTOPE[n][1]); } )
            }
            if(cell.data[1]){cell.data[1].attr("cx", function (d) { return cell.scales[0](d[config.mz]); } ) }
            if(cell.data[1]){cell.data[1].attr("cy", function (d , n) { return cell.scales[1](kDataAT[n][1]); } )}
            if(cell.data[3]){
                var kDataOthers = cvsX.sideData[3].kendrick[cellNum]
                cell.data[3].attr("cx", function (d) { return cell.scales[0](d[config.mz]); } ) //TO DO: DO THE CONDITION FOR NKM
                cell.data[3].attr("cy", function (d , n) { return cell.scales[1](kDataOthers[n][1]); } )
            }
          }

      updateAxisBottom(cell.axes[0], cell.scales[0], cfg.xmax)
      updateAxisLeft(cell.axes[1],cell.scales[1], cfg.ymax)
      if(!config.nogrid){
        if(cell.grids[0]){
          cell.grids[0].call(d3.axisBottom(cell.scales[0]).ticks(config.axisLines).tickSize(config.height).tickFormat(""))
        }
        cell.grids[1].call(d3.axisLeft(cell.scales[1]).ticks(config.axisLines).tickSize(-config.width).tickFormat(""))
      }
      cell.self.call(d3.brush().clear)

    }
  }

}





/********************************************************************* */
/*                    OTHER FUNCTIONS                                  */
/********************************************************************* */



//finds if there is a "oldcoordinates" defined, and resets coordinates if true. Special case is 0 or 1 depending on the axis, or undefined if both
function resetCoordinates(cfg, specialCase){
    if(!cfg.oldCoordinates){return;}
    if(cfg.oldCoordinates[0] && specialCase != 1){
      cfg.xmin = cfg.oldCoordinates[0][0]
      cfg.xmax = cfg.oldCoordinates[0][1]
    }
    if(cfg.oldCoordinates[1] && specialCase != 0){
      cfg.ymin = cfg.oldCoordinates[1][0]
      cfg.ymax = cfg.oldCoordinates[1][1]
    }
    
    if(specialCase == undefined){
      cfg.oldCoordinates = undefined
    }
  }
  
  


async function clearLogBox(loggerName){
    var zone = document.getElementsByName(loggerName)[0]
    zone.innerHTML = ""
    return "done"
}


async function logText(loggerName, text){
    var zone = document.getElementsByName(loggerName)[0]
    zone.innerHTML += text
    zone.innerHTML += "<br>"
    return "done"
}

function computeMaxFromMultipleDatasets(datasets, index){
    //index can be one number of multiple index
    var oneIndex = false;
    if(typeof index == "number" || typeof index == "string"){
        oneIndex = true;
    }
    var max = 0
    for(let i=0; i<datasets.length; i++){
        for(let j=0; j<datasets[i].length; j++){
            if(oneIndex){
                if(parseFloat(datasets[i][j][index])>max){max = parseFloat(datasets[i][j][index])}
            }else{
                if(parseFloat(datasets[i][j][index[i]])>max){max = parseFloat(datasets[i][j][index[i]])}
            }
        }
    }
    return max
}


/**a function to calculate the kendrick masses for a specific dataset and cell. Exports the data */
function calculateKM(cvsX, cfgX, cellNum, dataNum, data, mzCol){
    //prepares the data place
    cvsX.sideData[dataNum].kendrick[cellNum]= []
    var cData = [];
    cData[0] = ["KM", "KMD"]
    var cfg = cfgX.canvas[cellNum]
    var cfgData = cfgX.data[dataNum]
    var mass = cfg.kendrickMass/cfg.kendrickDivisor
    var newBase = Math.round(mass)/mass

    //loops through the data
    let startIndex = 1
    if(!isNaN(data[0][mzCol])){startIndex = 0}
    for (let i=startIndex; i<data.length; i++){
        cData[i] = [];
        var calcMass = parseFloat(data[i][mzCol])*newBase
        var massDefect = 0;
        //TODO: give back the other kendrickround options
        massDefect = Math.round(calcMass) - calcMass
        // if(kendrickRound=="round"){massDefect = Math.round(calcMass) - calcMass}
        // else if(kendrickRound=="roundUp"){massDefect = Math.ceil(calcMass) - calcMass}
        // else if(kendrickRound=="roundDown"){massDefect = Math.floor(calcMass) - calcMass}
        
        cData[i].push(calcMass)
        cData[i].push(massDefect)
    }

    //outputs the data
    cvsX.sideData[dataNum].kendrick[cellNum]= cData
    cData = [];
}

/**
 * a function to compute the average line of a graph (error charts mainly)
 * @param {*} data The data has to be sorted
 * @returns the data array of a line
 */
function calculateAverageLine(data,mz,ppm, stepSize){
    averagedata = []; //resets averagedata
    if (stepSize == 0 || stepSize < 0|| stepSize == null){return;}//avoids some infinite loops
    for(let i=0; i< data.length; i++){ //the for that contains every dot in the data
      let counter = i //Count the real number attained
      var totalmz = 0;
      var totalerror = 0;
      var howmanynumber = 0; //counts in the interval how many values were numbers
      for(let j=0; j<stepSize; j++){ // the loop that contains every point for one average
        counter = i + j //update counter
        if(!(data[counter] == null)){ //checks if this number exists
          if(!isNaN(data[counter][mz])){ //checks if it contains a number
            totalmz = totalmz + parseFloat(data[counter][mz]);
            if(data[counter].attrib){
                totalerror = totalerror + parseFloat(data[counter].attrib[ppm]);
            }
            howmanynumber = howmanynumber +1;
          }
        }
      }
      //only draw a new point if it is a mean of the number of points needed
        if(howmanynumber == stepSize){
          var averagemz = totalmz/howmanynumber;
          var averageerror = totalerror/howmanynumber;
          var datapoint = {"averagemz": averagemz, "averageerror":averageerror}
          averagedata.push(datapoint)
        }
    }
    return averagedata
}

/** computes data to make a henry plot */
function calculateHenryPlot(data, ppm, barsNb, ppmIndex){
    var exportdata= []; 
    var numberofdata = data.length //the total number of points
    //finds the true min/max
    let truemin = parseFloat(data[0].attrib?data[0].attrib[ppmIndex]:0)
    let truemax = parseFloat(data[0].attrib?data[0].attrib[ppmIndex]:0)
    for(let i=0; i<data.length; i++){
        if(!data[i].attrib){continue;}
      let currentValue = parseFloat(data[i].attrib[ppmIndex])
      if(currentValue> truemax){truemax = currentValue}
      if(currentValue< truemin){truemin = currentValue}
    }
    //replaces the values 
    ppm[0] = parseFloat(ppm[0])
    ppm[1] = parseFloat(ppm[1])
    if(truemin != truemax && (truemin > ppm[0])){ppm[0] = truemin}
    if(truemin != truemax && (truemax < ppm[1])){ppm[1] = truemax}
  
    var step = (ppm[1] - ppm[0] )/ parseFloat(barsNb)
    var borne = 0;
    for(let i=0; i< barsNb; i++){ //calculate each point the for the line
      var totalpoints = 0; //number of points under a threshold
      borne = ppm[0] + step*i;
      for(let j=0; j<numberofdata; j++){ //checks on the whole data list which points are inferior
        if (data[j].attrib && data[j].attrib[ppmIndex]<borne){
          totalpoints = totalpoints +1 
        }
      }
      totalpoints = totalpoints/numberofdata 
  
      if (totalpoints !=0 && totalpoints !=1){  //saves a point only if it does not go to infinity
        totalpoints = NormSInv(totalpoints) //application of a statistical law
        var datapoint = {"x": borne, "y":totalpoints}
        exportdata.push(datapoint)
      }
  
      
    }
    return exportdata
}

/**a function to calculate two points of a linear equation */
function calculateRegressionLinePoints (linearEquation, xminimal, xmaximal){
    var y1 = xminimal*linearEquation.slope+linearEquation.intercept
    var y2 = xmaximal*linearEquation.slope+linearEquation.intercept
    var dataexport =[];
    dataexport.push({x: xminimal,y: y1},{x: xmaximal, y: y2})
    return dataexport
}
  


////////screenshot code
var canvasAttrib_screenshot = html_tabAttrib.querySelector('button[name="screenshot"]')
canvasAttrib_screenshot.addEventListener("click", function (){ new Popup_AttribScreenshot()});

class Popup_AttribScreenshot extends Popup{
    constructor(canvas) {
        super("canvasScreenshot","Choose the graph to take a pic of")
        this.canvas = canvas
        var buttons = [
            {"name":"Export image (png)", "function":()=>{this.exportPNG()}},
            {"name":"Export vectorial image (svg)", "function":()=>{this.exportSVG()}}
        ]
        var selecter = [{"name":"selecter", "options":[]}]
        selecter[0].options = [
            {"value":0, "text":" Cell n°1"},
            {"value":1, "text":" Cell n°2"},
            {"value":2, "text":" Cell n°3"},
            {"value":-1, "text":" All Canvas"}
        ]
        this.buildInputs(selecter, [], buttons)
        this.valButton.remove()
    }

    exportSVG(){
        let cellNum = this.popup_box.querySelector('select[name="popup_selecter_0"]').value
        let html_canvas = document.querySelector("#canvasgroupAttrib")
        /**gets the information of the screenshot zone */
        var downloadTarget = null
        if(cellNum == -1){
            return alertPopup("Impossible to export a whole canvas as svg. Please select only one chart")
        }else{
            downloadTarget = html_canvas.querySelector("#cell"+cellNum) 
            if(debug){console.log("#cell"+cellNum,downloadTarget)}
        }
         /**defines the name of the chart */
        let fileName = "cell"+cellNum
        var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
        setInlineStylesSVG(downloadTarget)
        downloadTarget.source = [doctype +  (new XMLSerializer()).serializeToString(downloadTarget)]
        downloadSVG(downloadTarget, fileName)
        this.popup_close.click()
    }

    async exportPNG(){
        let cellName = this.popup_box.querySelector('select[name="popup_selecter_0"]').value
        let thisCanvas = document.querySelector("#canvasgroupAttrib")
        /**gets the information of the screenshot zone */
        let downloadTarget = ""
        if(cellName == -1){
            downloadTarget = "wholeCanvas"
            //catch the whole canvas, do nothing
        }else{
            downloadTarget = "cell "+cellName
            //hide undesired elements
            if(cellName !=0){d3.select('#canvasAttrib #cell0').attr("display","none")}
            if(cellName !=1){d3.select('#canvasAttrib #cell1').attr("display","none")}
            if(cellName !=2){d3.select('#canvasAttrib #cell2').attr("display","none")}
            thisCanvas.style.height= config.height+config.margin.top+config.margin.bottom
            thisCanvas.style.width= config.width+config.margin.left+config.margin.right
        }
        var screenshot = null

        await html2canvas(thisCanvas).then((canvas)=> {
            screenshot = this.popup_box.appendChild(canvas)
            screenshot.id = "screenshot_image"
        });
        var fileName = "puncdata_"+downloadTarget;
        var file = document.getElementById("screenshot_image")
        downloadFile(fileName, screenshot, "png")
        if(cellName != -1){
            d3.select('#canvasAttrib #cell0').attr("display",null)
            d3.select('#canvasAttrib #cell1').attr("display",null)
            d3.select('#canvasAttrib #cell2').attr("display",null)
            thisCanvas.style.height= null
            thisCanvas.style.width= null
        }
        this.popup_close.click()
    }

}


class Popup_vizDelta extends Popup{
    constructor() {
        super("canvasScreenshot","Vizualise the deltas around a specific Δm/z value")
        this.valButton.remove()
        this.buildMenu()
    }

    buildMenu(){
        let table = createTable(4,2)

        let svgSpace = document.createElement("svg")
        this.svgSpace = svgSpace

        let buttonDraw = document.createElement("button")
        buttonDraw.innerHTML = "DRAW"
        buttonDraw.addEventListener("click", ()=>{
            let cfg = {
                centerMass : parseFloat(this.massDelta.value),
                width : parseFloat(this.windowWidth.value),
                binsNb : parseInt(this.numberOfBins.value),
                thresholds :  parseFloat(this.thresholdsTol.value),
            }
            this.prepareDrawing(cfg)
        })

        let massOptions = []
        for(let i=0; i<attribCfg.isotope.list.length; i++){
            let thisIso = attribCfg.isotope.list[i]
            massOptions.push({"value":thisIso.delta,"name":"isotope-"+thisIso.fullName})
        }
        for(let i=0; i<attribCfg.directNetwork.list.length; i++){
            let thisDelta = attribCfg.directNetwork.list[i]
            massOptions.push({"value":thisDelta.mass,"name":thisDelta.formula})
        }
        let selecter = menuCreate_select(null, "selectMass","C",massOptions)
        selecter.style.color = "black"
        selecter.addEventListener("change",(d)=>{this.massDelta.value = d.target.value})
        this.selecter = selecter

        let massDelta = menuCreate_inputNumber(null,"massDelta",1.003355,[{isStyle:true, key:"width",value:"200px"},{isStyle:true, key:"color",value:"black"}])
        this.massDelta = massDelta

        let windowWidth = menuCreate_inputNumber(null,"windowWidth",1,[{isStyle:true, key:"width",value:"100px"},{isStyle:true, key:"color",value:"black"}])
        this.windowWidth = windowWidth

        let numberOfBins = menuCreate_inputNumber(null,"numberOfBins",25,[{isStyle:true, key:"width",value:"100px"},{isStyle:true, key:"color",value:"black"}])
        this.numberOfBins = numberOfBins

        let thresholdsTol = menuCreate_inputNumber(null,"numberOfBins",0.1,[{isStyle:true, key:"width",value:"100px"},{isStyle:true, key:"color",value:"black"}])
        this.thresholdsTol = thresholdsTol

        table.rows[0].cells[0].textContent = "delta:"
        table.rows[0].cells[0].appendChild(selecter)
        table.rows[0].cells[0].style.color = "black"

        table.rows[0].cells[1].appendChild(massDelta)
        table.rows[0].cells[1].style.color = "black"
        
        table.rows[1].cells[0].textContent = "Window width (mDa)"
        table.rows[1].cells[1].appendChild(windowWidth)

        table.rows[2].cells[0].textContent = "Number of bins"
        table.rows[2].cells[1].appendChild(numberOfBins)

        table.rows[3].cells[0].textContent = "Half-window tolerance (mDa)"
        table.rows[3].cells[1].appendChild(thresholdsTol)

        this.popup_box.appendChild(table)
        this.popup_box.appendChild(document.createElement("br"))
        this.popup_box.appendChild(buttonDraw)
        this.popup_box.appendChild(document.createElement("br"))
        this.popup_box.appendChild(svgSpace)
    }

    prepareDrawing(cfg){
        let deltas = this.prepareNetwork(cfg)
        let bins = this.prepareBins(deltas, cfg)
        let histogram = this.prepareHistogram(bins, cfg)
    }

    prepareNetwork(cfg){
        let network = new NetworkDeltas(cfg)
        this.network = network
        let data = linkFileFromDataString(attribCfg.main.fileString, false)
        network.fill(data)
        let bounds = [parseFloat(cfg.centerMass - cfg.width/2000), parseFloat(cfg.centerMass + cfg.width/2000)]
        let deltas = network.build_deltaMatrix(false, bounds)
        return deltas
    }

    prepareBins(deltas, cfg){
        //creates the bins
        const range = cfg.width/1000
        const step = (range/cfg.binsNb)
        let startVal = parseFloat(cfg.centerMass - cfg.width/2000)
        let bins = []
        for(let i=0; i<cfg.binsNb; i++){
            let bin = []
            bin.start = startVal+step*i
            bin.end = startVal+step*(i+1)
            bins.push(bin)
        }
        //appends each delta to a bin
        for(let i=0; i<deltas.length; i++){
            const val = deltas[i].value
            for(let j=0; j<bins.length; j++){
                //no need to check the start because they are sorted in order
                if(val>bins[j].end){continue;}
                else if(val>bins[j].start){bins[j].push(deltas[i]); break;}
            }
        }
        return bins
    }

    prepareHistogram(bins, cfg){
        let oldSvg = this.popup_box.querySelector("#histogramDelta")
        if(oldSvg){oldSvg.remove()}
        let histogram = {}
        histogram.config = JSON.parse(JSON.stringify(config))
        histogram.config.axisLines /= 2
        //find min-max values for x and y axis
        cfg.xmin = bins[0].start
        cfg.xmax = bins[bins.length-1].end
        cfg.ymin = 0
        cfg.ymax = 0
        for(let i=1; i<bins.length; i++){
            if(bins[i].length>cfg.ymax){cfg.ymax = bins[i].length}
        }
        cfg.ymax += 10
        //creating linear scales
        histogram.scales=[];
        histogram.scales[0] = d3.scaleLinear().domain([cfg.xmin,cfg.xmax]).range([0,  histogram.config.width]);
        histogram.scales[1]= d3.scaleLinear().domain([cfg.ymin, cfg.ymax]).range([ histogram.config.height, 0]);
        //creating new elements
        histogram.svgSpace = appendCell(this.popup_box,"histogramDelta",null,  histogram.config)
        histogram.clipPath = appendClipPath(histogram.svgSpace, "cliphistogramDelta",  histogram.config)
        appendLine(histogram.svgSpace, 4, "grey")
        histogram.drawnData = [] // will be an array of datasets drawn
        //creating axes
        histogram.axes=[];
        histogram.axes[0]= appendAxis_x(histogram.svgSpace, histogram.scales[0],  histogram.config.height, cfg.xmax,  histogram.config)
        histogram.axes[1]= appendAxis_y(histogram.svgSpace, histogram.scales[1],  cfg.ymax,  histogram.config)
        //creates labels
        let axisOptions = {}
        if(config.endAxis){axisOptions.mode = "endAxis"}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(histogram.svgSpace, "Δ m/z",axisOptions,  histogram.config);
        this.axesLabels[1]= appendAxisLabel_y(histogram.svgSpace, "Number of links",axisOptions,  histogram.config);
        this.histogram = histogram
        //create the red line
        histogram.redLine = histogram.svgSpace.append('line')
        .attr('x1',  histogram.config.width/2)
        .attr('y1',  histogram.config.height)
        .attr('x2',  histogram.config.width/2)
        .attr('y2', 0)
        .style('stroke-width', 1)
        .style('stroke',"red")
        //create the thresholds bars
        if(cfg.thresholds >0){
            let minVal = cfg.centerMass - (cfg.thresholds)/1000
            let maxVal =  cfg.centerMass + (cfg.thresholds)/1000
            histogram.thresholdLow = histogram.svgSpace.append('line')
            .attr('x1',  this.histogram.scales[0](minVal))
            .attr('y1',  histogram.config.height)
            .attr('x2',  this.histogram.scales[0](minVal))
            .attr('y2', 0)
            .style('stroke-width', 1)
            .style('stroke-dasharray', "2,2")
            .style('stroke',"orange")
            histogram.thresholdHigh = histogram.svgSpace.append('line')
            .attr('x1',  this.histogram.scales[0](maxVal))
            .attr('y1',  histogram.config.height)
            .attr('x2',  this.histogram.scales[0](maxVal))
            .attr('y2', 0)
            .style('stroke-width', 1)
            .style('stroke-dasharray', "2,2")
            .style('stroke',"orange")
        }

        this.prepareTooltip()
        this.drawHistogramBars(bins, cfg)
    }

    drawHistogramBars(bins, cfg){
        let binWidth = (this.histogram.scales[0](bins[0].end) - this.histogram.scales[0](bins[0].start))
        this.histogram.drawnData[0] = this.histogram.svgSpace.append('g').attr("id","histogramDeltaBars")
        .selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
            .attr("x", (d) => {return this.histogram.scales[0](d.start) })
            .attr("width", (d) =>{return Math.max(1, binWidth -1)})
            .attr("y", (d,n) =>{
                return this.histogram.scales[1](d.length)
            })
            .attr("height",(d,n)=>{
                return  this.histogram.config.height - this.histogram.scales[1](d.length)
            })
            .style("fill", "black")
            .attr("fillColor", "black")
            .attr("clip-path", "url(#cliphistogramDelta)")
            .on("mouseover", (d) => {this.histogram.tooltip.mouseover(d)} )
            .on("mousemove", (d,n) => {
                const text = "["+n.start +","+n.end+"]"+"<br> Links: "+n.length
                this.histogram.tooltip.mousemove(d,text, this)}  )
            .on("mouseleave" , (d) => {this.histogram.tooltip.mouseleave(d)}  )
            .on("click", (d,n) =>{
                let text = "["+n.start +","+n.end+"]"+"<br> Links: "+n.length
                this.histogram.tooltip.mouseclick(d,text, this)}  );

    this.histogram.redLine.moveToFront()
    }

    prepareTooltip(){
        let tooltip = {}
        
        tooltip.htmlDiv = appendTooltip(this.popup_box,"tooltip")
        tooltip.htmlStick = appendTooltip(this.popup_box,"tooltip_click")
        tooltip.htmlClose = appendTooltip(this.popup_box,"tooltip_click")
        tooltip.htmlClose.html("X").style("width","20px").on("click",(d)=>this.histogram.tooltip.close(d))

        tooltip.close = function(d){
            this.htmlStick.style("opacity",0).style("left",-1000).style("top",-1000)
            this.htmlClose.style("opacity",0).style("left",-1000).style("top",-1000)
        }
         /** renders the tooltip visible when mouse is moved */
        tooltip.mouseover = function(element){
            tooltip.htmlDiv.style("opacity",1)
        }
        /** moves the tooltip around and modifies its content */
        tooltip.mousemove = function(element, data, parentCell){
            let elClass = element.target.getAttribute('class')
            if(elClass && elClass.includes('tohide')){return;}
            tooltip.htmlDiv.style("left",event.pageX+10)
            tooltip.htmlDiv.style("top",event.pageY+10)
            tooltip.htmlDiv.html(data);

        }
        /**makes the tooltip disappear */
        tooltip.mouseleave = function(element){
            tooltip.htmlDiv.style("opacity",0).style("left",-1000).style("top",-1000)
        }
        /** when ctrl is pressed, will make a sticky tooltip */
        tooltip.mouseclick = function(element, data, parentCell){
            if(!event.ctrlKey){return}
            tooltip.htmlClose.style("opacity", 1)
            tooltip.htmlClose.style("left", event.pageX+290 ).style("top", event.pageY+10 )
            tooltip.htmlStick.style("opacity",1)
            tooltip.htmlStick.style("left",event.pageX+10)
            tooltip.htmlStick.style("top",event.pageY+10)
            tooltip.htmlStick.html(data);
        }

        this.histogram.tooltip = tooltip
    }
}


class Popup_AttributionsSuspect extends Popup{
    constructor(attrib) {
        super("configInteractivity","Logs attributions connected to a suspect edge")
        this.valButton.remove()
        this.attrib = attrib

        //builds the data
        this.buildDataTable()
    }

    buildDataTable(){
        //build the dat atable
        let attrib = this.attrib
        let suspects = []
        //find the suspect peaks
        for(let i=0; i<attrib.length; i++){
            if(attrib[i].attrib.error){suspects.push(attrib[i])}
        }
        console.log(suspects)

        let maxLength = Math.min(suspects.length, 5000)
        let tableWidth = 9
        let table = createTable(maxLength+1,tableWidth)
        table.rows[0].cells[0].textContent = "Index"
        table.rows[0].cells[1].textContent = "m/z"
        table.rows[0].cells[2].textContent = "Intensity"
        table.rows[0].cells[3].textContent = "Formula"
        table.rows[0].cells[4].textContent = "ppm error"
        table.rows[0].cells[5].textContent = "Attrib. method"
        table.rows[0].cells[6].textContent = "#Neighbours"
        table.rows[0].cells[7].textContent = "Coherent neighbours"
        table.rows[0].cells[8].textContent = "Alternative formulae (network)"
        for(let i=1; i<maxLength+1; i++){
            if(!suspects[i-1]){continue}
            table.rows[i].cells[0].textContent = suspects[i-1].originalIndex
            table.rows[i].cells[1].textContent = suspects[i-1][config.mz]
            table.rows[i].cells[2].textContent = suspects[i-1][config.intensity]
            table.rows[i].cells[3].textContent = suspects[i-1].attrib.name
            table.rows[i].cells[4].textContent = suspects[i-1].attrib.ppmError.toFixed(6)
            table.rows[i].cells[5].textContent = suspects[i-1].attrib.type
            table.rows[i].cells[6].textContent = suspects[i-1].attrib.error.totalNeighbours
            table.rows[i].cells[7].textContent = suspects[i-1].attrib.error.coherentNeighbours
            let alternatives = ""
            let suspectAttrib = suspects[i-1].attrib.error
            for(let j=0; j<suspectAttrib.alternatives.length; j++){
                let alt = suspects[i-1].attrib.error.alternatives[j]
                alternatives += alt.name+"("+alt.count+")"
                if(j<suspectAttrib.alternatives.length-1){alternatives +=", "}
            }
            table.rows[i].cells[8].textContent = alternatives
        }
        this.popup_box.appendChild(table)

        let button = document.createElement("button")
        button.innerHTML = "Copy"
        button.setAttribute("name","buttonCopy")
        button.setAttribute("class","popupclose")
        button.addEventListener("click", ()=>{
            closePopup(button);
            let text = ""
            text = "Index"+'\t'+"m/z"+'\t'+"Intensity"+'\t'+"Formula"+'\t'
            text += "ppm Error"+'\t'+"Attrib. method"+'\t'+"#Neighbours"+'\t'+"Coherent neighbours"+'\t'+"Alternative formulae (network)"+'\n'
            for(let i=0; i<suspects.length; i++){
                let alternatives = ""
                for(let j=0; j<suspects[i].attrib.error.alternatives.length; j++){
                    let alt = suspects[i].attrib.error.alternatives[j]
                    alternatives += alt.name+"("+alt.count+")"
                    if(j<suspects[i].attrib.error.alternatives.length-1){alt +=", "}
                }
                text += suspects[i].originalIndex +'\t'+suspects[i][config.mz]+'\t'+suspects[i][config.intensity]+'\t'+suspects[i].attrib.name+'\t'
                text +=suspects[i].attrib.ppmError+'\t'+suspects[i].attrib.type+'\t'+suspects[i].attrib.error.totalNeighbours+'\t'+suspects[i].attrib.error.coherentNeighbours+'\t'
                text += alternatives +'\n'
            }
            navigator.clipboard.writeText(text)
        })
        this.popup_box.appendChild(button)

    }
}
