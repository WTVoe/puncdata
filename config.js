//This file contains the default configuration and configuration modes of Punc'data on opening.
/*-------------------------- */
//Configuration of column numbers (enables Punc'data to know which column represents m/z, intensity...)
var version = {"number":1.161,"name":"1.16.1"}
var config= {};
config.mz = 0; //column number of the m/z ratio 
config.intensity = 9;  //column number of the signal intensity
config.dbe = 4; //column number of the DBE. used for the tooltip info when hovering a point
config.ppmerror = 12; //column number of the ppm error. used for the tooltip info when hovering a point
config.formulatext = 6; //column number of the formula, printed as text. used for the tooltip info when hovering a point
config.oc = 23;//column number of the O/C ratio
config.hc =  21;//column number of the H/C ratio

config.cellBackColor = "#ffffff" //the color of the background of the cells
config.nogrid = false // true if it needs to disable grids on cells
config.blackCircle  = false // true if you want a black circle around every dot at all time
config.blackCircleColor = "#000000" // color of the dot circles
config.blackCircleWidth = 1 //width of the black circle around dots in pixels
config.boxBorders = false // true if you want a black rectangle all around the cell
config.legendFontSize = 20; //size of the font of legends
config.legendFontSizeSmall = 14; //size of the font of smaller elements, such as scales numbers
config.legendFont = "sans-serif" //default font for legends
config.showTitle = false; //whether or not to show a title in the chart
config.titlePosition = "topRight" // position of the tile in the chart
config.axisLines = 10; //number of lines on the legends and on the grid
config.hideColorLegend = false; // do not draw the color legends if this is true
config.endAxis = false; // if true, the names of the scales go to the end of axes

config.kendrickText = "KMD"; // whether to write KMD or KMF
config.sizeReductor = 2000; //an arbitrary reduction factor to divide the size of dots on scatter plots when intensity is involved

config.height = 390;
config.width = 390;

config.customColors = []

config.customTooltipData = []

config.selectionTool = {
    "createHistogramBars":true,
    "histoColor":"#000000a0",
    "histogramRelativity":"fullFile",
    "filterWorkonHistograms":true,
    "showTitleWarning":true,
    "selectionStyle":"selected",
    "selectionStyleBis":"selected2" //when the first style can be rendered useless by a parameter
}

config.tooltipPie = {
    "allow":false,
    "showPercents":true,
    "colors":["#4a82be", "#80d6cf", "#5aad5f", "#edc948", "#f38f32","#df4f50","#9c7560","#b772ca","#bdb7b4","#5e5a59"]
}

//used for the logbook option
let _textLog = ""

debug = false // on debug mode, show all the console logs
/*-------------------------- */

/*-------------------------- */
var splitter = "," //defines what splits data for tab, use the character between these parenthesis → (	)
var splitterTextArea = "	" //defines the splitter for the text area
//default old color : #69b3a2

/*-------------------------- */

/** the list of kendrick masses that can be chosen inside the selecter */
var kendrickmasslist = [
    {"mass":28.0313,"name":"Polyethylene(C2H4)","value":"C2H4"},
    {"mass":104.0626,"name":"Polystyrene(C8H8)","value":"C8H8"},
    {"mass":54.04695 ,"name":"Polybutadiene(C4H6)","value":"C4H6"},
    {"mass":68.0626  ,"name":"Polyisoprene(C5H8)","value":"C5H8"},
    {"mass":192.04226,"name":"PET(C10H8O4)","value":"C10H8O4"},
    {"mass":44.026215 ,"name":"PEG(C2H4O)","value":"C2H4O"},
    {"mass":100.05243 ,"name":"PMMA(C5H8O2)","value":"C5H8O2"},
    {"mass":226.168128 ,"name":"Nylon 6 6 (C12H22N2O2)","value":"C12H22N2O2"},
    {"mass":71.037114,"name":"Acrylamide (C3H5NO)","value":"C3H5NO"},
    {"mass":0 ,"name":"SPLITTER"},
    {"mass":61.992328,"name":"PVC(C2H3Cl)","value":"C2H3Cl"},
    {"mass":64.012456,"name":"PVDF(C2H2F2)","value":"C2H2F2"},
    {"mass":49.996806,"name":"PTFE(CF2)","value":"CF2"},
    {"mass":115.9640620,"name":"PCTFE(C2F3Cl)","value":"C2F3Cl"},
    {"mass":0 ,"name":"SPLITTER"},
    {"mass":162.052825,"name":"Polysaccharide (C6H10O5)","value":"C6H10O5"},
    {"mass":203.079374 ,"name":"Chitin (C8H13O5N)","value":"C8H13O5N"},
    {"mass":0 ,"name":"SPLITTER"},
    {"mass":14.0156501,"name":"CH2","value":"CH2"},
    {"mass":26.0156501,"name":"C2H2","value":"C2H2"},
    {"mass":2.0156501,"name":"H2","value":"H2"},
    {"mass":18.0105647,"name":"H2O","value":"H2O"},
    {"mass":30.0105647,"name":"CH2O","value":"CH2O"},
    {"mass":15.9949146,"name":"O","value":"O"},
]

