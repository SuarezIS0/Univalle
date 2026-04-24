/**
 * Puerto para consultar y mutar stock en el catálogo.
 * La implementación (HTTP hacia products-service) vive en infrastructure/.
 */
class ProductCatalog {
  async getProduct(_id) { throw new Error("not implemented"); }
  async reduceStock(_id, _quantity) { throw new Error("not implemented"); }
}
module.exports = { ProductCatalog };
