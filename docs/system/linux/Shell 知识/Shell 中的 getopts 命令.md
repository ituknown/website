## 前言

在编写 shell 脚本时我们经常需要接收外部传递的参数，比如有个 `develop-compose.sh` 脚本：

```bash
/bin/bash develop-compose.sh -m standalone -f ./conf/app.config
```

命令中的 `-m`、`-f` 就是脚本 develop-compose 中的可选参数。而实现该功能主要是借助于 [getopts](https://en.wikipedia.org/wiki/Getopts) 命令。

getopts 命令标准格式如下：

```bash
getopts [option[:]] [DESCPRITION] [VARIIABLE]
```

| **参数**       | **说明**                                                                                                                                                |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `option`      | 表示脚本可使用的参数选项，比如上面的示例中的 `-m` 和 `-f` 就是我们在 shell 中**定义**的可选参数。                                                                   |
| `:`           | 表示可选参数（`option`）后面可以跟随参数值。比如上面的 `-m` 后面的 standalone 就是具体的参数值，如果可选参数 option 后面没有 `:` 标识就表示该参数后面不可跟参数值。          |
| `DESCPRITION` | 表示参数 `option:` 的具体值。注意，可选参数后面一定要跟随 `:` 符号。                                                                                             |
| `VARIIABLE`   | 表示将某个选项保存到设置的变量 `VARIIABLE` 中。                                                                                                               |


看下下面的 develop-compose.sh 示例：

```bash
#!/bin/bash

echo "参数列表"
echo $*
echo ""

while getopts "m:f:or" opt; do
    # omit ...
done
```

这个 shell 脚本中我们定义了四个参数，分别是 `m`、`f`、`o` 和 `r`。注意看，在参数 `o` 和 `r` 后面没有跟 `:` 符号，就表示这两个参数不可以指定具体值，仅仅用于设置标识符使用。

在终端中执行如下命令：

```bash
/bin/bash develop-compose.sh -m standalone -f ./conf/app.config -o -r
```

我们就可以在 while 循环中循环获取参数值：

-m 值为 standalone

-f 值为 ./conf/app.config

-o 和 -r 仅仅用于设置标识符

## getopts 说明

`getopts` 是 Linux 中的内置函数，主要用于循环中。每次 while 循环执行时，`getopts` 函数都会**检查下一个命令参数**。

如果这个参数出现在 `options` 中(上面 `while` 循环中定义的 `m:f:or`），则表示是合法选项，否则不是合法选项。

如果合法，会将选项保存在 `VARIABLE` 这个变量中。 除此之外，`getopts` 还包含两个内置变量：`OPTARG` 和 `OPTIND`。

| **变量**  | **说明**                                         |
|:---------|:-------------------------------------------------|
| `OPTARG` | 就是将参数后面的值（即 `DESCPRITION`）保存在此变量当中。|
| `OPTIND` | 这个表示命令行的下一个参数的索引。                     |


还是以上面的示例来说明，`OPTARG` 这个内置变量循环获取的值就是 standalone 和 ./conf/app.config。

而 `OPTIND` 总是存储原始 `$*` 中下一个要处理的参数（注意：是参数不是参数值，就是上面的 m、f、o、r）位置。

`OPTIND` 的初值为1，遇到 `option`，`optind+=1`；遇到 `option:` `optarg=argv[optind+1]`，`optind+=2`。

我们来将上面的 `develop-compose.sh` 做下修改：

```bash
#!/bin/bash

echo "参数列表"
echo $*
echo ""

echo "参数    参数值    索引"
while getopts "m:f:or" opt; do
    case $opt in
    m)
        echo "-m    $OPTARG    $OPTIND"
        ;;
    f)
        echo "-f    $OPTARG    $OPTIND"
        ;;
    o)
        echo "-o    $OPTARG    $OPTIND"
        ;;
    r)
        echo "-r    $OPTARG    $OPTIND"
        ;;
    ?)
        echo "unknown arg -$OPTARG"
        exit
        ;;
    esac
done
```

当我们在命令行中执行如下命令时：

```bash
/bin/bash develop-compose.sh -m standalone -f ./conf/app.config -o -r
```

输出结果如下：

```
参数列表
-m standalone -f ./conf/app.config -o -r

参数     参数值                 索引
-m      standalone             3
-f      ./conf/app.config      5
-o                             6
-r                             7
```

`$*` 表示的是所有的参数列表，所以会输出 `-m standalone -f ./conf/app.config -o -r`。

我们这里要关心的是下面的参数、参数值和索引。参数 m 和 f 是可指定参数值，所以在后面输出可具体的参数值，而 o 和 r 参数则没有。关于索引的问题：

前面说 `OPTIND` 内置变量初始值为 1，遇到 `option` 时：`optind+=1`，遇到 `option:` 时 `optind+=2`。

所以，在第一次循环开始之前，`$OPTIND` 的值得 1。当循环开始时：

**1)** 读取参数 m，而 m 参数后面跟随 `:` 标识。所以 `optind+=2` 输出索引为 3。

**2)** 读取参数 f ，f 参数后面同样跟随 `:` 标识。所以 `optind+=2` 输出索引为 6。

**3)** 读取参数 o，o 参数后面没有 `:` 标识。所以 `optind+=1` 输出索引为 7。

**4)** 读取参数 r，r 参数后面没有 `:` 标识。所以 `optind+=1` 输出索引为 8。

现在相信就明白 getopts 在 shell 中该怎么玩了吧？

## 扩展

在实际中我们经常会看到下面的写法：

```bash
#!/bin/bash

echo "参数列表"
echo $*
echo ""

echo "参数    参数值    索引"
while getopts ":m:f:or" opt; do ## 注意在参数 m 前加了个 : 符号
    case $opt in
    m)
        echo "-m    $OPTARG    $OPTIND"
        ;;
    f)
        echo "-f    $OPTARG    $OPTIND"
        ;;
    o)
        echo "-o    $OPTARG    $OPTIND"
        ;;
    r)
        echo "-r    $OPTARG    $OPTIND"
        ;;
    ?)
        echo "unknown arg -$OPTARG"
        exit
        ;;
    esac
done
```

注意在首参数 m 前加了一个 `:` 符号。这个是什么意思呢？我们先来看下输出示例：

**1) 参数 `m:f:or`：**

```bash
参数列表
-m standalone -f ./conf/app.config -o -r -x

参数    参数值                索引
-m     standalone            3
-f     ./conf/app.config     5
-o                           6
-r                           7
develop-compose.sh: illegal option -- x
unknown arg -
```

**2) 参数 `:m:f:or`：**

```
参数列表
-m standalone -f ./conf/app.config -o -r -x

参数    参数值                索引
-m     standalone            3
-f     ./conf/app.config     5
-o                           6
-r                           7
unknown arg -x
```

从上面输出中，我们可以看到：

如果首参数之前不加 `:` 表示遇到未知参数时会输出错误信息（上面示例中输出：`develop-compose.sh: illegal option -- x`）。

如果在首参数之前加 `:` 表示忽略未知参数错误，而是走我们自定义的 `?)` 选项。

所以在实际使用中推荐使用 `[:option][:]` 参数形式。因为这种参数形式遇到错误时输出的信息更加友好。

--

参考链接：

[https://man7.org/linux/man-pages/man1/getopts.1p.html](https://man7.org/linux/man-pages/man1/getopts.1p.html)

[https://www.ibm.com/docs/en/aix/7.1?topic=g-getopts-command](https://www.ibm.com/docs/en/aix/7.1?topic=g-getopts-command)
