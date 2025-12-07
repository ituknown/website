## 前言

Linux 系统文件 `/etc/shadow` 才真正是用于存储系统用户密码信息的文件（现在操作系统 `/etc/passwd` 文件仅存储账号信息）。该文件存储的数据与 `/etc/passwd` 文件存储的账号信息是一一对应的，即使新建的用户没有 “明确” 设置密码数据，在 `/etc/shadow` 文件中也会有一个对应的密码行配置数据。

Linux 对 `/etc/shadow` 权限设置的权限特别的高，普通用户连查看的权限都没有。你可以使用 `ls -l` 命令查看下 `/etc/shadow` 文件的权限值设置，在 Debian 中你会看到权限是640（`rw-r-----`）：

```bash
$ ls -l /etc/shadow
-rw-r----- 1 root shadow 1265 Nov 30 16:15 /etc/shadow
```

但是在 RHEL/CentOS 你会发现它的权限限制的更绝，居然是 `---------`，如下：

```bash
$ ls -l /etc/shadow
----------. 1 root root 615 Nov 30 17:48 /etc/shadow
```

这也变相的提醒使用者，绝对不能手动去修改 `/etc/shadow` 文件中的内容！你可能会有疑问，在 CentOS 系统中该文件的权限已经是 `---------` 了，用户即使想要修改也没办法啊。

图样图神破，在 Linux 系统中有一个 BUG 一般存在的用户，即 root。root 用户是 Linux 系统中的特殊超级管理员，root 用户在操作系统文件时是可以无视任何文件的权限设置的。

最典型的就是普通用户的 Home 目录，比如在 CentOS 中 Home 目录的权限都是 `rwx------`。普通用户是无权限进入和读取其他用户的数据文件的，但是这对 root 用户是没有任何作用的，所以当使用1 root 用户时一定要格外的注意！

现在，我们来看下这个文件中的数据格式：


## 数据格式

因为 `/etc/shadow` 文件普通用户没有权限查看，所以想要查看该文件内容只能使用 `root` 用户。切换到 `root` 用户后，就可以直接使用 `cat` 等命令查看文件内容了：

```bash
cat /etc/shadow
```

与 `/etc/passwd` 文件内容一样，每一行就是一个用户的密码信息，并且每行的数据格式也是固定的。

数据格式如下（`:` 符号是数据分隔符）：

```
kali:$6$air519$ImP9aw:18940:0:99999:7:7:7:
[--] [--------------] [---] - [---] - - - -
|             |         |   |   |   | | | +-----> 9. Reserved field（保留字段, 当前 Linux 系统还未使用, 不做介绍）
|             |         |   |   |   | | +-------> 8. Account Expiration date（账号失效日期）
|             |         |   |   |   | +---------> 7. Password inactivity period（密码过期宽限日期）
|             |         |   |   |   +-----------> 6. Password warning period（密码过期前 x 天警告信息提示）
|             |         |   |   +---------------> 5. Maximum password age（每隔 x 天必须修改一次密码，否则将会过期）
|             |         |   +-------------------> 4. Minimum password age（密码修改后，x 天内不允许重复修改）
|             |         +-----------------------> 3. Last password change date（密码最近修改时间）
|             +---------------------------------> 2. Encrypted （密码）
+-----------------------------------------------> 1. Username（账号）
```

下面就来具体说下每一个数据的含义：

:::tip
接下来的内容你可以直接使用 `man shadow` 命令查看，而且上面数据格式中的每一列后面的英文释义也都来源于 `man shadow` 对字段的说明。
:::

## 账号

当我们创建一个账号时，就会在 `/etc/shadow` 文件中创建一条对应的密码行数据。比如现在来创建一个新用户 `exampleuser` 看看：

$1.$ 先使用 `id` 命令查看 `exampleuser` 用户是否存在，如果存在的话先使用 `userdel` 命令删除

```bash
$ id exampleuser
id: 'exampleuser': no such user
```

:::info[Note]
如果用户存在的话记得先使用 `userdel -r exampleuser` 命令删除。
:::

$2.$ 创建 `exampleuser` 用户（需要使用 `root` 或具有超级管理员权限的用户，如 `sudo`）

```bash
$ sudo useradd exampleuser
```

$3.$ 查看用户与密码文件

```bash
$ grep exampleuser /etc/passwd /etc/shadow
```

输出结果：

```
/etc/passwd:exampleuser:x:1002:1002::/home/exampleuser:/bin/sh
/etc/shadow:exampleuser:!:18964:0:99999:7:::
            [---------]
                 |
                 +---------------> 用户名是对应的
```

