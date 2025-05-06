////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////  ____                   _     _       _        ///////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ |  _ \ _   _ _ __   ___( ) __| | __ _| |_ __ _ \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
///////////////////////////////////////////////////// | |_) | | | | '_ \ / __|/ / _` |/ _` | __/ _` |///////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ |  __/| |_| | | | | (__  | (_| | (_| | || (_| |\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
///////////////////////////////////////////////////// |_|    \__,_|_| |_|\___|  \__,_|\__,_|\__\__,_ ///////////////////////////////////////////////         
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\		          V.1.15.6		     \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Punc'data is an interactive attribution and vizualization tool made for high resolution mass spectrometry results. It is used to filter, select,
 observe, comment and transmit information on results of complex samples.

To start the web version, please open the file called "index.html" with any web browser. By default, the program opens on the data manager tab, where
you can upload an already saved Punc'data session (top middle button), or data files (top left button, or all left buttons for each individual file).

To vizualise data, you need to upload a file with separation (; , ...) between the columns. You can change the separator with the gear icon 
(top right).The first line of any uploaded file has to be the title of each column.
Each line must represent an attribution or m/z values. Column represent data : m/z value, intensity, formula... 
Punc'data recognizes which column corresponds to which information based on keywords. They can also be edited manually on tab "parameters".
"Tools" Tab allows automatized edition tools of your inputs. 
"Table", "Stats", "Canvas A/B" and "Network" allow different types of tables and charts to be produced. On Canvas A,B and Stats, charts are 
interactive. Network allows the production of mass difference network.
"Matrix","Venn" and "PCA" are made to compare samples. To make a PCA, a matrix has to be computed or intensity column of each file in the PCA has
to be registered in the "upload" tab.

An example dataset is provided, called "testdata_cellulose.csv". You may upload it in the file section (Data Manager>Left column), go to any canvas
and press "Premade Canvas" (Canvas>Top Menu) for a quick demo of the software possibilites for visualization.

///////////////////////////////////////////////////////////////////////
TIPS:
ton pinpoint a tooltip, ctrl+click
to zoom on a chart, shift+click
to unzoom and go to the initial state: double click
to delete points: press delete when making a selection
For matrix, you can add pie charts to the tooltip by checking the option in the parameters tab


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Punc'data is coded in Javascript, and uses HTML/CSS for its vizualisation.
List of Library used:
- d3.js : ISC License (License provided in /Modules)
The D3 library was used to implement the plots
- d33d.js : BSD-3 License(License provided in /Modules)
The D3 3D library was used to implement 3d plots
- Coloris : MIT License (License provided in /Modules)
Coloris is used to provide a better color selecter
- SortableJS : MIT License (License provided in /Modules)
Used to sort tables in the tab "Table"
-htmL2canvas : MIT License (License provided in /Modules)
Used to export .png screenshots
-PCA-JS : MIT License (Author: Bitanath https://github.com/bitanath/pca#)
Used for PCA computation
-Regression : MIT Licenses (License provided in /Modules)
Used for linear regression, for example for henry plots

For exporting as a desktop app, Electron.JS was used (MIT License)


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Punc'data has been developed in a  french public laboratory to only serve research purposes concerning complex samples.
Punc'data is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as 
published by the Free Software Foundation, version 3. This program is distributed in the hope that it will be useful, 
but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
See the GNU General Public License for more details.

Made by Voellinger Théo 
LCP-A2MC - MassLor
2021-2025