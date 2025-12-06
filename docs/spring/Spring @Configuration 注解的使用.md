## 前言

@Configuration 注解是我们初识 JavaConfig 配置后最常使用的一个注解，甚至可以说该注解是我们最熟悉也是最陌生的注解（为什么要说最陌生？因为你未必真的懂他）。

在 SpringBoot 的大环境下我们基本上都已经摒弃了被 XML 支配的噩梦。但事实上，Spring 自 3.0 开始就已经整合了 JavaConfig。但那是很久远之前的事，笔者真正拥抱 JavaConfig 是在 Spring 4.x。

而我们学习 JavaConfig 的第一课就是认识 `@Configuration**` 注解。

吹个牛来说，大家都是在公司能够独当一面做开发的人了，或多或少的都有被 XML 支配的恐惧。实在是因为配置起来太臃肿、繁琐和复杂！

一个项目里通常都会有多个 XML 配置文件。但是不管有多少个配置文件其语法都是使用 `<beans />` 标签包裹，在标签中我们一般还要引入各种命名空间，比如 `C` 命令空间、`P` 命名空间等。而我们自定义的 Bean 则是在其内部，基本上都是如下写法：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- 在 beans 内部引入命名空间, 如 AOP: xmlns:aop -->
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd">

    <!--bean注册-->
    <bean id="xxx1" class="com.xxx.spring.XXX1" />
    <bean id="xxx2" class="com.xxx.spring.XXX2" />
    <bean id="xxx3" class="com.xxx.spring.XXX3" />
</beans>
```

但是，自从使用 `JavaConfig` 之后，我们发现我们的配置彻底的变了：

```java
@Configuration
public class Config {
    /** 定义Bean */
}
```

更简单、更高效！简单的几行代码，没有多余的引用。仅仅需要在一个类上增加一个 @Configuration 注解，我们定义的所有 Bean 都是在这个类内部，是不是就是 XML  `<beans />` 的变种？

说了这么多，笔者就想问一个问题：基于JavaConfig 的配置形式，为什么要在配置类上使用 `@Configuration` 注解？可不可以不加？该注解的真正作用是什么？

这些问题你有认真思考过吗？

## 再识 @Configuration 

为了彻底的理解 @Configuration 注解我们还是要从最基本的示例开始：

```java
// 随意定义两个类
public class IndexService {

    public IndexService() {
        System.out.println("初始化IndexService");
    }
    public void print(){
        System.out.println("Print Index Service");
    }
}

public class UserService {

    public UserService() {
        System.out.println("初始化UserService");
    }
    public void print(){
        System.out.println("Print User Service");
    }
}

// 定义一个配置类, 将上面两个类注册为 Bean
@Configuration
public class Config {

    @Bean
    public UserService userService() {
        return new UserService();
    }

    @Bean
    public IndexService indexService() {
        return new IndexService();
    }
}
```

现在我们使用测试程序测试一下：

```java
public class Application {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(Config.class);

        IndexService index = context.getBean(IndexService.class);
        index.print();

        UserService user = context.getBean(UserService.class);
        user.print();
    }
}
```

示例很简单，就是注册 Bean 之后尝试获取这两个 Bean。打印结果如下：

```
初始化UserService
初始化IndexService
Print Index Service
Print User Service
```

这是不是表示 IndexService 和 UserService 成功被 Spring 容器管理了？

那现在我们将 Config 类上的 @Configuration 注解去掉，再次打印。然鹅，你会发现输出结果还是一样，没有任何变化。这体现出：加不加 `@Configuration` 注解没任何影响，打印结果相同，这是什么原因？

现在我们再将配置类修改如下：

```java
// 移除 @Configuration 注解
public class Config {

    @Bean
    public UserService userService() {
        return new UserService();
    }

    @Bean
    public IndexService indexService() {
        userService(); // <=== 注意这里
        return new IndexService();
    }
}
```

也就是在初始化 IndexService 时调用一个 `userService()` 方法。现在看一下输出结果会是什么：

```
初始化UserService
初始化UserService
初始化IndexService
Print Index Service
Print User Service
```

其实答案很显然，打印两次 `初始化UserService` 。这表示 UserService 被初始化两次，这完全是正常的对吧？因为我们确实是调用了两次 `userSerivce()` 方法，自然就执行了两次 `new UserService()` 。但是我们如果将 @Configuration 注解加上再次执行，你会发现 `初始化UserService` 只被打印了一次！！！

这是什么原因？编译器出 Bug 了？作为开发人员你要永远记住一句话：**代码永远不会骗人！**

意思就是代码没问题，但是执行时的代码已经不是你写的代码了！什么意思？现在将 Config 类修改如下：

```java
@Configuration
public class Config {

    @Bean
    public String hello() {
        System.out.println("Hello World");
        return "Hello";
    }

    @Bean
    public String world() {
        hello();
        return "World";
    }
}

public class Application {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(Config.class);
    }
}
```

按道理说，我们在执行 `AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(Config.class)` 这段初始化 Spring 容器代码时，会将我们定义的 Bean 注册为被 Spring 管理的 Bean，即调用 `hello()` 和 `world()` 方法。

所以他会打印两次 `Hello World` 字符对不对？但结果与我们预想的不一样，仅仅打印了一次 `Hello World` 。

这表示我们的配置类在 Spring 执行之后，**内部的代码已经不是原来的代码了，它被修改了！！！！**

从以上的输出示例中我们可以知道一个问题：被 `@Configuration` 注解的配置类在 Spring 容器初始化后，该配置类已经不是原来的类。同时他能保障在其内部定义的 Bean 只会被初始化一次!

带着这个问题我们来开始一步一步的解答该问题的答案!

在之前，我们先来还原一下配置类：

```java
@Configuration
public class Config {

