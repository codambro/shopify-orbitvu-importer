/**
 * This script will be directly injected into the client
 */

const DEFAULT_ORBITVU_EXPORTS_DIR = "/default/orbitvu/exports/path"

const sleep = ms => new Promise(r => setTimeout(r, ms));

// FIXME: Update these
const ORBITVU_META_FILENAME = "test.txt"

const SHOPIFY_SELECTORS = {
  TITLE: 'input[name="title"]',
  DESCRIPTION: '[data-id="product-description"]>p',
  PRICE: 'input[name="price"]',
  COMPARE_AT_PRICE: 'input[name="compareAtPrice"]',
  COST_PER_ITEM: 'input[name="unitCost"]',
  SKU: 'input[name="sku"]',
  BARCODE: 'input[name="barcode"]',
  WEIGHT: 'input[name="weight"]',
  WEIGHT_UNIT_DROPDOWN: 'select[name="weightUnit"]'
}

async function import_orbitvu() {
  // Prompt user for directory of orbitvu project
  const dirHandle = await window.showDirectoryPicker();

  // get meta file
  let file = null;
  for await (const [key, value] of dirHandle.entries()) {
    if (key == ORBITVU_META_FILENAME) {
      file = await value.getFile();
      break;
    }
  }

  // read meta file
  let fileContent = null;
  if (file) {
    console.log("Reading file", file);
    const reader = new FileReader();
    reader.onload = (e) => {
      fileContent = e.target.result;
    }
    reader.readAsText(file);
    while (reader.readyState != FileReader.DONE) {
      console.log("LOADING (",reader.readyState, ")");
      await sleep(200);
    }
    console.log(fileContent);
  }

  // file in text field in browser
  let titleField = document.querySelector(SHOPIFY_SELECTORS.TITLE)
  titleField.value = fileContent;
}


// Communication with dropdown menu on extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.task == "import") {
      import_orbitvu();
    }
  }
)
