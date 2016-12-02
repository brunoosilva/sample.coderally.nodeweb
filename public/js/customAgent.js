var Agent = require('coderally-agent');
var AIUtils = Agent.AIUtils;
var myAgent = new Agent();

function CustomAgent(data, socket) {
  this.vehicleOptions = JSON.parse(data.vehicleOptions);

  this.codeRallyServer = data.server;

  this.username = data.username;
  this.userId = data.userId;
  this.trackId = data.trackId;

  this.name = this.vehicleOptions.name;
  this.weight = this.vehicleOptions.weight;
  this.acceleration = this.vehicleOptions.acceleration;
  this.traction = this.vehicleOptions.traction;
  this.turning = this.vehicleOptions.turning;
  this.armor = this.vehicleOptions.armor;

  this.socket = socket;
};

CustomAgent.prototype.enterRace = function() {
  myAgent.enterRace({
    compressedDataStream: true,
    track_id: this.trackId,
    username: this.username,
    user_id: this.userId,
    uniqueUserid: "116650285099720794308",
    file_name: "Testcar",
    vehicle_type: this.name,
    accel: this.acceleration,
    weight: this.weight,
    armor: this.armor,
    traction: this.traction,
    turning: this.turning
  }, this.codeRallyServer);
};

CustomAgent.prototype.initAgent = function() {
  var self = this;
  myAgent.on('init', function(ourCar, track) {
    self.socket.emit('race-update', 'The agent has been initialized');
  });
};

CustomAgent.prototype.onRaceStart = function() {
  var self = this;
  myAgent.on('onRaceStart', function(ourCar, raceID) {
    self.socket.emit('race-start', raceID);
    self.socket.emit('race-update', 'Race has started');

    // Aggressive start
    var target = AIUtils.getClosestLane(ourCar.getCarStatus().getCheckPoint(),
      ourCar.getCarStatus().getPosition());
    ourCar.pushCarControl({
      carBrakePercent: 0,
      carAccelPercent: 5,
      carTarget: target
    });
  });
};

CustomAgent.prototype.onCheckpointUpdated = function() {
  var self = this;
  myAgent.on('onCheckpointUpdated', function(ourCar, checkpoint) {
    self.socket.emit('race-update', 'Checkpoint updated');

    var target = AIUtils.getClosestLane(ourCar.getCarStatus().getCheckPoint(),
      ourCar.getCarStatus().getPosition());
    ourCar.pushCarControl({
      carBrakePercent: 0,
      carAccelPercent: 5,
      carTarget: target
    });
    AIUtils.recalculateHeading(ourCar, 0.75);
  });
};

CustomAgent.prototype.onStalled = function() {
  var self = this;
  myAgent.on('onStalled', function(ourCar) {
    self.socket.emit('race-update', 'Car stalled');

    AIUtils.recalculateHeading(ourCar, 1);
    ourCar.pushCarControl({
      carAccelPercent: 5,
      carBrakePercent: 0
    });
  });
};

CustomAgent.prototype.onTimeStep = function() {
  var self = this;
  myAgent.on('onTimeStep', function(ourCar) {
    self.socket.emit('race-update', ourCar.getCarStatus().getStatus());
    AIUtils.recalculateHeading(ourCar, 1);
  });
};

CustomAgent.prototype.onRaceEnd = function() {
  var self = this;
  myAgent.on('onRaceEnd', function(raceID) {
    self.socket.emit('race-end', raceID);
  });
};

module.exports = CustomAgent;
