function dashBomTracking() {
    var scriptTag = document.getElementById('bom_tracking');
    var scriptTag2 = document.getElementById('used_materials');
    var scriptTag3 = document.getElementById('expected_used_materials');
    var scriptTag4 = document.getElementById('panels');
    var scriptTag5 = document.getElementById('materials');
    // Parse the JSON data from the script tag
    var bom_tracking = JSON.parse(scriptTag.textContent);
    var used_materials = JSON.parse(scriptTag2.textContent);
    var expected_materials = JSON.parse(scriptTag3.textContent);
    var panels = JSON.parse(scriptTag4.textContent);
    var materials = JSON.parse(scriptTag5.textContent);

    console.log("print out bom_tracking", bom_tracking);
    console.log("print out used_materials", used_materials);
    console.log("print out expected_materials", expected_materials);
    console.log("print out panels", panels);
    console.log("print out materials123", materials);
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
                <th style="position: sticky; top: 20px;">Counted #</th>
                <th style="position: sticky; top: 20px;">Exp #</th>
                <th style="position: sticky; top: 20px;">Act vs Exp</th>
            </tr>`;
            for (let i = 0; i < bom_tracking.length; i++) {
                let material = bom_tracking[i];
                let rowColor = i % 2 === 0 ? 'white' : 'lightgrey'; // Change color based on row index
                // Calculate the sum of used_materials.quantity for matching materials
                let usedQuantity = 0;
                let expectedQuantity = 0;
                for (let j = 0; j < used_materials.length; j++) {
                    if (used_materials[j].material === material.material) {
                        usedQuantity += Number(used_materials[j].used_quantity);
                    }
                }
                // Calculate the sum of expected_materials.expected_quantity for matching materials
                for (let j = 0; j < expected_materials.length; j++) {
                    if (expected_materials[j].material === material.material) {
                        expectedQuantity += Number(expected_materials[j].expected_quantity);
                    }
                }
                // Calculate the difference
                let difference = usedQuantity - expectedQuantity;
                // Determine the color and text based on the difference
                let differenceColor = 'black';
                let differenceText = '-';
                if (difference > 0) {
                    differenceColor = 'red';
                    differenceText = `+${difference.toFixed(2)}`;
                } else if (difference < 0) {
                    differenceColor = 'green';
                    differenceText = difference.toFixed(2);
                }
                // Find the matching material
                let matchingMaterial = materials.find(mat => mat.material_id === material.material_id);
                // Get the expected wastage, or use 1 as a default if no matching material is found
                let expectedWastage = matchingMaterial ? parseFloat(matchingMaterial.expected_wastage) : 1;                // Multiply the cast_qty by the expected wastage
                let adjustedCastQty = material.cast_qty * (1+expectedWastage);
                console.log("print out matchingMaterial", matchingMaterial);
                console.log("print out Material", material.material);
                console.log("print out expectedWastage", expectedWastage);
                console.log("print out material.cast_qty", material.cast_qty);
                console.log("print out adjustedCastQty", adjustedCastQty);
                tableHtml += `
                <tr style="background-color: ${rowColor}; line-height: 1;">
                    <td>${material.material}</td>
                    <td>${material.tender_qty ? (+Number(material.tender_qty).toFixed(2)) : '-'}</td>
                    <td>${adjustedCastQty ? (+Number(adjustedCastQty).toFixed(2)) : '-'}</td>
                    <td>${usedQuantity ? (+Number(usedQuantity).toFixed(2)) : '-'}</td>
                    <td>${expectedQuantity ? (+Number(expectedQuantity).toFixed(2)) : '-'}</td>
                    <td style="color: ${differenceColor};">${differenceText}</td>
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