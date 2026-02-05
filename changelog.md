# 1.16
## New features
- New data manager - you can sort files, group them and reorder them
- Mass differences and Formula differences charts (by default, deactivated in canvas. Go to the canvas manager to allow them)

## Enhancements
- Filtering interactivity with multiple histograms is now possible
- Canvas top menu now includes color and gradient selecter
- Added lines for x and y axes on PCA tab charts
- Same change (lines for axes) on the canvas tab, with customizable colors
-  You can now force rename axis titles on canvas charts (under "override" menu)
- File logs are now segmented and some lines can be deleted if needed
- Drag & Drop option to reorder files was added
- Files can now be grouped. The group colors can be reflected on PCA
- (DOC) "data.filter" was renamed to "data.filters" to account for changes in multiple simultaneous filters
- (DOC)  File management is now cleaner, done with classes "FileList", "FileGroup" and "File"
- (DOC) In consequence to file management update, fileData and nameslist are deprecated. You can now access each file through the object named "files". Individual files are stored under files.list

## Bug fixes
- Fixed an autoscale bug for PCA 
- Fixed bar height overestimation when selecting on a number of occurences histogram with the option "height of brushed histogram bars are relative to full datasets" disabled.
- For histograms, "% over bars" now disappear correctly when using the interactive highlighting
- Density maps used to skip the first point when a selection was active, it is now fixed



# 1.15.7
## New features
- Error mass charts now can display calibrations dots and the residual error lines
- Added as an experimental feature variable ppm error for attribution
- The network attribution algorithm now allows for lookup of suspect attribution and logs alternative formulae based on the network.
- Added a "PCA samples" type of chart, to vizualise the samples data

## Enhancements 
- A chart is now drawn for residues on the calib chart
- Renamed and reorganized some options from the attribution menu
- Added a way to log all deltas from an attribution network
- Pause button now shows "resume" when the network is paused
- Added a button & a function to export the network for other softwares
- You can now name your attribution passes
- When attributing, % of attributions by network now appear
- "Upload" tab was renamed "Data Manager"
- Every "Save session" button has been removed from individual pages and moved to the top taskbar
- In "import multiple datafiles" it is now possible to load puncdata session and it will load only its datafiles
- The vizualise mass delta button has been moved and it is now possible to vizualise a tolerance
- The attribution menu has been reworked, buttons have been shifted
- Most inputs in the attribution tab can now be hovered for additionnal details
- 13C isotopes can now be added simply to calibration
- Calibration dots now appear on the error mass chart of the attribution menu
- All stable elements masses have been added
- Added options for "matrix" type of files to vizualise or edit the variables values
- Added "median" as an option for intensity in matrix tab
- Updated the icon
- Added the advanced option for attribution to explore edges in an undirected/directed/directed reverse only manner
-  Improved/detailed the help menu
 - Separated the refresh/notebook/save button from the rest of the tab bar
 - Changed the names and icons  of the buttons for validating calibration and attribution
 - Changed the default parameters for matrix fusion and for canvas A data selection 

## Bug fixes
- Corrected tooltip errors for attributions
- Corrected attributions missed from passes when multiple results were possible
 - Corrected the refreshing on file names on tab calibration
 - "Empty" columns for data matrix attributions table now correctly adds an empty column
 - Corrected  attribution interface refreshing problems when loading parameters
 - Corrected  copying bugs for isotopic tagging table
 - Corrected a missed attribution if every peak was attributed but the last one
 - Corrected text on the "clusterize" popup in the network tab
 - Corrected the missnaming of multi-isotopic peaks
 - "Henry plots" have been renamed because this is a french-only term
 - Fixed 3D charts that would not be displayed
 - Added a verification step to never allow for negative elements in final chemical formulas
 - Corrected % of attribution for tooltips on histogram (divisor was 1 unit to big)
 - Corrected a bug when averaging intensity value in matrix with a missing value superior to 0
 - Corrected small session loading issues when certain types of chart were active
 - Corrected the pass paste for custom mass search accessed by tooltip mass search
 - Fixed a bug for parsing chemical formulae
 - Fixed a bug to export unsupervized networks
 - Fixed bugs with tools not working on files where formula was missing on only some peaks
 - Fixed a bug with data table not displaying median values
 - Corrected bugs with matrix histogram error bars. They are now displayed and computed correctly
 - Corrected histogram discrete & histogram of classes selections and filtrations that always missed the first attribution that should be highlighted
 - Fixed ENFS algorithm that did not order correctly links, previously it worked the same way as BFS
 - Fixed EEFS in unsupervized network that previously worked the same way as BFS
 - Fixed a bug with segmentation of polymers
 - Fixed histogram discrete and histogram of classes that would not autoscale their y axis

