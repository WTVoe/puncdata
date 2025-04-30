/** this script contains functions for the network canvas, to produce visuals of networks */


/////////////////////////////////////
//////TOP MENU NETWORK//////////////
/////////////////////////////////////

class TopMenuNetwork{
    constructor(cvsHTML, cfg){
        this.cvsHTML = cvsHTML
        this.prepareCfg(cfg)
        this.draw()
        this.currentMenu = 1
        this.changeMenu(1)
        let tooltipHTML = document.getElementById("tooltip_canvasN")
        this.tooltip = new TooltipNetworkVis(tooltipHTML, this)
        this.network = new NetworkVisual(this.cfg, this, this.tooltip)
    }

    prepareCfg(copy){
        if(!copy){copy = {nodes:{},nodesColor:{},edges:{},simulation:{},interactivity:{}}}
        let newCfg = {nodes:{},nodesColor:{},edges:{},simulation:{},interactivity:{}}
        //nodes
        newCfg.nodes.showLoneNodes = copy.nodes.showLoneNodes  || true;
        newCfg.nodes.size = copy.nodes.size  || 5;
        newCfg.nodes.type = copy.nodes.type ||"constant";
        //nodes color
        newCfg.nodesColor.colorGradient = copy.nodesColor.colorGradient || "Viridis";
        newCfg.nodesColor.colorInvert = copy.nodesColor.colorInvert || false;
        newCfg.nodesColor.colorRelative = copy.nodesColor.colorRelative || true;
        newCfg.nodesColor.showLegend = copy.nodesColor.showLegend || true;
        newCfg.nodesColor.colorSolid = copy.nodesColor.colorSolid || "#000000";
        newCfg.nodesColor.colorTypeMain = copy.nodesColor.colorTypeMain || "variable";
        newCfg.nodesColor.colorType = copy.nodesColor.colorType || config.intensity;
        newCfg.nodesColor.maxColor = copy.nodesColor.maxColor || 100;
        newCfg.nodesColor.minColor = copy.nodesColor.minColor || 0;
        //edges
        newCfg.edges.mDaTol = copy.edges.mDaTol || 0.1;
        newCfg.edges.mode = copy.edges.mode || "mass";
        newCfg.edges.width = copy.edges.width || 1;
        newCfg.edges.color = copy.edges.color || "black";
        newCfg.edges.list = copy.edges.list || [];
        if(newCfg.edges.list.length == 0){
            newCfg.edges.list.push({formula:"CH2",mass:14.01565,color:"black",width:'',length:'',force:''})
            newCfg.edges.list.push({formula:"H2",mass:2.01565,color:"",width:"",length:"",force:""})
        }
        //simulation
        newCfg.simulation.size = copy.simulation.size || [1000,800];
        newCfg.simulation.forcex = copy.simulation.forcex || 0.25;
        newCfg.simulation.forcey = copy.simulation.forcey || 0.25;
        newCfg.simulation.forceManyBody = copy.simulation.forceManyBody || -20;
        newCfg.simulation.distanceLink = copy.simulation.distanceLink || 10;
        newCfg.simulation.forceLink = copy.simulation.forceLink || 2;
        //interactivity
        newCfg.interactivity.hovering = copy.interactivity.hovering || "tooltip";
        newCfg.dataName = ""

        this.cfg = newCfg
        return this.cfg
    }

    draw(){
        let network = this.network
        let top = this.cvsHTML.querySelector("div[class='topselecter']")
        if(!top){throw new Error("Canvas top bar not found")}
        let menuButtons = top.querySelector("div[id='menubuttons']")
        if(!menuButtons){throw new Error("Canvas top bar not found")}
        //looks for old menu and removes them
        if(top.querySelector("div[name='generalMenu']")){top.querySelector("div[name='generalMenu']").remove() }
        if(top.querySelector("div[name='tabMenu']")){top.querySelector("div[name='tabMenu']").remove() }
        if(top.querySelector("div[name='editMenu']")){top.querySelector("div[name='editMenu']").remove() }
        //creates the general menu
        let genMenu = document.createElement("div")
        genMenu.id = "menu"
        genMenu.setAttribute("name","generalMenu")
        genMenu.style.marginRight = "20"

        let genMenuTable = createTable(4,1)
        genMenu.appendChild(genMenuTable)
        genMenuTable.rows[0].cells[0].textContent = "Data Menu"
        genMenuTable.rows[1].cells[0].textContent = "File : "

        let buttonPause = document.createElement("button")
        buttonPause.innerHTML = "PAUSE"
        buttonPause.addEventListener("click",(d,n)=>{
            this.network.pauseSim()
            if(d.target && this.network.paused){d.target.innerHTML = "RESUME"}
            else if(d.target){d.target.innerHTML = "PAUSE"}

        })
        genMenuTable.rows[2].cells[0].appendChild(buttonPause)

        let select_fileSource = menuCreateInput("selectFile","dataPath",this.cfg.dataName)
        select_fileSource.style.margin = "1px"
        select_fileSource.title = "choose which fill will be displayed in this data slot"
        
        let newOption = document.createElement("option")
        newOption.setAttribute("value","attrib")
        newOption.innerHTML = "Current Attribution"
        let noneOption = select_fileSource.querySelector("option[value='matrix']")
        select_fileSource.appendChild(newOption)
        select_fileSource.insertBefore(newOption, noneOption)
        select_fileSource.addEventListener("change",(d)=>{
            this.cfg.dataName = select_fileSource.value
            if(this.cfg.dataName == "attrib"){
                this.network.nodes = attrib.network.nodes
                this.network.edges = attrib.network.edges
                this.network.attributedNetwork = true
                this.network.updateAdjacencyList()
            }else{
                this.network.attributedNetwork = false
                this.findData(this.cfg.dataName)
            }
            this.network.startSim()
            //updates the menu if it displays data
            let menuChoice = this.html.querySelector("input[name='tab_network']:checked")
            if(menuChoice && menuChoice.value == "information"){
                this.changeMenu(6)
            }
        })
        genMenuTable.rows[1].cells[0].appendChild(select_fileSource)

        let buttonExport = document.createElement("button")
        buttonExport.innerHTML = "Export Data"
        buttonExport.addEventListener("click",(d,n)=>{
            new Popup_exportNetwork(this.network, false)
        })
        genMenuTable.rows[3].cells[0].appendChild(buttonExport)
        
        //creates the tab menu
        let tabMenu = document.createElement("div")
        tabMenu.id = "tabs"
        tabMenu.setAttribute("name","tabMenu")
        tabMenu.style.marginRight = "20"
        tabMenu.style.overflowY = "auto"
        tabMenu.style.flex = "1"
        '<input type="radio" class="wideRadio" name="menu_network" value="nodes" label="Nodes style"><br>'
        let radio1 = document.createElement("input")
        radio1.setAttribute("type","radio")
        radio1.classList.add("wideRadio")
        radio1.setAttribute("name",'tab_network')
        radio1.setAttribute("value","nodes")
        radio1.setAttribute("label","Nodes Parameters")
        radio1.style.color = "white"
        let radio2 = document.createElement("input")
        radio2.setAttribute("type","radio")
        radio2.classList.add("wideRadio")
        radio2.setAttribute("name",'tab_network')
        radio2.setAttribute("value","edges")
        radio2.setAttribute("label","Nodes Color")
        radio2.style.color = "white"
        let radio3 = document.createElement("input")
        radio3.setAttribute("type","radio")
        radio3.classList.add("wideRadio")
        radio3.setAttribute("name",'tab_network')
        radio3.setAttribute("value","edges")
        radio3.setAttribute("label","Edges / Links")
        radio3.style.color = "white"
        let radio4 = document.createElement("input")
        radio4.setAttribute("type","radio")
        radio4.classList.add("wideRadio")
        radio4.setAttribute("name",'tab_network')
        radio4.setAttribute("value","interactivity")
        radio4.setAttribute("label","Interactivity")
        radio4.style.color = "white"
        let radio5 = document.createElement("input")
        radio5.setAttribute("type","radio")
        radio5.classList.add("wideRadio")
        radio5.setAttribute("name",'tab_network')
        radio5.setAttribute("value","simulation")
        radio5.setAttribute("label","Simulation forces")
        radio5.style.color = "white"
        let radio6 = document.createElement("input")
        radio6.setAttribute("type","radio")
        radio6.classList.add("wideRadio")
        radio6.setAttribute("name",'tab_network')
        radio6.setAttribute("value","information")
        radio6.setAttribute("label","Network informations")
        radio6.style.color = "white"

        radio1.addEventListener("click",()=>{this.changeMenu(1)})
        radio2.addEventListener("click",()=>{this.changeMenu(2)})
        radio3.addEventListener("click",()=>{this.changeMenu(3)})
        radio4.addEventListener("click",()=>{this.changeMenu(4)})
        radio5.addEventListener("click",()=>{this.changeMenu(5)})
        radio6.addEventListener("click",()=>{this.changeMenu(6)})

        tabMenu.appendChild(radio1)
        tabMenu.appendChild(radio2)
        tabMenu.appendChild(radio3)
        tabMenu.appendChild(radio4)
        tabMenu.appendChild(radio5)
        tabMenu.appendChild(radio6)

        //creates the editor menu
        let editMenu = document.createElement("div")
        editMenu.id = "menu"
        editMenu.setAttribute("name","editMenu")
        editMenu.style.marginRight = "20"
        editMenu.style.overflowY = "auto"
        editMenu.style.flex = "2"
        let editTable = createTable(7,3)
        editMenu.appendChild(editTable)

        top.insertBefore(genMenu, menuButtons)
        top.insertBefore(tabMenu, menuButtons)
        top.insertBefore(editMenu, menuButtons)
        this.editMenu = editMenu
        this.html = top

        radio1.click()
    }

