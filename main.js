/***********************************************  
 |  __ \                ( )   | |     | |       
 | |__) |   _ _ __   ___|/  __| | __ _| |_ __ _ 
 |  ___/ | | | '_ \ / __|  / _` |/ _` | __/ _` |
 | |   | |_| | | | | (__  | (_| | (_| | || (_| |
 |_|    \__,_|_| |_|\___|  \__,_|\__,_|\__\__,_|                                               
***********************************************/


/*************************************************************************************************************** */
// include the Node.js 'path' module at the top of your file
const path = require('path')

const { app, BrowserWindow } = require('electron')
// modify your existing createWindow() function

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=8192');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    }
  })

	win.maximize()
  win.loadFile('index.html')
  
  // for warning before closing
  win.on('close', function(e){
    var choice = require('electron').dialog.showMessageBoxSync(this,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit?'
       });
       if(choice == 1){
         e.preventDefault();
       }
    });

  
  //for saving files
	// handle download event
	win.webContents.session.on('will-download', (event, item, webContents) => {
  // TODO: find out what the user is downloading and set options accordingly
  item.setSaveDialogOptions({
    filters: [
      // Set your allowed file extensions here
      {name: "Default exportation format", extensions: ["csv","svg", "png", "json", "pdata", "txt", "jpg"]},
	  {name: 'All files (".")', extensions: []}
    ],
    message: "P"
  });
});


  
}
app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})



