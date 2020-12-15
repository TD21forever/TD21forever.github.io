---
title: DCGAN学习笔记
tags: [深度学习, DCGAN, 笔记]
categories: [三分技术]
description: 'DCGAN相关的基础知识,本文多数内容来自网络整理,实验数据集是老师给的脑部核磁共振图'
abbrlink: 5dc1b5fc
date: 2019-04-12 11:04:48
---

#### 1. 什么是GAN（Generative Adversarial Net）？

> 假设有一个警察和一个造假币者，造假者按照真实钱币的样子来**造假**，警察来分辨遇到的钱币是真还是假。最初的时候，造假者的造假能力不高，所以警察可以很容易的分辨出来。当被识别出来的时候，造假者就会继续**修炼自己的技艺**。与此同时，警察的分辨能力也要相应**提高**。这样的过程就是一种生成**对抗**的过程。对抗到最后，造假者已经能够创造出可以以假乱真的钱币，警察难以区分真假。所以猜对的**概率变成0.5**
>
> 来源：[知乎](https://zhuanlan.zhihu.com/p/28853704)

##### 1.1 生成模型(Generator)

​	生成模型G的输入是随机噪声Z。

##### 1.2 判别模型(Discriminator)

​	判别模型D输入x，输出0-1范围内的一个实数，用来判断这个图片是真实图	片的概率有多大，相当于一个二分类器。

##### 1.3 工作原理

​	![img](https://pic4.zhimg.com/v2-eb171ce8dbd1f461d51c0611a71fdb0f_b.jpg)

> **X是真实数据**，真实数据**符合Pdata(x)分布**。**z是噪声数据**，噪声数据**符合Pz(z)分布**，比如高斯分布或者均匀分布。然后从噪声z进行抽样，通过G之后生成数据x=G(z)。然后真实数据与生成数据一起送入分类器D，后面接一个**sigmoid**函数，输出判定类别。



##### 1.4 GAN目标优化函数

![img](https://pic3.zhimg.com/v2-c93b874f77316d54f01aa653f8c24a86_b.jpg)

1. 固定G训练D时：

   ![img](https://pic3.zhimg.com/v2-474547ca59dd2737f0c4a8833f4ffcde_b.png)

   D是判断模型，真实的数据希望被D分成1，生成的数据希望被D分成0。

   第一项表示真实数据，如果错认成了0，那么log(D(x))<<0,期望会变成负无穷大

   第二项表示生成数据，如果错认成了1，那么log(D(x))<<0,期望会变成负无穷大

   从而修正参数，使得V大起来，**所以训练D的目的是希望这个式子的值越大越好**

2. 固定D训练G时：

   G是生成模型，希望D判断G生成的数据为1

   目标函数第一项不包含G，是常数，直接忽略。

   第二项只有当D为1时，V是最小的，**所以训练G的目的是希望这个式子的值越小越好**

3. ![img](https://pic2.zhimg.com/v2-dfa0c29336f15c4e9f047d8d1dae50f1_b.jpg)

   第二个式子和第一个式子等价。在训练的时候，第二个式子训练效果比较好 常用第二个式子的形式。

##### 1.5 描述

![img](https://pic3.zhimg.com/v2-aab535a56ee0fabaa3d52998d1baf616_b.png)

> 第一个图是一开始的情况，黑色的线表示数据x的实际分布，绿色的线表示数据的生成分布，我们希望绿色的线能够趋近于黑色的线，也就是让生成的数据分布与实际分布相同。然后蓝色的线表示生成的数据x对应于D的分布。在a图中，**D还刚开始训练，本身分类的能力还有限，因此有波动**，但是初步区分实际数据和生成数据还是可以的。到b图，D训练得比较好了，可以很明显的区分出生成数据，大家可以看到，随着绿色的线与黑色的线的偏移，蓝色的线下降了，也就是生成数据的概率下降了。那么，由于绿色的线的目标是提升概率，因此就**会往蓝色线高的方向移动**，也就是c图。那么随着训练的持续，由于G网络的提升，G也反过来影响D的分布。



#### 2. 什么是DCGAN（Deep Convolutional GAN）？

##### 2.1 DCGAN对GAN的改造

1. 去掉了G网络和D网络中的pooling layer
2. 在G网络和D网络中都使用Batch Normalization
3. 去掉全连接的隐藏层
4. 在G网络中除最后一层使用RELU，最后一层使用Tanh
5. 在D网络中每一层使用LeakyRELU。

***ps:要这样做只是因为看起来效果好。就是纯粹工程调出来了一个不错的效果。***

##### 2.2 一些约定俗成的规矩

- 在Discriminator和generator中大部分层都使用batch normalization，而在最后一层时通常不会使用batch normalizaiton，目的 是为了保证模型能够学习到数据的正确的均值和方差
- 因为会从random的分布生成图像，所以一般做需要增大图像的空间维度时如7*7->14*14， 一般会使用strdie为2的deconv（transposed convolution）
- 通常在DCGAN中会使用Adam优化算法而不是SGD。



#### 3. 用pytorch实现DCGAN

计算尺寸大小的公式：`H_out=(H_in-1)*stride-2*padding+kernel_size`

##### 3.1 生成器定义

```python
class NetG(nn.Module):
    def __init__(self, ngf, nz):
        super(NetG, self).__init__()
        # layer1输入的是一个100x1x1的随机噪声, 输出尺寸(ngf*8)x4x4
        self.layer1 = nn.Sequential(
            nn.ConvTranspose2d(nz, ngf * 8, kernel_size=4, stride=1, padding=0, bias=False),
            nn.BatchNorm2d(ngf * 8),
            nn.ReLU(inplace=True)
        )
        # layer2输出尺寸(ngf*4)x8x8
        self.layer2 = nn.Sequential(
            nn.ConvTranspose2d(ngf * 8, ngf * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 4),
            nn.ReLU(inplace=True)
        )
        # layer3输出尺寸(ngf*2)x16x16
        self.layer3 = nn.Sequential(
            nn.ConvTranspose2d(ngf * 4, ngf * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 2),
            nn.ReLU(inplace=True)
        )
        # layer4输出尺寸(ngf)x32x32
        self.layer4 = nn.Sequential(
            nn.ConvTranspose2d(ngf * 2, ngf, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf),
            nn.ReLU(inplace=True)
        )
        # layer5输出尺寸 3x96x96
        self.layer5 = nn.Sequential(
            nn.ConvTranspose2d(ngf, 3, 5, 3, 1, bias=False),
            nn.Tanh()
        )

    # 定义NetG的前向传播
    def forward(self, x):
        out = self.layer1(x)
        out = self.layer2(out)
        out = self.layer3(out)
        out = self.layer4(out)
        out = self.layer5(out)
        # print(out)
        return out

```

直接使用·`nn.Sequential` 将上卷积、激活、池化等操作拼接起来即可，这里需要注意上卷积 `ConvTransposed2d `的使用。当 kernel size 为 4、stride 为 2、padding 为 1 时，根据公式 `H_out=(H_in-1)*stride-2*padding+kernel_size`，输出尺寸刚好变成输入的两倍。最后一层采用 kernel size 为 5、stride 为 3、padding 为 1，是为了将 32×32 上采样到 96×96，这是本例中图片的尺寸，与论文中 64×64 的尺寸不一样。最后一层用 `Tanh `将输出图片的像素归一化至 -1~1，如果希望归一化至 0~1，则需使用 `Sigmoid`。

##### 3.2 判别器的定义

```python
# 定义鉴别器网络D
class NetD(nn.Module):
    def __init__(self, ndf):
        super(NetD, self).__init__()
        # layer1 输入 3 x 96 x 96, 输出 (ndf) x 32 x 32
        self.layer1 = nn.Sequential(
            nn.Conv2d(3, ndf, kernel_size=5, stride=3, padding=1, bias=False),
            nn.BatchNorm2d(ndf),
            nn.LeakyReLU(0.2, inplace=True)
        )
        # layer2 输出 (ndf*2) x 16 x 16
        self.layer2 = nn.Sequential(
            nn.Conv2d(ndf, ndf * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 2),
            nn.LeakyReLU(0.2, inplace=True)
        )
        # layer3 输出 (ndf*4) x 8 x 8
        self.layer3 = nn.Sequential(
            nn.Conv2d(ndf * 2, ndf * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 4),
            nn.LeakyReLU(0.2, inplace=True)
        )
        # layer4 输出 (ndf*8) x 4 x 4
        self.layer4 = nn.Sequential(
            nn.Conv2d(ndf * 4, ndf * 8, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 8),
            nn.LeakyReLU(0.2, inplace=True)
        )
        # layer5 输出一个数(概率)
        self.layer5 = nn.Sequential(
            nn.Conv2d(ndf * 8, 1, 4, 1, 0, bias=False),
            nn.Sigmoid()
        )

    # 定义NetD的前向传播
    def forward(self,x):
        out = self.layer1(x)
        out = self.layer2(out)
        out = self.layer3(out)
        out = self.layer4(out)
        out = self.layer5(out)
        # print(out)
        return out



```

可以看出判别器和生成器的网络结构几乎是对称的，从卷积核大小到 padding、stride 等设置，**几乎一模一样**。例如生成器的最后一个卷积层的尺度是（5，3，1），判别器的第一个卷积层的尺度也是（5，3，1）。另外，这里需要注意的是生成器的激活函数用的是 ReLU，而判别器使用的是 LeakyReLU，二者并无本质区别，这里的选择更多是**经验总结**。每一个样本经过判别器后，输出一个 0~1 的数，表示这个样本是真图片的概率。

##### 3.3 训练模型

```python
import argparse
import torch
import torchvision
import torchvision.utils as vutils
import torch.nn as nn
from random import randint
from model import NetD, NetG

def __getitem__(self, item):
        image, label = self.imgs[item]
        image = Image.open(image)
        img = transform(image)
        print(image, img.shape)
        return img, label

parser = argparse.ArgumentParser()
parser.add_argument('--batchSize', type=int, default=64)
parser.add_argument('--imageSize', type=int, default=96,help='size of image')
parser.add_argument('--nz', type=int, default=100, help='size of the latent z vector')
parser.add_argument('--ngf', type=int, default=64,help='num of G feature map')
parser.add_argument('--ndf', type=int, default=64,help='num of D feature map')
parser.add_argument('--epoch', type=int, default=400, help='number of epochs to train for')
parser.add_argument('--lr', type=float, default=0.0002, help='learning rate, default=0.0002')
parser.add_argument('--beta1', type=float, default=0.5, help='beta1 for adam. default=0.5')
parser.add_argument('--data_path', default='data/', help='folder to train data')
parser.add_argument('--outf', default='imgs/', help='folder to output images and model checkpoints')
opt = parser.parse_args()
# 定义是否使用GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(device)

#图像读入与预处理
transforms = torchvision.transforms.Compose([
    torchvision.transforms.Resize(opt.imageSize),
    # torchvision.transforms.ToPILImage(mode=None),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)), ])

dataset = torchvision.datasets.ImageFolder(opt.data_path, transform=transforms)

dataloader = torch.utils.data.DataLoader(
    dataset=dataset,
    batch_size=opt.batchSize,
    shuffle=True,
    drop_last=True,
)

netG = NetG(opt.ngf, opt.nz).to(device)
netD = NetD(opt.ndf).to(device)
#是否要使用训练过的模型
# netD.load_state_dict(torch.load("D.pth"))
# netG.load_state_dict(torch.load("G.pth"))


criterion = nn.BCELoss()
optimizerG = torch.optim.Adam(netG.parameters(), lr=opt.lr, betas=(opt.beta1, 0.999))
optimizerD = torch.optim.Adam(netD.parameters(), lr=opt.lr, betas=(opt.beta1, 0.999))

label = torch.FloatTensor(opt.batchSize)
real_label = 1
fake_label = 0
for epoch in range(1, opt.epoch + 1):
    for i, (imgs,_) in enumerate(dataloader):
        # 固定生成器G，训练鉴别器D
        optimizerD.zero_grad()
        ## 让D尽可能的把真图片判别为1
        imgs=imgs.to(device)
        output = netD(imgs)
        label.data.fill_(real_label)
        label=label.to(device)
        errD_real = criterion(output, label)
        errD_real.backward()
        ## 让D尽可能把假图片判别为0
        label.data.fill_(fake_label)
        noise = torch.randn(opt.batchSize, opt.nz, 1, 1)
        noise=noise.to(device)
        fake = netG(noise)  # 生成假图
        output = netD(fake.detach()) #避免梯度传到G，因为G不用更新
        errD_fake = criterion(output, label)
        errD_fake.backward()
        errD = errD_fake + errD_real
        optimizerD.step()

        # 固定鉴别器D，训练生成器G
        optimizerG.zero_grad()
        # 让D尽可能把G生成的假图判别为1
        label.data.fill_(real_label)
        label = label.to(device)
        output = netD(fake)
        errG = criterion(output, label)
        errG.backward()
        optimizerG.step()

        print('[%d/%d][%d/%d] Loss_D: %.3f Loss_G %.3f'
              % (epoch, opt.epoch, i, len(dataloader), errD.item(), errG.item()))

    vutils.save_image(fake.data,
                      '%s/fake_samples_epoch_%03d.png' % (opt.outf, epoch),
                      normalize=True)
    torch.save(netG.state_dict(), '%s/netG_%03d.pth' % (opt.outf, epoch))
    torch.save(netD.state_dict(), '%s/netD_%03d.pth' % (opt.outf, epoch))

```

（1）训练判别器。

- 固定生成器
- 对于真图片，判别器的输出概率值尽可能接近 1
- 对于生成器生成的假图片，判别器尽可能输出 0

（2）训练生成器。

- 固定判别器
- 生成器生成图片，尽可能让判别器输出 1

（3）返回第一步，循环交替训练

##### 3.4 实验结果分析



![50 epoch](http://qiniu.dcts.top/fake_samples_epoch_051.png)

  										



![200 epoch](http://qiniu.dcts.top/fake_samples_epoch_200.png)

​										

![400 epoch](http://qiniu.dcts.top/fake_samples_epoch_400.png)

#### 4. 参考资料

- [如何用基于PyTorch的生成对抗网络生成动漫头像？](<https://mp.weixin.qq.com/s/vx0txFUf10QDBlldz0VJmg>)
- [Pytorch实战3：DCGAN深度卷积对抗生成网络生成动漫头像](https://blog.csdn.net/sunqiande88/article/details/80219842)

