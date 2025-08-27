
document.getElementById("calculate_pca").addEventListener("click",function(){handlePCA()})

var cvsPCA = {
    "cellPeaks":{},
    "cellLoadings":{},
    "histogram":{},
    "components":[], //will contain for each component column(in the whole matrix), name and percent
    "data":{},
    "componentsCols":[],
    "intensityCols":[]
}

var cfgPCA = {
    "normalize":true,
    "xtype":0,
    "ytype":0,
    "relativeSize":false,
    "dotSize":4,
    "letter":"PCA",
    "main":{},
    "projections":{
        "xtype":0,
        "ytype":1,
        "xmin":-5,
        "xmax":5,
        "ymin":-5,
        "ymax":5,
        "dotSize":2,
        "relativeSize":false
    },
    "loadings":{
        "xtype":0,
        "ytype":1,
        "xmin":-50,
        "xmax":50,
        "ymin":-25,
        "ymax":25,
        "dotSize":4,
        "showLabels":true
    },
    "other":{
        "showHistogramLine":true,
        "showPercents":false,
    }
}

function handlePCA(){
    var fileChoice = html_tabPca.querySelector("select[name='fileSelection']").value || cfgPCA.fileChoice
    cfgPCA.fileChoice = fileChoice
    if(!fileChoice || fileChoice == "none"){return console.warn ("PCA aborted, no file selected")}
    var html_normalize = html_tabPca.querySelector("input[name='normalizeData']")
    cfgPCA.normalize = html_normalize.checked
    if(debug){console.log(cfgPCA.normalize)}
    var data = []
    var cols = []
    var fileNum = -1
    if(fileChoice == "matrix"){ data = matrixData; cols=matrixFilesColumns}
    else if(fileChoice.includes("file")){
        fileNum = fileChoice.slice(5);  
        data = fileData[fileNum]
        //checks if it is a matrix, if not aborts
        if(!fileParameters[fileNum] || !fileParameters[fileNum].matrixMin || !fileParameters[fileNum].matrixMax){
            return alertPopup("The file selected is not a matrix ! Aborting")
        }
        cols = [parseInt(fileParameters[fileNum].matrixMin), parseInt(fileParameters[fileNum].matrixMax)+1] //+1 because it should be [[ type of interval
        
    }
    data = doPCA(data, cols)
    if(fileNum>=0){  fileLogs[fileNum] += "PCA made on this matrix. Added columns for Components <br>"}
    if(fileChoice == "matrix"){matrixData = data}
    else{ 
        let fileNum = fileChoice.slice(5);
        fileData[fileNum] = data;
        fileParameters[fileNum].variablesPca = cvsPCA.loadings
    }
    columnNames = data[0]
    indexFiles();
    setPCATableValues()
    //handles the canvas
    cvsPCA.intensityCols = cols
    drawPCACanvas(data, cols)
}



function doPCA(originalMatrix, cols){
    //duplicate the matrix to make modifications on it
    var matrix =duplicate2DArray(originalMatrix)

    //checks that the intensities are numbers
    for(let i=1; i<matrix.length; i++){
        for(let j=cols[0]; j<cols[1]; j++){
            matrix[i][j] = parseFloat(matrix[i][j])
        }
    }
    // normalize the intensities if needed
    if(cfgPCA.normalize){
        //standardize data
        for(let i=1; i<matrix.length; i++){
            let peakData = []
            for(let j=cols[0]; j<cols[1]; j++){
                peakData.push(matrix[i][j])
            }
            let newPeakData = normalizeData(peakData)
            let count = 0
            //standardize the values to the matrix after calculation
            for(let j=cols[0]; j<cols[1]; j++){
                matrix[i][j] = newPeakData[count]
                count +=1
            }
        }
    }

    var variablesMatrix = getOnlyVariablesMatrix(matrix, cols)
    //computes the eigenvalues
    let eigen = PCA.getEigenVectors(variablesMatrix)
     //remove last value, that is empty
    // eigen.pop()
    // for(let i=0; i<eigen.length; i++){
    //     console.log(eigen[i])
    //     eigen[i].vector.pop()
    // }
    cvsPCA.eigen = eigen
    computeLoadings(eigen)
    if(debug){console.log(PCA.computeAdjustedData(variablesMatrix, eigen[0]))}
    
    //build a matrix containing all eigen vectors
    var eigenMatrix =[]
    for(let i=0; i<eigen.length; i++){
        eigenMatrix[i]=[]
        for(let j=0; j<eigen.length; j++){ //same length
            eigenMatrix[i][j]= eigen[j].vector[i]
        }
    }
    if(debug){console.log("variable and eigen matrix",variablesMatrix, eigenMatrix)}

    //computes the pca results matrix
    var finalMatrix = PCA.multiply(variablesMatrix, eigenMatrix)
    if(debug){console.log("finalMatrix",finalMatrix)}
    if(debug){console.log(PCA.computePercentageExplained(eigen,eigen[0]))}
    if(debug){console.log(PCA.computePercentageExplained(eigen,eigen[1]))}

    //adds the data titles to the inital matrix
    var cpntNb = 1
    var nbOfCols = cols[1]-cols[0]
    cvsPCA.components = []
    for(let j=cols[1]; j<cols[1]+nbOfCols-1; j++){
        let percentEx = 0.1*Math.round(1000*PCA.computePercentageExplained(eigen,eigen[cpntNb-1]))
        originalMatrix[0][j] = "Component_"+cpntNb+"("+percentEx.toFixed(1)+"%)"
        cvsPCA.components[cpntNb-1]={}
        cvsPCA.components[cpntNb-1].name = "Component "+cpntNb
        cvsPCA.components[cpntNb-1].percent = PCA.computePercentageExplained(eigen,eigen[cpntNb-1])
        cpntNb +=1
    }
    //adds the data to the inital matrix
    for(let i=1; i<matrix.length; i++){
        let count = 0
        for(let j=cols[1]; j<cols[1]+nbOfCols-1; j++){
            originalMatrix[i][j] = finalMatrix[i-1][count] //-1 because finalMatrix does not contain the header line
            cvsPCA.components[count].column = j
            count +=1
        }
    }
    //set the new columnNames
    return originalMatrix
}



// makes a matrix that contains only the variables of the matrix
function getOnlyVariablesMatrix(originalMatrix, cols){
    //duplicate the matrix to make modifications on it
    var matrix =duplicate2DArray(originalMatrix)
    var variablesMatrix = []
    for(let i=1; i<matrix.length; i++){
        variablesMatrix[i-1]=[]
        let count = 0
        for(let j=cols[0]; j<cols[1]; j++){
            variablesMatrix[i-1].push(matrix[i][j])
            count +=1
        }
    }
    

    return variablesMatrix
}


