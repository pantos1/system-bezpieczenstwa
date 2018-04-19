$.ajax({
    url: "get_data.php?q=archiwum",
    type: "GET",
    contentType: "text/plain",
    success: function(result) {
		console.log(result);
		result = Object.values(result);
        for (i=0; i<result.length; i++) {
            var grid = $(document.createElement("div"))
                .id("grid-photo"+i)
                .attr({
                    class: "uk-padding-large uk-child-width-1-2@s uk-child-width-1-3@m uk-child-width-1-4@l uk-child-width-1-5@xl",
                    "uk-grid": "",
                    "uk-lightbox": "animation: slide"
                })
                .appendTo($("#content"));
            $(document.createElement("div"))
                .attr({
                    class: "uk-h3"
                })
                .text(result[i])
                .appendTo(grid);
			result[i] = Object.values(result[i]);
            for (j = 0; j < result[i].length; j++) {
                var albumElement = $(document.createElement("div"))
                    .appendTo($("#grid-photo"));
                var photoLink = $(document.createElement("a"))
                    .attr({
                        href: "img/" + result[i][j].nazwa,
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
                        src: "img/" + result[i][j].nazwa
                    })
                    .appendTo(card);
                var temp = parseFloat(result[i][j].temperatura).toFixed(1);
                var rh = parseInt(result[i][j].rh);
                var stan = result[i][j].stan === '1' ? "Zamknięty" : "Otwarty";
                $(document.createElement("p"))
                    .html("Temperatura: " + temp + "C" + "</br>Wilgotność względna: " + rh + "%" + "</br>" + result[i][j].nazwa_czujnika + ": " + stan)
                    .appendTo(card);

            }
        }
    }
});
