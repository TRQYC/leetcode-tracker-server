const StudyPlanModel = require("../../models/study_plan");

async function createStudyPlan(plan) {
    return StudyPlanModel.create(plan)
}



module.exports = createStudyPlan