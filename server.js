var express=require("express");
var app=express();
var mysql=require('mysql');
var cors=require('cors');
var bodyParser=require("body-parser");
var jsonParser=bodyParser.json();
var jwt=require('jsonwebtoken');
var urlParser=bodyParser.urlencoded({extended:false})
app.use(cors());
var con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"product_list"
});
con.connect((err)=>{
    if(err) throw err;
    console.log("connected to database");
})
function verifyToken(req,res,next){
    let authHeader=req.headers.authorization;
    if(authHeader==undefined){
        res.status(401).send({error:"no token provided"})
    }
    let token=authHeader.split(" ")[1]
    jwt.verify(token,"secret",function(err,decoded){
        if(err){
            res.status(500).send({error:"Authentication failed"})
        }
        else{
            res.send(decoded);
        }
    })
}
app.post("/login",jsonParser,function(req,res){
    let username=req.body.username;
    let password=req.body.password;
    if(req.body.username==undefined || req.body.password==undefined){
        res.status(500).send({error:"authentication failed"});
    }
    let qr=`select disply_name from users where username='${username}' and password=sha1('${password}')`
    con.query(qr,(err,result)=>{
        if(err||res.len==0){
            console.error('Error connecting to database:', err);
            res.status(500).send({error:"login failed"});
        }
        else{
            // res.status(200).send({success:"login success"})
            let resp={
                id:result[0].id,
                display_name:result[0].disply_name
            }
            let token=jwt.sign(resp,"secret",{expiresIn:120});
            res.status(200).send({auth:true,token:token});
        }
    })
})
app.get("/products",function(req,res){
    con.query("select * from products",(err,result,fields)=>{
        if(err) throw err;
        res.send(result);
    })
});
app.get("/product/:id",function(req,res){
    let id=req.params.id;
    con.query("select * from products where id="+id,(err,result,fields)=>{
        if(err) throw err;
        res.send(result);
    })
});
app.delete("/product/:id",function(req,res){
    let id=req.params.id;
    con.query("delete from products where id="+id,(err,result,fields)=>{
        if(err) throw err;
        res.send({success:"deleted successfully"});
    })
});
app.post("/product",jsonParser,function(req,res){
    let title=req.body.title;
    let description=req.body.description;
    let price=req.body.price;
    let qr=`insert into products(title,description,price) values ('${title}','${description}',${price})`;
    con.query(qr,(err,result)=>{
        if(err) throw err;
        res.send({success:"success"});
    })
});
app.patch("/product",jsonParser,function(req,res){
    let title=req.body.title;
    let description=req.body.description;
    let price=req.body.price;
    let id=req.body.id;
    let qr=`update products set title='${title}',description='${description}',price=${price} where id=${id} `;
    con.query(qr,(err,result)=>{
        if(err){
res.send({error:"failed"})
        }
        res.send({success:"updated successfully"});
    })
})
app.listen(8000,function(){
    console.log("server running");
})