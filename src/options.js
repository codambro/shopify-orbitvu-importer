const STATUS_DISPLAY_TIME = 1500;

function addMetafieldLine(orbitvuValue="", shopifyValue="") {
  // get overall section
  let metafield_group = document.querySelector("div.metafield-group")
  // add new row
  let metafield = document.createElement("div")
  metafield.classList.add("metafield")
  // creatae key input to row
  let keyinput = document.createElement("input")
  keyinput.type = "text"
  keyinput.classList.add("metafield-key")
  keyinput.placeholder = "Orbitvu field..."
  if (orbitvuValue) {
    keyinput.value = orbitvuValue
  }
  // create value input for row
  let valueinput = document.createElement("input")
  valueinput.type = "text"
  valueinput.classList.add("metafield-value")
  valueinput.placeholder = "Shopify field..."
  if (shopifyValue) {
    valueinput.value = shopifyValue
  }
  // create delete button for row
  let delbutton = document.createElement("p")
  delbutton.classList.add("metafield-delete")
  delbutton.innerHTML = "&#10060;"
  delbutton.addEventListener("click", (evt) => {
    evt.target.closest("div.metafield").remove()
  })
  // add all elements to page
  //metafield.appendChild(document.createElement("br"))
  metafield.appendChild(keyinput)
  metafield.appendChild(valueinput)
  metafield.appendChild(delbutton);
  metafield.append(document.createElement("br"))
  metafield_group.appendChild(metafield)
  // move button down
  metafield_group.appendChild(document.getElementById('metafield-add'))
}

// Saves options to chrome.storage
const saveOptions = () => {
    const debug = document.getElementById('debug').checked;
    const orbitvu_meta_filename = document.getElementById('orbitvu_meta_filename').value;
    const status = document.getElementById('status');

    let metafield_map = {}
  
    // Validate input
    errMsg = null;
    if (!orbitvu_meta_filename || !orbitvu_meta_filename.trim()) {
      errMsg = "Metadata file can not be blank."
    } else {
      mfields = document.querySelectorAll('div.metafield')
      for (let i = 0; i < mfields.length; i++) {
        mfield_key = mfields[i].querySelector('.metafield-key').value
        mfield_value = mfields[i].querySelector('.metafield-value').value
        if (!mfield_key || !mfield_key.trim() || !mfield_value || !mfield_value.trim()) {
          errMsg = "Meta fields can not be blank."
          break;
        } else if (mfield_key.trim() in metafield_map || Object.values(metafield_map).includes(mfield_value.trim())) {
          errMsg = "Meta fields can only be defined once."
          break;
        }
        metafield_map[mfield_key.trim()] = mfield_value.trim();
      }
    }
  
    if (errMsg) {
      status.style.color = "red";
      status.textContent = 'Error: ' + errMsg;
      setTimeout(() => {
        status.textContent = '';
      }, STATUS_DISPLAY_TIME);
      return;
    }


    chrome.storage.sync.set(
      {
        debug: debug,
        orbitvu_meta_filename: orbitvu_meta_filename.trim(),
        metafield_map: metafield_map
      },
      () => {
        // Update status to let user know options were saved.
        status.style.color = "black";
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, STATUS_DISPLAY_TIME);
      }
    );
  };
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = () => {
    chrome.storage.sync.get(
      {
        debug: false,
        orbitvu_meta_filename: "session.json",
        metafield_map: {}
       },
      (items) => {
        document.getElementById('debug').checked = items.debug;
        document.getElementById('orbitvu_meta_filename').value = items.orbitvu_meta_filename;
        for (const [key, value] of Object.entries(items.metafield_map)) {
          addMetafieldLine(key, value)
        }
      }
    );
  };

  const addMetafield = () => {
    addMetafieldLine()
  }
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);
  document.getElementById('metafield-add').addEventListener('click', addMetafield);

