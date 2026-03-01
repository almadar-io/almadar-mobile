import { device, element, by, expect } from 'detox';

describe('Storybook Components', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: { STORYBOOK_ENABLED: true },
    });
  });

  it('should render Button stories', async () => {
    await expect(element(by.text('Button'))).toBeVisible();
  });

  it('should render Typography stories', async () => {
    await expect(element(by.text('Typography'))).toBeVisible();
  });

  it('should render Stack stories', async () => {
    await expect(element(by.text('Stack'))).toBeVisible();
  });
});
