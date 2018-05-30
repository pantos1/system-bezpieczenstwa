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
    $sql = "
      UPDATE 
      kamery NATURAL JOIN czujniki NATURAL JOIN czujniki_temperatury 
      SET 
      kamery.czestotliwosc_zdjecia = :czestotliwosc_zdjecia, 
      czujniki.czestotliwosc_odczytu_stanu = :czestotliwosc_odczytu_stanu,
      czujniki_temperatury.czestotliwosc_pomiaru_temp = :czestotliwosc_pomiaru_temp
      WHERE 
      id_kamery = :id_kamery
      ";
    $stmt = $conn->prepare($sql);
    $stmt->execute(array(":czestotliwosc_zdjecia" => $input->czestotliwosc_zdjecia,
        ":czestotliwosc_odczytu_stanu" => $input->czestotliwosc_odczytu_stanu,
        ":czestotliwosc_pomiaru_temp" => $input->czestotliwosc_pomiaru_temp,
        ":id_kamery" => $input->id_kamery
    ));
    $stmt->closeCursor();
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
