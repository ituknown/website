## 前言

$tar$ 是 Linux 下常用的打包命令，注意这是一个打包工具而不是压缩工具。打包和压缩是有很大的区别的，打包命令常用语将文件夹下或多个文件夹下的文件进行打包成一个文件以便于传输或者存储。

打包后的文件大小不变，也就是说打包后的文件的大小等于原来的文件大小总和。而压缩却不是，压缩主要是通过建立字典表按照一定的算法将二进制数据进行字典提取，来达到将文件大小变小的目的。所以说打包和压缩是有本质的区别的。

而 tar 就是这么一个打包工具，同时还有一个对应的 gzip 压缩工具。这两个工具大家肯定不陌生，因为我们经常会在系统文件中看到以 `.tar` 结尾的文件和以 `.tar.gz` 结尾的文件。

其中 `.tar` 结尾的文件就是使用 tar 打包的结果。而 `.tar.gz` 则是 gzip 对 tar 打包后的数据进行一次压缩而得到的文件，压缩后的文件名默认是在原来的基础上增加一个 `.gz` 后缀，大家要明白这点！

<details open>
<summary>**小科普**</summary>

在 Linux 中一切皆文件相信这点大家都明白，但是有一点是 Linux 上的文件格式与文件的后缀没有任何关系。

这个后缀仅仅是为了人为识别而添加的。比如我们经常会看后一个 `.txt` 结尾的文件，但是我们给这个文件一个执行权限，居然就成为了可执行文件，你说神奇不神奇？

所以如果你看到某些人工程师将打包后的文件命名时居然不是以 `.tar` 结尾不要有丝毫的奇怪，因为这个后缀并不影响它是 tar 压缩包数据格式！
</details>

## tar 打包命令

tar 工具的参数比较多，而且参数名称的实际意义差别有点大，下面只列出常用的几个参数，更多的参数可以使用 `man tar` 或者 `tar --help` 命令进行自行查阅：

```bash
-c : 创建归档文件
-x : 解压归档文件
-v : 在打包/解压时, 将正在处理的文件名显示出来
-f : 后面跟的是归档文件名, 注意在该参数后面是立即跟归档文件名。如果配合 c 参数使用就表示创建归档文件, 如果配合 x 参数使用就表示解压归档文件。
-C : 将归档文件解压到指定目录, 这个参数在实际中用的特别多。
-t : 查看归档文件中的文件列表(非解压)
-r : 向已存在的归档中添加文件
-A : 向 tar 归档文件中添加一个归档文件, 与 r 参数有一点区别
-z : 通过 gzip 算法进行创建压缩文件或解压文件(注意 gzip 文件后缀通常为 .tar.gz)
```

:::info[注意]

一定要注意，使用 tar 命令无论何时都不要忘记 `-f` 参数。

不管是创建归档或压缩文件、解压归档或压缩文件、查询归档文件中的文件信息，都离不开 `-f` 参数。

另一点是 `-f` 参数后面要立即跟归档或压缩文件名，所以通常在使用组合参数时都会将 `f` 参数放在最后，示例：

```bash
tar -cf archive.tar foo bar  # Create archive.tar from files foo and bar.
tar -tvf archive.tar         # List all files in archive.tar verbosely.
tar -xf archive.tar          # Extract all files from archive.tar.
```
:::

### 创建 tar 归档文件

创建 tar 归档文件使用 `-c` 参数，并且要使用 `-f` 指定归档文件名。另外一点，在使用时最好还是加上 `-v` 参数，便于查看归档文件信息。下面就来看下示例：

我当前目录下有两个文件，其中一个是文件夹，而且在文件夹中还有两个文件，结构如下：
​
```bash
$ tree
.
├── 050617-425.png
└── html
    ├── 050617-425.png
    └── index.html

1 directory, 3 files
```

现在我想将当前目录下的所有文件进行打包（包括 html 文件夹），该怎么做呢？命令如下：
​
```bash
$ tar -cvf example.tar ./*
```

其中 example.tar 就是我们打包后的文件名，注意一定要跟在 `-f` 参数后面。另外，使用 tar 打包后的文件后缀最好是 .tar，再之后的 `./*` 就是当前目录下的所有文件。

除此之外我们还可以将上面的命令修改为如下，就是直接跟要打包的所有文件：

```bash
$ tar -cvf example.tar 050617-425.png html/*
```

