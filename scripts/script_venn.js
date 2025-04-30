///This file handles the data processing and drawing of Venn diagrams
//warning : TODO 
//for now Venn intersections are called AuB, AuC... they should be named AnB, AnC to correctly designate what they represent
//this will be done when this part will be refactored

document.getElementById("VennNumber").addEventListener("change", drawVennChoices);
document.getElementById("vennChoices").addEventListener("change", drawVenn);

//contains the names of the datasets
var datasetsNames = [];



updateVennFileChoice();
createBlendMixOptions();


/**creates or updates the names of the files proposed to the selection */
function updateVennFileChoice(){
    for(let i=0; i<nameslist.length+1; i++){
        var numberVenn = i
        var nameVenn = "VennFile_"+ numberVenn
        var selectedVennChoice = document.getElementById(nameVenn)
        //delete previous options
        if(selectedVennChoice != null && selectedVennChoice.options != null){
            for(let j=selectedVennChoice.options.length-1; j>=0; j--) { //backward for to remove all options
                selectedVennChoice.remove(j);
            }
            //Create and append the options
            for (var j = 0; j < nameslist.length; j++) {
                var option = document.createElement("option");
                option.value = j+1;
                option.text = nameslist[j];
                selectedVennChoice.appendChild(option);
                selectedVennChoice.value = i //select the option number by default
            }
        }
    }
}

/**puts the options for the intensity */
function drawIntensityOptions(numberOfCircles){
    var selecter = document.getElementById("Venn_intensity")
    //delete previous options
    if(selecter.options != null){
        for(let j=selecter.options.length-1; j>=0; j--) { //backward for to remove all options
            selecter.remove(j);
        }
    }
    var option1 = document.createElement("option");
    option1.value = "average";
    option1.text = "Average of files";
    selecter.appendChild(option1);

    for (let i=0; i<numberOfCircles; i++){
        var option = document.createElement("option");
        option.value = i+1;
        option.text = "Intensity of file n°"+(i+1);
        selecter.appendChild(option);
    }

}
drawIntensityOptions()
document.getElementById("vennGraphicsTable").addEventListener("change", readVennDataTable);

/** function triggered  when there is an update of the graphical options for the venn diagram*/
function readVennDataTable(){
    cfgVenn.files[0] = document.getElementById("VennFile_1").value-1
    cfgVenn.files[1] = document.getElementById("VennFile_2").value-1
    cfgVenn.files[2] = document.getElementById("VennFile_3").value-1
    cfgVenn.files[3] = document.getElementById("VennFile_4").value-1
    cfgVenn.colors[0] = document.getElementById("VennColor_1").value
    cfgVenn.colors[1] = document.getElementById("VennColor_2").value
    cfgVenn.colors[2] = document.getElementById("VennColor_3").value
    cfgVenn.colors[3] = document.getElementById("VennColor_4").value
    cfgVenn.opacity = parseFloat(document.getElementById("VennOpacity").value)/100
    cfgVenn.blendmix = document.getElementById("VennBlendMix").value
    cfgVenn.outline = document.getElementById("vennOutline").checked


    drawVenn()
}

/** a function to set the Venn Data values to what has been saved */
function setVennDataTable(){
    document.getElementById("VennFile_1").value = cfgVenn.files[0]+1
    document.getElementById("VennFile_2").value = cfgVenn.files[1]+1
    document.getElementById("VennFile_3").value = cfgVenn.files[2]+1
    document.getElementById("VennFile_4").value = cfgVenn.files[3]+1
    document.getElementById("VennColor_1").value = cfgVenn.colors[0]
    document.getElementById("VennColor_2").value = cfgVenn.colors[1]
    document.getElementById("VennColor_3").value = cfgVenn.colors[2]
    document.getElementById("VennColor_4").value = cfgVenn.colors[3]
    document.getElementById("VennOpacity").value = cfgVenn.opacity*100
    document.getElementById("VennBlendMix").value = cfgVenn.blendmix
    document.getElementById("vennOutline").value = cfgVenn.outline 
}

/** a function to create the option of color blend mix */
function createBlendMixOptions(){
    var selectedVennChoice = document.getElementById("VennBlendMix")
    //delete previous options
    if(selectedVennChoice != null && selectedVennChoice.options != null){
        for(let j=selectedVennChoice.options.length-1; j>=0; j--) { //backward for to remove all options
            selectedVennChoice.remove(j);
        }
        //Create and append the options
        var optionsText=["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"]
        for (var j = 0; j < optionsText.length; j++) {
            var option = document.createElement("option");
            option.value = optionsText[j];
            option.text = optionsText[j];
            selectedVennChoice.appendChild(option);
            selectedVennChoice.value = cfgVenn.blendmix //select the option number by default
        }
    }
}

/*-----------------------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------------------------*/
  // create a tooltip to display informations on mouse hover
  var tooltipVenn = appendTooltip("#tooltipVenn", "tooltip_venn")
  var tooltip_click = appendTooltip("#tooltipVenn", "tooltip_click")
  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltipVenn
      .style("opacity", 1)
    d3.select(this)
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltipVenn
      .html(this.getAttribute('toolinfo')) //catches the data
      .style("left", event.pageX+10 ) 
      .style("top", event.pageY+10 )
  }
  var mouseleave = function(d) {
    tooltipVenn
      .style("opacity", 0)
      .style("left", -200 ) //resets its position so that is does not stay over other elements
      .style("top", -200 )
    d3.select(this)
      .style("opacity", 1)
      
  }
  /**display a fixed tooltip when ctrl is pressed*/
   mouseclick = function(d) {
    if(!d.ctrlKey){return;}
    tooltip_click
      .style("opacity", 1)
      .html(function(){
        if(d.originalTarget){return d.originalTarget.getAttribute('toolinfo')}
        else{return d.srcElement.getAttribute('toolinfo')}
        })
      .style("left", event.pageX+10 ) 
      .style("top", event.pageY+10 )
    tooltip_clickClose.style("left", event.pageX+240 ).style("top", event.pageY+10 ).style("opacity",1)
  }
  var closeTooltip = function(d) {
    tooltip_click.style("opacity",0).style("left", -200 ).style("top", -200 )
    tooltip_clickClose.style("opacity",0).style("left", -200 ).style("top", -200 )

  }

  var tooltip_clickClose = appendTooltip("#tooltipVenn","tooltip_clickClose")
  tooltip_clickClose.html("X").style("width","20px").on("click",closeTooltip)
 

/*-----------------------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------------------------*/

/** function for drawing the choices for the intensity selecter */
function drawVennChoices(){
    cfgVenn.circleNb = document.getElementById("VennNumber").value
    drawIntensityOptions(cfgVenn.circleNb)
    drawVenn()
};


