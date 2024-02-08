// Function to create and show the modal
function showOrderButtons() {
    var modalHtml = `
    <div class="modal fade" id="OrderButtonsModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 300px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Orders</h5>
                    <p></p>
                </div>
                <div class="modal-body" style="overflow-x: auto;">
                    <div>
                        <button id="newOrderBtn" class="gradient-button">New Order</button>
                    </div>
                    <div>
                        <button id="pendingOrdersBtn" class="gradient-button">Pending Orders</button>
                    </div>
                    <div>
                        <button id="pastOrdersBtn" class="gradient-button">Past Orders</button>
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
    $('#OrderButtonsModal').modal('show');
    var lastClicked;
    document.querySelector('#newOrderBtn').addEventListener('click', function(event) {
        event.preventDefault();
        lastClicked = 'newOrderBtn';
        $('#OrderButtonsModal').modal('hide');
    });
    document.querySelector('#pendingOrdersBtn').addEventListener('click', function(event) {
        event.preventDefault();
        lastClicked = 'pendingOrdersBtn';
        $('#OrderButtonsModal').modal('hide');
    });
    $('#OrderButtonsModal').on('hidden.bs.modal', function (e) {
        $('#OrderButtonsModal').remove();
        if (lastClicked === 'newOrderBtn') {
            newOrder();
        } else if (lastClicked === 'pendingOrdersBtn') {
            showPendingOrders();
        } else if (lastClicked === 'pastOrdersBtn') {
            yetToAddOrderModal3();
        }
    });
}

function newOrder() {
    var modalHtml = `
    <div class="modal fade" id="newOrderModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 800px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">New Order</h5>
                    <p></p>
                </div>
                <div class="modal-body" style="overflow-x: auto;">
                    <select id="supplierSelect" style="width: 100%; margin-bottom: 20px;">
                    <option selected>Select Supplier</option>
                    <option value="openingStock">Opening Stock</option>`;
    for (let supplier of suppliers) {
        modalHtml += `<option value="${supplier.supplier_id}">${supplier.name}</option>`;
    }
    modalHtml += `</select>
                    <table>
                        <thead>
                            <tr>
                                <th>Materials</th>
                                <th>Supplier</th>
                                <th>Units</th>
                                <th>$/Unit</th>
                                <th>Wastage</th>
                                <th>Pack Size</th>
                                <th>BOM Qty incl Waste</th>
                                <th>Stock on Shelf</th>
                                <th style="width: 15%;">Order Qty</th>
                            </tr>
                        </thead>
                        <tbody>`;
    for (let material of materials) {
        // Find the corresponding 'bom' and 'shelf_stock' items
        let bomItem = bom.find(b => b.material_id_id === material.material_id);
        let shelfStockItem = shelf_stock.find(s => s.material === material.material);
        // If items are found, use their properties, otherwise use an empty string
        let wastageAdjustedQuantity = bomItem ? parseFloat(bomItem.wastage_adjusted_quantity).toFixed(2) : '';
        let shelfStockAmount = shelfStockItem ? parseFloat(shelfStockItem.quantity).toFixed(2) : '';
        // Convert the values to numbers
        let A = Math.round(material.supplier_increments);
        let B = parseFloat(wastageAdjustedQuantity);
        let C = parseFloat(shelfStockAmount);
        let orderQty;
        if (A === 0) {
            orderQty = Math.max(B - C, 0);
        } else {
            orderQty = Math.ceil(Math.max(0, (B - C) / A))*A;
        }
        modalHtml += `
                        <tr data-supplier-id="${material.supplier_id_id}" data-material-id="${material.material_id}">
                            <td>${material.material}</td>
                            <td>${material.supplier}</td>
                            <td>${material.units}</td>
                            <td>${parseFloat(material.rate).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td>${material.expected_wastage * 100}%</td>
                            <td>${Math.round(material.supplier_increments)}</td>
                            <td>${wastageAdjustedQuantity}</td>
                            <td>${shelfStockAmount}</td>
                            <td style="width: 15%;"><input type="number" value="${orderQty}" min="0" style="width: 100%;"></td>
                        </tr>`;
    }
    modalHtml += `
                        </tbody>
                    </table>
                    <div class="modal-footer">
                        <div class="col-6 text-left">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                        <div class="col-6 text-right">
                            <button type="button" class="btn btn-primary update-completed-values" id="createOrderBtn">Create Order</button>
                        </div>
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
    $('#newOrderModal').modal('show');

    // Initially hide all rows except the first one (headers)
    $('#newOrderModal table tr:not(:first)').hide();

    // Add an event listener to the dropdown box
    $('#supplierSelect').on('change', function() {
        var selectedSupplier = $(this).val();
        // Hide all rows
        $('#newOrderModal table tbody tr').hide();
        // If "Opening Stock" is selected, show all rows
        if (selectedSupplier === 'openingStock') {
            $('#newOrderModal table tbody tr').show();
        } else {
            // Show only rows that match the selected supplier
            $('#newOrderModal table tbody tr').filter(function() {
                var rowSupplierId = $(this).data('supplier-id');
                return rowSupplierId == Number(selectedSupplier); // Use == to allow for type coercion
            }).show();
        }
    });
    document.getElementById('createOrderBtn').addEventListener('click', upload_order);
    // Remove the modal from the document when it's closed
    $('#newOrderModal').on('hidden.bs.modal', function (e) {
        $('#newOrderModal').remove();
    });
}

function showPendingOrders() {
    var modalHtml = `
    <div class="modal fade" id="pendingOrders" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 300px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Pending Orders</h5>
                </div>           
                <div class="modal-body" style="overflow-x: auto;">
                <table>
                    <tr>
                        <th>Supplier</th>
                        <th>Date</th>
                    </tr>`;
                    for (let order of orders) {
                        let date = new Date(order.datestamp);
                        let formattedDate = date.getDate() + '-' + date.toLocaleString('default', { month: 'short' }) + '-' + date.getFullYear();
                        modalHtml += `
                        <tr>
                            <td>${order.supplier_id__name}</td>
                            <td data-order-id="${order.order_id}">
                                <a href="#" onclick="pendingOrder(${order.order_id});">${formattedDate}</a>
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
                </div>
            </div>
        </div>
    </div>
  `;
    var modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement);
    $('#pendingOrders').modal('show');
}

function pendingOrder(order_id) {
    var modalHtml = `
    <div class="modal fade" id="pendingOrder" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 800px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">New Order</h5>
                    <p></p>
                </div>
                <div class="modal-body" style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Materials</th>
                                <th>Units</th>
                                <th>$/Unit</th>
                                <th>Pack Size</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>`;
//Table data to be added here
    modalHtml += `
                        </tbody>
                    </table>
                    <div class="modal-footer">
                        <div class="col-6 text-left">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                        <div class="col-6 text-right">
                            <button type="button" class="btn btn-primary update-completed-values" id="createOrderBtn">Create Order</button>
                        </div>
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
    $('#newOrderModal').modal('show');

    // Initially hide all rows except the first one (headers)
    $('#newOrderModal table tr:not(:first)').hide();

    // Add an event listener to the dropdown box
    $('#supplierSelect').on('change', function() {
        var selectedSupplier = $(this).val();
        // Hide all rows
        $('#newOrderModal table tbody tr').hide();
        // If "Opening Stock" is selected, show all rows
        if (selectedSupplier === 'openingStock') {
            $('#newOrderModal table tbody tr').show();
        } else {
            // Show only rows that match the selected supplier
            $('#newOrderModal table tbody tr').filter(function() {
                var rowSupplierId = $(this).data('supplier-id');
                return rowSupplierId == Number(selectedSupplier); // Use == to allow for type coercion
            }).show();
        }
    });
    document.getElementById('createOrderBtn').addEventListener('click', upload_order);
    // Remove the modal from the document when it's closed
    $('#newOrderModal').on('hidden.bs.modal', function (e) {
        $('#newOrderModal').remove();
    });
}

function upload_order() {
    var data = [];
    var rows = $('#newOrderModal table tbody tr:visible'); // Use jQuery to select visible rows
    var supplier_id = $('#supplierSelect').val();
    rows.each(function() {
        var row = $(this);
        var cells = row.find('td');
        var material_id = row.data('material-id'); // Get 'material_id' from the row's dataset
        var inputVal = cells.eq(8).find('input').val();
        var orderQty = !isNaN(inputVal) && inputVal !== '' ? Number(inputVal) : 0; // Convert orderQty to a number only if it's a number
        console.log('orderQty:', orderQty); // Log orderQty
        // If supplier_id equals "openingStock", push all rows' material_id's and orderQty (even if orderQty is 0)
        if (supplier_id === "openingStock") {
            data.push({
                'material_id': material_id,
                'quantity': orderQty
            });
        } else if (orderQty !== 0) { // If supplier_id is not "openingStock", only push rows where orderQty is not 0
            data.push({
                'material_id': material_id,
                'quantity': orderQty
            });
        }
    });
    console.log('Data to be sent:', data); // Log data to be sent
    var order_status = 1; //1 is for pending orders
    var url, body;
    if (supplier_id === "openingStock") {
        url = '/upload_stocktake/';
        body = JSON.stringify({
            'data': data.map(item => ({...item, amount: item.quantity})),
            'stocktake_type': 1,
            'date': new Date().toISOString().slice(0,10)
        });
    } else {
        url = '/upload_order/';
        body = JSON.stringify({
            'data': data,
            'supplier_id': supplier_id,
            'order_status': order_status
        });
    }
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Success: Order Successfully Saved.');
        // Close the modal
        $('#newOrderModal').modal('hide');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error: There was a problem sending the data.');
    });
}


document.addEventListener('DOMContentLoaded', (event) => {
document.querySelector('#ordersLink').addEventListener('click', function(event) {
    event.preventDefault();
    // Call the showSuppliers function with the suppliers data
    showOrderButtons();
    });
});


