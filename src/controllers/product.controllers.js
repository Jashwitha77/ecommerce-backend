import Product from "../models/product.models.js";
// get all products
export const getProducts = async(req,res) => {
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
export const getProductById = async(req,res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        //normal users can only view published products
        if(req,res?.role!== "admin" && !product.published){
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
export const createProduct = async(req,res) => {
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
export const updateProduct = async(req,res) => {
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
export const deleteProduct = async (req, res) => {
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
export const publishProduct = async (req, res) => {
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
export const unpublishProduct = async (req, res) => {
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
    