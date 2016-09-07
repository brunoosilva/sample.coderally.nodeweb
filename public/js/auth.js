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
var username = '';
var userId = 0;
var server = '';
$('#username-form button').on('click', function() {
  $('#username-form button').addClass('loading');
  username = $('#username-form input').val();
  server = $('#server-dd').val();

  $.ajax({
    url: 'http://' + server + '/CodeRallyWeb/GetUser',
    method: 'GET',
    dataType: 'JSON',
    data: {
      user_name: username
    },
    success: function(data) {
      if (data.success) {
        userId = data.user_id;
        $('#username-form button').addClass('positive');
        $('#username-form button').addClass('disabled');
        $('#username-form button').text('Success');
        $('#auth-next-btn').removeClass('disabled');
      }
      $('#username-form button').removeClass('loading');
    },
    error: function(err) {
      $('#username-form button').addClass('negative');
      $('#username-form button').text('Error');
      $('#username-form button').removeClass('loading');
    }
  });
});

$("#server").on('click', function() {
  $("#username").attr("disabled", true);
  $("#username").val("");

  $("#auth-button").addClass('disabled');
  $("#auth-button").removeClass('positive');
  $("#auth-button").removeClass('negative');
  $("#auth-button").text('Authenticate');

  $("#server-connection").removeClass('positive');
  $("#server-connection").text('Check server connection');
});

$("#server-connection").on('click', function() {
  $("#username").attr("disabled", false);
  $("#auth-button").removeClass('disabled');

  $("#server-connection").addClass('positive');
  $("#server-connection").text('Success');
});

$("#username").on('click', function() {
  $("#auth-button").removeClass('positive');
  $("#auth-button").removeClass('negative');
  $("#auth-button").text('Authenticate');
});
