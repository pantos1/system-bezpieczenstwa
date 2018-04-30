$(document).ready(function () {
    getData();
    initDateModal();
    const getTimer = setInterval(refreshData, 8000);
});

function getData(){
	$.ajax({
		url: "get_data.php?q=",
		type: "GET",
		contentType: "text/plain",
		success: function(result) {
			result = Object.values(result);
			for (let i=0; i<result.length; i++) {
				const card = $(document.createElement("div"))
					.attr({
						id: result[i].id_kamery,
						class: "uk-card uk-card-default uk-card-body"
					})
					.appendTo($("#grid-photo"));
				$(document.createElement("h3"))
					.attr({
						class: "uk-card-title"
					})
					.text(result[i].nazwa_kamery)
					.appendTo(card);
				$(document.createElement("img"))
					.attr({
						src: "img/" + result[i].nazwa
					})
					.appendTo(card);
                const temp = parseFloat(result[i].temperatura).toFixed(1);
                const rh = parseInt(result[i].rh);
				const stan = result[i].stan == '1' ? "Zamknięty" : "Otwarty";
				$(document.createElement("p"))
					.html("Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" +"</br>" + result[i].nazwa_czujnika + ": " + stan)
					.appendTo(card);

			}
		}
	})
}

function refreshData(){
	$.ajax({
		url: "get_data.php?q=",
		type: "GET",
		contentType: "text/plain",
		success: function(result) {
			result = Object.values(result);
			for (let i=0; i<result.length; i++) {
                const card = $(`#${result[i].id_kamery}`);
                const img = card.find("img");
                img.attr('src', 'img/' + result[i].nazwa);
                const text = card.find("p");
                const temp = parseFloat(result[i].temperatura).toFixed(1);
                const rh = parseInt(result[i].rh);
                const stan = result[i].stan == '1' ? "Zamknięty" : "Otwarty";
                text.html("Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" +"</br>" + result[i].nazwa_czujnika + ": " + stan);
			}
		}
	})
}

function initDatePickers() {
    var endPicker = new Pikaday({
        field: $('#data-koniec')[0],
        firstDay: 1,
        onSelect: function() {
            updateEndDate(this.getDate(), startPicker, this)
        },
        i18n: {
            previousMonth : 'Poprzedni miesiąc',
            nextMonth     : 'Następny miesiąc',
            months        : ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
            weekdays      : ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'],
            weekdaysShort : ['Niedz.','Pon.','Wt.','Śr.','Czw.','Pt.','Sob.']
        }
    });
    var startPicker = new Pikaday({
        field: $('#data-start')[0],
        firstDay: 1,
        onSelect: function () {
            updateStartDate(this.getDate(), this, endPicker)
        },
        i18n: {
            previousMonth: 'Poprzedni miesiąc',
            nextMonth: 'Następny miesiąc',
            months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
            weekdays: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
            weekdaysShort: ['Niedz.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.']
        }
    });
    return {
		'startPicker': startPicker,
		'endPicker': endPicker
	}
}

function updateStartDate(startDate, startPicker, endPicker) {
    startPicker.setStartRange(startDate);
    endPicker.setStartRange(startDate);
    endPicker.setMinDate(startDate);
}
function updateEndDate (endDate, startPicker, endPicker) {
    startPicker.setEndRange(endDate);
    startPicker.setMaxDate(endDate);
    endPicker.setEndRange(endDate);
}

function initDateModal() {
    let {startPicker, endPicker} = initDatePickers();
    $("#zapisz-daty").on("click", function (event) {
        let startDate = startPicker.getDate();
        let endDate = endPicker.getDate();
        let url = 'export_events.php?start=';
        if (startDate != null) url = url + startDate.toJSON();
        url = url + '&end=';
        if (endDate != null) url = url + endDate.toJSON();
		window.open(url, '_blank');
    })
}
