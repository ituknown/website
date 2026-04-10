## 前言

ACL 的全称是 **file access control lists**。简单粗暴点说就是文件级别的访问控制权限，在具体说明介绍之前先来考虑一下为什么需要 ACL？

现在有个文件，文件属性如下：

```
-rwxrwxr-- 1 webuser example 0 Dec 11 20:54 readme
```

对应的文件权限为：

| **用户** | **权限**     |
| :------- | :----------- |
| 所属者   | 读、写、执行 |
| 所属组   | 读、写、执行 |
| 其他用户 | 读           |


问题来着，我现在想让这 “其他用户” 中的某个用户也具有写的权限该怎么办？显然，单存的还使用传统的用户、组、其他用户去控制是无法实现的，这就需要使用 ACL 了。

ACL 能够抛开传统的权限之外还能够更细粒度的控制某个人对该文件的读写权限，比如想让这 “其他用户” 中的某个用户具有写的权限。同时呢，还能去控制另一个 “其他用户” 有执行的权限。

所以，当你有需要控制用户级别的权限的话，就需要 ACL 了。

ACL 有另两个命令，分别使用户查看 ACL 的权限命令 `getfacl` 以及设置 ACL 权限的 `setfacl` 命令，下面来分别看下：

## getfacl 命令语法说明

`getfacl` 命令是用于查看文件的 ACL 权限，命令比较简单：

```bash
$ getfacl [file|dir]
```

比如刚才的 readme 文件：

```bash
$ getfacl readme
```

输出如下：

```
# file: readme
# owner: webuser
# group: example
user::rw-
group::rw-
other::r--
```

可以看到，在输出的信息中会详细的展示该文件的权限信息。文件名是 `readme`、文件的所属者是 `webuser`、所属组是 `example`，同时会在下面显示具体的文件权限信息。

有趣的一点是，在 RHEL/CentOS 系统中该文件的属性显示如下：

```
-rwxrwxr--. 1 webuser webuser 0 Dec 11 20:53 readme
          -
          |
          +------> 注意这里
```

注意看在权限后面有个 `.`，表示该文件没有设置 ACL 权限，如果设置 ACL 的话这里会是一个 `+`。是不是很友好？

## setfacl 命令语法说明

`setfacl` 设置 ACL 权限命令就比较复杂了。它的语法如下：

```
setfacl [-bdR] [{-m|-x} acl_perms] [file|dir]...
```

**参数说明：**

```
-b: 删除所有 ACL 权限, 恢复为默认权限
-d: 设置为默认权限
-R: 递归执行, 用于文件夹

-m: 修改ACL权限操作
-x: 删除ACL权限操作
```

acl_perms 则是重点，语法如下：

```bash
# 设置文件有效权限
[d[efault]:] m[ask][:] [:rwx]

# 设置用户级别权限
[d[efault]:] [u[ser]:]uid [:rwx]

# 设置组级别权限
[d[efault]:] g[roup]:gid [:rwx]

# 设置其他用户权限
[d[efault]:] o[ther][:] [:rwx]
```

$1.$ `default,d` 与文件夹有关，就是继承的意思。比如创建了一个文件夹，设置 ACL 为 `rw`。但是这个 `rw` 仅仅是针对该文件夹，如果你在文件夹下面再创建一个文件的话，你会发现这个新的文件没有 `rw` 权限。

因为，如果你想让文件夹下的新创建的子文件自动继承 acl 权限的话就需要使用 `default` 参数。

$2.$ `mask,m` 则是文件的有效权限。比如你将某个用户设置的操作权限是 `rwx`，但是该文件的最大权限却是 `rx`。那么该用户实际有效权限不会是 `rwx`，而是 `rx`。意思就是用户的操作权限与文件的有效权限取交集。

$3.$ `user,u` 是指定的具体用户，可以是用户名，也可以是用户的 ID。示例如下：

```plaintext
# 给单一用户设置权限
user:u1:perms

# 给通过用户设置权限
user:u1,u2,u3:perms
```

|**注意**|
|:------|
|`u1`、`u2` 可以是具体的用户名，也可以是 UID。 |

**4）** `group,g` 指定具体的组，可以是组的名称也可以是 ID。示例：

```
group:g1:perms
group:g1,g2,g3:perms
```

|**注意**|
|:------|
|`g1`、`g2` 可以是具体的组名，也可以是 GID。 |

**5）** `other,o` 就是其他用户了，没啥好说的，实际上谁会使用 ACL 去设置其他用户的权限呢？

**6）** `rwx` 就是我们常用的权限值。


## ACL 牛刀小试

现在我们来演示一个简单的栗子，如下：

```bash
# 创建文件
$ touch readme

# 修改所属用于以及所属组
$ sudo chown webuser:example readme

# 查看文件属性信息
$ ls -l
total 0
-rw-r--r-- 1 webuser example 0 Dec 11 21:57 readme
```

