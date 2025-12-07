## 前言

crontab 是 Linux 内置的定时任务管理器，crontab 是 cron table 的缩写，即定是作业表。crontab 命令主要有如下两种形式：

```bash
$ crontab [-u user] file
$ crontab [-u user ] [ -i ] { -e | -l | -r }
```

第一个命令表示将指定文件设置称为指定用户的作业表文件，如果省略具体的用户就表示设置称为当前用户的作业表文件（文件必须已存在）。第二个命令表示操作具体用户的作业表文件，如果省略具体用户同样表示操作当前用户的作业表文件。

:::tip
`-u` 参数用于指定具体的用户，如果省略该参数就表示当前用户。
:::

而 option 有如下几个参数：

```
-e: 编辑作业表
-l: 列出作业表内容
-r: 删除作业表
-i: 在删除作业表之前提示确认操作(y/Y)
```

:::info[NOTE]
这里要特别强调的是 -u 选项。再次说明，该选项后跟具体的 Linux 用户，表示当前作业表对这个指定的用户生效，如果不指定用户的话就默认是当前用户。
:::

## cron 表达式说明

crontab 是一个作业表，说直接点就是一个配置文件，用于配置定时任务，而该配置文件需要使用的 Linux 的 cron 表达式。所以在具体配置之前我们先来学习一下：

如何去学习 cron 表达式呢？直接在终端中输入如下命令：

```bash
$ crontab -e
```

咿？`-e` 不是编辑用户作业表吗？别急注意往下看：

当我们点击回车键后通常会提示如下信息，这个信息告诉你当前系统存在多个文件编辑器（如下我的有5个），选择你熟悉的编辑器即可。比我我这里选择 `vim.basic`，在下面选择中输入对应的数字序号 2：

```plaintext
no crontab for kali - using an empty one

Select an editor.  To change later, run 'select-editor'.
  1. /bin/nano        <---- easiest
  2. /usr/bin/vim.basic
  3. /usr/bin/vim.tiny
  4. /usr/bin/code
  5. /bin/ed

Choose 1-5 [1]: 2 <== 在这里输入你想使用的编辑器
```

之后就能进入作业表文件了，一般用户初始默认的作业表是空的，不过在文件头部会有许多注释，这个注释就是告诉你该如何配置及如何编写 cron 表达式。

通常情况下，非 root 用户首次打开作业表文件，在文件首部都会有如下说明：

```plaintext
# Edit this file to introduce tasks to be run by cron.
#
# Each task to run has to be defined through a single line
# indicating with different fields when the task will be run
# and what command to run for the task
#
# To define the time you can provide concrete values for
# minute (m), hour (h), day of month (dom), month (mon),
# and day of week (dow) or use '*' in these fields (for 'any').
#
# Notice that tasks will be started based on the cron's system
# daemon's notion of time and timezones.
#
# Output of the crontab jobs (including errors) is sent through
# email to the user the crontab file belongs to (unless redirected).
#
# For example, you can run a backup of all your user accounts
# at 5 a.m every week with:
# 0 5 * * 1 tar -zcf /var/backups/home.tgz /home/
#
# For more information see the manual pages of crontab(5) and cron(8)
#
# m h  dom mon dow   command
```

这个文件注释告诉你作业表该如何配置，而最后一行内容就是告诉你 cron 的具体格式。它代表的意思是：

```plaintext
m    h    dom    mon    dow    command
-    -    [-]    [-]    [-]    [-----]
|    |     |      |      |        |
|    |     |      |      |        +--------> 需要执行的命令
|    |     |      |      +-----------------> Weekday (0=Sun .. 6=Sat)
|    |     |      +------------------------> Month   (1..12)
|    |     +-------------------------------> Day     (1..31)
|    +-------------------------------------> Hour    (0..23)
+------------------------------------------> Minute  (0..59)
```

crontab 的命令构成是：时间 + 动作。其时间按顺序是分、时、日、月、周五种，而动作就是具体要执行的命令（command）。下面表格是每个单位的取值以及含义：

| **代表意义** | **分钟** | **小时** | **日期** | **月份** | **周**                | **命令**       |
|----------|----------|----------|----------|----------|----------------------|--------------|
| 数字范围     | 0~59     | 0~23     | 1~31     | 1~12     | 0~7（0和7都表示星期日） | 需要执行的命令 |

