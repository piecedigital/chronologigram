var express = require("express");
var path = require("path");
var app = express();
var https = require("https");

app.use(express.static(path.join(__dirname, "public")));
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", ".");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

app
.get("/", (req, res) => {
  // console.log(req.headers)
  res.sendFile(path.join(__dirname, "views/index.html"));
})
.get("/v1/**", (req, res) => {
  // console.log(Object.keys(req), req.method)
  getData({
    hostname: "api.instagram.com",
    path: req.originalUrl,
    method: req.method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, (data) => res.json(data));
})
;
function getData(options, callback) {
  options = options || {
    hostname: 'www.google.com',
    path: '/upload',
    method: 'GET',
    data: null,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  var req = https.request(options, (res) => {
    console.log(`Got response:`, res.responseText);
    // consume response body
    res.resume();
    var body = "";
    res.on("data", data => body += data);
    res.on("end", () => callback(body));
  });
  req.on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });
  if(options.data) req.write(options.data);
  req.end();
}

app.listen(8080);
console.log("listening on port 8080");

// function diffArray(arr1, arr2) {
//   return Array.concat( arr1.filter(num => {var ind = arr2.indexOf(num); if(ind < 0) return num; arr2.splice(ind, 1); return undefined;}), arr2 );
// }
// diffArray([1, 2, 3, 5], [1, 2, 3, 4, 5]);
