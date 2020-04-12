import {me} from 'melonjs';
import game from './../game';
import Mp from "../multiplayer";

export default class PlayScreen extends me.Stage {
    /**
     * action to perform on state change
     */
    onResetEvent() {

        const players = {};


        // load a level
        me.levelDirector.loadLevel("area01");

        // play the audio track
        //me.audio.playTrack("gun_battle_sound-ReamProductions", 0.1);

        // reset the score
        game.data.score = 0;


        me.game.world.addChild(me.pool.pull("HUD", 0, 0));



        // join server
        Mp.join({
            width:  me.game.world.width,
            height: me.game.world.height
        }).then(() => {

            Mp.onPlayerAdd((player, sessionId) => {

                //console.log(player.x , player.y);

                if (Mp.sessionId() === sessionId) {
                    players[sessionId] = me.game.world.addChild(me.pool.pull("TankContainer", player.x , player.y), 5);

                    if (!game.data.playername) {
                        game.data.playername = sessionId;
                    }

                } else {
                    players[sessionId] = me.game.world.addChild(me.pool.pull("EnemyContainer", player.x , player.y), 6);
                }

            });

            Mp.onPlayerRemove((player, sessionId) => {
                console.log("player left!", sessionId);
                me.game.world.removeChild( players[sessionId] );
                delete players[sessionId];

            });

            Mp.onPlayerChange((player, sessionId) => {
                // console.log("player change!", player);

                if (Mp.sessionId() === sessionId) {
                    // console.log("sono io, nulla");
                    return;
                }


                players[sessionId].setData(player);

            });

        });



    }

    /**
     * action to perform when leaving this screen (state change)
     */
    onDestroyEvent() {

        me.game.world.removeChild( me.game.world.getChildByName('HUD') );
        me.game.world.removeChild( me.game.world.getChildByName('TankEntity') );
        me.game.world.removeChild( me.game.world.getChildByName('EnemyEntity') );
        // remove the HUD from the game world
        //me.game.world.removeChild(this.Tank);

        // stop the current audio track
        me.audio.stopTrack();
    }
}
