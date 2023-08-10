

const router = require('express').Router();
const Product = require('../Models/productModel');
const multer = require('multer');
const Category = require('../Models/bannerModel');

const Storage = multer.diskStorage({
    destination: 'uploads',
    filename: function (req, file, cb) {
        req.imgName = new Date().toISOString().replace(/:/g, '-') + file.originalname
        cb(null, req.imgName)
    }
});

// Serve images from the 'uploads' directory
// router.use('/images', express.static('uploads'));

const upload = multer({
    storage: Storage
}).array('image');



//ADD PRODUCT
router.post('/addProduct', async (req, res) => {

    try {
        upload(req,res,async(err)=>{
            if(err) {console.error(err);
            return res.status(404).json({ success: false, msg: 'File upload failed' });
        }
       
        if(!req.files || req.files.length === 0 ){
            return res.status(404).json({success: false, msg: 'Invalid Image Upload , please select a product image file to upload'});
        }

        const imageFileNames = req.files.map(file => file.filename);

        const imageUrls = imageFileNames.map(fileName =>{
            return `${req.protocol}://${req.get('host')}:/images/${fileName}`;
        });
        const { name , price , published, discount, category } = req.body;

         // Logging the category value for debugging purposes
console.log("Category ID:", category);

        const calculateDiscount = price - (price * (discount / 100));

        const product = await Product.create({category ,  name, img: imageUrls, price, published, discount , totalPrice: calculateDiscount });
        
        if(!product){
            return res.status(404).json({ success: false, msg: `Product Not Found`})
        }
        
        console.log("Category ID:", category);
const categoryObj = await Category.findById(category);


        if (!categoryObj) {
            return res.status(404).json({ success: false, msg: 'Category Not Found' });
        }

        categoryObj.product.push(product._id);
        await categoryObj.save();

        res.status(200).json({success : true, msg : `Product create Successfully ......` , data : product})
        
    });
    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




//update the product
router.put('/updateProduct/:productId', async (req, res) => {
    const productId = req.params.productId 
    try {

        upload( req, res , async(err) => {

            if(err){
                console.log(err);
                return res.status(404).json({ success: false, msg: 'File upload failed' });
            }

            if( !req.files || req.files.length === 0 ){
               return res.status(404).json({success: false, msg: 'Invalid Image Upload , please select a product image file to upload'});
            }

            const imageFileNames = req.files.map(file => file.filename);

            const imageUrls = imageFileNames.map(filename => {
                return `${req.protocol}://${req.get('host')}:/image/${filename}`;
            });

             // Get the existing product
        
             const existingProduct = await Product.findById(productId);

            if(!existingProduct){
                return res.status(404).json({message: 'Product not found'});
            }

            const { name , price, published, discount , category} = req.body;

            const calculateDiscount = price - (price * (discount / 100));

            const updateFields =  {
                name : name || existingProduct.name,
                img : imageUrls.length > 0 ? imageUrls : existingProduct.img,
                price : price || existingProduct.price,
                discount : discount || existingProduct.discount,
                published : published || existingProduct.published,
                totalPrice : calculateDiscount || existingProduct.totalPrice,
                category : category || existingProduct.category ,
            }

            const updatedProduct = await Product.findByIdAndUpdate(productId ,{
                $set : updateFields
            }, 
            {new : true});

            const updatProductCategory = await Product.updateMany({ product : productId})

            res.status(200).json({ success: true, msg: `Product Updated Successfully ......`, data : updatedProduct });
        });

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




//delete the product
router.delete('/deleteProduct/:productId', async (req, res) => {

    try {
const productId = req.params.productId;

        const deleteProduct = await Product.findByIdAndDelete( productId);

        if(!deleteProduct) {
            return res.status(404).json({ success: false, msg: `Product Not Found`})
        }

        const deleteProductCategory  = await Category.deleteMany({ product : productId});
        
        res.status(200).json({ success: true, msg: `Deleted Successfully ......`, data : deleteProduct, deleteProductCategory});

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




//get all product
router.get('/allProduct', async (req, res) => {

    try {

        const allProducts = await Product.find();

        if(!allProducts) {
            res.status(404).json({ success: false, msg: `Product Not Found`})
        }
       
        res.status(200).json({ success: true, msg: `All Product List Successfully ......`, data : allProducts })

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




//one product
router.get('/singleProduct/:id', async (req, res) => {

    try {

        const oneProduct = await Product.findById({_id : req.params.id});

        if(!oneProduct){
            res.status(404).json({ success: false, msg: `Product Not Found`})
        }
       
        res.status(200).json({ success: true, msg: `One User`, data : oneProduct });

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




//published product 
router.get('/publishedProduct', async (req, res) => {

    try {

        const publishedProduct = await Product.find({published: true});

        if(!publishedProduct){
            return res.status(404).json({ success: false, msg: `Product Not Found`})
        }

        res.status(200).json({ success: true, msg: `Get Published Banner Successfully ......`, data: publishedProduct });

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});





module.exports = router ;
