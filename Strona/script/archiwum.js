$.ajax({
    url: "get_data.php?q=archiwum",
    type: "GET",
    contentType: "text/plain",
    success: function(result) {
		console.log(result);
		result = Object.values(result);
        for (i=0; i<result.length; i++) {
            var grid = $(document.createElement("div"))
                .attr({
					id: "grid-photo"+i,
                    class: "uk-padding-large uk-child-width-1-2@s uk-child-width-1-3@m uk-child-width-1-4@l uk-child-width-1-5@xl",
                    "uk-grid": "",
                    "uk-lightbox": "animation: slide"
                })
                .appendTo($("#content"));
            $(document.createElement("div"))
                .attr({
                    class: "uk-h3 uk-overlay uk-position-large uk-position-top-left"
                })
                .text(result[i].nazwa_kamery)
                .appendTo(grid);
			console.log(result[i]);
			result[i].zdjecia = Object.values(result[i].zdjecia);
            for (j = result[i].zdjecia.length-1; j >= 0 ; j--) {
                var albumElement = $(document.createElement("div"))
                    .appendTo($("#grid-photo"+i));
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
