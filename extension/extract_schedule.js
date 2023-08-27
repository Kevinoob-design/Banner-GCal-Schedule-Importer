extract_schedule();
function extract_schedule() {
	console.log("extract is executing")
	var schedule_wrappers = document.getElementById("scheduleListViewWrapper");
	var child_divs = schedule_wrappers.getElementsByTagName("div")[ 0 ].getElementsByClassName("listViewWrapper");
	var selected_semester = document.getElementsByClassName("select2-chosen")[ 0 ].innerText.trim();
	var schedule = [];
	var course_names = document.getElementById("table1").getElementsByTagName("tr");
	var schedule_details_not_selected = document.getElementById("scheduleCalViewLink").parentElement.className.split(' ').indexOf("ui-tabs-selected") >= 0;
	if (schedule_details_not_selected) {
		chrome.runtime.sendMessage({
			data: "schedule_details_not_selected"
		}, function (response) {
			console.dir(response);
		});
	} else {
		for (var i = 0; i < child_divs.length; ++i) {
			var meeting_days = [ ...child_divs[ i ].getElementsByClassName("listViewMeetingInformation")[ 0 ].getElementsByClassName("ui-pillbox-summary") ].map(meeting_day => meeting_day.innerText);
			var course_title = course_names[ i + 1 ].getElementsByTagName("td")[ 1 ].innerText.substring(0, course_names[ i + 1 ].getElementsByTagName("td")[ 1 ].innerText.indexOf(","));
			var instructor_name = child_divs[ i ].getElementsByClassName("listViewInstructorInformation")[ 0 ].innerText.split("\n")[ 0 ].split(":")[ 1 ];
			course_crn = child_divs[ i ].getElementsByClassName("listViewInstructorInformation")[ 0 ].innerText.split("\n")[ 1 ].split(":")[ 1 ];
			if (meeting_days[ 0 ] === "None") {
				schedule.push({
					"id": uuidv4(),
					"course_title": course_title,
					"instructor_name": instructor_name,
					"course_crn": course_crn,
					"meeting_window": child_divs[ i ].getElementsByClassName("listViewMeetingInformation")[ 0 ].getElementsByTagName("span")[ 0 ].innerText.replace(/\s/g, '').split("--"),
					"selected_semester": selected_semester,
					"meeting_times": "Online"
				});
			} else {
				var meeting_window = child_divs[ i ].getElementsByClassName("listViewMeetingInformation")[ 0 ].getElementsByTagName("span")[ 0 ].innerText.replace(/\s/g, '').split("--");
				var meeting_times = [ ...child_divs[ i ].getElementsByClassName("listViewMeetingInformation")[ 0 ].getElementsByClassName("ui-pillbox") ]
					.map(uiPillBox => uiPillBox.nextSibling.innerText.replace(/\s/g, '').split("-"))

				var semFirstDay = new Date(meeting_window[ 0 ]);
				semFirstDay = semFirstDay.getDay();

				for (let k = 0; k < meeting_days.length; k++) {
					const meeting_day = meeting_days[ k ];

					const meeting_details = [ ...child_divs[ i ].getElementsByClassName("listViewMeetingInformation")[ 0 ].getElementsByClassName("bold") ]
						.map(uiPillBox => `${uiPillBox.innerText} ${uiPillBox.nextSibling.nodeValue.trim()}`).splice(k * 4, (k * 4) + 4)
					const meeting_room = child_divs[ i ].getElementsByClassName("listViewMeetingInformation")[ 0 ].innerHTML.split("<br>")[ k ].substr(-4).replace(/\D/g, "");
					const id = uuidv4();

					schedule.push({
						"id": id,
						"course_title": course_title,
						"instructor_name": instructor_name,
						"course_crn": course_crn,
						"meeting_window": meeting_window,
						"meeting_days": meeting_days,
						"meeting_times": meeting_times[ k ],
						"meeting_building": meeting_details[ 2 ],
						"meeting_room": meeting_details[ 3 ],
						"meeting_location": meeting_details[ 1 ].split(":")[ 1 ].trim(),
						"meeting_details": meeting_details.join().replace(/,/gi, ", "),
						"course_type": "In-Person",
						"selected_semester": selected_semester,
						"meeting_day": meeting_day,
						"group": i
					});
				}

			}
			if (i == child_divs.length - 1) {
				chrome.runtime.sendMessage({
					data: schedule
				}, function (response) {
					console.dir(response);
				});
			}
		}
	}

}
/**
 * RFC4122 version 4 compliant unique id generator
 */
function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