之后就得到一个 example.tar 文件：

```bash
$ tree
.
├── 050617-425.png
├── example.tar   <== 多了一个 example.tar 归档文件
└── html
    ├── 050617-425.png
    └── index.html

1 directory, 4 files
```

### 查看 tar 归档文件信息

上面我们打包得到了一个 example.tar 文件。我们可以使用 `-t` 参数查看归档文件中的内容对不对，是否为我们需要的归档。如下：

```bash
$ tar -tf example.tar
050617-425.png
html/050617-425.png
html/index.html
```

另外，想看更详细的信息还可以再加个 `-v` 参数。

### 向归档文件中添加文件

在最开始我们列出的命令中有两个向归档文件中继续添加文件的参数，分别是 `-r` 和 `-A`。

这两个参数的区别是：

- `-r` 是向归档文件中添加文件。
- `-A` 参数是向归档文件中添加归档文件。

听起来有点拗口，没关系，我们一个一个来说，先说下 `-r` 参数：
​
为了演示我们先将之前创建的归档文件删除掉，重新打包：

```bash
$ tree
.
├── 050617-425.png
└── html
    ├── 050617-425.png
    └── index.html

1 directory, 3 files
```
​
这次我们仅仅打包 html 目录下的两个文件，命令如下：

```bash
$ tar -cvf example.tar html/*
html/050617-425.png
html/index.html
```
​
现在看下 example.tar 归档文件中的内容：

```bash
$ tar -tf example.tar
html/050617-425.png
html/index.html
```

一切正常，现在我还想将当前目录下的一个 050617-425.png 文件也打包进去该怎么办？使用 `-r` 参数即可，如下：

```bash
$ tar -vf example.tar -r 050617-425.png
```
​
再看下归档文件内容：

```bash
$ tar -tf example.tar
html/050617-425.png
html/index.html
050617-425.png
```
​
这确实是我们想要的，那 `-A` 参数呢？

### 向归档文件中添加归档文件

`-A` 参数则是向一个归档文件中添加归档文件。为了演示，同样的先将之前的文件全部删掉，一切恢复原状：
​
```bash
$ tree
.
├── 050617-425.png
└── html
    ├── 050617-425.png
    └── index.html

1 directory, 3 files
```
​
先创建一个 base.tar 归档文件，仅仅打包当前目录下的 050617-425.png 文件：

```bash
$ tar -cvf base.tar 050617-425.png
```
​
再创建一个 html.tar 包文件，这次仅打包 html 目录下的两个文件：

```bash
$ tar -cvf html.tar html/*
```
​
然后使用 `-A` 参数将 html.tar 添加到 base.tar：

```bash
$ tar -f base.tar -A html.tar
```
​
现在看下 base.tar 包文件中的内容：
​
```bash
$ tar -tf base.tar
050617-425.png
html/050617-425.png
html/index.html
```
​
你会发现新添加的 html.tar 被自动解压了，这就是 `-A` 参数和 `-r` 参数的区别~

## tar 解压归档文件

tar 包文件解压比较简单，直接使用 `-x` 参数即可，如下：

```bash
$ tar -xvf example.tar
```
​
另外如果想要将包文件解压到指定目录再加一个 `-C` 参数即可，后面跟解压到那个目录的路径，如下：

```bash
$ tar -xvf example.tar -C /somepath/
```

## gzip 压缩

gzip 是一个压缩命令，看起来与 tar 很像。可用来压缩普通文件以及打包文件，在实际中我们最常使用的就是用来压缩 tar 打包文件。
​
压缩普通文件：
​
```bash
$ gzip example.txt
```
​​
压缩包文件：
​
```bash
# 先使用 tar 打包
$ tar -cvf example.tar file...

# 再使用 gzip 压缩
$ gzip example.tar
```
​
gzip 压缩有个特点，来看下示例：
​
```bash
$ ls
example.txt

# 压缩
$ gzip example.txt

$ ls
example.txt.gz
```
​
也就是说使用 gzip 压缩会将源文件进行删除，生成一个新文件，而得到的压缩文件名就是在源文件名基础上加个 `.gz` 后缀。