# 1.15
## New features

- Complete rework of the attribution algorithm. It is now much quicker and gives updates step by step of its completion
- Complete rework of Network menu, code side mainly but new functions added
- Added a new chart type linked to PCA: Mass spectra factor influence
- Added a new chart type: Density curves, that works similarly to a smoothed histogram. Can handle cumulated values.
-  Added an info logger, where you can write infos that are saved with the session or parameters.
- Added the possibility for histogram of classes to have a "Other" group that regroups small classes

## Enhancements
- Names of columns can now be edited inside the "Table" tab.
- "Median" has been added as an option for data tables
- For histograms of classes, class name no longer contains an "x when number of elements is ignore. If element number is considered, class name always display the number, even if it's one (for example OxNx now becomes ON and O2N now becomes O2N1)
- Re-added the option to force solid colors on mass spectra
- When you load a Punc'data session it now appears as the title of the window
- The current attribution network can be vizualised in the network tab
- You can now log additional data from attribution in Attribution/Posttreatment/Customize Output table columns
- Attribution is now logged in the "fileLog"  (button in upload tab)

## Bug fixes
- Corrected counting of edges in networks (every link type count was wrong by -1)
- Punc'data can now return back formulas with negative number of elements (network units for example)
- Corrected a bug when writing a formula with negative number of elements. If the last element has a negative number, it has to be written as "X-2". 'X2-' will refer to a double negative charge
- Corrected copying of deltas for attributions
- Corrected a bug that prevented from changing columns
- Average lines for error scatter plots are now drawn correctly, wether or not the data has been sorted by m/z values or not
- Corrected x-placements of a discrete histogram bar if its name was "0"
- Corrected refreshing problems with histogram discretes and histogram of classes
- Matrix blank filling with a 1/3 of the lowest intensity now works correctly
- Duplicated elements in a pass are now fused together when the pass is validated
- Corrected a matrix fusion problem where files couldn't be found
- For matrix fusion, you can now use both the at least/at most function and the "replace by 1/3 of intensity" without issues
- Added a 'refresh' after data deletion when a filter was active on an histogram
- Attribution: uncomputable ratios now display empty cells rather than nothingness
- Attribution: output table containing the pass number now display it correctly, whereas before it was the true value minus 1.
- Attribution: corrected the algorithm to copy the isotopes list
- When unchecking isotopic search but still checking "intensity - sum of isotopes" in the output menu configuration now fills the intensity table with monoisotopic data and no "undefined"
- Titles for chart now update every time you change the dataset without the need to refresh the whole canvas
- 2 sets Venn circles can now have opacity other than 1
- Fixed the loading of parameters if a chart saved was comparing venn sets on an histogram
- Corrected intensities showing "undefined" with 4 sectors venn diagrams
- Interactivity is now possible even on a cell for whom the floating parameters menu is opened
- Corrected display bugs in the attribution canvas when certain datasets were empty
- The % over bar on histograms for % of intensity is now correctly displayed

~~**Problème**: quand on a des graphes qui ne montrent que certains sets de données et qu'on selectionne une zone, on pourrait confondre des attributions selectionnées d'un fichier comme étant identiques à celles de l'autre fichier, ce qui n'est pas forcément le cas. Peut être faire un check forcé par ID du point ?~~
# 1.14 
31/10/2024
## New features
•Complete rework of canvas
•implementation of canvas manager menu
•Added a type of cell: "PCA components", a scatter plot that automatically looks for PCA components columns
•"Table of data" cells now also show interactivity & have more options of values computed
• You can now have error bars on histogram of discrete values & histogram of chemical classes
•The type "histogram(matrix)" of cell has been removed and replace with additional parameters in other kinds of histograms
•You can override default parameters for any cell, allowing for example for differently sized cells on canvas
•Added some Elements masses, just in case (Finished period 4 with Se & Kr and added Au, Pb & Bi)
•Canvas stat now works in the exact same way as canvas A&B, but with its unique types of cells

