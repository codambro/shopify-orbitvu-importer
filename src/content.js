/**
 * This script will be directly injected into the client
 */


const sleep = ms => new Promise(r => setTimeout(r, ms));

async function debugLog(msg) {
  if ((await chrome.storage.sync.get({ debug: false })).debug) {
    console.log(msg);
  }
}

async function getOptions() {
  const data = {
    orbitvu_meta_filename: (await chrome.storage.sync.get({ orbitvu_meta_filename: "session.json" })).orbitvu_meta_filename
  }
  debugLog("Parsed options:")
  debugLog(data);
  return data;
}

// FIXME: Update these
const SHOPIFY_SELECTORS = {
  APP_FRAME: '#AppFrameScrollable',
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

async function set_input_field(selector, value, files=false) {
  await debugLog("set_input_field(" + selector + "," + value + "," + files + ")");
  // Shopify does lots of behind-the-scenes updating with the native
  // value setter. Simply updating value attribute is not sufficient.
  const inputElem = document.querySelector(selector)
  const key = files ? "files" : "value"
  const eventType = files ? "change": "input"
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, key).set.call(inputElem, value);
  inputElem.dispatchEvent(new Event(eventType, { bubbles: true}));
}

async function get_checkbox_element_by_label(label, selector = "span") {
  await debugLog("get_checkbox_element_by_label(" + label + "," + selector + ")");
  for (const el of document.querySelectorAll(selector)) {
    if (el.textContent.includes(label)) {
      return el.closest("label").querySelector("input[type=checkbox]")
    }
  }
  throw ReferenceError("Could not find checkbox with " + selector + " text '" + label + "'")
}

async function file_to_json(file) {
  await debugLog("file_to_json(<file>)");
  await debugLog(file)
  let res = null;
  const reader = new FileReader();
  reader.onload = (e) => {
    res = JSON.parse(e.target.result);
  }
  reader.readAsText(file);
  while (reader.readyState != FileReader.DONE) {
    await debugLog("LOADING (" + reader.readyState + ")");
    await sleep(200);
  }
  await debugLog(res);
  return res;
}

async function import_orbitvu() {
  await debugLog("import_orbitvu()");
  /**
   * 
   * GET INFO FROM CONFIGURABLE OPTIONS
   * 
   */
  const options = await getOptions();
  const orbitvu_meta_filename = options.orbitvu_meta_filename;

  /**
   * 
   * GET INPUT DATA
   */

  // Prompt user for directory of orbitvu project
  let dirHandle = null;
  try {
    dirHandle = await window.showDirectoryPicker(
      { id: "orbitvu-picker", startIn: "desktop" });
  } catch (AbortError) {
    await debugLog("directory picker cancelled")
    return;
  }

  // get meta file and media
  let metafile = null;
  let mediaFiles = new DataTransfer();
  for await (const [key, value] of dirHandle.entries()) {
    await debugLog("checking file: " + key)
    let file = await value.getFile();
    if (key == orbitvu_meta_filename) {
      await debugLog("metafile found: " + key);
      metafile = file;
    } else if (file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type.startsWith("model/") ||
        file.type == ".glb" ||
        file.type == ".usdz" ||
        file.type == ".gltf") {
      await debugLog("media file found: " + key);
      mediaFiles.items.add(file);
    } else {
      await debugLog("ignoring unknown file: " + key)
    }

  }

  // read meta file
  if (!metafile) {
    throw Error("Meta file not found: " + orbitvu_meta_filename);
  }
  let json_data = await file_to_json(metafile)

  // FIXME: Make this more configurable
  let session_data = json_data["session"]
  let title = session_data["name"]
  let sku = session_data["sku"]
  let desc = session_data["description"]


  /**
   * 
   * POPULATE SHOPIFY PAGE
   * 
   */

  // Title
  await set_input_field(SHOPIFY_SELECTORS.TITLE, title);
  // Description
  document.querySelector(SHOPIFY_SELECTORS.DESC_IFRAME).contentDocument.querySelector(SHOPIFY_SELECTORS.DESC_IFRAME_DESC).innerHTML = desc;
  document.querySelector(SHOPIFY_SELECTORS.DESCRIPTION).textContent = desc;
  // Media
  if (mediaFiles.items.length > 0) {
    await set_input_field(SHOPIFY_SELECTORS.MEDIA, mediaFiles.files, true);
  }
  // Prices
  //await set_input_field(SHOPIFY_SELECTORS.PRICE, "3.50")
  //await set_input_field(SHOPIFY_SELECTORS.COMPARE_AT_PRICE, "4.20")
  //await set_input_field(SHOPIFY_SELECTORS.COST_PER_ITEM, "0.69")
  // SKU/barcode
  checkbox = await get_checkbox_element_by_label("This product has a SKU or barcode")
  checkbox.click()
  await set_input_field(SHOPIFY_SELECTORS.SKU, sku);
  //await set_input_field(SHOPIFY_SELECTORS.BARCODE, fileContent);
  // weight
  //await set_input_field(SHOPIFY_SELECTORS.WEIGHT, "20.5");
  // TBD: weight unit...

  // Return to top
  document.querySelector(SHOPIFY_SELECTORS.APP_FRAME).scrollTo({ top: 0, behavior: 'smooth' });
}


// Communication with dropdown menu on extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.task == "import") {
      import_orbitvu();
    }
  }
)
