from sqlalchemy import *
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship

#konfiguracja do polaczenia z baza danych
config ={
    'host': 'localhost',
    'user': 'root',
    'passwd': 'raspberry',
    'db': 'Nadzor'
    }


Base = declarative_base()

def get_or_create(session, model, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance
    else:
        instance = model(**kwargs)
        session.add(instance)
        session.commit()
        return instance

class Kamery(Base):
    __tablename__ = 'kamery'

    id_kamery = Column(Integer, primary_key=True)
    nazwa = Column(String(100))

class Zdjecia(Base):
    __tablename__ = 'zdjecia'

    id_zdjecia = Column(Integer, primary_key=True)
    id_kamery = Column(Integer, ForeignKey('kamery.id_kamery', ondelete='CASCADE'), nullable=False)

    nazwa = Column(String(250))

    kamery = relationship(Kamery)

class Czujniki_temperatury(Base):
    __tablename__ = 'czujniki_temperatury'

    id_czujnika_temp = Column(Integer, primary_key=True)

    nazwa = Column(String(100))

class Odczyty(Base):
    __tablename__ = 'odczyty'

    id_odczytu = Column(Integer, primary_key=True)
    id_czujnika_temp = Column(Integer, ForeignKey('czujniki_temperatury.id_czujnika_temp', ondelete='CASCADE'), nullable=False)

    temperatura = Column(Float)
    rh = Column(Float)

    czujniki_temperatury = relationship(Czujniki_temperatury)

class Czujniki(Base):
    __tablename__ = 'czujniki'

    id_czujnika = Column(Integer, primary_key=True)

    opis = Column(String(100))

class Stany(Base):
    __tablename__ = 'stany'

    id_stanu = Column(Integer, primary_key=True)
    id_czujnika = Column(Integer, ForeignKey('czujniki.id_czujnika', ondelete='CASCADE'), nullable=False)

    stan = Column(SmallInteger)

    czujniki = relationship(Czujniki)

class Pomiary(Base):
    __tablename__ = 'pomiary'

    id_pomiaru = Column(Integer, primary_key=True)
    id_stanu = Column(Integer, ForeignKey('stany.id_stanu', ondelete='CASCADE'), nullable=False)
    id_odczytu = Column(Integer, ForeignKey('odczyty.id_odczytu', ondelete='CASCADE'), nullable=False)
    id_zdjecia = Column(Integer, ForeignKey('zdjecia.id_zdjecia', ondelete='CASCADE'), nullable=False)

    stany = relationship(Stany)
    odczyt = relationship(Odczyty)
    zdjecia = relationship(Zdjecia)

db = create_engine("mysql+mysqldb://" + config['user'] + ":" + config['passwd'] + "@" + config['host'] + "/" + config['db'], echo=True)

Base.metadata.create_all(db)