$.ajax({
    url: "get_data.php?q=",
    type: "GET",
    success: function(result) {
        console.log(result);
        for (i=0; i<result.length(); i++) {
            var card = $(document.createElement("div"))
                .attr({
                    class: "uk-card uk-card-default uk-card-body"
                })
                .appendTo($("#grid-photo"));
            $(document.createElement("h3"))
                .attr({
                    class: "uk-card-title"
                })
                .text(result[i].nazwa)
                .appendTo(card);
            $(document.createElement("img"))
                .attr({
                    src: result[i].nazwa
                })
                .appendTo(card);
            var temp = parseFloat(result[i].temperatura).toFixed(1);
            var rh = parseInt(result[i].rh);
            var stan = result[i].stan == '1' ? "Zamknięty" : "Otwarty";
            $(document.createElement("p"))
                .text("Temperatura: " + temp  + "</br>Wilgotność względna: " + rh + "</br>" + result[i].opis + ": " + stan)
                .appendTo(card);

        }
    }
});