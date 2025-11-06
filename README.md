

## Docker

### Build & Run (Production Image)

```bash
docker build -t saas-fuel-admin .
docker run --rm -p 3000:3000 --name saas-fuel-admin saas-fuel-admin
```

Then visit: http://localhost:3000

### Using docker-compose

```bash
docker compose up --build
```

### Customize Environment

Expose environment variables at runtime:

```bash
docker run -e NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api" -p 3000:3000 saas-fuel-admin
```

If you need secrets (never bake into image), use a `.env` file and pass `--env-file .env`.

### Development (Hot Reload) Option

For local iterative development you can mount the source and run the dev server:

```bash
docker run --rm -it -p 3000:3000 -v "$(pwd)":/app -w /app node:20-alpine sh -c "npm ci --legacy-peer-deps && npm run dev"
```

### Image Structure

This repository uses a multi-stage Docker build:

1. deps stage: installs dependencies via `npm ci` using cached layers
2. builder stage: creates a Next.js production build with `output=standalone`
3. runner stage: minimal runtime containing only `.next/standalone`, `.next/static`, and `public/` assets, running as non-root user `nextjs`

### Security / Best Practices Applied

- Non-root user execution
- Standalone output reduces attack surface & image size
- `.dockerignore` keeps build context lean
- Telemetry disabled via `NEXT_TELEMETRY_DISABLED=1`
- Explicit `NODE_ENV=production`

### Troubleshooting

| Issue | Fix |
|-------|-----|
| Asset 404 | Ensure `public/` copied & no basePath misconfig |
| API URL wrong | Set `NEXT_PUBLIC_API_BASE_URL` at runtime |
| Build fails on missing dep | Delete local `node_modules` & retry `npm ci` |
| Memory issues on build | Increase Docker memory to >= 2GB |

---


## Components

TailAdmin is a pre-designed starting point for building a web-based dashboard using Next.js and Tailwind CSS. The template includes:

- Sophisticated and accessible sidebar
- Data visualization components
- Profile management and custom 404 page
- Tables and Charts(Line and Bar)
- Authentication forms and input elements
- Alerts, Dropdowns, Modals, Buttons and more
- Can't forget Dark Mode 🕶️

All components are built with React and styled using Tailwind CSS for easy customization.

## Feature Comparison

### Free Version
- 1 Unique Dashboard
- 30+ dashboard components
- 50+ UI elements
- Basic Figma design files
- Community support

### Pro Version
- 5 Unique Dashboards: Analytics, Ecommerce, Marketing, CRM, Stocks (more coming soon)
- 400+ dashboard components and UI elements
- Complete Figma design file
- Email support

To learn more about pro version features and pricing, visit our [pricing page](https://tailadmin.com/pricing).

## Changelog

### Version 2.0.2 - [March 25, 2025]

- Upgraded to Next v15.2.3 for [CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927) concerns
- Included overrides vectormap for packages to prevent peer dependency errors during installation.
- Migrated from react-flatpickr to flatpickr package for React 19 support

### Version 2.0.1 - [February 27, 2025]

#### Update Overview

- Upgraded to Tailwind CSS v4 for better performance and efficiency.
- Updated class usage to match the latest syntax and features.
- Replaced deprecated class and optimized styles.

#### Next Steps

- Run npm install or yarn install to update dependencies.
- Check for any style changes or compatibility issues.
- Refer to the Tailwind CSS v4 [Migration Guide](https://tailwindcss.com/docs/upgrade-guide) on this release. if needed.
- This update keeps the project up to date with the latest Tailwind improvements. 🚀

### v2.0.0 (February 2025)
A major update focused on Next.js 15 implementation and comprehensive redesign.

#### Major Improvements
- Complete redesign using Next.js 15 App Router and React Server Components
- Enhanced user interface with Next.js-optimized components
- Improved responsiveness and accessibility
- New features including collapsible sidebar, chat screens, and calendar
- Redesigned authentication using Next.js App Router and server actions
- Updated data visualization using ApexCharts for React

#### Breaking Changes

- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

[Read more](https://tailadmin.com/docs/update-logs/nextjs) on this release.

#### Breaking Changes
- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

### v1.3.4 (July 01, 2024)
- Fixed JSvectormap rendering issues

### v1.3.3 (June 20, 2024)
- Fixed build error related to Loader component

### v1.3.2 (June 19, 2024)
- Added ClickOutside component for dropdown menus
- Refactored sidebar components
- Updated Jsvectormap package

### v1.3.1 (Feb 12, 2024)
- Fixed layout naming consistency
- Updated styles

### v1.3.0 (Feb 05, 2024)
- Upgraded to Next.js 14
- Added Flatpickr integration
- Improved form elements
- Enhanced multiselect functionality
- Added default layout component

## License

TailAdmin Next.js Free Version is released under the MIT License.

## Support

If you find this project helpful, please consider giving it a star on GitHub. Your support helps us continue developing and maintaining this template.
