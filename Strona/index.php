<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>System bezpieczeństwa</title>
    <link rel="stylesheet" type="text/css" href="style/style.css">
  </head>
  <body>
    <div class = "kontener">
      <header>
        <nav class = "pasek-nawigacyjny">
          <a href = "#" class ="link">Zapisz</a>
          <a href = "#" class ="link">Archiwum</a>
          <a href = "#" class ="link">Ustawienia</a>
          <a href = "#" class ="link">Wyloguj</a>
        </nav>
      </header>

      <section>
        <div class = "data">
          <?php
            $servername = "localhost";
            $username = "root";
            $password = "raspberry";
            $db = "Nadzor";
            echo date("d.m.Y H:i:s");
	    echo '<br>';
            try {
                $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password);
                $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $stmt  = $conn->query("SELECT nazwa, stan, temperatura, rh
                  FROM Pomiary NATURAL JOIN Zdjecia NATURAL JOIN Stany
                  WHERE Pomiary.id_pomiaru =
                  (SELECT MAX(id_pomiaru) FROM Pomiary)");
                 while($result = $stmt -> fetch()){
                  echo 'Temperatura: '.round($result['temperatura'],1).'&deg;C'.'<br>';
                  echo 'Wilgotność względna: '.round($result['rh']).'%';
                  echo '</div>';
                  echo '<div class = "zdjecia">';
                  echo '<img src = "img/'.$result['nazwa'].'.jpg" alt = "Zdjecie z kamery" />';
                  echo '<div class = "pasek-czujnikow">';
                  echo '<p>Czujnik 1: ';
                  if ($result['stan'] == 1){
                    echo 'Zamknięty</p>';
                  }
                  else {
                    echo 'Otwarty</p>';
                  }
                 }
                 $stmt -> closeCursor();
               }
            catch(PDOException $e)
               {
               echo "Connection failed: " . $e->getMessage();
               }

            ?>
         </div>
       </section>
     </div>

  </body>
</html>