/** drawing of the Venn diagram */
function drawVenn(){  
  document.getElementById("VennNumber").value = cfgVenn.circleNb || 0
  //closes any pending tooltip 
  if(tooltip_clickClose){
        if(typeof tooltip_clickClose.selectAll == "function"){ tooltip_clickClose.selectAll("div")._parents[0].click()}
  }
  //cleans the old canvas and draws a new one
  d3.select("#VennCanvas").remove()
  var canvasGroup =  document.querySelector("#topVenn");
  var newCanvas = document.createElement("div");
  newCanvas.id = "VennCanvas";
  canvasGroup.appendChild(newCanvas);

  //gets the data on how to make the comparaison between datasets
  var comparaisonType = document.getElementById("Venn_comparaisonData").value;
  var columnComparaison = 0;
  var ppmTolerance = parseFloat(document.getElementById("Venn_ppmTolerance").value);
  document.getElementById("Venn_ppmTolerance_div").style.display = "none"

    //warns the user if the file comparaison is made on chemical formula and not on ion formula
    if(document.querySelector("p[name='warningFormulaVenn']")){
        document.querySelector("p[name='warningFormulaVenn']").remove()
    }
    if(comparaisonType == "formula" && columnNames[config.formulatext] != "" && (columnNames[config.formulatext] == "Formula"|| ( columnNames[config.formulatext] && columnNames[config.formulatext].includes("chemical")))){
        document.getElementById('Venn_intensity_div').innerHTML += "<p name='warningFormulaVenn' style='color:#ff7979;'>Warning ! you may be comparing files on a chemical formula and not an ion formula. Errors will be induced if different adducts exist for this formula </p>"
    }
  if (comparaisonType == "formula"){columnComparaison = config.formulatext}
  if (comparaisonType == "mass"){
    columnComparaison = config.mz
    document.getElementById("Venn_ppmTolerance_div").style.display = "block"  
  }

  document.getElementById("VennCanvas").style.isolation = "isolate"

  //draws the svg space of the venn diagram
  var vennPlot = d3.select("#VennCanvas")
  .append("svg")
    .attr("width", config.width*2)
    .attr("height", config.height*1.5)
  .append("g")
  .attr("transform",
          "translate(" + 2*config.margin.left + "," + 2*config.margin.top + ")")
  .style("isolation","isolate");

  cfgVenn.circleNb = parseInt(document.getElementById("VennNumber").value)
  numberOfCircles = cfgVenn.circleNb



  //drawing of the venn diagram if only two data sets are to be represented
  if(numberOfCircles == 2){
      //calculates the common points of the two sets
      var newData = datasetComparaison_2(fileData[cfgVenn.files[0]],fileData[cfgVenn.files[1]],columnComparaison, ppmTolerance)
      newData.AuB[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
      newData.AuB[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
      if(debug){console.log(newData)}

      var circle_1 = vennPlot.append("circle")
        .attr("cx", 100 ) 
        .attr("cy", 100 ) 
        .attr("r", 100) 
        .style("mix-blend-mode", cfgVenn.blendmix)
        .style("opacity", cfgVenn.opacity)
        .style("fill", cfgVenn.colors[0])

      var circle_2 = vennPlot.append("circle")
        .attr("cx", 200 ) 
        .attr("cy", 100 ) 
        .attr("r", 100) 
        .style("mix-blend-mode", cfgVenn.blendmix)
        .style("opacity", cfgVenn.opacity)
        .style("fill", cfgVenn.colors[1])

      var circle_1_name = vennPlot.append("text").attr("x",-50).attr("y",50).attr("text-anchor","middle").text(nameslist[cfgVenn.files[0]])
      var circle_2_name = vennPlot.append("text").attr("x",350).attr("y",50).attr("text-anchor","middle").text(nameslist[cfgVenn.files[1]])

      if(cfgVenn.outline){
        circle_1.attr("stroke","black").attr("stroke-width","2")
        circle_2.attr("stroke","black").attr("stroke-width","2")
      }

      //handles the text creation for the tooltips
      toolText= {};
      toolText.A = tooltipTextFraction_1set(newData.A, cfgVenn.files[0])
      toolText.B = tooltipTextFraction_1set(newData.B, cfgVenn.files[1])
      toolText.AuB = tooltipTextFraction_2sets(newData.AuB, cfgVenn.files[0], cfgVenn.files[1])


      datasetsNames = []//cleans datasetsNames
      datasetsNames[0] = vennPlot.append("text").attr("x",50).attr("y",100).attr("class","vennText").attr("text-anchor","middle").text(newData.A.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.A,"A",0)})
      .attr("toolinfo",toolText.A).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
      datasetsNames[1] = vennPlot.append("text").attr("x",250).attr("y",100).attr("class","vennText").attr("text-anchor","middle").text(newData.B.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.B,"B",1)})
      .attr("toolinfo",toolText.B).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
      datasetsNames[2] = vennPlot.append("text").attr("x",150).attr("y",100).attr("class","vennText").attr("text-anchor","middle").text(newData.AuB.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuB,"AuB",2)})
      .attr("toolinfo",toolText.AuB).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );  
        //the -1 is to compensante for the title line

  }
  if(numberOfCircles == 3){
        //calculates the common points of the two sets
        var newData = datasetComparaison_3(fileData[cfgVenn.files[0]],fileData[cfgVenn.files[1]], fileData[cfgVenn.files[2]], columnComparaison, ppmTolerance)
        newData.AuB[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
        newData.AuB[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
        newData.AuC[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
        newData.AuC[0].push("Intensity_"+nameslist[cfgVenn.files[2]])
        newData.BuC[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
        newData.BuC[0].push("Intensity_"+nameslist[cfgVenn.files[2]])
        newData.AuBuC[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
        newData.AuBuC[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
        newData.AuBuC[0].push("Intensity_"+nameslist[cfgVenn.files[2]])

        var circle_1 = vennPlot.append("circle")
        .attr("cx", 100 ) 
        .attr("cy", 100 ) 
        .attr("r", 100) 
        .style("opacity", cfgVenn.opacity)
        .style("mix-blend-mode", cfgVenn.blendmix)
        .style("fill", cfgVenn.colors[0])

        var circle_2 = vennPlot.append("circle")
        .attr("cx", 200 ) 
        .attr("cy", 100 ) 
        .attr("r", 100) 
        .style("opacity", cfgVenn.opacity)
        .style("mix-blend-mode", cfgVenn.blendmix)
        .style("fill", cfgVenn.colors[1])

        var circle_3=vennPlot.append("circle")
        .attr("cx", 150 ) 
        .attr("cy", 200 ) 
        .attr("r", 100) 
        .style("opacity", cfgVenn.opacity)
        .style("mix-blend-mode", cfgVenn.blendmix)
        .style("fill", cfgVenn.colors[2])
        
        if(cfgVenn.outline){
            circle_1.attr("stroke","black").attr("stroke-width","2")
            circle_2.attr("stroke","black").attr("stroke-width","2")
            circle_3.attr("stroke","black").attr("stroke-width","2")
        }

        var circle_1_name = vennPlot.append("text").attr("x",-50).attr("y",50).attr("text-anchor","middle").text(nameslist[cfgVenn.files[0]])
        var circle_2_name = vennPlot.append("text").attr("x",350).attr("y",50).attr("text-anchor","middle").text(nameslist[cfgVenn.files[1]])
        var circle_3_name = vennPlot.append("text").attr("x",150).attr("y",320).attr("text-anchor","middle").text(nameslist[cfgVenn.files[2]])

        
        //handles the text creation for the tooltips
        toolText= {};
        toolText.A = tooltipTextFraction_1set(newData.A, cfgVenn.files[0])
        toolText.B = tooltipTextFraction_1set(newData.B, cfgVenn.files[1])
        toolText.C = tooltipTextFraction_1set(newData.C, cfgVenn.files[2])
        toolText.AuB = tooltipTextFraction_2sets(newData.AuB, cfgVenn.files[0], cfgVenn.files[1])
        toolText.AuC = tooltipTextFraction_2sets(newData.AuC, cfgVenn.files[0], cfgVenn.files[2])
        toolText.BuC = tooltipTextFraction_2sets(newData.BuC, cfgVenn.files[1], cfgVenn.files[2])
        toolText.AuBuC = tooltipTextFraction_3sets(newData.AuBuC, cfgVenn.files[0], cfgVenn.files[1], cfgVenn.files[2])

        datasetsNames = []//cleans datasetsNames
        datasetsNames[0] = vennPlot.append("text").attr("x",60).attr("y",90).attr("class","vennText").attr("text-anchor","middle").text(newData.A.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.A,"A",0)})
        .attr("toolinfo",toolText.A).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[1] = vennPlot.append("text").attr("x",240).attr("y",90).attr("class","vennText").attr("text-anchor","middle").text(newData.B.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.B,"B",1)})
        .attr("toolinfo",toolText.B).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[2] = vennPlot.append("text").attr("x",150).attr("y",80).attr("class","vennText").attr("text-anchor","middle").text(newData.AuB.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuB,"AuB",2)})
        .attr("toolinfo",toolText.AuB).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[3] = vennPlot.append("text").attr("x",150).attr("y",240).attr("class","vennText").attr("text-anchor","middle").text(newData.C.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.C,"C",3)})
        .attr("toolinfo",toolText.C).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[4] = vennPlot.append("text").attr("x",90).attr("y",170).attr("class","vennText").attr("text-anchor","middle").text(newData.AuC.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuC,"AuC",4)})
        .attr("toolinfo",toolText.AuC).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[5] = vennPlot.append("text").attr("x",210).attr("y",170).attr("class","vennText").attr("text-anchor","middle").text(newData.BuC.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.BuC,"BuC",5)})
        .attr("toolinfo",toolText.BuC).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[6] = vennPlot.append("text").attr("x",150).attr("y",140).attr("class","vennText").attr("text-anchor","middle").text(newData.AuBuC.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuBuC,"AuBuC",6)})
        .attr("toolinfo",toolText.AuBuC).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        //the -1 is to compensante for the title line

    }
    if(numberOfCircles == 4){
       // calculates the common points of the two sets
        var newData = datasetComparaison_4(fileData[cfgVenn.files[0]],fileData[cfgVenn.files[1]], fileData[cfgVenn.files[2]],fileData[cfgVenn.files[3]], columnComparaison, ppmTolerance)
        newData.AuB[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
        newData.AuB[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
        newData.AuC[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
        newData.AuC[0].push("Intensity_"+nameslist[cfgVenn.files[2]])
        newData.BuC[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
        newData.BuC[0].push("Intensity_"+nameslist[cfgVenn.files[2]])
        newData.AuD[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
        newData.AuD[0].push("Intensity_"+nameslist[cfgVenn.files[3]])
        newData.BuD[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
        newData.BuD[0].push("Intensity_"+nameslist[cfgVenn.files[3]])
        newData.CuD[0].push("Intensity_"+nameslist[cfgVenn.files[2]])
        newData.CuD[0].push("Intensity_"+nameslist[cfgVenn.files[3]])
        newData.AuBuC[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
        newData.AuBuC[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
        newData.AuBuC[0].push("Intensity_"+nameslist[cfgVenn.files[2]])
        newData.AuBuD[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
        newData.AuBuD[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
        newData.AuBuD[0].push("Intensity_"+nameslist[cfgVenn.files[3]])
        newData.AuCuD[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
        newData.AuCuD[0].push("Intensity_"+nameslist[cfgVenn.files[2]])
        newData.AuCuD[0].push("Intensity_"+nameslist[cfgVenn.files[3]])
        newData.BuCuD[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
        newData.BuCuD[0].push("Intensity_"+nameslist[cfgVenn.files[2]])
        newData.BuCuD[0].push("Intensity_"+nameslist[cfgVenn.files[3]])
        newData.AuBuCuD[0].push("Intensity_"+nameslist[cfgVenn.files[0]])
        newData.AuBuCuD[0].push("Intensity_"+nameslist[cfgVenn.files[1]])
        newData.AuBuCuD[0].push("Intensity_"+nameslist[cfgVenn.files[2]])
        newData.AuBuCuD[0].push("Intensity_"+nameslist[cfgVenn.files[3]])
        
        var ellipse_1 = vennPlot.append("ellipse")
        .attr("cx", 0 ) 
        .attr("cy", 0 ) 
        .attr("rx", 150 )
        .attr("ry", 70 ) 
        .attr("transform","translate(100,150) rotate(42)")
        .style("opacity", cfgVenn.opacity)
        .style("mix-blend-mode", cfgVenn.blendmix)
        .style("fill", cfgVenn.colors[0])

        var ellipse_2 = vennPlot.append("ellipse")
        .attr("cx", 0 ) 
        .attr("cy", 0 ) 
        .attr("rx", 150 )
        .attr("ry", 70 ) 
        .attr("transform","translate(140,150) rotate(-42)")
        .style("opacity", cfgVenn.opacity)
        .style("mix-blend-mode", cfgVenn.blendmix)
        .style("fill", cfgVenn.colors[1])

        //x and y offset from ellipse 1: 20px (x neg, y pos)
        var ellipse_3 = vennPlot.append("ellipse")
        .attr("cx", 0 ) 
        .attr("cy", 0 ) 
        .attr("rx", 150 )
        .attr("ry", 70 ) 
        .attr("transform","translate(45,200) rotate(42)")
        .style("opacity", cfgVenn.opacity)
        .style("mix-blend-mode", cfgVenn.blendmix)
        .style("fill", cfgVenn.colors[2])

        //x and y offset from ellipse 1: 20px (x pos, y pos)
        var ellipse_4 = vennPlot.append("ellipse")
        .attr("cx", 0 ) 
        .attr("cy", 0 ) 
        .attr("rx", 150 )
        .attr("ry", 70 ) 
        .attr("transform","translate(195,200) rotate(-42)")
        .style("opacity", cfgVenn.opacity)
        .style("mix-blend-mode", cfgVenn.blendmix)
        .style("fill", cfgVenn.colors[3])

        if(cfgVenn.outline){
            ellipse_1.attr("stroke","black").attr("stroke-width","2")
            ellipse_2.attr("stroke","black").attr("stroke-width","2")
            ellipse_3.attr("stroke","black").attr("stroke-width","2")
            ellipse_4.attr("stroke","black").attr("stroke-width","2")
          }

        var circle_1_name = vennPlot.append("text").attr("x",120-60).attr("y",30).attr("text-anchor","middle").text(nameslist[cfgVenn.files[0]])
        var circle_2_name = vennPlot.append("text").attr("x",120+60).attr("y",30).attr("text-anchor","middle").text(nameslist[cfgVenn.files[1]])
        var circle_3_name = vennPlot.append("text").attr("x",120-100).attr("y",320).attr("text-anchor","middle").text(nameslist[cfgVenn.files[2]])
        var circle_4_name = vennPlot.append("text").attr("x",120+100).attr("y",320).attr("text-anchor","middle").text(nameslist[cfgVenn.files[3]])

        //handles the text creation for the tooltips
        toolText= {};
        toolText.A = tooltipTextFraction_1set(newData.A, cfgVenn.files[0])
        toolText.B = tooltipTextFraction_1set(newData.B, cfgVenn.files[1])
        toolText.C = tooltipTextFraction_1set(newData.C, cfgVenn.files[2])
        toolText.D = tooltipTextFraction_1set(newData.D, cfgVenn.files[3])
        toolText.AuB = tooltipTextFraction_2sets(newData.AuB, cfgVenn.files[0], cfgVenn.files[1])
        toolText.AuC = tooltipTextFraction_2sets(newData.AuC, cfgVenn.files[0], cfgVenn.files[2])
        toolText.BuC = tooltipTextFraction_2sets(newData.BuC, cfgVenn.files[1], cfgVenn.files[2])
        toolText.AuD = tooltipTextFraction_2sets(newData.AuD, cfgVenn.files[0], cfgVenn.files[3])
        toolText.BuD = tooltipTextFraction_2sets(newData.BuD, cfgVenn.files[1], cfgVenn.files[3])
        toolText.CuD = tooltipTextFraction_2sets(newData.CuD, cfgVenn.files[2], cfgVenn.files[3])
        toolText.AuBuC = tooltipTextFraction_3sets(newData.AuBuC, cfgVenn.files[0], cfgVenn.files[1], cfgVenn.files[2])
        toolText.AuBuD = tooltipTextFraction_3sets(newData.AuBuD, cfgVenn.files[0], cfgVenn.files[1], cfgVenn.files[3])
        toolText.AuCuD = tooltipTextFraction_3sets(newData.AuCuD, cfgVenn.files[0], cfgVenn.files[2], cfgVenn.files[3])
        toolText.BuCuD = tooltipTextFraction_3sets(newData.BuCuD, cfgVenn.files[1], cfgVenn.files[2], cfgVenn.files[3])
        toolText.AuBuCuD = tooltipTextFraction_4sets(newData.AuBuCuD, cfgVenn.files[0], cfgVenn.files[1], cfgVenn.files[2], cfgVenn.files[3])

        datasetsNames = []//cleans datasetsNames
        datasetsNames[0] = vennPlot.append("text").attr("x",120-80).attr("y",80).attr("class","vennText").attr("text-anchor","middle").text(newData.A.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.A,"A",0)})
        .attr("toolinfo",toolText.A).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[1] = vennPlot.append("text").attr("x",120+80).attr("y",80).attr("class","vennText").attr("text-anchor","middle").text(newData.B.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.B,"B",1)})
        .attr("toolinfo",toolText.B).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[2] = vennPlot.append("text").attr("x",-20).attr("y",180).attr("class","vennText").attr("text-anchor","middle").text(newData.C.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.C,"C",2)})
        .attr("toolinfo",toolText.C).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[3] = vennPlot.append("text").attr("x",120+140).attr("y",180).attr("class","vennText").attr("text-anchor","middle").text(newData.D.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.D,"D",3)})
        .attr("toolinfo",toolText.D).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[4] = vennPlot.append("text").attr("x",120).attr("y",130).attr("class","vennText").attr("text-anchor","middle").text(newData.AuB.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuB,"AuB",4)})
        .attr("toolinfo",toolText.AuB).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[5] = vennPlot.append("text").attr("x",20).attr("y",130).attr("class","vennText").attr("text-anchor","middle").text(newData.AuC.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuC,"AuC",5)})
        .attr("toolinfo",toolText.AuC).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[6] = vennPlot.append("text").attr("x",220).attr("y",130).attr("class","vennText").attr("text-anchor","middle").text(newData.BuD.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.BuD,"BuD",6)})
        .attr("toolinfo",toolText.BuD).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[7] = vennPlot.append("text").attr("x",120+80).attr("y",240).attr("class","vennText").attr("text-anchor","middle").text(newData.AuD.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuD,"AuD",7)})
        .attr("toolinfo",toolText.AuD).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[8] = vennPlot.append("text").attr("x",120-80).attr("y",240).attr("class","vennText").attr("text-anchor","middle").text(newData.BuC.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.BuC,"BuC",8)})
        .attr("toolinfo",toolText.BuC).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[9] = vennPlot.append("text").attr("x",120).attr("y",290).attr("class","vennText").attr("text-anchor","middle").text(newData.CuD.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.CuD,"CuD",9)})
        .attr("toolinfo",toolText.CuD).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[10] = vennPlot.append("text").attr("x",120-50).attr("y",180).attr("class","vennText").attr("text-anchor","middle").text(newData.AuBuC.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuBuC,"AuBuC",10)})
        .attr("toolinfo",toolText.AuBuC).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[11] = vennPlot.append("text").attr("x",120+50).attr("y",180).attr("class","vennText").attr("text-anchor","middle").text(newData.AuBuD.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuBuD,"AuBuD",11)})
        .attr("toolinfo",toolText.AuBuD).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[12] = vennPlot.append("text").attr("x",120-30).attr("y",255).attr("class","vennText").attr("text-anchor","middle").text(newData.BuCuD.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.BuCuD,"BuCuD",12)})
        .attr("toolinfo",toolText.BuCuD).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[13] = vennPlot.append("text").attr("x",120+30).attr("y",255).attr("class","vennText").attr("text-anchor","middle").text(newData.AuCuD.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuCuD,"AuCuD",13)})
        .attr("toolinfo",toolText.AuCuD).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
        datasetsNames[14] = vennPlot.append("text").attr("x",120).attr("y",220).attr("class","vennText").attr("text-anchor","middle").text(newData.AuBuCuD.length-1).on("click",function(d){mouseclick(d);clickOnData(newData.AuBuCuD,"AuBuCuD",14)})
        .attr("toolinfo",toolText.AuBuCuD).on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave" , mouseleave );
    }
    if(newData){
        vennData = newData
    }

    //update the choices for the canvas

    canvasA.htmlTopMenu.draw()
    canvasB.htmlTopMenu.draw()
    indexFiles()
}

