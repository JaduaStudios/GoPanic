let isPanicModeActive = false;
let replacedTabs = [];

browser.runtime.onInstalled.addListener(() => {
  // Set initial state
  browser.storage.local.set({ isPanicModeActive, replacedTabs });
});

browser.commands.onCommand.addListener((command) => {
  if (command === "togglePanicButton") {
    togglePanicMode();
  }
});

function togglePanicMode() {
  isPanicModeActive = !isPanicModeActive;

  if (isPanicModeActive) {
    replaceTabs();
  } else {
    reopenReplacedTabs();
  }

  browser.storage.local.set({ isPanicModeActive, replacedTabs });
}

function replaceTabs() {
  const wellKnownWebsites = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "http://jaduastudios.com/",
    "https://en.wikipedia.org/wiki/Water",
	"https://en.wikipedia.org/wiki/Wet_wipe",
	"https://soundcloud.com/jaduastudios",
	"https://www.britannica.com/place/Berlin",
	"https://www.coolmathgames.com/0-run-3",
	"https://pinterest.com/pin/738871882601836530/",
	"https://www.youtube.com/watch?v=pBk4NYhWNMM",
	"https://www.minecraft.net/",
	"https://store.steampowered.com/app/227300/Euro_Truck_Simulator_2/",
  ];

  replacedTabs = [];

  browser.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      const randomIndex = Math.floor(Math.random() * wellKnownWebsites.length);
      const randomUrl = wellKnownWebsites[randomIndex];
      replacedTabs.push({ tabId: tab.id, originalUrl: tab.url });
      browser.tabs.update(tab.id, { url: randomUrl });
    });
  });
}

function reopenReplacedTabs() {
  replacedTabs.forEach((tabInfo) => {
    browser.tabs.update(tabInfo.tabId, { url: tabInfo.originalUrl });
  });

  replacedTabs = [];
  browser.storage.local.set({ replacedTabs });
}

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (isPanicModeActive && !removeInfo.isWindowClosing) {
    browser.tabs.get(tabId, (tab) => {
      // Check if the tab is one of the replaced tabs
      const replacedTabInfo = replacedTabs.find((info) => info.tabId === tab.id);
      if (replacedTabInfo) {
        // Do not add to closedTabs, as it was replaced during panic mode
        return;
      }

      closedTabs.push(tab.url);
      browser.storage.local.set({ closedTabs });
    });
  }
});
