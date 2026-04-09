let isLogin = true;
let currentUser = null;

let studentMode = false;
let pocketMoney = 0;
let remainingPocket = 0;
let paymentType = "";
let eventMode = false;

let points = 0;
let streak = 0;
let lastSpendDate = null;
let noSpendChallenge = false;

let selectedCategory = null;
let monthlyBudget = 0;
let expenses = [];
let chart;
let lastMessage = "";

// 🌙 DARK MODE
function toggleDark() {
  document.body.classList.toggle("dark");
}

// AUTH
function toggleAuth(){
  isLogin = !isLogin;
  authTitle.innerText = isLogin ? "Login" : "Signup";
}

function handleAuth(){
  let u = username.value;
  let p = password.value;

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if(isLogin){
    if(!users[u] || users[u]!=p) return alert("Wrong");
    currentUser = u;
  }else{
    users[u]=p;
    localStorage.setItem("users",JSON.stringify(users));
    alert("Signup done");
    return;
  }

  userName.innerText=u;
  authPage.style.display="none";
  appPage.style.display="block";
}

// FORGOT
function showForgot(){
  authPage.style.display="none";
  forgotPage.style.display="block";
}

function back(){
  forgotPage.style.display="none";
  authPage.style.display="block";
}

function resetPassword(){
  let users = JSON.parse(localStorage.getItem("users")) || {};
  users[fUser.value]=fPass.value;
  localStorage.setItem("users",JSON.stringify(users));
  alert("Updated");
  back();
}

// LOGOUT
function logout(){
  location.reload();
}

// BUDGET
function setBudget(){
  monthlyBudget = Number(budgetInput.value);
  budget.innerText=monthlyBudget;
}


// 🎓 STUDENT MODE
function toggleStudentMode(){
  studentMode = !studentMode;
  studentModeStatus.innerText = studentMode ? "Mode: Hostel Student" : "Mode: Normal";
}

// 💸 POCKET MONEY
function setPocketMoney(){
  pocketMoney = Number(pocketMoneyInput.value);
  remainingPocket = pocketMoney;
  document.getElementById("remainingPocket").innerText = remainingPocket;
}

// 📲 PAYMENT MODE
function setPayment(type){
  paymentType = type;
  paymentMode.innerText = type;
}

// 🎉 EVENT MODE
function toggleEvent(){
  eventMode = !eventMode;
  eventStatus.innerText = eventMode ? "Event Mode: ON 🎉" : "Event Mode: OFF";
}

// CATEGORY
function selectCategory(c){
  selectedCategory=c;
  selectedCat.innerText=c;
}

// ADD EXPENSE
function addExpense(){

  let amount = Number(document.getElementById("amount").value);

  if(!amount) return alert("Enter amount");
  if(!selectedCategory) return alert("Select category");
  if(!monthlyBudget) return alert("Set budget");

 expenses.push({
  amount: amount,
  category: selectedCategory,
  fullDate: new Date().toISOString(),
  hour: new Date().getHours(),
  payment: paymentType
});

expenses.push({
  amount: amount,
  category: selectedCategory,
  fullDate: new Date().toISOString(),
  hour: new Date().getHours(),
  payment: paymentType
});


// 🎮 GAME LOGIC
addPoints(amount);
updateStreak();

// 🚫 CHALLENGE FAIL
if(noSpendChallenge){
  alert("❌ No-Spend Challenge broken!");
  noSpendChallenge = false;
  challengeStatus.innerText = "Challenge: OFF";
}

  updateSummary();
  updateAI();
  updateChart();
  updateInsights();
  updateDashboard();
  updateMood();
}

// SUMMARY
function updateSummary(){

  let today = new Date();

  let todaySpendVal = 0;
  let weekSpendVal = 0;
  let monthSpendVal = 0;

  let oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  expenses.forEach(e=>{
    let d = new Date(e.fullDate);

    if(d.toDateString() === today.toDateString()){
      todaySpendVal += e.amount;
    }

    if(d >= oneWeekAgo){
      weekSpendVal += e.amount;
    }

    if(d.getMonth() === today.getMonth()){
      monthSpendVal += e.amount;
    }
  });

  todaySpend.innerText = todaySpendVal;
  weekSpend.innerText = weekSpendVal;
  monthSpend.innerText = monthSpendVal;
}

