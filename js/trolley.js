// 获取商品 Div
let goods_div = $("#goods");

// 购物车中的所有商品
let goods = [
  // {
  //   name: "白菜",
  //   num: 1,
  //   weight: 500,
  //   price: 6,
  // },
];

// 商品总价
let total_money = 0;
// 商品总重量
let total_weight = 0;

// 添加商品至购物车
let add_good_to_trolley = (item) => {
  let item_div = `<div class="card col-5">
  <div class="card-body">
      <div class="row">
          <div class="col-6">
              <h2 class="card-title">${item.name}</h2>
          </div>
          <div class="col-6">
              <h5 class="price">￥${item.price}/${item.weight}g</h5>
          </div>
      </div>

      <div class="row">
          <div class="col-7">
              <button type="button" class="btn btn-light minus"> - </button>
              <span class="num"> 1 </span>
              <button type="button" class="btn btn-light add"> + </button>
          </div>

          <div class="col-5">
              <button type="button" class="btn btn-danger delete"> 删除 </button>
          </div>
      </div>
  </div>
</div>`;
  // 添加商品
  goods_div.append($(item_div));

  // 更新总价
  total_money += parseFloat(item.price);
  $("#total_money").text(`￥ ${total_money}`);

  // 更新总重量
  total_weight += parseFloat(item.weight);
  $("#total_weight").text(`${total_weight}g`);
};

for (item of goods) {
  add_good_to_trolley(item);
}

// 删除商品
$(".good-area").on("click", ".delete", (e) => {
  let index = $(".delete").index(e.target);
  let item = goods[index];

  // 更新总价和总重量
  total_money -= parseFloat(item.price * item.num);
  total_weight -= parseFloat(item.weight * item.num);
  goods.splice(index, 1);

  // 删除商品
  $(".card").eq(index).remove();
  $("#total_money").text(`￥ ${total_money}`);
  $("#total_weight").text(`${total_weight}g`);
});

// 减少商品
$(".good-area").on("click", ".minus", (e) => {
  let index = $(".minus").index(e.target);
  let item = goods[index];

  // 如果是最后一件，移除商品
  if (item.num > 1) {
    item.num -= 1;
    total_money -= parseFloat(item.price);
    total_weight -= parseFloat(item.weight);

    $(".num").eq(index).text(item.num);

    $("#total_money").text(`￥ ${total_money}`);
    $("#total_weight").text(`${total_weight}g`);
  } 
  // 其余情况，减少商品数量
  else {
    total_money -= parseFloat(item.price);
    total_weight -= parseFloat(item.weight);

    goods.splice(index, 1);

    $(".card").eq(index).remove();
    $("#total_money").text(`￥ ${total_money}`);
    $("#total_weight").text(`${total_weight}g`);
  }
});

// 添加商品
$(".good-area").on("click", ".add", (e) => {
  let index = $(".add").index(e.target);
  let item = goods[index];
  console.log(item);

  item.num += 1;
  $(".num").eq(index).text(item.num);
  total_money += parseFloat(item.price);
  total_weight += parseFloat(item.weight);

  $("#total_money").text(`￥ ${total_money}`);
  $("#total_weight").text(`${total_weight}g`);
});

// 清空购物车
$("#empty_trolley").click(() => {
  goods = [];
  $(".card").remove();
  total_money = 0;
  total_weight = 0;

  $("#total_money").text(`￥ ${total_money}`);
  $("#total_weight").text(`${total_weight}g`);
});

// 识别二维码
var video = document.createElement("video");
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");

// Use facingMode: environment to attemt to get the front camera on phones
navigator.mediaDevices
  .getUserMedia({
    video: {
      facingMode: "environment",
    },
  })
  .then(function (stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
  });

function debounce(fn, wait) {
  var timer = null;
  return function () {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, wait);
  };
}

