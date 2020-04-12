import {me} from 'melonjs';
import game from './../game';
import Mp from "../multiplayer";

/**
 * tank container
 */
export default class TankContainer extends me.Container {

    init(x, y, w, h) {
        // call the constructor
        this._super(me.Container, 'init', [x, y, w, h]);

        // give a name
        this.name = "TankContainer";

        this.setVar();
        this.mount();
        this.setBody();
        this.setUiInteraction();


        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4);

        game.mp = {...game.mp, ...{
            x: this.pos.x,
            y: this.pos.y
        }};

    }


    setUiInteraction() {

        const HUD = me.game.world.getChildByName('HUD')[0];

        const joystickLeft = HUD.getChildByName('JoystickLeft')[0];
        const joystickRight = HUD.getChildByName('JoystickRight')[0];
        const shootButton = HUD.getChildByName('ShootEntity')[0];

        me.event.subscribe("shoot", this.shoot.bind(this));

        // me.input.registerPointerEvent('pointerdown', joystickLeft, this.start.bind(this));
        // me.input.registerPointerEvent('pointermove', joystickLeft, this.move.bind(this));
        // me.input.registerPointerEvent('pointerleave', joystickLeft, this.stop.bind(this));

        me.input.registerPointerEvent('pointerdown',    me.game.viewport, this.start.bind(this));
        me.input.registerPointerEvent('pointermove',    me.game.viewport, this.move.bind(this));
        me.input.registerPointerEvent('pointerleave',   me.game.viewport, this.stop.bind(this));
        me.input.registerPointerEvent('pointerup',      me.game.viewport, this.stop.bind(this));


        me.input.registerPointerEvent('pointerdown', joystickRight, this.startGun.bind(this, joystickRight));
        me.input.registerPointerEvent('pointermove', joystickRight, this.rotateGun.bind(this));
        me.input.registerPointerEvent('pointerleave', joystickRight, this.stopGun.bind(this));

    }

    update (dt) {

        if (me.audio.seek("tank") >= 2.38) {
            me.audio.seek("tank", 1.2);
        }

        if (me.audio.seek("gun_battle_sound-ReamProductions") >= 20) {
            me.audio.seek("gun_battle_sound-ReamProductions", 0);
        }

        if (me.input.isKeyPressed('shoot')) {
            this.shoot();
        }

        if (me.input.isKeyPressed('genleft')) {
            this.rotateGunKeyboard();

        } else if (me.input.isKeyPressed('gunright')) {
            this.rotateGunKeyboard();
        }





        // move
        this.pos.x += (this.speedx * Math.sin(this.angle));
        this.pos.y -= (this.speedy * Math.cos(this.angle));


        // tracks
        if(this.isStarted &&
            (this.pos.y >= (this.prevTrackPos.y + 16)) || (this.pos.y <= (this.prevTrackPos.y - 16)) ||
            (this.pos.x >= (this.prevTrackPos.x + 16)) || (this.pos.x <= (this.prevTrackPos.x - 16))
        ) {

            const track = me.pool.pull("TracksEntity",
                this.pos.x,
                this.pos.y + this.height,
                {
                    name: 'TracksEntity',
                    width: 83,
                    height: 16,
                    frameheight: 16,
                    framewidth: 83,
                    image: 'tracks',
                    anchorPoint: {x:0,y:0},
                    angle: this.angle || 0
                }
            );

            me.game.world.addChild(track, 4);

            this.prevTrackPos = {x: this.pos.x, y: this.pos.y};

        }


        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        this.updateChildBounds();

        // handle collisions against other shapes
        me.collision.check(this);

        // send multiplayer data
        game.mp = {...game.mp, ...{
                x: this.pos.x,
                y: this.pos.y,
            }};
        Mp.send({...game.mp});


        return this._super(me.Container, "update", [dt]);

    }

    /**
     * collision handler
     */
    onCollision (response, other) {

        switch (response.b.body.collisionType) {

            case me.collision.types.WORLD_SHAPE:

                if (other.type === "tree" || other.type === "rock") {

                    return true;
                }

                break;

            case me.collision.types.ENEMY_OBJECT:

                return true;

                break;

            default:
                return false;
        }

        return false;
    }

    onDestroyEvent () {

        if ( this.getChildByName('TankEntity') ) {
            this.removeChildNow( this.getChildByName('TankEntity') );
        }

        if ( this.getChildByName('GunEntity') ) {
            this.removeChildNow( this.getChildByName('GunEntity') );
        }
    }

    setBody() {

        this.body = new me.Body(this);
        this.body.addShape(new me.Rect(0, 0, this.width, this.height));
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.body.gravity = 0;
        this.body.setMaxVelocity(0, 0);
        this.body.setFriction(0, 0);

        this.alwaysUpdate = true;
    }

    setVar() {

        this.prevTrackPos = {
            x: 0,
            y: 0
        };

        this.centerPointer = {
            x: 0,
            y: 0
        };
        this.speedx = 0;
        this.speedy = 0;
        this.angle = 0;
        this.prevDegrees = 0;

        this.centerGunPointer = {
            x: 0,
            y: 0
        };
        this.angleGun = 0;
        this.prevGunDegrees = 0;

        this.anchorPoint.x = 0;
        this.anchorPoint.y = 0;

    }

    mount() {

        me.pool.register("TankEntity", TankEntity);
        me.pool.register("GunEntity", GunEntity);
        me.pool.register("BulletEntity", BulletEntity);
        me.pool.register("FireEntity", FireEntity);
        me.pool.register("TracksEntity", TracksEntity);


        const tankSettings = {
            name: 'TankEntity',
            x: 0.5,
            y: 0.5,
            width: 83,
            height: 78,
            frameheight: 78,
            framewidth: 83,
            image: this.name == 'TankContainer' ? 'tankRed_outline' : 'tankBlack_outline',
            anchorPoint: {x:0,y:0},
        };

        const gunSettings = {
            name: 'GunEntity',
            x: (83 - 24) / 2,
            y: -10,
            width: 24,
            height: 58,
            image: this.name == 'TankContainer' ? 'barrelRed_outline' : 'barrelBlack_outline',
            anchorPoint: {x:0,y:0}
        };

        this.addChild(me.pool.pull("TankEntity", tankSettings.x, tankSettings.y, tankSettings), 10);
        this.addChild(me.pool.pull("GunEntity", gunSettings.x, gunSettings.y, gunSettings), 20);


        this.width = tankSettings.width;
        this.height = tankSettings.height;

        this.updateChildBounds();
    }

    shoot() {

        if ( this.getChildByName('BulletEntity').length > 1) {
            return;
        }


        const gun = this.getChildByName('GunEntity')[0];

        me.audio.play("shoot", false, null, 0.5);


        this.addChild(me.pool.pull("FireEntity",
            (this.width / 2) - 32,
            -60,
            {
                name: 'FireEntity',
                width: 64,
                height: 64,
                frameheight: 64,
                framewidth: 64,
                image: 'fire4',
                anchorPoint: {x:0,y:0},
                angle: this.angleGun || 0
            }
        ), 15);


        this.addChild(me.pool.pull("BulletEntity",
            (this.width / 2) - 6,
            (this.height / 2) - 26,
            {
                name: 'BulletEntity',
                width: 12,
                height: 12,
                frameheight: 26,
                framewidth: 12,
                image: 'bullet',
                anchorPoint: {x:0,y:0},
                angle: this.angleGun || 0
            }
        ), 15);

        // send multiplayer data
        game.mp.shoot = true;
        Mp.send({...game.mp});

        setTimeout(() => {
            game.mp.shoot = false;
        }, 100);


    }

    explode() {
        const tank = this.getChildByName('TankEntity')[0];
        const gun = this.getChildByName('GunEntity')[0];

        tank.renderable.flicker(500);
        gun.renderable.flicker(500);
    }

    startGun(joystickRight, e) {

        me.audio.playTrack("gun", 0.4);

        this.centerGunPointer = {
            x: joystickRight.pos.x + joystickRight.width / 2,
            y: joystickRight.pos.y + joystickRight.height / 2,
        };

    }

    stopGun(e) {

        me.audio.stopTrack("gun");

    }

    rotateGun(e) {

        var position = e.pos;
        var center = this.centerGunPointer;


        // angle in radians
        var radians = Math.atan2(position.y - center.y, position.x - center.x);

        // angle in degrees
        var degrees = Math.atan2(position.y - center.y, position.x - center.x) * 180 / Math.PI;

        degrees += 90;

        if (position.x < 0 ) {
            degrees += 180;
        } else if(position.y < 0 ) {
            degrees += 360;
        }



        const gun = this.getChildByName('GunEntity')[0];

        this.angleGun += (degrees + this.prevGunDegrees) * (Math.PI / 180);

        gun.centerRotate(this.prevGunDegrees);
        gun.centerRotate(degrees);


        game.mp = {...game.mp, ...{
                angleGun: this.angleGun,
                gunDegrees: degrees
            }};

        Mp.send({...game.mp});

        setTimeout(() => {
            game.mp.gunDegrees = 0;
        }, 100);


        this.prevGunDegrees = -degrees;
        this.prevPosGun = e.pos;


        // send multiplayer data


    }

    start(e) {

        this.isStarted = true;

        me.audio.playTrack("tank", 0.5);


        this.centerPointer = {
            x: e.pos.x,
            y: e.pos.y
        };

        this.speedx = 0;
        this.speedy = 0;


    }

    stop(e) {

        this.isStarted = false;

        me.audio.stopTrack("tank");

        this.speedx = 0;
        this.speedy = 0;

    }

    move(e) {

        if (!this.isStarted) return;

        var position = e.pos;
        var center = this.centerPointer;

        // angle in radians
        var radians = Math.atan2(position.y - center.y, position.x - center.x);

        // angle in degrees
        var degrees = Math.atan2(position.y - center.y, position.x - center.x) * 180 / Math.PI;

        degrees += 90;

        if (position.x < 0 ) {
            degrees += 180;
        } else if(position.y < 0 ) {
            degrees += 360;
        }

        //console.log('degree', (degrees - this.prevDegrees));

        const tank = this.getChildByName('TankEntity')[0];
        tank.centerRotate(degrees - this.prevDegrees);

        this.speedx = 2;
        this.speedy = 2;

        this.angle += (degrees - this.prevDegrees) * (Math.PI / 180);


        game.mp = {...game.mp, ...{
                angle: this.angle,
                tankDegrees: degrees,
            }};


        this.prevDegrees = degrees;

    }

}

