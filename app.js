require('dotenv').config();
const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const { redirect } = require("express/lib/response");
const _=require("lodash" );
const res = require('express/lib/response');
const app=express();


//connect to database
var url=process.env.URL;
console.log(url);
mongoose.connect(url,{useNewUrlParser:true});

//just a schema
const itemsSchema=new mongoose.Schema({
    name:String
})

//item model based on itemschema
const Item=mongoose.model("item",itemsSchema);

const item1=new Item({
    name:"+ button to insert"
});
const item2=new Item({
    name:"checkbox to delete"
});
const item3=new Item({
    name:"display items"
});
const defaultItems=[item1,item2,item3];

const ListSchema=new mongoose.Schema({
    name:String,
    listofitems:[itemsSchema]
})

//lists model is bascilly model which contains the all the lists and the items 
const List=mongoose.model("List",ListSchema);


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));


//for showing all lists
app.get("/",function(req,res){
    List.find({name:{$ne:"Favicon.ico"}},function(err,items){
          console.log(items);
          res.render("home",{lists:items});
    });
}
)


//insert or adding
app.post("/",function(req,res){
    var x=req.body.todo;
    const listname=req.body.list;
    const newitem=new Item({
         name:x
    });
    List.findOne({name:listname},function(err,result){
               result.listofitems.push(newitem);
               result.save();
               res.redirect("/"+listname);
    });
})

//deleting
app.post("/delete",function(req,res){
     const id=req.body.deleted;
     const listname=req.body.listname;
        List.findOneAndUpdate({name:listname},{$pull:{listofitems:{_id:id}}},function(err,result){
            if(!err){
                res.redirect("/"+listname);
            }
        }); 
})

app.get("/:customListName",function(req,res){
    const listname=_.capitalize(req.params.customListName);
    List.findOne({name:listname},function(err,result){
        if(!result){
            const list=new List({
                name:listname,
                listofitems:defaultItems
            })
            list.save();
            res.redirect("/"+listname);
        }
        else
        res.render("list",{kindofday:result.name, items:result.listofitems});
    })
})

app.post("/newlist",function(req,res){
     var newtodoname=req.body.todo;
     List.findOne({name:newtodoname},function(err,result){
        if(!result){
            const list=new List({
                name:_.capitalize(newtodoname),
                listofitems:defaultItems
            })
            list.save();
            
        }
        res.redirect("/"+newtodoname);
        
    })

});

app.post("/openlist",function(req,res){
    var todoid=req.body.listname;
    console.log(todoid);
    List.findById(todoid,function(err,result){
        res.redirect("/"+result.name);
    })
    
})

app.post("/deletelist",function(req,res){
    var todoid=req.body.listname;
    List.findByIdAndRemove(todoid,function(err){
        if(!err){
            console.log("deleted");
            res.redirect("/");
        }
    });
})

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'),function(){
    console.log("server is started");
})
