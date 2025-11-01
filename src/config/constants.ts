const nodeEnv = process.env.NODE_ENV;

export const ROOT_URL =
  nodeEnv === "production"
    ? "" // TODO: Add production URL when known
    : "http://localhost:8000";

console.log(`the node env is: ${nodeEnv}`);
