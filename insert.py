from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from baza import Base, Kamery, Zdjecia, Czujniki_temperatury, Odczyty, Czujniki, Stany, Pomiary, get_or_create
config ={
    'host': 'localhost',
    'user': 'root',
    'passwd': 'raspberry',
    'db': 'Nadzor'
    }
db = create_engine("mysql+mysqldb://" + config['user'] + ":" + config['passwd'] + "@" + config['host'] + "/" + config['db'], echo=True)

DBSession = sessionmaker(bind=db)
session = DBSession()

titanum_kwargs = {
    "nazwa": "Titanum"
}
titanum = get_or_create(session, Kamery, **titanum_kwargs)

si7021_1_kwargs = {
    "id_czujnika_temp": 1,
    "nazwa": "Si7021"
}
si7021_1 = get_or_create(session, Czujniki_temperatury, **si7021_1_kwargs)

kontakron_kwargs = {
    "opis": "Kontaktron 1"
}
kontaktron_1 = get_or_create(session, Czujniki, **kontakron_kwargs)



