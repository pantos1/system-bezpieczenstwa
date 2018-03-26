import RPi.GPIO as GPIO
import smbus
from datetime import datetime
import subprocess
import time
import schedule
import MySQLdb
#konfiguracja GPIO do odczytywania stanu czujnika na GPIO23
GPIO.setmode(GPIO.BCM)
GPIO.setup(23, GPIO.IN, pull_up_down = GPIO.PUD_UP)
#deklaracja zmiennych globalnych
stan_poprzedni = 0
stan_czujnika = 0
bus = smbus.SMBus(1)
adres = 0x40
rhKod = 0xF5
tempKod = 0xF3
#sciezka do zapisu zdjec
sciezka = "/var/www/html/img/"
temp = 0
rh = 0
data = 0
id_zdjecia = 0
id_stanu = 0
#konfiguracja do polaczenia z baza danych
config ={
    'host': 'localhost',
    'user': 'root',
    'passwd': 'raspberry',
    'db': 'Nadzor'
    }
#nawiazanie polaczenia z baza danych
conn = MySQLdb.connect(**config)
cursor = conn.cursor()

def kamery():
    global data, sciezka, cursor, conn, id_zdjecia
    data = datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
    subprocess.call(["fswebcam", "-r 640x480", sciezka + data +".jpg"])
    cursor.execute("""INSERT INTO Zdjecia (nazwa, id_kamery) VALUES (%s, %s)""",
                   (data, 1))
    id_zdjecia = cursor.lastrowid
    conn.commit()

def czujnik_i2c():
    global temp, rh, bus, adres, rhKod, tempKod
    bus.write_byte(adres, rhKod)
    time.sleep(0.05)
    data0 = bus.read_byte(adres)
    data1 = bus.read_byte(adres)
    rh = ((data0 * 256 + data1)* 125 / 65536.0) -6

    time.sleep(0.05)
    bus.write_byte(adres, tempKod)
    time.sleep(0.05)
    data0 = bus.read_byte(adres)
    data1 = bus.read_byte(adres)
    temp = ((data0 * 256 + data1) * 175.72 / 65536.0) - 46.85

def czujniki():
    global stan_czujnika, temp, rh, data, sciezka, cursor, conn, id_zdjecia, id_stanu
    if GPIO.input(23):
        stan_czujnika = 0
        if stan_poprzedni == 1:
            for i in range(0, 2):
				start_time = time.time()
                data = datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
                subprocess.call(["fswebcam", "-r 640x480", sciezka + data +".jpg"])
                cursor.execute("""INSERT INTO Zdjecia (nazwa, id_kamery) VALUES (%s, %s)""",
                   (data, 1))
                id_zdjecia = cursor.lastrowid
                conn.commit()
				print("1 wywolanie fswebcam: %s sekund" %(time.time() - start_time))
    else:
        stan_czujnika = 1
    global stan_poprzedni
    cursor.execute("""INSERT INTO Stany (stan, id_czujnika) VALUES (%s, %s)""",
                   (stan_czujnika, 1))
    id_stanu = cursor.lastrowid
    cursor.execute("""INSERT INTO Pomiary (data, temperatura, rh, id_zdjecia, id_stanu) VALUES (%s, %s, %s, %s, %s)""",
                   (data, temp, rh, id_zdjecia, id_stanu))
    conn.commit()
    stan_poprzedni = stan_czujnika
    
schedule.every(10).seconds.do(kamery)
schedule.every(10).seconds.do(czujnik_i2c)
schedule.every(0.1).seconds.do(czujniki)

kamery()
czujnik_i2c()
while True:
    schedule.run_pending()
        
        
