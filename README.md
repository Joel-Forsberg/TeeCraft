# TeeCraft

TeeCraft är en fullstack e-handelsapplikation utvecklad som examensprojekt. Applikationen låter användare registrera sig, logga in, bläddra bland produkter, välja produktvarianter, lägga produkter i kundvagnen, genomföra checkout och se tidigare beställningar.

Projektet består av en frontend byggd i React och ett backend-API byggt med ASP.NET Core.

## Live-version

Frontend:  
https://teecraft-shop.netlify.app/

Backend / API:  
https://teecraft-api.onrender.com

Swagger:  
https://teecraft-api.onrender.com/swagger

## Tekniker

### Backend
- ASP.NET Core Web API
- .NET
- Entity Framework Core
- PostgreSQL
- Npgsql
- JWT Authentication
- Swagger / OpenAPI

### Frontend
- React
- JavaScript
- Vite
- CSS
- Fetch API

### Betalning
- Stripe Checkout
- Stripe Test Mode

### Deployment
- Netlify – frontend
- Render – backend
- PostgreSQL – produktionsdatabas

## Funktioner

Applikationen innehåller bland annat:

- Registrering av användare
- Inloggning
- JWT-autentisering
- Rollbaserad behörighet
- Produktlista
- Produktdetaljer
- Produktvarianter
- Färg, storlek och passform
- Kundvagn
- Lägga till och ta bort produkter
- Checkout
- Orderhantering
- Orderhistorik
- Stripe Checkout och betalningsflöde
- Lageruppdatering efter köp
- REST API

## Projektstruktur

Projektet är uppdelat i frontend och backend.

```text
TeeCraft
│
├── TeeCraft.API
│   ├── Controllers
│   ├── Data
│   ├── DTOs
│   ├── Models
│   ├── Middleware
│   └── Program.cs
│
└── teecraft-frontend
    ├── src
    ├── public
    └── package.json
```

Backend ansvarar för affärslogik, databasåtkomst, autentisering och API-endpoints.

Frontend ansvarar för användargränssnittet och kommunicerar med backend genom REST-anrop.

## Databas

Databasen innehåller bland annat följande entiteter:

- User
- Role
- Customer
- Category
- Product
- ProductVariant
- Cart
- CartItem
- Order
- OrderItem
- Payment

Relationerna mellan dessa hanteras med Entity Framework Core.

Under den lokala utvecklingen användes SQL Server. Den publicerade versionen använder PostgreSQL.

## Autentisering

Applikationen använder JWT, JSON Web Tokens, för autentisering.

När en användare loggar in returnerar backend en token. Token används därefter vid anrop till skyddade endpoints.

Exempel:

```http
Authorization: Bearer <token>
```

Vissa endpoints kräver att användaren är autentiserad och vissa funktioner kan begränsas beroende på användarens roll.

## API

API:et innehåller controllers för bland annat:

```text
Categories
Products
Users
Customers
Cart
Orders
Payments
```

API-dokumentation och testning finns genom Swagger.

Swagger för den publicerade versionen:

```text
https://teecraft-api.onrender.com/swagger
```

## Exempel på användarflöde

Ett normalt köpflöde ser ut ungefär så här:

```text
Registrera konto
      ↓
Logga in
      ↓
Hämta JWT-token
      ↓
Visa produkter
      ↓
Välj produktvariant
      ↓
Lägg till i kundvagn
      ↓
Checkout
      ↓
Skapa order
      ↓
Stripe Checkout
      ↓
Visa orderhistorik
```

## Betalning

Applikationen använder Stripe för checkout och betalningsflödet.

När användaren genomför ett köp skapas en checkout-session och användaren skickas vidare till Stripe för betalning. Efter genomförd betalning återgår användaren till applikationen och orderflödet slutförs.

Stripe används i testläge under projektet, vilket innebär att inga riktiga betalningar behöver genomföras vid demonstration och testning.

## Säkerhet

Projektet innehåller flera säkerhetsfunktioner:

- JWT-autentisering
- Rollbaserad behörighet
- Skyddade API-endpoints
- Validering av inkommande data
- Separering mellan frontend, backend och databas
- DTO:er för dataöverföring
- Autentiserade orderanrop

Känsliga värden såsom databasanslutningar och JWT-nycklar ska inte lagras direkt i det publika GitHub-repot.

## Installation

### Backend

Klona repositoryt:

```bash
git clone https://github.com/Joel-Forsberg/TeeCraft.git
```

Gå till backend-projektet:

```bash
cd TeeCraft.API
```

Återställ NuGet-paket:

```bash
dotnet restore
```

Starta API:et:

```bash
dotnet run
```

Swagger kan därefter öppnas via den localhost-adress som visas i terminalen.

### Frontend

Gå till frontend-mappen:

```bash
cd teecraft-frontend
```

Installera dependencies:

```bash
npm install
```

Starta utvecklingsservern:

```bash
npm run dev
```

## Konfiguration

Backend kräver bland annat:

- PostgreSQL- eller SQL Server-anslutning
- JWT-konfiguration
- Stripe-konfiguration

Exempel på struktur i `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_CONNECTION_STRING"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY",
    "Issuer": "YOUR_ISSUER",
    "Audience": "YOUR_AUDIENCE"
  },
  "Stripe": {
    "SecretKey": "YOUR_STRIPE_SECRET_KEY"
  }
}
```

## Testning

Backend har under utvecklingen testats med Swagger.

Testerna har bland annat omfattat:

- Registrering
- Inloggning
- JWT-autentisering
- Produkt-API
- Kundvagn
- Checkout
- Orderhistorik
- Stripe Checkout och betalningsflöde
- Lageruppdatering

Frontend har även testats tillsammans med det publicerade API:et för att verifiera hela användarflödet.

## Begränsningar

Alla funktioner från den ursprungliga kravspecifikationen implementerades inte.

Exempel på funktioner som inte prioriterades:

- Rabattkoder
- E-postbekräftelser
- Avancerad admin-dashboard
- Avancerad lagerhantering
- AI-baserade rekommendationer

Fokus lades istället på att skapa ett fungerande komplett flöde från registrering och produktval till checkout, betalning och genomförd order.

## Framtida utveckling

Projektet skulle kunna vidareutvecklas med:

- Admin-dashboard
- Produktrecensioner
- Rabattkoder
- E-postbekräftelser
- Återställning av lösenord
- Sökning och filtrering
- Automatiserade tester
- CI/CD
- Förbättrad loggning
- Förbättrad responsiv design

## Utvecklare

**Joel Forsberg**

Examensprojekt inom systemutveckling.
