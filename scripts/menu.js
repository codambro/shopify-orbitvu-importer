const IMPORT = "import";

function contextClick(info, tab) {
    const { menuItemId } = info;
    chrome.tabs.sendMessage(tab.id, { task: menuItemId });
}

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
    id: IMPORT,
    title: "Import Orbitvu Project",
    contexts: ["action"],
});
chrome.contextMenus.onClicked.addListener(contextClick);
