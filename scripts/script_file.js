/**This script contains classes and code to handle files and raw data for Punc'data version 1.15.8 and above */

/**a filelist handles handles a group of files and a html place to represent them */
class FileList{
    constructor(){
        this.groups = []
        this.list = []
        this.html = document.getElementById("datalist")
    }

    /** renders the datamanager */
    render(){
        let oldContainer = this.html.querySelector("div[name='container']")
        if(oldContainer){oldContainer.remove()}
        let container = document.createElement("div")
        container.setAttribute("name","container")
        this.html.appendChild(container)
        for(let i=0; i<this.list.length; i++){
            let filewrapper = document.createElement("div")
            filewrapper.setAttribute("id","fileslot_index_"+i)
            let fileslot = this.list[i].render()
            container.appendChild(filewrapper)
            filewrapper.appendChild(fileslot)
        }
    }

    /**mutates this.list to redo the order and redefines indexes**/
    moveFile(index, direction){ 
        if(isNaN(index)){return}
        if(direction =="up"){
            if(!this.list[index-1]){return}
            [this.list[index], this.list[index-1]] = [this.list[index-1], this.list[index]]
            this.list[index].index = index
            this.list[index-1].index = index-1
        }else if(direction == "down"){
             if(!this.list[index+1]){return}
             [this.list[index], this.list[index+1]] = [this.list[index+1], this.list[index]]
            this.list[index].index = index
            this.list[index+1].index = index+1
        }
        //restarts the render
        this.render()
        //highlight
        if(direction =="up"){
            this.list[index-1].html.classList.add("bckgrndhighlight")
            setTimeout(() => {this.list[index-1].html.classList.remove("bckgrndhighlight")}, 200);
        }else if(direction =="down"){
            this.list[index+1].html.classList.add("bckgrndhighlight")
            setTimeout(() => {this.list[index+1].html.classList.remove("bckgrndhighlight")}, 200);
        }
    }

    /**moves a file to a target index*/
    moveFileToIndex(index, targetIndex){
        if(isNaN(index)){return}
        if(index == targetIndex){return;}
        var direction = "up"
        if(index > targetIndex){direction ="down"}
        var currentIndex = index
        var steps = Math.abs(targetIndex-index)
        /** when dropping to a upper index, all files before the current position do not move */
        if(direction == "up"){
            for(let i=0; i<steps; i++){
                this.moveFile(index+i+1, "up")
            }
        }else{
            for(let i=0; i<steps; i++){
                this.moveFile(index-i-1, "down")
            }
        }
        /**resets the animation of this.movefile and animates the true file */
        this.render()
        resetDataSelecters()
        this.list[targetIndex].html.classList.add("bckgrndhighlight")
        setTimeout(() => {this.list[targetIndex].html.classList.remove("bckgrndhighlight")}, 200);
    }

    createNewFile(name,id, group){
        let index = this.list.length
        let newFile = new File(name,id,index, this, group)
        this.list.push(newFile)
        let container = this.html.querySelector("div[name='container']")
        if(container){
            newFile.render(container, index)
        }
        return newFile
    }

    lookForNewID(startID){
        startID = startID || -1
        if(startID<0){
            if(this.list[this.list.length-1] &&  this.list[this.list.length-1].id){
                startID = this.list[this.list.length-1].id +1
            }else{
                startID = this.list.length
            }
        }
        let idExists = false
        for(let i=0; i<this.list.length; i++){
            if(this.list[i].id == startID){
                idExists = true
                break;
            }
        }
        if(!idExists){return startID}
        //else, looks again
        return this.lookForNewID(startID+1)
    }

    createNewGroup(name){
        let trueName = this.findUniqueGroupName(name)
        let group = new FileGroup(trueName)
        this.groups.push(group)
        return group
    }

    /** reset all indexes in the filelist */
    resetIndexes(){
        for(let i=0; i<this.list.length; i++){
            this.list[i].index = i
        }
    }

    /**searches for a file by its name. Returns the first file with the good name */
    findFileByName(name){
        for(let i=0; i<this.list.length; i++){
            if(this.list[i].name == name){return this.list[i]}
        }
        return;
    }

    /**search in the groups list a group by name. Returns it if found */
    findGroupByName(name){
        for(let i=0; i<this.groups.length; i++){
            if(this.groups[i].name == name){return this.groups[i]}
        }
        return;
    }

    findGroupIndexByName(name){
        for(let i=0; i<this.groups.length; i++){
            if(this.groups[i].name == name){return i}
        }
        return -1;
    }

    /**starts with a name group, and increments it until the name doesn't exist anymore. Returns the name that is free to take*/
    findUniqueGroupName(name, iterationNb){
        let nameToSearch = name
        if(iterationNb && iterationNb>0){nameToSearch += iterationNb}
        let firstGroup = this.findGroupByName(nameToSearch)
        if(!firstGroup){return nameToSearch}
        //else, looks again
        return this.findUniqueGroupName(name, iterationNb+1)

    }
    /** sorts the files with a method*/
    sortFiles(sortMethod, asc){
        if(sortMethod == "alpha"){
            this.list.sort((a,b)=>{
                if(asc){return a.name.localeCompare(b.name)}
                else{return b.name.localeCompare(a.name)}
            })
        }else if(sortMethod == "id"){
            this.list.sort((a,b)=>{
                if(asc){return a.id - b.id}
                else{return b.id - a.id}
            })
        }else if(sortMethod == "group"){
            this.list.sort((a,b)=>{
                if(!a.fileGroup || !b.fileGroup){return -1}
                 if(asc){return a.fileGroup.name.localeCompare(b.fileGroup.name)}
                else{return b.fileGroup.name.localeCompare(a.fileGroup.name)}
            })
        }else if(sortMethod == "peaks"){
            this.list.sort((a,b)=>{
                if(!a.data || !b.data){return -1}
                 if(asc){return a.data.length - b.data.length}
                else{return b.data.length - a.data.length}
            })
        }else if(sortMethod == "columns"){
            this.list.sort((a,b)=>{
                if(!a.data || !b.data){return -1}
                if(!a.data[0] || !b.data[0]){return -1}
                 if(asc){return a.data[0].length - b.data[0].length}
                else{return b.data[0].length - a.data[0].length}
            })
        }
        //re-indexes all files
        for(let i=0; i<this.list.length; i++){
            this.list[i].index = i
        }
        generalFilesUpdate()
    }

    /**removes every file */
    deleteAllFiles(){
        for(let i=this.list.length-1; i>=0; i--){
            delete this.list[i]
        }
        for(let i=this.groups.length-1; i>=0; i--){
            delete this.groups[i]
        }
        this.list = []
        this.groups = []
        this.render()
    }

    /**prepares for an export to save this */
    export(){
        let pFileList = {list:[],groups:[]}
        for(let i =0; i<this.list.length; i++){
            let pFile = this.list[i].export()
            pFileList.list.push(pFile)
        }
        /**for groups, simplifies without cross references */
        for(let i=0; i<this.groups.length; i++){
            let pGroup = this.groups[i].export()
            pFileList.groups.push(pGroup)
        }
        return pFileList
    }
    /**loads a saved fileList and recreates all links between elements */
    import(save){
        for(let i=0; i<save.list.length; i++){
            const saveFile = save.list[i]
            let file = new File(saveFile.name, saveFile.index, saveFile.id, this)
            file.import(saveFile)
            this.list.push(file)
        }
        for(let i=0; i<save.groups.length; i++){
            const saveGroup = save.groups[i]
            let group = new FileGroup(saveGroup.name)
            group.import(saveGroup)
            this.groups.push(group)
        }
    }

}


class FileGroup{
    constructor(name){
        this.name = name
        this.color = "#000000"
        this.list = []
    }

    findFileIndexById(id){
        for(let i=0; i<this.list.length; i++){
            if(this.list[i].id == id){return i}
        }
        return -1
    }

    updateAllFiles(){
        for(let i=0; i<this.list.length; i++){
            this.list[i].update()
        }
    }

