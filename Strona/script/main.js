$(document).ready(function () {
    var promise = getData();
    promise.done(displayHomeContent(result), initSettingsModal(result));
    initDateModal();
    const getTimer = setInterval(refreshData, 8000);
});

function getData() {
    return $.ajax({
        url: "get_data.php?q=",
        type: "GET",
        contentType: "text/plain",
        success: function (result) {

    })
}

function displayHomeContent(result) {
    const data = Object.values(result);
    for (let i = 0; i < data.length; i++) {
        const card = $(document.createElement("div"))
            .attr({
                id: data[i].id_kamery,
                class: "uk-card uk-card-default uk-card-body"
            })
            .appendTo($("#grid-photo"));
        $(document.createElement("h3"))
            .attr({
                class: "uk-card-title"
            })
            .text(data[i].nazwa_kamery)
            .appendTo(card);
        $(document.createElement("img"))
            .attr({
                src: "img/" + data[i].nazwa
            })
            .appendTo(card);
        const temp = parseFloat(data[i].temperatura).toFixed(1);
        const rh = parseInt(data[i].rh);
        const stan = data[i].stan == '1' ? "Zamknięty" : "Otwarty";
        $(document.createElement("p"))
            .html("Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" + "</br>" + data[i].nazwa_czujnika + ": " + stan)
            .appendTo(card);

    }
}

function initSettingsModal(result) {

}

function refreshData() {
    $.ajax({
        url: "get_data.php?q=",
        type: "GET",
        contentType: "text/plain",
        success: function (result) {
            result = Object.values(result);
            for (let i = 0; i < result.length; i++) {
                const card = $(`#${result[i].id_kamery}`);
                const img = card.find("img");
                img.attr('src', 'img/' + result[i].nazwa);
                const text = card.find("p");
                const temp = parseFloat(result[i].temperatura).toFixed(1);
                const rh = parseInt(result[i].rh);
                const stan = result[i].stan == '1' ? "Zamknięty" : "Otwarty";
                text.html("Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" + "</br>" + result[i].nazwa_czujnika + ": " + stan);
            }
        }
    })
}

function getAllData() {
    $.ajax({
        url: "get_data.php?q=archiwum",
        type: "GET",
        contentType: "text/plain",
        success: function (result) {
            var content = $('#content');
            content.empty();
            result = Object.values(result);
            for (i = 0; i < result.length; i++) {
                var grid = $(document.createElement("div"))
                    .attr({
                        id: "grid-photo" + i,
                        class: "uk-padding-large uk-child-width-1-2@s uk-child-width-1-3@m uk-child-width-1-4@l uk-child-width-1-5@xl",
                        "uk-grid": "",
                        "uk-lightbox": "animation: slide"
                    })
                    .appendTo(content);
                $(document.createElement("div"))
                    .attr({
                        class: "uk-h3 uk-overlay uk-position-large uk-position-top-left"
                    })
                    .text(result[i].nazwa_kamery)
                    .appendTo(grid);
                console.log(result[i]);
                result[i].zdjecia = Object.values(result[i].zdjecia);
                for (j = result[i].zdjecia.length - 1; j >= 0; j--) {
                    var albumElement = $(document.createElement("div"))
                        .appendTo($("#grid-photo" + i));
                    var photoLink = $(document.createElement("a"))
                        .attr({
                            href: "img/" + result[i].zdjecia[j].nazwa,
                            "data-type": "iframe"
                        })
                        .appendTo(albumElement);
                    var card = $(document.createElement("div"))
                        .attr({
                            class: "uk-card uk-card-default uk-card-body"
                        })
                        .appendTo(photoLink);
                    $(document.createElement("img"))
                        .attr({
                            src: "img/" + result[i].zdjecia[j].nazwa
                        })
                        .appendTo(card);
                    var data = result[i].zdjecia[j].data;
                    var temp = parseFloat(result[i].zdjecia[j].temperatura).toFixed(1);
                    var rh = parseInt(result[i].zdjecia[j].rh);
                    var stan = result[i].zdjecia[j].stan === '1' ? "Zamknięty" : "Otwarty";
                    $(document.createElement("p"))
                        .html(data + "</br>Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" + "</br>" + result[i].zdjecia[j].nazwa_czujnika + ": " + stan)
                        .attr({
                            class: "uk-text-small"
                        })
                        .appendTo(card);

                }
            }
        }
    });
}

function initDatePickers() {
    var endPicker = new Pikaday({
        field: $('#data-koniec')[0],
        firstDay: 1,
        onSelect: function () {
            updateEndDate(this.getDate(), startPicker, this)
        },
        i18n: {
            previousMonth: 'Poprzedni miesiąc',
            nextMonth: 'Następny miesiąc',
            months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
            weekdays: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
            weekdaysShort: ['Niedz.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.']
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

function updateEndDate(endDate, startPicker, endPicker) {
    startPicker.setEndRange(endDate);
    startPicker.setMaxDate(endDate);
    endPicker.setEndRange(endDate);
}

function initDateModal() {
    $('#archiwum').on('click', getAllData());
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
