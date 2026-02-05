//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// this script contains functions useful for every //
// or most plots present within the pages. For     //
//example: appending plot divisions, clip pathes, //
//axis labels and so forth                        //
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////




/**
 * a function to append an svg space where a plot will be drawn
 * @param {*} motherdivID the ID of the division within who the plot will be created
 * @param {*} cellID the ID to give to the cell
 * @param {*} beforeEl the element that this has to be inserted before
 * @param {*} configuration defaults to "config" if empty
 */
function appendCell(motherdivID, cellID, beforeEl, configuration){
 let cfg = configuration || config
 var newplot = d3.select(motherdivID)
  .insert("svg", beforeEl)
    .attr("width", cfg.width + cfg.margin.left + cfg.margin.right)
    .attr("height", cfg.height + cfg.margin.top + cfg.margin.bottom)
    .attr("id",cellID)
  .append("g")
  .attr("transform",
          "translate(" + cfg.margin.left + "," + cfg.margin.top + ")");

 return newplot
}

/**
 * a function to append a clip path which will cut every point or line going outside of the box
 * @param {*} plot the plot for which the clip path will be created
 * @param {*} clipID the id that will be given to the clip path
 * @param {*} configuration defaults to "config" if empty
 */
function appendClipPath(plot, clipID, configuration){
  let cfg = configuration || config
    var clipPath = plot.append("clipPath") //creates a zone to cut every point or line going outside of the box
    .attr("id", clipID)
  .append("rect")
    .attr("width", cfg.width-1)
    .attr("height", cfg.height-1)
    .attr("transform",
    "translate(" + 1 + "," + 1  + ")");

  return clipPath
}

/**
 * a function to append a back rectangle with the background color selected by the user
 * @param {*} plot  the plot to append it to
 * @param {*} size the y size in percent of the rectangle
 * @param {*} configuration defaults to "config" if empty
 */
function appendBackColor(plot, size, configuration){
  let cfg = configuration || config
  if (typeof size === 'undefined') { size = '100'; }
  var rect = plot.append("rect")
  .attr("width", cfg.width)
  .attr("height", cfg.height*size*0.01)
  .attr("x",0)
  .attr("y",0)
  .attr("fill", cfg.cellBackColor)
  .attr("id","trueBackground")
  .moveToBack()
  return rect
}


/**
 * a function that creates options for a defined selecter based on the names of the first line of data imported
 * @param {*} selectName the id of the selecter for which options have to be added 
 * @param {*} parentDiv optional if the research has to be done inside a specific div. Put here the ID of the parent div
 */
function createSelectOptions(selectName,parentDiv){
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
  for (var i = 0; i < columnNames.length; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.text = columnNames[i];
    selectedSelecter.appendChild(option);
  }
  return selectedSelecter
}

/**
 * a function to append a new tooltip to a div on a page
 * @param {*} divID the ID of the tooltip division
 * @param {*} tooltipClass the class name of the tooltip
 */
  function appendTooltip(divID, tooltipClass){
    var newTooltip = d3.select(divID)
    .append("div")
    .style("opacity", 0)
    .attr("class", tooltipClass)
    .attr("name", "tooltip")
    .style("color", "white")
    .style("background-color", ' rgb(60, 60, 60)')
    .style("padding", "5px")
    .style("position", 'absolute')
    .style("width", '300px')
    return newTooltip
  }

/**
 * a function to append a new x Axis to the plot
 * @param {*} plot the plot to append it to
 * @param {*} plotAxis the plot Axis linked to the scale
 * @param {*} plotHeight the height in px of the plot
 * @param {*} maxValue the max value to decide if it needs to be in scientific writing
 * @param {*} configuration defaults to "config" if empty
 * @returns 
 */
function appendAxis_x(plot,plotAxis,plotHeight, maxValue, configuration){
  let cfg = configuration || config
  var x = plot.append("g")
  .attr("transform", "translate(0," + plotHeight + ")")
  .style("font-family",cfg.legendFont)
  .style("font-size",cfg.legendFontSizeSmall)
  if(maxValue >= 1e5 ){x.call(d3.axisBottom(plotAxis).ticks(cfg.axisLines).tickFormat(d3.format('.01e')))}
  else{x.call(d3.axisBottom(plotAxis).ticks(cfg.axisLines));}
  return x
}

/**
 * a function to append a new x Axis to the plot
 * @param {*} plot the plot to append it to
 * @param {*} plotAxis the plot Axis linked to the scale
 * @param {*} maxValue the max value to decide if it needs to be in scientific writing
 * @param {*} configuration defaults to "config" if empty
 * @returns 
 */
 function appendAxis_y(plot,plotAxis, maxValue, configuration){
  let cfg = configuration || config
  var y = plot.append("g")
  .style("font-family",cfg.legendFont)
  .style("font-size",cfg.legendFontSizeSmall)
  .style("letter-spacing","-0.075em")
  //.on("dblclick",function(){console.log("dbl click",plot, plotAxis)}) //COULD BE USED LATER TO EDIT THE AXIS VALUES
  if(maxValue >= 1e5 ){y.call(d3.axisLeft(plotAxis).ticks(cfg.axisLines).tickFormat(d3.format('.01e')))}
  else{y.call(d3.axisLeft(plotAxis).ticks(cfg.axisLines));}
  return y
}


/**
 * appennd a new x axis label
 * @param {*} plot the plot which it is appended to
 * @param {*} text the text content of the label
 * @param {*} configuration defaults to "config" if empty
 */
function appendAxisLabel_x(plot,text,options, configuration){
  let cfg = configuration || config
  if(!options){options={}}
  let x = cfg.width/2
  let y = cfg.height+ parseInt(cfg.legendFontSize)*1.5 + parseInt(cfg.legendFontSizeSmall)
  let anchor = "middle"
  if(options.mode == "endAxis"){
    x = cfg.width+5
    y = cfg.height + parseInt(cfg.legendFontSize)/2
    anchor = "start"
  }
 var newlabel = plot.append("text")
  .attr("y", y)
  .attr("x", x)
  .style("font-size",cfg.legendFontSize)
  .style("font-family",cfg.legendFont)
  .style("text-anchor", anchor)
  .style("fill",options.color || "black")
  .text(text);
  return newlabel
}

/**
 * appennd a new y axis label
 * @param {*} plot the plot which it is appended to
 * @param {*} text the text content of the label
 * @param {*} configuration defaults to "config" if empty
 */
function appendAxisLabel_y(plot,text,options, configuration){
  let cfg = configuration || config
  if(!options){options={}}
  let x = -cfg.height/2
  let y = -parseInt(cfg.legendFontSize)*1.5 - parseInt(cfg.legendFontSizeSmall)
  let anchor = "middle"
  let rotation = "-90"
  if(options.mode == "endAxis"){
    x = 0
    y = -parseInt(cfg.legendFontSize)*0.5
    anchor = "middle"
    rotation = "0"
  }
    var newlabel = plot.append("text")
    .attr("transform", "rotate("+rotation+")")
    .attr("y", y)
    .attr("x", x)
    .style("font-size",cfg.legendFontSize)
    .style("font-family",cfg.legendFont)
    .style("text-anchor", anchor)
    .style("fill",options.color || "black")
    .text(text);
    return newlabel
}

function appendSampleName(plot,text,dataNb,options, configuration){
  let cfg = configuration || config
  if(!options){options = {}}
  let position = "end"
  if(options.positionX){position = options.positionX}
  let y = parseInt(cfg.legendFontSize) + parseInt(cfg.legendFontSize*dataNb)
  let x = cfg.width
  if(options.positionX == "start"){x = 0}
  if(options.positionX == "middle"){x = cfg.width/2}
  if(options.positionY == "bottom"){y = parseInt(cfg.height) - parseInt(cfg.legendFontSize*dataNb)}
  var newlabel = plot.append("text")
    .attr("y",y)
    .attr("x",x)
    .attr("id","sampleTitle")
    .style("font-size",cfg.legendFontSize)
    .style("font-family",cfg.legendFont)
    .style("font-weight","bold")
    .style("text-anchor", position)
    .style("fill", options.color || "black")
    .text(text);
    return newlabel

}

/**
 * a function to call when you need to do axes on the other side of a graph
 * @param {*} cell the cell to append the box to
 * @param {*} xAxis the x  axis of the cell
 * @param {*} yAxis the y axis of the cell
 */
function appendBoxScales(cell, xAxis, yAxis, cfg){
  let thisWidth = config.width
  if(cfg && cfg.width){thisWidth = cfg.width}
  var gy = cell.append("g").attr("transform", "translate("+thisWidth+",0)").call(d3.axisRight(yAxis).ticks(0).tickSize(0));
  var gx = cell.append("g").attr("transform", "translate(0,0)").call(d3.axisTop(xAxis).ticks(0).tickSize(0));
  return {gx,gy};
}

