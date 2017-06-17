/**
 * Created by xaiodoudou on 2017/3/26.
 */
var sql=require('./mysql');
var fn=function(onedata,i){
    return new Promise(function(resolve,reject){
        sql('select * from nav where `leave`=2 and `nvid`=?',[onedata[i]['nvid']],(err,twodata)=>{
            onedata[i].child=twodata;
            resolve();
        })
    })
}
module.exports=function(cb){
    sql('select * from nav where `leave`= 1',(err,onedata)=>{
        var arr=[];
        for(var i in onedata){
            arr[i]=fn(onedata,i);
        }
        Promise.all(arr).then(function(){
           cb(onedata);
        });
    })
}//导航查询