    @Bean
    public UserService userService() {
        return new UserService();
    }

    @Bean
    public IndexService indexService() {
        return new IndexService();
    }
}
```

现在，我们在测试类中打印 Config 配置类：

```java
public class Application {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(Config.class);

        System.out.println(context.getBean(Config.class));
    }
}
```

输出结果如下：

```
com.mingrn.spring.configuration.Config$$EnhancerBySpringCGLIB$$28924ffb@4f9a3314
```

现在再将 @Configuration 注解移除，再次执行。输出结果如下：

```plain
com.mingrn.spring.configuration.Config@4eb7f003
```

从两次输出，我们很明显的看到其不同。没加 @Configuration 注解打印的结果显示还是我们原来的类，但是增加 @Configuration 注解后输出结果显示该类不是原来的类的，它被 cglib 代理了！

为了方便理解，下面是一张使用 Debug 调试的截图，该截图很直截了当的说明了该问题：

![](https://media.ituknown.org/spring-media/%40Configuration/DebugDemo.webp)

现在，带着该问题我们来看该类什么使用时候被代理的。

## 源码解析

:::warning
其实 Spring 源码难以阅读的原因就是其内部的层层调用，每个方法都只干了一部分事。然后又去调用另一个类的另一个方法，一个功能还没看完就发现调用的堆栈就已经达到十几个了。很多方法甚至都是空壳方法，即什么事都没干直接调用其他方法。

所以，阅读源码一定要有耐心，静下心来一步一步阅读就一定有收获。Spring 源码虽然有几千个类，但是真正需要我们认真记住，理解其精髓的类粗略也就百十个吧 ~
:::

为了找到该问题的答案我们需要一步一步的查看源码。我们注册 Spring 容器时使用的是基于注解的容器： `AnnotationConfigApplicationContext` 。在查看该类构造方法时发现其内部代码如下：

```java
public AnnotationConfigApplicationContext(Class<?>... annotatedClasses) {
	this();
	register(annotatedClasses);
	refresh();
}
```

也就是说，我们之前启动 Spring 容器的代码也可以修改为如下方式：

```java
AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
context.register(Config.class);
context.refresh();
```

其中最主要的方法是 `refresh()` 方法。现在来看下该方法：

```java
@Override
public void refresh() throws BeansException, IllegalStateException {
	synchronized (this.startupShutdownMonitor) {
		// 省略其他方法...

		try {

			// Invoke factory processors registered as beans in the context.
			// 调用工厂处理器注册 Bean
			// 设置执行自定义的 BeanFactoryPostProcessor
			// 即完成所谓的扫描, 所有的 @Bean 以及其他形式的 Bean 都是在这一步完成.
			// 另外查看类是否需要代理(cglib)
			invokeBeanFactoryPostProcessors(beanFactory);

			// 省略其他方法...

		} catch (BeansException ex) {
			throw ex;
		} finally {
			resetCommonCaches();
		}
	}
}
```

在该方法中的方法每个都很重要，但是与我们配置类有关的方法是 `invokeBeanFactoryPostProcessors()` 方法。从该方法的字面意思就可以基本上知道他是用于调用 `BeanFactoryPostProcessor` 后置处理器的方法进行注册 Bean。



:::tip
`invokeBeanFactoryPostProcessors()` 方法的作用在上面代码中的注释已经表达的很清楚了。它主要干的事情就是：

$1.$ 调用工厂处理器注册 Bean<br/>
$2.$ 设置执行自定义的 `BeanFactoryPostProcessor`<br/>
$3.$ 查看类是否需要代理(`cglib`)

所以我们就带着这个答案一步一步的进行解密。
:::

该方法是 `AbstractApplicationContext` 抽象类的方法，为了理解该抽象类与我们注解配置类的关系我们来看下简单的类图：

<img height="400px" src="https://media.ituknown.org/spring-media/%40Configuration/AbstractApplicationContext.webp" />

知道其关系后我们最主要的还是看其中的 `invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory)` 方法。该方法可以理解为是一个空壳方法：

```java
protected void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory) {
	// getBeanFactoryPostProcessors() 是获取自定义 BeanFactoryPostProcessor
	PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());

	// Detect a LoadTimeWeaver and prepare for weaving, if found in the meantime
	// (e.g. through an @Bean method registered by ConfigurationClassPostProcessor)
	if (beanFactory.getTempClassLoader() == null && beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
		beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
		beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
	}
}
```

它内部最主要的是如下一行代码：

```java
PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());
```

`PostProcessorRegistrationDelegate` 从字面上来看是一个 **BeanFactory后置处理注册器的委托方法**。这个类超级重要，这个类的 `invokeBeanFactoryPostProcessors` 方法内部定义了 `BeanDefinitionRegistryPostProcessor` 和 `BeanFactoryPostProcessor` 这两个 `BeanFactory` 后置处理器的加载顺序，但是与该文无关。

现在来看下该方法：

```java
public static void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory, List<BeanFactoryPostProcessor> beanFactoryPostProcessors) {


	if (beanFactory instanceof BeanDefinitionRegistry) {
        // 定义 BeanDefinitionRegistryPostProcessor 和 BeanFactoryPostProcessor 的加载顺序
		BeanDefinitionRegistry registry = (BeanDefinitionRegistry) beanFactory;
		List<BeanFactoryPostProcessor> regularPostProcessors = new ArrayList<>();
		List<BeanDefinitionRegistryPostProcessor> registryProcessors = new ArrayList<>();

		for (BeanFactoryPostProcessor postProcessor : beanFactoryPostProcessors) {
			if (postProcessor instanceof BeanDefinitionRegistryPostProcessor) {
				BeanDefinitionRegistryPostProcessor registryProcessor =
						(BeanDefinitionRegistryPostProcessor) postProcessor;
				registryProcessor.postProcessBeanDefinitionRegistry(registry);
				registryProcessors.add(registryProcessor);
			} else {
				regularPostProcessors.add(postProcessor);
			}
		}

		// 省略其他方法 ...

		// 在这个方法中完成 bean 扫描, 即向 map 中 put bean(类的基本信息)
		invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
		currentRegistryProcessors.clear();

		// 判断类是否需要代理(cglib)
		invokeBeanFactoryPostProcessors(registryProcessors, beanFactory);
		invokeBeanFactoryPostProcessors(regularPostProcessors, beanFactory);
	} else {
		// Invoke factory processors registered with the context instance.
		invokeBeanFactoryPostProcessors(beanFactoryPostProcessors, beanFactory);
	}

    // 判断类是否需要代理(cglib)
    invokeBeanFactoryPostProcessors(...);
}
```

在这个方法中笔者省略的很多代码，仅仅展示了 `BeanDefinitionRegistryPostProcessor` 和 `BeanFactoryPostProcessor` 的加载顺序。另外就是 `invokeBeanDefinitionRegistryPostProcessors` 和 `invokeBeanFactoryPostProcessors` 方法。

`BeanDefinitionRegistryPostProcessor` 接口是 `BeanFactoryPostProcessor` 的子接口，在这里知道即可。

另外，与本文有关的就是 `invokeBeanDefinitionRegistryPostProcessors()` 方法和 `invokeBeanFactoryPostProcessors()` 方法。提前说下这两个方法分别起到的作用：

- `invokeBeanDefinitionRegistryPostProcessors()` 为 @Configuration 配置类设置 `full` 标识。
- `invokeBeanFactoryPostProcessors()` 为 @Configuration 配置类生成 `cglib` 代理

现在先来看 `invokeBeanDefinitionRegistryPostProcessors` 方法：

### invokeBeanDefinitionRegistryPostProcessors

```java
private static void invokeBeanDefinitionRegistryPostProcessors(Collection<? extends BeanDefinitionRegistryPostProcessor> postProcessors,
                                                               BeanDefinitionRegistry registry) {

	for (BeanDefinitionRegistryPostProcessor postProcessor : postProcessors) {
		postProcessor.postProcessBeanDefinitionRegistry(registry);
	}
}
```

该方法内部是一个循环，也就是循环 `BeanDefinitionRegistryPostProcessor` 集合，该接口是 `BeanFactoryPostProcessor` 接口的子接口。很重要的一个接口，同样的与本文无关不做解释😜！

虽然如此，但是在 Spring 中有一个超级重要、核心的类是 `BeanDefinitionRegistryPostProcessor` 接口的实现类： `ConfigurationClassPostProcessor` 。

所以，该循环体调用的 `postProcessBeanDefinitionRegistry` 方法就是 `ConfigurationClassPostProcessor` 类的 `postProcessBeanDefinitionRegistry` 方法。然鹅，其内部又去调用了其他方法：`processConfigBeanDefinitions` 。从字面上理解：**处理 **`**@Configuration**`** 注解的配置类！**

我们只需要看其中一部分代码即可：

```java
public void processConfigBeanDefinitions(BeanDefinitionRegistry registry) {
	List<BeanDefinitionHolder> configCandidates = new ArrayList<>();
	String[] candidateNames = registry.getBeanDefinitionNames();

	for (String beanName : candidateNames) {
		BeanDefinition beanDef = registry.getBeanDefinition(beanName);
		if (ConfigurationClassUtils.isFullConfigurationClass(beanDef) ||
				ConfigurationClassUtils.isLiteConfigurationClass(beanDef)) {
			if (logger.isDebugEnabled()) {
				logger.debug("Bean definition has already been processed as a configuration class: " + beanDef);
			}
		} else if (ConfigurationClassUtils.checkConfigurationClassCandidate(beanDef, this.metadataReaderFactory)) {
			configCandidates.add(new BeanDefinitionHolder(beanDef, beanName));
		}
	}

    // 省略其他代码 ...
}
```

现在来看下这个循环体：内部的一个判断很有意思：`isFullConfigurationClass`、`isLiteConfigurationClass` 。什么意思呢？就是获取这个 BeanDefinition 内部的一个属性： `configurationClass` ，判断该属性的值是否为 `full` 或 `lite` 。该常量定义在 `ConfigurationClassUtils` 类内部：

```java
abstract class ConfigurationClassUtils {

