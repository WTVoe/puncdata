/** this file contains the functions to make the network tab function correctly */

/////////////////////////////////////////////////////////////
//////////////////HANDLE THE NETWORK MIDDLE TABLE////////////
////////////////////////////////////////////////////////////


/** example function of force */
function exampleForce(alpha) {
    let nodes= cvsN.data
    for (let i = 0, n = nodes.length, node, k = alpha * 0.1; i < n; ++i) {
      node = nodes[i];
      node.vx -= 10/(node.x-500) * k;
      node.vy -= 10/(node.y-400) * k;
    }
  }

/////////////////////////////////////
//////NETWORK CREATION//////////////
/////////////////////////////////////
class Network {
    constructor() {
        //an array of all nodes. Copy of data arrays
        this.nodes = []
        //an array of edges {"source","target","name"}
        this.edges = []
        //an adjacency list to quickly find the neighbours of a node. It stores in the set the id of edges where this node is the source
        this.adjacencyList = new Map()
        //adjacencey list works backwards. Used to find which links target to this node
        this.adjacencyListReverse = new Map()
    }

    /** removes previous nodes and data. Input data must be a 2D array */
    fill(data){
        this.edges = []
        this.nodes = data

        this.adjacencyList = new Map()
        this.adjacencyListReverse = new Map()
        for(let i=0; i<this.nodes.length; i++){
            this.adjacencyList.set(i, new Set())
            this.adjacencyListReverse.set(i, new Set())
        }
        this.sortNodes(config.mz, false)
        this.indexNodesMasses()
    }

    /** builds an index of the masses to build later faster links */
    indexNodesMasses(){
       let maxMass = Math.max(...this.nodes.map(d => parseInt(d[config.mz]) ||0)) || 0;
       let indexMasses = new Array(maxMass+1).fill(0);
       //set the indexes
       for(let i=0; i<this.nodes.length; i++){
            const mass = Math.floor(this.nodes[i][config.mz])
            if(indexMasses[mass] == 0){indexMasses[mass] = i}
       }
       //removes the 0 that are still there
       let lastValue = 0
       for(let i=0; i<indexMasses.length; i++){
            if(indexMasses[i] ==0){
                indexMasses[i] = lastValue
            }else{
                lastValue = indexMasses[i]
            }
       }
       this.indexMasses = indexMasses
       return indexMasses
    }

    /**activates filling and drawing from a fileName format ("file_"+*number*, "matrix", or venn set Name */
    fillFromName(fileName){
        this.dataName = fileName
        if(fileName.includes("file")){
            let fileNum = fileName.slice(5)
            let file = files.list[fileNum]
            let data = []
            if(file && file.data){data = file.data}
            this.fill(data,fileName)
        }else if(fileName =="none"){
            this.fill([],"")
        }else if(fileName == "matrix"){
            if(!matrixData.length ||matrixData.length ==0){return;}
            this.fill(matrixData,"matrix")
        }else if(vennData && vennData[fileName]){
            if(!vennData[fileName].length ||vennData[fileName].length ==0){return;}
            this.fill(vennData[fileName], fileName)
        }
    }

    /**
     * sorts the Nodes. SHOULD ONLY BE USED ONCE. If not, it will change the indexes of edges.
     * @param {Number} column  the number of the column from which sorting is done
     * @param {boolean} descending true if descending, false if ascending
     * @returns error or this.data
     */
    sortNodes(column, descending){
        if(!this.nodes[0] || !this.nodes[1]){return console.error("empty nodes list")}
        if(isNaN(column) || column <0 || column >= this.nodes[0].length){return console.error("invalid column for sorting data")}
        if(descending){ 
            this.nodes.sort(function(a, b){return b[column]-a[column]})
        }else{
            this.nodes.sort(function(a, b){return a[column]-b[column]})
        }
    }

