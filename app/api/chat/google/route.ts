import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { requestJson } from "@/lib/server/request"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { ServerRuntime } from "next"

export const runtime: ServerRuntime = "nodejs"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.google_gemini_api_key, "Google")

    if (chatSettings.model === "gemini-pro") {

      const { model, temperature } = chatSettings;

      const validMessages = messages.length > 5 ? messages.slice(-5): messages

      const postData = {
        modelId: model,
        history: validMessages.slice(0, -1),
        message: validMessages.at(-1).parts,
        temperature,
        max_tokens: CHAT_SETTING_LIMITS[model].MAX_TOKEN_OUTPUT_LENGTH
      };

      const options = {
        hostname: '18.117.241.252',
        port: 3000,
        path: '/api/google/chat'
      };
      
      const {response} = await requestJson(postData, options, true)

      if(!response){
        throw new Error("no response")
      }

      return new Response(response)

    } else if (chatSettings.model === "gemini-pro-vision") {

      const genAI = new GoogleGenerativeAI(profile.google_gemini_api_key || "")
      const googleModel = genAI.getGenerativeModel({ model: chatSettings.model })
  
      // FIX: Hacky until chat messages are supported
      const HACKY_MESSAGE = messages[messages.length - 1]

      const result = await googleModel.generateContent([
        HACKY_MESSAGE.prompt,
        HACKY_MESSAGE.imageParts
      ])

      const response = result.response

      const text = response.text()

      return new Response(text, {
        headers: { "Content-Type": "text/plain" }
      })
    }
  } catch (error: any) {
    const errorMessage = error.error?.message || error || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
