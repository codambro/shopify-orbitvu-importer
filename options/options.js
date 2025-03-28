// Saves options to chrome.storage
const saveOptions = () => {
    const debug = document.getElementById('debug').checked;
  
    chrome.storage.sync.set(
      {
        debug: debug
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
        debug: false
       },
      (items) => {
        document.getElementById('debug').checked = items.debug;
      }
    );
  };
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);