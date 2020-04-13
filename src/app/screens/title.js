import {me} from 'melonjs';
import game from './../game';
import Mp from "../multiplayer";
import TextInput from "../entities/textinput";

export default class TitleScreen extends me.Stage {
    /**
     * action to perform on state change
     */
    onResetEvent() {

        // title screen
        var backgroundImage = new me.Sprite(0, 0, {
                image: me.loader.getImage('title_screen'),
            }
        );

        // position and scale to fit with the viewport size
        backgroundImage.anchorPoint.set(0, 0);
        backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);

        // add to the world container
        me.game.world.addChild(backgroundImage, 1);


        me.game.world.addChild( new TextInput((me.game.viewport.width / 2), me.game.viewport.height / 2, 'text', 30) );



        // button enter
        me.game.world.addChild(new UiButtonEnter((me.game.viewport.width / 2) , me.game.viewport.height / 2 , {
            name: 'UiButtonEnter',
            width: 108,
            height: 48,
            image: 'start',
        }));

        // change to play state on press Enter or click/tap
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER);
        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
            if (action === "enter") {
                // play something on tap / enter
                // this will unlock audio on mobile devices

                game.mp.playername = document.getElementById('playername').value;
                me.audio.play("cling");
                me.state.change(me.state.PLAY);
            }
        });

    }

    /**
     * action to perform when leaving this screen (state change)
     */
    onDestroyEvent() {

        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindPointer(me.input.pointer.LEFT);
        me.event.unsubscribe(this.handler);

    }
}

class UiButtonEnter extends me.GUI_Object {
    /**
     * constructor
     */
    init(x, y, settings) {

        // call the constructor
        this._super(me.GUI_Object, 'init', [x, y, settings]);

    }

    // output something in the console
    // when the object is clicked
    onClick(event) {
        me.event.publish("shoot");
        // don't propagate the event
        return false;
    }
}

class ButtonEnter extends me.GUI_Object {
    /**
     * constructor
     */
    init(x, y, settings) {

        // call the constructor
        this._super(me.GUI_Object, 'init', [x, y, settings]);

    }

    // output something in the console
    // when the object is clicked
    onClick(event) {
        me.event.publish("shoot");
        // don't propagate the event
        return false;
    }
}