/**
 * this function is used to compare two datasets 
 * @param {*} data1 first dataset
 * @param {*} data2 second dataset
 * @param {*} compCol the column number on which the comparaison is made
 * @param {*} ppmTolerance the tolerance in ppm under which the 2 points are considered the same
 */
function datasetComparaison_2(data1, data2, compCol, ppmTolerance){
    var newData = {"A":[],"B":[],"AuB":[]} //the datasets that will be returned

    //finds the configuration of what to do with the intensity
    var intensityconfig = document.getElementById("Venn_intensity").value

    if(intensityconfig == 3){intensityconfig = "average"}

    //clean copy without referecing the B list
    for(let i=0; i<data2.length;i++){
         newData.B.push(data2[i].slice());
    }
    newData.B.shift()

    if (compCol == config.mz){compare2sets_ppm(data1, newData.B,newData.A, newData.AuB, compCol, intensityconfig, 2, ppmTolerance)
    }else{compare2sets(data1, newData.B,newData.A, newData.AuB, compCol, intensityconfig, 2)}

    //checks if the files have the same number of columns
    if(data1[0] && data2[0]){
        if(data1[0].length != data2[0].length){
            alertPopup("warning ! comparing sets with different numbers of columns")
        }
    }
    //adds the titles to every set
    if(!data1[0]) return;
    newData.A.unshift(data1[0].slice());
    newData.B.unshift(data1[0].slice());
    newData.AuB.unshift(data1[0].slice());
    
    return newData;
}

