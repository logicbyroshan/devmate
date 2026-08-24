# Contributing to DevMate Portfolio

Thank you for your interest in contributing to the DevMate Portfolio project! We welcome code improvements, security patches, documentation enhancements, and bug reports.

---

## Code of Conduct

All contributors and maintainers are expected to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## Development Workflow

1. **Fork & Clone**:
   ```bash
   git clone https://github.com/your-username/devmate-portfolio.git
   cd devmate-portfolio
   ```

2. **Branching Convention**:
   Create a descriptive branch for your changes:
   - `feature/your-feature-name`
   - `fix/issue-description`
   - `docs/update-documentation`

3. **Follow Code Quality Standards**:
   - **Backend**: Adhere to PEP 8. Use meaningful type hints and docstrings.
   - **Frontend**: Write clean JSX and Vanilla CSS. Ensure `npm run lint` passes without warnings.
   - **Database**: Add explicit composite indexes for filtered/ordered fields and generate version-controlled migrations.

4. **Write Tests**:
   - Always accompany bug fixes or new endpoints with unit tests in `server/portfolio/tests.py` or `client/src/*.test.jsx`.

5. **Run Verification Commands**:
   ```bash
   # Backend checks
   cd server
   python manage.py test
   python manage.py check

   # Frontend checks
   cd ../client
   npm test
   npm run lint
   npm run build
   ```

6. **Submit a Pull Request**:
   - Open a PR against the `main` branch with a clear title and detailed summary of changes made.
