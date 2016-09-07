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
var selectedTrackID = '';
var selectedTrackImg = '';

// on click of track choice
$('#track-table td img').on('click', function() {
  $('#select-next-btn').addClass('disabled');

  $('#car-table td img').removeClass('selected-vehicle');
  $('#track-table td img').removeClass('selected-track');
  $(this).addClass('selected-track');

  selectedTrackID = $(this).data('track-id');
  selectedTrackImg = $(this).attr('src');

  $('#track-img').attr({ 'src': selectedTrackImg });

  $.ajax({
    url: '/route',
    method: 'GET',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: {
      id: selectedTrackID
    },
    success: function(data) {
      var length = data.object.vehicles.length;
      var images = [];
      var vehicleInfoDir = [];

      for (var i = 0; i < length; i++) {
        images[i] = data.object.vehicles[i].imageDir;
        vehicleInfoDir[i] = data.object.vehicles[i].vehicleInfoDir;
      }

      if (selectedTrackID == 'sky' || selectedTrackID == 'space') {
        document.getElementById("img1").src = images[0];
        document.getElementById("img1").alt = vehicleInfoDir[0];
        document.getElementById("img1").title = JSON.stringify(data.info[0]);

        document.getElementById("img2").src = images[1];
        document.getElementById("img2").alt = vehicleInfoDir[1];
        document.getElementById("img2").title = JSON.stringify(data.info[1]);

        document.getElementById("img3").src = images[2];
        document.getElementById("img3").alt = vehicleInfoDir[2];
        document.getElementById("img3").title = JSON.stringify(data.info[2]);

        document.getElementById("img4").src = images[3];
        document.getElementById("img4").alt = vehicleInfoDir[3];
        document.getElementById("img4").title = JSON.stringify(data.info[3]);

        document.getElementById("img5").src = images[4];
        document.getElementById("img5").alt = vehicleInfoDir[4];
        document.getElementById("img5").title = JSON.stringify(data.info[4]);

        document.getElementById("img6").src = images[5];
        document.getElementById("img6").alt = vehicleInfoDir[5];
        document.getElementById("img6").title = JSON.stringify(data.info[5]);

        document.getElementById('img7').src = 'vehicles/white-background.png';
        document.getElementById("img7").title = JSON.stringify(data.info[6]);
      } else {
        document.getElementById("img1").src = images[0];
        document.getElementById("img1").alt = vehicleInfoDir[0];
        document.getElementById("img1").title = JSON.stringify(data.info[0]);

        document.getElementById("img2").src = images[1];
        document.getElementById("img2").alt = vehicleInfoDir[1];
        document.getElementById("img2").title = JSON.stringify(data.info[1]);

        document.getElementById("img3").src = images[2];
        document.getElementById("img3").alt = vehicleInfoDir[2];
        document.getElementById("img3").title = JSON.stringify(data.info[2]);

        document.getElementById("img4").src = images[3];
        document.getElementById("img4").alt = vehicleInfoDir[3];
        document.getElementById("img4").title = JSON.stringify(data.info[3]);

        document.getElementById("img5").src = images[4];
        document.getElementById("img5").alt = vehicleInfoDir[4];
        document.getElementById("img5").title = JSON.stringify(data.info[4]);

        document.getElementById("img6").src = images[5];
        document.getElementById("img6").alt = vehicleInfoDir[5];
        document.getElementById("img6").title = JSON.stringify(data.info[5]);

        document.getElementById("img7").src = images[6];
        document.getElementById("img7").alt = vehicleInfoDir[6];
        document.getElementById("img7").title = JSON.stringify(data.info[6]);
      }

      $("#car-select").css("display", "block");
      $("#car-table").css("display", "block");
    },
    error: function(err) {
      console.log(err);
    }
  });
});

// click on car 
$('#car-table td img').on('click', function() {
  $('#car-table td img').removeClass('selected-vehicle');
  $(this).addClass('selected-vehicle');

  var dirPath = './public/js';
  var selectedVehicleTitle = $(this).attr('title');
  var downloadLink = $(this).attr('alt');
  var selectedVehicleImg = $(this).attr('src');

  $('#ride-img').attr({ 'src': selectedVehicleImg });

  editor_js.session.setValue(selectedVehicleTitle);

  // prettify code inside
  var val = editor_js.session.getValue();
  var o = JSON.parse(val);
  val = JSON.stringify(o, null, 4);
  editor_js.setValue(val);
  $('#select-next-btn').removeClass('disabled');
});

// click on going to the code page
$('#code-next-btn').on('click', function() {
  editor_result.setValue(editor_js.getValue());
  $('#user-summary').text(username);
});

// click on the editor
$('#editor').on('click', function() {
  $('#success-copy').css('display', 'none');
});

// click on copy code
$('#copy-code-btn').on('click', function() {
  var curr = editor_js.getValue();
  editor_js.setValue(curr);
  window.editor_js.focus();
  document.execCommand('copy');
  $('#success-copy').css('display', 'block');
});

// click on race play button
$('#race-play-btn').on('click', function() {
  $('#race-seg').fadeOut('fast', function() {
    $('#log-seg').fadeIn('slow');
  });
  $('#videoStreamCanvas').css('display', 'block');
  $('#videoStreamCanvas').css('width', '800');
  $('#videoStreamCanvas').css('height', '500');

  var socket = io();
  var count = 0;
  var trackId = '';

  if (selectedTrackID == 'figure8')
    trackId = 0
  else if (selectedTrackID == 'sky')
    trackId = 1
  else if (selectedTrackID == 'pond')
    trackId = 2
  else if (selectedTrackID == 'desk')
    trackId = 3
  else if (selectedTrackID == 'space')
    trackId = 4
  else if (selectedTrackID == 'circuit')
    trackId = 5
  else if (selectedTrackID == 'water')
    trackId = 12
  else if (selectedTrackID == 'desert')
    trackId = 13
  else if (selectedTrackID == 'lowearthorbit')
    trackId = 14

  var selectedVehicleTitle = editor_js.getValue();
  var vehicle = JSON.parse(editor_js.getValue());

  socket.emit('user-setup', {
    username: username,
    trackId: trackId,
    userId: userId,
    vehicleOptions: selectedVehicleTitle,
    server: server
  });

  socket.on('race-start', function(raceID) {
    $('#start-race').removeClass('disabled');
    $('#start-race').on('click', function() {
      window.open('videoStream.html?=' + raceID + "&" + server, '_blank');
    });
  });

  socket.on('race-update', function(msg) {
    $('#place').text(msg.place);
    $('#lap').text(msg.lap);
    if (count === 300) {
      // only append a log message every 300 messages
      $('#log-seg .ui.list').prepend('<div class="item">' + JSON.stringify(msg) + '</div>');
      count = 0;
    }
    count++;
  });

  socket.on('race-end', function(raceID) {
    $('#log-seg .ui.list').prepend('<div class="item">The race has ended</div>');
    setTimeout(function() {
      window.location.replace("http://" + server + "/CodeRallyWeb/racevideo.html?race_id=" + raceID);
    }, 20000);
  });
});
