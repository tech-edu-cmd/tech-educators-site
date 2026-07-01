// This code runs on Netlify's server, NEVER in the browser.
// The SECRET_KEY lives only here (as an environment variable), so nobody
// can "View Source" and steal it.

exports.handler = async (event, context) => {
  // 1. Check the person is actually logged in via Netlify Identity
  const { user } = context.clientContext || {};

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized — please log in first." }),
    };
  }

  // 2. Pull the secret values from Netlify environment variables
  //    (set these in Netlify dashboard, NOT in this file)
  const SECRET_KEY = process.env.SHEET_SECRET_KEY;
  const SHEET_ENDPOINT = process.env.SHEET_ENDPOINT;

  if (!SECRET_KEY || !SHEET_ENDPOINT) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server not configured. Missing environment variables." }),
    };
  }

  // 3. Fetch the leads from the Google Apps Script endpoint
  try {
    const response = await fetch(`${SHEET_ENDPOINT}?key=${encodeURIComponent(SECRET_KEY)}`);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to reach the sheet. Try again." }),
    };
  }
};
