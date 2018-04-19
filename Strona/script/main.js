getData();

function getData(){
	$.ajax({
		url: "get_data.php?q=",
		type: "GET",
		contentType: "text/plain",
		success: function(result) {
			result = Object.values(result);
			for (i=0; i<result.length; i++) {
				var card = $(document.createElement("div"))
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
				var temp = parseFloat(result[i].temperatura).toFixed(1);
				var rh = parseInt(result[i].rh);
				var stan = result[i].stan == '1' ? "Zamknięty" : "Otwarty";
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
			for (i=0; i<result.length; i++) {
				var card = $(`#${result[i].id_kamery}`);
				var img = card.find("img");
				img.attr('src', 'img/' + result[i].nazwa);
				var text = card.find("p");
				var temp = parseFloat(result[i].temperatura).toFixed(1);
				var rh = parseInt(result[i].rh);
				var stan = result[i].stan == '1' ? "Zamknięty" : "Otwarty";
				text.html("Temperatura: " + temp + "&degC" + "</br>Wilgotność względna: " + rh + "%" +"</br>" + result[i].nazwa_czujnika + ": " + stan);
			}
		}
	})
}

var getTimer = setInterval(refreshData, 8000);
