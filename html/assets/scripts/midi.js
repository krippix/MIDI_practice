// prepare svg object for later use
var keyboard = document.getElementById("piano");
var svgDoc; // loaded keyboard svg
var keyArray; // List of every single key
var midiAccess = null;
const black_keys = [2,5,7,10,12,14,17,19,22,24,26,29,31,34,36,38,41,43,46,48,50,53,55,58,60,62,65,67,70,72,74,77,79,82,84,86] 


window.addEventListener("load", () => {
    svgDoc = keyboard.contentDocument;
    keyArray = svgDoc.querySelectorAll('.key');
    keyArray.forEach(key => {
        key.addEventListener('mousedown', keyDown);
        key.addEventListener('mouseup', keyUp);
        key.addEventListener('mouseout', keyUp);
    });
}, false);


// On mouse release on key
function keyDown(evt) {setKeyState(Number(evt.target.id), true);}
function keyUp(evt) {setKeyState(Number(evt.target.id), false);}


// press or unpress keyboard button
function setKeyState(note, state) {
    let key = svgDoc.getElementById(String(note));
    if (state) {
        key.style.fill = "red";
    } else if (black_keys.includes(note)) {
        key.style.fill = "black";
    } else {
        key.style.fill = "white";
    }
    task.changeKeyState(note, state);
}


/**
 * Establishes MIDI connection
 */
function midiSetup() {
    // Check if MIDI connection is possible at all
    if (!navigator.requestMIDIAccess) {
        alert('WebMIDI is not supported in this browser. Or Site was not accessed via HTTPS');
        return
    }
    // Attempt to establish a MIDI connection. Handle success or failure
    window.navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}


/**
 * Handle successful MIDI connection
 * @param {*} midiAccess 
 */
function onMIDISuccess(access) {
    midiAccess = access;
    console.log("access successful");

    var input_list = [];

    var iter = midiAccess.inputs.values();
    for (let obj = iter.next(); !obj.done; obj = iter.next()) {
        input_list.push(obj.value);
    }

    // Add event listener do all devices
    for (var i = 0; i < input_list.length; i++) {
        input_list[i].onmidimessage = getMIDIMessage;
    }
}


/**
 * Handle MIDI failure
 */
function onMIDIFailure() {
    let message = "Failed to access your MIDI device";
    console.log(message);
    alert(message);
}


/**
 * Handle incoming MIDI Messages
 * @param {*} midiMessage 
 */
function getMIDIMessage(midiMessage) {
    var command  = midiMessage.data[0];
    var note     = midiMessage.data[1] - 20; // sorry midi standard
    var velocity = (midiMessage.data.length > 2) ? midiMessage.data[2] : 0;

    console.log(`MIDI{ command : ${command}, note : ${note}, velocity : ${velocity}}`);

    if (command == 144){
        console.log(note);
        if (velocity == 0) {
            setKeyState(note, false);
        } else {
            setKeyState(note, true);
        }
    }
}


// code executed on include
window.onload = () => { midiSetup(); };
