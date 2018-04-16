$.ajax({
    url: "get_data.php?q=",
    type: "GET",
    success: function(result) {
        console.log(result)
    }
});