	private static final String CONFIGURATION_CLASS_FULL = "full";

	private static final String CONFIGURATION_CLASS_LITE = "lite";

    private static final String CONFIGURATION_CLASS_ATTRIBUTE =
			Conventions.getQualifiedAttributeName(ConfigurationClassPostProcessor.class, "configurationClass");

    public static boolean isFullConfigurationClass(BeanDefinition beanDef) {
		return CONFIGURATION_CLASS_FULL.equals(beanDef.getAttribute(CONFIGURATION_CLASS_ATTRIBUTE));
	}

	public static boolean isLiteConfigurationClass(BeanDefinition beanDef) {
		return CONFIGURATION_CLASS_LITE.equals(beanDef.getAttribute(CONFIGURATION_CLASS_ATTRIBUTE));
	}
}
```

所以，这个单词很难理解啥意思。按笔者的理解就是增加了 @Configuration 注解的类就是全（`full`）注解类，否则就是.... 好了好了，太难说了。自悟去吧~

继续看下一个判断： `ConfigurationClassUtils.checkConfigurationClassCandidate()` 。这个判断还是 `ConfigurationClassUtils` 类中的方法：

```java
abstract class ConfigurationClassUtils {

	public static boolean checkConfigurationClassCandidate(BeanDefinition beanDef,
														   MetadataReaderFactory metadataReaderFactory) {

		String className = beanDef.getBeanClassName();
		if (className == null || beanDef.getFactoryMethodName() != null) {
			return false;
		}

        // 这里就是进行条件判断BeanDefinition类型, 然后获取注解元数据信息
		AnnotationMetadata metadata;
		if (beanDef instanceof AnnotatedBeanDefinition &&
				className.equals(((AnnotatedBeanDefinition) beanDef).getMetadata().getClassName())) {
			metadata = ((AnnotatedBeanDefinition) beanDef).getMetadata();
		}
		else if (beanDef instanceof AbstractBeanDefinition && ((AbstractBeanDefinition) beanDef).hasBeanClass()) {
			Class<?> beanClass = ((AbstractBeanDefinition) beanDef).getBeanClass();
			metadata = new StandardAnnotationMetadata(beanClass, true);
		}
		else {
			try {
				MetadataReader metadataReader = metadataReaderFactory.getMetadataReader(className);
				metadata = metadataReader.getAnnotationMetadata();
			}
			catch (IOException ex) {
				return false;
			}
		}

        // 看下这里
		if (isFullConfigurationCandidate(metadata)) {
			beanDef.setAttribute(CONFIGURATION_CLASS_ATTRIBUTE, CONFIGURATION_CLASS_FULL);
		}
		else if (isLiteConfigurationCandidate(metadata)) {
			beanDef.setAttribute(CONFIGURATION_CLASS_ATTRIBUTE, CONFIGURATION_CLASS_LITE);
		}
		else {
			return false;
		}

		// It's a full or lite configuration candidate... Let's determine the order value, if any.
		Integer order = getOrder(metadata);
		if (order != null) {
			beanDef.setAttribute(ORDER_ATTRIBUTE, order);
		}

		return true;
	}
}
```

在这个方法中最最最重要的一个判断是：

```java
if (isFullConfigurationCandidate(metadata)) {
	beanDef.setAttribute(CONFIGURATION_CLASS_ATTRIBUTE, CONFIGURATION_CLASS_FULL);
}
else if (isLiteConfigurationCandidate(metadata)) {
	beanDef.setAttribute(CONFIGURATION_CLASS_ATTRIBUTE, CONFIGURATION_CLASS_LITE);
}
else {
	return false;
}
```

还记得之前的变量吗？我们只需要看 `isFullConfigurationCandidate(metadata)` 判断：

```java
public static boolean isFullConfigurationCandidate(AnnotationMetadata metadata) {
	return metadata.isAnnotated(Configuration.class.getName());
}
```

所以，该判断就是用于判断 BeanDefinition 注解的元数据是否使用了 @Configuration 注解，如果是就在 `BeanDefinition` 中将 `configurationClass` 属性的值设置为 `full` ，否则就设置为 `lite` 。这里是不是很像我们写 `HttpServletRequest` 或 `HttpServletResponse` 时设置 `setAttribute()` 很像？

你如果问题这个是用于干什么的我可以告诉你现在没有什么作用，**它****就是用于做标记。**标记什么？先不说，继续往下看：

看完 `invokeBeanDefinitionRegistryPostProcessors` 方法后再来看下 `invokeBeanFactoryPostProcessors` 方法。

### invokeBeanFactoryPostProcessors

如果说 `invokeBeanDefinitionRegistryPostProcessors` 方法适用于给 BeanDefinition 增加 `full` 和 `lite` 标记的，那么该方法就是用于处理该标记的！

来看下该方法：

```java
private static void invokeBeanFactoryPostProcessors(
    Collection<? extends BeanFactoryPostProcessor> postProcessors,
    ConfigurableListableBeanFactory beanFactory) {

	for (BeanFactoryPostProcessor postProcessor : postProcessors) {
		postProcessor.postProcessBeanFactory(beanFactory);
	}
}
```

这里的 `BeanFactoryPostProcessor` 其实是其子类 `BeanDefinitionRegistryPostProcessor`。该接口的实现类其实是 `ConfigurationClassPostProcessor`，之前也说过。该类很重要！

看下该实现类的接口：

```java
public class ConfigurationClassPostProcessor implements BeanDefinitionRegistryPostProcessor,
		PriorityOrdered, ResourceLoaderAware, BeanClassLoaderAware, EnvironmentAware {

	@Override
	public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {

        // 省略其他代码 ...

		// cglib 代理增强类
		enhanceConfigurationClasses(beanFactory);
		beanFactory.addBeanPostProcessor(new ImportAwareBeanPostProcessor(beanFactory));
	}
}
```

在该方法内部又是一次调用：`enhanceConfigurationClasses()` 。阅读起来是不是很痛苦？

```java
public void enhanceConfigurationClasses(ConfigurableListableBeanFactory beanFactory) {

    Map<String, AbstractBeanDefinition> configBeanDefs = new LinkedHashMap<>();

    for (String beanName : beanFactory.getBeanDefinitionNames()) {

        BeanDefinition beanDef = beanFactory.getBeanDefinition(beanName);

        // 判断是否是全注解
		if (ConfigurationClassUtils.isFullConfigurationClass(beanDef)) {

			configBeanDefs.put(beanName, (AbstractBeanDefinition) beanDef);
		}
	}

    // 在上一步判断是否使用了全注解, 如果没有使用这个 Map 就会是空的, 直接返回了
	if (configBeanDefs.isEmpty()) {
		// nothing to enhance -> return immediately
		return;
	}

    // 使用 Cglib 增强 Configuration 注解类
	ConfigurationClassEnhancer enhancer = new ConfigurationClassEnhancer();

	for (Map.Entry<String, AbstractBeanDefinition> entry : configBeanDefs.entrySet()) {
		AbstractBeanDefinition beanDef = entry.getValue();
		// 设置 preserveTargetClass 值为 true
		beanDef.setAttribute(AutoProxyUtils.PRESERVE_TARGET_CLASS_ATTRIBUTE, Boolean.TRUE);
		try {
			// Set enhanced subclass of the user-specified bean class
			Class<?> configClass = beanDef.resolveBeanClass(this.beanClassLoader);
			if (configClass != null) {

                // 🔔 Cglib 增强
				Class<?> enhancedClass = enhancer.enhance(configClass, this.beanClassLoader);

                if (configClass != enhancedClass) {

					beanDef.setBeanClass(enhancedClass);
				}
			}
		} catch (Throwable ex) {
            // ...
		}
	}
}
```

到此我们知道了之前在做 `full` 和 `lite` 标记的作用。只有标记为 `full` 的类才做 cglib 增强，而标记为 `full` 的就是基于 @Configuration 注解的配置类。

来看下 `enhance()` 方法：

```java
public Class<?> enhance(Class<?> configClass, @Nullable ClassLoader classLoader) {
	// 判断是否是 EnhancedConfiguration
    if (EnhancedConfiguration.class.isAssignableFrom(configClass)) {
		return configClass;
	}
    // 注意这里
    // 首先调用 newEnhancer() 方法, 做 cglib 增强, 返回 Enhancer
    // 之后调用 createClass 方法将 Enhancer 转换为 class, 并注册拦截方法
	Class<?> enhancedClass = createClass(newEnhancer(configClass, classLoader));

	return enhancedClass;
}
```

来具体看下 `EnhancedConfiguraion` 类的 `newEnhancer` 和 `createClass` 方法：

```java
class ConfigurationClassEnhancer {

