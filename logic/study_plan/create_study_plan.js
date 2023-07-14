const StudyPlanModel = require("../../models/study_plan");

async function createStudyPlan(plan) {
    const id = plan.id
    if (id) {
        delete plan.id
        return StudyPlanModel.findByIdAndUpdate(id, plan)
    }
    return StudyPlanModel.create(plan)
}



module.exports = createStudyPlan