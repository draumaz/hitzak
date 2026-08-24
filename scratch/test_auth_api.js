const http = require("http");

const PORT = 8039;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : "";
    const options = {
      hostname: "localhost",
      port: PORT,
      path: path,
      method: method,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.headers["Content-Length"] = Buffer.byteLength(dataString);
    }

    const req = http.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        let parsed = null;
        try {
          parsed = JSON.parse(responseBody);
        } catch {
          parsed = responseBody;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(dataString);
    }
    req.end();
  });
}

// Extract the session token from the set-cookie header
function getSessionCookie(res) {
  const cookies = res.headers["set-cookie"];
  if (!cookies) return null;
  const sessionCookie = cookies.find((c) => c.startsWith("session_token="));
  if (!sessionCookie) return null;
  return sessionCookie.split(";")[0];
}

async function runTests() {
  console.log("🚀 Starting Auth & Multi-User API Verification Tests...\n");

  const randUser = `user_${Math.floor(Math.random() * 100000)}`;
  const password = "password123";

  // Test 1: Accessing progress when unauthenticated should return 401
  console.log("Test 1: GET /api/progress without session token");
  const t1 = await makeRequest("/api/progress", "GET");
  if (t1.status === 401) {
    console.log("  ✅ Correctly returned 401 Unauthorized\n");
  } else {
    console.log(`  ❌ Failed: Expected 401, got ${t1.status}\n`);
    process.exit(1);
  }

  // Test 2: User Sign Up
  console.log(`Test 2: POST /api/auth/signup for user: ${randUser}`);
  const t2 = await makeRequest("/api/auth/signup", "POST", {
    username: randUser,
    password: password,
  });

  const cookie = getSessionCookie(t2);
  if (t2.status === 200 && cookie) {
    console.log("  ✅ Signup successful. Received session cookie.");
    console.log(`  Session Cookie: ${cookie}\n`);
  } else {
    console.log(`  ❌ Failed: Signup response code ${t2.status}, cookie received: ${!!cookie}\n`);
    process.exit(1);
  }

  // Test 3: Get user progress with session cookie
  console.log("Test 3: GET /api/progress with session cookie");
  const t3 = await makeRequest("/api/progress", "GET", null, { Cookie: cookie });
  if (t3.status === 200 && t3.body.userName === randUser) {
    console.log(`  ✅ Successfully retrieved user progress for ${t3.body.userName}`);
    console.log(`  Initial points: ${t3.body.points}, hearts: ${t3.body.hearts}\n`);
  } else {
    console.log(`  ❌ Failed: Status ${t3.status}, body:`, t3.body, "\n");
    process.exit(1);
  }

  // Test 4: Complete a lesson and earn XP
  console.log("Test 4: POST /api/progress action=complete_lesson");
  const t4 = await makeRequest(
    "/api/progress",
    "POST",
    { action: "complete_lesson", lessonId: 1, xp: 20 },
    { Cookie: cookie }
  );

  if (t4.status === 200 && t4.body.points === 20) {
    console.log(`  ✅ Lesson completed. Updated Points: ${t4.body.points}, Gems: ${t4.body.gems}\n`);
  } else {
    console.log(`  ❌ Failed: Status ${t4.status}, body:`, t4.body, "\n");
    process.exit(1);
  }

  // Test 5: Verify separate progress by signing up a second user
  const secondUser = `${randUser}_alt`;
  console.log(`Test 5: POST /api/auth/signup for second user: ${secondUser}`);
  const t5 = await makeRequest("/api/auth/signup", "POST", {
    username: secondUser,
    password: password,
  });

  const cookie2 = getSessionCookie(t5);
  if (t5.status === 200 && cookie2) {
    console.log("  ✅ Second user registered successfully.");
  } else {
    console.log("  ❌ Failed signup for second user\n");
    process.exit(1);
  }

  console.log("Test 5b: GET /api/progress for second user");
  const t5b = await makeRequest("/api/progress", "GET", null, { Cookie: cookie2 });
  if (t5b.status === 200 && t5b.body.points === 0) {
    console.log(`  ✅ Second user progress is isolated. Points: ${t5b.body.points} (expected: 0)\n`);
  } else {
    console.log(`  ❌ Failed: Isolated progress check failed. Got points: ${t5b.body.points}\n`);
    process.exit(1);
  }

  // Test 6: Login with credentials
  console.log("Test 6: POST /api/auth/login with correct credentials");
  const t6 = await makeRequest("/api/auth/login", "POST", {
    username: randUser,
    password: password,
  });

  const loginCookie = getSessionCookie(t6);
  if (t6.status === 200 && loginCookie) {
    console.log("  ✅ Login successful. Received cookie.\n");
  } else {
    console.log(`  ❌ Failed: Login status ${t6.status}\n`);
    process.exit(1);
  }

  // Test 7: Logout
  console.log("Test 7: POST /api/auth/logout");
  const t7 = await makeRequest("/api/auth/logout", "POST");
  const clearedCookie = getSessionCookie(t7);
  // Max-age=0 or empty or past expiration
  if (t7.status === 200) {
    console.log("  ✅ Logout successful.\n");
  } else {
    console.log(`  ❌ Failed: Logout status ${t7.status}\n`);
    process.exit(1);
  }

  console.log("🎉 All Auth & Multi-User Integration Tests passed successfully!");
}

runTests().catch(console.error);
