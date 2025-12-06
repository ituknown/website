## 写在前面

ImportSelector 接口是 Spring 3.1 开始提供的一个可以配合 `@Import` 注解使用实现动态导入外部配置类根据类的功能（导入的配置类是根据类型导入），也就是注册 Bean。

如果你没在实际中使用过该类，那不知道你有没有听过<u>自动装配</u>这个词？所谓的自动装配就是利用该接口实现。

该接口只有一个方法 `selectImports` 返回值是一个 `String` 数组，源代码如下：

```java
package org.springframework.context.annotation;

public interface ImportSelector {

	String[] selectImports(AnnotationMetadata importingClassMetadata);

}
```

该数组返回的值是类的全限定名，也就是包名加类型。示例： `com.ituknown.User` 。一般直接根据类型获取即可，即： `Class<T>.class.getName()` 。

另外，该接口有一个重要的衍生接口： DeferredImportSelector 。该接口扩展了 ImportSelector 接口提供了一个分组功能，从字面意思来看就是延时导入选择器。事实上，确实如此。所有实现了该接口的类都是在 `@Configuration` 配置类执行完成之后执行。现在，你应该对该接口有了一个粗略的概念。先来看下该接口：

```java
package org.springframework.context.annotation;

public interface DeferredImportSelector extends ImportSelector {

    // 分组
	@Nullable
	default Class<? extends Group> getImportGroup() {
		return null;
	}

	interface Group {
        // ... 分组接口
	}

}
```

<details open>
<summary>**Spring 官网对该接口的解释如下**</summary>

A variation of ImportSelector that runs after all `@Configuration` beans have been processed. This type of selector can be particularly useful when the selected imports are `@Conditional`  Implementations can also extend the `org.springframework.core.Ordered` interface or use the `org.springframework.core.annotation.Order` annotation to indicate a precedence against other `DeferredImportSelectors`.

从这段话我们可以大概知道如下几点：

+ 该接口的实现类在 `@Configuration` 配置类执行完成之后执行
+ 该接口可以配置 `@Conditional` 接口进行条件注入
+ 至于所谓的 `Order` 接口也就是定义其执行顺序
</details>

在 SpringBoot 中， DeferredImportSelector 接口被大量使用，也是这里主要说明的接口。因为该接口是 ImportSelector 接口的扩展类，所以我们通常都是直接使用 DeferredImportSelector 实现动态导入 Bean。

:::tip
ImportSelector 一定要与 @Import 注解配合使用才能达到注册 Bean 的功能，有关 @Import 注解见 [@Import 的三种使用方式](./@Import%20的三种使用方式.md)
:::

## 一个简单的示例

前面说了那么多，都只是理论知识，最佳的解释还是实践的真知。这里基于 Spring 5.2.3.RELEASE 做演示说明，在 pom 中引入 Spring 依赖即可：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-framework-bom</artifactId>
            <version>5.2.3.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
    </dependency>
</dependencies>
```

<details open>
<summary>**为什么使用 `<dependencyManagement />`？**</summary>

在该标签中引入 Spring 挂网提供的根依赖 `spring-framework-bom` 并指定版本后，后续我们在引入的 Spring 依赖就不需要指定版本了，更方便管理。
</details>

示例很简单，仅仅需要创建四个类即可：User、Config、 Application 和 UserImportSelector 类。

User 是很简单的一个实体类，Config 则是 JavaConfig 配置类，Application 类是演示测试类，而 UserImportSelector 是实现了 ImportSelector 接口的实现类，我们需要与 `@Import` 注解配合使用来将 User 注册为 Bean。

```java
// 实体类
public class User implements Serializable {

    private static final long serialVersionUID = -6411668546137854809L;

    private String name = "ituknown";

    private Integer age = 18;

    // Getter、Setter And ToString
}

// JavaConfig
@Configuration
@Import(UserImportSelector.class)  // <===== 导入 ImportSelector 实现类
public class Config {

}

// 测试启动类
public class Application {

    public static void main(String[] args) {

        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(Config.class);
        User user = context.getBean(User.class);
        System.out.println(user.toString());

    }
}
```

而 ImportSelector 的实现类如下：

```java
public class UserImportSelector implements ImportSelector, BeanFactoryAware {

    private BeanFactory beanFactory;

    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        System.out.println("----------AnnotationMetadata-----------");
        importingClassMetadata.getAnnotationTypes().forEach(System.out::println);

