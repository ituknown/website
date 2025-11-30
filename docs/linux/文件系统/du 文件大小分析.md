## 前言

Linux `du` 命令与 `df` 命令一样也是用于查看空间使用情况，但不同的是 `du` 命令用于主要用于统计文件和目录容量，而 `df` 则用于查看磁盘使用情况，所以还是有很大区别的。

`du` 主要常用语法如下：

```bash
du [-ahsS] [dir | file...]
```

其中 `[-ahsS]` 是 `du` 常用的可选参数：

```bash
-a 统计所有文件和目录的使用容量
-h 以可读的方式显示容量, 如 GB、MB
-s 只统计总量
-S 只统计目录的使用容量, 不统计目录下的子文件的使用容量
```

## 示例

列出当前目录下所有目录和子目录的容量占用情况：

```bash
$ du
8       ./.docker/scan
8       ./.docker/desktop/log/host
12      ./.docker/desktop/log
16      ./.docker/desktop
4       ./.docker/run
36      ./.docker
8       ./dir
72      .
```

列出当前目录下所有文件（目录和子文件）的容量占用情况：

```bash
$ du -a
0       ./.azure
4       ./.bash_history
0       ./.aws
4       ./.docker/scan/config.json
8       ./.docker/scan
4       ./.docker/desktop/log/host/docker-desktop-user-distro.log
8       ./.docker/desktop/log/host
12      ./.docker/desktop/log
16      ./.docker/desktop
0       ./.docker/contexts
0       ./.docker/features.json
4       ./.docker/config.json
4       ./.docker/run
36      ./.docker
4       ./.profile
4       ./.bash_logout
4       ./.viminfo
4       ./.bashrc
4       ./hello.txt
4       ./dir/hello.txt
8       ./dir
72      .
```

以可读的方式输出使用容量：

```bash
$ du -h
8.0K    ./.docker/scan
8.0K    ./.docker/desktop/log/host
12K     ./.docker/desktop/log
16K     ./.docker/desktop
4.0K    ./.docker/run
36K     ./.docker
8.0K    ./dir
72K     .
```

只输出目录的使用容量（输出的目录的容量，不包括目录下的文件）：

```bash
$ du -S
8       ./.docker/scan
8       ./.docker/desktop/log/host
4       ./.docker/desktop/log
4       ./.docker/desktop
4       ./.docker/run
8       ./.docker
8       ./dir
28      .
```

统计当前目录下所有文件使用总量：

```bash
$ du -s
72      .
```
