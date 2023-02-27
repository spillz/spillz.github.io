
//Global control states affected by all controllers
controlStates = {
    'fire': false,
    'use': false,
    'x':0.0,
    'y':0.0,
};
controlStates0 = {... controlStates};

lastController = null; //ID of last controller used


// page up	33
// Space	32
// page down	34
// end	35
// home	36
// arrow left	37
// arrow up	38
// arrow right	39
// arrow down	40

// numpad 0	96
// numpad 1	97
// numpad 2	98
// numpad 3	99
// numpad 4	100
// numpad 5	101
// numpad 6	102
// numpad 7	103
// numpad 8	104
// numpad 9	105
// multiply	106
// add	107
// subtract	109
// decimal point	110
// divide	111


class Controller {
    constructor() {
        this.controlStates = {... controlStates0}
        this.attach_to_player();
    }
    attach_to_player(player=null) {
        this.player = player;
        lastController = this;
        if(player!=null) {
            this.player.controller = this;
        }
    }
    set(action, state=true) {
        controlStates[action] = state;
        lastController = this; 
        let player = this.player;
        if(player!=null) {
            player.controlStates[action] = state;
        }
    }
    vibrate(intensity1, intensity2, duration) {

    } 
}

class GamepadController extends Controller {
    constructor(gamepad) {
        super();
        this.gamepad = gamepad;
        this.thresh = 0.05;
        this.internalStates = {... this.controlStates};
    }
    set(action, state=true) {
        if(this.internalStates[action]==state)
            return;
        this.internalStates[action] = state;
        super.set(action, state);
    }   
//    e.gamepad.index, e.gamepad.id,
//    e.gamepad.buttons.length, e.gamepad.axes.length);
    vibrate(intensity1, intensity2, duration) {
        if(this.gamepad.vibrationActuator!=null) {
            this.gamepad.vibrationActuator.playEffect('dual-rumble', 
                {
                    startDelay: 0,
                    duration: duration,
                    weakMagnitude: intensity1,
                    strongMagnitude: intensity2 });
        }
        //Firefox version
        //Need to check there are two vibrators
        //gamepad.hapticActuators[0].pulse(intensity1, duration);
        //gamepad.hapticActuators[1].pulse(intensity2, duration);

        //Also apply global vibration in a single player game (TODO: Turn off by default so we don't duplicate calls unnecessarily?)
    }
}

class GamepadManager {
    gamepads = {};
    constructor() {
        let that = this;
        window.addEventListener("gamepadconnected", function(e){that.connected(e)});
        window.addEventListener("gamepaddisconnected", function(e){that.disconnected(e)});
    }
    connected(e) {
        this.gamepads[e.gamepad.index] = new GamepadController(e.gamepad);
    }
    disconnected(e) {
        let g = this.gamepads[e.gamepad.index];
        if(g.player!=null) {
            g.player.dead = true;
            g.player.dropFromGame = true;
        }
        delete this.gamepads[e.gamepad.index];
    }
    update_gamepad_states() {
        let gps = navigator.getGamepads(); 
        if(gps==null)
            return;
        for(let g of gps) {
            if(g==null)
                continue;
            let c = this.gamepads[g.index];
            c.gamepad = g; //put the latest state in the gamepad object
            c.set("fire",this.buttonPressed(g.buttons[0]));
            c.set("use",this.buttonPressed(g.buttons[1]) || this.buttonPressed(g.buttons[6]));
            c.set("x",Math.abs(g.axes[0])>c.thresh?g.axes[0]:0);
            c.set("y",Math.abs(g.axes[1])>c.thresh?g.axes[1]:0);
        }
    }
    buttonPressed(b) {
        if (typeof(b) == "object")
            return b.pressed;
        return b == 1.0;
    }
    attach_all_to_player(player) {
        for(let g of Object.keys(this.gamepads))
            this.gamepads[g].attach_to_player(player);
    }
    release_all_players() {
        for(let g of Object.keys(this.gamepads))
            this.gamepads[g].attach_to_player();
    }
}

