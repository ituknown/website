## 前言

在日常工作中我们或许会有批量创建系统用户的需求，这个应该不多见，但是肯定会有给新入职的同学创建账号的需求。如果单独的只是批量创建账户很简单，直接写一个脚本即可，在脚本中使用 `useradd` 命令就可以创建了。

但是，新创建的用户是没法直接用于系统登录的，因为没有设置密码，此时的账户密码处于锁定状态：

```bash
# 新建用户
$ sudo useradd webuser

# 查看密码数据
$ sudo grep webuser /etc/shadow
webuser:!:18966:0:99999:7:::
        -
        |
        +-----> 密码处于锁定状态
```

因为是一个新用户，还没有设置密码，所以密码位置被 `!` 符号标识。那你可能会有疑问了，直接使用下面的命令给新创建的用户设置密码不就好了？

```bash
$ sudo passwd webuser
```

图样图神破，使用 `passwd [user]` 命令效率低下不说，而且还需要二次确认密码才行。如果有大批量的账户你还能淡定的一个一个的是执行 `passwd [user]` 命令？而且，我们通常都会给新用户一个设定：**首次的登录必须需改密码**！

既然有这种设定在设置密码时我们需要这么麻烦吗？所以呢，这里就来介绍一个给超级管理员使用的命令：`chpasswd`。


## 使用 chpasswd 命令修改账户密码

:::info[注意]
需要特别强调一点，`chpasswd` 命令是只有超级管理员用户才有权限使用，普通用户是无法使用的。因为 `chpasswd` 命令涉及到 `/etc/shadow` 文件的操作，而该文件普通用户是没有读写权限的！
:::

`chpasswd` 命令很好记，这个命令就是 change password 的缩写。`chpasswd` 命令语法如下：

```bash
echo "username:newpasswd" | sudo chpasswd [-c]
```

如果需要给多个用户设置密码可以使用下面的形式。一个用户占一行，格式为：`username:newpasswd`，之后使用 `ctrl + d` 结束输入即可：

```bash
$ sudo chpasswd [-c]
username1:newpasswd
username2:newpasswd
```

或者直接从文件中读取账号的新密码信息：

```bash
$ cat employee.txt
username1:newpasswd
username2:newpasswd

$ sudo chpasswd < employee.txt
```

因为 `chpasswd` 只有超级管理员才能使用，所以在语法中特别使用了 `sudo` 命令进行了强调。

可选参数 `-c` 指定具体的加密方式，如果你研究过 `/etc/shadow` 文件数据就应该明白这是什么意思。可选的加密方式有：`NONE`、`DES`、`MD5`、`SHA256` 以及 `SHA512`。

重点来了，给用户设置密码时格式必须为：`username:newpasswd`，账户与你要设置的密码之间必须使用 `:` 符号分隔。

