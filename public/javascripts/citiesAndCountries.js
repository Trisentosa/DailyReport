import cityDatas from '../data/citiesAndCountries.js'
import usDatas from '../data/usCitiesAndStates.js'

const states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", 'Lousiana', "Maine", "Maryland","Massachusetts","Michigan", "Minnesotta", "Mississippi", "Missouri","Montana", 'Nebraska', "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma","Oregon","Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]
const stateID = ["01", "54", "02", "03", "04", "05", "06", "07", "08", "09", "10", "52", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"]
const countrySelect = document.getElementById("country");
const stateSelect = document.getElementById("state");
const citiesSelect = document.getElementById('city');
const stateOption = document.getElementById("stateOption");
let countryIndex = countrySelect.options.selectedIndex;
let countryName = countrySelect.options.item(countryIndex).text;
let country = cityDatas[countryName];


for (let i = 0; i< states.length; i++) {
    let option = document.createElement("option");
    option.text = states[i];
    option.value = stateID[i];
    stateSelect.add(option);
}
stateSelect.addEventListener('change', (event) => {
    const len = citiesSelect.options.length;
    for (let i = len - 1; i >= 0; i--) {
        citiesSelect.options[i] = null;
    } 
    let stateIndex = stateSelect.options.selectedIndex;
    let stateName = stateSelect.options.item(stateIndex).text;
    let uscities = usDatas[stateName];
    for (let city of uscities) {
        let option = document.createElement("option");
        option.text = city;
        option.value = city;
        citiesSelect.add(option);
    }
}) 
countrySelect.addEventListener('change', (event) => {
    const len = citiesSelect.options.length;
    for (let i = len - 1; i >= 0; i--) {
        citiesSelect.options[i] = null;
    }  
    let countryIndex = countrySelect.options.selectedIndex;
    let countryName = countrySelect.options.item(countryIndex).text;
    let country = cityDatas[countryName];

    if(countryName === 'United States'){

        stateOption.style.display = "inline";
        for (let state of states) {
            let option = document.createElement("option");
            option.text = state;
            option.value = state;
            stateSelect.add(option);
        }
         
    } else if (country !== undefined) {
        stateOption.style.display = "none";
        for (let city of country) {
            let option = document.createElement("option");
            option.text = city;
            option.value = city;
            citiesSelect.add(option);
        }
    }else{
        stateOption.style.display = "none";
        let option = document.createElement("option");
        option.text = 'Sorry, currently not available';
        citiesSelect.add(option);
    }
})



