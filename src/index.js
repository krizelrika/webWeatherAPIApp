import "./styles.css";

// Anime Weather Quest Game
class WeatherQuestGame {
    constructor() {
        this.isCelsius = true;
        this.currentWeatherData = null;
        this.gameStats = {
            xp: parseInt(localStorage.getItem('weatherQuest_xp')) || 0,
            questsCompleted: parseInt(localStorage.getItem('weatherQuest_quests')) || 0,
            citiesExplored: JSON.parse(localStorage.getItem('weatherQuest_cities')) || [],
            streak: parseInt(localStorage.getItem('weatherQuest_streak')) || 0,
            lastPlayDate: localStorage.getItem('weatherQuest_lastPlay') || null
        };
        
        this.achievements = [
            { id: 'first_quest', name: 'First Steps', condition: () => this.gameStats.questsCompleted >= 1 },
            { id: 'explorer', name: 'World Explorer', condition: () => this.gameStats.citiesExplored.length >= 5 },
            { id: 'weather_master', name: 'Weather Master', condition: () => this.gameStats.xp >= 500 },
            { id: 'streak_master', name: 'Streak Master', condition: () => this.gameStats.streak >= 7 }
        ];
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateGameStats();
        this.createParticles();
        this.loadLastCity();
        this.checkDailyStreak();
    }
}