const express = require("express");
const {
  createCategory,
  getCategories,
} = require("../../controllers/categoryController");
const upload = require("../../helpers/multer");
const RoleCheck = require("../../middleware/roleMiddleware");
const authMiddleware = require("../../middleware/authMiddleware");
const { createProduct } = require("../../controllers/productController");
const router = express.Router();

router.post(
  "/createcategory",
  authMiddleware,
  RoleCheck(["admin"]),
  upload.single("category"),
  createCategory
);
router.get("/categories", getCategories);

router.post("/create", createProduct);
module.exports = router;
