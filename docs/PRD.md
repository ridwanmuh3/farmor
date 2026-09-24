# 1. Project Overview

Projek ini merupakan aplikasi mobile native berbasis ionic dengan bantuan library react. Aplikasi ini enable pengusaha dalam bidang pertanian, perkebunan, serta peternakan untuk melakukan penjualan produk raw, sudah diolah, dan setengah jadi untuk dijual dalam marketplace terpusat. kemudian juga terdapat customer yang akan membeli produk yang dijual oleh pengusah atau user seller. target dari aplikasi ini lintas masa, mulai dari umur 16 - 65. Dengan demikian aplikasi harus memiliki UX yang baik agar mampu dipakai oleh semua kalangan.

# 2. Requirements

- Code must be readable, simple as you can, maintanable, predictable, YAGNI
- code structure must follow like defined folder structures. see below later
- test must at least coverable 80-90%. it means clear from any surfacing bug, especially on critical logic such as payment and order creation, and any related.
- the mobile looks MUST BE SYNCRONIZE LIKE @../mockup/*. if there is another UI and UX issues, it later must be revise.
- remove unnecessary comments such long which can make it unreadable, embrace the concept of TL;DR
- if there you are ragu dalam mengambil keputusan langsung ask for making it sure, always ask.
- create design token also design system for resulting consistent design later. this is useful
- assets for mobile already on @../apps/mobile/public/

# 3. Tech Stack

Implementasi harus sesuai dengan tech stack yang telah ditentukan, diantaranya adalah:

- Ionic - React V9. see documentation: <https://ionicframework.com/docs>
- Lucide-react:latest <https://lucide.dev/guide/>

- ### TODO: BACKEND LATER IMPLEMENTED BY MYSELF

- Databases: PostgreSQL V18.6 <https://www.postgresql.org/docs/18>
- Cache: Redis latest version
- CI/CD: Github Actions, Git, Github, Podman as Docker backend, Docker compose, justfile
- Backend: Golang: installed on this host, fiber: v3, uber-fx, GORM, gRPC, RabbitMQ, Microservice pattern
- Monitoring and Observability: OpenTelemetry (include traces, metrics, logs)

# 4. Features

- Authentication flows: such as login, register choose between merchant (seller) or customer, forgot password send to email using resend; logout which exists on bottom row of profile menu. profile which show like on mockup @../mockup. defaulting user icon to firstname lastname

- Cart: insert, update stock, deletion, checkout, linkable to product detail on clicking name product, toggle stock plus and minus, image of product, sub total checkout. see @../mockup

- Order: input method payment, qris, transfer bank, emoney, etc, choose the address of pengiriman, total calculation include pajak and etc. send order to seller also creation order to user side. payment using midtrans, webhook. see @../mockup

- HomePage: like @../mockup/HomeBuyerScreen.svg
- and like on @../mockup/ for ress

# 5. Folder structures

farmor/
├── apps/
│   ├── gateway/
│   ├── mobile/                        # Ionic Clean Architecture
│   │   ├── src/
│   │   │   ├── app/                   # App routing and core modules
│   │   │   ├── core/                  # Domain entities and use cases
│   │   │   ├── data/                  # Repositories, DTOs, and data sources
│   │   │   ├── presentation/          # Pages, UI components, and state
│   │   │   ├── assets/
│   │   │   └── environments/
│   │   ├── capacitor.config.ts
│   │   └── ionic.config.json
│   └── <features-name>-service/       # Go Clean Architecture
│       ├── cmd/
│       │   └── server/
│       ├── delivery/
│       │   ├── http/
│       │   │   └── handler/
│       │   └── messaging/
│       │       └── handler/
│       ├── entity/
│       ├── model/
│       ├── repository/
│       ├── usecase/
│       └── ...
├── docs/
├── mockup/
├── shared/
│   ├── config/
│   ├── pkg/
│   └── ...
└── justfile
