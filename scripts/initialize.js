(function(){
    'use strict';
    const exec = require('child_process').exec;
    const file = require('fs');
    let hubotProcessID = 0;
    exec('ps aux | grep hubot | grep slack', (error, stdout, stderr) => {
        if (stdout) {
            const ps = stdout.split(" ");
            hubotProcessID = ps[1];
