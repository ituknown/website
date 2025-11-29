## 批量视频合成

这个用的最多的就是合成 m3u8 视频，某些视频链接是 m3u8 格式。下载下来后会是一堆 `.ts` 视频，每个 `.ts` 视频仅仅只有几秒钟，所以我们需要将这些 `.ts` 视频按照顺序进行合成为一个大的完整视频。

要使用 FFmpeg 合并多个视频文件文件，主要使用 `concat` 参数。

1. 首先，创建一个文本文件，其中包含要合并的 mp4 文件的列表。每行应包含一个文件的路径，*文件书写的顺序就是合并的顺序*。如下所示：

```
file /path/01.ts
file 02.ts
file ./../ 3.ts
```

前面为关键词 file， 后面跟上视频的地址（绝对路径或相对路径）。 **ffmpeg 将会按照 txt 文件中的顺序将视频合并**。然后在命令行中输入如下命令就可以了：

保存这个文本文件（例如，命名为`filelist.txt`）。

2. 打开终端或命令提示符，并使用以下命令合并 mp4 文件：

```bash
ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4

## 是下面命令的简写形式

$ ffmpeg -f concat -safe 0 -i file.txt -acodec copy -vcodec copy -f mp4 file.mp4
```

这个命令的各个部分解释如下：

- `-f concat`：指定使用`concat`协议合并这些文件。
- `-safe 0`：允许使用不安全的文件名，这对于指定文件路径非常有用。
- `-i filelist.txt`：指定包含文件列表的文本文件。
- `-c copy`：表示复制视频和音频流而不重新编码它们，以加快合并速度。
- `output.mp4`：指定合并后的输出文件的名称。

运行此命令后，FFmpeg 将会将列表中的 mp4 文件合并成一个名为 `output.mp4` 的文件。

注意，上面示例命令中的媒体文件默认具有相同的编解码格式和分辨率，因此直接使用 `-c copy` 进行流复制。如果你的文件之间有差异（如具有不同的编码），可能就需要进行重新编码以确保具有相同的规格。

**特别说明：**

上面示例只是以 `.ts` 文件为例做说明，并不代表不能合并其他格式的视频文件。`ffmpeg` 的牛逼之处不在于能够合并视频，还可以将音视频分离的两个文件进行合并。

比如将视频文件（example.mp4）和音频文件（example.m4a）进行合并：

```bash
ffmpeg -i example.mp4 -i example.m4a -c:a copy -c:v copy output.mp4
```

## 少量视频合成

前面适合批量视频合成，如果只有几个视频文件就完全没必要单独写一个 txt 文件。直接在命令行中使用 `concat` 协议即可：

比如我当前目录下有三个 `.ts` 视频：

```bash
$ ls
01.ts 02.ts 03.ts
```

如果将要将这三个 ts 视频按顺序合成的话可以使用下面的命令（视频合成顺序就是你指定的顺序）：

```bash
ffmpeg [-safe 0] -i "concat:1.ts|2.ts|3.ts" -c copy file.mp4
```

`-safe 0` 是可选参数，如果出现类似如下错误，可以使用该参数解决：

```Prolog
file.txt: Operation not permitted
```