	// The callbacks to use. Note that these callbacks must be stateless.
	private static final Callback[] CALLBACKS = new Callback[] {
			// 增强方法, 主要控制 Bean 的作用域. 保障只 new 一次 Bean
			new BeanMethodInterceptor(),
			new BeanFactoryAwareMethodInterceptor(),
			NoOp.INSTANCE
	};

	private static final ConditionalCallbackFilter CALLBACK_FILTER = new ConditionalCallbackFilter(CALLBACKS);

	private static final String BEAN_FACTORY_FIELD = "$$beanFactory";


	private static final Log logger = LogFactory.getLog(ConfigurationClassEnhancer.class);

	private static final SpringObjenesis objenesis = new SpringObjenesis();


	// 创建 cglib 示例
	private Enhancer newEnhancer(Class<?> configSuperClass, @Nullable ClassLoader classLoader) {
		Enhancer enhancer = new Enhancer();
		enhancer.setSuperclass(configSuperClass);
		enhancer.setInterfaces(new Class<?>[] {EnhancedConfiguration.class});
		enhancer.setUseFactory(false);
		enhancer.setNamingPolicy(SpringNamingPolicy.INSTANCE);
		enhancer.setStrategy(new BeanFactoryAwareGeneratorStrategy(classLoader));
		enhancer.setCallbackFilter(CALLBACK_FILTER);
		enhancer.setCallbackTypes(CALLBACK_FILTER.getCallbackTypes());
		return enhancer;
	}

