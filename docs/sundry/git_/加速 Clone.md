当克隆一个项目过大时经常会报如下错误：

```
error: RPC failed; HTTP 504 curl 22 The requested URL returned error: 504 Gateway Time-out
```

解决该问题可以使用 `--depth` 参数，后面跟一个数值，用于指定克隆深度，比如为 1 即表示只克隆最近一次 commit。

示例：
```bash
git clone --depth=1 git@github.com:spring-projects/spring-boot.git
```

如果我们之后要把之前的历史重新再 pull 下来，可以使用如下命令将所有提交记录拉去下来：

```bash
git pull --unshallow
```