/**
 * append a new grid for the plot
 * @param {*} plot the plot which the grid has to be appended to
 * @param {*} axis the axis on which the grid is based
 * @param {*} ticksNumber number of ticks. Usually 10 is good
 * @param {*} direction "bottom" or "side" to have a horizontal or vertical grid
 * @param {*} dimensions an array of 2 dimensions [width, height] or if empty defaults to config
 * @returns 
 */
function appendPlotGrid(plot,axis, ticksNumber, direction, configuration){
    let cfg = configuration || config
    var newgrid = plot.append("g")
    .attr("class","grid")
    if(direction == "bottom"){
        newgrid.call(d3.axisBottom(axis).ticks(ticksNumber).tickSize(cfg.height).tickFormat(""))
        .moveToBack() //useful so that the selection can be made over the grid
        return newgrid
    }else if(direction == "side"){
        newgrid.call(d3.axisLeft(axis).ticks(ticksNumber).tickSize(-cfg.width).tickFormat(""))
        .moveToBack() //useful so that the selection can be made over the grid
        return newgrid
    }else{console.error("Error: a grid tried to be created but the direction specified does not exist. bottom or side")}
}
function appendLine(plot, length, color){
  var line = plot.append('line')
    .attr('x1', 0 -length/2)
    .attr('y1', config.height - length/2)
    .attr('x2', 0 + length/2)
    .attr('y2', config.height+length/2)
    .style('stroke-width', 1)
    .style('stroke',color)
    line.moveToBack()
}

/**creates a button to edit a cell */
function appendCustomButton(plot, cell){
  let button = plot.append("circle")
  .attr('cx', width)
  .attr('cy', config.height+40)
  .attr("r",10)
  .style("fill","black")
  .text("clickMe!")
  .on("click", (d) => {
    let top = d.clientY+20
    let left = d.clientX+20
    console.log(top, left)
    new MovableWindowCellConfig(cell,{"top":top,"left":left})

  })
  return button
}

/**---------------------------------------------------------------------------------------- */
// UPDATING FUNCTIONS

/**
 * quick way to update an axis to the bottom of the chart
 * @param {*} axis  the axis to refresh it to
 * @param {*} scale  the scale of the axis
 * @param {*} maxvalue the max value to decide if scientific writing or not
 */
function updateAxisBottom(axis, scale, maxvalue){
  if(maxvalue >= 1e5){
    axis.call(d3.axisBottom(scale).ticks(config.axisLines).tickFormat(d3.format('.01e')));
  }else{ axis.call(d3.axisBottom(scale).ticks(config.axisLines));}
 
}
/**
 * quick way to update an axis to the left of the chart
 * @param {*} axis  the axis to refresh it to
 * @param {*} scale  the scale of the axis
 * @param {*} maxvalue the max value to decide if scientific writing or not
 */
 function updateAxisLeft(axis, scale, maxvalue){
  if(maxvalue >= 1e5){
    axis.call(d3.axisLeft(scale).ticks(config.axisLines).tickFormat(d3.format('.01e')));
  }else{ axis.call(d3.axisLeft(scale).ticks(config.axisLines));}
 
}


/**---------------------------------------------------------------------------------------- */
/**Color methods */

/**
 * draw a new color scale
 * @param {*} cell the cell to append it to
 * @param {*} scaleLegend the text/data of the legend
 * @param {*} configScale the configuration values (min, max...) of the scale
 * @param {*} interpolatedColor the mathematical variable holding the color scaling
 * @param {*} scaleName the name of the scale
 * @param {*} forceContinuous is it being forced to have a continuous scale ?
 * @param {*} specialParam the special parameters for multi view tool {yOffset, }
 * @returns 
 */
function appendColorLegend(cell, scaleLegend, configScale, interpolatedColor, scaleName, forceContinuous, specialParam){
  if(config.hideColorLegend){return;}
  var colorsNumber  = Math.min(30,1+Math.abs(parseInt(configScale.max-configScale.min)))
  if(forceContinuous){colorsNumber = 30};
  //when the scale is on small numbers with a comma, does not limit to less than 30 the number of colors of the color gradient
  if(configScale.max != parseInt(configScale.max) || configScale.min != parseInt(configScale.min)){colorsNumber = 30}
  var yOffset =  0 
  if(specialParam){yOffset = specialParam.yOffset} //if special parameters, sets the offset in y axis
  var cScale = d3.scaleLinear().domain([0,colorsNumber]).range([0, colorsNumber])
  var scale = {}
  config.legendFontSizeSmall = parseInt(config.legendFontSizeSmall)
  scale.colors = cell.append("g").attr("id","colorLegend_pixels")
  .selectAll(".rects")
  .data(d3.range(colorsNumber))
  .enter()
  .append("rect")
  .attr("id","colorLegend_colors")
  .attr("x", function(d) { return width/3+cScale(150*d/colorsNumber) })
  .attr("height", 15)
  .attr("y", config.height+config.margin.bottom/2+config.legendFontSizeSmall+ yOffset)
  .attr("width", 180/colorsNumber)
  .style("fill", function(d) {return interpolatedColor((configScale.min*(colorsNumber-1-d)+configScale.max*(d))/(colorsNumber-1)) });

  
   scale.legendTitle = cell.append("text")
    .attr("id","colorLegend_title")
    .attr("y", config.height+config.margin.bottom/2+config.legendFontSizeSmall*2/3 + yOffset)
    .attr("x", config.width/3 -config.legendFontSizeSmall)
    .attr("font-size",15)
    .style("text-anchor", "end")
    .style("fill","black")
    .style("font-family",config.legendFont)
    .style("font-size",config.legendFontSizeSmall)
    .text(scaleName+": ");

  scale.legendValues = cell.append('g').attr("id","colorLegend_values")
    .selectAll("text")
    .data(scaleLegend)
    .enter()
    .append("text")
    .attr("y", config.height+config.margin.bottom/2+ config.legendFontSizeSmall*2/3 + yOffset)
    .attr("x", function (d){ return config.width/3+ 65 + d[0]})
    .attr("font-size",12)
    .style("text-anchor", "start")
    .style("fill","black")
    .style("font-family",config.legendFont)
    .style("font-size",config.legendFontSizeSmall)
    .text(function (d){ 
      let text=""
      if(d[1]>=1e4){text= Math.round(d[1]).toExponential()}
      else{text=Math.round(d[1]*10)/10}
      if(specialParam && specialParam.relative){text+= "%"}
      return text});


  if(specialParam){ //if special parameters on, set the id to the one needed
    if(specialParam.id){
      scale.colors.attr("id",specialParam.id)
      scale.legendTitle.attr("id",specialParam.id)
      scale.legendValues.attr("id",specialParam.id)
    }
  }


  return scale
}


/**
 * a function to draw the color legend of solid color cells
 * @returns the g element
 */
