$(function(){
     window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
     if (SpeechRecognition) {
        var recognizer = new SpeechRecognition();

        recognizer.addEventListener('result', function(event) {
           console.log('Result', event);

           if ($("#todo > a").length == 0) {
              $("#todo").removeClass('hide');
           }

           for (var i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                  createTodoItem(event.results[i][0].transcript);
              }
           }
        });

        recognizer.addEventListener('nonmatch', function(event) {
           console.log('No match', event);
        });

        recognizer.addEventListener('error', function(event) {
           console.log('Error', event);
           document.getElementById('stop').classList.add('hide');
           recognizer.stop();
        });

        recognizer.addEventListener('end', function() {
           console.log('End', event);
           document.getElementById('stop').classList.add('hide');
        });
     }

     function createTodoItem(text) {
        var $iconDelete = $("<i>", {
            class: "material-icons right",
            text: "delete"
        }).on('click', function(){
            $(this).parent().remove();
            if ($("#todo > a").length == 0) {
                $("#todo").removeClass('hide');
            }
        });

        var $a = $("<a>", {
            href: "#",
            class: "todo_item collection-item",
            text: text
        });

        $a.append($iconDelete);

        $("#todo").append($a);
     };

    function startRecordVoice(){
        recognizer.lang = 'pt-BR';
        recognizer.continuous = true;
        recognizer.interimResults = true;

        try {
           recognizer.start();
           document.getElementById('stop').classList.remove('hide');
           console.log('Recognition started');
        } catch(e) {
            recognizer.stop();
           console.log('Recognition error: ' + e.message);
        }
    };

    $(window).keypress(function(event){
         event.preventDefault();

         if (event.which == 13)
            startRecordVoice();
    });

   ['click', 'touchstart'].forEach(function (e) {

      document.getElementById('stop').addEventListener(e, function() {
         recognizer.stop();
      }, false);

      document.getElementById('microphone').addEventListener(e, function() {
         startRecordVoice();
      }, false);

   })

});
