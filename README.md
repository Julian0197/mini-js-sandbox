## mini-js-sandbox

沙箱原理：环境隔离，子应用 A 过来执行后，离开时要把环境恢复成原来的样子，不然当加载子应用 B 时，就会用到子应用 A 在全局留下的内容，从而造成环境污染。

### jsDOM测试环境准备

如何测试使用浏览器API的代码呢？比如有一个 `storage`，可以通过指定 `type = 'indexedDB' | 'cookie' | 'localStorage'` 来切换存储的方式，而且还可以生成自定义的 `key`，防止全局污染。

#### 全局Mock

由于nodeJS没有并没有 `localStorage`，可以采用全局Mock的方式防止localStorage的Mock代码：

```js
// tests/jest-setup.ts
Object.defineProperty(global, 'localStorage', {
  value: {
    store: {} as Record<string, string>,
    setItem(key: string, value: string) {
      this.store[key] = value;
    },
    getItem(key: string) {
      return this.store[key];
    },
    removeItem(key: string) {
      delete this.store[key];
    },
    clear() {
      this.store = {}
    }
  },
  configurable: true,
})
```

然后在 `jest.config.js` 里添加 `setupFilesAfterEnv` 配置：

```js
module.exports = {
  setupFilesAfterEnv: ['./tests/jest-setup.ts'],
};
```

设置了之后，`jest-setup.ts` 会在每个测试文件执行前先执行一次。 相当于每执行一次测试，都会在全局添加一次 `localStorage` 的 `Mock` 实现。 

#### jsDOM

不可能把所有的浏览器API都Mock一遍，所以需要一个浏览器环境，jest提供了一个jsDOM的环境，可以在nodeJS里模拟浏览器环境。

```js
module.exports = {
  testEnvironment: "jsdom",
}
```

添加 jsdom 测试环境后，全局会自动拥有完整的浏览器标准 API。这个库用 JS 实现了一套 Node.js 环境下的 Web 标准 API。 由于 Jest 的测试文件也是 Node.js 环境下执行的，所以 Jest 用这个库充当了浏览器环境的 Mock 实现。

#### 配置环境

`npm i -D jest @types/jest jest-environment-jsdom`

+ 安装 `@types/jest` 可以让 IDE 有更充分的提示。
+ Jest 从 28 版本开始已不再集成 `jsdom` 测试环境了，所以这里要单独安装 `jest-environment`。

`npx jest --init`

自动生成了 `jest.config.js` 配置文件，里面有一些默认配置，可以根据需要修改。

接下来我们在src目录下编写沙箱实现，在tests目录下编写测试用例。

### 快照沙箱

`qiankun` 的快照沙箱是基于 `diff` 来实现的，主要用于不支持 `window.Proxy` 的低版本浏览器。

**用 `windowSnapshot` 来记录上一次 `window` 的环境，用 `modifiedMap` 来记录沙箱里的变更，以此作为恢复环境的依据。**

进入沙箱时：
+ 存储原来的 window 快照信息到 windowSnapshot
+ 从 modifiyPropsMap 还原 window 对象

离开沙箱时：
+ 对 windowSnapshot 和当前 window 对象进行 diff，变更的值存到 modifyPropsMap
+ 将 window 对象还原成 windowSnapshot



