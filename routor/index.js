/**
 * Created by xaiodoudou on 2017/3/19.
 */
var express=require('express');
var router=express.Router();
var sql=require('../module/mysql');
var  crypto = require('crypto');
//首页
router.get('/',(req,res)=> {
    res.locals.admin =req.session.admin;
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article order by id desc')
    ]
    Promise.all(arr).then(function(data){
        res.render('index',{newdata:data[0]});
    })
})
//文章删除
router.post('/user/updata_user/delete',(req,res)=>{
});
/*注册*/
router.post('/rei',(req,res)=>{
    var name=req.body.username;
    var password=req.body.password;
    var repassword=req.body.repassword;
    //设置加密编码
    var md5 = crypto.createHash('md5');
    if(name==''){
        console.log('用户名不能为空');
        //res.redirect('/index/error');//执行跳转
        res.send('用户名不能为空');
        return
    }
    if(password==''){
        console.log('密码不能为空');
        //res.redirect('/index/error');//执行跳转
        res.send('密码不能为空');
        return
    }if(repassword!=password){
        console.log('密码不一致');
        res.send('密码不一致');
        //res.redirect('/index/error');//执行跳转
        return
    }
    sql('select * from user where username=?',[name],(err,data)=>{
        if(err){
            console.log(err);
        }else{
            if( data.length==0){
                //记录加密后的数据
                let newpass = md5.update(password).digest('hex');
                sql('insert into user (`id`,`username`,`pass`,`admin`) value(0,?,?,0)',[name,newpass],(err,data)=>{
                    res.json({
                        success:'成功'
                    })
                })
            }else{
                res.send('失败');
            }
        }
    })

})
/*登录*/
router.get('/loginIn',(req,res)=>{
    res.render('login');
})
router.post('/login',(req,res)=>{
    const user = req.body.username,
        password = req.body.password,
        md5 = crypto.createHash('md5');
    sql('SELECT * FROM user where username = ?',[user],(err,data) => {
        if(data.length == 0){
            res.send('用户名不存在');
            return
        }
        let newpass = md5.update(password).digest('hex');
        if(data[0]['pass'] == newpass){
            res.cookie('login',{ name:user,id:data[0]['id']} ,{ maxAge: 1000*60*60*24 } );
            res.json({
                result:'成功'
            });
        }else{
            // 登陆失败
            res.send('错误')
        }
    })
});
/*登出*/
router.get('/logout',(req,res)=>{
    res.clearCookie('login');// 清除cookie
    res.redirect('/');// 网址重定向
});
//文章显示
router.get('/article/:id.html',(req,res)=>{
    //fn为promise的应用
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    var articleId=Number(req.params.id);
    arr=[
        fn('select * from article where id=?',[articleId]),
        fn('select * from article order by id desc limit 0,30'),
        fn('select * from comment where articleId=? order by id desc limit 0,5',[articleId]),
    ]
    Promise.all(arr).then(function(data){
        if(data[0].length==0){
            //status()设置状态码
            res.status(404).render('404');
            return
        }else{
            var fengwen=Number(data[0][0]['fangwen'])+1;
            sql('UPDATE `article` SET `fangwen`=? WHERE `id`=?',[fengwen,data[0][0]['id']],(err,rdata)=>{
                if(err){
                    console.log(err);
                }else{
                    var aticleId=Number(req.params.id);
                    var arr=[[]];
                    res.render('article_show',{data:data,aticleId:aticleId,data2:arr});

                }
            });
        }
    })
});
//文章搜索
router.post('/comment_page',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
   var  articleId=Number(req.body.articleId);
 sql('select * from comment where articleId=? order by id desc limit 5,?',[articleId,showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
          res.json({
              data_more:data
          })

        }

    })
})
router.post('/search',(req,res)=>{
    var search_result=req.body.search_result;

    sql(`select * from article where title like ? limit 0,8`,['%'+search_result+'%'],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.locals.result=search_result;
            res.render('search-result',{search_data:data});
        }
    })
})
router.post('/moresearch',(req,res)=>{
    var search_result=req.body.moresult;
    var showNumber=Number(req.body.showNumber);
    sql(`select * from article where title like ? limit 8,?`,['%'+search_result+'%',showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
//后台
router.use('/admin',require('./admin'));
//聊天室
router.get('/chart',(req,res)=>{
    res.render('chart')
})
//关于我
router.get('/about',(req,res)=>{
    res.render('about')
})
//成长
router.get('/grow',(req,res)=>{
    res.render('grow')
})
//前端
router.get('/qianduan',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="html" order by id desc '),
        fn('select * from article  where info="css" order by id desc'),
        fn('select * from article  where info="html5" order by id desc'),
        fn('select * from article  where info="css3" order by id desc'),
        fn('select * from article  where info="JavaScript" order by id desc')
    ]
    Promise.all(arr).then(function(data){
      res.render('qianduan',{data:data});
    })

})
//后台
router.get('/houtai',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="nodeJs" order by id desc'),
        fn('select * from article  where info="AngularJS" order by id desc'),
        fn('select * from article  where info="Vue2Js" order by id desc')
    ]
    Promise.all(arr).then(function(data){
        console.log(data);
        res.render('houtai',{data:data});
    })
})
//前端-javascript
router.get('/qianduan/javascript',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="JavaScript" order by id desc limit 0,9'),
    ]
    Promise.all(arr).then(function(data){
        res.render('javascript',{data:data});
    })
})
//前端-javascript
router.post('/qianduan/javascript',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="JavaScript" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/qianduan/html',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="html" order by id desc limit 0,9')
    ]
    Promise.all(arr).then(function(data){
        res.render('html',{data:data});
    })
})
router.post('/qianduan/html',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="html" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/qianduan/html5',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="html5" order by id desc limit 0,9')
    ];
    Promise.all(arr).then(function(data){
        res.render('html5',{data:data});
    })
})
router.post('/qianduan/html5',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="html5" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/qianduan/css',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="css" order by id desc limit 0,9')
    ]
    Promise.all(arr).then(function(data){
        res.render('css',{data:data});
    })
})
router.post('/qianduan/css',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="css" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/qianduan/css3',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="css3" order by id desc limit 0,9')
    ]
    Promise.all(arr).then(function(data){
        res.render('css3',{data:data});
    })
})
router.post('/qianduan/css3',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="css3" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/qianduan/jq',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="jq" order by id desc limit 0,9')
    ]
    Promise.all(arr).then(function(data){
        res.render('jq',{data:data});
    })
})
router.post('/qianduan/jq',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    console.log(showNumber)
    sql('select * from article  where info="jq" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            console.log(data)
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/houtai/nodejs',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="nodejs" order by id desc limit 0,1')
    ]
    Promise.all(arr).then(function(data){
        res.render('nodejs',{data:data});
    })
})
router.post('/houtai/nodejs',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="nodejs" order by id desc limit 1,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/houtai/angular',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="angular" order by id desc limit 0,9')
    ]
    Promise.all(arr).then(function(data){
        res.render('angular',{data:data});
    })

})
router.post('/houtai/angular',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="angular" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/houtai/vue',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="vue" order by id desc limit 0,9')
    ]
    Promise.all(arr).then(function(data){
        res.render('vue',{data:data});
    })
})
router.post('/houtai/vue',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="vue" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/other',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="其它" order by id desc limit 0,9')
    ]
    Promise.all(arr).then(function(data){
        res.render('other',{data:data});
    })
})
router.post('/other',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="other" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/play',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="play" order by id desc limit 0,9')
    ]
    Promise.all(arr).then(function(data){
        res.render('play',{data:data});
    })
})
router.post('/play',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="play" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/says',(req,res)=>{
    var fn=function(mysql,zhi,callback){
        callback&&callback();
        return new Promise(function(success,error){
            sql(mysql,zhi,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    success(data);
                }
            })
        })
    }
    arr=[
        fn('select * from article  where info="说说" order by id desc limit 0,9')
    ]
    Promise.all(arr).then(function(data){
        res.render('says',{data:data});
    })
})
router.post('/says',(req,res)=>{
    var showNumber=Number(req.body.showNumber);
    sql('select * from article  where info="says" order by id desc limit 9,?',[showNumber],(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json({
                data_more:data
            })
        }
    })
})
router.get('/liuyan',(req,res)=>{
    res.render('liuyan');
})
router.get('/charRk',(req,res)=>{
    res.render('charrk');
})
router.get('/char',(req,res)=>{
    res.render('chart');
})
router.post('/comment',(req,res)=>{
    var articleId=req.body.articleId;
    var userId=req.body.userId;
    var username=req.body.username;
    var comment_con=req.body.conment_con;
    var dataTime=new Date().toLocaleString();
    sql('insert into comment( `id`,`articleId`,`userId`,`comment_con`,`username`,`dataTime`) value(0,?,?,?,?,?)',[articleId,userId,comment_con,username,dataTime],(err,data)=>{
        if(err){
            console.log(err);
            res.send('评论失败');
        }else{
            res.json({
                success:'评论成功'
            })
        }
    })
})
module.exports=router;