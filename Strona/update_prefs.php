<?php
$servername = "localhost";
$username = "root";
$password = "raspberry";
$db = "nadzor";
$id_kamery = $_POST['id_kamery'];
$nazwa_kamery = $_POST['nazwa_kamery'];
$nazwa_czujnika = $_POST['nazwa_czujnika'];
$nazwa_czujnika_temp = $_POST['nazwa_czujnika_temp'];
$czestotliwosc_zdjecia = $_POST['czestotliwosc_zdjecia'];
$czestotliwosc_pomiaru_temp = $_POST['czestotliwosc_pomiaru_temp'];
$czestotliwosc_odczytu_stanu = $_POST['czestotliwosc_odczytu_stanu'];
try {
    $rows = array();
    $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $sql = "UPDATE kamery NATURAL JOIN czujniki NATURAL JOIN czujniki_temperatury 
      SET kamery.czestotliwosc_zdjecia = $czestotliwosc_zdjecia, czujniki.czestotliwosc_odczytu_stanu = $czestotliwosc_odczytu_stanu, czujniki_temperatury.czestotliwosc_pomiaru_temp = $czestotliwosc_pomiaru_temp
      WHERE id_kamery = $id_kamery";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetch();
    $id_czujnika = $result["id_czujnika"];
    $id_czujnika_temp = $result["id_czujnika_temp"];
    if ($nazwa_kamery !== "") {
        $sql = 'UPDATE kamery SET nazwa_kamery = $nazwa_kamery WHERE id_kamery = $id_kamery';
        $stmt = $conn->prepare($sql);
        $stmt->execute();
    }
    if ($nazwa_czujnika !== "") {
        $sql = 'UPDATE czujniki SET nazwa_czujnika = $nazwa_czujnika WHERE id_czujnika = $id_czujnika';
        $stmt = $conn->prepare($sql);
        $stmt->execute();
    }
    if ($nazwa_czujnika_temp !== "") {
        $sql = 'UPDATE czujniki_temperatury SET nazwa_czujnika_temp = $nazwa_czujnika WHERE id_czujnika_temp = $id_czujnika_temp';
        $stmt = $conn->prepare($sql);
        $stmt->execute();
    }
    $stmt->closeCursor();
    echo json_encode($result);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}