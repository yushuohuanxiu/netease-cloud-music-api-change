const netease = require('NeteaseCloudMusicApi');
const {cookieToJson} = require('NeteaseCloudMusicApi/util');
const request = require('NeteaseCloudMusicApi/util/request');


netease.weapi = function (data) {
    if (typeof data.cookie === 'string') {
        data.cookie = cookieToJson(data.cookie)
    }
    return weapi(
        {
            ...data,
            cookie: data.cookie ? data.cookie : {},
        },
        request,
    )
}

let weapi = (query, request) => {


    return request('POST', `https://music.163.com/weapi/` + query.url, query.data || {}, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
    });
};