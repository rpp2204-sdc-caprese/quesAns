-- CREATE TEMP TABLE IF NOT EXISTS temp_products(
--   id INT,
--   name varchar(255),
--   slogan varchar(255),
--   description varchar(1000),
--   category varchar(255),
--   default_price INT
-- );

-- COPY temp_products(id, name, slogan, description, category, default_price)
-- FROM '/home/shista/SEIP2204/sprints/sdc/data/product.csv'
-- DELIMITER ','
-- CSV HEADER;

-- CREATE TABLE IF NOT EXISTS products(
--   id int,
--   PRIMARY KEY(id)
-- );

-- INSERT INTO products(id)
-- SELECT id
-- FROM temp_products;


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
  -- FOREIGN KEY(product_id) REFERENCES products(id)
);

COPY questions(id, product_id, body, date_written, asker_name, asker_email, reported, helpful)
FROM '/home/shista/SEIP2204/sprints/sdc/data/questions.csv'
DELIMITER ','
CSV HEADER;

-- dont need to create new tables to accomodate filtering reported / asker email, can simply do with query

-- CREATE TABLE IF NOT EXISTS questionsAPI(
--   id INT,
--   product_id INT,
--   body varchar(255),
--   date_written BIGINT,
--   asker_name varchar(255),
--   reported BOOLEAN,
--   helpful int,
--   PRIMARY KEY(id)
-- );

-- INSERT INTO questionsAPI(id, product_id, body, date_written, asker_name, reported, helpful)
-- SELECT id, product_id, body, date_written, asker_name, reported, helpful
-- FROM questions
-- WHERE reported = false;

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

-- CREATE TABLE IF NOT EXISTS answersAPI(
--   id INT,
--   question_id int,
--   body varchar(255),
--   date_written BIGINT,
--   answerer_name varchar(255),
--   reported BOOLEAN,
--   helpful int,
--   PRIMARY KEY(id),
--   FOREIGN KEY(question_id) REFERENCES questionsAPI(id)
-- );

-- INSERT INTO answersAPI(id, question_id, body, date_written, answerer_name, reported, helpful)
-- SELECT id, question_id, body, date_written, answerer_name, reported, helpful
-- FROM answers
-- WHERE questionsAPI.reported = false AND reported = false;

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

-- need to alter table to transform dates
-- need to create index within this file

ALTER TABLE questions
ALTER COLUMN date_written
TYPE varchar
USING to_char(to_timestamp(date_written/1000), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

ALTER TABLE answers
ALTER COLUMN date_written
TYPE varchar
USING to_char(to_timestamp(date_written/1000), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');