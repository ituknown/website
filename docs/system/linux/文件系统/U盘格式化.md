## 查看 U 盘设备

将 U 盘插入主机后，我们要做的第一件事就是确定下这个 U 盘对应的设备名。

可以使用`parted -l` 或 `fdisk -l` 命令查看所有磁盘设备分区信息来确认我们的 U 盘设备，我这里使用 `parted` 命令：

```bash
$ sudo parted -l
Model: ATA ST1000LM048-2E71 (scsi)
Disk /dev/sda: 1000GB
Sector size (logical/physical): 512B/4096B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size   File system  Name  Flags
 1      1049kB  215GB   215GB
 2      215GB   752GB   537GB
 3      752GB   1000GB  **249GB**


Model: ATA MXPG2D80-240GH (scsi)
Disk /dev/sdb: 240GB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags:

Number  Start   End    Size    File system     Name  Flags
 1      1049kB  538MB  537MB   fat32                 boot, esp
 2      538MB   239GB  238GB   ext4
 3      239GB   240GB  1023MB  linux-swap(v1)        swap


Model: Kingston DataTraveler 3.0 (scsi)
Disk /dev/sdc: 30.9GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos ## MBR 格式
Disk Flags:

Number  Start   End     Size    Type     File system  Flags
 1      1049kB  30.9GB  30.9GB  primary  fat32        boot, lba
```

从输出的信息可以看到，我的 U 盘是 30G 的金士顿（Kingston），分区格式为 MBR，对应的磁盘设备是 `/dev/sdc`，并且当前已经有一个分区，分区大小就是 U 盘的容量。

## 查看挂载点信息

确定 U 盘设备之后，还要做的一件事就是看下当前这个 U 盘有没有被挂载（有些 Linux 机器会自动执行挂载），如果发现被挂载的话需要将挂载点取消。

查看磁盘设备和挂载点信息可以使用 `lsblk` 命令查看：

```bash
$ lsblk -lp
NAME       MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
/dev/loop0   7:0    0  43.6M  1 loop /snap/snapd/14978
/dev/loop1   7:1    0 164.8M  1 loop /snap/gnome-3-28-1804/161
/dev/loop2   7:2    0     4K  1 loop /snap/bare/5
/dev/loop3   7:3    0  65.2M  1 loop /snap/gtk-common-themes/1519
/dev/loop4   7:4    0  55.5M  1 loop /snap/core18/2284
/dev/sda     8:0    0 931.5G  0 disk
/dev/sda1    8:1    0   200G  0 part
/dev/sda2    8:2    0   500G  0 part
/dev/sda3    8:3    0 231.5G  0 part
/dev/sdb     8:16   0 223.6G  0 disk
/dev/sdb1    8:17   0   512M  0 part /boot/efi
/dev/sdb2    8:18   0 222.1G  0 part /
/dev/sdb3    8:19   0   976M  0 part [SWAP]
/dev/sdc     8:32   1  28.8G  0 disk
/dev/sdc1    8:33   1  28.8G  0 part /media/ituknown/FirmwareMed  ## 当前分区挂载点
```

从上面的信息可以看到 U 盘设备（`/dev/sdc`）的子分区 `/dev/sdc1` 已经被挂载到了 `/media/ituknown/FirmwareMed` 目录，所以需要先取消挂载点。

取消挂载命令如下：

```bash
$ umount /media/ituknown/FirmwareMed
```

:::info[注意]

当执行格式化时，如果你的 U 盘设备某个分区被挂载到了某个目录，会格式化失败并提示类似 `/dev/sdc contains a mounted filesystem` 这样的信息。
:::

## 删除分区

当前 U 盘存在一个分区，现在要做的是删除所有分区将容量全部归还给 U 盘设备。需要特别提示一下，删除分区也就表示会删除所有数据，是个危险操作，在执行下面的命令之前记得先将重要数据备份。

