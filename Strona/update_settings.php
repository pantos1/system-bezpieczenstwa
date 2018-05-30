<?php
$servername = "localhost";
$username = "root";
$password = "raspberry";
$db = "nadzor";
$input = json_decode(file_get_contents('php://input'));
try {
    $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    foreach ($input as $object) {
		$wartosc = $object->value;
		$klucz = $object->name;
		$sql = "UPDATE ustawienia 
		  SET wartosc=:wartosc
		  WHERE :klucz";
		$stmt = $conn->prepare($sql);
		$stmt->execute(array(":wartosc" => $wartosc, ":klucz" => $klucz));
		$stmt->closeCursor();
	}
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