    /**prepares for an export to save this */
    export(){
        let pseudoGroup = {}
        pseudoGroup.name = this.name
        pseudoGroup.color = this.color
        pseudoGroup.listIndexes = []
        for(let i=0; i<this.list.length; i++){
            if(!this.list[i]){continue;}
            const index = this.list[i].index
            pseudoGroup.listIndexes.push(index)
        }
        return pseudoGroup
    }
    /** imports data from a saved FileGroup */
    import(saveGroup){
        this.color = saveGroup.color
        /**connects files and groups */
        for(let i=0; i<saveGroup.listIndexes.length; i++){
            const index = saveGroup.listIndexes[i]
            const file = files.list[index]
            if(!file){continue;}
            file.fileGroup = this
            this.list.push(file)
        }
    }
}

class File{
    constructor(name,id,index, fileList, group){
        this.name = name
        //index changes when reordering, but not id
        this.id = id
        this.index = index
        //analysis or matrix
        this.type = "analysis"
        //profile, peaklist or attributionlist
        this.dataType = "peaklist"
        //raw, attributed or calibrated
        this.state = "raw"
        //this
        this.data = []
        this.data_derived = []
        this.matrix = {auto:true}
        this.logs = []
        this.metadata = {
            calibration:{},
            attribution:{},
            special:[]//{key,value} pairs
        }
        this.fileList = fileList
        this.fileGroup = group
        if(group && group.list){group.list.push(this)}
    }

    /** render the file on the datamanager */
    render(){
        let mainDiv = document.createElement("div")
        mainDiv.setAttribute("name","file_wrapper")
        mainDiv.setAttribute("slot_index",this.index)
        mainDiv.setAttribute("class","fileslot")
        mainDiv.style.display = "flex"
        
        //dragging handle and behaviour
        let dragDiv = document.createElement("div")
        dragDiv.setAttribute("class","draggable")
        dragDiv.setAttribute("draggable","true")
        dragDiv.setAttribute("slot_index",this.index)
        dragDiv.textContent = "•••"
        mainDiv.appendChild(dragDiv)
        //animating the currently dragged file slot
        dragDiv.addEventListener("dragstart",(e)=>{
            this.html.classList.add("dragged")
            e.dataTransfer.setData("slot_index", this.index)
        })
        dragDiv.addEventListener("dragend",(e)=>{
            this.html.classList.remove("dragged")
        })
        //dragover default is disabled, except for the file input button
        mainDiv.addEventListener("dragover",(e)=>{
            if (e.target.type === "file") return;
            e.preventDefault();
        })
        mainDiv.addEventListener("drop",(e)=>{
            if (e.target.type === "file") return;
            e.preventDefault();
            let handleIndex = e.dataTransfer.getData("slot_index")
            this.fileList.moveFileToIndex(parseInt(handleIndex), parseInt(this.index))
        })

        
        //first group : sorting and dragging
        let sortDiv = document.createElement("div")
        sortDiv.setAttribute("name","sortGroup")
        let div_move = document.createElement("div")
        div_move.setAttribute("name","file_move")
        div_move.style.display = "flex"
        div_move.style.flexDirection = "column"
        div_move.style.marginLeft = "10px"
        let button_moveup = document.createElement("button")
        button_moveup.setAttribute("class","slimsmallbutton");
        button_moveup.textContent = "▲"
        let button_movedown = document.createElement("button")
        button_movedown.setAttribute("class","slimsmallbutton");
        button_movedown.textContent = "▼"
        button_moveup.addEventListener("click",()=>{
            this.fileList.moveFile(this.index, "up")
            resetDataSelecters()
        })
        button_movedown.addEventListener("click",()=>{
            this.fileList.moveFile(this.index, "down")
            resetDataSelecters()
        })
        div_move.appendChild(button_moveup)
        div_move.appendChild(button_movedown)
        sortDiv.appendChild(div_move)
        mainDiv.appendChild(sortDiv)

        //second group: id and group
        let idDiv = document.createElement("div")
        idDiv.setAttribute("name","idGroup")
        idDiv.style.marginLeft = '2px'
        let div_id = document.createElement("div")
        div_id.setAttribute("name","file_id")
        div_id.style.textAlign = "center"
        div_id.textContent = "#"+this.id
        let textGroup = document.createElement("div")
        textGroup.textContent = "Group:"
        let div_group = document.createElement("div")
        div_group.setAttribute("name","file_group")
        let groupName = ""
        if(this.fileGroup){groupName = this.fileGroup.name}
        let input_group = menuCreateInput("text","input_group",groupName)
        input_group.addEventListener("change",(d)=>{
            this.changeGroup(d.target.value);
             this.refreshSlot()
            })
        input_group.setAttribute("class","groupInput")
        div_group.appendChild(input_group)
        let thisGroup  = this.fileGroup
        let color = "#ffffff"
        if(thisGroup){color = thisGroup.color}
        let divGroupColor = document.createElement("div")
        divGroupColor.setAttribute("class","groupColorBox")
        divGroupColor.setAttribute("name","colorRect")
        divGroupColor.style.backgroundColor = color
        let input_groupColor = menuCreateInput("color","groupColor",color)
        input_groupColor.addEventListener("change",(d)=>{
            thisGroup.color = d.target.value;
            if(thisGroup){thisGroup.updateAllFiles()}
            })
        let colorWrapper = document.createElement("div")
        colorWrapper.style.display = "grid"
        divGroupColor.style.gridArea = "1 / 1"
        input_groupColor.style.gridArea = "1 / 1"
        input_groupColor.style.width = "45px"
        input_groupColor.style.height = "35px"
        input_groupColor.style.zIndex = "0";
        colorWrapper.appendChild(divGroupColor)
        colorWrapper.appendChild(input_groupColor)


    
        idDiv.appendChild(div_id)
        idDiv.appendChild(textGroup)
        idDiv.appendChild(div_group)
        idDiv.appendChild(colorWrapper)
        mainDiv.appendChild(idDiv)

        //separator//
        let sep1 = document.createElement("div")
        sep1.setAttribute("class","vert-separator")
        mainDiv.appendChild(sep1)
        ////

        //third group : uploading
        let uploadDiv = document.createElement("div")
        uploadDiv.style.display ="flex"
        uploadDiv.style.flexDirection = "column"
        let uploadTopDiv = document.createElement("div")
        uploadTopDiv.setAttribute("class","uploadtitle")
        uploadTopDiv.textContent = "Upload data"
        uploadDiv.appendChild(uploadTopDiv)
        let uploadBottomDiv = document.createElement("div")

        var button_upload = document.createElement("div")
        button_upload.setAttribute("class", "uploadbutton2")
        uploadBottomDiv.appendChild(button_upload)
        var image_upload = document.createElement("img")
        image_upload.setAttribute("class","uploadIcon2");
        image_upload.setAttribute("src","icons/upload_icon.png");
        button_upload.appendChild(image_upload)

        var input_file1 = document.createElement("input")
        input_file1.type = "file"
        input_file1.setAttribute("class", "upload2");
        input_file1.setAttribute("name","input_file")
        input_file1.addEventListener("input",()=>{this.readUploadedData(input_file1)})
        button_upload.appendChild(input_file1)

        var input_file2 = document.createElement("textarea")
        input_file2.setAttribute("name","input_textarea")
        input_file2.setAttribute("class","uploadTextArea2")
        input_file2.addEventListener("input",()=>{this.readPastedData()})
        input_file2.setAttribute("placeholder","OR paste here")
        uploadBottomDiv.appendChild(input_file2)
        uploadDiv.appendChild(uploadBottomDiv)
        mainDiv.appendChild(uploadDiv)

        var input_filempty = document.createElement("div")
        input_filempty.setAttribute("class", "uploadbutton3");
        var input_fileempty_button = document.createElement("button")
        input_fileempty_button.setAttribute("class", "invisiblebutton");
        input_fileempty_button.addEventListener("click",()=>{this.emptyData()})
        var input_filempty_text =document.createElement("div")
        input_filempty_text.setAttribute("class", "horizontalText");
        input_filempty_text.textContent = "EMPTY"
        input_fileempty_button.appendChild(input_filempty_text)
        input_filempty.appendChild(input_fileempty_button)
        uploadBottomDiv.appendChild(input_filempty)

        //separator//
        let sep2 = document.createElement("div")
        sep2.setAttribute("class","vert-separator")
        mainDiv.appendChild(sep2)
        ////

        //fourth group: name and other things
        var defGroup = document.createElement("div")
        defGroup.setAttribute("name","defGroup")
        defGroup.style.flex = 2
        var input_name = menuCreateInput("text","input_name",this.name)
        input_name.setAttribute("class","fileslot_name")
        input_name.placeholder = "Write here the dataset name"
        input_name.addEventListener("change",(d)=>{this.changeName(d.target.value)})
        var stateTable = createTable(2,3)
        stateTable.style.marginTop = '3px'
        stateTable.style.border = "0px"
        stateTable.style.tableLayout = "fixed"
        stateTable.rows[0].cells[0].textContent = "File type : "

        var typeOptions = [{name:"Single analysis",value:"analysis"},{name:"Matrix",value:"matrix"}]
        var typeSelecter = menuCreateInput("select","file_type",this.type,typeOptions)
        typeSelecter.addEventListener("change",(d)=>{
            this.type = typeSelecter.value
            this.update()
        })
        typeSelecter.style.color = "black"
        var typeConfigButton = document.createElement("button")
        typeConfigButton.style.height = "17px"
        typeConfigButton.style.fontSize = "10px"
        typeConfigButton.setAttribute("name","type_config_button")
        typeConfigButton.textContent = "Configure..."
        typeConfigButton.addEventListener("click",()=>{this.showMatrixPopup()})
        if(this.type != "matrix"){typeConfigButton.style.display = "none"}
        stateTable.rows[0].cells[1].appendChild(typeSelecter)
        stateTable.rows[0].cells[2].appendChild(typeConfigButton)
        
        let hasStates = false
        if(this.data_derived.length>0){hasStates = true}
        if(hasStates){
            stateTable.rows[1].cells[0].textContent = "File state : "
            var stateOptions = this.findStateOptions()
             var stateSelecter = menuCreateInput("select","file_state",this.state,stateOptions)
            stateSelecter.addEventListener("change",(d)=>{
                this.switchFileState(stateSelecter.value)
                this.refreshSlot()
            })
            stateSelecter.style.color = "black"
            stateTable.rows[1].cells[1].appendChild(stateSelecter)
        }
        //add a button to display actions over file states
        var stateActionButton = document.createElement("button")
        stateActionButton.style.height = "17px"
        stateActionButton.innerHTML = "Manage states"
        stateActionButton.style.fontSize = "10px"
        stateActionButton.addEventListener("click",()=>{this.showStatesPopup()})
        stateTable.rows[1].cells[2].appendChild(stateActionButton)
       
        defGroup.appendChild(input_name)
        defGroup.appendChild(stateTable)
        mainDiv.appendChild(defGroup)

        //separator//
        let sep3 = document.createElement("div")
        sep3.setAttribute("class","vert-separator")
        mainDiv.appendChild(sep3)
        ////

        var infoGroup = document.createElement("div")
        infoGroup.setAttribute("name","infoGroup")
        infoGroup.style.marginTop = '2px'
        infoGroup.style.flex = 0.75
        let subGroup = this.render_infos()
        infoGroup.appendChild(subGroup)
        mainDiv.appendChild(infoGroup)

        //1-last group: copy and save button
        var buttonsGroup = document.createElement("div")
        buttonsGroup.style.marginRight = "10px"
        var button_log = document.createElement("button")
        var button_copy = document.createElement("button")
        var button_save = document.createElement("button")
        button_log.setAttribute("name","button_log")
        button_copy.setAttribute("name","button_copy")
        button_save.setAttribute("name","button_save")
        button_log.setAttribute("class", "slimiconbutton")
        button_copy.setAttribute("class","slimiconbutton")
        button_save.setAttribute("class","slimiconbutton")
        button_log.textContent = "LOG"
        button_copy.textContent = "COPY"
        button_save.textContent = "SAVE"
        var img_log = document.createElement("img")
        var img_copy = document.createElement("img")
        var img_save = document.createElement("img")
        img_log.setAttribute("class","parametersButton")
        img_copy.setAttribute("class","parametersButton")
        img_save.setAttribute("class","parametersButton")
        img_log.setAttribute("src","icons/notes_icon.png")
        img_copy.setAttribute("src","icons/copy.png");
        img_save.setAttribute("src","icons/save_icon.png");
        button_log.appendChild(img_log)
        button_copy.appendChild(img_copy)
        button_save.appendChild(img_save)
        button_log.addEventListener("click",()=>{this.showLogsPopup()})
        button_copy.addEventListener("click",()=>{this.copyToClipboard()})
        button_save.addEventListener("click",()=>{saveFileToDisk(this)})
        buttonsGroup.appendChild(button_log)
        buttonsGroup.appendChild(button_copy)
        buttonsGroup.appendChild(button_save)
        mainDiv.appendChild(buttonsGroup)

        //last group : delete file (should also delete the slot)
        var deleteGroup = document.createElement("div")
        deleteGroup.style.marginRight = "10px"
        var button_delete = document.createElement("button")
        button_delete.setAttribute("name","button_delete")
        button_delete.setAttribute("class","slimiconbutton")
        button_delete.textContent = "DEL"
        button_delete.addEventListener("click",(d)=>{this.askForDeletion(d)})
        var img_buttonDelete = document.createElement("img")
        img_buttonDelete.setAttribute("class","parametersButton");
        img_buttonDelete.setAttribute("src","icons/remove.png");
        button_delete.appendChild(img_buttonDelete)
        deleteGroup.appendChild(button_delete)
        mainDiv.appendChild(deleteGroup)
        this.html = mainDiv
        return mainDiv
    }

