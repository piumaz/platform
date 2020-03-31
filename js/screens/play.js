game.PlayScreen = me.ScreenObject.extend({
    /**
     * action to perform on state change
     */
    onResetEvent : function () {

        // load a level
        me.levelDirector.loadLevel("area01");

        // play the audio track
        // me.audio.playTrack("dst-inertexponent");

        // reset the score
        game.data.score = 0;

        // add our HUD to the game world
        // this.HUD = new game.HUD.Container();
        // me.game.world.addChild(this.HUD);


        me.game.world.addChild(me.pool.pull("TankContainer", me.game.world.width / 2, me.game.world.height/2));


    },

    /**
     * action to perform when leaving this screen (state change)
     */
    onDestroyEvent : function () {
        // remove the HUD from the game world
        me.game.world.removeChild(this.Tank);
        // stop the current audio track
        me.audio.stopTrack();
    }
})
