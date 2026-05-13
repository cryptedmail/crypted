import { handleRequest } from "../server.js";

export default function handler(req, res) {
  req.url = "/api/dapp-record-pending";
  return handleRequest(req, res);
}
