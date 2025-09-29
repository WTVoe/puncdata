/**This script contains classes and code to handle files and raw data for Punc'data version 1.15.8 and above */

/**a filelist handles handles a group of files and a html place to represent them */
class FileList{
    constructor(){
        this.groups = []
        this.files = []
        this.html = document.getElementById("datalist")
    }

    /** renders the datamanager */
    render(){
        let oldContainer = this.html.querySelector("div[name='container']")
        if(oldContainer){oldContainer.remove()}
        let container = document.createElement("div")
        container.setAttribute("name","container")
        this.html.appendChild(container)
        for(let i=0; i<this.files.length; i++){
            let filewrapper = document.createElement("div")
            filewrapper.setAttribute("id","fileslot_index_"+i)
            let fileslot = this.files[i].render()
            container.appendChild(filewrapper)
            filewrapper.appendChild(fileslot)
        }
    }

    /**mutates this.files to redo the order and redefines indexes**/
    moveFile(index, direction){ 
        if(isNaN(index)){return}
        if(direction =="up"){
            if(!this.files[index-1]){return}
            [this.files[index], this.files[index-1]] = [this.files[index-1], this.files[index]]
            this.files[index].index = index
            this.files[index-1].index = index-1
        }else if(direction == "down"){
             if(!this.files[index+1]){return}
             [this.files[index], this.files[index+1]] = [this.files[index+1], this.files[index]]
            this.files[index].index = index
            this.files[index+1].index = index+1
        }
        //restarts the render
        this.render()
        //highlight
        if(direction =="up"){
            this.files[index-1].html.classList.add("bckgrndhighlight")
            setTimeout(() => {this.files[index-1].html.classList.remove("bckgrndhighlight")}, 200);
        }else if(direction =="down"){
            this.files[index+1].html.classList.add("bckgrndhighlight")
            setTimeout(() => {this.files[index+1].html.classList.remove("bckgrndhighlight")}, 200);
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
        console.log(direction, steps,)
        /** when dropping to a upper index, all files before the current position do not move */
        if(direction == "up"){
            for(let i=0; i<steps; i++){
                console.log("moveup",index+i)
                this.moveFile(index+i+1, "up")
            }
        }else{
            for(let i=0; i<steps; i++){
                console.log("movedown",index-i)
                this.moveFile(index-i-1, "down")
            }
        }
        /**resets the animation of this.movefile and animates the true file */
        this.render()
        this.files[targetIndex].html.classList.add("bckgrndhighlight")
        setTimeout(() => {this.files[targetIndex].html.classList.remove("bckgrndhighlight")}, 200);
    }

    createNewFile(name,id, group){
        let index = this.files.length
        let newFile = new File(name,id,index, this, group)
        this.files.push(newFile)
        let container = this.html.querySelector("div[name='container']")
        if(container){
            newFile.render(container, index)
        }
        return newFile
    }

    /** reset all indexes in the filelist */
    resetIndexes(){
        for(let i=0; i<this.files.length; i++){
            this.files[i].index = i
        }
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
        if(iterationNb && iterationNb>0){nameTosearch += "iterationNb"}
        let firstGroup = this.findGroupByName(nameToSearch)
        if(!firstGroup){return name}
        //else, looks again
        this.findUniqueGroupName(name, iterationNb+1)

    }

}


class FileGroup{
    constructor(name){
        this.name = name
        this.color = "#000000"
        this.files = []
    }

    findFileIndexById(id){
        for(let i=0; i<this.files.length; i++){
            if(this.files[i].id == id){return i}
        }
        return -1
    }