/**
 * this function is used to compare 3 datasets
 * @param {*} data1 first dataset
 * @param {*} data2 second dataset
 * @param {*} data3 third dataset
 * @param {*} compCol the column on which the comparaison is made
 * @param {*} ppmTolerance the tolerance in ppm under which the 2 points are considered the same
 * @returns 
 */
function datasetComparaison_3(data1, data2, data3, compCol, ppmTolerance){
    var newData_2D = datasetComparaison_2(data1, data2, compCol, ppmTolerance)
        //checks if the files have the same number of columns
        if(data1[0] && data2[0] && data3[0]){
            if(data1[0].length != data2[0].length || data1[0].length != data3[0].length){
                alertPopup("warning ! comparing sets with different numbers of columns")
            }
        }
    var newData = {"A":[],"B":[],"C":[],"AuB":[],"AuC":[],"BuC":[],"AuBuC":[]} //the datasets that will be returned

    //finds the configuration of what to do with the intensity
    var intensityconfig = document.getElementById("Venn_intensity").value
    var intensityconfigAuC = intensityconfig
    var intensityconfigBuC = intensityconfig
    var intensityconfigAuBuC = intensityconfig

    //resets intensityconfig to the adequate value
    if(intensityconfigAuC == 2){intensityconfigAuC = "average"}
    if(intensityconfigAuC == 3){intensityconfigAuC = 2}
    
    if(intensityconfigBuC == 1){intensityconfigBuC = "average"}
    if(intensityconfigBuC == 2 || intensityconfigBuC == 3){intensityconfigBuC = intensityconfigBuC -1}

    if(intensityconfigAuBuC == 2 ){intensityconfigAuC = 1}

    //clean copy without referecing the C list
    for(let i=0; i<data3.length;i++){
        newData.C.push(data3[i].slice());
    }
    newData.C.shift()

    let iConfigArray = []
    if(intensityconfig == 1){ iConfigArray = [1,3,1]}
    else if(intensityconfig == 2){ iConfigArray = [3,1,1]}
    else if (intensityconfig == 3){ iConfigArray = [2,2,2]}
    else {iConfigArray = ["average","average","average"]}
    
    if (compCol == config.mz){
        compare2sets_ppm(newData_2D.A, newData.C,newData.A, newData.AuC, compCol, iConfigArray[0], 2, ppmTolerance)
        compare2sets_ppm(newData_2D.B, newData.C,newData.B, newData.BuC, compCol, iConfigArray[1], 2, ppmTolerance)
        compare2sets_ppm(newData_2D.AuB, newData.C,newData.AuB, newData.AuBuC, compCol, iConfigArray[2], 3,ppmTolerance)
    }else{compare2sets(newData_2D.A, newData.C,newData.A, newData.AuC, compCol, iConfigArray[0], 2)
        compare2sets(newData_2D.B, newData.C,newData.B, newData.BuC, compCol, iConfigArray[1], 2)
        compare2sets(newData_2D.AuB, newData.C,newData.AuB, newData.AuBuC, compCol, iConfigArray[2], 3)}


    //adds the titles to every set
    newData.A.unshift(data1[0].slice());
    newData.B.unshift(data1[0].slice());
    newData.AuB.unshift(data1[0].slice());
    newData.C.unshift(data1[0].slice());
    newData.AuC.unshift(data1[0].slice());
    newData.BuC.unshift(data1[0].slice());
    newData.AuBuC.unshift(data1[0].slice());
    
    return newData;
}