    //render the info part and returns a subgroup
    render_infos(){
        var div = document.createElement("div")
        div.setAttribute("name","infoSubGroup")
        if(!this.data || this.data.length ==0){
            div.textContent = "Empty data slot"
            return div
        }
        var info_1 = document.createElement("div")
        var info_2 = document.createElement("div")
        var dataLength = this.data.length || ""
        var lineLength = ""
        if(this.data[0]){lineLength = this.data[0].length}
        info_1.textContent = "#peaks: "+(dataLength-1)
        info_2.textContent = "#columns: "+lineLength
        div.appendChild(info_1)
        div.appendChild(info_2)
        
        if(this.state == "calibrated"){
            var calibData = this.metadata.calibration
            var info_c1 = document.createElement("div")
            info_c1.textContent = "Calibration: "+calibData.method
            var info_c2 = document.createElement("div")
            var disp_error = calibData.residualError || 0
            info_c2.textContent = "residuals: "+disp_error.toFixed(3)+" ppm"
            div.appendChild(info_c1)
            div.appendChild(info_c2)
        }else if(this.state == "attributed"){
            var attData = this.metadata.attribution
            var percent = 100*attData.peakLength_att / attData.peakLength_raw ||0
            var info_a1 = document.createElement("div")
            info_a1.textContent = "attributed peaks: "+percent.toFixed(1)+"%"
            div.appendChild(info_a1)
        }
        if(this.data.length >0){
            var button = document.createElement("button")
            button.style.height = "17px"
            button.style.fontSize = "10px"
            button.textContent = "More metadata..."
            div.appendChild(button)
            button.addEventListener("click",()=>{this.renderMetaPopup()})
        }
        return div
    }