        System.out.println("----------beanFactory-----------");
        System.out.println(beanFactory);

        try {
            beanFactory.getBean(User.class);
        } catch (Exception e){
            System.out.println("User.class 还没有被 Spring 管理");
        }

        // 导入 User 全限名
        return new String[]{User.class.getName()};
    }

    @Override
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        this.beanFactory = beanFactory;
    }
}
```

在 UserImportSelector 类中除了实现了 ImportSelector 接口外还实现类 `BeanFactoryAware` 接口。原因是为了获取 `BeanFactory` 对象，在重写方法中打印了注解元数据信息和 BeanFactory，接着利用 BeanFactory 尝试获取 User ，如果该类还没有被 Spring 管理将会在异常语句块中打印信息，我们返回该类的全限定名，以便于被 Spring 管理。

之前有说过， ImportSelector 接口是根据类型导入而不是根据名称导入的原因就是因为返回的对象是类的全限定名。如果之后被 Spring 管理我们只能通过类型获取该 Bean，而不能根据名称，原因就在于此！

如果 `Uesr` 被成功导入，那么在启动类中将会获得 `User.class` 类型的 Bean，并进行打印信息。如果正常输出就表示我们成功利用 ImportSelector 接口配合 `@Import` 注解动态导入 Bean。

最后启动输入信息如下：

```
----------AnnotationMetadata-----------
org.springframework.context.annotation.Configuration
org.springframework.context.annotation.Import
----------beanFactory-----------
org.springframework.beans.factory.support.DefaultListableBeanFactory@56ac3a89: defining beans [org.springframework.context.annotation.internalConfigurationAnnotationProcessor,org.springframework.context.annotation.internalAutowiredAnnotationProcessor,org.springframework.context.annotation.internalCommonAnnotationProcessor,org.springframework.context.event.internalEventListenerProcessor,org.springframework.context.event.internalEventListenerFactory,config]; root of factory hierarchy
User.class 还没有被 Spring 管理
User{name='ituknown', age=18}  // <==== 输出 User.class 信息
```

以上，就是 ImportSelector 接口最基本的使用方式。从该实例中应该能体会到其功能的强大以及使用方式。另外非常最要的一点是：必须配合 `@Import` 注解使用！

现在再回头看下 ImportSelector 接口的方法以及返回值：

```java
String[] selectImports(AnnotationMetadata importingClassMetadata);
```

既然，其返回值是 String 数组类型，并且其值是要导入类的全限定名那我们如何实现动态导入呢？这里就要说下自动装配了。

## 自动装配的实现

在开发 SpringCloud 项目时我们经常会遇到使用 `@Enable` 开头的注解，每次引入一个新组件只需要在配置类上增加该组件提供的特定 `@EnableXX` 注解即可启用该功能。为什么这么神奇呢？一个注解就实现了启动组件的功能！是不是有点类似开关的功能呢？

在开发 SpringCloud 项目时我们一定会用到的一个组件就是服务注册发现，我们也经常听到这个词，而且我们也知道对于客户端只需要在启动类或者配置类上增加一个 `@EnableDiscoveryClient` 注解即可实现服务注册发现。不管你使用的注册中心是 Eureka 、还是 Consul 或者是阿里巴巴的 Nacos。这是我们在配置上增加该注解就能实现服务的注册与发现，太神奇了是不是？

当然，第三方组件之所以这么方便使用主要还是因为 SpringCloud 官方封装的 `spring-cloud-commons` 组件太优秀了！

不管 SpringCloud 如何优秀，如何新颖，但内部还是基于 Spring 做的封装。比如 SpringBoot 的自动装配还是源于 Spring 的功能，再次基础上做了一次封装。所以，如果你能策底的玩转 Spring ，那所谓的 SpringBoot 也就是洒洒水了 ~

说了这么多，我们就来看下自动装配到底是如何实现的。之前说了， DeferredImportSelector 接口是扩展了 ImportSelector 接口。而且 SpringBoot 也是大量使用了该接口，该接口的好处不言而喻（字面意思理解即可）。

之前的例子是基于 ImportSelector 实现的一个动态导入功能。而在 SpringCloud 所有的动态导入都是定义在 `resources` 资源目录下的 `META-INF` 文件夹下，文件名称被称之为： `spring.factories` 。这个文件你熟悉吗？

我们就将 `spring-cloud-commoms` 包下的文件内容展示出来看下：

```plaintext
## AutoConfiguration
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.cloud.client.CommonsClientAutoConfiguration,\
org.springframework.cloud.client.discovery.composite.CompositeDiscoveryClientAutoConfiguration,\
org.springframework.cloud.client.discovery.noop.NoopDiscoveryClientAutoConfiguration,\
org.springframework.cloud.client.discovery.simple.SimpleDiscoveryClientAutoConfiguration,\
org.springframework.cloud.client.hypermedia.CloudHypermediaAutoConfiguration,\
org.springframework.cloud.client.loadbalancer.AsyncLoadBalancerAutoConfiguration,\
org.springframework.cloud.client.loadbalancer.LoadBalancerAutoConfiguration,\
org.springframework.cloud.client.loadbalancer.reactive.ReactiveLoadBalancerAutoConfiguration,\
org.springframework.cloud.client.serviceregistry.ServiceRegistryAutoConfiguration,\
org.springframework.cloud.commons.httpclient.HttpClientConfiguration,\
org.springframework.cloud.commons.util.UtilAutoConfiguration,\
org.springframework.cloud.client.serviceregistry.AutoServiceRegistrationAutoConfiguration


