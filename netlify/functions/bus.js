const API_URL = "https://www.rejseplanen.dk/api/nearbyDepartureBoard";

async function handler(event, context) {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    };
  }

  const ACCESS_ID = process.env.REJSEPLANEN_API_KEY;

  if (!ACCESS_ID) {
    console.error("Missing REJSEPLANEN_API_KEY");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server misconfigured" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    };
  }

  const url = new URL(API_URL);
  url.searchParams.set("accessId", ACCESS_ID);
  url.searchParams.set("originCoordLat", "57.048731");
  url.searchParams.set("originCoordLong", "9.968186");
  url.searchParams.set("format", "json");

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    };
  } catch (err) {
    console.error("Rejseplanen fetch error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch bus data" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    };
  }
}

module.exports = { handler };
