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
    document.querySelector('#pastOrdersBtn').addEventListener('click', function(event) {
        event.preventDefault();
        lastClicked = 'pastOrdersBtn';
        $('#OrderButtonsModal').modal('hide');
    });
    $('#OrderButtonsModal').on('hidden.bs.modal', function (e) {
        $('#OrderButtonsModal').remove();
        if (lastClicked === 'newOrderBtn') {
            newOrder();
        } else if (lastClicked === 'pendingOrdersBtn') {
            showPendingOrders();
        } else if (lastClicked === 'pastOrdersBtn') {
            showPastOrders();
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
                                <th>Material</th>
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
                        if (order.order_status === '1') {
                            let date = new Date(order.datestamp);
                            let formattedDate = date.getDate() + '-' + date.toLocaleString('default', { month: 'short' }) + '-' + date.getFullYear();
                            modalHtml += `
                            <tr>
                                <td>
                                    <a href="#" onclick="existingOrder(${order.order_id}); $('#pendingOrders').modal('hide');">${order.supplier_id__name}</a>
                                </td>
                                <td data-order-id="${order.order_id}">
                                    <a href="#" onclick="existingOrder(${order.order_id}); $('#pendingOrders').modal('hide');">${formattedDate}</a>
                                </td>
                            </tr>`;
                        }
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
        var rate = Number(cells.eq(3).text().replace(/[^0-9.-]+/g,"")); // Get the rate from the fourth cell and parse it to a number
        // If supplier_id equals "openingStock", push all rows' material_id's and orderQty (even if orderQty is 0)
        if (supplier_id === "openingStock") {
            data.push({
                'material_id': material_id,
                'quantity': orderQty,
                'rate': rate
            });
        } else if (orderQty !== 0) { // If supplier_id is not "openingStock", only push rows where orderQty is not 0
            data.push({
                'material_id': material_id,
                'quantity': orderQty,
                'rate': rate
            });
        }
    });
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
        alert('Success: Order Successfully Saved.');
        location.reload();
    })
    .catch((error) => {
        alert('Error: There was a problem sending the data.');
    });
}

