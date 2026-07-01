/** a script to handle molecular formulae and some additional computation about molecules */

class ChemFormula {
    constructor(name){
        this.name = name
        //constructs empty formulas.Important when needing an empty class for copy
        if(name=="empty"){return;}
        this.formula = this.buildFromName(name)
        this.calculateMass()
    }

    /**parse the name into intelligible elements list */
    buildFromName(name){
        if(!name || name == ""){return}
        return parseChemicalFormula(name)
    }

    /**returns an independent copy of this chemFormula */
    returnDuplicate(){
        let copy = new ChemFormula("empty")
        if (this.name == "empty"){return copy}
        copy.name = this.name
        copy.mass = this.mass
        copy.formula = []
        for(let i=0; i<this.formula.length; i++){
            let el = {name: this.formula[i].name, number:this.formula[i].number}
            copy.formula.push(el)
        }
        return copy
    }

    /** sorts the formula in the natural order where it should be written */
    sortFormula(){
        let naturalOrderElements = ["C","H","O","N","S"]
        this.formula.sort((a, b) => {
            if (a.name === "e") return 1; //electron goes at the end
            if (b.name === "e") return -1; //electron goes at the end
            const indexA = naturalOrderElements.indexOf(a.name);
            const indexB = naturalOrderElements.indexOf(b.name);
            if (indexA === -1 && indexB === -1) {return a.name.localeCompare(b.name);}    
            if (indexA === -1) return 1; // Move elements not in predefined order to the end
            if (indexB === -1) return -1; // Move elements not in predefined order to the end
            return indexA - indexB;
        })
    }

    /**calculates the mass of a given chemical formula */
    calculateMass(overrideFormula){
        if(typeof overrideFormula == "string"){
            overrideFormula = parseChemicalFormula(overrideFormula)
        }
        let formula = overrideFormula || this.formula
        let mass = 0
        if (!formula || formula.length == 0){return mass}
         //for each element in the formula, adds to the mass
        for(let i=0; i<formula.length; i++){
            //looks for the element in the database of elements
            var elementMass = 0;
            for(let j=0; j<elementsDatabase.length; j++){
                if(formula[i].name == elementsDatabase[j].name){
                    elementMass = formula[i].number*elementsDatabase[j].mass
                }
            }
            if(elementMass == 0 && formula[i].number>0){
                console.error("one of the elements of the formula was not found. Aborting calculus, consider adding this element to the database in config.js",formula)
                return 0;
            }else{
                mass += elementMass
            }
        }
        this.mass = mass
        return mass
    }

    //lookup an element in the formula and return it's number in the formula
    lookup(elName){
        let elNumber = 0
        if(!this.formula){return "error"}
        let elFound = this.formula.find(item => item.name == elName)
        if(elFound){elNumber = elFound.number}
        return elNumber
    }

    //checks if the formula is empty
    isEmpty(){
        if(!this.formula || this.formula.length ==0){return true;}
        for(let i=0; i<this.formula.length; i++){
            if(this.formula[i].number !=0){return false;}
        }
        return true;
    }

    //lookup an element list in the formula and return the sum of all
    lookupListSum(namesList){
        if(!this.formula || !namesList){return "error"}
        let numberList = []
        for(let i=0; i<namesList.length; i++){
            numberList[i] = this.lookup(namesList[i])
        }
        let total = numberList.reduce((sum, value) => sum + value, 0)
        return total
    }

    //adds an array of elements to the formula
    addFormula(formula){
        if(!formula){return false;}
        if(!this.formula){return false;}
        if(formula.formula){formula = formula.formula}
        if(typeof formula == "string"){
            formula = parseChemicalFormula(formula)
        }
        let merged = [...this.formula, ...formula];
        this.formula = Object.values(
            merged.reduce((acc, obj) => {
                if (!acc[obj.name]) {
                    acc[obj.name] = { ...obj };
                } else {
                    acc[obj.name].number += obj.number;
                }
                return acc;
            }, {})
        );
        this.calculateMass()
        this.name = this.stringify()
        return this.formula
    }

    //removes an array of elements to the formula
    removeFormula(formula){
        if(!formula){return false;}
        if(formula.formula){formula = formula.formula}
        if(typeof formula == "string"){
            formula = parseChemicalFormula(formula)
        }
        //inverts every element number
        let invertFormula = []
        for(let i=0; i<formula.length; i++){
            invertFormula[i] = {"name":formula[i].name,"number":-formula[i].number}
        }
        this.addFormula(invertFormula)
    }

