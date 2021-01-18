class Data {
    constructor(time,temp, feels, pressure, humidity, main, desc, icon) {
        this.time = time;
        this.temp = temp;
        this.feels = feels;
        this.pressure = pressure;
        this.humidity = humidity;
        this.main = main,
        this.desc = desc;
        this.icon = icon;
    }
}
class DayReport {
    constructor(fullDate, date, m_data=[]) {
        this.fullDate = fullDate;
        this.date = date;
        this.m_data = m_data;
    }

}
class WeatherReport{
    m_dayReport=[];
    constructor(city, country, m_dayReport=[]){
        this.city = city;
        this.country = country;
        this.m_dayReport = m_dayReport;
    }
}

module.exports = {
    WeatherReport,
    DayReport,
    Data
}