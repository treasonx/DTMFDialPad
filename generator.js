    var // create a new audio api context
    context = new webkitAudioContext(),

        // create a buffer with 1 input and 1 output
        // 256, 512, 1024, 2048, 4096, 8192, 16384
        // This value controls how frequently the onaudioprocess event 
        // handler is called and how many sample-frames need to be processed each call
        node = context.createJavaScriptNode(2048, 1, 1),

        // setup controls object
        controller = {
            hz: 0,
            freq: function() {
                controller.hz = document.getElementById("freq").value;
            },
            play: function() {
                controller.freq();
                node.connect(context.destination);
            },
            pause: function() {
                node.disconnect();
            }
        },
        // sine-tone value
        sine = 0;

    // NOTE: node does not implement addEventListener?
    // TODO: wrap in deferred? methodize?
    node.onaudioprocess = function(event) {

        var audioBuffer = event.outputBuffer,
            data = audioBuffer.getChannelData(0),
            // data length will be same as node buffer
            len = data.length,
            idx = 0,
            sampleFreq;

        // debug vals
        // console.log( data, data.length, p );
        sampleFreq = 2 * Math.PI * controller.hz / audioBuffer.sampleRate;


        for (; idx < len; idx++) {
            // Float32Array values with sine-tone value
            data[idx] = Math.sin(sampleFreq * sine++);

            // TODO: make possible switching between:
            //  sin, tan
        }
    };


    // Event Setup
    // button events for controlling tone play
    [].forEach.call(document.querySelectorAll("button"), function(button) {

        // Button labels are same as `controller` property methods for demo
        button.addEventListener("click", controller[button.innerHTML.toLowerCase()], false);

    });

    // frequency events
    document.getElementById("freq").addEventListener("input", controller.freq, false);