/**configuration of the Venn circles/ellipses colors */
var cfgVenn = {
    "colors":["#e15759", "#59a14f", "#4e79a7","#bab0ab"],
    "files":[0,1,2,3],
    "opacity":1,
    "blendmix":"screen",
    "outline":false,
    "circleNb":0
}
var vennColor = {
    "venn1":"#e15759",
    "venn2":"#59a14f",
    "venn3":"#4e79a7",
    "venn4":"#bab0ab"
}

////////////////////////////////////////////
///colors:
/** the list of kendrick masses that can be chosen inside the selecter */
var colorsList = [
    {"name":"Greys", "text":"-----Dark→Light-----------"},
    {"name":"Viridis", "text":"Viridis (purple → yellow)"},
    {"name":"Inferno", "text":"Inferno (black → yellow)"},
    {"name":"Magma", "text":"Magma (black → pale yellow )"},
    {"name":"Cividis", "text":"Cividis (blue → yellow)"},
    {"name":"Plasma", "text":"Plasma (purple → yellow)"},
    {"name":"Warm", "text":"Warm (purple → green)"},
    {"name":"Cool", "text":"Cool (purple → green)"},
    {"name":"Greys", "text":"-----Light→Dark-----------"},
    {"name":"YlOrRd", "text":"YlOrRd (yellow-red)"},
    {"name":"YlOrBr", "text":"YlOrBr (yellow-brown)"},
    {"name":"YlGn", "text":"YlGn (yellow-green)"},
    {"name":"YlGnBu", "text":"YlGnBu (yellow-blue)"},
    {"name":"RdPu", "text":"RdPu (rose-purple)"},
    {"name":"PuRd", "text":"PuRd (purple-rose)"},
    {"name":"GnBu", "text":"GnBu (green-blue)"},
    {"name":"BuGn", "text":"BuGn (blue-green)"},
    {"name":"Greys", "text":"-----Spectras------------"},
    {"name":"Turbo", "text":"Turbo (B-V-R)"},
    {"name":"Rainbow", "text":"Rainbow (cyclic)"},
    {"name":"Sinebow", "text":"Sinebow (cyclic)"},
    {"name":"Spectral", "text":"spectral (R-V-B)"},
    {"name":"CubehelixDefault", "text":"CubeHelix (Black-green-rose-white)"},
    {"name":"custom_pride", "text":"Pride"},
    {"name":"Greys", "text":"------Divergents-------"},
    {"name":"BrBG", "text":"BrBG(brown-wh-turquoise)"},
    {"name":"PRGn", "text":"PRGn(purple-wh-green)"},
    {"name":"PiYG", "text":"PiYG(Rose-wh-green)"},
    {"name":"PuOr", "text":"PuOr(purple-wh-orange)"},
    {"name":"RdBu", "text":"RdBu(red-wh-blue)"},
    {"name":"Greys", "text":"------Levels------------"},
    {"name":"Greys", "text":"Greys"},
    {"name":"Blues", "text":"Blues"},
    {"name":"Greens", "text":"Greens"},
    {"name":"Reds", "text":"Reds"},
    {"name":"Oranges", "text":"Oranges"},
    {"name":"Purples", "text":"Purples"},
    {"name":"Greys", "text":"------Other------------"},
    {"name":"solid", "text":"Custom Solid"},
    {"name":"whiteToSolid", "text":"White to custom Solid"},
    //Customly made will appear below
]
let customColorPride={
    weights:[0,0.2,0.4,0.6,0.8,1],
    colors:["#e4251c","#fe922a","#fbf039","#007e2c","#2c45f7","#780984"]
}


