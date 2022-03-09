/*
将数据库中的图片上传到七牛
 */
//模型对象
const Theaters = require('../../model/Theaters');
//上传图片到七牛方法
const upload = require('./upload');
//生成唯一的key值
const {nanoid} = require('nanoid');
module.exports = async () => {
    /*
    1.获取数据库中的图片链接
    2.上传到七牛
    3.保存key值到数据库中
     */
    //去数据库中所有没有上传图片的文档对象
    //const movies = await Theaters.find({posterKey: {$in: ['', null, {$exists: false}]}})
    const movies = await Theaters.find({
        $or: [
            {posterKey: ''},
            {posterKey: null},
            {posterKey: {$exists: false}}
        ]
    })

    //遍历每一条数据
    for (let i = 0; i < movies.length; i++) {
        //获取每一个文档对象
        let movie = movies[i];
        //上传到七牛中
        let url = movie.image;
        let key = `${nanoid(10)}.jpg`;
        await upload(url, key);
        //保存key值到数据库中
        movie.posterKey = key;
        await movie.save();
    }
}