    /** from an array of molecular formulae, builds the network within a mDa tolerance. */
    linkDeltaFormulaList(formulaList, mDaTol){
        for(let i=0; i<formulaList.length; i++){
            let molecule = new Molecule(formulaList[i])
            let edges = this.linkDeltaMass(formulaList[i], molecule.mass, mDaTol)
        }
    }
    /** from an array of masses, builds the network within a mDa tolerance. */
    linkDeltaMassList(namesList, massList, mDaTol){
        for(let i=0; i<namesList.length; i++){
            let edges = this.linkDeltaMass(namesList[i], massList[i], mDaTol)
        }
    }

    /**find all edges for a certain delta of mass, with a mDa tolerance.*/
    linkDeltaMass(name, delta,mDaTol){
        delta = parseFloat(delta)
        for(let i=0; i<this.nodes.length; i++){
            //finds the good starting index using this.indexMass
            //this is an optimization to be a lot quicker than computing a lot of useless, far away masses
            let startingIndex = i+1
            let expectedMass = parseFloat(this.nodes[i][config.mz]) + delta
            startingIndex = Math.max(startingIndex, this.indexMasses[Math.floor(expectedMass)])
            for(let j=startingIndex; j<this.nodes.length; j++){
                let deltamz= parseFloat(this.nodes[j][config.mz]) - parseFloat(this.nodes[i][config.mz])
                deltamz -= delta
                if(deltamz>0.1){break;} //break if mass too big to be possible TODO make this customizable
                if (Math.abs(deltamz)*1000< mDaTol){
                    if(!this.areNodesConnected(i,j)){
                        this.edges.push(this.createEdge(i,j,name))
                        this.edges[this.edges.length-1].error = deltamz*1000
                        this.adjacencyList.get(i).add(this.edges.length-1)
                        this.adjacencyListReverse.get(j).add(this.edges.length-1)
                    }
                }
            }
        }
    }

    /**remakes the adjacency list from scratch by looping over all edges */
    updateAdjacencyList(){
        this.adjacencyList = new Map()
        this.adjacencyListReverse = new Map()
        for(let i=0; i<this.nodes.length; i++){
            this.adjacencyList.set(i, new Set())
            this.adjacencyListReverse.set(i, new Set())
        }
        for(let i=0; i<this.edges.length; i++){
            this.adjacencyList.get(this.edges[i].source).add(i)
            this.adjacencyListReverse.get(this.edges[i].target).add(i)
        }
    }

    /**creates an edges BUT does not append it to the adjacency list because it does not have an ID yet */
    createEdge(source,target,name){
        let edge = {
            "source":source,
            "target":target,
            "name":name
        }
        return edge
    }

    /** returns an array of {neighbour,edgeName} neighbouring a given node. Uses the adjacencyList */
    getNeighbours(nodeIndex){
        if(!this.nodes[nodeIndex]){return []}
        let edgesID = this.adjacencyList.get(nodeIndex)
        let edges = []
        let indexes = []
        for (const edgeID of edgesID){
            edges.push(this.edges[edgeID])
            indexes.push(edgeID)
        }
        let results = []
        for(let i=0; i<edges.length; i++){
            results[i] = {neighbour: edges[i].target, name:edges[i].name, edgeIndex: indexes[i]}
        }
        return results
    }

    /**returns an array of {neighbour, edgeName} targeting this node. Uses the adjacencyListReverse*/
    getNeighbours_reverse(nodeIndex){
        if(!this.nodes[nodeIndex]){return []}
        let edgesID = this.adjacencyListReverse.get(nodeIndex)
        let edges = []
        let indexes = []
        for (const edgeID of edgesID){
            edges.push(this.edges[edgeID])
            indexes.push(edgeID)
        }
        let results = []
        for(let i=0; i<edges.length; i++){
            results[i] = {neighbour: edges[i].source, name:edges[i].name, edgeIndex: indexes[i]}
        }
        return results
    }

