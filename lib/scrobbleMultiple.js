const netease = require('NeteaseCloudMusicApi');
const {cookieToJson} = require('NeteaseCloudMusicApi/util');
const request = require('NeteaseCloudMusicApi/util/request');


netease.scrobble = function (data) {
    if (typeof data.cookie === 'string') {
        data.cookie = cookieToJson(data.cookie)
    }
    return scrobble(
        {
            ...data,
            cookie: data.cookie ? data.cookie : {},
        },
        request,
    )
}

let scrobble = (query, request) => {

    let logArr = new Array();
    for (let log of query.logs) {
        logArr.push({
            action: 'play',
            json: {
                download: 0,
                end: 'playend',
                id: log.id,
                sourceId: log.sourceid || '',
                time: log.time,
                type: 'song',
                wifi: 0,
            },
        })
    }
    const data = {
        logs: JSON.stringify(logArr),
    };

    return request('POST', `https://music.163.com/weapi/feedback/weblog`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
    });
};