在[前言](#前言)中我们创建了一个新用户 `webuser`，现在就来使用 `chpasswd` 命令给该用户设置个密码，简单点，密码就为 123456 吧。如下：

```bash
# 单用户推荐命令形式
$ echo "webuser:123456" | sudo chpasswd

# 多用户写法(如果只给一个用户设置密码不推荐使用这种命令形式)
$ sudo chpasswd
webuser:123456
```

现在再来看下用户 `webuser` 的密码数据：

```bash
$ sudo grep webuser /etc/shadow
webuser:$6$Xmp96fcby8eMYgy0$EQYUEf12.Ss6lMBDetdjHIhcNyAhnxlsy6lDE5bNgEIaa55b2U09HgWA8eu0wlZYpzMuhlzwBVFa4451hvrx40:18966:0:99999:7:::
```

可以看到，现在密码就设置好了，并且加密方式是 SHA256（`$6$`）。

有趣的一点是，Linux 系统为了安全性在修改密码时都会有密码强度校验。如果你是一个普通用户，直接使用 `passwd` 命令修改密码且设置的密码是 123456，那么百分百无法通过的，因为太多简单！

但是为什么使用超级管理员用户就没问题呢？这是因为 `root` 用户是 Linux 计算机中的神！凡是使用 `root` 用户执行的操作都会被放行，因为该 `root` 用户就是系统的主宰者！

怎么样？现在如果再给新用户创建账户是不是就特别简单了？在设置密码时就简单点，默认就是用户的拼音全称就好，或者干脆就设置为 123456。因为使用超级管理员用户设置啥密码都会被通过！

哦，对了。少了一步，我们需要新用户在首次登录时必须修改一次密码！


## 强制首次登录设置新密码

强制首次登录修改密码可以使用 `passwd` 命令（推荐方式）和 `chage` 命令实现，如下：

```bash
sudo passwd -e webuser
```

另外也可以使用 `chage` 命令将密码最近一次修改日期重置为 0 来达到下次登录强制修改密码的目的：

```bash
$ sudo chage -d 0 webuser
```

再来看下用户 `webuser` 的密码信息：

```bash
$ sudo chage -l webuser
Last password change                                  : password must be changed  # <== 强制密码必须修改
Password expires                                      : password must be changed  # <== 强制密码必须修改
Password inactive                                     : password must be changed  # <== 强制密码必须修改
Account expires                                       : never
Minimum number of days between password change        : 0
Maximum number of days between password change        : 99999
Number of days of warning before password expires     : 7
```

好了，现在当新用户登录时就会强制设置新密码了。下面是在 Debian Buster 上的示例：

```
$ ssh webuser@172.16.110.128
webuser@172.16.110.128's password:   <==== 输入超级管理员设置的初始密码 123456 就可以登陆了
You are required to change your password immediately (administrator enforced)
Linux vm 4.19.0-14-amd64 #1 SMP Debian 4.19.171-2 (2021-01-30) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
WARNING: Your password has expired.  <==== 登录成功后提示密码过期, 强制设置新密码
You must change your password now and login again!
Changing password for webuser.
Current password:        <===== 输入初始密码 123456 进行确认
New password:            <===== 设置新密码
Retype new password:     <===== 确认新密码
passwd: password updated successfully
Connection to 172.16.110.128 closed.  <=== 密码设置成功, 自动登出
```

怎么样？是不是很棒？


## 使用 passwd 命令修改账户密码（Only RHEL/CentOS）

在 RHEL/CentOS 发行版中，`passwd` 有一个可选参数可用于从标准输入流中读取密码数据，我们可以利用该参数达到与 `chpasswd` 命令的目的。


CentOS 中 `passwd` 命令参数介绍（`passwd --help`）：

```
Usage: passwd [OPTION...] <accountName>
  -k, --keep-tokens       keep non-expired authentication tokens
  -d, --delete            delete the password for the named account (root only)
  -l, --lock              lock the password for the named account (root only)
  -u, --unlock            unlock the password for the named account (root only)
  -e, --expire            expire the password for the named account (root only)
  -x, --maximum=DAYS      maximum password lifetime (root only)
  -n, --minimum=DAYS      minimum password lifetime (root only)
  -w, --warning=DAYS      number of days warning users receives before password expiration (root only)
  -i, --inactive=DAYS     number of days after password expiration when an account becomes disabled (root only)
  -S, --status            report password status on the named account (root only)
  --stdin                 read new tokens from stdin (root only, RHEL/CentOS)
```

注意看最后一个可选参数 `--stdin`，这就是这里要说的主角。使用该参数的语法如下：

```bash
$ sudo echo "newpasswd" | passwd --stdin <account_name>
```

比如我们想要给之前创建的 `webuser` 设置初始密码 123456 就可以直接使用下面的命令：

```bash
$ sudo echo "123456" | passwd --stdin webuser
```

当然了，虽然 `passwd` 的 `--stdin` 参数很好用，但是仅仅只有 RHEL/CentOS 系列发行版才有这个可选参数。

在 StackOverflow 上就有这个疑问，可以参考下：

[passwd: unrecognized option '--stdin' error on Debian when I run my created Bash Script](https://stackoverflow.com/questions/54382242/passwd-unrecognized-option-stdin-error-on-debian-when-i-run-my-created-bash)

所以对于 Debian/Ubuntu 系列的用户来说还是老老实实用 `chpasswd` 命令去吧~


## 批量创建用户脚本示例

最后，给一个简单的批量创建用户的脚本示例：

```bash
#!/bin/bash

set -e

# 账户文件
infile=$1
echo "read account from "$infile

# 输出文件
outfile=$2
echo "write account password to "$outfile

# infile 和 outfile 请自行校验, 这里仅是示例

while read -r u; do

    # 使用 openssl 随机生成一个base64 字符, 长度为9的字符串作为的密码
    pass=$(openssl rand -base64 8 | cut -c 1-9)

    # 创建用户并设置密码
    useradd $u && echo "$u:$pass" | chpasswd

    # 将账户与密码输入到文件
    echo User:$u Passwd:$pass | tee -a $outfile

done <$infile
```

来，测试一下：

```bash
$ sh createusers.sh ./employee.txt ./out/txt
```

其中 `employee.txt` 内容如下：

```
wangerdan
erha
jinmao
```

来执行一波，看下输出结果：

```bash
$ sh createusers.sh ./employee.txt ./out/txt
read account from ./account.txt
write account password to ./pass.txt
User:wangerdan Passwd:RTN8FlnXP
User:erha Passwd:prAvimjwo
User:jinmao Passwd:HH6ejqkWD
```

是不是很赞？

--

完结，撒花🎉🎉🎉~