    changeMenu(menuID){
        let menu
        switch (menuID){
            case 1:
                menu = this.returnMenuNodes()
                break;
            case 2:
                menu = this.returnMenuNodesColor()
                break;
            case 3:
                menu = this.returnEdgeMenu()
                break;
            case 4:
                menu = this.returnInteractivityMenu()
                break;
            case 5:
                menu = this.returnSimulationMenu()
                break;
            case 6: 
                menu = this.returnInfoMenu()
                break;
            default:
                menu = createTable(7,3)
        }
        let oldTable = this.editMenu.querySelector("table")
        if(oldTable){oldTable.remove()}
        this.editMenu.appendChild(menu)
        this.currentMenu = menuID

    }

    //constructs the menu "nodes" and returns it
    returnMenuNodes(){
        let table = createTable(7,3)

        let showLoneNodesInput = menuCreate_checkbox("","show_lone_nodes",this.cfg.nodes.showLoneNodes)
        showLoneNodesInput.title = "Uncheck to hide nodes without any network connexion"
        showLoneNodesInput.style.textAlign = "start"
        var nodeSize = menuCreateInput("number","node_size",this.cfg.nodes.size)
        nodeSize.title = "The size in px of every node by default"
        var typeOptions =[{name:"Constant",value:"constant"},{name:"#Neighbours",value:"neighbours"},{name:"#Neighbours target only",value:"neighbours2"},{name:"Intensity",value:"intensity"}]
        var select_sizeType = menuCreateInput("select","type",this.cfg.nodes.type,typeOptions)
        select_sizeType.style.color = "white";
        select_sizeType.style.margin = "1px"
        select_sizeType.title ="Choose if the size of dots is constant or changes with a certain variable"

        table.rows[0].cells[0].textContent = "Show Lone Nodes:"
        table.rows[0].cells[0].style.fontWeight = "normal"
        table.rows[0].cells[0].style.textAlign = "start"
        table.rows[0].cells[1].appendChild(showLoneNodesInput)
        table.rows[1].cells[0].textContent = "Nodes size (px):"
        table.rows[1].cells[1].appendChild(nodeSize)
        table.rows[2].cells[0].textContent = "Relative size:"
        table.rows[2].cells[1].appendChild(select_sizeType)

        showLoneNodesInput.addEventListener("change",(d)=>{
            this.readChangeCfg(d, "nodes", "showLoneNodes")
            this.network.updateHiddenNodes()
        })
        nodeSize.addEventListener("change",(d)=>{this.readChangeCfg(d, "nodes", "size")})
        select_sizeType.addEventListener("change",(d)=>{this.readChangeCfg(d, "nodes", "type")})
        table.addEventListener("change",(d)=>{this.network.updateNodes()})
        return table
    }

    //constructs the menu "nodes" and returns it
    returnMenuNodesColor(){
        let table = createTable(7,3)
        var select_scaleColor = document.createElement("select");
        select_scaleColor.setAttribute("name","color_type")
        select_scaleColor.style.color = "white";
        select_scaleColor.style.margin = "1px"
        select_scaleColor.style.textAlign = "start"
        select_scaleColor.title = "Choose the color scale appearance. A customized one can be made in parameters, or you can choose only a custom solid color for all"
        createColorOptions2(select_scaleColor)
        select_scaleColor.value = this.cfg.nodesColor.colorGradient
        var inputColorSolid = document.createElement("input");
        inputColorSolid.setAttribute("name","color_solid")
        inputColorSolid.setAttribute("type","text")
        inputColorSolid.setAttribute("data-coloris",this.cfg.colorSolid)
        inputColorSolid.style.color = "white";
        inputColorSolid.style.margin = "1px"
        inputColorSolid.value = this.cfg.nodesColor.colorSolid 
        inputColorSolid.setAttribute("class","coloris instance3")
        inputColorSolid.title = "Choose the solid color, used for histogram bars. If the scale 'custom Solid' is used, itwill also be used for data on other charts"
        var typeOptions = [{name:"Data variable",value:"variable"},{name:"Neighbours number",value:"neighbour"},{name:"Neighbours number (only targets)",value:"neighbour2"},{name:"Clustering coeff.",value:"cluster"},{name:"Has a formula",value:"hasFormula"}]
        var select_colorColMain = menuCreateInput("select","type",this.cfg.nodesColor.colorTypeMain,typeOptions)
        select_colorColMain.style.color = "white";
        select_colorColMain.style.margin = "1px"
        select_colorColMain.title ="Choose what does the color represent. Data variable looks for a data value in the peak data"
        var select_colorCol = menuCreateInput("selectCols","color_col",this.cfg.nodesColor.colorType);
        select_colorCol.style.color = "white";
        select_colorCol.style.margin = "1px"
        select_colorCol.title ="The column used to compute the scale of the colors"
        var input_minColor = menuCreateInput("number","color_min",this.cfg.nodesColor.minColor);
        input_minColor.style.color = "white";
        input_minColor.style.margin = "1px"
        input_minColor.title = "Min value of the color scale"
        var input_maxColor = menuCreateInput("number","color_max",this.cfg.nodesColor.maxColor);
        input_maxColor.style.color = "white";
        input_maxColor.style.margin = "1px"
        input_minColor.title = "Max value of the color scale"
        var checkRelative = menuCreateInput("checkbox","color_relative",this.cfg.nodesColor.colorRelative)
        checkRelative.style.margin = "1px"
        checkRelative.title = "Check to compute for this variable to be relative (express min/max in percent, between 0 and 100)"
        var checkInvert = menuCreateInput("checkbox","color_invert",this.cfg.nodesColor.colorInvert)
        checkInvert.style.margin = "1px"
        checkInvert.title = "Check to invert this color scale"
        var checkShowLegend = menuCreateInput("checkbox","show_legend",this.cfg.nodesColor.showLegend)
        checkShowLegend.style.margin = "1px"
        checkShowLegend.title = "Check to show/hide the colour legend"

        table.rows[0].cells[0].textContent="Color scale:"
        table.rows[0].cells[0].style.fontWeight = "normal"
        table.rows[0].cells[0].style.textAlign = "start"
        table.rows[0].cells[1].appendChild(select_scaleColor)
        table.rows[1].cells[0].textContent="Solid color:"
        table.rows[1].cells[1].appendChild(inputColorSolid)
        table.rows[2].cells[0].textContent="Variable:"
        table.rows[2].cells[1].appendChild(select_colorColMain)
        table.rows[2].cells[2].appendChild(select_colorCol)
        table.rows[3].cells[0].textContent="min/max:"
        table.rows[3].cells[1].appendChild(input_minColor)
        table.rows[3].cells[1].appendChild(input_maxColor)
        table.rows[4].cells[0].textContent="Relative(%)color scale:"
        table.rows[4].cells[1].appendChild(checkRelative)
        table.rows[5].cells[0].textContent="Invert color scale : "
        table.rows[5].cells[1].appendChild(checkInvert)
        table.rows[6].cells[0].textContent="Show colour legend : "
        table.rows[6].cells[1].appendChild(checkShowLegend)
        select_scaleColor.addEventListener("change",(d)=>{this.readChangeCfg(d,"nodesColor","colorGradient")})
        inputColorSolid.addEventListener("change",(d)=>{this.readChangeCfg(d,"nodesColor","colorSolid")})
        select_colorColMain.addEventListener("change",(d)=>{
            this.readChangeCfg(d,"nodesColor","colorTypeMain");
            if(this.cfg.nodesColor.colorTypeMain == "variable"){
                select_colorCol.style.visibility = "visible"
            }else{
                select_colorCol.style.visibility = "hidden"
            }
        })
        select_colorCol.addEventListener("change",(d)=>{this.readChangeCfg(d,"nodesColor","colorType")})
        input_minColor.addEventListener("change",(d)=>{this.readChangeCfg(d,"nodesColor","minColor")})
        input_maxColor.addEventListener("change",(d)=>{this.readChangeCfg(d,"nodesColor","maxColor")})
        checkRelative.addEventListener("change",(d)=>{this.readChangeCfg(d,"nodesColor","colorRelative")})
        checkInvert.addEventListener("change",(d)=>{this.readChangeCfg(d,"nodesColor","colorInvert")})
        checkShowLegend.addEventListener("change",(d)=>{this.readChangeCfg(d,"nodesColor","showLegend")})
        
        if(this.cfg.nodesColor.colorTypeMain != "variable"){
            select_colorCol.style.visibility = "hidden"
        }
        table.addEventListener("change",(d)=>{this.network.updateNodes()})
        return table
    }

