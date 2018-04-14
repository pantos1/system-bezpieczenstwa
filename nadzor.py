import RPi.GPIO as GPIO
import smbus
from datetime import datetime
import subprocess
import time
import schedule
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from baza import Base, Kamery, Zdjecia, Czujniki_temperatury, Odczyty, Czujniki, Stany, Pomiary, get_or_create, fetch_all

class Grupa():
    # sciezka do zapisu zdjec
    sciezka = "/var/www/html/img/"
    bus = smbus.SMBus(1)
    adres = 0x40
    rhKod = 0xF5
    tempKod = 0xF3

    def __init__(self, kamera, czujnik_temp, czujnik, session):
        self.kamera = kamera
        self.czujnik_temp = czujnik_temp
        self.czujnik = czujnik
        self.session = session
        self.stan_czujnika = 0
        self.stan_poprzedni = 0
        GPIO.setup(self.czujnik.gpio, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    def zrob_zdjecie(self):
        data = datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
        nazwa = Grupa.sciezka + data +".jpg"
        subprocess.call(["fswebcam", "-r 640x480", nazwa])
        zdjecie = {
            "id_kamery": self.kamera.id_kamery,
            "nazwa": nazwa
        }
        self.zdjecie_instance = get_or_create(self.session, Zdjecia, **zdjecie)

    def pomiar_temperatury_rh(self):
        Grupa.bus.write_byte(Grupa.adres, Grupa.rhKod)
        time.sleep(0.05)
        data0 = Grupa.bus.read_byte(Grupa.adres)
        data1 = Grupa.bus.read_byte(Grupa.adres)
        rh = ((data0 * 256 + data1)* 125 / 65536.0) -6

        time.sleep(0.05)
        Grupa.bus.write_byte(Grupa.adres, Grupa.tempKod)
        time.sleep(0.05)
        data0 = Grupa.bus.read_byte(Grupa.adres)
        data1 = Grupa.bus.read_byte(Grupa.adres)
        temp = ((data0 * 256 + data1) * 175.72 / 65536.0) - 46.85

        odczyt = {
            "id_czujnika_temp": self.czujnik_temp["id_czujnika_temp"],
            "temperatura": temp,
            "rh": rh
        }

        self.odczyt_instance = get_or_create(self.session, Odczyty, **odczyt)

    def sprawdz_kontaktron(self):
        if GPIO.input(self.czujnik["gpio"]):
            self.stan_czujnika = 0
            if self.stan_poprzedni == 1:
                for i in range(0, 2):
                    self.zrob_zdjecie()
        else:
            self.stan_czujnika = 1
        stan = {
            "id_czujnika": self.czujnik["id_czujnika"],
            "stan": self.stan_czujnika
        }
        self.stan_instance = get_or_create(self.session, Stany, **stan)
        pomiar = {
            "id_stanu": self.stan_instance["id_stanu"],
            "id_odczytu": self.odczyt_instance["id_odczytu"],
            "id_zdjecia ": self.zdjecie_instance["id_zdjecia"]
        }
        self.pomiar_instance = get_or_create(self.session, Pomiary, **pomiar)
        self.stan_poprzedni = self.stan_czujnika

def init_gpio():
    GPIO.setmode(GPIO.BCM)

def init_session(config):
    db = create_engine(
        "mysql+mysqldb://" + config['user'] + ":" + config['passwd'] + "@" + config['host'] + "/" + config['db'],
        echo=True)

    DBSession = sessionmaker(bind=db)
    session = DBSession()
    return session


def main():
    # konfiguracja do polaczenia z baza danych
    config = {
        'host': 'localhost',
        'user': 'root',
        'passwd': 'raspberry',
        'db': 'Nadzor'
    }
    init_gpio()
    session = init_session(config)
    kamery = fetch_all(session, Kamery)
    czujniki = fetch_all(session, Czujniki)
    czujniki_temperatury = fetch_all(session, Czujniki_temperatury)
    grupy = []
    for kamera, czujnik_temp, czujnik in zip(kamery.all(), czujniki_temperatury.all(), czujniki.all()):
        grupa = Grupa(kamera=kamera, czujnik_temp=czujnik_temp, czujnik=czujnik, session=session)
        grupy.append(grupa)
        schedule.every(10).seconds.do(grupa.zrob_zdjecie())
        schedule.every(10).seconds.do(grupa.pomiar_temperatury_rh())
        schedule.every(0.1).seconds.do(grupa.sprawdz_kontaktron())
        grupa.zrob_zdjecie()
        grupa.pomiar_temperatury_rh()
    while True:
        schedule.run_pending()

if __name__ == "__main__":
    main()