## Environment Post Processors
org.springframework.boot.env.EnvironmentPostProcessor=\
org.springframework.cloud.client.HostInfoEnvironmentPostProcessor
```

该文件类似的内容你一定很熟悉，所有的自动装配都是基于此！看下第一行的内容：`EnableAutoConfiguration` ，这个类熟悉吗？该字段后面的内容不可以不熟悉，但是该类你一定要知道，字面上的意思：**自动装配**。

先不管内容，先看下内容格式： `key=val1,val2` ，其数据结构就是：对内容 `val1` 和 `val2` 指定了一个 `key` 。你可以通过指定的 `key` 获取起 `vals` 值。所以，你可以将其理解为是一个 `Map` 数据格式，只不过`key` 对象对应的内容是一个集合！

上面可能难以理解，我们先来看下一个示例来理解上面的内容：

### 定义 SpringFactoryImportSelector

定义一个类： `SpringFactoryImportSelector` ，并指定泛型 `T` ，该类实现了 DeferredImportSelector 和 `BeanClassLoadAware` 接口。

实现 DeferredImportSelector 接口不难理解，但是为什么要实现 `BeanClassLoadAware` 接口呢？原因是该接口在 Spring 初始化时会将 `ClassLoader` 对象返回给我们，我们需要利用该对象加载 `spring.factories` 文件的内容。有关 `Aware` 接口这里不做说明，具体见 [Aware 容器感知化技术](./Aware%20容器感知化技术.md) 。

`SpringFactoryImportSelector` 内容如下所示：

```java
public class SpringFactoryImportSelector<T extends Annotation> implements DeferredImportSelector, BeanClassLoaderAware {

    private ClassLoader classLoader;

    private Class<T> annotationClass;

    @SuppressWarnings("unchecked")
    public SpringFactoryImportSelector() {
        // 通过泛型 T 获取指定注解类
        this.annotationClass = (Class<T>) GenericTypeResolver
                .resolveTypeArgument(this.getClass(), SpringFactoryImportSelector.class);

    }

    @Override
    public void setBeanClassLoader(ClassLoader classLoader) {
        this.classLoader = classLoader;
    }

    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {

        List<String> loadNames = SpringFactoriesLoader.loadFactoryNames(this.annotationClass, this.classLoader);
        List<String> factories = new ArrayList<>(new LinkedHashSet<>(loadNames));

        return factories.toArray(new String[factories.size()]);
    }
}
```

在定义泛型 `T` 时，我们指定了其是 `Annotation` 的子类，即必须是注解类！为什么要这么定义？稍后做说明。

在构造方法中，使用 `GenericTypeResolver` 类进行获取该泛型注解类。Spring 对该类的解释是（按照字面意思理解即可）：

```
Helper class for resolving generic types against type variables.
```

之后，我们重写了 `BeanClassLoaderAware` 接口的 `void setBeanClassLoader(ClassLoader classLoader)` 方法，该方法会在 spring 容器初始化时返回给我们一个 `ClassLoader` 对象，之后我们需要利用该对象。

最后我们重写了 DeferredImportSelector 接口的 `String[] selectImports(AnnotationMetadata importingClassMetadata)` 方法。在该方法中最主要的一行代码是：

```java
List<String> loadNames = SpringFactoriesLoader.loadFactoryNames(this.annotationClass, this.classLoader);
```

现在来进行详细说明。在代码中调用了 `SpringFactoriesLoader` 类的 `loadFactoryNames` 方法。其实，该类还有其他方法，这里仅展示我们需要的即可。源码如下（一定要注意看注释，很重要）：

```java
public final class SpringFactoriesLoader {
    private SpringFactoriesLoader() {}
    // 指定 spring.factories 在 resources 目录下的路径