    //return the formula as a string
    stringify(){
        this.sortFormula()
        let text = ""
        let charge = ""
        let formula = this.formula
        for(let i=0; i<formula.length; i++){
            let name = formula[i].name
            if(formula[i].number >0){
                if(name =="e" && formula[i].number==1){charge = "-"}
                else if(name =="e" && formula[i].number>1){charge = "-".repeat(formula[i].number)}
                else if(formula[i].number == 1){text += name}
                else{text += name + formula[i].number}
            }else if(formula[i].number<0){
                if(name =="e"){
                    if(formula[i].number == -1){charge = "+"}
                    else{charge = "+".repeat(-formula[i].number)}
                }else{text += name + formula[i].number}
            }
            text += charge //charge goes at the end
        }
        this.name = text
        return text
    }

    /**compares to another formula and returns if they are identical */
    compare(formula, ignoreNumbers, ignoreElectrons){
        if(!formula){return false}
        if(formula.formula){formula = formula.formula}
        if(typeof formula == "string"){
            formula = parseChemicalFormula(formula)
        }
        if(!ignoreElectrons && (formula.length != this.formula.length)){return false;}
        if(ignoreElectrons && (Math.abs(formula.length - this.formula.length)>1)){return false;}
        //sort arrays
        let sortedF1 = [...formula].sort((a, b) => a.name.localeCompare(b.name));
        let sortedF2 = [...this.formula].sort((a, b) => a.name.localeCompare(b.name));
        if(ignoreElectrons){
            sortedF1 = sortedF1.filter(el => el.name != "e")
            sortedF2 = sortedF2.filter(el => el.name != "e")
        }
        //compares them
        for(let i=0; i<sortedF1.length; i++){
            if(sortedF1[i].name != sortedF2[i].name){return false;}
            if(ignoreNumbers){continue;}
            if(sortedF1[i].number != sortedF2[i].number){return false;}
        }
        return true
    }

    /**checks if this formula at least contains another formula */
    includes(formula){
        if(!formula){return false}
        if(formula.formula){formula = formula.formula}
        if(typeof formula == "string"){
            formula = parseChemicalFormula(formula)
        }
        //sort arrays
        let sortedF1 = [...formula].sort((a, b) => a.name.localeCompare(b.name));
        //compares them
        for(let i=0; i<sortedF1.length; i++){
            if(this.lookup(sortedF1[i].name) < sortedF1[i].number){return false;}
        }
        return true
    }

    /**returns a list of elements present in the formula? OnlyPositive return only elements present in >0 quantity, ignore electron ignores "e" */
    giveElementsList(onlyPositive, ignoreElectrons){
        let formula = this.formula
        let list = []
        for(let i=0; i<formula.length; i++){
            if(onlyPositive && formula[i].number <= 0){continue}
            if(ignoreElectrons && formula[i].name == "e"){continue}
            list.push(formula[i].name)
        }
        return list
    }

    /**check if any element has a negative value */
    isThereNegativeValue(ignoreElectrons){
        let formula = this.formula
        for(let i=0; i<formula.length; i++){
            if(ignoreElectrons && formula[i].name == "e"){continue}
            if(formula[i].number <0){return true}
        }
        return false
    }
}

/** a molecule is a chemical formula with more advanced data about it and computations possible. It has a charge, a DBE...*/
class Molecule extends ChemFormula{
    constructor(name, formalName){
        super(name)
        if(name == "empty"){return}
        if(formalName){this.formalName == formalName}
        else{this.formalName = ""}
        this.computeDBE()
        this.calculateMz()
    }
    /**returns a copy of this molecule */
    returnDuplicate(){
        let copy = new Molecule("empty")
        copy.name = this.name
        copy.mass = this.mass
        copy.mz = this.mz
        copy.formula = []
        for(let i=0; i<this.formula.length; i++){
            let el = {name: this.formula[i].name, number:this.formula[i].number}
            copy.formula.push(el)
        }
        copy.formalName = this.formalName
        copy.dbe = this.dbe
        return copy
    }

