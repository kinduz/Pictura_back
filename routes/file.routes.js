const Router = require('express');

const router = new Router()
const fileController = require('../controller/file.controller');
const imageUpload = require('../config/multer')
// const authMiddleware = require('../middlewares/auth-middleware');

router.post('/image', imageUpload.single('image'), fileController.uploadImage);
router.get('/image/:filename', fileController.getImage);

module.exports = router;