    /**displays a popup with the metadata info */
    renderMetaPopup(){
        let popup = new Popup("metaData","")
        let meta = this.metadata
        popup.valButton.remove()
        let wrapper = popup.popup.querySelector("div[name='popup_content']")
        //main report
        let mainInfo = document.createElement("div")
        mainInfo.style.marginBottom = '20px'
        mainInfo.style.textAlign = "left"
        var line1 = document.createElement("div")
        line1.textContent = "#peaks: "+this.data.length
        mainInfo.appendChild(line1)
        var line2 = document.createElement("div")
        line2.textContent = "#columns: "+this.data[0].length
        mainInfo.appendChild(line2)
        var mzMin = parseFloat(this.data[1][config.mz])
        var mzMax = parseFloat(this.data[1][config.mz])
        for(let i=1; i<this.data.length; i++){
            let mz = parseFloat(this.data[i][config.mz])
            if(mz>mzMax){mzMax = mz}
            else if(mz<mzMin){mzMin = mz}
        }
        var line3 = document.createElement("div")
        line3.textContent = "m/z range: "+mzMin.toFixed(3)+" - "+mzMax.toFixed(3)
        mainInfo.appendChild(line3)
        wrapper.appendChild(mainInfo)
        //calibration report
        if(meta.calibration.method){
            let calibCollapsed = false
            let calibDivTitle = document.createElement("div")
            calibDivTitle.setAttribute("class","collapseHeader")
            calibDivTitle.style.backgroundColor = '#edc948'
            calibDivTitle.textContent = "Calibration report ▲"
            calibDivTitle.addEventListener("click",()=>{
                if(calibCollapsed){
                    calibDivTitle.textContent = "Calibration report ▲"
                    calibCollapsed = false
                }else{
                    calibDivTitle.textContent = "Calibration report ▼"
                    calibCollapsed = true
                }
                calibDiv.classList.toggle("collapsed")
                calibDiv.classList.toggle("shown")
            })
            let calibDiv = document.createElement("div")
            calibDiv.setAttribute("class","collapsable")
            calibDiv.classList.toggle("shown")
            calibDiv.style.backgroundColor = '#f3e7bdff'
            calibDiv.style.textAlign = "left"
            calibDiv.style.marginBottom = '20px'
            var c_line1 = document.createElement("div")
            c_line1.textContent = "Calibration method used: "+meta.calibration.method
            calibDiv.appendChild(c_line1)
            var c_line2 = document.createElement("div")
            c_line2.textContent = "Number of calibrants: "+meta.calibration.points.length
            calibDiv.appendChild(c_line2)
            //looks for mass range in the calibrants
            var c_mzMin = meta.calibration.points[0][0]
            var c_mzMax = meta.calibration.points[0][0]
            for(let i=0; i<meta.calibration.points.length; i++){
                if(meta.calibration.points[i][0]>c_mzMax){c_mzMax = meta.calibration.points[i][0]}
                else if(meta.calibration.points[i][0]<c_mzMin){c_mzMin = meta.calibration.points[i][0]}
            }
            var c_line3 = document.createElement("div")
            c_line3.textContent = "m/z range: "+c_mzMin.toFixed(3)+" - "+c_mzMax.toFixed(3)
            calibDiv.appendChild(c_line3)
            var c_line4 = document.createElement("div")
            c_line4.textContent = "residual error (ppm): "+meta.calibration.residualError.toFixed(5)
            calibDiv.appendChild(c_line4)
            var c_button = document.createElement("button")
            c_button.textContent = "Copy calibrants list (m/z-ppm-name)"
            c_button.addEventListener("click",()=>{
                copy2DDataSubsetToClipboard(meta.calibration.points)
            })
            calibDiv.appendChild(c_button)
            wrapper.appendChild(calibDivTitle)
            wrapper.appendChild(calibDiv)
        }
        //attribution report
        if(meta.attribution.peakLength_raw){
            let attribCollapsed = false
            let attribDivTitle = document.createElement("div")
            attribDivTitle.setAttribute("class","collapseHeader")
            attribDivTitle.style.backgroundColor = '#96c756'
            attribDivTitle.textContent = "Attribution report ▲"
            attribDivTitle.addEventListener("click",()=>{
                if(attribCollapsed){
                    attribDivTitle.textContent = "Attribution report ▲"
                    attribCollapsed = false
                }else{
                    attribDivTitle.textContent = "Attribution report ▼"
                    attribCollapsed = true
                }
                attribDiv.classList.toggle("collapsed")
                attribDiv.classList.toggle("shown")
            })
            let attribDiv = document.createElement("div")
            attribDiv.setAttribute("class","collapsable")
            attribDiv.classList.toggle("shown")
            attribDiv.style.backgroundColor = '#cfe3b4ff'
            attribDiv.style.textAlign = "left"
            attribDiv.style.marginBottom = '20px'

            var a_line1 = document.createElement("div")
            a_line1.textContent = "Attribution duration: "+meta.attribution.time+" ms"
            attribDiv.appendChild(a_line1)
            //already prepares last line
            var a_linef  = document.createElement("div")
            var color = ["#df4f50","#5aad5f","#2678ca","#979290"]
            let sectorsName = ["unattribued peaks","attributed peaks","isotopic peaks","removed peaks"]
            let p_att = meta.attribution.peakLength_att || 0 //attributed peaks
            let p_iso = meta.attribution.peakLength_iso || 0 //isotopic peaks
            let p_rem = meta.attribution.peakLength_rem || 0 //removed peaks
            let p_raw = meta.attribution.peakLength_raw || 0
            let p_una = p_raw - p_rem - p_iso - p_att
            let pieData = [p_una, p_att, p_iso, p_rem]
            if(p_rem ==0){
                color.pop();
                sectorsName.pop();
                pieData.pop();
            }
            let p_net = meta.attribution.attribByNetwork || 0
            let percentNetwork = 0
            if(p_att>0){
                percentNetwork = 100* p_net / p_att
            }
            var a_line2  = document.createElement("div")
            a_line2.textContent = "Percentage attributed by network :"+percentNetwork.toFixed(1)+"%"
            attribDiv.appendChild(a_line2)
            var a_line3  = document.createElement("div")
            a_line3.textContent = "Percentages of attribution (% of total peaks):"
            attribDiv.appendChild(a_line3)
            attribDiv.appendChild(a_linef)
            wrapper.appendChild(attribDivTitle)
            wrapper.appendChild(attribDiv)

            a_linef.setAttribute("id","reportAttribution")
            let pieCell= appendCell("#reportAttribution","pieChartReport")
            drawPieChart(pieData, sectorsName, pieCell, color, "black")
        }
        
    }

    /** returns an array of selecter option for the state of this file */
    findStateOptions(){
        let states = []
        for(let i=-1; i<this.data_derived.length; i++){
            let state={name:this.state}
            if(i>=0){state = this.data_derived[i]}
            let option = {value:state.name}
            if(state.name == "calibrated"){
                option.name = "Calibrated data"
            }else if(state.name == "raw"){
                option.name = "Raw upload"
            }else if(state.name == "attributed"){
                option.name = "Attributed data"
            }else{
                option.name = state.name
            }
            states.push(option)
        }
        if(states.length ==0){states.push({name:"Raw upload",value:"raw"})}
        return states
    }

    /** update the displayed elements on the file line. Please do refreshSlot if it should update eventListeners */
    update(){
        let groupName = ""
        let groupColor = "#000000"
        if(this.fileGroup){
            groupName = this.fileGroup.name
            groupColor = this.fileGroup.color
        }
        let inputGroupName = this.html.querySelector("input[name='input_group']")
        inputGroupName.value = groupName
        let inputGroupColor = this.html.querySelector("input[name='groupColor']")
        inputGroupColor.value = groupColor
        let inputGroupRect = this.html.querySelector("div[name='colorRect']")
        inputGroupRect.style.backgroundColor = groupColor

        let inputName = this.html.querySelector("input[name='input_name']")
        inputName.value = this.name
        //update the central button display
        let buttonType = this.html.querySelector("button[name='type_config_button']")
        if(this.type == "matrix"){buttonType.style.display = "inline"}
        else{buttonType.style.display = "none"}

        //updates the infos
        let infoGroup = this.html.querySelector("div[name='infoGroup']")
        let infoSubGroup = this.html.querySelector("div[name='infoSubGroup']")
        if(infoSubGroup){infoSubGroup.remove()}
        let newSubGroup = this.render_infos()
        infoGroup.appendChild(newSubGroup)
    }
    /** refreshes and re-renders the fileslot */
    refreshSlot(){
        if(!this.html){return;}
        let parentDiv = this.html.parentNode
        this.html.remove()
        let newSlot = this.render()
        parentDiv.appendChild(newSlot)
    }

