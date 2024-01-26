// Function to create and show the modal
function showSuppliers(suppliers) {
    var modalHtml = `
    <div class="modal fade" id="suppliersModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 800px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Suppliers</h5>
                    <p></p>
                </div>
                <div class="modal-body" style="overflow-x: auto;">
                    <table>
                        <tr>
                            <th>Supplier</th>
                            <th>Contact</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Webpage</th>
                        </tr>`;
    for (let supplier of suppliers) {
        modalHtml += `
                    <tr>
                        <td data-supplier-id="${supplier.supplier_id}">${supplier.name}</td>                        <td>${supplier.contact}</td>
                        <td>${supplier.phone}</td>
                        <td>${supplier.email}</td>
                        <td>${supplier.webpage}</td>                  
                    </tr>`;
    }
    modalHtml += `
                    </table>
                    <button id="addRowButton">+</button>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-primary" id="updateSuppliers">Update</button>
                <div>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary update-completed-values" id="saveButton">Save</button>
                </div>
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
    $('#suppliersModal').modal('show');

// Add event listener for '+' button
document.querySelector('#addRowButton').addEventListener('click', function(event) {
    var table = document.querySelector('#suppliersModal table');
    var newRow = table.insertRow(-1);
    for (var i = 0; i < 5; i++) {
        var newCell = newRow.insertCell(i);
        var input = document.createElement('input');
        input.style.width = '100%'; // Adjust this value as needed
        input.id = 'input' + (table.rows.length - 1) + i; // This will give each input a unique id
        newCell.appendChild(input);
    }
});

    // Remove the modal from the document when it's closed
    $('#suppliersModal').on('hidden.bs.modal', function (e) {
        $('#suppliersModal').remove();
    });

    // Remove the modal from the document when it's closed
    $('#suppliersModal').on('hidden.bs.modal', function (e) {
        $('#suppliersModal').remove();
    });

    // Add event listener for 'Save' button
    document.querySelector('#saveButton').addEventListener('click', postNewSuppliers);
}


function postNewSuppliers() {
    var table = document.querySelector('#suppliersModal table');
    var data = [];
    for (var i = 1; i < table.rows.length; i++) {
        var row = table.rows[i];
        var rowData = {};
        var cells = row.querySelectorAll('td');
        rowData['supplier_id'] = cells[0].dataset.supplierId || '';
        rowData['name'] = cells[0].querySelector('input[type="text"]') ? cells[0].querySelector('input[type="text"]').value : cells[0].textContent;
        rowData['contact'] = cells[1].querySelector('input[type="text"]') ? cells[1].querySelector('input[type="text"]').value : cells[1].textContent;
        rowData['phone'] = cells[2].querySelector('input[type="text"]') ? cells[2].querySelector('input[type="text"]').value : cells[2].textContent;
        rowData['email'] = cells[3].querySelector('input[type="text"]') ? cells[3].querySelector('input[type="text"]').value : cells[3].textContent;
        rowData['webpage'] = cells[4].querySelector('input[type="text"]') ? cells[4].querySelector('input[type="text"]').value : cells[4].textContent;
        data.push(rowData);
    }
    // Send the data to the server
    fetch('/homepage/update_suppliers/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}



document.addEventListener('DOMContentLoaded', (event) => {
    console.log(suppliers);

    // Event listener for the Suppliers link
document.querySelector('#suppliersLink').addEventListener('click', function(event) {
    event.preventDefault();

    // Call the showSuppliers function with the suppliers data
    showSuppliers(suppliers);
    });
});