    updateAllFiles(){
        for(let i=0; i<this.files.length; i++){
            this.files[i].update()
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
        this.data_derived = {}
        this.logs = []
        this.metadata = {
            calibration:{},
            attribution:{},
            special:[]//{key,value} pairs
        }
        this.fileList = fileList
        this.fileGroup = group
        if(group && group.files){group.files.push(this)}
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
            console.log(parseInt(handleIndex), parseInt(this.index))
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
        button_moveup.addEventListener("click",()=>{this.fileList.moveFile(this.index, "up")})
        button_movedown.addEventListener("click",()=>{this.fileList.moveFile(this.index, "down")})
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
        input_file1.addEventListener("input",()=>{this.readUploadedData()})
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
        input_name.addEventListener("change",(d)=>{this.changeName(d.target.value)})
        defGroup.appendChild(input_name)
        mainDiv.appendChild(defGroup)

         //separator//
        let sep3 = document.createElement("div")
        sep3.setAttribute("class","vert-separator")
        mainDiv.appendChild(sep3)
        ////

        var infoGroup = document.createElement("div")
        infoGroup.setAttribute("name","infoGroup")
        infoGroup.style.marginTop = '2px'
        infoGroup.style.flex = 0.5
        let subGroup = this.render_infos()
        infoGroup.appendChild(subGroup)
        mainDiv.appendChild(infoGroup)

        //1-last group: copy and save button
        var buttonsGroup = document.createElement("div")
        buttonsGroup.style.marginRight = "10px"
        var button_copy = document.createElement("button")
        var button_save = document.createElement("button")
        button_copy.setAttribute("name","button_copy")
        button_save.setAttribute("name","button_save")
        button_copy.setAttribute("class","slimiconbutton")
        button_save.setAttribute("class","slimiconbutton")
        button_copy.textContent = "COPY"
        button_save.textContent = "SAVE"
        var img_copy = document.createElement("img")
        var img_save = document.createElement("img")
        img_copy.setAttribute("class","parametersButton")
        img_save.setAttribute("class","parametersButton")
        img_copy.setAttribute("src","icons/copy.png");
        img_save.setAttribute("src","icons/save_icon.png");
        button_copy.appendChild(img_copy)
        button_save.appendChild(img_save)
        button_copy.addEventListener("click",()=>{this.copyToClipboard()})
        button_save.addEventListener("click",()=>{saveFileToDisk(this)})
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
        if(this.data.length ==0 || !this.data){
            div.textContent = "Empty data slot"
            return div
        }
        var info_1 = document.createElement("div")
        var info_2 = document.createElement("div")
        var dataLength = this.data.length || ""
        var lineLength = ""
        if(this.data[0]){lineLength = this.data[0].length}
        info_1.textContent = "#peaks:"+(dataLength-1)
        info_2.textContent = "#columns:"+lineLength
        div.appendChild(info_1)
        div.appendChild(info_2)
        return div
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
        this.update()
    }

    /**event: creates a popup to confirm deletion or if shift is pressed (d.shiftKey) deletes it directly */
    askForDeletion(d){
        console.log(d)
        if(d.shiftKey){this.delete();return;}
        let textContent = "Are you sure you want to delete this file ?<br> You won't be able to undo this <br> <br> Tip: you can press shift+click next time to disable this warning <br>"
        new Popup_confirmation("deleteFile",textContent, ()=>{this.delete()})
    }

    /** deletes the current file, updates the display */
    delete(){
        //looks first if the group needs to be deleted
        if(this.fileGroup && this.fileGroup.files.length == 1){
            let index = this.fileList.findGroupIndexByName(this.fileGroup.name)
            console.log(this.fileList.groups, index)
            this.fileList.groups.splice(index,1)
        }
        this.fileList.files.splice(this.index,1)
        this.fileList.render()
        this.fileList.resetIndexes()
        delete this.data
        delete this.data_derived
        delete this//i'm not sure this works, that's why I added the steps before to remove the biggest data holders
    }

    /** fill with data */
    fill(data){
        /** reset data_derived */
        this.data_derived = {}
        this.data = data
    }

    /**triggers a group change: looks for a group with this new name, if not creates a new one */
    changeGroup(newName){
        let fileList = this.fileList
        /**removes the file from the current group */
        if(this.fileGroup){
            let index = this.fileGroup.findFileIndexById(this.id)
            if(index >= 0){
                this.fileGroup.files.splice(index,1)
            }
            //delete this group if it is empty
            if(this.fileGroup.files.length == 0){
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
            group.files.push(this)
            this.fileGroup = group
        }else{//if it didn't find the group, creates a new one
            let newGroup = new FileGroup(newName)
            newGroup.color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
            fileList.groups.push(newGroup)
            newGroup.files.push(this)
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

    /**removes the data and updates the display */
    emptyData(){
        this.data = []
        this.data_derived = {}
        this.update()
        //display a confirmation
        this.html.classList.add("bckgrndred")
        setTimeout(() => {this.html.classList.remove("bckgrndred")}, 500);
    }

    /**read pasted data */
    readPastedData(){
        let textarea = this.html.querySelector("textarea[name='input_textarea']")
        let text = textarea.value
        this.data = parseInputData(text, splitterTextArea)
        this.data_derived = {}

        this.update()
        /**confirms by display */
        textarea.value = ""
        this.html.classList.add("bckgrndgreen")
        setTimeout(() => {this.html.classList.remove("bckgrndgreen")}, 500);
    }

    /**read uploaded data */
    readUploadedData(){
        let fileinput = this.html.querySelector("input[name='input_file']")
        let reader = new FileReader();
        console.log(fileinput)
        reader.readAsBinaryString(fileinput.files[0]);
        reader.onload =  (e) => {
            console.log(e, this)
            let name = fileinput.files[0].name
            name = name.replace(/\.[^/.]+$/, "")
            this.name = name;
            this.size = e.total;
            let rawData = e.target.result
            this.data = parseInputData(rawData, splitter)
            
            this.data_derived = {}
            /**resets the fileinput by re-rendering the whole slot */
            this.refreshSlot()
            /**confirms by display */
            this.html.classList.add("bckgrndgreen")
            setTimeout(() => {this.html.classList.remove("bckgrndgreen")}, 100);
        }
    }
}

// let test = new FileList
// test.files = [new File("number1",0,0,test), new File("number2",1,1,test)]
let files = new FileList


/** this function load files from Punc'data 1.15.7 and older versions to the new "File" object methods*/
function loadFilesOldVersion(savefile){
    console.log(savefile)
    //searches if a "upload group was already created"
    let groupName = files.findUniqueGroupName("upload")
    let newGroup = new FileGroup(groupName)
    files.groups.push(newGroup)
    let names = savefile.nameslist || []
    let startID = files.files.length
    for(let i=0; i<savefile.fileData.length; i++){
        let file = files.createNewFile(names[i], startID, newGroup)
        file.fill(savefile.fileData[i])
        startID += 1
    }
    files.render()
}



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

/**parse a raw input and returns it as an array of arrays */
function parseInputData(rawData, splittingCharacter){
    let data = [];
    let lbreak = rawData.split(/\r?\n/);
    lbreak.forEach(res => {
        data.push(res.split(splittingCharacter));
    });
    //cleans the data of empty lines
    for(let i=data.length-1;i>0 ;i--){
      if(data[i][0]=="" && data[i][1]==""){data.splice(i,1) }
      if(data[i] <= 1){data.splice(i,1) }
    }
    //replaces all remaining commas with dots(french way of placing commas where dots are in the english version)
    for(let i=data.length-1;i>0 ;i--){
      for(let j=data[i].length-1;j>0;j--){
        data[i][j] = data[i][j].replace(/,/g,'.')
      }
    } 
    return data
}