    /** changes the name of this file */
    changeName(newName){
        this.name = newName
        this.logs.push("Changed name to: "+newName)
        this.update()
        resetDataSelecters()
    }

    /**event: creates a popup to confirm deletion or if shift is pressed (d.shiftKey) deletes it directly */
    askForDeletion(d){
        if(d.shiftKey){this.delete();return;}
        let textContent = "Are you sure you want to delete this file ?<br> You won't be able to undo this <br> <br> Tip: you can press shift+click next time to disable this warning <br>"
        new Popup_confirmation("deleteFile",textContent, ()=>{this.delete()})
    }

    /** deletes the current file, updates the display */
    delete(){
        //looks first if the group needs to be deleted
        if(this.fileGroup && this.fileGroup.list.length == 1){
            let index = this.fileList.findGroupIndexByName(this.fileGroup.name)
            this.fileList.groups.splice(index,1)
        }
        this.fileList.list.splice(this.index,1)
        this.fileList.render()
        this.fileList.resetIndexes()
        resetDataSelecters()
        delete this.data
        delete this.data_derived
        delete this//i'm not sure this works, that's why I added the steps before to remove the biggest data holders
    }

    /** fill with data */
    fill(data){
        /** reset data_derived */
        this.data_derived = []
        this.data = data
    }

    /**triggers a group change: looks for a group with this new name, if not creates a new one */
    changeGroup(newName){
        let fileList = this.fileList
        /**removes the file from the current group */
        if(this.fileGroup){
            let index = this.fileGroup.findFileIndexById(this.id)
            if(index >= 0){
                this.fileGroup.list.splice(index,1)
            }
            //delete this group if it is empty
            if(this.fileGroup.list.length == 0){
                let groupIndex = fileList.findGroupIndexByName(this.fileGroup.name)
                if(groupIndex){
                    fileList.groups.splice(groupIndex,1)
                }
            }
        }
        /**looks for a new group with the correct name */
        let group = fileList.findGroupByName(newName)
        //if it finds this new group, adds this file to it
        if(group){
            group.list.push(this)
            this.fileGroup = group
        }else{//if it didn't find the group, creates a new one
            let newGroup = new FileGroup(newName)
            newGroup.color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
            fileList.groups.push(newGroup)
            newGroup.list.push(this)
            this.fileGroup = newGroup
        }
    }

    /** copy the data to the clipboard */
    copyToClipboard(){
        var splitterA = "\t";
        var data = this.data
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
        //display a confirmation
        this.html.classList.add("bckgrndhighlight")
        setTimeout(() => {this.html.classList.remove("bckgrndhighlight")}, 500);
    }

    /**removes the data and updates the display. Goes to look for a data_derived that could replace it */
    emptyData(){
        this.data = []
        let oldState = this.state
        if(this.data_derived[0]){
            this.data = this.data_derived[0].data
            this.state = this.data_derived[0].name
            this.data_derived.shift()
        }
        this.refreshSlot()
        this.logs.push("Data removed ("+oldState+")")
        //display a confirmation
        this.html.classList.add("bckgrndred")
        setTimeout(() => {this.html.classList.remove("bckgrndred")}, 500);
    }

    /**read pasted data */
    readPastedData(){
        let textarea = this.html.querySelector("textarea[name='input_textarea']")
        let text = textarea.value
        this.data = parseInputData(text, splitterTextArea)
        this.data_derived = []
        /**updates the defaut columns if this is the first upload */
        if(!isFileUploaded){
            autoSetupColumns(this.data[0])
        }
        /**logs */
            let log = 'Read data from pasted source, '
            log+= this.data.length + "peaks"
            if(this.data[0]){
                log +=", "+this.data[0].length+" columns"
            }
            this.logs.push(log)

        this.update()
        resetDataSelecters()
        indexFiles()
        /**confirms by display */
        textarea.value = ""
        this.html.classList.add("bckgrndgreen")
        setTimeout(() => {this.html.classList.remove("bckgrndgreen")}, 500);
    }

    /**read uploaded data */
    readUploadedData(fileinput){
        /** either an input is given, or a uploaded file is given */
        /**either way, inputted file is found */
        let fileData = fileinput
        if(fileinput.files && fileinput.files[0]){fileData =fileinput.files[0]}
        let reader = new FileReader();
        reader.readAsBinaryString(fileData);
        reader.onload =  (e) => {
            let name = fileData.name
            name = name.replace(/\.[^/.]+$/, "")
            this.name = name;
            this.size = e.total;
            let rawData = e.target.result
            this.data = parseInputData(rawData, splitter)
            this.data_derived = []
            /**setups the columns if this is the first file uploaded */
            if(!isFileUploaded){
                autoSetupColumns(this.data[0])
            }
            /**logs */
            let log = 'Read data from external file named '+this.name+', '
            log+= (this.data.length-1) + "peaks"
            if(this.data[0]){
                log +=", "+this.data[0].length+" columns"
            }
            this.logs.push(log)
            /**resets the fileinput by re-rendering the whole slot */
            this.refreshSlot()
            /**confirms by display */
            this.html.classList.add("bckgrndgreen")
            setTimeout(() => {this.html.classList.remove("bckgrndgreen")}, 100);
            /**refreshes the name selecters */
            resetDataSelecters()
            indexFiles()
        }
    }

    /**prepares a popup to customize matrix parameters */
    showMatrixPopup(){
        let popup = new Popup("matrix_config","") 
        if(!this.matrix.list){this.initializeMatrix()}       
        this.fillMatrixPopup(popup)
    }

