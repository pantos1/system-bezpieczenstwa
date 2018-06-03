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

function getAllData() {
    return $.ajax({
        url: "get_data.php?q=archiwum",
        type: "GET",
        contentType: "text/plain"
    });
}

function getSettings() {
    return $.ajax({
        url: "get_settings.php",
        type: "GET",
        contentType: "text/plain"
    })
}

function updatePrefs(data) {
    return $.ajax({
        url: "update_prefs.php",
        type: "POST",
        contentType: "application/json",
        data: data,
        processData: false
    })
}

function updateNames(data) {
    return $.ajax({
        url: "update_names.php",
        type: "POST",
        contentType: "application/json",
        data: data,
        processData: false
    })
}

function updateSettings(data) {
    return $.ajax({
        url: "update_settings.php",
        type: "POST",
        contentType: "application/json",
        data: data,
        processData: false
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
        const temp = data[i].temperatura ? parseFloat(data[i].temperatura).toFixed(1).toLocaleString('pl-PL') : "-";
        const rh = data[i].rh ? parseInt(data[i].rh) : "-";
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
    const $cancelFormButton = $('#button-cancel-form');
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
        if (settings.ogolne.powiadomienia_email === "on") {
            $emailCheckbox[0].checked = true;
            $emailInput.show();
            $emailInput[0].value = settings.ogolne.adres_email;
        }
        $saveFormButton.on('click', () => {
            const generalFormData = JSON.stringify($generalForm.serializeArray());
            const promisesList = [];
            promisesList.push(updateSettings(generalFormData));
            $($nameSection).find('form').each((index, element) => {
                const data = $(element).serializeArray().reduce((a, x) => {
                    a[x.name] = x.value;
                    return a;
                }, {});
                data["id_kamery"] = $(element)[0].name;
                promisesList.push(updateNames(JSON.stringify(data)));
            });
            $($prefsSection).find('form').each((index, element) => {
                const data = $(element).serializeArray().reduce((a, x) => {
                    a[x.name] = x.value;
                    return a;
                }, {});
                data["id_kamery"] = $(element)[0].name;
                promisesList.push(updatePrefs(JSON.stringify(data)));
            });
            Promise.all(promisesList).then(() => {
                UIkit.notification({
                    message: 'Ustawienia zaktualizowane',
                    status: 'success'
                })
            }, async () => {
                UIkit.notification({
                    message: 'Błąd aktualizacji ustawień',
                    status: 'danger'
                });
                $nameSection.find('form').remove();
                $prefsSection.find('form').remove();
                initSettingsModal(await getData());
            })
        });
        $cancelFormButton.on('click', async () => {
            $nameSection.find('form').remove();
            $prefsSection.find('form').remove();
            initSettingsModal(await getData());
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
            name: deviceData.id_kamery
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
        const result = await getData();
        const data = Object.values(result);
        for (let i = 0; i < result.length; i++) {
            const card = $(`#${result[i].id_kamery}`);
            const img = card.find("img");
            img.attr('src', 'img/' + data[i].nazwa);
            const text = card.find("p");
            const temp = data[i].temperatura ? parseFloat(data[i].temperatura).toFixed(1).toLocaleString('pl-PL') : "-";
            const rh = data[i].rh ? parseInt(data[i].rh) : "-";
            const state = data[i].stan == '1' ? "Zamknięty" : "Otwarty";
            text.html("Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" + "</br>" + data[i].nazwa_czujnika + ": " + state);
        }
    } catch (e) {
        console.log(e.responseText);
    }
}

async function displayArchive() {
    const $loadingOverlay = $('#loading-overlay');
    $loadingOverlay.show();
    try {
        const result = await getAllData();
        const content = $('#content');
        content.empty();
        content.attr({
            class: "uk-flex-column"
        });
        const data = Object.values(result);
        const $tabNav = $(document.createElement("ul"))
            .attr({
                "uk-tab": ""
            })
            .appendTo(content);
        const $switcherContainer = $(document.createElement("ul"))
            .attr({
                class: "uk-switcher"
            })
            .appendTo(content);
        for (let i = 0; i < data.length; i++) {
            $(document.createElement("li"))
                .append($(document.createElement("a"))
                    .attr({
                        "href": "grid-photo" + i
                    })
                    .text(data[i].nazwa_kamery))
                .appendTo($tabNav);
            const switcherElement = $(document.createElement("li"))
                .appendTo($switcherContainer);
            const grid = $(document.createElement("div"))
                .attr({
                    id: "grid-photo" + i,
                    class: "uk-padding-large uk-child-width-1-2@s uk-child-width-1-3@m uk-child-width-1-4@l uk-child-width-1-5@xl",
                    "uk-grid": "",
                    "uk-lightbox": "animation: slide"
                })
                .appendTo(switcherElement);
            data[i].zdjecia = Object.values(data[i].zdjecia);
            for (let j = data[i].zdjecia.length - 1; j >= 0; j--) {
                const albumElement = $(document.createElement("div"))
                    .appendTo($("#grid-photo" + i));
                const photoLink = $(document.createElement("a"))
                    .attr({
                        href: "img/" + data[i].zdjecia[j].nazwa,
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
                        src: "img/" + data[i].zdjecia[j].nazwa
                    })
                    .appendTo(card);
                const date = data[i].zdjecia[j].data;
                const temp = data[i].zdjecia[j].temperatura ? parseFloat(data[i].zdjecia[j].temperatura).toFixed(1).toLocaleString('pl-PL') : "-";
                const rh = data[i].zdjecia[j].rh ? parseInt(data[i].zdjecia[j].rh) : "-";
                const state = data[i].zdjecia[j].stan === '1' ? "Zamknięty" : "Otwarty";
                $(document.createElement("p"))
                    .html(date + "</br>Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" + "</br>" + data[i].zdjecia[j].nazwa_czujnika + ": " + state)
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
