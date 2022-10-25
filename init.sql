-- Need to figure out relative path for file copy
CREATE TABLE IF NOT EXISTS questions(
  id SERIAL,
  product_id int not null,
  body varchar(255) not null,
  date_written BIGINT not null,
  asker_name varchar(255) not null,
  asker_email varchar(255) not null,
  reported BOOLEAN not null,
  helpful int not null,
  PRIMARY KEY(id)
);

COPY questions(id, product_id, body, date_written, asker_name, asker_email, reported, helpful)
FROM '/home/shista/SEIP2204/sprints/sdc/data/questions.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE IF NOT EXISTS answers(
  id SERIAL,
  question_id int not null,
  body varchar(255) not null,
  date_written BIGINT not null,
  answerer_name varchar(255) not null,
  answerer_email varchar(255) not null,
  reported BOOLEAN not null,
  helpful int not null,
  PRIMARY KEY(id),
  FOREIGN KEY(question_id) REFERENCES questions(id)
);

COPY answers(id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful)
FROM '/home/shista/SEIP2204/sprints/sdc/data/answers.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE IF NOT EXISTS answers_photos(
  id SERIAL,
  answer_id INT not null,
  url varchar(510) not null,
  PRIMARY KEY(id),
  FOREIGN KEY(answer_id) REFERENCES answers(id)
);

COPY answers_photos(id, answer_id, url)
FROM '/home/shista/SEIP2204/sprints/sdc/data/answers_photos.csv'
DELIMITER ','
CSV HEADER;

ALTER TABLE questions
ALTER COLUMN date_written
TYPE varchar
USING to_char(to_timestamp(date_written/1000), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

ALTER SEQUENCE questions_id_seq RESTART WITH 3518964;

ALTER TABLE answers
ALTER COLUMN date_written
TYPE varchar
USING to_char(to_timestamp(date_written/1000), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

ALTER SEQUENCE answers_id_seq RESTART WITH 6879307;
ALTER SEQUENCE answers_photos_id_seq RESTART WITH 2063760;

-- CREATE INDEX idx_questions_product_id ON questions(product_id, reported);
-- CREATE INDEX idx_answers_question_id ON answers(question_id, reported);
-- CREATE INDEX idx_url_answer_id ON answers_photos(answer_id);