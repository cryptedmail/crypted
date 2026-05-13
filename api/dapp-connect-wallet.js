import { handleRequest } from "../server.js";

export default function handler(req, res) {
  req.url = "/api/dapp-connect-wallet";
  return handleRequest(req, res);
}
