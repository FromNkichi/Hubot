const twitter = require('twitter');
const fs = require('fs');
const path = require('path');
const folder = path.resolve('./');
const tokenFilePath = folder + '/scripts/keys/';
const pictureFilePath = folder + '/scripts/bashes/';
const Gyazo = require('gyazo-api');
const exec = require('child_process').exec;

module.exports = (hubot) => {
    hubot.hear('weather', (res) => {
        function myReadFile(file) {
            return new Promise((resolve, reject) => {
                fs.readFile(tokenFilePath + file, 'utf8', (err, text) => {
                    const result = text.replace('\n', '');
                    resolve(result);
                });
            });
        }

        let twitterResist = function(result) {
            return new Promise((resolve, reject) => {
                let twi = new twitter({
                    consumer_key: result[0],
                    consumer_secret: result[1],
                    access_token_key: result[2],
                    access_token_secret: result[3]
                });
                resolve(twi);
            });
        }


        let tweet = function(twi) {
            return new Promise((resolve, reject) => {
                twi.get('search/tweets', {q:'from:forecast_tokyo'}, (err, tweets, res) => {
                    if (!err) {
                        resolve(tweets.statuses[0].text);
                    } else {
                        console.log(twi);
                        console.log(err);
                    }
                });
            });
        }

        let msgEdit = function(msg) {
            return new Promise((resolve, reject) => {
                let ret = msg.split('#');
                resolve(ret[0]);
            });
        }

        let response = function(msg) {
            return new Promise((resolve, reject) => {
                hubot.messageRoom('general',msg);
                resolve();
            });
        }

        let gyazoResist = function(result) {
            return new Promise((resolve, reject) => {
                let gyazo = new Gyazo(result[0]);
                resolve(gyazo);
            });
        }

        let makePic = function(obj) {
            return new Promise((resolve, reject) => {
                exec(pictureFilePath + 'weather_image today', (error, stdout, stderr)=> {
                    console.log('hoge');
                    resolve(obj);
                });
            });
        }

        let pushGyazo = function(gyazo) {
            return new Promise((resolve, reject) => {
                const picturePath = pictureFilePath + 'today.png';
                gyazo.upload(picturePath, {
                    title: 'today',
                    desc : 'upload from nodejs'
                    })
                    .then(function(res){
                        resolve(res.data.permalink_url);
                    })
                    .catch(function(err){
                        console.log(err);
                    });
            });
        }

        let twitterPromise = Promise.all([myReadFile('twitter/consumer.key'), myReadFile('twitter/consumer_secret.key'), myReadFile('twitter/access.token'), myReadFile('twitter/access_secret.token')]);

        let gyazoPromise = Promise.all([myReadFile('gyazo/gyazo.token')]);

        twitterPromise
            .then(twitterResist)
            .then(tweet)
            .then(msgEdit)
            .then(response);

        gyazoPromise
            .then(makePic)
            .then(gyazoResist)
            .then(pushGyazo)
            .then(response);
    });
}
