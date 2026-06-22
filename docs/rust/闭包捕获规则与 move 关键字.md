Rust 闭包捕获变量有三种方式，分别是：按值捕获、按引用捕获和按可变引用捕获。具体捕获方式不需要明确指定，编译器会根据变量在闭包中如何使用自动推导。不过遵循如下规则：

|捕获方式|规则|
|:-----|:----|
|按值捕获|变量在闭包中发生所有权转移|
|按引用捕获|变量在闭包中没有发生所有权转移，只读外部变量，不做修改|
|按可变引用捕获|变量在闭包中没有发生所有权转移，但是需要修改外部变量的值|

另外，闭包也可以同时以多种方式捕获不同的外部变量，具体方式由使用方式决定。

:::info[注意]
如果变量的类型实现了 `Clone` 或者 `Copy` 特征，将会按值捕获，但是不会发生所有权转移。这是 Rust 基础，一点都不难理解。还是使用简单是例子说明下吧：

```rust
fn main() {
    let x = 10;
    let y = x; // 这里并没有发生所有权转移，底层执行了 Clone 操作
    println!("x = {x}, y = {y}"); // x 依然能正常访问
}
```
:::

## 按值捕获

```rust
fn main() {
    let greeting = String::from("Good morning");

    let closure = || {
        // 捕获外部变量，发生所有权转移
        let mut new_greeting = greeting; // 按值捕获

        // 所有权已经转移包闭包中，此时修改不会影响捕获行为
        new_greeting.push_str(", Bob");

        println!("{}", new_greeting);
    };

    closure();

    // 变量所有权已经转移到闭包中，这里编译会提示错误：Value used after being moved
    println!("{:?}", greeting);
}
```

String 类型在标准库中并没有实现 Clone 和 Copy trait，所以闭包函数 closure 内部 `let mut new_greeting = greeting;` 执行的是所有权转移操作。后续外部如果再使用 greeting，在编译时会提示错误：“Value used after being moved”。

这种将所有权转移到闭包内部的方式，就是按值捕获。

## 按引用捕获

```rust
fn main() {
    let greeting = String::from("Good morning");

    let closure = || {
        // 捕获外部变量，只读变量值（没有转移所有权）
        println!("{}", greeting); // 按引用捕获
    };

    closure();

    // 闭包中没有发生所有权转移，这里会正常输出
    println!("{:?}", greeting);
}
```

按引用捕获最简单，就是对外部变量做只读操作，不转移变量的所有权。

## 按可变引用捕获

```rust
fn main() {
    // 变量在闭包中需要修改，所以需要使用 mut 模式
    let mut greeting = String::from("Good morning");

    // 闭包也是一个表达式，内部数据涉及修改操作，所以 closure 必须是 mut 模式
    let mut closure = || {
        // 捕获外部变量，并且修改变量值（没有转移所有权）
        greeting.push_str(", Bob"); // 按可变引用捕获
        println!("{}", greeting);
    };

    closure();

    // 闭包中没有发生所有权转移，这里会正常输出
    println!("{:?}", greeting);
}
```

按可变引用捕获同样是不修改变量的所有权，但是会修改外部变量的值。

## 混合捕获

闭包中，允许针对不同的变量使用不同的捕获方式，示例代码：

```rust
fn main() {
    let name = String::from("John Smith");
    let language = String::from("Rust");

    let closure = || {
        // language 发生了所有权转移
        let new_language = language;

        // name 做只读操作
        println!("{} say: I love {}", name, new_language);
    };

    closure();

    // 闭包中没有发生所有权转移，这里会正常输出
    print!("{} say: ", name);

    // 闭包中发生了所有权转移，这里编译会提示错误：borrow of moved value: `language`
    print!("I love {}", language);
}
```

## FnOnce、Fn、FnMut 与捕获方式的关系

FnOnce、Fn 和 FnMut 三个 Trait 本质是对闭包的抽象，你可以将这三个特征与前面说的捕获方式划等号（其实不严谨，但是这样更方便理解）：

|特征|捕获方式|
|:--|:------|
|FnOnce|按值捕获|
|Fn|按引用捕获|
|FnMut|按可变引用捕获|

看下标准库（rustc 1.92.0）里这三个 trait 的定义：

```rust
pub const trait FnOnce<Args: Tuple> {
    fn call_once(self, args: Args) -> Self::Output;
}

pub const trait FnMut<Args: Tuple>: FnOnce<Args> {
    fn call_mut(&mut self, args: Args) -> Self::Output;
}

pub const trait Fn<Args: Tuple>: FnMut<Args> {
    fn call(&self, args: Args) -> Self::Output;
}
```

<details>
<summary>rustc 1.85.0 新增了异步变体，支持 async 语法</summary>

