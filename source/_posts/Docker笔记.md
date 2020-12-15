---
title: Docker笔记
comments: true
tags: [Docker]
categories: [三分技术]
description: 记录Docker的简单操作
abbrlink: 5c266b64
date: 2020-10-19 01:26:13
---

#### Docker With GPU

```bash
# 测试是否可以看到所有显卡，如果没有 nvidia/cuda:10.0-base，则会先下载该镜像
docker run --gpus all nvidia/cuda:10.0-base nvidia-smi

# 在一个容器上使用两块GPU
docker run --gpus 2 nvidia/cuda:10.0-base nvidia-smi

# 指定使用的GPU
docker run --gpus '"device=1,2"' nvidia/cuda:10.0-base nvidia-smi
docker run --gpus '"device=UUID-ABCDEF,1"' nvidia/cuda:10.0-base nvidia-smi

# Specifying a capability (graphics, compute, ...) for my container
docker run --gpus all,capabilities=utility nvidia/cuda:10.0-base nvidia-smi
```

#### Docker Run

```
docker run -it -p xxxx:xxxx-v [主机代码目录]:[容器内代码映射目录] --gpus all --name [创建的容器名称] [镜像名称]:[镜像tag] /bin/bash -c "sh trainer/train.sh"

docker run -it -p 5555:22 -v "$PWD:/workspace" --gpus all --name xxx imagesName:tag /bin/bash

```

- `-it`：这是两个参数，一个是 `-i` 表示交互式操作，一个是 `-t` 为终端。我们这里打算进入 bash 执行一些命令并查看返回结果，因此我们需要交互式终端。
- `--rm`：这个参数是说容器退出后随之将其删除。默认情况下，为了排障需求，退出的容器并不会立即删除，除非手动 `docker rm`。
- `ubuntu:16.04`：这是指用 `ubuntu:16.04` 镜像为基础来启动容器。
- `bash`：放在镜像名后的是命令，这里我们希望有个交互式 Shell，因此用 bash。
- `-v` : "[主机工作目录]:[容器内工作映射目录]" ： 指定容器内文件的挂载路径
- `-p` ``5555``:`22`是将宿主机的`5555`端口映射到容器的`2333`端口  

#### Tips

+  Docker 需要用户具有 sudo 权限，为了避免每次命令都输入`sudo`，可以把用户加入 Docker 用户组 

   ``` bash
   sudo groupadd docker #添加docker用户组
   sudo gpasswd -a $USER docker #将登陆用户加入到docker用户组中
   newgrp docker #更新用户组
   ```

#### Docker Images

 Image 文件可以看作是容器的模板。Docker 根据 Image 文件生成容器的实例。同一个 Image 文件，可以生成多个同时运行的容器实例。 

+ `docker image ls  or  docker images`

+ `docker image rm [imageName] or [imageID]`

+ `docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]`
   例子：`docker pull ubuntu:16.04`

#### Docker Container

+ `docker ps -a` 来查看当前系统的容器

+ `docker start [-i] container-id`**启动**某个容器，必须是已经创建的。 加上`-i` 参数之后，可以直接**进入**交互模式
+ 除了通过`-i`**进入**交互模式，还有一种方法，那就是通过`attach`: `docker attach container-id` 
+ 退出但是保持容器运行，按`CTRL+Q+P`三个键 - 退出 
+ 使用`docker start/restart` 命令来启动/重启一个容器
+ 使用`docker stop/rm`命令来停止/删除一个容器

#### 使用阿里云的docker加速器。

在阿里云申请一个账号，
打开连接 https://cr.console.aliyun.com/#/accelerator 拷贝您的专属加速器地址。

修改修改daemon配置文件/etc/docker/daemon.json来使用加速器(下面是4个命令，分别单独执行)

```
sudo vim /etc/docker/daemon.json
{
  "registry-mirrors": ["https://jxus37ad.mirror.aliyuncs.com"]
}
sudo systemctl daemon-reload
sudo systemctl restart docker
```

​	