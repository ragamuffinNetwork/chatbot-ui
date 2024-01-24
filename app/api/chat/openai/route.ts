import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { ServerRuntime } from "next"
import { ChatSettings } from "@/types"
import { requestJson } from "@/lib/server/request"

export const runtime: ServerRuntime = "nodejs"

export async function POST(request: Request) {
  try{
    const json = await request.json()

    const {
      messages,
      chatSettings
    } = json as {
      messages: any[],
      chatSettings: ChatSettings
    }

    const { model, temperature } = chatSettings;

    const validMessages = messages.length > 8 ? messages.slice(-8): messages

    const postData = {
      messages: validMessages,
      model,
      temperature,
      max_tokens: CHAT_SETTING_LIMITS[model].MAX_TOKEN_OUTPUT_LENGTH
    };

    const options = {
      hostname: '18.117.241.252',
      port: 3000,
      path: '/api/openai/chat'
    };
    
    const {response} = await requestJson(postData, options)

    return new Response(response)

  } catch (error: any) {
    const errorMessage = error.error?.message || error || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