//////////////////////////////////////////////////////////
///Elements database. Most abundant isotope is selected, except for deuterium which appears as its own letter "D"
//only stable (or elements with long half life such as 115In and 130Te) were considered
//source: IUPAC
var elementsDatabase=[
{"name":"e","mass":0.000549},
{"name":"H","mass":1.007825},
{"name":"D","mass":2.014102},
{"name":"He","mass":4.002603},
{"name":"Li","mass":7.016003},
{"name":"Be","mass":9.012183},
{"name":"B","mass":11.009305},
{"name":"C","mass":12},
{"name":"N","mass":14.003074},
{"name":"O","mass":15.994915},
{"name":"F","mass":18.998403},
{"name":"Ne","mass":19.992440},
{"name":"Na","mass":22.989770},
{"name":"Mg","mass":23.985042},
{"name":"Al","mass":26.981538},
{"name":"Si","mass":27.976927},
{"name":"P","mass":30.973762},
{"name":"S","mass":31.972071},
{"name":"Cl","mass":34.968853},
{"name":"Ar","mass":39.962383},
{"name":"K","mass":38.963706},
{"name":"Ca","mass":39.962591},
{"name":"Sc","mass":44.955908},
{"name":"Ti","mass":47.947942},
{"name":"V","mass":50.943957},
{"name":"Cr","mass":51.940506},
{"name":"Mn","mass":54.938044},
{"name":"Fe","mass":55.934936},
{"name":"Co","mass":58.933194},
{"name":"Ni","mass":57.935342},
{"name":"Cu","mass":62.929598},
{"name":"Zn","mass":63.929142},
{"name":"Ga","mass":68.925574},
{"name":"Ge","mass":73.921178},
{"name":"As","mass":74.921596},
{"name":"Se","mass":79.916522},
{"name":"Br","mass":78.918338},
{"name":"Kr","mass":83.911497}, //after period 4 only some elements were added
{"name":"Rb","mass":84.911790},
{"name":"Sr","mass":87.905613},
{"name":"Y","mass":88.90584},
{"name":"Zr","mass":89.90470},
{"name":"Nb","mass":92.90637},
{"name":"Mo","mass":97.905405},
{"name":"Ru","mass":101.904344},
{"name":"Rh","mass":102.90550},
{"name":"Pd","mass":105.903480},
{"name":"Ag","mass":106.905095},
{"name":"Cd","mass":113.903365},
{"name":"In","mass":114.903879},
{"name":"Sn","mass":119.902202},
{"name":"Sb","mass":120.90381},
{"name":"Te","mass":129.906223},
{"name":"I","mass":126.904477},
{"name":"Xe","mass":131.904155},
{"name":"Cs","mass":132.905452},
{"name":"Ba","mass":137.905247},
//f group
{"name":"La","mass":138.90636},
{"name":"Ce","mass":139.90544},
{"name":"Pr","mass":140.90766},
{"name":"Nd","mass":141.90773},
{"name":"Sm","mass":151.91974},
{"name":"Eu","mass":152.92124},
{"name":"Gd","mass":157.92411},
{"name":"Tb","mass":158.92535},
{"name":"Dy","mass":163.92918},
{"name":"Ho","mass":164.93033},
{"name":"Er","mass":165.93030},
{"name":"Tm","mass":168.93422},
{"name":"Yb","mass":173.93887},
{"name":"Lu","mass":174.94078},
//last elements from the 6th period
{"name":"Hf","mass":179.94656},
{"name":"Ta","mass":180.94800},
{"name":"W","mass":183.950931},
{"name":"Re","mass":186.95575},
{"name":"Os","mass":191.96148},
{"name":"Ir","mass":192.96292},
{"name":"Pt","mass":194.964792},
{"name":"Au","mass":196.966560},
{"name":"Hg","mass":201.970643},
{"name":"Tl","mass":204.974428},
{"name":"Pb","mass":207.976653},
{"name":"Bi","mass":208.980388},
//additionnal common isotopic patterns
{"name":"Xc","mass":13.003355}, //this is not really supported yet for golden rules or DBE, only for mass computation
{"name":"Xb","mass":10.012937}, //bore 10 isotope
{"name":"","mass":0}
]

