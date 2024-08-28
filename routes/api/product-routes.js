const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products - be sure to include its associated Category and Tag data

  // https://stackoverflow.com/questions/64799742/sequelize-error-you-must-use-the-as-keyword-to-specify-the-alias-of-the-assoc

  // https://stackoverflow.com/questions/42521665/select-from-multiple-tables-sequelize

 try{
  const productData = await Product.findAll({
    include: [
      {model: Category, attributes:['id','category_name']},
      { model: Tag,attributes:['id','tag_name'],
        as:"tags"}
]
  });
 let products = productData.map((producty) => producty.get({ plain: true }));
 console.log('========================start of log1==========================')
  console.log(products);
  // res.send("<h1>ProductData accessed!</h1>")
  res.send(products);
 }catch(err){
  console.log(err);
  res.status(500).json(err);
 }
});

// get one product
//reference: Mod13L28_Stu_Mini-Project
router.get('/:id', async (req, res) => {
  // find a single product by its `id` - be sure to include its associated Category and Tag data

  try{
    const productData = await Product.findByPk(req.params.id,{
      include: [
        {model: Category, attributes:['id','category_name']},
        { model: Tag,attributes:['id','tag_name'],
          as:"tags"}
      ]
    });
  //  let products = productData.map((producty) => producty.get({ plain: true }));
  if (!productData) {
    res.status(404).json({ message: 'No product found with this id!' });
    return;
  }
   console.log('========================start of oneProductlog==========================')
    console.log(productData);
    // res.send("<h1>ProductData accessed!</h1>")
    res.send(productData)
   }catch(err){
    console.log(err);
    res.status(500).json(err);
   }

});



////////////////this used to create two entries into the product table

// create new product
router.post('/', async(req, res) => {
  try{
    const productData = await Product.create(req.body)
    // ///////////////chris add from below
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    
   // second res.status might be causing problems
   // https://www.datainfinities.com/43/cant-set-headers-after-they-are-sent-to-the-client

    // .catch((err) => {
    //   console.log(err);
    //   res.status(400).json(err);
    // });
    // ////////////////end chris

    // res.status(200).json(productData);
  } 
  catch(err){
    console.log(err),
    res.status(400).json(err);
  }

  /* req.body should look like this...
    {
      "product_name": "Basketball",
      "price": 200.00,
      "stock": 3,
      "category_id": 1
      "tagIds": [1, 2, 3, 4]
    }
  */

  //took lines 109-127 and copied into lines 71-89.  Two Product.create(req.body) lines ended up creating two rows each time in the database.

  // Product.create(req.body)
  //   .then((product) => {
  //     // if there's product tags, we need to create pairings to bulk create in the ProductTag model
  //     if (req.body.tagIds.length) {
  //       const productTagIdArr = req.body.tagIds.map((tag_id) => {
  //         return {
  //           product_id: product.id,
  //           tag_id,
  //         };
  //       });
  //       return ProductTag.bulkCreate(productTagIdArr);
  //     }
  //     // if no product tags, just respond
  //     res.status(200).json(product);
  //   })
  //   .then((productTagIds) => res.status(200).json(productTagIds))
  //   .catch((err) => {
  //     console.log(err);
  //     res.status(400).json(err);
  //   });
});

// update product /// do you need an async here???
router.put('/:id', async (req, res) => {
  // update product data
  await Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async(req, res) => {
  // delete one product by its `id` value
    // update product data
  try{
    const productData = await Product.destroy({
      where:{
        id: req.params.id
      }
    });

    if(!productData){
      res.status(404).json({message: 'No product found with this id!'});
      return;
    };
    res.status(200).json(productData);
  } catch (err){
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;