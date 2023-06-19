const Question = require("../models/questions");
graphQLQuestionsList = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
problemsetQuestionList: questionList(
categorySlug: $categorySlug
limit: $limit
skip: $skip
filters: $filters
) {
total: totalNum
questions: data {
  acRate
  difficulty
  freqBar
  frontendQuestionId: questionFrontendId
  isFavor
  paidOnly: isPaidOnly
  status
  title
  titleSlug
  topicTags {
    name
    id
    slug
  }
  hasSolution
  hasVideoSolution
}
}
}
`
// skip must >= 2 
const fetchAllQuestionsEN = (skip, limit) => {
    const queryUrl = `https://leetcode.com/graphql/`;
    return fetch(queryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: graphQLQuestionsList,
          variables: 
            {
                categorySlug: "algorithms",
                skip: skip,
                limit: limit,
                filters: {}
            }
          ,
        }),
      }).then(data => data.json())
    }

offset = 0
limit = 50

const fetchAll = async () => {
    while (true) {
        console.log(offset, limit)
        body = await fetchAllQuestionsEN(offset, limit)
        //todo 
        body.data.problemsetQuestionList.questions.forEach(
            async (item) => {
                let doc = new Question(item)
                console.log(doc)
                await doc.save()
            }
        )
        offset += 50
    }
}   

fetchAll()