## Enhancements
• Selection algorithm has been reworked, and is slightly more optimized
• Selections on a cell where a file is not displayed will no longer allow this same file to appear selected on other charts
• Code-side indexation of all datapoints has been added to simplify some functions and checks
• All inputs should now have a tooltip displaying the function of this number/variable/button when hovered 
• The default kendrick mass options have been changed and reorganized
•Opacity can now be modified through a slider
•You can now zoom on histograms the same way you would on other charts (shift+brush)
•Color scales appear now smaller/denser
•Renamed "Treatment" to "Tools"
•Premade canvas have been changed
•Added the color scale "Pride"

## Bug fixing
• Fixed a bug with isotopes not appearing on attribution kendrick plots with variable intensity toggled on
• Fixed a bug that made Punc'data not work anymore when loading parameters from older versions
•Fixed a bug where experimental functions didn't work with older parameters
•Fixed bugs when writing chemical formula with electric charges
•Fixed a bug where histogram x type was not correctly displayed in the menu
•Fixed a bug where, when using a custom color scale, a data file could not be removed
•Switching from m/z to nominal kendrick mass now correctly refreshes without having to redraw everything

# 1.13
02/08/2024
## New features
•3d scatter plots
•Option to add pie charts to tooltip that display intensities (found in the matrix columns)
•The regex of chemical formulas now understands negative number of elements, such as "C-2H2". If you need to add multiple charges at the end, do not put "C2H2+2" but "C2H2++"
•LAB VERSION: Added a "Directed Network" option instead/on top of the undirected supervised network
•LAB VERSION: Pie chart is now  used to vizualise attributed/non attributed data proportions
•LAB VERSION: An adduct calculation algorithm has been added. Option is given to fuse together attributions corresponding to the same molecule with different adducts
•LAB VERSION: added a menu to edit precisely mass differences/names of isotopes to look for
•LAB VERSION: option to compute for the data table output a polymer chain length and end groups
•LAB VERSION: option to add original columns that were left aside (other than m/z and intensity) to the data table output
•LAB VERSION: option to add a column "index" which corresponds to the original data index when sorted by m/z values
•LAB VERSION: Added more logging options when attributing, including logging the attributions before saving.
•LAB VERSION: (Experimental) Added a pre-attribution algorithm to remove harmonics. Has to be toggled on in advanced options
## Enhancements
•Default size of font is bigger on charts to be more easily readable when exported
• Corrected small text mistakes
•Added a save button on the upload tab
•Percents over histogram bar may now have more significant numbers
•Changes in functions to quicken menu creations, minor apparent modifications on the inferface
• LAB VERSION: moved copy/paste buttons for passes inside the pass edition menu
•LAB VERSION: Overhaul of the attribution menus and parameters order
•LAB VERSION: "Delta matrix fusion" (nonsense name if there is one) is now called "Matrix error tolerance"
•LAB VERSION : Minor menus changes that impact which menu is available and displayed
•LAB VERSION: lookup of isotopes is done before attribution, as a networking step. Multi-isotopic peaks can now be identified
•LAB VERSION: Undirected Network now use mDa values instead of ppm values for delta attribution and matrix tolerance. Please check these parameters on your old parameters, new values should approximattely divided by 10 (~0.1 mDa) for FT data
## Bug fixing
•Corrected the filtering of tab table for alphanumerical values
•Sorting on the tab table now correctly sorts data on the canvas
•Corrected intensities bugs with venn diagrams
•Corrected column bug with 4 sets venn diagrams
•Fixed invisible tooltips blocking the "upload" button
•Corrected titles being cut when they contained a dot when loading punc'data sessions
•Punc'data will now save in .pdata files more info on currently attributed isotopic patterns. pdata files made on previous versions will no longer display the isotopic patterns due to a change in the way data is handled.
•When a formula is written by Punc'data, the charge is now always at the end