继续创建一个用户 `acluser`：

```bash
$ sudo useradd -m -s /usr/bin/bash acluser
```

现在我想让这个 `acluser` 对该文件有读写权限，acl 命令如下：

```bash
$ sudo setfacl -m u:acluser:rw readme
# 或
$ sudo setfacl -m user:acluser:rw readme
```

再来看下文件属性信息：

```bash
$ ls -l
total 0
-rw-rw-r--+ 1 webuser example 0 Dec 11 21:57 readme
          -
          |
          +-------> 注意这里
```

注意看在权限后面有个 `+`，这就表示有 ACL 权限。来看下权限信息：

```bash
$ getfacl readme
```

输出如下：

```bash
# file: readme
# owner: webuser
# group: example
user::rw-
user:acluser:rw-  ## <== 注意这里
group::r--
mask::rw-
other::r--
```

注意看在输出的信息中多了一个用户 `acluser`，同时权限是 `rw`。怎么样，现在是不是就理解怎么回事了？

再来给用户 `kali` 设置为执行权限：

```bash
$ sudo setfacl -m u:kali:x readme
```

来看下 ACL 信息：

```bash
$ getfacl readme

# file: readme
# owner: webuser
# group: example
user::rw-
user:acluser:rw-
user:kali:--x     # <== 又多了一个 kali
group::r--
mask::rwx
other::r--
```

最后，我想删除用户 `acluser` 的 ACL 权限：

```bash
# 使用 -x 参数删除, 不需要加权限值
$ sudo setfacl -x user:acluser: readme

# 查看 ACL 权限信息
$ getfacl readme

# file: readme
# owner: webuser
# group: example
user::rw-
user:kali:--x  # <== 只有 kali 这个用户, 没有 acluser
group::r--
mask::r-x
other::r--
```

需要特别强调了是，ACL 更多的是针对非文件所属者以及所属组，针对的是 “其他用户” 这部分人。

## 给用户设置 ACL 权限

给用户设置权限的语法如下：

```bash
setfacl -m u[ser]:[users...]:[rwx] [file|dir]...
```

`-m` 是 modify 的意思，作用是设置或修改 ACL。

`user` 不能省略（可以直接使用缩写 `u`），用于指定是给用户设置 ACL 权限。之后需要跟具体的用户（可以是用户名也可以是具体的 UID）。特别强调的一点是，可以同时指定多个用户，多个用户之间使用 `","` 分隔。之后就跟具体的权限值 `rwx` 即可。

最后呢，指定具体的文件或文件夹。可以同时指定多个。

下面看下示例：

$1.$ 给用户 `webuser` 设置读写权限：

```bash
$ sudo setfacl -m user:webuser:rw file
```

$2.$ 修改 `webuser` 的权限为只读：

```bash
$ sudo setfacl -m user:webuser:r file
```

$3.$ 同时给多个用户设置读写权限：

```bash
$ sudo setfacl -m user:example1,example2:rwx
```

### ACL 权限继承（文件夹）

语法如下：

```bash
setfacl -m [d[efault]:]u[ser]:[users...]:[rwx] [file|dir]...
```

与之前的示例的区别是，多了一个 `default`（可以直接使用缩写 `d`），这个是针对文件夹的功能。

我们现在看下没有参数 `default` 的情况：

```bash
# 创建文件件
$ mkdir dir

# 给文件夹设置 ACL 权限
$ sudo setfacl -m user:webuser:rw dir
```

查看 ACL 权限：

```bash
$ getfacl dir/

# file: dir/
# owner: kali
# group: kali
user::rwx
user:webuser:rw-
group::rwx
mask::rwx
other::r-x
```

接着创建一个文件：

```bash
$ touch dir/readme
```

看下子文件的 ACL：

```bash
$ getfacl dir/readme

# file: dir/readme
# owner: kali
# group: kali
user::rw-
group::rw-
other::r--
```

很明显，子文件没有继承 ACL 权限。怎么办呢？这个时候就需要 `default` 参数了：

```bash
# 先删除文件夹的 ACL 权限
$ sudo setfacl -b dir
```

现在我们使用 `default` 参数设置 ACL 权限：

```bash
# 使用 default 使权限继承
$ sudo setfacl -m d:user:webuser:rw dir

# 创建子文件
$ touch dir/readme1

## 查看子文件 ACL
$ getfacl dir/readme1
# file: dir/readme1
# owner: kali
# group: kali
user::rw-
user:webuser:rw-    # <== 继承文件夹 ACL 权限
group::rwx			#effective:rw-
mask::rw-
other::r--
```

需要强调了一点是，不是所有的子文件都会继承 ACL。比如下面：

```bash
$ sudo setfacl -m d:user:webuser:rw dir
$ sudo setfacl -m user:kali:rw dir
```

