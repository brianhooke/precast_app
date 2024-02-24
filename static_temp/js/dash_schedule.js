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
        <table>
            <tr style="background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                <th colspan="${maxPanelCount + 3}" class="sticky-header" style="position: sticky; top: 0; text-align: center;">Schedule</th>
            </tr>
            <tr style="background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                <th style="position: sticky; top: 40px;">Date</th>
                <th style="position: sticky; top: 40px;">m3</th>`;
    for (let i = 1; i <= maxPanelCount; i++) {
        tableHtml += `<th style="position: sticky; top: 40px;">Panel ${i}</th>`;
    }
    tableHtml += `<th style="position: sticky; top: 40px;">Complete</th></tr>`;
    for (let i = 0; i < uniqueDates.length; i++) {
        let date = uniqueDates[i];
        let formattedDate = new Date(date);
        let display_date = formattedDate.getDate() + '-' + formattedDate.toLocaleString('default', { month: 'short' }) + '-' + formattedDate.getFullYear().toString().substr(-2);
        let totalVolume = panels.filter(panel => panel.schedule_id_id === dateToIdMap[date]).reduce((sum, panel) => {
            return sum + +panel.panel_volume;
        }, 0).toFixed(2);
        let scheduleId = dateToIdMap[date];
        let schedule = casting_schedule.find(schedule => schedule.schedule_id === dateToIdMap[date]);
        let checkboxOrTick = schedule.complete ? '<span style="color: green;">&#10003;</span>' : `<input type="checkbox" class="complete-checkbox" data-schedule-id="${scheduleId}" data-display-date="${display_date}">`;
        let rowColor = i % 2 === 0 ? 'white' : 'lightgrey'; // Change color based on row index
        tableHtml += `
        <tr id="row-${i}" style="background-color: ${rowColor}; background: white;">
            <td><a href="#" onclick="existingSchedule('${scheduleId}', '${display_date}')">${display_date}</a></td>
            <td><b>${totalVolume}</b></td>`;
        let panelIds = panels.filter(panel => panel.schedule_id_id === dateToIdMap[date]).map(panel => panel.panel_id);
        for (let i = 0; i < maxPanelCount; i++) {
            tableHtml += `<td>${panelIds[i] || ''}</td>`;
        }
        tableHtml += `<td style="text-align: center; vertical-align: middle;">${checkboxOrTick}</td></tr>`;
    }
    tableHtml += `
        </table>
    </div>`;
// Select the second-quadrant div
var secondQuadrant = document.querySelector('#second-quadrant > div');
// Set its innerHTML to the table HTML
secondQuadrant.innerHTML = tableHtml;
// Find the first row where complete=0
let firstIncompleteRow = Array.from(document.querySelectorAll('tr')).find(row => row.querySelector('.complete-checkbox'));
// Scroll to this row
if (firstIncompleteRow) {
    setTimeout(() => {
        firstIncompleteRow.scrollIntoView();
        // Adjust scroll position to keep "Schedule" heading visible
        window.scrollBy(0, -document.querySelector('.sticky-header').offsetHeight);
    }, 0);
}
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