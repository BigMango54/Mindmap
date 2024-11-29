// 字體列表
export const fontFamilyList = [
  {
    name: '宋體',
    value: '宋體, SimSun, Songti SC'
  },
  {
    name: '微軟雅黑',
    value: '微軟雅黑, Microsoft YaHei'
  },
  {
    name: '楷體',
    value: '楷體, 楷體_GB2312, SimKai, STKaiti'
  },
  {
    name: '黑體',
    value: '黑體, SimHei, Heiti SC'
  },
  {
    name: '隸書',
    value: '隸書, SimLi'
  },
  {
    name: 'Andale Mono',
    value: 'andale mono'
  },
  {
    name: 'Arial',
    value: 'arial, helvetica, sans-serif'
  },
  {
    name: 'arialBlack',
    value: 'arial black, avant garde'
  },
  {
    name: 'Comic Sans Ms',
    value: 'comic sans ms'
  },
  {
    name: 'Impact',
    value: 'impact, chicago'
  },
  {
    name: 'Times New Roman',
    value: 'times new roman'
  },
  {
    name: 'Sans-Serif',
    value: 'sans-serif'
  },
  {
    name: 'serif',
    value: 'serif'
  }
]

// 字號
export const fontSizeList = [10, 12, 16, 18, 24, 32, 48]

// 行高
export const lineHeightList = [1, 1.5, 2, 2.5, 3]

// 顏色
export const colorList = [
  '#4D4D4D',
  '#999999',
  '#FFFFFF',
  '#F44E3B',
  '#FE9200',
  '#FCDC00',
  '#DBDF00',
  '#A4DD00',
  '#68CCCA',
  '#73D8FF',
  '#AEA1FF',
  '#FDA1FF',
  '#333333',
  '#808080',
  '#cccccc',
  '#D33115',
  '#E27300',
  '#FCC400',
  '#B0BC00',
  '#68BC00',
  '#16A5A5',
  '#009CE0',
  '#7B64FF',
  '#FA28FF',
  '#000000',
  '#666666',
  '#B3B3B3',
  '#9F0500',
  '#C45100',
  '#FB9E00',
  '#808900',
  '#194D33',
  '#0C797D',
  '#0062B1',
  '#653294',
  '#AB149E',
  'transparent'
]

// 邊框寬度
export const borderWidthList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// 邊框樣式
export const borderDasharrayList = [
  {
    name: '實線',
    value: 'none'
  },
  {
    name: '虛線1',
    value: '5,5'
  },
  {
    name: '虛線2',
    value: '10,10'
  },
  {
    name: '虛線3',
    value: '20,10,5,5,5,10'
  },
  {
    name: '虛線4',
    value: '5, 5, 1, 5'
  },
  {
    name: '虛線5',
    value: '15, 10, 5, 10, 15'
  },
  {
    name: '虛線6',
    value: '1, 5'
  }
]

// 圓角
export const borderRadiusList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// 線寬
export const lineWidthList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export const lineStyleMap = {
  straight: `<svg width="60" height="26"><path d="M18,14L30,14L30,5L42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14L30,23L42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>`,
  curve: `<svg width="60" height="26"><path d="M18,14L30,14A12,-9 0 0 1 42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14A12,9 0 0 0 42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>`,
  direct: `<svg width="60" height="26"><path d="M18,14L30,14L42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14L42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>`
}

// 連線風格
export const lineStyleList = [
  {
    name: '直線',
    value: 'straight'
  },
  {
    name: '曲線',
    value: 'curve'
  },
  {
    name: '直連',
    value: 'direct'
  }
]

// 曲線風格中，根節點樣式是否和其他節點保持一致
export const rootLineKeepSameInCurveList = [
  {
    name: '括號',
    value: false
  },
  {
    name: '大括號',
    value: true
  }
]

// 圖片重複方式
export const backgroundRepeatList = [
  {
    name: '不重複',
    value: 'no-repeat'
  },
  {
    name: '重複',
    value: 'repeat'
  },
  {
    name: '水平方向重複',
    value: 'repeat-x'
  },
  {
    name: '垂直方向重複',
    value: 'repeat-y'
  }
]

