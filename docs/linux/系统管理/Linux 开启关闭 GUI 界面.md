## 前言
在日常使用时，GUI 界面特别吃内存，所以除非必要（如日常开发环境），通常都会关闭 GUI 仅使用命令行视窗。下面是开启和关闭 GUI 的方式。

:::tip[Note]
其实 Linux 开启/关闭 GUI 界面就是修改 Linux 的运行级别，前面也在 [Linux 系统运行模式](Linux%20系统运行模式（Runlevels）.md) 已经做了说明，不过这里还是再单独啰嗦说明下~
:::

## 使用 SystemD

开启 GUI

```bash
sudo systemctl set-default multi-user.target
sudo reboot
```

关闭 GUI

```bash
sudo systemctl set-default graphical.target
sudo reboot
```

## 使用 SystemV

编辑 `/etc/inittab` 文件（需要超级管理员权限）：

```bash
sudo vim /etc/inittab
```

文件内容如下：

```
# inittab is only used by upstart for the default runlevel.
#
# ADDING OTHER CONFIGURATION HERE WILL HAVE NO EFFECT ON YOUR SYSTEM.
#
# System initialization is started by /etc/init/rcS.conf
#
# Individual runlevels are started by /etc/init/rc.conf
#
# Ctrl-Alt-Delete is handled by /etc/init/control-alt-delete.conf
# Terminal gettys are handled by /etc/init/tty.conf and /etc/init/serial.conf,
# with configuration in /etc/sysconfig/init.
#
# For information on how to write upstart event handlers, or how
# upstart works, see init(5), init(8), and initctl(8).
#
# Default runlevel. The runlevels used are:
# 0 - halt (Do NOT set initdefault to this)
# 1 - Single user mode
# 2 - Multiuser, without NFS (The same as 3, if you do not have networking)
# 3 - Full multiuser mode
# 4 - unused
# 5 - X11
# 6 - reboot (Do NOT set initdefault to this)
#

id:5:initdefault:
```

这几个数字的含义是：

```
0：关机模式
1：单用户模式
2：多用户模式
3：完整多用户模式（无图形界面）
4：没被使用
5：图形界面模式
6：无限重启模式
```

比如想要以命令行形式启动，选择 3 即可，默认就是 5 图形界面模式：

```bash
id:3:initdefault:
```

保存之后重启即可~