    /** computes the DBE of this molecule */
    computeDBE(){
        const numberC = this.lookup("C")
        const numberH = this.lookupListSum(["H","D"])
        const numberN =  this.lookup("N")
        const numberP =  this.lookup("P")
        const numberSi = this.lookup("Si")
        const numberX =  this.lookupListSum(["F","Cl","Br","I","Na","Li","K"])
        this.dbe = (2*numberC+2*numberSi+2+numberN+numberP-numberH-numberX)/2
        return this.dbe
    }

    //finds the charge of this molecule
    charge(){
        return -this.lookup("e")
    }

    //calculates the m/z of this molecule. Electron mass is already considered in this.mass
    calculateMz(){
        let charge = this.charge()
        if(charge == 0){return this.mass;}
        let mz = (this.mass)/Math.abs(charge)
        this.mz = mz
        return mz
    }
    

}


let naturalOrderElements = ["C","H","O","N","S"]

function buildElementsList(molecules){
    let foundElements= [];
    for(let i=1; i<molecules.length; i++){
        let molecule = molecules[i]
        if(!molecule){continue;}
        if(molecule.length && molecule.length>0){
            molecule = molecule[config.formulatext]
            molecule = new Molecule(molecule)
        }
        if(!molecule.name || molecule.name == ""){continue;}
        if(!molecule.giveElementsList){continue;}
        //looks if there are new elements in this formula
        let elements = molecule.giveElementsList()
        for(let j=0; j<elements.length; j++){
            let index = foundElements.indexOf(elements[j])
            if(index == -1){foundElements.push(elements[j])}
        }
    }
    //reorders the foundElements line if it finds CHON, and then all other elements in a alphabetical way
    foundElements.sort()
    var conventionalOrder = ["C","H","O","N","S"]
    var count=0;
    for(let i=0; i<conventionalOrder.length; i++){
        for(let j=0; j<foundElements.length; j++){
            if(foundElements[j] == conventionalOrder[i]){
                swapElement(foundElements, count, j)
                count += 1
            }
        }
    } 
    return foundElements
}


/////////////////////////
////////////////////////////

/**
 * a function that inputs a string formula and outputs an array of the elements and their number classed
 * @param {*} formula a string formula like "C6H12O6"
 * @returns returns an array. Each line has a name(name of the element) and a number (number for this element in the ion/molecule)
 */
function parseChemicalFormula(formula){ 
 var parsedFormula = formula.match(/[0-9]+|[x]+|[abcdefghijklmnopqrstuvwyzABCDEFGHIJKLMNOPQRSTUVWYXZµ]+|[+()-]+/g)
 var outputFormula = [];
 if(!parsedFormula){return []}
 //this first loop cuts letter names in multiple names, for exemple cuts CH into C and H but keeps Na intact
 for(let i=parsedFormula.length-1; i>-1; i--){
    //checks if this element is composed of text. Invalid if it is a number
    if(/^[a-zA-Zµ]+$/.test(parsedFormula[i])){
        var elName = parsedFormula[i]
        if (elName.length >1){
            let lowercaseNo = 0 //number of caracters that are lowercase. To not multiply the count of elements with j
                for(let j=0; j<elName.length; j++){
                    if(isLowerCase(elName[j])){lowercaseNo+= 1; continue;}//if it is lowercase, not an element alone.
                    if(isLowerCase(elName[j+1])){
                        parsedFormula.splice(i+1+j-lowercaseNo,0,elName[j]+elName[j+1])
                    }else{
                        parsedFormula.splice(i+1+j-lowercaseNo,0,elName[j])
                    }
                }
                parsedFormula.splice(i,1)
            }
    }
 }
 for(let i=0; i<parsedFormula.length; i++){
    //checks if this element is composed of text. Invalid if it is a number
    if(/^[a-zA-Z]+$/.test(parsedFormula[i])  && parsedFormula[i] !="x"){

        var elName = parsedFormula[i]
        //checks if there is a number corresponding to this element after. If not, returns for this elements
        var elNumber = 1;
        if (/^[0-9]+$/.test(parsedFormula[i+1])){
            elNumber = parseInt(parsedFormula[i+1])
        }
        //checks if there is a minus after, then adds the element as a negative number
        if (/^[-]+$/.test(parsedFormula[i+1])&& /^[0-9]+$/.test(parsedFormula[i+2])){
            elNumber = -parseInt(parsedFormula[i+2])
        }
        //checks if this element has already been added
        let alreadyExists =false;
        for(let j=0; j<outputFormula.length; j++){
            if(elName == outputFormula[j].name){
                outputFormula[j].number += elNumber
                alreadyExists = true;
            }
        }
        //if the element has not been already created, creates it
        if(!alreadyExists){outputFormula.push({name:elName, number:elNumber})}

    }
    //checks if this elements contains a plus or a minus, for charge AT THE END
    if(/^[+-]+$/.test(parsedFormula[i]) && i>=parsedFormula.length-1){
        if(parsedFormula[i][0]=="+"){
            outputFormula.push({name:"e", number:-parsedFormula[i].length})
        }else{
            outputFormula.push({name:"e", number:parsedFormula[i].length})
        }

    }
 }
 //sorts the array
 outputFormula.sort((a, b) => {
    const indexA = naturalOrderElements.indexOf(a.name);
    const indexB = naturalOrderElements.indexOf(b.name);
    if (indexA === -1) return 1; // Move elements not in predefined order to the end
    if (indexB === -1) return -1; // Move elements not in predefined order to the end
    return indexA - indexB;
 })


 return outputFormula
}

