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
var spawn = require('child_process').spawn

// Routes
var route = require('./routes/route');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Agent = require('coderally-agent');
var AIUtils = Agent.AIUtils;

app.use(express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules/ace-builds/src/'));

app.use('/route', route);

io.on('connection', function(socket) {
  // handshake
  socket.on('user-setup', function(data) {
    var vehicleOptions = JSON.parse(data.vehicleOptions);

    var codeRallyServer = data.server;

    var username = data.username;
    var userId = data.userId;
    var trackId = data.trackId;

    var name = vehicleOptions.name;
    var weight = vehicleOptions.weight;
    var acceleration = vehicleOptions.acceleration;
    var traction = vehicleOptions.traction;
    var turning = vehicleOptions.turning;
    var armor = vehicleOptions.armor;

    var myAgent = new Agent();

    myAgent.enterRace({
      compressedDataStream: true,
      track_id: trackId,
      username: username,
      user_id: userId,
      uniqueUserid: "116650285099720794308",
      file_name: "Testcar",
      vehicle_type: name,
      accel: acceleration,
      weight: weight,
      armor: armor,
      traction: traction,
      turning: turning
    }, codeRallyServer);

    myAgent.on('init', function(ourCar, track) {
      socket.emit('race-update', 'The agent has been initialized');
    });

    myAgent.on('onRaceStart', function(ourCar, raceID) {
      socket.emit('race-start', raceID);
      socket.emit('race-update', 'Race has started');

      // Aggressive start
      var target = AIUtils.getClosestLane(ourCar.getCarStatus().getCheckPoint(), ourCar.getCarStatus().getPosition());
      ourCar.pushCarControl({
        carBrakePercent: 0,
        carAccelPercent: 100,
        carTarget: target
      });
    });

    myAgent.on('onCheckpointUpdated', function(ourCar, checkpoint) {
      socket.emit('race-update', 'Checkpoint updated');

      var target = AIUtils.getClosestLane(ourCar.getCarStatus().getCheckPoint(), ourCar.getCarStatus().getPosition());
      ourCar.pushCarControl({
        carBrakePercent: 0,
        carAccelPercent: 100,
        carTarget: target
      });
      AIUtils.recalculateHeading(ourCar, 0.75);
    });

    myAgent.on('onStalled', function(ourCar) {
      socket.emit('race-update', 'Car stalled');

      AIUtils.recalculateHeading(ourCar, 1);
      ourCar.pushCarControl({
        carAccelPercent: 100,
        carBrakePercent: 0
      });
    });

    myAgent.on('onTimeStep', function(ourCar) {
      socket.emit('race-update', ourCar.getCarStatus().getStatus());
      // console.log("Position ", JSON.stringify(ourCar.getCarStatus().getPosition()));
      // console.log("Lap ", JSON.stringify(ourCar.getCarStatus().getLap()));
      // console.log("Place ", JSON.stringify(ourCar.getCarStatus().getPlace()));
      // console.log("Acceleration ", JSON.stringify(ourCar.getCarStatus().getAcceleration()));
      // console.log("Target ", JSON.stringify(ourCar.getCarStatus().getTarget()));
      // console.log("Checkpoint ", JSON.stringify(ourCar.getCarStatus().getCheckPoint()));
      // console.log(); // filler
      AIUtils.recalculateHeading(ourCar, 1);
    });

    myAgent.on('onRaceEnd', function(raceID) {
      socket.emit('race-end', raceID);
    });
  });
});


var appEnv = cfenv.getAppEnv();
http.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
  spawn('open', [appEnv.url]);
});
