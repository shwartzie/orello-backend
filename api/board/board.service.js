const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const ObjectId = require("mongodb").ObjectId
const asyncLocalStorage = require("../../services/als.service")

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection("board")
        const boards = await collection.find(criteria).toArray()
        // var boards = await collection.aggregate([
        //     {
        //         $match: criteria
        //     },
        //     {
        //         $lookup:
        //         {
        //             localField: 'byUserId',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'byUser'
        //         }
        //     },
        //     {
        //         $unwind: '$byUser'
        //     },
        //     {
        //         $lookup:
        //         {
        //             localField: 'aboutUserId',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'aboutUser'
        //         }
        //     },
        //     {
        //         $unwind: '$aboutUser'
        //     }
        // ]).toArray()
        // boards = boards.map(board => {
        //     board.byUser = { _id: board.byUser._id, fullname: board.byUser.fullname }
        //     board.aboutUser = { _id: board.aboutUser._id, fullname: board.aboutUser.fullname }
        //     delete board.byUserId
        //     delete board.aboutUserId
        //     return board
        // })
        return boards
    } catch (err) {
        logger.error("cannot find boards", err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection("board")
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(boardId) }
        if (!loggedinUser.isAdmin)
            criteria.byUserId = ObjectId(loggedinUser._id)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function update(board) {
    try {
        var id = ObjectId(board._id)
        delete board._id
        const collection = await dbService.getCollection("board")
        await collection.updateOne({ _id: id }, { $set: { ...board } })
        board._id = id
        return board
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection("board")
        const board = collection.findOne({ _id: ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}, err`)
        throw err
    }
}

async function add(board, user) {
    try {
        const boardToAdd = {
            byUserId: ObjectId(board.byUserId),
            aboutUserId: ObjectId(board.aboutUserId),
            title: board.title,
            title: "Robot dev proj",
            archivedAt: null,
            createdAt: Date.now(),
            isStatic: false,
            isStarred: false,
            createdBy: { fullname: "Abi Abambi", imgUrl: "http://some-img" },
            style: {
                backgroundImg: "https://wallpapercave.com/wp/wp4676582.jpg",
            },
            labels: [
                { id: "r101", title: "Done", color: "#61bd4f" },
                { id: "r102", title: "Progress", color: "#61bd33" },
            ],
            members: [user],
            groups: [
                {
                    id: "q101",
                    title: "Group 1",
                    archivedAt: 1589983468418,
                    type: "container",
                    tasks: [Array],
                    style: {},
                },
                {
                    id: "q102",
                    title: "Group title",
                    archivedAt: 1589983468418,
                    type: "container",
                    tasks: [Array],
                    style: {},
                },
                {
                    id: "q103",
                    title: "more demo",
                    archivedAt: 1589983468418,
                    type: "container",
                    tasks: [Array],
                    style: {},
                },
                {
                    id: "q104",
                    title: "bootcamp",
                    archivedAt: 1589983468418,
                    type: "container",
                    tasks: [Array],
                    style: {},
                },
            ],
            activities: [
                {
                    id: "h101",
                    txt: "Changed Color",
                    createdAt: 154514,
                    byMember: [Object],
                    task: "Replace Logo",
                },
            ],
            cmpsOrder: ["status-picker", "member-picker", "date-picker"],
            isRecentlyViewed: true,
            byUserId: "62dfd7695e8559ec9fbd714b",
        }
        const collection = await dbService.getCollection("board")
        await collection.insertOne(boardToAdd)
        return boardToAdd
    } catch (err) {
        logger.error("cannot insert board", err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.byUserId) criteria.byUserId = filterBy.byUserId
    return criteria
}

module.exports = {
    query,
    remove,
    add,
    getById,
    update,
}