function drawSolidColorLegend(cell, cellNum, dataNum, LegendText, cfgData){

  histobarsLegend = cell.self.append('g').attr("id","solidColorLegend"+cellNum);

  histobarsLegend.append("rect")
          .attr("x", config.margin.left)
          .attr("y",config.margin.top*2+config.height+25+25*dataNum)
          .attr("width",15)
          .attr("height",15)
          .style("fill", cfgData.colorSolid);
      
  histobarsLegend.append("text")
          .attr("x", config.margin.left + 25)
          .attr("y",config.margin.top*2+config.height+35+25*dataNum)
          .style("font-size",config.legendFontSizeSmall)
          .style("font-family",config.legendFont)
          .style("fill","black")
          .text(LegendText);

  return histobarsLegend;
 }

 /************************Colour legends************************************* */

 function createColourLegend(svgSpace, name, dataCfg, cellCfg, nbBefore, colorScale){
  let colorsNumber  = Math.min(40,1+Math.abs(parseInt(dataCfg.maxColor-dataCfg.minColor)))
  // if(forceContinuous){colorsNumber = 40};
  //when the scale is on small numbers with a comma, does not limit to less than 30 the number of colors of the color gradient
  if(dataCfg.maxColor != parseInt(dataCfg.maxColor) || dataCfg.minColor != parseInt(dataCfg.minColor)){colorsNumber = 40}
  var cScale = d3.scaleLinear().domain([0,colorsNumber]).range([0, colorsNumber])

  let chartOffset = parseFloat(cellCfg.config.margin.top)+parseFloat(cellCfg.config.height)
  let axisOffset = parseFloat(cellCfg.config.legendFontSize)+parseFloat(cellCfg.config.legendFontSizeSmall)
  let topSpace = chartOffset + axisOffset
  let lineHeight = 5+parseFloat(cellCfg.config.legendFontSizeSmall)
  let variableName = columnNames[dataCfg.colorType]


  let minColor = dataCfg.minColor
  let maxColor = dataCfg.maxColor
  let suppText = ""
  if(dataCfg.colorRelative){
    suppText = "(%)"
    let space = (dataCfg.relativeMax - dataCfg.relativeMin)/100
    minColor = dataCfg.relativeMin + dataCfg.minColor*space
    maxColor = dataCfg.relativeMin + dataCfg.maxColor*space
  }

  let halfWidth = cellCfg.config.width/2
  let legend = svgSpace.append('g').attr("id","legend_"+name).attr("name","colorLegend")
  var scale = {}
  config.legendFontSizeSmall = parseInt(config.legendFontSizeSmall)
  scale.colors = legend.append("g").attr("id","legend_"+name+"_pixels")
  .selectAll(".rects")
  .data(d3.range(colorsNumber))
  .enter()
  .append("rect")
  .attr("id","colorLegend_colors")
  .attr("x", function(d) { return halfWidth+ cScale(160*d/colorsNumber) })
  .attr("height", 10)
  .attr("y", topSpace+5+lineHeight*nbBefore)
  .attr("width", 160/colorsNumber)
  .style("fill", function(d) {return colorScale((minColor*(colorsNumber-1-d)+maxColor*(d))/(colorsNumber-1)) });

  legend.append("text")
  .attr("id","legend_"+name+"_title")
  .attr("y", topSpace+15+lineHeight*nbBefore)
  .attr("x", halfWidth)
  .style("text-anchor", "end")
  .style("fill","black")
  .style("font-family",cellCfg.config.legendFont)
  .style("font-size",cellCfg.config.legendFontSizeSmall)
  .text(name+","+variableName+suppText+": "+dataCfg.minColor);

  legend.append("text")
  .attr("id","legend_"+name+"_title2")
  .attr("y", topSpace+15+lineHeight*nbBefore)
  .attr("x", halfWidth+160)
  .style("text-anchor", "start")
  .style("fill","black")
  .style("font-family",cellCfg.config.legendFont)
  .style("font-size",cellCfg.config.legendFontSizeSmall)
  .text(dataCfg.maxColor);

  return legend
 }

 function createColourLegendSolid(svgSpace, name, dataCfg, cellCfg, nbBefore){
  let chartOffset = parseFloat(cellCfg.config.margin.top)+parseFloat(cellCfg.config.height)
  let axisOffset = parseFloat(cellCfg.config.legendFontSize)+parseFloat(cellCfg.config.legendFontSizeSmall)
  let topSpace = chartOffset + axisOffset
  let lineHeight = 5+parseFloat(cellCfg.config.legendFontSizeSmall)

  let halfWidth = cellCfg.config.width/2
  let legend = svgSpace.append('g').attr("id","legend_solid_"+name).attr("name","colorLegend")
  legend.append("rect")
          .attr("x", halfWidth+cellCfg.config.margin.left+15)
          .attr("y",topSpace+5+lineHeight*nbBefore)
          .attr("width",15)
          .attr("height",15)
          .style("fill", dataCfg.colorSolid);
      
  legend.append("text")
          .attr("x", halfWidth+cellCfg.config.margin.left)
          .attr("y",topSpace+18+lineHeight*nbBefore)
          .style("font-size",cellCfg.config.legendFontSizeSmall)
          .style("font-family",cellCfg.config.legendFont)
          .style("fill","black")
          .style("text-anchor", "end")
          .text(name);
  return legend
 }



 /**
 * similar to drawSolidColorLegend but more customizable
 * @returns the g element
 */
function drawSolidColorLegendLine(vectorialSpace, name, LegendText, color, position){

  histobarsLegend = vectorialSpace.self.append('g').attr("id","solidColorLegend_"+name);

  histobarsLegend.append("rect")
          .attr("x", position[0])
          .attr("y",position[1])
          .attr("width",15)
          .attr("height",15)
          .style("fill", color);
      
  histobarsLegend.append("text")
          .attr("x", position[0] + 25)
          .attr("y",position[1]+10)
          .style("font-size",config.legendFontSizeSmall)
          .style("font-family",config.legendFont)
          .style("fill","black")
          .text(LegendText);

  return histobarsLegend;
 }

/**---------------------------------------------------------------- */
/**Other functions------------------------------------------------- */


/**
 * A function to auto set the axes of a cell to the values of the min and the max of the dataset. Do one time for each axis
 * @param {*} axis the axis to reset
 * @param {*} dataset the dataset
 * @param {*} column the column corresponding to the min and/or max of the axis
 */
function autoAxis(axis,dataset,column){
  let min = parseFloat(dataset[0][1][column]);
  let max = min;
  for(let i=0; i<dataset.length; i++){
    for(let j=1; j<dataset[i].length; j++){ //starts at 1 to avoid the title line of the matrix
      if(parseFloat(dataset[i][j][column]) > max){max = parseFloat(dataset[i][j][column])}
      else if(parseFloat(dataset[i][j][column]) < min){min = parseFloat(dataset[i][j][column])}
    }  
  }

  if(min == max){
     return console.error("error when finding min and max value of the axis while trying to autoscale the cell")
  }else{
    min = parseFloat(min)
    max = parseFloat(max)
    //decides on how to round up the axis values
    let axisWidth = max-min
    if(axisWidth<=2){
      if(min <10 && min>0){min = 0}
      if(min != 0){min = 0.01*Math.round(100*(min - 0.1*axisWidth))}
      max = 0.01*Math.round(100*(max + 0.1*axisWidth))
    }
    else if(axisWidth<100){
      if(min <-1 || min >1){min = Math.round(min - 0.1*axisWidth)}
      max = Math.round(max + 0.1*axisWidth)
    }
    else{
      if(min >10){min = Math.min(min-10,100*Math.round(0.01*(min - 0.1*axisWidth)))}
      else if(min <-10){min = Math.min(min-10, 100*Math.round(0.01*(min + 0.1*axisWidth))) }
      max = Math.max(max+10,100*Math.round(0.01*(max + 0.1*axisWidth)))
    }

    if(debug){console.log("autoscale:",min,max,"width:"+axisWidth)}
    axis.domain([ min, max ]);
    return [ min, max ];
  }

}

/**
 * a function to find the max value of intensity for the bins of a histogram
 * @param {*} bins the data inside bins
 * @param {*} histoStyle the style, intensity or number
 * @param {*} column the column of the intensity 
 * @param {*} trueMax the total intensity of the data. Needed only if histoStyle is intensity
 * @param {*} dataLength the length of the data. Needed only if histoStyle is number
 * @returns 
 */
function autoAxis_histo(data,histoStyle,column,trueMax, dataLength){
  let localMax = 0
  let max = 0
  let fullMax = 0
  if(histoStyle == "intensity"){
    for(let n=0; n< data.length; n++){
      var bins = data[n]
      for(let i=0; i<bins.length; i++){
        localMax = 0
        for(let j=0; j<bins[i].length; j++){
          localMax += parseInt(bins[i][j][column])
        }
        if (localMax > max){max = localMax}
      }
      //computes the true max in %
      max = 100*max/trueMax[n]
      if(max > fullMax){fullMax = max}
    }
    if(fullMax>90){fullMax = 100}
  }else if(histoStyle == "number"|| histoStyle =="attributions"){
    for(let n=0; n< data.length; n++){
      var bins = data[n]
      for(let i=0; i<bins.length; i++){
        localMax = 0
        for(let j=0; j<bins[i].length; j++){
          localMax += 1
        }
        if (localMax > max){max = localMax}
      }
      //computes the true max in %
      max = 100*max/dataLength[n]
      if(max > fullMax){fullMax = max}
    }
    
    if(fullMax>80){fullMax = 100}
    else if(fullMax>5){fullMax = 10*Math.ceil(fullMax/10)}
    else{fullMax += 1}
  }else {console.error("Error, unknown type of histogram style")}


  return fullMax;

}



/**----------------------------------------------------------------------------- */
/** 3D FUNCTIONS *************************************************************** */


/*****************************************************************************/
/*****************************************************************************/
/***********************HANDLING OF 3D SPACE AND AXES ***********************/

