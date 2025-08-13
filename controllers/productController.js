const productSchema = require("../models/productSchema");
const cloudinary = require("../helpers/cloudinary");
const fs = require("fs");
const generateSlug = require("../helpers/slugGerarator");
const SearchRegx = require("../helpers/SearchRegx");
const categorySchema = require("../models/categorySchema");
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
    if (varients.length < 1)
      return res.status(400).send({ message: "Add minimum one varient." });
    if (!req.files.mainImg)
      return res.status(400).send({ message: "Main image is required!" });
    const slug = generateSlug(title);

    const existingProduct = await productSchema.findOne({ slug: slug });
    if (existingProduct)
      return res.status(400).send({ message: "Product title already used." });

    varients.map((items) => {
      // Varients enum validation
      if (!["color", "size"].includes(items.name)) {
        return res.status(400).send({
          message: "Invalid Varient name, only allowed color & size.",
        });
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
  const { title, description, price, stock, category, varients, status } =
    req.body;
  const { slug } = req.params;

  try {
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
    if (
      status &&
      ["active", "pending", "reject"].includes(status.toLowerCase())
    ) {
      if (req.user.role === "admin") {
        existingProduct.status = status;
      }
    }
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
  } catch (error) {
    res.status(500).send({ error: "Server error!" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const search = req.query.search || "";
    const status = req.query.status || "";
    const categoryName = req.query.category || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalProducts = await productSchema.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;
    const query = {};
    if (search) {
      query.title = { $regex: SearchRegx(search), $options: "i" };
    }
    if (status) {
      query.status = status;
    }
    if (categoryName) {
      const categoryData = await categorySchema.findOne({
        name: { $regex: SearchRegx(categoryName), $options: "i" },
      });
      if (categoryData) query.category = categoryData._id;
    }

    const products = await productSchema
      .find(query)
      .skip(skip)
      .limit(limit)
      .populate("category");

    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    res.send({
      products,
      totalProducts,
      limit,
      page,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
    });
  } catch (error) {
    res.status(500).send({ error: "Server error!" });
  }
};

const deleteProduct = async (req, res) => {
  const { productID } = req.params;

  try {
    const product = await productSchema.findByIdAndDelete(productID);
    if (!product)
      return res.status(400).send({ message: "No produuct found." });
    res.status(201).send({ message: "Product deleted." });
  } catch (error) {
    res.status(500).send({ error: "Server error!" });
  }
};

const productDetails = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await productSchema
      .findOne({ slug: slug })
      .populate("category");

    if (!product) return res.status(400).send({ error: "Product not found!" });
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send({ error: "Server error!" });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  deleteProduct,
  productDetails,
};
