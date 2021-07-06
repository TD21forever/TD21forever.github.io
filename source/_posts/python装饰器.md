---
title: python装饰器
comments: true
categories:
  - 三分技术
tags:
  - python
  - 笔记
description: python装饰器学习笔记
abbrlink: 7939eb34
date: 2021-06-09 00:26:15
---

### 一个需求

这里有两个已经写好的函数，但我需要在不显性地改变这些函数的基础上，获取函数运行的时间

```python
def my_func():
    lis = []
    for i in range(9999999):
        lis.append(i)
    return lis
def my_func2():
    return [i for i in range(9999999)]
```

#### 方法一、

最直接的，但这样改变了函数调用的方式，也不够优雅

```python
def timeit(func):
    s = time.time()
    res = func()
    e = time.time()
    print(f"Finished {func.__name__!r} in {e-s:.4f} secs")
    return res
res = timeit(my_func)
```

#### 方法二、

```python
def timeit(func):
    def wrapper():
        s = time.time()
        res = func()
        e = time.time()
        print(f"Finished {func.__name__!r} in {e-s:.4f} secs")
        return res
    return wrapper
my_func = timeit(my_func)
res = my_func()
```

这样写很奇怪很啰嗦，但其实它等价于

```python
@timeit
def my_func():
    lis = []
    for i in range(9999999):
        lis.append(i)
    return lis
res = my_func()
```

在这个例子中，需要注意几个事情：

1. timeit的返回值是什么？-> 是一个函数
2. wrapper的返回值是什么？ -> 是一个值

因此，`@timeit`实际上是`my_func = timeit(my_func)`的一种省略，此时的`my_func`其实是里面的`wrapper`

### 一些写法

#### 初始的函数有参数怎么办

```python
def timeit(func):
    def wrapper(*args,**kwargs):
        #do something
        res = func(*args,**kwargs)
        #do something
        return res
    return wrapper
    
@timeit
def my_func(name):
    return f"My name is {name}"
```

#### @functools.wrapper的使用

在上面这份代码中，`my_func.__name__`的输出是`wrapper`，也就是说`my_func`失去了原始函数的信息，可以使用@functools.wrapper来解决这个问题

```python
import functools

def timeit(func):
    @functools.wraps(func)
    def wrapper(*args,**kwargs):
        #do something
        res = func(*args,**kwargs)
        #do something
        return res
    return wrapper

@timeit
def my_func(name):
    return f"My name is {name}"
```

此时`my_func.__name__`的输出是`wrapper`

> `@functools.wrapper` 装饰器使用函数`functions.update_wrapper()`来更新内省中使用的`__name__`和`__doc__`等特殊属性。

#### 装饰器的嵌套

```python
@timeit
@do_twice
def my_func():
    return "This is my function"
```

等价于`timeit(do_twice(my_func))`

#### 带参数的装饰器

希望使用装饰器的方式控制一个函数执行的次数，且次数可作为参数配置

```python
def repeat(repeat_nums):
    def decorator(func):
        @functools.wraps(func)
        def wrapper():
            for _ in range(repeat_nums):
                res = func()
                print(res)
        return wrapper
    return decorator

 
@repeat(repeat_nums=10)
def my_func():
    return "This is my func"
```

其实只是在原来装饰器的模板上，加了一个`def repeat(repeat_nums)` ，注意

- `@repeat(``repeat_nums=10``)`实际上会调用内部的`decorator`函数，这就和之前使用装饰器的原理一样了。因此不要忘了需要加括号。

### 装饰器类

还记得装饰器语法`@``decorator` 等价于`my_func = decorator(my_func)`，如果decorator需要是一个类：

- `__init__`中需要将func作为参数传入
- 该类需要可调用，因此需要实现`__call__()`

```python
import functools

class Decorator:
    def __init__(self,func):
        functools.update_wrapper(self, func) #不是@functools.wrapper
        self.func = func
    def __call__(self,*args,**kwargs):
        # do sth before
        res = self.func(*args,**kwargs)
        # do sth after
        return res
@Decorator
def my_func():
    ...
```

### 一些例子

#### 模板

```python
import functools

def decorator(func):
    @functools.wraps(func)
    def wrapper(*args,**kwargs):
        # do sth
        res = func()
        # do sth
        return res
    return wrapper
```

#### 轻量级的插件架构

```python
PLUGINS = dict()

def register(func):
    PLUGINS[func.__name__] = func
    return func

    
@register
def my_func(name):
    return f"My name is {name}"
```

#### 使用装饰器实现单例

```python
def singleton(cls):
    @functools.wraps(cls)
    def wrapper(*args,**kwargs):
        if not wrapper.ins:
            wrapper.ins = cls(*args,**kwargs)
        return wrapper.ins
    wrapper.ins = None
    return wrapper

    
@singleton
class Test:
    ...
```

#### 缓存中间信息

```python
def cache(func):
    def wrapper(*args,**kwargs):
        functools.wraps(func)
        keys = args + tuple(kwargs.values())
        for key in keys:
            if key not in wrapper.cache:
                wrapper.cache[key] = func(*args,**kwargs)
            return wrapper.cache[key]
    wrapper.cache = dict()
    return wrapper


@cache
def fibonacci(num):
    if num < 2:
        return num
    return fibonacci(num - 1) + fibonacci(num - 2)
```

### 阅读更多

https://sikasjc.github.io/2018/09/17/pythondecorator/

https://python3-cookbook.readthedocs.io/zh_CN/latest/c09/p01_put_wrapper_around_function.html