在 [查看 U 盘设备](#查看-u-盘设备) 时已经确定了我们的 U 盘分区格式是 MBR，所以接下来删除分区的话需要使用 `fdisk` 命令，如果你的 U 盘设备是 GPT 分区，记得使用 `gdisk` 命令（有关分区格式的信息可以参考下 [磁盘分区管理](./磁盘分区管理.md) 的相关内容）。

下面来执行分区删除操作：

$1.$ 先进入 `fdisk` 操作界面（`/dev/sdc` 是你的 U 盘设备）：

```bash
$ sudo fdisk /dev/sdc

Welcome to fdisk (util-linux 2.36.1).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help):
```

$2.$ 之后先使用 `p` 指令看下当前分区表信息：

```bash
Command (m for help): p   ## 先查看下分区表信息
Disk /dev/sdc: 28.82 GiB, 30943995904 bytes, 60437492 sectors
Disk model: DataTraveler 3.0
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x892b9544

Device     Boot Start      End  Sectors  Size Id Type
/dev/sdc1  *     2048 60436479 60434432 28.8G  c W95 FAT32 (LBA) ## 当前有一个分区
```

$3.$ 现在开始删除分区表

```bash
Command (m for help): d ## 删除分区
Selected partition 1
Partition 1 has been deleted.

Command (m for help): p ## 现在没有分区了
Disk /dev/sdc: 28.82 GiB, 30943995904 bytes, 60437492 sectors
Disk model: DataTraveler 3.0
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x892b9544

Command (m for help): F ## 来看下未分配的空间
Unpartitioned space /dev/sdc: 28.82 GiB, 30942947328 bytes, 60435444 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes

Start      End  Sectors  Size
 2048 60437491 60435444 28.8G  ## 现在 U 盘未分配的空间就是 U 盘的总容量了

Command (m for help): w  ## 最后, 保存删除分区结果
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

分区删除后再来使用 `lsblk` 或 `parted` 命令确认下 U 设备信息：

```bash
$ sudo lsblk -lp
NAME       MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
/dev/loop0   7:0    0  43.6M  1 loop /snap/snapd/14978
/dev/loop1   7:1    0 164.8M  1 loop /snap/gnome-3-28-1804/161
/dev/loop2   7:2    0     4K  1 loop /snap/bare/5
/dev/loop3   7:3    0  65.2M  1 loop /snap/gtk-common-themes/1519
/dev/loop4   7:4    0  55.5M  1 loop /snap/core18/2284
/dev/sda     8:0    0 931.5G  0 disk
/dev/sda1    8:1    0   200G  0 part
/dev/sda2    8:2    0   500G  0 part
/dev/sda3    8:3    0 231.5G  0 part
/dev/sdb     8:16   0 223.6G  0 disk
/dev/sdb1    8:17   0   512M  0 part /boot/efi
/dev/sdb2    8:18   0 222.1G  0 part /
/dev/sdb3    8:19   0   976M  0 part [SWAP]
/dev/sdc     8:32   1  28.8G  0 disk  ## sdc 现在没有任何分区了
```

## 格式化

所有的分区都删除后就可以来执行格式化操作了。不过有一点需要说明的是，格式化也有很多文件类型，如 `mkfs.vfat`、`mkfs.ntfs`。

Linux 执行 U 盘格式化时使用的是 `mkfs.Format` 命令，其中后面的 `Format` 就是你的具体文件类型格式。

我们可以在终端中输入 `sudo mkfs` 然后连续按两次 Table 键就能看到 `mkfs` 下的所有文件类型了，示例：

```bash
$ sudo mkfs
mkfs         mkfs.cramfs  mkfs.ext2    mkfs.ext4    mkfs.minix   mkfs.ntfs
mkfs.bfs     mkfs.exfat   mkfs.ext3    mkfs.fat     mkfs.msdos   mkfs.vfat
```

可以看到有很多文件系统类型，如 Linux 主流的 EXT 文件系统，Windows 常用的 FAT、ntfs 文件系统。而具体使用哪种文件系统还是看使用场景，这里以 `vfat` 文件系统为例。

需要特别强调的是，每个文件系统后面的可选参数都有些不同。另外，即使是同一个文件系统但是在不同的 Linux 发行版下，可选参数可能也有些区别。

所以，在使用时最后先使用 `--help` 命令查看下可选参数，`vfat` 示例：

```bash
$ sudo mkfs.vfat --help
mkfs.fat 4.2 (2021-01-31)
Usage: mkfs.vfat [OPTIONS] TARGET [BLOCKS]
Create FAT filesystem in TARGET, which can be a block device or file. Use only
up to BLOCKS 1024 byte blocks if specified. With the -C option, file TARGET will be
created with a size of 1024 bytes times BLOCKS, which must be specified.

Options:
  -a              Disable alignment of data structures
  -A              Toggle Atari variant of the filesystem
  -b SECTOR       Select SECTOR as location of the FAT32 backup boot sector
  -c              Check device for bad blocks before creating the filesystem
  -C              Create file TARGET then create filesystem in it
  -D NUMBER       Write BIOS drive number NUMBER to boot sector
  -f COUNT        Create COUNT file allocation tables
  -F SIZE         Select FAT size SIZE (12, 16 or 32)
  -g GEOM         Select disk geometry: heads/sectors_per_track
  -h NUMBER       Write hidden sectors NUMBER to boot sector
  -i VOLID        Set volume ID to VOLID (a 32 bit hexadecimal number)
  -I              Ignore and disable safety checks
  -l FILENAME     Read bad blocks list from FILENAME
  -m FILENAME     Replace default error message in boot block with contents of FILENAME
  -M TYPE         Set media type in boot sector to TYPE
  --mbr[=y|n|a]   Fill (fake) MBR table with one partition which spans whole disk
  -n LABEL        Set volume name to LABEL (up to 11 characters long)
  --codepage=N    use DOS codepage N to encode label (default: 850)
  -r COUNT        Make room for at least COUNT entries in the root directory
  -R COUNT        Set minimal number of reserved sectors to COUNT
  -s COUNT        Set number of sectors per cluster to COUNT
  -S SIZE         Select a sector size of SIZE (a power of two, at least 512)
  -v              Verbose execution
  --variant=TYPE  Select variant TYPE of filesystem (standard or Atari)

  --invariant     Use constants for randomly generated or time based values
  --offset=SECTOR Write the filesystem at a specific sector into the device file.
  --help          Show this help message and exit
```

具体的参数就不做具体说明了，现在就来执行下格式化吧：

```bash
$ sudo mkfs.vfat -n Kingston /dev/sdc
mkfs.fat 4.2 (2021-01-31)
mkfs.fat: Warning: lowercase labels might not work properly on some systems
```

执行完成后再来使用 `blkid` 命令查看下设备信息：

```bash
$ sudo blkid /dev/sdc
/dev/sdc: LABEL_FATBOOT="Kingston" LABEL="Kingston" UUID="8C40-9948" BLOCK_SIZE="512" TYPE="vfat"
```

到此，U 盘就格式化完成了~

--

https://en.wikipedia.org/wiki/Mkfs

https://linux.die.net/man/8/mkfs

https://stackoverflow.com/questions/11928982/what-is-the-difference-between-vfat-and-fat32-file-systems

https://www.howtogeek.com/443342/how-to-use-the-mkfs-command-on-linux/

https://www.thegeekdiary.com/mkfs-ext4-command-examples-in-linux/