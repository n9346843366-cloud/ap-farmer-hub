<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Treat the uploaded TanStack application as the baseline and preserve its legacy browser-storage keys so renaming the product does not discard existing user data.
- Keep the global AI entry in the root layout linking to the existing assistant route; one chat implementation avoids duplicated assistant state and business logic.
- Keep shell and bottom-navigation width breakpoints synchronized so resizing preserves alignment without redesigning navigation.
- Preserve the uploaded application's TypeScript compiler strictness settings to import its existing logic without unrelated source rewrites.
