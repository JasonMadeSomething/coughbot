USE coughdev;
DROP TABLE IF EXISTS interactions;
DROP TABLE IF EXISTS people;

CREATE TABLE people (
  ID int NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT Null,
  cancough BIT(0) NOT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE interactions (
  ID int NOT NULL AUTO_INCREMENT,
  cougher_id int not null,
  coughee_id int not null,
  PRIMARY KEY (ID),
  FOREIGN KEY (cougher_id) REFERENCES people(ID),
  FOREIGN KEY (coughee_id) REFERENCES people(ID)
);
