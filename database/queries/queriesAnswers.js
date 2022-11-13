const SELECT_ANSWERS = `
SELECT
  a.id as answer_id, body, date_written as date, answerer_name, helpful as helpfulness,
  coalesce(json_agg(json_build_object(
    'id', answers_photos.id,
    'url', url
  )) FILTER (where url is not null), '[]'::json) as photos
FROM answers a
LEFT JOIN
  answers_photos on
  answers_photos.answer_id = a.id
WHERE a.question_id = $1
  and reported = false
group by a.id
order by a.id
limit $2 offset $3
`

const INSERT_ANSWER = 'insert into answers(question_id, body, date_written, answerer_name, answerer_email, reported, helpful) values($1, $2, $3, $4, $5, $6, $7) returning id'

const INSERT_PHOTOS = 'insert into answers_photos(answer_id, url) values($1, $2)'

const UPDATE_ANSWERS_HELPFULNESS = 'update answers set helpful = helpful + 1 where id = $1'

const UPDATE_ANSWERS_REPORTED = 'update answers set reported = true where id = $1'

module.exports = {
  SELECT_ANSWERS,
  INSERT_ANSWER,
  INSERT_PHOTOS,
  UPDATE_ANSWERS_HELPFULNESS,
  UPDATE_ANSWERS_REPORTED
}