    // 生成代理类
	private Class<?> createClass(Enhancer enhancer) {
		Class<?> subclass = enhancer.createClass();
		// Registering callbacks statically (as opposed to thread-local)
		// is critical for usage in an OSGi environment (SPR-5932)...
		Enhancer.registerStaticCallbacks(subclass, CALLBACKS);
		return subclass;
	}
}
```

在 `newEnhancer` 方法中设置了一个接口 `enhancer.setInterfaces(new Class<?>[] {EnhancedConfiguration.class})` 。那么 `EnhancedConfiguration.class` 接口类到底是什么呢？

```java
public interface EnhancedConfiguration extends BeanFactoryAware {
}
```

这么一看就懂了！哦，原来是继承了 `BeanFactoryAware` 接口，该接口有什么作用自然就不用说了。在 Spring 容器初始化过程中可以通过回获取 `BeanFactory` 对象。有了该对象我们就可以获取任何 Bean 了。

另外。还有一个很重要的一行代码就是 `enhancer.setCallbackFilter(CALLBACK_FILTER)` ：

```java
private static final ConditionalCallbackFilter CALLBACK_FILTER =
    new ConditionalCallbackFilter(CALLBACKS);

private static final Callback[] CALLBACKS = new Callback[] {
			// 增强方法, 主要控制 Bean 的作用域. 保障只 new 一次 Bean
			new BeanMethodInterceptor(),
			new BeanFactoryAwareMethodInterceptor(),
			NoOp.INSTANCE
};
```

其中一个很重要的类就是 Bean 方法拦截器： `BeanMethodInterceptor` 。他的作用就是增强方法，控制 Bean 的作用域。

这个类很难理解：

```java
private static class BeanMethodInterceptor implements MethodInterceptor, ConditionalCallback {