    /**fills the matrix popup with data */
    fillMatrixPopup(popup){
        if(!this.matrix){return;}
        if(!this.data || !this.data[0]){return}
        let cols = this.data[0]
        let wrapper = popup.popup.querySelector("div[name='popup_content']")

        let containerDiv = document.createElement("div")
        containerDiv.style.display = "flex"
        let columns = [document.createElement("div"),document.createElement("div")]
        columns[0].style.flex = "1"
        columns[1].style.flex = "1"
        let titlecol1 = document.createElement("div")
        titlecol1.textContent = "Define columns for analyses intensities:"
        titlecol1.style.textAlign = "center"
        let inputcol1 = document.createElement("div")
        let inputmincol = menuCreateInput("number","minCol",this.matrix.matrixMin)
        let inputmaxcol = menuCreateInput("number","maxCol",this.matrix.matrixMax)
        inputmincol.addEventListener("change",()=>{
            this.matrix.matrixMin = parseInt(inputmincol.value)
            this.logs.push("Matrix columns were redefined as ["+this.matrix.matrixMin+";"+this.matrix.matrixMax+"]")
            this.initializeMatrix()
            this.fillMatrixPopup(popup)
            containerDiv.remove()
            loadingsButton.remove()
        })
        inputmaxcol.addEventListener("change",()=>{
            this.matrix.matrixMax = parseInt(inputmaxcol.value)
            this.logs.push("Matrix columns were redefined as ["+this.matrix.matrixMin+";"+this.matrix.matrixMax+"]")
            this.initializeMatrix()
            this.fillMatrixPopup(popup)
            containerDiv.remove()
            loadingsButton.remove()

        })
        inputmincol.placeholder = "min"
        inputmaxcol.placeholder = "max"
        inputcol1.appendChild(inputmincol)
        inputcol1.appendChild(inputmaxcol)
        inputcol1.style.textAlign = "center"

        let table = createTable(cols.length, 1)
        table.style.border = "0px"
        table.style.margin = "5px"
        for(let i=0; i<cols.length; i++){
            if(!table.rows[i]){continue;}
            table.rows[i].cells[0].style.border = "0px"
            table.rows[i].cells[0].textContent = cols[i]
        }
        for(let i=this.matrix.matrixMin; i<=this.matrix.matrixMax; i++){
            if(!table.rows[i]){continue;}
            table.rows[i].cells[0].style.fontWeight = "bold"
            table.rows[i].cells[0].style.color = "#f38f32"
        }

        columns[0].appendChild(titlecol1)
        columns[0].appendChild(inputcol1)
        columns[0].appendChild(document.createElement("br"))
        columns[0].appendChild(table)

        //second column
        let titlecol2 = document.createElement("div")
        titlecol2.textContent = "Automatically look for group based on Data manager group and file names"
        titlecol2.style.textAlign = "center"
        let checkboxauto = menuCreateInput("checkbox","checkbox_auto",this.matrix.auto)
        titlecol2.appendChild(checkboxauto)
        checkboxauto.addEventListener("change",()=>{
            this.matrix.auto = checkboxauto.checked
            if(!this.matrix.auto){this.initializeMatrix()}
            else{this.matrix.list = undefined}
            this.fillMatrixPopup(popup)
            containerDiv.remove()
            loadingsButton.remove()
        })

        columns[1].appendChild(titlecol2)
        if(!this.matrix.auto && this.matrix.matrixMin && this.matrix.matrixMax &&(this.matrix.matrixMax>this.matrix.matrixMin)&& this.matrix.list){
            let length = this.matrix.matrixMax - this.matrix.matrixMin
            let table2 = createTable(length+2, 3)
            table2.style.border = "0px"
            table2.style.margin = "auto"
            table2.style.width = "90%"
            table2.rows[0].cells[0].textContent = "Name"
            table2.rows[0].cells[1].textContent  = "Group"
            table2.rows[0].cells[2].textContent  = "Color"
            for(let i=0; i<length+1; i++){
                if(!this.matrix.list[i]){continue;}
                table2.rows[i+1].cells[0].textContent  = this.matrix.list[i].name
                let inputGroup = menuCreateInput("text","groupName_"+i,this.matrix.list[i].group)
                inputGroup.addEventListener("change",()=>{
                    this.matrix.list[i].group = inputGroup.value
                })
                let inputColor = menuCreateInput("color","groupColor_"+i, this.matrix.list[i].color)
                inputColor.addEventListener("change",()=>{
                    this.matrix.list[i].color = inputColor.value
                })
                table2.rows[i+1].cells[1].appendChild(inputGroup)
                table2.rows[i+1].cells[2].appendChild(inputColor)
                table2.rows[i+1].cells[0].style.border = "0px"
                table2.rows[i+1].cells[1].style.border = "0px"
                table2.rows[i+1].cells[2].style.border = "0px"
            }
            columns[1].appendChild(table2)
        }

        //add a button for pca
        let loadingsButton = document.createElement("button")
        loadingsButton.textContent = "Visualize/Edit PCA loadings"
        loadingsButton.setAttribute("class","popupclose")
        loadingsButton.addEventListener("click",()=>{
            let popup = new Popup_PCAVariables(this.index)
        })

        containerDiv.appendChild(columns[0])
        containerDiv.appendChild(columns[1])
        wrapper.appendChild(containerDiv)
        wrapper.appendChild(loadingsButton)

    }

    /**initializes matrix data with column names and groups */
    initializeMatrix(){
        if(!this.matrix){this.matrix = {}}
        if(!this.matrix.matrixMin || ! this.matrix.matrixMax){return}
        if(!this.data || !this.data[0]){return;}

        let cols = this.data[0]
        if(!this.matrix.list){this.matrix.list = []}
        let length = this.matrix.matrixMax - this.matrix.matrixMin
        for(let i=0; i<length+1; i++){
            let name = this.extractIntensityName(cols[i+this.matrix.matrixMin])
            if(this.matrix.list[i]){
                this.matrix.list[i].name = name
            }else{
                this.matrix.list[i] = {name:name, group:"", color:"#000000"}
            }
        }
        //find groups and colors for files
        if(this.matrix.auto){
            for(let i=0; i<length+1; i++){
                let file = this.fileList.findFileByName(this.matrix.list[i].name)
                if(file && file.fileGroup){
                    this.matrix.list[i].group = file.fileGroup.name
                    this.matrix.list[i].color = file.fileGroup.color
                }else{
                    if(!this.matrix.list[i].group){ this.matrix.list[i].group = "" }
                    if(!this.matrix.list[i].color){ this.matrix.list[i].color = "#000000" }
                }
            }
        }
        //removes this.list if the length has been shortened
        this.matrix.list.splice(length+1)
    }

    /**returns the name in an intensity column */
    extractIntensityName(str){  
        return str.startsWith("I_") ? str.substring(2) : str;
    }

    showLogsPopup(){
        let popup = new Popup("file_logs","") 
        this.fillLogsPopup(popup)
    }

    fillLogsPopup(popup){
        let wrapper = popup.popup.querySelector("div[name='popup_content']")
        let containerDiv = document.createElement("div")
        wrapper.appendChild(containerDiv)
        let table = createTable(this.logs.length, 2)
        containerDiv.appendChild(table)
        for(let i=0; i<this.logs.length; i++){
            table.rows[i].cells[0].innerHTML = this.logs[i]
            let delButton = document.createElement("button")
            delButton.textContent = "X"
            delButton.addEventListener("click",()=>{
                this.logs.splice(i,1)
                this.fillLogsPopup(popup)
                containerDiv.remove()
            })
            table.rows[i].cells[1].appendChild(delButton)
        }
        //add copy and clean logs buttons
        var copyButton = document.createElement("button")
        copyButton.setAttribute("class","popupclose")
        copyButton.textContent = "COPY LOGS"
        copyButton.addEventListener("click",()=>{
            let text = ""
            for(let i=0; i<this.logs.length; i++){
                text += this.logs[i]
                text += "\n"
            }
            navigator.clipboard.writeText(text)
        })
        containerDiv.appendChild(copyButton)
    }

    /**search a file state by its name */
    searchFileState(name){
        if(this.state == name){return "active"}
        for(let i=0; i<this.data_derived.length; i++){
            const state = this.data_derived[i]
            if(state.name == name){return state}
        }
        return undefined;
    }

    /**add a new file state. If setAsActive, replaces the current data */
    addFileState(stateName, data, setAsActive, copyMetadata){
        if(this.data_derived=={})[this.data_derived = []]
        let stateSlot = this.searchFileState(stateName)
        //handle edge case when there is already this file state and it's active
        if(stateSlot == "active"){
            this.data = data
            return;
        }
        let metadata = {}
        if(copyMetadata){
            metadata = JSON.parse(JSON.stringify(this.metadata))
        }else{
            metadata = {
                calibration:{},
                attribution:{},
                special:[]//{key,value} pairs
            }
        }
        if(setAsActive){
            let oldState = {name:this.state, data:this.data, metadata : this.metadata}
            this.data_derived.push(oldState)
            this.data = data
            this.state = stateName
            this.metadata = metadata
            //removes the state slot if it exists, as it's now the active state
            if(stateSlot){this.removeFileState(stateName)}
        }else{
            //searches if this state already exists
            if(stateSlot){
                stateSlot.data = data
            }else{
                let state = {name:stateName, data:data, metadata : metadata}
                this.data_derived.push(state)
            }
        }
        this.refreshSlot()
        indexFiles()
    }
    /**switches from the current filestate to the new one */ 
    switchFileState(targetName){
        let newState = this.searchFileState(targetName)
        if(!newState){return;}
        let oldState = {name:this.state, data:this.data, metadata:this.metadata}
        this.data_derived.push(oldState)
        this.state = newState.name
        this.data = newState.data
        if(newState.metadata){this.metadata = newState.metadata}
        this.removeFileState(targetName)
        //Recomputes indexes to allow for interactivity
        indexFiles()
    }
    /**removes a file state */
    removeFileState(stateName){
        let stateIndex = -1
        for(let i=0; i<this.data_derived.length; i++){
            if(this.data_derived[i].name == stateName){
                stateIndex = i
                break;
            }
        }
        if(stateIndex>=0){
            this.data_derived.splice(stateIndex,1)
        }
    }

