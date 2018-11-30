import * as THREE from "three";
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
            if (pro.type != cur.type) return cur;
            if (pro.type == 'position' && cur.type == 'position') {
                tweens.push(
                    new TWEEN.Tween(pro.data)
                    .to(cur.data)
                    .delay(1000)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate(data => {
                        object.position.copy(data);
                    })
                )
            } else if (pro.type == 'rotation' && cur.type == 'rotation') {
                tweens.push(
                    new TWEEN.Tween(pro.data).to(cur.data).onUpdate(data => {
                        object.setRotationFromAxisAngle(
                            new THREE.Vector3(0, 1, 0),
                            this.toRadians(data.rotation)
                        );
                    })
                )
            }
            if (tweens.length >= 2) {
                tweens[this.tweens.length - 2].chain(tweens[tweens.length - 1]);
            }
            return cur;
        });
    }
    start() {
        if (this.tweens.length > 0) {
            this.tweens[0].start();
        }
    }
    toRadians(angle) {
        return (angle * 2 * Math.PI) / 360;
    }
}
export default Animation;