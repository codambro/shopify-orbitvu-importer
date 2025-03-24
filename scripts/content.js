/**
 * This script will be directly injected into the client
 */

const DEFAULT_ORBITVU_EXPORTS_DIR = "/default/orbitvu/exports/path"

async function import_orbitvu() {
    const orbitvu_exports_dir = (await chrome.storage.sync.get(["orbitvu_exports_dir"])).orbitvu_exports_dir || DEFAULT_ORBITVU_EXPORTS_DIR;
    alert(orbitvu_exports_dir + '\nNOT IMPLEMENTED')
}


// Communication with dropdown menu on extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.task == "import") {
      import_orbitvu();
    }
  }
)
