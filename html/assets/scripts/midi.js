// prepare svg object for later use
var keyboard = document.getElementById("piano");
var svgDoc; // loaded keyboard svg
const keysB = [2,5,7,10,12,14,17,19,22,24,26,29,31,34,36,38,41,43,46,48,50,53,55,58,60,62,65,67,70,72,74,77,79,82,84,86]
const keyTo = {}

window.addEventListener("load", function() {
    svgDoc = keyboard.contentDocument;
    console.log("image loaded");
}, false)

// press or unpress keyboard button
function setKeyState(note, state) {
    let key = svgDoc.getElementById(String(note));
    console.log(key);
    if (state) {
        key.style.fill = "red";
    } else if (keysB.includes(note)) {
        key.style.fill = "black";
    } else {
        key.style.fill = "white";
    }
}


// Check if browser supports MIDI
if (navigator.requestMIDIAccess) {
    console.log('This browser supports WebMIDI!');
} else {
    console.log('WebMIDI is not supported in this browser.');
}


// Attempt to establish a connection to the MIDI device
navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    console.log(midiAccess);

    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

function getMIDIMessage(midiMessage) {
    var command  = midiMessage.data[0];
    var note     = midiMessage.data[1] - 20; // sorry midi standard
    var velocity = (midiMessage.data.length > 2) ? midiMessage.data[2] : 0;
    
    if (command == 144){
        console.log(note);
        if (velocity == 0) {
            setKeyState(note, false);
        } else {
            setKeyState(note, true);
        }
    }

    if (command == 144 && velocity != 0) {

    } else if (command == 144 && velocity == 0)
    console.log(command,note,velocity);
}