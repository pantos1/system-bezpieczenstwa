<?php
    header("Content-Type: application/json");
    $servername = "localhost";
    $username = "root";
    $password = "raspberry";
    $db = "nadzor";
    try {
        $rows = array();
        $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $ustawienia_query = $conn -> query("SELECT * FROM ustawienia");
        while($row = $ustawienia_query -> fetch(PDO::FETCH_ASSOC)) {
            $rows[$row["nazwa"]] = $row["wartosc"];
        }
        echo json_encode($rows);
        $ustawienia_query -> closeCursor();
    } catch (PDOException $e) {
        echo "Connection failed: " . $e->getMessage();
    }
?>