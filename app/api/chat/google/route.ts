import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { OVERSEA_SERVER, requestJson } from "@/lib/server/request"
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

    const { model, temperature } = chatSettings

    if (model === "gemini-pro") {
      const validMessages = messages.length > 5 ? messages.slice(-5) : messages

      const postData = {
        modelId: model,
        history: validMessages.slice(0, -1).map(message => {
          if (!message.parts) {
            message.parts = "###"
          }
          return message
        }),
        message: validMessages.at(-1).parts,
        temperature,
        max_tokens: CHAT_SETTING_LIMITS[model].MAX_TOKEN_OUTPUT_LENGTH
      }

      const options = {
        ...OVERSEA_SERVER
      }

      const { response } = await requestJson(
        options,
        "/api/google/chat",
        postData
      )

      if (!response) {
        throw new Error("no response")
      }

      return new Response(response)
    } else if (model === "gemini-pro-vision") {
      let latestMessage = messages.at(-1)
      const { prompt, imageParts } = latestMessage
      const handledImageParts = imageParts.map((imagePart: any) => {
        const { inlineData } = imagePart
        const { data, mimeType } = inlineData
        return {
          inline_data: {
            data: data,
            mime_type: mimeType
          }
        }
      })
      console.log("handledImageParts:", handledImageParts)
      const postData = {
        modelId: model,
        prompt: prompt,
        imgs: handledImageParts
      }

      const options = {
        ...OVERSEA_SERVER
      }

      const { response } = await requestJson(
        options,
        "/api/google/generate-content",
        postData
      )

      if (!response) {
        throw new Error("no response")
      }

      return new Response(response, {
        headers: { "Content-Type": "text/plain" }
      })
    }
  } catch (error: any) {
    const errorMessage =
      error.error?.message || error + "" || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