    returnEdgeMenu(){
        let table = createTable(7,3)

        var input_mDaTol = menuCreateInput("number","color_min",this.cfg.edges.mDaTol);
        input_mDaTol.style.color = "white";
        input_mDaTol.style.margin = "1px"
        input_mDaTol.title = "Min value of the color scale"

        var input_width = menuCreateInput("number","color_min",this.cfg.edges.width);
        input_width.style.color = "white";
        input_width.style.margin = "1px"
        input_width.title = "The default width (in px) of links on the graph part"

        var input_color = menuCreateInput("color","color_min",this.cfg.edges.color);
        input_color.style.color = "white";
        input_color.style.margin = "1px"
        input_color.title = "The default color of links on the graph part"

        let presetOptions =[{name:"Petroleum",value:"petroleum"},{name:"DOM",value:"dom"},{name:"Sugars",value:"sugars"},{name:"Fluorinated polymer",value:"fluor"}]
        var input_selectPreset = menuCreateInput("select","preset_links","",presetOptions);
        input_selectPreset.style.color = "white";
        input_selectPreset.style.margin = "1px"
        input_selectPreset.title = "A preset of links to load"

        let presetButton = document.createElement("button")
        presetButton.innerHTML = "LOAD"
        presetButton.addEventListener("click",()=>{this.loadNetworkPreset()})

        let buttonEdit = document.createElement("button")
        buttonEdit.innerHTML = "EDIT LINKS"
        buttonEdit.addEventListener("click",()=>{new Popup_editLinksVis("linksvis",this.network, this.cfg)})

        table.rows[2].cells[0].textContent="mDa Tol:"
        table.rows[3].cells[0].textContent="Default width:"
        table.rows[4].cells[0].textContent="Default color:"
        table.rows[5].cells[0].textContent="Load a preset:"
        table.rows[0].cells[0].appendChild(buttonEdit)
        table.rows[2].cells[1].appendChild(input_mDaTol)
        table.rows[3].cells[1].appendChild(input_width)
        table.rows[4].cells[1].appendChild(input_color)
        table.rows[5].cells[1].appendChild(input_selectPreset)
        table.rows[5].cells[1].appendChild(presetButton)

        input_mDaTol.addEventListener("change",(d)=>{this.readChangeCfg(d,"edges","mDaTol");this.network.startSim()})
        input_width.addEventListener("change",(d)=>{this.readChangeCfg(d,"edges","width");this.network.startSim()})
        input_color.addEventListener("change",(d)=>{this.readChangeCfg(d,"edges","color");this.network.startSim()})

        return table
    }

    returnInteractivityMenu(){
        let table = createTable(7,3)
        var typeOptions = [{name:"Only a tooltip",value:"tooltip"},{name:"Tooltip + highlight",value:"highlight"}]
        var select_colorColMain = menuCreateInput("select","type",this.cfg.interactivity.hovering,typeOptions)
        select_colorColMain.style.color = "white";
        select_colorColMain.style.margin = "1px"
        select_colorColMain.title ="Choose what happens when you hover a point"

        table.rows[1].cells[0].textContent="Hovering behaviour:"
        table.rows[1].cells[1].appendChild(select_colorColMain)

        select_colorColMain.addEventListener("change",(d)=>{this.readChangeCfg(d,"interactivity","hovering")})
        
        return table
    }

    returnSimulationMenu(){
        let table = createTable(7,3)

        var input_sizeX = menuCreateInput("number","sizex",this.cfg.simulation.size[0]);
        input_sizeX.style.color = "white";
        input_sizeX.style.margin = "1px"
        input_sizeX.title = "x size of the simulation area"
        var input_sizeY = menuCreateInput("number","sizex",this.cfg.simulation.size[1]);
        input_sizeY.style.color = "white";
        input_sizeY.style.margin = "1px"
        input_sizeY.title = "y size of the simulation area"
        var input_forceX = menuCreateInput("number","sizex",this.cfg.simulation.forcex);
        input_forceX.style.color = "white";
        input_forceX.style.margin = "1px"
        input_forceX.title = "centrifugal force on the x axis"
        var input_forceY = menuCreateInput("number","sizex",this.cfg.simulation.forcey);
        input_forceY.style.color = "white";
        input_forceY.style.margin = "1px"
        input_forceY.title = "centrifugal force on the y axis"
        var input_repforce = menuCreateInput("number","sizex",this.cfg.simulation.forceManyBody);
        input_repforce.style.color = "white";
        input_repforce.style.margin = "1px"
        input_repforce.title = "The repulsion force between two nodes"
        var input_distancelink = menuCreateInput("number","sizex",this.cfg.simulation.distanceLink);
        input_distancelink.style.color = "white";
        input_distancelink.style.margin = "1px"
        input_distancelink.title = "The default distance targeted between two nodes, given in pixels"
        var input_forcelink = menuCreateInput("number","sizex",this.cfg.simulation.forceLink);
        input_forcelink.style.color = "white";
        input_forcelink.style.margin = "1px"
        input_forcelink.title = "The attractive force of nodes linked. Shouldn't exceed 3"

        table.rows[1].cells[0].textContent="Simulation size (px):"
        table.rows[1].cells[0].appendChild(input_sizeX)
        table.rows[1].cells[0].appendChild(input_sizeY)
        table.rows[2].cells[0].textContent="Centrifuge force (x-y):"
        table.rows[2].cells[0].appendChild(input_forceX)
        table.rows[2].cells[0].appendChild(input_forceY)
        table.rows[3].cells[0].textContent="Repulsion force :"
        table.rows[3].cells[0].appendChild(input_repforce)
        table.rows[4].cells[0].textContent="Default link length (px) :"
        table.rows[4].cells[0].appendChild(input_distancelink)
        table.rows[5].cells[0].textContent="Default link force :"
        table.rows[5].cells[0].appendChild(input_forcelink)

        input_sizeX.addEventListener("change",(d)=>{this.cfg.simulation.size[0] = d.target.value})
        input_sizeY.addEventListener("change",(d)=>{this.cfg.simulation.size[1] = d.target.value})
        input_forceX.addEventListener("change",(d)=>{this.readChangeCfg(d,"simulation","forcex")})
        input_forceY.addEventListener("change",(d)=>{this.readChangeCfg(d,"simulation","forcey")})
        input_repforce.addEventListener("change",(d)=>{this.readChangeCfg(d,"simulation","forceManyBody")})
        input_distancelink.addEventListener("change",(d)=>{this.readChangeCfg(d,"simulation","distanceLink")})
        input_forcelink.addEventListener("change",(d)=>{this.readChangeCfg(d,"simulation","forceLink")})

        table.addEventListener("change",(d)=>{this.network.startSim()})
        return table
    }

    returnInfoMenu(){
        let table = createTable(7,3)
        table.rows[1].cells[0].textContent ="Number of edges:"
        table.rows[2].cells[0].textContent ="Mean Neighbours targets:"
        table.rows[3].cells[0].textContent ="Network density:"
        table.rows[4].cells[0].textContent ="Mean Clustering:"
        table.rows[1].cells[1].textContent = this.network.edges.length
        table.rows[2].cells[1].textContent = this.network.getMeanNeighbours().toFixed(3)
        table.rows[3].cells[1].textContent = this.network.getDensity().toFixed(4)
        table.rows[4].cells[1].textContent = this.network.getMeanClusteringCoeff().toFixed(4)

        return table
    }

    /** read a change in the cfg */
    readChangeCfg(event,cfgCategory,variableName){
        let input = event.target
        if(input.type =="text" || input.type =="number"|| input.type =="select-one"){
            this.cfg[cfgCategory][variableName] = input.value
        }else{
            this.cfg[cfgCategory][variableName] = input.checked
        }
    }

    loadNetworkPreset(){
        let value = this.editMenu.querySelector("select[name='preset_links']").value
        this.cfg.edges.list = [];
        if(value == "petroleum"){
            this.cfg.edges.list.push({formula:"CH2",mass:14.01565,color:"black",width:'',length:'',force:''})
            this.cfg.edges.list.push({formula:"H2",mass:2.01565,color:"",width:"",length:"",force:""})
            this.cfg.edges.list.push({formula:"S",mass:31.972071,color:"yellow",width:"",length:"",force:""})
        }else if(value == "dom"){
            this.cfg.edges.list.push({formula:"CH2",mass:14.01565,color:"black",width:'',length:'',force:''})
            this.cfg.edges.list.push({formula:"H2O",mass:18.0105647,color:"red",width:"",length:"",force:""})
            this.cfg.edges.list.push({formula:"NH3",mass:17.026549,color:"blue",width:"",length:"",force:""})
        }else if(value == "sugars"){
            this.cfg.edges.list.push({formula:"CH2O",mass:30.010565,color:"black",width:'',length:'',force:''})
            this.cfg.edges.list.push({formula:"H2O",mass:18.0105647,color:"black",width:"",length:"",force:""})
            this.cfg.edges.list.push({formula:"C6H10O5",mass:162.052825,color:"red",width:"2",length:"",force:""})
        }else if(value == "fluor"){
            this.cfg.edges.list.push({formula:"CH2",mass:14.01565,color:"black",width:'',length:'',force:''})
            this.cfg.edges.list.push({formula:"O",mass:15.994915,color:"black",width:'',length:'',force:''})
            this.cfg.edges.list.push({formula:"HF",mass:20.006228,color:"orange",width:"",length:"",force:""})
            this.cfg.edges.list.push({formula:"F2",mass:37.996806,color:"orange",width:"",length:"",force:""})
        }
        this.network.startSim()

    }
    
