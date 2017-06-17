/**
 * Created by xaiodoudou on 2017/3/19.
 */
const express = require('express'),
    router = express.Router(),
    sql = require('../module/mysql'),
     crypto = require('crypto');
var upload = require('../module/upload');
// get post 任何形式的访问都会走这一条路由
router.use((req,res,next) => {
    if(req.session.admin){
        res.locals.admin =req.session.admin;
        res.locals.id=res.locals.nowid;
        next()
    }else{

        res.send('请用管理员账号登陆')
    }
});
router.get('/',(req,res) =>{
    res.render('admin/admin_index');
});
router.get('/user',(req,res) => {
    sql('SELECT * FROM user',(err,data) => {
        res.render('admin/admin_user',{
            data:data
        })
    });
});
router.get('/article',(req,res) => {
   res.render('admin/article');
});

router.get('/article/list-:page.html',(req,res)=>{

    sql('select * from article order by id desc limit ?,12',[(req.params.page-1)*12],(err,data)=>{
        if(err){
            console.log(err);
        }else{
            if(data.length === 0){
                res.send(err)
            }else{
                sql('select * from article',(err,alldata)=>{
                    res.render('admin/article_gl',{data:data,alldata:alldata,page:req.params.page});
                })

            }

        }
    })
})
router.post('/delete',(req,res)=>{

    var de_id=Number(req.body["id"]);
    if(de_id=req.body['nowid']){
        res.send("你不能删除已登录账户");
    }else{
        sql('delete from user where id=?',[de_id],(err,data)=>{
            console.log("删除成功");
            res.json({
                success:"成功",
            })
        });
    }
});
router.post('/xiugai',(req,res)=>{
    var md5 = crypto.createHash('md5');
    var de_id=req.body.id;
    var username=req.body.reusername;
    var pass=req.body.repassword;
    var admin=Number(req.body.Isadmin);
    var newpass = md5.update(pass).digest('hex');
    var upload = require('../module/multer');

})
router.post('/article',upload.single('fengmain') ,(req,res)=>{
    var content=req.body.content,
        title=req.body.title,
        info=req.body.info,
        author=req.body.author,
        zaiyao=req.body.zaiyao,
        fengmian = '/img/' + req.file.filename,
        time=new Date().toLocaleString(),
      /*  time2=new Date().toLocaleString().substring(0,10);2017-3-23*/
        info=req.body.info,
        isView=req.body.isView;

 sql('insert into article (id,title,author,info,content,fengmian,time,zaiyao,fangwen,isView) values (0,?,?,?,?,?,?,?,0,?)',[title,author,info,content,fengmian,time,zaiyao,isView],(err,data)=>{
        if(err){
            console.log(err);
        }else{
            res.render('admin/article')
            console.log('发布成功');
        }
    })
})
module.exports = router;