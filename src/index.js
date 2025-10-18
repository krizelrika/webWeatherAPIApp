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

    initializeElements() {
        this.searchForm = document.getElementById('searchForm');
        this.cityInput = document.getElementById('cityInput');
        this.tempToggle = document.getElementById('tempToggle');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.weatherCard = document.getElementById('weatherCard');
        this.errorAlert = document.getElementById('errorAlert');
        this.errorMessage = document.getElementById('errorMessage');
        this.questComplete = document.getElementById('questComplete');
        this.achievement = document.getElementById('achievement');
        this.characterAvatar = document.getElementById('characterAvatar');
        
        // Weather display elements
        this.cityName = document.getElementById('cityName');
        this.weatherCondition = document.getElementById('weatherCondition');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.temperature = document.getElementById('temperature');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        
        // Game stats elements
        this.xpPoints = document.getElementById('xpPoints');
        this.questsCompleted = document.getElementById('questsCompleted');
        this.citiesExplored = document.getElementById('citiesExplored');
        this.streakCount = document.getElementById('streakCount');
    }

    attachEventListeners() {
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const city = this.cityInput.value.trim();
            if (city) {
                this.searchWeather(city);
            }
        });

        this.tempToggle.addEventListener('click', () => {
            this.toggleTemperatureUnit();
        });

        this.characterAvatar.addEventListener('click', () => {
            this.showCharacterMessage();
        });
    }

     createParticles() {
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particlesContainer.appendChild(particle);
        }
    }

}