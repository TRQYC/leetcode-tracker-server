function buildUrl(site, path) {
  if (site == "cn") {
    return `https://leetcode.cn` + path;
  } else {
    return `https://leetcode.com` + path;
  }
}

const checkSubmission = (site, id) => {
  path = `/submissions/detail/${id}/check`;
  url = buildUrl(site, path);
  console.log("check submission url is", url);
  return fetch(url, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      return data;
    });
};

const fetchProgress = async (site, status, session, offset, limit) => {
  url = buildUrl(site, `/graphql`);
  console.log("fetchProgress", site, status, session)
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `LEETCODE_SESSION=${session}`,
    },
    body: JSON.stringify({
      query: `query userProfileQuestions($status: StatusFilterEnum!, $skip: Int!, $first: Int!, $sortField: SortFieldEnum!, $sortOrder: SortingOrderEnum!, $keyword: String, $difficulty: [DifficultyEnum!]) {
                userProfileQuestions(status: $status, skip: $skip, first: $first, sortField: $sortField, sortOrder: $sortOrder, keyword: $keyword, difficulty: $difficulty) {
                  totalNum
                  questions {
                    translatedTitle
                    frontendId
                    titleSlug
                    title
                    difficulty
                    lastSubmittedAt
                    numSubmitted
                    lastSubmissionSrc {
                      sourceType
                      ... on SubmissionSrcLeetbookNode {
                        slug
                        title
                        pageId
                        __typename
                      }
                      __typename
                    }
                    __typename
                  }
                  __typename
                }
              }`,
      variables: {
        status: status,
        skip: offset,
        first: limit,
        sortField: "LAST_SUBMITTED_AT",
        sortOrder: "DESCENDING",
        difficulty: [],
      },
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      console.log("json", json);
      return json.data.userProfileQuestions;
    });
};

// const fetchAllSubmissions = (site, offset, limit, session) => {
//     url = buildUrl(site, `/submissions/?offset=${offset}&limit=${limit}`)
//     return fetch(url, {
//         method: "GET",
//         headers: {
//             cookie: `LEETCODE_SESSION=${session}`
//         }
//       }).then((res) => { return res.json()}).then(data => {console.log(data); return data.submissions_dump})
// }

const fetchSubmissions = (site, offset, limit, session) => {
  url = buildUrl("cn", "/graphql");
  const query = `query progressSubmissions($offset: Int, $limit: Int, $lastKey: String, $questionSlug: String) {
    submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {
      lastKey
      hasNext
      
      submissions {
        id
        title
        status
        timestamp
        url
        lang
        runtime
        __typename
      }
      __typename
    }
  }`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `LEETCODE_SESSION=${session}`,
    },
    body: JSON.stringify({
      query: query,
      variables: {
        offset: offset,
        limit: limit,
        sortField: "LAST_SUBMITTED_AT",
        sortOrder: "DESCENDING",
      },
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      console.log("json", json);
      return json.data.submissionList.submissions;
    });
};

//console.log(fetchQuestionEN("count-collisions-of-monkeys-on-a-polygon").then(data => console.log(data)));


module.exports = {
  fetchProgress: fetchProgress, 
  fetchSubmissions: fetchSubmissions,
  checkSubmission:checkSubmission
}