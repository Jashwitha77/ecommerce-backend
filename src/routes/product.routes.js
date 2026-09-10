import express from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    publishProduct,
    unpublishProduct
} from "../controllers/product.controllers.js";

const router = express.Router();
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/publish", publishProduct);
router.patch("/:id/unpublish", unpublishProduct);
export default router;