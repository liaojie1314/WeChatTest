//引入express模块
const express = require('express');
//引入sha1模块
const sha1 = require('sha1');
//创建app应用对象
const app = express();
//验证服务器的有效性
/*
1.微信服务器直到开发者服务器是哪个
- 测试号管理器上填写url开发者服务器地址
    -使用ngrok 内网穿透 将本地端口号开启的服务映射为外网可以访问的网址
    - ngrok http 3000
- Token
    - 参与微信签名加密的一个参数
2.开发者服务器 -验证消息是否来自微信服务器
    目的:计算得出signature微信加密签名,和微信传递过来的signature进项对比,如果一样说明消息来自于微信服务器,如果不一样说明表示不是微信服务器发送的消息
    1.将参与微信加密签名的三个参数(timestamp,nonce,token)组合在一起,按照字典序排序(0-9,a-z)形成一个数组
    2.将数组里所有参数拼接成一个字符串,进行sha1加密
    3.加密完成就生成了一个signature,和微信传递过来的signature进项对比,
    如果一样说明消息来自于微信服务器,返回echostr给微信服务器
    如果不一样说明表示不是微信服务器发送的消息,返回error
 */
//定义配置对象
const config = {
    token: 'jiou8u9kj7898hfdsjh',
    appID: 'wxd9cdd2f13c019b6d',
    appsecret: 'e20d300ba49919efdbb5e9bdbf59c267'
}
//接收处理所有参数
app.use((req, res, next) => {
    //微信服务器提交的参数
    //console.log(req.query);
    /*
    {
  signature: 'b1aa8310591a7c32cb33eaf6e5d3e372dc59ce53',    //微信的加密签名
  echostr: '3795600641569419083',   //微信的随机字符串
  timestamp: '1642934025',  //微信发送请求的时间戳
  nonce: '62739463' //微信的随机数字
}
     */

    const {signature, echostr, timestamp, nonce} = req.query;
    const {token} = config;

//1.将参与微信加密签名的三个参数(timestamp,nonce,token)组合在一起,按照字典序排序(0-9,a-z)形成一个数组

    const arr = [timestamp, nonce, token];
    const arrSort = arr.sort();
    console.log(arrSort)

//2.将数组里所有参数拼接成一个字符串,进行sha1加密

    const str = arr.join('');
    console.log(str);
    const sha1Str = sha1(str);
    console.log(signature);
    console.log(sha1Str);


//3.加密完成就生成了一个signature,和微信传递过来的signature进项对比,

    if (sha1Str === signature) {
        //如果一样说明消息来自于微信服务器,返回echostr给微信服务器
        res.send(echostr);
    } else {
        //如果不一样说明表示不是微信服务器发送的消息,返回error
        res.end('error');
    }
})


//监听端口号
app.listen(3000, () => console.log('服务器启动成功'));