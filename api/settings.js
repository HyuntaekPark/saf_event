import { getSettings, updateSettings } from "../lib/db.js";

export default async function handler(request, response) {
  try {
    if (request.method === "GET") {
      response.status(200).json(await getSettings());
      return;
    }

    if (request.method === "PUT") {
      response.status(200).json(await updateSettings(request.body?.attemptCount));
      return;
    }

    response.setHeader("Allow", "GET, PUT");
    response.status(405).json({ error: "허용되지 않는 요청입니다." });
  } catch (error) {
    console.error(error);
    response.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "서버에서 문제가 발생했습니다."
    });
  }
}
