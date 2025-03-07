import { base_url, api_key } from "./constant.js";
import OpenAI from "openai";

export enum Type {
  "V3" = "deepseek-chat",
  "R1" = "deepseek-reasoner",
}
export class DeepSeek {
  base_url = base_url;
  api_key = api_key;
  client: any;
  constructor() {
    this.client = new OpenAI({
      apiKey: this.api_key,
      baseURL: this.base_url,
    });
  }

  chat(model: Type, messages: OpenAI.ChatCompletionMessageParam[]) {
    return this.client.chat.completions.create({
      model: model,
      messages: messages,
    });
  }
}
