## mini-js-sandbox

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