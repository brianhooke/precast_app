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
                        <td><input type="hidden" value="${supplier.supplier_id}"><input type="text" value="${supplier.name}"></td>
                        <td><input type="text" value="${supplier.contact}"></td>
                        <td><input type="text" value="${supplier.phone}"></td>
                        <td><input type="text" value="${supplier.email}"></td>
                        <td><input type="text" value="${supplier.webpage}"></td>                  
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
    document.querySelector('#saveButton').addEventListener('click', gatherData);
}


// Function to gather data from the table and send it to the server
function gatherData() {
    var table = document.querySelector('#suppliersModal table');
    var data = [];
    for (var i = 1; i < table.rows.length; i++) {
        var row = table.rows[i];
        var rowData = {};
        var inputs = row.querySelectorAll('input[type="text"]');
        if (row.cells[0].querySelector('input[type="hidden"]')) {
            rowData['supplier_id'] = row.cells[0].querySelector('input[type="hidden"]').value;
        }
        if (inputs[0]) rowData['name'] = inputs[0].value;
        if (inputs[1]) rowData['contact'] = inputs[1].value;
        if (inputs[2]) rowData['phone'] = inputs[2].value;
        if (inputs[3]) rowData['email'] = inputs[3].value;
        if (inputs[4]) rowData['webpage'] = inputs[4].value;
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