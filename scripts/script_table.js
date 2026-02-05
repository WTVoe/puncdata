document.getElementById("tableMenuTableView").addEventListener("change", function(){ updateTableTab()})
//adds functionality of buttons
document.getElementById("tablePagePrevious").addEventListener("click",function(){
  let pageNum = document.getElementById("tablePageNum")
  pageNum.value = parseInt(pageNum.value)-1
  updateTableTab()
})
document.getElementById("tablePageNext").addEventListener("click",function(){
  let pageNum = document.getElementById("tablePageNum")
  pageNum.value = parseInt(pageNum.value)+1
  updateTableTab()
})



function updateTableTab(){
  var choice = html_tabTable.querySelector("select[name='fileSelection']").value
  //finds the table values
  let maxLength = document.getElementById("tableLinesMax").value
  let currentPage = document.getElementById("tablePageNum").value
  let editMode = document.getElementById("tableEditMode").checked
      if(choice == "matrix"){ arrayToTable(matrixData, maxLength, currentPage, editMode)}
      else if(choice =="none"){ d3.select("#rawDataTable").remove()}
      else if(choice.includes("file")){
          let fileNum = choice.slice(5);
            arrayToTable(files.list[fileNum].data, maxLength, currentPage, editMode);
      }
}


/**creates a table containing all the inputed data. maxLength is not implemented yet*/ 
function arrayToTable(inputArray, maxLength,pageNum, editMode, specialParam){
  d3.select("#rawDataTable").remove() //gets rid of the old title if there is one
  if(! inputArray|| inputArray.length == 0 || !inputArray[0]){
    return console.log("could not draw table, data file empty")
    ;}
  var result = "<table id='rawDataTable'>";
  //makes a special header for delte if edit mode
  if(editMode){
    result+="<thead><th></th>"
    for(var j=0; j<inputArray[0].length; j++){
      result += "<th>"+"<button name='delCol_"+j+"'>X</button>"
      result += "</th>"
  }
  result += "<th>"+"<button name='addCol'>+</button>"+"</th>"
  result += "</thead>"
  }


  //makes the header with column names
  result +="<thead>"
  if(editMode){ result +="<th></th>"}
  for(var j=0; j<inputArray[0].length; j++){
      result += "<th name='header_"+j+"'>";
      if(!editMode){result += inputArray[0][j]}
      result += "</th>"
  }
  result += "</thead><tbody>";
  if(isNaN(maxLength) || maxLength < 0){
    maxLength = inputArray.length
  }else if(maxLength > inputArray.length){
    maxLength = inputArray.length
  }
  maxLength = parseInt(maxLength)
  //determines which data has to be shown based on pageLength (maxLength) and page Number(pageNum)
  let startLength = maxLength*(pageNum-1)+1
  let endLength = startLength+maxLength
  if(editMode){
    //creates the skeleton of the table
    for(var i=startLength; i<endLength-1; i++) {
      result += "<tr>";
      result +="<th><button name='delLine_"+i+"'>X</button></th>"
      if(inputArray[i]){
        console.log(inputArray[i])
          for(var j=0; j<inputArray[i].length; j++){
            result +="<td name='inpt_"+i+"_"+j+"'>";
            result +="</td>"
        }
      }
      result += "</tr>";
    }
    result += "<th><button name='addLine_"+i+"'>+</button></th>"
    //fills the table with inputs later 
  }else{ //quicker method when not in editMode
    for(var i=startLength; i<endLength-1; i++) {
      result += "<tr>";
      if(inputArray[i]){
          for(var j=0; j<inputArray[i].length; j++){
            result += "<td>"+inputArray[i][j]+"</td>";
        }
      }
      result += "</tr>";
    }
  }
  result += "</tbody></table>";


    /**creates the html table */ 
    var tableplace = document.getElementById("tab_table");
    tableplace.insertAdjacentHTML('beforeend', result);

    //fills the table with inputs if needed
    if(editMode){ 
      //starts with the column titles
      for(var j=0; j<inputArray[0].length; j++){
        let input = document.createElement("input")
        input.setAttribute("value", inputArray[0][j])
        input.addEventListener("change", editOneTitle)
        tableplace.querySelector('th[name="header_'+j+'"]').appendChild(input)
      }

      for(let i=startLength; i<endLength; i++) {
        if(inputArray[i]){
          for(let j=0; j<inputArray[i].length; j++){
            let input = document.createElement("input")
            input.setAttribute("value", inputArray[i][j])
            input.addEventListener("change", editOneCell)
            if( tableplace.querySelector('td[name="inpt_'+i+'_'+j+'"]')){
              tableplace.querySelector('td[name="inpt_'+i+'_'+j+'"]').appendChild(input)
            }
          }
        }
      }
    }
    //edit the value of a table cell (editMode)
    function editOneCell(e){
      let tdName = this.parentNode.getAttribute("name")
      let splits = tdName.split("_")
      inputArray[splits[1]][splits[2]] = this.value
    }
    function editOneTitle(e){
      let tdName = this.parentNode.getAttribute("name")
      let splits = tdName.split("_")
      inputArray[0][splits[1]] = this.value
      columnNames = inputArray[0]
    }
    //adds the functionnality of delete line/cols buttons for edit Mode
    if(editMode){
      let html_table = document.getElementById("rawDataTable")
      let buttons = html_table.querySelectorAll("button")
      for(let i=0; i<buttons.length; i++){
        let buttonName = buttons[i].getAttribute("name")
        let slicedName = buttonName.split("_")
        if(slicedName[0]=="delCol"){
        buttons[i].addEventListener("click", function(){
          for(let j=0; j<inputArray.length; j++){
            inputArray[j].splice(slicedName[1], 1)
          }
          arrayToTable(inputArray, maxLength,pageNum,editMode);
        })
        }else if(slicedName[0]=="delLine"){
          buttons[i].addEventListener("click", function(){
            inputArray.splice(slicedName[1], 1)
            arrayToTable(inputArray, maxLength,pageNum,editMode);
          });
        }else if(slicedName[0]=="addCol"){
          buttons[i].addEventListener("click", function(){
            for(let j=0; j<inputArray.length; j++){
              inputArray[j].push("")
            }
            arrayToTable(inputArray, maxLength,pageNum,editMode);
          });   
        }else if(slicedName[0]=="addLine"){
          buttons[i].addEventListener("click", function(){
            let newLine = []
            for(let j=0; j<inputArray[0].length; j++){
              newLine.push("")
            }
            inputArray.push(newLine)
            arrayToTable(inputArray, maxLength+1,pageNum,editMode);
          });
        }
      }
    }
    


    //use the sorTable js library from sgnified to sort the tabkle
    if(!editMode){sortable('table#rawDataTable')}
    var sortButtons = document.querySelectorAll(".sortable-button")
    for(let i=0; i<sortButtons.length; i++){
      sortButtons[i].addEventListener("click", function(){
        let sortType = this.parentNode.getAttribute("aria-sort")
        let sortClass = this.parentNode.getAttribute("class")
        if(sortClass.includes("sort-string")){
          if(sortType == "descending"){
            inputArray = alphaNumericalSubArraySort(inputArray, i, true, true)
          }else{
            inputArray = alphaNumericalSubArraySort(inputArray, i, true, false)
          }
        }else{
          if(sortType == "descending"){
            inputArray.sort(function(a, b){return a[i]-b[i]}) 
            if(debug){console.log("descending")}
          }else{
            inputArray.sort(function(a, b){return b[i]-a[i]})
            if(debug){console.log("ascending")}
          }
        }
        //sets the data
        let choice = html_tabTable.querySelector("select[name='fileSelection']").value
        if(choice == "matrix"){ matrixData = inputArray}
        else if(choice.includes("file")){
          let fileNum = choice.slice(5);
          files.list[fileNum].data = inputArray
        }
        //redraws everything 
        let special = {"col":i,"order":sortType}
        drawEverything_noData()
        arrayToTable(inputArray, maxLength,pageNum,editMode, special);

        files.list[choice].data = inputArray
      });
    }
    // sets the good sorting to the special place
    if(specialParam){
      let sortButtonsMod =  html_tabTable.querySelectorAll("th")
      sortButtonsMod[specialParam.col].setAttribute("aria-sort",specialParam.order)
      sortButtonsMod[specialParam.col].classList.add("sortable-sort")
      sortButtonsMod[specialParam.col].classList.add("sortable-sort-"+specialParam.order)
      if(isNaN(inputArray[1][specialParam.col])){
        sortButtonsMod[specialParam.col].classList.add("sortable-sort-string")
      }else{
        sortButtonsMod[specialParam.col].classList.add("sortable-sort-number")
      }
    }
}