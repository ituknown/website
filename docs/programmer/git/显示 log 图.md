`git log` 默认显示的提交信息在分支多的情况下不够友好，没法一眼识别出分支线情况。尤其是信息密集度，太多分散。这个时候就可以考虑以图形化（树状图）的方式显示 Git 提交历史了，这是 Git 的内置命令：

```bash
git log --graph --oneline --decorate [--all | branch_name] [-n NUM]
```

- `--graph`：在日志左侧绘制 ASCII 字符表示的分支合并历史图
- `--oneline`：将每个提交压缩为一行，只显示哈希缩写和提交说明，不显示具体的 author 信息
- `--decorate`：显示分支名、标签（Tags）以及 HEAD 的指向
- `--all`：查看所有本地和远程分支的历史，而不只是当前分支
- `branch_name`：查看指定分支的历史
- `-n`：查看最近 n 条记录

:::tip[Note]
在使用时，`--all` 和 `branch_name` 二选一
:::

输出示例：

```
* 7d3b2f1 (HEAD -> master, origin/master) Merge branch 'feature-x'
|\
| * 5a2c1e4 (feature-x) Add new layout
| * 2b9e8a2 Fix specific bug
|/
* 3f9e8a2 Initial commit
```

## 定义别名

由于这些命令很长，建议将其设置为别名：

```bash
# 查看指定分支提交记录(使用时后面需要加上分支名)
git config --global alias.lg '!f() { if [ -z "$1" ]; then echo "\033[31m错误：请指定要显示的分支（默认显示最近 50 条）例如: \033[34mgit lg dev\033[31m 或 \033[34mgit lg dev 100\033[0m"; return 1; fi; git log --graph --oneline --decorate "$1" -n ${2:-50}; }; f'

# 查看所有分支提交记录
git config --global alias.tree "log --graph --oneline --decorate --all"

# 查看所有分支最近 N 条提交记录(使用时后面需要加上数量)
git config --global alias.tree.top '!f() { if [ -z "$1" ]; then echo "\033[31m错误：请指定要显示的行数 (例如: git tree.top 10)\033[0m"; return 1; fi; git log --graph --oneline --decorate --all -n "$1"; }; f'
```

:::tip[命令解释]
$1.$ `!` 告诉 Git 这是一个外部 Shell 命令，而不是普通的 Git 子命令<br/>
$2.$ `f() { ... }; f` 定义并立即执行一个匿名函数 `f`<br/>
$3.$ `if [ -z "$1" ];` 检查第一个参数（`$1`）是否为空（`-z` 表示 “zero length”，即长度为零）<br/>
$4.$ `echo "错误：..."` 如果参数为空，打印你自定义的红字或提示信息<br/>
$5.$ `return 1` 终止执行，不会触发后面的 `git log`<br/>
$6.$ `git log ... "$1"` 如果检查通过，则运行带有参数的绘图命令<br/>
:::

使用示例：

```bash
# 查看 dev 分支提交记录
git lg dev

# 查看所有分支提交记录
git tree

# 查看所有分支最近 10 条提交记录
git tree.top 10
```

:::info[如何删除或修改这个别名？]
如果想修改别名，可以直接再次执行上面的 `git config` 命令进行覆盖，或者手动编辑 Git 配置文件：

```bash
git config --global --edit
```

在文件中找到 [alias] 部分进行修改即可。
:::