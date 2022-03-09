//引入menu模块
const menu = require('./menu');
//只需要引入request-promise-native库
const rp = require('request-promise-native');
//引入api模块
const api = require('../utils/api')
//引入工具函数
const {writeFileAsync, readFileAsync} = require('../utils/tool');
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
        const url = `${api.accessToken}&appid=${appID}&secret=${appsecret}`;
        //发送请求
        return new Promise((resolve, reject) => {
            rp({method: 'GET', url, json: true})
                .then(res => {
                    console.log(res);
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
        return writeFileAsync(accessToken, 'access_token.txt');
    }

    /**
     * 用来读取access_token的方法
     */
    readAccessToken() {
        return readFileAsync('access_token.txt')
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

    /*
    用来获取jsapi_ticket
     */
    getTicket() {
        //发送请求
        return new Promise(async (resolve, reject) => {
            //获取access_token
            const data = await this.fetchAccessToken();
            //定义请求的地址
            const url = `${api.ticket}&access_token=${data.access_token}`;
            rp({method: 'GET', url, json: true})
                .then(res => {
                    //将promise的对象的状态改为成功的状态
                    resolve({
                        ticket: res.ticket,
                        expires_in: Date.now() + (res.expires_in - 300) * 1000
                    });
                })
                .catch(err => {
                    console.log(err);
                    reject('getTicket方法出了问题:' + err);
                })
        })
    }

    /**
     * 用来保存jsapi_ticket的方法
     * @param ticket 要保存的票据
     */
    saveTicket(ticket) {
        return writeFileAsync(ticket, 'ticket.txt');
    }

    /**
     * 用来读取ticket的方法
     */
    readTicket() {
        return readFileAsync('ticket.txt')
    }

    /**
     * 用来检查ticket是否有效
     * @param data
     */
    isValidTicket(data) {
        //检查传入的参数是否有效
        if (!data && !data.ticket && !data.expires_in) {
            //代表ticket无效
            return false;
        }
        return data.expires_in > Date.now();
    }

    /**
     * 用来获取没有过期的ticket
     * @returns {Promise<unknown>} ticket
     */
    fetchTicket() {
        //优化
        if (this.ticket && this.ticket_expires_in && this.isValidTicket(this)) {
            //说明之前保存过ticket,并且ticket有效,直接使用
            return Promise.resolve({
                ticket: this.ticket,
                expires_in: this.expires_in
            })
        }
        return this.readTicket()
            .then(async res => {
                //本地有文件
                //判断它是否过期(isValidTicket)
                if (this.isValidTicket(res)) {
                    //有效的
                    return Promise.resolve(res);
                } else {
                    //过期了
                    const res = await this.getTicket();
                    //保存下来(本地文件)(saveTicket)
                    await this.saveTicket(res);
                    //将请求回来的access_token返回出去
                    return Promise.resolve(res);
                }
            })
            .catch(async err => {
                //本地没有文件
                const res = await this.getTicket();
                await this.saveTicket(res);
                return Promise.resolve(res);
            })
            .then(res => {
                //将ticket挂载到this上
                this.ticket = res.ticket;
                this.ticket_expires_in = res.expires_in;
                //返回res包装了一层promise对象(此对象为成功的对象)
                return Promise.resolve(res);
            })
    }

    /**
     * 用来创建自定义菜单
     * @param menu 菜单的对象
     * @returns {Promise<unknown>}
     */
    createMenu(menu) {
        return new Promise(async (resolve, reject) => {
            try {
                //获取access_token
                const data = await this.fetchAccessToken();
                //定义请求地址
                const url = `${api.menu.create}access_token=${data.access_token}`;
                //发送请求
                const result = await rp({method: 'POST', url, json: true, body: menu});
                resolve(result);
            } catch (e) {
                reject('createMenu方法出了问题:' + e);
            }
        })
    }

    /**
     * 用来删除自定义菜单
     * @returns {Promise<unknown>}
     */
    deleteMenu() {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.fetchAccessToken();
                //定义请求地址
                const url = `${api.menu.delete}access_token=${data.access_token}`;
                //发送请求
                const result = await rp({method: 'GET', url, json: true});
                resolve(result);
            } catch (e) {
                reject('deleteMenu方法出了问题:' + e);
            }
        })
    }
}

/*(async ()=>{
    const w=new Wechat();
    /!*!//删除之前定义的菜单
    let result = await w.deleteMenu();
    console.log(result);
    //创建新的菜单
    result = await w.createMenu(menu);
    console.log(result);*!/
    const data = await w.fetchTicket();
    console.log(data);
})()*/

module.exports = Wechat;