// 背景圖片定位
export const backgroundPositionList = [
  {
    name: '默認',
    value: '0% 0%'
  },
  {
    name: '左上',
    value: 'left top'
  },
  {
    name: '左中',
    value: 'left center'
  },
  {
    name: '左下',
    value: 'left bottom'
  },
  {
    name: '右上',
    value: 'right top'
  },
  {
    name: '右中',
    value: 'right center'
  },
  {
    name: '右下',
    value: 'right bottom'
  },
  {
    name: '中上',
    value: 'center top'
  },
  {
    name: '居中',
    value: 'center center'
  },
  {
    name: '中下',
    value: 'center bottom'
  }
]

// 背景圖片大小
export const backgroundSizeList = [
  {
    name: '自動',
    value: 'auto'
  },
  {
    name: '覆蓋',
    value: 'cover'
  },
  {
    name: '保持',
    value: 'contain'
  }
]

// 數據存儲
export const store = {
  sidebarZIndex: 1 //側邊欄zIndex
}

// 快捷鍵列表
export const shortcutKeyList = [
  {
    type: '節點操作',
    list: [
      {
        icon: 'icontianjiazijiedian',
        name: '插入下級節點',
        value: 'Tab'
      },
      {
        icon: 'iconjiedian',
        name: '插入同級節點',
        value: 'Enter'
      },
      {
        icon: 'icondodeparent',
        name: '插入父節點',
        value: 'Shift + Tab'
      },
      {
        icon: 'iconshangyi',
        name: '上移節點',
        value: 'Ctrl + ↑'
      },
      {
        icon: 'iconxiayi',
        name: '下移節點',
        value: 'Ctrl + ↓'
      },
      {
        icon: 'icongaikuozonglan',
        name: '插入概要',
        value: 'Ctrl + G'
      },
      {
        icon: 'iconzhankai',
        name: '展開/收起節點',
        value: '/'
      },
      {
        icon: 'iconshanchu',
        name: '刪除節點',
        value: 'Delete | Backspace'
      },
      {
        icon: 'iconshanchu',
        name: '僅刪除目前節點',
        value: 'Shift + Backspace'
      },
      {
        icon: 'iconfuzhi',
        name: '複製節點',
        value: 'Ctrl + C'
      },
      {
        icon: 'iconjianqie',
        name: '剪下節點',
        value: 'Ctrl + X'
      },
      {
        icon: 'iconniantie',
        name: '貼上節點',
        value: 'Ctrl + V'
      },
      {
        icon: 'iconbianji',
        name: '編輯節點',
        value: 'F2'
      },
      {
        icon: 'iconhuanhang',
        name: '文本換行',
        value: 'Shift + Enter'
      },
      {
        icon: 'iconhoutui-shi',
        name: '上一步',
        value: 'Ctrl + Z'
      },
      {
        icon: 'iconqianjin1',
        name: '下一步',
        value: 'Ctrl + Y'
      },
      {
        icon: 'iconquanxuan',
        name: '全選',
        value: 'Ctrl + A'
      },
      {
        icon: 'iconquanxuan',
        name: '多選',
        value: '右鍵 / Ctrl + 左鍵'
      },
      {
        icon: 'iconzhengli',
        name: '一鍵整理版面',
        value: 'Ctrl + L'
      },
      {
        icon: 'iconsousuo',
        name: '搜尋和替換',
        value: 'Ctrl + F'
      }
    ]
  },
  {
    type: '畫布操作',
    list: [
      {
        icon: 'iconfangda',
        name: '放大',
        value: 'Ctrl + +'
      },
      {
        icon: 'iconsuoxiao',
        name: '縮小',
        value: 'Ctrl + -'
      },
      {
        icon: 'iconfangda',
        name: '放大/縮小',
        value: 'Ctrl + 鼠標滾動'
      },
      {
        icon: 'icondingwei',
        name: '回到根節點',
        value: 'Ctrl + Enter'
      },
      {
        icon: 'iconquanping1',
        name: '調整畫布',
        value: 'Ctrl + i'
      }
    ]
  }
]

