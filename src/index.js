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

     async fetchWeather(city) {
        const API_KEY = 'CJ2QZGNCENC27QMWJ7Q8CY6Y3';
        const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

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
            
            // Convert weather data to our format with anime flair
            const weatherCondition = data.weather[0].main.toLowerCase();
            const description = data.weather[0].description;
            
            // Get country flag emoji
            const countryFlags = {
                'JP': '🇯🇵', 'US': '🇺🇸', 'GB': '🇬🇧', 'FR': '🇫🇷', 'DE': '🇩🇪',
                'IT': '🇮🇹', 'ES': '🇪🇸', 'CA': '🇨🇦', 'AU': '🇦🇺', 'BR': '🇧🇷',
                'IN': '🇮🇳', 'CN': '🇨🇳', 'RU': '🇷🇺', 'KR': '🇰🇷', 'MX': '🇲🇽'
            };
            
            const countryFlag = countryFlags[data.sys.country] || '🌍';
            
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
                city: data.name,
                country: `${data.sys.country} ${countryFlag}`,
                temperatureC: Math.round(data.main.temp),
                temperatureF: Math.round(data.main.temp * 9/5 + 32),
                condition: data.weather[0].main,
                description: description,
                humidity: data.main.humidity,
                wind: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                icon: weatherInfo.icon,
                special: specialMessage,
                pressure: data.main.pressure,
                feelsLike: Math.round(data.main.feels_like),
                visibility: data.visibility ? Math.round(data.visibility / 1000) : null
            };
            
        } catch (error) {
            // If API fails, provide helpful error message
            if (error.message.includes('YOUR_API_KEY_HERE')) {
                throw new Error('Please add your OpenWeatherMap API key to use real weather data!');
            }
            throw error;
        }
    }


}