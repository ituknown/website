比如有 csv 中有如下数据：

```csv title="order.csv"
order_id,user_id
23329989527,610049527
23330159862,502629862
23330595420,610205420
23330655420,610205420
```

我需要实现的功能是将 csv 中的行数据解析出来填充到 curl 命令参数中（如下示例）该如何解决？

```bash
curl \
-X POST \
-H "Content-Type: application/json" \
-d '{"command": "ALL", "orderId": $order_id, "userId"： $user_id}' \
"http://localhost:9120/api/syncOrder"
```

先说答案：使用 `while read` 配合 `IFS` 即可：

```bash
cat order.csv | while IFS=, read order_id user_id; do
    curl \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"command\":\"ALL\",\"orderId\":$order_id,\"userId\":$user_id}" \
    "http://localhost:9120/api/syncOrder"
done
```

或使用管道配合 `xargs -P` 并行执行：

```bash
cat order.csv | while IFS=, read -r orderId userId; do
    echo "curl -X POST \
    -H \"Content-Type: application/json\" \
    -d {\"command\":\"ALL\",\"orderId\":$order_id,\"userId\":$user_id} \
    http://localhost:9120/api/syncOrder"
done | xargs -I {} -P 5 bash -c "{}"
```

:::info[小提示]

curl -d 命令的通常写法都是：

```bash
curl -d '{}'
```

那下面这个

```bash
-d "{\"command\":\"ALL\",\"orderId\":$order_id,\"userId\":$user_id}"
```

为什么不能写成这种形式呢：

```bash
-d '{"command":"ALL","orderId":$order_id,"userId":$user_id}' \
```

主要是因为单引号会阻止 shell 对其内部的所有内容进行变量替换（展开）。导致的结果是 curl 接收到的数据体将是字面量字符串：

```json
{"command":"ALL","orderId":$order_id,"userId":$user_id}
```

而不是我们期望的：

```json
{"command":"ALL","orderId":0,"userId":0}
```
:::

<details open>
<summary>**题外话**</summary>

如果行只有一列数据怎么处理？比如：

```csv title="order.csv"
order
500002369
500002398
500002492
```

简单，别指定字段分隔符（即别设置 `IFS` 参数），直接使用 read 读取行数据即可：

```bash
cat order.txt | while read order_id; do
    curl \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"command\":\"ALL\",\"orderId\":$order_id}" \
    "http://localhost:9120/api/syncOrder"
done
```

不过，如果只有一列数据，还不如直接使用 xargs 管道方便，而且还更加高效：

```bash
cat order.txt | xargs -I {} curl \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"command\":\"ALL\",\"orderId\":{}}" \
    "http://localhost:9120/api/syncOrder"
```

</details>

再来看解释：

## IFS 解析

`IFS` 是 Internal Field Separator（内部字段分隔符）的缩写，可以用来实现“怎么把一行文本拆分成多个字段”。

默认情况下，`IFS` 值是：

```
<空格><制表符><换行符>
```

也就是说，shell 在处理诸如 `read`、`for`、`set` 等命令时，会把空格、Tab 和换行当作分隔符。因为该 csv 中每行之间的内容使用的是 `,` 分隔字符，所以需要明确指定 `IFS=,`。

至于 `read` 命令则用于实现将读取的内容按顺序赋值给指定的变量。示例：

```bash
line="apple banana cherry"
read a b c <<< "$line"
echo "$a | $b | $c" // 输出: apple | banana | cherry
```

因为 line 中的字符使用的是空格分隔，所以 read 会自动分隔字符并赋值给 a、b、c。

再比如如果只使用两个变量接收：

```bash
line="apple banana cherry"
read a b <<< "$line"
echo "$a | $b" // 输出: apple | banana cherry
```

再比如下面的示例：

```bash
line="apple banana|cherry"
read a b <<< "$line"
echo "$a | $b" // 输出: apple | banana|cherry
```

如果想输出的是 `apple | banana|cherry` 则需要使用 IFS 指定分隔符：

```bash
line="apple banana|cherry"
IFS=| read a b <<< "$line"
echo "$a | $b" // 输出: apple | banana|cherry
```
