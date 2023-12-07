const express = require("express");
const app = express();
const joi = require("joi");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const multer = require("multer");
const mongoose = require("mongoose");

mongoose
    .connect("mongodb+srv://Andy:G2n7aZXsvNyVpOHj@cluster0.2pbpjwf.mongodb.net/?retryWrites=true&w=majority")
    .then(()=>console.log("Connected to mongodb"))
    .catch((error) => console.log("Couldn't connect to mongodb", error));

const itemSchema = new mongoose.Schema({
    color: String,
    description: String,
    img: String,
    link: String
});

const Item = mongoose.model("Item", itemSchema);

const upload = multer({dest: __dirname + "/public/images"});


app.get("/api/characters", (req, res) => {
    getItems(res);
});

const getItems = async (res) => {
    const item = await Item.find();
    res.send(item);
};

app.post("/api/characters", upload.single("img"), (req, res) => {
    const result = validateItem(req.body);
    
    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    };

    const item = new Item({
        color: req.body.color,
        description: req.body.description,
        link: req.body.link
    })
    if(req.file){
        item.img = "images/" + req.file.filename;
    }

    createItem(res, item);
});

const createItem = async(res, item) =>{
    const result = await item.save();
    res.send(item);
}

app.put("/api/characters/:id", upload.single("img"), (req, res) => {
    const result = validateItem(req.body);
    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    updateItem(req, res);
});

const updateItem = async (req,res) => {
    let fieldsToUpdate = {
        color: req.body.color,
        description: req.body.description,
        link: req.body.link
    }
    if(req.file){
        fieldsToUpdate.img = "images/" + req.file.filename;
    }
    
    const result = await Item.updateOne({_id:req.params.id}, fieldsToUpdate)
    res.send(result);
};

app.delete("/api/characters/:id", upload.single("img"), (req,res) =>{
    removeItem(res, req.params.id);
});

const removeItem = async(res, id) => {
    const item = await Item.findByIdAndDelete(id);
    res.send(item);
};

const validateItem = (item) => {
    const schema = joi.object({
        _id: joi.allow(""),
        color: joi.string().min(3).required(),
        description: joi.string().min(3).required(),
        link: joi.string().min(3).required()
    });
    return schema.validate(item);
};

app.listen(3000);