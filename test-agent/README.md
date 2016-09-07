# Code-Rally (Node.js Version) 

Want to learn or practice Node.js while having fun? Want to polish your knowledge of AIs and see the results first-hand? Then try the new Node.js package of IBM's Code Rally! Whether you are a complete Node Newbie, or an experienced Node veteran, test and hone your skills on the race track!

This repository is a portion of the Code Rally platform, used for building racing AIs and competing them against other developers in the cloud. The main purpose of this repository is to allow Node developers to construct their AIs in the language most familiar to them - JavaScript! It is supplemented by the Java-powered Code Rally server that powers the show and the Eclipse plugin which similarly lets developers build AIs using the Java language. 

For more information, see the <a target="_blank" href="https://www.ibm.com/developerworks/community/blogs/code-rally/entry/landing?lang=en">Offical Code Rally Blog</a>!

## Table of Contents

1. [Installation](#installation)
2. [Entering a Race](#entering-a-race)
3. [Implementing a Car AI](#implementing-a-car-ai)
4. [Examples](#examples)
5. [Contributing](#contributing)
6. [Other/Upcoming Features](#other-features)
7. [History](#history)

## Installation

There are two ways to get Code Rally (Node.js) running on your machine! Assuming that you have already <a target="_blank" href="https://nodejs.org/en/">Node.js</a> with NPM installed.

1. Use `npm install git+https://git@github.com/WASdev/sample.coderally.nodeclient.git` at your Node application directory. Then `require('coderally-agent')`. You'll currently have to use the github URL until we finish our npm publish process.

2. Clone this GitHub repository directly to your development directory. Then `require('./coderally-agent/index.js')`.

## Getting Started

### Entering a Race

	var Agent = require('coderally-agent');
	var myAgent = new Agent();

	...

	myAgent.enterRace({
		track_id : "0",
		username : "karan_challenge_na",
		user_id : "963",
		uniqueUserid : "116650285099720794308", // OPTIONAL IF OAUTH DISABLED ON SERVER
		file_name : "Testcar",
		vehicle_type: "car_yellow",
		accel : "1",
		weight : "1",
		armor : "0",
		traction : "0",
		turning : "1" 
	}, 'challenge-na.coderallycloud.com');

### Implementing a Car AI

	var AIUtils = Agent.AIUtils;

	...

	myAgent.on('onRaceStart', function (ourCar) {
		console.log("Race is starting");
		prevPosition = ourCar.getCarStatus().getPosition();

		// Aggressive start
		var target = AIUtils.getClosestLane(ourCar.getCarStatus().getCheckPoint(), ourCar.getCarStatus().getPosition());
		ourCar.pushCarControl({
			carBrakePercent : 0,
			carAccelPercent : 100,
			carTarget : target
		})

	});

### Examples

We have code examples at hand to show your sample AIs in the `examples` folder.

## Contributing

Currently contributed by IBM Canada's Node Enterprise Team with technical feedback and support by the Code Rally Team. Full credits for all support we've received can be seen below.

## Upcoming Features

### Interactive Code Editor

Written as an Express web application that utilizes this library. This feature allows you to write your code into the browser and enter your agent as a racer. Contains linting and allows for viewing logs during the race. Currently moved to a seperate repository that is undergoing open source process. Here are some previews:

![Authenticate](pictures/CodeRally1.PNG) ![Code Edit](pictures/CodeRally2.PNG)

### Video Viewing of Race

Implemented and awaiting some fixes. Once you finish a race we will forward you to a URL which will let you view a video of your race. Here's a sneak peak at this feature: 

![Race Video](pictures/CodeRally3.PNG)

### WebSocket compression

Will be included in next release, by using the Node's `zlib` library we were able to deflate and inflate the outgoing and incoming messages accordingly. This will allow us to minimize the size of the messages that are sent between the Node client and the Code Rally server through their WebSocket connection. 

## History

* [Jan 2016]
  - Project Kickoff!
  - Functional design drafted and approved
  - GitHub Repository Created

* [Feb 2016]
  - Implemented Code Rally Node Module structure
  - README.md v1.0.0
  - Entering race functionality implemented 
  - Websocket support for updating race car in realtime

* [Mar 2016]
  - Built interactive code editor
  - Added video viewing for race
  - Started implementation of WebSocket Compression

* [Apr 2016]
  - Build 1.0.0 is open sourced and released
  - Build 1.0.1 undergoing release process.

## Credits

Karan (S.) Randhawa, Kelvin Chan, Fady Abdel Malik, Ivy Ho, Jonathan West, Tom Banks, Steven Hung

## License

<pre>
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
</pre>