//you can add more elements here with custom names for special functions or isotopes

///////////////////////////////////////////////////////////
var dbCommonMassDeltas= [
    {"formula":"C", "mass":12},
    {"formula":"N", "mass":14.003074},
    {"formula":"O", "mass":15.994915},
    {"formula":"O2", "mass":31.98983},
    {"formula":"CO2", "mass":43.98983},
    {"formula":"H2O", "mass":18.010565},
    {"formula":"CH2", "mass":14.01565},
    {"formula":"CH2O", "mass":30.010565},
    {"formula":"H2", "mass":2.01565},
    {"formula":"C2H2F2", "mass":64.012456},
    {"formula":"HF", "mass":20.006228},
    // {"name":"", "mass":},
    {"name":""}
]

////////////////////////////////////////////////////////
/** contains the data  */
var studentsLawTableOfData= [
    [6.31375151467504,2.91998558035373,2.35336343480182,2.13184678632665,2.01504837333302,1.9431802805153,1.89457860509001,1.8595480375309,1.83311293265624,1.81246112281168,1.79588481870404,1.78228755564932,1.77093339598687,1.76131013577489,1.75305035569257,1.74588367627625,1.73960672607507,1.73406360661754,1.72913281152137,1.72471824292079,1.64637881728543],
[12.7062047361747,4.30265272974946,3.18244630528371,2.77644510519779,2.57058183563632,2.44691185114497,2.36462425159278,2.30600413520417,2.26215716279821,2.22813885198627,2.20098516009164,2.17881282966723,2.16036865646279,2.1447866879178,2.13144954555977,2.11990529922126,2.10981557783332,2.10092204024104,2.09302405440831,2.08596344726586,1.96233908082641],
[15.8945448438653,4.84873221385061,3.48190876032121,2.99852787320659,2.75650852190947,2.6122418470613,2.51675242413327,2.44898498964078,2.39844098485651,2.35931462373654,2.32813983348146,2.30272168380608,2.28160356374265,2.26378127901191,2.24854029161067,2.23535843053084,2.22384530751682,2.21370325159381,2.20470135074161,2.19665774555268,2.05643138105741],
[21.2049487896888,5.64277835348256,3.8960459342964,3.29762972789071,3.0028749738418,2.82892786248833,2.71457301127878,2.63381437833846,2.5738039775468,2.52748424400286,2.49066393330793,2.46070016611448,2.4358452121108,2.41489772754222,2.39700503784279,2.38154537348738,2.36805476091347,2.35618000730079,2.34564753356275,2.33624215970226,2.17319207984619],
[31.820515953774,6.96455673428327,4.54070285856813,3.7469473879792,3.36492999890722,3.14266840329098,2.99795156686853,2.89645944770962,2.82143792502581,2.7637694581127,2.71807918381386,2.68099799312091,2.65030883791219,2.62449406759005,2.60248029501112,2.58348718527599,2.56693398372472,2.55237963018225,2.53948319062396,2.52797700274157,2.33008267475553],
[63.6567411628716,9.92484320091829,5.84090930973336,4.60409487134999,4.03214298355523,3.70742802132478,3.49948329735049,3.3553873313334,3.24983554159213,3.16927267261695,3.10580651553928,3.0545395893929,3.01227583871658,2.97684273437083,2.94671288347524,2.9207816224251,2.89823051967742,2.87844047273861,2.86093460646498,2.84533970978611,2.58075469806595],
[127.321336468872,14.0890472755553,7.45331850515062,5.59756836707546,4.77334060485552,4.31682710363337,4.02933717764248,3.83251868534434,3.68966239230423,3.58140620209066,3.49661417325367,3.42844424229225,3.37246794101098,3.32569581783802,3.28603857094622,3.25199287438288,3.22244991135746,3.19657422225522,3.17372453079232,3.15340053290645,2.81327786048553],
[636.61924876872,31.5990545764436,12.9239786366875,8.61030158137928,6.86882662588111,5.95881617881876,5.40788252086173,5.04130543337337,4.78091258593114,4.58689385870264,4.43697933823445,4.31779128360618,4.22083172770712,4.1404541127382,4.07276519590379,4.01499632718406,3.96512627211903,3.92164582508516,3.88340585259208,3.84951627493083,3.30028264842393],

]

