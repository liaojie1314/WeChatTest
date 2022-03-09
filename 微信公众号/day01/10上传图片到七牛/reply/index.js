//引入config模块
const config = require("../config");
//引入template模块
const template = require("./template");
//引入reply模块
const reply = require("./reply");
//引入sha1模块
const sha1 = require("sha1");
//引入tool模块
const {getUserDataAsync, parseXMLAsync, formatMessage} = require('../utils/tool');
/*
验证服务器有效性的模块
 */
module.exports = () => {
    return async (req, res, next) => {
        //微信服务器提交的参数
        //console.log(req.query);

        const {signature, echostr, timestamp, nonce} = req.query;
        const {token} = config;
        const sha1str = sha1([timestamp, nonce, token].sort().join(""));

        /*
        微信服务器会发送俩种类型的消息给开发者
        1.GET请求
            - 验证服务器的有效性
        2.POST请求
            - 微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器
         */
        if (req.method === 'GET') {
            //3.加密完成就生成了一个signature,和微信传递过来的signature进项对比,

            if (sha1Str === signature) {
                //如果一样说明消息来自于微信服务器,返回echostr给微信服务器
                res.send(echostr);
            } else {
                //如果不一样说明表示不是微信服务器发送的消息,返回error
                res.end('error');
            }
        } else if (req.method === 'POST') {
            //微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器
            //验证消息来自于微信服务器
            if (sha1str !== signature) {
                //说明消息不是微信服务器的
                res.end('error');
            }
            // console.log(req.query);
            //接收请求体中的数据,流式数据

            const xmlData = await getUserDataAsync(req);

            // console.log(xmlData);
            //将xml数据解析为js对象
            const jsData = await parseXMLAsync(xmlData);
            // console.log(jsData);
            //格式化数据
            const message = formatMessage(jsData);

            //将reply改为了async函数,返回值变为了promise对象
            //必须用await关键字才能拿到最终的返回值
            const options = await reply(message);
            //最终回复用户的消息
            const replyMessage = template(options);
            //返回响应给微信服务器
            res.send(replyMessage);

            //如果开发者服务器没有返回响应给微信服务器,微信服务器会发送三次请求过来
            // res.end('');
        } else {
            res.end('error');
        }
    }
}