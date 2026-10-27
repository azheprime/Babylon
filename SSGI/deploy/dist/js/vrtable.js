
var dataLoaded = false;
var projectName = "VeRyEngine";

var defaultRow = 100;
var blankRow = 10;  // 内容下方留白
var totalRows = -1;
var configOption = {};
var celldataOption = [];
var tableCreated = false;
var firstUpdate = true;
var insertUpdate = false;
var version="5.0";
var tableName = "";
var tableId = "";
var projectID="";

var canceledSavingProcess = false;

var language = 'zh';

var savedText = '已保存';

const initTableData = () => {


    if (tableCreated && dataLoaded) {
        // console.warn('初始化表格');
        // console.info('celldata', celldataOption);
        // console.info('totalRows', totalRows);


        var currentSheet = luckysheet.getLuckysheetfile()[0];
        // 首先判断是否需要插入新行
        if (totalRows > defaultRow) {
            luckysheet.insertRow(currentSheet.data.length, { number: (totalRows + blankRow - defaultRow) });
            insertUpdate = true;
        }

        if (celldataOption && celldataOption.length > 0) {
            for (var i = 0; i < celldataOption.length; i++) {
                if (celldataOption[i].r > 0) {
                    currentSheet.data[celldataOption[i].r][celldataOption[i].c] = celldataOption[i].v;
                }
            }
        }

        luckysheet.setConfig(configOption);

        luckysheet.exitEditMode();
        luckysheet.setRangeShow("A2:A2");
        luckysheet.scroll({ scrollLeft: 0, scrollTop: 0 });
        luckysheet.refresh({ clearUndo: true });
    }

}

// 加载数据
const loadData = () => {
    // 多语言
    var tableTitle = language !== 'zh' ? 'Table Editor' : '表格编辑器';
    savedText = language !== 'zh' ? 'Saved' : '已保存';
    document.getElementById("savetext").innerHTML = savedText;
    OSS.login(projectID).then(()=>{
        OSS.getJsonAsset(tableId, "table").then(function (response) {
            if (response != "") {
    
                let data = JSON.parse(response);
    
                // 先将json转化为字符串
                let tempData = JSON.stringify(data);
                // 对字符串再进行反转义
                tempData = escape2Html(tempData);
                // 转化为json后，赋值给表格
                data = JSON.parse(tempData);
                dataLoaded = true;
                // console.warn(data);
                if (data.table) {
                    if (data.options) {
                        // console.warn('有格式选项，暂时以options为准');
                        if (data.options.row !== undefined) {
                            totalRows = data.options.row;
                        }
                        if (data.options.celldata !== undefined) {
                            celldataOption = data.options.celldata;
                            var maxRow = 0;
                            for (var i = 1; i < celldataOption.length; i++) {
                                if (celldataOption[i].r > maxRow) {
                                    maxRow = celldataOption[i].r;
                                }
                            }
                            // 因为删除行有问题，暂时自动去除多余行
                            totalRows = maxRow + 1;
                        }
                        if (data.options.config !== undefined) {
                            configOption = data.options.config;
                        }
                    } else {
                        // console.error('没有格式选项，填充table内容');
                        for (var r = 1; r < data.table.length; r++) {
                            for (var c = 0; c < data.table[r].length; c++) {
                                if (data.table[r][c] !== '' && data.table[r][c] !== null) {
                                    celldataOption.push({
                                        r: r, c: c, v: {
                                            ct: { fa: 'General', t: 'g' },
                                            m: data.table[r][c],
                                            v: data.table[r][c],
                                            tb: "2"  // 自动换行
                                        }
                                    });
                                    totalRows = r + 1;
                                }
                            }
                        }
    
                    }
    
                    initTableData();
                }
            }
        }).
        catch(function (error) {
            console.log("表格加载错误: " + error);
        });
        if (tableName) {
            var titleName = decodeURI(tableName);
            document.title = titleName.substring(0, titleName.length - 6) + ' | ' + tableTitle;
        } else {
            document.title = tableTitle;
        }
    })
};

