const Sequelize = require('sequelize');
const sequelize = require('./sequelizeConfig');

const Categoria = sequelize.define('Categoria', {
  id_categoria: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  id_supermercado: { type: Sequelize.INTEGER, allowNull: false },
  titulo: { type: Sequelize.STRING(45), allowNull: false },
}, {
  tableName: 'categoria',
});

const Subcategoria = sequelize.define('Subcategoria', {
  id_subcategoria: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  id_categoria: { type: Sequelize.INTEGER, allowNull: false },
  titulo: { type: Sequelize.STRING(45), allowNull: false },
}, {
  tableName: 'subcategoria',
});

const Producto = sequelize.define('Producto', {
  id_producto: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  id_subcategoria: { type: Sequelize.INTEGER, allowNull: false },
  id_supermercado: { type: Sequelize.INTEGER, allowNull: false },
  titulo: Sequelize.TEXT,
  imagen: Sequelize.TEXT,
  precio: Sequelize.FLOAT,
  precioporkilo: Sequelize.FLOAT,
}, {
  tableName: 'producto',
});

const Supermercado = sequelize.define('Supermercado', {
  id_supermercado: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: Sequelize.STRING(45), allowNull: false },
  imagen: Sequelize.TEXT,
  descripcion: Sequelize.TEXT,
}, {
  tableName: 'supermercado',
});

// Definir las relaciones entre los modelos
Categoria.hasMany(Subcategoria, { foreignKey: 'id_categoria' });
Subcategoria.belongsTo(Categoria, { foreignKey: 'id_categoria' });
Subcategoria.hasMany(Producto, { foreignKey: 'id_subcategoria' });
Producto.belongsTo(Subcategoria, { foreignKey: 'id_subcategoria' });
Producto.belongsTo(Supermercado, { foreignKey: 'id_supermercado' });
Supermercado.hasMany(Producto, { foreignKey: 'id_supermercado' });

module.exports = { Categoria, Subcategoria, Producto, Supermercado };