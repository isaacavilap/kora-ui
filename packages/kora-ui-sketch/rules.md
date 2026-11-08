# House rules

Rules that apply to every system generated with Wireframly. The server appends this file to the AI prompt on each request, so edits take effect without a restart. Add a rule whenever a correction applies to more than one project.

## Panamá (market for all systems)

- **Clients and suppliers are a natural or legal person.** Every client/supplier form starts with "Tipo de persona": Natural / Jurídica.
  - Natural: nombre completo, cédula (formats `8-123-4567`, `PE-12-345`, `E-8-12345`, `N-19-123`) or pasaporte for foreigners.
  - Jurídica: razón social, nombre comercial, RUC (e.g. `155612345-2-2021`), representante legal and their cédula.
  - Both: DV (dígito verificador, 2 digits) next to the RUC/cédula.
  - Lists and detail pages show "Cédula / RUC" and DV. Quotes and invoices print them.
  - Suppliers (proveedores) also have: condición de pago (contado / crédito N días), límite de crédito, cuenta bancaria, what they supply with last prices, purchase orders and balance owed. Every system that buys has a "Proveedores" list, detail and form where purchases are made.
- **Electronic invoicing (DGI, factura electrónica).** Invoices need: tipo de receptor (Contribuyente, Consumidor final, Gobierno, Extranjero), RUC + DV of the receiver when they are a contribuyente, CUFE and QR code on the printed invoice. Credit/debit notes reference the original invoice.
- **Taxes.** ITBMS 7% by default; 10% for alcohol and lodging, 15% for tobacco; some items exempt. Show subtotal, descuento, ITBMS and total separately. Legal-person clients may be "agente de retención de ITBMS".
- **Money.** Balboa = USD. Format `B/. 1,234.56`.
- **Address.** Provincia → Distrito → Corregimiento, plus a free-text reference ("Calle 50, edificio X, apto 3B"). No ZIP code. Field work also stores a GPS pin. A client has many addresses, each with a label (Casa, Oficina, Obra…) and one marked as principal.
- **Phones.** Mobile `6xxx-xxxx` (8 digits), landline `xxx-xxxx`, country code +507. WhatsApp is the main contact channel.
- **Dates.** `dd/mm/aaaa`.
- **Proposals (plan).** Prices in B/., cost = hours × hourly rate (hours estimated for AI-assisted development: about a third of a traditional estimate, ~1–2 weeks per stage), shown without ITBMS with the note "Precios sin ITBMS (7%)". Offer 2–3 server options for the client to pick (hosting con cPanel recommended to start, VPS con cPanel, nube administrada), each with storage size and monthly price; plus dominio .com.pa (anual) and soporte; factura electrónica (PAC) and WhatsApp as future options.
- **Split the build into 2 stages by area of the company** (e.g. Etapa 1: ventas + gerencia; Etapa 2: producción + depósito + campo) so the first price the client sees is not the biggest and part of the company starts using the system early. The proposal leads with Etapa 1's price, not the total.
- **Proposal answers the client's delivery checklist**: besides stages and costs, list how it is built (web/responsive, central DB, backups, permissions, modules) and what the client receives (demos per stage, tests with real data, training, manual, technical docs + DB backup, source-code terms). Every control the client calls "obligatorio" gets its own screen (e.g. validar orden), and every alert has a screen where it is resolved.
- **Offer "Adicionales"**: optional improvements the client can tick, each with price, one-line value and its screens (e.g. portal del cliente, cobros con Yappy, WhatsApp automático, factura electrónica, optimizer or field signatures). Chosen add-ons join the installments; recurring third-party fees (banco, Meta, PAC) are stated as apart.
- **The build total is paid in monthly installments** (e.g. B/. 3,300 in cuotas of B/. 350, last one the remainder) so the client doesn't feel the expense; servidor y soporte are billed apart each month. Not a choice between plans.
- **Payroll (only when the system has HR).** Seguro Social (CSS), seguro educativo, décimo tercer mes, vacaciones.

## Product conventions

- **Each app has its own "Alertas" behind the bell**, with only that role's alerts and a link to fix each one. Critical alerts also go to management. Name them "Alertas · <App>"; the bell opens the current app's one.
- **When a role waits on another department** (e.g. sales waits for measurements), it gets its own list of those requests and an alert when the result is ready.
- **Rules that drive calculations** (fórmulas de fabricación, comisiones, metas, precios) get their own screen with versions and a "probar" preview, not a card buried in Configuración.

- **Every app starts with "Inicio"**: first menu item, outside any group. It shows that role's day: 3–4 KPIs, "Mis pendientes de hoy" and shortcuts to the 1–2 most used actions. In the JSON the screen is named "Inicio · <App>" (e.g. "Inicio · Tienda"); the menu item "Inicio" opens the one of the current app.
- **Most used places sit at the top of the menu, outside groups**: Inicio, then the daily ones (e.g. Vender, Clientes, Productos y servicios). Groups (collapsible) hold the secondary places and name the kind of work, e.g. "Operación" (ventas, cotizaciones, cobros, garantías). Master data (clientes, productos) is never inside a transaction group like "Ventas".

- **Every business system has a catalog and sales.** "Productos y servicios" (código, nombre, tipo producto / producto a medida / servicio, unidad, precio, ITBMS, costo, stock only for products, activo). "Vender" is the selling screen (catalog + current sale + pay and invoice). "Ventas" lists the sales/invoices. Quotes, orders and invoices pick items from the catalog.
- **Use the words the business uses.** No jargon like "embudo" or "pipeline": say "Vender", "Ventas", "Tablero de cotizaciones".
- **Filters live behind a "Filtros" button** (with a count of active filters), not as a row of selects. A search box can stay visible.

- **Ask "one or many?" for every attribute before drawing a form.** If a value can repeat, it is a child list, not a single field. Typical "many": a client's addresses (home, office, each job site), contacts of a company (name, role, phone), phones and emails, products in a quote, payments of an order, photos. Show it as a small table or repeated rows with "+ Agregar". Documents that use one of them (quote, order, installation) pick it with a select ("Dirección de instalación: Casa · Calle 50…").

- Each system gets the generic "Acceso" kit (login, recover password, register, 2FA, errors). Login is email/user + password only: no "Entrar con Google" and no demo "entrar como" buttons unless asked.
- Split big systems into a few apps by where people work. A sidebar select switches between apps.
- Sidebar menus list places only (lists, boards, dashboards, calendars). Forms and actions are reached from buttons and from the "＋ Crear" menu in the top bar.
- Each entity has its own list, detail and form. Never merge two entities in one form.
- **Order stages are generic**, valid for any business: Recibida, Validación, Entrada a taller (or a producción), Construcción (or Producción), Calidad, Envío, Instalación, Entregada. Use the ones that apply. Business-specific steps (e.g. ingreso, corte, armado, vidrios) are sub-steps inside Construcción: the workshop app gets its own group "Etapas del taller" with one page per step; the sales app only sees the generic stage.
- **Entities with stages (orders, projects, tickets) get one sub-page per stage** in the menu group of that entity: "All" + one page per stage, each showing the records in that stage, the data that stage needs and its main action. Records are created in the app that sells/receives them (e.g. orders in Tienda); the workshop sees them in its board.
- Field apps (installers, technicians) are normal responsive apps, not a separate mobile-only app.
