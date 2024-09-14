const db = require("../config/db");

class PictController {
    async getTags(req, res) {
        const size = parseInt(req.query.size, 10) || 20;
        const page = parseInt(req.query.page, 10) || 1;

        if (size < 1 || page < 1) {
            return res.status(400).json({ status: "failure", message: "'size' and 'page' must be greater than 0" });
        }

        const offset = (page - 1) * size;
        try {
            const tags = await db.query("SELECT * FROM tags ORDER BY RANDOM() LIMIT $1 OFFSET $2", [size, offset]);
            const totalTags = await db.query(`SELECT COUNT(*) FROM tags`);
            res.status(200).json({
                status: "success",
                tags: tags.rows,
                total: parseInt(totalTags.rows[0].count, 10),
                page,
                size
            });
        } catch (e) {
            res.status(500).json({status: "failure", message: e.message})
        }
    }

    async getTagsWithSearch(req, res) {
        const searchTerm = req.query.term;
        if (!searchTerm) {
            return res.status(400).json({status: "failure", message: "Не передан параметр для поиска"});
          }
        try {
            const tags = await db.query(`SELECT * FROM tags WHERE value ILIKE '%' || $1 || '%'`, [searchTerm]);
            res.status(200).json({status: "success", tags: tags.rows});
        } catch (e) {
            console.log(e);
            
            res.status(500).json({message: e.message})
        }
    }
}

module.exports = new PictController()