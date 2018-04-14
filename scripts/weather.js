const fs = require('fs');
const http = require('http');
const weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?';
const path = require('path');
const folder = path.resolve('./');
const userFilePath = folder + '/scripts/keys/openweathermap/';
const file = 'api.key';



module.exports = (hubot) => {
    hubot.hear('weather', (res) => {
        function myReadFile(filepwd) {
            return new Promise((resolve, reject) => {
                fs.readFile(filepwd, 'utf8', (err, text) => {
                    const result = text.replace('\n', '');
                    resolve(result);
                });
            });
        }

        let getWeather = function(result) {
            return new Promise((resolve, reject) => {
                const url = weatherUrl + 'q=Yokohama-shi,jp' + '&units=metric' + '&appid=' + result;
                console.log(url);

                http.get(url, (res) => {
                    let body = '';
                    res.setEncoding('utf8');
        
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
        
                    res.on('data', (chunk) => {
                        result = JSON.parse(body);
                        console.log(result);
                    });
                }).on('error', (e) => {
                    console.log(e.message);
                });
                        
            })
        }
        let weatherPromise = Promise.all([myReadFile(userFilePath + file)]);

        weatherPromise
            .then(getWeather);
    });
}