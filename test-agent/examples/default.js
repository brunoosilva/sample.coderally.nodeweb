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

var Agent = require('../index.js');
var AIUtils = Agent.AIUtils;

var myAgent = new Agent();

myAgent.enterRace({
	track_id : "13",
	username : "tom",
	user_id : "1",
	uniqueUserid : "",
	file_name : "Testcar",
	vehicle_type: "buggy_black",
	accel : "1",
	weight : "1",
	armor : "0",
	traction : "1",
	turning : "1",
	compressedDataStream: false
}, 'challenge-one.coderallycloud.com');

// Agent logic
myAgent.on('init', function (ourCar, track) {
	console.log('init occurred');
});

myAgent.on('onRaceStart', function (ourCar) {
	console.log("Race is starting");

	// Aggressive start
	var target = AIUtils.getClosestLane(ourCar.getCarStatus().getCheckPoint(), ourCar.getCarStatus().getPosition());
	ourCar.pushCarControl({
		carBrakePercent : 0,
		carAccelPercent : 100,
		carTarget : target
	})

});

myAgent.on('onCheckpointUpdated', function (ourCar, checkpoint) {
	var target = AIUtils.getClosestLane(ourCar.getCarStatus().getCheckPoint(), ourCar.getCarStatus().getPosition());
	ourCar.pushCarControl({
		carBrakePercent : 0,
		carAccelPercent : 100,
		carTarget : target
	});
	AIUtils.recalculateHeading(ourCar, 0.75);
});

myAgent.on('onStalled', function (ourCar) {
	AIUtils.recalculateHeading(ourCar, 1);
	ourCar.pushCarControl({
		carAccelPercent : 100,
		carBrakePercent : 0
	});
});

myAgent.on('onTimeStep', function (ourCar) {
	console.log("Position ", JSON.stringify(ourCar.getCarStatus().getPosition()));
	console.log("Lap ", JSON.stringify(ourCar.getCarStatus().getLap()));
	console.log("Place ", JSON.stringify(ourCar.getCarStatus().getPlace()));
	console.log("Acceleration ", JSON.stringify(ourCar.getCarStatus().getAcceleration()));
	console.log("Target ", JSON.stringify(ourCar.getCarStatus().getTarget()));
	console.log("Checkpoint ", JSON.stringify(ourCar.getCarStatus().getCheckPoint()));
	console.log(); // filler

	AIUtils.recalculateHeading(ourCar, 1);
});
