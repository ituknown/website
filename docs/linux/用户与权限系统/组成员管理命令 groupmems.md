## 前言

`groupmems` 命令用于管理组成员。可以向指定组添加成员，删除指定组内的某个成员。该命令语法如下：

```bash
groupmems -g [group] [-ad] [user]

groupmems -g [group] [-lp]
```

下面是可选参数说明：

```
-g,--group:   指定具体组，可以是 GID 也可以是组的名称。

-a,--add:     向指定组添加成员，可以是 UID 也可以是名称
-d,--delete:  删除组内的某个成员，可以是 UID 也可以是名称
-l,--list:    列出指定组内所有成员
-p,--purge:   清空组内的所有成员
```

|**Note**|
|:-------|
| `groupmems` 命令数据超级管理员权限命令，普通用户无法使用。|

## 添加组成员

先创建一个组 `examplegroup` ：

```bash
$ sudo groupadd examplegroup
```

我当前操作环境有一个用户 `webuser` ，信息如下：

```bash
$ id webuser
uid=1001(webuser) gid=1001(webuser) groups=1001(webuser)
```

现在将该用户添加到组 `examplegroup` 中：

```bash
$ sudo groupmems -g examplegroup -a webuser
```

|**注意**|
|:------|
|回车后需要输入管理员命令进行确认！|

再来看下用户 `webuser` 信息：

```bash
$ id webuser
uid=1001(webuser) gid=1001(webuser) groups=1001(webuser),1003(examplegroup)
```

同时也可以直接使用 `-l` 参数看下当前组成员：

```bash
$ sudo groupmems -g examplegroup -l
webuser
```

--

**groupmems: PAM: Authentication failure？**

我在 Ubuntu 中遇到这这个问题，当向组 `examplegroup` 添加成员时提示输入密码确认：

```bash
$ sudo groupmems -g examplegroup -a webuser
Password:
```

当输入密码回车后却提示：

```
groupmems: PAM: Authentication failure
```

原因是因为 Ubuntu 系统没有设置有效的 root 账户，我们在装系统时通常会要求设置一个超级管理员账号（可用于执行 `sudo` 命令）。但 Ubuntu 仅仅是创建一个超级管理员账号，并没有设置 `root` 的密码。如果你查看 `/etc/shadow` 文件的 root 密码信息你会发现是一个 `!` 符号：

```bash
$ sudo grep root /etc/shadow
root:!:18965:0:99999:7:::
```

所以当我们执行 `groupmems` 命令输入密码确认后自然会提示认证失败。解决方式就是给 root 设置一个密码即可：

```bash
$ sudo passwd root
```

之后再执行，输入密码后就没问题了：

```bash
$ sudo groupmems -g examplegroup -a webuser
## or
$ su - -c "groupmems -g examplegroup -a webuser"
```

## 查看组成员

这个简单，使用 `-l` 参数即可，以刚刚创建的组 `examplegroup` 为例：

```bash
$ sudo groupmems -g examplegroup -l
```

回车后就会输入刚刚添加的用户了~

## 删除组成员

使用方式与添加成员一个，换个参数即可。比如将刚刚添加的用户 `webuser` 从组 `examplegroup` 中删掉：

```bash
$ sudo groupmems -g examplegroup -d webuser
```

再看下用户信息：

```bash
$ id webuser
uid=1001(webuser) gid=1001(webuser) groups=1001(webuser)
```

## 清空组内所有成员

这个就比较暴力了，在执行该命令时一定要进行确认才行。以组 `examplegroup` 为例：

```bash
$ sudo groupmems -g examplegroup -p
```

当然了，现在组内内啥成员，所以先添加几个再来测试：

```bash
$ sudo groupmems -g examplegroup -a webuser
$ sudo groupmems -g examplegroup -a kali
$ sudo groupmems -g examplegroup -l
webuser  kali
```

再来执行情况成员命令测试下：

```bash
$ sudo groupmems -g examplegroup -p
$ sudo groupmems -g examplegroup -l
```

--

完结，撒花🎉🎉🎉~