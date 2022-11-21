const QuesQuery = {}

QuesQuery.select = () => {
return `
  SELECT
    q.id AS question_id,
    q.body AS question_body,
    q.date_written AS question_date,
    q.asker_name,
    q.helpful AS question_helpfulness,
    q.reported,
    COALESCE(json_object_agg(a.id, json_build_object(
      'id', a.id,
      'body', a.body,
      'date', a.date_written,
      'answerer_name', a.answerer_name,
      'helpfulness', a.helpful,
      'photos', (SELECT COALESCE(array_agg(url), '{}') FROM answers_photos WHERE answer_id = a.id)
    ))
    FILTER (where a.id is not null), '{}') AS answers
  FROM
    questions q
  LEFT JOIN
    answers a
  ON
    a.question_id = q.id
  AND
    a.reported = FALSE
  WHERE
    q.product_id = 1
  AND
    q.reported = FALSE
  GROUP BY q.id
  ORDER BY
    q.id
  LIMIT
    $2
  OFFSET
    $3`;
}

QuesQuery.insert = () => {
  return `INSERT INTO questions(product_id, body, date_written, asker_name, asker_email, reported, helpful) values($1, $2, $3, $4, $5, $6, $7)`;
}

QuesQuery.updateHelpfulness = () => {
  return 'UPDATE questions SET helpful = helpful + 1 WHERE id = $1';
}

QuesQuery.updateReported = () => {
  return 'UPDATE questions SET reported = true WHERE id = $1';
}

module.exports = QuesQuery;