function existingOrder(order_id) {
    var matchingOrder = orders.find(order => order.order_id === order_id);
    var supplierName = matchingOrder ? matchingOrder.supplier_id__name : '';
    var formattedDate = matchingOrder ? new Date(matchingOrder.datestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '';
    var matchingOrdersData = orders_data.filter(orderData => orderData.order_id_id === order_id);
    var modalHtml = `
    <div class="modal fade" id="existingOrderModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 800px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">${supplierName} Order: ${formattedDate}</h5>
                <p></p>
                </div>
                <div class="modal-body" style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Units</th>
                                <th>$/Unit</th>
                                <th>Pack Size</th>
                                <th style="width: 25%;">Qty</th>
                            </tr>
                        </thead>
                        <tbody>`;
                        var totalCost = 0;
                        for (let orderData of matchingOrdersData) {
                            let matchingMaterial = materials.find(material => material.material_id === orderData.material_id_id);
                            if (matchingMaterial) {
                                modalHtml += `
                                    <tr data-supplier-id="${matchingMaterial.supplier_id}" data-material-id="${matchingMaterial.material_id}">
                                        <td>${matchingMaterial.material}</td>
                                        <td>${matchingMaterial.units}</td>
                                        <td style="width: 25%;"><input type="number" value="${orderData.rate}" placeholder="${orderData.rate}" min="0" style="width: 100%;"></td>
                                        <td>${Math.round(matchingMaterial.supplier_increments)}</td>
                                        <td style="width: 25%;"><input type="number" value="${orderData.quantity}" min="0" style="width: 100%;"></td>
                                    </tr>`;
                                totalCost += orderData.rate * orderData.quantity;  // Calculate the cost of the item and add it to the total cost
                            }
                        }
                        modalHtml += `
                                <tr>
                                <td>Total</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>$${totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="modal-footer">
                        <div class="col-4 text-left">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                        <div class="col-4 text-center">
                            <button type="button" class="btn btn-primary update-completed-values" id="useOrderBtn">Received --> Use </button>
                        </div>
                        <div class="col-4 text-right">
                            <button type="button" class="btn btn-primary update-completed-values" id="stockOrderBtn">Received --> Shelf </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    var modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement);
    $('#existingOrderModal').modal('show');
    // Add an event listener to the dropdown box
    document.getElementById('stockOrderBtn').addEventListener('click', function() {
        receive_order(order_id);
        $('#existingOrderModal').modal('hide');
    });    
    document.getElementById('useOrderBtn').addEventListener('click', function() {
        allocateOrderModal(order_id, supplierName);
        $('#existingOrderModal').modal('hide');        
    });        
    // Remove the modal from the document when it's closed
    $('#existingOrderModal').on('hidden.bs.modal', function (e) {
        $('#existingOrderModal').remove();
    });
}

function receive_order(order_id) { // Function to receive & stock an order
    var data = [];
    var rows = document.querySelectorAll('#existingOrderModal tbody tr');
    rows.forEach(function(row) {
        var material_id = row.getAttribute('data-material-id');
        var quantityInput = row.querySelector('td:nth-child(5) input[type="number"]');
        var rateInput = row.querySelector('td:nth-child(3) input[type="number"]');
        var quantity = quantityInput ? quantityInput.value : 0;
        var rate = rateInput ? rateInput.value : 0;
        data.push({
            'order_id': order_id,
            'material_id': material_id,
            'quantity': quantity,
            'rate': rate
        });
    });
    fetch('/receive_order/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        alert('Success: Order Successfully Received.');
        location.reload();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function allocateOrderModal(order_id, supplierName) {
    console.log('allocateOrderModal called with order_id:', order_id);
    let uniqueDates = [];
    let maxPanelCount = 0;
    let dateToIdMap = {}; // Map to store schedule_date to schedule_id mapping
    console.log('Initial variables set');
    for (let schedule of casting_schedule) {
        console.log('Processing schedule:', schedule);
        if (!uniqueDates.includes(schedule.schedule_date)) {
            uniqueDates.push(schedule.schedule_date);
            dateToIdMap[schedule.schedule_date] = schedule.schedule_id; // Store schedule_date to schedule_id mapping
            scheduleDates.push(schedule.schedule_id); // Add schedule_id to global array
        }
        let panelCount = panels.filter(panel => panel.schedule_id_id === schedule.schedule_id).length;
        if (panelCount > maxPanelCount) {
            maxPanelCount = panelCount;
        }
    }
    console.log('Finished processing schedules');
    scheduleDates.sort((a, b) => new Date(casting_schedule.find(schedule => schedule.schedule_id === a).schedule_date) - new Date(casting_schedule.find(schedule => schedule.schedule_id === b).schedule_date));
    uniqueDates.sort((a, b) => new Date(a) - new Date(b));
    console.log('Sorted dates');
    var modalHtml = `
    <div class="modal fade" id="allocateOrders" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 600px;">
            <div class="modal-content" style="border: 3px solid black; overflow-x: auto; overflow-y: auto;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%); position: sticky; top: 0">
                    <h5 class="modal-title">Allocate ${supplierName} Order to Schedule(s)</h5>
                </div>           
                    <table>
                        <tr>
                            <th style="position: sticky; top: 40px;">Date</th>
                            <th style="position: sticky; top: 40px;">m3</th>`;
    console.log('Started building modal HTML');
    for (let i = 1; i <= maxPanelCount; i++) {
        modalHtml += `<th style="position: sticky; top: 40px;">Panel ${i}</th>`;
        console.log(`Added header for panel ${i}`);
    }
    modalHtml += `<th style="position: sticky; top: 40px;">Allocate</th></tr>`;
    console.log('Added Complete header');
    for (let i = 0; i < uniqueDates.length; i++) {
        let date = uniqueDates[i];
        let formattedDate = new Date(date);
        let display_date = formattedDate.getDate() + '-' + formattedDate.toLocaleString('default', { month: 'short' }) + '-' + formattedDate.getFullYear().toString().substr(-2);
        console.log(`Processing date: ${display_date}`);
        let totalVolume = panels.filter(panel => panel.schedule_id_id === dateToIdMap[date]).reduce((sum, panel) => {
            return sum + +panel.panel_volume;
        }, 0).toFixed(2);
        let scheduleId = dateToIdMap[date];
        let checkbox = `<input type="checkbox" class="scheduled-checkboxes" data-schedule-id="${scheduleId}" data-display-date="${display_date}">`;
        let rowColor = i % 2 === 0 ? 'white' : 'lightgrey'; // Change color based on row index
        modalHtml += `
        <tr style="background-color: ${rowColor}; background: white;">
            <td id="${scheduleId}">${display_date}</td>
            <td><b>${totalVolume}</b></td>`;
        let panelIds = panels.filter(panel => panel.schedule_id_id === dateToIdMap[date]).map(panel => panel.panel_id);
        for (let i = 0; i < maxPanelCount; i++) {
            modalHtml += `<td>${panelIds[i] || ''}</td>`;
        }
        modalHtml += `<td style="text-align: center; vertical-align: middle;">${checkbox}</td></tr>`;
    }
    modalHtml += `
                    </table>
                        <div class="modal-footer">
                        <div class="col-6 text-left">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                        <div class="col-6 text-right">
                            <button type="button" class="btn btn-primary update-completed-values" id="scheduleAllocateBtn">Allocate</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
// Set its innerHTML to the table HTML
var modalElement = document.createElement('div');
modalElement.innerHTML = modalHtml;
document.body.appendChild(modalElement);
console.log("about to show modal");
$('#allocateOrders').modal('show');
$('#scheduleAllocateBtn').on('click', function() {
    // Retrieve the list of scheduleIds whose checkbox is ticked
    let checkedScheduleIds = [];
    $('.scheduled-checkboxes:checked').each(function() {
        checkedScheduleIds.push($(this).data('schedule-id'));
    });
    console.log("Checked schedule ids:", checkedScheduleIds);
    // Check if any checkboxes are checked
    if (checkedScheduleIds.length === 0) {
        alert('No schedules have been ticked');
        return;
    }
    // Pass the list and order_id to a POST function 'allocate_order'
    $.ajax({
        url: '/allocate_order/',  // Replace with your actual URL
        type: 'POST',
        data: {
            schedule_ids: checkedScheduleIds,
            order_id: order_id  // Replace with your actual order_id
        },
        success: function() {
            alert('Order successfully allocated');
            location.reload();
        },
        error: function() {
            alert('An error occurred');
        }
    });
});
}

function showPastOrders() {
    var modalHtml = `
    <div class="modal fade" id="pastOrders" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 300px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Past Orders</h5>
                </div>           
                <div class="modal-body" style="overflow-x: auto;">
                <table>
                    <tr>
                        <th>Supplier</th>
                        <th>Date</th>
                    </tr>`;
                    for (let order of orders) {
                        if (order.order_status !== '1') {
                            let date = new Date(order.datestamp);
                            let formattedDate = date.getDate() + '-' + date.toLocaleString('default', { month: 'short' }) + '-' + date.getFullYear();
                            modalHtml += `
                            <tr>
                                <td>
                                    <a href="#" onclick="pastOrder(${order.order_id});">${order.supplier_id__name}</a>
                                </td>
                                <td data-order-id="${order.order_id}">
                                    <a href="#" onclick="pastOrder(${order.order_id});">${formattedDate}</a>
                                </td>
                            </tr>`;
                        }
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
  `;
    var modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement);
    $('#pastOrders').modal('show');
}


function pastOrder(order_id) {
    var matchingOrder = orders.find(order => order.order_id === order_id);
    var supplierName = matchingOrder ? matchingOrder.supplier_id__name : '';
    var formattedDate = matchingOrder ? new Date(matchingOrder.datestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '';
    var matchingOrdersData = orders_data.filter(orderData => orderData.order_id_id === order_id);
    var modalHtml = `
    <div class="modal fade" id="pastOrderModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 800px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">${supplierName} Order: ${formattedDate}</h5>
                <p></p>
                </div>
                <div class="modal-body" style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Units</th>
                                <th>Pack Size</th>
                                <th style="width: 25%;">Qty</th>
                            </tr>
                        </thead>
                        <tbody>`;
                        var totalCost = 0;
                        for (let orderData of matchingOrdersData) {
                            let matchingMaterial = materials.find(material => material.material_id === orderData.material_id_id);
                            if (matchingMaterial) {
                                modalHtml += `
                                    <tr data-supplier-id="${matchingMaterial.supplier_id}" data-material-id="${matchingMaterial.material_id}">
                                        <td>${matchingMaterial.material}</td>
                                        <td style="width: 25%;">${orderData.rate}</td>
                                        <td>${Math.round(matchingMaterial.supplier_increments)}</td>
                                        <td style="width: 25%;">${parseFloat(orderData.quantity).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                                    </tr>`;
                                totalCost += orderData.rate * orderData.quantity;  // Calculate the cost of the item and add it to the total cost
                            }
                        }
                        modalHtml += `
                        </tbody>
                    </table>
                    <div class="modal-footer">
                        <div class="col-6 text-left">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    var modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement);
    $('#pastOrderModal').modal('show');
    $('#pastOrderModal').on('hidden.bs.modal', function (e) {
        $('#pastOrderModal').remove();
    });
}



document.addEventListener('DOMContentLoaded', (event) => {
document.querySelector('#ordersLink').addEventListener('click', function(event) {
    event.preventDefault();
    // Call the showSuppliers function with the suppliers data
    showOrderButtons();
    });
});


