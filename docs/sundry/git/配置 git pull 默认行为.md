`git pull` 默认执行的是 `fetch + merge`，执行的结果是将远程的代码和本地的代码合并后重新创建一个新的 commit。

比如当前情况是：

```
远程（origin/main）： A - B
本地（main）：        A - C
```

两边在 `A` 之后都各自有了提交（`B` 在远程，`C` 在本地），也就是说当前分支已经分叉了。如果直接执行 `git pull` 直接执行的是：

```
git fetch origin
git merge origin/main
```

这会产生一个新的 merge commit（如果看 git log 会发现线条出现了气泡）：

```
A - B - M
     \ /
      C
```

其中 `M` 是一个自动生成的合并提交，信息类似：

```
Merge branch 'main' of origin into main
```

如果觉得太“脏”，可以考虑做如下配置来改变 `git pull` 默认行为为 `git pull --rebase`：

```bash
# 全局
$ git config --global pull.rebase true

# 当前项目
$ git config pull.rebase true
```

在这种情况下执行 `git pull` 时，Git 会把你的提交 `C` 取出来，放到 `B` 之后（`C'` 是重新应用的 `C`，因为 rebase 会生成一个新的提交对象），效果如下：

```
A - B - C'
```

干净又清爽~

另外，如果你还想让 rebase 自动处理分支跟踪，可以加上：

```bash
# 全局
$ git config --global rebase.autoStash true

# 指定项目
$ git config rebase.autoStash true
```

这样在 rebase 前会自动保存未提交的更改，完成后再恢复。

总结：

| **模式**    | **命令**              | **结果**         | **历史结构** |
| :---------- | :-------------------- | :--------------- | :----------- |
| 默认（merge） | `git pull`          | 创建一个新的合并提交     | 非线性，有分叉  |
| rebase 模式 | `git pull --rebase` | 重放本地提交到远程最新提交后 | 线性、干净    |
