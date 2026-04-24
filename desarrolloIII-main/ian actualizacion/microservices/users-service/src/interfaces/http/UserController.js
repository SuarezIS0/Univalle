class UserController {
  constructor({ listUsers, getUser, updateUser, deleteUser, promoteToAdmin, countUsers }) {
    this.listUsers = listUsers;
    this.getUser = getUser;
    this.updateUser = updateUser;
    this.deleteUser = deleteUser;
    this.promoteToAdmin = promoteToAdmin;
    this.countUsers = countUsers;
  }

  list = async (_req, res) => {
    try {
      const data = await this.listUsers.execute();
      res.json({ success: true, data, count: data.length });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  };

  getById = async (req, res) => {
    try {
      const data = await this.getUser.execute({ id: req.params.id });
      res.json({ success: true, data });
    } catch (e) { res.status(404).json({ success: false, error: e.message }); }
  };

  update = async (req, res) => {
    try {
      const data = await this.updateUser.execute({ id: req.params.id, ...req.body });
      res.json({ success: true, data });
    } catch (e) { res.status(400).json({ success: false, error: e.message }); }
  };

  remove = async (req, res) => {
    try {
      await this.deleteUser.execute({ id: req.params.id });
      res.json({ success: true });
    } catch (e) { res.status(404).json({ success: false, error: e.message }); }
  };

  promote = async (req, res) => {
    try {
      const data = await this.promoteToAdmin.execute(req.body);
      res.json({ success: true, message: `${data.email} ahora es admin` });
    } catch (e) {
      const code = e.message === "Secret inválido" ? 401 : 404;
      res.status(code).json({ success: false, error: e.message });
    }
  };

  count = async (_req, res) => {
    const count = await this.countUsers();
    res.json({ count });
  };
}

module.exports = { UserController };
