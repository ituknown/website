## run-parts 的介绍与使用

crontab 定时作业表用起来真的很方便。不过呢，如果单纯的直接使用还是有些麻烦的。

从前面的示例中可以看出，想要配置一个定时任务在用户的 crontab 作业表中增加一条 cron 表达式记录就好，但是如果我有上百个定时任务呢？也要一个一个的在作业表中写 cron 表达式？别闹，要死人的~

所以就需要借助 `run-parts` 工具了。这个功能很小众，很大一部分人都没听过，所以就来简单的说下。

先来看下 `run-parts` 命令在哪里：

```bash
$ which -a run-parts
/usr/bin/run-parts
/bin/run-parts
```

就是说 run-parts 工具在 `/usr/bin` 和 `/bin` 目录下都有（且没有使用软连接）。所以如果你无法执行 `run-parts` 命令可能是你的系统没有将这两个文件设置到环境变量 `PATH` 中。

当我们使用 man 命令查看 `run-parts` 的使用方式时，有如下一段介绍：

```
run scripts or programs in a directory
```

`run-parts` 的主要用法就是指定可执行文件所在的目录，如果这个目录下存在多个可执行文件，`run-parts` 会将该目录下的可执行文件全部执行一遍，妙极了不是？

`run-parts` 命令使用方式如下：

```bash
run-parts [option...] DIRECTORY
```

注意看，最后跟的是一个具体的目录，它的部分可选参数如下：

```
--test            打印 DIRECTORY 目录下可运行的脚本的名字（注意并不是真的运行），这个命令在测试时很实用
--list            打印 DIRECTORY 目录下有效的文件名，这个参数不能同时与 --test 一起使用

--verbose         在运行 DIRECTORY 目录下的脚本之前，先打印脚本的名称
--report          如果 DIRECTORY 下的脚本产生的输出信息，打印脚本的名称
--reverse         默认情况下，在执行 DIRECTORY 目录下的多个脚本时会按照脚本的名称顺畅执行。我们可以使用这个参数进行按照反向顺序执行
--exit-on-error   如果 DIRECTORY 目录下的某个脚本执行后返回的状态码不是 0，直接退出
...
```

在这些可选参数中，使用最后的就是 `--test` 和 `--report`，下面来演示一下。

我们先在用户目录下的 tmp 目录下创建两个脚本，分别为 `print_time` 和 `test_network`。

`print_time` 脚本用于输出时间，内容如下：

```shell
#!/bin/bash

date +"%Y-%m-%d %H:%M" >> ~/tmp/record.txt
```

`test_network` 脚本用户测试网络是否正常（使用 `ping`）命令，内容如下：


```shell
#!/bin/bash

ping -c 1 baidu.com | head -n2 | tail -n1 >> ~/tmp/record.txt
```

先来看下这两个文件的属性：

```bash
$ ls -l
-rw-rw-r-- 1 kali kali 52 10月 30 11:21 print_time
-rw-rw-r-- 1 kali kali 69 10月 30 11:24 test_network
```

可以看到都是读写权限，并没有执行权限。

| **NOTE**                           |
| :--------------------------------- |
| `run-parts` 工具只会执行指定目录下具有可执行权限的脚本。 |

来使用 `run-parts` 工具验证下 tmp 目录下的文件，这里直接使用 `--test` 参数：

```bash
$ run-parts --test tmp/
```

结果你会发现没有任何输出，这就表示 tmp 目录下没有符合可执行脚本条件。所以我们需要给 `print_time` 和 `test_network` 可执行权限：

```bash
$ chmod +x print_time test_network
```

再次执行 `run-parts` 的测试命令，就会输出可执行文件的名称了：

```bash
$ run-parts --test tmp
tmp/print_time
tmp/test_network
```

这就表示一切正常了。

:::info[NOTE]
`run-parts` 只作用于指定目录下具有可执行权限的文件，可执行权限可以使用 `chmod` 命令设置。
:::

现在我们来使用 `run-parts` 真正的执行一下 tmp 目录下的两个文件试试，使用如下命令（在实际使用中建议永远加上 `--report` 参数）：

```bash
$ run-parts --report tmp
```

现在看下 record.txt 文件：

```bash
$ cat tmp/record.txt
2021-10-30 11:25
64 bytes from 220.181.38.148 (220.181.38.148): icmp_seq=1 ttl=50 time=30.9 ms
```

这就说明了一切问题了吧，所以 `run-parts` 工具还是很有用的。那么就算如此跟 `crontab` 又有啥子关系呢？