# 1.12
01/03/2024
## New features
•Basic calibration (linear and quadratic)
•Added a calibration list editor, with copy/paste and automatic polymer adder
•Remade histogram of classes. They can also now be made as Pareto charts.
•Added histograms of discrete values: works with any type of column, numerical values or textual ones.
•Added a treatment option to compute DBE
•Added a treatment function to compute polymer chain length & end groups
•Added a treatment option to remove a column on all files
•Tab table has been updated: you can now display a limited number of attributions, and enter into "edit mode"
•Added in tab parameters a color scale editor
•Added in tab parameters a tooltip additional informations editor
•On canvas, you can now force a dataset to ONLY be shown on certain charts
## Enhancements
•LAB VERSION : You can now display sum total intensity (+isotopes) as a column for attributions
•LAB VERSION :  Tooltip from attribution now show by which pass & by which method (network/deNovo) the peak was attributed
•Parameters for the tab stat are now loaded
•Removed unneeded margins and increased text size
•Zooming on charts by MAJ+scroll wheel
•You can now double click on an axis to unzoom only in this direction
•You can now customize color and width of dots outline on charts
•Added a menu when loading parameters to only upload parts of a method.
•Points on Henry diagrams are no longer connected
•You can now force mass spectra to have a solid color and not a gradient
•Added a small animation when selecting a cell from the menu to show which one will be edited
•Removed the tab "classes" for now
•You can now copy data from histogram/ histogram of classes/density charts by making a sticky tooltip and pressing "copy data"
•Basic method added to increment new "attributed" or "calibrated" files
•Added option to log and copy calibration status of a file (tab stats)
•Any popup can now be removed by pressing the escape key
•LAB VERSION: There is now an option to hide specifically attributed data/unattributed data/isotopes tagged peaks
•LAB VERSION: You can now copy/paste attributions passes, to write them quicker

