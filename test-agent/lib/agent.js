/*******************************************************************************
 * [Restricted Materials of IBM] - Use restricted, please refer to the "SOURCE
 * COMPONENTS AND SAMPLE MATERIALS" and the "PROHIBITED USES" terms and
 * conditions in the IBM International License Agreement for non warranted IBM
 * software (ILA).
 *
 * Code Rally
 *
 * (c) Copyright IBM Corporation 2016.
 *
 * U.S. Government Users Restricted Rights:  Use, duplication or disclosure
 * restricted by GSA ADP Schedule Contract with IBM Corp.
 *
 * From the ILA for non warranted IBM software:
 *
 * SOURCE COMPONENTS AND SAMPLE MATERIALS
 *
 * The Program may include some components in source code form ("Source
 * Components") and other materials identified as Sample Materials. Licensee
 * may copy and modify Source Components and Sample Materials for internal use
 * only provided such use is within the limits of the license rights under this
 * Agreement, provided however that Licensee may not alter or delete any
 * copyright information or notices contained in the Source Components or Sample
 * Materials. IBM provides the Source Components and Sample Materials without
 * obligation of support and "AS IS", WITH NO WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, INCLUDING THE WARRANTY OF TITLE, NON-INFRINGEMENT OR
 * NON-INTERFERENCE AND THE IMPLIED WARRANTIES AND CONDITIONS OF MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE.
 *
 * PROHIBITED USES
 *
 * Licensee may not use or authorize others to use the Program or any part of
 * the Program, alone or in combination with other products, in support of any
 * of the following High Risk Activities: design, construction, control, or
 * maintenance of nuclear facilities, mass transit systems, air traffic control
 * systems, weapons systems, or aircraft navigation or communications, or any
 * other activity where program failure could give rise to a material threat of
 * death or serious personal injury.
 ******************************************************************************/

// Module Dependencies
var EventEmitter = require('events').EventEmitter;
var WebSocket = require('ws');
var request = require('request');
var agentUtil = require('./AgentUtils.js');
var uuid = require('uuid');
var util = require('util');

var Car = require('./Car.js');
var CarControl = require('./CarControl.js');

// Object and Inheritance Setup
var Agent = function() {
	EventEmitter.call(this);
};

util.inherits(Agent, EventEmitter);

// Module Exports
module.exports = Agent;

Agent.prototype.enterRace = function enterRace(carData, serverURL) {
	var self = this;
	var control = new CarControl();

	carData.agent_uuid = uuid.v4();

	self.ourCar = new Car({
		carAttributes: carData,
		carControl: control
	});

	self.serverURL = serverURL;

	request.post({
		url: 'http://' + serverURL + '/CodeRallyWeb/SubmitVehicle',
		form: carData
	}, function submitCarCallback (err, httpResponse, body) {
		if (err) {
			console.error('Error: ', err);
			return null;
		}

		var result = JSON.parse(body);

		if (result.success) {
			self.connect(carData.agent_uuid);
			self.race = result.race;
		} else {
			console.error('Car submission failed!');
			console.error(body);
		}
	});

	control.on('updateCarControl', function (newControl) {
		self.push('setTarget', newControl.getCarTarget());
		self.push('setAccelerationPercent', {'percent': newControl.getAccelerationPercent()});
		self.push('setBrakePercent', {'percent': newControl.getBrakePercent()});
	});
};

Agent.prototype.connect = function socketConnect(agent_uuid) {
	var self = this;
	var connectionStr = 'ws://' + self.serverURL + '/CodeRallyWeb/WSAgentEndpoint/uncompressed';

	self.responseId = 0;
	self.socket = new WebSocket(connectionStr);

	self.socket.on('open', openHandler);
	self.socket.on('close', closeHandler);

	self.socket.on('message', function messageHandler(message, flags) {
		var command = agentUtil.extractCommand(message);

		switch (command) {
			case 'SET-CONNECTION-AGENT-RESPONSE':
				connectionHandler(message);
				break;

			case 'AGENT-LISTENER-API':
				apiHandler(message);
				break;

			default:
				if ((message == 'RACE-EVENT-START') || (message == 'RACE-EVENT-END')) {
					raceEventHandler(message);
				} else {
					console.error('Socket command not recognized');
					console.error(message);
				}
				break;
		}
	});

	// Handles initial connection to websocket agent endpoint
	function openHandler () {
		console.log('Connecting to websocket..');
		var message = 'SET-CONNECTION-AGENT'
			+ ' uuid:(' + agent_uuid + ') '
			+ ' circumstance:(FIRST_CONNECT) '
			+ ' last-reconnect-num:(-1) ';
		self.socket.send(message);
	}

	// Handles disconnection from websocket agent endpoint
	function closeHandler () {
		console.log('Disconnecting from websocket..');
	}

	// Handles messages entailing to the socket connection
	function connectionHandler (data) {
		console.log(data);
		var success = agentUtil.extractResult(data);
		if (success == 'false') {
			console.log('Try changing the agent_uuid to something else (random is fine)');
			self.socket.close();
			return;
		}
		self.socket.send('IDLE');
	}

	// Handles messages entailing to Agent-Listener-API
	function apiHandler (data) {
		var messageEvent = agentUtil.extractEvent(data);
		var messageJSON = JSON.parse(agentUtil.extractJSON(data));
		var apiResponse = 'AGENT-LISTENER-API-RESPONSE event:(' + messageEvent
			+') responseId:(' + self.responseId + ')';
		self.socket.send(apiResponse);
		self.responseId++;

		// Update our car
		(messageEvent == 'init')
			? self.ourCar.update(messageJSON.ourCarData)
			: self.ourCar.update(messageJSON.ourCar);

		switch(messageEvent) {
			case 'onTimeStep':
			case 'onRaceStart':
				self.emit(messageEvent, self.ourCar, self.race.id);
				break;
			case 'onOffTrack':
			case 'onCheckpointUpdated':
				self.emit(messageEvent, self.ourCar, messageJSON.checkpoint);
				break;
			case 'onStalled':
				self.emit(messageEvent, self.ourCar);
				break;
			case 'init':
				self.emit(messageEvent, self.ourCar, messageJSON.track);
				break;
			case 'onOpponentInProximity':
			case 'onCarCollision':
				self.emit(messageEvent, self.ourCar, messageJSON.otherCar);
				break;
			case 'onObstacleInProximity':
			case 'onObstacleCollision':
				self.emit(messageEvent, self.ourCar, messageJSON.obstacle);
				break;
			case 'default':
				console.log('Unrecognized event occurred ' + messageEvent);
				break;
		}
	}

	function raceEventHandler (data) {
		self.emit(data);
	}

	self.on('RACE-EVENT-START', function () {
		console.log('RACE #' + self.race.id + ' HAS BEGUN!');
	});

	self.on('RACE-EVENT-END', function () {
		console.log('RACE #' + self.race.id + ' HAS ENDED!');
		self.emit('onRaceEnd', self.race.id);
	});
};

Agent.prototype.push = function (event, json) {
	var self = this;
	var apiMessage = 'AGENT-LISTENER-API event:(' + event
			+ ') json:(' + JSON.stringify(json) + ')';
	self.socket.send(apiMessage);
}
