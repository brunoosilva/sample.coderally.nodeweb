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

var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var util = require('util');

// CarControl Constructor
function CarControl (obj) {
	// Reference for <this> within constructor scope
	var self = this;

	// Private fields
	// Default Control
	var control = {
		carTarget: {
			x: 0,
			y: 0
		},
		carAccelPercent: 0,
		carBrakePercent: 0
	};
	// Let user override their own Control
	control = _.merge(control,
		_.pick(obj, ["carTarget", "carAccelPercent", "carBrakePercent"]));

	// Public Getter/Setter functions that has access private fields (due to {} scope)
	// This makes it accessible to the global scope here
	self.getCarTarget = function () {return control.carTarget;}
	self.getBrakePercent = function () {return control.carBrakePercent;}
	self.getAccelerationPercent = function () {return control.carAccelPercent;}
	self.getControl = function () {return control;}

	self.setCarTarget = function (carTarget) {
		control.carTarget = carTarget;
	}

	self.setBrakePercent = function (brakePercent) {
		control.carBrakePercent = brakePercent/100;
	}

	self.setAccelerationPercent = function (accelPercent) {
		control.carAccelPercent = accelPercent/100;
	}

	self.setControl = function (obj) {
		control = _.merge(control,
			_.pick(obj, ["carTarget", "carAccelPercent", "carBrakePercent"]));
	}

	EventEmitter.call(this);
};

util.inherits(CarControl, EventEmitter);

// Export the CarAttribute Object
module.exports = CarControl;
