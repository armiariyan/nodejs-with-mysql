const express = require('express');
const dataController = require('../controllers/data.controller');
const checkAuthMiddleware = require('../middleware/auth')

const router = express.Router();

router.get('/', dataController.index);
router.get('/get', dataController.pagination);
router.get('/exportExcel', checkAuthMiddleware.checkAuth, dataController.exportExcel);
router.get('/exportJson', checkAuthMiddleware.checkAuth, dataController.exportJson);
router.post('/importJson', checkAuthMiddleware.checkAuth, dataController.importJson);
router.post('/importCsv', checkAuthMiddleware.checkAuth, dataController.importCsv);
router.get('/:id', dataController.show);
router.post('/', checkAuthMiddleware.checkAuth, dataController.store);
router.put('/:id', checkAuthMiddleware.checkAuth, dataController.update);
router.delete('/:id', checkAuthMiddleware.checkAuth, dataController.destroy);



module.exports = router;