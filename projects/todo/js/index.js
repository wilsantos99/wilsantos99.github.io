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
              } else {
                  createTodoItem(event.results[i][0].transcript);
              }
           }
        });

        recognizer.addEventListener('error', function(event) {
           console.log('Error', event);
        });

        recognizer.addEventListener('end', function() {
           console.log('End', event);
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

    $("#microphone").on('click', function(){
        recognizer.lang = 'pt-BR';
        recognizer.continuous = true;
        recognizer.interimResults = false;
        try {
           recognizer.start();
           console.log('Recognition started');

           setTimeout(function(){
              recognizer.stop();
           }, 3000);
        } catch(e) {
           console.log('Recognition error: ' + e.message);
        }
    })
});