    /**shows a popup to manage file states */
    showStatesPopup(){
        let popup = new Popup("file_states","")
        popup.valButton.remove()
        let wrapper = popup.popup.querySelector("div[name='popup_content']")
        let containerDiv = document.createElement("div")
        wrapper.appendChild(containerDiv)
        //removes empty states
        for(let i=this.data_derived.length-1; i>=0; i--){
            console.log(this.data_derived[i].data, this.data_derived[i].name)
            if(!this.data_derived[i].data || !this.data_derived[i].name){
                this.data_derived.splice(i,1)
            }
        }
        //table with columns : name(input), #lines, #columns, duplicate,copy, remove
        let table = createTable(this.data_derived.length+2, 6)
        containerDiv.appendChild(table)
        //add headers
        table.rows[0].cells[0].textContent = "State name"
        table.rows[0].cells[1].textContent = "#Peaks"
        table.rows[0].cells[2].textContent = "#Columns"
        table.rows[0].cells[3].textContent = "Duplicate state"
        table.rows[0].cells[4].textContent = "Copy state"
        table.rows[0].cells[5].textContent = "Delete  state"
        //first line : current state
        let firstNameInput = menuCreateInput("text","stateName_current", this.state)
        firstNameInput.style.width = "90%"
        firstNameInput.style.color = "#000000"
        firstNameInput.addEventListener("change",()=>{
            this.state = firstNameInput.value
            this.refreshSlot()
        })
        table.rows[1].cells[0].appendChild(firstNameInput)
        table.rows[1].cells[1].textContent = this.data.length
        if(this.data[0]){table.rows[1].cells[2].textContent = this.data[0].length}
        let dupButton = document.createElement("button")
            dupButton.textContent = "Duplicate"
            dupButton.addEventListener("click",()=>{
                this.addFileState(this.state+"_copy", this.data, false, true)
                this.refreshSlot()
                popup.popup_close.click()
                this.showStatesPopup()
         })
        table.rows[1].cells[3].appendChild(dupButton)
        let copyButton = document.createElement("button")
        copyButton.textContent = "Copy"
        copyButton.addEventListener("click",()=>{
            this.copyToClipboard()
        })
        table.rows[1].cells[4].appendChild(copyButton)
        //other lines : derived states
        for(let i=0; i<this.data_derived.length; i++){
            let nameInput = menuCreateInput("text","stateName_"+i, this.data_derived[i].name)
            nameInput.style.width = "90%"
            nameInput.style.color = "#000000"
            nameInput.addEventListener("change",()=>{
                this.data_derived[i].name = nameInput.value
                this.refreshSlot()
            })
            table.rows[i+2].cells[0].appendChild(nameInput)
            table.rows[i+2].cells[1].textContent = this.data_derived[i].data.length
            if(this.data_derived[i].data[0]){table.rows[i+2].cells[2].textContent = this.data_derived[i].data[0].length}
            let dupButton = document.createElement("button")
            dupButton.textContent = "Duplicate"
            dupButton.addEventListener("click",()=>{
                this.addFileState(this.data_derived[i].name+"_copy", this.data_derived[i].data, false, true)
                this.refreshSlot()
                popup.popup_close.click()
                this.showStatesPopup()
            })
            table.rows[i+2].cells[3].appendChild(dupButton)
            let copyButton = document.createElement("button")
            copyButton.textContent = "Copy"
            copyButton.addEventListener("click",()=>{
                copyData(this.data_derived[i].data)
            })
            table.rows[i+2].cells[4].appendChild(copyButton)
            let delButton = document.createElement("button")
            delButton.textContent = "X"
            delButton.addEventListener("click",()=>{
                this.removeFileState(this.data_derived[i].name)
                this.refreshSlot()
                popup.popup_close.click()
                this.showStatesPopup()
            })
            table.rows[i+2].cells[5].appendChild(delButton)
        }
    
    }

    /** export to save in a savefile */
    export(){
        let pseudoFile = {}
        pseudoFile.name =this.name
        pseudoFile.id = this.id
        pseudoFile.index = this.index
        pseudoFile.type = this.type
        pseudoFile.dataType = this.dataType
        pseudoFile.state = this.state
        pseudoFile.data = this.data
        pseudoFile.data_derived = this.data_derived
        pseudoFile.matrix = this.matrix
        pseudoFile.logs = this.logs
        pseudoFile.metadata = this.metadata
        pseudoFile.groupName = ""
        if(this.group){pseudoFile.groupName = this.group.name}
        return pseudoFile
    }

    /**imports data from a saved File. id and index were already created */
    import(saveFile){
        this.type = saveFile.type
        this.dataType = saveFile.dataType
        this.state = saveFile.state
        this.data = saveFile.data
        this.data_derived = saveFile.data_derived
        this.matrix = saveFile.matrix
        this.logs = saveFile.logs
        this.metadata = saveFile.metadata
        //group is loaded by FileGroup
    }
}

/********************************************************/
/**MISCELLANEOUS FUNCTIONS RELATED TO FILE HANDLING******/
/****************************************************** */

/**creates a new file slot in variable files, default it to group "A" */
function createNewFileSlot(){
    let defaultGroup = files.findGroupByName("A")
    if(!defaultGroup){
        defaultGroup = files.createNewGroup("A")
        defaultGroup.color = "#000000"
    }
    files.createNewFile("",files.lookForNewID(), defaultGroup)
    files.render()
    resetDataSelecters()
    return files[files.list.length-1]
}

/** creates the option for the data selection
 * @var onlyFiles: only displays files and not matrix or venn
 */
function createDataOptions(selecter,onlyFiles, parentDiv){
  if(typeof selecter != 'object'){
      selecter = parentDiv.querySelector('select[name="'+selecter+'"]')
  }
  if(!selecter){return;}
  //remove all previous options
  var oldValue = selecter.value
  if(selecter.options != null){
      for(let j=selecter.options.length-1; j>=0; j--) { //backward for to remove all options
          selecter.remove(j);
      }
  }
  var options = []
  options[0] = document.createElement("option")
  options[0].setAttribute("value","none")
  options[0].innerHTML = "None"
  var l = 1
  if(!onlyFiles){
     options[l] = document.createElement("option")
     options[l].setAttribute("value","matrix")
     options[l].innerHTML = "Matrix"
     l+=1
  }
  options[l] = document.createElement("option")
  options[l].setAttribute("value","none")
  options[l].setAttribute("disabled","")
  options[l].innerHTML = "--------------------"
  l +=1
  for(let i=0; i<files.list.length; i++){
      options[l] = document.createElement("option")
      options[l].setAttribute("value","file_"+i)
      options[l].innerHTML = "File : "+files.list[i].name
      l += 1
  }
  if(vennData && ! onlyFiles){
      if(vennData.A){
          options[l] = document.createElement("option")
          options[l].setAttribute("value","none2")
          options[l].setAttribute("disabled","")
          options[l].innerHTML = "--------------------"
          options[l+1] = document.createElement("option")
          options[l+1].setAttribute("value","A")
          options[l+1].innerHTML = "Venn only A"
          options[l+2] = document.createElement("option")
          options[l+2].setAttribute("value","AuB")
          options[l+2].innerHTML = "Venn A∩B"
          options[l+3] = document.createElement("option")
          options[l+3].setAttribute("value","B")
          options[l+3].innerHTML = "Venn only B"
          l+=4
          if(vennData.C){
              options[l] = document.createElement("option")
              options[l].setAttribute("value","C")
              options[l].innerHTML = "Venn only C"
              options[l+1] = document.createElement("option")
              options[l+1].setAttribute("value","AuC")
              options[l+1].innerHTML = "Venn A∩C"
              options[l+2] = document.createElement("option")
              options[l+2].setAttribute("value","BuC")
              options[l+2].innerHTML = "Venn B∩C"
              options[l+3] = document.createElement("option")
              options[l+3].setAttribute("value","AuBuC")
              options[l+3].innerHTML = "Venn A∩B∩C"
              l+=4
              if(vennData.D){
                  options[l] = document.createElement("option")
                  options[l].setAttribute("value","D")
                  options[l].innerHTML = "Venn only D"
                  options[l+1] = document.createElement("option")
                  options[l+1].setAttribute("value","AuD")
                  options[l+1].innerHTML = "Venn A∩D"
                  options[l+2] = document.createElement("option")
                  options[l+2].setAttribute("value","BuD")
                  options[l+2].innerHTML = "Venn B∩D"
                  options[l+3] = document.createElement("option")
                  options[l+3].setAttribute("value","CuD")
                  options[l+3].innerHTML = "Venn C∩D"
                  options[l+4] = document.createElement("option")
                  options[l+4].setAttribute("value","AuBuD")
                  options[l+4].innerHTML = "Venn A∩B∩D"
                  options[l+5] = document.createElement("option")
                  options[l+5].setAttribute("value","AuCuD")
                  options[l+5].innerHTML = "Venn A∩C∩D"
                  options[l+6] = document.createElement("option")
                  options[l+6].setAttribute("value","BuCuD")
                  options[l+6].innerHTML = "Venn B∩C∩D"
                  options[l+7] = document.createElement("option")
                  options[l+7].setAttribute("value","AuBuCuD")
                  options[l+7].innerHTML = "Venn All (A∩B∩C∩D)"
                  l+=8
              }
          }
      }
  }
  //append all the options
  var length = 2 
  for(let i=0; i<options.length; i++){
      if(options[i]){
          selecter.appendChild(options[i])
      }
      length +=1
  }
  selecter.value = oldValue
  return selecter
}

