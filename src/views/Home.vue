<template>
  <div class="home">
    <app-modelObj
      :backgroundAlpha="0"
      :models="models[this.$route.params.name]"
      :hasSkyBox="hasSkyBox"
      :cameraPosition="cameraPosition"
      :controlParams="controlParams"
      @on-click="onClick"
      @on-load="onLoad"
      @on-progress="onProgress"
      @on-changeActive="onChangeAcitve"
    ></app-modelObj>
    <app-control @change="controlChange"></app-control>
    <div v-show="loading" class="example-loading"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import ModelObj from "../components/three/model-obj";
import Control from "../components/Control";
import { Toast } from "mint-ui";
// import * as TWEEN from "@tweenjs/tween.js";
var TWEEN = require("@tweenjs/tween.js");
import Animation from "../animation.js";
export default {
  name: "home",
  data() {
    return {
      cameraPosition: { x: 5000, y: 2000, z: 5000 },
      loaded: 0,
      loading: true,
      hasSkyBox: true,
      progress: 0,
      controlParams: {
        enableDamping: true, // an animation loop is required when either damping or auto-rotation are enabled
        dampingFactor: 0.25,
        screenSpacePanning: false,
        minDistance: 400,
        maxDistance: 8000,
        maxPolarAngle: Math.PI / 2
      },
      models: {
        "0": [
          /*           {
            type: "load",
            src: "./models/shapan.obj",
            mtl: "./models/shapan.mtl"
          }, */
          {
            type: "load",
            src: "./models/box.obj",
            mtl: "./models/box.mtl",
            isActive: true
          }
        ],
        "1": [
          {
            type: "load",
            src: "./models/box.obj",
            mtl: "./models/box.mtl"
          }
        ]
      }
    };
  },
  methods: {
    onClick(intersected) {
      var actives = [
        {
          type: "position",
          data: {
            x: 1000,
            y: 0,
            z: -1000
          }
        },
        {
          type: "position",
          data: {
            x: 1000,
            y: 0,
            z: 0
          }
        },
        {
          type: "position",
          data: {
            x: 0,
            y: 0,
            z: 0
          }
        },
        {
          type: "position",
          data: {
            x: 0,
            y: 0,
            z: 1000
          }
        }
      ];
      let animation = new Animation(this.activeObject,actives);
      animation.init();
      animation.start();
      // this.move(this.activeObject);
      console.log(TWEEN);
      if (!intersected) return;
      console.log(intersected);
      let name = intersected.object.name;
      if (!/^d\d+$/.test(name)) {
        console.log("模型格式不正确");
        return;
      }
      Toast({
        message: name,
        duration: 2000
      });
    },
    onLoad() {
      ++this.loaded >= this.models[this.$route.params.name].length &&
        (this.loading = false);
    },
    onProgress(ev) {
      // console.log(ev)
      this.progress = Math.round((ev.loaded / ev.total) * 100);
      // console.log(this.progress)
    },
    onChangeAcitve(activeObject) {
      this.activeObject = activeObject;
    },
    controlChange({ type, v }) {
      console.log(type, v);
      if (!this.activeObject) return;
      if (type == "v1") {
        this.activeObject.setRotationFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          this.toRadians(v)
        );
        console.log(this.activeObject);
      } else {
        this.activeObject.children[0].setRotationFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          this.toRadians(v)
        );
      }
    },
    move(object, actives) {},
    toRadians(angle) {
      return (angle * 2 * Math.PI) / 360;
    }
  },
  components: {
    "app-modelObj": ModelObj,
    "app-control": Control
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>