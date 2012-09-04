# DTMF Dial Pad

This project is a simple touch tone dial pad which is written to run in two environments. I wrote this for one simple reason, google hangouts doesnt allow you to playback DTMF tones when making a call. This makes it a little difficult to dial into a conference bridge when in a good hangout. 

1) WebKit Browser
2) Google Hangout

## Webkit

The webkit version uses pure Web Audio api to generate the tones. This was my first attempt but it failed in the google hangout environment. I couldnt find an easy way to play the tones into the hangout without losing quality. I thought it was pretty cool so I kept the functionality for use in developing the gadget outside of the hangout.

## Google Hangout

Threw this together one sunday afternoon to help with conference bridges. Works most of the time. Still not the best way to transmit DTMF tones over VoIP but it gets the job done if everyone stays quiet while dialing.