    findData(fileName){
        this.network = new NetworkVisual(this.cfg, this, this.tooltip)
        this.network.fillFromName(fileName)
    }

}



//////////////////////////////////////////////////////////
/// A SUBCLASS OF NETWORKS TO  PRODUCE VISUALS
///////////////////////////////////////////////////////////

class NetworkVisual extends Network{
    constructor(cfg, topMenu, tooltip) {
        super()
        this.topMenu = topMenu
        this.cfg = cfg || topMenu.cfg
        this.tooltip = tooltip
        this.attributedNetwork = false
        this.startSim()
    }

    startSim(){
        //build the list of links
        let linksNames = []
        let linksMasses =[]
        for(let i=0; i<this.cfg.edges.list.length; i++){
            if(!this.cfg.edges.list[i].formula || this.cfg.edges.list[i].formula == ""){continue;}
            linksNames.push(this.cfg.edges.list[i].formula)
            linksMasses.push(this.cfg.edges.list[i].mass)
        }

        if(!this.attributedNetwork){
            this.edges = []
            this.updateAdjacencyList()
            this.linkDeltaMassList(linksNames,linksMasses,this.cfg.edges.mDaTol)
        }
        this.buildElements()
    }


    buildElements(){
        this.vis = {}
        this.links = []
        if(document.querySelector("#canvasNetwork").querySelector("#networkNode")){
            document.querySelector("#canvasNetwork").querySelector("#networkNode").remove()
        }
        if(document.querySelector("#canvasNetwork").querySelector("#networkLink")){
            document.querySelector("#canvasNetwork").querySelector("#networkLink").remove()
        }
        if(!this.nodes || this.nodes.length == 0){return;}
        if(!this.edges || this.edges.length == 0){return;}
        for(let i=0; i<this.edges.length; i++){
            this.links[i] = {}
            this.links[i].source = this.edges[i].source
            this.links[i].target = this.edges[i].target
            this.links[i].formula = this.edges[i].name
            this.links[i].sourceID = this.edges[i].source
            this.links[i].targetID = this.edges[i].target
            this.links[i].index = i
        }

        let cfgSim = this.cfg.simulation
        //creates the space
        document.querySelector("#canvasNetwork").querySelector("#spaceNetwork").remove()
        this.vis.space = d3.select("#canvasNetwork")
        .insert("svg", "endNetwork")
        .attr("width", cfgSim.size[0])
        .attr("height", cfgSim.size[1])
        .attr("id","spaceNetwork")
        .append("g")
        //create the simulation
        this.vis.sim = d3.forceSimulation(this.nodes)
        .force("charge", d3.forceManyBody().strength(cfgSim.forceManyBody).distanceMax(1000))
        .force("center", d3.forceCenter(cfgSim.size[0]/2, cfgSim.size[1]/2).strength(0.1))
        .force("x", d3.forceX().x(function(d){return cfgSim.size[0]/2}).strength(cfgSim.forcex))
        .force("y", d3.forceY().y(function(d){return cfgSim.size[1]/2}).strength(cfgSim.forcey))
        // .force("radial", d3.forceRadial(0, cfgN.simulation.size[0]/2, cfgN.simulation.size[1]/2).strength(1))
        .force("links",d3.forceLink().links(this.links).distance((d)=>{return this.returnLinkLength(d)}).strength((d)=>{return  this.returnLinkStrength(d)}))
        .on("tick",()=>{this.ticked()})

        //append the links
        this.vis.edges = this.vis.space.append("g").attr("id","networkLink")
        .selectAll("line")
        .data(this.links)
        .enter()
        .append("line")
        .attr("style",(d) =>{ return "stroke:"+(this.returnLinkColor(d))+";stroke-width:"+(this.returnLinkWidth(d))})
        .attr('x1', function(d) { return d.source.x})
        .attr('x2', function(d) { return d.target.x})
        .attr('y1', function(d) { return d.source.y})
        .attr('y2', function(d) { return d.target.y})
        .attr('tooltipHTML', function(d,n){return "networkLink;network;"+d.name})
        .attr('index_link',function(d,n){return n})
        .attr('formula',function(d) { return d.name})
        .on("mouseover",(d)=>{this.tooltip.mouseover(d)})
        .on("mousemove", (d,n)=>{this.tooltip.mousemove(d,n,this)}  )
        .on("mouseleave" ,(d)=>{ this.tooltip.mouseleave(d)}  )
        .on("click", (d,n)=>{this.tooltip.mouseclick(d,n,this)} );

        //prepares the nodes color scale
        this.prepareColorScale()
        let cfg = this.cfg.nodesColor
        //append the nodes
        this.vis.nodes = this.vis.space.append('g').attr("id", "networkNode")
        .selectAll("circle")
        .data(this.nodes)
        .enter()
        .append("circle")
        .attr("cx", function (d) {return d.x } ) 
        .attr("cy", function (d) { return d.y } ) 
        .attr("r",  (d,n) => {return this.returnNodeSize(d,n)})
        .attr('tooltipHTML', function(d,n){ return "scatterPlot;network;"+n})
        .attr('index',function(d,n){return n})
        .style("fill", (d,n) =>{
            if(cfg.colorGradient == "solid"){return this.colorScale(0)}
            else if(cfg.colorTypeMain == "variable"){return this.colorScale(d[cfg.colorType])}
            else if(cfg.colorTypeMain == "neighbour"){return this.colorScale(this.getNeighbours_bothSides(n).length)}
            else if(cfg.colorTypeMain == "neighbour2"){return this.colorScale(this.getNeighbours(n).length)}
            else if(cfg.colorTypeMain == "cluster"){return this.colorScale(this.getClusteringCoeff(n))}
            else if(cfg.colorTypeMain == "hasFormula"){
                if(d.attrib){return "#5aad5f"}
                else if(d[config.formulatext] && d[config.formulatext] !=""){return "#5aad5f"}
                return "#df4f50"
            }
        })
        .on("mouseover",(d)=>{this.tooltip.mouseover(d)})
        .on("mousemove",(d,n)=>{ this.tooltip.mousemove(d,n,this)}  )
        .on("mouseleave" ,(d)=>{ this.tooltip.mouseleave(d)}  )
        .on("click", (d,n)=>{this.tooltip.mouseclick(d,n,this)} );

        this.drawColourLegends()

        //removes nodes without edges if needed
        if(!this.cfg.nodes.showLoneNodes){
            this.vis.nodes.filter((d,n)=>{
                let neighboursNum = this.getNeighbours_bothSides(n).length
                if(neighboursNum>0){return false}else{return true}
            }).remove()
            //updates the simulation forces to make no phantom forces
            this.vis.sim.force("charge", d3.forceManyBody().strength(this.cfg.simulation.forceManyBody).distanceMax(1000))
        }

        this.createInteractivity()

    }

     //every tick, updates the position of the nodes
    ticked(){
        if(this.paused){return;}
        if(!this.nodes || this.nodes.length == 0){return;}
        //adds walls to the simulation, every 10 ticks approximately
        var rand =  Math.floor(Math.random() * 10)
        if(rand == 0){
            for(let i=0; i<this.nodes.length; i++){
                if(this.nodes[i].x>this.cfg.simulation.size[0]){
                    this.nodes[i].x = this.cfg.simulation.size[0]
                }else if(this.nodes[i].x<0){
                    this.nodes[i].x = 0
                 }
                if(this.nodes[i].y>this.cfg.simulation.size[1]){
                    this.nodes[i].y = this.cfg.simulation.size[1]
                }else if(this.nodes[i].y<0){
                    this.nodes[i].y = 0
                }
            }
        }
        this.vis.nodes.attr("cx", function (d) {return d.x } )
        .attr("cy", function (d) { return d.y } )
        
        this.vis.edges.attr('x1', function(d) { return d.source.x})
        .attr('x2', function(d) { return d.target.x})
        .attr('y1', function(d) { return d.source.y})
        .attr('y2', function(d) { return d.target.y})
    }

    createInteractivity(){
        //adds the dragging behavior
        // Add a drag behavior. The _subject_ identifies the closest node to the pointer,
        // conditional on the distance being less than 20 pixels.
            
        this.vis.space.call(d3.drag()
        .subject(event => {
            // console.log(event,this)
        const [px, py] = d3.pointer(event, this.vis.space);
        return d3.least(this.nodes, ({x, y}) => {
            const dist2 = (x - event.x) ** 2 + (y - event.y) ** 2;
            // console.log(x, y,event.x, event.y,dist2)
            if (dist2 < 100) return dist2;
        });
        })
        .on("start", (d)=>{this.dragstarted(d)})
        .on("drag", (d)=>{this.dragged(d)})
        .on("end", (d)=>{this.dragended(d)}));



    }

