/**
 * tank container
 */
game.Enemy = game.Enemy || {};

game.Enemy.EnemyContainer = game.Tank.TankContainer.extend({

    init: function (x, y, w, h) {
        // call the constructor
        this._super(me.Container, 'init', [x, y, w, h]);

        // give a name
        this.name = "EnemyContainer";

        this.setVar();
        this.mount();
        this.setBody();

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;

        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");

    },

    update : function (dt) {


        let moveAngle = 0;

        let speed = 0;

        if (me.input.isKeyPressed('up')) {
            speed = 1;
        }
        if (me.input.isKeyPressed('down')) {
            speed = -1;
        }
        if (me.input.isKeyPressed('left')) {
            moveAngle = -1;
        }
        if (me.input.isKeyPressed('right')) {
            moveAngle = 1;
        }

        this.angle += moveAngle * Math.PI / 180;


        this.pos.x += (speed * Math.sin(this.angle));
        this.pos.y -= (speed * Math.cos(this.angle));


        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        this.updateChildBounds();

        // handle collisions against other shapes
        me.collision.check(this);


        return this._super(me.Container, "update", [dt]);

    },

    /**
     * collision handler
     */
    onCollision : function (response, other) {
        return false;
    },

});
