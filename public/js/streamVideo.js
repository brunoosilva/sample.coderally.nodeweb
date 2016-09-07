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
function streamVideo(codeRallyWebURL, raceId, canvasID) {
  var host = window.location.hostname;
  var port = window.location.port;

  var socket = new WebSocket("ws://" + codeRallyWebURL + "/WSRaceStreamingEndpoint");
  var lastFrameReceived = 0;
  var limitedLerpArray = null;

  var damageArray = [];
  generateDamageArray(0, 100, damageArray);

  // The event here should be sufficient in checking whether 
  socket.onopen = function() {
      // Once the socket is open, send a message to the server to let it know what race_id to stream
      socket.send("STREAM-RACE " + raceId + " " + lastFrameReceived);
    } // end socket on open

  var isFirstMsg = true;
  var messageJSON;
  var frameList = [];
  var raceOver = [];
  raceOver.push(false);
  var imgRaceResults = new Image();

  socket.onmessage = function(msg) {
      if (msg.data.indexOf('RACE-NOT-FOUND') >= 0) {
        document.write("Race streaming with id " + raceId + " not found");
      }

      if (isFirstMsg) {
        var headerJSON = JSON.parse(msg.data);

        isFirstMsg = false;
        if (headerJSON['renderObjList'] != null) {
          var imageArray = [];
          var numImagesLoaded = 0;

          queueImageLoading(codeRallyWebURL, headerJSON, imageArray, numImagesLoaded, damageArray, frameList, raceOver, imgRaceResults);
        }

      } else {
        if (msg.data.indexOf('RACE-OVER') >= 0) {
          var RESULT_STRING = "results:";
          var resultIndex = msg.data.indexOf(RESULT_STRING);
          if (resultIndex > -1) {
            var len = RESULT_STRING.length;
            if (msg.data.length > (resultIndex + len)) {
              var resultString = msg.data.substring(resultIndex + len, msg.data.length);
              var resultJSON = JSON.parse(resultString.trim());
              generateRaceStatistics(resultJSON, imgRaceResults, raceOver);
            }
          }
        }

        // The first frameList can have multiple "pos"
        var frameJSON = JSON.parse(msg.data);
        var frameLen = frameJSON['frameList'].length;
        var LERP_AMOUNT = 4;

        for (var j = 0; j < frameLen; j++) {
          // Push first frame
          frameList.push(frameJSON['frameList'][j]);

          var originalPos = frameList[frameList.length - 1]["pos"];

          for (var lerp = 0; lerp < LERP_AMOUNT; lerp++) {
            var newArray = $.extend(true, [], frameList[frameList.length - 1]);
            var posLen = newArray["pos"].length;
            var prevFrames = frameList[frameList.length - 1];

            for (var k = 0; k < posLen; k++) {
              var prevX = prevFrames["pos"][k]["x"];
              var prevY = prevFrames["pos"][k]["y"];
              var prevRot = prevFrames["pos"][k]["rot"];

              // Do not interpolate the blimp (to avoid teleporting blimp)
              var distX = prevX - originalPos[k]["x"];
              var distY = prevY - originalPos[k]["y"];
              var dist = Math.sqrt(distX * distX) + Math.sqrt(distY * distY);

              if ((isLimitedLerpObject(k)) && dist > 100) {
                newArray["pos"][k]["x"] = originalPos[k]["x"];
                newArray["pos"][k]["y"] = originalPos[k]["y"];
                newArray["pos"][k]["rot"] = originalPos[k]["rot"];
                continue;
              }

              var lerpFrame = lerp;
              newArray["pos"][k]["x"] = ((originalPos[k]["x"] * lerpFrame) + (prevX * (LERP_AMOUNT - lerpFrame))) / LERP_AMOUNT;
              newArray["pos"][k]["y"] = ((originalPos[k]["y"] * lerpFrame) + (prevY * (LERP_AMOUNT - lerpFrame))) / LERP_AMOUNT;
              newArray["pos"][k]["rot"] = ((originalPos[k]["rot"] * lerpFrame) + (prevRot * (LERP_AMOUNT - lerpFrame))) / LERP_AMOUNT;

              //Avoid gimbal locking
              var updatedRot = newArray["pos"][k]["rot"];
              if (Math.abs(originalPos[k]["rot"] - prevRot) > 1) {
                if (originalPos[k]["rot"] < prevRot) {
                  updatedRot = (((originalPos[k]["rot"] + Math.PI * 2) * lerpFrame) + (prevRot * (LERP_AMOUNT - lerpFrame))) / LERP_AMOUNT;
                } else {
                  updatedRot = ((originalPos[k]["rot"] * lerpFrame) + ((prevRot + Math.PI * 2) * (LERP_AMOUNT - lerpFrame))) / LERP_AMOUNT;
                }
              }
              while (updatedRot > Math.PI * 2) { updatedRot -= Math.PI * 2; }
              while (updatedRot < 0) { updatedRot += Math.PI * 2; }

              newArray["pos"][k]["rot"] = updatedRot;
            } // end for pos

            frameList.push(newArray);

          } // end lerp for loop


        } // end iterating through the frames received 
      }

    } // end socket on message

  function generateRaceStatistics(resultJSON, imgRaceResults, raceOver) {
    var resultLen = resultJSON["results"].length;

    var RaceStatisticsQueue = [];

    for (var i = 0; i < resultLen; i++) {
      var name = resultJSON["results"][i]["name"];
      var place = resultJSON["results"][i]["place"];
      var time = generateRaceTimeString(resultJSON["results"][i]["time"]);

      RaceStatisticsQueue.push(new RaceStatistics(i, name, place, time));
    }

    RaceStatisticsQueue.sort(function(a, b) {
      var tempAPlace = a.getPlace();
      var tempBPlace = b.getPlace();

      // If the racer did not finish, the place will be -1. To ensure the compare works, set
      // the value to something very large
      if (tempAPlace < 0) {
        tempAPlace = 2000;
      }

      if (tempBPlace < 0) {
        tempBPlace = 2000;
      }

      var diff = tempAPlace - tempBPlace;
      return diff;
    });

    var tableCode = "";
    var len = RaceStatisticsQueue.length;
    for (var i = 0; i < len; i++) {

      var place = RaceStatisticsQueue[i].getPlace();
      if (place < 0) {
        place = "x";
      }

      tableCode += '<tr><td align="left">Racer: ' + RaceStatisticsQueue[i].getName() + '</td><td align="right">Place: ' + place + '</td></tr>';

      var tdCSS = ' class="special" ';
      if (i >= len - 1) {
        tdCSS = ' class="bottom" ';
      }

      tableCode += '<tr><td ' + tdCSS + ' align="center" colspan="2">[Race Time:' + RaceStatisticsQueue[i].getTime() + ']</td></tr>';
    }


    var data = '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">' +
      '<foreignObject width="100%" height="100%">' +
      '<style>' +
      'td.bottom {font-size:25px}' +
      'td.special {border-bottom:2px solid white; font-size:25px}' +
      'td {font-size:28px}' +
      'table {background:black; border:0; width:500px; font-sze:25px; font-family:Arial; color:#ffffff;}' +
      '</style>' +
      '<div xmlns="http://www.w3.org/1999/xhtml">' +
      '<table>' +
      tableCode +
      '</table>' +
      '</div>' +
      '</foreignObject>' +
      '</svg>';

    var DOMURL = window.URL || window.webkitURL || window;

    var svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    var urlImg = DOMURL.createObjectURL(svg);


    imgRaceResults.onload = function() {
      DOMURL.revokeObjectURL(urlImg);
      raceOver[0] = true;
    }
    imgRaceResults.src = urlImg;
  } // end function generateRaceStatistics

  function RaceStatistics(id, name, place, time) {
    this.id = id;
    this.name = name;
    this.place = place;
    this.time = time;

    this.getId = function() {
      return this.id;
    };

    this.getName = function() {
      return this.name;
    };

    this.getPlace = function() {
      return this.place;
    };

    this.getTime = function() {
      return this.time;
    };
  }

  function generateRaceTimeString(milliseconds) {
    var date = new Date(milliseconds);
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var ms = date.getMilliseconds();

    var result = "";
    if (m < 10) {
      result = "0" + m;
    } else {
      result = m;
    }

    result += ":";

    if (s < 10) {
      result += "0" + s;
    } else {
      result += s;
    }

    result += ":";

    if (ms < 10) {
      result += "00"
    } else if (ms < 100) {
      result += "0" + Math.round(ms / 10);
    } else {
      result += Math.round(ms / 10);
    }

    return result;
  }

  function isLimitedLerpObject(id) {
    if (limitedLerpArray == null) {
      limitedLerpArray = new Array();
      var objects = headerJSON['renderObjList'];
      if (objects != null) {
        for (var i = 0; i < objects.length; i++) {
          if (objects[i]["URL"].indexOf('blimp') > -1) {
            limitedLerpArray.push(true);
          } else {
            limitedLerpArray.push(false);
          }
        }
      }
    }
    return limitedLerpArray[id];
  } // end function isLimitedLerpObject

  function generateDamageArray(init, max, damageArray) {
    var colour = "green";

    var startR = 190;
    var startG = 0;
    var startB = 0;

    var endR = 0;
    var endG = 190;
    var endB = 0;

    var endFactor = (init / max);
    var startFactor = 1 - endFactor;

    if (startFactor < 0) { startFactor = 0; }
    if (endFactor < 0) { endFactor = 0; }
    if (startFactor > 1) { startFactor = 1; }
    if (endFactor > 1) { endFactor = 1; }

    var red = Math.floor(endR * endFactor + startR * startFactor);
    var green = Math.floor(endG * endFactor + startG * startFactor);
    var blue = Math.floor(endB * endFactor + startB * startFactor);

    var colour = "rgb(" + red + "," + green + "," + blue + ")";

    var data = "<svg xmlns='http://www.w3.org/2000/svg' width='30px' height='25px'>" +
      "<style>" +
      " table {background-color: " + colour + "}" +
      " td {text-align: center; font-size:10px; font-weight:bold; color:#ffffff; font-family:Arial; padding: 0px}" +
      "</style>" +
      "<foreignObject width='100%' height='100%'>" +
      "<div xmlns='http://www.w3.org/1999/xhtml'>" +
      "<table><tr><td>" + init + "%</td></tr></table>" +
      "</div>" +
      "</foreignObject>" +
      "</svg>";

    var DOMURL = self.URL || self.webkitURL || self;
    var img = new Image();
    var svg = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    var url = DOMURL.createObjectURL(svg);
    img.onload = function() {
      DOMURL.revokeObjectURL(url);
      if (init <= max) {
        damageArray.push(img);
        init = init + 1;
        generateDamageArray(init, max, damageArray);
      }
    };
    img.src = url;
  } // end function generateDamageArray



  function drawImageAdvanced(ctx, img, x, y, width, height, rad, opacity) {
    ctx.globalAlpha = opacity;

    //Set the origin to the center of the image
    ctx.translate(x, y);

    //Rotate the canvas around the origin
    ctx.rotate(rad);

    //draw the image    
    ctx.drawImage(img, width / 2 * (-1), height / 2 * (-1), width, height);

    //reset the canvas  
    ctx.rotate(rad * (-1));
    ctx.translate(x * (-1), y * (-1));

    // Reset the opacity to default
    ctx.globalAlpha = 1.0;
  }

  function queueImageLoading(codeRallyWebURL, headerJSON, imageArray, numImagesLoaded, damageArray, frameList, raceOver, imgRaceResults) {
    //alert("Got here");
    var currImage = new Image();
    currImage.src = "http://" + codeRallyWebURL + '/images' + headerJSON["renderObjList"][numImagesLoaded].URL;
    //alert(currImage.src);

    currImage.onload = function() {
      imageArray.push(currImage);
      numImagesLoaded = numImagesLoaded + 1;
      if (numImagesLoaded < headerJSON['renderObjList'].length) {
        queueImageLoading(codeRallyWebURL, headerJSON, imageArray, numImagesLoaded, damageArray, frameList, raceOver, imgRaceResults);

      } else {

        setTimeout(waitForFrameList, 1000);

        function waitForFrameList() {
          if (frameList.length <= 0) {
            setTimeout(waitForFrameList, 1000);
          } else {
            // Setup animation frame
            window.requestAnimFrame = (function(callback) {
              return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
                function(callback) {
                  // Change the delay here if you want slower time
                  window.setTimeout(callback, 0);
                };
            })(); // End requestAnimFrame


            var canvas = document.getElementById(canvasID);
            var context = canvas.getContext('2d');

            // Calling this method begins the animation
            setTimeout(function() {

              var startTime = (new Date()).getTime();
              var then = new Date().getTime();

              var json = [];
              var objs = headerJSON["renderObjList"];
              var overallScale = headerJSON["scale"];

              // We start on the last frame to begin rendering
              //alert("About to call aniate");
              var startFrame = frameList.length - 1;
              if (startFrame < 0) {
                startFrame = 0;
              }
              animate(imageArray, objs, overallScale, canvas, context, startFrame, raceOver, imgRaceResults);


            }, 100); // End setTimeout


            function animate(imageArray, objs, overallScale, canvas, context, frameCounter, raceOver, imgRaceResults) {

              var pos = frameList[frameCounter]['pos'];

              var posLen = pos.length;


              // default values
              var trackWidth = -1;
              var trackHeight = -1;
              var trackName = "";
              for (var i = 0; i < posLen; i++) {
                if (objs[i]["URL"].indexOf('track.jpg') > -1) {
                  trackWidth = imageArray[i].width;
                  trackHeight = imageArray[i].height;
                  trackName = objs[i]["URL"];
                  break;
                }
              }

              // Default scaling
              var scaleBrowserWindow = 1;
              var scaleBrowserWindowWidth = 1;
              var scaleBrowserWindowHeight = 1;

              // Redraw based on the canvas width to determine the scale
              scaleBrowserWindowWidth = canvas.width / trackWidth;
              scaleBrowserWindowHeight = canvas.height / trackHeight;

              if (scaleBrowserWindowWidth > scaleBrowserWindowHeight) {
                scaleBrowserWindow = scaleBrowserWindowHeight;
              } else {
                scaleBrowserWindow = scaleBrowserWindowWidth;
              }

              var timeBefore = new Date().getTime();

              for (var i = 0; i < posLen; i++) {
                var x = pos[i]["x"];
                var y = pos[i]["y"];
                var rot = pos[i]["rot"];
                var opacity = pos[i]["opacity"];

                var scale = 1;
                if (objs[i]["URL"].indexOf('track.jpg') > -1) {
                  // Scale is 1 for track
                } else {
                  scale = overallScale * objs[i]["scale"];
                }

                drawImageAdvanced(context, imageArray[i], Math.floor(x * scaleBrowserWindow), Math.floor(y * scaleBrowserWindow), Math.floor(imageArray[i].width * scale * scaleBrowserWindow), Math.floor(imageArray[i].height * scale * scaleBrowserWindow), rot, opacity);

                var user = pos[i]["username"];
                if (user != null && user != "ai" && opacity == 1) {
                  var metrics = context.measureText(user);

                  context.font = "bold 12px Arial";

                  // The default colour is black for all the tracks
                  var fontColour = "black";
                  if (trackName != null) {
                    if (trackName.indexOf("figure8") > -1) {
                      fontColour = "red";
                    } else if (trackName.indexOf("lowearthorbit") > -1 || trackName.indexOf("space") > -1) {
                      fontColour = "white";
                    }
                  }
                  context.fillStyle = fontColour;
                  context.textBaseline = "bottom";
                  context.fillText(user, Math.floor((x - 28) * scaleBrowserWindow), Math.floor((y - 25) * scaleBrowserWindow));
                }

                // Only display damage for vehicles that have a user associated with it
                if (user != null && opacity == 1) {
                  var damageIndex = pos[i]["damage"];
                  if (damageIndex != null) {
                    context.drawImage(damageArray[damageIndex], Math.floor((x - 25) * scaleBrowserWindow), Math.floor((y - 25) * scaleBrowserWindow), damageArray[damageIndex].width, damageArray[damageIndex].height);
                  }
                }
              }

              if ((frameCounter == frameList.length - 1) && raceOver[0] == true) {
                context.drawImage(imgRaceResults, Math.floor((trackWidth / 2 - imgRaceResults.width / 2) * scaleBrowserWindow), Math.floor((trackHeight / 2 - imgRaceResults.height / 2) * scaleBrowserWindow), imgRaceResults.width * scaleBrowserWindow, imgRaceResults.height * scaleBrowserWindow);
              }

              setTimeout(function() {
                requestAnimFrame(function() {
                  var nextFrame = frameCounter;
                  if (frameCounter < frameList.length - 1) {
                    // There are more frames to increment
                    nextFrame = nextFrame + 1;
                  }
                  animate(imageArray, objs, overallScale, canvas, context, nextFrame, raceOver, imgRaceResults);
                });
              }, 5);
            } // end setTimeout to animate
          } // end animate function   
        }
      } // End waitForFrameList function
    }
  };
} // end stream video function
