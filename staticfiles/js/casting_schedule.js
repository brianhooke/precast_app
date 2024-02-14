let scheduleDates = [];

function castingScheduleModal() {
    var modalHtml = `
    <div class="modal fade" id="castingSchedule" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 300px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Casting Schedule</h5>
                </div>           
                <div class="modal-body" style="overflow-x: auto;">
                <table>
                    <tr>
                        <th>Date</th>
                        <th># Panels</th>
                        <th>m3</th>                        
                    </tr>`;
                    let uniqueDates = [];
                    for (let schedule of casting_schedule) {
                        if (!uniqueDates.includes(schedule.schedule_date)) {
                            uniqueDates.push(schedule.schedule_date);
                        }
                    }
                    scheduleDates = [...new Set(casting_schedule.map(schedule => schedule.schedule_date))];                    console.log('scheduleDatesString:', scheduleDates);
                    for (let date of uniqueDates) {
                        let formattedDate = new Date(date);
                        formattedDate = formattedDate.getDate() + '-' + formattedDate.toLocaleString('default', { month: 'short' }) + '-' + formattedDate.getFullYear();
                        // Count the number of panels for this date
                        let panelCount = casting_schedule.filter(schedule => schedule.schedule_date === date).length;
                        modalHtml += `
                        <tr>
                            <td>
                                <a href="#" onclick="existingSchedule('${date}')">${date}</a>                        
                            </td>
                            <td>${panelCount}</td>
                            <td>99</td>
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
    $('#castingSchedule').modal('show');
}

function existingSchedule(date) {
    // Remove any existing modal
    $('#panelLayout').remove();
    let panels = JSON.parse(document.getElementById('panels').textContent);
    let casting_schedule = JSON.parse(document.getElementById('casting_schedule').textContent);
    let scheduled_panel_ids = casting_schedule.filter(schedule => schedule.schedule_date === date).map(schedule => schedule.panel_id_id);
    panels = panels.filter(panel => scheduled_panel_ids.includes(panel.panel_id));
    let formattedDate = new Date(date);
    let day = formattedDate.getDate();
    let month = formattedDate.toLocaleString('default', { month: 'short' });
    let year = formattedDate.getFullYear().toString().substr(-2);
    formattedDate = `${day}-${month}-${year}`;
    // Find the index of the current date in the scheduleDates array
    let currentIndex = scheduleDates.indexOf(date);
    // Create the modal
    let modalHtml = `
    <div class="modal fade" id="panelLayout" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Panel Layout for ${formattedDate}</h5>
                </div>
                <div class="modal-body">
                    <div id="panelContainer" style="position: relative; width: calc(100% - 20px); height: 500px; background-image: url('${bedLayoutImageUrl}'); background-size: contain; background-repeat: no-repeat; background-position: center;">                        <div class="arrow arrow-left" ${currentIndex === 0 ? 'disabled' : ''} onclick="existingSchedule('${scheduleDates[currentIndex - 1]}')" style="position: absolute; top: 50%; transform: translateY(-50%); font-size: 2em; cursor: pointer; left: 10px;">&#8592;</div>
                        <div class="arrow arrow-right" ${currentIndex === scheduleDates.length - 1 ? 'disabled' : ''} onclick="existingSchedule('${scheduleDates[currentIndex + 1]}')" style="position: absolute; top: 50%; transform: translateY(-50%); font-size: 2em; cursor: pointer; right: 10px;">&#8594;</div>
                        ${panels.map(panel => `
                            <div class="panel" style="position: absolute; left: ${panel.panel_position_x}px; top: ${panel.panel_position_y}px; width: ${panel.panel_width / 58}px; height: ${panel.panel_length / 58}px; transform: rotate(${panel.panel_rotation ? '90deg' : '0deg'}); background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%); cursor: move; display: flex; justify-content: center; align-items: center;">
                                ${panel.panel_id}
                                <div style="position: absolute; top: -${215 / 58}px; left: -${215 / 58}px; width: calc(100% + ${430 / 58}px); height: calc(100% + ${430 / 58}px); border: 1px solid black;"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="col-6 text-left">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                    <div class="col-6 text-right">
                        <button type="button" class="btn btn-primary update-completed-values" id="saveConfigurationBtn">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    // Append the modal to the body
    let modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement);
    // Initialize drag and drop
    $('#panelLayout').on('shown.bs.modal', function () {
        $('.panel').draggable();
        $('.panel').on('contextmenu', function(e) {
            e.preventDefault();
            let width = $(this).width();
            let height = $(this).height();
            $(this).width(height);
            $(this).height(width);
            // Toggle the rotation attribute
            let rotation = $(this).data('rotation') || 0;
            rotation = (rotation + 1) % 2;
            $(this).data('rotation', rotation);
        });
    });
    // Show the modal
    $('#panelLayout').modal('show');
    // Add event listener to the 'Create Order' button
    $('#saveConfigurationBtn').on('click', function() {
        let data = gatherData();
        postData(data).then(() => {
            location.reload();
        });
    });
}

function gatherData() {
    let data = [];
    $('.panel').each(function() {
        let panelId = $(this).text();
        let position = $(this).position();
        let rotation = $(this).data('rotation') || 0;
        data.push({
            panel_id: panelId,
            panel_position_x: position.left,
            panel_position_y: position.top,
            panel_rotation: rotation
        });
    });
    return data;
}

function postData(data) {
    // Send a POST request to the server
    return fetch('/update-panel-position-and-size/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Include CSRF token in header for Django. Replace 'csrftoken' with your actual CSRF token.
            'X-CSRFToken': 'csrftoken'
        },
        body: JSON.stringify(data)
    }).then(response => response.json()).then(data => {
        // Handle the response
        console.log(data);
    }).catch(error => {
        // Handle the error
        console.error(error);
    });
}



document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('#castingLink').addEventListener('click', function(event) {
        event.preventDefault();
        // Call the showSuppliers function with the suppliers data
        castingScheduleModal();
        });
    });
    