## 前言

想要学习 Linux 文件系统，学习 `chown` 命令的使用是或不可少的，`chown` 命令的全称是：**change file owner and group**。

从全称中也可以看出该命令主要是修改文件的所属者和组，`chown` 命令允许你修改指定文件、目录或者符号链接和所有者或者组之间的“绑定关系”。在 Linux 中，所有文件都与所有者和组相关联，并为文件所有者、组成员和其他人分配访问权限。

本篇文章就会介绍下 `chown` 命令的基本使用，以便对 Linux 权限系统更加了解~


## chown 命令的基础使用

在具体使用 `chown` 命令之前先看下基本语法格式：

```bash
chown [options] USER[:GROUP] FILE(s)
```

`USER` 指的是将文件绑定到新的所属者，可以是用户名也可以是用户ID(`UID`)。`GROUP` 指的是将文件绑定新的组上，同样的可以是组名也可以是组ID(`GID`)。`FILE(s)` 指的是具体的文件(可以是一个或多个，多个之前使用空格进行分割)，该文件可以是普通的文件、文件夹也可以是一个符号链接。

:::tip
对于使用 `UID` 或者 `GID` 的形式最好在前面加上一个 `+` 符号，以避免在系统中有相同用户名的用户或者组名的组。

说人话就是系统中可能某个用户名是数字，该数字跟通过设置 `UID` 的数字相同。为了避免混淆，利用 `UID` 形式设置用户时最好在 `UID` 前面加上一个 `+`。
:::

题外话，如何确定当前登录的用户名、用户ID以及所在组呢？查看用户名可以直接使用 `users` 命令、查看组可以使用 `groups` 命令。当然最直接的方式还是使用 `id` 命令，该命令不仅会显示出用户名、所属组还会显示具体的 `UID`。


**语法使用细节：**

1、`USER` - 如果仅仅指定一个用户名，就仅仅将该用户名设置为文件的新归属者，文件所属组不会做改变。<br/>
2、`USER:` - 如果指定用户名时并在后面跟了一个 `:` 符号，但是没有设置组名。那么文件归属者会是指定的用户名，*但是文件所属组会被设置为登录系统的用户的组*。<br/>
3、`USER:GROUP` - 如果同时指定了用户和组(用户和组之间必须使用 `:` 符号做分隔)，文件的归属者会被设置为指定的用户、所属组也会被设置为指定的组。<br/>
4、`:GROUP` - 如果仅仅指定了组(组前面必须有 `:` 符号)时，即表示仅仅修改文件的所属组，而不修改用户。也就是说仅仅修改文件所属组，实际上更推荐使用 `chgrp` 命令。<br/>
5、`:` - 如果仅仅指定一个 `:` 符号，不做任何改变。


默认情况下，成功时，`chown` 不会产生任何输出并返回0。

如何查看当前文件的归属信息？可以使用 `ls -l` 命令进行查看，下面是使用示例：

```bash
$ ls -l filename.txt
```

输出示例：

```bash
-rw-r--r-- 12 linuxize users 12.0K Apr  8 20:51 filename.txt
|[-][-][-]-   [------] [---]
                |       |
                |       +-----------> Group
                +-------------------> Owner

```

普通用户只有在拥有该文件并且只更改为其成员的组时才能更改该文件的组，管理员用户可以更改所有文件的组所有权！

如果普通用户也想要修改文件的所有组权，将该用户加入到 `sudo` 即可~


## 修改文件的归属者

修改某个文件的归属者可以使用如下格式：

```bash
chown USER FILE
```

下面是一个使用示例，将文件 `file1` 新的归属者设置为 `linuxize`：

```bash
$ sudo chown linuxize file
```

如果想要绒布修改多个文件或目录，只需要将多个文件或目录使用空格做分隔即可：

```bash
$ sudo chown linuxize file1 file2 dir1 dir2
```

另外，也可以直接使用 `UID` 的形式进行设置新的归属者，比如 `UID` 为 `1000`：

