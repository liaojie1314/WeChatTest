//引入express模块
const express = require('express');
//引入sha1加密
const sha1 = require('sha1');
//引入config文件
const {url} = require("../config");
//引入wechat模块
const Wechat = require("../wechat/wechat");
//引入reply模块
const reply = require("../reply");
//获取Router
const Router = express.Router;
//创建路由器对象
const router = new Router();
//创建实例对象
const wechatApi = new Wechat();
//页面路由
router.get('/search', async (req, res) => {
    //生成js-sdk需要使用的签名：
    //随机字符串
    const noncestr = Math.random().split('.')[1];
    //时间戳
    const timestamp = Date.now();
    //获取票据
    const {ticket} = await wechatApi.fetchTicket();
    //1.组合参与签名的4个参数:jsapi_ticket(临时票据),noncestr(随机字符串),timestamp(时间戳),url(当前服务器地址)
    const arr = [
        `jsapi_ticket=${ticket}`,
        `noncestr=${noncestr}`,
        `timestamp=${timestamp}`,
        `url=${url}/search`
    ]
    //2.将其进行字典连续,并以'&'拼接在一起
    const str = arr.sort().join('&');
    console.log(str);//xxx=xxx&xxx=xxx&xxx=xxx
    //3.进行sha1加密,最终生成想要的signature
    const signature = sha1(str);
    //渲染页面,将渲染好的页面返回给用户
    res.render('search', {
        signature,
        noncestr,
        timestamp
    });
})
//接收处理所有参数
router.use(reply())
//将路由器对象暴露出去
module.exports = router;