class Space3d {
  constructor(cell, cfg){
    this.cell = cell
    this.cfg =cfg

    this.startAngleX = cfg.startAngle3d_x || Math.PI
    this.startAngleY = cfg.startAngl3d_y || 0

  let origin = {"x":this.cfg.origin3dX, "y":this.cfg.origin3dY}
  /////computing
  this.scale3d_line = d33d.lineStrips3D()
  .origin(origin)
  .rotateY(this.startAngleY)
  .rotateX(this.startAngleX)
  .scale(this.cfg.scale3d);

  this.scale3d_plane = d33d.gridPlanes3D()
  .rows(10)
  .origin(origin)
  .rotateY(this.startAngleY)
  .rotateX(this.startAngleX)
  .scale(this.cfg.scale3d);

  this.scale3d_dots = d33d.points3D()
  .origin(origin)
  .rotateY(this.startAngleY)
  .rotateX(this.startAngleX)
  .scale(this.cfg.scale3d);

  this.scale3d_text = d33d.points3D()
  .origin(origin)
  .rotateY(this.startAngleY)
  .rotateX(this.startAngleX)
  .scale(this.cfg.scale3d);
  //makes sure everything is cleaned
  this.cleanup()
  //configure axis data
  this.configure()
  //draws the axis
  this.startup()
  //prepares the drag
  this.createDrag()
  }


  configure(){
    //axis
    this.lineDataX = [];
    this.lineDataY = [];
    this.lineDataZ = [];
    this.lineInfosX = [];
    this.lineInfosY = [];
    this.lineInfosZ = [];
    let dataMin = -7
    let dataMax = 5
    if(config.boxBorders){dataMin = -5}

    d3.range(dataMin, dataMax, 1).forEach((d) => {
      this.lineDataX.push({ x: d, y: -5, z: -5 });
      this.lineDataY.push({ x: -5, y: d, z: -5 });
      this.lineDataZ.push({ x: -5, y: -5, z: d });
      this.lineInfosX.push({ x: d, y: -5, z: -5 ,value: this.cell.scales3D[0].invert(d)})
      this.lineInfosY.push({ x: -5, y: d, z: -5 ,value: this.cell.scales3D[1].invert(d)})
      this.lineInfosZ.push({ x: -6, y: -5, z: d ,value: this.cell.scales3D[2].invert(d)})
    });
    if(config.boxBorders){
      this.lineDataX2= []
      this.lineDataY2= []
      this.lineDataZ2= []
      this.lineDataX3= []
      this.lineDataY3= []
      this.lineDataZ3= []
      this.lineDataX4= []
      this.lineDataY4= []
      this.lineDataZ4= []
        d3.range(dataMin, dataMax, 1).forEach((d) => {
          this.lineDataX2.push({ x: d, y: 4, z: 4 });
          this.lineDataX3.push({ x: d, y: -5, z: 4 });
          this.lineDataX4.push({ x: d, y: 4, z: -5 });
          this.lineDataY2.push({ x: 4, y: d, z: 4 });
          this.lineDataY3.push({ x: -5, y: d, z: 4 });
          this.lineDataY4.push({ x: 4, y: d, z: -5 });
          this.lineDataZ2.push({ x: 4, y: 4, z: d });
          this.lineDataZ3.push({ x: -5, y: 4, z: d });
          this.lineDataZ4.push({ x: 4, y: -5, z: d });
        });
    }
    //axisNames
    this.axisNameX = [{ x: 0, y: -6, z: -6 }]
    this.axisNameY = [{ x: -6, y: 0, z: -6 }]
    this.axisNameZ = [{ x: -6, y: -6, z: 0 }]

    //plane
    this.gridData_xz = [];
    this.gridData_xy = [];
    this.gridData_yz = [];

    for (let z = -5; z < 5; z++) {
      for (let x = -5; x < 5; x++) {
        this.gridData_xz.push({ x: x, y: -5, z: z});
        this.gridData_xy.push({ x: x, y: z, z: -5});
        this.gridData_yz.push({ x: -5, y: x, z: z});
      }
    }

  }


  /** to draw the 3d box */
    startup(){
    //axes
    this.svgAxis3D = []
    this.svgAxis3D[0] = this.draw3D_axis(this.scale3d_line([this.lineDataX]),"x")
    this.svgAxis3D[1] = this.draw3D_axis(this.scale3d_line([this.lineDataY]),"y")
    this.svgAxis3D[2] = this.draw3D_axis(this.scale3d_line([this.lineDataZ]),"z")
    this.svgAxis3DBonus =[]
    if(config.boxBorders){
      this.svgAxis3DBonus[0] = this.draw3D_axis(this.scale3d_line([this.lineDataX2]),"x2")
      this.svgAxis3DBonus[1] =this.draw3D_axis(this.scale3d_line([this.lineDataY2]),"y2")
      this.svgAxis3DBonus[2] =this.draw3D_axis(this.scale3d_line([this.lineDataZ2]),"z2")
      this.svgAxis3DBonus[3] =this.draw3D_axis(this.scale3d_line([this.lineDataX3]),"x3")
      this.svgAxis3DBonus[4] =this.draw3D_axis(this.scale3d_line([this.lineDataY3]),"y3")
      this.svgAxis3DBonus[5] =this.draw3D_axis(this.scale3d_line([this.lineDataZ3]),"z3")
      this.svgAxis3DBonus[6] =this.draw3D_axis(this.scale3d_line([this.lineDataX4]),"x4")
      this.svgAxis3DBonus[7] =this.draw3D_axis(this.scale3d_line([this.lineDataY4]),"y4")
      this.svgAxis3DBonus[8] =this.draw3D_axis(this.scale3d_line([this.lineDataZ4]),"z4")
    }  
    //axis Names
    if(this.cfg.showAxisNames3d){
      this.svgAxisNames = []
      this.svgAxisNames[0] = this.draw3D_axisName(this.scale3d_text(this.axisNameX),"x")
      this.svgAxisNames[1] = this.draw3D_axisName(this.scale3d_text(this.axisNameY),"y")
      this.svgAxisNames[2] = this.draw3D_axisName(this.scale3d_text(this.axisNameZ),"z")
    }
    //axis values
    if(this.cfg.showAxisValues3d){
      this.svgAxisValues = []
      this.svgAxisValues[0] = this.draw3D_axisValues(this.scale3d_text(this.lineInfosX), "x")
      this.svgAxisValues[1] = this.draw3D_axisValues(this.scale3d_text(this.lineInfosY), "y")
      this.svgAxisValues[2] = this.draw3D_axisValues(this.scale3d_text(this.lineInfosZ), "z")
    }
    //grid
    this.svgPlane3D = []
    this.svgPlane3D[0] = this.draw3D_plane(this.scale3d_plane([this.gridData_xz]),"xz")
    this.svgPlane3D[1] = this.draw3D_plane(this.scale3d_plane([this.gridData_xy]),"xy")
    this.svgPlane3D[2] = this.draw3D_plane(this.scale3d_plane([this.gridData_yz]),"yz")
  }  

  /**removes everything on the 3d space */
  cleanup(){
    this.cell.svgSpace.selectAll("text.d3-3d").remove()
    this.cell.svgSpace.selectAll("circle.d3-3d").remove()
    this.cell.svgSpace.selectAll("path.d3-3d").remove()
    if(this.svgAxis3D){this.svgAxis3D.forEach((d)=>{d.remove()})}
    if(this.svgAxis3DBonus){this.svgAxis3DBonus.forEach((d)=>{d.remove()})}
    if(this.showAxisNames3d){this.showAxisNames3d.forEach((d)=>{d.remove()})}
    if(this.showAxisValues3d){this.showAxisValues3d.forEach((d)=>{d.remove()})}
    if(this.svgPlane3D){this.svgPlane3D.forEach((d)=>{d.remove()})}
  }

  /** creates the dragging behaviour */
  createDrag(){
    this.drag3D = this.cell.svgSpace
    .call(
      d3.drag()
        .on("drag", (d) =>{this.dragged3D(d)})
        .on("start", (d) =>{this.dragStart3D(d)})
        .on("end", (d) =>{this.dragEnd3D(d)})
    )
    this.mx = 0
    this.my = 0
    this.mouseX = 0
    this.mouseY = 0
    this.alpha = 0
    this.beta = 0
  }

  dragStart3D(event){
    this.mx = event.x;
    this.my = event.y;
  }

