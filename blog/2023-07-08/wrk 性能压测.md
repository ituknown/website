---
slug: wrk-性能压测
title: wrk 性能压测
date: 2023-07-08T13:38
tags: [软硬件, 性能]
---

## 前言

wrk 是 HTTP 基准测试工具，在单个多核 CPU 上运行时能够产生大量负载，能充分利用CPU资源，是常用的压测工具，不过缺点是不支持 Windows。

对应的Github地址是：[https://github.com/wg/wrk](https://github.com/wg/wrk)。

类 UNIX 系统安装 wrk 非常简单，基本上都可以直接使用对应的包管理工具直接安装，具体可见：[https://command-not-found.com/wrk](https://command-not-found.com/wrk)。

<!-- truncate -->

如果你的发行版没有提供对应的安装方式，就只能选择编译安装了：

```bash
$ git clone https://github.com/wg/wrk.git
$ make
```

make之后，会在项目路径下生成可执行文件wrk，随后就可以用其进行HTTP压测了。可以把这个可执行文件拷贝到某个已在path中的路径，比如/usr/local/bin，这样就可以在任何路径直接使用wrk了。

默认情况下wrk会使用自带的LuaJIT和OpenSSL，如果你想使用系统已安装的版本，可以使用WITH_LUAJIT和WITH_OPENSSL这两个选项来指定它们的路径。比如：

```bash
$ make WITH_LUAJIT=/usr WITH_OPENSSL=/usr
```

## 参数及使用方式

wrk 命令基本语法如下：

```bash
$ wrk <options> <url>
```

其中可选参数如下：

```
-c, --connections <N>  TCP建立连接数
-d, --duration    <T>  请求持续时间
-t, --threads     <N>  使用线程数

-H, --header      <H>  指定HTTP请求头
    --latency          打印延迟统计信息
    --timeout     <T>  超时时间

-s, --script      <S>  Lua脚本(高级使用方式)

<N> 代表数字参数, 支持国际单位 (1k, 1M, 1G)
<T> 代表时间参数, 支持时间单位 (2s, 2m, 2h)
```

基本使用：

```bash
$ wrk -t12 -c400 -d30s --latency http://baidu.com
```

以上命令使用400个连接，使用12个线程对 baidu 进行了30秒压测。下面是输出示例：

```
Running 30s test @ http://baidu.com
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.00us    0.00us   0.00us    -nan%
    Req/Sec     0.00      0.00     0.00      -nan%
  Latency Distribution
     50%    0.00us
     75%    0.00us
     90%    0.00us
     99%    0.00us
  0 requests in 30.06s, 0.00B read
  Socket errors: connect 0, read 8446, write 0, timeout 0
Requests/sec:      0.00
Transfer/sec:       0.00B
```

## Lua 脚本

上面这种简单的压测可能不能满足我们的需求。比如我们可能需要使用POST请求跟服务器交互；可能需要为每一次请求使用不同的参数，以更好的模拟服务的实际使用场景等。wrk支持用户使用指定Lua脚本，来定制压测过程，满足个性化需求。

wrk 提供了一些 Lua 脚本示例，具体可以参考：

[https://github.com/wg/wrk/tree/master/scripts](https://github.com/wg/wrk/tree/master/scripts)

想要了解更多就需要稍微花点时间研究 Lua 脚本如何编写了~

下面是一个 POST JSON 请求示例：

post.lua：

```lua
wrk.method = "POST"
wrk.body = '{"seqname": "commons"}'
wrk.headers["Content-Type"] = "application/json"
```

wrk POST 请求压测示例：

```bash
$ wrk -s post.lua -t8 -c200 -d30s  http:://localhost:8080/adduser
```