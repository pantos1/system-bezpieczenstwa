import RPi.GPIO as GPIO
import pigpio
from datetime import datetime
from subprocess import PIPE, Popen
import threading
import time
import schedule
import smtplib
from os import path
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from baza import Base, Kamery, Zdjecia, Czujniki_temperatury, Odczyty, Czujniki, Stany, Pomiary, Ustawienia, create, \
    fetch_all



class Grupa():
    # sciezka do zapisu zdjec
    sciezka = "/var/www/html/img/"
    i2c = pigpio.pi()
    multiplexer_adres = 0x70
    czujnik_temp_adres = 0x40
    rhKod = 0xF5
    tempKod = 0xE0
    multiplexer = i2c.i2c_open(1, multiplexer_adres)

    def __init__(self, kamera, czujnik_temp, czujnik, ustawienia, session, smtp):
        self.kamera = kamera
        self.czujnik_temp = czujnik_temp
        self.czujnik = czujnik
        self.ustawienia = ustawienia
        self.session = session
        self.smtp = smtp
        self.powiadomienia_email = self.ustawienia.filter(Ustawienia.klucz == 'powiadomienia_email').one().wartosc
        self.odbiorca = self.ustawienia.filter(Ustawienia.klucz == 'adres_email').one().wartosc
        self.nadawca = self.ustawienia.filter(Ustawienia.klucz == 'adres_email_nadawcy').one().wartosc
        self.zdjecie_instance = None
        self.odczyt_instance = None
        self.stan_czujnika = 0
        self.stan_poprzedni = 0
        self.czujnik.gpio = int(self.czujnik.gpio)
        self.czujnik_kanal_komenda = self.kanal(int(self.czujnik_temp.kanal_mux))
        self.czujnik_i2c = Grupa.i2c.i2c_open(1, Grupa.czujnik_temp_adres)
        GPIO.setup(self.czujnik.gpio, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

    @staticmethod
    def kanal(kanal):
        if kanal == 0:
            komenda = 0x01
        elif kanal == 1:
            komenda = 0x02
        elif kanal == 2:
            komenda = 0x04
        elif kanal == 3:
            komenda = 0x08
        elif kanal == 4:
            komenda = 0x10
        elif kanal == 5:
            komenda = 0x20
        elif kanal == 6:
            komenda = 0x40
        elif kanal == 7:
            komenda = 0x80
        else:
            komenda = 0x00
        return komenda

    def zrob_zdjecie(self):
        data = datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
        nazwa = data + ".jpg"
        sciezka = Grupa.sciezka + nazwa
        znacznik_urzadzenia = "-d" + self.kamera.sciezka_urzadzenia
        proces = Popen(["fswebcam", "-q", znacznik_urzadzenia, "-r 640x480", sciezka], stdout=PIPE, stderr=PIPE)
        try:
            (wyjscie, bledy) = proces.communicate()
            if bledy != b'': raise IOError
            zdjecie = {
                "id_kamery": self.kamera.id_kamery,
                "nazwa": nazwa
            }
        except IOError:
            zdjecie = {
                "id_kamery": self.kamera.id_kamery,
                "nazwa": None
            }
        self.zdjecie_instance = create(self.session, Zdjecia, **zdjecie)
        return proces

    def pomiar_temperatury_rh(self):
        try:
            Grupa.i2c.i2c_write_byte(Grupa.multiplexer, self.czujnik_kanal_komenda)
            try:
                Grupa.i2c.i2c_write_byte(self.czujnik_i2c, self.rhKod)
                time.sleep(0.05)
                (liczba_bitow, data) = Grupa.i2c.i2c_read_device(self.czujnik_i2c, 2)
                rh = ((data[0] * 256 + data[1]) * 125 / 65536.0) - 6

                (liczba_bitow, data) = Grupa.i2c.i2c_read_i2c_block_data(self.czujnik_i2c, self.tempKod, 2)
                temp = ((data[0] * 256 + data[1]) * 175.72 / 65536.0) - 46.85
            except pigpio.error:
                print("Błąd połączenia z czujnikiem I2C: " + self.czujnik_temp.nazwa_czujnika_temp)
                temp = None
                rh = None
        except pigpio.error:
            print("Błąd połączenia z multiplekserem I2C")
            temp = None
            rh = None
        finally:
            odczyt = {
                "id_czujnika_temp": self.czujnik_temp.id_czujnika_temp,
                "temperatura": temp,
                "rh": rh
            }

            self.odczyt_instance = create(self.session, Odczyty, **odczyt)

    def sprawdz_kontaktron(self):
        if GPIO.input(self.czujnik.gpio):
            self.stan_czujnika = 1
        else:
            self.stan_czujnika = 0
            if self.stan_poprzedni == 1:
                zdjecia = []
                self.zrob_zdjecie()
                zdjecia.append(self.zdjecie_instance.nazwa)
                if self.powiadomienia_email == "on" and self.odbiorca != "":
                    tekst = "Otwarty czujnik: " + self.czujnik.nazwa_czujnika
                    temat = "Otwarcie czujnika " + datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                    run_threaded(self.wyslij_email, (self.odbiorca, temat, tekst, zdjecia))
        stan = {
            "id_czujnika": self.czujnik.id_czujnika,
            "stan": self.stan_czujnika
        }
        stan_instance = create(self.session, Stany, **stan)
        data = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
        pomiar = {
            "id_stanu": stan_instance.id_stanu,
            "id_odczytu": self.odczyt_instance.id_odczytu,
            "id_zdjecia": self.zdjecie_instance.id_zdjecia,
            "data": data
        }
        pomiar_instance = create(self.session, Pomiary, **pomiar)
        self.stan_poprzedni = self.stan_czujnika

    def wyslij_email(self, odbiorca, temat, tekst, zdjecia=None):
        wiadomosc = MIMEMultipart()
        wiadomosc['From'] = self.nadawca
        wiadomosc['To'] = odbiorca
        wiadomosc['Subject'] = temat
        wiadomosc.attach(MIMEText(tekst, 'plain'))
        for zdjecie in zdjecia:
            with open(Grupa.sciezka + zdjecie, "rb") as plik:
                zalacznik = MIMEImage(
                    plik.read(),
                    Name=path.basename(zdjecie)
                )
            zalacznik['Content-Disposition'] = 'attachment; filename="%s"' % path.basename(zdjecie)
            wiadomosc.attach(zalacznik)
        self.smtp.sendmail(self.nadawca, odbiorca, wiadomosc.as_string())


def init_gpio():
    GPIO.setmode(GPIO.BCM)


def init_session(config):
    db = create_engine(
        "mysql+mysqldb://" + config['user'] + ":" + config['passwd'] + "@" + config['host'] + "/" + config['db'],
        pool_pre_ping=True
    )
    db_sessionmaker = sessionmaker(bind=db)
    session = db_sessionmaker()
    return session


def init_smtp(sender, password):
    smtp_server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    smtp_server.login(sender, password)
    return smtp_server


def run_threaded(func, args):
    thread = threading.Thread(target=func, args=args)
    thread.start()

def main():
    # konfiguracja do polaczenia z baza danych
    config = {
        'host': 'localhost',
        'user': 'root',
        'passwd': 'raspberry',
        'db': 'nadzor'
    }
    session = init_session(config)
    try:
        init_gpio()
        kamery = fetch_all(session, Kamery)
        czujniki = fetch_all(session, Czujniki)
        czujniki_temperatury = fetch_all(session, Czujniki_temperatury)
        ustawienia = fetch_all(session, Ustawienia)
        smtp_server = init_smtp(ustawienia.filter(Ustawienia.klucz == 'adres_email_nadawcy').one().wartosc,
                                ustawienia.filter(Ustawienia.klucz == 'haslo_nadawcy').one().wartosc)
        grupy = []
        for kamera, czujnik_temp, czujnik in zip(kamery.all(), czujniki_temperatury.all(), czujniki.all()):
            grupa = Grupa(kamera=kamera, czujnik_temp=czujnik_temp, czujnik=czujnik, ustawienia=ustawienia,
                          session=session, smtp=smtp_server)
            grupy.append(grupa)
            grupa.zrob_zdjecie()
            grupa.pomiar_temperatury_rh()
            schedule.every(kamera.czestotliwosc_zdjecia).seconds.do(grupa.zrob_zdjecie)
            schedule.every(czujnik_temp.czestotliwosc_pomiaru_temp).seconds.do(grupa.pomiar_temperatury_rh)
            schedule.every(czujnik.czestotliwosc_odczytu_stanu).seconds.do(grupa.sprawdz_kontaktron)
        while True:
            schedule.run_pending()
    finally:
        GPIO.cleanup()
        session.close()


if __name__ == "__main__":
    main()