## Bug fixing
•Corrected the csv export that did not work on the desktop version
•Corrected a bug with treatment tab>compute KMD (wrong choice of file)
•Visualizing an empty file in tab table now updates the page & doesn't show the previously viewed file
•Corrected a bug where input files of a matrix were wrongfully selected
•LAB VERSION : Corrected the H/C bounds that were not working 
•Deleting a file now also removes its name
•Reuploading the same file after deleting the content of a file slot now works correctly 
•LAB VERSION: Wrong computation of radical/cation with N/P corrected
•LAB VERSION: Corrected a bug with the number of points on attribution tab → henry chart
•Autoscaling of classes histograms now works
• Corrected many small bugs with histogram(w error bars)
•Changed the way svg exports are named
•Corrected autoscale bug after having made selections on charts
•Added a check to avoid OOM bugs when trying to make histograms with over 10 000 bins
•When parsing formula, Punc'data will now do it consistently in the order : C,H,N,O and then alphabetical order
•LAB VERSION :Added removal of old tooltips from the DOM for the Attribution Tab
•Autoscaling now also updates the inputs in the table menu
•Corrected the "% over bars" for histogram where the y axis was in "nb of attribution"
•Corrected a small +1/-1 bug for counting histogram % of attributions that could lead to small height change of bars
# 1.11
09/01/2024
##  New features
•LAB VERSION: Attribution algorithm added
•Added brushing on histogram and histograms of classes
•Added filtering on histogram and histogram of classes
•Added a "upload parameters" button
•Added a treatment option to compute and add a column for a KMD ratio
## Enhancements
•Added an intro
•On tab Network, when editing links, clicking "add a new link" will not anymore reset previous written but unsaved modifications
•The autoscale function now gives better results (especially for histograms and relative mass spectras)
•Removed the separator options from the main upload page and inserted them in upload parameters menu
•In canvas A&B, for data parameters, added a shortcut to sort data (and change their draw order)
•Formulae in tooltip now appear with number as subelements
•Premade canvas are now adaptable to different input column formats
•Display: You can now display sample name on the chart as a title
•Display: You can now display axis names at the end of axis
•Display: You can now edit margins to get charts closer together/further apart
•You can now choose to replace every "KMD" by "KFM"
•You can now edit brushing/filtering appearance
•Small graphical adjustements
## Bug fixing
•Corrected a bug that prevented from making sticky tooltips on venn diagram (desktop version)
•Fixed a bug where matrix peak deletion (if not present in at least/at most x files) would not work when missing values where replaced by a custom value or by 1/3 of lowest intensity
•Corrected a bug with some blend mode colors for venn diagrams
•Corrected the number of components on PCA analysis
•Corrected some selecters appearing empty when changing parameters
•Corrected some tooltips not disappearing 
•Fixed updating of networks when the file visualized is modified
•Bar width display on histogram is now constant
•Corrected selection bugs with relative scale mass spectrae
•For contour maps, fixed saturated color scales when it was set to relative for other charts
•Adding a new file will now automatically refresh the width of histogram bars
•Corrected all display issues when loading different canvas with the same premade canvas (also known as Nathan's weird af bug)
•Changed the alert boxes so that they won't unfocus the inputs of the desktop app
•Corrected a numbering issue of file when trying to save them
•Corrected a bug with matrixes for mass averaging when keeping files only appearing it at least/at most x peaks
•Corrected a display bug with Kendrick 2D map refresh


# 1.10
03/11/2023
## Nouvelles fonctionnalités
•Added Networks: visualisation of samples based on defined customizable units (CH2, H2, H2O...). The links are customizable and colorable, the size of nodes (attributions) and their color is customizable.
•ACP now work correctly and give reliable results compared to Perseus & Statistica
•On Canvas, you can now visualize simultaneously 6 samples instead of 4.
•Added the option to compare 4 samples by Venn diagrams
•When creating a matrix, the choice is now given to replace missing values by: empty cell, 0 , a constant, 1/3 of the intensity of the les intense peak.
•You can now quickly search a formula in different databases (pubchem, kegg, hmdb, lipid maps) by ctrl+clicking its point on any diagram.
•Histogram of classes can no be brushed to act as filters, in the same way as normal histograms

## Ergonomie
•There is now a warning before closure to prevent quitting without saving
•Redrawn every icon, they all are visually aligned now
•Added a button to invert the color scales
•Edited the help tab
•When dots have a black outline, selection on charts creates an even thicker black outline
•Added an autoscale button for the PCA tab
•Added , and ; shortcuts on canvas to sweep though uploaded files
•Added : and ! shortcuts on canvas to sweep through color scales
•You can now add percentages over bars on histograms
•For sticky tooltips, the dot from which the data is shown is now highlighted/animated
•You can now see the name of the selected column on parameters tab
•Added the option to screenshot venn diagrams
•Remade the screenshot menu of the stat tab to be identical to other screenshot menus
•Added transparency support for color pickers
•Adjusted the color palette
•Small graphical adjustments
## Correction de bugs
•Corrected a bug that forbidded the saving of data
•Corrected a bug where the wrong file could be selected for data treatment 
•Column choices for color scales/charts now don't reset if you select an empty file
•Canvases now correctly auto-update when you re-upload a viewed file
•Corrected source files from "classes" tab that lost their header line (column names)
•File selecters now display "none" rather than an empty selecter
•Dot size can now be a float number and not only an integer
•User is prevented from downloading non-working svg files of all canvas
•Corrected crashes when loading some invalid puncdata files
•Data normalization now correctly works for PCA even if for a variable the std dev is null
•You now cannot select by missclicking separators options (-----) for colors and files.
•Sticky tooltip now automatically close when refreshing the canvas
•Corrected wrong interpretation of formulas containing x's, such as NxO1, NxO2...
•Corrected selection bugs on mass spectras with relative intensity scales
•Corrected a bug with displaying the number of venn circles when loading a new .pdata file
•Corrected histogram of classes bar colors not updating correctly everytime
•Minor display bugs with relative and inverted color scales
•Corrected a bug with Venn diagrams when intensities were small floating numbers
•Corrected a bug about computing masses from formula with implict number of elements, such as NaO4 
•Corrected the placement of the button in treatment tab>Parse formula> Force element list
•Fixed positioning of popup "data pasted"
•Fixed a bug when taking a screenshot of part of the PCA canvas
# 1.9 
06/06/2023
## Nouvelles fonctionnalités
•Added PCA analysis 
•Re-did the treatment tab: works without bugs and is visually more aligned with the matrix tab.
•The option to parse a formula into individual columns for each elements is now displayed more clearly in the treatment tab.
•Added lines on the stat tabs for the 1st and 9th decile
•Added a search function to highlight on charts a specific formula (or mass) with the possibility of adding a repeat unit
•Added "histogram(matrix)" charts to handle the special case of matrix with errors bars. The alpha error tolerance is customizable between 10,5,4,3,2,1,0.5 and 0.1 %.
•Added the option to have mass spectra in relative intensity (% of most intense peak)

## Ergonomie
•Ajouté un bouton select/unselect all pour les choix des fichiers pour les matrices
•Modifié le tab upload pour afficher mieux les fichiers actuellement chargés: nombre de pics, nombre de colonnes, sauvegarde/copie rapide...
•Ajouté un log sur chaque fichier uploadé permettant à terme de suivre les modifications qu'a subi le fichier. 
•Ajouté l'option d'avoir une échelle de couleur relative (en %, se calcule automatiquement sur les données fournies)
•Si votre échelle de couleur contient moins de 30 valeurs différentes, le nombre de dégradés de couleurs s'adaptera maintenant automatiquement. (sauf si vous utilisez des chiffres à virgules). Option ajoutée sur le menu principal pour désactiver cette fonction.
•Le nom des échelles de couleur est plus précis dans le cas des diagrammes de Venn.
•Nouveau color Picker, plus ergonomique et avec une meilleure palette par défaut.
•Ajouté des  explications dans le tab "help"
•Added a warning if you may be fusing formulas for a matrix/venn diagram based on a chemical and not an ion formula

## Correction de bugs
•Corrigé un bug de mise à jour des tableaux de données (tab canvas)
•Corrigé un bug qui empêchait de modifier la largeur/hauteur des graphiques
•Les extensions des fichiers sauvegardés sont maintenant correctement ajoutées
•Les noms de fichiers se mettent partout correctement à jour dès que le nom est modifié
•Les diagrammes de contour fonctionnent même avec des échelles de couleur ne commençant pas à 0.
•Les fichiers avec des virgules comme séparateur numérique sont correctement interprétés à présent.
•Corrigé un problème de rafraichissement du brush pour les nuages de points et les diagrammes de contour lorsque l'on changeait la colonne utilisée pour l'axe x ou y.
•Les graphes se mettent directement à jour quand on change le type de cellule, il n'y a plus de disparition des points.
•Corrigé le problème de mise à jour des grilles lors d'un dé-zoom
•Lors du chargement de paramètres, tous les champs du tab paramètres se mettent maintenant à jour, ne causant plus de reset des paramètres dès que l'un d'entre eux est modifié.
•Réorganisé le script de la partie stat pour rendre plus independantes et accessibles les données en cours de calculs pour d'autres futures fonctions
•Les choix de colonnes pour les échelles de couleur et les axes des diagrammes se mettent maintenant correctement à jour à chaque fois que vous changez de fichier visualisé sur les canvas. 


# 1.8
Nouveau canvas, Classes
## Nouvelles fonctionnalités
•Ajouté une fonction pour découper la formule en éléments individuels, les ajouter à de nouvelles colonnes et calculer des ratios d'éléments automatiquement
•Refonte totale du système de Canvas: on peut maintenant choisir les 6 types de graphes, et on dispose de deux canvas
•Refonte totale du système de sauvegarde(json) : (désolé il faudra recommencer vos paramètres): permet de faire fonctionner le nouveau système de canvas personnalisable
•Possibilité de sauvegarder une session entière de Punc'data, paramètres et jeux de données inclus en un seul fichier
•Ajouté un tab Classes, qui permet de subdiviser une matrice en classes et de les traiter séparément ensuite. Les classes sont personnalisables.
•Ajout de graphiques en classes de molécules sur les canvas
•Ajout des diviseurs pour les masses de Kendrick


## Ergonomie
•Ajouté l'option de centrer les barres pour les histogrammes
•Ajouté l'option de choisir le nombre de barres par unité pour les histogrammes
•Lorsque l'on fait une selection sur un graphe on peut maintenant copier par ctrl+c

## Correction de bugs
•Corrigé, lors de la selection sur des histogrammes, le problème qui empêchait d'avoir la fenêtre d'information affichée normalement en survolant un point.
•Filtrer les données fonctionne mieux et les points cachés ne bloquent plus l'affichage des détails des points situés "en dessous"

# 1.7
Matrices, graphes de densité
## Nouvelles fonctionnalités
•Ajout d'un onglet permettant de générer des matrices et des rapports sur ceux-ci
•L'onglet des matrices permet de soustraire des blancs
•Ajout d'une graphique de densité
•Ajouté le raccourci ctrl+click aussi pour le tab stat
•Captures d'écrans possible aussi sur le tab stat
•Export svg possible des captures d'écran possible (et + rapide)
•On peut maintenant choisir le type de séparateur du le fichier importé (virgule(csv), point virgule(csv), espace(txt/ascii), double espace(ascii), tab(txt))

## Ergonomie
•On peut maintenant directement écrire la formule d'un motif pour le KMD, la masse correspondante est calculée automatiquement.
•Ajouté un bouton refresh qui permet s'il y a un problème de redessiner le tab actif
•Ajout d'un bouton "recherche automatique" pour les paramètres de colonnes, qui cherche basé sur les noms des colonnes
•Ajout d'un bouton pour uploader plusieurs fichiers simultanément. Il cherchera les emplacements vides en mémoire ou en créera de nouveaux en fonction de ce que vous avez déjà uploadé.
•Les menus déroulant dans les tableaux de paramètres ont maintenant une taille maximale, ce qui réduit les déformations du tableau si vous avez des noms de colonne longs

## Correction de bugs
•Corrigé le bug de la ligne moyenne sur le tab stats (les points au delà de m/z 1000 étaient mal tracés)
•Tous les diagrammes de Kendrick se mettront maintenant correctement à jour lorsque le type d'arrondi est changé.
•Corrigé les diagrammes de Venn qui ne fonctionnaient plus sur la version Desktop
•Corrigé une mise à jour mal faite des noms des fichiers dans certains cas
•Corrigé l'exportation des datas supprimées depuis le tab kendrick
•Corrigé les diagrammes de Venn à 3 sets qui prenaient une erreur en ppm de max 0 ppm
•Corrigé l'importation de fichiers ASCII/DataAnalysis qui causait des retours intempestifs à la ligne
•Corrigé le brushing/zooming des graphes sur le spectre de masse du tab kendrick
•Le bouton DEL des fichiers supplémentaires importés fonctionnement maintenant correctement
•La fonction de traitement/suppression des données fonctionnement également correctement à présent
•Les menus déroulants de choix de fichiers ne se réinitialisent plus à chaque fois que l'on rajoute un choix
•Corrigé un bug avec le calcul des KMD 2D dans le cas des nouveaux types d'arrondis (arrondis supérieurs et arrondis inférieurs)
•Corrigé un bug de mauvaise mise à jour lors d'un zoom sur l'onglet visualisation avec la multi-vue d'activée
•Corrigé la taille des points qui ne se mettait pas à jour lors du multiView pour le tab kendrick

# 1.6
Vision multiple et ergonomie
## Nouvelles fonctionnalités
•Ajout d'un bouton "Visu multiple" qui permet de visualiser simultanément plusieurs fichiers sur les mêmes graphes
	•Lorsque des diagrammes de Venn ont été faits, les différentes zones des diagrammes sont disponibles à la visualisation
	•L'outil de selection peut fonctionner sur un des échantillons au choix ou sur tous en même temps
	•Les histogrammes fonctionnent également avec ce mode et mettent à jour tous les points simultanément. Une légende a également été ajoutée
•Le bouton capture d'écran donne maintenant le choix de quel graphique doit être capturé
•Ajout d'un bouton "auto-scale" des graphes
•Lorsque l'on supprime des points d'un graphe, on a maintenant le choix de supprimer tout SAUF la selection
•Dans l'onglet traitement, vous avez maintenant la possibilité de copier les éléments qui viennent d'être supprimés lors de la dernière opération
•L'onglet "Table" a une vraie utilité à présent: lorsque vous trier les données à l'aide du haut du tableau, l'ordre de dessin sur les autres tabs change: ainsi, en changeant cet ordre, des points qui étaient auparavant cachés par d'autres dessinés au dessus réapparaitrons.  Remarque: le premier point de votre tableau sera le point le + mis "en avant"
•Possibilité d'uploader + que 4 fichiers à la fois (je n'ai pas testé s'il peut être poussé au delà de 12 donc attention pour l'instant)
•Pour les KMD, possible de choisir le type d'arrondi (round, roundUp, roundDown)
•Faire ctrl+click sur un point de donné survolé crée maintenant un tooltip fixe qui permet d'en copier les informations
•Ajout d'options pour l'apparence des graphiques:
	-Possibilité de retirer l'affichage des légendes de couleur