// AI
function updateAI() {

  if (expenses.length === 0) return;

  let msg = "";

  let total = expenses.reduce((sum, e) => sum + e.amount, 0);
  let avg = total / new Date().getDate();
  let dailyLimit = monthlyBudget / 30;

  msg += "Hey... I’ve been observing your behavior.\n\n";

  if (avg > dailyLimit) {
    msg += "You're slightly overspending.\n\n";
  } else {
    msg += "You're managing well.\n\n";
  }

  let categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.amount;
  });

  let highest = Object.keys(categoryTotals).reduce((a, b) =>
    categoryTotals[a] > categoryTotals[b] ? a : b
  );

  msg += `Most money is going into "${highest}".\n\n`;

  let lateNight = expenses.filter(e => e.hour >= 22 || e.hour <= 6);

  if (lateNight.length > 0) {
    msg += "You spend more at night — possible stress.\n\n";
  }

  let last = expenses[expenses.length - 1];
  if (last.amount > monthlyBudget * 0.2) {
    msg += "That last expense looks impulsive.\n\n";
  }

  msg += "Keep improving 💙";

  typeEffect(msg);
  speak(msg);

  
// 🇮🇳 PAYMENT ANALYSIS
let upiCount = expenses.filter(e => e.payment === "UPI").length;

if (upiCount > expenses.length * 0.5) {
  msg += "\nI see you're using UPI frequently.\n";
  msg += "Digital spending can feel less real — be mindful.\n";
}

// 🎓 STUDENT MODE ADVICE
if(studentMode){
  msg += "\nAs a student, try to prioritize essential expenses like food and study needs.\n";
}

// 💸 POCKET MONEY WARNING
if(remainingPocket < pocketMoney * 0.2){
  msg += "\nYou're running low on pocket money. Try to control spending.\n";
}


if(points > 50){
  msg += "\n🔥 Amazing! You're building great saving habits.";
}

if(streak > 3){
  msg += "\n💪 You're on a saving streak — keep it going!";
}
}

// TEXT
function typeEffect(text){
  document.getElementById("suggestion").innerText = text;
}

// VOICE
function speak(text) {

  let clean = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,'');

  let sentences = clean.split(". ");

  speechSynthesis.cancel();

  let i = 0;

  function speakNext() {
    if (i >= sentences.length) return;

    let speech = new SpeechSynthesisUtterance(sentences[i]);

    speech.rate = 0.85;
    speech.pitch = 1.1;

    speech.onend = () => {
      i++;
      setTimeout(speakNext, 400);
    };

    speechSynthesis.speak(speech);
  }

  speakNext();
}

// CHART
function updateChart(){

  let canvas = document.getElementById("myChart");
  if (!canvas) return;

  let ctx = canvas.getContext("2d");

  let data = {};

  expenses.forEach(e=>{
    data[e.category] = (data[e.category] || 0) + e.amount;
  });

  if(chart) chart.destroy();

  chart = new Chart(ctx,{
    type:"pie",
    data:{
      labels:Object.keys(data),
      datasets:[{
        data:Object.values(data),
        backgroundColor:[
          "#ff7eb3","#ff758c","#667eea","#764ba2","#00c6ff","#0072ff"
        ]
      }]
    }
  });
}

function updateInsights(){

  if(expenses.length === 0) return;

  let total = expenses.reduce((sum, e) => sum + e.amount, 0);

  let today = new Date();
  let daysPassed = today.getDate();
  let avg = total / daysPassed;

  let prediction = Math.round(avg * 30);

  // 📊 CATEGORY ANALYSIS
  let categoryTotals = {};

  expenses.forEach(e=>{
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.amount;
  });

  let top = Object.keys(categoryTotals).reduce((a,b)=>
    categoryTotals[a] > categoryTotals[b] ? a : b
  );

  document.getElementById("topCategory").innerText = top;
  document.getElementById("prediction").innerText = prediction;

  // ⚠️ RISK ALERT
  let remaining = monthlyBudget - total;

  let daysLeft = Math.floor(remaining / avg);

  let alertMsg = "You're safe 👍";

  if(prediction > monthlyBudget){
    alertMsg = "⚠️ You may exceed your budget!";
  }

  if(daysLeft <= 5){
    alertMsg = `⚠️ You may run out of money in ${daysLeft} days`;
  }

  document.getElementById("riskAlert").innerText = alertMsg;
}


