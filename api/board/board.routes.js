const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {addBoard, getBoards, deleteBoard} = require('./board.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getBoards)
router.post('/',  log, requireAuth, addBoard)
router.delete('/:id',  requireAuth, deleteBoard)

module.exports = router