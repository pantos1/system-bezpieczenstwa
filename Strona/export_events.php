<?php
header("Content-Description: File Transfer");
header("Content-Type: application/octet-stream");
$servername = "localhost";
$username = "root";
$password = "raspberry";
$db = "nadzor";
$start_argument = $_GET['start'];
$end_argument = $_GET['end'];
try {
    $log = array();
    $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $conn->query("SELECT data FROM pomiary ORDER BY data ASC LIMIT 1");
    while ($result = $stmt->fetch()) {
        $first_date = $result["data"];
    }
    $stmt = $conn->query("SELECT data FROM pomiary ORDER BY data DESC LIMIT 1");
    while ($result = $stmt->fetch()) {
        $last_date = $result["data"];
    }
    if ($start_argument != "" && $end_argument != "") {
        $first_date = $start_argument;
        $last_date = $end_argument;
    } elseif ($start_argument == "" && $end_argument != "") {
        $last_date = $end_argument;
    } elseif ($start_argument != "" && $end_argument == "") {
        $first_date = $start_argument;
    }
    $filename = $first_date . "-" . $last_date . ".csv";
    $path = "logs/" . $filename;
    if (!file_exists($path)) {
        $filestream = fopen($path, 'w');
        $sql = "
              SELECT *
			  FROM pomiary 
			  NATURAL JOIN zdjecia NATURAL JOIN kamery
              NATURAL JOIN stany NATURAL JOIN czujniki
              NATURAL JOIN odczyty NATURAL JOIN czujniki_temperatury
              WHERE data BETWEEN '$first_date' AND '$last_date'
              ";
        $stmt = $conn->prepare($sql);
        $rows = array();
        $headers_present = false;
        if($stmt->execute()){
			while($result = $stmt -> fetch(PDO::FETCH_ASSOC)) {
				if(!$headers_present) {
					fputcsv($filestream, array_keys($result));
					$headers_present = true;
				}	
				fputcsv($filestream, array_values($result));
			}
			$stmt->closeCursor();
			fclose($filestream);
		}
    }
    header('Content-Disposition: attachment; filename="'.basename($filename).'"');
    header('Content-Length: ' . filesize($path));
    readfile($path);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

?>
