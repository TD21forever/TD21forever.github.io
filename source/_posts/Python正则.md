---
title: Python正则
tags: [正则, 进阶, 笔记]
categories: [三分技术]
description: 'Python中的正则表达式,中等难度的知识点的整理与概括,但不包括最基础的正则知识'
abbrlink: ca4e4d5f
date: 2019-04-16 16:12:40
---

### 常用 

*   在带有 `'r'` 前缀的字符串字面值中，反斜杠不必做任何特殊处理。反斜重复两次将导致理解障碍，所以高度推荐，就算是最简单的表达式，也要使用原始字符串。
*   `'*'`, `'+'`，和 `'?'` 修饰符都是 _贪婪的_；它们在字符串进行尽可能多的匹配。有时候并不需要这种行为。如果正则式 `<.*>` 希望找到 `'<a> b <c>'`，它将会匹配整个字符串，而不仅是 `'<a>'`。在修饰符之后添加 `?` 将使样式以 **非贪婪**即最小方式进行匹配；尽量 少 的字符将会被匹配。 使用正则式 `<.*?>` 将会仅仅匹配 `'<a>'`。

*   特殊字符在集合中，失去它的特殊含义。比如 `[(+*)]` 只会匹配这几个文法字符 `'('`, `'+'`, `'*'`, or `')'`
*   `\B`匹配空字符串，但 不 能在词的开头或者结尾。意思就是 `r'py\B'` 匹配 `'python'`, `'py3'`, `'py2'`, 但不匹配 `'py'`, `'py.'`, 或者 `'py!'`. `\B` 是 `\b` 的取非。(说人话就是后边必须有点东西)

#### 模块内容

*   `re.compile(pattern, flags=0)` 可以让正则多次使用
*   `re.search(pattern, string, flags=0)`扫描整个字符串，找到匹配样式的第一个位置，并返回一个相应的**匹配对象**如果没有匹配，就返回一个 `None`
*   `re.match(pattern, string, flags=0)`注意**即便是 `MULTILINE` 多行模式,`re.match()` 也只匹配字符串的开始位置**，而不匹配每行开始。如果你想定位 string 的任何位置，使用 `search()`来替代
*   `re.split(pattern, string, maxsplit=0, flags=0)` 用 `pattern`分开 `string` 。 如果在 `pattern` 中捕获到括号，那么所有的组里的文字也会包含在列表里。如果 `maxsplit` 非零， 最多进行 `maxsplit`次分隔， 剩下的字符全部返回到列表的最后一个元素。
*   `re.findall(pattern, string, flags=0)` 对 `string` 返回一个不重复的`pattern` 的**匹配列表**， `string` 从左到右进行扫描，匹配按找到的顺序返回。如果样式里存在一到多个组，就返回一个组合列表；就是一个元组的列表（如果样式里有超过一个组合的话）。空匹配也会包含在结果里。
*   `re.finditer(pattern, string, flags=0)` `pattern` 在 `string` 里所有的非重复匹配，返回为一个`迭代器 iterator`保存了**匹配对象** 。`string`从左到右扫描，匹配按顺序排列。空匹配也包含在结果里。(用迭代器保存返回的**匹配对象**)

### 正则对象

编译后的正则表达式对象支持的方法和属性

```python
pattern = re.compile("d")
pattern.search()
pattern.match()
pattern.findall()
pattern.finditer()
...
```

### 匹配对象

匹配对象总是有一个布尔值 True。如果没有匹配的话`match()` 和`search()`返回 None 所以你可以简单的用 if 语句来判断是否匹配

```python
match = re.search(pattern, string)
if match:
    process(match)

```

### 组的概念

正则式中的每个组都有一个序号，它是按定义时从左到右的顺序**从1开始编号**的。其实，re的正则式还有一个0号组，**它就是整个正则式本身。**

- `match.group()`
- `group(0)` 与 `group()` 等价，其结果为整个正则式匹配到的内容，包括没有包到组里面的内容
  
- `match.groups()`
  - 匹配组里面的内容，把他们都列出来放到元组里
  
- `match.__getitem__()`

- `match.lastgroup`
  - 最后一个匹配到的组的组名,如果没有产生匹配的话返回`None`。
  
- `match.start()`
  - 返回给定的组开始的位置
  
- `match.end()`
  - 返回给定的组结束的位置+1
  
- `match.span()`
  - 返回（start,end）的形式

```python
>>>> p=re.compile( r’(?P<name>[a-z]+)/s+(?P<age>/d+)/s+(?P<tel>/d+).*’ , re.I )

>>> p.groupindex

{'age': 2, 'tel': 3, 'name': 1}

>>> s=’Tom 24 88888888  <=’

>>> m=p.search(s)

>>> m.groups()                           # 看看匹配的各组的情况

('Tom', '24', '8888888')

>>> m.group(‘name’)                   # 使用组名获取匹配的字符串

‘Tom’

>>> m.group( 1 )                         # 使用组序号获取匹配的字符串，同使用组名的效果一样

>>> m.group(0)                           # 0 组里面是什么呢？

'Tom 24 88888888  <='

```