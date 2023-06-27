const Question = require("../../models/questions");

const convertTags = (tags) => {
    if (!!!tags) {
        return;
    }
    ret = [];
    tags.forEach((tag) => {
        ret.push(tag.name);
    });
    return ret;
};

async function mGetQuestions(questionIds) {
    let questions = await Question.find().in(
        "frontendQuestionId",
        questionIds
    );
    let questionMap = new Map();
    questions.forEach((question) => {
      question = question.toJSON(); 
      question.topicTags = convertTags(question.topicTags)
      console.log("forEach, item", question)
      questionMap.set(question.frontendQuestionId, question);
    });
    console.log("from db, questions", questions, questionMap)
    return [questions, questionMap]
}

module.exports = {
    mGetQuestions: mGetQuestions
}
