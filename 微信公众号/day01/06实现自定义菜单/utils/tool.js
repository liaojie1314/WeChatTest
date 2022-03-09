/*
工具函数包
 */
//npm install xml2js 导包
//引入xml2js,将xml数据转化为js对象
const {parseString} = require('xml2js');

module.exports = {
    getUserDataAsync(req) {
        return new Promise((resolve, reject) => {
            let xmlData = '';
            req
                .on('data', data => {
                    //当流式数据传递过来时会触发当前事件,会将数据注入到回调函数中
                    // console.log(data);
                    //读取的数据是buffer,需要将其转化为字符串
                    xmlData += data.toString();
                })
                .on('end', () => {
                    //当数据接收完毕时,会触发当前
                    resolve(xmlData);
                })
        })
    },

    parseXMLAsync(xmlData) {
        return new Promise((resolve, reject) => {
            parseString(xmlData, {trim: true}, (err, data) => {
                if (!err) {
                    resolve(data);
                } else {
                    reject('parseXMLAsync方法出了问题:' + err);
                }
            })
        })
    },

    formatMessage(jsData) {
        let message = {};
        //获取xml对象
        jsData = jsData.xml;
        //判断数据是否为一个对象
        if (typeof jsData === 'object') {
            //遍历对象
            for (let key in jsData) {
                //获取属性值
                let value = jsData[key];
                //过滤空数据
                if (Array.isArray(value) && value.length > 0) {
                    //将合法数据赋值到message对象上
                    message[key] = value[0];
                }
            }
        }
        return message;
    }
}