//calculating mean and std dev of a dataset ignoring the zeros
function normalizeData(data){
    var sum = 0
    var count = data.length
    //calculates the mean and NOT excludes any 0
    for(let i=0; i<data.length; i++){
        sum += data[i]
    }
    var mean = sum/count
    
    var sumMeanSquares = 0
    //calculates the std Deviation
    for(let i=0; i<data.length; i++){
        sumMeanSquares += Math.pow(data[i]-mean, 2)
    }
    var stdDev = 0
    stdDev = sumMeanSquares/(count-1)
    stdDev = Math.sqrt(stdDev)
    
    var normalizedData = []

    //aborts and sends back exactly the same data if stdDev is null
    if(stdDev == 0){
        for(let i=0; i<data.length; i++){normalizedData[i] = 0} 
        return normalizedData
    }

    //normalize each non-zero value
    for(let i=0; i<data.length; i++){
        normalizedData[i] = (data[i]-mean)/stdDev
    }
    // console.log(mean, stdDev)
    return normalizedData
}


function computeCovarianceNormalizedData(data1, data2){
    let sum = 0
    for(let i=0; i<data1.length; i++){
        sum += data1[i]*data2[i]
    }
    let covar  = sum/data1.length
    return covar
}



function duplicate2DArray(array) {
    // Create a new array
    const duplicateArray = [];
  
    // Iterate over each row in the original array
    for (let i = 0; i < array.length; i++) {
      // Create a new row
      const newRow = [];
  
      // Iterate over each element in the current row
      for (let j = 0; j < array[i].length; j++) {
        // Add the element to the new row
        newRow.push(array[i][j]);
      }
  
      // Add the new row to the new array
      duplicateArray.push(newRow);
    }
  
    return duplicateArray;
  }

/** takes in an eigen vector and computes the loadings, puts the data in cvsPCA.loadings */
function computeLoadings(eigen){
    cvsPCA.loadings = [];
    let loads = [];
    for(let i=0; i<eigen.length; i++){
        loads[i]=[]
        for(let j=0; j<eigen[i].vector.length; j++){
            loads[i][j]= Math.sqrt(eigen[j].eigenvalue)*eigen[j].vector[i]*Math.sqrt(eigen.length) //adding this eigen.length parameters puts the same values as perseus
        }
    }
    cvsPCA.loadings = loads
}

/**copy the vectors for saving away */
document.getElementById("copypcavectors").addEventListener("click",(d)=>{copyPCAVectors()})
function copyPCAVectors(){
    let vectors = cvsPCA.loadings
    if(!vectors.length){return}
    let data = []

    //creates the titles
    data[0] = []
    for(let i=0; i<vectors.length; i++){
        data[0].push("Component "+(i+1))
    }

    //creates the data
    for(let i=0; i<vectors.length; i++){
        data[i+1] = []
        for(let j=0; j<vectors[i].length; j++){
            data[i+1].push(vectors[i][j])
        }
    }
    copyData(data)
}

//used for samples
class Popup_PCAVariables extends Popup{
    constructor(fileNum) {
      super("heteroClassesEdit","Samples components values<br>Each column is a component<br>Each Line is a sample<br> ")
      this.fileNum = fileNum
      this.buildSuppContext()
      this.buildPasteButton()
  }

  buildSuppContext(){
     console.log(this)
     if(!fileParameters[this.fileNum] || !fileParameters[this.fileNum].variablesPca){return;}
     let variables = fileParameters[this.fileNum].variablesPca
     let table = createTable(variables.length, variables[0].length)
     console.log(variables, table)
     for(let i=0; i<variables.length; i++){
        for(let j=0; j<variables[i].length; j++){
            if(!table.rows[i]|| !table.rows[i].cells[j]){continue;}
            table.rows[i].cells[j].textContent = variables[i][j]
        }
     }
     this.preText.appendChild(table)
  }
  buildPasteButton(){
    let newButton = document.createElement("button")
    newButton.classList.add("smallpopupbutton")
    newButton.innerHTML = "Paste Variables data from spreadsheet"
    newButton.addEventListener("click", ()=>{new Popup_PCAVariablesPaste(this.fileNum)})
    this.preText.appendChild(newButton)
  }
}

