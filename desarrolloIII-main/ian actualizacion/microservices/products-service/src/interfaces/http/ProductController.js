function view(p) {
  return {
    _id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    image: p.image,
    category: p.category,
    archivedAt: p.archivedAt,
  };
}

class ProductController {
  constructor({ listProducts, getProduct, createProduct, updateProduct, archiveProduct, reduceStock, seedProducts, countProducts }) {
    this.listProducts = listProducts;
    this.getProduct = getProduct;
    this.createProduct = createProduct;
    this.updateProduct = updateProduct;
    this.archiveProduct = archiveProduct;
    this.reduceStock = reduceStock;
    this.seedProducts = seedProducts;
    this.countProducts = countProducts;
  }

  list = async (req, res) => {
    try {
      const items = await this.listProducts.execute({
        category: req.query.category,
        search: req.query.search,
        includeArchived: req.query.includeArchived === "true",
      });
      const data = items.map(view);
      res.json({ success: true, data, count: data.length });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  };

  getById = async (req, res) => {
    try {
      const p = await this.getProduct.execute({ id: req.params.id });
      res.json({ success: true, data: view(p) });
    } catch (e) {
      if (e.code === "ARCHIVED") return res.status(410).json({ success: false, error: e.message });
      res.status(404).json({ success: false, error: e.message });
    }
  };

  create = async (req, res) => {
    try {
      const p = await this.createProduct.execute(req.body);
      res.status(201).json({ success: true, data: view(p) });
    } catch (e) { res.status(400).json({ success: false, error: e.message }); }
  };

  update = async (req, res) => {
    try {
      const p = await this.updateProduct.execute({ id: req.params.id, changes: req.body });
      res.json({ success: true, data: view(p) });
    } catch (e) { res.status(400).json({ success: false, error: e.message }); }
  };

  archive = async (req, res) => {
    try {
      const p = await this.archiveProduct.execute({ id: req.params.id });
      res.json({ success: true, data: view(p) });
    } catch (e) { res.status(400).json({ success: false, error: e.message }); }
  };

  reduceStockHandler = async (req, res) => {
    try {
      const p = await this.reduceStock.execute({ id: req.params.id, quantity: req.body.quantity });
      res.json({ success: true, data: view(p) });
    } catch (e) {
      const code = e.message === "Stock insuficiente" ? 409 : 404;
      res.status(code).json({ success: false, error: e.message });
    }
  };

  seed = async (_req, res) => {
    try {
      const count = await this.seedProducts.execute();
      res.status(201).json({ success: true, count });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  };

  count = async (_req, res) => {
    const count = await this.countProducts();
    res.json({ count });
  };
}

module.exports = { ProductController };