我们想一个问题，比如在我们日常服务器维护中，经常会写一些特定的脚本。很多脚本都是每隔一段时间需要执行一次，一般都是在每天的凌晨执行。这么多的脚本不可能一个一个的手动执行吗？所以我们可以将这些具有相同时间性质的脚本归类，放到不同的文件夹中，比如需要一个小时执行一次的和每隔一天执行一次的。再配合 `crontab` 作业表简直不能再完美了不是？

比如上面的两个脚本，我想每隔一分钟执行一次就可以直接在 `crontab` 中这么写：

```
* * * * * cd ~ && run-parts --report tmp
```

保存之后就可以了，如果无法正常执行的话可能需要重启 cron 服务：

```bash
$ sudo systemctl restart cron.service
```

## 系统级别 crontab 的使用和管理

前面说的定时作业都是用户级别下的，其实还有系统级别下的。系统级别下的 crontab 作业表是直接放在 /etc 目录下的，你可以使用下面的命令查看作业表文件和目录：

```bash
$ ls /etc | grep cron
```

通常情况下你会看到如下输出：

```
anacrontab
cron.d
cron.daily
cron.hourly
cron.monthly
crontab
cron.weekly
```

其中，cron.d、cron.daily、cron.hourly、cron.monthly、cron.weekly 都是文件夹，与 crontab 文件有关，这里我们先说下 `anacrontab`。

`anacrontab` 与 `crontab` 一样都是定时作业表，但是有些区别。`anacrontab` 是由 `anacron` 服务管理，而且 `anacron` 与普通的定时作业表也不同。Linux 系统虽然在不间断的运行但是呢，像男人一样，每个月总有那么几天不是。而巧的是，如果在这几天有 `crontab` 作业表定时任务的话，那这些任务是无法运行的，因为处于关机状态。这个时候就需要 `anacrontab` 作业表了，该作业表的作用就是用于监听 `crontab` 作业表在那么几天时间段内有没有运行，如果没有运行的话会调用服务运行一次。这就是 `anacron` 的核心作用，我们不需要关心，而且在非必要情况下也不要去修改 `anacrontab` 作业表。

所以我们来具体说下 `crontab` 系统作业表。先打开该文件，看下当前有那些内容，命令如下：

```bash
$ cat /etc/crontab
```

输出内容如下：

```
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed
17 *	* * *	root    cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6	* * 7	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6	1 * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
```

这个作业表的内容相信你肯定很熟悉，唯一的区别是定时任务的配置有具体的用户（示例 root）。那这是为什么呢？

原因是这个配置文件是系统级别的定时作业表，普通用户无权限执行。如果想要将上面的某个命令使用普通用户执行，那就需要将这个普通用户加入到超级管理员用户组才行。

我们看下上面系统作业表 crontab 的示例内容：

```
17 *	* * *	root    cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6	* * 7	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6	1 * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
```

这个定时作业很有趣，注意看后面的具体命令，你会发现使用的是 `run-parts` 工具，那么后面的跟的肯定就是具体的文件夹了。现在知道 /etc 目录下的几个文件夹 cron.daily、cron.hourly、cron.monthly、cron.weekly 的作用了吗？每个文件夹对应的就是相应日期的定时作业脚本。

比如 /etc/cron.daily 文件夹，从明明也可以看到是每天执行一次的作业表。再看它的 cron 表达式：`25 6	* * *`，这不就是每天早上6点25分执行一次吗。

你会发现有了前面的知识这里就简单易懂了，而 Linux 也很贴心。给我们设定了几个默认的 cron 周期，比如以后你如果想要写一个每周运行一次的定时作业任务只需要直接在 /etc/cron.weekly 目录下编写一个对应的可执行脚本即可。是不是很简单？

## 关于 /etc/cron.allow 和 /etc/cron.deny

`/etc/cron.allow` 文件是用于定义可执行定时任务的用户白名单，对应的还有一个黑名单文件 `/etc/cron.deny`。如果不想让某个用户使用 cron 定时任务只需要将该用户加入到 `/etc/cron.deny` 文件中即可（一个用户占用一行）。

比如我将系统中的某个用户加入到 `/etc/cron.deny` 文件中，那么该用户就无法继续使用 cron 了。示例：

```bash
$ id
uid=1000(kali) gid=1000(kali) groups=1000(kali)

$ sudo echo kali >> /etc/cron.deny

$ sudo systemctl restart cron.service

$ crontab -l
You (kali) are not allowed to use this program (crontab)  ## 好了，我无权限使用了
See crontab(1) for more information
```

好了，关于定时作业表就说这么多。相信这些知识足够满足我们日常需要了~