    // 增强 Bean 方法
    // enhancedConfigInstance: 代理对象
    // beanMethod: Bean 原始方法, 比如 userService()
    // beanMethodArgs: 方法参数
    // cglibMethodProxy: 代理对象的代理方法, 也就是 beanMethod 的增强方法
	@Override
	@Nullable
	public Object intercept(Object enhancedConfigInstance, Method beanMethod, Object[] beanMethodArgs,
							MethodProxy cglibMethodProxy) throws Throwable {

		// 通过 enhancedConfigInstance 中 cglib 生成的成员变量 $$beanFactory 获取 BeanFactory
		ConfigurableBeanFactory beanFactory = getBeanFactory(enhancedConfigInstance);

        // 确定 Bean 的名称
        String beanName = BeanAnnotationHelper.determineBeanNameFor(beanMethod);
		if (BeanAnnotationHelper.isScopedProxy(beanMethod)) {
			String scopedBeanName = ScopedProxyCreator.getTargetBeanName(beanName);
			if (beanFactory.isCurrentlyInCreation(scopedBeanName)) {
				beanName = scopedBeanName;
			}
		}

		// 处理内部 Bean 以及基于 FactoryBean 注册的Bean
		if (factoryContainsBean(beanFactory, BeanFactory.FACTORY_BEAN_PREFIX + beanName) &&
				factoryContainsBean(beanFactory, beanName)) {
			// ...
		}

        // 重要
        // 判断当前调用的方法, 利用 ThreadLocal<Method>
		if (isCurrentlyInvokedFactoryMethod(beanMethod)) {
			return cglibMethodProxy.invokeSuper(enhancedConfigInstance, beanMethodArgs);
		}

        // 重要
		return resolveBeanReference(beanMethod, beanMethodArgs, beanFactory, beanName);
	}

	private Object resolveBeanReference(Method beanMethod, Object[] beanMethodArgs,
										ConfigurableBeanFactory beanFactory, String beanName) {

		// 判断该 Bean 是否正在创建
		boolean alreadyInCreation = beanFactory.isCurrentlyInCreation(beanName);
		try {
			if (alreadyInCreation) {
				beanFactory.setCurrentlyInCreation(beanName, false);
			}
			boolean useArgs = !ObjectUtils.isEmpty(beanMethodArgs);
			if (useArgs && beanFactory.isSingleton(beanName)) {
				// Stubbed null arguments just for reference purposes,
				// expecting them to be autowired for regular singleton references?
				// A safe assumption since @Bean singleton arguments cannot be optional...
				for (Object arg : beanMethodArgs) {
					if (arg == null) {
						useArgs = false;
						break;
					}
				}
			}
			Object beanInstance = (useArgs ? beanFactory.getBean(beanName, beanMethodArgs) :
					beanFactory.getBean(beanName));
			if (!ClassUtils.isAssignableValue(beanMethod.getReturnType(), beanInstance)) {
				if (beanInstance.equals(null)) {
					// log
					beanInstance = null;
				} else {
					throw new IllegalStateException(msg);
				}
			}
			Method currentlyInvoked = SimpleInstantiationStrategy.getCurrentlyInvokedFactoryMethod();
			if (currentlyInvoked != null) {
				String outerBeanName = BeanAnnotationHelper.determineBeanNameFor(currentlyInvoked);
				beanFactory.registerDependentBean(beanName, outerBeanName);
			}
			return beanInstance;
		} finally {
			if (alreadyInCreation) {
				beanFactory.setCurrentlyInCreation(beanName, true);
			}
		}
	}

    // 获取 BeanFactory
	private ConfigurableBeanFactory getBeanFactory(Object enhancedConfigInstance) {

        Field field = ReflectionUtils.findField(enhancedConfigInstance.getClass(), BEAN_FACTORY_FIELD);
		Object beanFactory = ReflectionUtils.getField(field, enhancedConfigInstance);

		return (ConfigurableBeanFactory) beanFactory;
	}

	// 判断容器中是否已经存在某个 bean
	private boolean factoryContainsBean(ConfigurableBeanFactory beanFactory, String beanName) {
		return (beanFactory.containsBean(beanName) && !beanFactory.isCurrentlyInCreation(beanName));
	}

	// 判断当前方法
	private boolean isCurrentlyInvokedFactoryMethod(Method method) {
		Method currentlyInvoked = SimpleInstantiationStrategy.getCurrentlyInvokedFactoryMethod();
		return (currentlyInvoked != null && method.getName().equals(currentlyInvoked.getName()) &&
				Arrays.equals(method.getParameterTypes(), currentlyInvoked.getParameterTypes()));
	}

	// 省略其他代码...
}
```

上面的代码中最最最重要的代码是两个返回的判断：`isCurrentlyInvokedFactoryMethod(beanMethod)` 和 `resolveBeanReference()` 。

其中 `isCurrentlyInvokedFactoryMethod()` 方法是用于判断当前正在执行的方法是不是 `@Bean` 注解正在执行的方法。说的很绕是不是？看下这个 Config：

```java
@Configuration
public class Config {

    @Bean
    public UserService userService() {
        return new UserService();
    }

    @Bean
    public IndexService indexService() {
        userService();
        return new IndexService();
    }
}
```

在没有讲解本文之前，我们看到在这个类中 Bean 注册的调用看到每个类都只被调用了一次。按照我们的理解，如果才能做到这点？如果不使用 @Configuration 注解 `userService()` 方法是不是会被调用两边，现在调用了一次，如果按照你的想法你如何做才能保证这一点？我们是不是要判断方法执行次数？如果方法已经被执行过就不再执行，类似如下伪代码：

```java
Method method = ...;
Map map = ...;

