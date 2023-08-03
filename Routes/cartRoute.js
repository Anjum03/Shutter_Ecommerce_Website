const router = require("express").Router();
const Cart = require("../Models/cartModel");
const Product = require("../Models/productModel");
const mongoose = require("mongoose");

//Add to cart
router.post("/addCart", async (req, res) => {
  const { productId, quantity, userId } = req.body;

  try {
    const userExist = await Cart.findOne({ userId: userId });

    const productExist = await Product.findOne({ _id: productId });

    if (!productExist) {
      return res.status(404).json({ success: false, msg: `Product Not Found` });
    }

    const price = productExist.price;
    const productName = productExist.name;
    const discount = productExist.discount;
    const totalPriceProduct = productExist.totalPrice

    if (!userExist) {
      const addtoCart = await Cart.create({
        userId: userId,
        items: [
          {
            productId: productId,
            productName: productName,
            quantity: quantity,
            discount: discount,
            price: price,
            totalPrice: totalPriceProduct ,
          },
        ],
        allProductsPrice: totalPriceProduct * quantity,
        addingTime : new Date().toISOString().split('T')[0]
      });

       return res.status(200).json({
          success: true,msg: `Product Added to Cart Successfully ......`,data: addtoCart,
        });
    } else {
      //check product exist ?
      // const existingItems = userExist.items.find((item) => productId === item.productId);
      // const existingItems = userExist.items.find((item) => mongoose.Types.ObjectId(productId).equals(item.productId));
      const existingItemIndex = userExist.items.findIndex((item) => new mongoose.Types.ObjectId(productId).equals(item.productId));

if (existingItemIndex !== -1) {
  // Item exists in the cart, update the quantity and price accordingly
  const existingItem = userExist.items[existingItemIndex];
  existingItem.quantity += quantity;
  existingItem.totalPrice += price * quantity;
} else {
  // Item does not exist in the cart, create a new item
  userExist.items.push({
    productId: productId,
    quantity: quantity,
    price: price,
    discount: discount,
    productName: productName,
    totalPrice: price * quantity,
  });
}

// Update allProductsPrice
const allProductsPrice = userExist.items.reduce((total, item) => total + item.totalPrice, 0);
userExist.allProductsPrice = allProductsPrice;

// Save the changes to the database
await userExist.save();

return res.status(200).json({
  success: true,
  msg: existingItemIndex !== -1 ? `Item Quantity Updated Successfully :)` : `Item Added to Cart Successfully :)`,
  data: userExist
});}

  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ success: false, msg: `Backend Server Error:  ${error}` });
  }
});




//delete cart items
router.delete('/deleteCart/:deleteId/:userId/:productId', async (req, res) => {
  const { deleteId, userId, productId } = req.params;

  try {
    const userExist = await Cart.findOne({ _id: deleteId, userId: userId });
    
    if (!userExist) {
      return res.status(404).json({ success: false, msg: `Cart not found` });
    }

    const itemIndex = userExist.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, msg: `Item not found in cart` });
    }

    // Remove the item from the items array using $pull
    userExist.items.pull(userExist.items[itemIndex]._id);

    // Recalculate allProductsPrice
    const allProductsPrice = userExist.items.reduce((total, item) => total + item.totalPrice, 0);
    userExist.allProductsPrice = allProductsPrice;

    // Save the changes to the database
    await userExist.save();

    return res.status(200).json({
      success: true,
      msg: `Item Deleted Successfully`,
      data: userExist,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ success: false, msg: `Backend Server Error:  ${error}` });
  }
});





//get all cart for admin account
router.get('/allCart', async (req, res) => {

    try {

        const allCart = await Cart.find()
       
        res.status(200).json({success : true, msg : `All User Carts Found Successfully ......` , data : allCart  })

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




//all cart for single user account
router.get('/singleUser/:userId', async (req, res) => {

    const { userId} = req.params;

    try {

        const user = await Cart.findOne({userId: userId}).populate('items.productId');

        if(!user) {
            return res.status(404).json({ success: false, msg: `User Not Found`})
        }
       
        res.status(200).json({success : true, msg : `User Cart Found  Successfully ......` ,data : user   })

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});



//single user for sinlge product
router.get('/singleCart/:userId/:productId', async (req, res) => {

    const { userId , productId} = req.params;

    try {

        const singleProduct = await Cart.findOne({
            userId: userId,
            'items.productId': productId
        })

        if(!singleProduct){
            return res.status(404).json({ success : false , msg : `Product not found ` });
        }
       
        res.status(200).json({success : true,  msg: `User Cart Found Successfully`,  data : singleProduct})

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});


module.exports = router;