|**注意**|
|:------|
|由于在给 `kali` 用户设置 ACL 权限是没有使用 `default`，所以子文件继承的 ACL 只会包含 `webuser`。但是给用户 `kali` 设置 ACL 权限时没有指定 `default` 进行权限继承，所以子文件中就不包含该用户的 ACL 权限值，这个需要特别注意。|

## 给用户组设置 ACL 权限

这个与用户一致，给参数 `user` 换成 `group` 即可：

```bash
setfacl -m g[roup]:[groups...]:[rwx] [file|dir]...
setfacl -m [d[efault]:]g[roup]:[groups...]:[rwx] [file|dir]...
```

直接看下示例即可（与设置用户一致）：

$1.$ 给组 `sshd` 设置读写权限：

```bash
$ sudo setfacl -m group:sshd:rw file
```

$2.$ 修改组 `sshd` 的权限为只读：

```bash
$ sudo setfacl -m group:sshd:r file
```

$3.$ 同时给多个组设置读写权限：

```bash
$ sudo setfacl -m group:example1,sshd:r file
```

$4.$ ACL 权限继承（文件夹）:

```bash
$ sudo setfacl -m d:group:sshd:rwx file
```

## 递归设置子文件

这个还是挺重要的，前面说的 [ACL 权限继承（文件夹）](#ACL-权限继承文件夹) 针对的是在文件夹中创建的新文件，不过如果文件夹原本就有文件该怎么办呢？我们给文件夹设置 ACL 权限时并不会针对文件夹中已存在的文件。如果想要给子文件也设置 ACL 就需要使用递归命令了，如下：

```bash
$ setfacl -R -m [d[efault]:]u[ser]:[rwx] [file|dir]...
$ setfacl -R -m [d[efault]:]g[group]:[rwx] [file|dir]...
```

也就是说，在还是给用户或组设置 ACL 权限是加上参数 `-R` 即可。

现在来给一个新用户 `erha` 针对文件夹 `dir` 设置下 ACL 权限：

```bash
$ setfacl -R -m user:erha:rwx dir/
```

来看下之前文件夹中的 readme 文件有没有被递归设置：

```bash
$ getfacl dir/readme

# file: dir/readme
# owner: kali
# group: kali
user::rw-
user:erha:rwx   # <== 在这呢
group::rw-
mask::rwx
other::r--
```

## 有效权限 mask

这个就特重要了，之前给用户和组设置的权限都与这个有效权限有关。比如如果文件的有效权限是 `rw`，但是你给用户设置的权限是 `rx`，那么该用户实际能使用的权限只会有 `r`。就是说，用户的实际权限是设置的权限与文件的有效权限取1交集。

有效权限语法如下：

```bash
setfacl -m [d[efault]:]m[ask]:[rwx]
```

还是以上面创建的文件夹 `dir` 为例，将权限设置为只读（同时指定 ACL 权限继承）：

```bash
$ setfacl -m d:mask:r dir
```

来看下文件夹 ACL 信息：

```bash
$ getfacl dir/

# file: dir/
# owner: kali
# group: kali
user::rwx
group::rwx
other::r-x
default:user::rwx
default:user:webuser:rw-	#effective:r--
default:group::rwx		#effective:r--
default:mask::r--
default:other::r-x
```

注意看输出：

```bash
default:user:webuser:rw-	#effective:r--
default:group::rwx		#effective:r--
default:mask::r--
```

`mask` 是我们设置的有效权限，权限值为 `r`。结果之前设置的用户 `webuser` 和组的有效权限也变成了只读（`effective:r--`）。同时要特别注意的是，这里设置的 ACL 并不会影响到该文件的所属者以及所属组，可以看下上面的输出信息。

所以呢，我们为了实际使用方便会将有效权限设置到最大：`rwx`。当然了额，还算是因人而异呢~


## 删除 ACL 权限

既然会设置肯定就会有删除，删除只需要给之前的参数 `-m` 替换为 `-x`，同时不要指定权限值即可。语法如下：

```bash
setfacl [-R] -x [d[efault]:]u[ser] file...
setfacl [-R] -x [d[efault]:]g[roup] file...
```

比如删除文件夹 dir 上的用户 webuser 的 ACL 权限：

```bash
$ setfacl -R -x d:user:webuser dir
```

## 清空 ACL 权限

与删除不一样，删除是只针对用户或组。而清空则是针对具体的文件或文件夹，一次性将指定文件的 ACL 全部删除。语法如下：

```bash
setfacl [-R] -b [file|dir]...
```

比如清空文件夹 dir 以及子文件设置的所有 ACL 权限：

```bash
$ setfacl -R -b dir
```

## 参考链接

https://linux.die.net/man/1/setfacl
https://www.ibm.com/docs/en/zos/2.4.0?topic=scd-setfacl-set-remove-change-access-control-lists-acls

--

完结，撒花🎉🎉🎉~