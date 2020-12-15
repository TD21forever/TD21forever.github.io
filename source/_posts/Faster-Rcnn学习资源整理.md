---
title: Faster-Rcnn学习资源整理
comments: true
categories: [三分技术]
tags: [Faster-Rcnn, 机器学习, 资料]
abbrlink: 7c423b52
date: 2020-03-21 22:49:11
description: '从原理、代码讲解、代码实现三个方面记录Faster-Rcnn学习时的点点滴滴'
---

## 前言

最近在研究学习faster-rcnn，初次接触目标检测的我确实被其高效、快速的检测效果惊艳到了。但在学习和代码实现的过程中确实遇到了很多困难，寻找了很多资料，本文将整理我所阅读过的比较好的文章和代码，供自己回顾复习使用，也供和大家参考。



## 原理篇

+ [从编程实现角度学习Faster R-CNN（附极简实现）]( https://zhuanlan.zhihu.com/p/32404424 )

  来自陈云大神，知乎上公认Faster-Rcnn写的最好的文章之一。其复现的代码仅2000行，跑出了比论文更好的效果！本文所提供的的代码非常值得学习。

+ [Faster R-CNN: Down the rabbit hole of modern object detection]( https://tryolabs.com/blog/2018/01/18/faster-r-cnn-down-the-rabbit-hole-of-modern-object-detection/ )

  虽然全篇是英文，但没有很晦涩难懂的单词，所以读起来还是很轻松的，而且由于英语的语言特色，各种概念理解起来就更加直白，推荐阅读。

+ [一点一点理解faster-rcnn]( https://zhuanlan.zhihu.com/p/64410344 )

  我阅读的另一篇原理讲解，这其实是我看的第一篇关于Faster-Rcnn的文章，通读完后就对Faster-Rcnn有了比较清晰的认识。文中对Anchors和Bounding Box Regression的讲解我觉得很形象。

综上，个人感觉读完上面三篇文章，并通过自己做笔记整理思路，对Faster-Rcnn的整体流程肯定会有个更加清晰的认识，但对其中一些细节又有些模糊，那这个时候我们就得看代码了。



### 看代码篇

我看的代码是陈云大神复现的Pytorch版本，[simple-faster-rcnn-pytorch](https://github.com/chenyuntc/simple-faster-rcnn-pytorch)。

这里推荐一篇对本代码讲解的文章，[目标检测之Faster-RCNN的pytorch代码详解(数据预处理篇)](https://www.cnblogs.com/kerwins-AC/p/9734381.html)，这篇博客对我理解代码帮助特别大，讲的很详细！通过对代码的研读，进一步理解原理中的一些细节。



### 代码实现篇

我想大部分人学习Faster-Rcnn肯定是想要实现自己的一个目标检测的小项目吧，本文将提供两份代码，一份由Pytorch实现，一份由Keras实现，亲测可以跑通！

### Keras实现

#### 参考资料：

+ [【视频】Keras 搭建自己的Faster-RCNN目标检测平台](  https://www.bilibili.com/video/av91598533  )
+ [【代码】faster-rcnn-keras](https://github.com/bubbliiiing/faster-rcnn-keras) 

Keras的实现主要参考B站以为Up主的视频，讲解非常详细。up主在视频中讲解了Faster-Rcnn的原理，也介绍了**如何使用Up的代码来训练自己的数据集以及如何使用Labelimg来制作训练集标签**，基本上没什么坑，以下是一些注意事项：

+ 平台：Windows10（win10自测可行，Linux没测试过）
+ 环境：tensorflow 1.13.1; keras 2.1.5 ; CUDA 10.0
+ 特征提取网络：ResNet50

遇到的问题：

+ 由于平时习惯使用tf2.0，装的也是CUDA10.1。发现CUDA10.1对tf1.13并不支持，所以在CUDA上花了很多时间
+ 一直没搞明白 `训练所需的voc_weights.h5 ` 指的到底是**预训练的特征提取网络参数**，还是**Faster-Rcnn训练完以后的参数**，个人估计是后者，因为实测`voc_weights.h5`可以直接用来做目标检测。

这份代码还是很好跑的，只要依据UP主的流程一步一步做下去，没什么坑！

### Pytorch实现

#### 参考资料：

+ [【博客】pytorch 1.0实现faster R-CNN]( https://www.codeleading.com/article/23341646679/ )
+ [【代码】faster-rcnn.pytorch](https://github.com/jwyang/faster-rcnn.pytorch) 

Pytorch的实现主要参考**博客**，由于Pytorch的代码年代有点久远了，有一些语法已经不支持，所以在实现的时候遇到了很多坑，**博客**中的讲解其实已经很详细了，但还是遗漏了一些，本文将强调实现过程中的一些注意事项，和我遇到的一些错误。

+ 平台：Ubantu**（由于需要编译 win10下编译实在是太麻烦，建议Linux用于选择此份代码）**

+ 环境：Pytorch1.2.0； torchvision==0.4.0; CUDA 9.2 或者 10.0（**虽然博客说明是Pytorch1.0.0，但实测Pytorch1.2.0完全没问题，安装方法就按照官网，按如下指令安装）**

  ``` bash
  # CUDA 9.2
  conda install pytorch==1.2.0 torchvision==0.4.0 cudatoolkit=9.2 -c pytorch
  
  # CUDA 10.0
  conda install pytorch==1.2.0 torchvision==0.4.0 cudatoolkit=10.0 -c pytorch
  
  # CPU Only
  conda install pytorch==1.2.0 torchvision==0.4.0 cpuonly -c pytorch
  ```

  我安装的是CUDA10的版本。**注意**，官方例子中 -c 会使得无法使用清华的源，**因此，实际操作时**

  ```bash
  # CUDA 10.0
  conda install pytorch==1.2.0 torchvision==0.4.0 cudatoolkit=10.0
  ```

遇到的一些问题：

+ **注意一定要切换分支！！！** 博客中也提到了，如果使用Pytorch1.0以上，需要切换分支！

  ` git checkout pytorch-1.0 `

+ 
  ```
  #进入faster-rcnn.pytorch文件，同时在内创建一个data文件夹
  cd faster-rcnn.pytorch && mkdir data
  #安装依赖的pyhon包，这一步若是报错说没有权限访问安装就在开头加上 sudo
  pip install -r requirements.txt
  #下载coco kit，并make
  git clone https://github.com/pdollar/coco.git
  cd coco/PythonAPI
  make
  ```

  这一步博客没讲清楚，对coco的PythonAPI编译以后（make了以后），将`/PythonAPI/pycocotools` 这个文件夹，复制到`faster-rcnn.pytorch\lib` 下，对`lib`下的`pycocotools` 的文件夹进行替换！ 原因就是lib下的pycocotools太老了，有一些功能用不了了！

+ 然后继续按照博客的来

+ 这份代码可以使用VGG16，也可以使用ResNet101，都需要预训练参数（**应该是在ImageNet中训练的特征提取网络**），博客中给了下载链接。我使用的是VGG16的预训练模型，下载好的文件名为`vgg16_caffe.pth` ，约有527MB大小。

+ 对于数据的准备，博客中并没有说明如何制作数据，如何制作.txt后缀的文件，可以参考Keras版本的实现，使用keras版本中`voc2faster-rcnn.py`文件即可生成四个.txt。(但我在实现的时候，只设置了训练集也就是说只有trainval.txt里面是存在数据的)
    ```text
      ├── test.txt    
      ├── train.txt           
      ├── trainval.txt         
      └── val.txt 
    ```

+ `from scipy.misc import imread`出现错误,这点在博客中没有提及

  这是因为scipy库中的imread要被弃用也就是不能用了，这时需要改成这样`from imageio import imread` 

+ 其余的问题可以看博客里的处理方式，本人在实验过程中基本都没有遇到。

  这里再提供[记pytorch版faster rcnn配置运行中的一些坑]( https://www.cnblogs.com/FZfangzheng/p/10852141.html )



