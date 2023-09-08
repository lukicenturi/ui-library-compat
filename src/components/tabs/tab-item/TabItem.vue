<script lang="ts" setup>
export interface TabItemProps {
  active?: boolean;
  value: number | string;
  eager?: boolean;
  reverse?: boolean;
}

defineOptions({
  name: 'RuiTabItem',
});

withDefaults(defineProps<TabItemProps>(), {
  eager: false,
  active: false,
  reverse: false,
});

const css = useCssModule();
</script>

<template>
  <div :class="[css.tab, { 'active-tab-item': active }]">
    <Transition
      enter-active-class="w-full transform duration-300 transition"
      leave-active-class="w-full transform duration-300 transition"
      :enter-class="`opacity-0 ${reverse ? '-translate-x-8' : 'translate-x-8'}`"
      enter-to-class="opacity-100 translate-x-0"
      leave-class="opacity-100 translate-x-0"
      :leave-to-class="`opacity-0 ${
        reverse ? 'translate-x-8' : '-translate-x-8'
      }`"
    >
      <slot v-if="active" />
    </Transition>
    <div v-if="eager && !active" class="hidden">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" module>
.tab {
  @apply absolute top-0 left-0 w-full;
}
</style>