if(firstTimesInvoke){
    method.invoke();
    map.put(methodName, method);
} else {
    map.get(methodName);
}
```

试想一下是不是如此？

先来来看下 Spring 是如何做的：

```java
Method currentlyInvoked = SimpleInstantiationStrategy.getCurrentlyInvokedFactoryMethod()
```

那 `getCurrentlyInvokedFactoryMethod()` 方法是什么？来看下：

```java
public class SimpleInstantiationStrategy implements InstantiationStrategy {

    private static final ThreadLocal<Method> currentlyInvokedFactoryMethod = new ThreadLocal<>();

	@Nullable
	public static Method getCurrentlyInvokedFactoryMethod() {
		return currentlyInvokedFactoryMethod.get();
	}
}
```

看到，其实是一个 `ThreadLocal` 对象，该类是一个线程私有的。Spring 在每次调用方法之前就会将正在调用的方法放到该对象中。这样，在判断正在执行的方法是不是 `@Bean` 的方法是不是就简单了许多。听起来很简单，但是做起来却很难。我们都只是单纯的阅读者，而不是实践者~

所以，在执行第二个 `@Bean` 的时候，执行到其内部调用了 `userService()` 方法，发现并不是正在调用的方法。就走了另一个逻辑：`resolveBeanReference()` 。

这个方法解特别难以理解了。因为该方法涉及的是循环引用的问题，这里就不做深入讲解，关于循环引用的深入问题见：[Spring Bean 循环依赖源码解析](./Spring%20Bean%20循环依赖源码解析.md) 。这里简单的说一下：

```java
private Object resolveBeanReference(Method beanMethod, Object[] beanMethodArgs,
									ConfigurableBeanFactory beanFactory, String beanName) {

    // 判断是否已经创建
	boolean alreadyInCreation = beanFactory.isCurrentlyInCreation(beanName);
	try {
        // 如果已经创建就加入创建排除缓存中
		if (alreadyInCreation) {
			beanFactory.setCurrentlyInCreation(beanName, false);
		}

        // 参数判断
		boolean useArgs = !ObjectUtils.isEmpty(beanMethodArgs);
		if (useArgs && beanFactory.isSingleton(beanName)) {

			for (Object arg : beanMethodArgs) {
				if (arg == null) {
					useArgs = false;
					break;
				}
			}
		}

        // 🔔重要: 获取 Bean 实
		Object beanInstance = (useArgs ? beanFactory.getBean(beanName, beanMethodArgs) :
				beanFactory.getBean(beanName));

        // 判断 bean 实例类型与 @Bean 方法的返回值类型是否存在转换关系, 也就是 继承关系
		if (!ClassUtils.isAssignableValue(beanMethod.getReturnType(), beanInstance)) {
			if (beanInstance.equals(null)) {
				beanInstance = null;
			} else {
				throw new IllegalStateException(msg);
			}
		}
		Method currentlyInvoked = SimpleInstantiationStrategy.getCurrentlyInvokedFactoryMethod();
		if (currentlyInvoked != null) {
			String outerBeanName = BeanAnnotationHelper.determineBeanNameFor(currentlyInvoked);
			beanFactory.registerDependentBean(beanName, outerBeanName);
		}
		return beanInstance;
	} finally {
		if (alreadyInCreation) {
			beanFactory.setCurrentlyInCreation(beanName, true);
		}
	}
}
```

这个方法的第一行代码就难道我了😭😭😭😭，实在是阅读不下去了，都要吐了🤮🤮🤮🤮~

```java
boolean alreadyInCreation = beanFactory.isCurrentlyInCreation(beanName);
```

这行代码调用的是 BeanFactory ，这个 BeanFactory 与 Spring 容器德一个非常重要的类`DefaultListableBeanFactory` 有关系，到底有多重要，这里不说。但这里调用的 `isCurrentlyInCreation` 方法却是另一个类 `DefaultSingletonBeanRegistry` 的方法。这个类与 `DefaultListableBeanFactory` 又有什么关系？看下类图：

<img height="400px" src="https://media.ituknown.org/spring-media/%40Configuration/DefaultListableBeanFactory%20.webp" />

那么该类在 Spring 中起到什么作用呢？先看这个类定义的几个常量：

```java
public class DefaultSingletonBeanRegistry extends SimpleAliasRegistry implements SingletonBeanRegistry {

	/** Cache of singleton objects: bean name to bean instance. */
	private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

	/** Cache of singleton factories: bean name to ObjectFactory. */
	private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);

	/** Cache of early singleton objects: bean name to bean instance. */
	private final Map<String, Object> earlySingletonObjects = new HashMap<>(16);

	/** Set of registered singletons, containing the bean names in registration order. */
	private final Set<String> registeredSingletons = new LinkedHashSet<>(256);

	/** Names of beans that are currently in creation. */
	private final Set<String> singletonsCurrentlyInCreation =
			Collections.newSetFromMap(new ConcurrentHashMap<>(16));

	/** Names of beans currently excluded from in creation checks. */
	private final Set<String> inCreationCheckExclusions =
			Collections.newSetFromMap(new ConcurrentHashMap<>(16));

	/** List of suppressed Exceptions, available for associating related causes. */
	@Nullable
	private Set<Exception> suppressedExceptions;

	/** Flag that indicates whether we're currently within destroySingletons. */
	private boolean singletonsCurrentlyInDestruction = false;

	/** Disposable bean instances: bean name to disposable instance. */
	private final Map<String, Object> disposableBeans = new LinkedHashMap<>();

	/** Map between containing bean names: bean name to Set of bean names that the bean contains. */
	private final Map<String, Set<String>> containedBeanMap = new ConcurrentHashMap<>(16);

	/** Map between dependent bean names: bean name to Set of dependent bean names. */
	private final Map<String, Set<String>> dependentBeanMap = new ConcurrentHashMap<>(64);

	/** Map between depending bean names: bean name to Set of bean names for the bean's dependencies. */
	private final Map<String, Set<String>> dependenciesForBeanMap = new ConcurrentHashMap<>(64);
}
```

这定义的十来个变量或多或少的都应该知道一点，没错就是缓存。**是 Spring 对循环依赖的解决方案。**

在看下我们这行代码调用的方法：

```java
// 排除在创建的方法
private final Set<String> inCreationCheckExclusions = Collections.newSetFromMap(new ConcurrentHashMap<>(16));

