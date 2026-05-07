import { createRecord, deleteRecords, getRecords } from "../../lib/db.js";

export default async function handler(request, response) {
  try {
    if (request.method === "GET") {
      response.status(200).json({ records: await getRecords() });
      return;
    }

    if (request.method === "POST") {
      response.status(201).json({ record: await createRecord(request.body) });
      return;
    }

    if (request.method === "DELETE") {
      await deleteRecords();
      response.status(204).end();
      return;
    }

    response.setHeader("Allow", "GET, POST, DELETE");
    response.status(405).json({ error: "허용되지 않는 요청입니다." });
  } catch (error) {
    console.error(error);
    response.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "서버에서 문제가 발생했습니다."
    });
  }
}
