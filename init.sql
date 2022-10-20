
CREATE TABLE IF NOT EXISTS questions(
  id INT,
  product_id int,
  body varchar(255),
  date_written BIGINT,
  asker_name varchar(255),
  asker_email varchar(255),
  reported BOOLEAN,
  helpful int,
  PRIMARY KEY(id)
);

COPY questions(id, product_id, body, date_written, asker_name, asker_email, reported, helpful)
FROM '/home/shista/SEIP2204/sprints/sdc/data/questions.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE IF NOT EXISTS answers(
  id INT,
  question_id int,
  body varchar(255),
  date_written BIGINT,
  answerer_name varchar(255),
  answerer_email varchar(255),
  reported BOOLEAN,
  helpful int,
  PRIMARY KEY(id),
  FOREIGN KEY(question_id) REFERENCES questions(id)
);

COPY answers(id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful)
FROM '/home/shista/SEIP2204/sprints/sdc/data/answers.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE IF NOT EXISTS answers_photos(
  id INT,
  answer_id INT,
  url varchar(510),
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
USING to_char(to_timestamp(date_written/1000), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

ALTER TABLE answers
ALTER COLUMN date_written
TYPE varchar
USING to_char(to_timestamp(date_written/1000), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

CREATE INDEX idx_questions_product_id ON questions(product_id, reported);
CREATE INDEX idx_answers_question_id ON answers(question_id, reported);
CREATE INDEX idx_url_answer_id ON answers_photos(answer_id);