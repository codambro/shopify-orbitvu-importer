/**
 * This script will be directly injected into the client
 */

function import_orbitvu() {
    alert('NOT IMPLEMENTED')
}


// Communication with dropdown menu on extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.task == "import") {
      import_orbitvu();
    }
  }
)
