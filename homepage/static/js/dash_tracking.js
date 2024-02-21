function dashBomTracking() {
    var scriptTag = document.getElementById('bom_tracking');
    var scriptTag2 = document.getElementById('used_materials');
    var scriptTag3 = document.getElementById('expected_used_materials');
    var scriptTag4 = document.getElementById('materials_cast');
    
    // Parse the JSON data from the script tag
    var bom_tracking = JSON.parse(scriptTag.textContent);
    var used_materials = JSON.parse(scriptTag2.textContent);
    var expected_materials = JSON.parse(scriptTag3.textContent);
    var cast_materials = JSON.parse(scriptTag4.textContent);

    // console.log("print out bom_tracking", bom_tracking);
    // console.log("print out used_materials", used_materials);
    // console.log("print out expected_materials", expected_materials);
    // console.log("print out cast_materials", cast_materials);

    var tableHtml = `
    <div style="overflow-x: auto; opacity: 0.85; height: 300px; overflow-y: auto;">
        <table style="font-size: 0.8em;">
            <tr style="background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                <th colspan="6" style="position: sticky; top: 0; text-align: center; height: 30px; overflow: hidden;">BOM Tracking</th>
            </tr>
            <tr>
                <th style="height: 30px; position: sticky; top: 37px; overflow: hidden;" title="test tip">Material</th>
                <th style="height: 30px; position: sticky; top: 37px; overflow: hidden;" title="Tendered quantity for each material. Includes assumed wastage">Tender #</th>
                <th style="height: 30px; position: sticky; top: 37px; overflow: hidden;" title="Cast quantity per schedules checked as complete. Includes assumed wastage">Cast #</th>
                <th style="height: 30px; position: sticky; top: 37px; overflow: hidden;" title="Quantities actually used as per concrete orders and stocktake counts allocated to schedules. Note, clicking 'complete' on a schedule does not add quantities to this column.">Counted #</th>
                <th style="height: 30px; position: sticky; top: 37px; overflow: hidden;" title="Tendered quantity for comparing 'Counted' quantity to. If a panel has had its concrete 'Counted', but not its ferrules, only the tendered concrete quantity will be added to this column.">Exp #</th>
                <th style="height: 30px; position: sticky; top: 37px; overflow: hidden;" title="Counted quantity less 'Expected' quantity. As stocktakes are snapped and concrete orders 'used', this column is the best indication of how quantities are tracking vs budget">Act vs Exp</th>
            </tr>`;
            for (let i = 0; i < bom_tracking.length; i++) {
                let material = bom_tracking[i];
                let rowColor = i % 2 === 0 ? 'white' : 'lightgrey'; // Change color based on row index
                // Calculate the sum of used_materials.quantity for matching materials
                let usedQuantity = 0;
                let expectedQuantity = 0;
                let castQuantity = 0;
                // let tenderedQuantity = 0;
                for (let j = 0; j < used_materials.length; j++) {
                    if (used_materials[j].material === material.material) {
                        usedQuantity += Number(used_materials[j].used_quantity);
                    }
                }
                // Calculate the sum of expected_materials.expected_theoretical_quantity for matching materials
                for (let j = 0; j < expected_materials.length; j++) {
                    if (expected_materials[j].material === material.material) {
                        expectedQuantity += Number(expected_materials[j].expected_theoretical_quantity);
                    }
                }
                // Calculate the sum of expected_materials.expected_theoretical_quantity for matching materials
                for (let j = 0; j < cast_materials.length; j++) {
                    if (cast_materials[j].material_id === material.material_id) {
                        castQuantity += Number(cast_materials[j].tendered_cast_qty);
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
                tableHtml += `
                <tr style="background-color: ${rowColor}; line-height: 1;">
                    <td>${material.material}</td>
                    <td>${material.tender_qty ? (+Number(material.tender_qty).toFixed(2)) : '-'}</td>
                    <td>${castQuantity ? (+Number(castQuantity).toFixed(2)) : '-'}</td>
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