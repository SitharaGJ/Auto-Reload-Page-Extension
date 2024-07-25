document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleReload');
  const tabSelect = document.getElementById('tabSelect');
  
  chrome.storage.local.get(['isReloading', 'minTime', 'maxTime', 'tabId'], (result) => {
    const isReloading = result.isReloading;
    toggleButton.textContent = isReloading ? 'Stop' : 'Start';
    toggleButton.className = isReloading ? 'stop' : 'start';
    if (result.minTime) document.getElementById('minTime').value = result.minTime;
    if (result.maxTime) document.getElementById('maxTime').value = result.maxTime;
    if (result.tabId) tabSelect.value = result.tabId;
  });
  
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      const option = document.createElement('option');
      option.value = tab.id;
      option.textContent = tab.title || tab.url;
      tabSelect.appendChild(option);
    });
  });
});

document.getElementById('toggleReload').addEventListener('click', () => {
  chrome.storage.local.get('isReloading', (result) => {
    const isReloading = !result.isReloading;
    const minTime = parseInt(document.getElementById('minTime').value);
    const maxTime = parseInt(document.getElementById('maxTime').value);
    const tabId = parseInt(document.getElementById('tabSelect').value);

    if (minTime > 0 && maxTime > 0 && maxTime >= minTime) {
      chrome.storage.local.set({ isReloading, minTime, maxTime, tabId }, () => {
        const toggleButton = document.getElementById('toggleReload');
        toggleButton.textContent = isReloading ? 'Stop' : 'Start';
        toggleButton.className = isReloading ? 'stop' : 'start';
        chrome.runtime.sendMessage({ action: isReloading ? 'startReload' : 'stopReload', tabId });
      });
    } else {
      alert('Please enter valid time values.');
    }
  });
});

function updateCountdown() {
  chrome.storage.local.get('countdown', (result) => {
    const countdown = result.countdown;
    document.getElementById('time').textContent = countdown !== undefined ? countdown : 'N/A';
  });
}

// Update the countdown every second
setInterval(updateCountdown, 1000);
updateCountdown();
