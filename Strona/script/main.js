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
  $('#archive').on('click', (event) => {
    console.log(event);
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
    const state = data[i].stan == '1' ? "Zamknięty" : "Otwarty";
    $(document.createElement("p"))
      .html("Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" + "</br>" + data[i].nazwa_czujnika + ": " + state)
      .appendTo(card);

  }
}

function initSettingsModal(result) {
 const $modalBody = $('#settings-modal-body');


}

async function refreshData() {
  try{
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
  try{
    const data = await getAllData();
    const content = $('#content');
    content.empty();
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
      for (j = result[i].zdjecia.length - 1; j >= 0; j--) {
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
  var endPicker = new Pikaday({
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
  var startPicker = new Pikaday({
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
  $("#save-dates").on("click", function (event) {
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
