const fetchSubmissions = require("../../dal/leetcode_api");
const User = require("../../models/user");
const syncUserQuestions = require("../practice/sync_user_practiced_questions");


let pageSize = 200
let pageNumber = 0 

function taskSyncUserSubmissions() {
    
    User.find({})
    .skip(pageNumber * pageSize)
    .limit(pageSize)
    .exec((err, users) => {
      if (err) {
        console.error(err);
        return;
      }
      try {
        for (const user of users) {
          await syncUserQuestionsProxy(user)
        }
      }catch (error) {
        console.log("error", error)
      }
  
      // 如果还有更多数据，递归调用 fetchUsers() 获取下一页数据
      if (users.length === pageSize) {
        pageNumber++;
        fetchUsers();
      }
    });
}

//定时任务10S跑一次，用户量上来以后仍然需要使用chrome插件。避免频繁请求。
//const intervalId = setInterval(taskSyncUserSubmissions, 10000);