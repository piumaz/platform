game.PlayScreen = me.Stage.extend({
    /**
     * action to perform on state change
     */
    onResetEvent : function () {

        // load a level
        me.levelDirector.loadLevel("area01");

        // play the audio track
        me.audio.playTrack("gun_battle_sound-ReamProductions", 0.1);

        // reset the score
        game.data.score = 0;

        // add our HUD to the game world
        // this.HUD = new game.HUD.Container(0, 0);
        // me.game.world.addChild(this.HUD);

        me.game.world.addChild(me.pool.pull("HUD", 0, 0));

        me.game.world.addChild(me.pool.pull("TankContainer", me.game.world.width / 2, me.game.world.height/2), 5);

        me.game.world.addChild(me.pool.pull("EnemyContainer", me.game.world.width / 2 - 150, me.game.world.height/2), 6);

    },

    /**
     * action to perform when leaving this screen (state change)
     */
    onDestroyEvent : function () {
        // remove the HUD from the game world
        //me.game.world.removeChild(this.Tank);

        // stop the current audio track
        // me.audio.stopTrack();
    }
})
