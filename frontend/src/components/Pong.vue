<template>
  <canvas ref="canvas" class="border" width="800" height="400"></canvas>
</template>
<script lang="ts">
import { onMounted, ref } from 'vue';
export default {
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null);
    onMounted(() => {
      const ctx = canvas.value?.getContext('2d');
      if (ctx) ctx.fillText('Pong Game Here', 350, 200);
    });
    return { canvas };
  }
};
</script>
<style scoped></style>