    public static final String FACTORIES_RESOURCE_LOCATION = "META-INF/spring.factories";

    // 缓存, 所有 spring.factories 内容的缓存. 该缓存是一个 Map 对象, 其 Key(即ClassLoader)
    // 就是我们指定注解的全限定名, 看下接下来的方法就明白了
    // 而 Val 是一个 MultiValueMap 对象, 也就是之前说了 val1,val2 数据格式
    private static final Map<ClassLoader, MultiValueMap<String, String>> cache = new ConcurrentReferenceHashMap<>();

    public static List<String> loadFactoryNames(Class<?> factoryType, @Nullable ClassLoader classLoader) {
        // 在前面的代码中, 我们传递的是 factoryType 参数对应的是注解类
        // 在这里就通过 Class.getName() 来进行获取该注解的全限定名, 比如: com.ituknown.EnableUser
        // 该全限定名就是用来匹配 spring.factories 中的 key, 所以之后我们需要在 spring.factories
        // 中进行指定该 key
        String factoryTypeName = factoryType.getName();

        // 通过 key 进入 spring.factories 文件中查找对应的值
        Map<String, List<String>> map = loadSpringFactories(classLoader);

        // 这里调用了 Map 的方法, 不做解释
        return map.getOrDefault(factoryTypeName, Collections.emptyList());
    }

    private static Map<String, List<String>> loadSpringFactories(@Nullable ClassLoader classLoader) {
        // 直接通过全限定名查找缓存, 如缓存中已经有 spring.factories 指定 key 的内容
        // 就直接将结果返回
        MultiValueMap<String, String> result = cache.get(classLoader);
    	if (result != null) {
            return result;
    	}
    	try {
            // 这行代码直观的解释就是: ClassLoader.getSystemResources("META-INF/spring.factories");
            // 即获取在系统环境中 spring.factories 文件所在的路径
            Enumeration<URL> urls = (classLoader != null ?
            		classLoader.getResources(FACTORIES_RESOURCE_LOCATION) :
            		ClassLoader.getSystemResources(FACTORIES_RESOURCE_LOCATION));

            // 这里的代码就很容易理解了, 通过全限定名进入 spring.factories 文件中进行查找内容
            // 最后获取该值并放在 LinkedMultiValueMap 对象中, 最后进行返回
            result = new LinkedMultiValueMap<>();
            while (urls.hasMoreElements()) {
                URL url = urls.nextElement();
                UrlResource resource = new UrlResource(url);
                Properties properties = PropertiesLoaderUtils.loadProperties(resource);
                for (Map.Entry<?, ?> entry : properties.entrySet()) {
                    String factoryTypeName = ((String) entry.getKey()).trim();
                    for (String factoryImplementationName : StringUtils.commaDelimitedListToStringArray((String) entry.getValue())) {
                        result.add(factoryTypeName, factoryImplementationName.trim());
                    }
                }
            }
            // 方法哦缓存中, 之后再次查找是之久通过缓存中返回
            cache.put(classLoader, result);
            return result;
    	} catch (IOException ex) {
            // ...
    	}
    }
    // 省略其他非必须代码 ...
}
```

以上就是对该代码的解释，所有的内容都在注释上进行了说明。建议结合源代码配合该注释阅读，更易于理解😘

之后的代码 `List<String> factories = new ArrayList<>(new LinkedHashSet<>(loadNames))` 就容易理解了，就是获取的内容去重转 List，在返回之前进行了 `List.toArray` 转成数组对象返回。

至于为什么定义该类其实就是为了便于后续使用，这个类也算是一个公用类了。

之后的代码就简单了：

### 定义 EnableUserImportSelector

这个类是随意定义的，你可以随意定义。但是你定义的类必须继承前面定义的 `SpringFactoryImportSelector` 类，代码很简单，没做任何逻辑处理。就是将获取的值进行了直接返回：

```java
public class EnableUserImportSelector extends SpringFactoryImportSelector<EnableUser> {

    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        return super.selectImports(importingClassMetadata);
    }
}
```

注意：我们指定的泛型是 `EnableUser` 自定义注解！

### 自定义 EnableUser

看看，该注解是 `Enable` 开头，之后是 User ，含义不言而喻了。笔者就是要使用该注解导入 User 类型对象！该注解很简单：

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
@Import(EnableUserImportSelector.class)  // <==== 看这里, 直接将 EnableUserImportSelector 导入即可
public @interface EnableUser {
}
```

