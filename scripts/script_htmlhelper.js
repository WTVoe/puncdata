/// functions to handle popups and movable windows

/////
class MovableWindow {
    constructor({ 
        title = "Movable Window", 
        tabs = [{ label: "Tab 1", content: "Content 1" }], 
        width = "400px", 
        height = "300px",
        top = "50p",
        left = "50"
    } = {}) {
        this.tabs = tabs;
        this.currentTab = 0; // Track the currently active tab
        this.top = top
        this.left = left
        this.windowElement = this.createWindowElement(title, width, height);
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;

        this.initDragEvents();
        document.body.appendChild(this.windowElement);
        this.updateContent();
    }

    createWindowElement(title, width, height) {
        // Create the main window container
        const windowContainer = document.createElement("div");
        windowContainer.classList.add("movable-window");
        windowContainer.style.width = width;
        windowContainer.style.height = height;
        windowContainer.style.position = "absolute";
        windowContainer.style.top = this.top;
        windowContainer.style.left = this.left;
        windowContainer.style.border = "1px solid #ccc";
        windowContainer.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.1)";
        windowContainer.style.backgroundColor = "#fff";

        // Create the header
        const header = document.createElement("div");
        header.classList.add("movable-window-header");
        header.style.padding = "10px";
        header.style.cursor = "move";
        header.style.backgroundColor = "#f1f1f1";
        header.style.borderBottom = "1px solid #ccc";
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";

        // Create the title element
        const titleElement = document.createElement("span");
        titleElement.innerText = title;

        // Create the close button
        const closeButton = document.createElement("button");
        closeButton.innerText = "✖";
        closeButton.style.background = "none";
        closeButton.style.border = "none";
        closeButton.style.cursor = "pointer";
        closeButton.style.fontSize = "16px";
        closeButton.style.color = "#333";
        closeButton.style.padding = "0 10px";
        this.closeButton = closeButton
        
        // Attach the close event
        closeButton.addEventListener("click", this.close.bind(this));

        // Append title and close button to the header
        header.appendChild(titleElement);
        header.appendChild(closeButton);

        // Create the tabs container
        const tabsContainer = document.createElement("div");
        tabsContainer.classList.add("movable-window-tabs");
        tabsContainer.style.display = "flex";
        tabsContainer.style.backgroundColor = "#eee";
        tabsContainer.style.borderBottom = "1px solid #ccc";

        // Create tabs
        this.tabs.forEach((tab, index) => {
            const tabElement = document.createElement("div");
            tabElement.classList.add("movable-window-tab");
            tabElement.innerText = tab.label;
            tabElement.style.padding = "10px";
            tabElement.style.cursor = "pointer";
            tabElement.style.flex = "1";
            tabElement.style.textAlign = "center";
            tabElement.style.borderRight = "1px solid #ccc";
            
            // Set active tab styling
            if (index === this.currentTab) {
                tabElement.style.backgroundColor = "#ddd";
                tabElement.style.fontWeight = "bold";
            }

            // Attach click event to switch tabs
            tabElement.addEventListener("click", () => this.switchTab(index));

            tabsContainer.appendChild(tabElement);
        });

        // Create the content area
        const contentArea = document.createElement("div");
        contentArea.classList.add("movable-window-content");
        contentArea.style.padding = "10px";
        contentArea.style.height = `calc(${height} - 100px)`;
        contentArea.style.overflowY = "auto";

        // Append header, tabs, and content to the main container
        windowContainer.appendChild(header);
        windowContainer.appendChild(tabsContainer);
        windowContainer.appendChild(contentArea);

        return windowContainer;
    }

    initDragEvents() {
        const header = this.windowElement.querySelector(".movable-window-header");

        header.addEventListener("mousedown", this.onMouseDown.bind(this));
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.offsetX = event.clientX - this.windowElement.offsetLeft;
        this.offsetY = event.clientY - this.windowElement.offsetTop;
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onMouseMove(event) {
        if (this.isDragging) {
            const maxLeft = window.innerWidth - this.windowElement.offsetWidth;
            const maxTop = window.innerHeight - this.windowElement.offsetHeight;
            
            let newLeft = event.clientX - this.offsetX;
            let newTop = event.clientY - this.offsetY;
    
            // Constrain within the viewport
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
    
            this.windowElement.style.left = `${newLeft}px`;
            this.windowElement.style.top = `${newTop}px`;

            this.left = newLeft
            this.top = newTop
        }
    }
    setTitle(title) {
        const header = this.windowElement.querySelector(".movable-window-header span");
        header.innerText = title;
    }

    setContent(content) {
        const contentArea = this.windowElement.querySelector(".movable-window-content");
        if (content instanceof HTMLElement) {
            contentArea.appendChild(content);
        } else {
            contentArea.innerHTML = content;
        }
    }

    setTabContent(index, content){
        if (index >= 0 && index < this.tabs.length) {
            this.tabs[index].content = content;
            if (index == this.currentTab) {
                this.updateContent();
            }
        }else{
            console.error("Trying to edit content of a tab out of range")
        }
    }

    setSize(width, height) {
        this.windowElement.style.width = width;
        this.windowElement.style.height = height;
        const contentArea = this.windowElement.querySelector(".movable-window-content");
        contentArea.style.height = `calc(${height} - 100px)`;
    }

    close() {
        document.body.removeChild(this.windowElement);
    }

    switchTab(index) {
        this.currentTab = index;
        this.updateContent();
    }

    updateContent() {
        const contentArea = this.windowElement.querySelector(".movable-window-content");
        let content = this.tabs[this.currentTab].content
        if (content instanceof HTMLElement) {
            contentArea.innerHTML = ""
            contentArea.appendChild(content);
        } else {
            contentArea.innerHTML = content;
        }

        // Update tab styles
        const tabElements = this.windowElement.querySelectorAll(".movable-window-tab");
        tabElements.forEach((tab, index) => {
            tab.style.backgroundColor = index === this.currentTab ? "#ddd" : "#eee";
            tab.style.fontWeight = index === this.currentTab ? "bold" : "normal";
        });
    }
}