export const shapeListMap = {
  rectangle: 'M 4 12 L 4 3 L 56 3 L 56 21 L 4 21 L 4 12 Z',
  diamond: 'M 4 12 L 30 3 L 56 12 L 30 21 L 4 12 Z',
  parallelogram: 'M 10 3 L 56 3 L 50 21 L 4 21 L 10 3 Z',
  roundedRectangle: 'M 13 3 L 47 3 A 9 9 0, 0 1 47 21 L 13 21 A 9 9 0, 0 1 13 3 Z',
  octagonalRectangle: 'M 4 12 L 4 9 L 10 3 L 50 3 L 56 9 L 56 15 L 50 21 L 10 21 L 4 15 L 4 12 Z',
  outerTriangularRectangle: 'M 4 12 L 10 3 L 50 3 L 56 12 L 50 21 L 10 21 L 4 12 Z',
  innerTriangularRectangle: 'M 10 12 L 4 3 L 56 3 L 50 12 L 56 21 L 4 21 L 10 12 Z',
  ellipse: 'M 4 12 A 26 9 0, 1, 0 30 3 A 26 9 0, 0, 0 4 12 Z',
  circle: 'M 21 12 A 9 9 0, 1, 0 30 3 A 9 9 0, 0, 0 21 12 Z'
}

// 形狀列表
export const shapeList = [
  {
    name: '矩形',
    value: 'rectangle'
  },
  {
    name: '菱形',
    value: 'diamond'
  },
  {
    name: '平行四邊形',
    value: 'parallelogram'
  },
  {
    name: '圓角矩形',
    value: 'roundedRectangle'
  },
  {
    name: '八角矩形',
    value: 'octagonalRectangle'
  },
  {
    name: '外三角矩形',
    value: 'outerTriangularRectangle'
  },
  {
    name: '內三角矩形',
    value: 'innerTriangularRectangle'
  },
  {
    name: '橢圓',
    value: 'ellipse'
  },
  {
    name: '圓',
    value: 'circle'
  }
]

// 多語言列表
export const langList = [
  {
    value: 'zh',
    name: '繁體中文'
  },
  {
    value: 'en',
    name: 'English'
  }
]

// 側邊欄列表
export const sidebarTriggerList = [
  {
    name: '節點樣式',
    value: 'nodeStyle',
    icon: 'iconzhuti'
  },
  {
    name: '基礎樣式',
    value: 'baseStyle',
    icon: 'iconyangshi'
  },
  {
    name: '主題',
    value: 'theme',
    icon: 'iconjingzi'
  },
  {
    name: '結構',
    value: 'structure',
    icon: 'iconjiegou'
  },
  {
    name: '大綱',
    value: 'outline',
    icon: 'iconfuhao-dagangshu'
  },
  {
    name: '快捷鍵',
    value: 'shortcutKey',
    icon: 'iconjianpan'
  }
]

// 下載類型列表
export const downTypeList = [
  {
    name: '專有檔案格式',
    type: 'smm',
    icon: 'iconwenjian',
    desc: '心智圖匯入適用'
  },
  {
    name: 'JSON',
    type: 'json',
    icon: 'iconjson',
    desc: '心智圖匯入適用'
  },
  {
    name: '圖片',
    type: 'png',
    icon: 'iconPNG',
    desc: '便於檢視、分享'
  },
  {
    name: 'SVG',
    type: 'svg',
    icon: 'iconSVG',
    desc: '可縮放圖形'
  },
  {
    name: 'PDF',
    type: 'pdf',
    icon: 'iconpdf',
    desc: '適合列印'
  },
  {
    name: 'Markdown',
    type: 'md',
    icon: 'iconmarkdown',
    desc: '便於其他軟體開啟'
  },
  {
    name: 'XMind',
    type: 'xmind',
    icon: 'iconxmind',
    desc: 'XMind格式'
  }
]