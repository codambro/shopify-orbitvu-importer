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
    orbitvu_meta_filename: (await chrome.storage.sync.get({ orbitvu_meta_filename: "session.json" })).orbitvu_meta_filename,
    metafield_map: (await chrome.storage.sync.get({ metafield_map: {} })).metafield_map
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
  CATEGORY: 'input[id="ProductCategoryPickerId"]',
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

async function set_meta_field(label, value) {
  await debugLog("set_meta_field(" + label + "," + value + ")")
  // need to click to open input box
  let selector = `div[role="button"][aria-label="Edit ${label} metafield"]`
  await debugLog(`  selector=${selector}`)
  let editBtn = document.querySelector(selector);
  if (!editBtn) {
    throw Error(`Could not find meta field ${label}: ${selector}`)
  }
  await debugLog("editBtn:")
  await debugLog(editBtn)
  editBtn.click()
  // find input field that should have popped up
  let foundInputs = []
  // give time for popover to appear
  const timeout = Date.now() + 2000;
  while (Date.now() < timeout) {
    let popovers = document.querySelectorAll('div[data-portal-id*="cardPopover"]')
    await debugLog("popovers:")
    await debugLog(popovers)
    for (let i = 0; i < popovers.length; i++) {
      input = popovers[i].querySelector("input")
      if (input) {
        foundInputs.push(input)
      }
    };
    if (foundInputs.length > 0) {
      break;
    } else {
      sleep(300);
    }
  }
  if (foundInputs.length != 1) {
    throw Error(`Could not find exactly 1 input for meta field ${label}: ${foundInputs.length}`)
  }
  // set input
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(foundInputs[0], value);
  foundInputs[0].dispatchEvent(new Event("input", { bubbles: true}));
  // click out
  document.querySelector("body").click() 
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
  const metafield_map = options.metafield_map;

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
  let title = json_data.session.name
  let desc = json_data.session.description
  let sku = json_data.session.sku
  let barcode = json_data.session.barcode

  let metadata = json_data.session.metadata


  /**
   * 
   * POPULATE SHOPIFY PAGE
   * 
   */

  if (title) {
    // Title
    await set_input_field(SHOPIFY_SELECTORS.TITLE, title);
  }
  if (desc) {
    // Description
    document.querySelector(SHOPIFY_SELECTORS.DESC_IFRAME).contentDocument.querySelector(SHOPIFY_SELECTORS.DESC_IFRAME_DESC).innerHTML = desc;
    document.querySelector(SHOPIFY_SELECTORS.DESCRIPTION).textContent = desc;
  }
  if (mediaFiles.items.length > 0) {
    // Media Files
    await set_input_field(SHOPIFY_SELECTORS.MEDIA, mediaFiles.files, true);
  }
  // TBD: Category
  // TBD: Prices
  if (sku || barcode) {
    // SKU and barcode
    checkbox = await get_checkbox_element_by_label("This product has a SKU or barcode")
    checkbox.click()
    if (sku) {
      await set_input_field(SHOPIFY_SELECTORS.SKU, sku);
    }
    if (barcode) {
      await set_input_field(SHOPIFY_SELECTORS.BARCODE, barcode);
    }
  }
  // TBD: Weight

  // meta fields
  for(let i = 0; i < metadata.length; i++) {
    let meta_name = metadata[i].name;
    if (meta_name in metafield_map) {
      let meta_value = metadata[i].value;
      let slabel = metafield_map[meta_name]
      await debugLog(`Found meta field '${meta_name}=${meta_value}'. Setting '${slabel}'`)
      await set_meta_field(slabel, meta_value);
    } else {
      await debugLog(`Ignoring meta field '${meta_name}`)
    }
  }

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
