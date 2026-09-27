# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

- Mobile: Ionic React v9, capacitor; assets in `apps/mobile/public/`
- Backend (later, owner-built): Go, Fiber v3, uber-fx, GORM, gRPC, RabbitMQ, microservices
- Data: PostgreSQL 18, Redis
- Integrations: Midtrans (payment, webhook), Resend (email)
- Infra: GitHub Actions, Podman/Docker Compose, justfile
- Observability: OpenTelemetry

## Users

- Buyer: umur 16–65, households and small businesses buying agricultural products (raw, processed, semi-finished) from a centralized marketplace.
- Seller (merchant): pengusaha in pertanian, perkebunan, peternakan selling raw, processed, and semi-finished products; manages listings and orders.
- Register flow chooses role: merchant (seller) or customer (buyer).

## Product Purpose

Enable farm/plantation/livestock entrepreneurs to sell raw, processed, and semi-finished goods in a centralized marketplace, and let buyers purchase them. Wide age range (16–65) demands strong, accessible UX usable by everyone.

## Positioning

Agri-only marketplace covering the full product chain — raw, processed, and semi-finished — not general retail.

## Operating Context

Mobile-native app (Ionic + Capacitor). Backend built later by owner; mobile works against mocked data until services exist.

## Capabilities and Constraints

- Auth: login, register (role select), forgot password via Resend email, logout in profile bottom row; default user icon from firstname lastname.
- Cart: insert, update quantity, delete, checkout, link to product detail on product name, quantity toggle, product image, subtotal.
- Order: payment method (QRIS, bank transfer, e-money, etc.), shipping address selection, totals incl. tax; order creation on both buyer and seller sides; Midtrans payment with webhook.
- Home and remaining screens follow `mockup/*.svg`.
- UI must match `mockup/*.svg` exactly; deviations revised later.
- Design tokens + design system required for consistency.
- Code: readable, simple, maintainable, YAGNI; tests 80–90% coverage, especially payment and order creation.
- Open decision: payment/ordering edge cases beyond Midtrans (e.g. shipping providers) undecided.

## Brand Commitments

- Name: Farmor.
- Visual identity follows committed mockups in `mockup/` (incl. `color-palette.png`).

## Evidence on Hand

- PRD: `docs/PRD.md`
- Mockups: `mockup/*.svg` (19 screens) + `mockup/color-palette.png`
- App assets: `apps/mobile/public/`
- No testimonials, customer data, or benchmarks exist; do not fabricate.

## Product Principles

- Mockups are visual truth; UI matches them before inventing anything.
- Accessibility first — UX must serve ages 16–65.
- Critical flows (payment, order creation) are the most tested code in the repo.
- Simple, readable, predictable code over cleverness; YAGNI.

## Accessibility & Inclusion

- Target: WCAG 2.2 AA. Wide age range (16–65) makes legibility, contrast, touch targets, and simple flows hard requirements.