## Ergonomie
•Ajout d'un tab "aide" avec des informations générales
•optimisation (retraçage plus rapide des points lors de changement des paramètres des graphes)
•modifications dans l'organisation du code
•Ajout d'un bouton pour fermer/ouvrir les menus de paramètres et ainsi gagner de l'espace de visualisation
•Lorsqu'il y a un écart max-min de 3 ou moins pour les histogrammes,  les barres passent d'un écart de 1 en 1 à un écart de 0.1 en 0.1, permettant des histogrammes plus utiles pour des variables comme H/C et O/C
•Lorsque vous uploadez un fichier csv, le nom s'insère automatiquement dans la zone
•Modifications mineures de l'apparence pour être moins austère
•Appuyer sur le bouton DEL  du tab upload devrait normalement bien vider les data de la mémoire, libérant de l'espace sur la RAM

## Correction de bugs
•Le nombre de graduations des grilles ne se mettait pas à jour correctement
•Le fait que la taille des points soit fonction ou non de l'intensité se sauvegarde correctement maintenant.
•L'échelle de couleur (tab kendrick) affiche maintenant correctement le type de variable utilisé sur la légende.
•Corrigé la non conservation du nombre de graduations paramétré lors du changement des valeurs min/max d'un axe
•Les grilles s'alignent maintenant correctement même en zoomant
•Il n'y a plus de sauts de lignes vides lorsque l'on recopie les data du diagramme de Venn

