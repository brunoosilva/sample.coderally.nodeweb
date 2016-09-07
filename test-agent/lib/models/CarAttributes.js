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

// Private (Global within this module)
// Remeber, in Javascript, variable scope is defined within {}
const BASE_ACCELERATION = 20;	// Base acceleration for a car that invests no points, in MPH per second
const BASE_WEIGHT = 10000;		// Base weight for a car that invests no points, in newtons
const BASE_TURNING = 20;		// Base degrees of turning per second for a car that invests no points
const TRACTION_DIVISOR = 2;
const scale = 1.1249977; // Number.MIN_VALUE; // NOTE: DEPENDS ON TRACK'S SCALE, currently set to Desert 

// CarAttribute Constructor
function CarAttributes (obj) {
	// Reference for <this> within constructor scope
	var self = this;

	// Private Fields
	var attributes = {
		name: obj.name,
		acceleration: obj.acceleration,
		weight: obj.weight,
		armor: obj.armor,
		traction: obj.traction,
		turning: obj.turning
	};

	// Public Getter/Setter functions that has access private fields (due to {} scope)
	// This makes it accessible to the global scope here
	// Only allow reading, to prevent accidental change to information
	self.getName = function () {return attributes.name;}
	self.getAccelerationPoints = function () {return attributes.acceleration;}
	self.getWeightPoints = function () {return attributes.weight;}
	self.getArmorPoints = function () {return attributes.armor;}
	self.getTractionPoints = function () {return attributes.traction;}
	self.getTurningPoints = function () {return attributes.turning;}
	self.getAttributes = function () {return attribute;}

	// Public methods
	// Get the total amount of points between all attributes
	self.getTotalPoints = function () {
		return attributes.acceleration + attributes.weight + attributes.armor +
				attributes.traction + attributes.turning;
	}

	// Return the acceleration of the car, in MPH per second
	self.getAcceleration = function () {
		var multiplier = this.getAccelerationPoints() / this.getTotalPoints();
		return BASE_ACCELERATION * multiplier * scale;
	}

	self.getTurningDegrees = function () {
		var multiplier = self.getTurningPoints() / self.getTotalPoints() + 1;
		return BASE_TURNING * multiplier * scale;
	}
};


// Export the CarAttribute Object
module.exports = CarAttributes;