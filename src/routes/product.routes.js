const express = require("express");
const multer = require("multer");
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    publishProduct,
    unpublishProduct,
    importProducts,
    exportProducts
} = require("../controllers/product.controllers.js");

const {
    authenticate,
    authorizeRoles
} = require("../middleware/auth.middleware");

const router = express.Router();

// Multer configuration
const upload = multer({
    storage: multer.memoryStorage()
});
 // CSV IMPORT
// =====================================================

// Admin only
router.post(
    "/import",
    authenticate,
    authorizeRoles("admin"),
    upload.single("file"),
    importProducts
);


// =====================================================
// CSV EXPORT
// =====================================================

// Admin only
router.get(
    "/export",
    authenticate,
    authorizeRoles("admin"),
    exportProducts
);


router.get("/",  authenticate, getProducts);
router.get("/:id",  authenticate, getProductById);
router.post("/", authenticate,
    authorizeRoles("admin"), createProduct);
router.put("/:id", authenticate,
    authorizeRoles("admin"), updateProduct);
router.delete("/:id", authenticate,
    authorizeRoles("admin"), deleteProduct);
router.patch("/:id/publish", authenticate,
    authorizeRoles("admin"), publishProduct);
router.patch("/:id/unpublish", authenticate,
    authorizeRoles("admin"), unpublishProduct);
module.exports = router;