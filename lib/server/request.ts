const http = require("http")
const https = require("https")
const HttpProxyAgent = require("http-proxy-agent")
// const HttpsProxyAgent = require("https-proxy-agent")

// const proxyUrl = "http://127.0.0.1:8999"
const proxyUrl = "http://127.0.0.1:7890"

const httpAgent = new HttpProxyAgent(proxyUrl)

// export const OVERSEA_SERVER = {
//   hostname: "18.117.241.252",
//   port: 3000
// }

export const OVERSEA_SERVER = {
  hostname: "127.0.0.1",
  port: 5000
}

function getAgent(useHttps: boolean = false) {
  return httpAgent
}

const getRequestProtocolModule = (useHttps: boolean = false) => {
  if (useHttps) {
    return https
  }
  return http
}

export function requestJson(
  initOptions: any,
  uri: string,
  postData: any,
  headers: any = {},
  useHttps: boolean = false,
  useAgent: boolean = true
): Promise<any> {
  const agent = getAgent(useHttps)
  const requestProtocolModule = getRequestProtocolModule(useHttps)
  const postDataString = JSON.stringify(postData)
  const contentLength = Buffer.byteLength(postDataString)
  const options = {
    ...initOptions,
    path: uri,
    method: "POST",
    headers: {
      ...(headers || {}),
      "Content-Type": "application/json",
      "Content-Length": contentLength
    }
  }

  if (useAgent) {
    options["agent"] = agent
  }

  return new Promise((resolve, reject) => {
    // 发起POST请求
    const req = requestProtocolModule.request(options, (res: any) => {
      let data = ""

      res.on("data", (chunk: any) => {
        data += chunk
      })

      res.on("end", () => {
        try {
          const responseJson = JSON.parse(data)
          resolve(responseJson)
        } catch (error: any) {
          console.error(`[Error] received data: ${data}`)
          reject("Error parsing response as JSON:" + error.message)
        }
      })
    })

    req.on("error", (error: any) => {
      reject(`Problem with request: ${error.message}`)
    })

    // 写入POST数据（JSON字符串化）
    req.write(postDataString)
    req.end()

    setTimeout(() => {
      req.abort()
      reject("Request timeout")
    }, 50000)
  })
}
