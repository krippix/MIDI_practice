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
        this.assignEvents();

        this.solution        = [];   // keys to solve current problem
        this.activeKeys      = [];   // currently pressed keys
        this.awaitKeyRelease = false; // blocks proceeding until all keys are released
        this.solveStreak     = 0;
        this.allTimeHigh     = 0;

        this.initStats();
        this.generateTask();
    }

    generateTask() {
        this.retrieve_settings();
        this.failed = false;

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

        let clef = "";

        // choose clef
        if (chosenNote[1] == 40) {
            Math.random() < 0.5 ? clef = "bass" : clef = "treble";
        } else if (chosenNote[1] < 40) {
            clef = "bass";
        } else {
            clef = "treble";
        }

        this.success = false;
        this.awaitKeyRelease = false;
        this.solution = [chosenNote[1]];
        this.render.set_notes([new Noteset(clef, [chosenNote[0]])]);
    }

    generateChord() {

    }

    /**
     * Updates the activeKeys array
     * @param {number}  key 
     * @param {boolean} state 
     */
    changeKeyState(key, state) {
        if (state) {
            if (!this.activeKeys.includes(key)) {
                this.activeKeys.push(key);
            }
        } else {
            let index = this.activeKeys.indexOf(key);
            if (index != -1) {
                this.activeKeys.splice(index, 1);
            }
        }
        this.on_keyStateChange(state);
    }

    /**
     * triggered whenever activeKeys changes
     * @param {*} state true if button was pressed, false if released
     */
    on_keyStateChange(state) {
        // handle key releases
        if (!state) {
            if (this.activeKeys.length == 0) {
                this.awaitKeyRelease = false;
            }
            return;
        }
        // await release of all keys
        if (this.awaitKeyRelease) {
            console.log("Can't continue, release all keys first.");
            return;
        }
        // start timer on first pressed key
        if (this.activeKeys.length == 1) {
            this.starttime = Date.now();
        }
        this.is_failed();
    }

    /**
     * Check if task was failed
     */
    is_failed() {
        let failed = false;
        this.activeKeys.forEach((key) => {
            if (!(this.solution.includes(key))) {
                failed = true;
            }
        });
        if (failed) {
            this.on_failure();
            return;
        }
        if (this.activeKeys.length == this.solution.length) {
            this.on_success();
        }
    }

    on_success() {
        this.showMessage(true);
        this.awaitKeyRelease = true;
        this.updateStreak(true);
        this.generateTask();
    }

    on_failure() {
        this.showMessage(false);
        this.updateStreak(false);
        this.awaitKeyRelease = true;
    }

    async showMessage(success) {
        let target;
        if (success) {
            target = document.getElementById("success");
        } else {
            target = document.getElementById("failure");
        }
        target.style.opacity = 1;
        target.style.display = "flex";
        let fadeEffect = setInterval(() => {
            if (target.style.opacity > 0) {
                target.style.opacity -= 0.1;
            } else {
                target.style.display = "none";
                clearInterval(fadeEffect);
            }
        }, 100);
    }


    /**
     * 
     * @param {*} success correct answer
     */
    updateStreak(success) {
        if (success) {
            this.solveStreak += 1;
        } else {
            this.solveStreak = 0;
        }
        document.getElementById("streak-current").innerHTML = this.solveStreak;

        if (this.solveStreak >= this.allTimeHigh) {
            this.allTimeHigh = this.solveStreak;
            document.getElementById("streak-highest").innerHTML = this.allTimeHigh;
        }
    }


    initStats() {
        // TODO LOAD COOKIE DATA
        this.updateStreak(false);
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

    assignEvents() {
        document.getElementById("skip").addEventListener("click", () => {
            this.updateStreak(false);
            this.generateTask();
        });
    }
}


// Starts the task loop
var task = new Task();
