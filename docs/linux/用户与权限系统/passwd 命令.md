## 前言

`passwd` 命令主要用户修改账号密码，该命令在平时使用时主要有如下两种形式语法：

$1.$ 修改自己的密码：

```bash
passwd
```

这种语法不加任何参数，用于修改当前账号的密码，也是平时使用最多的命令方式！

$2.$ 修改指定用户密码：

```bash
sudo passwd [options] [username]
```

这个语法只有具有超级管理员权限的用户才能使用（一般指的就是 `root` 用户），因为该语法用于给其他用户修改密码，所以在使用时一定要注意千万不能省略 `[username]` 参数。如果省略了该参数就变成了修改超级管理员自己的密码了。

实际上第二种语法在平时使用的不过，也不推荐使用，因为这种语法就是管理员修改其他用户的密码，使用起来效率及其底下。如果你真的想给其他用户修改密码，那我推荐你使用 [chpasswd命令](./chpasswd%20命令与批量创建账户.md)。

当然了，这里还是简单的介绍下的。

下面是部分可选参数说明，当然了还有其他的可选参数，如修改密码有效期。但本文不会介绍，因为修改账号密码的过期时间更推荐使用 [chage 命令](./chage%20命令.md)。

主要可选参数如下：

```plaintext
-e,--expire                  设置密码立即过期
-d,--delete                  删除指定账号密码
-l,--lock                    锁定账号
-u,--unlock                  取消锁定账号
-S,--status                  当前账号的密码状态
```

下面来具体说下使用方式：

## 修改当前账号密码

这个使用起来比较简单，直接在终端输入如下命令即可，不需要加任何参数：

```bash
$ passwd
```

因为是修改自己的账号密码，所以不需要加什么权限设置。回车后需要你先输入当前密码，之后才能设置新密码。下面是示例：

```bash
$ passwd
Changing password for xiaoming.
Current password:                         # 先输入当前密码进行确认
New password:                             # 输入新密码
Retype new password:                      # 再次输入新密码进行确认
passwd: password updated successfully     # 密码修改成功
```

需要注意，大多数 Linux 发行版都会设置密码强度校验，如果你设置的新密码太过简单（如 123456）是无法通过的。示例：

```bash
$ passwd
Changing password for xiaoming.
Current password:
New password:
Retype new password:
Password unchanged      # 设置的新密码太简单, 没有执行修改
```

这个就是普通用户可直接使用的形式，接下来会介绍下具体的可选参数：

## 设置密码立即过期/首次登录强制修改密码（Only Root）

这个在实际使用中一般时用于强制修改密码使用。如创建一个新账号并设置了初始密码，然后就可以使用该参数使密码立即过期来达到首次登录时修改密码的目的。

参数如下：

```plaintext
-e,--expire                  设置密码立即过期
```

使用时语法如下：

```bash
$ sudo passwd -e [username]
```

以 `xiaoming` 为例，先看下该账号的密码状态：

```bash
$ sudo chage -l xiaoming
Last password change                                : 12月 19, 2021
Password expires                                    : never
Password inactive                                   : never
Account expires                                     : never
Minimum number of days between password change      : 0
Maximum number of days between password change      : 99999
Number of days of warning before password expires   : 7
```

现在使用 `-e` 参数使密码立即过期：

```bash
$ sudo passwd -e xiaoming
passwd: password expiry information changed.    ## 设置成功了
```

再来看下密码信息：

```bash
$ sudo chage -l xiaoming
Last password change                                : password must be changed(强制必须修改密码)
Password expires                                    : password must be changed(强制必须修改密码)
Password inactive                                   : password must be changed(强制必须修改密码)
Account expires                                     : never
Minimum number of days between password change      : 0
Maximum number of days between password change      : 99999
Number of days of warning before password expires   : 7
```

下次用户 `xiaoming` 再登录时就要必须修改一下密码了。示例：

