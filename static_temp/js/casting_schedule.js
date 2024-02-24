let scheduleDates = [];

function castingScheduleModal() {
    let uniqueDates = [];
    let maxPanelCount = 0;
    let dateToIdMap = {}; // Map to store schedule_date to schedule_id mapping
    for (let schedule of casting_schedule) {
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
    scheduleDates.sort((a, b) => new Date(casting_schedule.find(schedule => schedule.schedule_id === a).schedule_date) - new Date(casting_schedule.find(schedule => schedule.schedule_id === b).schedule_date));
    uniqueDates.sort((a, b) => new Date(a) - new Date(b));
    var modalHtml = `
    <div class="modal fade" id="castingSchedule" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 750px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Casting Schedule</h5>
                </div>           
                <div class="modal-body" style="overflow-x: auto;">
                <table>
                    <tr>
                        <th>Date</th>
                        <th>m3</th>`;
    for (let i = 1; i <= maxPanelCount; i++) {
        modalHtml += `<th>Panel ${i}</th>`;
    }
    modalHtml += `<th>Complete</th></tr>`; // Add new column header
    for (let date of uniqueDates) {
        let formattedDate = new Date(date);
        let display_date = formattedDate.getDate() + '-' + formattedDate.toLocaleString('default', { month: 'short' }) + '-' + formattedDate.getFullYear().toString().substr(-2);
        let panelCount = casting_schedule.filter(schedule => schedule.schedule_date === date).length;
        let totalVolume = panels.filter(panel => panel.schedule_id_id === dateToIdMap[date]).reduce((sum, panel) => {
            return sum + +panel.panel_volume;
        }, 0).toFixed(2);
        let scheduleId = dateToIdMap[date];
        let schedule = casting_schedule.find(schedule => schedule.schedule_id === dateToIdMap[date]);
        let checkboxOrTick = schedule.complete ? '<span style="color: green;">&#10003;</span>' : `<input type="checkbox" class="complete-checkbox" data-schedule-id="${scheduleId}" data-display-date="${display_date}">`;
        modalHtml += `
        <tr>
    
            <td><a href="#" onclick="existingSchedule('${scheduleId}', '${display_date}')">${display_date}</a></td>
            <td><b>${totalVolume}</b></td>`;
        let panelIds = panels.filter(panel => panel.schedule_id_id === dateToIdMap[date]).map(panel => panel.panel_id);
        for (let i = 0; i < maxPanelCount; i++) {
            modalHtml += `<td>${panelIds[i] || ''}</td>`;
        }
        modalHtml += `<td style="text-align: center; vertical-align: middle;">${checkboxOrTick}</td></tr>`;
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
  //checkbox event listener
  $(document).on('click', '.complete-checkbox', function() {
    let scheduleId = $(this).data('schedule-id');
    let display_date = $(this).data('display-date');
    let confirmation = confirm(`You are about to mark the "${display_date}" panels as cast. This is irreversible.`);
    if (confirmation) {
        $.post('/update_casting_schedule/', { scheduleId: scheduleId, complete: 1 })
            .done(function() {
                location.reload();
            })
            .fail(function() {
                alert('An error occurred while marking the panels as cast.');
            });
        }
    });
}


function existingSchedule(scheduleId) {
    let schedule = casting_schedule.find(schedule => schedule.schedule_id === Number(scheduleId));
    let display_date;
    if (schedule) {
        let date = new Date(schedule.schedule_date);
        let day = String(date.getDate()).padStart(2, '0');
        let month = date.toLocaleString('default', { month: 'short' });
        let year = String(date.getFullYear()).slice(-2);
        display_date = `${day}-${month}-${year}`;
    } else {
        console.log(`No schedule found with id ${scheduleId}`);
        return;
    }  
    // Remove any existing modal
    $('#panelLayout').remove();
    let panels = JSON.parse(document.getElementById('panels').textContent);
    console.log('scheduleId is:', scheduleId);
    panels = panels.filter(panel => Number(panel.schedule_id_id) === Number(scheduleId));
    console.log('panels:', panels); // Log 3
    let currentIndex = scheduleDates.indexOf(Number(scheduleId));
    console.log('currentIndex:', currentIndex, 'previous scheduleId:', scheduleDates[currentIndex - 1], 'next scheduleId:', scheduleDates[currentIndex + 1]); // Log 2
    // Create the modal
    let modalHtml = `
    <div class="modal fade" id="panelLayout" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Panel Layout for ${display_date}</h5>
                </div>
                <div class="modal-body">
                    <div id="panelContainer" style="position: relative; width: calc(100% - 20px); height: 500px; background-image: url('${bedLayoutImageUrl}'); background-size: contain; background-repeat: no-repeat; background-position: center;">                        
                        <div class="arrow arrow-left" ${currentIndex === 0 ? 'disabled' : ''} onclick="${currentIndex > 0 ? `existingSchedule('${scheduleDates[currentIndex - 1]}')` : ''}" style="position: absolute; top: 50%; transform: translateY(-50%); font-size: 2em; cursor: pointer; left: 10px;">&#8592;</div>
                        <div class="arrow arrow-right" ${currentIndex === scheduleDates.length - 1 ? 'disabled' : ''} onclick="${currentIndex < scheduleDates.length - 1 ? `existingSchedule('${scheduleDates[currentIndex + 1]}')` : ''}" style="position: absolute; top: 50%; transform: translateY(-50%); font-size: 2em; cursor: pointer; right: 10px;">&#8594;</div>
                        ${panels.map(panel => `
                            <div class="panel" style="position: absolute; left: ${panel.panel_position_x}px; top: ${panel.panel_position_y}px; width: ${panel.panel_width / 58}px; height: ${panel.panel_length / 58}px; transform: rotate(${panel.panel_rotation ? '90deg' : '0deg'}); background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%); cursor: move; display: flex; justify-content: center; align-items: center;" data-rotation="${panel.panel_rotation}">
                                ${panel.panel_id}
                                <div style="position: absolute; top: -${215 / 58}px; left: -${215 / 58}px; width: calc(100% + ${430 / 58}px); height: calc(100% + ${430 / 58}px); border: 1px solid black;"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                    <div class="modal-footer">
                    <div class="col-4 text-left">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                    <div class="col-4 text-right">
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
            let rotation = $(this).data('rotation') || false;
            rotation = !rotation;
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
    