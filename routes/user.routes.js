const Router = require('express');
const router = new Router()
const userController = require('../controller/user.controller')

router.post('/user', userController.createUser)
router.get('/users', userController.getUsers)
router.get('/user/:id', userController.getOneUser)
router.delete('/user/:id', userController.deleteUser)
router.put('/user', userController.updateUser)

module.exports = router;