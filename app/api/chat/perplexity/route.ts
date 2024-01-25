import { requestJson } from "@/lib/server/request"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    // checkApiKey(profile.anthropic_api_key, "Anthropic")

    // const response = await fetch("https://api.perplexity.ai/chat/completions", {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${profile.perplexity_api_key}`
    //   },
    //   body: JSON.stringify({
    //     model: chatSettings.model,
    //     messages: messages,
    //     temperature: chatSettings.temperature,
    //     stream: true
    //   })
    // })

    // const readableStream = new ReadableStream({
    //   async start(controller) {
    //     if (!response.body) {
    //       throw new Error("No response body!")
    //     }

    //     const reader = response.body.getReader()
    //     while (true) {
    //       const { done, value } = await reader.read()
    //       if (done) {
    //         controller.close()
    //         break
    //       }
    //       const chunk = new TextDecoder("utf-8").decode(value)

    //       const data = chunk.split("data: ")[1]
    //       if (data) {
    //         const parsedData = JSON.parse(data)
    //         const messageContent = parsedData.choices[0].delta.content
    //         controller.enqueue(new TextEncoder().encode(messageContent))
    //       }
    //     }
    //   }
    // })
    const options = {
      hostname: "api.perplexity.ai",
      port: 443
    }
    const postData = {
      model: chatSettings.model,
      messages: messages,
      temperature: chatSettings.temperature
    }

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${profile.perplexity_api_key}`
    }

    const response = await requestJson(
      options,
      "/chat/completions",
      postData,
      headers,
      true
    )
    console.log("response:", response)
    return new Response(response)
  } catch (error: any) {
    const errorMessage =
      error.error?.message || error || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