///////////////////////////////////////
var fontsList = [
    {name:"Arial",value:"sans-serif",style:"font-family:sans-serif"},
    {name:"Verdana",value:"Verdana",style:"font-family:Verdana"},
    {name:"Tahoma",value:"Tahoma",style:"font-family:Tahoma"},
    {name:"Times New Roman",value:"serif",style:"font-family:serif"},
    {name:"Garamond",value:"Garamond",style:"font-family:Garamond"},
    {name:"Comic Sans Ms",value:"Comic Sans Ms",style:"font-family:Comic Sans Ms"},
    {name:"Jokerman",value:"Jokerman",style:"font-family:Jokerman"}
]

/////////////////////////////////////////////
/////size of plots:
config.margin = {top: 10, right: 25, bottom: 100, left: 75},
width = 490 - config.margin.left - config.margin.right,
height = 500 - config.margin.top - config.margin.bottom;
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//Pre-made loadouts for canvas modes

defaultCvs = {}
defaultCvs.mainCfg = {
    cellNb : 6,
    dataNb : 6,
    opacity : 1,
    cellsType : ["scatterPlot","scatterPlot","massSpectra"],
    dataNames: ["file_0"],
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
        common: true,
        histo: true,
        stats : false,
        comp : true
    },
    cellsElements:{
        colorLegend : true,
    }
}


defaultCvs.main_1 = {
    cellNb : 6,
    dataNb : 6,
    opacity : 1,
    cellsType : ["scatterPlot","scatterPlot","massSpectra","tableInfos","histogram","histogram"],
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
        common: true,
        histo: true,
        stats : false,
        comp : true
    },
    cellsElements:{
        colorLegend : true,
    }
}

defaultCvs.cfg1 = {} //van Krevelen and histograms
defaultCvs.cfg1.cfg = defaultCvs.main_1
defaultCvs.cfg1.cells= [
    {type:"scatterPlot",xmin:0,xmax:1,ymin:0,ymax:2.5,dotSize:5,relativeSize:true,xtype:["o/c"],ytype:["h/c"]},
    {type:"scatterPlot",xmin:0,xmax:100,ymin:0,ymax:50,dotSize:5,relativeSize:true,xtype:["#c","carbon","c"],ytype:["dbe","rdb"]},
    {type:"massSpectra",xmin:0,xmax:1000,ymin:0,ymax:100,ytype:"relative"},
    {type:"tableInfos",operationNum:"mean",operationText:"count"},
    {type:"histogram",xmin:0,xmax:30,ymin:0,ymax:100,xtype:["#o","nb(o)","o"],ytype:"relative",centerBars:true,barWidth:50,barDensity:1,showErrorBars:false},
    {type:"histogram",xmin:-1,xmax:5,ymin:0,ymax:100,xtype:["#n","nb(n)","n"],ytype:"relative",centerBars:true,barWidth:50,barDensity:1,showErrorBars:false},
]
defaultCvs.cfg1.data = [
    {colorGradient:"Viridis",colorSolid:"#5aad5f",colorType:["massExp","m/z","mass"],minColor:0,maxColor:1000}
]
defaultCvs.cfg1.dataNames = ["file_0"]

