<template>
  <button
    class="button"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Button',
  props: {
    label: {
      type: String,
      default: 'Button',
    },
    onClick: {
      type: Function,
      default: () => {},
    },
  },
  setup(props) {
    const handleClick = () => {
      props.onClick();
    };

    const handleMouseDown = (event: MouseEvent) => {
      (event.target as HTMLElement).classList.add('active');
    };

    const handleMouseUp = (event: MouseEvent) => {
      (event.target as HTMLElement).classList.remove('active');
    };

    const handleFocus = (event: FocusEvent) => {
      (event.target as HTMLElement).classList.add('focus');
    };

    const handleBlur = (event: FocusEvent) => {
      (event.target as HTMLElement).classList.remove('focus');
    };

    return {
      handleClick,
      handleMouseDown,
      handleMouseUp,
      handleFocus,
      handleBlur,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles.scss';
</style>