class Popup_PCAVariablesPaste extends Popup{
    constructor(fileNum) {
        super("heteroClassesEdit","Paste here the variables from a spreadsheet<br>1 Column for each component<br> Do not put title lines<br>")
        this.fileNum = fileNum
        this.buildSuppContext()
        this.valButton.addEventListener("click",()=>{this.replaceOldValues()})
    }
    buildSuppContext(){
        let pasteArea = document.createElement("textarea")
        pasteArea.style.width = "75%"
        pasteArea.style.height = "500px"
        pasteArea.setAttribute("placeholder","Paste here")
        this.pasteArea = pasteArea
        this.preText.appendChild(pasteArea)
    }
    replaceOldValues(){
        let value = this.pasteArea.value
        console.log(value)
        let lbreak = value.split(/\r?\n/);
        let finalData = []
        lbreak.forEach(res => {
            finalData.push(res.split("	"));
        });
        if(!fileParameters[this.fileNum]){fileParameters[this.fileNum]= {}}
        fileParameters[this.fileNum].variablesPca = finalData
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCTIONS FOR THE PCA CANVAS

function drawPCACanvas(data, intensityCols){

    //closes any pending tooltip
    if(cfgPCA.main.tooltipClickClose){
        if(typeof cfgPCA.main.tooltipClickClose.selectAll == "function"){ cfgPCA.main.tooltipClickClose.selectAll("div")._parents[0].click()}
    }

    createTooltipFunctions(cfgPCA)
    createTooltips(cfgPCA, "#tooltip_canvasPCA", "tooltipPCA")

    createSelectPCA("projection_component_x","PCA_table")
    createSelectPCA("projection_component_y","PCA_table")
    createSelectPCA("loadings_component_x","PCA_table")
    createSelectPCA("loadings_component_y","PCA_table")
    var table = document.getElementById("PCA_table")
    table.querySelector("select[id='loadings_component_x']").value = cfgPCA.loadings.xtype 
    table.querySelector("select[id='loadings_component_y']").value = cfgPCA.loadings.ytype 
    table.querySelector("select[id='projection_component_x']").value = cfgPCA.projections.xtype
    table.querySelector("select[id='projection_component_y']").value = cfgPCA.projections.ytype

    cvsPCA.data = data
    cvsPCA.cellPeaks = tabPCA_createCellPeaks()
    cvsPCA.cellLoadings =tabPCA_createCellLoadings()
    cvsPCA.histogram  =tabPCA_createHistogram()
    
    tabPCA_drawData_Peaks()
    tabPCA_drawData_Loadings(intensityCols)
    tabPCA_drawData_histogram();
    if(cfgPCA.other.showHistogramLine){
        cvsPCA.histogram.lineData = tabPCA_drawData_histogramLine();
    }
    cellBrushingPCA()

}


/** creates the cell and scales of the cell peaks for PCA tab */
function tabPCA_createCellPeaks(){
    if(document.querySelector("#tab_pca").querySelector("#cellPeaks")){
        document.querySelector("#tab_pca").querySelector("#cellPeaks").remove()
    }
    var cfg = cfgPCA.projections
    var cell = {}
    cell.self = appendCell("#canvasPCA", "cellPeaks")
    cell.clipPath = appendClipPath(cell.self, "tabPCA_ClipPath")
    cell.background = appendBackColor(cell.self)
    cell.scales=[];
    cell.scales[0] = d3.scaleLinear().domain([cfg.xmin, cfg.xmax]).range([0, config.width]);
    cell.scales[1]= d3.scaleLinear().domain([cfg.ymin, cfg.ymax]).range([config.height, 0]);
    cell.axes=[];
    cell.axes[0]= appendAxis_x(cell.self, cell.scales[0], config.height, 1)
    cell.axes[1]= appendAxis_y(cell.self, cell.scales[1], 3)
    if(!config.nogrid){
        cell.grids = [];
        cell.grids[0] = appendPlotGrid(cell.self, cell.scales[0],config.axisLines, "bottom");
        cell.grids[1] = appendPlotGrid(cell.self, cell.scales[1],config.axisLines,"side");
      }
      if(config.boxBorders){
        cell.boxBorders = appendBoxScales(cell.self, cell.scales[0], cell.scales[1])
    }
    cell.axesLabels=[];  
    var labelX = cvsPCA.components[cfg.xtype].name
    var labelY = cvsPCA.components[cfg.ytype].name
    if(cfgPCA.other.showPercents){
        labelX += "("+(100*cvsPCA.components[cfg.xtype].percent).toFixed(1)+"%)"
        labelY += "("+(100*cvsPCA.components[cfg.ytype].percent).toFixed(1)+"%)"
    }
    let axisOptions = {}
    if(config.endAxis){axisOptions.mode = "endAxis"}
    cell.axesLabels[0]= appendAxisLabel_x(cell.self,  labelX, axisOptions);
    cell.axesLabels[1]= appendAxisLabel_y(cell.self,  labelY, axisOptions);
    return cell;
}
/** creates the cell and scales of the cell loadings for PCA tab */
function tabPCA_createCellLoadings(){
    if(document.querySelector("#tab_pca").querySelector("#cellLoadings")){
        document.querySelector("#tab_pca").querySelector("#cellLoadings").remove()
    }
    var cell = {}
    var cfg = cfgPCA.loadings
    cell.self = appendCell("#canvasPCA", "cellLoadings")
    cell.clipPath = appendClipPath(cell.self, "tabPCA_ClipPath2")
    cell.background = appendBackColor(cell.self)
    cell.scales=[];
    cell.scales[0] = d3.scaleLinear().domain([cfg.xmin, cfg.xmax]).range([0, config.width]);
    cell.scales[1]= d3.scaleLinear().domain([cfg.ymin, cfg.ymax]).range([config.height, 0]);
    cell.axes=[];
    cell.axes[0]= appendAxis_x(cell.self, cell.scales[0], config.height, 1)
    cell.axes[1]= appendAxis_y(cell.self, cell.scales[1], 3)
    if(!config.nogrid){
        cell.grids = [];
        cell.grids[0] = appendPlotGrid(cell.self, cell.scales[0],config.axisLines, "bottom");
        cell.grids[1] = appendPlotGrid(cell.self, cell.scales[1],config.axisLines,"side");
      }
      if(config.boxBorders){
        cell.boxBorders = appendBoxScales(cell.self, cell.scales[0], cell.scales[1])
    }
    cell.axesLabels=[];  
    var labelX = cvsPCA.components[cfg.xtype].name
    var labelY = cvsPCA.components[cfg.ytype].name
    if(cfgPCA.other.showPercents){
        labelX += "("+(100*cvsPCA.components[cfg.xtype].percent).toFixed(1)+"%)"
        labelY += "("+(100*cvsPCA.components[cfg.ytype].percent).toFixed(1)+"%)"
    }
    let axisOptions = {}
    if(config.endAxis){axisOptions.mode = "endAxis"}
    cell.axesLabels[0]= appendAxisLabel_x(cell.self,  labelX, axisOptions);
    cell.axesLabels[1]= appendAxisLabel_y(cell.self,  labelY, axisOptions);
    return cell;
}
/** creates the cell and scales of the cell loadings for PCA tab */
function tabPCA_createHistogram(){
    if(document.querySelector("#tab_pca").querySelector("#cellHistogram")){
        document.querySelector("#tab_pca").querySelector("#cellHistogram").remove()
    }

    //build the titles of the cells
    let componentsNames = []
    for(let i=0; i<cvsPCA.components.length; i++){
        componentsNames[i] = cvsPCA.components[i].name
    }
    var cell = {}
    cell.self = appendCell("#canvasPCA", "cellHistogram")
    cell.clipPath = appendClipPath(cell.self, "tabPCA_ClipPath3")
    cell.background = appendBackColor(cell.self)
    cell.scales=[];
    cell.scales[0] = d3.scaleBand().domain(componentsNames).range([0, config.width]);
    cell.scales[1]= d3.scaleLinear().domain([0, 100]).range([config.height, 0]);
    cell.axes=[];
    cell.axes[0]= appendAxis_x(cell.self, cell.scales[0], config.height, 1)
    cell.axes[1]= appendAxis_y(cell.self, cell.scales[1], 3)
    cell.axesLabels=[];
    let axisOptions = {}
    if(config.endAxis){axisOptions.mode = "endAxis"}
    cell.axesLabels[1]= appendAxisLabel_y(cell.self,  "% of variability",axisOptions);
    if(!config.nogrid){
        cell.grids = [];
        cell.grids[0] = appendPlotGrid(cell.self, cell.scales[0],config.axisLines, "bottom");
        cell.grids[1] = appendPlotGrid(cell.self, cell.scales[1],config.axisLines,"side");
      }
      if(config.boxBorders){
        cell.boxBorders = appendBoxScales(cell.self, cell.scales[0], cell.scales[1])
    }
    cell.axesLabels=[];  
    return cell;
}

/** draw the data peaks for tab pca */
function tabPCA_drawData_Peaks(){
 if(debug){console.log("drawing the data for PCA graph of peaks")}
 var cell = cvsPCA.cellPeaks
 var xscale = cell.scales[0]
 var yscale = cell.scales[1]
 var cfg= cfgPCA.projections

 d3.selectAll("#canvasPCA"+" #cellPeaksData").remove()

 
 cvsPCA.cellPeaks.zeroLine = [{},{}]
 let xAxis = [[cfgPCA.projections.xmin, 0],[cfgPCA.projections.xmax, 0]]
 let yAxis = [[0, cfgPCA.projections.ymin],[0, cfgPCA.projections.ymax]]
 cvsPCA.cellPeaks.zeroLine[0] = cell.self.append("path")
    .datum(xAxis)
    .attr('stroke',"red")
    .attr('stroke-width',1)
    .attr("fill","none")
    .attr("clip-path", "url(#tabPCA_ClipPath)")
    .attr("d", d3.line()
        .x((d)=>{ return xscale(d[0]); })
        .y((d)=>{ return yscale(d[1]); })
    )
 cvsPCA.cellPeaks.zeroLine[1] = cell.self.append("path")
    .datum(yAxis)
    .attr('stroke',"red")
    .attr('stroke-width',1)
    .attr("fill","none")
    .attr("clip-path", "url(#tabPCA_ClipPath)")
    .attr("d", d3.line()
        .x((d)=>{ return xscale(d[0]); })
        .y((d)=>{ return yscale(d[1]); })
    )


 cvsPCA.cellPeaks.data = {};
 cvsPCA.cellPeaks.data = cell.self.append('g').attr("id", "cellPeaksData")
    .selectAll("circle")
    .data(cvsPCA.data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return xscale(d[cvsPCA.components[cfg.xtype].column]); } ) 
    .attr("cy", function (d) { return yscale(d[cvsPCA.components[cfg.ytype].column]); } ) 
    .attr("r", function (d) { if(cfg.relativeSize){return cfg.dotSize*Math.sqrt(d[config.intensity])/config.sizeReductor;}else{return cfg.dotSize}})
    .attr("clip-path", "url(#tabPCA_ClipPath)")
    .attr('tooltipHTML', function(d,n){ return "scatterPlot;pca;"+n})
    .style("opacity", 0.8)
    .style("fill", function(d){return "black"})
    .on("mouseover", cfgPCA.main.functions.mouseover )
    .on("mousemove", cfgPCA.main.functions.mousemove  )
    .on("mouseleave" , cfgPCA.main.functions.mouseleave  )
    .on("click", cfgPCA.main.functions.mouseclick );


}

/** draw the data loadings for tab pca */
function tabPCA_drawData_Loadings(intensityCols){
    if(debug){console.log("drawing the data for PCA graph of loadings")}
 var cell = cvsPCA.cellLoadings
 var xscale = cell.scales[0]
 var yscale = cell.scales[1]
 var cfg= cfgPCA.loadings

 d3.selectAll("#canvasPCA"+" #cellLoadingsData").remove()
 
 cvsPCA.cellLoadings.data = {};
 cvsPCA.cellLoadings.data = cell.self.append('g').attr("id", "cellLoadingsData")
    .selectAll("circle")
    .data(cvsPCA.loadings)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return xscale(d[cfg.xtype]); } ) 
    .attr("cy", function (d) { return yscale(d[cfg.ytype]); } ) 
    .attr("r", function (d) { return cfg.dotSize})
    .attr("clip-path", "url(#tabPCA_ClipPath2)")
    .attr('tooltipHTML', function(d, n){return "pca;pca;"+buildTooltipLoadings(n)})
    .style("opacity", 1)
    .style("fill", function(d){return "black"})
    .on("mouseover", cfgPCA.main.functions.mouseover )
    .on("mousemove", cfgPCA.main.functions.mousemove  )
    .on("mouseleave" , cfgPCA.main.functions.mouseleave  )
    .on("click", cfgPCA.main.functions.mouseclick );
    //builds the axis
    cvsPCA.cellLoadings.zeroLine = [{},{}]
    let xAxis = [[cfgPCA.loadings.xmin, 0],[cfgPCA.loadings.xmax, 0]]
    let yAxis = [[0, cfgPCA.loadings.ymin],[0, cfgPCA.loadings.ymax]]
    cvsPCA.cellLoadings.zeroLine[0] = cell.self.append("path")
        .datum(xAxis)
        .attr('stroke',"red")
        .attr('stroke-width',1)
        .attr("fill","none")
        .attr("clip-path", "url(#tabPCA_ClipPath2)")
        .attr("d", d3.line()
            .x((d)=>{ return xscale(d[0]); })
            .y((d)=>{ return yscale(d[1]); })
        )
    cvsPCA.cellPeaks.zeroLine[1] = cell.self.append("path")
        .datum(yAxis)
        .attr('stroke',"red")
        .attr('stroke-width',1)
        .attr("fill","none")
        .attr("clip-path", "url(#tabPCA_ClipPath2)")
        .attr("d", d3.line()
            .x((d)=>{ return xscale(d[0]); })
            .y((d)=>{ return yscale(d[1]); })
        )


 //builds text labels if needed
 d3.selectAll("#canvasPCA"+" #cellLoadingsLabels").remove()
 if(cfg.showLabels){
    cvsPCA.cellLoadings.labels = cell.self.append('g').attr("id", "cellLoadingsLabels")
    .selectAll("text")
    .data(cvsPCA.loadings)
    .enter()
    .append("text")
    .attr("x", function (d) { return xscale(d[cfg.xtype])}) 
    .attr("y", function (d) {
        if(d[cfg.ytype]>0){
            return yscale(d[cfg.ytype])+ config.legendFontSizeSmall;
        }else{
            return yscale(d[cfg.ytype])- config.legendFontSizeSmall;
        }} ) 
    .attr("font-size", config.legendFontSizeSmall)
    .text(function(d, n){return buildTooltipLoadings(n)})
    .attr("clip-path", "url(#tabPCA_ClipPath2)")
    .style("opacity", 1)
    .on("mousemove", function(event, d){
        var coordinates= d3.pointer(event);
        var x = coordinates[0];
        var y = coordinates[1];
        if(event.ctrlKey){
            d3.select(this)
            .attr('x', x-10)
            .attr('y', y+5);
        }
    })
 }
 
 //function to build theses specific tooltips
 function buildTooltipLoadings(n){
    let name = cvsPCA.data[0][intensityCols[0]+n]
    if(name.startsWith("I_")){
        name = name.slice(2)
    }
    return name
 }

}

