/** Configuration object for attribution parameters and settings */

var attribCfg = {
    "ppm":{
        "delta": 0.1, //the mDa error to fuse deltas together as the same
        "deltaAttrib":0.1,// the mDa  error to attribute a delta DeNovo
        "attribution":0.3, // the ppm error to attribute whole peaks DeNovo
        "network":0.3, // the ppm error allowed while attributing with the network
        "daFilter":0.1, // a mDa filter to keep from calculating not needed ppm errors
        "networkDirect":0.3, // the ppm error allowed for the directed network
        "variable":false, //special parameter to make ppm value not constant, appears in advanced parameters
    },
    "delta":{
        "toKeep":10, // the number of deltas to keep for attribution. Keep the most common ones 
        "specialKeep":false, //if true, looks for the special deltas to keep even if they are not in the to #toKeep ones
        "bounds":[1,100], //the bounds of min/max deltas taken into account
        "keepList":[
            {"formula":"C","mass":12},
            {"formula":"N", "mass":14.003074},
            {"formula":"O", "mass":15.994915},
            {"formula":"H2O", "mass":18.010565},
            {"formula":"CH2", "mass":14.01565},
            {"formula":"CH2O", "mass":30.010565},
            {"formula":"H2", "mass":2.01565},
        ]
    },
    "goldenRules":{
        "useDBE":true,
        "DBEBound":[-1,40],
        "useHCratio":true,
        "HCratioBound":[0,3],
        "useHeteroRatio":true,
        "heteroRatiosBound":[
            {"elements":["F","C"],"bounds":[0,1.5]},
            {"elements":["Cl","C"],"bounds":[0,0.8]},
            {"elements":["Br","C"],"bounds":[0,0.8]},
            {"elements":["N","C"],"bounds":[0,1.3]},
            {"elements":["O","C"],"bounds":[0,1.5]},
            {"elements":["P","C"],"bounds":[0,0.3]},
            {"elements":["S","C"],"bounds":[0,0.8]},
            {"elements":["Si","C"],"bounds":[0,0.5]},
        ],
        "useKMD":false,
        "KMDru":"CH2",
        "KMDBounds":[-0.2,0.2],
        "useThreshold":false,
        "thresholdRules":[
            {"elements":["N","O","P","S"],"threshold":1,"max":[10,20,4,3]},
            {"elements":["N","O","P"],"threshold":3,"max":[11,22,6]},
            {"elements":["O","P","S"],"threshold":1,"max":[14,3,3]},
            {"elements":["P","S","N"],"threshold":1,"max":[3,3,4]},
            {"elements":["N","O","S"],"threshold":6,"max":[19,14,8]},
        ],
        "ionTypeAllowed":"both",
        "useIsotopicRatio":false,
        "iTol":[0.9,1.1]
    },
    "isotope":{
        "list": [
            {"name":"C","number":13,"delta":1.003355,"factor":0.010816,"fullName":"<sup>13</sup>C", "search":true},
            {"name":"Cl","number":37,"delta":1.997050,"factor":0.319736,"fullName":"<sup>37</sup>Cl", "search":false},
            {"name":"Br","number":81,"delta":1.997953,"factor":0.972776,"fullName":"<sup>81</sup>Br", "search":false},
            {"name":"S","number":34,"delta":1.995796,"factor":0.045191,"fullName":"<sup>34</sup>S", "search":false},
            {"name":"K","number":41,"delta":1.998119,"factor":0.07217,"fullName":"<sup>41</sup>K", "search":false}
        ],
        "ppm": 0.3, //should be deprecated
        "mDaTol": 0.1, 
        "iTol": [0.91,1.09],
        "check":true
    },
    "writtenOrder":[
        {"id":"mzExp","name":"m/z Exp",},
        {"id":"I","name":"Intensity","special":true},
        {"id":"ionFormula","name":"Ion formula"},
        {"id":"mzCalc","name":"m/z Calc"},
        {"id":"ppm","name":"ppm"},
        {"id":"ionType","name":"Ion type","special":false},
        {"id":"DBE","name":"DBE"},
        {"id":"atoms","name":"atoms"},
        {"id":"ratios","name":"ratios", "special":["H/C","O/C"]}
    ],
    "directNetwork":{
        "list":[{"formula":"CH2","mass":14.01565},{"formula":"H2","mass":2.01565},{"formula":"H2O","mass":18.010565}],
        "mDaTol":0.1,
        "explorationMethod":"BFS"
    },
    "peakRemoval":{
        "toggle":false,
        "mDaTol":0.1,
        "iTol":0.5,
        "expectI":0.5
    },
    "adducts":{
        "list":["Na+","NH4+","H+"],
        "search":false,
        "fuse":false,
        "computeFrom":false,
    },
    "main":{
        "fileString":"",
        "algorithm":"deNovo",
        "removeIfNoNetwork":false,
        "passMemoryEconomy":false,
        "charge":1
    },
    "checks":{
        "isotopy":true,
        "seeds":true,
        "passes":true,
        "network":false,
        "networkType":"direct",
        "filtering":true
    }
}

var attribPasses = {
    "delta":[
        {"name":"C", "count":[0,10]},
        {"name":"H", "count":[0,10]},
        {"name":"O", "count":[0,5]},
        {"name":"N", "count":[0,1]}
    ],
    "deNovo":[
        [
            {"name":"C", "count":[0,40]},
            {"name":"H", "count":[0,60]},
            {"name":"O", "count":[0,20]},
            {"name":"N", "count":[0,1]},
            {"name":"e","count":[-1,-1]},
        ]
    ],
    "deNovoNames":[""],
    "seeds":[ 
    ],
    "specialGoldenRules":[],
    "mzMax":[-1]
}
attribPasses.specialGoldenRules.push(JSON.parse(JSON.stringify(attribCfg.goldenRules)));
attribPasses.specialGoldenRules[0].override = false;

var attribData = {
    "deltaListRaw":[],
    "deltaListAttrib":[],
    "dataAttrib":[],
    "dataUnattrib":[],
    "dataIsotopes":[],
    "dataPairs":[],
    "dataMatrix":[],
    "info":{
        "foundByNetwork":0,
        "fileDataNum":0
    }
}

attribPasses.deNovo[0] = lookupMassesfromElementsArray(attribPasses.deNovo[0])
attribPasses.delta = lookupMassesfromElementsArray(attribPasses.delta)

/**looks up objects containing objects that are elements and appends their mass from the elements database*/
function lookupMassesfromElementsArray(pass){
    for(let i=0; i<pass.length; i++){
        for(let j=0; j<elementsDatabase.length; j++){
            if(pass[i].name == elementsDatabase[j].name){
                pass[i].mass = elementsDatabase[j].mass
            }
        }
    }
    return pass
}

/////////////////////////////////////////////////////////////////////
//Isotopic network building

/** a function that checks a formula against a set of golden rules */
function checkGoldenRules(molecule, rules){
    //converts the formula to a puncdata json formula if a string is entered
    if(typeof molecule == "string"){
        molecule = new Molecule(molecule)
    }
    
    //N rule and radical/proton
    const dbeIsWhole = ((2*molecule.dbe) %2)==0
    if(dbeIsWhole){
        molecule.ionType = "radical"
    }else{
        molecule.ionType = "adduct"
    }
    if(rules.ionTypeAllowed != "both" && rules.ionTypeAllowed != molecule.ionType){
        return false
    }

    //verify it there is no negative elements
    if(molecule.isThereNegativeValue(true)){return false}

    //skips the computation if filtering is disabled
    if(!attribCfg.checks.filtering){return true;}

    //check DBE
    if(rules.useDBE){    
        if(molecule.dbe<rules.DBEBound[0] || molecule.dbe>rules.DBEBound[1]){return false}
    }

    const numberC = molecule.lookup("C")
    const numberH = molecule.lookupListSum(["H","D"])
    //check elemental ratios
    if(rules.useHCratio){
        var HCBo = rules.HCratioBound
        if(numberH/numberC > HCBo[1] || numberH/numberC < HCBo[0]){return false}
    }

    //check heteroelements ratios
    if(rules.useHeteroRatio){
        for(let i=0; i<rules.heteroRatiosBound.length; i++){
            var div = []
            div[0] = rules.heteroRatiosBound[i].elements[0]
            div[1] = rules.heteroRatiosBound[i].elements[1]
            for(let j=0; j<2; j++){
                if(div[j] == "C"){ div[j] = numberC}
                else if(div[j] == "H"){ div[j] = numberH}
                else{div[j] = molecule.lookup(div[j])}
            }
            if(div[1] == 0){return false} // if no divisor, returns false
            var ratio = div[0]/div[1]
            var bounds = rules.heteroRatiosBound[i].bounds
            if(ratio > bounds[1] || ratio<bounds[0]){return false}
        }
    }
    //check KMD ratio
    if(rules.useKMD){
        let repeatUnit = new Molecule(rules.KMDru)
        var massRU = repeatUnit.mass
        var mass  = molecule.mass
        var newBase = Math.round(massRU)/massRU
        mass = mass*newBase
        massDefect = Math.round(mass) - mass
        if(massDefect > rules.KMDBounds[1] || massDefect < rules.KMDBounds[0]){return false}
    }
    //check Sum Rules
    if(rules.useThreshold){
        for(let i=0; i<rules.thresholdRules.length; i++){
            //checks if all elements are over the value inputted
            let over = true
            for(let j=0; j<rules.thresholdRules[i].elements.length; j++){
                let elName = rules.thresholdRules[i].elements[j]
                let elNumber = molecule.lookup(elName)
                if(elNumber < rules.thresholdRules[i].threshold){over =false; break;}
            }
            //if over the threshold, checks every element
            if(over){
                for(let j=0; j<rules.thresholdRules[i].elements.length; j++){
                    let elName = rules.thresholdRules[i].elements[j]
                    let elMax = rules.thresholdRules[i].max[j]
                    let elNumber = molecule.lookup(elName)
                    if(elNumber >= elMax){return false}
                }
            }
        }
    }
    return true
}

