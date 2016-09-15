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
 
var _ = require('lodash');
// CarStatus Constructor
// Create new object with access to related methods
// Pass in JSON object extracted from server response
function CarStatus(obj) {
	// Reference for <this> within constructor scope
	var self = this;

	// Private Fields
	var status = {
		position: obj.position,
		rotation: obj.rotation,
		acceleration: obj.acceleration,
		checkpoint: obj.checkpoint,
		carBody: obj.carBody,
		lap: obj.lap,
		place: obj.place,
		damage: obj.damage,
		destroyed: obj.destroyed,
		target: obj.target
	};

	// Public Getter/Setter functions that has access private fields (due to {} scope)
	// This makes it accessible to the global scope here
	// Only allow reading here, to prevent accidental change to information
	self.getPosition = function () {return status.position;}			// Vec2 object indicating current car position
	self.getRotation = function () {return status.rotation;}			// Rotation object with angular value in radians
	self.getAcceleration = function () {return status.acceleration;}	// acceleration in MPH per second
	self.getCheckPoint = function () {return status.checkpoint;}		// CheckPoint object indicating current car's checkpoint
	self.getCarBody = function () {return status.carBody;}				// CarBody object indicating current car body's heading
	self.getLap = function () {return status.lap;}						// Integer value indicating the lap number that the car is currently on
	self.getPlace = function () {return status.place;}					// Integer value indicating current race place to others
	self.getDamage = function () {return status.damage;}				// Integer value of accumulated damage
	self.isDestroyed = function () {return status.destroyed;}			// Boolean value indicating destroyed status
	self.getTarget = function () {return status.target;}				// Vec2 object indicating target position that the car is heading towards
	self.getStatus = function () {return status;}

	self.update = function (obj) {
		_.merge(status, obj);
	}
};

// Export the CarStatus object
module.exports = CarStatus;