## 前言

消息头 `Content-Disposition` 我们通常用于文件二进制数据传输。一说道文件传输大家可能都会想到将该消息头作为响应体的一部分用于文件下载，但实际上你在文件上传时也使用了该消息头。虽然你没显示的设置该消息头，但我们都知道，文件上传我们使用的 `Content-Type` 都是 `multipart/form-data`。而该消息类型内部在数据体格式中就会使用该消息头。

也就是说，HTTP 头信息 `Content-Disposition` 不仅仅可以用于响应，还可以用于请求！

## 表单数据提交/文件上传

`Content-Disposition` 作为请求体的三种用法：

```
Content-Disposition: form-data
Content-Disposition: form-data; name="fieldName"
Content-Disposition: form-data; name="fieldName"; filename="filename.jpg"
```

你一定注意到了 `form-data`，也就是说 `Content-Disposition` 在请求体中唯一的用法就是用于提交 Form 表单数据。

提交表单数据主要有个两种请求类型，分别是 `application/x-www-form-urlencoded` 和 `multipart/form-data`。

这两个请求类型都可以用于提交 Form 表单数据，但是请求类型 `multipart/form-data` 的优势在于文件上传（即表单数据中包含文件等二进制数据）。有关这两个请求类型的优缺点会有专门的文章介绍，这里来简单的说下 `multipart/form-data` 请求类型。

为什么说 `multipart/form-data` 请求类型内部使用了 `Content-Disposition` 头信息呢？

原因是使用 `multipart/form-data` 请求类型时，它会将表单数据封装为如下格式：

```
--
Content-Disposition: form-data; name=""
Content-Type:

[DATA]
--
Content-Disposition: form-data; name=""; filename=""
Content-Type:

[DATA]
----
```

也就是说，`Content-Disposition` 并不是真正的用于指定消息头。而是在数据体内部使用，用于定义数据的格式，它是请求体的一部分。这一点需要注意，不要真的以为它是请求头的一部分。

`Content-Disposition: form-data` 是用于请求时的固定写法，表示提交的是表单数据，这是 `Content-Disposition` 作为请求体中唯一的用法。

`name=""` 指定的是 form 表单的 name 值，比如有一个表单如下：


```html
<body>
    <form action="/upload" enctype="multipart/form-data">
        <div>
            用户名<input type="text" name="username">
        </div>
        <div>
            <button type="submit">提交</button>
        </div>
    </form>
</body>
```

假设 `username="张三"`，那么对应的 `multipart/form-data` 数据体为：


```
--
Content-Disposition: form-data; name="username"
Content-Type:

张三
----
```

再比如，form 表单中还需要上传文件：

```html
<body>
    <form action="/upload" enctype="multipart/form-data">
        <div>
            用户名<input type="text" name="username">
        </div>
        <div>
            头像<input type="file" name="profilePhoto">
        </div>
        <div>
            <button type="submit">提交</button>
        </div>
    </form>
</body>
```

表单的数据为：

```
username=张三
profilePhoto=/Users/kali/example.png
```

那么此时对应的 `multipart/form-data` 数据体为：

```
--
Content-Disposition: form-data; name="username"
Content-Type: text/plain

张三
--
Content-Disposition: form-data; name="profilePhoto"; filename="example.png"
Content-Type: image/png

< /Users/kali/example.png
----
```

现在明白 `Content-Disposition` 在请求时的用法了吗？总的来说，在请求中 `Content-Disposition` 唯一用法就是用于表单数据提交中定义它的消息体中的数据。但是该消息头不是我们设置了，而是 `multipart/form-data` 数据体内部使用的，它是作为数据体的一部分，而不是真正用于请求头。

## 文件下载

说完了在请求中的用法，那我们再来看下在响应中如何使用。

与请求不同，在响应中 `Content-Disposition` 是真正的作为消息头的一部分，它主要有两种用法：

```
Content-Disposition: inline
Content-Disposition: attachment
Content-Disposition: attachment; filename="filename.jpg"
```

当它的值为 `inline` 时，表示响应的消息作为 HTML 页面的一部分（`inline` 是默认值）。假设你本身想要下载一个 PDF 文件，但是你将 `Content-Disposition` 的值设置为 `inline` 或者没设置，你的响应头对应如下：

```
Content-Type: application/pdf
Content-Disposition: inline; filename="example.pdf"
```

那么此时浏览器不会去下载这个文件，而是直接在浏览器中去打开这个 PDF 文件。相信这样的场景大家会熟悉，我们经常去浏览一个学术完整的 PDF 链接时都是直接在浏览器中打开 PDF 文件，而不是下载到本地，这就是设置了 `Content-Disposition: inline` 的原因（即使没设置它的默认值也是这个）。

现在再来看下 `Content-Disposition: attachment`，这个是真正意义上的文件下载。还是以前面的响应头为例：

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="example.pdf"
```

此时，当服务器给客户端（通常是浏览器）响应时，它会有一个弹窗提示，提醒你保存文件。而保存的文件的默认名就是 `filename` 指定的值，当然该属性是非必须的，不设置也没关系。

这就是 `inline` 和 `attachment` 的区别，也是 `Content-Disposition` 作为响应头的主要用法。

另外，在 stackoverflow 上也有一个关于 `inline` 和 `attachment` 区别的问题，有兴趣的可以去看下下面的回答：

[Content-Disposition:What are the differences between "inline" and "attachment"?](https://stackoverflow.com/questions/1395151/content-dispositionwhat-are-the-differences-between-inline-and-attachment)

总的来说，当 `Content-Disposition` 作为响应头时的主要功能就是用于文件下载！

### 关于文件下载的问题

我们通常使用 `Content-Disposition` 作为响应头一部分来实现下载时经常会遇到在 Chrome、Safari 浏览器正常，但是在 IE 浏览器却无法正常下载的问题。当然了，现在微软也已经放弃 IE 取而代之的是 Chrome 内核的 Edg 浏览器。但是啊，说不定有些钉子客户依然使用的是八十年代的计算机呢？说不定还是 IE6 也说不定。

所以，当我们遇到在 IE 上有问题是通常是做过有关禁止浏览器缓存的操做，所以我们最好还要加上下面的响应头：

```
Pragma: No-cache
Cache-Control: No-cache
Expires: 0
```

你以为就这一个问题，不知道你有没有遇到过文件下载出现乱码的问题，关于这个问题的解决方案在 [阿里云·开发者社区](https://developer.aliyun.com) 中有一篇文章说了该如何解决该问题（链接如下），其他的就不做多数了。

[HTTP协议header中Content-Disposition中文文件名乱码](https://developer.aliyun.com/article/38945)

## 资源链接

[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Disposition](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Disposition)

[https://stackoverflow.com/questions/1395151/content-dispositionwhat-are-the-differences-between-inline-and-attachment](https://stackoverflow.com/questions/1395151/content-dispositionwhat-are-the-differences-between-inline-and-attachment)

[https://developer.aliyun.com/article/38945](https://developer.aliyun.com/article/38945)