  dragged3D(event) {
    let mx = this.mx
    let my = this.my
    let mouseX = this.mouseX
    let mouseY = this.mouseY
    this.beta = (event.x - mx + mouseX) * (Math.PI / 230);
    this.alpha = (event.y - my + mouseY) * (Math.PI / 230) ;
    let alpha = this.alpha
    let beta = this.beta
    let startAngleX = this.startAngleX
    let startAngleY = this.startAngleY
    //grid
    if(this.cfg.showPlanes3d == "all" || this.cfg.showPlanes3d == "XZ"){
      let dataXZ = this.scale3d_plane.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)(this.gridData_xz)
      this.svgPlane3D[0] = this.draw3D_plane(dataXZ,"xz")
    }
    if(this.cfg.showPlanes3d == "all" || this.cfg.showPlanes3d == "XY"){
      let dataXY = this.scale3d_plane.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)(this.gridData_xy)
      this.svgPlane3D[1] = this.draw3D_plane(dataXY,"xy")
      }
    if(this.cfg.showPlanes3d == "all" || this.cfg.showPlanes3d == "YZ"){
      let dataYZ = this.scale3d_plane.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)(this.gridData_yz)
      this.svgPlane3D[2] = this.draw3D_plane(dataYZ,"yz")
    }
    this.cell.svgSpace.selectAll(".d3-3d").sort(this.scale3d_plane.sort);
    //scales
    let dataX = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataX]);
    let dataY = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataY]);
    let dataZ = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataZ]);
    this.svgAxis3D[0] = this.draw3D_axis(dataX, "x")
    this.svgAxis3D[1] = this.draw3D_axis(dataY, "y")
    this.svgAxis3D[2] = this.draw3D_axis(dataZ, "z")
    if(config.boxBorders){
      let dataX2 = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataX2]);
      let dataY2 = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataY2]);
      let dataZ2 = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataZ2]);
      this.svgAxis3DBonus[0] = this.draw3D_axis(dataX2, "x2")
      this.svgAxis3DBonus[1] = this.draw3D_axis(dataY2, "y2")
      this.svgAxis3DBonus[2] = this.draw3D_axis(dataZ2, "z2")
      let dataX3 = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataX3]);
      let dataY3 = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataY3]);
      let dataZ3 = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataZ3]);
      this.svgAxis3DBonus[3] = this.draw3D_axis(dataX3, "x3")
      this.svgAxis3DBonus[4] = this.draw3D_axis(dataY3, "y3")
      this.svgAxis3DBonus[5] = this.draw3D_axis(dataZ3, "z3")
      let dataX4 = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataX4]);
      let dataY4 = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataY4]);
      let dataZ4 = this.scale3d_line.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineDataZ4]);
      this.svgAxis3DBonus[6] = this.draw3D_axis(dataX4, "x4")
      this.svgAxis3DBonus[7] = this.draw3D_axis(dataY4, "y4")
      this.svgAxis3DBonus[8] = this.draw3D_axis(dataZ4, "z4")
    }
    //axis names
    if(this.cfg.showAxisNames3d){
      this.scale3d_text.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.axisNameX])
      this.scale3d_text.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.axisNameY])
      this.scale3d_text.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.axisNameZ])
      this.svgAxisNames[0] = this.draw3D_axisName(this.scale3d_text(this.axisNameX),"x")
      this.svgAxisNames[1] = this.draw3D_axisName(this.scale3d_text(this.axisNameY),"y")
      this.svgAxisNames[2] = this.draw3D_axisName(this.scale3d_text(this.axisNameZ),"z")
    }
    //axis values
    if(this.cfg.showAxisValues3d){
      this.scale3d_text.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineInfosX])
      this.scale3d_text.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineInfosY])
      this.scale3d_text.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([this.lineInfosZ])
      this.svgAxisValues[0] = this.draw3D_axisValues(this.scale3d_text(this.lineInfosX), "x")
      this.svgAxisValues[1] = this.draw3D_axisValues(this.scale3d_text(this.lineInfosY), "y")
      this.svgAxisValues[2] = this.draw3D_axisValues(this.scale3d_text(this.lineInfosZ), "z")
    }
    // angles infos
    this.cell.svgSpace.selectAll(".d33dText").remove()

    if(this.cfg.showAnglesValues3d){
      this.angleAlpha = this.cell.svgSpace.append("text")
      .attr("class", "d33dText")
      .attr("x", 200 )
      .attr("y", 20)
      .attr("dy", ".35em")
      .text("α = "+parseFloat((57.29578*alpha)%360).toFixed(3)+"°");
  
      this.angleBeta = this.cell.svgSpace.append("text")
      .attr("class", "d33dText")
      .attr("x", 200 )
      .attr("y", 40)
      .attr("dy", ".35em")
      .text("β = "+parseFloat((57.29578*beta)%360).toFixed(3)+"°");
    }

    //data
    if(this.data3d){
      this.data3d.forEach((d,n)=>{
        d = this.scale3d_dots.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)(d);
        this.svgData[n] = this.drawData(this.cell.canvas.data[n],d,n)
        if(this.cell){this.cell.drawnData[n] = this.svgData[n]}
      })
    }
    //fix for blinking data
    this.cell.svgSpace.selectAll("circle").classed("selected",false);
    this.cell.svgSpace.selectAll("circle").classed("selected2",false);
    this.cell.svgSpace.selectAll("circle").classed("tohide",false);
    this.cell.svgSpace.selectAll("circle").classed("highlighted",false);
    this.cell.svgSpace.selectAll("circle").classed("highlightedAnim",false);
    this.cell.svgSpace.selectAll("circle").style("opacity",null); //to handle a bug with tooltip display

    this.cell.svgSpace.selectAll(".d3-3d").sort(this.scale3d_dots.sort);
   
  }

  dragEnd3D(event) {
    this.mouseX = event.x - this.mx + this.mouseX;
    this.mouseY = event.y - this.my + this.mouseY;
  }

  /** method to draw an axis */
  draw3D_axis(data, axisType){
    let  strokecolor= "black"
    if(this.cfg.colored3dAxis){
      if(axisType.includes("x")){
        strokecolor = "red"
      }else if(axisType.includes("y")){
        strokecolor = "green"
      }else if(axisType.includes("z")){
        strokecolor = "blue"
      }
    }
  
    var scale = this.cell.svgSpace.selectAll("path.scale"+axisType).data(data);
    scale
    .enter()
    .append("path")
    .attr("class", "d3-3d scale"+axisType)
    .merge(scale)
    .attr("stroke", strokecolor)
    .attr("stroke-width", 1)
    .attr("d", this.scale3d_line.draw);
    scale.exit().remove();
    return scale
  }

  /** method to draw an axis name */
  draw3D_axisName(data, axisType){
    var strokecolor= "black"
    var name = ""
    if(axisType.includes("x")){
      strokecolor = "red"
      name = "xtype"
    }else if(axisType.includes("y")){
      strokecolor = "green"
      name = "ytype"
    }else if(axisType.includes("z")){
      strokecolor = "blue"
      name = "ztype"
    }
    var text = this.cell.svgSpace.selectAll("text.axisName"+axisType).data(data);
    text
    .enter()
    .append("text")
    .attr("class", "d3-3d axisName"+axisType)
    .merge(text)
    .style("color", strokecolor)
    .attr("x", function(d){return d.projected.x})
    .attr("y", function(d){return d.projected.y})
    .attr("d", this.scale3d_text.draw)
    .text(columnNames[this.cfg[name]]);
    return text
  }

  /** draws the values on an axis */
  draw3D_axisValues(data, axisType){
    var strokecolor= "black"
    if(axisType.includes("x")){
      strokecolor = "red"
    }else if(axisType.includes("y")){
      strokecolor = "green"
    }else if(axisType.includes("z")){
      strokecolor = "blue"
    }
    var text = this.cell.svgSpace.selectAll("text.valueName"+axisType).data(data);
    text
    .enter()
    .append("text")
    .attr("class", "d3-3d valueName"+axisType)
    .merge(text)
    .style("color", strokecolor)
    .attr("x", function(d){return d.projected.x})
    .attr("y", function(d){return d.projected.y})
    .attr("d", this.scale3d_text.draw)
    .text(function(d){return d.value.toFixed(1)});
  return text
  }

  /**draws a plane */
  draw3D_plane(data, gridType){
    var strokecolor= "black"
    if(this.cfg.colored3dAxis){
      if(gridType == "xy"){
        strokecolor = "orange"
      }else if(gridType=="yz"){
        strokecolor = "teal"
      }else if(gridType=="xz"){
        strokecolor = "purple"
      }
    }
    var grid = this.cell.svgSpace.selectAll("path.grid"+gridType).data(data);
      grid
        .enter()
        .append("path")
        .attr("class", "d3-3d grid"+gridType)
        .merge(grid)
        .attr("stroke", strokecolor)
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.5)
        .attr("fill", function(d){let ccw = d.ccw
          if(d.ccw && gridType == "xz" || !d.ccw && gridType !="xz"){
            return "#eee"
          }else{ return "#aaa"}})
        .attr("fill-opacity", 0.9)
        .attr("d",  this.scale3d_plane.draw)
      grid.exit().remove();
      return grid
  }

  /** create the dots  */
  create3dData(dataset,index){
    if(!this.cfg.activeData[index]){return;}
    if(!this.data3d){this.data3d = []}
    this.data3d[index] = this.projectData(dataset)
    this.data3d[index] = this.scale3d_dots.rotateY(this.startAngleY + this.beta ).rotateX(this.startAngleX + this.alpha)(this.data3d[index])
    let svgData = this.drawData(dataset,this.data3d[index], index)
    return svgData
  }

  /** triggered by create3dData to make data under the correct format */
  projectData(dataset){
    //find data 
    let data = dataset.data
    if(dataset.dataFiltered && dataset.dataFiltered.length){data = dataset.dataFiltered}
    let cfgData = dataset.cfg
    let xscale = this.cell.scales3D[0]
    let yscale = this.cell.scales3D[1]
    let zscale = this.cell.scales3D[2]
    let projData = [];
    for(let i=0; i<data.length; i++){
        projData.push({
            originalData: data[i],
            x: xscale(data[i][this.cfg.xtype]),
            y: yscale(data[i][this.cfg.ytype]),
            z: zscale(data[i][this.cfg.ztype]),
            intensity: data[i][config.intensity],
            color: data[i][cfgData.colorType],
            index: data[i].index
        })
    }
    return projData
  }

  /**draws the dots */
  drawData(dataset,data3d,index){
    if(!this.cfg.activeData[index]){return;}
    if(!this.svgData || !this.svgData.length){this.svgData = []}
    this.svgData[index] = this.cell.svgSpace.selectAll("circle.dotsDataNum"+index).data(data3d);
    this.svgData[index]
    .enter()
    .append("circle")
    .attr("class", "d3-3d dots dotsDataNum"+index)
    .merge(this.svgData[index])
    .attr("cx", (d)=>{return d.projected.x})
    .attr("cy", (d)=>{return d.projected.y})
    .attr("r",  (d)=>{ if(this.cfg.relativeSize){return this.cfg.dotSize*Math.sqrt(d.intensity)/config.sizeReductor;}else{return this.cfg.dotSize}})
    .style("fill", (d)=>{if(dataset.cfg.colorGradient == "solid"){return dataset.colorScale(0)}else{return dataset.colorScale(d.color)}})
    .attr("opacity", 1)
    .attr('tooltipHTML', (d,n) => {return "scatterPlot"+";"+index+";"+n})
      .on("mouseover", (d) => {this.cell.canvas.tooltip.mouseover(d)} )
      .on("mousemove",  (d,n) => {this.cell.canvas.tooltip.mousemove(d,"scatterPlot",n.originalData)}  )
      .on("mouseleave" ,  (d) => {this.cell.canvas.tooltip.mouseleave(d)}  )
      .on("click", (d,n) =>{this.cell.canvas.tooltip.mouseclick(d,"scatterPlot",n.originalData, this.cell)} );
    if(config.blackCircle){
      this.svgData[index].style("stroke", config.blackCircleColor || "#000000")
      this.svgData[index].style("stroke-width", config.blackCircleWidth || 1)
    }
    return this.svgData[index]
  }

  // drawData(dataset, index){
  //   if(dataset.length ==0){return;}
  //   cvsX.sideData[i].scatter3D = process3D_data(cvsX,cfgX,cellNum, i, cvsX.data[i]);
  //   var dataPoints = scale3d_dots.rotateY(startAngleY).rotateX(startAngleX)(cvsX.sideData[i].scatter3D );
  //   draw3D_data(cvsX, cfgX, cellNum,i, dataPoints)
  // }

}

