const Question = require("../../models/questions");
const {mGetQuestions} = require("../question/convert_to_dto")
const StudyPlanModel = require("../../models/study_plan");

async function getStudyPlan(planId) {
    return StudyPlanModel.findById(planId)
}

async function getStudyPlanList(limit, offset) {
    return StudyPlanModel.find({visibility:"public"}).limit(limit).skip(offset).exec()
}
// owned private lists 
async function getOwnedStudyPlanList(userId, limit, offset) {
    if (userId == 0) {
        return []
    }
    return StudyPlanModel.find({creatorUserId:userId, visibility: "private"}).limit(limit).skip(offset)
}

async function appendQuestionInfoToPlan(plan) {
    let questionIds = []
    plan.patterns.forEach(pattern => pattern.questionIds.forEach(questionId => questionIds.push(questionId)))
    let [questions, questionMap] = await mGetQuestions(questionIds)
    const newPatterns = plan.patterns.map((pattern)=> {
        let questions = []
        pattern.questionIds.forEach(questionId => questions.push(questionMap.get(questionId)))
        return {name: pattern.name, questions: questions}
    })
    return {...plan, patterns: newPatterns} 
}

module.exports = {
    getStudyPlan: getStudyPlan,
    appendQuestionInfoToPlan: appendQuestionInfoToPlan,
    getStudyPlanList,
    getOwnedStudyPlanList,
}