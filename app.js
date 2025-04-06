const { useState } = React;
    const { DragDropContext, Droppable, Draggable } = window.ReactBeautifulDnd;

    function App() {
      const [mode, setMode] = useState(null);
      const [jsonData, setJsonData] = useState(null);
      const [fileName, setFileName] = useState("");
      const [error, setError] = useState(null);

      const handleFileUpload = (e) => {
        const file = e.dataTransfer?.files?.[0] || e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
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

      const handleDrop = (e) => {
        e.preventDefault();
        handleFileUpload(e);
      };

      const handleDragOver = (e) => e.preventDefault();

      return (
        <main className="p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">JSON 編輯器</h1>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('fileInput').click()}
            className="cursor-pointer border-2 border-dashed border-gray-400 rounded p-6 text-center text-gray-700 mb-6 bg-white shadow hover:bg-gray-100"
          >
            {fileName ? (
              <p>📄 目前已載入：<strong>{fileName}</strong>（點擊此區可重新載入）</p>
            ) : (
              <p>📂 拖曳 JSON 檔案至此區，或點擊選擇檔案</p>
            )}
            <input
              type="file"
              id="fileInput"
              accept="application/json"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 border border-red-300 rounded p-4 mb-6 shadow">{error}</div>
          )}

          {mode && (
            <div className="mb-6 text-sm text-gray-600">
              🔧 目前模式：<strong>{mode === "staff" ? "人員執掌" : "法規 / 文檔下載"}</strong>
            </div>
          )}

          {mode === "staff" && <StaffEditor jsonData={jsonData} setJsonData={setJsonData} fileName={fileName} />}
          {mode === "regdoc" && <RegulationEditor jsonData={jsonData} setJsonData={setJsonData} fileName={fileName} />}
        </main>
      );
    }

    function StaffEditor({ jsonData, setJsonData, fileName }) {
  const exportToEAD = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
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
    responsibilities: "職責",
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
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

  const handleAdd = () => {
    const newEntry = {
      personalInfo: {
        "pfp-image": "none",
        name: "",
        "job-title": "",
        deputy: "",
        extension: "",
        campus: campuses[1],
        email: "",
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

  const removeResponsibility = (i) => {
    const updated = [...jsonData];
    updated[selectedIndex].responsibilities.splice(i, 1);
    setJsonData(updated);
  };

  const handleDragEnd = (result) => {
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex items-center gap-4 mb-6">
                        <button onClick={downloadJSON} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">下載 JSON</button>
        
      </div>
      <div className="flex gap-6">
        <div className="w-64 bg-white shadow rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">職員名單</h2>
            <div className="flex gap-2 text-sm">
              <button onClick={handleAdd} className="bg-blue-100 text-blue-800 px-2 py-1 rounded shadow hover:bg-blue-200">新增</button>
              <button onClick={handleDelete} className="bg-red-100 text-red-800 px-2 py-1 rounded shadow hover:bg-red-200">刪除</button>
              <button onClick={handleReset} className="bg-gray-100 text-gray-800 px-2 py-1 rounded shadow hover:bg-gray-200">復原</button>
            </div>
          </div>
          <Droppable droppableId="staffList" type="staff">
            {(provided) => (
              <ul className="space-y-1" {...provided.droppableProps} ref={provided.innerRef}>
                {jsonData.map((entry, idx) => (
                  <Draggable key={idx} draggableId={"person-" + idx} index={idx}>
                    {(provided) => (
                      <li ref={provided.innerRef} {...provided.draggableProps}>
                        <div className="flex items-center">
                          <div {...provided.dragHandleProps} className="cursor-grab px-2 text-gray-400 hover:text-gray-600">︙</div>
                          <button
                            className={`flex-1 text-left px-2 py-1 rounded hover:bg-blue-100 ${selectedIndex === idx ? 'bg-blue-200 font-semibold' : ''}`}
                            onClick={() => setSelectedIndex(idx)}
                          >
                            {entry.personalInfo["job-title"]} - {entry.personalInfo.name || "(未命名)"}
                          </button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </div>

        <div className="flex-1">
          {selected ? (
            <div className="bg-white shadow-md rounded p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(selected.personalInfo).map((key) => (
                  <div key={key}>
                    <label className="text-sm font-medium block mb-1">{fieldMapping[key] || key}</label>
                    {key === "campus" ? (
                      <select value={selected.personalInfo[key]} onChange={(e) => handleInputChange(key, e.target.value)} className="block w-full rounded border border-gray-300 p-2 shadow-sm">
                        {campuses.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input type={key === "email" ? "email" : "text"} value={selected.personalInfo[key]} onChange={(e) => handleInputChange(key, e.target.value)} className="block w-full rounded border border-gray-300 p-2 shadow-sm" />
                    )}
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium block mb-2">職責</label>
                  <Droppable droppableId="resp" type="responsibility">
                    {(provided) => (
                      <div className="space-y-3" ref={provided.innerRef} {...provided.droppableProps}>
                        {selected.responsibilities.map((item, i) => (
                          <Draggable key={i} draggableId={`resp-${i}`} index={i}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex items-center gap-2">
                                <span className="w-6 text-right text-sm text-gray-600">{i + 1}.</span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newList = [...selected.responsibilities];
                                    newList[i] = e.target.value;
                                    handleInputChange("responsibilities", newList);
                                  }}
                                  className="flex-1 rounded border border-gray-300 p-2 shadow-sm"
                                />
                                <button onClick={() => removeResponsibility(i)} className="text-red-600 text-sm hover:underline">刪除</button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <button onClick={addResponsibility} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow">新增職責</button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">請先從左側選擇職員進行編輯。</p>
          )}
        </div>
      </div>
    </DragDropContext>
  );
}
    function RegulationEditor({ jsonData, setJsonData, fileName }) {
  const exportToDocPage = () => {
    const blob = new Blob([
      JSON.stringify({
        sections: [
          {
            id: jsonData.sections[0].id,
            title: jsonData.sections[0].title,
            forms: data
          }
        ]
      }, null, 2)
    ], { type: "application/json" });
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
    const blob = new Blob([
      JSON.stringify({
        sections: [
          {
            id: jsonData.sections[0].id,
            title: jsonData.sections[0].title,
            forms: data
          }
        ]
      }, null, 2)
    ], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName || "data.json";
    link.click();
  };

  const handleInputChange = (key, value) => {
    const updated = [...data];
    updated[selectedIndex][key] = value;
    jsonData.sections[0].forms = updated;
    setJsonData({ ...jsonData });
  };

  const handleContactChange = (field, value) => {
    const updated = [...data];
    updated[selectedIndex].contacts[0][field] = value;
    jsonData.sections[0].forms = updated;
    setJsonData({ ...jsonData });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(data);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    jsonData.sections[0].forms = reordered;
    setJsonData({ ...jsonData });
    setSelectedIndex(result.destination.index);
  };

  const addForm = () => {
    const newEntry = {
      title: "",
      odtUrl: "",
      pdfUrl: "",
      docxUrl: "",
      lastUpdate: "",
      contacts: [{ name: "", extension: "" }]
    };
    jsonData.sections[0].forms = [...data, newEntry];
    setJsonData({ ...jsonData });
    setSelectedIndex(data.length);
  };

  const deleteForm = () => {
    setLastDeletedForm(data[selectedIndex]);
    const updated = data.filter((_, i) => i !== selectedIndex);
    jsonData.sections[0].forms = updated;
    setJsonData({ ...jsonData });
    setSelectedIndex(updated.length > 0 ? 0 : null);
  };

  const resetData = () => {
    if (lastDeletedForm) {
      jsonData.sections[0].forms.splice(selectedIndex + 1, 0, lastDeletedForm);
      setJsonData({ ...jsonData });
      setSelectedIndex(selectedIndex + 1);
      setLastDeletedForm(null);
    } else {
      jsonData.sections[0].forms = JSON.parse(JSON.stringify(originalData));
      setJsonData({ ...jsonData });
      setSelectedIndex(0);
    }
  };

  
  
  const selected = data[selectedIndex] || null;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex items-center gap-4 mb-6">
                        <button onClick={downloadJSON} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">下載 JSON</button>
        <div className="ml-auto text-sm text-gray-600">目前模式：法規 / 文檔下載</div>
      </div>

      <div className="flex gap-6">
        <div className="w-64 bg-white shadow rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">文件列表</h2>
            <div className="flex gap-2 text-sm">
              <button onClick={addForm} className="bg-blue-100 text-blue-800 px-2 py-1 rounded shadow hover:bg-blue-200">新增</button>
              <button onClick={deleteForm} className="bg-red-100 text-red-800 px-2 py-1 rounded shadow hover:bg-red-200">刪除</button>
              <button onClick={resetData} className="bg-gray-100 text-gray-800 px-2 py-1 rounded shadow hover:bg-gray-200">復原</button>
            </div>
          </div>
          <Droppable droppableId="formList" type="form">
            {(provided) => (
              <ul className="space-y-1" {...provided.droppableProps} ref={provided.innerRef}>
                {data.map((entry, idx) => (
                  <Draggable key={idx} draggableId={"form-" + idx} index={idx}>
                    {(provided) => (
                      <li ref={provided.innerRef} {...provided.draggableProps}>
                        <div className="flex items-center">
                          <div {...provided.dragHandleProps} className="cursor-grab px-2 text-gray-400 hover:text-gray-600">︙</div>
                          <button className={`flex-1 text-left px-2 py-1 rounded hover:bg-blue-100 ${selectedIndex === idx ? 'bg-blue-200 font-semibold' : ''}`} onClick={() => setSelectedIndex(idx)}>
                            {entry.title || "(未命名)"}
                          </button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </div>

        <div className="flex-1">
          {selected ? (
            <div className="bg-white shadow-md rounded p-6 space-y-4">
              {Object.entries(selected).map(([key, value]) => {
                if (key === "contacts") return null;
                return (
                  <div key={key} className={key === "lastUpdate" ? "w-1/2" : "w-full"}>
                    <label className="text-sm font-medium block mb-1">{fieldMapping[key] || key}</label>
                    <input
                      type={key === "lastUpdate" ? "date" : "text"}
                      value={value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="block w-full rounded border border-gray-300 p-2 shadow-sm"
                    />
                  </div>
                );
              })}
              <div>
                <label className="text-sm font-medium block mb-2">聯絡人清單</label>
                <div className="flex gap-2 items-center w-1/2">
                  <input className="flex-1 border p-2 rounded" placeholder="姓名" value={selected.contacts[0].name} onChange={(e) => handleContactChange("name", e.target.value)} />
                  <input className="w-24 border p-2 rounded" placeholder="分機" value={selected.contacts[0].extension} onChange={(e) => handleContactChange("extension", e.target.value)} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">請先從左側選擇文件進行編輯。</p>
          )}
        </div>
      </div>
    </DragDropContext>
  );
}

    ReactDOM.createRoot(document.getElementById("root")).render(<App />);