    updateNodes(){
        this.prepareColorScale()
        let cfg = this.cfg.nodesColor
        this.vis.nodes.attr("r",  (d,n) => { return this.returnNodeSize(d,n)})
        .style("fill", (d,n) =>{
            if(cfg.colorGradient == "solid"){return this.colorScale(0)}
            else if(cfg.colorTypeMain == "variable"){return this.colorScale(d[cfg.colorType])}
            else if(cfg.colorTypeMain == "neighbour"){return this.colorScale(this.getNeighbours_bothSides(n).length)}
            else if(cfg.colorTypeMain == "neighbour2"){return this.colorScale(this.getNeighbours(n).length)}
            else if(cfg.colorTypeMain == "cluster"){return this.colorScale(this.getClusteringCoeff(n))}
            else if(cfg.colorTypeMain == "hasFormula"){
                if(d.attrib){return "#5aad5f"}
                else if(d[config.formulatext] && d[config.formulatext] !=""){return "#5aad5f"}
                return "#df4f50"
            }
        })
        
        this.drawColourLegends()
    }

    updateHiddenNodes(){
        if(!this.cfg.nodes.showLoneNodes){
            this.vis.nodes.filter((d,n)=>{
                let neighboursNum = this.getNeighbours_bothSides(n).length
                if(neighboursNum>0){return false}else{return true}
            }).remove()
            //updates the simulation forces to make no phantom forces
            this.vis.sim.force("charge", d3.forceManyBody().strength(this.cfg.simulation.forceManyBody).distanceMax(1000))
        }else{
            this.startSim()
        }
    }

    returnNodeSize(nodeData, index){
        if(this.cfg.nodes.type =="intensity"){
            return Math.sqrt(nodeData[config.intensity])*this.cfg.nodes.size/config.sizeReductor
        }else if(this.cfg.nodes.type == "neighbours"){
            return this.getNeighbours_bothSides(index).length* this.cfg.nodes.size
        }else if(this.cfg.nodes.type == "neighbours2"){
            return this.getNeighbours(index).length* this.cfg.nodes.size
        }
        return this.cfg.nodes.size
    }

    /** constructs the color scale and returns it. It is also saved at .colorScale */
    prepareColorScale(){
        if(!this.nodes[1]){ console.error('Cannot prepare color scale on empty data')}
        //first: definition of min/max 
        let cfg = this.cfg.nodesColor
        let min = cfg.minColor
        let max = cfg.maxColor
        if(cfg.colorRelative){
            if(cfg.colorTypeMain == "variable"){
                //looks for min and max value of the color 
                //TODO: change [1] if first line of data is changed AND IN THE LOOP
                var minVal = parseFloat(this.nodes[1][cfg.colorType])
                var maxVal = parseFloat(this.nodes[1][cfg.colorType])
                for(let i=1; i<this.nodes.length; i++){
                    if(parseFloat(this.nodes[i][cfg.colorType])<minVal){minVal = parseFloat(this.nodes[i][cfg.colorType])}
                    else if(parseFloat(this.nodes[i][cfg.colorType])>maxVal){maxVal = parseFloat(this.nodes[i][cfg.colorType])}
                }
            }else if(cfg.colorTypeMain == "neighbour"){
                var minVal = this.getNeighbours_bothSides(0).length
                var maxVal = this.getNeighbours_bothSides(0).length
                for(let i=1; i<this.nodes.length; i++){
                    if( this.getNeighbours_bothSides(i).length<minVal){minVal =  this.getNeighbours_bothSides(i).length}
                    else if( this.getNeighbours_bothSides(i).length>maxVal){maxVal =  this.getNeighbours_bothSides(i).length}
                }
            }else if(cfg.colorTypeMain == "neighbour2"){
                var minVal = this.getNeighbours(0).length
                var maxVal = this.getNeighbours(0).length
                for(let i=1; i<this.nodes.length; i++){
                    if( this.getNeighbours(i).length<minVal){minVal =  this.getNeighbours(i).length}
                    else if( this.getNeighbours(i).length>maxVal){maxVal =  this.getNeighbours(i).length}
                }
            }else if(cfg.colorTypeMain == "cluster"){
                var minVal = this.getClusteringCoeff(0)
                var maxVal = this.getClusteringCoeff(0)
                for(let i=1; i<this.nodes.length; i++){
                    if( this.getClusteringCoeff(i)<minVal){minVal =  this.getClusteringCoeff(i)}
                    else if( this.getClusteringCoeff(i)>maxVal){maxVal =  this.getClusteringCoeff(i)}
                }
            }
            let percentValue = (maxVal - minVal)/100
            min = minVal + percentValue*min
            max = minVal + percentValue*max
            cfg.relativeMin = min
            cfg.relativeMax = max
            if(cfg.colorInvert){
                let temp = max
                max = min
                min =temp
            }
        }else{
            if(cfg.colorInvert){
                min = max;
                max = cfg.minColor
            }
        }
        //creation of the color scale
        let colorScale
        if(cfg.colorGradient == "solid"){
            colorScale =  d3.scaleSequential().domain([min, max]).range([cfg.colorSolid, cfg.colorSolid])
        }else if(cfg.colorGradient =="whiteToSolid"){
            colorScale = d3.scaleSequential().domain([min, max]).range(["#ffffff", cfg.colorSolid])
        }else if(cfg.colorGradient && cfg.colorGradient.includes("custom_")){
            //creation of a custom color scale
            let customNb = this.cfg.nodesColor.colorGradient.split("_")[1]
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
            let colorChoice = "interpolate"+cfg.colorGradient
            colorScale = d3.scaleSequential().domain([min, max]).interpolator(d3[colorChoice])
        }
        this.colorScale = colorScale
        return colorScale
    }

    drawColourLegends(){
        if(!this.cfg.nodesColor.showLegend){return;}
        this.colourLegend = ""
          //remove previous
        if(!this.vis.space || !this.vis.space.selectAll){return;}
        this.vis.space.selectAll("g[name='colorLegend']").remove()
        let thisConfig = {
            legendFontSize : config.legendFontSize,
            legendFontSizeSmall : config.legendFontSizeSmall,
            legendFont: config.legendFont,
            width: 400,
            height:0,
            margin:config.margin
        }
        this.colourLegend = createColourLegend(this.vis.space, "nodes", this.cfg.nodesColor , {config:thisConfig}, 0, this.colorScale)
        //change the text if needed
        let textNode = this.topMenu.cvsHTML.querySelector("text[id='legend_nodes_title']")
        if(this.cfg.nodesColor.colorTypeMain == "neighbour"){
            textNode.innerHTML = "nodes, Neighbour number : "
            if(this.cfg.nodesColor.colorRelative){textNode.innerHTML +="(%)" }
            textNode.innerHTML += this.cfg.nodesColor.minColor
        }else if(this.cfg.nodesColor.colorTypeMain == "neighbour2"){
            textNode.innerHTML = "nodes, Targets number : "
            if(this.cfg.nodesColor.colorRelative){textNode.innerHTML +="(%)" }
            textNode.innerHTML += this.cfg.nodesColor.minColor
        }else if(this.cfg.nodesColor.colorTypeMain == "cluster"){
            textNode.innerHTML = "nodes, Clustering coefficient : "
            if(this.cfg.nodesColor.colorRelative){textNode.innerHTML +="(%)" }
            textNode.innerHTML += this.cfg.nodesColor.minColor
        }
    
    }


    // Reheat the simulation when drag starts, and fix the subject position.
    dragstarted(event) {
        if (!event.active) this.vis.sim.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
        }

    // Update the subject (dragged node) position during drag.
    dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    dragended(event) {
        if (!event.active) this.vis.sim.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    returnLinkLength(d){
        let link = this.searchLinkTypes(d.formula)
        if (link.length && link.length != -1 && link.length !=""){return link.length}
        return this.cfg.simulation.distanceLink
    }

    returnLinkStrength(d){
        let link = this.searchLinkTypes(d.formula)
        if (link.force && link.force != -1 && link.force !=""){return link.force}
        return this.cfg.simulation.forceLink
    }

    returnLinkWidth(d){
        let link = this.searchLinkTypes(d.formula)
        if (link.width && link.width != -1 && link.width !=""){return link.width}
        return this.cfg.edges.width
    }

    returnLinkColor(d){
        let link = this.searchLinkTypes(d.formula)
        if (link.color && link.color !=""){return link.color}
        return this.cfg.edges.color
    }

    searchLinkTypes(linkName){
        for(let i=0; i<this.cfg.edges.list.length; i++){
            if(this.cfg.edges.list[i].formula == linkName){return this.cfg.edges.list[i]}
        }
        return "notFound"
    }

    pauseSim(){
        this.paused = !this.paused
    }
}



class TooltipNetworkVis{
    constructor(htmlAnchor, topMenuNetwork){
        this.html = htmlAnchor
        this.topMenu = topMenuNetwork
        this.cfg = topMenuNetwork.cfg
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
        let network = this.topMenu.network
        if(this.cfg.interactivity.hovering == "highlight"){
            //lowers the intensity of all nodes
            network.vis.nodes.style("opacity",0.3)
            //highlights the node and its neighbours
            d3.select(element.target).style("opacity",1)
            //get the neighbours
            d3.select(element.target).each((d,n)=>{
                let neighbours = network.getNeighbours_bothSides(d.index)
                //highlight each neighbour
                for(let i=0; i<neighbours.length; i++){
                    network.vis.nodes.filter((d,n)=>{return neighbours[i].neighbour== n}).style("opacity",1)
                }
            })
        }
    }
    /** moves the tooltip around and modifies its content */
    mousemove(element, data, network){
        let type = element.target.nodeName
        let elClass = element.target.getAttribute('class')
        if(elClass && elClass.includes('tohide')){return;}
        this.htmlDiv.style("left",event.pageX+10)
        this.htmlDiv.style("top",event.pageY+10)
        if(type=="returnThis"){
             this.htmlDiv.html(data);
             return;
        }
        this.htmlDiv.html(this.buildText(type, data,network))
        this.drawSpecialPieChart(data)
    }
    /**makes the tooltip disappear */
    mouseleave(element, doNotChangeOpacity){
        this.htmlDiv.style("opacity",0).style("left",-1000).style("top",-1000)
        if(doNotChangeOpacity){return;}
        let network = this.topMenu.network
        if(this.cfg.interactivity.hovering == "highlight"){
            //resets the intensity of all nodes
            network.vis.nodes.style("opacity",1)
        }
    }
    /** when ctrl is pressed, will make a sticky tooltip */
    mouseclick(element, data, network){
        if(!event.ctrlKey){
            return
        }
        let type = element.target.nodeName
        let elClass = element.target.getAttribute('class')
        if(elClass && elClass.includes('tohide')){return;}
        this.htmlClose.style("opacity", 1)
        this.htmlStick.style("opacity",1)
        this.htmlStick.style("left",event.pageX+10)
        this.htmlStick.style("top",event.pageY+10)
        this.htmlClose.style("left",event.pageX+290)
        this.htmlClose.style("top",event.pageY+10)
        if(type=="returnThis"){
            this.htmlStick.html(data);
            return;
       }
        this.htmlStick.html(this.buildText(type, data,network))

        //highlights the selected dot
        d3.select(element.target).style("stroke", "black")
        d3.select(element.target).style("stroke-dasharray", "6 1")
        d3.select(element.target).style("stroke-dashoffset", "100")
        d3.select(element.target).style("animation", "dash 20s linear infinite")
        d3.select(element.target).style("stroke-width", "10")


    }

