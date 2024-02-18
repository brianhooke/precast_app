function dashBomTracking() {
    var scriptTag = document.getElementById('bom_tracking');
    var scriptTag2 = document.getElementById('used_materials');
    // Parse the JSON data from the script tag
    var bom_tracking = JSON.parse(scriptTag.textContent);
    var used_materials = JSON.parse(scriptTag2.textContent);
    console.log("print out Bom Tracking", bom_tracking);
    console.log("print out used materials from dashBomTracking", used_materials);

    var tableHtml = `
    <div style="overflow-x: auto; opacity: 0.85; height: 300px; overflow-y: auto;">
    <div style="text-align: center; background: linear-gradient(45deg, #A090D0, #B3E1DD); padding: 5px; position: sticky; top: 0;">
        <h6 style="margin: 0;">BOM Tracking</h6>
    </div>
        <table style="font-size: 0.8em;">
            <tr>
                <th style="position: sticky; top: 20px;">Material</th>
                <th style="position: sticky; top: 20px;">Tender #</th>
                <th style="position: sticky; top: 20px;">Cast #</th>
                <th style="position: sticky; top: 20px;">Count #</th>
                <th style="position: sticky; top: 20px;">Act vs Exp</th>
            </tr>`;

            for (let i = 0; i < bom_tracking.length; i++) {
                let material = bom_tracking[i];
                let rowColor = i % 2 === 0 ? 'white' : 'lightgrey'; // Change color based on row index
            
                // Calculate the sum of used_materials.quantity for matching materials
                let usedQuantity = 0;
                for (let j = 0; j < used_materials.length; j++) {
                    if (used_materials[j].material === material.material) {
                        usedQuantity += Number(used_materials[j].used_quantity);
                    }
                }
            
                tableHtml += `
                <tr style="background-color: ${rowColor}; line-height: 1;">
                    <td>${material.material}</td>
                    <td>${material.tender_qty ? (+Number(material.tender_qty).toFixed(2)) : '-'}</td>
                    <td>${material.cast_qty ? (+Number(material.cast_qty).toFixed(2)) : '-'}</td>
                    <td>${usedQuantity ? (+Number(usedQuantity).toFixed(2)) : '-'}</td>
                    <td>-</td>
                </tr>`;
            }

        tableHtml += `
        </table>
    </div>`;
// Select the second-quadrant div
var thirdQuadrant = document.querySelector('#third-quadrant > div');
// Set its innerHTML to the table HTML
thirdQuadrant.innerHTML = tableHtml;
}

document.addEventListener('DOMContentLoaded', (event) => {
// Call the castingScheduleTable function
dashBomTracking();
});