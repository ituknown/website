## 使用 systemd-resolved（现代 Debian/Ubuntu 使用）

systemd-resolved 是 systemd 项目提供的一个系统服务，用于管理域名解析（DNS/DNSSEC）和本地网络名称解析（如 LLMNR 和 mDNS）。它的主要目标是提供更现代化、灵活且安全的 DNS 解析功能，替代传统的 glibc 解析器或静态 /etc/resolv.conf 配置。

### 安装

systemd-resolved 虽然是更现代化且灵活，但是并非所有 Linux 发行版都默认安装，甚至有些内置 systemd 的发行版也不会默认安装 systemd-resolved（比如 Debian 12）。

所以，首先需要确认系统有没有  systemd-resolved 服务，执行命令：

```bash
$ sudo systemctl status systemd-resolved
```

如果提示：“Active: inactive (dead)” 表示已经安装了，但是服务还未启动。可以执行下面命令启动服务：

```bash
sudo systemctl enable --now systemd-resolved
# 或
sudo systemctl restart systemd-resolved
```

如果提示：“Unit systemd-resolve.service could not be found.” 就表示还未安装，可以执行如下命令安装：

```bash
sudo apt update -y
sudo apt install systemd-resolved -y
```

安装完成之后先备份 /etc/resolv.conf 文件（或记住 DNS 信息），备份完成之后执行如下命令：

```bash
sudo systemctl enable --now systemd-resolved
sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf  # 确保正确链接
```

:::tip
在创建软链接时如果没有做 /etc/resolv.conf 备份，就会导致 DNS 信息丢失。
:::

另外，systemd-resolved 中有一个核心控制工具：resolvectl。该工具可用于管理和查询 systemd-resolved 的 DNS 和域名解析设置。

### 查看当前 DNS 状态

1. 显示所有接口的 DNS 配置：

```bash
sudo resolvectl status
```

2. 查看特定网卡的 DNS 配置（以网卡 enp2s0 为例）：

```bash
sudo resolvectl status -i enp2s0
```

输出示例：

```bash
$ sudo resolvectl status

Global
         Protocols: +LLMNR +mDNS -DNSOverTLS DNSSEC=no/unsupported
  resolv.conf mode: uplink
Current DNS Server: 172.21.101.11
        DNS Servers 172.21.101.11

Link 2 (enp2s0)
Current Scopes: LLMNR/IPv4 LLMNR/IPv6
     Protocols: -DefaultRoute +LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
```

:::info[Note]
如果你不知道自己的网卡名，可以使用 `ip -c addr` 查看，示例：

```bash
$ ip -c addr

1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: enp2s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:15:5d:ce:ea:17 brd ff:ff:ff:ff:ff:ff
    inet 172.24.130.189/20 brd 172.24.143.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::215:5dff:fece:ea17/64 scope link
       valid_lft forever preferred_lft forever
```
:::

### 网卡临时设置 DNS

给网卡临时设置 DNS 命令如下，可以设置多条 DNS：

```bash
sudo resolvectl dns 网卡名 DNS1 [DNS2...]
```

比如网卡 enp2s0 临时设置 DNS：

```bash
sudo resolvectl dns enp2s0 172.21.100.241
```

示例：

```bash
$ sudo resolvectl status
Global
         Protocols: +LLMNR +mDNS -DNSOverTLS DNSSEC=no/unsupported
  resolv.conf mode: uplink
Current DNS Server: 172.21.101.11
        DNS Servers 172.21.101.11

Link 2 (enp2s0)
Current Scopes: DNS LLMNR/IPv4 LLMNR/IPv6
     Protocols: +DefaultRoute +LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
   DNS Servers: 172.21.100.241 ## <=== 临时设置的 DNS
```

如果想快速临时设置 DNS 可以自定义一个 alias 命令，如：

```bash
alias set_dns_172 = 'sudo resolvectl dns enp2s0 172.21.100.241'
```

### 清空临时 DNS

如果后面想清空该网卡临时设置的 DNS，可以使用下面的命令：

```bash
sudo resolvectl revert 网卡名
```

### 清空本地 DNS 缓存

如果想强制系统立即丢弃已缓存的 DNS 查询结果，并在下次请求时重新向 DNS 服务器查询，确保获取最新的解析记录。可以执行下面命令：

```bash
sudo resolvectl flush-caches
```

### 永久设置 DNS

通过命令行设置 DNS 都仅用于临时使用，如果想永久生效就需要通过配置文件来实现了。

```bash
sudo vim /etc/systemd/resolved.conf
```

添加或修改：

```Plain
[Resolve]
DNS=8.8.8.8 8.8.4.4
FallbackDNS=1.1.1.1
```

1. `DNS=` 是主 DNS 服务器列表。
2. `FallbackDNS=` 是备选 DNS 服务器列表。

然后重启服务即可生效：

```bash
sudo systemctl restart systemd-resolved
```

## 使用 netplan（Ubuntu 18.04+）

Netplan 是 Ubuntu（从 17.10 开始）默认的网络配置工具，通过 YAML 文件配置，用于在系统启动时配置网络接口，最终将配置应用到后台的实际网络管理服务（如 systemd-networkd 或 NetworkManager）。

配置文件路径：

```
/etc/netplan/*.yaml
```

每台机器的 YAML 配置文件名都不相同，大多情况下都是如下两种：

1.  01-netcfg.yaml
2. 50-cloud-init.yaml

:::info[Note]
通过 netplan 修改 DNS 是永久生效，即使服务器重启也没有影响。
:::

编辑配置文件：

```bash
sudo vim /etc/netplan/01-netcfg.yaml
```

在具体的网卡下面添加或修改如下内容（如果没有网卡配置，也可以按照下面形式添加）：

```yaml {6,7}
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: yes
+     nameservers:
+       addresses: [8.8.8.8, 8.8.4.4]
```

重启生效：

```bash
sudo netplan apply
```