### 配置代码

之后的代码就是讲之前的代码进行了一次拷贝：

```java
// JavaConfig
@Configuration
@EnableUser  // <=== 看这里, 这里不在使用 @Import 注解, 而是直接使用自定义注解
public class Config {
}

// 实体类
public class User implements Serializable {

    private static final long serialVersionUID = -6411668546137854809L;

    private String name = "ituknown";

    private Integer age = 18;

    // Getter、Setter And ToString
}
```

你看看,与之前的代码不同哎，这里没有进行 `User.class` 导入，只是简单的定义了一个实体类。关键的来了：

### 定义 spring.factories 内容

在 `resources` 资源目录下创建一个 `META-INF` 文件夹，在该文件夹下创建一个文件：`spring.factories`。

在该文件中，我们需指定一个 key，该 key 就是我们自定义注解的全限定名。我将自定义注解 `**EnableUser**`** **放置在 `com.ituknown.spring` 包下，而 User 类也在改包下。所以该文件的内容就是：

```plain
com.ituknown.spring.EnableUser=\
  com.ituknown.spring.User
```

### 启动测试类

测试类就是之前的 `Application` ，没做任何修改：

```java
public class Application {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(Config.class);
        User user = context.getBean(User.class);
        System.out.println(user.toString());

    }
}
```

启动后输出内容如下：

```
User{name='ituknown', age=18}
```

到这里，你有明白自动装配的原理了吗？与最开始的示例相比，自定义自动装配就是提前将需要导入的类通过全限定名写入 `spring.factories` 文件中。当需要使用该类是我们只需要使用自定义的注解启用即可！

你可能会问，如果导入多个类？简单！将 `User.class` 拷贝一份，命名为 `User2.class` 。修改内容如下：

```java
public class User2 implements Serializable {

    private static final long serialVersionUID = -6411668546137854809L;

    private String name = "ituknown2";

    private Integer age = 18;

    // Getter、Setter And ToString
}
```

将值进行了修改，接着在 `spring.factories` 文件中增加该类的全限定名：

```plain
com.ituknown.spring.EnableUser=\
  com.ituknown.spring.User,\
  com.ituknown.spring.User2
```

最后，我们在启动类中同时输出 User 和 `User2` ：

```java
public class Application {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(Config.class);
        User user = context.getBean(User.class);
        User2 user2 = context.getBean(User2.class);
        System.out.println(user.toString());
        System.out.println(user2.toString());

    }
}
```

输出内容如下：

```plain
User{name='ituknown', age=18}
User2{name='ituknown2', age=18}
```

现在，道友！你明白 SpringBoot 的自动装配的原理了吗？

## 写在最后

在前面特意定义了一个类 `SpringFactoryImportSelector` ，有特别说明这个类是共用类。之后所有自定义的注解指定的 `EnableXxxImportSelector` 类都可以继承该类，只需要在类中先调用父类接着编写代码逻辑即可！

最后的最后，千万别忘记在 `spring.factories` 中指定你需要启用的类的全限定名！

:::tip
`spring.factories` 指定的 key 就是注解的全限定名，`SpringFactoryImportSelector` 指定的泛型，就是你自定义的注解！
:::

所以，自动装配的原理就是这么简单。如果你之后看源码的话，你就会发现我这里所谓自定义的 `SpringFactoryImportSelector` 就是源码中的同名类。而且内容也是其简写版，之所以这么一步一步来的原因就是为了便于理解而已，也仅此而已！

好了，现在各位童鞋也尝试写一个用于自动装配的注解吧🌹~
