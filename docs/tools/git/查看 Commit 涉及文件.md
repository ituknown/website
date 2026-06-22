查看某个 commit 涉及了哪些文件，最常用的命令是 `git show` 命令，语法如下：

```bash
git show <commit_id> [--name-only | --name-status | --stat]
```

- `commit_id`：可以是哈希值，也可以是 `HEAD`（当前分支最新提交）

<details>
<summary>**默认行为：查看具体的文件改动内容 (Diff)**</summary>

这是 Git 的默认行为，它会显示所有涉及文件的代码差异。

[tokio](https://github.com/tokio-rs/tokio) 示例：

```bash
$ git show HEAD

commit a708ad19cb9ae652d8a813554e68cb1d86593eb9 (HEAD -> master, origin/master, origin/HEAD)
Author: example example@mail.dev
Date:   Tue Dec 30 00:09:38 2025 -0700

    chore: fix minor typos (#7804)

diff --git a/tokio/src/sync/mpsc/block.rs b/tokio/src/sync/mpsc/block.rs
index adc3b57e..cf86922b 100644
--- a/tokio/src/sync/mpsc/block.rs
+++ b/tokio/src/sync/mpsc/block.rs
@@ -170,7 +170,7 @@ impl<T> Block<T> {
         // 2. The `UnsafeCell` always give us a valid pointer to the value.
         let value = self.values[offset].with(|ptr| unsafe { ptr::read(ptr) });

-        // Safety: the redy bit is set, so the value has been initialized.
+        // Safety: the ready bit is set, so the value has been initialized.
         Some(Read::Value(unsafe { value.assume_init() }))
     }
```
</details>

<details>
<summary>**--name-only 仅查看文件名列表**</summary>

如果想知道哪些文件被修改了，不需要看具体的代码改动，可以使用该参数。

```bash
$ git show HEAD --name-only

commit a708ad19cb9ae652d8a813554e68cb1d86593eb9 (HEAD -> master, origin/master, origin/HEAD)
Author: example example@mail.dev
Date:   Tue Dec 30 00:09:38 2025 -0700

    chore: fix minor typos (#7804)

tokio/src/sync/mpsc/block.rs
tokio/src/sync/tests/loom_mpsc.rs
tokio/src/sync/tests/loom_notify.rs
tokio/src/sync/tests/loom_semaphore_batch.rs
tokio/src/time/sleep.rs
tokio/tests/net_unix_pipe.rs
tokio/tests/rt_basic.rs
```
</details>

<details>
<summary>**--name-status：查看文件名及状态（新增、修改、删除）**</summary>

如果想知道文件是被修改了 (M)、删除了 (D) 还是新增加的 (A)，可以使用该参数。

[tokio](https://github.com/tokio-rs/tokio) 示例：

```bash
$ git show HEAD --name-status

commit a708ad19cb9ae652d8a813554e68cb1d86593eb9 (HEAD -> master, origin/master, origin/HEAD)
Author: example example@mail.dev
Date:   Tue Dec 30 00:09:38 2025 -0700

    chore: fix minor typos (#7804)

M       tokio/src/sync/mpsc/block.rs
M       tokio/src/sync/tests/loom_mpsc.rs
M       tokio/src/sync/tests/loom_notify.rs
M       tokio/src/sync/tests/loom_semaphore_batch.rs
M       tokio/src/time/sleep.rs
M       tokio/tests/net_unix_pipe.rs
M       tokio/tests/rt_basic.rs
```
</details>

<details>
<summary>**--stat：查看文件列表及修改统计**</summary>

如果想直观地看到每个文件修改了多少行代码，可以使用该参数。

[tokio](https://github.com/tokio-rs/tokio) 示例：

```bash
$ git show HEAD --stat

commit a708ad19cb9ae652d8a813554e68cb1d86593eb9 (HEAD -> master, origin/master, origin/HEAD)
Author: example example@mail.dev
Date:   Tue Dec 30 00:09:38 2025 -0700

    chore: fix minor typos (#7804)

 tokio/src/sync/mpsc/block.rs                 |  2 +-
 tokio/src/sync/tests/loom_mpsc.rs            |  8 ++++----
 tokio/src/sync/tests/loom_notify.rs          |  8 ++++----
 tokio/src/sync/tests/loom_semaphore_batch.rs |  8 ++++----
 tokio/src/time/sleep.rs                      |  2 +-
 tokio/tests/net_unix_pipe.rs                 | 10 +++++-----
 tokio/tests/rt_basic.rs                      |  8 ++++----
 7 files changed, 23 insertions(+), 23 deletions(-)
```
</details>