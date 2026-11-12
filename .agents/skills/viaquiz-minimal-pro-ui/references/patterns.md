# ViaQuiz Minimal Pro Reference Patterns

## 1. Standard Page Container

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding-bottom: 40px;
}
```

## 2. Segmented Tab Bar

```css
.tabs {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: var(--color-bg-elevated, #12121a);
  border: 1px solid var(--color-border, #2a2a3a);
  border-radius: 10px;
}

.tabButton {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--color-text-secondary, #9090a8);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.tabButton:focus {
  outline: none;
}

.tabButton:focus-visible {
  outline: 2px solid var(--color-border-focus, #863bff);
  outline-offset: -2px;
}

.isActive {
  background: var(--color-bg-surface, #1a1a26);
  border-color: rgba(255, 255, 255, 0.08);
  color: var(--color-text-primary, #f0f0f5);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
```

## 3. Compact Context Bar (Instructor / Metadata)

Prefer a single horizontal bar over a tall multi-section card:

```css
.bar {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated, #12121a);
  border: 1px solid var(--color-border, #2a2a3a);
  border-radius: 10px;
}

.mainRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  flex-wrap: wrap;
}
```

## 4. Data Table & Row Popover Safety

Never put `overflow: hidden` on `.tableCard`, otherwise row action popovers clip on bottom rows. Round corner cells explicitly:

```css
.tableCard {
  background: var(--color-bg-elevated, #12121a);
  border: 1px solid var(--color-border, #2a2a3a);
  border-radius: 12px;
}

.table thead th:first-child {
  border-top-left-radius: 12px;
}

.table thead th:last-child {
  border-top-right-radius: 12px;
}

.table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 12px;
}

.table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 12px;
}

.colTests {
  width: 170px;
  text-align: right;
  white-space: nowrap;
}

.testsCountZero {
  font-variant-numeric: tabular-nums;
  font-size: 0.875rem;
  color: var(--color-text-muted, #606078);
}

.testsCountValue {
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary, #f0f0f5);
}
```

## 5. Grid Card With Capacity Track

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 12px;
  background: var(--color-bg-elevated, #12121a);
  border: 1px solid var(--color-border, #2a2a3a);
  text-decoration: none;
  color: inherit;
  transition:
    background-color var(--transition-fast, 150ms ease-in-out),
    border-color var(--transition-fast, 150ms ease-in-out),
    transform 120ms ease;
}

.card:hover {
  background: var(--color-bg-surface, #1a1a26);
  border-color: rgba(134, 59, 255, 0.45);
  transform: translateY(-1px);
}
```