//helper function. Sets the charge of a chosen pass depending on the parameter
function setPassCharge(pass, charge){
    //looks if there is already a electron line in the pass
    for(let i=0; i<pass.length; i++){
        if(pass[i].name =="e"){
            pass[i].count = [-charge, -charge] //electron nb is the opposite of the charge
            return;
        }
    }
    //if we arrive here, there is no line for electrons. adds one.
    pass.push({"name":"e","count":[-charge,-charge],"mass":0.0005489},)
}

////////////////////////////////////////////////////////////////////////////
///////ATTRIBUTION CLASSES
///////////////////////////////////////////////////////////////////////////

/**an attribution instance holds data and functions to treat a data file and all its components as one entity for processign a dataset*/
class AttribInstance{
    constructor(dataset) {
        this.data = dataset
        //TODO: change to a class if needed later
        this.cfg = attribCfg
        //index of the attribution order
        this.attributedIndex = 0
    }
    /** removes previous nodes and data. Input data must be a 2D array */
    fill(data, dataName){
        this.data = duplicateData(data)
        this.dataName = dataName
        //sets an original index at this point
        this.data.forEach((peak,index) =>{peak.originalIndex = index})
        this.sortData(config.mz, false)
        this.reIndexData
    }

    reIndexData(){
        for(let i=0; i<this.data.length; i++){
            this.data[i].attrib = undefined
            this.data[i].index = i //resets the indexes for only this instance of the dataset
        }
    }

    /** sort the data */
    sortData(column, descending){
        if(!this.data[0] || !this.data[1]){return console.error("empty data list")}
        if(isNaN(column) || column <0 || column >= this.data[0].length){return console.error("invalid column for sorting data")}
        if(descending){ 
            this.data.sort(function(a, b){return b[column]-a[column]})
        }else{
            this.data.sort(function(a, b){return a[column]-b[column]})
        }
    }

    /**activates filling and drawing from a fileName format ("file_"+*number*, "matrix", or venn set Name */
    fillFromName(fileName){
        if(fileName.includes("file")){
            let fileNum = fileName.slice(5)
            let file = files.list[fileNum]
            let data = []
            if(file && file.data){data = file.data}
            this.fill(data,fileName)
        }else if(fileName =="none"){
            this.fill([],"")
        }else if(fileName == "matrix"){
            if(!matrixData.length ||matrixData.length ==0){return;}
            this.fill(matrixData,"matrix")
        }else if(vennData && vennData[fileName]){
            if(!vennData[fileName].length ||vennData[fileName].length ==0){return;}
            this.fill(vennData[fileName], fileName)
        }
    }

    prepare_undirected(data){
        this.undirected = new NetworkDeltas(this.cfg)
        this.undirected.fill(data)
        this.undirected.build_deltaMatrix(true)
    }

    /**deploys the isotopic network. Returns an object with "monoisotopic" array of data separated from "isotopes" */
    prepare_isotopy(saveNetwork){
        let isotopic = new NetworkIsotopic(this.cfg.isotope, this.cfg.isotope.list)
        isotopic.fill(this.data)
        isotopic.tagIsotopes()
        let data = isotopic.flatten_monoisotopic()
        let reducedData = data.monoisotopic
        let isotopes = data.isotopes

        if(saveNetwork){this.isotopic = isotopic}
        return data
    }

    /** a function to return the error tolerance. if type="network", gives the network error, otherwise returns normal attribution error*/
    returnErrorTolerance(type, mass){
        if(type =="network" && !this.cfg.ppm.variable){
            return this.cfg.ppm.network
        }else if(!this.cfg.ppm.variable){
            return this.cfg.ppm.attribution
        }
        mass = parseFloat(mass)
        //if we arrive here, the ppm error is variable
        let errorCfg = this.cfg.ppm.attribution
        if(!errorCfg.list || errorCfg.list.length == 0){return 0}
        let bonus = 0
        if(type =="network"){bonus = errorCfg.network}
        //loops through the list of points to find between which the mass is
        let indexMass = -1
        for(let i=0; i<errorCfg.list.length; i++){
            if(mass <= errorCfg.list[i].mass){break}
            indexMass = i
        }
        //handles the extreme cases
        if(indexMass == -1){return errorCfg.list[0].error + bonus}
        if(indexMass >= errorCfg.list.length-1){return errorCfg.list[errorCfg.list.length-1].error + bonus}
        //for all other cases, it depends on the method choice
        if(errorCfg.method == "step"){
            return errorCfg.list[indexMass].error + bonus
        }else if(errorCfg.method == "linear"){
            const minMass = errorCfg.list[indexMass].mass
            const maxMass = errorCfg.list[indexMass+1].mass
            const band = maxMass - minMass
            const percent = (mass - minMass)/band
            //error
            const minError = errorCfg.list[indexMass].error
            const maxError = errorCfg.list[indexMass+1].error
            const errorBand = maxError-minError
            const error = minError + percent*errorBand + bonus
            return error
        }
    }

    /**loops through a pass to find the best attribution to a peak */
    matchPeakToPass(peak, pass, passIndex){
        //it is assumed that the pass is ordered by mass
        //first, rounds the mass and makes a sublist of the whole pass with only attribution within 1-2 Da
        let mass = peak[config.mz]
        let floorMass = Math.floor(mass)
        let decimal = mass - floorMass
        //a pass is ordered in a 2D array manner, with each index being the nominal mass
        let passAttribs = []
        passAttribs = passAttribs.concat(pass.molecules[floorMass])
        //accounts for border effects
        if(decimal >1-this.cfg.ppm.daFilter){passAttribs =  passAttribs.concat(pass.molecules[floorMass+1])}
        else if(decimal<this.cfg.ppm.daFilter){passAttribs = passAttribs.concat(pass.molecules[floorMass-1])}

        let candidates = [] //candidates to best fit
        for(let i=0; i<passAttribs.length; i++){
            if(!passAttribs[i]){continue;}
            const passMass = passAttribs[i].mass
            const delta = passMass - mass
            if(delta>this.cfg.ppm.daFilter){continue;} //skips quickly if we are far from the true mass
            if(-delta>this.cfg.ppm.daFilter){continue;} //breaks if we overshot the mass; no peak has been found
            const ppm = 1e6*delta/mass
            //no need to check for golden rules because the pass should have been proofed already
            const ppmTol = this.returnErrorTolerance("attribution", mass)
            if(Math.abs(ppm)<ppmTol){
                candidates.push({index:i, error:ppm})
            }
        }
        if(candidates.length >0){
        //searches the best fit in the candidates by lowest ppm error
        candidates.sort((a,b)=>Math.abs(a.error)-Math.abs(b.error))
        //attributes the lowest error
        const bestCandidate = candidates[0]
        const bestCandidateMolecule = passAttribs[bestCandidate.index]
        bestCandidateMolecule.stringify()
        peak.attrib = new Attribution(bestCandidateMolecule.name,"",peak, bestCandidate.error)
        peak.attrib.passNumber = passIndex+1
        peak.attrib.name = peak.attrib.stringify()
        peak.attrib.type = "deNovo"
        peak.attrib.ionType = bestCandidateMolecule.ionType
        this.attributedIndex += 1
        peak.attrib.attributedIndex = this.attributedIndex
        return peak
        }
        return "notFound"
    }

    /** a  function to attribute this.data*/
    attributeBySinglePass(pass, passIndex){
        let data = this.data
        let found = []
        let foundByNetwork = []
        this.network.currentPassIndex = passIndex //informs the network of the current pass, used when special filter rules are active
        for(let i=0; i<data.length; i++){
            if(data[i].attrib){continue;}
            let result = this.matchPeakToPass(data[i],pass, passIndex)
            if(result !="notFound"){
                found.push(result)
                let thisNetworkExploration = []
                if(this.cfg.checks.network){
                    thisNetworkExploration = this.network.propagate_attrib(result.index, this.cfg.directNetwork.explorationMethod, this.cfg.directNetwork.list)
                }
                this.attributedIndex += foundByNetwork.length
                foundByNetwork = foundByNetwork.concat(thisNetworkExploration)
            }
        }
        let allFound = {deNovo:found, network:foundByNetwork}
        return allFound
    }

    removeOmegaPeaks(){
        // (data,mDaTol,expectedI, iTol)
        let suspectPeaks = []
        let cfgSpe = this.cfg.peakRemoval
        //loops through data, that should be already sorted by mass
        for(let i=0; i<this.data.length; i++){
            let mass = this.data[i][config.mz]
            let intensity = this.data[i][config.intensity]*cfgSpe.expectI
            let mass2 = mass*2
            for(let j=i; j<this.data.length; j++){
                //checks for mass
                let deltaMass = this.data[j][config.mz]-mass2
                if(Math.abs(deltaMass)<cfgSpe.mDaTol){
                    //checks for intensity
                    let ratioI = this.data[j][config.intensity]/intensity
                    let iMax = 1 +cfgSpe.iTol
                    let iMin = 1- (cfgSpe.iTol)/iMax
                    if(ratioI>iMin && ratioI<iMax){
                        suspectPeaks.push(this.data[j])
                        this.data.splice(j,1)
                    }
                }
            }
        }
        return suspectPeaks
    }

