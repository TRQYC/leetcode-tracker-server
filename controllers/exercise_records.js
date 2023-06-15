
const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise_records')
const jwt = require('jsonwebtoken')
const checkSubmission = require('../dal/leetcode_api')
const promiseRetry = require('promise-retry');
const Question = require('../models/questions');
const DLocks = require('mongo-distributed-locks');
var AsyncLock = require('async-lock');
const checkAuth = require('../middleware/check-auth')
const HttpError = require('../models/http_error');
const User = require('../models/user');
var lock = new AsyncLock();

const convertTags = (tags) => {
    console.log("tags is", tags)
    if (!!!tags) {
        return 
    }
    ret = []
    tags.forEach(tag => {
        ret.push(tag.name)
    })
    return ret
}

const createExerciseLog = async (request, response, next) => {
    const userID = request.userData.userId
    const {site, submissionID } = request.body
    lock.acquire(submissionID, async () => {
        console.log("lock success", submissionID)
        try {
            //fetch exercise result 
            data = await promiseRetry(function (retry, number) {
                console.log("retry", number)
                return checkSubmission(site, submissionID).then((data) => {
                    console.log("checkSubmission data is", data)
                    if (!data || (data.state && data.state === "PENDING")) {
                        throw Error("pending, retry")
                    }
                    return data
                }).catch(retry)
            })
            console.log("fetch submission data", data)
            let questionID = data.question_id
            let exercise = await Exercise.findOne({ userID: userID, questionID })
            const create = (exercise === null)
            //create exercise record 
            if (create) {
                exercise = new Exercise({
                    userID: userID,
                    questionID,
                    exerciseLogs: [],
                    rating: 0,
                    tags: [],
                    masterLevel: 0,
                })
                //set tags 
                let question = await Question.find().in("frontendQuestionId", questionID)
                exercise.tags = convertTags(question.topicTags)
            } else {
                //check if handled 
                if (exercise.exerciseLogs.some(item => {
                    return item.submissionID === submissionID
                })) {
                    console.log("same submissionID logged, return ")
                    response.sendStatus(200)
                    return
                }
            }

            //create log 
            exercise.exerciseLogs.push({
                lang: data.lang,
                submissionID,
                exerciseResult: data.status_msg
            })
            let savedExercise
            if (create) {
                savedExercise = await Exercise.create(exercise)
            } else {
                savedExercise = await exercise.save()
            }
            response.status(200).json(savedExercise)
        } catch (error) {
            console.log(error)
            throw new HttpError("create log fail", 500)
        }
    }).then(() => console.log("release lock"))
}

const exerciseResultPretty = (raw) => {
    if (raw === "Accepted") {
        return "AC"
    } else if (raw === "Wrong Answer") {
        return "WA"
    } else {
        return "CE"
    }
}

function buildQuestionUrl(titleSlug, site) {
    if (site === "us") {
        return  "https://leetcode.com/problems/" + titleSlug
    }else {
        return "https://leetcode.cn/problems/" + titleSlug
    }
}

const getExerciseRecordsHandler = async (request, response, next) => {
   
    const questionIDList = []
    const res = []
    try {
        const userID = request.userData.userId
        let user = await User.find({userID})

        let exercises = await Exercise.find({ userID })
        exercises.forEach(exercise => {
            questionIDList.push(exercise.questionID)
        })
        let questions = await Question.find().in("frontendQuestionId", questionIDList)
        let questionMap = new Map()
        questions.forEach(item => {
            questionMap.set(item.frontendQuestionId, item.toJSON());
        });
        exercises.forEach(exercise => {
            console.log("q is", questionMap[exercise.questionID])
            let newObj = { ...exercise.toObject(), ...questionMap.get(exercise.questionID) }
            let lastSubmitted = -1
            daySet = new Set()
            const lastSubmissionList = []
            for (let i = exercise.exerciseLogs.length - 1; i >= 0; i--) {
                exerciseLog = exercise.exerciseLogs[i]
                const submitted = new Date(exerciseLog.createdAt)
                console.log("haha", submitted)
                daySet.add(submitted.getDate())
                if (lastSubmitted === -1 || (submitted.getDate() === lastSubmitted.getDate() && 
                submitted.getMonth() === lastSubmitted.getMonth() && 
                submitted.getFullYear() === lastSubmitted.getFullYear())) {
                    lastSubmissionList.push(exerciseResultPretty(exerciseLog.exerciseResult))
                    lastSubmitted = submitted
                }   
            }
            newObj.lastSubmitted = lastSubmitted.toLocaleDateString('zh-CN')
            newObj.lastSubmissionList = lastSubmissionList
            newObj.exerciseRounds = daySet.size 
            newObj.url = buildQuestionUrl(newObj.titleSlug, user.site)
            console.log("newObj", newObj)
            res.push(newObj)
        })
        // console.log("json is", JSON.stringify({data: res}))
        response.status(200).json({
            data: res
        })

    } catch (error) {
        console.log(error)
        response.status(500).json(error)
    }
}

const updateRecord = (req, res, next) => {
    console.log("update record")
    const userID = req.userData.userId
    const recordId = req.params.recordId
    lock.acquire(recordId, async () => {
        console.log("lock success", recordId)
        try {
            let exercise = await Exercise.findOne({_id: recordId })
            console.log("findExercise", exercise)
            if (!exercise || exercise.userID != userID) {
                throw new HttpError("You do not have the permission to update", 500)
            }
            exercise = Object.assign(exercise, req.body)
            console.log("new exercise is", exercise)
            savedExercise = await exercise.save()
            res.status(200).json(savedExercise)
        } catch (error) {
            console.log(error)
            throw new HttpError(" failed", 500)
        }
    }).then(() => console.log("release lock"))
}

const getDailyRecord = async (req, res, next) => {
    console.log("getDailyRecord record")
    const userId = req.userData.userId
    try {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        let exercises = await Exercise.find({userID: userId , 'exerciseLogs.createdAt': {
            $gt:today
        }})
        console.log("findExercise", exercises)
        res.status(200).json(exercises)
    } catch (error) {
        console.log(error)
        throw new HttpError(" failed", 500)
    }
}

router.use(checkAuth)
router.get('/', getExerciseRecordsHandler)
router.post('/', createExerciseLog)
router.patch('/:recordId', updateRecord)
const  nihao = (req, res, next) => {
    res.status(200).send("haha")
}
router.get('/dailyreview', getDailyRecord)

module.exports = router;