// 正在创建的方法
private final Set<String> singletonsCurrentlyInCreation = Collections.newSetFromMap(new ConcurrentHashMap<>(16));

public boolean isCurrentlyInCreation(String beanName) {
	return (!this.inCreationCheckExclusions.contains(beanName)
               && isActuallyInCreation(beanName));
}

protected boolean isActuallyInCreation(String beanName) {
	return isSingletonCurrentlyInCreation(beanName);
}

public boolean isSingletonCurrentlyInCreation(String beanName) {
	return this.singletonsCurrentlyInCreation.contains(beanName);
}
```

太难说了，完全没法用语言表达出来啊😱！！但是这个判断的意思是是否已经创建了~

在下面的一个判断中判断该方法是否已经创建，如果已经创建就执行 `beanFactory.setCurrentlyInCreation(beanName, false)` 。这段代码意思就是想排除缓存中将该方法加入到缓存中，用于下次排除：

```java
public void setCurrentlyInCreation(String beanName, boolean inCreation) {

	if (!inCreation) {
		this.inCreationCheckExclusions.add(beanName);
	}
	else {
		this.inCreationCheckExclusions.remove(beanName);
	}
}
```

**之后的代码就是获取 Bean 的实例**。到这一步有没有看出什么？获取的 Bean 实例是直接在 BeanFactory 中获取的，也就是说通过 BeanName 直接获取。现在再回想一下下面的代码：

```java
@Configuration
public class Config {

    @Bean
    public UserService userService() {
        // 1️⃣
        return new UserService();
    }

    @Bean
    public IndexService indexService() {
        // 2️⃣
        userService();
        // 3️⃣
        return new IndexService();
    }
}
```

当代码执行 1️⃣ 时，是没有走 `resolveBeanReference` 方法，而知直接走的`isCurrentlyInvokedFactoryMethod(beanMethod)` 判断逻辑。但是在执行 2️⃣ 时发现正在执行的 `@Bean` 方法 `indexService()` 与执行的方法 `userService()` 不同，所以走了 `resolveBeanReference` 处理逻辑。

在 `resolveBeanReference` 方法中走啊走，最后再 BeanFactory 中获取名称为 `userService` 的 Bean，事实上确实获取到了。这也是为什么我们的代码没有再次调用 `userService()` 方法的原因，因为它是直接在容器中进行获取的。

说了这么久，我们终于将该问题的答案找到了🥳🥳🥳🥳~

下面的一个判断和代码就没必要说了，因为与 `isCurrentlyInvokedFactoryMethod(beanMethod)` 判断相同~

## 总结

还记得我们最初的问题是在配置类中为什么要加 @Configuration 注解？可不可以不加？

现在我们可以给出其答案： `@Configuration` 注解的作用就是用于保障其内部定义的 Bean 只会被初始化一次，在其内部会判断配置类使用使用了该注解。

:::tip[原理是]
如果使用了该注解就会在 BeanDefinition 中设置 `configurationClass` 标识为 `full` 标识其实一个全注解，否则标记为 `lite` 。

当 Spring 的 BeanFactoryProcessor 判断其实一个全注解时就会为其使用 Cglib（`ConfigurationClassEnhancer`）代理增强其内部方法，在使用 Cglib 增强时有一个很重要的设置就是为其设置 Bean 方法拦截：`BeanMethodInterceptor` 。 
:::

`BeanMethodInterceptor` Bean 方法拦截器内部一个很重要的处理就是使用到了缓存机制。在执行方法时会判断正在执行的方法与 `@Bean` 注解方法是否相同，如果是同一个方法代理类就会直接调用父类（原始类）的方法。否则会不会调用父类，而是直接在 BeanFactory 中尝试获取该 Bean，之后进行返回。

所以，在之后的处理中并没有再调用原始方法。也就变相的说明了：被 @Configuration 注解的配置类保障了其内部定义的 Bean 只会被初始化一次~

好了，今天的分享到此结束~~~

:::tip

说实话，Spring 的源码真的很难里阅读和理解，但是只要静下心来仔细认真的一步一步的分析就会得到意想不到的收获。

这份喜悦你是没办法与别人分享的，因为你看了代码很容易理解。但是你与别人不管怎么扯，说的天花乱坠，但是只要他没读过这份源码他就懵懵懂懂的一脸懵逼。所以，即使你认真的看了本文。阅读了一遍又一遍而没有认真的结合源代码一步一步调试你也不会有很大的收获了。

笔者写本文主要是用于个人总结，如果你查看了本文说明我们有缘。本文对你的多用就是起到引导作用，你需要结合本文按照代码一步一步调试就能收获这份喜悦~

**学习本来就没有捷径，只有在用最正确的方式，坚持去学，才方有收获！** 
:::
