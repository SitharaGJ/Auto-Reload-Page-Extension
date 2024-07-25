let reloadInterval;
let countdownTimer;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startReload') {
    chrome.storage.local.get(['minTime', 'maxTime', 'tabId'], (result) => {
      const minTime = result.minTime;
      const maxTime = result.maxTime;
      const tabId = result.tabId;
      startReloading(minTime, maxTime, tabId);
    });
  } else if (message.action === 'stopReload') {
    stopReloading();
  }
});

function startReloading(minTime, maxTime, tabId) {
  if (reloadInterval) clearInterval(reloadInterval);
  if (countdownTimer) clearInterval(countdownTimer);

  function setReloadTimer() {
    const reloadTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    const reloadTimeMs = reloadTime * 1000;

    chrome.storage.local.set({ countdown: reloadTime });

    countdownTimer = setInterval(() => {
      chrome.storage.local.get('countdown', (result) => {
        let countdown = result.countdown;
        countdown -= 1;
        if (countdown <= 0) {
          countdown = 0;
          clearInterval(countdownTimer);
        }
        chrome.storage.local.set({ countdown });
        chrome.action.setBadgeText({ text: countdown.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#4caf50' });
      });
    }, 1000);

    reloadInterval = setTimeout(() => {
      chrome.tabs.reload(tabId, () => {
        setReloadTimer(); // Call the function again to set the next reload timer
      });
    }, reloadTimeMs);
  }

  setReloadTimer();
}

function stopReloading() {
  if (reloadInterval) clearInterval(reloadInterval);
  if (countdownTimer) clearInterval(countdownTimer);
  chrome.storage.local.set({ countdown: 'N/A' });
  chrome.action.setBadgeText({ text: '' });
}
