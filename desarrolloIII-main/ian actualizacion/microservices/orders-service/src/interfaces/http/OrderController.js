function view(o) {
  return {
    _id: o.id,
    userId: o.userId,
    items: o.items,
    total: o.total,
    shipping: o.shipping,
    status: o.status,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

class OrderController {
  constructor({ createOrder, listOrders, getOrder, updateOrderStatus, confirmOrder, getMetrics }) {
    this.createOrder = createOrder;
    this.listOrders = listOrders;
    this.getOrder = getOrder;
    this.updateOrderStatus = updateOrderStatus;
    this.confirmOrder = confirmOrder;
    this.getMetrics = getMetrics;
  }

  list = async (req, res) => {
    try {
      const scope = req.query.scope;
      if (scope === "all" && req.user.role !== "admin")
        return res.status(403).json({ success: false, error: "Solo administradores" });
      const orders = await this.listOrders.execute({ userId: req.user.id, scope });
      res.json({ success: true, data: orders.map(view) });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  };

  getById = async (req, res) => {
    try {
      const o = await this.getOrder.execute({
        id: req.params.id,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });
      res.json({ success: true, data: view(o) });
    } catch (e) {
      const code = e.code === "FORBIDDEN" ? 403 : 404;
      res.status(code).json({ success: false, error: e.message });
    }
  };

  create = async (req, res) => {
    try {
      const o = await this.createOrder.execute({
        userId: req.user.id,
        items: req.body.items,
        shipping: req.body.shipping,
      });
      res.status(201).json({ success: true, data: view(o) });
    } catch (e) { res.status(400).json({ success: false, error: e.message }); }
  };

  updateStatus = async (req, res) => {
    try {
      const o = await this.updateOrderStatus.execute({ id: req.params.id, status: req.body.status });
      res.json({ success: true, data: view(o) });
    } catch (e) { res.status(400).json({ success: false, error: e.message }); }
  };

  confirm = async (req, res) => {
    try {
      const o = await this.confirmOrder.execute({ id: req.params.id });
      res.json({ success: true, data: view(o) });
    } catch (e) { res.status(400).json({ success: false, error: e.message }); }
  };

  metrics = async (_req, res) => {
    try {
      const data = await this.getMetrics.execute();
      res.json({ success: true, data });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  };
}

module.exports = { OrderController };