var createWorkbook = () => {
    var frozenBackColor = "#D3D3D3"; // 首行冻结填充颜色
    var frozenFontColor = "#494949"; // 首行冻结字体颜色
    //配置项
    var options = {
        container: 'luckysheet', //luckysheet为容器id
        title: '万维引擎表格', // 设定表格名称
        // lang: 'zh', // 设定表格语言
        lang: language, // 设定表格语言
        showtoolbarConfig: {
            undoRedo: true, //撤销重做，注意撤消重做是两个按钮，由这一个配置决定显示还是隐藏
            paintFormat: true, //格式刷
            currencyFormat: false, //货币格式
            percentageFormat: false, //百分比格式
            numberDecrease: false, // '减少小数位数'
            numberIncrease: false, // '增加小数位数
            moreFormats: false, // '更多格式'
            font: true, // '字体'
            fontSize: true, // '字号大小'
            bold: true, // '粗体 (Ctrl+B)'
            italic: true, // '斜体 (Ctrl+I)'
            strikethrough: false, // '删除线 (Alt+Shift+5)'
            underline: false, // '下划线 (Alt+Shift+6)'
            textColor: true, // '文本颜色'
            fillColor: true, // '单元格颜色'
            border: false, // '边框'
            mergeCell: false, // '合并单元格'
            horizontalAlignMode: true, // '水平对齐方式'
            verticalAlignMode: true, // '垂直对齐方式'
            textWrapMode: false, // '换行方式'
            textRotateMode: false, // '文本旋转方式'
            image: false, // '插入图片'
            link: false, // '插入链接'
            chart: false, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
            postil: false, //'批注'
            pivotTable: false,  //'数据透视表'
            function: false, // '公式'
            frozenMode: false, // '冻结方式'
            sortAndFilter: false, // '排序和筛选'
            conditionalFormat: false, // '条件格式'
			//DO_20221228:表格编辑器,表格自动填充
            //dataVerification: false, // '数据验证'
            splitColumn: false, // '分列'
            screenshot: false, // '截图'
            findAndReplace: true, // '查找替换'
            protection: false, // '工作表保护'
            print: false, // '打印'
        },
        showinfobar: false,
        showsheetbar: false,
        showstatisticBar: false,
        sheetFormulaBar: true,
        showstatisticBarConfig: {
            count: true, // 计数栏
            view: false, // 打印视图
            zoom: true, // 缩放
        },
        userInfo: false,
        cellRightClickConfig: {
            copy: true, // 复制
            copyAs: false, // 复制为
            paste: true, // 粘贴
            insertRow: true, // 插入行
            insertColumn: false, // 插入列
            deleteRow: true, // 删除选中行
            deleteColumn: false, // 删除选中列
            deleteCell: true, // 删除单元格
            hideRow: false, // 隐藏选中行和显示选中行
            hideColumn: false, // 隐藏选中列和显示选中列
            rowHeight: true, // 行高
            columnWidth: true, // 列宽
            clear: true, // 清除内容
            matrix: false, // 矩阵操作选区
            sort: false, // 排序选区
            filter: false, // 筛选选区
            chart: false, // 图表生成
            image: false, // 插入图片
            link: false, // 插入链接
            data: false, // 数据验证
            cellFormat: false // 设置单元格格式
        },
        defaultFontSize: 12,
        data: [
            {
                "name": "表格1", //工作表名称
                "color": "", //工作表颜色
                "index": 0, //工作表索引
                "status": 1, //激活状态
                "order": 0, //工作表的下标
                "hide": 0,//是否隐藏
                "row": defaultRow, //行数
                "column":  9, //列数
                "defaultRowHeight": 23, //自定义行高
                "defaultColWidth": (document.documentElement.clientWidth - 89) / 9, //自定义列宽
                "celldata": [{
                    "r": 0,
                    "c": 0,
                    "v": {
                        ct: { fa: "General", t: "g" },
                        m: language !== 'zh' ? 'Object/Object Template' : "对象/模板对象",
                        v: language !== 'zh' ? 'Object/Object Template' : "对象/模板对象",
                        vt: "0",
                        ht: "0",
                        tb: "2",
                        bl: 1,
                        bg: frozenBackColor,
                        fc: frozenFontColor
                    }
                },
                {
                    "r": 0,
                    "c": 1,
                    "v": {
                        ct: { fa: "General", t: "g" },
                        m: language !== 'zh' ? 'Activation Condition' : "触发激活条件",
                        v: language !== 'zh' ? 'Activation Condition' : "触发激活条件",
                        vt: "0",
                        ht: "0",
                        tb: "2",
                        bl: 1,
                        bg: frozenBackColor,
                        fc: frozenFontColor
                    }
                },
                {
                    "r": 0,
                    "c": 2,
                    "v": {
                        ct: { fa: "General", t: "g" },
                        m: language !== 'zh' ? 'Trigger Name' : "触发名",
                        v: language !== 'zh' ? 'Trigger Name' : "触发名",
                        vt: "0",
                        ht: "0",
                        tb: "2",
                        bl: 1,
                        bg: frozenBackColor,
                        fc: frozenFontColor
                    }
                },
                {
                    "r": 0,
                    "c": 3,
                    "v": {
                        ct: { fa: "General", t: "g" },
                        m: language !== 'zh' ? 'Trigger Parameter' : "触发参数",
                        v: language !== 'zh' ? 'Trigger Parameter' : "触发参数",
                        vt: "0",
                        ht: "0",
                        tb: "2",
                        bl: 1,
                        bg: frozenBackColor,
                        fc: frozenFontColor
                    }
                },
                {
                    "r": 0,
                    "c": 4,
                    "v": {
                        ct: { fa: "General", t: "g" },
                        m: language !== 'zh' ? 'Condition' : "逻辑条件",
                        v: language !== 'zh' ? 'Condition' : "逻辑条件",
                        vt: "0",
                        ht: "0",
                        tb: "2",
                        bl: 1,
                        bg: frozenBackColor,
                        fc: frozenFontColor
                    }
                },
                {
                    "r": 0,
                    "c": 5,
                    "v": {
                        ct: { fa: "General", t: "g" },
                        m: language !== 'zh' ? 'Variable/State Definition' : "变量定义/状态定义和赋值",
                        v: language !== 'zh' ? 'Variable/State Definition' : "变量定义/状态定义和赋值",
                        vt: "0",
                        ht: "0",
                        tb: "2",
                        bl: 1,
                        bg: frozenBackColor,
                        fc: frozenFontColor
                    }
                },
                {
                    "r": 0,
                    "c": 6,
                    "v": {
                        ct: { fa: "General", t: "g" },
                        m: language !== 'zh' ? 'Action Name' : "响应名",
                        v: language !== 'zh' ? 'Action Name' : "响应名",
                        vt: "0",
                        ht: "0",
                        tb: "2",
                        bl: 1,
                        bg: frozenBackColor,
                        fc: frozenFontColor
                    }
                },
                {
                    "r": 0,
                    "c": 7,
                    "v": {
                        ct: { fa: "General", t: "g" },
                        m: language !== 'zh' ? 'Action Parameter/Variable Assignment' : "响应参数/变量赋值",
                        v: language !== 'zh' ? 'Action Parameter/Variable Assignment' : "响应参数/变量赋值",
                        vt: "0",
                        ht: "0",
                        tb: "2",
                        bl: 1,
                        bg: frozenBackColor,
                        fc: frozenFontColor
                    }
                },
                {
                    "r": 0,
                    "c": 8,
                    "v": {
                        ct: { fa: "General", t: "g" },
                        m: language !== 'zh' ? 'Associated State' : "关联状态",
                        v: language !== 'zh' ? 'Associated State' : "关联状态",
                        vt: "0",
                        ht: "0",
                        tb: "2",
                        bl: 1,
                        bg: frozenBackColor,
                        fc: frozenFontColor
                    }
                }], //初始化使用的单元格数据
                config: {
                    "merge": {}, //合并单元格
                    "rowlen": {}, //表格行高
                    // "columnlen": { 0: 357, 1: 276, 2: 306 }, //表格列宽
                    // rowlen: { 3: 100 },
                    "rowhidden": {}, //隐藏行
                    "colhidden": {}, //隐藏列
                    "borderInfo": {}, //边框
                    "authority": {}, //工作表保护

                },
                "scrollLeft": 0, //左右滚动条位置
                "scrollTop": 0, //上下滚动条位置
                "luckysheet_select_save": [], //选中的区域
                "calcChain": [],//公式链
                "isPivotTable": false,//是否数据透视表
                "pivotTable": {},//数据透视表设置
                "filter_select": {},//筛选范围
                "filter": null,//筛选配置
                "luckysheet_alternateformat_save": [], //交替颜色
                "luckysheet_alternateformat_save_modelCustom": [], //自定义交替颜色	
                "luckysheet_conditionformat_save": {},//条件格式
                "frozen": { type: 'row' }, //冻结行列配置
                "chart": [], //图表配置
                "zoomRatio": 1, // 缩放比例
                "image": [], //图片
                "showGridLines": 1, //是否显示网格线
                "dataVerification": {} //数据验证配置
            }
        ],
        hook: {
            cellEditBefore: function (range) {
                if (range && range[0] && range[0].row_focus === 0) {  // 不允许编辑第一排
                    // console.info(range)
                    return false;
                }
                cancelSave();  // 若有保存过程，进行取消
                // console.warn('cellEditBefore');
            },
            cellDragStop: function (cell, postion, sheetFile, ctx, event) {
                // console.info(cell, postion, sheetFile, ctx, event);
            },
            rowTitleCellRenderBefore: function (rowNum, postion, ctx) {
                // console.log(rowNum);
            },
            rowTitleCellRenderAfter: function (rowNum, postion, ctx) {
                // console.log(ctx);
            },
            columnTitleCellRenderBefore: function (columnAbc, postion, ctx) {
                // console.log(columnAbc);
            },
            columnTitleCellRenderAfter: function (columnAbc, postion, ctx) {
                // console.log(postion);
            },
            cellRenderBefore: function (cell, postion, sheetFile, ctx) {
                // console.info("cellRenderBefore", cell, postion, sheetFile, ctx);
            },
            cellRenderAfter: function (cell, postion, sheetFile, ctx) {
                // console.info("cellRenderBefore", cell, postion);
            },
            cellMousedownBefore: function (cell, postion, sheetFile, ctx) {
                if (postion.r === 0) { // 鼠标不允许选中第一排
                    // console.info('cellMousedownBefore', cell, postion, sheetFile, ctx);
                    return false;
                }
                // console.info('cellMousedownBefore', cell, postion, canceledSavingProcess);

                if (canceledSavingProcess) {
                    saveData(true);
                    // console.log('重新保存');
                }
            },
            cellMousedown: function (cell, postion, sheetFile, ctx) {
                // console.log(sheetFile);
            },
            sheetMousemove: function (cell, postion, sheetFile, moveState, ctx) {
                // console.log(cell,postion,sheetFile,moveState,ctx);
            },
            sheetMouseup: function (cell, postion, sheetFile, moveState, ctx) {
                // console.log(cell,postion,sheetFile,moveState,ctx);
            },
            cellAllRenderBefore: function (data, sheetFile, ctx) {
                // console.info(data,sheetFile,ctx)
            },
            updated: function (operate) {
                // console.info('updated', operate);
                if (insertUpdate && operate.type === "addRC") {
                    insertUpdate = false;
                    return;
                }
                if (firstUpdate) {
                    console.log(firstUpdate);
                    firstUpdate = false;
                    return;
                }

                // 自动保存
                // console.info('updated', operate);
                // console.warn(luckysheet.getAllSheets()[0]);

                saveData(true);
            },
            cellUpdateBefore: function (r, c, value, isRefresh) {
                // console.info('cellUpdateBefore', r, c, value, isRefresh)
            },
            cellUpdated: function (r, c, oldValue, newValue, isRefresh) {
                // console.info('cellUpdated', r, c, oldValue, newValue, isRefresh);
            },
            sheetActivate: function (index, isPivotInitial, isNewSheet) {
                // console.info('sheetActivate', index, isPivotInitial, isNewSheet)
            },
            rangeSelect: function (index, sheet) {
                // 首行冻结无法选中处理
                if (sheet && sheet.length > 0 && sheet[0].row && sheet[0].row.length > 0 && sheet[0].row[0] === 0) {
                    // console.info('rangeSelect', index, sheet);
                    var row_right = sheet[0].row[1] > 1 ? sheet[0].row[1] : 1;
                    var col_left = sheet[0].column[0];
                    var col_right = sheet[0].column[1];
                    // console.warn('row_right: ' + row_right);
                    luckysheet.exitEditMode();
                    luckysheet.setluckysheet_select_save([{ row: [1, row_right], column: [col_left, col_right] }]);
                    luckysheet.selectHightlightShow();
                }
                // console.info('rangeSelect', index, sheet);
            },
            commentInsertBefore: function (r, c) {
                // console.info(r, c)
            },
            commentInsertAfter: function (r, c, cell) {
                // console.info(r, c, cell)
            },
            commentDeleteBefore: function (r, c, cell) {
                // console.info(r, c, cell)
            },
            commentDeleteAfter: function (r, c, cell) {
                // console.info(r, c, cell)
            },
            commentUpdateBefore: function (r, c, value) {
                // console.info(r, c, value)
            },
            commentUpdateAfter: function (r, c, oldCell, newCell) {
                // console.info(r, c, oldCell, newCell)
            },
            // cellEditBefore: function (range) {
            //     // console.info(range)
            // },
            workbookCreateAfter: function (json) {
                tableCreated = true;

                initTableData();

                // console.info(json)
                // var origin = luckysheet.getLuckysheetfile()[0].data;

                // var firstRow = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
                // console.error(firstRow);
                // var total = [firstRow];
                // for (var i = 0; i < 50; i++) {
                //     total.push(firstRow);
                // }
                // console.error(total);
                // luckysheet.getAllSheets()[0].data = total;
                // console.warn(origin);


                // origin[2][1] = "sdgfhdh";
                // origin[3][1] = {
                //     ct: { fa: "General", t: "g" },
                //     m: "关联状态",
                //     v: "关联状态",
                //     vt: "0",
                //     ht: "0",
                //     bl: 1,
                //     bg: "#fce5cd"
                // };
                // luckysheet.insertRow(origin.length, { number: 100 });

                // origin = luckysheet.getLuckysheetfile()[0].data;
                // origin[153][1] = {
                //     ct: { fa: "General", t: "g" },
                //     m: "关联状态",
                //     v: "关联状态",
                //     vt: "0",
                //     ht: "0",
                //     bl: 1,
                //     bg: "#fce5cd"
                // };
                // luckysheet.getLuckysheetfile()[0].data[153][1] = "sdgfhdh";

                // luckysheet.exitEditMode();
                // luckysheet.setRangeShow("A2:A2");
                // luckysheet.scroll({ scrollLeft: 0, scrollTop: 0 });
                // luckysheet.refresh();

            },
            rangePasteBefore: function (range, data) {
                // console.info('rangePasteBefore',range,data)
                // return false; //Can intercept paste
            },
        }
    }
    if(version>"5.0"){
        options.data[0].column=8;
        options.data[0].defaultColWidth=(document.documentElement.clientWidth - 89) / 8;
        options.data[0].celldata.splice(0,1);
        for(let tmp of options.data[0].celldata){
            tmp.c--;
        }
    }
    luckysheet.create(options);

    // console.warn("A");
    // console.error(luckysheet);
    // luckysheet.setCellValue(0, 2, '触发名');
    // luckysheet.changLang('zh'); // 多语言，切换语言
}

