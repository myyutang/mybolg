/**
 * Created by xaiodoudou on 2017/3/26.
 */
const app = require('../app'),
    sql = require('./mysql'),
    navdata = require('./nav');
app.use(function (req,res,next){
    if(req.cookies['login']){
        res.locals.login = req.cookies.login.name;
        res.locals.nowid=req.cookies.login.id;
    }
    if(res.locals.login){
        sql('SELECT * FROM user where username = ?',[res.locals.login],(err,data) => {
            req.session.admin = Number(data[0]['admin']);
            res.locals.admin =req.session.admin;
            next()
        })
    }else{
        req.session.admin = null;
        res.locals.admin =req.session.admin;
        next()
    }
});
app.use(function(req,res,next){
    if(req.session.navdata===undefined){
        navdata(ondata=>{
            req.session.navdata=ondata;
            res.locals.navData= req.session.navdata;
            next();
        })
    }else{
        res.locals.navData= req.session.navdata;
        next()
    }
});