// 框选识别到的二维码
function drawLine(begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 4;
  canvas.strokeStyle = color;
  canvas.stroke();
}

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    loadingMessage.hidden = true;
    canvasElement.hidden = false;

    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    var imageData = canvas.getImageData(
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    var code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      // 标记出二维码
      drawLine(
        code.location.topLeftCorner,
        code.location.topRightCorner,
        "#FF3B58"
      );
      drawLine(
        code.location.topRightCorner,
        code.location.bottomRightCorner,
        "#FF3B58"
      );
      drawLine(
        code.location.bottomRightCorner,
        code.location.bottomLeftCorner,
        "#FF3B58"
      );
      drawLine(
        code.location.bottomLeftCorner,
        code.location.topLeftCorner,
        "#FF3B58"
      );

      console.log(code.data);

      // 添加商品
      let item_info = code.data.split("_"); // 名称_价格_重量
      if (item_info.length == 3) {
        let item = {
          name: item_info[0],
          price: item_info[1],
          weight: item_info[2],
          num: 1,
        };

        if (goods.length == 0) {
          goods.push(item);
          add_good_to_trolley(item);
        } else {
          let flag = false;
          for (const good of goods) {
            console.log(good.name, item.name);
            if (good.name == item.name) flag = true;
          }
          if (!flag) {
            goods.push(item);
            add_good_to_trolley(item);
          }
        }
      }
    }
  }
  requestAnimationFrame(tick);
}

// 全屏
function requestFullScreen(element) {
  var requestMethod =
    element.requestFullScreen ||
    element.webkitRequestFullScreen ||
    element.mozRequestFullScreen ||
    element.msRequestFullScreen;
  if (requestMethod) {
    requestMethod.call(element);
  } else if (typeof window.ActiveXObject !== "undefined") {
    var wscript = new ActiveXObject("WScript.Shell");
    if (wscript !== null) {
      wscript.SendKeys("{F11}");
    }
  }
}

$("#fullscreen").click(() => {
  requestFullScreen(document.documentElement);
  $("#fullscreen").hide();
});

// 语音阅读
function readAloud(msg) {
  let speechSynthesisUtterance = new SpeechSynthesisUtterance(msg);
  window.speechSynthesis.speak(speechSynthesisUtterance);
}

// 语音播报
$("#readAloud").click(() => {
  let msg = "";

  if (goods.length == 0) {
    msg = "您的购物车为空！";
  } else {
    msg = "您的购物车中有：";

    for (const good of goods) {
      msg += `${good.name} ${good.num} 件 ${good.weight * good.num}克） ${
        good.price * good.num
      }元）、`;
    }

    msg += `；您购物车中商品总重量为 ${total_weight} 克，总价为 ${total_money} 元。`;
  }

  readAloud(msg);
});

// 求救
$("#sos").click(() => {
  let msg = "当前顾客需要帮助！当前顾客需要帮助！当前顾客需要帮助！";

  readAloud(msg);
});

// 语音识别
// 目前只有Chrome和Edge支持该特性，在使用时需要加私有化前缀
const SpeechRecognition = window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "cmn-Hans-CN"; //普通话 (中国大陆)
recognition.continuous = false;

const output = document.getElementById("output");

// 语音识别开始的钩子
recognition.onstart = function () {
  output.innerText = "语音识别开始";
};
// 如果没有声音则结束的钩子
recognition.onspeechend = function () {
  output.innerText = "语音识别结束";
  recognition.stop();
};
// 识别错误的钩子
recognition.onerror = function ({ error }) {
  const errorMessage = {
    "not-speech": "未检测到声源",
    "not-allowed": "未检测到麦克风设备或未允许浏览器使用麦克风",
  };
  // output.innerText = errorMessage[error] || "语音识别错误";
  output.innerText = error;
};

// 识别结果的钩子，
// 可通过interimResults控制是否实时识别，maxAlternatives设置识别结果的返回数量
recognition.onresult = function ({ results }) {
  console.log(results);
  const { transcript, confidence } = results[0][0];
  output.innerText = `识别的内容：${transcript}`;

  search_good(transcript.toString());
};

// 查找商品
const search_good = (good) => {
  let msg = "";

  switch (good) {
    case "面粉":
      msg = `${good}在 A 区 12 货柜。`;
      break;
    case "白菜":
      msg = `${good}在 D 区 3 货柜。`;
      break;
    case "芝士蛋糕":
      msg = `${good}在 G 区 7 货柜。`;
      break;
    case "薯片":
      msg = `${good}在 C 区 2 货柜。`;
      break;
    case "土豆":
      msg = `${good}在 B 区 6 货柜。`;
      break;
    case "遥控汽车":
      msg = `${good}在 Z 区 3 货柜。`;
      break;
    case "猪肉":
      msg = `${good}在 F 区 9 货柜。`;
      break;
    default:
      msg = `商品${good}暂未收录~`;
      break;
  }

  readAloud(msg);
};

$("#search_good").click(() => {
  let good = $("#search_input").val();
  search_good(good);
});

// 支付
$("#pay").click(() => {
  let msg = "支付成功！";

  readAloud(msg);
});
