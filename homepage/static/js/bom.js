// Function to create and show the modal
function showBom(bom) {
    var modalHtml = `
    <div class="modal fade" id="bomModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 800px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Bill Of Materials</h5>
                    <p></p>
                </div>
                <div class="modal-body" style="overflow-x: auto;">
                    <table>
                        <tr>
                            <th>Material</th>
                            <th>Quantity</th>
                            <th>Wastage-Adjusted / <br> Tendered Quantity</th>
                        </tr>`;
        for (let bomItem of bom) {
            if (bomItem.quantity !=0) {
            modalHtml += `
                        <tr>
                            <td>${bomItem.material}</td>                        
                            <td>${bomItem.quantity}</td>                        
                            <td>${bomItem.wastage_adjusted_quantity ? Number(bomItem.wastage_adjusted_quantity).toFixed(2) : 'N/A'}</td>
                        </tr>
                    `;
                }
    }
    modalHtml += `
                    </table>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <div>
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
    $('#bomModal').modal('show');
}

document.addEventListener('DOMContentLoaded', (event) => {
document.querySelector('#bomLink').addEventListener('click', function(event) {
    event.preventDefault();
    // Call the showSuppliers function with the suppliers data
    showBom(bom);
    });
});