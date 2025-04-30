var packager = require("electron-packager");
var options = {
  arch: "x64",
  platform: process.platform,// this will automatically select darwin if darwin or win32 if win32
  dir: "./", // which directory to pack
  "app-copyright": "",// fill this
  "app-version": "0.0.1",
  asar: true, // this will archive your source code.
  icon: "./logo.ico",
  name: "", // fill this
  ignore: [
    // list every thing that need to be ignore, so reference every single director and leave the build of the app and the files that are being used in the node module.
  ],
  out: "./build/releases",
  overwrite: true, // will overwrite whatever it might have written before.
  prune: true,
  version: "0.0.1",
  "version-string": {
    CompanyName: "",// fill this
    FileDescription:
      "" /*This is what display windows on task manager, shortcut and process*/,
    OriginalFilename: "",// fill this
    ProductName: "",// fill this
    InternalName: "",// fill this
  },
};
packager(options, function done_callback(err, appPaths) {
  console.log(err);
  console.log(appPaths);
});