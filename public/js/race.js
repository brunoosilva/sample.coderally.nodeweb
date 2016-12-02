// click on race play button
$('#upload-next-btn').on('click', function() {
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
  
  var raceVideoStreamUrl = "/CodeRallyWeb/racevideostream.html?race_id=";

  socket.on('race-start', function(raceID) {
    $('#race-wait').css('display', 'none');
    $('#race-start-btn').css('display', 'block');
    $('#start-race').removeClass('disabled');
    $('#start-race').on('click', function() {
      window.open("http://" + server + raceVideoStreamUrl +
        raceID, '_blank');
    });
  });

  socket.on('race-update', function(msg) {
    $('#place').text(msg.place);
    $('#lap').text(msg.lap);
    if (count === 300) {
      // only append a log message every 300 messages
      $('#log-seg .ui.list').prepend('<div class="item">' +
        JSON.stringify(msg) + '</div>');
      count = 0;
    }
    count++;
  });

  socket.on('race-end', function(raceID) {
    raceVideoStreamUrl = "/CodeRallyWeb/racevideo.html?race_id=";
    $('#log-seg .ui.list').prepend('<div class="item">The race has ended</div>');
    setTimeout(function() {
      window.open("http://" + server +
        "/CodeRallyWeb/racevideo.html?race_id=" + raceID, '_blank');
    }, 20000);
  });
});
