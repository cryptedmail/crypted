import { handleRequest } from "../server.js";

export default function handler(req, res) {
  req.url = routeWithQuery("/api/dapp-config", req.url);
  return handleRequest(req, res);
}

function routeWithQuery(pathname, url = "") {
  const queryStart = String(url).indexOf("?");
  return queryStart >= 0 ? `${pathname}${String(url).slice(queryStart)}` : pathname;
}
