(function(root) {

  var tones = {};

  function loadHangoutTones() {
    var tonesUrls = {
      '0': 'http://s3.amazonaws.com/trx.public/dtmf/0.wav',
      '1': 'http://s3.amazonaws.com/trx.public/dtmf/1.wav',
      '2': 'http://s3.amazonaws.com/trx.public/dtmf/2.wav',
      '3': 'http://s3.amazonaws.com/trx.public/dtmf/3.wav',
      '4': 'http://s3.amazonaws.com/trx.public/dtmf/4.wav',
      '5': 'http://s3.amazonaws.com/trx.public/dtmf/5.wav',
      '6': 'http://s3.amazonaws.com/trx.public/dtmf/6.wav',
      '7': 'http://s3.amazonaws.com/trx.public/dtmf/7.wav',
      '8': 'http://s3.amazonaws.com/trx.public/dtmf/8.wav',
      '9': 'http://s3.amazonaws.com/trx.public/dtmf/9.wav',
      's': 'http://s3.amazonaws.com/trx.public/dtmf/s.wav',
      'p': 'http://s3.amazonaws.com/trx.public/dtmf/p.wav'
    };
    console.log('loading tones');
    console.log(tonesUrls);
    $.each(tonesUrls, function(tone, uri) {
    //console.log(arguments);
      tones[tone] = gapi.hangout.av.effects.createAudioResource(uri).createSound({
        localOnly: false
      });
    });
  }

  function loadWebAudioTones() {
    
    var context = new webkitAudioContext();
    function ToneGenerator(hz) {
      var me = this;
      this.context = context;
      this.node = this.context.createJavaScriptNode(2048, 1, 1);
      this.hz = hz;
      this.sine = 0;

      this.node.onaudioprocess = function(event) {
        var audioBuffer = event.outputBuffer,
            data = audioBuffer.getChannelData(0),
            // data length will be same as node buffer
            len = data.length,
            idx = 0,
            sampleFreq;

        // debug vals
        // console.log( data, data.length, p );
        sampleFreq = 2 * Math.PI * me.hz / audioBuffer.sampleRate;

        for (; idx < len; idx++) {
            // Float32Array values with sine-tone value
            data[idx] = Math.sin(sampleFreq * me.sine++);
        }
      };
    }

    ToneGenerator.prototype = {
      play: function() {
        console.log('Playing');
        console.log(this.hz);
        this.node.connect(this.context.destination);
      },
      pause: function() {
        this.node.disconnect();  
      }
    };

    var horizontalDTMFTones = [1209, 1336, 1477];
    var verticalDTMFTones = [697, 770, 852, 941];
    var ten = 'p', eleven = '0', tweleve = 's';
    var count = 1;
    verticalDTMFTones.forEach(function(Vhz, vidx) {
      horizontalDTMFTones.forEach(function(Hhz, hidx) {
        var sound = (function() {
          var vGen = new ToneGenerator(Vhz);
          var hGen = new ToneGenerator(Hhz);
          return  {
            isPlaying: false,
            stop: function() {
              vGen.pause();
              hGen.pause();
              this.isPlaying = false;
            },
            play: function() {
              vGen.play();
              hGen.play();
              this.isPlaying = true;
            }
          };
        }());

        if(count === 10) {
          tones[ten] = sound;  
        } else if (count === 11) {
          tones[eleven] = sound;
        } else if (count === 12) {
          tones[tweleve] = sound;  
        } else {
          tones[count+''] = sound;  
        }

        count++;

      });
    });
  }

  function dialNumber(number, cb) {
    cb = cb || function() {};
    if(number === '*') {
      number = 's';
    } else if(number === '#') {
      number = 'p'; 
    }
    console.log('playing tone');
    
    var tone = tones[number+''] || {play:function(){}, stop: function(){}};

    tone.play({
      localOnly: false,
      loop:false
    });
    setTimeout(function() {
      tone.stop();
      cb();
    }, 750);
  }
  
  function dialNumbers(numbers, cb) {
    var stack = numbers.split('').reverse();
    var number = null;
    isDialing = true;
    
    function nextNumber() {
      var number = stack.pop();
      if(number && isDialing) {
        dialNumber(number, nextNumber);  
      } else {
        isDialing = false;  
        cb();
      }
    }

    dialNumber(stack.pop(), nextNumber);
  }

  function renderHistory(history) {
    var his = $('ul');
    his.empty();
    history.forEach(function(num) {
      var $ele = $('<li>').text(num);
      his.append($ele);
    });
  }

  function getNumberHistory() {
    var n = localStorage.getItem('dtmfNumbers');
    if(n) {
      return JSON.parse(n);  
    } else {
      return [];  
    }
  }

  function pushNumberHistory(numbers) {
    var history = localStorage.getItem('dtmfNumbers');
    var out = [];

    if(history) {
      history = JSON.parse(history);  
    } else {
      history = [];
    }

    history.forEach(function(num) {
      if(num !== numbers) {
        out.push(num);  
      }  
    });

    out.unshift(numbers);
    if(out.length > 10) {
      out.pop();  
    }
    
    localStorage.setItem('dtmfNumbers', JSON.stringify(out));
    return out;
  }

  function makeCall() {
    var numbers = document.getElementById('number').value;
    var form = document.getElementById('numberForm');
    if(numbers) {
      numbers = numbers.trim();  

      dialNumbers(numbers, function() {
        console.log('done');  
      });

      renderHistory(pushNumberHistory(numbers));
    }
  }

  function startApp() {
    
    $('form').on('submit', function(e) {
      console.log('formSubmitted');
      makeCall();
      e.preventDefault();
    });
    $('.button').on('click', function() {
      var $ele = $(this).find('.number');
      if($ele.length) {
        dialNumber($ele.text());  
      }
    });

    $('ul').delegate('li', 'click', function() {
      var number = $(this).text();
      $('#number').val(number);
    });
    renderHistory(getNumberHistory());
  }

  if('gapi' in root && 'util' in gapi) {
    gadgets.util.registerOnLoadHandler(function() {
      gapi.hangout.onApiReady.add(function() {
        console.log('starting app');
        loadHangoutTones();
        startApp();  
      });    
    }); 
  } else {
    $(function() {
      loadWebAudioTones();
      startApp();
    });
  }

}(window));