/*a function to find in a formula a polymer pattern.*/
function segmentPolymer(formula, unitFormula){
    if(typeof formula == "string"){
        formula = new ChemFormula(formula)
    }
    if(typeof unitFormula == "string"){
        unitFormula = new ChemFormula(unitFormula)
    }
    let elementsList = []
    //loops through elements in the repeat unit to catch numbers of each in the formula and in the unit
    for(let i=0; i<unitFormula.formula.length; i++){
        let full = formula.lookup(unitFormula.formula[i].name)
        let unit = unitFormula.formula[i].number
        let ratio = Math.floor(full/unit)
        elementsList[i] = {"full":full, "unit":unit, "ratio":ratio}
    }
    //Finds the smallest ratio, which amounts for the best estimation of number of units
    let unitsNb = elementsList[0].ratio
    for(let i=0; i<elementsList.length; i++){
        if(elementsList[i].ratio <unitsNb){unitsNb = elementsList[i].ratio}
    } 
    //stop here if there is no polymer groups
    if (unitsNb == 0){ return {"endGroups":"", "unitsNb":0}}

    //makes a sum of all the units that have to be added
    let polymerChain = new ChemFormula("")
    polymerChain.formula = []
    for(let i=0; i<unitsNb; i++){
        polymerChain.addFormula(unitFormula)
    }
    //substracts from main formula to find end groups
    let endGroups = new Molecule(formula.name)
    endGroups.removeFormula(polymerChain)

    return {"endGroups":endGroups, "unitsNb":unitsNb}
}