## 密码

密码原本是存在在 `/etc/passwd` 文件中的，不过现代计算机为了安全性而将密码移动到了 `/etc/shadow` 文件中了。而密码在 `/etc/shadow` 文件中是使用加密算法进行加密存储的，比如刚刚创建的 `exampleuser` 的密码数据：

```plaintext
/etc/shadow:exampleuser:!:18964:0:99999:7:::
                        -
                        |
                        +-------> 密码数据
```

刚创建的用户的密码位被 `!` 标识（在某些发行版使用的是 `!!`），表示这个用户处于锁定（或禁用）状态。处于锁定状态的用户是没法进行系统登录的，只有给新用户设置密码后才行进行登录。

需要说明的是，对于刚创建的用户在不同的 Linux 发行版上符号 `!` 有些不同，在 Debian 系列发行版上使用的是 `!`。但是呢，在 RHEL/CentOS 系列上使用的是 `!!`。

这两则表示的是含义相同，而且在 StackExchange 上也有关于这两个之间区别的问题，可以点击链接拜读下大佬的回答：

[StackExchange：Difference between ! vs !! vs * in /etc/shadow](https://unix.stackexchange.com/questions/252016/difference-between-vs-vs-in-etc-shadow)

下面是 RHEL/CentOS 发行版 `!!` 示例：

```bash
$ grep example /etc/shadow
example:!!:18961:0:99999:7:::
```

--

现在使用 `chpasswd` 命令给该用户设置一个简单的密码 `123456`：

```bash
echo "exampleuser:123456" | chpasswd
```

当我们使用 root 用户給 `exampleuser` 用户设置了密码之后再来看下文件中的数据格式：

```
exampleuser:$6$SlPOg$gl8o1ENFVt6:18964:0:99999:7:::
            [------------------]
                     |
                     +------------> 因为密码太长, 省略了一部分
```

你现在看到的就是密码后的密码，这个密码使用的是 `$type$salt$hashed` 数据格式格式。


### 密码数据格式

**`$type$` 指的是密码的加密方式**，有如下几种：

- `$1$` – MD5
- `$2a$` – Blowfish
- `$2y$` – Eksblowfish
- `$5$` – SHA256
- `$6$` – SHA512

比如上面示例中我们给 `exampleuser` 设置的新密码，`$type$` 值是 `$6$`，表示的就是我们的密码 `"123456"` 使用的是 SHA512 算法计算摘要。你可能会奇怪，为什么系统选择的是 SHA512 而不是 MD5 呢？

这个默认的算法其实是在 `/etc/login.defs` 文件中配置的，你可以使用下面的命令查看你自己系统中配置的默认加密算法：

```bash
$ grep ENCRYPT_METHOD /etc/login.defs
ENCRYPT_METHOD SHA512  <=== SHA512
```

如果你想修改为 MD5 就使用 `vim` 编辑下该文件，将 `ENCRYPT_METHOD` 配置修改为你想要的加密方式即可！

另外，为了密码的安全性在计算摘要之前通常还要加盐 **`salt`**，比如上面示例中加的盐就是 `"SlPOg"`（省略后的），最后的 `"hashed"` 才是加盐后的摘要数据（当然是省略后的数据）。

上面是我们大多数情况下的密码，不过有时候你会看到这个密码位置使用的不是 `$type$salt$hashed` 数据格式，而是 `!` 或 `*`。`*` 与 `!` 含义相同，在前面说过了，表示的是当然用户被锁定状态，无法用于系统登录和认证。

除了上面的之外还有一个情况，格式为：`!$type$salt$hashed`，即在正常的密码前面有个 `!`。你只要记住，凡是密码以 `!` 开头的账户都是表示密码处于锁定状态，区别就是有没有设置过密码问题。

还是以 `exampleuser` 用户为例，当前我们已经使用 `chpasswd` 命令给该用户设置了密码。现在就可以使用该用户正常登录系统了（如 `ssh`）：

```bash
$ ssh exampleuser@host
```

接下来呢，我们以 root 用户使用 `passwd` 命令将该用户锁定：

```bash
passwd -l exampleuser
```

现在再来看下密码数据：

```bash
$ grep exampleuser /etc/shadow
exampleuser:!S$6$SlPOg$gl8o1ENFVt6:18964:0:99999:7:::
            [--------------------]
                     |
                     +--------------> 密码前面多了一个 !
```

好了，现在该用户就表示被锁定了。此时你就无法使用 `exampleuser` 用户进行系统的登录了：

```bash
$ ssh exampleuser@172.16.110.128
exampleuser@172.16.110.128's password:
Permission denied, please try again.   <=== 虽然能够输入密码但是响应信息为权限拒绝！
```

不过啊，虽然无法进行系统登录。但是并不妨碍 `root` 用户使用 `su` 命令切换到该用户：

```bash
su - exampleuser
$  <==== 切换到该用户了
```

但是呢，虽然 `root` 用户可以使用 `su` 命令切换。但是普通用户就不行了，毕竟 `root` 是 BUG 一般的存在：

```bash
$ su - exampleuser
Password:
su: Authentication failure   <===== 普通用户认证失败
```


## 密码最近修改时间

第三个数据就是密码的最近修改时间了：

```
exampleuser:$6$SlPOg$gl8o1ENFVt6:18964:0:99999:7:::
                                 [---]
                                   |
                                   +-----> 密码最近修改时间
```

密码最近修改时间这个数据是一个具体的数值，表示的是从 1970.1.1 以来的天数。比如这个示例中的值是 18964，表示的就是 1970.1.1 加上 18964 天后的那个日期：

```
1970.1.1 + 18964 = 2021.12.03
```

也就是说 `exampleuser` 这个用户我们最近一次密码修改日期是在 2021.12.03 这一天。

当你每次修改密码时这个数据也会相应的自动修改，比如当前时间是 2021.12.04。现在我如果去修改这个用户的密码的话，那么这个数值也会发生变化。

使用 `chpasswd` 命令修改下密码：

```
echo "exampleuser:1q2w3e" | chpasswd
```

看下密码数据：

```bash
$ grep exampleuser /etc/shadow
exampleuser:$6$SDUu$1Mh1zVFbA0:18965:0:99999:7:::
                               [---]
                                 |
                                 +----> 最近修改日期
```

现在你再计算下日期（1970.1.1 + 18965）就会发现日期就是 2021.12.04 了~


## 密码下次修改时间限制

同样的，该数据是一个具体的数值，这个数据规定密码修改后必须过指定天数后才能再次修改密码，它的参照物就是上次修改日期。

当它的值为 0 是，表示不做限制，任何时候都可以做修改：

```
exampleuser:$6$SlPOg$gl8o1ENFVt6:18964:0:99999:7:::
                                       —
                                       |
                                       +-----> 下次修改时间
```

上面的 `exampleuser` 是我们新创建的，除了修改它的密码外没有做其他额外的操作。那为什么默认中就是 0 呢？其实这个是在 `/etc/login.defs` 文件中配置的：

```bash
$ grep MIN_DAYS /etc/login.defs
PASS_MIN_DAYS	0
```

你可以使用 root 用户编辑该文件，修改 `PASS_MIN_DAYS` 的值然后新建一个用户测试一下。

还是以 `exampleuser` 用户为例，它的最近修改日期是 2021.12.04，正好是我写这篇博文的时间。因为该用户当前的下次修改时间的值为 0，没有做任何限制所以我是可以随意修改的：

```bash
$ id  <== 下使用 id 命令查看当前登录用户
uid=1002(exampleuser) gid=1002(exampleuser) groups=1002(exampleuser)

$ passwd  <== 修改密码
Changing password for exampleuser.
Current password:
New password:
Retype new password:
passwd: password updated successfully <== 密码修改成功
```

现在我们使用 `chage` 命令来将 `exampleuser` 用户的下次修改时间设置3天后：

```bash
$ sudo chage -m 3 exampleuser
```

:::tip
这个命令需要使用 root 用户或具有超级管理员权限的用户才能执行。
:::

再来看下下次修改时间限制：

```bash
$ grep exampleuser /etc/shadow
exampleuser:$6$0oiUiX$8v6uUu.lJ:18965:3:99999:7:::
                                      -
                                      |
                                      +-----> 下次修改日期限制三天后了
```

现在再次使用 `exampleuser` 修改密码试试：

```bash
$ id
uid=1002(exampleuser) gid=1002(exampleuser) groups=1002(exampleuser)

$ passwd
Changing password for exampleuser.
Current password:
You must wait longer to change your password   <=== 提示需要等一段时间后才能进行修改
passwd: Authentication token manipulation error
passwd: password unchanged
```

是不是很棒？

:::info[注意]
虽然用户自己无法修改密码但是无法阻止 `root` 用户修改该用户的密码，再次说明 `root` 用户是不受系统权限限制的！
:::

## 强制修改密码时间限制

这个就比较牛逼了，这个数据指定每隔指定天数必须要修改一次密码，是不是很实用？

```
exampleuser:$6$0oiUiX$8v6uUu.lJ:18965:3:99999:7:::
                                        [---]
                                          |
                                          +---> 每隔指定天数必须修改一次密码
```

大多数发行版会将该值默认设置为 99999，同样是在 `/etc/login.defs` 配置中设置的：

```bash
$ grep PASS_MAX_DAYS /etc/login.defs
PASS_MAX_DAYS	99999
```

它的基准时间是密码最近修改日期，比如我们将数据设置为 7，就表示每隔七天必须修改一次密码。如果到了第七天之后还不没修改，该账户就会被标识为过期。

我们可以使用 `chage` 命令修改下：

```bash
chage -M 7 exampleuser
```

看下密码配置信息：

```bash
$ grep exampleuser /etc/shadow
exampleuser:$6$0oi$IqThWVs7i4p0bGj/:18965:3:7:7:::
                                            -
                                            |
                                            +----> 以后每隔七天就必须要修改一次密码了
```


## 密码过期前警告提示天数

想一下，如果给某个用户设置了每隔 x 天修改一次密码，但是用户忘记了这个限制怎么办呢？当然是警告提示了。我们可以设置下在过期前 x 天，每次用户登录时都提示该用户即将过期的信息，以便于让用户去修改密码。

系统默认是密码过期前 7 天内会给提示信息：

```
exampleuser:$6$0oi$IqThWVs7i4p0bGj/:18965:3:7:7:::
                                              -
                                              |
                                              +----> 密码过期前7天每次登录给提示信息
```

默认值 7 同样是在 `/etc/login.defs` 配置文件中配置的（如下），如果你想要修改它的默认值只需要修改配置中 `PASS_WARN_AGE` 的值即可。

```bash
$ grep PASS_WARN_AGE /etc/login.defs
PASS_WARN_AGE	7
```

比如当前 `exampleuser` 用户的密码信息是每隔 7 天修改一次密码，并且在过期前7天内会给出警告提示。也就是说，当前 `exampleuser` 就会有提示信息。现在使用 `exampleuser` 登录下系统看看：

```bash
$ ssh exampleuser@172.16.110.128
exampleuser@172.16.110.128's password:
Warning: your password will expire in 7 days   <===== 密码在 7 天后过期
Linux vm 4.19.0-14-amd64 #1 SMP Debian 4.19.171-2 (2021-01-30) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Sat Dec  4 15:21:45 2021 from 172.16.110.1
$
```


## 密码过期宽限日期

密码过期后就立即无法登录了吗？不是的，其实还有一个宽限日期的配置。当然了，这个默认是没有设置的。就表示过期后就失效了~

```
exampleuser:$6$0oi$IqThWVs7i4p0bGj/:18965:3:7:7:::
                                               -
                                               |
                                               +----> 没有值, 过期后就失效
```

不过呢，我们可以用使用 `chage` 等命令给该用户设置一个宽限日期，比如 7 天：

```bash
$ chage -I 7 exampleuser

$ grep exampleuser /etc/shadow
exampleuser:$6$0oiUqBeiX$Iq7x:18965:3:7:7:7::
                                          -
                                          |
                                          +---> 密码过期后有七天宽限日期
```

当密码过期后，在七天内每次登录时都会强制要求你设置新密码，如果不设置就无法登录系统。如果七天后依然没有设置那么账号就会失效，之后你再登录的话就会提示下面的信息：

```
Your account has expired; please contact your system administrator
```

所以这个功能还是还有用的，特别是在某些收费服务上面~


## 账号失效日期

这个比较牛逼了，这个设置直接用于设置账号的失效日期，无视密码的过期配置，即使你的密码没有过期但是账号过期了也无法进行登录的。

密码数据中默认是没有这个设置的，就表示账号不设置失效限制：

```
exampleuser:$6$0oiUqBeiX$Iq7x:18965:3:7:7:7::
                                           -
                                           |
                                           +---> 账号永不失效
```

我们可以使用 `chage` 命令设置一个账号过期日期，比如设置为 `2021-12-31`：

```bash
chage -E 2021-12-31 exampleuser
```

再来看下密码数据：

```bash
$ grep exampleuser /etc/shadow
exampleuser:$6$0oiUGj:18965:3:7:7:7:18992:
                                    [---]
                                      |
                                      +----> 账号失效日期
```

你会发现它会自动将你设置的 `"yyyy-MM-dd"` 日期自动转换为距 1970.1.1 以来的天数，反正到 2021-12-31 这天账号 `exampleuser` 就会过期了~


--

完结，撒花🎉🎉🎉~