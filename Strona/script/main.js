$(document).ready(() => {
    main();
});

async function main() {
    try {
        const result = await getData();
        displayHomeContent(result);
        $('#loading-overlay').hide();
        initSettingsModal(result);
    } catch (e) {
        console.log(e.responseText);
        $('#loading-overlay').hide();
    }
    initDateModal();
    $('#archive').on('click', () => {
        displayArchive();
    });
    const getTimer = setInterval(refreshData, 8000);
}

function getData() {
    return $.ajax({
        url: "get_data.php?q=",
        type: "GET",
        contentType: "text/plain"
    })
}

function getSettings() {
    return $.ajax({
        url: "get_settings.php",
        type: "GET",
        contentType: "text/plain"
    })
}

function postPrefs(id, data) {
    return $.ajax({
        url: "post_settings.php?id_kamery=" + id,
        type: POST,
        contentType: "application/json",
        data: data,
        processData: false
    })
}

function displayHomeContent(result) {
    const data = Object.values(result);
    console.log(data);
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
        const state = data[i].stan == '1' ? "Zamknięty" : "Otwarty";
        $(document.createElement("p"))
            .html("Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" + "</br>" + data[i].nazwa_czujnika + ": " + state)
            .appendTo(card);

    }
}

async function initSettingsModal(result) {
    const $generalSection = $('#general-section');
    const $emailCheckbox = $('#email-checkbox');
    const $emailInput = $('#email-input');
    const $generalForm = $('#general-form');
    const $nameSection = $('#name-section');
    const $prefsSection = $('#prefs-section');
    const $saveFormButton = $('#button-save-form');
    const deviceList = Object.values(result);
    try {
        for (let i = 0; i < deviceList.length; i++) {
            $nameSection.append(createNameFormElement(deviceList[i]));
            $prefsSection.append(createPrefsFormElement(deviceList[i]));
        }
        $emailInput.hide();
        $emailCheckbox.on('click', () => {
            $emailInput.toggle();
        });
        const settings = await getSettings();
        if (settings.ogolne.powiadomienia_email) {
            $emailCheckbox.checked = true;
        }
        $saveFormButton.on('click', () => {
		   console.log($generalForm);
           const generalFormData = $generalForm.serializeArray();
           console.log(generalFormData);
           $($nameSection).find('form').each((index, element) => {
               console.log($(element));
               console.log($(element).serializeArray());
           });
            $($prefsSection).find('form').each((index, element) => {
                console.log($(element).serializeArray());
            });
        });
    } catch (e) {
        console.log(e.responseText);
    }
}

function createNameFormElement(deviceData) {
    const $nameForm = $(document.createElement("form"))
        .attr({
            id: deviceData.nazwa_kamery + '-name-form',
            name: deviceData.id_kamery
        });

    $nameForm.append(createLabelAndInput(deviceData.nazwa_kamery, 'nazwa_kamery'));
    $nameForm.append(createLabelAndInput(deviceData.nazwa_czujnika_temp, 'nazwa_czujnika_temp'));
    $nameForm.append(createLabelAndInput(deviceData.nazwa_czujnika, 'nazwa_czujnika'));
    return $nameForm;
}

function createPrefsFormElement(deviceData) {
    const $prefsForm = $(document.createElement("form"))
        .attr({
            id: deviceData.nazwa_kamery + '-prefs-form',
            name: deviceData.nazwa_kamery + '-prefs-form'
        });
    let label = deviceData.nazwa_kamery + " - częstotliwość zdjęcia w sekundach";
    $prefsForm.append(createLabelAndInput(label, 'czestotliwosc_zdjecia', deviceData.czestotliwosc_zdjecia));
    label = deviceData.nazwa_czujnika_temp + " - częstotliwość pomiaru temperatury w sekundach";
    $prefsForm.append(createLabelAndInput(label, 'czestotliwosc_pomiaru_temp', deviceData.czestotliwosc_pomiaru_temp));
    label = deviceData.nazwa_czujnika + " - częstotliwość odczytu czujnika stykowego";
    $prefsForm.append(createLabelAndInput(label, 'czestotliwosc_odczytu_stanu', deviceData.czestotliwosc_odczytu_stanu));
    return $prefsForm;
}