var saveFlag;
// 保存数据，延迟1.5秒
const saveData = (tag, time = 1500) => {
    if (saveFlag) {
        clearTimeout(saveFlag);
    }
    saveFlag = setTimeout(saveImmediate, time, tag);
    canceledSavingProcess = false;
};


const cancelSave = () => {
    if (saveFlag) {
        clearTimeout(saveFlag);
        canceledSavingProcess = true;
    }
}


const saveImmediate = (tag) => {
    document.getElementById("savetext").innerHTML = "保存中";
    document.getElementById("saveloading").style.display = "block";
    // console.warn('自动保存');
    var uploadValue = getSheetData();
    var path = window.location.href;
    var paramsArray = path.split("?")[1].split("&");
    var tableName = "";
    var tableId = "";
    var projectID="";
    for (var i = 0; i < paramsArray.length; i++) {
        var arrayData = paramsArray[i].split("=");
        if (arrayData[0] === "name")
            tableName = arrayData[1];
        else if (arrayData[0] === "id")
            tableId = arrayData[1];
        else if(arrayData[0]=='projectId'){
            projectID=arrayData[1];
        }
    }    // console.log("pro"+projectID);
    OSS.uploadJsonAsset(uploadValue, tableId, ".table", tag).then(function (response) {
        if (response) {
            document.getElementById("savetext").innerHTML = savedText;
            document.getElementById("saveloading").style.display = "none";
            console.log("已上传");
            saveFlag = null;
        }
    }).
        catch(function (error) {
            document.getElementById("savetext").innerHTML = savedText;
            document.getElementById("saveloading")
            saveFlag = null;
        });
};


