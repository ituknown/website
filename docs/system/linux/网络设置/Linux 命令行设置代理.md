## 前言

Linux 系统我们主要使用的就是多用户命令行模式，也就是所有的系统交互都是基于命令行，不管是下载还是执行某个命令。

在使用 Linux 开发部署中免不了需要下载国外软件的需求，你会发现那软件下载速度简直感人，有时候甚至直接被墙无法下载，所以就需要借助代理来完成我们的工作。

## 命令行设置代理

Linux 提供了三个环境变量用于设置代理，分别是 `http_proxy` 、 `https_proxy` 或 `ftp_proxy` 。从变量的名字也可以看出这三个变量主要适用于不同的流量类型，我们只需要选择自己需要的类型即可，不过我们通常都会进行设置。

上面的三个变量几乎可用于所有的 Linux 命令行工具，例如 `ftp` 、 `wget` 、 `curl` 、 `ssh` 、 `apt` 、 `yum` 等命令都使用这三个变量来设置代理服务器。

下面是使用命令设置代理的方式，三种代理方式可以根据自己需要选择，也可以全部设置。

```bash
$ export http_proxy="protocol://proxy_server:port"
$ export https_proxy="protocol://proxy_server:port"
$ export ftp_proxy="protocol://proxy_server:port"
```

如果你的代理服务器需要用户认证的话就需要使用下面的方式：

```bash
$ export http_proxy="protocol://username:pwd@proxy_server:port"
$ export https_proxy="protocol://username:pwd@proxy_server:port"
$ export ftp_proxy="protocol://username:pwd@proxy_server:port"
```

其实 Linux 除了上面的三个环境变量用于配置代理之外还有 `all_proxy` 和 `no_proxy` 等变量。 `all_proxy` 似乎不是 Linux 系统提供的环境变量（因为我没有找到相关资料），而是大多数软件都在软件中使用该环境变量因此就成了一种约定，所以在设置代理时最好将这个也设置。至于 `no_proxy` 则是设置哪些请求不走代理，比如请求本机服务器 `127.0.0.1` 肯定就不需要设置代理了。

`all_proxy` 我们通常指定的代理服务器协议是 `socket` ，因为几乎所有的软件都使用该协议进行通信，比如 `curl` （当然，使用 `http` 也是没问题的，只是一种习惯。）。下面是命令示例：

```bash
export all_proxy="socks5://proxy_server:port"
```

而 `no_proxy` 则是按需要设置，比如我想要 `media.ituknown.org` 的所有子域名以及 `localhost` 不走代理就按照如下方式设置即可：

```bash
export np_proxy="*.media.ituknown.org,127.0.0.1,localhost"
```

:::tip
上面命令中的 `protocol` 指的是协议，可以是 `http` 、 `https` 以及 `socks5` 。也就是说，你虽然要配置的是 `https_proxy` 代理，但是代理服务器的协议是任意的。
:::

比如我本机有个代理软件，该软件支持 http、https、socks5 三种协议的代理，对应的协议地址为：

```
socks5://127.0.0.1:10808
http://127.0.0.1:10808
https://127.0.0.1:10808
```

这三种协议都使用本地的10808端口来进行通信，具体在终端上如何使用呢？

### 推荐方式

:::info[Note]
为什么说这个方法推荐使用呢？因为他只作用于当前终端中，不会影响环境，而且比较灵活简单。
:::

直接在在终端执行如下命令即可：

```bash
export http_proxy=http://127.0.0.1:10808
export https_proxy=http://127.0.0.1:10808
export ftp_proxy=http://127.0.0.1:10808
export all_proxy=socks5://127.0.0.1:10808
```

这种方式只是一次生效，当退出 shell 或系统重启之后就失效了。但是每次都执行这几个命令比较麻烦，不能每次使用都执行一次吧？

所以呢，更好的做法是使用 `alias` 命令，将配置写到配置文件中。编辑配置文件，将下面的命令写到配置文件中：

```bash
alias enableproxy='\
export http_proxy=http://127.0.0.1:10808; \
export https_proxy=http://127.0.0.1:10808; \
export ftp_proxy=http://127.0.0.1:10808; \
export all_proxy=socks5://127.0.0.1:10808'

alias disableproxy='unset http_proxy https_proxy ftp_proxy all_proxy'
```

之后使用 `source` 命令使配置立即生效，这样以后即使重启系统也只需要简单的执行下面的命令就好了：

```bash
# 开启代理
$ enableproxy

# 请求 google:
$ curl google.com
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="http://www.google.com/">here</A>.
</BODY></HTML>

# 关闭代理
$ disableproxy

# 再请求 google 试试:
$ curl --connect-timeout 3 google.com
curl: (28) Connection timed out after 3001 milliseconds
```

是不是很简单？

<details open>
<summary>**关于配置文件**</summary>

这个配置文件可以是用户目录下的配置文件（通常是 `~/.profile` ），也可以是系统级别的配置文件（ `/etc/profile` ）。

如果你只想要自己使用的话建议修改用户级别的配置文件即可，但是如果你想要所有登录该系统的用户都能够使用该配置命令（ `enableproxy` 和 `disableproxy` ）那就应该修改 `/etc/profile` 系统级别配置文件。
</details>
