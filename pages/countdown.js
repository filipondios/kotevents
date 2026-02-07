function updateCountdown() {    
    // Find next 00:00 GMT
    const now = new Date();
    let nextEvent = new Date(now);
    nextEvent.setUTCHours(0, 0, 0, 0);
    
    if (now >= nextEvent) {
        nextEvent.setUTCDate(nextEvent.getUTCDate() + 1);
    }
    
    // Calculate next event start (every 3 days starting from 2024-01-01)
    const BASE_DATE = new Date(Date.UTC(2024, 0, 1, 0, 0, 0, 0));
    const MS_PER_EVENT = 3 * 24 * 60 * 60 * 1000;
    
    const timeDiff = nextEvent - BASE_DATE;
    const timeMod = timeDiff % MS_PER_EVENT;
    
    if (timeMod !== 0) {
        nextEvent = new Date(nextEvent.getTime() + (MS_PER_EVENT - timeMod));
    }
    
    // Calculate remaining time
    let timeLeft = nextEvent - now;
    if (timeLeft < 0) timeLeft = 0;
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);
    
    const countdownDiv = document.getElementById('event-countdown');
    if (countdownDiv) {
        countdownDiv.innerHTML = `
            <span style="color:#aaa">${days} days : </span>
            <span style="color:#aaa">${hours.toString().padStart(2, '0')}h : </span>
            <span style="color:#aaa">${minutes.toString().padStart(2, '0')}m : </span>
            <span style="color:#aaa">${seconds.toString().padStart(2, '0')}s</span>
        `;
    }
}

updateCountdown();
setInterval(updateCountdown, 1000);