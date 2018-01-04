const client = require('cheerio-httpcli');
const odakyuUrl = 'https://transit.yahoo.co.jp/traininfo/detail/109/0/';
const keioUrl = 'https://transit.yahoo.co.jp/traininfo/detail/120/0/'; 
const checkTimes = 1080;
const path = require('path');
const fs = require('fs');
const folder = path.resolve('./');
const userFilePath = folder + '/scripts/users/';

module.exports = (hubot) => {
    hubot.hear('routineCheck', (res) => {
        let odakyuPageKey = 0;
        let keioPageKey = 0;
        let checkCount = 0;

        function odakyuPageSearch() {
            return new Promise((resolve, reject) => {
                client.fetch(odakyuUrl, function (err, $, response) {
                    for (let i = 0; i < $('meta').length; i++) {
                        if ($('meta')[i].attribs.property == 'og:description') {
                            odakyuPageKey = i;
                            console.log(odakyuPageKey);
                            resolve();
                        }
                    }
                });
            });
        }

        function keioPageSearch() {
            return new Promise((resolve, reject) => {
                client.fetch(keioUrl, function (err, $, response) {
                    for (let i = 0; i < $('meta').length; i++) {
                        if ($('meta')[i].attribs.property == 'og:description') {
                            keioPageKey = i;
                            console.log(keioPageKey);
                            resolve();
                        }
                    }
                });
            });
        }

        let checkInterval = function() {
            let check = setInterval(function() {
                client.fetch(odakyuUrl, function (err, $, response) {
                    let odakyuText = $('meta')[odakyuPageKey].attribs.content.split('（');
                    const odakyuMsg = '小田急線:' + odakyuText[0];
                    if (odakyuText[0] != '現在､事故･遅延に関する情報はありません。') {
                        hubot.messageRoom('train', odakyuMsg);
                        clearInterval(check);
                    } else {
                        //console.log(odakyuMsg);
                    }
                });

                client.fetch(keioUrl, function (err, $, response) {
                    let keioText = $('meta')[keioPageKey].attribs.content.split('（');
                    const keioMsg = '京王線:' + keioText[0];
                    if (keioText[0] != '現在､事故･遅延に関する情報はありません。') {
                        hubot.messageRoom('train', keioMsg);
                        clearInterval(check);
                    } else {
                        //console.log(keioMsg);
                    }
                });

                checkCount++;
                if (checkCount >= checkTimes) {
                    clearInterval(check);
                }
            }, 10000);
        }

        let pageSearchPromise = Promise.all([odakyuPageSearch(), keioPageSearch()]);

        pageSearchPromise
            .then(checkInterval);
    });

    hubot.hear('train', (res) => {
        function myReadFile(file) {
            return new Promise((resolve, reject) => {
                fs.readFile(userFilePath + file, 'utf8', (err, text) => {
                    const result = text.replace('\n', '');
                    resolve(result);
                });
            });
        }

        let messageSend = function(users) {
            return new Promise((resolve, reject) => {
                if (res.message.user.name == users[0]) {
                    client.fetch(keioUrl, function (err, $, response) {
                        for (let i = 0; i < $('meta').length; i++) {
                            if($('meta')[i].attribs.property == 'og:description') {
                                let keioText = $('meta')[i].attribs.content.split('（');
                                const keioMsg = '京王線：' + keioText[0];
                                hubot.messageRoom('train', keioMsg);
                            }
                        }
                    });
                } else if (res.message.user.name == users[1]) {
                    client.fetch(odakyuUrl, function (err, $, response) {
                        for (let i = 0; i < $('meta').length; i++) {
                            if($('meta')[i].attribs.property == 'og:description') {
                                let odakyuText = $('meta')[i].attribs.content.split('（');
                                const odakyuMsg = '小田急：' + odakyuText[0];
                                hubot.messageRoom('train', odakyuMsg);
                            }
                        }
                    });
                } else {
                    hubot.messageRoom('train', 'error');
                }
            });
        }

        let searchPromise = Promise.all([myReadFile('keio.user'), myReadFile('odakyu.user')]);

        searchPromise
            .then(messageSend);
    });
}