```bash
$ su - xiaoming   # 切换到 xiaoming
Password:
You are required to change your password immediately (administrator enforced) # 提示密码过期了, 要求修改
Changing password for xiaoming.  # 自动进入修改密码步骤
Current password:
New password:
Retype new password:
```

怎么样，这个在实际中是不是特别有用？

## 删除指定账号密码（Only Root）

删除一个账号的密码使用下面的参数即可：

```
-d,--delete                  删除指定账号密码
```

在使用时语法如下：

```bash
$ sudo passwd -d [username]
```

以前面的账号 `xiaoming` 为例，先看下该账号的密码数据：

```bash
$ sudo grep xiaoming /etc/shadow
xiaoming:$6$WKvc2sZ9ZLzkJruS$p2EArVCOvDO92U88Sz/Z/G5/4rUiplnS:18980:0:99999:7:::
         [--------------------------------------------------]
                               |
                               +--------------------------------------> 密码
```

现在删除该账号的密码：

```bash
$ sudo passwd -d xiaoming
passwd: password expiry information changed.     # 密码删除成功
```

再来看下密码数据：

```bash
$ sudo grep xiaoming /etc/shadow
xiaoming::18980:0:99999:7:::
```

好了，现在密码就被删掉了。现在就无法再使用该账号进行 SSH 登录了~

## 锁定账号（Only Root）

这个功能在 `usermod` 命令中也有，就是用于锁定账号，禁止登录。而它所执行的操作就是在 `/etc/shadow` 的密码位前面加个 `!`，可以看到 [系统密码信息存储文件 /etc/shadow](./系统密码信息存储文件%20shadow.md)。

参数如下：

```plaintext
-l,--lock                    锁定账号
```

命令语法如下：

```bash
$ sudo passwd -l [username]
```

执行示例：

$1.$ 先看下当前密码数据：

```bash
$ sudo grep xiaoming /etc/shadow
xiaoming:$6$BBwRa1KzL1S9Wo8E$iGNnWd2niwrRGiO2hisb4AN8G7nmU5JGrMxRi7Fam.UYpNSPfX1SdzCBJcKVak4gjELIzrr4VggTJBamHZDr5/:18980:0:99999:7:::
```

$2.$ 锁定账号：

```bash
$ sudo passwd -l xiaoming
passwd: password expiry information changed.
```

$3.$ 再看下密码数据：

```bash
$ sudo grep xiaoming /etc/shadow
xiaoming:!$6$BBwRa1KzL1S9Wo8E$iGNnWd2niwrRGiO2hisb4AN8G7nmU5JGrMxRi7Fam.UYpNSPfX1SdzCBJcKVak4gjELIzrr4VggTJBamHZDr5/:18980:0:99999:7:::
```

可以看到密码前面多了个 `!`，表示被锁定了。现在就无法使用该账号登录系统了~

:::info[注意]
密码被锁定确实无法再使用账号密码登录，但是不代表超级管理员用户（`root`）不能使用 `su` 命令切换！
:::

## 取消锁定账号（Only Root）

既然能锁定肯定就有取消锁定了，参数如下：

```
-u,--unlock                  取消锁定账号
```

示例：

```bash
$ sudo passwd -u xiaoming
```

## 查看密码状态

这个在实际中没人会使用该参数去查看密码数据，因为不够详细。基本上都会使用 `chage` 命令去查看密码状态。

参数如下：

```
-S,--status                  当前账号的密码状态
```

使用示例：

```bash
$ sudo passwd -S xiaoming
xiaoming L 12/19/2021 0 99999 7 -1
```

可以看到输出的信息如果不研究下 `/etc/shadow` 文件完全不理解啥意思，所以呢一般会使用下面的命令代替：

```bash
$ chage -l xiaoming
```

输出示例：

```
Last password change                                : 12月 19, 2021
Password expires                                    : never
Password inactive                                   : never
Account expires                                     : never
Minimum number of days between password change      : 0
Maximum number of days between password change      : 99999
Number of days of warning before password expires   : 7
```

这回是不是一目了然了？

--

完结，撒花🎉🎉🎉~
