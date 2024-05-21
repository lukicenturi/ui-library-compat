<script lang="ts" setup>
import RuiButton from '@/components/buttons/button/Button.vue';
import RuiIcon from '@/components/icons/Icon.vue';
import RuiMenu, { type MenuProps } from '@/components/overlays/menu/Menu.vue';

export type T = any;

export type K = keyof T;

export interface Props {
  options: T[];
  keyAttr?: K;
  textAttr?: K;
  value?: T | null;
  disabled?: boolean;
  readOnly?: boolean;
  dense?: boolean;
  clearable?: boolean;
  label?: string;
  menuOptions?: MenuProps;
  labelClass?: string;
  menuClass?: string;
  optionClass?: string;
  prependWidth?: number; // in rem
  appendWidth?: number; // in rem
  itemHeight?: number; // in px
  variant?: 'default' | 'filled' | 'outlined';
  hint?: string;
  errorMessages?: string | string[];
  successMessages?: string | string[];
  hideDetails?: boolean;
  autoSelectFirst?: boolean;
}

defineOptions({
  name: 'RuiMenuSelect',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readOnly: false,
  dense: false,
  clearable: false,
  hideDetails: false,
  label: 'Select',
  prependWidth: 0,
  appendWidth: 0,
  variant: 'default',
  hint: undefined,
  keyAttr: undefined,
  textAttr: undefined,
  itemHeight: undefined,
  errorMessages: () => [],
  successMessages: () => [],
  autoSelectFirst: false,
});

const emit = defineEmits<{
  (e: 'input', value?: T | null): void;
}>();

const css = useCssModule();
const attrs = useAttrs();

const { dense, variant } = toRefs(props);

const activator = ref();
const { focused } = useFocus(activator);

const isPrimitiveOptions = computed(() => !(props.options[0] instanceof Object));

const keyProp = computed(() => props.keyAttr ?? 'key');
const textProp = computed(() => props.textAttr ?? 'label');

const mappedOptions = computed(() => {
  if (!get(isPrimitiveOptions))
    return props.options;

  return props.options.map(option => ({
    [get(keyProp)]: option,
    [get(textProp)]: option,
  }));
});

const value = computed({
  get: () => {
    if (props.keyAttr || get(isPrimitiveOptions))
      return get(mappedOptions).find(option => option[get(keyProp)] === props.value);
    return props.value;
  },
  set: (selected) => {
    const selection = props.keyAttr || get(isPrimitiveOptions) ? selected[get(keyProp)] : selected;
    return emit('input', selection);
  },
});

const labelWithQuote = computed(() => {
  if (!props.label)
    return '"\\200B"';

  return `'  ${props.label}  '`;
});

const {
  containerProps,
  wrapperProps,
  renderedData,
  isOpen,
  menuWidth,
  getText,
  getIdentifier,
  isActiveItem,
  menuRef,
  highlightedIndex,
  moveHighlight,
} = useDropdownMenu<T, K>({
  itemHeight: props.itemHeight ?? (props.dense ? 30 : 48),
  keyAttr: get(keyProp),
  textAttr: get(textProp),
  options: mappedOptions,
  autoFocus: true,
  dense,
  value,
  autoSelectFirst: props.autoSelectFirst,
});

const outlined = computed(() => get(variant) === 'outlined');

const float = computed(() => (get(isOpen) || !!get(value)) && get(outlined));

const virtualContainerProps = computed(() => ({
  style: containerProps.style as any,
  ref: containerProps.ref as any,
}));

function setValue(val: T, index?: number) {
  if (isDefined(index))
    set(highlightedIndex, index);

  set(value, val);
  set(focused, true);
}
</script>

