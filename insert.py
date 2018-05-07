from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from baza import Base, Kamery, Zdjecia, Czujniki_temperatury, Odczyty, Czujniki, Stany, Pomiary, get_or_create
config ={
    'host': 'localhost',
    'user': 'root',
    'passwd': 'raspberry',
    'db': 'nadzor'
    }
db = create_engine("mysql+mysqldb://" + config['user'] + ":" + config['passwd'] + "@" + config['host'] + "/" + config['db'], echo=True)

DBSession = sessionmaker(bind=db)
session = DBSession()

si7021_1_kwargs = {
    "id_czujnika_temp": 1,
    "nazwa_czujnika_temp": "Si7021",
    "czestotliwosc_pomiaru_temp": 10.0
}
si7021_1 = get_or_create(session, Czujniki_temperatury, **si7021_1_kwargs)

kontakron_kwargs = {
    "nazwa_czujnika": "Kontaktron 1",
    "gpio": 23,
    "czestotliwosc_odczytu_stanu": 0.1
}
kontaktron_1 = get_or_create(session, Czujniki, **kontakron_kwargs)

titanum_kwargs = {
    "nazwa_kamery": "Kamera 1 - Titanum",
    "id_czujnika": 1,
    "id_czujnika_temp": 1,
    "czestotliwosc_zdjecia": 10.0
}
titanum = get_or_create(session, Kamery, **titanum_kwargs)



