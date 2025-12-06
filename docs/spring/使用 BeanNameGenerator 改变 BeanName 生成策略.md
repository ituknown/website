## 前言

使用了这么久的Spring，你有没有想过Bean的名称是怎么得到的？

我们都知道，基于JavaConfig的配置形式，如果没有显示的设置Bean的名称那么Spring默认会采用类的首字母名称来作为Bean的名称，示例：

```java
@Component("userService")  // <== 指定Bean名称
public class UserService{

}

@Component  // <== 不指定Bean名称, Spring会默认设置Bean的名称为 userService
public class UserService{

}
```

这个十个人有九个都知道，另外一个可能是个产品所以不知道。

那基于 XML 配置的你知道吗？

```xml
<bean id="user" class="com.mingrn.spring.beanname.bean.User" />
<bean class="com.mingrn.spring.beanname.bean.Admin" />
```

告诉我， `Admin.class` 在 Spring 容器中的名称是什么？你知道吗？别告诉我是 `admin` ，如果你这么以为只能说你同样图深破。如果你回答是该类的全限定名即 `com.mingrn.spring.beanname.Admin` ，那你可以自豪的说你略懂一二。那么，接下来我再问你还有其他名字吗？如果你回答我的是类的全限定名加上 `#` 符号再加上数字编号那你厉害了。

你不信？那现在咱们来测试一下，就利用上面的 XML，命名为 `spring.xml` 文件编写测试类：

```java
// Bean
public class Admin {

    public void print(){
        System.out.println("Admin Bean");
    }
}

// 测试类
public class Application {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring.xml");
        Admin admin = (Admin) context.getBean("com.mingrn.spring.beanname.bean.Admin");
        admin.print();
    }
}
```

该测试类成功打印了：Admin Bean。那改下测试类，使用 `#` 加数字编号0：

```java
public class Application {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring.xml");
        Admin admin = (Admin) context.getBean("com.mingrn.spring.beanname.bean.Admin#0");
        admin.print();
    }
}
```

结果也成功打印了信息，那为什么是 `#0` 呢？ `#1` 行不行呢？我可以毫不犹豫的告诉你，不一定！为什么？看后面的解释！！！！

最后，我们都知道基于 JavaConfig 的配置形式 Bean 的名称默认是类的首字母小写。我再来修改下测试类：

```java
public class Application {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring.xml");
        Admin admin = (Admin) context.getBean("admin");
        admin.print();
    }
}
```

好了，这回当你启动测试类尝试获取名称为 `admin` 的 Bean 的时候报了如下异常：

```
Exception in thread "main" org.springframework.beans.factory.NoSuchBeanDefinitionException: No bean named 'admin' available
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.getBeanDefinition(DefaultListableBeanFactory.java:805)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getMergedLocalBeanDefinition(AbstractBeanFactory.java:1278)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:297)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:202)
	at org.springframework.context.support.AbstractApplicationContext.getBean(AbstractApplicationContext.java:1108)
	at com.mingrn.spring.beanname.Application.main(Application.java:15)
```

异常提示你找不到名称为 `admin` 的 Bean！是不是很奇怪？加下来我们来具体说下 `BeanNameGenerator` 生成策略~

## BeanNameGenerator 接口

Spring 提供了一个 `BeanNameGenerator` 接口，该接口用于设置 Bean 名称的**默认**生成策略，注意这里说的是默认！看下接口：

```java
public interface BeanNameGenerator {

	String generateBeanName(BeanDefinition definition, BeanDefinitionRegistry registry);

}
```

该接口只有一个抽象方法，并且返回值是 `String` 类型，即返回值就是 Bean 的名称。这代表了默认情况下，每个 Bean 在生成策略名称时都会调用一次该接口。该接口接受了两个参数 `BeanDefinition` 和 `BeanDefinitionResistry` 。这两个接口如果对 Spring 容器的Bean稍微知道一些都应该知道，`BeanDefinition` 是 Spring Bean 定义的描述信息。就相当于 JDK 使用 Class 这个对象来描述java对象一样。而 `BeanDefinitionResistry` 可能不太好说，你只需要知道如果你能够获取该对象那你就可以获取 spring 容器中的任何Bean的 `BeanDefinition` 。

