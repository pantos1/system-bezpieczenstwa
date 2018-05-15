<?php
$servername = "localhost";
$username = "root";
$password = "raspberry";
$db = "nadzor";
$input = json_decode(file_get_contents('php://input'));
echo $input->id_kamery;
try {
    $rows = array();
    $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $sql = "
      UPDATE 
      kamery NATURAL JOIN czujniki NATURAL JOIN czujniki_temperatury 
      SET 
      kamery.czestotliwosc_zdjecia = '$input->czestotliwosc_zdjecia', 
      czujniki.czestotliwosc_odczytu_stanu = '$input->czestotliwosc_odczytu_stanu',
      czujniki_temperatury.czestotliwosc_pomiaru_temp = '$input->czestotliwosc_pomiaru_temp'
      WHERE 
      id_kamery = '$input->id_kamery'
      ";
    //echo $sql;  
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $stmt->closeCursor();
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
