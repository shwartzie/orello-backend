const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const authService = require('../auth/auth.service')
const socketService = require('../../services/socket.service')
const boardService = require('./board.service')
async function getBoards(req, res) {
    try {
        const boards = await boardService.query(req.query)
        res.send(boards)
    } catch (err) {
        logger.error('Cannot get boards', err)
        res.status(500).send({ err: 'Failed to get boards' })
    }
}
async function getBoard(req, res) {
    try {
        const boardId = req.params.id
        const board = await boardService.getById(boardId)
        res.json(board)
    } catch (err) {
        logger.error('Failed to get board', err)
        res.status(500).send({ err: 'Failed to get board' })
    }
}


async function deleteBoard(req, res) {
    try {
        const deletedCount = await boardService.remove(req.params.id)
        if (deletedCount === 1) {
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove board' })
        }
    } catch (err) {
        logger.error('Failed to delete board', err)
        res.status(500).send({ err: 'Failed to delete board' })
    }
}


async function addBoard(req, res) {

    var loggedinUser = authService.validateToken(req.cookies?.loginToken)
 
    try {
        var board = req.body
        board.byUserId = loggedinUser._id
        board = await boardService.add(board, loggedinUser)
        board.aboutUser = await userService.getById(board.byUserId)
        board.byUser = loggedinUser
        socketService.broadcast({type: 'board-added', data: board, userId: loggedinUser._id.toString()})
        socketService.emitToUser({type: 'board-about-you', data: board, userId: board.aboutUserId})
        
        const fullUser = await userService.getById(loggedinUser._id)
        socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

        res.send(board)

    } catch (err) {
        logger.error('Failed to add board', err)
        res.status(500).send({ err: 'Failed to add board' })
    }   
}

async function updateBoard(req, res) {
    try {
      const board = req.body
      const updatedBoard = await boardService.update(board)
      res.json(updatedBoard)
    } catch (err) {
      logger.error("Failed to update board", err)
      res.status(500).send({ err: "Failed to update board" })
    }
  }

module.exports = {
    getBoards,
    deleteBoard,
    addBoard,
    getBoard,
    updateBoard,
}