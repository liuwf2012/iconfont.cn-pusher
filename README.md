# iconfont.cn-pusher
通过Tampermonkey脚本，向iconfont.cn添加按钮，每次更新项目时一并将最新地址推送到private的服务器

## 效果演示

![preview](https://sunmi-static.oss-cn-hangzhou.aliyuncs.com/assets/mgt/preview.gif)

## 背景

iconfont.cn确实是业界良心工具平台，自从三年前将图标开始在iconfont.cn平台维护项目图标，从UI到开发都舒心了许多（再也不用微信传文件了...）。

理想的开发流程上大致如下：
1. UI负责维护iconfont.cn上具体项目的icon
2. 开发阶段，根据项目从iconfont.cn拉取图标资源(.svg,.css,.woff,...)
3. 生产环境，构建工具从iconfont.cn拉取图标资源，参与打包构建

日常的开发过程就是在1，2，3中不断循环，由于iconfont.cn不提供open api来拉取项目图标，所以实操起来就变成：
1. UI负责维护iconfont.cn上具体项目的icon；
2. UI更新了icon，吼一下 “我图标上传了哈”；
3. 研发收到后，手动下载更换图标；
4. 打包构建，研发把icon以代码形式递交，参与打包构建；
5. 上面流程循环往复。。。

上面的流程显然很低效，我们还是期望能减少不必要的人为动作。

## 方案

问题的本质是如何请求非open的api来获取资源，大致有两种尝试


### 方案一
在私有服务器上，使用无头浏览器的方式，模拟登陆，之后带身份请求指定api获取图标资源。研发和构建阶段都直接向该服务器请求最新icon资源。

看到github上有个类似的实现，[地址](https://github.com/lomocc/get-iconfont-svg)


#### 优点
- 研发和构建阶段，能通过api获取最新icon资源

#### 缺点
- iconfont.cn外部登录方式主要是weibo和github
  - weibo登录有图形验证码或短信验证码，无头浏览器模拟登录凉凉
  - github登录，有时国内访问很慢（极少数），偶尔也伴随安全机制要做邮箱验证
  - 私有服务器模拟登录使用的是固定github账号，也就是所有项目必须添加这个github账号为参与者，否则也拉不到
- 每次请求都要跑一遍无头浏览器模拟登录，开销大了点

### 方案二
通过Tampermonkey类似插件来扩展iconfont.cn页面功能，每次更新项目图标时一并推送到备份服务器，之后研发和构建阶段都直接通过api请求备份服务器获取最新icon资源。


#### 优点
- 研发和构建阶段，能通过api获取最新icon资源
- 不需要关心iconfont.cn等登录问题，所有操作都在iconfont.cn进行，操作成功失败可见
- 主动推送备份，不需要频繁拉取

#### 缺点
- Tampermonkey脚本丢出去可就是随便copy了，所以不要带敏感配置

### 其他方式

原则上chrome-extension也能作为方案，有兴趣可实现一波


## 安装

```bash
$ npm i
```

## 运行

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 添加用户脚本
在浏览器的Tampermonkey插件中导入 `http://localhost:3000/js/iconfont-pusher.user.js` 用户脚本


## 最后

官方还是早点开放这部分api吧 -_-!

