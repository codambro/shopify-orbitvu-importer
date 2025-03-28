// Saves options to chrome.storage
const saveOptions = () => {
    const debug = document.getElementById('debug').checked;
    const orbitvu_meta_filename = document.getElementById('orbitvu_meta_filename').value;
  
    chrome.storage.sync.set(
      {
        debug: debug,
        orbitvu_meta_filename: orbitvu_meta_filename
      },
      () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 750);
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