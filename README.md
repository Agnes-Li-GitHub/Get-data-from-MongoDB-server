# Get-data-from-MongoDB-server

Assume you are using the MongoDB server running on the course’s node.js docker container with the service name mongodb listening to the default port 27017. The name of the weather data database is weather, and the name of the collection is wrecords. The collection consists of HK weather data and each document contains 6 fields (not including the _id field), which are: date, meanT, maxT, minT, humidity, and rain. 

#### The program can handle all requests. 
1. POST request to URL http://localhost:8000/weather/YYYY/MM/DD
2. GET request to URL http://localhost:8000/weather/YYYY/MM/DD
3. GET request to URL http://localhost:8000/weather/temp/YYYY/MM or http://localhost:8000/weather/humi/YYYY/MM or http://localhost:8000/weather/rain/YYYY/MM
4. Remaining request
