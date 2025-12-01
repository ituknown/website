## 前言

`$` 符号是 Linux 中变量的前导符，我们一般也称其为元字符（Shell 元字符）。

在 Linux Shell 中我们想要获取某个系统变量该怎么做？是不是只需要在具体的变量名前加个 `$` 符号即可？

比如我想要获取系统变量 PATH：

```bash
$ echo $PATH
```

实际上这是一种简写形式，使用前导符 `$` 获取变量的标准写法是：`${variable}`。即：

```bash
$ echo ${PATH}
```

所以接下来你只要看到 `$variable` 就需要立即联想到这是 `${variable}` 的简写形式，不然你会迷茫。当然本篇的重点不是教你怎么去获取环境变量，而是一起学习 Shell 元字符变量，那什么是元字符变量呢？

## Linux Shell 元字符变量

在编写 Shell 脚本时我们经常会写或看到别人在脚本中使用以 `$` 开头的语法变量，如 `$$`、`$0`、`$@` 等。看起来很奇怪，这其实是 Linux Shell 的元字符变量，也是 Linux Shell 的保留字符。但是，不管它是 Linux 保留字符也好、元字符也好，它前面使用了变量前导符 `$` 就表示它是一个变量！

另外，我们前面重点说了，想要获取一个变量就在具体的变量名前使用 `$` 符号即可获取，所以上面的 `$$` 就是变量 `${$}` 的简写形式。而 Linux Shell 中有几个需要我们记的保留变量，如下：

| 元字符变量 | 简写形式   | 释义 |
| :------- | :-------- | --- |
| `${0}`   | `$0` | Linux Shell 脚本本身的名字 |
| `${num}`（num > 0） | `$num`（num > 0） | Linux Shell 的参数，num 为 1 就表示第一个参数，以此类推 |
| `${#}`   | `$#` | 传递给 Linux Shell 参数的个数 |
| `${@}`   | `$@` | Linux Shell 接收的所有参数列表，是个字符串 |
| `${*}`   | `$*` | 将 `$@` 字符串参数列表以单字符串的形式传递给参数 |
| `${$}`   | `$$` | Linux Shell 脚本本身的进程号 |
| `${?}`   | `$?` | Linux Shell 上一条命令执行后的退出状态。0调试正常，其他表示存在错误 |


## 元字符变量 $0

元字符变量 `$0` 主要用户获取脚本的名字，通常在 Shell 脚本中使用。当然也可以直接在 Terminal 终端上使用：

### 在 Shell 脚本中使用元字符 $0

编写一个 Shell 脚本，名称为 test_metadata.sh。脚本内容如下：

```shell
#!/bin/bash

shell_filename=$0

echo $shell_filename
```

当我们运行时，会输出什么呢？

```bash
$ bash test_metadata.sh
test_metadata.sh
```

这个很有用，如果想要再 Shell 脚本中 “动态” 获取你的 Shell 脚本的名字就可以利用该元字符。

### 在 Terminal 中使用元字符 $0

如果在 Terminal 中使用元字符 `$0` 的话，会输出你所使用的 Shell 的名称。

先看下当前系统中有哪些 Shell：

```bash
$ cat /etc/shells

/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/bin/dash
/usr/bin/dash
```

查看当前正在使用的 Shell：

```bash
$ echo $SHELL
/bin/bash
```

现在我们直接在 Terminal 中输出元字符 `$0` 看得到什么：

```bash
$ echo $0
bash
```

你会看到，如果直接在终端中输出元字符 `$0` 得到的就是你系统所使用的 Shell 的名字。

## 元字符变量 $num

这个就是 Shell 的参数，在编写脚本时，我们经常需要在脚本内部获取由执行脚本时的命令终端传递过来的参数，那该怎么在脚本内部接收呢？ 使用元字符变量 `$num` 即可（但其实更推荐使用 [getops 命令](Shell%20中的%20getopts%20命令.md)）接收参数！

:::info[注意]
num 是一个大于 0 的数值！
:::

`$1` 就表示 Shell 收到的第一个参数，`$2` 表示 Shell 收到的第二个参数，以此类推（<u>多个参数之间使用空格做分隔</u>）。

看下示例：

```bash
#!/bin/bash

sum=$[$1 + $2 + $3]

echo "$1 + $2 + $3 = $sum"
```

输出示例：

```bash
$ bash test_metadata.sh 1 2 3
1 + 2 + 3 = 6
```

## 元字符变量 $#

元字符变量 `$#` 指的是传递给 Shell 的参数个数。

写一个 Shell 脚本，内容如下：

```bash
#!/bin/bash

arg_len=$#
echo "收到参数个数: $arg_len"

## 如果收到的参数个数为 0, 打印提示信息并直接退出.
if [ $arg_len -eq 0 ]; then
  echo "Usage: $0 + 参数"
  exit 1
fi

sum=$[$1 + $2 + $3]

echo "$1 + $2 + $3 = $sum"
```

