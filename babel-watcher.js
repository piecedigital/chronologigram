var watchBabel = require("watch-babel");
var cp = require("child_process");

var srcDir = "./src";
var destDir = ".";
var options = { glob: "**/*.js" };
var watcher = watchBabel(srcDir, destDir, options);
watcher.on("ready", function() { console.log("ready", arguments); });
watcher.on("success", function(filepath) {
  console.log("Transpiled ", filepath);
  // var server = startServer();
  var brfy = cp.exec("sudo npm run brfy-raw");
  brfy.on("error", (err) => console.error("BROWSERIFY:ERROR", err.stack || new Error(err).stack));
  brfy.on("exit", (code, signal) => {/*server = restartServer(server); */console.log("BROWSERIFY:EXIT-", code, signal); });
});
watcher.on("failure", function(filepath, e) {
  console.log("Failed to transpile", filepath, "(Error: ", e);
});
watcher.on("delete", function(filepath) {
  console.log("Deleted file", filepath);
});

// function startServer() {
//   var brfy = cp.exec("node app.js");
//   brfy.on("error", (err) => console.log("BROWSERIFY:ERROR", err.stack || new Error(err).stack));
//   brfy.on("exit", (code, signal) => {console.log("SERVER:EXIT -", code, signal); });
//   return brfy;
// };
// function restartServer(process) {
//   process.kill();
//   return startServer();
// };
