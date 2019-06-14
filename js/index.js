const fs = require("fs");
const path = require("path");

var date = document.getElementById("dateInput");
function init() {
  let d = new Date();
  let year = d.getFullYear();
  let month =
    d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
  let day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
  date.value = year + "-" + month + "-" + day;
  getData();
  showProcess();
  bindEvent();
}
init();

// 获取要操作的json文件的路径
function getPath() {
  return path.join(__dirname, "data/" + date.value + ".json");
}

// 获取数据
function getData() {
  let getDataPath = getPath();
  console.log(getDataPath);
  fs.exists(getDataPath, exists => {
    if (exists) {
      fs.readFile(getDataPath, "utf8", (err, data) => {
        let taskList = JSON.parse(data);
        for (let i = 0; i < taskList["toFinish"].length; i++) {
          let content = taskList["toFinish"][i];
          generateNode(false, content, i);
        }
        for (let i = 0; i < taskList["isFinished"].length; i++) {
          let content = taskList["isFinished"][i];
          generateNode(true, content, i);
        }
      });
    }
  });
}

// 添加
function writeJson(content) {
  let writePath = path.join(__dirname, "data/" + date.value + ".json");
  fs.exists(writePath, exists => {
    if (!exists) {
      fs.writeFileSync(
        writePath,
        JSON.stringify({
          isFinished: [],
          toFinish: []
        })
      );
    }
    fs.readFile(writePath, "utf8", (err, data) => {
      let taskList = JSON.parse(data);
      taskList["toFinish"].push(content);
      fs.writeFile(writePath, JSON.stringify(taskList), () => {
        generateNode(false, content, taskList["toFinish"].length - 1);
        showProcess();
      });
    });
  });
}

// 生成对应的结点
function generateNode(isFinished, content, index) {
  let divNode = document.createElement("div");
  if (!isFinished) {
    divNode.className = "card mt-2 animated fadeInUp fast";
    divNode.innerHTML = `
        <div class="card-header  ">
          <div class="row">
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="${index +
                "toFinish"}"/>
              <label class="custom-control-label" for="${index +
                "toFinish"}">${content}</label>
            </div>
            <button type="button" class="close" id="${index + "button"}">
              "×"
            </button>
          </div>
        </div>`;
    document.getElementsByClassName("toFinish")[0].appendChild(divNode);
  } else {
    divNode.className = "card mt-2 border-success animated fadeInUp";
    divNode.innerHTML = `
      <div class="card-header">
          <div class="row">
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="${index +
                "isFinished"}" checked="true"/>
              <label class="custom-control-label" for="${index +
                "isFinished"}">${content}</label>
            </div>
            <button type="button" class="close" id="${index + "button"}">
              "×"
            </button>
          </div>
        </div>`;
    document.getElementsByClassName("isFinished")[0].appendChild(divNode);
  }
}

// 修改完成情况
function changeTaskStat(state, content) {
  let changePath = getPath();
  fs.readFile(changePath, "utf8", (err, data) => {
    let taskList = JSON.parse(data);
    if (state == "toFinish") {
      let index = taskList["toFinish"].indexOf(content);
      taskList["toFinish"].splice(index, 1);
      taskList["isFinished"].push(content);
    } else {
      let index = taskList["isFinished"].indexOf(content);
      taskList["isFinished"].splice(index, 1);
      taskList["toFinish"].push(content);
    }
    fs.writeFile(changePath, JSON.stringify(taskList), err => {
      console.log("更新状态成功");
      showProcess();
    });
  });
}

// 删除
function delTask(parNode, content) {
  let delPath = getPath();
  fs.readFile(delPath, "utf8", (err, data) => {
    let taskList = JSON.parse(data);
    console.log(parNode.classList);
    if (parNode.classList.contains("toFinish")) {
      let index = taskList["toFinish"].indexOf(content);
      taskList["toFinish"].splice(index, 1);
    } else {
      let index = taskList["isFinished"].indexOf(content);
      taskList["isFinished"].splice(index, 1);
    }
    fs.writeFile(delPath, JSON.stringify(taskList), err => {
      if (err) {
        alert("删除失败");
      } else {
        console.log("删除成功");
      }
    });
  });
}

