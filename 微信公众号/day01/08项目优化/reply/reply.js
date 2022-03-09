/*
处理用户发送的消息的类型和内容,决定返回不同的内容给用户
 */

module.exports = message => {
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
        if (message.Content === '1') {//全匹配
            content = '你好!!';
        } else if (message.Content === '2') {
            content = 'hello~~';
        } else if (message.Content.match('爱')) {//半匹配
            content = '我爱你';
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