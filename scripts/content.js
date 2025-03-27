/**
 * This script will be directly injected into the client
 */


const sleep = ms => new Promise(r => setTimeout(r, ms));

// FIXME: Update these
const ORBITVU_META_FILENAME = "test.txt"

const SHOPIFY_SELECTORS = {
  TITLE: 'input[name="title"]',
  // These are for aesthetic on the page
  DESC_IFRAME: '#product-description_ifr',
  DESC_IFRAME_DESC: '#tinymce',
  // This is hidden, but is what is actually read and sent to backend
  DESCRIPTION: '#product-description',
  MEDIA: 'input[type="file"]',
  PRICE: 'input[name="price"]',
  COMPARE_AT_PRICE: 'input[name="compareAtPrice"]',
  COST_PER_ITEM: 'input[name="unitCost"]',
  SKU: 'input[name="sku"]',
  BARCODE: 'input[name="barcode"]',
  WEIGHT: 'input[name="weight"]',
  WEIGHT_UNIT_DROPDOWN: 'select[name="weightUnit"]'
}

function set_input_field(selector, value) {
  // Shopify does lots of behind-the-scenes updating with the native
  // value setter. Simply updating value attribute is not sufficient.
  const inputElem = document.querySelector(selector)
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(inputElem, value);
  inputElem.dispatchEvent(new Event('input', { bubbles: true}));
}

function get_checkbox_element_by_label(label, selector = "span") {
  for (const el of document.querySelectorAll(selector)) {
    if (el.textContent.includes(label)) {
      return el.closest("label").querySelector("input[type=checkbox]")
    }
  }
  throw ReferenceError("Could not find checkbox with " + selector + " text '" + label + "'")
}

async function import_orbitvu() {
  /**
   * 
   * GET INPUT DATA
   */

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

  /**
   * 
   * POPULATE SHOPIFY PAGE
   * 
   */

  // Title
  set_input_field(SHOPIFY_SELECTORS.TITLE, fileContent);
  // Description
  document.querySelector(SHOPIFY_SELECTORS.DESC_IFRAME).contentDocument.querySelector(SHOPIFY_SELECTORS.DESC_IFRAME_DESC).innerHTML = fileContent;
  document.querySelector(SHOPIFY_SELECTORS.DESCRIPTION).textContent = fileContent;
  // Prices
  set_input_field(SHOPIFY_SELECTORS.PRICE, "3.50")
  set_input_field(SHOPIFY_SELECTORS.COMPARE_AT_PRICE, "4.20")
  set_input_field(SHOPIFY_SELECTORS.COST_PER_ITEM, "0.69")
  // SKU/barcode
  checkbox = get_checkbox_element_by_label("This product has a SKU or barcode")
  checkbox.click()
  set_input_field(SHOPIFY_SELECTORS.SKU, fileContent);
  set_input_field(SHOPIFY_SELECTORS.BARCODE, fileContent);
  // weight
  set_input_field(SHOPIFY_SELECTORS.WEIGHT, "20.5");
  // TBD: weight unit...
}


// Communication with dropdown menu on extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.task == "import") {
      import_orbitvu();
    }
  }
)
