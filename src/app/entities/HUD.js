import {me} from 'melonjs';
import game from './../game';

/**
 * a HUD container and child items
 */

export default class HUD extends me.Container {

    init(x, y) {
        // call the constructor
        this._super(me.Container, 'init', [x, y]);

        // persistent across level change
        this.isPersistent = true;

        // make sure we use screen coordinates
        this.floating = true;

        // give a name
        this.name = "HUD";

        this.width = me.game.viewport.width;
        this.height = me.game.viewport.height;

        this.anchorPoint.x = 0;
        this.anchorPoint.y = 0;

        // add our child score object at the top left corner
        this.addChild(new ScoreItem(0, 10));


        const leftSettings = {
            name: 'JoystickLeft',
            x: -40,
            y: me.game.viewport.height - 220,
            width: 260,
            height: 260,
        };

        const rightSettings = {
            name: 'JoystickRight',
            x: me.game.viewport.width - 170,
            y: me.game.viewport.height - 170,
            width: 160,
            height: 160
        };

        const JoystickLeft = new JoystickContainer(leftSettings.x, leftSettings.y, leftSettings);
        const JoystickRight = new JoystickContainer(rightSettings.x, rightSettings.y, rightSettings);
        // add an ellipse shape
        //JoystickRight.body.addShape(new me.Ellipse(this.width/2, this.height/2, this.width, this.height));


        this.addChild(JoystickLeft, 2);
        this.addChild(JoystickRight, 1);

        const shootSettings = {
            name: 'ShootEntity',
            x: me.game.viewport.width - 220,
            y: me.game.viewport.height - 90,
            width: 80,
            height: 80,

            image: 'shoot-control',
        };

        me.pool.register("ShootEntity", UiShootEntity);
        this.addChild(me.pool.pull("ShootEntity", shootSettings.x, shootSettings.y, shootSettings), 3);

        this.updateChildBounds();
    }
}

class JoystickContainer extends me.Container {

    init(x, y, settings) {
        // call the constructor
        this._super(me.Container, 'init', [x, y, settings.width, settings.height]);

        // persistent across level change
        // this.isPersistent = true;

        // make sure we use screen coordinates
        this.floating = true;

        // give a name
        this.name = settings.name;

        //this.width = settings.width;
        //this.height = settings.height;

        this.anchorPoint.x = 0;
        this.anchorPoint.y = 0;

        const topSettings = {
            name: 'UiTopSprite',
            x: (settings.width / 2) - 48,
            y: (settings.height / 2) - 50,
            width: 96,
            height: 100,
            frameheight: 100,
            framewidth: 96,
            image: 'top',
            anchorPoint: {x:0,y:0}
        };

        const bottomSettings = {
            name: 'UiBottomSprite',
            x: (settings.width / 2) - 80,
            y: (settings.height / 2) - 80,
            width: 160,
            height: 160,
            frameheight: 160,
            framewidth: 160,
            image: 'bottom',
            anchorPoint: {x:0,y:0}
        };


        this.addChild(new UiTopSprite(topSettings.x, topSettings.y, topSettings), 2);
        this.addChild(new UiBottomSprite(bottomSettings.x, bottomSettings.y, bottomSettings), 1);

        this.updateChildBounds();
    }
}

class UiTopSprite extends me.Sprite {
    /**
     * constructor
     */
    init(x, y, settings) {

        // call the constructor
        this._super(me.Sprite, 'init', [x, y, settings]);

        //this.body.collisionType = me.collision.types.;
        this.setOpacity(0.9);
    }

}

class UiBottomSprite extends me.Sprite {
    /**
     * constructor
     */
    init(x, y, settings) {

        // call the constructor
        this._super(me.Sprite, 'init', [x, y, settings]);

        this.setOpacity(0.7);


    }

}

/**
 * a shoot entity
 */
class UiShootEntity extends me.GUI_Object {
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

/**
 * a basic HUD item to display score
 */
class ScoreItem extends me.Renderable {
    /**
     * constructor
     */
    init(x, y) {
        // call the parent constructor
        // (size does not matter here)
        this._super(me.Renderable, 'init', [x, y, 10, 10]);

        // create the font object
        this.font = new me.BitmapFont(me.loader.getBinary('PressStart2P'), me.loader.getImage('PressStart2P'));

        // font alignment to right, bottom
        this.font.textAlign = "right";
        this.font.textBaseline = "top";

        // local copy of the global score
        this.score = -1;
    }

    /**
     * update function
     */
    update(dt) {
        // we don't draw anything fancy here, so just
        // return true if the score has been updated
        if (this.score !== game.data.score) {
            this.score = game.data.score;
            return true;
        }
        return false;
    }

    /**
     * draw the score
     */
    draw(renderer) {
        // this.pos.x, this.pos.y are the relative position from the screen right bottom
        this.font.draw (renderer, game.data.score, me.game.viewport.width + this.pos.x, this.pos.y);
    }
}