function updateDashboard(){

  if(expenses.length === 0) return;

  let total = expenses.reduce((sum,e)=>sum+e.amount,0);
  let avg = total / new Date().getDate();
  let dailyLimit = monthlyBudget / 30;

  // 💯 HEALTH SCORE
  let score = 100;

  if(avg > dailyLimit) score -= 30;
  if(total > monthlyBudget) score -= 30;

  let lateNight = expenses.filter(e=>e.hour>=22 || e.hour<=6);
  if(lateNight.length > 0) score -= 10;

  let impulsive = expenses.filter(e=>e.amount > monthlyBudget * 0.2);
  if(impulsive.length > 0) score -= 20;

  if(score < 0) score = 0;

  document.getElementById("healthScore").innerText = score;

  // 📈 TREND DETECTION
  let lastTwo = expenses.slice(-2);

  let trendText = "Stable";

  if(lastTwo.length === 2){
    if(lastTwo[1].amount > lastTwo[0].amount){
      trendText = "Increasing 📈";
    } else if(lastTwo[1].amount < lastTwo[0].amount){
      trendText = "Decreasing 📉";
    }
  }

  document.getElementById("trend").innerText = trendText;

  // 📊 TREND CHART (LAST 7 DAYS)
  let dailyData = {};

  expenses.forEach(e=>{
    let d = new Date(e.fullDate).getDate();
    dailyData[d] = (dailyData[d] || 0) + e.amount;
  });

  let labels = Object.keys(dailyData);
  let values = Object.values(dailyData);

  let ctx = document.getElementById("trendChart");

  if(window.trendChartInstance) window.trendChartInstance.destroy();

  window.trendChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Daily Spending",
        data: values,
        fill: true,
        tension: 0.4
      }]
    }
  });
}

// 🧠 MOOD (FIXED POSITION)
function updateMood() {

  let mood = "🤔 Analyzing...";
  let reason = "Add some expenses to analyze.";

  if (expenses.length > 0) {

    let total = expenses.reduce((sum, e) => sum + e.amount, 0);
    let avg = total / new Date().getDate();

    let safeBudget = monthlyBudget > 0 ? monthlyBudget : 10000;
    let dailyLimit = safeBudget / 30;

    let lateNight = expenses.filter(e => e.hour >= 22 || e.hour <= 6);
    let impulsive = expenses.filter(e => e.amount > safeBudget * 0.2);

    if (impulsive.length >= 1) {
      mood = "😵 Impulsive";
      reason = "You made high-value expenses recently.";
    }
    else if (lateNight.length >= 1) {
      mood = "😟 Stressed";
      reason = "Late-night spending detected.";
    }
    else if (avg <= dailyLimit) {
      mood = "😄 Stable";
      reason = "You're managing well.";
    }
    else {
      mood = "⚠ Overspending";
      reason = "You're spending more than expected.";
    }
  }

  document.getElementById("moodStatus").innerText =
    mood + "\n" + reason;
}

// LOAD
window.onload = function () {
  updateMood();
};


// 🚫 START CHALLENGE
function startNoSpend(){
  noSpendChallenge = true;
  challengeStatus.innerText = "Challenge: ACTIVE 🚫";
}

// 🔥 UPDATE STREAK
function updateStreak(){

  let today = new Date().toDateString();

  if(lastSpendDate !== today){
    streak++;
    lastSpendDate = today;
  }

  document.getElementById("streak").innerText = streak;
}

// ⭐ ADD POINTS
function addPoints(amount){

  // Reward saving behavior
  if(amount < monthlyBudget / 30){
    points += 10;
  } else {
    points -= 5;
  }

  // Bonus for challenge
  if(noSpendChallenge){
    points += 20;
  }

  document.getElementById("points").innerText = points;
}