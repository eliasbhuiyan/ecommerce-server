const express = require("express");
const {
  addNewOrder,
  updateOrder,
} = require("../../controllers/orderControllers");
const authMiddleware = require("../../middleware/authMiddleware");
const RoleCheck = require("../../middleware/roleMiddleware");
const router = express.Router();

router.post("/create", authMiddleware, addNewOrder);
router.post(
  "/updatestatus/:orderId",
  authMiddleware,
  RoleCheck(["admin", "stuff"]),
  updateOrder
);

module.exports = router;
