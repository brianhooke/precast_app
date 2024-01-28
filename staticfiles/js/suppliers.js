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
                        <td data-supplier-id="${supplier.supplier_id}">${supplier.name}</td>                        
                        <td>${supplier.contact}</td>
                        <td>${supplier.phone}</td>
                        <td>${supplier.email}</td>
                        <td><a href="${supplier.webpage.startsWith('http://') || supplier.webpage.startsWith('https://') ? supplier.webpage : 'http://' + supplier.webpage}" target="_blank">${supplier.name}</a></td>
                        <td class="deleteButton" data-supplier-id="${supplier.supplier_id}" style="cursor: pointer; padding: 5px; text-align: center;">x</td>                  
                        </tr>
                    <!-- New rows will be added here -->
                    `;
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

// Add event listener for "Update" button
document.querySelector('#updateSuppliers').addEventListener('click', function(event) {
    var table = document.querySelector('#suppliersModal table');
    var cells = table.querySelectorAll('td');
    cells.forEach(function(cell) {
        if (!cell.hasAttribute('data-supplier-id')) { // Skip cells with 'data-supplier-id' attribute
            var input = document.createElement('input');
            if (cell.querySelector('a')) { // If the cell contains a link
                input.value = cell.querySelector('a').href; // Set the input value to the href of the link
            } else {
                input.value = cell.textContent;
            }
            cell.textContent = '';
            cell.appendChild(input);
        }
    });
});

// Add event listener for 'x' buttons
document.querySelector('#suppliersModal').addEventListener('click', function(event) {
    if (event.target.classList.contains('deleteButton')) {
        var supplierId = event.target.getAttribute('data-supplier-id');
        // Send the supplierId to the server to be deleted
        fetch('/delete_supplier/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({supplier_id: supplierId}),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (response.headers.get('Content-Type').includes('application/json')) {
                return response.json();
            } else {
                throw new Error('Server response was not JSON');
            }
        })
        .then(data => {
            if (data.status === 'success') {
                // Remove the row from the table
                event.target.parentNode.remove();
            } else {
                console.error('Server error:', data);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
});
}


function postNewSuppliers() {
    var table = document.querySelector('#suppliersModal table');
    var data = [];
    for (var i = 1; i < table.rows.length; i++) {
        var row = table.rows[i];
        var rowData = {};
        var cells = row.querySelectorAll('td');
        var isFixedRow = cells[0].hasAttribute('data-supplier-id');
        var name = isFixedRow ? cells[0].textContent : cells[0].querySelector('input').value;
        if (!name) {
            alert('New supplier must have a name');
            return;
        }
        rowData['name'] = name;
        for (var j = 1; j < cells.length; j++) {
            var cell = cells[j];
            var input = cell.querySelector('input');
            var key = ['contact', 'phone', 'email', 'webpage'][j - 1];
            rowData[key] = input ? input.value : cell.textContent;
        }
        rowData['supplier_id'] = isFixedRow ? cells[0].getAttribute('data-supplier-id') : '';
        data.push(rowData);
    }
    console.log("here comes the filtered data to be posted")
    console.log(data);
    // Send the data to the server
    fetch('/update_suppliers/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (response.headers.get('Content-Type').includes('application/json')) {
            return response.json();
        } else {
            throw new Error('Server response was not JSON');
        }
    })
    .then(data => {
        console.log('Success:', data);
        location.reload();
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