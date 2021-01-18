function kelvinToCelcius(kelvin){
    return Math.floor(kelvin-273).toFixed(2);
}

function kelvinToFahrenheit(kelvin) {
    return (9/5*(kelvin - 273) + 32).toFixed(2);
}

module.exports = {kelvinToCelcius, kelvinToFahrenheit}