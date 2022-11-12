const SELECT_QUESTIONS_ANSWERS = `
SELECT
q.id AS question_id,
q.body AS question_body,
q.date_written AS question_date,
q.asker_name,
q.helpful AS question_helpfulness,
q.reported,
coalesce(json_object_agg(a.id, json_build_object(
  'id', a.id,
  'body', a.body,
  'date', a.date_written,
  'answerer_name', a.answerer_name,
  'helpfulness', a.helpful
))
filter (where a.id is not null), '{}') as answers
FROM
  questions q
LEFT JOIN
  answers a
ON
  a.question_id = q.id
AND
  a.reported = FALSE
WHERE
  q.product_id = $1
AND
  q.reported = FALSE
GROUP BY q.id
ORDER BY
  q.id
LIMIT
  $2
OFFSET
  $3`

const SELECT_PHOTOS = `select coalesce(array_agg(url), '{}') as photos from answers_photos where answer_id = $1`

const INSERT_QUESTION = `insert into questions(product_id, body, date_written, asker_name, asker_email, reported, helpful) values($1, $2, $3, $4, $5, $6, $7)`

const UPDATE_QUESTION_HELPFULNESS = 'update questions set helpful = helpful + 1 where id = $1'

const UPDATE_QUESTION_REPORTED = 'update questions set reported = true where id = $1'

module.exports = {
  SELECT_QUESTIONS_ANSWERS,
  SELECT_PHOTOS,
  INSERT_QUESTION,
  UPDATE_QUESTION_HELPFULNESS,
  UPDATE_QUESTION_REPORTED
}