const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// 模擬資料庫
let codes = []; // {code: '1234', used: false}
let draws = []; // {code: '1234', prize: 'A', timestamp: Date}
let totalDraws = 60;

// 獎項初始池 (總數依比例)
let prizePool = {
  A: Math.round(0.03 * totalDraws), // 3%
  B: Math.round(0.20 * totalDraws), // 20%
  C: Math.round(0.35 * totalDraws), // 35%
  D: Math.round(0.42 * totalDraws)  // 42%
};

// 生成4位隨機碼
function generateCode() {
  let code = '';
  for(let i=0;i<4;i++){
    code += Math.floor(Math.random()*10);
  }
  codes.push({code, used:false});
  return code;
}

// API: 生成驗證碼
app.get('/generate-code', (req,res)=>{
  const code = generateCode();
  res.json({code});
});

// API: 驗證驗證碼
app.post('/check-code', (req,res)=>{
  const { code } = req.body;
  const valid = codes.find(c => c.code === code && !c.used);
  if(valid){
    valid.used = true;
    res.json({success:true});
  } else {
    res.json({success:false, message:'驗證碼無效或已使用'});
  }
});

// API: 抽獎
app.post('/draw', (req,res)=>{
  const { code } = req.body;

  // 超過總抽獎次數
  const drawnTotal = draws.length;
  if(drawnTotal >= totalDraws) return res.json({success:false, message:'抽獎已滿60次'});

  // 製作剩餘獎項池
  const pool = [];
  for(let key in prizePool){
    for(let i=0;i<prizePool[key];i++){
      pool.push(key);
    }
  }

  // 隨機抽
  const randomIndex = Math.floor(Math.random()*pool.length);
  const prize = pool.splice(randomIndex,1)[0];
  prizePool[prize]--; // 減少剩餘
  draws.push({code, prize, timestamp:new Date()});

  res.json({success:true, prize});
});

// API: 查詢剩餘抽數
app.get('/status', (req,res)=>{
  const drawn = draws.length;
  const remaining = totalDraws - drawn;
  res.json({drawn, remaining});
});

// API: 後台查詢抽獎紀錄
app.get('/admin/draws', (req,res)=>{
  res.json(draws);
});

app.listen(3000, ()=>console.log('Server running on port 3000'));
