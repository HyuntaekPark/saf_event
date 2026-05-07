import { deleteRecord } from "../../lib/db.js";

export default async function handler(request, response) {
  try {
    if (request.method !== "DELETE") {
      response.setHeader("Allow", "DELETE");
      response.status(405).json({ error: "허용되지 않는 요청입니다." });
      return;
    }

    await deleteRecord(request.query.id);
    response.status(204).end();
  } catch (error) {
    console.error(error);
    response.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "서버에서 문제가 발생했습니다."
    });
  }
}
