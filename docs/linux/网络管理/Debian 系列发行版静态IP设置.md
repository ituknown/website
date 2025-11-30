## 前言

Ubuntu 也是基于 Debian 的发行版本，所以本篇文章不仅适用于 Debian 同样也适用于 Ubuntu。

唯一需要说明的是，Ubuntu 自18.0 开始关于网络的配置做了调整。在18.0之前使用的网络配置是 `Network，18` .0 以及之后的版本使用的是 `Netplan` 作为网络配置。

如果你不确定当前操作系统使用的是 `Network` 还是 `Netplan` 可以使用 `man` 命令测试下：

```bash
$ man networks

$ man netplan
```

比如当前 Debian 发行版（Buster）使用的是 `networks` ，如果使用 `man` 查看 `netplan` 就会提示：

```
No manual entry for netplan
```

下面是 Ubuntu 和 Debian 发行版使用的网络配置，当然最简单的方式还是直接使用 `man` 命令进行确认。

| **网络配置** | **Debian**                                | **Ubuntu**             | **配置文件位置** |
| :----------- | :---------------------------------------- | :--------------------- | :--------------- |
| network      | Debian各系列发型版本（当前最新是 Buster） | Ubuntu18之前发行版本   | `/etc/network` |
| netplan      |                                           | Ubuntu18及之后发行版本 | `/etc/netplan` |

知道这些区别之后就开始做具体说明。首先，先介绍基于 network 的网络配置。

## 基于 Network 配置网络

:::tip
虽然说本文是介绍 Debian 系列发行版如何设置静态 IP，但是只要使用 `Network` 的发行版其实都适用的（比如 CentOS 就是使用 Network）！
:::

Network 的配置文件是在 `/etc/network` 目录下，该目录下有文件，而用于配置网卡的则是 `interfaces` 文件：

```bash
$ ls /etc/network
if-down.d  if-post-down.d  if-pre-up.d	if-up.d  interfaces  interfaces.d
```

`interfaces` 是接口的意思，这个文件就是用于配置 Network 的网络接口（我们通常说的网卡指的就是网络接口）。

我们可以使用 `cat` 命令查看该文件中当前已存在的配置信息：

```bash
cat /etc/network/interfaces
```

下面展示的内容是我当前系统的默认网络配置信息，其中 `ens33` 就是我的系统的网络接口，也就是我们常说的网卡：

```bash
# The loopback network interface
source /etc/network/interfaces.d/*

auto lo
iface lo inet loopback

# The primary network interface
auto ens33
allow-hotplug ens33
iface ens33 inet dhcp
```

这个文件里有两个网络接口，分别是 `lo` 和 `ens33` 。 `lo` 表示的是回环网络接口，而 `ens33` 就是物理网卡，我们的 IP 就是绑定在该网卡上的。

我们可以使用 `iproute2` 命令查看当前系统的网络信息：

```bash
$ ip -c addr show
```

输出示例：

