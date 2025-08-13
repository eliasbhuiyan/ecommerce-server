const productSchema = require("../models/productSchema");
const cloudinary = require("../helpers/cloudinary");
const fs = require("fs");
const createProduct = async (req, res) => {
  const { title, description, price, stock, category, varients } = req.body;

  // Upload Main  Image

  // let mainImg;
  // for (const item of req.files.mainImg) {
  //   const result = await cloudinary.uploader.upload(item.path, {
  //     folder: "products",
  //   });
  //   fs.unlinkSync(item.path);
  //   mainImg = result.url;
  // }
  // console.log(mainImg);

  // let productImages = [];
  // for (const item of req.files.images) {
  //   const result = await cloudinary.uploader.upload(item.path, {
  //     folder: "products",
  //   });
  //   fs.unlinkSync(item.path);
  //   productImages.push(result.url);
  // }
  // console.log(productImages);

  return;
  if (!title)
    return res.status(400).send({ message: "product name is required!" });
  if (!description)
    return res
      .status(400)
      .send({ message: "Product description is required!" });
  if (!price) return res.status(400).send({ message: "Price is required!" });
  if (!stock) return res.status(400).send({ message: "Stock is required!" });
  if (!category)
    return res.status(400).send({ message: "Category is required!" });
  if (varients.length < 1)
    return res.status(400).send({ message: "Add minimum one varient." });
  if (!req.files.mainImg)
    return res.status(400).send({ message: "Main image is required!" });

  varients.forEach((items) => {
    // Varients enum validation
    if (!["color", "size"].includes(items.name)) {
      return res
        .status(400)
        .send({ message: "Invalid Varient name, only allowed color & size." });
    }

    if (items.name === "color") {
      items.options.forEach((colorOption) => {
        if (!colorOption.hasOwnProperty("colorname"))
          return res.status(400).send({
            message: "In color varient the 'color name' is required.",
          });
      });
    }

    if (items.name === "size") {
      items.options.forEach((sizeOption) => {
        if (!sizeOption.hasOwnProperty("size")) {
          return res.status(400).send({
            message: "In size varient the 'size' is required.",
          });
        }
      });
    }
  });

  const product = new productSchema({
    title,
    description,
    price,
    stock,
    category,
    varients,
    mainImg,
  });

  product.save();
  res.send(product);
};

module.exports = { createProduct };
