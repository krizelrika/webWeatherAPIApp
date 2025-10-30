import './styles.css'
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

    async fetchWeather(city) {
        const API_KEY = 'CJ2QZGNCENC27QMWJ7Q8CY6Y3';
        const API_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/`+city+`?unitGroup=us&key=`+API_KEY+`&contentType=json`;

        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
                } else if (response.status === 404) {
                    throw new Error('City not found. Please check the spelling and try again.');
                } else {
                    throw new Error('Weather service temporarily unavailable. Please try again later.');
                }
            }

            const data = await response.json();
            console.log("----DEBUG API DATA------");
            console.log(data);
            console.log(data.description);
            console.log(data.currentConditions.icon);
            // Convert weather data to our format with anime flair
            const weatherCondition = data.currentConditions.conditions;
            const description = data.description;
            
            // Get country flag emoji
            const cityParamArray = city.split(/[, ]+/);
            console.log(cityParamArray);
            const countryFlags = {
                'Japan': '🇯🇵', 'United States': '🇺🇸', 'Great Britain': '🇬🇧', 'France': '🇫🇷', 'Denmark': '🇩🇪',
                'Italy': '🇮🇹', 'Estonia': '🇪🇸', 'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Brazil': '🇧🇷',
                'India': '🇮🇳', 'China': '🇨🇳', 'Russia': '🇷🇺', 'Korea': '🇰🇷', 'Mexico': '🇲🇽',
                'Philippines': '🇵🇭'
            };
            
            const countryFlag = countryFlags[cityParamArray[1]] || '🌍';
            
            // Map weather conditions to anime-style icons and special messages
            const weatherMapping = {
                'clear': { 
                    icon: '☀️', 
                    special: 'Radiant solar energy illuminates the realm!' 
                },
                'clouds': { 
                    icon: '☁️', 
                    special: 'Mystical clouds drift through the sky...' 
                },
                'Partially cloudy': {
                    icon: '☁️', 
                    special: 'Mystical clouds drift through the sky...' 
                },
                'Overcast': {
                    icon: '☁️', 
                    special: 'Clouds are filling up the sky...' 
                },
                'rain': { 
                    icon: '🌧️', 
                    special: 'Rain spirits dance from the heavens!' 
                },
                'drizzle': { 
                    icon: '🌦️', 
                    special: 'Gentle water sprites sprinkle magic!' 
                },
                'thunderstorm': { 
                    icon: '⛈️', 
                    special: 'Thunder gods awaken with mighty power!' 
                },
                'snow': { 
                    icon: '❄️', 
                    special: 'Winter spirits weave crystalline magic!' 
                },
                'mist': { 
                    icon: '🌫️', 
                    special: 'Ethereal mists veil the world in mystery...' 
                },
                'fog': { 
                    icon: '🌫️', 
                    special: 'Ancient fog spirits shroud the land...' 
                },
                'haze': { 
                    icon: '🌫️', 
                    special: 'A dreamy haze dances in the air...' 
                },
                'dust': { 
                    icon: '🌪️', 
                    special: 'Desert winds carry ancient secrets!' 
                },
                'sand': { 
                    icon: '🌪️', 
                    special: 'Sandstorm spirits swirl with power!' 
                },
                'tornado': { 
                    icon: '🌪️', 
                    special: 'Tornado spirits unleash their fury!' 
                }
            };
            
            const weatherInfo = weatherMapping[weatherCondition] || { 
                icon: '🌤️', 
                special: 'The weather spirits are in harmony!' 
            };
            
            // Special messages for specific cities
            const citySpecials = {
                'tokyo': 'The neon lights reflect the sky\'s mood!',
                'kyoto': 'Cherry blossoms whisper ancient secrets...',
                'paris': 'The City of Light glows with magic!',
                'london': 'Big Ben chimes through the mystical air!',
                'new york': 'Skyscrapers pierce the celestial veil!',
                'moscow': 'Red Square resonates with elemental power!'
            };
            
            const cityKey = city.toLowerCase();
            const specialMessage = citySpecials[cityKey] || weatherInfo.special;
            
            return {
                city: cityParamArray[0],
                country: `${cityParamArray[1]} ${countryFlag}`,
                temperatureC: Math.round((data.currentConditions.temp-32) * 5/9),
                temperatureF: Math.round(data.currentConditions.temp),
                condition: data.currentConditions.conditions,
                description: description,
                humidity: data.currentConditions.humidity,
                wind: Math.round(data.currentConditions.windspeed * 3.6), // Convert m/s to km/h
                icon: weatherInfo.icon,
                special: specialMessage,
                pressure: data.currentConditions.pressure,
                feelsLike: Math.round(data.currentConditions.feelslike),
                visibility: data.currentConditions.visibility ? Math.round(data.currentConditions.visibility / 1000) : null
            };
            
        } catch (error) {
            // If API fails, provide helpful error message
            if (error.message.includes('YOUR_API_KEY_HERE')) {
                throw new Error('Please add your OpenWeatherMap API key to use real weather data!');
            }
            throw error;
        }
    }

    async searchWeather(city) {
        this.showLoading();
        this.hideError();

        try {
            const weatherData = await this.fetchWeather(city);
            this.currentWeatherData = weatherData;
            this.displayWeather(weatherData);
            this.updateBackground(weatherData.condition);
            this.completeQuest(city);
            this.saveLastCity(city);
        } catch (error) {
            this.showError('The weather spirits are hiding! Try another city, brave explorer.');
            console.log(error);
        } finally {
            this.hideLoading();
        }
    }

    displayWeather(data) {
        this.cityName.textContent = `${data.city}, ${data.country}`;
        this.weatherCondition.textContent = data.special || data.condition;
        this.weatherIcon.textContent = data.icon;
        
        const temp = this.isCelsius ? data.temperatureC : data.temperatureF;
        const unit = this.isCelsius ? '°C' : '°F';
        this.temperature.textContent = `${temp}${unit}`;
        
        this.humidity.textContent = `${data.humidity}%`;
        this.windSpeed.textContent = `${data.wind} km/h`;
        
        this.weatherCard.classList.remove('hidden');
    }

    completeQuest(city) {
        // Award XP and update stats
        const xpGained = 50 + Math.floor(Math.random() * 50);
        this.gameStats.xp += xpGained;
        this.gameStats.questsCompleted += 1;
        
        if (!this.gameStats.citiesExplored.includes(city.toLowerCase())) {
            this.gameStats.citiesExplored.push(city.toLowerCase());
            this.gameStats.xp += 25; // Bonus for new city
        }
        
        this.updateDailyStreak();
        this.saveGameStats();
        this.updateGameStats();
        this.showQuestComplete(xpGained);
        this.checkAchievements();
        this.updateCharacterAvatar();
    }

    showQuestComplete(xp) {
        this.questComplete.textContent = `🎉 Quest Complete! +${xp} XP`;
        this.questComplete.style.display = 'block';
        setTimeout(() => {
            this.questComplete.style.display = 'none';
        }, 3000);
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            const achievementKey = `achievement_${achievement.id}`;
            const alreadyUnlocked = localStorage.getItem(achievementKey);
            
            if (!alreadyUnlocked && achievement.condition()) {
                localStorage.setItem(achievementKey, 'true');
                this.showAchievement(achievement.name);
            }
        });
    }

    showAchievement(name) {
        this.achievement.textContent = `🏆 ${name} Unlocked!`;
        this.achievement.classList.add('show');
        setTimeout(() => {
            this.achievement.classList.remove('show');
        }, 4000);
    }

    updateCharacterAvatar() {
        const avatars = ['🌟', '⚡', '🔮', '🌙', '☄️', '🌈'];
        const level = Math.floor(this.gameStats.xp / 100);
        const avatarIndex = Math.min(level, avatars.length - 1);
        this.characterAvatar.textContent = avatars[avatarIndex];
    }

    showCharacterMessage() {
        const messages = [
            "Keep exploring, weather guardian! 🌟",
            "The spirits are proud of your progress! ⚡",
            "Each city holds new mysteries... 🔮",
            "Your weather powers grow stronger! 💪",
            "The elements respond to your call! 🌊"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // Create temporary message bubble
        const bubble = document.createElement('div');
        bubble.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: rgba(168, 230, 207, 0.95);
            color: #2c3e50;
            padding: 15px 20px;
            border-radius: 20px;
            font-weight: 600;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
            max-width: 250px;
            text-align: center;
        `;
        bubble.textContent = randomMessage;
        document.body.appendChild(bubble);
        
        setTimeout(() => {
            document.body.removeChild(bubble);
        }, 3000);
    }

    updateBackground(condition) {
        document.body.classList.remove('bg-clear', 'bg-rain', 'bg-cloudy', 'bg-snow', 'bg-wind');
        
        switch (condition.toLowerCase()) {
            case 'clear':
            case 'sunny':
                document.body.classList.add('bg-clear');
                break;
            case 'rain':
            case 'rainy':
                document.body.classList.add('bg-rain');
                break;
            case 'cloudy':
            case 'overcast':
                document.body.classList.add('bg-cloudy');
                break;
            case 'snow':
            case 'snowy':
                document.body.classList.add('bg-snow');
                break;
            case 'wind':
            case 'windy':
            case 'storm':
                document.body.classList.add('bg-wind');
                break;
            default:
                document.body.classList.add('bg-cloudy');
        }
    }

    toggleTemperatureUnit() {
        this.isCelsius = !this.isCelsius;
        this.tempToggle.textContent = this.isCelsius ? '°C' : '°F';
        
        if (this.currentWeatherData) {
            const temp = this.isCelsius ? 
                this.currentWeatherData.temperatureC : 
                this.currentWeatherData.temperatureF;
            const unit = this.isCelsius ? '°C' : '°F';
            this.temperature.textContent = `${temp}${unit}`;
        }
    }

    updateGameStats() {
        this.xpPoints.textContent = `${this.gameStats.xp} XP`;
        this.questsCompleted.textContent = `${this.gameStats.questsCompleted} Quests`;
        this.citiesExplored.textContent = `${this.gameStats.citiesExplored.length} Cities`;
        this.streakCount.textContent = `${this.gameStats.streak} Streak`;
    }

    checkDailyStreak() {
        const today = new Date().toDateString();
        const lastPlay = this.gameStats.lastPlayDate;
        
        if (lastPlay) {
            const lastPlayDate = new Date(lastPlay);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastPlayDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                this.gameStats.streak = 0; // Reset streak if more than 1 day
            }
        }
    }

    updateDailyStreak() {
        const today = new Date().toDateString();
        if (this.gameStats.lastPlayDate !== today) {
            this.gameStats.streak += 1;
            this.gameStats.lastPlayDate = today;
        }
    }

    saveGameStats() {
        localStorage.setItem('weatherQuest_xp', this.gameStats.xp.toString());
        localStorage.setItem('weatherQuest_quests', this.gameStats.questsCompleted.toString());
        localStorage.setItem('weatherQuest_cities', JSON.stringify(this.gameStats.citiesExplored));
        localStorage.setItem('weatherQuest_streak', this.gameStats.streak.toString());
        localStorage.setItem('weatherQuest_lastPlay', this.gameStats.lastPlayDate);
    }

    showLoading() {
        this.loadingSpinner.style.display = 'flex';
        this.weatherCard.classList.add('hidden');
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorAlert.style.display = 'block';
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        this.errorAlert.style.display = 'none';
    }

    saveLastCity(city) {
        localStorage.setItem('weatherQuest_lastCity', city);
    }

    loadLastCity() {
        const lastCity = localStorage.getItem('weatherQuest_lastCity');
        if (lastCity) {
            this.cityInput.value = lastCity;
            setTimeout(() => {
                this.searchWeather(lastCity);
            }, 1000);
        }
    }
}

// Initialize the anime weather quest game
document.addEventListener('DOMContentLoaded', () => {
    new WeatherQuestGame();
});

// Add CSS animation for fadeInOut
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        20%, 80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);