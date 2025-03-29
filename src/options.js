const STATUS_DISPLAY_TIME = 1500;

// Saves options to chrome.storage
const saveOptions = () => {
    const debug = document.getElementById('debug').checked;
    const orbitvu_meta_filename = document.getElementById('orbitvu_meta_filename').value;
    const status = document.getElementById('status');
  
    // Validate input
    errMsg = null;
    if (!orbitvu_meta_filename || !orbitvu_meta_filename.trim()) {
      errMsg = "Metadata file can not be blank."
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
        orbitvu_meta_filename: orbitvu_meta_filename.trim()
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
        orbitvu_meta_filename: "test.txt"
       },
      (items) => {
        document.getElementById('debug').checked = items.debug;
        document.getElementById('orbitvu_meta_filename').value = items.orbitvu_meta_filename;

      }
    );
  };
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);