class MovableWindowCellConfig extends MovableWindow{
    constructor(cell, { title = "Movable Window", tabs = [],  width = "400px", height = "400px",top="50",left="50"} = {}) {
        if(!tabs ||tabs.length == 0){tabs =[{ label: "Cell", content: "" },{ label: "Data", content: "" },{ label: "Override", content: "" }]}
        super({ title, tabs, width, height,top,left})
        this.cell = cell
        this.cfg = this.cell.cfg
        this.buildContent()
    }
    /** constructs the content of the tabs */
    buildContent(){
        let cfgArray = this.cfg.askVars()
        let div = document.createElement("div")
        div.setAttribute("name","configDiv")
        //refresh and autoscale buttons
        let refreshButton = document.createElement("button")
        refreshButton.innerHTML = "Refresh"
        refreshButton.style.width = "50%"
        refreshButton.style.marginBottom = '15px'
        let autoButton = document.createElement("button")
        autoButton.innerHTML = "Autoscale"
        autoButton.style.width = "50%"
        autoButton.style.marginBottom = '15px'
        div.appendChild(refreshButton)
        div.appendChild(autoButton)
        autoButton.addEventListener("click",(d)=>{this.cell.autoscale();this.cfg.reopenPopup(this);})
        refreshButton.addEventListener("click",(d)=>{this.cell.draw();this.cell.drawAllData()})


        //customized table content
        let table = createTable(cfgArray.length,2)
        //build the content for the cell part
        //builds each line for editing variables
        cfgArray.forEach((item,index) =>{
            table.rows[index].cells[0].textContent = item.name
            table.rows[index].cells[0].style.fontSize = 12
            item.inputs.forEach((input, index2) =>{
                let htmlInput = menuCreateInput(input.type, input.key, input.value,input.options)
                if(htmlInput){
                    htmlInput.title = input.title
                    htmlInput.style.color = "black"
                    htmlInput.style.margin = "1px"
                    if(input.update){
                        htmlInput.addEventListener("change", (d) => {input.update(d, this)})
                    }
                    table.rows[index].cells[1].appendChild(htmlInput)
                }
            })
        })
        div.appendChild(table)
        this.setTabContent(0,div)
        this.setTitle("Canvas "+this.cell.canvas.letter+" - Cell n°"+(this.cell.index+1))
        this.closeButton.addEventListener("click",(d)=>{this.cell.removeHighlight()})

        //build the content for the data part
        let div2 = document.createElement("div")
        div2.innerHTML = "Which datasets are shown on this cell: <br>"
        let activeData = this.cfg.activeData
        let dataTable  =createTable(activeData.length,3)
        activeData.forEach((item,index) =>{
            let checkbox = menuCreate_checkbox(null,"data"+index,item)
            checkbox.addEventListener("change", (d) => {this.cfg.updateActiveData(d, this)})
            let button = menuCreate_button(null, "data"+index, "EDIT", (d)=>{this.callDataWindow(index)})
            dataTable.rows[index].cells[0].appendChild(checkbox)
            dataTable.rows[index].cells[1].textContent = " Data n°"+(index+1)
            dataTable.rows[index].cells[2].appendChild(button)
        })
        div2.appendChild(dataTable)
        this.setTabContent(1,div2)
        //builds the content of the override part
        let div3 = document.createElement("div")
        let redrawButton = menuCreate_button(null, "redrawCell", "Redraw cell", (d)=>{
            this.cell.draw()
        })
        redrawButton.style.width = "50%"
        div3.appendChild(redrawButton)
        let resetButton = menuCreate_button(null, "resetConfig", "Reset to default config",(d)=>{
            this.cfg.config =  JSON.parse(JSON.stringify(config))
            //closes and reopens the part
            if(d.target && d.target.parentElement && d.target.parentElement.parentElement){
                let configDiv = d.target.parentElement.parentElement.querySelector("div[name='configDiv']")
                console.log(d.target.parentElement.parentElement)
                if(configDiv){configDiv.remove()}
                if( this.cfg.override){ 
                    div3.appendChild(createConfigHTML(this.cfg.config))
                }
            }
        })
        resetButton.style.width = "50%"
        div3.appendChild(resetButton)
        div3.appendChild(document.createElement('br'))

        let checkboxOverride = menuCreate_checkbox(null, "overrideConfig",this.cfg.override)
        let checkboxText = document.createTextNode("Override default configuration")
        div3.appendChild(checkboxOverride)
        div3.appendChild(checkboxText)
        div3.appendChild(menuCreateSeparator("largest"))

        checkboxOverride.addEventListener("click",(d)=>{
            this.cfg.override = d.target.checked
            if(d.target.checked){
                this.cfg.config =  JSON.parse(JSON.stringify(config))
                div3.appendChild(createConfigHTML(this.cfg.config))
            }else{
                this.cfg.config = config
                if(d.target && d.target.parentElement && d.target.parentElement.parentElement){
                    let configDiv = d.target.parentElement.parentElement.querySelector("div[name='configDiv']")
                    console.log(d.target.parentElement.parentElement)
                    if(configDiv){configDiv.remove()}
                }
                this.cell.draw()
            }
        })
        if(this.cfg.override){
            div3.appendChild(createConfigHTML(this.cfg.config))
        }

        this.setTabContent(2,div3)
       

    }
    /** call a data window */
    callDataWindow(dataIndex){
        let cvs = this.cell.canvas
        if(cvs.cfg.dataNb<=dataIndex){new Error("invalid data index")}
        new MovableWindowDataConfig(cvs.data[dataIndex],{"top":this.top+10,"left":this.left+100})
    }

}


class MovableWindowDataConfig extends MovableWindow{
    constructor(data, { title = "Movable Window", tabs = [],  width = "400px", height = "400px",top="50",left="50"} = {}) {
        if(!tabs ||tabs.length == 0){tabs =[{ label: "Parameters", content: "" },{ label: "Cells", content: "" }]}
        super({ title, tabs, width, height,top,left})
        this.data = data
        this.cfg = this.data.cfg
        this.buildContent()
    }

