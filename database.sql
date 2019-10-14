DROP TABLE hist_coverage;
DROP TABLE histcoverage;
DROP TABLE song_history;
DROP TABLE songhistory;
DROP TABLE songs;
DROP TABLE users;

CREATE TABLE songs (
  id bigint UNIQUE,
  name VARCHAR(256),
  image VARCHAR(256),
  album VARCHAR(256),
  url VARCHAR(256),
  artist VARCHAR(256),
  artistid VARCHAR(256),
  genre1 VARCHAR(256),
  genre2 VARCHAR(256),
  genre3 VARCHAR(256),
  genre4 VARCHAR(256),
  PRIMARY KEY (id)
);

CREATE TABLE users (
  id serial,
  username VARCHAR(64) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE histcoverage (
  id serial,
  day int,
  userid int NOT NULL,
  CONSTRAINT fkUserId FOREIGN KEY (userid) REFERENCES users (id),
  PRIMARY KEY (id)
);

CREATE TABLE songhistory (
  id serial,
  songId bigint NOT NULL,
  userid int NOT NULL,
  unixDate int,
  PRIMARY KEY (id),
  CONSTRAINT fksongid FOREIGN KEY (songid) REFERENCES songs (id),
  CONSTRAINT fkuserid FOREIGN KEY (userid) REFERENCES users (id)
);
