// Saves options to chrome.storage
const saveOptions = () => {
    const orbitvu_exports_dir = document.getElementById('orbitvu_exports_dir').value;
  
    chrome.storage.sync.set(
      { orbitvu_exports_dir: orbitvu_exports_dir },
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
      { orbitvu_exports_dir: '/path/to/exports' },
      (items) => {
        document.getElementById('orbitvu_exports_dir').value = items.orbitvu_exports_dir;
      }
    );
  };
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);