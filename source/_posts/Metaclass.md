---
title: Metaclass
comments: true
categories:
  - 三分技术
tags:
  - python
description: Metaclass，Python不得不提的黑魔法。
abbrlink: a1399864
date: 2022-01-07 02:34:36
---


翻译自

[What are metaclasses in Python?](https://stackoverflow.com/questions/100003/what-are-metaclasses-in-python?rq=1)

## 类也是对象

在大多数编程语言中，类只是一串用于描述如何生成一个对象的代码。但在python中，类不止如此，类也是对象（object）！

```python
>>> class ObjectCreator(object):
...       pass
...
```

一旦使用关键字`class`，`python`便会执行它并且生成一个**对象。**这个对象的名字叫做`ObjectCreator`。


{% note info %}
💡 这个对象有创建其他对象的能力，所以我们也叫它，类。
{% endnote %}

上面的描述也许看的晕乎乎，简而言之，我们传统认知中类是用来实例化一个对象的，这当然没错，但在python中，类本身就是一个对象，既然是个对象，则有对象应该有的性质

- 可以赋值给一个变量
- 可以copy它
- 可以为它添加属性
- 可以当作函数的参数

```python
>>> print(ObjectCreator) # you can print a class because it's an object
<class '__main__.ObjectCreator'>
=================================
>>> def echo(o):
...       print(o)
...
>>> echo(ObjectCreator) # you can pass a class as a parameter
<class '__main__.ObjectCreator'>
=================================
>>> print(hasattr(ObjectCreator, 'new_attribute'))
False
>>> ObjectCreator.new_attribute = 'foo' # you can add attributes to a class
>>> print(hasattr(ObjectCreator, 'new_attribute'))
True
>>> print(ObjectCreator.new_attribute)
foo
=================================
>>> ObjectCreatorMirror = ObjectCreator # you can assign a class to a variable
>>> print(ObjectCreatorMirror.new_attribute)
foo
>>> print(ObjectCreatorMirror())
<__main__.ObjectCreator object at 0x8997b4c>
```

## 动态创建类

因为类也是对象，所以和其他任何的对象一样，我们可以即时(on the fly)创建一个类。

比如，在函数中创建类

```python
>>> def choose_class(name):
...     if name == 'foo':
...         class Foo(object):
...             pass
...         return Foo # return the class, not an instance
...     else:
...         class Bar(object):
...             pass
...         return Bar
```

但它看起来没那么动态，因为我们仍然需要自己写完整个类的定义。既然类也是对象，那肯定有啥东西可以创建这个对象，这个东西是啥呢？是`type`！

```python
>>> print(type(1))
<type 'int'>
>>> print(type("1"))
<type 'str'>
>>> print(type(ObjectCreator))
<type 'type'>
>>> print(type(ObjectCreator()))
<class '__main__.ObjectCreator'>
```

`type`不仅可以告诉你一个对象的类型，也可以动态地创建一个类。type可以将一个类的描述当作参数传入并返回一个类。（为了向后兼容，type通过改变参数实现了两种完全不同的功能）

```python
type(name, bases, attrs)
```

- **`name`**: 类名
- **`bases`**: 父类元祖 (继承，可以为空)
- **`attrs`**: 字典

比如以下两种创建类的方式就是等价的

```python
>>> class Foo(object):
...       bar = True

<=>

>>> Foo = type('Foo', (), {'bar':True})
```

也可以使用继承

```python
>>>   class FooChild(Foo):
...         pass

<=>

>>> FooChild = type('FooChild', (Foo,), {})
>>> print(FooChild)
<class '__main__.FooChild'>
>>> print(FooChild.bar) # bar is inherited from Foo
True
```

可以添加方法

```python
>>> def echo_bar(self):
...       print(self.bar)
...
>>> FooChild = type('FooChild', (Foo,), {'echo_bar': echo_bar})
```

这就是当我们使用`class`关键字时python做的事，这一切都是通过metaclass实现的。

## Metaclasses

{% note info %}
👉🏿 metaclasses 是一些用来创建class的东西
{% endnote %}


我们定义class目的是创建对象，而class本身又是对象，metaclasses就是来创建class这个对象的，所以他们是class的类。

我们可以用下面的代码表示

```python
MyClass = MetaClass()
my_object = MyClass()
```

还记得type可以创建一个类吗

```python
MyClass = type('MyClass', (), {})
```

这是因为实际上，type本身就是一个metaclass。

{% note info %}
👉🏿 `type` is the metaclass Python uses to create all classes behind the scenes.
{% endnote %}

就如同`str`创建string 对象，`int`创建integer对象，`type`就用来创建class对象

```python
>>> age = 35
>>> age.__class__
<type 'int'>
>>> name = 'bob'
>>> name.__class__
<type 'str'>
>>> def foo(): pass
>>> foo.__class__
<type 'function'>
>>> class Bar(object): pass
>>> b = Bar()
>>> b.__class__
<class '__main__.Bar'>
```

那`__class__`的`__class__`是什么呢？

```python
>>> age.__class__.__class__
<type 'type'>
>>> name.__class__.__class__
<type 'type'>
>>> foo.__class__.__class__
<type 'type'>
>>> b.__class__.__class__
<type 'type'>
```

因此，metaclass就是一个用来创建class对象的东西。而`type`是内置的metaclass，言外之意，我们还可以创建自己的metaclass

## `__metaclass__`

在python2中，当我们写下一个类，我们可以加入`__metaclass__` 属性

```python
class Foo(object):
    __metaclass__ = something...
    [...]
```

首先我们敲下`class Foo(object)`,但此时`Foo`这个类对象没有立刻在内存中创建。

python会在类的定义中寻找`__metaclass__` 属性，如果有，就用`__metaclass__` 来创建`Foo`对象，否则就用`type`创建。

如果我们的类是这样的

```python
class Foo(Bar):
    pass
```

如果有`__metaclass__` ，就用它创建一个类对象Foo，如果找不到，python会在MODULE层找，并做同样的事情。（但要保证这个类对象没有继承任何东西）。如果还是找不到，就从`Bar`类中去寻找。

在python3中，设置metaclass的方式变了

```python
class Foo(object, metaclass=something):
    ...
```

依然可以像这种方式给metaclass增加属性

```python
class Foo(object, metaclass=something, kwarg1=value1, kwarg2=value2):
    ...
```

## 自定义的metaclasses

假设我希望所有我定义的类中，所有的属性都要大写，这时就可以通过设置`__metaclass__`来实现。`__metaclass__` 形式上可以是任何可以被调用的东西。比如函数

```python
# the metaclass will automatically get passed the same argument
# that you usually pass to `type`
def upper_attr(future_class_name, future_class_parents, future_class_attrs):
    """
      Return a class object, with the list of its attribute turned
      into uppercase.
    """
    # pick up any attribute that doesn't start with '__' and uppercase it
    uppercase_attrs = {
        attr if attr.startswith("__") else attr.upper(): v
        for attr, v in future_class_attrs.items()
    }

    # let `type` do the class creation
    return type(future_class_name, future_class_parents, uppercase_attrs)

__metaclass__ = upper_attr # this will affect all classes in the module

class Foo(): # global __metaclass__ won't work with "object" though
    # but we can define __metaclass__ here instead to affect only this class
    # and this will work with "object" children
    bar = 'bip'
```

```python
>>> hasattr(Foo, 'bar')
False
>>> hasattr(Foo, 'BAR')
True
>>> Foo.BAR
'bip'
```

用类也可以完成同样的事情,这里`type` 就如同`int` 、`str` 当作父类被继承。`__new__` 在`__init__` 之前被调用，用于控制如何创建一个对象。

```python
 # remember that `type` is actually a class like `str` and `int`
# so you can inherit from it
class UpperAttrMetaclass(type):
    # __new__ is the method called before __init__
    # it's the method that creates the object and returns it
    # while __init__ just initializes the object passed as parameter
    # you rarely use __new__, except when you want to control how the object
    # is created.
    # here the created object is the class, and we want to customize it
    # so we override __new__
    # you can do some stuff in __init__ too if you wish
    # some advanced use involves overriding __call__ as well, but we won't
    # see this
    def __new__(upperattr_metaclass, future_class_name,
                future_class_parents, future_class_attrs):
        uppercase_attrs = {
            attr if attr.startswith("__") else attr.upper(): v
            for attr, v in future_class_attrs.items()
        }
        return type(future_class_name, future_class_parents, uppercase_attrs)
```

接下来，然我们用更规范、更简短的方式重新写一下上面这个类

```python
class UpperAttrMetaclass(type):
    def __new__(cls, clsname, bases, attrs):
        uppercase_attrs = {
            attr if attr.startswith("__") else attr.upper(): v
            for attr, v in attrs.items()
        }
        return type(clsname, bases, uppercase_attrs)
```

但这不是这正确的OOP，因为我们直接调用了`type` 没有重写或是调用父类的`__new__` ，让我们来修改一下

```python
class UpperAttrMetaclass(type):
    def __new__(cls, clsname, bases, attrs):
        uppercase_attrs = {
            attr if attr.startswith("__") else attr.upper(): v
            for attr, v in attrs.items()
        }
        return type.__new__(cls, clsname, bases, uppercase_attrs)
```

还可以用super，这样更加简洁，也更加容易继承。

```python
class UpperAttrMetaclass(type):
    def __new__(cls, clsname, bases, attrs):
        uppercase_attrs = {
            attr if attr.startswith("__") else attr.upper(): v
            for attr, v in attrs.items()
        }
        return super(UpperAttrMetaclass, cls).__new__(
            cls, clsname, bases, uppercase_attrs)
```

对了，还有一点，如果python3中这样定义metaclass

```python
class Foo(object, metaclass=MyMetaclass, kwarg1=value1):
    ...
```

`kwarg1` 参数会被传入到`Mymetaclass` 中

```python
class MyMetaclass(type):
    def __new__(cls, clsname, bases, dct, kwargs1=default):
        ...
```

以上就是对metaclass的所有介绍了。其实metaclass本身并不复杂，由于metaclass经常被用于完成一些复杂、黑魔法的工作，所以让人觉得很晦涩难懂。但metaclass本身其实很简单

- 拦截类的创建
- 修改一个类
- 返回修改后的类
