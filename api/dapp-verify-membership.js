import { handleRequest } from "../server.js";

export default function handler(req, res) {
  req.url = "/api/dapp-verify-membership";
  return handleRequest(req, res);
}
