const { trusted } = require('mongoose')
const {fetchProgress} = require('../leetcode_api')
const PracticeModel = require('../../models/practice')
const HttpError = require('../../models/http_error')

async function syncUserQuestionsEN(userId, session) {
  
}

// todo 当前只同步了CN区 ，等待同步英文区
// 此函数不应当频繁调用。采用pull模式触发
async function syncUserQuestionsProxy(user, fastMode) {
  console.log("user is", user)
  const site = user.site 
  const userId = user.userId 
  const session = user.leetSession
  if (!session || session === "") {
    throw new HttpError("To sync practices, you must fill up session in account settings", 401)
  }
  if (site === "cn") {
    return syncUserQuestions(userId, session, fastMode)
  }else {
    return syncUserQuestionsEN(userId, session, fastMode)
  }
}

async function syncUserQuestions(userId, session, fastMode) {
    console.log("syncUserQuestions", userId, session)
    const statusList = [ "FAILED", "ACCEPTED"];
    for (const status of statusList) {
      let offset = 0 
      let limit = 50 
      let doContinue = true
      while (doContinue) {
      try {
      const ops = []
         data = await fetchProgress("cn", status, session, offset, limit)
         console.log(offset, limit, data)
          if (fastMode || !data || !data.questions || data.questions.length === 0) {
            doContinue = false;
          }
          offset += limit 
          console.log("data is", data);
          data && data.questions && data.questions.forEach((question) => {
              ops.push({
                  updateOne: {
                      filter: {
                          userId: userId, 
                          questionId: question.frontendId
                      }, 
                      //todo 避免存在的时候更新, mostly to update lastSubmittedAt
                      update: {
                          userId: userId, 
                          questionId: question.frontendId,
                          lastSubmittedAt: question.lastSubmittedAt, 
                          translatedTitle: question.translatedTitle, 
                          numSubmitted: question.numSubmitted, 
                          status: status, 
                      },
                      upsert:true,
                  }
              })
            console.log(question);
          });
          res = await PracticeModel.bulkWrite(ops)
          console.log("1 loop finish", res)
        } catch (err) {
          console.log("err", err)
          };
      }
  }
  }
  
  module.exports = syncUserQuestionsProxy