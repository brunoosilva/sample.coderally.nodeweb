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
