<?php
$servername = "localhost";
$username = "root";
$password = "raspberry";
$db = "nadzor";
$input = json_decode(file_get_contents('php://input'));
try {
    $rows = array();
    $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $sql = "SELECT * FROM kamery NATURAL JOIN czujniki NATURAL JOIN czujniki_temperatury 
      WHERE id_kamery = '$input->id_kamery'";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $id_czujnika = $result["id_czujnika"];
    $id_czujnika_temp = $result["id_czujnika_temp"];
    if ($input->nazwa_kamery !== "") {
        $sql = "UPDATE kamery SET nazwa_kamery = '$input->nazwa_kamery' WHERE id_kamery = '$id_kamery'";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
    }
    if ($input->nazwa_czujnika !== "") {
        $sql = "UPDATE czujniki SET nazwa_czujnika = '$input->nazwa_czujnika' WHERE id_czujnika = '$id_czujnika'";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
    }
    if ($input->nazwa_czujnika_temp !== "") {
        $sql = "UPDATE czujniki_temperatury SET nazwa_czujnika_temp = '$input->nazwa_czujnika_temp' WHERE id_czujnika_temp = '$id_czujnika_temp'";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
    }
    $stmt->closeCursor();
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
