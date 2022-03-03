//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const ejs = require("ejs");
var _ = require('lodash');


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Sansu01:Sansu123@todolist.xxfjh.mongodb.net/ToDoList?retryWrites=true&w=majority").then(() => console.log("Successfull"))
    .catch((err) => console.log(err));
const itemSchema = {
    name: String
};
const listSchema = {
    name: String,
    items: [itemSchema]
};
const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);
const item1 = new Item({
    name: "Welcome to to-do list!"
});
const item2 = new Item({
    name: "Use + to add"
});
const item3 = new Item({
    name: "Click on checkbox to delete"
});
const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("No Error");
                }
            });
        }
        res.render("list", { listTitle: "Today", newListItems: foundItems });
    });



});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function(err, foundList) {
            if (!err) {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);

            }
        });
    }

});
app.post("/delete", function(req, res) {
    const idC = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndRemove(idC, function(err) {
            console.log(err);
        });
        res.redirect("/");

    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: idC } } }, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }

});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { listTitle: customListName, newListItems: foundList.items });
            }
        }
    });

});

app.post("/:customListName", function(req, res) {

    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    });
    item.save();

    res.redirect("/");
});
app.get("/about", function(req, res) {
    res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function() {
    console.log("Server started on port 3000");
});