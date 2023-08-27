const SnapshotSandbox  = require("../src/SnapshotSandbox");

describe("SnapshotSandbox", () => {
  afterEach(() => {
    delete window.value
  })
  it("激活时可以恢复微应用环境", () => {
    const sandbox = new SnapshotSandbox();
    
    // 假设以前有个旧值 value：1
    sandbox.modifiedMap = {
      value: 1
    };

    // 激活沙箱 需要恢复 value：1 => window
    sandbox.active();
    expect(sandbox.proxy.value).toEqual(1);
   });

   it("失活时可以恢复 window 环境", () => {
    const sandbox = new SnapshotSandbox();
    
    // 激活沙箱，windowSnapshot存储上一个window环境
    sandbox.proxy.value = 333;
    sandbox.active();
    expect(sandbox.windowSnapshot.value).toEqual(333);

    // 失活沙箱，modifiedMap存储沙箱的变更，作为下次恢复的依据
    sandbox.proxy.value = 444;
    sandbox.inactive();
    expect(sandbox.modifiedMap.value).toEqual(444);
   });
});