----
# 1.5
Mise à jour graphique
## Nouvelles fonctionnalités
•Ajout d'un bouton pour activer/désactiver la taille des points
•Ajouts d'options pour l'apparence des graphiques:
	-La couleur de fond des graphes est réglable
	-Les points peuvent avoir un liserai noir (aide dans certains cas à les distinguer)
	-Les graphes peuvent avoir un encadré noir
	-On peut changer la taille et la police des légendes et des échelles
	-On peut choisir le nombre de graduations sur les axes et la grille.
•La taille des graphes est réglable
•Pour les masses de Kendrick: l'abscisse peut maintenant être choisie entre m/z et NKM
•Ajout d'une fonction de tri du tableau pour visualiser plus vite des données (le tri est seulement fait pour la page table)

## Ergonomie
•Les KMD exacts apparaissent dans le tooltip de l'onglet Kendrick (survol des points)
•L'échelle des couleurs est + esthétique et passe en légende écriture scientifique pour les valeurs supérieures à 1e4
•Les échelles des axes se mettent automatiquement en écriture scientifique quand le max dépasse 
1e5
•Ajout d'options pour les choix de couleur et rangement thématique

## Correction de bugs
•Corrigé les grilles qui ne se mettaient pas à jour lors du changement des axes
•Mode de compatibilité Composer: changé les colonnes pour mieux correspondre aux paramètres par défaut
•Bugs des axes qui ne se mettaient pas à jour sur les graphes de l'onglet stat
•Les lignes qui réapparaissent spontanément sur les diagrammes de Kendrick en chargeant des paramètres
•Le positionnement des informations moyennes sur l'échantillon (tab visualisation) est placé plus intelligemment si on change la taille des graphiques

____