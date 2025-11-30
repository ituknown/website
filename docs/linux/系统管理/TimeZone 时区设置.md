对于服务器而言时区的重要性不言而喻，比如在某个机器上部署一套订单系统，如果时区是 UTC，保存用户下单时间取的时间是 Java 标准类库 API `new Date()` 或者 `LocalDateTime.now()`。那在数据回显时就是一个致命的问题。当然如果取的是时间戳 `System.currentTimeMillis()` 日期存储是不会有这个问题的~

现在就来看下怎么查看以及修改时区。

## 检查当前时区

我们可以使用 `timedatectl` 命令行工具查看和更改系统的时间和日期。该工具在所有基于 `systemd` 的现代 Linux 系统上都可用：

```bash
timedatectl
```

输出如下：

```
               Local time: Wed 2021-07-14 05:11:02 EDT
           Universal time: Wed 2021-07-14 09:11:02 UTC
                 RTC time: Wed 2021-07-14 09:11:02
                Time zone: America/New_York (EDT, -0400)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

可以看到我当前的时区是 EDT(America/New_York) 美国时区。

实际上，系统的时区读取的是 `/etc/localtime` 文件，该文件是一个符号链接。该符号链接指向的是系统的 `/usr/share/zoneinfo` 目录中的某个二进制时区标识符。

比如我当前系统时区是 EDT(America/New_York)，该符号链接实际上指向的就是 `/usr/share/zoneinfo` 目录下的 `America/New_York` 二进制文件时区标识符。可以使用 `ls -l` 命令查看：

```bash
$ ls -l /etc/localtime
lrwxrwxrwx 1 root root 36 Jun 23 22:29 /etc/localtime -> /usr/share/zoneinfo/America/New_York
```

## 时区更改

### 使用链接符号修改时区

先删除系统里的当前时区链接：

```bash
sudo rm -f /etc/localtime
```

更改时区只需要重新创建一个符号链接 `/etc/localtime` 并指向对应的二进制时区文件即可，命令如下：

```bash
sudo ln -sf /usr/share/zoneinfo/$time_zone /etc/localtime
```

:::info[NOTE]
修改时区必须使用 `root` 用户或具有超级管理员权限（`sudo`）的用户。
:::

另外还有一点需要注意的是时区(`$time_zone`)的名称，时区的名称使用的是 “地区/城市” 格式。可以直接查看 `/usr/share/zoneinfo/` 目录下的文件进行确定。

想要列出所有可用时区，除了主动进入 `/usr/share/zoneinfo` 目录进行查看，也可以使用 `timedatectl list-timezones` 命令进行查看（该命令本质也是遍历列出 `/usr/share/zoneinfo` 目录下的文件名）。

示例：

```bash
$ timedatectl list-timezones

···
Africa/Abidjan
Africa/Accra
Africa/Addis_Ababa
Africa/Algiers
Africa/Asmara
Africa/Bamako
Africa/Bangui
Africa/Banjul
···
```

确定好时区后就可以就可以使用如下命令修改了，如修改时区为 Asia/Shanghai：

```bash
sudo ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

### 使用 timedatectl 修改时区

除了使用链接符号的形式修改时区外，还可以直接使用 `timedatectl set-timezone $time_zone` 命令来修改时区。

比如中国的时区是 Asia/Shanghai，修改命令如下：

```bash
sudo timedatectl set-timezone Asia/Shanghai
```

之后通过列出 `/etc/localtime` 文件或发出 `timedatectl` 或 `date` 命令就可以验证是否更改了。
