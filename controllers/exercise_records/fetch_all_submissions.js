const { LeetCode, Credential }= require('leetcode-query')

const credential = new Credential();

async function f() {
    await credential.init("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiOTc1ODM0IiwiX2F1dGhfdXNlcl9iYWNrZW5kIjoiYWxsYXV0aC5hY2NvdW50LmF1dGhfYmFja2VuZHMuQXV0aGVudGljYXRpb25CYWNrZW5kIiwiX2F1dGhfdXNlcl9oYXNoIjoiN2Y2ZGRkM2U3NzI3MjExNmY0NDdiMjc1NDc4NTBkM2ZkZWZjN2QxMSIsImlkIjo5NzU4MzQsImVtYWlsIjoieGQyMjM3QGNvbHVtYmlhLmVkdSIsInVzZXJuYW1lIjoiRFhYWVkiLCJ1c2VyX3NsdWciOiJEWFhZWSIsImF2YXRhciI6Imh0dHBzOi8vczMtdXMtd2VzdC0xLmFtYXpvbmF3cy5jb20vczMtbGMtdXBsb2FkL2Fzc2V0cy9kZWZhdWx0X2F2YXRhci5qcGciLCJyZWZyZXNoZWRfYXQiOjE2ODYxNTA0MDAsImlwIjoiMzguNTkuMjM2LjExIiwiaWRlbnRpdHkiOiI1ZjBmZjVkODc5OWVkNGMwZWQzNTVmYTQ3NGE3YmJjMiIsInNlc3Npb25faWQiOjQwNjYxMzAyLCJfc2Vzc2lvbl9leHBpcnkiOjEyMDk2MDB9.w51vt5Be9DcqNHDT7oh8BQLtHbxkq6QYOGSoECPzXpI");
    const leetcode = new LeetCode();
    const user = await leetcode.user("DXXYY");
    console.log("user is", user)
}

f() 
console.log("haha")
