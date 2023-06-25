const { http } = require("winston");
const syncUserQuestionsProxy = require("../../logic/practice/sync_user_practiced_questions");
const HttpError = require("../../models/http_error");
const User = require("../../models/user");
const user = require("../../logic/user/user");

const syncUserPracticeHandler = async (request, response, next) => {
    const userId = request.userData.userId
    let config = request.body.config
    console.log("config is", config)
    try {
        let user = await User.findOne({ _id: userId })
         // get config 
        if (!config) {
            config = user.syncConfig
            if (!config || !config.site || !config.leetSession) {
                return response.status(400).json({ code: 1, message: "leetcode Session Needed" })
            }
            // do fast syncing 
            await syncUserQuestionsProxy(user.toJSON(), true)
        } else {
            console.log("save")
            // save config 
            if (!config || !config.site || !config.leetSession) {
                return response.status(400).json({ code: 1, message: "leetcode Session Needed" })
            }
            user.syncConfig = config 
            await user.save();
            // do slow syncing 
            await syncUserQuestionsProxy(user.toJSON(), false)
        }
    } catch (error) {
        return next(error)
    }
    response.status(200).json({ code: 0, message: "Sync successfully" })
}

module.exports = syncUserPracticeHandler
//syncUser("647430bdfa4e0361da584678", session);
