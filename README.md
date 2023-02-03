# Questions / Answers Microservice
This project transformed a monolithic backend of the Atelier e-commerce website into a scalable question/answer microservice
</br>
• Set up ETL pipeline using PostgreSQL for legacy data of 30 million records </br>
• Implemented RESTful API </br>
• Horizontally scaled service to 4 Amazon EC2 instances behind NGINX load balancer and implemented Redis caching for quick database retrievals </br>
• Used New Relic and loader.io to identify bottlenecks </br>
• Optimized database performance by consolidating three separate SQL queries into a single query using aggregate functions </br>
• Achieved 3500 RPS at 7ms response time

# Initial Testing metrics for GET /questions
</br>
<img src="loaderio_CPS_300.png" />
</br>
300 requests / second @ 2036 ms latency
</br>

# Metrics for GET /questions after NGINX load balancer and Redis cache
</br>
<img src="cps_3500_redis.png" />
</br>
3500 requests / second @ 7 ms latency
