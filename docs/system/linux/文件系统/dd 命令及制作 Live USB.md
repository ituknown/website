## 前言

安装任何系统之前都需要先将系统的 iso 镜像文件刻录到光盘（Live CD）或制作一个 Live USB（一般它为U盘启动盘，但我还是引用它的英语原文，称它为 Live USB）。本文就介绍下在 Linux 系统下使用 `dd` 命令工具制作一个 Live USB。

`dd` 的全称是 convert and copy a file，说白点就是用于数据拷贝，常用于做制作数据文件和数据备份使用。而 Live CD 和 Live USB 本质上就是将操作系统的 ISO 镜像文件中的数据拷贝到 CD 或 USB。

先来看下 `dd` 命令的常用可选参数说明：

```bash
$ dd [bs=BYTES] [count=Number] [status=LEVEL] if=FILE of=FILE

bs    : 设置一次读取的数据大小, 单位是 byte. 默认为 512byte
count : 设置读取多少 bs 的意思. 比如 count=2, bs=1024 就是一共读取 2048byte 数据

status: 传输状态(打印信息), 有三个可选项
        - none 只打印 error 错误信息(默认)
        - noxfer 不显示统计结果
        - progress 这个就是进度条的意思

if    : input file 的缩写, 表示要读取的文件
of    : output file 的缩写, 表示将从 if 中读取的内容输出到指定位置
```

:::tip
在某些 Linux 发行版种 `dd` 命令需要 root 权限才能操作。
:::

## 制作 Live USB

这里以64位 ubuntu-20.04 iso镜像 ubuntu-20.04.1-live-server-amd64.iso 为例，该镜像存放在 /home/ituknown/ISO 目录下。

我的 U 盘设备名叫 `/dev/sdc`（可以使用 `parted` 命令查看），制作 Live USB 本质就是将 ISO 镜像中的数据拷贝到 USB 中，所以只需要简单的使用下面的命令即可：

```bash
$ sudo dd if=~ituknown/ISO/ubuntu-22.04-desktop-amd64.iso of=/dev/sdc
```

之后就是一个漫长的等待过程，拷贝完成就表示 Live USB 制作完成了！

当拷贝完成后通常会输出如下信息：

```plaintext
7138588+0 records in
7138588+0 records out
3654957056 bytes (3.7 GB, 3.4 GiB) copied, 1398.77 s, 2.6 MB/s
```

现在可以来看下 U 盘设备和分区信息：

```bash
$ sudo parted /dev/sdc print
Model: Kingston DataTraveler 3.0 (scsi)
Disk /dev/sdc: 30.9GB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size    File system  Name       Flags
 1      32.8kB  3650MB  3650MB               ISO9660    hidden, msftdata
 2      3650MB  3655MB  4350kB               Appended2  boot, esp
 3      3655MB  3655MB  307kB                Gap1       hidden, msftdata
```

可以看到自动创建了三个分区表，ISO 镜像文件中的数据全部被拷贝到了这里面，再使用 `blkid` 看下分区属性信息：

```bash
$ sudo blkid | grep sdc
/dev/sdc1: BLOCK_SIZE="2048" UUID="2022-04-19-10-23-19-00" LABEL="Ubuntu 22.04 LTS amd64" TYPE="iso9660" PARTLABEL="ISO9660" PARTUUID="a09db2b8-b5f6-43ae-afb2-91e0a90189a1"
/dev/sdc2: SEC_TYPE="msdos" LABEL_FATBOOT="ESP" LABEL="ESP" UUID="8D6C-A9F8" BLOCK_SIZE="512" TYPE="vfat" PARTLABEL="Appended2" PARTUUID="a09db2b8-b5f6-43ae-afb1-91e0a90189a1"
/dev/sdc3: PARTLABEL="Gap1" PARTUUID="a09db2b8-b5f6-43ae-afb0-91e0a90189a1"
```

## 显示进度条

`dd` 命令是不显示拷贝进度的，如果想要显示拷贝进度可以借助 `pv` 工具。`pv` 是Pipe Viewer（管道查看器）的缩写，它可以监测 Linux 管道中数据流通的进度。

所以先来安装下 `pv` 工具：

- $Debian/Ubuntu：$

```bash
$ sudo apt install -y pv
```

- $RHEL/CentOS：$

```bash
$ sudo yum install -y pv
```

安装完后，就可以使用下面的命令完成与之前同样的事情了：

```bash
$ sudo pv ~ituknown/ISO/ubuntu-22.04-desktop-amd64.iso | sudo dd of=/dev/sdc
```

在这条命令中，`dd` 从管道左边读取输入文件，所以这次就不需要 `if` 参数了~

拷贝过程中的示例：

```bash
$ sudo pv ~ituknown/ISO/ubuntu-22.04-desktop-amd64.iso | sudo dd of=/dev/sdc
1.06GiB 0:07:03 [ 191KiB/s] [============================>                                                                    ] 30% ETA 0:15:41
```

拷贝完成的示例：

```bash
$ sudo pv ~ituknown/ISO/ubuntu-22.04-desktop-amd64.iso | sudo dd of=/dev/sdc
3.40GiB 0:29:05 [2.00MiB/s] [===============================================================================================>] 100%
7138588+0 records in
7138588+0 records out
3654957056 bytes (3.7 GB, 3.4 GiB) copied, 1746 s, 2.1 MB/s
```