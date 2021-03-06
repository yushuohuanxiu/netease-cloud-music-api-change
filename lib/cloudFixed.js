const netease = require('NeteaseCloudMusicApi');
const {cookieToJson} = require('NeteaseCloudMusicApi/util');
const request = require('NeteaseCloudMusicApi/util/request');
const uploadPlugin = require('NeteaseCloudMusicApi/plugins/songUpload');
const mm = require('music-metadata');
const md5 = require('md5');


netease.cloud = function (data) {
    if (typeof data.cookie === 'string') {
        data.cookie = cookieToJson(data.cookie)
    }
    return cloud(
        {
            ...data,
            cookie: data.cookie ? data.cookie : {},
        },
        request,
    )
}

let cloud = async (query, request) => {
    let ext = 'mp3'
    if (query.songFile.name.indexOf('flac') > -1) {
        ext = 'flac'
    }
    query.cookie.os = 'pc'
    query.cookie.appver = '2.9.7'
    const bitrate = 999000
    if (!query.songFile) {
        return Promise.reject({
            status: 500,
            body: {
                msg: '请上传音乐文件',
                code: 500,
            },
        });
    }
    if (!query.songFile.md5) {
        // 命令行上传没有md5和size信息,需要填充
        query.songFile.md5 = md5(query.songFile.data)
        query.songFile.size = query.songFile.data.byteLength
    }
    const res = await request(
        'POST',
        `https://interface.music.163.com/api/cloud/upload/check`,
        {
            bitrate: String(bitrate),
            ext: '',
            length: query.songFile.size,
            md5: query.songFile.md5,
            songId: '0',
            version: 1,
        },
        {
            crypto: 'weapi',
            cookie: query.cookie,
            proxy: query.proxy,
            realIP: query.realIP,
        },
    )
    let artist = ''
    let album = ''
    let songName = ''
    try {
        const metadata = await mm.parseBuffer(
            query.songFile.data,
            'audio/mpeg',
        )
        const info = metadata.common
        if (info.title) {
            songName = info.title
        }
        if (info.album) {
            album = info.album
        }
        if (info.artist) {
            artist = info.artist
        }
    } catch (error) {
        console.log(error)
    }
    if (res.body.needUpload) {
        const uploadInfo = await uploadPlugin(query, request)
    }
    const res2 = await request(
        'POST',
        `https://music.163.com/api/upload/cloud/info/v2`,
        {
            md5: query.songFile.md5,
            songid: res.body.songId,
            filename: query.songFile.name,
            song: songName || query.songFile.name,
            album: album || '未知专辑',
            artist: artist || '未知艺术家',
            bitrate: String(bitrate),
        },
        {
            crypto: 'weapi',
            cookie: query.cookie,
            proxy: query.proxy,
            realIP: query.realIP,
        },
    )
    const res3 = await request(
        'POST',
        `https://interface.music.163.com/api/cloud/pub/v2`,
        {
            songid: res2.body.songId,
        },
        {
            crypto: 'weapi',
            cookie: query.cookie,
            proxy: query.proxy,
            realIP: query.realIP,
        },
    )
    return {
        status: 200,
        body: {
            ...res.body,
            ...res3.body,
            // ...uploadInfo,
        },
        cookie: res.cookie,
    }
}