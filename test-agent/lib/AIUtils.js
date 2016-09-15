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
 
var math = require('mathjs');

exports.getClosestLane = function (checkpoint, pos) {
	var checkpoint_center = getCenter(checkpoint);
	var start_mid = getMidpoint(checkpoint_center, checkpoint.start);
	var end_mid = getMidpoint(checkpoint_center, checkpoint.end);

	return getDistanceSquared(pos, start_mid) > getDistanceSquared(pos, end_mid)
		? start_mid
		: end_mid;
}

exports.getAlternativeLane = function (checkpoint, pos) {
	var checkpoint_center = getCenter(checkpoint);
	var start_mid = getMidpoint(checkpoint_center, checkpoint.start);
	var end_mid = getMidpoint(checkpoint_center, checkpoint.end);

	if (getDistanceSquared(pos, end_mid) < getDistanceSquared(pos, start_mid)) {
		if (getDistanceSquared(pos, checkpoint_center) < getDistanceSquared(pos, end_mid)) {
			return checkpoint_center;
		} else {
			return start_mid;
		}
	} else if (getDistanceSquared(pos, checkpoint_center) < getDistanceSquared(pos, start_mid)) {
		return checkpoint_center;
	} else { 
		return end_mid;
	}
}

exports.recalculateHeading = function (car, bias) {
	var target = car.getCarControl().getCarTarget();

	// Predicts how far the car can turn in 1 second
	var turn = math.abs(calculateHeading(car, target));
	var degreesPerSecond = car.getCarAttributes().getTurningDegrees();

	var distance = getDistance(car.getCarStatus().getPosition(), target);
	var vel = car.getCarStatus().getCarBody().velocity;
	var vel_magnitude = math.sqrt(math.pow(vel.x, 2) + math.pow(vel.y, 2));
	var accel = car.getCarStatus().getAcceleration();
	var accel_magnitude = math.sqrt(math.pow(accel.x, 2) + math.pow(accel.y, 2));

	var predictedVelocity = math.pow(math.sqrt(vel_magnitude) + math.sqrt(accel_magnitude), 2);
	var seconds = distance / (predictedVelocity * 5280 / 3600);
	seconds = seconds * bias;

	var predictedTurn = degreesPerSecond * seconds;

	var control = {};
	if (predictedTurn * 7 < turn) {
		control.carBrakePercent = 100;
		control.carAccelPercent = 0;
	} else if (predictedTurn * 6 < turn) {
		control.carBrakePercent = 80;
		control.carAccelPercent = 0;
	} else if (predictedTurn * 5 < turn) {
		control.carBrakePercent = 60;
	} else if (predictedTurn * 4 < turn) {
		control.carBrakePercent = 40;
		control.carAccelPercent = 0;
	} else if (predictedTurn * 3 < turn) {
		control.carAccelPercent = 20;
		control.carBrakePercent = 0;
	} else if (predictedTurn * 2 < turn) {
		control.carAccelPercent = 20;
		control.carBrakePercent = 0;
	} else if (predictedTurn * 1.5 < turn) {
		control.carAccelPercent = 50;
		control.carBrakePercent = 0;
	} else if (predictedTurn < turn) {
		control.carAccelPercent = 70;
		car.carBrakePercent = 0;
	} else {
		car.carAccelPercent = 100;
		car.carBrakePercent = 0;
	}

	car.pushCarControl(control);
}

exports.getIntersectionPoint = function (checkpoint, rotation, point) {
	var threshold = getDistance(checkpoint.start, checkpoint.end) / 2 + 10;
	return getIntersectionPointWithThreshold(checkpoint, rotation, point, threshold);
};

exports.getDistanceSquared = getDistanceSquared;

// Helper functions
function getCenter(checkpoint) {
	var start = checkpoint.start;
	var end = checkpoint.end;

	return getMidpoint(start, end);
}

function getMidpoint(pointA, pointB) {
	return {
		x : ((pointA.x + pointB.x) / 2),
		y : ((pointA.y + pointB.y) / 2)
	}
}

function getDistance(position, point) {
	return math.sqrt(getDistanceSquared(position, point));
}

function getDistanceSquared(position, point) {
	var a = ((position.x - point.x) * (position.x - point.x))
	var b = ((position.y - point.y) * (position.y - point.y));
	return a + b;
}

function calculateHeading(car, point) {
	var position = car.getCarStatus().getPosition();

	var desired_heading = (getHeadingTo(position, point) + 90) % 360;
	var current_heading = car.getCarStatus().getRotation();

	var degrees = desired_heading - current_heading;

	if (degrees > 180) {
		degrees -= 360;
	} else if (degrees < -180) {
		degrees += 360
	}

	return degrees;
}

function getHeadingTo(pointA, pointB) {
	var radians = math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
	var heading_in_rad = math.unit(radians, 'rad');
	var heading_in_deg = heading_in_rad.toNumber('deg');

	if (heading_in_deg < 0) {
		heading_in_deg += 360;
	}

	return heading_in_deg;
}

function getIntersectionPointWithThreshold(checkpoint, rotation, point, threshold) {
	var rotation_in_radians = rotation.radians;

	var o2x = math.cos(rotation_in_radians) * 100;
	var o2y = math.sin(rotation_in_radians) * 100;

	var thisLine = {
		start : {
			x : checkpoint.start.x,
			y : checkpoint.start.y
		},
		end : {
			x : checkpoint.end.x,
			y : checkpoint.end.y
		}
	};
	var otherLine = {
		start : {
			x : point.x,
			y : point.y
		},
		end : {
			x : o2x,
			y : o2y
		}
	};

	var result = intersection(thisLine, otherLine);

	if (getDistanceSquared(result, getCenter(checkpoint)) > math.pow(threshold, 2)) {
		return getCenter(checkpoint);
	}

	return result;
}

function intersection(lineA, lineB) {
	return math.intersect(
		[lineA.start.x, lineA.start.y],
		[lineA.end.x, lineA.end.y],
		[lineB.start.x, lineB.start.y],
		[lineB.end.x, lineB.end.y]
	);
}