/** resets all data selecters */
function resetDataSelecters(){
    createDataOptions(html_tabTable.querySelector("select[name='fileSelection']"),false);
    createDataOptions(html_tabParameters.querySelector("select[name='fileSelection']"),false);
    createDataOptions(html_tabPca.querySelector("select[name='fileSelection']"),false);
    createDataOptions(html_tabAttrib.querySelector("select[name='fileSelection']"),false);
    createDataOptions(html_tabCalib.querySelector("select[name='fileSelection']"),true);
    if(typeof html_tabPeaks !== 'undefined' && html_tabPeaks !== null){
            createDataOptions(html_tabPeaks.querySelector("select[name='fileSelection']"),true);
    }
    /** for venn and matrix tab */
    let fileChoices = document.querySelectorAll(".file_choice")
    for(let i=0; i<fileChoices.length; i++){
        createDataOptions(fileChoices[i],true)
    }
    addFilesToTreatmentTable();
    addFilesToMatrixTable();
    canvasA.htmlTopMenu.draw()
    canvasA.htmlTopMenu.draw()
    canvasB.htmlTopMenu.draw()
    canvasS.htmlTopMenu.draw()
    canvasNetwork.draw()
}

/**triggers a general update: visually of the data manager, updates the files indexes and data selecters */
function generalFilesUpdate(){
    indexFiles()
    files.render()
    resetDataSelecters()
}


/**read multiple data uploaded simultaneously */
async function readMultiImportData(input){
    if(debug){console.log(input.files.length+" files have been uploaded")}
    /**creates a new group */
    let groupName = files.findUniqueGroupName("upload", 0)
    let newGroup = new FileGroup(groupName)
    files.groups.push(newGroup)
    var file = ""
    //loops through each file
    for(let i=0; i<input.files.length; i++){
        file = input.files[i]
        var extension = file.name.split('.').pop();
        let name = input.files[i].name
        name = name.replace(/\.[^/.]+$/, "")
        if(extension == "pdata"){
            await importPuncdataFilesOnly(file, newGroup)
        }else{
            files.createNewFile(name,files.lookForNewID(),newGroup)
            let createdFile = files.list[files.list.length-1]
            await createdFile.readUploadedData(input.files[i])
        }
    }
    if(debug){console.log("finished multiimport")}
    generalFilesUpdate()
}


/**returns the group of a file based on the matrix (fileString is its name, "file_index" or "matrix") and the column*/
function findFileGroup(fileString,matrixColumn){
    let group = {}
    if(fileString == "matrix"){
        let colStart = parseInt(matrixFilesColumns[0])
        let header = matrixData[0]
        if(!header){return group}
        let fileName = header[parseInt(matrixColumn) + colStart]
        if(!fileName){return group}
        if(fileName.startsWith("I_")){
            fileName = fileName.slice(2)
        }
        let file = files.findFileByName(fileName)
        if(file && file.fileGroup){group = file.fileGroup}
    }else{
        let fileNum = parseInt(fileString.slice(5))
        let matrixFile = files.list[fileNum]
        if(!matrixFile || !matrixFile.matrix){return group}
        let fileList = matrixFile.matrix.list
        if(!matrixFile.matrix.auto && fileList){
            let element = fileList[matrixColumn]
            if(!element){return group}
            group = {name:element.group, color:element.color}
        }else{
            let colStart = parseInt(matrixFile.matrix.matrixMin)
            let header = matrixFile.data[0]
            if(!header || !colStart){return group}
            let fileName = header[parseInt(matrixColumn) + colStart]
            if(!fileName){return group}
            if(fileName.startsWith("I_")){
            fileName = fileName.slice(2)
            }
            let file = files.findFileByName(fileName)
            if(file && file.fileGroup){group = file.fileGroup}
        }
    }
    return group
}


/**************************************************** */
/*** functions for saving files********************** */

/**triggers a popup to input how to save a File as raw data */
function saveFileToDisk(file){
  var buttons = [
    {"name":"Save file","function": ()=>{saveFileToDisk_export(file)}}
  ]
  var selecters = [{"name":"fileExtension", "options":[]}]
  selecters[0].options = [
      {"value":"csv", "text":"CSV(;)"},
      {"value":"csvCOMMA", "text":"CSV(,)"},
      {"value":"txt", "text":"TXT"},
      {"value":"ascii", "text":"ASCII"},
  ]
  var inputs = [
    {"type":"text"}
  ]
  
  handlePopup("saveDataFile",'Choose the name of the file "'+file.name+'"',buttons,selecters,inputs)
}

/**saves data from a File as raw data */
function saveFileToDisk_export(fileData){
  var html_popup = document.querySelector('div[name="popup_saveDataFile"]')
  var data = fileData.data
  if(!data){return}
  //gets the file name
  var fileName = html_popup.querySelector('input[name="popup_input_0"]').value
  if(fileName == "" || fileName == undefined){fileName = "Puncdata_datafile"}

  //get the file extension
  var fileExtension = html_popup.querySelector('select[name="popup_selecter_0"]').value
  var splitterA = ";"
  if(fileExtension == "csvCOMMA"){splitterA=",";fileExtension="csv"}
  if(fileExtension == "txt"){splitterA = "\t"}
  if(fileExtension == "ascii"){splitterA = "  "}

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
  var DialogBox = document.getElementById("popupsave")
  var file = document.createElement('a');
  mimeType = "text/csv;encoding:utf-8" || 'application/octet-stream';
  var Blobfile = null
  Blobfile = new Blob([text], {type: mimeType})
  file.href = URL.createObjectURL(Blobfile);
  file.setAttribute('download', fileName+"."+fileExtension);
  document.body.appendChild(file);
    file.click();
    document.body.removeChild(file);
    DialogBox.style.display = "none"
    file.href = URL.revokeObjectURL(Blobfile);
}

/** html page setup */
/**add a new file */
document.getElementById("createFile").addEventListener("click",()=>{
    createNewFileSlot()
})

let files = new FileList

/**handles the sort bar buttons */
document.getElementById("sortDataButton").addEventListener("click",()=>{
    let type = document.getElementById("sortDataSelect1").value
    let order = document.getElementById("sortDataSelect2").value
    let asc = false
    if(order == "asc"){asc = true}
    files.sortFiles(type, asc)
})