function createLabelAndInput(labelText, inputName, inputValue) {
    const divElement = $(document.createElement("div"))
        .attr({
            class: "uk-margin"
        });
    $(document.createElement("label"))
        .attr({
            class: "uk-form-label",
            for: labelText
        })
        .text(labelText)
        .appendTo(divElement);
    $(document.createElement("div"))
        .attr({
            class: "uk-form-controls"
        })
        .append(
            $(document.createElement("input"))
            .attr({
				id: labelText,
				name: inputName,
                class: "uk-input",
                type: "text",
                value: inputValue
            })
        )
        .appendTo(divElement);
    return divElement;
}

async function refreshData() {
    try {
        const data = await getData();
        const result = Object.values(data);
        for (let i = 0; i < result.length; i++) {
            const card = $(`#${result[i].id_kamery}`);
            const img = card.find("img");
            img.attr('src', 'img/' + result[i].nazwa);
            const text = card.find("p");
            const temp = parseFloat(result[i].temperatura).toFixed(1);
            const rh = parseInt(result[i].rh);
            const state = result[i].stan == '1' ? "Zamknięty" : "Otwarty";
            text.html("Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" + "</br>" + result[i].nazwa_czujnika + ": " + state);
        }
    } catch (e) {
        console.log(e.responseText);
    }
}

async function displayArchive() {
    const $loadingOverlay = $('#loading-overlay');
    $loadingOverlay.show();
    try {
        const data = await getAllData();
        const content = $('#content');
        content.empty();
        content.attr({
            class: "uk-flex-column"
        });
        const result = Object.values(data);
        for (let i = 0; i < result.length; i++) {
            const grid = $(document.createElement("div"))
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
            result[i].zdjecia = Object.values(result[i].zdjecia);
            for (let j = result[i].zdjecia.length - 1; j >= 0; j--) {
                const albumElement = $(document.createElement("div"))
                    .appendTo($("#grid-photo" + i));
                const photoLink = $(document.createElement("a"))
                    .attr({
                        href: "img/" + result[i].zdjecia[j].nazwa,
                        "data-type": "iframe"
                    })
                    .appendTo(albumElement);
                const card = $(document.createElement("div"))
                    .attr({
                        class: "uk-card uk-card-default uk-card-body"
                    })
                    .appendTo(photoLink);
                $(document.createElement("img"))
                    .attr({
                        src: "img/" + result[i].zdjecia[j].nazwa
                    })
                    .appendTo(card);
                const date = result[i].zdjecia[j].data;
                const temp = parseFloat(result[i].zdjecia[j].temperatura).toFixed(1);
                const rh = parseInt(result[i].zdjecia[j].rh);
                const state = result[i].zdjecia[j].stan === '1' ? "Zamknięty" : "Otwarty";
                $(document.createElement("p"))
                    .html(date + "</br>Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" + "</br>" + result[i].zdjecia[j].nazwa_czujnika + ": " + state)
                    .attr({
                        class: "uk-text-small"
                    })
                    .appendTo(card);
            }
        }
    } catch (e) {
        console.log(e.responseText);
    }

    $loadingOverlay.hide();
}

function getAllData() {
    return $.ajax({
        url: "get_data.php?q=archiwum",
        type: "GET",
        contentType: "text/plain"
    });
}

function initDatePickers() {
    let endPicker, startPicker;
    endPicker = new Pikaday({
        field: $('#date-end')[0],
        firstDay: 1,
        onSelect: function () {
            updateEndDate(this.getDate(), startPicker, this)
        },
        format: 'DD.MM.YYYY',
        i18n: {
            previousMonth: 'Poprzedni miesiąc',
            nextMonth: 'Następny miesiąc',
            months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
            weekdays: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
            weekdaysShort: ['Niedz.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.']
        }
    });
    startPicker = new Pikaday({
        field: $('#date-start')[0],
        firstDay: 1,
        onSelect: function () {
            updateStartDate(this.getDate(), this, endPicker)
        },
        format: 'DD.MM.YYYY',
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
    let {startPicker, endPicker} = initDatePickers();
    $("#save-dates").on("click", () => {
        let startDate = startPicker.getDate();
        let endDate = endPicker.getDate();
        let startDateString = startDate.getFullYear() + "-" + ("0" + (startDate.getMonth() + 1)).slice(-2) + "-" + ("0" + startDate.getDate()).slice(-2) + "T00:00:00";
        let endDateString = endDate.getFullYear() + "-" + ("0" + (endDate.getMonth() + 1)).slice(-2) + "-" + ("0" + endDate.getDate()).slice(-2) + "T23:59:00";
        let url = 'export_events.php?start=';
        if (startDate != null) url = url + startDateString;
        url = url + '&end=';
        if (endDate != null) url = url + endDateString;
        window.open(url, '_blank');
    })
}