测试示例：

```bash
$ bash test_metadata.sh 1 2 3
收到参数个数: 3
1 + 2 + 3 = 6

$ bash test_metadata.sh
收到参数个数: 0
Usage: test_metadata.sh + 参数
```

## 元字符变量 $@

元字符变量 `$@` 就是收到的所有参数列表，先看下：

```bash
#!/bin/bash

echo "参数: $@"
```

示例：

```bash
$ bash test_metadata.sh 1 2 3
参数: 1 2 3
```

也就是说，元字符 `$@` 会将 Shell 脚本后的所有参数 “拼接成一个字符串” 传递过来。

不过我们可以使用 for 循环一个内置变量进行获取，如下：

```bash
#!/bin/bash

echo "参数: $@"

index=0;

for arg in "$@"
do
  echo "arg: $index = $arg"
  let index+=1
done
```

示例：

```bash
$ bash test_metadata.sh 1 2 3
参数: 1 2 3
arg: 0 = 1
arg: 1 = 2
arg: 2 = 3
```

可以看到，我们可以使用 for 循环进行获取每个参数。

现在修改下 Shell 脚本，将每个 `$@` 都取消使用 `"` 符号包裹，如下：

```bash
#!/bin/bash

echo "参数: "$@

index=0;

for arg in $@
do
  echo "arg: $index = $arg"
  let index+=1
done
```

现在会输出什么？测试看下：

```bash
$ bash test_metadata.sh 1 2 3
参数: 1 2 3
arg: 0 = 1
arg: 1 = 2
arg: 2 = 3
```

你会发现在 Shell 中使用 `$@` 和 `"$@"` 没什么区别，再来看下元字符变量 `#*`。

## 元字符变量 $*

元字符变量 `#*` 的意思是：将 `$@` 字符串参数列表以单字符串的形式传递给参数。

乍一看似乎与  `$@`  没啥区别，我们来演示看下。直接将前面的脚本中的 `$@` 替换为  `#*`。

先看下使用 `"` 包裹的示例：

```bash
#!/bin/bash

echo "参数: $*"

index=0;

for arg in "$*"
do
  echo "arg: $index = $arg"
  let index+=1
done
```

然后测试你会发现输出结果是：

```bash
$ bash test_metadata.sh 1 2 3
参数: 1 2 3
arg: 0 = 1 2 3
```

这么一看这与 `$@` 有点类似，都是将 Shell 收到的参数 “拼接成字符串” 后直接传递过来。不过啊，我们的 `$*` 使用了双引号 `"` 包裹了，来看下如果不包裹会怎样：

```bash
#!/bin/bash

echo "参数: "$*

index=0;

for arg in $*
do
  echo "arg: $index = $arg"
  let index+=1
done
```

输出示例：

```bash
$ bash test_metadata.sh 1 2 3
参数: 1 2 3
arg: 0 = 1
arg: 1 = 2
arg: 2 = 3
```

现在你会发现这个输出与 `$@` 如同一则啊。这就是 `$*` 和 `$@` 的区别，慢慢体会吧。

## 元字符变量 $$

元字符 `$$` 就是执行命令本身的进程号，如果在 Shell 脚本中使用，就是执行 Shell 脚本本身的进程号。

### 在 Shell 脚本中使用元字符 $$

看下下面的示例脚本，在执行脚本中时输出该脚本的进程号：

```bash
#!/bin/bash

echo "PID IS $$"
```

输出示例：

```bash
$ bash test_metadata.sh
PID IS 48147
```

说实话，这个在 shell 脚本中还是挺有用的，尤其是杀进程且需要排除 Shell 脚本本身的进程的时候。

### 在 Terminal 中使用元字符 $$

元字符 `$$` 还可以直接在 Terminal 中使用。它的含义是执行命令本身的进程号。

看下下面的示例，它会输出 `echo` 命令本身的进程号：

```bash
$ echo $$
38293
```

## 元字符变量 $?

嗯，这个元字符就是前一个命令或进程的执行状态。0 表示成功，其他数值表示执行异常。

我当前 /opt 下有个 book 文件夹：

```bash
$ ls /opt/book
```

我们使用 `ls` 命令查看该文件下的内容，但是我们要测试的不是这个。而是 `ls` 这个命令正常执行，现在我们可以使用 `$?` 查看 `ls` 命令执行状态：

```bash
$ echo $?
0
```

可以看到，输出的值是 0，表示 `ls /opt/book` 命令执行正常。

但是如果执行一个不存在的文件夹呢？看下：

```bash
$ ls /opt/test_book
ls: /opt/test_book: No such file or directory
```

再看下执行状态码：

```bash
$ echo $?
1
```

所以这个命令还是很实用的。

另外，如果想要知道每个退出状态码的含义可以查看下 [https://tldp.org/LDP/abs/html/exitcodes.html](https://tldp.org/LDP/abs/html/exitcodes.html)。