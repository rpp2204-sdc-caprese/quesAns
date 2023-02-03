# Questions / Answers Microservice
This project transformed a monolithic backend of e-commerce website into scalable question/answer microservice
</br>
• Set up ETL pipeline using PostgreSQL for legacy data of 30 million records </br>
• Implemented RESTful API </br>
• Horizontally scaled service to 4 Amazon EC2 instances behind NGINX load balancer and Redis caching for quick database retrievals </br>
• Used New Relic and loader.io to identify bottlenecks </br>
• Optimized database performance by consolidating three separate SQL queries into a single query using aggregate functions </br>
• Achieved 3500 RPS at 7ms response time
