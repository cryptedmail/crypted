import { handleRequest } from "../server.js";

export default function handler(req, res) {
  req.url = "/api/admin-config";
  return handleRequest(req, res);
}
