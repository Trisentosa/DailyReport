if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios').default;
const { WeatherReport, DayReport, Data } = require('./public/classes/weatherReport');
const News = require('./public/classes/newsReport')
const convertTimeStamp = require('./public/javascripts/unixToDate');
//EJS
app.set('view engine', 'ejs')  //tell we're using ejs
app.set('views', path.join(__dirname, 'views'))//so we can access it outside this directory

//Countries
const english = require('localized-countries')('en')
const countryCodes = english.array();

//ejs-mate setup
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

//Static files
app.use(express.static(path.join(__dirname, 'public')));

//Parsing 
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.json()) // for parsing application/json

//session
const session = require('express-session');
const sessionConfig = {
    name: '__tkra', //some random ass name to confuse people
    secret: process.env.SECRET||'haasdfnsaknf',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));
//Flash
const flash = require('connect-flash');
app.use(flash());
//middleware LOCALS
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//helmet
const helmet = require("helmet");
app.use(helmet({ contentSecurityPolicy: false }));

//ExpressError
const ExpressError = require('./utilities/ExpressError.js')

const {kelvinToCelcius, kelvinToFahrenheit} = require('./public/javascripts/tempConvert');
const OWMkey = process.env.WEATHER_KEY;
const newsKey = process.env.NEWS_KEY;
let weatherReport = new WeatherReport();
let dayReport = new DayReport();
let currentWeather = new Data();
let cityInput = null;
let countryInput = null;
let categoryInput = null;
let tempInput = null;
let state = 'news';
const currentDate = convertTimeStamp(Date.now()).slice(0, 10);
const times = [6, 9, 12, 15, 18]

// Middleware
const isValidLocation = (req, res, next) => {
    const { city, category } = req.body.input;
    if (city === null || city === 'Sorry, currently not available' || city === '--') {
        req.flash('error', 'City not available');
        res.redirect('/');
    }
    if (category === null || category === undefined) {
        req.flash('error', 'Category not available');
        res.redirect('/');
    }
    next();
}

const isFormFilled = (req,res,next)=>{
    if(cityInput === null || categoryInput === null || countryInput===null){
        req.flash('error', 'Fill the form first');
        res.redirect('/');
    }
    next();
}

// Routes
app.get('/', (req, res) => {
    res.render('form.ejs', { countryCodes})
})

app.get('/developer', (req, res) => {
    res.send(countryCodes);
})

app.get('/news', isFormFilled,(req, res,next) => {
    state = 'news';
    const req1 = axios.get(`http://newsapi.org/v2/top-headlines?country=${countryInput}&apiKey=${newsKey}`);
    const req2 = axios.get(`http://newsapi.org/v2/everything?q=${categoryInput}&from=${currentDate}&sortBy=popularity&apiKey=${newsKey}`);
    axios.all([req1, req2])
        .then(axios.spread((...responses) => {
            const { articles: headline } = responses[0].data;
            const { articles: categoried } = responses[1].data;
            let headlines = []
            let categories = []
            for (let dt of headline) {
                headlines.push(new News(dt.author, dt.title, dt.description, dt.url, dt.urlToImage, dt.publishedAt))
            }
            if (categoryInput) {
                for (let dt of categoried) {
                    categories.push(new News(dt.author, dt.title, dt.description, dt.url, dt.urlToImage, dt.publishedAt))
                }
            }
            let countryName = english.get(countryInput)
            res.render('news.ejs', { headlines, categories, categoryInput, countryName, state });
        }))
        .catch((error) => {
            throw new ExpressError(error, 400);
        })
})

app.get('/weather',isFormFilled, (req, res,next) => {
    state = 'weather';
    const req1 = axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&appid=${OWMkey}`);
    const req2 = axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${OWMkey}`);
    axios.all([req1, req2])
        .then(axios.spread((...responses) => {
            let forecastDatas = responses[0].data;
            let currDt = responses[1].data;
            if(tempInput === 'celcius'){
                currDt.main['feels_like'] = kelvinToCelcius(currDt.main['feels_like']);
                currDt.main.temp = kelvinToCelcius(currDt.main.temp);
            }else{
                currDt.main['feels_like'] = kelvinToFahrenheit(currDt.main['feels_like']);
                currDt.main.temp = kelvinToFahrenheit(currDt.main.temp);
            }
            currentWeather = new Data(convertTimeStamp(currDt.dt), currDt.main.temp, currDt.main['feels_like'], currDt.main.pressure,
                currDt.main.humidity, currDt.weather[0].main, currDt.weather[0].description, currDt.weather[0].icon)

            weatherReport = new WeatherReport(forecastDatas.city.name, forecastDatas.city.country);
            let dateTracked = -1;
            for (let dt of forecastDatas.list) {
                let date = parseInt(dt['dt_txt'].slice(8, 10));
                let time = parseInt(dt['dt_txt'].slice(11, 13));
                if (dateTracked === -1) {
                    dateTracked = date;
                    dayReport = new DayReport(dt['dt_txt'], date);
                } else if (dateTracked !== date) {
                    dateTracked = date;
                    dayReport.m_data.length < 5 ? weatherReport.m_dayReport.pop() : weatherReport.m_dayReport.push(dayReport);
                    dayReport = new DayReport(dt['dt_txt'], date);
                }
                if (times.includes(time)) {
                    if (tempInput === 'celcius') {
                        dt.main['feels_like'] = kelvinToCelcius(dt.main['feels_like']);
                        dt.main.temp = kelvinToCelcius(dt.main.temp);
                    } else {
                        dt.main['feels_like'] = kelvinToFahrenheit(dt.main['feels_like']);
                        dt.main.temp = kelvinToFahrenheit(dt.main.temp);
                    }
                    let newData = new Data(time, dt.main.temp, dt.main['feels_like'], dt.main.pressure, dt.main.humidity, dt.weather[0].main, dt.weather[0].description, dt.weather[0].icon);
                    dayReport.m_data.push(newData);
                }
            }
            res.render('weather.ejs', { weatherReport, currentWeather, state })
        }))
        .catch((error) => {
            throw new ExpressError(error, 400)
        })
})

app.get('/settings', (req, res) => {
    const countryName = english.get(countryInput);
    state = 'settings';
    res.render('settings.ejs', { state, categoryInput, cityInput, countryName, countryCodes})
})

app.post('/page',isValidLocation, async (req, res, next) => {
    const { city, country, category,temp } = req.body.input;
    cityInput = city;
    countryInput = country;
    categoryInput = category;
    tempInput = temp;
    console.log(cityInput)
    res.redirect('/news');
})

app.post('/news', (req, res) => {
    state = 'news';
    res.redirect('/news')
})

app.post('/weather', (req, res) => {
    state = 'weather';
    res.redirect('/weather');
})

app.post('/settings', (req, res) => {
    state = 'settings';
    res.redirect('/settings');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!!!', 404));
})

app.use((err, req, res, next) => {
    const { message = 'Something Went Wrong', status = 500 } = err;
    res.status(status).send(message);
})


app.listen(3000, () => {
    console.log("Listeing on port 3000~")
})


