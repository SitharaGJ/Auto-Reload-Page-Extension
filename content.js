chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'refresh') {
        window.location.reload();
    }
});
