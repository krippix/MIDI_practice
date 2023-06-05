class Task {
    /**
     * 
     * @param {Array}   keysig  list of keysignatures to use (int 0-11) where 0 = C || a, 1 = G || e ...
     * @param {boolean} natural enable/disable naturals
     * @param {boolean} sharp   enable/disable sharps
     * @param {boolean} flat    enable/disable flats
     * @param {boolean} chord   enable/disable chords (it's either chords or single notes)
     * @param {boolean} extend  enable/disable notes above C6 and below C2
     */
    constructor() {
        this.render  = new Notation();
        this.retrieve_settings();

        this.solution   = [];   // keys to solve current problem
        this.activeKeys = [];   // currently pressed keys
        this.active     = true; // true while task can be solved
        this.success    = false;

        this.generateTask();
    }

    generateTask() {
        this.retrieve_settings();
        this.success = false;

        if (this.chord) {
            this.generateChord();
        } else {
            this.generateNote();
        }
    }

    generateNote() {
        let pickFrom = [];

        // TODO: choose signature

        // TODO: maybe weight note likelyhood

        if (this.natural) {
            pickFrom.push(...nat_values);
            if (this.extend) {
                pickFrom.push(...nat_values_ex);
            }
        }
        if (this.sharp) {
            pickFrom.push(...shp_values);
            if (this.extend) {
                pickFrom.push(...shp_values_ex);
            }
        }
        if (this.flat) {
            pickFrom.push(...flt_values);
            if (this.extend) {
                pickFrom.push(...flt_values_ex);
            }
        }

        // pick from generated pool
        var randomResult = Math.floor(Math.random() * pickFrom.length);
        let chosenNote = pickFrom[randomResult];
        this.solution = [chosenNote[1]];

        let clef = "";

        // choose clef
        if (chosenNote[1] == 40) {
            Math.random() < 0.5 ? clef = "bass" : clef = "treble";
        } else if (chosenNote[1] < 40) {
            clef = "bass";
        } else {
            clef = "treble";
        }

        this.solution = [chosenNote[1]];
        this.render.set_notes([new Noteset(clef, [chosenNote[0]])]);
    }

    generateChord() {

    }

    on_keyStateChange() {
        if (this.active) {
            this.checkActiveKeys();
        } else {
            console.log("Can't continue, still keys pressed.");
            return;
        }
        if (this.success) {
            this.generateTask();
        } else if (this.activeKeys.length == 0) {
            this.active = true;
        }
    }

    /**
     * Keeps Track of pressed keys
     * @param {number}  key 
     * @param {boolean} state 
     */
    changeKeyState(key, state) {
        if (state) {
            // start new timer
            if (this.activeKeys.length == 0) {
                this.active = true;
                this.starttime = Date.now();
            }
            this.activeKeys.push(key);
        } else {
            let index = this.activeKeys.indexOf(key);
            if (index != -1) {
                this.activeKeys.splice(index, 1);
            }
        }
        this.on_keyStateChange()
    }

    /**
     * Checks if activeKeys fulfill current task
     */
    checkActiveKeys() {
        let failed = false;
        this.activeKeys.forEach( key => {
            if (!(this.solution.includes(key))) {
                this.result_fail();
                console.log("failed key: "+key);
                failed = true;
            }
        });
        if (failed) {
            console.log("should have pressed: "+this.solution);
            console.log("actually pressed: "+this.activeKeys);
            return;
        }
        if (this.activeKeys.length == this.solution.length) {
            if (Date.now() - this.starttime <= 500) {
                console.log(this.solution);
                console.log(this.activeKeys);

                this.result_success();
                return;
            } else {
                this.result_fail();
                return;
            }
        }
    }

    result_fail() {
        console.log("Wrong!");
        this.active = false;
    }

    result_success() {
        console.log("Correct!");
        this.solution = [];
        this.active   = false;
        this.success  = true;
    }

    retrieve_settings() {
        let cbx_naturals = document.getElementById("naturals");
        let cbx_sharps   = document.getElementById("sharps");
        let cbx_flats    = document.getElementById("flats");
        let cbx_extended = document.getElementById("extended");
        
        this.keysig  = [0];
        this.natural = cbx_naturals.checked;
        this.sharp   = cbx_sharps.checked;
        this.flat    = cbx_flats.checked;
        this.chord   = false;
        this.extend  = cbx_extended.checked;
    }
}

// Starts the task loop
var task = new Task();