const getSheetData = () => {
    luckysheet.exitEditMode();
    var celldata = luckysheet.getAllSheets()[0].celldata;
    var sheetJson = {};
    sheetJson.table = [];
    sheetJson.options = {};
    sheetJson.options.row = luckysheet.getAllSheets()[0].data.length;
    sheetJson.options.config = luckysheet.getAllSheets()[0].config;
    sheetJson.options.celldata = [];
    for (var i = 0; i < sheetJson.options.row; i++) {
        sheetJson.table.push(["", "", "", "", "", "", "", "", ""]);
    }
    if (celldata && celldata.length > 0) {
        for (var i = 0; i < celldata.length; i++) {
            if (celldata[i].c < 9 && ((celldata[i].v.v !== null && celldata[i].v.v !== undefined) || (celldata[i].v.bg !== undefined && celldata[i].v.bg !== null))) {
                sheetJson.options.celldata.push(celldata[i]);
                if (celldata[i].v.v !== null) {
                    sheetJson.table[celldata[i].r][celldata[i].c] = celldata[i].v.v;
                }
            } else if ((celldata[i].v.ct !== undefined && celldata[i].v.ct.t !== undefined && celldata[i].v.ct.t === "inlineStr")) {  // 含有回车的单元格
                sheetJson.options.celldata.push(celldata[i]);
                if (celldata[i].v.ct.s !== null && celldata[i].v.ct.s !== undefined && celldata[i].v.ct.s.length > 0 && celldata[i].v.ct.s[0].v !== undefined && celldata[i].v.ct.s[0].v !== null) {
                    sheetJson.table[celldata[i].r][celldata[i].c] = celldata[i].v.ct.s[0].v;
                }
            }
        }
    }
    // console.warn(sheetJson);
    let sheetString = JSON.stringify(sheetJson);
    sheetString = html2Escape(sheetString);
    return sheetString;
}

