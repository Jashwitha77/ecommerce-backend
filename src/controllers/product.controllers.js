const Product = require("../models/product.models");
const csvParser = require("csv-parser");
const { Parser } = require("json2csv");
const { Readable } = require("stream");
// get all products
const getProducts = async(req,res) => {
    try{
        const {
            category,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};


        if(req.user?.role !=="admin") {
            filter.published = true;
        }
        if(category) {
            filter.category = category;
        }
        if(minPrice || maxPrice) {
            filter.price = {};
            if(minPrice) {
                filter.price.$gte = Number(minPrice);
            }
            if(maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
        }    //pagination
        const currentPage = Number(page);
        const itemsPerPage = Number(limit);
        const skip = (currentPage - 1) * itemsPerPage;

//SORTING
        let sortOption = {};
        if(sort === "price_asc") {
            sortOption.price = 1;
        } else if(sort === "price_desc") {
            sortOption.price = -1;
        } else if(sort === "newest"){
            sortOption.createdAt = -1;
        }
        const products = await Product.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(itemsPerPage);   
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / itemsPerPage);
        
        res.status(200).json({
            products,
            totalProducts,
            totalPages,
            page: currentPage,
            limit: itemsPerPage
        });
    }catch(error) {
        res.status(500).json({
            message: "Error fetching products",
            error: error.message
        });
        
    }
};
// get product by id
const getProductById = async(req,res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        //normal users can only view published products
        if(req.res?.role!== "admin" && !product.published){
            return res.status(404).json({
                message: "product not found"
            });
        }



        res.status(200).json(product);
    } catch(error) {
        res.status(500).json({
            message: "Error failed to fetching product",
            error: error.message
        });
    }
};
//create product
const createProduct = async(req,res) => {
    try{
        const{ name, description, price, category, stock, published} = req.body;
        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock,
            published
        });
        res.status(201).json(product);
    } catch(error) {
        res.status(500).json({
            message: "Error failed to create product",
            error: error.message
        });
    }
};
//update product
const updateProduct = async(req,res) => {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }


        )
        if(!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.status(200).json(product);
    } catch(error) {
        res.status(500).json({
            message: "Error failed to update product",
            error: error.message
        });
    }
};

//delete product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
};
//publish product
const publishProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { published: true },
            { new: true, runValidators: true }
        );
        if(!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.status(200).json({
            message: "Product published successfully",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to publish product",
            error: error.message
        });
    }
};
// 7. Unpublish product
const unpublishProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { published: false },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product unpublished successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to unpublish product",
            error: error.message
        });
    }
};
// IMPORT PRODUCTS FROM CSV
// =====================================================

const importProducts = async (req, res) => {
    try {

        // Check whether file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a CSV file"
            });
        }

        const products = [];

        // Convert uploaded file buffer into readable stream
        const stream = Readable.from(
            req.file.buffer.toString()
        );

        // Read CSV
        stream
            .pipe(csvParser())
            .on("data", (row) => {
                products.push(row);
            })
            .on("end", async () => {

                try {

                    const validProducts = [];
                    const errors = [];

                    // Validate every CSV row
                    products.forEach((product, index) => {

                        // CSV header is row 1
                        // Therefore actual data starts from row 2
                        const rowNumber = index + 2;

                        const price = Number(product.price);
                        const stock = Number(product.stock);

                        const publishedValue = String(
                            product.published
                        )
                            .trim()
                            .toLowerCase();


                        // Name validation
                        if (
                            !product.name ||
                            !product.name.trim()
                        ) {
                            errors.push(
                                `Row ${rowNumber}: name is required`
                            );
                        }


                        // Description validation
                        if (
                            !product.description ||
                            !product.description.trim()
                        ) {
                            errors.push(
                                `Row ${rowNumber}: description is required`
                            );
                        }


                        // Price validation
                        if (
                            isNaN(price) ||
                            price <= 0
                        ) {
                            errors.push(
                                `Row ${rowNumber}: price must be a positive number`
                            );
                        }


                        // Category validation
                        if (
                            !product.category ||
                            !product.category.trim()
                        ) {
                            errors.push(
                                `Row ${rowNumber}: category is required`
                            );
                        }


                        // Stock validation
                        if (
                            isNaN(stock) ||
                            stock < 0
                        ) {
                            errors.push(
                                `Row ${rowNumber}: stock must be a non-negative number`
                            );
                        }


                        // Published validation
                        if (
                            publishedValue !== "true" &&
                            publishedValue !== "false"
                        ) {
                            errors.push(
                                `Row ${rowNumber}: published must be true or false`
                            );
                        }


                        // If this row has no validation error,
                        // add it to validProducts
                        if (
                            !errors.some(error =>
                                error.startsWith(`Row ${rowNumber}:`)
                            )
                        ) {
                            validProducts.push({
                                name: product.name.trim(),

                                description:
                                    product.description.trim(),

                                price: price,

                                category:
                                    product.category.trim(),

                                stock: stock,

                                published:
                                    publishedValue === "true"
                            });
                        }

                    });


                    // If any row has an error,
                    // do not insert anything
                    if (errors.length > 0) {

                        return res.status(400).json({
                            message: "CSV validation failed",
                            errors
                        });

                    }


                    // Insert all valid products
                    const createdProducts =
                        await Product.insertMany(
                            validProducts
                        );


                    res.status(201).json({
                        message:
                            "Products imported successfully",

                        count:
                            createdProducts.length,

                        products:
                            createdProducts
                    });

                } catch (error) {

                    res.status(500).json({
                        message:
                            "Failed to import products",

                        error:
                            error.message
                    });

                }

            });

    } catch (error) {

        res.status(500).json({
            message:
                "Failed to process CSV file",

            error:
                error.message
        });

    }
};


// =====================================================
// EXPORT PRODUCTS TO CSV
// =====================================================

const exportProducts = async (req, res) => {
    try {

        // Get products from MongoDB
        const products = await Product
            .find()
            .lean();


        // Fields that should appear in CSV
        const fields = [
            "name",
            "description",
            "price",
            "category",
            "stock",
            "published"
        ];


        // Convert JSON to CSV
        const parser = new Parser({
            fields
        });

        const csv = parser.parse(products);


        // Tell browser/Postman this is a CSV file
        res.header(
            "Content-Type",
            "text/csv"
        );


        // Give downloaded file a name
        res.attachment(
            "products.csv"
        );


        // Send CSV
        res.send(csv);

    } catch (error) {

        res.status(500).json({
            message:
                "Failed to export products",

            error:
                error.message
        });

    }
};


// =====================================================
// EXPORT ALL CONTROLLERS
// =====================================================

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    publishProduct,
    unpublishProduct,
    importProducts,
    exportProducts
};