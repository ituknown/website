语法示例：

```bash
ffmpeg -ss 00:00:00 -to 00:00:15 -i 源文件名 -vcodec copy -acodec copy 目标文件名 -y
ffmpeg -ss 00:00:00 -t 15 -i 源文件名 -vcodec copy -acodec copy 目标文件名 -y
```

参数说明：

```log
-i                  表示源视频文件
-ss time_start      设置从视频截取开始位置，如 00:00:10 表示从视频的第10s开始截取

-to time_end        设置视频截取的结束位置，如 00:20:00 表示从 time_start 一直截
                    取到视频的第 20 分钟（如果省略则表示开始从 time_start 开始截
                    取全部视频）

-t time_duration    与 -to 一样，不过指定的是具体的时长，单位是秒。如 -t 20 表示从
                    time_start 开始向后截取 20 秒

-vcodec copy        表示使用跟原视频一样的视频编解码器（即不改变任何数据）

-acodec copy        表示使用跟原视频一样的音频编解码器（即不改变任何数据）

-y                  表示如果输出文件已存在则覆盖（可以省略）
```

在做视频截取时视频质量会通常会有一定的损失，如果想要保持原视频质量截取的话可以通过指定 `-vcodec copy -acodec copy` 两个参数。当然了，截取的目标文件的后缀最好也与原文件也保持一致。

|**注意**|
|:-------|
|参数 `-ss` 最好放在 `-i 源文件名` 的前面，如果放在后面则 `-to` 的含义就变了，变成了与 `-t` 一样的效果了。变成了截取多长视频，而不是截取到视频指定的位置。所以一定要特别注意 `-ss` 的位置。|

看个示例：

```bash
$ ls -lh
total 236360
-rw-r--r--@ 1 mingrn97  staff   115M Nov  8 11:33 文件系统.flv
```

视频总时长为 27 分钟，现在以十分钟进行一个切割，共切割成三个视频，之后看下三个视频的大小加起来是否与原视频大小一致：

```bash
$ ffmpeg -ss 00:00:00 -to 00:10:00 -i 文件系统.flv -vcodec copy -acodec copy 文件系统1.flv
$ ffmpeg -ss 00:10:00 -to 00:20:00 -i 文件系统.flv -vcodec copy -acodec copy 文件系统2.flv
$ ffmpeg -ss 00:20:00 -i 文件系统.flv -vcodec copy -acodec copy 文件系统3.flv
```

结果：

```bash
$ ls -lh
total 472920
-rw-r--r--@ 1 mingrn97  staff   115M Nov  8 11:33 文件系统.flv
-rw-r--r--  1 mingrn97  staff    43M Mar 24 17:31 文件系统1.flv
-rw-r--r--  1 mingrn97  staff    42M Mar 24 17:33 文件系统2.flv
-rw-r--r--  1 mingrn97  staff    31M Mar 24 17:33 文件系统3.flv
```

|**Note**|
|:-------|
|注意看第三次截取视频的命令，仅指定了开始截取视频时间（`-ss 00:20:00`），并没有直接截取的结束时间。像这样只有开始没有结束的用法表示的是从指定的开始时间截取到视频结尾。|