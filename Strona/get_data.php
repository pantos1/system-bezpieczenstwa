<?php
header("Content-Type: application/json");
$servername = "localhost";
$username = "root";
$password = "raspberry";
$db = "nadzor";
$q = $_GET['q'];
try {
    $rows = array();
    $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $kamery_query = $conn->query("SELECT * FROM kamery NATURAL JOIN czujniki NATURAL JOIN czujniki_temperatury");
    while ($kamera = $kamery_query->fetch(PDO::FETCH_ASSOC)) {
        $id_kamery = $kamera["id_kamery"];
        if (empty($q)) {
            $stmt = $conn->query("
                SELECT * FROM pomiary NATURAL JOIN zdjecia NATURAL JOIN odczyty NATURAL JOIN stany
                WHERE id_pomiaru = (
                    SELECT id_pomiaru FROM 
                    pomiary  WHERE id_zdjecia = (
                        SELECT id_zdjecia FROM zdjecia WHERE id_kamery = $id_kamery ORDER BY id_zdjecia DESC LIMIT 1
                    )
                    ORDER BY pomiary.id_pomiaru DESC LIMIT 1
                )
                ");
            while ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $rows[$id_kamery] = $result;
                $rows[$id_kamery]["nazwa_kamery"] = $kamera["nazwa_kamery"];
                $rows[$id_kamery]["nazwa_czujnika"] = $kamera["nazwa_czujnika"];
                $rows[$id_kamery]["nazwa_czujnika_temp"] = $kamera["nazwa_czujnika_temp"];
                $rows[$id_kamery]["czestotliwosc_zdjecia"] = $kamera["czestotliwosc_zdjecia"];
                $rows[$id_kamery]["czestotliwosc_odczytu_stanu"] = $kamera["czestotliwosc_odczytu_stanu"];
                $rows[$id_kamery]["czestotliwosc_pomiaru_temp"] = $kamera["czestotliwosc_pomiaru_temp"];
            }
            $stmt->closeCursor();
        } elseif ($q == 'archiwum') {
            $stmt = $conn->query("SELECT *
					FROM zdjecia NATURAL JOIN pomiary NATURAL JOIN stany NATURAL JOIN odczyty
					WHERE zdjecia.id_kamery = $id_kamery");
            while ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $rows[$id_kamery]["nazwa_kamery"] = $kamera["nazwa_kamery"];
                $rows[$id_kamery]["zdjecia"][$result["id_zdjecia"]] = $result;
                $rows[$id_kamery]["zdjecia"][$result["id_zdjecia"]] ["nazwa_czujnika"] = $kamera["nazwa_czujnika"];
            }
            $stmt->closeCursor();
        }
    }
    echo json_encode($rows);
    $kamery_query->closeCursor();
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

?>
