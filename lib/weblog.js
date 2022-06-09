const netease = require('NeteaseCloudMusicApi');
const {cookieToJson} = require('NeteaseCloudMusicApi/util');
const request = require('NeteaseCloudMusicApi/util/request');


netease.weblog = function (data) {
    if (typeof data.cookie === 'string') {
        data.cookie = cookieToJson(data.cookie)
    }
    return weblog(
        {
            ...data,
            cookie: data.cookie ? data.cookie : {},
        },
        request,
    )
}

let weblog = (query, request) => {

    const data = {
        logs: JSON.stringify(query.logs),
    };

    return request('POST', `https://music.163.com/weapi/feedback/weblog`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
    });
};