/**
 * a tank entity
 */
class TankEntity extends me.Entity {
    /**
     * constructor
     */
    init (x, y, settings) {

        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        //this.angle = 0;

        this.body.removeShapeAt(0);

        this.renderable.flipY(true).flipX(true);


    }

    centerRotate (deg) {

        this.renderable.currentTransform
            .translate(this.renderable.width / 2, this.renderable.height / 2)
            .rotate(deg * Math.PI / 180)
            .translate(-this.renderable.width / 2, -this.renderable.height / 2);
    }

}

/**
 * a gun entity
 */
class GunEntity extends me.Entity {
    /**
     * constructor
     */
    init (x, y, settings) {

        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        this.body.removeShapeAt(0);

        //this.angle = 0;


    }

    centerRotate (deg) {

        this.renderable.currentTransform
            .translate(this.renderable.width / 2, this.renderable.height - 10)
            .rotate(deg * Math.PI / 180)
            .translate(-this.renderable.width / 2, -(this.renderable.height - 10));

    }

}

class TracksEntity extends me.Entity {
    /**
     * constructor
     */
    init (x, y, settings) {

        this._super(me.Entity, 'init', [x, y, settings]);

        this.body.removeShapeAt(0);

        this.renderable.currentTransform
            .translate((this.renderable.width) / 2, (this.renderable.height -83) / 2  )
            .rotate(settings.angle)
            .translate(-(this.renderable.width) / 2, -(this.renderable.height) / 2 );


        // remove after 1 sec
        me.timer.setInterval(() => {

            if (this && this.renderable) {

                const opacity = this.renderable.getOpacity();

                if (opacity <= 0) {
                    if (this.ancestor) {
                        this.ancestor.removeChild(this);
                    }
                } else {
                    this.renderable.setOpacity( opacity - 0.1);
                }

            }
        }, 1000);

    }

}