    async attribute(){
        let start = Date.now();
        const timeStep = []
        timeStep.push(start)
        this.attributedIndex = 0 //resets the index
        this.log = {} //saves information about assignment
        this.log.peakLength_raw = this.data.length
        this.reIndexData()
        //isotopy
        let isotopyData = []
        if(this.cfg.checks.isotopy){
            isotopyData = this.prepare_isotopy()
            this.data = isotopyData.monoisotopic
            this.reIndexData()
            await new Promise(resolve => setTimeout(resolve, 1));
            logText("attribLog","Isotope search finished. Found "+isotopyData.isotopes.length)
            this.log.peakLength_iso = isotopyData.isotopes.length
        }

        //remove suspect peaks
        let suspectPeaks = []
        if(this.cfg.peakRemoval.toggle){
            suspectPeaks = this.removeOmegaPeaks()
            this.reIndexData()
            await new Promise(resolve => setTimeout(resolve, 1));
            logText("attribLog","Suspect peaks search finished. Found "+suspectPeaks.length)
            this.log.peakLength_rem = suspectPeaks.length
        }
        let attributions = []
        //seeds
        let seeds =[]
        if(this.cfg.checks.seeds){
            seeds = this.find_seeds()
            logText("attribLog","Seed search finished. Found "+seeds.length)
            await new Promise(resolve => setTimeout(resolve, 1));
            attributions = seeds
        }


        //builds a network
        let network = {}
        this.network = network
        timeStep.push(Date.now())
        if(this.cfg.checks.network && this.cfg.checks.networkType == "undirect"){
            this.prepare_undirected(this.data)
            network = this.undirected
            this.network = network
            timeStep.push(Date.now())
            const time = timeStep[timeStep.length-1] - timeStep[timeStep.length - 2]
            logText("attribLog","Undirected network build in "+time+" ms. Edges found :"+network.edges.length)
            await new Promise(resolve => setTimeout(resolve, 1));
            //first seeded search
            for(let i=0; i<seeds.length; i++){
                network.attributedIndex = this.attributedIndex
                let attributed = []
                attributed = network.propagate_attrib(seeds[i].index, this.cfg.directNetwork.explorationMethod, this.network.edgesTypes)
                this.attributedIndex += attributed.length
                attributions = attributions.concat(attributed)
            }
            timeStep.push(Date.now())
            const time2 = timeStep[timeStep.length-1] - timeStep[timeStep.length - 2]
            let percent = 0
            if(attributions.length >0){percent = (100*(attributions.length - seeds.length)/attributions.length).toFixed(2)}
            logText("attribLog","Seeded Network search made in "+time2+" ms. Attributions found :"+attributions.length +"("+percent+"% by network)")
            await new Promise(resolve => setTimeout(resolve, 1));
        }else if(this.cfg.checks.network && this.cfg.checks.networkType == "direct"){
            network = new NetworkAttrib(this.cfg)
            network.fill(this.data)
            network.construct_directed()
            this.network = network
            timeStep.push(Date.now())
            const time = timeStep[timeStep.length-1] - timeStep[timeStep.length - 2]
            logText("attribLog","Network build in "+time+" ms. Edges found :"+network.edges.length)
            await new Promise(resolve => setTimeout(resolve, 1));
            //first seeded search
            for(let i=0; i<seeds.length; i++){
                network.attributedIndex = this.attributedIndex
                let attributed = []
                attributed = network.propagate_attrib(seeds[i].index, this.cfg.directNetwork.explorationMethod, this.cfg.directNetwork.list)
                this.attributedIndex += attributed.length
                attributions = attributions.concat(attributed)
            }
            timeStep.push(Date.now())
            const time2 = timeStep[timeStep.length-1] - timeStep[timeStep.length - 2]
            let percent = 0
            if(attributions.length >0){percent = (100*(attributions.length - seeds.length)/attributions.length).toFixed(2)}
            logText("attribLog","Seeded Network search made in "+time2+" ms. Attributions found :"+attributions.length+"("+percent+"% by network)")
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        
        //DeNovo passes
        if(this.cfg.checks.passes){
            for(let i=0; i<attribPasses.deNovo.length; i++){
                let pass = new AttributionPass(attribPasses.deNovo[i],i, this.cfg)
                //mzMin and mzMax of the pass
                pass.mzMin = this.data[1][config.mz]-1
                let trueMaxMass = this.data[this.data.length-1][config.mz]+1
                if(pass.mzMax != -1){pass.mzMax = Math.min(pass.mzMax,trueMaxMass)}
                else{pass.mzMax = trueMaxMass}
                //experimental method to remove mass units where no peak is present
                if(this.cfg.main.passMemoryEconomy){
                    let mzSet = new Set()
                    for(let i=1; i<this.data.length; i++){
                        let floorMass = Math.floor(this.data[i][config.mz])
                        if(!mzSet.has(floorMass)){mzSet.add(floorMass)}
                    }
                    pass.mzSet = mzSet
                }
                //
                pass.prepareCombinations()
                timeStep.push(Date.now())
                const time = timeStep[timeStep.length-1] - timeStep[timeStep.length - 2]
                logText("attribLog","Pass "+(i+1)+" build in "+time+"ms")
                await new Promise(resolve => setTimeout(resolve, 1));
                let passResults = this.attributeBySinglePass(pass, i)
                attributions = attributions.concat(passResults.deNovo|| [])
                attributions = attributions.concat(passResults.network|| [])
                let totalFound = passResults.deNovo.length + passResults.network.length
                timeStep.push(Date.now())
                const time2 = timeStep[timeStep.length-1] - timeStep[timeStep.length - 2]
                let percentText = ""
                if(this.cfg.checks.network){
                    let percent = 0
                    if(passResults.deNovo.length >0 || passResults.network >0){
                        percent = (100*(passResults.network.length)/(passResults.deNovo.length+ passResults.network.length)).toFixed(2)
                        percentText = " ("+percent+"% by network)"
                    }
                    logText("attribLog","Seeded pass Network search made. Attributions found :"+passResults.network.length)
                }
                logText("attribLog","Pass "+(i+1)+" attributed in "+time2+"ms, "+totalFound+" attributions found"+percentText)
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        //removes peak without network connections
        if(this.cfg.main.removeIfNoNetwork && this.network){
            for(let i=attributions.length-1; i>=0; i--){
                let neighbours = this.network.getNeighbours_bothSides(attributions[i].index)
                if(neighbours.length <1){
                    attributions[i].attrib = undefined
                    attributions.splice(i,1)
                }
            }
        }
        //adducts
        let adductFusedCount = 0
        if(this.cfg.adducts.search){
            for(let i=0; i<attributions.length; i++){
                if(!attributions[i].attrib){continue;}
                this.compute_adduct(attributions[i])
            }
            if(this.cfg.adducts.fuse){
                adductFusedCount = this.fuseIons(attributions)
            }
        }
        /******************************************* */
        //attribution finished.Wrap up 

        //builds the unattributed list
        let unattributed = []
        for(let i=0; i<this.data.length; i++){
            if(!this.data[i].attrib){unattributed.push(this.data[i])}
        }
        attributions.sort((a,b)=>a[config.mz]-b[config.mz])
        this.log.peakLength_att = attributions.length
        let results = {
            attributed:attributions,
            isotopes: isotopyData.isotopes ||[],
            unattributed : unattributed||[],
            suspects: suspectPeaks||[],
            matrix : this.writeDataMatrix(attributions, unattributed),
            network : this.network,
            log: this.log
        }
        /** verifies network logic */
        if(this.network && this.network.edges){
            let edges = this.network.verifyAllEdges()
            if(edges[3].length >0){
                logText("attribLog", "<b>Warning ! at least "+edges[3].length+" network links are incorrect. Consider lowering network errors to limit attribution risk errors</b>")
            }
            let noSource = edges[1]
            let noTarget = edges[2]
            let wrongEdges = edges[3]
            let suspectNodes = new Set()
            for(let i=0; i<wrongEdges.length; i++){
                if(!suspectNodes.has(wrongEdges[i].source)){suspectNodes.add(wrongEdges[i].source)}
                if(!suspectNodes.has(wrongEdges[i].target)){suspectNodes.add(wrongEdges[i].target)}
            }
            let suspectList = Array.from(suspectNodes)
            this.network.inspectSuspectNodes(suspectList)
        }

        /* final logs*/
        const end = Date.now();
        let attribCount = attributions.length + adductFusedCount
        logText("attribLog", "Total Attributions found: "+attribCount+" attributions found")
        if(this.network && attributions.length >0){ //logs the number of attributions found by the network
            let attribByNetwork = 0 
            for(let i=0; i<attributions.length; i++){
                if(attributions[i].attrib && attributions[i].attrib.type == "network"){attribByNetwork +=1}
            }
            logText("attribLog", (100*attribByNetwork/attributions.length).toFixed(2)+"% found by network")
            this.log.attribByNetwork = attribByNetwork
        }
        logText("attribLog",`Execution time: ${end - start} ms`)
        this.log.time = end - start

        return results
    }

    /**recomputes additional data about attributions without restarting all attribution */
    retreatAttributions(){
        let results = attribData
        if(!results.attributed){return;}
        let attributions = results.attributed
        //removes peak without network connections
        if(this.cfg.main.removeIfNoNetwork && this.network){
            for(let i=attributions.length-1; i>=0; i--){
                let neighbours = this.network.getNeighbours_bothSides(attributions[i].index)
                if(neighbours.length <1){
                    attributions[i].attrib = undefined
                    attributions.splice(i,1)
                }
            }
        }
        //adducts
        if(this.cfg.adducts.search){
            for(let i=0; i<attributions.length; i++){
                if(!attributions[i].attrib){continue;}
                this.compute_adduct(attributions[i])
            }
        }
        let newResults = {
            attributed: attributions,
            isotopes: results.isotopes,
            unattributed : results.unattributed,
            suspects: results.suspectPeaks,
            matrix : this.writeDataMatrix(attributions, results.unattributed),
            network : this.network
        }
        return newResults
    }

    /**finds the seeds for each peak */
    find_seeds(){
        //TODO: make seeds customizable
        let seeds = attribPasses.seeds
        let foundSeeds = []
        for(const seedID in seeds){
            const seedMol = new Molecule(seeds[seedID].formula)
            //looks for this seed in the data
            for(let i=1; i<this.data.length; i++){
                let peak = this.data[i]
                const delta = seedMol.mass - parseFloat(peak[config.mz])
                //skips everything if mass goes over the filter, because data should be sorted in increasing order
                if(delta<this.cfg.ppm.daFilter && Math.abs(delta>this.cfg.ppm.daFilter)){break;}
                const goldenRules = checkGoldenRules(seedMol, this.cfg.goldenRules)
                if(!goldenRules){break;}
                const ppm = 1e6*delta/parseFloat(peak[config.mz])
                const ppmTol = this.returnErrorTolerance("attribution", seedMol.mass)
                //TODO : make a special tolerance for seeds
                if(Math.abs(ppm)<ppmTol){
                    peak.attrib = new Attribution(seeds[seedID].formula,"",peak, ppm)
                    peak.attrib.type = "seed"
                    peak.attrib.ionType = seedMol.ionType
                    this.attributedIndex += 1
                    peak.attrib.attributedIndex = this.attributedIndex
                    foundSeeds.push(peak)
                }
            }
        }
        return foundSeeds
    }

    /** computes what is the adduct for this attribution */
    compute_adduct(peak){
        let adductList = this.cfg.adducts.list
        let attrib = peak.attrib
        //handles radicals
        if(attrib.ionType == "radical"){
            let attribCopy = attrib.returnDuplicate()
            let charge = attrib.lookup("e")
            attribCopy.removeFormula("e"+charge)
            attrib.formulaNeutral = attribCopy
            return;
        }
        for(let i=0; i<adductList.length; i++){
            //could be optimized to not do this step so many times
            let adduct = new ChemFormula(adductList[i])
            //if the attribution doesn't contain this adducts, looks for the next one
            if(!attrib.includes(adduct)){continue;}
            attrib.adduct = adduct.name
            attrib.formulaNeutral = peak.attrib.returnDuplicate()
            attrib.formulaNeutral.removeFormula(adduct)
            break;
        }
        //if we are here, no possible adduct has been found
        if(!attrib.adduct){attrib.adduct = "error"}
    }

    /**from a list of attributions, fuse together ions with the same neutral molecula. Adduct search has to be done beforehand
     * Returns the number of fused ions
     */
    fuseIons(attributions){
        let count = 0
        for(let i=attributions.length-1; i>=0; i--){
            let attrib = attributions[i].attrib
            if(!attrib.formulaNeutral){continue}
            for(let j=i-1; j>=0; j--){
                let attrib2  = attributions[j].attrib
                if(!attrib2.formulaNeutral){continue}
                if(attrib.formulaNeutral.name == attrib2.formulaNeutral.name){
                    //if we arrive here, there's a match
                    count += 1
                    attrib2.fused = true
                    if(!attrib2.adducts){attrib2.adducts = []}
                    //builds cumulated data
                    if(attrib2.adduct){attrib2.adducts.push(attrib2.adduct)}
                    if(attrib.adduct){attrib2.adducts.push(attrib.adduct)}
                    if(attrib.ionType != attrib2.ionType){attrib.ionType = "both"}
                    if(!isNaN(attrib[config.intensity])){attrib2[config.intensity] = parseFloat(attrib2[config.intensity]) + parseFloat(attrib[config.intensity])}
                    //TODO: think about what should be done with m/z value and other variables
                    attributions.splice(i,1)
                }
            }
        }
        return count
    }

    writeDataMatrix(data, unattribData){
        let writeOrder = this.cfg.writtenOrder
        let dataMatrix = []
        dataMatrix[0] = []
        //write the header line
        for(let i=0; i<writeOrder.length; i++){
            if(writeOrder[i].id == "atoms"){
                //build an atom list
                var elementsList =  writeOrder[i].special
                if(elementsList == "" || !elementsList){
                    let moleculesList = []
                    for(let i=0; i<data.length; i++){
                        moleculesList.push(data[i].attrib)
                    }
                    elementsList = buildElementsList(moleculesList)
                }
                for(let i=elementsList.length; i>0; i--){ //removes any mention of electrons
                    if(elementsList[i] == "e"){elementsList.splice(i,1)}
                }
                //adds the names of the elements at the end of dataMatrix header titles
                for(let i=0; i<elementsList.length; i++){dataMatrix[0].push("#"+elementsList[i])}
            }else if(writeOrder[i].id == "ratios"){
                //builds the ratios list
                for(let j=0; j<writeOrder[i].special.length; j++){
                    dataMatrix[0].push(writeOrder[i].special[j])
                }
            }else if(writeOrder[i].id == "originCols"){
                //first unattrib data holds the titles
                if(!unattribData[0]){continue;}
                for(let j=0; j<unattribData[0].length; j++){
                    if(j==config.intensity || j== config.mz){continue;}
                    dataMatrix[0].push(unattribData[0][j])
                }
            }else if(writeOrder[i].id == "polymer"){
                dataMatrix[0].push("Polymer unit ("+writeOrder[i].special+") count")
                dataMatrix[0].push("End group")
            }else{
                dataMatrix[0].push(writeOrder[i].name)
            }
        }
        //Constructs each peak
        for(let i=1; i<data.length+1; i++){
            var peak = data[i-1]
            dataMatrix[i]= this.constructInfoLinePeak(peak, writeOrder, elementsList)
        }
        if(debug){console.log("writing attrib matrix:",elementsList)}
        return dataMatrix
    }

    constructInfoLinePeak(peak, infoList, elementsList){
        let array = []
        let attrib = peak.attrib || {}
        for(let i=0; i<infoList.length; i++){
            if(infoList[i].id=="mzExp"){
                array.push(parseFloat(peak[config.mz]))
            }else if(infoList[i].id =="index"){
                array.push(peak.originalIndex)
            }else if(infoList[i].id =="indexAttrib"){
                array.push(attrib.attributedIndex)
            }else if(infoList[i].id=="I"){
                if(infoList[i].special == true){
                    let totInt = parseFloat(peak[config.intensity]) + peak.isoIntensity
                    array.push(totInt || parseFloat(peak[config.intensity]))
                }else{
                    array.push(parseFloat(peak[config.intensity]))
                }
            }else if(infoList[i].id=="ionFormula"){
                array.push(attrib.name)
            }else if(infoList[i].id =="mzCalc"){
                array.push(attrib.mass)
            }else if(infoList[i].id == "ppm"){
                array.push(attrib.ppmError)
            }else if(infoList[i].id == "ionType"){
                if(infoList[i].special == true){
                    if((attrib.ionType) == "radical"){array.push(1)}
                    else{array.push(0)}
                }else{ array.push(attrib.ionType)}  
            }else if(infoList[i].id == "DBE"){
                array.push(attrib.dbe)
            }else if(infoList[i].id == "type"){
                if(infoList[i].special == true){
                    if(attrib.type == "network"){array.push(1)}
                    else{array.push(0)}
                }else{
                    array.push(attrib.type)
                }
            }else if(infoList[i].id =="seedDistance"){
                array.push(attrib.distanceSeed || -1)
            }else if(infoList[i].id == "whichPass"){
                array.push(attrib.passNumber || 0)
            }else if(infoList[i].id == "atoms"){
                //here is true, will try to write atoms number based on chemical formula without adduct
                if(this.cfg.adducts.search && (this.cfg.adducts.computeFrom || this.cfg.adducts.fuse)){
                    if(peak.adduct == "error"){ //checks if there is an error and adduct hasn't been found
                        //cannot continue because it would risk wrong interpretation of data
                        for(let j=0; j<elementsList.length; j++){array.push("error : no compatible adduct")}
                    }else if(attrib.formulaNeutral){
                        for(let j=0; j<elementsList.length; j++){// all other cases here: radicals and found adducts
                            array.push(attrib.formulaNeutral.lookup(elementsList[j]))
                        }
                    }else{
                        for(let j=0; j<elementsList.length; j++){
                            array.push(attrib.lookup(elementsList[j]))
                        }
                    }
                }else{ //write from ionic formula
                    for(let j=0; j<elementsList.length; j++){
                        array.push(attrib.lookup(elementsList[j]))
                    }
                }
    
            }else if(infoList[i].id == "ratios"){
                //same as for atoms, has to decide if it is based on ionic or chemical formula
                let ratios = infoList[i].special
                if(attribCfg.adducts.computeFrom || attribCfg.adducts.fuse){
                    if(peak.adduct == "error"){ //checks if there is an error and adduct hasn't been found
                        //cannot continue because it would risk wrong interpretation of data
                        for(let j=0; j<ratios.length; j++){array.push("error : no compatible adduct")}
                    }else{ //all other cases: radicals or adducts found
                        for(let j=0; j<ratios.length; j++){
                            let ratio = ratios[j].match(/[a-zA-Z]+|[0-9]+/g)
                            let thisAttrib = attrib
                            if(attrib.formulaNeutral){
                                thisAttrib = attrib.formulaNeutral
                            }
                            let dividend = thisAttrib.lookup(ratio[0])
                            let divisor = thisAttrib.lookup(ratio[1])
                            if(divisor == 0){
                                array.push("")
                                continue;
                            }
                            array.push(dividend/divisor)     
                            }
                    }
                }else{ // write from ionic formula
                    for(let j=0; j<ratios.length; j++){
                        let ratio = ratios[j].match(/[a-zA-Z]+|[0-9]+/g)
                        let dividend =  attrib.lookup(ratio[0])
                        let divisor = attrib.lookup(ratio[1])
                        if(divisor == 0){
                            array.push("")
                            continue;
                        }
                        array.push(dividend/divisor)
                    }
                }
            }else if(infoList[i].id == "originCols"){
                for(let j=0; j<peak.length; j++){
                    if(j==config.intensity || j==config.mz){continue;}
                    array.push(peak[j])
                }
            }else if(infoList[i].id == "polymer"){
                let polymerString = infoList[i].special
                if(polymerString){
                    let polymerUnit = new Molecule(polymerString)
                    let results = segmentPolymer(attrib,polymerUnit)
                    array.push(results.unitsNb)
                    array.push(results.endGroups.name)
                }
            }else if(infoList[i].id =="chemicalFormula"){ //TODO correct this
                if(attrib.formulaNeutral){
                    if(attrib.adduct =="error"){array.push("Error: no compatible adduct to substract")}
                    else{array.push(attrib.formulaNeutral.name)}
                }else{array.push("Error: toggle on adduct search")}
            }else if(infoList[i].id == "adducts"){
                if((attrib.ionType) == "radical"){array.push("")}
                else if(attrib.adducts){ //for fused multiple adducts
                    array.push(attrib.adducts.join(''))
                }else if(attrib.adduct){
                    if(attrib.adduct =="error"){array.push("no compatible adduct")}
                    else{array.push(attrib.adduct)}
                }else{array.push("Error: toggle on adduct search")}
            }else if(infoList[i].id == "empty"){
                array.push("")
            }
    
    
        }
        return array
    }


}

/**a molecule being found in a sample. this.data contains the original data found */
class Attribution extends Molecule{
    constructor(name, formalName, dataArray, ppmError){
        super(name)
        if(name =="empty"){return;}
        if(formalName){this.formalName == formalName}
        else{this.formalName = ""}
        this.data = dataArray
        this.ppmError = ppmError
    }

    /**returns a copy of this molecule */
    returnDuplicate(){
        let copy = new Attribution("empty")
        copy.name = this.name
        copy.mass = this.mass
        copy.formula = []
        for(let i=0; i<this.formula.length; i++){
            let el = {name: this.formula[i].name, number:this.formula[i].number}
            copy.formula.push(el)
        }
        copy.formalName = this.formalName
        copy.dbe = this.dbe
        copy.data = [] //no data referenced since it is a copy
        copy.ppmError = this.ppmError
        return copy
    }

    /**recomputes the error */
    computeError(){
        const expMass = parseFloat(this.data[config.mz])
        this.ppmError = 1e6*(this.mass - expMass)/expMass
    }
}

/**an attribution pass. Contains a list with each element name and count (array with min max values) */
class AttributionPass{
    constructor(list,index, cfg){
        this.cfg = cfg
        this.list = list ||[]
        this.specialGoldenRules = []
        this.mzMax = attribPasses.mzMax[index] || -1
        this.mzMin = -1
        //find if these are special golden rules or not
        let specialGoldenRules = attribPasses.specialGoldenRules[index]
        if(!specialGoldenRules || (specialGoldenRules && !specialGoldenRules.override)){
            specialGoldenRules = cfg.goldenRules
        }
        this.specialGoldenRules = specialGoldenRules;
        this.checkGoldenRules = true;
        this.molecules = []
        this.charge = list.charge || 0
    }

    prepareCombinations(){
        //constructs the minimal molecule from the pass, from the minimal bound of each element
        let minFormulaArray = []
        for(let i=0; i<this.list.length; i++){
            let el = this.list[i]
            minFormulaArray[i] = el.count[0]
        }
        /**starts the backtracking building the molecule**/
        this.molecules = []
        this.recursiveLoop(0, minFormulaArray)
        //for each molecule mass, sort by mass
        for(let i=0; i<this.molecules.length; i++){
            if(!this.molecules[i]){continue;}
            this.molecules[i].sort((a,b)=> a.mass - b.mass)   
        }
    }
    /** a recursive function to create all possible combinations of the pass */
    recursiveLoop(index, formula){
        /** formula is an array, the index refers to the number of the element in the pass */
        let thisEl = this.list[index];
        let listLength = this.list.length
        for(let i=thisEl.count[0]; i<=thisEl.count[1]; i++){
            if(i>thisEl.count[0]){formula[index] = i} //sets this element number 
            if(index<listLength-1){
                //continue by going to the next index in the pass
                this.recursiveLoop(index+1, formula.slice())
            }else{
             /** arriving here means all pass elements have been visited. The formula should be computed to see if it is valid */
             let mass = 0
             for(let i=0; i<listLength; i++){
                mass += this.list[i].mass*formula[i]
             }
             //check if the molecule is valid
             if(this.mzMax !=-1 && mass > this.mzMax){continue;}
             if(this.mzMin !=-1 && mass < this.mzMin){continue;}
             if(this.mzSet && !this.mzSet.has(Math.floor(mass))){continue;}
             let formulaList = []
             for(let i=0; i<listLength; i++){
                if(formula[i] != 0){
                    formulaList.push({name:this.list[i].name,number:formula[i]})
                }
             }
             let molecule = Object.create(Molecule.prototype)
             molecule.formula = formulaList
             molecule.mass = mass
             if(this.checkGoldenRules){
                molecule.computeDBE()
                if(!checkGoldenRules(molecule, this.specialGoldenRules)){continue;}
             }
             let roundMass = Math.floor(molecule.mass)
             if(!this.molecules[roundMass]){this.molecules[roundMass] = []}
             this.molecules[roundMass].push(molecule)
             continue;               
            }

        }
                
    }

    /** this is used mainly by popups to try and find the best mass match */
    prepareCombinations_singleMass(mass){
        let results = []

        //constructs the minimal molecule from the pass, from the minimal bound of each element
        let minFormulaArray = []
        for(let i=0; i<this.list.length; i++){
            let el = this.list[i]
            minFormulaArray[i] = el.count[0]
        }
        /**starts the backtracking building the molecule**/
        results = this.recursiveLoop_singleMass(0, minFormulaArray, results, mass)
        //for each molecule mass, sort by mass
        results.sort((a,b)=> a.mass - b.mass)   
        return results
    }

    recursiveLoop_singleMass(index, formula, results, mass){
        /** formula is an array, the index refers to the number of the element in the pass */
        const thisEl = this.list[index];
        let listLength = this.list.length
        for(let i=thisEl.count[0]; i<thisEl.count[1]+1; i++){
            if(i>thisEl.count[0]){formula[index] = i} //sets this element number 
            if(index<this.list.length-1){
                //continue by going to the next index in the pass
                this.recursiveLoop_singleMass(index+1, formula.slice(), results, mass)
            }else{
             /** arriving here means all pass elements have been visited. The formula should be computed to see if it is valid */
             let mass = 0
             for(let i=0; i<listLength; i++){
                if(formula[i] != 0){
                    mass += this.list[i].mass*formula[i]
                }
             }
             //check if the molecule is valid
             if(mass >mass +1 || mass<mass-1){break;}
             if(this.mzMax !=-1 && mass> this.mzMax){break;}
             let formulaList = []
             for(let i=0; i<listLength; i++){
                if(formula[i] != 0){
                    formulaList.push({name:this.list[i].name,number:formula[i]})
                }
             }
             let molecule = Object.create(Molecule.prototype)
             molecule.formula = formulaList
             molecule.mass = mass
             molecule.stringify()
             if(this.checkGoldenRules){
                molecule.computeDBE()
                let gRules = checkGoldenRules(molecule, this.specialGoldenRules)
                if(!gRules){molecule.gRules = false}
                else{molecule.gRules = true}
             }
             if(!results){results = []}
             results.push(molecule)
            }
        }   
        return results      
    }

    cleanMolecules(){
        this.molecules = []
    }

    /**set the pass charge */
    setPassCharge(charge){
        //looks if there is already a electron line in the pass
        for(let i=0; i<this.list.length; i++){
            if(pass[i].name =="e"){
                pass[i].count = [-charge, -charge] //electron nb is the opposite of the charge
                return;
            }
        }
        //if we arrive here, there is no line for electrons. adds one.
        pass.push({"name":"e","count":[-charge,-charge],"mass":0.0005489},)
    }
}

class AttributionPass_molecules extends AttributionPass{
    constructor(list,index, cfg){
        super(list,index, cfg)
        this.molecules = []
        //prepares the pass as a molecule list
        for(let i=0; i<this.list.length; i++){
            let el = this.list[i]
            el.molecule = new Molecule(el.name)
            el.mass = el.molecule.mass
        }
    } 

    /**re-does the recursive loop to consider formula elements as molecules */
    recursiveLoop(index, formula){
        /** formula is an array, the index refers to the number of the element in the pass */
        let thisEl = this.list[index];
        let listLength = this.list.length
        for(let i=thisEl.count[0]; i<=thisEl.count[1]; i++){
            if(i>thisEl.count[0]){formula[index] = i} //sets this element number 
            if(index<listLength-1){
                //continue by going to the next index in the pass
                this.recursiveLoop(index+1, formula.slice())
            }else{
             /** arriving here means all pass elements have been visited. The formula should be computed to see if it is valid */
             let mass = 0
             for(let i=0; i<listLength; i++){
                mass += this.list[i].mass*formula[i]
             }
             //check if the molecule is valid
             if(this.mzMax !=-1 && mass > this.mzMax){continue;}
             if(this.mzMin !=-1 && mass < this.mzMin){continue;}
             if(this.mzSet && !this.mzSet.has(Math.floor(mass))){continue;}
             let formulaList = []
             //decomposes each formula from the pass into its elements and adds it to the correct formulaList element
             for(let i=0; i<listLength; i++){
                let subMolecule = this.list[i].molecule
                let subFormula = subMolecule.formula
                for(let j=0; j<subFormula.length; j++){
                    let found = false
                    for(let k=0; k<formulaList.length; k++){
                        if(formulaList[k].name == subFormula[j].name){
                            formulaList[k].number += subFormula[j].number*formula[i]
                            found = true
                            break;
                        }
                    }
                    if(!found){
                        formulaList.push({name:subFormula[j].name, number: subFormula[j].number*formula[i]})
                    }
                }
            }

             let molecule = Object.create(Molecule.prototype)
             molecule.formula = formulaList
             molecule.mass = mass
             console.log(molecule, this)
             
             if(this.checkGoldenRules){
                molecule.computeDBE()
                if(!checkGoldenRules(molecule, this.specialGoldenRules)){continue;}
             }
             let roundMass = Math.floor(molecule.mass)
             if(!this.molecules[roundMass]){this.molecules[roundMass] = []}
             this.molecules[roundMass].push(molecule)
             continue;               
            }

        }
                
    }
}

/** a network to tag peaks as isotopes */
class NetworkIsotopic extends Network{
    constructor(cfg, isotopesList){
        super()
        this.cfg =cfg
        this.isotopesList = isotopesList
    }

    tagIsotopes(){
        //prepares the names list and mass list
        let namesList = []
        let massesList = []
        for(let i=0; i<this.isotopesList.length; i++){
            if(!this.isotopesList[i].search){continue;}//if search is desactivated, skips
            namesList.push(this.isotopesList[i].name)
            massesList.push(this.isotopesList[i].delta)
        }
        //creates the network
        this.linkDeltaMassList(namesList, massesList, this.cfg.mDaTol)
    }

    /**tags each node to find the monoisotopic source. Returns an object separating data from monoisotopic peaks and isotopes */
    flatten_monoisotopic(){
        for(let i=0; i<this.nodes.length; i++){
            this.explore_isotopy(i)
        }
        //from the isotopic distribution, estimates the number of elements for each peak
        this.estimateFormula()

        let data = {isotopes:[],monoisotopic:[]}
        for(let i=0; i<this.nodes.length; i++){
            if(this.nodes[i].monoisotopicIndex && this.nodes[i].monoisotopicIndex>0){
                data.isotopes.push(this.nodes[i])
            }else{
                data.monoisotopic.push(this.nodes[i])
            }
        }
        return data
    }

    /**explores the isotopic network of a single node and sums up all the intensities*/
    explore_isotopy(nodeIndex){
        let isotopes = this.getNeighbours(nodeIndex)
        if(isotopes.length == 0){return;}
        // BFS Search
        const visited = new Set();
        let isotopesIntensity = 0;
        let isotopesNumber = 0;
        let isotopesArray =[]
        const queue = [nodeIndex];
        //stops here if the node is already an isotope
        if(this.nodes[nodeIndex].monoisotopicIndex){
            return;
        }

        while (queue.length > 0) {
            const currentNode = queue.shift(); // Dequeue
            if (visited.has(currentNode)) continue; // Skip already visited nodes
            //updates data for the monisotopic and the others
            visited.add(currentNode);
            //tags this node and updates the monoisotopic
            if(currentNode != nodeIndex){
                isotopesIntensity += parseFloat(this.nodes[currentNode][config.intensity]) || 0; // Sum intensity
                isotopesNumber += 1
                this.nodes[currentNode].monoisotopicIndex = nodeIndex
                this.nodes[currentNode].monoisotopicPeak = this.nodes[nodeIndex]
                this.nodes[currentNode].isotopesList = isotopesArray.slice()
            }
            //pushes new neighbours
            for (const link of this.getNeighbours(currentNode)) {
                if (!visited.has(link.neighbour)) {
                    queue.push(link.neighbour);
                    //already pushes the name
                    isotopesArray.push(link.name)
                }
            }
        }

        this.nodes[nodeIndex].isoIntensity = isotopesIntensity
        this.nodes[nodeIndex].isoNumber = isotopesNumber //if there are no errors should equal to isoList.length
        this.nodes[nodeIndex].isoList = isotopesArray
        }

     /** adds an ".estimate" array to each attribution that has isotopes found */
    estimateFormula(){
        for(let i=0; i<this.nodes.length; i++){
            let node = this.nodes[i]
            if(!node.isoNumber || node.isoNumber ==0){continue;}
            let neighbours = this.getNeighbours(i)
            //build estimates only on direct neighbours
            node.estimate = []
            for(let j=0; j<neighbours.length; j++){
                node.estimate.push(this.estimateFormula_onePeak(i,neighbours[j].neighbour, neighbours[j].name))
            }
        }
    }
    /** based on a peak and its neighbour (isotope), returns an estimate name/value of the number of atoms concerned */
    estimateFormula_onePeak(monoIndex, neighbourIndex, isotopeName){
        let mono = this.nodes[monoIndex]
        let iso = this.nodes[neighbourIndex]
        let ratio = 100*iso[config.intensity] /mono[config.intensity] 
        //looks for the expected ratio
        let isoTheory = this.isotopesList.find(el => el.name == isotopeName)
        let isoNumber = ratio*isoTheory.factor*100
        let estimate = {name:isotopeName, value:isoNumber}
        return estimate
    }
}

/**an attribution network is used to propagate attributions in a dataset through network links */
class NetworkAttrib extends Network{
    constructor(cfg) {
        super()
        this.cfg = cfg
        this.attributedIndex = 0
        this.visited = new Set()
        this.debugQueue = []
        this.currentPassIndex = 0 //the current pass active in the attribution process
    }
    
    construct_directed(){
        let linksTypes = this.cfg.directNetwork.list
        let namesList = []
        let massList = []
        for(let i=0; i<linksTypes.length; i++){
            namesList.push(linksTypes[i].formula)
            massList.push(linksTypes[i].mass)
        }
        this.linkDeltaMassList(namesList, massList, this.cfg.directNetwork.mDaTol)
    }

    propagate_attrib(seedIndex, method, specialParameter){
        switch (method){
            case "BFS":
                return this.propagate_attrib_BFS(seedIndex)
            case "DFS":
                return this.propagate_attrib_DFS(seedIndex)
            case "EEFS":
                return this.propagate_attrib_EEFS(seedIndex)
            case "ENFS":
                return this.propagate_attrib_ENFS(seedIndex, specialParameter)
            default:
                console.warn("no exploration algorithm found, defaulting to BFS")
                return this.propagate_attrib_BFS(seedIndex)
        }
    }

    /** chooses if the network should be directed, directed(reversed) or undirected based on the config */
    getNeighboursDirection(nodeIndex){
        if(attribCfg.main.networkDirection == "direct"){
            let neighbours = this.getNeighbours(nodeIndex)
            neighbours.forEach((edge)=>{edge.type = "source"})
            return neighbours
        }else if(attribCfg.main.networkDirection == "reverse"){
            let neighbours = this.getNeighbours_reverse(nodeIndex)
            neighbours.forEach((edge)=>{edge.type = "target"})
            return neighbours
        }else{
            return this.getNeighbours_bothSides(nodeIndex)
        }
    }

    /** same role as getNeighboursDirection but for EEFS and ENFS algorithms */
    checkNeighboursDirection(link){
        if(attribCfg.main.networkDirection == "direct"){
            if (!this.visited.has(link.target)) {
                return true
            }
        }else if(attribCfg.main.networkDirection == "reverse"){
            if (!this.visited.has(link.source)) {
                return true
            }
        }else{
            if (!this.visited.has(link.target) || !this.visited.has(link.source)) {
                return true
            }
        }
        return false
    }

    propagate_attrib_BFS(seedIndex){
        let seed = this.nodes[seedIndex]
        if(!seed || !seed.attrib){return console.error("error! seed wasn't attributed, seed index:"+seedIndex)}    
        seed.attrib.distanceSeed = 0
        this.attributedIndex +=1
        seed.attrib.attributedIndex = this.attributedIndex

        const queue = [seedIndex];
        let attributed = []
        while (queue.length > 0) {
            this.debugQueue.push(queue.length) //logs queue length
            const currentNode = queue.shift(); // Dequeue
            if (this.visited.has(currentNode)) continue; // Skip already visited nodes
            for (const link of this.getNeighboursDirection(currentNode)) {
                let child = {}
                if (!this.nodes[link.neighbour].attrib) {
                    child = this.attributeByLink(currentNode, link, (link.type == "target"))
                }
                if (child.attrib) {
                    this.visited.add(currentNode);
                    attributed.push(child)
                    queue.push(link.neighbour);
                }
            }
        }
        return attributed
    }

    propagate_attrib_DFS(seedIndex){
        let seed = this.nodes[seedIndex]
        if(!seed || !seed.attrib){return console.error("error! seed wasn't attributed, seed index:"+seedIndex)}    
        seed.attrib.distanceSeed = 0
        this.attributedIndex +=1
        seed.attrib.attributedIndex = this.attributedIndex

        const queue = [seedIndex];
        let attributed = []

        // Recursive DFS function
        const dfs = (parentId) => {
            if (this.visited.has(parentId)) return; // Avoid self-cycles
            // Recur for neighbors
            for (const link of this.getNeighboursDirection(parentId)) {
                if (!this.nodes[link.neighbour].attrib) {
                    let child = this.attributeByLink(parentId, link , (link.type == "target"))
                    if(child.attrib){
                        this.visited.add(parentId);
                        attributed.push(child)
                        dfs(link.neighbour)
                    }
                }
            }
        };
        //starts at the seed
        dfs(seedIndex);
        return attributed
    }

    /** propagate by Edge Error First */
    propagate_attrib_EEFS(seedIndex){
        let seed = this.nodes[seedIndex]
        if(!seed || !seed.attrib){return console.error("error! seed wasn't attributed, seed index:"+parentIndex)}    
        seed.attrib.distanceSeed = 0
        this.attributedIndex +=1
        seed.attrib.attributedIndex = this.attributedIndex
        let linksSeed = this.getEdgesByInvolvedNode(seedIndex)
        let queue = linksSeed;
        queue.sort((a,b)=>a.error-b.error)
        let attributed = []
        while (queue.length > 0) {
            queue.sort((a,b)=>Math.abs(a.error)-Math.abs(b.error))
            this.debugQueue.push(queue.length) //logs queue length
            const currentLink = queue.shift(); // Dequeue
            // /// log queue and choice
            // let queueArray = []
            // for(let i=0; i<queue.length; i++){
            //     queueArray.push(queue[i].error)
            // }
            // console.log(currentLink.error, queueArray)
            // ///
            const targetAttributed = this.nodes[currentLink.target].attrib
            const sourceAttributed = this.nodes[currentLink.source].attrib
            // if targetVisited is true but not sourceVisited, link is reversed
            if (targetAttributed && sourceAttributed){continue;} // Skip already visited nodes
            let parentNode = currentLink.source
            //if the target is already attributed but not the source, we have a reverse link, and must flip everything
            if(targetAttributed){parentNode = currentLink.target}
            let child = this.attributeByLink(parentNode, currentLink, targetAttributed)
            if (child.attrib) {
                //pushes the new attribution and based on wether it was the source or the target, searches the new network
                attributed.push(child)
                let newNode = -1
                if(targetAttributed){
                    this.visited.add(currentLink.source)
                    newNode = currentLink.source
                }else{
                    this.visited.add(currentLink.target)
                    newNode = currentLink.target
                };
                //if attributed, pushes all links of this newly attributed to the queue
                for(const link of this.getEdgesByInvolvedNode(newNode)){
                    //checks if the neighbour (source or target, based on the direction of the network) has already been visited
                    //if not, adds it to the queue
                    if (this.checkNeighboursDirection(link)) {
                        queue.push(link)
                    }
                }
            }
        }
        return attributed
    }

    /** propagate by Edge Name First, the order is the one from linksNamelist */
    propagate_attrib_ENFS(seedIndex, linksNamelist){
        // Create a priority map for fast lookup
        const priorityMap = new Map(
            linksNamelist.map((item, index) => [item.formula, index])
        );
        // Sorting function: compares edges based on their name's priority
        function edgeSort(array){array.sort((a, b) => {
                const priorityA = priorityMap.has(a.name) ? priorityMap.get(a.name) : Infinity;
                const priorityB = priorityMap.has(b.name) ? priorityMap.get(b.name) : Infinity;
                return priorityA - priorityB; // Lower index means higher priority
            });
            return array
        }

        let seed = this.nodes[seedIndex]
        if(!seed || !seed.attrib){return console.error("error! seed wasn't attributed, seed index:"+parentIndex)}    
        seed.attrib.distanceSeed = 0
        this.attributedIndex +=1
        seed.attrib.attributedIndex = this.attributedIndex
        let linksSeed =  this.getEdgesByInvolvedNode(seedIndex)
        let queue = linksSeed;
        edgeSort(queue)
        let attributed = []
        const visited = new Set();
        while (queue.length > 0) {
            edgeSort(queue)
            this.debugQueue.push(queue.length) //logs queue length
            const currentLink = queue.shift(); // Dequeue
            const targetAttributed = this.nodes[currentLink.target].attrib
            const sourceAttributed = this.nodes[currentLink.source].attrib
            // if targetVisited is true but not sourceVisited, link is reversed
            if (targetAttributed && sourceAttributed){continue;} // Skip already visited nodes
            let parentNode = currentLink.source
            //if the target is already attributed but not the source, we have a reverse link, and must flip everything
            if(targetAttributed){parentNode = currentLink.target}
            let child = this.attributeByLink(parentNode, currentLink, targetAttributed)
            if (child.attrib) {
                //pushes the new attribution and based on wether it was the source or the target, searches the new network
                attributed.push(child)
                let newNode = -1
                if(targetAttributed){
                    this.visited.add(currentLink.source)
                    newNode = currentLink.source
                }else{
                    this.visited.add(currentLink.target)
                    newNode = currentLink.target
                };
                //if attributed, pushes all links of this newly attributed to the queue
                for(const link of this.getEdgesByInvolvedNode(newNode)){
                    if (this.checkNeighboursDirection(link)) {
                        //checks if the neighbour (source or target, based on the direction of the network) has already been visited
                        //if not, adds it to the queue
                        queue.push(link)
                    }
                }
            }
        }
        return attributed
    }

    /**from a parent node index, propagates an attribution. Reverse is when the link leads to the already attributed peak, so the formula has to be substracted*/
    attributeByLink(parentIndex, link, reverse){
        let parent = this.nodes[parentIndex]
        if(!parent || !parent.attrib){return console.error("error! parent wasn't attributed, parent index:"+parentIndex)}
        //"neighbour" is used by BFS and DFS, target/source is used by EEFS and ENFS
        let childIndex = link.neighbour || link.target
        if(reverse){childIndex = link.neighbour || link.source}
        let child = this.nodes[childIndex]
        if(child.attrib){console.warn("already attributed");return {}} //here skips if the peak was already attributed
        let newMol = new Molecule(parent.attrib.name, parent.attrib.formalName)
        if(!link.name){return {}}
        if(reverse){
            newMol.removeFormula(link.name)
        }else{
            newMol.addFormula(link.name)
        }
        
        //checks for ppm error
        const ppm = 1e6*(newMol.mass - child[config.mz])/child[config.mz]
        const ppmTol = attrib.returnErrorTolerance("network",child[config.mz]) //TODO: make this NOT dependent on attrib, but on the relative AttribInstance class it originates from
        if(Math.abs(ppm)<ppmTol){
            //seeks the golden rules in place: default one or relative to current pass
            let specialGoldenRules = attribPasses.specialGoldenRules[this.currentPassIndex]
            if(!specialGoldenRules || (specialGoldenRules && !specialGoldenRules.override)){
                specialGoldenRules = this.cfg.goldenRules
            }
            //tests golden rules
            const goldenRules = checkGoldenRules(newMol, specialGoldenRules)
            if(!goldenRules){return {}}
            child.attrib = new Attribution(newMol.name, newMol.formalName, child, ppm)
            child.attrib.ionType = newMol.ionType
            child.attrib.type = "network"
            child.attrib.sourceIndex = parentIndex
            child.attrib.sourceLink = link.name
            child.attrib.distanceSeed = parent.attrib.distanceSeed + 1 
            child.attrib.passNumber = parent.attrib.passNumber || 0
            this.attributedIndex +=1
            child.attrib.attributedIndex = this.attributedIndex
            if(this.edges[link.edgeIndex]){
                this.edges[link.edgeIndex].visited = true
            }
            return child
        }else{}
        return {}
    }

    //checks every edge for an error (if source+link = edge)
    verifyAllEdges(){
        const edgesLost = [] //edges with no source and no target
        const edgesNoSource = [] //edges with no source
        const edgesNoTarget = [] //edges with no target
        const edgesWrong = [] //edges that are not coherent with the attributed formulae
        for(const edgeID in this.edges){
            const edge = this.edges[edgeID]
            if(!this.nodes[edge.source] || !this.nodes[edge.target]){continue}
            if(!this.nodes[edge.source].attrib && !this.nodes[edge.target].attrib){
                edge.category = "noConnexion"
                edgesLost.push(edge);
                continue
            }
            if(!this.nodes[edge.source].attrib){
                edge.category = "noSource"
                edgesNoSource.push(edge);
                continue
            }
            if(!this.nodes[edge.target].attrib){
                edge.category = "noTarget"
                edgesNoTarget.push(edge);
                continue
            }
            if(!edge.name || edge.name == ""){continue;}
            let sourceNode = this.nodes[edge.source]
            let targetNode = this.nodes[edge.target]
            //makes a copy of source molecule
            let sourceMol = new Attribution(sourceNode.attrib.name, sourceNode.attrib.formalName, sourceNode, sourceNode.attrib.ppmError )
            let targetMol = targetNode.attrib
            sourceMol.addFormula(edge.name)
            if(!sourceMol.compare(targetMol,false, false)){
                console.warn("incoherent edge",edge, sourceNode, targetNode)
                edge.suspect = true
                edge.category = "Suspect"
                edgesWrong.push(edge);
            }else{edge.category = "Valid"}
        }
        if(debug){console.log([edgesLost, edgesNoSource, edgesNoTarget, edgesWrong])}
        return [edgesLost, edgesNoSource, edgesNoTarget, edgesWrong]
    }

    /**verifies the validity of one edge */
    verifyOneEdge(edgeIndex){
        const edge = this.edges[edgeIndex]
        if(!this.nodes[edge.source] || !this.nodes[edge.target]){return "noNode"}
        if(!this.nodes[edge.source].attrib && !this.nodes[edge.target].attrib){
            edge.category = "noConnexion"
            edgesLost.push(edge);
            return edge
        }
        if(!this.nodes[edge.source].attrib){
            edge.category = "noSource"
            edgesNoSource.push(edge);
            return edge
        }
        if(!this.nodes[edge.target].attrib){
            edge.category = "noTarget"
            edgesNoTarget.push(edge);
            return edge
        }
        if(!edge.name || edge.name == ""){return "noName";}
        let sourceNode = this.nodes[edge.source]
        let targetNode = this.nodes[edge.target]
        //makes a copy of source molecule
        let sourceMol = new Attribution(sourceNode.attrib.name, sourceNode.attrib.formalName, sourceNode, sourceNode.attrib.ppmError )
        let targetMol = targetNode.attrib
        sourceMol.addFormula(edge.name)
        if(!sourceMol.compare(targetMol,false, false)){
            console.warn("incoherent edge",edge, sourceNode, targetNode)
            edge.suspect = true
            edge.category = "Suspect"
            edgesWrong.push(edge);
        }else{edge.category = "Valid"}
        return edge
    }
    
    //inspects an array of suspect nodes and sees which formula is the most likely
    inspectSuspectNodes(nodesList){
        for(let i=0; i<nodesList.length; i++){
            this.inspectSuspectNode(nodesList[i])
        }
    }
    
    inspectSuspectNode(nodeIndex){
        const node = this.nodes[nodeIndex]
        if(!node.attrib){return;}
        const edgesSource = this.getNeighbours(nodeIndex)
        const edgesTarget = this.getNeighbours_reverse(nodeIndex)
        const formula = node.attrib
        let formulaIsValid = 0
        let formulaAlt = []
        if(!formula || !formula.name){return;}
        for(let i=0; i<edgesSource.length; i++){
            let neighbour = this.nodes[edgesSource[i].neighbour]
            if(!neighbour || !neighbour.attrib || !edgesSource[i].name){continue;}
            if(!formula.name || !neighbour.attrib){continue;}
            //makes a copy of neighbour molecule
            let molecule = neighbour.attrib.returnDuplicate()
            molecule.removeFormula(edgesSource[i].name)
            if(molecule.name == formula.name){formulaIsValid += 1}
            else{
                let isFound = false
                for(let j=0; j<formulaAlt.length; j++){
                    if(molecule.name == formulaAlt[j].name){
                        formulaAlt[j].count +=1
                        isFound = true
                        continue;
                    }
                }
                if(!isFound){
                    formulaAlt.push({name:molecule.name, count:1})
                }
            }
        }
        for(let i=0; i<edgesTarget.length; i++){
            let neighbour = this.nodes[edgesTarget[i].neighbour]
            if(!neighbour || !neighbour.attrib || !edgesTarget[i].name){continue;}
            if(!formula.name || !neighbour.attrib){continue;}
            //makes a copy of current molecule
            let molecule = neighbour.attrib.returnDuplicate()
            molecule.addFormula(edgesTarget[i].name)
            if(molecule.name == formula.name){formulaIsValid += 1}
            else{
                let isFound = false
                for(let j=0; j<formulaAlt.length; j++){
                    if(molecule.name == formulaAlt[j].name){
                        formulaAlt[j].count +=1
                        isFound = true
                        continue;
                    }
                }
                if(!isFound){
                    formulaAlt.push({name:molecule.name, count:1})
                }
            }
        }
        if(formula.error){console.error("already inspected")}
        else{
            let totalneighbours = edgesSource.length  + edgesTarget.length
            formula.error = {coherentNeighbours: formulaIsValid, alternatives:formulaAlt, totalNeighbours: totalneighbours}
        }
    }
}

/**handles a netwok of m/z deltas */
class NetworkDeltas extends NetworkAttrib{
    constructor(cfg) {
        super()
        this.cfg = cfg
    }

    /** builds an array of all deltas between peaks in the dataset */
    build_deltaMatrix(attribute, forceBounds){
        const start= Date.now()
        //initialization
        let bounds = forceBounds || this.cfg.delta.bounds
        let data = this.nodes
        data.sort(function(a, b){return a[config.mz]-b[config.mz]})
        var diagMatrix = []
        var array = []
        var col = config.mz
        //computing
        for(let i=1; i<data.length; i++){ //not i=0 because of title line
            diagMatrix[i] = []
            let startIndex = i+1 // no j=i  beacause the main diagonal will only be 0s
            let startValue = Math.floor(parseInt(data[i])+parseInt(bounds[0])) || 0
            startIndex = Math.max(startIndex, this.indexMasses[startValue])
            for(let j=startIndex; j<data.length; j++){ 
                var delta = data[j][col] - data[i][col]
                if(delta <= bounds[1] && delta >= bounds[0]){
                    diagMatrix[i][j] = delta
                    var item = {"value":delta, "source":i,"target":j}
                    array.push(item)
                }else if(delta > bounds[1]){
                    break;
                }
            }
        }
        array.sort(function(a, b){return a.value-b.value})
        this.edges = array
        const end= Date.now()
        if(debug){console.log("buildDeltaMatrix(ms):"+(end-start))}
        if(attribute){
            let groups = this.fuseEdgesByMass()
            groups = this.cleanUnGroupedEdges(groups)
            this.attributeGroupsByDB(groups)
            this.attributeGroups(groups)
        }
        return array
    }
    /**fuses a big number of edges by their similarity in value */
    fuseEdgesByMass(forceTolerance){
        const start= Date.now()
        let tolerance = forceTolerance || this.cfg.ppm.delta 
        let edgesGroup = []
        for(let i=0; i<this.edges.length; i++){
            //looks if it matches to the last group
            //only the last is checked because edges are sorted by increasing mass
            if(edgesGroup.length>0){
                let lastGroup = edgesGroup[edgesGroup.length-1]
                let delta = lastGroup.value - this.edges[i].value
                if(Math.abs(delta)*1000<tolerance){
                    //match this group
                    lastGroup.value = (lastGroup.value*lastGroup.length + this.edges[i].value)/(lastGroup.length+1)
                    this.edges[i].group = edgesGroup.length-1
                    lastGroup.push(this.edges[i])
                    continue;
                }
            }
            //if we arrive here, no edge group has been found, so create a new one
            let group = []
            group.push(this.edges[i])
            group.value = this.edges[i].value
            this.edges[i].group = edgesGroup.length
            edgesGroup.push(group)
        }
        edgesGroup.sort((a,b)=>b.length-a.length)
        const end= Date.now()
        if(debug){console.log("fuseEdgesByMass(ms):"+(end-start))}
        return edgesGroup
    }

    //removes all edges that are not in one of the first forceKeep groups (or cfg.)
    cleanUnGroupedEdges(groups, forceKeep){
        const start= Date.now()
        let keep = forceKeep || this.cfg.delta.toKeep
        let keptGroups = []
        let groupsIndexes = new Set()
        let newEdgesList = []
        for(let i=0; i<keep;i++){
            keptGroups.push(groups[i])
            //add the previous index of the group to the indexes to keep
            groupsIndexes.add(groups[i][0].group)
            newEdgesList = newEdgesList.concat(groups[i])
        }
        this.edges = newEdgesList
        this.updateAdjacencyList()
        //remove all edges that are not in the groups of the ones to keep
        const end= Date.now()
        if(debug){console.log("cleanUngroupedEdges(ms):"+(end-start))}
        return keptGroups
    }

    /**attribute groups of edges by DB lookup */
    attributeGroupsByDB(groups){
        let database = this.cfg.delta.keepList
        for(let i=0; i<groups.length; i++){
            const mass = groups[i].value
            let candidates = []
            for(let j=0; j<database.length; j++){
                const delta = mass - database[j].mass
                if(Math.abs(delta)*1000<this.cfg.ppm.deltaAttrib){
                    candidates.push({formula:database[j].formula, error:delta})
                }
            }
            if(candidates.length >0){
                //searches the best fit in the candidates by lowest ppm error
                candidates.sort((a,b)=>Math.abs(a.error)-Math.abs(b.error))
                //attributes the lowest error
                const bestCandidate = candidates[0]
                groups[i].attrib = new Attribution(bestCandidate.formula,"",groups[i], bestCandidate.error)
            }
        }
    }

    /**attribute groups of edges by pass construction */
    attributeGroups(groups){
        //method is similar to class AttribInstance.matchPeakToPass
        let pass = new AttributionPass(attribPasses.delta, -1, this.cfg)
        pass.checkGoldenRules = false;
        pass.prepareCombinations()
        for(let i=0; i<groups.length; i++){
            if(groups[i].attrib){continue;}
            let mass = groups[i].value
            let floorMass = Math.floor(mass)
            let decimal = mass - floorMass
            let passAttribs = []
            passAttribs = passAttribs.concat(pass.molecules[floorMass])
            //accounts for border effects
            if(decimal >1-this.cfg.ppm.daFilter){passAttribs =  passAttribs.concat(pass.molecules[floorMass+1])}
            else if(decimal<this.cfg.ppm.daFilter){passAttribs = passAttribs.concat(pass.molecules[floorMass-1])}
            let candidates = [] //candidates to best fit
            for(let i=0; i<passAttribs.length; i++){
                if(!passAttribs[i]){continue;}
                const passMass = passAttribs[i].mass
                const delta = mass - passMass
                //no need to check for golden rules because the pass should have been proofed already
                if(Math.abs(delta)*1000<this.cfg.ppm.deltaAttrib){
                    candidates.push({index:i, error:delta})
                }
            }
            if(candidates.length >0){
            //searches the best fit in the candidates by lowest ppm error
            candidates.sort((a,b)=>Math.abs(a.error)-Math.abs(b.error))
            //attributes the lowest error
            const bestCandidate = candidates[0]
            const bestCandidateMolecule = passAttribs[bestCandidate.index]
            bestCandidateMolecule.stringify()
            groups[i].attrib = new Attribution(bestCandidateMolecule.name,"",groups[i], bestCandidate.error)
            groups[i].attrib.name = groups[i].attrib.stringify()
            }
        }
        //in each group, gives the name of the link type to the whole group
        let edgesTypes = []
        for(let i=0; i<groups.length; i++){
            if(!groups[i].attrib){
                edgesTypes.push({formula: "notAttributed",edgeIndex:i, mass:"",massExp:groups[i].value, errormDa:""})
                for(let j=0; j<groups[i].length; j++){
                    groups[i][j].edgeNotAttributedIndex = i
                }
                continue;
            }
            for(let j=0; j<groups[i].length; j++){
                groups[i][j].name = groups[i].attrib.name
                groups[i][j].error = 1000*parseFloat(groups[i][j].value - groups[i].attrib.mass)
            }
            let error = 1000*(groups[i].value - groups[i].attrib.mass)
            edgesTypes.push({formula: groups[i].attrib.name, mass: groups[i].attrib.mass,massExp:groups[i].value, errormDa:error})
        }
        this.edgesTypes = edgesTypes
        return groups
    }
    

    /** returns the edges as a 2D array */
    exportEdges2D(){
        let data = []
        data.push(["value","source","target"])
        this.edges.forEach(edge =>{
            data.push([edge.value, edge.source, edge.target])
        })
        return data
    }

    /**TODO: verify but should be useless because a canvas could do it */
    makeBins(resolution, forceBounds){
        let bounds =  forceBounds || this.cfg.delta.bounds
        //prepares the array
        let bins = []
        let step = (bounds[1] - bounds[0])/resolution
        for(let i=0; i<resolution; i++){
            let bin = []
            bin.x0 = bounds[0]+i*step
            bin.x1 = bounds[1]+(i+1)*step
            bins.push(bin)
        }
        this.edges.forEach(edge =>{
            let value = edge.value;

            // Check if the value falls within the bounds
            if (value < bounds[0] || value > bounds[1]) return;

            // Determine the bin index
            let binIndex = Math.floor((value - bounds[0]) / step);
            if (binIndex >= resolution) binIndex = resolution - 1;
            bins[binIndex].push(edge);
        })

    }

}


let attrib = new AttribInstance()

//see if it is useful to replace attribCfg later on or not 

// /**a class containing all the data needed for an attribInstance. */
// class ConfigAttrib{
//     constructor(parent,){
//         this.parent = parent
//         this.prepareGoldenRules(copy.goldenRules)
//     }

//     prepareGoldenRules(copy){
//         let goldenRules = {}
//         goldenRules.useDBE = copy.useDBE ||true
//         goldenRules.useHCratio = copy.useHCratio || true
//         goldenRules.useHeteroRatio = copy.useHeteroRatio || true
//         goldenRules.useKMD = copy.useKMD || false 

//         this.goldenRules = goldenRules

//     }

// }


// /** an attribution pass is an editable list of elements for attribution purposes */
// class AttribPass{
//     constructor(){

//     }
// }