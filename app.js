//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-luka:test123@cluster0.fqq9tvc.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model('Item', itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items:[itemSchema]
});
const List = mongoose.model('List', listSchema);


app.get("/", function(req, res) {
  Item.find((err, items)=>{
    if (err){ console.log(err);}
    else {

      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
  

});

app.post("/", function(req, res){
  const listName = req.body.list;
  const item = new Item({
    name:req.body.newItem
  });
    if (listName == "Today"){
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name:listName}, (err, foundList)=>{
        if (!err){
          foundList.items.push(item);
          foundList.save();
          res.redirect('/' + listName);
        }
      });
    }
    
});


app.get('/:name', (req, res)=>{
  let customName = req.params.name[0].toUpperCase() + req.params.name.slice(1).toLowerCase();
  List.findOne({name: customName}, (err, foundList)=>{
     if (!err){
        if(!foundList){
          const list = new List({
            name: customName,
            items:[]
          });
          list.save();
          res.redirect('/' + customName);
        } else{
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
     }
  });
});

app.post('/delete', (req, res)=>{
  if (req.body.title == "Today"){
    Item.findByIdAndRemove(req.body.id, err=>{
      if (err) {console.log(err);}
      else {
        console.log("Successfully deleted element");
        res.redirect('/');
      }
    });
  }else {
    List.findOneAndUpdate({name:req.body.title}, {$pull: {items: {_id:req.body.id}}}, (err, foundList)=>{
      if(!err){
        res.redirect('/' + req.body.title);
      }
    })
  }
  
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
