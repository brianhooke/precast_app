// Function to create and show the modal
function showStocktakeButtons(stocktake, stocktake_data) {
    console.log("MMMaterials");
    console.log(materials);
    var modalHtml = `
    <div class="modal fade" id="stocktakeButtonsModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 300px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Stocktake</h5>
                    <p></p>
                </div>
                <div class="modal-body" style="overflow-x: auto;">
                    <div>
                        <button id="viewStockBtn" class="gradient-button">View Stock</button>
                    </div>
                    <div>
                        <button id="newStocktakeBtn" class="gradient-button">New Stocktake Snap</button>
                    </div>
                    <div>
                        <button id="oldStocktakeBtn" class="gradient-button">Old Stocktake Snaps</button>
                    </div>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
  `;
    var modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement);
    $('#stocktakeButtonsModal').modal('show');
    // $('#stocktakeButtonsModal').on('hidden.bs.modal', function (e) {
    //     $('#stocktakeButtonsModal').remove();
    //     newStocktakeSnapModal(materials);
    // });
    var lastClicked;
    document.querySelector('#newStocktakeBtn').addEventListener('click', function(event) {
        event.preventDefault();
        lastClicked = 'newStocktakeBtn';
        $('#stocktakeButtonsModal').modal('hide');
    });
    document.querySelector('#oldStocktakeBtn').addEventListener('click', function(event) {
        event.preventDefault();
        lastClicked = 'oldStocktakeBtn';
        $('#stocktakeButtonsModal').modal('hide');
    });
    $('#stocktakeButtonsModal').on('hidden.bs.modal', function (e) {
        $('#stocktakeButtonsModal').remove();
        if (lastClicked === 'oldStocktakeBtn') {
            oldStocktakeSnapModal(stocktake, stocktake_data, materials);
        } else {
            newStocktakeSnapModal(materials);
        }
    });
}


//New Stocktake Snap Modal
function newStocktakeSnapModal(materials) {
    console.log("MMMaterials");
    console.log(materials);
    var modalHtml = `
    <div class="modal fade" id="newStocktakeModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 500px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">New Stocktake Snap</h5>
                </div>
                <div class="input-field">
                    <label for="snapDate">Stocktake Date:</label>
                    <input type="date" id="snapDate" value="">
                </div>               
                <div class="modal-body" style="overflow-x: auto;">
                    <table>
                        <tr>
                            <th>Material</th>
                            <th>Quantity</th>
                        </tr>`;
        for (let materialItem of materials) {
            modalHtml += `
                        <tr>
                            <td data-material-id="${materialItem.material_id}">${materialItem.material}</td>                        
                            <td><input type="number" step="0.01" placeholder=""></td>                        
                        </tr>
                    `;      
        }
        modalHtml += `
                    </table>
                </div>
                <div class="modal-footer">
                    <div class="col-6 text-left">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    </div>
                    <div class="col-6 text-right">
                        <button type="button" class="btn btn-primary update-completed-values" id="saveNewStocktakeButton">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
    var modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement);
    document.getElementById('saveNewStocktakeButton').addEventListener('click', upload_stocktake);
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById("snapDate").value = today;
    $('#newStocktakeModal').modal('show');
}
function upload_stocktake() {
    var data = [];
    var rows = document.querySelectorAll('tr');
    rows.forEach(function(row) {
        console.log(row);
        var td = row.querySelector('td[data-material-id]');
        if (td) {
            var material_id = td.dataset.materialId;
            var amount = row.querySelector('input[type="number"]').value;
            if (amount === '') {
                amount = null;
            }
            data.push({
                'material_id': material_id,
                'amount': amount
            });
        }
    });
    var date = document.getElementById('snapDate').value;
    fetch('/upload_stocktake/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'date': date, 'data': data }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Old Stocktake Snap Modal
function oldStocktakeSnapModal(stocktake, stocktake_data, materials) {
    var modalHtml = `
    <div class="modal fade" id="oldStocktakeModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 300px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Old Stocktake Snap</h5>
                </div>           
                <div class="modal-body" style="overflow-x: auto;">
                <table>
                    <tr>
                        <th>Date</th>
                    </tr>`;
                    for (let stocktake_main of stocktake) {
                        let date = new Date(stocktake_main.datestamp);
                        let formattedDate = date.getDate() + '-' + date.toLocaleString('default', { month: 'short' }) + '-' + date.getFullYear();
                        modalHtml += `
                        <tr>
                            <td data-stocktake-id="${stocktake_main.stocktake_id}">
                                <a href="#" onclick="showOldStocktakeDataModal(${stocktake_main.stocktake_id}, stocktake_data, materials);">${formattedDate}</a>
                            </td>
                        </tr>`;
                    }
                    modalHtml += `
                </table>
                </div>
                <div class="modal-footer">
                    <div class="col-6 text-left">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    </div>
                    <div class="col-6 text-right">
                        <button type="button" class="btn btn-primary update-completed-values" id="updateOldStocktakeButton">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
    var modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement);
    $('#oldStocktakeModal').modal('show');
}

function showOldStocktakeDataModal(stocktake_pk, stocktake_data, materials) {
    console.log("stocktake_pk: ", stocktake_pk);
    console.log("stocktake_data: ", stocktake_data);
    console.log("materials: ", materials);
    var modalHtml = `
    <div class="modal fade" id="OldStocktakeDataModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 500px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Old Stocktake Snap</h5>
                </div>
                <div class="input-field">
                    <label for="snapDate">Stocktake Date:</label>
                    <input type="date" id="snapDate" value="">
                </div>               
                <div class="modal-body" style="overflow-x: auto;">
                    <table>
                        <tr>
                            <th>Material</th>
                            <th>Quantity</th>
                        </tr>`;
                for (let materialItem of materials) {
                    console.log("materialItem: ", materialItem)
                    let amount = '';
                    for (let stocktakeItem of stocktake_data) {
                        if (stocktakeItem.material_id === materialItem.material_id && stocktakeItem.stocktake_id === stocktake_pk) {
                            amount = stocktakeItem.amount;
                            break;
                        }
                    }
                    modalHtml += `
                                <tr>
                                    <td data-material-id="${materialItem.material_id}">${materialItem.material}</td>                        
                                    <td>${amount}</td>                        
                                </tr>
                            `;      
                }
        modalHtml += `
                    </table>
                </div>
                <div class="modal-footer">
                    <div class="col-6 text-left">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    </div>
                    <div class="col-6 text-right">
                        <button type="button" class="btn btn-primary update-completed-values" id="saveNewStocktakeButton">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    var modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement);
    // document.getElementById('saveNewStocktakeButton').addEventListener('click', upload_stocktake);
    $('#OldStocktakeDataModal').modal('show');
}

document.addEventListener('DOMContentLoaded', (event) => {
    console.log("here comes stocktake: ", stocktake);
document.querySelector('#stocktakeLink').addEventListener('click', function(event) {
    console.log("and it can hear the click");
    event.preventDefault();
    // Call the showSuppliers function with the suppliers data
    showStocktakeButtons(stocktake);
    });
});