function datasetComparaison_4(data1, data2, data3, data4, compCol, ppmTolerance){
    var newData_3D = datasetComparaison_3(data1, data2,data3, compCol, ppmTolerance)
    //checks if the files have the same number of columns
    if(data1[0] && data2[0] && data3[0]&& data4[0]){
        if(data1[0].length != data2[0].length || data1[0].length != data3[0].length || data1[0].length != data4[0].length){
            alertPopup("warning ! comparing sets with different numbers of columns")
        }
    }
    var newData = {"A":[],"B":[],"C":[],"D":[],"AuB":[],"AuC":[],"BuC":[],"AuD":[],"BuD":[],"CuD":[],"AuBuC":[],"AuBuD":[],"AuCuD":[],"BuCuD":[],"AuBuCuD":[]} //the datasets that will be returned

    //clean copy without referecing the D list
    for(let i=0; i<data4.length;i++){
        newData.D.push(data4[i].slice());
    }
    newData.D.shift()
    var intensityconfig = document.getElementById("Venn_intensity").value

    let iConfigArray = []
    if(intensityconfig == 1){ iConfigArray = [1,3,3,1,1,3,1]}
    else if(intensityconfig == 2){ iConfigArray = [3,1,3,1,3,1,1]}
    else if (intensityconfig == 3){ iConfigArray = [3,3,1,3,1,1,1]}
    else if (intensityconfig == 4){ iConfigArray = [2,2,2,2,2,2,2]}
    else {iConfigArray = ["average","average","average","average","average","average","average"]}

    if (compCol == config.mz){
        compare2sets_ppm(newData_3D.A, newData.D,newData.A, newData.AuD, compCol, iConfigArray[0], 2, ppmTolerance)
        compare2sets_ppm(newData_3D.B, newData.D,newData.B, newData.BuD, compCol, iConfigArray[1], 2, ppmTolerance)
        compare2sets_ppm(newData_3D.C, newData.D,newData.C, newData.CuD, compCol, iConfigArray[2], 2, ppmTolerance)
        compare2sets_ppm(newData_3D.AuB, newData.D,newData.AuB, newData.AuBuD, compCol, iConfigArray[3], 3, ppmTolerance)
        compare2sets_ppm(newData_3D.AuC, newData.D,newData.AuC, newData.AuCuD, compCol, iConfigArray[4], 3, ppmTolerance)
        compare2sets_ppm(newData_3D.BuC, newData.D,newData.BuC, newData.BuCuD, compCol, iConfigArray[5], 3, ppmTolerance)
        compare2sets_ppm(newData_3D.AuBuC, newData.D,newData.AuBuC, newData.AuBuCuD, compCol, iConfigArray[6], 4, ppmTolerance)
    }else{
        compare2sets(newData_3D.A, newData.D,newData.A, newData.AuD, compCol, iConfigArray[0], 2)
        compare2sets(newData_3D.B, newData.D,newData.B, newData.BuD, compCol, iConfigArray[1], 2)
        compare2sets(newData_3D.C, newData.D,newData.C, newData.CuD, compCol, iConfigArray[2], 2)
        compare2sets(newData_3D.AuB, newData.D,newData.AuB, newData.AuBuD, compCol, iConfigArray[3], 3)
        compare2sets(newData_3D.AuC, newData.D,newData.AuC, newData.AuCuD, compCol, iConfigArray[4], 3)
        compare2sets(newData_3D.BuC, newData.D,newData.BuC, newData.BuCuD, compCol, iConfigArray[5], 3)
        compare2sets(newData_3D.AuBuC, newData.D,newData.AuBuC, newData.AuBuCuD, compCol, iConfigArray[6], 4)
    }
    
    //adds the titles to every set
    newData.A.unshift(data1[0].slice());
    newData.B.unshift(data1[0].slice());
    newData.C.unshift(data1[0].slice());
    newData.D.unshift(data1[0].slice());
    newData.AuB.unshift(data1[0].slice());
    newData.AuC.unshift(data1[0].slice());
    newData.BuC.unshift(data1[0].slice());
    newData.AuD.unshift(data1[0].slice());
    newData.BuD.unshift(data1[0].slice());
    newData.CuD.unshift(data1[0].slice());
    newData.AuBuC.unshift(data1[0].slice());
    newData.AuBuD.unshift(data1[0].slice());
    newData.AuCuD.unshift(data1[0].slice());
    newData.BuCuD.unshift(data1[0].slice());
    newData.AuBuCuD.unshift(data1[0].slice());

    return newData;
}

