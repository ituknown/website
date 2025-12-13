这个问题通常出现在 Windows 平台，因为在 Windows 版本 git 使用 msys。 msys 使用的是旧版本 Windows API，文件名限制为 260 个字符。这是 msys 的限制，而不是 git 的限制。

在 github 上有有关该问题的讨论：

[https://github.com/msysgit/git/pull/110](https://github.com/msysgit/git/pull/110)

解决该问题可以直接使用下面的命令：

```
git config <ConfigFileLocation> core.longpaths true
```
ConfigFileLocation 可选值：

- `--global`：全局配置
- `--system`：系统级别配置
- `--local`：指定仓库级别配置