/********************************************************************* */
/*                    MENU FONCTIONS                                   */
/********************************************************************* */


function menuCreate_checkbox(parentDiv, name, value){
  let checkbox = document.createElement("input")
  checkbox.setAttribute("type","checkbox")
  checkbox.setAttribute("name",name)
  if(value){checkbox.setAttribute("checked", true)}
  if(parentDiv){parentDiv.appendChild(checkbox)}
  return checkbox
}

function menuCreate_inputNumber(parentDiv, name, value, addAttributes){
  let input = document.createElement("input")
  input.setAttribute("type","number")
  input.setAttribute("name",name)
  input.setAttribute("value",value)
  if(addAttributes){
    for(let i=0; i<addAttributes.length; i++){
      if(addAttributes[i].isStyle){input.style[addAttributes[i].key] = addAttributes[i].value; continue;}
      input.setAttribute(addAttributes[i].key, addAttributes[i].value)
    }
  }
  if(parentDiv){parentDiv.appendChild(input)}
  return input
}

function menuCreate_inputText(parentDiv, name, value, addAttributes){
  let input = document.createElement("input")
  input.setAttribute("type","text")
  input.setAttribute("name",name)
  input.setAttribute("value",value)
  if(addAttributes){
    for(let i=0; i<addAttributes.length; i++){
      if(addAttributes[i].isStyle){input.style[addAttributes[i].key] = addAttributes[i].value; continue;}
      input.setAttribute(addAttributes[i].key, addAttributes[i].value)
    }
  }
  if(parentDiv){parentDiv.appendChild(input)}
  return input
}

function menuCreate_select(parentDiv, name, value, options){
  let select = document.createElement("select")
  select.setAttribute("name",name)
  select.style.maxWidth = "200px"
  let html_options = [];
  for(let i=0; i<options.length; i++){
    html_options[i] = document.createElement("option")
    html_options[i].setAttribute("value",options[i].value)
    html_options[i].innerHTML = options[i].name
    if(options[i].name == "SPLITTER"){
      html_options[i].innerHTML = "------------"
      html_options[i].setAttribute('disabled','')
    }
    if(options[i].style){html_options[i].setAttribute("style",options[i].style)}
    select.appendChild(html_options[i])
  }
  select.setAttribute("value",value)
  if(parentDiv){
    parentDiv.appendChild(select)
    if(parentDiv.querySelector("option[value='"+value+"']")){
      parentDiv.querySelector("option[value='"+value+"']").setAttribute("selected",true)
    }
  }
  return select
}

function menuCreate_button(parentDiv, name, text, fct, addAttributes){
  let button = document.createElement("button")
  button.setAttribute("name",name);
  button.innerHTML = text;
  button.addEventListener("click",fct)
  if(addAttributes){
    for(let i=0; i<addAttributes.length; i++){
      if(addAttributes[i].isStyle){button.style[addAttributes[i].key] = addAttributes[i].value; continue;}
      button.setAttribute(addAttributes[i].key, addAttributes[i].value)
    }
  }
  if(parentDiv){parentDiv.appendChild(button)}
  return button
}

function menuCreate_radio(parentDiv, name, value, options){
  let radio = document.createElement("input")
  radio.setAttribute("type","radio")
  radio.setAttribute("name",name)
  radio.setAttribute("value",value)
  if(options.radioCheck == value){radio.checked = true}
  if(parentDiv){parentDiv.appendChild(radio)}
  if(options){
    for(let i=0; i<options.length; i++){
      if(addAttributes[i].isStyle){input.style[addAttributes[i].key] = addAttributes[i].value; continue;}
      radio.setAttribute(options[i].key, options[i].value)
    }
  }
  return radio
}

function menuCreate_label(label, doBreak, styles){
   let span = document.createElement("span")
   span.textContent = label
   if(doBreak){
    span.appendChild(document.createElement("br"))
   }
   if (Array.isArray(styles)) {
    styles.forEach(style => {
        const [property, value] = style;
        span.style[property] = value;
    });
  }
  return span
}

function menuCreate_color(parentDiv, name, value, addAttributes){
  let input = document.createElement("input")
  input.setAttribute("type","text")
  input.setAttribute("name",name)
  input.setAttribute("value",value)
  input.setAttribute("data-coloris",value)
  input.style.color = "black";
  input.style.margin = "1px"
  input.setAttribute("class","coloris instance3")
  if(addAttributes){
    for(let i=0; i<addAttributes.length; i++){
      if(addAttributes[i].isStyle){input.style[addAttributes[i].key] = addAttributes[i].value; continue;}
      input.setAttribute(addAttributes[i].key, addAttributes[i].value)
    }
  }
  if(parentDiv){parentDiv.appendChild(input)}
  return input
}


