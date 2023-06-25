const express = require("express");
const router = express.Router();
const Practice = require("../../models/practice");
const jwt = require("jsonwebtoken");
const checkSubmission = require("../../logic/leetcode_api");
const promiseRetry = require("promise-retry");
const Question = require("../../models/questions");
const DLocks = require("mongo-distributed-locks");
var AsyncLock = require("async-lock");
const checkAuth = require("../../middleware/check-auth");
const HttpError = require("../../models/http_error");
const User = require("../../models/user");
const syncHandler = require("./sync_user_practices");
const dailyReviewHandler = require("./daily_review_controller");
const moment = require("moment");
require("moment-timezone");
var lock = new AsyncLock();

const convertTags = (tags) => {
  console.log("tags is", tags);
  if (!!!tags) {
    return;
  }
  ret = [];
  tags.forEach((tag) => {
    ret.push(tag.name);
  });
  return ret;
};

const createExerciseLog = async (request, response, next) => {
  const userID = request.userData.userId;
  const { site, submissionID } = request.body;
  lock
    .acquire(submissionID, async () => {
      console.log("lock success", submissionID);
      try {
        //fetch exercise result
        data = await promiseRetry(function (retry, number) {
          console.log("retry", number);
          return checkSubmission(site, submissionID)
            .then((data) => {
              console.log("checkSubmission data is", data);
              if (!data || (data.state && data.state === "PENDING")) {
                throw Error("pending, retry");
              }
              return data;
            })
            .catch(retry);
        });
        console.log("fetch submission data", data);
        let questionID = data.question_id;
        let exercise = await Practice.findOne({ userID: userID, questionID });
        const create = exercise === null;
        //create exercise record
        if (create) {
          exercise = new Practice({
            userID: userID,
            questionID,
            exerciseLogs: [],
            rating: 0,
            tags: [],
            masterLevel: 0,
          });
          //set tags
          let question = await Question.find().in(
            "frontendQuestionId",
            questionID
          );
          exercise.tags = convertTags(question.topicTags);
        } else {
          //check if handled
          if (
            exercise.exerciseLogs.some((item) => {
              return item.submissionID === submissionID;
            })
          ) {
            console.log("same submissionID logged, return ");
            response.sendStatus(200);
            return;
          }
        }

        //create log
        exercise.exerciseLogs.push({
          lang: data.lang,
          submissionID,
          exerciseResult: data.status_msg,
        });
        let savedExercise;
        if (create) {
          savedExercise = await Practice.create(exercise);
        } else {
          savedExercise = await exercise.save();
        }
        response.status(200).json(savedExercise);
      } catch (error) {
        console.log(error);
        throw new HttpError("create log fail", 500);
      }
    })
    .then(() => console.log("release lock"));
};

const exerciseResultPretty = (raw) => {
  if (raw === "Accepted") {
    return "AC";
  } else if (raw === "Wrong Answer") {
    return "WA";
  } else {
    return "CE";
  }
};

function buildQuestionUrl(titleSlug, site) {
  if (site === "us") {
    return "https://leetcode.com/problems/" + titleSlug;
  } else {
    return "https://leetcode.cn/problems/" + titleSlug;
  }
}

const getPracticeListHandler = async (request, response, next) => {
  const questionIDList = [];
  const res = [];
  try {
    const userId = request.userData.userId;
    let user = await User.find({ userId });

    let practiceList = await Practice.find({ userId }).sort({lastSubmittedAt:-1});
    practiceList.forEach((practice) => {
      questionIDList.push(practice.questionId);
    });
    let questions = await Question.find().in(
      "frontendQuestionId",
      questionIDList
    );
    let questionMap = new Map();
    questions.forEach((item) => {
      questionMap.set(item.frontendQuestionId, item.toJSON());
    });
    practiceList.forEach((practice) => {
      let newObj = { ...practice.toObject() };
      if (newObj.lastSubmittedAt) {
        newObj.lastSubmittedAtTime = moment
          .unix(newObj.lastSubmittedAt)
          .tz("Asia/Shanghai")
          .format("YYYY-MM-DD HH:mm:ss");
      }
      console.log("new Obj.questioNId", newObj.questionId);
      const question = questionMap.get(newObj.questionId);
      if (question) {
        console.log("haha");
        newObj.topicTags = question.topicTags;
        newObj.difficulty = question.difficulty;
        newObj.title = question.title;
        newObj.topicTags = question.topicTags;
        newObj.url = buildQuestionUrl(question.titleSlug, user.site);
      }
      res.push(newObj);
    });
    // console.log("json is", JSON.stringify({data: res}))
    response.status(200).json({
      data: res,
    });
  } catch (error) {
    console.log(error);
    response.status(500).json(error);
  }
};

const updateRecord = (req, res, next) => {
  console.log("update record");
  const userId = req.userData.userId;
  const recordId = req.params.recordId;
  lock
    .acquire(recordId, async () => {
      console.log("lock success", recordId);
      try {
        let practice = await Practice.findOne({ _id: recordId });
        console.log("findExercise", practice);
        if (!practice || practice.userId != userId) {
          throw new HttpError("You do not have the permission to update", 500);
        }
        practice = Object.assign(practice, req.body);
        console.log("new exercise is", practice);
        savedExercise = await practice.save();
        res.status(200).json(savedExercise);
      } catch (error) {
        console.log(error);
        throw new HttpError(" failed", 500);
      }
    })
    .then(() => console.log("release lock"));
};

const getDailyRecord = async (req, res, next) => {
  console.log("getDailyRecord record");
  const userId = req.userData.userId;
  try {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    let exercises = await Practice.find({
      userID: userId,
      "exerciseLogs.createdAt": {
        $gt: today,
      },
    });
    console.log("findExercise", exercises);
    res.status(200).json(exercises);
  } catch (error) {
    console.log(error);
    throw new HttpError(" failed", 500);
  }
};

router.use(checkAuth);
router.get("/", getPracticeListHandler);
router.post("/", createExerciseLog);
router.get("/dailyreview", dailyReviewHandler);
router.post("/sync", syncHandler);
router.patch("/:recordId", updateRecord);
const nihao = (req, res, next) => {
  res.status(200).send("haha");
};
router.get("/dailyreview", getDailyRecord);

module.exports = router;
