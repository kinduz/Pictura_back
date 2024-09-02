const db = require("../config/db");

class UserController {
    async createUser(req, res) {
        const {name, surname} = req.body;
        const newUser = await db.query(`INSERT INTO users (name, surname) values ($1, $2) RETURNING *`, [name, surname]);
        res.json(newUser.rows[0])
    }

    async getUsers(req, res) {
        const users = await db.query(`SELECT * FROM users`);
        res.json(users.rows)
    }

    async getOneUser(req, res) {
        const {id} = req.params;
        const user = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
        res.json(user.rows[0])
    }

    async updateUser(req, res) {
        const {id, name, surname} = req.body;
        const user = await db.query(`UPDATE users set name = $1, surname = $2 WHERE id = $3`, [name, surname, id]);
        res.json(user.rows[0])
    }

    async deleteUser(req, res) {
        const {id} = req.params;
        const user = await db.query(`DELETE FROM users WHERE id = $1`, [id]);
        res.json(user.rows[0])
    }
}

module.exports = new UserController();