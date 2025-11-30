## 前言

`chage` 命令的全称是 change user password expiry information。它主要用于修改密码的相关时间数据，如密码的最近修改时间、过期时间、过期前警告天数等等。

`chage` 命令使用虽然很简单，但是想要理解原理还需要去了解下 `/etc/shadow` 密码文件的数据存储格式，这里不过说明，可以参考下 [系统密码信息存储文件/etc/shadow](系统密码信息存储文件%20shadow.md)，这里就简单下看下基本的数据存储格式以及每个位置存储的数据信息。

`/etc/shadow` 文件中的数据虽然看起来杂乱无章，但是每一行都严格按照下面的数据格式存储：

```plaintext
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

而 `chage` 命令主要修改的就是 3~8 这几个数据。下面是它的可选参数：


```plaintext
-l,--list                    列出密码相关日期数据
-i,--iso8601                 使用 YYYY-MM-DD 输出日期格式

-d,--lastday                 设置密码最近修改日期, YYYY-MM-DD 日期格式
-m,--mindays                 密码修改后, 指定天数内不允许再次修改密码
-M,--maxdays                 设置每隔指定天数必须修改一次密码

-W,--warndays                密码过期前 x 天开始提示警告信息
-I,--inactive                设置密码过期后宽限时间, 指定具体的天数
-E,--expiredate              设置密码的过期日期, YYYY-MM-DD 日期格式
```

在说明之前先来创建一个示例账号，用于之后的演示说明：

```bash
$ sudo useradd -s /usr/bin/bash -m exampleuser
```

## 查看密码相关日期信息

查看密码相关年龄信息直接使用 `-l` 参数即可：

```bash
$ sudo chage -l [username]
```

示例：

```bash
$ sudo chage -l exampleuser
Last password change                                : 12月 19, 2021
Password expires                                    : never
Password inactive                                   : never
Account expires                                     : never
Minimum number of days between password change      : 0
Maximum number of days between password change      : 99999
Number of days of warning before password expires   : 7
```

很显然，直接使用 `-l` 参数输出的信息看起来不太好理解，所以对于日期我们可以指定以 `YYYY-MM-DD` 格式进行输出。加上参数 `-i` 即可：

```bash
$ sudo chage -li exampleuser
Last password change                                : 2021-12-19
Password expires                                    : never
Password inactive                                   : never
Account expires                                     : never
Minimum number of days between password change      : 0
Maximum number of days between password change      : 99999
Number of days of warning before password expires   : 7
```

现在看起来就舒服多了~

## 设置密码的最近修改日期

这个通常用不到，谁没事去修改这个日期呢？比如刚刚创建的账号，它的最近修改日期是 `2021-12-19`。我们可以只用 `-d` 参数进行修改：

```
-d,--lastday                 设置密码最近修改日期, 日期格式为 YYYY-MM-DD
```

比如我想将最近修改日期设置为 2020-01-01：

```bash
$ sudo chage -d 2020-01-01 exampleuser
```

再来看下相关日期数据：

```bash
$ sudo chage -li exampleuser
Last password change                                : 2020-01-01 ## 最近修改日期
Password expires                                    : never
Password inactive                                   : never
Account expires                                     : never
Minimum number of days between password change      : 0
Maximum number of days between password change      : 99999
Number of days of warning before password expires   : 7
```

现在是不是变了？另外呢，我们还可以查看下 `/etc/shadow` 中记录的最近修改日期：

```bash
$ sudo grep exampleuser /etc/shadow
exampleuser:!:18262:0:99999:7:::
```

在这个数据里记录的数据是 $18262$，也就是从 $1970.1.1$ 开始往后计算的天数，你计算后机会发现：

$$
1970.1.1 + 18262 = 2020.1.1
$$

当然了，修改这个日期确实有点无聊。但是呢他有个作用，就是用于重置密码，比如说首次登录强制修改密码就可以通过这个参数设置。怎么设呢？将值设置为 0 即可！看下示例：

```bash
$ sudo chage -d 0 exampleuser

