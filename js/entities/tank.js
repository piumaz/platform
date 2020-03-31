/**
 * tank container
 */
game.Tank = game.Tank || {};

game.Tank.TankContainer = me.Container.extend({

    init: function (x, y, w, h) {
        // call the constructor
        this._super(me.Container, 'init', [x, y, w, h]);

        // give a name
        this.name = "TankContainer";

        this.centerPointer = {
            x: 0,
            y: 0
        };
        this.speedx = 0;
        this.speedy = 0;

        this.angle = 0;
        this.prevDegrees = 0;

        this.anchorPoint.x = 0;
        this.anchorPoint.y = 0;


        const tankSettings = {
            name: 'TankEntity',
            x: 0.5,
            y: 0.5,
            width: 83,
            height: 78,
            frameheight: 78,
            framewidth: 83,
            image: 'tankRed_outline',
            anchorPoint: {x:0,y:0},
        };

        const gunSettings = {
            name: 'GunEntity',
            x: (83 - 24) / 2,
            y: -10,
            width: 24,
            height: 58,
            image: 'barrelRed_outline',
            anchorPoint: {x:0,y:0}
        };


        this.width = tankSettings.width;
        this.height = tankSettings.height;


        me.pool.register("TankEntity", game.Tank.TankEntity);
        me.pool.register("GunEntity", game.Tank.GunEntity);
        me.pool.register("BulletEntity", game.Tank.BulletEntity);

        this.addChild(me.pool.pull("TankEntity", tankSettings.x, tankSettings.y, tankSettings), 0);
        this.addChild(me.pool.pull("GunEntity", gunSettings.x, gunSettings.y, gunSettings), 2);

        // add a physic body
        this.body = new me.Body(this);
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.body.gravity = 0;
        this.body.setMaxVelocity(1, 1);
        this.body.setFriction(0, 0);


        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4);

        this.alwaysUpdate = true;

        this.updateChildBounds();

        me.input.registerPointerEvent("pointerdown", me.game.viewport, function (event) {
            me.event.publish("pointerdown", [ event ]);
        });

        me.input.registerPointerEvent("pointermove", me.game.viewport, function (event) {
            me.event.publish("pointermove", [ event ]);
        });

        me.input.registerPointerEvent("pointerleave", me.game.viewport, function (event) {
            me.event.publish("pointerleave", [ event ]);
        });

        this.pointerDown = me.event.subscribe("pointerdown", (e) => {

            this.start(e);

        });

        this.pointerMove = me.event.subscribe("pointermove", (e) => {

            this.move(e);

        });

        this.pointerLeave = me.event.subscribe("pointerleave", (e) => {

            this.stop(e);

        });
    },

    start: function (e) {
        this.centerPointer = {
            x: e.pos.x,
            y: e.pos.y
        };

        this.speedx = 0;
        this.speedy = 0;
    },

    stop: function (e) {
        this.speedx = 0;
        this.speedy = 0;
    },

    move: function (e) {

        let position = e.pos;
        let center = this.centerPointer;

        // angle in radians
        let radians = Math.atan2(position.y - center.y, position.x - center.x);

        // angle in degrees
        let degrees = Math.atan2(position.y - center.y, position.x - center.x) * 180 / Math.PI;

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

        this.prevDegrees = degrees;

    },

    update : function (dt) {

        this.pos.x += (this.speedx * Math.sin(this.angle));
        this.pos.y -= (this.speedy * Math.cos(this.angle));


        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        return this._super(me.Container, "update", [dt]);

        this.updateChildBounds();
    },

    onDestroyEvent : function () {
        // remove the HUD from the game world
        this.removeChild( this.getChildByName('TankEntity') );
        this.removeChild( this.getChildByName('GunEntity') );
    }

});

/**
 * a tank entity
 */
