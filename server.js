//nodejs服务器
const express = require("express")
const Vue = require("vue")
const fs = require("fs")
let https = require("https")
 
//创建express实例
const app = express()
//创建渲染器
const { createBundleRenderer } = require("vue-server-renderer")
const serverBundle = require("./dist/server/vue-ssr-server-bundle.json")
const clientManifest = require("./dist/client/vue-ssr-client-manifest.json")
const renderer = createBundleRenderer(serverBundle, {
    runInNewContext: false,
    template: fs.readFileSync("./public/index.temp.html", "utf-8"), //页面模板
    clientManifest
})
 
//中间件处理静态文件请求
app.use(express.static("./dist/client", {index: false}))
 
//将路由的处理交给vue
app.get("*", async (req, res) => {
    try {
        // console.log(req.get('host'))
        new Promise((resolve, reject) => {
            https.get('https://majoyreesa.com/interface/web/getStore', res2 => {
                res2.setEncoding("utf8")
                let body = ''
            
                //接收資料
                res2.on("data", data => {
                    body += data;
                });
                //接收完畢
                res2.on("end", async() => {
                    body = JSON.parse(body)
                    resolve(body.data[0].Name)
                });
            });
        }).then(async(title) => {
            console.log(title);
            const context = {
                url: req.url,
                title
            }
            const ssrStream = await renderer.renderToStream(context)
            const buffers = []
            ssrStream.on("data", (data) => {
                buffers.push(data)
            })
            ssrStream.on("end", () => {
                res.end(Buffer.concat(buffers))
            })
        });
    }catch {
        res.status(500).send("服务器内部错误！")
    }
})
 
app.listen(9998, () => {
    console.log("服务器渲染成功！")
})