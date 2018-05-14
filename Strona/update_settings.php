<?php
$servername = "localhost";
$username = "root";
$password = "raspberry";
$db = "nadzor";
$klucz = $_POST["klucz"];
$wartosc = $_POST["wartosc"];
try {
    $rows = array();
    $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $sql = "UPDATE ustawienia 
      SET wartosc = $wartosc
      WHERE klucz = $klucz";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->closeCursor();
    echo json_encode($result);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}