class FireEntity extends me.Entity {
    /**
     * constructor
     */
    init (x, y, settings) {

        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        this.body.removeShapeAt(0);

        this.renderable.currentTransform
            .translate((this.renderable.width) / 2, (this.renderable.height + 32) )
            .rotate(settings.angle)
            .translate(-(this.renderable.width) / 2, -(this.renderable.height + 32) );


        me.timer.setTimeout(() => {
            this.ancestor.removeChild(this);
        }, 100);

    }


}

/**
 * a bullet entity
 */
class BulletEntity extends me.Entity {

    init (x, y, settings) {


        this._super(me.Entity, "init", [x, y, settings]);

        this.config = settings;

        this.startPos = {x: x, y: y};

        this.body.gravity = 0;
        this.body.setVelocity(100, 100);
        this.body.setMaxVelocity(600, 600);
        this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;


        this.renderable.currentTransform
            .translate((this.renderable.width) / 2, (this.renderable.height) )
            .rotate(this.config.angle)
            .translate(-(this.renderable.width) / 2, -(this.renderable.height) );

        this.alwaysUpdate = true;
    }

    update (time) {

        this.body.vel.x += this.body.accel.x * time / 1000 * (Math.sin(this.config.angle));
        this.body.vel.y -= this.body.accel.y * time / 1000 * (Math.cos(this.config.angle));

        this.body.update();

        me.collision.check(this);

        if (
            this.pos.x > (this.startPos.x + this.body.maxVel.x) ||
            this.pos.y > (this.startPos.y + this.body.maxVel.y) ||
            this.pos.x < (this.startPos.x - this.body.maxVel.x) ||
            this.pos.y < (this.startPos.y - this.body.maxVel.y)
        ) {
            //console.log('remove bullet');
            this.ancestor.removeChild(this);
        }

        //return true;
    }

    onCollision (res, other) {

        if (other.body.collisionType === me.collision.types.WORLD_SHAPE) {

            this.ancestor.removeChild(this);
            return true;
        }


        if (this.ancestor.body.collisionType === me.collision.types.PLAYER_OBJECT) {
            // shoot by player
            if (other.body.collisionType === me.collision.types.ENEMY_OBJECT) {
                console.log('colpito il nemico');

                game.data.score += 10;
                this.ancestor.removeChild(this);

                other.explode();


                return true;
            }

        } else if (this.ancestor.body.collisionType === me.collision.types.ENEMY_OBJECT) {
            // shoot by enemy
            if (other.body.collisionType === me.collision.types.PLAYER_OBJECT) {
                console.log('colpito dal nemico');

                this.ancestor.removeChild(this);

                other.explode();


                // send multiplayer data
                game.mp.hit = true;
                Mp.send({...game.mp});

                setTimeout(() => {
                    game.mp.hit = false;
                }, 100);

                return true;
            }
        }

        game.mp.hit = false;

        return false;
    }

}
