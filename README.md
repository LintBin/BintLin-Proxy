# BintLin-Proxy
代理工具
能够代理http中请求，自动寻找本地资源，支持上传文件，部分重定向请求



注意：此工具仅仅支持get和post方法




需要的环境或库: 仅需要安装nodejs环境即可

使用：


1、修改proxy_lib中的config.json文件，将其配置成自己代理文件


2、双击start-proxy.bat文件即可运行代理










config.json配置：

   		server：需要远程代理的服务器域名或者ip,如"www.baidu.com"

   		port: 需要远程代理的服务器的端口,如"80"

   		proxyPort：本机通过哪个端口访问远程服务器,如"8888"

   		transferUrl：以配置的列表里面开头的请求，全部转发到远程服务器

   		workspace：本地静态目录的路径

   		localFile：键值对，请求url为指定的key的时候，读取的是本地value路径的资源

   		ignoreQuestionMark：访问静态文件的时候，是否要忽略"?"极其后面的url部分。用来处理有localhost:8888/index.html?jstime=123456789的类似的情况


完整配置DEMO如下:


{

		"server":"www.baidu.com",
		"port":"80", 
		"proxyPort":"8888",    
		"transferUrl":[ 
			"/api"
		],
		"workspace":"D:\\data\\",
		"localFile":{
			"a":"ab.html"
		},

		"ignoreQuestionMark":true
}






如果遇到问题，可以发邮件到bintlinforhong@gmail.com联系作者