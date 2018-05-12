import RPi.GPIO as GPIO
import pigpio
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
    i2c = pigpio.pi()
    multiplexer_adres = 0x70
    czujnik_temp_adres = 0x40
    rhKod = 0xF5
    tempKod = 0xE0

    def __init__(self, kamera, czujnik_temp, czujnik, session):
        self.kamera = kamera
        self.czujnik_temp = czujnik_temp
        self.czujnik = czujnik
        self.session = session
        self.stan_czujnika = 0
        self.stan_poprzedni = 0
        self.czujnik.gpio = int(self.czujnik.gpio)
        #self.czujnik_kanal_komenda = 1 << int(self.czujnik_temp.kanal_mux)
        print(self.czujnik_temp.kanal_mux)
        self.czujnik_kanal_komenda = self.kanal(int(self.czujnik_temp.kanal_mux))
        GPIO.setup(self.czujnik.gpio, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    def kanal(self, kanal):
        if   (kanal==0): komenda = 0x04
        elif (kanal==1): komenda = 0x05
        elif (kanal==2): komenda = 0x06
        elif (kanal==3): komenda = 0x07
        else: komenda = 0x00
        return komenda
        
    def zrob_zdjecie(self):
        data = datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
        nazwa = data + ".jpg"
        sciezka = Grupa.sciezka + nazwa
        subprocess.call(["fswebcam", "-r 640x480", sciezka])
        zdjecie = {
            "id_kamery": self.kamera.id_kamery,
            "nazwa": nazwa
        }
        self.zdjecie_instance = get_or_create(self.session, Zdjecia, **zdjecie)

    def pomiar_temperatury_rh(self):
        mux = Grupa.i2c.i2c_open(1, Grupa.multiplexer_adres)
    
        Grupa.i2c.i2c_write_byte(mux, self.czujnik_kanal_komenda)
     
        czujnik = Grupa.i2c.i2c_open(1, Grupa.czujnik_temp_adres)
        Grupa.i2c.i2c_write_byte(czujnik, self.rhKod)
        time.sleep(0.05)
        (liczba_bitow, data) = Grupa.i2c.i2c_read_device(czujnik, 2)
        print(liczba_bitow)
        print(data[0])
        print(data[1])
        rh = ((data[0] * 256 + data[1]) * 125 / 65536.0) - 6
        print(rh)
        
        (liczba_bitow, data) = Grupa.i2c.i2c_read_i2c_block_data(czujnik, self.tempKod, 2)
        print(liczba_bitow)
        print(data[0])
        print(data[1])
        #data0 = Grupa.bus.read_byte(Grupa.czujnik_temp_adres)
        #data1 = Grupa.bus.read_byte(Grupa.czujnik_temp_adres)
        temp = ((data[0] * 256 + data[1]) * 175.72 / 65536.0) - 46.85
        print(temp)

        odczyt = {
            "id_czujnika_temp": self.czujnik_temp.id_czujnika_temp,
            "temperatura": temp,
            "rh": rh
        }

        self.odczyt_instance = get_or_create(self.session, Odczyty, **odczyt)

    def sprawdz_kontaktron(self):
        if GPIO.input(self.czujnik.gpio):
            self.stan_czujnika = 0
            if self.stan_poprzedni == 1:
                for i in range(0, 2):
                    self.zrob_zdjecie()
        else:
            self.stan_czujnika = 1
        stan = {
            "id_czujnika": self.czujnik.id_czujnika,
            "stan": self.stan_czujnika
        }
        self.stan_instance = get_or_create(self.session, Stany, **stan)
        data = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        pomiar = {
            "id_stanu": self.stan_instance.id_stanu,
            "id_odczytu": self.odczyt_instance.id_odczytu,
            "id_zdjecia": self.zdjecie_instance.id_zdjecia,
            "data": data
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
        'db': 'nadzor'
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
        grupa.zrob_zdjecie()
        grupa.pomiar_temperatury_rh()
        schedule.every(kamera.czestotliwosc_zdjecia).seconds.do(grupa.zrob_zdjecie)
        schedule.every(czujnik_temp.czestotliwosc_pomiaru_temp).seconds.do(grupa.pomiar_temperatury_rh)
        schedule.every(czujnik.czestotliwosc_odczytu_stanu).seconds.do(grupa.sprawdz_kontaktron)
    while True:
        schedule.run_pending()

if __name__ == "__main__":
    main()
