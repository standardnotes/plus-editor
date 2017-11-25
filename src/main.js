document.addEventListener("DOMContentLoaded", function(event) {

  var componentManager;
  var workingNote, clientData;
  var lastValue, lastUUID;
  var editor;
  var ignoreTextChange = false;
  var newNoteLoad = true, didToggleFullScreen = false;

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
      lastValue = $('#summernote').summernote('code');
      workingNote.content.text = lastValue;
      workingNote.clientData = clientData;
      componentManager.saveItem(workingNote);
    }
  }

  function onReceivedNote(note) {
    if(note.uuid !== lastUUID) {
      // Note changed, reset last values
      lastValue = null;
      newNoteLoad = true;
      lastUUID = note.uuid;
    }

    workingNote = note;

    // Only update UI on non-metadata updates.
    if(note.isMetadataUpdate) {
      return;
    }

    clientData = note.clientData;
    var newText = note.content.text;

    if(newText == lastValue) {
      return;
    }

    var summernote = $('#summernote');
    if(summernote) {
      ignoreTextChange = true;
      var isHtml = /<[a-z][\s\S]*>/i.test(newText);

      if(!didToggleFullScreen) {
        $('#summernote').summernote('fullscreen.toggle');
        didToggleFullScreen = true;
      }

      if(newNoteLoad && !isHtml) {
        newText = textToHTML(newText);
      }

      summernote.summernote('code', newText);

      ignoreTextChange = false;
      newNoteLoad = false;
    }
  }

  function loadEditor() {
    $('#summernote').summernote({
      height: 500,                 // set editor height
      minHeight: null,             // set minimum height of editor
      maxHeight: null,             // set maximum height of editor
      focus: true,                  // set focus to editable area after initializing summernote
      callbacks: {
        onInit: function() {},
        onImageUpload: function (files) {
          alert("Until we can encrypt image files, uploads are not currently supported. We recommend using the Image button in the toolbar and copying an image URL instead.")
        }
      }
    });

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
