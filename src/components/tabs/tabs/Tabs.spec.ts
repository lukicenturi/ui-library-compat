import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Tabs from '@/components/tabs/tabs/Tabs.vue';
import Tab from '@/components/tabs/tab/Tab.vue';

function createWrapper(options?: any) {
  return mount(Tabs, {
    ...options,
    slots: {
      default: [
        `<Tab>Tab 1</Tab>`,
        `<Tab>Tab 2</Tab>`,
        `<Tab>Tab 3</Tab>`,
        `<Tab>Tab 4</Tab>`,
      ],
    },
    stubs: {
      Tab,
      Transition: {
        template: `<span><slot></slot></span>`,
      },
    },
  });
}

describe('tabs/Tabs', () => {
  it('renders properly', async () => {
    const wrapper = createWrapper();

    await nextTick();

    const buttons = wrapper.findAll('div[class*=_tabs-wrapper] > button');

    expect(buttons).toHaveLength(4);
    expect(buttons.at(0).classes()).toEqual(
      expect.arrayContaining([expect.stringMatching(/active-tab/)]),
    );
  });

  it('pass vertical props', async () => {
    const wrapper = createWrapper({});

    expect(wrapper.classes()).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/_tabs--vertical_/)]),
    );

    await wrapper.setProps({
      vertical: true,
    });
    await nextTick();
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([expect.stringMatching(/_tabs--vertical_/)]),
    );

    expect(wrapper.find('div[class*=_tabs-wrapper] > button').classes()).toEqual(
      expect.arrayContaining([expect.stringMatching(/_tab--vertical_/)]),
    );
  });

  it('pass grow props', async () => {
    const wrapper = createWrapper({});

    expect(wrapper.find('div[class*=tabs-bar]').classes()).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/_tabs-bar--grow/)]),
    );

    await wrapper.setProps({
      grow: true,
    });
    expect(wrapper.find('div[class*=tabs-bar]').classes()).toEqual(
      expect.arrayContaining([expect.stringMatching(/_tabs-bar--grow/)]),
    );

    expect(wrapper.find('div[class*=_tabs-wrapper] > button').classes()).toEqual(
      expect.arrayContaining([expect.stringMatching(/_tab--grow/)]),
    );
  });

  it('pass disabled props', async () => {
    const wrapper = createWrapper({});

    expect(wrapper.find('button').attributes('disabled')).toBeUndefined();

    await wrapper.setProps({
      disabled: true,
    });

    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('pass align props', async () => {
    const wrapper = createWrapper({});

    expect(wrapper.find('button').classes()).toEqual(
      expect.arrayContaining([expect.stringMatching(/_tab--center_/)]),
    );

    await wrapper.setProps({ align: 'start' });
    expect(wrapper.find('button').classes()).toEqual(
      expect.arrayContaining([expect.stringMatching(/_tab--start_/)]),
    );

    await wrapper.setProps({ align: 'end' });
    expect(wrapper.find('button').classes()).toEqual(
      expect.arrayContaining([expect.stringMatching(/_tab--end_/)]),
    );
  });

  it('click tab change the value', async () => {
    const value = ref();
    const wrapper = createWrapper({
      listeners: {
        input: (e: any) => set(value, e),
      },
      propsData: {
        value,
      },
    });

    await nextTick();
    let buttons = wrapper.findAll('div[class*=_tabs-wrapper] > button');

    expect(buttons).toHaveLength(4);
    expect(buttons.at(0).classes()).toEqual(
      expect.arrayContaining([expect.stringMatching(/active-tab/)]),
    );

    await buttons.at(1).trigger('click');
    await nextTick();
    expect(get(value)).toBe(1);

    buttons = wrapper.findAll('div[class*=_tabs-wrapper] > button');
    await buttons.at(2).trigger('click');
    await nextTick();
    expect(get(value)).toBe(2);

    buttons = wrapper.findAll('div[class*=_tabs-wrapper] > button');
    await buttons.at(3).trigger('click');
    await nextTick();
    expect(get(value)).toBe(3);
  });
});