    buildContent(){
        this.setTitle("Canvas "+this.data.canvas.letter+" - Data n°"+(this.data.index+1)+"")
        let div = document.createElement("div")
        let table = createTable(2,2)
        //file selection
        let select_fileSource = menuCreateInput("selectFile","dataPath",this.data.dataName)
        select_fileSource.style.color = "black"
        select_fileSource.style.margin = "1px"
        select_fileSource.title = "choose which fill will be displayed in this data slot"
        select_fileSource.addEventListener("change",(d)=>{this.findData(d)})
        table.rows[0].cells[0].textContent = "Source data:"
        table.rows[0].cells[1].appendChild(select_fileSource)
        //create the columns list specifically for this file
        let columns = []
        for(let i=0; i<this.data.header.length; i++){
            columns.push({name:this.data.header[i],value:i})
        }
        //data sorting
        let select_sortType = menuCreateInput("select","sort_data",null, columns)
        select_sortType.style.color = "black"
        select_sortType.style.margin = "1px"
        select_sortType.style.maxWidth = "250px"
        select_sortType.title = "choose which alphanumerical data column to use for sorting table rows"
        let optionsSortOrder = [{name:"<",value:"asc"},{name:">",value:"des"}]
        let select_sortOrder = menuCreateInput("select","sort_order",this.cfg.sortOrder, optionsSortOrder)
        select_sortOrder.style.color = "black"
        select_sortOrder.style.margin = "1px"
        select_sortOrder.title = "ascending or descending sorting"
        let sortButton = menuCreate_button(null,"sortButton","SORT",(d)=>{this.prepareDataSort(d)},)
        sortButton.title = "click here to start the sorting"
        table.rows[1].cells[0].textContent = "Sort by:"
        table.rows[1].cells[1].appendChild(select_sortType)
        table.rows[1].cells[1].appendChild(select_sortOrder)
        table.rows[1].cells[1].appendChild(sortButton)
        div.appendChild(table)
        //color method
        let div2 = document.createElement("div")
        div2.innerHTML = "Color scale method:"
        let table2 = createTable(6,2)
        var select_scaleColor = document.createElement("select");
        select_scaleColor.setAttribute("name","color_type")
        select_scaleColor.style.color = "black";
        select_scaleColor.style.margin = "1px"
        select_scaleColor.title = "Choose the color scale appearance. A customized one can be made in parameters, or you can choose only a custom solid color for all"
        createColorOptions2(select_scaleColor)
        select_scaleColor.value = this.cfg.colorGradient
        var inputColorSolid = document.createElement("input");
        inputColorSolid.setAttribute("name","color_solid")
        inputColorSolid.setAttribute("type","text")
        inputColorSolid.setAttribute("data-coloris",this.cfg.colorSolid)
        inputColorSolid.style.color = "black";
        inputColorSolid.style.margin = "1px"
        inputColorSolid.value = this.cfg.colorSolid 
        inputColorSolid.setAttribute("class","coloris instance3")
        inputColorSolid.title = "Choose the solid color, used for histogram bars. If the scale 'custom Solid' is used, itwill also be used for data on other charts"
        var select_colorCol = menuCreateInput("select","color_col",this.cfg.colorType,columns);
        select_colorCol.style.color = "black";
        select_colorCol.style.margin = "1px"
        select_colorCol.title ="The column used to compute the scale of the colors"
        var input_minColor = menuCreateInput("number","color_min",this.cfg.minColor);
        input_minColor.style.color = "black";
        input_minColor.style.margin = "1px"
        input_minColor.title = "Min value of the color scale"
        var input_maxColor = menuCreateInput("number","color_max",this.cfg.maxColor);
        input_maxColor.style.color = "black";
        input_maxColor.style.margin = "1px"
        input_minColor.title = "Max value of the color scale"
        var checkRelative = menuCreateInput("checkbox","color_relative",this.cfg.colorRelative)
        checkRelative.style.margin = "1px"
        checkRelative.title = "Check to compute for this variable to be relative (express min/max in percent, between 0 and 100)"
        var checkInvert = menuCreateInput("checkbox","color_invert",this.cfg.colorInvert)
        checkInvert.style.margin = "1px"
        checkInvert.title = "Check to invert this color scale"

        table2.rows[0].cells[0].textContent="Color scale:"
        table2.rows[0].cells[1].appendChild(select_scaleColor)
        table2.rows[1].cells[0].textContent="Solid color:"
        table2.rows[1].cells[1].appendChild(inputColorSolid)
        table2.rows[2].cells[0].textContent="Variable:"
        table2.rows[2].cells[1].appendChild(select_colorCol)
        table2.rows[3].cells[0].textContent="min/max:"
        table2.rows[3].cells[1].appendChild(input_minColor)
        table2.rows[3].cells[1].appendChild(input_maxColor)
        table2.rows[4].cells[0].textContent="Relative (%) color scale : "
        table2.rows[4].cells[1].appendChild(checkRelative)
        table2.rows[5].cells[0].textContent="Invert color scale : "
        table2.rows[5].cells[1].appendChild(checkInvert)
        table2.addEventListener("change",(d)=>{this.updateColorScale(d)})

        div2.appendChild(table2)
        let superDiv = document.createElement("div")
        superDiv.appendChild(div)
        superDiv.appendChild(div2)
        this.setTabContent(0,superDiv)

        //tab 2
        //build the content for the data part
        let div3 = document.createElement("div")
        div3.innerHTML = "Which cells is this datasets shown on: <br>"
        let cells = this.data.canvas.cells
        let thisDataIndex = this.data.index
        let dataTable  =createTable(cells.length,3)
        cells.forEach((item,index) =>{
            let isChecked = item.cfg.activeData[thisDataIndex]
            let checkbox = menuCreate_checkbox(null,"cell"+index,isChecked)
            checkbox.addEventListener("change", (d) => {this.cfg.updateActiveCell(d, this)})
            let button = menuCreate_button(null, "data"+index, "EDIT", (d)=>{this.callCellWindow(index);this.data.canvas.cells[index].addHighlight()})
            dataTable.rows[index].cells[0].appendChild(checkbox)
            dataTable.rows[index].cells[1].textContent = " Cell n°"+(index+1)
            dataTable.rows[index].cells[2].appendChild(button)
        })
        div3.appendChild(dataTable)
        this.setTabContent(1,div3)


    }

    prepareDataSort(d){
        let col = this.windowElement.querySelector("select[name='sort_data']").value
        let isAscending = (this.windowElement.querySelector("select[name='sort_order']").value == "asc")
        console.log(col, isAscending)
        this.data.sort(col, isAscending)
    }

    findData(d){
        let fileName = d.target.value
        let fileNum = -1
        let file = []
        let updateThisWindow = true
        if(fileName.includes("file")){
            //do not redraw the whole window if we change file
            //columns should stay the same, so it's more important to keep the behaviour of selecting the select elemtn
            //to allow for scrolling through file options with the mouse
            if(this.data.dataName.includes("file")){updateThisWindow = false}
            fileNum = fileName.slice(5)
            file = fileData[fileNum]
            this.data.fill(file,fileName)
            this.data.canvas.resetFilters()
            this.data.canvas.drawDataset(this.data.index)
        }else if(fileName == "matrix"){
            file = matrixData
            fileNum = -100
            this.data.fill(file,fileName)
            this.data.canvas.resetFilters()
            this.data.canvas.drawDataset(this.data.index)
        }else{//venn sector
            this.data.fillFromName(fileName)
            this.data.canvas.resetFilters()
            this.data.canvas.drawDataset(this.data.index)
        }
        this.data.canvas.htmlTopMenu.setDataChoice(this.data.index, fileName) 
        //redraw the window to update the column names options
        if(updateThisWindow){
            new MovableWindowDataConfig(this.data,{"top":this.top,"left":this.left})
            this.close()
        }
    }

    updateColorScale(d){
        this.cfg.colorGradient = this.windowElement.querySelector("select[name='color_type']").value
        this.cfg.colorSolid = this.windowElement.querySelector("input[name='color_solid']").value
        this.cfg.colorType = this.windowElement.querySelector("select[name='color_col']").value
        this.cfg.minColor = this.windowElement.querySelector("input[name='color_min']").value
        this.cfg.maxColor = this.windowElement.querySelector("input[name='color_max']").value
        this.cfg.colorRelative = this.windowElement.querySelector("input[name='color_relative']").checked
        this.cfg.colorInvert = this.windowElement.querySelector("input[name='color_invert']").checked
        this.data.prepareColorScale()
        this.data.canvas.resetFilters()
        this.data.canvas.drawDataset(this.data.index)
        this.data.canvas.redrawAllColourLegends()
        
    }

