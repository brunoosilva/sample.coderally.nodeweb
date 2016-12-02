/**
 * (C) Copyright IBM Corporation 2016.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var express = require('express');
var cfenv = require('cfenv');
var spawn = require('child_process').spawn;
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var opener = require('opener');

// Routes
var route = require('./routes/route');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules/ace-builds/src/'));

app.use('/route', route);

app.post('/upload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, '/public/js/uploads');
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });
  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });
  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });
  // parse the incoming request containing the form data
  form.parse(req);
});

io.on('connection', function(socket) {
  // handshake
  socket.on('user-setup', function(data) {
    fs.stat(path.join(__dirname, '/public/js/uploads/customAgent.js'), function(err, stat) {
      if (err == null) // if file exists
        var CustomAgent = require('./public/js/uploads/customAgent');
      else // file does not exist
        var CustomAgent = require('./public/js/customAgent');
      var customAgent = new CustomAgent(data, socket);
      customAgent.enterRace();
      customAgent.initAgent();
      customAgent.onRaceStart();
      customAgent.onCheckpointUpdated();
      customAgent.onStalled();
      customAgent.onTimeStep();
      customAgent.onRaceEnd();
      if (err == null)
        fs.unlinkSync(path.join(__dirname, '/public/js/uploads/customAgent.js'));
    });
  });
});

var appEnv = cfenv.getAppEnv();
http.listen(appEnv.port, '0.0.0.0', function() {
  console.log("App started on: " + appEnv.url);
  opener(appEnv.url);
});
