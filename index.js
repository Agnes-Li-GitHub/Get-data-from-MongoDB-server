var express = require("express");
var app = express();
var router = express.Router();
app.use(express.json());

//// Task A
var mongoose = require("mongoose");
mongoose.connect('mongodb://mongodb/weather', { useNewUrlParser: true })
.then(() => {
  console.log("Connected to MongoDB");
})
.catch(err => {
  console.log("MongoDB connection error: " + err);
});

var weather_schema = new mongoose.Schema({
  date: String,
  meanT: Number,
  maxT: Number,
  minT: Number,
  humidity: Number,
  rain: Number,
});
var wrecords = mongoose.model('wrecords', weather_schema);

mongoose.connection.on('connected', () => {
  console.error("Monitor: Connected");
});

mongoose.connection.on('disconnected', () => {
  console.error("Monitor: Database lost connection");
  mongoose.connection.close();
  process.exit();
});

var year, month, day, full_date, result;

function check_valid_day(year, month, day){
  if (2013 <= parseInt(year) && parseInt(year) <= 2023 && 1 <= parseInt(month) && parseInt(month) <= 12 && 1 <= parseInt(day) && parseInt(day) <= 31){
    // check Feb 28
    if (parseInt(month) == 2 && parseInt(day) > 28){
      return false;
    }
    // check even month in 1-7
    else if (parseInt(month)%2 == 0 && parseInt(month) <= 7 && parseInt(day) > 30){
      return false;
    }
    // check odd month 1-7
    else if (parseInt(month) % 2 == 1 && parseInt(month) <= 7 && parseInt(day) > 31){
      return false;
    }
    // check even month 8-12
    else if (parseInt(month)%2 == 0 && parseInt(month) <= 12 && parseInt(day) > 31){
      return false;
    }
    // check odd month 8-12
    else if (parseInt(month) % 2 == 1 && parseInt(month) <=12 && parseInt(day) > 30){
      return false;
    }
    else{
      return true;
    }
  }
  else{
    return false;
  }
}

//// Task B
app.post('/weather/:URL_year/:URL_month/:URL_day', async function (req, res) {
  year = req.params.URL_year;
  month = req.params.URL_month;
  day = req.params.URL_day;
  if (day.length == 1){
    day = "0" + day;
  }
  if (month.length == 1){
    month = "0" + month;
  }
  
  full_date = year.concat(month, day);
  

  // situation 1.1 
  if (check_valid_day(year, month, day)){
  // Situation 1.2
    try {
      let result = await wrecords.find({date: full_date});
      if (result.length != 0){
        res.status(403).json({error: "find an existing record. Cannot override!"});
      }
      else {
        var newRecord = new wrecords({
          date: full_date,
          meanT: req.body.meanT,
          maxT: req.body.maxT,
          minT: req.body.minT,
          humidity: req.body.humidity,
          rain: req.body.rain
        });
        newRecord.save()
        .then(() => {
          res.status(200).json({okay: "Record added"});
        })
        .catch(err => {
          res.status(500).json({error: "System error"});
        });
      }
    }
    catch (err) {
      res.status(500).json({ error: "System error" });
    } 
  }
  else{
    res.status(400).json({error: "not a valid year/month/date"});
  }
}); 

//// Task C + D
app.get('/weather/:var1/:var2/:var3', async function (req, res) {
  if (req.params.var1 == "temp" || req.params.var1 == "humi" || req.params.var1 == "rain"){
    var type = req.params.var1;
    year = req.params.var2;
    month = req.params.var3;
    day = "10";
    if (month.length == 1){
      month = "0" + month;
    }
    full_date = year.concat(month);
    
    // situation 3.1 
    if (check_valid_day(year, month, day)){
      try {
        let result = await wrecords.find({date: new RegExp('^'+full_date)});
        if (result.length == 0){
          res.status(404).json({error: "not found"});
        }
        else if (type == "temp"){
          var avg = 0;
          var max = result[0].maxT;
          var min = result[0].minT;
          for (let i=0; i<result.length; i++){
            avg += result[i].meanT;
            if (result[i].maxT > max){
              max = result[i].maxT;
            }
            if (result[i].minT < min){
              min = result[i].minT;
            }
          }
          avg = avg / result.length;
          result = { 
            "Year": parseInt(year), 
            "Month": parseInt(month),
            "Avg Temp": parseFloat(avg.toFixed(2)),
            "Max Temp": max,
            "Min Temp": min,
          };  
          res.status(200).json(result);  
        }
        else if (type == "humi"){
          var avg = 0;
          var max = result[0].humidity;
          var min = result[0].humidity;
          for (let i=0; i<result.length; i++){
            avg += result[i].humidity;
            if (result[i].humidity > max){
              max = result[i].humidity;
            }
            if (result[i].humidity < min){
              min = result[i].humidity;
            }
          }
          avg = avg / result.length;
          result = { 
            "Year": parseInt(year), 
            "Month": parseInt(month),
            "Avg Humidity": parseFloat(avg.toFixed(2)),
            "Max Humidity": max,
            "Min Humidity": min,
          }; 
          res.status(200).json(result);      
        }
        else if (type == "rain"){
          var avg = 0;
          var max = result[0].rain;
          for (let i=0; i<result.length; i++){
            avg += result[i].rain;
            if (result[i].rain > max){
              max = result[i].rain;
            }
          }
          avg = avg / result.length;
          result = { 
            "Year": parseInt(year), 
            "Month": parseInt(month),
            "Avg Rainfall": parseFloat(avg.toFixed(2)),
            "Max Daily Rainfall": max,
          };  
          res.status(200).json(result);  
        }
      }
      catch (err) {
        res.status(500).json({ error: "System error" });
      } 
    } 
    else{
      res.status(400).json({error: "not a valid year/month"});
    }
  }
  else{
    year = req.params.var1;
    month = req.params.var2;
    day = req.params.var3;
    if (month.length == 1){
      month = "0" + month;
    }
    if (day.length == 1){
      day = "0" + day;
    }
    full_date = year.concat(month, day);

    // situation 2.1
    if (check_valid_day(year, month, day)){   
      // Situation 2.2
      try {
        let result = await wrecords.find({date: full_date});
        if (result.length == 0){
          res.status(404).json({error: "not found"});
        }
        else {
          result = {
            "Year": parseInt(year),
            "Month": parseInt(month),
            "Date": parseInt(day),
            "Avg Temp": result[0].meanT,
            "Max Temp": result[0].maxT,
            "Min Temp": result[0].minT, 
            "Humidity": result[0].humidity,
            "Rainfall": result[0].rain
          };
          res.status(200).json(result);
        }
      }
      catch (err) {
        res.status(500).json({ error: "System error" });
      } 
    }
    else{
      res.status(400).json({error: "not a valid year/month/date"});
    }
  }
})

//// Task E
app.all(function (req, res){
  var message = "Cannot ".concat(req.method, " ", req.path);
  result = {error: message};
  res.status(400).json(result);
})

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'error': err.message});
});

app.listen(8000, () => {
  console.log('Weather app listening on port 8000!')
});