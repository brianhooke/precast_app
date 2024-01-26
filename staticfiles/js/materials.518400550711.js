// Function to create and show the modal
function showMaterials(materials, suppliers) {
    var modalHtml = `
    <div class="modal fade" id="materialsModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 800px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Tracked Materials</h5>
                    <p></p>
                </div>
                <div class="modal-body" style="overflow-x: auto;">
                    <table>
                        <tr>
                            <th>Materials</th>
                            <th>Supplier</th>
                            <th>Units</th>
                            <th>$/Unit</th>
                        </tr>`;
                    for (let material of materials) {
                        modalHtml += `
                        <tr>
                            <td>${material.material}</td>
                            <td>${material.supplier}</td>
                            <td>${material.units}</td>
                            <td>${parseFloat(material.rate).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>                    
                        </tr>`;
                    }
    modalHtml += `
                    </table>
                <div class="modal-footer" style="justify-content: flex-start;">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
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
    $('#materialsModal').modal('show');
    // Remove the modal from the document when it's closed
    $('#materialsModal').on('hidden.bs.modal', function (e) {
        $('#materialsModal').remove();
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    console.log(materials);
    // Event listener for the Materials link
document.querySelector('#materialsLink').addEventListener('click', function(event) {
    event.preventDefault();
    // Call the showSuppliers function with the suppliers data
    showMaterials(materials);
    });
});