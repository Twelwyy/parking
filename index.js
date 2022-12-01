import * as XLSX from "xlsx";

import "./styles.css";

var wb; // Читать законченные данные
var rABS = false; // Читать файл как двоичную строку
var payload = new Set();

function importExcel(obj) {
  // Импорт
  console.log(obj);
  if (!obj.files) {
    return;
  }
  const IMPORTFILE_MAXSIZE = 1 * 1024; // Размер файла импорта можно настроить здесь
  var suffix = obj.files[0].name.split(".")[1];
  if (suffix !== "xls" && suffix != "xlsx") {
    alert("Неверный формат импортированного файла!");
    return;
  }
  if (obj.files[0].size / 1024 > IMPORTFILE_MAXSIZE) {
    alert("Размер импортируемой таблицы не может превышать 1M");
    return;
  }
  var f = obj.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    if (rABS) {
      wb = XLSX.read(btoa(fixdata(data)), {
        // ручное преобразование
        type: "base64"
      });
    } else {
      wb = XLSX.read(data, {
        type: "binary"
      });
    }

    const jsonSheet = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    payload = jsonSheet.reduce((acc, item) => {
      acc.add(...Object.values(item));
      return acc;
    }, new Set());
  };
  if (rABS) {
    reader.readAsArrayBuffer(f);
  } else {
    reader.readAsBinaryString(f);
  }
}

function search(str) {
  console.log(str, payload);
  if (payload.has(str)) {
    document.getElementById("demo").innerText = "Найдено";
  } else {
    document.getElementById("demo").innerText = "Не найдено";
  }
}

function fixdata(data) {
  // Поток файлов BinaryString
  var o = "",
    l = 0,
    w = 10240;
  for (; l < data.byteLength / w; ++l)
    o += String.fromCharCode.apply(
      null,
      new Uint8Array(data.slice(l * w, l * w + w))
    );
  o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
  return o;
}

void document
  .getElementById("file")
  ?.addEventListener("change", function listener(e) {
    importExcel(this);
  });

void document
  .getElementById("text")
  ?.addEventListener("input", function listener(e) {
    search(e.target.value);
  });
