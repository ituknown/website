## 前言

本文呢，就来聊聊 `/etc/group` 用户组数据存储文件，系统中的所有组都被存储到噶文件中。相比较用户存储文件 `/etc/passwd` 而言，用户组数据就比较简单了，下面来说下。

用户组数据存储文件的权限是 644（`rw-r--r--`），所示系统中所有用户都可以查看文件中的内容，我们可以使用 `cat` 命令进行查看：

```bash
$ cat /etc/group
```

## 数据格式

用户组文件 `/etc/group` 中的数据与用户存储文件一样，每一行都代表一个组数据，数据之前使用 `":"` 符号分隔，示例：

```
kali:x:1000:saned
[--] - [--] [---]
 |   |  |     |
 |   |  |     +-------------> 4. 组成员
 |   |  +-------------------> 3. 组ID
 |   +----------------------> 2. 组密码
 +--------------------------> 1. 组名
```

## 组名

当我们新建一个用户时，默认会创建一个同名的组，而该组就会称为新创建用户的主要组。比如我们新建一个 `exampleuser` 用户：

```bash
$ sudo useradd exampleuser
```

来看下用户数据和组数据：

```bash
$ grep exampleuser /etc/passwd /etc/group
/etc/passwd:exampleuser:x:1001:1001::/home/exampleuser:/bin/sh
/etc/group:exampleuser:x:1001:
```

可以很清楚的看到，在 `/etc/group` 文件中多出了一个与用户同名的 `exampleuser` 组，并且组的 ID 是 1001。当然了，与用户名一样，组的名称在系统中也是唯一的。

那如果在创建某个用户时，同名的组已存在会怎样呢？来看下：

$1.$ 新建一个名为 `webuser` 的组

```bash
$ sudo groupadd webuser

# 查看组信息
$ grep webuser /etc/group
webuser:x:1003:
```

我们新建的组 `webuser` 对应的组 ID 是 1003，现在再新建一个同名的用户：

$2.$ 新建一个名为 `webuser` 的用户

```bash
$ sudo useradd webuser
useradd: group webuser exists - if you want to add this user to that group, use -g.
```

结果显而易见，用户没有创建成功。但是会提示你可以使用 `-g` 参数进行关联，现在使用 `-g` 参数重新创建用户，命令如下：

```bash
$ sudo useradd -g 1003 webuser
```

1003 是我们之前创建的组的ID，现在再来看下用户和组数据：

```bash
$ grep webuser /etc/passwd /etc/group
/etc/passwd:webuser:x:1001:1003::/home/webuser:/bin/sh
/etc/group:webuser:x:1003:
```

嗯，现在就知道怎么回事了吧？


## 组密码

什么？组还有密码？当然了，组也是有密码的，那这是怎么回事呢？

我们知道 `groupadd`、`groupmems` 等命令都是系统管理员才有权限执行。在公司日常运维中 root 用户的密码肯定不会所有人都知道，要是哪天管理员有事不在公司，但是我们又紧急需要给某个用户添加到具体组岂不是一定要联系到管理员才行？

因此，具有了这个组密码。我们可以通过给组设置密码，使某一部分人具有操作组的权限。这样即使管理员不在，但是能够管理组的人在公司不就好了？

当然了，不是说设置一个密码就好了，当然还有其他条件，这里只是说下组密码与管理组权限有关。

与系统用户一样，组的密码现在也不存储到 `/etc/group` 文件中了，而是迁移到 `/etc/gshadow` 文件中去了，在 `/etc/group` 文件中，组密码仅仅使用 x 进行标识：

```bash
examplegroup:x:1002:exampleusesr
             -
             |
             +-------------------------> 组密码
```

其他就不做过多介绍了，没啥意义。


## 组ID

与用户一样，用户组也有自己的ID，被称为 GID。而这个 GID 的分配策略与 UID 也是一样的。**0 是 root 用户组**，1000 以下用于系统超级管理员分配以及安装脚本自动分配，1000 以上才是供我们创建组时分配的 GID。

当然了，虽然 GID 也采用无符号整形，现代计算机理论上可分配的 GID 范围为 $0 < GID_{range} < 2^{32}$。

但是不同的 Linux 发行版对 GID 也有自己的限制，具体在 `/etc/login.defs` 文件中配置：

```bash
$ grep GID /etc/login.defs
GID_MIN			 1000
GID_MAX			 60000
#SYS_GID_MIN		  100
#SYS_GID_MAX		  999
```

也就是说，通常可由用户分配的 GID 为 1000 ~ 60000。


## 组成员

最后，来看下组中最重要的数据：组的成员。

```
kali:x:1000:saned
            [---]
              |
              +-------> 组成员
```

在组的最后一位存储的是系统用户的名称，不是用户的ID。如果一个组内有多个成员的话，多个成员之间使用 `","` 符号分隔，来看下示例：

**1. 创建一个组：**

```bash
$ sudo groupadd vipuser
```

**2. 创建两个用户，并将这两个用户添加到组 `vipuser` 中：**

```bash
$ sudo useradd -G vipuser xiaoming
$ sudo useradd -G vipuser wangerdan
```

**3. 看下组数据：**

```
vipuser:x:1004:xiaoming,wangerdan
               [----------------]
                       |
                       +-----------------> 组成员
```

那你可能有疑问了，在最开始[组名](#组名)中使用 `useradd` 命令创建用户 `exampleuser` 的时候，该用户么有被存储到同名的组中呢：


```bash
$ grep exampleuser /etc/passwd /etc/group
/etc/passwd:exampleuser:x:1001:1001::/home/exampleuser:/bin/sh
/etc/group:exampleuser:x:1001:
```

这就牵扯到主要组的问题了，这会在之后的[主要组与普通组的区别](./主要组与普通组的区别.md)文章中会特别介绍，这里你暂时只需要知道使用 `useradd` 命令创建的用户与组之间是通过 `/etc/passwd` 文件中的 GID 进行关系绑定的。

看下上面的示例，虽然组 `exampleuser` 的组成员数据是空的，但是在用户 `exampleuser` 数据中指定了该用户的具体组ID 1001，而这个ID正好是组 `exampleuser` 的 ID，你说巧不巧？

--

完结，撒花🎉🎉🎉~

https://www.cyberciti.biz/faq/understanding-etcgroup-file/

https://www.networkworld.com/article/3409781/mastering-user-groups-on-linux.html