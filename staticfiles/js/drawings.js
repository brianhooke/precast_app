
// Function to create and show the modal
function showDrawings(drawings_sorted) {
    var modalHtml = `
    <div class="modal fade" id="drawingsModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 300px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Drawings</h5>
                    <p></p>
                </div>
                <div class="modal-body" style="overflow-x: auto;">
                    <table>
                        <tr>
                            <th>General Arrangements</th>
                        </tr>
                        <tbody>`;
            for (let drawing of drawings_sorted) {
                if (drawing.type === 'Arrangement') {
                modalHtml += `
                            <tr>
                                <td>
                                    <a href="${drawing.pdf_file}" target="_blank">${drawing.name}</a>
                                </td>
                            </tr>                    
                            `;
                }
            }
            modalHtml += `
                        </tbody>
                    </table>
                    <br>
                    <table>
                        <tr>
                            <th>Structural Drawings</th>
                        </tr>
                        <tbody>`;
            for (let drawing of drawings_sorted) {
                if (drawing.type === 'Structural') {
                modalHtml += `
                            <tr>
                                <td>
                                    <a href="${drawing.pdf_file}" target="_blank">${drawing.name}</a>
                                </td>
                            </tr>                    
                            `;
                }
            }
            modalHtml += `
                        </tbody>
                    </table>
                    <br>
                    <table>
                        <tr>
                            <th>Panel Drawings</th>
                        </tr>
                        <tbody>`;
            for (let drawing of drawings_sorted) {
                if (drawing.type === 'Panel') {
                modalHtml += `
                            <tr>
                                <td>
                                    <a href="${drawing.pdf_file}" target="_blank">${drawing.name}</a>
                                </td>
                            </tr>                    
                            `;
                }
            }
            modalHtml += `
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                </div>
            </div>
        </div>
    </div>
  `;
    // Create a new div element
    var modalElement = document.createElement('div');
    // Set its HTML to the modal HTML
    modalElement.innerHTML = modalHtml;
    // Append the new element to the body
    document.body.appendChild(modalElement);
    // Show the modal
    $('#drawingsModal').modal('show');
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('#drawingsLink').addEventListener('click', function(event) {
        console.log("I've been clicked");
        event.preventDefault();
        // Create a new array with additional properties
        let drawings_extended = drawings.map(drawing => {
            let name = drawing.pdf_file.split('/').pop().replace('.pdf', '');
            console.log("name here:");
            console.log(name);
            let type = name.startsWith('PP') ? 'Panel' : name.startsWith('STR') ? 'Structural' : name.startsWith('ARR') ? 'Arrangement' : '';
            if (type === 'Arrangement') {
                name = name.replace('ARR-', '');  // Trim 'OTH-' from the start of the name
            }
            if (type === 'Structural') {
                name = name.replace('STR-', '');  // Trim 'OTH-' from the start of the name
            }
            return {...drawing, type: type, name: name};
        });
        // Sort the array
        let drawings_sorted = drawings_extended.sort((a, b) => {
            if (a.type === b.type) {
                // If both drawings are of the same type, sort by name
                return a.name.localeCompare(b.name);
            } else {
                // Otherwise, sort by type (Panel comes before Other)
                return a.type === 'Panel' ? -1 : 1;
            }
        });
        // Call the showDrawings function with the sorted data
        showDrawings(drawings_sorted);
    });
});

document.getElementById('uploadButton').addEventListener('click', function(e) {
    e.preventDefault();  // Prevent the form from being submitted normally
    var fileInput = document.getElementById('pdfUpload');
    fileInput.click();  // Open the file dialog
    fileInput.addEventListener('change', function() {
        var formData = new FormData();
        for (var i = 0; i < fileInput.files.length; i++) {
            var file = fileInput.files[i];
            formData.append('pdf_file', file);  // Append each file
        }
        console.log('Sending files:', formData);
        fetch('/upload_drawing/', {  // Replace '/upload-drawing/' with the URL of your upload view
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                console.log('File uploaded successfully');
            } else {
                console.error('File upload failed');
                return response.json();  // Parse the JSON in the response
            }
        }).then(data => {
            if (data) {
                console.error('Server responded with:', data);  // Log the server response
            }
        }).catch(error => {
            console.error('Fetch error:', error);  // Log any fetch errors
        });
    });
});