![show-ip-1637739047LlljmB](https://media.ituknown.org/linux-media/NetworkManager/Debian-StaticIP/show-ip-1637739047LlljmB.png)

可以看到我们的 IP 都是绑定在 `ens33` 网卡上的，上面截图中绑定的 IPv4 地址是 `172.17.13.167/24` ，IPv6 地址是 `fe80::20c:29ff:fe1b:a908/64` 。稍后我们就将 IPv4 或 IPv6 设置成静态的（每个系统上的网卡名可能不一样，我的是 `ens33` 你的可能是 `eth0` 。具体是什么可以使用 `ip -c route list` 命令查下）。

**这里要特别说下接口文件中的 `auto` 和 `allow-hotplug` 两个配置：**

`auto` 指的是启动系统时自动启动网络接口，如果不配置该选项，那么启动或重启系统时就不会启动该网络接口。我们在使用 `ssh` 进行远程登录时如果遇到登录失败，那么可能原因就是没有配置该选项，导致网卡还处于 `DOWN` 状态（可以使用 `ip -c link list` 命令查看）。

而 `allow-hotplug` 则是当内核从网络接口检测到热插拔事件后才会启动该网络接口。如果系统启动时该网络接口没有插入网线，则系统不会启动该网卡。系统启动后，如果插入网线，系统会自动启动该网络接口。

有关 `auto` 可 `allow-hotplug` 的区别可参考文章最后的[资源链接](#资源链接)。

**现在再来说下 `iface` 配置：**：

`iface` 指定要配置的网络接口，比如上面示例中的内容：

```
iface ens33 inet dhcp
```

`inet` 指的是 IPv4 网络协议，意思就是配置 `ens33` 网卡上的 IPv4 网络，如果要配置 IPv6 的话，将 `inet` 修改为 `inet6` 就好了。

继续看后面的 `dhcp` ，这个指的是动态获取的意思，将 `iface` 连起来一起解释就是：配置 `ens33` 网络接口，以动态形式配置该接口上的 IPv4 网络协议！

这样的话，当我们系统启动时就会动态分配 IPv4 地址，这也是为什么当我们连接网络后就会有一个局域网 IP 的原因。

现在来看下怎么配置静态 IP：

### 配置静态 IP

:::tip
下面介绍的内容都可以使用 `man` 命令查看： ` man interfaces`
:::

现在来看下静态 IP 该怎么配置。在修改之前先进行下备份，这是修改系统配置的必须步骤，可用于配置还原，应该养成随时备份的好习惯：

```bash
sudo cp /etc/network/interfaces /etc/network/interfaces.bak
```

:::tip
修改系统配置需要有超级管理员权限，也就是 `root` 用户或能够使用 `sudo` 权限的用户！
:::

首先呢，将 `iface` 指定的网卡由 `dhcp` 修改为 `static` ，表示要将该网卡设置为静态，至于网络协议的话就不改了，因为我们要配置的就是 IPv4，如果你想要配置的是 IPv6，就将 `inet` 修改为 `inet6` 即可，如下：

```
iface ens33 inet static
```

之后使用 `address` 和 `gateway` 指定要设置的静态 IP 和网络就好了，IP 的话就设置为 `172.17.13.167/24` 就好，就是之前使用 `ip -c addr show` 命令输出的 IP。

至于 `gateway` 的话，我们不要做任何修改，依然使用当前局域网的网关IP，使用下面的命令就可以获取了：

```bash
$ ip -c route list
```

输出示例：

![show-route-1637829825BkqF0Q](https://media.ituknown.org/linux-media/NetworkManager/Debian-StaticIP/show-route-1637829825BkqF0Q.png)

其中 default 栏对应的 IP 就是我们的网关了，IP 是 `172.17.13.254` 。

将这两个信息配置到接口文件中即可，如下：

```
iface ens33 inet static
     address 172.17.13.167/24
     gateway 172.17.13.254
```

:::info[NOTE]
一定要注意示例中的缩进！另外，有些资料提示还要配置子网掩码 `netmask` 。

不过这个当前相关 Linux 发行版已经不推荐配置了，这个可以使用 `man interfaces` 查看说明，在说明中将 `netmask` 明确标注为 **deprecated**！
:::

最终我们的 interfaces 文件内容如下：

```bash
source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface

# 配置自启 ens33 网卡
auto ens33
allow-hotplug ens33

# 静态 IP 配置
iface ens33 inet static
     address 172.17.13.167/24
     gateway 172.17.13.254
```

:::info[NOTE]
在 `/etc/network/interfaces` 配置文件中千万不要在配置信息行后面使用注释 `#` ，否则可能会导致网络重启失败。

另外，看上面的配置信息，注意缩进！
:::

最后重启网络使用命令：

```bash
$ sudo systemctl restart networking.service

# 或使用

$ sudo /etc/init.d/networking restart
```

如果没有输出错误信息即表示网络配置成功！

**注意：** 使用 Network 配置安装上述方式配置静态 IP 时并没有设置 DNS 解析地址，如果重启网络之后 `ping baidu.com`  时遇到如下错误可能的原因原因是 DNS 解析的问题，具体解决方式见 FAQ。

```
Temporary failure in name resolution DNS
```

这样，即使虚拟机重启也不怕 IP 变化了~

### 多静态 IP 配置

既然都配置了静态 IP，怎么能少得了在网卡上配置多个静态 IP 呢的需求呢（虽然这种需求很 BT）？

配置多个静态 IP 方式与配置静态 IP，直接修改 `/etc/network/interfaces` 文件即可，不过有两种分配方式。分别是基于 `iproute2` 的方式（iproute2 method）和比较老的配置方式（Legacy method）。

现在所有的发行版默认都集成了 `iproute2` ，似乎只要 Linux 内核版本大于 2.2 就有该工具。你可以在命令行中输入 `ip` ，如果有类似如下的输出就说明有 `iproute2` 网络工具了：

```bash
$ ip
Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }
       ip [ -force ] -batch filename

        ...
```

现在就分别来看下：

#### 基于 iproute2 配置多静态 IP

配置起来比较简单，就是在之前静态 IP 的基础上多写几个 `iface` 就好了。如下：

```bash
source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface

# 配置自启 ens33 网卡
auto ens33
allow-hotplug ens33
# 静态 IP 配置
iface ens33 inet static
     address 172.17.13.167/24
     gateway 172.17.13.254

# 第二个静态 IP
iface ens33 inet static
     address 172.17.13.168/24

# 第三个静态 IP
iface ens33 inet static
     address 172.17.13.169/24
```

唯一需要说明的是，除了第一个 `iface` 外，其他的 `iface` 上除了 `address` 外不要配置其他任何信息，如 `gateway` 也不要配置！

所有额外的信息要配置在第一个 `iface` 上！另外，注意 `address` 指定的 IP 不要重复，且在局域网内没有被占用！

之后重启网络就好了：

```bash
$ systemctl restart networking.service
```

之后查看下 IP 信息：

```bash
$ ip -c addr show
```

输出示例：

![multiple-ip-1637832393lrIgXO](https://media.ituknown.org/linux-media/NetworkManager/Debian-StaticIP/multiple-ip-1637832393lrIgXO.png)

现在再来看下如果发行版没有 `iproute2` 网络管理工具多静态 IP 该如何配置：

#### 基于 Legacy​ 配置多静态 IP

这种方式与基于 `iproute2` 的配置最大的区别就是网卡上，来看下将基于 `iproute2` 转换为 Legacy​ 的配置形式：

```bash
source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface

# 配置自启 ens33 网卡
auto ens33
allow-hotplug ens33

# 静态 IP 配置
iface ens33 inet static
     address 172.17.13.167/24
     gateway 172.17.13.254

# 第二个静态 IP
auto ens33:0
allow-hotplug ens33:0
iface ens33:0 inet static
     address 172.17.13.168/24

# 第三个静态 IP
auto ens33:1
allow-hotplug ens33:1
iface ens33:1 inet static
     address 172.17.13.169/24
```

看到了，最大的区别就是网卡。使用 Legacy​ 配置多静态 IP 主要使用的是虚拟网卡的概念。我们的物理网卡是 ens33，而下面的 `ens33:[0-255]` 就是虚拟网卡。

另一个区别是，虚拟网卡也要使用 `auto` 和 `allow-hotplug` 进行激活，否则也是不生效的。

最后，也是最重要的一点是千万不要在虚拟网卡上配置除了 `address` 之外的任何信息。这点相比较基于 `iproute2` 的配置更加显著！

之后重启网络就可以了~

### 关于 DNS 问题

在 [Debian 官网中有一篇对网络配置的介绍](https://wiki.debian.org/NetworkConfiguration)，其中就有介绍在 `/etc/network/interfaces` 配置文件中配置网卡 DNS 问题：

![debian-nameservers-doc-1637928644Jv2CjN](https://media.ituknown.org/linux-media/NetworkManager/Debian-StaticIP/debian-nameservers-doc-1637928644Jv2CjN.png)

总结下来就是在具体网卡后面写一个 `dns-nameservers` 的配置，与 `gateway` 和 `address` 一样需要有缩进，在后面写上 DNS 服务器的 IP 即可，示例如下：

```bash
auto ens33
allow-hotplug ens33
iface ens33 inet static
     address 192.168.1.8/24
     gateway 192.168.1.1
     dns-nameservers: 114.114.114.114 8.8.8.8
```

正常来说重启网络就好了，但我不管怎么重启都是不生效的：

```bash
$ systemctl daemon-reload
$ systemctl restart networking.service
$ systemctl restart systemd-resolved.service
```

查询结果：

```bash
$ systemd-resolve --status

Global
         Protocols: +LLMNR +mDNS -DNSOverTLS DNSSEC=no/unsupported
  resolv.conf mode: foreign
Current DNS Server: 192.168.1.1 # 没有变化
       DNS Servers: 192.168.1.1

Link 2 (ens33)
Current Scopes: LLMNR/IPv4 LLMNR/IPv6
     Protocols: -DefaultRoute +LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
```

**Note：** 如果你在执行 `systemd-resolve --status` 遇到如下错误说明已没有启动 `systemd-resolved.service` 服务，执行下运行命令就好： `sudo systemctl restart systemd-resolved.service` 。

```
Failed to get global data: Unit dbus-org.freedesktop.resolve1.service not found.
```

同样的，我也在 stackoverflow 上查找该问题，但所有的答案都是告诉你在 `interfaces` 配置文件中指定 `dns-nameservers` 即可！

所以这个问题我再 Debian 上没有解决，所以我就很难理解。说明一下我使用的 Debian 发行版信息如下：

```
   Static hostname: vm
         Icon name: computer-vm
           Chassis: vm
        Machine ID: 99c0e11c8499491293588694271066b8
           Boot ID: 50cc642779e841d3bbd4ad5a40b0dbbd
    Virtualization: vmware
  Operating System: Debian GNU/Linux 10 (buster)
            Kernel: Linux 4.19.0-14-amd64
      Architecture: x86-64
```

好吧，关于这个问题还是要去社区寻求答案吧~

### 录屏示例

下面是使用 [asciinema](https://asciinema.org) 工具录制的 Shell 操作示例。该示例演示了静态 IP 的配置，同时分别基于 `iproute2` 和 Legacy 演示了多静态 IP 配置，可以参考下：

[![asciicast](https://asciinema.org/a/451110.svg)](https://asciinema.org/a/451110)

## 基于 Netplan 配置网络

**说明：** Ubuntu 自 18 开始基于 `Netplan` 作为网络管理工具。这里我基于 Ubuntu20 做说明，下面是我的系统信息：

```
 Static hostname: vm
       Icon name: computer-vm
         Chassis: vm
      Machine ID: 575a6b796de64be7af5e8d0006ea2978
         Boot ID: eefcb16f68d54945b0c89cc3a10da65e
  Virtualization: vmware
Operating System: Ubuntu 20.04.3 LTS
          Kernel: Linux 5.11.0-40-generic
    Architecture: x86-64
```

`Netplan` 的配置与 `Network` 的配置文件有个很大的区别就是 `Netplan` 使用的是 YAML 配置文件。它的网络配置文件在 `/etc/netplan` 目录下面。该目录下可能存在一个或多个配置文件，比如我这里就只有一个网络配置文件：

```bash
$ ls /etc/netplan/
01-network-manager-all.yaml
```

这里要特别强调一下，每个系统下 Netplan 配置文件名可能是不同的，所以不要做拿来主义~

从文件命名也能看出一些区别，它是一个基于 YAML 的配置文件。来看下这个配置文件中的内容：

```bash
$ cat /etc/netplan/01-network-manager-all.yaml
```

示例：

```yaml
# Let NetworkManager manage all devices on this system
network:
  version: 2
  renderer: NetworkManager
```

这个 YAML 配置文件中的所有信息我们都可以使用 `man netplan` 命令查看，另外也可以直接查看 [netplan.io 官网](https://netplan.io) 或者 [Ubuntu 20.04 netplan 使用说明页面](http://manpages.ubuntu.com/manpages/focal/en/man5/netplan.5.html)。

下面是 netplan 在实际中用的比较多的配置选项示例：

```yaml
network:
  version: 2
  renderer: networkd

  # 配置网卡
  ethernets:

    # 网卡名
    id0:
      # 是否立即启动
      optional: false
      # IPv4 动态配置
      dhcp4: true
      # IPv6 动态配置
      dncp6: true
      # 静态IP地址
      addresses:
        # IPv4 地址
        - 10.0.0.10/24
        - 11.0.0.11/24
        # IPv6 地址
        - "2001:1::1/64"

      # DNS
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4

      # MAC 地址
      macaddress: 52:54:00:6b:3c:59

      # 网关
      gateway4: 172.16.0.1
      gateway6: "2001:4::1"

      # 路由
      routes:
        - to: 0.0.0.0/0
          via: 10.0.0.1
          metric: 100
        - to: 0.0.0.0/0
          via: 11.0.0.1
          metric: 100
        # 也可以直接使用下面的形式
        - to: default
          via: 172.16.0.1
        - to: default
          via: 2001:4::1

    id1:
      # ...
```

:::tip
新版Ubuntu（22.04）不再推荐使用 `gateway4` 和 `gateway6` 来配置网关，已经被废弃。而是改用默认路由来实现，即通过 `routes` 配置。
:::

当前还有很多其他的配置信息，如 WIFI 连接以及认证，这里就不过介绍了。可以自行查阅 [netplan.io 官网](https://netplan.io) 或者 [Ubuntu netplan 使用说明页面](http://manpages.ubuntu.com/manpages/focal/en/man5/netplan.5.html)。

### YAML配置属性说明

下面来具体说下这些配置：

最开始的 `network` 和 `version` 是固定的不要做任何修改。至于 `renderer` 指定的是网络渲染模式，值主要有两个，分别是 `networkd` 和 `NetworkManager` 。同样的也不需要修改，使用默认即可。需要说明的是，在 Ubuntu18 中似乎没有这个配置，所以你完全可以忽略

#### ethernets 属性

`ethernets` 指的是网络接口，也就是我们常说的网卡。比如上面示例中的 `id0` 和 `id1` 就是具体的网卡名。想要查看自己的网卡名可以使用下面的命令：

```bash
$ ip -c link show
```

输出示例：

```
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000
    link/ether 00:0c:29:2e:e9:70 brd ff:ff:ff:ff:ff:ff
    altname enp2s1
```

可以看到，我的网络接口名（网卡）就是 ens33。至于 lo，指的是回环网络接口。所以之后想要配置自己的网络时就将上面示例中的 `id0` 修改为自己的网络接口名就好了。

在 `id0` 下面的所有配置都是用于配置该网卡的信息，如 `addresses` 就是用于指定静态 IP 了~

#### optional 属性

`optional` 接受的是一个 Bool 值。它表示的是当前网络接口是否需要等待所有的设备都准备就绪后再启动该网络接口，如果设置为 true 就表示不需要等待，立即启动的意思。默认为 false！

#### dhcp4 和 dhcp6 属性

`dhcp4` 和 `dhcp6` 接受的是一个 Bool 值。分别表示 IPv4 和 IPv6 是否使用动态配置。你可以查看自己 YAML 配置文件中的初始配置，它的值通常被指定为 true，表示动态获取网络。这也是为什么我们连接网络后虽然没有做任何配置就有 IP 的原因。

如果想要使用配置静态的 IP，那么久需要将该配置设置为 false 或直接删掉即可（默认就为 false）。

#### addresses 属性

这个指的就是具体的 IP 了，也就是我们要设置的静态 IP，可以指定多个，最重要的一点时同时可以指定 IPv4 和 IPv6。比如示例中的配置就指定了两个 IPv4 和一个 IPv6 地址，如下：

```yaml
addresses:
  # IPv4 地址
  - 10.0.0.10/24
  - 11.0.0.11/24
  # IPv6 地址
  - "2001:1::1/64"

# 或者
addresses: [ "10.0.0.10/24", "11.0.0.11/24", "2001:1::1/64"]
```

当然前提是 `dhcp4` 或 `dhcp6` 的值要为 false 才行。

#### gateway4 和 gateway6 属性

这个就是网关的配置了，分别用于配置 IPv4 和 IPv6 的网关。除非你有网关服务器，否则使用当前局域网内的默认网关 IP 就好，可以使用下面的命令获取：

```bash
$ ip -c route list
default via 172.17.21.254 dev ens33 proto dhcp metric 100
169.254.0.0/16 dev ens33 scope link metric 1000
172.17.21.0/24 dev ens33 proto kernel scope link src 172.17.21.107 metric 100
```

其中 default 对应的 IP 就是我们的网关 IP 了，所以也完全可以直接使用下面的命令获取：

```bash
$ ip -c route list default
```

**Note：** 新版Ubuntu(22.04) 已废弃 gateway 属性，取而代之的是通过配置默认路由表 [routes](#routes-配置) 来实现。

比如：

```yaml
gateway4: 172.16.0.1
```

可以使用 routes 配置：

```yaml
routes:
- to: default
  via: 172.16.0.1
```

#### nameservers 配置

这个指的就是我们的 DNS 配置了，DNS 服务器使用 `addresses` 进行指定。示例：

```yaml
nameservers:
  addresses: [8.8.8.8, 8.8.4.4, 114.114.114.114]

# 或使用下面的形式

nameservers:
  addresses:
    - 8.8.8.8
    - 8.8.4.4
    - 114.114.114.114
```

当然了， `nameservers` 还有其他的配置参数，如 search。这里就不多说了，可以参考文章最后的[资源链接🔗](#资源链接)。

#### macaddress 属性

这个指的就是 MAC 地址，你可以使用下面的命令查看当前系统上网卡的 MAC 地址：

```bash
$ ip -c link show

1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000
    link/ether 00:0c:29:2e:e9:70 brd ff:ff:ff:ff:ff:ff
    altname enp2s1
```

可以看到，我的网络接口 ens33 对应的 MAC 地址就是 `00:0c:29:2e:e9:70` 。所以你可以使用 `macaddress` 指定一个新的 MAC 地址测试下。

#### routes 属性

这个指的就是路由表配置了，想怎么配置就看你自己了。在配置之前呢先使用下面的命令查看下自己当前路由表信息，之后配置后在执行下看下效果：

```bash
$ ip -c route list
default via 172.17.21.254 dev ens33 proto dhcp metric 100
169.254.0.0/16 dev ens33 scope link metric 1000
172.17.21.0/24 dev ens33 proto kernel scope link src 172.17.21.107 metric 100
```

这些就是 `Netplan` 的主要配置了，当然如果仅仅只是配置静态 IP 只需要配置其中某几项即可，下面来看下：

### 配置静态 IP

该介绍的都已经说了，所以直接看配置即可：

```yaml
network:
  version: 2
  renderer: NetworkManager
  ethernets:
    ens33:
      dhcp4: false
      addresses: [ "172.17.21.107/24" ]
      gateway4: 172.17.21.254
```

之后使用下面的命令重启网络即可：

```bash
$ sudo netplan apply
```

**注意！** 如果你是新版 ubuntu(22.04) 当你执行这条命令时可能会失败，并提示类似如下信息：

```
** (generate:1961): WARNING **: 03:09:39.052: `gateway4` has been deprecated, use default routes instead.
See the 'Default routes' section of the documentation for more details.
```

原因是新版已不再推荐使用 gateway 属性来配置网关，而是推荐通过配置默认路由表的方式来实现。比如上面的配置基于默认路由表的实现方式如下：

```yaml
network:
  version: 2
  renderer: NetworkManager
  ethernets:
    ens33:
      dhcp4: false
      routes:
      - to: default
        via: 172.17.21.107
```

### 多静态 IP 配置

直接看配置即可，与之前一样：

```yaml
network:
  version: 2
  renderer: NetworkManager
  ethernets:
    ens33:
      dhcp4: false
      addresses: [ "172.17.21.107/24", "172.17.21.108/24" ]
      gateway4: 172.17.21.254
```

:::info[NOTE]
在进行设置静态 IP 时，如果指定的 IP 不是当前机器正在使用的 IP 的话一定要保证选择的 IP 并没有被占用。

在配置该 IP 之前先使用 `ping` 命令看能否 PING 的通，如果通了就表示该 IP 已被占用，就不能进行设置成该 IP 了。
:::

### 配置 DNS

```yaml
network:
  version: 2
  renderer: NetworkManager
  ethernets:
    ens33:
      dhcp4: false
      addresses: [ "172.17.21.107/24" ]
      gateway4: 172.17.21.254
      nameservers:
        addresses:
          - 8.8.8.8
          - 114.114.114.114
```

之后安装下面的命令执行看 DNS 解析记录：

```bash
$ sudo netplan --debug generate
$ sudo netplan apply

# 之后查看解析记录
$ systemd-resolve --status
```

下面是使用 [asciinema](https://asciinema.org) 工具录制的 Shell 操作示例。该示例演示了 DNS 配置及查看解析示例，可以参考下：

[![asciicast](https://asciinema.org/a/451587.svg)](https://asciinema.org/a/451587)

## Temporary failure in name resolution DNS？

该问题的可能原因是网关配置错误，比如按照上述本文说明如果配置的 IP 地址为： `192.168.0.112/24`  。那么网段就是 `192.168.0`  ，所以网关的地址就是 `192.168.0.1~225`  之间，具体是其中的哪一个可以使用 `ip -c route list default`  命令进行确定。

如果将网关地址设置为 `192.168.1.1`  那么肯定会出现该错误的。

除了网关的原因之外，还一个原因可能是 DNS 配置错误。如前面说的，在查看 `/etc/resolv.conf`  文件得到的 DNS 地址 `127.0.0.53`  。如果在配置静态 IP 时将 DNS 解析地址设置为该值那么也可能会得到该错误，解决方式就是在配置静态 IP 时将 DNS 首选解析地址设置为国内的 `114.114.114.114`  ，另外还可以加上谷歌的 DNS 解析地址 `8.8.8.8`  。

比如基于 Netplan 配置 DNS 地址：

```yaml
network:
  version: 2
  ethernets:
    ens33:
      nameservers:
        addresses:
        - 114.114.114.114 # 国内首选 DNS 解析地址
        - 8.8.8.8         # 谷歌 DNS 解析地址
```

如果是基于 Network 配置的话可以通过修改 `/etc/systemd/resolved.conf`  文件进行设置 DNS 解析地址。将该文件中的 DNS 值首选设置为 `114`  之后再跟一个谷歌的 `8.8` ：

```
[Resolve]
DNS=114.114.114.114 8.8.8.8
```

目前笔者知道的解决方式就这两种，如果还是无法解决该问题就向度娘、谷歌求助了~

## 资源链接

[https://wiki.debian.org/NetworkConfiguration](https://wiki.debian.org/NetworkConfiguration)

[https://askubuntu.com/questions/143819/how-do-i-configure-my-static-dns-in-interfaces](https://askubuntu.com/questions/143819/how-do-i-configure-my-static-dns-in-interfaces)

[https://lists.debian.org/debian-user/2017/09/msg00911.html](https://lists.debian.org/debian-user/2017/09/msg00911.html)

[https://unix.stackexchange.com/questions/641228/etc-network-interfaces-difference-between-auto-and-allow-hotplug](https://unix.stackexchange.com/questions/641228/etc-network-interfaces-difference-between-auto-and-allow-hotplug)

[http://manpages.ubuntu.com/manpages/cosmic/man5/interfaces.5.html](http://manpages.ubuntu.com/manpages/cosmic/man5/interfaces.5.html)

[https://wiki.ubuntu.org.cn/Ubuntu服务器入门指南](https://wiki.ubuntu.org.cn/Ubuntu服务器入门指南)
​
[https://ubuntu.com/core/docs/networkmanager](https://ubuntu.com/core/docs/networkmanager)

[http://manpages.ubuntu.com/manpages/jammy/en/man5/netplan.5.html](http://manpages.ubuntu.com/manpages/jammy/en/man5/netplan.5.html)

[netplan vs NetworkManager on Ubuntu 18.04 and above](https://askubuntu.com/questions/1122757/netplan-vs-networkmanager-on-ubuntu-18-04-and-above)