    /**
     * builds the html text part of a data tooltip
     * @param {*} type type of chart
     * @param {*} data the data array 
     * @returns a string of html
     */
    buildText(type,data,network){
        let lines=[]
        //writes the chemical
        var cleanFormula = data[config.formulatext] || ""
        var formula = cleanFormula
        var ppm = data[config.ppmerror]
        if(data.attrib){
            cleanFormula = data.attrib.name
            formula = data.attrib.name
            ppm = data.attrib.ppmError
        }
        if(cleanFormula && typeof cleanFormula == "string"){
            var regex = new RegExp(/[0-9]/, "gi")
            cleanFormula = cleanFormula.replace(regex, function(matched) {return "<sub>" + matched + "</sub>";})
        }
        //for nodes
        if(type =="circle"){
            lines[0] = "formula :"+(cleanFormula)+"<button class='databaseSearch' onclick='seekDataBasePopup(`"+formula+"`)'> search DB </button>"
            lines[1] = "m/z :"+(data[config.mz] || "")+"<button class='databaseSearch' onclick='popupSinglePeakMassSearch(`"+data[config.mz]+"`)'> show formulae </button>"
            lines[2] = "ppm error :"+(parseFloat(ppm).toFixed(6) || "")+"<button class='databaseSearch' onclick='popupAddToCalibList(`"+formula+"`)'> Add to calibration list </button>"
            lines[3] = "----------"
            lines[4] = "Neighbours :"+network.getNeighbours_bothSides(data.index).length
            lines[5] = "Neighbours(targets):"+network.getNeighbours(data.index).length
            lines[6] = "Clustering coeff:"+network.getClusteringCoeff(data.index)

            if(config.customTooltipData.length>0){
             lines[7] = "----------"
            }
            for(let i=0; i<config.customTooltipData.length; i++){
            lines[7+i] = columnNames[config.customTooltipData[i]] + ":"+data[config.customTooltipData[i]]
            }
        //for edges:
        }else if(type == "line"){
            lines[0] = "link Type:"+data.formula
            let sourceFormula = data.source[config.formulatext]
            let targetFormula = data.target[config.formulatext]
            if(data.source.attrib){sourceFormula = data.source.attrib.name}
            if(data.target.attrib){targetFormula = data.target.attrib.name}
            lines[1] = "source : "+sourceFormula
            lines[2] = "target : "+targetFormula

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

    /**  a function to find the good dataset and produce a pie chart of it on a tooltip*/
     drawSpecialPieChart(peakData){
        if(!config.tooltipPie.allow){return;}//skip if tooltip Pie is not allowed

        let dataString = this.topMenu.network.dataName
        let dataParam = linkFileParamFromDataString(dataString)
        let data = this.topMenu.network.nodes
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
            drawPieChart(dataArray,namesList, this.htmlDiv, config.tooltipPie.colors, 'white')
        }
    }
}


class Popup_editLinksVis extends Popup {
    constructor(name, network, cfg) {
        super("linksVisEdit","Edit here the list of links between attributions <br>")
        this.network = network
        this.cfg = cfg
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
        this.list = []
        this.cfg.edges.list.forEach((item)=>{
            let newItem = {"formula":item.formula,"mass":item.mass,"color":item.color,"length":item.length,"force":item.force,"width":item.width}
            this.list.push(newItem)
        })
        this.addFirstLine()
        //creates a table
        for(let i=0; i<this.cfg.edges.list.length; i++){
            this.addLine()
        }
        this.preText.appendChild(htmlTable)
        //adds the + button
        this.addButton = document.createElement("button")
        this.addButton.setAttribute("name","addElButton")
        this.addButton.setAttribute("class","smallpopupbutton")
        this.addButton.addEventListener("click", ()=>{
            this.addLine()
        })
        this.addButton.innerHTML = "Save and add a mass"
        this.preText.appendChild(document.createElement("br"))
        this.preText.appendChild(this.addButton)
        let separatorBox =document.createElement("div")
        this.popup_box.appendChild(separatorBox)
        this.valButton.addEventListener("click",()=>{
            this.cfg.edges.list = this.list; 
            this.network.startSim()
        }) //TODO add update
    }
    addFirstLine(){
        let newLength = this.elLine.length
        this.elLine[newLength] = document.createElement("tr")
        this.elCells[newLength] = []
        for(let j=0; j<7; j++){
            this.elCells[newLength][j] = document.createElement("td")
            this.elLine[newLength].appendChild(this.elCells[newLength][j])
        }
        this.elCells[newLength][0].innerHTML = "Formula"
        this.elCells[newLength][1].innerHTML = "Mass"
        this.elCells[newLength][2].innerHTML = "Color"
        this.elCells[newLength][3].innerHTML = "Width"
        this.elCells[newLength][4].innerHTML = "Length"
        this.elCells[newLength][5].innerHTML = "Force"
        this.elCells[newLength][6].innerHTML = "X"
        this.htmlTable.appendChild(this.elLine[newLength])
    }

    addLine(){
        let newLength = this.elLine.length
        let list = this.list
        this.elLine[newLength] = document.createElement("tr")
        this.elCells[newLength] = []
        for(let j=0; j<7; j++){
                this.elCells[newLength][j] = document.createElement("td")
                this.elLine[newLength].appendChild(this.elCells[newLength][j])
        }
        this.elInputs[newLength]=[]
        this.elInputs[newLength][0]= document.createElement("input")
        this.elInputs[newLength][0].setAttribute("type","text")
        this.elInputs[newLength][0].setAttribute("name","formula"+i)
        this.elInputs[newLength][0].style.width = "120px"
        this.elInputs[newLength][0].addEventListener("change",(d) =>{
            let newMol = new Molecule(d.target.value)
            if(newMol.mass){
                this.list[newLength-1].mass = newMol.mass
                this.htmlTable.querySelector("input[name='mass"+(newLength-1)+"']").value = newMol.mass
            }
            this.readChange(d,newLength-1,"formula")
        })

        this.elInputs[newLength][1]= document.createElement("input")
        this.elInputs[newLength][1].setAttribute("type","number")
        this.elInputs[newLength][1].setAttribute("name","mass"+(newLength-1))
        this.elInputs[newLength][1].style.width = "120px"
        this.elInputs[newLength][1].addEventListener("change",(d) =>{this.readChange(d,newLength-1,"mass")})

        this.elInputs[newLength][2]= document.createElement("input")
        this.elInputs[newLength][2].setAttribute("type","text")
        this.elInputs[newLength][2].classList.add("coloris")
        this.elInputs[newLength][2].setAttribute("name","color"+(newLength-1))
        this.elInputs[newLength][2].setAttribute("placeholder",this.cfg.edges.color)
        this.elInputs[newLength][2].addEventListener("change",(d) =>{this.readChange(d,newLength-1,"color")})

        this.elInputs[newLength][3]= document.createElement("input")
        this.elInputs[newLength][3].setAttribute("type","number")
        this.elInputs[newLength][3].setAttribute("name","width"+(newLength-1))
        this.elInputs[newLength][3].setAttribute("placeholder",this.cfg.edges.width)
        this.elInputs[newLength][3].addEventListener("change",(d) =>{this.readChange(d,newLength-1,"width")})

        this.elInputs[newLength][4]= document.createElement("input")
        this.elInputs[newLength][4].setAttribute("type","number")
        this.elInputs[newLength][4].setAttribute("name","length"+(newLength-1))
        this.elInputs[newLength][4].setAttribute("placeholder",this.cfg.simulation.distanceLink)
        this.elInputs[newLength][4].addEventListener("change",(d) =>{this.readChange(d,newLength-1,"length")})

        this.elInputs[newLength][5]= document.createElement("input")
        this.elInputs[newLength][5].setAttribute("type","number")
        this.elInputs[newLength][5].setAttribute("name","force"+(newLength-1))
        this.elInputs[newLength][5].setAttribute("placeholder",this.cfg.simulation.forceLink)
        this.elInputs[newLength][5].addEventListener("change",(d) =>{this.readChange(d,newLength-1,"force")})

        if(list[newLength-1]){
            this.elInputs[newLength][0].setAttribute("value",list[newLength-1].formula ||"")
            this.elInputs[newLength][1].setAttribute("value",list[newLength-1].mass)
            this.elInputs[newLength][2].setAttribute("data-coloris",list[newLength-1].color)
            this.elInputs[newLength][2].setAttribute("value",list[newLength-1].color)
            this.elInputs[newLength][3].setAttribute("value",list[newLength-1].width)
            this.elInputs[newLength][4].setAttribute("value",list[newLength-1].length)
            this.elInputs[newLength][5].setAttribute("value",list[newLength-1].force)
        }else{
            this.list.push({formula:"",mass:"",color:"",width:"",length:"",force:""})
            this.elInputs[newLength][2].setAttribute("data-coloris", "")
        }

        this.elInputs[newLength][6]= document.createElement("button")
        this.elInputs[newLength][6].setAttribute("name","deleteLink_"+newLength)
        this.elInputs[newLength][6].setAttribute("class","smallerpopupbutton")
        this.elInputs[newLength][6].addEventListener("click", (d)=>{
            this.removeLine(d)
        })
        this.elInputs[newLength][6].innerHTML = "DEL"

        this.elCells[newLength][0].appendChild(this.elInputs[newLength][0])
        this.elCells[newLength][1].appendChild(this.elInputs[newLength][1])
        this.elCells[newLength][2].appendChild(this.elInputs[newLength][2])
        this.elCells[newLength][3].appendChild(this.elInputs[newLength][3])
        this.elCells[newLength][4].appendChild(this.elInputs[newLength][4])
        this.elCells[newLength][5].appendChild(this.elInputs[newLength][5])
        this.elCells[newLength][6].appendChild(this.elInputs[newLength][6])
        this.htmlTable.appendChild(this.elLine[newLength])
    }

