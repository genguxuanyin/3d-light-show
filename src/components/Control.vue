<template>
  <div class="control">
    <div class="v v1">
      <mt-range v-model="v1" :min="-v/2" :max="v/2" :step="2" :bar-height="2"></mt-range>
    </div>
    <div class="v v2">
      <mt-range v-model="v2" :min="-v/2" :max="v/2" :step="2" :bar-height="2"></mt-range>
    </div>
  </div>
</template>
<script>
import { Range } from "mint-ui";
export default {
  name: "control",
  data() {
    return {
      v: 90,
      v1: 0,
      v2: 0
    };
  },
  watch: {
    v1() {
      this.change("v1");
    },
    v2() {
      this.change("v2");
    }
  },
  methods: {
    change(type) {
      this.$emit("change", { type, v: this[type] });
    }
  }
};
</script>
<style scoped>
.control {
  position: fixed;
  bottom: 2rem /* 40/20 */;
  left: 2rem /* 40/20 */;
}
.control .v {
  width: 12rem /* 240/20 */;
}
</style>