function tabPCA_drawData_histogram(){
    if(debug){console.log("drawing the histograms of the PCA")}
    var cell = cvsPCA.histogram

    var xscale = cell.scales[0]
    var yscale = cell.scales[1]

    var barWidth = 0.5
    d3.selectAll("#canvasPCA"+" #histogramData").remove()
    cell.data = {};
    cell.data = cell.self.append('g').attr("id", "histogramData")
      .selectAll("rect")
      .data(cvsPCA.components)
      .enter()
      .append("rect")
        .attr("x", function(d) { return xscale(d.name)+ (1-barWidth)*xscale.bandwidth()/2})
        .attr("y", function(d) { return yscale(100*d.percent)}) 
        .attr("width", (barWidth*xscale.bandwidth()))
        .attr("height", function(d) { return config.height- yscale(100*d.percent) })
        .style("fill", "#000000")
        .attr("fillColor", "#000000")
        .attr("clip-path", "url(#tabPCA_ClipPath3)")
        .attr('tooltipHTML', function(d ,i){ return "pca;pca;"+d.name+"<br>"+100*d.percent+" %"})
         .on("mouseover", cfgPCA.main.functions.mouseover )
         .on("mousemove", cfgPCA.main.functions.mousemove  )
         .on("mouseleave" , cfgPCA.main.functions.mouseleave  )
         .on("click", cfgPCA.main.functions.mouseclick );
}

