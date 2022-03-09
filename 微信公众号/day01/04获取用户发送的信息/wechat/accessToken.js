/*
access_token：微信调用接口全局唯一凭证
特点:
    1.唯一
    2.有效期为2小时,提前5分钟重新请求
    3.接口权限 每天2000次
    https请求方式: GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

    设计思路:
        1.首次本地没有,发送请求获取access_token,保存下来(本地文件)
        2.第二次或以后:
            - 先去本地读取文件,判断它是否过期
                - 过期了
                    - 重新请求,保存下来,覆盖之前的文件(保证文件是唯一的)
                - 没过期
                    - 直接使用

        整理思路:
            读取本地文件(readAccessToken):
                - 本地有文件
                    - 判断它是否过期(isValidAccessToken)
                        - 过期了
                           - 重新请求(getAccessToken),保存下来,覆盖之前的文件(保证文件是唯一的)(saveAccessToken)
                        - 没过期
                           - 直接使用
                - 本地没有文件
                    - 发送请求获取access_token(getAccessToken),保存下来(本地文件)(saveAccessToken)
 */
//只需要引入request-promise-native库
const rp = require('request-promise-native');

//引入fs模块
const {writeFile, readFile} = require('fs');

//引入config文件
const {appID, appsecret} = require('../config');

//定义一个类,获取access_token
class Wechat {
    constructor() {
    }

    /*
    用来获取access_token
     */
    getAccessToken() {
        //定义请求的地址
        const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appID + '&secret=' + appsecret;
        //发送请求
        /*
        需要下载俩个库
        request
        request-promise-native 返回值是一个promise对象
         */
        return new Promise((resolve, reject) => {
            rp({method: 'GET', url, json: true})
                .then(res => {
                    console.log(res);
                    /*
                    {
                      access_token: '53_ASJAH4U8r3yuEZFT4NCdzgLcBZN-W0rPy-0sBU0bizFlnxrXJ8rl8VxCZqllW8A_MZTTYr3eNnQN8GX-TUv4vuB-YuHde5BLlNN38fK-pb0ZujB7yE-5XwkX5NBX7bEA-yY7v2V2Wu8W-G
    SASVHcAFAKNZ',
                      expires_in: 7200
    }
                     */
                    //设置access_token的过期时间 单位毫秒
                    res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
                    //将promise的对象的状态改为成功的状态
                    resolve(res);
                })
                .catch(err => {
                    console.log(err);
                    reject('getAccessToken方法出了问题:' + err);
                })
        })
    }

    /**
     * 用来保存access_token的方法
     * @param accessToken 要保存的凭据
     */
    saveAccessToken(accessToken) {
        //将对象转化为json字符串
        accessToken = JSON.stringify(accessToken);
        return new Promise((resolve, reject) => {
            writeFile('./accessToken.txt', accessToken, err => {
                if (!err) {
                    console.log('文件保存成功');
                    resolve();
                } else {
                    reject('saveAccessToken方法出了问题:' + err);
                }
            })
        })
    }

    /**
     * 用来读取access_token的方法
     */
    readAccessToken() {
        //读取本地文件中的access_taken
        return new Promise((resolve, reject) => {
            readFile('./accessToken.txt', (err, data) => {
                if (!err) {
                    console.log('文件读取成功');
                    //将json字符串转化成js对象
                    data = JSON.parse(data);
                    resolve(data);
                } else {
                    reject('readAccessToken方法出了问题:' + err);
                }
            })
        })
    }

    /**
     * 用来检查access_token是否有效
     * @param data
     */
    isValidAccessToken(data) {
        //检查传入的参数是否有效
        if (!data && !data.access_token && !data.expires_in) {
            //代表access_token无效
            return false;
        }

        //检查传入的参数是否在有效期内
        // if (data.expires_in<Date.now()){
        //     //过期了
        //     return false;
        // }else {
        //     //没有过期
        //     return true;
        // }

        return data.expires_in > Date.now();
    }

    /**
     * 用来获取没有过期的access_token
     * @returns {Promise<unknown>} access_token
     */
    fetchAccessToken() {
        //优化
        if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
            //说明之前保存过access_token,并且access_token有效,直接使用
            return Promise.resolve({
                access_token: this.access_token,
                expires_in: this.expires_in
            })
        }
        return this.readAccessToken()
            .then(async res => {
                //本地有文件
                //判断它是否过期(isValidAccessToken)
                if (this.isValidAccessToken(res)) {
                    //有效的
                    return Promise.resolve(res);
                    //resolve(res);
                } else {
                    //过期了
                    //发送请求获取access_token(getAccessToken)
                    const res = await this.getAccessToken();
                    //保存下来(本地文件)(saveAccessToken)
                    await this.saveAccessToken(res);
                    //将请求回来的access_token返回出去
                    return Promise.resolve(res);
                    // resolve(res);
                }
            })
            .catch(async err => {
                //本地没有文件
                //发送请求获取access_token(getAccessToken)
                const res = await this.getAccessToken();
                //保存下来(本地文件)(saveAccessToken)
                await this.saveAccessToken(res);
                //将请求回来的access_token返回出去
                return Promise.resolve(res);
                // resolve(res);
            })
            .then(res => {
                //将access_token挂载到this上
                this.access_token = res.access_token;
                this.expires_in = res.expires_in;
                //返回res包装了一层promise对象(此对象为成功的对象)
                //是this.readAccessToken()最终返回值
                return Promise.resolve(res);
            })
    }
}

//模拟测试
const w = new Wechat();
/*
  读取本地文件(readAccessToken):
       - 本地有文件
           - 判断它是否过期(isValidAccessToken)
               - 过期了
                  - 重新请求(getAccessToken),保存下来,覆盖之前的文件(保证文件是唯一的)(saveAccessToken)
               - 没过期
                  - 直接使用
       - 本地没有文件
           - 发送请求获取access_token(getAccessToken),保存下来(本地文件)(saveAccessToken)
 */

