const express = require('express');
const bodyParser = require('body-parser');
const { Op } = require('sequelize');
const cors = require('cors');
const { Categoria, Producto, Subcategoria, Supermercado } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
// Habilita CORS para todas las rutas
app.use(cors({
  origin: ['https://sc.madoga.dev, http://localhost:5173'],
  allowedHeaders: ['Authorization', 'Content-Type']
}))

// Controlador para obtener todos los supermercados
app.get('/api/places', async (req, res) => {
  try {
    const places = await Supermercado.findAll();
    const places_serialized = places.map(place => ({
      id_supermercado: place.id_supermercado,
      titulo: place.titulo,
      descripcion: place.descripcion,
      imagen: place.imagen,
    }));
    const data = { places: places_serialized };
    res.json(data);
  } catch (error) {
    res.status(500).json({
      details: error,
      error: 'Error en el servidor'
     });
  }
});

// Controlador para obtener productos por subcategoría
app.get('/api/productos/subcategoria/:id_subcategoria', async (req, res) => {
  try {
    const subcategoria = await Subcategoria.findByPk(req.params.id_subcategoria);
    if (!subcategoria) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }
    const categoria = await Categoria.findByPk(subcategoria.id_categoria);
    const productos = await Producto.findAll({ where: { id_subcategoria: subcategoria.id_subcategoria } });
    const productos_serializados = productos.map(producto => ({
      id_producto: producto.id_producto,
      id_supermercado: producto.id_supermercado,
      titulo: producto.titulo,
      precio: producto.precio,
      precioporkilo: producto.precioporkilo,
      imagen: producto.imagen,
    }));
    const data = {
      categoria: { id_categoria: categoria.id_categoria, titulo: categoria.titulo },
      subcategoria: { id_subcategoria: subcategoria.id_subcategoria, titulo: subcategoria.titulo },
      productos: productos_serializados,
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Controlador para obtener categorías por supermercado
app.get('/api/categorias/:id_supermercado', async (req, res) => {
  try {
    const categorias = await Categoria.findAll({ where: { id_supermercado: req.params.id_supermercado } });
    const categorias_serializadas = categorias.map(categoria => ({
      id_categoria: categoria.id_categoria,
      titulo: categoria.titulo,
    }));
    const data = { categorias: categorias_serializadas };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Controlador para búsqueda de productos
app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q || '';
      const maxResults = parseInt(req.query.max_results) || undefined;
      const orderByPrice = req.query.order_by_price === 'true';

      let products = await Producto.findAll({
        where: {
          titulo: {
            [Op.like]: `%${query}%`,
          },
        },
        order: orderByPrice ? [['precio', 'ASC']] : [],
        limit: maxResults,
      });

      if (!maxResults) {
        maxResults = products.length;
      }

      const page = parseInt(req.query.page) || 1;
      const pageSize = 10; // Change this to your desired page size
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, maxResults);

      const paginatedProducts = products.slice(startIndex, endIndex);

      const results = await Promise.all(
        paginatedProducts.map(async (product) => {
          const supermercado = await Supermercado.findByPk(product.id_supermercado);

          return {
            id_producto: product.id_producto,
            id_supermercado: product.id_supermercado,
            titulo: product.titulo,
            precio: product.precio,
            imagen: product.imagen,
            img_supermercado: supermercado ? supermercado.imagen : null,
          };
        })
      );

      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

// Controlador para obtener subcategorías por categoría
app.get('/api/categorias/:id_categoria/subcategorias', async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id_categoria);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    const subcategorias = await Subcategoria.findAll({ where: { id_categoria: categoria.id_categoria } });
    const subcategorias_serializadas = subcategorias.map(subcategoria => ({
      id_subcategoria: subcategoria.id_subcategoria,
      titulo: subcategoria.titulo,
    }));
    const data = {
      categoria: { id_categoria: categoria.id_categoria, titulo: categoria.titulo },
      subcategorias: subcategorias_serializadas,
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Controlador para obtener el ID de un supermercado por título
app.get('/api/obtener-id-supermercado/:titulo_supermercado', async (req, res) => {
  try {
    const supermercado = await Supermercado.findOne({ where: { titulo: req.params.titulo_supermercado } });
    if (supermercado) {
      return res.json({ id_supermercado: supermercado.id_supermercado });
    }
    res.status(404).json({ error: 'Supermercado no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