```rust
pub trait AsyncFnOnce<Args: Tuple> {
}

pub trait AsyncFnMut<Args: Tuple>: AsyncFnOnce<Args> {
}

pub trait AsyncFn<Args: Tuple>: AsyncFnMut<Args> {
}
```
</details>

从依赖行为中也能看出 FnOnce 最宽松，它的含义是闭包只能调用一次，本质是因为外部变量在闭包中发生了所有权转移。因为所有权转移之后，后续就无法再使用，所以 FnOnce 只能调用一次。

FnMut 要求的是变量可以在闭包中修改，并不会涉及所有权转移。而 Fn 只会对外部的变量做读操作，所以变量在闭包中可以修改（FnMut）那就一定可以读。

不过不要被上面的定义迷惑了，这三个 trait 只是对变量的最小约束，实际编译器很聪明，会自定将 Fn “升级处理”。比如下面代码：

```rust
fn greeting<F: FnOnce()>(f: F) {
    f();
}

fn main() {
    let name = String::from("Good morning");

    let closure = || {
        println!("Good morning, {}", name);
    };

    greeting(closure);
    greeting(closure);
}
```

greeting 函数定义 F 必须满足 FnOnce 的要求。FnOnce 的含义是闭包只能调用一次，但是示例中定义的闭包（`closure`）却可以调用多次。这是因为 `closure` 对外部的变量是按引用捕获，按引用捕获符合的是 Fn trait。

而标准库对 Fn 的定义是：符合 Fn 的前提一定要满足 FnOnce 约束。所以 closure 完全能够满足 FnOnce 的条件约束，这就是为什么能够调用多次的原因。

现在将闭包修改一下，在内部执行所有权转移：

```rust
fn greeting<F: FnOnce()>(f: F) {
    f();
}

fn main() {
    let name = String::from("Good morning");

    let closure = || {
        let new_name = name; // 所有权转移
        println!("Good morning, {}", new_name);
    };

    greeting(closure);
    greeting(closure); // 编译时这里将会提示错误：value used here after move
}
```

因为发生了所有权转移，`closure` 就“退化”为 FnOnce 了。当第二次调用时，已经无法获取 name 了，所以编译时会提示：value used here after move。

我如果将 F 的约束调整为 Fn：

```rust
fn greeting<F: Fn()>(f: F) {
    f();
}
```

那之前闭包还能继续使用吗？答案是不能，因为 name 发生了所有权转移。Fn 的约束是：没有发生所有权转移。所以如何使用这三个 trait 只需要看如何使用外部变量即可。

## move 关键字

move 关键字的做作用是：<u>将捕获的变量的所有权转移到闭包内部，转移后的变量成为闭包的全局变量</u>。看下下面这个代码：

```rust {4,11}
fn main() {
    let name = String::from("John Smith");

    let closure = move || {
        println!("closure: {}", name);
    };

    closure();
    closure(); // 可以执行多次

    println!("main: name = {}", name);
}
```

这个代码完全符合[按引用捕获](#按引用捕获)规则，理论上 println 应该能正常输出，实际上编译时会提示错误：“borrow of moved value: `name`”。原因是 move 关键字将闭包内捕获的变量的所有权转移到闭包中了。可以将 closure 想象为一个结构体，执行闭包本质就是调用结构体的方法。下面是抽象代码：

```rust {3,9}
// closure 就是一个结构体
struct Closure {
    name: String, // 抽象代码, move 将捕获的变量变成结构体的属性
}

impl Fn<()> for Closure {
    fn call(&self) {
        // 执行 closure 本质就是调用结构体的内部方法
        println!("closure: name = {}", self.name);
    }
}
```

执行闭包函数实际就是调用 `Closure::call` 方法，call 无论调用多少次都可以，因为只是读结构体的属性而已。

继续看下如果 move 修饰的闭包修改捕获的变量会发生什么：

```rust {5}
fn main() {
    let mut name = String::from("John Smith");

    let mut closure = move || {
        name.push_str(", Dave");
        println!("closure: {}", name);
    };

    closure();
    closure(); // 可以执行多次
}
```

实际输出如下：

```
closure: John Smith, Dave
closure: John Smith, Dave, Dave
```

如果猜对了说明理解了前面抽象的 Closure 结构体，因为 `mut closure` 可以抽象为只是在 `call_mut` 中修改结构体的属性：

```rust {2,7}
struct Closure {
    name: mut String, // 抽象代码, move 将捕获的变量变成结构体的可变属性
}

impl FnMut<()> for Closure {
    fn call_mut(&mut self) {
        self.name.push_str(", Dave"); // 修改内部的可变属性
        println!("closure: name = {}", self.name);
    }
}
```