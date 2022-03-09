//引入qiniu
const qiniu = require('qiniu');
//个人中心->秘钥管理
var accessKey = 'YICil0srHhVT2mh7FJxWq1UHlvf85dZGDgO91LW6';
var secretKey = 'VXosWO-vuJmua24qeewE5ixiNDkyqFpEC5sd1Bx4'
//定义鉴权对象
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
//定义配置对象
var config = new qiniu.conf.Config();
//存储区域   z0 -- 华东  z1 -- 华北  z2 -- 华南
config.zone = qiniu.zone.Zone_z2;
//bucketManager对象上就有所有方法
var bucketManager = new qiniu.rs.BucketManager(mac, config);
const bucket = 'wechat-movie-pic';
module.exports = (resUrl, key) => {
    /*
    resUrl  网络资源地址
    bucket  存储空间名称
     */
    return new Promise((resolve, reject) => {
        bucketManager.fetch(resUrl, bucket, key, function (err, respBody, respInfo) {
            if (err) {
                console.log(err);
                //throw err;
                reject('上传图片方法出了问题' + err);
            } else {
                if (respInfo.statusCode == 200) {
                    console.log('文件上传成功');
                    resolve();
                }
            }
        });
    })
}