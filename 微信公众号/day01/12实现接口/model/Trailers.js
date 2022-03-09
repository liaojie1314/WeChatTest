//引入mongoose
const mongoose = require('mongoose');
//获取Schema
const Schema = mongoose.Schema;
//创建约束对象
const trailersSchema = new Schema({
    title: String,
    runtime: String,
    directors: String,
    casts: [String],
    image: String,
    doubanId: {
        type: Number,
        unique: true
    },
    genre: [String],
    cover: String,
    summary: String,
    releaseDate: String,
    link:String,
    posterKey: String,//图片上传到七牛中返回的key值
    coverKey: String,//视频封面图
    videoKey: String,//预告片
    createTime: {
        type: Date,
        default: Date.now()
    }
})
//创建模型对象
const Trailers = mongoose.model('Trailers', trailersSchema);
//暴露出去
module.exports = Trailers;