<template>
  <RuiMenu
    v-model="isOpen"
    :class="css.wrapper"
    v-bind="{
      placement: 'bottom-start',
      closeOnContentClick: true,
      fullWidth: true,
      ...menuOptions,
      errorMessages,
      successMessages,
      hint,
      dense,
      showDetails: !hideDetails,
      disabled,
    }"
  >
    <template #activator="{ on, open, hasError, hasSuccess }">
      <slot
        name="activator"
        v-bind="{ disabled, value, variant, readOnly, on, open, hasError, hasSuccess }"
      >
        <button
          ref="activator"
          :disabled="disabled"
          :aria-disabled="disabled"
          type="button"
          :tabindex="disabled || readOnly ? -1 : 0"
          :class="[
            css.activator,
            labelClass,
            {
              [css.disabled]: disabled,
              [css.readonly]: readOnly,
              [css.outlined]: outlined,
              [css.dense]: dense,
              [css.float]: float,
              [css.opened]: open,
              [css['with-value']]: !!value,
              [css['with-error']]: hasError,
              [css['with-success']]: hasSuccess && !hasError,
            },
          ]"
          v-bind="attrs"
          data-id="activator"
          v-on="readOnly ? {} : on"
          @keydown.up.prevent="moveHighlight(true)"
          @keydown.down.prevent="moveHighlight(false)"
        >
          <span
            v-if="outlined || !value"
            :class="[
              css.label,
              {
                'absolute': outlined,
                'pr-2': !value && !open && outlined,
              },
            ]"
          >
            <slot
              name="activator.label"
              v-bind="{ value }"
            >
              {{ label }}
            </slot>
          </span>
          <span
            v-if="value"
            class="w-full"
            :class="css.value"
          >
            <slot
              name="selection.prepend"
              v-bind="{ item: value }"
            />
            <slot
              name="selection"
              v-bind="{ item: value }"
            >
              {{ getText(value) }}
            </slot>
          </span>

          <span
            v-if="clearable && value && !disabled"
            :class="css.clear"
            @click.stop.prevent="emit('input', null)"
          >
            <RuiIcon
              color="error"
              name="close-line"
              size="18"
            />
          </span>

          <span :class="css.icon__wrapper">
            <RuiIcon
              :class="[css.icon, { 'rotate-180': open }]"
              :size="dense ? 24 : 32"
              name="arrow-drop-down-fill"
            />
          </span>
        </button>
        <fieldset
          v-if="outlined"
          :class="css.fieldset"
        >
          <legend :class="{ 'px-2': float }" />
        </fieldset>
      </slot>
      <input
        :value="value ? value[keyProp] : ''"
        class="hidden"
        type="hidden"
      />
    </template>
    <template #default="{ width }">
      <div
        :class="[css.menu, menuClass]"
        :style="{ width: `${width}px`, minWidth: menuWidth }"
        v-bind="virtualContainerProps"
        @scroll="containerProps.onScroll"
        @keydown.up.prevent="moveHighlight(true)"
        @keydown.down.prevent="moveHighlight(false)"
      >
        <div
          v-bind="wrapperProps"
          ref="menuRef"
        >
          <RuiButton
            v-for="(item) in renderedData"
            :key="item.index"
            :active="isActiveItem(item)"
            :size="dense ? 'sm' : undefined"
            :value="getIdentifier(item)"
            variant="list"
            :class="{
              highlighted: highlightedIndex === item.index,
              [css.highlighted]: !isActiveItem(item) && highlightedIndex === item.index,
            }"
            @input="setValue(item, item.index)"
            @mousedown="highlightedIndex = item.index"
          >
            <template #prepend>
              <slot
                name="item.prepend"
                v-bind="{ disabled, item, active: isActiveItem(item) }"
              />
            </template>
            <slot
              name="item"
              v-bind="{ disabled, item, active: isActiveItem(item) }"
            >
              {{ getText(item) }}
            </slot>
            <template #append>
              <slot
                name="item.append"
                v-bind="{ disabled, item, active: isActiveItem(item) }"
              />
            </template>
          </RuiButton>
        </div>
      </div>
    </template>
  </RuiMenu>
</template>