# 看起日期数据
$ sudo chage -li exampleuser
Last password change                                : password must be changed # 要求强制修改
Password expires                                    : password must be changed
Password inactive                                   : password must be changed
Account expires                                     : never
Minimum number of days between password change      : 0
Maximum number of days between password change      : 99999
Number of days of warning before password expires   : 7
```

之所以这样的原因就是因为这个账号的密码信息中有每隔 99999 天必须强制修改一次密码，现在我们直接将密码的最近修改时间设置为0了，就表示过期了。因此呢就会触发这个条件了~

虽然说这个参数有这个作用但是想要设置强制修改密码更推荐使用 `passwd` 的日期过期参数来实现，可以参考下 [passwd 命令](./passwd%20命令.md#设置密码立即过期首次登录强制修改密码only-root)。


## 限制指定天数内不允许重复修改密码

想要限制密码在指定天数内不允许重复修改密码可以只用 `-m` 参数：

```
-m,--mindays                 密码修改后, 指定天数内不允许再次修改密码
```

命令示例：

```bash
$ sudo chage -m 7 exampleuser
```

这个就表示密码修改后 7 天内不允许重复修改密码了。看下日期数据：

```bash
$ sudo chage -li exampleuser
Last password change                                : password must be changed
Password expires                                    : password must be changed
Password inactive                                   : password must be changed
Account expires                                     : never
Minimum number of days between password change      : 7 # 密码修改后 7 天内不允许重复修改
Maximum number of days between password change      : 99999
Number of days of warning before password expires   : 7
```

## 设置每隔指定天数必须修改密码

这个可以使用 `-M` 参数设置：

```
-M,--maxdays                 设置每隔指定天数必须修改一次密码
```

需要说明的是，如果密码到这个日期后还没有修改密码，那么这个密码就会进入过期状态，它的默认值是 99999。

命令示例：

```bash
$ sudo chage -M 30 exampleuser
```

这就表示每隔 30 必须修改一次密码了，看下结果：

```bash
$ sudo chage -li exampleuser
Last password change                                : password must be changed
Password expires                                    : password must be changed
Password inactive                                   : password must be changed
Account expires                                     : never
Minimum number of days between password change      : 7
Maximum number of days between password change      : 30 # 每隔 30 天必须修改一次密码
Number of days of warning before password expires   : 7
```

## 设置密码过期警告

这个很重要，比如当前时间是 2021.1.1，我设置的密码修改时间间隔是 30 天。就表示到 2021.1.31 这一天我的密码就会过期了。

我们可以设置过期前 x 天内开始提示修改密码，比如我设置 7 天就表示到 2021.1.23 这一天就开始提醒修改密码了。

设置警告天数使用下面的参数：

```
-W,--warndays                密码过期前 x 天开始提示警告信息
```

为了演示我先将密码重置下：

```bash
$ echo "exampleuser:123456" | sudo chpasswd
```

同时将密码修改间隔设置为 30 天，但是将警告提醒设置为 40 天，这样就会每次修改密码后就又开始提醒了，当然这里仅仅是演示说明：

```bash
$ sudo chage -m 0 -M 30 -W 40 exampleuser

# 看下日期数据
$ sudo chage -li exampleuser
Last password change                                : 2021-12-19
Password expires                                    : 2022-01-18
Password inactive                                   : never
Account expires                                     : never
Minimum number of days between password change      : 0
Maximum number of days between password change      : 30
Number of days of warning before password expires   : 40
```

现在使用 `su` 命令测试下：

```bash
$ su - exampleuser
Password:
Warning: your password will expire in 30 days # 警告提醒
$
```

## 设置面过期宽限日期

正常来说，密码过期后就无法使用了。但是我们可以设置一个宽限日期，即过期后指定天数内还可以登录，但是每次登录都会强制要求修改密码。如果过了宽限日期后还没修改密码，那么这个账号就会被系统禁用了。

是指宽限日期使用下面的参数即可：

```
-I,--inactive                设置密码过期后宽限时间, 指定具体的天数
```

比如我设置宽限日期为 30 天：

```bash
$ sudo chage -I 30 exampleuser
```

## 设置账号失效日期

这个参数更加强制！这个参数是直接设置账号的失效日期，达到这一天后即使密码还没过期这个账号也无法使用了。默认情况下 Linux 系统不会设置这个日期，比如之前输出的示例中它的值都是 never！

设置账号的失效日期使用下面的参数即可：

```
-E,--expiredate              设置密码的过期日期, YYYY-MM-DD 日期格式
```

比如设置账号过期时间为 2022-01-01，命令示例如下：

```bash
$ sudo chage -E 2022-01-01 exampleuser
```

看下日期信息：

```bash
$ sudo chage -li exampleuser
Last password change                                : 2021-12-19
Password expires                                    : 2022-01-18
Password inactive                                   : 2022-02-17
Account expires                                     : 2022-01-01 # 账号失效日期
Minimum number of days between password change      : 0
Maximum number of days between password change      : 30
Number of days of warning before password expires   : 40
```

另外，也可以看下 `/etc/shadow` 中记录的修改后的数据：

```bash
$ sudo grep exampleuser /etc/shadow
exampleuser:$6$NzhmulcZaAj/lsM7$r51NOmDXf6oGMqKRiE6C4PZwY5H9VsyO0Ue/6HnaVPs5Ysqu7imVL.QHccTdmACsF911gtVsRoo0ZsU9Tg1Tp/:18980:0:30:40::18993:
```

可以看到账号失效日期是一个数值 18993，表示的是天数。它的计算方式是从 1970.1.1 开始计算：

$$
1970.1.1 + 18993 = 2022.1.1
$$

--

完结，撒花🎉🎉🎉~