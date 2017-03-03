# BintLin-Proxy
代理工具
能够代理http中请求，自动寻找本地资源，支持上传文件，部分重定向请求



注意：此工具仅仅支持get和post方法




需要的环境或库: 仅需要安装nodejs环境即可

使用：


1、修改proxy_lib中的config.json文件，将其配置成自己代理文件


2、Windows系统下双击start-proxy.bat文件即可运行代理，其他系统请在该文件夹下使用 "node server.js" 命令启动服务器










config.json配置：

		totalProxy：预留字段，不需要填写

		proxy:里面配置的为对应代理服务器的相关配置，可配多个，在下面Demo里面配置了两个

			id：预留字段，可不填写
			remoteServer：需要被远程代理的服务器的ip或者域名（推荐使用ip），如	“180.149.132.47”
			localProxyPort：需要被远程代理的服务器的端口，如 "80"
			localProxyPort：本机通过哪个端口访问远程服务器，如”8888“
			transferUrl：以配置的列表里面开头的请求，全部转发到远程服务器
			workspace：本地静态目录的路径
			localFile：键值对，请求url为指定的key的时候，读取的是本地value路径的资源
			ignoreQuestionMark：访问静态文件的时候，是否要忽略"?"极其后面的url部分。用来处理有localhost:8888/index.html?jstime=123456789的类似的情况。推荐使用true


完整配置DEMO如下:



		{
			"totalProxy":{
				"a.com":"a",
				"b.com":"b"
			},
			"proxy":[
				{
					"id":"a",
					"remoteServer":"localhost",
					"remotePort":"8080",                     
					"localProxyPort":"8888",               
					"transferUrl":[                 
						"/api"
					],
					"workspace":"D:/git-workspace/WebContent/",
					"localFile":{
						"a":"ab.html"

					},
					"ignoreQuestionMark":true
				},
				{
					"id":"b",
					"remoteServer":"180.149.132.47",
					"remotePort":"80",
					"localProxyPort":"9999",               
					"transferUrl":[
						"/api"
					],
					"workspace":"D:/git-workspace/WebContent/",
					"localFile":{
						"a":"ab.html"

					},
					"ignoreQuestionMark":true
				}
			]
		}






如果遇到问题，可以发邮件到bintlinforhong@gmail.com或者在GitHub下面提issue联系作者