import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { ChatSettings, LLM } from "@/types"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const headers = request.headers
  const { chatSettings, messages, rageneai_chat_id } = json as {
    chatSettings: ChatSettings
    messages: any[]
    rageneai_chat_id: string
  }

  const { model: modelId } = chatSettings

  const model = LLM_LIST.find((model: LLM) => model.modelId === modelId)
  if (!model) {
    return new Response(
      JSON.stringify({
        message: `Model ${modelId} not found`
      }),
      {
        status: 400
      }
    )
  }

  const { platformLink } = model

  const token = headers.get("token") || ""

  try {
    if (!rageneai_chat_id) {
      // init a rageneai chat
      const initChatQueryString = new URLSearchParams({
        analysis_id: "50"
      })
      const initChatResponse = await fetch(
        `${platformLink}/init?${initChatQueryString}`,
        {
          method: "POST",
          headers: {
            // Accept: "application/json",
            "Content-Type": "application/json",
            token: token
          }
        }
      )
      const initChatResponseJson = await initChatResponse.json()
      const { data } = initChatResponseJson
      const {
        analysis_id,
        chat_id,
        context,
        global_context,
        local_context,
        owner_id
      } = data
    }

    const profile = await getServerProfile()
    // checkApiKey(profile.openai_api_key, "RageneAI")
    const queryString = new URLSearchParams({
      analysis_id: "50",
      message: messages.at(-1).content,
      chat_id: "5"
    })

    const response = await fetch(
      "http://dev.raganetwork.com:8099/server/gpt/chat/send?" + queryString,
      {
        method: "POST",
        headers: {
          // Accept: "application/json",
          "Content-Type": "application/json",
          token: token
        }
      }
    )
    const responseJson = await response.json()
    const { data } = responseJson
    const context = JSON.parse(data.context)
    const { content } = context.at(-1)
    return new Response(content, {
      headers: { "Content-Type": "text/plain" }
    })
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
