const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags - be sure to include its associated Product data
  try{
    const tagData = await Tag.findAll({
      include:[
        {model:Product,attributes:['id','product_name','price','stock','category_id'], as: "products"}
      ]
    });
    let tags = tagData.map((tagy)=> tagy.get({plain:true}));
    console.log('================start of tags log=======================')
    console.log(tags);
    res.send(tags);
  }catch(err){
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id` - be sure to include its associated Product data
  try{
    const tagData = await Tag.findByPk(req.params.id,{
      include:[
        {model:Product,attributes:['id','product_name','price','stock','category_id'], as: "products"}
      ]
    });

    if(!tagData){
      res.status(404).json({message: 'No tag found with this id!'});
      return;
    };
    console.log('===================start of one Tag log=====================')
    console.log(tagData);
    res.send(tagData);
  }catch(err){
    console.log(err);
    res.status(500).json(err);
  }
});

router.post('/', async(req, res) => {
  try{
    const tagData = await Tag.create(req.body)
    ///////////////chris add from below
    .then((tag) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.productIds.length) {
        const tagProductIdArr = req.body.productIds.map((product_id) => {
          return {
            tag_id: tag.id,
            product_id,
          };
        });
        return ProductTag.bulkCreate(tagProductIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(tag);
    })
    .then((tagProductIds) => res.status(200).json(tagProductIds))
    // second res.status might be causing problems
   // https://www.datainfinities.com/43/cant-set-headers-after-they-are-sent-to-the-client
    // .catch((err) => {
    //   console.log(err);
    //   res.status(400).json(err);
    // });
    ////////////////end chris
    // res.status(200).json(tagData);
  } catch(err){
    console.log(err),
    res.status(400).json(err);
  }
  /* req.body should look like this...
    {
      "tag_name": "sparkles",
      "productIds": [2, 6]
    }
  */
});


  // update a tag's name and product by its `id` value
  // {
  //   "tag_name": "sparklez",
  //   "productIds": [2, 5]
  // }

router.put('/:id', async (req, res) => {
  await Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      if (req.body.productIds && req.body.productIds.length) {
        
        ProductTag.findAll({
          where: { tag_id: req.params.id }
        }).then((tagsProduct) => {
          // create filtered list of new tag_ids
          const tagProductIds = tagsProduct.map(({ product_id }) => product_id);
          const newTagProducts = req.body.productIds
          .filter((product_id) => !tagProductIds.includes(product_id))
          .map((product_id) => {
            return {
              tag_id: req.params.id,
              product_id,
            };
          });

            // figure out which ones to remove
          const tagsProductToRemove = tagsProduct
          .filter(({ product_id }) => !req.body.productIds.includes(product_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: tagsProductToRemove } }),
            ProductTag.bulkCreate(newTagProducts),
          ]);
        });
      }

      return res.json(tag);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try{
    const tagData = await Tag.destroy({
      where:{
        id: req.params.id
      }
    });

    if(!tagData){
      res.status(404).json({message:'No tag found with this id!'});
      return;
    };
    res.status(200).json(tagData);
  }catch(err){
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;