function tabPCA_drawData_histogramLine(){
    if(debug){console.log("drawing the line for the sum of percentages for PCA")}
    var cell = cvsPCA.histogram

    var xscale = cell.scales[0]
    var yscale = cell.scales[1]

    //computes the data of the line
    var lineData = []
    for(let i=0; i<cvsPCA.components.length; i++){
        lineData[i]={}
        lineData[i].component = cvsPCA.components[i].name
        lineData[i].percent = 0
        for(let j=0; j<=i; j++){
            lineData[i].percent += cvsPCA.components[j].percent
        } 
    }
    d3.selectAll("#canvasPCA"+" #histogramLine").remove()
    /** average line for a cell */
    cell.lineAverage = cell.self.append("path").attr("id","histogramLine")
    .datum(lineData)
    .attr('stroke','red')
    .attr('stroke-width',3)
    .attr("fill","none")
    .attr("clip-path", "url(#tabPCA_ClipPath3)")  //cuts everything outside of charrt area
    .attr("d", d3.line()
      .x(function(d){ return xscale(d.component)+ xscale.bandwidth()/2; })
      .y(function(d){ return yscale(100*d.percent); })
    )
    .attr('tooltipHTML', function(d ,i){ return "pca;pca;"+writeLineTooltipPCA() })
         .on("mouseover", cfgPCA.main.functions.mouseover )
         .on("mousemove", cfgPCA.main.functions.mousemove  )
         .on("mouseleave" , cfgPCA.main.functions.mouseleave  )
         .on("click", cfgPCA.main.functions.mouseclick );

    function writeLineTooltipPCA(){
        var text = "Cumulated Percents: <br>"
        for(let i=0; i<lineData.length; i++){
            text += 100*lineData[i].percent +" % <br>"
        }
        return text
    }

}

/**autoscaling */

var tabPCA_autoScaleButton = document.querySelector("#autoScalePCA")
tabPCA_autoScaleButton.addEventListener("click", function (d){tabPCA_autoscale(d)});

