const productSchema = require("../models/productSchema");

const createProduct = async (req, res) => {
  const { title, description, price, stock, category, status, varients } =
    req.body;

  if (!title)
    return res.status(400).send({ message: "product name is required!" });
  if (!price) return res.status(400).send({ message: "Price is required!" });

  const product = new productSchema({
    title,
    description,
    price,
    stock,
    category,
    status,
    varients,
  });

  product.save();
  res.send(product);
};

module.exports = { createProduct };
