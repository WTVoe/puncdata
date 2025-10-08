
/******************************************************************************* */
/*                                                                               */
/*                            CANVAS, CELLS, DATA CLASSES                        */
/*                            ---------------------------                        */
/******************************************************************************* */
class Canvas{
    constructor(htmlAnchor,letterID, cfg){
        this.html = htmlAnchor
        this.cfg = cfg
        this.cfg.opacity = cfg.opacity || 1
        this.cells = []
        this.data = []
        this.filters = []
        this.computedData = []
        this.letter = letterID
        this.html.parentElement.addEventListener('keyup',(d)=>{this.handleKeyboardPress(d)})
        /// filling
        for(let i=0; i<this.cfg.cellNb; i++){
            this.cells.push(this.chooseCellType(i, this.cfg.cellsType[i]))

        }
        for(let i=0; i<this.cfg.dataNb; i++){
            this.data.push(new DataSet(this, i))
        }
    }
    /** draw a canvas by drawing every cell */
    draw(){
        if(debug){console.log("Drawing canvas"+this.letter)}
        //resets the datasets
        this.data.forEach((item,index)=>{
            if(this.data.fillFromName){
                this.data.fillFromName(this.data.dataName)
            }
        })
        this.cells.forEach((item,index) => {
            item.draw()
        })
        //draws datasets after
        this.cells.forEach((item,index) => {
            item.drawAllData()
        })
    }
    /**acts like draw but redraws only one dataset on all charts*/
    drawDataset(dataIndex){
        this.cells.forEach((item,cellIndex) => {
            item.drawData(this.data[dataIndex],dataIndex)
            let onlySolidLegends = false
            if(item.cfg && item.cfg.type){
                let type = item.cfg.type 
                if(type.includes("histo")){
                    item.drawAllData()
                    onlySolidLegends = true
                }
                if(type == "none"){return;}
                if(type == "massSpectra"){item.drawColourLegends(item.cfg.forceSolidColor)}
                else{item.drawColourLegends(onlySolidLegends)}
            }
        })
    }
    /**draw all the datasets on all cells */
    drawAllDatasets(cellsToAvoid){
        this.cells.forEach((item, itemIndex)=>{
            if(cellsToAvoid && cellsToAvoid.includes(itemIndex)){return;}
            item.drawAllData()
        })
    }

    /** updates a specific dataSet with a specific content */
    updateDataSet(dataIndex, content){
        this.cells.forEach((item,cellIndex) => {
            item.updateData(content, dataIndex)
        })
    }
    /** updates all datasets on all cells */
    updateAllDataSet(content){
        this.data.forEach((item, itemIndex)=>{
            this.updateDataSet(itemIndex, content)
        })
    }

    /** updates all datasets on all cells */
    handleFiltering(indexesSelected){
        this.cells.forEach((item, index)=>{
            item.handleFiltering(indexesSelected)
        })
    }
    /** redraws all colour legends */
    redrawAllColourLegends(){
        this.cells.forEach((item, index)=>{   
            let onlySolidColor = false
            let type = item.cfg.type
            if(type == "histogram" || type =="histodiscrete" || type=="histoclass"){
                onlySolidColor = true
            }
            if(type != null && type !="none"){ item.drawColourLegends(onlySolidColor)}
           
        })

    }


    /** refresh data configs and canvas cells */
    refresh(){
        if(debug){console.log("refreshing every cell of canvas"+this.letter)}
        //refreshes the cell
        this.cells.forEach((item,index) => {
            item.update("all",false)
        })
        //refreshes the data
        this.data.forEach((item,index) => {
            if(item.data &&  item.data.length >0){
                item.prepareColorScale()
            }
        })
        //refreshes the data on cells
        this.cells.forEach((item,index) => {
            item.updateAllData("all")
        })
    }
    /**
     * helper to find from a string what kind of cell to create
     * @param {*} index  the index of the cell
     * @param {*} type string of cell type
     * @returns Defaults to CanvasCell. Other way, outputs a new specific canvas cell
     */
    chooseCellType(index, type, cfg){
        switch (type){
            case 'scatterPlot':
                return new CanvasCell_scatterPlot(this, index, cfg)
                break;
            case 'scatter3D':
                return new CanvasCell_scatter3D(this, index, cfg)
                break;
            case 'massSpectra':
                return new CanvasCell_massSpectra(this, index, cfg)
                break;
            case 'kendrick':
                return new CanvasCell_kendrick(this, index, cfg)
                break;
            case 'kendrick2D':
                return new CanvasCell_kendrick2D(this, index, cfg)
                break;
            case 'contourMap':
                return new CanvasCell_contourMap(this, index, cfg)
                break;
            case 'densityCurve':
                return new CanvasCell_densityCurve(this, index, cfg)
                break;
            case 'tableInfos':
                return new CanvasCell_tableInfos(this, index, cfg)
                break;
            case 'histogram':
                return new CanvasCell_histogram(this, index, cfg)
                break;
            case 'histodiscrete':
                return new CanvasCell_histodiscrete(this, index, cfg)
                break;
            case 'histoclass':
                return new CanvasCell_histoclass(this, index, cfg)
                break;
            case 'density':
                return new CanvasCell_density(this, index, cfg)
                break;
            case 'errorMass':
                return new CanvasCell_errorMass(this, index, cfg)
                break;
            case 'histoerror':
                return new CanvasCell_histoerror(this, index, cfg)
                break;
            case 'henry':
                return new CanvasCell_henry(this, index, cfg)
                break;
            case 'scatterPCA':
                return new CanvasCell_scatterPCA(this, index, cfg)
                break;
            case 'massPCA':
                return new CanvasCell_massPCA(this, index, cfg)
                break;
            case 'samplesPCA':
                return new CanvasCell_samplesPCA(this, index, cfg)
                break;
            case 'massDifferences':
                return new CanvasCell_massDifferences(this, index, cfg)
                break;
            case 'massDifferences_formula':
                return new CanvasCell_massDifferences_formula(this, index, cfg)
                break;
            default:
                return new CanvasCell_void(this, index, cfg)
        }
    }
    /**
     * modifies the type of a cell
     * @param {*} index  the index of the cell in the canvas
     * @param {*} type string of cell type 
     */
    changeCellType(index, type, cfg){
        this.cells[index] = this.chooseCellType(index, type, cfg)
    }
    /**autoscales every cell by calling their function */
    autoscale(){
        if(debug){console.log("autoscaling every cell from canvas"+this.letter)}
        this.cells.forEach((item,index) => {
            item.autoscale()
        })
    }
    /**
     * looks through all the active datasets and returns the highest intensity
     * @param {boolean} refresh should it ask each dataset to restart computation of max or just send back data in memory
     * @returns the maxInt as a float. Defaults to -1
     */
    findMaxInt(refresh){
        let maxInt = -1
        this.data.forEach((item, index)=>{
            let localMax = -1
            if(refresh){
                localMax = item.findMaxInt()
            }else{
                localMax = parseFloat(item.maxInt)
            }
            if(localMax >maxInt){maxInt = localMax}
        })
        return maxInt
    }

    /** similar to findMaxInt but only for a specific cell with its data represented on it */
    findMaxIntofCell(refresh, cellID){
        let maxInt = -1
        let activeData = this.cells[cellID].cfg.activeData
        this.data.forEach((item, index)=>{
            if(activeData[index] != "1"){return;}
            let localMax = -1
            if(refresh){
                localMax = item.findMaxInt()
            }else{
                localMax = parseFloat(item.maxInt)
            }
            if(localMax >maxInt){maxInt = localMax}
        })
        return maxInt
    }

    /**a function to reset all the filters applied on datasets */
    resetFilters(){
        console.log("reset all filters - canvas level")
        this.filters = []
        console.log(this, this.filters)
        this.data.forEach((item)=>{
            item.dataFiltered = []
            item.filters = []
        })
    }


    returnCellTypesList(){
        let toAllow = this.cfg.proposedCells
        let cellTypes = [{value:"none", name:"Empty"}]
        if(toAllow.common){
            cellTypes.push({value:"SPLITTER", name:"SPLITTER"})
            cellTypes.push({value:"massSpectra", name:"Mass spectra"})
            cellTypes.push({value:"scatterPlot", name:"Scatter plot"})
            cellTypes.push({value:"scatter3D", name:"Scatter plot 3D"})
            cellTypes.push({value:"contourMap", name:"Contour map"})
            cellTypes.push({value:"kendrick", name:"Kendrick map"})
            cellTypes.push({value:"kendrick2D", name:"Kendrick 2D"},)
            cellTypes.push({value:"tableInfos", name:"Table of data"})
        }
        if(toAllow.histo){
            cellTypes.push({value:"SPLITTER", name:"SPLITTER"})
            cellTypes.push({value:"histogram", name:"Histogram"})
            cellTypes.push({value:"histodiscrete", name:"Histogram discrete"})
            cellTypes.push({value:"histoclass", name:"Histogram of classes"})
            cellTypes.push({value:"densityCurve", name:"Density Curve"})
            cellTypes.push({value:"density", name:"Density map"})
        }
        if(toAllow.stats){
            cellTypes.push({value:"SPLITTER", name:"SPLITTER"})
            cellTypes.push({value:"errorMass", name:"Error scatter plot"})
            cellTypes.push({value:"histoerror", name:"Histogram of errors"})
            cellTypes.push({value:"henry", name:"Normal probability plot"})
        }
        if(toAllow.comp){
            cellTypes.push({value:"SPLITTER", name:"SPLITTER"})
            cellTypes.push({value:"scatterPCA", name:"PCA variables"})
            cellTypes.push({value:"massPCA", name:"MS PCA contribution"})
            cellTypes.push({value:"samplesPCA", name:"PCA samples"})
        }
        if(toAllow.diff){
            cellTypes.push({value:"SPLITTER", name:"SPLITTER"})
            cellTypes.push({value:"massDifferences", name:"Mass Differences"})
            cellTypes.push({value:"massDifferences_formula", name:"Formula Differences"})
        }
        return cellTypes
    }
    
    /** handles keyboard shortcuts */
    handleKeyboardPress(event){
        if(debug){console.log("button pressed",event)}
        if(event.ctrlKey && event.key =="c"){
            this.eventKeyboard_copy(event)
        }else if(event.key == "Delete"){
            this.eventKeyboard_delete(event)
        }


    }

    /** copy all the data in dataset.dataHighlighted to the clipboard */
    eventKeyboard_copy(event){
        let dataSelected = []
        let headers = []
        this.data.forEach((dataset, index)=>{
            if(!dataset.dataHighlighted){return;}
            //takes the first header
            if(dataset.header && headers.length ==0){headers = dataset.header}
            for(let i=0; i<dataset.dataHighlighted.length; i++){
                dataSelected.push(dataset.dataHighlighted[i])
            }
        })
        copy2DDataSubsetToClipboard(dataSelected, headers)
        //display a temporary box to confirm copying
        var popup = document.getElementById("popup_data_copy")
        let canvasPosition = event.originalTarget.getBoundingClientRect();
        let xPos = canvasPosition.x + canvasPosition.width/2
        let yPos = canvasPosition.y + canvasPosition.height/2
        popup.className = "fade_popup_visible"
        popup.style.top = xPos;
        popup.style.left = yPos;
        setTimeout(() => { 
            popup.className = "fade_popup" 
            popup.style.top= -100
        }, 100);
    }

    /**handles deleting elements from dataset */
    eventKeyboard_delete(){
        new Popup_confirmation("delData","Are you sure you want to delete data ?",()=>{this.deleteHighlightedData()})
    }

    deleteHighlightedData(){
        this.data.forEach((dataset, index)=>{
            let indexList = []
                if(!dataset.dataHighlighted){return;}
                for(let i=dataset.dataHighlighted.length-1; i>=0; i--){
                    indexList.push(dataset.dataHighlighted[i].index)
                }

            if(dataset.dataName.includes("file")){
                let fileNum = dataset.dataName.slice(5)
                let file = files.list[fileNum]
                let data = file.data
                //gets the logging data zone
                var loggingText= ""
                if(document.getElementById("data_log")){
                    loggingText = document.getElementById("data_log").innerHTML
                }
                //logs the number of deleted points
                var loggingNumberDeleted = indexList.length ;
                //loops through the indexes and removes data
                for(let i=data.length-1; i>=0; i--){
                    for(let j=0; j<indexList.length; j++){
                        if(!data[i]){continue;}
                        if(indexList[j] == data[i].index){
                            loggingText = loggingText + "Deleted :  ("+data[i] +")</br>";
                            data.splice(i,1)
                        }
                    }
                }
            }else if(dataset.dataName !=""){
                alertPopup("Alert: you cannot remove data from a matrix or a venn set")
            }
            loggingText = loggingText + "Operation ended. Total deletion : "+ loggingNumberDeleted +" points </br>";
            document.getElementById("data_log").innerHTML = loggingText
        })
        //checks for every data if there was filtered data, and unselects it
        this.data.forEach((item,index)=>{
            if(item.dataFiltered){
                item.dataFiltered = []
            }
            //logs deletion
            if(this.data.file){
                let file = this.data.file
                file.logs.push("Peaks may have been deleted from a canvas selection")
            }
        })
        this.drawAllDatasets()
    }

    /** a function that will loop through all datasets and seek a set of datapoints from mass or formula */
    searchDataPoints_formula(formulaText, repeatUnit){
        //build the list of values if repeat units
        let searchList = [formulaText]
        let repeatFormula = new Molecule(repeatUnit)

        let addFormula = new Molecule(formulaText)
        let subFormula = new Molecule(formulaText)
        if(repeatUnit){
            //add
            for(let i=0; i<50; i++){
                addFormula.addFormula(repeatFormula)
                searchList.push(addFormula.stringify())
            }
            //substract
            for(let i=0; i<50; i++){
                subFormula.removeFormula(repeatFormula)
                console.log(subFormula.stringify())
                searchList.push(subFormula.stringify())
            }
        }
        let matchList = []
        this.data.forEach((dataset)=>{
            let thisMatchList = []
            for(let i=0; i<searchList.length; i++){
                let foundPeaks = dataset.findPeakByFormula(searchList[i], "index")
                thisMatchList = thisMatchList.concat(foundPeaks)
            }
            dataset.pushToHighlight_indexList(thisMatchList)
            matchList = matchList.concat(thisMatchList)
        }) 

        //transform the matchList and highlight
        let max = Math.max(...matchList)
        let newMatchList = new Map()
        for(let i=0; i<matchList.length; i++){newMatchList.set(matchList[i],true)}
        this.cells.forEach((cell)=>{
            if(!cell.brush || !cell.brush.updateFromMap){return;}
            cell.brush.updateFromMap(newMatchList)
        })

    }

    searchDataPoints_mass(searchObject){
        //build the list of values if repeat units
        let searchList = [searchObject.value]
        let mass = parseFloat(searchObject.value)
        let unit = parseFloat(searchObject.repeatUnit)
        if(searchObject.repeatUnit){
            for(let i=1; i<50; i++){
                let minus = mass - i*unit
                let plus = mass + i*unit
                if(minus>0){searchList.push(minus)}
                searchList.push(plus)
            }
        }
        let matchList = []
        this.data.forEach((dataset)=>{
            let thisMatchList = []
            for(let i=0; i<searchList.length; i++){
                let foundPeaks = dataset.findPeakByMass(searchList[i],searchObject.ppmTol, "index")
                thisMatchList = thisMatchList.concat(foundPeaks)
            }
            dataset.pushToHighlight_indexList(thisMatchList)
            matchList = matchList.concat(thisMatchList)
        }) 
        //transform the matchList and highlight
        let max = Math.max(...matchList)
        let newMatchList = new Map()
        for(let i=0; i<matchList.length; i++){newMatchList.set(matchList[i],true)}
        this.cells.forEach((cell)=>{
            if(!cell.brush || !cell.brush.updateFromMap){return;}
            cell.brush.updateFromMap(newMatchList)
        })
    }

    exportCfg(){
        let exp = {}
        exp.cfg =  this.cfg
        exp.cells = []
        this.cells.forEach((cell,index)=>{
            exp.cells[index] = cell.exportCfg()
        })
        exp.data = []
        exp.dataNames = []
        this.data.forEach((data,index)=>{
            exp.data[index] = data.exportCfg()
            exp.dataNames[index] = data.dataName
        })
        return exp
    }

}

/*************************CELLS CLASS ************************************/

class CanvasCell {
    constructor(parent, index) {
        this.height = height
        this.width = width 
        this.canvas = parent
        this.svgSpace = {}
        this.index = index
        /// config 
        this.cfg = new ConfigCell("",this)
        this.cfg.type = null
    }
    /** draw a cell with its axis and scales */
    draw(){
        if(debug){console.log("drawing CanvasCell"+this.index+"from canvas"+this.canvas.letter)}
        //removing old cell
        this.destroy()
        //updating size
        this.height = this.cfg.config.height
        this.width = this.cfg.config.width
        //creating linear scales
        this.scales=[];
        this.scales[0] = d3.scaleLinear().domain([this.cfg.xmin, this.cfg.xmax]).range([0, this.width]);
        this.scales[1]= d3.scaleLinear().domain([this.cfg.ymin, this.cfg.ymax]).range([this.height, 0]);
        //creating new elements
        this.svgSpace = appendCell("#"+this.canvas.html.id,"cell"+this.index,"#cell"+(this.index+1), this.cfg.config)
        this.clipPath = appendClipPath(this.svgSpace, "clipCvs"+this.canvas.letter+"Cell"+this.index, this.cfg.config)
        this.background = appendBackColor(this.svgSpace, 100, this.cfg.config)
        if(!this.cfg || !this.cfg.type){return;}
        appendLine(this.svgSpace, 4, "grey")
        this.drawnData = [] // will be an array of datasets drawn
        //creating axes
        this.axes=[];
        this.axes[0]= appendAxis_x(this.svgSpace, this.scales[0], this.height, this.cfg.xmax, this.cfg.config)
        this.axes[1]= appendAxis_y(this.svgSpace, this.scales[1],  this.cfg.ymax, this.cfg.config)
        if(this.cfg.config.boxBorders){
            this.boxBorders = appendBoxScales(this.svgSpace, this.scales[0], this.scales[1], this.cfg.config)
        }
        //creates the title
        if(this.cfg.config.showTitle){
            this.svgSpace.selectAll("#sampleTitle").remove()
            this.writeTitles()
        }
    }
    destroy(){
         let oldSvg = this.canvas.html.querySelector("#cell"+this.index)
         if(oldSvg){oldSvg.remove()}
    }
    /**
     * a function to update the container of a cell, axis, grids...
     * @param {String} content string text of the update type, example 'x_y_'. 'all' will update everything
     */
    update(content, doNotUpdateDomains){
        if(debug){console.log("updating CanvasCell"+this.index+" from canvas"+this.canvas.letter+"content:"+content)}

        if(content.includes("xtype_") ||content.includes("xmin_")||content.includes("xmax_")|| content.includes("all")){
            //updating the x axis
            if(!doNotUpdateDomains){this.scales[0].domain([this.cfg.xmin, this.cfg.xmax])}
            updateAxisBottom(this.axes[0], this.scales[0], this.cfg.xmax)
        }
        if(content.includes("ytype_") ||content.includes("ymin_")||content.includes("ymax_")|| content.includes("all")){
            //updating the y axis
            if(!doNotUpdateDomains){this.scales[1].domain([this.cfg.ymin, this.cfg.ymax])}
            updateAxisLeft(this.axes[1], this.scales[1], this.cfg.ymax)
        }
    }
    /**draws all linked data */
    drawAllData(){
        if(debug){console.log("drawing all Data from CanvasCell"+this.index+" from canvas"+this.canvas.letter)}
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            if(item.data && item.data.length>0){this.drawData(item, index)}
        })
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset a dataset object
     * @param {Number} index the index to save this dataset to 
     */
    drawData(dataset, index){
        if(debug){console.log("drawing data n°"+index+" on cell n°"+this.index)}
        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = []
        //removes old data
        d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index).remove()
        d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"_filterTitle").remove()
        //remove highlighted overlays (such as histogram bars) if there are
        d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_highlight").remove()
        //creates the title
        if(this.cfg.config.showTitle){
            this.svgSpace.selectAll("#sampleTitle").remove()
            this.writeTitles()
        }
    }

    /**
     * similar to update but for the data points
     * @param {String} content string text of the update type, example 'x_y_'. 'all' will update everything
     */
    updateAllData(content){
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            if(!this.cfg.activeData[index]){return;}
            if(item.data && item.data.length>0){this.updateData(content, index)}
        })
    }
    /**
     * similar to update but for the data points
     * @param {String} content string text of the update type, example 'x_y_'. 'all' will update everything
     */
    updateData(content, index){
        if(debug){console.log("updating data n°"+index)}
    }

    /** default behaviour when being brushed for filtering is to hide unselected dots */
    handleFiltering(indexesList){
        d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"_filterTitle").remove()
        let isTitleDrawn =false;
        if(!this.drawnData){return;}
        let activeData = this.canvas.cfg.interactivity.active
        this.drawnData.forEach((dotsGroup,dataIndex)=>{
            if(activeData !="all" && activeData !=dataIndex){return}
            let dataset = this.canvas.data[dataIndex]
            if(dataset.dataFiltered && dataset.dataFiltered.length>0 && !isTitleDrawn){
                this.drawFiltersTitles();
                isTitleDrawn = true
            }
            if(!dotsGroup || !dotsGroup.style){return;}
            dotsGroup.style("display",(d)=>{
                if(indexesList[d.index] || indexesList.length == 0){
                    return ""
                }else{return "none"}
                })
        })
    }
    
    /**finds min and max values and rescales at these */
    autoscale(){
        if(debug){console.log("autoscaling cell n°"+this.index+" from canvas"+this.canvas.letter)}
        let data = []
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            if( item.data.length >0 && this.cfg.activeData[index] == "1"){//only push the datasets containing data
                data.push(item.data)
            } 
        })
        let x= [this.cfg.xmin, this.cfg.xmax]
        let y= [this.cfg.ymin, this.cfg.ymax]
        let xtype = this.cfg.xtype
        let ytype = this.cfg.ytype
        if(this.cfg.type=="massSpectra"){xtype=config.mz;ytype=config.intensity;}
        if(this.cfg.type=="errorMass"){xtype=config.mz;ytype=config.ppmerror;}
        x = autoAxis(this.scales[0], data, xtype)
        y = autoAxis(this.scales[1], data, ytype)
        this.cfg.xmin = x[0]
        this.cfg.xmax = x[1]
        this.cfg.ymin = y[0]
        this.cfg.ymax = y[1]
        this.draw()
        this.drawAllData()
    }

    createBrush(cellType){
        if(debug){console.log("creating the brushing for cell n°"+this.index)}
        this.brush = new BrushCanvas(this.canvas, this, cellType)
    }
    createBrushFilter(cellType){
        if(debug){console.log("creating the brushing filter for cell n°"+this.index)}
        this.brush = new BrushFilterCanvas(this.canvas, this, cellType)
    }
    drawFiltersTitles(){
        let filters = this.canvas.filters
        if(!filters){return}
        for(let i=0; i<filters.length; i++){
            this.drawFilterTitle(filters[i], i)
        }
    }

    drawFilterTitle(filter, filterIndex){
        if(!this.canvas.cfg.interactivity.showTitleWarning){return;}
        let text = "Filter active"
        if(filter.origin == "histogram"){
            text = "Filter("+filter.origin+" "+filter.type+")["+filter.domain[0].toFixed(1)+","+filter.domain[1].toFixed(1)+"]"
        }else if(filter.origin == "histodiscrete"){
            text = "Filter active ("+filter.type+")"
        }
        
        let title = this.svgSpace.append("g").attr("id","cell"+this.index+"_filterTitle")
        .append("text")
        .attr("x", this.cfg.config.width/2)
        .attr("y", this.cfg.config.legendFontSize*(filterIndex+1)+2*filterIndex)
        .attr("font-size", this.cfg.config.legendFontSize)
        .attr("text-anchor","middle")
        .attr("fill","black")
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .text(text)   
        return title
    }

    /** helper function to write sample names */
    writeTitles(){
    //create the options
    let options = {"positionX":"end","positionY":"top"}
    let cfg = this.cfg
    if(cfg.config.titlePosition == "topLeft" || cfg.config.titlePosition == "bottomLeft"){options.positionX = "start"}
    if(cfg.config.titlePosition == "bottomLeft" || cfg.config.titlePosition == "bottomRight"){options.positionY = "bottom"}
    if(cfg.config.titlePosition == "topMiddle"){options.positionX = "middle"}
    //create cells names
    this.titles = []
    let countSimultaneousTitles = -1
    for(let i=0; i<this.canvas.data.length; i++){
        let dataset = this.canvas.data[i]
        //skips if the data is restricted on only some charts
        if(this.cfg.activeData[i]!="1"){continue;}
        countSimultaneousTitles += 1
        if(dataset.data && dataset.data.length >0){
                options.color = dataset.cfg.colorSolid
                this.titles[i] = appendSampleName(this.svgSpace, getFileNameFromString(dataset.dataName), countSimultaneousTitles, options, this.cfg.config)
            }
        }
    }

    drawColourLegends(onlySolidLegends){
        if(!this.canvas.cfg.cellsElements.colorLegend){return;}
        this.colourLegends = []
        let countSimultaneous = -1
          //remove previous
        if(!this.svgSpace || !this.svgSpace.selectAll){return;}
        this.svgSpace.selectAll("g[name='colorLegend']").remove()
        this.svgSpace.selectAll("g[name='colorLegend']").remove()
        for(let i=0; i<this.canvas.data.length; i++){
            let dataset = this.canvas.data[i]
            //skips if the data is restricted on only some charts
            if(this.cfg.activeData[i]!="1"){continue;}
            if(!dataset.data || dataset.data.length ==0){continue;}
            countSimultaneous += 1
            if(dataset.cfg.colorGradient =="solid" || onlySolidLegends){
                this.colourLegends[i] = createColourLegendSolid(this.svgSpace, dataset.name, dataset.cfg , this.cfg, countSimultaneous)
            }else{
                this.colourLegends[i] = createColourLegend(this.svgSpace, dataset.name, dataset.cfg , this.cfg, countSimultaneous, dataset.colorScale)
            }
        }
    }

    prepareCfg(){
        return []
    }

    addHighlight(){
        this.svgSpace.selectAll("rect[id='highlightRectangle']").remove()
        let margin = this.cfg.config.margin
        let thisWidth = this.cfg.config.width + margin.left + margin.right -10
        let thisHeight = this.cfg.config.height + margin.top + margin.bottom -10
        this.svgSpace.append("rect").attr("id","highlightRectangle")
        .attr("x", -margin.left+5)
        .attr("y", -margin.top+5)
        .attr("width", thisWidth)
        .attr("height",thisHeight)
        .style("stroke-width", "5")
        .style("stroke", "rgb(250, 162, 0)")
        .style("fill","rgb(0,0,0,0)")
        .style("opacity",1)
        .style("stroke-dasharray",10)
        .style("animation","dash 4s linear infinite")
        this.svgSpace.select("rect[id='highlightRectangle']").moveToBack()
    }
    removeHighlight(){
        this.svgSpace.selectAll("rect[id='highlightRectangle']").remove()
    }

    exportCfg(){
        //exporting must avoid cyclic values
        let isDefaultCfg =  (this.cfg.config == config)
        let keysToAvoid = ["cell"]
        if(isDefaultCfg){keysToAvoid.push("config")}
        let exp_cfg = omitKeys(this.cfg, keysToAvoid)
        return exp_cfg
    }
}

class CanvasCell_void extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index)
        this.draw()
    }
}


/************************************************************************************************ */
/*-----------------------------------------SCATTER PLOT-------------------------------------------*/

class CanvasCell_scatterPlot extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index)
        this.cfg.prepareCfg("scatterPlot")
        if(cfg){this.cfg.copyCfg(cfg)}
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = columnNames[this.cfg.ytype]
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);
        if(!this.cfg.config.noGrid){
            this.grids = [];
            this.grids[0] = appendPlotGrid(this.svgSpace, this.scales[0],this.cfg.config.axisLines, "bottom", this.cfg.config);
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines,"side", this.cfg.config);
          }
        //create brushing or filtration
        this.createBrush("scatterPlot")
        this.drawAllData()
        this.drawColourLegends(false)
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index){
        super.drawData(dataset, index)
        if(!this.cfg.activeData[index]){return;}
        if(!this.drawnData){this.drawnData = []}
        //find data 
        let data = dataset.data
        if(dataset.dataFiltered && dataset.dataFiltered.length){data = dataset.dataFiltered}
        //draws data
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => {return this.scales[0](d[this.cfg.xtype]); } ) 
        .attr("cy",  (d) =>{return this.scales[1](d[this.cfg.ytype]); } ) 
        .attr("r",  (d) => {
             if(this.cfg.relativeSize){
                return this.cfg.dotSize*Math.sqrt(d[config.intensity])/config.sizeReductor || 0;
            }else{
                return this.cfg.dotSize || 0
            }})
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .style("fill", (d) => {
            if(dataset.cfg.colorGradient == "solid"){return dataset.colorScale(0)}else{return dataset.colorScale(d[dataset.cfg.colorType])}
        })
        .style("opacity",this.canvas.cfg.opacity)
        .attr('tooltipHTML', (d,n) => {return "scatterPlot"+";"+index+";"+n})
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"scatterPlot",n, this)}  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"scatterPlot",n, this)} );

        if(this.cfg.config.blackCircle){
            this.drawnData[index].style("stroke", this.cfg.config.blackCircleColor || "#000000")
            this.drawnData[index].style("stroke-width", this.cfg.config.blackCircleWidth || 1)
         }
    }
    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = columnNames[this.cfg.ytype]
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels[0].text(axisLabel_x)
        this.axesLabels[1].text(axisLabel_y)
        //TODO :add an update of the brushing
        if(!this.cfg.config.noGrid){
            this.grids[0].call(d3.axisBottom(this.scales[0]).ticks(this.cfg.config.axisLines).tickSize(this.cfg.config.height).tickFormat(""))
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines).tickSize(-this.cfg.config.width).tickFormat(""))
        }
    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        let thisData = this.drawnData[dataNum]
        if(!thisData){return;}
        if(content.includes("xtype_") || content.includes("xmin_") || content.includes("xmax_")|| content.includes("all")){
            thisData.attr("cx", (d) => { return this.scales[0](d[this.cfg.xtype]); } ) 
        }if(content.includes("ytype_") || content.includes("ymax_")|| content.includes("ymin_")|| content.includes("all")){
            thisData.attr("cy", (d) => { return this.scales[1](d[this.cfg.ytype]); } ) 
        }if(content.includes("dotSize_")||content.includes("relativeSize_")|| content.includes("all")){
            thisData.attr("r", (d) => {
                if(this.cfg.relativeSize){
                    return this.cfg.dotSize*Math.sqrt(d[config.intensity])/config.sizeReductor;
                }
                    else{
                        return this.cfg.dotSize
                    }
            });
        }
        if(content.includes("opacity_")|| content.includes("all")){
            thisData.style("opacity", this.canvas.cfg.opacity)
        }
    }
    prepareCfg(){
        let properties = [
            {key:"xtype",type:"number",default:0},
            {key:"ytype",type:"number",default:0},
            {key:"dotSize",type:"number",default:1},
            {key:"relativeSize",type:"checkbox",default:false}
        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xtype",type:"selectCols",value:this.cfg.xtype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ytype",type:"selectCols",value:this.cfg.ytype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Dot size",
            "inputs":[
                {key:"relativeSize",type:"checkbox",value:this.cfg.relativeSize,title: "Check this to have points area related to their intensity",update:(d)=>{this.cfg.update(d)}},
                {key:"dotSize",type:"number",value:this.cfg.dotSize,title: "Size of dots",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        return varsArray
    }

}

/************************************************************************************************ */
/*-----------------------------------------SCATTER 3D---------------------------------------------*/
class CanvasCell_scatter3D extends  CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index)
        this.cfg.prepareCfg("scatter3D")
        if(cfg){this.cfg.copyCfg(cfg)}
        this.draw()
    }

    /**draw the plot */
    draw(){
        if(debug){console.log("drawing non-default CanvasCell"+this.index+" from canvas"+this.canvas.letter)}
        //removing old cell
        this.destroy()
        //creating new elements
        this.svgSpace = appendCell("#"+this.canvas.html.id,"cell"+this.index,"#cell"+(this.index+1), this.cfg.config)
        this.clipPath = appendClipPath(this.svgSpace, "clipCvs"+this.canvas.letter+"Cell"+this.index, this.cfg.config)
        this.background = appendBackColor(this.svgSpace,100, this.cfg.config)
        this.scales3D = [];
        this.scales3D[0] = d3.scaleLinear().domain([this.cfg.xmin, this.cfg.xmax]).range([-5, 5]);
        this.scales3D[1]= d3.scaleLinear().domain([this.cfg.ymin, this.cfg.ymax]).range([-5, 5]);
        this.scales3D[2]= d3.scaleLinear().domain([this.cfg.zmin, this.cfg.zmax]).range([-5, 5]);
        this.axes3D = [];
        this.space3D = new Space3d(this, this.cfg)
        this.createBrush("passive")

    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index){
        if(!this.svgSpace || !this.svgSpace.selectAll){return;}
        this.svgSpace.selectAll("circle.dotsDataNum"+index).remove()
        if(!this.cfg.activeData[index]){return;}
        if(! this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.space3D.create3dData(dataset,index)
        if(this.cfg.config.blackCircle){
            this.drawnData[index].style("stroke", this.cfg.config.blackCircleColor || "#000000")
            this.drawnData[index].style("stroke-width", this.cfg.config.blackCircleWidth || 1)
         }
    }
    update(content, doNotUpdateDomains){
        if(content.includes("xtype_") ||content.includes("xmin_")||content.includes("xmax_")|| content.includes("all")){
            if(!doNotUpdateDomains){this.scales3D[0].domain([this.cfg.xmin, this.cfg.xmax])}
            this.space3D = new Space3d(this, this.cfg)
            return;
        }
        if(content.includes("ytype_") ||content.includes("ymin_")||content.includes("ymax_")|| content.includes("all")){
            if(!doNotUpdateDomains){this.scales3D[1].domain([this.cfg.ymin, this.cfg.ymax])}
            this.space3D = new Space3d(this, this.cfg)
            return;
        }
        if(content.includes("ztype_") ||content.includes("zmin_")||content.includes("zmax_")|| content.includes("all")){
            if(!doNotUpdateDomains){this.scales3D[2].domain([this.cfg.zmin, this.cfg.zmax])}
            this.space3D = new Space3d(this, this.cfg)
            return;
        }
        if(content.includes("scale3d_") ||content.includes("origin3dX_") ||content.includes("origin3dY_") || content.includes("showAxisValues3d_")||  content.includes("showAxisNames3d_")|| content.includes("showAnglesValues3d_")){
            this.space3D = new Space3d(this, this.cfg)
            return;
        }

        this.space3D.cleanup()
        this.space3D.startup()

    }

    updateData(content, dataNum){
        let thisData = this.canvas.data[dataNum]
        if(!thisData){return;}
        if(! this.drawnData){this.drawnData = []}
        this.drawnData[dataNum] = this.space3D.create3dData(thisData,dataNum)
        if(content.includes("opacity_")|| content.includes("all")){
            this.drawnData[dataNum].style("opacity", this.canvas.cfg.opacity)
        }
    }

    prepareCfg(){
        let properties = [
            {key:"xtype",type:"number",default:0},
            {key:"ytype",type:"number",default:0},
            {key:"ztype",type:"number",default:0},
            {key:"zmin",type:"number",default:0},
            {key:"zmax",type:"number",default:1},
            {key:"dotSize",type:"number",default:1},
            {key:"relativeSize",type:"checkbox",default:false},
            {key:"origin3dX",type:"number",default:200},
            {key:"origin3dY",type:"number",default:300},
            {key:"scale3d",type:"number",default:25},
            {key:"showAnglesValues3d",type:"checkbox",default:true},
            {key:"showAxisNames3d",type:"checkbox",default:true},
            {key:"showAxisValues3d",type:"checkbox",default:true},
            {key:"colored3dAxis",type:"checkbox",default:true},
            {key:"showPlanes3d",type:"select",default:"all"},
        ]
        return properties
    }

    /**replaces the default autoscale: no autoscale*/
    autoscale(){}

    preparePopupCfg(){
        let varsArray = []
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xtype",type:"selectCols",value:this.cfg.xtype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmin,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ytype",type:"selectCols",value:this.cfg.ytype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({ "name":"z",
            "inputs":[
                {key:"ztype",type:"selectCols",value:this.cfg.ztype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"zmin",type:"number",value:this.cfg.zmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"zmax",type:"number",value:this.cfg.zmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Dot size",
            "inputs":[
                {key:"relativeSize",type:"checkbox",value:this.cfg.relativeSize,title: "Check this to have points area related to their intensity",update:(d)=>{this.cfg.update(d)}},
                {key:"dotSize",type:"number",value:this.cfg.dotSize,title: "Size of dots",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"-------","inputs":[]})
        varsArray.push({"name":"3d scaling",
            "inputs":[{key:"scale3d",type:"number",value:this.cfg.scale3d,title:"The scale (zoom) of the whole chart",update:(d)=>{this.cfg.update(d)}}]
        })
        varsArray.push({"name":"Chart origin",
            "inputs":[{key:"origin3dX",type:"number",value:this.cfg.origin3dX,title:"X coordinate of the chart center",update:(d)=>{this.cfg.update(d)}},
                {key:"origin3dY",type:"number",value:this.cfg.origin3dY,title:"Y coordinate of the chart center",update:(d)=>{this.cfg.update(d)}}]
        })
        varsArray.push({"name":"Colorful chart",
            "inputs":[{key:"colored3dAxis",type:"checkbox",value:this.cfg.colored3dAxis,title:"To color the axis and the planes",update:(d)=>{this.cfg.update(d)}}]
        })
        varsArray.push({"name":"Show axis values",
            "inputs":[{key:"showAxisValues3d",type:"checkbox",value:this.cfg.showAxisValues3d,title:"Show values on ticks on the axis",update:(d)=>{this.cfg.update(d)}}]
        })
        varsArray.push({"name":"Show axis names",
            "inputs":[{key:"showAxisNames3d",type:"checkbox",value:this.cfg.showAxisNames3d,title:"Show the names of the axis",update:(d)=>{this.cfg.update(d)}}]
        })
        varsArray.push({"name":"Show angle",
            "inputs":[{key:"showAnglesValues3d",type:"checkbox",value:this.cfg.showAnglesValues3d,title:"Show angle values",update:(d)=>{this.cfg.update(d)}}]
        })
        let planesOptions = [{name:"None",value:"none"},{name:"XY",value:"XY"},{name:"XZ",value:"XZ"},{name:"YZ",value:"YZ"},{name:"All 3",value:"all"}]
        varsArray.push({"name":"Show planes",
            "inputs":[{key:"showPlanes3d",type:"select",value:this.cfg.showPlanes3d,title:"Which plane(s) to show on the chart",update:(d)=>{this.cfg.update(d)},options:planesOptions}]
        })
        return varsArray
    }

}
/************************************************************************************************ */
/*-----------------------------------------MASS SPECTRA-------------------------------------------*/
class CanvasCell_massSpectra extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index)
        this.cfg.prepareCfg("massSpectra")
        if(cfg){this.cfg.copyCfg(cfg)}
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = columnNames[config.mz]
        let axisLabel_y = columnNames[config.intensity]
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        else if(this.cfg.ytype == "relative"){ axisLabel_y = "%"}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);

        if(!this.cfg.config.noGrid){
            this.grids = [];
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines,"side", this.cfg.config);
          }
        //create brushing or filtration
        this.createBrush("massSpectra")
        this.drawAllData()
        this.drawColourLegends(this.cfg.forceSolidColor)
    }
    drawData(dataset, index){
        super.drawData(dataset, index)
        if(!this.cfg.activeData[index]){return;}
        let ytype = this.cfg.ytype

        let maxInt = this.canvas.findMaxIntofCell(false, this.index)
        //find data 
        let data = dataset.data
        if(dataset.dataFiltered && dataset.dataFiltered.length){data = dataset.dataFiltered}

        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x",  (d) => { return this.scales[0](d[config.mz]); } ) 
        .attr("y",  (d) =>  { 
            if(ytype == "relative"){
                return this.scales[1](100*d[config.intensity]/maxInt) ||0
            }else{
                return this.scales[1](d[config.intensity]) ||0
            }}) 
        .attr("width",1)
        .attr("height", (d) => { 
            if(ytype == "relative"){
                return this.cfg.config.height - this.scales[1](100*d[config.intensity]/maxInt) ||0
            }else{
                return this.cfg.config.height - this.scales[1](d[config.intensity]) ||0
            }
        })
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .style("fill", (d) => {
            if(this.cfg.forceSolidColor){
                return dataset.cfg.colorSolid
            }else if(dataset.cfg.colorGradient == "solid"){
                return dataset.colorScale(0)
            }else{
                return dataset.colorScale(d[dataset.cfg.colorType])
            }
        })
        .style("opacity",this.canvas.cfg.opacity)
        .attr('tooltipHTML', (d,n) => {return "massSpectra"+";"+index+";"+n})
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"massSpectra",n, this)}  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"massSpectra",n, this)} );
    }
    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[config.mz]
        let axisLabel_y = columnNames[config.intensity]
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        else if(this.cfg.ytype == "relative"){axisLabel_y = "%"}
        this.axesLabels[0].text(axisLabel_x)
        this.axesLabels[1].text(axisLabel_y)
        //TODO :add an update of the brushing
        if(!this.cfg.config.nogrid){
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines).tickSize(-this.cfg.config.width).tickFormat(""))
        }
    }
    
    updateData(content, dataNum){
        super.updateData(content, dataNum)
        let ytype = this.cfg.ytype
        let thisData = this.drawnData[dataNum]
        let maxInt = this.canvas.findMaxInt(false)
        if(!thisData){return;}
        if(content.includes("xmin_")|| content.includes("xmax_")|| content.includes("all")){
            thisData.attr("x",  (d) => { return this.scales[0](d[config.mz]); } ) 
        }if(content.includes("ytype_")||content.includes("ymin_")|| content.includes("ymax_")|| content.includes("all")){
            thisData.attr("y",  (d) =>  { 
                if(ytype == "relative"){
                    return this.scales[1](100*d[config.intensity]/maxInt)
                }else{
                    return this.scales[1](d[config.intensity]);
                }}) 
            thisData.attr("height", (d) => { 
                if(ytype == "relative"){
                    return this.cfg.config.height - this.scales[1](100*d[config.intensity]/maxInt)
                }else{
                    return this.cfg.config.height - this.scales[1](d[config.intensity]);
                }
            })
        }
        if(content.includes("opacity_")|| content.includes("all")){
            thisData.style("opacity", this.canvas.cfg.opacity)
        }
        if(content.includes("forceSolidColor")){
            thisData.style("fill", (d) => {
                if(this.cfg.forceSolidColor){
                    return this.canvas.data[dataNum].cfg.colorSolid
                }else if(this.canvas.data[dataNum].cfg.colorGradient == "solid"){
                    return this.canvas.data[dataNum].colorScale(0)
                }else{
                    return this.canvas.data[dataNum].colorScale(d[this.canvas.data[dataNum].cfg.colorType])
                }
            })
            this.drawColourLegends(this.cfg.forceSolidColor)
        }
    }

    autoscale(){
        super.autoscale()
        if(this.cfg.ymin<0){this.cfg.ymin = 0}
        if(this.cfg.ytype == "relative"){ this.cfg.ymax = 100}
        this.draw()
        this.drawAllData()
    }

    prepareCfg(){
        let properties = [
            {key:"ytype",type:"select",default:"absolute"},
            {key:"forceSolidColor",type:"checkbox",default:false},
        ]
        return properties
    }

    
    preparePopupCfg(){
        let varsArray = []
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let ytypeOptions = [{name:"Absolute intensity",value:"absolute"},{name:"Relative intensity",value:"relative"}]
        varsArray.push({ "name":"y",
            "inputs":[
                {key:"ytype",type:"select",value:this.cfg.ytype,title: "Absolute or relative intensity",options:ytypeOptions,update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({ "name":"Force solid color",
            "inputs":[
                {key:"forceSolidColor",type:"checkbox",value:this.cfg.forceSolidColor,title: "Check to force a solid color on this mass spectra",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        return varsArray
    }

}

/************************************************************************************************ */
/*-----------------------------------------KENDRICK MAPS-------------------------------------------*/

class CanvasCell_kendrick extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index, cfg)
        this.cfg.prepareCfg("kendrick")
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = columnNames[config.mz]
        let axisLabel_y = "KMD("+this.cfg.kendrickFormula+")"
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        else if(this.cfg && this.cfg.xtype =="nkm"){axisLabel_x = "NKM"}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        else if(this.cfg.textKFM){axisLabel_y = "KFM("+this.cfg.kendrickFormula+")"}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);
        if(!this.cfg.config.nogrid){
            this.grids = [];
            this.grids[0] = appendPlotGrid(this.svgSpace, this.scales[0],this.cfg.config.axisLines, "bottom", this.cfg.config);
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines*2,"side", this.cfg.config);
          }
        //create brushing or filtration
        this.createBrush("kendrick")
        this.drawAllData()
        this.drawColourLegends(false)
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index){
        let kendrick = dataset.calculateKM(this.cfg.kendrickFormula, this.cfg.kendrickMass, this.cfg.yround, this.cfg.kendrickDivisor)

        super.drawData(dataset, index)
        if(!this.cfg.activeData[index]){return;}
        if(!this.drawnData){this.drawnData = []}

        //find data 
        let data = dataset.data
        if(dataset.dataFiltered && dataset.dataFiltered.length){data = dataset.dataFiltered}

        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d,n) => {
            if(this.cfg.xtype == "nkm"){
                this.scales[0](Math.round(kendrick.masses[n]));
            }else{
                return this.scales[0](d[config.mz]);
            }} ) 
        .attr("cy",  (d,n) =>{ return this.scales[1](kendrick.defects[n]); } ) 
        .attr("r",  (d) => {
             if(this.cfg.relativeSize){
                return this.cfg.dotSize*Math.sqrt(d[config.intensity])/config.sizeReductor||0;
            }else{
                return this.cfg.dotSize
            }})
        .style("opacity",this.canvas.cfg.opacity)
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .style("fill", (d) => {
            if(dataset.cfg.colorGradient == "solid"){return dataset.colorScale(0)}else{return dataset.colorScale(d[dataset.cfg.colorType])}
        })
        .attr('tooltipHTML', (d,n) => {return "kendrick"+";"+index+";"+n})
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"kendrick",n, this)}  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"kendrick",n, this)} );

        if(this.cfg.config.blackCircle){
            this.drawnData[index].style("stroke", this.cfg.config.blackCircleColor || "#000000")
            this.drawnData[index].style("stroke-width", this.cfg.config.blackCircleWidth || 1)
         }
    }

    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[config.mz]
        let axisLabel_y = "KMD("+this.cfg.kendrickFormula+")"
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        else if(this.cfg && this.cfg.xtype =="nkm"){axisLabel_x = "NKM"}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        else if(this.cfg.textKFM){axisLabel_y = "KFM("+this.cfg.kendrickFormula+")"}
        this.axesLabels[0].text(axisLabel_x)
        this.axesLabels[1].text(axisLabel_y)
        //TODO :add an update of the brushing
        if(!this.cfg.config.nogrid){
            this.grids[0].call(d3.axisBottom(this.scales[0]).ticks(this.cfg.config.axisLines).tickSize(this.cfg.config.height).tickFormat(""))
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines*2).tickSize(-this.cfg.config.width).tickFormat(""))
        }
        //when there is a config update of kendrick name, recomputation of mass may be needed
        if(content.includes("kendrick")){
            let method = this.cfg.kendrickMethod
            if(method == "formula" && (content.includes("kendrickFormula_")|| content.includes("kendrickMethod_"))){
                let kuFormula = new ChemFormula(this.cfg.kendrickFormula)
                this.cfg.kendrickMass = kuFormula.mass
            }if(method == "list" && (content.includes("kendrickChoice_")|| content.includes("kendrickMethod_"))){
                this.cfg.kendrickFormula = this.cfg.kendrickChoice
                let kuFormula = new ChemFormula(this.cfg.kendrickFormula)
                this.cfg.kendrickMass = kuFormula.mass
            }
        }


    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        let thisData = this.drawnData[dataNum]
        if(!thisData){return;}
        if(content.includes("xtype_") || content.includes("xmin_") || content.includes("xmax_")|| content.includes("all")){
            if(this.cfg.xtype =="nkm"){
                let kendrick = this.canvas.data[dataNum].calculateKM(this.cfg.kendrickFormula, this.cfg.kendrickMass, this.cfg.yround, this.cfg.kendrickDivisor)
                thisData.attr("cx", (d,n) => { return this.scales[0](Math.round(kendrick.masses[n]));} ) 
            }else{
                thisData.attr("cx", (d) => { return this.scales[0](d[config.mz]);} ) 
            }
        }if(content.includes("kendrick") || content.includes("yround_")|| content.includes("ymax_")|| content.includes("ymin_")|| content.includes("all")){
            let kendrick = this.canvas.data[dataNum].calculateKM(this.cfg.kendrickFormula, this.cfg.kendrickMass, this.cfg.yround, this.cfg.kendrickDivisor)
            thisData.attr("cy", (d,n) => { return this.scales[1](kendrick.defects[n]); } ) 
        }if(content.includes("dotSize_")||content.includes("relativeSize_")|| content.includes("all")){
            thisData.attr("r", (d) => {
                if(this.cfg.relativeSize){
                    return this.cfg.dotSize*Math.sqrt(d[config.intensity])/config.sizeReductor;
                }else{
                        return this.cfg.dotSize
                }
            });
        }
        if(content.includes("opacity_") ||content.includes("all")){
            thisData.style("opacity", this.canvas.cfg.opacity)
        }
    }

    /**Replace default autoscale */
    autoscale(){
        if(debug){console.log("autoscaling cell n°"+this.index+" from canvas"+this.canvas.letter)}
        let dataX = []
        let dataY = []
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            if(item.data.length>0 && this.cfg.activeData[index] == "1"){
                dataX.push(item.data)
            }
            let thisKM = item.findKM(this.cfg.kendrickFormula, this.cfg.kendrickMass)
            if( thisKM && thisKM.masses && thisKM.masses.length >0 && this.cfg.activeData[index] == "1"){//only push the datasets containing data
                dataY.push(thisKM.defects)
            } 
        })
        let x= [this.cfg.xmin, this.cfg.xmax]
        x = autoAxis(this.scales[0], dataX, config.mz)
        this.cfg.xmin = x[0]
        this.cfg.xmax = x[1]
        let genMin = 0
        let genMax = 0
        dataY.forEach((set)=>{
            let localMin = set[0] || set[1]
            let localMax = set[0] || set[1]
            set.forEach((value)=>{
                if(value<localMin){localMin = value}
                else if(value>localMax){localMax = value}
            })
            genMin = Math.min(genMin, localMin)
            genMax = Math.max(genMax, localMax)
        })
        this.cfg.ymin = 0.1*Math.floor(genMin*10)-0.1
        this.cfg.ymax = 0.1*Math.ceil(genMax*10)+0.1
        this.draw()
        this.drawAllData()
    }

    prepareCfg(){
        let properties = [
            {key:"xtype",type:"text",default:"m/z"},
            {key:"yround",type:"text",default:"round"},
            {key:"dotSize",type:"number",default:1},
            {key:"relativeSize",type:"checkbox",default:false},
            {key:"kendrickChoice",type:"select",default:"CH2"},
            {key:"kendrickFormula",type:"text",default:"CH2"},
            {key:"kendrickMass",type:"number",default:14.0156501},
            {key:"kendrickMethod",type:"radio",default:"list"},
            {key:"kendrickDivisor",type:"number",default:1},
            {key:"textKFM",type:"checkbox",default:false},
        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        let optionsX = [{"name":"m/z","value":"m/z"},{"name":"NKM","value":"nkm"}]
        let optionsY = [{"name":"Round","value":"round"},{"name":"Round up(ceiling)","value":"ceiling"},{"name":"Round down(floor)","value":"floor"}]
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xtype",type:"select",value:this.cfg.xtype,title:"Choose whether the x axis is m/z or Nominal Kendrick Mass (NKM)",options:optionsX,update:(d)=>{this.cfg.update(d)}},
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y round",
            "inputs":[
                {key:"yround",type:"select",value:this.cfg.yround,title:"Choose how to round the kendrick masses",options:optionsY,update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Dot size",
            "inputs":[
                {key:"relativeSize",type:"checkbox",value:this.cfg.relativeSize,title: "Check this to have points area related to their intensity",update:(d)=>{this.cfg.update(d)}},
                {key:"dotSize",type:"number",value:this.cfg.dotSize,title: "Size of dots",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"------------","inputs":[]})
        varsArray.push({"name":"Unit list",
            "inputs":[
                {key:"kendrickMethod",type:"radio",value:"list",title: "Check this to choose the unit on the list and affect name and mass",options:{"radioCheck":this.cfg.kendrickMethod},update:(d,p)=>{this.cfg.update(d,p)}},
                {key:"kendrickChoice",type:"select",value:this.cfg.kendrickChoice,title: "Choose a predetermined repeat unit",options:kendrickmasslist,update:(d,p)=>{this.cfg.update(d,p)}},
            ]
        })
        varsArray.push({"name":"Unit name",
            "inputs":[
                {key:"kendrickMethod",type:"radio",value:"formula",title: "Check this to modify the formula and affect the mass",options:{"radioCheck":this.cfg.kendrickMethod},update:(d,p)=>{this.cfg.update(d,p)}},
                {key:"kendrickFormula",type:"text",value:this.cfg.kendrickFormula,title: "The chemical formula/name of the repeat unit",update:(d,p)=>{this.cfg.update(d,p)}},

            ]
        })
        varsArray.push({"name":"Unit mass",
            "inputs":[
                {key:"kendrickMethod",type:"radio",value:"mz",title: "Check this to  only modify the mass of the unit",options:{"radioCheck":this.cfg.kendrickMethod},update:(d,p)=>{this.cfg.update(d,p)}},
                {key:"kendrickMass",type:"number",value:this.cfg.kendrickMass,title: "The mass of the repeat unit",options:[{"isStyle":true,"key":"width","value":150}],update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Divisor",
            "inputs":[
                {key:"kendrickDivisor",type:"number",value:this.cfg.kendrickDivisor,title: "The divisor applied to the kendrick mass",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"------------","inputs":[]})
        varsArray.push({"name":"Replace 'KMD' by 'KFM'","inputs":[
            {key:"textKFM",type:"checkbox",value:this.cfg.textKFM,title: "Check this to replace all mentions of 'KMD' on this chart by 'KMF'",update:(d)=>{this.cfg.update(d)}},
        ]})
        return varsArray
    }
}

/************************************************************************************************ */
/*-----------------------------------------KENDRICK 2D -------------------------------------------*/

class CanvasCell_kendrick2D extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index, cfg)
        this.cfg.prepareCfg("kendrick2D")
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = "KMD 1 :"+this.cfg.kendrickFormula
        let axisLabel_y = "KMD 2 :"+this.cfg.kendrickFormula2
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        else if(this.cfg.textKFM){axisLabel_x = "KFM 1 :"+this.cfg.kendrickFormula}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        else if(this.cfg.textKFM){axisLabel_y = "KFM 2 :"+this.cfg.kendrickFormula2}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace,axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace,axisLabel_y,axisOptions, this.cfg.config);
        if(!this.cfg.config.nogrid){
            this.grids = [];
            this.grids[0] = appendPlotGrid(this.svgSpace, this.scales[0],this.cfg.config.axisLines*2, "bottom", this.cfg.config);
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines*2,"side", this.cfg.config);
          }
        //create brushing or filtration
        this.createBrush("kendrick2D")
        this.drawAllData()
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index){
        let formulas = [this.cfg.kendrickFormula, this.cfg.kendrickFormula2]
        let masses = [this.cfg.kendrickMass, this.cfg.kendrickMass2]
        let kendrick2D = dataset.calculateKM2D(formulas, masses, this.cfg.yround, this.cfg.kendrickDivisor)

        super.drawData(dataset, index)
        if(!this.cfg.activeData[index]){return;}
        if(!this.drawnData){this.drawnData = []}

         //find data 
         let data = dataset.data
         if(dataset.dataFiltered && dataset.dataFiltered.length){data = dataset.dataFiltered}

        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d,n) => {return this.scales[0](kendrick2D.defects1[n]);} ) 
        .attr("cy",  (d,n) =>{ return this.scales[1](kendrick2D.defects2[n]); } ) 
        .attr("r",  (d) => {
             if(this.cfg.relativeSize){
                return this.cfg.dotSize*Math.sqrt(d[config.intensity])/config.sizeReductor||0;
            }else{
                return this.cfg.dotSize
            }})
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .style("fill", (d) => {
            if(dataset.cfg.colorGradient == "solid"){return dataset.colorScale(0)}else{return dataset.colorScale(d[dataset.cfg.colorType])}
        })
        .style("opacity",this.canvas.cfg.opacity)
        .attr('tooltipHTML', (d,n) => {return "kendrick2D"+";"+index+";"+n})
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"kendrick2D",n, this)}  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"kendrick2D",n, this)} );

        if(this.cfg.config.blackCircle){
            this.drawnData[index].style("stroke", this.cfg.config.blackCircleColor || "#000000")
            this.drawnData[index].style("stroke-width", this.cfg.config.blackCircleWidth || 1)
         }
    }

    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = "KMD 1 :"+this.cfg.kendrickFormula
        let axisLabel_y = "KMD 2 :"+this.cfg.kendrickFormula2
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        else if(this.cfg.textKFM){axisLabel_x = "KFM 1 :"+this.cfg.kendrickFormula}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        else if(this.cfg.textKFM){axisLabel_y = "KFM 2 :"+this.cfg.kendrickFormula2}
        this.axesLabels[0].text(axisLabel_x)
        this.axesLabels[1].text(axisLabel_y)

        //TODO :add an update of the brushing
        if(!this.cfg.config.nogrid){
            this.grids[0].call(d3.axisBottom(this.scales[0]).ticks(this.cfg.config.axisLines*2).tickSize(this.cfg.config.height).tickFormat(""))
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines*2).tickSize(-this.cfg.config.width).tickFormat(""))
        }
        //when there is a config update of kendrick name, recomputation of mass may be needed
        if(content.includes("kendrick")){
            let method = this.cfg.kendrickMethod
            if(method == "formula" && (content.includes("kendrickFormula_")|| content.includes("kendrickMethod_"))){
                let kuFormula = new ChemFormula(this.cfg.kendrickFormula)
                this.cfg.kendrickMass = kuFormula.mass
            }if(method == "list" && (content.includes("kendrickChoice_")|| content.includes("kendrickMethod_"))){
                this.cfg.kendrickFormula = this.cfg.kendrickChoice
                let kuFormula = new ChemFormula(this.cfg.kendrickFormula)
                this.cfg.kendrickMass = kuFormula.mass
            }
            let method2 = this.cfg.kendrickMethod2
            if(method2 == "formula" && (content.includes("kendrickFormula2_")|| content.includes("kendrickMethod2_"))){
                let kuFormula2 = new ChemFormula(this.cfg.kendrickFormula2)
                this.cfg.kendrickMass2 = kuFormula2.mass
            }if(method2 == "list" && (content.includes("kendrickChoice2_")|| content.includes("kendrickMethod2_"))){
                this.cfg.kendrickFormula2 = this.cfg.kendrickChoice2
                let kuFormula2 = new ChemFormula(this.cfg.kendrickFormula2)
                this.cfg.kendrickMass2 = kuFormula2.mass
            }
        }
    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        let thisData = this.drawnData[dataNum]
        if(!thisData){return;}
        if(content.includes("kendrick") || content.includes("xmin_") || content.includes("xmax_")|| content.includes("all")){
            let formulas = [this.cfg.kendrickFormula, this.cfg.kendrickFormula2]
            let masses = [this.cfg.kendrickMass, this.cfg.kendrickMass2]
            let kendrick2D = this.canvas.data[dataNum].calculateKM2D(formulas, masses, this.cfg.yround, this.cfg.kendrickDivisor)
            thisData.attr("cx", (d,n) => { return this.scales[0](kendrick2D.defects1[n]); } ) 
            thisData.attr("cy", (d,n) => { return this.scales[1](kendrick2D.defects2[n]); } ) 
        }if(content.includes("kendrick") || content.includes("yround_")|| content.includes("ymax_")|| content.includes("ymin_")|| content.includes("all")){
            let formulas = [this.cfg.kendrickFormula, this.cfg.kendrickFormula2]
            let masses = [this.cfg.kendrickMass, this.cfg.kendrickMass2]
            let kendrick2D = this.canvas.data[dataNum].calculateKM2D(formulas, masses, this.cfg.yround, this.cfg.kendrickDivisor)
            thisData.attr("cx", (d,n) => { return this.scales[0](kendrick2D.defects1[n]); } ) 
            thisData.attr("cy", (d,n) => { return this.scales[1](kendrick2D.defects2[n]); } ) 
        }if(content.includes("dotSize_")||content.includes("relativeSize_")|| content.includes("all")){
            thisData.attr("r", (d) => {
                if(this.cfg.relativeSize){
                    return this.cfg.dotSize*Math.sqrt(d[config.intensity])/config.sizeReductor;
                }else{
                        return this.cfg.dotSize
                }
            });
        }
        if(content.includes("opacity_") ||content.includes("all")){
            thisData.style("opacity", this.canvas.cfg.opacity)
        }
    }

    /**Replace default autoscale */
    autoscale(){
        if(debug){console.log("autoscaling cell n°"+this.index+" from canvas"+this.canvas.letter)}
        let dataX = []
        let dataY = []
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            let thisKM = item.findKM2D([this.cfg.kendrickFormula, this.cfg.kendrickFormula2])
            if( thisKM && thisKM.defects1 && thisKM.defects1.length >0 && this.cfg.activeData[index] == "1"){//only push the datasets containing data
                dataX.push(thisKM.defects1)
                dataY.push(thisKM.defects2)
            } 
        })

        let genXMin = 0
        let genXMax = 0
        dataX.forEach((set)=>{
            let localMin = set[0] || set[1]
            let localMax = set[0] || set[1]
            set.forEach((value)=>{
                if(value<localMin){localMin = value}
                else if(value>localMax){localMax = value}
            })
            genXMin = Math.min(genXMin, localMin)
            genXMax = Math.max(genXMax, localMax)
        })
        this.cfg.xmin = 0.1*Math.floor(10*genXMin)-0.1
        this.cfg.xmax = 0.1*Math.ceil(10*genXMax)+0.1
        let genYMin = 0
        let genYMax = 0
        dataY.forEach((set)=>{
            let localMin = set[0] || set[1]
            let localMax = set[0] || set[1]
            set.forEach((value)=>{
                if(value<localMin){localMin = value}
                else if(value>localMax){localMax = value}
            })
            genYMin = Math.min(genYMin, localMin)
            genYMax = Math.max(genYMax, localMax)
        })
        this.cfg.ymin = 0.1*Math.floor(genYMin*10)-0.1
        this.cfg.ymax = 0.1*Math.ceil(genYMax*10)+0.1
        this.draw()
        this.drawAllData()
    }

    prepareCfg(){
        let properties = [
            {key:"yround",type:"text",default:"round"},
            {key:"dotSize",type:"number",default:1},
            {key:"relativeSize",type:"checkbox",default:false},
            {key:"kendrickChoice",type:"select",default:"CH2"},
            {key:"kendrickFormula",type:"text",default:"CH2"},
            {key:"kendrickMass",type:"number",default:14.0156501},
            {key:"kendrickMethod",type:"radio",default:"list"},
            {key:"kendrickChoice2",type:"select",default:"C4H6"},
            {key:"kendrickFormula2",type:"text",default:"C4H6"},
            {key:"kendrickMass2",type:"number",default:54.04695},
            {key:"kendrickMethod2",type:"radio",default:"list"},
            {key:"kendrickDivisor",type:"number",default:1},
            {key:"textKFM",type:"checkbox",default:false},
        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        let optionsY = [{"name":"Round","value":"round"},{"name":"Round up(ceiling)","value":"ceiling"},{"name":"Round down(floor)","value":"floor"}]
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y round",
            "inputs":[
                {key:"yround",type:"select",value:this.cfg.yround,title:"Choose how to round the kendrick masses",options:optionsY,update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Dot size",
            "inputs":[
                {key:"relativeSize",type:"checkbox",value:this.cfg.relativeSize,title: "Check this to have points area related to their intensity",update:(d)=>{this.cfg.update(d)}},
                {key:"dotSize",type:"number",value:this.cfg.dotSize,title: "Size of dots",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"------------","inputs":[]})
        varsArray.push({"name":"Unit list",
            "inputs":[
                {key:"kendrickMethod",type:"radio",value:"list",title: "Check this to choose the unit on the list and affect name and mass",options:{"radioCheck":this.cfg.kendrickMethod},update:(d,p)=>{this.cfg.update(d,p)}},
                {key:"kendrickChoice",type:"select",value:this.cfg.kendrickChoice,title: "Choose a predetermined repeat unit",options:kendrickmasslist,update:(d,p)=>{this.cfg.update(d,p)}},
            ]
        })
        varsArray.push({"name":"Unit name",
            "inputs":[
                {key:"kendrickMethod",type:"radio",value:"formula",title: "Check this to modify the formula and affect the mass",options:{"radioCheck":this.cfg.kendrickMethod},update:(d,p)=>{this.cfg.update(d,p)}},
                {key:"kendrickFormula",type:"text",value:this.cfg.kendrickFormula,title: "The chemical formula/name of the first repeat unit",update:(d,p)=>{this.cfg.update(d,p)}},

            ]
        })
        varsArray.push({"name":"Unit mass",
            "inputs":[
                {key:"kendrickMethod",type:"radio",value:"mz",title: "Check this to  only modify the mass of the unit",options:{"radioCheck":this.cfg.kendrickMethod},update:(d,p)=>{this.cfg.update(d,p)}},
                {key:"kendrickMass",type:"number",value:this.cfg.kendrickMass,title: "The mass of the first repeat unit",options:[{"isStyle":true,"key":"width","value":150}],update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"------------","inputs":[]})
        varsArray.push({"name":"Unit 2 list",
            "inputs":[
                {key:"kendrickMethod2",type:"radio",value:"list",title: "Check this to choose the unit on the list and affect name and mass",options:{"radioCheck":this.cfg.kendrickMethod2},update:(d,p)=>{this.cfg.update(d,p)}},
                {key:"kendrickChoice2",type:"select",value:this.cfg.kendrickChoice2,title: "Choose a second predetermined repeat unit",options:kendrickmasslist,update:(d,p)=>{this.cfg.update(d,p)}},
            ]
        })
        varsArray.push({"name":"Unit 2 name",
            "inputs":[
                {key:"kendrickMethod2",type:"radio",value:"formula",title: "Check this to modify the formula and affect the mass",options:{"radioCheck":this.cfg.kendrickMethod2},update:(d,p)=>{this.cfg.update(d,p)}},
                {key:"kendrickFormula2",type:"text",value:this.cfg.kendrickFormula2,title: "The chemical formula/name of the second repeat unit",update:(d,p)=>{this.cfg.update(d,p)}},

            ]
        })
        varsArray.push({"name":"Unit 2 mass",
            "inputs":[
                {key:"kendrickMethod2",type:"radio",value:"mz",title: "Check this to  only modify the mass of the unit",options:{"radioCheck":this.cfg.kendrickMethod2},update:(d,p)=>{this.cfg.update(d,p)}},
                {key:"kendrickMass2",type:"number",value:this.cfg.kendrickMass2,title: "The mass of the second repeat unit",options:[{"isStyle":true,"key":"width","value":150}],update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"------------","inputs":[]})
        varsArray.push({"name":"Divisor",
            "inputs":[
                {key:"kendrickDivisor",type:"number",value:this.cfg.kendrickDivisor,title: "The divisor applied to both kendrick masses",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"------------","inputs":[]})
        varsArray.push({"name":"Replace 'KMD' by 'KFM'","inputs":[
            {key:"textKFM",type:"checkbox",value:this.cfg.textKFM,title: "Check this to replace all mentions of 'KMD' on this chart by 'KMF'",update:(d)=>{this.cfg.update(d)}},
        ]})
        return varsArray
    }
}

/************************************************************************************************ */
/*-----------------------------------------CONTOUR MAP-------------------------------------------*/

class CanvasCell_contourMap extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index, cfg)
        this.cfg.prepareCfg("contourMap")
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = columnNames[this.cfg.ytype]
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);
        if(!this.cfg.config.nogrid){
            this.grids = [];
            this.grids[0] = appendPlotGrid(this.svgSpace, this.scales[0],this.cfg.config.axisLines, "bottom", this.cfg.config);
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines,"side", this.cfg.config);
          }
        //create brushing or filtration
        this.createBrush("contourMap")
        this.drawAllData()
        this.drawColourLegends(false)
         this.drawFiltersTitles();
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index){
        super.drawData(dataset, index)
        if(!this.cfg.activeData[index]){return;}
        if(!this.drawnData){this.drawnData = []}

        //find data 
        let data = dataset.data
        if(dataset.dataFiltered && dataset.dataFiltered.length){
            data = dataset.dataFiltered;
        }

        let densityData = this.drawContour(data)
        let densityMax = 0
        for(let i=0; i<densityData.length; i++){
            if(densityData[i].value > densityMax){densityMax = densityData[i].value }
        }
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("path")
        .data(densityData)
        .enter()
        .append("path")
          .attr("d", d3.geoPath())
          .attr("fill", "none")
          .attr("stroke", dataset.cfg.colorSolid)
          .attr("stroke-linejoin", "round")
          .attr("stroke-opacity", ()=>{
             if(this.cfg.isColored){return 0}
             else{return 1}
          })
          .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
          .join("path")
            .attr("fill", (d)=>{
             if(this.cfg.isColored){
                 if(dataset.cfg.colorRelative){
                     return dataset.colorScale(parseFloat(parseFloat(dataset.cfg.relativeMin) + parseFloat(dataset.cfg.relativeMax-dataset.cfg.relativeMin)*parseFloat(d.value/densityMax)))
                 }else{
                     return dataset.colorScale(parseFloat(parseFloat(dataset.cfg.minColor) + parseFloat(dataset.cfg.maxColor-dataset.cfg.minColor)*parseFloat(d.value/densityMax)))
                 }
             }else{
                 return "#00000000"
             }
 
         });
    }
    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = columnNames[this.cfg.ytype]
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels[0].text(axisLabel_x);
        this.axesLabels[1].text(axisLabel_y);
        //TODO :add an update of the brushing
        if(!this.cfg.config.nogrid){
            this.grids[0].call(d3.axisBottom(this.scales[0]).ticks(this.cfg.config.axisLines).tickSize(this.cfg.config.height).tickFormat(""))
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines).tickSize(-this.cfg.config.width).tickFormat(""))
        }
    }

    drawContour(data){
        var densityData  = d3.contourDensity()
       .x((d)=> { return this.scales[0](d[this.cfg.xtype]); }) 
       .y((d)=> { return this.scales[1](d[this.cfg.ytype]); })
       .weight((d)=>{
        if(this.cfg.buttonWeight){
            return d[this.cfg.weightType]
        }else{
            return 1
        }
       })
       .size([this.cfg.config.width, this.cfg.config.height])
       .bandwidth(this.cfg.bandwidth ) 
       .thresholds(this.cfg.thresholds)
       (data)
       return densityData
    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        let thisData = this.drawnData[dataNum]
        if(!thisData){return;}
        this.drawData(this.canvas.data[dataNum], dataNum)
        if(content.includes("opacity_")|| content.includes("all")){
            thisData.style("opacity", this.canvas.cfg.opacity)
        }
    }
    //for contourmaps, everything has to be redrawn
    handleFiltering(indexesList){
        this.drawAllData()
        this.drawFiltersTitles()
    }

    prepareCfg(){
        let properties = [
            {key:"xtype",type:"number",default:0},
            {key:"ytype",type:"number",default:0},
            {key:"bandwidth",type:"number",default:1},
            {key:"thresholds",type:"number",default:10},
            {key:"buttonWeight",type:"checkbox",default:false},
            {key:"weightType",type:"number",default:0},
            {key:"isColored",type:"checkbox",default:false}
        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xtype",type:"selectCols",value:this.cfg.xtype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ytype",type:"selectCols",value:this.cfg.ytype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Bandwidth",
            "inputs":[
                {key:"bandwidth",type:"number",value:this.cfg.bandwidth,title: "The smoothing factor of the contour",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Thresholds",
            "inputs":[
                {key:"thresholds",type:"number",value:this.cfg.thresholds,title: "The number of lines/colors steps",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Weighting points",
            "inputs":[
                {key:"buttonWeight",type:"checkbox",value:this.cfg.buttonWeight,title: "Check this to weight every point by a certain variable",update:(d)=>{this.cfg.update(d)}},
                {key:"weightType",type:"selectCols",value:this.cfg.weightType,title: "The data the weighting is based on",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Color thresholds",
            "inputs":[
                {key:"isColored",type:"checkbox",value:this.cfg.isColored,title: "Check this to have color steps rather than solid lines",update:(d)=>{this.cfg.update(d)}},
                
            ]
        })
        return varsArray
    }

}

class CanvasCell_densityCurve extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index)
        this.cfg.prepareCfg("densityCurve")
        if(cfg){this.cfg.copyCfg(cfg)}
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = "Relative Density"
        if(this.cfg.ymethod =="densityAdd"){axisLabel_y = "Relative Density(at most)"}
        else if(this.cfg.ymethod =="densitySub"){axisLabel_y = "Relative Density(at least)"}
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);
        if(!this.cfg.config.noGrid){
            this.grids = [];
            this.grids[0] = appendPlotGrid(this.svgSpace, this.scales[0],this.cfg.config.axisLines, "bottom", this.cfg.config);
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines,"side", this.cfg.config);
          }
        //create brushing or filtration
        this.createBrushFilter("densityCurve")
        this.drawAllData()
        this.drawColourLegends(true)
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index){
        super.drawData(dataset, index)
        if(!this.cfg.activeData[index]){return;}
        if(!this.drawnData){this.drawnData = []}
        //find data 
        let data = dataset.data
        if(dataset.dataFiltered && dataset.dataFiltered.length){data = dataset.dataFiltered}
        //prepares the kernel
        let thisKernel = this.kernelEpanechnikov
        if(this.cfg.kernelType == "gaussian"){thisKernel = this.kernelGaussian}
        else if(this.cfg.kernelType == "uniform"){thisKernel = this.kernelUniform}
        else if(this.cfg.kernelType == "triangular"){thisKernel = this.kernelTriangular}
        let kde = this.kernelDensityEstimator(thisKernel(this.cfg.smoothing), this.scales[0].ticks(this.cfg.thresholds))
        let densityData =  kde(data.map((d)=>{return d; }) )
        //handles the y method
        let densityMax = 1
        if(this.cfg.ymethod=="densityAdd"){
            let cumulative = 0
            for(let i=0; i<densityData.length; i++){
                cumulative += densityData[i][1]
                densityData[i][1] = cumulative
                
            }
            densityMax = cumulative
        }else if(this.cfg.ymethod=="densitySub"){
            let cumulative = 0
            for(let i=densityData.length-1; i>=0; i--){
                cumulative += densityData[i][1]
                densityData[i][1] = cumulative
            }
            densityMax = cumulative
        }else if(this.cfg.ymethod=="density"){
            densityMax = densityData[0][1]
            for(let i=0; i<densityData.length; i++){
                if(densityData[i][1]>densityMax){densityMax = densityData[i][1]}
            }
        }
        densityData.unshift([(this.cfg.xmin-100), this.cfg.ymin])
        densityData.push([(this.cfg.xmax+100), this.cfg.ymin])
        if(!this.densityData){this.densityData = []}
        this.densityData[index]= densityData

        //draws data
        this.drawnData[index] = this.svgSpace.append('path').attr("id","cell"+this.index+"data"+index)
        .datum(densityData)
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .attr("stroke", dataset.cfg.colorSolid)
        .attr("fill",dataset.cfg.colorSolid)
        .attr("fill-opacity",  this.cfg.underLineOpacity)
        .attr("stroke-opacity", this.cfg.lineOpacity)
        .attr("stroke-width", this.cfg.linewidth)
        .attr("d",  d3.line()
            // .curve(d3.curveBasis)
            .x((d) =>{ return this.scales[0](d[0]); })
            .y((d) =>{ return this.scales[1](d[1]/densityMax); })
        );
    }
    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = "Relative Density"
        if(this.cfg.ymethod =="densityAdd"){axisLabel_y = "Relative Density(at most)"}
        else if(this.cfg.ymethod =="densitySub"){axisLabel_y = "Relative Density(at least)"}
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels[0].text(axisLabel_x);
        this.axesLabels[1].text(axisLabel_y);
        //TODO :add an update of the brushing
        if(!this.cfg.config.noGrid){
            this.grids[0].call(d3.axisBottom(this.scales[0]).ticks(this.cfg.config.axisLines).tickSize(this.cfg.config.height).tickFormat(""))
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines).tickSize(-this.cfg.config.width).tickFormat(""))
        }
        this.drawColourLegends(true)
    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        this.drawAllData()
    }

    /** if the filter comes from this histogram, it should not be counted */
    handleFiltering(indexesList){
        let activeData = this.canvas.cfg.interactivity.active
        for(let i=0; i<this.canvas.data.length; i++){
            if(activeData !="all" && activeData !=i){continue;}
            let dataset = this.canvas.data[i]
            if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
            this.drawData(this.canvas.data[i], i, "filter")
        }
    }


    // Function to compute density. Borrowed code
    kernelDensityEstimator(kernel, X) {
        return (V) =>{
        return X.map((x) =>{
            let mean = 0
            if(this.cfg.buttonWeight){
                const weightedSum = d3.sum(V, v => kernel(x - v[this.cfg.xtype]) * v[this.cfg.weightType]);
                const weightTotal = d3.sum(V, v => v[this.cfg.weightType]);
                mean = weightedSum / weightTotal
            }else{
                mean = d3.mean(V, (v) =>{ return kernel(x - v[this.cfg.xtype]); })
            }
            return [x, mean];
        });
        };
    }
    kernelEpanechnikov(k) {
        return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }
    kernelGaussian(k) {
        return function(v) {
            return Math.exp(-0.5 * (v / k) ** 2) / (Math.sqrt(2 * Math.PI) * k);
        };
    }
    kernelUniform(k) {
        return function(v) {
            return Math.abs(v / k) <= 1 ? 0.5 / k : 0;
        };
    }
    kernelTriangular(k) {
        return function(v) {
            return Math.abs(v / k) <= 1 ? (1 - Math.abs(v / k)) / k : 0;
        };
    }


    autoscale(){
        let data = []
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            if( item.data.length >0 && this.cfg.activeData[index] == "1"){//only push the datasets containing data
                data.push(item.data)
            } 
        })
        let x= [this.cfg.xmin, this.cfg.xmax]
        let xtype = this.cfg.xtype
        x = autoAxis(this.scales[0], data, xtype)
        this.cfg.xmin = x[0]
        this.cfg.xmax = x[1]
        this.cfg.ymin = 0
        this.cfg.ymax = 1
        this.draw()
        this.drawAllData()
        //find y min and max
    }
    prepareCfg(){
        let properties = [
            {key:"xtype",type:"number",default:0},
            {key:"ymethod",type:"number",default:"density"},
            {key:"buttonWeight",type:"checkbox",default:false},
            {key:"weightType",type:"number",default:0},
            {key:"kernelType",type:"string",default:"gaussian"},
            {key:"smoothing",type:"number",default:1},
            {key:"thresholds",type:"number",default:100},
            {key:"linewidth",type:"number",default:2},
            {key:"lineOpacity",type:"number",default:1},
            {key:"underLineOpacity",type:"number",default:0},
        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xtype",type:"selectCols",value:this.cfg.xtype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let optionsY = [{"name":"Density","value":"density"},{"name":"Density(at least)","value":"densitySub"},{"name":"Density(at most)","value":"densityAdd"}]
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ymethod",type:"select",value:this.cfg.ymethod,options:optionsY,title: "The type of y axis: relative, absolute, percentage of intensity...",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Weighting points",
            "inputs":[
                {key:"buttonWeight",type:"checkbox",value:this.cfg.buttonWeight,title: "Check this to weight every point by a certain variable",update:(d)=>{this.cfg.update(d)}},
                {key:"weightType",type:"selectCols",value:this.cfg.weightType,title: "The data the weighting is based on",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let optionsKernel = [{"name":"Gaussian","value":"gaussian"},{"name":"Epanechnikov","value":"epanechnikov"},{"name":"Uniform(rectangular)","value":"uniform"},{"name":"Triangular","value":"triangular"}]
        varsArray.push({"name":"Kernel estimator",
            "inputs":[
                {key:"kernelType",type:"select",value:this.cfg.kernelType,options:optionsKernel,title: "The type of kernel density estimator algorithm used",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Smoothing",
            "inputs":[
                {key:"smoothing",type:"number",value:this.cfg.smoothing,title: "The smoothing factor of the contour",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"x resolution",
            "inputs":[
                {key:"thresholds",type:"number",value:this.cfg.thresholds,title: "The number of x estimation points",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Line Width",
            "inputs":[
                {key:"linewidth",type:"number",value:this.cfg.linewidth,title: "The width of lines",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Line Opacity",
            "inputs":[
                {key:"lineOpacity",type:"number",value:this.cfg.lineOpacity,title: "The opacity of the line",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Fill Area Opacity",
            "inputs":[
                {key:"underLineOpacity",type:"number",value:this.cfg.underLineOpacity,title: "The opacity of the area under the line",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        return varsArray
    }

}

class CanvasCell_tableInfos extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index, cfg)
        this.cfg.prepareCfg("tableInfos")
        this.draw()
    }

    draw(){
        if(debug){console.log("drawing CanvasCell"+this.index+"from canvas"+this.canvas.letter)}
        //removing old cell
        this.destroy()
        //updating size
        this.height = this.cfg.config.height
        this.width = this.cfg.config.width
        //creating new elements
        this.svgSpace = appendCell("#"+this.canvas.html.id,"cell"+this.index,"#cell"+(this.index+1), this.cfg.config)
        this.clipPath = appendClipPath(this.svgSpace, "clipCvs"+this.canvas.letter+"Cell"+this.index, this.cfg.config)
        this.background = appendBackColor(this.svgSpace, 100, this.cfg.config)
        this.drawnData = [] // will be an array of datasets drawn

        let margin = this.cfg.config.margin
        this.tableContainer = this.svgSpace.append("foreignObject")
        .attr("x",-margin.left)
        .attr("y",-margin.top)
        .attr("width", this.cfg.config.width + margin.left + margin.right)
        .attr("height", this.cfg.config.height + margin.top + margin.bottom)

        this.div = this.tableContainer.append("xhtml:div")
        .attr("width", "100%")
        .attr("height", this.cfg.config.height + margin.top + margin.bottom)
        .style("font-size", this.cfg.config.legendFontSizeSmall)
        .style("font-family", this.cfg.config.legendFont)
        //to access the DOM table: this.div.node()
        this.div.node().style.display = "block";
        this.div.node().style.overflowY = "scroll"
        this.div.node().style.maxHeight = this.cfg.config.height

        //determines the number of rows and columns
        let rowNb = 1+columnNames.length
        let colNb = 1
        for(let i=0; i<this.cfg.activeData.length; i++){
            if(this.cfg.activeData[i] == "1" && this.canvas.data[i] && this.canvas.data[i].data && this.canvas.data[i].data.length >0){
                colNb +=1
            }
        }
        let table = createTable(rowNb, colNb)

        let col = 1
        for(let i=0; i<this.cfg.activeData.length; i++){
            if(this.cfg.activeData[i] == "1" && this.canvas.data[i] && this.canvas.data[i].data && this.canvas.data[i].data.length >0){
                table.rows[0].cells[col].textContent = "data n°"+(i+1)
                col +=1
            }
        }
        for(let i=0; i<columnNames.length; i++){
            table.rows[i+1].cells[0].textContent = columnNames[i]
        }
        this.table = table
        this.div.node().appendChild(table)
        this.drawAllData()
    }

    drawData(dataset, index, specialDataset){
        if(!this.cfg.activeData[index]){return;}
        if(!dataset.data ||  dataset.data.length == 0){return;}

        
        //reduces index by empty datasets
        let valToRemove = 0
        for(let i=0; i<index; i++){
            if(this.cfg.activeData[i] != "1"  || !this.canvas.data[i] || !this.canvas.data[i].data || this.canvas.data[i].data.length ==0){
                valToRemove +=1
            }
        }
        index -= valToRemove
        if(!this.table.rows[0].cells[index+1]){this.draw()}


        let data = specialDataset || dataset.data
        let isSpecial = false
        if(specialDataset && Array.isArray(specialDataset)){isSpecial = true}
        //loops through the columns
        for(let i=0; i<columnNames.length; i++){
            if(!data[0][i] && data[0][i] != 0){continue;}
            //looks if it is a numerical or text column
            let isNum = true
            //TODO change data from 0 when first line will be substracted
            for(let j=1;j<data.length; j++){
                if(isNaN(data[j][i]) && data[j][i]){
                    isNum = false;
                    break;
                }
            }
            let value = ""
            if(isNum){
                value = this.computeValueNum(data, i, isSpecial)
                value = parseFloat(value).toFixed(2)
                if(this.cfg.operationNum.includes("count")){value = (value*100).toFixed(2); value+="%"}
            }
            else{
                value = this.computeValueText(data, i, isSpecial)
            }
            if(!this.table.rows[i+1]){continue;}
            this.table.rows[i+1].cells[index+1].textContent = value
            if(isSpecial){
            this.table.rows[i+1].cells[index+1].style.color = "deepskyblue"
            }else{
                 this.table.rows[i+1].cells[index+1].style.color = "black"
            }
        }


    }
    /** for table infos, updating just means redrawing everything */
    update(content, doNotUpdateDomains){
        this.draw()
    }

    updateData(content, index){
        if(debug){console.log("updating data n°"+index)}
        let dataset = this.canvas.data[index]
        this.drawData(dataset, index)
    }        

    handleFiltering(){
        let datasets = this.canvas.data
        let activeData = this.canvas.cfg.interactivity.active
        datasets.forEach((item,index) => {
            if(activeData !="all" && activeData !=index){return}
            if(!this.cfg.activeData[index]){return;}
            if(this.canvas.cfg.interactivity){
                let inter = this.canvas.cfg.interactivity
                if(inter.active !="all" && inter.active != index){return;}
            }
            if(item.dataFiltered && item.dataFiltered.length >0){this.drawData(item, index, item.dataFiltered)}
            else{this.drawData(item, index)}
        })
    }

    handleHighlighting(){
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            if(!this.cfg.activeData[index]){return;}
            if(item.dataHighlighted && item.dataHighlighted.length >0){this.drawData(item, index, item.dataHighlighted)}
            else{this.drawData(item, index)}
        })
    }


    computeValueNum(data, column, isSpecial){
        let method = this.cfg.operationNum
        let value = 0
        let totalInt = 0
        let minus = 0
        if(isSpecial){minus = 1}
        //TODO : change data from 0 when first line will be substracted. Also change "data.length-1" to data.length
        //for normal data has to start at 1 to avoid first line, for selected data has to start at 0 so 1-1. Also minus is used for the total value divider
        for(let i=1-minus;i<data.length; i++){
            if(method == "mean"){
                 value += parseFloat(data[i][column])
            }
            else if(method == "mean_weight"){
                let intensity = parseFloat(data[i][config.intensity])
                totalInt += intensity
                 value += parseFloat(data[i][column])*intensity
            }
            else if(method =="count"){
                if(data[i][column] || data[i][column]==0){value +=1}
            }else if(method =="countZero"){
                if(data[i][column]&& data[i][column]!=0){value +=1}
            }
        }
        if(method == "mean"){ value = value / (data.length-1+minus)}
        else if (method =="mean_weight"){value = value / totalInt}
        else if(method == "count" || method =="countZero"){value = value/(data.length-1+minus)}
        else if(method == "median"){
            let newData = duplicateData(data)
            newData.sort((a,b)=>{return a[column]-b[column]})
            let dataLength = newData.length
            let halfIndex = Math.round(dataLength/2)
            return newData[halfIndex][column]
        }
        return value
    }

    computeValueText(data, column, isSpecial){
        let value = 0
        let method = this.cfg.operationText
        let minus = 0
        if(isSpecial){minus = 1}
        for(let i=1-minus;i<data.length; i++){
            if(method =="count"){
                if(data[i][column]){value +=1}
            }
        }
        if(method == "count"){value = value/(data.length-1+minus)}
        value = (value*100).toFixed(2)
        value +="%"
        return value
    }

    autoscale(){}

    prepareCfg(){
        let properties = [
            {key:"operationNum",type:"text",default:"mean"},
            {key:"operationText",type:"text",default:"count"},
        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        let optionsOp = [{"name":"Mean values","value":"mean"},
            {"name":"Median value","value":"median"},
            {"name":"Mean values weighted by intensity","value":"mean_weight"},
            {"name":"Count non-empty cells","value":"count"},
            {"name":"Count non-empty and non-0 cells","value":"countZero"}
        ]
        varsArray.push({"name":"Data operation (numerical)",
            "inputs":[
                {key:"operationNum",type:"select",value:this.cfg.operationNum ,options:optionsOp,title: "The type of data operation shown on the cases if the variable is numerical",update:(d)=>{this.cfg.update(d)}},
            
            ]
        })
        let optionsOp2 = [{"name":"Count non-empty cells","value":"count"},
        ]
        varsArray.push({"name":"Data operation (textual)",
            "inputs":[
                {key:"operationText",type:"select",value:this.cfg.operationText ,options:optionsOp2,title: "The type of data operation shown on the cases if the variable is textual",update:(d)=>{this.cfg.update(d)}},
            
            ]
        })
        return varsArray
    }

}


/************************************************************************************************ */
/*-----------------------------------------HISTOGRAM -------------------------------------------*/

/** this is a general class for histograms of all sorts */
class CanvasCell_histo extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index, cfg)
    }
    
    findNumberOfData(){
        let number = 0
        this.cfg.activeData.forEach((item, index)=>{if(item =="1" && this.canvas.data[index] && this.canvas.data[index].data.length>0){number +=1}})
        return number
    }
    /** finds how many datasets have been displayed based on a data index (thisOne). Used when calculating offsets of bars */
    findNumberOfDataBefore(thisOne){
        let number = 0
        for(let i=0; i<thisOne; i++){
            if(this.cfg.activeData[i] == "1" && this.canvas.data[i].data.length>0){
                number +=1
            }
        }
        return number
    }
    
    /**a bar has to be displayed at a coordinate but with an offset related to the other datasets*/
    findX(bin, nbToDisplay , nbBefore, binWidth){
        let xscale = this.scales[0]
        let start = xscale(bin.name || bin.x0)
        if(bin.name === 0 || bin.name === "0"){start = xscale(0) || xscale("0")}//fix bug for special case if name is 0
        else if(bin.name == ""){start = xscale("")}
        let offset = 0
        if(this.cfg.centerBars){
             offset = binWidth*(nbBefore-0.5*nbToDisplay)
        }else{
             offset = binWidth*nbBefore
        }
        offset *= this.cfg.barWidth*0.01
        if(!start){start = 0}
        return start+offset
    }

    /** a helper function to write the text of bars percents */
    findPercentText(allBins, bin, binIndex){
        let value = -1
        if(bin.length ==0){return ""}
        if(this.cfg.ymethod=="intensity"){
            let height = bin.intensity
            value = 100*height/allBins.totalHeight
        }else if(this.cfg.ymethod == "attributions"){
            value = 100*bin.length/allBins.totalNumber
        }else if(this.cfg.ymethod == "count"){
            return Math.round(bin.length).toFixed(0)
        }
        let precision = 0
        if(value<10){precision = 1}
        else if(value<1){precision = 2}
        else if(value <0.1){precision = 3}
        return value.toFixed(precision)+"%";
    }

}



class CanvasCell_histogram extends CanvasCell_histo{
    constructor(parent, index, cfg){
        super(parent, index)
        this.cfg.prepareCfg("histogram")
        if(cfg){this.cfg.copyCfg(cfg)}
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = "Relative %"
        if(this.cfg.ymethod == "attributions"){
            axisLabel_y = "% of attributions"
        }else if(this.cfg.ymethod == "intensity"){
            axisLabel_y= "% of intensity"
        }else if(this.cfg.ymethod == "count"){
            axisLabel_y = "Number of attributions"
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);
        //create brushing or filtration
        this.createBrushFilter("histogram")
        this.drawAllData()
        this.drawColourLegends(true)
        this.drawFiltersTitles()
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index, specialInfo){
        //redirects to matrix if needed
        if(this.cfg.showErrorBars){this.drawDataMatrix(dataset, index, specialInfo);return;}
        let suppID = ""
        if(specialInfo != "highlight"){
            super.drawData(dataset, index)
        }else{
            d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_highlight").remove()
            suppID = "_highlight"
        }
        if(!this.cfg.activeData[index]){return;}

        //handles which data must be binned
        let theseBins = []
        let color = dataset.cfg.colorSolid
        if(specialInfo == "filter" && dataset.dataFiltered && dataset.dataFiltered.length >0){
            //drawing bins for filtering
            theseBins = dataset.calculateBins([this.cfg.xmin, this.cfg.xmax], this.cfg.barDensity, this.cfg.xtype, "filteredCell"+this.index, true, dataset.dataFiltered)
        }else if(specialInfo== "highlight" && dataset.dataHighlighted && dataset.dataHighlighted.length >0){
            //drawing bins for highlighting
            theseBins = dataset.calculateBins([this.cfg.xmin, this.cfg.xmax], this.cfg.barDensity, this.cfg.xtype, "highlightedCell"+this.index, true, dataset.dataHighlighted)
            //for special interactivity case of non+-relative bar heights, must add 1 to the total number computed to account for the absence of title header
            if(this.canvas.cfg.interactivity){
                if(!this.canvas.cfg.interactivity.histogramRelativity){theseBins.totalNumber +=1}
            }
            color = this.canvas.cfg.interactivity.histoColor
        }
        else{
            //drawing the classical way
            theseBins = dataset.calculateBins([this.cfg.xmin, this.cfg.xmax], this.cfg.barDensity, this.cfg.xtype, "cell"+this.index)
        }
        let maxInt = Math.max(...theseBins.heights)
        let dataNb = this.findNumberOfData()
        let dataNbBefore = this.findNumberOfDataBefore(index)
        let binWidth = (this.scales[0](theseBins.bins[0].x1) - this.scales[0](theseBins.bins[0].x0))/dataNb

        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index+suppID)
        .selectAll("rect")
        .data(theseBins.bins)
        .enter()
        .append("rect")
            .attr("x", (d) => {return this.findX(d, dataNb, dataNbBefore, binWidth)})
            .attr("width", (d) =>{return Math.max(1, binWidth*this.cfg.barWidth*0.01 -1)})
            .attr("y", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.intensity/theseBins.totalHeight)}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.length/(theseBins.totalNumber - 1))}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.length)}
            })
            .attr("height",(d,n)=>{
                if(this.cfg.ymethod == "intensity"){return this.cfg.config.height - this.scales[1](100*d.intensity/theseBins.totalHeight)}
                else if(this.cfg.ymethod =="attributions"){return this.cfg.config.height - this.scales[1](100*d.length/(theseBins.totalNumber - 1))}
                else if(this.cfg.ymethod == "count"){return this.cfg.config.height - this.scales[1](d.length)}
            })
            .style("fill", color)
            .attr("fillColor", color)
            .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
            .attr('tooltipHTML', (d,n) => {return "histogram"+";"+index+";"+n})
            .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
            .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"histogram",n, this)}  )
            .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d,true)}  )
            .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"histogram",n, this)} );
    
        
        if(this.cfg.showPercents){
            this.drawnData[index] += this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index+suppID)
                .selectAll("rect")
                .data(theseBins.bins)
                .enter()
                .append("text")
                .attr("x", (d) => {
                    let value = this.findX(d, dataNb, dataNbBefore, binWidth) + 0.5*binWidth*this.cfg.barWidth*0.01
                    return value})
                .attr("y", (d,n) =>{
                    if(this.cfg.ymethod == "intensity"){return this.scales[1](100*theseBins.heights[n]/theseBins.totalHeight)}
                    else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.length/(dataset.data.length - 1))}
                    else if(this.cfg.ymethod == "count"){return this.scales[1](d.length)}
                })
                .attr("font-size", this.cfg.config.legendFontSizeSmall)
                .attr("text-anchor","middle")
                .attr("fill","black")
                .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
                .text((d,n)=>{return this.findPercentText(theseBins,d,n)})           
        }
    }

    /** draw data but for matrix datasets */
    drawDataMatrix(dataset, index, specialInfo){
        super.drawData(dataset, index)
        d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_highlight").remove()
        if(!this.cfg.activeData[index]){return;}

        //handles which data must be binned
        let theseBins = []
        let color = dataset.cfg.colorSolid
        if(specialInfo == "filter" && dataset.dataFiltered && dataset.dataFiltered.length >0){
            //drawing bins for filtering
            theseBins = dataset.calculateBins([this.cfg.xmin, this.cfg.xmax], this.cfg.barDensity, this.cfg.xtype, "filteredCell"+this.index, true, dataset.dataFiltered)
            this.drawFiltersTitles()
        }else if(specialInfo== "highlight" && dataset.dataHighlighted && dataset.dataHighlighted.length >0){
            //drawing bins for highlighting
            theseBins = dataset.calculateBins([this.cfg.xmin, this.cfg.xmax], this.cfg.barDensity, this.cfg.xtype, "highlightedCell"+this.index, true, dataset.dataHighlighted)
            //for special interactivity case of non+-relative bar heights, must add 1 to the total number computed to account for the absence of title header
            if(this.canvas.cfg.interactivity){
                if(!this.canvas.cfg.interactivity.histogramRelativity){theseBins.totalNumber +=1}
            }
            color = this.canvas.cfg.interactivity.histoColor
        }
        else{
            //drawing the classical way
            theseBins = dataset.calculateBins([this.cfg.xmin, this.cfg.xmax], this.cfg.barDensity, this.cfg.xtype, "cell"+this.index)
        }
        //prepares error bars and data related to it
        dataset.prepareAsMatrix()
        dataset.prepareBinsForMatrix(theseBins)
        
        let dataNb = this.findNumberOfData()
        let dataNbBefore = this.findNumberOfDataBefore(index)
        let binWidth = (this.scales[0](theseBins.bins[0].x1) - this.scales[0](theseBins.bins[0].x0))/dataNb

        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("rect")
        .data(theseBins.bins)
        .enter()
        .append("rect")
            .attr("x", (d) => {return this.findX(d, dataNb, dataNbBefore, binWidth)})
            .attr("width", (d) =>{return Math.max(1, binWidth*this.cfg.barWidth*0.01 -1)})
            .attr("y", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.matrixMeanI)}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.matrixMeanCount)}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.matrixMeanCountAbsolute)}
            })
            .attr("height",(d,n)=>{
                if(this.cfg.ymethod == "intensity"){return this.cfg.config.height - this.scales[1](100*d.matrixMeanI)}
                else if(this.cfg.ymethod =="attributions"){return this.cfg.config.height - this.scales[1](100*d.matrixMeanCount)}
                else if(this.cfg.ymethod == "count"){return this.cfg.config.height - this.scales[1](d.matrixMeanCountAbsolute)}
            })
            .style("fill", color)
            .attr("fillColor", color)
            .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
            .attr('tooltipHTML', (d,n) => {return "histogram"+";"+index+";"+n})
            .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
            .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"histogram_matrix",n, this)}  )
            .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d,true)}  )
            .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"histogram_matrix",n, this)} );
    
        
        if(this.cfg.showPercents){
            this.drawnData[index] += this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index)
                .selectAll("rect")
                .data(theseBins.bins)
                .enter()
                .append("text")
                .attr("x", (d) => {
                    let value = this.findX(d, dataNb, dataNbBefore, binWidth) + 0.5*binWidth*this.cfg.barWidth*0.01
                    return value})
                .attr("y", (d,n) =>{
                    if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.matrixMeanI)}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.matrixMeanCount)}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.matrixMeanCountAbsolute)}
                })
                .attr("font-size", this.cfg.config.legendFontSizeSmall)
                .attr("text-anchor","middle")
                .attr("fill","black")
                .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
                .text((d,n)=>{return this.findPercentText(theseBins,d,n)})           
        }
        let matrixCols = dataset.matrixCols
        let matrixFilesNb = matrixCols[1] - matrixCols[0]
        let studentCoeff = getStudentsLawS(this.cfg.errorRisk,matrixFilesNb) 
        if(debug){console.log("students coefficient:",studentCoeff)}
        //draws error bars
        this.drawnData[index] += this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index)
            .selectAll("rect")
            .data(theseBins.bins)
            .enter()
            .append("rect")
            .attr("x", (d) => {return this.findX(d, dataNb, dataNbBefore, binWidth)+0.5*binWidth*this.cfg.barWidth*0.01})
            .attr("width", 1)
            .attr("y", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.matrixMeanI + 100*d.matrixStdDevI*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.matrixMeanCount + 100*d.matrixStdDevNb*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.matrixMeanCountAbsolute + d.matrixStdDevNbAbsolute*studentCoeff/Math.sqrt(matrixFilesNb))}
            })
            .attr("height", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.matrixMeanI - 100*d.matrixStdDevI*studentCoeff/Math.sqrt(matrixFilesNb))-this.scales[1](100*d.matrixMeanI + 100*d.matrixStdDevI*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.matrixMeanCount - 100*d.matrixStdDevNb*studentCoeff/Math.sqrt(matrixFilesNb))-this.scales[1](100*d.matrixMeanCount + 100*d.matrixStdDevNb*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.matrixMeanCountAbsolute - d.matrixStdDevNbAbsolute*studentCoeff/Math.sqrt(matrixFilesNb))-this.scales[1](d.matrixMeanCountAbsolute + d.matrixStdDevNbAbsolute*studentCoeff/Math.sqrt(matrixFilesNb))}
            })
            .style("fill", "#000000")
            .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
    }


    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = "Relative %"
        if(this.cfg.ymethod == "attributions"){
            axisLabel_y = "% of attributions"
        }else if(this.cfg.ymethod == "intensity"){
            axisLabel_y= "% of intensity"
        }else if(this.cfg.ymethod == "count"){
            axisLabel_y = "Number of attributions"
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels[0].text(axisLabel_x);
        this.axesLabels[1].text(axisLabel_y);
    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        this.drawData(this.canvas.data[dataNum],dataNum)
    }

    /** if the filter comes from this histogram, it should not be counted */
    handleFiltering(indexesList){
        if(!this.canvas.cfg.interactivity.filterWorkonHistograms){return;}
        let activeData = this.canvas.cfg.interactivity.active
        //checks if the only filter is on this chart, skips 
        if(this.canvas.filters.length == 1){
            if(this.canvas.filters[0] &&this.canvas.filters[0].cellIndex == this.index){return;}
        }

        for(let i=0; i<this.canvas.data.length; i++){
            if(activeData !="all" && activeData !=i){return}
            this.drawData(this.canvas.data[i], i, "filter")
        }
        this.drawFiltersTitles()
    }

    /** handle drawing bars for highlighted data */
    handleHighlighting(){
        //check if this method of brushing is active, because it can be disabled
        if(!this.canvas.cfg.interactivity.createHistogramBars){return;}
        for(let i=0; i<this.canvas.data.length; i++){
            let dataset = this.canvas.data[i]
            if(!dataset.highlight){continue;}
            if(dataset.highlight.cellIndex == this.index){continue;}
            if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
            if(this.canvas.cfg.interactivity.active != "all" && this.canvas.cfg.interactivity.active != i){continue;}
            this.drawData(this.canvas.data[i], i, "highlight")
        }
    }

    autoscale(){
        if(debug){console.log("autoscaling cell n°"+this.index+" from canvas"+this.canvas.letter)}
        let data = []
        let binSets = []
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            if( item.data.length >0 && this.cfg.activeData[index] == "1"){//only push the datasets containing data
                data.push(item.data)
            } 
            let theseBins = item.findBins("cell"+this.index)
            if( theseBins.bins && this.cfg.activeData[index] == "1"){//only push the datasets containing data
                binSets.push(theseBins)
            } 
        })

        let x= [this.cfg.xmin, this.cfg.xmax]
        let xtype = this.cfg.xtype
        x = autoAxis(this.scales[0], data, xtype)
        this.cfg.xmin = x[0]
        this.cfg.xmax = x[1]

        let genMax = 0
        binSets.forEach((set, index)=>{
            let localMax = 0
            if(this.cfg.ymethod == "intensity"){
                localMax = 100*Math.max(...set.heights)/set.totalHeight
            }else if(this.cfg.ymethod == "attributions"){
                set.bins.forEach((bin)=>{if(bin.length>localMax){localMax = bin.length}})
                if(this.canvas.data[index] && this.canvas.data[index].data){
                    localMax = 100*localMax/this.canvas.data[index].data.length
                }else{localMax = 0}
            }else if(this.cfg.ymethod =="count"){
                set.bins.forEach((bin)=>{if(bin.length>localMax){localMax = bin.length}})
            }
            if(localMax >genMax){genMax = localMax}
        })
        this.cfg.ymin = 0
        this.cfg.ymax = Math.ceil(genMax)+10
        this.draw()
        this.drawAllData() 
    }

    prepareCfg(){
        let properties = [
            {key:"xtype",type:"number",default:0},
            {key:"ymethod",type:"string",default:"attributions"},
            {key:"barDensity",type:"number",default:1},
            {key:"barWidth",type:"number",default:50},
            {key:"centerBars",type:"checkbox",default:true},
            {key:"showPercents",type:"checkbox",default:false},
            {key:"showErrorBars",type:"checkbox",default:false},
            {key:"errorRisk",type:"number",default:5},

        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        let optionsY = [{"name":"% of attributions","value":"attributions"},{"name":"% of intensity","value":"intensity"},{"name":"nb of attribution","value":"count"}]
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xtype",type:"selectCols",value:this.cfg.xtype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ymethod",type:"select",value:this.cfg.ymethod,options:optionsY,title: "The type of y axis: relative, absolute, percentage of intensity...",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"bar(s)/unit",
            "inputs":[
                {key:"barDensity",type:"number",value:this.cfg.barDensity,title: "The number of bars per unit on the x axis",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"bars width (%)",
            "inputs":[
                {key:"barWidth",type:"number",value:this.cfg.barWidth,title: "The percentage of the unit that the bar will cover. Reducing this value will show more blank spaces",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Center bars",
            "inputs":[
                {key:"centerBars",type:"checkbox",value:this.cfg.centerBars,title: "Should there be an offset to center each bar on its unit. If unchecked, the bar will start at the beginning of the bin",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Show %",
            "inputs":[
                {key:"showPercents",type:"checkbox",value:this.cfg.showPercents,title: "Show a text percentage over each bar",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Matrix options",
            "inputs":[
                {key:"none",type:"button",options:{fct: ()=>{}},value:"?",title: "By using the options below, error bars will appear for matrices containing differents columns for different files. Bar height will no longer be related to full file but  to mean height over every file individually",update:(d)=>{}},
            ]
        })
        varsArray.push({"name":"Show error bars",
            "inputs":[
                {key:"showErrorBars",type:"checkbox",value:this.cfg.showErrorBars,title: "Show error bars computed from matrix columns",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let errorRiskOptions = [{name:"10%",value:10},{name:"5%",value:5},{name:"4%",value:4},{name:"3%",value:3},{name:"2%",value:2},{name:"1%",value:1},{name:"0.5%",value:0.5},{name:"0.1%",value:0.1}]
        varsArray.push({"name":"Error risk",
            "inputs":[
                {key:"errorRisk",type:"select",value:this.cfg.errorRisk,options:errorRiskOptions,title: "The error allowed for computing error bars. Student's law",update:(d)=>{this.cfg.update(d)}},
            ]
        })


        return varsArray
    }
}

class CanvasCell_histodiscrete extends CanvasCell_histo{
    constructor(parent, index, cfg){
        super(parent, index, cfg)
        this.cfg.prepareCfg("histodiscrete")
        this.draw()
    }
    /**draw the plot */
    draw(){
        //replaces default drawing
        if(debug){console.log("drawing CanvasCell"+this.index+"from canvas"+this.canvas.letter)}
        //removing old cell
        this.destroy()
        //creating linear scales
        let catList = this.prepareAllCatList()
        let data = this.prepareDataCatList(catList)
        this.reorderCatList(catList, -1)
        this.catList = catList
        catList = catList.slice(0,this.cfg.xmax)
        this.scales=[];
        this.scales[0]= d3.scaleBand().domain(catList).range([0, this.cfg.config.width]);
        this.scales[1]= d3.scaleLinear().domain([this.cfg.ymin, this.cfg.ymax]).range([this.cfg.config.height, 0]);
        //creating new elements
        this.svgSpace = appendCell("#"+this.canvas.html.id,"cell"+this.index,"#cell"+(this.index+1), this.cfg.config)
        this.clipPath = appendClipPath(this.svgSpace, "clipCvs"+this.canvas.letter+"Cell"+this.index,this.cfg.config)
        this.background = appendBackColor(this.svgSpace,100, this.cfg.config)
        if(!this.cfg || !this.cfg.type){return;}
        appendLine(this.svgSpace, 4, "grey")
        this.drawnData = [] // will be an array of datasets drawn
        //creating axes
        this.axes=[];
        this.axes[0]= appendAxis_x(this.svgSpace, this.scales[0], this.cfg.config.height, this.cfg.xmax, this.cfg.config)
        this.axes[1]= appendAxis_y(this.svgSpace, this.scales[1],  this.cfg.ymax, this.cfg.config)
        if(this.cfg.config.boxBorders){
            this.boxBorders = appendBoxScales(this.svgSpace, this.scales[0], this.scales[1], this.cfg.config)
        }
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = "Relative %"
        if(this.cfg.ymethod == "attributions"){
            axisLabel_y = "% of attributions"
        }else if(this.cfg.ymethod == "intensity"){
            axisLabel_y= "% of intensity"
        }else if(this.cfg.ymethod == "count"){
            axisLabel_y = "Number of attributions"
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);
        //create brushing or filtration
        this.createBrushFilter("histodiscrete")
        this.drawAllData()
        this.drawColourLegends(true)
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index, specialInfo){
        //redirects to matrix if needed
        if(this.cfg.showErrorBars){this.drawDataMatrix(dataset, index, specialInfo);return;}
        let suppID = ""
        if(specialInfo != "highlight"){
            super.drawData(dataset, index)
        }else{
            d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_highlight").remove()
            suppID = "_highlight"
        }
        if(!this.cfg.activeData[index]){return;}


        let theseBins = []
        let color = dataset.cfg.colorSolid
        if(specialInfo == "filter" && dataset.dataFiltered && dataset.dataFiltered.length >0){
            //drawing bins for filtering
            theseBins = this.prepareDataCatList_special(this.catList,index, dataset.dataFiltered, "filtered")
            this.drawFiltersTitles()
        }else if(specialInfo== "highlight" && dataset.dataHighlighted && dataset.dataHighlighted.length >0){
            //drawing bins for highlighting
            theseBins = this.prepareDataCatList_special(this.catList,index, dataset.dataHighlighted, "highlighted")
            color = this.canvas.cfg.interactivity.histoColor
        }
        else{
            //drawing the classical way
            theseBins = dataset.findBinsDiscrete("cell"+this.index)
        }
        if(!theseBins || !theseBins.bins || !theseBins.bins[0]){return}

        let dataNb = this.findNumberOfData()
        let dataNbBefore = this.findNumberOfDataBefore(index)
        let bandWidth = this.scales[0].bandwidth()
        let binWidth = bandWidth/dataNb

        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index+suppID)
        .selectAll("rect")
        .data(theseBins.bins)
        .enter()
        .append("rect")
            .attr("x", (d) => {
                if(!this.scales[0](d.name) && this.scales[0](d.name) !=0){return -100}
                return this.findX(d, dataNb, dataNbBefore, binWidth)+0.5*bandWidth
            })
            .attr("width", (d) =>{return Math.max(1, binWidth*this.cfg.barWidth*0.01 -1)})
            .attr("y", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.intensity/theseBins.totalHeight)}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.length/(theseBins.totalNumber - 1))}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.length)}
            })
            .attr("height",(d,n)=>{
                if(this.cfg.ymethod == "intensity"){return this.cfg.config.height - this.scales[1](100*d.intensity/theseBins.totalHeight)}
                else if(this.cfg.ymethod =="attributions"){return this.cfg.config.height - this.scales[1](100*d.length/(theseBins.totalNumber - 1))}
                else if(this.cfg.ymethod == "count"){return this.cfg.config.height - this.scales[1](d.length)}
            })
            .style("fill", color)
            .attr("fillColor", color)
            .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
            .attr('tooltipHTML', (d,n) => {return "histodiscrete"+";"+index+";"+n})
            .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
            .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"histodiscrete",n, this)}  )
            .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d,true)}  )
            .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"histodiscrete",n, this)} );
    
        
        if(this.cfg.showPercents){
            this.drawnData[index] += this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index+suppID)
                .selectAll("rect")
                .data(theseBins.bins)
                .enter()
                .append("text")
                .attr("x", (d) => {
                    if(!this.scales[0](d.name) && this.scales[0](d.name) !=0){return -100}
                    return this.findX(d, dataNb, dataNbBefore, binWidth) + 0.5*binWidth*this.cfg.barWidth*0.01+0.5*bandWidth})
                .attr("y", (d,n) =>{
                    if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.intensity/theseBins.totalHeight)}
                    else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.length/(dataset.data.length - 1))}
                    else if(this.cfg.ymethod == "count"){return this.scales[1](d.length)}
                })
                .attr("font-size", this.cfg.config.legendFontSizeSmall)
                .attr("text-anchor","middle")
                .attr("fill","black")
                .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
                .text((d,n)=>{return this.findPercentText(theseBins,d,n)})           
        }
    }


    drawDataMatrix(dataset, index, specialInfo){
        super.drawData(dataset, index)
        d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_highlight").remove()
        if(!this.cfg.activeData[index]){return;}

        let theseBins = []
        let color = dataset.cfg.colorSolid
        if(specialInfo == "filter" && dataset.dataFiltered && dataset.dataFiltered.length >0){
            //drawing bins for filtering
            theseBins = this.prepareDataCatList_special(this.catList,index, dataset.dataFiltered, "filtered")
            this.drawFiltersTitles()
        }else if(specialInfo== "highlight" && dataset.dataHighlighted && dataset.dataHighlighted.length >0){
            //drawing bins for highlighting
            theseBins = this.prepareDataCatList_special(this.catList,index, dataset.dataHighlighted, "highlighted")
            color = this.canvas.cfg.interactivity.histoColor
        }
        else{
            //drawing the classical way
            theseBins = dataset.findBinsDiscrete("cell"+this.index)
        }
        //prepares error bars and data related to it
        dataset.prepareAsMatrix()
        dataset.prepareBinsForMatrix(theseBins)
        if(!theseBins || !theseBins.bins || !theseBins.bins[0]){return}

        let dataNb = this.findNumberOfData()
        let dataNbBefore = this.findNumberOfDataBefore(index)
        let bandWidth = this.scales[0].bandwidth()
        let binWidth = bandWidth/dataNb

        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("rect")
        .data(theseBins.bins)
        .enter()
        .append("rect")
            .attr("x", (d) => {
                if(!this.scales[0](d.name) && this.scales[0](d.name) !=0){return -100}
                return this.findX(d, dataNb, dataNbBefore, binWidth)+0.5*bandWidth
            })
            .attr("width", (d) =>{return Math.max(1, binWidth*this.cfg.barWidth*0.01 -1)})
            .attr("y", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.matrixMeanI)}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.matrixMeanCount)}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.matrixMeanCountAbsolute)}
            })
            .attr("height",(d,n)=>{
                if(this.cfg.ymethod == "intensity"){return this.cfg.config.height - this.scales[1](100*d.matrixMeanI)}
                else if(this.cfg.ymethod =="attributions"){return this.cfg.config.height - this.scales[1](100*d.matrixMeanCount)}
                else if(this.cfg.ymethod == "count"){return this.cfg.config.height - this.scales[1](d.matrixMeanCountAbsolute)}
            })
            .style("fill", color)
            .attr("fillColor", color)
            .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
            .attr('tooltipHTML', (d,n) => {return "histodiscrete"+";"+index+";"+n})
            .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
            .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"histodiscrete",n, this)}  )
            .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d,true)}  )
            .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"histodiscrete",n, this)} );
    
        
        if(this.cfg.showPercents){
            this.drawnData[index] += this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index)
                .selectAll("rect")
                .data(theseBins.bins)
                .enter()
                .append("text")
                .attr("x", (d) => {
                    if(!this.scales[0](d.name) && this.scales[0](d.name) !=0){return -100}
                    return this.findX(d, dataNb, dataNbBefore, binWidth) + 0.5*binWidth*this.cfg.barWidth*0.01+0.5*bandWidth})
                .attr("y", (d,n) =>{
                    if(this.cfg.ymethod == "intensity"){return this.scales[1](100*theseBins.heights[n]/theseBins.totalHeight)}
                    else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.length/(dataset.data.length - 1))}
                    else if(this.cfg.ymethod == "count"){return this.scales[1](d.length)}
                })
                .attr("font-size", this.cfg.config.legendFontSizeSmall)
                .attr("text-anchor","middle")
                .attr("fill","black")
                .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
                .text((d,n)=>{return this.findPercentText(theseBins,d,n)})           
        }

        let matrixCols = dataset.matrixCols
        let matrixFilesNb = matrixCols[1] - matrixCols[0]
        let studentCoeff = getStudentsLawS(this.cfg.errorRisk,matrixFilesNb) 
        if(debug){console.log("students coefficient:",studentCoeff)}
        //draws error bars
        this.drawnData[index] += this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index)
            .selectAll("rect")
            .data(theseBins.bins)
            .enter()
            .append("rect")
            .attr("x", (d) => {
                if(!this.scales[0](d.name) && this.scales[0](d.name) !=0){return -100}
                return this.findX(d, dataNb, dataNbBefore, binWidth)+0.5*bandWidth+0.5*binWidth*this.cfg.barWidth*0.01
            })
            .attr("width", 1)
            .attr("y", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.matrixMeanI + 100*d.matrixStdDevI*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.matrixMeanCount + 100*d.matrixStdDevNb*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.matrixMeanCountAbsolute + d.matrixStdDevNbAbsolute*studentCoeff/Math.sqrt(matrixFilesNb))}
            })
            .attr("height", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.matrixMeanI - 100*d.matrixStdDevI*studentCoeff/Math.sqrt(matrixFilesNb))-this.scales[1](100*d.matrixMeanI + 100*d.matrixStdDevI*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.matrixMeanCount - 100*d.matrixStdDevNb*studentCoeff/Math.sqrt(matrixFilesNb))-this.scales[1](100*d.matrixMeanCount + 100*d.matrixStdDevNb*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.matrixMeanCountAbsolute - d.matrixStdDevNbAbsolute*studentCoeff/Math.sqrt(matrixFilesNb))-this.scales[1](d.matrixMeanCountAbsolute + d.matrixStdDevNbAbsolute*studentCoeff/Math.sqrt(matrixFilesNb))}
            })
            .style("fill", "#000000")
            .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
    }

    /** adds a new preparation of categories list to the drawing of all data */
    drawAllData(){
        let catList = this.prepareAllCatList()
        let data = this.prepareDataCatList(catList)
        this.reorderCatList(catList, -1)
        this.catList = catList
        catList = catList.slice(0,this.cfg.xmax)
        super.drawAllData()
    }

    //prepares the total list of bins categories
    prepareAllCatList(){
        let fullCatList = []
        this.canvas.data.forEach((dataset, dataIndex)=>{
            if(this.cfg.activeData[dataIndex] !="1"){return;}
            if(fullCatList.length >2000){return;}//stops if the list is too long, probably a problem
            fullCatList = dataset.prepareCatList(this.cfg.xtype, fullCatList)
        })
        //determines if the cat list contains a number value
        let isIntArray = false;
        for(let i=0; i<fullCatList.length; i++){
            if(!isNaN(fullCatList[i])){isIntArray = true}
        }
        if(this.cfg.xmethod.includes("alpha")){
            if(isIntArray){fullCatList.sort(function(a,b){return a-b})}
            else{fullCatList = alphaNumericalArraySort(fullCatList)}
        }
        if(this.cfg.xmethod.includes("2")){
            fullCatList.reverse()
        }
        return fullCatList
    }

    /** appends all data set to their category bins */
    prepareDataCatList(catList){
        this.cfg.activeData.forEach((isActive, index)=>{
            if(isActive != "1"){return;}
            let data = this.canvas.data[index]
            if(!data){return;}
            data.pushToCatList(this.cfg.xtype, catList, "cell"+this.index)
        })
    }

    prepareDataCatList_special(catList, index, specialData, name){
        let data = this.canvas.data[index]
        let bins = data.pushToCatList(this.cfg.xtype, catList, "cell"+this.index+"_"+name, specialData)
        //for special interactivity case of non+-relative bar heights, must add 1 to the total number computed to account for the absence of title header
        if(this.canvas.cfg.interactivity){
            if(!this.canvas.cfg.interactivity.histogramRelativity){bins.totalNumber +=1}
        }
        return bins
    }

    /**reorders the bins and the catlist based on the method chosen. If datanum == -1 then looks for the first filled dataset */
    reorderCatList(catList, dataNum){
        //looks for the first filled dataset
        if(dataNum == -1){
            let activeData = this.cfg.activeData
            for(let i=0; i<activeData.length; i++){
                if(activeData[i] == "1" && this.canvas.data[i] && this.canvas.data[i].data.length >0){
                    dataNum = i
                    break;
                }  
            }
        }
        let isIntArray = false;
        for(let i=0; i<catList.length; i++){
            if(!isNaN(catList[i])){isIntArray = true}
        }
        if(this.cfg.xmethod.includes("alpha")){
            if(isIntArray){catList.sort(function(a,b){return a-b})}
            else{catList = alphaNumericalArraySort(catList)}
        }else if(this.cfg.xmethod.includes("num")){
            if(!this.canvas.data[dataNum]){return;}
            let bins = this.canvas.data[dataNum].findBinsDiscrete("cell"+this.index)
            if(!bins || !bins.bins){return;}
            if(this.cfg.ymethod == "attributions" || this.cfg.ymethod == "count"){
                bins.bins.sort(function(a,b){return b.length-a.length})
            }else if(this.cfg.ymethod == "intensity"){
                bins.bins.sort(function(a,b){return b.intensity-a.intensity})
            }
            catList = sortArrayBasedOnArrayIndex(catList, bins.bins, "name")
        }

        if(this.cfg.xmethod.includes("2")){
            catList.reverse()
        }
        return catList
    }

    update(content, doNotUpdateDomains){
        //replace default behaviour
        if(debug){console.log("updating CanvasCell"+this.index+" from canvas"+this.canvas.letter+"content:"+content)}

        if(content.includes("xtype_") ||content.includes("xmethod_")||content.includes("xmax_")|| content.includes("all")){
            //updating the x axis
            let catList = this.prepareAllCatList()
            catList = catList.slice(0, this.cfg.xmax)
            this.catList = catList
            if(!doNotUpdateDomains){this.scales[0].domain(catList).range([0, this.cfg.config.width])}
            this.axes[0].call(d3.axisBottom(this.scales[0]))
        }
        if(content.includes("ytype_") ||content.includes("ymin_")||content.includes("ymax_")|| content.includes("all")){
            //updating the y axis
            if(!doNotUpdateDomains){this.scales[1].domain([this.cfg.ymin, this.cfg.ymax])}
            updateAxisLeft(this.axes[1], this.scales[1], this.cfg.ymax)
        }
        // if(content.includes("xmethod")||content.includes("xtype")){
        //     let catList = this.prepareAllCatList()
        //     this.prepareDataCatList(catList)
        // }

        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = "Relative %"
        if(this.cfg.ymethod == "attributions"){
            axisLabel_y = "% of attributions"
        }else if(this.cfg.ymethod == "intensity"){
            axisLabel_y= "% of intensity"
        }else if(this.cfg.ymethod == "count"){
            axisLabel_y = "Number of attributions"
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels[0].text(axisLabel_x);
        this.axesLabels[1].text(axisLabel_y);
    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        this.update("all",false)
        let catList = this.prepareAllCatList()
        this.prepareDataCatList(catList)
        this.reorderCatList(catList, -1)
        //update x axis
        catList = catList.slice(0, this.cfg.xmax)
        this.scales[0].domain(catList).range([0, this.cfg.config.width])
        this.axes[0].call(d3.axisBottom(this.scales[0]))
        this.catList = catList
        // update data
        this.drawData(this.canvas.data[dataNum],dataNum)
    }

    /** if the filter comes from this histogram, it should not be counted */
    handleFiltering(indexesList){
        if(!this.canvas.cfg.interactivity.filterWorkonHistograms){return;}
        let activeData = this.canvas.cfg.interactivity.active
        //checks if the only filter is on this chart, skips 
        if(this.canvas.filters.length == 1){
            if(this.canvas.filters[0] &&this.canvas.filters[0].cellIndex == this.index){return;}
        }
        for(let i=0; i<this.canvas.data.length; i++){
            if(activeData !="all" && activeData !=i){return}
            let dataset = this.canvas.data[i]
            if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
            this.drawData(this.canvas.data[i], i, "filter")
        }
    }

    handleHighlighting(){
        //check if this method of brushing is active, because it can be disabled
        if(!this.canvas.cfg.interactivity.createHistogramBars){return;}
        for(let i=0; i<this.canvas.data.length; i++){
            let dataset = this.canvas.data[i]
            if(!dataset.highlight){continue;}
            if(dataset.highlight.cellIndex == this.index){continue;}
            if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
            if(this.canvas.cfg.interactivity.active != "all" && this.canvas.cfg.interactivity.active != i){continue;}
            this.drawData(this.canvas.data[i], i, "highlight")
        }
    }

    autoscale(){
        if(debug){console.log("autoscaling cell n°"+this.index+" from canvas"+this.canvas.letter)}
        let data = []
        let binSets = []
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            if( item.data.length >0 && this.cfg.activeData[index] == "1"){//only push the datasets containing data
                data.push(item.data)
            } 
            let theseBins = item.findBinsDiscrete("cell"+this.index)
            if( theseBins.bins && this.cfg.activeData[index] == "1"){//only push the datasets containing data
                binSets.push(theseBins)
            } 
        })

        let genMax = 0
        binSets.forEach((set, index)=>{
            let localMax = 0
            if(this.cfg.ymethod == "intensity"){
                localMax = 100*Math.max(...set.heights)/set.totalHeight
            }else if(this.cfg.ymethod == "attributions"){
                set.bins.forEach((bin)=>{if(bin.length>localMax){localMax = bin.length}})
                if(this.canvas.data[index] && this.canvas.data[index].data){
                    localMax = 100*localMax/this.canvas.data[index].data.length
                }else{localMax = 0}
            }else if(this.cfg.ymethod =="count"){
                set.bins.forEach((bin)=>{if(bin.length>localMax){localMax = bin.length}})
            }
            if(localMax >genMax){genMax = localMax}
        })
        this.cfg.ymin = 0
        this.cfg.ymax = Math.ceil(genMax)+10
        this.draw()
        this.drawAllData() 
    }

    prepareCfg(){
        let properties = [
            {key:"xmax",type:"number",default:10}, //replaces default
            {key:"ymax",type:"number",default:100},//replaces default
            {key:"xtype",type:"number",default:0},
            {key:"xmethod",type:"number",default:"alpha1"},
            {key:"ymethod",type:"number",default:"attributions"},
            {key:"barWidth",type:"number",default:50},
            {key:"centerBars",type:"checkbox",default:true},
            {key:"showPercents",type:"checkbox",default:false},
            {key:"showErrorBars",type:"checkbox",default:false},
            {key:"errorRisk",type:"number",default:5},
        ]

        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        let optionsX  =[{"name":"Alphabetical(A-Z)","value":"alpha1"},{"name":"Alphabetical(Z-A)","value":"alpha2"},{"name":"Numerical(1-100)","value":"num1"},{"name":"Numerical(100-1)","value":"num2"}]
        let optionsY = [{"name":"% of attributions","value":"attributions"},{"name":"% of intensity","value":"intensity"},{"name":"nb of attribution","value":"count"}]
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xtype",type:"selectCols",value:this.cfg.xtype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"max bars",
            "inputs":[
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"x sorting",
            "inputs":[
                {key:"xmethod",type:"select",value:this.cfg.xmethod,options:optionsX,title: "The order of bars. Numerical means sorting by most/least intense of the first data active",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ymethod",type:"select",value:this.cfg.ymethod,options:optionsY,title: "The type of y axis: relative, absolute, percentage of intensity...",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"bars width (%)",
            "inputs":[
                {key:"barWidth",type:"number",value:this.cfg.barWidth,title: "The percentage of the unit that the bar will cover. Reducing this value will show more blank spaces",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Center bars",
            "inputs":[
                {key:"centerBars",type:"checkbox",value:this.cfg.centerBars,title: "Should there be an offset to center each bar on its unit. If unchecked, the bar will start at the beginning of the bin",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Show %",
            "inputs":[
                {key:"showPercents",type:"checkbox",value:this.cfg.showPercents,title: "Show a text percentage over each bar",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Matrix options",
            "inputs":[
                {key:"none",type:"button",options:{fct: ()=>{}},value:"?",title: "By using the options below, error bars will appear for matrices containing differents columns for different files. Bar height will no longer be related to full file but  to mean height over every file individually",update:(d)=>{}},
            ]
        })
        varsArray.push({"name":"Show error bars",
            "inputs":[
                {key:"showErrorBars",type:"checkbox",value:this.cfg.showErrorBars,title: "Show error bars computed from matrix columns",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let errorRiskOptions = [{name:"10%",value:10},{name:"5%",value:5},{name:"4%",value:4},{name:"3%",value:3},{name:"2%",value:2},{name:"1%",value:1},{name:"0.5%",value:0.5},{name:"0.1%",value:0.1}]
        varsArray.push({"name":"Error risk",
            "inputs":[
                {key:"errorRisk",type:"select",value:this.cfg.errorRisk,options:errorRiskOptions,title: "The error allowed for computing error bars. Student's law",update:(d)=>{this.cfg.update(d)}},
            ]
        })
       
        return varsArray
    }
}




class CanvasCell_histoclass extends CanvasCell_histo{
    constructor(parent, index, cfg){
        super(parent, index, cfg)
        this.cfg.prepareCfg("histoclass")
        this.draw()
    }
    /**draw the plot */
    draw(){
        //replaces default drawing
        if(debug){console.log("drawing CanvasCell"+this.index+"from canvas"+this.canvas.letter)}
        //removing old cell
        this.destroy()
        //creating linear scales
        let classList = this.prepareAllClassList()
        this.reorderCatList(classList, -1)
        classList = classList.slice(0,this.cfg.xmax)
        if(this.cfg.regroupSmallBars){
            classList = this.prepareReducedClassList(classList)
        }
        this.scales=[];
        this.classList = classList
        this.scales[0]= d3.scaleBand().domain(classList).range([0, this.cfg.config.width]);
        this.scales[1]= d3.scaleLinear().domain([this.cfg.ymin, this.cfg.ymax]).range([this.cfg.config.height, 0]);
        //creating new elements
        this.svgSpace = appendCell("#"+this.canvas.html.id,"cell"+this.index,"#cell"+(this.index+1), this.cfg.config)
        this.clipPath = appendClipPath(this.svgSpace, "clipCvs"+this.canvas.letter+"Cell"+this.index, this.cfg.config)
        this.background = appendBackColor(this.svgSpace,100, this.cfg.config)
        if(!this.cfg || !this.cfg.type){return;}
        appendLine(this.svgSpace, 4, "grey")
        this.drawnData = [] // will be an array of datasets drawn
        //creating axes
        this.axes=[];
        this.axes[0]= appendAxis_x(this.svgSpace, this.scales[0], this.cfg.config.height, this.cfg.xmax, this.cfg.config)
        this.axes[1]= appendAxis_y(this.svgSpace, this.scales[1],  this.cfg.ymax, this.cfg.config)
        if(this.cfg.config.boxBorders){
            this.boxBorders = appendBoxScales(this.svgSpace, this.scales[0], this.scales[1], this.cfg.config)
        }
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = "Class"
        let axisLabel_y = "Relative %"
        if(this.cfg.ymethod == "attributions"){
            axisLabel_y = "% of attributions"
        }else if(this.cfg.ymethod == "intensity"){
            axisLabel_y= "% of intensity"
        }else if(this.cfg.ymethod == "count"){
            axisLabel_y = "Number of attributions"
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);
        //create brushing or filtration
        this.createBrushFilter("histoclass")
        this.drawAllData()
        this.drawColourLegends(true)
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index, specialInfo){
        //redirects to matrix if needed
        if(this.cfg.showErrorBars){this.drawDataMatrix(dataset, index, specialInfo);return;}
        let suppID = ""
        if(specialInfo != "highlight"){
            super.drawData(dataset, index)
        }else{
            d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_highlight").remove()
            suppID = "_highlight"
        }
        if(!this.cfg.activeData[index]){return;}

        let theseBins = []
        let color = dataset.cfg.colorSolid
        if(specialInfo == "filter" && dataset.dataFiltered && dataset.dataFiltered.length >0){
            //drawing bins for filtering
            theseBins = this.prepareDataClassList_special(this.classList,index, dataset.dataFiltered, "filtered")
            this.drawFiltersTitles()
        }else if(specialInfo== "highlight" && dataset.dataHighlighted && dataset.dataHighlighted.length >0){
            //drawing bins for highlighting
            theseBins = this.prepareDataClassList_special(this.classList,index, dataset.dataHighlighted, "highlighted")
            color = this.canvas.cfg.interactivity.histoColor
        }
        else{
            //drawing the classical way
            theseBins = dataset.findBinsDiscrete("cell"+this.index)
        }
        if(this.cfg.regroupSmallBars){
            theseBins = this.reduceBins(theseBins, this.classList)
        }

        if(!theseBins || !theseBins.bins || !theseBins.bins[0]){return}

        let dataNb = this.findNumberOfData()
        let dataNbBefore = this.findNumberOfDataBefore(index)
        let bandWidth = this.scales[0].bandwidth()
        let binWidth = bandWidth/dataNb

        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index+suppID)
        .selectAll("rect")
        .data(theseBins.bins)
        .enter()
        .append("rect")
            .attr("x", (d) => {
                if(!this.scales[0](d.name) && this.scales[0](d.name) !=0){return -100}
                return this.findX(d, dataNb, dataNbBefore, binWidth)+0.5*bandWidth
            })
            .attr("width", (d) =>{return Math.max(1, binWidth*this.cfg.barWidth*0.01 -1)})
            .attr("y", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.intensity/theseBins.totalHeight)}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.length/(theseBins.totalNumber - 1))}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.length)}
            })
            .attr("height",(d,n)=>{
                if(this.cfg.ymethod == "intensity"){return this.cfg.config.height - this.scales[1](100*d.intensity/theseBins.totalHeight)}
                else if(this.cfg.ymethod =="attributions"){return this.cfg.config.height - this.scales[1](100*d.length/(theseBins.totalNumber - 1))}
                else if(this.cfg.ymethod == "count"){return this.cfg.config.height - this.scales[1](d.length)}
            })
            .style("fill", color)
            .attr("fillColor", color)
            .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
            .attr('tooltipHTML', (d,n) => {return "histodiscrete"+";"+index+";"+n})
            .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
            .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"histodiscrete",n, this)}  )
            .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d,true)}  )
            .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"histodiscrete",n, this)} );
    
        
        if(this.cfg.showPercents){
            this.drawnData[index] += this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index+suppID)
                .selectAll("rect")
                .data(theseBins.bins)
                .enter()
                .append("text")
                .attr("x", (d) => {
                    if(!this.scales[0](d.name) && this.scales[0](d.name) !=0){return -100}
                    return this.findX(d, dataNb, dataNbBefore, binWidth) + 0.5*binWidth*this.cfg.barWidth*0.01+0.5*bandWidth})
                .attr("y", (d,n) =>{
                    if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.intensity/theseBins.totalHeight)}
                    else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.length/(dataset.data.length - 1))}
                    else if(this.cfg.ymethod == "count"){return this.scales[1](d.length)}
                })
                .attr("font-size", this.cfg.config.legendFontSizeSmall)
                .attr("text-anchor","middle")
                .attr("fill","black")
                .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
                .text((d,n)=>{return this.findPercentText(theseBins,d,n)})           
        }
    }

    drawDataMatrix(dataset, index, specialInfo){
        super.drawData(dataset, index)
        d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_highlight").remove()
        if(!this.cfg.activeData[index]){return;}

        let theseBins = []
        let color = dataset.cfg.colorSolid
        if(specialInfo == "filter" && dataset.dataFiltered && dataset.dataFiltered.length >0){
            //drawing bins for filtering
            theseBins = this.prepareDataClassList_special(this.classList,index, dataset.dataFiltered, "filtered")
            this.drawFiltersTitles()
        }else if(specialInfo== "highlight" && dataset.dataHighlighted && dataset.dataHighlighted.length >0){
            //drawing bins for highlighting
            theseBins = this.prepareDataClassList_special(this.classList,index, dataset.dataHighlighted, "highlighted")
            color = this.canvas.cfg.interactivity.histoColor
        }
        else{
            //drawing the classical way
            theseBins = dataset.findBinsDiscrete("cell"+this.index)
        }
        //prepares error bars and data related to it
        dataset.prepareAsMatrix()
        dataset.prepareBinsForMatrix(theseBins)
        if(this.cfg.regroupSmallBars){
            theseBins = this.reduceBins(theseBins, this.classList)
        }
        if(!theseBins || !theseBins.bins || !theseBins.bins[0]){return}

        let dataNb = this.findNumberOfData()
        let dataNbBefore = this.findNumberOfDataBefore(index)
        let bandWidth = this.scales[0].bandwidth()
        let binWidth = bandWidth/dataNb

        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("rect")
        .data(theseBins.bins)
        .enter()
        .append("rect")
            .attr("x", (d) => {
                if(!this.scales[0](d.name) && this.scales[0](d.name) !=0){return -100}
                return this.findX(d, dataNb, dataNbBefore, binWidth)+0.5*bandWidth
            })
            .attr("width", (d) =>{return Math.max(1, binWidth*this.cfg.barWidth*0.01 -1)})
            .attr("y", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.matrixMeanI)}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.matrixMeanCount)}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.matrixMeanCountAbsolute)}
            })
            .attr("height",(d,n)=>{
                if(this.cfg.ymethod == "intensity"){return this.cfg.config.height - this.scales[1](100*d.matrixMeanI)}
                else if(this.cfg.ymethod =="attributions"){return this.cfg.config.height - this.scales[1](100*d.matrixMeanCount)}
                else if(this.cfg.ymethod == "count"){return this.cfg.config.height - this.scales[1](d.matrixMeanCountAbsolute)}
            })
            .style("fill", color)
            .attr("fillColor", color)
            .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
            .attr('tooltipHTML', (d,n) => {return "histodiscrete"+";"+index+";"+n})
            .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
            .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"histodiscrete",n, this)}  )
            .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d,true)}  )
            .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"histodiscrete",n, this)} );
    
        
        if(this.cfg.showPercents){
            this.drawnData[index] += this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index)
                .selectAll("rect")
                .data(theseBins.bins)
                .enter()
                .append("text")
                .attr("x", (d) => {
                    if(!this.scales[0](d.name) && this.scales[0](d.name) !=0){return -100}
                    return this.findX(d, dataNb, dataNbBefore, binWidth) + 0.5*binWidth*this.cfg.barWidth*0.01+0.5*bandWidth})
                .attr("y", (d,n) =>{
                    if(this.cfg.ymethod == "intensity"){return this.scales[1](100*theseBins.heights[n]/theseBins.totalHeight)}
                    else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.length/(dataset.data.length - 1))}
                    else if(this.cfg.ymethod == "count"){return this.scales[1](d.length)}
                })
                .attr("font-size", this.cfg.config.legendFontSizeSmall)
                .attr("text-anchor","middle")
                .attr("fill","black")
                .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
                .text((d,n)=>{return this.findPercentText(theseBins,d,n)})           
        }
        let matrixCols = dataset.matrixCols
        let matrixFilesNb = matrixCols[1] - matrixCols[0]
        let studentCoeff = getStudentsLawS(this.cfg.errorRisk,matrixFilesNb) 
        if(debug){console.log("students coefficient:",studentCoeff)}
        //draws error bars
        this.drawnData[index] += this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index)
            .selectAll("rect")
            .data(theseBins.bins)
            .enter()
            .append("rect")
            .attr("x", (d) => {
                if(!this.scales[0](d.name) && this.scales[0](d.name) !=0){return -100}
                return this.findX(d, dataNb, dataNbBefore, binWidth)+0.5*bandWidth+0.5*binWidth*this.cfg.barWidth*0.01
            })
            .attr("width", 1)
            .attr("y", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.matrixMeanI + 100*d.matrixStdDevI*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.matrixMeanCount + 100*d.matrixStdDevNb*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.matrixMeanCountAbsolute + d.matrixStdDevNbAbsolute*studentCoeff/Math.sqrt(matrixFilesNb))}
            })
            .attr("height", (d,n) =>{
                if(this.cfg.ymethod == "intensity"){return this.scales[1](100*d.matrixMeanI - 100*d.matrixStdDevI*studentCoeff/Math.sqrt(matrixFilesNb))-this.scales[1](100*d.matrixMeanI + 100*d.matrixStdDevI*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod =="attributions"){return this.scales[1](100*d.matrixMeanCount - 100*d.matrixStdDevNb*studentCoeff/Math.sqrt(matrixFilesNb))-this.scales[1](100*d.matrixMeanCount + 100*d.matrixStdDevNb*studentCoeff/Math.sqrt(matrixFilesNb))}
                else if(this.cfg.ymethod == "count"){return this.scales[1](d.matrixMeanCountAbsolute - d.matrixStdDevNbAbsolute*studentCoeff/Math.sqrt(matrixFilesNb))-this.scales[1](d.matrixMeanCountAbsolute + d.matrixStdDevNbAbsolute*studentCoeff/Math.sqrt(matrixFilesNb))}
            })
            .style("fill", "#000000")
            .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
    }

    /** adds a new preparation of class list to the drawing of all data */
    drawAllData(){
        let classList = this.prepareAllClassList()
        this.reorderCatList(classList, -1)
        classList = classList.slice(0,this.cfg.xmax)
        if(this.cfg.regroupSmallBars){
            classList = this.prepareReducedClassList(classList)
        }
        this.classList = classList
        super.drawAllData()
    }

    reduceBins(bins, classList){
        let otherBin = []
        let namesList = []
        let sumInt = 0
        let max = bins.totalNumber 
        if(this.cfg.ytype == "intensity"){max = bins.totalHeight}
        if(!bins || !bins.bins){return;}
        for(let i=bins.bins.length-1; i>=0; i--){
            //if the class doesn't exist in the classList, pushes it to "Other"
            if(classList.indexOf(bins.bins[i].name) == -1){
                namesList.push(bins.bins[i].name)
                sumInt += bins.bins[i].intensity
                otherBin = otherBin.concat(bins.bins[i])
                bins.bins.splice(i, 1)
            }
        }
        otherBin.namesList = namesList
        otherBin.name = "Other"
        otherBin.intensity = sumInt
        otherBin.fused = true
        if(otherBin.length >0){bins.bins.push(otherBin)}
        return bins
    }

    /**prepares a reduced version of the class list for small bars */
    prepareReducedClassList(fullClassList){
        let classList = fullClassList.slice()
        this.canvas.data.forEach((dataset, dataIndex)=>{
            if(this.cfg.activeData[dataIndex] !="1"){return;}
            if(!dataset.data ||  dataset.data.length==0){return;}
            if(fullClassList.length >2000){return;}//stops if the list is too long, probably a problem
            let theseBins = dataset.findBinsDiscrete("cell"+this.index)
            let max = theseBins.totalNumber 
            if(this.cfg.ytype == "intensity"){max = theseBins.totalHeight}
            for(let i=theseBins.bins.length-1; i>=0; i--){
                let ratio = 100*theseBins.bins[i].length / max
                if(this.cfg.ytype =="intensity"){ ratio = 100*theseBins.bins[i].intensity / max}
                if(ratio<=this.cfg.regroupSmallBarsVal && classList[i]){
                    classList.splice(i,1)
                }
            }
        })
        if(classList.length != fullClassList.length){classList.push("Other")}
        return classList
    }

    //prepares the total list of bins categories
    prepareAllClassList(){
        let skeleton = this.cfg.skeleton.split(",")
        let hetero = this.cfg.heteroEls

        let fullClassList = []
        this.canvas.data.forEach((dataset, dataIndex)=>{
            if(this.cfg.activeData[dataIndex] !="1"){return;}
            if(!dataset.data ||  dataset.data.length==0){return;}
            if(fullClassList.length >2000){return;}//stops if the list is too long, probably a problem
            let results = dataset.prepareClassList(skeleton, hetero, fullClassList, "cell"+this.index,)
            fullClassList = results[0]
            this.bins = results[1]
        })
        //determines if the cat list contains a number value
        let isIntArray = false;
        for(let i=0; i<fullClassList.length; i++){
            if(!isNaN(fullClassList[i])){isIntArray = true}
        }
        if(this.cfg.xmethod.includes("alpha")){
            if(isIntArray){fullClassList.sort(function(a,b){return a-b})}
            else{fullClassList = alphaNumericalArraySort(fullClassList)}
        }
        if(this.cfg.xmethod.includes("2")){
            fullClassList.reverse()
        }
        return fullClassList
    }

    /**reorders the bins and the catlist based on the method chosen. If datanum == -1 then looks for the first filled dataset */
    reorderCatList(catList, dataNum){
        //looks for the first filled dataset
        if(dataNum == -1){
            let activeData = this.cfg.activeData
            for(let i=0; i<activeData.length; i++){
                if(activeData[i] == "1" && this.canvas.data[i] && this.canvas.data[i].data.length >0){
                    dataNum = i
                    break;
                }  
            }
        }
        let isIntArray = false;
        for(let i=0; i<catList.length; i++){
            if(!isNaN(catList[i])){isIntArray = true}
        }
        if(this.cfg.xmethod.includes("alpha")){
            if(isIntArray){catList.sort(function(a,b){return a-b})}
            else{catList = alphaNumericalArraySort(catList)}
            if(!this.canvas.data[dataNum]){return catList;}
            let bins = this.canvas.data[dataNum].findBinsDiscrete("cell"+this.index)
            if(!bins || !bins.bins){return catList;}
            bins.bins.sort(function(a, b) {
                return a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'});
            });
        }else if(this.cfg.xmethod.includes("num")){
            if(!this.canvas.data[dataNum]){return;}
            let bins = this.canvas.data[dataNum].findBinsDiscrete("cell"+this.index)
            if(!bins || !bins.bins){return;}
            if(this.cfg.ymethod == "attributions" || this.cfg.ymethod == "count"){
                bins.bins.sort(function(a,b){return b.length-a.length})
            }else if(this.cfg.ymethod == "intensity"){
                bins.bins.sort(function(a,b){return b.intensity-a.intensity})
            }
            catList = sortArrayBasedOnArrayIndex(catList, bins.bins, "name")
        }

        if(this.cfg.xmethod.includes("2")){
            catList.reverse()
            let bins = this.canvas.data[dataNum].findBinsDiscrete("cell"+this.index)
            if(bins && bins.bins){bins.bins.reverse()}
        }
        return catList
    }

    update(content, doNotUpdateDomains){
        //replace default behaviour
        if(debug){console.log("updating CanvasCell"+this.index+" from canvas"+this.canvas.letter+"content:"+content)}

        if(content.includes("xtype_") ||content.includes("xmethod_")||content.includes("xmax_")|| content.includes("all")){
            //updating the x axis
            let results = this.prepareAllClassList()
            let catList = results[0]
            catList = catList.slice(0, this.cfg.xmax)
            if(this.cfg.regroupSmallBars){
                catList = this.prepareReducedClassList(catList)
            }
            this.classList = catList
            if(!doNotUpdateDomains){this.scales[0].domain(catList).range([0, this.cfg.config.width])}
            this.axes[0].call(d3.axisBottom(this.scales[0]))
        }
        if(content.includes("ytype_") ||content.includes("ymin_")||content.includes("ymax_")|| content.includes("all")){
            //updating the y axis
            if(!doNotUpdateDomains){this.scales[1].domain([this.cfg.ymin, this.cfg.ymax])}
            updateAxisLeft(this.axes[1], this.scales[1], this.cfg.ymax)
        }
        // if(content.includes("xmethod")||content.includes("xtype")){
        //     let catList = this.prepareAllCatList()
        //     this.prepareDataCatList(catList)
        // }


        let axisLabel_x = "Class"
        let axisLabel_y = "Relative %"
        if(this.cfg.ymethod == "attributions"){
            axisLabel_y = "% of attributions"
        }else if(this.cfg.ymethod == "intensity"){
            axisLabel_y= "% of intensity"
        }else if(this.cfg.ymethod == "count"){
            axisLabel_y = "Number of attributions"
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels[0].text(axisLabel_x);
        this.axesLabels[1].text(axisLabel_y);
        //this overrides to be sure everything is updated
    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        this.update("all",false)
        let catList = this.prepareAllClassList()
        this.reorderCatList(catList, -1)
        if(this.cfg.regroupSmallBars){
            catList = this.prepareReducedClassList(catList)
        }
        //update x axis
        catList = catList.slice(0, this.cfg.xmax)
        this.scales[0].domain(catList).range([0, this.cfg.config.width])
        this.axes[0].call(d3.axisBottom(this.scales[0]))
        this.classList = catList
        // update data
        this.drawData(this.canvas.data[dataNum],dataNum)
        this.drawColourLegends(true)
    }

   /** if the filter comes from this histogram, it should not be counted */
    handleFiltering(indexesList){
        if(!this.canvas.cfg.interactivity.filterWorkonHistograms){return;}
        let activeData = this.canvas.cfg.interactivity.active
        if(this.canvas.filters.length == 1){
            if(this.canvas.filters[0] &&this.canvas.filters[0].cellIndex == this.index){return;}
        }
        for(let i=0; i<this.canvas.data.length; i++){
            if(activeData !="all" && activeData !=i){return}
            let dataset = this.canvas.data[i]
            if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
            this.drawData(this.canvas.data[i], i, "filter")
        }
    }

    handleHighlighting(){
        //check if this method of brushing is active, because it can be disabled
        if(!this.canvas.cfg.interactivity.createHistogramBars){return;}
        for(let i=0; i<this.canvas.data.length; i++){
            let dataset = this.canvas.data[i]
            if(!dataset.highlight){continue;}
            if(dataset.highlight.cellIndex == this.index){continue;}
            if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
            if(this.canvas.cfg.interactivity.active != "all" && this.canvas.cfg.interactivity.active != i){continue;}
            this.drawData(this.canvas.data[i], i, "highlight")
        }
    }/** if the filter comes from this histogram, it should not be counted */
    

    prepareDataClassList_special(classList, index, specialData, name){
        let data = this.canvas.data[index]
        let skeleton = this.cfg.skeleton.split(",")
        let hetero = this.cfg.heteroEls
        let bins = data.pushToClassList(skeleton, hetero, classList, "cell"+this.index+"_"+name, specialData)
        //for special interactivity case of non+-relative bar heights, must add 1 to the total number computed to account for the absence of title header
        if(this.canvas.cfg.interactivity){
            if(!this.canvas.cfg.interactivity.histogramRelativity){bins.totalNumber +=1}
        }
        return bins
    }

    autoscale(){
        if(debug){console.log("autoscaling cell n°"+this.index+" from canvas"+this.canvas.letter)}
        let data = []
        let binSets = []
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            if( item.data.length >0 && this.cfg.activeData[index] == "1"){//only push the datasets containing data
                data.push(item.data)
            } 
            let theseBins = item.findBinsDiscrete("cell"+this.index)
            if( theseBins.bins && this.cfg.activeData[index] == "1"){//only push the datasets containing data
                binSets.push(theseBins)
            } 
        })

        let genMax = 0
        binSets.forEach((set, index)=>{
            let localMax = 0
            if(this.cfg.ymethod == "intensity"){
                localMax = 100*Math.max(...set.heights)/set.totalHeight
            }else if(this.cfg.ymethod == "attributions"){
                set.bins.forEach((bin)=>{if(bin.length>localMax){localMax = bin.length}})
                if(this.canvas.data[index] && this.canvas.data[index].data){
                    localMax = 100*localMax/this.canvas.data[index].data.length
                }else{localMax = 0}
            }else if(this.cfg.ymethod =="count"){
                set.bins.forEach((bin)=>{if(bin.length>localMax){localMax = bin.length}})
            }
            if(localMax >genMax){genMax = localMax}
        })
        this.cfg.ymin = 0
        this.cfg.ymax = Math.ceil(genMax)+10
        this.draw()
        this.drawAllData() 
    }

    prepareCfg(){
        let properties = [
            {key:"xmax",type:"number",default:10}, //replaces default
            {key:"ymax",type:"number",default:100},//replaces default
            {key:"skeleton",type:"text",default:"C,H"},
            {key:"heteroEls",type:"Array",default:[{"name":"O","showNumber":true},{"name":"N","showNumber":true}]},
            {key:"xmethod",type:"number",default:"alpha1"},
            {key:"ymethod",type:"number",default:"attributions"},
            {key:"barWidth",type:"number",default:50},
            {key:"centerBars",type:"checkbox",default:true},
            {key:"showPercents",type:"checkbox",default:false},
            {key:"showErrorBars",type:"checkbox",default:false},
            {key:"errorRisk",type:"number",default:5},
            {key:"regroupSmallBars",type:"checkbox",default:false},
            {key:"regroupSmallBarsVal",type:"number",default:1}
        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        let optionsX  =[{"name":"Alphabetical(A-Z)","value":"alpha1"},{"name":"Alphabetical(Z-A)","value":"alpha2"},{"name":"Numerical(1-100)","value":"num1"},{"name":"Numerical(100-1)","value":"num2"}]
        let optionsY = [{"name":"% of attributions","value":"attributions"},{"name":"% of intensity","value":"intensity"},{"name":"nb of attribution","value":"count"}]
        varsArray.push({"name":"Skeleton: ",
            "inputs":[
                {key:"skeleton",type:"text",value:this.cfg.skeleton,title: "The elements making up the skeleton of the molecules",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Hetero classes: ",
            "inputs":[
                {key:"heteroEls",type:"button",options:{fct: ()=>{new Popup_editHeteroClassses("editHeteroClasses",this,this.cfg)}},value:"Customize heteroelements",title: "Customize the heteroelements making up the classes",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"max bars",
            "inputs":[
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"x sorting",
            "inputs":[
                {key:"xmethod",type:"select",value:this.cfg.xmethod,options:optionsX,title: "The order of bars. Numerical means sorting by most/least intense of the first data active",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ymethod",type:"select",value:this.cfg.ymethod,options:optionsY,title: "The type of y axis: relative, absolute, percentage of intensity...",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"bars width (%)",
            "inputs":[
                {key:"barWidth",type:"number",value:this.cfg.barWidth,title: "The percentage of the unit that the bar will cover. Reducing this value will show more blank spaces",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Center bars",
            "inputs":[
                {key:"centerBars",type:"checkbox",value:this.cfg.centerBars,title: "Should there be an offset to center each bar on its unit. If unchecked, the bar will start at the beginning of the bin",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Show %",
            "inputs":[
                {key:"showPercents",type:"checkbox",value:this.cfg.showPercents,title: "Show a text percentage over each bar",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Group smallest(<%)",
            "inputs":[
                {key:"regroupSmallBars",type:"checkbox",value:this.cfg.regroupSmallBars,title: "Check this to make a bar 'Other' appear",update:(d)=>{this.cfg.update(d)}},
                {key:"regroupSmallBarsVal",type:"number",value:this.cfg.regroupSmallBarsVal,title: "The percentage under which histograms bars are regrouped under 'other'",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Matrix options",
            "inputs":[
                {key:"none",type:"button",options:{fct: ()=>{}},value:"?",title: "By using the options below, error bars will appear for matrices containing differents columns for different files. Bar height will no longer be related to full file but  to mean height over every file individually",update:(d)=>{}},
            ]
        })
        varsArray.push({"name":"Show error bars",
            "inputs":[
                {key:"showErrorBars",type:"checkbox",value:this.cfg.showErrorBars,title: "Show error bars computed from matrix columns",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let errorRiskOptions = [{name:"10%",value:10},{name:"5%",value:5},{name:"4%",value:4},{name:"3%",value:3},{name:"2%",value:2},{name:"1%",value:1},{name:"0.5%",value:0.5},{name:"0.1%",value:0.1}]
        varsArray.push({"name":"Error risk",
            "inputs":[
                {key:"errorRisk",type:"select",value:this.cfg.errorRisk,options:errorRiskOptions,title: "The error allowed for computing error bars. Student's law",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        
       
        return varsArray
    }
}

/** desnity maps are a peculiar type of histogram in 2D and only for one dataset */
class CanvasCell_density extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index, cfg)
        this.cfg.prepareCfg("density")
        this.draw()
    }

    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, columnNames[this.cfg.xtype],axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, columnNames[this.cfg.ytype],axisOptions, this.cfg.config);
        //create brushing or filtration
        // this.createBrushFilter("histogram")
        this.drawAllData()
        this.drawColourLegendDensity(this.cfg.dataIndex)
    }
    
    drawData(dataset, index, specialData){
        super.drawData(dataset, index)
        if(!this.cfg.activeData[index]){return;} // is this data activated
        if(index != this.cfg.dataIndex){return;} //is this the only dataset that can be represented
        if(!this.drawnData){this.drawnData = []}

        let pixelWidth = this.cfg.config.width/this.cfg.resolutionX
        let pixelHeight =  this.cfg.config.height/this.cfg.resolutionY

        let speData
        if(specialData == "filter" && dataset.dataFiltered && dataset.dataFiltered.length >0){speData = dataset.dataFiltered}
        let data = dataset.calculate2DBins(this.cfg, speData)
        if(this.cfg.calculusChoice != "count"){
            this.prepareBinsMath(data)
        }
        //create the specific color scale
        let colorScale =this.prepareColorScale(data, dataset.cfg)
        if(colorScale == "solid"){return;}

        for(let i=0; i<this.cfg.resolutionX; i++){
            //draw pixels
            this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
            .selectAll("rect")
            .data(data[i])
            .enter()
            .append("rect")
                .attr("x", 1+this.scales[0](data[i].x0))
                .attr("y", (d)=> {return this.scales[1](d.y1)}) 
                .attr("width", pixelWidth+0.5) //+0.5 to avoid phantom white lines
                .attr("height", pixelHeight+0.5) 
                .style("fill",  (d)=> {
                    if(this.cfg.calculusChoice == "count"){return colorScale(d.length)}
                    else{return colorScale(d.math)}
                })
                .attr('tooltipHTML', (d,n) => {return "density"+";"+index+";"+n})
                .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
                .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"density",n, this)}  )
                .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d, true)}  )
                .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"density",n, this)} );
        }
    }

    handleFiltering(){
        if(!this.canvas.cfg.interactivity.filterWorkonHistograms){return;}
        let index = this.cfg.dataIndex
        let dataset = this.canvas.data[index]
        if(this.cfg.activeData[index] != "1" || !dataset  || dataset.data.length == 0){return;}
        let activeData = this.canvas.cfg.interactivity.active
        if(activeData !="all" && activeData !=index){return}
        this.drawData(dataset, index, "filter")
    }

    /**does the mathematical operation asked by the cfg on the bins*/
    prepareBinsMath(bins){
        for(let i=0; i<bins.length; i++){
            for(let j=0; j<bins[i].length; j++){
                if(this.cfg.mathOperation == "sum"){
                    this.doBinSum(bins[i][j])
                }else if(this.cfg.mathOperation == "mean"){
                    this.doBinMean(bins[i][j])
                }else if(this.cfg.mathOperation == "meanABS"){
                    this.doBinMeanABS(bins[i][j])
                }else if(this.cfg.mathOperation == "max"){
                    this.doBinMax(bins[i][j])
                }
            }
        }

    }

    doBinSum(bin){
        let col = this.cfg.ztype
        let value = 0
        for(let i=0; i<bin.length; i++){
            value += parseFloat(bin[i][col])
        }
        bin.math = value
    }

    doBinMean(bin){
        let col = this.cfg.ztype
        let value = 0
        let countValid =0
        for(let i=0; i<bin.length; i++){
            value += parseFloat(bin[i][col])
            if(!isNaN(bin[i][col])){countValid += 1}
        }
        if(countValid == 0){bin.math = -1; return;}
        value = value/countValid
        bin.math = value
    }
    doBinMeanABS(bin){
        let col = this.cfg.ztype
        let value = 0
        let countValid =0
        for(let i=0; i<bin.length; i++){
            value += Math.abs(parseFloat(bin[i][col]))
            if(!isNaN(bin[i][col])){countValid += 1}
        }
        if(countValid == 0){bin.math = -1; return;}
        value = value/countValid
        bin.math = value
    }
    doBinMax(bin){
        let col = this.cfg.ztype
        if(bin.length ==0){bin.math = -1; return;}
        let value = bin[0][col]
        for(let i=0; i<bin.length; i++){
            if(bin[i][col]>value){value = bin[i][col]}
        }
        bin.math = value 
    }

    /** returns [min, max] of each bin.math */
    findBinsExtremums(bins){
        let min = 0
        let max = 0
        for(let i=0; i<bins.length; i++){
            for(let j=0; j<bins[i].length; j++){
                let value = -1
                if(this.cfg.calculusChoice == "math"){
                    value = bins[i][j].math
                }else{
                    value = bins[i][j].length
                }
                if(value < min){min = value}
                else if(value >max){max = value}
            }
        }
        return [min,max]
    }


    /**prepares the specific color scale for these bins */
    prepareColorScale(bins, dataCfg){
        let min = this.cfg.zmin
        let max = this.cfg.zmax
        let relative = (this.cfg.colorScaleRelativity == "relative")

        if(relative){
           //find min and max in bins
            let extremes = this.findBinsExtremums(bins)
            let percentValue = (extremes[1] - extremes[0])/100
            min = extremes[0] + percentValue*min
            max = extremes[0] + percentValue*max
        }
        if(dataCfg.colorInvert){
            let temp = max
            max = min
            min =temp
        }
        //creation of the color scale
        let colorScale
        if(dataCfg.colorGradient =="whiteToSolid"){
            colorScale = d3.scaleSequential().domain([min, max]).range(["#ffffff", dataCfg.colorSolid])
        }else if(dataCfg.colorGradient && dataCfg.colorGradient.includes("custom_")){
            let customNb = dataCfg.colorGradient.split("_")[1]
            let customScale
            if(!isNaN(customNb)){customScale = config.customColors[customNb]}
            else{customScale = customColorPride}
            let weights = customScale.weights
            let domainWidth = parseFloat(max-min)
            let domain = []
            for(let i=0; i<weights.length; i++){
                let newValue = parseFloat(min) + parseFloat(weights[i]*domainWidth)
                domain.push(newValue)
            }
            colorScale = d3.scaleLinear().domain(domain).range(customScale.colors).clamp(true)
        }else if(dataCfg.colorGradient != "solid"){
            let colorChoice = "interpolate"+dataCfg.colorGradient
            colorScale = d3.scaleSequential().domain([min, max]).interpolator(d3[colorChoice])
        }else{return "solid"}
        this.colorScale = colorScale
        return colorScale
    }

    drawColourLegendDensity(index){
        if(!this.canvas.cfg.cellsElements.colorLegend){return;}
        this.colourLegend
        //remove previous
        let dataset = this.canvas.data[index]
        this.svgSpace.selectAll("g[id='legend_"+dataset.dataName+"']").remove()
        this.svgSpace.selectAll("g[id='legend_solid_"+dataset.dataName+"']").remove()
        //copies and modifies the data displayed on the legend because this is a special scenario
        let dataCfg = {}
        dataCfg.minColor = this.cfg.zmin
        dataCfg.maxColor = this.cfg.zmax
        if(this.colorScale){
            dataCfg.colorRelative = true
            dataCfg.relativeMin = this.colorScale.domain()[0]
            dataCfg.relativeMax = this.colorScale.domain()[1]
        }
        //skips if the data is restricted on only some charts
        if(!this.colorScale){return;}
        if(dataset.cfg.colorGradient =="solid"){
            this.colourLegend = createColourLegendSolid(this.svgSpace, dataset.name, dataCfg , this.cfg, 1)
        }else{
            this.colourLegend = createColourLegend(this.svgSpace, dataset.name, dataCfg , this.cfg, 1, this.colorScale)
        }
    }

    update(content, doNotUpdateDomains){
        this.draw()
    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        this.drawAllData()
    }


    prepareCfg(){
        let properties = [
            {key:"xtype",type:"number",default:0},
            {key:"ytype",type:"number",default:0},
            {key:"resolutionX",type:"number",default:10},
            {key:"resolutionY",type:"number",default:10},
            {key:"dataIndex",type:"number",default:0},
            {key:"colorScaleRelativity",type:"text",default:"relative"},
            {key:"zmin",type:"number",default:0},
            {key:"zmax",type:"number",default:100},
            {key:"calculusChoice",type:"text",default:"count"}, //math or count : math is an operation, count is only the number of attributions
            {key:"mathOperation",type:"text",default:"sum"}, //type of operation made
            {key:"ztype",type:"number",default:1}
        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        let optionsData = []
        for(let i=0; i<this.canvas.data.length; i++){
            optionsData.push({"name":"Data n°"+(i+1), "value":i})
        }
        varsArray.push({"name":"Only dataset shown:",
            "inputs":[
                {key:"dataIndex",type:"select",value:this.cfg.dataIndex,options:optionsData,title: "The dataset being represented on this chart",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xtype",type:"selectCols",value:this.cfg.xtype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ytype",type:"selectCols",value:this.cfg.ytype,title: "The data being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Resolution (x*y)",
            "inputs":[
                {key:"resolutionX",type:"number",value:this.cfg.resolutionX,title: "Number of x axis bins",update:(d)=>{this.cfg.update(d)}},
                {key:"resolutionY",type:"number",value:this.cfg.resolutionY,title: "Number of y axis bins",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let optionsColorAbs=[{"name":"Relative(%)","value":"relative"},{"name":"Absolute","value":"abs"}]
        varsArray.push({"name":"Color scale",
            "inputs":[
                {key:"colorScaleRelativity",type:"select",value:this.cfg.colorScaleRelativity,options:optionsColorAbs,title: "The pixels have a color. This determines the way it is scaled",update:(d)=>{this.cfg.update(d)}},
                {key:"zmin",type:"number",value:this.cfg.zmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"zmax",type:"number",value:this.cfg.zmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Method of computation",
            "inputs":[]
        })
        varsArray.push({"name":"Count attributions",
            "inputs":[
                {key:"calculusChoice",type:"radio",value:"count",title: "Check this to have color be a function of the number of attributions",options:{"radioCheck":this.cfg.calculusChoice},update:(d,p)=>{this.cfg.update(d,p)}},
            ]
        })
        let optionsMath=[{"name":"Sum of:","value":"sum"},{"name":"Mean of:","value":"mean"},{"name":"|Mean| of:","value":"meanABS"},{"name":"Max of:","value":"max"}]
        varsArray.push({"name":"Math operation",
            "inputs":[
                {key:"calculusChoice",type:"radio",value:"math",title: "Check this to have color be a function of math operations",options:{"radioCheck":this.cfg.calculusChoice},update:(d,p)=>{this.cfg.update(d,p)}},
                {key:"mathOperation",type:"select",value:this.cfg.mathOperation,options:optionsMath,title: "The operation that has to be made inside every pixel",update:(d)=>{this.cfg.update(d)}},
                {key:"ztype",type:"selectCols",value:this.cfg.ztype,title: "The data being used for math operations",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        return varsArray
    }
}
/************************************************************************************************ */
/*---------------------------------------COMPARISON CELLS ----------------------------------------*/

class CanvasCell_scatterPCA extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index)
        this.cfg.prepareCfg("scatterPCA")
        if(cfg){this.cfg.copyCfg(cfg)}
        else{
            this.cfg.xmin = -3
            this.cfg.xmax = 3
            this.cfg.ymin = -3
            this.cfg.ymax = 3
            this.setAxisTypesDefault()
        }
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = columnNames[this.cfg.ytype]
        if((!axisLabel_x || !axisLabel_y) && this.canvas.data[0].header){ 
            axisLabel_x = this.canvas.data[0].header[this.cfg.xtype]
            axisLabel_y = this.canvas.data[0].header[this.cfg.ytype]
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);
        if(!this.cfg.config.noGrid){
            this.grids = [];
            this.grids[0] = appendPlotGrid(this.svgSpace, this.scales[0],this.cfg.config.axisLines, "bottom", this.cfg.config);
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines,"side", this.cfg.config);
          }
        //create brushing or filtration
        this.createBrush("scatterPlot")
        let isEmpty = this.checkIfAllEmpty()
        if(!isEmpty){
            this.drawAllData()
            this.drawColourLegends(false)
        }
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index){
        super.drawData(dataset, index)
        if(!this.cfg.activeData[index]){return;}
        if(!this.drawnData){this.drawnData = []}
        //checks if datasets are valid or not
        if(!this.cfg.axisDefined){
            this.setAxisTypesDefault()
            if(!this.cfg.axisDefined){return;}
            else{
                if(!this.cfg.overrideAxis_x || this.cfg.overrideAxis_x == ""){
                    this.axesLabels[0].text(dataset.header[this.cfg.xtype])
                }
                if(!this.cfg.overrideAxis_y || this.cfg.overrideAxis_y == ""){
                    this.axesLabels[1].text(dataset.header[this.cfg.ytype])
                }
            }
        }
        //if the option is toggled, draw axes inside the chart to better understand the PCA
        if(this.cfg.showAxes){this.drawInsideAxes()}
        //find data 
        let data = dataset.data
        if(dataset.dataFiltered && dataset.dataFiltered.length){data = dataset.dataFiltered}
        //draws data
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => {return this.scales[0](d[this.cfg.xtype]); } ) 
        .attr("cy",  (d) =>{ return this.scales[1](d[this.cfg.ytype]); } ) 
        .attr("r",  (d) => {
             if(this.cfg.relativeSize){
                return this.cfg.dotSize*Math.sqrt(d[config.intensity])/config.sizeReductor;
            }else{
                return this.cfg.dotSize
            }})
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .style("fill", (d) => {
            if(dataset.cfg.colorGradient == "solid"){return dataset.colorScale(0)}else{return dataset.colorScale(d[dataset.cfg.colorType])}
        })
        .style("opacity",this.canvas.cfg.opacity)
        .attr('tooltipHTML', (d,n) => {return "scatterPlot"+";"+index+";"+n})
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"scatterPlot",n, this)}  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"scatterPlot",n, this)} );

        if(this.cfg.config.blackCircle){
            this.drawnData[index].style("stroke", this.cfg.config.blackCircleColor || "#000000")
            this.drawnData[index].style("stroke-width", this.cfg.config.blackCircleWidth || 1)
         }
    }
    
    drawInsideAxes(){
      let color = this.cfg.axesColor
      let xAxis = [[this.cfg.xmin, 0],[this.cfg.xmax, 0]]
      let yAxis = [[0, this.cfg.ymin],[0, this.cfg.ymax]]
      if(!this.axesInside){this.axesInside =[]}
      d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"_axis").remove()
      this.axesInside[0] = this.svgSpace.append("path").attr("id","cell"+this.index+"_axis")
      .datum(xAxis)
      .attr('stroke',color)
      .attr('stroke-width',1)
      .attr("fill","none")
      .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
      .attr("d", d3.line()
          .x((d)=>{ return this.scales[0](d[0]); })
          .y((d)=>{ return this.scales[1](d[1]); })
      )
      this.axesInside[1] = this.svgSpace.append("path").attr("id","cell"+this.index+"_axis")
      .datum(yAxis)
      .attr('stroke',color)
      .attr('stroke-width',1)
      .attr("fill","none")
      .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
      .attr("d", d3.line()
          .x((d)=>{ return this.scales[0](d[0]); })
          .y((d)=>{ return this.scales[1](d[1]); })
      )
    }

    checkIfAllEmpty(){
        if(!this.cfg.axisDefined){
            let margin = this.cfg.config.margin
            let container = this.svgSpace.append("foreignObject").attr("id","cell"+this.index+"data0")
                .attr("x",0)
                .attr("y",this.cfg.config.width/2)
                .attr("width", this.cfg.config.width + margin.left + margin.right)
                .attr("height", this.cfg.config.height + margin.top + margin.bottom)

            container.append("xhtml:div")
                .attr("height", this.cfg.config.height + margin.top + margin.bottom)
                .style("font-size", this.cfg.config.legendFontSizeSmall)
                .style("font-family", this.cfg.config.legendFont)
                .style("color","#ff0000")
                .html("Please first do a PCA analysis on a matrix file")
            return true
        }
        return false
    }

    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = columnNames[this.cfg.ytype]
        if((!axisLabel_x || !axisLabel_y) && this.canvas.data[0].header){ 
            axisLabel_x = this.canvas.data[0].header[this.cfg.xtype]
            axisLabel_y = this.canvas.data[0].header[this.cfg.ytype]
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels[0].text(axisLabel_x)
        this.axesLabels[1].text(axisLabel_y)
        //TODO :add an update of the brushing
        if(!this.cfg.config.noGrid){
            this.grids[0].call(d3.axisBottom(this.scales[0]).ticks(this.cfg.config.axisLines).tickSize(this.cfg.config.height).tickFormat(""))
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines).tickSize(-this.cfg.config.width).tickFormat(""))
        }
    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        let thisData = this.drawnData[dataNum]
        if(!thisData){return;}
        if(content.includes("xtype_") || content.includes("xmin_") || content.includes("xmax_")|| content.includes("all")){
            thisData.attr("cx", (d) => { return this.scales[0](d[this.cfg.xtype]); } ) 
        }if(content.includes("ytype_") || content.includes("ymax_")|| content.includes("ymin_")|| content.includes("all")){
            thisData.attr("cy", (d) => { return this.scales[1](d[this.cfg.ytype]); } ) 
        }if(content.includes("dotSize_")||content.includes("relativeSize_")|| content.includes("all")){
            thisData.attr("r", (d) => {
                if(this.cfg.relativeSize){
                    return this.cfg.dotSize*Math.sqrt(d[config.intensity])/config.sizeReductor;
                }
                    else{
                        return this.cfg.dotSize
                    }
            });
        }
        if(content.includes("opacity_")|| content.includes("all")){
            thisData.style("opacity", this.canvas.cfg.opacity)
        }
        if(this.cfg.showAxes){this.drawInsideAxes()}
    }
    prepareCfg(){
        let properties = [
            {key:"xtype",type:"number",default:0},
            {key:"ytype",type:"number",default:0},
            {key:"dotSize",type:"number",default:1},
            {key:"relativeSize",type:"checkbox",default:false},
            {key:"selectedCols",type:"text",default:"Component,PCA,Variable"},
            {key:"showAxes",type:"checkbox",default:false},
            {key:"axesColor",type:"color",default:"#000000"}
        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        let yOptions = this.prepareAxisChoices_allFiles()
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xtype",type:"select",value:this.cfg.xtype,options:yOptions,title: "The component being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ytype",type:"select",value:this.cfg.ytype,options:yOptions,title: "The component being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Dot size",
            "inputs":[
                {key:"relativeSize",type:"checkbox",value:this.cfg.relativeSize,title: "Check this to have points area related to their intensity",update:(d)=>{this.cfg.update(d)}},
                {key:"dotSize",type:"number",value:this.cfg.dotSize,title: "Size of dots",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Show axes",
            "inputs":[
                {key:"showAxes",type:"checkbox",value:this.cfg.showAxes,title: "Check this to display x and y axis on the chart",update:(d)=>{this.cfg.update(d)}},
                {key:"axesColor",type:"color",value:this.cfg.axesColor,title: "Color of axes",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        return varsArray
    }

    prepareAxisChoices_allFiles(){
        let choices = []
        this.canvas.data.forEach((dataset, index)=>{
            let columns = this.prepareAxisChoices(dataset.header)
            for(let i=0; i<columns.length; i++){
                let alreadyExists = false
                for(let j=0; j<choices.length; j++){
                    if(columns[i].value == choices[j].value){alreadyExists = true}
                }
                if(!alreadyExists){
                    choices.push(columns[i])
                }
            }
        })
        return choices
    }

    prepareAxisChoices(columns){
        if(!columns){return []}
        let choices = []
        let words = this.cfg.selectedCols.split(",")
        for(let i=0; i<columns.length; i++){
            let isValid = false;
            for(let j=0; j<words.length; j++){
                if(columns[i].includes(words[j])){
                    isValid = true
                }
            }
            if(isValid){
                choices.push({value:i,name:columns[i]})
            }
        }
        return choices
    }

    setAxisTypesDefault(){
        this.cfg.axisDefined = false //checks if wrong files have been put
        let columns = this.prepareAxisChoices_allFiles()
        if(!columns || columns.length<2){return;}
        this.cfg.xtype = columns[0].value
        this.cfg.ytype = columns[1].value
        this.cfg.axisDefined = true
    }
    
}

/** a chart for showing a */
class CanvasCell_massPCA extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index)
        this.cfg.prepareCfg("massPCA")
        if(cfg){this.cfg.copyCfg(cfg)}
        else{
            this.cfg.xmin = 0
            this.cfg.xmax = 1000
            this.cfg.ymin = -5
            this.cfg.ymax = 5
            this.setAxisTypesDefault()
        }
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = columnNames[config.mz]
        let axisLabel_y = columnNames[config.intensity]
        if(this.canvas.data[0].header){ 
            axisLabel_y = "Contribution to "+this.canvas.data[0].header[this.cfg.ytype]
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);
        if(!this.cfg.config.noGrid){
            this.grids = [];
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines,"side", this.cfg.config);
          }
        //create brushing or filtration
        this.createBrush("massSpectraPCA")
        let isEmpty = this.checkIfAllEmpty()
        if(!isEmpty){
            this.drawAllData()
            d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"line").remove()
            if(this.cfg.lineZero){this.drawLine()}
            this.drawColourLegends(this.cfg.forceSolidColor)
        }
    }
    drawData(dataset, index){
        super.drawData(dataset, index)
        if(!this.cfg.activeData[index]){return;}
        //checks if datasets are valid or not
        if(!this.cfg.axisDefined){
            this.setAxisTypesDefault()
            if(!this.cfg.axisDefined){return;}
        }
        //find data 
        let data = dataset.data
        if(dataset.dataFiltered && dataset.dataFiltered.length){data = dataset.dataFiltered}
        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x",  (d) => { return this.scales[0](d[config.mz]); } ) 
        .attr("y",  (d) =>{ 
            let y = this.scales[1](d[this.cfg.ytype])
            if(d[this.cfg.ytype]<0){y = this.scales[1](0)}
            return y; 
        } ) 
        .attr("width",1)
        .attr("height", (d) => {
            let height = this.scales[1](d[this.cfg.ytype]) - this.scales[1](0)
            if(d[this.cfg.ytype]>0){height =this.scales[1](0) - this.scales[1](d[this.cfg.ytype]) }
            return height; 
        })
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .style("fill", (d) => {
            if(this.cfg.forceSolidColor){
                if(d[this.cfg.ytype]<0){return this.cfg.negativeColor}
                else{return dataset.cfg.colorSolid}
            }else if(dataset.cfg.colorGradient == "solid"){
                return dataset.colorScale(0)
            }else{
                return dataset.colorScale(d[dataset.cfg.colorType])
            }
        })
        .style("opacity",this.canvas.cfg.opacity)
        .attr('tooltipHTML', (d,n) => {return "massSpectra"+";"+index+";"+n})
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"massSpectra",n, this)}  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"massSpectra",n, this)} );
    }
    drawLine(){
        d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"line").remove()
        const lineData = [{x:this.cfg.xmin,y:0},{x:this.cfg.xmax,y:0}]
        if(!this.line){this.regLine =[]}
        this.line = this.svgSpace.append("path").attr("id","cell"+this.index+"line")
        .datum(lineData)
        .attr('stroke',"black")
        .attr('stroke-width',1)
        .attr("fill","none")
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .attr("d", d3.line()
            .x((d)=>{ return this.scales[0](d.x); })
            .y((d)=>{ return this.scales[1](d.y); })
        )
    }
    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[config.mz]
        let axisLabel_y = columnNames[config.intensity]
        if(this.canvas.data[0].header){ 
            axisLabel_y = "Contribution to "+this.canvas.data[0].header[this.cfg.ytype]
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels[0].text(axisLabel_x)
        this.axesLabels[1].text(axisLabel_y)
        //TODO :add an update of the brushing
        if(!this.cfg.config.nogrid){
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines).tickSize(-this.cfg.config.width).tickFormat(""))
        }
    }
    
    updateData(content, dataNum){
        super.updateData(content, dataNum)
        let ytype = this.cfg.ytype
        let thisData = this.drawnData[dataNum]
        let maxInt = this.canvas.findMaxInt(false)
        if(!thisData){return;}
        if(content.includes("xmin_")|| content.includes("xmax_")|| content.includes("all")){
            thisData.attr("x",  (d) => { return this.scales[0](d[config.mz]); } ) 
        }if(content.includes("ytype_")||content.includes("ymin_")|| content.includes("ymax_")|| content.includes("all")){
            thisData.attr("y",  (d) =>{ 
                let y = this.scales[1](d[this.cfg.ytype])
                if(d[this.cfg.ytype]<0){y = this.scales[1](0)}
                return y; 
             } ) 
            thisData.attr("height",  (d) =>{
                let height = this.scales[1](d[this.cfg.ytype]) - this.scales[1](0)
                if(d[this.cfg.ytype]>0){height =this.scales[1](0) - this.scales[1](d[this.cfg.ytype]) }
                return height; 
            } ) 
            if(this.line){
                this.line.attr("d", d3.line()
                .x((d)=>{ return this.scales[0](d.x); })
                .y((d)=>{ return this.scales[1](d.y); })
                )
            }
        }
        if(content.includes("opacity_")|| content.includes("all")){
            thisData.style("opacity", this.canvas.cfg.opacity)
        }
        if(content.includes("forceSolidColor") || content.includes("negativeColor") || content.includes("ytype")){
            thisData.style("fill", (d) => {
                if(this.cfg.forceSolidColor){
                    if(d[this.cfg.ytype]<0){return this.cfg.negativeColor}
                    else{return this.canvas.data[dataNum].cfg.colorSolid}
                }else if(this.canvas.data[dataNum].cfg.colorGradient == "solid"){
                    return this.canvas.data[dataNum].colorScale(0)
                }else{
                    return this.canvas.data[dataNum].colorScale(d[this.canvas.data[dataNum].cfg.colorType])
                }
            })
            this.drawColourLegends(this.cfg.forceSolidColor)
        }
        if(content.includes("lineZero")){
            d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"line").remove()
            if(this.cfg.lineZero){this.drawLine()}
        }
    }

    autoscale(){
        super.autoscale()
    }

    checkIfAllEmpty(){
        if(!this.cfg.axisDefined){
            let margin = this.cfg.config.margin
            let container = this.svgSpace.append("foreignObject").attr("id","cell"+this.index+"data0")
                .attr("x",0)
                .attr("y",this.cfg.config.width/2)
                .attr("width", this.cfg.config.width + margin.left + margin.right)
                .attr("height", this.cfg.config.height + margin.top + margin.bottom)

            container.append("xhtml:div")
                .attr("height", this.cfg.config.height + margin.top + margin.bottom)
                .style("font-size", this.cfg.config.legendFontSizeSmall)
                .style("font-family", this.cfg.config.legendFont)
                .style("color","#ff0000")
                .html("Please first do a PCA analysis on a matrix file")
            return true
        }
        return false
    }

    prepareCfg(){
        let properties = [
            {key:"xtype",type:"number",default:config.mz},
            {key:"ytype",type:"number",default:0},
            {key:"selectedCols",type:"text",default:"Component,PCA,Variable"},
            {key:"forceSolidColor",type:"checkbox",default:false},
            {key:"negativeColor",type:"text",default:"#df4f50"},
            {key:"lineZero",type:"checkbox",default:false},
        ]
        return properties
    }

    
    preparePopupCfg(){
        let varsArray = []
        let yOptions = this.prepareAxisChoices_allFiles()
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ytype",type:"select",value:this.cfg.ytype,options:yOptions,title: "The component being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({ "name":"Force solid color",
            "inputs":[
                {key:"forceSolidColor",type:"checkbox",value:this.cfg.forceSolidColor,title: "Check to force a solid color on this mass spectra",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({ "name":"Negative values color",
            "inputs":[
                {key:"negativeColor",type:"color",value:this.cfg.negativeColor,title: "The color for peaks with a negative y value. Works only if forceSolidColor is on",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({ "name":"Draw y=0 line",
            "inputs":[
                {key:"lineZero",type:"checkbox",value:this.cfg.lineZero,title: "Draw a horizontal line to cut positive and negative values",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        return varsArray
    }
    prepareAxisChoices_allFiles(){
        let choices = []
        this.canvas.data.forEach((dataset, index)=>{
            let columns = this.prepareAxisChoices(dataset.header)
            for(let i=0; i<columns.length; i++){
                let alreadyExists = false
                for(let j=0; j<choices.length; j++){
                    if(columns[i].value == choices[j].value){alreadyExists = true}
                }
                if(!alreadyExists){
                    choices.push(columns[i])
                }
            }
        })
        return choices
    }

    prepareAxisChoices(columns){
        if(!columns){return []}
        let choices = []
        let words = this.cfg.selectedCols.split(",")
        for(let i=0; i<columns.length; i++){
            let isValid = false;
            for(let j=0; j<words.length; j++){
                if(columns[i].includes(words[j])){
                    isValid = true
                }
            }
            if(isValid){
                choices.push({value:i,name:columns[i]})
            }
        }
        return choices
    }

    setAxisTypesDefault(){
        this.cfg.axisDefined = false //checks if wrong files have been put
        let columns = this.prepareAxisChoices_allFiles()
        if(!columns || columns.length<2){return;}
        this.cfg.ytype = columns[0].value
        this.cfg.axisDefined = true
    }


}

/** this is a chart to display the samples of a PCA */
class CanvasCell_samplesPCA extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index)
        this.cfg.prepareCfg("samplesPCA")
        if(cfg){this.cfg.copyCfg(cfg)}
        else{
            this.cfg.xmin = -50
            this.cfg.xmax = 50
            this.cfg.ymin = -50
            this.cfg.ymax = 50
            this.setAxisTypesDefault()
        }
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}

        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = columnNames[this.cfg.ytype]
        if((!axisLabel_x || !axisLabel_y) && this.canvas.data[0].header){ 
            axisLabel_x = this.canvas.data[0].header[this.cfg.xtype]
            axisLabel_y = this.canvas.data[0].header[this.cfg.ytype]
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);
        if(!this.cfg.config.noGrid){
            this.grids = [];
            this.grids[0] = appendPlotGrid(this.svgSpace, this.scales[0],this.cfg.config.axisLines, "bottom", this.cfg.config);
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines,"side", this.cfg.config);
          }
        //create brushing or filtration
        this.createBrushFilter("matrix")
        let isEmpty = this.checkIfAllEmpty()
        if(!isEmpty){
            this.drawAllData()
            this.drawColourLegends(true)
        }
    }
    /**
     * draws a single dataset
     * @param {DataSet} dataset
     * @param {*} index the index to save this dataset to 
     */
    drawData(dataset, index){
        super.drawData(dataset, index)
        if(!this.cfg.activeData[index]){return;}
        if(!this.drawnData){this.drawnData = []}
        //checks if datasets are valid or not
        if(!this.cfg.axisDefined){
            this.setAxisTypesDefault()
            if(!this.cfg.axisDefined){return;}
            else{
                if(!this.cfg.overrideAxis_x || this.cfg.overrideAxis_x == ""){
                this.axesLabels[0].text(dataset.header[this.cfg.xtype])
                }
                if(!this.cfg.overrideAxis_y || this.cfg.overrideAxis_y == ""){
                this.axesLabels[1].text(dataset.header[this.cfg.ytype])
                }
            }
        }

        //find data 
        let data = []
        let colStartIndex = 0 //the starting index for file names to be found
        let colStartIndexPCA = 0  //the starting index for file PCA data to be found
        if(dataset.dataName == "matrix"){
            data = cvsPCA.loadings
            colStartIndex = parseInt(matrixFilesColumns[0])
            colStartIndexPCA = parseInt(matrixFilesColumns[1])
        }else if(dataset.dataName.includes("file")){
            let fileNum = parseInt(dataset.dataName.slice(5))
            let file = files.list[fileNum]
            if(!file || !file.matrix){return;}
            data = file.matrix.pca_loadings
            if(!data || !data.length){return;}
            colStartIndex = parseInt(file.matrix.matrixMin)
            colStartIndexPCA = parseInt(file.matrix.matrixMax)+1
            if(data[0]&& data[0][0] && isNaN(data[0][0])){data.shift()}
        }else{return;}
        this.colStartIndex = colStartIndex
        this.colStartIndexPCA = colStartIndexPCA
        if(this.cfg.showAxes){this.drawInsideAxes()}
        //draws data
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index)
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => {return this.scales[0](d[parseInt(this.cfg.xtype-colStartIndexPCA)]); } ) 
        .attr("cy",  (d) =>{ return this.scales[1](d[parseInt(this.cfg.ytype-colStartIndexPCA)]); } ) 
        .attr("r",  (d) => {
            if(!d[parseInt(this.cfg.xtype-colStartIndexPCA)] || !d[parseInt(this.cfg.ytype-colStartIndexPCA)]){return 0}
            return this.cfg.dotSize
        })
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .style("fill", (d,n) => {
            if(this.cfg.colorGroup){
                const fileGroup = findFileGroup(dataset.dataName,n)
                if(!fileGroup ||!fileGroup.color){return "black"}
                return fileGroup.color
            }else{
                return dataset.cfg.colorSolid
            }
        })
        .style("opacity",this.canvas.cfg.opacity)
        .attr('tooltipHTML', (d,n) => {return "scatterPlot"+";"+index+";"+n})
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {
            const index = data.indexOf(n);
            const fileIndex = parseInt(colStartIndex) +  index
            let returnText = dataset.header[fileIndex]
            const fileGroup = findFileGroup(dataset.dataName,index)
            if(fileGroup.name){returnText += "<br> Group: "+fileGroup.name}
            this.canvas.tooltip.mousemove(d,"returnThis",returnText, this)
        }  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{
            const index = data.indexOf(n);
            const fileIndex = parseInt(colStartIndex) +  index
            let returnText = dataset.header[fileIndex]
            const fileGroup = findFileGroup(dataset.dataName,index)
            if(fileGroup.name){returnText += "<br> Group: "+fileGroup.name}
            this.canvas.tooltip.mouseclick(d,"returnThis",returnText, this)
        } );

        if(this.cfg.config.blackCircle){
            this.drawnData[index].style("stroke", this.cfg.config.blackCircleColor || "#000000")
            this.drawnData[index].style("stroke-width", this.cfg.config.blackCircleWidth || 1)
         }
    }
    drawInsideAxes(){
      let color = this.cfg.axesColor
      let xAxis = [[this.cfg.xmin, 0],[this.cfg.xmax, 0]]
      let yAxis = [[0, this.cfg.ymin],[0, this.cfg.ymax]]
      if(!this.axesInside){this.axesInside =[]}
      d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"_axis").remove()
      this.axesInside[0] = this.svgSpace.append("path").attr("id","cell"+this.index+"_axis")
      .datum(xAxis)
      .attr('stroke',color)
      .attr('stroke-width',1)
      .attr("fill","none")
      .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
      .attr("d", d3.line()
          .x((d)=>{ return this.scales[0](d[0]); })
          .y((d)=>{ return this.scales[1](d[1]); })
      )
      this.axesInside[1] = this.svgSpace.append("path").attr("id","cell"+this.index+"_axis")
      .datum(yAxis)
      .attr('stroke',color)
      .attr('stroke-width',1)
      .attr("fill","none")
      .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
      .attr("d", d3.line()
          .x((d)=>{ return this.scales[0](d[0]); })
          .y((d)=>{ return this.scales[1](d[1]); })
      )
    }
    checkIfAllEmpty(){
        if(!this.cfg.axisDefined){
            let margin = this.cfg.config.margin
            let container = this.svgSpace.append("foreignObject").attr("id","cell"+this.index+"data0")
                .attr("x",0)
                .attr("y",this.cfg.config.width/2)
                .attr("width", this.cfg.config.width + margin.left + margin.right)
                .attr("height", this.cfg.config.height + margin.top + margin.bottom)

            container.append("xhtml:div")
                .attr("height", this.cfg.config.height + margin.top + margin.bottom)
                .style("font-size", this.cfg.config.legendFontSizeSmall)
                .style("font-family", this.cfg.config.legendFont)
                .style("color","#ff0000")
                .html("Please do a PCA analysis first OR import samples data")
            return true
        }
        return false
    }

    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[this.cfg.xtype]
        let axisLabel_y = columnNames[this.cfg.ytype]
        if((!axisLabel_x || !axisLabel_y) && this.canvas.data[0].header){ 
            axisLabel_x = this.canvas.data[0].header[this.cfg.xtype]
            axisLabel_y = this.canvas.data[0].header[this.cfg.ytype]
        }
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        this.axesLabels[0].text(axisLabel_x)
        this.axesLabels[1].text(axisLabel_y)
        //TODO :add an update of the brushing
        if(!this.cfg.config.noGrid){
            this.grids[0].call(d3.axisBottom(this.scales[0]).ticks(this.cfg.config.axisLines).tickSize(this.cfg.config.height).tickFormat(""))
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines).tickSize(-this.cfg.config.width).tickFormat(""))
        }
    }

    updateData(content, dataNum){
        super.updateData(content, dataNum)
        let thisData = this.drawnData[dataNum]
        if(!thisData){return;}
        if(content.includes("xtype_") || content.includes("xmin_") || content.includes("xmax_")|| content.includes("all")){
            thisData.attr("cx", (d) => { return this.scales[0](d[this.cfg.xtype - this.colStartIndexPCA]); } ) 
        }if(content.includes("ytype_") || content.includes("ymax_")|| content.includes("ymin_")|| content.includes("all")){
            thisData.attr("cy", (d) => { return this.scales[1](d[this.cfg.ytype - this.colStartIndexPCA]); } ) 
        }if(content.includes("dotSize_")||content.includes("relativeSize_")|| content.includes("all")){
            thisData.attr("r", (d) => {return this.cfg.dotSize});
        }
        if(content.includes("opacity_")|| content.includes("all")){
            thisData.style("opacity", this.canvas.cfg.opacity)
        }
        if(content.includes("colorGroup_")){
            this.drawAllData()
        }
        if(this.cfg.showAxes){this.drawInsideAxes()}
    }
    prepareCfg(){
        let properties = [
            {key:"xtype",type:"number",default:0},
            {key:"ytype",type:"number",default:0},
            {key:"dotSize",type:"number",default:5},
            {key:"threshold",type:"number",default:0},
            {key:"showAxes",type:"checkbox",default:false},
            {key:"axesColor",type:"color",default:"#000000"},
            {key:"selectedCols",type:"text",default:"Component,PCA,Variable"},
            {key:"colorGroup",type:"checkbox",default:true}
        ]
        return properties
    }

    preparePopupCfg(){
        let varsArray = []
        let yOptions = this.prepareAxisChoices_allFiles()
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xtype",type:"select",value:this.cfg.xtype,options:yOptions,title: "The component being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"y",
            "inputs":[
                {key:"ytype",type:"select",value:this.cfg.ytype,options:yOptions,title: "The component being represented on this axis",update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Dot size",
            "inputs":[
                {key:"dotSize",type:"number",value:this.cfg.dotSize,title: "Size of dots",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Show axes",
            "inputs":[
                {key:"showAxes",type:"checkbox",value:this.cfg.showAxes,title: "Check this to display x and y axis on the chart",update:(d)=>{this.cfg.update(d)}},
                {key:"axesColor",type:"color",value:this.cfg.axesColor,title: "Color of axes",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"I Threshold",
            "inputs":[
                {key:"threshold",type:"number",value:this.cfg.threshold,title: "The intensity threshold under which peaks are considered absent from the file selected by interactivity ",update:(d)=>{this.cfg.update(d)}},
            ]
        })
         varsArray.push({"name":"Color by group",
            "inputs":[
                {key:"colorGroup",type:"checkbox",value:this.cfg.colorGroup,title: 'Check this to color by the groups defined in "group manager"',update:(d)=>{this.cfg.update(d)}},
            ]
        })
        
        
        return varsArray
    }

    prepareAxisChoices_allFiles(){
        let choices = []
        this.canvas.data.forEach((dataset, index)=>{
            let columns = this.prepareAxisChoices(dataset.header)
            for(let i=0; i<columns.length; i++){
                let alreadyExists = false
                for(let j=0; j<choices.length; j++){
                    if(columns[i].value == choices[j].value){alreadyExists = true}
                }
                if(!alreadyExists){
                    choices.push(columns[i])
                }
            }
        })
        return choices
    }

    prepareAxisChoices(columns){
        if(!columns){return []}
        let choices = []
        let words = this.cfg.selectedCols.split(",")
        //count how many variables have been found
        let countValid = 0
        for(let i=0; i<columns.length; i++){
            let isValid = false;
            for(let j=0; j<words.length; j++){
                if(columns[i].includes(words[j])){
                    isValid = true
                }
            }
            if(isValid){
                choices.push({value:i,name:columns[i],relativeValue:countValid})
                countValid +=1
            }
        }
        return choices
    }

    //overwrites default autoscale
    autoscale(){
        if(debug){console.log("autoscaling cell n°"+this.index+" from canvas"+this.canvas.letter)}
        let allSamples = []
        let datasets = this.canvas.data
        datasets.forEach((item,index) => {
            if(!this.cfg.activeData[index]){return;}
            let data = []
            if(item.dataName == "matrix"){
                data = cvsPCA.loadings
            }else if(item.dataName.includes("file")){
                let fileNum = parseInt(item.dataName.slice(5))
                let file = files.list[fileNum]
                if(!file || !file.matrix){return;}
                data = file.matrix.pca_loadings || []
            }else{return;}
            data.unshift(["header"])
            allSamples.push(data)
        })
        let x= [this.cfg.xmin, this.cfg.xmax]
        let y= [this.cfg.ymin, this.cfg.ymax]
        let xtype = this.cfg.xtype -  this.colStartIndexPCA
        let ytype = this.cfg.ytype -  this.colStartIndexPCA
        if(debug){console.log(xtype, ytype, this.cfg, allSamples)}
        x = autoAxis(this.scales[0], allSamples, xtype)
        y = autoAxis(this.scales[1], allSamples, ytype)
        this.cfg.xmin = x[0]
        this.cfg.xmax = x[1]
        this.cfg.ymin = y[0]
        this.cfg.ymax = y[1]
        this.draw()
        this.drawAllData()
    }

    /**filtering does nothing on this chart */
    handleFiltering(indexesList){
    }

    setAxisTypesDefault(){
        this.cfg.axisDefined = false //checks if wrong files have been put
        let columns = this.prepareAxisChoices_allFiles()
        if(!columns || columns.length<2){return;}
        this.cfg.xtype = columns[0].value
        this.cfg.ytype = columns[1].value
        this.cfg.axisDefined = true
    }
    
}

/************************************************************************************************ */
/*-----------------------------------------MASS DIFFERENCES---------------------------------------*/
class CanvasCell_massDifferences extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index)
        this.cfg.prepareCfg("massDifferences")
        this.cfg.xmax = 100
        this.cfg.ymax = 100
        if(cfg){this.cfg.copyCfg(cfg)}
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = "Δm/z"
        let axisLabel_y = "Occurences"
        if(this.cfg.ytype == "origin"){axisLabel_y = "Sum of lowest mass intensities"}
        else if(this.cfg.ytype == "target"){axisLabel_y = "Sum of highest mass intensities"}
        else if(this.cfg.ytype == "sum"){axisLabel_y = "Sum of connected mass intensities"}
        else if(this.cfg.ytype == "product"){axisLabel_y = "Product of connected mass intensities"}
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        else if(this.cfg.yrelative){ axisLabel_y = "%"}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);

        if(!this.cfg.config.noGrid){
            this.grids = [];
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines,"side", this.cfg.config);
          }
        //create brushing or filtration
        // this.createBrush("massSpectra")        
         this.createBrushFilter("massDifference")
        this.drawAllData()
        this.drawColourLegends(true)
    }
    drawData(dataset, index, specialInfo){
        let suppID = ""
        if(specialInfo != "highlight"){
        super.drawData(dataset, index)
        }else{
            d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_highlight").remove()
            suppID = "_highlight"
        }
        if(!this.cfg.activeData[index]){return;}

        let ytype = this.cfg.ytype
        let yrelative = this.cfg.yrelative
        let color = dataset.cfg.colorSolid
        let opacity = this.canvas.cfg.opacity

        //compute data
        let groups = []
        if(specialInfo == "highlight"){
            groups = dataset.filterMassDifferences(this.cfg.filterType, "mass")
        }else if(specialInfo == "filter"){
            groups = dataset.prepareMassDifferences([this.cfg.xmin,this.cfg.xmax],this.cfg.tolerance, this.cfg.cutoff, true)
        }else{
            groups = dataset.prepareMassDifferences([this.cfg.xmin,this.cfg.xmax],this.cfg.tolerance, this.cfg.cutoff, false)
        }

        if(!groups || groups.length==0){return}
        let maxOccurences = groups[0].occurences
        let maxIntensity = 0

        //which property key to select in the groups of differences
        let key_occ = "occurences"
        let key_int = "intensity"
        if(specialInfo == "highlight"){
            key_occ = "occurences_red"
            key_int = "intensity_red"
            color = this.canvas.cfg.interactivity.histoColor
            opacity = 1
        }
        
        //prepares special "intensity" cases
        if(ytype != "occurences"){
            let isDataReduced= false
            if(specialInfo == "highlight"){isDataReduced = true}
            dataset.prepareMassDifferences_intensity(ytype, isDataReduced, groups)
            //looks for max intensity
            for(let i=0; i<groups.length; i++){
                if(groups[i].intensity>maxIntensity){maxIntensity = groups[i].intensity}
            }
        }


        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index+suppID)
        .selectAll("rect")
        .data(groups)
        .enter()
        .append("rect")
        .attr("x",  (d) => {return this.scales[0](d.mass);} ) 
        .attr("y",  (d) =>  { 
            if(ytype == "occurences"){
                if(yrelative){return this.scales[1](100*d[key_occ]/maxOccurences) ||0
                }else{return this.scales[1](d[key_occ]) ||0 }
            }else{
                if(yrelative){return this.scales[1](100*d[key_int]/maxIntensity) ||0
                }else{return this.scales[1](d[key_int]) ||0 }
            }}) 
        .attr("width",1)
        .attr("height", (d) => { 
            if(ytype == "occurences"){
                if(yrelative){ return this.cfg.config.height - this.scales[1](100*d[key_occ]/maxOccurences) ||0
                }else{
                    return this.cfg.config.height - this.scales[1](d[key_occ]) ||0
                }
            }else{
                if(yrelative){ return this.cfg.config.height - this.scales[1](100*d[key_int]/maxIntensity) ||0
                }else{
                    return this.cfg.config.height - this.scales[1](d[key_int]) ||0
                }
            }})
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .style("fill", (d) => {return color})
        .style("opacity", opacity)
        .attr('tooltipHTML', (d,n) => {return "massDifferences"+";"+index+";"+n})
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"massDifferences",n, this)}  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"massDifferences",n, this)} );
    }
    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = "Δm/z"
        let axisLabel_y = "Occurences"
        if(this.cfg.ytype == "origin"){axisLabel_y = "Sum of lowest mass intensities"}
        else if(this.cfg.ytype == "target"){axisLabel_y = "Sum of highest mass intensities"}
        else if(this.cfg.ytype == "sum"){axisLabel_y = "Sum of connected mass intensities"}
        else if(this.cfg.ytype == "product"){axisLabel_y = "Product of connected mass intensities"}
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        else if(this.cfg.yrelative){ axisLabel_y = "%"}
        this.axesLabels[0].text(axisLabel_x)
        this.axesLabels[1].text(axisLabel_y)
        if(!this.cfg.config.nogrid){
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines).tickSize(-this.cfg.config.width).tickFormat(""))
        }
    }
    
    updateData(content, dataNum){
        super.updateData(content, dataNum)
        let ytype = this.cfg.ytype
        let yrelative = this.cfg.yrelative
        let thisData = this.drawnData[dataNum]
        let maxInt = this.canvas.findMaxInt(false)
        if(!thisData){return;}
        this.drawData(this.canvas.data[dataNum],dataNum)
        if(content.includes("opacity_")|| content.includes("all")){
            thisData.style("opacity", this.canvas.cfg.opacity)
        }
    }

    autoscale(){
        super.autoscale()
        if(this.cfg.ymin<0){this.cfg.ymin = 0}
        if(this.cfg.ytype == "occurences_relative"){ this.cfg.ymax = 100}
        // this.draw()
        // this.drawAllData()
    }

    prepareCfg(){
        let properties = [
            {key:"ytype",type:"select",default:"occurences"},
            {key:"yrelative",type:"checkbox",default:true},
            {key:"tolerance",type:"number",default:0.2},
            {key:"cutoff",type:"number",default:10},
            {key:"filterType",type:"select",default:"any"}
        ]
        return properties
    }

    handleHighlighting(){
        //check if this method of brushing is active, because it can be disabled
        if(!this.canvas.cfg.interactivity.createHistogramBars){return;}
        for(let i=0; i<this.canvas.data.length; i++){
            let dataset = this.canvas.data[i]
            if(!dataset.highlight){continue;}
            if(dataset.highlight.cellIndex == this.index){continue;}
            if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
            if(this.canvas.cfg.interactivity.active != "all" && this.canvas.cfg.interactivity.active != i){continue;}
            this.drawData(this.canvas.data[i], i, "highlight")
        }
    }

    handleFiltering(indexesList){
         if(!this.canvas.cfg.interactivity.filterWorkonHistograms){return;}
         let activeData = this.canvas.cfg.interactivity.active
        //checks if the only filter is on this chart, skips 
        if(this.canvas.filters.length == 1){
            if(this.canvas.filters[0] &&this.canvas.filters[0].cellIndex == this.index){return;}
        }
         for(let i=0; i<this.canvas.data.length; i++){
            if(activeData !="all" && activeData !=i){continue;}
            let dataset = this.canvas.data[i]
            if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
            this.drawData(this.canvas.data[i], i, "filter")
        }
    }

    
    preparePopupCfg(){
        let varsArray = []
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let ytypeOptions = [{name:"Occurences",value:"occurences"},
            {name:"Origin intensity",value:"origin"},
            {name:"Target intensity",value:"target"},
            {name:"Intensity sum",value:"sum"},
            {name:"Intensity prod.",value:"product"},
            {name:"Similarity score",value:"similarity"}
        ]
        varsArray.push({ "name":"y",
            "inputs":[
                {key:"ytype",type:"select",value:this.cfg.ytype,title: "How to compute y value",options:ytypeOptions,update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
         varsArray.push({ "name":"Relative y axis(%)",
            "inputs":[
                {key:"yrelative",type:"checkbox",value:this.cfg.yrelative,title: "Is the y axis in relative proportion of the max displayed value of this dataset",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Grouping tol.(mDa)",
            "inputs":[
                {key:"tolerance",type:"number",value:this.cfg.tolerance,title: "The tolerance to group mass differences together",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Cutoff value",
            "inputs":[
                {key:"cutoff",type:"number",value:this.cfg.cutoff,title: "Cutoff small occurences groups to quicken display",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let interactivityOptions = [{name:"Origin selected",value:"origin"},
            {name:"Target selected",value:"target"},
            {name:"Both selected",value:"both"},
            {name:"Any selected",value:"any"},
        ]
        varsArray.push({"name":"Interactivity:",
            "inputs":[
                {key:"filterType",type:"select",value:this.cfg.filterType,options:interactivityOptions,title: "When highlighting/filtering, which points do the selection keep",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        return varsArray
    }

}



/************************************************************************************************ */
/*-----------------------------------------MASS DIFFERENCES---------------------------------------*/
class CanvasCell_massDifferences_formula extends CanvasCell{
    constructor(parent, index, cfg){
        super(parent, index)
        this.cfg.prepareCfg("massDifferences_formula")
        this.cfg.xmax = 100
        this.cfg.ymax = 100
        if(cfg){this.cfg.copyCfg(cfg)}
        this.draw()
    }
    /**draw the plot */
    draw(){
        super.draw()
        let axisOptions = {}
        if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = "Δm/z"
        let axisLabel_y = "Occurences"
        if(this.cfg.ytype == "origin"){axisLabel_y = "Sum of lowest mass intensities"}
        else if(this.cfg.ytype == "target"){axisLabel_y = "Sum of highest mass intensities"}
        else if(this.cfg.ytype == "sum"){axisLabel_y = "Sum of connected mass intensities"}
        else if(this.cfg.ytype == "product"){axisLabel_y = "Product of connected mass intensities"}
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        else if(this.cfg.yrelative){ axisLabel_y = "%"}
        this.axesLabels=[];
        this.axesLabels[0]= appendAxisLabel_x(this.svgSpace, axisLabel_x,axisOptions, this.cfg.config);
        this.axesLabels[1]= appendAxisLabel_y(this.svgSpace, axisLabel_y,axisOptions, this.cfg.config);

        if(!this.cfg.config.noGrid){
            this.grids = [];
            this.grids[1] = appendPlotGrid(this.svgSpace, this.scales[1],this.cfg.config.axisLines,"side", this.cfg.config);
          }
        //create brushing or filtration
        // this.createBrush("massSpectra")        
         this.createBrushFilter("massDifferences_formula")
        this.drawAllData()
        this.drawColourLegends(true)
    }
    drawData(dataset, index, specialInfo){
        let suppID = ""
        if(specialInfo != "highlight"){
        super.drawData(dataset, index)
        }else{
            d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_highlight").remove()
            suppID = "_highlight"
        }
        if(!this.cfg.activeData[index]){return;}

        let ytype = this.cfg.ytype
        let yrelative = this.cfg.yrelative
        let color = dataset.cfg.colorSolid
        let opacity = this.canvas.cfg.opacity

        //compute data
        let groups = []
        if(specialInfo == "highlight"){
            groups = dataset.filterMassDifferences(this.cfg.filterType, "formula")
        }else if(specialInfo == "filter"){
            groups = dataset.prepareMassDifferences_formula([this.cfg.xmin,this.cfg.xmax], this.cfg.cutoff, true)
        }else{
            groups = dataset.prepareMassDifferences_formula([this.cfg.xmin,this.cfg.xmax], this.cfg.cutoff, false)
        }

        if(!groups || groups.length==0){return}
        let maxOccurences = groups[0].occurences
        let maxIntensity = 0

        //which property key to select in the groups of differences
        let key_occ = "occurences"
        let key_int = "intensity"
        if(specialInfo == "highlight"){
            key_occ = "occurences_red"
            key_int = "intensity_red"
            color = this.canvas.cfg.interactivity.histoColor
            opacity = 1
        }
        
        //prepares special "intensity" cases
        if(ytype != "occurences"){
            let isDataReduced= false
            if(specialInfo == "highlight"){isDataReduced = true}
            dataset.prepareMassDifferences_intensity(ytype, isDataReduced, groups)
            //looks for max intensity
            for(let i=0; i<groups.length; i++){
                if(groups[i].intensity>maxIntensity){maxIntensity = groups[i].intensity}
            }
        }


        if(!this.drawnData){this.drawnData = []}
        this.drawnData[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"data"+index+suppID)
        .selectAll("rect")
        .data(groups)
        .enter()
        .append("rect")
        .attr("x",  (d) => {return this.scales[0](d.mass);} ) 
        .attr("y",  (d) =>  { 
            if(ytype == "occurences"){
                if(yrelative){return this.scales[1](100*d[key_occ]/maxOccurences) ||0
                }else{return this.scales[1](d[key_occ]) ||0 }
            }else{
                if(yrelative){return this.scales[1](100*d[key_int]/maxIntensity) ||0
                }else{return this.scales[1](d[key_int]) ||0 }
            }}) 
        .attr("width",1)
        .attr("height", (d) => { 
            if(ytype == "occurences"){
                if(yrelative){ return this.cfg.config.height - this.scales[1](100*d[key_occ]/maxOccurences) ||0
                }else{
                    return this.cfg.config.height - this.scales[1](d[key_occ]) ||0
                }
            }else{
                if(yrelative){ return this.cfg.config.height - this.scales[1](100*d[key_int]/maxIntensity) ||0
                }else{
                    return this.cfg.config.height - this.scales[1](d[key_int]) ||0
                }
            }})
        .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .style("fill", (d) => {return color})
        .style("opacity", opacity)
        .attr('tooltipHTML', (d,n) => {return "massDifferences_formula"+";"+index+";"+n})
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"massDifferences_formula",n, this)}  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"massDifferences_formula",n, this)} );
    }
    update(content, doNotUpdateDomains){
        super.update(content, doNotUpdateDomains)
        let axisLabel_x = "Δm/z"
        let axisLabel_y = "Occurences"
        if(this.cfg.ytype == "origin"){axisLabel_y = "Sum of lowest mass intensities"}
        else if(this.cfg.ytype == "target"){axisLabel_y = "Sum of highest mass intensities"}
        else if(this.cfg.ytype == "sum"){axisLabel_y = "Sum of connected mass intensities"}
        else if(this.cfg.ytype == "product"){axisLabel_y = "Product of connected mass intensities"}
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
        else if(this.cfg.yrelative){ axisLabel_y = "%"}
        this.axesLabels[0].text(axisLabel_x)
        this.axesLabels[1].text(axisLabel_y)
        if(!this.cfg.config.nogrid){
            this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines).tickSize(-this.cfg.config.width).tickFormat(""))
        }
    }
    
    updateData(content, dataNum){
        super.updateData(content, dataNum)
        let ytype = this.cfg.ytype
        let yrelative = this.cfg.yrelative
        let thisData = this.drawnData[dataNum]
        let maxInt = this.canvas.findMaxInt(false)
        if(!thisData){return;}
        this.drawData(this.canvas.data[dataNum],dataNum)
        if(content.includes("opacity_")|| content.includes("all")){
            thisData.style("opacity", this.canvas.cfg.opacity)
        }
    }

    autoscale(){
        super.autoscale()
        if(this.cfg.ymin<0){this.cfg.ymin = 0}
        if(this.cfg.ytype == "occurences_relative"){ this.cfg.ymax = 100}
    }

    prepareCfg(){
        let properties = [
            {key:"ytype",type:"select",default:"occurences"},
            {key:"yrelative",type:"checkbox",default:true},
            {key:"cutoff",type:"number",default:10},
            {key:"filterType",type:"select",default:"any"}
        ]
        return properties
    }

    handleHighlighting(){
        //check if this method of brushing is active, because it can be disabled
        if(!this.canvas.cfg.interactivity.createHistogramBars){return;}
        for(let i=0; i<this.canvas.data.length; i++){
            let dataset = this.canvas.data[i]
            if(!dataset.highlight){continue;}
            if(dataset.highlight.cellIndex == this.index){continue;}
            if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
            if(this.canvas.cfg.interactivity.active != "all" && this.canvas.cfg.interactivity.active != i){continue;}
            this.drawData(this.canvas.data[i], i, "highlight")
        }
    }

    handleFiltering(indexesList){
         if(!this.canvas.cfg.interactivity.filterWorkonHistograms){return;}
         let activeData = this.canvas.cfg.interactivity.active
        //checks if the only filter is on this chart, skips 
        if(this.canvas.filters.length == 1){
            if(this.canvas.filters[0] &&this.canvas.filters[0].cellIndex == this.index){return;}
        }
         for(let i=0; i<this.canvas.data.length; i++){
            if(activeData !="all" && activeData !=i){continue;}
            let dataset = this.canvas.data[i]
            if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
            this.drawData(this.canvas.data[i], i, "filter")
        }
    }

    
    preparePopupCfg(){
        let varsArray = []
        varsArray.push({"name":"x",
            "inputs":[
                {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let ytypeOptions = [{name:"Occurences",value:"occurences"},
            {name:"Origin intensity",value:"origin"},
            {name:"Target intensity",value:"target"},
            {name:"Intensity sum",value:"sum"},
            {name:"Intensity prod.",value:"product"},
            {name:"Similarity score",value:"similarity"}
        ]
        varsArray.push({ "name":"y",
            "inputs":[
                {key:"ytype",type:"select",value:this.cfg.ytype,title: "How to compute y value",options:ytypeOptions,update:(d)=>{this.cfg.update(d)}},
                {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
                {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
            ]
        })
         varsArray.push({ "name":"Relative y axis(%)",
            "inputs":[
                {key:"yrelative",type:"checkbox",value:this.cfg.yrelative,title: "Is the y axis in relative proportion of the max displayed value of this dataset",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        varsArray.push({"name":"Cutoff value",
            "inputs":[
                {key:"cutoff",type:"number",value:this.cfg.cutoff,title: "Cutoff small occurences groups to quicken display",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        let interactivityOptions = [{name:"Origin selected",value:"origin"},
            {name:"Target selected",value:"target"},
            {name:"Both selected",value:"both"},
            {name:"Any selected",value:"any"},
        ]
        varsArray.push({"name":"Interactivity:",
            "inputs":[
                {key:"filterType",type:"select",value:this.cfg.filterType,options:interactivityOptions,title: "When highlighting/filtering, which points do the selection keep",update:(d)=>{this.cfg.update(d)}},
            ]
        })
        return varsArray
    }

}



/*************************DATASETS CLASS ************************************/


class DataSet {
    constructor(parent, index){
        this.header = []
        this.data = []
        this.dataName = ""
        this.canvas = parent
        this.index = index
        this.cfg = new ConfigDataSet(this)
        this.colorScale = {}
    }
    /**
     * fills a dataset with an array of data
     * @param {Array} rawData an array with data[0] being the headers
     * @param {String} name the name/id when data will be compared to other datasets
     * @param {Object} File OPTIONAL, links to the file slot holding the data
      * @returns an error if it isn't an array, or this.data
     */
    fill(rawData, name, file){
        if(debug){console.log("filling data n°"+this.index+"with data named: "+name)} 
        if(rawData.constructor != Array){throw new Error("data set is not an array")}
        this.header = rawData[0]
        this.file = file
        this.data = rawData // TODO remove the first line without removing it everywhere
        this.dataName = name
        this.name = getFileNameFromString(name)
        this.maxInt = this.findMaxInt()
        if(this.data.length ==0){return []}
        this.prepareColorScale()
        return this.data
    }

    /**activates filling and drawing from a fileName format ("file_"+*number*, "matrix", or venn set Name */
    fillFromName(fileName){
        if(fileName.includes("file")){
            let fileNum = fileName.slice(5)
            let file = files.list[fileNum]
            if(!file){return;} /**this happens when loading parameters refering to non-existing files for this session */
            if(!file.data || file.data.length==0){return;}/**same case for empty files */
            let data = file.data
            this.fill(data,fileName, file)
            this.canvas.drawDataset(this.index)
        }else if(fileName =="none"){
            this.fill([],"")
            this.canvas.drawDataset(this.index)
        }else if(fileName == "matrix"){
            if(!matrixData.length ||matrixData.length ==0){return;}
            this.fill(matrixData,"matrix")
            this.canvas.drawDataset(this.index)
        }else if(vennData && vennData[fileName]){
            if(!vennData[fileName].length ||vennData[fileName].length ==0){return;}
            this.fill(vennData[fileName], fileName)
            this.canvas.drawDataset(this.index)
        }
    }

    /**
     * sorts a dataset 
     * @param {Number} column  the number of the column from which sorting is done
     * @param {boolean} descending true if descending, false if ascending
     * @returns error or this.data
     */
    sort(column, descending){
        if(isNaN(column) || column <0 || column >= this.header.length){return console.error("invalid column for sorting data")}
        if(descending){ 
            this.data.sort(function(a, b){return b[column]-a[column]})
        }else{
            this.data.sort(function(a, b){return a[column]-b[column]})
        }
        if(this.canvas){this.canvas.draw()}
        return this.data
    }

    /** find a list of peaks that are valid by formula. returnMethod is a string, if equal to "index" then the list return will only be the indexes*/
    findPeakByFormula(formula, returnMethod){
        let list = []
        this.data.forEach((peak)=>{
            if(peak[config.formulatext] == formula){list.push(peak)}
        })
        if(returnMethod =="index"){
            let newList = []
            list.forEach((peak)=>{
                newList.push(peak.index)
            })
            return newList
        }else{
            return list
        }
    }

    findPeakByMass(mass, tolerance, returnMethod){
        let list = []
        this.data.forEach((peak)=>{
            let delta = Math.abs(parseFloat(peak[config.mz]) - parseFloat(mass))
            let error = 1e6*delta/mass
            if(error <= parseFloat(tolerance)){ list.push(peak)}
        })
        if(returnMethod =="index"){
            let newList = []
            list.forEach((peak)=>{
                newList.push(peak.index)
            })
            return newList
        }else{
            return list
        }
        
    }

    /** constructs the color scale and returns it. It is also saved at .colorScale */
    prepareColorScale(){
        if(!this.data[1]){ console.error('Cannot prepare color scale on empty data')}
        //first: definition of min/max 
        let min = this.cfg.minColor
        let max = this.cfg.maxColor
        if(this.cfg.colorRelative){
            //looks for min and max value of the color 
            //TODO: change [1] if first line of data is changed AND IN THE LOOP
            var minVal = parseFloat(this.data[1][this.cfg.colorType])
            var maxVal = parseFloat(this.data[1][this.cfg.colorType])
            for(let i=1; i<this.data.length; i++){
                if(parseFloat(this.data[i][this.cfg.colorType])<minVal){minVal = parseFloat(this.data[i][this.cfg.colorType])}
                else if(parseFloat(this.data[i][this.cfg.colorType])>maxVal){maxVal = parseFloat(this.data[i][this.cfg.colorType])}
            }
            let percentValue = (maxVal - minVal)/100
            min = minVal + percentValue*min
            max = minVal + percentValue*max
            this.cfg.relativeMin = min
            this.cfg.relativeMax = max
            if(this.cfg.colorInvert){
                let temp = max
                max = min
                min =temp
            }
        }else{
            if(this.cfg.colorInvert){
                min = max;
                max = this.cfg.minColor
            }
        }
        //creation of the color scale
        let colorScale
        if(this.cfg.colorGradient == "solid"){
            colorScale =  d3.scaleSequential().domain([min, max]).range([this.cfg.colorSolid, this.cfg.colorSolid])
        }else if(this.cfg.colorGradient =="whiteToSolid"){
            colorScale = d3.scaleSequential().domain([min, max]).range(["#ffffff", this.cfg.colorSolid])
        }else if(this.cfg.colorGradient && this.cfg.colorGradient.includes("custom_")){
             //creation of a custom color scale
            let customNb = this.cfg.colorGradient.split("_")[1]
            let customScale
            if(!isNaN(customNb)){customScale = config.customColors[customNb]}
            else{customScale = customColorPride}
            let weights = customScale.weights
            let domainWidth = parseFloat(max-min)
            let domain = []
            for(let i=0; i<weights.length; i++){
                let newValue = parseFloat(min) + parseFloat(weights[i]*domainWidth)
                domain.push(newValue)
            }
            colorScale = d3.scaleLinear().domain(domain).range(customScale.colors).clamp(true)
        }else{
            let colorChoice = "interpolate"+this.cfg.colorGradient
            colorScale = d3.scaleSequential().domain([min, max]).interpolator(d3[colorChoice])
        }
        this.colorScale = colorScale
        return colorScale
    }

    findMaxInt(){
        let maxInt = -1
        this.data.forEach((item, index) =>{
            if(parseFloat(item[config.intensity])> maxInt){maxInt = parseFloat(item[config.intensity])}
        })
        return maxInt
    }

    /** calculates a kendrick mass, stores it as an object in this.kendrick and also returns it */
    calculateKM(unitName, unitMass, roundingType, divisor, doNotSaveKendrick){
        let data = this.data
        if(this.dataFiltered && this.dataFiltered.length >0){data = this.dataFiltered}
        if(!divisor){divisor = 1}
        let mass = unitMass/divisor
        let newBase = Math.round(mass)/mass
        let thisKM = {"unit":unitName,"mass":unitMass,"masses":[],"defects":[]}
        //removes identical already calculated kendrick masses
        if (!this.kendrick){this.kendrick = []}
        if(!doNotSaveKendrick){
            for(let i=this.kendrick.length; i>=0; i--){
                if(!this.kendrick[i]){continue;}
                if(this.kendrick[i].unit == thisKM.unit || this.kendrick[i].mass == thisKM.mass){
                    this.kendrick.splice(i,1)
                }
            }
        }

        for(let i=0; i<data.length; i++){
            let calcMass = parseFloat(data[i][config.mz])*newBase
            let massDefect = 0
            if(roundingType=="round"){massDefect = Math.round(calcMass) - calcMass}
            else if(roundingType=="ceiling"){massDefect = Math.ceil(calcMass) - calcMass}
            else if(roundingType=="floor"){massDefect = Math.floor(calcMass) - calcMass}
            thisKM.masses.push(calcMass)
            thisKM.defects.push(massDefect)
        }
        if(doNotSaveKendrick){return thisKM}
        this.kendrick.push(thisKM)
        return thisKM
    }

    /** calculate 2 dimensional kendrick data. Saves it in this.kendrick2D and also returns it */
    calculateKM2D(unitNames, unitMasses, roundingType, divisor){
        let data = this.data
        if(this.dataFiltered && this.dataFiltered.length >0){data = this.dataFiltered}
        if(!divisor){divisor = 1}
        let unitMass1 = unitMasses[0]/divisor
        let unitMass2 = unitMasses[1]/divisor
        let thisKM = {"unit1":unitNames[0],"unit2":unitNames[1],"mass1":unitMass1,"mass2":unitMass2,"masses":[],"defects1":[],"defects2":[]}
        //removes identical already calculated kendrick masses
        if (!this.kendrick2D){this.kendrick2D = []}
        for(let i=this.kendrick2D.length; i>=0; i--){
            if(!this.kendrick2D[i]){continue;}
            if((this.kendrick2D[i].unit1 == thisKM.unit1 &&  this.kendrick2D[i].unit2 == thisKM.unit2)|| (this.kendrick2D[i].mass1 == thisKM.mass1 && this.kendrick2D[i].mass2 == thisKM.mass2)){
                this.kendrick2D.splice(i,1)
            }
        }
        let kendrick1D = this.calculateKM(unitNames[0], unitMasses[0], roundingType, divisor, true)
        thisKM.defects1 = kendrick1D.defects
        let base1 = Math.round(unitMass1)/unitMass1
        let base2 = base1*unitMass2
        let massDefect2 = base2 - Math.round(base2)
        for(let i=0; i<data.length; i++){
             // divides the KMD of the first new base unit by the mass defect of the 2D base
            let calcMass = parseFloat(thisKM.defects1[i])/massDefect2
            let massDefect = 0
            if(roundingType=="round"){massDefect = Math.round(calcMass) - calcMass}
            else if(roundingType=="ceiling"){massDefect = Math.ceil(calcMass) - calcMass}
            else if(roundingType=="floor"){massDefect = Math.floor(calcMass) - calcMass}
            thisKM.defects2.push(massDefect)
        }
        this.kendrick2D.push(thisKM)
        return thisKM

    }

    /**finds a kendrick set in this dataset with a specified unitName OR unitMass */
    findKM(unitName,unitMass){
        if(!this.kendrick){this.kendrick = []}
        for(let item of this.kendrick){
            if(item.unit == unitName || item.mass == unitMass){
                return item
            }
        }
        return {}
    }
    /**finds a kendrick set in this dataset with a specified unitName OR unitMass */
    findKM2D(unitNames,unitMasses){
        if(!this.kendrick2D){this.kendrick2D = []}
        for(let item of this.kendrick2D){
            if((unitNames && item.unit1 == unitNames[0] && item.unit2 == unitNames[1]) || (unitMasses && item.mass1 == unitMasses[0] && item.mass2 == unitMasses[1])){
                return item
            }
        }
        return {}
    }


    calculateBins(range, density ,type, name, doNotSave, specialData){
        if(debug){console.log("computing bins for dataset n°"+this.index+"on canvas"+this.canvas.letter)}
        //clears any old bins with the same name
        if(!this.bins){this.bins = []}
        for(let i=this.bins.length; i>=0; i--){
            if(!this.bins[i]){continue;}
            if(this.bins[i].name == name){
                this.bins.splice(i,1)
            }
        }
        //builds the thresholds
        let thresholdsList = this.buildThresholdsList(range[0],range[1],density)

        //define the bin creator
        let bins = d3.histogram()
        .value(function(d) {return d[type]; })   
        .domain(range)  
        .thresholds(thresholdsList)

        //computes the height in cumulated intensity of each bin
        let binHeight = (bins) =>{
            let heights = []
            bins.forEach((bin)=>{ 
                let value = 0
                bin.forEach((d)=>{
                    let intensity = parseFloat(d[config.intensity])
                    if (!isNaN(intensity)){value  += intensity;}
                })
                bin.intensity = value
                heights.push(value)
            })
            return heights
        }
        //computation of all properties
        let data = specialData || this.data
        let theseBins = bins(data)
        let heights =binHeight(theseBins)

        let lookForFullDataset =false
        if((name.includes("highlighted")||name.includes("filtered")) && !this.canvas.cfg.interactivity.histogramRelativity){
            lookForFullDataset = true
        }
        //count total intensity and number
        let totalHeight = 0;
        let totalLength = 0;
        if(lookForFullDataset){ //full dataset
            data.forEach((val)=>{
                let intensity = parseFloat(val[config.intensity])
                if (!isNaN(intensity)){totalHeight  += intensity;}
            })
            totalLength = data.length
        }else{ //limited, special dataset
            this.data.forEach((val)=>{
                let intensity = parseFloat(val[config.intensity])
                if (!isNaN(intensity)){totalHeight  += intensity;}
            })
            totalLength = this.data.length
        }
        let thisSet = {name:name, bins:theseBins, heights:heights, totalHeight:totalHeight, totalNumber:totalLength}
        if(doNotSave){return thisSet}
        this.bins.push(thisSet)
        return thisSet
    }

    /** builds a list of thresholds for bins */
    buildThresholdsList(min,max,density){
        min = parseFloat(min)
        max = parseFloat(max)
        let value = min
        let thresholdsList = [value]
        let count = 0
        while(value<=max){
            count +=1
            value += 1/density
            thresholdsList.push(value)
            if(count>10000){break;} //emergency break
        }
        if(thresholdsList.length>10000){
            console.warn("Warning !aborting, over 10 000 bins for data n°"+this.index+" canvas "+this.canvas.letter)
            return []
        }
        return thresholdsList
    }

    /** finds a bins set based on its name */
    findBins(name){
        if(!this.bins){this.bins = []}
        for(let i=0; i<this.bins.length; i++){
            if(this.bins[i].name == name){
                return this.bins[i]
            }
        }
        return {}
    }

    /**prepares a categories list from a single dataset. Checks for duplicates if a previous catlist is inputted */
    prepareCatList(numCol, catList){
        if(!catList){catList = []}
        if(!this.data || this.data.length ==0){return catList}
        let data = this.data
        //TODO reset i to start from 0 once first line of data has been removed
        for(let i=1; i<data.length; i++){
            let value = data[i][numCol]
            if((value || value==0) && !catList.includes(value)){catList.push(value)}
        }
        return catList
    }

    /**pushes every datapoint to a specific bin build on the cat list given */
    pushToCatList(numCol, catList, setName, specialData){
        //clears any old bins with the same name
        if(!this.binsDiscrete){this.binsDiscrete = []}
        for(let i=this.binsDiscrete.length; i>=0; i--){
            if(!this.binsDiscrete[i]){continue;}
            if(this.binsDiscrete[i].name == setName){
                this.binsDiscrete.splice(i,1)
            }
        }
        let data = specialData || this.data
        if(!data || data.length == 0){return;}
        let bins = []
        catList.forEach((cat,catIndex)=>{
            let thisbin = []
            thisbin.name = cat
            bins.push(thisbin)
        })
        let startIndex = 1
        if(specialData){startIndex = 0} //for special data there is no header, so the index starts at 0
        for(let i=startIndex; i<data.length; i++){ //TODO switch i to =0 when first line will be removed
            for(let j=0; j<bins.length; j++){
                if(bins[j].name == data[i][numCol]){
                    bins[j].push(data[i])
                    break;
                }
            }
        }
        let lookForFullDataset =false
        if((setName.includes("highlighted")||setName.includes("filtered")) && !this.canvas.cfg.interactivity.histogramRelativity){
            lookForFullDataset = true
        }
        //computes the intensity of each bin
        bins.forEach((bin)=>{ 
            let value = 0
            bin.forEach((d)=>{
                let intensity = parseFloat(d[config.intensity])
                if (!isNaN(intensity)){value  += intensity;}
            })
            bin.intensity = value
        })

        //count total intensity and number
        let totalHeight = 0;
        let totalLength = 0;
        if(lookForFullDataset){
            data.forEach((val)=>{
                let intensity = parseFloat(val[config.intensity])
                if (!isNaN(intensity)){totalHeight  += intensity;}
            })
            totalLength = data.length
        }else{
            this.data.forEach((val)=>{
                let intensity = parseFloat(val[config.intensity])
                if (!isNaN(intensity)){totalHeight  += intensity;}
            })
            totalLength = this.data.length
        }


        let superBins = {}
        superBins.bins = bins
        superBins.name = setName
        superBins.totalHeight = totalHeight
        superBins.totalNumber = totalLength
        if(specialData){return superBins}
        this.binsDiscrete.push(superBins)
        return superBins
    }

    /** prepares the class list for this dataset. Can be input an array of classes already, or if given nothing will start one from scratch */
    prepareClassList(skeleton, hetero, classList, setName, specialData){
        if(!classList){classList = []}
        if(!this.data || this.data.length ==0){return classList}
        let data = specialData || this.data
        //since parsing formula & chemical class can be expensive in time, creation of classes & bins need to be simultaneous
        //clears any old bins with the same name
        if(!this.binsDiscrete){this.binsDiscrete = []}
        for(let i=this.binsDiscrete.length; i>=0; i--){
            if(!this.binsDiscrete[i]){continue;}
            if(this.binsDiscrete[i].name == setName){
                this.binsDiscrete.splice(i,1)
            }
        }
        let bins = []
        classList.forEach((name,index)=>{
            let thisbin = []
            thisbin.name = name
            bins.push(thisbin)
        })
        let startIndex = 1
        if(specialData){startIndex = 0} //for special data there is no header, so the index starts at 0
        //TODO reset i to start from 0 once first line of data has been removed
        for(let i=startIndex; i<data.length; i++){
            if(!data[i] || !data[i][config.formulatext]){continue;}
            let formula = new ChemFormula(data[i][config.formulatext])
            let chemicalClass = this.defineClass(formula.formula, skeleton, hetero)
            //adds it to the list if it's not there already
            if(chemicalClass && !classList.includes(chemicalClass)){
                classList.push(chemicalClass)
                let thisbin = []
                thisbin.name = chemicalClass
                bins.push(thisbin)
            }
            //add it to a bin
            for(let j=0; j<bins.length; j++){
                if(bins[j].name == chemicalClass){bins[j].push(data[i])}
            }
        }
        //compute the height of each bin
        let totHeight = 0
        bins.forEach((bin, index)=>{
            let totIntensity = 0
            bin.forEach((d)=>{
                 let intensity = parseFloat(d[config.intensity])
                if (!isNaN(intensity)){totIntensity  += intensity;}
            })
            bin.intensity = totIntensity
            if(!isNaN(totIntensity)){ totHeight += totIntensity}
        })
        let superBins = {}
        superBins.bins = bins
        superBins.name = setName
        superBins.totalHeight = totHeight
        superBins.totalNumber = data.length
        this.binsDiscrete.push(superBins)

        return [classList, bins]
    }

    /** only used for special data cases */
    pushToClassList(skeleton, hetero, classList, setName, specialData){
        let bins = []
        classList.forEach((name,index)=>{
            let thisbin = []
            thisbin.name = name
            bins.push(thisbin)
        })

        let startIndex = 1
        if(specialData){startIndex = 0} //for special data there is no header, so the index starts at 0
        for(let i=startIndex; i<specialData.length; i++){
            let formula = new ChemFormula(specialData[i][config.formulatext])
            let chemicalClass = this.defineClass(formula.formula, skeleton, hetero)
            //add it to a bin
            let found = false
            for(let j=0; j<bins.length; j++){
                if(bins[j].name == chemicalClass){
                    bins[j].push(specialData[i])
                    found =true
                }else if(bins[j].name == "Other" && !found){
                    //pushes to the bin "Other" data that couldn't be put in another bin
                    bins[j].push(specialData[i])
                }
            }
        }
        let lookForFullDataset =false
        if((setName.includes("highlighted")||setName.includes("filtered")) && !this.canvas.cfg.interactivity.histogramRelativity){
            lookForFullDataset = true
        }
        //computes the intensity of each bin
        bins.forEach((bin)=>{ 
            let value = 0
            bin.forEach((d)=>{
                let intensity = parseFloat(d[config.intensity])
                if (!isNaN(intensity)){value  += intensity;}
            })
            bin.intensity = value
        })


        //count total intensity and number
        let totalHeight = 0;
        let totalLength = 0;
        if(lookForFullDataset){
            specialData.forEach((val)=>{
                let intensity = parseFloat(val[config.intensity])
                if (!isNaN(intensity)){totalHeight  += intensity;}
            })
            totalLength = specialData.length
        }else{
            this.data.forEach((val)=>{
                let intensity = parseFloat(val[config.intensity])
                if (!isNaN(intensity)){totalHeight  += intensity;}
            })
            totalLength = this.data.length
        }

        let superBins = {}
        superBins.bins = bins
        superBins.name = setName
        superBins.totalHeight = totalHeight
        superBins.totalNumber = totalLength
        return superBins
    }

    /**with a formulaObject  returns its class based on its skeleton and hetero. Returns a string */
    defineClass(formula, skeleton, hetero){
        let onlySkeleton = true //checks if only elements from the skeleton have been found
        let skeletonName = "" // checks the name made from which elements from the skeleton are found
        let heteroName = "" //makes the names for heterolements
        //loops through the elements
        for(let i=0; i<formula.length; i++){
            let el = formula[i].name
            //looks if the only elements are from the skeleton
            if(el == "e"){continue;} //skips for electron count
            let foundInSkeleton = false;
            for(let j=0; j<skeleton.length; j++){
                //if the element is from the skeleton, skips to the next element in the formuka
                if( el == skeleton[j]){skeletonName += el;foundInSkeleton =true; break;}
            }
            if(foundInSkeleton){continue;}
            //if we never skipped before, it means there is an element that is unaccounted for
            onlySkeleton = false
            //looks for heteroelements
            if(!hetero){return;}
            for(let j=0; j<hetero.length; j++){
                //if the element is to be considered, adds it
                if( el == hetero[j].name){
                    if(hetero[j].showNumber && formula[i].number>0){
                        heteroName += el + formula[i].number
                    }else if (formula[i].number>0){
                        heteroName += el 
                    }
                    break;
                }
            }
        }
        if(skeletonName == ""){skeletonName = "Other"}
        if(heteroName == ""){heteroName = "Other"}
        
        if(skeletonName == "CH"){skeletonName = "HC"} //standard name
        if(onlySkeleton){return skeletonName}
        else{ return heteroName}
    }

    /** needs the whole cell cfg because there can be a lot of variables */
    calculate2DBins(cfg, specialData){
        if(debug){console.log("computing 2D bins for dataset n°"+this.index+"on canvas"+this.canvas.letter)}
        //clears any old bins with the same name
        if(!this.bins2D){this.bins2D = []}
        for(let i=this.bins2D.length; i>=0; i--){
            if(!this.bins2D[i]){continue;}
            if(this.bins2D[i].name == name){
                this.bins2D.splice(i,1)
            }
        }
        //prepares the new bins
        let bins = []
        let widthX = cfg.xmax - cfg.xmin
        let widthY = cfg.ymax - cfg.ymin
        let  binWidthX = widthX/cfg.resolutionX
        let  binWidthY = widthY/cfg.resolutionY
        for(let i=0; i<cfg.resolutionX; i++){
            bins[i] = []
            bins[i].x0 = cfg.xmin + binWidthX*i
            bins[i].x1 = cfg.xmin + binWidthX*(i+1)
            for(let j=0; j<cfg.resolutionY; j++){
                bins[i][j] = []
                bins[i][j].x0 = bins[i].x0
                bins[i][j].x1 = bins[i].x1
                bins[i][j].y0 = cfg.ymin + binWidthY*j
                bins[i][j].y1 = cfg.ymin + binWidthY*(j+1)
            }
        }
        //put data in bins
        let data = specialData || this.data
        //TODO start data from 0 once first line is removed
        for(let i=1; i<data.length; i++){
            let x = data[i][cfg.xtype]
            let y = data[i][cfg.ytype]
            let projX = (x - cfg.xmin)/widthX*cfg.resolutionX
            let projY = (y - cfg.ymin)/widthY*cfg.resolutionY
            projX = Math.floor(projX)
            projY = Math.floor(projY)
            //verifies the existence of the bin
            if(!isNaN(projX) && !isNaN(projY) && bins[projX] && bins[projX][projY]){
                bins[projX][projY].push(data[i])
            }
        }
        //compute intensity length of every bin
        let totalHeight = 0
        for(let i=0; i<bins.length; i++){
            for(let j=0; j<bins[i].length; j++){
                let totInt = 0
                for(let k=0; k<bins[i][j].length; k++){
                    totInt += parseFloat(bins[i][j][config.intensity])
                }
                bins[i][j].totInt = totInt
            }
        }
        return bins
    }

    findBinsDiscrete(name){
        if(!this.binsDiscrete){this.binsDiscrete = []}
        for(let i=0; i<this.binsDiscrete.length; i++){
            if(this.binsDiscrete[i].name == name){
                return this.binsDiscrete[i]
            }
        }
        return {}
    }

    resetFilters(){
        console.log("reset all filters - dataset level")
        this.dataFiltered = []
        this.filters = []
    }

    pushToHighlight_indexList(indexList){
        let dataList = []
        this.data.forEach((peak)=>{
            for(let i=0; i<indexList.length; i++){
                if(peak.index == indexList[i]){
                    dataList.push(peak)
                    break;
                }
            }
        })
        if(!this.dataHighlighted){this.dataHighlighted = []}
        for(let i=0; i<dataList.length; i++){
            this.dataHighlighted.push(dataList[i])
        }
    }
    /***********Mass differences related functions**********************************************/
    
    prepareMassDifferences(bounds,tolerance, cutoff, useFilteredData){
        let groups = this.calculateMassDifferences(bounds, tolerance, useFilteredData)
        //cutoff small groups
        for(let i=groups.length-1; i>=0; i--){
            if(groups[i].occurences<=cutoff){groups.splice(i,1)}
        }
        this.massDifferences_groups = groups
        return groups
    }

    //calculate mass differences in a given range within a mDa tolerance, outputs a list of groups
    calculateMassDifferences(bounds,tolerance, useFilteredData){
        //sort data by mz values. this.sort cannot be used because it refreshes
        let data = this.data
        if(useFilteredData && this.dataFiltered && this.dataFiltered.length >0){data = this.dataFiltered}
        data.sort((a,b)=>a[config.mz]-b[config.mz])
        let differences = []
        //starts at 1 to avoid header column
        for(let i=1; i<data.length; i++){
            let mass1 = data[i][config.mz]
            for(let j=i-1; j>=1; j--){ //also starts at 1 to avoid header
                let mass2 = data[j][config.mz]
                let diff = mass1-mass2;
                if(diff ==NaN){continue;}
                //handle out of bounds mass differences
                if(diff<bounds[0]){continue;}
                if(diff>bounds[1]){break;}
                let massdiff = {"mass":diff,"origin":i,"target":j,"originID":data[i].index,"targetID":data[j].index}
                differences.push(massdiff)
            }
        }
        //sort differences
        differences.sort((a,b)=> a.mass - b.mass)
        //prepares tolerance, which is entered in mDa
        tolerance = tolerance/1000
        //groups differences
        let groups = []
        if(!differences[0]){return;}
        groups.push({"occurences":1,"mass":differences[0].mass,differences:[differences[0]]})
        let groupIndex = 0
        for(let i=1; i<differences.length; i++){
            let anchorGroup = groups[groupIndex]
            let mass1 = differences[i].mass
            let diff = anchorGroup.mass - mass1
            
            if(Math.abs(diff)<tolerance){
                anchorGroup.differences.push(differences[i])
                anchorGroup.mass = (anchorGroup.mass*anchorGroup.occurences + mass1)/(anchorGroup.occurences+1)
                anchorGroup.occurences +=1
            }else{
                //create a new group
                groupIndex +=1
                groups.push({"occurences":1, "mass":mass1, differences:[differences[i]]})
            }
        }
        groups.sort((a,b)=> b.occurences - a.occurences)
        return groups
    }

    /** prepares on already computed groups of mass differences special methods to compute a proxy "intensity" */
    prepareMassDifferences_intensity(type, isDataReduced, groups){
        //loops through each group and computes the "intensity" based on type parameter using each mass difference
        for(let i=0; i<groups.length; i++){
            let thisGroup = groups[i]
            let intensity = 0
            let differences = thisGroup.differences
            if(isDataReduced){differences = thisGroup.differences_red}
            if(type == "origin"){
                for(let j=0; j<differences.length; j++){
                    let origin = this.data[differences[j].origin]
                    intensity += parseFloat(origin[config.intensity])
                }
            }else if(type == "target"){
                for(let j=0; j<differences.length; j++){
                    let target = this.data[differences[j].target]
                    intensity += parseFloat(target[config.intensity])
                }
            }else if(type =="product"){
                for(let j=0; j<differences.length; j++){
                    let origin = this.data[differences[j].origin]
                    let target = this.data[differences[j].target]
                    intensity += parseFloat(origin[config.intensity])*parseFloat(target[config.intensity])
                }
            }else if(type =="sum"){
                for(let j=0; j<differences.length; j++){
                    let origin = this.data[differences[j].origin]
                    let target = this.data[differences[j].target]
                    intensity += parseFloat(origin[config.intensity])+parseFloat(target[config.intensity])
                }
            }else if(type =="similarity"){
                for(let j=0; j<differences.length; j++){
                    let origin = this.data[differences[j].origin]
                    let target = this.data[differences[j].target]
                    let origin_int = origin[config.intensity]
                    let target_int = target[config.intensity]
                    let score = 1 - Math.abs(origin_int - target_int)/Math.max(origin_int, target_int)
                    intensity += score
                }
            }
            if(isDataReduced){
                thisGroup.intensity_red = intensity
            }else{
                thisGroup.intensity =intensity
            }
        }

    }

    filterMassDifferences(filterType, typeofMassDifference){
        //build an index list of highlighted
        if(!this.dataHighlighted || this.dataHighlighted.length == 0){return}
        let indexes = []
        for(let i=0; i<this.dataHighlighted.length; i++){
            indexes[this.dataHighlighted[i].index] = true
        }
        let groups = this.massDifferences_groups
        if(typeofMassDifference == "formula"){
            groups = this.massDifferences_groupsFormula
        }
        for(let i=0; i<groups.length; i++){
            this.filterMassDifferences_singleGroup(groups[i], filterType, indexes)
        }
        return groups
    }

    filterMassDifferences_singleGroup(group, filterType, selection){
        let count = 0
        let differences_red = []
        for(let i=0; i<group.differences.length; i++){
            let diff = group.differences[i]
            let valid = false
            //based on the filter type, counts this occurence or not
            if(filterType == "origin" && selection[diff.originID]){valid=true}
            else if(filterType == "target" && selection[diff.targetID]){valid=true}
            else if(filterType == "any" &&  (selection[diff.originID] || selection[diff.targetID])){valid=true}
            else if(filterType == "both" && selection[diff.originID] && selection[diff.targetID]){valid=true}
            if(valid){
                count +=1
                differences_red.push(diff)
            }
        }
        group.occurences_red = count
        group.differences_red = differences_red
    }
    /***---------------------------***/
    prepareMassDifferences_formula(bounds, cutoff, useFilteredData){
        let groups = this.calculateMassDifferences_formula(bounds, useFilteredData)
        //cutoff small groups
        for(let i=groups.length-1; i>=0; i--){
            if(groups[i].occurences<=cutoff){groups.splice(i,1)}
        }
        this.massDifferences_groupsFormula = groups
        return groups
    }

    //calculate mass differences in a given range using chemical formulae
    calculateMassDifferences_formula(bounds, useFilteredData){
        //sort data by mz values. this.sort cannot be used because it refreshes
        let data = this.data
        if(useFilteredData && this.dataFiltered && this.dataFiltered.length >0){data = this.dataFiltered}
        data.sort((a,b)=>a[config.mz]-b[config.mz])
        let differences = []
        //builds formula objects based on data formula
        for(let i=1; i<data.length; i++){
            data[i].formula = new Molecule(data[i][config.formulatext])
        }
        //starts at 1 to avoid header column
        let diffmasses = []
        let groups = []
        let groupIndex = 0
        for(let i=1; i<data.length; i++){
            let formula1 = data[i].formula
            for(let j=i-1; j>=1; j--){ //also starts at 1 to avoid header
                let formula2 = data[j].formula
                let diff = formula1.returnDuplicate()
                diff.removeFormula(formula2);
                if(!diff || !diff.mass){continue;}
                //handle out of bounds mass differences
                if(diff.mass<bounds[0]){continue;}
                if(diff.mass>bounds[1]){break;}
                let linkdiff = {"formula":diff,"mass":diff.mass,"origin":i,"target":j,"originID":data[i].index,"targetID":data[j].index}
                //since we have exact mass, we can pre-group by mass
                //if the mass doesn't already exist, create a new group
                if(!diffmasses[diff.mass]){
                    diffmasses[diff.mass] = []
                    diffmasses[diff.mass].push({name:diff.name,index:groupIndex})
                    groups.push({"occurences":1,"mass":diff.mass,formula:diff.name,differences:[linkdiff]})
                    groupIndex +=1
                }else{
                //look if this formula has already been found
                let found = false;
                    for(let k=0; k<diffmasses[diff.mass].length; k++){
                        if(diffmasses[diff.mass][k].name != diff.name){continue;}
                        let diffmass = diffmasses[diff.mass][k]
                        let group = groups[diffmass.index]
                        group.occurences += 1
                        group.differences.push(linkdiff)
                        found = true
                        break;
                    }
                    //if it isn't foud, create a new group
                    if(!found){
                        diffmasses[diff.mass].push({name:diff.name,index:groupIndex})
                        groups.push({"occurences":1,"mass":diff.mass,formula:diff.name,differences:[linkdiff]})
                        groupIndex +=1
                    }
                }

                
            }
        }
        groups.sort((a,b)=> b.occurences - a.occurences)
        return groups
    }

    /***************************MATRIX RELATED FUNCTIONS *************************************** */
    /** prepares the file if it is considered as a matrix by puncdata */
    prepareAsMatrix(){
        if(!this.dataName.includes("file") && this.dataName !="matrix"){return false;}
        let dataIndex = parseInt(this.dataName.slice(5))  
        let file = files.list[dataIndex]  
        if(file && file.matrix && file.matrix.matrixMin){
            let matrixMin = file.matrix.matrixMin
            let matrixMax = file.matrix.matrixMax
            this.matrixCols = [matrixMin, matrixMax]
        }else if(this.dataName == "matrix"){
            this.matrixCols = [matrixFilesColumns[0],matrixFilesColumns[1]]
            this.matrixCols[1] -= 1 //TODO: correct this by changing the matrxiFilesColumns which has an error. I can't fix it ones
        }else{ 
            this.matrixCols  = []
            return false;
        }
        //looks for how many peaks there are in each of these subfiles
        this.matrixTotalCounts = []
        this.matrixTotalIntensities = []
        for(let i=this.matrixCols[0]; i<=this.matrixCols[1]; i++){
            let totNb = 0
            let totInt = 0
            this.data.forEach((peak)=>{
                if(peak[i] && peak[i] !=0 && !isNaN(peak[i])){
                    totNb +=1
                    totInt += parseFloat(peak[i])
                }
            })
            this.matrixTotalCounts[i] = totNb
            this.matrixTotalIntensities[i] = totInt
        }
        return "done"
    }

    /** prepares the means and std dev for each bin of the bins collection inputted. Computes mean#, mean relative# and relative intensity */
    prepareBinsForMatrix(bins){
        if(!this.matrixCols){return;}
        let totCounts = this.matrixTotalCounts
        let totIntensities = this.matrixTotalIntensities
        bins.bins.forEach((bin, index) =>{
            let matrixCounts = []
            let matrixCountsAbsolute = []
            let matrixIntensities = []
            //counts and sums intensites for each subfile of the matrix
            for(let i=this.matrixCols[0]; i<=this.matrixCols[1]; i++){
                let result = this.countForMatrixCol(bin, i)
                matrixCountsAbsolute[i] = result[0]
                matrixCounts[i] = result[0]/totCounts[i]
                matrixIntensities[i] = result[1]/totIntensities[i]
            }
            //computes the mean 
            let totCountAbsolute = 0
            let totCount = 0
            let totIntensity = 0
            let fileNb = (this.matrixCols[1] - this.matrixCols[0])+1
            for(let i=this.matrixCols[0]; i<=this.matrixCols[1]; i++){
                totCountAbsolute += matrixCountsAbsolute[i]
                totCount += matrixCounts[i]
                totIntensity += matrixIntensities[i]
            }
            let meanCountAbsolute = totCountAbsolute/fileNb
            let meanCount = totCount/fileNb
            let meanIntensity = totIntensity/fileNb
            //loops again for the std dev
            let sumDevNbAbs = 0;
            let sumDevNb = 0;
            let sumDevI= 0;
            for(let i=this.matrixCols[0]; i<this.matrixCols[1]; i++){
                sumDevNbAbs += Math.pow(matrixCountsAbsolute[i] - meanCountAbsolute, 2)
                sumDevNb += Math.pow(matrixCounts[i] - meanCount, 2)
                sumDevI += Math.pow(matrixIntensities[i] - meanIntensity, 2)
            }
            let stdDevNbAbs =  Math.sqrt(sumDevNbAbs/fileNb)
            let stdDevNb =  Math.sqrt(sumDevNb/fileNb)
            let stdDevI =  Math.sqrt(sumDevI/fileNb)
            
            //appends everything to the bin
            bin.matrixCountsAbsolute = matrixCountsAbsolute
            bin.matrixCounts = matrixCounts
            bin.matrixI = matrixIntensities
            bin.matrixMeanCountAbsolute = meanCountAbsolute
            bin.matrixMeanCount = meanCount
            bin.matrixMeanI = meanIntensity
            bin.matrixStdDevNbAbsolute = stdDevNbAbs
            bin.matrixStdDevNb = stdDevNb
            bin.matrixStdDevI = stdDevI
        })
    }

    countForMatrixCol(bin, matrixCol){
        let count = 0
        let intensity = 0
        for(let i=0; i<bin.length; i++){
            if(bin[i][matrixCol] && bin[i][matrixCol] !=0){
                count +=1
                intensity += parseFloat(bin[i][matrixCol])
            }
        }
        return [count, intensity]
    }

    exportCfg(){
        //exporting must avoid cyclic values
        let keysToAvoid = ["dataSet"]
        let exp_cfg = omitKeys(this.cfg, keysToAvoid)
        return exp_cfg
    }
}

/******************************************************************************* */
/*                            CONFIGURATIONS                                     */
/******************************************************************************* */

class ConfigCell{
    constructor(type,cell, defaultCfg = config){
        this.cell = cell
        this.config = defaultCfg
        this.xmin = 0
        this.xmax = 1
        this.ymin = 0
        this.ymax = 1
        this.activeData = Array.from("1".repeat(this.cell.canvas.cfg.dataNb))
        this.prepareCfg(type)
    }
    /** changes the type of this configCell */
    prepareCfg(type){
        if(!this.cell.prepareCfg){return;}
        let properties  = this.cell.prepareCfg()
        properties.forEach((d)=>{
            this[d.key] = d.default
        })
        this.type =type
        return this
    } 
    linkToCell(cell){
        this.cell = cell
        return cell
    }

    copyCfg(cfg){
        this.xmin = cfg.xmin || this.xmin
        this.xmax = cfg.xmax || this.xmax
        this.ymin = cfg.ymin || this.ymin
        this.ymax = cfg.ymax || this.ymax
        this.activeData = cfg.activeData || this.activeData
        let properties  = this.cell.prepareCfg(cfg.type)
        properties.forEach((d)=>{
            this[d.key] = cfg[d.key] || this[d.key]
        })

        return this
    }
    /**a function to ask this config what are the actual relevent variables here 
     * @returns an array with each element having a name, keys, types, and values
    */
    askVars(){
        let varsArray =[]
        let typeOptions = this.cell.canvas.returnCellTypesList()
        varsArray.push({
            "name":"Type",
            "inputs":[{key:"type",type:"select",value:this.type,title: "Choose the type of chart",update:(d,p)=>{this.update(d,p)},options:typeOptions}]
        })

        if(this.cell.preparePopupCfg){
            let varsArray2 = this.cell.preparePopupCfg()
            varsArray2.forEach((item) =>{varsArray.push(item)})
        }        
        return varsArray 
    }
    update(d, popup){
        let value = d.target.value
        if(d.target.type=="number"){value = parseFloat(value)} 
        else if(d.target.type=="checkbox"){value = d.target.checked}
        let type = d.target.name
        if(type =="type"){
            let cellIndex = this.cell.index
            let canvas = this.cell.canvas
            canvas.changeCellType(cellIndex, value)
            if(popup){this.reopenPopup(popup, value)}
        }else if(this[type] != value){
            this[type] = value
            this.cell.update(type+"_")
            this.cell.updateAllData(type+"_")
            if(popup){this.reopenPopup(popup);} // reopens when specific update operations have been done
        }
    }
    /** used when a cfg edit popup needs to be refresh. Called by update */
    reopenPopup(popup, typeChanged){
        let cellIndex = this.cell.index
        let top = popup.top
        let left = popup.left
        popup.close()
        new MovableWindowCellConfig(this.cell.canvas.cells[cellIndex],{"top":top,"left":left}) //TODO check for memory leak here OR make cfg be replacable
        delete this 
        //updates the top table
        if(!this.cell.canvas.htmlTopMenu){return;}
        let menu = this.cell.canvas.htmlTopMenu.html
        if(typeChanged){menu.querySelectorAll("select[name='type']")[this.cell.index].value = typeChanged }

    }

    updateActiveData(d){
        let dataIndex = d.target.name.slice(4)
        let isChecked = d.target.checked
        if(isChecked != this.activeData[dataIndex]){
            this.activeData[dataIndex] = isChecked
            this.cell.drawAllData()
        }
        //updates the top table if needed
        if(this.cell.canvas.htmlTopMenu){
            let menu = this.cell.canvas.htmlTopMenu.html
            menu.querySelectorAll("input[name='data_shown']")[this.cell.index].value = this.cell.canvas.htmlTopMenu.findValueDataShown(this.cell.index)
        }
    }
}
/*************************************************************************** */

class ConfigDataSet{
    constructor(dataSet){
        this.dataSet = dataSet;
        this.colorGradient = "Viridis";
        this.colorInvert = false;
        this.colorRelative = false;
        this.colorSolid = "#4a82be"
        this.colorType = 0;
        this.maxColor = 1000;
        this.minColor = 0;
    }
    /** copy another config without changing the dataset */
    copyCfg(cfg){
        this.colorGradient = cfg.colorGradient || this.colorGradient;
        this.colorInvert = cfg.colorInvert || this.colorInvert;
        this.colorRelative = cfg.colorRelative || this.colorRelative
        this.colorSolid = cfg.colorSolid || this.colorSolid
        this.colorType = cfg.colorType || this.colorType
        this.maxColor = cfg.maxColor || this.maxColor
        this.minColor = cfg.minColor || this.minColor
    }
    updateActiveCell(d){
        let cellIndex = d.target.name.slice(4)
        let isChecked = d.target.checked
        let cell = this.dataSet.canvas.cells[cellIndex]
        if(isChecked != cell.cfg.activeData[this.dataSet.index]){
            cell.cfg.activeData[this.dataSet.index] = isChecked
            cell.drawData(this.dataSet, this.dataSet.index)
        }
    }
}


/******************************************************************************* */
/*                            BUILD TOOLTIPS                                     */
/******************************************************************************* */

class TooltipCanvas{
    constructor(htmlAnchor, canvas){
        this.html = htmlAnchor
        this.canvas = canvas
        //TODO check if there is a risk of multiplying tooltips ? maybe make a remove check
        this.htmlDiv = appendTooltip(htmlAnchor,"tooltip")
        this.htmlStick = appendTooltip(htmlAnchor,"tooltip_click")
        this.htmlClose = appendTooltip(htmlAnchor,"tooltip_click")
        this.htmlClose.html("X").style("width","20px").on("click",(d)=>this.close(d))
    }
    /** closes a tooltip */
    close(d){
        this.htmlStick.style("opacity",0).style("left",-1000).style("top",-1000)
        this.htmlClose.style("opacity",0).style("left",-1000).style("top",-1000)
        //find the highlighted chart and refreshes it
        let cellID = d.target.getAttribute("cellid")
        if(!cellID || !this.canvas.cells[cellID]){throw new Error("trying to close a tooltip not linking back to a cell")}
        this.canvas.cells[cellID].drawAllData()
    }
    /** renders the tooltip visible when mouse is moved */
    mouseover(element){
        this.htmlDiv.style("opacity",1)
        d3.select(element.target).style("opacity",1)
    }
    /** moves the tooltip around and modifies its content */
    mousemove(element, type, data, parentCell){
        let elClass = element.target.getAttribute('class')
        if(elClass && elClass.includes('tohide')){return;}
        this.htmlDiv.style("left",event.pageX+10)
        this.htmlDiv.style("top",event.pageY+10)
        if(type=="returnThis"){
             this.htmlDiv.html(data);
             return;
        }
        let suppData = this.buildSuppData(element, type, parentCell)
        this.htmlDiv.html(this.buildText(type, data, suppData))
        drawTooltipPieChart2(this.canvas, data, this.htmlDiv, suppData)

    }
    /**makes the tooltip disappear */
    mouseleave(element, doNotChangeOpacity){
        this.htmlDiv.style("opacity",0).style("left",-1000).style("top",-1000)
        if(doNotChangeOpacity){return;}
        d3.select(element.target).style("opacity",this.canvas.cfg.opacity)
    }
    /** when ctrl is pressed, will make a sticky tooltip */
    mouseclick(element, type, data, parentCell){
        if(!event.ctrlKey){
            return
        }
        let elClass = element.target.getAttribute('class')
        if(elClass && elClass.includes('tohide')){return;}
        this.htmlClose.style("opacity", 1)
        this.htmlClose.attr("cellid",parentCell.index).style("left", event.pageX+290 ).style("top", event.pageY+10 )
        this.htmlStick.style("opacity",1)
        this.htmlStick.style("left",event.pageX+10)
        this.htmlStick.style("top",event.pageY+10)
        if(type=="returnThis"){
            this.htmlStick.html(data);
            return;
       }
        let suppData = this.buildSuppData(element, type, parentCell)
        this.htmlStick.html(this.buildText(type, data, suppData))
        if(type == "histogram" || type == "histodiscrete" || type=="density"|| type=="histogram_matrix"){
            let button = menuCreate_button(null, "name", "copy Data",(d)=>{
                if(this.canvas.data[suppData.dataID]){
                    let thisData = this.canvas.data[suppData.dataID]
                    let bins = thisData.findBins("cell"+parentCell.index)
                    copy2DDataSubsetToClipboard(element.target.__data__, thisData.header)

                }
            })
            button.setAttribute("class","databaseSearch")
            this.htmlStick.node().appendChild(button)
        }else if(type =="massDifferences"){
            let button = menuCreate_button(null, "name", "copy Differences",(d)=>{
                if(this.canvas.data[suppData.dataID]){
                    let thisData = this.canvas.data[suppData.dataID]
                    copyMassDifferencesDataToClipboard(element.target.__data__, thisData)
                }
            })
            button.setAttribute("class","databaseSearch")
            this.htmlStick.node().appendChild(button)
        }else if(type =="massDifferences_formula"){
            let button = menuCreate_button(null, "name", "copy Differences",(d)=>{
                if(this.canvas.data[suppData.dataID]){
                    let thisData = this.canvas.data[suppData.dataID]
                    copyMassDifferencesDataToClipboard(element.target.__data__, thisData)
                }
            })
            button.setAttribute("class","databaseSearch")
            this.htmlStick.node().appendChild(button)
        }

        //highlights the selected dot
        d3.select(element.target).style("stroke", "black")
        d3.select(element.target).style("stroke-dasharray", "6 1")
        d3.select(element.target).style("stroke-dashoffset", "100")
        d3.select(element.target).style("animation", "dash 20s linear infinite")
        d3.select(element.target).style("stroke-width", "10")


    }

    buildSuppData(element, type, parentCell){
        if(!parentCell){return;}
        let htmlSupp  = element.target.getAttribute('tooltipHTML')
        let suppData = htmlSupp.split(";")
        let output = {
            "cellID":parentCell.index,
            "dataID":suppData[1],
            "localDataID":suppData[2]
        }
        return output
    }
    
    /**
     * builds the html text part of a data tooltip
     * @param {*} type type of chart
     * @param {*} data the data array 
     * @returns a string of html
     */
    buildText(type,data, suppData){
        let lines=[]
        //writes the chemical
        var cleanFormula = data[config.formulatext] || ""
        if(cleanFormula && typeof cleanFormula == "string"){
            var regex = new RegExp(/[0-9]/, "gi")
            cleanFormula = cleanFormula.replace(regex, function(matched) {return "<sub>" + matched + "</sub>";})
        }

        if(type =="scatterPlot" || type=="massSpectra"){
            lines[0] = "formula :"+(cleanFormula)+"<button class='databaseSearch' onclick='seekDataBasePopup(`"+data[config.formulatext]+"`)'> search DB </button>"
            lines[1] = "m/z :"+(data[config.mz] || "")+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data[config.mz]+"`)'> show formulae </button>"
            lines[2] = "ppm error :"+(parseFloat(data[config.ppmerror]).toFixed(6) || "")+"<button class='databaseSearch' onclick='popupAddToCalibList(`"+data[config.formulatext]+"`)'> Add to calibration list </button>"
            if(config.customTooltipData.length>0){
             lines[3] = "----------"
            }
            for(let i=0; i<config.customTooltipData.length; i++){
            lines[4+i] = columnNames[config.customTooltipData[i]] + ":"+data[config.customTooltipData[i]]
            }
        }else if(type =="kendrick"){
            lines[0] = "formula :"+(cleanFormula)+"<button class='databaseSearch' onclick='seekDataBasePopup(`"+data[config.formulatext]+"`)'> search DB </button>"
            lines[1] = "m/z :"+(data[config.mz] || "")+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data[config.mz]+"`)'> show formulae </button>"
            lines[2] = "ppm error :"+(parseFloat(data[config.ppmerror]).toFixed(6) || "")+"<button class='databaseSearch' onclick='popupAddToCalibList(`"+data[config.formulatext]+"`)'> Add to calibration list </button>"
            let thisCell = this.canvas.cells[suppData.cellID]
            let dataNum = suppData.dataID
            let thisUnitName = thisCell.cfg.kendrickFormula
            let kendrick = this.canvas.data[dataNum].findKM(thisUnitName)
            let defect = kendrick.defects[suppData.localDataID].toFixed(4) || ""
            lines[3] = "KMD("+thisUnitName+") :"+defect
            if(config.customTooltipData.length>0){
             lines[4] = "----------"
            }
            for(let i=0; i<config.customTooltipData.length; i++){
            lines[5+i] = columnNames[config.customTooltipData[i]] + ":"+data[config.customTooltipData[i]]
            }
        }else if(type =="kendrick2D"){
            lines[0] = "formula :"+(cleanFormula)+"<button class='databaseSearch' onclick='seekDataBasePopup(`"+data[config.formulatext]+"`)'> search DB </button>"
            lines[1] = "m/z :"+(data[config.mz] || "")+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data[config.mz]+"`)'> show formulae </button>"
            lines[2] = "ppm error :"+(parseFloat(data[config.ppmerror]).toFixed(6) || "")+"<button class='databaseSearch' onclick='popupAddToCalibList(`"+data[config.formulatext]+"`)'> Add to calibration list </button>"
            let thisCell = this.canvas.cells[suppData.cellID]
            let dataNum = suppData.dataID
            let thisUnitName = thisCell.cfg.kendrickFormula
            let secondUnitName = thisCell.cfg.kendrickFormula2
            let kendrick = this.canvas.data[dataNum].findKM2D([thisUnitName, secondUnitName])
            let defect1 = kendrick.defects1[suppData.localDataID].toFixed(4) || ""
            let defect2 = kendrick.defects2[suppData.localDataID].toFixed(4) || ""
            lines[3] = "KMD1("+thisUnitName+") :"+defect1
            lines[4] = "KMD2("+secondUnitName+") :"+defect2
            if(config.customTooltipData.length>0){
             lines[5] = "----------"
            }
            for(let i=0; i<config.customTooltipData.length; i++){
            lines[6+i] = columnNames[config.customTooltipData[i]] + ":"+data[config.customTooltipData[i]]
            }
        }else if(type == "histogram"){
            let thisCell = this.canvas.cells[suppData.cellID]
            let dataNum = suppData.dataID
            let dataset = this.canvas.data[dataNum]
            let bins = dataset.findBins("cell"+thisCell.index)
            let dataLength = (dataset.data.length-1) || 0
            lines[0] = "["+data.x0+";"+data.x1+"["
            lines[1] = "occurences : "+data.length+" ("+(100*data.length/dataLength).toFixed(2)+"%)"
            lines[2] = "intensity : "+data.intensity.toFixed(0)+" ("+(100*data.intensity/bins.totalHeight).toFixed(2)+"%)"
        }else if(type == "histodiscrete"){ //also considers histoclass
            let thisCell = this.canvas.cells[suppData.cellID]
            let dataNum = suppData.dataID
            let dataset = this.canvas.data[dataNum]
            let bins = dataset.findBinsDiscrete("cell"+thisCell.index)
            let dataLength = (dataset.data.length-1) || 0
            let dataName = data.name
            if(data.name ==0){dataName = "0"}
            lines[0] = dataName
            lines[1] = "occurences : "+data.length+" ("+(100*data.length/dataLength).toFixed(2)+"%)"
            lines[2] = "intensity : "+data.intensity.toFixed(0)+" ("+(100*data.intensity/bins.totalHeight).toFixed(2)+"%)"
            if(dataName == "Other" && data.fused){
                lines[3] = "Contains classes :" +data.namesList.join(", ")
            }
        }else if(type == "density"){
            lines[0] = "x:["+data.x0.toFixed(1)+";"+data.x1.toFixed(1)+"["
            lines[1] = "y:["+data.y0.toFixed(1)+";"+data.y1.toFixed(1)+"["
            lines[2] = "Number of peaks : "+data.length
            if(data.math){lines[3]="computed value: "+data.math.toFixed(2)}
        }else if(type =="histogram_matrix"){
            lines[0] = "["+data.x0+";"+data.x1+"["
            lines[1] = "occurences : "+data.matrixMeanCountAbsolute.toFixed(1)+"("+100*data.matrixMeanCount.toFixed(3)+" %)"
            lines[2] = "   std dev : "+data.matrixStdDevNbAbsolute.toFixed(3)+"("+data.matrixStdDevNb.toFixed(3)+")"
            lines[3] = "intensity : "+100*data.matrixMeanI.toFixed(3)+"%"
            lines[4] = "   std dev : "+data.matrixStdDevI.toFixed(3)
        }else if(type=="massDifferences"){
            lines[0] = "Mass : "+data.mass.toFixed(4)+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data.mass+"`)'> show formulae </button>"
            lines[1] = "Occurences : "+data.occurences
        }else if(type=="massDifferences_formula"){
            lines[0] = "Formula : "+data.formula
            lines[1] = "Mass : "+data.mass.toFixed(4)+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data.mass+"`)'> show formulae </button>"
            lines[2] = "Occurences : "+data.occurences
        }else if(type == "returnData"){
            if(data.length){
                lines[0]=suppData[0]|| ""
                lines[1]=suppData[1]|| ""
                lines[2]=suppData[2]|| ""
                lines[3]=suppData[3]|| ""
                lines[4]=suppData[4]|| ""
            }else{ lines[0] = data}
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
}


function seekDataBasePopup(textFormula){
    var button1 = {"name":"PUBCHEM" , "function":dbSearch_pubchem, "arg1":textFormula, "arg2":null, "arg3":null}
    var button2 = {"name":"KEGG" , "function":dbSearch_kegg, "arg1":textFormula, "arg2":null, "arg3":null}
    var button3 = {"name":"HUMAN METABOLOME DB" , "function":dbSearch_hmdb, "arg1":textFormula, "arg2":null, "arg3":null}
    var button4 = {"name":"LIPID MAPS" , "function":dbSearch_lipidmaps, "arg1":textFormula, "arg2":null, "arg3":null}
    var button5 = {"name":"KNApSAcK", "function":dbSearch_knapsack, "arg1":textFormula, "arg2":null, "arg3":null}
    handlePopup("seekDatabases","Search formula <b>"+textFormula+"</b> on which database ?",[button1,button2,button3,button4,button5],[],[])

}


function dbSearch_lipidmaps(textFormula){
    var link = "https://lipidmaps.org/quick_search?q="+textFormula
    window.open(link)
}

function dbSearch_pubchem(textFormula){
    var link = "https://pubchem.ncbi.nlm.nih.gov/#query="+textFormula
    window.open(link)
}

function dbSearch_kegg(textFormula){
    var link = "https://rest.kegg.jp/find/compound/"+textFormula+"/formula"
    window.open(link)
}

function dbSearch_hmdb(textFormula){
    var link = "https://hmdb.ca/unearth/q?utf8=%E2%9C%93&query="+textFormula+"&searcher=metabolites&button="
    window.open(link)
}

function dbSearch_knapsack(textFormula){
    var link = "http://www.knapsackfamily.com/knapsack_core/result.php?sname=all&word="+textFormula
    window.open(link)
}


/******************************************************************************* */
/*                            BUILD BRUSH FOR INTERACTIVITY                      */
/******************************************************************************* */

/** the interactive object to select data on a chart */
class BrushCanvas{
    constructor(canvas, cell, cellType){
        this.canvas = canvas
        this.interCfg = canvas.cfg.interactivity
        this.cell = cell
        this.cellType = cellType
        if(cellType =="passive"){return;}
        this.active = cell.svgSpace.call(d3.brush()
        .extent( [ [0,0], [this.cell.cfg.config.width,this.cell.cfg.config.height] ] )
        .keyModifiers(false) //disable the default functions of the brush when shift is pressed
        .filter((d) => { //filters when empty elements are selected and avoids errors being thrown
            if(d.target && d.target.__data__){return true}
        })
        .on("start brush", (d) => {this.defineSelection(d)}) // Each time the brush selection changes, trigger the 'updateChart' function
        .on("end", (d) => {this.brushZoom(d)})
        );
        this.cell.svgSpace.select("rect.selection").moveToBack()
        this.cell.svgSpace.select("rect.overlay").moveToBack()
        this.cell.svgSpace.selectAll("g.grid").moveToBack()
        this.addsDoubleClickUnzoom()
    }

    defineSelection(d){
        if(event.shiftKey){return}
        //finds all selected
        let selection = d.selection
        let cell = this.cell
        let cellType = this.cellType
        let cfg = this.cell.cfg
        let canvas = this.canvas
        let map = new Map()
        for(let i=0; i< this.canvas.data.length; i++){
            //checks if this data is active here and drawn
            if(cell.drawnData[i] == undefined){continue;}
            if(cell.cfg.activeData[i] != "1"){continue;}
            //checks if this dataset is interactible
            if(this.interCfg.active !="all" && this.interCfg.active != i){continue;}
            // if(cfgX.data[i].cellRestrictive == "custom" && cfgX.data[i].cellChoices && cfgX.data[i].cellChoices[cellNum] == false){console.log("here");continue;}
            if(cellType == "kendrick"){
                //find the kendrick dataset
                let kendrick = canvas.data[i].findKM(this.cell.cfg.kendrickFormula, this.cell.cfg.kendrickMass)
                if(!kendrick || !kendrick.defects){continue;}
                cell.drawnData[i].each(function(d, n){
                    if(this.style.display == "none"){return}
                    if(isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](kendrick.defects[n]))){
                        map.set(d.index, true)
                    } 
                } )
            }else if(cellType == "kendrick2D"){
                //find the kendrick dataset
                let kendrick = canvas.data[i].findKM2D([this.cell.cfg.kendrickFormula,this.cell.cfg.kendrickFormula2])
                if(!kendrick || !kendrick.defects1){continue;}
                cell.drawnData[i].each(function(d, n){
                    if(this.style.display == "none"){return}
                    if(isBrushed(selection, cell.scales[0](kendrick.defects1[n]), cell.scales[1](kendrick.defects2[n]))){
                        map.set(d.index, true)
                    } 
                } )
            }else if(cellType == "massSpectra" && cfg.ytype == "relative"){
                let maxInt = this.canvas.findMaxInt(false)
                cell.drawnData[i].each(function(d){
                    if(this.style.display == "none"){return}
                     if(isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](100*d[config.intensity]/maxInt))){
                        map.set(d.index, true)
                    } 
                    })
            }else if(cellType =="massSpectra"){
                cell.drawnData[i].each(function(d){
                    if(this.style.display == "none"){return}
                     if(isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[config.intensity]))){
                        map.set(d.index, true)
                    } 
                    })
            }else if(cellType =="massSpectraPCA"){
                cell.drawnData[i].each(function(d){
                    if(this.style.display == "none"){return}
                     if(isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[cell.cfg.ytype]))){
                        map.set(d.index, true)
                    } 
                    })
            }else if(cellType =="contourMap"){
                canvas.data[i].data.forEach((d) =>{
                    if(isBrushed(selection, cell.scales[0](d[cell.cfg.xtype]), cell.scales[1](d[cell.cfg.ytype]))){
                        map.set(d.index, true)
                    }
                })
            }else if(cellType =="errorMass"){
                cell.drawnData[i].each(function(d){
                    if(this.style.display == "none"){return}
                 if(isBrushed(selection, cell.scales[0](d[config.mz]), cell.scales[1](d[config.ppmerror]))){
                    map.set(d.index, true)
                }
                })
            }  
            else{
                cell.drawnData[i].each(function(d){
                    if(this.style.display == "none"){return}
                    if(isBrushed(selection, cell.scales[0](d[cell.cfg.xtype]), cell.scales[1](d[cell.cfg.ytype]))){
                        map.set(d.index, true)
                    }
                })
            }  
            let highlight = {
                origin:this.cellType,
                cellIndex:this.cell.index
            }
            this.filterData(i, map, highlight)

        }

        this.canvas.cells.forEach((item, index) =>{
            if(item && item.brush &&item.brush.updateFromMap ){
                item.brush.updateFromMap(map)
            }else if(item.handleHighlighting){
                item.handleHighlighting()
            }
        });
    }


    updateFromMap(map){
        let cfg = this.cell.cfg
        let selectedName = this.interCfg.selectionStyle
        if(cfg.config.blackCircle){selectedName = this.interCfg.selectionStyleBis}
        this.canvas.data.forEach((item,index)=>{
            if(this.cell.drawnData && this.cell.drawnData[index] && this.cell.cfg.activeData[index] == "1"){
                this.cell.drawnData[index].classed(selectedName, function(d){return map.has(d.index)})
            }
        })
    }

    brushZoom(d){
        if(!event.shiftKey){ return;}
        let selection = d.selection
        let new_x0 = this.cell.scales[0].invert(selection[0][0])
        let new_x1 = this.cell.scales[0].invert(selection[1][0])
        let new_y1 = this.cell.scales[1].invert(selection[0][1])
        let new_y0 = this.cell.scales[1].invert(selection[1][1])
        this.cell.scales[0].domain([ new_x0, new_x1])
        this.cell.scales[1].domain([new_y0, new_y1])
        this.cell.update("xmin_xmax_ymin_ymax_",true)
        this.cell.updateAllData("xmin_xmax_ymin_ymax_")
        this.cell.svgSpace.call(d3.brush().clear)
    }

    addsDoubleClickUnzoom(){
        this.cell.svgSpace.on("dblclick",(d) =>{
            if(event.target.nodeName == "text" || (event.target.nodeName == "path"&& event.target.classList[0] == "domain")){return;}
            this.cell.update("xmin_xmax_ymin_ymax_",false)
            this.cell.updateAllData("xmin_xmax_ymin_ymax_")
        }) 
        this.cell.axes[0].on("dblclick",(d) =>{
            this.cell.update("xmin_xmax_ymin_ymax_",false)
            this.cell.updateAllData("xmin_xmax_ymin_ymax_")
        }) 
        this.cell.axes[1].on("dblclick",(d) =>{
            this.cell.update("xmin_xmax_ymin_ymax_",false)
            this.cell.updateAllData("xmin_xmax_ymin_ymax_")
        }) 
    }

    filterData(dataIndex, selection, highlight){
        if(!this.canvas.data[dataIndex]){return;}
        let data = this.canvas.data[dataIndex].data
        let dataHighlighted = []
        data.forEach((d)=>{
            if(selection.has(d.index)){dataHighlighted.push(d)}
        })
        this.canvas.data[dataIndex].dataHighlighted = dataHighlighted
        this.canvas.data[dataIndex].highlight = highlight
        return dataHighlighted
    }

}

/** the interactive object to filter data on a chart */
class BrushFilterCanvas{
    constructor(canvas, cell, cellType){
        this.canvas = canvas
        this.interCfg = canvas.cfg.interactivity
        this.cell = cell
        this.cellType = cellType
        //if its an histogram, it's a brush only on the x axis. Special case for "matrix" type, where it is a 2D brush
        let brushType = d3.brushX
        if(cellType == "matrix"){brushType = d3.brush}
        this.active = cell.svgSpace.call(brushType()
        .extent( [ [0,0], [this.cell.cfg.config.width,this.cell.cfg.config.height] ] )
        .keyModifiers(false) //disable the default functions of the brush when shift is pressed
        .filter((d) => { //filters when empty elements are selected and avoids errors being thrown
            if(d.target && d.target.__data__){return true}
        })
        .on("start brush", (d) => {this.defineSelection(d)}) // Each time the brush selection changes, trigger the 'updateChart' function
        .on("end", (d) => {this.brushZoom(d); if(d.selection && d.selection[0]==d.selection[1]){this.canvas.resetFilters()}})
        );
        
        this.cell.svgSpace.select("rect.selection").moveToBack()
        this.cell.svgSpace.select("rect.overlay").moveToBack()
        this.cell.svgSpace.selectAll("g.grid").moveToBack()
        this.addsDoubleClickUnzoom()
    }

    defineSelection(d){
        if(event.shiftKey){return}
        if(d.selection[0]==d.selection[1]){
            //remove filters with this cell number
            let removed = false
            for(let i=this.canvas.filters.length-1; i>=0; i--){
                if(this.canvas.filters[i].cellIndex == this.cell.index){this.canvas.filters.splice(i,1);removed=true}
            }
        }
        //finds all selected
        let selection = d.selection
        let indexesList = []
        let cell = this.cell
        let cellType = this.cellType
        let cfg = this.cell.cfg
        let canvas = this.canvas
        
        let theseSelected = []
        for(i=0; i< this.canvas.data.length; i++){
            if(!this.canvas.data[i] || !this.canvas.data[i].data){continue;}
            if(this.canvas.data[i].length == 0){continue;}
            if(cfg.activeData[i] != "1"){continue;}
            if(this.interCfg.active !="all" && this.interCfg.active != i){continue;}
            let selectedBins = []
            let localSelected = []
            if(this.cellType =="histogram" ||this.cellType =="histoerror"){
                let filterDomain0 = cell.scales[0].invert(d.selection[0])
                let filterDomain1 = cell.scales[0].invert(d.selection[1])
                let binWidth = cell.cfg.barDensity
                let filter = {domain:[filterDomain0, filterDomain1],binWidth: binWidth, type:columnNames[cfg.xtype], origin:this.cellType, cellIndex:this.cell.index}
                let binsData = this.canvas.data[i].findBins("cell"+cell.index)
                if(!binsData.bins){continue;}
                selectedBins = this.selectBins(binsData,filter)
                for(let j=0; j<selectedBins.length;j++){
                    selectedBins[j].forEach((d)=>{
                        localSelected[d.index] = true
                    })
                }
                this.filterData(i, localSelected, filter)
                // this.canvas.drawAllDatasets([cell.index])
            }else if(this.cellType == "histodiscrete"){
                let domain = cell.scales[0].domain()
                let band = cell.scales[0].step()
                let index0 = Math.round(d.selection[0]/band)
                let index1 = Math.round(d.selection[1]/band)
                let newDomain = domain.slice(index0, index1)
                let binsData = this.canvas.data[i].findBinsDiscrete("cell"+cell.index)
                if(!binsData.bins){continue;}
                let filter = {domain:[index0, index1],trueDomain:newDomain,binWidth: "-1", type:columnNames[cfg.xtype], origin:this.cellType, cellIndex:this.cell.index}
                for(let i=0; i<binsData.bins.length; i++){
                    if(!binsData.bins[i] || binsData.bins[i].length == 0){continue;}
                    if(!newDomain.includes(binsData.bins[i].name)){continue;}
                    binsData.bins[i].forEach((d)=>{
                        localSelected[d.index] = true
                    })
                }
                this.filterData(i, localSelected, filter)
            }else if(this.cellType == "histoclass"){
                let domain = cell.scales[0].domain()
                let band = cell.scales[0].step()
                let index0 = Math.round(d.selection[0]/band)
                let index1 = Math.round(d.selection[1]/band)
                let newDomain = domain.slice(index0, index1)
                let binsData = this.canvas.data[i].findBinsDiscrete("cell"+cell.index)
                if(!binsData.bins){continue;}
                let filter = {domain:[index0, index1],trueDomain:newDomain,binWidth: "-1", type:"class", origin:this.cellType, cellIndex:this.cell.index}
                for(let i=0; i<binsData.bins.length; i++){
                    if(!binsData.bins[i] || binsData.bins[i].length == 0){continue;}
                    if(!newDomain.includes(binsData.bins[i].name)){continue;}
                    binsData.bins[i].forEach((d)=>{
                        localSelected[d.index] = true
                    })
                }
                this.filterData(i, localSelected, filter)
            }else if(this.cellType == "densityCurve"){
                let filterDomain0 = cell.scales[0].invert(d.selection[0])
                let filterDomain1 = cell.scales[0].invert(d.selection[1])
                let filter = {domain:[filterDomain0, filterDomain1],binWidth: "none", type:columnNames[cfg.xtype], origin:this.cellType, cellIndex:this.cell.index}
                if(this.canvas.data[i].data){
                    this.canvas.data[i].data.forEach((d)=>{
                        if(d[cfg.xtype]>=filterDomain0 && d[cfg.xtype]<=filterDomain1)
                            localSelected[d.index] = true
                    })
                }
                this.filterData(i, localSelected, filter)
            }else if(this.cellType == "matrix"){
                //this is a case where data point are the files from a matrix type dataset.
                let filterx = [cell.scales[0].invert(d.selection[0][0]),cell.scales[0].invert(d.selection[1][0])]
                let filtery = [cell.scales[1].invert(d.selection[1][1]),cell.scales[1].invert(d.selection[0][1])]
                let filter = {domain:[filterx, filtery],binWidth: "none", type:"pca", origin:this.cellType, cellIndex:this.cell.index}
                this.canvas.data[i].filter = filter
                let dataset = this.canvas.data[i]
                dataset.dataFiltered = []
                if(dataset.data){
                    //get the data
                    let data = []
                    let colStartIndex = 0
                    let colStartIndexPCA = 0  //the starting index for file PCA data to be found
                    if(dataset.dataName == "matrix"){
                        data = cvsPCA.loadings
                        colStartIndex = parseInt(matrixFilesColumns[0])
                        colStartIndexPCA = parseInt(matrixFilesColumns[1])
                    }else if(dataset.dataName.includes("file")){
                        let fileNum = parseInt(dataset.dataName.slice(5))
                        let file = files.list[fileNum]
                        if(!file || !file.matrix){continue;}
                        data = file.matrix.pca_loadings
                        if(!data || !data.length){continue;}
                        colStartIndex = parseInt(file.matrix.matrixMin)
                        colStartIndexPCA = parseInt(file.matrix.matrixMax)+1
                    }else{continue;}
                    //filters
                    let xtype = cfg.xtype - colStartIndexPCA
                    let ytype = cfg.ytype - colStartIndexPCA
                    data.forEach((d,n)=>{
                        if(d[xtype]>=filterx[0] && d[xtype]<=filterx[1] && d[ytype]>=filtery[0] && d[ytype]<=filtery[1] ){
                            let selectList = this.filterMatrixData(dataset, colStartIndex+n, cfg.threshold)
                            for(let i=0; i<selectList.length; i++){
                                localSelected[selectList[i].index] = true
                            }
                        }
                    })
                }
                this.filterData(i, localSelected, filter)
            }else if(this.cellType == "massDifference" || this.cellType == "massDifferences_formula"){
                let filterDomain0 = cell.scales[0].invert(d.selection[0])
                let filterDomain1 = cell.scales[0].invert(d.selection[1])
                let filter = {domain:[filterDomain0, filterDomain1],binWidth: "none", type:"deltam/z", origin:this.cellType, cellIndex:this.cell.index}
                if(this.cellType == "massDifference"&& this.canvas.data[i].massDifferences_groups){
                        this.canvas.data[i].massDifferences_groups.forEach((d)=>{
                            if(d.mass>=filterDomain0 && d.mass<=filterDomain1){
                                for(let j=0; j<d.differences.length; j++){
                                    localSelected[d.differences[j].originID] = true
                                    localSelected[d.differences[j].targetID] = true
                                }
                            }
                        })
                }else if(this.cellType == "massDifferences_formula"&& this.canvas.data[i].massDifferences_groupsFormula){
                    this.canvas.data[i].massDifferences_groupsFormula.forEach((d)=>{
                            if(d.mass>=filterDomain0 && d.mass<=filterDomain1){
                                for(let j=0; j<d.differences.length; j++){
                                    localSelected[d.differences[j].originID] = true
                                    localSelected[d.differences[j].targetID] = true
                                }
                            }
                        })
                }
                this.filterData(i, localSelected, filter)
            }
            //fuses back this round of data selection with the others
            let indexes = this.canvas.data[i].filterIndexes 
            if(!indexes){continue}
            for(let j=0; j<indexes.length; j++){
                theseSelected[indexes[j]]= true
            }
        }
        this.canvas.handleFiltering(theseSelected)
    }

    selectBins(binsData, filter, filterType){
        let selectedBins = []
        let binWidth = (filter.domain[1]- filter.domain[0])/filter.binWidth
        binsData.bins.forEach((bin)=>{
            if(bin.x0>=filter.domain[0] && bin.x0 <= filter.domain[1]){
                selectedBins.push(bin)
            }
        })
        return selectedBins
    }

    //defines what part of the dataset is filtered
    filterData(dataIndex, selection, filter){
        filter.selected = selection
        let thisData = this.canvas.data[dataIndex]
        if(!thisData.filters){thisData.filters = []}
        thisData.filters[this.cell.index] = selection
        //looks if a filter was already active on the same cell
        let filters = this.canvas.filters
        for(let i=0; i<filters.length; i++){
            let filterlooped = filters[i]
            if(filterlooped.cellIndex == filter.cellIndex){
                filters.splice(i,1)
                break;
            }
        }
        //adds it as a new filter if needed
        if(filter.domain[0] != filter.domain[1]){
            filters.push(filter)
        }else{}
        let data = thisData.data
        let dataFiltered = []
        let indexesList = [] //used for multi-filter search
        if(filters.length>1){ //longer all filters search
            data.forEach((d)=>{
                let isValid = true
                for(let i=0; i<filters.length; i++){
                    let cellIndex = filters[i].cellIndex
                    if(!thisData.filters[cellIndex][d.index]){isValid = false; break;}
                }
                if(isValid){
                    dataFiltered.push(d)
                    indexesList.push(d.index)
                }
            })
        }else if(filters[0] && filters[0].cellIndex == this.cell.index){//quick 1 filter search for the currently moved filter
            data.forEach((d)=>{
                if(selection[d.index]){
                    dataFiltered.push(d)
                    indexesList.push(d.index)
                }
            })
        }
        if(indexesList.length >0){thisData.filterIndexes = indexesList}
        else{thisData.filterIndexes  = []}

        thisData.dataFiltered = dataFiltered
        return dataFiltered
    }

    //returns a list of indexes present in this file
    filterMatrixData(dataset, column, threshold){
        let dataFiltered = []
        for(let i=0; i<dataset.data.length; i++){
            let peak = dataset.data[i]
            if(parseFloat(peak[column])>threshold){dataFiltered.push(peak)}
        }
        dataset.dataFiltered = dataFiltered
        return dataFiltered
    }

    brushZoom(d){
        if(!event.shiftKey){ return;}
        if(this.cellType =="histodiscrete"){return;}
        let selection = d.selection
        if(this.cellType == "matrix"){
            let new_x0 = this.cell.scales[0].invert(selection[0][0])
            let new_x1 = this.cell.scales[0].invert(selection[1][0])
            let new_y1 = this.cell.scales[1].invert(selection[0][1])
            let new_y0 = this.cell.scales[1].invert(selection[1][1])
            this.cell.scales[0].domain([ new_x0, new_x1])
            this.cell.scales[1].domain([new_y0, new_y1])
            this.cell.update("xmin_xmax_ymin_ymax_",true)
            this.cell.updateAllData("xmin_xmax_ymin_ymax_")
            this.cell.svgSpace.call(d3.brush().clear)
            return;
        }
        let new_x0 = this.cell.scales[0].invert(selection[0])
        let new_x1 = this.cell.scales[0].invert(selection[1])
        this.cell.scales[0].domain([ new_x0, new_x1])
        this.cell.update("xmin_xmax",true)
        this.cell.updateAllData("xmin_xmax")
        this.cell.svgSpace.call(d3.brush().clear)
    }

    addsDoubleClickUnzoom(){
        this.cell.svgSpace.on("dblclick",() =>{
            if(event.target.nodeName == "text" || (event.target.nodeName == "path"&& event.target.classList[0] == "domain")){return;}
            this.cell.update("xmin_xmax_ymin_ymax_",false)
            this.cell.updateAllData("xmin_xmax_ymin_ymax_")
        }) 
        this.cell.axes[0].on("dblclick",() =>{
            this.cell.update("xmin_xmax_ymin_ymax_",false)
            this.cell.updateAllData("xmin_xmax_ymin_ymax_")
        }) 
        this.cell.axes[1].on("dblclick",() =>{
            this.cell.update("xmin_xmax_ymin_ymax_",false)
            this.cell.updateAllData("xmin_xmax_ymin_ymax_")
        }) 
    }

}

/******************************************************************************* */
/*                      HTML MENU                                                 */
/******************************************************************************* */

class TopMenuCanvas{
    constructor(canvas, cvsHTML){
        this.canvas = canvas
        this.cvsHTML = cvsHTML
        this.inputs = {}
        this.draw()
    }

    draw(){
        let cvs = this.canvas
        let cellNb = cvs.cfg.cellNb
        let dataNb = cvs.cfg.dataNb
        this.cellDataChoices = []
        this.cellTypeChoices = []
        this.dataSourceChoices =[]

        let top = this.cvsHTML.querySelector("div[class='topselecter']")
        if(!top){throw new Error("Canvas top bar not found")}
        let menuButtons = top.querySelector("div[id='menubuttons']")
        if(!menuButtons){throw new Error("Canvas top bar not found")}
        //looks for old menu and removes them
        if(top.querySelector("div[name='generalMenu']")){top.querySelector("div[name='generalMenu']").remove() }
        if(top.querySelector("div[name='cellMenu']")){top.querySelector("div[name='cellMenu']").remove() }
        if(top.querySelector("div[name='dataMenu']")){top.querySelector("div[name='dataMenu']").remove() }
        //creates the general menu
        let genMenu = document.createElement("div")
        genMenu.id = "menu"
        genMenu.setAttribute("name","generalMenu")
        genMenu.style.marginRight = "20"

        let generalMatrixButton = document.createElement("button")
        generalMatrixButton.innerHTML = "Canvas manager"
        generalMatrixButton.addEventListener("click",(d)=>{new MovableWindowDataCellMatrix(this.canvas)})
        generalMatrixButton.style.height = "20%"
        generalMatrixButton.style.width = "100%"

        genMenu.appendChild(generalMatrixButton)
        let name = document.createElement("div")
        name.innerHTML = "<br> Data opacity:"
        genMenu.appendChild(name)
        genMenu.style.flex = "0.8"
            

        let opacityRange = document.createElement("input")
        opacityRange.setAttribute("type","range")
        opacityRange.setAttribute("min",0)
        opacityRange.setAttribute("max",1)
        opacityRange.setAttribute("step",0.05)
        opacityRange.setAttribute("value",this.canvas.cfg.opacity)
        opacityRange.style.width = "100%"
        opacityRange.addEventListener("change",(d)=>{
            this.canvas.cfg.opacity = d.target.value
            this.canvas.updateAllDataSet("opacity_")
        })
        genMenu.appendChild(opacityRange)

        let typeOptions = this.canvas.returnCellTypesList()
        
        //creates the cell menu
        let cellMenu = document.createElement("div")
        cellMenu.id = "menu"
        cellMenu.setAttribute("name","cellMenu")
        cellMenu.style.marginRight = "20"
        cellMenu.style.overflowY = "auto"
        cellMenu.style.flex = "1.7"
        let cellMenuTable = createTable(cellNb+1,4)
        cellMenu.appendChild(cellMenuTable)
        cellMenuTable.rows[0].cells[1].textContent = "Data shown"
        cellMenuTable.rows[0].cells[2].textContent = "Chart type"
        cellMenuTable.rows[0].cells[3].textContent = "Edit"
        for(let i=0; i<cellNb; i++){
            cellMenuTable.rows[i+1].cells[0].textContent = "Cell "+(i+1)
    
            this.cellDataChoices[i] = document.createElement("input")
            this.cellDataChoices[i].setAttribute("cell_id",i)
            this.cellDataChoices[i].setAttribute("name","data_shown")
            this.cellDataChoices[i].value = this.findValueDataShown(i)
            this.cellDataChoices[i].addEventListener("change",(d)=>{this.readDataShownInput(d, i)})
            cellMenuTable.rows[i+1].cells[1].appendChild(this.cellDataChoices[i])
            cellMenuTable.rows[i+1].cells[1].style.textAlign = "center"
    
            this.cellTypeChoices[i] = menuCreate_select(null,"type",cvs.cells[i].cfg.type, typeOptions)
            this.cellTypeChoices[i].setAttribute("cell_id",i)
            this.cellTypeChoices[i].addEventListener("change",(d)=>{cvs.cells[i].cfg.update(d)})
            cellMenuTable.rows[i+1].cells[2].appendChild(this.cellTypeChoices[i])
            cellMenuTable.rows[i+1].cells[2].style.textAlign = "center"
            cellMenuTable.rows[i+1].cells[2].querySelector("select").value = cvs.cells[i].cfg.type
    
            let button = document.createElement("button")
            button.innerHTML  = "Edit"
            button.addEventListener("click",(d)=>{
                new MovableWindowCellConfig(cvs.cells[i],{"top":100,"left":100})
                cvs.cells[i].addHighlight()
            })
            cellMenuTable.rows[i+1].cells[3].appendChild(button)
            cellMenuTable.rows[i+1].cells[3].style.textAlign = "center"
        }
        //creates the data menu
        let dataMenu = document.createElement("div")
        dataMenu.id = "menu"
        dataMenu.setAttribute("name","dataMenu")
        dataMenu.style.overflowY = "auto"
        dataMenu.style.flex = "2"
        let dataMenuTable = createTable(dataNb+1,4)
        dataMenu.appendChild(dataMenuTable)
        dataMenuTable.rows[0].cells[1].textContent = "Source"
        dataMenuTable.rows[0].cells[2].textContent = "Color"
        dataMenuTable.rows[0].cells[3].textContent = "Edit"
        this.inputs.colors = {squares:[],inputs:[],inputsGradients:[],gradients:[]}
        for(let i=0; i<dataNb; i++){
            if(!cvs.data || !cvs.data[i]){continue;}
            dataMenuTable.rows[i+1].cells[0].textContent = "Data "+(i+1)
            this.dataSourceChoices[i] = menuCreateInput("selectFile","dataPath",cvs.data[i].dataName ||"")
            this.dataSourceChoices[i].style.margin = "1px"
            this.dataSourceChoices[i].title = "choose which file will be displayed in this data slot"
            this.dataSourceChoices[i].addEventListener("change",(d)=>{this.findData(d, i)})
            dataMenuTable.rows[i+1].cells[1].appendChild(this.dataSourceChoices[i])
            dataMenuTable.rows[i+1].cells[1].style.textAlign = "center"
            dataMenuTable.rows[i+1].cells[1].style.maxWidth = "100px"
    

            dataMenuTable.rows[i+1].cells[2].style.textAlign = "center"
            dataMenuTable.rows[i+1].cells[2].style.maxWidth = "100px"
            let wrapper = document.createElement("div")
            wrapper.style.display = "flex"
            wrapper.style.justifyContent = "center"
            let centerDiv = document.createElement("div")
            centerDiv.setAttribute("name","colorMenu_"+i)
            centerDiv.style.display = "grid"
            centerDiv.style.marginRight = "2px"
            dataMenuTable.rows[i+1].cells[2].appendChild(wrapper)
            wrapper.appendChild(centerDiv)

            let colorInput = menuCreateInput("color","topMenuColor_"+i,cvs.data[i].cfg.colorSolid)
            colorInput.setAttribute("title","select the solid color of this file")
            colorInput.style.gridArea = "1 / 1"
            colorInput.style.width = "30px"
            let colorSquare = document.createElement("div")
            colorSquare.style.backgroundColor = cvs.data[i].cfg.colorSolid;
            colorSquare.style.zIndex = "0";
            colorSquare.style.gridArea = "1 / 1"
            colorSquare.style.width = "31px"
            colorSquare.style.height = "20px"
            colorSquare.style.pointerEvents = "none";
            centerDiv.appendChild(colorInput)
            centerDiv.appendChild(colorSquare)
            
            this.inputs.colors.inputs[i] = colorInput
            colorInput.addEventListener("change",()=>{this.changeDatasetColor(i)})
            this.inputs.colors.squares[i] = colorSquare

            let centerDiv2 = document.createElement("div")
            centerDiv2.setAttribute("name","colorMenuGrad_"+i)
            centerDiv2.style.display = "grid"
            wrapper.appendChild(centerDiv2)
            var select_scaleColor = document.createElement("select");
            select_scaleColor.setAttribute("name","color_type")
            select_scaleColor.setAttribute("title",'select the gradient that could be used or select "solid color"')
            select_scaleColor.style.color = "black";
            select_scaleColor.style.margin = "1px"
            select_scaleColor.style.maxWidth = "68px"
            select_scaleColor.style.gridArea = "1 / 1"
            createColorOptions2(select_scaleColor)
            select_scaleColor.value = cvs.data[i].cfg.colorGradient
            centerDiv2.appendChild(select_scaleColor)
            let gradientSquare = this.buildGradientOverlay(i)
            centerDiv2.appendChild(gradientSquare)

            this.inputs.colors.inputsGradients[i] = select_scaleColor
            select_scaleColor.addEventListener("change",()=>{this.changeDatasetGradientColor(i)})
            this.inputs.colors.gradients[i] = gradientSquare

            let button = document.createElement("button")
            button.innerHTML  = "Edit"
            button.addEventListener("click",(d)=>{
                new MovableWindowDataConfig(cvs.data[i],{"top":100,"left":200})
            })
            dataMenuTable.rows[i+1].cells[3].appendChild(button)
            dataMenuTable.rows[i+1].cells[3].style.textAlign = "center"
        }
    
        top.insertBefore(genMenu, menuButtons)
        top.insertBefore(cellMenu, menuButtons)
        top.insertBefore(dataMenu, menuButtons)

        this.html = top
        cvs.htmlTopMenu = this

    }

    /** a function to find and return which datasets are active for a cell and write it as a string */
    findValueDataShown(index){
    let cell = this.canvas.cells[index]
    let activeData = cell.cfg.activeData
    let areAllActive = true;
    let listActive = "";
    for(let i=0; i<activeData.length; i++){
        if(activeData[i] != 1){areAllActive = false}
        else{
            listActive += (i+1)
            listActive +=","
        }
    }
    //cut the last comma
    listActive = listActive.slice(0,-1)
    if(areAllActive){return "all"}
    else{return listActive}
    }
    //build the gradient overlay
    buildGradientOverlay(index){
        //read
        let gradientName = this.canvas.data[index].cfg.colorGradient
        //build the gradient
        let container = document.createElement("div")
        container.style.gridArea = "1 / 1"
        container.style.pointerEvents = "none"
        container.style.display="flex"
        container.style.maxHeight = "20px"
        container.style.maxWidth = "70px"
        container.setAttribute("name","topGradient_"+index)
        //default case: 2 rectangles
        let sevenPoints = ["Turbo","Rainbow","Sinebow","Spectral","CubehelixDefault"]
        let interpolateName = "interpolate"+gradientName
        //test if it is one of the special cases:
        let isManyPoints = false
        for(let i=0; i<sevenPoints.length; i++){
            if(interpolateName.includes(sevenPoints[i])){isManyPoints = true; break;}
        }
        if(gradientName == "custom_pride"){
            for(let i=0; i<5; i++){
                let colorSquare = document.createElement("div")
                colorSquare.style.background = "linear-gradient(0.25turn,"+customColorPride.colors[i]+","+customColorPride.colors[i+1]+")"
                colorSquare.style.width = "14px"
                colorSquare.style.height = "20px"
                colorSquare.style.pointerEvents = "none";
                container.appendChild(colorSquare)
            }
        }else if(d3[interpolateName] && !isManyPoints){
            let colors = []
            for(let i=0; i<3; i++){colors[i] = d3[interpolateName](i/2)}
            for(let i=0; i<2; i++){
                let colorSquare = document.createElement("div")
                colorSquare.style.background = "linear-gradient(0.25turn,"+colors[i]+","+colors[i+1]+")"
                colorSquare.style.width = "35px"
                colorSquare.style.height = "20px"
                colorSquare.style.pointerEvents = "none";
                container.appendChild(colorSquare)
            }
        }else if(d3[interpolateName]){
            let colors = []
            for(let i=0; i<8; i++){colors[i] = d3[interpolateName](i/7)}
            for(let i=0; i<7; i++){
                let colorSquare = document.createElement("div")
                colorSquare.style.background = "linear-gradient(0.25turn,"+colors[i]+","+colors[i+1]+")"
                colorSquare.style.width = "10px"
                colorSquare.style.height = "20px"
                colorSquare.style.pointerEvents = "none";
                container.appendChild(colorSquare)
            }
        }else{
            let div= document.createElement("div")
            div.style.width = "70px"
            div.style.height = "20px"
            div.style.pointerEvents = "none";
            div.style.color ="white"
            div.style.backgroundColor = "#505050"
            div.style.border = "solid 1px #202020"
            div.innerHTML = "custom"
            container.appendChild(div)
        }

        return container
    }

    //called by dataset i to update its color based on the top menu input
    changeDatasetColor(index){
        //read
        let color = this.inputs.colors.inputs[index].value
        let dataset = this.canvas.data[index]
        //write
        dataset.cfg.colorSolid = color
        //update
        this.updateColors()
        dataset.prepareColorScale()
        this.canvas.resetFilters()
        this.canvas.drawDataset(index)
        this.canvas.redrawAllColourLegends()
    }

    //same as changeDatasetColor but called by the gradient selecter
    changeDatasetGradientColor(index){
        //read
        let color = this.inputs.colors.inputsGradients[index].value
        let dataset = this.canvas.data[index]
        //write
        dataset.cfg.colorGradient = color
        //update
        this.updateColors()
        dataset.prepareColorScale()
        this.canvas.resetFilters()
        this.canvas.drawDataset(index)
        this.canvas.redrawAllColourLegends()
    }


    //updates the colored squares and gradients on the main menu
    updateColors(){
        let squares = this.inputs.colors.squares
        let gradients = this.inputs.colors.gradients
        let datasets = this.canvas.data
        for(let i=0; i<squares.length; i++){
            squares[i].style.backgroundColor = datasets[i].cfg.colorSolid
        }
        for(let i=0; i<gradients.length; i++){
            let newGradient = this.buildGradientOverlay(i)
            let oldGrad = this.html.querySelector("div[name='topGradient_"+i+"']")
            let parent =  oldGrad.parentNode
            console.log(parent)
            oldGrad.remove()
            parent.appendChild(newGradient)
        }

    }

    readDataShownInput(d, index){
        let activeData = this.canvas.cells[index].cfg.activeData
        let value = d.target.value
        //check if value is "all"
        if(value=="all"){
            for (let i=0; i<activeData.length; i++){
                activeData[i] = 1
            }
            return;
        }else{
            for (let i=0; i<activeData.length; i++){
                activeData[i] = false
            }
        }
        value = value.split(",")
        value.forEach((d)=>{
            if(!isNaN(d) && activeData[d-1] != undefined){activeData[d-1]= 1}
         })
         this.canvas.cells[index].drawAllData()
    }

    
    findData(d, dataIndex){
        let data = this.canvas.data[dataIndex]
        let fileName = d.target.value
        data.fillFromName(fileName)
    }

    setDataChoice(dataIndex, value){
        this.dataSourceChoices[dataIndex].value = value
    }

}

/******************************************************************************* */
/*                                                                              */
/*                      GRAPH HELPERS                                           */
/*            -------------------------------------------                       */
/******************************************************************************* */


/** produce small pie charts */

function drawPieChart(data, namesData, placeToDraw, colors, textColor){
    let pieColorScale = d3.scaleOrdinal()
    .range(colors)
    //vars
    var radius = 200/2

    //data treatment
    var pie = d3.pie().value(function(d) {return d[1]})
    var data_t = pie(Object.entries(data))
    //build the svg parts
    console.log(placeToDraw)
    var svg = placeToDraw
        .append("svg")
        .attr("width",200)
        .attr("height",400)
        .append("g")
        .attr("transform", `translate(${100}, ${100})`);
    svg.selectAll()
        .data(data_t)
        .enter()
        .append('path')
        .attr('d',d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr('fill',function(d){return(pieColorScale(parseInt(d.data[0])))})

    var legend = svg.append('g').attr("id","popupPieLegend").attr("transform", `translate(${-100}, ${-100})`);
    //legend
    for(let i=0; i<data.length; i++){
        legend.append("rect")
            .attr("x",10)
            .attr("y",210+20*i)
            .attr("width",15)
            .attr("height",15)
            .style("fill", pieColorScale(i))

        legend.append("text")
            .attr("x",30)
            .attr("y",222+20*i)
            .style("font-size",config.legendFontSizeSmall)
            .style("font-family",config.legendFont)
            .style("fill",textColor)
            .text(namesData[i]);
    }
    //percent values
    if(config.tooltipPie.showPercents){
        // shape helper to build arcs:
        var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
        
        svg
        .selectAll()
        .data(data_t)
        .enter()
        .append('text')
        .text(function(d){ if(d.value==0 || (d.endAngle - d.startAngle)/(2*Math.PI)*100<0.1){return;}return ((d.endAngle - d.startAngle)/(2*Math.PI)*100).toFixed(1)+"%"})
        .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
        .style("text-anchor", "middle")
        .style("font-size", 12)
    }

    return svg
}

/**  a function to find the good dataset and produce a pie chart of it on a tooltip*/
function drawTooltipPieChart(cvsLetter, datapoint, tooltip){
    if(!config.tooltipPie.allow){return;}//skip if tooltip Pie is not allowed
    //this part is useful for old-type canvas: networks mainly
    let cfgX = findCfg(cvsLetter)
    let cvsX = findCvs(cvsLetter)

    let tooltipHMTL = datapoint.getAttribute("tooltipHTML")
    let metaData = tooltipHMTL.split(";")
    
    let type = metaData[0]
    let dataNum = metaData[1]
    let suppData = metaData[2]

    let dataString = ""
    if(cvsLetter == "N"){dataString = cfgX.fileString}
    else if(cvsLetter == "Attrib"){return;}
    else{dataString = cfgX.data[dataNum].dataString}
    let data  = linkFileFromDataString(dataString)
    let dataParam = linkFileParamFromDataString(dataString)

    let matrixMin = dataParam.matrixMin
    let matrixMax = dataParam.matrixMax
    let namesList =  []
    let dataArray = []
    if(dataString == "matrix"){
        matrixMin = dataParam[0]
        matrixMax = dataParam[1]
    }
    //builds the dataset
    for(let i=matrixMin; i<=matrixMax; i++){
        if(data && data[suppData] && data[suppData][i]){
            dataArray.push(data[suppData][i])
        }
        if(data && data[0] && data[0][i]){
            namesList.push(data[0][i])
        }
    }
    if(dataArray.length>0){
        drawPieChart(dataArray,namesList, tooltip, config.tooltipPie.colors, 'white')
    }
}



/**  a function to find the good dataset and produce a pie chart of it on a tooltip*/
function drawTooltipPieChart2(cvs, peakData, tooltip, suppData){
    if(!config.tooltipPie.allow){return;}//skip if tooltip Pie is not allowed

    let dataNum = suppData.dataID
    let dataString = ""
    dataString = cvs.data[dataNum].dataName
    let data = cvs.data[dataNum].data
    let dataParam = linkFileParamFromDataString(dataString)

    let matrixMin = dataParam.matrixMin
    let matrixMax = dataParam.matrixMax
    let namesList =  []
    let dataArray = []
    if(dataString == "matrix"){
        matrixMin = dataParam[0]
        matrixMax = dataParam[1]
    }
    //builds the dataset
    for(let i=matrixMin; i<=matrixMax; i++){
        if(peakData  && peakData[i]){
            dataArray.push(peakData[i])
        }
        if(data && data[0] && data[0][i]){
            namesList.push(data[0][i])
        }
    }
    if(dataArray.length>0){
        drawPieChart(dataArray,namesList, tooltip, config.tooltipPie.colors, 'white')
    }
}

function copy2DDataSubsetToClipboard(data, dataForHeaders){
    // adds the header line
    let dataLine = ""
    if(dataForHeaders){
        for(let i=0; i<dataForHeaders.length; i++){
            dataLine += dataForHeaders[i] + '\t'
        }
        dataLine += '\n'
    }
    for(let i=0; i<data.length; i++){
        for(let j=0; j<data[i].length; j++){
            dataLine += data[i][j] + '\t'
        }
        dataLine += '\n'
     }
    navigator.clipboard.writeText(dataLine)
}

function copyMassDifferencesDataToClipboard(data, isThereFormula){
    if(!data.differences){return;}
    let differences = data.differences
    let dataLine = "Δm/z \t origin_id \t target_id \n"
    if(!isThereFormula){
        for(let i=0; i<differences.length; i++){
            dataLine+= differences[i].mass + "\t"+differences[i].origin + "\t" + differences[i].target + "\n"
        }
    }else{
        dataLine = "formula \t Δm/z \t origin_id \t target_id \n"
        for(let i=0; i<differences.length; i++){
            dataLine+= differences[i].formula.name + "\t"+ differences[i].mass + "\t"+differences[i].origin + "\t" + differences[i].target + "\n"
        }
    }

    navigator.clipboard.writeText(dataLine)
}

/******************************************************** */
/***********SCREENSHOT CODE****************************** */


class Popup_canvasScreenshot extends Popup{
    constructor(canvas) {
        super("canvasScreenshot","Choose the graph to take a pic of")
        this.canvas = canvas
        var buttons = [
            {"name":"Export image (png)", "function":()=>{this.exportPNG()}},
            {"name":"Export vectorial image (svg)", "function":()=>{this.exportSVG()}}
        ]
        var selecter = [{"name":"selecter", "options":[]}]
        selecter[0].options = [{"value":-1, "text":" All Canvas"}]
        for(let i=0; i<canvas.cells.length; i++){
            let newOption = {value:i, text:" Cell n°"+(i+1)}
            selecter[0].options.push(newOption)
        }
        this.buildInputs(selecter, [], buttons)
        this.valButton.remove()
    }

    exportSVG(){
        let cellNum = this.popup_box.querySelector('select[name="popup_selecter_0"]').value
        let html_canvas = document.querySelector("#canvasgroup"+this.canvas.letter)
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
        let cellNum = this.popup_box.querySelector('select[name="popup_selecter_0"]').value
        let thisCanvas = this.canvas.html
        /**gets the information of the screenshot zone */
        let downloadTarget = ""
        if(cellNum != -1){
            downloadTarget = "cell n°"+cellNum
            //hide undesired elements
            for(let i=0; i<this.canvas.cells.length; i++){
                if(i == cellNum){continue;}
                d3.select('#canvas'+this.canvas.letter+' #cell'+i).attr("display","none")
            }
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
        if(cellNum != -1){
            for(let i=0; i<this.canvas.cells.length; i++){
                d3.select('#canvas'+this.canvas.letter+' #cell'+i).attr("display",null)
            }
            thisCanvas.style.height= null
            thisCanvas.style.width= null
        }
        this.popup_close.click()
    }

}

/****************************************** */
/*************PREMADE LOADOUT CODE ******** */

/**premade config loading setup */
tab_canvasA.querySelector('button[name="configuration"]').addEventListener("click", function (){ new Popup_canvasLoadout(canvasA)});
tab_canvasB.querySelector('button[name="configuration"]').addEventListener("click", function (){ new Popup_canvasLoadout(canvasB)});


class Popup_canvasLoadout extends Popup{
    constructor(canvas) {
        super("configInteractivity","Choose here a canvas loadout to charge<br><br>")
        this.canvas = canvas
        this.buildSuppContext()
    }
    buildSuppContext(){
        let div = document.createElement("div")
        let options = [
            {value:"cfg1",name:"Van Krevelen & Histograms"},
            {value:"cfg2",name:"Kendrick maps"},
            {value:"cfg3",name:"Venn Sets Comparison"},
            {value:"cfg4",name:"Matrix PCA visualization"},
        ]
        let selecter = menuCreate_select(null, "select_loadout","cfg1",options)
        selecter.setAttribute("class","popupclose")
        selecter.style.maxWidth = "80%"

        div.appendChild(selecter)
        this.preText.appendChild(div)

        this.valButton.addEventListener("click",()=>{
            let value = selecter.value
            let cfg = JSON.parse(JSON.stringify(defaultCvs[value]))
            if(cfg){
                if(cfg =="cfg3"&& (!vennData || !vennData.AuB)){return;}
                copyFromCfgCvs(this.canvas, cfg)
            }
        })
    }
}



/******************************************************************************* */
/*                                                                              */
/*                      PAGE FUNCTIONS                                          */
/*            -------------------------------------------                       */
/******************************************************************************* */

/** copy from the old canvas types prior to 1.14 */
function copyFromOldCvs(cvs, cfgX){
    if(debug){console.log("copying from <1.14 canvas...",cfgX)}
    cvs.cells.forEach((item,index)=>{
        item.cfg.type = cfgX.canvas[index].type
        cvs.changeCellType(index, cfgX.canvas[index].type, cfgX.canvas[index])
    })
    cvs.data.forEach((item,index) =>{
        item.cfg.copyCfg(cfgX.data[index])
    })
    for(let i=0; i<cvs.cfg.dataNb; i++){
        let fileName = cfgX.data[i].dataString
        if(!fileName){continue;}
        let data = cvs.data[i]
        data.fillFromName(fileName)
        if(data.data && data.data.length>0){
            cvs.data[i].prepareColorScale()
        }
    }
    cvs.htmlTopMenu.draw()
}

function copyFromCfgCvs(cvs, cfg){
    if(debug){console.log("copying from canvas...",cfg)}
    cvs.cfg = cfg.cfg
    //empties the cells and data & refills it
    cvs.cells = []
    cvs.data = []
    for(let i=0; i<cvs.cfg.cellNb; i++){
        cvs.cells.push(cvs.chooseCellType(i, cfg.cells[i].type))
        //resets back references and finds good columns for loading presets and finding name of column
        if(!cfg.cells[i]){continue;}
        if(cfg.cells[i].xtype && Array.isArray(cfg.cells[i].xtype)){
            cfg.cells[i].xtype = lookForColumn(columnNames, cfg.cells[i].xtype)
        }
        if(cfg.cells[i].ytype && Array.isArray(cfg.cells[i].ytype)){
            cfg.cells[i].ytype = lookForColumn(columnNames, cfg.cells[i].ytype)
        }
        cvs.cells[i].cfg.copyCfg(cfg.cells[i])
        
        if(cfg.cells[i].config){cvs.cells[i].cfg.config = cfg.cells[i].config}

    }
    for(let i=0; i<cvs.cfg.dataNb; i++){
        cvs.data.push(new DataSet(cvs, i))
        //resets back references
        if(cfg.data[i]){
            if(cfg.data[i].colorType && Array.isArray(cfg.data[i].colorType)){
                cfg.data[i].colorType = lookForColumn(columnNames, cfg.data[i].colorType)
            }
            cvs.data[i].cfg.copyCfg(cfg.data[i])
        }
        if(cfg.dataNames[i]){
            cvs.data[i].fillFromName(cfg.dataNames[i])
        }
    }
    cvs.draw()
    if(cvs.htmlTopMenu){cvs.htmlTopMenu.draw()}
}


/** helper function to get the name of a file from its string id. Handles matrix, classes, venn files */
function getFileNameFromString(stringName){
    let fileName ="file"
    if(stringName == "matrix"){fileName = "Matrix"}
    else if(stringName.includes("file_")){
        let file = files.list[stringName.slice(5)]
        if(file){fileName = file.name}
    }
    else{fileName = getVennSectorName(stringName)}//venn Case
    return fileName
}

/**a function for which you input the name of the venn sector "A", "AuB" and outputs 
 * you a string of the name of this sector. If it doesn't find it, outputs original text*/
function getVennSectorName(vennText){
    var out =""
    if(vennText=="A"){  
        out = "unique to "+files.list[cfgVenn.files[0]].name
    }else if(vennText =="B"){
        out = "unique to "+files.list[cfgVenn.files[1]].name
    }else if(vennText =="C"){
        out = "unique to "+files.list[cfgVenn.files[2]].name
    }else if(vennText =="D"){
        out = "unique to "+files.list[cfgVenn.files[3]].name
    }else if(vennText =="AuB"){
        out = "common to "+files.list[cfgVenn.files[0]].name+" and "+files.list[cfgVenn.files[1]].name
    }else if(vennText =="AuC"){
        out = "common to "+files.list[cfgVenn.files[0]].name+" and "+files.list[cfgVenn.files[2]].name
    }else if(vennText =="BuC"){
        out = "common to "+files.list[cfgVenn.files[1]].name+" and "+files.list[cfgVenn.files[2]].name
    }else if(vennText =="AuD"){
        out = "common to "+files.list[cfgVenn.files[0]].name+" and "+files.list[cfgVenn.files[3]].name
    }else if(vennText =="BuD"){
        out = "common to "+files.list[cfgVenn.files[1]].name+" and "+files.list[cfgVenn.files[3]].name
    }else if(vennText =="CuD"){
        out = "common to "+files.list[cfgVenn.files[2]].name+" and "+files.list[cfgVenn.files[3]].name
    }else if(vennText =="AuBuC"){
        out = "common to "+files.list[cfgVenn.files[0]].name+" and "+files.list[cfgVenn.files[1]].name+" and "+files.list[cfgVenn.files[2]].name
    }else if(vennText =="AuBuD"){
        out = "common to "+files.list[cfgVenn.files[0]].name+" and "+files.list[cfgVenn.files[1]].name+" and "+files.list[cfgVenn.files[3]].name
    }else if(vennText =="AuCuD"){
        out = "common to "+files.list[cfgVenn.files[0]].name+" and "+files.list[cfgVenn.files[2]].name+" and "+files.list[cfgVenn.files[3]].name
    }else if(vennText =="BuCuD"){
        out = "common to "+files.list[cfgVenn.files[1]].name+" and "+files.list[cfgVenn.files[2]].name+" and "+files.list[cfgVenn.files[3]].name
    }else if(vennText =="AuBuCuD"){
        out = "common to all"
    }else{ out = vennText}
    return out
}


/********************************************************************************* */
/**************************CANVAS INITIALIZATION ********************************* */



var canvasA = new Canvas(document.getElementById("canvasA"),"A", JSON.parse(JSON.stringify(defaultCvs.mainCfg)))
canvasA.tooltip = new TooltipCanvas(document.getElementById("tooltip_canvasA"),canvasA)
//set function to html and to buttons
var html_tabCanvasA = document.getElementById("tab_canvasA")
html_tabCanvasA.querySelector("button[name='autoscale']").addEventListener("click",(d)=>{
    canvasA.autoscale()
})
html_tabCanvasA.querySelector("button[name='searchButton']").addEventListener("click",(d)=>{
    new Popup_searchPeaks(canvasA)
})
html_tabCanvasA.querySelector('button[name="screenshot"]').addEventListener("click", function (){
    new Popup_canvasScreenshot(canvasA)
});
/** creates the top table */
new TopMenuCanvas(canvasA, document.getElementById("tab_canvasA"))

////////////////////
var canvasB = new Canvas(document.getElementById("canvasB"),"B", JSON.parse(JSON.stringify(defaultCvs.mainCfg)))
canvasB.tooltip = new TooltipCanvas(document.getElementById("tooltip_canvasB"),canvasB)
//set function to html and to buttons
var html_tabCanvasB = document.getElementById("tab_canvasB")
html_tabCanvasB.querySelector("button[name='autoscale']").addEventListener("click",(d)=>{
    canvasB.autoscale()
})
html_tabCanvasB.querySelector("button[name='searchButton']").addEventListener("click",(d)=>{
    new Popup_searchPeaks(canvasB)
})
html_tabCanvasB.querySelector('button[name="screenshot"]').addEventListener("click", function (){
    new Popup_canvasScreenshot(canvasB)
});
/** creates the top table */
new TopMenuCanvas(canvasB, document.getElementById("tab_canvasB"))