function tabPCA_autoscale(d){
    var cfgLoad = cfgPCA.loadings
    var cfgProj = cfgPCA.projections

    //autoscale for the variables
    var data = cvsPCA.data
    var components = cvsPCA.components
    var compoNumber = components.length
    var compoNumberFirst = parseInt(data[0].length -compoNumber) //number of the column of the first component

    var compo_xtype = compoNumberFirst + parseInt(cfgProj.xtype)
    var compo_ytype = compoNumberFirst + parseInt(cfgProj.ytype)
    //looks for min and max values of components in variables
    var compo_x_min = data[1][compo_xtype]
    var compo_x_max = compo_x_min
    var compo_y_min = data[1][compo_ytype]
    var compo_y_max = compo_y_min
    for(let i=1; i<data.length; i++){
        if(data[i][compo_xtype] > compo_x_max){ compo_x_max = data[i][compo_xtype]}
        if(data[i][compo_xtype] < compo_x_min){ compo_x_min = data[i][compo_xtype]}
        if(data[i][compo_ytype] > compo_y_max){ compo_y_max = data[i][compo_ytype]}
        if(data[i][compo_ytype] < compo_y_min){ compo_y_min = data[i][compo_ytype]}
    }
    if(Math.abs(compo_x_max-compo_x_min)<10){
        cvsPCA.cellPeaks.scales[0].domain([ compo_x_min-1, compo_x_max+1 ]);
        cvsPCA.cellPeaks.scales[1].domain([ compo_y_min-1, compo_y_max+1 ]);
        cfgProj.xmin = Math.round(compo_x_min)-1
        cfgProj.ymin = Math.round(compo_y_min)-1
        cfgProj.xmax = Math.round(compo_x_max)+1
        cfgProj.ymax = Math.round(compo_y_max)+1
    }else if(Math.abs(compo_x_max-compo_x_min)<100) {
        cvsPCA.cellPeaks.scales[0].domain([ compo_x_min-10, compo_x_max+10 ]);
        cvsPCA.cellPeaks.scales[1].domain([ compo_y_min-10, compo_y_max+10 ]);
        cfgProj.xmin = Math.round(compo_x_min)-10
        cfgProj.ymin = Math.round(compo_y_min)-10
        cfgProj.xmax = Math.round(compo_x_max)+10
        cfgProj.ymax = Math.round(compo_y_max)+10
    }else if(Math.abs(compo_x_max-compo_x_min)<1000){
        cvsPCA.cellPeaks.scales[0].domain([ compo_x_min-100, compo_x_max+100 ]);
        cvsPCA.cellPeaks.scales[1].domain([ compo_y_min-100, compo_y_max+100 ]);
        cfgProj.xmin = Math.round(compo_x_min)-100
        cfgProj.ymin = Math.round(compo_y_min)-100
        cfgProj.xmax = Math.round(compo_x_max)+100
        cfgProj.ymax = Math.round(compo_y_max)+100
    }else{
        cvsPCA.cellPeaks.scales[0].domain([ compo_x_min*1.1, compo_x_max*1.1 ]);
        cvsPCA.cellPeaks.scales[1].domain([ compo_y_min*1.1, compo_y_max*1.1 ]);
        cfgProj.xmin = Math.round(compo_x_min)*1.1
        cfgProj.ymin = Math.round(compo_y_min)*1.1
        cfgProj.xmax = Math.round(compo_x_max)*1.1
        cfgProj.ymax = Math.round(compo_y_max)*1.1
    }


    //autoscale for the loadings
    var loads = cvsPCA.loadings
    var loads_xtype = cfgLoad.xtype
    var loads_ytype = cfgLoad.ytype
    //looks for min and max values of loadings
    var loads_x_min = loads[0][loads_xtype]
    var loads_x_max = loads_x_min
    var loads_y_min = loads[0][loads_ytype]
    var loads_y_max = loads_y_min
    for(let i=1; i<loads.length; i++){
        if(loads[i][loads_xtype] > loads_x_max){ loads_x_max = loads[i][loads_xtype]}
        if(loads[i][loads_xtype] < loads_x_min){ loads_x_min = loads[i][loads_xtype]}
        if(loads[i][loads_ytype] > loads_y_max){ loads_y_max = loads[i][loads_ytype]}
        if(loads[i][loads_ytype] < loads_y_min){ loads_y_min = loads[i][loads_ytype]}
    }

    if(loads_x_max-loads_x_min<70){
        cvsPCA.cellLoadings.scales[0].domain([ loads_x_min-5, loads_x_max+5 ]);
        cvsPCA.cellLoadings.scales[1].domain([ loads_y_min-5, loads_y_max+5 ]);
        cfgLoad.xmin = Math.round(loads_x_min)-5
        cfgLoad.ymin = Math.round(loads_y_min)-5
        cfgLoad.xmax = Math.round(loads_x_max)+5
        cfgLoad.ymax = Math.round(loads_y_max)+5
    }else if(loads_x_max-loads_x_min<500){
        cvsPCA.cellLoadings.scales[0].domain([ loads_x_min-50, loads_x_max+50 ]);
        cvsPCA.cellLoadings.scales[1].domain([ loads_y_min-50, loads_y_max+50 ]);
        cfgLoad.xmin = Math.round(loads_x_min)-50
        cfgLoad.ymin = Math.round(loads_y_min)-50
        cfgLoad.xmax = Math.round(loads_x_max)+50
        cfgLoad.ymax = Math.round(loads_y_max)+50
    }else if(loads_x_max-loads_x_min<5000){
        cvsPCA.cellLoadings.scales[0].domain([ loads_x_min-500, loads_x_max+500 ]);
        cvsPCA.cellLoadings.scales[1].domain([ loads_y_min-500, loads_y_max+500 ]);
        cfgLoad.xmin = Math.round(loads_x_min)-500
        cfgLoad.ymin = Math.round(loads_y_min)-500
        cfgLoad.xmax = Math.round(loads_x_max)+500
        cfgLoad.ymax = Math.round(loads_y_max)+500
    }else{//supposed that min values are negative
        cvsPCA.cellLoadings.scales[0].domain([ loads_x_min-500, loads_x_max+500 ]);
        cvsPCA.cellLoadings.scales[1].domain([ loads_y_min*1.1, loads_y_max*1.1 ]);
        cfgLoad.xmin = Math.round(loads_x_min)*1.1
        cfgLoad.ymin = Math.round(loads_y_min)*1.1
        cfgLoad.xmax = Math.round(loads_x_max)*1.1
        cfgLoad.ymax = Math.round(loads_y_max)*1.1
    }

    //update the table values
    var table = document.getElementById("PCA_table")
    table.querySelector("input[name='loadings_component_xmin']").value = cfgLoad.xmin
    table.querySelector("input[name='loadings_component_xmax']").value = cfgLoad.xmax
    table.querySelector("input[name='loadings_component_ymin']").value = cfgLoad.ymin
    table.querySelector("input[name='loadings_component_ymax']").value = cfgLoad.ymax
    table.querySelector("input[name='projection_component_xmin']").value = cfgProj.xmin
    table.querySelector("input[name='projection_component_xmax']").value = cfgProj.xmax
    table.querySelector("input[name='projection_component_ymin']").value = cfgProj.ymin 
    table.querySelector("input[name='projection_component_ymax']").value = cfgProj.ymax 
    updatePCAtable()

}

///////////////////////////////////////////////////////////////////////
//HANDLING OF THE MENU TABLE

document.getElementById("PCA_table").addEventListener("change", updatePCAtable)

/**function triggered when there is an update of the PCA table */
function updatePCAtable(){
    var table = document.getElementById("PCA_table")
    var cfgLoad = cfgPCA.loadings
    var cfgProj = cfgPCA.projections
    cfgLoad.xmin = table.querySelector("input[name='loadings_component_xmin']").value
    cfgLoad.xmax = table.querySelector("input[name='loadings_component_xmax']").value
    cfgLoad.ymin = table.querySelector("input[name='loadings_component_ymin']").value
    cfgLoad.ymax = table.querySelector("input[name='loadings_component_ymax']").value
    cfgLoad.xtype = table.querySelector("select[id='loadings_component_x']").value
    cfgLoad.ytype = table.querySelector("select[id='loadings_component_y']").value
    cfgLoad.dotSize = table.querySelector("input[name='loadings_dotSize']").value
    cfgLoad.showLabels = table.querySelector("input[name='loadings_showLabels']").checked

    cfgProj.xmin = table.querySelector("input[name='projection_component_xmin']").value
    cfgProj.xmax = table.querySelector("input[name='projection_component_xmax']").value
    cfgProj.ymin = table.querySelector("input[name='projection_component_ymin']").value
    cfgProj.ymax = table.querySelector("input[name='projection_component_ymax']").value
    cfgProj.xtype = table.querySelector("select[id='projection_component_x']").value
    cfgProj.ytype = table.querySelector("select[id='projection_component_y']").value
    cfgProj.dotSize = table.querySelector("input[name='projection_dotSize']").value
    cfgProj.relativeSize = table.querySelector("input[name='projection_relativeSize']").checked

    cfgPCA.other.showHistogramLine =  table.querySelector("input[name='histogram_showLine']").checked
    cfgPCA.other.showPercents =  table.querySelector("input[name='pca_showPercents']").checked
    drawPCACanvas(cvsPCA.data, cvsPCA.intensityCols)

}