    removeLine(d){
        let index = d.target.parentElement.parentElement.rowIndex -1
        this.elInputs.splice(index,1)
        this.elCells.splice(index,1)
        this.elLine.splice(index,1)
        this.list.splice(index,1)

        this.htmlTable.deleteRow(index+1)
    }
    readChange(event, index, varName){
        let input = event.target
        if(input.type =="text" || input.type =="number"){
            this.list[index][varName] = input.value
        }else{
            this.list[index][varName] = input.checked
        }
    }
}


class Popup_networkScreenshot extends Popup{
    constructor(canvas) {
        super("canvasScreenshot","Choose the format of export")
        this.canvas = canvas
        var buttons = [
            {"name":"Export image (png)", "function":()=>{this.exportPNG()}},
            {"name":"Export vectorial image (svg)", "function":()=>{this.exportSVG()}}
        ]
        this.buildInputs([], [], buttons)
        this.valButton.remove()
    }

    exportSVG(){
        let downloadTarget = this.canvas.cvsHTML.querySelector("svg[id='spaceNetwork']")
        /**gets the information of the screenshot zone */
         /**defines the name of the chart */
        let fileName = "puncdata_network"
        var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
        setInlineStylesSVG(downloadTarget)
        downloadTarget.source = [doctype +  (new XMLSerializer()).serializeToString(downloadTarget)]
        downloadSVG(downloadTarget, fileName)
        this.popup_close.click()
    }

    async exportPNG(){
        let html_canvas = this.canvas.cvsHTML.querySelector("div[id='canvasNetwork']")
        var screenshot = null
        let thisCanvas = this.canvas.cvsHTML
        await html2canvas(html_canvas).then((canvas)=> {
            screenshot = this.popup_box.appendChild(canvas)
            screenshot.id = "screenshot_image"
        });
        var fileName = "puncdata_network";
        var file = document.getElementById("screenshot_image")
        console.log(fileName, screenshot)
        downloadFile(fileName, screenshot, "png")
        this.popup_close.click()
    }

}

class Popup_searchPeaksNetwork extends Popup{
    constructor(network) {
        super("configInteractivity","Search function <br> The second input zone is only useful if you want to highlight repeat units")
        this.network = network
        var buttons = [
        {"name":"Search and highlight","function":(d)=>{this.validateInputs()}},
        ]
        var inputs = [
        {"type":"text", "placeholder":"Enter here the search terms"},
        {"type":"text", "placeholder":"Repeat unit searched"},
        {"type":"text", "placeholder":"ppm tolerance (only for mass search)"}
        ]
        var selecters = [{"name":"searchMode", "options":[]}]
        selecters[0].options = [
          {"value":"formula", "text":"Search Exact Formula"},
          {"value":"mass", "text":"Search Mass "},
    
        ]

        this.buildInputs(selecters, inputs, buttons)
        this.valButton.remove()
    }

    validateInputs(){
        //reads backs values
        if(!this.popup_box.querySelector("select[name='popup_selecter_0']")){return;}
        let typeRead = this.popup_box.querySelector("select[name='popup_selecter_0']").value
        let searchValue = this.popup_box.querySelector("input[name='popup_input_0']").value
        let repeatUnit = this.popup_box.querySelector("input[name='popup_input_1']").value
        let ppmTol = this.popup_box.querySelector("input[name='popup_input_2']").value

        //closes if no search value
        if(searchValue == ""){
            this.popup_close.click()
            return;
        }
        console.log(typeRead)
        if(typeRead =="formula"){
            this.searchDataPoints_formula(searchValue, repeatUnit)
        }else if(typeRead == "mass"){
            let repeatUnitMass = repeatUnit
            if(isNaN(repeatUnitMass)){
                let ruFormula = new ChemFormula(repeatUnitMass)
                repeatUnitMass = ruFormula.mass
            }
            let mass = searchValue
            if(isNaN(mass)){
                let formula = new ChemFormula(mass)
                mass = formula.mass
            }
            let searchObject = {
                nature: typeRead,
                ppmTol: parseFloat(ppmTol),
                repeatUnit : repeatUnitMass,
                value: mass
            }
            this.searchDataPoints_mass(searchObject)
        }
        
        this.popup_close.click()
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
        //de-opacify everything
        this.network.vis.nodes.style("opacity",0.3)
        this.network.vis.edges.style("opacity",0.5)
        //re-opacify nodes to highlight
        //it's completely unoptimized but it gets the job done for files <10k peaks
        for(let j=0; j<searchList.length; j++){
            this.network.vis.nodes.filter((d)=>{return d[config.formulatext]==searchList[j]}).style("opacity",1)
        }

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
        //de-opacify everything
        this.network.vis.nodes.style("opacity",0.3)
        this.network.vis.edges.style("opacity",0.5)
        //re-opacify nodes to highlight
        for(let j=0; j<searchList.length; j++){
            this.network.vis.nodes.filter((d)=>{
                let error = 1e6*Math.abs(d[config.mz]-searchList[j])/d[config.mz]
                return (error<searchObject.ppmTol)
            })
            .style("opacity",1)
        }
    }
}


class Popup_networkData extends Popup{
    constructor(network, networkType) {
        super("configInteractivity","Data about the edges of the network:")
        this.network = network
        this.type = networkType
        this.valButton.remove()

        //builds the data
        this.buildDataTable()
    }

