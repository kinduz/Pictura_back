const jwt = require('jsonwebtoken');
const db = require('../config/db');
const ApiError = require('../exceptions/api-error');
require('dotenv').config();

class JwtService {
  constructor() {
    this.secret = process.env.JWT_ACCESS_SECRET;
    this.secretRefresh = process.env.JWT_REFRESH_SECRET;
  }

  async generateTokens(payload) {
    const accessToken = jwt.sign(payload, this.secret, {expiresIn: "30m"})
    const refreshToken = jwt.sign(payload, this.secretRefresh, {expiresIn: "30d"})
    return {
      accessToken, 
      refreshToken
    }
  }

  async saveToken(id, refreshToken) {
    await db.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, id]);
    return;
  }

  async validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  async validateRefreshToken(refreshToken) {
    try {
      const userData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthoriedError();
    }
    const userData = await this.validateRefreshToken(refreshToken);
    const user = await db.query(`SELECT * FROM users WHERE refresh_token = $1`, [refreshToken])
    if (!userData || !user) {
      throw ApiError.UnauthoriedError();
    }
    const token = await this.generateTokens({
      id: user.id,
      is_verified: user.is_verified,
      email: user.email
    })
    this.saveToken(user.id, token.refreshToken)
    return {
      refreshToken: token.refreshToken,
      accessToken: token.accessToken
    };
  }

  async logout(refreshToken) {
    await db.query(`UPDATE users SET refresh_token = $1 WHERE refresh_token = $2`, [null, refreshToken]);
    return;
  }
}

module.exports = new JwtService;