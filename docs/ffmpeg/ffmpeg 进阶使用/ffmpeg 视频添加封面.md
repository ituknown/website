## MP4 添加封面

下面是基本命令：

```bash
ffmpeg \
-i input.mp4 \
-i cover.jpg \
-map 0 \
-map 1 \
-c copy \
-disposition:v:1 attached_pic \
output.mp4
```

**解释：**

- `-i input.mp4`：输入视频文件。
- `-i cover.jpg`：输入封面图片文件。
- `-map 0`：映射第一个输入（即视频）。
- `-map 1`：映射第二个输入（即图片）。
- `-c copy`：复制视频和音频流，不重新编码。
- `-disposition:v:1 attached_pic`：将第二个视频流标记为封面（封面图片）。

注意：这种方法适用于 MP4 文件。如果你使用 MKV 文件格式，命令会有一些小的不同，MKV 支持多个封面文件。

## 参数 -disposition 说明

在 `FFmpeg` 中，所有输入文件都可以被视为一个流。对于图片输入，`FFmpeg` 通常会创建一个视频流，尽管它实际上是静态帧。就是说即使 `cover.jpg` 是一张图片，它在 `FFmpeg` 处理时会被视为一个视频流使用。

所以命令：

```bash
ffmpeg \
-i input.mp4 \
-i cover.jpg \

...
-disposition:v:1 attached_pic
...
```

有两个视频流，第一个视频流是 input.mp4，索引是0。第二个视频流是 cover.jpg，索引是1。

而 `-disposition:v` 参数可以用来设置流的属性。这里指定第二个视频做作为附加封面（attached_pic）使用。