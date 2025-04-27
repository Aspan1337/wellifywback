front/
├── .github/                # Конфигурации GitHub (опционально)
├── dist/                    # Сборка проекта (выходные файлы)
├── node_modules/            # Папка зависимостей (автоматически создаётся)
├── public/                  # Публичные файлы (например, index.html)
├── src/                     # Исходный код приложения
│   ├── assets/              # Статические ресурсы (изображения, иконки и пр.)
│   ├── components/          # Переиспользуемые UI-компоненты
│   │   ├── FeedbackModal/
│   │   ├── Footer/
│   │   ├── Header/
│   │   └── ScrollToTop/
│   ├── pages/               # Страницы приложения (по маршрутам)
│   │   ├── AdminPanel/
│   │   ├── Auth/
│   │   ├── Comments/
│   │   ├── MainPage/
│   │   │   ├── Calculator/
│   │   │   ├── Diet/
│   │   │   ├── GymSlider/
│   │   │   ├── Individual_Warmups/
│   │   │   ├── Main/
│   │   │   ├── SportBrands/
│   │   │   └── Workout/
│   │   ├── Profile/
│   │   └── Settings/
│   ├── App.css               # Основные стили приложения
│   ├── App.jsx               # Основной компонент приложения
│   └── main.jsx              # Точка входа в приложение (ReactDOM.createRoot)
├── .env                         # Файл переменных окружения
├── index.html                   # Основной HTML-файл приложения
