/**
 * This script will be directly injected into the client
 */

const DEFAULT_ORBITVU_EXPORTS_DIR = "/default/orbitvu/exports/path"


async function import_orbitvu() {
  const dirHandle = await window.showDirectoryPicker();
  let file = null;
  for await (const [key, value] of dirHandle.entries()) {
    if (key == "test.txt") {
      file = await value.getFile();
      break;
    }
  }
  if (file) {
    console.log("Reading file", file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      console.log(fileContent);
    }
    reader.readAsText(file);
  }

}


// Communication with dropdown menu on extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.task == "import") {
      import_orbitvu();
    }
  }
)
