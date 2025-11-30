



```bash
-S --since=DATE            显示指定日期之后的日志
-U --until=DATE            显示指定日期之前的日志

-b --boot[=ID]             显示本次[或指定]系统启动引导日志
--list-boots               显示系统启动引导记录列表信息

-k --dmesg                 显示本次启动内核日志

-u --unit=UNIT             显示指定服务单元日志(模糊匹配)

-g --grep=PATTERN          条件过滤, 同 `grep`

-e --pager-end             调到日志尾部
-f --follow                同 `tail -f`

--utc                      日志时间默认为机器时间, 可以使用该参数指定 UTC 世界时间
```


[https://www.freedesktop.org/software/systemd/man/journalctl.html](https://www.freedesktop.org/software/systemd/man/journalctl.html)