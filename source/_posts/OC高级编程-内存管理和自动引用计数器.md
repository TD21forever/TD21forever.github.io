---
title: OC高级编程|内存管理和自动引用计数器
comments: true
categories:
  - 三分技术
tags:
  - OC
  - 内存管理
  - ARC
  - iOS开发
abbrlink: 1238a258
date: 2023-03-14 03:16:04
description: OC高级编程读书笔记，第一章：内存管理和自动引用计数器
---

# 自动引用计数器

> 在LLVM编译器中设置ARC为有效状态，就无需再次键入retain或者是release代码了

## 内存管理和引用计数

这里用开灯和关灯与解释对象的引用

![Untitled](https://qiniu.dcts.top/typora/202303140317792.png)

没有人进入的时候，会议室关灯，引用数为0。反过来，所有的人都离开后，引用数为0，会议室关灯。

这里强调了内存管理的思考方式

- 自己生成的对象，自己所持有
  - 生成并持有：alloc、new、copy、mutableCopy
- 非自己生成的对象，自己也能持有
  - 持有：retain
- 不再需要自己持有的对象时释放
  - 释放：release
  - 废弃：dealloc
- 非自己持有的对象无法释放

这些方法不包括在OC这门语言中，而是包含在Cocoa框架中。Foundation框架类库的NSObject类担任内存管理的职责

上述的alloc、retain等方法分别指代NSObject类的 alloc类方法、retain实例方法、release实例方法、dealloc实例方法

### 自己生成的对象，自己所持有

```swift
id obj = [[NSObject alloc] init];
id obj = [NSObject new];
copy 和 mutableCopy
```

### 非自己生成的对象，自己也能持有

```swift
// NSMutableArray类对象被赋给变量obj，但变量obj自己并不持有该对象。
id obj = [NSMutableArray array];
```

注意，上面这个对象非自己生成，可以获取这个对象，但不持有这个对象

使用retain方法可以持有对象

```swift
[obj retain];
```

使用retain方法，非自己生成的对象跟用alloc或者new等方法生成并持有的对象一样，成为了自己所持有的。

### 持有者有义务释放持有的对象

自己持有的对象，一旦不再需要，就需要使用release释放。

```swift
id obj = [[NSObject alloc] init]; // 自己生成，自己持有
[obj release]; // 释放自己持有的对象

id obj = [NSMutableArray array]; // 非自己生成
[obj retain]; // 但是可以持有
[obj release]; // 释放自己持有的对象
```

总之，用alloc方法由自己生成并持有的对象可以通过release方法释放。自己生成而非自己所持有用retain后可以持有，用release方法释放。

### 如果对象是通过一个函数生成的怎么办

首先要规定命名规则

- 自己生成并持有

  ![Untitled](https://qiniu.dcts.top/typora/202303140317837.png)

- 非自己生成，不持有

  - allocate
  - newer
  - copying
  - mutableCopy

比如下面这个函数

```swift
// 自己生成并持有
- （id) allocObject
{
	id obj = [[NSObject alloc] init];
	return obj;
}
id obj1 = [obj0 allocObject];
```

[NSMutableArray array] 是生成对象但是自己不持有，这是怎么实现的呢？

```swift
- (id)object
{
	id obj = [[NSObject alloc] init];
	[obj autorelease];
	return obj;
}

id obj1 = [obj0 object]; // 生成一个对象，但自己不持有
[obj1 retain]; // 持有这个对象

```

autorelease方法可以使得取得的对象存在，但自己不持有对象。

![Untitled](https://qiniu.dcts.top/typora/202303140317853.png)

[NSMutableArray array] 可以获得谁都不持有的对象，这是通过autorelease实现的。

### 释放自己不持有的对象会怎么样

会崩溃！

### 小总结

对于引用计数的思考方式，主要就是考虑两点

- 自己生成，自己持有，这是由四个函数做到的
- 非自己生成，可以获取，但自己不持有，用reatain可以持有

用完了要用release释放，如果没有持有直接释放，会崩溃！

这里用两个例子再加深下印象。在没有ARC的大前提下，首先obj先去引用一个非自己生成对象，在没有使用retain的情况下引用计数显示的是1，这个很好理解因为默认会+1，但如果尝试去release就会报错，因为obj这个对象并没有被持有。此外array方法返回的对象会被放入autoreleasepool中。

![Untitled](https://qiniu.dcts.top/typora/202303140317868.png)

但如果使用的是new，obj引用了一个自已生成自己持有的对象，虽然引用计数器也是1，但它是可以释放的。

![Untitled](https://qiniu.dcts.top/typora/202303140317883.png)

## alloc、retain、release、dealloc是怎么实现的

说明：NSObject类的源码并没有公开，文章这里使用GNUstep开源软件来说明。它是Cocoa框架的互换框架

<aside>
🤔 能不能补充下Cocoa、GNUstep、Core Foundation等的区别呢


</aside>

### alloc

alloc总体看来就是给对象的实例分配内存空间，然后返回指向这片空间的指针。

```objectivec
/**
 * Allocates a new instance of the receiver from the default
 * zone, by invoking +allocWithZone: with
 * <code>NSDefaultMallocZone()</code> as the zone argument.<br />
 * Returns the created instance.
 */
+ (id) alloc
{
  return [self allocWithZone: NSDefaultMallocZone()];
}

/**
 * This is the basic method to create a new instance.  It
 * allocates a new instance of the receiver from the specified
 * memory zone.
 * <p>
 *   Memory for an instance of the receiver is allocated; a
 *   pointer to this newly created instance is returned.  All
 *   instance variables are set to 0.  No initialization of the
 *   instance is performed apart from setup to be an instance of
 *   the correct class: it is your responsibility to initialize the
 *   instance by calling an appropriate <code>init</code>
 *   method.  If you are not using ARC, it is
 *   also your responsibility to make sure the returned
 *   instance is destroyed when you finish using it, by calling
 *   the <code>release</code> method to destroy the instance
 *   directly, or by using <code>autorelease</code> and
 *   autorelease pools.
 * </p>
 * <p>
 *  You do not normally need to override this method in
 *  subclasses, unless you are implementing a class which for
 *  some reasons silently allocates instances of another class
 *  (this is typically needed to implement class clusters and
 *  similar design schemes).
 * </p>
 * <p>
 *   If you have turned on debugging of object allocation (by
 *   calling the <code>GSDebugAllocationActive</code>
 *   function), this method will also update the various
 *   debugging counts and monitors of allocated objects, which
 *   you can access using the <code>GSDebugAllocation...</code>
 *   functions.
 * </p>
 */
+ (id) allocWithZone: (NSZone*)z
{
  return NSAllocateObject(self, 0, z);
}

/*
 *	Now do the REAL version - using the other version to determine
 *	what padding (if any) is required to get the alignment of the
 *	structure correct.
 */
struct obj_layout {
    NSUInteger	retained;
    NSZone	*zone;
    char	padding[ALIGN - ((UNP % ALIGN) ? (UNP % ALIGN) : ALIGN)];
};
typedef	struct obj_layout *obj;

/*
 *	Now do conditional compilation of memory allocation functions
 *	depending on what information (if any) we are storing before
 *	the start of each object.
 */

// FIXME rewrite object allocation to use class_createInstance when we
// are using libobjc2.
inline id
NSAllocateObject(Class aClass, NSUInteger extraBytes, NSZone *zone)
{
  id	new;

#ifdef OBJC_CAP_ARC
  if ((new = class_createInstance(aClass, extraBytes)) != nil)
    {
      AADD(aClass, new);
    }
#else
  int	size; // 容纳对象所需要的大小

  NSCAssert((!class_isMetaClass(aClass)), @"Bad class for new object");
	// 计算容纳对象所需要的大小
  // 实例的大小由三部分构成，类本身的大小、额外的大小、保存引用计数结构体的大小  
  size = class_getInstanceSize(aClass) + extraBytes + sizeof(struct obj_layout);
  if (zone == 0)
    {
      zone = NSDefaultMallocZone();
    }
  // 调用函数，分配存放对象所需的空间
  new = NSZoneMalloc(zone, size);
  if (new != nil)
    {
			// 将该内存空间全部置为0
      memset (new, 0, size);
      new = (id)&((obj)new)[1];
      object_setClass(new, aClass);
      AADD(aClass, new);
    }

  /* Don't bother doing this in a thread-safe way, because the cost of locking
   * will be a lot more than the cost of doing the same call in two threads.
   * The returned selector will persist and the runtime will ensure that both
   * calls return the same selector, so we don't need to bother doing it
   * ourselves.
   */
  if (0 == cxx_construct)
    {
      cxx_construct = sel_registerName(".cxx_construct");
      cxx_destruct = sel_registerName(".cxx_destruct");
    }
  callCXXConstructors(aClass, new);
#endif

  return new;
}
```

源码中出现了很多Zone的字眼，这是为了防止内存碎片化引入的结构。下图把内存分为两个区域，小容量分配到左侧区域，大容量分配到右侧区域。

![Untitled](https://qiniu.dcts.top/typora/202303140317896.png)

obj_layout中的retained用来保存引用计数，会写入对象内存的头部。

![Untitled](https://qiniu.dcts.top/typora/202303140317910.png)

如何获得当前对象的引用计数呢？

```objectivec
id obj = [NSObject new];
[obj retainCount];
```

在源码中提到如果一个对象永远不会被废弃，会返回一个最大值。提到每个实例都会有一个隐式的调用，即使用retainCount会在retained值的基础上+1

```objectivec
/**
 * Returns the reference count for the receiver.  Each instance has an
 * implicit reference count of 1, and has an 'extra reference count'
 * returned by the NSExtraRefCount() function, so the value returned by
 * this method is always greater than zero.<br />
 * By convention, objects which should (or can) never be deallocated
 * return the maximum unsigned integer value.
 */
- (NSUInteger) retainCount
{
#if	GS_WITH_GC
  return UINT_MAX;
#else
  return NSExtraRefCount(self) + 1;
#endif
}

/**
 * Return the extra reference count of anObject (a value in the range
 * from 0 to the maximum unsigned integer value minus one).<br />
 * The retain count for an object is this value plus one.
 */
inline NSUInteger
NSExtraRefCount(id anObject)
{
#if	GS_WITH_GC
  return UINT_MAX - 1;
#else	/* GS_WITH_GC */
  return ((obj)anObject)[-1].retained;
#endif /* GS_WITH_GC */
}
```

![Untitled](https://qiniu.dcts.top/typora/202303140317925.png)

retain实例方法可以使得retained变量+1。源码中提到了如果持有的引用太大了，超过16777214这么多，会报错。但核心代码就一句话`((obj)anObject)[-1].retained++;`

```objectivec
/**
 * Increments the reference count and returns the receiver.<br />
 * The default implementation does this by calling NSIncrementExtraRefCount()
 */
- (id) retain
{
#if	GS_WITH_GC == 0
  NSIncrementExtraRefCount(self);
#endif
  return self;
}

/**
 * Increments the extra reference count for anObject.<br />
 * The GNUstep version raises an exception if the reference count
 * would be incremented to too large a value.<br />
 * This is used by the [NSObject-retain] method.
 */
inline void
NSIncrementExtraRefCount(id anObject)
{
#if	GS_WITH_GC
  return;
#else	/* GS_WITH_GC */
  if (allocationLock != 0)
    {
#if	defined(GSATOMICREAD)
      /* I've seen comments saying that some platforms only support up to
       * 24 bits in atomic locking, so raise an exception if we try to
       * go beyond 0xfffffe.
       */
      if (GSAtomicIncrement((gsatomic_t)&(((obj)anObject)[-1].retained))
        > 0xfffffe)
	{
	  [NSException raise: NSInternalInconsistencyException
	    format: @"NSIncrementExtraRefCount() asked to increment too far"];
	}
#else	/* GSATOMICREAD */
      NSLock *theLock = GSAllocationLockForObject(anObject);

      [theLock lock];
      if (((obj)anObject)[-1].retained == UINT_MAX - 1)
	{
	  [theLock unlock];
	  [NSException raise: NSInternalInconsistencyException
	    format: @"NSIncrementExtraRefCount() asked to increment too far"];
	}
      ((obj)anObject)[-1].retained++;
      [theLock unlock];
#endif	/* GSATOMICREAD */
    }
  else
    {
      if (((obj)anObject)[-1].retained == UINT_MAX - 1)
	{
	  [NSException raise: NSInternalInconsistencyException
	    format: @"NSIncrementExtraRefCount() asked to increment too far"];
	}
      /**
 * Decrements the retain count for the receiver if greater than zero,
 * otherwise calls the dealloc method instead.<br />
 * The default implementation calls the NSDecrementExtraRefCountWasZero()
 * function to test the extra reference count for the receiver (and
 * decrement it if non-zero) - if the extra reference count is zero then
 * the retain count is one, and the dealloc method is called.<br />
 * In GNUstep, the [NSObject+enableDoubleReleaseCheck:] method may be used
 * to turn on checking for ratain/release errors in this method.
 */
- (oneway void) release
{
#if	GS_WITH_GC == 0
  if (NSDecrementExtraRefCountWasZero(self))
    {
      [self dealloc];
    }
#endif
}
    }
#endif	/* GS_WITH_GC */
}
```

release实例方法可以使得retained变量-1。当retained变量大于0时减1，等于0时调用的dealloc实例方法，废弃对象

```objectivec
/**
 * Decrements the retain count for the receiver if greater than zero,
 * otherwise calls the dealloc method instead.<br />
 * The default implementation calls the NSDecrementExtraRefCountWasZero()
 * function to test the extra reference count for the receiver (and
 * decrement it if non-zero) - if the extra reference count is zero then
 * the retain count is one, and the dealloc method is called.<br />
 * In GNUstep, the [NSObject+enableDoubleReleaseCheck:] method may be used
 * to turn on checking for ratain/release errors in this method.
 */
- (oneway void) release
{
#if	GS_WITH_GC == 0
  if (NSDecrementExtraRefCountWasZero(self))
    {
      [self dealloc];
    }
#endif
}

/**
 * Examines the extra reference count for the object and, if non-zero
 * decrements it, otherwise leaves it unchanged.<br />
 * Returns a flag to say whether the count was zero
 * (and hence whether the extra reference count was decremented).<br />
 * This function is used by the [NSObject-release] method.
 */
BOOL
NSDecrementExtraRefCountWasZero(id anObject)
{
#if	!GS_WITH_GC
  if (double_release_check_enabled)
    {
      NSUInteger release_count;
      NSUInteger retain_count = [anObject retainCount];
      release_count = [autorelease_class autoreleaseCountForObject: anObject];
      if (release_count >= retain_count)
        [NSException raise: NSGenericException
		    format: @"Release would release object too many times."];
    }
  if (allocationLock != 0)
    {
#if	defined(GSATOMICREAD)
      int	result;

      result = GSAtomicDecrement((gsatomic_t)&(((obj)anObject)[-1].retained));
      if (result < 0)
	{
	  if (result != -1)
	    {
	      [NSException raise: NSInternalInconsistencyException
		format: @"NSDecrementExtraRefCount() decremented too far"];
	    }
	  /* The counter has become negative so it must have been zero.
	   * We reset it and return YES ... in a correctly operating
	   * process we know we can safely reset back to zero without
	   * worrying about atomicity, since there can be no other
	   * thread accessing the object (or its reference count would
	   * have been greater than zero)
	   */
	  (((obj)anObject)[-1].retained) = 0;
	  return YES;
	}
#else	/* GSATOMICREAD */
      NSLock *theLock = GSAllocationLockForObject(anObject);

      [theLock lock];
// 这里其实有点巧妙的，并不是先--，而是先判断是不是为0
      if (((obj)anObject)[-1].retained == 0)
	{
	  [theLock unlock];
	  return YES;
	}
      else
	{
	  ((obj)anObject)[-1].retained--;
	  [theLock unlock];
	  return NO;
	}
#endif	/* GSATOMICREAD */
    }
  else
    {
      if (((obj)anObject)[-1].retained == 0)
	{
	  return YES;
	}
      else
	{
	  ((obj)anObject)[-1].retained--;
	  return NO;
	}
    }
#endif /* !GS_WITH_GC */
  return NO;
}
```

看下如何废弃对象

```objectivec
/**
 * Deallocates the receiver by calling NSDeallocateObject() with self
 * as the argument.<br />
 * <p>
 *   You should normally call the superclass implementation of this method
 *   when you override it in a subclass, or the memory occupied by your
 *   object will not be released.
 * </p>
 * <p>
 *   <code>NSObject</code>'s implementation of this method
 *   destroys the receiver, by returning the memory allocated
 *   to the receiver to the system.  After this method has been
 *   called on an instance, you must not refer the instance in
 *   any way, because it does not exist any longer.  If you do,
 *   it is a bug and your program might even crash with a
 *   segmentation fault.
 * </p>
 * <p>
 *   Normally you are supposed to manage the memory taken by
 *   objects by using the high level interface provided by the
 *   <code>retain</code>, <code>release</code> and
 *   <code>autorelease</code> methods (or better by the
 *   corresponding macros <code>RETAIN</code>,
 *   <code>RELEASE</code> and <code>AUTORELEASE</code>), and by
 *   autorelease pools and such; whenever the
 *   release/autorelease mechanism determines that an object is
 *   no longer needed (which happens when its retain count
 *   reaches 0), it will call the <code>dealloc</code> method
 *   to actually deallocate the object.  This means that normally,
 *   you should not need to call <code>dealloc</code> directly as
 *   the gnustep base library automatically calls it for you when
 *   the retain count of an object reaches 0.
 * </p>
 * <p>
 *   Because the <code>dealloc</code> method will be called
 *   when an instance is being destroyed, if instances of your
 *   subclass use objects or resources (as it happens for most
 *   useful classes), you must override <code>dealloc</code> in
 *   subclasses to release all objects and resources which are
 *   used by the instance, otherwise these objects and
 *   resources would be leaked.  In the subclass
 *   implementation, you should first release all your subclass
 *   specific objects and resources, and then invoke super's
 *   implementation (which will do the same, and so on up in
 *   the class hierarchy to <code>NSObject</code>'s
 *   implementation, which finally destroys the object).  Here
 *   is an example of the implementation of
 *   <code>dealloc</code> for a subclass whose instances have a
 *   single instance variable <code>name</code> which needs to
 *   be released when an instance is deallocated:
 * </p>
 * <p>
 *   <code>
 *   - (void) dealloc
 *   {
 *     RELEASE (name);
 *     [super dealloc];
 *   }
 *   </code>
 *  </p>
 *  <p>
 *    <code>dealloc</code> might contain code to release not
 *    only objects, but also other resources, such as open
 *    files, network connections, raw memory allocated in other
 *    ways, etc.
 *  </p>
 * <p>
 *   If you have allocated the memory using a non-standard mechanism, you
 *   will not call the superclass (NSObject) implementation of the method
 *   as you will need to handle the deallocation specially.<br />
 *   In some circumstances, an object may wish to prevent itself from
 *   being deallocated, it can do this simply be refraining from calling
 *   the superclass implementation.
 * </p>
 */
- (void) dealloc
{
  NSDeallocateObject(self);
}

inline void
NSDeallocateObject(id anObject)
{
		// 核心代码
		obj	o = &((obj)anObject)[-1];
    NSZone	*z = NSZoneFromPointer(o);
		NSZoneFree(z, o);
}
```

### 小结

GNUstep是如何实现这四个函数的

- alloc：计算对象的size，包括三个部分。memset分配内存，全部置为0;
- retain：引用计数+1
  - retainCount 的值是引用计数器的值 + 1，因此alloc后 retainCount的值为1
- release：引用计数器的值减一
  - 如果在retained值为0的时候调用了release，说明retainCount的值变为零了，说明要废弃这个对象
- dealloc：引用计数器为0时，废弃对象，释放内存。

### 苹果的实现

- alloc
  - allocWithZone
  - class_createInstance
  - calloc

![Untitled](https://qiniu.dcts.top/typora/202303140317938.png)

GNUstep是把引用计数放在对象占用内存块的头部，苹果则保存在一个哈希表中。

这个哈希表叫做引用计数表，记录着某个对象的所有引用记录，此外还存有内存块地址，可以追溯引用者的内存块。

![Untitled](https://qiniu.dcts.top/typora/202303140317949.png)

### autorelease

c语言的自动变量：

[自动变量 - 维基百科，自由的百科全书](https://zh.m.wikipedia.org/zh-hans/%E8%87%AA%E5%8A%A8%E5%8F%98%E9%87%8F)

具体来说即是在[控制流](https://zh.m.wikipedia.org/wiki/%E6%8E%A7%E5%88%B6%E6%B5%81)进入变量作用域时系统自动为其[分配存储空间](https://zh.m.wikipedia.org/wiki/%E5%86%85%E5%AD%98%E7%AE%A1%E7%90%86)，并在离开作用域时释放空间的一类变量

autorelease会像C语言的自动变量那样来对待对象实例。当超出作用域时，对象实例的release实例方法被调用。下图展示了autorelease的使用方法

![Untitled](https://qiniu.dcts.top/typora/202303140317960.png)

把NSAutoreleasePool对象的生存周期当做C语言的作用域去理解。当obj调用autorelease方法时，就好像是在这个作用域里声明了一个变量。pool 调用drain方法，好像是变量离开了作用域范围，废弃了NSAutoreleasePool这个对象，这时obj的release方法会被自动调用

![Untitled](https://qiniu.dcts.top/typora/202303140317974.png)

NSRunLoop内部处理了NSAutoreleasePool的生成、持有和废弃

![Untitled](https://qiniu.dcts.top/typora/202303140317994.png)

Cocoa框架中很多类方法会返回autorelease对象。下面两行代码等价。

```objectivec
id array = [NSMutableArray arrayWithCapacity:1];
id array2 = [[[NSMutableArray alloc]initWithCapacity:1]autorelease];
```

### autorelease的实现

当一个对象obj调用autorelease： [obj autorelease]; 可以看到首先会调用NSAutoreleasePool的类方法addObject，去找到当前正在使用的pool对象，然后add这个obj，GNUstep用的是链表。

总之，[obj autorelease]会把obj放到一个链表里。

```objectivec
/**
 * Adds the receiver to the current autorelease pool, so that it will be
 * sent a -release message when the pool is destroyed.<br />
 * Returns the receiver.<br />
 * In GNUstep, the [NSObject+enableDoubleReleaseCheck:] method may be used
 * to turn on checking for retain/release errors in this method.
 */
- (id) autorelease
{
	// 下面这行代码等价于 [NSAutoreleasePool addObject:self];
	// GNUstep为了提高频繁调用autorelease方法的效率，对一些结果值进行了缓存
	// 这里的调用直接使用的是缓存的结果，总之提高了2倍的运行速度
  (*autorelease_imp)(autorelease_class, autorelease_sel, self);

}
```

关于[NSAutoreleasePool addObject:self]

```objectivec
// 类方法
+ (void) addObject: (id)anObj
{
  NSThread		*t = GSCurrentThread();
  NSAutoreleasePool	*pool;

	// 取得正在使用的NSAutoreleasePool
	// NSAutoreleasePool对象可以嵌套生成，这里会理所当然地获取最里面一层的对象
  pool = t->_autorelease_vars.current_pool;
  if (pool == nil && t->_active == NO)
    {
      // Don't leak while exiting thread.
      pool = t->_autorelease_vars.current_pool = [self new];
    }
  if (pool != nil)
    {
			// 调用正在使用的NSAutoreleasePool对象的addObject方法
      (*pool->_addImp)(pool, @selector(addObject:), anObj);
    }
  else
    {
      NSAutoreleasePool	*arp = [NSAutoreleasePool new];

      if (anObj != nil)
	{
	  NSLog(@"autorelease called without pool for object (%p) "
	    @"of class %@ in thread %@", anObj,
	    NSStringFromClass([anObj class]), [NSThread currentThread]);
	}
      else
	{
	  NSLog(@"autorelease called without pool for nil object.");
	}
      [arp release];
    }
}
```

关于drain

```objectivec
- (void) drain
{
  [self release];
}

- (oneway void) release
{
  [self dealloc];
}

- (void) dealloc
{
  struct autorelease_thread_vars *tv = ARP_THREAD_VARS;

	// 这个函数会释放每个child
  [self emptyPool];

  /* Remove self from the linked list of pools in use.
   * We already know that we have deallocated any child (in -emptyPool),
   * but we may have a parent which needs to know we have gone.
   * The only other place where the parent/child linked list is modified
   * should be in -init
   */
	// 但是我们还要通知父节点
  if (tv->current_pool == self)
    {
      tv->current_pool = _parent;
    }
  if (_parent != nil)
    {
      _parent->_child = nil;
      _parent = nil;
    }

  /* Don't deallocate ourself, just save us for later use. */
  push_pool_to_cache (tv, self);
  GSNOSUPERDEALLOC;
}
```

### 苹果的实现

AutoReleasePoolPage类中有几个方法

- push
  - 生成或持有NSAutoreleasePool类对象
- pop
  - 废弃NSAutoreleasePool类对象
  - 调用 releaseAll();
- autorelease
  - 获取正在使用的pool实例
  - 调用这个实例的add方法
- add
  - 追加对象到内部数组中
- releaseAll
  - 调用内部数组中元素的release方法

showPool方法展示了当前pool中存持有的对象

![Untitled](https://qiniu.dcts.top/typora/202303140317013.png)

最后，NSAutoreleasePool pool对象调用autorelease时会出错

![Untitled](https://qiniu.dcts.top/typora/202303140317029.png)

### 小总结

NSAutoreleasePool可以当做是一个数组，[obj autorelease]的时候就把obj放进去，当pool废弃时，数组中的所有元素都会调用release方法

## ARC

ARC只是自动地帮助处理引用计数相关的问题。其思考方式和引用计数时的思考方式一样，从自己生成的对象和非自己生成的对象、自己能否持有两方面考虑。

### 所有权修饰符

一共有四种所有权修饰符

- __strong
- __weak
- __unsafe_unretained
- __autoreleasing

---

- __strong

id类型和对象类型默认的所有权修饰符。

我们说引用计数内存管理的思考方式有四条，其中两条是

- 自己生成的对象，自己所持有
- 非自己生成的对象，自己也能持有

在没有ARC的时候我们需要手动的retain来达成，但现在只需要通过对带__strong修饰符的变量赋值便可达成。

- 不在需要自己持有的对象时释放

在没有ARC的时候需要手动release来达成，现在对于__strong修饰的变量，如果变量作用域结束或成员变量所属对象废弃或者对变量赋值，都可以做到

```objectivec
// 下面两行代码相同
id obj = [[NSObject alloc]init];
id __strong obj = [[NSObject alloc]init];
```

持有强引用的变量在超出其作用域时被废弃，随着强引用的失效，引用的对象会随之释放。

首先，__strong修饰的变量在超出作用域时被废弃，即在ARC无效的时候，等价的工作是

```objectivec
{
	id __strong obj = [[NSObject alloc]init];
	[obj release];
}
```

也就是说，当变量离开作用域范围时，会自动调用release

那变量赋值呢，下面是没有ARC的情况。当obj赋值给obj1时，他俩所指向地址的引用通过retain，医用计数加一，在离开作用域的时候分别release。这些工作ARC有效时会自动处理。

![Untitled](https://qiniu.dcts.top/typora/202303140317043.png)

所以总结一下，__strong修饰的变量可以自动处理对象的持有和释放，主要体现在三个方面

- 离开变量作用域自动释放
- 成员变量引用了一个对象，而当这个成员变量所属的对象被废弃时，它引用的对象也会被释放
- 变量的赋值

---

- __weak

__strong会带来循环引用的问题。

比如有testa变量引用对象A，testb变量引用对象B。当testa和testb超出了其作用域时，强引用失效，自动释放对象A和对象B，这个时候obj_b还引用着对象A，obj_a还引用着对象B，于是发生了内存泄露，即应当废弃的对象在超出其生存周期后继续存在。

![Untitled](https://qiniu.dcts.top/typora/202303140317055.png)

自引用也会发生循环引用

![Untitled](https://qiniu.dcts.top/typora/202303140317067.png)

被__weak修饰的变量不会持有实例对象。这意味着如果将自己生成并持有的对象赋给__weak修饰的变量obj，这个对象会被立刻释放

![Untitled](https://qiniu.dcts.top/typora/202303140317085.png)

<aside>
🤔 所以__weak修饰的变量obj一定要引用一个已经被强引用了的对象。这样我能保证那块地址上的对象不会被立即释放，obj可以读取到。此外，如果这个强引用被释放了，这个弱引用也会被释放。


</aside>

```objectivec
{
	id __strong obj0 = [[NSObject alloc] init];
	id __weak obj1 = obj0;
}
```

上述代码obj1持有了obj0对象的弱引用，如果obj0被废弃，则此弱引用将自动失效且处于nil被赋值的状态。但在早期iOS版本中，需要使用`__unsafe_unretained` 修饰符代替 `__weak`，他俩的区别在于`__unsafe_unretained` 

---

- __autoreleasing 修饰符

ARC有效时，不能使用autorelease方法，也不能使用NSAutoreleasePool类。当尝试使用时，编译器会给出一堆报错

![Untitled](https://qiniu.dcts.top/typora/202303140317101.png)

在ARC有效时，需要做一些改变

- @autoreleasepool块来代替NSAutoreleasePool类对象生成、持有以及废弃这一范围
- 通过__autoreleasing修饰变量来代替调用autorelease方法，将对象注册到autoreleasepool

![Untitled](https://qiniu.dcts.top/typora/202303140317119.png)

但很少有显示使用__autoreleasing修饰符的，这是因为编译器帮忙注册了。

<aside>
🤔 以下的内容很重要也不太好理解  这边单独开了一篇


[**关于AutoReleasePool和ARC的一些研究**](https://www.notion.so/AutoReleasePool-ARC-a009d6099a634565a92b8b569d6d844f)

</aside>

首先，之前提到过alloc/new/copy/mutableCopy以外的方法可以获得「非自己生成并持有」的对象，这到底是什么意思呢？

```objectivec
+ (id) array
{
	id obj = [[NSMutabaleArray alloc] init];
	[obj autorelease];
	return obj;
}

// ARC失效的时候要手动持有
id array = [NSMutableArray array];
[array retain];
```

由于return，使得对象变量超出其作用域，所以obj持有的对象会自动释放。所以在没有ARC的时候要手动retain去持有这个对象。

<aside>
🤔 两个问题，1. 为什么一些对象要自动注册到autoreleaspool 2. 为什么有一些对象不需要自动注册


</aside>

池子的作用是延迟释放，上述代码中obj作为函数的返回值，编译器会检查方法名是否以alloc/new/copy/mutableCopy以外的方法来取得对象，如果不是则将这个对象自动将其注册到autoreleasepool中。

这里提到访问__weak修饰的变量的时候必定会访问注册到autoreleasepool的对象

![Untitled](https://qiniu.dcts.top/typora/202303140317134.png)

[使用__weak变量，指向的对象就会被加到autoreleasepool中？](https://choujiji.github.io/2019/08/20/%E4%BD%BF%E7%94%A8__weak%E5%8F%98%E9%87%8F%EF%BC%8C%E6%8C%87%E5%90%91%E7%9A%84%E5%AF%B9%E8%B1%A1%E5%B0%B1%E4%BC%9A%E8%A2%AB%E5%8A%A0%E5%88%B0autoreleasepool%E4%B8%AD%EF%BC%9F/)

> 每使用一次weak对象，运行时系统都会将其指向的原始对象先retain，之后保存到自动释放池中（ *AutoReleasePoolPage的add()* 函数）。因此如果大量调用weak对象，则会重复进行此工作。不仅耗费无意义的性能（重复存储同一对象），还会使内存在短时间内大量增长

最后，对于id指针的指针会有些不同。

id的指针(id*)或对象的指针(NSObject **)在没有显示指定时会被附上__autoreleasing修饰符

将对象赋值给附有__autoreleasing修饰符的变量，对象会被注册到autoreleasepool

`（NSError ** ）error` 等同于 `(NSError * __autoreleasing * )error`

使用__autoreleasing 修饰符的变量作为对象取得参数，与除alloc、new、copy、mutableCopy外其他方法返回值取得对象完全一样，都会注册到autoreleasepool，并取得非自己生成并持有的对象。

### 小总结

![Untitled](https://qiniu.dcts.top/typora/202303140317149.png)

这一小结信息量挺大的，主要通过四个访问修饰符，开始介绍ARC的作用。对于__strong修饰的变量，ARC能自动处理变量作用域结束后的对象的release、变量的赋值等，__weak是弱引用，主要提供两个特性：对象被废弃时赋值为nil、引用的对象在MRC下会被注册到autoreleasepool中。__autoreleaseing在ARC有效时不太会显示调用，而是换了实现的形式。如果对象是四个方法以外的方式创建的，ARC会把这个对象加入到池子里。

后续的章节还会更加详细地介绍ARC的实现细节，如果这里看着很累也不要紧！

### 规则

让ARC正常运作，需要遵守一定规则。

- 不能使用reatain、release、retainCount、autorelease

在ARC下使用这些方法，编译不会通过

- 不能使用NSAllocateObject、NSDeallocateObject
- 遵守内存管理的方法命名规则

以init开始的方法和alloc、new、copy、mutableCopy规则一样，甚至更加严格。该方法必须是实例方法，必须要返回对象。该返回对象不会注册到autoreleasepool上

- 不要显示调用dealloc
- 使用@autoreleasepool块代替NSAutoreleasePool
- 不能使用区域NSZone
- 对象型变量不能作为C语言结构体的成员
- 显示转换id和Void*

<aside>
🤔 这一块儿不做扩展了，用到的时候再来看吧


</aside>

在ARC情况下要用__bridge，但其安全性类似`__unsafe_unretained` 

<aside>
🤔 一直搞不懂Objective-C、Core Foundation他们的关系，需要单独开一章


</aside>

### 属性

这一节解释了为什么属性的修饰符是这些，解释了它们和ARC之间的关系

![Untitled](https://qiniu.dcts.top/typora/202303140317175.png)

### 数组

<aside>
🤔 总感觉这一块很少用到


</aside>

这一节指的是

- 用__strong,__weak,__auatoreleasing修饰符变量的数组也保证其初始化为nil
- 超出作用域后，强引用消失，赋值的对象也随之释放
- 这一节说明了如何使用__strong修饰动态数组

```objectivec
id __strong *array = nil;
// 或者
NSObject * __strong *array = nil;
// 使用分配区域初始化为0的calloc函数分配内存
array = (id __strong *)calloc(entries,sizeof(id));

array[0] = [[NSObject alloc]init];

```

注意的是，动态数组操作附有__strong修饰的变量，需要手动释放所有元素

```objectivec
// 必须将nil赋值给所有数组元素
for(NSUinteger i = 9; i < entries; ++i){

	array[i] = nil;

}

free(array);
```

## ARC原理

之前学了ARC的基本原理和用法，总感觉一知半解。下面会深入源代码去理解ARC的运行机制，希望可以清晰一些。

首先ARC的实现需要两个东西：

- clang LLVM 编译器
- objc4 Objective-C 运行时库

### __strong 修饰符

使用alloc、new、copy、mutableCopy的方法创建对象时，ARC会自动插入release

```objectivec
{
	id __strong obj = [[NSObject alloc]init];
}

// 编译器的模拟代码

id obj = objc_msgSend(NSObject, @selector(alloc));
objc_msgSend(obj,@selector(init));
objc_release(obj);
```

那用这四个以外的方式创建对象呢？

```objectivec
{
	id __strong obj = [NSMutableArray array];
}

id obj = objc_msgSend(NSMutableArray,@selector(array))
objc_retainAutoreleaseReturnValue(obj)
objc_release(obj)
```

首先，在作用域结束时还是会插入release释放对象，那`obj.objc_retainAutoreleaseReturnValue` 是干嘛的呢？

- 它是成对的，与之对应的是`objc_autoreleaseReturnValue` ,体现在哪里呢？

看一下array这个类方法，在ARC下会有什么变化

<aside>
🤔 array的特点是因为返回的这个对象，超过了作用域会被释放，这个对象会被注册到pool里面


</aside>

```objectivec
+ (id) array 
{
	return [[NSMutableArray alloc] init];
}

+ (id) array
{
	id obj = objc_msgSend(NSMutableArray, @selector(alloc));
	objc_msgSend(obj,@selector(init));
	return objc_autoreleaseReturnValue(obj);
}
```

`objc_autoreleaseReturnValue` 返回注册到autoreleasepool中的对象，但这个方法和objc_autorelease函数还不一样，不仅限于只注册到了池子中。

具体来说，`objc_autoreleaseReturnValue` 这个函数会看下调用方，这里指的是NSMutableArray这个类，如果之后有`objc_retainAutoreleaseReturnValue` 这个方法，那obj这个对象是不会被注册到pool中的。

而就算obj对象没有被注册到autoreleasepool中，`objc_retainAutoreleaseReturnValue` ，这个方法依然可以获得对象。

总之，上述的两个函数对这一过程做了优化，现在对象不需要注册到autoreleasepool中了。

![Untitled](https://qiniu.dcts.top/typora/202303140317190.png)

### __weak 修饰符

weak修饰符的两个作用

- 修饰的变量被废弃，将nil赋值给这个变量
- 修饰的变量使用的是注册到autoreleasepool中的对象

```objectivec
{
	id __weak obj1 = obj;
}
// 编译器处理后
id obj1;
objc_initWeak(&obj1,obj);
objc_destroyWeak(&obj1);
```

首先，objc_initWeak用来赋值，它分为两步

- 将附有__weak修饰符的变量初始化为0
- 赋值的对象作为参数调用objc_storeWeak

objc_storeWeak第二参数的赋值对象的地址作为键值，作为键值，将第一参数的附有__weak修饰符的变量的地址注册到weak表中

<aside>
🤔 解答下评论的问题：weak表中将废弃对象的地址作为键值进行检索，value是weak修饰符变量的地址。这里明确提到了，对于一个键值，可注册多个变量的地址！！！


</aside>

```objectivec
obj1 = 0;
objc_storeWeak(&obj1,obj);
```

其次，还是一样的，作用域结束后会释放资源，用的是`objc_destroyWeak`

本质还是objc_storeWeak，第二个参数传0，本来是传键值。传0会把变量的地址从weak表中删除。

```objectivec
objc_storeWeak(&obj1,0);
```

具体动作如下

- 引用计数器如果为0，会执行dealloc
- ……. 跳过一些步骤
- 从weak表中获取废弃对象的地址为键值的记录
- 将包含在记录中的所有附有__weak修饰符变量的地址，赋值为nil
- 从weak表中删除该记录
- 从引用计数表中删除废弃对象的地址为键值的记录

以下的代码会发生什么呢？

```objectivec
{
	id __weak obj = [[NSObject alloc] init];
}
```

```objectivec
id obj;
id temp = objc_msgSend(NSObject,@selector(alloc));
objc_msgSend(tmp,@selector(init));
objc_initWeak(&obj,temp);
// 编译器判断temp对象没有持有者
// 通过objc_release 函数被释放和废弃
objc_release(temp);
// obj 变量会被赋值为nil
objc_destroyWeak(&object);
```

垂悬指针是怎么造成的？

```objectivec
id __unsafe_unretained obj = [[NSObject alloc] init];

// 编译器处理后的代码

id obj = objc_msgSend(NSObject, @selector(alloc));
objc_msgSend(obj,@selector(init));
// 立刻释放了
objc_release(obj);
// 但是没有后续操作了 obj指针变成了悬垂指针
```

下面介绍weak的第二个功能，weak变量指向的对象都是注册到autoreleasepool中的对象

```objectivec
id __weak obj1 = obj;

// 等价于

id obj1;
objc_initWeak($obj1,obj);
// 取出__weak修饰符变量所引用的对象并retain
id tmp = objc_loadWeakRetained(&obj1);
// 将对象注册到autoreleasepool中
objc_autorelease(tmp);
objc_destroyWeak(&obj1);
```

下面这段话解释了为什么之前看到有些代码里面，先用__weak修饰了一个变量之后，又用__strong 修饰回去。这是因为大量使用附有__weak修饰符的变量，注册到`autoreleasepool`中的对象也会大量增加

![Untitled](https://qiniu.dcts.top/typora/202303140317206.png)

最好的做法是

```objectivec
{
	id __weak o = obj;
	id temp = o;
	NSLog(@"%@",temp);
}
```

### __autoreleasing

下面的代码的作用是将NSObject对象注册到autoreleasepool中

[苹果的实现](https://www.notion.so/ef8e36c11e3b4069b9b83f478783cc69) 

```objectivec
@autoreleasepool {
	id __autoreleasing obj = [[NSObject alloc] init];
}

// 等价于

id pool = objc_autoreleasePoolPush();
id obj = objc_msgSend(NSObject,@selector(alloc));
objc_msgSend(obj,@selector(init));
objc_autorelease(obj);
objc_autoreleasePoolPop(pool);

// -----

@autoreleasepool {
	id __autoreleasing obj = [NSMutableArray array];
}

// 等价于
id pool = objc_autoreleasePoolPush();
id obj = objc_msgSend(NSObject,@selector(array));
// 持有对象的方法发生了改变
objc_retainAutoreleaseReturnValue(obj);
objc_autorelease(obj);
objc_autoreleasePoolPop(pool);

```

### 引用计数器的数值

可以使用_objc_rootRetainCount这个函数来获得对象的引用计数