    callCellWindow(cellIndex){
        let cvs = this.data.canvas
        if(cvs.cfg.cellNb<=cellIndex){new Error("invalid data index")}
        new MovableWindowCellConfig(cvs.cells[cellIndex],{"top":this.top+10,"left":this.left+100})
    }
}



class MovableWindowDataCellMatrix extends MovableWindow{
    constructor(canvas, { title = "Movable Window", tabs = [],  width = "800px", height = "400px",top="50",left="50"} = {}) {
        if(!tabs ||tabs.length == 0){tabs =[{ label: "Cell/data Matrix", content: "" },{ label: "Parameters", content: "" }]}
        super({ title, tabs, width, height,top,left})
        this.canvas = canvas
        this.buildContent()
    }
    buildContent(){
        this.setTitle("Canvas "+this.canvas.letter)
        let cells = this.canvas.cells
        let dataSets = this.canvas.data
        //fills the  tab "Cell/data Matrix"
        let div= document.createElement("div")
        let buttonsBar = document.createElement("div")

        let attributes = [{"key":"height","value":40,"isStyle":true},{"key":"width","value":"25%","isStyle":true}]
        let buttonAddCell = menuCreate_button(null, "buttonAddCell","Add cell slot",()=>{this.addCellSlot()},attributes)
        let buttonRemoveCell = menuCreate_button(null, "buttonRemoveCell","Remove cell slot",()=>{this.removeCellSlot()},attributes)
        let buttonAddData = menuCreate_button(null, "buttonAddData","Add data slot",()=>{this.addDataSlot()},attributes)
        let buttonRemoveData = menuCreate_button(null, "buttonRemoveData","Remove data slot",()=>{this.removeDataSlot()},attributes)
        buttonsBar.appendChild(buttonAddCell)
        buttonsBar.appendChild(buttonRemoveCell)
        buttonsBar.appendChild(buttonAddData)
        buttonsBar.appendChild(buttonRemoveData)
        div.appendChild(buttonsBar)
        div.appendChild(document.createElement("br"))
        let explainAboveText = "This matrix shows which dataset is shown on which cell"
        div.appendChild(document.createTextNode(explainAboveText))
        div.appendChild(document.createElement("br"))

        let table = createTable(this.canvas.cfg.cellNb+1, this.canvas.cfg.dataNb+1)
        dataSets.forEach((data,dataIndex)=>{
            let button = menuCreate_button(null,"data"+dataIndex,"Data n°"+(dataIndex+1),(d) =>{this.callDataWindow(dataIndex)})
            table.rows[0].cells[dataIndex+1].appendChild(button)
        })
        cells.forEach((cell,cellIndex)=>{
            let button = menuCreate_button(null,"cell"+cellIndex,"Cell n°"+(cellIndex+1),(d) =>{this.callCellWindow(cellIndex); this.canvas.cells[cellIndex].addHighlight()})
            table.rows[(cellIndex+1)].cells[0].appendChild(button)
            dataSets.forEach((data,dataIndex)=>{
                let value = cell.cfg.activeData[dataIndex]
                let checkbox = menuCreateInput("checkbox","data"+dataIndex,value)
                checkbox.addEventListener("change", (d) => {this.canvas.cells[cellIndex].cfg.updateActiveData(d, this)})
                table.rows[cellIndex+1].cells[dataIndex+1].appendChild(checkbox)
            })
        })
        table.style.textAlign= "center";
        div.appendChild(table)
        this.setTabContent(0,div)
        //fills the Tab "Parameters"
        let div2 = document.createElement("div")
        div2.style.display = "flex"
        div2.style.flexDirection = "row"
        let col1 = document.createElement("div")
        col1.style.flex = "1"
        let col2 = document.createElement("div")
        col2.style.flex = "1"
        let col3 = document.createElement("div")
        col3.style.flex = "1"
        col1.innerHTML = "<b>Interactive tool<b><br>"
        col2.innerHTML = "<b>Chart parts<b><br>"
        col3.innerHTML = "<b>Cells types available<b><br>"

        //interactive tools
        let col1_info1 = document.createTextNode("Choose on which dataset(s) the interactivity work(s)")
        let col1_selecterOptions = []
        for(let i=0; i<this.canvas.cfg.cellNb; i++){
            col1_selecterOptions.push({name:"Only data n°"+(i+1),value:i})
        }
        col1_selecterOptions.push({name:"All data simultaneously",value:"all"})
        let col1_selecter = menuCreate_select(null, "data_interactivity", this.canvas.cfg.interactivity.active, col1_selecterOptions)
        col1_selecter.style.color = "black";
        col1_selecter.addEventListener("change",(d)=>{
            if(col1_selecter.value =="all"){this.canvas.cfg.interactivity.active = "all"  }
            else{this.canvas.cfg.interactivity.active =  parseInt(col1_selecter.value)}
        })
        let col1_table = createTable(2,2)
        col1_table.style.fontSize = 12
        let col1_color = document.createElement("input")
        col1_color.setAttribute("name","color_solid")
        col1_color.setAttribute("type","text")
        col1_color.setAttribute("data-coloris",this.canvas.cfg.interactivity.histoColor)
        col1_color.style.color = "black";
        col1_color.style.margin = "1px"
        col1_color.value = this.canvas.cfg.interactivity.histoColor
        col1_color.setAttribute("class","coloris instance3")
        col1_color.title = "Choose the color of overlaid histogram bars"
        col1_color.addEventListener("change",(d)=>{ 
            this.canvas.cfg.interactivity.histoColor = col1_color.value
        })
        let col1_brushStyleOptions = [
            {name:"Black Outline",value:"selected"},
            {name:"Hidden",value:"tohide"},
            {name:"Fill Gold",value:"highlighted"},
            {name:"Animated",value:"highlightAnim"}
        ]
        let col1_brushStyle = menuCreate_select(null, "brushStyle", this.canvas.cfg.interactivity.selectionStyle, col1_brushStyleOptions)
        col1_brushStyle.style.color = "black"
        col1_brushStyle.addEventListener("change",(d)=>{
            console.log(col1_brushStyle.value)
            this.canvas.cfg.interactivity.selectionStyle = col1_brushStyle.value
            if(col1_brushStyle.value == "selected"){
                this.canvas.cfg.interactivity.selectionStyleBis = "selected2"
            }else{
                this.canvas.cfg.interactivity.selectionStyleBis = col1_brushStyle.value
            }
        })
        col1_table.rows[0].cells[0].textContent = "Histogram brush color"
        col1_table.rows[1].cells[0].textContent = "Brush style"
        col1_table.rows[0].cells[1].appendChild(col1_color)
        col1_table.rows[1].cells[1].appendChild(col1_brushStyle)

        let col1_button1 = menuCreate_button(null, "interactivity_behaviour", "Modify behaviour",(d)=>{
            new Popup_editInteractivity(this.canvas.cfg)
        })
        col1_button1.style.width = '50%'
        col1.appendChild(col1_info1)
        col1.appendChild(document.createElement("br"))
        col1.appendChild(col1_selecter)
        col1.appendChild(document.createElement("br"))
        col1.appendChild(document.createElement("br"))
        col1.appendChild(col1_table)
        col1.appendChild(document.createElement("br"))
        col1.appendChild(document.createElement("br"))
        col1.appendChild(col1_button1)
        col1.querySelector("select[name='data_interactivity']").value = this.canvas.cfg.interactivity.active
        col1.querySelector("select[name='brushStyle']").value = this.canvas.cfg.interactivity.selectionStyle

        //chart parts
        let cellsElements = this.canvas.cfg.cellsElements
        let check_colorLegend = menuCreate_checkbox(null, "cellsElements_colorLegend", cellsElements.colorLegend)
        check_colorLegend.addEventListener("change",(d)=>{cellsElements.colorLegend = check_colorLegend.checked})
        col2.appendChild(check_colorLegend)
        col2.appendChild(document.createTextNode("Show color legends"))
        col2.appendChild(document.createElement("br"))

        col2.addEventListener("change",(d)=>{this.canvas.draw()})

        ////cells types 
        // common data - histograms & density - stats - comparisons
        let cellTypes = this.canvas.cfg.proposedCells
        let check_common = menuCreate_checkbox(null, "cellTypes_common", cellTypes.common)
        check_common.addEventListener("change",(d)=>{cellTypes.common = check_common.checked})
        let check_histo = menuCreate_checkbox(null, "cellTypes_histo", cellTypes.histo)
        check_histo.addEventListener("change",(d)=>{cellTypes.histo = check_histo.checked})
        let check_stats = menuCreate_checkbox(null, "cellTypes_stats", cellTypes.stats)
        check_stats.addEventListener("change",(d)=>{cellTypes.stats = check_stats.checked})
        let check_comp = menuCreate_checkbox(null, "cellTypes_comp", cellTypes.comp)
        check_comp.addEventListener("change",(d)=>{cellTypes.comp = check_comp.checked})

        col3.appendChild(check_common)
        col3.appendChild(document.createTextNode("Common types (scatter plots...)"))
        col3.appendChild(document.createElement("br"))
        col3.appendChild(check_histo)
        col3.appendChild(document.createTextNode("Histograms (continuous, discrete...)"))
        col3.appendChild(document.createElement("br"))
        col3.appendChild(check_stats)
        col3.appendChild(document.createTextNode("Statistical errors"))
        col3.appendChild(document.createElement("br"))
        col3.appendChild(check_comp)
        col3.appendChild(document.createTextNode("Comparison types"))
        col3.appendChild(document.createElement("br"))

        col3.addEventListener("change",(d)=>{this.canvas.htmlTopMenu.draw()})

        div2.appendChild(col1)
        div2.appendChild(col2)
        div2.appendChild(col3)
        this.setTabContent(1,div2)
    }
    callCellWindow(index){
        if(this.canvas.cfg.cellNb<=index){new Error("invalid data index")}
        new MovableWindowCellConfig(this.canvas.cells[index],{"top":parseInt(this.top)+10,"left":parseInt(this.left)+100})
    }
    callDataWindow(index){
        if(this.canvas.cfg.dataNb<=index){new Error("invalid data index")}
        new MovableWindowDataConfig(this.canvas.data[index],{"top":parseInt(this.top)+10,"left":parseInt(this.left)+100})   
    }