另外，时间除了设置具体的数字之外还可以使用下面的时间操作符：

| **操作符** | **说明**                                             |
|:-----------|:---------------------------------------------------|
| `*`        | 代表单位内的所有时间                                 |
| `/`        | 每隔指定时间单位，如 `*/5` 就表示每隔 5 个时间单位    |
| `-`        | 区间取值，如 `5-10` 就表示第 5 到第 10 这几个时间单位 |
| `,`        | 离散数字，指定多个具体的时间单位。如 `2,3,4`           |

## cron 表达式示例

知道了表达式的基本组成我们就需要来练习一下。先来看一个简单的示例：

1. 每分钟执行一次 Command：

```
* * * * *	Command
```

这条 cron 表达式的所有时间位都是 `*`，表示 ANY 的意思，后面的命令是一个具体要执行的命令。

2. 在每小时的第 20 分钟执行一次 Command：

```
20 * * * *	Command
```

换句话说，如果将 20 换成 0 就表示每小时执行一次：

```
0 * * * *	Command
```

3. 在每小时的第 20 和 30 分钟各执行一次 Command：

```
20,30 * * * *	Command
```

4. 在每小时的 20 ~ 30 分钟这段时间，每分钟执行一次 Command：

```
20-30 * * * *	Command
```

5. 每隔五分钟执行一次 Command：

```
*/5 * * * *	Command
```

6. 每隔2天执行一次 Command：

```
* * */2 * *	Command
```

7. 每隔五天，在那天上午10点的第 20 ~ 30 分钟，每分钟执行一次 Command：

```
20-30 10 */5 * *	Command
```

8. 每隔五天，在那天的上午10点的第 20 和 30 分钟各执行一次 Command：

```
20,30 10 */5 * *	Command
```

9. 每星期六凌晨执行一次 Command：

```
* 0 * * 6 Command
```

10. 每天晚上11点到早上7点，每隔1小时执行一次 Command：

```
0 23-7/1 * * * Command
```

## corntab 实战

现在呢，我们来练习下 crontab 的使用。这次我要练习的是模拟心跳检测，每分钟发送一次请求，当然并不是真的要发送，我们可以将每分钟的时间记录到心跳检测文件中。

编写一个脚本，脚本文件名就叫 hearbeat：

```bash
$ vim hearbeat
```

内容如下：

```shell
#!/bin/bash

date +"%Y-%m-%d %H:%M" >> ~/timeline.txt
```

脚本很简单，就是输出一下当前时间，并将时间输出到 timeline.txt 文件中（`timeline.txt` 文件会自动创建）。之后需要给 `hearbeat` 文件一个执行权限：

```bash
$ sudo chmod +x hearbeat
```

现在来创建定时作业表，为了更详细的介绍 `crontab` 命令我不直接使用 `-e` 参数。而是创建一个具体的文件，在该文件中编写 cron 表达式，之后将该文件设置为当前用户的作业表。如下：

创建一个文件：

```bash
$ touch cronscheduling
```

在文件中输入如下内容：

```
* * * * * cd ~ && ./hearbeat >> ~/timeline.txt
```

之后使用下面的命令将该文件设置成为当前用户的作业表：

```bash
$ crontab cronscheduling
```

可以使用下面 `-l` 参数测试是否设置成功：

```bash
$ crontab -l
* * * * * cd ~ && ./hearbeat >> ~/timeline.txt ## 输出了作业表内容, 说明设置成功了
```

| **注意**                                                                                                                           |
|:---------------------------------------------------------------------------------------------------------------------------------|
| 上面的操作其实完全可以直接使用 `crontab -e` 来实现，之所以单独创建一个文件的原因是为了演示如何将一个自定义的文件设置为用户的作业表。 |

正常的话作业表就开始执行了，但是如果你的没有执行可能需要重启 cron 服务：

```bash
sudo systemctl restart cron.service
```

之后我们使用 tail 命令看 timeline.txt 文件中是否每分钟都输出一次时间：

```bash
$ tail -f timeline.txt
2021-10-29 22:43
2021-10-29 22:44
2021-10-29 22:45
```

Prefect ~

--

## 资源链接

https://www.debian.org/releases/bullseye/amd64/ch08s02.en.html#idm3047