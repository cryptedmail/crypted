import { handleRequest } from "../server.js";

export default function handler(req, res) {
  req.url = "/api/cron-reconcile";
  return handleRequest(req, res);
}
