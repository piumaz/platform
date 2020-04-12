import 'core-js';
import {me} from 'melonjs';

import resources from './resources';

import HUD from './entities/HUD';

import TankContainer from './entities/tank';
import EnemyContainer from './entities/enemy';
import CoinEntity from './entities/entities';

import PlayScreen from './screens/play';

class Bootstrap {

    constructor() {

        // Initialize the video.
        if (!me.video.init(1024, 768, {wrapper : "screen", scale : "auto", scaleMethod : "flex-width"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        if (me.debug) {
            me.debug.renderHitBox = true;
        }

        // Initialize the audio.
        me.audio.init("mp3,ogg");

        // set all ressources to be loaded
        me.loader.preload(resources, this.loaded.bind(this));


    }

    loaded() {

        me.pool.register("HUD", HUD);
        me.pool.register("TankContainer", TankContainer);
        me.pool.register("EnemyContainer", EnemyContainer);

        me.pool.register("CoinEntity", CoinEntity);

        // enable the keyboard
        // me.input.bindKey(me.input.KEY.LEFT, "left");
        // me.input.bindKey(me.input.KEY.RIGHT, "right");
        // me.input.bindKey(me.input.KEY.UP, "up");
        // me.input.bindKey(me.input.KEY.DOWN, "down");

        me.input.bindKey(me.input.KEY.Z, "gunleft");
        me.input.bindKey(me.input.KEY.X, "gunright");

        me.input.bindKey(me.input.KEY.SPACE, "shoot", true);



        // set the "Play/Ingame" Screen Object
        // me.state.set(me.state.MENU, new TitleScreen());

        // set the "Play/Ingame" Screen Object
        me.state.set(me.state.PLAY, new PlayScreen());

        // set a global fading transition for the screen
        me.state.transition("fade", "#FFFFFF", 250);

        // display the menu title
        me.state.change(me.state.PLAY);

    }

    static boot() {
        var bootstrap = new Bootstrap();

        // Mobile browser hacks
        if (me.device.isMobile && !navigator.isCocoonJS) {
            // Prevent the webview from moving on a swipe
            window.document.addEventListener("touchmove", function (e) {
                e.preventDefault();
                window.scroll(0, 0);
                return false;
            }, false);

            // Scroll away mobile GUI
            (function () {
                window.scrollTo(0, 1);
                me.video.onresize(null);
            }); //.defer();

            me.event.subscribe(me.event.WINDOW_ONRESIZE, function (e) {
                window.scrollTo(0, 1);
            });
        }

        return bootstrap;
    }
}

me.device.onReady(function onReady() {
    Bootstrap.boot();
});