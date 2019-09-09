DROP TABLE hist_coverage;
DROP TABLE song_history;
DROP TABLE songs;
DROP TABLE users;

CREATE TABLE songs (
  id bigint UNIQUE,
  name VARCHAR(256),
  image VARCHAR(256),
  album VARCHAR(256),
  url VARCHAR(256),
  artist VARCHAR(256),
  artist_id VARCHAR(256),
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

CREATE TABLE hist_coverage (
  id serial,
  day int,
  user_id int NOT NULL,
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id),
  PRIMARY KEY (id)
);

CREATE TABLE song_history (
  id serial,
  song_id bigint NOT NULL,
  user_id int NOT NULL,
  unix_date int,
  PRIMARY KEY (id),
  CONSTRAINT fk_song_id FOREIGN KEY (song_id) REFERENCES songs (id),
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
);
