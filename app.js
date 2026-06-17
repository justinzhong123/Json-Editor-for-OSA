function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
const {
  DragDropContext,
  Droppable,
  Draggable
} = window.ReactBeautifulDnd;
function App() {
  const [mode, setMode] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(null);
  const handleFileUpload = e => {
    const file = e.dataTransfer?.files?.[0] || e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target.result);
        if (Array.isArray(json) && json[0]?.personalInfo) {
          setMode("staff");
          setJsonData(json);
        } else if (json?.sections?.[0]?.forms) {
          setMode("regdoc");
          setJsonData(json);
        } else {
          throw new Error("格式不明");
        }
        setError(null);
      } catch (e) {
        setError("載入的 JSON 格式錯誤，請檢查檔案內容。");
        setJsonData(null);
        setMode(null);
      }
    };
    reader.readAsText(file);
  };
  const handleDrop = e => {
    e.preventDefault();
    handleFileUpload(e);
  };
  const handleDragOver = e => e.preventDefault();
  return /*#__PURE__*/React.createElement("main", {
    className: "p-8 max-w-7xl mx-auto"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-bold mb-6"
  }, "JSON \u7DE8\u8F2F\u5668"), /*#__PURE__*/React.createElement("div", {
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onClick: () => document.getElementById('fileInput').click(),
    className: "cursor-pointer border-2 border-dashed border-gray-400 rounded p-6 text-center text-gray-700 mb-6 bg-white shadow hover:bg-gray-100"
  }, fileName ? /*#__PURE__*/React.createElement("p", null, "\uD83D\uDCC4 \u76EE\u524D\u5DF2\u8F09\u5165\uFF1A", /*#__PURE__*/React.createElement("strong", null, fileName), "\uFF08\u9EDE\u64CA\u6B64\u5340\u53EF\u91CD\u65B0\u8F09\u5165\uFF09") : /*#__PURE__*/React.createElement("p", null, "\uD83D\uDCC2 \u62D6\u66F3 JSON \u6A94\u6848\u81F3\u6B64\u5340\uFF0C\u6216\u9EDE\u64CA\u9078\u64C7\u6A94\u6848"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    id: "fileInput",
    accept: "application/json",
    onChange: handleFileUpload,
    style: {
      display: "none"
    }
  })), error && /*#__PURE__*/React.createElement("div", {
    className: "bg-red-100 text-red-800 border border-red-300 rounded p-4 mb-6 shadow"
  }, error), mode && /*#__PURE__*/React.createElement("div", {
    className: "mb-6 text-sm text-gray-600"
  }, "\uD83D\uDD27 \u76EE\u524D\u6A21\u5F0F\uFF1A", /*#__PURE__*/React.createElement("strong", null, mode === "staff" ? "人員執掌" : "法規 / 文檔下載")), mode === "staff" && /*#__PURE__*/React.createElement(StaffEditor, {
    jsonData: jsonData,
    setJsonData: setJsonData,
    fileName: fileName
  }), mode === "regdoc" && /*#__PURE__*/React.createElement(RegulationEditor, {
    jsonData: jsonData,
    setJsonData: setJsonData,
    fileName: fileName
  }));
}
function StaffEditor({
  jsonData,
  setJsonData,
  fileName
}) {
  const exportToEAD = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ead_staff.json";
    a.click();
    setTimeout(() => {
      window.open("ead.html", "_blank");
    }, 500);
  };
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [originalData, setOriginalData] = useState(JSON.parse(JSON.stringify(jsonData)));
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const campuses = ["第一校區", "建工校區", "楠梓校區", "燕巢校區", "旗津校區"];
  const [selectedCampus, setSelectedCampus] = useState("全部");
  const fieldMapping = {
    "pfp-image": "圖片連結",
    name: "姓名",
    "job-title": "職務",
    deputy: "代理人",
    extension: "分機",
    campus: "校區",
    email: "電子郵件",
    responsibilities: "職責"
  };
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName || "data.json";
    link.click();
  };
  const handleInputChange = (key, value) => {
    const updatedData = [...jsonData];
    if (key === "responsibilities") {
      updatedData[selectedIndex].responsibilities = value;
    } else {
      updatedData[selectedIndex].personalInfo[key] = value;
    }
    setJsonData(updatedData);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 1500);
  };
  const handleCampusChange = campus => {
    const updatedData = [...jsonData];
    const currentCampuses = updatedData[selectedIndex].personalInfo.campus.split('・').filter(Boolean);
    let newCampuses;
    if (currentCampuses.includes(campus)) {
      // 移除已選校區
      newCampuses = currentCampuses.filter(c => c !== campus);
    } else {
      // 加入新校區
      newCampuses = [...currentCampuses, campus];
    }

    // 用"・"符號連接校區
    updatedData[selectedIndex].personalInfo.campus = newCampuses.join('・');
    setJsonData(updatedData);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 1500);
  };
  const handleAdd = () => {
    const newEntry = {
      personalInfo: {
        "pfp-image": "none",
        name: "",
        "job-title": "",
        deputy: "",
        extension: "",
        campus: "",
        email: ""
      },
      responsibilities: [""]
    };
    const updated = [...jsonData, newEntry];
    setJsonData(updated);
    setSelectedIndex(updated.length - 1);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 1500);
  };
  const handleDelete = () => {
    if (selectedIndex === null || jsonData.length === 0) return;
    const updated = jsonData.filter((_, idx) => idx !== selectedIndex);
    setJsonData(updated);
    setSelectedIndex(updated.length > 0 ? 0 : null);
  };
  const handleReset = () => {
    setJsonData(JSON.parse(JSON.stringify(originalData)));
    setSelectedIndex(0);
  };
  const addResponsibility = () => {
    const updated = [...jsonData];
    updated[selectedIndex].responsibilities.push("");
    setJsonData(updated);
  };
  const removeResponsibility = i => {
    const updated = [...jsonData];
    updated[selectedIndex].responsibilities.splice(i, 1);
    setJsonData(updated);
  };
  const handleDragEnd = result => {
    if (!result.destination) return;
    if (result.type === "staff") {
      const reordered = Array.from(jsonData);
      const [moved] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, moved);
      setJsonData(reordered);
      setSelectedIndex(result.destination.index);
    }
    if (result.type === "responsibility" && selectedIndex !== null) {
      const updated = [...jsonData];
      const current = updated[selectedIndex];
      const items = Array.from(current.responsibilities);
      const [moved] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, moved);
      current.responsibilities = items;
      setJsonData(updated);
    }
  };
  const selected = jsonData[selectedIndex] || null;
  return /*#__PURE__*/React.createElement(DragDropContext, {
    onDragEnd: handleDragEnd
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4 mb-6"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: downloadJSON,
    className: "bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
  }, "\u4E0B\u8F09 JSON")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-64 bg-white shadow rounded p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-3"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-semibold"
  }, "\u8077\u54E1\u540D\u55AE"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 text-sm"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleAdd,
    className: "bg-blue-100 text-blue-800 px-2 py-1 rounded shadow hover:bg-blue-200"
  }, "\u65B0\u589E"), /*#__PURE__*/React.createElement("button", {
    onClick: handleDelete,
    className: "bg-red-100 text-red-800 px-2 py-1 rounded shadow hover:bg-red-200"
  }, "\u522A\u9664"), /*#__PURE__*/React.createElement("button", {
    onClick: handleReset,
    className: "bg-gray-100 text-gray-800 px-2 py-1 rounded shadow hover:bg-gray-200"
  }, "\u5FA9\u539F"))), /*#__PURE__*/React.createElement(Droppable, {
    droppableId: "staffList",
    type: "staff"
  }, provided => /*#__PURE__*/React.createElement("ul", _extends({
    className: "space-y-1"
  }, provided.droppableProps, {
    ref: provided.innerRef
  }), jsonData.map((entry, idx) => /*#__PURE__*/React.createElement(Draggable, {
    key: idx,
    draggableId: "person-" + idx,
    index: idx
  }, provided => /*#__PURE__*/React.createElement("li", _extends({
    ref: provided.innerRef
  }, provided.draggableProps), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center"
  }, /*#__PURE__*/React.createElement("div", _extends({}, provided.dragHandleProps, {
    className: "cursor-grab px-2 text-gray-400 hover:text-gray-600"
  }), "\uFE19"), /*#__PURE__*/React.createElement("button", {
    className: `flex-1 text-left px-2 py-1 rounded hover:bg-blue-100 ${selectedIndex === idx ? 'bg-blue-200 font-semibold' : ''}`,
    onClick: () => setSelectedIndex(idx)
  }, entry.personalInfo["job-title"], " - ", entry.personalInfo.name || "(未命名)"))))), provided.placeholder))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, selected ? /*#__PURE__*/React.createElement("div", {
    className: "bg-white shadow-md rounded p-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6"
  }, Object.keys(selected.personalInfo).map(key => /*#__PURE__*/React.createElement("div", {
    key: key
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-sm font-medium block mb-1"
  }, fieldMapping[key] || key), key === "campus" ? /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, campuses.map(campus => {
    // 解析目前已選校區
    const selectedCampuses = selected.personalInfo.campus.split('・').filter(Boolean);
    return /*#__PURE__*/React.createElement("label", {
      key: campus,
      className: "flex items-center space-x-2"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: selectedCampuses.includes(campus),
      onChange: () => handleCampusChange(campus),
      className: "rounded border-gray-300"
    }), /*#__PURE__*/React.createElement("span", null, campus));
  })) : /*#__PURE__*/React.createElement("input", {
    type: key === "email" ? "email" : "text",
    value: selected.personalInfo[key],
    onChange: e => handleInputChange(key, e.target.value),
    className: "block w-full rounded border border-gray-300 p-2 shadow-sm"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "md:col-span-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-sm font-medium block mb-2"
  }, "\u8077\u8CAC"), /*#__PURE__*/React.createElement(Droppable, {
    droppableId: "resp",
    type: "responsibility"
  }, provided => /*#__PURE__*/React.createElement("div", _extends({
    className: "space-y-3",
    ref: provided.innerRef
  }, provided.droppableProps), selected.responsibilities.map((item, i) => /*#__PURE__*/React.createElement(Draggable, {
    key: i,
    draggableId: `resp-${i}`,
    index: i
  }, provided => /*#__PURE__*/React.createElement("div", _extends({
    ref: provided.innerRef
  }, provided.draggableProps, provided.dragHandleProps, {
    className: "flex items-center gap-2"
  }), /*#__PURE__*/React.createElement("span", {
    className: "w-6 text-right text-sm text-gray-600"
  }, i + 1, "."), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: item,
    onChange: e => {
      const newList = [...selected.responsibilities];
      newList[i] = e.target.value;
      handleInputChange("responsibilities", newList);
    },
    className: "flex-1 rounded border border-gray-300 p-2 shadow-sm"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeResponsibility(i),
    className: "text-red-600 text-sm hover:underline"
  }, "\u522A\u9664")))), provided.placeholder)), /*#__PURE__*/React.createElement("button", {
    onClick: addResponsibility,
    className: "mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow"
  }, "\u65B0\u589E\u8077\u8CAC")))) : /*#__PURE__*/React.createElement("p", {
    className: "text-gray-500"
  }, "\u8ACB\u5148\u5F9E\u5DE6\u5074\u9078\u64C7\u8077\u54E1\u9032\u884C\u7DE8\u8F2F\u3002"))));
}
function RegulationEditor({
  jsonData,
  setJsonData,
  fileName
}) {
  const exportToDocPage = () => {
    const blob = new Blob([JSON.stringify({
      sections: [{
        id: jsonData.sections[0].id,
        title: jsonData.sections[0].title,
        forms: data
      }]
    }, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.json";
    a.click();
    setTimeout(() => {
      window.open("document-download.html", "_blank");
    }, 500);
  };
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [originalData, setOriginalData] = useState(JSON.parse(JSON.stringify(jsonData.sections[0].forms)));
  const [lastDeletedForm, setLastDeletedForm] = useState(null);
  const data = jsonData.sections[0].forms;
  const fieldMapping = {
    title: "標題",
    odtUrl: "ODT 下載連結",
    pdfUrl: "PDF 下載連結",
    docxUrl: "DOCX 下載連結",
    lastUpdate: "最後更新日期",
    contacts: "聯絡人清單",
    name: "姓名",
    extension: "分機"
  };
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({
      sections: [{
        id: jsonData.sections[0].id,
        title: jsonData.sections[0].title,
        forms: data
      }]
    }, null, 2)], {
      type: "application/json"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName || "data.json";
    link.click();
  };
  const handleInputChange = (key, value) => {
    const updated = [...data];
    updated[selectedIndex][key] = value;
    jsonData.sections[0].forms = updated;
    setJsonData({
      ...jsonData
    });
  };
  const handleContactChange = (field, value) => {
    const updated = [...data];
    updated[selectedIndex].contacts[0][field] = value;
    jsonData.sections[0].forms = updated;
    setJsonData({
      ...jsonData
    });
  };
  const handleDragEnd = result => {
    if (!result.destination) return;
    const reordered = Array.from(data);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    jsonData.sections[0].forms = reordered;
    setJsonData({
      ...jsonData
    });
    setSelectedIndex(result.destination.index);
  };
  const addForm = () => {
    const newEntry = {
      title: "",
      odtUrl: "",
      pdfUrl: "",
      docxUrl: "",
      lastUpdate: "",
      contacts: [{
        name: "",
        extension: ""
      }]
    };
    jsonData.sections[0].forms = [...data, newEntry];
    setJsonData({
      ...jsonData
    });
    setSelectedIndex(data.length);
  };
  const deleteForm = () => {
    setLastDeletedForm(data[selectedIndex]);
    const updated = data.filter((_, i) => i !== selectedIndex);
    jsonData.sections[0].forms = updated;
    setJsonData({
      ...jsonData
    });
    setSelectedIndex(updated.length > 0 ? 0 : null);
  };
  const resetData = () => {
    if (lastDeletedForm) {
      jsonData.sections[0].forms.splice(selectedIndex + 1, 0, lastDeletedForm);
      setJsonData({
        ...jsonData
      });
      setSelectedIndex(selectedIndex + 1);
      setLastDeletedForm(null);
    } else {
      jsonData.sections[0].forms = JSON.parse(JSON.stringify(originalData));
      setJsonData({
        ...jsonData
      });
      setSelectedIndex(0);
    }
  };
  const selected = data[selectedIndex] || null;
  return /*#__PURE__*/React.createElement(DragDropContext, {
    onDragEnd: handleDragEnd
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4 mb-6"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: downloadJSON,
    className: "bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
  }, "\u4E0B\u8F09 JSON"), /*#__PURE__*/React.createElement("div", {
    className: "ml-auto text-sm text-gray-600"
  }, "\u76EE\u524D\u6A21\u5F0F\uFF1A\u6CD5\u898F / \u6587\u6A94\u4E0B\u8F09")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-64 bg-white shadow rounded p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-3"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-semibold"
  }, "\u6587\u4EF6\u5217\u8868"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 text-sm"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: addForm,
    className: "bg-blue-100 text-blue-800 px-2 py-1 rounded shadow hover:bg-blue-200"
  }, "\u65B0\u589E"), /*#__PURE__*/React.createElement("button", {
    onClick: deleteForm,
    className: "bg-red-100 text-red-800 px-2 py-1 rounded shadow hover:bg-red-200"
  }, "\u522A\u9664"), /*#__PURE__*/React.createElement("button", {
    onClick: resetData,
    className: "bg-gray-100 text-gray-800 px-2 py-1 rounded shadow hover:bg-gray-200"
  }, "\u5FA9\u539F"))), /*#__PURE__*/React.createElement(Droppable, {
    droppableId: "formList",
    type: "form"
  }, provided => /*#__PURE__*/React.createElement("ul", _extends({
    className: "space-y-1"
  }, provided.droppableProps, {
    ref: provided.innerRef
  }), data.map((entry, idx) => /*#__PURE__*/React.createElement(Draggable, {
    key: idx,
    draggableId: "form-" + idx,
    index: idx
  }, provided => /*#__PURE__*/React.createElement("li", _extends({
    ref: provided.innerRef
  }, provided.draggableProps), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center"
  }, /*#__PURE__*/React.createElement("div", _extends({}, provided.dragHandleProps, {
    className: "cursor-grab px-2 text-gray-400 hover:text-gray-600"
  }), "\uFE19"), /*#__PURE__*/React.createElement("button", {
    className: `flex-1 text-left px-2 py-1 rounded hover:bg-blue-100 ${selectedIndex === idx ? 'bg-blue-200 font-semibold' : ''}`,
    onClick: () => setSelectedIndex(idx)
  }, entry.title || "(未命名)"))))), provided.placeholder))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, selected ? /*#__PURE__*/React.createElement("div", {
    className: "bg-white shadow-md rounded p-6 space-y-4"
  }, Object.entries(selected).map(([key, value]) => {
    if (key === "contacts") return null;
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      className: key === "lastUpdate" ? "w-1/2" : "w-full"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-sm font-medium block mb-1"
    }, fieldMapping[key] || key), /*#__PURE__*/React.createElement("input", {
      type: key === "lastUpdate" ? "date" : "text",
      value: value,
      onChange: e => handleInputChange(key, e.target.value),
      className: "block w-full rounded border border-gray-300 p-2 shadow-sm"
    }));
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-sm font-medium block mb-2"
  }, "\u806F\u7D61\u4EBA\u6E05\u55AE"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 items-center w-1/2"
  }, /*#__PURE__*/React.createElement("input", {
    className: "flex-1 border p-2 rounded",
    placeholder: "\u59D3\u540D",
    value: selected.contacts[0].name,
    onChange: e => handleContactChange("name", e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    className: "w-24 border p-2 rounded",
    placeholder: "\u5206\u6A5F",
    value: selected.contacts[0].extension,
    onChange: e => handleContactChange("extension", e.target.value)
  })))) : /*#__PURE__*/React.createElement("p", {
    className: "text-gray-500"
  }, "\u8ACB\u5148\u5F9E\u5DE6\u5074\u9078\u64C7\u6587\u4EF6\u9032\u884C\u7DE8\u8F2F\u3002"))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
