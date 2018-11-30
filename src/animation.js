var TWEEN = require("@tweenjs/tween.js");
class Animation {
    constructor(object, animations) {
        this.tweens = [];
        this.object = object;
        this.animations = animations;
    }
    init() {
        let tweens = this.tweens,
            object = this.object,
            animations = this.animations;
        animations.reduce((pro, cur, curIndex) => {
            tweens.push(
                new TWEEN.Tween(pro.data).to(cur.data).onUpdate(data => {
                    object.position.copy(data);
                })
            );
            if (tweens.length >= 2) {
                tweens[this.tweens.length - 2].chain(tweens[tweens.length - 1]);
            }
            return cur;
        });
    }
    start() {
        if (this.tweens.length > 0){
            this.tweens[0].start();
        }
    }
}
export default Animation;