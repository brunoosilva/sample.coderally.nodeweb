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
 
'use strict';

// Private (Global within this module)
// Remeber, in Javascript, variable scope is defined within {}
var CarControl = require('./CarControl.js');
var Models = require('./models/models.js');

// Give handles to supporting classes in <Models> module
var CarAttributes = Models.CarAttributes;
var CarStatus = Models.CarStatus;

// Car Constructor
function Car (obj) {
	// Reference for <this> within constructor scope
	var self = this;

	// Private Fields
	var attributes = new CarAttributes(obj.carAttributes);	// CarAttribute object that holds configuration for defined car attributes
	var control = obj.carControl;							// CarControl object that controls the car	
	var status = null;										// CarStatus Object 
	var user;												// String value indicating the player's username, or AI

	// Public Getter/Setter functions that has access private fields (due to {} scope)
	// This makes it accessible to the global scope here
	self.getCarAttributes = function () {return attributes;}
	self.getCarStatus = function () {return status;}
	self.getCarUser = function () {return user;}
	
	//---------------------------------------------------------------------------------------------------
	// Public methods available to the Car object

	// Updates status of the car
	// Players need not to call this, since it is already called by the agent
	self.update = function (obj) {
		// Set carStatus to the latest CarStatus object sent from server
		// status = new CarStatus(obj);
		if (status == null) {
			status = new CarStatus(obj);
		} else {
			status.update(obj);
		}
	}

	// Get the current CarControl object to the Car object
	self.getCarControl = function() {
		return control;
	}

	// Set a CarControl object to the Car object, without pushing to server
	// If a CarControl objcet argument is supplied, that will also replace the Car object's previous car control
	// If an plain object is passed instead, the function will attempt to parse in the fields
	self.setCarControl = function(carControl) {
		control.setControl(carControl);
	}

	// Pushes the Car object's current car control to the server
	// If a CarControl objcet argument is supplied, that will also replace the Car object's previous car control
	// If an plain object is passed instead, the function will attempt to parse in the fields
	self.pushCarControl = function(carControl) {
		// If supplied with argument, try to create and set CarControl object
		if (typeof carControl != "undefined"){
			self.setCarControl(carControl);
		}

		control.emit('updateCarControl', self.getCarControl());
	}

};


//-----------------------------------------------------------------------------------

// Export the Car object
module.exports = Car;