    addCellSlot(){
        this.canvas.cfg.cellNb += 1
        let nb = this.canvas.cfg.cellNb
        this.canvas.cells.push(this.canvas.chooseCellType((nb-1), "null"))
        this.refreshAll()
    }
    removeCellSlot(){
        let nb = this.canvas.cfg.cellNb
        if(nb<=1){return;}
        this.canvas.cfg.cellNb -= 1
        this.canvas.cells.pop()
        let htmlCell =  this.canvas.html.querySelector("svg[id='cell"+(nb-1)+"']")
        if(htmlCell){htmlCell.remove()}
        this.refreshAll()
    }
    addDataSlot(){
        this.canvas.cfg.dataNb += 1
        let nb = this.canvas.cfg.dataNb
        this.canvas.data.push(new DataSet(this.canvas, nb-1))
        this.canvas.cells.forEach((cell,index)=>{
            if(cell.cfg && cell.cfg.activeData){
                cell.cfg.activeData.push("1")
            }
        })
        this.refreshAll()
    }
    removeDataSlot(){
        let nb = this.canvas.cfg.dataNb
        if(nb<=1){return;}
        this.canvas.cfg.dataNb -= 1
        this.canvas.data.pop()
        this.canvas.cells.forEach((cell,index)=>{
            if(cell.cfg && cell.cfg.activeData){
                cell.cfg.activeData.pop()
            }
        })
        this.refreshAll()
    }
    refreshAll(){
        this.canvas.draw()
        this.canvas.htmlTopMenu.draw()
        new MovableWindowDataCellMatrix(this.canvas)
        this.close()
    }
}





function createTable(rows, cols) {
    // Create a table element
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse'; // Optional: Better table styling
    table.classList.add("tableCustom")
    table.style.width = "100%"
    table.style.letterSpacing = "1px"
    // Create rows
    for (let r = 0; r < rows; r++) {
        const row = document.createElement('tr');
        // Create columns (cells)
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('td');
            cell.textContent = ""
            row.appendChild(cell);
        }
        // Append the row to the table
        table.appendChild(row);
    }
    // Provide access to every cell
    return table;
}



class Popup {
    constructor(name, textContent){
        this.name = name 
        this.textContent = textContent || ""
        this.buildContent()
    }
    buildContent(){
        let  main_popup = document.getElementById("main_popup")
        this.popup = document.createElement("div")
        this.popup_box = document.createElement("button")
        this.popup_close = document.createElement("button")
        this.popup_box.setAttribute("class", "infotext")
        this.popup_close.setAttribute("class","popuptrueclose")
        this.popup_close.innerHTML = "X"
        this.popup_box.appendChild(this.popup_close)
        
        this.preText = document.createElement("div")
        this.preText.innerHTML = this.textContent
        this.popup_box.appendChild(this.preText)
        //adds the validate button
        this.valButton = document.createElement("button")
        this.valButton.setAttribute("name","validateLinksButton")
        this.valButton.setAttribute("class","popupclose")
        this.valButton.addEventListener("click", function(){
            closePopup(this);
        })
        this.valButton.innerHTML = "VALIDATE"
        this.popup_box.appendChild(this.valButton)
        //finalizes the popup
        this.popup.setAttribute("class","popup")
        this.popup.setAttribute("name", "popup_"+this.name)
        this.popup.style.display ="block"
        this.popup_box.style.maxHeight = "90%"
        this.popup_box.style.overflow = "scroll";
        this.popup.appendChild(this.popup_box)
        main_popup.appendChild(this.popup)
        this.popup.querySelector(".popuptrueclose").addEventListener("click", function(d){closePopup(this)})
    }