function menuCreateInput(type,name,value, options){
  switch(type){
      case "number":
          return menuCreate_inputNumber(null,name, value,options)
      case "text":
          return menuCreate_inputText(null, name, value, options)
      case "checkbox":
          return menuCreate_checkbox(null, name, value)
      case "select":
          let select = menuCreate_select(null, name, value, options)
          select.value = value
          return select
      case 'selectCols':
          let select2 = menuCreate_select(null, name, value, [])
          createSelectOptions(select2)
          select2.value = value
          return select2
      case 'selectFile':
          let select3 = menuCreate_select(null, name, value, [])
          createDataOptions(select3)
          select3.value = value
          return select3
      case 'button':
        return menuCreate_button(null, name, value, options.fct, options.attributes)
      case 'radio':
        return menuCreate_radio(null, name, value, options)
      case 'color':
        return menuCreate_color(null, name, value, options)
  }
}

/** makes a horizontal bar, small, medium, large or largest */
function menuCreateSeparator(size){
  let sep = document.createElement("hr")
  switch (size) {
    case 'small':
      sep.style.borderTop = '0px dotted ';
      sep.style.width = '50%';
      break;
    case 'medium':
      sep.style.borderTop = '0px dashed ';
      sep.style.width = '75%';
      break;
    case 'large':
      sep.style.borderTop = '1px solid ';
      sep.style.width = '90%';
      break;
    case 'largest':
      sep.style.borderTop = '1px solid ';
      sep.style.width = '100%';
      break;
    default:
      console.warn('Invalid size. Please choose small, medium, large, or extra-large.');
      sep.style.height = '2px';
      sep.style.width = '75%'; // Default to medium if no valid size is passed
  }
  
  return sep;
}



/********************************************************************* */
/*                 TOOLTIP HANDLING                                    */
/********************************************************************* */


/**creates the functions for the tooltips */
function createTooltipFunctions(cfgX){
  var mainCfgCanvas = cfgX.main
  mainCfgCanvas.functions = {};
  mainCfgCanvas.functions.mouseover = function(d) {
      mainCfgCanvas.tooltip.style("opacity", 1)
      d3.select(this).style("opacity", 1)
  }
  mainCfgCanvas.functions.mousemove = function(d) {
      if (this.getAttribute('class')=='tohide' || this.getAttribute('class')=='tohide2'){return};
      mainCfgCanvas.tooltip
        .html(buildTooltipText(this.getAttribute('tooltipHTML'),cfgX.letter)) //gathers tooltip data and builds the text
        .style("left", event.pageX+10 ) 
        .style("top", event.pageY+10 )

      drawTooltipPieChart(cfgX.letter, this, mainCfgCanvas.tooltip)
  }
  mainCfgCanvas.functions.mouseleave = function(d) {
      var cellNum = this.farthestViewportElement?parseInt(this.farthestViewportElement.id.slice(4)):null
      var opacity = cfgX.main.opacity
      if(cfgX.canvas && cfgX.canvas[cellNum]){
          if(cfgX.canvas[cellNum].type == "histogram"|| cfgX.canvas[cellNum].type == "histogramMatrix" ||cfgX.canvas[cellNum].type == "density"||cfgX.canvas[cellNum].type == "histoclass"|| cfgX.canvas[cellNum].type == "histodiscrete"){opacity = 1}
      }
      mainCfgCanvas.tooltip
        .style("opacity", 0)
        .style("left", -1000 ) //resets its position so that it is not over other points
        .style("top", -1000 )
      d3.select(this)
        .style("opacity", opacity)
    }
  mainCfgCanvas.functions.mouseclick = function(d) {
      if(!event.ctrlKey){
        return;
      }
      //highlights the selected dot
      d3.select(this).style("stroke", "black")
      d3.select(this).style("stroke-dasharray", "6 1")
      d3.select(this).style("stroke-dashoffset", "100")
      d3.select(this).style("animation", "dash 20s linear infinite")
      d3.select(this).style("stroke-width", "10")
      if(debug){console.log(d, this)}
      //get the id of the cell from which it comes from
      var cellID = this.ownerSVGElement.getAttribute("id")
      if(debug){console.log(cellID)}
      mainCfgCanvas.tooltipClick.style("opacity", 1)
      mainCfgCanvas.tooltipClickClose.style("opacity",1)
      d3.select(this)
        .style("opacity", 1)
      if (this.getAttribute('class')=='tohide' || this.getAttribute('class')=='tohide2'){return};
      mainCfgCanvas.tooltipClick
        .html(buildTooltipText(this.getAttribute('tooltipHTML'),cfgX.letter)) //recupère l'attribut formule du point
        .style("left", event.pageX+10 ) 
        .style("top", event.pageY+10 )
        mainCfgCanvas.tooltipClickClose.attr("cellid",cellID).style("left", event.pageX+290 ).style("top", event.pageY+10 )
    
        drawTooltipPieChart(cfgX.letter, this, mainCfgCanvas.tooltipClick)
      }
  mainCfgCanvas.functions.closeTooltip = function(d) {
      mainCfgCanvas.tooltipClick.style("opacity",0).style("left", -200 ).style("top", -200 )
      mainCfgCanvas.tooltipClickClose.style("opacity",0).style("left", -200 ).style("top", -200 )
      //finds the highlighted chart and refresh it
      var cellID = this.getAttribute("cellid")
      if(!cellID){return;}
      var id = cellID.slice(4)
      var cvsX = findCvs(cfgX.letter)
      if(cfgX.letter == "A"||cfgX.letter == "B"){
          createCell(cfgX.letter, id, cfgX.canvas[id].type)
          for(let i=0; i<cfgX.data.length; i++){
              drawDataSet(cfgX.letter, id, i, cvsX.data[i])
          }
      }
    }
}

/**create the html divs for the tooltips */
function createTooltips(cfgX, mainCanvasID, tooltipNAME){
  var mainCfgCanvas = cfgX.main
  var tooltips = document.querySelector(mainCanvasID).querySelectorAll('div[name="'+tooltipNAME+'"]')
  for(let i=tooltips.length-1; i>0; i--){
      tooltips[i].remove()
  }
  mainCfgCanvas.tooltip = appendTooltip("#tooltip_canvas"+cfgX.letter,"tooltip")
  mainCfgCanvas.tooltipClick = appendTooltip("#tooltip_canvas"+cfgX.letter,"tooltip_click")
  mainCfgCanvas.tooltipClickClose = appendTooltip("#tooltip_canvas"+cfgX.letter,"tooltip_click")
  mainCfgCanvas.tooltipClickClose.html("X").style("width","20px").on("click",mainCfgCanvas.functions.closeTooltip)
}



/** build a tooltip for a dataPoint */
function buildTooltipData(type, cvsLetter, data,nb, dataNum, cellNum,suppData){
  //find the tab
  var cfgX = findCfg(cvsLetter)
  var cvsX = findCvs(cvsLetter)

  let dataSupp = {}
  var lines=[]
  if(type =="histogram" || type =="histogramSel"){
      //count the total intensity of this bin
      var binIntensity = 0
      for(let i=0; i<data.length; i++){
          if(data[i]){binIntensity += parseInt(data[i][config.intensity])}
      }
      dataSupp.x0 = data.x0
      dataSupp.x1 = data.x1
      dataSupp.length = data.length
      dataSupp.binI = binIntensity
      dataSupp.barNum = nb
      dataSupp.cellNum = cellNum
      dataSupp.maxI = suppData[0]
      dataSupp.maxN = suppData[1] 
  }
  if(type =="histogramMatrix"){
      //count the total intensity of this bin
      dataSupp.x0 = data.x0
      dataSupp.x1 = data.x1
      dataSupp.length = data.length
      dataSupp.binI = binIntensity
      dataSupp.barNum = nb
      dataSupp.cellNum = cellNum
      dataSupp.meanN = suppData[0]
      dataSupp.devN = suppData[1]
      dataSupp.meanI = suppData[2]
      dataSupp.devI = suppData[3]
  }
  if(type =="density"){
      //nb[0] is the column, nb[1] the line
      var cfg = cfgX.canvas[cellNum]
      var col = cvsX.sideData[dataNum].density[cellNum][nb[0]]
      dataSupp.xName = columnNames[cfg.xtype]
      dataSupp.yName = columnNames[cfg.ytype]
      dataSupp.x0 = col.x0
      dataSupp.x1 = col.x1
      dataSupp.y0 = data.y0
      dataSupp.y1 = data.y1
      dataSupp.length = data.length
      dataSupp.maxN = cvsX.data[dataNum].length
      dataSupp.barNumX = nb[0]
      dataSupp.barNumY = nb[1]
      dataSupp.cellNum = cellNum

  }if(type =="histogramClass" || type =="histogramClassSel" || type =="histogramDiscrete" || type =="histogramDiscreteSel"){
      //count the total intensity of this bin
      var binIntensity = 0
      for(let i=0; i<data.length; i++){
          if(data[i]){binIntensity += parseInt(data[i][config.intensity])}
      }
      dataSupp.x0 = data.x0
      dataSupp.x1 = data.x1
      dataSupp.length = data.length
      dataSupp.binI = binIntensity
      dataSupp.barNum = nb
      dataSupp.cellNum = cellNum
      dataSupp.maxI = suppData[0]
      dataSupp.maxN = suppData[1] 
      dataSupp.name = data.name
  }

  let stringData = JSON.stringify(dataSupp)
  let textLine = type+";"+dataNum+";"+stringData

  //find what to do with this
  if(type == "networkLink"){
      lines[0]= data.formula
  }

  return textLine
}

