import RPi.GPIO as GPIO
import pigpio
from datetime import datetime
import subprocess
import time
import schedule
import smtplib
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from baza import Base, Kamery, Zdjecia, Czujniki_temperatury, Odczyty, Czujniki, Stany, Pomiary, Ustawienia, get_or_create, \
    fetch_all


class Grupa():
    # sciezka do zapisu zdjec
    sciezka = "/var/www/html/img/"
    i2c = pigpio.pi()
    multiplexer_adres = 0x70
    czujnik_temp_adres = 0x40
    rhKod = 0xF5
    tempKod = 0xE0
    sender = "systembezpieczenstwa2018@gmail.com"
    password = "inzynierka"

    def __init__(self, kamera, czujnik_temp, czujnik, ustawienia, session):
        self.kamera = kamera
        self.czujnik_temp = czujnik_temp
        self.czujnik = czujnik
        self.ustawienia = ustawienia
        self.session = session
        self.smtp = self.init_smtp(Grupa.sender, Grupa.password)
        self.zdjecie_instance = None
        self.odczyt_instance = None
        self.stan_czujnika = 0
        self.stan_poprzedni = 0
        self.czujnik.gpio = int(self.czujnik.gpio)
        self.czujnik_kanal_komenda = self.kanal(int(self.czujnik_temp.kanal_mux))
        GPIO.setup(self.czujnik.gpio, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    @staticmethod
    def kanal(kanal):
        if kanal == 0:
            komenda = 0x04
        elif kanal == 1:
            komenda = 0x05
        elif kanal == 2:
            komenda = 0x06
        elif kanal == 3:
            komenda = 0x07
        else:
            komenda = 0x00
        return komenda

    def init_smtp(self, sender, password):
        smtp_server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        smtp_server.login(sender, password)
        return smtp_server

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
        rh = ((data[0] * 256 + data[1]) * 125 / 65536.0) - 6

        (liczba_bitow, data) = Grupa.i2c.i2c_read_i2c_block_data(czujnik, self.tempKod, 2)
        temp = ((data[0] * 256 + data[1]) * 175.72 / 65536.0) - 46.85

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
                zdjecia = []
                for i in range(0, 2):
                    self.zrob_zdjecie()
                    zdjecia.append(self.zdjecie_instance.nazwa)
                email_setting = self.ustawienia.filter(Ustawienia.klucz == 'powiadomienia_email').one()
                recipient = self.ustawienia.filter(Ustawienia.klucz == 'adres_email').one()
    
    
                if email_setting.wartosc == "on" and recipient.wartosc != "":
                    subject = "Otwarcie czujnika " + datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                    text = "Otwarty czujnik: " + self.czujnik.nazwa_czujnika
                    message = "Subject: {}\n\n{}".format(subject, text)
                    self.smtp.sendmail(Grupa.sender, recipient.wartosc, message)
        else:
            self.stan_czujnika = 1
        stan = {
            "id_czujnika": self.czujnik.id_czujnika,
            "stan": self.stan_czujnika
        }
        stan_instance = get_or_create(self.session, Stany, **stan)
        data = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        pomiar = {
            "id_stanu": stan_instance.id_stanu,
            "id_odczytu": self.odczyt_instance.id_odczytu,
            "id_zdjecia": self.zdjecie_instance.id_zdjecia,
            "data": data
        }
        pomiar_instance = get_or_create(self.session, Pomiary, **pomiar)
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
    ustawienia = fetch_all(session, Ustawienia)
    grupy = []
    for kamera, czujnik_temp, czujnik in zip(kamery.all(), czujniki_temperatury.all(), czujniki.all()):
        grupa = Grupa(kamera=kamera, czujnik_temp=czujnik_temp, czujnik=czujnik, ustawienia=ustawienia, session=session)
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