setPCATableValues()
/** update the values shown on the PCA table based on the values in memory */
function setPCATableValues(){

    createSelectPCA("projection_component_x","PCA_table")
    createSelectPCA("projection_component_y","PCA_table")
    createSelectPCA("loadings_component_x","PCA_table")
    createSelectPCA("loadings_component_y","PCA_table")

    var table = document.getElementById("PCA_table")

    var cfgLoad = cfgPCA.loadings
    var cfgProj = cfgPCA.projections
    table.querySelector("input[name='loadings_component_xmin']").value = cfgLoad.xmin
    table.querySelector("input[name='loadings_component_xmax']").value = cfgLoad.xmax
    table.querySelector("input[name='loadings_component_ymin']").value = cfgLoad.ymin
    table.querySelector("input[name='loadings_component_ymax']").value = cfgLoad.ymax
    cfgLoad.xtype = setSelectVal(table, '',cfgLoad.xtype,'loadings_component_x', 0)
    cfgLoad.ytype = setSelectVal(table, '',cfgLoad.ytype,'loadings_component_y', 1)
    table.querySelector("input[name='loadings_dotSize']").value = cfgLoad.dotSize
    table.querySelector("input[name='loadings_showLabels']").checked = cfgLoad.showLabels

    table.querySelector("input[name='projection_component_xmin']").value = cfgProj.xmin
    table.querySelector("input[name='projection_component_xmax']").value = cfgProj.xmax  
    table.querySelector("input[name='projection_component_ymin']").value = cfgProj.ymin
    table.querySelector("input[name='projection_component_ymax']").value = cfgProj.ymax 
    cfgProj.xtype = setSelectVal(table, '',cfgProj.xtype,'projection_component_x', 0)
    cfgProj.ytype = setSelectVal(table, '',cfgProj.ytype,'projection_component_y', 1)
    table.querySelector("input[name='projection_dotSize']").value  = cfgProj.dotSize
    table.querySelector("input[name='projection_relativeSize']").checked = cfgProj.relativeSize

    table.querySelector("input[name='histogram_showLine']").checked = cfgPCA.other.showHistogramLine
    table.querySelector("input[name='pca_showPercents']").checked = cfgPCA.other.showPercents 

}




/** creates options for the PCA variables */
function createSelectPCA(selectName, parentDiv){
    var docDiv = document
  if(parentDiv != null){
    docDiv = document.getElementById(parentDiv)
  }
  var selectedSelecter = {}
  if(typeof selectName == "object"){
    selectedSelecter = selectName
  }else{
    selectedSelecter = docDiv.querySelector("#"+selectName)
  }
  //delete previous options
  for(let i=selectedSelecter.options.length-1; i>=0; i--) { //backward for to remove all options
      selectedSelecter.remove(i);
   }
  //Create and append the options
  for (var i = 0; i < cvsPCA.components.length; i++) {
    var option = document.createElement("option");
    option.value = parseInt(i);
    option.text = cvsPCA.components[i].name
    selectedSelecter.appendChild(option);
  }
  return selectedSelecter
}

///////////////////////////////////////////////////////
/**screenshot code */
var canvasPCA_screenshot = html_tabPca.querySelector('button[name="screenshot"]')
canvasPCA_screenshot.addEventListener("click", function (){ new Popup_PCAScreenshot(cvsPCA)});


class Popup_PCAScreenshot extends Popup{
    constructor(canvas) {
        super("canvasScreenshot","Choose the graph to take a pic of")
        this.canvas = canvas
        var buttons = [
            {"name":"Export image (png)", "function":()=>{this.exportPNG()}},
            {"name":"Export vectorial image (svg)", "function":()=>{this.exportSVG()}}
        ]
        var selecter = [{"name":"selecter", "options":[]}]
        selecter[0].options = [
            {"value":"Peaks", "text":"Projections chart"},
            {"value":"Loadings", "text":"Loadings chart"},
            {"value":"Histogram", "text":"Variability Histogram"},
            {"value":"-1", "text":"Whole Canvas"},
        ]
        this.buildInputs(selecter, [], buttons)
        this.valButton.remove()
    }

    exportSVG(){
        let cellNum = this.popup_box.querySelector('select[name="popup_selecter_0"]').value
        let html_canvas = document.querySelector("#canvasgroupPCA")
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
        let thisCanvas = document.querySelector("#canvasgroupPCA")
        /**gets the information of the screenshot zone */
        let downloadTarget = ""
        if(cellName == -1){
            downloadTarget = "wholeCanvas"
            //catch the whole canvas, do nothing
        }else{
            downloadTarget = "cell "+cellName
            //hide undesired elements
            if(cellName !="Peaks"){d3.select('#canvasPCA #cellPeaks').attr("display","none")}
            if(cellName !="Loadings"){d3.select('#canvasPCA #cellLoadings').attr("display","none")}
            if(cellName !="Histogram"){d3.select('#canvasPCA #cellHistogram').attr("display","none")}
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
            d3.select('#canvasPCA #cellPeaks').attr("display",null)
            d3.select('#canvasPCA #cellLoadings').attr("display",null)
            d3.select('#canvasPCA #cellHistogram').attr("display",null)
            thisCanvas.style.height= null
            thisCanvas.style.width= null
        }
        this.popup_close.click()
    }

}



/** a function that launches a popup to take a screenshot of the PCA canvas */
function takeScreenshotPCA(){
    var selecter = [{"name":"selecter", "options":[]}]
    selecter[0].options = [
        {"value":"Peaks", "text":"Projections chart"},
        {"value":"Loadings", "text":"Loadings chart"},
        {"value":"Histogram", "text":"Variability Histogram"},
        {"value":"-1", "text":"Whole Canvas"},
    ]
    var buttons  = [
        {"name":"Export image (png)", "function":exportScreenshot_PNG_PCA, "arg1":cvsPCA}, //TODO: readapat the functions of export for PCA
        {"name":"Export vectorial image (svg)", "function":exportScreenshot_SVG_PCA, "arg1":cvsPCA, "arg2":"PCA"}

    ]
    handlePopup("screenshot", "Choose the graph to take a pic of ", buttons , selecter, [])
}

