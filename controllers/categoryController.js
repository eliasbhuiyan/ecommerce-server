const cloudinary = require("../helpers/cloudinary");
const categorySchema = require("../models/categorySchema");
const fs = require('fs');
const createCategory = async (req, res)=>{
    const {name} = req.body;

    if(!name) return res.status(400).send({error: "Category name is required!"});
    if(!req?.file?.path) return res.status(400).send({error: "Category image is required!"});

      
    // Upload Category Image
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "categories"})
    
    fs.unlinkSync(req.file.path)

    const category = new categorySchema({
        name,
        image: result.url
    })

    category.save()

    res.status(201).send({success: "Category created", category});
}

const getCategories = async (req, res)=>{
   const categories = await categorySchema.find()
   res.status(200).send(categories)
}

module.exports = {createCategory, getCategories}