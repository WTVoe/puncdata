/************************************************ */
/****ALL THE CODE FOR CELLS TYPE OF STATS******* */


class CanvasCell_errorMass extends CanvasCell{
  constructor(parent, index, cfg){
      super(parent, index, cfg)
      this.cfg.prepareCfg("errorMass")
      this.cfg.xmax = 1000
      this.cfg.ymin = -1
      this.draw()
  }
  /**draw the plot */
  draw(){
      super.draw()
      let axisOptions = {}
      if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
        let axisLabel_x = columnNames[config.mz]
        let axisLabel_y = columnNames[config.ppmerror]
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
      this.createBrush("errorMass")
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
      d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_line").remove()
      d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_bounds").remove()
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
      .attr("cx", (d) => {return this.scales[0](d[config.mz]); } ) 
      .attr("cy",  (d) =>{ return this.scales[1](d[config.ppmerror]); } ) 
      .attr("r",  (d) => {
           if(this.cfg.relativeSize){
              return this.cfg.dotSize*Math.sqrt(d[config.intensity])/config.sizeReductor||0;
          }else{
              return this.cfg.dotSize||0
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

      this.drawCalibrants(dataset, index)
      this.drawLineAverage(dataset, index)
      this.drawCentiles(dataset, index)
      this.drawResidualBounds(dataset, index)

  }

  drawCalibrants(dataset, index){
    d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"dataCalib"+index).remove()
    if(!this.cfg.showCalibrants){return;}
    //find the data
    let dataName = dataset.dataName
    //does not draw anything if there is no file 
    if(!dataName.includes("file") || !dataName){return;}
    const fileNum = dataName.slice(5)
    const file = files.calib[fileNum]
    if(!file || !file.metadata.calibration){return;}
    const data = file.metadata.calibration
    if(!data){return;}
    if(!this.drawnDataCalibrants){this.drawnDataCalibrants = []}
    this.drawnDataCalibrants[index] = this.svgSpace.append('g').attr("id","cell"+this.index+"dataCalib"+index)
      .selectAll("circle")
      .data(data.points)
      .enter()
      .append("circle")
      .attr("cx", (d) => {return this.scales[0](d[0]); } ) 
      .attr("cy",  (d) =>{ return this.scales[1](d[1]); } ) 
      .attr("r",  (d) => {return this.cfg.calibrantsSize||0})
      .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
      .style("fill", (d) => {return this.cfg.calibrantsColor})
      .style("opacity",this.canvas.cfg.opacity)
      .attr('tooltipHTML', (d,n) => {return ""})
      .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
      .on("mousemove", (d,n) => {
        const displayedText = "Calibrant <br>"+"mass:"+n[0]+"<br>error:"+n[1]+"<br>formula:"+n[2]
        this.canvas.tooltip.mousemove(d,"returnThis",displayedText, this)
    }  )
      .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
      .on("click", (d,n) =>{
        const displayedText = "Calibrant <br>"+"mass:"+n[0]+"<br>error:"+n[1]+"<br>formula:"+n[2]
        this.canvas.tooltip.mouseclick(d,"returnThis",displayedText, this)
    } );
  }


  drawLineAverage(dataset, index){
      //removes old data
      d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_line").remove()
      //builds the data
      let data = dataset.data
      let stepSize = this.cfg.mobileMean
      let averagedata = []; 
      //duplicates data and sorts i
      let newData = duplicateData(data)
      newData.sort((a,b)=>{return a[config.mz]-b[config.mz]})
      if (stepSize == 0 || stepSize < 0|| stepSize == null){return;}//avoids some infinite loops
      for(let i=0; i< newData.length; i++){ //the for that contains every dot in the data
        let counter = i //Count the real number attained
        var totalmz = 0;
        var totalerror = 0;
        var howmanynumber = 0; //counts in the interval how many values were numbers
        for(let j=0; j<stepSize; j++){ // the loop that contains every point for one average
          counter = i + j //update counter
          if(!(newData[counter] == null)){ //checks if this number exists
            if(!isNaN(newData[counter][config.mz])){ //checks if it contains a number
              totalmz = totalmz + parseFloat(newData[counter][config.mz]);
              totalerror = totalerror + parseFloat(newData[counter][config.ppmerror]);
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

      this.lineAverage = this.svgSpace.append("path").attr("id","cell"+this.index+"data"+index+"_line")
          .datum(averagedata)
          .attr('stroke',this.cfg.mobileColor)
          .attr('stroke-width',3)
          .attr("fill","none")
          .attr("clip-path",  "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
          .attr("d", d3.line()
          .x((d)=>{ return this.scales[0](d.averagemz); })
          .y((d)=>{ return this.scales[1](d.averageerror); })
          )
  }
  drawCentiles(dataset, index){
      //removes old data
      d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_bounds").remove()
      if(!this.cfg.showBounds){return;}
      //computes the centiles
      let data = dataset.data
      let sortDataPPM = data.slice(); //copy the data without referencing "data" thereafter
      sortDataPPM.shift(); //remove the first line of the data
      sortDataPPM.sort((a,b)=>{
          if (a[config.ppmerror] === b[config.ppmerror]) {return 0;}
          else { return (parseFloat(a[config.ppmerror]) < parseFloat(b[config.ppmerror])) ? -1 : 1;}
      })
      let length = sortDataPPM.length
      let outsidePercent = 100 - parseFloat(this.cfg.boundsTol) 
      let percentile = 100/parseFloat(outsidePercent/2) //divided by 2 because on both sides
      let firstIndex = parseInt(length/percentile)
      let lastIndex = parseInt((percentile-1)*length/percentile)
      let firstBound = 0
      if(sortDataPPM[firstIndex]){firstBound = sortDataPPM[firstIndex][config.ppmerror]}
      let lastBound = 0
      if(sortDataPPM[lastIndex]){lastBound = sortDataPPM[lastIndex][config.ppmerror]}
      let firstBoundPoints = [[this.cfg.xmin, firstBound],[this.cfg.xmax, firstBound]]
      let lastBoundPoints = [[this.cfg.xmin, lastBound],[this.cfg.xmax, lastBound]]

      this.bounds = []
      this.bounds[0] = this.svgSpace.append("path").attr("id","cell"+this.index+"data"+index+"_bounds")
      .datum(firstBoundPoints)
      .attr('stroke',this.cfg.boundsColor)
      .attr('stroke-width',2)
      .style("stroke-dasharray", ("3, 3"))
      .attr("fill","none")
      .attr("clip-path",  "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
      .attr("d", d3.line()
          .x((d)=>{ return this.scales[0](d[0]); })
          .y((d)=>{ return this.scales[1](d[1]); })
      )
      .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
      .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"returnThis",firstBound, this)}  )
      .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
      .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"returnThis",firstBound, this)} );

      /** deciles lines for the first cell */  
      this.bounds[1] = this.svgSpace.append("path").attr("id","cell"+this.index+"data"+index+"_bounds")
      .datum(lastBoundPoints)
      .attr('stroke',this.cfg.boundsColor)
      .attr('stroke-width',2)
      .style("stroke-dasharray", ("3, 3"))
      .attr("fill","none")
      .attr("clip-path",  "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
      .attr("d", d3.line()
          .x((d)=>{ return this.scales[0](d[0]); })
          .y((d)=>{ return this.scales[1](d[1]); })
      )
      .attr('tooltipHTML', (d,n) => {return "scatterPlot"+";"+index+";"+n})
      .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
      .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"returnThis",lastBound, this)}  )
      .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
      .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"returnThis",lastBound, this)} );
  }

  drawResidualBounds(dataset, index){
        //removes old data
        d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_calib_bounds").remove()
        if(!this.cfg.showCalibBounds){return;}
        //find the data
        let dataName = dataset.dataName
        //does not draw anything if there is no file 
        if(!dataName.includes("file") || !dataName){return;}
        const fileNum = dataName.slice(5)
        const file = files.list[fileNum]
        if(!file || !file.metadata.calibration){return;}
        const data = file.metadata.calibration
        if(!data){return;}
        let firstBound = parseFloat(data.residualError)*parseFloat(this.cfg.calibBoundsMultiplier)
        let lastBound = -firstBound
        let firstBoundPoints = [[this.cfg.xmin, firstBound],[this.cfg.xmax, firstBound]]
        let lastBoundPoints = [[this.cfg.xmin, lastBound],[this.cfg.xmax, lastBound]]
        console.log(firstBound, dataset, index, data)
        this.Calbounds = []
        this.Calbounds[0] = this.svgSpace.append("path").attr("id","cell"+this.index+"data"+index+"_calib_bounds")
        .datum(firstBoundPoints)
        .attr('stroke',this.cfg.calibBoundsColor)
        .attr('stroke-width',2)
        .style("stroke-dasharray", ("3, 3"))
        .attr("fill","none")
        .attr("clip-path",  "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .attr("d", d3.line()
            .x((d)=>{ return this.scales[0](d[0]); })
            .y((d)=>{ return this.scales[1](d[1]); })
        )
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"returnThis","residual error :"+data.residualError, this)}  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"returnThis","residual error :"+data.residualError, this)} );

        /** deciles lines for the first cell */  
        this.bounds[1] = this.svgSpace.append("path").attr("id","cell"+this.index+"data"+index+"_bounds")
        .datum(lastBoundPoints)
        .attr('stroke',this.cfg.calibBoundsColor)
        .attr('stroke-width',2)
        .style("stroke-dasharray", ("3, 3"))
        .attr("fill","none")
        .attr("clip-path",  "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
        .attr("d", d3.line()
            .x((d)=>{ return this.scales[0](d[0]); })
            .y((d)=>{ return this.scales[1](d[1]); })
        )
        .attr('tooltipHTML', (d,n) => {return "scatterPlot"+";"+index+";"+n})
        .on("mouseover", (d) => {this.canvas.tooltip.mouseover(d)} )
        .on("mousemove", (d,n) => {this.canvas.tooltip.mousemove(d,"returnThis","residual error :"+data.residualError, this)}  )
        .on("mouseleave" , (d) => {this.canvas.tooltip.mouseleave(d)}  )
        .on("click", (d,n) =>{this.canvas.tooltip.mouseclick(d,"returnThis","residual error :"+data.residualError, this)} );
    }


  update(content, doNotUpdateDomains){
      super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[config.mz]
        let axisLabel_y = columnNames[config.ppmerror]
        if(this.cfg.overrideAxis_x && this.cfg.overrideAxis_x != ""){axisLabel_x = this.cfg.overrideAxis_x}
        if(this.cfg.overrideAxis_y && this.cfg.overrideAxis_y != ""){axisLabel_y = this.cfg.overrideAxis_y}
      this.axesLabels[0].text(axisLabel_x)
      this.axesLabels[1].text(axisLabel_y)
      if(!this.cfg.config.noGrid){
          this.grids[0].call(d3.axisBottom(this.scales[0]).ticks(this.cfg.config.axisLines).tickSize(this.cfg.config.height).tickFormat(""))
          this.grids[1].call(d3.axisLeft(this.scales[1]).ticks(this.cfg.config.axisLines).tickSize(-this.cfg.config.width).tickFormat(""))
      }
  }

  updateData(content, dataNum){
      super.updateData(content, dataNum)
      let thisData = this.drawnData[dataNum]
      if(!thisData){return;}
      if(content.includes("xmin_") || content.includes("xmax_")|| content.includes("all")){
          thisData.attr("cx", (d) => { return this.scales[0](d[config.mz]); } ) 
      }if(content.includes("ymax_")|| content.includes("ymin_")|| content.includes("all")){
          thisData.attr("cy", (d) => { return this.scales[1](d[config.ppmerror]); } ) 
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
      if(!this.cfg.activeData[dataNum]){return;}
      this.drawLineAverage(this.canvas.data[dataNum], dataNum)
      this.drawCentiles(this.canvas.data[dataNum], dataNum)
      this.drawCalibrants(this.canvas.data[dataNum], dataNum)
      this.drawResidualBounds(this.canvas.data[dataNum], dataNum)

  }
  prepareCfg(){
      let properties = [
          {key:"dotSize",type:"number",default:1},
          {key:"relativeSize",type:"checkbox",default:false},
          {key:"mobileMean",type:"number",default:50},
          {key:"mobileColor",type:"text",default:"#ff0000"},
          {key:"showBounds",type:"checkbox",default:true},
          {key:"boundsTol",type:"number",default:99},
          {key:"boundsColor",type:"text",default:"#be630f"},
          {key:"showCalibrants",type:"checkbox",default:false},
          {key:"calibrantsColor",type:"text",default:"#000000"},
          {key:"calibrantsSize",type:"number",default:5},
          {key:"showCalibBounds",type:"checkbox",default:false},
          {key:"calibBoundsColor",type:"text",default:"#5e5a59"},
          {key:"calibBoundsMultiplier",type:"number",default:3}
      ]
      return properties
  }

  preparePopupCfg(){
      let varsArray = []
      varsArray.push({"name":"m/z range",
          "inputs":[
              {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
              {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      varsArray.push({"name":"error range",
          "inputs":[
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
      varsArray.push({"name":"Mobile mean smoothing",
          "inputs":[
              {key:"mobileMean",type:"number",value:this.cfg.mobileMean,title: "The number of points over which the mobile mean is computed",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      varsArray.push({"name":"Mobile mean color",
          "inputs":[
              {key:"mobileColor",type:"color",value:this.cfg.mobileColor,title: "The color of the mobile mean line",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      varsArray.push({"name":"Show percentile bounds",
          "inputs":[
              {key:"showBounds",type:"checkbox",value:this.cfg.showBounds,title: "Show full data percentile bounds on the chart",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      varsArray.push({"name":"% inside",
          "inputs":[
              {key:"boundsTol",type:"number",value:this.cfg.boundsTol,title: "The %  of peaks kept inside of the bounds. The remaining % is the sum of both sides",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      varsArray.push({"name":"Bounds color",
          "inputs":[
              {key:"boundsColor",type:"color",value:this.cfg.boundsColor,title: "The color of the bounds lines",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      varsArray.push({"name":"Show calibrants",
        "inputs":[
            {key:"showCalibrants",type:"checkbox",value:this.cfg.showCalibrants,title: "Should the calibrants used for prior calibration be displayed on the chart",update:(d)=>{this.cfg.update(d)}},
        ]
    })
    varsArray.push({"name":"Calibrants color",
        "inputs":[
            {key:"calibrantsColor",type:"color",value:this.cfg.boundsColor,title: "The color of the calibrant dots",update:(d)=>{this.cfg.update(d)}},
        ]
    })
    varsArray.push({"name":"Calibrants dot size",
        "inputs":[
            {key:"calibrantsSize",type:"number",value:this.cfg.calibrantsSize,title: "The size of calibrant dots",update:(d)=>{this.cfg.update(d)}},
        ]
    })
    varsArray.push({"name":"Show calibrants residual error",
        "inputs":[
            {key:"showCalibBounds",type:"checkbox",value:this.cfg.showCalibBounds,title: "Show lines representing a multiple of the residual error computed during calibration",update:(d)=>{this.cfg.update(d)}},
        ]
    })
    varsArray.push({"name":"Calibrants residual error color",
        "inputs":[
            {key:"calibBoundsColor",type:"color",value:this.cfg.calibBoundsColor,title: "The color of the residual error lines",update:(d)=>{this.cfg.update(d)}},
        ]
    })
    varsArray.push({"name":"Residual error lines coefficient ",
        "inputs":[
            {key:"calibBoundsMultiplier",type:"number",value:this.cfg.calibBoundsMultiplier,title: "The coefficient by which the residual error is multiplied to obtain the bounds",update:(d)=>{this.cfg.update(d)}},
        ]
    })
      return varsArray
  }

}



class CanvasCell_histoerror extends CanvasCell_histo{
  constructor(parent, index, cfg){
      super(parent, index, cfg)
      this.cfg.prepareCfg("histoerror")
      this.cfg.xtype = config.ppmerror
      this.cfg.xmin = -1
      this.cfg.ymax = 100
      this.draw()
  }
  /**draw the plot */
  draw(){
      super.draw()
      let axisOptions = {}
      if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
      let axisLabel_x = columnNames[config.ppmerror]
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
      this.createBrushFilter("histoerror")
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
          theseBins = dataset.calculateBins([this.cfg.xmin, this.cfg.xmax], this.cfg.barDensity, config.ppmerror, "filteredCell"+this.index, true, dataset.dataFiltered)
          this.drawFiltersTitles(dataset)
      }else if(specialInfo== "highlight" && dataset.dataHighlighted && dataset.dataHighlighted.length >0){
          //drawing bins for highlighting
          theseBins = dataset.calculateBins([this.cfg.xmin, this.cfg.xmax], this.cfg.barDensity, config.ppmerror, "highlightedCell"+this.index, true, dataset.dataHighlighted)
          color = this.canvas.cfg.interactivity.histoColor
      }
      else{
          //drawing the classical way
          theseBins = dataset.calculateBins([this.cfg.xmin, this.cfg.xmax], this.cfg.barDensity, config.ppmerror, "cell"+this.index)
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
          this.drawnData[index] += this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index)
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

  update(content, doNotUpdateDomains){
      super.update(content, doNotUpdateDomains)
        let axisLabel_x = columnNames[config.ppmerror]
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
      this.axesLabels[0].text(axisLabel_x)
      this.axesLabels[1].text(axisLabel_y);
  }

  updateData(content, dataNum){
      super.updateData(content, dataNum)
      this.cfg.xtype = config.ppmerror
      this.drawData(this.canvas.data[dataNum],dataNum)
  }

  /** if the filter comes from this histogram, it should not be counted */
  handleFiltering(indexesList){
      if(!this.canvas.cfg.interactivity.filterWorkonHistograms){return;}
      if(this.canvas.filters.length == 1){
            if(this.canvas.filters[0] &&this.canvas.filters[0].cellIndex == this.index){return;}
        }
      for(let i=0; i<this.canvas.data.length; i++){
          let dataset = this.canvas.data[i]
          if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
          this.drawData(this.canvas.data[i], i, "filter")
      }
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
      x = autoAxis(this.scales[0], data, config.ppmerror)
      this.cfg.xmin = x[0]
      this.cfg.xmax = x[1]

      let genMax = 0
      binSets.forEach((set, index)=>{
          console.log(set, index)
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
          {key:"ymethod",type:"number",default:"attributions"},
          {key:"barDensity",type:"number",default:20},
          {key:"barWidth",type:"number",default:100},
          {key:"centerBars",type:"checkbox",default:false},
          {key:"showPercents",type:"checkbox",default:false},
      ]
      return properties
  }

  preparePopupCfg(){
      let varsArray = []
      let optionsY = [{"name":"% of attributions","value":"attributions"},{"name":"% of intensity","value":"intensity"},{"name":"nb of attribution","value":"count"}]
      varsArray.push({"name":"error range",
          "inputs":[
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
      return varsArray
  }
}

class CanvasCell_henry extends CanvasCell{
  constructor(parent, index, cfg){
      super(parent, index, cfg)
      this.cfg.prepareCfg("henry")
      this.cfg.xmin = -1
      this.cfg.ymin = -3
      this.cfg.ymax = 3
      this.draw()
  }

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
      this.drawnData = [] // will be an array of datasets drawn
      //creating axes
      this.axes=[];
      this.axes[0]= appendAxis_x(this.svgSpace, this.scales[0], this.height/2, this.cfg.xmax, this.cfg.config)
      this.axes[1] = this.svgSpace.append("g")
          .attr("transform", "translate("+this.cfg.config.width/2 + ",0)")
          .style("font-family",this.cfg.config.legendFont)
          .style("font-size",this.cfg.config.legendFontSizeSmall)
          .style("letter-spacing","-0.1em")
          .call(d3.axisLeft(this.scales[1]));
          /** labels for the cells */
      if(this.cfg.config.boxBorders){
          this.boxBorders = appendBoxScales(this.svgSpace, this.scales[0], this.scales[1])
      }
      //creates the title
      if(this.cfg.config.showTitle){
          this.svgSpace.selectAll("#sampleTitle").remove()
          this.writeTitles()
      }
      //creates the labels
      let axisOptions = {}
      if(this.cfg.config.endAxis){axisOptions.mode = "endAxis"}
      let axisLabel_x = columnNames[config.ppmerror]
      let axisLabel_y = "t"
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
      this.drawAllData()
      this.drawColourLegends(false)
  }

  drawData(dataset, index, specialInfo){
      if(specialInfo == "highlight"){
          d3.selectAll("#canvas"+this.canvas.letter+" #cell"+this.index+"data"+index+"_highlight").remove()
      }else{
          super.drawData(dataset, index)
      }
      if( this.cfg.activeData[index] != "1"){return;}
      let data = dataset.data
      let suppID =""
      let color = dataset.cfg.colorSolid
      if(specialInfo == "filter" && dataset.dataFiltered && dataset.dataFiltered.length >0){
          data = dataset.dataFiltered
      }else if(specialInfo == "highlight" && dataset.dataHighlighted && dataset.dataHighlighted.length >0){
          data = dataset.dataHighlighted
          suppID = "_highlight"
          color = this.canvas.cfg.interactivity.histoColor
      }

      let lineData = this.computeData(data)
      let regData = this.computeReg(data, lineData, index)

      if(!this.drawnData){this.drawnData =[]}
      this.drawnData[index] = this.svgSpace.append("g").attr("id","cell"+this.index+"data"+index+suppID)
      .selectAll("circle")
      .data(lineData)
      .enter()
      .append("circle")
      .attr("fill",color)
      .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
      .attr("cx",  (d, i) => {return this.scales[0](d.x)}  )
      .attr("cy",  (d, i) => { return this.scales[1](d.y)} ) 
      .attr("r",  (d)=> {return 2})

      this.drawLineReg(regData, index, suppID)
      if(this.cfg.linearEquation){this.drawTextReg(regData, index, suppID)}
  }

  drawLineReg(regData, index, suppID){
      let color = this.cfg.linearColor
      if(suppID && suppID !=""){color = this.canvas.cfg.interactivity.histoColor}

      if(!this.regLine){this.regLine =[]}
      this.regLine[index] = this.svgSpace.append("path").attr("id","cell"+this.index+"data"+index+suppID)
      .datum(regData)
      .attr('stroke',color)
      .attr('stroke-width',1)
      .attr("fill","none")
      .attr("clip-path", "url(#clipCvs"+this.canvas.letter+"Cell"+this.index+")")
      .attr("d", d3.line()
          .x((d)=>{ return this.scales[0](d.x); })
          .y((d)=>{ return this.scales[1](d.y); })
      )
  }

  drawTextReg(regData, index, suppID){
      let lineData = this.regLineData[index]
      let text = ""
      if(parseFloat(lineData.intercept)<0){
          text = "y="+Math.round(100*lineData.slope)/100+"x "+Math.round(100*lineData.intercept)/100+"</br> R²="+Math.round(10000*lineData.r2)/10000
      }else if(parseFloat(lineData.intercept)>0){
          text = "y="+Math.round(100*lineData.slope)/100+"x +"+Math.round(100*lineData.intercept)/100+"</br> R²="+Math.round(10000*lineData.r2)/10000  
      }else{
          text = "y="+Math.round(100*lineData.slope)/100+"x </br> R²="+Math.round(10000*lineData.r2)/10000    
      }
      let offset = 0
      let color = this.cfg.linearColor
      if(suppID && suppID !=""){offset = 100; color = this.canvas.cfg.interactivity.histoColor}

      let margin = this.cfg.config.margin
      if(!this.tableContainer){this.tableContainer =[]}
      this.tableContainer[index] = this.svgSpace.append("foreignObject").attr("id","cell"+this.index+"data"+index+suppID)
      .attr("x",0)
      .attr("y",offset)
      .attr("width", this.cfg.config.width + margin.left + margin.right)
      .attr("height", this.cfg.config.height + margin.top + margin.bottom)

      if(!this.regLineText){this.regLineText =[]}
      this.regLineText[index] = this.tableContainer[index].append("xhtml:div")
      .attr("height", this.cfg.config.height + margin.top + margin.bottom)
      .style("font-size", this.cfg.config.legendFontSizeSmall)
      .style("font-family", this.cfg.config.legendFont)
      .style("color",color)
      .html(text)
      //to access the DOM table: this.div.node()
      this.regLineText[index].node().style.display = "block";
      this.regLineText[index].node().style.overflowY = "scroll"
      this.regLineText[index].node().style.maxHeight = this.cfg.config.height
  }

  computeData(data){
      var lineData= []; 
      //finds the true min/max
      if(!data[1]){return lineData}
      let truemin = parseFloat(data[1][config.ppmerror])
      let truemax = parseFloat(data[1][config.ppmerror])
      for(let i=0; i<data.length; i++){
          let currentValue = parseFloat(data[i][config.ppmerror])
          if(currentValue> truemax && !isNaN(currentValue)){truemax = currentValue}
          if(currentValue< truemin && !isNaN(currentValue)){truemin = currentValue}
      }
      let step = (parseFloat(truemax) - parseFloat(truemin))
      step = step/ parseFloat(this.cfg.sampleNb)
      let binStart = 0 
      //calculate each point the for the line
      for(let i=0; i< this.cfg.sampleNb; i++){ 
          var totalpoints = 0; //number of points under a threshold
          binStart = truemin + step*i;
          for(let j=0; j<data.length; j++){ //checks on the whole data list which points are inferior
            if (data[j][config.ppmerror]<binStart){
              totalpoints = totalpoints +1 
            }
          }
          totalpoints = totalpoints/data.length 
      
          if (totalpoints !=0 && totalpoints !=1){  //saves a point only if it does not go to infinity
            totalpoints = NormSInv(totalpoints) //application of a statistical law
            var datapoint = {"x": binStart, "y":totalpoints}
            lineData.push(datapoint)
          }
        }
      return lineData
  }

  computeReg(data, lineData, index){
      if(!this.regLineData){this.regLineData = []}
      let lineRegData = linearRegression(lineData)
      this.regLineData[index] = lineRegData
      let y1 = this.cfg.xmin*lineRegData.slope+lineRegData.intercept
      let y2 = this.cfg.xmax*lineRegData.slope+lineRegData.intercept
      let lineReg =[];
      lineReg.push({x: this.cfg.xmin,y: y1},{x: this.cfg.xmax, y: y2})
      return lineReg
  }

  update(content, doNotUpdateDomains){
      this.draw()
  }

  updateData(content, index){
      if(debug){console.log("updating data n°"+index)}
      let dataset = this.canvas.data[index]
      this.drawData(dataset, index)
  }

  /** if the filter comes from this histogram, it should not be counted */
  handleFiltering(indexesList){
      if(!this.canvas.cfg.interactivity.filterWorkonHistograms){return;}
      for(let i=0; i<this.canvas.data.length; i++){
          let dataset = this.canvas.data[i]
          if(dataset.filter.cellIndex == this.index){continue;}
          if(this.cfg.activeData[i] != "1" || !dataset  || dataset.data.length == 0){continue;}
          this.drawData(this.canvas.data[i], i, "filter")
      }
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
          this.drawData(this.canvas.data[i], i, "highlight")
      }
  }

  prepareCfg(){
      let properties = [
          {key:"sampleNb",type:"number",default:100},
          {key:"linearColor",type:"color",default:"#ff0000"},
          {key:"linearEquation",type:"checkbox",default:true},
      ]
      return properties
  }

  autoscale(){

  }
  
  preparePopupCfg(){
      let varsArray = []
      varsArray.push({"name":"error range",
          "inputs":[
              {key:"xmin",type:"number",value:this.cfg.xmin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
              {key:"xmax",type:"number",value:this.cfg.xmax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      varsArray.push({ "name":"t range",
          "inputs":[
              {key:"ymin",type:"number",value:this.cfg.ymin,title: "Minimum axis value",update:(d)=>{this.cfg.update(d)}},
              {key:"ymax",type:"number",value:this.cfg.ymax,title: "Maximum axis value",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      varsArray.push({ "name":"sampling",
          "inputs":[
              {key:"sampleNb",type:"number",value:this.cfg.sampleNb,title: "Number of samples taken",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      varsArray.push({ "name":"linear regression color",
          "inputs":[
              {key:"linearColor",type:"color",value:this.cfg.linearColor,title: "Color of the linear regression line",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      varsArray.push({ "name":"show regression equation",
          "inputs":[
              {key:"linearEquation",type:"checkbox",value:this.cfg.linearEquation,title: "Show the linear regression equation and r²",update:(d)=>{this.cfg.update(d)}},
          ]
      })
      return varsArray
  }
}


/// Work in progress: Shapiro-Wilk test

//
function shapiroWilkTest(data){
    //computes the mean
    var mean = 0
    for(let i=0; i<data.length; i++){
        if(isNaN(data[i])){continue;}
        mean += data[i]
    }
    mean = mean/data.length
    //computes the variance (denominator in shapiro wilk)
    var variance = 0
        for(let i=0; i<data.length; i++){
        if(isNaN(data[i])){continue;}
        variance += (data[i] - mean)^2 
    }
}
//each subarray is for a different n number, in this order: 2,4,6,8,10,15,20,25,30
var shapiroWilkTable = [
    [0.7071],
    [0.6872,0.1677],
    [0.6431,0.2806,0.0875],
    [0.6052,0.3164,0.1743,0.0561],
    [0.5739,0.3291,0.2141,0.1224,0.0399], //10
    [0.5150,0.3306,0.2495,0.1878,0.1353,0.0880,0.0433,0], //15
    [0.4734,0.3211,0.2565,0.2085,0.1686,0.1334,0.1013,0.0711,0.0422,0.0140], //20
    [0.4450,0.3069,0.2453,0.2148,0.1822,0.1539,0.1283,0.1046,0.0823,0.0610,0.0403,0.0200,0.000],//25
    [0.4254,0.2944,0.2487,0.2148,0.1870,0.1630,0.1415,0.1219,0.1036,0.0862,0.0697,0.0537,0.0381,0.0227,0.0076] //30
]

////
///////////////
defaultCvs.mainCfgStat = {
  cellNb : 3,
  dataNb : 1,
  opacity : 1,
  cellsType : ["errorMass","histoerror","henry"],
  interactivity:{
      active: "all",
      histoColor: "#000000a0",
      selectionStyle: "selected",
      selectionStyleBis: "selected2",
      createHistogramBars: true,
      filterWorkonHistograms: true,
      histogramRelativity: true,
      showTitleWarning: true
  },
  proposedCells:{
      common: false,
      histo: false,
      stats : true,
  },
  cellsElements:{
      colorLegend : true,
  }
}


var canvasS = new Canvas(document.getElementById("canvasS"),"S", JSON.parse(JSON.stringify(defaultCvs.mainCfgStat)))
canvasS.data[0].cfg.colorGradient = "solid"
canvasS.tooltip = new TooltipCanvas(document.getElementById("tooltip_canvasStat"),canvasS)
//set function to html and to buttons
var html_tabCanvasS = document.getElementById("tab_canvasS")
html_tabCanvasS.querySelector("button[name='autoscale']").addEventListener("click",(d)=>{
  canvasS.autoscale()
})
html_tabCanvasS.querySelector("button[name='searchButton']").addEventListener("click",(d)=>{
  new Popup_searchPeaks(canvasS)
})
html_tabCanvasS.querySelector('button[name="screenshot"]').addEventListener("click", function (){
  new Popup_canvasScreenshot(canvasS)
});
/** creates the top table */
new TopMenuCanvas(canvasS, document.getElementById("tab_canvasS"))