    /** a method to handle general case inputs for popups */
    buildInputs(selecters, inputs, buttons){
        //handles the selecters and their actions
        var html_selecters = [];
        for(let i=0; i<selecters.length; i++){
            html_selecters[i] = document.createElement("select")
            html_selecters[i].setAttribute("class","popupclose")
            html_selecters[i].setAttribute("name","popup_selecter_"+i)
            html_selecters.options = []
            for(let j=0; j<selecters[i].options.length; j++){
            html_selecters.options[j] = document.createElement("option")
            html_selecters.options[j].setAttribute("value", selecters[i].options[j].value)
            html_selecters.options[j].innerHTML = selecters[i].options[j].text
            html_selecters[i].appendChild(html_selecters.options[j])
            }
            this.popup_box.appendChild(html_selecters[i])
        }

        //handles the inputs and their actions
        var html_inputs = [];
        for(let i=0; i<inputs.length; i++){
            html_inputs[i]= document.createElement("input")
            html_inputs[i].setAttribute("type",inputs[i].type)
            html_inputs[i].setAttribute("class","popupinput")
            html_inputs[i].setAttribute("name","popup_input_"+i)
            html_inputs[i].setAttribute("class","popupinput")
            if(inputs[i].placeholder){html_inputs[i].placeholder = inputs[i].placeholder}
            this.popup_box.appendChild(html_inputs[i])
        }


        //handles the buttons and their actions
        var html_buttons = []
        for(let i=0; i<buttons.length; i++){
            html_buttons[i] = document.createElement("button")
            html_buttons[i].setAttribute("class","popupclose")
            html_buttons[i].setAttribute("name","popup_button_"+i)
            html_buttons[i].innerHTML = buttons[i].name
            html_buttons[i].addEventListener("click",(d)=>{buttons[i].function()})
            this.popup_box.appendChild(document.createElement("br"))
            this.popup_box.appendChild(html_buttons[i])
        }
    }

}

/**A function to confirmate  */
class Popup_confirmation extends Popup {
    constructor(name, text, validFunction) {
        super("heteroClassesEdit",text)
        this.name = name
        this.valButton.addEventListener("click",validFunction)
    }
}


class Popup_editHeteroClassses extends Popup {
    constructor(name, cell, cfg) {
        super("heteroClassesEdit","Edit here the list of considered heteroelements<br> Check the button if you want a different class for every number of heterolements (N1, N2, N3...) <br>")
        this.cell = cell
        this.canvas = cell.canvas
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
        this.hetero = []
        this.cfg.heteroEls.forEach((item)=>{
            let newItem = {"name":item.name,"showNumber":item.showNumber}
            this.hetero.push(newItem)
        })
        //creates a table
        for(let i=0; i<this.hetero.length; i++){
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
            this.cfg.heteroEls = this.hetero;
            this.cfg.cell.draw() //redraws the cell
        })
    }

    addLine(){
        let newLength = this.elLine.length
        let hetero = this.hetero
        this.elLine[newLength] = document.createElement("tr")
        this.elCells[newLength] = []
        for(let j=0; j<3; j++){
                this.elCells[newLength][j] = document.createElement("td")
                this.elLine[newLength].appendChild(this.elCells[newLength][j])
        }
        this.elInputs[newLength]=[]
        this.elInputs[newLength][0]= document.createElement("input")
        this.elInputs[newLength][0].setAttribute("type","text")
        this.elInputs[newLength][0].setAttribute("name","name"+i)
        this.elInputs[newLength][0].style.width = "200px"
        this.elInputs[newLength][0].addEventListener("change",(d) =>{this.readChange(d,newLength)})


        this.elInputs[newLength][1]= document.createElement("input")
        this.elInputs[newLength][1].setAttribute("type","checkbox")
        this.elInputs[newLength][1].setAttribute("name","showNumber"+i)
        this.elInputs[newLength][1].addEventListener("change",(d) =>{this.readChange(d,newLength)})
        
        if(hetero[newLength]){
            this.elInputs[newLength][0].setAttribute("value",hetero[newLength].name ||"")
            this.elInputs[newLength][1].checked = hetero[newLength].showNumber || false
        }else{
            this.hetero.push({"name":"","showNumber":false})
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
        this.hetero.splice(index,1)

        this.htmlTable.deleteRow(index)
    }
    readChange(event, index){
        let input = event.target
        if(input.type =="text"){
            this.hetero[index].name = input.value
        }else{
            this.hetero[index].showNumber = input.checked
        }
    }
}

