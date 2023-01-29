const AnsQuery = {}

AnsQuery.select = () => {
  return `
    SELECT
      a.id AS answer_id, body, date_written as date, answerer_name, helpful AS helpfulness,
      COALESCE(json_agg(json_build_object(
        'id', answers_photos.id,
        'url', url
      )) FILTER (where url is not null), '[]'::json) AS photos
    FROM answers a
    LEFT JOIN
      answers_photos ON
      answers_photos.answer_id = a.id
    WHERE a.question_id = $1
      AND reported = false
    GROUP BY a.id
    ORDER BY a.id
    LIMIT $2 OFFSET $3
    `;
}

AnsQuery.insert = () => {
  return `
    INSERT INTO
      answers(question_id, body, date_written, answerer_name, answerer_email, reported, helpful)
      values($1, $2, $3, $4, $5, $6, $7)
    RETURNING ID`;
}

AnsQuery.insertPhotos = () => {
  return 'INSERT INTO answers_photos(answer_id, url) values($1, $2)';
}

AnsQuery.updateHelpfulness = () => {
  return 'UPDATE answers SET helpful = helpful + 1 WHERE id = $1';
}

AnsQuery.updateReported = () => {
  return 'UPDATE answers SET reported = true WHERE id = $1';
}

module.exports = AnsQuery;
