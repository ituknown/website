## bash 与 sh 的区别

在写一个 shell 脚本时第一行通常如下：

```shell
#!/bin/bash
```

有时也会使用如下方式：

```shell
#!/bin/sh
```

那到底是什么意思呢？

简单的说 `#!/bin/bash` 是指此脚本使用 `/bin/bash` 来解释执行，`#!` 是特殊的表示符，其后面跟的是此解释此脚本的 `shell` 的路径。

其实第一句的 `#!` 是对脚本的解释器程序路径，脚本的内容是由解释器解释的，我们可以用各种各样的解释器来写对应的脚本。

比如说 `/bin/csh` 脚本，`/bin/perl` 脚本，`/bin/awk` 脚本，`/bin/sed` 脚本，甚至 `/bin/echo` 等等。

`#!/bin/sh` 同理。

在编写 shell 脚本时，有时候会很迷惑： `/bin/bash` 和 `/bin/sh` 功能上似乎是一致的，那为什么会有这两个不同的 shell 呢？

我在 askubuntu 找到了该问题，并看到下面大神的回答，具体见：[What is the difference between #!/bin/sh and #!/bin/bash?](https://askubuntu.com/questions/141928/what-is-the-difference-between-bin-sh-and-bin-bash)。

**总结下来就是：** bash 是 sh 的超集。bash 的功能更加强大，sh 是 bash 的简化版，bash 相比较 sh 而言有更多的高级特性。但是在许多 Linux 发行版（如 Ubuntu）上都推荐使用 /bin/sh，因为 sh 相比较 bash 而言体积更小也就表示 sh 的运行速度更快！！！！

但是，有一点需要注意。由于 bash 是 sh 的超集，所以 bash 完全兼容 sh 语法，反过来 sh 是无法完全兼容 bash 语法的。比如下面的 shell 脚本：

```shell
#!/bin/bash

read -p "Please input your age：" AGE

[[ $AGE =~ ^[0-9]+$ ]]  || { echo Age is not digit; exit; }

if [ "$AGE" -lt 18 ] ;then
        echo "good"
elif [ "$AGE" -ge 18 -a "$AGE" -lt 60 ] ;then
        echo "good good work"
else
        echo "no no no"
fi
```

当我们使用 /bin/sh 运行该脚本时就会提示语法错误：

```bash
$ /bin/sh test_shell.sh

Please input your age：18
test_shell.sh: 5: test_shell.sh: [[: not found
Age is not digit
```

但是如果使用 /bin/bash 就正常输出：

```bash
$ /bin/bash test_shell.sh

Please input your age：18
good good work
```

所以在实际使用中尽管 /bin/sh 运行速度更快，但是还是推荐使用 /bin/bash。


## 扩展

在日常使用中不知道你有没有注意过运维大佬经常会使用 `-c` 参数，即如下：

```bash
/bin/bash -c $command
```

最常见的就是在 docker 的 Dockerfile 文件中的 `ENTRYPOINT` 指令，比如下面的 Dockerfile 文件：

```dockerfile
FROM openjdk:8-jdk-buster

WORKDIR app

ADD web-demo.jar .

ENV JAVA_OPS "-Xms64m -Xmx256m"

ENTRYPOINT ["/bin/bash", "-c", "java $JAVA_OPS -jar web-demo.jar"]
```

有没有很奇怪为什么要使用 `-c` 参数？之前笔者也百思不得姐，直到使用 `man` 命令（或直接进入网页 [https://man.cx/bash](https://man.cx/bash)）看了 bash 之后才明白 `-c` 参数的含义，在 man 页中对 `-c` 的解释是：

```
If  the  -c  option  is  present,  then  commands  are read from the first non-option argument com‐mand_string.  If there are arguments after the command_string, the first argument is assigned to $0
and  any  remaining arguments are assigned to the positional parameters.

The assignment to $0 sets the name of the shell, which is used in warning and error messages.
```

用大白话翻译就是，`-c` 参数会将后面跟的字符串解释为命令进行执行。比如如下命令：

```bash
$ /bin/bash -c "ls"

## 或

$ /bin/bash -c ls
```

你会发现，后面的 `ls` 命令不管是不是字符串都能够被正确执行。但是如下不使用 `-c` 参数的话就会作为脚本执行，如：

```bash
$ /bin/bash ls
/usr/bin/ls: /usr/bin/ls: cannot execute binary file
```

在回头看上面的 Dockerfile 文件，我们将 `ENTRYPOINT` 的指令拷贝出来就是：

```bash
$ /bin/bash -c "java $JAVA_OPS -jar web-demo.jar"
```

现在是不是一目了然了，`-c` 参数会将后面的字符串解释为命令并且会读取 `$JAVA_OPS` 对应的环境变量。这样，我们就能够自定义环境变量 `$JAVA_OPS` 了，是不是更加灵活了？

另外，还有一点需要说明的是。/bin/bash 虽然是 /bin/sh 的超集，但是在某些系统上 /bin/sh 其实是 /bin/bash 的一个软链接，比如 ubuntu：

```bash
$ ls -l /bin/sh
/bin/sh -> bash
```

所以，在大多数情况下还是推荐直接使用 bash 即可~