```bash
sudo chown 1000 filename
```

另外有一点需要注意，如果在系统中有一个用户的用户名也是 `1000`，那么使用上面的命令其实设置的是用户名而不是 `UID`，所以在使用 `UID` 指定新的归属者时最好在 `UID` 前面加上一个 `+` 符号：

```bash
sudo chown +1000 filename
```


## 修改文件的归属者和组


修改文件归属组的命令如下格式：

```bash
chown [USER]:GROUP FILE
```

其中 `[USER]` 是可选的，下面的示例命令是将文件 `file1` 的归属者设置为 `linuxize` 并且将组设置为 `users`：

```bash
$ sudo chown linuxize:users file1
```

如果在设置组是省略了组名则会将归属组设置为登录该系统的用户的所属组，如下：

```bash
sudo chown linuxize: file1
```


## 修改文件的归属组

要仅更改文件的组，只需要使用 `chown` 命令后跟冒号（`:`）和一个新组名（它们之间没有空格）以及目标文件作为参数即可：

```bash
chown :GROUP FILE
```

下面的示例是将文件 `file1` 的所属组设置为一个新的组 `www-data`：

```bash
chown :www-data file1
```

另外，除了使用 `chown` 命令之外还可以使用 `chgrp` 命令完成同样的操作。


## 修改符号链接的归属信息

在修改符号链接时，如果不使用递归选项时(`-R` 参数)，`chown` 命令将更改符号链接所指向的文件的组所有权，而不是符号链接本身。

比如，如果修改指向 `/var/www/file1` 的符号链接 `symlink1` 的所有者或组，chown 实际上修改的是指向该符号链接所指定的文件或目录的所有权（即修改的是 `/var/www/file1` ）：

```bash
$ sudo chown www-data: symlink1
```

但实际上执行该命令时通常会报错：“cannot dereference ‘symlink1’: Permission denied”。

出现此错误的原因是，默认情况下，大多数Linux发行版上的符号链接都受到保护，并且无法对目标文件进行操作。此选项在 `/proc/sys/fs/protected_symlinks` 中指定。1表示启用，0表示禁用。**通常建议不要禁用符号链接保护。**

要更改符号链接本身的组所有权，使用 `-h` 选项：

```bash
$ sudo chown -h www-data symlink1
```


## 递归更改文件所属信息


如果想要递归的更改给定目录下的所有文件和目录，需要使用 `-R`（`--recursive`）参数：

```bash
chown -R USER:GROUP DIRECTORY
```


下面的示例是将 `/var/www` 目录下所有文件和子目录的所有权更改为名为 `www-data` 的新所有者和组：

```bash
$ sudo chown -R www-data: /var/www
```

如果目录包含符号链接，还需要 `-h` 选项：

```bash
$ sudo chown -hR www-data: /var/www
```

递归更改目录所有权时还可以使用的其他选项 `-H` 和 `-L`。

如果传递给 `chown` 命令的参数是指向目录的符号链接，`-H` 选项将使命令遍历它 `-L` 告诉 `chown` 遍历每个符号链接到遇到的目录。注意，最好该使用这些选项，因为很可能会破坏系统或造成安全风险。


## 使用 Reference 命令修改所属信息

比如有一个文件 `ref_file`，它的归属权限是 `linuxize:users`。如果想要将目标文件 `target_file` 的归属权限也修改为 `linuxize:users` 可以使用 `--reference=ref_file` 命令实现权限拷贝。

基本语法如下：

```bash
chown --reference=REF_FILE FILE
```


比如说上面的场景，直接使用如下命令即可：

```bash
$ sudo chown --reference=ref_file target_file
```


## 结束语


`chown` 是 Linux/UNIX 非常实用的命令行程序，主要用于更改文件的用户和/或组所有权。如果想要深入学习 `chown` 可以查看 [chown 手册页](https://linux.die.net/man/1/chown)或在终端中输入 `man chown` 即可。
