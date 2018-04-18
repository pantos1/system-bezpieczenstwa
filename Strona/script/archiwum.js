$.ajax({
    url: "get_data.php?q=archiwum",
    type: "GET",
    contentType: "text/plain",
    success: function(result) {
		result = Object.values(JSON.parse(result));
        console.log(result);
        console.log(result.length);
        // for (i=0; i<result.length; i++) {
        //     var card = $(document.createElement("div"))
        //         .attr({
        //             class: "uk-card uk-card-default uk-card-body"
        //         })
        //         .appendTo($("#grid-photo"));
        //     $(document.createElement("h3"))
        //         .attr({
        //             class: "uk-card-title"
        //         })
        //         .text(result[i].nazwa_kamery)
        //         .appendTo(card);
        //     $(document.createElement("img"))
        //         .attr({
        //             src: "img/" + result[i].nazwa
        //         })
        //         .appendTo(card);
        //     var temp = parseFloat(result[i].temperatura).toFixed(1);
        //     var rh = parseInt(result[i].rh);
        //     var stan = result[i].stan == '1' ? "Zamknięty" : "Otwarty";
        //     $(document.createElement("p"))
        //         .html("Temperatura: " + temp + "C" + "</br>Wilgotność względna: " + rh + "%" +"</br>" + result[i].opis + ": " + stan)
        //         .appendTo(card);
        //
        // }
    }
});