defaultCvs.cfg2 = {} //Kendricks
defaultCvs.cfg2.cfg = defaultCvs.main_1
defaultCvs.cfg2.cells= [
    {type:"kendrick",xmin:0,xmax:1000,ymin:-1,ymax:1,dotSize:3,relativeSize:false,xtype:"m/z",yround:"round",kendrickMethod:"list",kendrickChoice:"C2H4",kendrickFormula:"C2H4",kendrickMass:"28.0313",kendrickDivisor:1},
    {type:"kendrick2D",xmin:-1,xmax:1,ymin:-1,ymax:1,dotSize:3,relativeSize:false,yround:"round",kendrickMethod:"list",kendrickChoice:"C2H4",kendrickFormula:"C2H4",kendrickMass:"28.0313",kendrickChoice2:"H2",kendrickFormula2:"H2",kendrickMass2:"2.01565",kendrickDivisor:1},
    {type:"massSpectra",xmin:0,xmax:1000,ymin:0,ymax:100,ytype:"relative"},
    {type:"tableInfos",operationNum:"mean",operationText:"count"},
    {type:"histogram",xmin:0,xmax:30,ymin:0,ymax:100,xtype:["#o","nb(o)","o"],ytype:"relative",centerBars:true,barWidth:50,barDensity:1,showErrorBars:false},
    {type:"histogram",xmin:-1,xmax:30,ymin:0,ymax:100,xtype:["dbe","rdb"],ytype:"relative",centerBars:true,barWidth:50,barDensity:1,showErrorBars:false},
]
defaultCvs.cfg2.data = [
    {colorGradient:"Magma",colorSolid:"#5aad5f",colorType:["intensity","abundance","abund","i"],minColor:0,maxColor:100,colorRelative:true,colorInvert:true}
]
defaultCvs.cfg2.dataNames = ["file_0"]

defaultCvs.cfg3 = {} //Venn sets
defaultCvs.cfg3.cfg = defaultCvs.main_1
defaultCvs.cfg3.cells= [
    {type:"scatterPlot",xmin:0,xmax:1,ymin:0,ymax:2.5,dotSize:5,relativeSize:true,xtype:["o/c"],ytype:["h/c"]},
    {type:"scatterPlot",xmin:0,xmax:100,ymin:0,ymax:50,dotSize:5,relativeSize:true,xtype:["#C","Carbon","C"],ytype:["DBE","rdb"]},
    {type:"massSpectra",xmin:0,xmax:1000,ymin:0,ymax:100,ytype:"relative"},
    {type:"tableInfos",operationNum:"mean",operationText:"count"},
    {type:"histogram",xmin:0,xmax:30,ymin:0,ymax:100,xtype:["#o","nb(o)","o"],ytype:"relative",centerBars:true,barWidth:50,barDensity:1,showErrorBars:false},
    {type:"histogram",xmin:-1,xmax:5,ymin:0,ymax:100,xtype:["#n","nb(n)","n"],ytype:"relative",centerBars:true,barWidth:50,barDensity:1,showErrorBars:false},
]
defaultCvs.cfg3.data = [
    {colorGradient:"solid",colorSolid:"#df4f50",colorType:["dbe","rdb"],minColor:0,maxColor:100},
    {colorGradient:"solid",colorSolid:"#5aad5f",colorType:["dbe","rdb"],minColor:0,maxColor:100},
    {colorGradient:"solid",colorSolid:"#edc948",colorType:["dbe","rdb"],minColor:0,maxColor:100}

]
defaultCvs.cfg3.dataNames = ["A","B","AuB"]

defaultCvs.cfg4 = {} //Matrix PCA variables
defaultCvs.cfg4.cfg = defaultCvs.main_1
defaultCvs.cfg4.cells= [
    {type:"scatterPCA",xmin:-4,xmax:4,ymin:-3,ymax:3,dotSize:5,relativeSize:true},
    {type:"scatterPlot",xmin:0,xmax:1,ymin:0,ymax:2.5,dotSize:5,relativeSize:true,xtype:["o/c"],ytype:["h/c"]},
    {type:"scatterPlot",xmin:0,xmax:100,ymin:0,ymax:50,dotSize:5,relativeSize:true,xtype:["#c","carbon","c"],ytype:["dbe","rdb"]},
    {type:"massSpectra",xmin:0,xmax:1000,ymin:0,ymax:100,ytype:"relative"},
    {type:"histogram",xmin:0,xmax:30,ymin:0,ymax:100,xtype:["#o","nb(o)","o"],ytype:"relative",centerBars:true,barWidth:50,barDensity:1,showErrorBars:false},
    {type:"histogram",xmin:-1,xmax:5,ymin:0,ymax:100,xtype:["#n","nb(n)","n"],ytype:"relative",centerBars:true,barWidth:50,barDensity:1,showErrorBars:false},
]
defaultCvs.cfg4.data = [
    {colorGradient:"RdBu",colorSolid:"#5aad5f",colorType:["component_3","component3","component 3","comp_3","comp3","comp 3","3","m/z","mass"],minColor:0,maxColor:100,colorRelative:true}
]
defaultCvs.cfg4.dataNames = ["matrix"]


