---
title: wordpress使用心得
tags: [博客, wordpress]
categories: [七分热爱]
description: 搭建wordpress遇到的一些问题和参考的教程
abbrlink: de09af32
date: 2018-10-12 00:58:18
---

1\. 关于wordpress建站过程中遇到的一些问题及解决方案
--------------------------------

*   Filezilla 连接超时LNMP1.5默认是不安装FTP服务的。需要上下传文件时，设置FTP软件（如FlashFXP）连接类型为 “**SFTP over SSH**”即可。
*   希望站点主页与WordPress安装目录不同(希望xxx.com打开xxx.com\\wordpress)[这里可以解决](https://jingyan.baidu.com/article/22fe7ced2f6d1c3002617f38.html?qq-pf-to=pcqq.group)
*   关于301重定向通过修改htaccess实现301重定向，htaccess文件要放在**根目录** ，要删除$1，否则默认定向到/default
  
        RewriteEngine On
        RewriteCond %{HTTP_HOST} ^laozuo.org [NC]
        RewriteRule ^(.*)$ http://www.laozuo.org/$1 [L,R=301]
  

2\. 建站参考教程
----------

1.  [WordPress建站: 便宜VPS+LAMP搭建+博客安装/优化教程【Vultr & 搬瓦工VPS亲测】](https://www.seoimo.com/wordpress-vps/)
2.  [VPS搭建LAMP安装WordPress建站教程 (搬瓦工VPS亲测 Mac OS环境操作)](https://www.jianshu.com/p/d7b208efe04c)
3.  [搬瓦工VPS安装WordPress详细图文教程](https://www.banwagong.com/625.html)

3\. 目前网站存在问题
------------

1.  vps配置优化
2.  [开启 HSTS](https://www.seoimo.com/lamp-ssl/#ssl-chain-hsts)；[关闭 SNI](https://www.seoimo.com/lamp-ssl/#ssl-sni-setup)； [HTTP全部301重定向到HTTPS](https://www.seoimo.com/lamp-ssl/#http-301-https)

4\. 建站大致流程
----------

1.  购买服务器和域名
2.  域名解析(域名绑定服务器ip)
3.  vps中搭建LAMP环境
4.  添加域名`lnmp vhost add`
5.  安装wordpress