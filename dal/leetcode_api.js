
function buildUrl(site, path) {
    if (site == "cn") {
        return `https://leetcode.cn` + path 
    }else{
        return `https://leetcode.com` + path 
    }
}

const checkSubmission = (site, id) => {
    path = `/submissions/detail/${id}/check` 
    url = buildUrl(site, path)
    console.log("check submission url is", url)
    return fetch(url, {
      method: "GET",
    }).then((res) => { return res.json()}).then(data => {console.log(data); return data})
}

const fetchAllSubmissions = (site, offset, limit, session) => {
    url = buildUrl(site, `/submissions/?offset=${offset}&limit=${limit}`)
    return fetch(url, {
        method: "GET",
        headers: {
            cookie: `LEETCODE_SESSION=${session}`
        }
      }).then((res) => { return res.json()}).then(data => {console.log(data); return data.submissions_dump})

}


//console.log(fetchQuestionEN("count-collisions-of-monkeys-on-a-polygon").then(data => console.log(data)));

module.exports = checkSubmission