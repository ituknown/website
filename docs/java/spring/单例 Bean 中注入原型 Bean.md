Spring Bean 之间的注入和调用不可避免的会出现单例 Bean 和原型 Bean 互相调用的场景。在原型 Bean 中注入单例 Bean 不会出现什么问题，但是返回来在单例 Bean 中注入原型 Bean 不做特殊处理的话就会出现一些奇怪的问题。

<details open>
<summary>比如 Spring 官网对该场景的描述</summary>

In most application scenarios, most beans in the container are singletons. When a singleton bean needs to collaborate with another singleton bean or a non-singleton bean needs to collaborate with another non-singleton bean, you typically handle the dependency by defining one bean as a property of the other. A problem arises when the bean lifecycles are different. Suppose singleton bean A needs to use non-singleton (prototype) bean B, perhaps on each method invocation on A. The container creates the singleton bean A only once, and thus only gets one opportunity to set the properties. The container cannot provide bean A with a new instance of bean B every time one is needed.
</details>

文档地址：[https://docs.spring.io/spring-framework/docs/5.1.x/spring-framework-reference/core.html#beans-factory-method-injection](https://docs.spring.io/spring-framework/docs/5.1.x/spring-framework-reference/core.html#beans-factory-method-injection)