/** a function to create a config html menu */
function createConfigHTML(cfg){
    //CHART AREA
    if(!cfg || cfg == [] || cfg == {}){cfg = config}
    console.log(cfg)
    let div = document.createElement("div")
    div.setAttribute("name","configDiv")
    let partTitle1 = menuCreate_label("Chart Area",true,[['fontWeight','bold']])
    div.appendChild(partTitle1)

    //margins and size
    let marginsButton = menuCreate_button(null, "marginsButton","EDIT",()=>{new Popup_editConfigMargins(cfg)})
    let marginsText = document.createTextNode("Edit margins ")
    let widthInput = menuCreateInput("number","width",cfg.width || width)
    widthInput.style.color = "black";
    widthInput.addEventListener("change",(d)=>{cfg.width = parseFloat(d.target.value)})
    let widthText = document.createTextNode("Width")
    let heightInput = menuCreateInput("number","height",cfg.height || height)
    heightInput.style.color = "black";
    heightInput.addEventListener("change",(d)=>{cfg.height = parseFloat(d.target.value)})
    let heightText = document.createTextNode("Height")
    let table1 = createTable(3,3)
    table1.style.width = '100%';
    table1.style.tableLayout = 'fixed';
    table1.style.fontSize = '12'
    table1.rows[0].cells[0].appendChild(marginsText)
    table1.rows[0].cells[1].appendChild(marginsButton)
    table1.rows[1].cells[0].appendChild(widthText)
    table1.rows[1].cells[1].appendChild(widthInput)
    table1.rows[2].cells[0].appendChild(heightText)
    table1.rows[2].cells[1].appendChild(heightInput)
    div.appendChild(table1)
    div.appendChild(menuCreateSeparator("medium"))

    //inner chart elements: background, grids, ticks, outline, outline of dots ?
    let partTitle2 = menuCreate_label("Chart elements",true,[['fontWeight','bold']])
    div.appendChild(partTitle2)
    let backgroundName = document.createTextNode("Background color")
    let ticksName = document.createTextNode("Number of ticks (scales and grids)")
    let noGridsName = document.createTextNode("Remove grids")
    let chartBoxName = document.createTextNode("Outline of charts")
    let dotBoxName = document.createTextNode("Outline of dots")
    let backgroundColor = document.createElement("input");
    backgroundColor.setAttribute("name","color_solid")
    backgroundColor.setAttribute("type","text")
    backgroundColor.setAttribute("data-coloris",cfg.cellBackColor)
    backgroundColor.style.color = "black";
    backgroundColor.style.margin = "1px"
    backgroundColor.value = cfg.cellBackColor 
    backgroundColor.setAttribute("class","coloris instance3")
    backgroundColor.title = "Choose the solid color, used for histogram bars. If the scale 'custom Solid' is used, it will also be used for data on other charts"
    backgroundColor.addEventListener("change",(d)=>{cfg.cellBackColor = d.target.value})
    let ticksInput = menuCreate_inputNumber(null,"axisLines",cfg.axisLines)
    ticksInput.style.color = "black";
    ticksInput.addEventListener("change",(d)=>{cfg.axisLines = parseFloat(d.target.value)})
    let noGridsCheckbox = menuCreate_checkbox(null, "noGrid", cfg.noGrid)
    noGridsCheckbox.addEventListener("change",(d)=>{cfg.noGrid = d.target.checked})
    let chartBoxCheckbox = menuCreate_checkbox(null, "boxBorders",cfg.boxBorders)
    chartBoxCheckbox.addEventListener("change",(d)=>{cfg.boxBorders = d.target.checked})
    let dotBoxCheckbox = menuCreate_checkbox(null, "blackCircle",cfg.blackCircle)
    dotBoxCheckbox.addEventListener("change",(d)=>{cfg.blackCircle = d.target.checked})
    let dotBoxButton = menuCreate_button(null, "editDotOutline","EDIT",()=>{new Popup_editConfigDotOutline(cfg)})

    let table2 = createTable(5,2)
    table2.rows[0].cells[0].appendChild(backgroundName)
    table2.rows[1].cells[0].appendChild(ticksName)
    table2.rows[2].cells[0].appendChild(noGridsName)
    table2.rows[3].cells[0].appendChild(chartBoxName)
    table2.rows[4].cells[0].appendChild(dotBoxName)
    table2.rows[0].cells[1].appendChild(backgroundColor)
    table2.rows[1].cells[1].appendChild(ticksInput)
    table2.rows[2].cells[1].appendChild(noGridsCheckbox)
    table2.rows[3].cells[1].appendChild(chartBoxCheckbox)
    table2.rows[4].cells[1].appendChild(dotBoxCheckbox)
    table2.rows[4].cells[1].appendChild(dotBoxButton)
    table2.style.width = '100%';
    table2.style.fontSize = '12'
    div.appendChild(table2)
    div.appendChild(menuCreateSeparator("medium"))
    //text elements
    let partTitle3 = menuCreate_label("Text elements",true,[['fontWeight','bold']])
    div.appendChild(partTitle3)

    let scaleMoveName = document.createTextNode("Move legends at the extremity")
    let titleName = document.createTextNode("Show a Title")
    let scaleMoveCheckbox =  menuCreate_checkbox(null, "endAxis", cfg.endAxis)
    scaleMoveCheckbox.addEventListener("change",(d)=>{cfg.endAxis = d.target.checked})
    let titleCheckbox = menuCreate_checkbox(null, "showTitle", cfg.showTitle)
    titleCheckbox.addEventListener("change",(d)=>{cfg.showTitle = d.target.checked})
    let titleOptions = [
        {name:"Top Left", value:"topLeft"},
        {name:"Top Right", value:"topRight"},
        {name:"Bottom Left", value:"bottomLeft"},
        {name:"Bottom Right", value:"bottomRight"},
        {name:"Top Middle", value:"topMiddle"}
    ]
    let titlePlace = menuCreate_select(null, "titlePosition", cfg.titlePosition, titleOptions)
    titlePlace.addEventListener("change",(d)=>{cfg.titlePosition = d.target.value})
    titlePlace.style.color ="black"
    let table3 = createTable(2,2)
    table3.style.width = '100%';
    table3.style.fontSize = '12';
    table1.style.tableLayout = 'fixed';
    table3.rows[0].cells[0].appendChild(scaleMoveName)
    table3.rows[1].cells[0].appendChild(titleName)
    table3.rows[0].cells[1].appendChild(scaleMoveCheckbox)
    table3.rows[1].cells[1].appendChild(titleCheckbox)
    table3.rows[1].cells[1].appendChild(titlePlace)
    div.appendChild(table3)
    div.appendChild(menuCreateSeparator("medium"))
    // fonts
    let partTitle4 = menuCreate_label("Fonts",true,[['fontWeight','bold']])
    div.appendChild(partTitle4)

    let fontType = menuCreate_select(null, "font", cfg.legendFont, fontsList)
    fontType.style.color = "black";
    fontType.addEventListener("change",(d)=>{cfg.legendFont = d.target.value})
    let fontTypeText = document.createTextNode("Font")
    let fontSize = menuCreate_inputNumber(null, "fontSmall",cfg.legendFontSize )
    fontSize.style.color = "black";
    fontSize.addEventListener("change",(d)=>{cfg.legendFontSize = parseFloat(d.target.value)})
    let fontSizeText = document.createTextNode("Font size for axes(big)")
    let fontSizeSmall = menuCreate_inputNumber(null, "fontSmall",cfg.legendFontSizeSmall)
    fontSizeSmall.style.color = "black";
    fontSizeSmall.addEventListener("change",(d)=>{cfg.legendFontSizeSmall = parseFloat(d.target.value)})
    let fontSizeSmallText = document.createTextNode("Font size for scales(small)")
    let table4 = createTable(3,2)
    table4.style.width = '100%';
    table4.style.tableLayout = 'fixed';
    table4.style.fontSize = '12'
    table4.rows[0].cells[0].appendChild(fontTypeText)
    table4.rows[0].cells[1].appendChild(fontType)
    table4.rows[1].cells[0].appendChild(fontSizeText)
    table4.rows[1].cells[1].appendChild(fontSize)
    table4.rows[2].cells[0].appendChild(fontSizeSmallText)
    table4.rows[2].cells[1].appendChild(fontSizeSmall)
    div.appendChild(table4)

    return div
}

//*********************************************************************//
//*******************CREATION OF HTML PARTS **************************//

let html_configDiv = createConfigHTML(config)
let html_configDivHolder = document.getElementById("config_holder")
html_configDivHolder.appendChild(html_configDiv)

//*********************************************************************//
//*********************************************************************//

