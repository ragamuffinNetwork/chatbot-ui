const http = require("http")
const HttpProxyAgent = require('http-proxy-agent');

const proxyUrl = 'http://127.0.0.1:8999';

const agent = new HttpProxyAgent(proxyUrl);

export function requestJson(postData: any, initOptions: any, use_agent: boolean = true): Promise<any>{
    const postDataString = JSON.stringify(postData)
    const contentLength = Buffer.byteLength(postDataString)
    const options = {
      ...initOptions,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': contentLength,
      }
    };

    if(use_agent) {
        options["agent"] = agent
    }
  
    return new Promise((resolve, reject) => {
      // 发起POST请求
      const req = http.request(options, (res: any) => {
        let data = ''
      
        res.on('data', (chunk: any) => {
          data += chunk
        })
      
        res.on('end', () => {
          try {
            const responseJson = JSON.parse(data)
            resolve(responseJson)
          } catch (error: any) {
            console.error(`[Error] received data: ${data}`) 
            reject('Error parsing response as JSON:' + error.message)
          }
        });
      });
      
      req.on('error', (error: any) => {
        reject(`Problem with request: ${error.message}`)
      });
      
      // 写入POST数据（JSON字符串化）
      req.write(postDataString)
      req.end()
    });
  }
  