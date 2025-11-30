## su 用户身份切换命令

`su` 命令主要用于切换当前登录用户的身份，比如当前 Linux 系统上有两个用户： `ituknown` 和 `kaka` 。在登录系统时你使用的是 `ituknown` 用户，当你登录成功之后如果想要切换到 `kaka` 这个用户该怎么办呢？

通常的做法是先登出（ `logout` ），然后再使用 `kaka` 这个用户登录即可！但是呢，Linux 系统了一个更方便的命令 `su` ，可以实现在不登出的情况下随意切换当前用户身份！

现在看下 `su` 命令的常用语法参数：

```bash
su [- [USER] | -l USER] [-c COMMAND]

说明:

-  : 如果单纯的使用 - 不加任何用户表示切换到 root 用户身份. 如果后面加了 USER 表示切换到指定用户.
-l : 该参数与 - 含义相同, 唯一不同的是 -l 后面必须跟要切换的用户
-c : 以交互的方式执行单条命令
```

`su` 命令其实与 `/etc/passwd` 文件有关。我们都知道，当一个用户登录成功后通常都会有一个默认 SHELL（如果在创建用户时指定的话），比如我当前的 `ituknown` 用户，该用户的默认 SHELL 就是 `/bin/bash` ：

```bash
$ id
uid=1000(ituknown) gid=1002(ituknown) groups=1002(ituknown),24(cdrom),25(floppy),27(sudo),29(audio),30(dip),44(video),46(plugdev),109(netdev),113(bluetooth),119(scanner),998(admin)

$ echo $SHELL
/bin/bash
```

其实该用户的默认 SHELL 就配置在 `/etc/passwd` 文件中：

```bash
$ sudo cat /etc/passwd | grep ituknown
ituknown:x:1000:1002:ituknown:/home/ituknown:/bin/bash
```

当然了，默认 SHELL 是可以修改的，可以参考下 [用户管理#登录 Shell](./用户管理.md#登录-shell)

之说以这里会说下默认 SHELL 是因为当我们使用 `su` 命令切换用户身份时其实会重新加载要切换用户的 SHELL 环境。这个其实很好理解，正常来说，我登录系统的用户是 `ituknown` ，那么我的 HOME 环境变量就是 `/home/ituknown` 。结果当我切换到 root 用户后环境变量就变了：

```bash
$ echo $HOME # 当前用户的 HONE 环境变量
/home/ituknown

$ su - # 切换到 root
Password:

# echo $HOME ## 在看下 HOME 环境变量
/root
```

所以， `su` 命令会重新加载指定用户的 SHELL 环境！

`su` 命令使用起来很简单，到这里基本上该说得都说了，来看下简单的示例：

**切换到 root 用户：**

```bash
su -
# 或
su - root
# 或
su -l root
```

**切换到指定用户（如 kaka）：**

```bash
su - kaka
# 或
su -l kaka
```

**使用交互的方式执行单条命令：**

```bash
su -c "ls"
```

`-c` 参数其实特别有意思，可以以指定的用户来执行单条命令。比如在 Debian 发行版的 Linux 系统上，想要执行 docker 命令其实需要超级管理员权限：

```bash
$ docker image ls
Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.24/images/json": dial unix /var/run/docker.sock: connect: permission denied
```

但是呢，我可以借助 root 用户身份来执行该命令：

```bash
$ su - -c "docker image ls"
Password:
REPOSITORY           TAG              IMAGE ID       CREATED         SIZE
whyour/qinglong      latest           72ca611211dc   3 weeks ago     455MB
ffmpeg               latest           c87d5eb54dcf   3 weeks ago     380MB
yt-dlp               latest           5e79839139af   3 weeks ago     150MB
ubuntu               latest           825d55fb6340   2 months ago    72.8MB
gitlab/gitlab-ce     14.7.5-ce.0      a64261d15ccb   3 months ago    2.39GB
mysql                5.7              11d8667108c2   3 months ago    450MB
openjdk              8-jdk-buster     e512716a5569   4 months ago    514MB
```

是不是很 nice？

## sudo 命令

相比较与 `su` 命令，在实际使用中更多的还是使用 `sudo` 命令。 `su` 命令的缺点是必须切换到指定用户才能执行命令，而 `sudo` 命令则不同，可在不切换用户的情况下执行单条命令。

不过 `sudo` 命令不是每个 Linux 发行版都默认安装，所以如果你当前系统上没有该命令的话需要先安装才行。说到这里就要特别推荐一个属于 Linux 玩家的网站了：[command-not-found.com](https://command-not-found.com)。该网站专门用于查找命令，并提示你每个主流的 Linux 发行版该如何安装你所查询的命令。

[https://command-not-found.com/sudo](https://command-not-found.com/sudo)

安装完成之后还不能直接使用，我们还需要将用户加到 `/etc/sudoers` 配置文件中才行。该配置文件数据格式如下：

```bash
[%]root	 ALL=(ALL:ALL)  [NOPASSWD:]  ALL
[-----]  [-] [-------]  [---------]  [-]
   |      |      |           |        |
   |      |      |           |        +-------> 可执行的命令, 默认 ALL
   |      |      |           +----------------> 免密(可选)
   |      |      +----------------------------> 可切换的身份, 默认 ALL
   |      +-----------------------------------> 登陆者来源主机名, 默认 ALL
   +------------------------------------------> 使用者账号, 如果是组需要在前面加上 %
```

想要编辑该配置文件必须要使用 root 用户才行：

```bash
vim /etc/sudoers
# 或
visudo
```

比如我想将我当前用户 `ituknown` 加到 `sudo` 配置文件中：

```bash
ituknown	ALL=(ALL:ALL) ALL
```

之后想要执行任何管理员命令，只需要在前面加上 `sudo` 前缀就好了，比如查看密码文件：

```bash
$ sudo cat /etc/shadow
```

不过当我们回车后提示我们需要输入当前用户的命令才能继续执行，看起来比较烦。如果想要每次执行命令时都能免密执行，只需要在配置文件中加上 `NOPASSWD:` 就好了，如下：

```bash
ituknown	ALL=(ALL:ALL) NOPASSWD: ALL
```

另外，如果存在多个用户需要执行管理员命令场景的话，每次编辑 `sudoers` 配置文件也比较烦。所以更好的做法是使用用户组，比如创建一个 `supers` 用户组：

```bash
groupadd supers
```

之后将该组加到配置文件中即可：

```bash
%supers	ALL=(ALL:ALL) ALL

# 如果想要该组下的用户免密执行, 就加上 NOPASSWD:
%supers	ALL=(ALL:ALL) NOPASSWD: ALL
```

之后我们只需要将需要执行管理员命令的用户加到该组下就好了，比如将用户 `ituknown` 加入到该组（ `supers` ）：

```bash
sudo groupmems -g supers -a ituknown
```

:::tip
实际上默认已存在一个名为 `sudos` 的用户组，完全不需要再创建 `supers` 用户组，直接使用 `sudos` 组即可！
:::

--

🎉🎉🎉🎉~