<?php
$servername = "localhost";
$username = "root";
$password = "raspberry";
$db = "nadzor";
$id_kamery = (int)$_POST['id_kamery'];
$czestotliwosc_zdjecia = (float)$_POST['czestotliwosc_zdjecia'];
$czestotliwosc_pomiaru_temp = (float)$_POST['czestotliwosc_pomiaru_temp'];
$czestotliwosc_odczytu_stanu = (float)$_POST['czestotliwosc_odczytu_stanu'];
try {
    $rows = array();
    $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $sql = "UPDATE kamery NATURAL JOIN czujniki NATURAL JOIN czujniki_temperatury 
      SET kamery.czestotliwosc_zdjecia = $czestotliwosc_zdjecia, czujniki.czestotliwosc_odczytu_stanu = $czestotliwosc_odczytu_stanu, czujniki_temperatury.czestotliwosc_pomiaru_temp = $czestotliwosc_pomiaru_temp
      WHERE id_kamery = $id_kamery";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $stmt->closeCursor();
    echo json_encode($result);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