//防止表格还在加载阶段就按了ctrl+s
setTimeout(() => {
    document.addEventListener("keydown", function (event) {
        if (event.ctrlKey && (event.key === "s" || event.key === "S")) {
            event.preventDefault();
            saveData(true, 100);
            // console.log('你按下了CTRL+S');
        }
    });
}, 6000);

// 初始化
(function () {
    // 获取表格数据F
    let path = window.location.href;
    let paramsArray = path.split("?")[1].split("&");
    for (var i = 0; i < paramsArray.length; i++) {
        var arrayData = paramsArray[i].split("=");
        if (arrayData[0] === "name")
            tableName = arrayData[1];
        else if (arrayData[0] === "id")
            tableId = arrayData[1];
        else if (arrayData[0] === "language") // 多语言
            language = arrayData[1];
        else if(arrayData[0]=='projectId'){
            projectID=arrayData[1];
        }else if(arrayData[0]=="version"){
            version=arrayData[1]
        }
    }
    let script=document.createElement("script");
    script.src="verycompiler_"+version+".js";
    document.head.append(script);
    script.onload=()=>{
        script=document.createElement("script");
        script.src="lucky/luckysheet_"+version+".js";
        document.head.append(script);
        script.onload=()=>{
            loadData();
            createWorkbook();
        }
    }
})();


//HTML标签转义（< -> &lt;）
function html2Escape(sHtml) {
    var temp = document.createElement("div");
    temp.textContent != null
        ? (temp.textContent = sHtml)
        : (temp.innerText = sHtml);
    var output = temp.innerHTML;
    temp = null;
    return output;
}

//HTML标签反转义（&lt; -> <）
function escape2Html(str) {
    var temp = document.createElement("div");
    temp.innerHTML = str;
    var output = temp.innerText || temp.textContent;
    temp = null;
    return output;
}

// 去除\n \r \b \t
function replaceSpecial(str) {
    str = str.replace('\\n', '');
    str = str.replace('\\r', '');
    str = str.replace('\\t', '');
    str = str.replace('\\b', '');
    return str;
}