class Popup_editConfigMargins extends Popup {
    constructor(cfg) {
        super("configMargins","Edit here the margins for this configuration<br>")
        this.cfg = cfg
        this.buildSuppContext()
    }
    buildSuppContext(){
        if(!this.cfg.margin){this.cfg.margin= {}}
        this.margin = JSON.parse(JSON.stringify(this.cfg.margin))//object with four variables: top, bottom, left, right
        let table = createTable(4,2)
        let mTop = menuCreate_inputNumber(null, "margin_top",this.cfg.margin.top)
        let mBottom = menuCreate_inputNumber(null, "margin_bottom",this.cfg.margin.bottom)
        let mLeft = menuCreate_inputNumber(null, "margin_left", this.cfg.margin.left)
        let mRight = menuCreate_inputNumber(null, "margin_right", this.cfg.margin.right)

        table.addEventListener("change",(d)=>{
            this.readChange()
        })
        
        table.rows[0].cells[0].appendChild(document.createTextNode("top"))
        table.rows[1].cells[0].appendChild(document.createTextNode("bottom"))
        table.rows[2].cells[0].appendChild(document.createTextNode("left"))
        table.rows[3].cells[0].appendChild(document.createTextNode("right"))
        table.rows[0].cells[1].appendChild(mTop)
        table.rows[1].cells[1].appendChild(mBottom)
        table.rows[2].cells[1].appendChild(mLeft)
        table.rows[3].cells[1].appendChild(mRight)
        this.preText.appendChild(table)
        this.valButton.addEventListener("click",(d)=>{this.cfg.margin = this.margin})
    }
    readChange(){
        let mTop = this.preText.querySelector("input[name='margin_top']")
        let mBottom = this.preText.querySelector("input[name='margin_bottom']")
        let mLeft = this.preText.querySelector("input[name='margin_left']")
        let mRight = this.preText.querySelector("input[name='margin_right']")
        if(mTop){this.margin.top = parseFloat(mTop.value)}
        if(mBottom){this.margin.bottom = parseFloat(mBottom.value)}
        if(mLeft){this.margin.left = parseFloat(mLeft.value)}
        if(mRight){this.margin.right = parseFloat(mRight.value)}
    }
}   

class Popup_editConfigDotOutline extends Popup {
    constructor(cfg) {
        super("configDotOutline","Edit here the appearance of the dots outline<br>")
        this.cfg = cfg
        this.buildSuppContext()
    }
    buildSuppContext(){
        let borderColor = this.cfg.blackCircleColor
        let borderWidth = this.cfg.blackCircleWidth

        let table = createTable(2,2)
        let widthInput = menuCreate_inputNumber(null, "width", borderWidth)
        let colorInput = document.createElement("input")
        colorInput.setAttribute("name","color_solid")
        colorInput.setAttribute("type","text")
        colorInput.setAttribute("data-coloris",borderColor)
        colorInput.style.color = "black";
        colorInput.style.margin = "1px"
        colorInput.value = borderColor
        colorInput.setAttribute("class","coloris instance3")
        colorInput.title = "Choose the color of dots outline"

        table.rows[0].cells[0].appendChild(document.createTextNode("Border width"))
        table.rows[1].cells[0].appendChild(document.createTextNode("Border color"))
        table.rows[0].cells[1].appendChild(widthInput)
        table.rows[1].cells[1].appendChild(colorInput)

        this.preText.appendChild(table)
        table.addEventListener("change",(d)=>{this.readChange()})
        this.valButton.addEventListener("click",(d)=>{
            this.cfg.blackCircleColor = this.borderColor
            this.cfg.blackCircleWidth = this.borderWidth
        })
    }
    readChange(){
        let widthInput = this.preText.querySelector("input[name='width']")
        let colorInput = this.preText.querySelector("input[name='color_solid']")
        if(widthInput){this.borderWidth = parseFloat(widthInput.value)}
        if(colorInput){this.borderColor = colorInput.value}
    }
}

class Popup_editInteractivity extends Popup {
    constructor(cfg) {
        super("configInteractivity","Edit here the behaviour of the interactivity brush<br><br>")
        this.cfg = cfg
        this.buildSuppContext()
    }
    buildSuppContext(){
        let table = createTable(4,2)
        let interac = this.cfg.interactivity
        this.newInterac = JSON.parse(JSON.stringify(this.cfg.interactivity))
        let check_createHistogramBars = menuCreate_checkbox(null, "createHistogramBars", interac.createHistogramBars)
        let check_filterWorkonHistograms = menuCreate_checkbox(null, "filterWorkonHistograms",interac.filterWorkonHistograms)
        let check_histogramRelativity = menuCreate_checkbox(null, "histogramRelativity", interac.histogramRelativity)
        let check_showTitleWarning = menuCreate_checkbox(null, "showTitleWarning", interac.showTitleWarning)

        table.rows[0].cells[0].textContent = "Cell brushing shows on histograms"
        table.rows[1].cells[0].textContent = "Height of brushed histogram bars are relative to full dataset"
        table.rows[2].cells[0].textContent = "Histogram filter works on other histograms"
        table.rows[3].cells[0].textContent = "Show a warning title when histogram are affected by a filter"
        table.rows[0].cells[1].appendChild(check_createHistogramBars)
        table.rows[1].cells[1].appendChild(check_histogramRelativity)
        table.rows[2].cells[1].appendChild(check_filterWorkonHistograms)
        table.rows[3].cells[1].appendChild(check_showTitleWarning)
        table.addEventListener("change",(d)=>{this.readChange()})
        this.valButton.addEventListener("click",(d)=>{
            console.log(this.cfg, this.newCfg)
            this.cfg.interactivity = this.newInterac
        })
        this.preText.appendChild(table)
    }
    readChange(){
        this.newInterac.createHistogramBars = this.preText.querySelector("input[name='createHistogramBars']").checked
        this.newInterac.filterWorkonHistograms = this.preText.querySelector("input[name='filterWorkonHistograms']").checked
        this.newInterac.histogramRelativity = this.preText.querySelector("input[name='histogramRelativity']").checked
        this.newInterac.showTitleWarning = this.preText.querySelector("input[name='showTitleWarning']").checked
    }
}


class Popup_searchPeaks extends Popup{
    constructor(canvas) {
        super("configInteractivity","Search function <br> The second input zone is only useful if you want to highlight repeat units")
        this.canvas = canvas
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
        if(typeRead =="formula"){
            this.canvas.searchDataPoints_formula(searchValue, repeatUnit)
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
            this.canvas.searchDataPoints_mass(searchObject)
        }
        
        this.popup_close.click()
    }
}


///// creates a logbook option
class LogBook extends MovableWindow{
    constructor({ title = "Notebook", tabs = [],  width = "600px", height = "600px",top="50",left="50"} = {}) {
        if(!tabs ||tabs.length == 0){tabs =[{ label: "Infos", content: "" }]}
        super({ title, tabs, width, height,top,left})
        this.buildContent()
    }

    buildContent(){
        let div = document.createElement("div")
        div.setAttribute("id","notebookWindow")
        let textArea = document.createElement("textarea")
        textArea.placeholder = "Write here informations you want to be saved with your session..."
        textArea.style.height = '90%'
        textArea.style.width = '100%'
        textArea.style.resize = "none"
        textArea.value = _textLog
        this.textArea =textArea
        div.appendChild(textArea)
        let button = document.createElement("button")
        button.style.height = '10%'
        button.style.width = "100%"
        button.innerHTML = "Save"
        button.addEventListener("click",()=>{this.saveButtonPressed()})
        this.buttonUpdate = button
        div.appendChild(button)

        this.setTabContent(0,div)
    }

    saveButtonPressed(){
        _textLog = this.textArea.value
        this.close()
    }
}
//adds the functionnality to the button
document.getElementById("notebookButton").addEventListener("click", function(){
    if(!document.getElementById("notebookWindow")){new LogBook}
})