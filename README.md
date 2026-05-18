# 🧠 MindUrCode

**Developers need more than AI that writes code — they need tools that improve it.**

MindUrCode is an AI-powered, repo-level code analysis platform that delivers practical, precise insights into your codebase. We identify test gaps, unclear logic, missing documentation, and refactoring opportunities—all cost-conscious and designed for real development workflows.

## ✨ Key Features

- **🔍 Comprehensive Code Analysis** - Deep repository-level scanning and insights
- **📊 Test Gap Detection** - Identify untested code paths and coverage issues
- **📚 Documentation Auditing** - Find missing or outdated documentation
- **🔄 Refactoring Suggestions** - Smart recommendations for code improvements
- **⚡ Java Code Analysis** - Advanced parsing and analysis of Java codebases using JavaParser
- **🌳 Git Integration** - Direct repository analysis via JGit
- **⚙️ Modular Architecture** - Extensible platform for adding custom analyzers

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.14
- **Language**: Java 21
- **Database**: PostgreSQL
- **Build Tool**: Maven
- **Key Dependencies**:
  - Spring Data JPA - ORM and database abstraction
  - Spring Validation - Input validation
  - JavaParser 3.28.0 - Java code parsing and analysis
  - JGit 6.9.0 - Git repository operations
  - Lombok - Reducing boilerplate code

### Frontend
- **Framework**: React 19.2.5
- **Build Tool**: Vite 8.0.10
- **Routing**: React Router v7
- **Language**: JavaScript
- **Dev Environment**: HMR (Hot Module Replacement)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Deployment**: Ready for containerized deployment

## 📁 Project Structure

```
MindUrCode/
├── src/                          # Java Spring Boot backend
│   ├── main/java/com/mindurcode/ # Application source code
│   └── test/                     # Backend tests
├── frontend/                     # React + Vite frontend
│   ├── src/                      # React components and pages
│   ├── public/                   # Static assets
│   └── package.json              # Frontend dependencies
├── pom.xml                       # Maven configuration
├── docker-compose.yml            # Local development setup
├── .mvn/                         # Maven wrapper
└── mvnw / mvnw.cmd              # Maven wrapper scripts
```

## 🚀 Getting Started

### Prerequisites
- **Java 21** or higher
- **Node.js 18+** and npm
- **PostgreSQL 12+**
- **Docker & Docker Compose** (optional, for containerized setup)

### Option 1: Docker Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/Nishatlabiba98/MindUrCode.git
cd MindUrCode

# Start services with Docker Compose
docker-compose up -d

# Backend will be available at http://localhost:8080
# Frontend will be available at http://localhost:3000
```

### Option 2: Local Setup

#### Backend Setup

```bash
# Navigate to project root
cd MindUrCode

# Build the backend
./mvnw clean install

# Run the Spring Boot application
./mvnw spring-boot:run
```

Backend runs on `http://localhost:8080`

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite default)

### Build for Production

**Backend:**
```bash
./mvnw clean package
java -jar target/mindurcode-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🔧 Available Scripts

### Backend (Maven)
- `./mvnw clean install` - Build project and run tests
- `./mvnw spring-boot:run` - Run development server
- `./mvnw clean package` - Create production JAR
- `./mvnw test` - Run unit tests

### Frontend (npm)
- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Check code quality with ESLint

## 💻 Code Analysis Capabilities

### Java Code Analysis
- **AST Parsing** - Complete Abstract Syntax Tree parsing using JavaParser
- **Method Extraction** - Identify and analyze all methods in your codebase
- **Class Structure Analysis** - Extract class hierarchies and relationships
- **Code Quality Metrics** - Measure complexity, maintainability, and test coverage

### Repository Analysis
- **Git History Integration** - Analyze commit patterns and code evolution
- **Dependency Mapping** - Identify code dependencies and relationships
- **Documentation Coverage** - Find files and methods lacking documentation
- **Test Coverage Analysis** - Detect untested code paths

## 📊 Project Stats

**Language Composition:**
- JavaScript: 54.1%
- Java: 36.1%
- CSS: 9.6%
- HTML: 0.2%

## 🤝 Contributing

We welcome contributions! Areas where we're actively looking for help:

- 🐛 **Bug Fixes** - Report and fix issues
- ✨ **New Analyzers** - Add custom code analysis modules
- 📖 **Documentation** - Improve docs and examples
- 🧪 **Tests** - Increase test coverage
- 🎨 **UI/UX Improvements** - Enhance the frontend experience

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Development Notes

- **Java Version**: Project uses Java 21 for latest language features
- **Spring Boot**: Version 3.5.14 (latest stable)
- **React**: Latest version with modern hooks and patterns
- **Hot Reload**: Both backend (DevTools) and frontend (Vite HMR) support hot reloading
- **Database**: PostgreSQL required for production (H2 can be used for development)

## 🔗 Quick Links

- [Repository](https://github.com/Nishatlabiba98/MindUrCode)
- [Issue Tracker](https://github.com/Nishatlabiba98/MindUrCode/issues)
- [Discussions](https://github.com/Nishatlabiba98/MindUrCode/discussions)

## 📝 License

This project is open source and available under the MIT License.

---

**Made with ❤️ by the MindUrCode Team**

*Last Updated: May 17, 2026*
