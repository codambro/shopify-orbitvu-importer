async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

async function launchImport() {
    chrome.tabs.sendMessage((await getCurrentTab()).id, { task: "import" });
};

const importbtn = document.getElementById('import')

// disable if on wrong site
chrome.tabs.query({
    active: true,
    currentWindow: true
}, function(tabs) {
    var tabURL = tabs[0].url;
    if (tabURL.includes("https://admin.shopify.com/store") &&
        tabURL.includes("/products/new")) {
            importbtn.classList.remove("disabled")
    } else {
        importbtn.classList.add("disabled")
    }
});

importbtn.addEventListener('click', launchImport);
