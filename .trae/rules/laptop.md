Below is a clean and professional **`rules/laptop.md`** you can directly use in your project.

---

# Frontend Project Rules (Laptop Environment)

## 1. Project Scope

* This project is developed and tested only on the local laptop environment.
* No production specific logic or remote configuration should be added unless explicitly required.
* Keep the project lightweight, readable, and easy to maintain.

## 2. Frontend Stack Rules

* Use **shadcn/ui** as the primary and preferred UI component system.
* Do not create custom core UI components when shadcn components already exist.
* Sidebar, dashboard layout, modals, dialogs, tables, forms, dropdowns, and navigation must come from shadcn.
* Custom components are allowed only when shadcn does not provide a suitable alternative.

## 3. shadcn Usage Rules

* Install components only when necessary.
* Use the official CLI for installation.

Example:

```bash
npx shadcn@latest add button
```

* Do not modify shadcn core styles directly.
* Extend styles using utility classes or wrapper components if required.
* Keep component usage consistent across the app.

## 4. API Communication Rules

* All API calls must go through a centralized API layer.
* Hardcoding URLs is strictly not allowed.

### Base URL Rule

* Always use the following environment variable:

```
BASE_URL=http://localhost:8000/api/v1
```

* Every request must be built on top of `BASE_URL`.
* No inline fetch or axios calls inside UI components.

## 5. Clean Architecture Rules

* Separate concerns clearly:

  * UI components handle only presentation.
  * API logic stays in service or api folders.
  * State management should be simple and predictable.
* Avoid deeply nested components.
* Keep file and folder naming clear and meaningful.

## 6. Dashboard and Layout Rules

* Dashboard layout must be built using shadcn components only.
* Sidebar must use shadcn navigation patterns.
* No custom sidebar from scratch.
* Layout should remain responsive and clean.

## 7. Code Quality Rules

* Write readable and self-explanatory code.
* Avoid unnecessary abstraction.
* No unused imports or dead code.
* Keep components small and focused.
* Follow consistent formatting across the project.

## 8. Dependency Rules

* Do not install UI libraries that overlap with shadcn.
* Avoid heavy third-party UI frameworks.
* Install only what is required for the feature.

## 9. Styling Rules

* Use utility-first styling.
* Do not write global CSS unless absolutely necessary.
* Keep styles predictable and minimal.
* No inline styles unless unavoidable.

## 10. General Discipline

* Do not rush features at the cost of cleanliness.
* Every component should feel intentional.
* Simplicity and clarity are higher priority than cleverness.

---

**Rule summary:**
Clean UI, shadcn everywhere, single BASE_URL, no shortcuts, no messy custom cores.
