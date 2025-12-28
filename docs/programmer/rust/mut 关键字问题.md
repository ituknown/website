在写 Rust 时经常会遇到一个容易让人迷惑的点，那就是<u>当变量转移所有权时 mut 扮演者什么角色</u>？

:::tip[Rust 对 mut 的解释是]
mut 关键字在函数参数中并不属于函数签名（Signature）的一部分，它属于模式匹配（Pattern Binding）的一部分。
:::

我对 mut 属于模式匹配的这一部分也没疑惑，对下面个代码时也没疑惑点。因为 greeting 获取到了 name 的所有权，所以可以对变量设置 mut 模式：

```rust
fn greeting(mut name: String) { // 获取所有权之后设置 mut 模式
    name.push('!');
    println!("Hi {name}");
}

fn main() {
    let name = "Bob".to_owned();
    greeting(name); // 转移所有权
}
```

不过当我初次写 Trait self 时，出现了疑问点。比如 Trait定义如下：

```rust
trait Handler {
    fn call(self);
}
```

方法签名明确定义了会发生所有权转移，那么当实现这个 Trait 时 `self` 能重写为 `mut self` 吗？

```rust
struct MyStruct;

impl Handler for MyStruct {
    // Trait 里没写 mut，这里可以写 mut 吗
    fn call(mut self) {
    }
}
```

:::danger[答案是可以的]
当定义 `fn call(self)` 时，只是告诉编译器：`call` 方法会获取 `self` 的所有权。至于进入函数体后，你是打算静静地看着它，还是打算修改它，那是实现（impl）时的事情。

那在定义 Trait 时，应不应该明确设置 mut 模式呢？关于这点，Rust 文档并没有明确说明。不过根据社区实践总结来说，增加 mut 通常被视为冗余。因为即使你在定义时没有写 mut，在具体实现时依然可以根据业务情况自由选择是否添加 mut。
:::