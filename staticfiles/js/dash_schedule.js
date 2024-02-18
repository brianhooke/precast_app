function dashSchedule() {
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
    
    var tableHtml = `
    <div style="overflow-x: auto; opacity: 0.85; height: 300px; overflow-y: auto;">
        <div style="text-align: center; background: linear-gradient(45deg, #A090D0, #B3E1DD); padding: 5px; position: sticky; top: 0;">
            <h6 style="margin: 0; font-size: 0.8em;">Schedule</h6>
        </div>
        <table style="font-size: 0.8em;">
            <tr>
                <th style="position: sticky; top: 20px; font-size: 0.8em; padding: 2px;">Date</th>
                <th style="position: sticky; top: 20px; font-size: 0.8em; padding: 2px;">m3</th>`;
    for (let i = 1; i <= maxPanelCount; i++) {
        tableHtml += `<th style="position: sticky; top: 20px; font-size: 0.8em; padding: 2px;">Panel ${i}</th>`;
    }
    tableHtml += `<th style="position: sticky; top: 20px; font-size: 0.8em; padding: 2px;">Complete</th></tr>
                    </table>
                </div>`;
// Select the second-quadrant div
var secondQuadrant = document.querySelector('#second-quadrant > div');
// Set its innerHTML to the table HTML
secondQuadrant.innerHTML = tableHtml;
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

document.addEventListener('DOMContentLoaded', (event) => {
// Call the castingScheduleTable function
dashSchedule();
});