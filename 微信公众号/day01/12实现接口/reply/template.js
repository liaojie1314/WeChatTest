/*
加工处理最终回复用户消息的模板(xml数据)
mediaID:上传素材得到
 */
module.exports = options => {
    let replayMessage = '<xml>' +
        '<ToUserName><![CDATA[' + options.toUserName + ']]></ToUserName>' +
        '<FromUserName><![CDATA[' + message.fromUserName + ']]></FromUserName>' +
        '<CreateTime>' + options.createTime + '</CreateTime>' +
        '<MsgType><![CDATA[' + options.msgType + ']]></MsgType>';
    if (options.msgType === 'text') {
        replyMessage += '<Content><![CDATA[' + options.content + ']]></Content>';
    } else if (options.msgType === 'image') {
        replyMessage += '<Image><MediaId><![CDATA[' + options.mediaID + ']]></MediaId></Image>';
    } else if (options.msgType === 'voice') {
        replyMessage += '<Voice><MediaId><![CDATA[' + options.mediaID + ']]></MediaId></Voice>';
    } else if (options.msgType === 'video') {
        replyMessage += '<Video>' +
            '<MediaId><![CDATA[' + options.mediaID + ']]></MediaId>' +
            '<Title><![CDATA[' + options.title + ']]></Title>' +
            '<Description><![CDATA[' + options.description + ']]></Description>' +
            '</Video>';
    } else if (options.msgType === 'music') {
        replyMessage += '<Music>' +
            '<Title><![CDATA[' + options.title + ']]></Title>' +
            '<Description><![CDATA[' + options.description + ']]></Description>' +
            '<MusicUrl><![CDATA[' + options.musicUrl + ']]></MusicUrl>' +
            '<HQMusicUrl><![CDATA[' + options.hpMusicUrl + ']]></HQMusicUrl>' +
            '<ThumbMediaId><![CDATA[' + options.mediaID + ']]></ThumbMediaId>' +
            '</Music>';
    } else if (options.msgType === 'news') {
        replyMessage += '<ArticleCount>' + options.content.length + '</ArticleCount>' +
            '<Articles>';

        options.content.forEach(item => {
            replyMessage += '<item>' +
                '<Title><![CDATA[' + item.title + ']]></Title>' +
                '<Description><![CDATA[' + item.description + ']]></Description>' +
                '<PicUrl><![CDATA[' + item.picUrl + ']]></PicUrl>' +
                '<Url><![CDATA[' + item.url + ']]></Url>' +
                '</item>';
        })
        replayMessage += '</Articles>';
    }
    replayMessage += '</xml>';
    return replayMessage;
}