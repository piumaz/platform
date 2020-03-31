/* game namespace */
var game = {
    /**
     * an object where to store game global data
     */
    data : {
        score : 0
    },

    // Run on page load.
    onload : function () {
        // Initialize the video.
        if (!me.video.init(640, 480, {wrapper : "screen", scale : "auto", scaleMethod : "flex"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // Initialize the audio.
        me.audio.init("mp3,ogg");

        // set all ressources to be loaded
        me.loader.preload(game.resources, this.loaded.bind(this));
    },

    // Run on game resources loaded.
    loaded : function () {

        me.pool.register("TankContainer", game.Tank.TankContainer);
        me.pool.register("CoinEntity", game.CoinEntity);
        // me.pool.register("EnemyEntity", game.EnemyEntity);

        // enable the keyboard
        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");

        me.input.bindKey(me.input.KEY.Z, "z");
        me.input.bindKey(me.input.KEY.X, "x");

        me.input.bindKey(me.input.KEY.SPACE, "shoot", true);



        // set the "Play/Ingame" Screen Object
        // me.state.set(me.state.MENU, new game.TitleScreen());

        // set the "Play/Ingame" Screen Object
        me.state.set(me.state.PLAY, new game.PlayScreen());

        // set a global fading transition for the screen
        me.state.transition("fade", "#FFFFFF", 250);

        // display the menu title
        me.state.change(me.state.PLAY);
    }
};
