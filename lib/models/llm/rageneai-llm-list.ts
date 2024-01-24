import { LLM } from "@/types"

const HOST = "http://dev.raganetwork.com:8999"

const RageneSimple: LLM = {
  modelId: "rageneai-simple-1.0",
  modelName: "Ragene Simple 1.0",
  provider: "rageneai",
  hostedId: "rageneai-simple",
  platformLink: `${HOST}/server/gpt/chat`,
  imageInput: false
}

const RageneComplex: LLM = {
  modelId: "rageneai-complex-1.0",
  modelName: "Ragene Complex 1.0",
  provider: "rageneai",
  hostedId: "rageneai-complex",
  platformLink: `${HOST}/server/gpt/complex-chat`,
  imageInput: false
}

export const RAGENEAI_LLM_LIST: LLM[] = [RageneSimple, RageneComplex]
