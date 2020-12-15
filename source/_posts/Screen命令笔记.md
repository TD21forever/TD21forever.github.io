---
title: Screen命令笔记
comments: true
tags: [Linux, 笔记]
categories: [三分技术]
description: 记录Linux中screen命令的简单操作
abbrlink: d07d5346
date: 2020-10-15 23:52:43
---

## 使用Screen在后台运行程序

+ 安装

  ```bash
  $ sudo apt-get install screen
  ```

+ 创建窗口

  ```bash
  $ screen -S xxx //创建一个名叫xxx的窗口
  ```

+ 退出

  方法一：

  ```
  Ctrl a +d
  ```

  方法二：

  ```bash
  $ screen -d name //首先要退出窗口
  ```


+ 查看窗口列表

  ```bash
  $ screen -ls
  ```

+ 重新进入窗口

  ```bash
  $ screen -r 窗口号
  ```

+ 杀死窗口并清除

  ```bash
  $ kill -9 窗口号//首先杀死进程
  $ screen -wipe //自动清理死掉的窗口
  ```

  



