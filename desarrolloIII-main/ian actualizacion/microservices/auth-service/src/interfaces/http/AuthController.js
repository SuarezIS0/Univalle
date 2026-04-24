class AuthController {
  constructor({ registerUser, loginUser, verifyToken }) {
    this.registerUser = registerUser;
    this.loginUser = loginUser;
    this.verifyToken = verifyToken;
  }

  register = async (req, res) => {
    try {
      const user = await this.registerUser.execute(req.body);
      res.status(201).json(user.toPublicJSON());
    } catch (e) { res.status(400).json({ error: e.message }); }
  };

  login = async (req, res) => {
    try {
      const result = await this.loginUser.execute(req.body);
      res.json(result);
    } catch (e) { res.status(401).json({ error: e.message }); }
  };

  verify = async (req, res) => {
    try {
      const payload = this.verifyToken.execute({ token: req.body.token });
      res.json({ valid: true, payload });
    } catch { res.status(401).json({ valid: false }); }
  };
}

module.exports = { AuthController };