有没有发现什么问题？那就是 gzip 没法将多个文件压缩成一个文件，如：
​
```bash
$ ls
example.txt README.md

# 压缩
$ gzip example.txt README.md

$ ls
example.txt.gz README.md.gz
```
​
正是因为这个原因，所以 gzip 命令经常配个 tar 打包命令一起使用。先使用 tar 命令将多个文件进行打包，然后再使用 gzip 命令压缩打包文件。所以如果你看都某个压缩文件的后缀是 .tar.gz 那就是 gzip 将 tar 包文件压缩的结果。

另外一点你肯定也注意到了，那就是 gzip 在压缩时会得的一个新的压缩文件而将原来的源文件进行删除。那如何保留源文件呢？如下：

### 保留源文件
​
想要保留源文件只需要在 gzip 命令压缩时加一个 `-k` 参数，`k` 参数是 keep 的意思，示例如下：

```bash
$ gzip -k example.tar

$ ls
example.tar example.tar.gz
```
​
### 查看压缩包文件内容
​
与 tar 一样，我们也可以查看压缩包文件中的内容，使用 `-l`（或 `--list`） 参数即可：

```bash
$ gzip -l example.tar.gz

$ gzip --list example.tar.gz
```
​
### 指定压缩文件后缀
​
gzip 默认使用的压缩后缀是 `.gz`。前面说过，一个文件的格式与文件后缀无关。所以我们可以修改文件后缀来进行隐藏源文件格式。

gzip 提供一个 `-S`（或 `--suffix`）参数用于指定压缩文件后缀，示例：
​
```bash
$ gzip -S .cz file

$ ls
file.cz
```

### 指定压缩级别
​
压缩时我们也可以指定压缩级别的，数值越大压缩效率越高，但耗时也最长。压缩级别为 1 ~ 9，级别为1（`--fast`）时压缩率最低，速度也是最快。级别为9（`--best`）时压缩率最高，但速度也是最慢，默认级别是 6：
​
```bash
$ gzip -1 file
$ gzip --fast file

$ gzip -9 file
$ gzip --best file
```
​
### 使用 tar 创建 gzip 压缩文件

你有没有发现上面说明都是以 tar 归档文件进行介绍了？步骤是：tar 创建归档包，然后再使用 gzip 压缩归档包。那有没有一步到位的命令呢？有的！

还记得开始的时候说 tar 有一个 `-z` 参数，可用通过 gzip 算法进行创建压缩文件或解压文件。也就是说 tar 在打包 `.tar` 归档时可以直接使用 gzip 进行压缩，注意此时的后缀名最好为 .`tar.gz`。
​
示例：
​
```bash
$ tar -czvf example.tar.gz 050617-425.png html/*
```
​
所以想要使用 tar 打包并压缩为 gzip 文件只需要在原打包命令的基础上加上一个参数 `z` 就完事了，注意创建的压缩文件名最好为 `.tar.gz`！

## gzip 解压
​
gzip 也提供了对应的解压参数：`-d`。但是要注意，如果 .gz 文件是由 tar 归档文件得到的，解压后会还原为 tar 归档文件。看下示例：
​
```bash
$ ls
example.tar

# 直接使用 gzip 进行解压（不使用 -k 参数），会得到一个 .gz 文件：
$ gzip example.tar

$ ls
example.tar.gz
```
​
现在使用 `-d` 参数进行解压，你会发现它又还原为 .tar 包文件：

```bash
$ gzip -d example.tar.gz

$ ls
example.tar
```
​
现在还需要再使用 `tar -xvf` 命令进行解压，但事实上 tar 也是可以直接解压 .tar.gz 压缩文件的！
​
### 使用 tar 解压 gzip
​
tar 有一个 `-z` 参数，不仅可以配合参数 `c` 创建 gz 压缩文件还可以配合 `x` 参数解压 gz 压缩文件：
​
```bash
$ tar -xzvf example.tar.gz
```
​
但其实啊，在解压时这个 `-z` 参数是可以省略的，它会自行去判断文件格式。所以我们也可以直接使用下面的命令：

```bash
$ tar -xvf example.tar.gz
```
​
有没有发现不管是 .tar 文件还是 .tar.gz 文件我们都可以直接使用 `tar -xvf` 直接解压？

### 解压到指定目录

既然 tar 都可以直接解压 gz 压缩文件了，那是不是也可以使用 `-C` 参数将压缩文件直接解压到指定目录呢？

当然可以了：

```bash
$ tar -xvf example.tar.gz -C /anypath/
```

--

完结，撒花~