而 `BeanNameGenerator` 接口有两个重要的实现类： `AnnotationBeanNameGenerator`  和 `DefaultBeanNameGenerator` 。除此之外，还有一个  `FullyQualifiedAnnotationBeanNameGenerator`，不过该类继承至 `AnnotationBeanNameGenerator` ，所以不做什么说明，现在看下类图：

![](https://media.ituknown.org/spring-media/BeanNameGenerator/BeanNameGeneratorHierarchy.webp)

- `AnnotationBeanNameGenerator` ：用于基于注解形式Bean的名称生成策略类
- `DefaultBeanNameGenerator` ：用于基于XML形式Bean的名称生成策略类

这也是为什么我们基于注解形式配置和基于XML配置默认的Bean的名称不同，原因就是因为他们使用的是不同测 Bean 名称生成策略。下面就来一一对这两个策略类进行说明：

### AnnotationBeanNameGenerator 策略类

对一个功能最好解释就是直接看源码，我们来一步一步阅读：

```java
public class AnnotationBeanNameGenerator implements BeanNameGenerator {

    // 用于确定使用使用了基于 @Component 注解
	private static final String COMPONENT_ANNOTATION_CLASSNAME = "org.springframework.stereotype.Component";


	@Override
	public String generateBeanName(BeanDefinition definition, BeanDefinitionRegistry registry) {
		if (definition instanceof AnnotatedBeanDefinition) {
            // 确定注解是否定义了Bean的名称, 比如 @Component("beanName")
			String beanName = determineBeanNameFromAnnotation((AnnotatedBeanDefinition) definition);

            // 判断 beanName 是否为空
            if (StringUtils.hasText(beanName)) {
				return beanName;
			}
		}
        // 生成默认BeanName的重点方法!!!!
		// 如果没有定义BeanName将使用默认生成策略, 即类名首字母小写
		return buildDefaultBeanName(definition, registry);
	}

	// 下面这两个方法就是用于确定基于注解的Bean是否定义了Bean名称, 如果定义了则直接提取
    // 这两个方法不是我们关心的重点
	@Nullable
	protected String determineBeanNameFromAnnotation(AnnotatedBeanDefinition annotatedDef) {

		String beanName = null;

        // 调用 isStereotypeWithNameValue(...)

		return beanName;
	}
	protected boolean isStereotypeWithNameValue(String annotationType, Set<String> metaAnnotationTypes, @Nullable Map<String, Object> attributes) {

        // 这里进行了三次判断:
        // 1. 判断注解使用使用的是 Spring 的注解: @Component, 即上面定义的常量
        // 2. 判断是否使用了 JDK 的 @ManagedBean 注解
        // 3. 判断是否使用了 JDK 的 @Named 注解
		return (isStereotype && attributes != null && attributes.containsKey("value"));
	}


    // 下面的方法是重点方法, 但是该方法是个空壳方法, 直接调用接下来的方法
	protected String buildDefaultBeanName(BeanDefinition definition, BeanDefinitionRegistry registry) {
		return buildDefaultBeanName(definition);
	}

	// 重点方法!!!!
	protected String buildDefaultBeanName(BeanDefinition definition) {
		String beanClassName = definition.getBeanClassName();
		String shortClassName = ClassUtils.getShortName(beanClassName);
		return Introspector.decapitalize(shortClassName);
	}

}
```

在上面的源码中都做了解释说明，其中真正的重点方式就是最后一个方法： `buildDefaultBeanName(BeanDefinition definition)` ，在这个方法中传递了一个参数 `BeanDefinition` 。很好理解，它就是 Bean 的描述类。在方法中直接获取 Bean 的全限定名： `beanClassName` ，比如 `com.mingrn.spring.beanname.bean.Admin` 。接下来就是直接获取省略包名直接获取类名： `Admin` 。这里使用的是 `ClassUtils` 工具类，其实很简单。无非就是截取最后一个 `.` 进行字符串操作而已：

```java
public abstract class ClassUtils {

	// 包分隔符
	private static final char PACKAGE_SEPARATOR = '.';

	// 内部类符号标记
	private static final char INNER_CLASS_SEPARATOR = '$';

	// cglib代理标记
	public static final String CGLIB_CLASS_SEPARATOR = "$$";

    // 对包类进行字符串截取获取类名
	public static String getShortName(String className) {
		int lastDotIndex = className.lastIndexOf(PACKAGE_SEPARATOR);
		int nameEndIndex = className.indexOf(CGLIB_CLASS_SEPARATOR);
		if (nameEndIndex == -1) {
			nameEndIndex = className.length();
		}
		String shortName = className.substring(lastDotIndex + 1, nameEndIndex);
		shortName = shortName.replace(INNER_CLASS_SEPARATOR, PACKAGE_SEPARATOR);
		return shortName;
	}
}

```

接下来的一行代码 `Introspector.decapitalize(shortClassName)` 这个真的不需要解释，看代码看代码：

```java
public class Introspector {

    // 省略其他方法 ...

    // 该方法提取字符变量首字母, 如果是首字母是大写就转换为小写字母
    // 然后返回
    public static String decapitalize(String name) {
        if (name == null || name.length() == 0) {
            return name;
        }
        if (name.length() > 1 && Character.isUpperCase(name.charAt(1)) &&
                        Character.isUpperCase(name.charAt(0))){
            return name;
        }
        char chars[] = name.toCharArray();
        chars[0] = Character.toLowerCase(chars[0]);
        return new String(chars);
    }
}
```

这就是基于注解形式的 BeanName 生成策略，是不是简单的不敢想象？接下来就来看下基于 XML 的 Bean 名称生成策略：

### DefaultBeanNameGenerator

基于XML配置形式的 BeanName 解析与基于注解形式的有些不同。因为 `DefaultBeanNameGenerator` 代表着默认的 Bean 生成策略，也就是说如果已经定义了 BeanName 将不对调用该类。我们现在看下在执行该类之前的上一步调用链：

他的上一步调用链是 `BeanDefinitionParserDelegate` 类。从该类名字可以直白的理解它是 Bean定义解析的委托类，而解析 Bean 名称的是其中的 `parseBeanDefinitionElement` 方法：

```java
public class BeanDefinitionParserDelegate {

    public static final String ID_ATTRIBUTE = "id";
    public static final String NAME_ATTRIBUTE = "name";
    public static final String MULTI_VALUE_ATTRIBUTE_DELIMITERS = ",; ";

	@Nullable
	public BeanDefinitionHolder parseBeanDefinitionElement(Element ele, @Nullable BeanDefinition containingBean) {
		// 获取 <bean> 标签的 id 属性
        String id = ele.getAttribute(ID_ATTRIBUTE);
        // 获取 <bean> 标签的 name 属性
		String nameAttr = ele.getAttribute(NAME_ATTRIBUTE);

		List<String> aliases = new ArrayList<>();
		if (StringUtils.hasLength(nameAttr)) {
            // 提取 name 属性值
			String[] nameArr = StringUtils.tokenizeToStringArray(nameAttr, MULTI_VALUE_ATTRIBUTE_DELIMITERS);
			aliases.addAll(Arrays.asList(nameArr));
		}

        // 首先判断 id 属性是否有值,如果没有值
        // 将过去 name 属性值
        // 这也是为什么我们可以不直接指定 id 属性
        // 而是指定name 属性这是可以获取该 bean 的原因
		String beanName = id;
        // 判断如果 id 属性为空时提取 name 属性值
		if (!StringUtils.hasText(beanName) && !aliases.isEmpty()) {
			beanName = aliases.remove(0);
		}

		AbstractBeanDefinition beanDefinition = parseBeanDefinitionElement(ele, beanName, containingBean);
		if (beanDefinition != null) {
			if (!StringUtils.hasText(beanName)) {
				try {
					if (containingBean != null) {
						// ...
					}
					else {
                        // 注意这一步, 方法就是调用 DefaultBeanNameGenerator 生成策略
						beanName = this.readerContext.generateBeanName(beanDefinition);

                        // ...
					}
				}
				catch (Exception ex) {
					error(ex.getMessage(), ele);
					return null;
				}
			}
			return ... ;
		}
		return null;
	}
}
```

好了，现在知道上一步的调用链并且简单的理解了代码后我们能够明白一点：如果显示的设置了 `<bean>` 的 `id` 或者 `name` 将直接返回，否则会使用 Spring 默认的 BeanName 生成策略。

**现在我们就来看下 XML 配置的 BeanName 的默认生成策略：`DefaultBeanNameGenerator`**。

该类的代码超级简单：

```java
public class DefaultBeanNameGenerator implements BeanNameGenerator {


	public static final DefaultBeanNameGenerator INSTANCE = new DefaultBeanNameGenerator();


	@Override
	public String generateBeanName(BeanDefinition definition, BeanDefinitionRegistry registry) {
		return BeanDefinitionReaderUtils.generateBeanName(definition, registry);
	}

}
```

可以看到，该类的代码仅仅是调用了 `BeanDefinitionReaderUtils` 类的 `generateBeanName` 方法并将参数传递了过去。现在来看下该方法是何方神圣：

```java
public abstract class BeanDefinitionReaderUtils {

	// 该常亮是用于定义分隔符, 注意是 #. 很关键
	public static final String GENERATED_BEAN_NAME_SEPARATOR = "#";

    // 空壳方法
	public static String generateBeanName(BeanDefinition beanDefinition, BeanDefinitionRegistry registry){

		return generateBeanName(beanDefinition, registry, false);
	}

	// 关键芳芳
	public static String generateBeanName(BeanDefinition definition,
                                          BeanDefinitionRegistry registry,
                                          boolean isInnerBean){

        // 获取 Bean 的全限定名, 比如 com.mingrn.spring.beanname.bean.Admin
		String generatedBeanName = definition.getBeanClassName();

		if (generatedBeanName == null) {
            // 如果类全限定名为空则尝试获取父类的全限定名 + $child 作为该类的全限定名
			if (definition.getParentName() != null) {
				generatedBeanName = definition.getParentName() + "$child";
			}
            // 如果类全限定名为空则尝试获取Bean工厂的全限定名 + $created 作为该类的全限定名
			else if (definition.getFactoryBeanName() != null) {
				generatedBeanName = definition.getFactoryBeanName() + "$created";
			}
		}

		if (!StringUtils.hasText(generatedBeanName)) {
            // 如果全限定名还不存在直接报异常 ....
		}

        // 注意这里!!!!
        // BeanName 已经基本产生, 它就是类的全限定名!!!!
		String id = generatedBeanName;
		if (isInnerBean) {
			// 如果该类是个内部类就在全限定名后加上 ## 符号
			id = generatedBeanName + GENERATED_BEAN_NAME_SEPARATOR + ObjectUtils.getIdentityHexString(definition);
		}
		else {
			// 如果不是内部类就继续判断类名是否唯一!!!!
			return uniqueBeanName(generatedBeanName, registry);
		}
		return id;
	}

	// 判断类名是否唯一方法, 很重要！
	public static String uniqueBeanName(String beanName, BeanDefinitionRegistry registry) {
		String id = beanName;
		int counter = -1;

		// Increase counter until the id is unique.
		while (counter == -1 || registry.containsBeanDefinition(id)) {
			counter++;
			id = beanName + GENERATED_BEAN_NAME_SEPARATOR + counter;
		}
		return id;
	}
}

```

现在我们只需要看最后一个方法 `uniqueBeanName` 。其实在上面一步就基本上生成了 BeanName，那为什么还再进行调用该方法呢？就是为了确保唯一 BeanName！

很简单的一个循环：判断当前 BeanName 在容器中是否存在，即使不存在初始也要进行循环一次。这就代表了如果你的类的全限定名为 `com.mingrn.spring.beanname.bean.Admin` 那么在容器中将会在后面增加序号： `#0` ，结果就是 `com.mingrn.spring.beanname.bean.Admin#0` 。如果之后还是有重复的 BeanName 将继续自增1操作。

所以现在你明白为什么基于 XML 配置的 BeanName 默认是全限定名或全限定名加限定符 `#` 后增加序号了吗？

现在就解释了我们开始说的基于XML配置的 Bean 的默认名称为类的全限定名或者是全限定名加 `#` 后跟序号值，默认为 0 ！

到此，基本上将 BeanName 生成策略都进行了说明。那现在看如何自定义默认的 Bean 生成策略！

## 自定义 BeanName 生成策略

自定义策略很简单，只需要自定义一个类实现 `BeanNameGenerator` 接口或者直接继承该接口的实现类即可。为此，我们简单的实现一个。直接拷贝 `AnnotationBeanNameGenerator` 的处理逻辑，也就是默认直接使用类名首字母小写并且在其前面增加 `_` ，即： `_admin` 。因为只是演示说明，说以没必要做的那么复杂，在实际应用中根据需要扩展即可。

```java
public class CustomeBeanNameGenerator implements BeanNameGenerator {

    @Override
    public String generateBeanName(BeanDefinition definition, BeanDefinitionRegistry registry) {
        String beanClassName = definition.getBeanClassName();
        String shortClassName = ClassUtils.getShortName(beanClassName);
        beanClassName = "_" + Introspector.decapitalize(shortClassName);
        System.out.println("Bean:[" + definition.getBeanClassName() + "] Id Is: " + beanClassName);
        return beanClassName;
    }

}
```

代码很简单，自定义一个类 `CustomeBeanNameGenerator` 实现 `BeanNameGenerator` 接口。在返回 `beanName` 之前进行打印了类的全限定名以及自定义的 Bean 的名称。类是完成了，但是如何让他在 Spring 容器中生效呢？

其实使其生效很简单，直接利用包扫描组件即可：

### JavaConfig

```java
@Configuration
@ComponentScan(
    value = "com.mingrn.spring.beanname",
    nameGenerator = CustomeBeanNameGenerator.class  // <== 指定 BeanNameGenerator 类
)
public class Config {

}
```

### XML

基于XML配置同样在 `<component-scan />` 组件中使用 `name-generator` 指定 `BeanNameGenerator` 类即可：

```java
<context:component-scan base-package="xxx.xxx" name-generator="xxx.xxx.CustomeBeanNameGenerator" />
```

最后，我们启动测试类看下输出信息：

```plain
Bean:[com.mingrn.spring.beanname.bean.Admin] Id Is: _admin
Bean:[com.mingrn.spring.beanname.bean.User] Id Is: _user
```

如果你不信输出的信息，你可以再执行如下方法看是否成功获取 Admin 类型的 Bean，并成功打印输出信息：

```java
Admin admin = (Admin) context.getBean("_admin");
admin.print();
```

到此，在 Spring 中如何自定义 BeamName 生成策略就说完了 ~

## 总结

其实，很多时候我们不了解一个功能大多原因是我们听都没通过。就拿这个 `BeanNameGenerator` 来说，之前完全不知道，还是又一次意外的浏览了一片文章上面有提到过自定义 BeanName 生成策略。

接着查找相关资料发现原来在 Spring 中提供了一个 `BeanNameGenerator` 接口，利用该接口就可以实现生成策略。查看源码后，仔细阅读一下发现是那么的简单。

如果你不知道 BeanName 生成的具体流程我们可以借助 IDE 功能来一步一步调试。比如我们知道了该接口后我们就完全可以查找该接口的实现类：

![](https://media.ituknown.org/spring-media/BeanNameGenerator/BeanNameGeneratorImpl.webp)

找到实现类之后只需要大概浏览一下注释即可知道 XML 走的是 `DefaultBeanNameGenerator` 策略，注解走的是 `AnnotationBeanNameGenerator` 策略。然后再在重写的方法上进行 Debug 调试，查找调用链信息即可之上上一步、上上一步、上上上一步走的是哪一个方法，这样我们反向查找就能从开始一步一步走到这个方法，这一直走下来就是一个流程了。

![](https://media.ituknown.org/spring-media/BeanNameGenerator/AnnotationBeanNameGeneratorDebug.webp)


所以，学习 Spring 源码这也是一种方式啊🥳🥳🥳🥳
