module.exports = (hubot) => {
    hubot.hear('what time', (res) => {
        const date = new Date();
        let day = '';
        switch (date.getDay()) {
            case 1: day = '月';break;
            case 2: day = '火';break;
            case 3: day = '水';break;
            case 4: day = '木';break;
            case 5: day = '金';break;
            case 6: day = '土';break;
            case 7: day = '日';break;
            default: console.log("Day Error");
        }
        res.send(date.getFullYear() +'年'
                + (date.getMonth() + 1) +'月'
                + date.getDate() +'日\(' + day + '\) ' 
                + date.getHours() + '時' 
                + date.getMinutes() + '分');

    });

}
