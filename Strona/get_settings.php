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
        $ustawienia_query = $conn -> query("SELECT klucz, wartosc FROM ustawienia");
        while($row = $ustawienia_query -> fetch(PDO::FETCH_ASSOC)) {
            $rows["ogolne"][$row["klucz"]] = $row["wartosc"];
        }
        $ustawienia_query -> closeCursor();
        echo json_encode($rows);
    } catch (PDOException $e) {
        echo "Connection failed: " . $e->getMessage();
    }
?>