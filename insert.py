from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from baza import *
config ={
    'host': 'localhost',
    'user': 'root',
    'passwd': 'raspberry',
    'db': 'nadzor'
    }
db = create_engine("mysql+mysqldb://" + config['user'] + ":" + config['passwd'] + "@" + config['host'] + "/" + config['db'], echo=True)

DBSession = sessionmaker(bind=db)
session = DBSession()

si7021_pomaranczowy_kwargs = {
    "id_czujnika_temp": 1,
    "nazwa_czujnika_temp": "Si7021_zielony",
    "czestotliwosc_pomiaru_temp": 10.0,
    "kanal_mux": 1
}
si7021_pomaranczowy = get_or_create(session, Czujniki_temperatury, **si7021_pomaranczowy_kwargs)

si7021_zielony_kwargs = {
    "id_czujnika_temp": 2,
    "nazwa_czujnika_temp": "Si7021_zielony",
    "czestotliwosc_pomiaru_temp": 10.0,
    "kanal_mux": 2
}
si7021_zielony = get_or_create(session, Czujniki_temperatury, **si7021_zielony_kwargs)

kontakron_1_kwargs = {
    "nazwa_czujnika": "Kontaktron 1",
    "gpio": 23,
    "czestotliwosc_odczytu_stanu": 0.1
}
kontaktron_1 = get_or_create(session, Czujniki, **kontakron_1_kwargs)

kontakron_2_kwargs = {
    "nazwa_czujnika": "Kontaktron 2",
    "gpio": 18,
    "czestotliwosc_odczytu_stanu": 0.1
}
kontaktron_2 = get_or_create(session, Czujniki, **kontakron_2_kwargs)

titanum_1_kwargs = {
    "nazwa_kamery": "Kamera 1 - Titanum",
    "id_czujnika": 1,
    "id_czujnika_temp": 1,
    "czestotliwosc_zdjecia": 10.0
}
titanum_1 = get_or_create(session, Kamery, **titanum_1_kwargs)

titanum_2_kwargs = {
    "nazwa_kamery": "Kamera 1 - Titanum",
    "id_czujnika": 2,
    "id_czujnika_temp": 2,
    "czestotliwosc_zdjecia": 10.0
}
titanum_2 = get_or_create(session, Kamery, **titanum_2_kwargs)

powiadomienia_kwargs = {
    "klucz": "powiadomienia_email",
    "wartosc": False
}
powiadomienia = get_or_create(session, Ustawienia, **powiadomienia_kwargs)

adres_email_kwargs = {
    "klucz": "adres_email",
    "wartosc": ""
}
adres_email = get_or_create(session, Ustawienia, **adres_email_kwargs)