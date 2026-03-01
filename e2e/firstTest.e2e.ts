import { device, element, by, expect } from 'detox';

describe('Almadar Mobile', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show the welcome screen', async () => {
    await expect(element(by.text('Welcome'))).toBeVisible();
  });

  it('should display button component', async () => {
    await expect(element(by.text('Button'))).toBeVisible();
  });

  it('should handle button press', async () => {
    await element(by.text('Press Me')).tap();
    // Verify action was triggered
  });
});
