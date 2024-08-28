// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.belongsTo(Category,{
  foreignKey: "category_id",
  onDelete: "CASCADE"
});
// Categories have many Products
Category.hasMany(Product,{
  foreignKey: "category_id",
  onDelete: "CASCADE"
});
// Product belongToMany Tag (through ProductTag)
Product.belongsToMany(Tag,{
  foreignKey: 'product_id',
  through:{
    model: ProductTag,
    unique: false,
  },
  as: "tags"
});

// Tag belongToMany Product (through ProductTag)
Tag.belongsToMany(Product, {
  foreignKey: 'tag_id',
  through:{
    model: ProductTag,
    unique: false,
  },
  as: "products"
})

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};