/**
 * this function will compare two sets of data, put the common data in an outBoth, put the data unique to set1 in out1 and delete all common data from set2
 * @param {*} set1 INPUT ONLY of first set
 * @param {*} set2 will INPUT AND OUTPUT this set
 * @param {*} out1 OUTPUT of data unique to set 1
 * @param {*} outBoth OUTPUT of data common
 * @param {*} compCol the column on which the comparaison is done
 * @param {*} intensityconfig what to do with the intenisty of the peaks
 * @param {boolean} setTotalNumber if the comparaison is done for a third/fourth set, saves only at the end the intensity data for the last set
 */
function compare2sets(set1,set2,out1,outBoth, compCol, intensityconfig, setTotalNumber){
    for(let i=1; i<set1.length;i++){ //scans through data1 (starts at one to avoid the first column with names)
        var isfound = false; //checks if the value is found inside the other dataset
        for(let j=0; j<set2.length; j++){ //scans through the copy of data2
            if(set1[i][compCol] == set2[j][compCol] && set1[i][0] != ""){
                outBoth.push(set1[i].slice()); //adds it to AuB
                if (setTotalNumber <= 2){outBoth.at(-1).push(set1[i][config.intensity])} //sends the set1 intensity at the end
                 outBoth.at(-1).push(set2[j][config.intensity]) //sends the set2 intensity at the end
                //finds what to do for the intensity
                if(intensityconfig == "average"){
                    if(setTotalNumber == 4){outBoth.at(-1)[config.intensity] = (3*parseFloat(set1[i][config.intensity])+parseFloat(set2[j][config.intensity]))/4} //if it is a fourth set comparaison the average has to be 3/4 to 1/4 in this comparaison
                    else if(setTotalNumber == 3){outBoth.at(-1)[config.intensity] = (2*parseFloat(set1[i][config.intensity])+parseFloat(set2[j][config.intensity]))/3} //if it is a third set comparaison the average has to be 2/3 to 1/3 in this comparaison
                    else{outBoth.at(-1)[config.intensity] = (parseFloat(set1[i][config.intensity])+parseFloat(set2[j][config.intensity]))/2}
                }
                else if(intensityconfig == 3){outBoth.at(-1)[config.intensity] = (parseFloat(set1[i][config.intensity])+parseFloat(set2[j][config.intensity]))/2}
                else if(intensityconfig == 1){}
                else if(intensityconfig == 2){outBoth.at(-1)[config.intensity] = set2[j][config.intensity]}
                set2.splice(j, 1) //removes it from B
                isfound = true;

                break;
            }
        }
        if(!isfound && set1[i][0] != ""){out1.push(set1[i].slice())}
    }
}


/**
 * Does the same as compare2sets but with ppm tolerance instead of formula comparaison
 * @param {*} set1 INPUT ONLY of first set
 * @param {*} set2 will INPUT AND OUTPUT this set
 * @param {*} out1 OUTPUT of data unique to set 1
 * @param {*} outBoth OUTPUT of data common
 * @param {*} compCol the column on which the comparaison is done
 * @param {*} intensityconfig what to do with the intenisty of the peaks
 * @param {boolean} isThird if the comparaison is done for a third set, saves only at the end the intensity data for the last set
 */
 function compare2sets_ppm(set1,set2,out1,outBoth, compCol, intensityconfig, setTotalNumber , ppmTolerance){
    for(let i=1; i<set1.length;i++){ //scans through data1 (starts at one to avoid the first column with names)
        var isfound = false; //checks if the value is found inside the other dataset
        for(let j=0; j<set2.length; j++){ //scans through the copy of data2
            var delta = Math.abs(parseFloat(1000000*(set1[i][compCol]-set2[j][compCol])/set1[i][compCol]))
            if(delta <= ppmTolerance){
                outBoth.push(set1[i].slice()); //adds it to AuB
                outBoth.at(-1)[config.mz]= parseFloat((parseFloat(set1[i][config.mz])+parseFloat(set2[j][config.mz]))/2) //averages the m/z ratio
                if (setTotalNumber == 3){outBoth.at(-1)[config.mz]= parseFloat((2*parseFloat(set1[i][config.mz])+parseFloat(set2[j][config.mz]))/3)} //averages the m/z ratio in the specific third case
                if (setTotalNumber == 4){outBoth.at(-1)[config.mz]= parseFloat((3*parseFloat(set1[i][config.mz])+parseFloat(set2[j][config.mz]))/4)} //averages the m/z ratio in the specific third case
                if (setTotalNumber <= 2){outBoth.at(-1).push(set1[i][config.intensity])} //sends the set1 intensity at the end
                outBoth.at(-1).push(set2[j][config.intensity]) //sends the set2 intensity at the end
                //finds what to do for the intensity
                if(intensityconfig == "average"){
                    if(setTotalNumber == 3){outBoth.at(-1)[config.intensity] = (2*parseFloat(set1[i][config.intensity])+parseFloat(set2[j][config.intensity]))/3} //if it is a third set comparaison the average has to be 2/3 to 1/3 in this comparaison
                    else if(setTotalNumber == 4){outBoth.at(-1)[config.intensity] = (3*parseFloat(set1[i][config.intensity])+parseFloat(set2[j][config.intensity]))/4} //if it is a four  set comparaison the average has to be 3/4 to 1/4 in this comparaison
                    else{outBoth.at(-1)[config.intensity] = (parseFloat(set1[i][config.intensity])+parseFloat(set2[j][config.intensity]))/2}
                }
                else if(intensityconfig == 3){outBoth.at(-1)[config.intensity] = (parseFloat(set1[i][config.intensity])+parseFloat(set2[j][config.intensity]))/2}
                else if(intensityconfig == 1){}
                else if(intensityconfig == 2){outBoth.at(-1)[config.intensity] = set2[j][config.intensity]}
                set2.splice(j, 1) //removes it from B
                isfound = true;

                break;
            }
        }
        if(!isfound && set1[i][0] != ""){out1.push(set1[i].slice())}
    }
}


/**
 * sends the data clicked to be vizualised if the option is selected on the treatment tab & displays it on the textarea
 * @param {*} dataset 
 * @param {*} dataName 
 * @param {*} dataNameID 
 */
function clickOnData(dataset,dataName, dataNameID){
    
    //highlight the selected zone
    for(let i=0; i<datasetsNames.length; i++){
        datasetsNames[i].style("font-weight","normal").style("text-decoration","none")
    }
    datasetsNames[dataNameID].style("font-weight","bold").style("text-decoration","underline")

    //sets the text zone to contain the data separated by tab
    var text = ""
    for(let i=0; i<dataset.length; i++){
        for(let j=0; j<dataset[0].length;j++){
            //for the last element
            if(j+1 == dataset[0].length){text= text + dataset[i][j]}
            else{text= text + dataset[i][j] + "	"}
        }
        text = text+'\n'
    }
    document.getElementById("vennTextArea").value = text
}



  //////////////////////////////////////////////////////////////////// 

