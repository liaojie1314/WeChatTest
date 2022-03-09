/*
处理用户发送的消息的类型和内容,决定返回不同的内容给用户
 */
//引入rp
const rp = require('request-promise-native');

//引入Theaters
const Theaters = require('../model/Theaters');
//引入config
const {url} = require('../config');

module.exports = async message => {
    let options = {
        toUserName: message.FromUserName,
        fromUserName: message.ToUserName,
        createTime: Date.now(),
        magType: 'text'
    }

    let content = '你在说什么?';
    //判断用户发送的消息是不是文本消息
    if (message.MsgType === 'text') {
        //判断用户发送的内容具体是什么
        if (message.Content === '热门') {//全匹配
            //回复用户热门电影数据
            const data = await Theaters.find({}, {title: 1, summary: 1, image: 1, doubanId: 1, _id: 0});
            //将回复内容改为空数组
            content = [];
            options.msgType = 'news';
            //通过变量将数据添加进去
            for (var i = 0; i < data.length; i++) {
                let item = data[i];
                content.push({
                    title: item.title,
                    description: item.summary,
                    picUrl: `http://r6v3vcdm2.hn-bkt.clouddn.com/${item.posterKey}`,
                    url: `${url}/detail/${item.doubanId}`
                })
            }

        } else if (message.Content === '2') {
            content = 'hello~~';
        } else if (message.Content.match('爱')) {//半匹配
            content = '我爱你';
        } else {
            //搜索用户输入指定电影信息
            //定义请求地址
            //const url = `https://api.douban.com/v2/movie/search?q=${message.Content}&count=8`;
            const url = 'https://api.douban.com/v2/movie/search';
            //发送请求
            const {subjects} = await rp({method: 'GET', url, json: true, qs: {q: message.Content, count: 8}});
            //判断subjects是否有值
            if (subjects && subjects.length) {
                //有数据,返回一个图文消息给用户
                //将回复内容改为空数组
                content = [];
                options.msgType = 'news';
                //通过变量将数据添加进去
                for (var i = 0; i < subjects.length; i++) {
                    let item = subjects[i];
                    content.push({
                        title: item.title,
                        description: `电影评分为:${item.rating.average}`,
                        picUrl: item.image.small,
                        url: item.alt
                    })
                }

            } else {
                //无数据
                content = "暂时没有电影信息";
            }
        }
    } else if (message.MsgType === 'image') {
        options.msgType = 'image';
        options.mediaID = message.MediaId;
        console.log(message.PicUrl);
    } else if (message.MsgType === 'voice') {
        options.msgType = 'voice';
        options.mediaID = message.MediaId;
        console.log(message.Recognition);
    } else if (message.MsgType === 'location') {
        content = '维度:' + message.Location_X + ' 经度:' + message.Location_Y + ' 缩放大小:' + message.Scale
            + ' 位置信息:' + message.Label;
        console.log(message.PicUrl);
    } else if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            //用户订阅事件
            content = "感谢您的订阅";
            if (message.EventKey) {
                content = '用户扫描了带参数的二维码关注事件';
            }
        } else if (message.Event === 'unsubscribe') {
            console.log('无情取关');
        } else if (message.Event === 'SCAN') {
            content = '用户已经关注,再次扫描了带参数的二维码关注事件';
        } else if (message.Event === 'LOCATION') {
            content = '维度:' + message.Latitude + ' 经度:' + message.Longitude + ' 精度:' + message.Precision;
        } else if (message.Event === 'CLICK') {
            content = '你点击了按钮:' + message.EventKey;
        }
    }

    options.content = content;

    return options;
}