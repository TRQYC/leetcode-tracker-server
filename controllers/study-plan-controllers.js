const express = require("express");
const router = express.Router();
const HttpError = require("../models/http_error");
const createStudyPlan = require("../logic/study_plan/create_study_plan");
const {appendQuestionInfoToPlan, getStudyPlan, getStudyPlanList, getOwnedStudyPlanList} = require("../logic/study_plan/get_study_plan");
const checkAuth = require('../middleware/check-auth')
function str2List(raw) {
    raw.split(',')
}

const createPlanHandler = async (request, response, next) => {
    const userId = request.userData.userId;
    let plan = request.body
    if (!plan || plan.name === "" || !plan.patterns || plan.patterns.length == 0) {
        return next(new HttpError(400, "request param illegal"))
    }
    plan.creatorUserId = userId
    plan.patterns.forEach(pattern => pattern.questionIds = pattern.questionIds.split(','))
    try {
        const createdPlan = await createStudyPlan(plan)
        response.status(200).json(createdPlan)
    } catch (err) {
        console.log("create plan error", err)
        return next(new HttpError(500))
    }
};

const getPlanHandler = async (request, response, next) => {
    let userId
    if (request.userData) {
        userId = request.userData.userId;
    }
    const planId = request.params.planId
    let plan = request.body
    if (planId == 0) {
        return response.status(400).json({ code: 1, message: "illegal request" })
    }
    try {
        const existedPlan = await getStudyPlan(planId)
        if (existedPlan.visibility != "public" && existedPlan.creatorUserId != userId) {
            return response.status(400).json({ code: 1, message: "You don't have permissions to view this study plan" })
        }
        const planDTO = await appendQuestionInfoToPlan(existedPlan.toJSON())
        return response.status(200).json(planDTO)
    } catch (err) {
        console.log("create plan error", err)
        return next(new HttpError(500))
    }
};

const getPlanListHandler = async (request, response, next) => {
    let userId
    if (request.userData) {
        userId = request.userData.userId;
    }
    try {
        let plans = await getStudyPlanList(200,0)
        const ownedPlans = await getOwnedStudyPlanList(userId, 200, 0)
        
        let ret = []
        plans.forEach(plan => ret.push({name:plan.name, description:plan.description, id:plan._id}))
        ownedPlans.forEach(plan => ret.push({name:plan.name, description:plan.description, id:plan._id}))
        return response.status(200).json(ret)
    } catch (err) {
        console.log("create plan error", err)
        return next(new HttpError(500))
    }
};


function buildQuestionUrl(titleSlug, site) {
    if (site === "us") {
        return "https://leetcode.com/problems/" + titleSlug;
    } else {
        return "https://leetcode.cn/problems/" + titleSlug;
    }
}

router.get("/:planId", getPlanHandler);
router.use(checkAuth);
router.post("/", createPlanHandler);
router.get("/", getPlanListHandler)
module.exports = router;
