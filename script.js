const API_KEY = 'bbc929767d832538312a6094218572ed';
const chartElement = document.getElementById('chart');
const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const resultElement = document.getElementById('result');
const nextDayPriceElement = document.getElementById('nextDayPrice');
const currentStreakElement = document.getElementById('currentStreak');
const highestStreakElement = document.getElementById('highestStreak');
const winLossRatioElement = document.getElementById('winLossRatio');

let chart;
let allData;
let data;
let lastClose;
let currentStreak = 0;
let highestStreak = 0;
let wins = 0;
let losses = 0;

async function fetchSPYData() {
    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=SPY&outputsize=full&apikey=${API_KEY}`);
    const json = await response.json();
    const timeSeries = json['Time Series (Daily)'];
    allData = Object.keys(timeSeries).reverse().map(date => ({
        date: date,
        close: parseFloat(timeSeries[date]['4. close'])
    }));
}

function selectData() {
    const randomIndex = Math.floor(Math.random() * (allData.length - 31));
    data = allData.slice(randomIndex, randomIndex + 30);
    lastClose = allData[randomIndex + 30].close;

}

// Rest of the script.js file remains unchanged





function createChart() {
    const ctx = chartElement.getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(point => point.date),
            datasets: [
                {
                    label: '',
                    data: data.map(point => point.close),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1,
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false
                },
            },
            scales: {
                x: { display: true, title: { display: true, text: 'Date' } },
                y: { display: true, title: { display: true, text: 'Price' } }
            }
        }
    });
}


function updateChart() {
    chart.data.labels = data.map(point => point.date);
    chart.data.datasets[0].data = data.map(point => point.close);
    chart.update();
}

async function initialize() {
    if (!allData) {
        await fetchSPYData();
    }
    selectData();
    if (!chart) {
        createChart();
    } else {
        updateChart();
    }
}


function updateStats(isCorrect) {
    if (isCorrect) {
        currentStreak++;
        wins++;
        document.body.style.background = "#32f02b";
    } else {
        currentStreak = 0;
        losses++;
        document.body.style.background = "#f02b2b";
    }

    if (currentStreak > highestStreak) {
        highestStreak = currentStreak;
    }

    const winLossRatio = wins / (wins + losses);

    currentStreakElement.textContent = currentStreak;
    highestStreakElement.textContent = highestStreak;
    winLossRatioElement.textContent = winLossRatio.toFixed(2);
}

function showResult(prediction) {
    const isUp = lastClose > data[data.length - 1].close;
    const isCorrect = (isUp && prediction === 'up') || (!isUp && prediction === 'down');
    resultElement.textContent = `The price went ${isUp ? 'up' : 'down'}. Your prediction was ${isCorrect ? 'correct' : 'incorrect'}.`;

    updateStats(isCorrect);

    setTimeout(() => {
        resultElement.textContent = '';
        initialize();
    }, 2000);
}

upButton.addEventListener('click', () => showResult('up'));
downButton.addEventListener('click', () => showResult('down'));

initialize();