<style lang="scss" module>
.wrapper {
  @apply w-full inline-flex flex-col;

  .activator {
    @apply relative inline-flex items-center w-full;
    @apply outline-none focus:outline-none cursor-pointer min-h-14 pl-3 py-2 pr-8 rounded;
    @apply m-0 bg-white transition-all text-body-1 text-left hover:border-black;

    &:not(.outlined) {
      @apply hover:bg-gray-100 focus-within:bg-gray-100;
    }

    &.dense {
      @apply py-1 min-h-10;

      ~ .fieldset {
        @apply px-2;
      }
    }

    &.disabled {
      @apply opacity-65 text-rui-text-disabled active:text-rui-text-disabled cursor-default pointer-events-none;
    }

    &.readonly {
      @apply opacity-80 pointer-events-none cursor-default bg-gray-50;
    }

    &.outlined {
      @apply border-none hover:border-none;

      &.opened,
      &:focus {
        @apply border-rui-primary;

        ~ .fieldset {
          @apply border-rui-primary #{!important};
          @apply border-2 #{!important};
        }
      }

      ~ .fieldset {
        @apply border border-black/[0.23];
      }

      &:hover {
        ~ .fieldset {
          @apply border-black;
        }
      }

      &.disabled {
        ~ .fieldset {
          @apply border-dotted;
          @apply border-black/[0.23] #{!important};
        }
      }

      &.with-success {
        .label {
          @apply text-rui-success #{!important};
        }

        ~ .fieldset {
          @apply border-rui-success #{!important};
        }
      }

      &.with-error {
        .label {
          @apply text-rui-error #{!important};
        }

        ~ .fieldset {
          @apply border-rui-error #{!important};
        }
      }
    }

    .label {
      @apply text-rui-text-secondary;
      max-width: calc(100% - 2.5rem);
    }

    .label,
    .value {
      @apply block truncate transition-all duration-75;
    }

    .clear {
      @apply ml-auto shrink-0;
    }

    .icon {
      @apply text-rui-text transition;

      &__wrapper {
        @apply flex items-center justify-end;
        @apply absolute right-1 top-px bottom-0;
      }
    }

    &.float {
      .label {
        @apply -translate-y-2 top-0 text-xs px-1;
      }

      ~ .fieldset {
        legend {
          &:after {
            content: v-bind(labelWithQuote);
          }
        }
      }

      &.opened,
      &.opened.with-value,
      &:focus,
      &:focus.with-value {
        .label {
          @apply text-rui-primary;
        }

        ~ .fieldset {
          @apply border-rui-primary;
          @apply border-2 #{!important};
        }
      }
    }
  }

  .fieldset {
    @apply absolute w-full min-w-0 h-[calc(100%+0.5rem)] top-0 left-0 rounded pointer-events-none px-2 transition-all -mt-2;

    legend {
      @apply opacity-0 text-xs truncate;
      max-width: calc(100% - 1rem);

      &:before {
        content: ' ';
      }

      &:after {
        @apply truncate max-w-full leading-[0];
        content: '\200B';
      }
    }
  }
}

.menu {
  @apply overflow-y-auto max-h-60 min-w-[2.5rem];
}

.highlighted {
  @apply bg-rui-grey-200 #{!important};

  &.active {
    @apply bg-rui-grey-300 #{!important};
  }
}

:global(.dark) {
  .wrapper {
    .activator {
      @apply bg-transparent text-rui-text;

      &:not(.outlined) {
        @apply hover:bg-white/10 focus-within:bg-white/10;

        &.disabled {
          @apply bg-white/10;
        }
      }

      &.readonly {
        @apply bg-white/10;
      }

      &.outlined {
        ~ .fieldset {
          @apply border-white/[0.23];
        }

        &.disabled {
          ~ .fieldset {
            @apply border-white/[0.23] #{!important};
          }
        }

        &:hover {
          ~ .fieldset {
            @apply border-white;
          }
        }
      }
    }
  }

  .highlighted {
    @apply bg-rui-grey-800 #{!important};

    &.active {
      @apply bg-rui-grey-700 #{!important};
    }
  }
}
</style>