    /**slower. same as getNeighbours but looks also for neighbours for which this node is the target */
    getNeighbours_bothSides(nodeIndex){
        if(!this.nodes[nodeIndex]){return []}
        let results1 = this.getNeighbours(nodeIndex)
        let results2 = this.getNeighbours_reverse(nodeIndex)
        results1.forEach((edge)=>{edge.type = "source"})
        results2.forEach((edge)=>{edge.type = "target"})
        let neighbours = results1.concat(results2)
        return neighbours
    }

    /** verifies if two nodes are connected. If true, returns their connection name */
    areNodesConnected(sourceID, targetID){
        let set1 = this.adjacencyList.get(sourceID)
        for(const edgeID of set1){
            if(!this.edges[edgeID]){continue;}
            if(this.edges[edgeID].target == targetID){return this.edges[edgeID].name}
        }
        return false
    }
    
    /** looks through the adjacency list if the node has a type of edge */
    hasNodeEdgeName(nodeIndex, edgeName){
        let set = this.adjacencyList.get(nodeIndex)
        for(const edgeID of set){
            if(!this.edges[edgeID]){continue;}
            if(this.edges[edgeID].name == "edgeName"){return true}
        }
        return false
    }

    /** return all the edges that go by the same name */
    getEdgesByName(edgeName){
        return this.edges.filter(edge => edge.name == edgeName)
    }

    /** return all the edges that go by the same name */
    getEdgesByProperty(propertyValue, propertyName){
        return this.edges.filter(edge => edge[propertyName] == propertyValue)
    }

    /** return all edges coming from the same source */
    getEdgesBySource(nodeIndex){
        if(!this.nodes[nodeIndex]){return []}
        let edgesID = this.adjacencyList.get(nodeIndex)
        let edges = []
        for (const edgeID of edgesID){
            edges.push(this.edges[edgeID])
        }
        return edges
    }

    /** return all edges leading to the same target */
    getEdgesByTarget(nodeIndex){
        if(!this.nodes[nodeIndex]){return []}
        let edgesID = this.adjacencyListReverse.get(nodeIndex)
        let edges = []
        for (const edgeID of edgesID){
            edges.push(this.edges[edgeID])
        }
        return edges
    }

    /**get edges where a specific node is either the target or the source */
    getEdgesByInvolvedNode(nodeIndex){
        let nodeSource = this.getEdgesBySource(nodeIndex)
        let nodeTarget = this.getEdgesByTarget(nodeIndex)
        let edges = nodeSource.concat(nodeTarget)
        return edges
    }

    /** remove all edges that have a certain name */
    removeEdgesByName(edgeName){
        this.edges = this.edges.filter(edge => edge.name !== edgeName);
    }

    /** computes the average degree of the network */
    getAverageDegree(){
        return (2 * this.edges.length) / this.nodes.length;
    }

    /** computes the density of the network */
    getDensity(){
        let actualEdges = this.edges.length
        let potentialEdges = this.nodes.length*(this.nodes.length-1)/2 //divided by 2 because a 2 way link cannot exist here
        return parseFloat(actualEdges/potentialEdges)
    }

    /**returns the mean number of neighbours, counting both source and targets */
    getMeanNeighbours_bothSides(){
        return this.edges.length/this.nodes.length
    }

    getMeanNeighbours(){
        return 0.5*this.edges.length/this.nodes.length
    }

    /**computes how much a nodes neighbours are interconnected */
    getClusteringCoeff(nodeIndex){
        let neighbors = this.getNeighbours(nodeIndex).map(neighbor => neighbor.neighbour);
        if (neighbors.length<2){return 0}
        let neighborEdges = this.edges.filter(edge => neighbors.includes(edge.source) && neighbors.includes(edge.target));
        let totalPossibleEdges = (neighbors.length * (neighbors.length - 1))/2;
        let clusterCoeff = neighborEdges.length / totalPossibleEdges
        return clusterCoeff;
    }