// 绑定事件
function bindEvent() {
  // 绑定添加任务事件
  let addButton = document.getElementById("addButton");
  let input = document.getElementById("todoInput");
  input.addEventListener("keydown", e => {
    if (e.keyCode == 13) {
      let task = input.value;
      if (task) {
        writeJson(task);
        input.value = "";
      } else {
      }
    }
  });
  addButton.addEventListener("click", () => {
    let task = input.value;
    if (task) {
      writeJson(task);
      input.value = "";
    } else {
    }
  });
  // 绑定删除事件
  document.querySelector(".taskGroup").addEventListener("click", function(e) {
    if (e.target.classList.contains("close")) {
      let delNode = e.target.parentNode.parentNode.parentNode;
      let delNodeP = delNode.parentNode;
      let content = e.target.parentNode.children[0].children[1].innerText;
      delNode.classList.remove("fadeInUp", "animated");
      delNode.classList.add("animated", "zoomOutLeft", "quick");
      delTask(delNodeP, content);
      delNode.addEventListener("animationend", function() {
        delNodeP.removeChild(delNode);
        showProcess();
      });
    }
  });
  // 绑定时间改变事件
  date.addEventListener("change", e => {
    if (date.value) {
      reloadPage();
    }
  });
  // 绑定任务点击完成事件
  document.querySelector(".taskGroup").addEventListener("click", e => {
    if (e.target.classList.contains("custom-control-input")) {
      let node = e.target;
      let changeNode = node.parentNode.parentNode.parentNode.parentNode;
      let content = (node.nextElementSibling || node.nextSibling).innerText;
      if (node.checked) {
        let parNode = changeNode.parentNode;
        let broNode = parNode.nextElementSibling || parNode.nextSibling;
        changeNode.classList.add("border-success");
        changeTaskStat("toFinish", content);
        parNode.removeChild(changeNode);
        broNode.appendChild(changeNode);
      } else {
        let parNode = changeNode.parentNode;
        let broNode = parNode.previousElementSibling || parNode.previousSibling;
        changeNode.classList.remove("border-success");
        changeTaskStat("isFinished", content);
        parNode.removeChild(changeNode);
        broNode.appendChild(changeNode);
      }
    }
  });
  // 绑定设置页面dialog的事件
  let set = document.getElementById("setSVG");
  let setPage = document.getElementById("setPage");
  let mainPage = document.getElementsByClassName("mainPage")[0];
  set.addEventListener("click", () => {
    setPage.classList.remove("modal");
    setPage.classList.add("modal-show");
    mainPage.style = "opacity:0.5";
    getSetBasicList();
  });
  let closeX = document.getElementById("setClose");
  let closeButton = document.getElementById("closeButton");
  let saveButton = document.getElementById("saveButton");
  let addBasicListBt = document.getElementById("addBasicListBt");
  let basicInput = document.getElementById("basicInput");
  closeX.addEventListener("click", () => {
    setPage.classList.remove("modal-show");
    setPage.classList.add("modal");
    mainPage.style = "opacity:1";
  });
  closeButton.addEventListener("click", () => {
    setPage.classList.remove("modal-show");
    setPage.classList.add("modal");
    mainPage.style = "opacity:1";
  });
  addBasicListBt.addEventListener('click',()=>{
    let content = basicInput.value;
    
  })
}

// 日期改变重绘
function reloadPage() {
  let toFinish = document.getElementsByClassName("toFinish")[0];
  let isFinished = document.getElementsByClassName("isFinished")[0];
  while (toFinish.children[1]) {
    toFinish.removeChild(toFinish.children[1]);
  }
  while (isFinished.children[1]) {
    isFinished.removeChild(isFinished.children[1]);
  }
  showProcess();
  getData();
}

// 计算完成的量
function showProcess() {
  let readPath = getPath();
  fs.exists(readPath, exists => {
    if (exists) {
      fs.readFile(readPath, "utf8", (err, data) => {
        let taskList = JSON.parse(data);
        let toFinishN = taskList["toFinish"].length;
        let isFinishedN = taskList["isFinished"].length;
        document.getElementsByClassName("toFH")[0].innerText =
          "toFinish(" + toFinishN + ")";
        document.getElementsByClassName("isFH")[0].innerText =
          "isFinished(" + isFinishedN + ")";
        let bar = document.getElementsByClassName("progress-bar")[0];
        bar.style =
          "width:" + (100 * isFinishedN) / (isFinishedN + toFinishN) + "%;";
      });
    } else {
      document.getElementsByClassName("toFH")[0].innerText = "toFinish(0)";
      document.getElementsByClassName("isFH")[0].innerText = "isFinished(0)";
      let bar = document.getElementsByClassName("progress-bar")[0];
      bar.style = "width:0%";
    }
  });
}

function getSetBasicList() {
  var setPath = path.join(__dirname, "setting.json");
  fs.exists(setPath, exists => {
    if (exists) {
      fs.readFile(setPath, "utf8", (err, data) => {
        let paseData = JSON.parse(data);
        let basicList = paseData["basicList"];
        let parNode = document.getElementsByClassName('basicList')[0];
        for (let i = 0; i < basicList.length; i++) {
          let content = basicList[i];
          let node = generateBaicNode(content);
          parNode.appendChild(node);
        }
      });
    } else {
      fs.writeFile(
        setPath,
        JSON.stringify({
          theme: "Sketchy",
          basicList: []
        })
      );
    }
  });
}
function saveSetting() {}

function generateBaicNode(content) {
  let node = document.createElement("div");
  node.className = "card mt-2 animated fadeInUp fast"
  node.innerHTML = ` 
      <div class="card-header ">
        ${content}
        <button type="button" class="close">
          "×"
        </button>
      </div>`;
  return node;
}