/**a function fired by the screenshot popup to save an image as png. uses HTML2CANVAS. This version is specific to the PCA canvas */
async function exportScreenshot_PNG_PCA(cvs){
    var html_popup = document.querySelector('div[name="popup_screenshot"]')
    var cellName = html_popup.querySelector('select[name="popup_selecter_0"]').value    
     var thisCanvas = document.getElementById("canvasPCA")
    /**gets the information of the screenshot zone */
    var downloadTarget = null
    if(cellName == -1){
        downloadTarget = "wholeCanvas"
        //catch the whole canvas, do nothing
    }else{
        downloadTarget = "cell "+cellName
        //hide undesired elements
        if(cellName !="Peaks"){d3.select('#canvasPCA #cellPeaks').attr("display","none")}
        if(cellName !="Loadings"){d3.select('#canvasPCA #cellLoadings').attr("display","none")}
        if(cellName !="Histogram"){d3.select('#canvasPCA #cellHistogram').attr("display","none")}
        thisCanvas.style.height= config.height+config.margin.top+config.margin.bottom
        thisCanvas.style.width= config.width+config.margin.left+config.margin.right
    }
    var screenshot = null
    await html2canvas(thisCanvas).then(function(canvas) {
        screenshot = html_popup.appendChild(canvas)
        screenshot.id = "screenshot_image"
      });
    var fileName = "puncdata_"+downloadTarget;
    var file = document.getElementById("screenshot_image")
    downloadFile(fileName, screenshot, "png")


    if(cellName != -1){
        d3.select('#canvasPCA #cellPeaks').attr("display",null)
        d3.select('#canvasPCA #cellLoadings').attr("display",null)
        d3.select('#canvasPCA #cellHistogram').attr("display",null)
        thisCanvas.style.height= null
        thisCanvas.style.width= null
    }
}



var html_canvasPCA = document.querySelector("#canvasgroupPCA")
html_canvasPCA.addEventListener('keyup', buttonPressPCA);

/**button presses functions  for PCA canvas*/
function buttonPressPCA(event) {
    const key = event.key;
    if(key ==="c" && event.ctrlKey){
        copyDataPCA(event)
    }
}

function copyDataPCA(event){

     //get the copied data and transforms it into a string
     var selectData = []
     let cfg = cfgPCA.projections
     let cell = cvsPCA.cellPeaks
     let xcolumn = cvsPCA.components[cfg.xtype].column
     let ycolumn = cvsPCA.components[cfg.ytype].column
     let data = cvsPCA.data
     var selection = d3.brushSelection(cell.self.node())
     for(let i=0; i<data.length; i++){
        if(isBrushed(selection, cell.scales[0](data[i][xcolumn]), cell.scales[1](data[i][ycolumn]) )){
            selectData.push(data[i])
          }
     }
     var dataLine = "";
     for(let i=0; i<selectData.length; i++){
        for(let j=0; j<selectData[i].length; j++){
            dataLine += selectData[i][j] + '\t'
        }
        dataLine += '\n'
     }
     navigator.clipboard.writeText(dataLine)

     //display a temporary box to confirm copying
    var popup = document.getElementById("popup_data_copy")
    popup.className = "fade_popup_visible"
    var styletop =  (event.target.clientHeight)/3-30
    popup.style.top = (event.target.clientHeight)/3 -30;
    popup.style.left = (event.target.clientWidth)/2;
    
    setTimeout(() => { 
        popup.className = "fade_popup" 
        popup.style.top= styletop-(event.target.clientHeight)/2
    }, 100);


}


/** a cell brushing option only to copy data from a pca analysis  */
function cellBrushingPCA(){
    if(debug){console.log("creating the brushing for PCA cell")}

    var cell = cvsPCA.cellPeaks
    var cfg = cfgPCA.projections

    var selection = cell.self.call( d3.brush()
    .extent( [ [0,0], [config.width,config.height] ] )
    .keyModifiers(false) //disable the default functions of the brush when shift is pressed
    .on("start brush", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
    );
    cell.self.select("rect.selection").moveToBack()
    cell.self.select("rect.overlay").moveToBack()
    cell.self.selectAll("g.grid").moveToBack()

    let xcolumn = cvsPCA.components[cfg.xtype].column
    let ycolumn = cvsPCA.components[cfg.ytype].column

    function updateChart({selection}){
        //finds the class needed for selection
        var selectedName = config.selectionTool.selectionStyle
        if(config.blackCircle){selectedName = config.selectionTool.selectionStyleBis}
        cell.data.classed(selectedName, function(d){ return isBrushed(selection, cell.scales[0](d[xcolumn]), cell.scales[1](d[ycolumn]) ) } )
    }

}

  //covarience code that was in the normalizMatrix function
    //Covariance calculation DEPRECATED SINCE THE USAGE OF PCA.JS
    //
    // var covarMatrix = []
    // //computes covariance
    // for(let i=1; i<matrix.length; i++){
    //     covarMatrix[i-1] = []
    //     let peakData1 = []
    //     for(let j=cols[0]; j<cols[1]; j++){
    //         peakData1.push(matrix[i][j])
    //     }
    //     for(let k=1; k<matrix.length; k++){
    //         let peakData2 = []
    //         for(let j=cols[0]; j<cols[1]; j++){
    //             peakData2.push(matrix[k][j])
    //         }
    //         if(i<2 && k<2){console.log(peakData1,peakData2)}
    //         covarMatrix[i-1][k-1]= computeCovarianceNormalizedData(peakData1, peakData2)
    //     }
    // }

    ///////////////use of the PCA.js functions














// //calculating mean and std dev of a dataset ignoring the zeros
// function normalizeDataWithoutZeros(data){
//     var sum = 0
//     var count = 0
//     //calculates the mean and excludes any 0
//     for(let i=0; i<data.length; i++){
//         if(data[i] > 0){
//             count += 1
//             sum += data[i]
//         }
//     }
//     var mean = sum/count
    

//     var sumMeanSquares = 0
//     //calculates the std Deviation
//     for(let i=0; i<data.length; i++){
//         if(data[i] > 0){
//             sumMeanSquares += Math.pow(data[i]-mean, 2)
//         }
//     }
//     var stdDev = 0
//     if(count >1){
//         stdDev = sumMeanSquares/(count-1)
//         stdDev = Math.sqrt(stdDev)
//     }

//     console.log(data, mean, stdDev)

//     //normalize each non-zero value
//     for(let i=0; i<data.length; i++){
//         if(data[i] > 0 && count >1){
//             data[i] = (data[i]-mean)/stdDev
//         }
//     }

//     console.log(data)
// }