const {fetchSubmissions} = require("../../logic/leetcode_api")
const { getUser } = require("../../logic/user/user")
const HttpError = require("../../models/http_error")
const moment = require('moment');
require('moment-timezone');
const dailyReviewHandler = async (request, response, next) => {
    const userId = request.userData.userId
    try {
        const user = await getUser(userId)
        console.log("haha suer", user)
        submissions = await fetchSubmissions(user.site, 0, 100, user.leetSession)
        console.log("submissions is", submissions)

        submissions.forEach(submission => {
            //todo 允许用户修改时区
            submission.time = moment.unix(submission.timestamp).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
        })
        response.status(200).json(submissions)
    }catch (error) {
        console.log("dailyReviewHandler error", error)
        return next(new HttpError("internal error", 500))
    }
}

module.exports = dailyReviewHandler