game.Tank.TankEntity = me.Entity.extend({
    /**
     * constructor
     */
    init : function (x, y, settings) {

        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        this.angle = 0;

        this.body.gravity = 0;
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.body.setMaxVelocity(0, 0);
        this.body.setFriction(0, 0);

        this.renderable.flipY(true).flipX(true);

        // ensure the player is updated even when outside of the viewport
        this.alwaysUpdate = true;

    },

    centerRotate : function (deg) {

        this.renderable.currentTransform
            .translate(this.renderable.width / 2, this.renderable.height / 2)
            .rotate(deg * Math.PI / 180)
            .translate(-this.renderable.width / 2, -this.renderable.height / 2);
    },

    /**
     * update the entity
     */
    update : function (dt) {

        /*
        moveAngle = 0;

        if (me.input.isKeyPressed('left')) {
            moveAngle = -1;
        }
        if (me.input.isKeyPressed('right')) {
            moveAngle = 1;
        }
        const deg = moveAngle * Math.PI / 180;


        this.renderable.currentTransform
            .translate(this.renderable.width / 2, this.renderable.height / 2)
            .rotate(deg)
            .translate(-this.renderable.width / 2, -this.renderable.height / 2);
        */

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);

    },

    /**
     * collision handler
     */
    onCollision : function (response, other) {

        switch (response.b.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:

                break;

            case me.collision.types.ENEMY_OBJECT:

                this.renderable.flicker(750);


            default:
                // Do not respond to other objects (e.g. coins)
                return false;
        }

        // Make the object solid
        return true;
    }
});

/**
 * a gun entity
 */
game.Tank.GunEntity = me.Entity.extend({
    /**
     * constructor
     */
    init : function (x, y, settings) {

        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        this.angle = 0;

        this.body.gravity = 0;
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.body.setMaxVelocity(0, 0);
        this.body.setFriction(0, 0);

        // ensure the player is updated even when outside of the viewport
        this.alwaysUpdate = true;

    },

    centerRotate: (deg) => {

    },

    /**
     * update the entity
     */
    update : function (dt) {

        moveAngle = 0;

        if (me.input.isKeyPressed('z') || me.input.isKeyPressed('left')) {
            moveAngle = -1;
        }
        if (me.input.isKeyPressed('x') || me.input.isKeyPressed('right')) {
            moveAngle = 1;
        }
        const deg = moveAngle * Math.PI / 180;
        this.angle += deg;

        this.centerRotate(deg);
        this.renderable.currentTransform
            .translate(this.renderable.width / 2, this.renderable.height - 10)
            .rotate(deg)
            .translate(-this.renderable.width / 2, -(this.renderable.height - 10));

        // shoot
        if (me.input.isKeyPressed("shoot")) {
            this.ancestor.addChild(me.pool.pull("BulletEntity",
                this.pos.x + (this.width / 2) - 6,
                this.pos.y + (this.height / 2),
                {
                    name: 'BulletEntity',
                    width: 12,
                    height: 26,
                    frameheight: 26,
                    framewidth: 12,
                    image: 'bulletRed',
                    anchorPoint: {x:0,y:0},
                    angle: this.angle
                }
                ), 1);
        }


        // apply physics to the body (this moves the entity)
        this.body.update(dt);


        // return true if we moved or if the renderable was updated
        return true;

    },


});


/**
 * a bullet entity
 */
game.Tank.BulletEntity = me.Entity.extend({

    init : function (x, y, settings) {


        this._super(me.Entity, "init", [x, y, settings]);

        this.config = settings;


        this.body.gravity = 0;
        this.body.setVelocity(300, 300);
        this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;


        this.body.getShape(0).rotate(this.config.angle);

        //this.body.rotate(this.config.angle);

        /*
        this.body.getShape(0)
            .translate(this.width / 2, (this.height) )
            .rotate(this.config.angle)
            .translate(-(this.width / 2), -(this.height) );

         */



        this.renderable.currentTransform
            .translate(this.renderable.width / 2, (this.renderable.height - 5) )
            .rotate(this.config.angle)
            .translate(-this.renderable.width / 2, -(this.renderable.height - 5) );

        this.alwaysUpdate = true;
    },

    update : function (time) {

        this.body.vel.x += this.body.accel.x * time / 1000 * (Math.sin(this.config.angle));
        this.body.vel.y -= this.body.accel.y * time / 1000 * (Math.cos(this.config.angle));

        this.body.update();
        me.collision.check(this);

        return true;
    },

    onCollision : function (res, other) {

        if (other.body.collisionType === me.collision.types.PLAYER_OBJECT) {
            return false;
        }

        if (other.body.collisionType === me.collision.types.WORLD_SHAPE) {
            this.ancestor.removeChild(this);
            return true;
        }

        if (other.body.collisionType === me.collision.types.ENEMY_OBJECT) {
            console.log('colpito il nemico');
            // me.game.world.removeChild(this);
            // me.game.world.removeChild(other);
            // game.playScreen.enemyManager.removeChild(other);
            return false;
        }

    }

});
