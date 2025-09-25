<script setup>
import { provide, onMounted, onUnmounted } from "vue";
import { debounce } from "lodash-es";

// RWD-------------
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value <= 991);
const handleResize = debounce(() => {
  const currentIsMobile = window.innerWidth <= 991;
  if (isMobile.value !== currentIsMobile) {
    windowWidth.value = window.innerWidth;
  }
}, 500);
onMounted(async () => {
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => window.removeEventListener("resize", handleResize));
provide("isMobile", isMobile);
</script>

<template>
  <RouterView />
</template>
<style>
html {
  width: 100%;
  height: 100%;
}
</style>