/** builds the text of a tooltip based on what is given. Txt must be splitted by ;. If the first value is ALREADYHTML, the rest will be displayed normally. If not, data will be computed */
function buildTooltipText(txt, cvsLetter){
  //regex the reference txt. Metadata[0] is the type of chart,  [1] is dataset number, [2] is peak data or histogram data
  let metaData = txt.split(";")
  //skips everything if ALREADYHTML
  if(metaData[0]=="ALREADYHTML"){return metaData[1]}
  let cfgX = findCfg(cvsLetter)
  let cvsX = findCvs(cvsLetter)
  
  let type = metaData[0]
  let dataNum = metaData[1]
  let suppData = metaData[2]

  //find file
  let file = {}
  if(dataNum == "stat"){
      file = cvsStat.data
  }else if(dataNum == "network"){
      file = cvsN.data
  }else if(dataNum == "pca"){
      file = cvsPCA.data
  }else{
      let dataString = cfgX.data[dataNum].dataString
      file = linkFileFromDataString(dataString)
  }
  let data = []
  let lines=[]
  if(type =="scatterPlot" || type=="massSpectra" || type =="kendrick" || type=="kendrick2D"){
   data = file[suppData]
  }
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
  }if(type =="kendrick" || type=="kendrick2D"){
      lines[0] = "formula :"+(cleanFormula)+" <button class='databaseSearch' onclick='seekDataBasePopup(`"+data[config.formulatext]+"`)'> search DB </button>"
      lines[1] = "m/z :"+(data[config.mz] || "")+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data[config.mz]+"`)'> show formulae </button>"
      lines[2] = "ppm error :"+(parseFloat(data[config.ppmerror]).toFixed(6) || "")+"<button class='databaseSearch' onclick='popupAddToCalibList(`"+data[config.formulatext]+"`)'> Add to calibration list </button>"
      let lineNb = 3
      for(let i=0; i<cvsX.sideData[dataNum].kendrick.length; i++){
          if(cvsX.sideData[dataNum].kendrick[i] && cfgX.canvas[i].type =="kendrick"){
              if(cvsX.sideData[dataNum].kendrick[i].length == 0 ){continue;}
              if(cvsX.sideData[dataNum].kendrick[i][suppData]){
                  lines[lineNb]  = config.kendrickText+"("+cfgX.canvas[i].kendrickFormula+") :"+parseFloat(cvsX.sideData[dataNum].kendrick[i][suppData][1]).toFixed(5)
                  lineNb +=1
              }
          }
      }
      if(config.customTooltipData.length>0){
       lines[lineNb] = "----------"
       lineNb +=1
      }
      for(let i=0; i<config.customTooltipData.length; i++){
      lines[lineNb+i] = columnNames[config.customTooltipData[i]] + ":"+data[config.customTooltipData[i]]
      }
  }if(type =="histogram" || type == "histogramSel"){
      let histData = JSON.parse(suppData)
      //count the total intensity of this bin
      var binIntensity = 0
      for(let i=0; i<data.length; i++){
          if(data[i]){binIntensity += parseInt(data[i][config.intensity])}
      }
      lines[0] = "["+histData.x0 + ";" + histData.x1+"["+"<button class='databaseSearch' onclick='copyHistogramBarData(`"+cfgX.letter+"`,"+histData.cellNum+","+dataNum+","+histData.barNum+","+"`bins`"+")'> copy data </button>"
      lines[1] = "[VARIABLE]-[NUMBER]-[%]"
      lines[2] = "nb of occurences - "+histData.length + " - " + parseFloat(100*histData.length/histData.maxN).toFixed(1) +"%"
      lines[3] = "total intensity - "+histData.binI + " - "+ parseFloat(100*histData.binI/histData.maxI).toFixed(1) +"%"
      if(type == "histogramSel"){lines.push("CURRENT SELECTION")}
  }if(type =="histogramMatrix"){
      let histData = JSON.parse(suppData)
      lines[0] = "["+histData.x0 + ";" + histData.x1+"["+"<button class='databaseSearch' onclick='copyHistogramBarData(`"+cfgX.letter+"`,"+histData.cellNum+","+dataNum+","+histData.barNum+","+"`bins`"+")'> copy data </button>"
      lines[1] = "[VARIABLE]-[MEAN]-[STD DEV]"
      lines[2] = "relative number of peaks (%) - " + histData.meanN.toFixed(1) +"% -"+histData.devN.toFixed(1)
      lines[3] = "relative intensity (%) - "+ histData.meanI.toFixed(1) +"% -"+histData.devI.toFixed(1)
  }if(type =="histogramClass" || type =="histogramClassSel"){
      let histData = JSON.parse(suppData)
      lines[0]= histData.name + "<button class='databaseSearch' onclick='copyHistogramBarData(`"+cfgX.letter+"`,"+histData.cellNum+","+dataNum+","+histData.barNum+","+"`classesData`"+")'> copy data </button>"
      lines[1] = "nb of occurences - "+histData.length + " - " + parseFloat(100*histData.length/histData.maxN).toFixed(1) +"%"
      lines[2] = "total intensity - "+histData.binI + " - "+ parseFloat(100*histData.binI/histData.maxI).toFixed(1) +"%"
      if(type == "histogramClassSel"){lines.push("CURRENT SELECTION")}
  }if(type =="histogramDiscrete" || type =="histogramDiscreteSel"){
      let histData = JSON.parse(suppData)
      lines[0]= histData.name + "<button class='databaseSearch' onclick='copyHistogramBarData(`"+cfgX.letter+"`,"+histData.cellNum+","+dataNum+","+histData.barNum+","+"`catData`"+")'> copy data </button>"
      lines[1] = "nb of occurences - "+histData.length + " - " + parseFloat(100*histData.length/histData.maxN).toFixed(1) +"%"
      lines[2] = "total intensity - "+histData.binI + " - "+ parseFloat(100*histData.binI/histData.maxI).toFixed(1) +"%"
  }if(type =="density"){
      let histData = JSON.parse(suppData)
      lines[0] = histData.xName +" : ["+parseFloat(histData.x0).toFixed(2)+" - "+parseFloat(histData.x1).toFixed(2)+"["
      lines[1] = histData.yName +" : ["+parseFloat(histData.y0).toFixed(2)+" - "+parseFloat(histData.y1).toFixed(2)+"["
      lines[2] = "#attributions:"+histData.length+" ("+(parseFloat(100*histData.length/ histData.maxN).toFixed(1))+"%)"+"<button class='databaseSearch' onclick='copyDensityData(`"+cfgX.letter+"`,"+histData.cellNum+","+dataNum+","+histData.barNumX+","+histData.barNumY+")'> copy data </button>"

  }if(type=="networkLink"){
      lines[0] = suppData
  }if(type=="pca"){
      lines[0] = suppData
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

/********************************************************************* */
/*                 OTHER CANVAS FUNCTIONS                              */
/********************************************************************* */

/** a function to return the cvs based on the letter given*/
function findCvs(cvsLetter){
  if(cvsLetter =="A"){
      return cvsA
  }else if(cvsLetter =="B"){
      return cvsB
  }else if(cvsLetter == "C"){
      return cvsC
  }else if(cvsLetter == "PCA"){
      return cvsPCA
  }else if(cvsLetter == "N"){
      return cvsN
  }else if(cvsLetter == "Attrib"){
      return cvsAttrib
  }
}
/** a function that returns the cfg data of a canvas when given the letter of the canvas */
function findCfg(cvsLetter){
  if(cvsLetter =="A"){
      return cfgA
  }else if(cvsLetter =="B"){
      return cfgB
  }else if(cvsLetter == "C"){
      return cfgC
  }else if(cvsLetter == "N"){
      return cfgN
  }else if(cvsLetter == "Attrib"){
      return cfgAttribDraw
  }
}