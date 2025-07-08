const productSchema = require("../models/productSchema");
const cloudinary = require("../helpers/cloudinary");
const fs = require("fs");
const generateSlug = require("../helpers/slugGerarator");
const createProduct = async (req, res) => {
  const { title, description, price, stock, category, varients } = req.body;

  try {
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
    // if (varients.length < 1)
    //   return res.status(400).send({ message: "Add minimum one varient." });
    if (!req.files.mainImg)
      return res.status(400).send({ message: "Main image is required!" });
    const slug = generateSlug(title);

    const existingProduct = await productSchema.findOne({ slug: slug });
    if (existingProduct)
      return res.status(400).send({ message: "Product title already used." });

    // varients.map((items) => {
    //   // Varients enum validation
    //   if (!["color", "size"].includes(items.name)) {
    //     return res
    //       .status(400)
    //       .send({ message: "Invalid Varient name, only allowed color & size." });
    //   }

    //   if (items.name === "color") {
    //     items.options.forEach((colorOption) => {
    //       if (!colorOption.hasOwnProperty("colorname"))
    //         return res.status(400).send({
    //           message: "In color varient the 'color name' is required.",
    //         });
    //     });
    //   }

    //   if (items.name === "size") {
    //     items.options.forEach((sizeOption) => {
    //       if (!sizeOption.hasOwnProperty("size")) {
    //         return res.status(400).send({
    //           message: "In size varient the 'size' is required.",
    //         });
    //       }
    //     });
    //   }
    // });

    // Upload Main  Image
    let mainImg;
    for (item of req.files.mainImg) {
      const result = await cloudinary.uploader.upload(item.path, {
        folder: "products",
      });
      fs.unlinkSync(item.path);
      mainImg = result.url;
    }

    // Upload sub Images
    let productImages = [];
    if (req.files.images.length > 0) {
      for (item of req.files.images) {
        const result = await cloudinary.uploader.upload(item.path, {
          folder: "products",
        });
        fs.unlinkSync(item.path);
        productImages.push(result.url);
      }
    }

    const product = new productSchema({
      title,
      description,
      slug,
      price,
      stock,
      category,
      varients,
      mainImg,
      images: productImages,
    });

    product.save();
    res.status(201).send({ message: "Product created successfully.", product });
  } catch (error) {
    res.status(500).send({ error: "Server error!" });
  }
};

const updateProduct = async (req, res) => {
  const { title, description, price, stock, category, varients } = req.body;
  const { slug } = req.params;

  const existingProduct = await productSchema.findOne({ slug: slug });
  if (!existingProduct)
    return res
      .status(400)
      .send({ message: "Invalid request, no product found!" });

  if (title) existingProduct.title = title;
  if (description) existingProduct.description = description;
  if (price) existingProduct.price = price;
  if (stock) existingProduct.stock = stock;
  if (category) existingProduct.category = category;
  if (varients && varients.length > 0) existingProduct.varients = varients;
  if (req?.files?.mainImg?.length > 0) {
    let mainImg;
    for (item of req.files.mainImg) {
      // delete existing main Image
      await cloudinary.uploader.destroy(
        existingProduct.mainImg.split("/").pop().split(".")[0]
      );
      const result = await cloudinary.uploader.upload(item.path, {
        folder: "products",
      });
      fs.unlinkSync(item.path);
      mainImg = result.url;
    }
    existingProduct.mainImg = mainImg;
  }

  existingProduct.save();

  res
    .status(200)
    .send({ message: "Product updated.", product: existingProduct });
};

module.exports = { createProduct, updateProduct };
