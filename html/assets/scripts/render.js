const { Renderer, Stave, StaveNote, Voice, Formatter, TickContext } = Vex.Flow;

class Notation {
    constructor() {
        // init notelist
        this.notesTop    = [];
        this.notesBottom = [];

        // create voice
        this.voiceTop    = new Vex.Flow.Voice({num_beats: 4, beat_value: 4, resolution: Vex.Flow.RESOLUTION});
        this.voiceBottom = new Vex.Flow.Voice({num_beats: 4, beat_value: 4, resolution: Vex.Flow.RESOLUTION});

        this.draw();
    }
    /**
     * Takes list of notes ex: [{clef: "bass/treble", keys: ["c/4,"e/4"], duration: "w"},{clef: "bass/treble", keys: ["c/4,"e/4"], duration: "w"}]
     * @param {Array[Noteset]} notes 
     */
    set_notes(to_set) {
        // create voice
        this.voiceTop    = new Vex.Flow.Voice({num_beats: 4, beat_value: 4, resolution: Vex.Flow.RESOLUTION});
        this.voiceBottom = new Vex.Flow.Voice({num_beats: 4, beat_value: 4, resolution: Vex.Flow.RESOLUTION});
        //this.voiceTop.tickables    = [];
        //this.voiceBottom.tickables = [];

        this.notesTop    = [];
        this.notesBottom = [];

        to_set.forEach( note => {
            if (note.clef == "treble") {
                this.notesTop.push(note.staveNote);
            } else {
                this.notesBottom.push(note.staveNote);
            }
        });

        this.voiceTop.addTickables(this.notesTop);
        this.voiceBottom.addTickables(this.notesBottom);
        this.draw();
    }

    draw() {
        // Create the staves 
        this.topStaff = new Vex.Flow.Stave(20, 100, 300);
        this.bottomStaff = new Vex.Flow.Stave(20, 200, 300);

        // add clefs
        this.topStaff.addClef('treble');
        this.bottomStaff.addClef('bass');

        // add brace and line
        this.brace     = new Vex.Flow.StaveConnector(this.topStaff, this.bottomStaff).setType(3); // 3 = brace
        this.lineLeft  = new Vex.Flow.StaveConnector(this.topStaff, this.bottomStaff).setType(1);
        this.lineRight = new Vex.Flow.StaveConnector(this.topStaff, this.bottomStaff).setType(6);
        
        // Create an SVG renderer and attach it to the DIV element
        this.div = document.getElementById("note-render");
        this.div.innerHTML = "";

        this.renderer = new Renderer(this.div, Renderer.Backends.SVG);

        // Configure the rendering context.
        this.renderer.resize(321, 500);
        this.ctx = this.renderer.getContext();

        // draw background
        this.topStaff.setContext(this.ctx).draw();
        this.bottomStaff.setContext(this.ctx).draw();
        this.brace.setContext(this.ctx).draw();
        this.lineLeft.setContext(this.ctx).draw();
        this.lineRight.setContext(this.ctx).draw();

        // draw notes
        if (this.notesTop.length != 0) {
            new Vex.Flow.Formatter().joinVoices([this.voiceTop]).format([this.voiceTop], 500);
            this.voiceTop.draw(this.ctx, this.topStaff);
        }
        if (this.notesBottom.length != 0) {
            new Vex.Flow.Formatter().joinVoices([this.voiceBottom]).format([this.voiceBottom], 500);
            this.voiceBottom.draw(this.ctx, this.bottomStaff);
        }
    }
}

class Noteset {
    // syntax for notes: https://github.com/0xfe/vexflow/blob/master/src/tables.ts
    /**
     * 
     * @param {String}        clef bass or treble
     * @param {Array[String]} keys array of string
     */
    constructor(clef, keys) {
        this.clef     = clef;
        this.keys     = keys;
        this.staveNote = new StaveNote({clef: clef, keys: keys, duration: "w"});
        this.addAccidentals();
    }
    addAccidentals() {
        for (var i=0; i < this.keys.length; i++) {
            if (this.keys[i].includes("b")) {
                this.staveNote.addModifier(new Vex.Flow.Accidental("b"),i)            
            }
            if (this.keys[i].includes("#")) {
                this.staveNote.addModifier(new Vex.Flow.Accidental("#"),i);
            }
        }
        //this.staveNote.setXShift(80);
    }
}
