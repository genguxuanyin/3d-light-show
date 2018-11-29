<script>
import { OBJLoader } from "./loaders/OBJLoader";
import { MTLLoader } from "./loaders/MTLLoader";
import { toIndexed } from "./util";
import mixin from "./model-mixin.vue";

import * as THREE from "three";
import { getSize, getCenter } from "./util";

export default {
  name: "model-obj",
  mixins: [mixin],
  props: {
    lights: {
      type: Array,
      default() {
        return [
          {
            type: "ambientlight",
            color: 0xffffff,
            intensity: 0.8
          },
          {
            type: "hemispherelight",
            position: { x: 0, y: 1, z: 0 },
            skyColor: 0xaaaaff,
            groundColor: 0x806060,
            intensity: 0.6
          },
          {
            type: "directionallight",
            position: { x: 1, y: 1, z: 1 },
            color: 0xffffff,
            intensity: 0.8
          }
        ];
      }
    },
    smoothing: {
      type: Boolean,
      default: false
    },
    models: {
      type: Array,
      default() {
        return [];
      }
    },
    hasSkyBox: {
      type: Boolean,
      default: false
    },
    hasGrid: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    mtlLoader.setCrossOrigin(this.crossOrigin);

    return {
      loader: objLoader,
      mtlLoader,
      activeObject: null,
      spriteRotation:0
    };
  },
  watch: {
    models() {
      this.load();
    },
    skyBox() {
      if (this.hasSkyBox) {
        this.createSkyBox();
      }
    }
  },
  methods: {
    process(object) {
      if (this.smoothing) {
        object.traverse(child => {
          if (child.geometry) {
            child.geometry = toIndexed(child.geometry);
            child.geometry.computeVertexNormals();
          }
        });
      }
    },
    load() {
      if (this.models.length <= 0) return;
      this.models.forEach((value, index, arr) => {
        let type = value.type;
        let isActive = value.isActive;
        switch (type) {
          case "load":
            let src = value.src;
            let mtl = value.mtl;
            let mtlPath = value.mtlPath;
            this._load(src, mtl, mtlPath, !!isActive);
            break;
        }
      });
    },
    _load(src, mtl, mtlPath, isActive) {
      if (!src) return;

      const loader = new OBJLoader();
      const mtlLoader = new MTLLoader();

      mtlLoader.setCrossOrigin(this.crossOrigin);

      if (this.object) {
        //this.wrapper.remove(this.object);
      }

      const onLoad = object => {
        if (this.process) {
          this.process(object);
        }

        if (isActive) {
          this.activeObject = object;
          this.$emit("on-changeActive", this.activeObject);
          console.log("actived:", this.activeObject);
        }

        this.addObject(object);

        this.$emit("on-load");
      };

      const onProgress = xhr => {
        this.$emit("on-progress", xhr);
      };

      const onError = err => {
        this.$emit("on-error", err);
      };

      if (mtl) {
        let mtlSrc = mtl;

        if (!mtlPath) {
          const result = /^(.*\/)([^/]*)$/.exec(mtl);

          if (result) {
            mtlPath = result[1];
            mtlSrc = result[2];
            console.log(mtlPath);
            console.log(mtlSrc);
          }
        }

        if (mtlPath) {
          mtlLoader.setPath(mtlPath);
        }

        mtlLoader.load(
          mtlSrc,
          materials => {
            materials.preload();

            loader.setMaterials(materials);

            loader.load(src, onLoad, onProgress, onError);
          },
          () => {},
          onError
        );
      } else {
        loader.load(src, onLoad, onProgress, onError);
      }
    },
    createSkyBox() {
      if (!this.hasSkyBox) return;
      var cubeMap = new THREE.CubeTexture([]);
      cubeMap.format = THREE.RGBFormat;
      new THREE.ImageLoader().load("./img/skybox.png", img => {
        var size = 256;
        var getSide = function(x, y) {
          var canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          canvas.fillStyle = "#aec5da";
          var context = canvas.getContext("2d");
          if (img) {
            context.drawImage(img, -x * size, -y * size);
          }

          return canvas;
        };
        cubeMap.images[0] = getSide(2, 1); // px
        cubeMap.images[1] = getSide(0, 1); // nx
        cubeMap.images[2] = getSide(1, 0); // py
        cubeMap.images[3] = getSide(1, 2); // ny
        cubeMap.images[4] = getSide(1, 1); // pz
        cubeMap.images[5] = getSide(3, 1); // nz
        cubeMap.needsUpdate = true;

        var cubeShader = THREE.ShaderLib["cube"];
        cubeShader.uniforms["tCube"].value = cubeMap;
        var skyBoxMaterial = new THREE.ShaderMaterial({
          fragmentShader: cubeShader.fragmentShader,
          vertexShader: cubeShader.vertexShader,
          uniforms: cubeShader.uniforms,
          depthWrite: false,
          side: THREE.BackSide
        });

        var skyBox = new THREE.Mesh(
          new THREE.BoxGeometry(size * 30, size * 30, size * 30),
          skyBoxMaterial
        );
        //this.addObject( skyBox )
        this.wrapper.add(skyBox);
      });
    },
    createGrid() {
      if (!this.hasGrid) return;
      this.wrapper.add(new THREE.GridHelper(5000, 50, "#000", "#888"));
      this.createSprite();
    },
    createSprite() {
      var texture = THREE.ImageUtils.loadTexture("./img/sprite.png");
      texture.center.set( 0.5, 0.5 );
      var material = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false
      });
      var sprite = new THREE.Sprite(material);
      sprite.position.set(0, 0, 0);
      sprite.scale.set(1024, 1024, 1.0); // imageWidth, imageHeight
      this.wrapper.add(sprite);
      /* if (texture.matrixAutoUpdate === true) {
        texture.rotation = API.rotation; // rotation is around [ 0.5, 0.5 ]
      } else {
        texture.matrix.identity().rotate(API.rotation); // I don't understand how rotation can preceed scale, but it seems to be required...
      } */
      setInterval(()=>{
          this.spriteRotation += this.toRadians(6);
          texture.rotation = this.spriteRotation % (2*Math.PI);
        //   texture.matrix.identity().rotate(this.spriteRotation % (2*Math.PI));
          console.log(texture.rotation);
      },25)

      console.log(texture.rotation);
      console.log(texture.matrixAutoUpdate);
    },
    toRadians(angle) {
      return (angle * 2 * Math.PI) / 360;
    }
  }
};
</script>
