## 前言

$ln$ 命令主要用于给文件或目录创建有个符号链接，符号链接主要分为软链接和硬链接。

所谓的软链接就是快捷键，比如在 Windows 上，我们经常会为了能够快速启动应用程序或打开文件夹通常都会在桌面上创建一个快捷键。

而硬链接通俗一点的讲就是 “数据拷贝”，拷贝后的数据与源文件是独立的两份，两个操作之间互不影响。

当然了，`ln` 命令在实际中用的最多的还是软链接，所以这里就不对硬链接做任何说明了。

## 语法

`ln` 常用的参数语法如下：

```bash
$ ln [-sfiv] SOURCE_FILE LINK_NAME

-s 给源文件(SOURCE_FILE)创建一个软符号链接(LINK_NAME), 即软链接
-f 强制执行, 如果已存在链接则覆盖
-i 交互模式, 文件存在则提示用户是否覆盖
-v 显示详细的处理过程
```

:::tip
`SOURCE_FILE` 指的是系统上的具体文件或文件夹，`LINK_NAME` 则表示要创建的符号链接（在结尾处一定不要加 `/`）。
:::

## 使用示例

在我的 sdk 目录下有两个版本的 Go：

```bash
$ ls ~/sdk/
go1.15  go1.18.3
```

为了实现不修改环境变量的情况下实现版本切换，我只需要将指定版本的 Go 放到 `/usr` 目录下即可。但是直接移动似乎不太好，该怎么办呢？

那就使用软链接！比如我给 `go1.15` 建立一个软链接：`/usr/lib/golang/go`，命令如下：

```bash
$ sudo ln -s ~/sdk/go1.15 /usr/lib/golang/go
```

现在我就可以直接使用 go 环境了，看下 go 版本：

```bash
$ go version
go version go1.15 linux/amd64
```

之后我又想使用 `go1.18.3` 该咋办？修改下软链接源文件不就好了？现在将软链接链接到 `go1.18.3`：

```bash
$ sudo ln -s ~/sdk/go1.18.3 /usr/lib/golang/go
```

结果提示 `File exists` 错误：

```log
ln: failed to create symbolic link '/usr/lib/golang/go': File exists
```

这与预想的有点不一样，这个错误的意思就是当前软链接已经关联了某个源文件了无法再进行关联其他文件了。

解决方式有三种：

<details open>
<summary>**第一种：使用 `-i` 参数以交互模式执行**</summary>

在命令中加上 `-i` 参数，当判断软链接已经关联了某个文件时会提示你使用执行替换（replace），我们只需要输入 Y 确认替换即可：

```bash
$ sudo ln -si ~/sdk/go1.18.3 /usr/lib/golang/go
ln: replace '/usr/lib/golang/go'? y
```
</details>

<details open>
<summary>**第二种：使用 `-f` 参数强制替换**</summary>

`-f` 参数可以实现强制覆盖，比较暴力，不推荐：

```bash
$ sudo ln -sf ~/sdk/go1.18.3 /usr/lib/golang/go
```
</details>

<details open>
<summary>**第三种：先删除符号链接再重新创建**</summary>

在实际使用时比较推荐这种做法，先使用 `rm` 命令删除符号链接：

```bash
$ rm -f /usr/lib/golang/go
```

然后再重新创建符号链接进行关联：

```bash
$ ln -s ~/sdk/go1.18.3 /usr/lib/golang/go
```
</details>

--

之后再看下 go 版本：

```bash
$ go version
go version go1.18.3 linux/amd64
```

怎么样，现在是不是体会到了 `ln` 软链接的妙用了？

其实，如果想要看链接执行信息的话可以加上 `-v` 参数：

```bash
$ sudo ln -sv ~/sdk/go1.18.3 /usr/lib/golang/go
'/usr/lib/golang/go' -> '/home/ituknown/sdk/go1.18.3'
```

--

https://superuser.com/questions/1702125/operation-not-permitted-when-creating-hard-link-but-soft-link-works

https://unix.stackexchange.com/questions/377676/why-can-i-not-hardlink-to-a-file-i-dont-own-even-though-i-can-move-it/377719#377719

https://unix.stackexchange.com/questions/233275/hard-link-creation-permissions
