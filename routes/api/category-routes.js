const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async(req, res) => {
  // find all categories - be sure to include its associated Products
  try{
    const categoryData = await Category.findAll({
      include:[{ model:Product, attributes:['id', 'product_name','price','stock','category_id']}]
    });
    let categories = categoryData.map((categoryy)=>categoryy.get({plain:true}));
    console.log('===============log of all categories================');
    console.log(categories);
    res.send(categories);
  } catch(err){
    console.log(err);
    res.status(500).json(err)
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value - be sure to include its associated Products
  try{
    const categoryData = await Category.findByPk(req.params.id,{
      include:[{ model:Product, attributes:['id', 'product_name','price','stock','category_id']}]
    });

    if(!categoryData){
      res.status(404).json({message: 'No category found with this id!'
      });
      return;
    };
    console.log('===================start of one Category log==============')
    console.log(categoryData);
    res.send(categoryData);
  } catch(err){
    console.log(err);
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
    /* req.body should look like this...
    {
      "category_name": "Cat Toys"
    }
  */
  try{
    const categoryData = await Category.create(req.body)
    res.status(200).json(categoryData);
  } catch(err){
    console.log(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async(req, res) => {
  // update a category by its `id` value
    /* req.body should look like this
    {
      "category_name": "Cat Toy"
    }
  */
  try{
    const categoryData = await Category.update(req.body,{
      where:{
        id: req.params.id,
      },
    })
    res.status(200).json(categoryData);
  } catch(err){
    console.log(err),
    req.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try{
    const categoryData = await Category.destroy({
      where:{
        id: req.params.id
      }
    });
    if(!categoryData){
      res.status(404).json({message:"No category found with this id!"})
      return;
      };
      res.status(200).json(categoryData);
  }catch(err){
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;