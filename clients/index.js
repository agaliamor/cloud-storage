const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const downloadForm = document.getElementById('downloadForm');
const downloadSelect = document.getElementById('downloadSelect');
const filesList = document.getElementById('filesList');

function updateFilesList() {
  fetch('http://localhost:3000/files')
    .then(response => response.json())
    .then(files => {
      filesList.innerHTML = '';

      files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        filesList.appendChild(listItem);

        const downloadOption = document.createElement('option');
        downloadOption.value = file.name;
        downloadOption.textContent = file.name;
        downloadSelect.appendChild(downloadOption);
      });
    })
    .catch(error => console.error(error));
}



uploadForm.addEventListener('submit', event => {
  event.preventDefault();

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      updateFilesList();
    })
    .catch(error => console.error(error));

  uploadForm.reset();
});

downloadForm.addEventListener('submit', event => {
  event.preventDefault();

  const selectedFile = downloadSelect.value;

  fetch(`http://localhost:3000/download/${selectedFile}`)
    .then(response => {
      if (response.ok) {
        return response.blob();
      } else {
        throw new Error('File not found');
      }
    })
    .then(blob => {
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = selectedFile;
      downloadLink.click();
    })
    .catch(error => console.error(error));
});

window.addEventListener('load', () => {
  updateFilesList();
});