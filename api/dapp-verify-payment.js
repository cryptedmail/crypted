import { handleRequest } from "../server.js";

export default function handler(req, res) {
  req.url = "/api/dapp-verify-payment";
  return handleRequest(req, res);
}
