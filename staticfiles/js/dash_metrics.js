function metricsTable() {
    var tableHtml = `
    <div style="overflow-x: auto; opacity: 0.85;">
        <div style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%); padding: 10px;">
            <h6 style="margin: 0;">Metrics</h6>
        </div>
        <table>
            <tr>
                <th>Metric</th>
                <th>Projected</th>
                <th>Tracking</th>
            </tr>
            <tr>
                <td>Profit</td>                        
                <td>30,000</td>                        
                <td>29,000</td>
            </tr>
            <tr>
                <td>Profit</td>                        
                <td>30,000</td>                        
                <td>29,000</td>
            </tr>
        </table>
    </div>
    `;
    // Select the first-quadrant div
    var firstQuadrant = document.querySelector('#first-quadrant > div');
    // Set its innerHTML to the table HTML
    firstQuadrant.innerHTML = tableHtml;
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Call the showBom function with the bom data
    metricsTable(bom);
});