/**
 * outputs a text info for the tooltip of the unique part in a dataset
 * @param {*} dataFrac the dataset
 * @param {*} fileNumber the number (1,2,3,4) of the 
 * @returns 
 */
 function tooltipTextFraction_1set(dataFrac, fileNumber){
    var dataWhole = fileData[fileNumber]
    var numberFrac = Math.round(1000*(dataFrac.length-1) / (dataWhole.length-1))/10
    //calculates the intensity
    var intensityWhole= 0
    var intensityFrac = 0
    for(let i=0; i<dataWhole.length; i++){
        if (!isNaN(dataWhole[i][config.intensity])){ intensityWhole = intensityWhole + parseFloat(dataWhole[i][config.intensity])}
    }
    for(let i=0; i<dataFrac.length; i++){
        if (!isNaN(dataFrac[i][config.intensity])){intensityFrac = intensityFrac + parseFloat(dataFrac[i][config.intensity])}
    }
    var intensityPercent = 0
    if(intensityWhole != 0 ){intensityPercent = Math.round(1000*parseFloat(intensityFrac/intensityWhole))/10}
    //creates the text
    var text=numberFrac+"% of attributions from "+nameslist[fileNumber]+" </br>"; //the text content that will be outputed
    text = text+intensityPercent+"% of the intensity from "+nameslist[fileNumber]
    return text
}


/**creates the tooltip text for a dataset in common between two datasets */
function tooltipTextFraction_2sets(dataFrac, fileNumber1, fileNumber2){
    var dataWhole1 = fileData[fileNumber1]
    var dataWhole2 = fileData[fileNumber2]
    var numberFrac1 = Math.round(1000*(dataFrac.length-1) / (dataWhole1.length-1))/10
    var numberFrac2 = Math.round(1000*(dataFrac.length-1) / (dataWhole2.length-1))/10


    //calculates the intensity of the whole sets
    var intensityWhole1= 0
    var intensityWhole2= 0
    for(let i=0; i<dataWhole1.length; i++){
        if (!isNaN(dataWhole1[i][config.intensity])){ intensityWhole1 = intensityWhole1 + parseFloat(dataWhole1[i][config.intensity])}
    }
    for(let i=0; i<dataWhole2.length; i++){
        if (!isNaN(dataWhole2[i][config.intensity])){ intensityWhole2 = intensityWhole2 + parseFloat(dataWhole2[i][config.intensity])}
    }

    var col_I1 = 0
    var col_I2 = 0
    //searches for the right column for the intensity 
    for(let i=0; i<dataFrac[0].length; i++){
        if(dataFrac[0][i]== "Intensity_"+nameslist[fileNumber1]){col_I1 = i}
        if(dataFrac[0][i]== "Intensity_"+nameslist[fileNumber2]){col_I2 = i}
    }

    //calculates the intensity of the partial sets
    var intensityFrac1 = 0
    var intensityFrac2 = 0
    for(let i=0; i<dataFrac.length; i++){
        if (!isNaN(dataFrac[i][col_I1])){ intensityFrac1 = intensityFrac1 + parseFloat(dataFrac[i][col_I1])}
        if (!isNaN(dataFrac[i][col_I2])){ intensityFrac2 = intensityFrac2 + parseFloat(dataFrac[i][col_I2])}
    }


    //calculates the percents
    var intensityPercent1 = 0
    var intensityPercent2 = 0
    if(intensityWhole1 != 0 ){intensityPercent1 = Math.round(1000*intensityFrac1/intensityWhole1)/10}
    if(intensityWhole2 != 0 ){intensityPercent2 = Math.round(1000*intensityFrac2/intensityWhole2)/10}

    //creates the text
    var text=numberFrac1+"% of attributions from "+nameslist[fileNumber1]+" </br>"; //the text content that will be outputed
    text = text+intensityPercent1+"% of intensity from "+nameslist[fileNumber1]+" </br>";
    text = text+ numberFrac2+"% of attributions from "+nameslist[fileNumber2]+" </br>"; 
    text = text+intensityPercent2+"% of intensity from "+nameslist[fileNumber2]
    return text

}

/**creates the tooltip text for a dataset in common between three datasets */
function tooltipTextFraction_3sets(dataFrac, fileNumber1, fileNumber2, fileNumber3){
    var dataWhole1 = fileData[fileNumber1]
    var dataWhole2 = fileData[fileNumber2]
    var dataWhole3 = fileData[fileNumber3]
    var numberFrac1 = Math.round(1000*(dataFrac.length-1) / (dataWhole1.length-1))/10
    var numberFrac2 = Math.round(1000*(dataFrac.length-1) / (dataWhole2.length-1))/10
    var numberFrac3 = Math.round(1000*(dataFrac.length-1) / (dataWhole3.length-1))/10


    //calculates the intensity of the whole sets
    var intensityWhole1= 0
    var intensityWhole2= 0
    var intensityWhole3= 0
    for(let i=0; i<dataWhole1.length; i++){
        if (!isNaN(dataWhole1[i][config.intensity])){ intensityWhole1 = intensityWhole1 + parseFloat(dataWhole1[i][config.intensity])}
    }
    for(let i=0; i<dataWhole2.length; i++){
        if (!isNaN(dataWhole2[i][config.intensity])){ intensityWhole2 = intensityWhole2 + parseFloat(dataWhole2[i][config.intensity])}
    }
    for(let i=0; i<dataWhole3.length; i++){
        if (!isNaN(dataWhole3[i][config.intensity])){ intensityWhole3 = intensityWhole3 + parseFloat(dataWhole3[i][config.intensity])}
    }

    var col_I1 = 0
    var col_I2 = 0
    var col_I3 = 0
    //searches for the right column for the intensity 
    for(let i=0; i<dataFrac[0].length; i++){
        if(dataFrac[0][i]== "Intensity_"+nameslist[fileNumber1]){col_I1 = i}
        if(dataFrac[0][i]== "Intensity_"+nameslist[fileNumber2]){col_I2 = i}
        if(dataFrac[0][i]== "Intensity_"+nameslist[fileNumber3]){col_I3 = i}
    }

    //calculates the intensity of the partial sets
    var intensityFrac1 = 0
    var intensityFrac2 = 0
    var intensityFrac3 = 0
    for(let i=0; i<dataFrac.length; i++){
        if (!isNaN(dataFrac[i][col_I1])){ intensityFrac1 = intensityFrac1 + parseFloat(dataFrac[i][col_I1])}
        if (!isNaN(dataFrac[i][col_I2])){ intensityFrac2 = intensityFrac2 + parseFloat(dataFrac[i][col_I2])}
        if (!isNaN(dataFrac[i][col_I3])){ intensityFrac3 = intensityFrac3 + parseFloat(dataFrac[i][col_I3])}
    }


    //calculates the percents
    var intensityPercent1 = 0
    var intensityPercent2 = 0
    var intensityPercent3 = 0
    if(intensityWhole1 != 0 ){intensityPercent1 = Math.round(1000*intensityFrac1/intensityWhole1)/10}
    if(intensityWhole2 != 0 ){intensityPercent2 = Math.round(1000*intensityFrac2/intensityWhole2)/10}
    if(intensityWhole3 != 0 ){intensityPercent3 = Math.round(1000*intensityFrac3/intensityWhole3)/10}

    //creates the text
    var text=numberFrac1+"% of attributions from "+nameslist[fileNumber1]+" </br>"; //the text content that will be outputed
    text = text+intensityPercent1+"% of intensity from "+nameslist[fileNumber1]+" </br>";
    text = text+ numberFrac2+"% of attributions from "+nameslist[fileNumber2]+" </br>"; 
    text = text+intensityPercent2+"% of intensity from "+nameslist[fileNumber2]+" </br>"; 
    text = text+ numberFrac3+"% of attributions from "+nameslist[fileNumber3]+" </br>"; 
    text = text+intensityPercent3+"% of intensity from "+nameslist[fileNumber3]
    return text

}

