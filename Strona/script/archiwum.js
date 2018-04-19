$.ajax({
    url: "get_data.php?q=archiwum",
    type: "GET",
    contentType: "text/plain",
    success: function(result) {
		console.log(result);
		result = Object.values(result);
        for (i=0; i<result.length; i++) {
            var kameraName = $(document.createElement("div"))
                .attr({
                    class: "uk-h3"
                })
                .text(result[i]);
			result[i] = Object.values(result[i]);
            for (j = 0; j < result[i].length; j++) {
                var card = $(document.createElement("div"))
                    .attr({
                        class: "uk-card uk-card-default uk-card-body"
                    })
                    .appendTo($("#grid-photo"));
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
