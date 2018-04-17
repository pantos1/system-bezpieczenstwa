<?php
	$servername = "localhost";
    $username = "root";
    $password = "raspberry";
    $db = "nadzor";
    $q = $_GET['q'];
    try {
		$rows = array();
        $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$kamery_zapytanie = $conn->query("SELECT * FROM kamery");
		while($kamera = $kamery_zapytanie->fetch()){
			$stmt  = $conn->query("SELECT *
				FROM pomiary NATURAL JOIN zdjecia NATURAL JOIN stany NATURAL JOIN odczyty
				WHERE pomiary.id_pomiaru =
				(SELECT MAX(id_pomiaru) FROM pomiary)
				AND zdjecia.id_kamery = $kamera.id_kamery");
			while($result = $stmt -> fetch()){
				$rows[$kamera.id_kamery] = $result;
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
