import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "not-configured";

const client = new OpenAI({
  apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

export default client;