<?php
	header("Content-Type: application/octet-stream");
	$servername = "localhost";
    $username = "root";
    $password = "raspberry";
    $db = "nadzor";
    $startDate = $_GET['start'];
	$endDate = $_GET['end'];
    try {
		$rows = array();
        $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$kamery_zapytanie = $conn->query("SELECT * FROM kamery NATURAL JOIN czujniki NATURAL JOIN czujniki_temperatury");
		while($kamera = $kamery_zapytanie->fetch()){
			$id_kamery = $kamera["id_kamery"];
			if(empty($q)){
				$stmt  = $conn->query("SELECT *
					FROM pomiary NATURAL JOIN zdjecia NATURAL JOIN stany NATURAL JOIN odczyty
					WHERE pomiary.id_pomiaru =
					(SELECT MAX(id_pomiaru) FROM pomiary)
					AND zdjecia.id_kamery = $id_kamery");
				while($result = $stmt -> fetch()){
					$rows[$id_kamery] = $result;
					$rows[$id_kamery]["nazwa_kamery"] = $kamera["nazwa_kamery"];
					$rows[$id_kamery]["nazwa_czujnika"] = $kamera["nazwa_czujnika"];
				}
			} elseif($q == 'archiwum'){
				$stmt  = $conn->query("SELECT *
					FROM zdjecia NATURAL JOIN pomiary NATURAL JOIN stany NATURAL JOIN odczyty
					WHERE zdjecia.id_kamery = $id_kamery");
				while($result = $stmt -> fetch()){
					$rows[$id_kamery]["nazwa_kamery"] = $kamera["nazwa_kamery"];
					$rows[$id_kamery]["zdjecia"][$result["id_zdjecia"]] = $result;
					$rows[$id_kamery]["zdjecia"][$result["id_zdjecia"]] ["nazwa_czujnika"] = $kamera["nazwa_czujnika"];
				}
			}	
		}
        echo json_encode($rows);
        $stmt -> closeCursor();
    }
    catch(PDOException $e)
    {
		echo "Connection failed: " . $e->getMessage();
    }

?>