/**creates the tooltip text for a dataset in common between three datasets */
function tooltipTextFraction_4sets(dataFrac, fileNumber1, fileNumber2, fileNumber3, fileNumber4){
    var dataWhole1 = fileData[fileNumber1]
    var dataWhole2 = fileData[fileNumber2]
    var dataWhole3 = fileData[fileNumber3]
    var dataWhole4 = fileData[fileNumber4]
    var numberFrac1 = Math.round(1000*(dataFrac.length-1) / (dataWhole1.length-1))/10
    var numberFrac2 = Math.round(1000*(dataFrac.length-1) / (dataWhole2.length-1))/10
    var numberFrac3 = Math.round(1000*(dataFrac.length-1) / (dataWhole3.length-1))/10
    var numberFrac4 = Math.round(1000*(dataFrac.length-1) / (dataWhole4.length-1))/10


    //calculates the intensity of the whole sets
    var intensityWhole1= 0
    var intensityWhole2= 0
    var intensityWhole3= 0
    var intensityWhole4= 0
    for(let i=0; i<dataWhole1.length; i++){
        if (!isNaN(dataWhole1[i][config.intensity])){ intensityWhole1 = intensityWhole1 + parseFloat(dataWhole1[i][config.intensity])}
    }
    for(let i=0; i<dataWhole2.length; i++){
        if (!isNaN(dataWhole2[i][config.intensity])){ intensityWhole2 = intensityWhole2 + parseFloat(dataWhole2[i][config.intensity])}
    }
    for(let i=0; i<dataWhole3.length; i++){
        if (!isNaN(dataWhole3[i][config.intensity])){ intensityWhole3 = intensityWhole3 + parseFloat(dataWhole3[i][config.intensity])}
    }
    for(let i=0; i<dataWhole4.length; i++){
        if (!isNaN(dataWhole4[i][config.intensity])){ intensityWhole4 = intensityWhole4 + parseFloat(dataWhole4[i][config.intensity])}
    }

    var col_I1 = 0
    var col_I2 = 0
    var col_I3 = 0
    var col_I4 = 0
    //searches for the right column for the intensity 
    for(let i=0; i<dataFrac[0].length; i++){
        if(dataFrac[0][i]== "Intensity_"+nameslist[fileNumber1]){col_I1 = i}
        if(dataFrac[0][i]== "Intensity_"+nameslist[fileNumber2]){col_I2 = i}
        if(dataFrac[0][i]== "Intensity_"+nameslist[fileNumber3]){col_I3 = i}
        if(dataFrac[0][i]== "Intensity_"+nameslist[fileNumber4]){col_I4 = i}
    }
    console.log(dataFrac, dataWhole4)
    console.log(intensityWhole1,intensityWhole4)
    console.log(col_I1,col_I2,col_I3,col_I4)

    //calculates the intensity of the partial sets
    var intensityFrac1 = 0
    var intensityFrac2 = 0
    var intensityFrac3 = 0
    var intensityFrac4 = 0
    for(let i=0; i<dataFrac.length; i++){
        if (!isNaN(dataFrac[i][col_I1])){ intensityFrac1 = intensityFrac1 + parseFloat(dataFrac[i][col_I1])}
        if (!isNaN(dataFrac[i][col_I2])){ intensityFrac2 = intensityFrac2 + parseFloat(dataFrac[i][col_I2])}
        if (!isNaN(dataFrac[i][col_I3])){ intensityFrac3 = intensityFrac3 + parseFloat(dataFrac[i][col_I3])}
        if (!isNaN(dataFrac[i][col_I4])){ intensityFrac4 = intensityFrac4 + parseFloat(dataFrac[i][col_I4])}
    }

    console.log(intensityFrac1,intensityFrac4)


    //calculates the percents
    var intensityPercent1 = 0
    var intensityPercent2 = 0
    var intensityPercent3 = 0
    var intensityPercent4 = 0
    if(intensityWhole1 != 0 ){intensityPercent1 = Math.round(1000*intensityFrac1/intensityWhole1)/10}
    if(intensityWhole2 != 0 ){intensityPercent2 = Math.round(1000*intensityFrac2/intensityWhole2)/10}
    if(intensityWhole3 != 0 ){intensityPercent3 = Math.round(1000*intensityFrac3/intensityWhole3)/10}
    if(intensityWhole4 != 0 ){intensityPercent4 = Math.round(1000*intensityFrac4/intensityWhole4)/10}

    //creates the text
    var text=numberFrac1+"% of attributions from "+nameslist[fileNumber1]+" </br>"; //the text content that will be outputed
    text = text+intensityPercent1+"% of intensity from "+nameslist[fileNumber1]+" </br>";
    text = text+ numberFrac2+"% of attributions from "+nameslist[fileNumber2]+" </br>"; 
    text = text+intensityPercent2+"% of intensity from "+nameslist[fileNumber2]+" </br>"; 
    text = text+ numberFrac3+"% of attributions from "+nameslist[fileNumber3]+" </br>"; 
    text = text+intensityPercent3+"% of intensity from "+nameslist[fileNumber3]+" </br>"; 
    text = text+ numberFrac4+"% of attributions from "+nameslist[fileNumber4]+" </br>"; 
    text = text+intensityPercent4+"% of intensity from "+nameslist[fileNumber4]
    return text

}


///////////////////////////////////////////////////////
/**screenshot code */
var canvasVenn_screenshot = html_tabVenn.querySelector('button[name="screenshot"]')
canvasVenn_screenshot.addEventListener("click", function (){ takeScreenshotVenn()});

/** a function that launches a popup to take a screenshot of the PCA canvas */
function takeScreenshotVenn(){
    var buttons  = [
        {"name":"Export vectorial image (svg)", "function":exportScreenshot_SVGVENN}
    ]
    handlePopup("screenshot", "Take a screenshot of the venn diagram", buttons , [], [])
}



function exportScreenshot_SVGVENN(){
    if(debug){console.log("preparin save of SVG VENN export...")}
    var html_canvas = document.querySelector("#VennCanvas")
    /**gets the information of the screenshot zone */
    var downloadTarget = null
    downloadTarget = html_canvas.firstChild
    var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
    setInlineStylesSVG(downloadTarget)
    downloadTarget.source = [doctype +  (new XMLSerializer()).serializeToString(downloadTarget)]
    downloadSVG(downloadTarget, "VENN")
}