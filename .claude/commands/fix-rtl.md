Scan the current component file for hardcoded directional CSS classes that break RTL layouts and replace them with logical equivalents.

Replace the following patterns:

| Find | Replace With |
|---|---|
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `left-*` (Tailwind positioning) | `start-*` |
| `right-*` (Tailwind positioning) | `end-*` |
| `pl-*` | `ps-*` |
| `pr-*` | `pe-*` |
| `ml-*` | `ms-*` |
| `mr-*` | `me-*` |
| `border-l-*` | `border-s-*` |
| `border-r-*` | `border-e-*` |
| `rounded-l-*` | `rounded-s-*` |
| `rounded-r-*` | `rounded-e-*` |

Rules:
- Only replace inside className strings and clsx/cn calls — do not change variable names, comments, or logic
- If a class is intentionally directional (e.g., an arrow icon that should always point right), add a comment `{/* intentional-ltr */}` and leave it unchanged
- After replacing, report: total replacements made, and any classes left intentionally unchanged
