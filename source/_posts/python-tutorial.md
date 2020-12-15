---
title: Python Tutorial
tags: [Python, 入门, 笔记]
categories: [三分技术]
description: '大一软件部上课课件,python入门资料整理'
abbrlink: 9dac317c
date: 2018-11-05 18:40:03
---

### 资料

1.  基础学习教程
    1.  [Python3 教程 | 菜鸟教程](https://link.zhihu.com/?target=http%3A//www.runoob.com/python3/python3-tutorial.html)
    2.  [Python tutorial 3.5.2 documentation](https://link.zhihu.com/?target=http%3A//www.pythondoc.com/pythontutorial3/)
    3.  [《Think Python》](http://codingpy.com/books/thinkpython2/)
    4.  如果你不喜欢看文档,[莫烦Python](https://morvanzhou.github.io/)视频教程
2.  练练手
    1.  github上的一些项目
    2.  [别人的一些项目](https://github.com/TD21forever/Mini-Python-Project)

### 标准数据类型

Python3 中有六个标准的数据类型：

*   String（字符串）
*   Number（数字）
*   List（列表）
*   Tuple（元组）
*   Set（集合）
*   Dictionary（字典）


### String（字符串）

1.  字符串的基本操作
  
  ```python
    name = "自动化科协"
    department = "软件部"
    print(name+department)#字符串做加法
    print(name*10)#字符串做乘法
    print(name[0])#取字符串的第一位
    print(name[-1])#取字符串的最后一位
  ```
  
2.  格式化字符串
  
  ```python
    date_1 = "%d年%d月%d日是%s的生日" %(1964,9,10,'马云')
    print(date_1)#%d代表数字，%s代表字符串
    date_2 = "{}年{}月{}日是{}的生日".format(1964,9,10,'马云')
    print(date_2)#这样就不用%了
  ```
  
3.  切片（slice）
  
  ```python
    string = '自动化科协软件部'
    new_string = string[3:5]#3包括5不包括
    print(new_string)
    a = '大家好这是我的联系电话110120119,大家有空请别联系我'
    new_a = a[11:20]#11包括20不包括
    print(new_a)
  ```
  

### Number（数字）

> Python3 支持 **int、float、bool、complex（复数）**。 在Python 3里，只有一种整数类型 int，表示为长整型，没有 python2 中的 Long。

```python
a,b,c,d = 20, 5.5, True, 4+3j
print (a,b,c,d)
print (type(a),type(b),type(c)，type(d))#这里用到了type这个函数
```


### List（列表）

1.  列表的建立
  
  ```python
    list_1 = [1111,'2222',3.333,True,['This is a list'],None] #列表的建立用[]
  ```
  
2.  列表的遍历（迭代）

  ~~~python
    for one in list_1:#用这种方式遍历
    	print(one)
    ```
    for one in list_1:
    	print(type(one))
    ```
  ~~~

  

3.  列表的一些操作

  ```python
    list_1.reverse()
    print(list_1)
    list_1.append('我添加了一个元素')
    print(list_1)
    list_1.remove(None)
    print(list_1)
  ```

    


### Tuple（元组）

1.  元组的建立
  
  ```python
    tuple_1 = (1111,'2222',3.333,True,['This is a list'],None,(1,2,3))#元组的建立用()
  ```
  
2.  元组和列表不同之处
  
  ```python
    List = [1,2]
    Tuple = (3,4)
    List[0] = 5
    print(List)
  ```
  
    
  

### Set（集合）

1.  集合的建立
  
  ```python
    set_1 = {1,2,3,4,4,4,5,5,2,1}
    print(set_1)
  ```
  

### Dictionary（字典）

1.  字典的建立
  
  ```python
    slogan= {
    	'Adidas':'没有不可能（impossible is nothing)',
    	'Nike' :'Just do it',
    	'Lining':'一切皆有可能',
    	'4399'	:'一切皆有可能',
    	# '4399'	:"4399v587"
    }
    print(slogan['Lining'])
    print(slogan['4399'])
  ```
  
    
  

* * *

### 其他的一些操作

```python
def find_boyfriend(face,height,money):
	if face > 85:
		print("oh he is my boyfriend")
		return
	elif height > 185:
		print("oh he is my boyfriend")
		return
	elif money > 100000000000000:
		print("OH God! He must be the one!!!!")
		return
	else:
		print("Who are you?")

find_boyfriend(12,170,11)
```

### 骚操作

1.  语义化
  
  ```python
    List = [1,2,3,4,5]
    print(1 in List)
    wo = "帅"
    if wo is not "丑":
    	print("我很帅")
  ```
  
2.  列表解析
  
  ~~~python
    b = [i for i in List]
    print(b)
    
    ```
    b = []
    for i in List:
        b.append(i)
    print(b)
    ```
  ~~~
  
3.  值交换
  
  ```python
    a,b = 5,10
    temp = b
    b = a
    a= temp
    print(a,b)
    a,b = b,a
    print(a,b)
  ```
  
4.  join函数
  
  ```python
    a=["这是一堂",'严肃的',"python课程"]
    print("哈哈哈哈啊哈哈".join(a))
  ```
  
5.  列表或者字符串逆序
  
  ```python
    b = '123456789'
    print(b[2::3])
    print(b[::-1])#从头到尾 如果第三个参数是负数 默认从尾部开始算
  ```
  
6.  比大小
  
  ```python
    b = 10
    3 < b and b < 12 
    print(3<10<12)
    print(4<10<9)
  ```
  
7.  列表和集合互用，消除重复元素
  
  ```python
    list_1 = [1,1,1,2,2,2,3,3,3,3,4,4]
    print(list(set(list_1)))
  ```
  
  
  

### 同样重要的题外话

1.  大一少打游戏 晚自习多看点课外书
2.  英语很重要 四六级大一总得过了吧
3.  如果有机会之后会讲什么
    1.  Markdown
        1.  Typora...
        2.  [作业部落](https://www.zybuluo.com/mdeditor)
        3.  [常用语法笔记](https://ouweiya.gitbooks.io/markdown/)
    2.  Git
        1.  [廖雪峰](https://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/001373962845513aefd77a99f4145f0a2c7a7ca057e7570000)
        2.  [莫烦](https://morvanzhou.github.io/tutorials/others/git/5-1-github/)
    3.  Linux
    4.  正则表达式
        1.  [正则表达式](https://regex101.com/)
4.  关于问问题
    1.  百度谷歌能解决最好
    2.  如果要问别人，请把代码贴在[这里](https://paste.ubuntu.com/)