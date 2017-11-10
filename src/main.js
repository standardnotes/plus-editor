document.addEventListener("DOMContentLoaded", function(event) {

  var componentManager;
  var workingNote, clientData, lastValue;
  var editor;
  var ignoreTextChange = false;
  var initialLoad = true;

  function loadComponentManager() {
    var permissions = [{name: "stream-context-item"}]
    componentManager = new ComponentManager(permissions, function(){
      // on ready
    });

    componentManager.streamContextItem((note) => {
      onReceivedNote(note);
    });
  }

  function save() {
    if(workingNote) {
      lastValue = editor.getValue();
      workingNote.content.text = lastValue;
      workingNote.clientData = clientData;
      componentManager.saveItem(workingNote);
    }
  }

  function onReceivedNote(note) {
    workingNote = note;
    clientData = note.clientData;
    var newText = note.content.text;

    if(newText !== lastValue) {
      var summernote = $('#summernote');
      if(summernote) {
        ignoreTextChange = true;
        var isHtml = /<[a-z][\s\S]*>/i.test(newText);
        if(initialLoad && !isHtml) {
          newText = textToHTML(newText);
        }
        summernote.summernote('code', newText);
        ignoreTextChange = false;
      }
    }
  }

  function loadEditor() {
    $('#summernote').summernote({
      height: 500,                 // set editor height
      minHeight: null,             // set minimum height of editor
      maxHeight: null,             // set maximum height of editor
      focus: true,                  // set focus to editable area after initializing summernote
      callbacks: {
          onImageUpload: function (files) {
            alert("Until we can encrypt image files, uploads are not currently supported. We recommend using the Image button in the toolbar and copying an image URL instead.")
          }
      }
    });

    $('#summernote').summernote('fullscreen.toggle');

    // summernote.change
    $('#summernote').on('summernote.change', function(we, contents, $editable) {
      if(!ignoreTextChange) {
        save();
      }
    });
  }

  loadEditor();
  loadComponentManager();

  function textToHTML(text) {
    return ((text || "") + "").replace(/\t/g, "    ").replace(/\r\n|\r|\n/g, "<br />");
  }

});