    /**get the averaged clustering coefficient over every node */
    getMeanClusteringCoeff(){
        let totalCoeff = 0;
        for (let i=0; i<this.nodes.length; i++) {
            totalCoeff += this.getClusteringCoeff(i);
        }
        return totalCoeff / this.nodes.length;
    }

    /**sums up as an array the information about the edges types and their occurences */
    getEdgesSummary(){
        let edgeCounts = new Map();
        // Count occurrences of each edge name
        for (const edge of this.edges) {
            edgeCounts.set(edge.name, (edgeCounts.get(edge.name) || 0) + 1);
        }
        // Convert the map to an array, sort by counts, and return
        return Array.from(edgeCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }

    /** returns a list of clusters in the network */
    getClusters(doRemoveLoneNodes){
        let visited = new Set();
        let clusters = [];

        for (let i=0; i<this.nodes.length; i++) {
            if (!visited.has(i)) {
                // Explore this cluster
                let cluster = [];
                let stack = [i]; // DFS stack

                while (stack.length > 0) {
                    let current = stack.pop();

                    if (!visited.has(current)) {
                        visited.add(current);
                        cluster.push(current);

                        // Add unvisited neighbors to the stack
                        const neighbours = this.getNeighbours_bothSides(current);
                        for (const neighbour of neighbours) {
                            if (!visited.has(neighbour)) {
                                stack.push(neighbour.neighbour);
                            }
                        }
                    }
                }
                // Save the cluster
                clusters.push(cluster);
            }
        }
        //removes lone nodes if needed
        if(doRemoveLoneNodes){
            for(let i=0; i<clusters.length; i++){
                clusters = clusters.filter(cluster => cluster.length >1)
            }
        }
        // Sort clusters by length in descending order
        clusters.sort((a, b) => b.length - a.length);
        return clusters;
    }

    //push a new data to each node: the i index of the cluster it belongs to
    tagClusters(doRemoveLoneNodes){
        let clusters = this.getClusters(doRemoveLoneNodes)
        for(let i=0; i<clusters.length; i++){
            for(let j=0; j<clusters[i].length; j++){
                this.nodes[clusters[i][j]].cluster = i+1
            }
        }
        //push for every datapoint
        this.nodes[0].push("ClusterID")
        for(let i=1; i<this.nodes.length; i++){
            this.nodes[i].push(this.nodes[i].cluster || -1)
        }
    }
    /**set for each node a .distance that notes its distance from an origin node. For nodes without connection, sets as -1 */
    mapDistanceFromNode(resetPreviousDistance,onlyTargets, nodeIndex){
        if(!this.nodes[nodeIndex]){return console.error("no node with index: "+nodeIndex)}
        //resets all to -1
        if(resetPreviousDistance){
            for(let i=0; i<this.nodes.length; i++){
                this.nodes[i].distance = -1
            }
        }
        // Initialize the distance of the origin node to 0
        const queue = [nodeIndex]
        this.nodes[nodeIndex].distance = 0

        // Perform BFS to calculate the shortest distance from the origin node
        while (queue.length > 0) {
            const currentNode = queue.shift();
            const currentDistance = this.nodes[currentNode].distance;
            let neighbours = []
            if(onlyTargets){
                neighbours = this.getNeighbours(currentNode);
            }else{
                neighbours = this.getNeighbours_bothSides(currentNode);
            }
            for (const neighbour of neighbours) {
                // Only process unvisited neighbors
                if (this.nodes[neighbour.neighbour].distance === -1) {
                    this.nodes[neighbour.neighbour].distance = currentDistance + 1;
                    queue.push(neighbour.neighbour);
                }
            }
        }
    }

    exportEdges(isAttributionNetwork){
        console.log("here",this)
        //sets the text zone to contain the data separated by tab
        var text = "Source" + ';'+ "Target" + ';' + "Name" + ';' + "Error(mDa)"
        if(isAttributionNetwork){text += ";"+"wasVisited"+";"+"Category"}
        text += "\n"
        for(let i=0; i<this.edges.length; i++){
            let thisEdge = this.edges[i]
            if(!thisEdge.error && this.nodes[thisEdge.target] && this.nodes[thisEdge.source]){
                thisEdge.error = this.nodes[thisEdge.target][config.mz] - this.nodes[thisEdge.source][config.mz]
                let formula = new ChemFormula(thisEdge.name)
                thisEdge.error = (thisEdge.error - formula.mass)*1000
            }
            text += thisEdge.source + ';' + thisEdge.target + ';' + thisEdge.name + ';' + thisEdge.error
            if(isAttributionNetwork){
                let isVisited = thisEdge.visited?1:0
                text += ";"+isVisited+";"+thisEdge.category
            }
            text +='\n'
        }
        //file export
        let fileName = ""
        if(this.dataName && this.dataName !="none"){
            let dataName = ""
            if(getFileNameFromString){ dataName = getFileNameFromString(this.dataName)}
            if(dataName ==""){dataName = this.dataName}
            fileName = "networkEdges_"+dataName
        }else{
            fileName = "networkEdges"
        }
        var DialogBox = document.getElementById("popupsave")
        var file = document.createElement('a');
        let mimeType = "text/csv;encoding:utf-8" || 'application/octet-stream';
        var Blobfile = null
        Blobfile = new Blob([text], {type: mimeType})
        file.href = URL.createObjectURL(Blobfile);
        file.setAttribute('download', fileName+".csv");
        document.body.appendChild(file);
            file.click();
            document.body.removeChild(file);
            DialogBox.style.display = "none"
            file.href = URL.revokeObjectURL(Blobfile);
    }

    exportNodes(isAttributionNetwork){
        //sets the text zone to contain the data separated by tab
        var text = "Id"+";"
        for(let i=0; i<this.nodes.length; i++){
            let thisNode = this.nodes[i]
            //adds the ID
            if(i>0){
                text +=(i)+";"
            }
            for(let j=0; j<thisNode.length; j++){
                if(thisNode[j] == " I"){text += "Intensity"}
                else {text+=thisNode[j]}

                if(j<thisNode.length-1){text+=";"}
            }
            //only for attribution networks, additional data
            if(i==0 && isAttributionNetwork){
                text +=";Ion formula ;m/z calc ;ppm Error ;dbe ;ionType ;attributionMethod ;passNumber ;distanceToSeed ;attributionIndex"
            }else if(isAttributionNetwork){
                let attrib = thisNode.attrib
                if(!attrib){text+=";unattributed;-1;-1;-1;-1;-1;-1;-1;-1\n";continue;}
                text += ";"+attrib.name+";"+attrib.mass+";"+attrib.ppmError+";"+attrib.dbe+";"+attrib.ionType+";"+attrib.type+";"+attrib.passNumber+";"+attrib.distanceSeed+";"+attrib.attributedIndex
            }
            text +='\n'
        }
        let fileName = ""
        if(this.dataName && this.dataName !="none"){
            let dataName = ""
            if(getFileNameFromString){ dataName = getFileNameFromString(this.dataName)}
            if(dataName ==""){dataName = this.dataName}
            fileName = "networkNodes_"+dataName
        }else{
            fileName = "networkNodes"
        }
        var DialogBox = document.getElementById("popupsave")
        var file = document.createElement('a');
        let mimeType = "text/csv;encoding:utf-8" || 'application/octet-stream';
        var Blobfile = null
        Blobfile = new Blob([text], {type: mimeType})
        file.href = URL.createObjectURL(Blobfile);
        file.setAttribute('download', fileName+".csv");
        document.body.appendChild(file);
            file.click();
            document.body.removeChild(file);
            DialogBox.style.display = "none"
            file.href = URL.revokeObjectURL(Blobfile);

    }

}
