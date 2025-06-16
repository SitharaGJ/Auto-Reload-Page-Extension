const path = require('path');

describe('startReloading', () => {
  const originalRandom = Math.random;
  let storageData;

  beforeEach(() => {
    jest.useFakeTimers();
    storageData = { countdown: 0 };
    global.chrome = {
      storage: {
        local: {
          set: jest.fn((obj, cb) => {
            Object.assign(storageData, obj);
            if (cb) cb();
          }),
          get: jest.fn((key, cb) => {
            if (typeof key === 'string') {
              cb({ [key]: storageData[key] });
            } else {
              cb(storageData);
            }
          }),
        },
      },
      action: {
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn(),
      },
      tabs: {
        reload: jest.fn((tabId, cb) => cb && cb()),
      },
      runtime: {
        onMessage: { addListener: jest.fn() },
      },
    };
    Math.random = jest.fn(() => 0.5);
    jest.resetModules();
  });

  afterEach(() => {
    jest.useRealTimers();
    Math.random = originalRandom;
    delete global.chrome;
  });

  test('schedules timeout and updates chrome.storage', () => {
    const { startReloading } = require(path.join('..', 'background'));
    startReloading(1, 3, 10);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
    expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ countdown: 2 });

    // advance one second for countdown interval
    jest.advanceTimersByTime(1000);
    expect(global.chrome.storage.local.set).toHaveBeenLastCalledWith({ countdown: 1 });
    expect(global.chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
  });
});