/** a function that segments a copolymer formula into two monomers and end groups */
function segmentCopolymer(formula, monomer1Formula, monomer2Formula, endGroupsList){
    if(typeof formula == "string"){
        formula = new ChemFormula(formula)
    }
    if(typeof monomer1Formula == "string"){
        monomer1Formula = new ChemFormula(monomer1Formula)
    }
    if(typeof monomer2Formula == "string"){
        monomer2Formula = new ChemFormula(monomer2Formula)
    }
    //for each monomer, creates a list of elements to later make equations
    let elements = []
    for(let i=0; i<monomer1Formula.formula.length; i++){
        let element = {name: monomer1Formula.formula[i].name, monomer1Count: monomer1Formula.formula[i].number, monomer2Count:0}
        elements.push(element)
    }
    for(let i=0; i<monomer2Formula.formula.length; i++){
        let index = elements.findIndex(el => el.name == monomer2Formula.formula[i].name)
        if(index == -1){
            let element = {name: monomer2Formula.formula[i].name, monomer1Count: 0, monomer2Count:monomer2Formula.formula[i].number}
            elements.push(element)
        }else{
            elements[index].monomer2Count = monomer2Formula.formula[i].number
        }
    }
    if(!endGroupsList || endGroupsList.length ==0){
        endGroupsList = [{name:"noEndGroup", formula: new ChemFormula("")}]
    }
    //It will be tried with the fist end group, the the second etc, and quits when one works
    for(let e=0; e<endGroupsList.length; e++){
        let testFormula = formula.returnDuplicate()
        //if there is an end group to test, removes it from the formula
        if(e<endGroupsList.length){
            testFormula.removeFormula(endGroupsList[e].formula)
        }
        //builds equations
        let equations = []
        let solutions = []
        let uniqueX = -1
        let uniqueY = -1
        for(let j=0; j<elements.length; j++){
            //break if the elements isn't present in the formula
            let totalCount = testFormula.lookup(elements[j].name)
            if(totalCount == 0){
                equations = []
                break;
            }
            let monomer1Count = elements[j].monomer1Count
            let monomer2Count = elements[j].monomer2Count
            //skip equations where both monomer counts are equal, because they bring no information
            if(monomer1Count == monomer2Count){continue;}
            if(monomer1Count == 0 && totalCount !=0){uniqueY = monomer2Count*totalCount; continue;}
            if(monomer2Count == 0 && totalCount !=0){uniqueX = monomer1Count*totalCount; continue;}
            equations.push({a: monomer1Count, b: monomer2Count, c: totalCount, name: elements[j].name, endGroupIndex: e})
        }
        //solves immediately if there is only one unique solution
        if(uniqueX != -1 && uniqueY != -1){
            let endGroup = endGroupsList[e]
            return {"monomer1Nb":uniqueX, "monomer2Nb":uniqueY, "endGroup":endGroup}
        }
        //solves equations with least squares
        let firstSolve = true;
        for(let i=0; i<equations.length; i++){
            let results = solveLinearEquation(equations[i])
            //adds the end groups in the results
            for(let r=0; r<results.length; r++){
                results[r]["endGroup"] = endGroupsList[e]
            }
            //first time, pushes these solutions
            if(firstSolve){
                solutions = results
                firstSolve = false;
                continue;
            }
            //all successive times, intersects the solutions
            solutions = intersectArrays(solutions, results, "x")
        }
        //for all solutions at this point, checks if removing them results correctly in an empty formula
        var validSolutions = []
        for(let s=0; s<solutions.length; s++){
            let testSolution = solutions[s]
            let testMolecule = formula.returnDuplicate()   
            //removes the monomers according to this solution
            let monomer1Nb = testSolution.x
            let monomer2Nb = testSolution.y
            for(let m1=0; m1<monomer1Nb; m1++){
                testMolecule.removeFormula(monomer1Formula)
            }
            for(let m2=0; m2<monomer2Nb; m2++){
                testMolecule.removeFormula(monomer2Formula)
            }
            //removes the end group if any
            if(testSolution.endGroup && testSolution.endGroup.formula){
                testMolecule.removeFormula(testSolution.endGroup.formula)
            }
            //if the testMolecule is now empty, returns this solution only
            if(testMolecule.isThereNegativeValue(true)){continue;}
            var isEmpty = testMolecule.isEmpty()
            if(isEmpty){
                validSolutions.push(testSolution)
                break;
            }
        }
        solutions = validSolutions
        if(solutions.length ==0){continue;}
        let solution = solutions[0]
        //if solutions aren't integers, continue
        if(!Number.isInteger(solution.x) || !Number.isInteger(solution.y)){continue;}
        //if solution is valid, returns it
        if(solution.x >=0 && solution.y>=0){
            let monomer1Nb = Math.round(solution.x)
            let monomer2Nb = Math.round(solution.y)
            let endGroup = endGroupsList[e]
            return {"monomer1Nb":monomer1Nb, "monomer2Nb":monomer2Nb, "endGroup":endGroup}
        }   
    }
}

/**computes Mn from a list of given peaks with mass and intensity  */
function computePolymerMn(peaksList){
    let totalMass = 0
    let totalIntensity = 0
    for(let i=0; i<peaksList.length; i++){
        totalMass += peaksList[i][config.mz]*peaksList[i][config.intensity]
        totalIntensity += peaksList[i][config.intensity]
    }
    let Mn = totalMass/totalIntensity
    return Mn
}

function computePolymerMnFromHighlightedPeaks(canvas, dataNum){
    let highlightedPeaks = canvas.data[dataNum].dataHighlighted
    let Mn = computePolymerMn(highlightedPeaks)
    return Mn
}

/** returns an intersection of two arrays, testing with a testKey subproperty */
function intersectArrays(arr1, arr2, testKey){
    let intersection = []
    for(let i=0; i<arr1.length; i++){
        for(let j=0; j<arr2.length; j++){
            if(arr1[i][testKey] == arr2[j][testKey]){
                intersection.push(arr1[i])
            }
        }
    }
    return intersection
}
