const Router = require('express');

const router = new Router()
const authMiddleware = require('../middlewares/auth-middleware');
const pictController = require('../controller/pict.controller');

router.get('/get-tags', authMiddleware, pictController.getTags);
router.get('/get-tags/search', authMiddleware, pictController.getTagsWithSearch);

module.exports = router;