    buildDataTable(){
        //build the data about edges
        let edges = []
        if(this.network.cfg.edges){edges = this.network.cfg.edges.list}
        else if(this.type == "directed"){edges = this.network.cfg.directNetwork.list}
        else if(this.type == "undirected"){edges = this.network.edgesTypes}
        let edgesList = []
        if(this.type == "vis" || this.type == "directed"){
            for(const id in edges){
                edgesList.push({name:edges[id].formula, occurences:this.network.getEdgesByName(edges[id].formula).length})
            }
            //order is important for directed attributive network
            if(this.type == "vis"){ edgesList.sort((a,b)=>b.occurences - a.occurences)}
        }else if(this.type == "undirected"){
            for(const id in edges){
                let formula = edges[id].formula
                let occurences = -1
                if(edges[id].formula == "notAttributed"){
                    formula = "not attributed"
                    occurences = this.network.getEdgesByProperty(edges[id].edgeIndex, "edgeNotAttributedIndex").length
                }else{
                    occurences = this.network.getEdgesByName(edges[id].formula).length
                }
                edgesList.push({
                        name:formula,
                        occurences:occurences,
                        mass : edges[id].massExp,
                        errormDa : edges[id].errormDa
                    })
            }
        }

        let tableWidth = 2
        if(this.type == "undirected"){tableWidth = 4}
        let table = createTable(edgesList.length+1,tableWidth)
        table.rows[0].cells[0].textContent = "Link type"
        table.rows[0].cells[1].textContent = "# Occurences"
        if(this.type == "undirected"){
            table.rows[0].cells[2].textContent = "Mass (Measured)"
            table.rows[0].cells[3].textContent = "mDa error"
        }
        for(let i=1; i<edgesList.length+1; i++){
            table.rows[i].cells[0].textContent = edgesList[i-1].name
            table.rows[i].cells[1].textContent = edgesList[i-1].occurences
            if(this.type == "undirected"){
                table.rows[i].cells[2].textContent = edgesList[i-1].mass?edgesList[i-1].mass.toFixed(4):""
                table.rows[i].cells[3].textContent = edgesList[i-1].errormDa?edgesList[i-1].errormDa.toFixed(4):""
            }
        }
        this.popup_box.appendChild(table)

        let button = document.createElement("button")
        button.innerHTML = "Copy"
        button.setAttribute("name","buttonCopy")
        button.setAttribute("class","popupclose")
        button.addEventListener("click", ()=>{
            closePopup(button);
            let text = ""
            if(this.type =="undirected"){
                text = "Formula"+'\t'+"#Occurences"+'\t'+"Mass(measured)"+'\t'+"mDa error"+'\n'
                for(let i=0; i<edgesList.length; i++){
                     text += edgesList[i].name +'\t'+edgesList[i].occurences+'\t'+edgesList[i].mass+'\t'+edgesList[i].errormDa+'\n'
                }
            }else{
                text = "Link type"+'\t'+"#Occurences"+'\n'
                for(let i=0; i<edgesList.length; i++){
                    text += edgesList[i].name +'\t'+edgesList[i].occurences+'\n'
                }
            }
            navigator.clipboard.writeText(text)
        })
        this.popup_box.appendChild(button)

    }
}

class Popup_networkCluster extends Popup{
    constructor(network) {
        super("configInteractivity","Create interconnected group <br> Each member of a group will be given a group ID <br> It will be added as a new column at the end of the file")
        this.network = network
        var buttons = [
        {"name":"Add Cluster Column (any size)","function":(d)=>{this.addClusters(false)}},
        {"name":"Add Cluster Column (avoid lone peaks)","function":(d)=>{this.addClusters(true)}},
        ]
        this.buildInputs([], [], buttons)
        this.valButton.remove()
    }

    addClusters(ignoreLoneDots){
        this.network.tagClusters(ignoreLoneDots)
        this.popup_close.click()
    }
}


class Popup_edgesData extends Popup{
    constructor(network, networkType) {
        super("configInteractivity","Logs every delta, only 5000 may appear at most, press copy to get all:")
        this.network = network
        this.type = networkType
        this.valButton.remove()

        //builds the data
        this.buildDataTable()
    }

    buildDataTable(){
        //build the data about edges
        let edges = this.network.edges

        let maxLength = Math.min(edges.length, 5000)
        let tableWidth = 4
        if(this.type == "attribution"){tableWidth = 10}
        let table = createTable(maxLength+1,tableWidth)
        table.rows[0].cells[0].textContent = "Index"
        table.rows[0].cells[1].textContent = "Source Index"
        table.rows[0].cells[2].textContent = "Target Index"
        table.rows[0].cells[3].textContent = "Name"
        if(this.type == "attribution"){
            table.rows[0].cells[4].textContent = "Source"
            table.rows[0].cells[5].textContent = "Target"
            table.rows[0].cells[6].textContent = "Source Mass"
            table.rows[0].cells[7].textContent = "Target Mass"
            table.rows[0].cells[8].textContent = "Error(mDa)"
            table.rows[0].cells[9].textContent = "Valid?"
        }
        for(let i=1; i<maxLength+1; i++){
            table.rows[i].cells[0].textContent = i
            table.rows[i].cells[1].textContent = edges[i-1].source
            table.rows[i].cells[2].textContent = edges[i-1].target
            table.rows[i].cells[3].textContent = edges[i-1].name
            if(this.type == "attribution"){
                let source = this.network.nodes[edges[i-1].source]
                let target = this.network.nodes[edges[i-1].target]
                table.rows[i].cells[4].textContent = source.attrib?source.attrib.name:""
                table.rows[i].cells[5].textContent = target.attrib?target.attrib.name:""
                table.rows[i].cells[6].textContent = source.attrib?source.attrib.mass:source[config.mz]
                table.rows[i].cells[7].textContent = target.attrib?target.attrib.mass:target[config.mz]
                //computes the error if it wasn't
                if(!edges[i-1].error && source.attrib && target.attrib){
                    let formula = new ChemFormula(edges[i-1].name)
                    let delta = parseFloat(target[config.mz]) - parseFloat(source[config.mz])
                    delta -= parseFloat(formula.mass)
                    delta *= 1000
                    edges[i-1].error = delta
                }
                table.rows[i].cells[8].textContent = edges[i-1].error
                table.rows[i].cells[9].textContent = edges[i-1].suspect?"Suspect":"Correct"
                if(!source.attrib && !target.attrib){  table.rows[i].cells[9].textContent = "No connexion"}
                else if(!source.attrib){table.rows[i].cells[9].textContent = "No source" }
                else if(!target.attrib){table.rows[i].cells[9].textContent = "No target" }
            }
        }
        this.popup_box.appendChild(table)

        let button = document.createElement("button")
        button.innerHTML = "Copy"
        button.setAttribute("name","buttonCopy")
        button.setAttribute("class","popupclose")
        button.addEventListener("click", ()=>{
            closePopup(button);
            let text = ""
            if(this.type =="attribution"){
                text = "Link id"+'\t'+"Source id"+'\t'+"Target id"+'\t'+"Name"+'\t'
                text += "Source"+'\t'+"Target"+'\t'+"Source Mass"+'\t'+"Target Mass"+'\t'+"Error(mDa)"+'\t'+"Is Valid ?"+'\n'
                for(let i=0; i<edges.length; i++){
                    let source = this.network.nodes[edges[i].source]
                    let target = this.network.nodes[edges[i].target]
                    let sourceName = ""
                    let targetName = ""
                    let sourceMass = source[config.mz]
                    let targetMass = target[config.mz]
                    let isWrong = edges[i].suspect?"Suspect":"Correct"
                    if(!source.attrib && !target.attrib){isWrong = "No connexion"}
                    else if(!source.attrib){isWrong = "No source"}
                    else if(!target.attrib){isWrong = "No target"}
                    if(source.attrib){sourceName = source.attrib.name; sourceMass = source.attrib.mass}
                    if(target.attrib){targetName = target.attrib.name; targetMass = target.attrib.mass}
                    //computes the error if it wasn't
                    if(!edges[i].error && source.attrib && target.attrib){
                        let formula = new ChemFormula(edges[i].name)
                        let delta = parseFloat(target[config.mz]) - parseFloat(source[config.mz])
                        delta -= formula.mass
                        delta *= 1000
                        edges[i].error = delta
                    }
                    text += i +'\t'+edges[i].source+'\t'+edges[i].target+'\t'+edges[i].name+'\t'
                    text += sourceName+'\t'+targetName+'\t'+sourceMass+'\t'+targetMass+'\t'+edges[i].error+'\t'+isWrong+'\n'
                }
            }else{
                text = "Link id"+'\t'+"Source id"+'\t'+"Target id"+'\t'+"Name"+'\n'
                for(let i=0; i<edges.length; i++){
                    text += i +'\t'+edges[i].source+'\t'+edges[i].target+'\t'+edges[i].name+'\n'
                }
            }
            navigator.clipboard.writeText(text)
        })
        this.popup_box.appendChild(button)

    }
}


class Popup_exportNetwork extends Popup{
    constructor(network, isAttributionNetwork) {
        super("configInteractivity","Export data about the network as csv files <br> Gephi (open-source software) can read this format ")
        this.network = network
        var buttons = [
        {"name":"Export Nodes","function":(d)=>{this.exportNodes(isAttributionNetwork)}},
        {"name":"Export Edges","function":(d)=>{this.exportEdges(isAttributionNetwork)}},
        ]
        this.buildInputs([], [], buttons)
        this.valButton.remove()
    }

    exportNodes(isAttributionNetwork){
        this.network.exportNodes(isAttributionNetwork)
    }

    exportEdges(isAttributionNetwork){
        this.network.exportEdges(isAttributionNetwork)
    }
}



/** creates the top table */
let canvasNetwork = new TopMenuNetwork(document.getElementById("tab_network"))


//set function to html and to buttons
var html_tabCanvasNetwork = document.getElementById("tab_network")

// html_tabCanvasA.querySelector("button[name='searchButton']").addEventListener("click",(d)=>{
//     new Popup_searchPeaks(canvasA)
// })
html_tabCanvasNetwork.querySelector('button[name="screenshot"]').addEventListener("click", function (){
    new Popup_networkScreenshot(canvasNetwork)
});
html_tabCanvasNetwork.querySelector('button[name="searchButton_canvasN"]').addEventListener("click", function (){
    new Popup_searchPeaksNetwork(canvasNetwork.network)
});
html_tabCanvasNetwork.querySelector('button[name="Linksstat_button"]').addEventListener("click", function (){
    new Popup_networkData(canvasNetwork.network, "vis")
});
html_tabCanvasNetwork.querySelector('button[name="clusterize_Button"]').addEventListener("click", function (){
    new Popup_networkCluster(canvasNetwork.network)
});