require('dotenv').config();
const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const { redirect } = require("express/lib/response");
const _=require("lodash" );
const app=express();
// var items=[];
// var workitems=[];

//connect to database
var url=process.env.URL
mongoose.connect(url,{useNewUrlParser:true});

//just a schema
const itemsSchema=new mongoose.Schema({
    name:String
})

//item model based on itemschema
const Item=mongoose.model("item",itemsSchema);

const item1=new Item({
    name:"samosa"
});
const item2=new Item({
    name:"Dabeli"
});
const item3=new Item({
    name:"Vadapav"
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

//for main todaylist
var today=new Date();
const options = { weekday: 'long', month: 'long', day: 'numeric' };
var day=today.toLocaleDateString('en-IN',options);
app.get("/",function(req,res){
   
    Item.find({},function(err,items){
        if(err){
        } 
        else{
            if(items.length==0){
                Item.insertMany(defaultItems,function(err){
                    if(err){
                        console.log("locha thaya che!!!");
                    }
                    else{
                        console.log("Successfully inserted");
                    }
                })
                res.redirect("/");
            }
            else{
                res.render("list",{kindofday:day, items:items});
            }
        }
       
    });
})

//insert or adding
app.post("/",function(req,res){
    var x=req.body.todo;
    const listname=req.body.list;
    console.log(x);
    console.log(listname);
    const newitem=new Item({
         name:x
    });
    if(listname===day){
        newitem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listname},function(err,result){
               result.listofitems.push(newitem);
               result.save();
               res.redirect("/"+listname);
        });
    }
   
    // Item.insertMany(newitem,function(err){
    //       if(!err){
    //           console.log("added");
    //           res.redirect("/");
    //       }
    // });
    // console.log(req.body);
    // if(req.body.list=="Work"){
    //     console.log("ahiya ave che")
    //     workitems.push(newitem);
    //     res.redirect("/work");
    // }
    // else{
    //     items.push(newitem);
    //    
    // } 
})

//deleting
app.post("/delete",function(req,res){
     const id=req.body.deleted;
     const listname=req.body.listname;
     if(listname===day){
        Item.findByIdAndRemove(id,function(err){
            if(!err){
                console.log("deleted");
               //  if(listname===today)
                res.redirect("/");
               //  else res.redirect("/"+listname);
            }
        });
     }
     else{
        List.findOneAndUpdate({name:listname},{$pull:{listofitems:{_id:id}}},function(err,result){
            if(!err){
                res.redirect("/"+listname);
            }
        });
     }
     
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

// app.get("/work",function(req,res){
//    res.render("list",{kindofday:"Work Items", items:workitems});
// })

// app.get("/about",function(req,res){
//     res.render("about");
// })

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'),function(){
    console.log("server is started");
})
