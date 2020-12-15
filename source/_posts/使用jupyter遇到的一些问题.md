---
title: 使用jupyter遇到的一些问题
comments: true
tags: [机器学习, jupyter notebook]
categories: [三分技术]
description: 在安装TensorFlow的时候JupyterNotebook出了点问题
abbrlink: 9c79ba11
date: 2020-01-31 00:12:37
---

## 一个报错

` import win32api; ImportError: DLL load failed: 找不到指定的程序 `

#### 问题原因

224、225新版本发布的有问题，回退到223版本即可

` pip\conda install pywin32==223 `

## 一个注意点

>**环境嵌套**
>
>当已经激活某个环境时，再次 conda activate **envname** **将发生环境嵌套，而不是切换**。
>
>多个环境嵌套时，软件包可能产生异常行为。
>
>Python 需格外小心！若最内层环境没有安装 Python，所有与 Python 有关的程序（尤其是 pip ）将逐层向外 fallback 直至 base，很容易造成污染。
>
>可通过 conda info 的 shell level 来检查嵌套情况。
>
>如非特别必要，不建议使用环境嵌套。

## 一些命令

​	通常在`conda`环境中使用`jupyter notebook`的步骤是1. `activate` 进入某个环境 2. 输入 `jupyter notebook` 开始编辑`python`文件，此时对应的`python`版本为**jupyter notebook**内核的 `kernel.josn`文件中`python`路径，可使用
        ``` python
          import sys 
          sys.executable 
        ```

查看当前使用的是哪个python解释器。如果PC上除了Anaconda外还装了python官网下载的python，且这个python带有jupyter notebook，注意jupyter会优先使用这个python在`kernel.json`文件中对应的python解释器。

如果想在A环境下使用B环境的解释器，有如下两种操作

+ ` conda install nb_conda `

  直接安装这个包

+ ` python -m ipykernel install --user --name xxx --display-name "xxx" `

或者在某个环境中把python加入jupyter 的内核

如果想查看当前jupyter notebook的kernal情况

+ `jupyter kernelspec list` 可以列出所有的kernel

+ ` jupyter kernelspec remove xxx ` 可以删除名为xxx的kernel